import React, { useState, useMemo, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { MobileCategoryDrawer } from './components/layout/MobileCategoryDrawer';
import { HeroBanner } from './components/home/HeroBanner';
import { ProductCard } from './components/home/ProductCard';
import { ProductDetailModal } from './components/home/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { OneClickCheckoutModal } from './components/checkout/OneClickCheckoutModal';
import { AIVoiceCallModal } from './components/ai/AIVoiceCallModal';
import { WhatsAppAgentModal } from './components/whatsapp/WhatsAppAgentModal';
import { OrderTrackerView } from './components/tracking/OrderTrackerView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/auth/AdminLoginModal';
import { ToastContainer } from './components/common/ToastContainer';
import { LuckySpinModal, LuckySpinLeftLauncher } from './components/spin/LuckySpinModal';
import { SingleProductView } from './components/home/SingleProductView';
import { CustomerDashboardModal } from './components/customer/CustomerDashboardModal';
import { Product } from './types';
import { Flame, PackageSearch } from 'lucide-react';

function StoreMainContent() {
  const {
    products,
    categories,
    activeView,
    setActiveView,
    settings,
    lang,
    t,
    setIsAdminLoginOpen,
    isAdminLoggedIn,
    selectedProductForPage,
    setSelectedProductForPage
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'rating' | 'discount'>('default');
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isSpinOpen, setIsSpinOpen] = useState(false);
  const [isMobileCategoryDrawerOpen, setIsMobileCategoryDrawerOpen] = useState(false);

  // Requirement 4: Detect URL "/hossain" or "#hossain" or typed keyword to pop up admin login
  useEffect(() => {
    const checkHossainRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (path.includes('hossain') || hash.includes('hossain') || search.includes('hossain')) {
        if (!isAdminLoggedIn) {
          setIsAdminLoginOpen(true);
        } else {
          setActiveView('admin');
        }
      }
    };

    checkHossainRoute();
    window.addEventListener('popstate', checkHossainRoute);
    window.addEventListener('hashchange', checkHossainRoute);

    // Keystroke listener for typing "hossain"
    let typedBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore inputs and textareas
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      typedBuffer = (typedBuffer + e.key.toLowerCase()).slice(-7);
      if (typedBuffer === 'hossain') {
        if (!isAdminLoggedIn) {
          setIsAdminLoginOpen(true);
        } else {
          setActiveView('admin');
        }
        typedBuffer = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', checkHossainRoute);
      window.removeEventListener('hashchange', checkHossainRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdminLoggedIn, setIsAdminLoginOpen, setActiveView]);

  // Dynamic SEO Title
  useEffect(() => {
    if (activeView === 'admin') {
      document.title = `Admin Portal (/hossain) - ${settings.storeName}`;
    } else if (activeView === 'tracking') {
      document.title = `রিয়েল-টাইম অর্ডার ট্র্যাকিং - ${settings.storeName}`;
    } else {
      document.title = `${settings.storeName} - ১ ক্লিকে অর্ডার ও ক্যাশ অন ডেলিভারি`;
    }
  }, [activeView, settings.storeName]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.titleBn.includes(searchQuery) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'flash-sale'
          ? p.isFlashSale
          : p.category === selectedCategory;

      return matchesSearch && matchesCat;
    });

    if (sortBy === 'price_asc') {
      return [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      return [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      return [...list].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'discount') {
      return [...list].sort(
        (a, b) => b.originalPrice - b.price - (a.originalPrice - a.price)
      );
    }
    return list;
  }, [products, searchQuery, selectedCategory, sortBy]);

  // View: Admin Dashboard
  if (activeView === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 pb-16 md:pb-0">
        <AdminDashboard />
        <AIVoiceCallModal />
        <ToastContainer />
        <AdminLoginModal onSuccessNavigate={() => setActiveView('admin')} />
      </div>
    );
  }

  // View: Order Tracking
  if (activeView === 'tracking') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 pb-16 md:pb-0">
        <Navbar onOpenMobileCategories={() => setIsMobileCategoryDrawerOpen(true)} />
        <main className="flex-1">
          <OrderTrackerView />
        </main>
        <Footer />
        <OneClickCheckoutModal />
        <CartDrawer />
        <AIVoiceCallModal />
        <WhatsAppAgentModal />
        <LuckySpinModal isOpen={isSpinOpen} onClose={() => setIsSpinOpen(false)} />
        <LuckySpinLeftLauncher onOpen={() => setIsSpinOpen(true)} />
        <AdminLoginModal onSuccessNavigate={() => setActiveView('admin')} />
        <CustomerDashboardModal />
        <MobileCategoryDrawer
          isOpen={isMobileCategoryDrawerOpen}
          onClose={() => setIsMobileCategoryDrawerOpen(false)}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />
        <ToastContainer />
        <MobileBottomNav onOpenCategories={() => setIsMobileCategoryDrawerOpen(true)} />
      </div>
    );
  }

  // View: Single Product Page View (Req 10: "click one products open single product show all not popup view")
  if (selectedProductForPage) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 pb-16 md:pb-0">
        <Navbar
          onOpenMobileCategories={() => setIsMobileCategoryDrawerOpen(true)}
          onSelectCategory={(cat) => {
            setSelectedProductForPage(null);
            setSelectedCategory(cat);
          }}
        />
        <main className="flex-1">
          <SingleProductView
            product={selectedProductForPage}
            onBack={() => setSelectedProductForPage(null)}
          />
        </main>
        <Footer />
        <OneClickCheckoutModal />
        <CartDrawer />
        <AIVoiceCallModal />
        <WhatsAppAgentModal />
        <LuckySpinModal isOpen={isSpinOpen} onClose={() => setIsSpinOpen(false)} />
        <CustomerDashboardModal />
        <AdminLoginModal onSuccessNavigate={() => setActiveView('admin')} />
        <ToastContainer />
        <MobileBottomNav onOpenCategories={() => setIsMobileCategoryDrawerOpen(true)} />
      </div>
    );
  }

  // View: Main Storefront
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 pb-16 md:pb-0">
      <Navbar
        onOpenMobileCategories={() => setIsMobileCategoryDrawerOpen(true)}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 w-full">
        {/* Dynamic 5-6 Slider Hero Carousel if not searching */}
        {searchQuery.trim() === '' && selectedCategory === 'all' && (
          <HeroBanner onCategoryFilter={(cat) => setSelectedCategory(cat)} />
        )}

        {/* Active Category Selector Rail */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <span>✨ {t('সকল পণ্য', 'All Products')}</span>
          </button>
          {settings?.flashSale?.enabled !== false && (
            <button
              onClick={() => setSelectedCategory('flash-sale')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'flash-sale'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
              }`}
            >
              <Flame className="w-3.5 h-3.5 animate-bounce" />
              <span>{t('ফ্ল্যাশ সেল', 'Flash Sale')}</span>
            </button>
          )}
          {categories.filter((c) => c.isActive).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.slug
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <span>{cat.icon || '🛍️'}</span>
              <span>{lang === 'bn' ? cat.nameBn : cat.nameEn}</span>
            </button>
          ))}
        </div>

        {/* Curated Flash Sale Section (if enabled and showing home view) */}
        {searchQuery.trim() === '' && selectedCategory === 'all' && settings?.flashSale?.enabled !== false && (
          <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-900/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600/20 text-rose-500 border border-rose-500/30 flex items-center justify-center font-bold">
                  <Flame className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                    <span>{lang === 'bn' ? settings.flashSale?.headlineBn : settings.flashSale?.headlineEn}</span>
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      {settings.flashSale?.discountPercentage || 40}% OFF
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('সীমিত সময়ের জন্য বিশেষ ছাড়যুক্ত পণ্যসমূহ', 'Limited time special discounts with fast cash on delivery')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCategory('flash-sale')}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>{t('সব ফ্ল্যাশ ডিল দেখুন', 'View All Flash Deals')}</span>
                <span>→</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {products.filter((p) => p.isFlashSale).slice(0, 4).map((prod) => (
                <ProductCard
                  key={`flash-${prod.id}`}
                  product={prod}
                  onViewDetails={(p) => {
                    setSelectedProductForPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section Title & Filter Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500 shrink-0" />
              <span>
                {selectedCategory === 'all'
                  ? t('হট ও ট্রেন্ডিং কালেকশন', 'Hot & Trending Collection')
                  : selectedCategory === 'flash-sale'
                  ? t('ধামাকা ফ্ল্যাশ সেল অফার', 'Mega Flash Sale Offers')
                  : t(
                      `${categories.find((c) => c.slug === selectedCategory)?.nameBn || selectedCategory} পণ্যসমূহ`,
                      `${categories.find((c) => c.slug === selectedCategory)?.nameEn || selectedCategory} Products`
                    )}
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              {t(
                `মোট ${filteredProducts.length} টি পণ্য পাওয়া গেছে | ক্যাশ অন ডেলিভারি ও এআই কল কনফার্মেশন সুবিধা`,
                `Found ${filteredProducts.length} items | Cash on delivery & AI voice confirmation`
              )}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {searchQuery && (
              <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 w-fit">
                <span>
                  {t('অনুসন্ধান:', 'Search:')} "{searchQuery}"
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-emerald-900 text-emerald-600 font-black cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm cursor-pointer hover:border-slate-300 focus:outline-none"
            >
              <option value="default">{t('সাজান: ডিফল্ট', 'Sort: Default')}</option>
              <option value="price_asc">{t('দাম: কম থেকে বেশি ৳↑', 'Price: Low to High')}</option>
              <option value="price_desc">{t('দাম: বেশি থেকে কম ৳↓', 'Price: High to Low')}</option>
              <option value="rating">{t('সেরা রেটিং ও রিভিউ ★', 'Top Rated & Reviews')}</option>
              <option value="discount">{t('সর্বোচ্চ ডিসকাউন্ট %', 'Biggest Discount')}</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onViewDetails={(p) => {
                  setSelectedProductForPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-800">
            <PackageSearch className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {t('কোনো পণ্য খুঁজে পাওয়া যায়নি', 'No Products Found')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t(
                'অন্য কোনো নাম দিয়ে সার্চ করুন অথবা ক্যাটাগরি ফিল্টার পরিবর্তন করুন।',
                'Try searching with a different keyword or reset filters.'
              )}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer hover:bg-emerald-700"
            >
              {t('সকল পণ্য দেখুন', 'View All Products')}
            </button>
          </div>
        )}
      </main>

      <Footer />

      {/* Floating Lucky Spin Launcher on Left Side */}
      <LuckySpinLeftLauncher onOpen={() => setIsSpinOpen(true)} />

      {/* Global Modals & Drawers */}
      <CustomerDashboardModal />
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
      />
      <OneClickCheckoutModal />
      <CartDrawer />
      <AIVoiceCallModal />
      <WhatsAppAgentModal />
      <LuckySpinModal
        isOpen={isSpinOpen}
        onClose={() => setIsSpinOpen(false)}
      />
      <MobileCategoryDrawer
        isOpen={isMobileCategoryDrawerOpen}
        onClose={() => setIsMobileCategoryDrawerOpen(false)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />
      <AdminLoginModal onSuccessNavigate={() => setActiveView('admin')} />
      <ToastContainer />

      {/* Sticky Mobile Bottom Navigation */}
      <MobileBottomNav onOpenCategories={() => setIsMobileCategoryDrawerOpen(true)} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StoreMainContent />
    </StoreProvider>
  );
}
