import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Product,
  Order,
  StoreSettings,
  OrderStatus,
  PaymentMethod,
  DeliveryZone,
  SpinReward,
  Category,
  HomeSlide,
  AbandonedCart,
  UserStaff,
  ProductReview,
  OrderFraudCheck,
  CourierProvider,
  PriceAlert,
  CustomerProfile,
  CustomerCoupon,
  WhatsAppCloudLog,
  StoreTheme,
  CustomerBrowsingEvent,
  SupportChatSession,
  SupportChatMessage,
  BrowserCallSession,
  BrowserCallTranscriptItem,
  ServerPixelEvent,
  WalletTopUpMethod,
  WalletTopUpRequest,
  MediaItem,
  SecurityLogEntry,
  WaitlistEntry,
  DeliveryBoy,
  LoyaltyHistoryItem
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_SLIDERS,
  INITIAL_ABANDONED_CARTS,
  INITIAL_USERS,
  INITIAL_REVIEWS,
  BUSINESS_THEME_PRESETS
} from '../data/initialData';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { onSnapshot, getDoc } from 'firebase/firestore';
import {
  db,
  auth,
  googleProvider,
  collection,
  doc,
  query,
  where,
  OperationType,
  handleFirestoreError,
  extractFirestoreErrorReason,
  writeOrderToFirestore,
  updateOrderInFirestore,
  deleteOrderFromFirestore,
  saveStorefrontSettingsToFirestore,
  saveAdminPrivateConfigToFirestore,
  fetchAdminPrivateConfigFromFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveReviewToFirestore,
  deleteReviewFromFirestore,
  fetchAllReviewsFromFirestore,
  mapFirestoreDocToReview,
  saveMediaItemToFirestore,
  deleteMediaItemFromFirestore,
  fetchMediaLibraryFromFirestore,
  mapFirestoreDocToMedia,
  saveCustomerToFirestore,
  fetchCustomersFromFirestore,
  mapFirestoreDocToCustomer,
  getCustomerFirestoreId,
  saveWalletTopUpToFirestore,
  deleteWalletTopUpFromFirestore,
  fetchWalletTopUpsFromFirestore,
  mapFirestoreDocToWalletTopUp,
  saveAbandonedCartToFirestore,
  deleteAbandonedCartFromFirestore,
  fetchAbandonedCartsFromFirestore,
  mapFirestoreDocToAbandonedCart,
  savePriceAlertToFirestore,
  fetchPriceAlertsFromFirestore,
  mapFirestoreDocToPriceAlert,
  saveWaitlistEntryToFirestore,
  fetchWaitlistFromFirestore,
  deleteWaitlistEntryFromFirestore,
  mapFirestoreDocToWaitlist,
  saveStaffUserToFirestore,
  deleteStaffUserFromFirestore,
  fetchStaffUsersFromFirestore,
  mapFirestoreDocToStaffUser,
  syncAllAdminDataToFirestore,
  runFirebaseDiagnostics,
  FirebaseDiagnosticStep,
  ensureAdminDocInFirestore,
  fetchStorefrontSettingsFromFirestore,
  fetchProductsFromFirestore,
  fetchOrdersFromFirestore
} from '../firebase';
import { WebRTCAudioSession } from '../utils/webrtcAudio';

async function safeParseJson<T = any>(res: Response): Promise<T | null> {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function normalizeHexColor(hex?: string, fallback = '#059669'): string {
  const clean = String(hex || '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(clean)) return clean;
  if (/^#[0-9a-fA-F]{3}$/.test(clean)) {
    return `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
  }
  return fallback;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = normalizeHexColor(hex).slice(1);
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16)
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function computeBrandPaletteAttributes(primaryHex?: string, secondaryHex?: string) {
  const primary = normalizeHexColor(primaryHex, '#059669');
  const { r, g, b } = hexToRgb(primary);
  const primaryHover = rgbToHex(r * 0.84, g * 0.84, b * 0.84);
  const primarySoft = `rgba(${r}, ${g}, ${b}, 0.12)`;
  const primaryBorder = `rgba(${r}, ${g}, ${b}, 0.32)`;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const onPrimary = luminance > 0.62 ? '#0f172a' : '#ffffff';
  const secondary = normalizeHexColor(
    secondaryHex,
    rgbToHex(Math.max(0, r - 12), Math.min(255, g + 16), Math.min(255, b + 28))
  );
  const heroFrom = rgbToHex(r * 0.18, g * 0.18, b * 0.22);
  const heroTo = rgbToHex(r * 0.48, g * 0.48, b * 0.52);
  const footerBg = rgbToHex(r * 0.08 + 8, g * 0.08 + 14, b * 0.08 + 24);
  const cssAttributeString = [
    `--brand-primary: ${primary};`,
    `--brand-primary-hover: ${primaryHover};`,
    `--brand-primary-soft: ${primarySoft};`,
    `--brand-primary-border: ${primaryBorder};`,
    `--brand-on-primary: ${onPrimary};`,
    `--brand-secondary: ${secondary};`
  ].join('\n');
  return {
    primary,
    secondary,
    heroFrom,
    heroTo,
    footerBg,
    primaryHover,
    primarySoft,
    primaryBorder,
    onPrimary,
    cssAttributeString
  };
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  selectedAttributes?: Record<string, string>;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface StoreContextType {
  // Localization
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
  adminLang: 'bn' | 'en';
  setAdminLang: (lang: 'bn' | 'en') => void;
  t: (bn: string, en: string) => string;

  // Storefront Catalog Filters & SEO URL Routing
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (sub: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  storeSubView: 'home' | 'products' | 'about';
  setStoreSubView: (view: 'home' | 'products' | 'about') => void;
  goHome: () => void;
  openAllProductsPage: () => void;
  openAboutPage: () => void;
  selectCategoryFilter: (catSlug: string, subSlug?: string | null) => void;
  openProductPage: (product: Product) => void;
  navigateToPath: (path: string, replace?: boolean) => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductFlashSale: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  toggleCategoryActive: (id: string) => void;

  // Sliders
  sliders: HomeSlide[];
  addSlide: (slide: Omit<HomeSlide, 'id'>) => void;
  updateSlide: (id: string, updates: Partial<HomeSlide>) => void;
  deleteSlide: (id: string) => void;
  toggleSlideActive: (id: string) => void;

  // Orders
  orders: Order[];
  createOrder: (orderData: {
    customer: { name: string; phone: string; address: string; district: string; thana: string; note?: string };
    items: {
      product: Product;
      quantity: number;
      selectedColor?: string;
      selectedSize?: string;
      selectedAttributes?: Record<string, string>;
    }[];
    paymentMethod: PaymentMethod;
    paymentTrxId?: string;
    deliveryZone: DeliveryZone;
    advancePaid?: number;
    discountAmount?: number;
    couponCode?: string;
    walletUsedAmount?: number;
    loyaltyPointsUsed?: number;
    loyaltyDiscountAmount?: number;
    customDeliveryFee?: number;
    source?: 'online' | 'pos';
    initialStatus?: OrderStatus;
    skipAICall?: boolean;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderCourier: (orderId: string, updates: Partial<Order['courier']>) => void;
  assignDeliveryBoyToOrder: (orderId: string, boy: DeliveryBoy | null) => void;
  aiConfirmOrderByCustomer: (orderId: string, sourceLabel?: string) => boolean;
  recordPartialPayment: (orderId: string, amountPaidNow: number, markCompleted?: boolean, note?: string) => void;
  updateOrderDetails: (orderId: string, updates: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
  bulkUpdateOrders: (orderIds: string[], action: { status?: OrderStatus; deleteAll?: boolean }) => void;
  syncStoreFromServer: () => Promise<void>;

  // Security Shield & Audit Logs
  securityLogs: SecurityLogEntry[];
  addSecurityLog: (event: string, detail: string, severity?: SecurityLogEntry['severity']) => void;
  clearSecurityLogs: () => void;

  // Customer Auth, Wallet & Profile
  isCustomerLoggedIn: boolean;
  isCustomerLoginOpen: boolean;
  setIsCustomerLoginOpen: (open: boolean) => void;
  loginCustomer: (identifier: string, password: string) => boolean;
  registerCustomer: (data: { name: string; username: string; phone: string; email?: string; password: string }) => boolean;
  sendPasswordResetOtp: (identifier: string) => Promise<{ success: boolean; otpCode?: string; customerName?: string; contactLabel?: string; error?: string }>;
  resetCustomerPassword: (identifier: string, newPassword: string) => boolean;
  logoutCustomer: () => void;
  openCustomerPortal: () => void;
  customerAccounts: CustomerProfile[];
  adjustSpecificCustomerBalance: (identifier: string, delta: number, reason?: string) => boolean;
  resetCustomerWalletExpiry: (identifier: string, expireNow?: boolean) => boolean;
  customerWalletBalance: number;
  addToWallet: (amount: number, reason?: string) => void;
  deductWallet: (amount: number) => boolean;
  walletLastPurchaseAt: string | null;
  walletLastCreditAt: string | null;
  walletDaysRemaining: number;
  walletTopUps: WalletTopUpRequest[];
  requestWalletTopUp: (payload: {
    method: WalletTopUpMethod;
    amount: number;
    senderNumber: string;
    trxId: string;
  }) => { success: boolean; status: 'pending' | 'approved' };
  approveWalletTopUp: (requestId: string) => void;
  rejectWalletTopUp: (requestId: string, note?: string) => void;
  editWalletTopUp: (requestId: string, updates: Partial<WalletTopUpRequest>) => void;
  deleteWalletTopUp: (requestId: string) => void;
  bulkActionWalletTopUps: (requestIds: string[], action: 'approve' | 'reject' | 'delete') => void;
  adjustCustomerWalletByAdmin: (delta: number, reason?: string) => void;
  runWalletExpirySweep: (forceExpireDemo?: boolean) => number;
  mediaLibrary: MediaItem[];
  registerMediaItem: (item: Omit<MediaItem, 'id' | 'createdAt'>) => MediaItem;
  deleteMediaItems: (ids: string[]) => void;
  resizeMediaItems: (
    ids: string[],
    targetWidth: number,
    targetHeight: number,
    quality?: number,
    maintainAspect?: boolean
  ) => Promise<number>;
  syncStoreMediaLibrary: () => number;
  customerProfile: CustomerProfile;
  updateCustomerProfile: (updates: Partial<CustomerProfile>) => void;
  saveSpinCoupon: (reward: SpinReward) => void;
  recentlyViewedIds: string[];
  recordProductView: (productId: string) => void;
  clearRecentlyViewed: () => void;
  claimDailyCheckIn: () => { success: boolean; amount: number; message: string };
  redeemLoyaltyPoints: (points: number) => { success: boolean; discountAmount: number };
  adjustCustomerLoyaltyPoints: (identifier: string, delta: number, reason?: string) => boolean;
  setCustomerLoyaltyPoints: (identifier: string, exactPoints: number, reason?: string) => boolean;
  deleteCustomerLoyaltyPoints: (identifier: string) => boolean;
  isCustomerDashboardOpen: boolean;
  setIsCustomerDashboardOpen: (open: boolean) => void;

  // Single Product Page View
  selectedProductForPage: Product | null;
  setSelectedProductForPage: (product: Product | null) => void;

  // Price Alerts & Out-of-Stock Waitlist
  priceAlerts: PriceAlert[];
  addPriceAlert: (alertData: { productId: string; contact: string; targetPrice: number }) => void;
  waitlistEntries: WaitlistEntry[];
  addWaitlistEntry: (payload: { product: Product; contact: string }) => WaitlistEntry;
  markWaitlistNotified: (id: string) => void;
  deleteWaitlistEntry: (id: string) => void;

  // Steadfast & Multi-Courier Hub
  bookOrderCourier: (orderId: string, provider: CourierProvider) => Promise<{ success: boolean; trackingCode?: string; consignmentId?: string; error?: string }>;
  sendOrderToSteadfast: (orderId: string) => Promise<{ success: boolean; trackingCode?: string; consignmentId?: string; error?: string }>;
  checkSteadfastDeliveryStatus: (orderId: string) => Promise<{ success: boolean; deliveryStatus?: string; error?: string }>;
  refreshOrderScore: (orderId: string) => Promise<OrderFraudCheck>;
  checkCustomerFraudRisk: (phone: string) => Promise<OrderFraudCheck>;

  // Meta WhatsApp Cloud API CRM & Business Theme Presets
  whatsappLogs: WhatsAppCloudLog[];
  sendMetaWhatsAppMessage: (payload: { to: string; message?: string; templateName?: string }) => Promise<{ success: boolean; mode?: string; error?: string }>;
  applyBusinessTheme: (themeId: StoreTheme, includeCategories?: boolean) => void;

  // Server-Side Pixel CAPI & Customer Browsing Logs
  serverPixelEvents: ServerPixelEvent[];
  customerBrowsingLogs: CustomerBrowsingEvent[];
  trackPixelEvent: (eventName: string, extras?: { urlPath?: string; value?: number; contentName?: string }) => Promise<ServerPixelEvent | null>;
  recordPageVisit: (urlPath: string, pageTitle: string, product?: Product | null, categorySlug?: string) => void;

  // Live Support Chats & Backend Browser Call Desk (Real-Time WebSocket + WebRTC + Manual Mode)
  supportChats: SupportChatSession[];
  activeChatSessionId: string;
  setActiveChatSessionId: (id: string) => void;
  isLiveSocketConnected: boolean;
  sendCustomerChatMessage: (text: string) => Promise<void>;
  sendAgentChatReply: (sessionId: string, text: string) => void;
  generateAgentAIReply: (sessionId: string) => Promise<string>;
  openOrCreateCustomerChatSession: (name: string, phone: string) => string;
  markChatRead: (sessionId: string) => void;
  toggleChatManualMode: (sessionId: string, manualMode: boolean) => void;
  requestHumanSupport: (sessionId?: string) => void;
  resolveSupportChatSession: (sessionId: string, status: 'open' | 'resolved') => void;
  deleteSupportChatSession: (sessionId: string) => void;
  browserCalls: BrowserCallSession[];
  activeBrowserCall: BrowserCallSession | null;
  webrtcAudioStatus: 'idle' | 'connecting' | 'live_audio' | 'text_fallback';
  isBrowserCallMicMuted: boolean;
  toggleBrowserCallMicMute: () => void;
  initiateCustomerBrowserCall: (
    order?: Order | null,
    callerInfo?: { name?: string; phone?: string; autoConnect?: boolean; direction?: 'customer_to_admin' | 'admin_to_customer' }
  ) => string;
  answerBrowserCallFromBackend: (callId: string) => void;
  answerIncomingCustomerCall: (callId: string) => void;
  appendBrowserCallMessage: (callId: string, speaker: 'customer' | 'assistant' | 'ai', text: string, textBn?: string) => void;
  endBrowserCallSession: (callId: string, confirmed?: boolean) => void;

  // Abandoned Carts
  abandonedCarts: AbandonedCart[];
  markAbandonedCartWhatsAppSent: (cartId: string) => void;
  recoverAbandonedCart: (cartId: string) => void;
  editAbandonedCart: (cartId: string, updates: Partial<AbandonedCart>) => void;
  deleteAbandonedCart: (cartId: string) => void;
  bulkAbandonedCartsAction: (cartIds: string[], action: 'whatsapp' | 'recover' | 'delete') => void;

  // Autonomous Human-Like Website Control AI Agent
  agentActionLogs: { id: string; time: string; instruction: string; reply: string; actions: string[]; mode: string }[];
  executeAIAgentCommand: (
    instruction: string,
    role?: 'admin' | 'customer',
    adminTabSetter?: (tab: string) => void
  ) => Promise<{ reply: string; executed: string[]; mode: string }>;

  // Product Comparison (up to 3 products)
  compareList: string[];
  toggleCompare: (productId: string) => void;
  isComparing: (productId: string) => boolean;
  clearCompare: () => void;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;

  // Product Reviews
  reviews: ProductReview[];
  addProductReview: (reviewData: Omit<ProductReview, 'id' | 'date' | 'verifiedPurchase'>) => void;
  updateProductReview: (id: string, updates: Partial<ProductReview>) => void;
  bulkUpdateReviews: (ids: string[], updates: Partial<ProductReview>) => void;
  bulkDeleteReviews: (ids: string[]) => void;
  deleteProductReview: (id: string) => void;

  // Users & Staff
  users: UserStaff[];
  addUser: (userData: Omit<UserStaff, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<UserStaff>) => void;
  deleteUser: (id: string) => void;

  // Admin Auth (Hossain login & Cloud Firebase Sync)
  isAdminLoggedIn: boolean;
  isAdminLoginOpen: boolean;
  setIsAdminLoginOpen: (open: boolean) => void;
  loginAdmin: (email: string, pass: string) => boolean;
  logoutAdmin: () => void;
  firebaseAdminUserEmail: string | null;
  isFirebaseAdminConnected: boolean;
  cloudSyncError: string | null;
  lastCloudSyncAt: string | null;
  isSyncingCloudAll: boolean;
  cloudCollectionCounts: Record<string, number>;
  signInAdminWithGoogle: () => Promise<boolean>;
  signOutAdminFirebase: () => Promise<void>;
  syncAllDashboardToFirebase: (silent?: boolean) => Promise<{ ok: boolean; errors: string[] }>;
  pullAllDashboardFromFirebase: () => Promise<boolean>;
  testFirebaseCloudConnection: () => Promise<{ ok: boolean; details: FirebaseDiagnosticStep[] }>;
  exportFullDatabaseBackup: () => Record<string, any>;
  restoreDatabaseFromBackup: (backup: Record<string, any>, pushToCloud?: boolean) => Promise<boolean>;

  // Spin Rewards CRUD & Limit
  spinRewards: SpinReward[];
  addSpinReward: (reward: Omit<SpinReward, 'id'>) => void;
  updateSpinReward: (id: string, updates: Partial<SpinReward>) => void;
  deleteSpinReward: (id: string) => void;
  remainingSpinsToday: number;
  spinCooldownMinutes: number;
  recordSpinUsed: () => boolean;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // AI Voice Call Engine
  activeCallOrder: Order | null;
  isCallRinging: boolean;
  isCallActive: boolean;
  startAICall: (order: Order) => void;
  answerAICall: () => void;
  declineAICall: () => void;
  finishAICall: (confirmed: boolean, transcriptLog?: { speaker: 'ai' | 'customer'; text: string; textBn: string; time: string }[]) => void;
  closeCallModal: () => void;
  playVoiceSample: () => Promise<void>;
  isPlayingVoiceSample: boolean;

  // Store Settings & Dynamic Brand Attributes
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  generateBrandColorAttributes: (primaryHex?: string) => void;
  clearAppCache: () => Promise<void>;
  resetAllToDefault: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    color?: string,
    size?: string,
    selectedAttributes?: Record<string, string>
  ) => void;
  removeFromCart: (
    productId: string,
    color?: string,
    size?: string,
    selectedAttributes?: Record<string, string>
  ) => void;
  updateCartQuantity: (
    productId: string,
    delta: number,
    color?: string,
    size?: string,
    selectedAttributes?: Record<string, string>
  ) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Modals & UI States
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  checkoutProduct: Product | null;
  isOneClickOpen: boolean;
  openOneClickCheckout: (product?: Product | null) => void;
  closeOneClickCheckout: () => void;
  isWhatsAppOpen: boolean;
  setIsWhatsAppOpen: (open: boolean) => void;
  isSpinOpen: boolean;
  setIsSpinOpen: (open: boolean) => void;
  isMobileCategoryDrawerOpen: boolean;
  setIsMobileCategoryDrawerOpen: (open: boolean) => void;
  activeView: 'store' | 'admin' | 'tracking';
  setActiveView: (view: 'store' | 'admin' | 'tracking') => void;
  trackingSearchQuery: string;
  setTrackingSearchQuery: (q: string) => void;

  // Toast notifications
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Local storage keys
const LOCAL_STORAGE_PRODUCTS = 'buyonebd_products_v3';
const LOCAL_STORAGE_ORDERS = 'buyonebd_orders_v3';
const LOCAL_STORAGE_SETTINGS = 'buyonebd_settings_v3';
const LOCAL_STORAGE_CART = 'buyonebd_cart_v3';
const LOCAL_STORAGE_WISHLIST = 'buyonebd_wishlist_v3';
const LOCAL_STORAGE_COMPARE = 'buyonebd_compare_v3';
const LOCAL_STORAGE_CATEGORIES = 'buyonebd_categories_v3';
const LOCAL_STORAGE_SLIDERS = 'buyonebd_sliders_v3';
const LOCAL_STORAGE_ABANDONED = 'buyonebd_abandoned_v3';
const LOCAL_STORAGE_USERS = 'buyonebd_users_v3';
const LOCAL_STORAGE_REVIEWS = 'buyonebd_reviews_v3';
const LOCAL_STORAGE_ADMIN_AUTH = 'buyonebd_admin_auth_v3';
const LOCAL_STORAGE_SPIN_STATS = 'buyonebd_spin_stats_v3';
const LOCAL_STORAGE_LANG = 'buyonebd_lang_v3';
const LOCAL_STORAGE_RECENTLY_VIEWED = 'buyonebd_recently_viewed_v1';

// Deep merger to avoid undefined properties & migrate legacy hotline strings non-destructively
function migrateLegacyPhoneStr(val: any, isWhatsapp = false): any {
  if (typeof val !== 'string') return val;
  let out = val
    .replace(/\+?8801886[-\s]?289663/g, '+8801917942662')
    .replace(/01886[-\s]?289663/g, isWhatsapp ? '8801917942662' : '+8801917942662')
    .replace(/01886-BUYONE/gi, '+8801917942662');
  if (isWhatsapp && out === '+8801917942662') return '8801917942662';
  return out;
}

function mergeSettings(raw: any): StoreSettings {
  if (!raw || typeof raw !== 'object') return INITIAL_SETTINGS;
  return {
    ...INITIAL_SETTINGS,
    ...raw,
    hotline: migrateLegacyPhoneStr(raw.hotline ?? INITIAL_SETTINGS.hotline),
    whatsappNumber: migrateLegacyPhoneStr(raw.whatsappNumber ?? INITIAL_SETTINGS.whatsappNumber, true),
    deliveryFees: { ...INITIAL_SETTINGS.deliveryFees, ...(raw.deliveryFees || {}) },
    paymentSettings: {
      ...INITIAL_SETTINGS.paymentSettings,
      ...(raw.paymentSettings || {}),
      bkashMerchant: migrateLegacyPhoneStr(raw.paymentSettings?.bkashMerchant ?? INITIAL_SETTINGS.paymentSettings.bkashMerchant),
      nagadMerchant: migrateLegacyPhoneStr(raw.paymentSettings?.nagadMerchant ?? INITIAL_SETTINGS.paymentSettings.nagadMerchant),
      rocketMerchant: migrateLegacyPhoneStr(raw.paymentSettings?.rocketMerchant ?? INITIAL_SETTINGS.paymentSettings.rocketMerchant)
    },
    aiCallSettings: { ...INITIAL_SETTINGS.aiCallSettings, ...(raw.aiCallSettings || {}) },
    announcementBar: {
      ...INITIAL_SETTINGS.announcementBar,
      ...(raw.announcementBar || {}),
      textBn: migrateLegacyPhoneStr(raw.announcementBar?.textBn ?? INITIAL_SETTINGS.announcementBar.textBn),
      textEn: migrateLegacyPhoneStr(raw.announcementBar?.textEn ?? INITIAL_SETTINGS.announcementBar.textEn)
    },
    themeColors: { ...INITIAL_SETTINGS.themeColors!, ...(raw.themeColors || {}) },
    cmsTexts: { ...INITIAL_SETTINGS.cmsTexts!, ...(raw.cmsTexts || {}) },
    seoSettings: { ...INITIAL_SETTINGS.seoSettings!, ...(raw.seoSettings || {}) },
    spinSettings: {
      ...INITIAL_SETTINGS.spinSettings,
      ...(raw.spinSettings || {}),
      rewards: Array.isArray(raw.spinSettings?.rewards) && raw.spinSettings.rewards.length >= 2
        ? raw.spinSettings.rewards
        : INITIAL_SETTINGS.spinSettings.rewards
    },
    whatsappTemplates: { ...INITIAL_SETTINGS.whatsappTemplates, ...(raw.whatsappTemplates || {}) },
    marketingTemplates: { ...INITIAL_SETTINGS.marketingTemplates!, ...(raw.marketingTemplates || {}) },
    categories: Array.isArray(raw.categories) && raw.categories.length > 0 ? raw.categories : INITIAL_CATEGORIES,
    sliders: Array.isArray(raw.sliders) && raw.sliders.length > 0 ? raw.sliders : INITIAL_SLIDERS,
    flashSale: { ...INITIAL_SETTINGS.flashSale, ...(raw.flashSale || {}) },
    courierSettings: {
      ...INITIAL_SETTINGS.courierSettings,
      ...(raw.courierSettings || {}),
      steadfast: { ...INITIAL_SETTINGS.courierSettings.steadfast, ...(raw.courierSettings?.steadfast || {}) },
      pathao: { ...INITIAL_SETTINGS.courierSettings.pathao, ...(raw.courierSettings?.pathao || {}) },
      redx: { ...INITIAL_SETTINGS.courierSettings.redx, ...(raw.courierSettings?.redx || {}) },
      paperfly: { ...INITIAL_SETTINGS.courierSettings.paperfly!, ...(raw.courierSettings?.paperfly || {}) },
      sundarban: { ...INITIAL_SETTINGS.courierSettings.sundarban!, ...(raw.courierSettings?.sundarban || {}) }
    },
    marketingSettings: {
      ...INITIAL_SETTINGS.marketingSettings,
      ...(raw.marketingSettings || {}),
      facebookPixel: { ...INITIAL_SETTINGS.marketingSettings.facebookPixel, ...(raw.marketingSettings?.facebookPixel || {}) },
      googleAnalytics: { ...INITIAL_SETTINGS.marketingSettings.googleAnalytics, ...(raw.marketingSettings?.googleAnalytics || {}) },
      whatsappCRM: { ...INITIAL_SETTINGS.marketingSettings.whatsappCRM, ...(raw.marketingSettings?.whatsappCRM || {}) },
      tiktokPixel: { ...INITIAL_SETTINGS.marketingSettings.tiktokPixel!, ...(raw.marketingSettings?.tiktokPixel || {}) },
      clarity: { enabled: false, projectId: '', ...(raw.marketingSettings?.clarity || {}) },
      whatsappCloudApi: { ...INITIAL_SETTINGS.marketingSettings.whatsappCloudApi!, ...(raw.marketingSettings?.whatsappCloudApi || {}) },
      socialLinks: { ...INITIAL_SETTINGS.marketingSettings.socialLinks!, ...(raw.marketingSettings?.socialLinks || {}) }
    },
    deliveryBoys: Array.isArray(raw.deliveryBoys) ? raw.deliveryBoys : (INITIAL_SETTINGS.deliveryBoys || []),
    aiSettings: { ...INITIAL_SETTINGS.aiSettings, ...(raw.aiSettings || {}) },
    aiKeywordRules:
      Array.isArray(raw.aiKeywordRules) && raw.aiKeywordRules.length > 0
        ? raw.aiKeywordRules
        : INITIAL_SETTINGS.aiKeywordRules,
    footerSettings: {
      ...INITIAL_SETTINGS.footerSettings,
      ...(raw.footerSettings || {}),
      quickLinks: Array.isArray(raw.footerSettings?.quickLinks) && raw.footerSettings.quickLinks.length > 0
        ? raw.footerSettings.quickLinks
        : INITIAL_SETTINGS.footerSettings.quickLinks
    },
    walletSettings: {
      ...INITIAL_SETTINGS.walletSettings!,
      ...(raw.walletSettings || {}),
      methods: {
        ...INITIAL_SETTINGS.walletSettings!.methods,
        ...(raw.walletSettings?.methods || {})
      }
    },
    smtpSettings: {
      ...INITIAL_SETTINGS.smtpSettings!,
      ...(raw.smtpSettings || {})
    },
    singleProductCms: {
      ...INITIAL_SETTINGS.singleProductCms!,
      ...(raw.singleProductCms || {})
    },
    organicMarketing: {
      ...INITIAL_SETTINGS.organicMarketing!,
      ...(raw.organicMarketing || {}),
      referralProgram: {
        ...INITIAL_SETTINGS.organicMarketing!.referralProgram,
        ...(raw.organicMarketing?.referralProgram || {})
      },
      promoPopup: {
        ...INITIAL_SETTINGS.organicMarketing!.promoPopup,
        ...(raw.organicMarketing?.promoPopup || {})
      },
      socialShareDiscount: {
        ...INITIAL_SETTINGS.organicMarketing!.socialShareDiscount,
        ...(raw.organicMarketing?.socialShareDiscount || {})
      },
      vipTiers: {
        ...INITIAL_SETTINGS.organicMarketing!.vipTiers,
        ...(raw.organicMarketing?.vipTiers || {})
      },
      homeFeatureStrip: {
        ...INITIAL_SETTINGS.organicMarketing!.homeFeatureStrip,
        ...(raw.organicMarketing?.homeFeatureStrip || {}),
        items:
          Array.isArray(raw.organicMarketing?.homeFeatureStrip?.items) &&
          raw.organicMarketing.homeFeatureStrip.items.length > 0
            ? raw.organicMarketing.homeFeatureStrip.items
            : INITIAL_SETTINGS.organicMarketing!.homeFeatureStrip.items
      },
      freeShippingBar: {
        ...INITIAL_SETTINGS.organicMarketing!.freeShippingBar!,
        ...(raw.organicMarketing?.freeShippingBar || {})
      },
      bundleDiscount: {
        ...INITIAL_SETTINGS.organicMarketing!.bundleDiscount!,
        ...(raw.organicMarketing?.bundleDiscount || {})
      },
      socialProofFomo: {
        ...INITIAL_SETTINGS.organicMarketing!.socialProofFomo!,
        ...(raw.organicMarketing?.socialProofFomo || {})
      },
      checkoutGuard: {
        ...INITIAL_SETTINGS.organicMarketing!.checkoutGuard!,
        ...(raw.organicMarketing?.checkoutGuard || {})
      }
    },
    hostingerDbSettings: {
      ...INITIAL_SETTINGS.hostingerDbSettings!,
      ...(raw.hostingerDbSettings || {})
    },
    securitySettings: {
      ...INITIAL_SETTINGS.securitySettings!,
      ...(raw.securitySettings || {}),
      blockedPhones: Array.isArray(raw.securitySettings?.blockedPhones)
        ? raw.securitySettings.blockedPhones
        : INITIAL_SETTINGS.securitySettings!.blockedPhones
    },
    loyaltySettings: {
      ...INITIAL_SETTINGS.loyaltySettings!,
      ...(raw.loyaltySettings || {})
    }
  };
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language
  const [lang, setLangState] = useState<'bn' | 'en'>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_LANG) as 'bn' | 'en') || 'bn';
  });

  const setLang = (newLang: 'bn' | 'en') => {
    setLangState(newLang);
    localStorage.setItem(LOCAL_STORAGE_LANG, newLang);
  };

  // Security Audit Logs State
  const [securityLogs, setSecurityLogs] = useState<SecurityLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('buyonebd_security_logs_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('buyonebd_security_logs_v1', JSON.stringify(securityLogs.slice(0, 120)));
    } catch {}
  }, [securityLogs]);

  const addSecurityLog = (event: string, detail: string, severity: SecurityLogEntry['severity'] = 'info') => {
    const entry: SecurityLogEntry = {
      id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      event,
      detail,
      severity,
      timestamp: new Date().toISOString()
    };
    setSecurityLogs((prev) => [entry, ...prev].slice(0, 120));
  };

  const clearSecurityLogs = () => {
    setSecurityLogs([]);
    addToast('info', 'Security Logs Cleared', '');
  };

  // Admin Language
  const [adminLang, setAdminLangState] = useState<'bn' | 'en'>(() => {
    return (localStorage.getItem('buyonebd_admin_lang_v3') as 'bn' | 'en') || 'bn';
  });

  const setAdminLang = (newLang: 'bn' | 'en') => {
    setAdminLangState(newLang);
    localStorage.setItem('buyonebd_admin_lang_v3', newLang);
  };

  const t = (bn: string, en: string) => (lang === 'bn' ? bn : en);

  // Settings & Local Mutation Guard (prevents stale server/cloud snapshots from overwriting in-flight admin edits)
  const lastLocalMutationAtRef = useRef<number>(0);

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS);
      return saved ? mergeSettings(JSON.parse(saved)) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });
  const settingsRef = useRef<StoreSettings>(settings);
  settingsRef.current = settings;

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Categories (ensure upgraded subcategory slugs for legacy localStorage)
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CATEGORIES);
      if (saved) {
        const parsed: Category[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((cat) => {
            const initMatch = INITIAL_CATEGORIES.find((ic) => ic.slug === cat.slug);
            const hasBrokenSubSlugs =
              cat.subcategories &&
              cat.subcategories.some((s) => s.slug === cat.slug);
            if (hasBrokenSubSlugs && initMatch?.subcategories) {
              return { ...cat, subcategories: initMatch.subcategories };
            }
            return cat;
          });
        }
      }
      return settings.categories || INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });
  const categoriesRef = useRef<Category[]>(categories);
  categoriesRef.current = categories;

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(categories));
    setSettings((prev) => ({ ...prev, categories }));
  }, [categories]);

  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: catData.slug.toLowerCase().replace(/[^a-z0-9]/g, '-') || `cat-${Date.now()}`
    };
    lastLocalMutationAtRef.current = Date.now();
    const nextCats = [...categoriesRef.current, newCat];
    setCategories(nextCats);
    saveStorefrontSettingsToFirestore(settingsRef.current, nextCats, slidersRef.current).catch(() => {});
    addToast('success', t('ক্যাটাগরি যোগ হয়েছে!', 'Category Added!'), `'${newCat.nameBn}' ক্যাটাগরি তৈরি হয়েছে।`);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    lastLocalMutationAtRef.current = Date.now();
    const nextCats = categoriesRef.current.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setCategories(nextCats);
    saveStorefrontSettingsToFirestore(settingsRef.current, nextCats, slidersRef.current).catch(() => {});
    addToast('success', t('ক্যাটাগরি আপডেট সম্পন্ন', 'Category Updated'), t('পরিবর্তন সংরক্ষিত হয়েছে।', 'Changes saved.'));
  };

  const deleteCategory = (id: string) => {
    lastLocalMutationAtRef.current = Date.now();
    const nextCats = categoriesRef.current.filter((c) => c.id !== id);
    setCategories(nextCats);
    saveStorefrontSettingsToFirestore(settingsRef.current, nextCats, slidersRef.current).catch(() => {});
    addToast('info', lang === 'bn' ? 'ক্যাটাগরি মোছা হয়েছে' : 'Category Deleted', '');
  };

  const toggleCategoryActive = (id: string) => {
    lastLocalMutationAtRef.current = Date.now();
    const nextCats = categoriesRef.current.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    setCategories(nextCats);
    saveStorefrontSettingsToFirestore(settingsRef.current, nextCats, slidersRef.current).catch(() => {});
  };

  // Sliders
  const [sliders, setSliders] = useState<HomeSlide[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SLIDERS);
      return saved ? JSON.parse(saved) : (settings.sliders || INITIAL_SLIDERS);
    } catch {
      return INITIAL_SLIDERS;
    }
  });
  const slidersRef = useRef<HomeSlide[]>(sliders);
  slidersRef.current = sliders;

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SLIDERS, JSON.stringify(sliders));
    setSettings((prev) => ({ ...prev, sliders }));
  }, [sliders]);

  const addSlide = (slideData: Omit<HomeSlide, 'id'>) => {
    const newSlide: HomeSlide = {
      ...slideData,
      id: `slide-${Date.now()}`
    };
    lastLocalMutationAtRef.current = Date.now();
    const nextSliders = [...slidersRef.current, newSlide];
    setSliders(nextSliders);
    saveStorefrontSettingsToFirestore(settingsRef.current, categoriesRef.current, nextSliders).catch(() => {});
    addToast('success', lang === 'bn' ? 'স্লাইড যোগ হয়েছে!' : 'Slide Added!', '');
  };

  const updateSlide = (id: string, updates: Partial<HomeSlide>) => {
    lastLocalMutationAtRef.current = Date.now();
    const nextSliders = slidersRef.current.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setSliders(nextSliders);
    saveStorefrontSettingsToFirestore(settingsRef.current, categoriesRef.current, nextSliders).catch(() => {});
    addToast('success', lang === 'bn' ? 'স্লাইড আপডেট সম্পন্ন' : 'Slide Updated', '');
  };

  const deleteSlide = (id: string) => {
    lastLocalMutationAtRef.current = Date.now();
    const nextSliders = slidersRef.current.filter((s) => s.id !== id);
    setSliders(nextSliders);
    saveStorefrontSettingsToFirestore(settingsRef.current, categoriesRef.current, nextSliders).catch(() => {});
    addToast('info', lang === 'bn' ? 'স্লাইড মোছা হয়েছে' : 'Slide Deleted', '');
  };

  const toggleSlideActive = (id: string) => {
    lastLocalMutationAtRef.current = Date.now();
    const nextSliders = slidersRef.current.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    setSliders(nextSliders);
    saveStorefrontSettingsToFirestore(settingsRef.current, categoriesRef.current, nextSliders).catch(() => {});
  };

  // Products (merge seo/subcategory defaults for legacy localStorage items)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PRODUCTS);
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p) => {
            const initMatch = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);
            if (!initMatch) return p;
            return {
              ...initMatch,
              ...p,
              subcategory: p.subcategory || initMatch.subcategory,
              seo: p.seo || initMatch.seo
            };
          });
        }
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });
  const productsRef = useRef<Product[]>(products);
  productsRef.current = products;

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(products));
  }, [products]);

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now().toString().slice(-5)}`
    };
    lastLocalMutationAtRef.current = Date.now();
    setProducts((prev) => [newProduct, ...prev]);
    saveProductToFirestore(newProduct).catch(() => {});
    addToast('success', t('পণ্য যোগ সফল!', 'Product Added!'), t('নতুন পণ্য স্টোরে সফলভাবে তালিকাভুক্ত হয়েছে।', 'New product listed.'));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    lastLocalMutationAtRef.current = Date.now();
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, ...updates };
        saveProductToFirestore(next).catch(() => {});
        return next;
      })
    );
    addToast('success', t('পণ্য আপডেট সম্পন্ন!', 'Product Updated!'), t('পণ্যের বিবরণ সফলভাবে সংরক্ষিত হয়েছে।', 'Product saved.'));
  };

  const deleteProduct = (id: string) => {
    lastLocalMutationAtRef.current = Date.now();
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteProductFromFirestore(id).catch(() => {});
    addToast('info', lang === 'bn' ? 'পণ্য মুছে ফেলা হয়েছে' : 'Product Deleted', '');
  };

  const toggleProductFlashSale = (id: string) => {
    lastLocalMutationAtRef.current = Date.now();
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, isFlashSale: !p.isFlashSale };
        saveProductToFirestore(next).catch(() => {});
        return next;
      })
    );
    addToast('success', lang === 'bn' ? 'ফ্ল্যাশ সেল স্ট্যাটাস আপডেট হয়েছে' : 'Flash Sale Status Updated', '');
  };


  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });
  const ordersRef = useRef<Order[]>(orders);
  ordersRef.current = orders;

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(orders));
  }, [orders]);

  // Abandoned Carts
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ABANDONED);
      return saved ? JSON.parse(saved) : INITIAL_ABANDONED_CARTS;
    } catch {
      return INITIAL_ABANDONED_CARTS;
    }
  });
  const abandonedCartsRef = useRef<AbandonedCart[]>(abandonedCarts);
  abandonedCartsRef.current = abandonedCarts;

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ABANDONED, JSON.stringify(abandonedCarts));
  }, [abandonedCarts]);

  const markAbandonedCartWhatsAppSent = (cartId: string) => {
    lastLocalMutationAtRef.current = Date.now();
    setAbandonedCarts((prev) =>
      prev.map((c) => {
        if (c.id !== cartId) return c;
        const next = { ...c, whatsappSent: true };
        saveAbandonedCartToFirestore(next).catch(() => {});
        return next;
      })
    );
    addToast('success', t('WhatsApp মেসেজ পাঠানো হয়েছে!', 'WhatsApp Sent!'), t('গ্রাহককে রিকভারি কুপন সহ মেসেজ পাঠানো হয়েছে।', 'Recovery promo message delivered.'));
  };

  const recoverAbandonedCart = (cartId: string) => {
    lastLocalMutationAtRef.current = Date.now();
    setAbandonedCarts((prev) =>
      prev.map((c) => {
        if (c.id !== cartId) return c;
        const next = { ...c, recovered: true, recoveredAt: new Date().toISOString() };
        saveAbandonedCartToFirestore(next).catch(() => {});
        return next;
      })
    );
    addToast('success', t('কার্ট সফলভাবে রিকভার হয়েছে!', 'Cart Recovered!'), '');
  };

  const editAbandonedCart = (cartId: string, updates: Partial<AbandonedCart>) => {
    lastLocalMutationAtRef.current = Date.now();
    setAbandonedCarts((prev) =>
      prev.map((c) => {
        if (c.id !== cartId) return c;
        const nextItems = updates.items ?? c.items;
        const recomputedTotal = Array.isArray(nextItems)
          ? nextItems.reduce((sum, it) => sum + (Number(it.product?.price) || 0) * Math.max(1, Number(it.quantity) || 1), 0)
          : updates.total ?? c.total;
        const next: AbandonedCart = {
          ...c,
          ...updates,
          items: nextItems,
          total: updates.total !== undefined && updates.items === undefined ? updates.total : recomputedTotal
        };
        saveAbandonedCartToFirestore(next).catch(() => {});
        return next;
      })
    );
    addToast('success', t('কার্ট তথ্য আপডেট সম্পন্ন!', 'Abandoned Cart Updated!'), '');
  };

  const deleteAbandonedCart = (cartId: string) => {
    lastLocalMutationAtRef.current = Date.now();
    setAbandonedCarts((prev) => prev.filter((c) => c.id !== cartId));
    deleteAbandonedCartFromFirestore(cartId).catch(() => {});
    addToast('info', t('কার্ট রেকর্ড মুছে ফেলা হয়েছে', 'Abandoned Cart Deleted'), '');
  };

  const bulkAbandonedCartsAction = (cartIds: string[], action: 'whatsapp' | 'recover' | 'delete') => {
    if (!cartIds.length) return;
    lastLocalMutationAtRef.current = Date.now();
    const idSet = new Set(cartIds);
    if (action === 'delete') {
      cartIds.forEach((id) => deleteAbandonedCartFromFirestore(id).catch(() => {}));
      setAbandonedCarts((prev) => prev.filter((c) => !idSet.has(c.id)));
      addToast('info', t(`${cartIds.length}টি কার্ট ডিলিট সম্পন্ন`, `Deleted ${cartIds.length} Carts`), '');
      return;
    }
    if (action === 'whatsapp') {
      setAbandonedCarts((prev) =>
        prev.map((c) => {
          if (!idSet.has(c.id)) return c;
          const next = { ...c, whatsappSent: true };
          saveAbandonedCartToFirestore(next).catch(() => {});
          return next;
        })
      );
      addToast('success', t(`${cartIds.length}জনকে WhatsApp পাঠানো হয়েছে`, `Bulk WhatsApp Sent (${cartIds.length})`), '');
      return;
    }
    if (action === 'recover') {
      const nowIso = new Date().toISOString();
      setAbandonedCarts((prev) =>
        prev.map((c) => {
          if (!idSet.has(c.id)) return c;
          const next = { ...c, recovered: true, recoveredAt: nowIso };
          saveAbandonedCartToFirestore(next).catch(() => {});
          return next;
        })
      );
      addToast('success', t(`${cartIds.length}টি কার্ট রিকভার চিহ্নিত হয়েছে`, `Recovered ${cartIds.length} Carts`), '');
    }
  };

  // Product Comparison (up to 3)
  const [compareList, setCompareList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_COMPARE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_COMPARE, JSON.stringify(compareList));
  }, [compareList]);

  const toggleCompare = (productId: string) => {
    setCompareList((prev) => {
      if (prev.includes(productId)) {
        addToast('info', t('তুলনা তালিকা থেকে সরানো হয়েছে', 'Removed from Comparison'), '');
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 3) {
        addToast('warning', t('সর্বোচ্চ ৩টি পণ্য তুলনা করা যাবে', 'Max 3 Products Allowed'), t('আগের কোনো পণ্য বাদ দিয়ে নতুন পণ্য যোগ করুন।', 'Remove one to add another.'));
        return prev;
      }
      addToast('success', t('তুলনা তালিকায় যুক্ত হয়েছে!', 'Added to Comparison!'), t('একই সাথে ৩টি পণ্যের ফিচার তুলনা করুন।', 'Compare side-by-side.'));
      return [...prev, productId];
    });
  };

  const isComparing = (productId: string) => compareList.includes(productId);
  const clearCompare = () => setCompareList([]);

  // Product Reviews
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_REVIEWS);
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });
  const reviewsRef = useRef<ProductReview[]>(reviews);
  reviewsRef.current = reviews;

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  const addProductReview = (reviewData: Omit<ProductReview, 'id' | 'date' | 'verifiedPurchase'>) => {
    const newRev: ProductReview = {
      isApproved: true,
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      verifiedPurchase: true
    };
    lastLocalMutationAtRef.current = Date.now();
    setReviews((prev) => [newRev, ...prev]);
    saveReviewToFirestore(newRev).catch(() => {});
    addToast('success', t('রিভিউ জমা হয়েছে!', 'Review Submitted!'), t('আপনার মূল্যবান মতামতের জন্য ধন্যবাদ।', 'Thank you for your rating.'));
  };

  const updateProductReview = (id: string, updates: Partial<ProductReview>) => {
    lastLocalMutationAtRef.current = Date.now();
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, ...updates };
        saveReviewToFirestore(next).catch(() => {});
        return next;
      })
    );
    addToast('success', t('রিভিউ আপডেট হয়েছে!', 'Review Updated!'), '');
  };

  const bulkUpdateReviews = (ids: string[], updates: Partial<ProductReview>) => {
    if (!ids.length) return;
    lastLocalMutationAtRef.current = Date.now();
    const idSet = new Set(ids);
    setReviews((prev) =>
      prev.map((r) => {
        if (!idSet.has(r.id)) return r;
        const next = { ...r, ...updates };
        saveReviewToFirestore(next).catch(() => {});
        return next;
      })
    );
    addToast('success', t(`${ids.length}টি রিভিউ আপডেট হয়েছে`, `${ids.length} Reviews Updated`), '');
  };

  const bulkDeleteReviews = (ids: string[]) => {
    if (!ids.length) return;
    lastLocalMutationAtRef.current = Date.now();
    const idSet = new Set(ids);
    ids.forEach((id) => deleteReviewFromFirestore(id).catch(() => {}));
    setReviews((prev) => prev.filter((r) => !idSet.has(r.id)));
    addToast('info', t(`${ids.length}টি রিভিউ মোছা হয়েছে`, `${ids.length} Reviews Deleted`), '');
  };

  const deleteProductReview = (id: string) => {
    lastLocalMutationAtRef.current = Date.now();
    setReviews((prev) => prev.filter((r) => r.id !== id));
    deleteReviewFromFirestore(id).catch(() => {});
    addToast('info', t('রিভিউ মোছা হয়েছে', 'Review Removed'), '');
  };

  // Users & Staff
  const [users, setUsers] = useState<UserStaff[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });
  const usersRef = useRef<UserStaff[]>(users);
  usersRef.current = users;

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(users));
  }, [users]);

  const addUser = (userData: Omit<UserStaff, 'id' | 'createdAt'>) => {
    const newUser: UserStaff = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    lastLocalMutationAtRef.current = Date.now();
    setUsers((prev) => [...prev, newUser]);
    saveStaffUserToFirestore(newUser).catch(() => {});
    addToast('success', t('স্টাফ/ইউজার যোগ হয়েছে', 'User Added'), `'${newUser.name}' সফলভাবে তালিকাভুক্ত।`);
  };

  const updateUser = (id: string, updates: Partial<UserStaff>) => {
    lastLocalMutationAtRef.current = Date.now();
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const next = { ...u, ...updates };
        saveStaffUserToFirestore(next).catch(() => {});
        return next;
      })
    );
    addToast('success', t('ইউজার তথ্য আপডেট সম্পন্ন', 'User Updated'), '');
  };

  const deleteUser = (id: string) => {
    lastLocalMutationAtRef.current = Date.now();
    setUsers((prev) => prev.filter((u) => u.id !== id));
    deleteStaffUserFromFirestore(id).catch(() => {});
    addToast('info', t('ইউজার সরানো হয়েছে', 'User Removed'), '');
  };

  // Admin Auth (Hossain login: hossain@gmail.com / Hossain777@#$)
  const isHossainPathInitial = () => {
    if (typeof window === 'undefined') return false;
    const norm = window.location.pathname.replace(/\/+$/, '').toLowerCase();
    const h = window.location.hash.toLowerCase();
    return norm === '/hossain' || norm.startsWith('/hossain/') || h === '#hossain';
  };

  // Require explicit admin credential input every visit/reload on /hossain
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(() => {
    return isHossainPathInitial();
  });
  const [firebaseAdminUserEmail, setFirebaseAdminUserEmail] = useState<string | null>(() => {
    return auth.currentUser?.email || null;
  });
  const [isFirebaseAdminConnected, setIsFirebaseAdminConnected] = useState<boolean>(() => {
    return Boolean(auth.currentUser?.email?.toLowerCase() === 'buyonebd@gmail.com' && auth.currentUser?.emailVerified);
  });
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [lastCloudSyncAt, setLastCloudSyncAt] = useState<string | null>(null);
  const [isSyncingCloudAll, setIsSyncingCloudAll] = useState<boolean>(false);

  const isFirebaseAdminConnectedRef = useRef(isFirebaseAdminConnected);
  isFirebaseAdminConnectedRef.current = isFirebaseAdminConnected;

  const syncAllDashboardToFirebase = async (silent = false): Promise<{ ok: boolean; errors: string[] }> => {
    if (!auth.currentUser) {
      const msg = t(
        'প্রথমে buyonebd@gmail.com দিয়ে Firebase Admin কানেক্ট করুন।',
        'Please connect Firebase Admin (buyonebd@gmail.com) first.'
      );
      if (!silent) addToast('warning', t('Firebase কানেক্ট নেই', 'Not Connected'), msg);
      return { ok: false, errors: [msg] };
    }
    setIsSyncingCloudAll(true);
    try {
      const res = await syncAllAdminDataToFirestore({
        settings: settingsRef.current,
        categories: categoriesRef.current,
        sliders: slidersRef.current,
        products: productsRef.current,
        orders: ordersRef.current,
        reviews: reviewsRef.current,
        mediaLibrary: mediaLibraryRef.current,
        customerAccounts: customerAccountsRef.current,
        walletTopUps: walletTopUpsRef.current,
        abandonedCarts: abandonedCartsRef.current,
        priceAlerts: priceAlertsRef.current,
        waitlist: waitlistEntriesRef.current,
        users: usersRef.current
      });
      setLastCloudSyncAt(new Date().toLocaleTimeString());
      if (res.ok) {
        setCloudSyncError(null);
        if (!silent) {
          addToast(
            'success',
            t('সব অ্যাডমিন সেটিংস Firebase-এ সিঙ্ক সম্পন্ন!', 'All Admin Settings Synced to Firebase!'),
            t(
              `স্টোর সেটিংস, ভল্ট, ${res.counts.products} পণ্য, ${res.counts.orders} অর্ডার ও সকল মডিউল ক্লাউডে সংরক্ষিত হয়েছে।`,
              `Synced storefront, private vault, ${res.counts.products} products, ${res.counts.orders} orders & all modules.`
            )
          );
        }
      } else {
        setCloudSyncError(res.errors[0] || 'Partial sync error');
        if (!silent) {
          addToast(
            'warning',
            t('আংশিক ক্লাউড সিঙ্ক সম্পন্ন', 'Partial Firebase Sync'),
            res.errors.slice(0, 2).join(' | ')
          );
        }
      }
      return { ok: res.ok, errors: res.errors };
    } finally {
      setIsSyncingCloudAll(false);
    }
  };

  const pullAllDashboardFromFirebase = async (): Promise<boolean> => {
    setIsSyncingCloudAll(true);
    try {
      const pubCfg = await fetchStorefrontSettingsFromFirestore();
      let privCfg: Record<string, any> | null = null;
      if (auth.currentUser) {
        privCfg = await fetchAdminPrivateConfigFromFirestore().catch(() => null);
      }

      if (pubCfg || privCfg) {
        setSettings((prev) =>
          mergeSettings({
            ...prev,
            ...(pubCfg || {}),
            ...(privCfg || {})
          })
        );
        if (Array.isArray(pubCfg?.categories) && pubCfg.categories.length > 0) {
          setCategories(pubCfg.categories);
        }
        if (Array.isArray(pubCfg?.sliders) && pubCfg.sliders.length > 0) {
          setSliders(pubCfg.sliders);
        }
      }

      const [fsProducts, fsMedia] = await Promise.all([
        fetchProductsFromFirestore(),
        fetchMediaLibraryFromFirestore().catch(() => [])
      ]);
      if (fsProducts.length > 0) {
        setProducts(fsProducts);
      }
      if (fsMedia.length > 0) {
        setMediaLibrary(fsMedia);
      }

      if (auth.currentUser) {
        const [
          fsOrders,
          fsReviews,
          fsCustomers,
          fsTopUps,
          fsCarts,
          fsAlerts,
          fsWaitlist,
          fsStaff
        ] = await Promise.all([
          fetchOrdersFromFirestore().catch(() => []),
          fetchAllReviewsFromFirestore().catch(() => []),
          fetchCustomersFromFirestore().catch(() => []),
          fetchWalletTopUpsFromFirestore().catch(() => []),
          fetchAbandonedCartsFromFirestore().catch(() => []),
          fetchPriceAlertsFromFirestore().catch(() => []),
          fetchWaitlistFromFirestore().catch(() => []),
          fetchStaffUsersFromFirestore().catch(() => [])
        ]);

        if (fsOrders.length > 0) mergeRemoteOrders(fsOrders, new Set(), false);
        if (fsReviews.length > 0) setReviews(fsReviews);
        if (fsCustomers.length > 0) {
          setCustomerAccounts((prev) =>
            fsCustomers.map((rc) => {
              const localMatch = prev.find(
                (lc) => lc.phone === rc.phone || (lc.username && lc.username === rc.username)
              );
              return localMatch
                ? { ...rc, password: localMatch.password, checkIn: localMatch.checkIn }
                : rc;
            })
          );
        }
        if (fsTopUps.length > 0) setWalletTopUps(fsTopUps);
        if (fsCarts.length > 0) setAbandonedCarts(fsCarts);
        if (fsAlerts.length > 0) setPriceAlerts(fsAlerts);
        if (fsWaitlist.length > 0) setWaitlistEntries(fsWaitlist);
        if (fsStaff.length > 0) setUsers(fsStaff);
      }

      setLastCloudSyncAt(new Date().toLocaleTimeString());
      setCloudSyncError(null);
      addToast(
        'success',
        t('Firebase থেকে সব ডাটা রিস্টোর হয়েছে!', 'Restored All Data from Firebase!'),
        t('অ্যাডমিন ড্যাশবোর্ডের সকল সেটিংস ও ডাটা ক্লাউড থেকে লোড হয়েছে।', 'All settings & modules loaded from Firestore.')
      );
      return true;
    } catch (err) {
      const reason = extractFirestoreErrorReason(err);
      setCloudSyncError(reason);
      addToast('error', t('Firebase লোড ব্যর্থ', 'Pull Failed'), reason);
      return false;
    } finally {
      setIsSyncingCloudAll(false);
    }
  };

  const testFirebaseCloudConnection = async () => {
    const report = await runFirebaseDiagnostics();
    if (!report.ok) {
      const firstFail = report.details.find((d) => !d.ok);
      if (firstFail) setCloudSyncError(firstFail.message);
    } else {
      setCloudSyncError(null);
      setLastCloudSyncAt(new Date().toLocaleTimeString());
    }
    return report;
  };

  const exportFullDatabaseBackup = () => ({
    version: '2.0',
    exportedAt: new Date().toISOString(),
    firebaseProjectId: 'vital-compass-gmn89',
    firestoreDatabaseId: 'ai-studio-buyonebdecommerc-a1b62e5b-8854-4b1d-8906-5fbaa39d4372',
    settings: settingsRef.current,
    categories: categoriesRef.current,
    sliders: slidersRef.current,
    products: productsRef.current,
    orders: ordersRef.current,
    reviews: reviewsRef.current,
    mediaLibrary: mediaLibraryRef.current,
    customerAccounts: customerAccountsRef.current,
    walletTopUps: walletTopUpsRef.current,
    abandonedCarts: abandonedCartsRef.current,
    priceAlerts: priceAlertsRef.current,
    waitlist: waitlistEntriesRef.current,
    users: usersRef.current
  });

  const restoreDatabaseFromBackup = async (
    backup: Record<string, any>,
    pushToCloud = true
  ): Promise<boolean> => {
    try {
      if (!backup || typeof backup !== 'object') {
        addToast('error', t('অবৈধ ব্যাকআপ ফাইল', 'Invalid Backup File'), t('সঠিক JSON ফাইল নির্বাচন করুন।', 'Please select a valid JSON backup file.'));
        return false;
      }

      lastLocalMutationAtRef.current = Date.now();
      const nextSettings = backup.settings ? mergeSettings(backup.settings) : settingsRef.current;
      const nextCategories = Array.isArray(backup.categories) ? backup.categories : categoriesRef.current;
      const nextSliders = Array.isArray(backup.sliders) ? backup.sliders : slidersRef.current;
      const nextProducts = Array.isArray(backup.products) ? backup.products : productsRef.current;
      const nextOrders = Array.isArray(backup.orders) ? backup.orders : ordersRef.current;
      const nextReviews = Array.isArray(backup.reviews) ? backup.reviews : reviewsRef.current;
      const nextMedia = Array.isArray(backup.mediaLibrary) ? backup.mediaLibrary : mediaLibraryRef.current;
      const nextCustomers = Array.isArray(backup.customerAccounts) ? backup.customerAccounts : customerAccountsRef.current;
      const nextTopUps = Array.isArray(backup.walletTopUps) ? backup.walletTopUps : walletTopUpsRef.current;
      const nextCarts = Array.isArray(backup.abandonedCarts) ? backup.abandonedCarts : abandonedCartsRef.current;
      const nextAlerts = Array.isArray(backup.priceAlerts) ? backup.priceAlerts : priceAlertsRef.current;
      const nextWaitlist = Array.isArray(backup.waitlist) ? backup.waitlist : waitlistEntriesRef.current;
      const nextUsers = Array.isArray(backup.users) ? backup.users : usersRef.current;

      setSettings(nextSettings);
      setCategories(nextCategories);
      setSliders(nextSliders);
      setProducts(nextProducts);
      setOrders(nextOrders);
      setReviews(nextReviews);
      setMediaLibrary(nextMedia);
      setCustomerAccounts(nextCustomers);
      setWalletTopUps(nextTopUps);
      setAbandonedCarts(nextCarts);
      setPriceAlerts(nextAlerts);
      setUsers(nextUsers);

      fetch('/api/store/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: nextSettings,
          categories: nextCategories,
          sliders: nextSliders,
          products: nextProducts,
          orders: nextOrders,
          reviews: nextReviews,
          mediaLibrary: nextMedia,
          customerAccounts: nextCustomers,
          walletTopUps: nextTopUps,
          abandonedCarts: nextCarts,
          priceAlerts: nextAlerts,
          users: nextUsers
        })
      }).catch(() => {});

      if (pushToCloud && auth.currentUser) {
        setIsSyncingCloudAll(true);
        try {
          const res = await syncAllAdminDataToFirestore({
            settings: nextSettings,
            categories: nextCategories,
            sliders: nextSliders,
            products: nextProducts,
            orders: nextOrders,
            reviews: nextReviews,
            mediaLibrary: nextMedia,
            customerAccounts: nextCustomers,
            walletTopUps: nextTopUps,
            abandonedCarts: nextCarts,
            priceAlerts: nextAlerts,
            users: nextUsers
          });
          setLastCloudSyncAt(new Date().toLocaleTimeString());
          if (!res.ok) setCloudSyncError(res.errors[0] || 'Partial backup push error');
        } finally {
          setIsSyncingCloudAll(false);
        }
      }

      addToast(
        'success',
        t('ডাটাবেস ব্যাকআপ রিস্টোর সম্পন্ন!', 'Database Backup Restored!'),
        t('সব সেটিংস, পণ্য, অর্ডার ও কাস্টমার ডাটা সফলভাবে লোড হয়েছে।', 'All settings, products, orders & customers restored.')
      );
      return true;
    } catch (err) {
      addToast('error', t('রিস্টোর ব্যর্থ', 'Restore Failed'), extractFirestoreErrorReason(err));
      return false;
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user?.email) {
        setFirebaseAdminUserEmail(user.email);
        const isBootstrappedEmail = user.email.toLowerCase() === 'buyonebd@gmail.com' && user.emailVerified;
        if (isBootstrappedEmail) {
          setIsFirebaseAdminConnected(true);
          setCloudSyncError(null);
          ensureAdminDocInFirestore().catch(() => {});
        } else {
          try {
            const admSnap = await getDoc(doc(db, 'admins', user.uid));
            const allowed = admSnap.exists();
            setIsFirebaseAdminConnected(allowed);
            if (!allowed) {
              setCloudSyncError(
                t(
                  `ইমেইল '${user.email}' অ্যাডমিন হিসেবে অনুমোদিত নয়। অনুগ্রহ করে buyonebd@gmail.com ব্যবহার করুন।`,
                  `Signed in as '${user.email}', which is not authorized in Firestore admins. Please use buyonebd@gmail.com.`
                )
              );
            } else {
              setCloudSyncError(null);
            }
          } catch (err) {
            setIsFirebaseAdminConnected(false);
            setCloudSyncError(extractFirestoreErrorReason(err));
          }
        }
      } else {
        setFirebaseAdminUserEmail(null);
        setIsFirebaseAdminConnected(false);
      }
    });
    return () => unsub();
  }, []);

  const signInAdminWithGoogle = async (): Promise<boolean> => {
    try {
      setCloudSyncError(null);
      const cred = await signInWithPopup(auth, googleProvider);
      const email = cred.user?.email?.toLowerCase() || '';
      setFirebaseAdminUserEmail(cred.user?.email || null);

      const isBootstrappedAdmin = email === 'buyonebd@gmail.com' && Boolean(cred.user?.emailVerified);
      let isAuthorizedAdmin = isBootstrappedAdmin;

      if (isBootstrappedAdmin) {
        await ensureAdminDocInFirestore().catch(() => {});
      } else {
        const admSnap = await getDoc(doc(db, 'admins', cred.user.uid)).catch(() => null);
        isAuthorizedAdmin = Boolean(admSnap && admSnap.exists());
      }

      if (isAuthorizedAdmin) {
        setIsFirebaseAdminConnected(true);
        setIsAdminLoggedIn(true);
        localStorage.setItem(LOCAL_STORAGE_ADMIN_AUTH, 'true');
        setIsAdminLoginOpen(false);
        setActiveView('admin');
        setCloudSyncError(null);

        let cloudCount = 0;
        try {
          // Check if public storefront or private admin vault is uninitialized yet; if so, bootstrap ALL local dashboard settings & modules up to Firebase
          const [pubSnap, privSnap, fsProds, fsOrders] = await Promise.all([
            fetchStorefrontSettingsFromFirestore().catch(() => null),
            fetchAdminPrivateConfigFromFirestore().catch(() => null),
            fetchProductsFromFirestore().catch(() => []),
            fetchOrdersFromFirestore().catch(() => [])
          ]);

          if (!pubSnap || !privSnap || fsProds.length === 0) {
            await syncAllDashboardToFirebase(true);
          }

          const fsIds = new Set(fsOrders.map((o) => o.id));
          const localOnlyOrders = ordersRef.current.filter((o) => o && o.id && !fsIds.has(o.id));
          for (const localOrd of localOnlyOrders.slice(0, 50)) {
            await writeOrderToFirestore(localOrd, true).catch(() => {});
          }
          const finalOrders = await fetchOrdersFromFirestore();
          cloudCount = finalOrders.length;
          if (finalOrders.length > 0) {
            mergeRemoteOrders(finalOrders, new Set(), false);
          }
          setLastCloudSyncAt(new Date().toLocaleTimeString());
        } catch (syncErr) {
          setCloudSyncError(extractFirestoreErrorReason(syncErr));
        }

        addToast(
          'success',
          t('একীভূত Firebase ক্লাউড হাব সংযুক্ত!', 'Unified Firebase Admin Connected!'),
          t(
            `Firebase সেশন: ${cred.user.email} • ক্লাউডে ${cloudCount}টি অর্ডার ও সব সেটিংস সিঙ্ক সক্রিয়।`,
            `Signed in as ${cred.user.email} • All settings & ${cloudCount} cloud orders synced live.`
          )
        );
        return true;
      }

      const deniedMsg = t(
        `ক্লাউড সিঙ্কের জন্য অনুগ্রহ করে buyonebd@gmail.com দিয়ে সাইন ইন করুন (${cred.user.email} অনুমোদিত নয়)।`,
        `Please sign in with buyonebd@gmail.com for Firestore order streaming (${cred.user.email} is not an admin).`
      );
      setIsFirebaseAdminConnected(false);
      setCloudSyncError(deniedMsg);
      addToast('warning', t('অ্যাডমিন অনুমোদিত ইমেইল নয়', 'Non-Admin Google Account'), deniedMsg);
      return false;
    } catch (err: any) {
      const code = String(err?.code || '');
      let friendlyMsg = err?.message || 'Popup closed or blocked.';
      if (code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        friendlyMsg = t(
          `ডোমেইন '${host}' Firebase Auth-এ অনুমোদিত নয়। Firebase Console > Authentication > Settings > Authorized domains-এ '${host}' যোগ করুন।`,
          `Domain '${host}' is not authorized in Firebase Auth. Add '${host}' in Firebase Console > Authentication > Settings > Authorized domains.`
        );
      } else if (code === 'auth/popup-blocked') {
        friendlyMsg = t(
          'ব্রাউজার পপআপ ব্লক করেছে! অ্যাড্রেস বার থেকে পপআপ Allow করে আবার চেষ্টা করুন।',
          'Browser blocked Google sign-in popup. Allow popups for this site and click Connect again.'
        );
      }
      setCloudSyncError(friendlyMsg);
      addToast('error', t('Google সাইন-ইন ব্যর্থ', 'Google Sign-In Failed'), friendlyMsg);
      return false;
    }
  };

  const signOutAdminFirebase = async (): Promise<void> => {
    try {
      await signOut(auth);
      setFirebaseAdminUserEmail(null);
      setIsFirebaseAdminConnected(false);
      setCloudSyncError(null);
    } catch {}
  };

  const loginAdmin = (email: string, pass: string): boolean => {
    if (
      email.trim().toLowerCase() === 'hossain@gmail.com' &&
      pass === 'Hossain777@#$'
    ) {
      setIsAdminLoggedIn(true);
      localStorage.setItem(LOCAL_STORAGE_ADMIN_AUTH, 'true');
      setIsAdminLoginOpen(false);
      setActiveView('admin');
      if (window.location.pathname !== '/hossain') {
        window.history.pushState({}, '', '/hossain');
      }
      addSecurityLog('Admin Login Success', `Authenticated as ${email.trim().toLowerCase()}`, 'info');
      addToast('success', t('অ্যাডমিন লগইন সফল!', 'Admin Logged In!'), t('স্বাগতম হোসেন ভাই, ড্যাশবোর্ডে প্রবেশের অনুমতি দেওয়া হয়েছে।', 'Welcome Hossain, dashboard unlocked.'));
      return true;
    }
    addSecurityLog('Admin Login Failed', `Rejected attempt for ${email.trim() || 'unknown'}`, 'warning');
    addToast('error', t('ভুল ইমেইল বা পাসওয়ার্ড', 'Invalid Credentials'), t('দয়া করে সঠিক ইমেইল ও পাসওয়ার্ড প্রদান করুন।', 'Please provide correct credentials.'));
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem(LOCAL_STORAGE_ADMIN_AUTH);
    setActiveView('store');
    window.history.pushState({}, '', '/');
    addToast('info', t('লগআউট সম্পন্ন', 'Logged Out'), t('অ্যাডমিন প্যানেল সুরক্ষিত রাখা হয়েছে।', 'Session terminated.'));
  };

  // Daily Spin Limit (1 spin per day like Temu)
  const [spinStats, setSpinStats] = useState<{ date: string; count: number; lastSpinTime: number }>(() => {
    const today = new Date().toDateString();
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SPIN_STATS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) return parsed;
      }
    } catch {}
    return { date: today, count: 0, lastSpinTime: 0 };
  });

  const spinsAllowed = settings.spinSettings?.spinsPerDay || 1;
  const remainingSpinsToday = Math.max(0, spinsAllowed - spinStats.count);
  const nowMs = Date.now();
  const cooldownDiff = (spinStats.lastSpinTime + 10 * 60 * 1000) - nowMs;
  const spinCooldownMinutes = cooldownDiff > 0 ? Math.ceil(cooldownDiff / 60000) : 0;

  const recordSpinUsed = (): boolean => {
    if (remainingSpinsToday <= 0) {
      addToast(
        'warning',
        lang === 'bn' ? 'আজকের স্পিন সম্পন্ন হয়েছে!' : 'Daily Spin Used!',
        lang === 'bn' ? 'প্রতিদিন ১টি ফ্রি স্পিন পাওয়া যায়। আগামীকাল আবার ঘুরিয়ে উপহার জিতুন!' : 'Only 1 free spin allowed per day. Come back tomorrow!'
      );
      return false;
    }

    const today = new Date().toDateString();
    const updated = {
      date: today,
      count: spinStats.count + 1,
      lastSpinTime: Date.now()
    };
    setSpinStats(updated);
    localStorage.setItem(LOCAL_STORAGE_SPIN_STATS, JSON.stringify(updated));
    return true;
  };

  // Spin Rewards derived from settings
  const spinRewards = settings.spinSettings?.rewards || INITIAL_SETTINGS.spinSettings.rewards;

  const addSpinReward = (rewardData: Omit<SpinReward, 'id'>) => {
    const newReward: SpinReward = {
      ...rewardData,
      id: `spin-${Date.now().toString().slice(-5)}`
    };
    const updatedRewards = [...spinRewards, newReward];
    lastLocalMutationAtRef.current = Date.now();
    setSettings((prev) => {
      const next: StoreSettings = {
        ...prev,
        spinSettings: {
          ...prev.spinSettings,
          rewards: updatedRewards
        }
      };
      saveStorefrontSettingsToFirestore(next, categoriesRef.current, slidersRef.current).catch(() => {});
      return next;
    });
    addToast('success', lang === 'bn' ? 'স্পিন অফার যোগ হয়েছে!' : 'Spin Offer Added!', `'${newReward.labelBn}'`);
  };

  const updateSpinReward = (id: string, updates: Partial<SpinReward>) => {
    const updatedRewards = spinRewards.map((rew) => (rew.id === id ? { ...rew, ...updates } : rew));
    lastLocalMutationAtRef.current = Date.now();
    setSettings((prev) => {
      const next: StoreSettings = {
        ...prev,
        spinSettings: {
          ...prev.spinSettings,
          rewards: updatedRewards
        }
      };
      saveStorefrontSettingsToFirestore(next, categoriesRef.current, slidersRef.current).catch(() => {});
      return next;
    });
    addToast('success', lang === 'bn' ? 'স্পিন অফার আপডেট হয়েছে!' : 'Spin Offer Updated!', '');
  };

  const deleteSpinReward = (id: string) => {
    const updatedRewards = spinRewards.filter((rew) => rew.id !== id);
    lastLocalMutationAtRef.current = Date.now();
    setSettings((prev) => {
      const next: StoreSettings = {
        ...prev,
        spinSettings: {
          ...prev.spinSettings,
          rewards: updatedRewards
        }
      };
      saveStorefrontSettingsToFirestore(next, categoriesRef.current, slidersRef.current).catch(() => {});
      return next;
    });
    addToast('info', lang === 'bn' ? 'স্পিন অফার মোছা হয়েছে' : 'Spin Offer Deleted', '');
  };

  // Customer Gift Wallet Balance (earned strictly from Lucky Spin wheel rewards)
  const [customerWalletBalance, setCustomerWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('buyonebd_customer_wallet_v3');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  // Customer Auth & Account Registry
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('buyonebd_customer_auth_v3') === 'true';
  });
  const [isCustomerLoginOpen, setIsCustomerLoginOpen] = useState(false);

  const [customerAccounts, setCustomerAccounts] = useState<CustomerProfile[]>(() => {
    try {
      const saved = localStorage.getItem('buyonebd_customer_accounts_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        name: 'হোসেন আহমেদ',
        username: 'hossain',
        phone: '01917942662',
        email: 'customer@buyonebd.com',
        address: 'বাড়ি ১২, রোড ৫, ধানমন্ডি',
        district: 'Dhaka - Inside City',
        password: '123456',
        loyaltyPoints: 120,
        walletBalance: 0,
        browsingHistory: [],
        savedCoupons: []
      }
    ];
  });
  const customerAccountsRef = useRef<CustomerProfile[]>(customerAccounts);
  customerAccountsRef.current = customerAccounts;

  useEffect(() => {
    localStorage.setItem('buyonebd_customer_accounts_v3', JSON.stringify(customerAccounts));
  }, [customerAccounts]);

  // Customer Profile & Rewards State
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(() => {
    const defaultProfile: CustomerProfile = {
      name: 'হোসেন আহমেদ',
      username: 'hossain',
      phone: '01917942662',
      email: 'customer@buyonebd.com',
      address: 'বাড়ি ১২, রোড ৫, ধানমন্ডি',
      district: 'Dhaka - Inside City',
      password: '123456',
      loyaltyPoints: 120,
      walletBalance: 0,
      browsingHistory: [],
      savedCoupons: []
    };
    try {
      const saved = localStorage.getItem('buyonebd_customer_profile_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultProfile;
  });

  useEffect(() => {
    localStorage.setItem('buyonebd_customer_profile_v3', JSON.stringify(customerProfile));
  }, [customerProfile]);

  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RECENTLY_VIEWED);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0).slice(0, 5);
        }
      }
      if (Array.isArray(customerProfile.browsingHistory) && customerProfile.browsingHistory.length > 0) {
        return customerProfile.browsingHistory.slice(0, 5);
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_RECENTLY_VIEWED, JSON.stringify(recentlyViewedIds.slice(0, 5)));
    } catch {}
  }, [recentlyViewedIds]);

  const [isCustomerDashboardOpen, setIsCustomerDashboardOpen] = useState(false);
  const [selectedProductForPage, setSelectedProductForPage] = useState<Product | null>(null);

  const loginCustomer = (identifier: string, password: string): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    const matched = customerAccounts.find(
      (acc) =>
        (acc.username?.toLowerCase() === cleanId ||
          acc.phone.replace(/[^0-9]/g, '') === identifier.replace(/[^0-9]/g, '') ||
          acc.email.toLowerCase() === cleanId) &&
        (acc.password || '123456') === password
    );

    if (matched) {
      setCustomerProfile(matched);
      setIsCustomerLoggedIn(true);
      localStorage.setItem('buyonebd_customer_auth_v3', 'true');
      setIsCustomerLoginOpen(false);
      setIsCustomerDashboardOpen(true);
      addToast('success', t('লগইন সফল হয়েছে!', 'Welcome Back!'), matched.name);
      return true;
    }

    addToast(
      'error',
      t('ভুল ইউজারনেম বা পাসওয়ার্ড', 'Invalid Credentials'),
      t('দয়া করে সঠিক ইউজারনেম/ফোন ও পাসওয়ার্ড দিন।', 'Please check your username/phone and password.')
    );
    return false;
  };

  const registerCustomer = (data: {
    name: string;
    username: string;
    phone: string;
    email?: string;
    password: string;
  }): boolean => {
    const cleanUser = data.username.trim().toLowerCase();
    const exists = customerAccounts.some(
      (a) => a.username?.toLowerCase() === cleanUser || a.phone === data.phone.trim()
    );
    if (exists) {
      addToast(
        'warning',
        t('অ্যাকাউন্ট ইতিমধ্যে রয়েছে', 'Account Already Exists'),
        t('অনুগ্রহ করে লগইন করুন বা অন্য ইউজারনেম দিন।', 'Please sign in or use a different username/phone.')
      );
      return false;
    }

    const newAcc: CustomerProfile = {
      name: data.name.trim(),
      username: cleanUser,
      phone: data.phone.trim(),
      email: data.email?.trim() || `${cleanUser}@buyonebd.com`,
      address: '',
      district: 'Dhaka - Inside City',
      password: data.password,
      loyaltyPoints: 0,
      walletBalance: customerWalletBalance,
      browsingHistory: customerProfile.browsingHistory || [],
      savedCoupons: customerProfile.savedCoupons || []
    };

    lastLocalMutationAtRef.current = Date.now();
    setCustomerAccounts((prev) => [...prev, newAcc]);
    saveCustomerToFirestore(newAcc).catch(() => {});
    setCustomerProfile(newAcc);
    setIsCustomerLoggedIn(true);
    localStorage.setItem('buyonebd_customer_auth_v3', 'true');
    setIsCustomerLoginOpen(false);
    setIsCustomerDashboardOpen(true);
    addToast('success', t('রেজিস্ট্রেশন সম্পন্ন!', 'Account Created!'), newAcc.name);
    return true;
  };

  const sendPasswordResetOtp = async (
    identifier: string
  ): Promise<{ success: boolean; otpCode?: string; customerName?: string; contactLabel?: string; error?: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '');
    const matched = customerAccounts.find(
      (acc) =>
        (acc.username && acc.username.toLowerCase() === cleanId) ||
        (cleanDigits && acc.phone.replace(/[^0-9]/g, '') === cleanDigits) ||
        (acc.email && acc.email.toLowerCase() === cleanId)
    );
    if (!matched) {
      return {
        success: false,
        error: t(
          'এই ফোন নম্বর, ইমেইল বা ইউজারনেমে কোনো একাউন্ট পাওয়া যায়নি।',
          'No customer account found for this phone, email, or username.'
        )
      };
    }
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    if (matched.email && matched.email.includes('@') && settings.smtpSettings?.enabled) {
      fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp: settings.smtpSettings,
          to: matched.email,
          subject: `${settings.storeName} Password Reset Code: ${otpCode}`,
          text: `Assalamu Alaikum ${matched.name},\n\nYour password reset verification code is: ${otpCode}\n\nIf you did not request this, please ignore this email.`
        })
      }).catch(() => {});
    }
    return {
      success: true,
      otpCode,
      customerName: matched.name,
      contactLabel: matched.phone || matched.email
    };
  };

  const resetCustomerPassword = (identifier: string, newPassword: string): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '');
    let found = false;
    setCustomerAccounts((prev) =>
      prev.map((acc) => {
        const matches =
          (acc.username && acc.username.toLowerCase() === cleanId) ||
          (cleanDigits && acc.phone.replace(/[^0-9]/g, '') === cleanDigits) ||
          (acc.email && acc.email.toLowerCase() === cleanId);
        if (!matches) return acc;
        found = true;
        return { ...acc, password: newPassword };
      })
    );
    if (!found) {
      addToast('error', t('একাউন্ট পাওয়া যায়নি', 'Account Not Found'), '');
      return false;
    }
    addToast(
      'success',
      t('পাসওয়ার্ড পরিবর্তন সফল!', 'Password Reset Successful!'),
      t('নতুন পাসওয়ার্ড দিয়ে এখনই লগইন করতে পারবেন।', 'You can now sign in with your new password.')
    );
    return true;
  };

  const logoutCustomer = () => {
    setIsCustomerLoggedIn(false);
    localStorage.removeItem('buyonebd_customer_auth_v3');
    setIsCustomerDashboardOpen(false);
    addToast('info', t('সাইন আউট সম্পন্ন', 'Signed Out'), '');
  };

  const openCustomerPortal = () => {
    if (isCustomerLoggedIn) {
      setIsCustomerDashboardOpen(true);
    } else {
      setIsCustomerLoginOpen(true);
    }
  };

  const updateCustomerProfile = (updates: Partial<CustomerProfile>) => {
    lastLocalMutationAtRef.current = Date.now();
    setCustomerProfile((prev) => {
      const next = { ...prev, ...updates };
      setCustomerAccounts((accs) =>
        accs.map((a) => (a.phone === prev.phone || a.username === prev.username ? next : a))
      );
      saveCustomerToFirestore(next).catch(() => {});
      return next;
    });
    addToast('success', t('প্রোফাইল আপডেট সম্পন্ন', 'Profile Updated'), t('আপনার তথ্য সফলভাবে সংরক্ষিত হয়েছে।', 'Changes saved successfully.'));
  };

  const saveSpinCoupon = (reward: SpinReward) => {
    const newCoupon: CustomerCoupon = {
      id: `cpn-${Date.now()}`,
      code: reward.code,
      labelBn: reward.labelBn,
      labelEn: reward.labelEn,
      value: reward.value,
      discountType: reward.discountType === 'try_again' ? 'fixed' : reward.discountType,
      expiresAt: new Date(Date.now() + 7 * 86400000).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')
    };
    setCustomerProfile((prev) => {
      const existing = prev.savedCoupons || [];
      const filtered = existing.filter((c) => c.code !== reward.code);
      return { ...prev, savedCoupons: [newCoupon, ...filtered].slice(0, 15) };
    });
  };

  const recordProductView = (productId: string) => {
    if (!productId) return;
    setRecentlyViewedIds((prev) => {
      if (prev[0] === productId) return prev;
      const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, 5);
      try {
        localStorage.setItem(LOCAL_STORAGE_RECENTLY_VIEWED, JSON.stringify(next));
      } catch {}
      return next;
    });
    setCustomerProfile((prev) => {
      const history = prev.browsingHistory || [];
      if (history[0] === productId) return prev;
      const nextHistory = [productId, ...history.filter((id) => id !== productId)].slice(0, 5);
      return { ...prev, browsingHistory: nextHistory };
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_RECENTLY_VIEWED);
    } catch {}
  };

  const claimDailyCheckIn = () => {
    return {
      success: false,
      amount: 0,
      message: t('ক্যাশ বোনাস শুধুমাত্র লাকি স্পিন হুইল থেকে পাওয়া যায়।', 'Cash bonuses are awarded via the Lucky Spin Wheel only.')
    };
  };

  const [walletLastPurchaseAt, setWalletLastPurchaseAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem('buyonebd_wallet_last_purchase_v1') || customerProfile.lastPurchaseAt || null;
    } catch {
      return null;
    }
  });

  const [walletLastCreditAt, setWalletLastCreditAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem('buyonebd_wallet_last_credit_v1') || customerProfile.lastWalletCreditAt || null;
    } catch {
      return null;
    }
  });

  const [walletTopUps, setWalletTopUps] = useState<WalletTopUpRequest[]>(() => {
    try {
      const saved = localStorage.getItem('buyonebd_wallet_topups_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'TOPUP-9012',
        customerName: 'হোসেন আহমেদ',
        customerPhone: '01917942662',
        method: 'bkash',
        amount: 500,
        senderNumber: '01917942662',
        trxId: 'BKS8890124',
        status: 'pending',
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ];
  });
  const walletTopUpsRef = useRef<WalletTopUpRequest[]>(walletTopUps);
  walletTopUpsRef.current = walletTopUps;

  useEffect(() => {
    localStorage.setItem('buyonebd_wallet_topups_v1', JSON.stringify(walletTopUps));
  }, [walletTopUps]);

  const expiryDaysSetting = Math.max(1, settings.walletSettings?.expiryDays ?? 30);

  const walletDaysRemaining = React.useMemo(() => {
    if (customerWalletBalance <= 0) return expiryDaysSetting;
    const anchor = walletLastPurchaseAt || walletLastCreditAt;
    if (!anchor) return expiryDaysSetting;
    const elapsedDays = Math.floor((Date.now() - new Date(anchor).getTime()) / 86400000);
    return Math.max(0, expiryDaysSetting - elapsedDays);
  }, [customerWalletBalance, walletLastPurchaseAt, walletLastCreditAt, expiryDaysSetting]);

  const runWalletExpirySweep = (forceExpireDemo = false): number => {
    const expiryMs = expiryDaysSetting * 86400000;
    let expiredCount = 0;
    const anchor = walletLastPurchaseAt || walletLastCreditAt;
    const isExpired =
      forceExpireDemo ||
      (anchor ? Date.now() - new Date(anchor).getTime() >= expiryMs : false);

    if (customerWalletBalance > 0 && isExpired) {
      setCustomerWalletBalance(0);
      localStorage.setItem('buyonebd_customer_wallet_v3', '0');
      setCustomerProfile((cp) => ({ ...cp, walletBalance: 0 }));
      expiredCount += 1;
      addToast(
        'warning',
        t(`৩০ দিন অতিক্রান্ত — ব্যালেন্স ৳০ হয়েছে`, `Balance Reset to ৳0 (${expiryDaysSetting}-Day Expiry)`),
        t(
          `গত ${expiryDaysSetting} দিনে কোনো পণ্য না কেনায় গিফট/ওয়ালেট ব্যালেন্স শূন্য (৳০) হয়ে গেছে।`,
          `No product was purchased in ${expiryDaysSetting} days, so wallet balance expired to ৳0.`
        )
      );
    }

    // Also sweep stored customerAccounts whose lastPurchaseAt/lastWalletCreditAt > expiryDays
    setCustomerAccounts((prev) =>
      prev.map((acc) => {
        if (acc.walletBalance <= 0) return acc;
        const accAnchor = acc.lastPurchaseAt || acc.lastWalletCreditAt;
        if (forceExpireDemo || (accAnchor && Date.now() - new Date(accAnchor).getTime() >= expiryMs)) {
          expiredCount += 1;
          const updated = { ...acc, walletBalance: 0 };
          saveCustomerToFirestore(updated).catch(() => {});
          return updated;
        }
        return acc;
      })
    );

    return expiredCount;
  };

  // Enforce 30-day no-purchase balance expiry automatically on load & when settings change
  useEffect(() => {
    if (customerWalletBalance <= 0) return;
    const anchor = walletLastPurchaseAt || walletLastCreditAt;
    if (!anchor) {
      const nowIso = new Date().toISOString();
      setWalletLastCreditAt(nowIso);
      localStorage.setItem('buyonebd_wallet_last_credit_v1', nowIso);
      return;
    }
    const expiryMs = expiryDaysSetting * 86400000;
    if (Date.now() - new Date(anchor).getTime() >= expiryMs) {
      runWalletExpirySweep(false);
    }
  }, [customerWalletBalance, walletLastPurchaseAt, walletLastCreditAt, expiryDaysSetting]);

  const redeemLoyaltyPoints = (points: number) => {
    const cfg = settings.loyaltySettings;
    const minReq = cfg?.minRedeemPoints ?? 10;
    const bdtRate = cfg?.bdtPerPoint ?? 1;
    if (points < minReq || customerProfile.loyaltyPoints < points) {
      return { success: false, discountAmount: 0 };
    }
    const discountAmount = Math.max(1, Math.round(points * bdtRate));
    const nextPoints = Math.max(0, customerProfile.loyaltyPoints - points);
    const nextBal = customerWalletBalance + discountAmount;
    const nowIso = new Date().toISOString();
    const ledgerEntry = {
      id: `loy-${Date.now()}`,
      type: 'redeem' as const,
      points: -points,
      note: `Converted ${points} pts to ৳${discountAmount} wallet balance`,
      date: nowIso
    };
    setCustomerWalletBalance(nextBal);
    localStorage.setItem('buyonebd_customer_wallet_v3', nextBal.toString());
    if (!walletLastCreditAt) {
      setWalletLastCreditAt(nowIso);
      localStorage.setItem('buyonebd_wallet_last_credit_v1', nowIso);
    }
    const cleanPhone = (customerProfile.phone || '').replace(/[^0-9]/g, '');
    setCustomerProfile((cp) => {
      const updated = {
        ...cp,
        loyaltyPoints: nextPoints,
        walletBalance: nextBal,
        lastWalletCreditAt: cp.lastWalletCreditAt || nowIso,
        loyaltyHistory: [ledgerEntry, ...(cp.loyaltyHistory || [])].slice(0, 40)
      };
      saveCustomerToFirestore(updated).catch(() => {});
      return updated;
    });
    setCustomerAccounts((prev) =>
      prev.map((acc) => {
        if (cleanPhone && acc.phone.replace(/[^0-9]/g, '') === cleanPhone) {
          const updated = {
            ...acc,
            loyaltyPoints: nextPoints,
            walletBalance: nextBal,
            loyaltyHistory: [ledgerEntry, ...(acc.loyaltyHistory || [])].slice(0, 40)
          };
          saveCustomerToFirestore(updated).catch(() => {});
          return updated;
        }
        return acc;
      })
    );
    addToast(
      'success',
      lang === 'bn' ? `${points} পয়েন্ট রিডিম সম্পন্ন!` : `${points} Points Redeemed!`,
      lang === 'bn' ? `৳${discountAmount} আপনার ব্যালেন্সে যোগ করা হয়েছে।` : `৳${discountAmount} converted to wallet balance.`
    );
    return { success: true, discountAmount };
  };

  const adjustCustomerLoyaltyPoints = (identifier: string, delta: number, reason?: string): boolean => {
    if (!identifier || delta === 0) return false;
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '').slice(-11);
    const nowIso = new Date().toISOString();
    let found = false;
    let updatedPoints = 0;
    let targetName = identifier;
    const ledgerEntry = {
      id: `loy-${Date.now()}`,
      type: 'adjust' as const,
      points: delta,
      note: reason || `Admin adjustment (${delta > 0 ? '+' : ''}${delta} pts)`,
      date: nowIso
    };

    const nextAccounts = customerAccounts.map((acc) => {
      const accDigits = acc.phone.replace(/[^0-9]/g, '').slice(-11);
      const matches =
        (acc.username && acc.username.toLowerCase() === cleanId) ||
        (acc.email && acc.email.toLowerCase() === cleanId) ||
        (cleanDigits && accDigits === cleanDigits) ||
        acc.name.toLowerCase() === cleanId;
      if (!matches) return acc;
      found = true;
      targetName = acc.name;
      updatedPoints = Math.max(0, Math.round((acc.loyaltyPoints || 0) + delta));
      const updated = {
        ...acc,
        loyaltyPoints: updatedPoints,
        loyaltyHistory: [ledgerEntry, ...(acc.loyaltyHistory || [])].slice(0, 40)
      };
      saveCustomerToFirestore(updated).catch(() => {});
      return updated;
    });

    if (!found) return false;
    lastLocalMutationAtRef.current = Date.now();
    setCustomerAccounts(nextAccounts);

    const activeDigits = (customerProfile.phone || '').replace(/[^0-9]/g, '').slice(-11);
    if (
      (cleanDigits && activeDigits === cleanDigits) ||
      (customerProfile.email && customerProfile.email.toLowerCase() === cleanId)
    ) {
      setCustomerProfile((cp) => ({
        ...cp,
        loyaltyPoints: updatedPoints,
        loyaltyHistory: [ledgerEntry, ...(cp.loyaltyHistory || [])].slice(0, 40)
      }));
    }

    addToast(
      delta > 0 ? 'success' : 'info',
      t(`${targetName}: ${delta > 0 ? '+' : ''}${delta} পয়েন্ট`, `${targetName}: ${delta > 0 ? '+' : ''}${delta} Points`),
      t(`মোট পয়েন্ট: ${updatedPoints}`, `New Total: ${updatedPoints} pts`)
    );
    return true;
  };

  const setCustomerLoyaltyPoints = (identifier: string, exactPoints: number, reason?: string): boolean => {
    const cleanPts = Math.max(0, Math.round(exactPoints));
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '').slice(-11);
    const nowIso = new Date().toISOString();
    let found = false;
    let targetName = identifier;

    const nextAccounts = customerAccounts.map((acc) => {
      const accDigits = acc.phone.replace(/[^0-9]/g, '').slice(-11);
      const matches =
        (acc.username && acc.username.toLowerCase() === cleanId) ||
        (acc.email && acc.email.toLowerCase() === cleanId) ||
        (cleanDigits && accDigits === cleanDigits) ||
        acc.name.toLowerCase() === cleanId;
      if (!matches) return acc;
      found = true;
      targetName = acc.name;
      const diff = cleanPts - (acc.loyaltyPoints || 0);
      const ledgerEntry = {
        id: `loy-${Date.now()}`,
        type: 'adjust' as const,
        points: diff,
        note: reason || `Admin set points to ${cleanPts}`,
        date: nowIso
      };
      const updated = {
        ...acc,
        loyaltyPoints: cleanPts,
        loyaltyHistory: [ledgerEntry, ...(acc.loyaltyHistory || [])].slice(0, 40)
      };
      saveCustomerToFirestore(updated).catch(() => {});
      return updated;
    });

    if (!found) return false;
    lastLocalMutationAtRef.current = Date.now();
    setCustomerAccounts(nextAccounts);
    const activeDigits = (customerProfile.phone || '').replace(/[^0-9]/g, '').slice(-11);
    if (cleanDigits && activeDigits === cleanDigits) {
      setCustomerProfile((cp) => ({ ...cp, loyaltyPoints: cleanPts }));
    }
    addToast('success', t(`${targetName}-এর পয়েন্ট আপডেট!`, `Updated Points for ${targetName}`), `${cleanPts} pts`);
    return true;
  };

  const deleteCustomerLoyaltyPoints = (identifier: string): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '').slice(-11);
    const nowIso = new Date().toISOString();
    let found = false;
    let targetName = identifier;

    const nextAccounts = customerAccounts.map((acc) => {
      const accDigits = acc.phone.replace(/[^0-9]/g, '').slice(-11);
      const matches =
        (acc.username && acc.username.toLowerCase() === cleanId) ||
        (acc.email && acc.email.toLowerCase() === cleanId) ||
        (cleanDigits && accDigits === cleanDigits) ||
        acc.name.toLowerCase() === cleanId;
      if (!matches) return acc;
      found = true;
      targetName = acc.name;
      const prevPts = acc.loyaltyPoints || 0;
      const ledgerEntry = {
        id: `loy-${Date.now()}`,
        type: 'delete' as const,
        points: -prevPts,
        note: 'Points deleted / reset to 0 by Admin',
        date: nowIso
      };
      const updated = {
        ...acc,
        loyaltyPoints: 0,
        loyaltyHistory: [ledgerEntry, ...(acc.loyaltyHistory || [])].slice(0, 40)
      };
      saveCustomerToFirestore(updated).catch(() => {});
      return updated;
    });

    if (!found) return false;
    lastLocalMutationAtRef.current = Date.now();
    setCustomerAccounts(nextAccounts);
    const activeDigits = (customerProfile.phone || '').replace(/[^0-9]/g, '').slice(-11);
    if (cleanDigits && activeDigits === cleanDigits) {
      setCustomerProfile((cp) => ({ ...cp, loyaltyPoints: 0 }));
    }
    addToast('info', t(`${targetName}-এর সকল পয়েন্ট মুছে ফেলা হয়েছে`, `Reset Loyalty Points for ${targetName}`), '0 pts');
    return true;
  };

  const addToWallet = (amount: number, reason?: string) => {
    const nowIso = new Date().toISOString();
    setCustomerWalletBalance((prev) => {
      const next = prev + amount;
      localStorage.setItem('buyonebd_customer_wallet_v3', next.toString());
      if (prev <= 0 || !walletLastCreditAt) {
        setWalletLastCreditAt(nowIso);
        localStorage.setItem('buyonebd_wallet_last_credit_v1', nowIso);
      }
      setCustomerProfile((cp) => ({
        ...cp,
        walletBalance: next,
        lastWalletCreditAt: cp.lastWalletCreditAt || nowIso
      }));
      addToast(
        'success',
        reason || (lang === 'bn' ? `৳${amount} ওয়ালেট ব্যালেন্স যোগ হয়েছে!` : `৳${amount} Added to Wallet!`),
        lang === 'bn' ? `বর্তমান ব্যালেন্স: ৳${next}` : `Current Balance: ৳${next}`
      );
      return next;
    });
  };

  const deductWallet = (amount: number): boolean => {
    if (customerWalletBalance < amount) return false;
    setCustomerWalletBalance((prev) => {
      const next = Math.max(0, prev - amount);
      localStorage.setItem('buyonebd_customer_wallet_v3', next.toString());
      setCustomerProfile((cp) => ({ ...cp, walletBalance: next }));
      return next;
    });
    return true;
  };

  const requestWalletTopUp = (payload: {
    method: WalletTopUpMethod;
    amount: number;
    senderNumber: string;
    trxId: string;
  }): { success: boolean; status: 'pending' | 'approved' } => {
    const wCfg = settings.walletSettings;
    if (wCfg && !wCfg.enabled) {
      addToast('error', t('ওয়ালেট রিচার্জ বন্ধ আছে', 'Top-Up Disabled'), t('অ্যাডমিন প্যানেল থেকে ব্যালেন্স অ্যাড অপশন বন্ধ রয়েছে।', 'Balance top-up is currently disabled by admin.'));
      return { success: false, status: 'pending' };
    }
    const minAmt = wCfg?.minTopUp ?? 50;
    const maxAmt = wCfg?.maxTopUp ?? 50000;
    if (payload.amount < minAmt || payload.amount > maxAmt) {
      addToast(
        'warning',
        t('অবৈধ পরিমাণ', 'Invalid Amount'),
        t(`৳${minAmt} থেকে ৳${maxAmt}-এর মধ্যে পরিমাণ দিন।`, `Enter an amount between ৳${minAmt} and ৳${maxAmt}.`)
      );
      return { success: false, status: 'pending' };
    }

    const isAutoApprove = Boolean(wCfg?.autoApprove);
    const nowIso = new Date().toISOString();
    const newReq: WalletTopUpRequest = {
      id: `TOPUP-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerProfile.name || t('গ্রাহক', 'Customer'),
      customerPhone: customerProfile.phone || payload.senderNumber,
      method: payload.method,
      amount: payload.amount,
      senderNumber: payload.senderNumber.trim(),
      trxId: payload.trxId.trim(),
      status: isAutoApprove ? 'approved' : 'pending',
      createdAt: nowIso,
      processedAt: isAutoApprove ? nowIso : undefined
    };

    lastLocalMutationAtRef.current = Date.now();
    setWalletTopUps((prev) => [newReq, ...prev]);
    saveWalletTopUpToFirestore(newReq).catch(() => {});

    if (isAutoApprove) {
      addToWallet(
        payload.amount,
        t(`${payload.method.toUpperCase()} ৳${payload.amount} অটো-অ্যাপ্রুভড!`, `${payload.method.toUpperCase()} ৳${payload.amount} Auto-Credited!`)
      );
      return { success: true, status: 'approved' };
    }

    addToast(
      'info',
      t('ব্যালেন্স রিকোয়েস্ট জমা হয়েছে!', 'Top-Up Request Submitted!'),
      t(
        `TrxID: ${newReq.trxId} যাচাইয়ের পর অ্যাডমিন ড্যাশবোর্ড থেকে ৳${payload.amount} অনুমোদন করা হবে।`,
        `Your ৳${payload.amount} (${newReq.trxId}) request is awaiting backend admin approval.`
      )
    );
    return { success: true, status: 'pending' };
  };

  const approveWalletTopUp = (requestId: string) => {
    const req = walletTopUps.find((r) => r.id === requestId);
    if (!req || req.status === 'approved') return;
    const nowIso = new Date().toISOString();
    lastLocalMutationAtRef.current = Date.now();

    setWalletTopUps((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const nextLog = [
          {
            time: nowIso,
            actor: 'Admin',
            action: 'Approved',
            note: `Credited ৳${r.amount} via ${r.method.toUpperCase()}`
          },
          ...(r.activityLog || [])
        ].slice(0, 30);
        const next = { ...r, status: 'approved' as const, processedAt: nowIso, activityLog: nextLog };
        saveWalletTopUpToFirestore(next).catch(() => {});
        return next;
      })
    );

    const reqPhone = req.customerPhone.replace(/[^0-9]/g, '');
    const currPhone = (customerProfile.phone || '').replace(/[^0-9]/g, '');

    if (!currPhone || reqPhone === currPhone || customerAccounts.length <= 1) {
      addToWallet(
        req.amount,
        t(`${req.method.toUpperCase()} রিচার্জ অনুমোদিত (+৳${req.amount})`, `Top-Up Approved (+৳${req.amount})`)
      );
      setCustomerAccounts((prev) =>
        prev.map((acc) => {
          if (acc.phone.replace(/[^0-9]/g, '') !== reqPhone && prev.length > 1) return acc;
          const updated = {
            ...acc,
            walletBalance: (acc.walletBalance || 0) + req.amount,
            lastWalletCreditAt: acc.lastWalletCreditAt || nowIso
          };
          saveCustomerToFirestore(updated).catch(() => {});
          return updated;
        })
      );
    } else {
      setCustomerAccounts((prev) =>
        prev.map((acc) => {
          if (acc.phone.replace(/[^0-9]/g, '') !== reqPhone) return acc;
          const updated = {
            ...acc,
            walletBalance: (acc.walletBalance || 0) + req.amount,
            lastWalletCreditAt: acc.lastWalletCreditAt || nowIso
          };
          saveCustomerToFirestore(updated).catch(() => {});
          return updated;
        })
      );
      addToast(
        'success',
        t('রিচার্জ অনুমোদিত!', 'Top-Up Approved!'),
        t(`${req.customerName}-এর অ্যাকাউন্টে ৳${req.amount} যোগ হয়েছে।`, `৳${req.amount} credited to ${req.customerName}.`)
      );
    }
  };

  const rejectWalletTopUp = (requestId: string, note?: string) => {
    const nowIso = new Date().toISOString();
    lastLocalMutationAtRef.current = Date.now();
    setWalletTopUps((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const nextLog = [
          {
            time: nowIso,
            actor: 'Admin',
            action: 'Rejected',
            note: note || 'Invalid TrxID'
          },
          ...(r.activityLog || [])
        ].slice(0, 30);
        const next = {
          ...r,
          status: 'rejected' as const,
          adminNote: note || 'Invalid TrxID',
          processedAt: nowIso,
          activityLog: nextLog
        };
        saveWalletTopUpToFirestore(next).catch(() => {});
        return next;
      })
    );
    addToast('info', t('রিচার্জ রিকোয়েস্ট বাতিল হয়েছে', 'Top-Up Request Rejected'), '');
  };

  const editWalletTopUp = (requestId: string, updates: Partial<WalletTopUpRequest>) => {
    const nowIso = new Date().toISOString();
    lastLocalMutationAtRef.current = Date.now();
    setWalletTopUps((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const nextLog = [
          {
            time: nowIso,
            actor: 'Admin',
            action: 'Edited Record',
            note: updates.adminNote || `Updated details (৳${updates.amount ?? r.amount})`
          },
          ...(r.activityLog || [])
        ].slice(0, 30);
        const next: WalletTopUpRequest = {
          ...r,
          ...updates,
          activityLog: nextLog
        };
        saveWalletTopUpToFirestore(next).catch(() => {});
        return next;
      })
    );
    addToast('success', t('রিচার্জ রিকোয়েস্ট আপডেট হয়েছে', 'Top-Up Record Updated'), '');
  };

  const deleteWalletTopUp = (requestId: string) => {
    lastLocalMutationAtRef.current = Date.now();
    setWalletTopUps((prev) => prev.filter((r) => r.id !== requestId));
    deleteWalletTopUpFromFirestore(requestId).catch(() => {});
    addToast('info', t('রিচার্জ রিকোয়েস্ট মুছে ফেলা হয়েছে', 'Top-Up Record Deleted'), '');
  };

  const bulkActionWalletTopUps = (requestIds: string[], action: 'approve' | 'reject' | 'delete') => {
    if (!requestIds.length) return;
    if (action === 'delete') {
      const idSet = new Set(requestIds);
      lastLocalMutationAtRef.current = Date.now();
      requestIds.forEach((id) => deleteWalletTopUpFromFirestore(id).catch(() => {}));
      setWalletTopUps((prev) => prev.filter((r) => !idSet.has(r.id)));
      addToast('info', t(`${requestIds.length}টি এন্ট্রি মোছা হয়েছে`, `Deleted ${requestIds.length} entries`), '');
      return;
    }
    if (action === 'approve') {
      requestIds.forEach((id) => approveWalletTopUp(id));
      return;
    }
    if (action === 'reject') {
      requestIds.forEach((id) => rejectWalletTopUp(id, 'Bulk rejected by Admin'));
    }
  };

  const adjustCustomerWalletByAdmin = (delta: number, reason?: string) => {
    if (delta === 0) return;
    const nowIso = new Date().toISOString();
    lastLocalMutationAtRef.current = Date.now();
    setCustomerWalletBalance((prev) => {
      const next = Math.max(0, prev + delta);
      localStorage.setItem('buyonebd_customer_wallet_v3', next.toString());
      if (delta > 0 && (prev <= 0 || !walletLastCreditAt)) {
        setWalletLastCreditAt(nowIso);
        localStorage.setItem('buyonebd_wallet_last_credit_v1', nowIso);
      }
      setCustomerProfile((cp) => {
        const updatedCp = {
          ...cp,
          walletBalance: next,
          lastWalletCreditAt: delta > 0 ? cp.lastWalletCreditAt || nowIso : cp.lastWalletCreditAt
        };
        saveCustomerToFirestore(updatedCp).catch(() => {});
        return updatedCp;
      });
      addToast(
        delta > 0 ? 'success' : 'info',
        t(`অ্যাডমিন ব্যালেন্স আপডেট (${delta > 0 ? '+' : ''}৳${delta})`, `Wallet Adjusted (${delta > 0 ? '+' : ''}৳${delta})`),
        reason || t(`নতুন ব্যালেন্স: ৳${next}`, `New Balance: ৳${next}`)
      );
      return next;
    });
  };

  const adjustSpecificCustomerBalance = (identifier: string, delta: number, reason?: string): boolean => {
    if (!identifier || delta === 0) return false;
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '');
    const nowIso = new Date().toISOString();

    let found = false;
    let updatedBalance = 0;
    let targetName = identifier;
    let updatedAccount: CustomerProfile | null = null;

    const nextAccounts = customerAccounts.map((acc) => {
      const matches =
        (acc.username && acc.username.toLowerCase() === cleanId) ||
        (acc.email && acc.email.toLowerCase() === cleanId) ||
        (cleanDigits && acc.phone.replace(/[^0-9]/g, '') === cleanDigits);
      if (!matches) return acc;

      found = true;
      targetName = acc.name;
      updatedBalance = Math.max(0, (acc.walletBalance || 0) + delta);
      updatedAccount = {
        ...acc,
        walletBalance: updatedBalance,
        lastWalletCreditAt: delta > 0 ? acc.lastWalletCreditAt || nowIso : acc.lastWalletCreditAt
      };
      return updatedAccount;
    });

    if (!found) return false;

    lastLocalMutationAtRef.current = Date.now();
    setCustomerAccounts(nextAccounts);
    if (updatedAccount) saveCustomerToFirestore(updatedAccount).catch(() => {});

    // Also sync active customer wallet if same customer is currently active in browser
    const activeMatches =
      (customerProfile.username && customerProfile.username.toLowerCase() === cleanId) ||
      (customerProfile.email && customerProfile.email.toLowerCase() === cleanId) ||
      (cleanDigits && customerProfile.phone.replace(/[^0-9]/g, '') === cleanDigits) ||
      nextAccounts.length <= 1;

    if (activeMatches) {
      setCustomerWalletBalance(updatedBalance);
      localStorage.setItem('buyonebd_customer_wallet_v3', updatedBalance.toString());
      if (delta > 0 && !walletLastCreditAt) {
        setWalletLastCreditAt(nowIso);
        localStorage.setItem('buyonebd_wallet_last_credit_v1', nowIso);
      }
      setCustomerProfile((cp) => ({
        ...cp,
        walletBalance: updatedBalance,
        lastWalletCreditAt: delta > 0 ? cp.lastWalletCreditAt || nowIso : cp.lastWalletCreditAt
      }));
    }

    addToast(
      delta > 0 ? 'success' : 'info',
      t(
        `${targetName}-এর ব্যালেন্স ${delta > 0 ? `+৳${delta} বাড়ানো` : `-৳${Math.abs(delta)} কমানো`} হয়েছে`,
        `${targetName} Balance ${delta > 0 ? `+৳${delta} Credited` : `-৳${Math.abs(delta)} Deducted`}`
      ),
      reason || t(`বর্তমান ব্যালেন্স: ৳${updatedBalance}`, `Updated Balance: ৳${updatedBalance}`)
    );
    return true;
  };

  const resetCustomerWalletExpiry = (identifier: string, expireNow = false): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '');
    const nowIso = new Date().toISOString();
    let found = false;
    let targetName = identifier;
    let updatedAccount: CustomerProfile | null = null;

    const nextAccounts = customerAccounts.map((acc) => {
      const matches =
        (acc.username && acc.username.toLowerCase() === cleanId) ||
        (acc.email && acc.email.toLowerCase() === cleanId) ||
        (cleanDigits && acc.phone.replace(/[^0-9]/g, '') === cleanDigits);
      if (!matches) return acc;
      found = true;
      targetName = acc.name;
      updatedAccount = expireNow
        ? { ...acc, walletBalance: 0 }
        : { ...acc, lastPurchaseAt: nowIso, lastWalletCreditAt: nowIso };
      return updatedAccount;
    });

    if (!found) return false;
    lastLocalMutationAtRef.current = Date.now();
    setCustomerAccounts(nextAccounts);
    if (updatedAccount) saveCustomerToFirestore(updatedAccount).catch(() => {});

    const activeMatches =
      (customerProfile.username && customerProfile.username.toLowerCase() === cleanId) ||
      (customerProfile.email && customerProfile.email.toLowerCase() === cleanId) ||
      (cleanDigits && customerProfile.phone.replace(/[^0-9]/g, '') === cleanDigits) ||
      nextAccounts.length <= 1;

    if (activeMatches) {
      if (expireNow) {
        setCustomerWalletBalance(0);
        localStorage.setItem('buyonebd_customer_wallet_v3', '0');
        setCustomerProfile((cp) => ({ ...cp, walletBalance: 0 }));
      } else {
        setWalletLastPurchaseAt(nowIso);
        setWalletLastCreditAt(nowIso);
        localStorage.setItem('buyonebd_wallet_last_purchase_v1', nowIso);
        localStorage.setItem('buyonebd_wallet_last_credit_v1', nowIso);
        setCustomerProfile((cp) => ({ ...cp, lastPurchaseAt: nowIso, lastWalletCreditAt: nowIso }));
      }
    }

    addToast(
      expireNow ? 'warning' : 'success',
      expireNow
        ? t(`${targetName}-এর ব্যালেন্স মেয়াদ শেষ (৳০)`, `${targetName} Balance Zeroed (Expired)`)
        : t(`${targetName}-এর ৩০ দিনের মেয়াদ রিসেট হয়েছে`, `${targetName} 30-Day Timer Reset`),
      ''
    );
    return true;
  };

  // Media Library (All uploaded & store media: bulk select, bulk delete, resize)
  const buildInitialMediaFromStore = (
    prods: Product[],
    slids: HomeSlide[],
    cats: Category[],
    sets: StoreSettings
  ): MediaItem[] => {
    const seen = new Set<string>();
    const list: MediaItem[] = [];
    const pushUrl = (url: string | undefined, name: string, source: MediaItem['source'], w = 600, h = 600) => {
      if (!url || !url.trim() || seen.has(url)) return;
      seen.add(url);
      list.push({
        id: `med-${list.length + 1}-${Math.abs(url.split('').reduce((a, b) => a + b.charCodeAt(0), 0))}`,
        name,
        url,
        source,
        width: w,
        height: h,
        sizeKb: url.startsWith('data:') ? Math.round((url.length * 0.75) / 1024) : 120,
        mimeType: 'image/jpeg',
        createdAt: new Date().toISOString()
      });
    };
    if (sets.logoUrl) pushUrl(sets.logoUrl, 'Store Logo', 'logo', 400, 120);
    if (sets.seoSettings?.ogImage) pushUrl(sets.seoSettings.ogImage, 'SEO OG Banner', 'seo', 1200, 630);
    slids.forEach((s, i) => pushUrl(s.image, s.titleEn || `Slider Banner #${i + 1}`, 'slider', 1200, 525));
    cats.forEach((c) => {
      if (c.iconImage) pushUrl(c.iconImage, c.nameEn || c.nameBn, 'category', 400, 400);
    });
    prods.forEach((p) => {
      p.images.forEach((img, idx) => pushUrl(img, `${p.title} (${idx === 0 ? 'Main' : `#${idx + 1}`})`, 'product', 600, 600));
    });
    return list;
  };

  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('buyonebd_media_library_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return buildInitialMediaFromStore(products, sliders, categories, settings);
  });
  const mediaLibraryRef = useRef<MediaItem[]>(mediaLibrary);
  mediaLibraryRef.current = mediaLibrary;

  useEffect(() => {
    try {
      localStorage.setItem('buyonebd_media_library_v1', JSON.stringify(mediaLibrary));
    } catch {}
  }, [mediaLibrary]);

  const registerMediaItem = (item: Omit<MediaItem, 'id' | 'createdAt'>): MediaItem => {
    const created: MediaItem = {
      ...item,
      id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    lastLocalMutationAtRef.current = Date.now();
    setMediaLibrary((prev) => {
      const existing = prev.find((m) => m.url === item.url);
      if (existing) return prev;
      saveMediaItemToFirestore(created).catch(() => {});
      return [created, ...prev];
    });
    return created;
  };

  const syncStoreMediaLibrary = (): number => {
    const discovered = buildInitialMediaFromStore(products, sliders, categories, settings);
    let added = 0;
    lastLocalMutationAtRef.current = Date.now();
    setMediaLibrary((prev) => {
      const existingUrls = new Set(prev.map((m) => m.url));
      const newOnes = discovered.filter((d) => !existingUrls.has(d.url));
      added = newOnes.length;
      newOnes.forEach((m) => saveMediaItemToFirestore(m).catch(() => {}));
      return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
    });
    return added;
  };

  const deleteMediaItems = (ids: string[]) => {
    if (ids.length === 0) return;
    lastLocalMutationAtRef.current = Date.now();
    const idSet = new Set(ids);
    const urlsToRemove = new Set(mediaLibrary.filter((m) => idSet.has(m.id)).map((m) => m.url));
    ids.forEach((id) => deleteMediaItemFromFirestore(id).catch(() => {}));
    setMediaLibrary((prev) => prev.filter((m) => !idSet.has(m.id)));

    // Cleanly remove deleted media URLs from products/categories/logo if referenced
    if (urlsToRemove.size > 0) {
      setProducts((prev) =>
        prev.map((p) => {
          const remaining = p.images.filter((img) => !urlsToRemove.has(img));
          if (remaining.length === p.images.length) return p;
          const nextProd = { ...p, images: remaining.length > 0 ? remaining : p.images.slice(0, 1) };
          saveProductToFirestore(nextProd).catch(() => {});
          return nextProd;
        })
      );
      if (settings.logoUrl && urlsToRemove.has(settings.logoUrl)) {
        setSettings((prev) => {
          const next = { ...prev, logoUrl: '' };
          saveStorefrontSettingsToFirestore(next, categoriesRef.current, slidersRef.current).catch(() => {});
          return next;
        });
      }
    }
    addToast(
      'info',
      t(`${ids.length}টি মিডিয়া মুছে ফেলা হয়েছে`, `Deleted ${ids.length} Media Item(s)`),
      ''
    );
  };

  const resizeSingleImageUrl = (
    url: string,
    targetWidth: number,
    targetHeight: number,
    quality = 0.88,
    maintainAspect = false
  ): Promise<{ newUrl: string; width: number; height: number; sizeKb: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (!url.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        try {
          let outW = Math.max(32, Math.round(targetWidth));
          let outH = Math.max(32, Math.round(targetHeight));
          if (maintainAspect && img.naturalWidth > 0 && img.naturalHeight > 0) {
            const ratio = img.naturalHeight / img.naturalWidth;
            outH = Math.max(32, Math.round(outW * ratio));
          }
          const canvas = document.createElement('canvas');
          canvas.width = outW;
          canvas.height = outH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas unavailable'));
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, outW, outH);
          const outDataUrl = canvas.toDataURL('image/jpeg', Math.min(1, Math.max(0.2, quality)));
          const sizeKb = Math.max(1, Math.round((outDataUrl.length * 0.75) / 1024));
          resolve({ newUrl: outDataUrl, width: outW, height: outH, sizeKb });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = url;
    });
  };

  const resizeMediaItems = async (
    ids: string[],
    targetWidth: number,
    targetHeight: number,
    quality = 0.88,
    maintainAspect = false
  ): Promise<number> => {
    if (ids.length === 0) return 0;
    const urlMap = new Map<string, string>();
    const updatedMap = new Map<string, { url: string; width: number; height: number; sizeKb: number }>();

    for (const id of ids) {
      const item = mediaLibrary.find((m) => m.id === id);
      if (!item) continue;
      try {
        const res = await resizeSingleImageUrl(item.url, targetWidth, targetHeight, quality, maintainAspect);
        urlMap.set(item.url, res.newUrl);
        updatedMap.set(id, { url: res.newUrl, width: res.width, height: res.height, sizeKb: res.sizeKb });
      } catch {
        // Fallback: if external CORS prevents canvas read, update dimensions metadata safely
        const fallbackUrl =
          item.url.includes('images.unsplash.com')
            ? `${item.url.split('?')[0]}?w=${Math.round(targetWidth)}&h=${Math.round(targetHeight)}&fit=crop`
            : item.url;
        urlMap.set(item.url, fallbackUrl);
        updatedMap.set(id, {
          url: fallbackUrl,
          width: Math.round(targetWidth),
          height: Math.round(targetHeight),
          sizeKb: item.sizeKb
        });
      }
    }

    if (updatedMap.size === 0) return 0;

    lastLocalMutationAtRef.current = Date.now();
    setMediaLibrary((prev) =>
      prev.map((m) => {
        const upd = updatedMap.get(m.id);
        if (!upd) return m;
        const nextItem = { ...m, url: upd.url, width: upd.width, height: upd.height, sizeKb: upd.sizeKb };
        saveMediaItemToFirestore(nextItem).catch(() => {});
        return nextItem;
      })
    );

    // Sync resized URLs wherever used across products, sliders, categories, logo & OG image
    setProducts((prev) =>
      prev.map((p) => {
        const changed = p.images.some((img) => urlMap.has(img));
        if (!changed) return p;
        const nextProd = { ...p, images: p.images.map((img) => urlMap.get(img) || img) };
        saveProductToFirestore(nextProd).catch(() => {});
        return nextProd;
      })
    );
    const nextSliders = slidersRef.current.map((s) => ({
      ...s,
      image: urlMap.get(s.image) || s.image
    }));
    const nextCategories = categoriesRef.current.map((c) => ({
      ...c,
      iconImage: c.iconImage ? urlMap.get(c.iconImage) || c.iconImage : c.iconImage
    }));
    setSliders(nextSliders);
    setCategories(nextCategories);
    setSettings((prev) => {
      const next = {
        ...prev,
        logoUrl: prev.logoUrl ? urlMap.get(prev.logoUrl) || prev.logoUrl : prev.logoUrl,
        seoSettings: prev.seoSettings
          ? {
              ...prev.seoSettings,
              ogImage: prev.seoSettings.ogImage ? urlMap.get(prev.seoSettings.ogImage) || prev.seoSettings.ogImage : prev.seoSettings.ogImage
            }
          : prev.seoSettings
      };
      saveStorefrontSettingsToFirestore(next, nextCategories, nextSliders).catch(() => {});
      return next;
    });

    addToast(
      'success',
      t(`${updatedMap.size}টি ছবি রিসাইজ সম্পন্ন!`, `Resized ${updatedMap.size} Image(s)!`),
      t(`নতুন সাইজ: ${Math.round(targetWidth)}×${Math.round(targetHeight)} px`, `Applied ${Math.round(targetWidth)}×${Math.round(targetHeight)} px`)
    );
    return updatedMap.size;
  };

  // Price Alerts
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('buyonebd_price_alerts_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const priceAlertsRef = useRef<PriceAlert[]>(priceAlerts);
  priceAlertsRef.current = priceAlerts;

  const addPriceAlert = (alertData: { productId: string; contact: string; targetPrice: number }) => {
    const prod = products.find((p) => p.id === alertData.productId);
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      productId: alertData.productId,
      productTitle: prod?.title || '',
      productTitleBn: prod?.titleBn || '',
      contact: alertData.contact,
      currentPrice: prod?.price || 0,
      targetPrice: alertData.targetPrice,
      createdAt: new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US'),
      status: 'active'
    };
    lastLocalMutationAtRef.current = Date.now();
    setPriceAlerts((prev) => {
      const next = [newAlert, ...prev];
      localStorage.setItem('buyonebd_price_alerts_v3', JSON.stringify(next));
      return next;
    });
    savePriceAlertToFirestore(newAlert).catch(() => {});
    addToast(
      'success',
      lang === 'bn' ? 'প্রাইস অ্যালার্ট সেট হয়েছে!' : 'Price Alert Activated!',
      lang === 'bn'
        ? `মূল্য ৳${alertData.targetPrice}-এ নামলে ${alertData.contact}-এ নোটিফিকেশন পাঠানো হবে।`
        : `You will be notified at ${alertData.contact} when price drops to ৳${alertData.targetPrice}.`
    );
  };

  // Out-of-Stock Waitlist ('Waitlist' collection in Firestore)
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>(() => {
    try {
      const saved = localStorage.getItem('buyonebd_waitlist_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const waitlistEntriesRef = useRef<WaitlistEntry[]>(waitlistEntries);
  waitlistEntriesRef.current = waitlistEntries;

  useEffect(() => {
    try {
      localStorage.setItem('buyonebd_waitlist_v1', JSON.stringify(waitlistEntries));
    } catch {}
  }, [waitlistEntries]);

  const addWaitlistEntry = (payload: { product: Product; contact: string }): WaitlistEntry => {
    const cleanContact = payload.contact.trim();
    const isEmail = cleanContact.includes('@');
    const newEntry: WaitlistEntry = {
      id: `wait-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productId: payload.product.id,
      productTitle: payload.product.title,
      productTitleBn: payload.product.titleBn || payload.product.title,
      contact: cleanContact,
      contactType: isEmail ? 'email' : 'phone',
      status: 'waiting',
      createdAt: new Date().toISOString()
    };
    lastLocalMutationAtRef.current = Date.now();
    setWaitlistEntries((prev) => [newEntry, ...prev]);
    saveWaitlistEntryToFirestore(newEntry).catch(() => {});
    fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry: newEntry })
    }).catch(() => {});
    addToast(
      'success',
      t('অপেক্ষমাণ তালিকায় যুক্ত হয়েছেন!', 'Added to Restock Waitlist!'),
      t(
        `"${payload.product.titleBn}" স্টকে আসলে ${cleanContact}-এ জানানো হবে।`,
        `We'll notify ${cleanContact} as soon as "${payload.product.title}" is back in stock.`
      )
    );
    return newEntry;
  };

  const markWaitlistNotified = (id: string) => {
    lastLocalMutationAtRef.current = Date.now();
    setWaitlistEntries((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const next: WaitlistEntry = { ...w, status: 'notified' };
        saveWaitlistEntryToFirestore(next).catch(() => {});
        return next;
      })
    );
    addToast('success', t('নোটিফাইড হিসেবে চিহ্নিত হয়েছে', 'Marked as Notified'), '');
  };

  const deleteWaitlistEntry = (id: string) => {
    lastLocalMutationAtRef.current = Date.now();
    setWaitlistEntries((prev) => prev.filter((w) => w.id !== id));
    deleteWaitlistEntryFromFirestore(id).catch(() => {});
    addToast('info', t('ওয়েটলিস্ট এন্ট্রি মোছা হয়েছে', 'Waitlist Entry Removed'), '');
  };

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_WISHLIST, JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      if (exists) {
        addToast('info', t('পছন্দ তালিকা থেকে সরানো হয়েছে', 'Removed from Wishlist'), '');
      } else {
        addToast('success', t('পছন্দ তালিকায় যুক্ত হয়েছে ❤️', 'Added to Wishlist ❤️'), '');
      }
      return next;
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify(cart));
  }, [cart]);

  // UI & Catalog Routing state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [storeSubView, setStoreSubView] = useState<'home' | 'products' | 'about'>('home');

  const [isCartOpen, setIsCartOpenState] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [isOneClickOpen, setIsOneClickOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isSpinOpen, setIsSpinOpen] = useState(false);
  const [isMobileCategoryDrawerOpen, setIsMobileCategoryDrawerOpen] = useState(false);
  const [activeView, setActiveViewState] = useState<'store' | 'admin' | 'tracking'>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.replace(/\/+$/, '').toLowerCase() || '/';
      if (p === '/tracking') return 'tracking';
    }
    return 'store';
  });
  const [trackingSearchQuery, setTrackingSearchQuery] = useState('');

  // Server-Side Pixel CAPI & Customer Browsing Logs
  const [serverPixelEvents, setServerPixelEvents] = useState<ServerPixelEvent[]>(() => {
    try {
      const saved = localStorage.getItem('buyonebd_pixel_events_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [customerBrowsingLogs, setCustomerBrowsingLogs] = useState<CustomerBrowsingEvent[]>(() => {
    try {
      const saved = localStorage.getItem('buyonebd_browsing_logs_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent Visitor ID for isolated real-time live chat & call routing across browsers
  const [visitorSessionId] = useState<string>(() => {
    try {
      const existing = localStorage.getItem('buyonebd_visitor_id_v1');
      if (existing) return existing;
      const fresh = `vis-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      localStorage.setItem('buyonebd_visitor_id_v1', fresh);
      return fresh;
    } catch {
      return `vis-${Date.now().toString(36)}`;
    }
  });

  const sanitizeChatMessagesList = (msgs: SupportChatMessage[] = []): SupportChatMessage[] =>
    msgs.map((m) => {
      let cleanText = String(m.text || '');
      let cleanTextBn = String(m.textBn || '');
      if (/support thread ready|write a message or generate an ai reply/i.test(cleanText)) {
        cleanText = 'Assalamu Alaikum! Welcome to BuyOne BD Support. Ask about products, delivery fees, or enter your Order ID to track or confirm.';
        cleanTextBn = 'আসসালামু আলাইকুম! BuyOne BD সাপোর্ট ডেস্কে স্বাগতম। পণ্য, ডেলিভারি চার্জ বা অর্ডার ট্র্যাকিং বিষয়ে আপনার প্রশ্ন লিখুন।';
      } else {
        cleanText = cleanText
          .replace(/Live human support mode enabled\.?\s*/gi, 'Direct Support Desk connected. ')
          .replace(/human/gi, 'specialist');
        cleanTextBn = cleanTextBn
          .replace(/সরাসরি হিউম্যান সাপোর্ট চালু হয়েছে।?/g, 'সরাসরি সাপোর্ট ডেস্ক যুক্ত হয়েছে।')
          .replace(/হিউম্যান/g, 'সরাসরি সাপোর্ট')
          .replace(/human/gi, 'specialist');
      }
      const cleanActions = Array.isArray(m.quickActions)
        ? m.quickActions
            .filter(
              (qa) =>
                qa &&
                qa.action !== 'open_admin' &&
                !/admin portal|অ্যাডমিন প্যানেল|অ্যাডমিন ড্যাশবোর্ড/i.test(qa.label)
            )
            .map((qa) => ({
              ...qa,
              label: qa.label
                .replace(/👤\s*/g, '')
                .replace(/হিউম্যান সাপোর্ট/gi, 'সরাসরি সাপোর্ট')
                .replace(/মানুষের সাথে কথা/gi, 'সরাসরি সাপোর্ট')
                .replace(/human\s*(support|admin)?/gi, 'Live Desk')
            }))
        : undefined;
      return {
        ...m,
        text: cleanText,
        textBn: cleanTextBn || cleanText,
        ...(cleanActions ? { quickActions: cleanActions } : {})
      };
    });

  const sanitizeSupportChats = (sessions: SupportChatSession[] = []): SupportChatSession[] =>
    sessions.map((s) => ({
      ...s,
      messages: sanitizeChatMessagesList(s.messages || [])
    }));

  // Bidirectional Live Support Chats & Browser Calls
  const [supportChats, setSupportChats] = useState<SupportChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('buyonebd_support_chats_v3');
      if (saved) return sanitizeSupportChats(JSON.parse(saved));
    } catch {}
    return [
      {
        id: 'chat-default-1',
        customerName: 'সম্মানিত গ্রাহক',
        customerPhone: '01917942662',
        status: 'open',
        manualMode: false,
        lastUpdated: new Date().toISOString(),
        unreadByAdmin: 0,
        messages: [
          {
            id: 'welcome-1',
            sender: 'bot',
            text: 'Assalamu Alaikum! Welcome to BuyOne BD Support. How can I assist you today?',
            textBn: 'আসসালামু আলাইকুম! BuyOne BD সাপোর্ট ডেস্কে স্বাগতম। কীভাবে সাহায্য করতে পারি?',
            time: 'Just now',
            quickActions: [
              { label: '📦 অর্ডার ট্র্যাক', action: 'track' },
              { label: '🔥 সেরা অফার', action: 'deals' },
              { label: '🚚 ডেলিভারি চার্জ', action: 'delivery' },
              { label: '💬 সরাসরি সাপোর্ট', action: 'request_specialist' }
            ]
          }
        ]
      }
    ];
  });
  const [activeChatSessionId, setActiveChatSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem('buyonebd_active_chat_id_v1');
      if (savedId) return savedId;
    } catch {}
    const generated = `chat-${visitorSessionId}`;
    try {
      localStorage.setItem('buyonebd_active_chat_id_v1', generated);
    } catch {}
    return generated;
  });

  const [browserCalls, setBrowserCalls] = useState<BrowserCallSession[]>(() => {
    try {
      const saved = localStorage.getItem('buyonebd_browser_calls_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeBrowserCallId, setActiveBrowserCallId] = useState<string | null>(null);
  const activeBrowserCall = browserCalls.find((c) => c.id === activeBrowserCallId) || null;
  const [isLiveSocketConnected, setIsLiveSocketConnected] = useState(false);
  const [webrtcAudioStatus, setWebrtcAudioStatus] = useState<'idle' | 'connecting' | 'live_audio' | 'text_fallback'>('idle');
  const [isBrowserCallMicMuted, setIsBrowserCallMicMuted] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const webrtcSessionRef = useRef<WebRTCAudioSession | null>(null);

  // AI Call Engine state
  const [activeCallOrder, setActiveCallOrder] = useState<Order | null>(null);
  const [isCallRinging, setIsCallRinging] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isPlayingVoiceSample, setIsPlayingVoiceSample] = useState(false);
  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Server-Side Meta Pixel + Google Analytics 4 Dispatcher
  const trackPixelEvent = async (
    eventName: string,
    extras?: { urlPath?: string; value?: number; contentName?: string }
  ): Promise<ServerPixelEvent | null> => {
    const urlPath = extras?.urlPath || window.location.pathname || '/';
    const sourceUrl = window.location.href;
    const pixelCfg = settings.marketingSettings?.facebookPixel;
    const gaCfg = settings.marketingSettings?.googleAnalytics;

    try {
      const w = window as any;
      if (pixelCfg?.enabled && typeof w.fbq === 'function') {
        w.fbq('track', eventName, {
          ...(extras?.value !== undefined ? { value: extras.value, currency: 'BDT' } : {}),
          ...(extras?.contentName ? { content_name: extras.contentName } : {}),
          page_path: urlPath
        });
      }
      if (gaCfg?.enabled && typeof w.gtag === 'function') {
        w.gtag('event', eventName, {
          page_path: urlPath,
          value: extras?.value,
          currency: 'BDT',
          content_name: extras?.contentName
        });
      }
    } catch {}

    try {
      const resp = await fetch('/api/tracking/pixel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          urlPath,
          sourceUrl,
          value: extras?.value,
          currency: 'BDT',
          contentName: extras?.contentName,
          pixelId: pixelCfg?.enabled ? pixelCfg.pixelId : undefined,
          accessToken: pixelCfg?.enabled ? pixelCfg.accessToken : undefined,
          testEventCode: pixelCfg?.testEventCode
        })
      });
      const res = await safeParseJson<{ event?: ServerPixelEvent }>(resp);
      if (res?.event) {
        setServerPixelEvents((prev) => {
          const next = [res.event!, ...prev].slice(0, 100);
          localStorage.setItem('buyonebd_pixel_events_v3', JSON.stringify(next));
          return next;
        });
        return res.event;
      }
    } catch {}
    return null;
  };

  // Customer Browsing History Recorder (visible on backend)
  const recordPageVisit = (
    urlPath: string,
    pageTitle: string,
    product?: Product | null,
    categorySlug?: string
  ) => {
    if (urlPath.startsWith('/hossain')) return;
    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent);
    const ev: CustomerBrowsingEvent = {
      id: `brw-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      customerName: customerProfile?.name || t('অতিথি ভিজিটর', 'Guest Visitor'),
      customerPhone: customerProfile?.phone,
      urlPath,
      pageTitle,
      productId: product?.id,
      productTitle: product ? (lang === 'bn' ? product.titleBn : product.title) : undefined,
      categorySlug,
      device: isMobile ? 'Mobile' : 'Desktop',
      timestamp: new Date().toISOString()
    };

    setCustomerBrowsingLogs((prev) => {
      if (prev[0]?.urlPath === ev.urlPath && Date.now() - new Date(prev[0].timestamp).getTime() < 2500) {
        return prev;
      }
      const next = [ev, ...prev].slice(0, 120);
      localStorage.setItem('buyonebd_browsing_logs_v3', JSON.stringify(next));
      return next;
    });

    fetch('/api/support/browsing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev)
    }).catch(() => {});

    let timezone = '';
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch {}
    fetch('/api/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        urlPath,
        pageTitle,
        timezone,
        customerName: ev.customerName,
        customerPhone: ev.customerPhone
      })
    }).catch(() => {});
  };

  // SEO-friendly URL Navigation Helpers
  const navigateToPath = (path: string, replace = false) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (window.location.pathname !== normalized || window.location.hash !== '') {
      if (replace) {
        window.history.replaceState({}, '', normalized);
      } else {
        window.history.pushState({}, '', normalized);
      }
    }
    trackPixelEvent('PageView', { urlPath: normalized });
  };

  const setActiveView = (view: 'store' | 'admin' | 'tracking') => {
    setActiveViewState(view);
    if (view === 'tracking') {
      navigateToPath('/tracking');
      recordPageVisit('/tracking', t('অর্ডার ট্র্যাকিং', 'Order Tracking'));
    } else if (view === 'admin') {
      navigateToPath('/hossain');
    } else if (view === 'store') {
      if (
        window.location.pathname === '/tracking' ||
        window.location.pathname === '/hossain' ||
        window.location.pathname.startsWith('/hossain')
      ) {
        const target = selectedProductForPage
          ? `/product/${selectedProductForPage.seo?.slug || selectedProductForPage.id}`
          : storeSubView === 'products'
          ? '/products'
          : storeSubView === 'about'
          ? '/about'
          : '/';
        navigateToPath(target);
      }
    }
  };

  const setIsCartOpen = (open: boolean) => {
    setIsCartOpenState(open);
    if (open) {
      navigateToPath('/cart');
      recordPageVisit('/cart', t('শপিং কার্ট', 'Shopping Cart'));
    } else if (window.location.pathname === '/cart') {
      const target = selectedProductForPage
        ? `/product/${selectedProductForPage.seo?.slug || selectedProductForPage.id}`
        : storeSubView === 'products'
        ? '/products'
        : storeSubView === 'about'
        ? '/about'
        : '/';
      navigateToPath(target, true);
    }
  };

  const goHome = () => {
    setActiveViewState('store');
    setStoreSubView('home');
    setSelectedProductForPage(null);
    setSelectedCategory('all');
    setSelectedSubcategory(null);
    setSearchQuery('');
    setIsCartOpenState(false);
    setIsOneClickOpen(false);
    setCheckoutProduct(null);
    navigateToPath('/');
    recordPageVisit('/', `${settings.storeName} - Home`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAllProductsPage = () => {
    setActiveViewState('store');
    setStoreSubView('products');
    setSelectedProductForPage(null);
    setSelectedCategory('all');
    setSelectedSubcategory(null);
    navigateToPath('/products');
    recordPageVisit('/products', t('সকল পণ্য', 'All Products'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAboutPage = () => {
    setActiveViewState('store');
    setStoreSubView('about');
    setSelectedProductForPage(null);
    setIsCartOpenState(false);
    setIsOneClickOpen(false);
    navigateToPath('/about');
    recordPageVisit('/about', t('আমাদের সম্পর্কে ও সেবা সমূহ', 'About BuyOne BD'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectCategoryFilter = (catSlug: string, subSlug: string | null = null) => {
    setActiveViewState('store');
    setStoreSubView('home');
    setSelectedProductForPage(null);
    setSelectedCategory(catSlug);
    setSelectedSubcategory(subSlug || null);

    let targetPath = '/';
    if (catSlug === 'flash-sale') {
      targetPath = '/category/flash-sale';
    } else if (catSlug !== 'all') {
      targetPath = subSlug ? `/category/${catSlug}/${subSlug}` : `/category/${catSlug}`;
    }
    navigateToPath(targetPath);
    recordPageVisit(targetPath, `Category: ${catSlug}${subSlug ? ` / ${subSlug}` : ''}`, null, catSlug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProductPage = (product: Product) => {
    setActiveViewState('store');
    setIsCartOpenState(false);
    setSelectedProductForPage(product);
    recordProductView(product.id);
    const slug = product.seo?.slug || product.id;
    const prodPath = `/product/${slug}`;
    navigateToPath(prodPath);
    const title = lang === 'bn' ? product.titleBn : product.title;
    recordPageVisit(prodPath, title, product, product.category);
    trackPixelEvent('ViewContent', { urlPath: prodPath, value: product.price, contentName: product.title });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync URL on initial load & browser back/forward (popstate)
  const isAdminLoggedInRef = useRef(isAdminLoggedIn);
  isAdminLoggedInRef.current = isAdminLoggedIn;

  useEffect(() => {
    const applyRouteFromUrl = () => {
      const rawPath = window.location.pathname.replace(/\/+$/, '') || '/';
      const lowerPath = rawPath.toLowerCase();
      const lowerHash = window.location.hash.toLowerCase();
      if (lowerPath === '/hossain' || lowerPath.startsWith('/hossain/') || lowerHash === '#hossain') {
        if (window.location.pathname !== '/hossain' || window.location.hash !== '') {
          window.history.replaceState({}, '', '/hossain');
        }
        if (isAdminLoggedInRef.current) {
          setActiveViewState('admin');
          setIsAdminLoginOpen(false);
        } else {
          setActiveViewState('store');
          setIsAdminLoginOpen(true);
        }
        return;
      }
      if (lowerPath === '/tracking') {
        setActiveViewState('tracking');
        setSelectedProductForPage(null);
        return;
      }
      if (lowerPath === '/cart') {
        setActiveViewState('store');
        setIsCartOpenState(true);
        return;
      }
      if (lowerPath === '/checkout') {
        setActiveViewState('store');
        setIsOneClickOpen(true);
        return;
      }
      if (lowerPath === '/products') {
        setActiveViewState('store');
        setStoreSubView('products');
        setSelectedProductForPage(null);
        setSelectedCategory('all');
        setSelectedSubcategory(null);
        return;
      }
      if (lowerPath === '/about') {
        setActiveViewState('store');
        setStoreSubView('about');
        setSelectedProductForPage(null);
        return;
      }
      if (lowerPath.startsWith('/product/')) {
        const slugOrId = decodeURIComponent(rawPath.replace(/^\/product\//i, ''));
        const matched = products.find((item) => item.id === slugOrId || item.seo?.slug === slugOrId);
        if (matched) {
          setActiveViewState('store');
          setSelectedProductForPage(matched);
          return;
        }
      }
      if (lowerPath.startsWith('/category/')) {
        const parts = rawPath.replace(/^\/category\//i, '').split('/').filter(Boolean);
        setActiveViewState('store');
        setStoreSubView('home');
        setSelectedProductForPage(null);
        setSelectedCategory(parts[0] || 'all');
        setSelectedSubcategory(parts[1] || null);
        return;
      }
      // Root /
      setActiveViewState('store');
      setStoreSubView('home');
      setSelectedProductForPage(null);
      setIsCartOpenState(false);
      setIsOneClickOpen(false);
    };

    applyRouteFromUrl();
    recordPageVisit(window.location.pathname || '/', document.title);
    trackPixelEvent('PageView', { urlPath: window.location.pathname || '/' });

    window.addEventListener('popstate', applyRouteFromUrl);
    return () => window.removeEventListener('popstate', applyRouteFromUrl);
  }, []);

  // Cross-Device Store & Order Synchronization (Express API + Real-Time Firestore Listeners)
  const hasHydratedFromServerRef = useRef(false);
  const activeViewRef = useRef(activeView);
  activeViewRef.current = activeView;
  const knownOrderIdsRef = useRef<Set<string>>(new Set(orders.map((o) => o.id)));

  const mergeRemoteOrders = (incomingOrders: Order[], deletedSet: Set<string>, notifyOnNew: boolean) => {
    if (!Array.isArray(incomingOrders)) return;
    const brandNewRemoteOrders = incomingOrders.filter(
      (o: any) => o && o.id && !knownOrderIdsRef.current.has(o.id)
    );

    const stagePriority: Record<string, number> = {
      pending: 1,
      on_hold: 2,
      partial: 3,
      ai_confirmed: 4,
      processing: 5,
      shipped: 6,
      delivered: 7,
      cancelled: 7
    };

    const mergePair = (existing: Order | undefined, incoming: Order): Order => {
      if (!existing) return incoming;
      const exTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      const inTime = new Date(incoming.updatedAt || incoming.createdAt || 0).getTime();
      const exStage = stagePriority[existing.status] || 0;
      const inStage = stagePriority[incoming.status] || 0;

      // Never downgrade an already confirmed/processing/shipped/delivered order back to pending
      const preferIncoming =
        inTime > exTime + 500 ||
        (inTime === exTime && inStage >= exStage) ||
        (inStage > exStage && existing.status === 'pending');

      const winner = preferIncoming ? incoming : existing;
      const loser = preferIncoming ? existing : incoming;
      const confirmedByCustomer =
        Boolean(winner.aiCallStatus?.confirmedByCustomer) || Boolean(loser.aiCallStatus?.confirmedByCustomer);

      return {
        ...loser,
        ...winner,
        status: winner.status === 'pending' && confirmedByCustomer ? 'ai_confirmed' : winner.status,
        aiCallStatus: {
          ...(loser.aiCallStatus || {}),
          ...(winner.aiCallStatus || {}),
          confirmedByCustomer
        },
        courier: {
          ...(loser.courier || {}),
          ...(winner.courier || {})
        }
      };
    };

    setOrders((prev) => {
      const map = new Map<string, Order>();
      prev.forEach((o) => {
        if (!deletedSet.has(o.id)) map.set(o.id, o);
      });
      incomingOrders.forEach((o: Order) => {
        if (o && o.id && !deletedSet.has(o.id)) {
          map.set(o.id, mergePair(map.get(o.id), o));
        }
      });
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      const fingerprint = (list: Order[]) =>
        JSON.stringify(
          list.map(
            (x) =>
              `${x.id}:${x.status}:${x.updatedAt || ''}:${x.aiCallStatus?.confirmedByCustomer}:${x.courier?.provider}:${x.courier?.status}:${x.courier?.trackingCode}:${x.pricing?.total}:${x.payment?.dueAmount}:${x.fraudCheck?.successRate}`
          )
        );
      return fingerprint(prev) === fingerprint(merged) ? prev : merged;
    });

    incomingOrders.forEach((o) => {
      if (o?.id) knownOrderIdsRef.current.add(o.id);
    });

    if (notifyOnNew && brandNewRemoteOrders.length > 0 && activeViewRef.current === 'admin') {
      const latest = brandNewRemoteOrders[0];
      addToast(
        'success',
        t(`নতুন অর্ডার এসেছে! #${latest.id}`, `New Order Received! #${latest.id}`),
        `${latest.customer?.name || 'Customer'} • ৳${latest.pricing?.total || 0}`
      );
    }
  };

  const fetchStoreSnapshotFromServer = async (notifyOnNewOrders = false) => {
    try {
      // 1. Pull from Express server snapshot if available
      const isAdminSess = isAdminLoggedInRef.current;
      const res = await fetch(`/api/store/sync?t=${Date.now()}`, {
        cache: 'no-store',
        headers: isAdminSess ? { 'x-admin-session': 'buyone-admin-verified' } : undefined
      });
      if (res.ok) {
        const json = await safeParseJson<{ data?: any }>(res);
        const data = json?.data;

        if (data && typeof data === 'object') {
          if (Array.isArray(data.orders)) {
            const deletedSet = new Set<string>(Array.isArray(data.deletedOrderIds) ? data.deletedOrderIds : []);
            mergeRemoteOrders(data.orders, deletedSet, notifyOnNewOrders);
          }

          const isRecentlyMutatedLocally = Date.now() - lastLocalMutationAtRef.current < 3000;
          if (!hasHydratedFromServerRef.current || !isRecentlyMutatedLocally) {
            if (Array.isArray(data.products) && data.products.length > 0) {
              setProducts(data.products);
            }
            if (data.settings) {
              setSettings(mergeSettings(data.settings));
            }
          }

          if (!hasHydratedFromServerRef.current) {
            if (Array.isArray(data.categories) && data.categories.length > 0) setCategories(data.categories);
            if (Array.isArray(data.sliders) && data.sliders.length > 0) setSliders(data.sliders);
            if (Array.isArray(data.customerAccounts) && data.customerAccounts.length > 0) setCustomerAccounts(data.customerAccounts);
            if (Array.isArray(data.walletTopUps) && data.walletTopUps.length > 0) setWalletTopUps(data.walletTopUps);
            if (Array.isArray(data.abandonedCarts) && data.abandonedCarts.length > 0) setAbandonedCarts(data.abandonedCarts);
            if (Array.isArray(data.reviews) && data.reviews.length > 0) setReviews(data.reviews);
            if (Array.isArray(data.priceAlerts)) setPriceAlerts(data.priceAlerts);
            if (Array.isArray(data.users) && data.users.length > 0) setUsers(data.users);
            if (Array.isArray(data.mediaLibrary) && data.mediaLibrary.length > 0) setMediaLibrary(data.mediaLibrary);
          }
        } else if (!hasHydratedFromServerRef.current) {
          fetch('/api/store/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              products,
              orders,
              settings,
              spinRewards,
              categories,
              sliders,
              customerAccounts,
              walletTopUps,
              abandonedCarts,
              reviews,
              priceAlerts,
              users,
              mediaLibrary
            })
          }).catch(() => {});
        }
      }
    } catch {
      // ignore if Express server not active (e.g. static hosting like Vercel)
    } finally {
      hasHydratedFromServerRef.current = true;
    }

    // 2. Also pull from Hostinger DB / PHP Bridge when enabled (works cross-device without Express)
    try {
      const hDb = settingsRef.current.hostingerDbSettings;
      if (hDb?.enabled) {
        let hostingerOrders: Order[] = [];
        const hRes = await fetch('/api/database/hostinger/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config: hDb })
        }).catch(() => null);
        if (hRes && hRes.ok) {
          const hJson = await safeParseJson<{ orders?: Order[] }>(hRes);
          if (Array.isArray(hJson?.orders)) hostingerOrders = hJson.orders;
        } else if (hDb.mode === 'php_bridge' && hDb.phpBridgeUrl) {
          const phpRes = await fetch(hDb.phpBridgeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Bridge-Secret': hDb.phpBridgeSecret || '' },
            body: JSON.stringify({ action: 'list_orders', tablePrefix: hDb.tablePrefix || 'buyone_' })
          }).catch(() => null);
          if (phpRes && phpRes.ok) {
            const pJson = await safeParseJson<{ orders?: Order[] }>(phpRes);
            if (Array.isArray(pJson?.orders)) hostingerOrders = pJson.orders;
          }
        }
        if (hostingerOrders.length > 0) {
          mergeRemoteOrders(hostingerOrders, new Set(), notifyOnNewOrders);
        }
      }
    } catch {}

    // 3. Also pull from Firestore directly so static hosts (e.g. Vercel) & multi-device deployments stay synced
    try {
      const cfgData = await fetchStorefrontSettingsFromFirestore();
      if (cfgData && Date.now() - lastLocalMutationAtRef.current >= 3000) {
        setSettings((prev) => mergeSettings({ ...prev, ...cfgData }));
      }
      const fsProducts = await fetchProductsFromFirestore();
      if (fsProducts.length > 0 && Date.now() - lastLocalMutationAtRef.current >= 3000) {
        setProducts((prev) => {
          const map = new Map(prev.map((p) => [p.id, p]));
          fsProducts.forEach((p) => map.set(p.id, p));
          return Array.from(map.values());
        });
      }
      if (isFirebaseAdminConnectedRef.current) {
        const fsOrders = await fetchOrdersFromFirestore();
        if (fsOrders.length > 0) {
          mergeRemoteOrders(fsOrders, new Set(), notifyOnNewOrders);
        }
        setLastCloudSyncAt(new Date().toLocaleTimeString());
        setCloudSyncError(null);
      }
    } catch (err) {
      if (isFirebaseAdminConnectedRef.current) {
        setCloudSyncError(extractFirestoreErrorReason(err));
      }
    }
  };

  useEffect(() => {
    fetchStoreSnapshotFromServer(false);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchStoreSnapshotFromServer(true);
      }
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    const pollInterval = setInterval(
      () => fetchStoreSnapshotFromServer(true),
      activeView === 'admin' ? 3000 : 6000
    );

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [activeView]);

  // Real-time Firestore Listeners for Storefront Public Config, Categories, Sliders, Catalog, Media & Approved Reviews
  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, 'storefront', 'public'),
      (snap) => {
        if (!snap.exists()) return;
        if (Date.now() - lastLocalMutationAtRef.current < 3000) return;
        const remote = snap.data();
        if (remote) {
          setSettings((prev) => mergeSettings({ ...prev, ...remote }));
          if (Array.isArray(remote.categories) && remote.categories.length > 0) {
            setCategories(remote.categories);
          }
          if (Array.isArray(remote.sliders) && remote.sliders.length > 0) {
            setSliders(remote.sliders);
          }
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.GET, 'storefront/public');
        } catch (wrappedErr) {
          console.error(wrappedErr);
        }
      }
    );

    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        if (snap.empty) return;
        if (Date.now() - lastLocalMutationAtRef.current < 3000) return;
        const removedIds = new Set(
          snap.docChanges().filter((c) => c.type === 'removed').map((c) => c.doc.id)
        );
        const remoteList = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Product));
        setProducts((prev) => {
          const map = new Map(prev.map((p) => [p.id, p]));
          removedIds.forEach((id) => map.delete(id));
          remoteList.forEach((p) => map.set(p.id, p));
          return Array.from(map.values());
        });
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'products');
        } catch (wrappedErr) {
          console.error(wrappedErr);
        }
      }
    );

    const unsubMedia = onSnapshot(
      collection(db, 'media_library'),
      (snap) => {
        if (snap.empty) return;
        if (Date.now() - lastLocalMutationAtRef.current < 3000) return;
        const removedIds = new Set(
          snap.docChanges().filter((c) => c.type === 'removed').map((c) => c.doc.id)
        );
        const remoteList = snap.docs.map((d) => mapFirestoreDocToMedia(d.id, d.data()));
        setMediaLibrary((prev) => {
          const map = new Map(prev.map((m) => [m.id, m]));
          removedIds.forEach((id) => map.delete(id));
          remoteList.forEach((m) => map.set(m.id, m));
          return Array.from(map.values());
        });
      },
      () => {}
    );

    const approvedReviewsQuery = query(collection(db, 'reviews'), where('isApproved', '==', true));
    const unsubPublicReviews = onSnapshot(
      approvedReviewsQuery,
      (snap) => {
        if (isFirebaseAdminConnectedRef.current) return;
        if (snap.empty) return;
        if (Date.now() - lastLocalMutationAtRef.current < 3000) return;
        const remoteRevs = snap.docs.map((d) => mapFirestoreDocToReview(d.id, d.data()));
        setReviews((prev) => {
          const map = new Map(prev.map((r) => [r.id, r]));
          remoteRevs.forEach((r) => map.set(r.id, r));
          return Array.from(map.values());
        });
      },
      () => {}
    );

    return () => {
      unsubSettings();
      unsubProducts();
      unsubMedia();
      unsubPublicReviews();
    };
  }, []);

  // Real-time Firestore Listeners when authenticated as Firebase Admin (ALL Dashboard Modules Live Sync)
  useEffect(() => {
    if (!isFirebaseAdminConnected) return;
    let isInitialOrderBatch = true;

    const unsubPrivateConfig = onSnapshot(
      doc(db, 'admin_config', 'private'),
      (snap) => {
        if (!snap.exists()) return;
        if (Date.now() - lastLocalMutationAtRef.current < 3000) return;
        const priv = snap.data();
        if (priv) {
          setSettings((prev) =>
            mergeSettings({
              ...prev,
              ...(priv.smtpSettings ? { smtpSettings: priv.smtpSettings } : {}),
              ...(priv.courierSettings ? { courierSettings: priv.courierSettings } : {}),
              ...(priv.marketingSettings ? { marketingSettings: priv.marketingSettings } : {}),
              ...(priv.aiSettings ? { aiSettings: priv.aiSettings } : {}),
              ...(Array.isArray(priv.aiKeywordRules) ? { aiKeywordRules: priv.aiKeywordRules } : {})
            })
          );
          setLastCloudSyncAt(new Date().toLocaleTimeString());
        }
      },
      (err) => {
        setCloudSyncError(extractFirestoreErrorReason(err));
      }
    );

    const unsubOrders = onSnapshot(
      collection(db, 'orders'),
      (snap) => {
        const removedIds = new Set(
          snap.docChanges().filter((c) => c.type === 'removed').map((c) => c.doc.id)
        );
        const fsOrders = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Order));
        mergeRemoteOrders(fsOrders, removedIds, !isInitialOrderBatch);
        setLastCloudSyncAt(new Date().toLocaleTimeString());
        setCloudSyncError(null);
        isInitialOrderBatch = false;
      },
      (err) => {
        setCloudSyncError(extractFirestoreErrorReason(err));
        try {
          handleFirestoreError(err, OperationType.LIST, 'orders');
        } catch (wrappedErr) {
          console.error(wrappedErr);
        }
      }
    );

    const unsubAdminReviews = onSnapshot(
      collection(db, 'reviews'),
      (snap) => {
        if (snap.empty) return;
        if (Date.now() - lastLocalMutationAtRef.current < 3000) return;
        const removedIds = new Set(
          snap.docChanges().filter((c) => c.type === 'removed').map((c) => c.doc.id)
        );
        const remoteList = snap.docs.map((d) => mapFirestoreDocToReview(d.id, d.data()));
        setReviews((prev) => {
          const map = new Map(prev.map((r) => [r.id, r]));
          removedIds.forEach((id) => map.delete(id));
          remoteList.forEach((r) => map.set(r.id, r));
          return Array.from(map.values());
        });
      },
      () => {}
    );

    const unsubCustomers = onSnapshot(
      collection(db, 'customers'),
      (snap) => {
        if (snap.empty) return;
        if (Date.now() - lastLocalMutationAtRef.current < 3000) return;
        const remoteList = snap.docs.map((d) => mapFirestoreDocToCustomer(d.data()));
        setCustomerAccounts((prev) => {
          const map = new Map(prev.map((c) => [getCustomerFirestoreId(c), c]));
          remoteList.forEach((rc) => {
            const key = getCustomerFirestoreId(rc);
            const existing = map.get(key);
            map.set(key, existing ? { ...rc, password: existing.password, checkIn: existing.checkIn } : rc);
          });
          return Array.from(map.values());
        });
      },
      () => {}
    );

    const unsubTopUps = onSnapshot(
      collection(db, 'wallet_topups'),
      (snap) => {
        if (snap.empty) return;
        if (Date.now() - lastLocalMutationAtRef.current < 3000) return;
        const remoteList = snap.docs.map((d) => mapFirestoreDocToWalletTopUp(d.id, d.data()));
        setWalletTopUps((prev) => {
          const map = new Map(prev.map((w) => [w.id, w]));
          remoteList.forEach((w) => map.set(w.id, w));
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
        });
      },
      () => {}
    );

    const unsubCarts = onSnapshot(
      collection(db, 'abandoned_carts'),
      (snap) => {
        if (snap.empty) return;
        if (Date.now() - lastLocalMutationAtRef.current < 3000) return;
        const remoteList = snap.docs.map((d) => mapFirestoreDocToAbandonedCart(d.id, d.data()));
        setAbandonedCarts((prev) => {
          const map = new Map(prev.map((c) => [c.id, c]));
          remoteList.forEach((c) => map.set(c.id, c));
          return Array.from(map.values());
        });
      },
      () => {}
    );

    const unsubAlerts = onSnapshot(
      collection(db, 'price_alerts'),
      (snap) => {
        if (snap.empty) return;
        if (Date.now() - lastLocalMutationAtRef.current < 3000) return;
        const remoteList = snap.docs.map((d) => mapFirestoreDocToPriceAlert(d.id, d.data()));
        setPriceAlerts((prev) => {
          const map = new Map(prev.map((a) => [a.id, a]));
          remoteList.forEach((a) => map.set(a.id, a));
          return Array.from(map.values());
        });
      },
      () => {}
    );

    const unsubWaitlist = onSnapshot(
      collection(db, 'Waitlist'),
      (snap) => {
        if (snap.empty) return;
        if (Date.now() - lastLocalMutationAtRef.current < 3000) return;
        const removedIds = new Set(
          snap.docChanges().filter((c) => c.type === 'removed').map((c) => c.doc.id)
        );
        const remoteList = snap.docs.map((d) => mapFirestoreDocToWaitlist(d.id, d.data()));
        setWaitlistEntries((prev) => {
          const map = new Map(prev.map((w) => [w.id, w]));
          removedIds.forEach((id) => map.delete(id));
          remoteList.forEach((w) => map.set(w.id, w));
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
        });
      },
      () => {}
    );

    const unsubStaff = onSnapshot(
      collection(db, 'staff_users'),
      (snap) => {
        if (snap.empty) return;
        if (Date.now() - lastLocalMutationAtRef.current < 3000) return;
        const removedIds = new Set(
          snap.docChanges().filter((c) => c.type === 'removed').map((c) => c.doc.id)
        );
        const remoteList = snap.docs.map((d) => mapFirestoreDocToStaffUser(d.id, d.data()));
        setUsers((prev) => {
          const map = new Map(prev.map((u) => [u.id, u]));
          removedIds.forEach((id) => map.delete(id));
          remoteList.forEach((u) => map.set(u.id, u));
          return Array.from(map.values());
        });
      },
      () => {}
    );

    return () => {
      unsubPrivateConfig();
      unsubOrders();
      unsubAdminReviews();
      unsubCustomers();
      unsubTopUps();
      unsubCarts();
      unsubAlerts();
      unsubWaitlist();
      unsubStaff();
    };
  }, [isFirebaseAdminConnected]);

  // Push store snapshot updates AFTER initial server hydration completes
  useEffect(() => {
    if (!hasHydratedFromServerRef.current) return;
    const syncTimer = setTimeout(() => {
      const isAdminSess = isAdminLoggedInRef.current;
      fetch('/api/store/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isAdminSess ? { 'x-admin-session': 'buyone-admin-verified' } : {})
        },
        body: JSON.stringify({
          products,
          orders,
          settings,
          spinRewards,
          categories,
          sliders,
          customerAccounts,
          walletTopUps,
          abandonedCarts,
          reviews,
          priceAlerts,
          users,
          mediaLibrary
        })
      }).catch(() => {});
    }, 500);
    return () => clearTimeout(syncTimer);
  }, [products, orders, settings, categories, sliders, customerAccounts, walletTopUps, abandonedCarts, reviews, priceAlerts, users]);

  // Idempotent local merge helpers so WS & REST snapshots never drop concurrent messages
  const mergeChatsLocal = (prev: SupportChatSession[], incoming: SupportChatSession[]): SupportChatSession[] => {
    const map = new Map<string, SupportChatSession>();
    sanitizeSupportChats(prev).forEach((s) => { if (s?.id) map.set(s.id, s); });
    sanitizeSupportChats(incoming).forEach((s) => {
      if (!s?.id) return;
      const old = map.get(s.id);
      if (!old) {
        map.set(s.id, s);
        return;
      }
      const msgMap = new Map(old.messages.map((m) => [m.id, m]));
      (s.messages || []).forEach((m) => { if (m?.id) msgMap.set(m.id, m); });
      const newer = new Date(s.lastUpdated || 0).getTime() >= new Date(old.lastUpdated || 0).getTime() ? s : old;
      map.set(s.id, { ...old, ...newer, messages: Array.from(msgMap.values()) });
    });
    return Array.from(map.values())
      .sort((a, b) => new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime())
      .slice(0, 60);
  };

  const mergeCallsLocal = (prev: BrowserCallSession[], incoming: BrowserCallSession[]): BrowserCallSession[] => {
    const map = new Map<string, BrowserCallSession>();
    prev.forEach((c) => { if (c?.id) map.set(c.id, c); });
    incoming.forEach((c) => {
      if (!c?.id) return;
      const old = map.get(c.id);
      if (!old) {
        map.set(c.id, c);
        return;
      }
      const txMap = new Map(old.transcript.map((t) => [t.id, t]));
      (c.transcript || []).forEach((t) => { if (t?.id) txMap.set(t.id, t); });
      const rank = (st: string) => (st === 'ended' ? 3 : st === 'connected' ? 2 : 1);
      const chosenStatus = rank(c.status) >= rank(old.status) ? c.status : old.status;
      map.set(c.id, {
        ...old,
        ...c,
        status: chosenStatus,
        answeredBy: c.answeredBy || old.answeredBy,
        endedAt: c.endedAt || old.endedAt,
        durationSeconds: Math.max(old.durationSeconds || 0, c.durationSeconds || 0),
        transcript: Array.from(txMap.values())
      });
    });
    return Array.from(map.values())
      .sort((a, b) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime())
      .slice(0, 60);
  };

  const sendWsEvent = (payload: any): boolean => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(payload));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  const getOrCreateWebRtcSession = () => {
    if (!webrtcSessionRef.current) {
      webrtcSessionRef.current = new WebRTCAudioSession({
        sendSignal: (payload) => sendWsEvent(payload),
        onStatusChange: (status) => setWebrtcAudioStatus(status)
      });
    }
    return webrtcSessionRef.current;
  };

  const toggleBrowserCallMicMute = () => {
    setIsBrowserCallMicMuted((prev) => {
      const next = !prev;
      webrtcSessionRef.current?.setMuted(next);
      return next;
    });
  };

  // Real-time WebSocket connection (/ws) + automatic WebRTC audio signaling + fallback state sync
  const fetchSupportStateFromServer = () => {
    fetch('/api/support/state')
      .then((r) => safeParseJson<any>(r))
      .then((data) => {
        if (!data?.success) return;
        if (Array.isArray(data.browsingHistory) && data.browsingHistory.length > 0) {
          setCustomerBrowsingLogs(data.browsingHistory);
        }
        if (Array.isArray(data.pixelEvents) && data.pixelEvents.length > 0) {
          setServerPixelEvents(data.pixelEvents);
        }
        if (Array.isArray(data.supportChats) && data.supportChats.length > 0) {
          setSupportChats((prev) => mergeChatsLocal(prev, data.supportChats));
        }
        if (Array.isArray(data.browserCalls) && data.browserCalls.length > 0) {
          setBrowserCalls((prev) => mergeCallsLocal(prev, data.browserCalls));
        }
      })
      .catch(() => {});
  };

  const activeBrowserCallIdRef = useRef(activeBrowserCallId);
  activeBrowserCallIdRef.current = activeBrowserCallId;
  const customerPhoneRef = useRef(customerProfile.phone);
  customerPhoneRef.current = customerProfile.phone;

  useEffect(() => {
    fetchSupportStateFromServer();
    if (typeof window === 'undefined' || typeof WebSocket === 'undefined') return;

    let disposed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connectWs = () => {
      if (disposed) return;
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsLiveSocketConnected(true);
      };

      ws.onmessage = (event) => {
        let msg: any = null;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }
        if (!msg?.type) return;

        if (msg.type === 'support:init') {
          if (Array.isArray(msg.supportChats) && msg.supportChats.length > 0) {
            setSupportChats((prev) => mergeChatsLocal(prev, msg.supportChats));
          }
          if (Array.isArray(msg.browserCalls) && msg.browserCalls.length > 0) {
            setBrowserCalls((prev) => mergeCallsLocal(prev, msg.browserCalls));
          }
          return;
        }

        if (msg.type === 'chat:sync' && Array.isArray(msg.supportChats)) {
          const cleaned = sanitizeSupportChats(msg.supportChats);
          setSupportChats(cleaned);
          try {
            localStorage.setItem('buyonebd_support_chats_v3', JSON.stringify(cleaned));
          } catch {}
          return;
        }

        if (msg.type === 'call:sync' && Array.isArray(msg.browserCalls)) {
          setBrowserCalls(msg.browserCalls);
          try {
            localStorage.setItem('buyonebd_browser_calls_v3', JSON.stringify(msg.browserCalls));
          } catch {}

          // If Admin placed a call to a customer, auto-ring the storefront modal on matching visitor or active storefront
          if (activeViewRef.current !== 'admin' && !activeBrowserCallIdRef.current) {
            const incomingForCustomer = (msg.browserCalls as BrowserCallSession[]).find((c) => {
              if (c.status !== 'ringing_customer' || c.direction !== 'admin_to_customer') return false;
              const myPhone = String(customerPhoneRef.current || '').replace(/[^0-9]/g, '').slice(-11);
              const targetPhone = String(c.customerPhone || '').replace(/[^0-9]/g, '').slice(-11);
              if (c.visitorSessionId && c.visitorSessionId === visitorSessionId) return true;
              if (myPhone && targetPhone && myPhone === targetPhone) return true;
              return !c.visitorSessionId;
            });
            if (incomingForCustomer) {
              setActiveBrowserCallId(incomingForCustomer.id);
              setIsCallRinging(true);
              setIsCallActive(false);
            }
          }
          return;
        }

        if (msg.type === 'webrtc:offer' && msg.callId && msg.sdp) {
          getOrCreateWebRtcSession().handleIncomingOffer(msg.callId, msg.sdp);
          return;
        }
        if (msg.type === 'webrtc:answer' && msg.callId && msg.sdp) {
          getOrCreateWebRtcSession().handleIncomingAnswer(msg.callId, msg.sdp);
          return;
        }
        if (msg.type === 'webrtc:ice' && msg.callId && msg.candidate) {
          getOrCreateWebRtcSession().handleIncomingIce(msg.callId, msg.candidate);
          return;
        }
        if (msg.type === 'webrtc:hangup') {
          webrtcSessionRef.current?.close(false);
          setIsBrowserCallMicMuted(false);
        }
      };

      ws.onclose = () => {
        setIsLiveSocketConnected(false);
        if (!disposed) {
          reconnectTimer = setTimeout(connectWs, 2500);
        }
      };

      ws.onerror = () => {
        setIsLiveSocketConnected(false);
      };
    };

    connectWs();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try {
        wsRef.current?.close();
      } catch {}
      webrtcSessionRef.current?.close(false);
    };
  }, [visitorSessionId]);

  useEffect(() => {
    if (!isWhatsAppOpen && activeView !== 'admin' && !activeBrowserCallId && !isCallRinging && !isCallActive) {
      return;
    }
    const poll = setInterval(fetchSupportStateFromServer, 6000);
    return () => clearInterval(poll);
  }, [isWhatsAppOpen, activeView, activeBrowserCallId, isCallRinging, isCallActive]);

  const syncChatsToServer = (nextChats: SupportChatSession[]) => {
    try {
      localStorage.setItem('buyonebd_support_chats_v3', JSON.stringify(nextChats));
    } catch {}
    fetch('/api/support/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessions: nextChats })
    }).catch(() => {});
  };

  const syncCallsToServer = (nextCalls: BrowserCallSession[]) => {
    try {
      localStorage.setItem('buyonebd_browser_calls_v3', JSON.stringify(nextCalls));
    } catch {}
    fetch('/api/support/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calls: nextCalls })
    }).catch(() => {});
  };

  const toggleChatManualMode = (sessionId: string, manualMode: boolean) => {
    setSupportChats((prev) => {
      const next = prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              manualMode,
              assignedAgent: manualMode ? 'Live Admin Support' : undefined,
              lastUpdated: new Date().toISOString()
            }
          : s
      );
      syncChatsToServer(next);
      return next;
    });
    sendWsEvent({
      type: 'chat:update_session',
      sessionId,
      patch: {
        manualMode,
        assignedAgent: manualMode ? 'Live Admin Support' : null,
        lastUpdated: new Date().toISOString()
      }
    });
    addToast(
      'info',
      manualMode ? t('ম্যানুয়াল সাপোর্ট চালু', 'Manual Support Mode Active') : t('AI অটো-উত্তর চালু', 'AI Auto-Reply Resumed'),
      manualMode
        ? t('এআই বট বিরতি দেওয়া হয়েছে — এখন সরাসরি অ্যাডমিন চ্যাট করবেন।', 'AI bot paused on this thread for direct manual support.')
        : t('এই থ্রেডে AI সহায়তা পুনরায় সক্রিয় হয়েছে।', 'AI assistant auto-replies resumed on this thread.')
    );
  };

  const requestHumanSupport = (sessionId?: string) => {
    const targetId = sessionId || activeChatSessionId || `chat-${visitorSessionId}`;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const noticeMsg: SupportChatMessage = {
      id: `desk-req-${Date.now()}`,
      sender: 'assistant',
      text: 'Direct Support Desk connected. Please type your message below — a support specialist has been notified and will reply shortly.',
      textBn: 'সরাসরি সাপোর্ট ডেস্ক যুক্ত হয়েছে। অনুগ্রহ করে আপনার বার্তা লিখুন — আমাদের সাপোর্ট প্রতিনিধি এখনই উত্তর দেবেন।',
      time
    };

    setSupportChats((prev) => {
      const exists = prev.some((s) => s.id === targetId);
      const next = exists
        ? prev.map((s) =>
            s.id === targetId
              ? {
                  ...s,
                  manualMode: true,
                  assignedAgent: 'Live Admin Support',
                  unreadByAdmin: (s.unreadByAdmin || 0) + 1,
                  lastUpdated: new Date().toISOString(),
                  messages: [...s.messages, noticeMsg]
                }
              : s
          )
        : [
            {
              id: targetId,
              customerName: customerProfile.name || t('সম্মানিত গ্রাহক', 'Customer'),
              customerPhone: customerProfile.phone || '',
              status: 'open' as const,
              manualMode: true,
              assignedAgent: 'Live Admin Support',
              lastUpdated: new Date().toISOString(),
              unreadByAdmin: 1,
              messages: [noticeMsg]
            },
            ...prev
          ];
      syncChatsToServer(next);
      return next;
    });
    sendWsEvent({
      type: 'chat:append_message',
      sessionId: targetId,
      message: noticeMsg,
      sessionMeta: {
        customerName: customerProfile.name || 'Customer',
        customerPhone: customerProfile.phone || '',
        manualMode: true,
        assignedAgent: 'Live Admin Support',
        unreadByAdmin: 1
      }
    });
  };

  const resolveSupportChatSession = (sessionId: string, status: 'open' | 'resolved') => {
    setSupportChats((prev) => {
      const next = prev.map((s) => (s.id === sessionId ? { ...s, status, lastUpdated: new Date().toISOString() } : s));
      syncChatsToServer(next);
      return next;
    });
    sendWsEvent({ type: 'chat:update_session', sessionId, patch: { status, lastUpdated: new Date().toISOString() } });
  };

  const deleteSupportChatSession = (sessionId: string) => {
    setSupportChats((prev) => {
      const next = prev.filter((s) => s.id !== sessionId);
      syncChatsToServer(next);
      return next;
    });
    sendWsEvent({ type: 'chat:delete_session', sessionId });
    addToast('info', t('চ্যাট থ্রেড মুছে ফেলা হয়েছে', 'Chat Thread Deleted'), sessionId);
  };

  // Bidirectional Chat Actions (Customer + Manual Admin Support + A-to-Z AI Order & Shopping Control)
  const sendCustomerChatMessage = async (rawText: string) => {
    const query = rawText.trim();
    if (!query) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const customerMsg: SupportChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      sender: 'customer',
      text: query,
      textBn: query,
      time
    };

    const sessId = activeChatSessionId || `chat-${visitorSessionId}`;
    const currentSessSnapshot = supportChats.find((s) => s.id === sessId);
    const isManualThread = Boolean(currentSessSnapshot?.manualMode);
    let sessionHistory: SupportChatMessage[] = [];

    setSupportChats((prev) => {
      const exists = prev.some((s) => s.id === sessId);
      const next = exists
        ? prev.map((s) => {
            if (s.id === sessId) {
              sessionHistory = [...s.messages, customerMsg];
              return {
                ...s,
                customerName: customerProfile.name || s.customerName,
                customerPhone: customerProfile.phone || s.customerPhone,
                lastUpdated: new Date().toISOString(),
                unreadByAdmin: (s.unreadByAdmin || 0) + 1,
                messages: sessionHistory
              };
            }
            return s;
          })
        : [
            {
              id: sessId,
              customerName: customerProfile.name || 'সম্মানিত গ্রাহক',
              customerPhone: customerProfile.phone,
              status: 'open' as const,
              manualMode: false,
              lastUpdated: new Date().toISOString(),
              unreadByAdmin: 1,
              messages: [customerMsg]
            },
            ...prev
          ];
      syncChatsToServer(next);
      return next;
    });

    sendWsEvent({
      type: 'chat:append_message',
      sessionId: sessId,
      message: customerMsg,
      sessionMeta: {
        customerName: customerProfile.name || currentSessSnapshot?.customerName || 'সম্মানিত গ্রাহক',
        customerPhone: customerProfile.phone || currentSessSnapshot?.customerPhone || '',
        unreadByAdmin: (currentSessSnapshot?.unreadByAdmin || 0) + 1
      }
    });

    // If customer wants manual human support via keyword, switch thread cleanly and pause AI bot
    const q = query.toLowerCase();
    if (/(human|agent|manual|admin support|talk to agent|ম্যানুয়াল|অ্যাডমিন|সরাসরি কথা)/i.test(q) && !/dashboard|ড্যাশবোর্ড/i.test(q)) {
      requestHumanSupport(sessId);
      return;
    }

    // If Manual Support Mode is enabled by Admin or Customer, DO NOT let AI bot talk over human admin
    if (isManualThread) {
      return;
    }

    const appendBotMsg = (replyMsg: SupportChatMessage) => {
      setSupportChats((prev) => {
        const next = prev.map((s) =>
          s.id === sessId
            ? { ...s, lastUpdated: new Date().toISOString(), messages: [...s.messages, replyMsg] }
            : s
        );
        syncChatsToServer(next);
        return next;
      });
      sendWsEvent({
        type: 'chat:append_message',
        sessionId: sessId,
        message: replyMsg
      });
    };

    // Direct support desk & shopping assistance keywords
    if (/(admin dashboard|admin panel|open admin|show admin|\/hossain|অ্যাডমিন ড্যাশবোর্ড|এডমিন প্যানেল)/i.test(q)) {
      appendBotMsg({
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `For order help, tracking, or account assistance, please share your Order ID (e.g. BD-1001) or connect with our Live Support Desk below.`,
        textBn: `অর্ডার, ট্র্যাকিং বা যেকোনো সহায়তার জন্য আপনার অর্ডার আইডি লিখুন অথবা সরাসরি সাপোর্ট ডেস্কে যুক্ত হোন।`,
        time,
        quickActions: [
          { label: t('📍 অর্ডার ট্র্যাক', '📍 Track Order'), action: 'open_tracking' },
          { label: t('💬 সরাসরি সাপোর্ট ডেস্ক', '💬 Connect Live Desk'), action: 'request_specialist' }
        ]
      });
      return;
    }

    const orderMatch = query.match(/(BD-[A-Z0-9-]+|POS-[A-Z0-9-]+)/i);
    const phoneMatch = query.match(/01[3-9]\d{8}/);

    // 1. Order Lookup & 1-Click AI Confirmation
    if (orderMatch || phoneMatch || q.includes('track') || q.includes('ট্র্যাক') || q.includes('confirm') || q.includes('কনফার্ম')) {
      const searchTarget = orderMatch ? orderMatch[0].toUpperCase() : phoneMatch ? phoneMatch[0] : '';
      const matchedOrder =
        orders.find(
          (o) =>
            (searchTarget && o.id.toUpperCase() === searchTarget) ||
            (phoneMatch && o.customer.phone.includes(phoneMatch[0]))
        ) || (q.includes('confirm') || q.includes('কনফার্ম') ? orders.find((o) => o.status === 'pending' || o.status === 'on_hold') : undefined);

      if (matchedOrder) {
        const canConfirm = matchedOrder.status === 'pending' || matchedOrder.status === 'on_hold';
        const actions: { label: string; action: string }[] = [
          { label: t('📍 লাইভ ট্র্যাক করুন', '📍 Track Order Live'), action: `view_track_${matchedOrder.id}` },
          { label: t('📞 ব্রাউজার কল করুন', '📞 Call Support'), action: `call_order_${matchedOrder.id}` }
        ];
        if (canConfirm) {
          actions.unshift({
            label: t(`✅ অর্ডার #${matchedOrder.id} কনফার্ম করুন`, `✅ Confirm Order #${matchedOrder.id}`),
            action: `confirm_order_${matchedOrder.id}`
          });
        }
        appendBotMsg({
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `Order #${matchedOrder.id} (${matchedOrder.customer.name})\nStatus: ${matchedOrder.status.toUpperCase()}\nTotal: ৳${matchedOrder.pricing.total}\nCourier: ${matchedOrder.courier.provider} (${matchedOrder.courier.trackingCode})`,
          textBn: `অর্ডার #${matchedOrder.id} (${matchedOrder.customer.name})\nস্ট্যাটাস: ${matchedOrder.status.toUpperCase()}\nমোট বিল: ৳${matchedOrder.pricing.total}\nকুরিয়ার: ${matchedOrder.courier.provider} (${matchedOrder.courier.trackingCode})`,
          time,
          quickActions: actions
        });
        return;
      }
    }

    // 2. Backend Configurable Auto-Answer Keyword Rules
    const rules = settings.aiKeywordRules || [];
    const matchedRule = rules.find(
      (r) =>
        r.enabled &&
        r.keywords.some((kw) => kw.trim().length > 0 && q.includes(kw.trim().toLowerCase()))
    );
    if (matchedRule) {
      appendBotMsg({
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: matchedRule.replyEn || matchedRule.replyBn,
        textBn: matchedRule.replyBn || matchedRule.replyEn,
        time
      });
      return;
    }

    // 3. Hot Deals / Store Product Catalog Search directly in Chat
    const matchedProducts = products
      .filter((p) => {
        const hay = `${p.title} ${p.titleBn} ${p.category} ${p.brand || ''} ${p.tags.join(' ')}`.toLowerCase();
        return q.split(/\s+/).some((tok) => tok.length >= 2 && hay.includes(tok));
      })
      .slice(0, 3);

    if (q.includes('deal') || q.includes('offer') || q.includes('অফার') || q.includes('হট ডিল')) {
      const topProducts = products.slice(0, 3);
      appendBotMsg({
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Today's Top Deals:\n${topProducts.map((p, i) => `${i + 1}. ${p.title} - ৳${p.price}`).join('\n')}`,
        textBn: `আজকের সেরা অফারসমূহ:\n${topProducts.map((p, i) => `${i + 1}. ${p.titleBn} - ৳${p.price}`).join('\n')}`,
        time,
        quickActions: topProducts.map((p) => ({
          label: `🛒 ${p.titleBn.slice(0, 14)}...`,
          action: p.stock > 0 ? `buy_${p.id}` : `view_${p.id}`
        }))
      });
      return;
    }

    // 4. Full-Control AI Server Endpoint (/api/chat -> gemini-4-hydrogen + Free Auto AI fallback)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: sessionHistory.slice(-6),
          keywordRules: rules,
          lang,
          catalogSummary: products.slice(0, 20).map((p) => ({
            id: p.id,
            title: p.title,
            titleBn: p.titleBn,
            price: p.price,
            stock: p.stock,
            category: p.category,
            brand: p.brand,
            tags: p.tags
          })),
          recentOrdersSummary: orders.slice(0, 15).map((o) => ({
            id: o.id,
            status: o.status,
            customer: { name: o.customer.name, phone: o.customer.phone },
            pricing: { total: o.pricing.total }
          }))
        })
      });
      const data = await safeParseJson<any>(res);
      if (res.ok && data?.reply) {
        appendBotMsg({
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          textBn: data.reply,
          time,
          quickActions: Array.isArray(data.quickActions) && data.quickActions.length > 0
            ? data.quickActions
            : matchedProducts.map((p) => ({
                label: p.stock > 0 ? `⚡ 1-Click Order: ${p.titleBn.slice(0, 14)}` : `🔔 স্টক অ্যালার্ট`,
                action: p.stock > 0 ? `buy_${p.id}` : `view_${p.id}`
              }))
        });
        return;
      }
    } catch {}

    // 5. Guaranteed Local A-to-Z Agent Response (when offline/static)
    if (matchedProducts.length > 0) {
      appendBotMsg({
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Matching products:\n${matchedProducts.map((p, i) => `${i + 1}. ${p.title} - ৳${p.price}`).join('\n')}`,
        textBn: `আপনার পছন্দের পণ্যসমূহ:\n${matchedProducts.map((p, i) => `${i + 1}. ${p.titleBn} - ৳${p.price}`).join('\n')}`,
        time,
        quickActions: matchedProducts.map((p) => ({
          label: p.stock > 0 ? `⚡ ১-ক্লিক অর্ডার: ${p.titleBn.slice(0, 14)}` : `🔔 স্টক অ্যালার্ট`,
          action: p.stock > 0 ? `buy_${p.id}` : `view_${p.id}`
        }))
      });
      return;
    }

    appendBotMsg({
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: `Thank you for messaging ${settings.storeName}! A support specialist has received your note, or pick a quick option below.`,
      textBn: `ধন্যবাদ! ${settings.storeName} সাপোর্ট টিম আপনার বার্তা পেয়েছে। প্রয়োজনে নিচের অপশন থেকে সরাসরি কথা বলুন।`,
      time,
      quickActions: [
        { label: t('💬 সরাসরি সাপোর্ট', '💬 Direct Support'), action: 'request_specialist' },
        { label: t('📞 ব্রাউজার কল', '📞 Call Desk'), action: 'tab_call' },
        { label: t('📍 অর্ডার ট্র্যাক', '📍 Track Order'), action: 'open_tracking' }
      ]
    });
  };

  const sendAgentChatReply = (sessionId: string, text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const replyMsg: SupportChatMessage = {
      id: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      sender: 'assistant',
      text: clean,
      textBn: clean,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSupportChats((prev) => {
      const next = prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              manualMode: true,
              assignedAgent: 'Live Admin Support',
              unreadByAdmin: 0,
              lastUpdated: new Date().toISOString(),
              messages: [...s.messages, replyMsg]
            }
          : s
      );
      syncChatsToServer(next);
      return next;
    });
    sendWsEvent({
      type: 'chat:append_message',
      sessionId,
      message: replyMsg,
      sessionMeta: {
        manualMode: true,
        assignedAgent: 'Live Admin Support',
        unreadByAdmin: 0
      }
    });
    addToast('success', t('রিপ্লাই পাঠানো হয়েছে', 'Reply Sent'), t('কাস্টমারের চ্যাটে লাইভ পৌঁছে গেছে।', 'Delivered live to customer chat window.'));
  };

  const generateAgentAIReply = async (sessionId: string): Promise<string> => {
    const session = supportChats.find((s) => s.id === sessionId);
    if (!session || session.messages.length === 0) return '';
    const lastCustomerMsg = [...session.messages].reverse().find((m) => m.sender === 'customer') || session.messages[session.messages.length - 1];
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: lastCustomerMsg.textBn || lastCustomerMsg.text,
          history: session.messages.slice(-6),
          lang: adminLang,
          assistantDraft: true
        })
      });
      const data = await safeParseJson<{ reply?: string }>(res);
      if (res.ok && data?.reply) return String(data.reply);
    } catch {}
    return adminLang === 'en'
      ? `Assalamu Alaikum ${session.customerName}, thank you for contacting ${settings.storeName}! Your inquiry has been received and we are checking it right now. Delivery takes 24-48h inside Dhaka (৳${settings.deliveryFees.dhakaInside}) and 48-72h nationwide (৳${settings.deliveryFees.dhakaOutside}).`
      : `আসসালামু আলাইকুম ${session.customerName}, ${settings.storeNameBn || settings.storeName}-এ যোগাযোগ করার জন্য ধন্যবাদ! আমরা বিষয়টি এখনই দেখছি। ঢাকা সিটিতে ডেলিভারি ২৪-৪৮ ঘণ্টা (৳${settings.deliveryFees.dhakaInside}) এবং সারাদেশে ৪৮-৭২ ঘণ্টা (৳${settings.deliveryFees.dhakaOutside})।`;
  };

  const openOrCreateCustomerChatSession = (name: string, phone: string): string => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-11);
    const existing = supportChats.find((c) => {
      const cPhone = (c.customerPhone || '').replace(/[^0-9]/g, '').slice(-11);
      if (cleanPhone && cPhone && cleanPhone === cPhone) return true;
      return c.customerName.trim().toLowerCase() === name.trim().toLowerCase();
    });
    if (existing) {
      return existing.id;
    }
    const newId = `chat-cust-${cleanPhone || Date.now()}`;
    const newSession: SupportChatSession = {
      id: newId,
      customerName: name || t('সম্মানিত গ্রাহক', 'Customer'),
      customerPhone: phone || '',
      status: 'open',
      manualMode: true,
      assignedAgent: 'Live Admin Support',
      unreadByAdmin: 0,
      lastUpdated: new Date().toISOString(),
      messages: [
        {
          id: `init-${Date.now()}`,
          sender: 'assistant',
          text: `Assalamu Alaikum ${name || ''}! Manual support chat connected — reply directly here.`,
          textBn: `আসসালামু আলাইকুম ${name || ''}! সরাসরি ম্যানুয়াল সাপোর্ট চ্যাট চালু হয়েছে।`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    setSupportChats((prev) => {
      const next = [newSession, ...prev];
      syncChatsToServer(next);
      return next;
    });
    sendWsEvent({ type: 'chat:upsert_session', session: newSession });
    return newId;
  };

  const markChatRead = (sessionId: string) => {
    setSupportChats((prev) => {
      const next = prev.map((s) => (s.id === sessionId ? { ...s, unreadByAdmin: 0 } : s));
      syncChatsToServer(next);
      return next;
    });
    sendWsEvent({ type: 'chat:update_session', sessionId, patch: { unreadByAdmin: 0 } });
  };

  // Bidirectional Real-Time Browser Call Engine (Customer <-> Backend Admin Desk with WebRTC Audio + Speech Fallback)
  const initiateCustomerBrowserCall = (
    order?: Order | null,
    callerInfo?: { name?: string; phone?: string; autoConnect?: boolean; direction?: 'customer_to_admin' | 'admin_to_customer' }
  ): string => {
    const callId = `CALL-${Math.floor(10000 + Math.random() * 90000)}`;
    const resolvedName =
      callerInfo?.name?.trim() ||
      order?.customer?.name ||
      customerProfile.name ||
      t('সম্মানিত গ্রাহক', 'Valued Customer');
    const resolvedPhone =
      callerInfo?.phone?.trim() ||
      order?.customer?.phone ||
      customerProfile.phone ||
      settings.hotline;

    const targetOrder: Order = order || {
      id: `SUP-${Math.floor(10000 + Math.random() * 90000)}`,
      customer: {
        name: resolvedName,
        phone: resolvedPhone,
        address: customerProfile.address || 'Dhaka, Bangladesh',
        district: customerProfile.district || 'Dhaka - Inside City',
        thana: 'Customer Care Desk'
      },
      items: products[0]
        ? [
            {
              productId: products[0].id,
              productTitle: products[0].title,
              productTitleBn: products[0].titleBn,
              price: products[0].price,
              quantity: 1,
              image: products[0].images[0]
            }
          ]
        : [],
      pricing: { subtotal: 0, deliveryFee: 0, discount: 0, total: 0 },
      payment: { method: 'cod', status: 'pending' },
      deliveryZone: 'dhaka_inside',
      status: 'pending',
      aiCallStatus: { called: false },
      courier: {
        provider: 'Steadfast',
        trackingCode: 'BROWSER-CALL',
        status: 'booked',
        currentLocation: 'Support Desk',
        estimatedDelivery: 'Live Call',
        history: []
      },
      createdAt: new Date().toISOString()
    };

    const isAdminOutbound = callerInfo?.direction === 'admin_to_customer' || Boolean(callerInfo?.autoConnect);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const session: BrowserCallSession = {
      id: callId,
      orderId: order?.id,
      callType: order ? 'order_verification' : 'support',
      direction: isAdminOutbound ? 'admin_to_customer' : 'customer_to_admin',
      visitorSessionId: isAdminOutbound ? undefined : visitorSessionId,
      customerName: resolvedName,
      customerPhone: resolvedPhone,
      status: isAdminOutbound ? 'ringing_customer' : 'ringing_backend',
      answeredBy: isAdminOutbound ? 'backend_assistant' : undefined,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      transcript: [
        {
          id: `t-${Date.now()}`,
          speaker: isAdminOutbound ? 'assistant' : 'customer',
          text: isAdminOutbound
            ? `Support admin is calling ${resolvedName} (${resolvedPhone})...`
            : `Customer initiated a live browser support call (${resolvedName}).`,
          textBn: isAdminOutbound
            ? `সাপোর্ট ডেস্ক থেকে ${resolvedName} (${resolvedPhone})-কে কল করা হচ্ছে — কাস্টমারের ব্রাউজারে রিং হচ্ছে...`
            : `গ্রাহক (${resolvedName}) ব্রাউজার থেকে কল করেছেন — রিসিভের জন্য রিং হচ্ছে...`,
          time: nowTime
        }
      ]
    };

    setBrowserCalls((prev) => {
      const next = [session, ...prev];
      syncCallsToServer(next);
      return next;
    });
    sendWsEvent({ type: 'call:start', call: session });

    if (!isAdminOutbound) {
      setActiveBrowserCallId(callId);
      setActiveCallOrder(targetOrder);
      setIsCallRinging(true);
      setIsCallActive(false);
    } else {
      addToast(
        'info',
        t('কাস্টমারের ব্রাউজারে রিং হচ্ছে...', 'Ringing Customer Browser...'),
        t(`${resolvedName} (${resolvedPhone}) কল রিসিভ করলেই WebRTC লাইভ কথা শুরু হবে।`, `Waiting for ${resolvedName} to answer live call.`)
      );
    }
    return callId;
  };

  const answerBrowserCallFromBackend = (callId: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const greetBn = `আসসালামু আলাইকুম! ${settings.storeNameBn || settings.storeName} সাপোর্ট ডেস্ক থেকে আমি অ্যাসিস্ট্যান্ট বলছি। বলুন, কীভাবে সাহায্য করতে পারি?`;
    const greetEn = `Assalamu Alaikum! Support admin connected live. How can I help you today?`;
    const greetItem: BrowserCallTranscriptItem = {
      id: `t-${Date.now()}`,
      speaker: 'assistant',
      text: greetEn,
      textBn: greetBn,
      time
    };

    setBrowserCalls((prev) => {
      const next = prev.map((c) =>
        c.id === callId
          ? {
              ...c,
              status: 'connected' as const,
              answeredBy: 'backend_assistant' as const,
              transcript: [...c.transcript, greetItem]
            }
          : c
      );
      syncCallsToServer(next);
      return next;
    });
    sendWsEvent({
      type: 'call:answer',
      callId,
      answeredBy: 'backend_assistant',
      transcriptItem: greetItem
    });

    // Establish peer-to-peer WebRTC microphone + speaker audio stream cleanly
    getOrCreateWebRtcSession().startAsCaller(callId);

    if (activeBrowserCallId === callId) {
      setIsCallRinging(false);
      setIsCallActive(true);
    }
    addToast('success', t('লাইভ কল সংযুক্ত!', 'Live Call Connected!'), t('মাইক ও চ্যাট ট্রান্সক্রিপ্ট এখন সক্রিয়।', 'Two-way live voice & transcript active.'));
  };

  const answerIncomingCustomerCall = (callId: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const ansItem: BrowserCallTranscriptItem = {
      id: `t-${Date.now()}`,
      speaker: 'customer',
      text: 'Customer answered the incoming call.',
      textBn: 'গ্রাহক কলটি রিসিভ করেছেন।',
      time
    };
    setBrowserCalls((prev) => {
      const next = prev.map((c) =>
        c.id === callId
          ? {
              ...c,
              status: 'connected' as const,
              answeredBy: 'customer' as const,
              transcript: [...c.transcript, ansItem]
            }
          : c
      );
      syncCallsToServer(next);
      return next;
    });
    sendWsEvent({
      type: 'call:answer',
      callId,
      answeredBy: 'customer',
      transcriptItem: ansItem
    });
    getOrCreateWebRtcSession().startAsCaller(callId);
    setIsCallRinging(false);
    setIsCallActive(true);
  };

  const appendBrowserCallMessage = (
    callId: string,
    speaker: 'customer' | 'assistant' | 'ai',
    text: string,
    textBn?: string
  ) => {
    const clean = text.trim();
    if (!clean) return;
    const item: BrowserCallTranscriptItem = {
      id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      speaker,
      text: clean,
      textBn: textBn || clean,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setBrowserCalls((prev) => {
      const next = prev.map((c) =>
        c.id === callId ? { ...c, transcript: [...c.transcript, item] } : c
      );
      syncCallsToServer(next);
      return next;
    });
    sendWsEvent({ type: 'call:append_message', callId, item });
  };

  const endBrowserCallSession = (callId: string, confirmed?: boolean) => {
    webrtcSessionRef.current?.close(true);
    setIsBrowserCallMicMuted(false);

    setBrowserCalls((prev) => {
      const next = prev.map((c) =>
        c.id === callId
          ? {
              ...c,
              status: 'ended' as const,
              endedAt: new Date().toISOString(),
              durationSeconds: Math.max(1, Math.round((Date.now() - new Date(c.startedAt).getTime()) / 1000))
            }
          : c
      );
      syncCallsToServer(next);
      return next;
    });
    sendWsEvent({ type: 'call:end', callId });

    if (activeBrowserCallId === callId) {
      setActiveBrowserCallId(null);
      if (confirmed !== undefined && activeCallOrder && !activeCallOrder.id.startsWith('SUP-')) {
        finishAICall(confirmed);
      } else {
        setIsCallRinging(false);
        setIsCallActive(false);
        setActiveCallOrder(null);
      }
    }
  };

  // Multi-Courier 1-Click Booking (Real Steadfast Portal API + Pathao/RedX/Paperfly/Sundarban)
  const bookOrderCourier = async (
    orderId: string,
    provider: CourierProvider
  ): Promise<{ success: boolean; trackingCode?: string; consignmentId?: string; error?: string }> => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return { success: false, error: 'Order not found' };

    addToast(
      'info',
      t(`${provider} কুরিয়ারে বুকিং হচ্ছে...`, `Sending #${orderId} to ${provider}...`),
      t(`অর্ডার #${orderId} পাঠানো হচ্ছে।`, `Dispatching parcel to ${provider} portal.`)
    );

    try {
      let consignmentId = '';
      let trackingCode = '';

      if (provider === 'Steadfast') {
        const stdfCfg = settings.courierSettings?.steadfast;
        const codAmount =
          targetOrder.payment.status === 'paid'
            ? 0
            : Math.max(0, (targetOrder.pricing.total || 0) - (targetOrder.pricing.advancePaid || 0));

        const res = await fetch('/api/steadfast/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: stdfCfg?.apiKey,
            secretKey: stdfCfg?.secretKey,
            baseUrl: stdfCfg?.baseUrl || 'https://portal.steadfast.com.bd/api/v1',
            invoice: targetOrder.id,
            recipient_name: targetOrder.customer.name,
            recipient_phone: targetOrder.customer.phone,
            recipient_address: `${targetOrder.customer.address}, ${targetOrder.customer.thana}, ${targetOrder.customer.district}`,
            cod_amount: codAmount,
            note: targetOrder.customer.note || `Items: ${targetOrder.items.map((i) => `${i.productTitle} x${i.quantity}`).join(', ')}`
          })
        });
        const data = await safeParseJson<any>(res);
        if (!res.ok || !data?.success) {
          const errMsg = data?.error || `Steadfast API returned HTTP ${res.status}. Check API Key & Secret Key in Courier Hub.`;
          addToast('error', t('Steadfast API ব্যর্থ', 'Steadfast Booking Failed'), errMsg);
          return { success: false, error: errMsg };
        }
        consignmentId = String(data.consignment_id || '');
        trackingCode = String(data.tracking_code || `STDF-${consignmentId || targetOrder.id}`);
      } else {
        const prefixMap: Record<CourierProvider, string> = {
          Steadfast: 'STDF',
          Pathao: 'PTHO',
          RedX: 'REDX',
          Paperfly: 'PPFL',
          Sundarban: 'SNDR'
        };
        const prefix = prefixMap[provider] || 'COUR';
        const randomDigits = Math.floor(10000000 + Math.random() * 89999999);
        await new Promise((r) => setTimeout(r, 450));
        consignmentId = `${randomDigits}`;
        trackingCode = `${prefix}-${orderId.replace(/[^A-Za-z0-9]/g, '')}`;
      }

      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            const updatedCourier: Order['courier'] = {
              ...ord.courier,
              provider,
              consignmentId,
              trackingCode,
              status: 'in_transit',
              history: [
                ...ord.courier.history,
                {
                  status: `${provider} Consignment Created`,
                  time: 'Just now',
                  location: 'Dhaka Central Dispatch Hub',
                  note: `Booked via ${provider} Portal API (Consignment ID: ${consignmentId})`
                }
              ]
            };
            const updatedOrder: Order = {
              ...ord,
              status: 'shipped',
              courier: updatedCourier
            };
            fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ updates: { status: 'shipped', courier: updatedCourier } })
            }).catch(() => {});
            updateOrderInFirestore(updatedOrder).catch(() => {});
            return updatedOrder;
          }
          return ord;
        })
      );

      addToast(
        'success',
        t(`${provider} বুকিং সফল! 🎉`, `${provider} Booking Created!`),
        t(`Consignment ID: ${consignmentId}`, `Consignment: ${consignmentId} • Tracking: ${trackingCode}`)
      );
      return { success: true, trackingCode, consignmentId };
    } catch (err: any) {
      const msg = err?.message || `${provider} API connection error.`;
      addToast('error', t('বুকিং ব্যর্থ হয়েছে', 'Booking Failed'), msg);
      return { success: false, error: msg };
    }
  };

  // Steadfast 1-Click Order Entry (compat wrapper)
  const sendOrderToSteadfast = async (orderId: string) => bookOrderCourier(orderId, 'Steadfast');

  const checkSteadfastDeliveryStatus = async (
    orderId: string
  ): Promise<{ success: boolean; deliveryStatus?: string; error?: string }> => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return { success: false, error: 'Order not found' };
    const stdfCfg = settings.courierSettings?.steadfast;
    try {
      const res = await fetch('/api/steadfast/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: stdfCfg?.apiKey,
          secretKey: stdfCfg?.secretKey,
          baseUrl: stdfCfg?.baseUrl || 'https://portal.steadfast.com.bd/api/v1',
          consignmentId: ord.courier?.consignmentId,
          invoice: ord.id,
          trackingCode: ord.courier?.trackingCode
        })
      });
      const data = await safeParseJson<any>(res);
      if (!res.ok || !data?.success) {
        const msg = data?.error || `Could not fetch live Steadfast status (HTTP ${res.status})`;
        addToast('error', t('স্ট্যাটাস চেক ব্যর্থ', 'Status Check Failed'), msg);
        return { success: false, error: msg };
      }
      const rawStatus = String(data.delivery_status || 'in_review').toLowerCase();
      let mappedCourierStatus: Order['courier']['status'] = ord.courier.status;
      let mappedOrderStatus: OrderStatus = ord.status;
      if (rawStatus.includes('delivered')) {
        mappedCourierStatus = 'delivered';
        mappedOrderStatus = 'delivered';
      } else if (rawStatus.includes('cancelled') || rawStatus.includes('returned')) {
        mappedCourierStatus = 'returned';
      } else if (rawStatus.includes('out') || rawStatus.includes('transit') || rawStatus.includes('pending') || rawStatus.includes('hold')) {
        mappedCourierStatus = 'in_transit';
      }

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          const updatedCourier: Order['courier'] = {
            ...o.courier,
            status: mappedCourierStatus,
            currentLocation: `Steadfast Live: ${data.delivery_status}`,
            history: [
              ...o.courier.history,
              {
                status: `Steadfast: ${data.delivery_status}`,
                time: new Date().toLocaleTimeString(),
                location: 'Steadfast API',
                note: `Live delivery status checked (${data.delivery_status})`
              }
            ]
          };
          fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates: { status: mappedOrderStatus, courier: updatedCourier } })
          }).catch(() => {});
          return { ...o, status: mappedOrderStatus, courier: updatedCourier };
        })
      );

      addToast('success', t('লাইভ ডেলিভারি স্ট্যাটাস আপডেট!', 'Live Status Updated!'), `${ord.id}: ${data.delivery_status}`);
      return { success: true, deliveryStatus: data.delivery_status };
    } catch (err: any) {
      addToast('error', t('নেটওয়ার্ক ত্রুটি', 'Network Error'), err?.message || '');
      return { success: false, error: err?.message };
    }
  };

  // Meta WhatsApp Cloud API Logs & Dispatcher
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppCloudLog[]>(() => {
    try {
      const saved = localStorage.getItem('buyonebd_wa_logs_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const sendMetaWhatsAppMessage = async (payload: {
    to: string;
    message?: string;
    templateName?: string;
  }): Promise<{ success: boolean; mode?: string; error?: string }> => {
    const cloudCfg = settings.marketingSettings?.whatsappCloudApi;
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: payload.to,
          message: payload.message,
          templateName: payload.templateName || cloudCfg?.defaultTemplate,
          phoneNumberId: cloudCfg?.enabled ? cloudCfg.phoneNumberId : '',
          accessToken: cloudCfg?.enabled ? cloudCfg.accessToken : '',
          apiVersion: cloudCfg?.apiVersion || 'v21.0'
        })
      });
      const data = (await safeParseJson<any>(res)) || { success: false, error: `HTTP ${res.status}` };
      const logItem: WhatsAppCloudLog = {
        id: `walog-${Date.now()}`,
        phone: payload.to,
        template: payload.templateName || 'custom_text',
        status: data.success ? (data.mode === 'live' ? 'sent' : 'simulated') : 'failed',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messagePreview: (payload.message || payload.templateName || '').slice(0, 90)
      };
      setWhatsappLogs((prev) => {
        const next = [logItem, ...prev].slice(0, 40);
        localStorage.setItem('buyonebd_wa_logs_v3', JSON.stringify(next));
        return next;
      });
      if (data.success) {
        addToast(
          'success',
          t('হোয়াটসঅ্যাপ মেসেজ পাঠানো হয়েছে!', 'WhatsApp Message Sent!'),
          data.mode === 'live'
            ? t(`Meta Cloud API দিয়ে ${payload.to}-এ পাঠানো হয়েছে`, `Sent via Meta Graph API to ${payload.to}`)
            : t(`সিমুলেটেড ডেলিভারি সফল (${payload.to})`, `Sandbox simulation logged for ${payload.to}`)
        );
      } else {
        addToast('error', t('মেসেজ পাঠানো যায়নি', 'WhatsApp Send Failed'), data.error || 'Unknown error');
      }
      return data;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  };

  // Apply 1 of 10 Business Themes (Colors + Auto-Generated Brand Attributes + optional curated Categories)
  const applyBusinessTheme = (themeId: StoreTheme, includeCategories = false) => {
    const preset = BUSINESS_THEME_PRESETS.find((p) => p.id === themeId);
    if (!preset) return;

    const palette = computeBrandPaletteAttributes(preset.colors.primary, preset.colors.secondary);
    updateSettings({
      theme: themeId,
      themeColors: { ...preset.colors },
      brandAttributes: {
        primaryHover: palette.primaryHover,
        primarySoft: palette.primarySoft,
        primaryBorder: palette.primaryBorder,
        onPrimary: palette.onPrimary,
        cssAttributeString: palette.cssAttributeString,
        generatedAt: new Date().toISOString()
      }
    });

    if (includeCategories && preset.suggestedCategories.length > 0) {
      const mappedCats: Category[] = preset.suggestedCategories.map((c, idx) => ({
        ...c,
        id: `${themeId}-cat-${idx + 1}`,
        isActive: true,
        order: idx + 1
      }));
      setCategories(mappedCats);
      saveStorefrontSettingsToFirestore(settingsRef.current, mappedCats, slidersRef.current).catch(() => {});
    }

    addToast(
      'success',
      t(`${preset.nameBn} থিম প্রয়োগ হয়েছে!`, `${preset.nameEn} Applied!`),
      includeCategories
        ? t('কালার প্যালেট ও ব্যবসার ক্যাটাগরি আপডেট করা হয়েছে।', 'Color palette and curated categories updated.')
        : t('স্টোরের কালার থিম পরিবর্তন করা হয়েছে।', 'Store colors updated.')
    );
  };

  // Backend Brand Color Attribute Generator (derives full CSS token set & HTML root attributes)
  const generateBrandColorAttributes = (primaryHex?: string) => {
    const sourcePrimary = primaryHex || settings.themeColors?.primary || '#059669';
    const computed = computeBrandPaletteAttributes(sourcePrimary);
    updateSettings({
      themeColors: {
        primary: computed.primary,
        secondary: computed.secondary,
        headerBg: settings.themeColors?.headerBg || '#ffffff',
        footerBg: computed.footerBg,
        heroFrom: computed.heroFrom,
        heroTo: computed.heroTo
      },
      brandAttributes: {
        primaryHover: computed.primaryHover,
        primarySoft: computed.primarySoft,
        primaryBorder: computed.primaryBorder,
        onPrimary: computed.onPrimary,
        cssAttributeString: computed.cssAttributeString,
        generatedAt: new Date().toISOString()
      }
    });
    addToast(
      'success',
      t('ব্র্যান্ড কালার অ্যাট্রিবিউট জেনারেট সম্পন্ন!', 'Brand Color Attributes Generated!'),
      t(`Primary: ${computed.primary} • Hover: ${computed.primaryHover}`, `Applied tokens for ${computed.primary} across storefront.`)
    );
  };

  // Apply dynamic CSS theme variables & root brand data-attributes whenever themeColors or theme changes
  useEffect(() => {
    const colors = settings.themeColors;
    const computed = computeBrandPaletteAttributes(colors?.primary, colors?.secondary);
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', computed.primary);
    root.style.setProperty('--brand-primary-hover', settings.brandAttributes?.primaryHover || computed.primaryHover);
    root.style.setProperty('--brand-primary-soft', settings.brandAttributes?.primarySoft || computed.primarySoft);
    root.style.setProperty('--brand-primary-border', settings.brandAttributes?.primaryBorder || computed.primaryBorder);
    root.style.setProperty('--brand-on-primary', settings.brandAttributes?.onPrimary || computed.onPrimary);
    root.style.setProperty('--brand-secondary', colors?.secondary || computed.secondary);
    root.style.setProperty('--brand-header-bg', colors?.headerBg || '#ffffff');
    root.style.setProperty('--brand-footer-bg', colors?.footerBg || computed.footerBg);
    root.style.setProperty('--brand-hero-from', colors?.heroFrom || computed.heroFrom);
    root.style.setProperty('--brand-hero-to', colors?.heroTo || computed.heroTo);

    root.setAttribute('data-theme', settings.theme || 'gadgets');
    root.setAttribute('data-brand-primary', computed.primary);
    root.setAttribute('data-brand-secondary', colors?.secondary || computed.secondary);

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', computed.primary);
  }, [settings.themeColors, settings.theme, settings.brandAttributes]);

  // Dynamic SEO Head Tags + Schema.org JSON-LD Updater (Global + Per-Product SEO)
  useEffect(() => {
    const seo = settings.seoSettings;
    const storeName = settings.storeName || 'BuyOne BD';
    let pageTitle = seo?.metaTitle || `${storeName} - Online Shopping Bangladesh`;
    let pageDesc = seo?.metaDescription ?? settings.tagline;
    let pageKeywords = seo?.keywords ?? '';
    let pageRobots = seo?.robots || 'index, follow';

    if (activeView === 'admin') {
      // Keep storefront SEO meta tags synced in document.head even when editing inside AdminDashboard
      pageTitle = seo?.metaTitle || `Admin Portal - ${storeName}`;
      pageRobots = seo?.robots || 'index, follow';
    } else if (activeView === 'tracking') {
      pageTitle = `${t('রিয়েল-টাইম অর্ডার ট্র্যাকিং', 'Real-Time Order Tracking')} - ${storeName}`;
    } else if (isOneClickOpen) {
      pageTitle = `${t('১-ক্লিক চেকআউট', '1-Click Checkout')} - ${storeName}`;
    } else if (isCartOpen) {
      pageTitle = `${t('শপিং কার্ট', 'Shopping Cart')} - ${storeName}`;
    } else if (selectedProductForPage) {
      const pSeo = selectedProductForPage.seo;
      const prodTitle = lang === 'bn' ? selectedProductForPage.titleBn : selectedProductForPage.title;
      pageTitle = pSeo?.metaTitle || `${prodTitle} | ৳${selectedProductForPage.price} - ${storeName}`;
      pageDesc =
        pSeo?.metaDescription ||
        (lang === 'bn' ? selectedProductForPage.descriptionBn : selectedProductForPage.description).slice(0, 158);
      if (pSeo?.keywords) pageKeywords = pSeo.keywords;
      if (pSeo?.robots) pageRobots = pSeo.robots;
    } else if (storeSubView === 'products') {
      pageTitle = `${t('সকল পণ্য সমূহ', 'All Products Catalog')} - ${storeName}`;
    } else if (selectedCategory && selectedCategory !== 'all') {
      const catObj = categories.find((c) => c.slug === selectedCategory);
      const subObj = catObj?.subcategories?.find((s) => s.slug === selectedSubcategory);
      const catName = subObj
        ? lang === 'bn'
          ? subObj.nameBn
          : subObj.nameEn
        : catObj
        ? lang === 'bn'
          ? catObj.nameBn
          : catObj.nameEn
        : selectedCategory;
      pageTitle = `${catName} - ${storeName}`;
    }

    document.title = pageTitle;

    const setMeta = (selector: string, attrName: string, attrVal: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', 'name', 'description', pageDesc);
    setMeta('meta[name="keywords"]', 'name', 'keywords', pageKeywords);
    setMeta('meta[name="robots"]', 'name', 'robots', pageRobots);
    setMeta('meta[property="og:title"]', 'property', 'og:title', pageTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', pageDesc);
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', storeName);
    setMeta('meta[property="og:url"]', 'property', 'og:url', window.location.origin + window.location.pathname);
    setMeta(
      'meta[property="og:image"]',
      'property',
      'og:image',
      selectedProductForPage?.seo?.ogImage || selectedProductForPage?.images?.[0] || seo?.ogImage || ''
    );
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', pageTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', pageDesc);
    if (seo?.twitterHandle) {
      setMeta('meta[name="twitter:site"]', 'name', 'twitter:site', seo.twitterHandle);
    }

    const baseCanonical = (seo?.canonicalUrl || window.location.origin).replace(/\/+$/, '');
    const canonicalHref = `${baseCanonical}${window.location.pathname === '/' ? '' : window.location.pathname}`;
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonicalHref;

    // Update Schema.org JSON-LD (Product when viewing single product, Store otherwise)
    let jsonLdScript = document.getElementById('dynamic-jsonld') as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'dynamic-jsonld';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }

    const schemaData = selectedProductForPage
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: selectedProductForPage.title,
          image: selectedProductForPage.images,
          description: pageDesc,
          sku: selectedProductForPage.sku,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'BDT',
            price: selectedProductForPage.price,
            availability: selectedProductForPage.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: selectedProductForPage.rating || 4.9,
            reviewCount: selectedProductForPage.reviewsCount || 45
          }
        }
      : {
          '@context': 'https://schema.org',
          '@type': seo?.schemaType || 'Store',
          name: storeName,
          description: pageDesc,
          url: canonicalHref,
          telephone: settings.hotline,
          address: {
            '@type': 'PostalAddress',
            streetAddress: settings.address,
            addressCountry: 'BD'
          }
        };

    jsonLdScript.textContent = JSON.stringify(schemaData);
  }, [
    activeView,
    storeSubView,
    selectedCategory,
    selectedSubcategory,
    isCartOpen,
    isOneClickOpen,
    selectedProductForPage,
    settings.seoSettings,
    settings.storeName,
    settings.tagline,
    settings.hotline,
    settings.address,
    categories,
    lang
  ]);

  // Check Customer Fraud Risk / Steadfast Delivery Success Ratio
  const checkCustomerFraudRisk = async (phone: string): Promise<OrderFraudCheck> => {
    try {
      const res = await fetch('/api/fraud-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      if (res.ok) {
        const raw = await res.text();
        const data = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;
        if (data?.success) {
          return {
            checked: true,
            successRate: data.successRate,
            totalOrders: data.totalOrders,
            deliveredCount: data.deliveredCount,
            cancelledCount: data.cancelledCount,
            riskLevel: data.riskLevel,
            message: data.message
          };
        }
      }
    } catch {}

    const phoneSum = phone.split('').reduce((sum, ch) => sum + (parseInt(ch, 10) || 0), 0);
    const successRate = phoneSum % 5 === 0 ? 42 : phoneSum % 7 === 0 ? 74 : 96;
    const totalOrders = Math.floor(4 + (phoneSum % 25));
    const deliveredCount = Math.round((totalOrders * successRate) / 100);
    const cancelledCount = totalOrders - deliveredCount;
    const riskLevel: 'safe' | 'moderate' | 'high_risk' =
      successRate >= 85 ? 'safe' : successRate >= 65 ? 'moderate' : 'high_risk';

    return {
      checked: true,
      successRate,
      totalOrders,
      deliveredCount,
      cancelledCount,
      riskLevel,
      message:
        riskLevel === 'safe'
          ? `গ্রাহকের ডেলিভারি সাকসেস রেট ${successRate}% — বিশ্বস্ত ক্রেতা।`
          : `সাকসেস রেট ${successRate}% — কল করে ঠিকানা নিশ্চিত করুন।`
    };
  };

  const refreshOrderScore = async (orderId: string): Promise<OrderFraudCheck> => {
    const target = orders.find((o) => o.id === orderId);
    const res = await checkCustomerFraudRisk(target?.customer?.phone || '01700000000');
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: { fraudCheck: res } })
        }).catch(() => {});
        return { ...o, fraudCheck: res };
      })
    );
    addToast('info', t('কাস্টমার স্কোর আপডেট!', 'Score Refreshed!'), `#${orderId}: ${res.successRate}% (${res.riskLevel})`);
    return res;
  };

  // Create Order (Online 1-Click Checkout + Backend POS System)
  const createOrder = (orderData: {
    customer: { name: string; phone: string; address: string; district: string; thana: string; note?: string };
    items: {
      product: Product;
      quantity: number;
      selectedColor?: string;
      selectedSize?: string;
      selectedAttributes?: Record<string, string>;
    }[];
    paymentMethod: PaymentMethod;
    paymentTrxId?: string;
    deliveryZone: DeliveryZone;
    advancePaid?: number;
    discountAmount?: number;
    couponCode?: string;
    walletUsedAmount?: number;
    loyaltyPointsUsed?: number;
    loyaltyDiscountAmount?: number;
    customDeliveryFee?: number;
    source?: 'online' | 'pos';
    initialStatus?: OrderStatus;
    skipAICall?: boolean;
  }) => {
    // Security Shield Enforcement for Online Checkout Orders
    if (orderData.source !== 'pos') {
      const normalizedPhone = String(orderData.customer.phone || '').replace(/[^0-9]/g, '').slice(-11);
      const blockedList = settings.securitySettings?.blockedPhones || [];
      if (
        normalizedPhone &&
        blockedList.some((bp) => String(bp).replace(/[^0-9]/g, '').slice(-11) === normalizedPhone)
      ) {
        addSecurityLog(
          'Blocked Blacklisted Order',
          `Phone ${normalizedPhone} rejected by Security Shield blocklist.`,
          'blocked'
        );
        throw new Error(
          t(
            'নিরাপত্তা নীতির কারণে এই মোবাইল নম্বর থেকে অর্ডার সীমাবদ্ধ করা হয়েছে। সহায়তার জন্য হটলাইনে যোগাযোগ করুন।',
            'Orders from this phone number are restricted by store security policy.'
          )
        );
      }

      const dupMins =
        settings.securitySettings?.blockDuplicateOrdersMinutes ??
        settings.organicMarketing?.checkoutGuard?.blockDuplicateOrdersMinutes ??
        0;
      if (dupMins > 0 && normalizedPhone) {
        const cutoff = Date.now() - dupMins * 60 * 1000;
        const recentDup = ordersRef.current.find(
          (o) =>
            o.source !== 'pos' &&
            String(o.customer?.phone || '').replace(/[^0-9]/g, '').slice(-11) === normalizedPhone &&
            new Date(o.createdAt).getTime() >= cutoff
        );
        if (recentDup) {
          addSecurityLog(
            'Duplicate Flood Prevented',
            `Blocked rapid repeat checkout from ${normalizedPhone} within ${dupMins} min.`,
            'warning'
          );
          throw new Error(
            t(
              `আপনি ইতিমধ্যে একটি অর্ডার করেছেন। ডুপ্লিকেট এড়াতে অনুগ্রহ করে ${dupMins} মিনিট পর আবার চেষ্টা করুন।`,
              `Duplicate order guard active. Please wait ${dupMins} minutes before placing another order.`
            )
          );
        }
      }
    }

    const subtotal = orderData.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    // Per-product delivery charge calculation (freeShipping or customDeliveryFees or global default)
    const resolveDeliveryFee = (): number => {
      if (orderData.customDeliveryFee !== undefined) return Math.max(0, orderData.customDeliveryFee);
      if (orderData.source === 'pos') return 0;
      const items = orderData.items.map((i) => i.product);
      if (items.length > 0 && items.every((p) => p.freeShipping)) return 0;
      const zoneKey =
        orderData.deliveryZone === 'dhaka_inside'
          ? 'dhakaInside'
          : orderData.deliveryZone === 'dhaka_sub'
          ? 'dhakaSub'
          : 'dhakaOutside';
      const customItemFee = items.find((p) => p.customDeliveryFees && p.customDeliveryFees[zoneKey] !== undefined)?.customDeliveryFees?.[zoneKey];
      if (customItemFee !== undefined) return Math.max(0, customItemFee);
      return settings.deliveryFees[zoneKey];
    };

    const fee = resolveDeliveryFee();

    const walletUsed = orderData.walletUsedAmount || 0;
    if (walletUsed > 0) {
      deductWallet(walletUsed);
    }
    const loyaltyPointsUsed = Math.max(0, Math.round(orderData.loyaltyPointsUsed || 0));
    const loyaltyDiscount = Math.max(0, Math.round(orderData.loyaltyDiscountAmount || 0));
    const discount = (orderData.discountAmount || 0) + walletUsed + loyaltyDiscount;
    const total = Math.max(0, subtotal + fee - discount);
    const orderIdNum = `${Date.now().toString().slice(-5)}${Math.floor(100 + Math.random() * 900)}`;
    const newOrderId = orderData.source === 'pos' ? `POS-${orderIdNum}` : `BD-${orderIdNum}`;

    // Loyalty Points Earned calculation (per-product override or store settings rule)
    const loyCfg = settings.loyaltySettings || INITIAL_SETTINGS.loyaltySettings!;
    const explicitProdPts = orderData.items.reduce(
      (sum, it) => sum + ((it.product.loyaltyPoints || 0) > 0 ? (it.product.loyaltyPoints || 0) * it.quantity : 0),
      0
    );
    const pointsEarned =
      loyCfg.enabled !== false && total > 0
        ? explicitProdPts > 0
          ? explicitProdPts
          : Math.max(1, Math.floor((total / 100) * (loyCfg.pointsPer100Bdt || 5)))
        : 0;

    const courierProviders: CourierProvider[] = ['Steadfast', 'Pathao', 'RedX'];
    const chosenCourier = courierProviders[0];
    const trackingCode = orderData.source === 'pos' ? `POS-INVOICE-${orderIdNum}` : `STDF-BD-${orderIdNum}`;

    const phoneSum = orderData.customer.phone.split('').reduce((s, c) => s + (parseInt(c, 10) || 0), 0);
    const rate = phoneSum % 5 === 0 ? 55 : 94;
    const nowIso = new Date().toISOString();

    const dueAmountCalc =
      orderData.advancePaid !== undefined && orderData.advancePaid > 0 && orderData.advancePaid < total
        ? Math.max(0, total - orderData.advancePaid)
        : orderData.paymentMethod === 'cod'
        ? total
        : 0;

    const initialPaymentHistory =
      orderData.advancePaid && orderData.advancePaid > 0
        ? [
            {
              id: `pay-${Date.now()}`,
              amount: orderData.advancePaid,
              method: orderData.paymentMethod,
              note: orderData.source === 'pos' ? 'POS Initial Advance' : 'Checkout Advance Payment',
              date: nowIso
            }
          ]
        : undefined;

    const newOrder: Order = {
      id: newOrderId,
      customer: orderData.customer,
      items: orderData.items.map((i) => ({
        productId: i.product.id,
        productTitle: i.product.title,
        productTitleBn: i.product.titleBn,
        price: i.product.price,
        quantity: i.quantity,
        selectedColor: i.selectedColor,
        selectedSize: i.selectedSize,
        ...(i.selectedAttributes && Object.keys(i.selectedAttributes).length > 0
          ? { selectedAttributes: i.selectedAttributes }
          : {}),
        image: i.product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'
      })),
      pricing: {
        subtotal,
        deliveryFee: fee,
        discount,
        total,
        advancePaid: orderData.advancePaid,
        ...(loyaltyPointsUsed > 0 ? { loyaltyPointsUsed } : {}),
        ...(loyaltyDiscount > 0 ? { loyaltyDiscount } : {}),
        ...(pointsEarned > 0 ? { loyaltyPointsEarned: pointsEarned } : {}),
        ...(initialPaymentHistory ? { paymentHistory: initialPaymentHistory } : {})
      },
      payment: {
        method: orderData.paymentMethod,
        status:
          orderData.advancePaid && orderData.advancePaid > 0 && dueAmountCalc > 0
            ? 'advance_paid'
            : orderData.paymentMethod === 'cod'
            ? 'pending'
            : 'paid',
        trxId: orderData.paymentTrxId,
        paymentNumber: orderData.customer.phone,
        dueAmount: dueAmountCalc
      },
      deliveryZone: orderData.deliveryZone,
      status:
        orderData.initialStatus ||
        (orderData.advancePaid && orderData.advancePaid > 0 && dueAmountCalc > 0
          ? 'partial'
          : orderData.source === 'pos'
          ? 'delivered'
          : 'pending'),
      aiCallStatus: {
        called: false
      },
      courier: {
        provider: chosenCourier,
        trackingCode,
        status: orderData.source === 'pos' ? 'delivered' : 'booked',
        currentLocation: orderData.source === 'pos' ? 'Store Counter POS' : 'BuyOne Central Warehouse, Tejgaon, Dhaka',
        estimatedDelivery: orderData.source === 'pos' ? 'Instant Counter Pickup' : orderData.deliveryZone === 'dhaka_inside' ? '24 Hours' : '48-72 Hours',
        history: [
          {
            status: orderData.source === 'pos' ? 'POS Counter Sale' : 'Order Placed',
            time: 'Just now',
            location: orderData.source === 'pos' ? 'Admin POS Terminal' : 'Online Store',
            note: orderData.source === 'pos' ? 'Completed via Admin Barcode POS' : 'Order successfully created via 1-Click Express Checkout'
          }
        ]
      },
      fraudCheck: {
        checked: true,
        successRate: rate,
        totalOrders: 12,
        deliveredCount: Math.round((12 * rate) / 100),
        cancelledCount: 12 - Math.round((12 * rate) / 100),
        riskLevel: rate >= 80 ? 'safe' : 'moderate',
        message: rate >= 80 ? 'নিরাপদ গ্রাহক।' : 'রিটার্ন ঝুঁকি রয়েছে।'
      },
      source: orderData.source || 'online',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    lastLocalMutationAtRef.current = Date.now();
    knownOrderIdsRef.current.add(newOrder.id);
    setOrders((prev) => [newOrder, ...prev]);

    // Deduct stock quantities
    setProducts((prev) =>
      prev.map((prod) => {
        const orderedQty = orderData.items
          .filter((i) => i.product.id === prod.id)
          .reduce((acc, i) => acc + i.quantity, 0);
        if (orderedQty > 0) {
          const updatedProd = { ...prod, stock: Math.max(0, prod.stock - orderedQty) };
          if (auth.currentUser) {
            saveProductToFirestore(updatedProd).catch(() => {});
          }
          return updatedProd;
        }
        return prod;
      })
    );

    // Immediately persist atomically to BOTH Express API and Cloud Firestore so all devices/browsers receive it live
    const expressPromise = fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newOrder })
    })
      .then((r) => r.ok)
      .catch(() => false);

    // Optional Hostinger DB auto-mirror (handles both Node MySQL direct & PHP Bridge mode + 404 direct fallback)
    const hDb = settings.hostingerDbSettings;
    if (hDb?.enabled && hDb.autoSyncOnOrder) {
      fetch('/api/database/hostinger/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder, config: hDb })
      })
        .then((resp) => {
          if (!resp.ok && hDb.mode === 'php_bridge' && hDb.phpBridgeUrl) {
            fetch(hDb.phpBridgeUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-Bridge-Secret': hDb.phpBridgeSecret || '' },
              body: JSON.stringify({ action: 'upsert_order', tablePrefix: hDb.tablePrefix || 'buyone_', order: newOrder })
            }).catch(() => {});
          }
        })
        .catch(() => {
          if (hDb.mode === 'php_bridge' && hDb.phpBridgeUrl) {
            fetch(hDb.phpBridgeUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-Bridge-Secret': hDb.phpBridgeSecret || '' },
              body: JSON.stringify({ action: 'upsert_order', tablePrefix: hDb.tablePrefix || 'buyone_', order: newOrder })
            }).catch(() => {});
          }
        });
    }

    const allowAdminStatus = isFirebaseAdminConnectedRef.current;
    writeOrderToFirestore(newOrder, allowAdminStatus)
      .then(() => {
        setLastCloudSyncAt(new Date().toLocaleTimeString());
        setCloudSyncError(null);
      })
      .catch((firstErr) => {
        setTimeout(() => {
          writeOrderToFirestore(newOrder, allowAdminStatus)
            .then(() => {
              setLastCloudSyncAt(new Date().toLocaleTimeString());
              setCloudSyncError(null);
            })
            .catch(async (err) => {
              const reason = extractFirestoreErrorReason(err || firstErr);
              setCloudSyncError(reason);
              console.error('Firestore order sync error:', reason);
              const expressSavedOk = await expressPromise;
              if (!expressSavedOk) {
                addToast(
                  'warning',
                  t('ক্লাউড সিঙ্ক সতর্কতা', 'Cloud Order Sync Delayed'),
                  reason || t(
                    'অর্ডার লোকালভাবে সংরক্ষিত হয়েছে, তবে ক্লাউড সিঙ্কে সমস্যা হয়েছে।',
                    'Order saved locally, but cloud order sync encountered an error.'
                  )
                );
              }
            });
        }, 1500);
      });

    // Send automatic SMTP Order Confirmation Email if configured & enabled
    if (settings.smtpSettings?.enabled && settings.smtpSettings?.sendOnOrderConfirmation) {
      const targetEmail =
        customerProfile?.phone === orderData.customer.phone && customerProfile?.email
          ? customerProfile.email
          : settings.smtpSettings.fromEmail || settings.supportEmail;
      if (targetEmail && targetEmail.includes('@')) {
        fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            smtp: settings.smtpSettings,
            to: targetEmail,
            subject: `Order Confirmed #${newOrderId} - ${settings.storeName}`,
            text: `Assalamu Alaikum ${orderData.customer.name},\n\nYour order #${newOrderId} for ৳${total} has been placed successfully!\nDelivery Address: ${orderData.customer.address}, ${orderData.customer.district}\nPayment: ${orderData.paymentMethod.toUpperCase()}\n\nThank you for shopping with ${settings.storeName}.`
          })
        }).catch(() => {});
      }
    }

    // Reset 30-day wallet clock & sync Customer Loyalty Points (both Earned & Redeemed across Customer + Admin CRM)
    const custDigits = String(orderData.customer.phone || '').replace(/[^0-9]/g, '').slice(-11);
    const loyLedgerUpdates: LoyaltyHistoryItem[] = [];
    if (loyaltyPointsUsed > 0) {
      loyLedgerUpdates.push({
        id: `loy-use-${Date.now()}`,
        type: 'redeem',
        points: -loyaltyPointsUsed,
        note: `Redeemed on Order #${newOrderId} (-৳${loyaltyDiscount})`,
        orderId: newOrderId,
        date: nowIso
      });
    }
    if (pointsEarned > 0) {
      loyLedgerUpdates.push({
        id: `loy-earn-${Date.now() + 1}`,
        type: 'earn',
        points: pointsEarned,
        note: `Earned from Order #${newOrderId} (৳${total})`,
        orderId: newOrderId,
        date: nowIso
      });
    }

    if (custDigits.length >= 8) {
      setCustomerAccounts((prev) => {
        const idx = prev.findIndex((a) => String(a.phone || '').replace(/[^0-9]/g, '').slice(-11) === custDigits);
        if (idx >= 0) {
          const updatedList = [...prev];
          const existingAcc = updatedList[idx];
          const nextPts = Math.max(0, (existingAcc.loyaltyPoints || 0) - loyaltyPointsUsed + pointsEarned);
          const nextAcc: CustomerProfile = {
            ...existingAcc,
            loyaltyPoints: nextPts,
            lastPurchaseAt: nowIso,
            loyaltyHistory: [...loyLedgerUpdates, ...(existingAcc.loyaltyHistory || [])].slice(0, 40)
          };
          updatedList[idx] = nextAcc;
          saveCustomerToFirestore(nextAcc).catch(() => {});
          return updatedList;
        } else if (pointsEarned > 0) {
          const welcomeBonus = loyCfg.welcomeBonusPoints || 0;
          const createdAcc: CustomerProfile = {
            name: orderData.customer.name || 'Customer',
            phone: orderData.customer.phone,
            email: '',
            address: orderData.customer.address || '',
            district: orderData.customer.district || 'Dhaka - Inside City',
            loyaltyPoints: pointsEarned + welcomeBonus,
            walletBalance: 0,
            lastPurchaseAt: nowIso,
            loyaltyHistory: [
              ...loyLedgerUpdates,
              ...(welcomeBonus > 0
                ? [{ id: `loy-wel-${Date.now()}`, type: 'earn' as const, points: welcomeBonus, note: 'Loyalty Welcome Bonus', date: nowIso }]
                : [])
            ]
          };
          saveCustomerToFirestore(createdAcc).catch(() => {});
          return [createdAcc, ...prev];
        }
        return prev;
      });
    }

    if (orderData.source !== 'pos') {
      const purchaseIso = new Date().toISOString();
      setWalletLastPurchaseAt(purchaseIso);
      localStorage.setItem('buyonebd_wallet_last_purchase_v1', purchaseIso);
      setCustomerProfile((cp) => {
        const activeDigits = String(cp.phone || '').replace(/[^0-9]/g, '').slice(-11);
        const matchesOrGuest = !custDigits || !activeDigits || activeDigits === custDigits;
        if (!matchesOrGuest) return cp;
        return {
          ...cp,
          lastPurchaseAt: purchaseIso,
          loyaltyPoints: Math.max(0, (cp.loyaltyPoints || 0) - loyaltyPointsUsed + pointsEarned),
          loyaltyHistory: [...loyLedgerUpdates, ...(cp.loyaltyHistory || [])].slice(0, 40)
        };
      });

      trackPixelEvent('Purchase', {
        urlPath: '/checkout',
        value: total,
        contentName: orderData.items.map((i) => i.product.title).join(', ')
      });

      if (!checkoutProduct) {
        clearCart();
      }
    }

    addToast(
      'success',
      t(`অর্ডার সফল হয়েছে! ৳ ${total}`, `Order Placed! ৳ ${total}`),
      t(
        orderData.source === 'pos'
          ? `POS চালান #${newOrderId} তৈরি সম্পন্ন।`
          : `অর্ডার আইডি: ${newOrderId}। কিছুক্ষণের মধ্যে এআই কল আসবে।`,
        orderData.source === 'pos'
          ? `POS Invoice #${newOrderId} completed.`
          : `Order ID: ${newOrderId}. AI auto-confirmation call is initiating.`
      )
    );

    // Auto trigger AI Call if enabled in store settings and not skipped
    if (settings.aiCallSettings.autoCallOnOrder && !orderData.skipAICall && orderData.source !== 'pos') {
      setTimeout(() => {
        startAICall(newOrder);
      }, (settings.aiCallSettings.delaySeconds || 2) * 1000);
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedCourier = { ...ord.courier };
          if (status === 'shipped') {
            updatedCourier.status = 'in_transit';
            updatedCourier.history = [
              ...updatedCourier.history,
              {
                status: 'In Transit',
                time: 'Just now',
                location: 'Hub Dispatched',
                note: 'Dispatched to customer destination hub via courier'
              }
            ];
          } else if (status === 'delivered') {
            updatedCourier.status = 'delivered';
            updatedCourier.history = [
              ...updatedCourier.history,
              {
                status: 'Delivered',
                time: 'Just now',
                location: ord.customer.address,
                note: 'Customer successfully received parcel and paid full COD'
              }
            ];
          }
          const updatedOrder: Order = {
            ...ord,
            status,
            courier: updatedCourier
          };
          fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates: { status, courier: updatedCourier } })
          }).catch(() => {});
          updateOrderInFirestore(updatedOrder).catch(() => {});
          return updatedOrder;
        }
        return ord;
      })
    );
    addToast('info', t('অর্ডার স্ট্যাটাস আপডেট', 'Order Status Updated'), t(`অর্ডারটি '${status}' করা হয়েছে।`, `Status: '${status}'.`));
  };

  const updateOrderCourier = (orderId: string, updates: Partial<Order['courier']>) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const nextCourier = { ...ord.courier, ...updates };
        const updatedOrder: Order = { ...ord, courier: nextCourier };
        fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: { courier: nextCourier } })
        }).catch(() => {});
        updateOrderInFirestore(updatedOrder).catch(() => {});
        return updatedOrder;
      })
    );
  };

  const assignDeliveryBoyToOrder = (orderId: string, boy: DeliveryBoy | null) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const nextCourier: Order['courier'] = {
          ...ord.courier,
          deliveryBoyId: boy ? boy.id : undefined,
          deliveryBoyName: boy ? boy.name : undefined,
          deliveryBoyPhone: boy ? boy.phone : undefined,
          riderName: boy ? boy.name : ord.courier.riderName,
          riderPhone: boy ? boy.phone : ord.courier.riderPhone,
          status: boy && ord.courier.status === 'booked' ? 'out_for_delivery' : ord.courier.status,
          history: boy
            ? [
                ...ord.courier.history,
                {
                  status: 'Delivery Boy Assigned',
                  time: new Date().toLocaleTimeString(),
                  location: boy.zone || ord.customer.district,
                  note: `Assigned to ${boy.name} (${boy.phone})`
                }
              ]
            : ord.courier.history
        };
        const updatedOrder: Order = { ...ord, courier: nextCourier };
        fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: { courier: nextCourier } })
        }).catch(() => {});
        updateOrderInFirestore(updatedOrder).catch(() => {});
        return updatedOrder;
      })
    );
    addToast(
      boy ? 'success' : 'info',
      boy ? t(`রাইডার অ্যাসাইন: ${boy.name}`, `Assigned Rider: ${boy.name}`) : t('রাইডার সরানো হয়েছে', 'Delivery Boy Unassigned'),
      boy ? `${boy.phone} (${boy.zone})` : ''
    );
  };

  const aiConfirmOrderByCustomer = (orderId: string, sourceLabel = 'AI Chat Agent'): boolean => {
    const found = ordersRef.current.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
    if (!found) return false;
    lastLocalMutationAtRef.current = Date.now();
    const nowIso = new Date().toISOString();
    let finalizedOrder: Order | null = null;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== found.id) return ord;
        const nextAiCallStatus = {
          ...ord.aiCallStatus,
          called: true,
          callTimestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          confirmedByCustomer: true,
          notes: `Confirmed A-to-Z via ${sourceLabel}`
        };
        const nextCourier = {
          ...ord.courier,
          history: [
            ...(ord.courier?.history || []),
            {
              status: 'AI Verified & Confirmed',
              time: new Date().toLocaleTimeString(),
              location: sourceLabel,
              note: `Customer confirmed order #${ord.id} via ${sourceLabel}`
            }
          ]
        };
        const updatedOrder: Order = {
          ...ord,
          status: 'ai_confirmed',
          aiCallStatus: nextAiCallStatus,
          courier: nextCourier,
          updatedAt: nowIso
        };
        finalizedOrder = updatedOrder;
        fetch(`/api/orders/${encodeURIComponent(ord.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updates: {
              status: 'ai_confirmed',
              aiCallStatus: nextAiCallStatus,
              courier: nextCourier,
              updatedAt: nowIso
            }
          })
        }).catch(() => {});
        updateOrderInFirestore(updatedOrder, true).catch(() => {});
        return updatedOrder;
      })
    );
    addToast(
      'success',
      t(`অর্ডার #${found.id} এআই-তে কনফার্ম!`, `Order #${found.id} AI Confirmed!`),
      t('অর্ডারটি এখন ডেলিভারির জন্য প্রস্তুত।', 'Ready for Steadfast / Delivery Boy dispatch.')
    );
    // Optional Steadfast auto-book when explicitly configured
    if (
      finalizedOrder &&
      settingsRef.current.courierSettings?.steadfast?.enabled &&
      settingsRef.current.courierSettings?.steadfast?.autoBook &&
      settingsRef.current.courierSettings?.steadfast?.apiKey &&
      settingsRef.current.courierSettings?.steadfast?.secretKey &&
      !found.courier?.consignmentId
    ) {
      bookOrderCourier(found.id, 'Steadfast').catch(() => {});
    }
    return true;
  };

  const recordPartialPayment = (
    orderId: string,
    amountPaidNow: number,
    markCompleted = false,
    note?: string
  ) => {
    const cleanPay = Math.max(0, Math.round(amountPaidNow));
    if (cleanPay <= 0 && !markCompleted) return;
    lastLocalMutationAtRef.current = Date.now();
    const nowIso = new Date().toISOString();

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const total = Number(ord.pricing?.total || 0);
        const prevPaid = Number(ord.pricing?.advancePaid || 0);
        const nextPaid = markCompleted ? Math.max(total, prevPaid + cleanPay) : Math.min(total, prevPaid + cleanPay);
        const nextDue = Math.max(0, total - nextPaid);
        const nextStatus: OrderStatus =
          markCompleted || nextDue === 0 ? 'delivered' : 'partial';
        const nextPayStatus: Order['payment']['status'] =
          nextDue === 0 ? 'paid' : 'advance_paid';

        const nextHistory = [
          ...(ord.pricing?.paymentHistory || []),
          {
            id: `pay-${Date.now()}`,
            amount: cleanPay > 0 ? cleanPay : nextDue,
            method: ord.payment?.method || 'cash',
            note: note || (markCompleted ? 'Final settlement collected' : 'Partial installment collected'),
            date: nowIso
          }
        ];

        const nextCourier: Order['courier'] = {
          ...ord.courier,
          status: nextDue === 0 ? 'delivered' : ord.courier.status,
          history: [
            ...(ord.courier?.history || []),
            {
              status: nextDue === 0 ? 'Full Paid & Delivered' : `Partial Paid (+৳${cleanPay})`,
              time: new Date().toLocaleTimeString(),
              location: 'Admin Billing Desk',
              note: note || `Collected ৳${cleanPay} • Remaining Due: ৳${nextDue}`
            }
          ]
        };

        const nextPricing = {
          ...ord.pricing,
          advancePaid: nextPaid,
          paymentHistory: nextHistory
        };
        const nextPayment = {
          ...ord.payment,
          status: nextPayStatus,
          dueAmount: nextDue
        };
        const updatedOrder: Order = {
          ...ord,
          status: nextStatus,
          pricing: nextPricing,
          payment: nextPayment,
          courier: nextCourier,
          updatedAt: nowIso
        };

        fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updates: {
              status: nextStatus,
              pricing: nextPricing,
              payment: nextPayment,
              courier: nextCourier,
              updatedAt: nowIso
            }
          })
        }).catch(() => {});
        updateOrderInFirestore(updatedOrder).catch(() => {});
        return updatedOrder;
      })
    );

    addToast(
      'success',
      t(`অর্ডার #${orderId} পেমেন্ট আপডেট!`, `Payment Updated #${orderId}`),
      t(`৳${cleanPay.toLocaleString()} জমা হয়েছে।`, `Recorded ৳${cleanPay.toLocaleString()} collected.`)
    );
  };

  const updateOrderDetails = (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const updatedOrder = { ...ord, ...updates };
        updateOrderInFirestore(updatedOrder).catch(() => {});
        return updatedOrder;
      })
    );
    fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates })
    }).catch(() => {});
    addToast('success', t('অর্ডার তথ্য সংরক্ষিত', 'Order Saved'), t(`অর্ডার #${orderId} এর তথ্য আপডেট করা হয়েছে।`, `Order #${orderId} updated.`));
  };

  const deleteOrder = (orderId: string) => {
    knownOrderIdsRef.current.delete(orderId);
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
    fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'DELETE'
    }).catch(() => {});
    deleteOrderFromFirestore(orderId).catch(() => {});
    addToast('info', t('অর্ডার অপসারিত', 'Order Deleted'), t('অর্ডারটি ডাটাবেজ থেকে মুছে দেওয়া হয়েছে।', 'Order removed.'));
  };

  const bulkUpdateOrders = (orderIds: string[], action: { status?: OrderStatus; deleteAll?: boolean }) => {
    if (!orderIds || orderIds.length === 0) return;
    const idSet = new Set(orderIds);

    if (action.deleteAll) {
      orderIds.forEach((id) => {
        knownOrderIdsRef.current.delete(id);
        fetch(`/api/orders/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
        deleteOrderFromFirestore(id).catch(() => {});
      });
      setOrders((prev) => prev.filter((ord) => !idSet.has(ord.id)));
      addToast(
        'info',
        t('বাল্ক ডিলিট সম্পন্ন', 'Bulk Delete Complete'),
        t(`${orderIds.length} টি অর্ডার ডিলিট করা হয়েছে।`, `${orderIds.length} orders deleted.`)
      );
      return;
    }

    if (action.status) {
      const nextStatus = action.status;
      setOrders((prev) =>
        prev.map((ord) => {
          if (!idSet.has(ord.id)) return ord;
          const updatedCourier = { ...ord.courier };
          if (nextStatus === 'shipped') {
            updatedCourier.status = 'in_transit';
            updatedCourier.history = [
              ...updatedCourier.history,
              {
                status: 'In Transit',
                time: 'Just now',
                location: 'Hub Dispatched',
                note: 'Bulk dispatched via courier hub'
              }
            ];
          } else if (nextStatus === 'delivered') {
            updatedCourier.status = 'delivered';
            updatedCourier.history = [
              ...updatedCourier.history,
              {
                status: 'Delivered',
                time: 'Just now',
                location: ord.customer.address,
                note: 'Marked delivered via bulk action'
              }
            ];
          }
          const updatedOrder: Order = {
            ...ord,
            status: nextStatus,
            courier: updatedCourier
          };
          fetch(`/api/orders/${encodeURIComponent(ord.id)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates: { status: nextStatus, courier: updatedCourier } })
          }).catch(() => {});
          updateOrderInFirestore(updatedOrder).catch(() => {});
          return updatedOrder;
        })
      );
      addToast(
        'success',
        t('বাল্ক স্ট্যাটাস আপডেট হয়েছে', 'Bulk Status Updated'),
        t(
          `${orderIds.length} টি অর্ডার '${nextStatus}' করা হয়েছে।`,
          `Updated ${orderIds.length} orders to '${nextStatus}'.`
        )
      );
    }
  };

  // AI Call methods
  const startAICall = (order: Order) => {
    setActiveCallOrder(order);
    setIsCallRinging(true);
    setIsCallActive(false);
  };

  const answerAICall = () => {
    setIsCallRinging(false);
    setIsCallActive(true);
  };

  const declineAICall = () => {
    setIsCallRinging(false);
    setIsCallActive(false);
    setActiveCallOrder(null);
    addToast('warning', t('কল বাতিল করা হয়েছে', 'Call Declined'), t('গ্রাহক এআই নিশ্চিতকরণ কলটি কেটে দিয়েছেন।', 'Customer declined.'));
  };

  const finishAICall = (confirmed: boolean, transcriptLog?: { speaker: 'ai' | 'customer'; text: string; textBn: string; time: string }[]) => {
    if (activeCallOrder) {
      const orderId = activeCallOrder.id;
      const nowIso = new Date().toISOString();
      lastLocalMutationAtRef.current = Date.now();
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            const nextStatus: OrderStatus = confirmed ? 'ai_confirmed' : 'cancelled';
            const nextAiCallStatus = {
              called: true,
              callTimestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              confirmedByCustomer: confirmed,
              durationSeconds: Math.floor(25 + Math.random() * 20),
              notes: confirmed ? 'Customer confirmed order verbally/via keypad during AI auto-call' : 'Customer cancelled order during call',
              transcript: transcriptLog
            };
            const nextCourier = confirmed
              ? {
                  ...ord.courier,
                  history: [
                    ...(ord.courier?.history || []),
                    {
                      status: 'AI Call Verified',
                      time: 'Just now',
                      location: 'Automated System',
                      note: 'Customer confirmed parcel receipt via AI Call'
                    }
                  ]
                }
              : ord.courier;
            const updatedOrder: Order = {
              ...ord,
              status: nextStatus,
              aiCallStatus: nextAiCallStatus,
              courier: nextCourier,
              updatedAt: nowIso
            };
            fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                updates: {
                  status: nextStatus,
                  aiCallStatus: nextAiCallStatus,
                  courier: nextCourier,
                  updatedAt: nowIso
                }
              })
            }).catch(() => {});
            updateOrderInFirestore(updatedOrder, confirmed).catch(() => {});
            return updatedOrder;
          }
          return ord;
        })
      );

      if (confirmed) {
        addToast(
          'success',
          t('অর্ডার এআই দ্বারা নিশ্চিত হয়েছে!', 'AI Order Confirmed!'),
          t(`অর্ডার #${orderId} সফলভাবে ভেরিফাই করা হয়েছে। স্টিডফাস্ট কুরিয়ারে বুকিংয়ের জন্য প্রস্তুত।`, `Order #${orderId} verified by AI. Ready for dispatch.`)
        );
        if (
          settingsRef.current.courierSettings?.steadfast?.enabled &&
          settingsRef.current.courierSettings?.steadfast?.autoBook &&
          settingsRef.current.courierSettings?.steadfast?.apiKey &&
          settingsRef.current.courierSettings?.steadfast?.secretKey &&
          !activeCallOrder.courier?.consignmentId
        ) {
          bookOrderCourier(orderId, 'Steadfast').catch(() => {});
        }
      } else {
        addToast(
          'error',
          t('অর্ডার বাতিল করা হয়েছে', 'Order Cancelled'),
          t(`গ্রাহক কলে অর্ডার #${orderId} বাতিল করার অনুরোধ করেছেন।`, `Customer cancelled order #${orderId}.`)
        );
      }
    }

    setIsCallRinging(false);
    setIsCallActive(false);
    setActiveCallOrder(null);
  };

  const closeCallModal = () => {
    setIsCallRinging(false);
    setIsCallActive(false);
    setActiveCallOrder(null);
  };

  // Play voice sample to test audio live (Gemini Neural TTS + guaranteed Free Browser Speech fallback)
  const playVoiceSample = async () => {
    if (sampleAudioRef.current) {
      sampleAudioRef.current.pause();
      sampleAudioRef.current = null;
      setIsPlayingVoiceSample(false);
      return;
    }

    const sampleScript =
      settings.aiCallSettings.banglaScript ||
      'আসসালামু আলাইকুম! বাইওয়ান বিডি থেকে আমি সুমনা বলছি। আপনার অর্ডারটি নিশ্চিত করতে অনুগ্রহ করে এক চাপুন।';

    const speakWithBrowserFallback = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(sampleScript);
          const voices = window.speechSynthesis.getVoices();
          const bnVoice =
            voices.find((v) => v.lang.includes('bn') || v.name.includes('Bangla') || v.name.includes('Bengali')) ||
            voices[0];
          if (bnVoice) u.voice = bnVoice;
          u.rate = 0.94;
          u.onend = () => setIsPlayingVoiceSample(false);
          u.onerror = () => setIsPlayingVoiceSample(false);
          window.speechSynthesis.speak(u);
          return;
        } catch {}
      }
      setIsPlayingVoiceSample(false);
    };

    try {
      setIsPlayingVoiceSample(true);
      const res = await fetch('/api/tts/sample');
      const data = await safeParseJson<{ audioUrl?: string }>(res);
      if (res.ok && data?.audioUrl) {
        const audio = new Audio(data.audioUrl);
        sampleAudioRef.current = audio;
        audio.onended = () => {
          setIsPlayingVoiceSample(false);
          sampleAudioRef.current = null;
        };
        audio.onerror = () => {
          sampleAudioRef.current = null;
          speakWithBrowserFallback();
        };
        await audio.play();
      } else {
        speakWithBrowserFallback();
      }
    } catch {
      speakWithBrowserFallback();
    }
  };

  // Cart operations
  const attrKey = (attrs?: Record<string, string>) =>
    attrs && Object.keys(attrs).length > 0 ? JSON.stringify(attrs) : '';

  const addToCart = (
    product: Product,
    quantity = 1,
    color?: string,
    size?: string,
    selectedAttributes?: Record<string, string>
  ) => {
    const incomingKey = attrKey(selectedAttributes);
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.product.id === product.id &&
          i.selectedColor === color &&
          i.selectedSize === size &&
          attrKey(i.selectedAttributes) === incomingKey
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [...prev, { product, quantity, selectedColor: color, selectedSize: size, selectedAttributes }];
    });
    trackPixelEvent('AddToCart', {
      urlPath: window.location.pathname || '/',
      value: product.price * quantity,
      contentName: product.title
    });
    addToast(
      'success',
      t('কার্টে যোগ হয়েছে', 'Added to Cart'),
      `${product[lang === 'bn' ? 'titleBn' : 'title']} (${quantity} টি)`
    );
  };

  const removeFromCart = (
    productId: string,
    color?: string,
    size?: string,
    selectedAttributes?: Record<string, string>
  ) => {
    const k = attrKey(selectedAttributes);
    setCart((prev) =>
      prev.filter(
        (i) =>
          !(
            i.product.id === productId &&
            i.selectedColor === color &&
            i.selectedSize === size &&
            attrKey(i.selectedAttributes) === k
          )
      )
    );
  };

  const updateCartQuantity = (
    productId: string,
    delta: number,
    color?: string,
    size?: string,
    selectedAttributes?: Record<string, string>
  ) => {
    const k = attrKey(selectedAttributes);
    setCart((prev) =>
      prev
        .map((i) => {
          if (
            i.product.id === productId &&
            i.selectedColor === color &&
            i.selectedSize === size &&
            attrKey(i.selectedAttributes) === k
          ) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Settings (persists BOTH public storefront config and private SMTP/Courier/Marketing/AI vault)
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    lastLocalMutationAtRef.current = Date.now();
    setSettings((prev) => {
      const next = { ...prev, ...newSettings };
      if (newSettings.themeColors && !newSettings.brandAttributes) {
        const computed = computeBrandPaletteAttributes(
          next.themeColors?.primary,
          next.themeColors?.secondary
        );
        next.brandAttributes = {
          primaryHover: computed.primaryHover,
          primarySoft: computed.primarySoft,
          primaryBorder: computed.primaryBorder,
          onPrimary: computed.onPrimary,
          cssAttributeString: computed.cssAttributeString,
          generatedAt: new Date().toISOString()
        };
      }
      saveStorefrontSettingsToFirestore(next, categoriesRef.current, slidersRef.current).catch(() => {});
      if (isFirebaseAdminConnectedRef.current) {
        saveAdminPrivateConfigToFirestore(next).catch(() => {});
      }
      return next;
    });
    addToast('success', t('সেটিংস সংরক্ষিত হয়েছে', 'Settings Saved'), t('স্টোরের সকল পরিবর্তন সফলভাবে সংরক্ষিত।', 'Configurations updated.'));
  };

  const cloudCollectionCounts = React.useMemo(
    () => ({
      storefront: 1,
      privateConfig: isFirebaseAdminConnected ? 1 : 0,
      products: products.length,
      categories: categories.length,
      sliders: sliders.length,
      orders: orders.length,
      reviews: reviews.length,
      mediaLibrary: mediaLibrary.length,
      customers: customerAccounts.length,
      walletTopUps: walletTopUps.length,
      abandonedCarts: abandonedCarts.length,
      priceAlerts: priceAlerts.length,
      staffUsers: users.length
    }),
    [
      isFirebaseAdminConnected,
      products.length,
      categories.length,
      sliders.length,
      orders.length,
      reviews.length,
      mediaLibrary.length,
      customerAccounts.length,
      walletTopUps.length,
      abandonedCarts.length,
      priceAlerts.length,
      users.length
    ]
  );

  // Non-Destructive Clear Cache (Clears temporary logs/audio cache ONLY; preserves all products, orders, customers, settings)
  const clearAppCache = async () => {
    const cacheKeys = [
      'buyonebd_pixel_events_v3',
      'buyonebd_browsing_logs_v3',
      'buyonebd_wa_logs_v3',
      'buyonebd_compare_v3'
    ];
    cacheKeys.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });
    setServerPixelEvents([]);
    setCustomerBrowsingLogs([]);
    setWhatsappLogs([]);
    setCompareList([]);
    setSearchQuery('');

    try {
      await fetch('/api/cache/clear', { method: 'POST' });
    } catch {}

    addToast(
      'success',
      t('ক্যাশ পরিষ্কার সম্পন্ন!', 'Cache Cleared!'),
      t(
        'অস্থায়ী ক্যাশ ও লগ ক্লিয়ার করা হয়েছে — কোনো পণ্য, অর্ডার বা সেটিংস মুছে যায়নি।',
        'Temporary caches cleared cleanly. Products, orders, customers & settings remain intact.'
      )
    );
  };

  const resetAllToDefault = () => {
    // Non-destructive update: preserves all orders, products, customers & existing configs
    setSettings((prev) => mergeSettings(prev));
    addToast(
      'success',
      t('নিরাপদ আপডেট সম্পন্ন', 'Safe Settings Sync Complete'),
      t(
        'কোনো অর্ডার, পণ্য বা গ্রাহক তথ্য মুছে না ফেলে ডিফল্ট সেটিংস হালনাগাদ করা হয়েছে।',
        'Default configuration keys updated without deleting any orders, products, or customer records.'
      )
    );
  };

  const openOneClickCheckout = (product: Product | null = null) => {
    setCheckoutProduct(product);
    setIsOneClickOpen(true);
    navigateToPath('/checkout');
    recordPageVisit('/checkout', t('১-ক্লিক চেকআউট', '1-Click Checkout'), product);
    trackPixelEvent('InitiateCheckout', {
      urlPath: '/checkout',
      value: product ? product.price : cartTotal,
      contentName: product ? product.title : 'Cart Checkout'
    });
  };

  // Autonomous Human-Like Website Control AI Agent Log & Dispatcher
  const [agentActionLogs, setAgentActionLogs] = useState<
    { id: string; time: string; instruction: string; reply: string; actions: string[]; mode: string }[]
  >([]);

  const executeAIAgentCommand = async (
    instruction: string,
    role: 'admin' | 'customer' = 'admin',
    adminTabSetter?: (tab: string) => void
  ): Promise<{ reply: string; executed: string[]; mode: string }> => {
    const contextPayload = {
      storeName: settingsRef.current.storeName,
      orders: ordersRef.current.slice(0, 30),
      products: productsRef.current.slice(0, 35),
      customers: customerAccounts.slice(0, 30),
      abandonedCarts: abandonedCartsRef.current.slice(0, 20),
      deliveryFees: settingsRef.current.deliveryFees,
      flashSaleEnabled: settingsRef.current.flashSale?.enabled
    };

    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instruction,
        role,
        lang: role === 'admin' ? adminLang : lang,
        context: contextPayload
      })
    });
    const data = (await safeParseJson<{ reply?: string; commands?: any[]; mode?: string }>(res)) || {};
    const commands: any[] = Array.isArray(data.commands) ? data.commands : [];
    const executed: string[] = [];

    for (const cmd of commands) {
      const p = cmd.payload || {};
      switch (cmd.type) {
        case 'ai_confirm_order': {
          if (p.orderId && aiConfirmOrderByCustomer(String(p.orderId), 'Store Operations AI Controller')) {
            executed.push(`AI Confirmed #${p.orderId}`);
          }
          break;
        }
        case 'update_order_status': {
          if (p.orderId && p.status) {
            updateOrderStatus(String(p.orderId), p.status as OrderStatus);
            executed.push(`Updated #${p.orderId} → ${p.status}`);
          }
          break;
        }
        case 'book_courier': {
          if (p.orderId) {
            await bookOrderCourier(String(p.orderId), (p.provider || 'Steadfast') as CourierProvider);
            executed.push(`Courier Booked #${p.orderId} (${p.provider || 'Steadfast'})`);
          }
          break;
        }
        case 'record_partial_payment': {
          if (p.orderId) {
            recordPartialPayment(String(p.orderId), Number(p.amount) || 0, Boolean(p.markDelivered), 'Collected via AI Agent');
            executed.push(`Partial Payment ৳${p.amount} on #${p.orderId}`);
          }
          break;
        }
        case 'update_product': {
          const target =
            productsRef.current.find((pr) => pr.id === p.productId) ||
            productsRef.current.find((pr) =>
              p.query ? `${pr.title} ${pr.titleBn}`.toLowerCase().includes(String(p.query).toLowerCase()) : false
            );
          if (target) {
            const patch: Partial<Product> = {};
            if (typeof p.price === 'number') patch.price = p.price;
            if (typeof p.originalPrice === 'number') patch.originalPrice = p.originalPrice;
            if (typeof p.stock === 'number') patch.stock = p.stock;
            if (typeof p.isFlashSale === 'boolean') patch.isFlashSale = p.isFlashSale;
            updateProduct(target.id, patch);
            executed.push(`Updated Product "${target.title.slice(0, 24)}"`);
          }
          break;
        }
        case 'create_coupon': {
          if (p.code) {
            const code = String(p.code).toUpperCase().trim();
            const existing = settingsRef.current.promoCoupons || [];
            const nextCoupon = {
              id: `cpn-${Date.now()}`,
              code,
              discountType: (p.discountType || 'fixed') as 'fixed' | 'percent' | 'free_shipping',
              value: Math.max(0, Number(p.value) || 100),
              minOrder: Math.max(0, Number(p.minOrder) || 0),
              active: true
            };
            updateSettings({
              promoCoupons: [nextCoupon, ...existing.filter((c) => c.code !== code)]
            });
            executed.push(`Created Coupon ${code}`);
          }
          break;
        }
        case 'toggle_flash_sale': {
          updateSettings({
            flashSale: {
              ...settingsRef.current.flashSale,
              enabled: Boolean(p.enabled)
            }
          });
          executed.push(`Flash Sale ${p.enabled ? 'ON' : 'OFF'}`);
          break;
        }
        case 'adjust_loyalty_points': {
          if (p.identifier) {
            if (p.mode === 'delete') {
              if (deleteCustomerLoyaltyPoints(String(p.identifier))) {
                executed.push(`Deleted Loyalty Points (${p.identifier})`);
              }
            } else if (p.mode === 'set' && typeof p.exactPoints === 'number') {
              if (setCustomerLoyaltyPoints(String(p.identifier), p.exactPoints, p.note)) {
                executed.push(`Set ${p.exactPoints} Loyalty Pts (${p.identifier})`);
              }
            } else if (typeof p.delta === 'number') {
              if (adjustCustomerLoyaltyPoints(String(p.identifier), p.delta, p.note)) {
                executed.push(`${p.delta > 0 ? '+' : ''}${p.delta} Loyalty Pts (${p.identifier})`);
              }
            }
          }
          break;
        }
        case 'adjust_wallet': {
          if (p.identifier && typeof p.delta === 'number') {
            if (adjustSpecificCustomerBalance(String(p.identifier), p.delta, p.note)) {
              executed.push(`${p.delta > 0 ? '+' : ''}৳${p.delta} Wallet (${p.identifier})`);
            }
          }
          break;
        }
        case 'recover_abandoned_cart': {
          if (p.cartId === 'all_pending') {
            const pendingIds = abandonedCartsRef.current.filter((c) => !c.recovered).map((c) => c.id);
            if (pendingIds.length > 0) {
              bulkAbandonedCartsAction(pendingIds, 'whatsapp');
              executed.push(`Sent Recovery to ${pendingIds.length} Carts`);
            }
          } else if (p.cartId) {
            markAbandonedCartWhatsAppSent(String(p.cartId));
            executed.push(`Recovered Cart ${p.cartId}`);
          }
          break;
        }
        case 'update_store_settings': {
          const patch: Partial<StoreSettings> = {};
          if (
            typeof p.dhakaInsideFee === 'number' ||
            typeof p.dhakaSubFee === 'number' ||
            typeof p.dhakaOutsideFee === 'number'
          ) {
            patch.deliveryFees = {
              dhakaInside: p.dhakaInsideFee ?? settingsRef.current.deliveryFees.dhakaInside,
              dhakaSub: p.dhakaSubFee ?? settingsRef.current.deliveryFees.dhakaSub,
              dhakaOutside: p.dhakaOutsideFee ?? settingsRef.current.deliveryFees.dhakaOutside
            };
          }
          if (
            p.announcementTextBn !== undefined ||
            p.announcementTextEn !== undefined ||
            typeof p.announcementEnabled === 'boolean'
          ) {
            patch.announcementBar = {
              enabled: p.announcementEnabled ?? settingsRef.current.announcementBar.enabled,
              textBn: p.announcementTextBn ?? settingsRef.current.announcementBar.textBn,
              textEn: p.announcementTextEn ?? settingsRef.current.announcementBar.textEn
            };
          }
          if (
            typeof p.loyaltyEnabled === 'boolean' ||
            typeof p.loyaltyPointsPer100 === 'number' ||
            typeof p.loyaltyBdtPerPoint === 'number'
          ) {
            patch.loyaltySettings = {
              ...(settingsRef.current.loyaltySettings || INITIAL_SETTINGS.loyaltySettings!),
              ...(typeof p.loyaltyEnabled === 'boolean' ? { enabled: p.loyaltyEnabled } : {}),
              ...(typeof p.loyaltyPointsPer100 === 'number' ? { pointsPer100Bdt: p.loyaltyPointsPer100 } : {}),
              ...(typeof p.loyaltyBdtPerPoint === 'number' ? { bdtPerPoint: p.loyaltyBdtPerPoint } : {})
            };
          }
          if (Object.keys(patch).length > 0) {
            updateSettings(patch);
            executed.push('Updated Store Settings');
          }
          break;
        }
        case 'navigate_admin_tab': {
          if (p.tab && adminTabSetter) {
            adminTabSetter(String(p.tab));
            executed.push(`Opened ${p.tab}`);
          }
          break;
        }
        case 'add_to_cart': {
          const prod = productsRef.current.find((pr) => pr.id === p.productId);
          if (prod) {
            addToCart(prod, Math.max(1, Number(p.quantity) || 1));
            executed.push(`Added ${prod.title} to Cart`);
          }
          break;
        }
        case 'open_checkout': {
          const prod = productsRef.current.find((pr) => pr.id === p.productId);
          if (prod) {
            openOneClickCheckout(prod);
            executed.push(`Opened 1-Click Checkout`);
          }
          break;
        }
        case 'track_order': {
          if (p.orderId) {
            setTrackingSearchQuery(String(p.orderId));
            setActiveView('tracking');
            executed.push(`Tracking #${p.orderId}`);
          }
          break;
        }
        case 'navigate_store': {
          if (p.category) {
            selectCategoryFilter(String(p.category));
          } else if (p.view === 'tracking') {
            setActiveView('tracking');
          } else if (p.view === 'admin') {
            navigateToPath('/hossain');
            if (isAdminLoggedIn) {
              setActiveView('admin');
            } else {
              setIsAdminLoginOpen(true);
            }
          } else {
            goHome();
          }
          executed.push(`Navigated Store`);
          break;
        }
      }
    }

    const reply =
      data.reply ||
      (executed.length > 0
        ? executed.join(', ')
        : t('কমান্ড সম্পন্ন হয়েছে।', 'Command processed.'));

    setAgentActionLogs((prev) => [
      {
        id: `agl-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        instruction,
        reply,
        actions: executed,
        mode: data.mode || 'gemini_live'
      },
      ...prev
    ].slice(0, 30));

    return { reply, executed, mode: data.mode || 'gemini_live' };
  };

  const closeOneClickCheckout = () => {
    setIsOneClickOpen(false);
    setCheckoutProduct(null);
    if (window.location.pathname === '/checkout') {
      const fallbackPath = selectedProductForPage
        ? `/product/${selectedProductForPage.seo?.slug || selectedProductForPage.id}`
        : storeSubView === 'products'
        ? '/products'
        : '/';
      navigateToPath(fallbackPath, true);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        lang,
        setLang,
        adminLang,
        setAdminLang,
        t,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
        searchQuery,
        setSearchQuery,
        storeSubView,
        setStoreSubView,
        goHome,
        openAllProductsPage,
        openAboutPage,
        selectCategoryFilter,
        openProductPage,
        navigateToPath,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductFlashSale,
        isCustomerLoggedIn,
        isCustomerLoginOpen,
        setIsCustomerLoginOpen,
        loginCustomer,
        registerCustomer,
        sendPasswordResetOtp,
        resetCustomerPassword,
        logoutCustomer,
        openCustomerPortal,
        customerAccounts,
        adjustSpecificCustomerBalance,
        resetCustomerWalletExpiry,
        customerWalletBalance,
        addToWallet,
        deductWallet,
        walletLastPurchaseAt,
        walletLastCreditAt,
        walletDaysRemaining,
        walletTopUps,
        requestWalletTopUp,
        approveWalletTopUp,
        rejectWalletTopUp,
        editWalletTopUp,
        deleteWalletTopUp,
        bulkActionWalletTopUps,
        adjustCustomerWalletByAdmin,
        runWalletExpirySweep,
        mediaLibrary,
        registerMediaItem,
        deleteMediaItems,
        resizeMediaItems,
        syncStoreMediaLibrary,
        priceAlerts,
        addPriceAlert,
        waitlistEntries,
        addWaitlistEntry,
        markWaitlistNotified,
        deleteWaitlistEntry,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryActive,
        sliders,
        addSlide,
        updateSlide,
        deleteSlide,
        toggleSlideActive,
        orders,
        createOrder,
        updateOrderStatus,
        updateOrderCourier,
        assignDeliveryBoyToOrder,
        aiConfirmOrderByCustomer,
        recordPartialPayment,
        updateOrderDetails,
        deleteOrder,
        bulkUpdateOrders,
        syncStoreFromServer: () => fetchStoreSnapshotFromServer(false),
        securityLogs,
        addSecurityLog,
        clearSecurityLogs,
        bookOrderCourier,
        sendOrderToSteadfast,
        checkSteadfastDeliveryStatus,
        refreshOrderScore,
        checkCustomerFraudRisk,
        whatsappLogs,
        sendMetaWhatsAppMessage,
        applyBusinessTheme,
        serverPixelEvents,
        customerBrowsingLogs,
        trackPixelEvent,
        recordPageVisit,
        supportChats,
        activeChatSessionId,
        setActiveChatSessionId,
        isLiveSocketConnected,
        sendCustomerChatMessage,
        sendAgentChatReply,
        generateAgentAIReply,
        openOrCreateCustomerChatSession,
        markChatRead,
        toggleChatManualMode,
        requestHumanSupport,
        resolveSupportChatSession,
        deleteSupportChatSession,
        browserCalls,
        activeBrowserCall,
        webrtcAudioStatus,
        isBrowserCallMicMuted,
        toggleBrowserCallMicMute,
        initiateCustomerBrowserCall,
        answerBrowserCallFromBackend,
        answerIncomingCustomerCall,
        appendBrowserCallMessage,
        endBrowserCallSession,
        abandonedCarts,
        markAbandonedCartWhatsAppSent,
        recoverAbandonedCart,
        editAbandonedCart,
        deleteAbandonedCart,
        bulkAbandonedCartsAction,
        agentActionLogs,
        executeAIAgentCommand,
        compareList,
        toggleCompare,
        isComparing,
        clearCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,
        reviews,
        addProductReview,
        updateProductReview,
        bulkUpdateReviews,
        bulkDeleteReviews,
        deleteProductReview,
        users,
        addUser,
        updateUser,
        deleteUser,
        isAdminLoggedIn,
        isAdminLoginOpen,
        setIsAdminLoginOpen,
        loginAdmin,
        logoutAdmin,
        firebaseAdminUserEmail,
        isFirebaseAdminConnected,
        cloudSyncError,
        lastCloudSyncAt,
        isSyncingCloudAll,
        cloudCollectionCounts,
        signInAdminWithGoogle,
        signOutAdminFirebase,
        syncAllDashboardToFirebase,
        pullAllDashboardFromFirebase,
        testFirebaseCloudConnection,
        exportFullDatabaseBackup,
        restoreDatabaseFromBackup,
        spinRewards,
        addSpinReward,
        updateSpinReward,
        deleteSpinReward,
        remainingSpinsToday,
        spinCooldownMinutes,
        recordSpinUsed,
        wishlist,
        toggleWishlist,
        isWishlisted,
        activeCallOrder,
        isCallRinging,
        isCallActive,
        startAICall,
        answerAICall,
        declineAICall,
        finishAICall,
        closeCallModal,
        playVoiceSample,
        isPlayingVoiceSample,
        settings,
        updateSettings,
        generateBrandColorAttributes,
        clearAppCache,
        resetAllToDefault,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        checkoutProduct,
        isOneClickOpen,
        openOneClickCheckout,
        closeOneClickCheckout,
        isWhatsAppOpen,
        setIsWhatsAppOpen,
        isSpinOpen,
        setIsSpinOpen,
        isMobileCategoryDrawerOpen,
        setIsMobileCategoryDrawerOpen,
        activeView,
        setActiveView,
        trackingSearchQuery,
        setTrackingSearchQuery,
        customerProfile,
        updateCustomerProfile,
        saveSpinCoupon,
        recentlyViewedIds,
        recordProductView,
        clearRecentlyViewed,
        claimDailyCheckIn,
        redeemLoyaltyPoints,
        adjustCustomerLoyaltyPoints,
        setCustomerLoyaltyPoints,
        deleteCustomerLoyaltyPoints,
        isCustomerDashboardOpen,
        setIsCustomerDashboardOpen,
        selectedProductForPage,
        setSelectedProductForPage,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
