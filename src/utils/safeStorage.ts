// Quota-safe browser storage utilities.
// Prevents DOMException: QuotaExceededError on mobile Chrome / Safari / desktop browsers
// when large base64 images or high-volume caches accumulate across sessions.

const EVICTABLE_CACHE_PRIORITY = [
  'buyonebd_browsing_logs_v3',
  'buyonebd_pixel_events_v3',
  'buyonebd_wa_logs_v3',
  'buyonebd_ai_review_queue_v1',
  'buyonebd_media_library_v1',
  'buyonebd_social_posts_v1',
  'buyonebd_abandoned_v3',
  'buyonebd_blogs_v1',
  'buyonebd_chat_inquiries_v1',
  'buyonebd_security_logs_v1',
  'buyonebd_automarketing_logs_v1'
];

export function stripLargeDataUris<T>(value: T, maxDataUriLength = 3000, depth = 0): T {
  if (depth > 8 || value == null) return value;
  if (typeof value === 'string') {
    if (value.startsWith('data:') && value.length > maxDataUriLength) {
      return '' as unknown as T;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripLargeDataUris(item, maxDataUriLength, depth + 1)) as unknown as T;
  }
  if (typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      out[k] = stripLargeDataUris(v, maxDataUriLength, depth + 1);
    }
    return out as T;
  }
  return value;
}

export function compactAbandonedCartsForStorage(carts: any[]): any[] {
  if (!Array.isArray(carts)) return [];
  return carts.slice(0, 40).map((cart) => {
    if (!cart || typeof cart !== 'object') return cart;
    return {
      ...cart,
      items: Array.isArray(cart.items)
        ? cart.items.map((item: any) => {
            if (!item || typeof item !== 'object') return item;
            const prod = item.product;
            if (!prod || typeof prod !== 'object') return item;
            return {
              ...item,
              product: {
                id: prod.id,
                title: prod.title,
                titleBn: prod.titleBn,
                price: prod.price,
                originalPrice: prod.originalPrice,
                category: prod.category,
                sku: prod.sku,
                stock: prod.stock,
                images: Array.isArray(prod.images)
                  ? prod.images
                      .filter((img: any) => typeof img === 'string' && (!img.startsWith('data:') || img.length <= 2048))
                      .slice(0, 1)
                  : []
              }
            };
          })
        : []
    };
  });
}

export function compactOrdersForStorage(orders: any[]): any[] {
  if (!Array.isArray(orders)) return [];
  return orders.slice(0, 60).map((ord) => stripLargeDataUris(ord, 3000));
}

export function compactCartForStorage(cart: any[]): any[] {
  if (!Array.isArray(cart)) return [];
  return cart.slice(0, 50).map((item) => {
    if (!item || typeof item !== 'object') return item;
    if (!item.product || typeof item.product !== 'object') return item;
    return {
      ...item,
      product: {
        ...stripLargeDataUris(item.product, 3000),
        description: String(item.product.description || '').slice(0, 400),
        descriptionBn: String(item.product.descriptionBn || '').slice(0, 400)
      }
    };
  });
}

function tryFreeStorageSpace(excludeKey?: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  let freed = false;
  for (const cacheKey of EVICTABLE_CACHE_PRIORITY) {
    if (cacheKey === excludeKey) continue;
    try {
      const existing = window.localStorage.getItem(cacheKey);
      if (existing && existing.length > 0) {
        window.localStorage.removeItem(cacheKey);
        freed = true;
      }
    } catch {}
  }
  return freed;
}

export function safeStorageSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    // 1. Try compacting oversized JSON payloads (strips giant base64 image strings & caps long arrays)
    let compactValue = value;
    try {
      if (value.length > 150_000 && (value.startsWith('{') || value.startsWith('['))) {
        const parsed = JSON.parse(value);
        const stripped = Array.isArray(parsed)
          ? stripLargeDataUris(parsed.slice(0, 35), 1024)
          : stripLargeDataUris(parsed, 1024);
        compactValue = JSON.stringify(stripped);
      }
    } catch {}

    // 2. Evict bulky non-critical caches and retry
    tryFreeStorageSpace(key);
    try {
      window.localStorage.setItem(key, compactValue);
      return true;
    } catch {
      // 3. Final aggressive shrink for JSON lists (keep recent 10 entries) without ever throwing
      try {
        if (compactValue.startsWith('[')) {
          const arr = JSON.parse(compactValue);
          if (Array.isArray(arr) && arr.length > 10) {
            window.localStorage.setItem(key, JSON.stringify(arr.slice(0, 10)));
            return true;
          }
        }
      } catch {}
      try {
        window.localStorage.removeItem(key);
      } catch {}
      return false;
    }
  }
}

export function safeSessionSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) return false;
  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

// Self-heal oversized legacy caches right on app boot so returning users recover automatically
export function healOversizedLocalStorageOnBoot(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const abRaw = window.localStorage.getItem('buyonebd_abandoned_v3');
    if (abRaw && abRaw.length > 180_000) {
      try {
        const parsed = JSON.parse(abRaw);
        const compacted = JSON.stringify(compactAbandonedCartsForStorage(parsed));
        safeStorageSetItem('buyonebd_abandoned_v3', compacted);
      } catch {
        window.localStorage.removeItem('buyonebd_abandoned_v3');
      }
    }

    const mediaRaw = window.localStorage.getItem('buyonebd_media_library_v1');
    if (mediaRaw && mediaRaw.length > 500_000) {
      window.localStorage.removeItem('buyonebd_media_library_v1');
    }

    // Check total approximate localStorage footprint (> 3.2MB UTF-16 chars)
    let totalChars = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k) totalChars += (window.localStorage.getItem(k) || '').length;
    }
    if (totalChars > 3_200_000) {
      EVICTABLE_CACHE_PRIORITY.slice(0, 7).forEach((k) => {
        try {
          window.localStorage.removeItem(k);
        } catch {}
      });
    }
  } catch {}
}

healOversizedLocalStorageOnBoot();
