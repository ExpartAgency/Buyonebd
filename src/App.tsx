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
import { CustomerLoginModal } from './components/auth/CustomerLoginModal';
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
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    setSearchQuery,
    storeSubView,
    goHome,
    selectCategoryFilter,
    openProductPage,
    settings,
    lang,
    t,
    setIsAdminLoginOpen,
    isAdminLoggedIn,
    selectedProductForPage,
    isSpinOpen,
    setIsSpinOpen,
    isMobileCategoryDrawerOpen,
    setIsMobileCategoryDrawerOpen
  } = useStore();

  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'rating' | 'discount'>('default');
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Detect URL "/hossain" or "#hossain" or typed keyword to pop up admin login
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

    let typedBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
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

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const activeSubObj = activeCategoryObj?.subcategories?.find((s) => s.slug === selectedSubcategory);

  // Filtered & sorted products (supports Category AND Subcategory)
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

      const matchesSub =
        !selectedSubcategory || p.subcategory === selectedSubcategory;

      return matchesSearch && matchesCat && matchesSub;
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
  }, [products, searchQuery, selectedCategory, selectedSubcategory, sortBy]);

  // View: Admin Dashboard
  if (activeView === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 pb-16 md:pb-0 overflow-x-clip w-full max-w-full">
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
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 pb-16 md:pb-0 overflow-x-clip w-full max-w-full">
        <Navbar
          onOpenMobileCategories={() => setIsMobileCategoryDrawerOpen(true)}
          onSelectCategory={(cat, sub) => selectCategoryFilter(cat, sub || null)}
        />
        <main className="flex-1 w-full max-w-full overflow-x-clip">
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
        <CustomerLoginModal />
        <CustomerDashboardModal />
        <MobileCategoryDrawer
          isOpen={isMobileCategoryDrawerOpen}
          onClose={() => setIsMobileCategoryDrawerOpen(false)}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat, sub) => selectCategoryFilter(cat, sub || null)}
        />
        <ToastContainer />
        <MobileBottomNav onOpenCategories={() => setIsMobileCategoryDrawerOpen(true)} />
      </div>
    );
  }

  // View: Single Product Page View
  if (selectedProductForPage) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 pb-16 md:pb-0 overflow-x-clip w-full max-w-full">
        <Navbar
          onOpenMobileCategories={() => setIsMobileCategoryDrawerOpen(true)}
          onSelectCategory={(cat, sub) => selectCategoryFilter(cat, sub || null)}
        />
        <main className="flex-1 w-full max-w-full overflow-x-clip">
          <SingleProductView
            product={selectedProductForPage}
            onBack={goHome}
          />
        </main>
        <Footer />
        <OneClickCheckoutModal />
        <CartDrawer />
        <AIVoiceCallModal />
        <WhatsAppAgentModal />
        <LuckySpinModal isOpen={isSpinOpen} onClose={() => setIsSpinOpen(false)} />
        <LuckySpinLeftLauncher onOpen={() => setIsSpinOpen(true)} />
        <CustomerLoginModal />
        <CustomerDashboardModal />
        <MobileCategoryDrawer
          isOpen={isMobileCategoryDrawerOpen}
          onClose={() => setIsMobileCategoryDrawerOpen(false)}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat, sub) => selectCategoryFilter(cat, sub || null)}
        />
        <AdminLoginModal onSuccessNavigate={() => setActiveView('admin')} />
        <ToastContainer />
        <MobileBottomNav onOpenCategories={() => setIsMobileCategoryDrawerOpen(true)} />
      </div>
    );
  }

  // View: Main Storefront
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 pb-16 md:pb-0 overflow-x-clip w-full max-w-full">
      <Navbar
        onOpenMobileCategories={() => setIsMobileCategoryDrawerOpen(true)}
        onSelectCategory={(cat, sub) => selectCategoryFilter(cat, sub || null)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 w-full overflow-x-clip">
        {/* Show Hero Carousel only on Home root with no active filter */}
        {storeSubView === 'home' && searchQuery.trim() === '' && selectedCategory === 'all' && (
          <HeroBanner onCategoryFilter={(cat) => selectCategoryFilter(cat, null)} />
        )}

        {/* Active Department Breadcrumb & Subcategory Segmented Switcher */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => selectCategoryFilter('all', null)}
              style={selectedCategory === 'all' ? { backgroundColor: settings.themeColors?.primary || '#059669' } : undefined}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              {t(
                settings.cmsTexts?.allCategoriesLabelBn || 'সকল পণ্য',
                settings.cmsTexts?.allCategoriesLabelEn || 'All Products'
              )}
            </button>

            {settings?.flashSale?.enabled !== false && (
              <button
                type="button"
                onClick={() => selectCategoryFilter('flash-sale', null)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  selectedCategory === 'flash-sale'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                }`}
              >
                <Flame className="w-3.5 h-3.5 shrink-0" />
                <span>{t('ফ্ল্যাশ সেল', 'Flash Sale')}</span>
              </button>
            )}

            {categories.filter((c) => c.isActive).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectCategoryFilter(cat.slug, null)}
                style={selectedCategory === cat.slug ? { backgroundColor: settings.themeColors?.primary || '#059669' } : undefined}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.slug
                    ? 'text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                {lang === 'bn' ? cat.nameBn : cat.nameEn}
              </button>
            ))}
          </div>

          {/* Subcategory filter bar shown cleanly ONLY when a parent category is active */}
          {activeCategoryObj && activeCategoryObj.subcategories && activeCategoryObj.subcategories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pl-1">
              <button
                type="button"
                onClick={() => selectCategoryFilter(activeCategoryObj.slug, null)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer transition-colors whitespace-nowrap ${
                  !selectedSubcategory
                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {t('সবগুলো', 'All in ' + activeCategoryObj.nameEn)}
              </button>
              {activeCategoryObj.subcategories.map((sub) => (
                <button
                  key={sub.slug}
                  type="button"
                  onClick={() => selectCategoryFilter(activeCategoryObj.slug, sub.slug)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer transition-colors whitespace-nowrap ${
                    selectedSubcategory === sub.slug
                      ? 'bg-slate-900 text-white dark:bg-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {lang === 'bn' ? sub.nameBn : sub.nameEn}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Curated Flash Sale Section on Home */}
        {storeSubView === 'home' && searchQuery.trim() === '' && selectedCategory === 'all' && settings?.flashSale?.enabled !== false && (
          <section className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-white flex flex-wrap items-center gap-2">
                    <span>{lang === 'bn' ? settings.flashSale?.headlineBn : settings.flashSale?.headlineEn}</span>
                    <span className="text-xs font-bold text-rose-400 tabular-nums">
                      · {settings.flashSale?.discountPercentage || 40}% OFF
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('সীমিত সময়ের জন্য বিশেষ ছাড়যুক্ত পণ্যসমূহ', 'Limited time special discounts with cash on delivery')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => selectCategoryFilter('flash-sale', null)}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer self-start sm:self-auto whitespace-nowrap"
              >
                <span>{t('সব ফ্ল্যাশ ডিল দেখুন', 'View All Flash Deals')}</span>
                <span>→</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.filter((p) => p.isFlashSale).slice(0, 4).map((prod) => (
                <ProductCard
                  key={`flash-${prod.id}`}
                  product={prod}
                  onViewDetails={(p) => openProductPage(p)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Section Title & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h2 className="font-display text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {selectedCategory === 'all'
                ? storeSubView === 'products'
                  ? t('সকল পণ্য ক্যাটালগ', 'Complete Product Catalog')
                  : t(
                      settings.cmsTexts?.trendingTitleBn || 'হট ও ট্রেন্ডিং কালেকশন',
                      settings.cmsTexts?.trendingTitleEn || 'Hot & Trending Collection'
                    )
                : selectedCategory === 'flash-sale'
                ? t('ধামাকা ফ্ল্যাশ সেল অফার', 'Mega Flash Sale Offers')
                : activeSubObj
                ? `${lang === 'bn' ? activeCategoryObj?.nameBn : activeCategoryObj?.nameEn} · ${lang === 'bn' ? activeSubObj.nameBn : activeSubObj.nameEn}`
                : t(
                    `${activeCategoryObj?.nameBn || selectedCategory} পণ্যসমূহ`,
                    `${activeCategoryObj?.nameEn || selectedCategory} Products`
                  )}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 tabular-nums">
              {t(
                `মোট ${filteredProducts.length} টি পণ্য · ক্যাশ অন ডেলিভারি ও দ্রুত কুরিয়ার সুবিধা`,
                `${filteredProducts.length} items · Cash on delivery & nationwide courier`
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

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-2 rounded-xl shadow-xs cursor-pointer hover:border-slate-300 focus:outline-none"
            >
              <option value="default">{t('সাজান: ডিফল্ট', 'Sort: Default')}</option>
              <option value="price_asc">{t('দাম: কম থেকে বেশি', 'Price: Low to High')}</option>
              <option value="price_desc">{t('দাম: বেশি থেকে কম', 'Price: High to Low')}</option>
              <option value="rating">{t('সেরা রেটিং ও রিভিউ', 'Top Rated & Reviews')}</option>
              <option value="discount">{t('সর্বোচ্চ ডিসকাউন্ট %', 'Biggest Discount')}</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onViewDetails={(p) => openProductPage(p)}
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
              onClick={goHome}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer hover:bg-emerald-700"
            >
              {t('সকল পণ্য দেখুন', 'View All Products')}
            </button>
          </div>
        )}
      </main>

      <Footer />

      <LuckySpinLeftLauncher onOpen={() => setIsSpinOpen(true)} />

      {/* Global Modals & Drawers */}
      <CustomerLoginModal />
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
        onSelectCategory={(cat, sub) => selectCategoryFilter(cat, sub || null)}
      />
      <AdminLoginModal onSuccessNavigate={() => setActiveView('admin')} />
      <ToastContainer />

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
