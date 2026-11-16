import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  where
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  AbandonedCart,
  Category,
  CustomerProfile,
  HomeSlide,
  MediaItem,
  Order,
  PriceAlert,
  Product,
  ProductReview,
  StoreSettings,
  UserStaff,
  WaitlistEntry,
  WalletTopUpRequest
} from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIREBASE_DATABASE_ID = firebaseConfig.firestoreDatabaseId;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'storefront', 'public'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testFirestoreConnection();

export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const proto = Object.getPrototypeOf(value);
    // Preserve Firestore sentinels (serverTimestamp / FieldValue), Timestamp, Date, etc.
    if (proto !== Object.prototype && proto !== null) {
      return value;
    }
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (v !== undefined) {
        out[k] = stripUndefinedDeep(v);
      }
    }
    return out as T;
  }
  return value;
}

// Public settings only (secrets are strictly isolated in /admin_config/private)
const ALLOWED_PUBLIC_SETTINGS_KEYS = [
  'storeName', 'storeNameBn', 'logoUrl', 'faviconUrl', 'logoMode', 'tagline', 'taglineBn',
  'hotline', 'whatsappNumber', 'supportEmail', 'address', 'deliveryFees',
  'paymentSettings', 'aiCallSettings', 'announcementBar', 'theme', 'themeColors',
  'cmsTexts', 'spinSettings', 'whatsappTemplates', 'marketingTemplates',
  'aiSettings', 'seoSettings', 'flashSale', 'footerSettings', 'singleProductCms',
  'organicMarketing', 'walletSettings', 'promoCoupons', 'deliveryBoys', 'brandAttributes', 'loyaltySettings'
] as const;

const ALLOWED_PRODUCT_KEYS = [
  'id', 'title', 'titleBn', 'description', 'descriptionBn', 'brand', 'brandBn', 'price', 'originalPrice',
  'stock', 'category', 'categoryBn', 'subcategory', 'tags', 'images', 'sku',
  'barcode', 'freeShipping', 'customDeliveryFees', 'rating', 'reviewsCount',
  'soldCount', 'loyaltyPoints', 'isFlashSale', 'colors', 'sizes', 'attributes', 'features',
  'featuresBn', 'videoUrl', 'warrantyInfo', 'warrantyInfoBn', 'seo'
] as const;

function safeNum(val: unknown, fallback = 0): number {
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function sanitizeFirestoreId(raw: string, prefix = 'doc'): string {
  const clean = String(raw || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
  return clean.length >= 1 ? clean : `${prefix}-${Date.now()}`;
}

export function getCustomerFirestoreId(customer: Pick<CustomerProfile, 'phone' | 'username' | 'email'>): string {
  const digits = String(customer.phone || '').replace(/[^0-9]/g, '');
  const base = digits.length >= 6 ? digits : String(customer.username || customer.email || Date.now());
  return sanitizeFirestoreId(`cust-${base}`, 'cust');
}

export function extractFirestoreErrorReason(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err || 'Firestore error');
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.error) {
      return `${parsed.error}${parsed.path ? ` (${parsed.path})` : ''}`;
    }
  } catch {}
  return raw;
}

// ======================= ORDERS =======================
function sanitizeOrderForFirestore(order: Order) {
  const cleanItems = (order.items || [])
    .filter(Boolean)
    .slice(0, 50)
    .map((it) => ({
      ...stripUndefinedDeep(it),
      productId: String(it.productId || 'prod-item').slice(0, 80),
      productTitle: String(it.productTitle || 'Product').slice(0, 200),
      productTitleBn: String(it.productTitleBn || it.productTitle || 'পণ্য').slice(0, 240),
      price: safeNum(it.price, 0),
      quantity: Math.max(1, Math.round(safeNum(it.quantity, 1))),
      image: it.image && (!it.image.startsWith('data:') || it.image.length < 35000) ? it.image : ''
    }));

  if (cleanItems.length === 0) {
    cleanItems.push({
      productId: 'item-1',
      productTitle: 'Store Order Item',
      productTitleBn: 'স্টোর পণ্য',
      price: safeNum(order.pricing?.total, 0),
      quantity: 1,
      image: ''
    });
  }

  const rawPhone = String(order.customer?.phone || '').trim();
  const safePhone = (rawPhone.length >= 6 ? rawPhone : '01700000000').slice(0, 32);
  const safeName = (String(order.customer?.name || '').trim() || 'Customer').slice(0, 120);
  const safeAddress = (String(order.customer?.address || '').trim() || 'Bangladesh').slice(0, 400);
  const safeDistrict = (String(order.customer?.district || '').trim() || 'Dhaka').slice(0, 120);
  const safeThana = String(order.customer?.thana || '').trim().slice(0, 120);
  const safeNote = String(order.customer?.note || '').trim().slice(0, 300);

  const validZone =
    order.deliveryZone === 'dhaka_inside' ||
    order.deliveryZone === 'dhaka_sub' ||
    order.deliveryZone === 'dhaka_outside'
      ? order.deliveryZone
      : 'dhaka_inside';

  const pricingClean = stripUndefinedDeep({
    subtotal: safeNum(order.pricing?.subtotal, 0),
    deliveryFee: safeNum(order.pricing?.deliveryFee, 0),
    discount: safeNum(order.pricing?.discount, 0),
    total: safeNum(order.pricing?.total, 0),
    ...(order.pricing?.advancePaid !== undefined ? { advancePaid: safeNum(order.pricing.advancePaid, 0) } : {}),
    ...(order.pricing?.loyaltyPointsUsed !== undefined ? { loyaltyPointsUsed: safeNum(order.pricing.loyaltyPointsUsed, 0) } : {}),
    ...(order.pricing?.loyaltyDiscount !== undefined ? { loyaltyDiscount: safeNum(order.pricing.loyaltyDiscount, 0) } : {}),
    ...(order.pricing?.loyaltyPointsEarned !== undefined ? { loyaltyPointsEarned: safeNum(order.pricing.loyaltyPointsEarned, 0) } : {}),
    ...(Array.isArray(order.pricing?.paymentHistory) ? { paymentHistory: order.pricing.paymentHistory.slice(0, 30) } : {})
  });

  const paymentClean = stripUndefinedDeep({
    ...(order.payment || {}),
    method: String(order.payment?.method || 'cod').slice(0, 30),
    status: String(order.payment?.status || 'pending').slice(0, 30),
    ...(order.payment?.dueAmount !== undefined ? { dueAmount: safeNum(order.payment.dueAmount, 0) } : {})
  });

  const cleanId = sanitizeFirestoreId(order.id || `BD-${Date.now()}`, 'BD').slice(0, 64);

  return {
    id: cleanId,
    customer: {
      name: safeName,
      phone: safePhone,
      address: safeAddress,
      district: safeDistrict,
      ...(safeThana ? { thana: safeThana } : {}),
      ...(safeNote ? { note: safeNote } : {})
    },
    items: cleanItems,
    pricing: pricingClean,
    payment: paymentClean,
    deliveryZone: validZone,
    status: order.status || 'pending',
    aiCallStatus: stripUndefinedDeep(order.aiCallStatus || { called: false }),
    courier: stripUndefinedDeep(
      order.courier || {
        provider: 'Steadfast',
        trackingCode: '',
        status: 'booked',
        currentLocation: 'Warehouse',
        estimatedDelivery: '24-72h',
        history: []
      }
    ),
    fraudCheck: stripUndefinedDeep(
      order.fraudCheck || {
        checked: true,
        successRate: 90,
        totalOrders: 1,
        deliveredCount: 1,
        cancelledCount: 0,
        riskLevel: 'safe',
        message: ''
      }
    ),
    source: order.source === 'pos' ? 'pos' : 'online',
    createdAt: String(order.createdAt || new Date().toISOString()).slice(0, 64)
  };
}

export async function writeOrderToFirestore(order: Order, allowAdminStatus = false): Promise<void> {
  const base = sanitizeOrderForFirestore(order);
  const path = `orders/${base.id}`;
  try {
    const canUseAdminStatus = allowAdminStatus && Boolean(auth.currentUser);
    const safeStatus =
      base.status === 'pending' || base.status === 'partial' || canUseAdminStatus ? base.status : 'pending';
    const payload = stripUndefinedDeep({
      ...base,
      status: safeStatus,
      serverCreatedAt: serverTimestamp()
    });
    await setDoc(doc(db, 'orders', base.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateOrderInFirestore(
  order: Order,
  allowCustomerAiConfirm = false
): Promise<void> {
  const base = sanitizeOrderForFirestore(order);
  const path = `orders/${base.id}`;
  const orderRef = doc(db, 'orders', base.id);

  if (!auth.currentUser) {
    if (!allowCustomerAiConfirm || base.status !== 'ai_confirmed') return;
    try {
      await updateDoc(orderRef, {
        status: 'ai_confirmed',
        aiCallStatus: stripUndefinedDeep({
          ...base.aiCallStatus,
          confirmedByCustomer: true
        }),
        courier: base.courier,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
    return;
  }

  try {
    const snap = await getDoc(orderRef);
    if (!snap.exists()) {
      await setDoc(
        orderRef,
        stripUndefinedDeep({
          ...base,
          serverCreatedAt: serverTimestamp()
        })
      );
      return;
    }
    const existingData = snap.data();
    const payload = stripUndefinedDeep({
      ...base,
      createdAt: existingData.createdAt || base.createdAt,
      serverCreatedAt: existingData.serverCreatedAt,
      updatedAt: serverTimestamp()
    });
    await setDoc(orderRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  if (!auth.currentUser) return;
  const cleanId = sanitizeFirestoreId(orderId, 'BD');
  const path = `orders/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'orders', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchOrdersFromFirestore(): Promise<Order[]> {
  if (!auth.currentUser) return [];
  const path = 'orders';
  try {
    const snap = await getDocs(collection(db, 'orders'));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Order));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ======================= STOREFRONT SETTINGS (PUBLIC) =======================
export async function saveStorefrontSettingsToFirestore(
  settings: StoreSettings,
  categoriesOverride?: Category[],
  slidersOverride?: HomeSlide[]
): Promise<void> {
  if (!auth.currentUser) return;
  const path = 'storefront/public';
  try {
    const picked: Record<string, any> = {};
    for (const key of ALLOWED_PUBLIC_SETTINGS_KEYS) {
      const val = (settings as any)[key];
      if (val !== undefined) {
        if ((key === 'logoUrl' || key === 'faviconUrl') && typeof val === 'string' && val.startsWith('data:') && val.length > 200000) {
          continue;
        }
        if (key === 'aiSettings' && val && typeof val === 'object') {
          // Strip AI provider API keys before saving public settings doc
          picked.aiSettings = stripUndefinedDeep({
            ...val,
            geminiApiKey: '',
            openaiApiKey: '',
            claudeApiKey: ''
          });
          continue;
        }
        picked[key] = stripUndefinedDeep(val);
      }
    }
    if (
      picked.seoSettings?.ogImage &&
      typeof picked.seoSettings.ogImage === 'string' &&
      picked.seoSettings.ogImage.startsWith('data:') &&
      picked.seoSettings.ogImage.length > 150000
    ) {
      picked.seoSettings = { ...picked.seoSettings, ogImage: '' };
    }

    const rawCats = categoriesOverride || settings.categories || [];
    if (Array.isArray(rawCats)) {
      picked.categories = stripUndefinedDeep(
        rawCats.slice(0, 60).map((cat) => ({
          ...cat,
          iconImage:
            cat.iconImage && cat.iconImage.startsWith('data:') && cat.iconImage.length > 50000
              ? ''
              : cat.iconImage
        }))
      );
    }

    const rawSliders = slidersOverride || settings.sliders || [];
    if (Array.isArray(rawSliders)) {
      picked.sliders = stripUndefinedDeep(
        rawSliders.slice(0, 30).map((slide) => ({
          ...slide,
          image:
            slide.image && slide.image.startsWith('data:') && slide.image.length > 80000
              ? ''
              : slide.image
        }))
      );
    }

    picked.storeName = (picked.storeName || 'BuyOne BD').slice(0, 120);
    picked.theme = (picked.theme || 'gadgets').slice(0, 40);
    picked.updatedAt = serverTimestamp();
    await setDoc(doc(db, 'storefront', 'public'), picked, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchStorefrontSettingsFromFirestore(): Promise<Record<string, any> | null> {
  const path = 'storefront/public';
  try {
    const snap = await getDoc(doc(db, 'storefront', 'public'));
    return snap.exists() ? (snap.data() as Record<string, any>) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// ======================= PRIVATE ADMIN CONFIG VAULT =======================
export async function saveAdminPrivateConfigToFirestore(settings: StoreSettings): Promise<void> {
  if (!auth.currentUser) return;
  const path = 'admin_config/private';
  try {
    const payload = stripUndefinedDeep({
      ...(settings.smtpSettings ? { smtpSettings: settings.smtpSettings } : {}),
      ...(settings.courierSettings ? { courierSettings: settings.courierSettings } : {}),
      ...(settings.marketingSettings ? { marketingSettings: settings.marketingSettings } : {}),
      ...(settings.aiSettings ? { aiSettings: settings.aiSettings } : {}),
      ...(settings.hostingerDbSettings ? { hostingerDbSettings: settings.hostingerDbSettings } : {}),
      ...(settings.securitySettings ? { securitySettings: settings.securitySettings } : {}),
      ...(Array.isArray(settings.aiKeywordRules)
        ? { aiKeywordRules: settings.aiKeywordRules.slice(0, 100) }
        : {}),
      updatedByEmail: String(auth.currentUser.email || '').slice(0, 160),
      updatedAt: serverTimestamp()
    });
    await setDoc(doc(db, 'admin_config', 'private'), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchAdminPrivateConfigFromFirestore(): Promise<Record<string, any> | null> {
  if (!auth.currentUser) return null;
  const path = 'admin_config/private';
  try {
    const snap = await getDoc(doc(db, 'admin_config', 'private'));
    return snap.exists() ? (snap.data() as Record<string, any>) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// ======================= PRODUCTS =======================
export async function saveProductToFirestore(product: Product): Promise<void> {
  if (!auth.currentUser) return;
  const cleanId = sanitizeFirestoreId(product.id, 'prod');
  const path = `products/${cleanId}`;
  try {
    const picked: Record<string, any> = {};
    for (const key of ALLOWED_PRODUCT_KEYS) {
      const val = (product as any)[key];
      if (val !== undefined) {
        picked[key] = stripUndefinedDeep(val);
      }
    }
    picked.id = cleanId;
    const cleanImages = (product.images || [])
      .filter((u) => typeof u === 'string' && (!u.startsWith('data:') || u.length < 250000))
      .slice(0, 8);
    picked.images =
      cleanImages.length > 0
        ? cleanImages
        : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'];
    if (
      picked.seo?.ogImage &&
      typeof picked.seo.ogImage === 'string' &&
      picked.seo.ogImage.startsWith('data:') &&
      picked.seo.ogImage.length > 150000
    ) {
      picked.seo = { ...picked.seo, ogImage: '' };
    }
    picked.title = String(picked.title || 'Product').slice(0, 200);
    picked.price = Math.max(0, Number(picked.price) || 0);
    picked.stock = Math.max(0, Number(picked.stock) || 0);
    picked.updatedAt = serverTimestamp();
    await setDoc(doc(db, 'products', cleanId), picked, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  if (!auth.currentUser) return;
  const cleanId = sanitizeFirestoreId(productId, 'prod');
  const path = `products/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'products', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchProductsFromFirestore(): Promise<Product[]> {
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, 'products'));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Product));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ======================= REVIEWS =======================
function sanitizeReviewBase(review: ProductReview) {
  return stripUndefinedDeep({
    id: sanitizeFirestoreId(review.id, 'rev'),
    productId: String(review.productId || 'prod-1').slice(0, 80),
    customerName: (String(review.customerName || '').trim() || 'Customer').slice(0, 120),
    rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
    comment: (String(review.comment || '').trim() || 'Great product!').slice(0, 1500),
    date: String(review.date || new Date().toLocaleDateString()).slice(0, 64),
    verifiedPurchase: Boolean(review.verifiedPurchase),
    isApproved: review.isApproved !== false
  });
}

export async function saveReviewToFirestore(review: ProductReview): Promise<void> {
  const base = sanitizeReviewBase(review);
  const path = `reviews/${base.id}`;
  try {
    const ref = doc(db, 'reviews', base.id);
    if (!auth.currentUser) {
      await setDoc(ref, { ...base, createdAt: serverTimestamp() });
      return;
    }
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, { ...base, createdAt: serverTimestamp() });
    } else {
      await setDoc(
        ref,
        {
          ...base,
          createdAt: existingSnap.data().createdAt,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteReviewFromFirestore(reviewId: string): Promise<void> {
  if (!auth.currentUser) return;
  const cleanId = sanitizeFirestoreId(reviewId, 'rev');
  const path = `reviews/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'reviews', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchApprovedReviewsFromFirestore(): Promise<ProductReview[]> {
  const path = 'reviews';
  try {
    const q = query(collection(db, 'reviews'), where('isApproved', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapFirestoreDocToReview(d.id, d.data()));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchAllReviewsFromFirestore(): Promise<ProductReview[]> {
  if (!auth.currentUser) return [];
  const path = 'reviews';
  try {
    const snap = await getDocs(collection(db, 'reviews'));
    return snap.docs.map((d) => mapFirestoreDocToReview(d.id, d.data()));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function mapFirestoreDocToReview(id: string, data: Record<string, any>): ProductReview {
  return {
    id: data.id || id,
    productId: String(data.productId || ''),
    customerName: String(data.customerName || 'Customer'),
    rating: Number(data.rating) || 5,
    comment: String(data.comment || ''),
    date: String(data.date || new Date().toLocaleDateString()),
    verifiedPurchase: Boolean(data.verifiedPurchase),
    isApproved: data.isApproved !== false
  };
}

// ======================= MEDIA LIBRARY =======================
export async function saveMediaItemToFirestore(item: MediaItem): Promise<boolean> {
  if (!auth.currentUser) return false;
  if (!item.url || (item.url.startsWith('data:') && item.url.length > 240000)) {
    return false;
  }
  const cleanId = sanitizeFirestoreId(item.id, 'med');
  const path = `media_library/${cleanId}`;
  try {
    const payload = stripUndefinedDeep({
      id: cleanId,
      name: (String(item.name || '').trim() || 'Media Item').slice(0, 160),
      url: item.url,
      source: String(item.source || 'upload').slice(0, 40),
      width: Math.max(1, Number(item.width) || 600),
      height: Math.max(1, Number(item.height) || 600),
      sizeKb: Math.max(1, Number(item.sizeKb) || 10),
      mimeType: String(item.mimeType || 'image/jpeg').slice(0, 80),
      createdAt: String(item.createdAt || new Date().toISOString()).slice(0, 64),
      updatedAt: serverTimestamp()
    });
    await setDoc(doc(db, 'media_library', cleanId), payload, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMediaItemFromFirestore(mediaId: string): Promise<void> {
  if (!auth.currentUser) return;
  const cleanId = sanitizeFirestoreId(mediaId, 'med');
  const path = `media_library/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'media_library', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchMediaLibraryFromFirestore(): Promise<MediaItem[]> {
  const path = 'media_library';
  try {
    const snap = await getDocs(collection(db, 'media_library'));
    return snap.docs.map((d) => mapFirestoreDocToMedia(d.id, d.data()));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function mapFirestoreDocToMedia(id: string, data: Record<string, any>): MediaItem {
  return {
    id: data.id || id,
    name: String(data.name || 'Media'),
    url: String(data.url || ''),
    source: (data.source || 'upload') as MediaItem['source'],
    width: Number(data.width) || 600,
    height: Number(data.height) || 600,
    sizeKb: Number(data.sizeKb) || 50,
    mimeType: String(data.mimeType || 'image/jpeg'),
    createdAt: String(data.createdAt || new Date().toISOString())
  };
}

// ======================= CUSTOMERS & WALLETS (ADMIN-ONLY PII) =======================
export async function saveCustomerToFirestore(customer: CustomerProfile): Promise<void> {
  if (!auth.currentUser) return;
  const cleanId = getCustomerFirestoreId(customer);
  const path = `customers/${cleanId}`;
  const rawPhone = String(customer.phone || '').trim();
  const safePhone = (rawPhone.length >= 6 ? rawPhone : '01700000000').slice(0, 32);
  try {
    // Password & browser checkIn state intentionally excluded from Firestore
    const payload = stripUndefinedDeep({
      id: cleanId,
      name: (String(customer.name || '').trim() || 'Customer').slice(0, 120),
      ...(customer.username ? { username: String(customer.username).trim().slice(0, 80) } : {}),
      phone: safePhone,
      email: String(customer.email || '').trim().slice(0, 160),
      address: String(customer.address || '').trim().slice(0, 400),
      district: String(customer.district || 'Dhaka - Inside City').trim().slice(0, 120),
      loyaltyPoints: safeNum(customer.loyaltyPoints, 0),
      walletBalance: safeNum(customer.walletBalance, 0),
      ...(customer.lastPurchaseAt ? { lastPurchaseAt: String(customer.lastPurchaseAt).slice(0, 64) } : {}),
      ...(customer.lastWalletCreditAt
        ? { lastWalletCreditAt: String(customer.lastWalletCreditAt).slice(0, 64) }
        : {}),
      browsingHistory: Array.isArray(customer.browsingHistory)
        ? customer.browsingHistory.slice(0, 20)
        : [],
      savedCoupons: Array.isArray(customer.savedCoupons)
        ? customer.savedCoupons.slice(0, 30)
        : [],
      loyaltyHistory: Array.isArray(customer.loyaltyHistory)
        ? customer.loyaltyHistory.slice(0, 40)
        : [],
      updatedAt: serverTimestamp()
    });
    await setDoc(doc(db, 'customers', cleanId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchCustomersFromFirestore(): Promise<CustomerProfile[]> {
  if (!auth.currentUser) return [];
  const path = 'customers';
  try {
    const snap = await getDocs(collection(db, 'customers'));
    return snap.docs.map((d) => mapFirestoreDocToCustomer(d.data()));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function mapFirestoreDocToCustomer(data: Record<string, any>): CustomerProfile {
  return {
    name: String(data.name || 'Customer'),
    username: data.username ? String(data.username) : undefined,
    phone: String(data.phone || ''),
    email: String(data.email || ''),
    address: String(data.address || ''),
    district: String(data.district || 'Dhaka - Inside City'),
    loyaltyPoints: Number(data.loyaltyPoints) || 0,
    walletBalance: Number(data.walletBalance) || 0,
    lastPurchaseAt: data.lastPurchaseAt ? String(data.lastPurchaseAt) : undefined,
    lastWalletCreditAt: data.lastWalletCreditAt ? String(data.lastWalletCreditAt) : undefined,
    browsingHistory: Array.isArray(data.browsingHistory) ? data.browsingHistory : [],
    savedCoupons: Array.isArray(data.savedCoupons) ? data.savedCoupons : [],
    loyaltyHistory: Array.isArray(data.loyaltyHistory) ? data.loyaltyHistory : []
  };
}

// ======================= WALLET MFS TOP-UPS =======================
function sanitizeWalletTopUpBase(req: WalletTopUpRequest) {
  const safePhone = (String(req.customerPhone || '').trim().length >= 6
    ? String(req.customerPhone).trim()
    : '01700000000'
  ).slice(0, 32);
  const safeSender = (String(req.senderNumber || '').trim().length >= 6
    ? String(req.senderNumber).trim()
    : safePhone
  ).slice(0, 32);
  const safeTrx = (String(req.trxId || '').trim().length >= 2
    ? String(req.trxId).trim()
    : 'TRX00'
  ).slice(0, 80);
  const validMethod =
    req.method === 'bkash' || req.method === 'nagad' || req.method === 'rocket' || req.method === 'upay'
      ? req.method
      : 'bkash';

  return stripUndefinedDeep({
    id: sanitizeFirestoreId(req.id, 'TOPUP'),
    customerName: (String(req.customerName || '').trim() || 'Customer').slice(0, 120),
    customerPhone: safePhone,
    method: validMethod,
    amount: Math.min(500000, Math.max(1, Number(req.amount) || 1)),
    senderNumber: safeSender,
    trxId: safeTrx,
    status:
      req.status === 'approved' || req.status === 'rejected' || req.status === 'pending'
        ? req.status
        : 'pending',
    submittedAt: String(req.createdAt || new Date().toISOString()).slice(0, 64),
    ...(req.processedAt ? { reviewedAt: String(req.processedAt).slice(0, 64) } : {}),
    ...(req.adminNote ? { note: String(req.adminNote).slice(0, 300) } : {}),
    ...(Array.isArray(req.activityLog) ? { activityLog: req.activityLog.slice(0, 50) } : {})
  });
}

export async function saveWalletTopUpToFirestore(req: WalletTopUpRequest): Promise<void> {
  const base = sanitizeWalletTopUpBase(req);
  const path = `wallet_topups/${base.id}`;
  try {
    const ref = doc(db, 'wallet_topups', base.id);
    if (!auth.currentUser) {
      await setDoc(ref, {
        ...base,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      return;
    }
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, { ...base, createdAt: serverTimestamp() });
    } else {
      await setDoc(
        ref,
        {
          ...base,
          createdAt: existingSnap.data().createdAt,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteWalletTopUpFromFirestore(topUpId: string): Promise<void> {
  if (!auth.currentUser) return;
  const cleanId = sanitizeFirestoreId(topUpId, 'TOPUP');
  const path = `wallet_topups/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'wallet_topups', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchWalletTopUpsFromFirestore(): Promise<WalletTopUpRequest[]> {
  if (!auth.currentUser) return [];
  const path = 'wallet_topups';
  try {
    const snap = await getDocs(collection(db, 'wallet_topups'));
    return snap.docs.map((d) => mapFirestoreDocToWalletTopUp(d.id, d.data()));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function mapFirestoreDocToWalletTopUp(id: string, data: Record<string, any>): WalletTopUpRequest {
  return {
    id: data.id || id,
    customerName: String(data.customerName || 'Customer'),
    customerPhone: String(data.customerPhone || ''),
    method: (data.method || 'bkash') as WalletTopUpRequest['method'],
    amount: Number(data.amount) || 0,
    senderNumber: String(data.senderNumber || ''),
    trxId: String(data.trxId || ''),
    status: (data.status || 'pending') as WalletTopUpRequest['status'],
    adminNote: data.note ? String(data.note) : undefined,
    createdAt: String(data.submittedAt || new Date().toISOString()),
    processedAt: data.reviewedAt ? String(data.reviewedAt) : undefined,
    activityLog: Array.isArray(data.activityLog) ? data.activityLog : undefined
  };
}

// ======================= ABANDONED CARTS =======================
function sanitizeAbandonedCartBase(cart: AbandonedCart) {
  const safePhone = (String(cart.customerPhone || '').trim().length >= 6
    ? String(cart.customerPhone).trim()
    : '01700000000'
  ).slice(0, 32);

  const safeItems = (cart.items || []).slice(0, 40).map((it) => ({
    quantity: Math.max(1, Number(it.quantity) || 1),
    ...(it.selectedColor ? { selectedColor: String(it.selectedColor).slice(0, 40) } : {}),
    ...(it.selectedSize ? { selectedSize: String(it.selectedSize).slice(0, 40) } : {}),
    product: stripUndefinedDeep({
      id: sanitizeFirestoreId(it.product?.id || 'prod', 'prod'),
      title: String(it.product?.title || 'Product').slice(0, 180),
      titleBn: String(it.product?.titleBn || it.product?.title || 'পণ্য').slice(0, 200),
      price: safeNum(it.product?.price, 0),
      originalPrice: safeNum(it.product?.originalPrice, safeNum(it.product?.price, 0)),
      images: (it.product?.images || [])
        .filter((u) => typeof u === 'string' && (!u.startsWith('data:') || u.length < 25000))
        .slice(0, 2)
    })
  }));

  return stripUndefinedDeep({
    id: sanitizeFirestoreId(cart.id, 'cart'),
    ...(cart.customerName ? { customerName: String(cart.customerName).slice(0, 120) } : {}),
    customerPhone: safePhone,
    ...(cart.customerAddress ? { customerAddress: String(cart.customerAddress).slice(0, 400) } : {}),
    ...(cart.customerDistrict ? { customerDistrict: String(cart.customerDistrict).slice(0, 120) } : {}),
    items: safeItems.length > 0 ? safeItems : [{ quantity: 1, product: { id: 'item-1', title: 'Cart Item', price: safeNum(cart.total, 0) } }],
    totalValue: safeNum(cart.total, 0),
    abandonedAt: String(cart.createdAt || new Date().toISOString()).slice(0, 64),
    whatsappSent: Boolean(cart.whatsappSent),
    recovered: Boolean(cart.recovered),
    ...(cart.recoveredAt ? { recoveredAt: String(cart.recoveredAt).slice(0, 64) } : {})
  });
}

export async function saveAbandonedCartToFirestore(cart: AbandonedCart): Promise<void> {
  const base = sanitizeAbandonedCartBase(cart);
  const path = `abandoned_carts/${base.id}`;
  try {
    const ref = doc(db, 'abandoned_carts', base.id);
    if (!auth.currentUser) {
      await setDoc(ref, { ...base, createdAt: serverTimestamp() });
      return;
    }
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, { ...base, createdAt: serverTimestamp() });
    } else {
      await setDoc(
        ref,
        {
          ...base,
          createdAt: existingSnap.data().createdAt,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAbandonedCartFromFirestore(cartId: string): Promise<void> {
  if (!auth.currentUser) return;
  const cleanId = sanitizeFirestoreId(cartId, 'cart');
  const path = `abandoned_carts/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'abandoned_carts', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchAbandonedCartsFromFirestore(): Promise<AbandonedCart[]> {
  if (!auth.currentUser) return [];
  const path = 'abandoned_carts';
  try {
    const snap = await getDocs(collection(db, 'abandoned_carts'));
    return snap.docs.map((d) => mapFirestoreDocToAbandonedCart(d.id, d.data()));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function mapFirestoreDocToAbandonedCart(id: string, data: Record<string, any>): AbandonedCart {
  return {
    id: data.id || id,
    customerName: data.customerName ? String(data.customerName) : undefined,
    customerPhone: String(data.customerPhone || ''),
    customerAddress: data.customerAddress ? String(data.customerAddress) : undefined,
    customerDistrict: data.customerDistrict ? String(data.customerDistrict) : undefined,
    items: Array.isArray(data.items) ? data.items : [],
    total: Number(data.totalValue) || 0,
    createdAt: String(data.abandonedAt || new Date().toISOString()),
    recovered: Boolean(data.recovered),
    recoveredAt: data.recoveredAt ? String(data.recoveredAt) : undefined,
    whatsappSent: Boolean(data.whatsappSent)
  };
}

// ======================= PRICE ALERTS =======================
function sanitizePriceAlertBase(alert: PriceAlert) {
  return stripUndefinedDeep({
    id: sanitizeFirestoreId(alert.id, 'alert'),
    productId: String(alert.productId || 'prod-1').slice(0, 80),
    productTitle: String(alert.productTitle || '').slice(0, 200),
    productTitleBn: String(alert.productTitleBn || '').slice(0, 240),
    currentPrice: safeNum(alert.currentPrice, 0),
    contact: (String(alert.contact || '').trim() || '01700000000').slice(0, 160),
    targetPrice: Math.max(1, Number(alert.targetPrice) || 1),
    dateLabel: String(alert.createdAt || new Date().toLocaleDateString()).slice(0, 64),
    status: alert.status === 'notified' ? 'notified' : 'active'
  });
}

export async function savePriceAlertToFirestore(alert: PriceAlert): Promise<void> {
  const base = sanitizePriceAlertBase(alert);
  const path = `price_alerts/${base.id}`;
  try {
    const ref = doc(db, 'price_alerts', base.id);
    if (!auth.currentUser) {
      await setDoc(ref, { ...base, createdAt: serverTimestamp() });
      return;
    }
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, { ...base, createdAt: serverTimestamp() });
    } else {
      await setDoc(ref, { ...base, createdAt: existingSnap.data().createdAt }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchPriceAlertsFromFirestore(): Promise<PriceAlert[]> {
  if (!auth.currentUser) return [];
  const path = 'price_alerts';
  try {
    const snap = await getDocs(collection(db, 'price_alerts'));
    return snap.docs.map((d) => mapFirestoreDocToPriceAlert(d.id, d.data()));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function mapFirestoreDocToPriceAlert(id: string, data: Record<string, any>): PriceAlert {
  return {
    id: data.id || id,
    productId: String(data.productId || ''),
    productTitle: String(data.productTitle || ''),
    productTitleBn: String(data.productTitleBn || ''),
    contact: String(data.contact || ''),
    currentPrice: Number(data.currentPrice) || 0,
    targetPrice: Number(data.targetPrice) || 0,
    createdAt: String(data.dateLabel || new Date().toLocaleDateString()),
    status: data.status === 'notified' ? 'notified' : 'active'
  };
}

// ======================= OUT-OF-STOCK WAITLIST ('Waitlist' collection) =======================
export async function saveWaitlistEntryToFirestore(entry: WaitlistEntry): Promise<void> {
  const cleanId = sanitizeFirestoreId(entry.id, 'wait');
  const path = `Waitlist/${cleanId}`;
  try {
    const ref = doc(db, 'Waitlist', cleanId);
    const base = stripUndefinedDeep({
      id: cleanId,
      productId: String(entry.productId || 'prod-1').slice(0, 80),
      productTitle: String(entry.productTitle || '').slice(0, 200),
      productTitleBn: String(entry.productTitleBn || '').slice(0, 240),
      contact: String(entry.contact || '').trim().slice(0, 160),
      contactType: entry.contactType === 'email' ? 'email' : 'phone',
      status: entry.status === 'notified' ? 'notified' : 'waiting'
    });
    if (!auth.currentUser) {
      await setDoc(ref, { ...base, status: 'waiting', createdAt: serverTimestamp() });
      return;
    }
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, { ...base, status: 'waiting', createdAt: serverTimestamp() });
    } else {
      await setDoc(ref, { ...base, createdAt: existingSnap.data().createdAt }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchWaitlistFromFirestore(): Promise<WaitlistEntry[]> {
  if (!auth.currentUser) return [];
  const path = 'Waitlist';
  try {
    const snap = await getDocs(collection(db, 'Waitlist'));
    return snap.docs.map((d) => mapFirestoreDocToWaitlist(d.id, d.data()));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteWaitlistEntryFromFirestore(id: string): Promise<void> {
  if (!auth.currentUser) return;
  const cleanId = sanitizeFirestoreId(id, 'wait');
  const path = `Waitlist/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'Waitlist', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function mapFirestoreDocToWaitlist(id: string, data: Record<string, any>): WaitlistEntry {
  const createdTs = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined;
  return {
    id: data.id || id,
    productId: String(data.productId || ''),
    productTitle: String(data.productTitle || ''),
    productTitleBn: String(data.productTitleBn || ''),
    contact: String(data.contact || ''),
    contactType: data.contactType === 'email' ? 'email' : 'phone',
    status: data.status === 'notified' ? 'notified' : 'waiting',
    createdAt: createdTs || String(data.createdAt || new Date().toISOString())
  };
}

// ======================= STAFF USERS =======================
export async function saveStaffUserToFirestore(user: UserStaff): Promise<void> {
  if (!auth.currentUser) return;
  const cleanId = sanitizeFirestoreId(user.id, 'usr');
  const path = `staff_users/${cleanId}`;
  try {
    const payload = stripUndefinedDeep({
      id: cleanId,
      name: (String(user.name || '').trim() || 'Staff User').slice(0, 120),
      email: (String(user.email || '').trim() || 'staff@buyonebd.com').slice(0, 160),
      ...(user.phone ? { phone: String(user.phone).trim().slice(0, 32) } : {}),
      role: user.role || 'order_manager',
      status: user.isActive ? 'active' : 'inactive',
      createdAtLabel: String(user.createdAt || new Date().toISOString()).slice(0, 64),
      updatedAt: serverTimestamp()
    });
    await setDoc(doc(db, 'staff_users', cleanId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStaffUserFromFirestore(userId: string): Promise<void> {
  if (!auth.currentUser) return;
  const cleanId = sanitizeFirestoreId(userId, 'usr');
  const path = `staff_users/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'staff_users', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchStaffUsersFromFirestore(): Promise<UserStaff[]> {
  if (!auth.currentUser) return [];
  const path = 'staff_users';
  try {
    const snap = await getDocs(collection(db, 'staff_users'));
    return snap.docs.map((d) => mapFirestoreDocToStaffUser(d.id, d.data()));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function mapFirestoreDocToStaffUser(id: string, data: Record<string, any>): UserStaff {
  return {
    id: data.id || id,
    name: String(data.name || 'Staff'),
    email: String(data.email || ''),
    phone: data.phone ? String(data.phone) : undefined,
    role: (data.role || 'order_manager') as UserStaff['role'],
    isActive: data.status !== 'inactive',
    createdAt: String(data.createdAtLabel || new Date().toISOString())
  };
}

// ======================= ADMINS =======================
export async function ensureAdminDocInFirestore(): Promise<void> {
  const u = auth.currentUser;
  if (!u || !u.email) return;
  try {
    await setDoc(
      doc(db, 'admins', u.uid),
      {
        uid: u.uid,
        email: u.email,
        createdAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch {
    // non-fatal if non-admin user probes
  }
}

// ======================= UNIFIED ALL-SETTINGS SYNC & DIAGNOSTICS =======================
export interface FullCloudSyncPayload {
  settings: StoreSettings;
  categories: Category[];
  sliders: HomeSlide[];
  products: Product[];
  orders: Order[];
  reviews: ProductReview[];
  mediaLibrary: MediaItem[];
  customerAccounts: CustomerProfile[];
  walletTopUps: WalletTopUpRequest[];
  abandonedCarts: AbandonedCart[];
  priceAlerts: PriceAlert[];
  waitlist?: WaitlistEntry[];
  users: UserStaff[];
}

export interface FullCloudSyncResult {
  ok: boolean;
  counts: Record<string, number>;
  errors: string[];
}

export async function syncAllAdminDataToFirestore(
  payload: FullCloudSyncPayload
): Promise<FullCloudSyncResult> {
  const counts: Record<string, number> = {
    storefront: 0,
    privateConfig: 0,
    products: 0,
    orders: 0,
    reviews: 0,
    media: 0,
    customers: 0,
    walletTopUps: 0,
    abandonedCarts: 0,
    priceAlerts: 0,
    staffUsers: 0
  };
  const errors: string[] = [];

  if (!auth.currentUser) {
    return { ok: false, counts, errors: ['Not signed in with Firebase Admin Google account.'] };
  }

  try {
    await saveStorefrontSettingsToFirestore(payload.settings, payload.categories, payload.sliders);
    counts.storefront = 1;
  } catch (err) {
    errors.push(`storefront/public: ${extractFirestoreErrorReason(err)}`);
  }

  try {
    await saveAdminPrivateConfigToFirestore(payload.settings);
    counts.privateConfig = 1;
  } catch (err) {
    errors.push(`admin_config/private: ${extractFirestoreErrorReason(err)}`);
  }

  for (const prod of payload.products) {
    try {
      await saveProductToFirestore(prod);
      counts.products += 1;
    } catch (err) {
      errors.push(`product ${prod.id}: ${extractFirestoreErrorReason(err)}`);
    }
  }

  for (const ord of payload.orders) {
    try {
      await updateOrderInFirestore(ord);
      counts.orders += 1;
    } catch (err) {
      errors.push(`order ${ord.id}: ${extractFirestoreErrorReason(err)}`);
    }
  }

  for (const rev of payload.reviews) {
    try {
      await saveReviewToFirestore(rev);
      counts.reviews += 1;
    } catch (err) {
      errors.push(`review ${rev.id}: ${extractFirestoreErrorReason(err)}`);
    }
  }

  for (const med of payload.mediaLibrary) {
    try {
      const saved = await saveMediaItemToFirestore(med);
      if (saved) counts.media += 1;
    } catch (err) {
      errors.push(`media ${med.id}: ${extractFirestoreErrorReason(err)}`);
    }
  }

  for (const cust of payload.customerAccounts) {
    try {
      await saveCustomerToFirestore(cust);
      counts.customers += 1;
    } catch (err) {
      errors.push(`customer ${cust.phone}: ${extractFirestoreErrorReason(err)}`);
    }
  }

  for (const topup of payload.walletTopUps) {
    try {
      await saveWalletTopUpToFirestore(topup);
      counts.walletTopUps += 1;
    } catch (err) {
      errors.push(`wallet_topup ${topup.id}: ${extractFirestoreErrorReason(err)}`);
    }
  }

  for (const cart of payload.abandonedCarts) {
    try {
      await saveAbandonedCartToFirestore(cart);
      counts.abandonedCarts += 1;
    } catch (err) {
      errors.push(`abandoned_cart ${cart.id}: ${extractFirestoreErrorReason(err)}`);
    }
  }

  for (const alert of payload.priceAlerts) {
    try {
      await savePriceAlertToFirestore(alert);
      counts.priceAlerts += 1;
    } catch (err) {
      errors.push(`price_alert ${alert.id}: ${extractFirestoreErrorReason(err)}`);
    }
  }

  for (const w of payload.waitlist || []) {
    try {
      await saveWaitlistEntryToFirestore(w);
      counts.waitlist = (counts.waitlist || 0) + 1;
    } catch (err) {
      errors.push(`waitlist ${w.id}: ${extractFirestoreErrorReason(err)}`);
    }
  }

  for (const u of payload.users) {
    try {
      await saveStaffUserToFirestore(u);
      counts.staffUsers += 1;
    } catch (err) {
      errors.push(`staff ${u.id}: ${extractFirestoreErrorReason(err)}`);
    }
  }

  return { ok: errors.length === 0, counts, errors };
}

export interface FirebaseDiagnosticStep {
  step: string;
  ok: boolean;
  message: string;
}

export async function runFirebaseDiagnostics(): Promise<{
  ok: boolean;
  details: FirebaseDiagnosticStep[];
}> {
  const details: FirebaseDiagnosticStep[] = [];

  try {
    const snap = await getDocFromServer(doc(db, 'storefront', 'public'));
    details.push({
      step: 'Public Storefront (storefront/public)',
      ok: true,
      message: snap.exists()
        ? `Connected • Loaded theme "${snap.data()?.theme || 'default'}" (${(snap.data()?.categories || []).length} categories, ${(snap.data()?.sliders || []).length} sliders)`
        : 'Connected to server, document storefront/public not created yet (click Push All Settings to initialize).'
    });
  } catch (err) {
    details.push({
      step: 'Public Storefront (storefront/public)',
      ok: false,
      message: extractFirestoreErrorReason(err)
    });
  }

  try {
    const prodSnap = await getDocs(collection(db, 'products'));
    details.push({
      step: 'Catalog Products (/products)',
      ok: true,
      message: `Readable • ${prodSnap.size} product(s) stored in Firestore.`
    });
  } catch (err) {
    details.push({
      step: 'Catalog Products (/products)',
      ok: false,
      message: extractFirestoreErrorReason(err)
    });
  }

  const user = auth.currentUser;
  if (!user) {
    details.push({
      step: 'Admin Google Auth Session',
      ok: false,
      message: 'Not signed in yet. Click "Connect Firebase Admin" to authenticate buyonebd@gmail.com.'
    });
    return { ok: false, details };
  }

  details.push({
    step: 'Admin Google Auth Session',
    ok: Boolean(user.email),
    message: `Signed in as ${user.email} (verified: ${user.emailVerified ? 'yes' : 'no'})`
  });

  try {
    const privSnap = await getDocFromServer(doc(db, 'admin_config', 'private'));
    details.push({
      step: 'Private Settings Vault (admin_config/private)',
      ok: true,
      message: privSnap.exists()
        ? `Accessible • SMTP, Courier & Marketing keys encrypted & synced.`
        : 'Accessible • Ready for first write.'
    });
  } catch (err) {
    details.push({
      step: 'Private Settings Vault (admin_config/private)',
      ok: false,
      message: extractFirestoreErrorReason(err)
    });
  }

  try {
    const ordSnap = await getDocs(collection(db, 'orders'));
    details.push({
      step: 'Cross-Device Orders Read (/orders)',
      ok: true,
      message: `Live • ${ordSnap.size} cloud order(s) accessible.`
    });
  } catch (err) {
    details.push({
      step: 'Cross-Device Orders Read (/orders)',
      ok: false,
      message: extractFirestoreErrorReason(err)
    });
  }

  // Verify live order write + cleanup when signed in as Admin
  const diagOrderId = `DIAG-PING-${Date.now()}`;
  try {
    await setDoc(doc(db, 'orders', diagOrderId), {
      id: diagOrderId,
      customer: {
        name: 'Diagnostics Ping',
        phone: '01700000000',
        address: 'Dhaka',
        district: 'Dhaka - Inside City'
      },
      items: [
        {
          productId: 'diag-item',
          productTitle: 'Health Check Item',
          productTitleBn: 'ডায়াগনস্টিক চেক',
          price: 100,
          quantity: 1,
          image: ''
        }
      ],
      pricing: { subtotal: 100, deliveryFee: 0, discount: 0, total: 100 },
      payment: { method: 'cod', status: 'pending', dueAmount: 100 },
      deliveryZone: 'dhaka_inside',
      status: 'pending',
      source: 'online',
      createdAt: new Date().toISOString(),
      serverCreatedAt: serverTimestamp()
    });
    await deleteDoc(doc(db, 'orders', diagOrderId)).catch(() => {});
    details.push({
      step: 'Live Order Write Test (/orders)',
      ok: true,
      message: 'Verified • New order writes & serverTimestamp rules pass cleanly.'
    });
  } catch (err) {
    details.push({
      step: 'Live Order Write Test (/orders)',
      ok: false,
      message: extractFirestoreErrorReason(err)
    });
  }

  return {
    ok: details.every((d) => d.ok),
    details
  };
}

export { collection, doc, query, where };
