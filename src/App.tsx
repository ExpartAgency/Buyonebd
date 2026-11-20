import React, { useState, useMemo, useEffect, Suspense } from 'react';
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
import { OrderTrackerView } from './components/tracking/OrderTrackerView';
import { AdminLoginModal } from './components/auth/AdminLoginModal';
import { CustomerLoginModal } from './components/auth/CustomerLoginModal';
import { ToastContainer } from './components/common/ToastContainer';
import { WaitlistModal } from './components/common/WaitlistModal';
import { PartnerPortalModal } from './components/partner/PartnerPortalModal';
import { LuckySpinLeftLauncher } from './components/spin/LuckySpinModal';
import { SingleProductView } from './components/home/SingleProductView';
import { AboutView } from './components/home/AboutView';
import { Product } from './types';
import { Flame, PackageSearch, Clock, Sparkles, X, Copy, Gift, History, Trash2 } from 'lucide-react';

const AdminDashboard = React.lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const CustomerDashboardModal = React.lazy(() =>
  import('./components/customer/CustomerDashboardModal').then((m) => ({ default: m.CustomerDashboardModal }))
);
const WhatsAppAgentModal = React.lazy(() =>
  import('./components/whatsapp/WhatsAppAgentModal').then((m) => ({ default: m.WhatsAppAgentModal }))
);
const AIVoiceCallModal = React.lazy(() =>
  import('./components/ai/AIVoiceCallModal').then((m) => ({ default: m.AIVoiceCallModal }))
);
const LuckySpinModal = React.lazy(() =>
  import('./components/spin/LuckySpinModal').then((m) => ({ default: m.LuckySpinModal }))
);

function StoreMainContent() {
  const {
    products,
    orders,
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
    trackPixelEvent,
    settings,
    lang,
    t,
    setIsAdminLoginOpen,
    isAdminLoggedIn,
    selectedProductForPage,
    isSpinOpen,
    setIsSpinOpen,
    isMobileCategoryDrawerOpen,
    setIsMobileCategoryDrawerOpen,
    recentlyViewedIds,
    clearRecentlyViewed,
    activeReseller,
    activeWholesaler,
    logoutReseller,
    logoutWholesaler,
    openPartnerPortal,
    addToast
  } = useStore();

  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'rating' | 'discount'>('default');
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [waitlistProduct, setWaitlistProduct] = useState<Product | null>(null);

  const parseFlashDateMs = (raw?: string): number => {
    if (!raw) return NaN;
    const trimmed = String(raw).trim();
    const dmy = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/);
    if (dmy) {
      const [, dd, mm, yyyy, hh = '23', min = '59'] = dmy;
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), 59).getTime();
    }
    return new Date(trimmed).getTime();
  };

  const computeFlashTimeLeft = (endsAtIso?: string) => {
    const targetMs = parseFlashDateMs(endsAtIso);
    const diffMs = Number.isFinite(targetMs) ? Math.max(0, targetMs - Date.now()) : 6 * 3600 * 1000;
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    return {
      days,
      hours,
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60
    };
  };

  const [flashTimeLeft, setFlashTimeLeft] = useState(() => computeFlashTimeLeft(settings.flashSale?.endsAt));
  const [isPromoPopupVisible, setIsPromoPopupVisible] = useState(false);
  const [referralBannerCode, setReferralBannerCode] = useState<string | null>(null);

  // Live Favicon Sync from Admin Settings
  useEffect(() => {
    const href = settings.faviconUrl?.trim();
    if (!href) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = href;
  }, [settings.faviconUrl]);

  // Live Microsoft Clarity Connect Injection
  useEffect(() => {
    const clarity = settings.marketingSettings?.clarity;
    const projectId = clarity?.projectId?.trim();
    if (!clarity?.enabled || !projectId || typeof window === 'undefined') return;
    const scriptId = 'buyone-clarity-script';
    if (document.getElementById(scriptId)) return;
    const win = window as any;
    win.clarity =
      win.clarity ||
      function (...args: any[]) {
        (win.clarity.q = win.clarity.q || []).push(args);
      };
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`;
    document.head.appendChild(script);
  }, [settings.marketingSettings?.clarity?.enabled, settings.marketingSettings?.clarity?.projectId]);

  useEffect(() => {
    setFlashTimeLeft(computeFlashTimeLeft(settings.flashSale?.endsAt));
    const timer = setInterval(() => {
      setFlashTimeLeft(computeFlashTimeLeft(settings.flashSale?.endsAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.flashSale?.endsAt]);

  // Organic Referral URL detection (?ref=CODE) & UTM Campaign Attribution (?utm_source=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode && settings.organicMarketing?.referralProgram?.enabled !== false) {
      setReferralBannerCode(refCode.toUpperCase());
      localStorage.setItem('buyone_referred_by', refCode.toUpperCase());
    }
    const utmSource = params.get('utm_source');
    const utmCampaign = params.get('utm_campaign');
    if (utmSource || utmCampaign) {
      sessionStorage.setItem(
        'buyone_utm_attribution',
        JSON.stringify({ source: utmSource || '', medium: params.get('utm_medium') || '', campaign: utmCampaign || '' })
      );
      trackPixelEvent('CampaignVisit', {
        urlPath: window.location.pathname + window.location.search,
        contentName: [utmSource, utmCampaign].filter(Boolean).join(' / ')
      });
    }
  }, [settings.organicMarketing?.referralProgram?.enabled]);

  // Live Social Proof FOMO Ticker (Admin-controlled)
  const [fomoToastData, setFomoToastData] = useState<{
    buyer: string;
    city: string;
    productTitle: string;
    productId?: string;
    image: string;
    ago: string;
  } | null>(null);
  const [isFomoDismissed, setIsFomoDismissed] = useState(false);

  useEffect(() => {
    const fomoCfg = settings.organicMarketing?.socialProofFomo;
    if (!fomoCfg?.enabled || isFomoDismissed || activeView !== 'store') {
      setFomoToastData(null);
      return;
    }
    const intervalMs = Math.max(8, Number(fomoCfg.intervalSeconds) || 18) * 1000;
    const showNext = () => {
      const realPool = orders.filter((o) => o?.items?.[0]);
      if (realPool.length > 0 && (fomoCfg.showRealOrdersOnly || Math.random() > 0.35)) {
        const pick = realPool[Math.floor(Math.random() * Math.min(realPool.length, 10))];
        const item = pick.items[0];
        const prod = products.find((p) => p.id === item.productId);
        setFomoToastData({
          buyer: (pick.customer?.name || 'Customer').split(' ')[0],
          city: pick.customer?.district?.split(' - ')[0] || 'Dhaka',
          productTitle: lang === 'bn' ? item.productTitleBn || item.productTitle : item.productTitle,
          productId: prod?.id,
          image: item.image || prod?.images?.[0] || '',
          ago: lang === 'bn' ? 'এইমাত্র অর্ডার করেছেন' : 'just ordered'
        });
      } else if (!fomoCfg.showRealOrdersOnly && products.length > 0) {
        const prod = products[Math.floor(Math.random() * products.length)];
        const names = ['তানভীর', 'সাদিয়া', 'মাহমুদ', 'নুসরাত', 'রাকিব', 'ফারহানা'];
        const cities = ['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'কুমিল্লা'];
        setFomoToastData({
          buyer: names[Math.floor(Math.random() * names.length)],
          city: cities[Math.floor(Math.random() * cities.length)],
          productTitle: lang === 'bn' ? prod.titleBn : prod.title,
          productId: prod.id,
          image: prod.images?.[0] || '',
          ago: lang === 'bn' ? 'অর্ডার কনফার্ম করেছেন' : 'verified COD order'
        });
      }
      setTimeout(() => setFomoToastData(null), 5500);
    };
    const startTimer = setTimeout(showNext, 4500);
    const intervalId = setInterval(showNext, intervalMs);
    return () => {
      clearTimeout(startTimer);
      clearInterval(intervalId);
    };
  }, [
    settings.organicMarketing?.socialProofFomo?.enabled,
    settings.organicMarketing?.socialProofFomo?.intervalSeconds,
    settings.organicMarketing?.socialProofFomo?.showRealOrdersOnly,
    isFomoDismissed,
    activeView,
    products.length,
    orders.length,
    lang
  ]);

  // Organic Promo / Exit-Intent Discount Popup trigger
  useEffect(() => {
    const promo = settings.organicMarketing?.promoPopup;
    if (!promo?.enabled || activeView === 'admin') return;
    if (sessionStorage.getItem('buyone_promo_dismissed') === '1') return;
    const delayMs = Math.max(1, promo.delaySeconds ?? 6) * 1000;
    const id = setTimeout(() => {
      setIsPromoPopupVisible(true);
    }, delayMs);
    return () => clearTimeout(id);
  }, [settings.organicMarketing?.promoPopup?.enabled, settings.organicMarketing?.promoPopup?.delaySeconds, activeView]);

  // Detect clean "/hossain" path or typed keyword without trapping Store View transitions
  const isAdminLoggedInRef = React.useRef(isAdminLoggedIn);
  isAdminLoggedInRef.current = isAdminLoggedIn;

  useEffect(() => {
    const checkHossainRoute = () => {
      const path = window.location.pathname.replace(/\/+$/, '').toLowerCase() || '/';
      const hash = window.location.hash.toLowerCase();

      if (path === '/hossain' || path.startsWith('/hossain/') || hash === '#hossain') {
        if (window.location.pathname !== '/hossain' || window.location.hash) {
          window.history.replaceState({}, '', '/hossain');
        }
        if (!isAdminLoggedInRef.current) {
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
        if (window.location.pathname !== '/hossain' || window.location.hash) {
          window.history.pushState({}, '', '/hossain');
        }
        if (!isAdminLoggedInRef.current) {
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
  }, []);

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

  // Last 5 clicked products tracked in localStorage
  const recentlyViewedProducts = useMemo(
    () =>
      recentlyViewedIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p))
        .slice(0, 5),
    [recentlyViewedIds, products]
  );

  // View: Admin Dashboard (strictly guarded by isAdminLoggedIn so /hossain always shows login popup first)
  if (activeView === 'admin') {
    if (!isAdminLoggedIn) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-black text-white">{t('ম্যানেজমেন্ট প্যানেল সুরক্ষিত', 'Restricted Management Access (/hossain)')}</h2>
            <p className="text-xs text-slate-400">{t('প্রবেশ করতে অ্যাডমিন ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।', 'Sign in with administrator credentials to continue.')}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsAdminLoginOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                {t('অ্যাডমিন লগইন পপআপ খুলুন', 'Open Admin Login')}
              </button>
              <button
                type="button"
                onClick={() => goHome()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
              >
                {t('স্টোরে ফিরুন', 'Return to Store')}
              </button>
            </div>
          </div>
          <ToastContainer />
          <AdminLoginModal onSuccessNavigate={() => setActiveView('admin')} />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-slate-950 pb-16 md:pb-0 overflow-x-clip w-full max-w-full">
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 text-xs font-bold">Loading Management Console...</div>}>
          <AdminDashboard />
          <AIVoiceCallModal />
        </Suspense>
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
        <Suspense fallback={null}>
          <AIVoiceCallModal />
          <WhatsAppAgentModal />
          <LuckySpinModal isOpen={isSpinOpen} onClose={() => setIsSpinOpen(false)} />
          <CustomerDashboardModal />
        </Suspense>
        <LuckySpinLeftLauncher onOpen={() => setIsSpinOpen(true)} />
        <AdminLoginModal onSuccessNavigate={() => setActiveView('admin')} />
        <CustomerLoginModal />
        <PartnerPortalModal />
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
        <Suspense fallback={null}>
          <AIVoiceCallModal />
          <WhatsAppAgentModal />
          <LuckySpinModal isOpen={isSpinOpen} onClose={() => setIsSpinOpen(false)} />
          <CustomerDashboardModal />
        </Suspense>
        <LuckySpinLeftLauncher onOpen={() => setIsSpinOpen(true)} />
        <CustomerLoginModal />
        <MobileCategoryDrawer
          isOpen={isMobileCategoryDrawerOpen}
          onClose={() => setIsMobileCategoryDrawerOpen(false)}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat, sub) => selectCategoryFilter(cat, sub || null)}
        />
        <AdminLoginModal onSuccessNavigate={() => setActiveView('admin')} />
        <PartnerPortalModal />
        <ToastContainer />
        <MobileBottomNav onOpenCategories={() => setIsMobileCategoryDrawerOpen(true)} />
      </div>
    );
  }

  // View: About & Guarantees Page
  if (storeSubView === 'about') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 pb-16 md:pb-0 overflow-x-clip w-full max-w-full">
        <Navbar
          onOpenMobileCategories={() => setIsMobileCategoryDrawerOpen(true)}
          onSelectCategory={(cat, sub) => selectCategoryFilter(cat, sub || null)}
        />
        <main className="flex-1 w-full max-w-full overflow-x-clip">
          <AboutView />
        </main>
        <Footer />
        <OneClickCheckoutModal />
        <CartDrawer />
        <Suspense fallback={null}>
          <AIVoiceCallModal />
          <WhatsAppAgentModal />
          <LuckySpinModal isOpen={isSpinOpen} onClose={() => setIsSpinOpen(false)} />
          <CustomerDashboardModal />
        </Suspense>
        <LuckySpinLeftLauncher onOpen={() => setIsSpinOpen(true)} />
        <CustomerLoginModal />
        <MobileCategoryDrawer
          isOpen={isMobileCategoryDrawerOpen}
          onClose={() => setIsMobileCategoryDrawerOpen(false)}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat, sub) => selectCategoryFilter(cat, sub || null)}
        />
        <AdminLoginModal onSuccessNavigate={() => setActiveView('admin')} />
        <PartnerPortalModal />
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
        {/* Reseller & Wholesale Partner Dashboard Bar (Visible both Pending & Approved) */}
        {(activeReseller || activeWholesaler) && (
          <div className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="font-bold text-emerald-400">
                {activeReseller
                  ? activeReseller.status === 'approved'
                    ? t(`রিসেলার মোড সক্রিয়: ${activeReseller.name} (${activeReseller.resellerCode})`, `Reseller Pricing Unlocked: ${activeReseller.name} · ${activeReseller.resellerCode}`)
                    : t(`রিসেলার অ্যাকাউন্ট (${activeReseller.resellerCode}) — অনুমোদনের অপেক্ষায়`, `Reseller Account (${activeReseller.resellerCode}) — Pending Approval`)
                  : activeWholesaler?.status === 'approved'
                  ? t(`হোলসেল B2B সক্রিয়: ${activeWholesaler?.companyName}`, `Wholesale B2B Active: ${activeWholesaler?.companyName} (${activeWholesaler?.tier?.toUpperCase()})`)
                  : t(`হোলসেল অ্যাকাউন্ট: ${activeWholesaler?.companyName} — অনুমোদনের অপেক্ষায়`, `Wholesale Account: ${activeWholesaler?.companyName} — Pending Approval`)}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openPartnerPortal(activeReseller ? 'reseller' : 'wholesale')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
              >
                {activeReseller ? t('রিসেলার ড্যাশবোর্ড খুলুন', 'Reseller Dashboard') : t('হোলসেল ড্যাশবোর্ড খুলুন', 'Wholesale Dashboard')}
              </button>
              <button
                type="button"
                onClick={() => (activeReseller ? logoutReseller() : logoutWholesaler())}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] cursor-pointer"
              >
                {t('সাইন আউট', 'Sign Out')}
              </button>
            </div>
          </div>
        )}
        {/* Organic Referral Visitor Welcome Strip */}
        {referralBannerCode && (
          <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex flex-wrap items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2.5 text-xs">
              <Gift className="w-4 h-4 shrink-0 text-amber-300" />
              <span>
                {t(
                  `রেফারেল ইনভাইটেশন অ্যাক্টিভ! প্রথম অর্ডারে ৳${settings.organicMarketing?.referralProgram?.refereeDiscountBdt || 100} ছাড় পেতে কুপন ব্যবহার করুন:`,
                  `Referral Active! Enjoy ৳${settings.organicMarketing?.referralProgram?.refereeDiscountBdt || 100} OFF with code:`
                )}{' '}
                <strong className="font-mono bg-white/20 px-2 py-0.5 rounded">{referralBannerCode}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setReferralBannerCode(null)}
              className="text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-mono font-black text-white bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  {flashTimeLeft.days > 0 && (
                    <>
                      <span>{flashTimeLeft.days}d</span>
                      <span className="text-rose-400">:</span>
                    </>
                  )}
                  <span>{flashTimeLeft.hours.toString().padStart(2, '0')}h</span>
                  <span className="text-rose-400">:</span>
                  <span>{flashTimeLeft.minutes.toString().padStart(2, '0')}m</span>
                  <span className="text-rose-400">:</span>
                  <span className="text-rose-400">{flashTimeLeft.seconds.toString().padStart(2, '0')}s</span>
                </div>

                <button
                  type="button"
                  onClick={() => selectCategoryFilter('flash-sale', null)}
                  style={{ color: 'var(--brand-primary, #34d399)' }}
                  className="text-xs font-bold hover:opacity-80 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span>{t('সব ফ্ল্যাশ ডিল দেখুন', 'View All Flash Deals')}</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.filter((p) => p.isFlashSale).slice(0, 4).map((prod) => (
                <ProductCard
                  key={`flash-${prod.id}`}
                  product={prod}
                  onViewDetails={(p) => openProductPage(p)}
                  onNotifyWaitlist={(p) => setWaitlistProduct(p)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed Section (Last 5 clicked products from localStorage) */}
        {storeSubView === 'home' &&
          searchQuery.trim() === '' &&
          selectedCategory === 'all' &&
          recentlyViewedProducts.length > 0 && (
            <section
              aria-labelledby="recently-viewed-heading"
              className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-center shrink-0">
                    <History className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="recently-viewed-heading"
                      className="font-display text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate"
                    >
                      {t(
                        settings.cmsTexts?.recentlyViewedTitleBn || 'সম্প্রতি দেখা পণ্য',
                        settings.cmsTexts?.recentlyViewedTitleEn || 'Recently Viewed'
                      )}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {t(
                        `আপনার সর্বশেষ দেখা ${recentlyViewedProducts.length}টি পণ্য (সর্বোচ্চ ৫টি সংরক্ষিত)`,
                        `Last ${recentlyViewedProducts.length} of 5 products you clicked`
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    clearRecentlyViewed();
                    addToast(
                      'info',
                      t('ইতিহাস মুছে ফেলা হয়েছে', 'History Cleared'),
                      t('সম্প্রতি দেখা পণ্যের তালিকা পরিষ্কার করা হয়েছে।', 'Your recently viewed list has been cleared.')
                    );
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('তালিকা মুছুন', 'Clear History')}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {recentlyViewedProducts.map((prod) => (
                  <ProductCard
                    key={`recent-${prod.id}`}
                    product={prod}
                    onViewDetails={(p) => openProductPage(p)}
                    onNotifyWaitlist={(p) => setWaitlistProduct(p)}
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
                onNotifyWaitlist={(p) => setWaitlistProduct(p)}
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
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
      />
      <OneClickCheckoutModal />
      <CartDrawer />
      <Suspense fallback={null}>
        <CustomerDashboardModal />
        <AIVoiceCallModal />
        <WhatsAppAgentModal />
        <LuckySpinModal
          isOpen={isSpinOpen}
          onClose={() => setIsSpinOpen(false)}
        />
      </Suspense>
      <MobileCategoryDrawer
        isOpen={isMobileCategoryDrawerOpen}
        onClose={() => setIsMobileCategoryDrawerOpen(false)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat, sub) => selectCategoryFilter(cat, sub || null)}
      />
      <AdminLoginModal onSuccessNavigate={() => setActiveView('admin')} />
      <PartnerPortalModal />
      <WaitlistModal product={waitlistProduct} onClose={() => setWaitlistProduct(null)} />
      <ToastContainer />

      {/* Organic Discount Promo Popup (Admin Controlled) */}
      {isPromoPopupVisible && settings.organicMarketing?.promoPopup?.enabled && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />
            <button
              type="button"
              onClick={() => {
                setIsPromoPopupVisible(false);
                sessionStorage.setItem('buyone_promo_dismissed', '1');
              }}
              className="absolute top-3.5 right-3.5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {lang === 'bn'
                    ? settings.organicMarketing.promoPopup.discountLabelBn
                    : settings.organicMarketing.promoPopup.discountLabelEn}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {lang === 'bn'
                  ? settings.organicMarketing.promoPopup.headlineBn
                  : settings.organicMarketing.promoPopup.headlineEn}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {lang === 'bn'
                  ? settings.organicMarketing.promoPopup.subtextBn
                  : settings.organicMarketing.promoPopup.subtextEn}
              </p>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-dashed border-emerald-500/60 flex items-center justify-between gap-2">
                <span className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400 tracking-wider">
                  {settings.organicMarketing.promoPopup.couponCode}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    const code = settings.organicMarketing?.promoPopup?.couponCode || 'WELCOME100';
                    try {
                      await navigator.clipboard.writeText(code);
                    } catch {
                      // ignore clipboard error
                    }
                    addToast('success', t('কুপন কোড কপি হয়েছে!', 'Coupon Copied!'), code);
                    setIsPromoPopupVisible(false);
                    sessionStorage.setItem('buyone_promo_dismissed', '1');
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('কোড কপি করুন', 'Copy Code')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Social Proof FOMO Notification Ticker */}
      {fomoToastData && !isFomoDismissed && (
        <div className="fixed bottom-20 sm:bottom-5 left-3 sm:left-5 z-40 max-w-xs bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 shadow-xl rounded-2xl p-2.5 flex items-center gap-2.5 animate-in slide-in-from-bottom-4">
          {fomoToastData.image && (
            <img
              src={fomoToastData.image}
              alt={fomoToastData.productTitle}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
            />
          )}
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[11px] font-extrabold text-slate-900 dark:text-white truncate">
              {fomoToastData.buyer} ({fomoToastData.city}) ·{' '}
              <span className="text-emerald-600 dark:text-emerald-400">{fomoToastData.ago}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                const target = products.find((p) => p.id === fomoToastData.productId);
                if (target) openProductPage(target);
              }}
              className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 truncate block max-w-full text-left cursor-pointer"
            >
              {fomoToastData.productTitle}
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsFomoDismissed(true);
              setFomoToastData(null);
            }}
            aria-label="Dismiss notification"
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <MobileBottomNav onOpenCategories={() => setIsMobileCategoryDrawerOpen(true)} />
    </div>
  );
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error?.message || 'Unexpected application error' };
  }

  componentDidCatch(error: Error) {
    console.error('App ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-center">
            <h2 className="text-lg font-bold text-white">Something went wrong</h2>
            <p className="text-xs text-slate-400 break-words">{this.state.errorMessage}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
            >
              Reload Storefront
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <StoreProvider>
        <StoreMainContent />
      </StoreProvider>
    </AppErrorBoundary>
  );
}
