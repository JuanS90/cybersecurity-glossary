import {
  getCurrentProfile,
  getCurrentSession,
  manageAccount,
  onAuthStateChange,
  signInWithPassword,
  signOut,
  updateOwnPassword,
  type AuthProfile,
} from "./auth";
import { isSupabaseConfigured } from "./supabase";
import { getPublishedEntries, submitProposal, type ProposalData } from "./glossary";

const roleLabels = {
  superadmin: "Superadmin",
  teacher: "Teacher",
  student: "Student",
} as const;

function make<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function showMessage(host: HTMLElement, text: string, kind: "info" | "error" = "info") {
  const message = make("p", "account-message", text);
  message.dataset.kind = kind;
  message.setAttribute(kind === "error" ? "role" : "aria-live", kind === "error" ? "alert" : "polite");
  host.append(message);
}

interface ManagedAccount {
  user_id: string;
  display_name: string;
  email: string;
  role: "teacher" | "student";
  status: "active" | "disabled";
}

function renderAccountManagement(card: HTMLElement, role: AuthProfile["role"]) {
  if (role === "student") return;

  const isSuperadmin = role === "superadmin";
  let targetRole: "teacher" | "student" = role === "teacher" ? "student" : "teacher";
  const details = make("details", "account-management");
  const summary = make("summary", undefined, isSuperadmin ? "Manage accounts" : "Manage student accounts");
  const content = make("div", "account-card");
  const form = make("form");

  let targetRoleSelect: HTMLSelectElement | undefined;
  if (isSuperadmin) {
    const roleLabel = make("label", undefined, "Account type");
    targetRoleSelect = make("select");
    targetRoleSelect.name = "role";
    for (const [value, label] of [["teacher", "Teacher"], ["student", "Student"]]) {
      const option = make("option", undefined, label);
      option.value = value;
      targetRoleSelect.append(option);
    }
    targetRoleSelect.addEventListener("change", () => {
      targetRole = targetRoleSelect!.value as "teacher" | "student";
      createButton.textContent = `Create ${targetRole}`;
    });
    roleLabel.append(targetRoleSelect);
    form.append(roleLabel);
  }

  const nameLabel = make("label", undefined, "Display name");
  const name = make("input");
  name.name = "display_name";
  name.autocomplete = "name";
  name.maxLength = 100;
  name.required = true;
  nameLabel.append(name);

  const emailLabel = make("label", undefined, "Email");
  const email = make("input");
  email.type = "email";
  email.name = "email";
  email.autocomplete = "email";
  email.maxLength = 254;
  email.required = true;
  emailLabel.append(email);

  const createButton = make("button", undefined, `Create ${targetRole}`);
  createButton.type = "submit";
  form.append(nameLabel, emailLabel, createButton);

  const status = make("p", "account-message");
  status.setAttribute("aria-live", "polite");
  const list = make("ul", "account-list");
  content.append(form, status, list);
  details.append(summary, content);
  card.append(details);

  const report = (message: string, error = false) => {
    status.textContent = message;
    status.dataset.kind = error ? "error" : "info";
    status.setAttribute(error ? "role" : "aria-live", error ? "alert" : "polite");
  };

  const loadAccounts = async () => {
    list.replaceChildren(make("li", undefined, "Loading accounts…"));
    try {
      let accounts: ManagedAccount[];
      if (isSuperadmin) {
        const [teachers, students] = await Promise.all([
          manageAccount({ action: "list_teacher_accounts" }),
          manageAccount({ action: "list_student_accounts" }),
        ]);
        if (teachers.error) throw teachers.error;
        if (students.error) throw students.error;
        accounts = [
          ...((teachers.data as { accounts?: ManagedAccount[] } | null)?.accounts ?? []),
          ...((students.data as { accounts?: ManagedAccount[] } | null)?.accounts ?? []),
        ];
      } else {
        const { data, error } = await manageAccount({ action: "list_student_accounts" });
        if (error) throw error;
        accounts = (data as { accounts?: ManagedAccount[] } | null)?.accounts ?? [];
      }
      list.replaceChildren();
      if (accounts.length === 0) {
        list.append(make("li", undefined, "No accounts yet."));
        return;
      }

      for (const account of accounts) {
        const item = make("li", "managed-account");
        const identity = make(
          "div",
          "managed-account-identity",
          `${account.display_name} · ${account.email || account.user_id}`,
        );
        const state = make("span", "account-role", account.status === "active" ? "Active" : "Disabled");
        const actions = make("div", "managed-account-actions");
        const statusButton = make("button", undefined, account.status === "active" ? "Deactivate" : "Activate");
        statusButton.type = "button";
        statusButton.addEventListener("click", async () => {
          statusButton.disabled = true;
          try {
            const { error: statusError } = await manageAccount({
              action: account.role === "student" ? "set_student_status" : "set_teacher_status",
              user_id: account.user_id,
              status: account.status === "active" ? "disabled" : "active",
            });
            if (statusError) throw statusError;
            report("Account status updated.");
            await loadAccounts();
          } catch {
            statusButton.disabled = false;
            report("Account status could not be changed.", true);
          }
        });
        actions.append(statusButton);

        if (account.role === "student") {
          const resetButton = make("button", undefined, "Reset password");
          resetButton.type = "button";
          resetButton.disabled = account.status !== "active";
          resetButton.addEventListener("click", async () => {
            resetButton.disabled = true;
            try {
              const { data: resetData, error: resetError } = await manageAccount({
                action: "reset_student_password",
                user_id: account.user_id,
              });
              if (resetError) throw resetError;
              const temporaryPassword = (resetData as { temporary_password?: string } | null)?.temporary_password;
              showTemporaryPassword(content, temporaryPassword);
              report("Password reset. Give the temporary password directly to the student.");
              resetButton.disabled = false;
            } catch {
              resetButton.disabled = account.status !== "active";
              report("The password could not be reset.", true);
            }
          });
          actions.append(resetButton);
        }

        item.append(identity, state, actions);
        list.append(item);
      }
    } catch (error) {
      list.replaceChildren(make("li", undefined, "Accounts could not be loaded."));
      report(await accountFailureMessage(error), true);
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    createButton.disabled = true;
    const formData = new FormData(form);
    try {
      const { data, error } = await manageAccount({
        action: targetRole === "student" ? "create_student" : "create_teacher",
        display_name: String(formData.get("display_name") ?? ""),
        email: String(formData.get("email") ?? ""),
      });
      if (error) throw error;
      const temporaryPassword = (data as { temporary_password?: string } | null)?.temporary_password;
      form.reset();
      showTemporaryPassword(content, temporaryPassword);
      report(`Account created. Give the temporary password directly to the ${targetRole}.`);
      await loadAccounts();
    } catch (error) {
      report(await accountFailureMessage(error), true);
    } finally {
      createButton.disabled = false;
    }
  });

  details.addEventListener("toggle", () => {
    if (details.open && list.childElementCount === 0) void loadAccounts();
  });
}

function renderProposalForm(card: HTMLElement, profile: AuthProfile) {
  const details = make("details", "account-management");
  const summary = make("summary", undefined, "Propose a glossary change");
  const content = make("div", "account-card");
  const form = make("form");
  const message = make("p", "account-message", "A teacher reviews every proposal before it can appear in the public glossary.");
  message.setAttribute("aria-live", "polite");

  const operationLabel = make("label", undefined, "Change type");
  const operation = make("select");
  operation.name = "operation";
  for (const [value, label] of [["create", "Suggest a new entry"], ["edit", "Suggest an edit"]]) {
    const option = make("option", undefined, label);
    option.value = value;
    operation.append(option);
  }
  operationLabel.append(operation);

  const entryLabel = make("label", undefined, "Entry to edit");
  const entry = make("select");
  entry.name = "entry_id";
  entry.disabled = true;
  entryLabel.append(entry);

  const fields: Record<string, HTMLInputElement | HTMLTextAreaElement> = {};
  const addField = (name: string, labelText: string, multiline = false, required = true) => {
    const label = make("label", undefined, labelText);
    const control = multiline ? make("textarea") : make("input");
    control.name = name;
    control.required = required;
    if (name === "term" || name === "translation_es") control.maxLength = 200;
    if (name === "definition_en" || name === "example_en") control.maxLength = 3000;
    label.append(control);
    fields[name] = control;
    return label;
  };

  const categoryLabel = make("label", undefined, "Category");
  const category = make("select");
  category.name = "category";
  for (const [value, label] of [["Threat", "Threat"], ["Security tool", "Security tool"]]) {
    const option = make("option", undefined, label);
    option.value = value;
    category.append(option);
  }
  categoryLabel.append(category);

  const term = addField("term", "Term");
  const translation = addField("translation_es", "Spanish translation");
  const definition = addField("definition_en", "Definition in simple English", true);
  const example = addField("example_en", "Example in English (optional)", true, false);
  const source = addField("source_reference", "Source (optional)", false, false);
  const submit = make("button", undefined, "Send for teacher review");
  submit.type = "submit";
  form.append(message, operationLabel, entryLabel, term, translation, definition, example, categoryLabel, source, submit);
  content.append(form);
  details.append(summary, content);
  card.append(details);

  let publishedEntries: Awaited<ReturnType<typeof getPublishedEntries>> = null;
  void getPublishedEntries().then((entries) => {
    publishedEntries = entries;
    entry.replaceChildren();
    for (const item of entries ?? []) {
      const option = make("option", undefined, item.term);
      option.value = item.id;
      entry.append(option);
    }
    if (entry.options.length === 0) {
      entry.append(make("option", undefined, "Published entries are unavailable"));
    }
    entry.disabled = operation.value !== "edit" || entry.options.length === 0 || !publishedEntries;
  }).catch(() => {
    entry.replaceChildren(make("option", undefined, "Published entries are unavailable"));
  });

  const applySelectedEntry = () => {
    const selected = publishedEntries?.find((item) => item.id === entry.value);
    if (!selected) return;
    fields.term.value = selected.term;
    fields.translation_es.value = selected.translation_es;
    fields.definition_en.value = selected.definition_en;
    fields.example_en.value = selected.example_en ?? "";
    fields.source_reference.value = selected.source_reference ?? "";
    category.value = selected.category;
  };
  operation.addEventListener("change", () => {
    const editing = operation.value === "edit";
    entry.disabled = !editing || !publishedEntries || entry.options.length === 0;
    if (editing) applySelectedEntry();
  });
  entry.addEventListener("change", applySelectedEntry);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const isEdit = operation.value === "edit";
    if (isEdit && !publishedEntries?.some((item) => item.id === entry.value)) {
      message.textContent = "The published entry list is unavailable. Try again when the glossary service is available.";
      message.dataset.kind = "error";
      return;
    }
    submit.disabled = true;
    submit.textContent = "Sending…";
    message.textContent = "";
    const value = (name: string) => fields[name].value.trim();
    const data: ProposalData = {
      term: value("term"),
      translation_es: value("translation_es"),
      definition_en: value("definition_en"),
      example_en: value("example_en") || null,
      category: category.value as ProposalData["category"],
      source_reference: value("source_reference") || null,
    };
    try {
      const { error } = await submitProposal({
        operation: isEdit ? "edit" : "create",
        entryId: isEdit ? entry.value : undefined,
        data,
        userId: profile.user_id,
      });
      if (error) throw error;
      form.reset();
      entry.selectedIndex = 0;
      entry.disabled = true;
      message.textContent = "Proposal sent. It will stay private until a teacher reviews it.";
      message.dataset.kind = "info";
    } catch {
      message.textContent = "The proposal could not be sent. Check your connection or contact your teacher.";
      message.dataset.kind = "error";
      message.setAttribute("role", "alert");
    } finally {
      submit.disabled = false;
      submit.textContent = "Send for teacher review";
    }
  });
}

function showTemporaryPassword(container: HTMLElement, password?: string) {
  container.querySelector(".temporary-password")?.remove();
  if (!password) return;
  const panel = make("div", "temporary-password");
  const label = make("p", "account-message", "Temporary password — deliver it directly; it is shown only in this session.");
  const value = make("output", "account-password", password);
  panel.append(label, value);
  container.prepend(panel);
}

function renderSignIn(host: HTMLElement, message?: string, error = false) {
  const details = make("details", "account-sign-in");
  const summary = make("summary", undefined, "Sign in");
  const form = make("form");

  const emailLabel = make("label", undefined, "Email");
  const email = make("input");
  email.type = "email";
  email.name = "email";
  email.autocomplete = "username";
  email.required = true;
  emailLabel.append(email);

  const passwordLabel = make("label", undefined, "Password");
  const password = make("input");
  password.type = "password";
  password.name = "password";
  password.autocomplete = "current-password";
  password.required = true;
  passwordLabel.append(password);

  const submit = make("button", undefined, "Sign in");
  submit.type = "submit";
  form.append(emailLabel, passwordLabel, submit);
  details.append(summary, form);
  host.replaceChildren(details);
  if (message) {
    showMessage(form, message, error ? "error" : "info");
    details.open = true;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submit.disabled = true;
    submit.textContent = "Signing in…";
    const formData = new FormData(form);
    try {
      const { error: signInError } = await signInWithPassword(
        String(formData.get("email") ?? ""),
        String(formData.get("password") ?? ""),
      );
      password.value = "";
      if (signInError) throw signInError;
      void refreshAccount(host);
    } catch {
      renderSignIn(host, "Sign-in failed. Check your details or contact your teacher.", true);
    }
  });
}

function renderAccount(host: HTMLElement, profile: AuthProfile) {
  const details = make("details", "account-menu");
  const summary = make("summary", undefined, profile.display_name);
  details.append(summary);
  const card = make("div", "account-card");
  const role = make("p", "account-role", roleLabels[profile.role]);
  card.append(role);

  if (profile.status !== "active") {
    showMessage(card, "This account is not active. Contact your teacher.", "error");
  } else if (profile.must_change_password) {
    showMessage(card, "Set a new password to finish setting up your account.");
  } else {
    showMessage(card, "Account tools are being prepared. The public course remains available.");
    const changePassword = make("button", "account-button-secondary", "Change password");
    changePassword.type = "button";
    changePassword.addEventListener("click", () => showPasswordChangeDialog(host, false, card));
    card.append(changePassword);
    if (profile.role !== "superadmin") renderProposalForm(card, profile);
    renderAccountManagement(card, profile.role);
  }

  const button = make("button", undefined, "Sign out");
  button.type = "button";
  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      const { error } = await signOut();
      if (error) throw error;
      renderSignIn(host);
    } catch {
      button.disabled = false;
      showMessage(host, "Sign-out failed. Please try again.", "error");
    }
  });
  card.append(button);
  details.append(card);
  host.replaceChildren(details);
  if (profile.status === "active" && profile.must_change_password) {
    showPasswordChangeDialog(host, true, card);
  }
}

async function accountFailureMessage(error: unknown) {
  const context = (error as { context?: Response } | null)?.context;
  const status = context?.status;
  if (status === 400) {
    const body = await context?.clone().json().catch(() => null) as { code?: string } | null;
    if (body?.code) return `The account request was rejected (${body.code}). Retry or contact your administrator.`;
    return "The account request was rejected. Retry or contact your administrator.";
  }
  if (status === 401) return "Your session expired. Sign in again and retry.";
  if (status === 403) {
    const body = await context?.clone().json().catch(() => null) as { code?: string; error?: string; message?: string } | null;
    if (body?.code === "UNAUTHORIZED_NO_AUTH_HEADER") {
      return "Supabase did not receive your sign-in token. Sign out, sign in again, and retry.";
    }
    if (body?.error) return `The account request was rejected: ${body.error}`;
    if (body?.message) return `The account request was rejected: ${body.message}`;
    const responseText = await context?.clone().text().catch(() => "");
    if (responseText?.trim()) return `The account request was rejected: ${responseText.trim()}`;
    return "The request was rejected. Check that the account is active and the site origin is allowed.";
  }
  if (status === 404) return "The manage-accounts function is not deployed to this Supabase project yet.";
  if (status === 503) return "The account function is not configured. Check its Supabase APP_ORIGIN setting.";
  if (status) return `The account function returned an error (${status}). Check the manage-accounts logs in Supabase.`;
  const authError = error as { name?: string; message?: string } | null;
  if (authError?.name === "AuthSessionMissingError") {
    return "Your sign-in session is missing. Sign out, sign in again, and retry.";
  }
  if (authError?.message) {
    return `Supabase Auth rejected the password: ${authError.message}`;
  }
  return "Could not reach manage-accounts. Check that it is deployed and APP_ORIGIN exactly matches this site's address.";
}

function showPasswordChangeDialog(host: HTMLElement, required: boolean, accountCard: HTMLElement) {
  const existing = host.querySelector<HTMLDialogElement>(".account-password-dialog");
  if (existing) {
    if (!existing.open) existing.showModal();
    return;
  }

  const dialog = make("dialog", "account-password-dialog");
  dialog.setAttribute("aria-labelledby", "password-dialog-title");
  const heading = make("h2", undefined, required ? "Set your password" : "Change password");
  heading.id = "password-dialog-title";
  const form = make("form");
  const description = make(
    "p",
    "account-message",
    required ? "Set a new password before using account tools." : "Choose a new password for this account.",
  );
  const passwordLabel = make("label", undefined, "New password");
  const password = make("input");
  password.type = "password";
  password.name = "new-password";
  password.autocomplete = "new-password";
  password.minLength = 8;
  password.required = true;
  passwordLabel.append(password);

  const confirmationLabel = make("label", undefined, "Confirm new password");
  const confirmation = make("input");
  confirmation.type = "password";
  confirmation.name = "confirm-password";
  confirmation.autocomplete = "new-password";
  confirmation.minLength = 8;
  confirmation.required = true;
  confirmationLabel.append(confirmation);

  const submit = make("button", undefined, "Update password");
  submit.type = "submit";
  const actions = make("div", "dialog-actions");
  if (!required) {
    const cancel = make("button", "account-button-secondary", "Cancel");
    cancel.type = "button";
    cancel.addEventListener("click", () => dialog.close());
    actions.append(cancel);
  }
  actions.append(submit);
  form.append(description, passwordLabel, confirmationLabel, actions);
  dialog.append(heading, form);
  host.append(dialog);
  dialog.addEventListener("cancel", (event) => {
    if (required) event.preventDefault();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    dialog.querySelectorAll('.account-message[data-kind="error"]').forEach((item) => item.remove());
    if (password.value !== confirmation.value) {
      showMessage(dialog, "The passwords do not match.", "error");
      return;
    }
    submit.disabled = true;
    submit.textContent = "Updating…";
    try {
      const { error: passwordError } = await updateOwnPassword(password.value);
      if (passwordError) throw passwordError;
      if (required) {
        const { error: activationError } = await manageAccount({
          action: "complete_own_password_change",
        });
        if (activationError) throw activationError;
      }
      password.value = "";
      confirmation.value = "";
    } catch (error) {
      password.value = "";
      confirmation.value = "";
      submit.disabled = false;
      submit.textContent = "Update password";
      showMessage(dialog, await accountFailureMessage(error), "error");
      return;
    }
    if (required) {
      await refreshAccount(host);
      return;
    }
    dialog.close();
    showMessage(accountCard, "Password updated.");
    dialog.remove();
  });

  dialog.showModal();
}

let refreshRevision = 0;

async function refreshAccount(host: HTMLElement) {
  const revision = ++refreshRevision;
  try {
    const { data, error } = await getCurrentSession();
    if (error) throw error;
    if (!data.session) {
      renderSignIn(host);
      return;
    }

    const profile = await getCurrentProfile();
    if (revision !== refreshRevision) return;
    if (!profile) {
      const details = make("details", "account-menu");
      details.append(make("summary", undefined, "Account issue"));
      const card = make("div", "account-card");
      showMessage(card, "This account has no active course profile. Contact your teacher.", "error");
      const button = make("button", undefined, "Sign out");
      button.type = "button";
      button.addEventListener("click", async () => {
        const { error: signOutError } = await signOut();
        if (signOutError) showMessage(card, "Sign-out failed. Please try again.", "error");
        else renderSignIn(host);
      });
      card.append(button);
      details.append(card);
      host.replaceChildren(details);
      return;
    }
    renderAccount(host, profile);
  } catch {
    if (revision === refreshRevision) {
      renderSignIn(host, "Account status could not be checked. Protected tools are unavailable.", true);
    }
  }
}

export function mountAuthUi() {
  const host = document.getElementById("account-control");
  if (!host) return;

  if (!isSupabaseConfigured) {
    showMessage(host, "Account access is not configured. The public course is available.");
    return;
  }

  renderSignIn(host);
  onAuthStateChange(() => {
    // Avoid issuing a second Supabase request inside the auth callback.
    window.setTimeout(() => void refreshAccount(host), 0);
  });
  void refreshAccount(host);
}
