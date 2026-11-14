import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
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

function sanitizeOrderForFirestore(order: Order) {
  const cleanItems = (order.items || []).slice(0, 50).map((it) => ({
    ...stripUndefinedDeep(it),
    image: it.image && (!it.image.startsWith('data:') || it.image.length < 150000) ? it.image : ''
  }));
  return {
    id: order.id,
    customer: {
      name: (order.customer?.name || 'Customer').slice(0, 120),
      phone: (order.customer?.phone || '01700000000').slice(0, 32),
      address: (order.customer?.address || 'Bangladesh').slice(0, 400),
      district: (order.customer?.district || 'Dhaka').slice(0, 120),
      ...(order.customer?.thana ? { thana: order.customer.thana.slice(0, 120) } : {}),
      ...(order.customer?.note ? { note: order.customer.note.slice(0, 300) } : {})
    },
    items: cleanItems,
    pricing: stripUndefinedDeep(order.pricing),
    payment: stripUndefinedDeep(order.payment),
    deliveryZone: order.deliveryZone || 'dhaka_inside',
    status: order.status || 'pending',
    aiCallStatus: stripUndefinedDeep(order.aiCallStatus),
    courier: stripUndefinedDeep(order.courier),
    fraudCheck: stripUndefinedDeep(order.fraudCheck),
    source: order.source || 'online',
    createdAt: order.createdAt || new Date().toISOString()
  };
}

export async function writeOrderToFirestore(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const base = sanitizeOrderForFirestore(order);
    const payload = stripUndefinedDeep({
      ...base,
      status: base.status === 'pending' || base.status === 'partial' || auth.currentUser ? base.status : 'pending',
      serverCreatedAt: serverTimestamp()
    });
    await setDoc(doc(db, 'orders', order.id), payload);
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

export { collection, doc };
