let inMemoryAdminToken = '';

export function setAdminAuthToken(token: string): void {
  inMemoryAdminToken = typeof token === 'string' ? token.trim() : '';
}

export function getAdminAuthToken(): string {
  return inMemoryAdminToken;
}

export function clearAdminAuthToken(): void {
  inMemoryAdminToken = '';
}

export function getAdminAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getAdminAuthToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra || {})
  };
}
