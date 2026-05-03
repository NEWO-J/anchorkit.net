export const API_BASE = 'https://api.anchorkit.net';

export function mapApiError(status: number, detail?: string): string {
  if (status === 429) return 'Too many requests — please try again in a moment.';
  if (status === 401) return 'Session expired — please log in again.';
  if (status === 403) return 'Action not permitted.';
  if (status === 409) return detail ?? 'Conflict — the request could not be completed.';
  if (status >= 500) return 'Server error — please try again later.';
  return detail ?? `Error ${status}`;
}

export function getCsrfToken(): string {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('ak_csrf='))
    ?.split('=')[1] ?? '';
}

export function clearAuthAndRedirect() {
  document.cookie = 'ak_csrf=; Max-Age=0; Path=/; Domain=anchorkit.net; Secure; SameSite=Lax';
  localStorage.removeItem('ak_token');
  localStorage.removeItem('ak_email');
  sessionStorage.removeItem('ak_verified');
}
