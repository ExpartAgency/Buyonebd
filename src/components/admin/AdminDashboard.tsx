import React, { useState } from 'react';
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
  Radio
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
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
    sendOrderToSteadfast,
    checkCustomerFraudRisk,
    abandonedCarts,
    markAbandonedCartWhatsAppSent,
    recoverAbandonedCart,
    reviews,
    deleteProductReview,
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
    adminLang,
    setAdminLang,
    toggleProductFlashSale,
    lang,
    t,
    addToast,
    priceAlerts
  } = useStore();

  // Pure language translation helper based on admin language preference
  const at = (bnText: string, enText: string) => (adminLang === 'en' ? enText : bnText);

  // Active tab state (all 16 left-hand sidebar options)
  type AdminTab =
    | 'overview'
    | 'orders'
    | 'products'
    | 'categories'
    | 'abandoned_carts'
    | 'courier_hub'
    | 'flash_sale'
    | 'sliders'
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

  // Orders filters and actions
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
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
    tags: ['Best Seller'],
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800'],
    sku: `PROD-${Date.now().toString().slice(-4)}`,
    rating: 4.9,
    reviewsCount: 16,
    isFlashSale: true,
    colors: ['Black (কালো)', 'Silver (সিলভার)'],
    sizes: ['Standard'],
    features: ['100% Genuine Quality', 'Fast Shipping Warranty'],
    featuresBn: ['১০০% আসল প্রোডাক্ট', 'দ্রুত ডেলিভারি ওয়ারেন্টি'],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    warrantyInfo: '7-day replacement guarantee',
    warrantyInfoBn: '৭ দিনের সহজ রিপ্লেসমেন্ট ওয়ারেন্টি'
  });

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<Omit<Category, 'id'>>({
    nameBn: '',
    nameEn: '',
    slug: '',
    icon: '📦',
    isActive: true
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
      tags: ['Trending'],
      images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800'],
      sku: `PROD-${Date.now().toString().slice(-4)}`,
      rating: 4.8,
      reviewsCount: 15,
      isFlashSale: true,
      colors: ['Black (কালো)'],
      sizes: ['Standard'],
      features: ['100% Genuine Quality'],
      featuresBn: ['১০০% অরিজিনাল পণ্য'],
      videoUrl: '',
      warrantyInfo: '7-day replacement warranty',
      warrantyInfoBn: '৭ দিনের রিপ্লেসমেন্ট ওয়ারেন্টি'
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
      tags: prod.tags || [],
      images: prod.images || [],
      sku: prod.sku,
      rating: prod.rating,
      reviewsCount: prod.reviewsCount,
      isFlashSale: prod.isFlashSale ?? false,
      colors: prod.colors || [],
      sizes: prod.sizes || [],
      features: prod.features || [],
      featuresBn: prod.featuresBn || [],
      videoUrl: prod.videoUrl || '',
      warrantyInfo: prod.warrantyInfo || '',
      warrantyInfoBn: prod.warrantyInfoBn || ''
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      updateProduct(editingProductId, productForm);
    } else {
      addProduct(productForm);
    }
    setIsProductModalOpen(false);
  };

  // Handlers for Categories
  const openNewCategoryModal = () => {
    setEditingCategoryId(null);
    setCategoryForm({
      nameBn: '',
      nameEn: '',
      slug: '',
      icon: '🛍️',
      isActive: true
    });
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({
      nameBn: cat.nameBn,
      nameEn: cat.nameEn,
      slug: cat.slug,
      icon: cat.icon || '🛍️',
      isActive: cat.isActive
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

  // Steadfast 1-click booking
  const handleSteadfastBooking = async (orderId: string) => {
    setIsBookingSteadfast(orderId);
    const res = await sendOrderToSteadfast(orderId);
    setIsBookingSteadfast(null);
    if (res.success) {
      addToast(
        'success',
        t('Steadfast কুরিয়ারে বুকিং সম্পন্ন!', 'Steadfast Booked Successfully!'),
        t(`কনসাইনমেন্ট আইডি: ${res.consignmentId}`, `Tracking Code: ${res.trackingCode}`)
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

  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customer.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customer.phone.includes(orderSearch);
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Aggregate Stats
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.pricing.total : sum), 0);
  const confirmedOrders = orders.filter((o) => o.status === 'ai_confirmed' || o.status === 'shipped' || o.status === 'delivered');
  const aiSuccessRate = orders.length > 0 ? Math.round((confirmedOrders.length / orders.length) * 100) : 0;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const sidebarItems: { id: AdminTab; labelBn: string; labelEn: string; icon: any; badge?: number }[] = [
    { id: 'overview', labelBn: 'ওভারভিউ ও অ্যানালিটিক্স', labelEn: 'Overview', icon: LayoutDashboard },
    { id: 'orders', labelBn: 'অর্ডার ম্যানেজমেন্ট', labelEn: 'Orders', icon: ShoppingCart, badge: orders.length },
    { id: 'products', labelBn: 'পণ্য তালিকা ও প্রোডাক্ট যোগ', labelEn: 'Products', icon: Package, badge: products.length },
    { id: 'categories', labelBn: 'ক্যাটাগরি ম্যানেজমেন্ট', labelEn: 'Categories', icon: Grid, badge: categories.length },
    { id: 'abandoned_carts', labelBn: 'কার্ট রিকভারি (ড্রপ-অফ)', labelEn: 'Cart Recovery', icon: ShoppingCart, badge: abandonedCarts.filter(c => !c.recovered).length },
    { id: 'courier_hub', labelBn: 'কুরিয়ার ইন্টিগ্রেশন হাব', labelEn: 'Steadfast Hub', icon: Truck },
    { id: 'flash_sale', labelBn: 'ফ্ল্যাশ সেল ম্যানেজার', labelEn: 'Flash Sale', icon: Flame },
    { id: 'sliders', labelBn: 'স্টোর স্লাইডার (৫-৬ ব্যানার)', labelEn: 'Store Sliders', icon: ImageIcon, badge: sliders.length },
    { id: 'marketing', labelBn: 'মার্কেটিং ও পিক্সেল হাব', labelEn: 'Marketing & Pixel', icon: BarChart3 },
    { id: 'ai_hub', labelBn: 'এআই ও ভয়েস কল সেটআপ', labelEn: 'AI Voice Hub', icon: Bot },
    { id: 'spin_wheel', labelBn: 'লাকি স্পিন কুপন ম্যানেজার', labelEn: 'Spin Rewards', icon: Gift, badge: spinRewards.length },
    { id: 'analytics', labelBn: 'সম্পূর্ণ স্টোর অ্যানালিটিক্স', labelEn: 'All Analytics', icon: TrendingUp },
    { id: 'reviews', labelBn: 'কাস্টমার রিভিউ ও রেটিং', labelEn: 'Customer Reviews', icon: MessageCircle, badge: reviews.length },
    { id: 'users', labelBn: 'ব্যবহারকারী ও স্টাফ টিম', labelEn: 'Users & Staff', icon: Users, badge: users.length },
    { id: 'design_footer', labelBn: 'স্টোর ডিজাইন ও ফুটার', labelEn: 'Store & Footer', icon: Sliders },
    { id: 'settings', labelBn: 'পেমেন্ট ও ডেলিভারি সেটিংস', labelEn: 'Store Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle button */}
          <button
            onClick={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-xl lg:hidden hover:bg-slate-800"
          >
            {isSidebarMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

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
              {at('হোসাইন ম্যানেজমেন্ট প্ল্যাটফর্ম', 'Hossain Management Portal')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Language Switcher */}
          <button
            onClick={() => setAdminLang(adminLang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            title="Switch Language"
          >
            <span className="text-amber-400 font-mono">🌐</span>
            <span>{adminLang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          <button
            onClick={() => setActiveView('store')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{at('স্টোর ভিউ', 'View Store')}</span>
          </button>

          <button
            onClick={resetAllToDefault}
            title={at('ডেমো ডাটা রিসেট', 'Reset Demo Data')}
            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              logoutAdmin();
              setActiveView('store');
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
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
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">{t('অর্ডার ম্যানেজমেন্ট', 'Order Management')}</h3>
                  <p className="text-xs text-slate-400">{t('অর্ডার এডিট, বিস্তারিত দেখা, ইনভয়েস প্রিন্ট ও ১-ক্লিকে কুরিয়ার বুকিং', 'Edit orders, view invoice, print slip, 1-click Steadfast booking')}</p>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder={t('অর্ডার আইডি, ক্রেতার নাম বা ফোন নাম্বার খুঁজুন...', 'Search by Order ID, Name or Phone...')}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-48 py-2.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">সকল স্ট্যাটাস (All)</option>
                  <option value="pending">পেন্ডিং (Pending)</option>
                  <option value="ai_confirmed">এআই কনফার্মড (AI Confirmed)</option>
                  <option value="processing">প্রসেসিং (Processing)</option>
                  <option value="shipped">শিপড (Shipped)</option>
                  <option value="delivered">ডেলিভারড (Delivered)</option>
                  <option value="cancelled">ক্যান্সেল (Cancelled)</option>
                </select>
              </div>

              {/* Orders Table */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">{at('অর্ডার আইডি', 'Order ID')}</th>
                        <th className="py-3 px-4">{at('ক্রেতার তথ্য ও হোয়াটসঅ্যাপ', 'Customer & WhatsApp')}</th>
                        <th className="py-3 px-4">{at('পণ্য ও পরিমাণ', 'Items & Qty')}</th>
                        <th className="py-3 px-4">{at('মোট বিল', 'Total Bill')}</th>
                        <th className="py-3 px-4">{at('পেমেন্ট', 'Payment')}</th>
                        <th className="py-3 px-4">{at('স্ট্যাটাস', 'Status')}</th>
                        <th className="py-3 px-4">{at('কুরিয়ার বুকিং', 'Courier')}</th>
                        <th className="py-3 px-4 text-right">{at('অ্যাকশন', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredOrders.map((ord) => {
                        const cleanPhone = ord.customer.phone.replace(/[^0-9]/g, '');
                        const waPhone = cleanPhone.startsWith('88') ? cleanPhone : '88' + cleanPhone;
                        return (
                          <tr key={ord.id} className="hover:bg-slate-800/40">
                            <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{ord.id}</td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white">{ord.customer.name}</div>
                              <div className="text-slate-400 text-[11px] font-mono">{ord.customer.phone}</div>
                              <div className="text-slate-500 text-[10px] truncate max-w-[170px]">{ord.customer.district}, {ord.customer.thana}</div>

                              {/* 1-Click WhatsApp Quick Action Buttons */}
                              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                {/* 1. Order Confirmation */}
                                <a
                                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                    `আসসালামু আলাইকুম ${ord.customer.name},\nBuyOne BD থেকে আপনার অর্ডার #${ord.id} সফলভাবে নিশ্চিত করা হয়েছে।\nমোট বিল: ৳${ord.pricing.total}\nডেলিভারি ঠিকানা: ${ord.customer.address}, ${ord.customer.district}।\n\nশীঘ্রই কুরিয়ারে হস্তান্তর করা হবে। ধন্যবাদ!`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={at('কনফার্মেশন হোয়াটসঅ্যাপ বার্তা', 'Order Confirmation WhatsApp')}
                                  className="px-1.5 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-[9px] font-bold flex items-center gap-0.5"
                                >
                                  <MessageCircle className="w-2.5 h-2.5 text-emerald-400" />
                                  <span>{at('কনফার্ম', 'Confirm')}</span>
                                </a>

                                {/* 2. Shipping Dispatched */}
                                <a
                                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                    `প্রিয় ${ord.customer.name},\nআপনার অর্ডার #${ord.id} কুরিয়ারে পাঠানো হয়েছে!\nকুরিয়ার: ${ord.courier?.provider || 'Steadfast'}\nট্র্যাকিং নম্বর: ${ord.courier?.trackingCode || 'প্রক্রিয়াধীন'}\nমোট বিল: ৳${ord.pricing.total}\n\nপার্সেল ডেলিভারি পেয়ে চেক করে পেমেন্ট করুন। ধন্যবাদ!`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={at('শিপিং ট্র্যাকিং বার্তা', 'Shipping Dispatched WhatsApp')}
                                  className="px-1.5 py-0.5 rounded bg-blue-950 hover:bg-blue-900 border border-blue-700/60 text-blue-300 text-[9px] font-bold flex items-center gap-0.5"
                                >
                                  <Truck className="w-2.5 h-2.5 text-blue-400" />
                                  <span>{at('শিপিং', 'Shipped')}</span>
                                </a>

                                {/* 3. Hold / Verification */}
                                <a
                                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                    `প্রিয় ${ord.customer.name},\nBuyOne BD থেকে আপনার #${ord.id} অর্ডারের ঠিকানা ও ফোন নম্বর যাচাইয়ের জন্য মেসেজ দেওয়া হয়েছে। অনুগ্রহ করে ডেলিভারির সঠিক ঠিকানা নিশ্চিত করুন। ধন্যবাদ!`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={at('যাচাইকরণ / হোল্ড বার্তা', 'Hold Verification WhatsApp')}
                                  className="px-1.5 py-0.5 rounded bg-amber-950 hover:bg-amber-900 border border-amber-700/60 text-amber-300 text-[9px] font-bold flex items-center gap-0.5"
                                >
                                  <Clock className="w-2.5 h-2.5 text-amber-400" />
                                  <span>{at('হোল্ড', 'Hold')}</span>
                                </a>

                                {/* 4. Cancelled */}
                                <a
                                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                    `প্রিয় ${ord.customer.name},\nআপনার অর্ডার #${ord.id} বাতিল করা হয়েছে। যে কোনো প্রয়োজনে আমাদের হেল্পলাইনে যোগাযোগ করুন। ধন্যবাদ!`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={at('অর্ডার বাতিল বার্তা', 'Cancel Notice WhatsApp')}
                                  className="px-1.5 py-0.5 rounded bg-rose-950 hover:bg-rose-900 border border-rose-700/60 text-rose-300 text-[9px] font-bold flex items-center gap-0.5"
                                >
                                  <XCircle className="w-2.5 h-2.5 text-rose-400" />
                                  <span>{at('বাতিল', 'Cancel')}</span>
                                </a>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="text-slate-200 font-medium">
                                {ord.items.map((it) => `${at(it.productTitleBn, it.productTitle)} x${it.quantity}`).join(', ')}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-white">৳ {ord.pricing.total.toLocaleString()}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-slate-800 text-slate-300 font-mono">
                                {ord.payment.method}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                value={ord.status}
                                onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                                className="py-1 px-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              >
                                <option value="pending">{at('পেন্ডিং', 'Pending')}</option>
                                <option value="ai_confirmed">{at('এআই কনফার্মড', 'AI Confirmed')}</option>
                                <option value="processing">{at('প্রসেসিং', 'Processing')}</option>
                                <option value="shipped">{at('শিপড', 'Shipped')}</option>
                                <option value="delivered">{at('ডেলিভারড', 'Delivered')}</option>
                                <option value="cancelled">{at('ক্যান্সেল', 'Cancelled')}</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4">
                              {ord.courier?.trackingCode ? (
                                <div>
                                  <span className="font-mono text-xs font-bold text-emerald-400">{ord.courier.trackingCode}</span>
                                  <div className="text-[10px] text-slate-400">{ord.courier.provider} • {ord.courier.status}</div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleSteadfastBooking(ord.id)}
                                  disabled={isBookingSteadfast === ord.id}
                                  className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                                >
                                  {isBookingSteadfast === ord.id ? (
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : (
                                    <Truck className="w-3 h-3" />
                                  )}
                                  <span>{at('Steadfast বুক করুন', 'Book Steadfast')}</span>
                                </button>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Details Modal Trigger */}
                                <button
                                  onClick={() => setSelectedOrderDetails(ord)}
                                  title={at('বিস্তারিত দেখুন', 'View Details')}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                {/* Edit Modal Trigger */}
                                <button
                                  onClick={() => setEditingOrder(ord)}
                                  title={at('অর্ডার এডিট করুন', 'Edit Order')}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                {/* AI Call Trigger */}
                                <button
                                  onClick={() => startAICall(ord)}
                                  title={at('এআই কল দিন', 'Initiate AI Call')}
                                  className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 cursor-pointer"
                                >
                                  <PhoneCall className="w-3.5 h-3.5" />
                                </button>
                                {/* Delete Order (No blocking confirm) */}
                                <button
                                  onClick={() => {
                                    deleteOrder(ord.id);
                                  }}
                                  title={at('মুছে ফেলুন', 'Delete')}
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
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{at(prod.categoryBn, prod.category)}</span>
                        <h4 className="font-bold text-sm text-white line-clamp-1">{at(prod.titleBn, prod.title)}</h4>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-black text-sm text-emerald-400">৳ {prod.price.toLocaleString()}</span>
                          <span className="text-xs text-slate-500 line-through">৳ {prod.originalPrice.toLocaleString()}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {at(`স্টক: ${prod.stock} টি • SKU: ${prod.sku}`, `Stock: ${prod.stock} • SKU: ${prod.sku}`)}
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
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">{at('আইকন', 'Icon')}</th>
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
                          <td className="py-3.5 px-4 text-xl">{cat.icon || '📦'}</td>
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

                <div className="flex items-center justify-between pt-2">
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

                  <button
                    onClick={() => addToast('success', t('সংরক্ষিত হয়েছে!', 'Saved!'), t('Steadfast API তথ্য আপডেট করা হয়েছে।', 'Steadfast credentials saved.'))}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                  >
                    {t('সেটিংস সেভ করুন', 'Save Settings')}
                  </button>
                </div>
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
            </div>
          )}

          {/* TAB 7: FLASH SALE MANAGER */}
          {activeTab === 'flash_sale' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-black text-white">{at('ফ্ল্যাশ সেল ম্যানেজার', 'Flash Sale Manager')}</h3>
                <p className="text-xs text-slate-400">{at('স্টোরের মূল ফ্ল্যাশ সেল সক্রিয়/নিষ্ক্রিয় ও পণ্য নির্বাচন করুন', 'Manage flash sale status, headline, discounts, and select products for the sale')}</p>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">{at('গড় ছাড়ের শতাংশ (%)', 'Discount %')}</label>
                    <input
                      type="number"
                      value={settings.flashSale?.discountPercentage || 40}
                      onChange={(e) => {
                        updateSettings({
                          flashSale: {
                            ...settings.flashSale,
                            discountPercentage: Number(e.target.value)
                          }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">{at('ফ্ল্যাশ সেল সমাপ্তির তারিখ', 'Ends At')}</label>
                    <input
                      type="date"
                      value={settings.flashSale?.endsAt?.slice(0, 10) || '2026-12-31'}
                      onChange={(e) => {
                        updateSettings({
                          flashSale: {
                            ...settings.flashSale,
                            endsAt: new Date(e.target.value).toISOString()
                          }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={() => addToast('success', at('সংরক্ষিত হয়েছে!', 'Saved!'), at('ফ্ল্যাশ সেল সেটিংস আপডেট হয়েছে।', 'Flash sale settings updated.'))}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  {at('ফ্ল্যাশ সেল আপডেট সংরক্ষণ করুন', 'Save Flash Sale Settings')}
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
                  <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full self-start">
                    {products.filter(p => p.isFlashSale).length} {at('টি পণ্য নির্বাচিত', 'Products Selected')}
                  </span>
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
          )}

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
                    <div className="aspect-[16/7] rounded-xl overflow-hidden bg-slate-950 relative">
                      <img src={sl.image} alt="" className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-white">
                        {at(`স্লাইড #${index + 1}`, `Slide #${index + 1}`)}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white">{at(sl.titleBn, sl.titleEn)}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{at(sl.subtitleBn, sl.subtitleEn)}</p>
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
            </div>
          )}

          {/* TAB 13: CUSTOMER REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-black text-white">{t('কাস্টমার রিভিউ ও রেটিং', 'Customer Reviews')}</h3>
                <p className="text-xs text-slate-400">{t('ক্রেতাদের রিভিউ পর্যবেক্ষণ ও অপ্রয়োজনীয় রিভিউ মডারেশন', 'Moderate verified customer feedback & reviews')}</p>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">ক্রেতার নাম</th>
                      <th className="py-3 px-4">রেটিং</th>
                      <th className="py-3 px-4">মতামত ও কমেন্ট</th>
                      <th className="py-3 px-4">তারিখ</th>
                      <th className="py-3 px-4">ভেরিফাইড</th>
                      <th className="py-3 px-4 text-right">মুছে ফেলুন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {reviews.map((rev) => (
                      <tr key={rev.id} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-bold text-white">{rev.customerName}</td>
                        <td className="py-3.5 px-4 font-bold text-amber-400">{rev.rating} ★</td>
                        <td className="py-3.5 px-4 text-slate-300 max-w-xs">{rev.comment}</td>
                        <td className="py-3.5 px-4 text-slate-400">{rev.date}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                            Verified
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              deleteProductReview(rev.id);
                            }}
                            title={at('রিভিউ মুছে ফেলুন', 'Delete Review')}
                            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 14: USERS & STAFF TEAM */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">{t('ব্যবহারকারী ও স্টাফ টিম', 'Users & Staff Members')}</h3>
                  <p className="text-xs text-slate-400">{t('অ্যাডমিন, অর্ডার ম্যানেজার ও কাস্টমার সাপোর্ট সদস্যদের একাউন্ট রোল', 'Manage staff roles, order managers and support agents')}</p>
                </div>
                <button
                  onClick={openNewUserModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('নতুন স্টাফ যোগ করুন', 'Add Staff')}</span>
                </button>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
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
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                            Active
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditUserModal(u)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {u.role !== 'super_admin' && (
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
          )}

          {/* TAB 15: STORE DESIGN & FOOTER EDITOR */}
          {activeTab === 'design_footer' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-black text-white">{t('স্টোর ডিজাইন ও ফুটার এডিটর', 'Store Design & Footer Editor')}</h3>
                <p className="text-xs text-slate-400">{t('ফুটারের সমস্ত তথ্য ১০০% পরিবর্তনযোগ্য (About, হটলাইন, হোয়াটসঅ্যাপ, ঠিকানা ও সোশ্যাল লিংক)', '100% editable footer content and contact links')}</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 max-w-3xl">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">{t('ফুটার সম্পর্কে (বাংলা বিবরণ)', 'About Text (Bangla)')}</label>
                  <textarea
                    rows={2}
                    value={settings.footerSettings?.aboutTextBn || ''}
                    onChange={(e) => {
                      updateSettings({
                        footerSettings: {
                          ...settings.footerSettings,
                          aboutTextBn: e.target.value
                        }
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">{t('হটলাইন নাম্বার', 'Hotline Phone')}</label>
                    <input
                      type="text"
                      value={settings.footerSettings?.hotline || ''}
                      onChange={(e) => {
                        updateSettings({
                          footerSettings: {
                            ...settings.footerSettings,
                            hotline: e.target.value
                          }
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
                          footerSettings: {
                            ...settings.footerSettings,
                            whatsappNumber: e.target.value
                          }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">{t('সাপোর্ট ইমেইল', 'Support Email')}</label>
                    <input
                      type="email"
                      value={settings.footerSettings?.email || ''}
                      onChange={(e) => {
                        updateSettings({
                          footerSettings: {
                            ...settings.footerSettings,
                            email: e.target.value
                          }
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
                          footerSettings: {
                            ...settings.footerSettings,
                            address: e.target.value
                          }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">{t('কপিরাইট টেক্সট (বাংলা)', 'Copyright Text')}</label>
                    <input
                      type="text"
                      value={settings.footerSettings?.copyrightBn || ''}
                      onChange={(e) => {
                        updateSettings({
                          footerSettings: {
                            ...settings.footerSettings,
                            copyrightBn: e.target.value
                          }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-bold">
                      <input
                        type="checkbox"
                        checked={settings.footerSettings?.showPaymentBadges !== false}
                        onChange={(e) => {
                          updateSettings({
                            footerSettings: {
                              ...settings.footerSettings,
                              showPaymentBadges: e.target.checked
                            }
                          });
                        }}
                        className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                      />
                      <span>বিকাশ, নগদ, রকেট ও কুরিয়ার পার্টনার ব্যাজ প্রদর্শন করুন</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => addToast('success', t('সংরক্ষিত হয়েছে!', 'Saved!'), t('ফুটার সেটিংস সফলভাবে আপডেট করা হয়েছে।', 'Footer settings saved.'))}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  {t('ফুটার সেটিংস সেভ করুন', 'Save Footer Settings')}
                </button>
              </div>
            </div>
          )}

          {/* TAB 16: SETTINGS (PAYMENT & 64 DISTRICTS DELIVERY) */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-black text-white">{t('পেমেন্ট ও ডেলিভারি সেটিংস', 'Payment & Delivery Settings')}</h3>
                <p className="text-xs text-slate-400">{t('বিকাশ, নগদ, রকেট মার্চেন্ট নাম্বার ও বাংলাদেশের ৬৪ জেলার ডেলিভারি চার্জ নির্ধারণ', 'bKash/Nagad/Rocket merchants, advance fees and delivery rates')}</p>
              </div>

              {/* Theme Switcher for Different Business Categories (Req 13) */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>{t('স্টোর বিজনেস থিম সিলেক্টর (Store Business Theme)', 'Store Business Theme')}</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {t('আপনার ব্যবসার ধরন অনুযায়ী এক ক্লিকে স্টোর থিম ও ক্যাটাগরি সেট করুন', 'Select theme optimized for your business category')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { id: 'gadgets', name: 'স্মার্ট গ্যাজেট', icon: '⚡', desc: 'Smart Gadgets' },
                    { id: 'islamic', name: 'সুন্নাহ ও আতর', icon: '🌙', desc: 'Sunnah & Attar' },
                    { id: 'organic', name: 'অর্গানিক ফুড', icon: '🍯', desc: 'Organic Food' },
                    { id: 'medical', name: 'মেডিকেল ও ফার্মেসি', icon: '💊', desc: 'Pharmacy' },
                    { id: 'fashion', name: 'ফ্যাশন ও লাইফস্টাইল', icon: '👔', desc: 'Fashion' }
                  ].map((th) => (
                    <button
                      key={th.id}
                      onClick={() => {
                        updateSettings({ theme: th.id as any });
                        addToast('success', t('থিম পরিবর্তন হয়েছে!', 'Theme Changed!'), th.name);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        settings.theme === th.id
                          ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{th.icon}</span>
                      <span className="font-bold text-xs text-white block">{th.name}</span>
                      <span className="text-[10px] text-slate-500 block">{th.desc}</span>
                    </button>
                  ))}
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

              <button
                onClick={() => addToast('success', t('সংরক্ষিত হয়েছে!', 'Saved!'), t('পেমেন্ট ও ডেলিভারি সেটিংস আপডেট হয়েছে।', 'Payment & Delivery rates updated.'))}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
              >
                {t('সেটিংস সংরক্ষণ করুন', 'Save Settings')}
              </button>
            </div>
          )}
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

              <div>
                <label className="block text-slate-300 font-bold mb-1">ক্যাটাগরি</label>
                <select
                  value={productForm.category}
                  onChange={(e) => {
                    const sel = categories.find((c) => c.slug === e.target.value);
                    setProductForm({
                      ...productForm,
                      category: e.target.value,
                      categoryBn: sel ? sel.nameBn : productForm.categoryBn
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
                <label className="block text-slate-300 font-bold mb-1">ছবির URL (কমা দিয়ে একাধিক ছবি দিতে পারেন)</label>
                <input
                  type="text"
                  required
                  value={productForm.images.join(', ')}
                  onChange={(e) => setProductForm({ ...productForm, images: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
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
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
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
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
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
                <label className="block text-slate-300 font-bold mb-1">সাবটাইটেল (বাংলা)</label>
                <input
                  type="text"
                  value={slideForm.subtitleBn}
                  onChange={(e) => setSlideForm({ ...slideForm, subtitleBn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">ছবির URL</label>
                <input
                  type="text"
                  required
                  value={slideForm.image}
                  onChange={(e) => setSlideForm({ ...slideForm, image: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ডিসকাউন্ট ব্যাজ টেক্সট</label>
                  <input
                    type="text"
                    value={slideForm.discountBadgeBn || ''}
                    onChange={(e) => setSlideForm({ ...slideForm, discountBadgeBn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">বাটন টেক্সট</label>
                  <input
                    type="text"
                    value={slideForm.buttonTextBn}
                    onChange={(e) => setSlideForm({ ...slideForm, buttonTextBn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
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
