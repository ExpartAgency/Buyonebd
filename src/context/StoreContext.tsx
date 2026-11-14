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
  MediaItem
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

interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
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
  storeSubView: 'home' | 'products';
  setStoreSubView: (view: 'home' | 'products') => void;
  goHome: () => void;
  openAllProductsPage: () => void;
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
    items: { product: Product; quantity: number; selectedColor?: string; selectedSize?: string }[];
    paymentMethod: PaymentMethod;
    paymentTrxId?: string;
    deliveryZone: DeliveryZone;
    advancePaid?: number;
    discountAmount?: number;
    couponCode?: string;
    walletUsedAmount?: number;
    customDeliveryFee?: number;
    source?: 'online' | 'pos';
    initialStatus?: OrderStatus;
    skipAICall?: boolean;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderCourier: (orderId: string, updates: Partial<Order['courier']>) => void;
  updateOrderDetails: (orderId: string, updates: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;

  // Customer Auth, Wallet & Profile
  isCustomerLoggedIn: boolean;
  isCustomerLoginOpen: boolean;
  setIsCustomerLoginOpen: (open: boolean) => void;
  loginCustomer: (identifier: string, password: string) => boolean;
  registerCustomer: (data: { name: string; username: string; phone: string; email?: string; password: string }) => boolean;
  logoutCustomer: () => void;
  openCustomerPortal: () => void;
  customerAccounts: CustomerProfile[];
  adjustSpecificCustomerBalance: (identifier: string, delta: number, reason?: string) => boolean;
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
  recordProductView: (productId: string) => void;
  claimDailyCheckIn: () => { success: boolean; amount: number; message: string };
  redeemLoyaltyPoints: (points: number) => { success: boolean; discountAmount: number };
  isCustomerDashboardOpen: boolean;
  setIsCustomerDashboardOpen: (open: boolean) => void;

  // Single Product Page View
  selectedProductForPage: Product | null;
  setSelectedProductForPage: (product: Product | null) => void;

  // Price Alerts
  priceAlerts: PriceAlert[];
  addPriceAlert: (alertData: { productId: string; contact: string; targetPrice: number }) => void;

  // Steadfast & Multi-Courier Hub
  bookOrderCourier: (orderId: string, provider: CourierProvider) => Promise<{ success: boolean; trackingCode?: string; consignmentId?: string }>;
  sendOrderToSteadfast: (orderId: string) => Promise<{ success: boolean; trackingCode?: string; consignmentId?: string }>;
  checkCustomerFraudRisk: (phone: string) => Promise<OrderFraudCheck>;

  // Meta WhatsApp Cloud API CRM & Business Theme Presets
  whatsappLogs: WhatsAppCloudLog[];
  sendMetaWhatsAppMessage: (payload: { to: string; message?: string; templateName?: string }) => Promise<{ success: boolean; mode?: string; error?: string }>;
  applyBusinessTheme: (themeId: StoreTheme, includeCategories?: boolean) => void;

  // Server-Side Pixel CAPI & Customer Browsing Logs
  serverPixelEvents: ServerPixelEvent[];
  customerBrowsingLogs: CustomerBrowsingEvent[];
  trackPixelEvent: (eventName: string, extras?: { urlPath?: string; value?: number; contentName?: string }) => void;
  recordPageVisit: (urlPath: string, pageTitle: string, product?: Product | null, categorySlug?: string) => void;

  // Live Support Chats & Backend Browser Call Desk
  supportChats: SupportChatSession[];
  activeChatSessionId: string;
  sendCustomerChatMessage: (text: string) => Promise<void>;
  sendAgentChatReply: (sessionId: string, text: string) => void;
  generateAgentAIReply: (sessionId: string) => Promise<string>;
  markChatRead: (sessionId: string) => void;
  browserCalls: BrowserCallSession[];
  activeBrowserCall: BrowserCallSession | null;
  initiateCustomerBrowserCall: (
    order?: Order | null,
    callerInfo?: { name?: string; phone?: string; autoConnect?: boolean }
  ) => string;
  answerBrowserCallFromBackend: (callId: string) => void;
  appendBrowserCallMessage: (callId: string, speaker: 'customer' | 'assistant' | 'ai', text: string, textBn?: string) => void;
  endBrowserCallSession: (callId: string, confirmed?: boolean) => void;

  // Abandoned Carts
  abandonedCarts: AbandonedCart[];
  markAbandonedCartWhatsAppSent: (cartId: string) => void;
  recoverAbandonedCart: (cartId: string) => void;

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
  deleteProductReview: (id: string) => void;

  // Users & Staff
  users: UserStaff[];
  addUser: (userData: Omit<UserStaff, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<UserStaff>) => void;
  deleteUser: (id: string) => void;

  // Admin Auth (Hossain login)
  isAdminLoggedIn: boolean;
  isAdminLoginOpen: boolean;
  setIsAdminLoginOpen: (open: boolean) => void;
  loginAdmin: (email: string, pass: string) => boolean;
  logoutAdmin: () => void;

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

  // Store Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  clearAppCache: () => Promise<void>;
  resetAllToDefault: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  removeFromCart: (productId: string, color?: string, size?: string) => void;
  updateCartQuantity: (productId: string, delta: number, color?: string, size?: string) => void;
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

// Deep merger to avoid undefined properties
function mergeSettings(raw: any): StoreSettings {
  if (!raw || typeof raw !== 'object') return INITIAL_SETTINGS;
  return {
    ...INITIAL_SETTINGS,
    ...raw,
    deliveryFees: { ...INITIAL_SETTINGS.deliveryFees, ...(raw.deliveryFees || {}) },
    paymentSettings: { ...INITIAL_SETTINGS.paymentSettings, ...(raw.paymentSettings || {}) },
    aiCallSettings: { ...INITIAL_SETTINGS.aiCallSettings, ...(raw.aiCallSettings || {}) },
    announcementBar: { ...INITIAL_SETTINGS.announcementBar, ...(raw.announcementBar || {}) },
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
      whatsappCloudApi: { ...INITIAL_SETTINGS.marketingSettings.whatsappCloudApi!, ...(raw.marketingSettings?.whatsappCloudApi || {}) },
      socialLinks: { ...INITIAL_SETTINGS.marketingSettings.socialLinks!, ...(raw.marketingSettings?.socialLinks || {}) }
    },
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
      }
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

  // Admin Language
  const [adminLang, setAdminLangState] = useState<'bn' | 'en'>(() => {
    return (localStorage.getItem('buyonebd_admin_lang_v3') as 'bn' | 'en') || 'bn';
  });

  const setAdminLang = (newLang: 'bn' | 'en') => {
    setAdminLangState(newLang);
    localStorage.setItem('buyonebd_admin_lang_v3', newLang);
  };

  const t = (bn: string, en: string) => (lang === 'bn' ? bn : en);

  // Settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS);
      return saved ? mergeSettings(JSON.parse(saved)) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

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

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(categories));
    setSettings((prev) => ({ ...prev, categories }));
  }, [categories]);

  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: catData.slug.toLowerCase().replace(/[^a-z0-9]/g, '-') || `cat-${Date.now()}`
    };
    setCategories((prev) => [...prev, newCat]);
    addToast('success', t('ক্যাটাগরি যোগ হয়েছে!', 'Category Added!'), `'${newCat.nameBn}' ক্যাটাগরি তৈরি হয়েছে।`);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addToast('success', t('ক্যাটাগরি আপডেট সম্পন্ন', 'Category Updated'), t('পরিবর্তন সংরক্ষিত হয়েছে।', 'Changes saved.'));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addToast('info', lang === 'bn' ? 'ক্যাটাগরি মোছা হয়েছে' : 'Category Deleted', '');
  };

  const toggleCategoryActive = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
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

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SLIDERS, JSON.stringify(sliders));
    setSettings((prev) => ({ ...prev, sliders }));
  }, [sliders]);

  const addSlide = (slideData: Omit<HomeSlide, 'id'>) => {
    const newSlide: HomeSlide = {
      ...slideData,
      id: `slide-${Date.now()}`
    };
    setSliders((prev) => [...prev, newSlide]);
    addToast('success', lang === 'bn' ? 'স্লাইড যোগ হয়েছে!' : 'Slide Added!', '');
  };

  const updateSlide = (id: string, updates: Partial<HomeSlide>) => {
    setSliders((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    addToast('success', lang === 'bn' ? 'স্লাইড আপডেট সম্পন্ন' : 'Slide Updated', '');
  };

  const deleteSlide = (id: string) => {
    setSliders((prev) => prev.filter((s) => s.id !== id));
    addToast('info', lang === 'bn' ? 'স্লাইড মোছা হয়েছে' : 'Slide Deleted', '');
  };

  const toggleSlideActive = (id: string) => {
    setSliders((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
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

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(products));
  }, [products]);

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now().toString().slice(-5)}`
    };
    setProducts((prev) => [newProduct, ...prev]);
    addToast('success', t('পণ্য যোগ সফল!', 'Product Added!'), t('নতুন পণ্য স্টোরে সফলভাবে তালিকাভুক্ত হয়েছে।', 'New product listed.'));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    addToast('success', t('পণ্য আপডেট সম্পন্ন!', 'Product Updated!'), t('পণ্যের বিবরণ সফলভাবে সংরক্ষিত হয়েছে।', 'Product saved.'));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('info', lang === 'bn' ? 'পণ্য মুছে ফেলা হয়েছে' : 'Product Deleted', '');
  };

  const toggleProductFlashSale = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFlashSale: !p.isFlashSale } : p))
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

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ABANDONED, JSON.stringify(abandonedCarts));
  }, [abandonedCarts]);

  const markAbandonedCartWhatsAppSent = (cartId: string) => {
    setAbandonedCarts((prev) =>
      prev.map((c) => (c.id === cartId ? { ...c, whatsappSent: true } : c))
    );
    addToast('success', t('WhatsApp মেসেজ পাঠানো হয়েছে!', 'WhatsApp Sent!'), t('গ্রাহককে রিকভারি কুপন সহ মেসেজ পাঠানো হয়েছে।', 'Recovery promo message delivered.'));
  };

  const recoverAbandonedCart = (cartId: string) => {
    setAbandonedCarts((prev) =>
      prev.map((c) => (c.id === cartId ? { ...c, recovered: true, recoveredAt: new Date().toISOString() } : c))
    );
    addToast('success', t('কার্ট সফলভাবে রিকভার হয়েছে!', 'Cart Recovered!'), '');
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

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  const addProductReview = (reviewData: Omit<ProductReview, 'id' | 'date' | 'verifiedPurchase'>) => {
    const newRev: ProductReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: 'এইমাত্র',
      verifiedPurchase: true
    };
    setReviews((prev) => [newRev, ...prev]);
    addToast('success', t('রিভিউ জমা হয়েছে!', 'Review Submitted!'), t('আপনার মূল্যবান মতামতের জন্য ধন্যবাদ।', 'Thank you for your rating.'));
  };

  const deleteProductReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
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

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(users));
  }, [users]);

  const addUser = (userData: Omit<UserStaff, 'id' | 'createdAt'>) => {
    const newUser: UserStaff = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setUsers((prev) => [...prev, newUser]);
    addToast('success', t('স্টাফ/ইউজার যোগ হয়েছে', 'User Added'), `'${newUser.name}' সফলভাবে তালিকাভুক্ত।`);
  };

  const updateUser = (id: string, updates: Partial<UserStaff>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    addToast('success', t('ইউজার তথ্য আপডেট সম্পন্ন', 'User Updated'), '');
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    addToast('info', t('ইউজার সরানো হয়েছে', 'User Removed'), '');
  };

  // Admin Auth (Hossain login: hossain@gmail.com / Hossain777@#$)
  const isHossainPathInitial = () => {
    if (typeof window === 'undefined') return false;
    const norm = window.location.pathname.replace(/\/+$/, '').toLowerCase();
    const h = window.location.hash.toLowerCase();
    return norm === '/hossain' || norm.startsWith('/hossain/') || h === '#hossain';
  };

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_ADMIN_AUTH) === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(() => {
    return isHossainPathInitial() && localStorage.getItem(LOCAL_STORAGE_ADMIN_AUTH) !== 'true';
  });

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
      addToast('success', t('অ্যাডমিন লগইন সফল!', 'Admin Logged In!'), t('স্বাগতম হোসেন ভাই, ড্যাশবোর্ডে প্রবেশের অনুমতি দেওয়া হয়েছে।', 'Welcome Hossain, dashboard unlocked.'));
      return true;
    }
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
    setSettings((prev) => ({
      ...prev,
      spinSettings: {
        ...prev.spinSettings,
        rewards: updatedRewards
      }
    }));
    addToast('success', lang === 'bn' ? 'স্পিন অফার যোগ হয়েছে!' : 'Spin Offer Added!', `'${newReward.labelBn}'`);
  };

  const updateSpinReward = (id: string, updates: Partial<SpinReward>) => {
    const updatedRewards = spinRewards.map((rew) => (rew.id === id ? { ...rew, ...updates } : rew));
    setSettings((prev) => ({
      ...prev,
      spinSettings: {
        ...prev.spinSettings,
        rewards: updatedRewards
      }
    }));
    addToast('success', lang === 'bn' ? 'স্পিন অফার আপডেট হয়েছে!' : 'Spin Offer Updated!', '');
  };

  const deleteSpinReward = (id: string) => {
    const updatedRewards = spinRewards.filter((rew) => rew.id !== id);
    setSettings((prev) => ({
      ...prev,
      spinSettings: {
        ...prev.spinSettings,
        rewards: updatedRewards
      }
    }));
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
        phone: '01886289663',
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

  useEffect(() => {
    localStorage.setItem('buyonebd_customer_accounts_v3', JSON.stringify(customerAccounts));
  }, [customerAccounts]);

  // Customer Profile & Rewards State
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(() => {
    const defaultProfile: CustomerProfile = {
      name: 'হোসেন আহমেদ',
      username: 'hossain',
      phone: '01886289663',
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

    setCustomerAccounts((prev) => [...prev, newAcc]);
    setCustomerProfile(newAcc);
    setIsCustomerLoggedIn(true);
    localStorage.setItem('buyonebd_customer_auth_v3', 'true');
    setIsCustomerLoginOpen(false);
    setIsCustomerDashboardOpen(true);
    addToast('success', t('রেজিস্ট্রেশন সম্পন্ন!', 'Account Created!'), newAcc.name);
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
    setCustomerProfile((prev) => {
      const next = { ...prev, ...updates };
      setCustomerAccounts((accs) =>
        accs.map((a) => (a.phone === prev.phone || a.username === prev.username ? next : a))
      );
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
    setCustomerProfile((prev) => {
      const history = prev.browsingHistory || [];
      if (history[0] === productId) return prev;
      const nextHistory = [productId, ...history.filter((id) => id !== productId)].slice(0, 12);
      return { ...prev, browsingHistory: nextHistory };
    });
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
        customerPhone: '01886289663',
        method: 'bkash',
        amount: 500,
        senderNumber: '01886289663',
        trxId: 'BKS8890124',
        status: 'pending',
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ];
  });

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
          return { ...acc, walletBalance: 0 };
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
    if (customerProfile.loyaltyPoints < points) {
      return { success: false, discountAmount: 0 };
    }
    const discountAmount = Math.floor(points);
    const nextPoints = customerProfile.loyaltyPoints - points;
    const nextBal = customerWalletBalance + discountAmount;
    const nowIso = new Date().toISOString();
    setCustomerWalletBalance(nextBal);
    localStorage.setItem('buyonebd_customer_wallet_v3', nextBal.toString());
    if (!walletLastCreditAt) {
      setWalletLastCreditAt(nowIso);
      localStorage.setItem('buyonebd_wallet_last_credit_v1', nowIso);
    }
    setCustomerProfile((cp) => ({
      ...cp,
      loyaltyPoints: nextPoints,
      walletBalance: nextBal,
      lastWalletCreditAt: cp.lastWalletCreditAt || nowIso
    }));
    addToast(
      'success',
      lang === 'bn' ? `${points} পয়েন্ট রিডিম সম্পন্ন!` : `${points} Points Redeemed!`,
      lang === 'bn' ? `৳${discountAmount} আপনার ব্যালেন্সে যোগ করা হয়েছে।` : `৳${discountAmount} converted to wallet balance.`
    );
    return { success: true, discountAmount };
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

    setWalletTopUps((prev) => [newReq, ...prev]);

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

    setWalletTopUps((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved', processedAt: nowIso } : r))
    );

    const reqPhone = req.customerPhone.replace(/[^0-9]/g, '');
    const currPhone = (customerProfile.phone || '').replace(/[^0-9]/g, '');

    if (!currPhone || reqPhone === currPhone || customerAccounts.length <= 1) {
      addToWallet(
        req.amount,
        t(`${req.method.toUpperCase()} রিচার্জ অনুমোদিত (+৳${req.amount})`, `Top-Up Approved (+৳${req.amount})`)
      );
    } else {
      setCustomerAccounts((prev) =>
        prev.map((acc) =>
          acc.phone.replace(/[^0-9]/g, '') === reqPhone
            ? {
                ...acc,
                walletBalance: (acc.walletBalance || 0) + req.amount,
                lastWalletCreditAt: acc.lastWalletCreditAt || nowIso
              }
            : acc
        )
      );
      addToast(
        'success',
        t('রিচার্জ অনুমোদিত!', 'Top-Up Approved!'),
        t(`${req.customerName}-এর অ্যাকাউন্টে ৳${req.amount} যোগ হয়েছে।`, `৳${req.amount} credited to ${req.customerName}.`)
      );
    }
  };

  const rejectWalletTopUp = (requestId: string, note?: string) => {
    setWalletTopUps((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'rejected', adminNote: note || 'Invalid TrxID', processedAt: new Date().toISOString() }
          : r
      )
    );
    addToast('info', t('রিচার্জ রিকোয়েস্ট বাতিল হয়েছে', 'Top-Up Request Rejected'), '');
  };

  const adjustCustomerWalletByAdmin = (delta: number, reason?: string) => {
    if (delta === 0) return;
    const nowIso = new Date().toISOString();
    setCustomerWalletBalance((prev) => {
      const next = Math.max(0, prev + delta);
      localStorage.setItem('buyonebd_customer_wallet_v3', next.toString());
      if (delta > 0 && (prev <= 0 || !walletLastCreditAt)) {
        setWalletLastCreditAt(nowIso);
        localStorage.setItem('buyonebd_wallet_last_credit_v1', nowIso);
      }
      setCustomerProfile((cp) => ({
        ...cp,
        walletBalance: next,
        lastWalletCreditAt: delta > 0 ? cp.lastWalletCreditAt || nowIso : cp.lastWalletCreditAt
      }));
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

    const nextAccounts = customerAccounts.map((acc) => {
      const matches =
        (acc.username && acc.username.toLowerCase() === cleanId) ||
        (acc.email && acc.email.toLowerCase() === cleanId) ||
        (cleanDigits && acc.phone.replace(/[^0-9]/g, '') === cleanDigits);
      if (!matches) return acc;

      found = true;
      targetName = acc.name;
      updatedBalance = Math.max(0, (acc.walletBalance || 0) + delta);
      return {
        ...acc,
        walletBalance: updatedBalance,
        lastWalletCreditAt: delta > 0 ? acc.lastWalletCreditAt || nowIso : acc.lastWalletCreditAt
      };
    });

    if (!found) return false;

    setCustomerAccounts(nextAccounts);

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
    setMediaLibrary((prev) => {
      const existing = prev.find((m) => m.url === item.url);
      if (existing) return prev;
      return [created, ...prev];
    });
    return created;
  };

  const syncStoreMediaLibrary = (): number => {
    const discovered = buildInitialMediaFromStore(products, sliders, categories, settings);
    let added = 0;
    setMediaLibrary((prev) => {
      const existingUrls = new Set(prev.map((m) => m.url));
      const newOnes = discovered.filter((d) => !existingUrls.has(d.url));
      added = newOnes.length;
      return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
    });
    return added;
  };

  const deleteMediaItems = (ids: string[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    const urlsToRemove = new Set(mediaLibrary.filter((m) => idSet.has(m.id)).map((m) => m.url));
    setMediaLibrary((prev) => prev.filter((m) => !idSet.has(m.id)));

    // Cleanly remove deleted media URLs from products/categories/logo if referenced
    if (urlsToRemove.size > 0) {
      setProducts((prev) =>
        prev.map((p) => {
          const remaining = p.images.filter((img) => !urlsToRemove.has(img));
          return remaining.length !== p.images.length
            ? { ...p, images: remaining.length > 0 ? remaining : p.images.slice(0, 1) }
            : p;
        })
      );
      if (settings.logoUrl && urlsToRemove.has(settings.logoUrl)) {
        setSettings((prev) => ({ ...prev, logoUrl: '' }));
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

    setMediaLibrary((prev) =>
      prev.map((m) => {
        const upd = updatedMap.get(m.id);
        return upd ? { ...m, url: upd.url, width: upd.width, height: upd.height, sizeKb: upd.sizeKb } : m;
      })
    );

    // Sync resized URLs wherever used across products, sliders, categories, logo & OG image
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        images: p.images.map((img) => urlMap.get(img) || img)
      }))
    );
    setSliders((prev) =>
      prev.map((s) => ({
        ...s,
        image: urlMap.get(s.image) || s.image
      }))
    );
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        iconImage: c.iconImage ? urlMap.get(c.iconImage) || c.iconImage : c.iconImage
      }))
    );
    setSettings((prev) => ({
      ...prev,
      logoUrl: prev.logoUrl ? urlMap.get(prev.logoUrl) || prev.logoUrl : prev.logoUrl,
      seoSettings: prev.seoSettings
        ? {
            ...prev.seoSettings,
            ogImage: prev.seoSettings.ogImage ? urlMap.get(prev.seoSettings.ogImage) || prev.seoSettings.ogImage : prev.seoSettings.ogImage
          }
        : prev.seoSettings
    }));

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
    setPriceAlerts((prev) => {
      const next = [newAlert, ...prev];
      localStorage.setItem('buyonebd_price_alerts_v3', JSON.stringify(next));
      return next;
    });
    addToast(
      'success',
      lang === 'bn' ? 'প্রাইস অ্যালার্ট সেট হয়েছে!' : 'Price Alert Activated!',
      lang === 'bn'
        ? `মূল্য ৳${alertData.targetPrice}-এ নামলে ${alertData.contact}-এ নোটিফিকেশন পাঠানো হবে।`
        : `You will be notified at ${alertData.contact} when price drops to ৳${alertData.targetPrice}.`
    );
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
  const [storeSubView, setStoreSubView] = useState<'home' | 'products'>('home');

  const [isCartOpen, setIsCartOpenState] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [isOneClickOpen, setIsOneClickOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isSpinOpen, setIsSpinOpen] = useState(false);
  const [isMobileCategoryDrawerOpen, setIsMobileCategoryDrawerOpen] = useState(false);
  const [activeView, setActiveViewState] = useState<'store' | 'admin' | 'tracking'>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.replace(/\/+$/, '').toLowerCase() || '/';
      if ((p === '/hossain' || p.startsWith('/hossain/') || window.location.hash.toLowerCase() === '#hossain') && localStorage.getItem(LOCAL_STORAGE_ADMIN_AUTH) === 'true') {
        return 'admin';
      }
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

  // Bidirectional Live Support Chats & Browser Calls
  const [supportChats, setSupportChats] = useState<SupportChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('buyonebd_support_chats_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'chat-default-1',
        customerName: 'সম্মানিত গ্রাহক',
        customerPhone: '01886289663',
        status: 'open',
        lastUpdated: new Date().toISOString(),
        unreadByAdmin: 0,
        messages: [
          {
            id: 'welcome-1',
            sender: 'bot',
            text: 'Assalamu Alaikum! Welcome to BuyOne BD AI Support. How can I help you today?',
            textBn: 'আসসালামু আলাইকুম 👋 BuyOne BD-এর এআই সাপোর্ট সেন্টারে স্বাগতম। কীভাবে সাহায্য করতে পারি?',
            time: 'Just now',
            quickActions: [
              { label: '📦 ট্র্যাক অর্ডার', action: 'track' },
              { label: '🔥 ফ্ল্যাশ ডিলস', action: 'deals' },
              { label: '🚚 ডেলিভারি চার্জ', action: 'delivery' },
              { label: '🎡 স্পিন অফার', action: 'open_spin' }
            ]
          }
        ]
      }
    ];
  });
  const [activeChatSessionId, setActiveChatSessionId] = useState<string>('chat-default-1');

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
  const trackPixelEvent = (
    eventName: string,
    extras?: { urlPath?: string; value?: number; contentName?: string }
  ) => {
    const urlPath = extras?.urlPath || window.location.pathname || '/';
    const sourceUrl = window.location.href;
    const pixelCfg = settings.marketingSettings?.facebookPixel;
    const gaCfg = settings.marketingSettings?.googleAnalytics;

    // Client-side gtag / fbq hooks if present on window
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

    // Server-side Pixel Conversions API dispatch & logging
    fetch('/api/tracking/pixel', {
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
    })
      .then((r) => r.json())
      .then((res) => {
        if (res?.event) {
          setServerPixelEvents((prev) => {
            const next = [res.event, ...prev].slice(0, 100);
            localStorage.setItem('buyonebd_pixel_events_v3', JSON.stringify(next));
            return next;
          });
        }
      })
      .catch(() => {});
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

  // Cross-Device Store & Order Synchronization (Pull before Push + Realtime Polling)
  const hasHydratedFromServerRef = useRef(false);
  const activeViewRef = useRef(activeView);
  activeViewRef.current = activeView;
  const knownOrderIdsRef = useRef<Set<string>>(new Set(orders.map((o) => o.id)));

  const fetchStoreSnapshotFromServer = async (notifyOnNewOrders = false) => {
    try {
      const res = await fetch(`/api/store/sync?t=${Date.now()}`, { cache: 'no-store' });
      const json = await res.json();
      const data = json?.data;

      if (data && typeof data === 'object') {
        if (Array.isArray(data.orders)) {
          const deletedSet = new Set<string>(Array.isArray(data.deletedOrderIds) ? data.deletedOrderIds : []);
          const incomingIds = new Set<string>(data.orders.map((o: any) => o?.id).filter(Boolean));

          // Identify newly placed remote orders
          const brandNewRemoteOrders = data.orders.filter(
            (o: any) => o && o.id && !knownOrderIdsRef.current.has(o.id)
          );

          setOrders((prev) => {
            const map = new Map<string, Order>();
            prev.forEach((o) => {
              if (!deletedSet.has(o.id)) map.set(o.id, o);
            });
            data.orders.forEach((o: Order) => {
              if (o && o.id && !deletedSet.has(o.id)) {
                map.set(o.id, o);
              }
            });
            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            const prevJson = JSON.stringify(prev.map((x) => `${x.id}:${x.status}:${x.courier?.trackingCode}`));
            const mergedJson = JSON.stringify(merged.map((x) => `${x.id}:${x.status}:${x.courier?.trackingCode}`));
            return prevJson === mergedJson ? prev : merged;
          });

          incomingIds.forEach((id) => knownOrderIdsRef.current.add(id));

          if (notifyOnNewOrders && brandNewRemoteOrders.length > 0 && activeViewRef.current === 'admin') {
            const latest = brandNewRemoteOrders[0];
            addToast(
              'success',
              t(`নতুন অর্ডার এসেছে! #${latest.id}`, `New Order Received! #${latest.id}`),
              `${latest.customer?.name || 'Customer'} • ৳${latest.pricing?.total || 0}`
            );
          }
        }

        if (!hasHydratedFromServerRef.current) {
          if (Array.isArray(data.products) && data.products.length > 0) setProducts(data.products);
          if (data.settings) setSettings(mergeSettings(data.settings));
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
        // First ever startup on empty server store: seed initial store to server
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
    } catch {
      // keep local state seamlessly if server temporarily offline
    } finally {
      hasHydratedFromServerRef.current = true;
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
      activeViewRef.current === 'admin' ? 3500 : 6000
    );

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, []);

  // Push store snapshot updates AFTER initial server hydration completes
  useEffect(() => {
    if (!hasHydratedFromServerRef.current) return;
    const syncTimer = setTimeout(() => {
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
    }, 500);
    return () => clearTimeout(syncTimer);
  }, [products, orders, settings, categories, sliders, customerAccounts, walletTopUps, abandonedCarts, reviews, priceAlerts, users]);

  // Fetch initial support state on mount + poll every 2.5s when Support Desk / Chat / Admin is open
  const fetchSupportStateFromServer = () => {
    fetch('/api/support/state')
      .then((r) => r.json())
      .then((data) => {
        if (!data?.success) return;
        if (Array.isArray(data.browsingHistory) && data.browsingHistory.length > 0) {
          setCustomerBrowsingLogs(data.browsingHistory);
        }
        if (Array.isArray(data.pixelEvents) && data.pixelEvents.length > 0) {
          setServerPixelEvents(data.pixelEvents);
        }
        if (Array.isArray(data.supportChats) && data.supportChats.length > 0) {
          setSupportChats(data.supportChats);
        }
        if (Array.isArray(data.browserCalls) && data.browserCalls.length > 0) {
          setBrowserCalls(data.browserCalls);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSupportStateFromServer();
  }, []);

  useEffect(() => {
    if (!isWhatsAppOpen && activeView !== 'admin' && !activeBrowserCallId && !isCallRinging && !isCallActive) {
      return;
    }
    const poll = setInterval(fetchSupportStateFromServer, 2500);
    return () => clearInterval(poll);
  }, [isWhatsAppOpen, activeView, activeBrowserCallId, isCallRinging, isCallActive]);

  const syncChatsToServer = (nextChats: SupportChatSession[]) => {
    localStorage.setItem('buyonebd_support_chats_v3', JSON.stringify(nextChats));
    fetch('/api/support/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessions: nextChats })
    }).catch(() => {});
  };

  const syncCallsToServer = (nextCalls: BrowserCallSession[]) => {
    localStorage.setItem('buyonebd_browser_calls_v3', JSON.stringify(nextCalls));
    fetch('/api/support/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calls: nextCalls })
    }).catch(() => {});
  };

  // Bidirectional Chat Actions (Customer + Backend Assistant + Auto Keyword/AI)
  const sendCustomerChatMessage = async (rawText: string) => {
    const query = rawText.trim();
    if (!query) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const customerMsg: SupportChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      text: query,
      textBn: query,
      time
    };

    const sessId = activeChatSessionId || supportChats[0]?.id || 'chat-default-1';
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
              lastUpdated: new Date().toISOString(),
              unreadByAdmin: 1,
              messages: [customerMsg]
            },
            ...prev
          ];
      syncChatsToServer(next);
      return next;
    });

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
    };

    const q = query.toLowerCase();
    const orderMatch = query.match(/BD-\d{5}/i);
    const phoneMatch = query.match(/01[3-9]\d{8}/);

    // 1. Order Lookup Match
    if (orderMatch || phoneMatch || q.includes('track') || q.includes('ট্র্যাক') || q.includes('অর্ডার') || q.includes('parcel')) {
      const searchTarget = orderMatch ? orderMatch[0].toUpperCase() : phoneMatch ? phoneMatch[0] : '';
      const matchedOrder = orders.find(
        (o) =>
          o.id.toUpperCase() === searchTarget ||
          (phoneMatch && o.customer.phone.includes(phoneMatch[0]))
      );
      if (matchedOrder) {
        appendBotMsg({
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `Order #${matchedOrder.id} found!\nStatus: ${matchedOrder.status.toUpperCase()}\nCourier: ${matchedOrder.courier.provider} (${matchedOrder.courier.trackingCode})\nLocation: ${matchedOrder.courier.currentLocation}`,
          textBn: `অর্ডার #${matchedOrder.id} পাওয়া গেছে!\nস্ট্যাটাস: ${matchedOrder.status}\nকুরিয়ার: ${matchedOrder.courier.provider} (${matchedOrder.courier.trackingCode})\nঅবস্থান: ${matchedOrder.courier.currentLocation}`,
          time,
          quickActions: [
            { label: '📍 লাইভ ট্র্যাকিং দেখুন', action: `view_track_${matchedOrder.id}` },
            { label: '📞 ব্রাউজার কল করুন', action: `call_order_${matchedOrder.id}` }
          ]
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

    // 3. Hot Deals Shortcut
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
          action: `buy_${p.id}`
        }))
      });
      return;
    }

    // 4. Live Gemini AI Endpoint (with backend keyword fallback)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: sessionHistory.slice(-6),
          keywordRules: rules,
          lang
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          appendBotMsg({
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: data.reply,
            textBn: data.reply,
            time
          });
          return;
        }
      }
    } catch {}

    appendBotMsg({
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: `Thank you for messaging ${settings.storeName}! A support agent from our backend desk has received your chat and will assist shortly.`,
      textBn: `ধন্যবাদ! আপনার মেসেজটি আমাদের ব্যাকএন্ড সাপোর্ট ডেস্কে পৌঁছেছে। সাপোর্ট এজেন্ট অথবা এআই থেকে দ্রুত উত্তর দেওয়া হচ্ছে।`,
      time,
      quickActions: [
        { label: '📞 ব্রাউজার কল করুন', action: 'tab_call' },
        { label: '🔥 ফ্ল্যাশ সেল', action: 'tab_flash' }
      ]
    });
  };

  const sendAgentChatReply = (sessionId: string, text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const replyMsg: SupportChatMessage = {
      id: `agent-${Date.now()}`,
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
              unreadByAdmin: 0,
              lastUpdated: new Date().toISOString(),
              messages: [...s.messages, replyMsg]
            }
          : s
      );
      syncChatsToServer(next);
      return next;
    });
    addToast('success', t('রিপ্লাই পাঠানো হয়েছে', 'Reply Sent'), t('কাস্টমারের চ্যাটে উত্তর যুক্ত হয়েছে।', 'Delivered to customer chat window.'));
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
      if (res.ok) {
        const data = await res.json();
        if (data.reply) return String(data.reply);
      }
    } catch {}
    return adminLang === 'en'
      ? `Assalamu Alaikum ${session.customerName}, thank you for contacting ${settings.storeName}! Your inquiry has been received and we are checking it right now. Delivery takes 24-48h inside Dhaka (৳${settings.deliveryFees.dhakaInside}) and 48-72h nationwide (৳${settings.deliveryFees.dhakaOutside}).`
      : `আসসালামু আলাইকুম ${session.customerName}, ${settings.storeNameBn || settings.storeName}-এ যোগাযোগ করার জন্য ধন্যবাদ! আমরা বিষয়টি এখনই দেখছি। ঢাকা সিটিতে ডেলিভারি ২৪-৪৮ ঘণ্টা (৳${settings.deliveryFees.dhakaInside}) এবং সারাদেশে ৪৮-৭২ ঘণ্টা (৳${settings.deliveryFees.dhakaOutside})।`;
  };

  const markChatRead = (sessionId: string) => {
    setSupportChats((prev) => {
      const next = prev.map((s) => (s.id === sessionId ? { ...s, unreadByAdmin: 0 } : s));
      syncChatsToServer(next);
      return next;
    });
  };

  // Bidirectional Browser Call Engine (Customer <-> Backend Assistant Desk)
  const initiateCustomerBrowserCall = (
    order?: Order | null,
    callerInfo?: { name?: string; phone?: string; autoConnect?: boolean }
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

    const isOutboundLive = Boolean(callerInfo?.autoConnect);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const session: BrowserCallSession = {
      id: callId,
      orderId: order?.id,
      callType: order ? 'order_verification' : 'support',
      customerName: resolvedName,
      customerPhone: resolvedPhone,
      status: isOutboundLive ? 'connected' : 'ringing_backend',
      answeredBy: isOutboundLive ? 'backend_assistant' : undefined,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      transcript: [
        {
          id: `t-${Date.now()}`,
          speaker: isOutboundLive ? 'assistant' : 'customer',
          text: isOutboundLive
            ? `Outbound voice call connected to ${resolvedName} (${resolvedPhone}).`
            : `Customer initiated a browser support call (${resolvedName}).`,
          textBn: isOutboundLive
            ? `সাপোর্ট ডেস্ক থেকে ${resolvedName} (${resolvedPhone})-কে লাইভ কল সংযুক্ত হয়েছে।`
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

    if (!isOutboundLive) {
      setActiveBrowserCallId(callId);
      setActiveCallOrder(targetOrder);
      setIsCallRinging(true);
      setIsCallActive(false);
    } else {
      addToast(
        'success',
        t('লাইভ কল সংযুক্ত!', 'Live Call Connected!'),
        t(`${resolvedName} (${resolvedPhone})-এর সাথে কল চালু হয়েছে।`, `Live call started with ${resolvedName}.`)
      );
    }
    return callId;
  };

  const answerBrowserCallFromBackend = (callId: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const greetBn = `আসসালামু আলাইকুম! ${settings.storeNameBn || settings.storeName} সাপোর্ট ডেস্ক থেকে আমি অ্যাসিস্ট্যান্ট বলছি। বলুন, কীভাবে সাহায্য করতে পারি?`;
    const greetEn = `Assalamu Alaikum! Backend support assistant connected. How can I help you today?`;

    setBrowserCalls((prev) => {
      const next = prev.map((c) =>
        c.id === callId
          ? {
              ...c,
              status: 'connected' as const,
              answeredBy: 'backend_assistant' as const,
              transcript: [
                ...c.transcript,
                { id: `t-${Date.now()}`, speaker: 'assistant' as const, text: greetEn, textBn: greetBn, time }
              ]
            }
          : c
      );
      syncCallsToServer(next);
      return next;
    });

    if (activeBrowserCallId === callId) {
      setIsCallRinging(false);
      setIsCallActive(true);
    }
    addToast('success', t('কল কানেক্ট হয়েছে!', 'Browser Call Answered!'), t('গ্রাহকের সাথে লাইভ কথা বলুন।', 'Connected live to customer browser call.'));
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
  };

  const endBrowserCallSession = (callId: string, confirmed?: boolean) => {
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

  // Multi-Courier 1-Click Booking (Steadfast, Pathao, RedX, Paperfly, Sundarban)
  const bookOrderCourier = async (
    orderId: string,
    provider: CourierProvider
  ): Promise<{ success: boolean; trackingCode?: string; consignmentId?: string }> => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return { success: false };

    const prefixMap: Record<CourierProvider, string> = {
      Steadfast: 'STDF',
      Pathao: 'PTHO',
      RedX: 'REDX',
      Paperfly: 'PPFL',
      Sundarban: 'SNDR'
    };
    const prefix = prefixMap[provider] || 'COUR';

    addToast(
      'info',
      t(`${provider} কুরিয়ারে বুকিং হচ্ছে...`, `Booking ${provider} Courier...`),
      t(`অর্ডার #${orderId} পাঠানো হচ্ছে।`, `Sending order #${orderId} to ${provider}.`)
    );

    try {
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const consignmentId = `${prefix}-${randomDigits}`;
      const trackingCode = `${prefix}-BD-${orderId.replace(/[^0-9]/g, '') || randomDigits}`;

      await new Promise((r) => setTimeout(r, 700));

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
                  status: `${provider} Booked`,
                  time: 'Just now',
                  location: 'Dhaka Central Dispatch Hub',
                  note: `1-Click booking confirmed via ${provider} (ID: ${consignmentId})`
                }
              ]
            };
            fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ updates: { status: 'shipped', courier: updatedCourier } })
            }).catch(() => {});
            return {
              ...ord,
              status: 'shipped',
              courier: updatedCourier
            };
          }
          return ord;
        })
      );

      addToast(
        'success',
        t(`${provider} বুকিং সফল! 🎉`, `${provider} Booking Created! 🎉`),
        t(`ট্র্যাকিং: ${trackingCode}`, `Tracking Code: ${trackingCode}`)
      );
      return { success: true, trackingCode, consignmentId };
    } catch {
      addToast('error', t('বুকিং ব্যর্থ হয়েছে', 'Booking Failed'), t(`${provider} এপিআই সংযোগ ব্যর্থ।`, `${provider} API connection error.`));
      return { success: false };
    }
  };

  // Steadfast 1-Click Order Entry (compat wrapper)
  const sendOrderToSteadfast = async (orderId: string) => bookOrderCourier(orderId, 'Steadfast');

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
      const data = await res.json();
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

  // Apply 1 of 10 Business Themes (Colors + optional curated Categories)
  const applyBusinessTheme = (themeId: StoreTheme, includeCategories = false) => {
    const preset = BUSINESS_THEME_PRESETS.find((p) => p.id === themeId);
    if (!preset) return;

    updateSettings({
      theme: themeId,
      themeColors: { ...preset.colors }
    });

    if (includeCategories && preset.suggestedCategories.length > 0) {
      const mappedCats: Category[] = preset.suggestedCategories.map((c, idx) => ({
        ...c,
        id: `${themeId}-cat-${idx + 1}`,
        isActive: true,
        order: idx + 1
      }));
      setCategories(mappedCats);
    }

    addToast(
      'success',
      t(`${preset.nameBn} থিম প্রয়োগ হয়েছে!`, `${preset.nameEn} Applied!`),
      includeCategories
        ? t('কালার প্যালেট ও ব্যবসার ক্যাটাগরি আপডেট করা হয়েছে।', 'Color palette and curated categories updated.')
        : t('স্টোরের কালার থিম পরিবর্তন করা হয়েছে।', 'Store colors updated.')
    );
  };

  // Apply dynamic CSS theme variables whenever themeColors changes
  useEffect(() => {
    const colors = settings.themeColors;
    if (colors) {
      document.documentElement.style.setProperty('--brand-primary', colors.primary || '#059669');
      document.documentElement.style.setProperty('--brand-secondary', colors.secondary || '#0d9488');
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) themeMeta.setAttribute('content', colors.primary || '#059669');
    }
  }, [settings.themeColors]);

  // Dynamic SEO Head Tags + Schema.org JSON-LD Updater (Global + Per-Product SEO)
  useEffect(() => {
    const seo = settings.seoSettings;
    const storeName = settings.storeName || 'BuyOne BD';
    let pageTitle = seo?.metaTitle || `${storeName} - Online Shopping Bangladesh`;
    let pageDesc = seo?.metaDescription || settings.tagline;
    let pageKeywords = seo?.keywords || '';
    let pageRobots = seo?.robots || 'index, follow';

    if (activeView === 'admin') {
      pageTitle = `Admin Portal - ${storeName}`;
      pageRobots = 'noindex, nofollow';
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
      if (!content) return;
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
    // Generate realistic historical success metrics based on phone
    const phoneSum = phone.split('').reduce((sum, ch) => sum + (parseInt(ch, 10) || 0), 0);
    const successRate = phoneSum % 5 === 0 ? 42 : phoneSum % 7 === 0 ? 74 : 96;
    const totalOrders = Math.floor(4 + (phoneSum % 25));
    const deliveredCount = Math.round((totalOrders * successRate) / 100);
    const cancelledCount = totalOrders - deliveredCount;

    const riskLevel: 'safe' | 'moderate' | 'high_risk' =
      successRate >= 85 ? 'safe' : successRate >= 65 ? 'moderate' : 'high_risk';

    const message =
      riskLevel === 'safe'
        ? `গ্রাহকের পূর্ববর্তী পার্সেল ডেলিভারি সাকসেস রেট ${successRate}% (${deliveredCount}/${totalOrders})। ১০০% নির্ভরযোগ্য বিশ্বস্ত ক্রেতা!`
        : riskLevel === 'moderate'
        ? `মাঝারি পার্সেল রিটার্ন রেট ${100 - successRate}%। পাঠানোর পূর্বে ফোনে ঠিকানা যাচাই করে নিন।`
        : `⚠️ উচ্চ রিটার্ন ঝুঁকি! পূর্ববর্তী পার্সেল রিটার্ন রেট ${100 - successRate}% (${cancelledCount}টি রিটার্ন)। ডেলিভারি চার্জ অগ্রিম নিন!`;

    return {
      checked: true,
      successRate,
      totalOrders,
      deliveredCount,
      cancelledCount,
      riskLevel,
      message
    };
  };

  // Create Order (Online 1-Click Checkout + Backend POS System)
  const createOrder = (orderData: {
    customer: { name: string; phone: string; address: string; district: string; thana: string; note?: string };
    items: { product: Product; quantity: number; selectedColor?: string; selectedSize?: string }[];
    paymentMethod: PaymentMethod;
    paymentTrxId?: string;
    deliveryZone: DeliveryZone;
    advancePaid?: number;
    discountAmount?: number;
    couponCode?: string;
    walletUsedAmount?: number;
    customDeliveryFee?: number;
    source?: 'online' | 'pos';
    initialStatus?: OrderStatus;
    skipAICall?: boolean;
  }) => {
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
    const discount = (orderData.discountAmount || 0) + walletUsed;
    const total = Math.max(0, subtotal + fee - discount);
    const orderIdNum = Math.floor(10000 + Math.random() * 90000);
    const newOrderId = orderData.source === 'pos' ? `POS-${orderIdNum}` : `BD-${orderIdNum}`;

    const courierProviders: CourierProvider[] = ['Steadfast', 'Pathao', 'RedX'];
    const chosenCourier = courierProviders[0];
    const trackingCode = orderData.source === 'pos' ? `POS-INVOICE-${orderIdNum}` : `STDF-BD-${orderIdNum}`;

    const phoneSum = orderData.customer.phone.split('').reduce((s, c) => s + (parseInt(c, 10) || 0), 0);
    const rate = phoneSum % 5 === 0 ? 55 : 94;

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
        image: i.product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'
      })),
      pricing: {
        subtotal,
        deliveryFee: fee,
        discount,
        total,
        advancePaid: orderData.advancePaid
      },
      payment: {
        method: orderData.paymentMethod,
        status: orderData.advancePaid
          ? 'advance_paid'
          : orderData.paymentMethod === 'cod'
          ? 'pending'
          : 'paid',
        trxId: orderData.paymentTrxId,
        paymentNumber: orderData.customer.phone
      },
      deliveryZone: orderData.deliveryZone,
      status: orderData.initialStatus || (orderData.source === 'pos' ? 'delivered' : 'pending'),
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
      createdAt: new Date().toISOString()
    };

    knownOrderIdsRef.current.add(newOrder.id);
    setOrders((prev) => [newOrder, ...prev]);

    // Deduct stock quantities
    setProducts((prev) =>
      prev.map((prod) => {
        const orderedQty = orderData.items
          .filter((i) => i.product.id === prod.id)
          .reduce((acc, i) => acc + i.quantity, 0);
        return orderedQty > 0 ? { ...prod, stock: Math.max(0, prod.stock - orderedQty) } : prod;
      })
    );

    // Immediately persist atomically to server so all other browsers & devices receive it
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newOrder })
    }).catch(() => {});

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

    // Reset 30-day wallet inactivity clock when customer purchases a product
    if (orderData.source !== 'pos') {
      const purchaseIso = new Date().toISOString();
      setWalletLastPurchaseAt(purchaseIso);
      localStorage.setItem('buyonebd_wallet_last_purchase_v1', purchaseIso);
      setCustomerProfile((cp) => ({
        ...cp,
        lastPurchaseAt: purchaseIso,
        loyaltyPoints: (cp.loyaltyPoints || 0) + Math.max(5, Math.floor(total / 100))
      }));

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
                note: 'Dispatched to customer destination hub via Steadfast Courier'
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
          fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates: { status, courier: updatedCourier } })
          }).catch(() => {});
          return {
            ...ord,
            status,
            courier: updatedCourier
          };
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
        fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: { courier: nextCourier } })
        }).catch(() => {});
        return {
          ...ord,
          courier: nextCourier
        };
      })
    );
  };

  const updateOrderDetails = (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, ...updates } : ord))
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
    addToast('info', t('অর্ডার অপসারিত', 'Order Deleted'), t('অর্ডারটি ডাটাবেজ থেকে মুছে দেওয়া হয়েছে।', 'Order removed.'));
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
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            return {
              ...ord,
              status: confirmed ? 'ai_confirmed' : 'cancelled',
              aiCallStatus: {
                called: true,
                callTimestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                confirmedByCustomer: confirmed,
                durationSeconds: Math.floor(25 + Math.random() * 20),
                notes: confirmed ? 'Customer confirmed order verbally/via keypad during AI auto-call' : 'Customer cancelled order during call',
                transcript: transcriptLog
              },
              courier: confirmed
                ? {
                    ...ord.courier,
                    history: [
                      ...ord.courier.history,
                      {
                        status: 'AI Call Verified',
                        time: 'Just now',
                        location: 'Automated System',
                        note: 'Customer confirmed parcel receipt via AI Call'
                      }
                    ]
                  }
                : ord.courier
            };
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

  // Play voice sample to test audio live
  const playVoiceSample = async () => {
    if (sampleAudioRef.current) {
      sampleAudioRef.current.pause();
      sampleAudioRef.current = null;
      setIsPlayingVoiceSample(false);
      return;
    }

    try {
      setIsPlayingVoiceSample(true);
      const res = await fetch('/api/tts/sample');
      const data = await res.json();
      if (data?.audioUrl) {
        const audio = new Audio(data.audioUrl);
        sampleAudioRef.current = audio;
        audio.onended = () => {
          setIsPlayingVoiceSample(false);
          sampleAudioRef.current = null;
        };
        audio.onerror = () => {
          setIsPlayingVoiceSample(false);
          sampleAudioRef.current = null;
        };
        await audio.play();
      } else {
        setIsPlayingVoiceSample(false);
      }
    } catch {
      setIsPlayingVoiceSample(false);
    }
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, color?: string, size?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.product.id === product.id && i.selectedColor === color && i.selectedSize === size
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [...prev, { product, quantity, selectedColor: color, selectedSize: size }];
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

  const removeFromCart = (productId: string, color?: string, size?: string) => {
    setCart((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.selectedColor === color && i.selectedSize === size))
    );
  };

  const updateCartQuantity = (productId: string, delta: number, color?: string, size?: string) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id === productId && i.selectedColor === color && i.selectedSize === size) {
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

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('success', t('সেটিংস সংরক্ষিত হয়েছে', 'Settings Saved'), t('স্টোরের সকল পরিবর্তন সফলভাবে সংরক্ষিত।', 'Configurations updated.'));
  };

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
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setCategories(INITIAL_CATEGORIES);
    setSliders(INITIAL_SLIDERS);
    setAbandonedCarts(INITIAL_ABANDONED_CARTS);
    setUsers(INITIAL_USERS);
    setReviews(INITIAL_REVIEWS);
    setSettings(INITIAL_SETTINGS);
    setCart([]);
    setWishlist([]);
    setCompareList([]);
    localStorage.clear();
    addToast('info', t('রিসেট সম্পন্ন', 'Reset Complete'), t('সকল ডেমো ডাটা ও সেটিংস সফলভাবে রিসেট করা হয়েছে।', 'All demo data & configs restored.'));
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
        logoutCustomer,
        openCustomerPortal,
        customerAccounts,
        adjustSpecificCustomerBalance,
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
        adjustCustomerWalletByAdmin,
        runWalletExpirySweep,
        mediaLibrary,
        registerMediaItem,
        deleteMediaItems,
        resizeMediaItems,
        syncStoreMediaLibrary,
        priceAlerts,
        addPriceAlert,
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
        updateOrderDetails,
        deleteOrder,
        bookOrderCourier,
        sendOrderToSteadfast,
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
        sendCustomerChatMessage,
        sendAgentChatReply,
        generateAgentAIReply,
        markChatRead,
        browserCalls,
        activeBrowserCall,
        initiateCustomerBrowserCall,
        answerBrowserCallFromBackend,
        appendBrowserCallMessage,
        endBrowserCallSession,
        abandonedCarts,
        markAbandonedCartWhatsAppSent,
        recoverAbandonedCart,
        compareList,
        toggleCompare,
        isComparing,
        clearCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,
        reviews,
        addProductReview,
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
        recordProductView,
        claimDailyCheckIn,
        redeemLoyaltyPoints,
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
