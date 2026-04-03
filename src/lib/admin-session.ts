/** Simple portfolio admin gate: httpOnly cookie only the server sets after Firestore password matches. */

export const COOKIE_NAME = "floral_admin_session";

const COOKIE_VALUE = "fd_admin_ok";

export function isAdminCookie(value: string | undefined): boolean {
  return value === COOKIE_VALUE;
}

export function adminSessionCookieValue(): string {
  return COOKIE_VALUE;
}
