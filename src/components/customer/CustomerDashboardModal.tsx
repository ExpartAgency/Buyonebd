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
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BD_DISTRICTS } from '../../data/initialData';
import { audioEngine } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

export const CustomerDashboardModal: React.FC = () => {
  const {
    isCustomerDashboardOpen,
    setIsCustomerDashboardOpen,
    customerProfile,
    updateCustomerProfile,
    customerWalletBalance,
    redeemLoyaltyPoints,
    logoutCustomer,
    setIsSpinOpen,
    orders,
    products,
    wishlist,
    priceAlerts,
    setActiveView,
    setTrackingSearchQuery,
    setSelectedProductForPage,
    openOneClickCheckout,
    addToast,
    lang,
    t
  } = useStore();

  const [activeTab, setActiveTab] = useState<'wallet' | 'orders' | 'history' | 'alerts' | 'profile'>('wallet');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
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

  if (!isCustomerDashboardOpen) return null;

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const confirmedCount = orders.filter((o) => o.status === 'ai_confirmed' || o.status === 'processing').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const recentlyViewedProducts = (customerProfile.browsingHistory || [])
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));
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
            <button
              onClick={logoutCustomer}
              className="px-2.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title={t('সাইন আউট', 'Sign Out')}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('লগআউট', 'Logout')}</span>
            </button>
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
                  <h2 className="text-lg sm:text-xl font-black text-white truncate">{customerProfile.name}</h2>
                  {customerProfile.username && (
                    <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      @{customerProfile.username}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                  <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{customerProfile.phone}</span>
                  <span>•</span>
                  <span className="truncate">{customerProfile.district}</span>
                </p>
              </div>
            </div>

            {/* Balance Pills */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-emerald-400/30 text-left">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                  {t('স্পিন গিফট ওয়ালেট', 'Spin Gift Wallet')}
                </span>
                <span className="text-base sm:text-lg font-black text-white font-mono">
                  ৳{customerWalletBalance.toLocaleString()}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-amber-400/30 text-left">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">
                  {t('পয়েন্টস', 'Points')}
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
              onClick={() => setActiveTab('wallet')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
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
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
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
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
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
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
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
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
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
          {/* TAB 1: Spin-Only Gift Wallet, Saved Coupons & Loyalty Points */}
          {activeTab === 'wallet' && (
            <div className="space-y-5">
              {/* Spin-Only Cash Wallet Banner */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full text-amber-300">
                    <Sparkles className="w-3 h-3" />
                    {t('স্পিন এক্সক্লুসিভ গিফট ব্যালেন্স', 'Lucky Spin Cash Rewards')}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black font-mono">
                    ৳{customerWalletBalance.toLocaleString()}
                  </h3>
                  <p className="text-xs text-emerald-100 leading-relaxed max-w-md">
                    {t(
                      'শুধুমাত্র লাকি স্পিন হুইল ঘুরিয়ে ও পয়েন্ট রিডিম করে ফ্রি ক্যাশ ব্যালেন্স জিতুন এবং যেকোনো অর্ডারে ডিসকাউন্ট হিসেবে ব্যবহার করুন।',
                      'Earn free cash rewards exclusively from the Lucky Spin Wheel & Points redemption. Apply directly at checkout!'
                    )}
                  </p>
                </div>

                <button
                  onClick={handleLaunchSpinWheel}
                  className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <Gift className="w-4 h-4" />
                  <span>{t('🎡 স্পিন ঘুরিয়ে ক্যাশ জিতুন', 'Spin & Win Cash')}</span>
                </button>
              </div>

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

              {/* Loyalty Points Redemption */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      {t('লয়্যালটি পয়েন্টস রিডিমেশন', 'Loyalty Points Redemption')}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    {t(
                      `আপনার আছে ${customerProfile.loyaltyPoints} পয়েন্ট। ৫০ পয়েন্ট রিডিম করে ৳৫০ গিফট ওয়ালেটে যোগ করুন।`,
                      `You have ${customerProfile.loyaltyPoints} points. Redeem 50 points for ৳50 wallet credit.`
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleRedeemPoints(50)}
                    disabled={customerProfile.loyaltyPoints < 50}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{t('৫০ পয়েন্ট = ৳৫০', '50 Pts → ৳50')}</span>
                  </button>
                  {customerProfile.loyaltyPoints >= 100 && (
                    <button
                      onClick={() => handleRedeemPoints(100)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{t('১০০ পয়েন্ট = ৳১০০', '100 Pts → ৳100')}</span>
                    </button>
                  )}
                </div>
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

                      <button
                        onClick={() => handleTrackOrder(ord.courier.trackingCode || ord.id)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <Truck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t('লাইভ ট্র্যাকিং', 'Live Track')}</span>
                      </button>
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
                  <span>{t('সম্প্রতি দেখা পণ্য (Browsing History)', 'Recently Viewed')}</span>
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
                          <img src={p.images[0]} alt={p.title} className="w-full h-24 object-cover rounded-xl" />
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
                          {t('অর্ডার করুন', 'Order Now')}
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
                  <span>{t('পছন্দের তালিকা (Wishlist)', 'Saved Wishlist')} ({wishlistedProducts.length})</span>
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
                          <img src={p.images[0]} alt={p.title} className="w-full h-24 object-cover rounded-xl" />
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
