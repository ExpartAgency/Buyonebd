import React, { useState } from 'react';
import {
  X,
  User,
  Wallet,
  Sparkles,
  Gift,
  CalendarCheck,
  Award,
  Package,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  TrendingDown,
  CheckCircle2,
  Clock,
  ArrowRight,
  Truck,
  Edit2,
  Save,
  Check
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
    claimDailyCheckIn,
    redeemLoyaltyPoints,
    orders,
    priceAlerts,
    setActiveView,
    setTrackingSearchQuery,
    lang,
    t
  } = useStore();

  const [activeTab, setActiveTab] = useState<'rewards' | 'orders' | 'alerts' | 'profile'>('rewards');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: customerProfile.name,
    phone: customerProfile.phone,
    email: customerProfile.email,
    address: customerProfile.address,
    district: customerProfile.district
  });

  if (!isCustomerDashboardOpen) return null;

  // Streak rewards configuration
  const streakRewards = [
    { day: 1, amount: 10, label: '৳১০' },
    { day: 2, amount: 15, label: '৳১৫' },
    { day: 3, amount: 20, label: '৳২০' },
    { day: 4, amount: 25, label: '৳২৫' },
    { day: 5, amount: 30, label: '৳৩০' },
    { day: 6, amount: 40, label: '৳৪০' },
    { day: 7, amount: 70, label: '৳৭০ মেগা' }
  ];

  const currentStreak = customerProfile.checkIn?.streak || 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const isClaimedToday = customerProfile.checkIn?.lastCheckInDate === todayStr;

  const handleClaimBonus = () => {
    const res = claimDailyCheckIn();
    if (res.success) {
      audioEngine.playSuccessChime();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-5 sm:p-6 text-white border-b border-slate-800">
          <button
            onClick={() => setIsCustomerDashboardOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-emerald-400">
                  <User className="w-7 h-7" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">{customerProfile.name}</h2>
                  <span className="bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" />
                    {t('গোল্ড মেম্বার', 'Gold Member')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>{customerProfile.phone}</span>
                  <span>•</span>
                  <span>{customerProfile.district}</span>
                </p>
              </div>
            </div>

            {/* Quick Balances in Header */}
            <div className="flex items-center gap-2">
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {t('গিফট ওয়ালেট', 'Wallet')}
                </span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  ৳{customerWalletBalance}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {t('লয়্যালটি পয়েন্ট', 'Points')}
                </span>
                <span className="text-lg font-black text-amber-400 font-mono">
                  {customerProfile.loyaltyPoints}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1.5 mt-5 border-t border-slate-800/80 pt-3 overflow-x-auto scrollbar-none text-xs font-bold">
            <button
              onClick={() => setActiveTab('rewards')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'rewards'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>{t('ডেইলি বোনাস ও রিওয়ার্ডস', 'Check-in & Rewards')}</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{t('অর্ডার হিস্টোরি ও ট্র্যাকিং', 'Order History')}</span>
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'alerts'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{t('মূল্য কমার অ্যালার্ট', 'Price Alerts')}</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'profile'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t('ঠিকানা ও তথ্য', 'Profile Info')}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50 space-y-6">
          {/* TAB 1: Rewards & Daily Check-in */}
          {activeTab === 'rewards' && (
            <div className="space-y-6">
              {/* 7-Day Streak Check-in Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {t('৭ দিনের চেক-ইন স্ট্রিক বোনাস', '7-Day Check-in Streak')}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                      {t(`বর্তমান স্ট্রিক: ${currentStreak} দিন 🔥`, `Current Streak: ${currentStreak} Days 🔥`)}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('প্রতিদিন একবার চেক-ইন করে ফ্রি ক্যাশ ব্যালেন্স নিন। ৭ম দিনে পাবেন মেগা বোনাস!', 'Check in daily to claim free balance. Unlock ৳70 mega bonus on day 7!')}
                    </p>
                  </div>

                  <button
                    onClick={handleClaimBonus}
                    disabled={isClaimedToday}
                    className={`px-5 py-3 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                      isClaimedToday
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                    }`}
                  >
                    {isClaimedToday ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>{t('আজকের বোনাস গৃহীত ✔', 'Claimed Today ✔')}</span>
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 text-amber-300" />
                        <span>
                          {t(
                            `দিন ${((currentStreak % 7) || 0) + 1} বোনাস গ্রহণ করুন`,
                            `Claim Day ${((currentStreak % 7) || 0) + 1} Bonus`
                          )}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* 7-Day Visual Row */}
                <div className="grid grid-cols-7 gap-2 pt-2">
                  {streakRewards.map((item) => {
                    const isPassed = currentStreak >= item.day;
                    const isToday = isClaimedToday ? currentStreak === item.day : currentStreak + 1 === item.day;
                    return (
                      <div
                        key={item.day}
                        className={`rounded-2xl p-2 sm:p-3 text-center border transition-all ${
                          isPassed
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                            : isToday
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/40 animate-pulse'
                            : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="text-[10px] font-bold block text-slate-500">
                          {t(`দিন ${item.day}`, `D${item.day}`)}
                        </span>
                        <span className="text-xs sm:text-sm font-black block my-1">
                          {item.label}
                        </span>
                        {isPassed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 mx-auto text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 mx-auto text-slate-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Loyalty Points Conversion Card */}
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
                      `আপনার আছে ${customerProfile.loyaltyPoints} পয়েন্ট। ৫০ পয়েন্ট রিডিম করে ৫০ টাকা সরাসরি ওয়ালেটে যোগ করুন।`,
                      `You have ${customerProfile.loyaltyPoints} points. Redeem 50 points for ৳50 cash in wallet.`
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRedeemPoints(50)}
                    disabled={customerProfile.loyaltyPoints < 50}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{t('৫০ পয়েন্ট = ৳৫০ রিডিম', 'Redeem 50 Pts (৳50)')}</span>
                  </button>
                  {customerProfile.loyaltyPoints >= 100 && (
                    <button
                      onClick={() => handleRedeemPoints(100)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{t('১০০ পয়েন্ট = ৳১০০ রিডিম', 'Redeem 100 Pts (৳100)')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Orders & Tracking */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  {t('আপনার পূর্ববর্তী অর্ডারসমূহ', 'Your Previous Orders')}
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
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400">
                            {ord.id}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(ord.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                          {ord.items.map((i) => `${lang === 'bn' ? (i.productTitleBn || i.productTitle) : (i.productTitle || i.productTitleBn)} (${i.quantity})`).join(', ')}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-mono font-black text-slate-900 dark:text-white mt-1">
                          <span>৳{ord.pricing.total.toLocaleString()}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {ord.payment.method.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTrackOrder(ord.courier.trackingCode || ord.id)}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
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

          {/* TAB 3: Price Alerts */}
          {activeTab === 'alerts' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  {t('আপনার সক্রিয় মূল্য হ্রাস অ্যালার্ট', 'Your Active Price Drop Alerts')}
                </h3>
              </div>

              {priceAlerts.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <TrendingDown className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {t('কোনো মূল্য কমার অ্যালার্ট সেট করা নেই', 'No price drop alerts set')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {t('পণ্য পেজে গিয়ে "মূল্য কমার নোটিফিকেশন সেট করুন" বাটনে ক্লিক করুন।', 'Click "Set Price Alert" on any product page.')}
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
                          {t('বর্তমান মূল্য:', 'Current:')} ৳{alt.currentPrice} •{' '}
                          <span className="font-bold text-emerald-600">
                            {t('টার্গেট মূল্য:', 'Target:')} ৳{alt.targetPrice}
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

          {/* TAB 4: Profile Editor */}
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
                      {customerProfile.address}, {customerProfile.district}
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
