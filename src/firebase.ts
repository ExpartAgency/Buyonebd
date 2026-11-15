import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  getDocFromServer,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Order, Product, StoreSettings } from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

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
    await getDocFromServer(doc(db, 'test', 'connection'));
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

const ALLOWED_SETTINGS_KEYS = [
  'storeName', 'storeNameBn', 'logoUrl', 'logoMode', 'tagline', 'taglineBn',
  'hotline', 'whatsappNumber', 'supportEmail', 'address', 'deliveryFees',
  'paymentSettings', 'aiCallSettings', 'announcementBar', 'theme', 'themeColors',
  'cmsTexts', 'spinSettings', 'whatsappTemplates', 'marketingSettings',
  'aiSettings', 'courierSettings', 'smtpSettings', 'seoSettings', 'flashSale',
  'footerSettings', 'singleProductCms', 'organicMarketing', 'walletSettings',
  'promoCoupons', 'brandAttributes'
] as const;

const ALLOWED_PRODUCT_KEYS = [
  'id', 'title', 'titleBn', 'description', 'descriptionBn', 'price', 'originalPrice',
  'stock', 'category', 'categoryBn', 'subcategory', 'tags', 'images', 'sku',
  'barcode', 'freeShipping', 'customDeliveryFees', 'rating', 'reviewsCount',
  'soldCount', 'loyaltyPoints', 'isFlashSale', 'colors', 'sizes', 'features',
  'featuresBn', 'videoUrl', 'warrantyInfo', 'warrantyInfoBn', 'seo'
] as const;

function safeNum(val: unknown, fallback = 0): number {
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
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
    ...(order.pricing?.advancePaid !== undefined ? { advancePaid: safeNum(order.pricing.advancePaid, 0) } : {})
  });

  const paymentClean = stripUndefinedDeep({
    ...(order.payment || {}),
    method: String(order.payment?.method || 'cod').slice(0, 30),
    status: String(order.payment?.status || 'pending').slice(0, 30),
    ...(order.payment?.dueAmount !== undefined ? { dueAmount: safeNum(order.payment.dueAmount, 0) } : {})
  });

  const cleanId = String(order.id || `BD-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 64);

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
    courier: stripUndefinedDeep(order.courier || { provider: 'Steadfast', trackingCode: '', status: 'booked', currentLocation: 'Warehouse', estimatedDelivery: '24-72h', history: [] }),
    fraudCheck: stripUndefinedDeep(order.fraudCheck || { checked: true, successRate: 90, totalOrders: 1, deliveredCount: 1, cancelledCount: 0, riskLevel: 'safe', message: '' }),
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
      base.status === 'pending' || base.status === 'partial' || canUseAdminStatus
        ? base.status
        : 'pending';
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

export async function updateOrderInFirestore(order: Order): Promise<void> {
  if (!auth.currentUser) return;
  const path = `orders/${order.id}`;
  try {
    const orderRef = doc(db, 'orders', order.id);
    const snap = await getDoc(orderRef);
    const base = sanitizeOrderForFirestore(order);
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
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveStorefrontSettingsToFirestore(settings: StoreSettings): Promise<void> {
  if (!auth.currentUser) return;
  const path = 'storefront/public';
  try {
    const picked: Record<string, any> = {};
    for (const key of ALLOWED_SETTINGS_KEYS) {
      const val = (settings as any)[key];
      if (val !== undefined) {
        if (key === 'logoUrl' && typeof val === 'string' && val.startsWith('data:') && val.length > 200000) {
          continue;
        }
        picked[key] = stripUndefinedDeep(val);
      }
    }
    if (picked.seoSettings?.ogImage && typeof picked.seoSettings.ogImage === 'string' && picked.seoSettings.ogImage.startsWith('data:') && picked.seoSettings.ogImage.length > 150000) {
      picked.seoSettings = { ...picked.seoSettings, ogImage: '' };
    }
    picked.storeName = (picked.storeName || 'BuyOne BD').slice(0, 120);
    picked.theme = (picked.theme || 'gadgets').slice(0, 40);
    picked.updatedAt = serverTimestamp();
    await setDoc(doc(db, 'storefront', 'public'), picked, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  if (!auth.currentUser) return;
  const path = `products/${product.id}`;
  try {
    const picked: Record<string, any> = {};
    for (const key of ALLOWED_PRODUCT_KEYS) {
      const val = (product as any)[key];
      if (val !== undefined) {
        picked[key] = stripUndefinedDeep(val);
      }
    }
    const cleanImages = (product.images || [])
      .filter((u) => typeof u === 'string' && (!u.startsWith('data:') || u.length < 250000))
      .slice(0, 8);
    picked.images =
      cleanImages.length > 0
        ? cleanImages
        : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'];
    if (picked.seo?.ogImage && typeof picked.seo.ogImage === 'string' && picked.seo.ogImage.startsWith('data:') && picked.seo.ogImage.length > 150000) {
      picked.seo = { ...picked.seo, ogImage: '' };
    }
    picked.title = String(picked.title || 'Product').slice(0, 200);
    picked.price = Math.max(0, Number(picked.price) || 0);
    picked.stock = Math.max(0, Number(picked.stock) || 0);
    picked.updatedAt = serverTimestamp();
    await setDoc(doc(db, 'products', product.id), picked, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  if (!auth.currentUser) return;
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

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

export async function fetchStorefrontSettingsFromFirestore(): Promise<Record<string, any> | null> {
  const path = 'storefront/public';
  try {
    const snap = await getDoc(doc(db, 'storefront', 'public'));
    return snap.exists() ? (snap.data() as Record<string, any>) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
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

export { collection, doc };
