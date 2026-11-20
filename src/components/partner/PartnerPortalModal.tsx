import React, { useEffect, useMemo, useState } from 'react';
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
  AlertCircle,
  Search,
  Copy,
  Check,
  MessageCircle,
  Link2,
  RefreshCw,
  Settings,
  TrendingUp,
  Lock,
  Save,
  Calculator,
  Bot,
  Volume2,
  Plus
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BD_DISTRICTS } from '../../data/initialData';
import { Product } from '../../types';
import { speakClearText } from '../../utils/voiceAudio';

export const PartnerPortalModal: React.FC = () => {
  const {
    isPartnerPortalOpen,
    partnerPortalTab,
    openPartnerPortal,
    closePartnerPortal,
    products,
    categories,
    orders,
    settings,
    activeReseller,
    resellerPayouts,
    registerReseller,
    loginReseller,
    logoutReseller,
    updateActiveResellerProfile,
    requestResellerPayout,
    activeWholesaler,
    wholesaleQuotes,
    registerWholesaler,
    loginWholesaler,
    logoutWholesaler,
    submitWholesaleQuote,
    getPartnerPriceInfo,
    createOrder,
    addToCart,
    syncStoreFromServer,
    setIsWhatsAppOpen,
    sendCustomerWhatsAppInquiry,
    addToast,
    lang,
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

  // Expanded Mobile-Friendly Reseller Dashboard Sub-Tabs
  const [resDashTab, setResDashTab] = useState<'overview' | 'catalog' | 'orders' | 'payouts' | 'support' | 'profile'>('overview');
  const [catSearch, setCatSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [customQuotes, setCustomQuotes] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string>('');
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

  // In-Dashboard Place Order for Customer (Custom Margin)
  const [quickOrderProduct, setQuickOrderProduct] = useState<Product | null>(null);
  const [qoQty, setQoQty] = useState<number>(1);
  const [qoSellPrice, setQoSellPrice] = useState<number>(0);
  const [qoCustName, setQoCustName] = useState('');
  const [qoCustPhone, setQoCustPhone] = useState('');
  const [qoCustDistrict, setQoCustDistrict] = useState('Dhaka - Inside City');
  const [qoCustThana, setQoCustThana] = useState('');
  const [qoCustAddress, setQoCustAddress] = useState('');
  const [qoNote, setQoNote] = useState('');
  const [qoSubmitting, setQoSubmitting] = useState(false);

  // Reseller Orders Filter
  const [resOrderFilter, setResOrderFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all');

  // Interactive Margin Calculator
  const [calcBasePrice, setCalcBasePrice] = useState<number>(850);
  const [calcSellPrice, setCalcSellPrice] = useState<number>(1250);
  const [calcQty, setCalcQty] = useState<number>(1);

  // Built-in Reseller Support Desk (AI + Admin WhatsApp Sync)
  const [supportQuestion, setSupportQuestion] = useState('');
  const [supportThread, setSupportThread] = useState<{ id: string; sender: 'reseller' | 'ai' | 'whatsapp'; text: string; time: string }[]>([]);
  const [isAskingSupportAi, setIsAskingSupportAi] = useState(false);

  // Reseller Profile Edit State
  const [profName, setProfName] = useState('');
  const [profDistrict, setProfDistrict] = useState('Dhaka - Inside City');
  const [profAddress, setProfAddress] = useState('');
  const [profPageUrl, setProfPageUrl] = useState('');
  const [profBkash, setProfBkash] = useState('');
  const [profNagad, setProfNagad] = useState('');
  const [profBank, setProfBank] = useState('');

  useEffect(() => {
    if (activeReseller) {
      setProfName(activeReseller.name || '');
      setProfDistrict(activeReseller.district || 'Dhaka - Inside City');
      setProfAddress(activeReseller.address || '');
      setProfPageUrl(activeReseller.fbPageUrl || '');
      setProfBkash(activeReseller.bkashNumber || '');
      setProfNagad(activeReseller.nagadNumber || '');
      setProfBank(activeReseller.bankDetails || '');
    }
  }, [activeReseller?.id]);

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
  const [wsSearch, setWsSearch] = useState('');
  const [quoteProductId, setQuoteProductId] = useState<string>('');
  const [quoteCustomProduct, setQuoteCustomProduct] = useState('');
  const [quoteQty, setQuoteQty] = useState<number>(25);
  const [quoteTargetPrice, setQuoteTargetPrice] = useState<string>('');
  const [quoteNotes, setQuoteNotes] = useState('');

  const myResellerOrders = useMemo(() => {
    if (!activeReseller) return [];
    return orders.filter(
      (o) =>
        o.resellerId === activeReseller.id ||
        (o.resellerCode && o.resellerCode === activeReseller.resellerCode)
    );
  }, [orders, activeReseller]);

  const filteredResellerOrders = useMemo(() => {
    if (resOrderFilter === 'all') return myResellerOrders;
    return myResellerOrders.filter((o) => o.status === resOrderFilter);
  }, [myResellerOrders, resOrderFilter]);

  const filteredCatalog = useMemo(() => {
    const q = catSearch.trim().toLowerCase();
    return products.filter((p) => {
      if (p.resellable === false) return false;
      if (catFilter !== 'all' && p.category !== catFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.titleBn.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [products, catFilter, catSearch]);

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

  const handleCopyText = async (key: string, text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(key);
      setTimeout(() => setCopiedId(''), 1800);
      addToast('success', label, '');
    } catch {
      addToast('info', label, text);
    }
  };

  const handleResellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRError('');
    setRSubmitting(true);
    try {
      if (resellerAuthMode === 'login') {
        const res = await loginReseller(rIdentifier, rLoginPassword);
        if (!res.success) {
          setRError(res.error || t('লগইন তথ্য সঠিক নয়।', 'Invalid credentials.'));
        } else {
          setResDashTab('overview');
        }
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
        if (!res.success) {
          setRError(res.error || t('নিবন্ধন ব্যর্থ হয়েছে।', 'Registration failed.'));
        } else {
          setResDashTab('overview');
        }
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

  const handleOpenQuickCustomerOrder = (product: Product) => {
    const info = getPartnerPriceInfo(product, 1);
    const preferredQuote = Number(customQuotes[product.id] || product.price);
    setQuickOrderProduct(product);
    setQoQty(1);
    setQoSellPrice(Math.max(info.unitPrice, preferredQuote));
    setQoCustName('');
    setQoCustPhone('');
    setQoCustDistrict(activeReseller?.district || 'Dhaka - Inside City');
    setQoCustThana('');
    setQoCustAddress('');
    setQoNote('');
  };

  const handleSubmitQuickCustomerOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickOrderProduct || !activeReseller) return;
    if (!qoCustName.trim() || !qoCustPhone.trim() || !qoCustAddress.trim()) {
      addToast('warning', t('তথ্য অসম্পূর্ণ', 'Missing Details'), t('কাস্টমারের নাম, ফোন ও ঠিকানা দিন।', 'Customer name, phone and address are required.'));
      return;
    }
    setQoSubmitting(true);
    try {
      const distInfo = BD_DISTRICTS.find((d) => d.name === qoCustDistrict);
      const deliveryZone = distInfo?.zone || 'dhaka_outside';
      const customCustomerSubtotal = Math.max(0, qoSellPrice) * Math.max(1, qoQty);
      const newOrd = createOrder({
        customer: {
          name: qoCustName.trim(),
          phone: qoCustPhone.trim(),
          address: qoCustAddress.trim(),
          district: qoCustDistrict,
          thana: qoCustThana.trim() || qoCustDistrict,
          note: qoNote.trim() ? `[Reseller ${activeReseller.resellerCode}] ${qoNote.trim()}` : `[Reseller ${activeReseller.resellerCode}]`
        },
        items: [{ product: quickOrderProduct, quantity: Math.max(1, qoQty) }],
        paymentMethod: 'cod',
        deliveryZone,
        partnerType: 'reseller',
        customerQuotedPrice: customCustomerSubtotal
      });
      setQuickOrderProduct(null);
      setResDashTab('orders');
      addToast(
        'success',
        t('কাস্টমার COD অর্ডার সম্পন্ন!', 'Customer COD Order Placed!'),
        `#${newOrd.id} · Profit +৳${(newOrd.resellerProfit || 0).toLocaleString()}`
      );
    } catch (err: any) {
      addToast('error', t('অর্ডার ব্যর্থ', 'Order Failed'), err?.message || 'Could not place reseller order.');
    } finally {
      setQoSubmitting(false);
    }
  };

  const handleAskSupportAi = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = supportQuestion.trim();
    if (!q || isAskingSupportAi) return;
    const userMsg = {
      id: `rs-${Date.now()}`,
      sender: 'reseller' as const,
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSupportThread((prev) => [...prev, userMsg]);
    setSupportQuestion('');
    setIsAskingSupportAi(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Reseller ${activeReseller?.name || 'Partner'} (${activeReseller?.resellerCode || ''}, Status: ${activeReseller?.status || 'pending'}) asks: ${q}`,
          lang,
          products: products.slice(0, 8).map((p) => ({
            title: p.title,
            titleBn: p.titleBn,
            price: p.price,
            stock: p.stock
          }))
        })
      });
      const data = await res.json();
      const aiText =
        data?.reply ||
        t(
          'ধন্যবাদ! আপনার প্রশ্নটি পেয়েছি। দ্রুত সহায়তার জন্য নিচের WhatsApp বাটনে মেসেজ করতে পারেন।',
          'Thanks for reaching out! Please also send directly to our Admin WhatsApp Desk below for fast priority assistance.'
        );
      setSupportThread((prev) => [
        ...prev,
        {
          id: `rai-${Date.now()}`,
          sender: 'ai',
          text: aiText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      setSupportThread((prev) => [
        ...prev,
        {
          id: `rai-err-${Date.now()}`,
          sender: 'ai',
          text: t('এই মুহূর্তে কানেক্ট করা যায়নি। নিচের WhatsApp সাপোর্টে পাঠান।', 'Could not reach assistant right now. Use Direct WhatsApp Desk below.'),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAskingSupportAi(false);
    }
  };

  const handleSendResellerWhatsAppToAdmin = async (customText?: string) => {
    const msgText = (customText || supportQuestion).trim();
    if (!msgText || !activeReseller) return;
    if (!customText) setSupportQuestion('');
    setSupportThread((prev) => [
      ...prev,
      {
        id: `rwa-${Date.now()}`,
        sender: 'whatsapp',
        text: `[Sent to Admin WhatsApp Desk] ${msgText}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    await sendCustomerWhatsAppInquiry({
      phone: activeReseller.phone,
      name: `${activeReseller.name} (${activeReseller.resellerCode})`,
      message: `[Reseller Dashboard Inquiry] ${msgText}`
    });
  };

  const myPayouts = activeReseller
    ? resellerPayouts.filter((p) => p.resellerId === activeReseller.id)
    : [];
  const myQuotes = activeWholesaler
    ? wholesaleQuotes.filter((q) => q.wholesalerId === activeWholesaler.id)
    : [];

  const isApprovedReseller = Boolean(activeReseller && activeReseller.status === 'approved');
  const referralUrl =
    typeof window !== 'undefined' && activeReseller
      ? `${window.location.origin}/?res=${encodeURIComponent(activeReseller.resellerCode)}`
      : '';
  const supportWaDigits = String(settings.whatsappNumber || '+8801917942662').replace(/[^0-9]/g, '');
  const supportWaHref = activeReseller
    ? `https://wa.me/${supportWaDigits.startsWith('88') ? supportWaDigits : `88${supportWaDigits}`}?text=${encodeURIComponent(
        `আসসালামু আলাইকুম, আমি রিসেলার ${activeReseller.name} (${activeReseller.resellerCode})। আমার রিসেলার একাউন্ট/অর্ডার বিষয়ে সহায়তা প্রয়োজন।`
      )}`
    : `https://wa.me/${supportWaDigits.startsWith('88') ? supportWaDigits : `88${supportWaDigits}`}`;

  return (
    <div className="fixed inset-0 z-[9995] flex items-end sm:items-center justify-center p-0 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col rounded-none sm:rounded-2xl bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {t('পার্টনার পোর্টাল — রিসেলার ও হোলসেল B2B', 'BuyOne BD Partner Portal')}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
              {t(
                'অনুমোদিত লগইন ছাড়া রিসেলার বা হোলসেল প্রাইস প্রদর্শিত হয় না',
                'Confidential reseller & wholesale prices unlock strictly after account approval'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={closePartnerPortal}
            aria-label="Close Partner Portal"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs (Reseller / Wholesale) */}
        <div className="px-4 sm:px-5 pt-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-900 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => openPartnerPortal('reseller')}
            className={`pb-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              partnerPortalTab === 'reseller'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('রিসেলার প্রোগ্রাম ও ড্যাশবোর্ড', 'Reseller Program & Dashboard')}</span>
          </button>

          <button
            type="button"
            onClick={() => openPartnerPortal('wholesale')}
            className={`pb-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
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
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-5">
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Overview */}
                  <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('শূন্য বিনিয়োগে বাংলাদেশের যেকোনো জেলা থেকে রিসেলিং শুরু করুন', 'Start Mobile Reselling Across 64 Districts with Zero Stock')}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t(
                        'আপনার ফেসবুক পেজ, গ্রুপ বা হোয়াটসঅ্যাপ কাস্টমারের কাছে পণ্য বিক্রি করুন। ডেলিভারি ও ক্যাশ কালেকশন করবে আমাদের কুরিয়ার টিম — আপনার প্রফিট সরাসরি ওয়ালেটে যুক্ত হবে।',
                        'Sell catalog products on Facebook, Instagram, or WhatsApp at your custom retail price. We pack & collect COD across Bangladesh while crediting your wallet.'
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
                    <div className="grid grid-cols-2 gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <button
                        type="button"
                        onClick={() => { setResellerAuthMode('register'); setRError(''); }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                          resellerAuthMode === 'register'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {t('রিসেলার আবেদন', 'Apply as Reseller')}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setResellerAuthMode('login'); setRError(''); }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
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
                            placeholder="01XXXXXXXXX or RES-XXXX"
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
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
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
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
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
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('জেলা', 'District')}
                          </label>
                          <select
                            value={rDistrict}
                            onChange={(e) => setRDistrict(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
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
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
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
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
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
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={rSubmitting}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer disabled:opacity-60 shadow-sm"
                    >
                      {rSubmitting
                        ? t('অপেক্ষা করুন...', 'Processing...')
                        : resellerAuthMode === 'login'
                        ? t('রিসেলার ড্যাশবোর্ডে প্রবেশ করুন', 'Sign In to Reseller Dashboard')
                        : t('রিসেলার আবেদন জমা দিন ও ড্যাশবোর্ড খুলুন', 'Submit Application & Open Dashboard')}
                    </button>
                  </form>
                </div>
              ) : (
                /* FULL MULTI-TAB MOBILE-FRIENDLY RESELLER DASHBOARD (works immediately upon application AND expands on approval!) */
                <div className="space-y-4">
                  {/* Account Status Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-bold flex-wrap">
                        {isApprovedReseller ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{t('ভেরিফাইড রিসেলার অ্যাক্টিভ', 'Verified Reseller Active')}</span>
                          </span>
                        ) : activeReseller.status === 'pending' ? (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{t('অ্যাপ্রুভাল অপেক্ষমাণ', 'Application Pending Admin Approval')}</span>
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{t('অ্যাকাউন্ট স্থগিত', 'Account Suspended')}</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                        {activeReseller.name} ·{' '}
                        <span className="font-mono text-xs sm:text-sm text-emerald-600">{activeReseller.resellerCode}</span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsRefreshingStatus(true);
                          await syncStoreFromServer();
                          setIsRefreshingStatus(false);
                        }}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStatus ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">{t('স্ট্যাটাস রিফ্রেশ', 'Refresh')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={logoutReseller}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('সাইন আউট', 'Sign Out')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Pending Step Progress Notice (strictly hides reseller prices until admin approves) */}
                  {!isApprovedReseller && (
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-xs space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          <span>
                            {activeReseller.status === 'pending'
                              ? t(
                                  'ধাপ ২/৩: আপনার আবেদন অ্যাডমিন ড্যাশবোর্ডে পৌঁছেছে — অনুমোদন হলেই সকল রিসেলার প্রাইস আনলক হবে।',
                                  'Step 2 of 3: Your application has been sent to Admin Review. Reseller pricing unlocks once approved.'
                                )
                              : t(
                                  'আপনার অ্যাকাউন্ট বর্তমানে স্থগিত। সহায়তার জন্য নিচে WhatsApp বাটনে মেসেজ করুন।',
                                  'Your account is suspended. Contact WhatsApp support below.'
                                )}
                          </span>
                        </span>
                        <a
                          href={supportWaHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{t('WhatsApp দ্রুত অ্যাপ্রুভাল', 'WhatsApp Support')}</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Mobile-Scrollable Reseller Dashboard Sub-Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { id: 'overview', label: t('ওভারভিউ', 'Overview'), icon: TrendingUp },
                      {
                        id: 'catalog',
                        label: isApprovedReseller ? t('ক্যাটালগ ও অর্ডার', 'Catalog & Order') : t('ক্যাটালগ 🔒', 'Catalog 🔒'),
                        icon: ShoppingBag
                      },
                      { id: 'orders', label: `${t('আমার অর্ডার', 'Resold Orders')} (${myResellerOrders.length})`, icon: Package },
                      { id: 'payouts', label: t('ওয়ালেট ও পেআউট', 'Wallet & Payouts'), icon: Wallet },
                      { id: 'support', label: t('AI ও WhatsApp সাপোর্ট', 'AI & WhatsApp Desk'), icon: MessageCircle },
                      { id: 'profile', label: t('প্রোফাইল সেটিংস', 'Profile Settings'), icon: Settings }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const active = resDashTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setResDashTab(tab.id as any)}
                          className={`px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                            active
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* SUB-TAB 1: OVERVIEW */}
                  {resDashTab === 'overview' && (
                    <div className="space-y-4">
                      {/* 4 Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 tabular-nums">
                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                          <span className="text-[11px] text-slate-500 block">{t('ওয়ালেট ব্যালেন্স', 'Wallet Balance')}</span>
                          <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            ৳{activeReseller.walletBalance.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                          <span className="text-[11px] text-slate-500 block">{t('মোট আয়', 'Total Earnings')}</span>
                          <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono">
                            ৳{activeReseller.totalEarnings.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                          <span className="text-[11px] text-slate-500 block">{t('মোট রিসেল অর্ডার', 'Resold Orders')}</span>
                          <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono">
                            {Math.max(activeReseller.totalOrders, myResellerOrders.length)}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                          <span className="text-[11px] text-slate-500 block">{t('কমিশন হার', 'Margin Rate')}</span>
                          <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono">
                            {activeReseller.commissionPercent}%
                          </span>
                        </div>
                      </div>

                      {/* Reseller Referral Link & Share Toolkit */}
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 space-y-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Link2 className="w-4 h-4 text-emerald-600" />
                            <span>{t('আপনার পার্টনার রেফারেল ও শেয়ার লিংক', 'Your Reseller Store Link')}</span>
                          </h4>
                          <span className="text-[11px] font-mono font-bold text-emerald-600">{activeReseller.resellerCode}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            readOnly
                            value={referralUrl}
                            className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-[11px] text-slate-800 dark:text-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyText('ref-link', referralUrl, t('রেফারেল লিংক কপি হয়েছে!', 'Referral Link Copied!'))
                            }
                            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                          >
                            {copiedId === 'ref-link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{t('লিংক কপি', 'Copy Link')}</span>
                          </button>
                        </div>
                      </div>

                      {/* Quick Action Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => setResDashTab('catalog')}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-500 text-left space-y-1 cursor-pointer"
                        >
                          <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{t('রিসেলার প্রাইস ক্যাটালগ ও অর্ডার', 'Browse Reseller Catalog & Quote Margin')}</span>
                            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {isApprovedReseller
                              ? t('কাস্টমার প্রাইস বসিয়ে সরাসরি ড্যাশবোর্ড থেকে COD অর্ডার করুন।', 'Set custom customer price and place COD orders right inside this dashboard.')
                              : t('অ্যাকাউন্ট অনুমোদন হলে সকল গোপন রিসেলার প্রাইস দেখবেন।', 'Unlocks confidential rates upon admin verification.')}
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setResDashTab('support')}
                          className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/30 hover:border-emerald-500 text-left space-y-1 cursor-pointer"
                        >
                          <p className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                            <span>{t('AI ও WhatsApp রিসেলার সাপোর্ট ডেস্ক', 'AI & WhatsApp Reseller Desk')}</span>
                            <MessageCircle className="w-4 h-4 text-emerald-600" />
                          </p>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                            {t('অ্যাডমিন প্যানেলের WhatsApp চ্যাটে সরাসরি মেসেজ ও AI সাপোর্ট পান।', 'Ask Store AI or send live WhatsApp inquiries to Admin Desk.')}
                          </p>
                        </button>
                      </div>

                      {/* Interactive Reseller Profit & Margin Calculator */}
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-3 text-xs tabular-nums">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calculator className="w-4 h-4 text-emerald-600" />
                          <span>{t('লাইভ রিসেলার প্রফিট ক্যালকুলেটর', 'Reseller Margin & Profit Calculator')}</span>
                        </h4>
                        <div className="grid grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[11px] text-slate-500 mb-1">{t('রিসেলার রেট (৳)', 'Reseller Rate')}</label>
                            <input
                              type="number"
                              min={0}
                              value={calcBasePrice}
                              onChange={(e) => setCalcBasePrice(Number(e.target.value) || 0)}
                              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-500 mb-1">{t('আপনার বিক্রয় মূল্য (৳)', 'Sell Price')}</label>
                            <input
                              type="number"
                              min={0}
                              value={calcSellPrice}
                              onChange={(e) => setCalcSellPrice(Number(e.target.value) || 0)}
                              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-500 mb-1">{t('পরিমাণ', 'Qty')}</label>
                            <input
                              type="number"
                              min={1}
                              value={calcQty}
                              onChange={(e) => setCalcQty(Math.max(1, Number(e.target.value) || 1))}
                              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                          <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                            {t('আপনার সম্ভাব্য নিট প্রফিট:', 'Estimated Net Profit:')}
                          </span>
                          <span className="font-mono font-black text-base text-emerald-700 dark:text-emerald-400">
                            +৳{(Math.max(0, calcSellPrice - calcBasePrice) * calcQty).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: SEARCHABLE MOBILE-FRIENDLY RESELLER CATALOG */}
                  {resDashTab === 'catalog' && (
                    <div className="space-y-3">
                      {!isApprovedReseller ? (
                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center space-y-3">
                          <Lock className="w-8 h-8 text-amber-500 mx-auto" />
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {t('রিসেলার প্রাইস এখনো লক আছে', 'Confidential Reseller Prices Are Locked')}
                          </h4>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">
                            {t(
                              'নিরাপত্তার স্বার্থে কেবল অনুমোদিত রিসেলার অ্যাকাউন্টের জন্যই পাইকারি/রিসেলার প্রাইস প্রদর্শিত হয়।',
                              'Reseller purchase rates remain confidential until an administrator approves your reseller application.'
                            )}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                              <input
                                type="text"
                                value={catSearch}
                                onChange={(e) => setCatSearch(e.target.value)}
                                placeholder={t('পণ্যের নাম বা SKU দিয়ে খুঁজুন...', 'Search product title or SKU...')}
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                              />
                            </div>
                            <select
                              value={catFilter}
                              onChange={(e) => setCatFilter(e.target.value)}
                              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                            >
                              <option value="all">{t('সকল ক্যাটাগরি', 'All Categories')}</option>
                              {categories.filter((c) => c.isActive).map((c) => (
                                <option key={c.id} value={c.slug}>
                                  {lang === 'bn' ? c.nameBn : c.nameEn}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredCatalog.map((p) => {
                              const info = getPartnerPriceInfo(p, 1);
                              const customVal = Number(customQuotes[p.id] || p.price);
                              const customProfit = Math.max(0, customVal - info.unitPrice);
                              const promoCaption = `${lang === 'bn' ? p.titleBn : p.title}\nPrice: ৳${customVal.toLocaleString()}\n64-District Cash on Delivery Available!\nOrder link: ${referralUrl}`;
                              return (
                                <div
                                  key={p.id}
                                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 flex flex-col justify-between gap-3 text-xs tabular-nums"
                                >
                                  <div className="flex items-start gap-3">
                                    {p.images?.[0]?.trim() ? (
                                      <img
                                        src={p.images[0]}
                                        alt={p.title}
                                        referrerPolicy="no-referrer"
                                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shrink-0" />
                                    )}
                                    <div className="min-w-0 flex-1 space-y-1">
                                      <p className="font-bold text-slate-900 dark:text-white line-clamp-2">{lang === 'bn' ? p.titleBn : p.title}</p>
                                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                          Reseller ৳{info.unitPrice.toLocaleString()}
                                        </span>
                                        <span className="text-slate-400">Retail ৳{p.price.toLocaleString()}</span>
                                        <span className="text-amber-600 dark:text-amber-400 font-bold">Stock {p.stock}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] text-slate-500">{t('কাস্টমার রেট:', 'Sell @')}</span>
                                      <input
                                        type="number"
                                        min={info.unitPrice}
                                        value={customQuotes[p.id] ?? p.price}
                                        onChange={(e) =>
                                          setCustomQuotes((prev) => ({ ...prev, [p.id]: e.target.value }))
                                        }
                                        className="w-20 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white text-[11px]"
                                      />
                                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                        +৳{customProfit.toLocaleString()}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 ml-auto">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCopyText(
                                            `cap-${p.id}`,
                                            promoCaption,
                                            t('প্রোমো ক্যাপশন কপি হয়েছে!', 'Ad Caption & Link Copied!')
                                          )
                                        }
                                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                      >
                                        {copiedId === `cap-${p.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                        <span>{t('ক্যাপশন', 'Copy Ad')}</span>
                                      </button>
                                      <button
                                        type="button"
                                        disabled={p.stock <= 0}
                                        onClick={() => handleOpenQuickCustomerOrder(p)}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>{t('কাস্টমার অর্ডার', 'Place Order')}</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* In-Dashboard Quick Order for Customer Drawer / Panel */}
                          {quickOrderProduct && (
                            <form
                              onSubmit={handleSubmitQuickCustomerOrder}
                              className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-3 text-xs animate-fade-in"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 block">
                                    {t('কাস্টমারের জন্য COD অর্ডার প্লেস', 'Place Customer COD Order (Custom Margin)')}
                                  </span>
                                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                    {lang === 'bn' ? quickOrderProduct.titleBn : quickOrderProduct.title}
                                  </h4>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setQuickOrderProduct(null)}
                                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 tabular-nums">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">{t('পরিমাণ', 'Qty')}</label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={Math.max(1, quickOrderProduct.stock)}
                                    value={qoQty}
                                    onChange={(e) => setQoQty(Math.max(1, Number(e.target.value) || 1))}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">{t('কাস্টমার বিক্রয় মূল্য / পিস (৳)', 'Customer Rate / Unit (৳)')}</label>
                                  <input
                                    type="number"
                                    min={getPartnerPriceInfo(quickOrderProduct, qoQty).unitPrice}
                                    value={qoSellPrice}
                                    onChange={(e) => setQoSellPrice(Number(e.target.value) || 0)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                                  />
                                </div>
                                <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 flex flex-col justify-center">
                                  <span className="text-[10px] text-slate-500">{t('আপনার নিট লাভ', 'Your Net Profit')}</span>
                                  <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                                    +৳
                                    {(
                                      Math.max(0, qoSellPrice - getPartnerPriceInfo(quickOrderProduct, qoQty).unitPrice) * qoQty
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <input
                                  type="text"
                                  required
                                  value={qoCustName}
                                  onChange={(e) => setQoCustName(e.target.value)}
                                  placeholder={t('কাস্টমারের নাম *', 'Customer Full Name *')}
                                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                                <input
                                  type="tel"
                                  required
                                  value={qoCustPhone}
                                  onChange={(e) => setQoCustPhone(e.target.value)}
                                  placeholder={t('কাস্টমার মোবাইল নম্বর *', 'Customer Phone (01XXXXXXXXX) *')}
                                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                                />
                                <select
                                  value={qoCustDistrict}
                                  onChange={(e) => setQoCustDistrict(e.target.value)}
                                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                  {BD_DISTRICTS.map((d) => (
                                    <option key={d.name} value={d.name}>{d.name}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={qoCustThana}
                                  onChange={(e) => setQoCustThana(e.target.value)}
                                  placeholder={t('থানা / এরিয়া', 'Thana / Area')}
                                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                                <input
                                  type="text"
                                  required
                                  value={qoCustAddress}
                                  onChange={(e) => setQoCustAddress(e.target.value)}
                                  placeholder={t('পূর্ণ ডেলিভারি ঠিকানা *', 'Full Delivery Address *')}
                                  className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                                <input
                                  type="text"
                                  value={qoNote}
                                  onChange={(e) => setQoNote(e.target.value)}
                                  placeholder={t('নোট (কালার/সাইজ বা নির্দেশনা)', 'Order Note (Color/Size/Instructions)')}
                                  className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={qoSubmitting}
                                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black cursor-pointer disabled:opacity-60"
                              >
                                {qoSubmitting ? t('অর্ডার তৈরি হচ্ছে...', 'Placing Order...') : t('কাস্টমার COD অর্ডার কনফার্ম করুন', 'Confirm & Place Customer COD Order')}
                              </button>
                            </form>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 3: MY RESOLD ORDERS LIVE TRACKER + STATUS FILTERS */}
                  {resDashTab === 'orders' && (
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 space-y-3 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-emerald-600" />
                          <span>{t('আমার রিসেলার অর্ডার ট্র্যাকার', 'My Resold Customer Orders')}</span>
                        </h4>

                        <div className="flex flex-wrap items-center gap-1">
                          {(['all', 'pending', 'processing', 'shipped', 'delivered'] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setResOrderFilter(st)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer ${
                                resOrderFilter === st
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      {filteredResellerOrders.length === 0 ? (
                        <p className="text-slate-500 py-6 text-center">
                          {t('এই ফিল্টারে কোনো রিসেলার অর্ডার নেই।', 'No reseller orders match this filter.')}
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredResellerOrders.map((ord) => (
                            <div key={ord.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 tabular-nums">
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-900 dark:text-white">
                                  #{ord.id} · {ord.customer.name} ({ord.customer.district})
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {ord.items.map((i) => `${i.productTitle} x${i.quantity}`).join(', ')}
                                  {ord.courier?.trackingCode ? ` · Tracking: ${ord.courier.trackingCode}` : ''}
                                </p>
                              </div>
                              <div className="flex flex-wrap sm:flex-col items-center sm:items-end justify-between gap-1.5">
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  Profit +৳{(ord.resellerProfit || 0).toLocaleString()}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {ord.courier?.trackingCode && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCopyText(
                                          `trk-${ord.id}`,
                                          ord.courier?.trackingCode || '',
                                          t('ট্র্যাকিং কোড কপি হয়েছে!', 'Tracking Code Copied!')
                                        )
                                      }
                                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                                    >
                                      {copiedId === `trk-${ord.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                      <span>Track</span>
                                    </button>
                                  )}
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {ord.status} · ৳{ord.pricing.total.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 4: WALLET & PAYOUTS */}
                  {resDashTab === 'payouts' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      <form
                        onSubmit={handlePayoutSubmit}
                        className="lg:col-span-5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3 text-xs"
                      >
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Wallet className="w-4 h-4 text-emerald-600" />
                          <span>{t('টাকা উত্তোলন আবেদন', 'Request Commission Payout')}</span>
                        </h4>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between tabular-nums">
                          <span className="text-slate-500">{t('উত্তোলনযোগ্য ব্যালেন্স:', 'Available Wallet:')}</span>
                          <span className="font-mono font-bold text-emerald-600">৳{activeReseller.walletBalance.toLocaleString()}</span>
                        </div>
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
                          disabled={!isApprovedReseller || activeReseller.walletBalance < resellerCfg.minPayoutBdt}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer disabled:opacity-50"
                        >
                          {t('উইথড্র রিকোয়েস্ট পাঠান', 'Submit Payout Request')}
                        </button>
                      </form>

                      <div className="lg:col-span-7 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 space-y-2.5 text-xs">
                        <h4 className="font-bold text-slate-900 dark:text-white">{t('পেমেন্ট হিস্ট্রি', 'Payout History')}</h4>
                        {myPayouts.length === 0 ? (
                          <p className="text-slate-500 py-4">{t('এখনো কোনো উত্তোলন অনুরোধ নেই।', 'No payout requests yet.')}</p>
                        ) : (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                            {myPayouts.map((pay) => (
                              <div key={pay.id} className="py-2.5 flex items-center justify-between gap-2 tabular-nums">
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
                  )}

                  {/* SUB-TAB 4B: BUILT-IN RESELLER AI + WHATSAPP SUPPORT DESK */}
                  {resDashTab === 'support' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                      <div className="lg:col-span-7 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-3 flex flex-col">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Bot className="w-4 h-4 text-emerald-600" />
                            <span>{t('রিসেলার AI ও ডিরেক্ট WhatsApp সাপোর্ট চ্যাট', 'Reseller AI & Admin WhatsApp Support')}</span>
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            {activeReseller.resellerCode}
                          </span>
                        </div>

                        <div className="flex-1 min-h-[180px] max-h-[260px] overflow-y-auto p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2.5">
                          {supportThread.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">
                              {t(
                                'প্রোডাক্ট রেট, ডেলিভারি চার্জ বা পে-আউট সম্পর্কে AI কে প্রশ্ন করুন অথবা সরাসরি অ্যাডমিনের WhatsApp কনসোলে পাঠান।',
                                'Ask Store AI about margins, COD rates, or dispatch — or click Send to Admin WhatsApp Desk.'
                              )}
                            </p>
                          ) : (
                            supportThread.map((m) => (
                              <div
                                key={m.id}
                                className={`p-2.5 rounded-xl max-w-[90%] ${
                                  m.sender === 'reseller'
                                    ? 'ml-auto bg-emerald-600 text-white'
                                    : m.sender === 'whatsapp'
                                    ? 'ml-auto bg-sky-600 text-white'
                                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                                <div className="flex items-center justify-between gap-2 mt-1 text-[10px] opacity-80">
                                  <span>{m.time}</span>
                                  {m.sender === 'ai' && (
                                    <button
                                      type="button"
                                      onClick={() => speakClearText(m.text, { lang })}
                                      className="inline-flex items-center gap-1 font-bold hover:underline cursor-pointer"
                                    >
                                      <Volume2 className="w-3 h-3" />
                                      <span>{t('শুনুন', 'Listen')}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <form onSubmit={handleAskSupportAi} className="space-y-2">
                          <input
                            type="text"
                            value={supportQuestion}
                            onChange={(e) => setSupportQuestion(e.target.value)}
                            placeholder={t('আপনার প্রশ্ন বা অর্ডার সমস্যা লিখুন...', 'Type your question or reseller support message...')}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="submit"
                              disabled={isAskingSupportAi || !supportQuestion.trim()}
                              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Bot className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{isAskingSupportAi ? t('AI লিখছে...', 'Thinking...') : t('Store AI-কে জিজ্ঞাসা করুন', 'Ask Store AI')}</span>
                            </button>
                            <button
                              type="button"
                              disabled={!supportQuestion.trim()}
                              onClick={() => handleSendResellerWhatsAppToAdmin()}
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{t('অ্যাডমিন WhatsApp ডেস্কে পাঠান', 'Send to Admin WhatsApp Desk')}</span>
                            </button>
                          </div>
                        </form>
                      </div>

                      <div className="lg:col-span-5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3">
                        <h4 className="font-bold text-slate-900 dark:text-white">{t('দ্রুত WhatsApp হেল্পলাইন', 'Direct WhatsApp App & Shortcuts')}</h4>
                        <div className="space-y-2">
                          {[
                            t('আমার রিসেলার একাউন্ট অনুমোদন করুন', 'Please review & approve my reseller account'),
                            t('অর্ডার কুরিয়ার ট্র্যাকিং আপডেট প্রয়োজন', 'Need courier tracking update on my reseller order'),
                            t('পে-আউট ওয়ালেট সেটেলমেন্ট স্ট্যাটাস', 'Check status of my commission payout request')
                          ].map((tpl, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleSendResellerWhatsAppToAdmin(tpl)}
                              className="w-full text-left px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-[11px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                            >
                              {tpl}
                            </button>
                          ))}
                        </div>
                        <a
                          href={supportWaHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{t('সরাসরি WhatsApp অ্যাপ খুলুন', 'Open WhatsApp App Directly')}</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 5: PROFILE, PAYMENT SETTINGS & WHATSAPP SUPPORT */}
                  {resDashTab === 'profile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          updateActiveResellerProfile({
                            name: profName.trim(),
                            district: profDistrict,
                            address: profAddress.trim(),
                            fbPageUrl: profPageUrl.trim(),
                            bkashNumber: profBkash.trim(),
                            nagadNumber: profNagad.trim(),
                            bankDetails: profBank.trim()
                          });
                        }}
                        className="lg:col-span-7 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3"
                      >
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Settings className="w-4 h-4 text-emerald-600" />
                          <span>{t('রিসেলার প্রোফাইল ও পেমেন্ট সেটিংস', 'Profile & Payout Accounts')}</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-slate-500 mb-1">{t('পূর্ণ নাম', 'Full Name')}</label>
                            <input
                              type="text"
                              value={profName}
                              onChange={(e) => setProfName(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">{t('জেলা', 'District')}</label>
                            <select
                              value={profDistrict}
                              onChange={(e) => setProfDistrict(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                              {BD_DISTRICTS.map((d) => (
                                <option key={d.name} value={d.name}>{d.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">{t('বিকাশ নম্বর', 'bKash Number')}</label>
                            <input
                              type="tel"
                              value={profBkash}
                              onChange={(e) => setProfBkash(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">{t('নগদ নম্বর', 'Nagad Number')}</label>
                            <input
                              type="tel"
                              value={profNagad}
                              onChange={(e) => setProfNagad(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-slate-500 mb-1">{t('ফেসবুক পেজ / স্টোর লিংক', 'Facebook Page URL')}</label>
                            <input
                              type="text"
                              value={profPageUrl}
                              onChange={(e) => setProfPageUrl(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-slate-500 mb-1">{t('ব্যাংক / ঠিকানা বিবরণ', 'Address & Bank Transfer Details')}</label>
                            <input
                              type="text"
                              value={profBank || profAddress}
                              onChange={(e) => setProfBank(e.target.value)}
                              placeholder="Bank Name, Branch, Account No..."
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{t('প্রোফাইল সেভ করুন', 'Save Profile')}</span>
                        </button>
                      </form>

                      <div className="lg:col-span-5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 space-y-3">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          <span>{t('রিসেলার WhatsApp ও লাইভ চ্যাট সাপোর্ট', 'Reseller Support Channels')}</span>
                        </h4>
                        <p className="text-slate-500 leading-relaxed">
                          {t(
                            'নতুন আবেদন অনুমোদন, ডেলিভারি ইস্যু বা পে-আউট সহায়তার জন্য সরাসরি মেসেজ করুন।',
                            'Need fast account review, custom bulk rate, or payout assistance? Message our desk anytime.'
                          )}
                        </p>
                        <a
                          href={supportWaHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{t('WhatsApp সাপোর্ট খুলুন', 'Chat on WhatsApp')}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            closePartnerPortal();
                            setIsWhatsAppOpen(true);
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>{t('ওয়েবসাইট লাইভ চ্যাট খুলুন', 'Open Live Support Chat')}</span>
                        </button>
                      </div>
                    </div>
                  )}
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
                    <div className="grid grid-cols-2 gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <button
                        type="button"
                        onClick={() => { setWsAuthMode('register'); setWError(''); }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                          wsAuthMode === 'register'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {t('হোলসেল আবেদন', 'Apply for B2B')}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setWsAuthMode('login'); setWError(''); }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                          wsAuthMode === 'login'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {t('হোলসেল লগইন', 'Wholesale Sign In')}
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
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer disabled:opacity-60"
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

                  {/* Wholesale Tier Progress Bar */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {t('হোলসেল B2B টায়ার সুবিধা', 'Wholesale B2B Tier Progress')}:{' '}
                        <span className="uppercase text-emerald-600">{activeWholesaler.tier}</span>
                      </span>
                      <a
                        href={supportWaHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:underline"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{t('B2B WhatsApp ম্যানেজার', 'Message B2B WhatsApp Desk')}</span>
                      </a>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 tabular-nums">
                      {[
                        { key: 'silver', label: `Silver (${wholesaleCfg.silverDiscountPercent}% Off)` },
                        { key: 'gold', label: `Gold (${wholesaleCfg.goldDiscountPercent}% Off)` },
                        { key: 'platinum', label: `Platinum (${wholesaleCfg.platinumDiscountPercent}% Off)` }
                      ].map((tr) => (
                        <div
                          key={tr.key}
                          className={`p-2 rounded-xl border text-center font-bold text-[11px] ${
                            activeWholesaler.tier === tr.key
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {tr.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trade Catalog with Search & MOQ Quick Add */}
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span>{t('হোলসেল বাল্ক কুইক-অর্ডার ক্যাটালগ', 'Confidential B2B Trade Catalog (MOQ)')}</span>
                      </h4>
                      <input
                        type="text"
                        value={wsSearch}
                        onChange={(e) => setWsSearch(e.target.value)}
                        placeholder={t('পণ্য খুঁজুন...', 'Filter wholesale items...')}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {products
                          .filter(
                            (p) =>
                              p.wholesaleEnabled !== false &&
                              p.stock > 0 &&
                              (!wsSearch.trim() ||
                                p.title.toLowerCase().includes(wsSearch.toLowerCase()) ||
                                p.titleBn.toLowerCase().includes(wsSearch.toLowerCase()))
                          )
                          .slice(0, 25)
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
                                  {p.images?.[0]?.trim() ? (
                                    <img
                                      src={p.images[0]}
                                      alt={p.title}
                                      referrerPolicy="no-referrer"
                                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shrink-0" />
                                  )}
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
