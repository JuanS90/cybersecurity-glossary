import { accountFailureMessage, make, showTemporaryPassword } from "./shared";
import { manageAccount, type AuthProfile } from "../auth";
interface ManagedAccount {
  user_id: string;
  display_name: string;
  email: string;
  role: "teacher" | "student";
  status: "active" | "disabled";
}

export function renderAccountManagement(card: HTMLElement, role: AuthProfile["role"]) {
  if (role === "student") return;

  const isSuperadmin = role === "superadmin";
  let targetRole: "teacher" | "student" = role === "teacher" ? "student" : "teacher";
  const openButton = make("button", "account-button-secondary", isSuperadmin ? "Manage accounts" : "Manage student accounts");
  openButton.type = "button";
  const dialog = make("dialog", "account-management-dialog");
  const heading = make("h2", undefined, isSuperadmin ? "Manage accounts" : "Manage student accounts");
  heading.id = "account-management-title";
  dialog.setAttribute("aria-labelledby", heading.id);
  const content = make("div", "account-management-content");
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
  const closeButton = make("button", "account-button-secondary", "Close");
  closeButton.type = "button";
  closeButton.addEventListener("click", () => dialog.close());
  content.append(form, status, list, closeButton);
  dialog.append(heading, content);
  card.append(openButton, dialog);

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

  openButton.addEventListener("click", () => {
    if (!dialog.open) dialog.showModal();
    if (list.childElementCount === 0) void loadAccounts();
  });
}
