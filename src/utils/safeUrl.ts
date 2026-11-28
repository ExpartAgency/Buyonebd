export function safeHref(raw?: string | null, fallback = '#'): string {
  const val = String(raw || '').trim();
  if (!val) return fallback;
  if (val.startsWith('/') || val.startsWith('#')) {
    return val;
  }
  const lower = val.replace(/[\u0000-\u0020\s]+/g, '').toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return fallback;
  }
  if (/^(https?:|mailto:|tel:)/i.test(val)) {
    return val;
  }
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(val)) {
    return `https://${val}`;
  }
  return fallback;
}
