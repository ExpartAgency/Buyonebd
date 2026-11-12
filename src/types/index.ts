export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'sslcommerz';
export type PaymentStatus = 'pending' | 'paid' | 'advance_paid';
export type OrderStatus = 'pending' | 'ai_confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type CourierProvider = 'Steadfast' | 'Pathao' | 'RedX' | 'Paperfly';
export type DeliveryZone = 'dhaka_inside' | 'dhaka_sub' | 'dhaka_outside';

export interface Category {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  icon?: string;
  isActive: boolean;
  order?: number;
  subcategories?: { nameBn: string; nameEn: string; slug: string }[];
}

export interface HomeSlide {
  id: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  image: string;
  buttonTextBn: string;
  buttonTextEn: string;
  linkCategory: string;
  discountBadgeBn?: string;
  discountBadgeEn?: string;
  isActive: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  price: number;
  originalPrice: number;
  stock: number;
  category: string;
  categoryBn: string;
  tags: string[];
  images: string[];
  sku: string;
  rating: number;
  reviewsCount: number;
  isFlashSale?: boolean;
  colors?: string[];
  sizes?: string[];
  features?: string[];
  featuresBn?: string[];
  videoUrl?: string; // YouTube or custom demonstration video
  warrantyInfo?: string;
  warrantyInfoBn?: string;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  productTitleBn: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  image: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  district: string;
  thana: string;
  note?: string;
}

export interface AICallLog {
  called: boolean;
  callTimestamp?: string;
  confirmedByCustomer?: boolean;
  durationSeconds?: number;
  notes?: string;
  transcript?: {
    speaker: 'ai' | 'customer';
    text: string;
    textBn: string;
    time: string;
  }[];
}

export interface CourierTracking {
  provider: CourierProvider;
  trackingCode: string;
  status: 'booked' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned';
  currentLocation: string;
  estimatedDelivery: string;
  riderName?: string;
  riderPhone?: string;
  consignmentId?: string;
  history: {
    status: string;
    time: string;
    location: string;
    note: string;
  }[];
}

export interface OrderFraudCheck {
  checked: boolean;
  successRate: number; // e.g. 95 means 95% delivery success
  totalOrders: number;
  deliveredCount: number;
  cancelledCount: number;
  riskLevel: 'safe' | 'moderate' | 'high_risk';
  message: string;
}

export interface Order {
  id: string;
  customer: CustomerInfo;
  items: OrderItem[];
  pricing: {
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    advancePaid?: number;
  };
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    trxId?: string;
    paymentNumber?: string;
  };
  deliveryZone: DeliveryZone;
  status: OrderStatus;
  aiCallStatus: AICallLog;
  courier: CourierTracking;
  fraudCheck?: OrderFraudCheck;
  createdAt: string;
}

export interface AbandonedCart {
  id: string;
  customerPhone?: string;
  customerName?: string;
  customerAddress?: string;
  customerDistrict?: string;
  items: {
    product: Product;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
  }[];
  total: number;
  createdAt: string;
  recovered: boolean;
  recoveredAt?: string;
  whatsappSent: boolean;
}

export interface UserStaff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'order_manager' | 'support_agent' | 'customer';
  isActive: boolean;
  createdAt: string;
}

export interface CourierSettings {
  steadfast: {
    enabled: boolean;
    apiKey: string;
    secretKey: string;
    baseUrl: string;
    autoBook: boolean;
  };
  pathao: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
  };
  redx: {
    enabled: boolean;
    token: string;
  };
}

export interface MarketingSettings {
  facebookPixel: {
    enabled: boolean;
    pixelId: string;
    accessToken: string;
    testEventCode?: string;
  };
  googleAnalytics: {
    enabled: boolean;
    measurementId: string;
  };
  whatsappCRM: {
    enabled: boolean;
    autoFollowupAbandoned: boolean;
    followupDelayMinutes: number;
  };
}

export interface AISettings {
  geminiApiKey: string;
  openaiApiKey: string;
  claudeApiKey: string;
  selectedProvider: 'gemini' | 'openai' | 'claude';
  selectedModel: string;
  autonomousAgentEnabled: boolean;
  autoRestockAlert: boolean;
  autoFraudDetection: boolean;
}

export interface FlashSaleSettings {
  enabled: boolean;
  headlineBn: string;
  headlineEn: string;
  endsAt: string; // ISO date string
  discountPercentage: number;
}

export interface FooterSettings {
  aboutTextBn: string;
  aboutTextEn: string;
  hotline: string;
  whatsappNumber: string;
  email: string;
  address: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  copyrightBn: string;
  copyrightEn: string;
  showPaymentBadges: boolean;
}

export interface StoreSettings {
  storeName: string;
  storeNameBn: string;
  tagline: string;
  taglineBn: string;
  hotline: string;
  whatsappNumber: string;
  supportEmail: string;
  address: string;
  deliveryFees: {
    dhakaInside: number;
    dhakaSub: number;
    dhakaOutside: number;
  };
  paymentSettings: {
    bkashMerchant: string;
    nagadMerchant: string;
    rocketMerchant: string;
    enableCOD: boolean;
    requireAdvanceDeliveryFee: boolean;
    advanceFeeAmount: number;
  };
  aiCallSettings: {
    autoCallOnOrder: boolean;
    agentName: string;
    agentGender: 'female' | 'male';
    voiceName?: string;
    humanTone?: string;
    delaySeconds: number;
    voiceSpeed: number;
    banglaScript: string;
  };
  announcementBar: {
    enabled: boolean;
    textBn: string;
    textEn: string;
  };
  theme?: StoreTheme;
  spinSettings: {
    enabled: boolean;
    headlineBn: string;
    headlineEn: string;
    spinsPerDay?: number;
    rewards: SpinReward[];
  };
  whatsappTemplates: {
    orderConfirmationMsg: string;
    riderDispatchMsg: string;
    abandonedCartMsg?: string;
  };
  marketingTemplates?: WhatsAppMarketingTemplates;
  categories: Category[];
  sliders: HomeSlide[];
  flashSale: FlashSaleSettings;
  courierSettings: CourierSettings;
  marketingSettings: MarketingSettings & {
    tiktokPixel?: {
      enabled: boolean;
      pixelId: string;
    };
  };
  aiSettings: AISettings;
  footerSettings: FooterSettings;
  seoSettings?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogImage: string;
  };
}

export type StoreTheme = 'gadgets' | 'islamic' | 'organic' | 'medical' | 'fashion';

export interface DailyCheckInState {
  lastCheckInDate: string; // YYYY-MM-DD
  streak: number; // 1 to 7
  claimedToday: boolean;
  totalEarned: number;
}

export interface CustomerProfile {
  name: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  loyaltyPoints: number;
  walletBalance: number;
  checkIn: DailyCheckInState;
}

export interface WhatsAppMarketingTemplates {
  orderConfirmation: string;
  shippingDispatched: string;
  orderHold: string;
  orderCancellation: string;
  cartRecovery: string;
  promotionalBroadcast: string;
  autoTriggerOnOrder: boolean;
  autoTriggerOnShipped: boolean;
}

export interface SpinReward {
  id: string;
  labelBn: string;
  labelEn: string;
  code: string;
  discountType: 'fixed' | 'percent' | 'free_shipping' | 'try_again';
  value: number;
  color: string;
  isTryAgain?: boolean;
}

export interface DistrictInfo {
  name: string;
  nameBn: string;
  zone: DeliveryZone;
  thanas: string[];
}

export interface PriceAlert {
  id: string;
  productId: string;
  productTitle: string;
  productTitleBn: string;
  contact: string; // phone or email
  currentPrice: number;
  targetPrice: number;
  createdAt: string;
  status: 'active' | 'notified';
}

