import React, { useState, useMemo } from 'react';
import {
  Globe2,
  Save,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Calculator,
  Send,
  Link2,
  Users,
  Edit,
  Trash2,
  Activity,
  ShieldAlert,
  Award,
  Zap,
  QrCode,
  Printer,
  Download
} from 'lucide-react';
import QRCode from 'qrcode';
import { useStore } from '../../context/StoreContext';
import { BulkSmsCampaignLog } from '../../types';
import { BulkSectionShell } from './BulkSectionShell';

export const GlobalMarketingHub: React.FC = () => {
  const {
    settings,
    updateSettings,
    saveSettingsChanges,
    products,
    orders,
    users,
    customerAccounts,
    resellers,
    wholesalers,
    affiliates,
    waitlistEntries,
    bulkSmsLogs,
    serverPixelEvents,
    trackPixelEvent,
    dispatchBulkSmsCampaign,
    updateBulkSmsLog,
    deleteBulkSmsLog,
    addToast,
    adminLang
  } = useStore();

  const [editingSmsLogId, setEditingSmsLogId] = useState<string | null>(null);
  const [editSmsLogTitle, setEditSmsLogTitle] = useState('');
  const [editSmsLogMsg, setEditSmsLogMsg] = useState('');

  // QR Poster & Parcel Coupon Insert Generator
  const [qrProductId, setQrProductId] = useState<string>('store_home');
  const [qrCouponCode, setQrCouponCode] = useState<string>('REPEAT50');
  const [qrHeadline, setQrHeadline] = useState<string>('ধন্যবাদ অর্ডারের জন্য! পরের অর্ডারে ৫০ টাকা ছাড়');
  const [qrSubtext, setQrSubtext] = useState<string>('স্ক্যান করে সরাসরি স্টোর ভিজিট করুন অথবা WhatsApp-এ অর্ডার করুন');
  const [qrSvgMarkup, setQrSvgMarkup] = useState<string>('');

  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://buyonebd.com';

  const qrTargetUrl = useMemo(() => {
    if (qrProductId === 'store_home') {
      return `${origin}/?utm_source=parcel_qr&coupon=${encodeURIComponent(qrCouponCode.trim() || 'REPEAT50')}`;
    }
    return `${origin}/product/${encodeURIComponent(qrProductId)}?utm_source=parcel_qr&coupon=${encodeURIComponent(qrCouponCode.trim() || 'REPEAT50')}`;
  }, [origin, qrProductId, qrCouponCode]);

  React.useEffect(() => {
    let active = true;
    QRCode.toString(qrTargetUrl, {
      type: 'svg',
      margin: 1,
      width: 180,
      color: { dark: '#0f172a', light: '#ffffff' }
    })
      .then((svg) => {
        if (active) setQrSvgMarkup(svg);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [qrTargetUrl]);

  const handlePrintQrInsert = () => {
    const win = window.open('', '_blank', 'width=720,height=640');
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>Parcel Insert — ${settings.storeName}</title><style>
      body{font-family:system-ui,-apple-system,sans-serif;padding:28px;color:#0f172a;background:#fff}
      .card{max-width:460px;margin:0 auto;border:2px dashed #059669;border-radius:18px;padding:24px;text-align:center}
      .brand{font-weight:900;font-size:20px;color:#059669;margin-bottom:6px}
      .headline{font-weight:800;font-size:16px;margin:8px 0}
      .sub{font-size:12px;color:#475569;margin-bottom:16px}
      .qr{display:inline-block;padding:12px;border:1px solid #cbd5e1;border-radius:12px;background:#fff}
      .coupon{margin-top:14px;display:inline-block;padding:6px 14px;border-radius:8px;background:#ecfdf5;border:1px solid #10b981;font-family:monospace;font-weight:900;font-size:15px;color:#047857}
      .foot{margin-top:14px;font-size:11px;color:#64748b}
    </style></head><body><div class="card">
      <div class="brand">${settings.storeName}</div>
      <div class="headline">${qrHeadline}</div>
      <div class="sub">${qrSubtext}</div>
      <div class="qr">${qrSvgMarkup}</div>
      <div><span class="coupon">CODE: ${qrCouponCode || 'REPEAT50'}</span></div>
      <div class="foot">Hotline / WhatsApp: ${settings.whatsappNumber || settings.hotline}<br/>${qrTargetUrl}</div>
    </div><script>window.onload=function(){window.print()}</script></body></html>`);
    win.document.close();
  };

  const handleDownloadQrSvg = () => {
    if (!qrSvgMarkup) return;
    const blob = new Blob([qrSvgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buyonebd-qr-${qrProductId}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const gmCfg = settings.globalMarketingSettings || {
    defaultExportCurrency: 'BDT' as const,
    exchangeRates: {
      USD: 120,
      GBP: 152,
      EUR: 130,
      AED: 32.7,
      SAR: 32,
      MYR: 26.8
    },
    probashiShippingEnabled: true,
    smsGatewayProvider: 'ssl_wireless' as const,
    smsApiKey: '',
    smsSenderId: 'BUYONEBD',
    googleMerchantFeedEnabled: true,
    metaCatalogFeedEnabled: true,
    tiktokShopSyncEnabled: true,
    defaultUtmSource: 'facebook',
    defaultUtmMedium: 'cpc'
  };

  const patchGm = (partial: Partial<typeof gmCfg>) => {
    updateSettings({
      globalMarketingSettings: {
        ...gmCfg,
        ...partial
      }
    });
  };

  const [copiedFeed, setCopiedFeed] = useState<string | null>(null);

  // Bulk SMS Composer
  const [smsTitle, setSmsTitle] = useState('Weekend COD Flash Sale Alert');
  const [smsSegment, setSmsSegment] = useState<BulkSmsCampaignLog['segment']>('all_customers');
  const [smsBody, setSmsBody] = useState(
    'BuyOne BD: Flat 20% OFF on Smart Gadgets + 64-district Cash on Delivery! Order today or call +8801917942662.'
  );
  const [isSendingSms, setIsSendingSms] = useState(false);

  // AI RFM Smart Audience & Campaign Generator
  const [rfmGoal, setRfmGoal] = useState('Flash Weekend COD Offer & VIP Repeat Reactivation');
  const [isGeneratingRfm, setIsGeneratingRfm] = useState(false);
  const [rfmData, setRfmData] = useState<{
    segments?: {
      vipRepeatCount?: number;
      singleOrderCount?: number;
      resellerCount?: number;
      topProductTitle?: string;
    };
    campaign?: {
      headline?: string;
      smsCopy?: string;
      whatsappBroadcast?: string;
      offerAngle?: string;
      targetAudience?: string;
    };
  } | null>(null);

  // Global AI Ad & Reel Copy Studio
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || '');
  const [targetRegion, setTargetRegion] = useState('UK/USA Probashi Gift Buyers (Deliver in Bangladesh)');
  const [targetCurrency, setTargetCurrency] = useState<'BDT' | 'USD' | 'GBP' | 'EUR' | 'AED' | 'SAR' | 'MYR'>('USD');
  const [adFormat, setAdFormat] = useState<'facebook' | 'tiktok' | 'whatsapp' | 'seo'>('facebook');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [aiResult, setAiResult] = useState<{ headline: string; body: string; cta: string; hashtags: string } | null>(null);

  // UTM Builder
  const [utmSource, setUtmSource] = useState('facebook');
  const [utmMedium, setUtmMedium] = useState('paid_social');
  const [utmCampaign, setUtmCampaign] = useState('bd_cod_2026');

  // BD COD Return-Adjusted ROAS Calculator
  const [calcSellPrice, setCalcSellPrice] = useState(1450);
  const [calcCogs, setCalcCogs] = useState(750);
  const [calcCpa, setCalcCpa] = useState(210);
  const [calcCourier, setCalcCourier] = useState(110);
  const [calcReturnRate, setCalcReturnRate] = useState(12);

  const handleRunRfmMarketing = async () => {
    setIsGeneratingRfm(true);
    try {
      const res = await fetch('/api/ai/marketing/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: rfmGoal,
          orders,
          products,
          customerAccounts,
          resellers,
          lang: adminLang
        })
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        setRfmData(data);
        addToast('success', at('AI RFM সেগমেন্ট ও ক্যাম্পেইন তৈরি!', 'AI RFM Audience & Campaign Ready'), data.campaign?.headline || '');
      } else {
        addToast('error', 'AI RFM Failed', data?.error || 'Could not generate campaign.');
      }
    } catch (err: any) {
      addToast('error', 'Network Error', err?.message || 'Failed to reach /api/ai/marketing/campaign');
    } finally {
      setIsGeneratingRfm(false);
    }
  };

  const segmentRecipients = useMemo(() => {
    const phoneSet = new Set<string>();
    if (smsSegment === 'all_customers') {
      orders.forEach((o) => o.customer?.phone && phoneSet.add(o.customer.phone.trim()));
      users.forEach((u) => u.phone && phoneSet.add(u.phone.trim()));
      resellers.forEach((r) => r.phone && phoneSet.add(r.phone.trim()));
    } else if (smsSegment === 'dhaka') {
      orders
        .filter((o) => String(o.customer?.district || '').toLowerCase().includes('dhaka'))
        .forEach((o) => o.customer?.phone && phoneSet.add(o.customer.phone.trim()));
    } else if (smsSegment === 'outside_dhaka') {
      orders
        .filter((o) => !String(o.customer?.district || '').toLowerCase().includes('dhaka'))
        .forEach((o) => o.customer?.phone && phoneSet.add(o.customer.phone.trim()));
    } else if (smsSegment === 'resellers') {
      resellers.forEach((r) => r.phone && phoneSet.add(r.phone.trim()));
    } else if (smsSegment === 'wholesalers') {
      wholesalers.filter((w) => w.status === 'approved').forEach((w) => w.phone && phoneSet.add(w.phone.trim()));
    } else if (smsSegment === 'waitlist') {
      waitlistEntries
        .filter((w) => w.contactType === 'phone')
        .forEach((w) => w.contact && phoneSet.add(w.contact.trim()));
    }
    return Array.from(phoneSet);
  }, [smsSegment, orders, users, resellers, wholesalers, waitlistEntries]);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFeed(key);
      setTimeout(() => setCopiedFeed(null), 1800);
    } catch {}
  };

  const handleDispatchSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsBody.trim()) return;
    setIsSendingSms(true);
    try {
      await dispatchBulkSmsCampaign({
        title: smsTitle.trim() || 'BD SMS Broadcast',
        segment: smsSegment,
        recipients: segmentRecipients.length > 0 ? segmentRecipients : ['01917942662'],
        message: smsBody.trim()
      });
    } finally {
      setIsSendingSms(false);
    }
  };

  const handleGenerateGlobalAd = async () => {
    const prod = products.find((p) => p.id === selectedProdId) || products[0];
    if (!prod) return;
    setIsGeneratingCopy(true);
    try {
      const rateFromBdtPerUnit =
        targetCurrency === 'BDT' ? 1 : gmCfg.exchangeRates[targetCurrency] || 120;
      const convertedPrice =
        targetCurrency === 'BDT'
          ? prod.price
          : Math.max(1, Number((prod.price / rateFromBdtPerUnit).toFixed(2)));
      const res = await fetch('/api/ai/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: adFormat === 'tiktok' ? 'reel_script' : adFormat,
          productTitle: prod.title,
          price: prod.price,
          category: prod.category,
          targetRegion,
          currency: targetCurrency,
          convertedPrice,
          lang: adminLang
        })
      });
      const data = await res.json();
      if (data?.ok && data.result) {
        setAiResult({
          headline: data.result.headline || data.headline || '',
          body: data.result.body || data.adCopy || '',
          cta: data.result.cta || data.subtext || 'Buy Now · Cash on Delivery · +8801917942662',
          hashtags: data.result.hashtags || data.keywords || ''
        });
      } else {
        addToast('error', 'AI Copy Failed', data?.error || 'Could not generate campaign copy.');
      }
    } catch (err: any) {
      addToast('error', 'Network Error', err?.message || 'Could not reach AI marketing route.');
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  // BD COD Return-Adjusted ROAS Calculator
  const deliveryRate = Math.max(0.05, (100 - calcReturnRate) / 100);
  const netRevenuePerAttempt = calcSellPrice * deliveryRate;
  const totalCostPerAttempt = calcCogs * deliveryRate + calcCpa + calcCourier;
  const netProfitPerOrder = Math.round(netRevenuePerAttempt - totalCostPerAttempt);
  const effectiveRoas = calcCpa > 0 ? (netRevenuePerAttempt / calcCpa).toFixed(2) : '0.00';

  const [testingCapiEvent, setTestingCapiEvent] = useState<string | null>(null);
  const [districtFilter, setDistrictFilter] = useState<'all' | 'high_risk' | 'safe'>('all');

  const handleFireTestCapiEvent = async (
    evName: 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase'
  ) => {
    setTestingCapiEvent(evName);
    try {
      const sampleProd = products.find((p) => p.id === selectedProdId) || products[0];
      const res = await trackPixelEvent(evName, {
        urlPath: sampleProd ? `/product/${sampleProd.id}` : '/',
        value: sampleProd ? sampleProd.price : 1490,
        contentName: sampleProd ? sampleProd.title : 'BuyOne BD Featured Product'
      });
      if (res) {
        addToast('success', at(`${evName} ইভেন্ট পাঠানো হয়েছে!`, `${evName} Test Event Fired!`), `${res.contentName || ''} (৳${res.value || 0})`);
      }
    } finally {
      setTestingCapiEvent(null);
    }
  };

  const BD_FESTIVE_TEMPLATES = [
    {
      id: 'bkash_cashback',
      badge: 'bKash / Nagad Cashback',
      title: 'bKash 10% Instant Cashback Weekend',
      smsBn: 'BuyOne BD: বিকাশ/নগদে পেমেন্ট করলেই পাচ্ছেন ১০% ইনস্ট্যান্ট ক্যাশব্যাক + ফ্রি ঢাকা ডেলিভারি! আজই কিনুন: ' + origin,
      waCopy: '🔥 *বিকাশ ও নগদ ১০% ক্যাশব্যাক অফার!*\n\nBuyOne BD থেকে পছন্দের গ্যাজেট ও ফ্যাশন পণ্য বিকাশে পেমেন্ট করে নিন *১০% ছাড়* ও দ্রুত হোম ডেলিভারি!\n👉 ' + origin + '\n📞 +8801917942662'
    },
    {
      id: 'eid_mega',
      badge: 'Eid-ul-Fitr / Eid-ul-Adha',
      title: 'Eid Mega COD Sale Alert',
      smsBn: 'ঈদ মোবারক! BuyOne BD-তে চলছে ঈদ মেগা সেল — ৪০% পর্যন্ত ছাড় ও ৬৪ জেলায় ক্যাশ অন ডেলিভারি। কোড: EID2026 | ' + origin,
      waCopy: '🌙 *ঈদ মেগা সেল — ৪০% পর্যন্ত ছাড়!*\n\nঈদের সেরা গ্যাজেট, ওয়াচ ও গিফট আইটেম স্টক শেষ হওয়ার আগেই অর্ডার করুন। কूपন *EID2026* ব্যবহারে ফ্রি ডেলিভারি!\n🛒 ' + origin
    },
    {
      id: 'pohela_boishakh',
      badge: 'Pohela Boishakh 1433',
      title: 'Boishakhi Noboborsho Offer',
      smsBn: 'শুভ নববর্ষ! বৈশাখী অফারে BuyOne BD দিচ্ছে প্রতিটি অর্ডারে ১৪৩৳ ক্যাশব্যাক ও সারপ্রাইজ স্পিন গিফট। ভিজিট: ' + origin,
      waCopy: '🪷 *শুভ নববর্ষ! বৈশাখী স্পেশাল অফার!*\n\nBuyOne BD-তে প্রতিটি অর্ডারে ১৪৩৳ ছাড় + লাকি স্পিনে জিতে নিন ওয়ালেট বোনাস!\n👉 ' + origin
    },
    {
      id: 'cod_winback',
      badge: 'Weekend COD Flash',
      title: '64-District COD Flash Clearance',
      smsBn: 'BuyOne BD: শুধুমাত্র আজকের জন্য ১ টাকাও অগ্রিম ছাড়া সারাদেশে ক্যাশ অন ডেলিভারি! স্টক সীমিত। কল: +8801917942662',
      waCopy: '⚡ *২৪ ঘণ্টার ফ্ল্যাশ ক্লিয়ারেন্স সেল!*\n\nঅগ্রিম টাকা ছাড়াই ৬৪ জেলায় ক্যাশ অন ডেলিভারি! পছন্দের পণ্য হাতে পেয়ে টাকা দিন।\n👉 ' + origin
    }
  ];

  // 64-District RTO Return-Risk Optimizer
  const districtRtoStats = useMemo(() => {
    const map = new Map<string, { district: string; total: number; delivered: number; returned: number; pending: number; codTotal: number }>();
    orders.forEach((o) => {
      const dist = (o.customer?.district || 'Dhaka - Inside City').trim();
      const row = map.get(dist) || { district: dist, total: 0, delivered: 0, returned: 0, pending: 0, codTotal: 0 };
      row.total += 1;
      if (o.status === 'delivered') row.delivered += 1;
      else if (o.status === 'cancelled' || (o.courier?.status || '').toLowerCase().includes('return')) row.returned += 1;
      else row.pending += 1;
      if (o.payment.method === 'cod') row.codTotal += 1;
      map.set(dist, row);
    });
    return Array.from(map.values())
      .map((r) => {
        const riskPct = r.total > 0 ? Math.round((r.returned / r.total) * 100) : 0;
        const level: 'safe' | 'moderate' | 'high_risk' = riskPct >= 25 ? 'high_risk' : riskPct >= 12 ? 'moderate' : 'safe';
        return { ...r, riskPct, level };
      })
      .sort((a, b) => b.total - a.total);
  }, [orders]);

  const filteredRtoDistricts = districtRtoStats.filter((d) => {
    if (districtFilter === 'high_risk') return d.level === 'high_risk' || d.level === 'moderate';
    if (districtFilter === 'safe') return d.level === 'safe';
    return true;
  });

  // Influencer / Promo Coupon / Affiliate Attribution Tracker
  const attributionRows = useMemo(() => {
    const rows: { sourceType: 'Coupon' | 'Affiliate' | 'Reseller'; code: string; label: string; ordersCount: number; revenue: number; paidOrders: number }[] = [];
    const couponMap = new Map<string, { count: number; rev: number; delivered: number }>();
    const affMap = new Map<string, { count: number; rev: number; delivered: number }>();
    const resMap = new Map<string, { count: number; rev: number; delivered: number }>();

    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      const noteCouponMatch = o.customer.note?.match(/(?:Coupon|Code)\s*[:=]\s*([A-Z0-9_-]+)/i)?.[1];
      const detectedCoupon = noteCouponMatch || (o.pricing.discount > 0 ? 'PROMO-DISCOUNT' : '');
      if (detectedCoupon) {
        const key = detectedCoupon.toUpperCase();
        const cur = couponMap.get(key) || { count: 0, rev: 0, delivered: 0 };
        cur.count += 1;
        cur.rev += o.pricing.total;
        if (o.status === 'delivered') cur.delivered += 1;
        couponMap.set(key, cur);
      }
      if (o.affiliateCode) {
        const key = o.affiliateCode.toUpperCase();
        const cur = affMap.get(key) || { count: 0, rev: 0, delivered: 0 };
        cur.count += 1;
        cur.rev += o.pricing.total;
        if (o.status === 'delivered') cur.delivered += 1;
        affMap.set(key, cur);
      }
      if (o.resellerCode) {
        const key = o.resellerCode.toUpperCase();
        const cur = resMap.get(key) || { count: 0, rev: 0, delivered: 0 };
        cur.count += 1;
        cur.rev += o.pricing.total;
        if (o.status === 'delivered') cur.delivered += 1;
        resMap.set(key, cur);
      }
    });

    couponMap.forEach((val, code) => rows.push({ sourceType: 'Coupon', code, label: 'Promo Code', ordersCount: val.count, revenue: val.rev, paidOrders: val.delivered }));
    affMap.forEach((val, code) => {
      const aff = affiliates.find((a) => a.affiliateCode?.toUpperCase() === code);
      rows.push({ sourceType: 'Affiliate', code, label: aff?.name || 'Affiliate Partner', ordersCount: val.count, revenue: val.rev, paidOrders: val.delivered });
    });
    resMap.forEach((val, code) => {
      const res = resellers.find((r) => r.resellerCode?.toUpperCase() === code);
      rows.push({ sourceType: 'Reseller', code, label: res?.name || 'Reseller Partner', ordersCount: val.count, revenue: val.rev, paidOrders: val.delivered });
    });

    return rows.sort((a, b) => b.revenue - a.revenue);
  }, [orders, affiliates, resellers]);

  const merchantXmlUrl = `${origin}/api/feeds/google-merchant.xml`;
  const metaCsvUrl = `${origin}/api/feeds/meta-catalog.csv`;
  const utmBuiltUrl = `${origin}/?utm_source=${encodeURIComponent(utmSource)}&utm_medium=${encodeURIComponent(utmMedium)}&utm_campaign=${encodeURIComponent(utmCampaign)}`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-emerald-400" />
            <span>{at('গ্লোবাল-ফর-বাংলাদেশ মার্কেটিং ইঞ্জিন', 'Worldwide-for-Bangladesh Marketing Engine')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {at(
              'Google Merchant XML, Meta Catalog CSV, বিডি বাল্ক SMS, প্রবাসী Multi-Currency ক্যাম্পেইন এবং COD ROAS ক্যালকুলেটর।',
              'Live product feeds, Bangladesh Bulk SMS dispatch, Probashi multi-currency AI ads, and COD profit analytics.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            saveSettingsChanges(
              at('মার্কেটিং সেটিংস সংরক্ষিত!', 'Global Marketing Saved!'),
              at('সকল ফিড, কারেন্সি ও SMS গেটওয়ে সেভ করা হয়েছে।', 'Feed, currency & SMS configuration committed.')
            )
          }
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{at('মার্কেটিং সেটিংস সেভ করুন', 'Save Marketing Config')}</span>
        </button>
      </div>

      {/* 1. Live Google Merchant & Meta Catalog Feeds + UTM Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-white">{at('লাইভ ক্যাটালগ ফিড (Google Shopping ও Meta Dynamic Ads)', 'Live Global Catalog Feeds')}</h4>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Google Merchant Center XML Feed</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy('xml', merchantXmlUrl)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedFeed === 'xml' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                  <a
                    href="/api/feeds/google-merchant.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1"
                  >
                    <span>Test XML</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <p className="font-mono text-[11px] text-emerald-400 break-all">{merchantXmlUrl}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Meta / Facebook & Instagram Catalog CSV</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy('csv', metaCsvUrl)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedFeed === 'csv' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                  <a
                    href="/api/feeds/meta-catalog.csv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1"
                  >
                    <span>Download CSV</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <p className="font-mono text-[11px] text-sky-400 break-all">{metaCsvUrl}</p>
            </div>
          </div>
        </div>

        {/* UTM Builder */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Link2 className="w-4 h-4 text-emerald-400" />
            <span>{at('ক্যাম্পেইন UTM লিংক বিল্ডার', 'Campaign UTM Link Builder')}</span>
          </h4>
          <div className="space-y-2.5">
            <input
              type="text"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              placeholder="Source (e.g. facebook, tiktok, google)"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
            <input
              type="text"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
              placeholder="Medium (e.g. paid_social, reels, sms)"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
            <input
              type="text"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              placeholder="Campaign Name"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 break-all">
            {utmBuiltUrl}
          </div>
          <button
            type="button"
            onClick={() => handleCopy('utm', utmBuiltUrl)}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copiedFeed === 'utm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFeed === 'utm' ? 'Copied UTM Link' : 'Copy Campaign URL'}</span>
          </button>
        </div>
      </div>

      {/* 2. Bangladesh Bulk SMS Broadcast + Gateway Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <BulkSectionShell
            indexCode="BULK // BD SMS"
            title={at('বাংলাদেশ বাল্ক SMS ক্যাম্পেইন', 'Bangladesh Bulk SMS Composer & History')}
            subtitle={at('কাস্টমার, রিসেলার বা হোলসেল বায়ারদের জন্য SMS পাঠান এবং পূর্বের ক্যাম্পেইন এডিট/রিলোড/ডিলিট করুন।', 'Dispatch BD bulk SMS campaigns and edit, reload, or delete saved campaign logs.')}
            totalCount={bulkSmsLogs.length}
            accent="emerald"
            headerActions={
              <span className="font-mono text-[11px] font-bold text-emerald-300 tabular-nums px-2 py-1 rounded border border-emerald-500/40 bg-emerald-950/50">
                {segmentRecipients.length} RECIPIENTS READY
              </span>
            }
          >
            <form onSubmit={handleDispatchSms} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">{at('ক্যাম্পেইন নাম', 'Campaign Name')}</label>
                  <input
                    type="text"
                    value={smsTitle}
                    onChange={(e) => setSmsTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">{at('টার্গেট সেগমেন্ট', 'Audience Segment')}</label>
                  <select
                    value={smsSegment}
                    onChange={(e) => setSmsSegment(e.target.value as BulkSmsCampaignLog['segment'])}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  >
                    <option value="all_customers">All Customers & Resellers</option>
                    <option value="dhaka">Dhaka City & Metro Buyers</option>
                    <option value="outside_dhaka">Outside Dhaka (Nationwide)</option>
                    <option value="resellers">Registered Resellers</option>
                    <option value="wholesalers">Approved Wholesale Buyers</option>
                    <option value="waitlist">Stock Waitlist Phone Leads</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <label className="font-bold">{at('SMS বার্তা (বাংলা / ইংরেজি)', 'SMS Message')}</label>
                  <span className="font-mono tabular-nums">{smsBody.length} chars (~৳{Math.round(Math.max(1, segmentRecipients.length) * 0.45)} est.)</span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={smsBody}
                  onChange={(e) => setSmsBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingSms}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black inline-flex items-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingSms ? at('পাঠানো হচ্ছে...', 'Dispatching...') : at('SMS ক্যাম্পেইন পাঠান', 'Dispatch Bulk SMS')}</span>
              </button>

              {bulkSmsLogs.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    {at('সকল SMS ক্যাম্পেইন লগ', 'All SMS Campaign Logs')} ({bulkSmsLogs.length})
                  </p>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/80 rounded-lg border border-slate-800 bg-slate-900/60">
                    {bulkSmsLogs.map((log) =>
                      editingSmsLogId === log.id ? (
                        <div key={log.id} className="p-2.5 space-y-2 text-[11px] bg-slate-900">
                          <input
                            type="text"
                            value={editSmsLogTitle}
                            onChange={(e) => setEditSmsLogTitle(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white font-bold"
                          />
                          <textarea
                            rows={2}
                            value={editSmsLogMsg}
                            onChange={(e) => setEditSmsLogMsg(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingSmsLogId(null)}
                              className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-bold cursor-pointer"
                            >
                              {at('বাতিল', 'Cancel')}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                updateBulkSmsLog(log.id, {
                                  title: editSmsLogTitle.trim() || log.title,
                                  message: editSmsLogMsg.trim() || log.message
                                });
                                setEditingSmsLogId(null);
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold cursor-pointer"
                            >
                              {at('সেভ', 'Save')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div key={log.id} className="px-3 py-2 flex items-center justify-between gap-2 text-[11px] tabular-nums hover:bg-slate-900">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-white truncate">{log.title}</p>
                            <p className="text-[10px] text-slate-400 truncate">{log.message}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-emerald-400 font-mono whitespace-nowrap">
                              {log.recipientCount} sent · ৳{log.estimatedCostBdt}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSmsTitle(log.title);
                                setSmsSegment(log.segment);
                                setSmsBody(log.message);
                                setEditingSmsLogId(log.id);
                                setEditSmsLogTitle(log.title);
                                setEditSmsLogMsg(log.message);
                              }}
                              title={at('এডিট / কম্পোজারে লোড', 'Edit & Load into Composer')}
                              className="p-1 rounded bg-slate-800 hover:bg-amber-600 text-amber-300 hover:text-white cursor-pointer"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBulkSmsLog(log.id)}
                              title={at('লগ মুছুন', 'Delete Log')}
                              className="p-1 rounded bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </form>
          </BulkSectionShell>
        </div>

        {/* SMS Gateway + Multi-Currency Rates */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
          <h4 className="text-sm font-bold text-white">{at('BD SMS গেটওয়ে ও প্রবাসী কারেন্সি', 'BD SMS Gateway & Global Currencies')}</h4>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-400 font-bold mb-1">SMS Gateway</label>
              <select
                value={gmCfg.smsGatewayProvider}
                onChange={(e) => patchGm({ smsGatewayProvider: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="ssl_wireless">SSL Wireless</option>
                <option value="bulksmsbd">BulkSMSBD</option>
                <option value="greenweb">GreenWeb BD</option>
                <option value="twilio">Twilio Global</option>
                <option value="custom">Custom HTTP Gateway</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Masking Sender ID</label>
              <input
                type="text"
                value={gmCfg.smsSenderId}
                onChange={(e) => patchGm({ smsSenderId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">SMS API Key / Token</label>
            <input
              type="password"
              value={gmCfg.smsApiKey || ''}
              onChange={(e) => patchGm({ smsApiKey: e.target.value })}
              placeholder="Enter BD SMS gateway API key..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
          <label className="flex items-center gap-2 pt-1 text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={gmCfg.probashiShippingEnabled}
              onChange={(e) => patchGm({ probashiShippingEnabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
            <span>{at('প্রবাসী গিফট ডেলিভারি প্রমোশন (UK/US/Middle East → Bangladesh)', 'Enable Probashi Gift-to-Bangladesh Campaigns')}</span>
          </label>
        </div>
      </div>

      {/* 3. Global AI Ad / Reel Script Studio + BD COD ROAS Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{at('AI গ্লোবাল ও প্রবাসী অ্যাড / রিলস স্ক্রিপ্ট জেনারেটর', 'Global & Probashi AI Ad / Reel Generator')}</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <select
              value={selectedProdId}
              onChange={(e) => setSelectedProdId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            <select
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            >
              <option value="BDT">BDT (৳)</option>
              <option value="USD">USD ($ · ৳{gmCfg.exchangeRates.USD})</option>
              <option value="GBP">GBP (£ · ৳{gmCfg.exchangeRates.GBP})</option>
              <option value="EUR">EUR (€ · ৳{gmCfg.exchangeRates.EUR})</option>
              <option value="AED">AED (د.إ · ৳{gmCfg.exchangeRates.AED})</option>
              <option value="SAR">SAR (﷼ · ৳{gmCfg.exchangeRates.SAR})</option>
              <option value="MYR">MYR (RM · ৳{gmCfg.exchangeRates.MYR})</option>
            </select>
            <select
              value={adFormat}
              onChange={(e) => setAdFormat(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            >
              <option value="facebook">Facebook / IG Feed Ad</option>
              <option value="tiktok">TikTok / Reels Hook Script</option>
              <option value="whatsapp">WhatsApp / Probashi Broadcast</option>
              <option value="seo">Google Search Meta & Copy</option>
            </select>
          </div>
          <input
            type="text"
            value={targetRegion}
            onChange={(e) => setTargetRegion(e.target.value)}
            placeholder="Target Audience (e.g. UK Bangladeshi Expat Gift Buyers)"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
          />
          <button
            type="button"
            onClick={handleGenerateGlobalAd}
            disabled={isGeneratingCopy}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black cursor-pointer disabled:opacity-60"
          >
            {isGeneratingCopy ? at('তৈরি হচ্ছে...', 'Generating Copy...') : at('গ্লোবাল ক্যাম্পেইন কপি তৈরি করুন', 'Generate Global Campaign Copy')}
          </button>

          {aiResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <p className="font-bold text-emerald-400">{aiResult.headline}</p>
              <p className="text-slate-200 whitespace-pre-line leading-relaxed">{aiResult.body}</p>
              <p className="text-[11px] text-amber-300 font-semibold">CTA: {aiResult.cta}</p>
              <p className="text-[11px] text-sky-400 font-mono">{aiResult.hashtags}</p>
            </div>
          )}
        </div>

        {/* COD ROAS Calculator */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs tabular-nums">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>{at('BD COD রিটার্ন-অ্যাডজাস্টেড ROAS ক্যালকুলেটর', 'BD COD Return-Adjusted Profit Calculator')}</span>
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-400 mb-1">Sell Price (৳)</label>
              <input
                type="number"
                value={calcSellPrice}
                onChange={(e) => setCalcSellPrice(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Product Cost (৳)</label>
              <input
                type="number"
                value={calcCogs}
                onChange={(e) => setCalcCogs(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Ad Cost / Order (CPA ৳)</label>
              <input
                type="number"
                value={calcCpa}
                onChange={(e) => setCalcCpa(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Courier + RTO Fee (৳)</label>
              <input
                type="number"
                value={calcCourier}
                onChange={(e) => setCalcCourier(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Estimated Courier Return Rate: {calcReturnRate}%</label>
            <input
              type="range"
              min={0}
              max={45}
              value={calcReturnRate}
              onChange={(e) => setCalcReturnRate(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-slate-400 block">Delivered Net Profit</span>
              <span className={`text-lg font-bold font-mono ${netProfitPerOrder >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ৳{netProfitPerOrder.toLocaleString()} / order
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Effective ROAS</span>
              <span className="text-lg font-bold font-mono text-white">{effectiveRoas}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. AI RFM Smart Audience Segmenter & Campaign Generator */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>{at('AI RFM কাস্টমার সেগমেন্টেশন ও স্মার্ট ক্যাম্পেইন', 'AI RFM Audience Segmenter & Smart Campaign Studio')}</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {at(
                'VIP রিপিট কাস্টমার, ১-বার ক্রেতা ও রিসেলার ডাটা বিশ্লেষণ করে AI দিয়ে হাই-কনভার্টিং SMS ও WhatsApp ক্যাম্পেইন তৈরি করুন',
                'Analyze live order RFM segments (VIP repeat buyers, single-order shoppers, active resellers) & generate 1-click SMS/WhatsApp campaigns'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunRfmMarketing}
            disabled={isGeneratingRfm}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isGeneratingRfm ? at('বিশ্লেষণ হচ্ছে...', 'Analyzing RFM...') : at('AI অডিয়েন্স ও ক্যাম্পেইন তৈরি করুন', 'Analyze RFM & Generate Campaign')}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={rfmGoal}
            onChange={(e) => setRfmGoal(e.target.value)}
            placeholder={at('ক্যাম্পেইনের লক্ষ্য লিখুন (যেমন: ঈদ / উইকেন্ড ফ্ল্যাশ সেল)...', 'Campaign goal (e.g. Weekend Flash COD Deal, Reactivate VIP Shoppers)...')}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
          />
        </div>

        {rfmData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
            <div className="lg:col-span-4 grid grid-cols-2 gap-2.5 tabular-nums">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">VIP Repeat Shoppers</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{rfmData.segments?.vipRepeatCount ?? 0}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">1-Order COD Ready</span>
                <span className="text-lg font-black text-sky-400 font-mono">{rfmData.segments?.singleOrderCount ?? 0}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Active Resellers</span>
                <span className="text-lg font-black text-amber-400 font-mono">{rfmData.segments?.resellerCount ?? resellers.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Top Moving Item</span>
                <span className="text-[11px] font-bold text-white line-clamp-2">{rfmData.segments?.topProductTitle || products[0]?.title || 'Storefront'}</span>
              </div>
            </div>

            {rfmData.campaign && (
              <div className="lg:col-span-8 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-emerald-400">{rfmData.campaign.headline}</p>
                  {rfmData.campaign.targetAudience && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-semibold">
                      {rfmData.campaign.targetAudience}
                    </span>
                  )}
                </div>
                {rfmData.campaign.offerAngle && (
                  <p className="text-[11px] text-amber-300 font-semibold">{rfmData.campaign.offerAngle}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">SMS Broadcast Copy</span>
                    <p className="text-slate-200 leading-relaxed">{rfmData.campaign.smsCopy}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSmsTitle(rfmData.campaign?.headline || 'AI Smart SMS');
                        setSmsBody(rfmData.campaign?.smsCopy || smsBody);
                        addToast('success', at('SMS বক্সে লোড হয়েছে!', 'Loaded into SMS Composer'), '');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                    >
                      {at('বাল্ক SMS বক্সে ব্যবহার করুন', 'Load into Bulk SMS')}
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">WhatsApp Broadcast Copy</span>
                    <p className="text-slate-200 leading-relaxed">{rfmData.campaign.whatsappBroadcast}</p>
                    <button
                      type="button"
                      onClick={() => handleCopy('rfm-wa', rfmData.campaign?.whatsappBroadcast || '')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedFeed === 'rfm-wa' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{at('হোয়াটসঅ্যাপ কপি', 'Copy Broadcast')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. BANGLADESH MARKETING SUITE SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 5A. Meta CAPI & TikTok Live Event Tester */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span>{at('Meta CAPI ও TikTok পিক্সেল লাইভ টেস্টার', 'Meta CAPI & TikTok Live Event Tester')}</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                {at('সার্ভার-সাইড ট্র্যাকিং ইভেন্ট টেস্ট করুন এবং সর্বশেষ ইভেন্ট লগ দেখুন', 'Fire live CAPI events & inspect /api/tracking/pixel responses')}
              </p>
            </div>
            <span className="text-[10px] font-mono text-sky-300 bg-sky-950/60 border border-sky-700/50 px-2 py-0.5 rounded">
              {serverPixelEvents.length} Logged
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'] as const).map((ev) => (
              <button
                key={ev}
                type="button"
                disabled={testingCapiEvent === ev}
                onClick={() => handleFireTestCapiEvent(ev)}
                className="px-2.5 py-2 rounded-xl bg-slate-950 hover:bg-sky-950/60 border border-slate-800 hover:border-sky-600/60 text-sky-300 font-bold text-[11px] cursor-pointer disabled:opacity-50"
              >
                {testingCapiEvent === ev ? '...' : `Test ${ev}`}
              </button>
            ))}
          </div>

          <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 divide-y divide-slate-800/80">
            {serverPixelEvents.length === 0 ? (
              <p className="p-4 text-center text-slate-500">{at('এখনও কোনো সার্ভার পিক্সেল ইভেন্ট নেই। উপরের টেস্ট বাটন চাপুন।', 'No server events yet. Fire a test event above.')}</p>
            ) : (
              serverPixelEvents.slice(0, 8).map((ev) => (
                <div key={ev.id} className="px-3 py-2 flex items-center justify-between gap-2 text-[11px]">
                  <div className="min-w-0">
                    <span className="font-bold text-white">{ev.eventName}</span>
                    <span className="ml-2 font-mono text-slate-400">{ev.urlPath}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    {ev.value ? <span className="text-emerald-400">৳{ev.value}</span> : null}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${ev.status === 'sent_capi' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>
                      {ev.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5B. bKash/Nagad Cashback & Eid/Boishakh Festive Templates */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{at('bKash/Nagad ক্যাশব্যাক ও ঈদ/বৈশাখী টেমপ্লেট', 'BD Festive, bKash Cashback & Eid SMS/WA Templates')}</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {at('১-ক্লিকে বাংলাদেশী উৎসব ও ক্যাশব্যাক ক্যাম্পেইন বাল্ক SMS বা WhatsApp-এ ব্যবহার করুন', 'Pre-built Bangladesh conversion templates ready for Bulk SMS & WhatsApp broadcast')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {BD_FESTIVE_TEMPLATES.map((tpl) => (
              <div key={tpl.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2">
                <div className="space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-bold">
                    {tpl.badge}
                  </span>
                  <p className="font-bold text-white text-xs">{tpl.title}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{tpl.smsBn}</p>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSmsTitle(tpl.title);
                      setSmsBody(tpl.smsBn);
                      addToast('success', at('SMS বক্সে লোড হয়েছে!', 'Loaded into Bulk SMS'), tpl.title);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
                  >
                    {at('SMS-এ বসান', 'Load SMS')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(`tpl-${tpl.id}`, tpl.waCopy)}
                    className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedFeed === `tpl-${tpl.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>WA</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. 64-District RTO Risk Optimizer & Influencer/Coupon Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 6A. 64-District RTO Return-Risk Optimizer */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>{at('৬৪-জেলা RTO রিটার্ন রিস্ক অপটিমাইজার', '64-District COD Return-Risk (RTO) Optimizer')}</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                {at('জেলা অনুযায়ী অর্ডার ডেলিভারি ও রিটার্ন হার বিশ্লেষণ করে অগ্রিম ডেলিভারি চার্জ নীতি নির্ধারণ করুন', 'Spot high-RTO delivery districts from order history to enforce advance delivery rules')}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {(['all', 'high_risk', 'safe'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setDistrictFilter(f)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                    districtFilter === f ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'high_risk' ? 'Risk Zone' : 'Safe Zone'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto max-h-60 rounded-xl border border-slate-800">
            <table className="w-full text-left text-[11px] text-slate-300 tabular-nums">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">District</th>
                  <th className="py-2 px-2">Orders</th>
                  <th className="py-2 px-2">Delivered</th>
                  <th className="py-2 px-2">RTO %</th>
                  <th className="py-2 px-3">COD Policy Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredRtoDistricts.map((d) => (
                  <tr key={d.district} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 font-bold text-white">{d.district}</td>
                    <td className="py-2 px-2 font-mono">{d.total}</td>
                    <td className="py-2 px-2 font-mono text-emerald-400">{d.delivered}</td>
                    <td className="py-2 px-2 font-mono font-bold">
                      <span className={d.level === 'high_risk' ? 'text-rose-400' : d.level === 'moderate' ? 'text-amber-300' : 'text-emerald-400'}>
                        {d.riskPct}%
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.level === 'high_risk'
                            ? 'bg-rose-500/20 text-rose-300'
                            : d.level === 'moderate'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {d.level === 'high_risk'
                          ? 'Require Advance Charge'
                          : d.level === 'moderate'
                          ? 'Voice Call Confirm'
                          : '100% Free COD Safe'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredRtoDistricts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-5 text-center text-slate-500">
                      {at('এই ফিল্টারে কোনো জেলার অর্ডার নেই', 'No districts match this filter')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6B. Influencer, Promo Coupon & Affiliate Attribution Tracker */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>{at('ইনফ্লুয়েন্সার, কুপন ও অ্যাফিলিয়েট অ্যাট্রিবিউশন', 'Influencer, Coupon & Affiliate Attribution ROI')}</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                {at('প্রতিটি প্রোমো কোড, রিসেলার এবং অ্যাফিলিয়েট পার্টনারের আসল বিক্রয় ও অর্ডার হিসাব', 'Track real attributed orders and revenue per Coupon Code, Affiliate Link & Reseller')}
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 rounded">
              {attributionRows.length} Sources
            </span>
          </div>

          <div className="overflow-x-auto max-h-60 rounded-xl border border-slate-800">
            <table className="w-full text-left text-[11px] text-slate-300 tabular-nums">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Channel</th>
                  <th className="py-2 px-2">Code</th>
                  <th className="py-2 px-2">Partner / Label</th>
                  <th className="py-2 px-2">Orders</th>
                  <th className="py-2 px-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {attributionRows.map((row) => (
                  <tr key={`${row.sourceType}-${row.code}`} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.sourceType === 'Affiliate'
                            ? 'bg-sky-500/20 text-sky-300'
                            : row.sourceType === 'Reseller'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {row.sourceType}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-mono font-bold text-white">{row.code}</td>
                    <td className="py-2 px-2 text-slate-300 truncate max-w-[140px]">{row.label}</td>
                    <td className="py-2 px-2 font-mono">{row.ordersCount} ({row.paidOrders} del)</td>
                    <td className="py-2 px-3 font-mono font-black text-emerald-400">৳{row.revenue.toLocaleString()}</td>
                  </tr>
                ))}
                {attributionRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-5 text-center text-slate-500">
                      {at('অর্ডার হলে কুপন, রিসেলার ও অ্যাফিলিয়েট ROI এখানে দেখা যাবে', 'Coupon, Affiliate & Reseller attributed orders will appear here')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 7. Printable QR Code Poster & Courier Parcel Thank-You Coupon Insert */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>{at('প্রিন্টেবল QR কোড ও পার্সেল ডিসকাউন্ট কার্ড জেনারেটর', 'Printable QR Code Poster & Parcel Coupon Insert Studio')}</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {at(
                'প্রতিটি কুরিয়ার পার্সেলের ভিতরে দেওয়ার জন্য রিপিট-অর্ডার QR কার্ড ও দোকানের পোস্টার প্রিন্ট করুন',
                'Generate scannable SVG QR cards linking to store or product pages with coupon codes for courier parcel inserts'
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadQrSvg}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{at('SVG ডাউনলোড', 'Download SVG')}</span>
            </button>
            <button
              type="button"
              onClick={handlePrintQrInsert}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{at('পার্সেল কার্ড প্রিন্ট', 'Print Parcel Insert')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">
                {at('QR টার্গেট পেজ / পণ্য', 'QR Target Page or Product')}
              </label>
              <select
                value={qrProductId}
                onChange={(e) => setQrProductId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="store_home">{at('হোম স্টোরফ্রন্ট (/home)', 'Main Storefront Home')}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {at(p.titleBn || p.title, p.title)} (৳{p.price})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">
                {at('রিপিট-অর্ডার কুপন কোড', 'Coupon Code on Insert')}
              </label>
              <input
                type="text"
                value={qrCouponCode}
                onChange={(e) => setQrCouponCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 mb-1">
                {at('কার্ডের হেডলাইন', 'Card Headline')}
              </label>
              <input
                type="text"
                value={qrHeadline}
                onChange={(e) => setQrHeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 mb-1">
                {at('সাব-টেক্সট নির্দেশনা', 'Instruction Subtext')}
              </label>
              <input
                type="text"
                value={qrSubtext}
                onChange={(e) => setQrSubtext(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300"
              />
            </div>
            <div className="sm:col-span-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400 truncate">
              URL: {qrTargetUrl}
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-xs p-5 rounded-2xl bg-white text-slate-900 border-2 border-dashed border-emerald-500 text-center space-y-2.5 shadow-lg">
              <p className="font-black text-sm text-emerald-700">{settings.storeName}</p>
              <p className="font-bold text-xs leading-snug">{qrHeadline}</p>
              <div className="inline-flex p-2 rounded-xl border border-slate-200 bg-white">
                {qrSvgMarkup ? (
                  <div
                    className="w-36 h-36 [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: qrSvgMarkup }}
                  />
                ) : (
                  <div className="w-36 h-36 bg-slate-100 rounded-lg" />
                )}
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-300 font-mono font-black text-xs text-emerald-800">
                  CODE: {qrCouponCode || 'REPEAT50'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">{qrSubtext}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
