import React, { useState } from 'react';
import {
  X,
  Users,
  Building2,
  ShieldCheck,
  Wallet,
  ShoppingBag,
  ArrowUpRight,
  LogOut,
  CheckCircle2,
  Clock,
  Send,
  Package,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BD_DISTRICTS } from '../../data/initialData';

export const PartnerPortalModal: React.FC = () => {
  const {
    isPartnerPortalOpen,
    partnerPortalTab,
    openPartnerPortal,
    closePartnerPortal,
    products,
    settings,
    activeReseller,
    resellerPayouts,
    registerReseller,
    loginReseller,
    logoutReseller,
    requestResellerPayout,
    activeWholesaler,
    wholesaleQuotes,
    registerWholesaler,
    loginWholesaler,
    logoutWholesaler,
    submitWholesaleQuote,
    getPartnerPriceInfo,
    addToCart,
    openOneClickCheckout,
    t
  } = useStore();

  // Reseller Auth Form State
  const [resellerAuthMode, setResellerAuthMode] = useState<'login' | 'register'>('register');
  const [rIdentifier, setRIdentifier] = useState('');
  const [rLoginPassword, setRLoginPassword] = useState('');
  const [rName, setRName] = useState('');
  const [rPhone, setRPhone] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rDistrict, setRDistrict] = useState('Dhaka - Inside City');
  const [rPageUrl, setRPageUrl] = useState('');
  const [rPayoutNumber, setRPayoutNumber] = useState('');
  const [rPassword, setRPassword] = useState('');
  const [rError, setRError] = useState('');
  const [rSubmitting, setRSubmitting] = useState(false);

  // Reseller Payout Request State
  const [payoutMethod, setPayoutMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [payoutAmount, setPayoutAmount] = useState<number>(500);

  // Wholesale Auth Form State
  const [wsAuthMode, setWsAuthMode] = useState<'login' | 'register'>('register');
  const [wIdentifier, setWIdentifier] = useState('');
  const [wLoginPassword, setWLoginPassword] = useState('');
  const [wCompanyName, setWCompanyName] = useState('');
  const [wContactName, setWContactName] = useState('');
  const [wPhone, setWPhone] = useState('');
  const [wEmail, setWEmail] = useState('');
  const [wTradeLicense, setWTradeLicense] = useState('');
  const [wDistrict, setWDistrict] = useState('Dhaka - Inside City');
  const [wAddress, setWAddress] = useState('');
  const [wBusinessType, setWBusinessType] = useState<'Retail Shop' | 'Online Store' | 'Corporate' | 'Distributor' | 'Export'>('Retail Shop');
  const [wVolume, setWVolume] = useState('৳50,000 - ৳200,000 / month');
  const [wPassword, setWPassword] = useState('');
  const [wError, setWError] = useState('');
  const [wSubmitting, setWSubmitting] = useState(false);

  // Wholesale Catalog & Quote State
  const [wsQtys, setWsQtys] = useState<Record<string, number>>({});
  const [quoteProductId, setQuoteProductId] = useState<string>('');
  const [quoteCustomProduct, setQuoteCustomProduct] = useState('');
  const [quoteQty, setQuoteQty] = useState<number>(25);
  const [quoteTargetPrice, setQuoteTargetPrice] = useState<string>('');
  const [quoteNotes, setQuoteNotes] = useState('');

  if (!isPartnerPortalOpen) return null;

  const resellerCfg = settings.resellerSettings || {
    enabled: true,
    autoApprove: false,
    defaultCommissionPercent: 18,
    minPayoutBdt: 500
  };
  const wholesaleCfg = settings.wholesaleSettings || {
    enabled: true,
    autoApprove: false,
    defaultMinQty: 10,
    silverDiscountPercent: 5,
    goldDiscountPercent: 10,
    platinumDiscountPercent: 15,
    requireAdvancePercent: 25,
    b2bHeadlineBn: '',
    b2bHeadlineEn: ''
  };

  const handleResellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRError('');
    setRSubmitting(true);
    try {
      if (resellerAuthMode === 'login') {
        const res = await loginReseller(rIdentifier, rLoginPassword);
        if (!res.success) setRError(res.error || t('লগইন তথ্য সঠিক নয়।', 'Invalid credentials.'));
      } else {
        if (!rName.trim() || !rPhone.trim() || !rPassword.trim()) {
          setRError(t('নাম, মোবাইল নম্বর এবং পাসওয়ার্ড দিন।', 'Name, phone and password are required.'));
          return;
        }
        const res = await registerReseller({
          name: rName.trim(),
          phone: rPhone.trim(),
          email: rEmail.trim() || `${rPhone.replace(/[^0-9]/g, '')}@reseller.buyonebd.com`,
          district: rDistrict,
          fbPageUrl: rPageUrl.trim(),
          bkashNumber: rPayoutNumber.trim() || rPhone.trim(),
          password: rPassword
        });
        if (!res.success) setRError(res.error || t('নিবন্ধন ব্যর্থ হয়েছে।', 'Registration failed.'));
      }
    } finally {
      setRSubmitting(false);
    }
  };

  const handleWholesaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWError('');
    setWSubmitting(true);
    try {
      if (wsAuthMode === 'login') {
        const res = await loginWholesaler(wIdentifier, wLoginPassword);
        if (!res.success) setWError(res.error || t('লগইন তথ্য সঠিক নয়।', 'Invalid credentials.'));
      } else {
        if (!wCompanyName.trim() || !wContactName.trim() || !wPhone.trim() || !wPassword.trim()) {
          setWError(t('কোম্পানির নাম, যোগাযোগের নাম, মোবাইল এবং পাসওয়ার্ড দিন।', 'Company name, contact name, phone, and password are required.'));
          return;
        }
        const res = await registerWholesaler({
          companyName: wCompanyName.trim(),
          contactName: wContactName.trim(),
          phone: wPhone.trim(),
          email: wEmail.trim() || `${wPhone.replace(/[^0-9]/g, '')}@b2b.buyonebd.com`,
          tradeLicenseNo: wTradeLicense.trim(),
          district: wDistrict,
          address: wAddress.trim() || wDistrict,
          businessType: wBusinessType,
          monthlyVolumeEstimate: wVolume,
          password: wPassword
        });
        if (!res.success) setWError(res.error || t('আবেদন ব্যর্থ হয়েছে।', 'Registration failed.'));
      }
    } finally {
      setWSubmitting(false);
    }
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReseller) return;
    const ok = requestResellerPayout({
      method: payoutMethod,
      accountNumber: payoutAccount.trim() || activeReseller.bkashNumber || activeReseller.nagadNumber || activeReseller.phone,
      amount: payoutAmount
    });
    if (ok) {
      setPayoutAccount('');
    }
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosen = products.find((p) => p.id === quoteProductId);
    const title = chosen ? chosen.title : quoteCustomProduct.trim();
    if (!title || quoteQty < 1) return;
    const res = submitWholesaleQuote({
      productId: chosen?.id,
      productTitle: title,
      requestedQty: quoteQty,
      targetUnitPrice: quoteTargetPrice ? Number(quoteTargetPrice) : undefined,
      notes: quoteNotes.trim()
    });
    if (res) {
      setQuoteCustomProduct('');
      setQuoteTargetPrice('');
      setQuoteNotes('');
    }
  };

  const myPayouts = activeReseller
    ? resellerPayouts.filter((p) => p.resellerId === activeReseller.id)
    : [];
  const myQuotes = activeWholesaler
    ? wholesaleQuotes.filter((q) => q.wholesalerId === activeWholesaler.id)
    : [];

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {t('পার্টনার পোর্টাল — রিসেলার ও হোলসেল B2B', 'BuyOne BD Partner Portal')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                'অনুমোদিত লগইন ছাড়া রিসেলার বা হোলসেল প্রাইস প্রদর্শিত হয় না',
                'Trade & reseller pricing remains strictly confidential until account login and verification'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={closePartnerPortal}
            aria-label="Close Partner Portal"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-5 pt-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => openPartnerPortal('reseller')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              partnerPortalTab === 'reseller'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('রিসেলার প্রোগ্রাম', 'Reseller Program')}</span>
          </button>

          <button
            type="button"
            onClick={() => openPartnerPortal('wholesale')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              partnerPortalTab === 'wholesale'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{t('হোলসেল / B2B ট্রেড', 'Wholesale / B2B Trade')}</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* ================= RESELLER TAB ================= */}
          {partnerPortalTab === 'reseller' && (
            <>
              {!resellerCfg.enabled ? (
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {t('রিসেলার নিবন্ধন বর্তমানে সাময়িক বন্ধ রয়েছে।', 'Reseller registrations are temporarily paused.')}
                  </p>
                </div>
              ) : !activeReseller ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Overview */}
                  <div className="lg:col-span-5 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('শূন্য বিনিয়োগে বাংলাদেশের যেকোনো জেলা থেকে রিসেলিং শুরু করুন', 'Start Dropshipping Across 64 Districts with Zero Stock Risk')}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t(
                        'আপনার ফেসবুক পেজ, গ্রুপ বা লোকাল কাস্টমারের কাছে পণ্য বিক্রি করুন। ডেলিভারি ও ক্যাশ কালেকশন করবে আমাদের কুরিয়ার টিম — আপনার প্রফিট সরাসরি ওয়ালেটে যুক্ত হবে।',
                        'Sell any approved catalog item to your audience at your own customer-quoted price. We handle packaging, courier booking, and COD collection while crediting your wallet.'
                      )}
                    </p>
                    <dl className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex justify-between">
                        <dt className="text-slate-500">{t('ডিফল্ট কমিশন / মার্জিন', 'Standard Margin')}</dt>
                        <dd className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {t('সর্বোচ্চ', 'Up to')} {resellerCfg.defaultCommissionPercent}%
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">{t('সর্বনিম্ন উইথড্র', 'Min Withdrawal')}</dt>
                        <dd className="font-bold text-slate-900 dark:text-white tabular-nums">৳{resellerCfg.minPayoutBdt}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">{t('পেমেন্ট মাধ্যম', 'Payout Channels')}</dt>
                        <dd className="font-semibold text-slate-700 dark:text-slate-300">bKash · Nagad · Rocket · Bank</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Right Login / Registration Form */}
                  <form onSubmit={handleResellerSubmit} className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <button
                        type="button"
                        onClick={() => { setResellerAuthMode('register'); setRError(''); }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          resellerAuthMode === 'register'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {t('রিসেলার হিসেবে নিবন্ধন করুন', 'Apply as Reseller')}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setResellerAuthMode('login'); setRError(''); }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          resellerAuthMode === 'login'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {t('রিসেলার লগইন', 'Reseller Sign In')}
                      </button>
                    </div>

                    {rError && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
                        {rError}
                      </div>
                    )}

                    {resellerAuthMode === 'login' ? (
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('মোবাইল নম্বর বা ইমেইল বা রিসেলার কোড', 'Phone, Email or Reseller Code')}
                          </label>
                          <input
                            type="text"
                            required
                            value={rIdentifier}
                            onChange={(e) => setRIdentifier(e.target.value)}
                            placeholder="01XXXXXXXXX or RS-XXXX"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('পাসওয়ার্ড', 'Password')}
                          </label>
                          <input
                            type="password"
                            required
                            value={rLoginPassword}
                            onChange={(e) => setRLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('আপনার পূর্ণ নাম *', 'Full Name *')}
                          </label>
                          <input
                            type="text"
                            required
                            value={rName}
                            onChange={(e) => setRName(e.target.value)}
                            placeholder="Md. Arif Hasan"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('মোবাইল নম্বর *', 'Phone Number *')}
                          </label>
                          <input
                            type="tel"
                            required
                            value={rPhone}
                            onChange={(e) => setRPhone(e.target.value)}
                            placeholder="017XXXXXXXX"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('ইমেইল', 'Email Address')}
                          </label>
                          <input
                            type="email"
                            value={rEmail}
                            onChange={(e) => setREmail(e.target.value)}
                            placeholder="partner@domain.com"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('জেলা', 'District')}
                          </label>
                          <select
                            value={rDistrict}
                            onChange={(e) => setRDistrict(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          >
                            {BD_DISTRICTS.map((d) => (
                              <option key={d.name} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('ফেসবুক পেজ / স্টোর লিংক', 'Facebook Page / Store URL')}
                          </label>
                          <input
                            type="text"
                            value={rPageUrl}
                            onChange={(e) => setRPageUrl(e.target.value)}
                            placeholder="https://fb.com/yourshop"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('বিকাশ / নগদ পেমেন্ট নম্বর', 'bKash / Nagad Number')}
                          </label>
                          <input
                            type="tel"
                            value={rPayoutNumber}
                            onChange={(e) => setRPayoutNumber(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('অ্যাকাউন্ট পাসওয়ার্ড *', 'Account Password *')}
                          </label>
                          <input
                            type="password"
                            required
                            value={rPassword}
                            onChange={(e) => setRPassword(e.target.value)}
                            placeholder="Minimum 6 characters"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={rSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer disabled:opacity-60"
                    >
                      {rSubmitting
                        ? t('অপেক্ষা করুন...', 'Processing...')
                        : resellerAuthMode === 'login'
                        ? t('রিসেলার ড্যাশবোর্ডে প্রবেশ করুন', 'Sign In to Reseller Dashboard')
                        : t('রিসেলার আবেদন জমা দিন', 'Submit Reseller Application')}
                    </button>
                  </form>
                </div>
              ) : activeReseller.status !== 'approved' ? (
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold">
                        <Clock className="w-4 h-4" />
                        <span>
                          {activeReseller.status === 'pending'
                            ? t('অ্যাপ্রুভাল অপেক্ষমাণ রয়েছে', 'Application Pending Approval')
                            : t('অ্যাকাউন্ট স্থগিত করা হয়েছে', 'Account Suspended')}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {activeReseller.name} · <span className="font-mono text-emerald-600">{activeReseller.resellerCode}</span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {activeReseller.status === 'pending'
                          ? t(
                              'অ্যাডমিন আপনার আবেদন অনুমোদন করার সাথে সাথে হোমপেজে সকল পণ্যের রিসেলার প্রাইস এবং অর্ডার ড্যাশবোর্ড আনলক হবে।',
                              'Reseller prices and profit margins remain hidden on the storefront until an administrator approves your account.'
                            )
                          : t('সহায়তার জন্য হটলাইন +8801917942662 নম্বরে যোগাযোগ করুন।', 'Contact +8801917942662 for account assistance.')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={logoutReseller}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('সাইন আউট', 'Sign Out')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Approved Reseller Dashboard */
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('ভেরিফাইড রিসেলার অ্যাক্টিভ', 'Verified Reseller Active')}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {activeReseller.name} · <span className="font-mono text-sm text-emerald-600">{activeReseller.resellerCode}</span>
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={logoutReseller}
                      className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('লগআউট', 'Sign Out')}</span>
                    </button>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                      <span className="text-[11px] text-slate-500 block">{t('ওয়ালেট ব্যালেন্স', 'Wallet Balance')}</span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        ৳{activeReseller.walletBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                      <span className="text-[11px] text-slate-500 block">{t('মোট আয়', 'Total Earnings')}</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                        ৳{activeReseller.totalEarnings.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                      <span className="text-[11px] text-slate-500 block">{t('মোট রিসেল অর্ডার', 'Resold Orders')}</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                        {activeReseller.totalOrders}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                      <span className="text-[11px] text-slate-500 block">{t('কমিশন হার', 'Commission Rate')}</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                        {activeReseller.commissionPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Withdrawal Form + Payout History */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <form
                      onSubmit={handlePayoutSubmit}
                      className="lg:col-span-5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3 text-xs"
                    >
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        <span>{t('টাকা উত্তোলন আবেদন', 'Request Commission Payout')}</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-500 mb-1">{t('মাধ্যম', 'Method')}</label>
                          <select
                            value={payoutMethod}
                            onChange={(e) => setPayoutMethod(e.target.value as any)}
                            className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          >
                            <option value="bkash">bKash</option>
                            <option value="nagad">Nagad</option>
                            <option value="rocket">Rocket</option>
                            <option value="bank">Bank Transfer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1">{t('পরিমাণ (৳)', 'Amount (৳)')}</label>
                          <input
                            type="number"
                            min={resellerCfg.minPayoutBdt}
                            max={Math.max(resellerCfg.minPayoutBdt, activeReseller.walletBalance)}
                            value={payoutAmount}
                            onChange={(e) => setPayoutAmount(Number(e.target.value) || 0)}
                            className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">{t('অ্যাকাউন্ট / বিকাশ নম্বর', 'Account / Wallet Number')}</label>
                        <input
                          type="text"
                          value={payoutAccount}
                          onChange={(e) => setPayoutAccount(e.target.value)}
                          placeholder={activeReseller.bkashNumber || activeReseller.nagadNumber || activeReseller.phone}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={activeReseller.walletBalance < resellerCfg.minPayoutBdt}
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer disabled:opacity-50"
                      >
                        {t('উইথড্র রিকোয়েস্ট পাঠান', 'Submit Payout Request')}
                      </button>
                    </form>

                    <div className="lg:col-span-7 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 space-y-2.5 text-xs">
                      <h4 className="font-bold text-slate-900 dark:text-white">{t('পেমেন্ট হিস্ট্রি', 'Payout History')}</h4>
                      {myPayouts.length === 0 ? (
                        <p className="text-slate-500 py-4">{t('এখনো কোনো উত্তোলন অনুরোধ নেই।', 'No payout requests yet.')}</p>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-40 overflow-y-auto">
                          {myPayouts.map((pay) => (
                            <div key={pay.id} className="py-2 flex items-center justify-between gap-2 tabular-nums">
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white uppercase">
                                  {pay.method} · {pay.accountNumber}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {new Date(pay.createdAt).toLocaleDateString()} {pay.trxId ? `· TrxID: ${pay.trxId}` : ''}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono font-bold text-slate-900 dark:text-white">৳{pay.amount.toLocaleString()}</p>
                                <span
                                  className={`text-[10px] font-bold uppercase ${
                                    pay.status === 'paid'
                                      ? 'text-emerald-600'
                                      : pay.status === 'rejected'
                                      ? 'text-rose-500'
                                      : 'text-amber-600'
                                  }`}
                                >
                                  {pay.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Reseller Catalog */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        <span>{t('রিসেলার প্রাইস ক্যাটালগ (লগইনকৃত প্রাইস)', 'Confidential Reseller Price Catalog')}</span>
                      </h4>
                      <span className="text-[11px] text-slate-500 tabular-nums">
                        {products.filter((p) => p.resellable !== false).length} items available
                      </span>
                    </div>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {products
                          .filter((p) => p.resellable !== false && p.stock > 0)
                          .slice(0, 20)
                          .map((p) => {
                            const info = getPartnerPriceInfo(p, 1);
                            const margin = Math.max(0, p.price - info.unitPrice);
                            return (
                              <div
                                key={p.id}
                                className="p-3 flex items-center justify-between gap-3 bg-white dark:bg-slate-950/50 tabular-nums"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img
                                    src={p.images?.[0] || ''}
                                    alt={p.title}
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 dark:text-white truncate">{p.title}</p>
                                    <p className="text-[11px] text-slate-500">
                                      Retail ৳{p.price.toLocaleString()} ·{' '}
                                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                        Reseller ৳{info.unitPrice.toLocaleString()}
                                      </span>{' '}
                                      · Profit ৳{margin.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    closePartnerPortal();
                                    openOneClickCheckout(p);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
                                >
                                  <span>{t('অর্ডার করুন', 'Order')}</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ================= WHOLESALE TAB ================= */}
          {partnerPortalTab === 'wholesale' && (
            <>
              {!wholesaleCfg.enabled ? (
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {t('হোলসেল B2B প্রোগ্রাম সাময়িক বন্ধ রয়েছে।', 'Wholesale B2B trade program is currently paused.')}
                  </p>
                </div>
              ) : !activeWholesaler ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('ভেরিফাইড হোলসেল B2B অ্যাকাউন্ট — সরাসরি সোর্স রেট', 'Verified Wholesale B2B Supply')}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t(
                        'দোকানদার, কর্পোরেট বায়ার ও ডিস্ট্রিবিউটরদের জন্য টায়ার-ভিত্তিক পাইকারি মূল্য, MOQ স্ল্যাব ও কাস্টম কোটেশন সুবিধা। অনুমোদিত হোলসেল বায়ার ছাড়া পাইকারি মূল্য গোপন রাখা হয়।',
                        'Volume-tiered B2B slab pricing, MOQ bulk ordering, and direct quote negotiations across 64 districts. Trade rates unlock only after buyer approval.'
                      )}
                    </p>
                    <dl className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs tabular-nums">
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Silver Tier</dt>
                        <dd className="font-bold text-slate-900 dark:text-white">{wholesaleCfg.silverDiscountPercent}% Extra B2B Off</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Gold Tier</dt>
                        <dd className="font-bold text-slate-900 dark:text-white">{wholesaleCfg.goldDiscountPercent}% Extra B2B Off</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Platinum Tier</dt>
                        <dd className="font-bold text-emerald-600 dark:text-emerald-400">{wholesaleCfg.platinumDiscountPercent}% Extra B2B Off</dd>
                      </div>
                    </dl>
                  </div>

                  <form onSubmit={handleWholesaleSubmit} className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <button
                        type="button"
                        onClick={() => { setWsAuthMode('register'); setWError(''); }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          wsAuthMode === 'register'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {t('হোলসেল অ্যাকাউন্ট আবেদন', 'Apply for Wholesale B2B')}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setWsAuthMode('login'); setWError(''); }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          wsAuthMode === 'login'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {t('হোলসেল বায়ার লগইন', 'Wholesale Sign In')}
                      </button>
                    </div>

                    {wError && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
                        {wError}
                      </div>
                    )}

                    {wsAuthMode === 'login' ? (
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('মোবাইল নম্বর বা ইমেইল', 'Registered Phone or Email')}
                          </label>
                          <input
                            type="text"
                            required
                            value={wIdentifier}
                            onChange={(e) => setWIdentifier(e.target.value)}
                            placeholder="01XXXXXXXXX or trade@company.com"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('পাসওয়ার্ড', 'Password')}
                          </label>
                          <input
                            type="password"
                            required
                            value={wLoginPassword}
                            onChange={(e) => setWLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('প্রতিষ্ঠানের নাম *', 'Company / Shop Name *')}
                          </label>
                          <input
                            type="text"
                            required
                            value={wCompanyName}
                            onChange={(e) => setWCompanyName(e.target.value)}
                            placeholder="Dhaka Gadget House"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('যোগাযোগকারীর নাম *', 'Contact Person *')}
                          </label>
                          <input
                            type="text"
                            required
                            value={wContactName}
                            onChange={(e) => setWContactName(e.target.value)}
                            placeholder="Kamrul Islam"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('মোবাইল নম্বর *', 'Phone Number *')}
                          </label>
                          <input
                            type="tel"
                            required
                            value={wPhone}
                            onChange={(e) => setWPhone(e.target.value)}
                            placeholder="018XXXXXXXX"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('ইমেইল', 'Business Email')}
                          </label>
                          <input
                            type="email"
                            value={wEmail}
                            onChange={(e) => setWEmail(e.target.value)}
                            placeholder="procurement@company.com"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('ট্রেড লাইসেন্স / NID নম্বর', 'Trade License or NID')}
                          </label>
                          <input
                            type="text"
                            value={wTradeLicense}
                            onChange={(e) => setWTradeLicense(e.target.value)}
                            placeholder="TL-2026-XXXX"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('ব্যবসার ধরন', 'Business Type')}
                          </label>
                          <select
                            value={wBusinessType}
                            onChange={(e) => setWBusinessType(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          >
                            <option value="Retail Shop">Retail Shop / Showroom</option>
                            <option value="Corporate">Corporate / Office Procurement</option>
                            <option value="Online Store">Online Store / F-Commerce</option>
                            <option value="Distributor">Regional Distributor</option>
                            <option value="Export">Export / Global Buyer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('জেলা', 'District')}
                          </label>
                          <select
                            value={wDistrict}
                            onChange={(e) => setWDistrict(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          >
                            {BD_DISTRICTS.map((d) => (
                              <option key={d.name} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('সম্ভাব্য মাসিক অর্ডার', 'Est. Monthly Volume')}
                          </label>
                          <input
                            type="text"
                            value={wVolume}
                            onChange={(e) => setWVolume(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('দোকান / অফিসের পূর্ণ ঠিকানা', 'Business Address')}
                          </label>
                          <input
                            type="text"
                            value={wAddress}
                            onChange={(e) => setWAddress(e.target.value)}
                            placeholder="Shop 42, Multiplan Center, New Elephant Road, Dhaka"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('অ্যাকাউন্ট পাসওয়ার্ড *', 'Password *')}
                          </label>
                          <input
                            type="password"
                            required
                            value={wPassword}
                            onChange={(e) => setWPassword(e.target.value)}
                            placeholder="Minimum 6 characters"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={wSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer disabled:opacity-60"
                    >
                      {wSubmitting
                        ? t('অপেক্ষা করুন...', 'Processing...')
                        : wsAuthMode === 'login'
                        ? t('হোলসেল B2B পোর্টালে লগইন করুন', 'Sign In to Wholesale Portal')
                        : t('হোলসেল আবেদন জমা দিন', 'Submit Wholesale Application')}
                    </button>
                  </form>
                </div>
              ) : activeWholesaler.status !== 'approved' ? (
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold">
                        <Clock className="w-4 h-4" />
                        <span>
                          {activeWholesaler.status === 'pending'
                            ? t('ট্রেড অ্যাকাউন্ট যাচাই চলছে', 'Trade Account Verification Pending')
                            : t('হোলসেল অ্যাকাউন্ট স্থগিত', 'Account Suspended')}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {activeWholesaler.companyName} · {activeWholesaler.contactName}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {activeWholesaler.status === 'pending'
                          ? t(
                              'শুধুমাত্র অনুমোদিত হোলসেল বায়াররাই স্টোরের পাইকারি প্রাইস ও MOQ স্ল্যাব দেখতে পারবেন।',
                              'Wholesale slab prices and bulk MOQ controls unlock only after B2B trade approval.'
                            )
                          : t('সহায়তার জন্য +8801917942662 নম্বরে যোগাযোগ করুন।', 'Contact +8801917942662 for assistance.')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={logoutWholesaler}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('সাইন আউট', 'Sign Out')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Approved Wholesaler B2B Dashboard */
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t('ভেরিফাইড হোলসেল বায়ার', 'Approved Wholesale Buyer')}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {activeWholesaler.companyName} · <span className="uppercase text-emerald-600">{activeWholesaler.tier} Tier</span>
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={logoutWholesaler}
                      className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('সাইন আউট', 'Sign Out')}</span>
                    </button>
                  </div>

                  {/* Trade Catalog with MOQ Quick Add */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span>{t('হোলসেল বাল্ক কুইক-অর্ডার ক্যাটালগ', 'Confidential B2B Trade Catalog (MOQ)')}</span>
                      </h4>
                      <span className="text-[11px] text-slate-500 tabular-nums">
                        Extra {activeWholesaler.extraDiscountPercent}% tier discount applied
                      </span>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {products
                          .filter((p) => p.wholesaleEnabled !== false && p.stock > 0)
                          .slice(0, 20)
                          .map((p) => {
                            const minQ = p.wholesaleMinQty || wholesaleCfg.defaultMinQty || 10;
                            const chosenQty = wsQtys[p.id] ?? minQ;
                            const info = getPartnerPriceInfo(p, chosenQty);
                            return (
                              <div
                                key={p.id}
                                className="p-3 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-950/50 tabular-nums"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <img
                                    src={p.images?.[0] || ''}
                                    alt={p.title}
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 dark:text-white truncate">{p.title}</p>
                                    <p className="text-[11px] text-slate-500">
                                      MOQ: {minQ} pcs ·{' '}
                                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                        B2B ৳{info.unitPrice.toLocaleString()}/unit
                                      </span>{' '}
                                      (Retail ৳{p.price.toLocaleString()})
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <input
                                    type="number"
                                    min={minQ}
                                    max={p.stock}
                                    value={chosenQty}
                                    onChange={(e) =>
                                      setWsQtys((prev) => ({
                                        ...prev,
                                        [p.id]: Math.max(minQ, Number(e.target.value) || minQ)
                                      }))
                                    }
                                    className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-mono font-bold text-slate-900 dark:text-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      addToCart(p, chosenQty);
                                      closePartnerPortal();
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                                  >
                                    {t('কার্টে যোগ করুন', 'Add MOQ')}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Custom Bulk Quote (RFQ) + History */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <form
                      onSubmit={handleQuoteSubmit}
                      className="lg:col-span-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3 text-xs"
                    >
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Send className="w-4 h-4 text-emerald-600" />
                        <span>{t('বাল্ক কোটেশন (RFQ) পাঠান', 'Request Custom Bulk Quote (RFQ)')}</span>
                      </h4>
                      <div>
                        <label className="block text-slate-500 mb-1">{t('ক্যাটালগ পণ্য বাছাই', 'Select Catalog Product')}</label>
                        <select
                          value={quoteProductId}
                          onChange={(e) => setQuoteProductId(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          <option value="">-- Custom / Other Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                      </div>
                      {!quoteProductId && (
                        <div>
                          <label className="block text-slate-500 mb-1">{t('কাস্টম পণ্যের নাম', 'Custom Product Name')}</label>
                          <input
                            type="text"
                            required
                            value={quoteCustomProduct}
                            onChange={(e) => setQuoteCustomProduct(e.target.value)}
                            placeholder="e.g. Corporate Gift Box / Bulk Earbuds"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-500 mb-1">{t('পরিমাণ (পিস)', 'Quantity (pcs)')}</label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={quoteQty}
                            onChange={(e) => setQuoteQty(Number(e.target.value) || 1)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1">{t('টার্গেট প্রতি পিস রেট (৳)', 'Target Rate / Unit (৳)')}</label>
                          <input
                            type="number"
                            value={quoteTargetPrice}
                            onChange={(e) => setQuoteTargetPrice(e.target.value)}
                            placeholder="Optional"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">{t('অতিরিক্ত নোট / ডেলিভারি চাহিদা', 'Notes / Delivery Schedule')}</label>
                        <textarea
                          rows={2}
                          value={quoteNotes}
                          onChange={(e) => setQuoteNotes(e.target.value)}
                          placeholder="Custom branding, VAT challan, or Urgent 64-district drop..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                      >
                        {t('কোটেশন অনুরোধ পাঠান', 'Submit Bulk Quote')}
                      </button>
                    </form>

                    <div className="lg:col-span-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 space-y-2.5 text-xs">
                      <h4 className="font-bold text-slate-900 dark:text-white">{t('কোটেশন ইতিহাস', 'My Quote Requests')}</h4>
                      {myQuotes.length === 0 ? (
                        <p className="text-slate-500 py-4">{t('এখনো কোনো কোটেশন পাঠানো হয়নি।', 'No quotes submitted yet.')}</p>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                          {myQuotes.map((qt) => (
                            <div key={qt.id} className="py-2.5 space-y-1 tabular-nums">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-slate-900 dark:text-white truncate">{qt.productTitle}</span>
                                <span
                                  className={`text-[10px] font-bold uppercase ${
                                    qt.status === 'accepted' || qt.status === 'quoted'
                                      ? 'text-emerald-600'
                                      : qt.status === 'rejected'
                                      ? 'text-rose-500'
                                      : 'text-amber-600'
                                  }`}
                                >
                                  {qt.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Qty: {qt.requestedQty} pcs
                                {qt.adminQuotedPrice ? ` · Admin Offer: ৳${qt.adminQuotedPrice.toLocaleString()}/unit` : ''}
                              </p>
                              {qt.notes && (
                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                                  {qt.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
