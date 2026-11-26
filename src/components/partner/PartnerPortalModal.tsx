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
  Plus,
  Download,
  Share2,
  CreditCard,
  RotateCcw,
  FileSpreadsheet,
  Award,
  QrCode,
  UserCheck,
  MapPin,
  FileText
} from 'lucide-react';
import QRCode from 'qrcode';
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
    visibleStoreProducts: products,
    categories,
    orders,
    settings,
    activeReseller,
    resellerPayouts,
    resellerTopUps,
    submitResellerTopUp,
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
    updateActiveWholesalerProfile,
    submitWholesaleQuote,
    submitWholesaleDebtPayment,
    convertWholesaleQuoteToOrder,
    activeAffiliate,
    affiliateConversions,
    affiliatePayouts,
    registerAffiliate,
    loginAffiliate,
    logoutAffiliate,
    updateActiveAffiliateProfile,
    requestAffiliatePayout,
    buildAffiliateReferralUrl,
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

  // Reseller Payout & Balance Top-Up Request State
  const [payoutMethod, setPayoutMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [payoutAmount, setPayoutAmount] = useState<number>(500);
  const [topUpMethod, setTopUpMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [topUpAmount, setTopUpAmount] = useState<number>(1000);
  const [topUpSender, setTopUpSender] = useState('');
  const [topUpTrxId, setTopUpTrxId] = useState('');

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

  // Wholesale Catalog, Bulk Sheet Builder, Debt Repayment & Quote State
  const [wsQtys, setWsQtys] = useState<Record<string, number>>({});
  const [wsSearch, setWsSearch] = useState('');
  const [wsBulkSheet, setWsBulkSheet] = useState<{ productId: string; qty: number }[]>([]);
  const [wsBulkPickId, setWsBulkPickId] = useState('');
  const [wsBulkPickQty, setWsBulkPickQty] = useState<number>(10);
  const [wsDebtPayAmount, setWsDebtPayAmount] = useState<string>('');
  const [wsDebtPayNote, setWsDebtPayNote] = useState<string>('');
  const [quoteProductId, setQuoteProductId] = useState<string>('');
  const [quoteCustomProduct, setQuoteCustomProduct] = useState('');
  const [quoteQty, setQuoteQty] = useState<number>(25);
  const [quoteTargetPrice, setQuoteTargetPrice] = useState<string>('');
  const [quoteNotes, setQuoteNotes] = useState('');

  // Affiliate Partner Auth & Workspace State
  const [affAuthMode, setAffAuthMode] = useState<'login' | 'register'>('register');
  const [affIdentifier, setAffIdentifier] = useState('');
  const [affLoginPassword, setAffLoginPassword] = useState('');
  const [affName, setAffName] = useState('');
  const [affPhone, setAffPhone] = useState('');
  const [affEmail, setAffEmail] = useState('');
  const [affDistrict, setAffDistrict] = useState('Dhaka - Inside City');
  const [affChannelUrl, setAffChannelUrl] = useState('');
  const [affBkash, setAffBkash] = useState('');
  const [affPassword, setAffPassword] = useState('');
  const [affError, setAffError] = useState('');
  const [affSubmitting, setAffSubmitting] = useState(false);
  const [affLinkProdId, setAffLinkProdId] = useState<string>('');
  const [affPayMethod, setAffPayMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [affPayAccount, setAffPayAccount] = useState('');
  const [affPayAmount, setAffPayAmount] = useState<number>(500);

  // Partner Workspace Multi-Tabs & Professional Profiles
  const [wsDashTab, setWsDashTab] = useState<'overview' | 'catalog' | 'bulk_sheet' | 'quotes' | 'ledger' | 'profile'>('overview');
  const [affDashTab, setAffDashTab] = useState<'overview' | 'links' | 'promo_kit' | 'conversions' | 'payouts' | 'profile'>('overview');
  const [resQrSvg, setResQrSvg] = useState('');
  const [affQrSvg, setAffQrSvg] = useState('');

  // Wholesale Company Profile Edit State
  const [wsProfCompany, setWsProfCompany] = useState('');
  const [wsProfContact, setWsProfContact] = useState('');
  const [wsProfEmail, setWsProfEmail] = useState('');
  const [wsProfTradeLicense, setWsProfTradeLicense] = useState('');
  const [wsProfDistrict, setWsProfDistrict] = useState('Dhaka - Inside City');
  const [wsProfAddress, setWsProfAddress] = useState('');
  const [wsProfBusinessType, setWsProfBusinessType] = useState<'Retail Shop' | 'Online Store' | 'Corporate' | 'Distributor' | 'Export'>('Retail Shop');
  const [wsProfVolume, setWsProfVolume] = useState('');

  // Affiliate Partner Profile Edit State
  const [affProfName, setAffProfName] = useState('');
  const [affProfEmail, setAffProfEmail] = useState('');
  const [affProfDistrict, setAffProfDistrict] = useState('Dhaka - Inside City');
  const [affProfChannel, setAffProfChannel] = useState('');
  const [affProfBkash, setAffProfBkash] = useState('');
  const [affProfNagad, setAffProfNagad] = useState('');
  const [affProfBank, setAffProfBank] = useState('');

  useEffect(() => {
    if (activeWholesaler) {
      setWsProfCompany(activeWholesaler.companyName || '');
      setWsProfContact(activeWholesaler.contactName || '');
      setWsProfEmail(activeWholesaler.email || '');
      setWsProfTradeLicense(activeWholesaler.tradeLicenseNo || '');
      setWsProfDistrict(activeWholesaler.district || 'Dhaka - Inside City');
      setWsProfAddress(activeWholesaler.address || '');
      setWsProfBusinessType(activeWholesaler.businessType || 'Retail Shop');
      setWsProfVolume(activeWholesaler.monthlyVolumeEstimate || '');
    }
  }, [activeWholesaler?.id]);

  useEffect(() => {
    if (activeAffiliate) {
      setAffProfName(activeAffiliate.name || '');
      setAffProfEmail(activeAffiliate.email || '');
      setAffProfDistrict(activeAffiliate.district || 'Dhaka - Inside City');
      setAffProfChannel(activeAffiliate.channelUrl || '');
      setAffProfBkash(activeAffiliate.bkashNumber || '');
      setAffProfNagad(activeAffiliate.nagadNumber || '');
      setAffProfBank(activeAffiliate.bankDetails || '');
    }
  }, [activeAffiliate?.id]);

  useEffect(() => {
    if (!activeReseller || typeof window === 'undefined') return;
    const url = `${window.location.origin}/?res=${encodeURIComponent(activeReseller.resellerCode)}`;
    QRCode.toString(url, { type: 'svg', margin: 1, width: 140, color: { dark: '#0f172a', light: '#ffffff' } })
      .then((svg) => setResQrSvg(svg))
      .catch(() => {});
  }, [activeReseller?.resellerCode]);

  useEffect(() => {
    if (!activeAffiliate) return;
    const prod = products.find((p) => p.id === affLinkProdId) || null;
    const url = buildAffiliateReferralUrl(prod);
    if (!url) return;
    QRCode.toString(url, { type: 'svg', margin: 1, width: 150, color: { dark: '#0f172a', light: '#ffffff' } })
      .then((svg) => setAffQrSvg(svg))
      .catch(() => {});
  }, [activeAffiliate?.affiliateCode, affLinkProdId, products]);

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

  const handleResellerTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReseller || topUpAmount <= 0 || !topUpTrxId.trim()) return;
    const ok = submitResellerTopUp({
      method: topUpMethod,
      amount: topUpAmount,
      senderNumber: topUpSender.trim() || activeReseller.phone,
      trxId: topUpTrxId.trim().toUpperCase()
    });
    if (ok) {
      setTopUpSender('');
      setTopUpTrxId('');
    }
  };

  const handleDownloadResellerCatalogCsv = () => {
    const header = ['SKU', 'Title', 'TitleBn', 'Category', 'RetailPrice', 'ResellerPrice', 'EstProfit', 'Stock'];
    const rows = filteredCatalog.map((p) => {
      const info = getPartnerPriceInfo(p, 1);
      const profit = Math.max(0, p.price - info.unitPrice);
      return [
        p.sku || p.id,
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${(p.titleBn || '').replace(/"/g, '""')}"`,
        p.category,
        p.price,
        info.unitPrice,
        profit,
        p.stock
      ];
    });
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buyonebd-reseller-catalog-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', t('CSV ক্যাটালগ ডাউনলোড সম্পন্ন!', 'Reseller CSV Catalog Downloaded!'), `${filteredCatalog.length} items`);
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

  const handleAffiliateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAffError('');
    setAffSubmitting(true);
    try {
      if (affAuthMode === 'login') {
        const res = await loginAffiliate(affIdentifier, affLoginPassword);
        if (!res.success) setAffError(res.error || t('লগইন তথ্য সঠিক নয়।', 'Invalid affiliate credentials.'));
      } else {
        if (!affName.trim() || !affPhone.trim() || !affPassword.trim()) {
          setAffError(t('নাম, মোবাইল ও পাসওয়ার্ড দিন।', 'Name, phone and password are required.'));
          return;
        }
        const res = await registerAffiliate({
          name: affName.trim(),
          phone: affPhone.trim(),
          email: affEmail.trim() || `${affPhone.replace(/[^0-9]/g, '')}@aff.buyonebd.com`,
          district: affDistrict,
          channelUrl: affChannelUrl.trim(),
          bkashNumber: affBkash.trim() || affPhone.trim(),
          password: affPassword
        });
        if (!res.success) setAffError(res.error || t('নিবন্ধন ব্যর্থ হয়েছে।', 'Affiliate registration failed.'));
      }
    } finally {
      setAffSubmitting(false);
    }
  };

  const handleAffiliatePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAffiliate) return;
    const ok = requestAffiliatePayout({
      method: affPayMethod,
      accountNumber: affPayAccount.trim() || activeAffiliate.bkashNumber || activeAffiliate.nagadNumber || activeAffiliate.phone,
      amount: affPayAmount
    });
    if (ok) setAffPayAccount('');
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
  const myResellerTopUps = activeReseller
    ? resellerTopUps.filter((tReq) => tReq.resellerId === activeReseller.id)
    : [];
  const myQuotes = activeWholesaler
    ? wholesaleQuotes.filter((q) => q.wholesalerId === activeWholesaler.id)
    : [];
  const myWholesaleOrders = activeWholesaler
    ? orders.filter(
        (o) =>
          o.partnerType === 'wholesale' &&
          (o.wholesaleBuyerId === activeWholesaler.id || o.customer.phone === activeWholesaler.phone)
      )
    : [];
  const myAffiliateConversions = activeAffiliate
    ? affiliateConversions.filter((c) => c.affiliateId === activeAffiliate.id)
    : [];
  const myAffiliatePayouts = activeAffiliate
    ? affiliatePayouts.filter((p) => p.affiliateId === activeAffiliate.id)
    : [];
  const affiliateCfg = settings.affiliateSettings || {
    enabled: true,
    autoApprove: false,
    defaultCommissionPercent: 8,
    minPayoutBdt: 500,
    cookieDays: 30,
    welcomeMsgBn: 'আপনার অ্যাফিলিয়েট লিংক শেয়ার করে প্রতিটি সেল থেকে আজীবন কমিশন আয় করুন!',
    welcomeMsgEn: 'Share your referral link & earn commission on every confirmed order!'
  };

  const isApprovedReseller = Boolean(activeReseller && activeReseller.status === 'approved');
  const referralUrl =
    typeof window !== 'undefined' && activeReseller
      ? `${window.location.origin}/?res=${encodeURIComponent(activeReseller.resellerCode)}`
      : '';
  const supportWaDigits = String(settings.whatsappNumber || '+8801917942662').replace(/[^0-9]/g, '');
  const supportWaHref = activeReseller
    ? `https://wa.me/${supportWaDigits.startsWith('88') ? supportWaDigits : `88${supportWaDigits}`}?text=${encodeURIComponent(
        lang === 'bn'
          ? `আসসালামু আলাইকুম, আমি রিসেলার ${activeReseller.name} (${activeReseller.resellerCode})। আমার রিসেলার একাউন্ট বা অর্ডার বিষয়ে সহায়তা প্রয়োজন।`
          : `Assalamu Alaikum, I am Reseller ${activeReseller.name} (${activeReseller.resellerCode}). I need assistance with my reseller account or orders.`
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

        {/* Mode Switcher Tabs (Reseller / Wholesale / Affiliate) */}
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

          <button
            type="button"
            onClick={() => openPartnerPortal('affiliate')}
            className={`pb-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              partnerPortalTab === 'affiliate'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{t('অ্যাফিলিয়েট পার্টনার', 'Affiliate Program')}</span>
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
                            <button
                              type="button"
                              onClick={handleDownloadResellerCatalogCsv}
                              className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{t('CSV ক্যাটালগ', 'Export CSV')}</span>
                            </button>
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

                  {/* SUB-TAB 4: WALLET, BALANCE TOP-UP, CASH-OUT & LEDGER */}
                  {resDashTab === 'payouts' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Cash-Out / Withdrawal Request */}
                        <form
                          onSubmit={handlePayoutSubmit}
                          className="lg:col-span-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3 text-xs"
                        >
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Wallet className="w-4 h-4 text-emerald-600" />
                            <span>{t('ক্যাশ-আউট / টাকা উত্তোলন আবেদন', 'Cash-Out / Withdraw Commission')}</span>
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
                            {t('ক্যাশ-আউট রিকোয়েস্ট পাঠান', 'Submit Cash-Out Request')}
                          </button>
                        </form>

                        {/* Add Balance via MFS Top-Up */}
                        <form
                          onSubmit={handleResellerTopUpSubmit}
                          className="lg:col-span-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3 text-xs"
                        >
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-sky-600" />
                            <span>{t('ওয়ালেটে ব্যালেন্স যোগ করুন', 'Add Reseller Wallet Balance')}</span>
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {t(
                              `মার্চেন্ট/পার্সোনাল (${settings.paymentSettings?.bkashMerchant || settings.whatsappNumber}) নম্বরে সেন্ড মানি করে TrxID দিন — অনুমোদনের পর ওয়ালেটে যুক্ত হবে।`,
                              `Send Money to ${settings.paymentSettings?.bkashMerchant || settings.whatsappNumber} and enter TrxID below to top up your reseller wallet.`
                            )}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-slate-500 mb-1">{t('পেমেন্ট মাধ্যম', 'Channel')}</label>
                              <select
                                value={topUpMethod}
                                onChange={(e) => setTopUpMethod(e.target.value as any)}
                                className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                              >
                                <option value="bkash">bKash</option>
                                <option value="nagad">Nagad</option>
                                <option value="rocket">Rocket</option>
                                <option value="bank">Bank Deposit</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-slate-500 mb-1">{t('টাকার পরিমাণ (৳)', 'Top-Up Amount (৳)')}</label>
                              <input
                                type="number"
                                min={100}
                                required
                                value={topUpAmount}
                                onChange={(e) => setTopUpAmount(Number(e.target.value) || 0)}
                                className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="tel"
                              value={topUpSender}
                              onChange={(e) => setTopUpSender(e.target.value)}
                              placeholder={t('প্রেরক নম্বর', 'Sender Number')}
                              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                            />
                            <input
                              type="text"
                              required
                              value={topUpTrxId}
                              onChange={(e) => setTopUpTrxId(e.target.value.toUpperCase())}
                              placeholder="TrxID (e.g. BL9K3...)"
                              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono uppercase"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer"
                          >
                            {t('ব্যালেন্স টপ-আপ জমা দিন', 'Submit Balance Top-Up')}
                          </button>
                        </form>
                      </div>

                      {/* History & Wallet Ledger Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 space-y-2.5">
                          <h4 className="font-bold text-slate-900 dark:text-white">{t('ক্যাশ-আউট ও টপ-আপ হিস্ট্রি', 'Cash-Out & Top-Up History')}</h4>
                          {myPayouts.length === 0 && myResellerTopUps.length === 0 ? (
                            <p className="text-slate-500 py-4">{t('এখনো কোনো উত্তোলন বা টপ-আপ নেই।', 'No payout or top-up requests yet.')}</p>
                          ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto tabular-nums">
                              {myResellerTopUps.map((tp) => (
                                <div key={tp.id} className="py-2 flex items-center justify-between gap-2">
                                  <div>
                                    <p className="font-bold text-sky-700 dark:text-sky-400 uppercase">
                                      +TOPUP · {tp.method} ({tp.trxId})
                                    </p>
                                    <p className="text-[11px] text-slate-500">{new Date(tp.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-mono font-bold text-slate-900 dark:text-white">+৳{tp.amount.toLocaleString()}</p>
                                    <span className={`text-[10px] font-bold uppercase ${tp.status === 'approved' ? 'text-emerald-600' : tp.status === 'rejected' ? 'text-rose-500' : 'text-amber-600'}`}>
                                      {tp.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {myPayouts.map((pay) => (
                                <div key={pay.id} className="py-2 flex items-center justify-between gap-2">
                                  <div>
                                    <p className="font-bold text-slate-900 dark:text-white uppercase">
                                      CASHOUT · {pay.method} · {pay.accountNumber}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                      {new Date(pay.createdAt).toLocaleDateString()} {pay.trxId ? `· TrxID: ${pay.trxId}` : ''}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-mono font-bold text-slate-900 dark:text-white">-৳{pay.amount.toLocaleString()}</p>
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

                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 space-y-2.5">
                          <h4 className="font-bold text-slate-900 dark:text-white">{t('অর্ডার প্রফিট লেজার', 'Order Commission Ledger')}</h4>
                          {myResellerOrders.length === 0 ? (
                            <p className="text-slate-500 py-4">{t('কোনো অর্ডার প্রফিট রেকর্ড নেই।', 'No resold order profits recorded yet.')}</p>
                          ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto tabular-nums">
                              {myResellerOrders.map((ord) => (
                                <div key={ord.id} className="py-2 flex items-center justify-between gap-2">
                                  <div>
                                    <p className="font-bold text-slate-900 dark:text-white">#{ord.id} · {ord.customer.name}</p>
                                    <p className="text-[11px] text-slate-500">{new Date(ord.createdAt).toLocaleDateString()} · {ord.status}</p>
                                  </div>
                                  <span className="font-mono font-bold text-emerald-600">+৳{(ord.resellerProfit || 0).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
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

                  {/* SUB-TAB 5: PROFESSIONAL PARTNER PROFILE CARD & PAYMENT SETTINGS */}
                  {resDashTab === 'profile' && (
                    <div className="space-y-4 text-xs">
                      {/* Executive Partner Identity Banner */}
                      <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-lg text-white shrink-0">
                            {(activeReseller.name || 'R').trim().slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-black text-base truncate">{activeReseller.name}</h4>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isApprovedReseller ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                                {isApprovedReseller ? t('ভেরিফাইড রিসেলার', 'Verified Partner') : activeReseller.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                              ID: {activeReseller.resellerCode} · {activeReseller.phone} · {activeReseller.district}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {t('যোগদান:', 'Member since')} {new Date(activeReseller.createdAt).toLocaleDateString()} · Margin Tier {activeReseller.commissionPercent}%
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyText('res-code-card', activeReseller.resellerCode, t('রিসেলার কোড কপি!', 'Reseller Code Copied!'))}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedId === 'res-code-card' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{activeReseller.resellerCode}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const header = ['OrderID', 'Date', 'Customer', 'District', 'Total', 'ResellerProfit', 'Status'];
                              const rows = myResellerOrders.map((o) => [
                                o.id,
                                new Date(o.createdAt).toLocaleDateString(),
                                `"${(o.customer.name || '').replace(/"/g, '""')}"`,
                                `"${(o.customer.district || '').replace(/"/g, '""')}"`,
                                o.pricing.total,
                                o.resellerProfit || 0,
                                o.status
                              ]);
                              const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
                              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `reseller-statement-${activeReseller.resellerCode}.csv`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{t('স্টেটমেন্ট CSV', 'Statement CSV')}</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
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
                            <UserCheck className="w-4 h-4 text-emerald-600" />
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
                            <div>
                              <label className="block text-slate-500 mb-1">{t('পূর্ণ ঠিকানা', 'Address')}</label>
                              <input
                                type="text"
                                value={profAddress}
                                onChange={(e) => setProfAddress(e.target.value)}
                                placeholder="House / Road / Area..."
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-500 mb-1">{t('ব্যাংক একাউন্ট বিবরণ', 'Bank Transfer Details')}</label>
                              <input
                                type="text"
                                value={profBank}
                                onChange={(e) => setProfBank(e.target.value)}
                                placeholder="Bank Name, Branch, A/C No..."
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
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <QrCode className="w-4 h-4 text-emerald-600" />
                              <span>{t('রিসেলার শপ QR ও সাপোর্ট', 'Partner Store QR & Support')}</span>
                            </h4>
                            <span className="text-[10px] font-bold text-emerald-600">{activeReseller.resellerCode}</span>
                          </div>
                          {resQrSvg && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <div className="w-20 h-20 p-1 rounded-lg bg-white border border-slate-200 shrink-0 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: resQrSvg }} />
                              <div className="min-w-0 space-y-1">
                                <p className="font-bold text-slate-900 dark:text-white">{t('পার্সেল ও শপ QR কার্ড', 'Shareable Storefront QR')}</p>
                                <p className="text-[11px] text-slate-500 line-clamp-2">{t('কাস্টমার স্ক্যান করে অর্ডার করলেই আপনার রেফারেল কোড অটো যুক্ত হবে।', 'Customers scanning this QR are attributed to your reseller ID.')}</p>
                              </div>
                            </div>
                          )}
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
                /* Approved Wholesaler B2B Multi-Tab Workspace */
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t('ভেরিফাইড হোলসেল বায়ার', 'Approved Wholesale B2B Account')}</span>
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

                  {/* Mobile-Scrollable B2B Dashboard Navigation */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { id: 'overview', label: t('ওভারভিউ', 'Overview'), icon: TrendingUp },
                      { id: 'catalog', label: t('B2B ট্রেড ক্যাটালগ', 'Trade Catalog'), icon: Package },
                      { id: 'bulk_sheet', label: `${t('বাল্ক শীট', 'Bulk Sheet')} (${wsBulkSheet.length})`, icon: FileSpreadsheet },
                      { id: 'quotes', label: `${t('RFQ কোটেশন', 'RFQ Quotes')} (${myQuotes.length})`, icon: Send },
                      { id: 'ledger', label: t('ক্রেডিট ও অর্ডার', 'Credit & Reorder'), icon: CreditCard },
                      { id: 'profile', label: t('কোম্পানি প্রোফাইল', 'Company Profile'), icon: Building2 }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const active = wsDashTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setWsDashTab(tab.id as any)}
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

                  {wsDashTab === 'overview' && (
                    <div className="space-y-4">
                      {/* 4 B2B Executive Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                          <span className="text-[11px] text-slate-500 block">{t('অবশিষ্ট ক্রেডিট', 'Available Credit')}</span>
                          <span className="text-base sm:text-lg font-bold font-mono text-emerald-600">
                            ৳{Math.max(0, (activeWholesaler.creditLimitBdt || 100000) - (activeWholesaler.creditUsedBdt || 0)).toLocaleString()}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                          <span className="text-[11px] text-slate-500 block">{t('বকেয়া ব্যালেন্স', 'Credit Used / Due')}</span>
                          <span className="text-base sm:text-lg font-bold font-mono text-amber-600">
                            ৳{(activeWholesaler.creditUsedBdt || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                          <span className="text-[11px] text-slate-500 block">{t('মোট B2B অর্ডার', 'B2B Orders')}</span>
                          <span className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
                            {myWholesaleOrders.length}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                          <span className="text-[11px] text-slate-500 block">{t('পেমেন্ট টার্মস', 'Trade Terms')}</span>
                          <span className="text-base sm:text-lg font-bold font-mono text-emerald-600">
                            {activeWholesaler.paymentTerms || 'Net-15'}
                          </span>
                        </div>
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
                                activeWholesaler.tier.toLowerCase() === tr.key
                                  ? 'bg-emerald-600 text-white border-emerald-500'
                                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              {tr.label}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quick Action Shortcuts */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => setWsDashTab('catalog')}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-500 text-left space-y-1 cursor-pointer"
                        >
                          <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{t('MOQ ট্রেড ক্যাটালগ', 'Browse Trade Catalog')}</span>
                            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                          </p>
                          <p className="text-[11px] text-slate-500">{t('সরাসরি স্ল্যাব মূল্যে অর্ডার যোগ করুন।', 'Order volume tiers directly at wholesale rates.')}</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWsDashTab('bulk_sheet')}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-500 text-left space-y-1 cursor-pointer"
                        >
                          <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{t('বাল্ক অর্ডার শীট ও CSV', 'Multi-SKU Order Sheet')}</span>
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          </p>
                          <p className="text-[11px] text-slate-500">{t('একসাথে একাধিক SKU শীট ও এক্সপোর্ট করুন।', 'Build multi-product PO list & export CSV.')}</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWsDashTab('quotes')}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-500 text-left space-y-1 cursor-pointer"
                        >
                          <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{t('কাস্টম কোটেশন (RFQ)', 'Request Custom Quote')}</span>
                            <Send className="w-4 h-4 text-emerald-600" />
                          </p>
                          <p className="text-[11px] text-slate-500">{t('কর্পোরেট ও ডিস্ট্রিবিউটর রেট নেগোশিয়েট করুন।', 'Submit tender/bulk RFQs & convert offers.')}</p>
                        </button>
                      </div>
                    </div>
                  )}

                  {wsDashTab === 'catalog' && (
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
                        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                          {products
                            .filter(
                              (p) =>
                                p.wholesaleEnabled !== false &&
                                p.stock > 0 &&
                                (!wsSearch.trim() ||
                                  p.title.toLowerCase().includes(wsSearch.toLowerCase()) ||
                                  p.titleBn.toLowerCase().includes(wsSearch.toLowerCase()))
                            )
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
                                      <p className="font-bold text-slate-900 dark:text-white truncate">
                                        {lang === 'bn' ? (p.titleBn || p.title) : p.title}
                                      </p>
                                      <p className="text-[11px] text-slate-500">
                                        MOQ: {minQ} {t('পিস', 'pcs')} ·{' '}
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                          B2B ৳{info.unitPrice.toLocaleString()}{t('/পিস', '/unit')}
                                        </span>{' '}
                                        ({t(`খুচরা ৳${p.price.toLocaleString()} · স্টক ${p.stock}`, `Retail ৳${p.price.toLocaleString()} · Stock ${p.stock}`)})
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
                  )}

                  {wsDashTab === 'bulk_sheet' && (
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 space-y-3 text-xs tabular-nums">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          <span>{t('মাল্টি-SKU বাল্ক অর্ডার শীট বিল্ডার', 'Multi-SKU Bulk Order Sheet Builder')}</span>
                        </h4>
                        {wsBulkSheet.length > 0 && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const lines = wsBulkSheet.map((row) => {
                                  const pr = products.find((p) => p.id === row.productId);
                                  if (!pr) return '';
                                  const info = getPartnerPriceInfo(pr, row.qty);
                                  return `${pr.sku || pr.id},"${pr.title.replace(/"/g, '""')}",${row.qty},${info.unitPrice},${info.unitPrice * row.qty}`;
                                }).filter(Boolean);
                                const csv = ['SKU,Product,Qty,B2BUnitPrice,LineTotal', ...lines].join('\n');
                                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `b2b-order-sheet-${Date.now()}.csv`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>CSV Sheet</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                wsBulkSheet.forEach((row) => {
                                  const pr = products.find((p) => p.id === row.productId);
                                  if (pr) addToCart(pr, row.qty);
                                });
                                closePartnerPortal();
                                addToast('success', t('বাল্ক অর্ডার শীট কার্টে যোগ হয়েছে!', 'All Sheet Items Added to Cart!'), `${wsBulkSheet.length} SKUs`);
                              }}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                            >
                              {t('সবগুলো কার্টে যোগ করুন', 'Add All to Cart')}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={wsBulkPickId}
                          onChange={(e) => setWsBulkPickId(e.target.value)}
                          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          <option value="">-- {t('পণ্য বাছাই করুন', 'Pick Catalog SKU')} --</option>
                          {products.filter((p) => p.wholesaleEnabled !== false && p.stock > 0).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.sku || p.id} · {p.title} (MOQ {p.wholesaleMinQty || wholesaleCfg.defaultMinQty || 10})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={1}
                          value={wsBulkPickQty}
                          onChange={(e) => setWsBulkPickQty(Math.max(1, Number(e.target.value) || 1))}
                          className="w-24 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                        />
                        <button
                          type="button"
                          disabled={!wsBulkPickId}
                          onClick={() => {
                            if (!wsBulkPickId) return;
                            setWsBulkSheet((prev) => {
                              const exists = prev.find((x) => x.productId === wsBulkPickId);
                              if (exists) return prev.map((x) => (x.productId === wsBulkPickId ? { ...x, qty: x.qty + wsBulkPickQty } : x));
                              return [...prev, { productId: wsBulkPickId, qty: wsBulkPickQty }];
                            });
                          }}
                          className="px-3 py-2 rounded-lg bg-slate-900 dark:bg-emerald-600 text-white font-bold cursor-pointer disabled:opacity-50"
                        >
                          + {t('শীটে যোগ', 'Add Row')}
                        </button>
                      </div>
                      {wsBulkSheet.length > 0 && (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                          {wsBulkSheet.map((row) => {
                            const pr = products.find((p) => p.id === row.productId);
                            if (!pr) return null;
                            const info = getPartnerPriceInfo(pr, row.qty);
                            return (
                              <div key={row.productId} className="px-3 py-2 flex items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-900/50">
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-slate-900 dark:text-white truncate">{pr.title}</p>
                                  <p className="text-[10px] text-slate-500 font-mono">
                                    {row.qty} pcs × ৳{info.unitPrice.toLocaleString()} = ৳{(info.unitPrice * row.qty).toLocaleString()}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setWsBulkSheet((prev) => prev.filter((x) => x.productId !== row.productId))}
                                  className="text-rose-500 font-bold text-[11px] cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {wsDashTab === 'quotes' && (
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
                        <h4 className="font-bold text-slate-900 dark:text-white">{t('কোটেশন ইতিহাস ও ১-ক্লিক কনভার্সন', 'My Quote Requests & Conversion')}</h4>
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
                                {qt.status === 'quoted' && (
                                  <button
                                    type="button"
                                    onClick={() => convertWholesaleQuoteToOrder(qt.id)}
                                    className="mt-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
                                  >
                                    {t('কোটেশন অর্ডারে কনভার্ট করুন', 'Convert Quote to Order')}
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {wsDashTab === 'ledger' && (
                    <div className="space-y-4">
                      {/* Wholesale Credit Limit & Repayment Tracker */}
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 space-y-3 text-xs tabular-nums">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-emerald-600" />
                            <span>{t('B2B ক্রেডিট লিমিট ও নেট পেমেন্ট টার্মস', 'B2B Trade Credit Line & Due Settlement')}</span>
                          </h4>
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-600/15 text-emerald-700 dark:text-emerald-400">
                            Terms: {activeWholesaler.paymentTerms || 'Net-15'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5">
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-500 block">{t('ক্রেডিট লিমিট', 'Credit Limit')}</span>
                            <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                              ৳{(activeWholesaler.creditLimitBdt || 100000).toLocaleString()}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-500 block">{t('ব্যবহৃত / বকেয়া', 'Current Due')}</span>
                            <span className="font-mono font-bold text-sm text-amber-600">
                              ৳{(activeWholesaler.creditUsedBdt || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-500 block">{t('অবশিষ্ট ক্রেডিট', 'Available Credit')}</span>
                            <span className="font-mono font-bold text-sm text-emerald-600">
                              ৳{Math.max(0, (activeWholesaler.creditLimitBdt || 100000) - (activeWholesaler.creditUsedBdt || 0)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <input
                            type="number"
                            min={1}
                            value={wsDebtPayAmount}
                            onChange={(e) => setWsDebtPayAmount(e.target.value)}
                            placeholder={t('বকেয়া পরিশোধ পরিমাণ (৳)', 'Repayment Amount (৳)')}
                            className="w-40 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                          />
                          <input
                            type="text"
                            value={wsDebtPayNote}
                            onChange={(e) => setWsDebtPayNote(e.target.value)}
                            placeholder={t('ব্যাংক/বিকাশ TrxID...', 'Bank / bKash Ref / TrxID...')}
                            className="flex-1 min-w-[180px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const amt = Number(wsDebtPayAmount) || 0;
                              if (amt <= 0) return;
                              const ok = submitWholesaleDebtPayment(activeWholesaler.id, amt, wsDebtPayNote.trim() || 'B2B Due Settlement');
                              if (ok) {
                                setWsDebtPayAmount('');
                                setWsDebtPayNote('');
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                          >
                            {t('বকেয়া পরিশোধ রেকর্ড', 'Record Repayment')}
                          </button>
                        </div>
                      </div>

                      {/* Quick Reorder Past Wholesale Orders */}
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 space-y-2.5 text-xs tabular-nums">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <RotateCcw className="w-4 h-4 text-emerald-600" />
                          <span>{t('পূর্বের B2B অর্ডার ও ১-ক্লিক রি-অর্ডার', 'B2B Order History & Quick Reorder')}</span>
                        </h4>
                        {myWholesaleOrders.length === 0 ? (
                          <p className="text-slate-500 py-4">{t('কোনো B2B অর্ডার রেকর্ড নেই।', 'No wholesale orders placed yet.')}</p>
                        ) : (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto">
                            {myWholesaleOrders.map((ord) => (
                              <div key={ord.id} className="py-2 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 dark:text-white truncate">
                                    #{ord.id} · {ord.items.map((i) => `${i.productTitle} x${i.quantity}`).join(', ')}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {new Date(ord.createdAt).toLocaleDateString()} · ৳{ord.pricing.total.toLocaleString()} · {ord.status}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    ord.items.forEach((it) => {
                                      const pr = products.find((p) => p.id === it.productId);
                                      if (pr) addToCart(pr, it.quantity, it.selectedColor, it.selectedSize);
                                    });
                                    closePartnerPortal();
                                  }}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shrink-0 cursor-pointer"
                                >
                                  {t('রি-অর্ডার', 'Reorder')}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {wsDashTab === 'profile' && (
                    <div className="space-y-4 text-xs">
                      {/* B2B Corporate Identity Card */}
                      <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-lg text-white shrink-0">
                            {(activeWholesaler.companyName || 'B').trim().slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-black text-base truncate">{activeWholesaler.companyName}</h4>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase">
                                {activeWholesaler.tier} B2B · KYC Verified
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                              {activeWholesaler.contactName} · {activeWholesaler.phone} · {activeWholesaler.businessType}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Trade License: {activeWholesaler.tradeLicenseNo || 'Registered'} · Terms: {activeWholesaler.paymentTerms || 'Net-15'}
                            </p>
                          </div>
                        </div>
                        <a
                          href={supportWaHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 shrink-0"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{t('ডেডিকেটেড B2B ডেস্ক', 'Dedicated B2B Rep')}</span>
                        </a>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          updateActiveWholesalerProfile({
                            companyName: wsProfCompany.trim(),
                            contactName: wsProfContact.trim(),
                            email: wsProfEmail.trim(),
                            tradeLicenseNo: wsProfTradeLicense.trim(),
                            district: wsProfDistrict,
                            address: wsProfAddress.trim(),
                            businessType: wsProfBusinessType,
                            monthlyVolumeEstimate: wsProfVolume.trim()
                          });
                        }}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3"
                      >
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          <span>{t('প্রতিষ্ঠানের তথ্য ও ট্রেড প্রোফাইল আপডেট', 'Edit Corporate & Trade Profile')}</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-500 mb-1">{t('কোম্পানি / প্রতিষ্ঠানের নাম', 'Company / Shop Name')}</label>
                            <input
                              type="text"
                              value={wsProfCompany}
                              onChange={(e) => setWsProfCompany(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">{t('যোগাযোগকারীর নাম', 'Primary Contact Person')}</label>
                            <input
                              type="text"
                              value={wsProfContact}
                              onChange={(e) => setWsProfContact(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">{t('বিজনেস ইমেইল', 'Business Email')}</label>
                            <input
                              type="email"
                              value={wsProfEmail}
                              onChange={(e) => setWsProfEmail(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">{t('ট্রেড লাইসেন্স / NID', 'Trade License No.')}</label>
                            <input
                              type="text"
                              value={wsProfTradeLicense}
                              onChange={(e) => setWsProfTradeLicense(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">{t('ব্যবসার ধরন', 'Business Type')}</label>
                            <select
                              value={wsProfBusinessType}
                              onChange={(e) => setWsProfBusinessType(e.target.value as any)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                              <option value="Retail Shop">Retail Shop</option>
                              <option value="Online Store">Online Store</option>
                              <option value="Corporate">Corporate</option>
                              <option value="Distributor">Distributor</option>
                              <option value="Export">Export</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">{t('জেলা', 'District')}</label>
                            <select
                              value={wsProfDistrict}
                              onChange={(e) => setWsProfDistrict(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                              {BD_DISTRICTS.map((d) => (
                                <option key={d.name} value={d.name}>{d.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">{t('মাসিক অর্ডার ভলিউম', 'Est. Monthly Volume')}</label>
                            <input
                              type="text"
                              value={wsProfVolume}
                              onChange={(e) => setWsProfVolume(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">{t('ডেলিভারি / শোরুম ঠিকানা', 'Showroom / Warehouse Address')}</label>
                            <input
                              type="text"
                              value={wsProfAddress}
                              onChange={(e) => setWsProfAddress(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{t('কোম্পানি প্রোফাইল সেভ করুন', 'Save B2B Profile')}</span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ================= AFFILIATE PARTNER WORKSPACE TAB ================= */}
          {partnerPortalTab === 'affiliate' && (
            <>
              {!affiliateCfg.enabled ? (
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {t('অ্যাফিলিয়েট প্রোগ্রাম সাময়িক বন্ধ রয়েছে।', 'Affiliate program is temporarily paused.')}
                  </p>
                </div>
              ) : !activeAffiliate ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-5 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('BuyOne BD অ্যাফিলিয়েট প্রোগ্রাম — শেয়ার করে আয় করুন', 'Earn Commission Promoting BuyOne BD')}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {lang === 'bn' ? affiliateCfg.welcomeMsgBn : affiliateCfg.welcomeMsgEn}
                    </p>
                    <dl className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs tabular-nums">
                      <div className="flex justify-between">
                        <dt className="text-slate-500">{t('ডিফল্ট কমিশন হার', 'Commission Rate')}</dt>
                        <dd className="font-bold text-emerald-600">{affiliateCfg.defaultCommissionPercent}% per Sale</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">{t('কুকি উইন্ডো', 'Attribution Window')}</dt>
                        <dd className="font-bold text-slate-900 dark:text-white">{affiliateCfg.cookieDays} Days</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">{t('সর্বনিম্ন উইথড্র', 'Min Payout')}</dt>
                        <dd className="font-bold text-slate-900 dark:text-white">৳{affiliateCfg.minPayoutBdt}</dd>
                      </div>
                    </dl>
                  </div>

                  <form onSubmit={handleAffiliateSubmit} className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-2 gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <button
                        type="button"
                        onClick={() => { setAffAuthMode('register'); setAffError(''); }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                          affAuthMode === 'register'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {t('অ্যাফিলিয়েট আবেদন', 'Join Affiliate')}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAffAuthMode('login'); setAffError(''); }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                          affAuthMode === 'login'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {t('অ্যাফিলিয়েট লগইন', 'Affiliate Sign In')}
                      </button>
                    </div>

                    {affError && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
                        {affError}
                      </div>
                    )}

                    {affAuthMode === 'login' ? (
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t('ফোন, ইমেইল বা কোড', 'Phone, Email or Affiliate Code')}
                          </label>
                          <input
                            type="text"
                            required
                            value={affIdentifier}
                            onChange={(e) => setAffIdentifier(e.target.value)}
                            placeholder="01XXXXXXXXX or AFF-XXXX"
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
                            value={affLoginPassword}
                            onChange={(e) => setAffLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('পূর্ণ নাম *', 'Full Name *')}</label>
                          <input
                            type="text"
                            required
                            value={affName}
                            onChange={(e) => setAffName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('মোবাইল নম্বর *', 'Phone *')}</label>
                          <input
                            type="tel"
                            required
                            value={affPhone}
                            onChange={(e) => setAffPhone(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('ইমেইল', 'Email')}</label>
                          <input
                            type="email"
                            value={affEmail}
                            onChange={(e) => setAffEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('YouTube / FB / TikTok চ্যানেল', 'Social / Blog Channel URL')}</label>
                          <input
                            type="text"
                            value={affChannelUrl}
                            onChange={(e) => setAffChannelUrl(e.target.value)}
                            placeholder="https://youtube.com/@channel"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('বিকাশ / পেআউট নম্বর', 'bKash Payout Number')}</label>
                          <input
                            type="tel"
                            value={affBkash}
                            onChange={(e) => setAffBkash(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('জেলা', 'District')}</label>
                          <select
                            value={affDistrict}
                            onChange={(e) => setAffDistrict(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          >
                            {BD_DISTRICTS.map((d) => (
                              <option key={d.name} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('পাসওয়ার্ড *', 'Password *')}</label>
                          <input
                            type="password"
                            required
                            value={affPassword}
                            onChange={(e) => setAffPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={affSubmitting}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer disabled:opacity-60"
                    >
                      {affSubmitting
                        ? t('অপেক্ষা করুন...', 'Processing...')
                        : affAuthMode === 'login'
                        ? t('অ্যাফিলিয়েট ড্যাশবোর্ডে প্রবেশ করুন', 'Sign In to Affiliate Workspace')
                        : t('অ্যাফিলিয়েট অ্যাকাউন্ট তৈরি করুন', 'Create Affiliate Account')}
                    </button>
                  </form>
                </div>
              ) : (
                /* Active Affiliate Multi-Tab Workspace */
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold">
                        {activeAffiliate.status === 'approved' ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{t('ভেরিফাইড অ্যাফিলিয়েট সক্রিয়', 'Verified Affiliate Active')}</span>
                          </span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{t('অ্যাডমিন অনুমোদনের অপেক্ষায়', `Status: ${activeAffiliate.status}`)}</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {activeAffiliate.name} · <span className="font-mono text-emerald-600">{activeAffiliate.affiliateCode}</span>
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={logoutAffiliate}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('সাইন আউট', 'Sign Out')}</span>
                    </button>
                  </div>

                  {/* Mobile-Scrollable Affiliate Workspace Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { id: 'overview', label: t('ওভারভিউ', 'Overview'), icon: TrendingUp },
                      { id: 'links', label: t('লিংক ও QR কোড', 'Links & QR'), icon: QrCode },
                      { id: 'promo_kit', label: t('প্রোমো ক্যাপশন কিট', 'Promo Kit'), icon: Share2 },
                      { id: 'conversions', label: `${t('কনভার্সন', 'Conversions')} (${myAffiliateConversions.length})`, icon: FileText },
                      { id: 'payouts', label: t('উইথড্র ও পেআউট', 'Payouts'), icon: Wallet },
                      { id: 'profile', label: t('প্রোফাইল সেটিংস', 'Profile'), icon: UserCheck }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const active = affDashTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setAffDashTab(tab.id as any)}
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

                  {affDashTab === 'overview' && (
                    <div className="space-y-4">
                      {/* 4 KPI Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                          <span className="text-[11px] text-slate-500 block">{t('ওয়ালেট ব্যালেন্স', 'Available Wallet')}</span>
                          <span className="text-lg font-bold font-mono text-emerald-600">৳{activeAffiliate.walletBalance.toLocaleString()}</span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                          <span className="text-[11px] text-slate-500 block">{t('মোট আয়', 'Lifetime Earnings')}</span>
                          <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">৳{activeAffiliate.totalEarnings.toLocaleString()}</span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                          <span className="text-[11px] text-slate-500 block">{t('রেফার্ড অর্ডার / ক্লিক', 'Orders / Clicks')}</span>
                          <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                            {activeAffiliate.totalOrders} / {activeAffiliate.clicksCount}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                          <span className="text-[11px] text-slate-500 block">{t('কমিশন ও কুকি উইন্ডো', 'Rate & Cookie')}</span>
                          <span className="text-lg font-bold font-mono text-emerald-600">
                            {activeAffiliate.commissionPercent}% · {affiliateCfg.cookieDays}d
                          </span>
                        </div>
                      </div>

                      {/* Quick Referral Deep-Link Strip */}
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Link2 className="w-4 h-4 text-emerald-600" />
                            <span>{t('আপনার প্রাইমারি অ্যাফিলিয়েট লিংক', 'Your Main Tracking Referral Link')}</span>
                          </h4>
                          <span className="font-mono text-[11px] font-bold text-emerald-600">{activeAffiliate.affiliateCode}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            readOnly
                            value={buildAffiliateReferralUrl(null)}
                            className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-[11px] text-slate-800 dark:text-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleCopyText('aff-home', buildAffiliateReferralUrl(null), t('অ্যাফিলিয়েট লিংক কপি হয়েছে!', 'Referral Link Copied!'))}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                          >
                            {copiedId === 'aff-home' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{t('লিংক কপি', 'Copy Link')}</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => setAffDashTab('links')}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-500 text-left space-y-1 cursor-pointer"
                        >
                          <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{t('প্রোডাক্ট ডিপ-লিংক ও QR', 'Product Links & QR')}</span>
                            <QrCode className="w-4 h-4 text-emerald-600" />
                          </p>
                          <p className="text-[11px] text-slate-500">{t('যেকোনো পণ্যের লিংক ও QR কোড তৈরি করুন।', 'Generate tracking links & downloadable QR stickers.')}</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAffDashTab('promo_kit')}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-500 text-left space-y-1 cursor-pointer"
                        >
                          <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{t('রেডি সোশ্যাল প্রোমো কিট', 'Ready Social Promo Kit')}</span>
                            <Share2 className="w-4 h-4 text-emerald-600" />
                          </p>
                          <p className="text-[11px] text-slate-500">{t('FB, TikTok, YouTube ভিডিও ক্যাপশন ১-ক্লিকে কপি করুন।', 'Copy localized hooks with your affiliate link.')}</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAffDashTab('profile')}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-500 text-left space-y-1 cursor-pointer"
                        >
                          <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{t('ক্রিয়েটর প্রোফাইল ও পেমেন্ট', 'Creator Profile & MFS')}</span>
                            <UserCheck className="w-4 h-4 text-emerald-600" />
                          </p>
                          <p className="text-[11px] text-slate-500">{t('চ্যানেল লিংক ও বিকাশ/নগদ অ্যাকাউন্ট আপডেট করুন।', 'Update payout accounts & creator details.')}</p>
                        </button>
                      </div>
                    </div>
                  )}

                  {affDashTab === 'links' && (
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 space-y-4 text-xs">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Share2 className="w-4 h-4 text-emerald-600" />
                        <span>{t('অ্যাফিলিয়েট ডিপ-লিংক ও QR কোড জেনারেটর', 'Product Deep-Link & Scannable QR Studio')}</span>
                      </h4>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={affLinkProdId}
                          onChange={(e) => setAffLinkProdId(e.target.value)}
                          className="sm:w-64 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          <option value="">{t('হোমপেজ / স্টোর লিংক', 'Store Homepage Link')}</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.title} (৳{p.price})</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          readOnly
                          value={buildAffiliateReferralUrl(products.find((p) => p.id === affLinkProdId) || null)}
                          className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-[11px] text-slate-800 dark:text-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyText(
                              'aff-link',
                              buildAffiliateReferralUrl(products.find((p) => p.id === affLinkProdId) || null),
                              t('অ্যাফিলিয়েট লিংক কপি হয়েছে!', 'Affiliate Link Copied!')
                            )
                          }
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        >
                          {copiedId === 'aff-link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{t('লিংক কপি', 'Copy Link')}</span>
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        {affQrSvg && (
                          <div className="w-28 h-28 p-2 rounded-xl bg-white border border-slate-200 shrink-0 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: affQrSvg }} />
                        )}
                        <div className="space-y-2 flex-1">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {t('স্ক্যানযোগ্য অ্যাফিলিয়েট QR স্টিকার', 'Scannable Affiliate QR Sticker')}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {t('আপনার ভিডিও কর্নার, ইউটিউব স্ক্রিন অথবা ইনস্টাগ্রাম স্টোরিতে এই QR কোড ব্যবহার করুন।', 'Use this QR in video overlays, Shorts, Reels, or offline flyers.')}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (!affQrSvg) return;
                                const blob = new Blob([affQrSvg], { type: 'image/svg+xml;charset=utf-8' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `aff-qr-${activeAffiliate.affiliateCode}.svg`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{t('QR SVG ডাউনলোড', 'Download QR SVG')}</span>
                            </button>
                            <a
                              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildAffiliateReferralUrl(products.find((p) => p.id === affLinkProdId) || null))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center gap-1.5"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Share Facebook</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {affDashTab === 'promo_kit' && (() => {
                    const picked = products.find((p) => p.id === affLinkProdId) || products[0];
                    const link = buildAffiliateReferralUrl(picked || null);
                    const pTitle = picked ? (lang === 'bn' ? picked.titleBn : picked.title) : settings.storeName;
                    const pPrice = picked ? `৳${picked.price.toLocaleString()}` : 'Best Offer';
                    const kits = [
                      {
                        id: 'fb-hook',
                        title: t('ফেসবুক পেজ ও গ্রুপ পোস্ট ক্যাপশন', 'Facebook Feed & Groups Promo Hook'),
                        text:
                          lang === 'bn'
                            ? `🔥 অরিজিনাল ${pTitle} এখন মাত্র ${pPrice}!\n✅ ১ টাকাও অগ্রিম ছাড়াই ৬৪ জেলায় ক্যাশ অন ডেলিভারি।\n✅ প্রোডাক্ট হাতে পেয়ে চেক করে পেমেন্ট করুন।\n👉 সরাসরি অর্ডার করতে লিংকে ক্লিক করুন:\n${link}`
                            : `🔥 Original ${pTitle} now only ${pPrice}!\n✅ Cash on Delivery across all 64 districts of Bangladesh.\n✅ Check the product before paying at your doorstep.\n👉 Order directly via my verified link:\n${link}`
                      },
                      {
                        id: 'yt-tt',
                        title: t('TikTok ও YouTube Shorts পিনড কমেন্ট / বায়ো', 'YouTube / TikTok Video Pinned Link Script'),
                        text:
                          lang === 'bn'
                            ? `অরিজিনাল ${pTitle} (${pPrice}) এখন বাংলাদেশের ৬৪ জেলায় ক্যাশ অন ডেলিভারিতে পাওয়া যাচ্ছে!\nআমার ভেরিফাইড পার্টনার লিংক থেকে অর্ডার করুন: ${link}\n#BuyOneBD #BangladeshShopping #COD`
                            : `Original ${picked?.title || 'Gadget'} (${pPrice}) with 64-District Cash on Delivery in Bangladesh!\nOrder fast using my verified partner link: ${link}\n#BuyOneBD #BangladeshShopping #COD`
                      },
                      {
                        id: 'wa-status',
                        title: t('WhatsApp স্ট্যাটাস ও ইনবক্স মেসেজ', 'WhatsApp Status & Friend Share Copy'),
                        text:
                          lang === 'bn'
                            ? `ভাইয়া/আপু, ${pTitle} নিতে চাইলে সরাসরি এই ভেরিফাইড লিংক থেকে নিতে পারেন — দাম মাত্র ${pPrice} আর ডেলিভারি একদম ফাস্ট (COD আছে): ${link}`
                            : `Hi! Check out ${pTitle} at ${pPrice} with fast nationwide Cash on Delivery in Bangladesh: ${link}`
                      }
                    ];
                    return (
                      <div className="space-y-3 text-xs">
                        {kits.map((kit) => (
                          <div key={kit.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="font-bold text-slate-900 dark:text-white">{kit.title}</h5>
                              <button
                                type="button"
                                onClick={() => handleCopyText(kit.id, kit.text, t('প্রোমো ক্যাপশন কপি!', 'Promo Hook Copied!'))}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                {copiedId === kit.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span>{t('কপি করুন', 'Copy')}</span>
                              </button>
                            </div>
                            <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 whitespace-pre-line font-mono text-[11px]">
                              {kit.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {affDashTab === 'conversions' && (
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 space-y-3 text-xs">
                      <h4 className="font-bold text-slate-900 dark:text-white">{t('রেফার্ড অর্ডার ও কমিশন কনভার্সন লগ', 'Referred Conversions Ledger')}</h4>
                      {myAffiliateConversions.length === 0 ? (
                        <p className="text-slate-500 py-6 text-center">{t('এখনো কোনো রেফারেল অর্ডার হয়নি। লিংক শেয়ার শুরু করুন!', 'No referral conversions yet. Share your link to start earning.')}</p>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto tabular-nums">
                          {myAffiliateConversions.map((conv) => (
                            <div key={conv.id} className="py-2.5 flex items-center justify-between gap-2">
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">Order #{conv.orderId} · {conv.customerName}</p>
                                <p className="text-[11px] text-slate-500">Order ৳{conv.orderTotal.toLocaleString()} ({conv.commissionPercent}%)</p>
                              </div>
                              <span className="font-mono font-bold text-emerald-600">+৳{conv.commissionAmount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {affDashTab === 'payouts' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                      <form
                        onSubmit={handleAffiliatePayoutSubmit}
                        className="lg:col-span-5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3"
                      >
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Wallet className="w-4 h-4 text-emerald-600" />
                          <span>{t('কমিশন উইথড্র আবেদন', 'Withdraw Affiliate Earnings')}</span>
                        </h4>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between tabular-nums">
                          <span className="text-slate-500">{t('ব্যালেন্স:', 'Available:')}</span>
                          <span className="font-mono font-bold text-emerald-600">৳{activeAffiliate.walletBalance.toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={affPayMethod}
                            onChange={(e) => setAffPayMethod(e.target.value as any)}
                            className="px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          >
                            <option value="bkash">bKash</option>
                            <option value="nagad">Nagad</option>
                            <option value="rocket">Rocket</option>
                            <option value="bank">Bank</option>
                          </select>
                          <input
                            type="number"
                            min={affiliateCfg.minPayoutBdt}
                            value={affPayAmount}
                            onChange={(e) => setAffPayAmount(Number(e.target.value) || 0)}
                            className="px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                        <input
                          type="text"
                          value={affPayAccount}
                          onChange={(e) => setAffPayAccount(e.target.value)}
                          placeholder={activeAffiliate.bkashNumber || activeAffiliate.phone}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                        <button
                          type="submit"
                          disabled={activeAffiliate.status !== 'approved' || activeAffiliate.walletBalance < affiliateCfg.minPayoutBdt}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer disabled:opacity-50"
                        >
                          {t('পে-আউট রিকোয়েস্ট পাঠান', 'Submit Payout Request')}
                        </button>
                      </form>

                      <div className="lg:col-span-7 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white">{t('পে-আউট হিস্ট্রি', 'Payout Log')}</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const header = ['OrderID', 'Customer', 'OrderTotal', 'Commission', 'Status'];
                              const rows = myAffiliateConversions.map((c) => [c.orderId, `"${c.customerName}"`, c.orderTotal, c.commissionAmount, 'credited']);
                              const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
                              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `affiliate-statement-${activeAffiliate.affiliateCode}.csv`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>CSV</span>
                          </button>
                        </div>
                        {myAffiliatePayouts.length === 0 ? (
                          <p className="text-slate-500 py-4">{t('এখনো কোনো পে-আউট আবেদন নেই।', 'No payout requests submitted yet.')}</p>
                        ) : (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto tabular-nums">
                            {myAffiliatePayouts.map((pay) => (
                              <div key={pay.id} className="py-2 flex items-center justify-between gap-2">
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white uppercase">PAYOUT · {pay.method} · {pay.accountNumber}</p>
                                  <p className="text-[11px] text-slate-500">{new Date(pay.createdAt).toLocaleDateString()} {pay.trxId ? `· ${pay.trxId}` : ''}</p>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono font-bold text-slate-900 dark:text-white block">-৳{pay.amount.toLocaleString()}</span>
                                  <span className="text-[10px] font-bold uppercase text-emerald-600">{pay.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {affDashTab === 'profile' && (
                    <div className="space-y-4 text-xs">
                      {/* Creator / Affiliate Executive Identity Card */}
                      <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-lg text-white shrink-0">
                            {(activeAffiliate.name || 'A').trim().slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-black text-base truncate">{activeAffiliate.name}</h4>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase">
                                {activeAffiliate.commissionPercent}% Partner · {activeAffiliate.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                              {activeAffiliate.affiliateCode} · {activeAffiliate.phone} · {activeAffiliate.district || 'Bangladesh'}
                            </p>
                            {activeAffiliate.channelUrl && (
                              <p className="text-[10px] text-emerald-300 truncate mt-0.5">{activeAffiliate.channelUrl}</p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText('aff-code-card', activeAffiliate.affiliateCode, t('কোড কপি!', 'Affiliate Code Copied!'))}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          {copiedId === 'aff-code-card' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{activeAffiliate.affiliateCode}</span>
                        </button>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          updateActiveAffiliateProfile({
                            name: affProfName.trim(),
                            email: affProfEmail.trim(),
                            district: affProfDistrict,
                            channelUrl: affProfChannel.trim(),
                            bkashNumber: affProfBkash.trim(),
                            nagadNumber: affProfNagad.trim(),
                            bankDetails: affProfBank.trim()
                          });
                        }}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3"
                      >
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span>{t('অ্যাফিলিয়েট প্রোফাইল ও পেমেন্ট সেটিংস', 'Affiliate Profile & Payout Accounts')}</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-500 mb-1">{t('পূর্ণ নাম', 'Full Name')}</label>
                            <input
                              type="text"
                              value={affProfName}
                              onChange={(e) => setAffProfName(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">{t('ইমেইল', 'Email Address')}</label>
                            <input
                              type="email"
                              value={affProfEmail}
                              onChange={(e) => setAffProfEmail(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">{t('জেলা', 'District')}</label>
                            <select
                              value={affProfDistrict}
                              onChange={(e) => setAffProfDistrict(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                              {BD_DISTRICTS.map((d) => (
                                <option key={d.name} value={d.name}>{d.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">{t('ইউটিউব / ফেসবুক চ্যানেল URL', 'Creator Channel / Blog URL')}</label>
                            <input
                              type="text"
                              value={affProfChannel}
                              onChange={(e) => setAffProfChannel(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">{t('বিকাশ নম্বর', 'bKash Payout Number')}</label>
                            <input
                              type="tel"
                              value={affProfBkash}
                              onChange={(e) => setAffProfBkash(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">{t('নগদ নম্বর', 'Nagad Number')}</label>
                            <input
                              type="tel"
                              value={affProfNagad}
                              onChange={(e) => setAffProfNagad(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-slate-500 mb-1">{t('ব্যাংক ট্রান্সফার তথ্য', 'Bank Account Details (Optional)')}</label>
                            <input
                              type="text"
                              value={affProfBank}
                              onChange={(e) => setAffProfBank(e.target.value)}
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
                          <span>{t('অ্যাফিলিয়েট প্রোফাইল সেভ করুন', 'Save Affiliate Profile')}</span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
