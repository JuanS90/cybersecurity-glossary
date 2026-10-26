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
import { accountFailureMessage, make, showMessage } from "./auth-ui/shared";
import { renderAccountManagement } from "./auth-ui/account-management";
import { renderStudentProposalDialog } from "./auth-ui/student-proposals";
import { renderTeacherProposalQueue } from "./auth-ui/teacher-review";

const roleLabels = {
  superadmin: "Superadmin",
  teacher: "Teacher",
  student: "Student",
} as const;

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
    if (profile.role === "student") renderStudentProposalDialog(card, profile);
    if (profile.role === "teacher") renderTeacherProposalQueue(card);
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
