import { safeStorageSetItem } from './safeStorage';

const DATA_VERSION_STORAGE_KEY = 'buyonebd_data_version_v1';

// Transient UI/analytics cache keys ONLY — never touches cart, customer login, admin session, products, or orders.
const TRANSIENT_CACHE_KEYS = [
  'buyonebd_pixel_events_v3',
  'buyonebd_browsing_logs_v3',
  'buyonebd_wa_logs_v3',
  'buyonebd_product_views_v1'
];

export async function purgeStaleBrowserCaches(options?: {
  clearTransientKeys?: boolean;
  unregisterServiceWorkers?: boolean;
}): Promise<void> {
  if (typeof window === 'undefined') return;

  if (options?.clearTransientKeys !== false) {
    TRANSIENT_CACHE_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {}
    });
  }

  try {
    if ('caches' in window && typeof window.caches?.keys === 'function') {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map((name) => window.caches.delete(name).catch(() => false)));
    }
  } catch {}

  if (options?.unregisterServiceWorkers && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister().catch(() => false)));
    } catch {}
  }
}

export async function syncWithServerDataVersion(serverVersion?: number | string | null): Promise<boolean> {
  if (typeof window === 'undefined' || !serverVersion) return false;
  const incoming = String(serverVersion);
  let current = '';
  try {
    current = localStorage.getItem(DATA_VERSION_STORAGE_KEY) || '';
  } catch {}

  if (current === incoming) return false;

  await purgeStaleBrowserCaches({ clearTransientKeys: false, unregisterServiceWorkers: true });
  safeStorageSetItem(DATA_VERSION_STORAGE_KEY, incoming);
  return Boolean(current); // true only when version actually changed from a prior cached version
}
