/**
 * Returns a stable guest session ID stored in localStorage.
 * A new UUID is generated on first visit and reused forever.
 * Safe to call on the server (returns '' when window is unavailable).
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  const KEY = 'guest_session_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    // crypto.randomUUID is available in all modern browsers
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(KEY, id);
  }
  return id;
}
