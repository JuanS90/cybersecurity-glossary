import {
  getCurrentProfile,
  getCurrentSession,
  manageAccount,
  onAuthStateChange,
  signInWithPassword,
  signOut,
  type AuthProfile,
} from "./auth";
import { isSupabaseConfigured } from "./supabase";

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

  const targetRole = role === "teacher" ? "student" : "teacher";
  const createAction = role === "teacher" ? "create_student" : "create_teacher";
  const listAction = role === "teacher" ? "list_student_accounts" : "list_teacher_accounts";
  const details = make("details", "account-management");
  const summary = make("summary", undefined, role === "teacher" ? "Manage student accounts" : "Manage teacher accounts");
  const content = make("div", "account-card");
  const form = make("form");

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

  const createButton = make("button", undefined, targetRole === "student" ? "Create student" : "Create teacher");
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
      const { data, error } = await manageAccount({ action: listAction });
      if (error) throw error;
      const accounts = (data as { accounts?: ManagedAccount[] } | null)?.accounts ?? [];
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
              action: targetRole === "student" ? "set_student_status" : "set_teacher_status",
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

        if (role === "teacher") {
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
    } catch {
      list.replaceChildren(make("li", undefined, "Accounts could not be loaded."));
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    createButton.disabled = true;
    const formData = new FormData(form);
    try {
      const { data, error } = await manageAccount({
        action: createAction,
        display_name: String(formData.get("display_name") ?? ""),
        email: String(formData.get("email") ?? ""),
      });
      if (error) throw error;
      const temporaryPassword = (data as { temporary_password?: string } | null)?.temporary_password;
      form.reset();
      showTemporaryPassword(content, temporaryPassword);
      report(`Account created. Give the temporary password directly to the ${targetRole}.`);
      await loadAccounts();
    } catch {
      report("The account could not be created. Check the details or contact the administrator.", true);
    } finally {
      createButton.disabled = false;
    }
  });

  details.addEventListener("toggle", () => {
    if (details.open && list.childElementCount === 0) void loadAccounts();
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
  const summary = make("summary", undefined, "Course account");
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
  if (message) showMessage(host, message, error ? "error" : "info");

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
  const card = make("div", "account-card");
  const name = make("strong", undefined, profile.display_name);
  const role = make("p", "account-role", roleLabels[profile.role]);
  card.append(name, role);

  if (profile.status !== "active") {
    showMessage(card, "This account is not active. Contact your teacher.", "error");
  } else if (profile.must_change_password) {
    showPasswordChangeForm(card, true);
  } else {
    showMessage(card, "Account tools are being prepared. The public course remains available.");
    const changePassword = make("details", "account-password-change");
    const summary = make("summary", undefined, "Change password");
    changePassword.append(summary);
    showPasswordChangeForm(changePassword, false);
    card.append(changePassword);
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
  host.replaceChildren(card);
}

function showPasswordChangeForm(container: HTMLElement, required: boolean) {
  const form = make("form");
  const heading = make(
    "p",
    "account-message",
    required
      ? "Set a new password before using account tools."
      : "Choose a new password for this account.",
  );
  const passwordLabel = make("label", undefined, "New password");
  const password = make("input");
  password.type = "password";
  password.name = "new-password";
  password.autocomplete = "new-password";
  password.minLength = 12;
  password.required = true;
  passwordLabel.append(password);

  const confirmationLabel = make("label", undefined, "Confirm new password");
  const confirmation = make("input");
  confirmation.type = "password";
  confirmation.name = "confirm-password";
  confirmation.autocomplete = "new-password";
  confirmation.minLength = 12;
  confirmation.required = true;
  confirmationLabel.append(confirmation);

  const submit = make("button", undefined, "Update password");
  submit.type = "submit";
  form.append(heading, passwordLabel, confirmationLabel, submit);
  container.append(form);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (password.value !== confirmation.value) {
      showMessage(container, "The passwords do not match.", "error");
      return;
    }
    submit.disabled = true;
    submit.textContent = "Updating…";
    try {
      const { error } = await manageAccount({
        action: "change_own_password",
        password: password.value,
        confirmation: confirmation.value,
      });
      if (error) throw error;
      password.value = "";
      confirmation.value = "";
    } catch {
      password.value = "";
      confirmation.value = "";
      submit.disabled = false;
      submit.textContent = "Update password";
      showMessage(container, "The password could not be updated. Check your connection or contact your teacher.", "error");
      return;
    }
    const accountControl = container.closest("#account-control");
    if (accountControl) await refreshAccount(accountControl as HTMLElement);
  });
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
      host.replaceChildren(card);
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
