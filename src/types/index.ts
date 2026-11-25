export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'sslcommerz' | 'cash' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'advance_paid';
export type OrderStatus = 'pending' | 'ai_confirmed' | 'processing' | 'on_hold' | 'shipped' | 'delivered' | 'partial' | 'cancelled';
export type CourierProvider = 'Steadfast' | 'Pathao' | 'RedX' | 'Paperfly' | 'Sundarban';
export type DeliveryZone = 'dhaka_inside' | 'dhaka_sub' | 'dhaka_outside';

export interface Category {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  icon?: string;
  iconImage?: string;
  isActive: boolean;
  order?: number;
  subcategories?: { nameBn: string; nameEn: string; slug: string; image?: string }[];
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
  linkUrl?: string;
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
  isApproved?: boolean;
}

export interface ProductSEO {
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  robots?: string;
  ogImage?: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  nameBn?: string;
  values: string[];
}

export interface WholesaleTier {
  minQty: number;
  unitPrice: number;
}

export interface Product {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  brand?: string;
  brandBn?: string;
  price: number;
  originalPrice: number;
  stock: number;
  category: string;
  categoryBn: string;
  subcategory?: string;
  tags: string[];
  images: string[];
  sku: string;
  barcode?: string;
  freeShipping?: boolean;
  customDeliveryFees?: {
    dhakaInside?: number;
    dhakaSub?: number;
    dhakaOutside?: number;
  };
  rating: number;
  reviewsCount: number;
  soldCount?: number;
  loyaltyPoints?: number;
  isFlashSale?: boolean;
  colors?: string[];
  sizes?: string[];
  attributes?: ProductAttribute[];
  features?: string[];
  featuresBn?: string[];
  videoUrl?: string;
  warrantyInfo?: string;
  warrantyInfoBn?: string;
  seo?: ProductSEO;
  resellable?: boolean;
  resellerPrice?: number;
  wholesaleEnabled?: boolean;
  wholesalePrice?: number;
  wholesaleMinQty?: number;
  wholesaleTiers?: WholesaleTier[];
  isHiddenOnStorefront?: boolean;
  forceShowOnStorefront?: boolean;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  productTitleBn: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  selectedAttributes?: Record<string, string>;
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

export interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  zone: string;
  vehicleType?: 'Bike' | 'Bicycle' | 'Van' | 'Walk';
  active: boolean;
}

export interface CourierTracking {
  provider: CourierProvider;
  trackingCode: string;
  status: 'booked' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned';
  currentLocation: string;
  estimatedDelivery: string;
  riderName?: string;
  riderPhone?: string;
  deliveryBoyId?: string;
  deliveryBoyName?: string;
  deliveryBoyPhone?: string;
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
  successRate: number;
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
    loyaltyPointsUsed?: number;
    loyaltyDiscount?: number;
    loyaltyPointsEarned?: number;
    paymentHistory?: {
      id: string;
      amount: number;
      method: string;
      note?: string;
      date: string;
    }[];
  };
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    trxId?: string;
    paymentNumber?: string;
    dueAmount?: number;
  };
  deliveryZone: DeliveryZone;
  status: OrderStatus;
  aiCallStatus: AICallLog;
  courier: CourierTracking;
  fraudCheck?: OrderFraudCheck;
  source?: 'online' | 'pos';
  partnerType?: 'retail' | 'reseller' | 'wholesale';
  resellerId?: string;
  resellerName?: string;
  resellerCode?: string;
  resellerProfit?: number;
  customerQuotedPrice?: number;
  wholesaleBuyerId?: string;
  wholesaleCompany?: string;
  affiliateId?: string;
  affiliateCode?: string;
  affiliateCommission?: number;
  createdAt: string;
  updatedAt?: string;
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
  aiRecoveryMessage?: string;
  aiRecoveryPreparedAt?: string;
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
  paperfly?: {
    enabled: boolean;
    username: string;
    apiKey: string;
  };
  sundarban?: {
    enabled: boolean;
    branchCode: string;
    apiKey: string;
  };
}

export interface WhatsAppCloudLog {
  id: string;
  phone: string;
  template: string;
  status: 'sent' | 'delivered' | 'simulated' | 'failed';
  time: string;
  messagePreview: string;
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
  tiktokPixel?: {
    enabled: boolean;
    pixelId: string;
  };
  clarity?: {
    enabled: boolean;
    projectId: string;
  };
  whatsappCloudApi?: {
    enabled: boolean;
    phoneNumberId: string;
    wabaId: string;
    accessToken: string;
    verifyToken: string;
    apiVersion: string;
    defaultTemplate: string;
  };
  socialLinks?: {
    facebookPageId: string;
    facebookUrl: string;
    instagramHandle: string;
    tiktokHandle: string;
    youtubeUrl: string;
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
  endsAt: string;
  discountPercentage: number;
}

export interface FooterLinkItem {
  id: string;
  labelBn: string;
  labelEn: string;
  actionType: 'tracking' | 'flash_sale' | 'store' | 'url';
  url?: string;
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
  tiktokUrl?: string;
  copyrightBn: string;
  copyrightEn: string;
  showPaymentBadges: boolean;
  showCategoriesInFooter?: boolean;
  quickLinks?: FooterLinkItem[];
}

export interface StoreThemeColors {
  primary: string;
  secondary: string;
  headerBg: string;
  footerBg: string;
  heroFrom: string;
  heroTo: string;
}

export interface StoreCMSTexts {
  trendingTitleBn: string;
  trendingTitleEn: string;
  orderNowBtnBn: string;
  orderNowBtnEn: string;
  addToCartBtnBn: string;
  addToCartBtnEn: string;
  allCategoriesLabelBn: string;
  allCategoriesLabelEn: string;
  categoriesTitleBn?: string;
  categoriesTitleEn?: string;
  flashSaleTitleBn?: string;
  flashSaleTitleEn?: string;
  recentlyViewedTitleBn?: string;
  recentlyViewedTitleEn?: string;
  whyChooseTitleBn?: string;
  whyChooseTitleEn?: string;
  heroSecondaryBtnBn?: string;
  heroSecondaryBtnEn?: string;
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  canonicalUrl?: string;
  robots?: string;
  twitterHandle?: string;
  googleSiteVerification?: string;
  schemaType?: 'Store' | 'OnlineStore' | 'LocalBusiness';
  robotsTxt?: string;
  sitemapEnabled?: boolean;
}

export interface AIKeywordRule {
  id: string;
  keywords: string[];
  replyBn: string;
  replyEn: string;
  enabled: boolean;
}

export interface CustomerBrowsingEvent {
  id: string;
  customerName: string;
  customerPhone?: string;
  urlPath: string;
  pageTitle: string;
  productId?: string;
  productTitle?: string;
  categorySlug?: string;
  device: string;
  timestamp: string;
}

export interface SupportChatMessage {
  id: string;
  sender: 'customer' | 'bot' | 'assistant';
  text: string;
  textBn?: string;
  time: string;
  quickActions?: { label: string; action: string }[];
}

export interface SupportChatSession {
  id: string;
  customerName: string;
  customerPhone?: string;
  status: 'open' | 'resolved';
  manualMode?: boolean;
  assignedAgent?: string;
  lastUpdated: string;
  unreadByAdmin: number;
  messages: SupportChatMessage[];
}

export interface BrowserCallTranscriptItem {
  id: string;
  speaker: 'customer' | 'assistant' | 'ai';
  text: string;
  textBn: string;
  time: string;
}

export interface BrowserCallSession {
  id: string;
  orderId?: string;
  callType: 'support' | 'order_verification';
  direction?: 'customer_to_admin' | 'admin_to_customer';
  visitorSessionId?: string;
  customerName: string;
  customerPhone: string;
  status: 'ringing_backend' | 'ringing_customer' | 'connected' | 'ended';
  answeredBy?: 'backend_assistant' | 'ai_auto' | 'customer';
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  transcript: BrowserCallTranscriptItem[];
}

export interface ServerPixelEvent {
  id: string;
  eventName: string;
  urlPath: string;
  sourceUrl: string;
  pixelId?: string;
  value?: number;
  currency?: string;
  contentName?: string;
  status: 'sent_capi' | 'logged_server';
  timestamp: string;
}

export interface StoreSettings {
  storeName: string;
  storeNameBn: string;
  logoUrl?: string;
  faviconUrl?: string;
  logoMode?: 'text' | 'image' | 'both';
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
    helpline?: string;
    bgColor?: string;
    textColor?: string;
    linkUrl?: string;
  };
  theme?: StoreTheme;
  themeColors?: StoreThemeColors;
  brandAttributes?: {
    primaryHover?: string;
    primarySoft?: string;
    primaryBorder?: string;
    onPrimary?: string;
    cssAttributeString?: string;
    generatedAt?: string;
  };
  cmsTexts?: StoreCMSTexts;
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
  marketingSettings: MarketingSettings;
  aiSettings: AISettings;
  aiKeywordRules?: AIKeywordRule[];
  footerSettings: FooterSettings;
  seoSettings?: SEOSettings;
  walletSettings?: WalletControlSettings;
  smtpSettings?: SMTPSettings;
  singleProductCms?: SingleProductCMSSettings;
  organicMarketing?: OrganicMarketingSettings;
  promoCoupons?: PromoCoupon[];
  deliveryBoys?: DeliveryBoy[];
  hostingerDbSettings?: HostingerDbSettings;
  securitySettings?: SecuritySettings;
  loyaltySettings?: LoyaltySettings;
  resellerSettings?: ResellerSettings;
  wholesaleSettings?: WholesaleSettings;
  globalMarketingSettings?: GlobalMarketingSettings;
  aiAutopilotSettings?: AIAutopilotSettings;
  invoiceSettings?: InvoiceSettings;
  viewerCounter?: ViewerCounterSettings;
  affiliateSettings?: AffiliateSettings;
  urgencySettings?: UrgencySettings;
  socialAutoConfig?: Record<SocialPlatform, SocialChannelConfig>;
  onlyShowMyProducts?: boolean;
  autoMarketingSuite?: AutoMarketingSuiteSettings;
}

export interface AutoMarketingSuiteSettings {
  enabled: boolean;
  autoSocialDailyPoster: boolean;
  autoNewProductLaunchBlitz: boolean;
  autoAbandonedCartWinback: boolean;
  autoPriceDropAndRestockAlerts: boolean;
  autoSeoProductEnricher: boolean;
  autoWeeklyBlogPublisher: boolean;
  autoReviewSocialProofPromo: boolean;
  cycleIntervalHours: number;
  lastAutoSweepAt?: string;
  lastBlogAutoAt?: string;
}

export interface AutoMarketingLogEntry {
  id: string;
  trigger: 'background_daemon' | 'manual_sweep' | 'product_launch' | 'restock_alert' | 'review_approved';
  summary: string;
  details: string[];
  actionsCount: number;
  timestamp: string;
}

export interface ViewerCounterSettings {
  enabled: boolean;
  baseCount: number;
  labelBn: string;
  labelEn: string;
  autoIncrement?: boolean;
  useRealViews?: boolean;
  showOnSingleProduct?: boolean;
  showOnCards?: boolean;
}

export interface UrgencySettings {
  enabled: boolean;
  lowStockThreshold: number;
  showStockProgress: boolean;
  showLiveLookers: boolean;
  showRecentSold: boolean;
  showCountdown: boolean;
  countdownHours: number;
  showDispatchCutoff: boolean;
  dispatchCutoffHour: number;
  lowStockTextBn?: string;
  lowStockTextEn?: string;
  dispatchTextBn?: string;
  dispatchTextEn?: string;
}

export interface InvoiceCustomField {
  id: string;
  label: string;
  value: string;
  showOnA4: boolean;
  showOnLabel: boolean;
  showOnReceipt: boolean;
}

export type InvoicePaperSize = 'A4' | 'label_4x6' | 'label_4x3' | 'label_3x2' | 'thermal_80mm';

export interface InvoiceSettings {
  companyName: string;
  companyNameBn?: string;
  tagline?: string;
  phone: string;
  email?: string;
  websiteUrl?: string;
  address: string;
  binVatNumber?: string;
  tradeLicense?: string;
  logoUrl?: string;
  defaultPaperSize: InvoicePaperSize;
  invoicePrefix: string;
  headerNote?: string;
  footerNote: string;
  termsText?: string;
  authorizedSignatoryName?: string;
  showProductImages: boolean;
  showSku: boolean;
  showCustomerEmail: boolean;
  showOrderNotes: boolean;
  showBarcode: boolean;
  showCodBadge: boolean;
  showResellerProfitOnInternal?: boolean;
  showAuthorizedSignature: boolean;
  accentColor?: string;
  customFields: InvoiceCustomField[];
}

export interface LoyaltySettings {
  enabled: boolean;
  pointsPer100Bdt: number;
  bdtPerPoint: number;
  minRedeemPoints: number;
  maxRedeemPercent: number;
  welcomeBonusPoints: number;
}

export interface LoyaltyHistoryItem {
  id: string;
  type: 'earn' | 'redeem' | 'adjust' | 'delete';
  points: number;
  note: string;
  orderId?: string;
  date: string;
}

export interface HostingerDbSettings {
  enabled: boolean;
  mode: 'mysql_direct' | 'php_bridge';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  tablePrefix: string;
  ssl: boolean;
  autoSyncOnOrder: boolean;
  phpBridgeUrl?: string;
  phpBridgeSecret?: string;
  lastSyncedAt?: string;
}

export interface SecuritySettings {
  loginLockoutEnabled: boolean;
  maxLoginAttempts: number;
  lockoutMinutes: number;
  adminPinEnabled: boolean;
  adminPin: string;
  checkoutHoneypotEnabled: boolean;
  checkoutRateLimitSeconds: number;
  blockDuplicateOrdersMinutes: number;
  blockedPhones: string[];
  blockedIps?: string[];
  idleLogoutMinutes?: number;
  enablePayloadSanitizer?: boolean;
  enableStrictHeaders: boolean;
  maskPublicSecrets: boolean;
}

export interface SecurityLogEntry {
  id: string;
  event: string;
  detail: string;
  severity: 'info' | 'warning' | 'blocked';
  timestamp: string;
}

export interface PromoCoupon {
  id: string;
  code: string;
  title?: string;
  discountType: 'fixed' | 'percent' | 'free_shipping';
  value: number;
  minOrder: number;
  active: boolean;
  expiresAt?: string;
}

export interface SMTPSettings {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  sendOnOrderConfirmation: boolean;
  sendOnStatusUpdate: boolean;
}

export interface SingleProductCMSSettings {
  showDeliveryMatrix: boolean;
  showWarrantyBadge: boolean;
  showReturnPolicy: boolean;
  showFlashSaleSection: boolean;
  showPriceAlertButton: boolean;
  showLoyaltyBadge: boolean;
  dhakaCityLabelBn: string;
  dhakaCityLabelEn: string;
  dhakaEtaBn: string;
  dhakaEtaEn: string;
  nationwideLabelBn: string;
  nationwideLabelEn: string;
  nationwideEtaBn: string;
  nationwideEtaEn: string;
  warrantyBadgeTitleBn: string;
  warrantyBadgeTitleEn: string;
  warrantyBadgeValueBn: string;
  warrantyBadgeValueEn: string;
  codTrustTextBn: string;
  codTrustTextEn: string;
  colorLabelBn?: string;
  colorLabelEn?: string;
  sizeLabelBn?: string;
  sizeLabelEn?: string;
  brandLabelBn?: string;
  brandLabelEn?: string;
  notifyMeBtnBn?: string;
  notifyMeBtnEn?: string;
  loyaltyTextBn?: string;
  loyaltyTextEn?: string;
  pointsPerOrderDivisor?: number;
  saveBadgeLabelBn?: string;
  saveBadgeLabelEn?: string;
  inStockLabelBn?: string;
  inStockLabelEn?: string;
  outOfStockLabelBn?: string;
  outOfStockLabelEn?: string;
  returnPolicyTitleBn: string;
  returnPolicyTitleEn: string;
  returnPolicyTextBn: string;
  returnPolicyTextEn: string;
  courierNoteTitleBn: string;
  courierNoteTitleEn: string;
  courierNoteTextBn: string;
  courierNoteTextEn: string;
}

export interface HomeFeatureStripItem {
  id: string;
  titleBn: string;
  titleEn: string;
  subBn: string;
  subEn: string;
}

export interface OrganicMarketingSettings {
  referralProgram: {
    enabled: boolean;
    referrerRewardBdt: number;
    refereeDiscountBdt: number;
    referralCodePrefix: string;
  };
  promoPopup: {
    enabled: boolean;
    headlineBn: string;
    headlineEn: string;
    subtextBn: string;
    subtextEn: string;
    couponCode: string;
    discountLabelBn: string;
    discountLabelEn: string;
    delaySeconds: number;
  };
  socialShareDiscount: {
    enabled: boolean;
    discountAmount: number;
    couponCode: string;
    messageBn: string;
    messageEn: string;
  };
  vipTiers: {
    enabled: boolean;
    silverThreshold: number;
    silverDiscountPct: number;
    goldThreshold: number;
    goldDiscountPct: number;
  };
  homeFeatureStrip: {
    enabled: boolean;
    items: HomeFeatureStripItem[];
  };
  freeShippingBar?: {
    enabled: boolean;
    thresholdBdt: number;
    messageBn: string;
    messageEn: string;
  };
  bundleDiscount?: {
    enabled: boolean;
    qty2Percent: number;
    qty3Percent: number;
    badgeBn: string;
    badgeEn: string;
  };
  socialProofFomo?: {
    enabled: boolean;
    intervalSeconds: number;
    showRealOrdersOnly: boolean;
  };
  checkoutGuard?: {
    honeypotEnabled: boolean;
    blockDuplicateOrdersMinutes: number;
    checkoutRateLimitSeconds: number;
  };
}

export type StoreTheme =
  | 'gadgets'
  | 'islamic'
  | 'organic'
  | 'medical'
  | 'fashion'
  | 'beauty'
  | 'grocery'
  | 'electronics'
  | 'kids'
  | 'books';

export interface DailyCheckInState {
  lastCheckInDate: string;
  streak: number;
  claimedToday: boolean;
  totalEarned: number;
}

export interface CustomerCoupon {
  id: string;
  code: string;
  labelBn: string;
  labelEn: string;
  value: number;
  discountType: 'fixed' | 'percent' | 'free_shipping';
  expiresAt: string;
}

export interface CustomerProfile {
  name: string;
  username?: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  password?: string;
  loyaltyPoints: number;
  walletBalance: number;
  spinBonusBalance?: number;
  spinBonusExpiresAt?: string;
  lastPurchaseAt?: string;
  lastWalletCreditAt?: string;
  browsingHistory?: string[];
  savedCoupons?: CustomerCoupon[];
  checkIn?: DailyCheckInState;
  loyaltyHistory?: LoyaltyHistoryItem[];
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
  contact: string;
  currentPrice: number;
  targetPrice: number;
  createdAt: string;
  status: 'active' | 'notified';
}

export interface WaitlistEntry {
  id: string;
  productId: string;
  productTitle: string;
  productTitleBn: string;
  contact: string;
  contactType: 'email' | 'phone';
  status: 'waiting' | 'notified';
  createdAt: string;
}

export type WalletTopUpMethod = 'bkash' | 'nagad' | 'rocket' | 'upay';

export interface WalletMethodConfig {
  enabled: boolean;
  label: string;
  accountNumber: string;
  accountType: 'Personal' | 'Merchant' | 'Agent';
}

export interface WalletControlSettings {
  enabled: boolean;
  autoApprove: boolean;
  expiryDays: number;
  minTopUp: number;
  maxTopUp: number;
  methods: Record<WalletTopUpMethod, WalletMethodConfig>;
}

export interface WalletTopUpActivity {
  time: string;
  actor: string;
  action: string;
  note?: string;
}

export interface WalletTopUpRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  method: WalletTopUpMethod;
  amount: number;
  senderNumber: string;
  trxId: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
  processedAt?: string;
  activityLog?: WalletTopUpActivity[];
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  source: 'product' | 'slider' | 'logo' | 'category' | 'seo' | 'upload';
  width: number;
  height: number;
  sizeKb: number;
  mimeType: string;
  createdAt: string;
}

export interface ResellerAccount {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  district: string;
  address?: string;
  fbPageUrl?: string;
  bkashNumber?: string;
  nagadNumber?: string;
  bankDetails?: string;
  resellerCode: string;
  commissionPercent: number;
  walletBalance: number;
  totalEarnings: number;
  totalOrders: number;
  status: 'pending' | 'approved' | 'suspended';
  createdAt: string;
  updatedAt?: string;
}

export interface ResellerPayoutRequest {
  id: string;
  resellerId: string;
  resellerName: string;
  resellerPhone: string;
  method: 'bkash' | 'nagad' | 'rocket' | 'bank';
  accountNumber: string;
  amount: number;
  status: 'pending' | 'paid' | 'rejected';
  trxId?: string;
  note?: string;
  createdAt: string;
  processedAt?: string;
}

export interface ResellerSettings {
  enabled: boolean;
  autoApprove: boolean;
  defaultCommissionPercent: number;
  minPayoutBdt: number;
  allowCustomMarginPricing: boolean;
  resellerWelcomeMsgBn: string;
  resellerWelcomeMsgEn: string;
}

export interface WholesaleAccount {
  id: string;
  contactName: string;
  companyName: string;
  phone: string;
  email?: string;
  password?: string;
  tradeLicenseNo?: string;
  nidNumber?: string;
  district: string;
  address: string;
  businessType: 'Retail Shop' | 'Online Store' | 'Corporate' | 'Distributor' | 'Export';
  monthlyVolumeEstimate?: string;
  tier: 'Silver' | 'Gold' | 'Platinum';
  extraDiscountPercent: number;
  creditLimitBdt?: number;
  creditUsedBdt?: number;
  paymentTerms?: 'Cash / Advance' | 'Net-7' | 'Net-15' | 'Net-30';
  status: 'pending' | 'approved' | 'suspended';
  createdAt: string;
  updatedAt?: string;
}

export interface WholesaleQuoteRequest {
  id: string;
  wholesalerId: string;
  companyName: string;
  phone: string;
  productId?: string;
  productTitle: string;
  requestedQty: number;
  targetUnitPrice?: number;
  notes?: string;
  adminQuotedPrice?: number;
  status: 'pending' | 'quoted' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface WholesaleSettings {
  enabled: boolean;
  autoApprove: boolean;
  defaultMinQty: number;
  silverDiscountPercent: number;
  goldDiscountPercent: number;
  platinumDiscountPercent: number;
  requireAdvancePercent: number;
  b2bHeadlineBn: string;
  b2bHeadlineEn: string;
}

export interface BulkSmsCampaignLog {
  id: string;
  title: string;
  segment: 'all_customers' | 'dhaka' | 'outside_dhaka' | 'resellers' | 'wholesalers' | 'waitlist';
  recipientCount: number;
  message: string;
  status: 'sent' | 'simulated' | 'failed';
  estimatedCostBdt: number;
  createdAt: string;
}

export interface GlobalMarketingSettings {
  defaultExportCurrency: 'BDT' | 'USD' | 'GBP' | 'EUR' | 'AED' | 'SAR' | 'MYR';
  exchangeRates: Record<'USD' | 'GBP' | 'EUR' | 'AED' | 'SAR' | 'MYR', number>;
  probashiShippingEnabled: boolean;
  smsGatewayProvider: 'ssl_wireless' | 'bulksmsbd' | 'greenweb' | 'twilio' | 'custom';
  smsApiKey: string;
  smsSenderId: string;
  googleMerchantFeedEnabled: boolean;
  metaCatalogFeedEnabled: boolean;
  tiktokShopSyncEnabled: boolean;
  defaultUtmSource: string;
  defaultUtmMedium: string;
}

export interface WhatsAppChatMessage {
  id: string;
  phone: string;
  contactName: string;
  contactType: 'reseller' | 'customer';
  direction: 'outbound' | 'inbound';
  sender: 'admin' | 'ai' | 'contact';
  text: string;
  templateName?: string;
  orderId?: string;
  mode: 'live' | 'simulated' | 'webhook';
  status: 'sent' | 'received' | 'simulated' | 'failed';
  messageId?: string;
  timestamp: string;
}

export type AIReviewActionType =
  | 'ai_voice_call'
  | 'confirm_order'
  | 'send_courier'
  | 'whatsapp_followup'
  | 'fraud_hold'
  | 'approve_reseller'
  | 'update_product'
  | 'fix_product_seo'
  | 'create_coupon'
  | 'toggle_flash_sale'
  | 'adjust_loyalty_points'
  | 'recover_abandoned_cart'
  | 'update_store_settings';

export interface AIReviewTask {
  id: string;
  actionType: AIReviewActionType;
  title: string;
  titleBn: string;
  summary: string;
  summaryBn: string;
  targetType: 'order' | 'reseller' | 'wholesaler' | 'product' | 'cart' | 'customer' | 'store';
  targetId: string;
  payload: {
    orderId?: string;
    provider?: CourierProvider;
    status?: OrderStatus;
    phone?: string;
    contactName?: string;
    contactType?: 'reseller' | 'customer';
    message?: string;
    script?: string;
    riskLevel?: 'safe' | 'moderate' | 'high_risk';
    resellerId?: string;
    productId?: string;
    price?: number;
    stock?: number;
    isFlashSale?: boolean;
    couponCode?: string;
    discountType?: 'fixed' | 'percent' | 'free_shipping';
    couponValue?: number;
    minOrder?: number;
    flashSaleEnabled?: boolean;
    identifier?: string;
    pointsDelta?: number;
    cartId?: string;
    dhakaInsideFee?: number;
    dhakaOutsideFee?: number;
    [key: string]: any;
  };
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  reasoning: string;
  reasoningBn?: string;
  status: 'pending_review' | 'executed' | 'dismissed' | 'failed';
  createdAt: string;
  executedAt?: string;
  executionResult?: string;
}

export interface AIAutopilotSettings {
  enabled: boolean;
  requireAdminReview: boolean;
  autoScanNewOrders: boolean;
  autoPrepareCall: boolean;
  autoPrepareConfirm: boolean;
  autoPrepareCourier: boolean;
  autoPrepareWhatsapp: boolean;
  preferredCourier: CourierProvider;
  lastScanAt?: string;
  autoSocialDailyEnabled?: boolean;
  autoChatReplyEnabled?: boolean;
  zeroAdSpendMode?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  titleBn: string;
  slug: string;
  excerpt: string;
  excerptBn: string;
  content: string;
  contentBn: string;
  category: string;
  categoryBn: string;
  coverImage: string;
  author: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  readTimeMinutes: number;
  viewsCount?: number;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ResellerTopUpRequest {
  id: string;
  resellerId: string;
  resellerName: string;
  resellerPhone: string;
  method: 'bkash' | 'nagad' | 'rocket' | 'bank';
  amount: number;
  senderNumber: string;
  trxId: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  createdAt: string;
  processedAt?: string;
}

export interface AffiliateSettings {
  enabled: boolean;
  autoApprove: boolean;
  defaultCommissionPercent: number;
  minPayoutBdt: number;
  cookieDays: number;
  welcomeMsgBn: string;
  welcomeMsgEn: string;
}

export interface AffiliateAccount {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  district?: string;
  channelUrl?: string;
  bkashNumber?: string;
  nagadNumber?: string;
  bankDetails?: string;
  affiliateCode: string;
  commissionPercent: number;
  clicksCount: number;
  totalOrders: number;
  walletBalance: number;
  totalEarnings: number;
  status: 'pending' | 'approved' | 'suspended';
  createdAt: string;
  updatedAt?: string;
}

export interface AffiliateConversion {
  id: string;
  affiliateId: string;
  affiliateCode: string;
  orderId: string;
  customerName: string;
  orderTotal: number;
  commissionPercent: number;
  commissionAmount: number;
  status: 'pending' | 'credited' | 'cancelled';
  createdAt: string;
}

export interface AffiliatePayoutRequest {
  id: string;
  affiliateId: string;
  affiliateName: string;
  affiliatePhone: string;
  method: 'bkash' | 'nagad' | 'rocket' | 'bank';
  accountNumber: string;
  amount: number;
  status: 'pending' | 'paid' | 'rejected';
  trxId?: string;
  note?: string;
  createdAt: string;
  processedAt?: string;
}

export interface VisitorLogEntry {
  id: string;
  ip: string;
  device: string;
  browser: string;
  os: string;
  country: string;
  path: string;
  urlPath?: string;
  pageTitle: string;
  customerName?: string;
  customerPhone?: string;
  timestamp: string;
}

export interface ChatInquiry {
  id: string;
  name: string;
  countryCode: string;
  phone: string;
  query: string;
  productId?: string;
  productTitle?: string;
  status: 'new' | 'following_up' | 'replied' | 'closed';
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'youtube';

export interface SocialChannelConfig {
  enabled: boolean;
  accountName: string;
  pageOrChannelId: string;
  webhookUrl: string;
  accessToken?: string;
  autoPostEnabled: boolean;
  intervalHours: number;
  lastAutoPostedAt?: string;
  defaultHashtags?: string;
}

export interface SocialScheduledPost {
  id: string;
  platform: SocialPlatform;
  productId?: string;
  productTitle?: string;
  title: string;
  caption: string;
  hashtags: string[];
  productUrl?: string;
  imageUrl: string;
  scheduledAt: string;
  status: 'scheduled' | 'publishing' | 'published' | 'failed' | 'paused';
  autoGenerated?: boolean;
  publishedAt?: string;
  errorNote?: string;
  externalPostId?: string;
  dispatchLog?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ExpenseEntry {
  id: string;
  title: string;
  category: 'ads' | 'courier' | 'cogs' | 'packaging' | 'salary' | 'other';
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export type AITeamDepartmentRole = 'sales' | 'marketing' | 'accounts' | 'ops';

export interface AITeamActionItem {
  id: string;
  role: AITeamDepartmentRole;
  title: string;
  detail: string;
  actionType: string;
  payloadJson: string;
  executed?: boolean;
}

export interface AITeamBriefing {
  id: string;
  generatedAt: string;
  headline: string;
  salesSummary: string;
  marketingSummary: string;
  accountsSummary: string;
  opsSummary: string;
  recommendedActions: AITeamActionItem[];
}

export type UserNotificationCategory = 'order_update' | 'promo' | 'price_drop';

export interface UserNotification {
  id: string;
  category: UserNotificationCategory;
  title: string;
  titleBn: string;
  message: string;
  messageBn: string;
  createdAt: string;
  isRead?: boolean;
  actionType?: 'track_order' | 'view_product' | 'copy_coupon' | 'open_wallet' | 'none';
  orderId?: string;
  trackingCode?: string;
  productId?: string;
  couponCode?: string;
  badgeText?: string;
  oldPrice?: number;
  newPrice?: number;
  targetPhone?: string;
}




