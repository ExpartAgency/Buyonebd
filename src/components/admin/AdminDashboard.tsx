import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Bot,
  Settings,
  Plus,
  Search,
  PhoneCall,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Trash2,
  Edit,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Eye,
  Gift,
  Grid,
  Users,
  Share2,
  BarChart3,
  Flame,
  Image as ImageIcon,
  ShieldCheck,
  Send,
  AlertTriangle,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Check,
  Percent,
  Sliders,
  Copy,
  PhoneForwarded,
  Radio,
  Upload,
  Download,
  Globe,
  Palette,
  Facebook,
  Instagram,
  Youtube,
  ImagePlus,
  CheckCheck,
  PlusCircle,
  Headphones,
  PhoneIncoming,
  PhoneOff,
  Activity,
  History,
  FileText,
  Wand2,
  Mic,
  Volume2,
  VolumeX,
  PhoneOutgoing,
  Wallet,
  Maximize2,
  CheckSquare,
  Square,
  RefreshCw,
  Mail,
  Barcode,
  CreditCard,
  Megaphone,
  Award,
  Tag,
  ShoppingBag
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BUSINESS_THEME_PRESETS } from '../../data/initialData';
import {
  Product,
  Order,
  OrderStatus,
  CourierProvider,
  SpinReward,
  Category,
  HomeSlide,
  UserStaff,
  AbandonedCart,
  ProductReview
} from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
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
    updateOrderStatus,
    updateOrderCourier,
    updateOrderDetails,
    deleteOrder,
    bulkUpdateOrders,
    syncStoreFromServer,
    sendOrderToSteadfast,
    bookOrderCourier,
    checkSteadfastDeliveryStatus,
    refreshOrderScore,
    checkCustomerFraudRisk,
    abandonedCarts,
    markAbandonedCartWhatsAppSent,
    recoverAbandonedCart,
    reviews,
    addProductReview,
    updateProductReview,
    deleteProductReview,
    bulkUpdateReviews,
    bulkDeleteReviews,
    users,
    addUser,
    updateUser,
    deleteUser,
    logoutAdmin,
    startAICall,
    spinRewards,
    addSpinReward,
    updateSpinReward,
    deleteSpinReward,
    playVoiceSample,
    isPlayingVoiceSample,
    settings,
    updateSettings,
    resetAllToDefault,
    setActiveView,
    goHome,
    adminLang,
    setAdminLang,
    toggleProductFlashSale,
    lang,
    t,
    addToast,
    priceAlerts,
    whatsappLogs,
    sendMetaWhatsAppMessage,
    applyBusinessTheme,
    serverPixelEvents,
    customerBrowsingLogs,
    supportChats,
    sendAgentChatReply,
    generateAgentAIReply,
    markChatRead,
    openOrCreateCustomerChatSession,
    browserCalls,
    initiateCustomerBrowserCall,
    answerBrowserCallFromBackend,
    appendBrowserCallMessage,
    endBrowserCallSession,
    customerWalletBalance,
    walletLastPurchaseAt,
    walletDaysRemaining,
    walletTopUps,
    approveWalletTopUp,
    rejectWalletTopUp,
    adjustCustomerWalletByAdmin,
    runWalletExpirySweep,
    mediaLibrary,
    registerMediaItem,
    deleteMediaItems,
    resizeMediaItems,
    syncStoreMediaLibrary,
    customerAccounts,
    adjustSpecificCustomerBalance,
    resetCustomerWalletExpiry,
    createOrder,
    clearAppCache,
    firebaseAdminUserEmail,
    isFirebaseAdminConnected,
    signInAdminWithGoogle,
    generateBrandColorAttributes
  } = useStore();

  // Pure language translation helper based on admin language preference
  const at = (bnText: string, enText: string) => (adminLang === 'en' ? enText : bnText);

  const handleImageFileUpload = (
    file: File | undefined,
    onLoaded: (dataUrl: string) => void,
    sourceTag: 'product' | 'slider' | 'logo' | 'category' | 'seo' | 'upload' = 'upload'
  ) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      addToast('error', at('ফাইল অনেক বড়', 'File too large'), at('সর্বোচ্চ ৪MB ছবি আপলোড করুন।', 'Please choose an image under 4MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        const probe = new Image();
        probe.onload = () => {
          registerMediaItem({
            name: file.name,
            url: result,
            source: sourceTag,
            width: probe.naturalWidth || 600,
            height: probe.naturalHeight || 600,
            sizeKb: Math.max(1, Math.round(file.size / 1024)),
            mimeType: file.type || 'image/jpeg'
          });
        };
        probe.onerror = () => {
          registerMediaItem({
            name: file.name,
            url: result,
            source: sourceTag,
            width: 600,
            height: 600,
            sizeKb: Math.max(1, Math.round(file.size / 1024)),
            mimeType: file.type || 'image/jpeg'
          });
        };
        probe.src = result;
        onLoaded(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Active tab state (all left-hand sidebar options)
  type AdminTab =
    | 'overview'
    | 'support_desk'
    | 'orders'
    | 'pos_system'
    | 'products'
    | 'media_gallery'
    | 'categories'
    | 'abandoned_carts'
    | 'courier_hub'
    | 'flash_sale'
    | 'sliders'
    | 'wallet_control'
    | 'marketing'
    | 'ai_hub'
    | 'spin_wheel'
    | 'analytics'
    | 'reviews'
    | 'users'
    | 'design_footer'
    | 'settings';

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  // POS & 1-Click Barcode System State
  const [posBarcodeInput, setPosBarcodeInput] = useState('');
  const [posSearch, setPosSearch] = useState('');
  const [posCart, setPosCart] = useState<{ product: Product; quantity: number; unitPrice?: number; selectedColor?: string; selectedSize?: string }[]>([]);
  const [posSelectedCustomerId, setPosSelectedCustomerId] = useState<string>('walk-in');
  const [posWalkInName, setPosWalkInName] = useState('Walk-in Customer');
  const [posWalkInPhone, setPosWalkInPhone] = useState('01700000000');
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [posDiscountType, setPosDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [posDeliveryFee, setPosDeliveryFee] = useState<number>(0);
  const [posPaidAmount, setPosPaidAmount] = useState<string>('');
  const [posPaymentMethod, setPosPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'card'>('cash');
  const [posReceiptOrder, setPosReceiptOrder] = useState<Order | null>(null);
  const [printableBarcodeProduct, setPrintableBarcodeProduct] = useState<Product | null>(null);
  const [posCustomItemName, setPosCustomItemName] = useState('');
  const [posCustomItemPrice, setPosCustomItemPrice] = useState('');
  const [posHeldOrders, setPosHeldOrders] = useState<
    {
      id: string;
      customerName: string;
      customerPhone: string;
      items: { product: Product; quantity: number; unitPrice?: number; selectedColor?: string; selectedSize?: string }[];
      discount: number;
      discountType: 'fixed' | 'percent';
      deliveryFee: number;
      heldAt: string;
    }[]
  >([]);

  // Customer Manual Wallet Balance Control State
  const [customerSearch, setCustomerSearch] = useState('');
  const [balanceAdjustAmounts, setBalanceAdjustAmounts] = useState<Record<string, number>>({});

  // Support Desk unified customer workspace tab
  const [customerConsoleTab, setCustomerConsoleTab] = useState<'call' | 'chat' | 'orders'>('call');
  const [customerChatDraft, setCustomerChatDraft] = useState('');
  const [isGeneratingCustomerChatAi, setIsGeneratingCustomerChatAi] = useState(false);

  // Reviews CRUD & Bulk Selection State
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [reviewFilterProduct, setReviewFilterProduct] = useState<string>('all');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<{
    productId: string;
    customerName: string;
    rating: number;
    comment: string;
    date: string;
    verifiedPurchase: boolean;
    isApproved: boolean;
  }>({
    productId: '',
    customerName: '',
    rating: 5,
    comment: '',
    date: new Date().toISOString().split('T')[0],
    verifiedPurchase: true,
    isApproved: true
  });

  // Promo Coupons Manager State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponTitle, setNewCouponTitle] = useState('');
  const [newCouponType, setNewCouponType] = useState<'fixed' | 'percent' | 'free_shipping'>('fixed');
  const [newCouponValue, setNewCouponValue] = useState(100);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(500);

  // Steadfast Balance Test State
  const [steadfastBalanceInfo, setSteadfastBalanceInfo] = useState<{ ok: boolean; balance?: number; message: string } | null>(null);
  const [isCheckingSteadfastBalance, setIsCheckingSteadfastBalance] = useState(false);

  // SMTP Test & Organic Email Campaign State
  const [smtpTestEmail, setSmtpTestEmail] = useState('');
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [emailCampaignAudience, setEmailCampaignAudience] = useState<'all' | 'customers' | 'orders' | 'custom'>('all');
  const [emailCampaignCustomList, setEmailCampaignCustomList] = useState('');
  const [emailCampaignSubject, setEmailCampaignSubject] = useState('BuyOne BD স্পেশাল অফার — সীমিত সময়ের জন্য ছাড়!');
  const [emailCampaignBody, setEmailCampaignBody] = useState(
    'আসসালামু আলাইকুম,\n\nBuyOne BD এর নতুন ও ফ্ল্যাশ সেল কালেকশনে এখন বিশেষ ডিসকাউন্ট চলছে! ক্যাশ অন ডেলিভারিতে আজই অর্ডার করুন।'
  );
  const [isSendingEmailCampaign, setIsSendingEmailCampaign] = useState(false);

  // Media / Gallery state (bulk select, delete, canvas resize)
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [mediaSourceFilter, setMediaSourceFilter] = useState<'all' | 'product' | 'slider' | 'logo' | 'category' | 'seo' | 'upload'>('all');
  const [mediaSearch, setMediaSearch] = useState('');
  const [resizeWidth, setResizeWidth] = useState<number>(600);
  const [resizeHeight, setResizeHeight] = useState<number>(600);
  const [resizeQuality, setResizeQuality] = useState<number>(88);
  const [resizeKeepAspect, setResizeKeepAspect] = useState<boolean>(false);
  const [isResizingMedia, setIsResizingMedia] = useState<boolean>(false);
  const [isProductGalleryPickerOpen, setIsProductGalleryPickerOpen] = useState<boolean>(false);

  // Wallet MFS Top-Up & Adjustment state
  const [walletStatusFilter, setWalletStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [adminAdjustAmount, setAdminAdjustAmount] = useState<string>('200');
  const [adminAdjustNote, setAdminAdjustNote] = useState<string>('');
  const [rowCourierChoice, setRowCourierChoice] = useState<Record<string, CourierProvider>>({});

  // Support Desk & Browser Call Console state
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [chatReplyDraft, setChatReplyDraft] = useState<string>('');
  const [isGeneratingAiReply, setIsGeneratingAiReply] = useState<boolean>(false);
  const [selectedCallId, setSelectedCallId] = useState<string>('');
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string>('');
  const [callRosterSearch, setCallRosterSearch] = useState<string>('');
  const [callRosterFilter, setCallRosterFilter] = useState<'all' | 'active' | 'orders'>('all');
  const [callReplyInput, setCallReplyInput] = useState<string>('');
  const [isGeneratingCallDraft, setIsGeneratingCallDraft] = useState<boolean>(false);
  const [isVoiceSpeakerOn, setIsVoiceSpeakerOn] = useState<boolean>(true);
  const [isMicListening, setIsMicListening] = useState<boolean>(false);
  const [callElapsed, setCallElapsed] = useState<number>(0);
  const speechRecognitionRef = useRef<any>(null);
  const [browsingSearch, setBrowsingSearch] = useState<string>('');

  // AI Keyword Rules form state
  const [newRuleKeywords, setNewRuleKeywords] = useState('');
  const [newRuleReplyBn, setNewRuleReplyBn] = useState('');
  const [newRuleReplyEn, setNewRuleReplyEn] = useState('');

  // Orders filters, bulk actions & manual creator
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkOrderAction, setBulkOrderAction] = useState<string>('');
  const [orderDateFilter, setOrderDateFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [orderChannelFilter, setOrderChannelFilter] = useState<'all' | 'online' | 'pos'>('all');
  const [orderCustomerFilter, setOrderCustomerFilter] = useState<string>('all');
  const [orderPage, setOrderPage] = useState<number>(1);
  const [isCheckingCourierStatus, setIsCheckingCourierStatus] = useState<string | null>(null);
  const [isRefreshingScore, setIsRefreshingScore] = useState<string | null>(null);
  const [isSyncingOrders, setIsSyncingOrders] = useState<boolean>(false);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState<boolean>(false);
  const [newOrderForm, setNewOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    district: 'Dhaka - Inside City',
    thana: 'Dhanmondi',
    address: '',
    productId: '',
    quantity: 1,
    paymentMethod: 'cod' as 'cod' | 'bkash' | 'nagad' | 'rocket',
    advancePaid: 0,
    discount: 0,
    status: 'pending' as OrderStatus,
    note: ''
  });
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isBookingSteadfast, setIsBookingSteadfast] = useState<string | null>(null);
  const [fraudCheckPhone, setFraudCheckPhone] = useState('');
  const [fraudResult, setFraudResult] = useState<any | null>(null);
  const [isCheckingFraud, setIsCheckingFraud] = useState(false);

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    title: '',
    titleBn: '',
    description: '',
    descriptionBn: '',
    price: 1200,
    originalPrice: 1800,
    stock: 45,
    category: 'smart-gadgets',
    categoryBn: 'স্মার্ট গ্যাজেট',
    subcategory: '',
    tags: ['Best Seller'],
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800'],
    sku: `PROD-${Date.now().toString().slice(-4)}`,
    barcode: `880${Date.now().toString().slice(-9)}`,
    freeShipping: false,
    customDeliveryFees: {
      dhakaInside: undefined,
      dhakaSub: undefined,
      dhakaOutside: undefined
    },
    rating: 4.9,
    reviewsCount: 16,
    soldCount: 120,
    loyaltyPoints: undefined,
    isFlashSale: true,
    colors: ['Black (কালো)', 'Silver (সিলভার)'],
    sizes: ['Standard'],
    features: ['100% Genuine Quality', 'Fast Shipping Warranty'],
    featuresBn: ['১০০% আসল প্রোডাক্ট', 'দ্রুত ডেলিভারি ওয়ারেন্টি'],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    warrantyInfo: '7-day replacement guarantee',
    warrantyInfoBn: '৭ দিনের সহজ রিপ্লেসমেন্ট ওয়ারেন্টি',
    seo: {
      slug: '',
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      robots: 'index, follow',
      ogImage: ''
    }
  });

  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [waTestPhone, setWaTestPhone] = useState('01886289663');
  const [waTestMsg, setWaTestMsg] = useState('আসসালামু আলাইকুম! BuyOne BD থেকে আপনার অর্ডার নিশ্চিত করা হয়েছে।');
  const [isSendingWaTest, setIsSendingWaTest] = useState(false);

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newSubNameBn, setNewSubNameBn] = useState('');
  const [newSubNameEn, setNewSubNameEn] = useState('');
  const [categoryForm, setCategoryForm] = useState<Omit<Category, 'id'>>({
    nameBn: '',
    nameEn: '',
    slug: '',
    icon: '',
    iconImage: '',
    isActive: true,
    subcategories: []
  });

  // Slider Modal
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideForm, setSlideForm] = useState<Omit<HomeSlide, 'id'>>({
    titleBn: '',
    titleEn: '',
    subtitleBn: '',
    subtitleEn: '',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
    buttonTextBn: '১ ক্লিকে এখনই কিনুন',
    buttonTextEn: '1-Click Buy Now',
    linkCategory: 'smart-gadgets',
    discountBadgeBn: 'ধামাকা অফার',
    discountBadgeEn: 'Mega Deal',
    isActive: true
  });

  // User Staff Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<Omit<UserStaff, 'id' | 'createdAt'>>({
    name: '',
    email: '',
    phone: '',
    role: 'order_manager',
    isActive: true
  });

  // Spin Rewards modal state
  const [isSpinModalOpen, setIsSpinModalOpen] = useState(false);
  const [editingSpinRewardId, setEditingSpinRewardId] = useState<string | null>(null);
  const [spinForm, setSpinForm] = useState<Omit<SpinReward, 'id'>>({
    labelBn: '৳১৫০ ক্যাশ ছাড়',
    labelEn: '৳150 OFF',
    code: 'SPIN150',
    discountType: 'fixed',
    value: 150,
    color: '#059669',
    isTryAgain: false
  });

  // Handlers for Products
  const openNewProductModal = () => {
    setEditingProductId(null);
    setProductForm({
      title: '',
      titleBn: '',
      description: '',
      descriptionBn: '',
      price: 1200,
      originalPrice: 1800,
      stock: 45,
      category: 'smart-gadgets',
      categoryBn: 'স্মার্ট গ্যাজেট',
      subcategory: '',
      tags: ['Trending'],
      images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800'],
      sku: `PROD-${Date.now().toString().slice(-4)}`,
      barcode: `880${Date.now().toString().slice(-9)}`,
      freeShipping: false,
      customDeliveryFees: {
        dhakaInside: undefined,
        dhakaSub: undefined,
        dhakaOutside: undefined
      },
      rating: 4.8,
      reviewsCount: 15,
      soldCount: 0,
      loyaltyPoints: undefined,
      isFlashSale: true,
      colors: ['Black (কালো)'],
      sizes: ['Standard'],
      features: ['100% Genuine Quality'],
      featuresBn: ['১০০% অরিজিনাল পণ্য'],
      videoUrl: '',
      warrantyInfo: '7-day replacement warranty',
      warrantyInfoBn: '৭ দিনের রিপ্লেসমেন্ট ওয়ারেন্টি',
      seo: {
        slug: '',
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        robots: 'index, follow',
        ogImage: ''
      }
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm({
      title: prod.title,
      titleBn: prod.titleBn,
      description: prod.description,
      descriptionBn: prod.descriptionBn,
      price: prod.price,
      originalPrice: prod.originalPrice,
      stock: prod.stock,
      category: prod.category,
      categoryBn: prod.categoryBn,
      subcategory: prod.subcategory || '',
      tags: prod.tags || [],
      images: prod.images || [],
      sku: prod.sku,
      barcode: prod.barcode || `880${prod.id.replace(/\D/g, '').padStart(9, '0').slice(-9)}`,
      freeShipping: prod.freeShipping ?? false,
      customDeliveryFees: {
        dhakaInside: prod.customDeliveryFees?.dhakaInside,
        dhakaSub: prod.customDeliveryFees?.dhakaSub,
        dhakaOutside: prod.customDeliveryFees?.dhakaOutside
      },
      rating: prod.rating,
      reviewsCount: prod.reviewsCount,
      soldCount: prod.soldCount,
      loyaltyPoints: prod.loyaltyPoints,
      isFlashSale: prod.isFlashSale ?? false,
      colors: prod.colors || [],
      sizes: prod.sizes || [],
      features: prod.features || [],
      featuresBn: prod.featuresBn || [],
      videoUrl: prod.videoUrl || '',
      warrantyInfo: prod.warrantyInfo || '',
      warrantyInfoBn: prod.warrantyInfoBn || '',
      seo: {
        slug: prod.seo?.slug || '',
        metaTitle: prod.seo?.metaTitle || '',
        metaDescription: prod.seo?.metaDescription || '',
        keywords: prod.seo?.keywords || '',
        robots: prod.seo?.robots || 'index, follow',
        ogImage: prod.seo?.ogImage || ''
      }
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedSlug = (productForm.seo?.slug || productForm.title || productForm.titleBn)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const customFeesClean =
      productForm.customDeliveryFees &&
      (productForm.customDeliveryFees.dhakaInside !== undefined ||
        productForm.customDeliveryFees.dhakaSub !== undefined ||
        productForm.customDeliveryFees.dhakaOutside !== undefined)
        ? {
            dhakaInside: productForm.customDeliveryFees.dhakaInside,
            dhakaSub: productForm.customDeliveryFees.dhakaSub,
            dhakaOutside: productForm.customDeliveryFees.dhakaOutside
          }
        : undefined;
    const payload: Omit<Product, 'id'> = {
      ...productForm,
      barcode: productForm.barcode?.trim() || `880${Date.now().toString().slice(-9)}`,
      customDeliveryFees: customFeesClean,
      seo: {
        ...productForm.seo,
        slug: cleanedSlug || `product-${Date.now().toString().slice(-4)}`
      }
    };
    if (editingProductId) {
      updateProduct(editingProductId, payload);
    } else {
      addProduct(payload);
    }
    setIsProductModalOpen(false);
  };

  // Handlers for Categories
  const openNewCategoryModal = () => {
    setEditingCategoryId(null);
    setNewSubNameBn('');
    setNewSubNameEn('');
    setCategoryForm({
      nameBn: '',
      nameEn: '',
      slug: '',
      icon: '',
      iconImage: '',
      isActive: true,
      subcategories: []
    });
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setNewSubNameBn('');
    setNewSubNameEn('');
    setCategoryForm({
      nameBn: cat.nameBn,
      nameEn: cat.nameEn,
      slug: cat.slug,
      icon: cat.icon || '',
      iconImage: cat.iconImage || '',
      isActive: cat.isActive,
      subcategories: cat.subcategories || []
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.nameBn.trim()) {
      addToast('error', t('ক্যাটাগরির নাম দিন', 'Name required'), t('বাংলায় নাম দেওয়া আবশ্যক', 'Bangla name is required'));
      return;
    }
    const slug = categoryForm.slug.trim() || categoryForm.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '-') || `cat-${Date.now()}`;
    const payload = { ...categoryForm, slug };

    if (editingCategoryId) {
      updateCategory(editingCategoryId, payload);
    } else {
      addCategory(payload);
    }
    setIsCategoryModalOpen(false);
  };

  // Handlers for Sliders
  const openNewSlideModal = () => {
    setEditingSlideId(null);
    setSlideForm({
      titleBn: '',
      titleEn: '',
      subtitleBn: '',
      subtitleEn: '',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
      buttonTextBn: '১ ক্লিকে অর্ডার করুন',
      buttonTextEn: '1-Click Buy Now',
      linkCategory: 'smart-gadgets',
      discountBadgeBn: 'স্পেশাল ডিসকাউন্ট',
      discountBadgeEn: 'Special Offer',
      isActive: true
    });
    setIsSliderModalOpen(true);
  };

  const openEditSlideModal = (slide: HomeSlide) => {
    setEditingSlideId(slide.id);
    setSlideForm({ ...slide });
    setIsSliderModalOpen(true);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlideId) {
      updateSlide(editingSlideId, slideForm);
    } else {
      addSlide(slideForm);
    }
    setIsSliderModalOpen(false);
  };

  // Handlers for Users & Staff
  const openNewUserModal = () => {
    setEditingUserId(null);
    setUserForm({
      name: '',
      email: '',
      phone: '',
      role: 'order_manager',
      isActive: true
    });
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (u: UserStaff) => {
    setEditingUserId(u.id);
    setUserForm({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      isActive: u.isActive
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      updateUser(editingUserId, userForm);
    } else {
      addUser(userForm);
    }
    setIsUserModalOpen(false);
  };

  // Multi-Courier 1-click booking
  const handleBookCourier = async (orderId: string, provider: CourierProvider) => {
    setIsBookingSteadfast(orderId);
    const res = await bookOrderCourier(orderId, provider);
    setIsBookingSteadfast(null);
    if (res.success) {
      addToast(
        'success',
        at(`${provider} কুরিয়ারে বুকিং সম্পন্ন!`, `${provider} Booked Successfully!`),
        at(`ট্র্যাকিং কোড: ${res.trackingCode}`, `Tracking Code: ${res.trackingCode}`)
      );
    }
  };

  // Customer fraud check
  const handleCheckFraud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fraudCheckPhone) return;
    setIsCheckingFraud(true);
    const result = await checkCustomerFraudRisk(fraudCheckPhone);
    setFraudResult(result);
    setIsCheckingFraud(false);
  };

  // Send WhatsApp Abandoned Cart Recovery Memo
  const handleSendCartWhatsApp = (cart: AbandonedCart) => {
    const phone = (cart.customerPhone || '').replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `আসসালামু আলাইকুম ${cart.customerName || 'গ্রাহক'}! BuyOne BD-তে আপনার ব্যাগে পণ্যগুলো রয়ে গেছে। আজই অর্ডার কনফার্ম করলে পাচ্ছেন স্পেশাল ৳১০০ ডিসকাউন্ট! কুপন: WIN100। অর্ডার করতে ভিজিট করুন অথবা এই নাম্বারে রিপ্লাই দিন।`
    );
    window.open(`https://wa.me/${phone.startsWith('88') ? phone : '88' + phone}?text=${msg}`, '_blank');
    markAbandonedCartWhatsAppSent(cart.id);
  };

  // Filtered orders (supports status, partial, date range, channel, customer, search)
  const filteredOrders = useMemo(() => {
    const now = Date.now();
    return orders.filter((ord) => {
      const q = orderSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        ord.id.toLowerCase().includes(q) ||
        ord.customer.name.toLowerCase().includes(q) ||
        ord.customer.phone.includes(q) ||
        (ord.courier?.trackingCode || '').toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'partial'
          ? ord.status === 'partial' || ((ord.pricing.advancePaid || 0) > 0 && (ord.payment.dueAmount || 0) > 0)
          : ord.status === statusFilter;
      const matchesChannel =
        orderChannelFilter === 'all' || (ord.source || 'online') === orderChannelFilter;
      const matchesCustomer =
        orderCustomerFilter === 'all' || ord.customer.phone === orderCustomerFilter;
      let matchesDate = true;
      if (orderDateFilter !== 'all') {
        const createdMs = new Date(ord.createdAt).getTime();
        if (orderDateFilter === 'today') {
          matchesDate = new Date(ord.createdAt).toDateString() === new Date().toDateString();
        } else if (orderDateFilter === '7d') {
          matchesDate = now - createdMs <= 7 * 86400000;
        } else if (orderDateFilter === '30d') {
          matchesDate = now - createdMs <= 30 * 86400000;
        }
      }
      return matchesSearch && matchesStatus && matchesChannel && matchesCustomer && matchesDate;
    });
  }, [orders, orderSearch, statusFilter, orderChannelFilter, orderCustomerFilter, orderDateFilter]);

  // Aggregate Stats
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.pricing.total : sum), 0);
  const confirmedOrders = orders.filter((o) => o.status === 'ai_confirmed' || o.status === 'shipped' || o.status === 'delivered');
  const aiSuccessRate = orders.length > 0 ? Math.round((confirmedOrders.length / orders.length) * 100) : 0;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const ringingCalls = browserCalls.filter((c) => c.status === 'ringing_backend');
  const unreadChatCount = supportChats.reduce((sum, c) => sum + (c.unreadByAdmin || 0), 0);
  const supportDeskBadge = ringingCalls.length + unreadChatCount;

  const activeChatObj =
    supportChats.find((c) => c.id === selectedChatId) || supportChats[0] || null;

  // Group all distinct customers by normalized phone across browserCalls, orders, and supportChats
  const normalizePhoneKey = (phone?: string) => (phone || '').replace(/[^0-9]/g, '').slice(-11);

  interface DistinctCallCustomer {
    key: string;
    name: string;
    phone: string;
    district: string;
    customerOrders: Order[];
    totalSpent: number;
    latestOrder: Order | null;
    customerCalls: typeof browserCalls;
    latestCall: (typeof browserCalls)[number] | null;
    activeCall: (typeof browserCalls)[number] | null;
  }

  const callCustomersRoster = useMemo<DistinctCallCustomer[]>(() => {
    const map = new Map<string, DistinctCallCustomer>();

    const upsert = (phoneRaw: string | undefined, nameRaw: string | undefined, districtRaw?: string) => {
      const cleanPhone = (phoneRaw || '').trim();
      const key = normalizePhoneKey(cleanPhone) || `name:${(nameRaw || 'guest').toLowerCase()}`;
      const existing = map.get(key);
      if (existing) {
        if (nameRaw && (!existing.name || existing.name === 'সম্মানিত গ্রাহক' || existing.name === 'Guest Visitor')) {
          existing.name = nameRaw;
        }
        if (districtRaw && !existing.district) {
          existing.district = districtRaw;
        }
        return existing;
      }
      const created: DistinctCallCustomer = {
        key,
        name: nameRaw || at('অতিথি গ্রাহক', 'Guest Customer'),
        phone: cleanPhone || '01886289663',
        district: districtRaw || '',
        customerOrders: [],
        totalSpent: 0,
        latestOrder: null,
        customerCalls: [],
        latestCall: null,
        activeCall: null
      };
      map.set(key, created);
      return created;
    };

    browserCalls.forEach((call) => {
      const rec = upsert(call.customerPhone, call.customerName);
      rec.customerCalls.push(call);
    });

    orders.forEach((ord) => {
      const rec = upsert(ord.customer.phone, ord.customer.name, ord.customer.district);
      rec.customerOrders.push(ord);
      if (ord.status !== 'cancelled') {
        rec.totalSpent += ord.pricing.total;
      }
    });

    supportChats.forEach((chat) => {
      if (chat.customerPhone || (chat.customerName && chat.customerName !== 'সম্মানিত গ্রাহক')) {
        upsert(chat.customerPhone, chat.customerName);
      }
    });

    const list = Array.from(map.values()).map((rec) => {
      const sortedOrders = [...rec.customerOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const sortedCalls = [...rec.customerCalls].sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );
      const activeCall =
        sortedCalls.find((c) => c.status === 'ringing_backend') ||
        sortedCalls.find((c) => c.status === 'connected') ||
        null;
      return {
        ...rec,
        customerOrders: sortedOrders,
        latestOrder: sortedOrders[0] || null,
        customerCalls: sortedCalls,
        latestCall: sortedCalls[0] || null,
        activeCall
      };
    });

    return list.sort((a, b) => {
      const score = (c: DistinctCallCustomer) =>
        c.activeCall?.status === 'ringing_backend'
          ? 4
          : c.activeCall?.status === 'connected'
          ? 3
          : c.latestCall
          ? 2
          : c.latestOrder
          ? 1
          : 0;
      return score(b) - score(a) || b.customerOrders.length - a.customerOrders.length;
    });
  }, [browserCalls, orders, supportChats, adminLang]);

  const filteredCallCustomers = useMemo(() => {
    const q = callRosterSearch.trim().toLowerCase();
    return callCustomersRoster.filter((c) => {
      if (callRosterFilter === 'active' && !c.activeCall && c.customerCalls.length === 0) return false;
      if (callRosterFilter === 'orders' && c.customerOrders.length === 0) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.customerOrders.some((o) => o.id.toLowerCase().includes(q))
      );
    });
  }, [callCustomersRoster, callRosterSearch, callRosterFilter]);

  const selectedCallCustomer = useMemo(() => {
    if (selectedCustomerPhone) {
      const match = callCustomersRoster.find((c) => c.key === selectedCustomerPhone);
      if (match) return match;
    }
    if (selectedCallId) {
      const byCall = callCustomersRoster.find((c) => c.customerCalls.some((cc) => cc.id === selectedCallId));
      if (byCall) return byCall;
    }
    return callCustomersRoster[0] || null;
  }, [callCustomersRoster, selectedCustomerPhone, selectedCallId]);

  const activeCallObj = useMemo(() => {
    if (selectedCallId) {
      const explicit = browserCalls.find((c) => c.id === selectedCallId);
      if (explicit) {
        if (!selectedCallCustomer || selectedCallCustomer.customerCalls.some((cc) => cc.id === explicit.id)) {
          return explicit;
        }
      }
    }
    if (selectedCallCustomer) {
      return selectedCallCustomer.activeCall || selectedCallCustomer.latestCall || null;
    }
    return ringingCalls[0] || browserCalls.find((c) => c.status === 'connected') || browserCalls[0] || null;
  }, [browserCalls, selectedCallId, selectedCallCustomer, ringingCalls]);

  useEffect(() => {
    if (activeCallObj?.status !== 'connected') {
      setCallElapsed(activeCallObj?.durationSeconds || 0);
      return;
    }
    const updateElapsed = () => {
      setCallElapsed(Math.max(0, Math.floor((Date.now() - new Date(activeCallObj.startedAt).getTime()) / 1000)));
    };
    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [activeCallObj?.id, activeCallObj?.status, activeCallObj?.startedAt, activeCallObj?.durationSeconds]);

  const formatCallTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const speakVoiceLine = (text: string) => {
    if (!isVoiceSpeakerOn || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = /[\u0980-\u09FF]/.test(text) ? 'bn-BD' : 'en-US';
      utter.rate = 0.98;
      window.speechSynthesis.speak(utter);
    } catch {}
  };

  const sendAssistantVoiceSpeech = (callId: string, text: string) => {
    const clean = text.trim();
    if (!clean) return;
    appendBrowserCallMessage(callId, 'assistant', clean, clean);
    speakVoiceLine(clean);
  };

  const handleStartLiveVoiceCallForCustomer = (customer: DistinctCallCustomer) => {
    setSelectedCustomerPhone(customer.key);
    if (customer.activeCall) {
      setSelectedCallId(customer.activeCall.id);
      if (customer.activeCall.status === 'ringing_backend') {
        answerBrowserCallFromBackend(customer.activeCall.id);
      }
      return;
    }
    const newId = initiateCustomerBrowserCall(customer.latestOrder, {
      name: customer.name,
      phone: customer.phone,
      autoConnect: true
    });
    setSelectedCallId(newId);
    speakVoiceLine(
      adminLang === 'bn'
        ? `আসসালামু আলাইকুম ${customer.name}, BuyOne BD সাপোর্ট ডেস্ক থেকে লাইভ কল যুক্ত হয়েছে।`
        : `Hello ${customer.name}, live support call connected from BuyOne BD desk.`
    );
  };

  const toggleMicVoiceInput = () => {
    if (!activeCallObj || activeCallObj.status === 'ended') return;
    if (isMicListening && speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      setIsMicListening(false);
      return;
    }
    const w = window as any;
    const SpeechRec = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRec) {
      addToast(
        'warning',
        at('মাইক ভয়েস সাপোর্ট নেই', 'Voice Mic Unavailable'),
        at('এই ব্রাউজারে মাইক্রোফোন স্পিচ-টু-টেক্সট চালু নেই — নিচের ভয়েস বক্সে লিখুন।', 'Speech recognition not available in this browser; type below to speak.')
      );
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.lang = adminLang === 'bn' ? 'bn-BD' : 'en-US';
      rec.interimResults = false;
      rec.onresult = (event: any) => {
        const spoken = event?.results?.[0]?.[0]?.transcript;
        if (spoken && activeCallObj) {
          sendAssistantVoiceSpeech(activeCallObj.id, spoken);
        }
      };
      rec.onerror = () => setIsMicListening(false);
      rec.onend = () => setIsMicListening(false);
      speechRecognitionRef.current = rec;
      rec.start();
      setIsMicListening(true);
    } catch {
      setIsMicListening(false);
    }
  };

  const handleGenerateCallAiDraft = async () => {
    if (!activeCallObj && !selectedCallCustomer) return;
    setIsGeneratingCallDraft(true);
    try {
      const custName = activeCallObj?.customerName || selectedCallCustomer?.name || 'Customer';
      const lastCustomerLine =
        (activeCallObj
          ? [...activeCallObj.transcript].reverse().find((m) => m.speaker === 'customer')?.text
          : '') || 'কাস্টমারের সাথে অর্ডার বা পণ্য নিয়ে কথা বলুন';
      const linkedOrd = activeCallObj?.orderId
        ? orders.find((o) => o.id === activeCallObj.orderId)
        : selectedCallCustomer?.latestOrder;
      const contextPrompt = linkedOrd
        ? `Customer ${custName} (Order ${linkedOrd.id}, Total ৳${linkedOrd.pricing.total}, Status: ${linkedOrd.status}). Customer said: "${lastCustomerLine}". Draft a helpful Bengali response for our support assistant.`
        : `Customer ${custName} said: "${lastCustomerLine}". Draft a polite Bengali response for our support assistant.`;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: contextPrompt,
          lang: adminLang,
          assistantDraft: true,
          keywordRules: settings.aiKeywordRules || []
        })
      });
      const data = await res.json();
      if (data.reply) {
        setCallReplyInput(data.reply);
      }
    } catch {
      setCallReplyInput('আসসালামু আলাইকুম, BuyOne BD সাপোর্ট ডেস্ক থেকে বলছি। কীভাবে সাহায্য করতে পারি?');
    } finally {
      setIsGeneratingCallDraft(false);
    }
  };

  const pendingWalletCount = walletTopUps.filter((w) => w.status === 'pending').length;

  const sidebarItems: { id: AdminTab; labelBn: string; labelEn: string; icon: any; badge?: number }[] = [
    { id: 'overview', labelBn: 'ওভারভিউ ও অ্যানালিটিক্স', labelEn: 'Overview', icon: LayoutDashboard },
    { id: 'support_desk', labelBn: 'লাইভ চ্যাট ও ব্রাউজার কল', labelEn: 'Live Chat & Calls', icon: Headphones, badge: supportDeskBadge },
    { id: 'orders', labelBn: 'অর্ডার ম্যানেজমেন্ট', labelEn: 'Orders', icon: ShoppingCart, badge: orders.length },
    { id: 'pos_system', labelBn: 'পস ও ১-ক্লিক বারকোড', labelEn: 'POS & Barcode', icon: Barcode, badge: posCart.reduce((s, c) => s + c.quantity, 0) || undefined },
    { id: 'products', labelBn: 'পণ্য তালিকা ও প্রোডাক্ট যোগ', labelEn: 'Products', icon: Package, badge: products.length },
    { id: 'media_gallery', labelBn: 'মিডিয়া ও গ্যালারি', labelEn: 'Media / Gallery', icon: ImagePlus, badge: mediaLibrary.length },
    { id: 'categories', labelBn: 'ক্যাটাগরি ম্যানেজমেন্ট', labelEn: 'Categories', icon: Grid, badge: categories.length },
    { id: 'abandoned_carts', labelBn: 'কার্ট রিকভারি (ড্রপ-অফ)', labelEn: 'Cart Recovery', icon: ShoppingCart, badge: abandonedCarts.filter(c => !c.recovered).length },
    { id: 'courier_hub', labelBn: 'কুরিয়ার ইন্টিগ্রেশন হাব', labelEn: 'Steadfast Hub', icon: Truck },
    { id: 'flash_sale', labelBn: 'ফ্ল্যাশ সেল ম্যানেজার', labelEn: 'Flash Sale', icon: Flame },
    { id: 'sliders', labelBn: 'স্টোর স্লাইডার (৫-৬ ব্যানার)', labelEn: 'Store Sliders', icon: ImageIcon, badge: sliders.length },
    { id: 'wallet_control', labelBn: 'ওয়ালেট ও MFS রিচার্জ', labelEn: 'Wallet & MFS Top-Up', icon: Wallet, badge: pendingWalletCount },
    { id: 'marketing', labelBn: 'মার্কেটিং ও পিক্সেল হাব', labelEn: 'Marketing & Pixel', icon: BarChart3 },
    { id: 'ai_hub', labelBn: 'এআই ও ভয়েস কল সেটআপ', labelEn: 'AI Voice Hub', icon: Bot },
    { id: 'spin_wheel', labelBn: 'লাকি স্পিন কুপন ম্যানেজার', labelEn: 'Spin Rewards', icon: Gift, badge: spinRewards.length },
    { id: 'analytics', labelBn: 'সম্পূর্ণ স্টোর অ্যানালিটিক্স', labelEn: 'All Analytics', icon: TrendingUp },
    { id: 'reviews', labelBn: 'কাস্টমার রিভিউ ও রেটিং', labelEn: 'Customer Reviews', icon: MessageCircle, badge: reviews.length },
    { id: 'users', labelBn: 'কাস্টমার ব্যালেন্স ও স্টাফ টিম', labelEn: 'Customers & Staff', icon: Users, badge: customerAccounts.length + users.length },
    { id: 'design_footer', labelBn: 'স্টোর ডিজাইন ও ফুটার', labelEn: 'Store & Footer', icon: Sliders },
    { id: 'settings', labelBn: 'পেমেন্ট, ডেলিভারি ও SMTP', labelEn: 'Settings & SMTP', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden w-full max-w-full">
      {/* Top Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle button */}
          <button
            type="button"
            onClick={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-xl lg:hidden hover:bg-slate-800"
          >
            {isSidebarMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/hossain';
            }}
            title={at('লোগোতে ক্লিক করে অ্যাডমিন প্যানেল সম্পূর্ণ রিলোড করুন', 'Click logo to reload full Admin Dashboard (/hossain)')}
            className="flex items-center gap-3 text-left cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-black text-white shadow-lg shadow-emerald-600/30">
              B
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                BuyOne<span className="text-emerald-400">BD</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin (/hossain)
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {at('হোসাইন ম্যানেজমেন্ট প্ল্যাটফর্ম · রিলোড করতে ক্লিক করুন', 'Hossain Management Portal · Click to reload')}
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cross-Device Cloud Order Sync Status / Quick Connect */}
          {isFirebaseAdminConnected ? (
            <span
              title={at('রিয়েল-টাইম ক্লাউড ডাটাবেস সিঙ্ক সক্রিয়', 'Real-time Firebase Cloud Order Sync Active')}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-[11px] font-bold"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate max-w-[140px]">Cloud: {firebaseAdminUserEmail || 'Live'}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => signInAdminWithGoogle()}
              title={at('অন্যান্য ডিভাইস/ব্রাউজারের অর্ডার লাইভ পেতে কানেক্ট করুন', 'Connect Google Cloud Sync to receive cross-device orders live')}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-950/70 hover:bg-sky-900 border border-sky-700/70 text-sky-300 text-[11px] font-bold cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>{at('ক্লাউড সিঙ্ক চালু করুন', 'Connect Cloud Orders')}</span>
            </button>
          )}

          {/* Admin Language Switcher */}
          <button
            type="button"
            onClick={() => setAdminLang(adminLang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            title="Switch Language"
          >
            <span className="text-amber-400 font-mono">🌐</span>
            <span>{adminLang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          <button
            type="button"
            onClick={() => goHome()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{at('স্টোর ভিউ', 'View Store')}</span>
          </button>

          <button
            type="button"
            onClick={() => clearAppCache()}
            title={at('ক্যাশ ক্লিয়ার (পণ্য, অর্ডার ও সেটিংস অক্ষুণ্ণ থাকবে)', 'Clear Temporary Cache Only (Preserves Products, Orders & Settings)')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-950/50 hover:bg-amber-900/70 border border-amber-700/60 text-amber-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{at('ক্যাশ ক্লিয়ার', 'Clear Cache')}</span>
          </button>

          <button
            onClick={() => {
              logoutAdmin();
              goHome();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            title={at('লগআউট', 'Logout')}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{at('লগআউট', 'Logout')}</span>
          </button>
        </div>
      </header>

      {/* Main Layout: Left Sidebar + Content Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Sidebar (Desktop + Mobile slide) */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
            isSidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Admin User Card */}
          <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 shadow-md">
              H
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">Hossain Admin</h4>
              <p className="text-[11px] text-slate-400 font-mono truncate">hossain@gmail.com</p>
            </div>
          </div>

          {/* Left Side Options List (one by one as requested) */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            <p className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {t('ড্যাশবোর্ড অপশনসমূহ', 'Navigation Modules')}
            </p>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{t(item.labelBn, item.labelEn)}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarMobileOpen && (
          <div
            onClick={() => setIsSidebarMobileOpen(false)}
            className="fixed inset-0 z-20 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-slate-950">
          {/* LIVE INCOMING BROWSER CALL ALERT BANNER (Always visible across tabs) */}
          {ringingCalls.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-slate-900 border border-emerald-500/60 shadow-xl shadow-emerald-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/30">
                  <PhoneIncoming className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {at('ইনকামিং ব্রাউজার কল', 'Incoming Browser Call')}
                    </span>
                    {ringingCalls[0].orderId && (
                      <span className="text-[11px] font-mono font-bold text-amber-300">
                        Order #{ringingCalls[0].orderId}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-white mt-0.5">
                    {ringingCalls[0].customerName} • <span className="font-mono text-emerald-300">{ringingCalls[0].customerPhone}</span>
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    {at('কাস্টমার ব্রাউজার থেকে কল করেছেন — রিসিভ করতে বাটনে ক্লিক করুন', 'Customer is calling via storefront browser — answer to start talking')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const call = ringingCalls[0];
                    answerBrowserCallFromBackend(call.id);
                    setSelectedCallId(call.id);
                    setActiveTab('support_desk');
                  }}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{at('কল রিসিভ করুন', 'Receive Call')}</span>
                </button>
                <button
                  onClick={() => endBrowserCallSession(ringingCalls[0].id, false)}
                  className="px-3 py-2.5 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>{at('কেটে দিন', 'Decline')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE CHAT INBOX & BROWSER CALL DESK */}
          {activeTab === 'support_desk' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-emerald-400" />
                    <span>{at('লাইভ সাপোর্ট চ্যাট ও ব্রাউজার কল ডেস্ক', 'Backend Live Chat & Browser Call Desk')}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {at(
                      'কাস্টমারের ব্রাউজার কল রিসিভ করুন, কথোপকথন ও কল হিস্ট্রি দেখুন এবং ম্যানুয়াল বা AI দিয়ে চ্যাটে রিপ্লাই দিন',
                      'Receive customer browser calls, view live call talks & history, and reply to chats manually or via AI'
                    )}
                  </p>
                </div>
              </div>

              {/* A. LIVE VOICE CALL CENTER — DISTINCT CUSTOMER DIRECTORY & TELEPHONE CONSOLE */}
              <div className="rounded-2xl bg-slate-900 border border-emerald-900/50 overflow-hidden shadow-xl">
                <div className="px-5 py-3.5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-emerald-950/30 to-slate-950 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <PhoneCall className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-white">
                        {at('লাইভ ভয়েস কল ডিরেক্টরি ও কাস্টমার কল সেন্টার', 'Live Voice Call Directory & Customer Call Desk')}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {at(
                          'প্রতিটি ভিন্ন কাস্টমারের তালিকা থেকে সরাসরি কল রিসিভ করুন অথবা আউটবাউন্ড লাইভ কল করুন',
                          'Dial or answer distinct customers individually from the live customer directory with full order details'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 tabular-nums">
                      {at(`মোট কাস্টমার: ${callCustomersRoster.length} জন`, `${callCustomersRoster.length} Customers`)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsVoiceSpeakerOn((prev) => !prev)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 cursor-pointer ${
                        isVoiceSpeakerOn
                          ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
                          : 'bg-slate-950 border-slate-700 text-slate-400'
                      }`}
                    >
                      {isVoiceSpeakerOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span>{isVoiceSpeakerOn ? at('স্পিকার চালু', 'Audio On') : at('মিউট', 'Muted')}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
                  {/* Left: Distinct Customers Directory List */}
                  <div className="lg:col-span-5 p-3.5 space-y-3 bg-slate-950/30">
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={callRosterSearch}
                          onChange={(e) => setCallRosterSearch(e.target.value)}
                          placeholder={at('নাম, ফোন বা অর্ডার আইডি দিয়ে কাস্টমার খুঁজুন...', 'Search distinct customer by name, phone, district...')}
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold">
                        {(['all', 'active', 'orders'] as const).map((flt) => (
                          <button
                            key={flt}
                            type="button"
                            onClick={() => setCallRosterFilter(flt)}
                            className={`px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                              callRosterFilter === flt
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {flt === 'all'
                              ? at(`সকল কাস্টমার (${callCustomersRoster.length})`, `All (${callCustomersRoster.length})`)
                              : flt === 'active'
                              ? at('কল সক্রিয়/হিস্ট্রি', 'Call Activity')
                              : at('অর্ডারসহ', 'With Orders')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[430px] overflow-y-auto pr-1">
                      {filteredCallCustomers.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          {at('কোনো কাস্টমার পাওয়া যায়নি', 'No matching customers found')}
                        </div>
                      ) : (
                        filteredCallCustomers.map((cust) => {
                          const isSelected = selectedCallCustomer?.key === cust.key;
                          const isRinging = cust.activeCall?.status === 'ringing_backend';
                          const isLive = cust.activeCall?.status === 'connected';

                          return (
                            <div
                              key={cust.key}
                              onClick={() => {
                                setSelectedCustomerPhone(cust.key);
                                setSelectedCallId(cust.activeCall?.id || cust.latestCall?.id || '');
                                const chatId = openOrCreateCustomerChatSession(cust.name, cust.phone);
                                setSelectedChatId(chatId);
                                markChatRead(chatId);
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                                isSelected
                                  ? 'bg-emerald-950/45 border-emerald-500/70 shadow-lg shadow-emerald-950/30'
                                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-black text-xs border ${
                                      isRinging
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 animate-pulse'
                                        : isLive
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                                        : 'bg-slate-800 text-slate-200 border-slate-700'
                                    }`}
                                  >
                                    {cust.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-black text-white truncate">{cust.name}</p>
                                    <p className="text-[11px] font-mono text-emerald-400 truncate">{cust.phone}</p>
                                  </div>
                                </div>

                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                                    isRinging
                                      ? 'bg-amber-500 text-slate-950 animate-pulse'
                                      : isLive
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : cust.latestCall
                                      ? 'bg-slate-800 text-slate-300'
                                      : 'bg-sky-950/70 text-sky-300 border border-sky-800/60'
                                  }`}
                                >
                                  {isRinging
                                    ? at('ইনকামিং কল', 'Ringing')
                                    : isLive
                                    ? at('লাইভ কল', 'On Call')
                                    : cust.latestCall
                                    ? at(`${cust.customerCalls.length} কল`, `${cust.customerCalls.length} Calls`)
                                    : at('কল প্রস্তুত', 'Ready')}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                                <span className="truncate">
                                  {cust.district ? `${cust.district} • ` : ''}
                                  {at(`${cust.customerOrders.length}টি অর্ডার`, `${cust.customerOrders.length} orders`)}
                                  {cust.totalSpent > 0 ? ` • ৳${cust.totalSpent.toLocaleString()}` : ''}
                                </span>
                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => handleStartLiveVoiceCallForCustomer(cust)}
                                    className={`px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer ${
                                      isRinging
                                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                                        : isLive
                                        ? 'bg-emerald-500 text-slate-950'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    }`}
                                  >
                                    {isRinging ? <PhoneIncoming className="w-3 h-3" /> : <PhoneOutgoing className="w-3 h-3" />}
                                    <span>
                                      {isRinging
                                        ? at('রিসিভ', 'Answer')
                                        : isLive
                                        ? at('কথা বলুন', 'Open')
                                        : at('লাইভ কল', 'Call Live')}
                                    </span>
                                  </button>
                                  {cust.latestOrder && (
                                    <button
                                      type="button"
                                      onClick={() => startAICall(cust.latestOrder!)}
                                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-[10px] cursor-pointer"
                                      title={at('AI অটো ভয়েস কল', 'Trigger AI Auto-Call')}
                                    >
                                      AI
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right: Telephone Voice Stage, Order Details & Call Audit Log */}
                  <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between gap-4 bg-slate-900">
                    {!selectedCallCustomer ? (
                      <div className="flex-1 flex items-center justify-center text-xs text-slate-500 min-h-[360px]">
                        {at('বাম পাশের তালিকা থেকে যেকোনো কাস্টমার নির্বাচন করুন', 'Select a customer from the directory to start or manage a live call')}
                      </div>
                    ) : (() => {
                      const customerChatSession =
                        supportChats.find(
                          (ch) => normalizePhoneKey(ch.customerPhone) && normalizePhoneKey(ch.customerPhone) === selectedCallCustomer.key
                        ) ||
                        supportChats.find((ch) => ch.id === selectedChatId) ||
                        null;

                      return (
                      <>
                        {/* Customer Console Mode Switcher: Live Voice Call | Direct Live Chat | Order History */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                          <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold">
                            <button
                              type="button"
                              onClick={() => setCustomerConsoleTab('call')}
                              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                                customerConsoleTab === 'call'
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>{at('লাইভ ভয়েস কল', 'Voice Call')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const chatId = openOrCreateCustomerChatSession(selectedCallCustomer.name, selectedCallCustomer.phone);
                                setSelectedChatId(chatId);
                                markChatRead(chatId);
                                setCustomerConsoleTab('chat');
                              }}
                              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                                customerConsoleTab === 'chat'
                                  ? 'bg-sky-600 text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>{at('লাইভ চ্যাট', 'Direct Chat')}</span>
                              {customerChatSession && customerChatSession.messages.length > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-white/15 text-[10px]">
                                  {customerChatSession.messages.length}
                                </span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setCustomerConsoleTab('orders')}
                              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                                customerConsoleTab === 'orders'
                                  ? 'bg-amber-600 text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>{at(`অর্ডার (${selectedCallCustomer.customerOrders.length})`, `Orders (${selectedCallCustomer.customerOrders.length})`)}</span>
                            </button>
                          </div>

                          <span className="text-[11px] font-mono text-slate-400">
                            {selectedCallCustomer.name} · {selectedCallCustomer.phone}
                          </span>
                        </div>

                        {customerConsoleTab === 'chat' ? (
                          <div className="flex-1 flex flex-col justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 min-h-[380px]">
                            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                              <div>
                                <h5 className="text-sm font-black text-white flex items-center gap-2">
                                  <MessageCircle className="w-4 h-4 text-sky-400" />
                                  <span>{selectedCallCustomer.name}</span>
                                </h5>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  {selectedCallCustomer.phone} · {at('সরাসরি কাস্টমার চ্যাট ও AI উত্তর', 'Direct Customer Chat & AI Assistant')}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setCustomerConsoleTab('call')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <PhoneCall className="w-3 h-3" />
                                <span>{at('কলে যান', 'Switch to Call')}</span>
                              </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-64 pr-1">
                              {(!customerChatSession || customerChatSession.messages.length === 0) ? (
                                <p className="text-center text-xs text-slate-500 py-10">
                                  {at('এই কাস্টমারের সাথে প্রথম মেসেজ পাঠান...', 'Start direct conversation with this customer...')}
                                </p>
                              ) : (
                                customerChatSession.messages.map((m) => (
                                  <div key={m.id} className={`flex ${m.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                                    <div
                                      className={`max-w-[82%] px-3.5 py-2 rounded-2xl text-xs whitespace-pre-wrap ${
                                        m.sender === 'customer'
                                          ? 'bg-slate-800 text-slate-100 rounded-tl-sm'
                                          : m.sender === 'assistant'
                                          ? 'bg-emerald-600 text-white rounded-tr-sm'
                                          : 'bg-sky-700 text-white rounded-tr-sm'
                                      }`}
                                    >
                                      <div className="text-[10px] opacity-75 font-bold mb-0.5 flex items-center justify-between gap-3">
                                        <span>{m.sender === 'customer' ? selectedCallCustomer.name : m.sender === 'assistant' ? at('অ্যাসিস্ট্যান্ট', 'Assistant') : 'AI'}</span>
                                        <span>{m.time}</span>
                                      </div>
                                      <p>{m.text}</p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const targetChatId =
                                  customerChatSession?.id ||
                                  openOrCreateCustomerChatSession(selectedCallCustomer.name, selectedCallCustomer.phone);
                                if (!customerChatDraft.trim()) return;
                                sendAgentChatReply(targetChatId, customerChatDraft.trim());
                                setCustomerChatDraft('');
                              }}
                              className="pt-2.5 border-t border-slate-800 flex flex-wrap gap-2"
                            >
                              <input
                                type="text"
                                value={customerChatDraft}
                                onChange={(e) => setCustomerChatDraft(e.target.value)}
                                placeholder={at(`${selectedCallCustomer.name} কে মেসেজ লিখুন...`, `Message ${selectedCallCustomer.name} or generate AI reply...`)}
                                className="flex-1 min-w-[180px] px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                              />
                              <button
                                type="button"
                                disabled={isGeneratingCustomerChatAi}
                                onClick={async () => {
                                  const targetChatId =
                                    customerChatSession?.id ||
                                    openOrCreateCustomerChatSession(selectedCallCustomer.name, selectedCallCustomer.phone);
                                  setIsGeneratingCustomerChatAi(true);
                                  const draft = await generateAgentAIReply(targetChatId);
                                  if (draft) setCustomerChatDraft(draft);
                                  setIsGeneratingCustomerChatAi(false);
                                }}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{isGeneratingCustomerChatAi ? '...' : 'Generate AI'}</span>
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{at('পাঠান', 'Send')}</span>
                              </button>
                            </form>
                          </div>
                        ) : customerConsoleTab === 'orders' ? (
                          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 min-h-[360px]">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-black text-white">
                                {at(`${selectedCallCustomer.name} এর সকল অর্ডার`, `Complete Order History for ${selectedCallCustomer.name}`)}
                              </h5>
                              <span className="text-xs font-mono text-emerald-400 font-bold">
                                {at('মোট খরচ:', 'Total Spent:')} ৳{selectedCallCustomer.totalSpent.toLocaleString()}
                              </span>
                            </div>
                            {selectedCallCustomer.customerOrders.length === 0 ? (
                              <p className="text-xs text-slate-500 py-10 text-center">
                                {at('এই কাস্টমারের কোনো অর্ডার পাওয়া যায়নি।', 'No orders placed by this customer yet.')}
                              </p>
                            ) : (
                              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                {selectedCallCustomer.customerOrders.map((ord) => (
                                  <div key={ord.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                                    <div className="space-y-0.5 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-emerald-400">#{ord.id}</span>
                                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-bold text-amber-300">{ord.status}</span>
                                        <span className="text-[10px] text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</span>
                                      </div>
                                      <p className="text-slate-200 truncate">
                                        {ord.items.map((i) => `${at(i.productTitleBn, i.productTitle)} ×${i.quantity}`).join(', ')}
                                      </p>
                                      <p className="text-[11px] text-slate-400 truncate">
                                        {ord.customer.address}, {ord.customer.district}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-black font-mono text-white">৳{ord.pricing.total.toLocaleString()}</span>
                                      <button
                                        type="button"
                                        onClick={() => setSelectedOrderDetails(ord)}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                      <>
                        {/* Telephone Dialer Stage Header */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/40 border border-slate-800 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                                  activeCallObj?.status === 'ringing_backend'
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                                    : activeCallObj?.status === 'connected'
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                    : 'bg-slate-800 border-slate-700 text-slate-300'
                                }`}
                              >
                                <PhoneCall className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="text-base font-black text-white">{selectedCallCustomer.name}</h5>
                                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                                    {selectedCallCustomer.phone}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                  {activeCallObj?.status === 'connected' ? (
                                    <>
                                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                      <span className="font-bold text-emerald-400">
                                        {at('লাইভ ভয়েস সংযুক্ত', 'Live Voice Connected')}
                                      </span>
                                      <span className="font-mono text-white font-bold tabular-nums">
                                        {formatCallTimer(callElapsed)}
                                      </span>
                                    </>
                                  ) : activeCallObj?.status === 'ringing_backend' ? (
                                    <span className="font-bold text-amber-300">
                                      {at('ব্রাউজার থেকে কল আসছে — রিসিভ করতে বাটনে ক্লিক করুন', 'Incoming browser call ringing...')}
                                    </span>
                                  ) : (
                                    <span>
                                      {selectedCallCustomer.district || at('বাংলাদেশ', 'Bangladesh')} •{' '}
                                      {at(`মোট কল: ${selectedCallCustomer.customerCalls.length}টি`, `${selectedCallCustomer.customerCalls.length} past call(s)`)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {activeCallObj?.status === 'ringing_backend' && (
                                <button
                                  type="button"
                                  onClick={() => answerBrowserCallFromBackend(activeCallObj.id)}
                                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                                >
                                  <PhoneIncoming className="w-3.5 h-3.5" />
                                  <span>{at('কল রিসিভ করুন', 'Answer Call')}</span>
                                </button>
                              )}

                              {activeCallObj && activeCallObj.status !== 'ended' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={toggleMicVoiceInput}
                                    className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 border cursor-pointer ${
                                      isMicListening
                                        ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                                        : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700'
                                    }`}
                                  >
                                    <Mic className="w-3.5 h-3.5" />
                                    <span>{isMicListening ? at('শুনছে...', 'Listening...') : at('মাইক কথা', 'Mic Speak')}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => endBrowserCallSession(activeCallObj.id, true)}
                                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                                  >
                                    {at('কনফার্ম ও শেষ', 'Confirm & End')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => endBrowserCallSession(activeCallObj.id, false)}
                                    className="px-3 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                                  >
                                    <PhoneOff className="w-3.5 h-3.5" />
                                    <span>{at('কাটুন', 'Hang Up')}</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleStartLiveVoiceCallForCustomer(selectedCallCustomer)}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <PhoneOutgoing className="w-3.5 h-3.5" />
                                    <span>{at('নতুন লাইভ কল করুন', 'Start Live Call')}</span>
                                  </button>
                                  {selectedCallCustomer.latestOrder && (
                                    <button
                                      type="button"
                                      onClick={() => startAICall(selectedCallCustomer.latestOrder!)}
                                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Bot className="w-3.5 h-3.5" />
                                      <span>{at('AI অটো কল', 'AI Voice Call')}</span>
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Audio Waveform Strip when Call is Connected */}
                          {activeCallObj?.status === 'connected' && (
                            <div className="px-3 py-2 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-bold">
                                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                <span>{at('ভয়েস চ্যানেল সক্রিয় — স্পিকার ও মাইক রেডি', 'Live Voice Audio Channel Ready')}</span>
                              </div>
                              <div className="flex items-end gap-1 h-4">
                                {[40, 85, 55, 95, 70, 45, 90, 60, 80, 50].map((h, idx) => (
                                  <span
                                    key={idx}
                                    style={{ height: `${h}%` }}
                                    className="w-1 rounded-full bg-emerald-400/80 animate-pulse"
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Complete Customer Orders Details When Calling */}
                          {selectedCallCustomer.customerOrders.length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {at(
                                  `কাস্টমারের অর্ডারসমূহ (${selectedCallCustomer.customerOrders.length}টি)`,
                                  `Customer Order Details (${selectedCallCustomer.customerOrders.length})`
                                )}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-28 overflow-y-auto">
                                {selectedCallCustomer.customerOrders.map((ord) => (
                                  <div
                                    key={ord.id}
                                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-mono font-bold text-amber-400">#{ord.id}</span>
                                      <span className="font-black text-emerald-400 tabular-nums">৳{ord.pricing.total.toLocaleString()}</span>
                                    </div>
                                    <p className="text-slate-200 truncate">
                                      {ord.items.map((i) => `${i.productTitleBn} x${i.quantity}`).join(', ')}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                                      <span className="truncate">{ord.customer.address}, {ord.customer.district}</span>
                                      <span className="uppercase font-mono text-slate-300 shrink-0 ml-1">{ord.status}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* One-Click Voice Prompts + Custom Voice Broadcast Bar */}
                        {activeCallObj && activeCallObj.status !== 'ended' && (
                          <div className="space-y-2.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">
                                {at('দ্রুত ভয়েস বার্তা:', 'Quick Voice Prompts:')}
                              </span>
                              {[
                                {
                                  labelBn: 'অর্ডার কনফার্ম করুন',
                                  labelEn: 'Confirm Order',
                                  speakBn: `আসসালামু আলাইকুম ${selectedCallCustomer.name}, BuyOne BD থেকে আপনার অর্ডারটি কনফার্ম করার জন্য কল করেছি। অনুগ্রহ করে ঠিকানাটি নিশ্চিত করবেন?`,
                                  speakEn: `Hello ${selectedCallCustomer.name}, calling from BuyOne BD to confirm your order and delivery address.`
                                },
                                {
                                  labelBn: 'ঠিকানা যাচাই',
                                  labelEn: 'Verify Address',
                                  speakBn: `আপনার ডেলিভারি ঠিকানা (${selectedCallCustomer.latestOrder?.customer?.address || selectedCallCustomer.district || 'ঢাকা'}) কি ঠিক আছে?`,
                                  speakEn: `Please confirm if your delivery address (${selectedCallCustomer.latestOrder?.customer?.address || 'Dhaka'}) is correct.`
                                },
                                {
                                  labelBn: 'কুরিয়ারে পাঠানো হয়েছে',
                                  labelEn: 'Parcel Dispatched',
                                  speakBn: `আপনার পার্সেলটি স্টিডফাস্ট কুরিয়ারে হ্যান্ডওভার করা হয়েছে। ২৪ থেকে ৪৮ ঘণ্টার মধ্যে হাতে পেয়ে যাবেন ইনশাআল্লাহ।`,
                                  speakEn: `Your parcel has been dispatched via Steadfast Courier and will reach you within 24-48 hours.`
                                }
                              ].map((preset, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() =>
                                    sendAssistantVoiceSpeech(
                                      activeCallObj.id,
                                      adminLang === 'bn' ? preset.speakBn : preset.speakEn
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-950/70 border border-slate-700 hover:border-emerald-600/50 text-[11px] font-bold text-slate-200 cursor-pointer transition-colors"
                                >
                                  🎙️ {adminLang === 'bn' ? preset.labelBn : preset.labelEn}
                                </button>
                              ))}
                            </div>

                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!callReplyInput.trim()) return;
                                sendAssistantVoiceSpeech(activeCallObj.id, callReplyInput.trim());
                                setCallReplyInput('');
                              }}
                              className="flex flex-wrap gap-2"
                            >
                              <input
                                type="text"
                                value={callReplyInput}
                                onChange={(e) => setCallReplyInput(e.target.value)}
                                placeholder={at('ভয়েসে কাস্টমারকে যা বলবেন লিখুন...', 'Enter voice line to speak aloud & log in call...')}
                                className="flex-1 min-w-[200px] px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                              />
                              <button
                                type="button"
                                onClick={handleGenerateCallAiDraft}
                                disabled={isGeneratingCallDraft}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                              >
                                <Wand2 className="w-3.5 h-3.5" />
                                <span>{isGeneratingCallDraft ? '...' : at('AI ভয়েস স্ক্রিপ্ট', 'AI Script')}</span>
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>{at('ভয়েস বলুন', 'Speak')}</span>
                              </button>
                            </form>
                          </div>
                        )}

                        {/* Compact Structured Call Audit Log (Distinct from Live Chat Bubbles) */}
                        <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                          <div className="px-3.5 py-2 border-b border-slate-800 bg-slate-950 flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-300 flex items-center gap-1.5">
                              <History className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{at('কল ভয়েস লগ ও হিস্ট্রি', 'Structured Call Voice Log')}</span>
                            </span>
                            {selectedCallCustomer.customerCalls.length > 1 && (
                              <div className="flex items-center gap-1 overflow-x-auto">
                                {selectedCallCustomer.customerCalls.slice(0, 4).map((histCall, i) => (
                                  <button
                                    key={histCall.id}
                                    type="button"
                                    onClick={() => setSelectedCallId(histCall.id)}
                                    className={`px-2 py-0.5 rounded font-mono text-[10px] cursor-pointer ${
                                      activeCallObj?.id === histCall.id
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    #{i + 1} ({histCall.durationSeconds}s)
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="divide-y divide-slate-800/70 max-h-44 overflow-y-auto">
                            {!activeCallObj || activeCallObj.transcript.length === 0 ? (
                              <div className="p-4 text-center text-[11px] text-slate-500">
                                {at(
                                  'এই কাস্টমারের সাথে এখনও কোনো কল রেকর্ড হয়নি। "নতুন লাইভ কল করুন" বাটনে ক্লিক করে কথা শুরু করুন।',
                                  'No call audio logs yet for this customer. Click "Start Live Call" above to begin.'
                                )}
                              </div>
                            ) : (
                              activeCallObj.transcript.map((item) => (
                                <div key={item.id} className="px-3.5 py-2 flex items-start gap-2.5 text-xs">
                                  <span className="font-mono text-[10px] text-slate-500 shrink-0 mt-0.5 w-12">
                                    {item.time}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                                      item.speaker === 'customer'
                                        ? 'bg-slate-800 text-sky-300'
                                        : item.speaker === 'assistant'
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                                        : 'bg-amber-950 text-amber-300 border border-amber-700/50'
                                    }`}
                                  >
                                    {item.speaker === 'customer'
                                      ? at('ক্রেতা', 'Customer')
                                      : item.speaker === 'assistant'
                                      ? at('এজেন্ট ভয়েস', 'Agent')
                                      : 'AI'}
                                  </span>
                                  <p className="text-slate-200 leading-snug flex-1">{item.textBn || item.text}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                        )}
                      </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* B. FULL CHAT HISTORY & MANUAL / AI REPLY INBOX */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-sky-400" />
                    <span>{at('কাস্টমার লাইভ চ্যাট হিস্ট্রি ও ম্যানুয়াল / AI রিপ্লাই', 'Customer Live Chat History & Assistant Reply')}</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    {at(`${supportChats.length}টি থ্রেড`, `${supportChats.length} threads`)}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
                  {/* Threads Column */}
                  <div className="p-3 space-y-2 max-h-[460px] overflow-y-auto">
                    {supportChats.map((chat) => {
                      const isSelected = activeChatObj?.id === chat.id;
                      const lastMsg = chat.messages[chat.messages.length - 1];
                      return (
                        <button
                          key={chat.id}
                          onClick={() => {
                            setSelectedChatId(chat.id);
                            markChatRead(chat.id);
                          }}
                          className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-sky-950/50 border-sky-500/60'
                              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white truncate">{chat.customerName}</span>
                            {chat.unreadByAdmin > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                                {chat.unreadByAdmin}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                            {lastMsg?.text || '...'}
                          </p>
                          <div className="text-[10px] text-slate-500 font-mono mt-1">
                            {chat.customerPhone || 'Guest'} • {new Date(chat.lastUpdated).toLocaleTimeString()}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Thread + Reply Composer */}
                  <div className="lg:col-span-2 p-4 flex flex-col justify-between min-h-[420px]">
                    {!activeChatObj ? (
                      <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                        {at('চ্যাট দেখতে একটি থ্রেড নির্বাচন করুন', 'Select a chat thread to inspect & reply')}
                      </div>
                    ) : (
                      <>
                        <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-black text-white">{activeChatObj.customerName}</h5>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {activeChatObj.customerPhone || 'Visitor'} • {activeChatObj.messages.length} messages
                            </p>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-72">
                          {activeChatObj.messages.map((m) => (
                            <div
                              key={m.id}
                              className={`flex ${m.sender === 'customer' ? 'justify-start' : 'justify-end'}`}
                            >
                              <div
                                className={`max-w-[82%] px-3.5 py-2 rounded-2xl text-xs whitespace-pre-wrap ${
                                  m.sender === 'customer'
                                    ? 'bg-slate-800 text-slate-100 rounded-tl-sm'
                                    : m.sender === 'assistant'
                                    ? 'bg-emerald-600 text-white rounded-tr-sm'
                                    : 'bg-sky-700 text-white rounded-tr-sm'
                                }`}
                              >
                                <div className="text-[10px] opacity-75 font-bold mb-0.5 flex items-center justify-between gap-3">
                                  <span>
                                    {m.sender === 'customer'
                                      ? activeChatObj.customerName
                                      : m.sender === 'assistant'
                                      ? at('অ্যাসিস্ট্যান্ট (ম্যানুয়াল)', 'Support Assistant')
                                      : at('AI অটো উত্তর', 'AI Auto-Reply')}
                                  </span>
                                  <span>{m.time}</span>
                                </div>
                                <p>{m.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!chatReplyDraft.trim()) return;
                            sendAgentChatReply(activeChatObj.id, chatReplyDraft.trim());
                            setChatReplyDraft('');
                          }}
                          className="pt-3 border-t border-slate-800 space-y-2"
                        >
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="text"
                              value={chatReplyDraft}
                              onChange={(e) => setChatReplyDraft(e.target.value)}
                              placeholder={at('ম্যানুয়ালি উত্তর লিখুন অথবা "Generate AI" চাপুন...', 'Type manual reply or click "Generate AI"...')}
                              className="flex-1 min-w-[200px] px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                            />
                            <button
                              type="button"
                              disabled={isGeneratingAiReply}
                              onClick={async () => {
                                setIsGeneratingAiReply(true);
                                const draft = await generateAgentAIReply(activeChatObj.id);
                                if (draft) setChatReplyDraft(draft);
                                setIsGeneratingAiReply(false);
                              }}
                              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{isGeneratingAiReply ? at('তৈরি হচ্ছে...', 'Generating...') : 'Generate AI'}</span>
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{at('রিপ্লাই পাঠান', 'Send Reply')}</span>
                            </button>
                          </div>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">{t('ওভারভিউ ড্যাশবোর্ড', 'Overview & Analytics')}</h3>
                  <p className="text-xs text-slate-400">{t('আজকের বিক্রয়, এআই ভেরিফিকেশন ও কুরিয়ার ডেলিভারি চিত্র', 'Live sales performance, AI calls, and delivery stats')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {t('লাইভ সিস্টেম সক্রিয়', 'Live & Active')}
                  </span>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>{t('মোট বিক্রয় আয়', 'Total Revenue')}</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white">৳ {totalRevenue.toLocaleString()}</div>
                  <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+২৪% গত সপ্তাহের তুলনায়</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>{t('মোট অর্ডার', 'Total Orders')}</span>
                    <ShoppingCart className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{orders.length} টি</div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    {confirmedOrders.length} {t('টি অর্ডার নিশ্চিত', 'Orders Confirmed')}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>{t('এআই কল সাফল্য হার', 'AI Call Success')}</span>
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{aiSuccessRate}%</div>
                  <div className="text-[11px] text-emerald-400 mt-2">
                    {t('স্বয়ংক্রিয় হিউম্যান ভয়েস কনফার্ম', 'Voice verified')}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>{t('সফল ডেলিভারি (Steadfast)', 'Delivered Orders')}</span>
                    <Truck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{deliveredCount} টি</div>
                  <div className="text-[11px] text-emerald-400 mt-2">
                    {t('৯৬.২% ডেলিভারি রেট', '96.2% success rate')}
                  </div>
                </div>
              </div>

              {/* Low-Stock Alert & 1-Click Restock Widget */}
              {products.some((p) => p.stock <= 15) && (
                <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-700/40 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>{at('লো-স্টক সতর্কতা (১৫ বা তার কম স্টক)', 'Low-Stock Inventory Alert (<= 15 units)')}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      className="text-[11px] font-bold text-amber-300 hover:underline cursor-pointer"
                    >
                      {at('পণ্য ম্যানেজার →', 'Manage Products →')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {products
                      .filter((p) => p.stock <= 15)
                      .slice(0, 6)
                      .map((lowProd) => (
                        <div
                          key={`low-${lowProd.id}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-[11px]"
                        >
                          <span className="font-bold text-white truncate max-w-[140px]">
                            {at(lowProd.titleBn, lowProd.title)}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
                            {lowProd.stock} left
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              updateProduct(lowProd.id, { stock: lowProd.stock + 20 });
                              addToast('success', at('স্টক আপডেট হয়েছে!', 'Stock Restocked!'), `${at(lowProd.titleBn, lowProd.title)} (+20)`);
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
                          >
                            +20
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Truck className="w-4 h-4" />
                    <span>{t('Steadfast কুরিয়ার হাব', 'Steadfast Hub')}</span>
                  </div>
                  <p className="text-xs text-slate-400">{t('১ ক্লিকে নতুন অর্ডারগুলো Steadfast পোর্টালে পাঠিয়ে ট্র্যাকিং কোড জেনারেট করুন।', '1-click book orders with Steadfast Courier.')}</p>
                  <button
                    onClick={() => setActiveTab('courier_hub')}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    {t('কুরিয়ার হাব ওপেন করুন', 'Open Courier Hub')}
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <ShoppingCart className="w-4 h-4" />
                    <span>{t('ড্রপ-অফ কার্ট রিকভারি', 'Cart Recovery')}</span>
                  </div>
                  <p className="text-xs text-slate-400">{t('যেসব ক্রেতা কার্টে পণ্য রেখে অর্ডার শেষ করেননি, তাদের ১-ক্লিক হোয়াটসঅ্যাপ ডিসকাউন্ট মেসেজ দিন।', 'Recover abandoned carts with 1-click WhatsApp messages.')}</p>
                  <button
                    onClick={() => setActiveTab('abandoned_carts')}
                    className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    {t('ড্রপ-অফ কার্ট দেখুন', 'View Abandoned Carts')}
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                    <Bot className="w-4 h-4" />
                    <span>{t('এআই ও ভয়েস ম্যানেজার', 'AI Voice Engine')}</span>
                  </div>
                  <p className="text-xs text-slate-400">{t('Gemini, ChatGPT, Claude API সেটআপ ও খাঁটি বাংলা নারী কণ্ঠস্বর টেস্ট করুন।', 'AI API configuration & voice tester.')}</p>
                  <button
                    onClick={() => setActiveTab('ai_hub')}
                    className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    {t('এআই সেটআপ দেখুন', 'Open AI Hub')}
                  </button>
                </div>
              </div>

              {/* Recent Orders Mini Table */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">{t('সাম্প্রতিক অর্ডারসমূহ', 'Recent Orders')}</h4>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    {t('সবগুলো দেখুন', 'View All')}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/60 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">অর্ডার আইডি</th>
                        <th className="py-2.5 px-3">ক্রেতা ও ফোন</th>
                        <th className="py-2.5 px-3">জেলা</th>
                        <th className="py-2.5 px-3">মোট মূল্য</th>
                        <th className="py-2.5 px-3">স্ট্যাটাস</th>
                        <th className="py-2.5 px-3">কুরিয়ার</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-mono font-bold text-emerald-400">{ord.id}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-white">{ord.customer.name}</div>
                            <div className="text-slate-400 text-[11px]">{ord.customer.phone}</div>
                          </td>
                          <td className="py-3 px-3">{ord.customer.district}</td>
                          <td className="py-3 px-3 font-bold text-white">৳ {ord.pricing.total.toLocaleString()}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px]">{ord.courier?.trackingCode || 'Pending'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (() => {
            const pageSize = 15;
            const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
            const safePage = Math.min(orderPage, totalPages);
            const paginatedOrders = filteredOrders.slice((safePage - 1) * pageSize, safePage * pageSize);

            const statusCounts = {
              all: orders.length,
              pending: orders.filter((o) => o.status === 'pending').length,
              ai_confirmed: orders.filter((o) => o.status === 'ai_confirmed').length,
              processing: orders.filter((o) => o.status === 'processing').length,
              on_hold: orders.filter((o) => o.status === 'on_hold').length,
              shipped: orders.filter((o) => o.status === 'shipped').length,
              delivered: orders.filter((o) => o.status === 'delivered').length,
              cancelled: orders.filter((o) => o.status === 'cancelled').length,
              partial: orders.filter((o) => o.status === 'partial' || ((o.pricing.advancePaid || 0) > 0 && (o.payment.dueAmount || 0) > 0)).length
            };

            const distinctCustomers = Array.from(
              new Map(orders.map((o) => [o.customer.phone, `${o.customer.name} (${o.customer.phone})`])).entries()
            );

            const allPageSelected =
              paginatedOrders.length > 0 && paginatedOrders.every((o) => selectedOrderIds.includes(o.id));

            const handleApplyBulkOrders = () => {
              if (!bulkOrderAction || selectedOrderIds.length === 0) {
                addToast('warning', at('নির্বাচন করুন', 'Select Orders & Action'), at('অর্ডার সিলেক্ট করে একটি অ্যাকশন বেছে নিন।', 'Check orders and choose a bulk action.'));
                return;
              }
              if (bulkOrderAction === 'delete') {
                bulkUpdateOrders(selectedOrderIds, { deleteAll: true });
                setSelectedOrderIds([]);
              } else {
                bulkUpdateOrders(selectedOrderIds, { status: bulkOrderAction as OrderStatus });
                setSelectedOrderIds([]);
              }
              setBulkOrderAction('');
            };

            const handleExportOrdersCsv = () => {
              const header = 'OrderID,Customer,Phone,District,Total,Advance,Due,Status,Courier,ConsignmentID,Date\n';
              const rows = filteredOrders
                .map((o) =>
                  [
                    o.id,
                    `"${o.customer.name.replace(/"/g, '""')}"`,
                    o.customer.phone,
                    `"${o.customer.district}"`,
                    o.pricing.total,
                    o.pricing.advancePaid || 0,
                    o.payment.dueAmount || 0,
                    o.status,
                    o.courier?.provider || '',
                    o.courier?.trackingCode || '',
                    o.createdAt
                  ].join(',')
                )
                .join('\n');
              const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `buyonebd-orders-${new Date().toISOString().split('T')[0]}.csv`;
              document.body.appendChild(link);
              link.click();
              link.remove();
              URL.revokeObjectURL(url);
              addToast('success', at('CSV এক্সপোর্ট সম্পন্ন', 'CSV Exported'), `${filteredOrders.length} orders`);
            };

            return (
            <div className="space-y-4 animate-fade-in">
              {/* Top Header Row: Orders Title + Add new order + Sync + Export */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-black text-white">{at('অর্ডার ম্যানেজমেন্ট', 'Orders')}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setNewOrderForm((prev) => ({
                        ...prev,
                        productId: prev.productId || products[0]?.id || ''
                      }));
                      setIsAddOrderModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{at('নতুন অর্ডার যোগ করুন', 'Add new order')}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!isFirebaseAdminConnected ? (
                    <button
                      type="button"
                      onClick={() => signInAdminWithGoogle()}
                      className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{at('অন্য ডিভাইসের অর্ডার সিঙ্ক করুন', 'Enable Cross-Device Cloud Orders')}</span>
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{at('লাইভ ক্লাউড সিঙ্ক চালু', 'Live Cloud Active')}</span>
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={isSyncingOrders}
                    onClick={async () => {
                      setIsSyncingOrders(true);
                      await syncStoreFromServer();
                      setIsSyncingOrders(false);
                      addToast('success', at('সার্ভার থেকে সিঙ্ক সম্পন্ন', 'Synced with Server'), at('সকল ডিভাইসের সর্বশেষ অর্ডার লোড হয়েছে।', 'Fetched latest cross-device orders.'));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOrders ? 'animate-spin' : ''}`} />
                    <span>{at('সিঙ্ক করুন', 'Sync Orders')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportOrdersCsv}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* WooCommerce-Style Horizontal Status Filter Tabs with Counts */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs border-b border-slate-800 pb-3">
                {(
                  [
                    ['all', at('সকল', 'All'), statusCounts.all],
                    ['pending', at('পেন্ডিং', 'Pending payment'), statusCounts.pending],
                    ['ai_confirmed', at('এআই কনফার্মড', 'AI Confirmed'), statusCounts.ai_confirmed],
                    ['processing', at('প্রসেসিং', 'Processing'), statusCounts.processing],
                    ['on_hold', at('অন হোল্ড', 'On hold'), statusCounts.on_hold],
                    ['shipped', at('শিপড', 'Shipped'), statusCounts.shipped],
                    ['delivered', at('সম্পন্ন', 'Completed'), statusCounts.delivered],
                    ['cancelled', at('বাতিল', 'Cancelled'), statusCounts.cancelled],
                    ['partial', at('আংশিক পেমেন্ট', 'Partial Orders'), statusCounts.partial]
                  ] as const
                ).map(([key, label, count], idx) => (
                  <React.Fragment key={key}>
                    {idx > 0 && <span className="text-slate-700">|</span>}
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter(key);
                        setOrderPage(1);
                      }}
                      className={`cursor-pointer transition-colors ${
                        statusFilter === key
                          ? 'text-white font-black underline decoration-emerald-400 underline-offset-4'
                          : 'text-sky-400 hover:text-sky-300 font-semibold'
                      }`}
                    >
                      {label} <span className="text-slate-400 font-mono">({count})</span>
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* Bulk Actions, Date/Channel/Customer Filters & Search */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={bulkOrderAction}
                    onChange={(e) => setBulkOrderAction(e.target.value)}
                    className="py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="">{at('বাল্ক অ্যাকশন', 'Bulk actions')}</option>
                    <option value="processing">{at('প্রসেসিং করুন', 'Mark Processing')}</option>
                    <option value="on_hold">{at('অন হোল্ড করুন', 'Mark On Hold')}</option>
                    <option value="shipped">{at('শিপড করুন', 'Mark Shipped')}</option>
                    <option value="delivered">{at('ডেলিভারড / সম্পন্ন', 'Mark Completed')}</option>
                    <option value="cancelled">{at('বাতিল করুন', 'Mark Cancelled')}</option>
                    <option value="delete">{at('ডিলিট করুন', 'Move to Trash / Delete')}</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleApplyBulkOrders}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-400 font-bold cursor-pointer"
                  >
                    {at('প্রয়োগ', 'Apply')}
                  </button>

                  <select
                    value={orderDateFilter}
                    onChange={(e) => {
                      setOrderDateFilter(e.target.value as any);
                      setOrderPage(1);
                    }}
                    className="py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="all">{at('সকল তারিখ', 'All dates')}</option>
                    <option value="today">{at('আজকের অর্ডার', 'Today')}</option>
                    <option value="7d">{at('গত ৭ দিন', 'Last 7 days')}</option>
                    <option value="30d">{at('গত ৩০ দিন', 'Last 30 days')}</option>
                  </select>

                  <select
                    value={orderChannelFilter}
                    onChange={(e) => {
                      setOrderChannelFilter(e.target.value as any);
                      setOrderPage(1);
                    }}
                    className="py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="all">{at('সকল চ্যানেল', 'All channels')}</option>
                    <option value="online">{at('অনলাইন স্টোর', 'Online Store')}</option>
                    <option value="pos">{at('POS কাউন্টার', 'POS System')}</option>
                  </select>

                  <select
                    value={orderCustomerFilter}
                    onChange={(e) => {
                      setOrderCustomerFilter(e.target.value);
                      setOrderPage(1);
                    }}
                    className="py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 max-w-[180px]"
                  >
                    <option value="all">{at('গ্রাহক অনুযায়ী ফিল্টার...', 'Filter by registered customer')}</option>
                    {distinctCustomers.map(([ph, label]) => (
                      <option key={ph} value={ph}>
                        {label}
                      </option>
                    ))}
                  </select>

                  {(statusFilter !== 'all' || orderDateFilter !== 'all' || orderChannelFilter !== 'all' || orderCustomerFilter !== 'all' || orderSearch) && (
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('all');
                        setOrderDateFilter('all');
                        setOrderChannelFilter('all');
                        setOrderCustomerFilter('all');
                        setOrderSearch('');
                        setOrderPage(1);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold cursor-pointer"
                    >
                      {at('রিসেট', 'Reset Filter')}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => {
                        setOrderSearch(e.target.value);
                        setOrderPage(1);
                      }}
                      placeholder={at('অর্ডার আইডি / নাম / ফোন...', 'Search orders...')}
                      className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 w-48"
                    />
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 font-mono">
                    <span>{filteredOrders.length} items</span>
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 disabled:opacity-40 cursor-pointer"
                    >
                      ‹
                    </button>
                    <span className="px-1.5 text-white font-bold">
                      {safePage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setOrderPage((p) => Math.min(totalPages, p + 1))}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 disabled:opacity-40 cursor-pointer"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>

              {/* WooCommerce / Steadfast Orders Table */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-sky-400 text-[11px] font-bold border-b border-slate-800 whitespace-nowrap">
                      <tr>
                        <th className="py-3 px-3 w-8">
                          <input
                            type="checkbox"
                            checked={allPageSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...paginatedOrders.map((o) => o.id)])));
                              } else {
                                const pageSet = new Set(paginatedOrders.map((o) => o.id));
                                setSelectedOrderIds((prev) => prev.filter((id) => !pageSet.has(id)));
                              }
                            }}
                            className="w-4 h-4 accent-emerald-500 cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-3">{at('অর্ডার', 'Order')}</th>
                        <th className="py-3 px-3">{at('তারিখ', 'Date')}</th>
                        <th className="py-3 px-3">{at('স্ট্যাটাস', 'Status')}</th>
                        <th className="py-3 px-3">{at('মোট বিল', 'Total')}</th>
                        <th className="py-3 px-3">{at('সকল কুরিয়ারে পাঠান', 'Send to Courier')}</th>
                        <th className="py-3 px-3">{at('ইনভয়েস', 'Invoice')}</th>
                        <th className="py-3 px-3">{at('কনসাইনমেন্ট আইডি', 'ConsignmentID')}</th>
                        <th className="py-3 px-3">{at('ডেলিভারি স্ট্যাটাস', 'DeliveryStatus')}</th>
                        <th className="py-3 px-3">{at('স্কোর', 'Score')}</th>
                        <th className="py-3 px-3">{at('আংশিক / অ্যাকশন', 'Partial & Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {paginatedOrders.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-10 text-center text-slate-500">
                            {at('এই ফিল্টারে কোনো অর্ডার পাওয়া যায়নি।', 'No orders match the current filters.')}
                          </td>
                        </tr>
                      ) : (
                        paginatedOrders.map((ord) => {
                          const isChecked = selectedOrderIds.includes(ord.id);
                          const isBooked = Boolean(ord.courier?.trackingCode);
                          const cleanPhone = ord.customer.phone.replace(/[^0-9]/g, '');
                          const waPhone = cleanPhone.startsWith('88') ? cleanPhone : '88' + cleanPhone;
                          const createdDate = new Date(ord.createdAt);
                          const dateStr = isNaN(createdDate.getTime())
                            ? ord.createdAt
                            : createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                          const hasPartial = ord.status === 'partial' || ((ord.pricing.advancePaid || 0) > 0 && (ord.payment.dueAmount || 0) > 0);
                          const selectedCourier: CourierProvider = rowCourierChoice[ord.id] || ord.courier?.provider || 'Steadfast';

                          return (
                            <tr key={ord.id} className={`hover:bg-slate-800/40 ${isChecked ? 'bg-emerald-950/20' : ''}`}>
                              <td className="py-3 px-3">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedOrderIds((prev) => [...prev, ord.id]);
                                    } else {
                                      setSelectedOrderIds((prev) => prev.filter((id) => id !== ord.id));
                                    }
                                  }}
                                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-3 min-w-[170px]">
                                <div className="flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrderDetails(ord)}
                                    className="font-bold text-sky-400 hover:underline text-left cursor-pointer"
                                  >
                                    #{ord.id} {ord.customer.name}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrderDetails(ord)}
                                    title={at('অর্ডার প্রিভিউ', 'Preview Order')}
                                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="text-[10px] font-mono text-slate-400">{ord.customer.phone}</div>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap text-slate-400 text-[11px]">{dateStr}</td>
                              <td className="py-3 px-3">
                                <select
                                  value={ord.status}
                                  onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                                  className={`py-1 px-2 rounded-lg border text-[11px] font-bold cursor-pointer focus:outline-none ${
                                    ord.status === 'delivered'
                                      ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                                      : ord.status === 'on_hold' || ord.status === 'partial'
                                      ? 'bg-amber-950/60 border-amber-700 text-amber-300'
                                      : ord.status === 'cancelled'
                                      ? 'bg-rose-950/60 border-rose-700 text-rose-300'
                                      : 'bg-slate-950 border-slate-700 text-sky-300'
                                  }`}
                                >
                                  <option value="pending">{at('পেন্ডিং', 'Pending')}</option>
                                  <option value="ai_confirmed">{at('এআই কনফার্মড', 'AI Confirmed')}</option>
                                  <option value="processing">{at('প্রসেসিং', 'Processing')}</option>
                                  <option value="partial">{at('আংশিক অর্ডার', 'Partial Order')}</option>
                                  <option value="on_hold">{at('অন হোল্ড', 'On hold')}</option>
                                  <option value="shipped">{at('শিপড', 'Shipped')}</option>
                                  <option value="delivered">{at('সম্পন্ন', 'Completed')}</option>
                                  <option value="cancelled">{at('বাতিল', 'Cancelled')}</option>
                                </select>
                              </td>
                              <td className="py-3 px-3 font-mono font-black text-white whitespace-nowrap">
                                ৳{ord.pricing.total.toLocaleString()}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <select
                                      value={selectedCourier}
                                      onChange={(e) =>
                                        setRowCourierChoice((prev) => ({
                                          ...prev,
                                          [ord.id]: e.target.value as CourierProvider
                                        }))
                                      }
                                      className="py-1 px-1.5 rounded-md bg-slate-950 border border-slate-700 text-[11px] font-bold text-slate-200"
                                      title={at('কুরিয়ার বেছে নিন', 'Select Courier')}
                                    >
                                      {(['Steadfast', 'Pathao', 'RedX', 'Paperfly', 'Sundarban'] as CourierProvider[]).map((prov) => (
                                        <option key={prov} value={prov}>{prov}</option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      disabled={isBookingSteadfast === ord.id}
                                      onClick={() => handleBookCourier(ord.id, selectedCourier)}
                                      className={`px-2.5 py-1 rounded-md font-bold text-[11px] cursor-pointer transition-colors ${
                                        isBooked && ord.courier?.provider === selectedCourier
                                          ? 'bg-emerald-600/20 border border-emerald-500/60 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                      }`}
                                      title={at(`${selectedCourier}-এ পাঠান`, `Send to ${selectedCourier}`)}
                                    >
                                      {isBookingSteadfast === ord.id
                                        ? '...'
                                        : isBooked && ord.courier?.provider === selectedCourier
                                        ? `Success (${selectedCourier})`
                                        : 'Send'}
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {(
                                      [
                                        ['Steadfast', 'SF'],
                                        ['Pathao', 'PT'],
                                        ['RedX', 'RX'],
                                        ['Paperfly', 'PF'],
                                        ['Sundarban', 'SB']
                                      ] as [CourierProvider, string][]
                                    ).map(([prov, shortCode]) => (
                                      <button
                                        key={prov}
                                        type="button"
                                        disabled={isBookingSteadfast === ord.id}
                                        onClick={() => {
                                          setRowCourierChoice((prev) => ({ ...prev, [ord.id]: prov }));
                                          handleBookCourier(ord.id, prov);
                                        }}
                                        title={`Send to ${prov}`}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer border transition-colors ${
                                          ord.courier?.provider === prov && isBooked
                                            ? 'bg-emerald-600 text-white border-emerald-500'
                                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-sky-500 hover:text-sky-300'
                                        }`}
                                      >
                                        {shortCode}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderDetails(ord)}
                                  className="px-2.5 py-1 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Printer className="w-3 h-3" />
                                  <span>Print</span>
                                </button>
                              </td>
                              <td className="py-3 px-3 font-mono text-[11px] text-emerald-400 font-bold whitespace-nowrap">
                                {ord.courier?.trackingCode || '—'}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] capitalize text-slate-300">
                                    {(ord.courier?.status || 'pending').replace('_', ' ')}
                                  </span>
                                  <button
                                    type="button"
                                    disabled={isCheckingCourierStatus === ord.id}
                                    onClick={async () => {
                                      setIsCheckingCourierStatus(ord.id);
                                      await checkSteadfastDeliveryStatus(ord.id);
                                      setIsCheckingCourierStatus(null);
                                    }}
                                    className="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] cursor-pointer"
                                  >
                                    {isCheckingCourierStatus === ord.id ? '...' : 'Check'}
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`font-mono font-bold text-[11px] ${
                                      (ord.fraudCheck?.successRate || 90) >= 80 ? 'text-emerald-400' : 'text-rose-400'
                                    }`}
                                  >
                                    {ord.fraudCheck?.successRate ? `${ord.fraudCheck.successRate}%` : '—'}
                                  </span>
                                  <button
                                    type="button"
                                    disabled={isRefreshingScore === ord.id}
                                    onClick={async () => {
                                      setIsRefreshingScore(ord.id);
                                      await refreshOrderScore(ord.id);
                                      setIsRefreshingScore(null);
                                    }}
                                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-400 font-bold text-[10px] cursor-pointer"
                                  >
                                    {isRefreshingScore === ord.id ? '...' : 'Refresh'}
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  {hasPartial ? (
                                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                      Partial (Due ৳{ord.payment.dueAmount})
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 mr-1">{ord.payment.method.toUpperCase()}</span>
                                  )}
                                  <a
                                    href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                      `আসসালামু আলাইকুম ${ord.customer.name},\nBuyOne BD থেকে আপনার অর্ডার #${ord.id} (৳${ord.pricing.total}) কনফার্ম করা হয়েছে। ট্র্যাকিং: ${ord.courier?.trackingCode || 'প্রক্রিয়াধীন'}`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300"
                                    title="WhatsApp"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => setEditingOrder(ord)}
                                    title={at('এডিট', 'Edit')}
                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => startAICall(ord)}
                                    title={at('AI কল', 'AI Call')}
                                    className="p-1 rounded bg-slate-800 hover:bg-emerald-900 text-emerald-300 cursor-pointer"
                                  >
                                    <PhoneCall className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteOrder(ord.id)}
                                    title={at('মুছে ফেলুন', 'Delete')}
                                    className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            );
          })()}

          {/* TAB 2B: POS & 1-CLICK BARCODE SYSTEM */}
          {activeTab === 'pos_system' && (() => {
            const getProdBarcode = (p: Product) =>
              p.barcode || `880${p.id.replace(/\D/g, '').padStart(9, '0').slice(-9)}`;

            const todayPosOrders = orders.filter(
              (o) => o.source === 'pos' && new Date(o.createdAt).toDateString() === new Date().toDateString()
            );
            const todayPosRevenue = todayPosOrders.reduce((s, o) => s + o.pricing.total, 0);

            const addProductToPos = (prod: Product) => {
              setPosCart((prev) => {
                const existing = prev.find((item) => item.product.id === prod.id);
                if (existing) {
                  return prev.map((item) =>
                    item.product.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item
                  );
                }
                return [
                  ...prev,
                  {
                    product: prod,
                    quantity: 1,
                    unitPrice: prod.price,
                    selectedColor: prod.colors?.[0],
                    selectedSize: prod.sizes?.[0]
                  }
                ];
              });
            };

            const handleAddCustomPosItem = (e: React.FormEvent) => {
              e.preventDefault();
              const cleanName = posCustomItemName.trim();
              const cleanPrice = Math.max(0, Number(posCustomItemPrice) || 0);
              if (!cleanName || cleanPrice <= 0) return;
              const customId = `CUSTOM-${Date.now()}`;
              const pseudoProd: Product = {
                id: customId,
                title: cleanName,
                titleBn: cleanName,
                description: 'POS Custom Counter Item',
                descriptionBn: 'কাস্টম POS পণ্য',
                price: cleanPrice,
                originalPrice: cleanPrice,
                stock: 999,
                category: 'pos-custom',
                categoryBn: 'POS কাস্টম',
                images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
                sku: `POS-${Date.now().toString().slice(-4)}`,
                tags: ['POS Custom'],
                rating: 5,
                reviewsCount: 0
              };
              setPosCart((prev) => [...prev, { product: pseudoProd, quantity: 1, unitPrice: cleanPrice }]);
              setPosCustomItemName('');
              setPosCustomItemPrice('');
            };

            const handleHoldCurrentPosBill = () => {
              if (posCart.length === 0) return;
              const pickedAcc = customerAccounts.find((a) => (a.phone || a.email || a.username) === posSelectedCustomerId);
              const custName = pickedAcc ? pickedAcc.name : posWalkInName.trim() || 'Walk-in Customer';
              const custPhone = pickedAcc ? pickedAcc.phone : posWalkInPhone.trim() || '01700000000';
              setPosHeldOrders((prev) => [
                {
                  id: `HOLD-${Date.now().toString().slice(-4)}`,
                  customerName: custName,
                  customerPhone: custPhone,
                  items: posCart,
                  discount: posDiscount,
                  discountType: posDiscountType,
                  deliveryFee: posDeliveryFee,
                  heldAt: new Date().toLocaleTimeString()
                },
                ...prev
              ]);
              setPosCart([]);
              setPosDiscount(0);
              setPosDeliveryFee(0);
              setPosPaidAmount('');
              addToast('info', at('বিল হোল্ড করা হয়েছে', 'Bill Put on Hold'), custName);
            };

            const handleBarcodeEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              const code = posBarcodeInput.trim().toLowerCase();
              if (!code) return;
              const matched = products.find(
                (p) =>
                  getProdBarcode(p).toLowerCase() === code ||
                  p.sku.toLowerCase() === code ||
                  p.id.toLowerCase() === code ||
                  p.title.toLowerCase().includes(code) ||
                  p.titleBn.toLowerCase().includes(code)
              );
              if (matched) {
                addProductToPos(matched);
                setPosBarcodeInput('');
                addToast('success', at('বারকোড স্ক্যান সফল!', 'Barcode Scanned!'), `${at(matched.titleBn, matched.title)} (+1)`);
              } else {
                addToast('error', at('বারকোড পাওয়া যায়নি', 'Barcode Not Found'), posBarcodeInput);
              }
            };

            const posFilteredProducts = products.filter((p) => {
              const q = posSearch.trim().toLowerCase();
              if (!q) return true;
              return (
                p.title.toLowerCase().includes(q) ||
                p.titleBn.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q) ||
                getProdBarcode(p).toLowerCase().includes(q)
              );
            });

            const posSubtotal = posCart.reduce(
              (sum, item) => sum + (item.unitPrice ?? item.product.price) * item.quantity,
              0
            );
            const posDiscountAmount =
              posDiscountType === 'percent'
                ? Math.round(posSubtotal * (Math.min(100, Math.max(0, posDiscount || 0)) / 100))
                : Math.max(0, posDiscount || 0);
            const posTotal = Math.max(0, posSubtotal + (posDeliveryFee || 0) - posDiscountAmount);
            const paidNum = posPaidAmount === '' ? posTotal : Math.max(0, Number(posPaidAmount) || 0);
            const changeReturn = Math.max(0, paidNum - posTotal);
            const dueRemaining = Math.max(0, posTotal - paidNum);

            const handleCompletePosSale = () => {
              if (posCart.length === 0) {
                addToast('warning', at('পস কার্ট খালি', 'POS Cart Empty'), at('প্রথমে বারকোড স্ক্যান করে বা ক্লিক করে পণ্য যোগ করুন।', 'Scan or click a product barcode first.'));
                return;
              }
              const pickedAcc = customerAccounts.find((a) => (a.phone || a.email || a.username) === posSelectedCustomerId);
              const custName = pickedAcc ? pickedAcc.name : posWalkInName.trim() || 'Walk-in POS Customer';
              const custPhone = pickedAcc ? pickedAcc.phone : posWalkInPhone.trim() || '01700000000';
              const newOrder = createOrder({
                customer: {
                  name: custName,
                  phone: custPhone,
                  address: 'POS Counter / In-Store Pickup',
                  district: 'Dhaka - Inside City',
                  thana: 'POS Counter',
                  note: `POS Sale (${posPaymentMethod.toUpperCase()})`
                },
                items: posCart.map((c) => ({
                  product:
                    c.unitPrice !== undefined && c.unitPrice !== c.product.price
                      ? { ...c.product, price: c.unitPrice }
                      : c.product,
                  quantity: c.quantity,
                  selectedColor: c.selectedColor,
                  selectedSize: c.selectedSize
                })),
                paymentMethod: posPaymentMethod,
                deliveryZone: 'dhaka_inside',
                customDeliveryFee: posDeliveryFee || 0,
                discountAmount: posDiscountAmount,
                advancePaid: paidNum < posTotal ? paidNum : undefined,
                source: 'pos',
                initialStatus: dueRemaining > 0 ? 'partial' : 'delivered',
                skipAICall: true
              });
              setPosReceiptOrder(newOrder);
              setPosCart([]);
              setPosDiscount(0);
              setPosDeliveryFee(0);
              setPosPaidAmount('');
            };

            return (
              <div className="space-y-5 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <Barcode className="w-6 h-6 text-emerald-400" />
                      <span>{at('পস সিস্টেম ও ১-ক্লিক বারকোড বিলিং', 'Full POS & 1-Click Barcode Billing')}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {at('বারকোড স্ক্যান, ভ্যারিয়েন্ট নির্বাচন, কাস্টম আইটেম, হোল্ড বিল ও ৮০মিমি প্রিন্টেবল রিসিট', 'Scan barcodes, adjust prices/variants, hold draft bills & print thermal 80mm receipts')}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                      {at('আজকের POS বিল:', 'Today POS:')}{' '}
                      <strong className="text-white">{todayPosOrders.length}</strong>
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 font-mono font-bold">
                      ৳{todayPosRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Held Draft Bills Strip */}
                {posHeldOrders.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-700/40 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-amber-300">{at('হোল্ডকৃত বিলসমূহ:', 'Held Draft Bills:')}</span>
                    {posHeldOrders.map((h) => (
                      <div key={h.id} className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1">
                        <span className="font-bold text-white">{h.customerName}</span>
                        <span className="text-[10px] text-slate-400">({h.items.length} items · {h.heldAt})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setPosCart(h.items);
                            setPosWalkInName(h.customerName);
                            setPosWalkInPhone(h.customerPhone);
                            setPosDiscount(h.discount);
                            setPosDiscountType(h.discountType);
                            setPosDeliveryFee(h.deliveryFee);
                            setPosHeldOrders((prev) => prev.filter((x) => x.id !== h.id));
                          }}
                          className="ml-1 px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] cursor-pointer"
                        >
                          {at('খুলুন', 'Resume')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPosHeldOrders((prev) => prev.filter((x) => x.id !== h.id))}
                          className="text-rose-400 hover:text-rose-300 font-bold px-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Barcode Scanner + Search Bar */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-400 mb-1">
                      {at('বারকোড / SKU স্ক্যান ইনপুট (Enter চাপুন)', 'Barcode / SKU Scanner Input (Press Enter)')}
                    </label>
                    <div className="relative">
                      <Barcode className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={posBarcodeInput}
                        onChange={(e) => setPosBarcodeInput(e.target.value)}
                        onKeyDown={handleBarcodeEnter}
                        placeholder={at('স্ক্যানার দিয়ে স্ক্যান করুন বা 880... / PROD-... লিখে Enter দিন', 'Scan barcode or type 880... / SKU & press Enter')}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-white font-mono outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      {at('দ্রুত পণ্য খুঁজুন', 'Quick Filter Products')}
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={posSearch}
                        onChange={(e) => setPosSearch(e.target.value)}
                        placeholder={at('নাম, SKU বা বারকোড দিয়ে খুঁজুন...', 'Search name, SKU or barcode...')}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Split Workspace: 1-Click Barcode Catalog + POS Billing Cart */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left 7 Cols: Custom Item + 1-Click Barcode Product Grid */}
                  <div className="lg:col-span-7 space-y-3">
                    <form
                      onSubmit={handleAddCustomPosItem}
                      className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-2 text-xs"
                    >
                      <span className="font-bold text-sky-400">{at('কাস্টম আইটেম:', 'Quick Custom Item:')}</span>
                      <input
                        type="text"
                        value={posCustomItemName}
                        onChange={(e) => setPosCustomItemName(e.target.value)}
                        placeholder={at('পণ্যের নাম / সার্ভিস', 'Item / Service name')}
                        className="flex-1 min-w-[140px] px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                      <input
                        type="number"
                        min={1}
                        value={posCustomItemPrice}
                        onChange={(e) => setPosCustomItemPrice(e.target.value)}
                        placeholder="৳ Price"
                        className="w-24 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer"
                      >
                        + {at('যোগ করুন', 'Add')}
                      </button>
                    </form>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                      {posFilteredProducts.map((prod) => {
                        const bcode = getProdBarcode(prod);
                        return (
                          <div
                            key={`pos-${prod.id}`}
                            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-3"
                          >
                            <div className="flex items-start gap-3">
                              <img src={prod.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-white line-clamp-1">{at(prod.titleBn, prod.title)}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-sm font-black text-emerald-400 font-mono">৳{prod.price.toLocaleString()}</span>
                                  <span className="text-[10px] text-slate-400">Stock: {prod.stock}</span>
                                </div>
                                <p className="text-[10px] font-mono text-slate-400 truncate">SKU: {prod.sku}</p>
                              </div>
                            </div>

                            {/* Visual Barcode Chip + 1-Click Actions */}
                            <div className="p-2 rounded-xl bg-white text-slate-900 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <svg viewBox="0 0 120 24" className="w-28 h-5">
                                  {[2, 6, 9, 14, 18, 23, 26, 31, 35, 38, 43, 47, 52, 56, 61, 65, 70, 74, 79, 83, 88, 92, 97, 102, 107, 113].map((x, idx) => (
                                    <rect key={x} x={x} y={1} width={idx % 3 === 0 ? 3 : 1.5} height={22} fill="#0f172a" />
                                  ))}
                                </svg>
                                <span className="block text-[9px] font-mono font-bold tracking-widest text-slate-700">{bcode}</span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setPrintableBarcodeProduct(prod)}
                                  title={at('বারকোড লেবেল প্রিন্ট', 'Print Barcode Label')}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => addProductToPos(prod)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>{at('স্ক্যান', 'Add')}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right 5 Cols: POS Checkout Register */}
                  <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 h-fit sticky top-20">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="font-black text-white text-sm flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-emerald-400" />
                        <span>{at('পস ক্যাশ রেজিস্টার', 'POS Billing Cart')}</span>
                      </h4>
                      {posCart.length > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleHoldCurrentPosBill}
                            className="px-2 py-1 rounded bg-amber-950/70 border border-amber-700/60 text-amber-300 font-bold text-[10px] cursor-pointer"
                          >
                            {at('বিল হোল্ড', 'Hold Bill')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPosCart([])}
                            className="text-[11px] font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
                          >
                            {at('খালি করুন', 'Clear')}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Customer Picker */}
                    <div className="space-y-2 text-xs">
                      <label className="block text-slate-300 font-bold">{at('কাস্টমার নির্বাচন করুন', 'Select Customer')}</label>
                      <select
                        value={posSelectedCustomerId}
                        onChange={(e) => setPosSelectedCustomerId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      >
                        <option value="walk-in">{at('ওয়াক-ইন কাস্টমার (Walk-in)', 'Walk-in Counter Customer')}</option>
                        {customerAccounts.map((acc, idx) => {
                          const key = acc.phone || acc.email || acc.username || String(idx);
                          return (
                            <option key={key} value={key}>
                              {acc.name} ({acc.phone}) — ৳{acc.walletBalance}
                            </option>
                          );
                        })}
                      </select>

                      {posSelectedCustomerId === 'walk-in' && (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={posWalkInName}
                            onChange={(e) => setPosWalkInName(e.target.value)}
                            placeholder={at('ক্রেতার নাম', 'Customer Name')}
                            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                          />
                          <input
                            type="text"
                            value={posWalkInPhone}
                            onChange={(e) => setPosWalkInPhone(e.target.value)}
                            placeholder="017XXXXXXXX"
                            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                          />
                        </div>
                      )}
                    </div>

                    {/* Cart Items with Inline Price Edit & Variant Selectors */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {posCart.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded-xl">
                          {at('বাম দিক থেকে বারকোড স্ক্যান বা ক্লিক করে পণ্য যোগ করুন', 'Click "+ Add" on any barcode card or scan to start billing')}
                        </p>
                      ) : (
                        posCart.map((item) => {
                          const effectivePrice = item.unitPrice ?? item.product.price;
                          return (
                          <div key={item.product.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-white truncate">{at(item.product.titleBn, item.product.title)}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[10px] text-slate-400">৳</span>
                                  <input
                                    type="number"
                                    min={0}
                                    value={effectivePrice}
                                    onChange={(e) => {
                                      const v = Math.max(0, Number(e.target.value) || 0);
                                      setPosCart((prev) =>
                                        prev.map((c) => (c.product.id === item.product.id ? { ...c, unitPrice: v } : c))
                                      );
                                    }}
                                    className="w-16 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-[11px] font-mono text-emerald-400"
                                  />
                                  <span className="text-[10px] font-mono text-slate-400">
                                    × {item.quantity} = <strong className="text-emerald-400">৳{(effectivePrice * item.quantity).toLocaleString()}</strong>
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPosCart((prev) =>
                                      prev
                                        .map((c) => (c.product.id === item.product.id ? { ...c, quantity: c.quantity - 1 } : c))
                                        .filter((c) => c.quantity > 0)
                                    )
                                  }
                                  className="w-6 h-6 rounded bg-slate-800 text-white font-bold cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-mono font-bold text-white">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPosCart((prev) =>
                                      prev.map((c) => (c.product.id === item.product.id ? { ...c, quantity: c.quantity + 1 } : c))
                                    )
                                  }
                                  className="w-6 h-6 rounded bg-slate-800 text-white font-bold cursor-pointer"
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPosCart((prev) => prev.filter((c) => c.product.id !== item.product.id))}
                                  className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {(item.product.colors?.length || item.product.sizes?.length) ? (
                              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/80">
                                {item.product.colors && item.product.colors.length > 0 && (
                                  <select
                                    value={item.selectedColor || item.product.colors[0]}
                                    onChange={(e) =>
                                      setPosCart((prev) =>
                                        prev.map((c) => (c.product.id === item.product.id ? { ...c, selectedColor: e.target.value } : c))
                                      )
                                    }
                                    className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300"
                                  >
                                    {item.product.colors.map((clr) => (
                                      <option key={clr} value={clr}>{clr}</option>
                                    ))}
                                  </select>
                                )}
                                {item.product.sizes && item.product.sizes.length > 0 && (
                                  <select
                                    value={item.selectedSize || item.product.sizes[0]}
                                    onChange={(e) =>
                                      setPosCart((prev) =>
                                        prev.map((c) => (c.product.id === item.product.id ? { ...c, selectedSize: e.target.value } : c))
                                      )
                                    }
                                    className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300"
                                  >
                                    {item.product.sizes.map((sz) => (
                                      <option key={sz} value={sz}>{sz}</option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            ) : null}
                          </div>
                          );
                        })
                      )}
                    </div>

                    {/* Discount (% / ৳), Delivery & Paid Amount */}
                    <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-400 font-bold text-[10px]">{at('ডিসকাউন্ট', 'Discount')}</label>
                          <button
                            type="button"
                            onClick={() => setPosDiscountType((tMode) => (tMode === 'fixed' ? 'percent' : 'fixed'))}
                            className="px-1.5 rounded bg-slate-800 text-[10px] font-mono text-amber-300 cursor-pointer"
                          >
                            {posDiscountType === 'percent' ? '%' : '৳'}
                          </button>
                        </div>
                        <input
                          type="number"
                          min={0}
                          value={posDiscount}
                          onChange={(e) => setPosDiscount(Math.max(0, Number(e.target.value)))}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold text-[10px] mb-1">{at('ডেলিভারি (৳)', 'Fee (৳)')}</label>
                        <input
                          type="number"
                          min={0}
                          value={posDeliveryFee}
                          onChange={(e) => setPosDeliveryFee(Math.max(0, Number(e.target.value)))}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold text-[10px] mb-1">{at('নগদ জমা (৳)', 'Paid Cash (৳)')}</label>
                        <input
                          type="number"
                          min={0}
                          placeholder={`${posTotal}`}
                          value={posPaidAmount}
                          onChange={(e) => setPosPaidAmount(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-300 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 font-bold mb-1.5">{at('পেমেন্ট মেথড', 'Payment Method')}</label>
                      <div className="grid grid-cols-4 gap-1.5 text-[11px] font-bold">
                        {(['cash', 'bkash', 'nagad', 'card'] as const).map((pm) => (
                          <button
                            key={pm}
                            type="button"
                            onClick={() => setPosPaymentMethod(pm)}
                            className={`py-2 rounded-xl border uppercase cursor-pointer ${
                              posPaymentMethod === pm
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'bg-slate-950 border-slate-800 text-slate-300'
                            }`}
                          >
                            {pm}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Totals & Change / Due Calculator */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Subtotal:</span>
                        <span>৳{posSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Delivery / Fee:</span>
                        <span>+৳{(posDeliveryFee || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-rose-400">
                        <span>Discount {posDiscountType === 'percent' ? `(${posDiscount}%)` : ''}:</span>
                        <span>-৳{posDiscountAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-base font-black text-emerald-400 pt-1 border-t border-slate-800">
                        <span>TOTAL PAYABLE:</span>
                        <span>৳{posTotal.toLocaleString()}</span>
                      </div>
                      {posPaidAmount !== '' && (
                        <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800/60">
                          <span className={changeReturn > 0 ? 'text-sky-400 font-bold' : 'text-amber-400 font-bold'}>
                            {changeReturn > 0 ? at('ফেরত (Change):', 'Change Return:') : at('বাকি (Due):', 'Balance Due:')}
                          </span>
                          <span className={changeReturn > 0 ? 'text-sky-300 font-black' : 'text-amber-300 font-black'}>
                            ৳{(changeReturn > 0 ? changeReturn : dueRemaining).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleCompletePosSale}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{at('১ ক্লিকে POS সেল সম্পন্ন ও রিসিট প্রিন্ট', '1-Click Complete Sale & Receipt')}</span>
                    </button>
                  </div>
                </div>

                {/* Printable 80mm POS Receipt Modal */}
                {posReceiptOrder && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-white text-slate-900 rounded-2xl p-6 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div>
                          <h4 className="font-black text-base">{settings.storeName} — POS RECEIPT</h4>
                          <p className="text-[11px] font-mono text-slate-500">Invoice #{posReceiptOrder.id}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPosReceiptOrder(null)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs space-y-1">
                        <p><strong>Customer:</strong> {posReceiptOrder.customer.name} ({posReceiptOrder.customer.phone})</p>
                        <p><strong>Date:</strong> {new Date(posReceiptOrder.createdAt).toLocaleString()}</p>
                        <p><strong>Method:</strong> {posReceiptOrder.payment.method.toUpperCase()}</p>
                      </div>
                      <div className="border-y border-dashed border-slate-300 py-2 space-y-1 text-xs">
                        {posReceiptOrder.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="truncate max-w-[190px]">
                              {it.productTitleBn}
                              {it.selectedColor ? ` (${it.selectedColor})` : ''} ×{it.quantity}
                            </span>
                            <span className="font-mono font-bold">৳{(it.price * it.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs font-mono space-y-1">
                        <div className="flex justify-between"><span>Subtotal:</span><span>৳{posReceiptOrder.pricing.subtotal.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Discount:</span><span>-৳{posReceiptOrder.pricing.discount.toLocaleString()}</span></div>
                        <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-200">
                          <span>PAID TOTAL:</span><span>৳{posReceiptOrder.pricing.total.toLocaleString()}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>{at('রিসিট প্রিন্ট করুন', 'Print 80mm Receipt')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Printable Product Barcode Label Modal */}
                {printableBarcodeProduct && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="w-full max-w-xs bg-white text-slate-900 rounded-2xl p-5 shadow-2xl text-center space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Barcode Sticker Label</span>
                        <button
                          type="button"
                          onClick={() => setPrintableBarcodeProduct(null)}
                          className="p-1 rounded bg-slate-100 text-slate-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl space-y-1">
                        <p className="text-xs font-black truncate">{printableBarcodeProduct.titleBn}</p>
                        <p className="text-sm font-black text-emerald-700 font-mono">৳{printableBarcodeProduct.price.toLocaleString()}</p>
                        <svg viewBox="0 0 180 42" className="w-48 h-10 mx-auto">
                          {Array.from({ length: 42 }).map((_, i) => (
                            <rect key={i} x={i * 4.2 + 2} y={2} width={i % 4 === 0 ? 3 : 1.5} height={38} fill="#0f172a" />
                          ))}
                        </svg>
                        <p className="text-xs font-mono font-bold tracking-widest">{getProdBarcode(printableBarcodeProduct)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>{at('বারকোড লেবেল প্রিন্ট', 'Print Sticker')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 3: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">{at('পণ্য তালিকা', 'Product Catalog')}</h3>
                  <p className="text-xs text-slate-400">{at('পণ্য যোগ, এডিট, স্টক পরিচালনা ও সরাসরি ফ্ল্যাশ সেল নির্ধারণ', 'Add, edit, manage stock, and toggle flash sale status directly')}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `buyonebd-products-${Date.now()}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                      addToast('success', 'এক্সপোর্ট সফল!', `${products.length} টি পণ্যের ডেটা ডাউনলোড হয়েছে।`);
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{at('এক্সপোর্ট (JSON)', 'Export')}</span>
                  </button>

                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{at('ইমপোর্ট (JSON)', 'Import')}</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const imported = JSON.parse(event.target?.result as string);
                            if (Array.isArray(imported)) {
                              imported.forEach((p) => {
                                if (p.title && p.price) addProduct(p);
                              });
                              addToast('success', 'ইমপোর্ট সম্পন্ন!', `${imported.length} টি পণ্য যোগ হয়েছে।`);
                            }
                          } catch {
                            addToast('error', 'ভুল ফাইল ফরম্যাট', 'সঠিক JSON ফাইল সিলেক্ট করুন।');
                          }
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>

                  <button
                    onClick={openNewProductModal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{at('নতুন পণ্য যোগ করুন', 'Add New Product')}</span>
                  </button>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((prod) => (
                  <div key={prod.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                        <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="overflow-hidden flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{at(prod.categoryBn, prod.category)}</span>
                          {prod.subcategory && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{prod.subcategory}</span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-white line-clamp-1">{at(prod.titleBn, prod.title)}</h4>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-black text-sm text-emerald-400">৳ {prod.price.toLocaleString()}</span>
                          <span className="text-xs text-slate-500 line-through">৳ {prod.originalPrice.toLocaleString()}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {at(`স্টক: ${prod.stock} টি • SKU: ${prod.sku}`, `Stock: ${prod.stock} • SKU: ${prod.sku}`)}
                          {prod.seo?.slug && ` • /product/${prod.seo.slug}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                      {/* Direct 1-Click Flash Sale Toggle */}
                      <button
                        onClick={() => toggleProductFlashSale(prod.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all border ${
                          prod.isFlashSale
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                        }`}
                        title={at('ফ্ল্যাশ সেল অন/অফ করতে ক্লিক করুন', 'Click to toggle Flash Sale')}
                      >
                        {prod.isFlashSale ? at('🔥 ফ্ল্যাশ সেল সক্রিয়', '🔥 Flash Sale Active') : at('+ ফ্ল্যাশ সেলে যোগ', '+ Add to Flash')}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditProductModal(prod)}
                          title={at('পণ্য এডিট করুন', 'Edit Product')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {/* Direct Delete - No blocking confirm */}
                        <button
                          onClick={() => {
                            deleteProduct(prod.id);
                          }}
                          title={at('পণ্য মুছে ফেলুন', 'Delete Product')}
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">{at('ক্যাটাগরি ম্যানেজমেন্ট', 'Category Management')}</h3>
                  <p className="text-xs text-slate-400">{at('ক্যাটাগরি তৈরি, এডিট, সক্রিয়/নিষ্ক্রিয় এবং সরাসরি ডিলিট করুন', 'Create, edit, toggle active status, and delete categories')}</p>
                </div>
                <button
                  onClick={openNewCategoryModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{at('নতুন ক্যাটাগরি তৈরি করুন', 'Add Category')}</span>
                </button>
              </div>

              {/* Categories Table */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">{at('আইকন ছবি', 'Icon Photo')}</th>
                        <th className="py-3 px-4">{at('বাংলা নাম', 'Bangla Name')}</th>
                        <th className="py-3 px-4">{at('ইংরেজি নাম', 'English Name')}</th>
                        <th className="py-3 px-4">{at('স্লাগ (Slug)', 'Slug')}</th>
                        <th className="py-3 px-4">{at('পণ্যের সংখ্যা', 'Products Count')}</th>
                        <th className="py-3 px-4">{at('স্ট্যাটাস', 'Status')}</th>
                        <th className="py-3 px-4 text-right">{at('অ্যাকশন', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {categories.map((cat) => {
                        const count = products.filter((p) => p.category === cat.slug).length;
                        return (
                          <tr key={cat.id} className="hover:bg-slate-800/40">
                            <td className="py-3.5 px-4">
                              {cat.iconImage ? (
                                <img
                                  src={cat.iconImage}
                                  alt={cat.nameEn}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-950"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                                  {(cat.nameBn || cat.nameEn || 'C').charAt(0)}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-white">{cat.nameBn}</td>
                            <td className="py-3.5 px-4">{cat.nameEn}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-400">{cat.slug}</td>
                            <td className="py-3.5 px-4 font-bold text-emerald-400">{count} {at('টি', 'Items')}</td>
                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => toggleCategoryActive(cat.id)}
                                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                                  cat.isActive
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                                }`}
                              >
                                {cat.isActive ? at('সক্রিয়', 'Active') : at('নিষ্ক্রিয়', 'Inactive')}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditCategoryModal(cat)}
                                  title={at('ক্যাটাগরি এডিট করুন', 'Edit Category')}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                {/* Direct Delete - No blocking confirm */}
                                <button
                                  onClick={() => {
                                    deleteCategory(cat.id);
                                  }}
                                  title={at('ক্যাটাগরি মুছে ফেলুন', 'Delete Category')}
                                  className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ABANDONED CARTS RECOVERY */}
          {activeTab === 'abandoned_carts' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">{t('ড্রপ-অফ কার্ট রিকভারি', 'Abandoned Cart Recovery')}</h3>
                  <p className="text-xs text-slate-400">{t('যেসব কাস্টমার কার্টে পণ্য যোগ করেও চেকআউট করেননি, তাদের সরাসরি WhatsApp অফার পাঠিয়ে সেলস রিকভার করুন', 'Follow up on incomplete checkouts with 1-click WhatsApp memos & discounts')}</p>
                </div>
              </div>

              {/* Abandoned Carts Table */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">কাস্টমার ও ফোন</th>
                      <th className="py-3 px-4">কার্টের পণ্যসমূহ</th>
                      <th className="py-3 px-4">কার্ট মোট মূল্য</th>
                      <th className="py-3 px-4">ড্রপ-অফ সময়</th>
                      <th className="py-3 px-4">হোয়াটসঅ্যাপ স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">১-ক্লিক রিকভারি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {abandonedCarts.map((cart) => (
                      <tr key={cart.id} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{cart.customerName || 'গ্রাহক'}</div>
                          <div className="font-mono text-emerald-400 text-[11px]">{cart.customerPhone || '01886289663'}</div>
                          <div className="text-slate-500 text-[10px]">{cart.customerDistrict || 'ঢাকা'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            {cart.items.map((it, idx) => (
                              <div key={idx} className="text-slate-300 font-medium">
                                {it.product.titleBn} (x{it.quantity})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">৳ {cart.total.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-slate-400">{cart.createdAt}</td>
                        <td className="py-3.5 px-4">
                          {cart.whatsappSent ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              মেমো পাঠানো হয়েছে
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                              বাকি আছে
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSendCartWhatsApp(cart)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp অফার পাঠান</span>
                            </button>
                            <button
                              onClick={() => recoverAbandonedCart(cart.id)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                            >
                              {t('অর্ডারে রূপান্তর', 'Convert')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: COURIER INTEGRATION HUB & FRAUD CHECK */}
          {activeTab === 'courier_hub' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-black text-white">{t('বাংলাদেশের জনপ্রিয় কুরিয়ার ইন্টিগ্রেশন হাব', 'Courier Integration Hub')}</h3>
                <p className="text-xs text-slate-400">{t('Steadfast API Key সেটআপ, ফ্রড অর্ডার চেকিং ও এক-ক্লিকে কুরিয়ার এন্ট্রি', 'Steadfast Courier API configuration, live consignment booking & fraud score')}</p>
              </div>

              {/* Steadfast API Setup Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Steadfast Courier API Settings</h4>
                      <p className="text-xs text-slate-400">https://portal.steadfast.com.bd API Credentials</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.courierSettings?.steadfast?.enabled !== false}
                      onChange={(e) => {
                        updateSettings({
                          courierSettings: {
                            ...settings.courierSettings,
                            steadfast: {
                              ...settings.courierSettings?.steadfast,
                              enabled: e.target.checked
                            }
                          }
                        });
                      }}
                      className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                    />
                    <span className="text-xs font-bold text-slate-300">{t('সক্রিয় (Enabled)', 'Enabled')}</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">API Key</label>
                    <input
                      type="text"
                      value={settings.courierSettings?.steadfast?.apiKey || ''}
                      onChange={(e) => {
                        updateSettings({
                          courierSettings: {
                            ...settings.courierSettings,
                            steadfast: {
                              ...settings.courierSettings?.steadfast,
                              apiKey: e.target.value
                            }
                          }
                        });
                      }}
                      placeholder="st_live_key_bd9900..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Secret Key</label>
                    <input
                      type="password"
                      value={settings.courierSettings?.steadfast?.secretKey || ''}
                      onChange={(e) => {
                        updateSettings({
                          courierSettings: {
                            ...settings.courierSettings,
                            steadfast: {
                              ...settings.courierSettings?.steadfast,
                              secretKey: e.target.value
                            }
                          }
                        });
                      }}
                      placeholder="••••••••••••••••"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.courierSettings?.steadfast?.autoBook || false}
                      onChange={(e) => {
                        updateSettings({
                          courierSettings: {
                            ...settings.courierSettings,
                            steadfast: {
                              ...settings.courierSettings?.steadfast,
                              autoBook: e.target.checked
                            }
                          }
                        });
                      }}
                      className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                    />
                    <span>{t('এআই কল কনফার্মেশন পাওয়ার সাথে সাথে স্বয়ংক্রিয় Steadfast এ বুকিং করুন', 'Auto-book with Steadfast upon AI call confirmation')}</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isCheckingSteadfastBalance}
                      onClick={async () => {
                        setIsCheckingSteadfastBalance(true);
                        setSteadfastBalanceInfo(null);
                        try {
                          const res = await fetch('/api/steadfast/balance', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              apiKey: settings.courierSettings?.steadfast?.apiKey || '',
                              secretKey: settings.courierSettings?.steadfast?.secretKey || ''
                            })
                          });
                          const data = await res.json();
                          if (res.ok && data.ok) {
                            setSteadfastBalanceInfo({
                              ok: true,
                              balance: data.balance,
                              message: `Live Steadfast Portal Connected! Current Balance: ৳${data.balance}`
                            });
                            addToast('success', 'Steadfast API Connected!', `Current Balance: ৳${data.balance}`);
                          } else {
                            setSteadfastBalanceInfo({
                              ok: false,
                              message: data.error || 'Could not authenticate with Steadfast Portal API.'
                            });
                            addToast('warning', 'Steadfast Connection Check', data.error || 'Check API Key & Secret Key.');
                          }
                        } catch (err: any) {
                          setSteadfastBalanceInfo({
                            ok: false,
                            message: err?.message || 'Steadfast Portal server unreachable.'
                          });
                        } finally {
                          setIsCheckingSteadfastBalance(false);
                        }
                      }}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSteadfastBalance ? 'animate-spin' : ''}`} />
                      <span>{isCheckingSteadfastBalance ? at('চেক হচ্ছে...', 'Checking...') : at('কানেকশন ও ব্যালেন্স টেস্ট', 'Test Connection & Balance')}</span>
                    </button>

                    <button
                      onClick={() => addToast('success', t('সংরক্ষিত হয়েছে!', 'Saved!'), t('Steadfast API তথ্য আপডেট করা হয়েছে।', 'Steadfast credentials saved.'))}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      {t('সেটিংস সেভ করুন', 'Save Settings')}
                    </button>
                  </div>
                </div>

                {steadfastBalanceInfo && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold border ${
                      steadfastBalanceInfo.ok
                        ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-700 text-rose-300'
                    }`}
                  >
                    {steadfastBalanceInfo.message}
                  </div>
                )}
              </div>

              {/* Real-time Customer Fraud Checker */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{t('কাস্টমার ফোন নম্বর ফ্রড ডিটেকশন ও রিটার্ন রিক্স অ্যানালাইজার', 'Customer Phone Fraud & Return Risk Analyzer')}</h4>
                    <p className="text-xs text-slate-400">{t('যে কোনো কাস্টমারের ফোন নম্বর দিয়ে কুরিয়ার ডেলিভারি ইতিহাস ও ফেক অর্ডার ঝুঁকি জানুন', 'Check customer delivery success rate before shipping COD orders')}</p>
                  </div>
                </div>

                <form onSubmit={handleCheckFraud} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX বা 018XXXXXXXX"
                    value={fraudCheckPhone}
                    onChange={(e) => setFraudCheckPhone(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                  <button
                    type="submit"
                    disabled={isCheckingFraud}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <Search className="w-4 h-4" />
                    <span>{isCheckingFraud ? 'যাচাই হচ্ছে...' : 'রিস্ক চেক করুন'}</span>
                  </button>
                </form>

                {fraudResult && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">ডেলিভারি সাফল্য রেট:</span>
                      <span className="text-emerald-400 font-black text-sm">{fraudResult.successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">মোট অর্ডার ইতিহাস:</span>
                      <span className="text-white">{fraudResult.totalOrders} টি (সফল: {fraudResult.deliveredCount}, বাতিল: {fraudResult.cancelledCount})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">ঝুঁকির মাত্রা (Risk Level):</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        fraudResult.riskLevel === 'safe'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {fraudResult.riskLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                      💡 {fraudResult.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Other Popular Bangladesh Couriers (Pathao, RedX, Paperfly, Sundarban) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pathao */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-black">P</div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Pathao Courier</h4>
                        <p className="text-[11px] text-slate-400">merchant.pathao.com API</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.courierSettings?.pathao?.enabled ?? true}
                      onChange={(e) =>
                        updateSettings({
                          courierSettings: {
                            ...settings.courierSettings,
                            pathao: { ...settings.courierSettings.pathao, enabled: e.target.checked }
                          }
                        })
                      }
                      className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Pathao Client ID"
                    value={settings.courierSettings?.pathao?.clientId || ''}
                    onChange={(e) =>
                      updateSettings({
                        courierSettings: {
                          ...settings.courierSettings,
                          pathao: { ...settings.courierSettings.pathao, clientId: e.target.value }
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                  <input
                    type="password"
                    placeholder="Pathao Client Secret"
                    value={settings.courierSettings?.pathao?.clientSecret || ''}
                    onChange={(e) =>
                      updateSettings({
                        courierSettings: {
                          ...settings.courierSettings,
                          pathao: { ...settings.courierSettings.pathao, clientSecret: e.target.value }
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                {/* RedX */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-black">R</div>
                      <div>
                        <h4 className="font-bold text-white text-sm">RedX Logistics</h4>
                        <p className="text-[11px] text-slate-400">openapi.redx.com.bd Bearer Token</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.courierSettings?.redx?.enabled ?? true}
                      onChange={(e) =>
                        updateSettings({
                          courierSettings: {
                            ...settings.courierSettings,
                            redx: { ...settings.courierSettings.redx, enabled: e.target.checked }
                          }
                        })
                      }
                      className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                    />
                  </div>
                  <input
                    type="password"
                    placeholder="RedX API Access Token"
                    value={settings.courierSettings?.redx?.token || ''}
                    onChange={(e) =>
                      updateSettings({
                        courierSettings: {
                          ...settings.courierSettings,
                          redx: { ...settings.courierSettings.redx, token: e.target.value }
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                {/* Paperfly */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-black">PF</div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Paperfly Express</h4>
                        <p className="text-[11px] text-slate-400">api.paperfly.com.bd Credentials</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.courierSettings?.paperfly?.enabled ?? true}
                      onChange={(e) =>
                        updateSettings({
                          courierSettings: {
                            ...settings.courierSettings,
                            paperfly: {
                              username: settings.courierSettings?.paperfly?.username || '',
                              apiKey: settings.courierSettings?.paperfly?.apiKey || '',
                              enabled: e.target.checked
                            }
                          }
                        })
                      }
                      className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Paperfly Merchant Username"
                    value={settings.courierSettings?.paperfly?.username || ''}
                    onChange={(e) =>
                      updateSettings({
                        courierSettings: {
                          ...settings.courierSettings,
                          paperfly: {
                            enabled: settings.courierSettings?.paperfly?.enabled ?? true,
                            apiKey: settings.courierSettings?.paperfly?.apiKey || '',
                            username: e.target.value
                          }
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                  <input
                    type="password"
                    placeholder="Paperfly API Key"
                    value={settings.courierSettings?.paperfly?.apiKey || ''}
                    onChange={(e) =>
                      updateSettings({
                        courierSettings: {
                          ...settings.courierSettings,
                          paperfly: {
                            enabled: settings.courierSettings?.paperfly?.enabled ?? true,
                            username: settings.courierSettings?.paperfly?.username || '',
                            apiKey: e.target.value
                          }
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                {/* Sundarban */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black">SC</div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Sundarban Courier</h4>
                        <p className="text-[11px] text-slate-400">64-District Branch Booking</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.courierSettings?.sundarban?.enabled ?? true}
                      onChange={(e) =>
                        updateSettings({
                          courierSettings: {
                            ...settings.courierSettings,
                            sundarban: {
                              branchCode: settings.courierSettings?.sundarban?.branchCode || 'DHK-01',
                              apiKey: settings.courierSettings?.sundarban?.apiKey || '',
                              enabled: e.target.checked
                            }
                          }
                        })
                      }
                      className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Origin Branch Code (e.g. DHK-01)"
                    value={settings.courierSettings?.sundarban?.branchCode || ''}
                    onChange={(e) =>
                      updateSettings({
                        courierSettings: {
                          ...settings.courierSettings,
                          sundarban: {
                            enabled: settings.courierSettings?.sundarban?.enabled ?? true,
                            apiKey: settings.courierSettings?.sundarban?.apiKey || '',
                            branchCode: e.target.value
                          }
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                  <input
                    type="password"
                    placeholder="Sundarban API Token"
                    value={settings.courierSettings?.sundarban?.apiKey || ''}
                    onChange={(e) =>
                      updateSettings({
                        courierSettings: {
                          ...settings.courierSettings,
                          sundarban: {
                            enabled: settings.courierSettings?.sundarban?.enabled ?? true,
                            branchCode: settings.courierSettings?.sundarban?.branchCode || 'DHK-01',
                            apiKey: e.target.value
                          }
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FLASH SALE MANAGER */}
          {activeTab === 'flash_sale' && (() => {
            const toLocalDateTimeInput = (iso?: string) => {
              const d = iso ? new Date(iso) : new Date(Date.now() + 24 * 3600 * 1000);
              if (isNaN(d.getTime())) return '';
              const pad = (n: number) => String(n).padStart(2, '0');
              return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            };
            const targetMs = settings.flashSale?.endsAt ? new Date(settings.flashSale.endsAt).getTime() : NaN;
            const remainingMs = Number.isFinite(targetMs) ? targetMs - Date.now() : 0;
            const isExpired = !Number.isFinite(targetMs) || remainingMs <= 0;
            const remDays = Math.floor(Math.max(0, remainingMs) / (1000 * 3600 * 24));
            const remHours = Math.floor((Math.max(0, remainingMs) / (1000 * 3600)) % 24);
            const remMins = Math.floor((Math.max(0, remainingMs) / (1000 * 60)) % 60);

            const applyFlashDurationHours = (hours: number) => {
              const nextIso = new Date(Date.now() + hours * 3600 * 1000).toISOString();
              updateSettings({
                flashSale: {
                  ...settings.flashSale,
                  enabled: true,
                  endsAt: nextIso
                }
              });
            };

            return (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-black text-white">{at('ফ্ল্যাশ সেল ম্যানেজার', 'Flash Sale Manager')}</h3>
                <p className="text-xs text-slate-400">{at('স্টোরের মূল ফ্ল্যাশ সেল সক্রিয়/নিষ্ক্রিয়, সময়সূচী ও পণ্য নির্বাচন করুন', 'Manage flash sale status, headline, exact countdown time, and select products')}</p>
              </div>

              {/* Main settings card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 max-w-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                      <Flame className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{at('ফ্ল্যাশ সেল স্ট্যাটাস', 'Flash Sale Status')}</h4>
                      <p className="text-xs text-slate-400">{at('স্টোরফ্রন্টে ফ্ল্যাশ সেল চালু বা বন্ধ রাখুন', 'Show or hide flash sale showcase on homepage')}</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.flashSale?.enabled !== false}
                      onChange={(e) => {
                        updateSettings({
                          flashSale: {
                            ...settings.flashSale,
                            enabled: e.target.checked
                          }
                        });
                      }}
                      className="w-5 h-5 rounded text-rose-600 bg-slate-800 border-slate-700 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white">{settings.flashSale?.enabled !== false ? at('সক্রিয়', 'Active') : at('নিষ্ক্রিয়', 'Inactive')}</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">{at('বাংলা হেডলাইন', 'Headline (Bangla)')}</label>
                  <input
                    type="text"
                    value={settings.flashSale?.headlineBn || ''}
                    onChange={(e) => {
                      updateSettings({
                        flashSale: {
                          ...settings.flashSale,
                          headlineBn: e.target.value
                        }
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">{at('ইংরেজি হেডলাইন', 'Headline (English)')}</label>
                  <input
                    type="text"
                    value={settings.flashSale?.headlineEn || ''}
                    onChange={(e) => {
                      updateSettings({
                        flashSale: {
                          ...settings.flashSale,
                          headlineEn: e.target.value
                        }
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">{at('গড় ছাড়ের শতাংশ (%)', 'Discount %')}</label>
                    <input
                      type="number"
                      min={1}
                      max={95}
                      value={settings.flashSale?.discountPercentage || 40}
                      onChange={(e) => {
                        updateSettings({
                          flashSale: {
                            ...settings.flashSale,
                            discountPercentage: Math.max(1, Number(e.target.value) || 0)
                          }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-300">{at('ফ্ল্যাশ সেল সমাপ্তির সময়', 'Ends At (Date & Time)')}</label>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isExpired ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {isExpired ? at('মেয়াদ শেষ', 'Expired') : `${remDays}d ${remHours}h ${remMins}m`}
                      </span>
                    </div>
                    <input
                      type="datetime-local"
                      value={toLocalDateTimeInput(settings.flashSale?.endsAt)}
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const parsed = new Date(e.target.value);
                        if (!isNaN(parsed.getTime())) {
                          updateSettings({
                            flashSale: {
                              ...settings.flashSale,
                              endsAt: parsed.toISOString()
                            }
                          });
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">{at('দ্রুত সময় সেট:', 'Quick Extend:')}</span>
                  {[
                    { h: 6, label: '+6h' },
                    { h: 24, label: '+24h' },
                    { h: 72, label: '+3 Days' },
                    { h: 168, label: '+7 Days' }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyFlashDurationHours(preset.h)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/60 text-[11px] font-bold text-slate-200 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextEnds = isExpired
                      ? new Date(Date.now() + 24 * 3600 * 1000).toISOString()
                      : settings.flashSale?.endsAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString();
                    updateSettings({
                      flashSale: {
                        ...settings.flashSale,
                        enabled: settings.flashSale?.enabled !== false,
                        endsAt: nextEnds
                      }
                    });
                    addToast('success', at('ফ্ল্যাশ সেল সংরক্ষিত ও সিঙ্ক সম্পন্ন!', 'Flash Sale Saved & Synced!'), at('সকল ডিভাইসে নতুন ফ্ল্যাশ সেল সময়সূচী চালু হয়েছে।', 'Live countdown updated across devices.'));
                  }}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  {at('ফ্ল্যাশ সেল আপডেট সংরক্ষণ ও লাইভ সিঙ্ক করুন', 'Save & Sync Flash Sale Settings')}
                </button>
              </div>

              {/* Product Selector for Flash Sale */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Package className="w-4 h-4 text-rose-500" />
                      <span>{at('ফ্ল্যাশ সেল পণ্য নির্বাচন (সিলেক্টর)', 'Select Flash Sale Products')}</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {at('যেসব পণ্য ফ্ল্যাশ সেলে দেখাতে চান সেগুলোতে ক্লিক করুন', 'Click any product to toggle its inclusion in the Flash Sale section')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
                      {products.filter((p) => p.isFlashSale).length} {at('টি পণ্য নির্বাচিত', 'Selected')}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        products.filter((p) => !p.isFlashSale).forEach((p) => toggleProductFlashSale(p.id));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-700 text-slate-200 text-[11px] font-bold cursor-pointer"
                    >
                      {at('সব সিলেক্ট', 'Select All')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        products.filter((p) => p.isFlashSale).forEach((p) => toggleProductFlashSale(p.id));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-800 text-slate-200 text-[11px] font-bold cursor-pointer"
                    >
                      {at('সব আনসিলেক্ট', 'Clear All')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {products.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => toggleProductFlashSale(prod.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        prod.isFlashSale
                          ? 'bg-rose-950/40 border-rose-600 text-white ring-1 ring-rose-500/40'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!prod.isFlashSale}
                        readOnly
                        className="w-4 h-4 text-rose-600 rounded bg-slate-900 border-slate-700 pointer-events-none"
                      />
                      <img src={prod.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-900 shrink-0" />
                      <div className="overflow-hidden flex-1 min-w-0 text-xs">
                        <h5 className="font-bold truncate text-white">{at(prod.titleBn, prod.title)}</h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-bold text-rose-400">৳ {prod.price.toLocaleString()}</span>
                          <span className="line-through text-[10px] text-slate-500">৳ {prod.originalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            );
          })()}

          {/* TAB 8: STORE SLIDERS (5-6 Editable) */}
          {activeTab === 'sliders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">{at('হোম স্লাইডার ব্যানার (৫ বা ৬টি এডিটেবল)', 'Home Store Sliders')}</h3>
                  <p className="text-xs text-slate-400">{at('স্টোরফ্রন্টের মূল হিরো সেকশনের ৫-৬টি স্লাইডার ব্যানার, টেক্সট, ছবি ও লিংক এডিট করুন', 'Manage 5-6 hero banners, custom titles, images and action buttons')}</p>
                </div>
                <button
                  onClick={openNewSlideModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{at('নতুন স্লাইড যোগ করুন', 'Add Slide')}</span>
                </button>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sliders.map((sl, index) => (
                  <div key={sl.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="aspect-[16/7] rounded-xl overflow-hidden bg-slate-950 relative border border-slate-800 group">
                      <img src={sl.image} alt="" className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/75 text-white">
                        {at(`স্লাইড #${index + 1}`, `Slide #${index + 1}`)}
                      </span>
                      <label className="absolute bottom-2 right-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{at('ব্যানার ছবি আপলোড', 'Upload Image')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            handleImageFileUpload(file, (url) => updateSlide(sl.id, { image: url }));
                            e.currentTarget.value = '';
                          }}
                        />
                      </label>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-white truncate">{at(sl.titleBn, sl.titleEn)}</h4>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0">
                          → {sl.linkCategory || 'all'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{at(sl.subtitleBn, sl.subtitleEn)}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <button
                        onClick={() => toggleSlideActive(sl.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          sl.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {sl.isActive ? at('সক্রিয়', 'Active') : at('নিষ্ক্রিয়', 'Inactive')}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <label
                          title={at('নতুন ছবি আপলোড', 'Upload New Photo')}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-700 text-emerald-300 hover:text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Upload className="w-3 h-3" />
                          <span className="hidden sm:inline">{at('ছবি পরিবর্তন', 'Change Photo')}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              handleImageFileUpload(file, (url) => updateSlide(sl.id, { image: url }));
                              e.currentTarget.value = '';
                            }}
                          />
                        </label>
                        <button
                          onClick={() => openEditSlideModal(sl)}
                          title={at('স্লাইড এডিট করুন', 'Edit Slide')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {/* Direct Delete - No blocking confirm */}
                        <button
                          onClick={() => {
                            deleteSlide(sl.id);
                          }}
                          title={at('স্লাইড মুছে ফেলুন', 'Delete Slide')}
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: MARKETING & PIXEL */}
          {activeTab === 'marketing' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-black text-white">{t('মার্কেটিং টুলস ও ট্র্যাকিং হাব', 'Marketing Tools & Pixel Hub')}</h3>
                <p className="text-xs text-slate-400">{t('Facebook Meta Pixel CAPI, Google Analytics 4 (GA4) ও WhatsApp CRM অটোমেশন', 'Meta Pixel server-side tracking, GA4, and WhatsApp marketing automation')}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Facebook Meta Pixel */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span>Meta Pixel & Conversions API (CAPI)</span>
                    </h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.marketingSettings?.facebookPixel?.enabled !== false}
                        onChange={(e) => {
                          updateSettings({
                            marketingSettings: {
                              ...settings.marketingSettings,
                              facebookPixel: {
                                ...settings.marketingSettings?.facebookPixel,
                                enabled: e.target.checked
                              }
                            }
                          });
                        }}
                        className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700"
                      />
                      <span className="text-xs text-slate-300">সক্রিয়</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Pixel ID</label>
                    <input
                      type="text"
                      value={settings.marketingSettings?.facebookPixel?.pixelId || ''}
                      onChange={(e) => {
                        updateSettings({
                          marketingSettings: {
                            ...settings.marketingSettings,
                            facebookPixel: {
                              ...settings.marketingSettings?.facebookPixel,
                              pixelId: e.target.value
                            }
                          }
                        });
                      }}
                      placeholder="184920491029482..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">CAPI Access Token (Server Side)</label>
                    <input
                      type="password"
                      value={settings.marketingSettings?.facebookPixel?.accessToken || ''}
                      onChange={(e) => {
                        updateSettings({
                          marketingSettings: {
                            ...settings.marketingSettings,
                            facebookPixel: {
                              ...settings.marketingSettings?.facebookPixel,
                              accessToken: e.target.value
                            }
                          }
                        });
                      }}
                      placeholder="EAA..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                {/* Google Analytics 4 */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span>Google Analytics 4 (GA4)</span>
                    </h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.marketingSettings?.googleAnalytics?.enabled !== false}
                        onChange={(e) => {
                          updateSettings({
                            marketingSettings: {
                              ...settings.marketingSettings,
                              googleAnalytics: {
                                ...settings.marketingSettings?.googleAnalytics,
                                enabled: e.target.checked
                              }
                            }
                          });
                        }}
                        className="w-4 h-4 rounded text-amber-600 bg-slate-800 border-slate-700"
                      />
                      <span className="text-xs text-slate-300">সক্রিয়</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">GA4 Measurement ID</label>
                    <input
                      type="text"
                      value={settings.marketingSettings?.googleAnalytics?.measurementId || ''}
                      onChange={(e) => {
                        updateSettings({
                          marketingSettings: {
                            ...settings.marketingSettings,
                            googleAnalytics: {
                              ...settings.marketingSettings?.googleAnalytics,
                              measurementId: e.target.value
                            }
                          }
                        });
                      }}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp CRM Automation</label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 pt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.marketingSettings?.whatsappCRM?.autoFollowupAbandoned ?? true}
                        onChange={(e) => {
                          updateSettings({
                            marketingSettings: {
                              ...settings.marketingSettings,
                              whatsappCRM: {
                                ...settings.marketingSettings?.whatsappCRM,
                                autoFollowupAbandoned: e.target.checked,
                                enabled: true,
                                followupDelayMinutes: 15
                              }
                            }
                          });
                        }}
                        className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                      />
                      <span>ড্রপ-অফ কার্টের গ্রাহকদের ১৫ মিনিট পর অটোমেটিক হোয়াটসঅ্যাপ ডিসকাউন্ট মেমো পাঠানো</span>
                    </label>
                  </div>
                </div>

                {/* TikTok Pixel */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Radio className="w-4 h-4 text-rose-400" />
                      <span>TikTok Pixel & Events API</span>
                    </h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.marketingSettings?.tiktokPixel?.enabled ?? true}
                        onChange={(e) => {
                          updateSettings({
                            marketingSettings: {
                              ...settings.marketingSettings,
                              tiktokPixel: {
                                pixelId: settings.marketingSettings?.tiktokPixel?.pixelId || 'C789TTIKTOK990',
                                enabled: e.target.checked
                              }
                            }
                          });
                        }}
                        className="w-4 h-4 rounded text-rose-600 bg-slate-800 border-slate-700"
                      />
                      <span className="text-xs text-slate-300">সক্রিয়</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">TikTok Pixel ID</label>
                    <input
                      type="text"
                      value={settings.marketingSettings?.tiktokPixel?.pixelId || ''}
                      onChange={(e) => {
                        updateSettings({
                          marketingSettings: {
                            ...settings.marketingSettings,
                            tiktokPixel: {
                              enabled: settings.marketingSettings?.tiktokPixel?.enabled ?? true,
                              pixelId: e.target.value
                            }
                          }
                        });
                      }}
                      placeholder="C789TTIKTOK990"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Dedicated WhatsApp Message Templates Hub (Req 15, 1, 9) */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      <span>{t('হোয়াটসঅ্যাপ অটোমেশন মেসেজ টেমপ্লেট ও ওয়ান-ক্লিক ট্রিগার', 'WhatsApp Message Templates & Automation Triggers')}</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {t('অর্ডার কনফার্ম, কুরিয়ার শিপমেন্ট, হোল্ড এবং অর্ডার বাতিলকরণের জন্য মেসেজ কাস্টমাইজ করুন', 'Customize automated messages with dynamic variables: {order_id}, {customer_name}, {total}, {tracking_code}')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                  {/* Template 1: Order Confirmation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-400 block">
                      ১. অর্ডার নিশ্চিতকরণ মেসেজ (Order Confirmation)
                    </label>
                    <textarea
                      rows={3}
                      value={settings.marketingTemplates?.orderConfirmation || ''}
                      onChange={(e) => {
                        updateSettings({
                          marketingTemplates: {
                            ...settings.marketingTemplates!,
                            orderConfirmation: e.target.value
                          }
                        });
                      }}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 font-mono outline-none"
                    />
                  </div>

                  {/* Template 2: Shipping Dispatched */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-teal-400 block">
                      ২. পার্সেল কুরিয়ার হ্যান্ডওভার মেসেজ (Dispatched & In-Transit)
                    </label>
                    <textarea
                      rows={3}
                      value={settings.marketingTemplates?.shippingDispatched || ''}
                      onChange={(e) => {
                        updateSettings({
                          marketingTemplates: {
                            ...settings.marketingTemplates!,
                            shippingDispatched: e.target.value
                          }
                        });
                      }}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 font-mono outline-none"
                    />
                  </div>

                  {/* Template 3: Order Hold */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-400 block">
                      ৩. অর্ডার হোল্ড / ভেরিফিকেশন মেসেজ (Verification Required)
                    </label>
                    <textarea
                      rows={3}
                      value={settings.marketingTemplates?.orderHold || ''}
                      onChange={(e) => {
                        updateSettings({
                          marketingTemplates: {
                            ...settings.marketingTemplates!,
                            orderHold: e.target.value
                          }
                        });
                      }}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 font-mono outline-none"
                    />
                  </div>

                  {/* Template 4: Order Cancellation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-rose-400 block">
                      ৪. অর্ডার বাতিলকরণ মেসেজ (Order Cancellation)
                    </label>
                    <textarea
                      rows={3}
                      value={settings.marketingTemplates?.orderCancellation || ''}
                      onChange={(e) => {
                        updateSettings({
                          marketingTemplates: {
                            ...settings.marketingTemplates!,
                            orderCancellation: e.target.value
                          }
                        });
                      }}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Price Drop Alerts Watchlist & 1-Click WhatsApp Trigger (Req 11) */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>{t('গ্রাহকের মূল্য কমার নোটিফিকেশন রিকুয়েস্টসমূহ', 'Customer Price Drop Alert Requests')}</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {t('গ্রাহকরা যে পণ্যগুলোর দাম কমলে অ্যালার্ট চেয়েছেন তাদের তালিকা ও ১-ক্লিক হোয়াটসঅ্যাপ নোটিফিকেশন', 'Live list of price drop requests with 1-click WhatsApp messaging')}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {priceAlerts.length} {t('টি অ্যালার্ট', 'Alerts')}
                  </span>
                </div>

                {priceAlerts.length === 0 ? (
                  <div className="text-center py-6 border border-slate-800 rounded-xl text-slate-500 text-xs">
                    {t('এখনও কোনো কাস্টমার প্রাইস অ্যালার্ট সেট করেননি।', 'No customer price drop alerts registered yet.')}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">{t('পণ্য', 'Product')}</th>
                          <th className="p-2.5">{t('যোগাযোগ নম্বর', 'Contact')}</th>
                          <th className="p-2.5">{t('বর্তমান মূল্য', 'Current Price')}</th>
                          <th className="p-2.5">{t('টার্গেট মূল্য', 'Target Price')}</th>
                          <th className="p-2.5 text-right">{t('১-ক্লিক নোটিফিকেশন', '1-Click Action')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {priceAlerts.map((alt) => (
                          <tr key={alt.id} className="hover:bg-slate-800/40">
                            <td className="p-2.5 font-bold text-white">{alt.productTitleBn || alt.productTitle}</td>
                            <td className="p-2.5 font-mono text-emerald-400">{alt.contact}</td>
                            <td className="p-2.5 font-mono">৳{alt.currentPrice}</td>
                            <td className="p-2.5 font-mono font-bold text-amber-400">৳{alt.targetPrice}</td>
                            <td className="p-2.5 text-right">
                              <button
                                onClick={() => {
                                  const text = encodeURIComponent(
                                    `আসসালামু আলাইকুম! আপনি ${alt.productTitleBn || alt.productTitle} এর জন্য প্রাইস অ্যালার্ট সেট করেছিলেন। পণ্যের দাম এখন ৳${alt.targetPrice} টাকায় অফার করা হচ্ছে! এখনই কিনুন BuyOne BD থেকে।`
                                  );
                                  window.open(`https://wa.me/${alt.contact.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
                                  addToast('success', t('হোয়াটসঅ্যাপ ওপেন হয়েছে', 'WhatsApp Opened'), alt.contact);
                                }}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>{t('হোয়াটসঅ্যাপ অ্যালার্ট পাঠান', 'Send Alert')}</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Official Meta WhatsApp Cloud API & Social Media CRM Hub */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Meta WhatsApp Cloud API */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <span>Meta WhatsApp Cloud API</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">Official Graph API v21.0 Messaging & Webhook</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.marketingSettings?.whatsappCloudApi?.enabled || false}
                        onChange={(e) =>
                          updateSettings({
                            marketingSettings: {
                              ...settings.marketingSettings,
                              whatsappCloudApi: {
                                ...settings.marketingSettings.whatsappCloudApi!,
                                enabled: e.target.checked
                              }
                            }
                          })
                        }
                        className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                      />
                      <span className="text-xs font-bold text-slate-300">{at('সক্রিয়', 'Live')}</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Phone Number ID</label>
                      <input
                        type="text"
                        value={settings.marketingSettings?.whatsappCloudApi?.phoneNumberId || ''}
                        onChange={(e) =>
                          updateSettings({
                            marketingSettings: {
                              ...settings.marketingSettings,
                              whatsappCloudApi: {
                                ...settings.marketingSettings.whatsappCloudApi!,
                                phoneNumberId: e.target.value
                              }
                            }
                          })
                        }
                        placeholder="109283746501..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">WABA Account ID</label>
                      <input
                        type="text"
                        value={settings.marketingSettings?.whatsappCloudApi?.wabaId || ''}
                        onChange={(e) =>
                          updateSettings({
                            marketingSettings: {
                              ...settings.marketingSettings,
                              whatsappCloudApi: {
                                ...settings.marketingSettings.whatsappCloudApi!,
                                wabaId: e.target.value
                              }
                            }
                          })
                        }
                        placeholder="298172635490..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-slate-300 font-bold mb-1">Permanent System User Access Token</label>
                    <input
                      type="password"
                      value={settings.marketingSettings?.whatsappCloudApi?.accessToken || ''}
                      onChange={(e) =>
                        updateSettings({
                          marketingSettings: {
                            ...settings.marketingSettings,
                            whatsappCloudApi: {
                              ...settings.marketingSettings.whatsappCloudApi!,
                              accessToken: e.target.value
                            }
                          }
                        })
                      }
                      placeholder="EAAG..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Webhook Verify Token</label>
                      <input
                        type="text"
                        value={settings.marketingSettings?.whatsappCloudApi?.verifyToken || 'buyonebd_meta_verify_2026'}
                        onChange={(e) =>
                          updateSettings({
                            marketingSettings: {
                              ...settings.marketingSettings,
                              whatsappCloudApi: {
                                ...settings.marketingSettings.whatsappCloudApi!,
                                verifyToken: e.target.value
                              }
                            }
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Webhook Callback URL</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          readOnly
                          value={typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp/webhook` : '/api/whatsapp/webhook'}
                          className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(`${window.location.origin}/api/whatsapp/webhook`);
                            addToast('success', at('কপি হয়েছে', 'Copied'), '/api/whatsapp/webhook');
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Test Send */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <span className="text-[11px] font-bold text-emerald-400 block">
                      {at('টেস্ট হোয়াটসঅ্যাপ মেসেজ পাঠান (Cloud API / Sandbox)', 'Send Test Message (Cloud API / Sandbox)')}
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={waTestPhone}
                        onChange={(e) => setWaTestPhone(e.target.value)}
                        placeholder="01886289663"
                        className="sm:w-36 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                      />
                      <input
                        type="text"
                        value={waTestMsg}
                        onChange={(e) => setWaTestMsg(e.target.value)}
                        placeholder="Message..."
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                      />
                      <button
                        type="button"
                        disabled={isSendingWaTest}
                        onClick={async () => {
                          setIsSendingWaTest(true);
                          const res = await sendMetaWhatsAppMessage({ to: waTestPhone, message: waTestMsg });
                          setIsSendingWaTest(false);
                          if (res.success) {
                            addToast('success', at('মেসেজ প্রেরিত!', 'Message Sent!'), `Mode: ${res.mode || 'sent'}`);
                          } else {
                            addToast('error', at('ব্যর্থ হয়েছে', 'Failed'), res.error || 'Error');
                          }
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSendingWaTest ? '...' : at('পাঠান', 'Send')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Social Media CRM Hub */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-pink-400" />
                      <span>{at('সোশ্যাল মিডিয়া CRM হাব ও ১-ক্লিক শেয়ার', 'Social Media CRM Connections & Campaigns')}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">Facebook, Instagram, TikTok ও YouTube চ্যানেল সংযোগ ও দ্রুত ক্যাম্পেইন শেয়ার</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                        <Facebook className="w-3.5 h-3.5 text-blue-400" />
                        <span>Facebook Page URL</span>
                      </label>
                      <input
                        type="text"
                        value={settings.marketingSettings?.socialLinks?.facebookUrl || ''}
                        onChange={(e) =>
                          updateSettings({
                            marketingSettings: {
                              ...settings.marketingSettings,
                              socialLinks: {
                                ...settings.marketingSettings.socialLinks!,
                                facebookUrl: e.target.value
                              }
                            }
                          })
                        }
                        placeholder="https://facebook.com/buyonebd"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                          <Instagram className="w-3.5 h-3.5 text-pink-400" />
                          <span>Instagram Handle</span>
                        </label>
                        <input
                          type="text"
                          value={settings.marketingSettings?.socialLinks?.instagramHandle || ''}
                          onChange={(e) =>
                            updateSettings({
                              marketingSettings: {
                                ...settings.marketingSettings,
                                socialLinks: {
                                  ...settings.marketingSettings.socialLinks!,
                                  instagramHandle: e.target.value
                                }
                              }
                            })
                          }
                          placeholder="@buyonebd"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-cyan-400" />
                          <span>TikTok Handle</span>
                        </label>
                        <input
                          type="text"
                          value={settings.marketingSettings?.socialLinks?.tiktokHandle || ''}
                          onChange={(e) =>
                            updateSettings({
                              marketingSettings: {
                                ...settings.marketingSettings,
                                socialLinks: {
                                  ...settings.marketingSettings.socialLinks!,
                                  tiktokHandle: e.target.value
                                }
                              }
                            })
                          }
                          placeholder="@buyonebd.official"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                        <Youtube className="w-3.5 h-3.5 text-red-400" />
                        <span>YouTube Channel URL</span>
                      </label>
                      <input
                        type="text"
                        value={settings.marketingSettings?.socialLinks?.youtubeUrl || ''}
                        onChange={(e) =>
                          updateSettings({
                            marketingSettings: {
                              ...settings.marketingSettings,
                              socialLinks: {
                                ...settings.marketingSettings.socialLinks!,
                                youtubeUrl: e.target.value
                              }
                            }
                          })
                        }
                        placeholder="https://youtube.com/@buyonebd"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  {/* 1-Click Social CRM Campaign Launchers */}
                  <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                    <a
                      href={settings.marketingSettings?.socialLinks?.facebookUrl || 'https://facebook.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900 border border-blue-800/70 text-blue-300 font-bold flex items-center justify-center gap-1.5"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      <span>Facebook Inbox</span>
                    </a>
                    <a
                      href={`https://instagram.com/${(settings.marketingSettings?.socialLinks?.instagramHandle || '').replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-pink-950/60 hover:bg-pink-900 border border-pink-800/70 text-pink-300 font-bold flex items-center justify-center gap-1.5"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Instagram DM</span>
                    </a>
                    <a
                      href={`https://tiktok.com/${settings.marketingSettings?.socialLinks?.tiktokHandle || ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center justify-center gap-1.5"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>TikTok Center</span>
                    </a>
                    <a
                      href={settings.marketingSettings?.socialLinks?.youtubeUrl || 'https://youtube.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/70 text-rose-300 font-bold flex items-center justify-center gap-1.5"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      <span>YouTube Studio</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* WhatsApp Cloud API Delivery Logs */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span>{at('হোয়াটসঅ্যাপ ক্লাউড API ডেলিভারি লগ', 'WhatsApp Cloud API Delivery Logs')}</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">{whatsappLogs.length} logs</span>
                </div>
                {whatsappLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center border border-slate-800 rounded-xl">
                    {at('এখনও কোনো API মেসেজ পাঠানো হয়নি। উপরের টেস্ট ফর্ম দিয়ে মেসেজ পাঠিয়ে দেখুন।', 'No API messages logged yet. Use the test sender above to test dispatch.')}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                        <tr>
                          <th className="p-2.5">Phone</th>
                          <th className="p-2.5">Template</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Preview</th>
                          <th className="p-2.5">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {whatsappLogs.slice(0, 12).map((log) => (
                          <tr key={log.id} className="hover:bg-slate-800/40">
                            <td className="p-2.5 font-mono text-emerald-400">{log.phone}</td>
                            <td className="p-2.5 font-mono">{log.template}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                log.status === 'failed'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : log.status === 'simulated'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="p-2.5 max-w-xs truncate text-slate-400">{log.messagePreview}</td>
                            <td className="p-2.5 text-slate-500">{log.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ZERO-AD ORGANIC MARKETING SUITE (NO PAID ADS NEEDED) */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-black text-white text-base flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-emerald-400" />
                      <span>{at('ফ্রি অর্গানিক মার্কেটিং টুলস (অ্যাড ছাড়াই সেলস বৃদ্ধি)', 'Zero-Ad Organic Marketing Growth Suite')}</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {at('কোনো ফেসবুক/গুগল বিজ্ঞাপন খরচ ছাড়াই ইমেইল ক্যাম্পেইন, রেফারেল রিওয়ার্ড, এক্সিট-ইন্টেন্ট পপআপ ও VIP টিয়ার চালান', 'Drive repeat organic orders with SMTP newsletters, promo popups, referral links & VIP milestones')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Card 1: SMTP Organic Email Newsletter Broadcaster */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                    <h5 className="font-bold text-white text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4 text-sky-400" />
                      <span>{at('SMTP ইমেইল নিউজলেটার ও অফার ব্রডকাস্ট', 'SMTP Email Campaign Broadcaster')}</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">{at('প্রাপক অডিয়েন্স', 'Audience')}</label>
                        <select
                          value={emailCampaignAudience}
                          onChange={(e) => setEmailCampaignAudience(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                        >
                          <option value="all">{at('সকল কাস্টমার ও অর্ডার ইমেইল', 'All Customers & Orders')}</option>
                          <option value="customers">{at('নিবন্ধিত কাস্টমার অ্যাকাউন্ট', 'Registered Customer Accounts')}</option>
                          <option value="custom">{at('কাস্টম ইমেইল তালিকা', 'Custom Email List')}</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <span className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono w-full text-center">
                          {customerAccounts.filter((a) => a.email.includes('@')).length} customer emails
                        </span>
                      </div>
                    </div>
                    {emailCampaignAudience === 'custom' && (
                      <input
                        type="text"
                        value={emailCampaignCustomList}
                        onChange={(e) => setEmailCampaignCustomList(e.target.value)}
                        placeholder="user1@gmail.com, user2@gmail.com"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                      />
                    )}
                    <input
                      type="text"
                      value={emailCampaignSubject}
                      onChange={(e) => setEmailCampaignSubject(e.target.value)}
                      placeholder={at('ইমেইল সাবজেক্ট...', 'Email Subject...')}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                    />
                    <textarea
                      rows={3}
                      value={emailCampaignBody}
                      onChange={(e) => setEmailCampaignBody(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                    />
                    <button
                      type="button"
                      disabled={isSendingEmailCampaign}
                      onClick={async () => {
                        const accountEmails = customerAccounts.map((a) => a.email).filter((e) => e && e.includes('@'));
                        const customEmails = emailCampaignCustomList
                          .split(/[,\s]+/)
                          .map((e) => e.trim())
                          .filter((e) => e.includes('@'));
                        const recipients =
                          emailCampaignAudience === 'custom'
                            ? customEmails
                            : Array.from(new Set([...accountEmails, ...customEmails]));
                        if (recipients.length === 0) {
                          addToast('warning', at('কোনো ইমেইল নেই', 'No Recipients'), at('কাস্টম ইমেইল লিখুন বা কাস্টমার অ্যাকাউন্ট তৈরি করুন।', 'Enter comma-separated recipient emails.'));
                          return;
                        }
                        if (!settings.smtpSettings?.host || !settings.smtpSettings?.user) {
                          addToast('warning', at('SMTP সেটআপ করুন', 'Configure SMTP First'), at('সেটিংস ট্যাব থেকে SMTP Host, User ও Password দিন।', 'Open Settings tab to configure Email SMTP first.'));
                          return;
                        }
                        setIsSendingEmailCampaign(true);
                        try {
                          const res = await fetch('/api/email/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              smtp: settings.smtpSettings,
                              to: recipients,
                              subject: emailCampaignSubject,
                              html: `<div style="font-family:sans-serif;line-height:1.6"><h2>${settings.storeName}</h2><p>${emailCampaignBody.replace(/\n/g, '<br/>')}</p></div>`
                            })
                          });
                          const data = await res.json();
                          if (res.ok && data.success) {
                            addToast('success', at('ইমেইল ক্যাম্পেইন পাঠানো হয়েছে!', 'Campaign Sent!'), `${data.sentCount} recipients notified.`);
                          } else {
                            addToast('error', at('SMTP ইরর', 'SMTP Error'), data.error || 'Failed to send');
                          }
                        } catch {
                          addToast('error', at('নেটওয়ার্ক সমস্যা', 'Network Error'), 'Could not reach /api/email/send');
                        } finally {
                          setIsSendingEmailCampaign(false);
                        }
                      }}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingEmailCampaign ? at('পাঠানো হচ্ছে...', 'Sending...') : at('SMTP দিয়ে ইমেইল ব্রডকাস্ট পাঠান', 'Send Organic Email Broadcast')}</span>
                    </button>
                  </div>

                  {/* Card 2: Promo / Exit-Intent Discount Popup Manager */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-white text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>{at('অর্গানিক প্রমো ও এক্সিট ডিসকাউন্ট পপআপ', 'Promo & Exit Discount Popup')}</span>
                      </h5>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.organicMarketing?.promoPopup?.enabled ?? false}
                          onChange={(e) =>
                            updateSettings({
                              organicMarketing: {
                                ...settings.organicMarketing!,
                                promoPopup: {
                                  ...settings.organicMarketing!.promoPopup,
                                  enabled: e.target.checked
                                }
                              }
                            })
                          }
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        <span className="font-bold text-emerald-400">{at('চালু', 'Enabled')}</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={settings.organicMarketing?.promoPopup?.headlineBn || ''}
                        onChange={(e) =>
                          updateSettings({
                            organicMarketing: {
                              ...settings.organicMarketing!,
                              promoPopup: { ...settings.organicMarketing!.promoPopup, headlineBn: e.target.value }
                            }
                          })
                        }
                        placeholder="পপআপ শিরোনাম (বাংলা)"
                        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                      />
                      <input
                        type="text"
                        value={settings.organicMarketing?.promoPopup?.headlineEn || ''}
                        onChange={(e) =>
                          updateSettings({
                            organicMarketing: {
                              ...settings.organicMarketing!,
                              promoPopup: { ...settings.organicMarketing!.promoPopup, headlineEn: e.target.value }
                            }
                          })
                        }
                        placeholder="Popup Title (EN)"
                        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={settings.organicMarketing?.promoPopup?.couponCode || ''}
                        onChange={(e) =>
                          updateSettings({
                            organicMarketing: {
                              ...settings.organicMarketing!,
                              promoPopup: { ...settings.organicMarketing!.promoPopup, couponCode: e.target.value.toUpperCase() }
                            }
                          })
                        }
                        placeholder="WELCOME100"
                        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-mono uppercase"
                      />
                      <input
                        type="text"
                        value={settings.organicMarketing?.promoPopup?.discountLabelBn || ''}
                        onChange={(e) =>
                          updateSettings({
                            organicMarketing: {
                              ...settings.organicMarketing!,
                              promoPopup: { ...settings.organicMarketing!.promoPopup, discountLabelBn: e.target.value }
                            }
                          })
                        }
                        placeholder="৳100 OFF"
                        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                      />
                      <input
                        type="number"
                        min={1}
                        value={settings.organicMarketing?.promoPopup?.delaySeconds ?? 8}
                        onChange={(e) =>
                          updateSettings({
                            organicMarketing: {
                              ...settings.organicMarketing!,
                              promoPopup: { ...settings.organicMarketing!.promoPopup, delaySeconds: Number(e.target.value) }
                            }
                          })
                        }
                        placeholder="Delay (s)"
                        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Card 3: Referral & Social Share Coupon Booster */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-white text-sm flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-emerald-400" />
                        <span>{at('রেফারেল ও সোশ্যাল শেয়ার ডিসকাউন্ট', 'Referral & Social Share Rewards')}</span>
                      </h5>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.organicMarketing?.socialShareDiscount?.enabled ?? true}
                          onChange={(e) =>
                            updateSettings({
                              organicMarketing: {
                                ...settings.organicMarketing!,
                                socialShareDiscount: {
                                  ...settings.organicMarketing!.socialShareDiscount,
                                  enabled: e.target.checked
                                }
                              }
                            })
                          }
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        <span className="font-bold text-emerald-400">{at('সক্রিয়', 'Active')}</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Share Coupon</label>
                        <input
                          type="text"
                          value={settings.organicMarketing?.socialShareDiscount?.couponCode || ''}
                          onChange={(e) =>
                            updateSettings({
                              organicMarketing: {
                                ...settings.organicMarketing!,
                                socialShareDiscount: {
                                  ...settings.organicMarketing!.socialShareDiscount,
                                  couponCode: e.target.value.toUpperCase()
                                }
                              }
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Share Off (৳)</label>
                        <input
                          type="number"
                          value={settings.organicMarketing?.socialShareDiscount?.discountAmount ?? 50}
                          onChange={(e) =>
                            updateSettings({
                              organicMarketing: {
                                ...settings.organicMarketing!,
                                socialShareDiscount: {
                                  ...settings.organicMarketing!.socialShareDiscount,
                                  discountAmount: Number(e.target.value)
                                }
                              }
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Friend Off (৳)</label>
                        <input
                          type="number"
                          value={settings.organicMarketing?.referralProgram?.refereeDiscountBdt ?? 100}
                          onChange={(e) =>
                            updateSettings({
                              organicMarketing: {
                                ...settings.organicMarketing!,
                                referralProgram: {
                                  ...settings.organicMarketing!.referralProgram,
                                  refereeDiscountBdt: Number(e.target.value)
                                }
                              }
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={settings.organicMarketing?.socialShareDiscount?.messageBn || ''}
                      onChange={(e) =>
                        updateSettings({
                          organicMarketing: {
                            ...settings.organicMarketing!,
                            socialShareDiscount: {
                              ...settings.organicMarketing!.socialShareDiscount,
                              messageBn: e.target.value
                            }
                          }
                        })
                      }
                      placeholder="সিঙ্গেল প্রোডাক্টে শেয়ার ডিসকাউন্ট বার্তা (বাংলা)"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                    />
                  </div>

                  {/* Card 4: VIP Customer Tier Milestones */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-white text-sm flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>{at('অটো VIP কাস্টমার টিয়ার (Repeat Retention)', 'VIP Loyalty Tier Milestones')}</span>
                      </h5>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.organicMarketing?.vipTiers?.enabled ?? true}
                          onChange={(e) =>
                            updateSettings({
                              organicMarketing: {
                                ...settings.organicMarketing!,
                                vipTiers: {
                                  ...settings.organicMarketing!.vipTiers,
                                  enabled: e.target.checked
                                }
                              }
                            })
                          }
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        <span className="font-bold text-emerald-400">{at('চালু', 'Enabled')}</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Silver Threshold (৳)</label>
                        <input
                          type="number"
                          value={settings.organicMarketing?.vipTiers?.silverThreshold ?? 3000}
                          onChange={(e) =>
                            updateSettings({
                              organicMarketing: {
                                ...settings.organicMarketing!,
                                vipTiers: { ...settings.organicMarketing!.vipTiers, silverThreshold: Number(e.target.value) }
                              }
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Silver Bonus (%)</label>
                        <input
                          type="number"
                          value={settings.organicMarketing?.vipTiers?.silverDiscountPct ?? 5}
                          onChange={(e) =>
                            updateSettings({
                              organicMarketing: {
                                ...settings.organicMarketing!,
                                vipTiers: { ...settings.organicMarketing!.vipTiers, silverDiscountPct: Number(e.target.value) }
                              }
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Gold Threshold (৳)</label>
                        <input
                          type="number"
                          value={settings.organicMarketing?.vipTiers?.goldThreshold ?? 10000}
                          onChange={(e) =>
                            updateSettings({
                              organicMarketing: {
                                ...settings.organicMarketing!,
                                vipTiers: { ...settings.organicMarketing!.vipTiers, goldThreshold: Number(e.target.value) }
                              }
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Gold Bonus (%)</label>
                        <input
                          type="number"
                          value={settings.organicMarketing?.vipTiers?.goldDiscountPct ?? 10}
                          onChange={(e) =>
                            updateSettings({
                              organicMarketing: {
                                ...settings.organicMarketing!,
                                vipTiers: { ...settings.organicMarketing!.vipTiers, goldDiscountPct: Number(e.target.value) }
                              }
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Promo Coupon Code Manager (CRUD synced to 1-Click Checkout) */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <span>{at('প্রোমো ডিসকাউন্ট কুপন ম্যানেজার', 'Promo Coupon Code Manager')}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {at('চেকআউটে ব্যবহৃত ডিসকাউন্ট কোড যোগ, চালু/বন্ধ বা ডিলিট করুন', 'Create, toggle or delete live promo coupon codes used at checkout')}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <input
                    type="text"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="CODE (e.g. EID100)"
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase"
                  />
                  <input
                    type="text"
                    value={newCouponTitle}
                    onChange={(e) => setNewCouponTitle(e.target.value)}
                    placeholder={at('অফারের বিবরণ', 'Promo Label')}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="fixed">{at('৳ ফিক্সড ছাড়', 'Fixed ৳ Off')}</option>
                    <option value="percent">{at('% শতাংশ ছাড়', 'Percent % Off')}</option>
                    <option value="free_shipping">{at('ফ্রি ডেলিভারি', 'Free Shipping')}</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(Number(e.target.value))}
                    placeholder="Value"
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const code = newCouponCode.trim().toUpperCase();
                      if (!code) return;
                      const current = settings.promoCoupons || [];
                      const entry = {
                        id: `cpn-${Date.now()}`,
                        code,
                        title: newCouponTitle.trim() || `${code} Offer`,
                        discountType: newCouponType,
                        value: newCouponType === 'free_shipping' ? 0 : newCouponValue,
                        minOrder: newCouponMinOrder,
                        active: true
                      };
                      updateSettings({ promoCoupons: [entry, ...current] });
                      setNewCouponCode('');
                      setNewCouponTitle('');
                      addToast('success', at('কুপন তৈরি হয়েছে!', 'Coupon Added!'), code);
                    }}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
                  >
                    + {at('কুপন যোগ', 'Add Coupon')}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(settings.promoCoupons || []).map((cpn) => (
                    <div key={cpn.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-emerald-400">{cpn.code}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {cpn.discountType === 'free_shipping'
                              ? 'FREE SHIP'
                              : cpn.discountType === 'percent'
                              ? `${cpn.value}% OFF`
                              : `৳${cpn.value} OFF`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {cpn.title} {cpn.minOrder ? `(Min ৳${cpn.minOrder})` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            updateSettings({
                              promoCoupons: (settings.promoCoupons || []).map((x) =>
                                x.id === cpn.id ? { ...x, active: x.active === false } : x
                              )
                            })
                          }
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                            cpn.active !== false
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {cpn.active !== false ? 'ON' : 'OFF'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateSettings({
                              promoCoupons: (settings.promoCoupons || []).filter((x) => x.id !== cpn.id)
                            })
                          }
                          className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => addToast('success', t('সংরক্ষিত হয়েছে!', 'Saved!'), t('মার্কেটিং টুলস সেটিংস সফলভাবে আপডেট হয়েছে।', 'Marketing settings saved.'))}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {t('মার্কেটিং সেটিংস সেভ করুন', 'Save Marketing Settings')}
              </button>
            </div>
          )}

          {/* TAB 10: AI & VOICE CALL HUB */}
          {activeTab === 'ai_hub' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-black text-white">{t('এআই ও স্বয়ংক্রিয় ভয়েস কল হাব', 'AI & Voice Call Engine')}</h3>
                <p className="text-xs text-slate-400">{t('Gemini, ChatGPT, Claude API সেটআপ ও খাঁটি বাংলাদেশী নারী কণ্ঠস্বর অডিও টেস্ট', 'Configure AI models (Gemini, ChatGPT, Claude) & test natural Bengali speech')}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI API Keys Setup */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Bot className="w-4 h-4 text-emerald-400" />
                    <span>AI Provider API Keys (Gemini / OpenAI / Claude)</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Google Gemini API Key</label>
                    <input
                      type="password"
                      value={settings.aiSettings?.geminiApiKey || ''}
                      onChange={(e) => {
                        updateSettings({
                          aiSettings: {
                            ...settings.aiSettings,
                            geminiApiKey: e.target.value
                          }
                        });
                      }}
                      placeholder="AIzaSy..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">OpenAI API Key (ChatGPT)</label>
                    <input
                      type="password"
                      value={settings.aiSettings?.openaiApiKey || ''}
                      onChange={(e) => {
                        updateSettings({
                          aiSettings: {
                            ...settings.aiSettings,
                            openaiApiKey: e.target.value
                          }
                        });
                      }}
                      placeholder="sk-proj-..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Anthropic Claude API Key</label>
                    <input
                      type="password"
                      value={settings.aiSettings?.claudeApiKey || ''}
                      onChange={(e) => {
                        updateSettings({
                          aiSettings: {
                            ...settings.aiSettings,
                            claudeApiKey: e.target.value
                          }
                        });
                      }}
                      placeholder="sk-ant-..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">Selected Primary Model</label>
                    <select
                      value={settings.aiSettings?.selectedProvider || 'gemini'}
                      onChange={(e) => {
                        updateSettings({
                          aiSettings: {
                            ...settings.aiSettings,
                            selectedProvider: e.target.value as any
                          }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="gemini">Google Gemini 2.5 Flash / Pro (Recommended for Bengali)</option>
                      <option value="openai">OpenAI GPT-4o Mini</option>
                      <option value="claude">Anthropic Claude 3.5 Sonnet</option>
                    </select>
                  </div>
                </div>

                {/* Voice Call & Human Audio Preview */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-teal-400" />
                      <span>Bangladeshi Female Voice Confirmation</span>
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      Aoede / Gemini Neural
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    অর্ডার হওয়ার সাথে সাথে কাস্টমারকে ফোন করে অর্ডার কনফার্ম করে এমন স্মার্ট হিউম্যান ভয়েস। নিচের বাটনে ক্লিক করে লাইভ ভয়েস টেস্ট শুনুন:
                  </p>

                  <button
                    onClick={async () => {
                      addToast('info', t('ভয়েস প্লে হচ্ছে...', 'Playing Voice...'), t('Gemini Neural Bengali Audio স্ট্রিম হচ্ছে।', 'Streaming Bengali human audio.'));
                      await playVoiceSample();
                    }}
                    disabled={isPlayingVoiceSample}
                    className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20"
                  >
                    <PhoneCall className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>{isPlayingVoiceSample ? t('ভয়েস অডিও প্লে হচ্ছে...', 'Streaming Bengali Voice...') : t('🎧 বাংলাদেশী নারী কণ্ঠে লাইভ অডিও শুনুন', 'Listen Live Bengali Voice Sample')}</span>
                  </button>

                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-slate-300">{t('কল স্ক্রিপ্ট (Bengali Call Script)', 'Call Script')}</label>
                    <textarea
                      rows={3}
                      value={settings.aiCallSettings?.banglaScript || ''}
                      onChange={(e) => {
                        updateSettings({
                          aiCallSettings: {
                            ...settings.aiCallSettings,
                            banglaScript: e.target.value
                          }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* AI Support Auto-Answer Keyword Rules */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{at('AI সাপোর্ট অটো-উত্তর কিওয়ার্ড সেটআপ', 'AI Support Auto-Answer Keyword Rules')}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {at(
                        'কাস্টমার চ্যাটে নিচের কোনো কীওয়ার্ড লিখলে সাথে সাথেই নির্ধারিত উত্তর স্বয়ংক্রিয়ভাবে চলে যাবে।',
                        'Instant automatic replies triggered when customers mention matching keywords in chat.'
                      )}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {(settings.aiKeywordRules || []).filter((r) => r.enabled).length} Active Rules
                  </span>
                </div>

                {/* Add New Keyword Rule */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {at('কীওয়ার্ড (কমা দিয়ে আলাদা)', 'Keywords (comma separated)')}
                    </label>
                    <input
                      type="text"
                      value={newRuleKeywords}
                      onChange={(e) => setNewRuleKeywords(e.target.value)}
                      placeholder="warranty, ওয়ারেন্টি, return, রিটার্ন"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {at('অটো উত্তর (বাংলা)', 'Auto Reply (BN)')}
                    </label>
                    <input
                      type="text"
                      value={newRuleReplyBn}
                      onChange={(e) => setNewRuleReplyBn(e.target.value)}
                      placeholder="৭ দিনের সহজ রিপ্লেসমেন্ট ওয়ারেন্টি রয়েছে!"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div className="flex flex-col justify-between gap-2">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        {at('অটো উত্তর (ইংরেজি)', 'Auto Reply (EN)')}
                      </label>
                      <input
                        type="text"
                        value={newRuleReplyEn}
                        onChange={(e) => setNewRuleReplyEn(e.target.value)}
                        placeholder="7-day easy replacement warranty included."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const kwList = newRuleKeywords
                          .split(',')
                          .map((k) => k.trim())
                          .filter(Boolean);
                        if (kwList.length === 0 || (!newRuleReplyBn.trim() && !newRuleReplyEn.trim())) {
                          addToast('error', at('তথ্য দিন', 'Missing fields'), at('কীওয়ার্ড এবং উত্তর লিখুন।', 'Enter keywords and reply text.'));
                          return;
                        }
                        const nextRules = [
                          ...(settings.aiKeywordRules || []),
                          {
                            id: `kw-${Date.now()}`,
                            keywords: kwList,
                            replyBn: newRuleReplyBn.trim() || newRuleReplyEn.trim(),
                            replyEn: newRuleReplyEn.trim() || newRuleReplyBn.trim(),
                            enabled: true
                          }
                        ];
                        updateSettings({ aiKeywordRules: nextRules });
                        setNewRuleKeywords('');
                        setNewRuleReplyBn('');
                        setNewRuleReplyEn('');
                        addToast('success', at('কীওয়ার্ড রুল যোগ হয়েছে', 'Keyword rule added'), kwList.join(', '));
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{at('নতুন কীওয়ার্ড রুল যোগ করুন', 'Add Keyword Rule')}</span>
                    </button>
                  </div>
                </div>

                {/* Rules List */}
                <div className="space-y-2.5">
                  {(settings.aiKeywordRules || []).map((rule) => (
                    <div
                      key={rule.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {rule.keywords.map((kw, kIdx) => (
                            <span
                              key={kIdx}
                              className="px-2 py-0.5 rounded-md bg-slate-800 text-emerald-300 font-mono text-[11px] font-bold"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-200">{at(rule.replyBn, rule.replyEn)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (settings.aiKeywordRules || []).map((r) =>
                              r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                            );
                            updateSettings({ aiKeywordRules: updated });
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer border ${
                            rule.enabled
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {rule.enabled ? at('সক্রিয়', 'Active') : at('বন্ধ', 'Paused')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = (settings.aiKeywordRules || []).filter((r) => r.id !== rule.id);
                            updateSettings({ aiKeywordRules: filtered });
                          }}
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: SPIN REWARDS MANAGER */}
          {activeTab === 'spin_wheel' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">{t('লাকি স্পিন কুপন ম্যানেজার', 'Spin Wheel Coupons')}</h3>
                  <p className="text-xs text-slate-400">{t('স্পিনের পুরস্কারসমূহ, কুপন কোড ও মান নির্ধারণ করুন (প্রতিদিন ৪টি স্পিন, ১০ মিনিট কুলডাউন)', 'Configure wheel coupon prizes, 4 spins/day limit and 10m cooldown')}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingSpinRewardId(null);
                    setSpinForm({
                      labelBn: '',
                      labelEn: '',
                      code: 'SPIN' + Math.floor(100 + Math.random() * 900),
                      discountType: 'fixed',
                      value: 100,
                      color: '#059669',
                      isTryAgain: false
                    });
                    setIsSpinModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('নতুন কুপন অফার যোগ করুন', 'Add Prize')}</span>
                </button>
              </div>

              {/* Daily Spin Limit Control */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{at('দৈনিক স্পিন সংখ্যা নির্ধারণ (Daily Spins per Customer)', 'Daily Spin Limit per Customer')}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {at('প্রতি গ্রাহক দিনে কতবার স্পিন করতে পারবে (১-১০ বার)', 'Allowable spins per customer each day')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={settings.spinSettings?.spinsPerDay || 1}
                    onChange={(e) => {
                      updateSettings({
                        spinSettings: {
                          ...settings.spinSettings,
                          spinsPerDay: Math.max(1, Number(e.target.value))
                        }
                      });
                    }}
                    className="w-20 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white text-center font-mono outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs text-slate-400 font-bold">{at('বার / দিন', 'times / day')}</span>
                </div>
              </div>

              {/* Spin Rewards Table */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">কালার</th>
                        <th className="py-3 px-4">অফারের নাম (বাংলা)</th>
                        <th className="py-3 px-4">ইংরেজি নাম</th>
                        <th className="py-3 px-4">কুপন কোড</th>
                        <th className="py-3 px-4">ছাড়ের ধরন</th>
                        <th className="py-3 px-4">মান / ভ্যালু</th>
                        <th className="py-3 px-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {spinRewards.map((rew) => (
                        <tr key={rew.id} className="hover:bg-slate-800/40">
                          <td className="py-3.5 px-4">
                            <div className="w-6 h-6 rounded-full border border-slate-700" style={{ backgroundColor: rew.color }} />
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white">{rew.labelBn}</td>
                          <td className="py-3.5 px-4">{rew.labelEn}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{rew.code}</td>
                          <td className="py-3.5 px-4 uppercase text-[11px]">{rew.discountType}</td>
                          <td className="py-3.5 px-4 font-bold text-white">
                            {rew.discountType === 'percent' ? `${rew.value}%` : rew.discountType === 'free_shipping' ? 'ফ্রি' : `৳${rew.value}`}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingSpinRewardId(rew.id);
                                  setSpinForm({ ...rew });
                                  setIsSpinModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  deleteSpinReward(rew.id);
                                }}
                                title={at('কুপন মুছে ফেলুন', 'Delete Coupon')}
                                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: ALL ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-black text-white">{t('সম্পূর্ণ স্টোর অ্যানালিটিক্স', 'Store Analytics & Performance')}</h3>
                <p className="text-xs text-slate-400">{t('ভিজিটর ট্রাফিক, জেলাভিত্তিক কনভার্সন রেট এবং কুরিয়ার ডেলিভারি রিপোর্ট', 'Visitor traffic, district conversion breakdown and delivery analytics')}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">ডেলিভারি জোন শেয়ার</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>ঢাকা সিটি (Inside Dhaka)</span>
                      <span className="font-bold text-emerald-400">৫৮%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '58%' }} />
                    </div>

                    <div className="flex justify-between text-slate-300 pt-1">
                      <span>ঢাকা উপশহর (Sub Dhaka)</span>
                      <span className="font-bold text-teal-400">১৬%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: '16%' }} />
                    </div>

                    <div className="flex justify-between text-slate-300 pt-1">
                      <span>ঢাকার বাইরে (Outside Dhaka)</span>
                      <span className="font-bold text-cyan-400">২৬%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: '26%' }} />
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">পেমেন্ট মেথড অনুপাত</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>ক্যাশ অন ডেলিভারি (COD)</span>
                      <span className="font-bold text-amber-400">৭৪%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '74%' }} />
                    </div>

                    <div className="flex justify-between text-slate-300 pt-1">
                      <span>বিকাশ / নগদ (bKash/Nagad)</span>
                      <span className="font-bold text-pink-400">২১%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full" style={{ width: '21%' }} />
                    </div>

                    <div className="flex justify-between text-slate-300 pt-1">
                      <span>অগ্রিম ডেলিভারি চার্জ</span>
                      <span className="font-bold text-purple-400">৫%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '5%' }} />
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">এআই অটোমেশন পারফরম্যান্স</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>এআই কল রিসিভ হার</span>
                      <span className="font-bold text-emerald-400">৯১.৪%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '91.4%' }} />
                    </div>

                    <div className="flex justify-between text-slate-300 pt-1">
                      <span>প্রথম কলেই নিশ্চিত</span>
                      <span className="font-bold text-teal-400">৮৪.০%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: '84%' }} />
                    </div>

                    <div className="flex justify-between text-slate-300 pt-1">
                      <span>কুরিয়ার রিটার্ন হ্রাস</span>
                      <span className="font-bold text-amber-400">-৬২%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '62%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* CUSTOMER FULL BROWSER HISTORY */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <History className="w-4 h-4 text-emerald-400" />
                      <span>{at('কাস্টমার সম্পূর্ণ ব্রাউজিং হিস্ট্রি (Customer Browser History)', 'Customer Full Browsing History')}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {at(
                        'ক্রেতারা কোন কোন SEO URL, প্রোডাক্ট ও ক্যাটাগরি ভিজিট করেছেন তার লাইভ রেকর্ড',
                        'Live audit log of every customer visited URL path, product, category & device'
                      )}
                    </p>
                  </div>
                  <input
                    type="text"
                    value={browsingSearch}
                    onChange={(e) => setBrowsingSearch(e.target.value)}
                    placeholder={at('কাস্টমার বা URL খুঁজুন...', 'Search visitor or URL...')}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white w-full sm:w-64"
                  />
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">{at('গ্রাহক / ভিজিটর', 'Customer')}</th>
                        <th className="py-2.5 px-3">{at('ভিজিট করা URL', 'Visited URL Path')}</th>
                        <th className="py-2.5 px-3">{at('পেইজ / পণ্যের নাম', 'Page / Product')}</th>
                        <th className="py-2.5 px-3">{at('ডিভাইস', 'Device')}</th>
                        <th className="py-2.5 px-3">{at('সময়', 'Time')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {customerBrowsingLogs
                        .filter(
                          (log) =>
                            !browsingSearch.trim() ||
                            log.customerName.toLowerCase().includes(browsingSearch.toLowerCase()) ||
                            log.urlPath.toLowerCase().includes(browsingSearch.toLowerCase()) ||
                            log.pageTitle.toLowerCase().includes(browsingSearch.toLowerCase())
                        )
                        .slice(0, 40)
                        .map((log) => (
                          <tr key={log.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-bold text-white">
                              {log.customerName}
                              {log.customerPhone && (
                                <span className="block text-[10px] font-mono text-slate-400">{log.customerPhone}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-emerald-400">{log.urlPath}</td>
                            <td className="py-2.5 px-3">{log.productTitle || log.pageTitle}</td>
                            <td className="py-2.5 px-3 text-slate-400">{log.device}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SERVER-SIDE META PIXEL CAPI TRACKING EVENTS */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-sky-400" />
                      <span>{at('সার্ভার-সাইড পিক্সেল ট্র্যাকিং লগ (Server-Side Pixel Events)', 'Server-Side Pixel CAPI Events')}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {at(
                        'সার্ভার `/api/tracking/pixel` এর মাধ্যমে পাঠানো রিয়েল-টাইম ইভেন্টসমূহ',
                        'Real-time server-side events dispatched via /api/tracking/pixel for each SEO URL'
                      )}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/30">
                    {serverPixelEvents.length} Events
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Event</th>
                        <th className="py-2.5 px-3">URL Path</th>
                        <th className="py-2.5 px-3">Content / Value</th>
                        <th className="py-2.5 px-3">CAPI Status</th>
                        <th className="py-2.5 px-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {serverPixelEvents.slice(0, 30).map((ev) => (
                        <tr key={ev.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-bold text-white">{ev.eventName}</td>
                          <td className="py-2.5 px-3 font-mono text-sky-400">{ev.urlPath}</td>
                          <td className="py-2.5 px-3">
                            {ev.contentName || '—'}{' '}
                            {ev.value ? <span className="font-bold text-emerald-400">(৳{ev.value})</span> : ''}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ev.status === 'sent_capi'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {ev.status === 'sent_capi' ? 'Meta CAPI Sent' : 'Server Logged'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                            {new Date(ev.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: CUSTOMER REVIEWS FULL CRUD & BULK MODERATION */}
          {activeTab === 'reviews' && (() => {
            const visibleReviews = reviews.filter(
              (r) => reviewFilterProduct === 'all' || r.productId === reviewFilterProduct
            );
            const allVisibleSelected =
              visibleReviews.length > 0 && visibleReviews.every((r) => selectedReviewIds.includes(r.id));

            return (
              <div className="space-y-5 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-white">{at('কাস্টমার রিভিউ ও রেটিং', 'Customer Reviews & Ratings')}</h3>
                    <p className="text-xs text-slate-400">
                      {at('নতুন রিভিউ যোগ, এডিট, অনুমোদন, ভেরিফাইড টগল ও বাল্ক ডিলিট', 'Add, edit, approve/hide, toggle verified purchase & bulk moderate reviews')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={reviewFilterProduct}
                      onChange={(e) => {
                        setReviewFilterProduct(e.target.value);
                        setSelectedReviewIds([]);
                      }}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold max-w-[220px]"
                    >
                      <option value="all">{at(`সকল পণ্য (${reviews.length})`, `All Products (${reviews.length})`)}</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.titleBn || p.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReviewId(null);
                        setReviewForm({
                          productId: products[0]?.id || '',
                          customerName: '',
                          rating: 5,
                          comment: '',
                          date: new Date().toISOString().split('T')[0],
                          verifiedPurchase: true,
                          isApproved: true
                        });
                        setIsReviewModalOpen(true);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{at('নতুন রিভিউ যোগ', 'Add Review')}</span>
                    </button>
                  </div>
                </div>

                {selectedReviewIds.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-black text-emerald-300">
                      {at(`${selectedReviewIds.length}টি রিভিউ সিলেক্ট করা হয়েছে`, `${selectedReviewIds.length} review(s) selected`)}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          bulkUpdateReviews(selectedReviewIds, { isApproved: true });
                          setSelectedReviewIds([]);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                      >
                        {at('সব অ্যাপ্রুভ', 'Approve All')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          bulkUpdateReviews(selectedReviewIds, { isApproved: false });
                          setSelectedReviewIds([]);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
                      >
                        {at('হাইড করুন', 'Hide Selected')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          bulkUpdateReviews(selectedReviewIds, { verifiedPurchase: true });
                          setSelectedReviewIds([]);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white font-bold cursor-pointer"
                      >
                        {at('ভেরিফাইড চিহ্নিত', 'Mark Verified')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          bulkDeleteReviews(selectedReviewIds);
                          setSelectedReviewIds([]);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{at('বাল্ক ডিলিট', 'Bulk Delete')}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-3 w-10">
                            <input
                              type="checkbox"
                              checked={allVisibleSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedReviewIds(visibleReviews.map((r) => r.id));
                                } else {
                                  setSelectedReviewIds([]);
                                }
                              }}
                              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                            />
                          </th>
                          <th className="py-3 px-3">{at('ক্রেতার নাম', 'Customer')}</th>
                          <th className="py-3 px-3">{at('পণ্য', 'Product')}</th>
                          <th className="py-3 px-3">{at('রেটিং', 'Rating')}</th>
                          <th className="py-3 px-3">{at('মতামত', 'Comment')}</th>
                          <th className="py-3 px-3">{at('স্ট্যাটাস', 'Visibility')}</th>
                          <th className="py-3 px-3">{at('ভেরিফাইড', 'Verified')}</th>
                          <th className="py-3 px-3 text-right">{at('অ্যাকশন', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {visibleReviews.map((rev) => {
                          const prod = products.find((p) => p.id === rev.productId);
                          const isApproved = rev.isApproved !== false;
                          const isChecked = selectedReviewIds.includes(rev.id);
                          return (
                            <tr key={rev.id} className={`hover:bg-slate-800/40 ${isChecked ? 'bg-emerald-950/20' : ''}`}>
                              <td className="py-3 px-3">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedReviewIds((prev) => [...prev, rev.id]);
                                    } else {
                                      setSelectedReviewIds((prev) => prev.filter((id) => id !== rev.id));
                                    }
                                  }}
                                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-3">
                                <p className="font-bold text-white">{rev.customerName}</p>
                                <p className="text-[10px] text-slate-400">{rev.date}</p>
                              </td>
                              <td className="py-3 px-3 max-w-[160px] truncate text-slate-200 font-medium">
                                {prod ? (adminLang === 'en' ? prod.title : prod.titleBn) : rev.productId}
                              </td>
                              <td className="py-3 px-3 font-bold text-amber-400 whitespace-nowrap">{rev.rating} ★</td>
                              <td className="py-3 px-3 text-slate-300 max-w-xs">{rev.comment}</td>
                              <td className="py-3 px-3">
                                <button
                                  type="button"
                                  onClick={() => updateProductReview(rev.id, { isApproved: !isApproved })}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                                    isApproved
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                                  }`}
                                >
                                  {isApproved ? at('প্রকাশিত', 'Approved') : at('লুকানো', 'Hidden')}
                                </button>
                              </td>
                              <td className="py-3 px-3">
                                <button
                                  type="button"
                                  onClick={() => updateProductReview(rev.id, { verifiedPurchase: !rev.verifiedPurchase })}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                                    rev.verifiedPurchase
                                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                                  }`}
                                >
                                  {rev.verifiedPurchase ? 'Verified' : 'Unverified'}
                                </button>
                              </td>
                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingReviewId(rev.id);
                                      setReviewForm({
                                        productId: rev.productId,
                                        customerName: rev.customerName,
                                        rating: rev.rating,
                                        comment: rev.comment,
                                        date: rev.date,
                                        verifiedPurchase: rev.verifiedPurchase,
                                        isApproved: rev.isApproved !== false
                                      });
                                      setIsReviewModalOpen(true);
                                    }}
                                    title={at('রিভিউ এডিট করুন', 'Edit Review')}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteProductReview(rev.id)}
                                    title={at('রিভিউ মুছে ফেলুন', 'Delete Review')}
                                    className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {visibleReviews.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-500">
                              {at('এই পণ্যে কোনো রিভিউ পাওয়া যায়নি।', 'No reviews found for this filter.')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 14: CUSTOMERS MANUAL BALANCE CONTROL & STAFF TEAM */}
          {activeTab === 'users' && (
            <div className="space-y-8 animate-fade-in">
              {/* REGISTERED CUSTOMERS LIST WITH INLINE MANUAL BALANCE +/- */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-emerald-400" />
                      <span>{at('কাস্টমার তালিকা ও ম্যানুয়াল ব্যালেন্স নিয়ন্ত্রণ (+/-)', 'Customer List & Manual Balance Control (+/-)')}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {at('প্রতিটি কাস্টমারের ওয়ালেট ব্যালেন্স এখান থেকেই সরাসরি কমান বা বাড়ান', 'Increase or decrease any customer wallet balance directly from this list')}
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder={at('নাম, ফোন বা ইমেইল খুঁজুন...', 'Search name, phone or email...')}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">{at('কাস্টমার', 'Customer')}</th>
                        <th className="py-3 px-4">{at('ফোন ও ইমেইল', 'Phone & Email')}</th>
                        <th className="py-3 px-4">{at('পয়েন্ট', 'Points')}</th>
                        <th className="py-3 px-4">{at('বর্তমান ব্যালেন্স', 'Wallet Balance')}</th>
                        <th className="py-3 px-4 text-right">{at('ব্যালেন্স কমান / বাড়ান', 'Increase / Decrease')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {customerAccounts
                        .filter((acc) => {
                          const q = customerSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            acc.name.toLowerCase().includes(q) ||
                            acc.phone.toLowerCase().includes(q) ||
                            acc.email.toLowerCase().includes(q) ||
                            (acc.username || '').toLowerCase().includes(q)
                          );
                        })
                        .map((acc, idx) => {
                          const targetKey = acc.phone || acc.email || acc.username || String(idx);
                          const stepAmt = balanceAdjustAmounts[targetKey] ?? 50;
                          return (
                            <tr key={targetKey} className="hover:bg-slate-800/40">
                              <td className="py-3 px-4">
                                <p className="font-bold text-white">{acc.name}</p>
                                <p className="text-[10px] font-mono text-slate-400">@{acc.username || acc.phone}</p>
                              </td>
                              <td className="py-3 px-4 font-mono text-[11px]">
                                <p className="text-emerald-400">{acc.phone || '—'}</p>
                                <p className="text-slate-400">{acc.email || '—'}</p>
                              </td>
                              <td className="py-3 px-4 font-mono text-amber-400 font-bold">{acc.loyaltyPoints || 0} pts</td>
                              <td className="py-3 px-4 font-mono font-black text-base text-emerald-400">
                                ৳{(acc.walletBalance || 0).toLocaleString()}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-end gap-1.5">
                                  <input
                                    type="number"
                                    min={1}
                                    value={stepAmt}
                                    onChange={(e) =>
                                      setBalanceAdjustAmounts((prev) => ({
                                        ...prev,
                                        [targetKey]: Math.max(1, Number(e.target.value))
                                      }))
                                    }
                                    className="w-20 px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs text-center"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => adjustSpecificCustomerBalance(targetKey, -Math.abs(stepAmt), 'Admin Decreased')}
                                    className="px-2.5 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-700 text-rose-200 font-black text-xs cursor-pointer"
                                  >
                                    - ৳{stepAmt}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => adjustSpecificCustomerBalance(targetKey, Math.abs(stepAmt), 'Admin Increased')}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer"
                                  >
                                    + ৳{stepAmt}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      {customerAccounts.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-500">
                            {at('এখনও কোনো নিবন্ধিত কাস্টমার নেই।', 'No registered customers yet.')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">{t('ব্যবহারকারী ও স্টাফ টিম', 'Users & Staff Members')}</h3>
                  <p className="text-xs text-slate-400">{t('অ্যাডমিন, অর্ডার ম্যানেজার ও কাস্টমার সাপোর্ট সদস্যদের একাউন্ট রোল, এডিট, ডিলিট ও ইমপোর্ট/এক্সপোর্ট', 'Manage staff roles, edit, delete & bulk JSON import/export')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(users, null, 2));
                      const a = document.createElement('a');
                      a.setAttribute('href', dataStr);
                      a.setAttribute('download', `buyonebd-users-${Date.now()}.json`);
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      addToast('success', at('এক্সপোর্ট সফল!', 'Exported!'), `${users.length} users`);
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{at('এক্সপোর্ট', 'Export')}</span>
                  </button>
                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{at('ইমপোর্ট (JSON)', 'Import')}</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          try {
                            const imported = JSON.parse(ev.target?.result as string);
                            if (Array.isArray(imported)) {
                              let added = 0;
                              imported.forEach((u) => {
                                if (u.name && u.email) {
                                  addUser({
                                    name: u.name,
                                    email: u.email,
                                    phone: u.phone || '',
                                    role: u.role || 'order_manager',
                                    isActive: u.isActive ?? true
                                  });
                                  added++;
                                }
                              });
                              addToast('success', at('ইমপোর্ট সম্পন্ন!', 'Imported!'), `${added} users added.`);
                            }
                          } catch {
                            addToast('error', at('ভুল JSON ফাইল', 'Invalid JSON'), '');
                          }
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>
                  <button
                    onClick={openNewUserModal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('নতুন স্টাফ যোগ করুন', 'Add Staff')}</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">নাম</th>
                        <th className="py-3 px-4">ইমেইল</th>
                        <th className="py-3 px-4">ফোন</th>
                        <th className="py-3 px-4">রোল (Role)</th>
                        <th className="py-3 px-4">স্ট্যাটাস</th>
                        <th className="py-3 px-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/40">
                          <td className="py-3.5 px-4 font-bold text-white">{u.name}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-300">{u.email}</td>
                          <td className="py-3.5 px-4">{u.phone || 'N/A'}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.role === 'super_admin' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {u.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditUserModal(u)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {u.id !== 'usr-01' && (
                                <button
                                  onClick={() => {
                                    deleteUser(u.id);
                                  }}
                                  title={at('সদস্য মুছে ফেলুন', 'Delete Staff')}
                                  className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 15: FULL CMS - LOGO, COLORS, TEXTS, SEO & FOOTER */}
          {activeTab === 'design_footer' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-black text-white">{at('পূর্ণাঙ্গ CMS: লোগো, থিম কালার, SEO ও ফুটার এডিটর', 'Full Store CMS: Logo, Colors, Texts, SEO & Footer')}</h3>
                <p className="text-xs text-slate-400">{at('লোগো আপলোড, কালার প্যালেট, বাটন ও সেকশন টেক্সট, Google SEO মেটা ও ফুটার ১০০% পরিবর্তন করুন', 'Upload custom logo, customize colors, UI copy, full SEO metadata & footer')}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Store Branding & Logo Uploader */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>{at('স্টোর ব্র্যান্ডিং ও লোগো সেটআপ', 'Store Branding & Logo Setup')}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">{at('স্টোরের নাম (ইংরেজি)', 'Store Name (EN)')}</label>
                      <input
                        type="text"
                        value={settings.storeName}
                        onChange={(e) => updateSettings({ storeName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">{at('লোগো ডিসপ্লে মোড', 'Logo Mode')}</label>
                      <select
                        value={settings.logoMode || 'both'}
                        onChange={(e) => updateSettings({ logoMode: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      >
                        <option value="both">{at('লোগো ছবি + নাম', 'Logo Image + Text')}</option>
                        <option value="image">{at('শুধু লোগো ছবি', 'Image Only')}</option>
                        <option value="text">{at('শুধু টেক্সট লোগো', 'Text Only')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {settings.logoUrl ? (
                          <img src={settings.logoUrl} alt="Store Logo" className="h-10 max-w-[140px] object-contain rounded-lg bg-white p-1" />
                        ) : (
                          <div className="h-10 px-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center text-xs text-slate-500">
                            {at('কোনো লোগো নেই', 'No image')}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{at('লোগো আপলোড', 'Upload Logo')}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageFileUpload(e.target.files?.[0], (url) => updateSettings({ logoUrl: url }))
                            }
                          />
                        </label>
                        {settings.logoUrl && (
                          <button
                            type="button"
                            onClick={() => updateSettings({ logoUrl: '' })}
                            className="px-2.5 py-2 bg-rose-950/60 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            {at('মুছুন', 'Clear')}
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={settings.logoUrl || ''}
                      onChange={(e) => updateSettings({ logoUrl: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">{at('টপ বার ঘোষণা (বাংলা)', 'Announcement Bar (BN)')}</label>
                      <input
                        type="text"
                        value={settings.announcementBar?.textBn || ''}
                        onChange={(e) =>
                          updateSettings({ announcementBar: { ...settings.announcementBar, textBn: e.target.value } })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">{at('টপ বার ঘোষণা (ইংরেজি)', 'Announcement Bar (EN)')}</label>
                      <input
                        type="text"
                        value={settings.announcementBar?.textEn || ''}
                        onChange={(e) =>
                          updateSettings({ announcementBar: { ...settings.announcementBar, textEn: e.target.value } })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Theme Color Palette, Brand Attributes Generator & CMS Texts */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Palette className="w-4 h-4 text-amber-400" />
                      <span>{at('থিম কালার প্যালেট ও ব্র্যান্ড অ্যাট্রিবিউট', 'Theme Color Palette & Brand Attributes')}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => generateBrandColorAttributes(settings.themeColors?.primary)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>{at('অটো ব্র্যান্ড কালার অ্যাট্রিবিউট জেনারেট', 'Generate Brand Color Attributes')}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {[
                      { key: 'primary', label: 'Primary Accent' },
                      { key: 'secondary', label: 'Secondary Accent' },
                      { key: 'headerBg', label: 'Header BG' },
                      { key: 'footerBg', label: 'Footer BG' },
                      { key: 'heroFrom', label: 'Hero Gradient 1' },
                      { key: 'heroTo', label: 'Hero Gradient 2' }
                    ].map((c) => {
                      const val = (settings.themeColors as any)?.[c.key] || '#059669';
                      return (
                        <div key={c.key} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                          <input
                            type="color"
                            value={val}
                            onChange={(e) =>
                              updateSettings({
                                themeColors: { ...settings.themeColors!, [c.key]: e.target.value }
                              })
                            }
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                          />
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-slate-300 truncate">{c.label}</div>
                            <div className="text-[10px] font-mono text-slate-500">{val}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Generated Brand CSS Variables & Root Data Attributes */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-amber-300">
                        {at('লাইভ জেনারেটেড ব্র্যান্ড কালার অ্যাট্রিবিউটস (:root)', 'Live Generated Brand Attributes (:root CSS & data-*)')}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          const attrs =
                            settings.brandAttributes?.cssAttributeString ||
                            `--brand-primary: ${settings.themeColors?.primary || '#059669'};\n--brand-secondary: ${settings.themeColors?.secondary || '#0d9488'};`;
                          try {
                            await navigator.clipboard.writeText(attrs);
                            addToast('success', at('CSS অ্যাট্রিবিউট কপি হয়েছে!', 'CSS Attributes Copied!'), '');
                          } catch {}
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{at('কপি CSS', 'Copy Attributes')}</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                      <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                        data-theme="{settings.theme || 'gadgets'}"
                      </span>
                      <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: settings.themeColors?.primary || '#059669' }} />
                        data-brand-primary="{settings.themeColors?.primary || '#059669'}"
                      </span>
                      {settings.brandAttributes?.primaryHover && (
                        <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: settings.brandAttributes.primaryHover }} />
                          --brand-primary-hover: {settings.brandAttributes.primaryHover}
                        </span>
                      )}
                      {settings.brandAttributes?.onPrimary && (
                        <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                          --brand-on-primary: {settings.brandAttributes.onPrimary}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Trending Heading (BN)</label>
                      <input
                        type="text"
                        value={settings.cmsTexts?.trendingTitleBn || ''}
                        onChange={(e) =>
                          updateSettings({ cmsTexts: { ...settings.cmsTexts!, trendingTitleBn: e.target.value } })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Trending Heading (EN)</label>
                      <input
                        type="text"
                        value={settings.cmsTexts?.trendingTitleEn || ''}
                        onChange={(e) =>
                          updateSettings({ cmsTexts: { ...settings.cmsTexts!, trendingTitleEn: e.target.value } })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Order Button (BN)</label>
                      <input
                        type="text"
                        value={settings.cmsTexts?.orderNowBtnBn || ''}
                        onChange={(e) =>
                          updateSettings({ cmsTexts: { ...settings.cmsTexts!, orderNowBtnBn: e.target.value } })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Order Button (EN)</label>
                      <input
                        type="text"
                        value={settings.cmsTexts?.orderNowBtnEn || ''}
                        onChange={(e) =>
                          updateSettings({ cmsTexts: { ...settings.cmsTexts!, orderNowBtnEn: e.target.value } })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Full SEO Settings Studio (A to Z) */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <span>{at('সম্পূর্ণ SEO স্টুডিও (Google, Meta OG, Schema JSON-LD)', 'Complete SEO Studio (Search, OG Social & JSON-LD)')}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">Live updates `&lt;title&gt;`, `&lt;meta&gt;`, OpenGraph, Twitter Card & Schema.org</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    SEO Live Sync Active
                  </span>
                </div>

                {/* Live Google Search Snippet Preview */}
                <div className="p-4 rounded-xl bg-white text-slate-900 space-y-1 border border-slate-300">
                  <div className="text-[11px] text-emerald-700 font-mono truncate">
                    {settings.seoSettings?.canonicalUrl || 'https://buyonebd.com'}
                  </div>
                  <div className="text-base font-bold text-blue-700 line-clamp-1">
                    {settings.seoSettings?.metaTitle || settings.storeName}
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-2">
                    {settings.seoSettings?.metaDescription}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Meta Title (60 chars ideal)</label>
                    <input
                      type="text"
                      value={settings.seoSettings?.metaTitle || ''}
                      onChange={(e) =>
                        updateSettings({ seoSettings: { ...settings.seoSettings!, metaTitle: e.target.value } })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Canonical URL</label>
                    <input
                      type="text"
                      value={settings.seoSettings?.canonicalUrl || ''}
                      onChange={(e) =>
                        updateSettings({ seoSettings: { ...settings.seoSettings!, canonicalUrl: e.target.value } })
                      }
                      placeholder="https://buyonebd.com"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-slate-300 font-bold mb-1">Meta Description (155 chars ideal)</label>
                  <textarea
                    rows={2}
                    value={settings.seoSettings?.metaDescription || ''}
                    onChange={(e) =>
                      updateSettings({ seoSettings: { ...settings.seoSettings!, metaDescription: e.target.value } })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={settings.seoSettings?.keywords || ''}
                      onChange={(e) =>
                        updateSettings({ seoSettings: { ...settings.seoSettings!, keywords: e.target.value } })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Robots Indexing</label>
                    <select
                      value={settings.seoSettings?.robots || 'index, follow'}
                      onChange={(e) =>
                        updateSettings({ seoSettings: { ...settings.seoSettings!, robots: e.target.value } })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    >
                      <option value="index, follow">index, follow</option>
                      <option value="noindex, follow">noindex, follow</option>
                      <option value="noindex, nofollow">noindex, nofollow</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Schema.org Type</label>
                    <select
                      value={settings.seoSettings?.schemaType || 'Store'}
                      onChange={(e) =>
                        updateSettings({ seoSettings: { ...settings.seoSettings!, schemaType: e.target.value as any } })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    >
                      <option value="Store">Store</option>
                      <option value="OnlineStore">OnlineStore</option>
                      <option value="LocalBusiness">LocalBusiness</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">OpenGraph Share Image URL</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={settings.seoSettings?.ogImage || ''}
                        onChange={(e) =>
                          updateSettings({ seoSettings: { ...settings.seoSettings!, ogImage: e.target.value } })
                        }
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                      <label className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer flex items-center">
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageFileUpload(e.target.files?.[0], (url) =>
                              updateSettings({ seoSettings: { ...settings.seoSettings!, ogImage: url } })
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Google Search Verification Code</label>
                    <input
                      type="text"
                      value={settings.seoSettings?.googleSiteVerification || ''}
                      onChange={(e) =>
                        updateSettings({ seoSettings: { ...settings.seoSettings!, googleSiteVerification: e.target.value } })
                      }
                      placeholder="google-site-verification token..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Twitter / X Handle</label>
                    <input
                      type="text"
                      value={settings.seoSettings?.twitterHandle || ''}
                      onChange={(e) =>
                        updateSettings({ seoSettings: { ...settings.seoSettings!, twitterHandle: e.target.value } })
                      }
                      placeholder="@buyonebd"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                </div>

                {/* Technical SEO: robots.txt & sitemap.xml */}
                <div className="pt-3 border-t border-slate-800 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 font-bold text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.seoSettings?.sitemapEnabled ?? true}
                        onChange={(e) =>
                          updateSettings({
                            seoSettings: { ...settings.seoSettings!, sitemapEnabled: e.target.checked }
                          })
                        }
                        className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700"
                      />
                      <span>{at('অটোমেটিক XML সাইটম্যাপ চালু রাখুন (/sitemap.xml)', 'Enable Automatic XML Sitemap (/sitemap.xml)')}</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <a
                        href="/robots.txt"
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono text-[11px] flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>/robots.txt</span>
                      </a>
                      <a
                        href="/sitemap.xml"
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-[11px] flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        <span>/sitemap.xml</span>
                      </a>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-300 font-bold">robots.txt Content (Server Live Sync)</label>
                      <button
                        type="button"
                        onClick={() =>
                          updateSettings({
                            seoSettings: {
                              ...settings.seoSettings!,
                              robotsTxt:
                                'User-agent: *\nAllow: /\nDisallow: /hossain\nSitemap: https://buyonebd.com/sitemap.xml'
                            }
                          })
                        }
                        className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                      >
                        {at('ডিফল্ট লোড করুন', 'Reset Default')}
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={
                        settings.seoSettings?.robotsTxt ||
                        'User-agent: *\nAllow: /\nDisallow: /hossain\nSitemap: https://buyonebd.com/sitemap.xml'
                      }
                      onChange={(e) =>
                        updateSettings({
                          seoSettings: { ...settings.seoSettings!, robotsTxt: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-300 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Full Footer Editor */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-3">
                  {at('সম্পূর্ণ ফুটার কন্টেন্ট ও কুইক লিংক এডিটর', 'Complete Footer Content & Quick Links Editor')}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">{t('ফুটার সম্পর্কে (বাংলা বিবরণ)', 'About Text (Bangla)')}</label>
                    <textarea
                      rows={2}
                      value={settings.footerSettings?.aboutTextBn || ''}
                      onChange={(e) => {
                        updateSettings({
                          footerSettings: { ...settings.footerSettings, aboutTextBn: e.target.value }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">{at('ফুটার সম্পর্কে (ইংরেজি)', 'About Text (English)')}</label>
                    <textarea
                      rows={2}
                      value={settings.footerSettings?.aboutTextEn || ''}
                      onChange={(e) => {
                        updateSettings({
                          footerSettings: { ...settings.footerSettings, aboutTextEn: e.target.value }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">{t('হটলাইন নাম্বার', 'Hotline Phone')}</label>
                    <input
                      type="text"
                      value={settings.footerSettings?.hotline || ''}
                      onChange={(e) => {
                        updateSettings({
                          footerSettings: { ...settings.footerSettings, hotline: e.target.value }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">{t('হোয়াটসঅ্যাপ নাম্বার', 'WhatsApp Number')}</label>
                    <input
                      type="text"
                      value={settings.footerSettings?.whatsappNumber || ''}
                      onChange={(e) => {
                        updateSettings({
                          footerSettings: { ...settings.footerSettings, whatsappNumber: e.target.value }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">{t('সাপোর্ট ইমেইল', 'Support Email')}</label>
                    <input
                      type="email"
                      value={settings.footerSettings?.email || ''}
                      onChange={(e) => {
                        updateSettings({
                          footerSettings: { ...settings.footerSettings, email: e.target.value }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">{t('অফিসের ঠিকানা', 'Office Address')}</label>
                    <input
                      type="text"
                      value={settings.footerSettings?.address || ''}
                      onChange={(e) => {
                        updateSettings({
                          footerSettings: { ...settings.footerSettings, address: e.target.value }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Facebook Link</label>
                    <input
                      type="text"
                      value={settings.footerSettings?.facebookUrl || ''}
                      onChange={(e) => updateSettings({ footerSettings: { ...settings.footerSettings, facebookUrl: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Instagram Link</label>
                    <input
                      type="text"
                      value={settings.footerSettings?.instagramUrl || ''}
                      onChange={(e) => updateSettings({ footerSettings: { ...settings.footerSettings, instagramUrl: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">YouTube Link</label>
                    <input
                      type="text"
                      value={settings.footerSettings?.youtubeUrl || ''}
                      onChange={(e) => updateSettings({ footerSettings: { ...settings.footerSettings, youtubeUrl: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">TikTok Link</label>
                    <input
                      type="text"
                      value={settings.footerSettings?.tiktokUrl || ''}
                      onChange={(e) => updateSettings({ footerSettings: { ...settings.footerSettings, tiktokUrl: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                </div>

                {/* Editable Footer Quick Links */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{at('ফুটার কুইক লিংকসমূহ (Quick Links)', 'Footer Quick Links')}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const existing = settings.footerSettings?.quickLinks || [];
                        updateSettings({
                          footerSettings: {
                            ...settings.footerSettings,
                            quickLinks: [
                              ...existing,
                              { id: `ql-${Date.now()}`, labelBn: 'নতুন লিংক', labelEn: 'New Link', actionType: 'store' }
                            ]
                          }
                        });
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>{at('লিংক যোগ', 'Add Link')}</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(settings.footerSettings?.quickLinks || []).map((ql) => (
                      <div key={ql.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-xs">
                        <input
                          type="text"
                          value={ql.labelBn}
                          placeholder="Label (BN)"
                          onChange={(e) => {
                            const updated = (settings.footerSettings?.quickLinks || []).map((item) =>
                              item.id === ql.id ? { ...item, labelBn: e.target.value } : item
                            );
                            updateSettings({ footerSettings: { ...settings.footerSettings, quickLinks: updated } });
                          }}
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                        <input
                          type="text"
                          value={ql.labelEn}
                          placeholder="Label (EN)"
                          onChange={(e) => {
                            const updated = (settings.footerSettings?.quickLinks || []).map((item) =>
                              item.id === ql.id ? { ...item, labelEn: e.target.value } : item
                            );
                            updateSettings({ footerSettings: { ...settings.footerSettings, quickLinks: updated } });
                          }}
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                        <select
                          value={ql.actionType}
                          onChange={(e) => {
                            const updated = (settings.footerSettings?.quickLinks || []).map((item) =>
                              item.id === ql.id ? { ...item, actionType: e.target.value as any } : item
                            );
                            updateSettings({ footerSettings: { ...settings.footerSettings, quickLinks: updated } });
                          }}
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        >
                          <option value="tracking">Order Tracking</option>
                          <option value="flash_sale">Flash Sale</option>
                          <option value="store">Store Home</option>
                          <option value="url">External URL</option>
                        </select>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={ql.url || ''}
                            placeholder="https://..."
                            disabled={ql.actionType !== 'url'}
                            onChange={(e) => {
                              const updated = (settings.footerSettings?.quickLinks || []).map((item) =>
                                item.id === ql.id ? { ...item, url: e.target.value } : item
                              );
                              updateSettings({ footerSettings: { ...settings.footerSettings, quickLinks: updated } });
                            }}
                            className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white disabled:opacity-40"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (settings.footerSettings?.quickLinks || []).filter((i) => i.id !== ql.id);
                              updateSettings({ footerSettings: { ...settings.footerSettings, quickLinks: updated } });
                            }}
                            className="p-1.5 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">{t('কপিরাইট টেক্সট (বাংলা)', 'Copyright Text (BN)')}</label>
                    <input
                      type="text"
                      value={settings.footerSettings?.copyrightBn || ''}
                      onChange={(e) => {
                        updateSettings({
                          footerSettings: { ...settings.footerSettings, copyrightBn: e.target.value }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">{at('কপিরাইট টেক্সট (ইংরেজি)', 'Copyright Text (EN)')}</label>
                    <input
                      type="text"
                      value={settings.footerSettings?.copyrightEn || ''}
                      onChange={(e) => {
                        updateSettings({
                          footerSettings: { ...settings.footerSettings, copyrightEn: e.target.value }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-bold">
                    <input
                      type="checkbox"
                      checked={settings.footerSettings?.showPaymentBadges !== false}
                      onChange={(e) => {
                        updateSettings({
                          footerSettings: { ...settings.footerSettings, showPaymentBadges: e.target.checked }
                        });
                      }}
                      className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                    />
                    <span>বিকাশ, নগদ, রকেট ও কুরিয়ার পার্টনার ব্যাজ প্রদর্শন করুন</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-bold">
                    <input
                      type="checkbox"
                      checked={settings.footerSettings?.showCategoriesInFooter !== false}
                      onChange={(e) => {
                        updateSettings({
                          footerSettings: { ...settings.footerSettings, showCategoriesInFooter: e.target.checked }
                        });
                      }}
                      className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                    />
                    <span>{at('ফুটারে সকল ক্যাটাগরি লিংক দেখান', 'Show All Categories in Footer')}</span>
                  </label>
                </div>

                {/* Editable Single Product Page CMS */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span>{at('সিঙ্গেল প্রোডাক্ট পেজ CMS ও সেকশন কন্ট্রোল', 'Single Product Page CMS & Section Controls')}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      <div>
                      <label className="block text-slate-400 font-bold mb-1">Dhaka Label (BN / EN)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={settings.singleProductCms?.dhakaCityLabelBn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, dhakaCityLabelBn: e.target.value }
                            })
                          }
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                        <input
                          type="text"
                          value={settings.singleProductCms?.dhakaCityLabelEn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, dhakaCityLabelEn: e.target.value }
                            })
                          }
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Dhaka ETA (BN / EN)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={settings.singleProductCms?.dhakaEtaBn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, dhakaEtaBn: e.target.value }
                            })
                          }
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                        <input
                          type="text"
                          value={settings.singleProductCms?.dhakaEtaEn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, dhakaEtaEn: e.target.value }
                            })
                          }
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">COD Badge (BN / EN)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={settings.singleProductCms?.codTrustTextBn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, codTrustTextBn: e.target.value }
                            })
                          }
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                        <input
                          type="text"
                          value={settings.singleProductCms?.codTrustTextEn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, codTrustTextEn: e.target.value }
                            })
                          }
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Courier Policy Note (BN)</label>
                      <input
                        type="text"
                        value={settings.singleProductCms?.courierNoteTextBn || ''}
                        onChange={(e) =>
                          updateSettings({
                            singleProductCms: { ...settings.singleProductCms!, courierNoteTextBn: e.target.value }
                          })
                        }
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Return Policy Note (BN)</label>
                      <input
                        type="text"
                        value={settings.singleProductCms?.returnPolicyTextBn || ''}
                        onChange={(e) =>
                          updateSettings({
                            singleProductCms: { ...settings.singleProductCms!, returnPolicyTextBn: e.target.value }
                          })
                        }
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Color/Variant Label (BN / EN)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={settings.singleProductCms?.colorLabelBn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, colorLabelBn: e.target.value }
                            })
                          }
                          placeholder="কালার / ভ্যারিয়েন্ট:"
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                        <input
                          type="text"
                          value={settings.singleProductCms?.colorLabelEn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, colorLabelEn: e.target.value }
                            })
                          }
                          placeholder="Color / Variant:"
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Size/Edition Label (BN / EN)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={settings.singleProductCms?.sizeLabelBn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, sizeLabelBn: e.target.value }
                            })
                          }
                          placeholder="সাইজ / এডিশন:"
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                        <input
                          type="text"
                          value={settings.singleProductCms?.sizeLabelEn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, sizeLabelEn: e.target.value }
                            })
                          }
                          placeholder="Size / Edition:"
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Save Badge Label (BN / EN)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={settings.singleProductCms?.saveBadgeLabelBn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, saveBadgeLabelBn: e.target.value }
                            })
                          }
                          placeholder="সেভ"
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                        <input
                          type="text"
                          value={settings.singleProductCms?.saveBadgeLabelEn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, saveBadgeLabelEn: e.target.value }
                            })
                          }
                          placeholder="SAVE"
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">In-Stock Badge (BN / EN)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={settings.singleProductCms?.inStockLabelBn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, inStockLabelBn: e.target.value }
                            })
                          }
                          placeholder="স্টকে আছে"
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                        <input
                          type="text"
                          value={settings.singleProductCms?.inStockLabelEn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, inStockLabelEn: e.target.value }
                            })
                          }
                          placeholder="In Stock"
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Out-of-Stock Badge (BN / EN)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={settings.singleProductCms?.outOfStockLabelBn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, outOfStockLabelBn: e.target.value }
                            })
                          }
                          placeholder="স্টক শেষ"
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                        <input
                          type="text"
                          value={settings.singleProductCms?.outOfStockLabelEn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, outOfStockLabelEn: e.target.value }
                            })
                          }
                          placeholder="Stock Out"
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Points Divisor (৳ per 1 pt) & Loyalty Label</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <input
                          type="number"
                          min={1}
                          value={settings.singleProductCms?.pointsPerOrderDivisor ?? 20}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: {
                                ...settings.singleProductCms!,
                                pointsPerOrderDivisor: Math.max(1, Number(e.target.value) || 20)
                              }
                            })
                          }
                          className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                        />
                        <input
                          type="text"
                          value={settings.singleProductCms?.loyaltyTextBn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, loyaltyTextBn: e.target.value }
                            })
                          }
                          placeholder="অর্জিত পয়েন্ট:"
                          className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                        <input
                          type="text"
                          value={settings.singleProductCms?.loyaltyTextEn || ''}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, loyaltyTextEn: e.target.value }
                            })
                          }
                          placeholder="Earn Points:"
                          className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                    {(
                      [
                        ['showDeliveryMatrix', 'ডেলিভারি রেট বক্স (Delivery Matrix)'],
                        ['showWarrantyBadge', 'ওয়ারেন্টি ব্যাজ (Warranty)'],
                        ['showReturnPolicy', 'রিটার্ন পলিসি (Return Policy)'],
                        ['showFlashSaleSection', 'ফ্ল্যাশ সেল সেকশন (Flash Sale)'],
                        ['showPriceAlertButton', 'প্রাইস অ্যালার্ট (Price Alert)'],
                        ['showLoyaltyBadge', 'লয়্যালটি পয়েন্ট ব্যাজ']
                      ] as const
                    ).map(([field, label]) => (
                      <label key={field} className="flex items-center gap-1.5 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={settings.singleProductCms?.[field] !== false}
                          onChange={(e) =>
                            updateSettings({
                              singleProductCms: { ...settings.singleProductCms!, [field]: e.target.checked }
                            })
                          }
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Editable Home Storefront USP Feature Strip */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>{at('হোম স্টোরফ্রন্ট ফিচার স্ট্রিপ (৪টি USP কার্ড)', 'Editable Home USP Feature Strip')}</span>
                    </h4>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.organicMarketing?.homeFeatureStrip?.enabled ?? true}
                        onChange={(e) =>
                          updateSettings({
                            organicMarketing: {
                              ...settings.organicMarketing!,
                              homeFeatureStrip: {
                                ...settings.organicMarketing!.homeFeatureStrip,
                                enabled: e.target.checked
                              }
                            }
                          })
                        }
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <span>{at('চালু রাখুন', 'Show on Home')}</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {(settings.organicMarketing?.homeFeatureStrip?.items || []).map((item, idx) => (
                      <div key={item.id || idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={item.titleBn}
                            onChange={(e) => {
                              const next = (settings.organicMarketing?.homeFeatureStrip?.items || []).map((row, i) =>
                                i === idx ? { ...row, titleBn: e.target.value } : row
                              );
                              updateSettings({
                                organicMarketing: {
                                  ...settings.organicMarketing!,
                                  homeFeatureStrip: { ...settings.organicMarketing!.homeFeatureStrip, items: next }
                                }
                              });
                            }}
                            placeholder="Title BN"
                            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold"
                          />
                          <input
                            type="text"
                            value={item.titleEn}
                            onChange={(e) => {
                              const next = (settings.organicMarketing?.homeFeatureStrip?.items || []).map((row, i) =>
                                i === idx ? { ...row, titleEn: e.target.value } : row
                              );
                              updateSettings({
                                organicMarketing: {
                                  ...settings.organicMarketing!,
                                  homeFeatureStrip: { ...settings.organicMarketing!.homeFeatureStrip, items: next }
                                }
                              });
                            }}
                            placeholder="Title EN"
                            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={item.subBn}
                            onChange={(e) => {
                              const next = (settings.organicMarketing?.homeFeatureStrip?.items || []).map((row, i) =>
                                i === idx ? { ...row, subBn: e.target.value } : row
                              );
                              updateSettings({
                                organicMarketing: {
                                  ...settings.organicMarketing!,
                                  homeFeatureStrip: { ...settings.organicMarketing!.homeFeatureStrip, items: next }
                                }
                              });
                            }}
                            placeholder="Subtitle BN"
                            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300"
                          />
                          <input
                            type="text"
                            value={item.subEn}
                            onChange={(e) => {
                              const next = (settings.organicMarketing?.homeFeatureStrip?.items || []).map((row, i) =>
                                i === idx ? { ...row, subEn: e.target.value } : row
                              );
                              updateSettings({
                                organicMarketing: {
                                  ...settings.organicMarketing!,
                                  homeFeatureStrip: { ...settings.organicMarketing!.homeFeatureStrip, items: next }
                                }
                              });
                            }}
                            placeholder="Subtitle EN"
                            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => addToast('success', t('সংরক্ষিত হয়েছে!', 'Saved!'), t('CMS ও ফুটার সেটিংস সফলভাবে আপডেট করা হয়েছে।', 'CMS & Footer settings saved.'))}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  {at('সম্পূর্ণ CMS ও SEO সেভ করুন', 'Save All CMS, SEO & Footer Settings')}
                </button>
              </div>
            </div>
          )}

          {/* TAB 16: SETTINGS (PAYMENT, 64 DISTRICTS DELIVERY & 10 BUSINESS THEMES) */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-black text-white">{t('পেমেন্ট, ডেলিভারি ও বিজনেস থিম সেটিংস', 'Payment, Delivery & Business Theme Settings')}</h3>
                <p className="text-xs text-slate-400">{t('১০টি বিজনেস থিম ও অটো-ক্যাটাগরি, বিকাশ/নগদ/রকেট মার্চেন্ট ও ৬৪ জেলার ডেলিভারি রেট', '10 Business Themes with Auto-Categories, MFS accounts and 64-district delivery rates')}</p>
              </div>

              {/* 10 Business Theme Presets with Colors & Auto-Categories */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>{at('১০টি প্রিমিয়াম বিজনেস থিম ও অটো ক্যাটাগরি', '10 Business Theme Presets & Auto Categories')}</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {at('আপনার ব্যবসার ধরন অনুযায়ী ১ ক্লিকে সম্পূর্ণ কালার থিম ও ক্যাটাগরি সেট করুন', 'Apply theme colors or sync starter categories for your niche in 1 click')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {BUSINESS_THEME_PRESETS.map((preset) => {
                    const isSelected = settings.theme === preset.id;
                    return (
                      <div
                        key={preset.id}
                        className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{preset.emoji}</span>
                            <div className="flex items-center gap-1">
                              <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: preset.colors.primary }} />
                              <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: preset.colors.heroFrom }} />
                            </div>
                          </div>
                          <span className="font-bold text-xs text-white block">{at(preset.nameBn, preset.nameEn)}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{at(preset.descBn, preset.descEn)}</span>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => applyBusinessTheme(preset.id || 'gadgets', false)}
                            className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-white text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            {at('থিম কালার দিন', 'Apply Colors')}
                          </button>
                          <button
                            type="button"
                            onClick={() => applyBusinessTheme(preset.id || 'gadgets', true)}
                            className="w-full py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            {at('+ অটো ক্যাটাগরি', '+ Theme & Cats')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Numbers */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h4 className="font-bold text-white text-sm">{t('মোবাইল ফিন্যান্সিয়াল সার্ভিস (MFS) একাউন্ট', 'Payment Gateways')}</h4>

                  <div>
                    <label className="block text-xs font-bold text-pink-400 mb-1">bKash বিকাশ মার্চেন্ট নাম্বার</label>
                    <input
                      type="text"
                      value={settings.paymentSettings?.bkashMerchant || ''}
                      onChange={(e) => {
                        updateSettings({
                          paymentSettings: {
                            ...settings.paymentSettings,
                            bkashMerchant: e.target.value
                          }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-orange-400 mb-1">Nagad নগদ মার্চেন্ট নাম্বার</label>
                    <input
                      type="text"
                      value={settings.paymentSettings?.nagadMerchant || ''}
                      onChange={(e) => {
                        updateSettings({
                          paymentSettings: {
                            ...settings.paymentSettings,
                            nagadMerchant: e.target.value
                          }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-400 mb-1">Rocket রকেট মার্চেন্ট নাম্বার</label>
                    <input
                      type="text"
                      value={settings.paymentSettings?.rocketMerchant || ''}
                      onChange={(e) => {
                        updateSettings({
                          paymentSettings: {
                            ...settings.paymentSettings,
                            rocketMerchant: e.target.value
                          }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={settings.paymentSettings?.requireAdvanceDeliveryFee || false}
                        onChange={(e) => {
                          updateSettings({
                            paymentSettings: {
                              ...settings.paymentSettings,
                              requireAdvanceDeliveryFee: e.target.checked
                            }
                          });
                        }}
                        className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                      />
                      <span>ঢাকার বাইরের অর্ডারে ডেলিভারি চার্জ অগ্রিম গ্রহণ করুন</span>
                    </label>
                  </div>
                </div>

                {/* Delivery Fees for Bangladesh */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h4 className="font-bold text-white text-sm">{t('বাংলাদেশের ৩টি ডেলিভারি জোন রেট', 'Delivery Fees (BDT)')}</h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">ঢাকা সিটির ভিতরে (Inside Dhaka)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-400">৳</span>
                      <input
                        type="number"
                        value={settings.deliveryFees?.dhakaInside || 60}
                        onChange={(e) => {
                          updateSettings({
                            deliveryFees: {
                              ...settings.deliveryFees,
                              dhakaInside: Number(e.target.value)
                            }
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">ঢাকা উপশহর (Sub Dhaka - সাভার, গাজীপুর, কেরানীগঞ্জ, নারায়ণগঞ্জ)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-400">৳</span>
                      <input
                        type="number"
                        value={settings.deliveryFees?.dhakaSub || 100}
                        onChange={(e) => {
                          updateSettings({
                            deliveryFees: {
                              ...settings.deliveryFees,
                              dhakaSub: Number(e.target.value)
                            }
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">ঢাকার বাইরে সমগ্র বাংলাদেশ (Outside Dhaka - ৬৪ জেলা)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-400">৳</span>
                      <input
                        type="number"
                        value={settings.deliveryFees?.dhakaOutside || 120}
                        onChange={(e) => {
                          updateSettings({
                            deliveryFees: {
                              ...settings.deliveryFees,
                              dhakaOutside: Number(e.target.value)
                            }
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* REAL EMAIL SMTP SERVER SETTINGS & TESTER */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-sky-500/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4 text-sky-400" />
                      <span>{at('ইমেইল SMTP সার্ভার কনফিগারেশন (Nodemailer Live)', 'Email SMTP Server Settings (Live Verification)')}</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {at('অটো অর্ডার কনফার্মেশন ইমেইল ও ক্যাম্পেইন পাঠাতে Gmail / cPanel / Zoho / Hostinger SMTP সংযুক্ত করুন', 'Configure Gmail, cPanel, or Hostinger SMTP for order emails & campaigns')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateSettings({
                          smtpSettings: {
                            ...settings.smtpSettings!,
                            host: 'smtp.gmail.com',
                            port: 465,
                            secure: true,
                            enabled: true
                          }
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-sky-300 cursor-pointer"
                    >
                      Gmail SSL (:465)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateSettings({
                          smtpSettings: {
                            ...settings.smtpSettings!,
                            host: 'mail.buyonebd.com',
                            port: 465,
                            secure: true,
                            enabled: true
                          }
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-emerald-300 cursor-pointer"
                    >
                      cPanel / Webmail (:465)
                    </button>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-emerald-400 pl-2">
                      <input
                        type="checkbox"
                        checked={settings.smtpSettings?.enabled ?? false}
                        onChange={(e) =>
                          updateSettings({
                            smtpSettings: { ...settings.smtpSettings!, enabled: e.target.checked }
                          })
                        }
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <span>{at('SMTP চালু', 'Enabled')}</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">SMTP Host *</label>
                    <input
                      type="text"
                      value={settings.smtpSettings?.host || ''}
                      onChange={(e) =>
                        updateSettings({
                          smtpSettings: { ...settings.smtpSettings!, host: e.target.value }
                        })
                      }
                      placeholder="smtp.gmail.com"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">SMTP Port *</label>
                    <input
                      type="number"
                      value={settings.smtpSettings?.port ?? 465}
                      onChange={(e) =>
                        updateSettings({
                          smtpSettings: { ...settings.smtpSettings!, port: Number(e.target.value) }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">SMTP Username *</label>
                    <input
                      type="text"
                      value={settings.smtpSettings?.user || ''}
                      onChange={(e) =>
                        updateSettings({
                          smtpSettings: { ...settings.smtpSettings!, user: e.target.value }
                        })
                      }
                      placeholder="support@buyonebd.com"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">SMTP Password / App Pass *</label>
                    <input
                      type="password"
                      value={settings.smtpSettings?.pass || ''}
                      onChange={(e) =>
                        updateSettings({
                          smtpSettings: { ...settings.smtpSettings!, pass: e.target.value }
                        })
                      }
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">From Name</label>
                    <input
                      type="text"
                      value={settings.smtpSettings?.fromName || ''}
                      onChange={(e) =>
                        updateSettings({
                          smtpSettings: { ...settings.smtpSettings!, fromName: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">From Email</label>
                    <input
                      type="email"
                      value={settings.smtpSettings?.fromEmail || ''}
                      onChange={(e) =>
                        updateSettings({
                          smtpSettings: { ...settings.smtpSettings!, fromEmail: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smtpSettings?.secure ?? true}
                      onChange={(e) =>
                        updateSettings({
                          smtpSettings: { ...settings.smtpSettings!, secure: e.target.checked }
                        })
                      }
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    <span>Use SSL/TLS Encryption (Port 465)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smtpSettings?.sendOnOrderConfirmation ?? true}
                      onChange={(e) =>
                        updateSettings({
                          smtpSettings: { ...settings.smtpSettings!, sendOnOrderConfirmation: e.target.checked }
                        })
                      }
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    <span>{at('নতুন অর্ডারে অটো SMTP ইমেইল পাঠান', 'Auto-Send Order Email on New Orders')}</span>
                  </label>
                </div>

                {/* Live Verify & Test Email Box */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 text-xs">
                  <input
                    type="email"
                    value={smtpTestEmail}
                    onChange={(e) => setSmtpTestEmail(e.target.value)}
                    placeholder={at('টেস্ট ইমেইল প্রাপক (যেমন hossain@gmail.com)', 'Recipient email for SMTP test...')}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                  <button
                    type="button"
                    disabled={isTestingSmtp}
                    onClick={async () => {
                      setIsTestingSmtp(true);
                      try {
                        const res = await fetch('/api/email/test', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            smtp: settings.smtpSettings,
                            testTo: smtpTestEmail.trim() || settings.supportEmail || undefined
                          })
                        });
                        const data = await res.json();
                        if (res.ok && data.success) {
                          addToast('success', at('SMTP কানেকশন সফল!', 'SMTP Verified & Sent!'), data.message || 'SMTP connection works!');
                        } else {
                          addToast('error', at('SMTP কানেকশন ব্যর্থ', 'SMTP Failed'), data.error || 'Check SMTP credentials');
                        }
                      } catch {
                        addToast('error', at('সার্ভার পাওয়া যায়নি', 'Network Error'), 'Could not connect to /api/email/test');
                      } finally {
                        setIsTestingSmtp(false);
                      }
                    }}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isTestingSmtp ? at('যাচাই হচ্ছে...', 'Verifying...') : at('SMTP কানেকশন যাচাই ও টেস্ট ইমেইল', 'Verify & Send Test Email')}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => addToast('success', t('সংরক্ষিত হয়েছে!', 'Saved!'), t('পেমেন্ট, ডেলিভারি ও SMTP সেটিংস আপডেট হয়েছে।', 'Payment, Delivery & SMTP settings updated.'))}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  {t('সেটিংস সংরক্ষণ করুন', 'Save Settings')}
                </button>

                <button
                  type="button"
                  onClick={resetAllToDefault}
                  className="px-4 py-2 bg-rose-950/50 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{at('ডেমো ডাটা সম্পূর্ণ রিসেট করুন', 'Factory Reset Demo Data')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 17: MEDIA & GALLERY (ALL UPLOADS, BULK SELECT, BULK DELETE, IMAGE RESIZE) */}
          {activeTab === 'media_gallery' && (() => {
            const filteredMedia = mediaLibrary.filter((item) => {
              const matchesSource = mediaSourceFilter === 'all' || item.source === mediaSourceFilter;
              const q = mediaSearch.trim().toLowerCase();
              const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.source.toLowerCase().includes(q);
              return matchesSource && matchesSearch;
            });

            const allFilteredSelected =
              filteredMedia.length > 0 && filteredMedia.every((m) => selectedMediaIds.includes(m.id));

            const toggleSelectMedia = (id: string) => {
              setSelectedMediaIds((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
              );
            };

            const handleToggleSelectAll = () => {
              if (allFilteredSelected) {
                const filteredSet = new Set(filteredMedia.map((m) => m.id));
                setSelectedMediaIds((prev) => prev.filter((id) => !filteredSet.has(id)));
              } else {
                const merged = new Set([...selectedMediaIds, ...filteredMedia.map((m) => m.id)]);
                setSelectedMediaIds(Array.from(merged));
              }
            };

            const handleBulkDelete = () => {
              if (selectedMediaIds.length === 0) return;
              deleteMediaItems(selectedMediaIds);
              setSelectedMediaIds([]);
            };

            const handleResizeAction = async (targetIds: string[]) => {
              if (targetIds.length === 0) return;
              setIsResizingMedia(true);
              try {
                await resizeMediaItems(targetIds, resizeWidth, resizeHeight, resizeQuality / 100, resizeKeepAspect);
              } finally {
                setIsResizingMedia(false);
              }
            };

            return (
              <div className="space-y-6 animate-fade-in">
                {/* Header + Multi-Upload */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <ImagePlus className="w-5 h-5 text-emerald-400" />
                      <span>{at('সকল মিডিয়া ও গ্যালারি ম্যানেজার', 'All Media & Gallery Manager')}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {at(
                        'স্টোরের সকল আপলোডকৃত ছবি দেখুন, একসাথে একাধিক সিলেক্ট করে ডিলিট বা নির্দিষ্ট পিক্সেলে রিসাইজ করুন',
                        'All uploaded store media in one gallery — bulk select, bulk delete, and live canvas resize'
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const added = syncStoreMediaLibrary();
                        addToast(
                          'info',
                          at('মিডিয়া সিঙ্ক সম্পন্ন', 'Media Synced'),
                          at(`${added}টি নতুন ছবি গ্যালারিতে যুক্ত হয়েছে`, `Added ${added} store media item(s)`)
                        );
                      }}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{at('স্টোর ছবি সিঙ্ক', 'Sync Store Media')}</span>
                    </button>

                    <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>{at('বাল্ক ছবি আপলোড (+)', 'Bulk Upload Media')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach((f) => handleImageFileUpload(f, () => {}, 'upload'));
                          if (files.length > 0) {
                            addToast(
                              'success',
                              at(`${files.length}টি ছবি আপলোড হচ্ছে`, `Uploading ${files.length} image(s)`),
                              at('গ্যালারিতে যুক্ত হয়েছে।', 'Added to Media Gallery.')
                            );
                          }
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Resize Tool + Bulk Selection Toolbar */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        {allFilteredSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>
                          {allFilteredSelected
                            ? at('সিলেকশন বাতিল', 'Deselect All')
                            : at(`সব সিলেক্ট (${filteredMedia.length})`, `Select All (${filteredMedia.length})`)}
                        </span>
                      </button>

                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400">
                        {at(`সিলেক্টেড: ${selectedMediaIds.length}টি`, `Selected: ${selectedMediaIds.length}`)}
                      </span>

                      <button
                        type="button"
                        disabled={selectedMediaIds.length === 0}
                        onClick={handleBulkDelete}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 disabled:opacity-40 disabled:cursor-not-allowed border border-rose-700 text-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{at(`সিলেক্টেড মুছুন (${selectedMediaIds.length})`, `Bulk Delete (${selectedMediaIds.length})`)}</span>
                      </button>
                    </div>

                    <div className="relative min-w-[200px]">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={mediaSearch}
                        onChange={(e) => setMediaSearch(e.target.value)}
                        placeholder={at('ছবির নাম খুঁজুন...', 'Search media name...')}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Interactive Image Resizer Controls */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <Maximize2 className="w-4 h-4 text-amber-400" />
                        <span>{at('বাল্ক / একক ছবি রিসাইজার (Canvas Resize)', 'Bulk / Single Image Resizer')}</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                        {[
                          { label: '600×600 (Product)', w: 600, h: 600 },
                          { label: '800×800 (HD)', w: 800, h: 800 },
                          { label: '1200×525 (Slider)', w: 1200, h: 525 },
                          { label: '1200×630 (SEO OG)', w: 1200, h: 630 },
                          { label: '400×400 (Icon)', w: 400, h: 400 }
                        ].map((pre) => (
                          <button
                            key={pre.label}
                            type="button"
                            onClick={() => {
                              setResizeWidth(pre.w);
                              setResizeHeight(pre.h);
                            }}
                            className={`px-2 py-1 rounded-lg border cursor-pointer ${
                              resizeWidth === pre.w && resizeHeight === pre.h
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            {pre.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 items-end text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">{at('প্রস্থ (Width px)', 'Width (px)')}</label>
                        <input
                          type="number"
                          min={50}
                          max={2400}
                          value={resizeWidth}
                          onChange={(e) => setResizeWidth(Number(e.target.value) || 600)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">{at('উচ্চতা (Height px)', 'Height (px)')}</label>
                        <input
                          type="number"
                          min={50}
                          max={2400}
                          disabled={resizeKeepAspect}
                          value={resizeHeight}
                          onChange={(e) => setResizeHeight(Number(e.target.value) || 600)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">{at(`কোয়ালিটি: ${resizeQuality}%`, `Quality: ${resizeQuality}%`)}</label>
                        <input
                          type="range"
                          min={40}
                          max={100}
                          value={resizeQuality}
                          onChange={(e) => setResizeQuality(Number(e.target.value))}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300 py-1.5">
                        <input
                          type="checkbox"
                          checked={resizeKeepAspect}
                          onChange={(e) => setResizeKeepAspect(e.target.checked)}
                          className="w-4 h-4 rounded accent-emerald-500"
                        />
                        <span>{at('অনুপাত ঠিক রাখুন', 'Keep Aspect')}</span>
                      </label>
                      <button
                        type="button"
                        disabled={selectedMediaIds.length === 0 || isResizingMedia}
                        onClick={() => handleResizeAction(selectedMediaIds)}
                        className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>
                          {isResizingMedia
                            ? at('রিসাইজ হচ্ছে...', 'Resizing...')
                            : at(`রিসাইজ (${selectedMediaIds.length})`, `Resize Selected (${selectedMediaIds.length})`)}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Source Filter Pills */}
                  <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                    {(['all', 'product', 'slider', 'logo', 'category', 'seo', 'upload'] as const).map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setMediaSourceFilter(src)}
                        className={`px-3 py-1 rounded-full border cursor-pointer ${
                          mediaSourceFilter === src
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {src === 'all'
                          ? at(`সকল (${mediaLibrary.length})`, `All (${mediaLibrary.length})`)
                          : src.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gallery Grid */}
                {filteredMedia.length === 0 ? (
                  <div className="p-10 text-center rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-500">
                    {at('কোনো মিডিয়া পাওয়া যায়নি। নতুন ছবি আপলোড করুন।', 'No media found. Upload images above.')}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                    {filteredMedia.map((item) => {
                      const isSelected = selectedMediaIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleSelectMedia(item.id)}
                          className={`rounded-2xl overflow-hidden border bg-slate-900 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-emerald-500 ring-2 ring-emerald-500/40'
                              : 'border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="aspect-square bg-slate-950 relative overflow-hidden">
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2">
                              <span
                                className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                                  isSelected
                                    ? 'bg-emerald-600 border-emerald-400 text-white'
                                    : 'bg-slate-950/80 border-slate-700 text-slate-300'
                                }`}
                              >
                                {isSelected ? <Check className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                              </span>
                            </div>
                            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-white text-[9px] font-bold uppercase">
                              {item.source}
                            </span>
                            <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/75 text-emerald-300 text-[9px] font-mono font-bold">
                              {item.width}×{item.height} • {item.sizeKb}KB
                            </span>
                          </div>

                          <div className="p-2.5 space-y-2" onClick={(e) => e.stopPropagation()}>
                            <p className="text-[11px] font-bold text-white truncate" title={item.name}>
                              {item.name}
                            </p>
                            <div className="flex items-center justify-between gap-1">
                              <button
                                type="button"
                                onClick={() => handleResizeAction([item.id])}
                                className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                                title={at(`${resizeWidth}×${resizeHeight}-এ রিসাইজ`, `Resize to ${resizeWidth}×${resizeHeight}`)}
                              >
                                <Maximize2 className="w-3 h-3" />
                                <span>{resizeWidth}×{resizeHeight}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(item.url);
                                  addToast('success', at('URL কপি হয়েছে', 'URL Copied'), item.name);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                title="Copy URL"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteMediaItems([item.id])}
                                className="p-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 cursor-pointer"
                                title={at('মুছুন', 'Delete')}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 18: WALLET TOP-UP & 30-DAY EXPIRY CONTROL (bKash, Nagad, Rocket, Upay) */}
          {activeTab === 'wallet_control' && (() => {
            const wCfg = settings.walletSettings || {
              enabled: true,
              autoApprove: false,
              expiryDays: 30,
              minTopUp: 50,
              maxTopUp: 50000,
              methods: {
                bkash: { enabled: true, label: 'bKash', accountNumber: '01886289663', accountType: 'Personal' as const },
                nagad: { enabled: true, label: 'Nagad', accountNumber: '01886289663', accountType: 'Personal' as const },
                rocket: { enabled: true, label: 'Rocket', accountNumber: '018862896630', accountType: 'Personal' as const },
                upay: { enabled: true, label: 'Upay', accountNumber: '01886289663', accountType: 'Personal' as const }
              }
            };

            const updateWalletCfg = (patch: Partial<typeof wCfg>) => {
              updateSettings({
                walletSettings: {
                  ...wCfg,
                  ...patch
                }
              });
            };

            const filteredTopUps = walletTopUps.filter(
              (r) => walletStatusFilter === 'all' || r.status === walletStatusFilter
            );

            return (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-emerald-400" />
                      <span>{at('কাস্টমার ওয়ালেট, MFS অ্যাড ব্যালেন্স ও ৩০-দিন মেয়াদ কন্ট্রোল', 'Wallet Top-Up & 30-Day Expiry Control')}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {at(
                        'বিকাশ/নগদ/রকেট/উপায় দিয়ে কাস্টমার ব্যালেন্স অ্যাড নিয়ন্ত্রণ, অনুমোদন এবং ৩০ দিন না কিনলে ব্যালেন্স শূন্য নীতি পরিচালনা করুন',
                        'Control customer Add Balance (bKash/Nagad/Rocket/Upay), approve TrxIDs, and enforce 30-day inactivity expiry'
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
                      {at(`সক্রিয় ওয়ালেট: ৳${customerWalletBalance.toLocaleString()}`, `Active Wallet: ৳${customerWalletBalance.toLocaleString()}`)}
                    </span>
                  </div>
                </div>

                {/* Top Controls: Policy + MFS Gateways */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Expiry & Master Rules */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>{at('৩০-দিন না কিনলে ব্যালেন্স শূন্য নীতি ও মাস্টার সেটিংস', '30-Day Inactivity Zero-Out & Master Control')}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                        <span className="font-bold text-slate-200">{at('ব্যালেন্স অ্যাড চালু', 'Allow Customer Top-Up')}</span>
                        <input
                          type="checkbox"
                          checked={wCfg.enabled}
                          onChange={(e) => updateWalletCfg({ enabled: e.target.checked })}
                          className="w-4 h-4 accent-emerald-500"
                        />
                      </label>
                      <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                        <span className="font-bold text-slate-200">{at('অটো-অ্যাপ্রুভ', 'Auto-Approve Top-Ups')}</span>
                        <input
                          type="checkbox"
                          checked={wCfg.autoApprove}
                          onChange={(e) => updateWalletCfg({ autoApprove: e.target.checked })}
                          className="w-4 h-4 accent-emerald-500"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">{at('মেয়াদ (দিন)', 'Expiry Days')}</label>
                        <input
                          type="number"
                          min={1}
                          max={365}
                          value={wCfg.expiryDays}
                          onChange={(e) => updateWalletCfg({ expiryDays: Math.max(1, Number(e.target.value) || 30) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">{at('সর্বনিম্ন ৳', 'Min Top-Up')}</label>
                        <input
                          type="number"
                          min={10}
                          value={wCfg.minTopUp}
                          onChange={(e) => updateWalletCfg({ minTopUp: Math.max(10, Number(e.target.value) || 50) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">{at('সর্বোচ্চ ৳', 'Max Top-Up')}</label>
                        <input
                          type="number"
                          min={100}
                          value={wCfg.maxTopUp}
                          onChange={(e) => updateWalletCfg({ maxTopUp: Math.max(100, Number(e.target.value) || 50000) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-amber-200">
                        <span>
                          {at(
                            `শেষ অর্ডার: ${walletLastPurchaseAt ? new Date(walletLastPurchaseAt).toLocaleDateString() : 'এখনো কিনেনি'} • বাকি: ${walletDaysRemaining} দিন`,
                            `Last Purchase: ${walletLastPurchaseAt ? new Date(walletLastPurchaseAt).toLocaleDateString() : 'None yet'} • Remaining: ${walletDaysRemaining}d`
                          )}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const count = runWalletExpirySweep(false);
                              if (count === 0) {
                                addToast('info', at('কোনো মেয়াদোত্তীর্ণ ব্যালেন্স নেই', 'No Expired Wallets'), at(`${walletDaysRemaining} দিন বাকি আছে।`, `${walletDaysRemaining} days remaining.`));
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold cursor-pointer"
                          >
                            {at('মেয়াদ চেক করুন', 'Check Expiry')}
                          </button>
                          <button
                            type="button"
                            onClick={() => runWalletExpirySweep(true)}
                            className="px-2.5 py-1 rounded-lg bg-rose-900 hover:bg-rose-800 text-rose-100 text-[10px] font-bold cursor-pointer"
                          >
                            {at('৩০ দিন পর শূন্য টেস্ট', 'Simulate 30-Day Zero')}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Direct Admin Wallet Adjust */}
                    <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 items-end text-xs">
                      <div className="w-28">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">{at('পরিমাণ (৳)', 'Amount (৳)')}</label>
                        <input
                          type="number"
                          value={adminAdjustAmount}
                          onChange={(e) => setAdminAdjustAmount(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                      </div>
                      <div className="flex-1 min-w-[140px]">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">{at('নোট', 'Reason')}</label>
                        <input
                          type="text"
                          value={adminAdjustNote}
                          onChange={(e) => setAdminAdjustNote(e.target.value)}
                          placeholder={at('ম্যানুয়াল বোনাস/সমন্বয়', 'Manual adjustment note')}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => adjustCustomerWalletByAdmin(Math.abs(Number(adminAdjustAmount) || 0), adminAdjustNote)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                      >
                        + {at('যোগ', 'Credit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustCustomerWalletByAdmin(-Math.abs(Number(adminAdjustAmount) || 0), adminAdjustNote)}
                        className="px-3 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold cursor-pointer"
                      >
                        - {at('কাটুন', 'Deduct')}
                      </button>
                    </div>
                  </div>

                  {/* MFS Payment Gateways Setup for Wallet Top-Up */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-sm text-white">
                      {at('MFS রিচার্জ একাউন্ট (bKash, Nagad, Rocket, Upay)', 'Editable MFS Top-Up Gateways')}
                    </h4>
                    <div className="space-y-2.5">
                      {(['bkash', 'nagad', 'rocket', 'upay'] as const).map((key) => {
                        const cfg = wCfg.methods[key];
                        return (
                          <div key={key} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-2 text-xs">
                            <label className="flex items-center gap-2 min-w-[90px] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cfg.enabled}
                                onChange={(e) =>
                                  updateWalletCfg({
                                    methods: {
                                      ...wCfg.methods,
                                      [key]: { ...cfg, enabled: e.target.checked }
                                    }
                                  })
                                }
                                className="w-4 h-4 accent-emerald-500"
                              />
                              <span className="font-black text-white">{cfg.label}</span>
                            </label>
                            <input
                              type="text"
                              value={cfg.accountNumber}
                              onChange={(e) =>
                                updateWalletCfg({
                                  methods: {
                                    ...wCfg.methods,
                                    [key]: { ...cfg, accountNumber: e.target.value }
                                  }
                                })
                              }
                              className="flex-1 min-w-[130px] px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                            />
                            <select
                              value={cfg.accountType}
                              onChange={(e) =>
                                updateWalletCfg({
                                  methods: {
                                    ...wCfg.methods,
                                    [key]: { ...cfg, accountType: e.target.value as 'Personal' | 'Merchant' | 'Agent' }
                                  }
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-bold"
                            >
                              <option value="Personal">Personal</option>
                              <option value="Merchant">Merchant</option>
                              <option value="Agent">Agent</option>
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Customer-Wise Wallet Balance (+/-) & 30-Day Inactivity Control */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-black text-sm text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span>{at('কাস্টমার ওয়াইজ ওয়ালেট ব্যালেন্স (+/-) ও ৩০-দিন মেয়াদ কন্ট্রোল', 'Customer-Wise Wallet Balance (+/-) & 30-Day Inactivity Control')}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {at(
                          'প্রতিটি কাস্টমারের ব্যালেন্স সরাসরি কমান/বাড়ান, ৩০ দিনের মেয়াদ রিসেট করুন অথবা সাথে সাথে শূন্য করুন',
                          'Increase/decrease each customer balance directly, reset their 30-day inactivity clock, or expire to ৳0'
                        )}
                      </p>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        placeholder={at('নাম, ফোন বা ইউজারনেম খুঁজুন...', 'Search customer name or phone...')}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">{at('কাস্টমার', 'Customer')}</th>
                          <th className="py-3 px-4">{at('বর্তমান ব্যালেন্স', 'Wallet Balance')}</th>
                          <th className="py-3 px-4">{at('৩০-দিন মেয়াদ স্ট্যাটাস', '30-Day Expiry Status')}</th>
                          <th className="py-3 px-4 text-right">{at('ব্যালেন্স কমান / বাড়ান & মেয়াদ অ্যাকশন', 'Balance (+/-) & Expiry Action')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {customerAccounts
                          .filter((acc) => {
                            const q = customerSearch.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              acc.name.toLowerCase().includes(q) ||
                              acc.phone.toLowerCase().includes(q) ||
                              acc.email.toLowerCase().includes(q) ||
                              (acc.username || '').toLowerCase().includes(q)
                            );
                          })
                          .map((acc, idx) => {
                            const targetKey = acc.phone || acc.email || acc.username || String(idx);
                            const stepAmt = balanceAdjustAmounts[targetKey] ?? 50;
                            const refTime = acc.lastPurchaseAt || acc.lastWalletCreditAt;
                            const expiryMs = (wCfg.expiryDays || 30) * 86400000;
                            const daysLeft = refTime
                              ? Math.max(0, Math.ceil((new Date(refTime).getTime() + expiryMs - Date.now()) / 86400000))
                              : wCfg.expiryDays || 30;
                            return (
                              <tr key={targetKey} className="hover:bg-slate-800/40">
                                <td className="py-3 px-4">
                                  <p className="font-bold text-white">{acc.name}</p>
                                  <p className="text-[10px] font-mono text-slate-400">
                                    {acc.phone || '—'} • @{acc.username || acc.phone}
                                  </p>
                                </td>
                                <td className="py-3 px-4 font-mono font-black text-base text-emerald-400">
                                  ৳{(acc.walletBalance || 0).toLocaleString()}
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      daysLeft <= 5
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                    }`}
                                  >
                                    <Clock className="w-3 h-3" />
                                    <span>{daysLeft}d left</span>
                                  </span>
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    {acc.lastPurchaseAt
                                      ? at(`অর্ডার: ${new Date(acc.lastPurchaseAt).toLocaleDateString()}`, `Order: ${new Date(acc.lastPurchaseAt).toLocaleDateString()}`)
                                      : at('এখনও অর্ডার করেনি', 'No purchase yet')}
                                  </p>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                                    <input
                                      type="number"
                                      min={1}
                                      value={stepAmt}
                                      onChange={(e) =>
                                        setBalanceAdjustAmounts((prev) => ({
                                          ...prev,
                                          [targetKey]: Math.max(1, Number(e.target.value))
                                        }))
                                      }
                                      className="w-16 px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs text-center"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => adjustSpecificCustomerBalance(targetKey, -Math.abs(stepAmt), 'Admin Decreased')}
                                      className="px-2 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-700 text-rose-200 font-black text-[11px] cursor-pointer"
                                    >
                                      -৳{stepAmt}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => adjustSpecificCustomerBalance(targetKey, Math.abs(stepAmt), 'Admin Increased')}
                                      className="px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] cursor-pointer"
                                    >
                                      +৳{stepAmt}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => resetCustomerWalletExpiry(targetKey, false)}
                                      className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 font-bold text-[11px] cursor-pointer"
                                    >
                                      Reset 30d
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => resetCustomerWalletExpiry(targetKey, true)}
                                      className="px-2 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-700 text-amber-200 font-bold text-[11px] cursor-pointer"
                                    >
                                      Expire ৳0
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        {customerAccounts.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-500">
                              {at('এখনও কোনো নিবন্ধিত কাস্টমার নেই।', 'No registered customers yet.')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top-Up Requests Queue */}
                <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-950/60">
                    <h4 className="text-sm font-black text-white">
                      {at(`কাস্টমার অ্যাড ব্যালেন্স রিকোয়েস্ট (${walletTopUps.length})`, `Customer Add Balance Requests (${walletTopUps.length})`)}
                    </h4>
                    <div className="flex gap-1.5 text-[11px] font-bold">
                      {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setWalletStatusFilter(st)}
                          className={`px-2.5 py-1 rounded-lg border cursor-pointer ${
                            walletStatusFilter === st
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          {st.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredTopUps.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      {at('কোনো ব্যালেন্স রিকোয়েস্ট নেই', 'No top-up requests match this filter')}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800">
                      {filteredTopUps.map((req) => (
                        <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-400">{req.id}</span>
                              <span className="text-xs font-black text-white">{req.customerName}</span>
                              <span className="text-xs font-mono text-emerald-400">({req.customerPhone})</span>
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-black uppercase text-amber-300">
                                {req.method}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 font-mono">
                              Amount: <span className="font-black text-emerald-400">৳{req.amount.toLocaleString()}</span> • Sender: {req.senderNumber} • TrxID: <span className="text-white font-bold">{req.trxId}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {req.status === 'pending' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => approveWalletTopUp(req.id)}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{at('অনুমোদন ও যোগ করুন', 'Approve & Credit')}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => rejectWalletTopUp(req.id)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold text-xs cursor-pointer"
                                >
                                  {at('বাতিল', 'Reject')}
                                </button>
                              </>
                            ) : (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                  req.status === 'approved'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-rose-500/20 text-rose-300'
                                }`}
                              >
                                {req.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </main>
      </div>

      {/* MODAL 1: ORDER DETAILS & PRINT SLIP MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs text-emerald-400 font-mono font-bold">অর্ডার বিস্তারিত: {selectedOrderDetails.id}</span>
                  <h3 className="text-lg font-black text-white">{selectedOrderDetails.customer.name}</h3>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>চালান প্রিন্ট</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1 font-bold">কাস্টমার ডেলিভারি ঠিকানা:</span>
                  <p className="text-white font-medium">{selectedOrderDetails.customer.address}</p>
                  <p className="text-slate-300">{selectedOrderDetails.customer.district}, {selectedOrderDetails.customer.thana}</p>
                  <p className="text-emerald-400 font-mono mt-1 font-bold">📞 {selectedOrderDetails.customer.phone}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1 font-bold">কুরিয়ার ও পেমেন্ট:</span>
                  <p className="text-white">পেমেন্ট মেথড: <span className="font-bold uppercase">{selectedOrderDetails.payment.method}</span></p>
                  <p className="text-white">স্ট্যাটাস: <span className="font-bold text-emerald-400">{selectedOrderDetails.status}</span></p>
                  <p className="text-slate-300 font-mono mt-1">কুরিয়ার ট্র্যাকিং: {selectedOrderDetails.courier?.trackingCode || 'বুকিং হয়নি'}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">অর্ডারকৃত পণ্যসমূহ:</span>
                <div className="divide-y divide-slate-800 rounded-xl bg-slate-950 p-3 border border-slate-800">
                  {selectedOrderDetails.items.map((it, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{it.productTitleBn || it.productTitle}</span>
                        <span className="text-slate-400 ml-2 font-mono">x{it.quantity}</span>
                      </div>
                      <span className="font-bold text-emerald-400">৳ {(it.price * it.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between text-xs font-bold text-slate-400">
                    <span>ডেলিভারি ফি:</span>
                    <span>৳ {selectedOrderDetails.pricing.deliveryFee}</span>
                  </div>
                  <div className="pt-1 flex justify-between text-sm font-black text-white">
                    <span>সর্বমোট বিল:</span>
                    <span className="text-emerald-400">৳ {selectedOrderDetails.pricing.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ORDER EDIT MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setEditingOrder(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-white mb-4">অর্ডার এডিট: {editingOrder.id}</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">গ্রাহকের নাম</label>
                <input
                  type="text"
                  value={editingOrder.customer.name}
                  onChange={(e) => setEditingOrder({
                    ...editingOrder,
                    customer: { ...editingOrder.customer, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">ফোন নাম্বার</label>
                <input
                  type="text"
                  value={editingOrder.customer.phone}
                  onChange={(e) => setEditingOrder({
                    ...editingOrder,
                    customer: { ...editingOrder.customer, phone: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">ডেলিভারি ঠিকানা</label>
                <input
                  type="text"
                  value={editingOrder.customer.address}
                  onChange={(e) => setEditingOrder({
                    ...editingOrder,
                    customer: { ...editingOrder.customer, address: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">জেলা</label>
                  <input
                    type="text"
                    value={editingOrder.customer.district}
                    onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      customer: { ...editingOrder.customer, district: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">মোট মূল্য (৳)</label>
                  <input
                    type="number"
                    value={editingOrder.pricing.total}
                    onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      pricing: { ...editingOrder.pricing, total: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  updateOrderDetails(editingOrder.id, editingOrder);
                  setEditingOrder(null);
                  addToast('success', t('অর্ডার আপডেট হয়েছে!', 'Order Updated!'), t('অর্ডারের নতুন তথ্য সেভ করা হয়েছে।', 'Order saved successfully.'));
                }}
                className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                আপডেট সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PRODUCT ADD/EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between mb-4 pr-8">
              <h3 className="text-lg font-black text-white">
                {editingProductId ? t('পণ্য এডিট করুন', 'Edit Product') : t('নতুন পণ্য যোগ করুন', 'Add Product')}
              </h3>

              <button
                type="button"
                onClick={() => {
                  const title = productForm.titleBn || productForm.title || 'প্রিমিয়াম পণ্য';
                  const aiDescBn = `${title} - প্রিমিয়াম কোয়ালিটির আসল পণ্য। ১০০% জেনুইন ব্র্যান্ড কোয়ালিটি ও লং-লাস্টিং পারফরম্যান্স। সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা সহ পাচ্ছেন স্পেশাল ডিসকাউন্ট।`;
                  const aiDescEn = `${productForm.title || 'Premium product'} - 100% authentic quality with fast nationwide cash on delivery.`;
                  const aiFeatures = [
                    '১০০% প্রিমিয়াম ও অরিজিনাল কোয়ালিটি নিশ্চিত',
                    'সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা',
                    '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি',
                    'স্মার্ট বিল্ড কোয়ালিটি ও দীর্ঘস্থায়ী কার্যক্ষমতা'
                  ];
                  setProductForm({
                    ...productForm,
                    descriptionBn: aiDescBn,
                    description: aiDescEn,
                    features: aiFeatures
                  });
                  addToast('success', 'এআই কপিরাইটার সক্রিয়!', 'পণ্যের আকর্ষণীয় বিবরণ ও ফিচার স্বয়ংক্রিয়ভাবে তৈরি হয়েছে।');
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{at('এআই দিয়ে বিবরণ তৈরি করুন', 'Generate with AI')}</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">পণ্যের বাংলা নাম *</label>
                  <input
                    type="text"
                    required
                    value={productForm.titleBn}
                    onChange={(e) => setProductForm({ ...productForm, titleBn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">পণ্যের ইংরেজি নাম</label>
                  <input
                    type="text"
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">বর্তমান মূল্য (৳)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">পূর্বের মূল্য (৳)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">স্টক পরিমাণ</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ক্যাটাগরি</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => {
                      const sel = categories.find((c) => c.slug === e.target.value);
                      setProductForm({
                        ...productForm,
                        category: e.target.value,
                        categoryBn: sel ? sel.nameBn : productForm.categoryBn,
                        subcategory: ''
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.nameBn} ({c.nameEn})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">{at('সাব-ক্যাটাগরি (Subcategory)', 'Subcategory')}</label>
                  <select
                    value={productForm.subcategory || ''}
                    onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="">{at('নির্বাচন করুন (ঐচ্ছিক)', 'None / Optional')}</option>
                    {(categories.find((c) => c.slug === productForm.category)?.subcategories || []).map((sub) => (
                      <option key={sub.slug} value={sub.slug}>
                        {sub.nameBn} ({sub.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SKU, Barcode & Per-Product Editable Delivery Charges */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">SKU কোড</label>
                    <input
                      type="text"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{at('POS বারকোড নম্বর', 'POS Barcode Number')}</label>
                    <input
                      type="text"
                      value={productForm.barcode || ''}
                      onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                      placeholder="880100000101"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-emerald-400">
                      {at('এই পণ্যের কাস্টম ডেলিভারি চার্জ (সিঙ্গেল প্রোডাক্ট ও চেকআউট)', 'Single-Product Custom Delivery Charges')}
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer text-white font-bold">
                      <input
                        type="checkbox"
                        checked={productForm.freeShipping ?? false}
                        onChange={(e) => setProductForm({ ...productForm, freeShipping: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <span>{at('ফ্রি ডেলিভারি (৳০)', 'Free Delivery (৳0)')}</span>
                    </label>
                  </div>

                  {!productForm.freeShipping && (
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">
                          {at('ঢাকা সিটি (খালি = ডিফল্ট)', 'Inside Dhaka')}
                        </label>
                        <input
                          type="number"
                          min={0}
                          placeholder={`${settings.deliveryFees.dhakaInside}`}
                          value={productForm.customDeliveryFees?.dhakaInside ?? ''}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              customDeliveryFees: {
                                ...productForm.customDeliveryFees,
                                dhakaInside: e.target.value === '' ? undefined : Number(e.target.value)
                              }
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">
                          {at('ঢাকা উপশহর', 'Sub-Dhaka')}
                        </label>
                        <input
                          type="number"
                          min={0}
                          placeholder={`${settings.deliveryFees.dhakaSub}`}
                          value={productForm.customDeliveryFees?.dhakaSub ?? ''}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              customDeliveryFees: {
                                ...productForm.customDeliveryFees,
                                dhakaSub: e.target.value === '' ? undefined : Number(e.target.value)
                              }
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">
                          {at('ঢাকার বাইরে', 'Outside Dhaka')}
                        </label>
                        <input
                          type="number"
                          min={0}
                          placeholder={`${settings.deliveryFees.dhakaOutside}`}
                          value={productForm.customDeliveryFees?.dhakaOutside ?? ''}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              customDeliveryFees: {
                                ...productForm.customDeliveryFees,
                                dhakaOutside: e.target.value === '' ? undefined : Number(e.target.value)
                              }
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Main & Gallery Media Manager (Recommended 600x600px) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block text-slate-200 font-bold">
                      {at('প্রোডাক্ট মেইন ছবি ও গ্যালারি আপলোড', 'Product Main Image & Gallery')}
                    </label>
                    <p className="text-[11px] text-emerald-400 font-semibold">
                      {at('প্রস্তাবিত সাইজ: 600×600 পিক্সেল (স্কয়ার HD ফরম্যাট)', 'Recommended Size: 600×600 px (Square HD)')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{at('মেইন ছবি আপলোড', 'Main Photo')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageFileUpload(
                            e.target.files?.[0],
                            (url) =>
                              setProductForm((prev) => ({
                                ...prev,
                                images: [url, ...prev.images.slice(1)]
                              })),
                            'product'
                          )
                        }
                      />
                    </label>
                    <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-700">
                      <ImagePlus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{at('গ্যালারি ছবি (+)', 'Add Gallery')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach((f) =>
                            handleImageFileUpload(
                              f,
                              (url) =>
                                setProductForm((prev) => ({
                                  ...prev,
                                  images: [...prev.images, url]
                                })),
                              'product'
                            )
                          );
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsProductGalleryPickerOpen((prev) => !prev)}
                      className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{at('মিডিয়া গ্যালারি থেকে নিন', 'Pick from Media')}</span>
                    </button>
                  </div>
                </div>

                {isProductGalleryPickerOpen && mediaLibrary.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 block">
                      {at('গ্যালারি থেকে ছবিতে ক্লিক করে যোগ করুন:', 'Click any media item to add to product gallery:')}
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto">
                      {mediaLibrary.slice(0, 18).map((med) => (
                        <button
                          key={med.id}
                          type="button"
                          onClick={() => {
                            setProductForm((prev) => ({
                              ...prev,
                              images: prev.images.includes(med.url) ? prev.images : [...prev.images, med.url]
                            }));
                          }}
                          className="aspect-square rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-400 cursor-pointer"
                        >
                          <img src={med.url} alt={med.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Gallery URL input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder={at('অথবা ছবির URL পেস্ট করে যোগ করুন (600x600px)...', 'Or paste image URL (600x600px)...')}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newGalleryUrl.trim()) return;
                      setProductForm((prev) => ({
                        ...prev,
                        images: [...prev.images, newGalleryUrl.trim()]
                      }));
                      setNewGalleryUrl('');
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl cursor-pointer"
                  >
                    + Add URL
                  </button>
                </div>

                {/* Thumbnail Preview Grid */}
                {productForm.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                    {productForm.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded-xl overflow-hidden border bg-slate-900 aspect-square ${
                          idx === 0 ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-800'
                        }`}
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold">
                            MAIN
                          </span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-1 bg-slate-950/80 flex items-center justify-between gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const reordered = [imgUrl, ...productForm.images.filter((_, i) => i !== idx)];
                                setProductForm({ ...productForm, images: reordered });
                              }}
                              className="text-[9px] px-1.5 py-0.5 bg-emerald-600 text-white rounded font-bold cursor-pointer"
                            >
                              Main
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const filtered = productForm.images.filter((_, i) => i !== idx);
                              setProductForm({ ...productForm, images: filtered });
                            }}
                            className="text-[9px] px-1.5 py-0.5 bg-rose-600 text-white rounded font-bold ml-auto cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">YouTube বা ডেমো ভিডিও URL</label>
                  <input
                    type="text"
                    value={productForm.videoUrl || ''}
                    onChange={(e) => setProductForm({ ...productForm, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ওয়ারেন্টি বিবরণ (বাংলা)</label>
                  <input
                    type="text"
                    value={productForm.warrantyInfoBn || ''}
                    onChange={(e) => setProductForm({ ...productForm, warrantyInfoBn: e.target.value })}
                    placeholder="৭ দিনের রিপ্লেসমেন্ট ওয়ারেন্টি"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Variants, Colors, Sizes & Storefront Proof Display */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <span className="font-bold text-emerald-400 text-xs block">
                  {at('ভ্যারিয়েন্ট, কালার, সাইজ ও সিঙ্গেল পেজ মেট্রিক্স', 'Variants (Color/Size), Sold Count & Loyalty Points')}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      {at('Color / Variant অপশন (কমা দিয়ে আলাদা করুন)', 'Colors / Variants (comma-separated)')}
                    </label>
                    <input
                      type="text"
                      value={(productForm.colors || []).join(', ')}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          colors: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)
                        })
                      }
                      placeholder="Black (কালো), Silver (সিলভার), Gold"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      {at('Size / Edition অপশন (কমা দিয়ে আলাদা করুন)', 'Sizes / Editions (comma-separated)')}
                    </label>
                    <input
                      type="text"
                      value={(productForm.sizes || []).join(', ')}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          sizes: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)
                        })
                      }
                      placeholder="Standard Set, Pro Combo, 1 Kg"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">{at('বিক্রি সংখ্যা', 'Sold Count')}</label>
                    <input
                      type="number"
                      min={0}
                      value={productForm.soldCount ?? 0}
                      onChange={(e) => setProductForm({ ...productForm, soldCount: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">{at('লয়্যালটি পয়েন্ট', 'Loyalty Pts Override')}</label>
                    <input
                      type="number"
                      min={0}
                      value={productForm.loyaltyPoints ?? ''}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          loyaltyPoints: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value))
                        })
                      }
                      placeholder="Auto"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">{at('রেটিং (0-5)', 'Rating (0-5)')}</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={5}
                      value={productForm.rating ?? 4.8}
                      onChange={(e) => setProductForm({ ...productForm, rating: Math.min(5, Math.max(0, Number(e.target.value) || 0)) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">{at('রিভিউ সংখ্যা', 'Reviews Count')}</label>
                    <input
                      type="number"
                      min={0}
                      value={productForm.reviewsCount ?? 0}
                      onChange={(e) => setProductForm({ ...productForm, reviewsCount: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">বিস্তারিত বিবরণ (বাংলা)</label>
                <textarea
                  rows={3}
                  required
                  value={productForm.descriptionBn}
                  onChange={(e) => setProductForm({ ...productForm, descriptionBn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              {/* Per-Product SEO & Robots Settings */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{at('প্রোডাক্ট SEO ও Robots সেটআপ', 'Product SEO & Robots Meta')}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    /product/{productForm.seo?.slug || 'auto-slug'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">URL Slug</label>
                    <input
                      type="text"
                      value={productForm.seo?.slug || ''}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          seo: { ...productForm.seo, slug: e.target.value }
                        })
                      }
                      placeholder="ultra-watch-9-pro-amoled"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Robots Meta</label>
                    <select
                      value={productForm.seo?.robots || 'index, follow'}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          seo: { ...productForm.seo, robots: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                    >
                      <option value="index, follow">index, follow</option>
                      <option value="noindex, follow">noindex, follow</option>
                      <option value="noindex, nofollow">noindex, nofollow</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">SEO Meta Title</label>
                  <input
                    type="text"
                    value={productForm.seo?.metaTitle || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        seo: { ...productForm.seo, metaTitle: e.target.value }
                      })
                    }
                    placeholder={productForm.title || 'Product Meta Title'}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    value={productForm.seo?.metaDescription || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        seo: { ...productForm.seo, metaDescription: e.target.value }
                      })
                    }
                    placeholder="Concise search snippet for Google..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">SEO Keywords</label>
                  <input
                    type="text"
                    value={productForm.seo?.keywords || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        seo: { ...productForm.seo, keywords: e.target.value }
                      })
                    }
                    placeholder="smart watch, buyone bd, gadget price bd"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={productForm.isFlashSale ?? false}
                    onChange={(e) => setProductForm({ ...productForm, isFlashSale: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 bg-slate-800 border-slate-700"
                  />
                  <span>ফ্ল্যাশ সেল অফারে অন্তর্ভুক্ত করুন</span>
                </label>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  {editingProductId ? 'পণ্য আপডেট করুন' : 'পণ্য প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CATEGORY ADD/EDIT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-white mb-4">
              {editingCategoryId ? at('ক্যাটাগরি এডিট করুন', 'Edit Category') : at('নতুন ক্যাটাগরি তৈরি করুন', 'Create New Category')}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">{at('বাংলা নাম *', 'Bangla Name *')}</label>
                <input
                  type="text"
                  required
                  value={categoryForm.nameBn}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameBn: e.target.value })}
                  placeholder={at('যেমন: স্মার্ট ওয়াচ ও গ্যাজেট', 'e.g. Smart Watch & Gadgets')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">{at('ইংরেজি নাম', 'English Name')}</label>
                <input
                  type="text"
                  value={categoryForm.nameEn}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
                  placeholder="Smart Gadgets"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">{at('স্লাগ (URL Identifier)', 'Slug (URL Identifier)')}</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="smart-gadgets"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              {/* Optional Category Icon Image Uploader */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">
                    {at('ক্যাটাগরি আইকন ছবি (ঐচ্ছিক)', 'Category Icon Image (Optional)')}
                  </span>
                  <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>{at('আপলোড', 'Upload')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageFileUpload(e.target.files?.[0], (url) =>
                          setCategoryForm({ ...categoryForm, iconImage: url })
                        )
                      }
                    />
                  </label>
                </div>
                <div className="flex items-center gap-2.5">
                  {categoryForm.iconImage ? (
                    <img src={categoryForm.iconImage} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                      {(categoryForm.nameBn || categoryForm.nameEn || 'C').charAt(0)}
                    </div>
                  )}
                  <input
                    type="text"
                    value={categoryForm.iconImage || ''}
                    onChange={(e) => setCategoryForm({ ...categoryForm, iconImage: e.target.value })}
                    placeholder={at('অথবা ছবির URL দিন (খালি রাখা যাবে)', 'Optional image URL')}
                    className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                  {categoryForm.iconImage && (
                    <button
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, iconImage: '' })}
                      className="px-2 py-1.5 bg-rose-950/60 text-rose-300 rounded-lg font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Subcategories Manager */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <span className="font-bold text-slate-300 block">
                  {at('সাব-ক্যাটাগরি (Subcategories Menu)', 'Subcategories (Nested Menu)')}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newSubNameBn}
                    onChange={(e) => setNewSubNameBn(e.target.value)}
                    placeholder={at('বাংলা নাম', 'Bangla Name')}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    value={newSubNameEn}
                    onChange={(e) => setNewSubNameEn(e.target.value)}
                    placeholder={at('ইংরেজি নাম', 'English Name')}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newSubNameBn.trim() && !newSubNameEn.trim()) return;
                    const subSlug = (newSubNameEn || newSubNameBn)
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '') || `sub-${Date.now().toString().slice(-4)}`;
                    setCategoryForm({
                      ...categoryForm,
                      subcategories: [
                        ...(categoryForm.subcategories || []),
                        {
                          nameBn: newSubNameBn.trim() || newSubNameEn.trim(),
                          nameEn: newSubNameEn.trim() || newSubNameBn.trim(),
                          slug: subSlug
                        }
                      ]
                    });
                    setNewSubNameBn('');
                    setNewSubNameEn('');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-lg cursor-pointer"
                >
                  + {at('সাব-ক্যাটাগরি যোগ করুন', 'Add Subcategory')}
                </button>

                {(categoryForm.subcategories || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(categoryForm.subcategories || []).map((sub, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-200"
                      >
                        <span>{at(sub.nameBn, sub.nameEn)}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setCategoryForm({
                              ...categoryForm,
                              subcategories: (categoryForm.subcategories || []).filter((_, i) => i !== idx)
                            })
                          }
                          className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={categoryForm.isActive}
                    onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                  />
                  <span>সক্রিয় রাখুন (Active)</span>
                </label>

                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: SLIDER ADD/EDIT MODAL */}
      {isSliderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsSliderModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-white mb-4">
              {editingSlideId ? 'স্লাইডার ব্যানার এডিট' : 'নতুন স্লাইডার ব্যানার যোগ'}
            </h3>

            <form onSubmit={handleSaveSlide} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ব্যানার বাংলা টাইটেল *</label>
                  <input
                    type="text"
                    required
                    value={slideForm.titleBn}
                    onChange={(e) => setSlideForm({ ...slideForm, titleBn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">English Title</label>
                  <input
                    type="text"
                    value={slideForm.titleEn}
                    onChange={(e) => setSlideForm({ ...slideForm, titleEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">সাবটাইটেল (বাংলা)</label>
                  <input
                    type="text"
                    value={slideForm.subtitleBn}
                    onChange={(e) => setSlideForm({ ...slideForm, subtitleBn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Subtitle (EN)</label>
                  <input
                    type="text"
                    value={slideForm.subtitleEn}
                    onChange={(e) => setSlideForm({ ...slideForm, subtitleEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Slider Banner Image Upload Studio */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block text-slate-200 font-bold">
                      {at('স্লাইডার ব্যানার ছবি (আপলোড বা URL)', 'Slider Banner Image (Upload or URL)')}
                    </label>
                    <p className="text-[11px] text-emerald-400 font-semibold">
                      {at('প্রস্তাবিত সাইজ: 1200×520 পিক্সেল (ওয়াইড HD)', 'Recommended Size: 1200×520 px (Wide 16:7 HD)')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{at('ডিভাইস থেকে আপলোড', 'Upload Image')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          handleImageFileUpload(file, (url) =>
                            setSlideForm((prev) => ({ ...prev, image: url }))
                          );
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                    {slideForm.image && (
                      <button
                        type="button"
                        onClick={() => setSlideForm({ ...slideForm, image: '' })}
                        className="px-2.5 py-2 bg-rose-950/60 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        {at('মুছুন', 'Clear')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Banner Preview */}
                {slideForm.image ? (
                  <div className="aspect-[16/7] rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                    <img src={slideForm.image} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <label className="aspect-[16/7] rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-900/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
                    <ImagePlus className="w-7 h-7 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-300">
                      {at('স্লাইডার ছবি আপলোড করতে এখানে ক্লিক করুন', 'Click to upload slider banner image')}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleImageFileUpload(file, (url) =>
                          setSlideForm((prev) => ({ ...prev, image: url }))
                        );
                        e.currentTarget.value = '';
                      }}
                    />
                  </label>
                )}

                <input
                  type="text"
                  required
                  value={slideForm.image}
                  onChange={(e) => setSlideForm({ ...slideForm, image: e.target.value })}
                  placeholder={at('অথবা ব্যানার ছবির URL পেস্ট করুন...', 'Or paste banner image URL...')}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ডিসকাউন্ট ব্যাজ (বাংলা)</label>
                  <input
                    type="text"
                    value={slideForm.discountBadgeBn || ''}
                    onChange={(e) => setSlideForm({ ...slideForm, discountBadgeBn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Discount Badge (EN)</label>
                  <input
                    type="text"
                    value={slideForm.discountBadgeEn || ''}
                    onChange={(e) => setSlideForm({ ...slideForm, discountBadgeEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">বাটন টেক্সট (বাংলা)</label>
                  <input
                    type="text"
                    value={slideForm.buttonTextBn}
                    onChange={(e) => setSlideForm({ ...slideForm, buttonTextBn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Button Text (EN)</label>
                  <input
                    type="text"
                    value={slideForm.buttonTextEn}
                    onChange={(e) => setSlideForm({ ...slideForm, buttonTextEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{at('ক্লিক লিংক ক্যাটাগরি', 'Target Category')}</label>
                  <select
                    value={slideForm.linkCategory || 'all'}
                    onChange={(e) => setSlideForm({ ...slideForm, linkCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="all">{at('সকল পণ্য', 'All Products')}</option>
                    <option value="flash-sale">{at('ফ্ল্যাশ সেল', 'Flash Sale')}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {at(c.nameBn, c.nameEn)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={slideForm.isActive}
                    onChange={(e) => setSlideForm({ ...slideForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                  />
                  <span>সক্রিয় স্লাইডার</span>
                </label>

                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: USER / STAFF ADD/EDIT MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setIsUserModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-white mb-4">
              {editingUserId ? 'স্টাফ মেম্বার এডিট' : 'নতুন স্টাফ মেম্বার যোগ'}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">ইমেইল *</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">ফোন নাম্বার</label>
                <input
                  type="text"
                  value={userForm.phone || ''}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">পদবী ও রোল (Role)</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="order_manager">Order Manager (অর্ডার ব্যবস্থাপক)</option>
                  <option value="support_agent">Support Agent (কাস্টমার সাপোর্ট)</option>
                  <option value="super_admin">Super Admin (সম্পূর্ণ নিয়ন্ত্রণ)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                সংরক্ষণ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6B: ADD / EDIT CUSTOMER REVIEW MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-white mb-4">
              {editingReviewId ? at('রিভিউ এডিট করুন', 'Edit Customer Review') : at('নতুন রিভিউ যোগ করুন', 'Add Customer Review')}
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!reviewForm.productId || !reviewForm.customerName.trim() || !reviewForm.comment.trim()) return;
                if (editingReviewId) {
                  updateProductReview(editingReviewId, {
                    productId: reviewForm.productId,
                    customerName: reviewForm.customerName.trim(),
                    rating: reviewForm.rating,
                    comment: reviewForm.comment.trim(),
                    date: reviewForm.date,
                    verifiedPurchase: reviewForm.verifiedPurchase,
                    isApproved: reviewForm.isApproved
                  });
                } else {
                  addProductReview({
                    productId: reviewForm.productId,
                    customerName: reviewForm.customerName.trim(),
                    rating: reviewForm.rating,
                    comment: reviewForm.comment.trim(),
                    isApproved: reviewForm.isApproved
                  });
                }
                setIsReviewModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1">{at('পণ্য নির্বাচন করুন *', 'Select Product *')}</label>
                <select
                  required
                  value={reviewForm.productId}
                  onChange={(e) => setReviewForm({ ...reviewForm, productId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.titleBn || p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{at('ক্রেতার নাম *', 'Customer Name *')}</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.customerName}
                    onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                    placeholder="Tariqul Islam"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{at('রেটিং (১-৫)', 'Rating (1-5)')}</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-bold"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} ★
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">{at('মতামত *', 'Review Comment *')}</label>
                <textarea
                  rows={3}
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder={at('পণ্যের মান খুবই ভালো...', 'Great product quality and fast delivery...')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={reviewForm.verifiedPurchase}
                    onChange={(e) => setReviewForm({ ...reviewForm, verifiedPurchase: e.target.checked })}
                    className="w-4 h-4 accent-sky-500"
                  />
                  <span>Verified Purchase</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={reviewForm.isApproved}
                    onChange={(e) => setReviewForm({ ...reviewForm, isApproved: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  <span>{at('সাইটে দেখান (Approved)', 'Visible / Approved')}</span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl cursor-pointer"
              >
                {editingReviewId ? at('রিভিউ আপডেট করুন', 'Save Review Changes') : at('রিভিউ যোগ করুন', 'Publish Review')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6C: ADD NEW ORDER MODAL (+ Add new order from WooCommerce/Steadfast Orders bar) */}
      {isAddOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setIsAddOrderModalOpen(false)}
              className="sticky top-0 float-right p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span>{at('ম্যানুয়াল নতুন অর্ডার তৈরি করুন', 'Create Manual New Order')}</span>
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const chosenProduct = products.find((p) => p.id === newOrderForm.productId) || products[0];
                if (!chosenProduct || !newOrderForm.customerName.trim() || !newOrderForm.customerPhone.trim()) return;
                const dZone = newOrderForm.district.toLowerCase().includes('inside')
                  ? 'dhaka_inside'
                  : newOrderForm.district.toLowerCase().includes('sub')
                    ? 'dhaka_sub'
                    : 'dhaka_outside';
                createOrder({
                  customer: {
                    name: newOrderForm.customerName.trim(),
                    phone: newOrderForm.customerPhone.trim(),
                    address: newOrderForm.address.trim() || `${newOrderForm.thana}, ${newOrderForm.district}`,
                    district: newOrderForm.district,
                    thana: newOrderForm.thana,
                    note: newOrderForm.note.trim() || undefined
                  },
                  items: [{ product: chosenProduct, quantity: Math.max(1, newOrderForm.quantity) }],
                  paymentMethod: newOrderForm.paymentMethod,
                  deliveryZone: dZone,
                  advancePaid: newOrderForm.advancePaid > 0 ? newOrderForm.advancePaid : undefined,
                  discountAmount: newOrderForm.discount > 0 ? newOrderForm.discount : undefined,
                  initialStatus: newOrderForm.status,
                  skipAICall: true
                });
                setIsAddOrderModalOpen(false);
                addToast('success', at('নতুন অর্ডার তৈরি হয়েছে', 'Order Created'), at('অর্ডার তালিকায় যুক্ত করা হয়েছে।', 'Manual order added to Orders table.'));
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{at('গ্রাহকের নাম *', 'Customer Name *')}</label>
                  <input
                    type="text"
                    required
                    value={newOrderForm.customerName}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
                    placeholder="Md. Hasan"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{at('ফোন নম্বর *', 'Phone Number *')}</label>
                  <input
                    type="text"
                    required
                    value={newOrderForm.customerPhone}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, customerPhone: e.target.value })}
                    placeholder="01711000000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{at('ডেলিভারি জোন / জেলা', 'District / Zone')}</label>
                  <select
                    value={newOrderForm.district}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, district: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Dhaka - Inside City">Dhaka - Inside City</option>
                    <option value="Dhaka - Sub Area">Dhaka - Sub Area</option>
                    <option value="Outside Dhaka">Outside Dhaka</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{at('থানা / এলাকা', 'Thana / Area')}</label>
                  <input
                    type="text"
                    value={newOrderForm.thana}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, thana: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">{at('বিস্তারিত ঠিকানা', 'Full Address')}</label>
                <input
                  type="text"
                  value={newOrderForm.address}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, address: e.target.value })}
                  placeholder="House 12, Road 5, Dhanmondi, Dhaka"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">{at('পণ্য নির্বাচন করুন', 'Select Product')}</label>
                  <select
                    value={newOrderForm.productId || products[0]?.id || ''}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, productId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.titleBn || p.title} — ৳{p.price}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{at('পরিমাণ', 'Qty')}</label>
                  <input
                    type="number"
                    min={1}
                    value={newOrderForm.quantity}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, quantity: Math.max(1, Number(e.target.value) || 1) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{at('পেমেন্ট', 'Payment')}</label>
                  <select
                    value={newOrderForm.paymentMethod}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, paymentMethod: e.target.value as any })}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="cod">COD</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{at('অগ্রিম (৳)', 'Advance (৳)')}</label>
                  <input
                    type="number"
                    min={0}
                    value={newOrderForm.advancePaid}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, advancePaid: Math.max(0, Number(e.target.value) || 0) })}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{at('ছাড় (৳)', 'Discount (৳)')}</label>
                  <input
                    type="number"
                    min={0}
                    value={newOrderForm.discount}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, discount: Math.max(0, Number(e.target.value) || 0) })}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{at('স্ট্যাটাস', 'Status')}</label>
                  <select
                    value={newOrderForm.status}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, status: e.target.value as OrderStatus })}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="on_hold">On Hold</option>
                    <option value="partial">Partial</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">{at('নোট (ঐচ্ছিক)', 'Order Note')}</label>
                <input
                  type="text"
                  value={newOrderForm.note}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, note: e.target.value })}
                  placeholder={at('হোয়াটসঅ্যাপ / ফোন কল থেকে প্রাপ্ত অর্ডার', 'Phone / WhatsApp manual order...')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl cursor-pointer"
              >
                {at('অর্ডার নিশ্চিত করুন', 'Create Order Now')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: SPIN REWARD ADD/EDIT MODAL */}
      {isSpinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setIsSpinModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-white mb-4">
              {editingSpinRewardId ? 'স্পিন অফার এডিট' : 'নতুন স্পিন অফার যোগ'}
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!spinForm.labelBn.trim()) return;
                const payload = {
                  ...spinForm,
                  code: spinForm.code.trim().toUpperCase(),
                  value: Number(spinForm.value)
                };
                if (editingSpinRewardId) {
                  updateSpinReward(editingSpinRewardId, payload);
                } else {
                  addSpinReward(payload);
                }
                setIsSpinModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1">পুরস্কারের বাংলা নাম *</label>
                <input
                  type="text"
                  required
                  value={spinForm.labelBn}
                  onChange={(e) => setSpinForm({ ...spinForm, labelBn: e.target.value })}
                  placeholder="যেমন: ৳১৫০ ক্যাশ ছাড়"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">কুপন কোড (যেমন: SPIN150)</label>
                <input
                  type="text"
                  required
                  value={spinForm.code}
                  onChange={(e) => setSpinForm({ ...spinForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ছাড়ের ধরন</label>
                  <select
                    value={spinForm.discountType}
                    onChange={(e) => setSpinForm({ ...spinForm, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="fixed">টাকা ছাড় (Fixed BDT)</option>
                    <option value="percent">শতাংশ (%)</option>
                    <option value="free_shipping">ফ্রি ডেলিভারি</option>
                    <option value="try_again">আবার চেষ্টা করুন</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">মূল্য / ভ্যালু</label>
                  <input
                    type="number"
                    value={spinForm.value}
                    onChange={(e) => setSpinForm({ ...spinForm, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">হুইল স্লাইসের কালার</label>
                <input
                  type="color"
                  value={spinForm.color}
                  onChange={(e) => setSpinForm({ ...spinForm, color: e.target.value })}
                  className="w-full h-9 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                কুপন সেভ করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
