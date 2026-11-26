import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Wallet,
  Sparkles,
  Gift,
  Award,
  Package,
  MapPin,
  Phone,
  Mail,
  TrendingDown,
  Truck,
  Edit2,
  Save,
  LogOut,
  Heart,
  Clock,
  Ticket,
  Copy,
  Check,
  ShieldCheck,
  Eye,
  CheckCircle2,
  PlusCircle,
  AlertTriangle,
  Send,
  RefreshCw,
  Share2,
  BellRing,
  Bell,
  Tag,
  CheckCheck,
  ExternalLink,
  LogIn
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BD_DISTRICTS } from '../../data/initialData';
import { WalletTopUpMethod, UserNotification, UserNotificationCategory } from '../../types';
import { audioEngine } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

export const CustomerDashboardModal: React.FC = () => {
  const {
    isCustomerDashboardOpen,
    setIsCustomerDashboardOpen,
    customerDashboardTab: activeTab,
    setCustomerDashboardTab: setActiveTab,
    isCustomerLoggedIn,
    setIsCustomerLoginOpen,
    userNotifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    customerProfile,
    updateCustomerProfile,
    customerWalletBalance,
    spinBonusBalance,
    spinBonusExpiresAt,
    walletTopUps,
    requestWalletTopUp,
    settings,
    redeemLoyaltyPoints,
    logoutCustomer,
    setIsSpinOpen,
    orders,
    products,
    visibleStoreProducts,
    wishlist,
    priceAlerts,
    waitlistEntries,
    addToCart,
    setActiveView,
    goHome,
    setTrackingSearchQuery,
    setSelectedProductForPage,
    openOneClickCheckout,
    addToast,
    lang,
    t
  } = useStore();

  const [notifFilter, setNotifFilter] = useState<'all' | UserNotificationCategory>('all');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isAddBalanceOpen, setIsAddBalanceOpen] = useState(false);
  const [topUpMethod, setTopUpMethod] = useState<WalletTopUpMethod>('bkash');
  const [topUpAmount, setTopUpAmount] = useState<string>('500');
  const [topUpSender, setTopUpSender] = useState<string>(customerProfile.phone || '');
  const [topUpTrxId, setTopUpTrxId] = useState<string>('');
  const [profileForm, setProfileForm] = useState({
    name: customerProfile.name,
    username: customerProfile.username || '',
    phone: customerProfile.phone,
    email: customerProfile.email,
    address: customerProfile.address,
    district: customerProfile.district
  });

  useEffect(() => {
    setProfileForm({
      name: customerProfile.name,
      username: customerProfile.username || '',
      phone: customerProfile.phone,
      email: customerProfile.email,
      address: customerProfile.address,
      district: customerProfile.district
    });
  }, [customerProfile]);

  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    if (!isCustomerDashboardOpen) return;
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isCustomerDashboardOpen]);

  const activeSpinBonus =
    spinBonusBalance > 0 && (!spinBonusExpiresAt || nowTick < new Date(spinBonusExpiresAt).getTime())
      ? spinBonusBalance
      : 0;
  const spinMsRemaining =
    activeSpinBonus > 0 && spinBonusExpiresAt
      ? Math.max(0, new Date(spinBonusExpiresAt).getTime() - nowTick)
      : 0;
  const spinHoursLeft = Math.floor(spinMsRemaining / 3600000);
  const spinMinsLeft = Math.floor((spinMsRemaining % 3600000) / 60000);
  const spinSecsLeft = Math.floor((spinMsRemaining % 60000) / 1000);

  if (!isCustomerDashboardOpen) return null;

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const confirmedCount = orders.filter((o) => o.status === 'ai_confirmed' || o.status === 'processing').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const recentlyViewedProducts = (customerProfile.browsingHistory || [])
    .map((id) => visibleStoreProducts.find((p) => p.id === id))
    .filter(Boolean);

  const wishlistedProducts = visibleStoreProducts.filter((p) => wishlist.includes(p.id));
  const savedCoupons = customerProfile.savedCoupons || [];

  const handleRedeemPoints = (points: number) => {
    const res = redeemLoyaltyPoints(points);
    if (res.success) {
      audioEngine.playSuccessChime();
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 }
      });
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile(profileForm);
    setIsEditingProfile(false);
  };

  const handleTrackOrder = (trackingCode: string) => {
    setIsCustomerDashboardOpen(false);
    setTrackingSearchQuery(trackingCode);
    setActiveView('tracking');
  };

  const handleLaunchSpinWheel = () => {
    setIsCustomerDashboardOpen(false);
    setIsSpinOpen(true);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast('success', t('কুপন কোড কপি হয়েছে!', 'Coupon Copied!'), code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Temu-Style Gradient Account Header */}
        <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-4 sm:p-6 text-white border-b border-slate-800 shrink-0">
          <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
            {isCustomerLoggedIn ? (
              <button
                onClick={logoutCustomer}
                className="px-2.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title={t('সাইন আউট', 'Sign Out')}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('লগআউট', 'Logout')}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsCustomerDashboardOpen(false);
                  setIsCustomerLoginOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('লগইন / রেজিস্টার', 'Sign In')}</span>
              </button>
            )}
            <button
              onClick={() => setIsCustomerDashboardOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-16 sm:pr-24">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-emerald-400">
                  <User className="w-7 h-7" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h2 className="text-lg sm:text-xl font-black text-white truncate">
                    {isCustomerLoggedIn ? customerProfile.name : t('কাস্টমার অ্যাপ ড্যাশবোর্ড', 'Customer App Dashboard')}
                  </h2>
                  {isCustomerLoggedIn && customerProfile.username && (
                    <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      @{customerProfile.username}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                  {isCustomerLoggedIn ? (
                    <>
                      <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{customerProfile.phone}</span>
                      <span>•</span>
                      <span className="truncate">{customerProfile.district}</span>
                    </>
                  ) : (
                    <span>{t('অর্ডার আপডেট, প্রোমো অফার ও প্রাইস ড্রপ অ্যালার্ট', 'Order Status, Promotional Alerts & Price Drops')}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Balance Cards: Lifetime Wallet + 48h Spin Bonus + Points */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 tabular-nums">
              <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-emerald-400/30 text-left">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                  {t('আজীবন ওয়ালেট', 'Lifetime Wallet')}
                </span>
                <span className="text-base sm:text-lg font-black text-white font-mono">
                  ৳{customerWalletBalance.toLocaleString()}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-sky-400/30 text-left">
                <span className="text-[10px] uppercase font-bold text-sky-300 block">
                  {t('৪৮ঘণ্টা স্পিন বোনাস', '48h Spin Bonus')}
                </span>
                <span className="text-base sm:text-lg font-black text-white font-mono">
                  ৳{activeSpinBonus.toLocaleString()}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-amber-400/30 text-left">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">
                  {t('আমার পয়েন্টস', 'My Points')}
                </span>
                <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
                  {customerProfile.loyaltyPoints}
                </span>
              </div>
            </div>
          </div>

          {/* Temu-Style Order Pipeline Bar */}
          <div className="mt-4 grid grid-cols-4 gap-1.5 sm:gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 text-center">
            <button
              onClick={() => setActiveTab('orders')}
              className="py-1.5 px-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="text-sm sm:text-base font-black text-amber-400 block font-mono">{pendingCount}</span>
              <span className="text-[10px] text-slate-300 font-semibold block">{t('পেন্ডিং', 'Unpaid/New')}</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className="py-1.5 px-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="text-sm sm:text-base font-black text-emerald-400 block font-mono">{confirmedCount}</span>
              <span className="text-[10px] text-slate-300 font-semibold block">{t('প্রসেসিং', 'Processing')}</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className="py-1.5 px-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="text-sm sm:text-base font-black text-sky-400 block font-mono">{shippedCount}</span>
              <span className="text-[10px] text-slate-300 font-semibold block">{t('শিপড', 'Shipped')}</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className="py-1.5 px-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="text-sm sm:text-base font-black text-teal-300 block font-mono">{deliveredCount}</span>
              <span className="text-[10px] text-slate-300 font-semibold block">{t('ডেলিভার্ড', 'Delivered')}</span>
            </button>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto scrollbar-none text-xs font-bold">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{t('নোটিফিকেশন', 'Notifications')}</span>
              {unreadNotificationsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black font-mono tabular-nums leading-none">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'wallet'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{t('ওয়ালেট ও কুপন', 'Spin Wallet & Coupons')}</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{t('আমার অর্ডার', 'My Orders')} ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>{t('রিসেন্ট ও উইশলিস্ট', 'Viewed & Saved')}</span>
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'alerts'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{t('প্রাইস অ্যালার্ট', 'Price Alerts')}</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t('ঠিকানা ও প্রোফাইল', 'Address & Info')}</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50 space-y-5">
          {/* TAB 0: In-App Notification Center */}
          {activeTab === 'notifications' && (() => {
            const orderCount = userNotifications.filter((n) => n.category === 'order_update').length;
            const promoCount = userNotifications.filter((n) => n.category === 'promo').length;
            const dropCount = userNotifications.filter((n) => n.category === 'price_drop').length;
            const filteredList = userNotifications.filter((n) => notifFilter === 'all' || n.category === notifFilter);

            const handleNotificationAction = (n: UserNotification) => {
              markNotificationRead(n.id);
              if (n.actionType === 'track_order') {
                handleTrackOrder(n.trackingCode || n.orderId || '');
              } else if (n.actionType === 'view_product' && n.productId) {
                const targetProd =
                  visibleStoreProducts.find((p) => p.id === n.productId) ||
                  products.find((p) => p.id === n.productId);
                if (targetProd) {
                  setIsCustomerDashboardOpen(false);
                  setSelectedProductForPage(targetProd);
                }
              } else if (n.actionType === 'copy_coupon' && n.couponCode) {
                copyCoupon(n.couponCode);
              } else if (n.actionType === 'open_wallet') {
                setActiveTab('wallet');
              }
            };

            return (
              <div className="space-y-4">
                {/* Filter Strip & Bulk Mark-Read Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                    {[
                      { key: 'all' as const, label: t('সব', 'All'), count: userNotifications.length },
                      { key: 'order_update' as const, label: t('অর্ডার আপডেট', 'Order Updates'), count: orderCount },
                      { key: 'promo' as const, label: t('প্রোমো অফার', 'Promotions'), count: promoCount },
                      { key: 'price_drop' as const, label: t('দাম কমেছে', 'Price Drops'), count: dropCount }
                    ].map((tabItem) => (
                      <button
                        key={tabItem.key}
                        type="button"
                        onClick={() => setNotifFilter(tabItem.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          notifFilter === tabItem.key
                            ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <span>{tabItem.label}</span>
                        <span className="font-mono text-[10px] opacity-80 tabular-nums">({tabItem.count})</span>
                      </button>
                    ))}
                  </div>

                  {unreadNotificationsCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{t('সব পঠিত করুন', 'Mark all read')}</span>
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                {filteredList.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Bell className="w-10 h-10 text-slate-400 mx-auto mb-2.5" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {t('এই বিভাগে কোনো নতুন নোটিফিকেশন নেই', 'No notifications in this category')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {t('নতুন অর্ডার আপডেট, প্রোমো কোড বা দাম কমার তথ্য এখানে দেখাবে।', 'Order updates, promo offers, and price drops will appear here.')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredList.map((n) => {
                      const catConfig =
                        n.category === 'order_update'
                          ? {
                              label: t('অর্ডার আপডেট', 'Order Update'),
                              icon: <Truck className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
                              iconBg: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800',
                              tagCls: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800'
                            }
                          : n.category === 'price_drop'
                          ? {
                              label: t('মূল্য ছাড়', 'Price Drop'),
                              icon: <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
                              iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
                              tagCls: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
                            }
                          : {
                              label: t('প্রোমো সতর্কতা', 'Promotion'),
                              icon: <Tag className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
                              iconBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
                              tagCls: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
                            };

                      const actionLabel =
                        n.actionType === 'track_order'
                          ? t('অর্ডার ট্র্যাক করুন', 'Track Order')
                          : n.actionType === 'view_product'
                          ? t('পণ্য দেখুন', 'View Deal')
                          : n.actionType === 'copy_coupon' && n.couponCode
                          ? copiedCode === n.couponCode
                            ? t('কপি হয়েছে ✓', 'Copied ✓')
                            : t(`কোড কপি (${n.couponCode})`, `Copy ${n.couponCode}`)
                          : n.actionType === 'open_wallet'
                          ? t('ওয়ালেট দেখুন', 'Open Wallet')
                          : null;

                      const formattedTime = (() => {
                        try {
                          return new Date(n.createdAt).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        } catch {
                          return '';
                        }
                      })();

                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.isRead) markNotificationRead(n.id);
                          }}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                            !n.isRead
                              ? 'bg-white dark:bg-slate-900 border-emerald-400/70 dark:border-emerald-500/40 shadow-xs'
                              : 'bg-white/75 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-90'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${catConfig.iconBg}`}>
                            {catConfig.icon}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catConfig.tagCls}`}>
                                  {catConfig.label}
                                </span>
                                {n.badgeText && (
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    {n.badgeText}
                                  </span>
                                )}
                                {!n.isRead && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                    {t('নতুন', 'New')}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] text-slate-400 font-mono tabular-nums whitespace-nowrap">
                                  {formattedTime}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    dismissNotification(n.id);
                                  }}
                                  aria-label={t('সরান', 'Dismiss')}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                              {lang === 'bn' ? n.titleBn || n.title : n.title}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {lang === 'bn' ? n.messageBn || n.message : n.message}
                            </p>

                            {n.category === 'price_drop' && typeof n.newPrice === 'number' && (
                              <div className="flex items-center gap-2 font-mono tabular-nums text-xs pt-0.5">
                                {typeof n.oldPrice === 'number' && n.oldPrice > n.newPrice && (
                                  <span className="line-through text-slate-400">৳{n.oldPrice.toLocaleString()}</span>
                                )}
                                <span className="font-black text-emerald-600 dark:text-emerald-400">
                                  ৳{n.newPrice.toLocaleString()}
                                </span>
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {actionLabel && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(n);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:opacity-90 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                                >
                                  {n.actionType === 'copy_coupon' ? (
                                    <Copy className="w-3 h-3" />
                                  ) : (
                                    <ExternalLink className="w-3 h-3" />
                                  )}
                                  <span>{actionLabel}</span>
                                </button>
                              )}
                              {!n.isRead && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markNotificationRead(n.id);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold cursor-pointer whitespace-nowrap"
                                >
                                  {t('পঠিত চিহ্নিত করুন', 'Mark read')}
                                </button>
                              )}
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

          {/* TAB 1: Spin-Only Gift Wallet, Saved Coupons & Loyalty Points */}
          {activeTab === 'wallet' && (
            <div className="space-y-5">
              {unreadNotificationsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('notifications')}
                  className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-400/50 hover:border-emerald-500 flex items-center justify-between gap-2 text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                      <Bell className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {t(
                          `${unreadNotificationsCount}টি নতুন অর্ডার, প্রোমো ও প্রাইস ড্রপ আপডেট রয়েছে`,
                          `${unreadNotificationsCount} unread order, promo & price drop alerts`
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {t('নোটিফিকেশন সেন্টারে ক্লিক করে দেখুন', 'Tap to open Notification Center')}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shrink-0 whitespace-nowrap">
                    {t('দেখুন →', 'View →')}
                  </span>
                </button>
              )}
              {/* Lifetime Deposited Wallet + 48-Hour Expiring Spin Bonus */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-5 text-white shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full text-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      {t('আজীবন মেয়াদী ডিপোজিট ওয়ালেট', 'Lifetime Deposited Balance (Never Expires)')}
                    </span>
                    <div className="flex flex-wrap items-baseline gap-4 tabular-nums">
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-black font-mono">
                          ৳{customerWalletBalance.toLocaleString()}
                        </h3>
                        <p className="text-[11px] text-emerald-100">
                          {t('অ্যাড করা ব্যালেন্স — আজীবন মেয়াদী', 'Deposited Cash · Lifetime Validity')}
                        </p>
                      </div>
                      <div className="px-3 py-1.5 rounded-2xl bg-slate-950/35 border border-white/15">
                        <span className="text-[10px] text-amber-300 font-bold uppercase block">
                          {t('৪৮-ঘণ্টা স্পিন বোনাস', '48h Spin Bonus')}
                        </span>
                        <span className="text-lg font-black font-mono text-white">
                          ৳{activeSpinBonus.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-emerald-100 leading-relaxed max-w-md">
                      {t(
                        'বিকাশ/নগদে অ্যাড করা টাকা সারাজীবন অক্ষুণ্ণ থাকবে। শুধুমাত্র স্পিন বোনাস ব্যালেন্স ৪৮ ঘণ্টা পর স্বয়ংক্রিয়ভাবে কেটে নেওয়া হয়।',
                        'Balance added via bKash/Nagad stays valid for a lifetime. Spin wheel bonus funds remain active for 48 hours before automatic deduction.'
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                    {settings.walletSettings?.enabled !== false && (
                      <button
                        type="button"
                        onClick={() => setIsAddBalanceOpen((prev) => !prev)}
                        className="px-4 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 font-black text-xs shadow-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-600" />
                        <span>{t('+ ব্যালেন্স অ্যাড (আজীবন)', '+ Add Lifetime Balance')}</span>
                      </button>
                    )}
                    <button
                      onClick={handleLaunchSpinWheel}
                      className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <Gift className="w-4 h-4" />
                      <span>{t('স্পিন করে বোনাস জিতুন', 'Spin & Win 48h Bonus')}</span>
                    </button>
                  </div>
                </div>

                {/* Live 48h Spin Bonus Countdown + Policy Note */}
                <div className="p-3 rounded-2xl bg-slate-950/35 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] tabular-nums">
                  <div className="flex items-start sm:items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-300 shrink-0 mt-0.5 sm:mt-0" />
                    <span className="text-emerald-50 font-semibold">
                      {activeSpinBonus > 0 && spinBonusExpiresAt
                        ? t(
                            `স্পিন বোনাস ৳${activeSpinBonus.toLocaleString()} মেয়াদ শেষ হতে বাকি: ${String(spinHoursLeft).padStart(2, '0')}ঘ ${String(spinMinsLeft).padStart(2, '0')}মি ${String(spinSecsLeft).padStart(2, '0')}সে (এরপর অটো বাদ হবে · ডিপোজিট ব্যালেন্স আজীবন থাকবে)।`,
                            `Spin Bonus ৳${activeSpinBonus.toLocaleString()} auto-expires in ${String(spinHoursLeft).padStart(2, '0')}h ${String(spinMinsLeft).padStart(2, '0')}m ${String(spinSecsLeft).padStart(2, '0')}s (Deposited balance stays forever).`
                          )
                        : t(
                            'আপনার অ্যাড করা ওয়ালেট ব্যালেন্স আজীবন মেয়াদী। স্পিন করে ৪৮ ঘণ্টার অতিরিক্ত বোনাস জিততে পারেন।',
                            'Your deposited wallet balance is lifetime valid and never expires. Spin rewards stay active for 48 hours.'
                          )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomerDashboardOpen(false);
                      goHome();
                    }}
                    className="px-3 py-1 rounded-xl bg-amber-400/90 hover:bg-amber-300 text-slate-950 font-black text-[10px] shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    {t('পণ্য কিনুন →', 'Shop Now →')}
                  </button>
                </div>
              </div>

              {/* Add Balance Form (bKash, Nagad, Rocket, Upay - Controlled from Backend Admin) */}
              {isAddBalanceOpen && settings.walletSettings?.enabled !== false && (() => {
                const wCfg = settings.walletSettings;
                const methodsMap = wCfg?.methods || {
                  bkash: { enabled: true, label: 'bKash', accountNumber: '01917942662', accountType: 'Personal' },
                  nagad: { enabled: true, label: 'Nagad', accountNumber: '01917942662', accountType: 'Personal' },
                  rocket: { enabled: true, label: 'Rocket', accountNumber: '01917942662', accountType: 'Personal' },
                  upay: { enabled: true, label: 'Upay', accountNumber: '01917942662', accountType: 'Personal' }
                };
                const enabledMethods = (Object.keys(methodsMap) as WalletTopUpMethod[]).filter(
                  (m) => methodsMap[m]?.enabled !== false
                );
                const activeMethodKey: WalletTopUpMethod = enabledMethods.includes(topUpMethod)
                  ? topUpMethod
                  : enabledMethods[0] || 'bkash';
                const activeAccount = methodsMap[activeMethodKey];

                const handleTopUpSubmit = (e: React.FormEvent) => {
                  e.preventDefault();
                  const amt = Number(topUpAmount);
                  if (!amt || amt <= 0 || !topUpSender.trim() || !topUpTrxId.trim()) {
                    addToast(
                      'warning',
                      t('সঠিক তথ্য দিন', 'Missing Information'),
                      t('টাকার পরিমাণ, প্রেরক নম্বর ও TrxID দিন।', 'Please provide amount, sender phone and TrxID.')
                    );
                    return;
                  }
                  const res = requestWalletTopUp({
                    method: activeMethodKey,
                    amount: amt,
                    senderNumber: topUpSender,
                    trxId: topUpTrxId
                  });
                  if (res.success) {
                    setTopUpTrxId('');
                    if (res.status === 'approved') {
                      audioEngine.playSuccessChime();
                    }
                  }
                };

                return (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-emerald-500/40 shadow-md space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <PlusCircle className="w-4 h-4 text-emerald-600" />
                          <span>{t('বিকাশ / নগদ / রকেট দিয়ে ব্যালেন্স অ্যাড করুন', 'Add Wallet Balance via MFS')}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {t(
                            `সর্বনিম্ন ৳${wCfg?.minTopUp ?? 50} - সর্বোচ্চ ৳${(wCfg?.maxTopUp ?? 50000).toLocaleString()} | ব্যাকএন্ড অনুমোদনের সাথে সাথে ব্যালেন্স যুক্ত হবে`,
                            `Min ৳${wCfg?.minTopUp ?? 50} - Max ৳${(wCfg?.maxTopUp ?? 50000).toLocaleString()} | Controlled & verified by Admin Desk`
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddBalanceOpen(false)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {enabledMethods.length === 0 ? (
                      <p className="text-xs text-rose-500 font-bold">
                        {t('বর্তমানে কোনো পেমেন্ট মাধ্যম সক্রিয় নেই।', 'No MFS top-up methods enabled currently.')}
                      </p>
                    ) : (
                      <form onSubmit={handleTopUpSubmit} className="space-y-3.5">
                        {/* Method Selector */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {enabledMethods.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setTopUpMethod(m)}
                              className={`py-2.5 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                                activeMethodKey === m
                                  ? m === 'bkash'
                                    ? 'bg-pink-600 text-white border-pink-500 shadow'
                                    : m === 'nagad'
                                    ? 'bg-orange-600 text-white border-orange-500 shadow'
                                    : m === 'rocket'
                                    ? 'bg-purple-600 text-white border-purple-500 shadow'
                                    : 'bg-sky-600 text-white border-sky-500 shadow'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {methodsMap[m].label}
                            </button>
                          ))}
                        </div>

                        {/* Payment Number Display */}
                        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="text-slate-500 block text-[11px]">
                              {t(
                                `নিচের ${activeAccount.label} (${activeAccount.accountType}) নম্বরে Send Money / Payment করুন:`,
                                `Send Money / Payment to ${activeAccount.label} (${activeAccount.accountType}):`
                              )}
                            </span>
                            <span className="font-mono font-black text-base text-emerald-700 dark:text-emerald-400">
                              {activeAccount.accountNumber}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyCoupon(activeAccount.accountNumber)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{t('নম্বর কপি', 'Copy Number')}</span>
                          </button>
                        </div>

                        {/* Quick Amount Chips + Inputs */}
                        <div className="flex flex-wrap gap-1.5">
                          {[200, 500, 1000, 2000, 5000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setTopUpAmount(amt.toString())}
                              className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                                topUpAmount === amt.toString()
                                  ? 'bg-emerald-600 text-white border-emerald-500'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              ৳{amt}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                              {t('পরিমাণ (৳)', 'Amount (৳)')}
                            </label>
                            <input
                              type="number"
                              required
                              min={wCfg?.minTopUp ?? 50}
                              max={wCfg?.maxTopUp ?? 50000}
                              value={topUpAmount}
                              onChange={(e) => setTopUpAmount(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                              {t('যে নম্বর থেকে পাঠিয়েছেন', 'Sender Mobile Number')}
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="01XXXXXXXXX"
                              value={topUpSender}
                              onChange={(e) => setTopUpSender(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                              {t('ট্রানজেকশন আইডি (TrxID)', 'Transaction ID (TrxID)')}
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. BKS889012"
                              value={topUpTrxId}
                              onChange={(e) => setTopUpTrxId(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold uppercase text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{t('ব্যালেন্স অ্যাড রিকোয়েস্ট পাঠান', 'Submit Add Balance Request')}</span>
                        </button>
                      </form>
                    )}

                    {/* Recent Customer Top-Up Requests */}
                    {walletTopUps.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 block">
                          {t('সাম্প্রতিক ব্যালেন্স রিকোয়েস্ট:', 'Recent Add Balance History:')}
                        </span>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto">
                          {walletTopUps.slice(0, 5).map((req) => (
                            <div
                              key={req.id}
                              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold uppercase text-slate-900 dark:text-white">{req.method}</span>
                                <span className="mx-1.5 text-slate-400">•</span>
                                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">৳{req.amount.toLocaleString()}</span>
                                <span className="ml-2 text-[10px] font-mono text-slate-400">TrxID: {req.trxId}</span>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  req.status === 'approved'
                                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                                    : req.status === 'rejected'
                                    ? 'bg-rose-500/20 text-rose-500'
                                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                                }`}
                              >
                                {req.status === 'approved'
                                  ? t('অনুমোদিত', 'Approved')
                                  : req.status === 'rejected'
                                  ? t('বাতিল', 'Rejected')
                                  : t('অপেক্ষমাণ', 'Pending')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Saved Spin Coupons */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-emerald-600" />
                    <span>{t('আমার স্পিন কুপন ভাউচারসমূহ', 'My Spin Coupons & Vouchers')}</span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    {savedCoupons.length} {t('টি কুপন', 'Coupons')}
                  </span>
                </div>

                {savedCoupons.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                    <Ticket className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {t('এখনো কোনো স্পিন কুপন নেই', 'No saved coupons yet')}
                    </p>
                    <button
                      onClick={handleLaunchSpinWheel}
                      className="text-xs font-black text-emerald-600 hover:underline cursor-pointer"
                    >
                      {t('এখনই লাকি স্পিন ঘুরান →', 'Spin the wheel to unlock vouchers →')}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedCoupons.map((cpn) => (
                      <div
                        key={cpn.id}
                        className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 block truncate">
                            {lang === 'bn' ? cpn.labelBn : cpn.labelEn}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 block mt-0.5">
                            {cpn.code}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {t('মেয়াদ:', 'Expires:')} {cpn.expiresAt}
                          </span>
                        </div>
                        <button
                          onClick={() => copyCoupon(cpn.code)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          {copiedCode === cpn.code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCode === cpn.code ? t('কপিড', 'Copied') : t('কপি', 'Copy')}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Loyalty Points Rewards & Ledger */}
              {(() => {
                const lCfg = settings.loyaltySettings;
                const ptsPer100 = lCfg?.pointsPer100Bdt ?? 5;
                const bdtPerPt = lCfg?.bdtPerPoint ?? 1;
                const minReqPts = lCfg?.minRedeemPoints ?? 10;
                const pts = customerProfile.loyaltyPoints || 0;
                const tier =
                  pts >= 500
                    ? { label: t('প্লাটিনাম এলিট', 'Platinum Elite'), nextTarget: 1000, badgeClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-300' }
                    : pts >= 200
                    ? { label: t('গোল্ড মেম্বার', 'Gold VIP'), nextTarget: 500, badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-300' }
                    : { label: t('সিলভার মেম্বার', 'Silver Member'), nextTarget: 200, badgeClass: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' };
                const tierPct = Math.min(100, Math.round((pts / tier.nextTarget) * 100));
                const historyList = customerProfile.loyaltyHistory || [];

                return (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Award className="w-5 h-5 text-amber-500 shrink-0" />
                          <h3 className="font-black text-sm text-slate-900 dark:text-white">
                            {t('লয়্যালটি পয়েন্টস ও রিওয়ার্ডস', 'Loyalty Points & Rewards')}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${tier.badgeClass}`}>
                            {tier.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 tabular-nums">
                          {t(
                            `বর্তমান পয়েন্ট: ${pts} pts (৳${Math.round(pts * bdtPerPt)} সমমূল্য) • প্রতি ৳১০০ শপিংয়ে +${ptsPer100} পয়েন্ট`,
                            `Balance: ${pts} pts (Worth ৳${Math.round(pts * bdtPerPt)}) • Earn +${ptsPer100} pts per ৳100 spent`
                          )}
                        </p>
                        <div className="w-full max-w-xs h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 transition-all" style={{ width: `${tierPct}%` }} />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRedeemPoints(minReqPts)}
                          disabled={pts < minReqPts}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{t(`${minReqPts} পয়েন্ট → ৳${Math.round(minReqPts * bdtPerPt)}`, `${minReqPts} Pts → ৳${Math.round(minReqPts * bdtPerPt)}`)}</span>
                        </button>
                        {pts >= 50 && (
                          <button
                            type="button"
                            onClick={() => handleRedeemPoints(50)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>{t(`৫০ পয়েন্ট → ৳${Math.round(50 * bdtPerPt)}`, `50 Pts → ৳${Math.round(50 * bdtPerPt)}`)}</span>
                          </button>
                        )}
                        {pts >= Math.max(minReqPts, 100) && (
                          <button
                            type="button"
                            onClick={() => handleRedeemPoints(pts)}
                            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-amber-300 border border-amber-500/30 font-black text-xs cursor-pointer"
                          >
                            {t(`সবগুলো (${pts}) রিডিম`, `Convert All (${pts})`)}
                          </button>
                        )}
                      </div>
                    </div>

                    {historyList.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                          {t('লয়্যালটি পয়েন্ট হিস্ট্রি', 'Points Activity History')}
                        </span>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {historyList.slice(0, 8).map((entry) => (
                            <div
                              key={entry.id}
                              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{entry.note}</p>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(entry.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                                </span>
                              </div>
                              <span
                                className={`font-mono font-black tabular-nums shrink-0 ${
                                  entry.points >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                                }`}
                              >
                                {entry.points >= 0 ? `+${entry.points}` : entry.points} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Customer Referral Link & Invite Reward Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('বন্ধুদের রেফার করুন ও বোনাস পান', 'Invite Friends & Earn Rewards')}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {t(
                      `প্রতিটি সফল রেফারেলে আপনার বন্ধু ৳${settings.organicMarketing?.referralProgram?.refereeDiscountBdt || 100} ছাড় ও আপনি ৳${settings.organicMarketing?.referralProgram?.referrerRewardBdt || 50} বোনাস পাবেন।`,
                      `Friends get ৳${settings.organicMarketing?.referralProgram?.refereeDiscountBdt || 100} OFF and you earn ৳${settings.organicMarketing?.referralProgram?.referrerRewardBdt || 50} wallet credit.`
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const refCode = (customerProfile.username || 'BUYONE').toUpperCase();
                    const url = `${window.location.origin}/?ref=${encodeURIComponent(refCode)}`;
                    navigator.clipboard?.writeText(url).catch(() => {});
                    addToast('success', t('রেফারেল লিংক কপি হয়েছে!', 'Referral Link Copied!'), url);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('রেফারেল লিংক কপি', 'Copy Referral Link')}</span>
                </button>
              </div>

              {/* Buyer Protection Guarantee Badge Strip (Temu Style) */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-[11px] font-bold">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                  {t('১০০% অরিজিনাল গ্যারান্টি', 'Purchase Protection')}
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <Truck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                  {t('সময়মতো ডেলিভারি', 'On-Time Dispatch')}
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                  {t('৭ দিনের সহজ রিটার্ন', '7-Day Free Return')}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  {t('আপনার অর্ডারসমূহ', 'Your Orders')}
                </h3>
                <span className="text-xs text-slate-500">
                  {t(`মোট ${orders.length} টি অর্ডার`, `Total ${orders.length} Orders`)}
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {t('এখনও কোনো অর্ডার করেননি', 'No orders placed yet')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-400 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400">
                            #{ord.id}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(ord.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 uppercase">
                            {ord.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 line-clamp-2">
                          {ord.items.map((i) => `${lang === 'bn' ? (i.productTitleBn || i.productTitle) : (i.productTitle || i.productTitleBn)} ×${i.quantity}`).join(', ')}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-mono font-black text-slate-900 dark:text-white mt-1">
                          <span>৳{ord.pricing.total.toLocaleString()}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {ord.payment.method.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const matchedFirst = products.find((p) => p.id === ord.items?.[0]?.productId);
                            ord.items?.forEach((it) => {
                              const found = products.find((p) => p.id === it.productId);
                              if (found) addToCart(found, it.quantity, it.selectedColor, it.selectedSize, it.selectedAttributes);
                            });
                            setIsCustomerDashboardOpen(false);
                            openOneClickCheckout(ord.items?.length === 1 && matchedFirst ? matchedFirst : null);
                          }}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{t('আবার অর্ডার', 'Re-Order')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTrackOrder(ord.courier.trackingCode || ord.id)}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          <Truck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{t('লাইভ ট্র্যাকিং', 'Live Track')}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Recently Viewed & Wishlist (Temu Browsing History) */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              {/* Recently Viewed */}
              <div className="space-y-2.5">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>{t('সম্প্রতি দেখা পণ্য', 'Recently Viewed')}</span>
                </h3>
                {recentlyViewedProducts.length === 0 ? (
                  <p className="text-xs text-slate-500 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {t('আপনি এখনো কোনো পণ্য ভিজিট করেননি।', 'Browse products to build your recent history.')}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {recentlyViewedProducts.map((p: any) => (
                      <div
                        key={`hist-${p.id}`}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2"
                      >
                        <div
                          onClick={() => {
                            setSelectedProductForPage(p);
                            setIsCustomerDashboardOpen(false);
                          }}
                          className="cursor-pointer space-y-1.5"
                        >
                          {p.images?.[0]?.trim() ? (
                            <img src={p.images[0]} alt={p.title} className="w-full h-24 object-cover rounded-xl" />
                          ) : (
                            <div className="w-full h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />
                          )}
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                            {lang === 'bn' ? p.titleBn : p.title}
                          </p>
                          <p className="text-xs font-black text-emerald-600 font-mono">৳{p.price.toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => {
                            openOneClickCheckout(p);
                            setIsCustomerDashboardOpen(false);
                          }}
                          className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer"
                        >
                          {t('এখনই কিনুন', 'Buy Now')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <div className="space-y-2.5">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>{t('পছন্দের তালিকা', 'Saved Wishlist')} ({wishlistedProducts.length})</span>
                </h3>
                {wishlistedProducts.length === 0 ? (
                  <p className="text-xs text-slate-500 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {t('পছন্দ তালিকায় এখনো কোনো পণ্য নেই।', 'Tap the heart icon on products to save them here.')}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {wishlistedProducts.map((p) => (
                      <div
                        key={`wish-${p.id}`}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2"
                      >
                        <div
                          onClick={() => {
                            setSelectedProductForPage(p);
                            setIsCustomerDashboardOpen(false);
                          }}
                          className="cursor-pointer space-y-1.5"
                        >
                          {p.images?.[0]?.trim() ? (
                            <img src={p.images[0]} alt={p.title} className="w-full h-24 object-cover rounded-xl" />
                          ) : (
                            <div className="w-full h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />
                          )}
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                            {lang === 'bn' ? p.titleBn : p.title}
                          </p>
                          <p className="text-xs font-black text-emerald-600 font-mono">৳{p.price.toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => {
                            openOneClickCheckout(p);
                            setIsCustomerDashboardOpen(false);
                          }}
                          className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold cursor-pointer"
                        >
                          {t('কিনুন', 'Buy Now')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Price Alerts */}
          {activeTab === 'alerts' && (
            <div className="space-y-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                {t('আপনার সক্রিয় মূল্য হ্রাস অ্যালার্ট', 'Your Active Price Drop Alerts')}
              </h3>

              {priceAlerts.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <TrendingDown className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {t('কোনো মূল্য কমার অ্যালার্ট সেট করা নেই', 'No price drop alerts set')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {priceAlerts.map((alt) => (
                    <div
                      key={alt.id}
                      className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {lang === 'bn' ? alt.productTitleBn : alt.productTitle}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {t('বর্তমান:', 'Current:')} ৳{alt.currentPrice} •{' '}
                          <span className="font-bold text-emerald-600">
                            {t('টার্গেট:', 'Target:')} ৳{alt.targetPrice}
                          </span>
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                        {t('সক্রিয়', 'Active')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Out-of-Stock Waitlist Requests */}
              {waitlistEntries.length > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-black text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <BellRing className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('স্টক নোটিফিকেশন ওয়েটলিস্ট', 'Stock Availability Waitlist')}</span>
                  </h4>
                  {waitlistEntries.slice(0, 8).map((w) => (
                    <div
                      key={w.id}
                      className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {lang === 'bn' ? w.productTitleBn || w.productTitle : w.productTitle}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{w.contact}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          w.status === 'notified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {w.status === 'notified' ? t('জানানো হয়েছে', 'Notified') : t('অপেক্ষমাণ', 'Waiting')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Address & Profile Editor */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  {t('ডেলিভারি ঠিকানা ও প্রোফাইল তথ্য', 'Delivery Address & Customer Info')}
                </h3>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingProfile ? t('বাতিল', 'Cancel') : t('এডিট করুন', 'Edit Info')}</span>
                </button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {t('আপনার নাম', 'Your Name')}
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {t('ইউজারনেম', 'Username')}
                      </label>
                      <input
                        type="text"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {t('মোবাইল নম্বর', 'Phone Number')}
                      </label>
                      <input
                        type="tel"
                        required
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {t('ইমেইল ঠিকানা', 'Email Address')}
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {t('জেলা', 'District')}
                      </label>
                      <select
                        value={profileForm.district}
                        onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      >
                        {BD_DISTRICTS.map((d) => (
                          <option key={d.name} value={d.name}>
                            {lang === 'bn' ? d.nameBn : d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {t('বিস্তারিত ঠিকানা', 'Full Street Address')}
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{t('তথ্য সংরক্ষণ করুন', 'Save Information')}</span>
                  </button>
                </form>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <User className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-bold">{customerProfile.name}</span>
                    {customerProfile.username && <span className="text-slate-400">(@{customerProfile.username})</span>}
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-bold">{customerProfile.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{customerProfile.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      {customerProfile.address || t('ঠিকানা যোগ করা হয়নি', 'No address saved')}, {customerProfile.district}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
