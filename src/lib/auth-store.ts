/** Client-side TAKATAK auth token store. SessionStorage to match existing flow. */
const TOKEN_KEY = "authToken";
const VERIFY_EMAIL_KEY = "verifyEmail";
const VERIFY_PHONE_KEY = "verifyPhone";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAuthToken(): string | null {
  if (!isBrowser()) return null;
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  if (!isBrowser()) return;
  try {
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function setVerifyContext(opts: { email?: string; phone?: string }): void {
  if (!isBrowser()) return;
  if (opts.email !== undefined)
    window.sessionStorage.setItem(VERIFY_EMAIL_KEY, opts.email);
  if (opts.phone !== undefined)
    window.sessionStorage.setItem(VERIFY_PHONE_KEY, opts.phone);
}

export function getVerifyContext(): { email: string; phone: string } {
  if (!isBrowser()) return { email: "", phone: "" };
  return {
    email: window.sessionStorage.getItem(VERIFY_EMAIL_KEY) ?? "",
    phone: window.sessionStorage.getItem(VERIFY_PHONE_KEY) ?? "",
  };
}