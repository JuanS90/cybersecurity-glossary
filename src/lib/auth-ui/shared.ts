export function make<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

export function showMessage(host: HTMLElement, text: string, kind: "info" | "error" = "info") {
  const message = make("p", "account-message", text);
  message.dataset.kind = kind;
  message.setAttribute(kind === "error" ? "role" : "aria-live", kind === "error" ? "alert" : "polite");
  host.append(message);
}

export function showTemporaryPassword(container: HTMLElement, password?: string) {
  container.querySelector(".temporary-password")?.remove();
  if (!password) return;
  const panel = make("div", "temporary-password");
  const label = make("p", "account-message", "Temporary password — deliver it directly; it is shown only in this session.");
  const value = make("output", "account-password", password);
  panel.append(label, value);
  container.prepend(panel);
}

export async function accountFailureMessage(error: unknown) {
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
