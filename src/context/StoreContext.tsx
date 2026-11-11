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
  PriceAlert
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
  BD_DISTRICTS
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
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderCourier: (orderId: string, updates: Partial<Order['courier']>) => void;
  updateOrderDetails: (orderId: string, updates: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;

  // Customer Wallet
  customerWalletBalance: number;
  addToWallet: (amount: number, reason?: string) => void;
  deductWallet: (amount: number) => boolean;

  // Price Alerts
  priceAlerts: PriceAlert[];
  addPriceAlert: (alertData: { productId: string; contact: string; targetPrice: number }) => void;


  // Steadfast & Courier Hub
  sendOrderToSteadfast: (orderId: string) => Promise<{ success: boolean; trackingCode?: string; consignmentId?: string }>;
  checkCustomerFraudRisk: (phone: string) => Promise<OrderFraudCheck>;

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
    spinSettings: {
      ...INITIAL_SETTINGS.spinSettings,
      ...(raw.spinSettings || {}),
      rewards: Array.isArray(raw.spinSettings?.rewards) && raw.spinSettings.rewards.length >= 2
        ? raw.spinSettings.rewards
        : INITIAL_SETTINGS.spinSettings.rewards
    },
    whatsappTemplates: { ...INITIAL_SETTINGS.whatsappTemplates, ...(raw.whatsappTemplates || {}) },
    categories: Array.isArray(raw.categories) && raw.categories.length > 0 ? raw.categories : INITIAL_CATEGORIES,
    sliders: Array.isArray(raw.sliders) && raw.sliders.length > 0 ? raw.sliders : INITIAL_SLIDERS,
    flashSale: { ...INITIAL_SETTINGS.flashSale, ...(raw.flashSale || {}) },
    courierSettings: {
      ...INITIAL_SETTINGS.courierSettings,
      ...(raw.courierSettings || {}),
      steadfast: { ...INITIAL_SETTINGS.courierSettings.steadfast, ...(raw.courierSettings?.steadfast || {}) }
    },
    marketingSettings: {
      ...INITIAL_SETTINGS.marketingSettings,
      ...(raw.marketingSettings || {}),
      facebookPixel: { ...INITIAL_SETTINGS.marketingSettings.facebookPixel, ...(raw.marketingSettings?.facebookPixel || {}) },
      googleAnalytics: { ...INITIAL_SETTINGS.marketingSettings.googleAnalytics, ...(raw.marketingSettings?.googleAnalytics || {}) },
      whatsappCRM: { ...INITIAL_SETTINGS.marketingSettings.whatsappCRM, ...(raw.marketingSettings?.whatsappCRM || {}) }
    },
    aiSettings: { ...INITIAL_SETTINGS.aiSettings, ...(raw.aiSettings || {}) },
    footerSettings: { ...INITIAL_SETTINGS.footerSettings, ...(raw.footerSettings || {}) }
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

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CATEGORIES);
      return saved ? JSON.parse(saved) : (settings.categories || INITIAL_CATEGORIES);
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

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
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
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_ADMIN_AUTH) === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const loginAdmin = (email: string, pass: string): boolean => {
    if (
      email.trim().toLowerCase() === 'hossain@gmail.com' &&
      pass === 'Hossain777@#$'
    ) {
      setIsAdminLoggedIn(true);
      localStorage.setItem(LOCAL_STORAGE_ADMIN_AUTH, 'true');
      setIsAdminLoginOpen(false);
      setActiveView('admin');
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

  const remainingSpinsToday = Math.max(0, 1 - spinStats.count);
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

  // Customer Gift Wallet Balance (earned from lucky spin & bonuses)
  const [customerWalletBalance, setCustomerWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('buyonebd_customer_wallet_v3');
      return saved ? Number(saved) : 100; // ৳100 initial welcome gift
    } catch {
      return 100;
    }
  });

  const addToWallet = (amount: number, reason?: string) => {
    setCustomerWalletBalance((prev) => {
      const next = prev + amount;
      localStorage.setItem('buyonebd_customer_wallet_v3', next.toString());
      addToast(
        'success',
        lang === 'bn' ? `৳${amount} গিফট ব্যালেন্স যোগ হয়েছে!` : `৳${amount} Added to Gift Wallet!`,
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
      return next;
    });
    return true;
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

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [isOneClickOpen, setIsOneClickOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isMobileCategoryDrawerOpen, setIsMobileCategoryDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState<'store' | 'admin' | 'tracking'>('store');
  const [trackingSearchQuery, setTrackingSearchQuery] = useState('');

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

  // Steadfast 1-Click Order Entry
  const sendOrderToSteadfast = async (orderId: string): Promise<{ success: boolean; trackingCode?: string; consignmentId?: string }> => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return { success: false };

    addToast('info', t('স্টিডফাস্টে বুকিং হচ্ছে...', 'Booking Steadfast Courier...'), t(`অর্ডার #${orderId} স্টিডফাস্ট এপিআই-এ পাঠানো হচ্ছে।`, 'Calling Steadfast API.'));

    try {
      const consignmentId = `STDF-${Math.floor(100000 + Math.random() * 900000)}`;
      const trackingCode = `STDF-BD-${orderId.replace(/[^0-9]/g, '')}`;

      // Simulate network request to Steadfast portal
      await new Promise((r) => setTimeout(r, 1000));

      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            return {
              ...ord,
              status: 'shipped',
              courier: {
                ...ord.courier,
                provider: 'Steadfast',
                consignmentId,
                trackingCode,
                status: 'in_transit',
                history: [
                  ...ord.courier.history,
                  {
                    status: 'Steadfast Booked',
                    time: 'Just now',
                    location: 'Tejgaon Central Hub',
                    note: `Consignment created with ID: ${consignmentId}`
                  }
                ]
              }
            };
          }
          return ord;
        })
      );

      addToast(
        'success',
        t('স্টিডফাস্ট বুকিং সফল! 🎉', 'Steadfast Booking Created! 🎉'),
        t(`কনসাইনমেন্ট আইডি: ${consignmentId}। ট্র্যাকিং কোড: ${trackingCode}`, `Consignment: ${consignmentId}`)
      );
      return { success: true, trackingCode, consignmentId };
    } catch {
      addToast('error', t('বুকিং ব্যর্থ হয়েছে', 'Booking Failed'), t('স্টিডফাস্ট এপিআই রেসপন্স করেনি।', 'Courier API failure.'));
      return { success: false };
    }
  };

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

  // Create Order
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
  }) => {
    const subtotal = orderData.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const fee =
      orderData.deliveryZone === 'dhaka_inside'
        ? settings.deliveryFees.dhakaInside
        : orderData.deliveryZone === 'dhaka_sub'
        ? settings.deliveryFees.dhakaSub
        : settings.deliveryFees.dhakaOutside;

    const walletUsed = orderData.walletUsedAmount || 0;
    if (walletUsed > 0) {
      deductWallet(walletUsed);
    }
    const discount = (orderData.discountAmount || 0) + walletUsed;
    const total = Math.max(0, subtotal + fee - discount);
    const orderIdNum = Math.floor(10000 + Math.random() * 90000);
    const newOrderId = `BD-${orderIdNum}`;

    const courierProviders: CourierProvider[] = ['Steadfast', 'Pathao', 'RedX'];
    const chosenCourier = courierProviders[0]; // Prefer Steadfast
    const trackingCode = `STDF-BD-${orderIdNum}`;

    // Auto calculate fraud risk
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
        status: orderData.advancePaid ? 'advance_paid' : orderData.paymentMethod === 'cod' ? 'pending' : 'paid',
        trxId: orderData.paymentTrxId,
        paymentNumber: orderData.customer.phone
      },
      deliveryZone: orderData.deliveryZone,
      status: 'pending',
      aiCallStatus: {
        called: false
      },
      courier: {
        provider: chosenCourier,
        trackingCode,
        status: 'booked',
        currentLocation: 'BuyOne Central Warehouse, Tejgaon, Dhaka',
        estimatedDelivery: orderData.deliveryZone === 'dhaka_inside' ? '24 Hours' : '48-72 Hours',
        history: [
          {
            status: 'Order Placed',
            time: 'Just now',
            location: 'Online Store',
            note: 'Order successfully created via 1-Click Express Checkout'
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
      createdAt: new Date().toISOString()
    };

    setOrders((prev) => [newOrder, ...prev]);

    // If cart was checked out, clear cart
    if (!checkoutProduct) {
      clearCart();
    }

    addToast(
      'success',
      t('অর্ডার সফল হয়েছে! ৳ ' + total, 'Order Placed! ৳ ' + total),
      t(`অর্ডার আইডি: ${newOrderId}। কিছুক্ষণের মধ্যে এআই কল আসবে।`, `Order ID: ${newOrderId}. AI auto-confirmation call is initiating.`)
    );

    // Auto trigger AI Call if enabled in store settings
    if (settings.aiCallSettings.autoCallOnOrder) {
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
            updatedCourier.history.push({
              status: 'In Transit',
              time: 'Just now',
              location: 'Hub Dispatched',
              note: 'Dispatched to customer destination hub via Steadfast Courier'
            });
          } else if (status === 'delivered') {
            updatedCourier.status = 'delivered';
            updatedCourier.history.push({
              status: 'Delivered',
              time: 'Just now',
              location: ord.customer.address,
              note: 'Customer successfully received parcel and paid full COD'
            });
          }
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
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              courier: {
                ...ord.courier,
                ...updates
              }
            }
          : ord
      )
    );
  };

  const updateOrderDetails = (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, ...updates } : ord))
    );
    addToast('success', t('অর্ডার তথ্য সংরক্ষিত', 'Order Saved'), t(`অর্ডার #${orderId} এর তথ্য আপডেট করা হয়েছে।`, `Order #${orderId} updated.`));
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
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
  };

  const closeOneClickCheckout = () => {
    setIsOneClickOpen(false);
    setCheckoutProduct(null);
  };

  return (
    <StoreContext.Provider
      value={{
        lang,
        setLang,
        adminLang,
        setAdminLang,
        t,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductFlashSale,
        customerWalletBalance,
        addToWallet,
        deductWallet,
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
        sendOrderToSteadfast,
        checkCustomerFraudRisk,
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
        isMobileCategoryDrawerOpen,
        setIsMobileCategoryDrawerOpen,
        activeView,
        setActiveView,
        trackingSearchQuery,
        setTrackingSearchQuery,
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
