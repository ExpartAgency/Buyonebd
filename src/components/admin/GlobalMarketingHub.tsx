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
  Download,
  MapPin,
  Image as ImageIcon,
  Share2,
  CheckSquare,
  BellRing
} from 'lucide-react';
import QRCode from 'qrcode';
import { useStore } from '../../context/StoreContext';
import { BulkSmsCampaignLog, UserNotificationCategory } from '../../types';
import { BulkSectionShell } from './BulkSectionShell';

export const GlobalMarketingHub: React.FC = () => {
  const {
    settings,
    updateSettings,
    saveSettingsChanges,
    products,
    visibleStoreProducts,
    addSocialPost,
    getProductCanonicalUrl,
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
    autoMarketingLogs,
    isRunningAutoMarketingSuite,
    runAutoMarketingSuiteNow,
    syncStoreFromServer,
    publishedNotifications,
    publishPromotionalNotification,
    deletePublishedNotification,
    addToast,
    adminLang
  } = useStore();

  const activeOwnProducts = useMemo(
    () => (visibleStoreProducts.length > 0 ? visibleStoreProducts : products),
    [visibleStoreProducts, products]
  );

  const [editingSmsLogId, setEditingSmsLogId] = useState<string | null>(null);
  const [editSmsLogTitle, setEditSmsLogTitle] = useState('');
  const [editSmsLogMsg, setEditSmsLogMsg] = useState('');

  // QR Poster & Parcel Coupon Insert Generator
  const [qrProductId, setQrProductId] = useState<string>('store_home');
  const [qrCouponCode, setQrCouponCode] = useState<string>('REPEAT50');
  const [qrHeadline, setQrHeadline] = useState<string>('ধন্যবাদ অর্ডারের জন্য! পরের অর্ডারে ৫০ টাকা ছাড়');
  const [qrSubtext, setQrSubtext] = useState<string>('স্ক্যান করে সরাসরি স্টোর ভিজিট করুন অথবা WhatsApp-এ অর্ডার করুন');
  const [qrSvgMarkup, setQrSvgMarkup] = useState<string>('');

  // Zero-Ad-Spend Bangladesh Free Marketing Studio State
  const [freeProdId, setFreeProdId] = useState<string>(activeOwnProducts[0]?.id || products[0]?.id || '');
  const [freeArea, setFreeArea] = useState<string>('Dhaka City (Mirpur, Uttara, Dhanmondi & Nationwide COD)');
  const [flyerTheme, setFlyerTheme] = useState<'emerald' | 'midnight' | 'festive'>('emerald');
  const [flyerTag, setFlyerTag] = useState<string>('64-DISTRICT CASH ON DELIVERY');
  const [flyerOfferNote, setFlyerOfferNote] = useState<string>('সীমিত স্টক — আজই অর্ডার করলে ফাস্ট হোম ডেলিভারি!');
  const flyerCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isGeneratingBlitz, setIsGeneratingBlitz] = useState(false);
  const [viralBlitzKit, setViralBlitzKit] = useState<{
    facebookPost: string;
    messengerClosingScript: string;
    instagramCaption: string;
    instagramHashtags: string[];
    tiktokVideoHook: string;
    tiktokSpokenScript: string;
    youtubeShortsTitle: string;
    youtubeShortsDescription: string;
    youtubePinnedComment: string;
    fbMarketplaceTitle: string;
    fbMarketplaceDescription: string;
    whatsappTeaserMsg: string;
  } | null>(null);

  const [isGeneratingChannelPack, setIsGeneratingChannelPack] = useState(false);
  const [isAutoPostingAllBd, setIsAutoPostingAllBd] = useState(false);
  const [freeChannelPack, setFreeChannelPack] = useState<{
    bikroyAdTitle: string;
    bikroyAdBody: string;
    facebookMarketplaceListing: string;
    facebookReelsHook: string;
    instagramReelsCaption: string;
    tiktokViralHookScript: string;
    youtubeShortsPost: string;
    whatsappChannelPost: string;
    telegramChannelPost: string;
    fbGroupVariant1: string;
    fbGroupVariant2: string;
    messengerCloserScript: string;
    googleBusinessUpdate: string;
    commentToOrderReply: string;
    seoBlogGuideSnippet: string;
    quoraPinterestPinText: string;
    microCreatorBarterDm: string;
  } | null>(null);

  // In-App Customer Notification Center Broadcaster State
  const [notifCategory, setNotifCategory] = useState<UserNotificationCategory>('promo');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifCoupon, setNotifCoupon] = useState('');
  const [notifProductId, setNotifProductId] = useState('');
  const [isPublishingNotif, setIsPublishingNotif] = useState(false);

  const handlePublishInAppNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) {
      addToast('warning', at('শিরোনাম ও মেসেজ দিন', 'Title & Message Required'), '');
      return;
    }
    setIsPublishingNotif(true);
    try {
      const selectedProd = activeOwnProducts.find((p) => p.id === notifProductId);
      await publishPromotionalNotification({
        category: notifCategory,
        title: notifTitle,
        titleBn: notifTitle,
        message: notifMessage,
        messageBn: notifMessage,
        couponCode: notifCoupon || undefined,
        productId: selectedProd?.id,
        badgeText: notifCategory === 'price_drop' ? 'PRICE DROP' : notifCoupon || 'PROMO',
        oldPrice: selectedProd?.originalPrice,
        newPrice: selectedProd?.price
      });
      setNotifTitle('');
      setNotifMessage('');
      setNotifCoupon('');
    } finally {
      setIsPublishingNotif(false);
    }
  };

  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://buyonebd.com';

  const freeProduct = useMemo(
    () => activeOwnProducts.find((p) => p.id === freeProdId) || activeOwnProducts[0] || null,
    [activeOwnProducts, freeProdId]
  );

  React.useEffect(() => {
    const canvas = flyerCanvasRef.current;
    if (!canvas || !freeProduct) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const palette =
      flyerTheme === 'midnight'
        ? { bg1: '#020617', bg2: '#0f172a', accent: '#10b981', pill: '#064e3b', text: '#ffffff', sub: '#94a3b8' }
        : flyerTheme === 'festive'
        ? { bg1: '#451a03', bg2: '#78350f', accent: '#f59e0b', pill: '#059669', text: '#ffffff', sub: '#fde68a' }
        : { bg1: '#022c22', bg2: '#064e3b', accent: '#34d399', pill: '#0f172a', text: '#ffffff', sub: '#a7f3d0' };

    const drawPoster = (imgEl?: HTMLImageElement | null) => {
      const W = 1080;
      const H = 1920;
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, palette.bg1);
      grad.addColorStop(1, palette.bg2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Top Brand Header
      ctx.fillStyle = palette.accent;
      ctx.font = 'bold 44px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(settings.storeName || 'BuyOne BD', W / 2, 120);

      // Tag Badge
      ctx.fillStyle = palette.pill;
      ctx.fillRect(140, 165, W - 280, 74);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px system-ui, sans-serif';
      ctx.fillText(flyerTag.slice(0, 34), W / 2, 214);

      // Center Product Frame
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(110, 290, W - 220, 820);
      if (imgEl && imgEl.naturalWidth > 0) {
        try {
          const box = 780;
          const ratio = Math.min(box / imgEl.naturalWidth, box / imgEl.naturalHeight);
          const dw = imgEl.naturalWidth * ratio;
          const dh = imgEl.naturalHeight * ratio;
          ctx.drawImage(imgEl, 130 + (box - dw) / 2, 310 + (box - dh) / 2, dw, dh);
        } catch {
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(130, 310, W - 260, 780);
        }
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 42px system-ui, sans-serif';
        ctx.fillText(freeProduct.category || 'FEATURED DEAL', W / 2, 700);
      }

      // Product Title (2-line wrap)
      ctx.fillStyle = palette.text;
      ctx.font = 'bold 48px system-ui, sans-serif';
      const titleStr = freeProduct.titleBn || freeProduct.title || 'Best Seller';
      ctx.fillText(titleStr.slice(0, 34), W / 2, 1225);
      if (titleStr.length > 34) {
        ctx.fillText(titleStr.slice(34, 68), W / 2, 1288);
      }

      // Price Callout
      ctx.fillStyle = palette.accent;
      ctx.font = 'bold 96px monospace';
      ctx.fillText(`৳${freeProduct.price.toLocaleString()}`, W / 2, 1435);
      if (freeProduct.originalPrice && freeProduct.originalPrice > freeProduct.price) {
        ctx.fillStyle = palette.sub;
        ctx.font = 'bold 42px monospace';
        ctx.fillText(`Regular ৳${freeProduct.originalPrice.toLocaleString()}`, W / 2, 1500);
      }

      // Offer Note & Hotline Footer
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px system-ui, sans-serif';
      ctx.fillText(flyerOfferNote.slice(0, 46), W / 2, 1615);

      ctx.fillStyle = palette.accent;
      ctx.fillRect(120, 1690, W - 240, 125);
      ctx.fillStyle = '#020617';
      ctx.font = 'bold 42px monospace';
      ctx.fillText(`Order: ${settings.whatsappNumber || settings.hotline || '+8801917942662'}`, W / 2, 1768);
    };

    drawPoster(null);
    const imgSrc = freeProduct.images?.[0];
    if (imgSrc && imgSrc.trim()) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => drawPoster(img);
      img.onerror = () => drawPoster(null);
      img.src = imgSrc;
    }
  }, [freeProduct, flyerTheme, flyerTag, flyerOfferNote, settings.storeName, settings.whatsappNumber, settings.hotline]);

  const handleDownloadStoryPng = () => {
    const canvas = flyerCanvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `buyonebd-story-${freeProduct?.id || 'flyer'}.png`;
      a.click();
      addToast('success', at('১০৮০x১৯২০ স্টোরি PNG ডাউনলোড হয়েছে!', '1080x1920 Story Flyer Downloaded!'), 'WhatsApp & FB Status Ready');
    } catch {
      addToast('warning', at('CORS ইমেজ রেস্ট্রিকশন — প্লেসহোল্ডার সহ রেন্ডার চেষ্টা করুন', 'External image blocked PNG export'), '');
    }
  };

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
  const [selectedProdId, setSelectedProdId] = useState(activeOwnProducts[0]?.id || products[0]?.id || '');
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

  const handleRunFreeSocialBlitz = async () => {
    if (!freeProduct) return;
    setIsGeneratingBlitz(true);
    try {
      const prodUrl = getProductCanonicalUrl(freeProduct);
      const res = await fetch('/api/ai/free-social-blitz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: freeProduct,
          storeName: settings.storeName || 'BuyOne BD',
          productUrl: prodUrl,
          lang: adminLang
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.kit) {
        addToast('error', at('AI জেনারেট ব্যর্থ', 'AI Blitz Failed'), data?.error || 'Could not generate free social kit.');
        return;
      }
      setViralBlitzKit(data.kit);
      addToast('success', at('৪-প্ল্যাটফর্ম ৳০ ভাইরাল কিট তৈরি!', '4-Platform Zero-Spend Kit Ready!'), freeProduct.title);
    } catch (err: any) {
      addToast('error', 'Network Error', err?.message || 'Failed to reach /api/ai/free-social-blitz');
    } finally {
      setIsGeneratingBlitz(false);
    }
  };

  const handleScheduleAllBlitzPlatforms = () => {
    if (!viralBlitzKit || !freeProduct) return;
    const baseMs = Date.now() + 10 * 60 * 1000;
    const baseUrl = getProductCanonicalUrl(freeProduct);
    const items: {
      platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube';
      title: string;
      caption: string;
      hashtags: string[];
      offsetMin: number;
    }[] = [
      {
        platform: 'facebook',
        title: freeProduct.titleBn || freeProduct.title,
        caption: `${viralBlitzKit.facebookPost}\n\n👉 অর্ডার লিংক: ${baseUrl}?utm_source=facebook&utm_medium=free_organic`,
        hashtags: ['#BuyOneBD', '#BangladeshShopping', '#CashOnDelivery'],
        offsetMin: 10
      },
      {
        platform: 'instagram',
        title: freeProduct.title,
        caption: `${viralBlitzKit.instagramCaption}\n\nShop: ${baseUrl}?utm_source=instagram&utm_medium=free_organic`,
        hashtags: Array.isArray(viralBlitzKit.instagramHashtags) && viralBlitzKit.instagramHashtags.length > 0
          ? viralBlitzKit.instagramHashtags.map((t) => (t.startsWith('#') ? t : `#${t}`))
          : ['#BuyOneBD', '#BDStyle'],
        offsetMin: 35
      },
      {
        platform: 'tiktok',
        title: viralBlitzKit.tiktokVideoHook,
        caption: `${viralBlitzKit.tiktokSpokenScript}\n\nOrder Link in Bio: ${baseUrl}?utm_source=tiktok&utm_medium=free_organic`,
        hashtags: ['#BuyOneBD', '#TikTokBD', '#ViralBD'],
        offsetMin: 60
      },
      {
        platform: 'youtube',
        title: viralBlitzKit.youtubeShortsTitle,
        caption: `${viralBlitzKit.youtubeShortsDescription}\n\nPinned Comment:\n${viralBlitzKit.youtubePinnedComment}\n\nOrder Now: ${baseUrl}?utm_source=youtube&utm_medium=free_shorts`,
        hashtags: ['#Shorts', '#BuyOneBD', '#Bangladesh'],
        offsetMin: 90
      }
    ];
    items.forEach((it) => {
      addSocialPost(
        {
          platform: it.platform,
          productId: freeProduct.id,
          productTitle: freeProduct.title,
          productUrl: `${baseUrl}?utm_source=${it.platform}&utm_medium=free_ai`,
          title: it.title,
          caption: it.caption,
          hashtags: it.hashtags,
          imageUrl: freeProduct.images?.[0] || '',
          scheduledAt: new Date(baseMs + it.offsetMin * 60 * 1000).toISOString(),
          status: 'scheduled',
          autoGenerated: true
        },
        { silent: true }
      );
    });
    addToast(
      'success',
      at('৪টি সোশ্যাল চ্যানেলেই শিডিউল সম্পন্ন!', 'All 4 Platforms Scheduled!'),
      'Facebook, Instagram, TikTok & YouTube Shorts queued in Social Auto-Scheduler'
    );
  };

  const handleGenerateGlobalAd = async () => {
    const prod = activeOwnProducts.find((p) => p.id === selectedProdId) || activeOwnProducts[0];
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

  const handleGenerateFreeChannelPack = async () => {
    if (!freeProduct) return;
    setIsGeneratingChannelPack(true);
    try {
      const prodUrl = getProductCanonicalUrl(freeProduct);
      const res = await fetch('/api/ai/free-channel-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: {
            title: freeProduct.title,
            titleBn: freeProduct.titleBn,
            price: freeProduct.price,
            originalPrice: freeProduct.originalPrice
          },
          storeName: settings.storeName || 'BuyOne BD',
          productUrl: prodUrl,
          whatsapp: settings.whatsappNumber || settings.hotline,
          lang: adminLang
        })
      });
      const json = await res.json().catch(() => null);
      if (json?.success && json.pack) {
        setFreeChannelPack(json.pack);
        addToast('success', at('সব বিডি ফ্রি চ্যানেল প্যাক তৈরি!', '12-Channel Free BD Sales Pack Ready!'), freeProduct.title);
      } else {
        addToast('error', at('চ্যানেল প্যাক ব্যর্থ', 'Generation Failed'), json?.error || '');
      }
    } catch {
      addToast('error', at('নেটওয়ার্ক ত্রুটি', 'Network Error'), '');
    } finally {
      setIsGeneratingChannelPack(false);
    }
  };

  const handleAutoPostAllBdFreeChannels = async () => {
    if (!freeProduct) return;
    setIsAutoPostingAllBd(true);
    try {
      const res = await fetch('/api/ai/bd-free-channels-autopost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: freeProduct.id,
          dispatchImmediately: true,
          broadcastInAppNotif: true,
          lang: adminLang
        })
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        addToast('error', at('অটো-পোস্ট ব্যর্থ', 'Auto-Post Failed'), json?.error || '');
        return;
      }
      await syncStoreFromServer();
      addToast(
        'success',
        at(`${json.createdCount || 5}টি চ্যানেলে AI অটো-পোস্ট সম্পন্ন!`, `Auto-Posted to ${json.createdCount || 5} Channels + Customer App!`),
        json.productTitle || freeProduct.title
      );
    } catch {
      addToast('error', at('নেটওয়ার্ক ত্রুটি', 'Network Error'), '');
    } finally {
      setIsAutoPostingAllBd(false);
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

      {/* 0. Zero-Employee Autonomous AI Marketing Autopilot Suite (No Staff Needed) */}
      {(() => {
        const suiteCfg = settings.autoMarketingSuite || {
          enabled: true,
          autoSocialDailyPoster: true,
          autoNewProductLaunchBlitz: true,
          autoAbandonedCartWinback: true,
          autoPriceDropAndRestockAlerts: true,
          autoSeoProductEnricher: true,
          autoWeeklyBlogPublisher: true,
          autoReviewSocialProofPromo: true,
          autoInquiryResponder: true,
          autoPromoNotificationBroadcaster: true,
          cycleIntervalHours: 6
        };
        const patchSuite = (patch: Partial<typeof suiteCfg>) => {
          updateSettings(
            {
              autoMarketingSuite: {
                ...suiteCfg,
                ...patch
              }
            },
            { commit: true }
          );
        };
        const suiteToggles: { key: keyof typeof suiteCfg; labelBn: string; labelEn: string; subBn: string; subEn: string }[] = [
          {
            key: 'autoSocialDailyPoster',
            labelBn: 'অটো ডেইলি ৫-চ্যানেল সোশ্যাল পোস্টার',
            labelEn: 'Auto Daily FB, IG, TikTok, YT & Telegram',
            subBn: 'নিজস্ব স্টক পণ্য থেকে অটো ক্যাপশন ও হ্যাশট্যাগ তৈরি করে শিডিউল/পোস্ট করে',
            subEn: 'Auto-creates localized promo posts across all 5 social channels'
          },
          {
            key: 'autoGenerateViralMedia',
            labelBn: 'অটো ভাইরাল ব্যানার (PNG) ও Reels ভিডিও (.mp4) তৈরি',
            labelEn: 'Auto Viral Promo Banners & MP4 Reel Videos',
            subBn: 'কোনো ম্যানুয়াল ডিজাইন ছাড়াই প্রতিটি পণ্যের প্রোমো ব্যানার ও Reels ভিডিও তৈরি করে',
            subEn: 'Auto-renders 1080×1080 banners, Reels covers & H.264 MP4 videos at ৳0 cost'
          },
          {
            key: 'autoPushToN8n',
            labelBn: 'n8n ওয়ার্কফ্লো অটো-পুশ ও হ্যাশট্যাগ সিঙ্ক',
            labelEn: 'Auto-Push Viral Media + Hashtags to n8n',
            subBn: 'ব্যাকগ্রাউন্ড AI পোস্ট তৈরি হলেই ব্যানার ও ভিডিওসহ আপনার n8n-এ পাঠিয়ে দেয়',
            subEn: 'Automatically pushes generated banners, MP4 reels & hashtags to n8n webhook'
          },
          {
            key: 'autoNewProductLaunchBlitz',
            labelBn: 'নতুন পণ্য যোগ করলেই অটো লঞ্চ ব্লিটজ',
            labelEn: 'Instant New-Product Launch Social Blitz',
            subBn: 'স্টোরে নতুন পণ্য অ্যাড করার সাথে সাথেই ৫টি চ্যানেলে লঞ্চ পোস্ট শিডিউল হয়',
            subEn: 'Automatically queues 5-channel promo posts whenever you add a product'
          },
          {
            key: 'autoInquiryResponder',
            labelBn: 'কর্মী ছাড়াই অটো কাস্টমার চ্যাট/ইনকোয়ারি রিপ্লাই',
            labelEn: 'Zero-Employee AI Inquiry Auto-Responder',
            subBn: 'নতুন কাস্টমার প্রশ্ন এলেই AI দাম, COD ও লিংক দিয়ে অটো উত্তর দেয়',
            subEn: 'Instantly drafts & sends polite BD COD replies to open inquiries'
          },
          {
            key: 'autoPromoNotificationBroadcaster',
            labelBn: 'অটো কাস্টমার অ্যাপ ফ্ল্যাশ-ডিল নোটিফিকেশন',
            labelEn: 'Auto Customer App Deal Broadcaster',
            subBn: 'ফিরে আসা ক্রেতাদের বেল নোটিফিকেশনে ডিসকাউন্ট ও ফ্ল্যাশ-ডিল অ্যালার্ট পাঠায়',
            subEn: 'Rotates flash deal & price-drop alerts inside Customer Notification Center'
          },
          {
            key: 'autoAbandonedCartWinback',
            labelBn: 'অসম্পূর্ণ অর্ডার AI রিকভারি মেসেজ',
            labelEn: 'Auto Abandoned-Cart AI Win-Back Scripts',
            subBn: 'চেকআউট অসম্পূর্ণ থাকা ক্রেতাদের জন্য অটো বাংলা WhatsApp অফার তৈরি রাখে',
            subEn: 'Auto-prepares personalized Bangla recovery offers for uncompleted orders'
          },
          {
            key: 'autoPriceDropAndRestockAlerts',
            labelBn: 'দাম কমলে ও রিস্টক হলে অটো ক্রেতা অ্যালার্ট',
            labelEn: 'Auto Price-Drop & Back-in-Stock Alerts',
            subBn: 'দাম কমালে বা স্টক দিলে ওয়েটলিস্ট কাস্টমারদের অটো নোটিফাই করা হয়',
            subEn: 'Matches price-alert & waitlist leads instantly on price/stock updates'
          },
          {
            key: 'autoSeoProductEnricher',
            labelBn: 'অটো গুগল SEO টাইটেল ও মেটা অপ্টিমাইজার',
            labelEn: 'Auto Product Google SEO Optimizer',
            subBn: 'ফাঁকা থাকা SEO টাইটেল, ডেসক্রিপশন ও স্লাগ AI দিয়ে স্বয়ংক্রিয়ভাবে পূরণ করে',
            subEn: 'Auto-fills missing SEO titles, meta descriptions & keywords on products'
          },
          {
            key: 'autoWeeklyBlogPublisher',
            labelBn: 'অটো অর্গানিক SEO বায়িং-গাইড ব্লগ',
            labelEn: 'Auto SEO Buying-Guide Blog Publisher',
            subBn: 'ফ্রি গুগল ট্রাফিক আনতে নিজস্ব পণ্যের ওপর বাংলা-ইংরেজি ব্লগ পোস্ট পাবলিশ করে',
            subEn: 'Publishes helpful bilingual buying guides linking your own products'
          }
        ];

        return (
          <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <span>
                    {at(
                      'জিরো-কর্মী ১০০% স্বয়ংক্রিয় AI মার্কেটিং ও সেলস অটোপাইলট (কোনো কর্মচারী লাগবে না)',
                      'Zero-Employee Automatic AI Marketing Engine (No Staff Needed)'
                    )}
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {at(
                    'একাই পুরো স্টোর চালান: AI টিম সারাক্ষণ অটো সোশ্যাল পোস্ট, কাস্টমার ইনকোয়ারি রিপ্লাই, অসম্পূর্ণ অর্ডার রিকভারি, SEO ও ব্লগ পাবলিশ করে।',
                    'Run your entire e-commerce operation solo: AI replaces social managers, support agents, copywriters & retention staff 24/7.'
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(suiteCfg.enabled)}
                    onChange={(e) => patchSuite({ enabled: e.target.checked })}
                    className="accent-emerald-500"
                  />
                  <span>{suiteCfg.enabled ? at('অটোপাইলট চালু', 'Autopilot ON') : at('বন্ধ', 'Paused')}</span>
                </label>

                <select
                  value={suiteCfg.cycleIntervalHours || 6}
                  onChange={(e) => patchSuite({ cycleIntervalHours: Number(e.target.value) })}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200"
                >
                  <option value={4}>{at('প্রতি ৪ ঘণ্টায়', 'Every 4 Hours')}</option>
                  <option value={6}>{at('প্রতি ৬ ঘণ্টায়', 'Every 6 Hours')}</option>
                  <option value={12}>{at('প্রতি ১২ ঘণ্টায়', 'Every 12 Hours')}</option>
                  <option value={24}>{at('প্রতিদিন (২৪ ঘণ্টা)', 'Daily (24h)')}</option>
                </select>

                <button
                  type="button"
                  disabled={isRunningAutoMarketingSuite}
                  onClick={() => runAutoMarketingSuiteNow({ includeBlog: true })}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>
                    {isRunningAutoMarketingSuite
                      ? at('অটো মার্কেটিং চলছে...', 'Running Auto-Marketing...')
                      : at('এখনই অটো-মার্কেটিং রান করুন', 'Run Auto-Marketing Now')}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5 text-xs">
              {suiteToggles.map((item) => {
                const isChecked = suiteCfg[item.key] !== false;
                return (
                  <label
                    key={String(item.key)}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-start gap-2.5 ${
                      isChecked
                        ? 'bg-emerald-950/25 border-emerald-500/35 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => patchSuite({ [item.key]: e.target.checked } as any)}
                      className="mt-0.5 accent-emerald-500 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold leading-snug">{at(item.labelBn, item.labelEn)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{at(item.subBn, item.subEn)}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {autoMarketingLogs.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span>{at('সাম্প্রতিক স্বয়ংক্রিয় AI মার্কেটিং কার্যক্রম', 'Recent Automatic AI Marketing Actions')}</span>
                  {suiteCfg.lastAutoSweepAt && (
                    <span className="text-[10px] font-mono text-emerald-400">
                      Last Run: {new Date(suiteCfg.lastAutoSweepAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="max-h-32 overflow-y-auto divide-y divide-slate-800/70">
                  {autoMarketingLogs.slice(0, 6).map((log) => (
                    <div key={log.id} className="py-1.5 flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-slate-200 truncate">{log.summary}</span>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

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
              {activeOwnProducts.map((p) => (
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
                {activeOwnProducts.map((p) => (
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

      {/* 8. Bangladesh Zero-Ad-Spend Free Marketing Engine (FB Marketplace, 1080x1920 PNG Flyer, Free WA Outreach & Barter) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-black text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-400" />
              <span>{at('বাংলাদেশ জিরো-বাজেট ফ্রি মার্কেটিং ও অর্গানিক সেলস ইঞ্জিন (৳০ অ্যাড খরচ)', 'Bangladesh Zero-Ad-Spend Free Marketing & Sales Engine')}</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {at(
                'ফেসবুক মার্কেটপ্লেস লিস্টিং, ১০৮০×১৯২০ হোয়াটসঅ্যাপ স্ট্যাটাস PNG পোস্টার, ডিরেক্ট wa.me ফলো-আপ কিউ এবং ফ্রি BD অর্গানিক চ্যানেল।',
                'Free high-converting Bangladesh organic channels: Facebook Marketplace copy, 1080x1920 Story PNG Studio, 1-on-1 wa.me outreach & Micro-Creator Barter.'
              )}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-[11px]">
            AD BUDGET: ৳0
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* 8A. Facebook Marketplace & Buy/Sell Group Free Listing Generator */}
          <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h5 className="font-bold text-white flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>{at('১. ফেসবুক মার্কেটপ্লেস ও বাই/সেল গ্রুপ ফ্রি লিস্টিং', '1. Facebook Marketplace & Group Free Listing Studio')}</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">{at('পণ্য বাছাই করুন', 'Select Catalog Product')}</label>
                <select
                  value={freeProdId}
                  onChange={(e) => setFreeProdId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                >
                  {activeOwnProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {at(p.titleBn || p.title, p.title)} (৳{p.price})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">{at('টার্গেট এলাকা / সিটি', 'Target BD Area / Hub')}</label>
                <input
                  type="text"
                  value={freeArea}
                  onChange={(e) => setFreeArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>
            </div>

            {freeProduct && (() => {
              const mpUrl = `${origin}/product/${encodeURIComponent(freeProduct.seo?.slug || freeProduct.id)}?utm_source=fb_marketplace&utm_medium=organic`;
              const mpText = `🔥 ${freeProduct.titleBn || freeProduct.title} | স্পেশাল মূল্য: ৳${freeProduct.price.toLocaleString()}\n\n📍 এরিয়া ও ডেলিভারি: ${freeArea}\n✅ Condition: Brand New / 100% Original Sealed\n✅ ১ টাকাও অগ্রিম ছাড়া সারা বাংলাদেশের ৬৪ জেলায় ক্যাশ অন ডেলিভারি (COD)\n✅ প্রোডাক্ট হাতে পেয়ে চেক করে পেমেন্ট করার সুবিধা\n\n👉 ডিরেক্ট অর্ডার লিংক: ${mpUrl}\n📞 WhatsApp / Hotline: ${settings.whatsappNumber || settings.hotline}`;
              return (
                <>
                  <textarea
                    readOnly
                    rows={7}
                    value={mpText}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[11px] resize-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy('fb-mp-copy', mpText)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedFeed === 'fb-mp-copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{at('ফ্রি লিস্টিং কপি করুন', 'Copy Free Marketplace Listing')}</span>
                    </button>
                    <a
                      href="https://www.facebook.com/marketplace/create/item"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Marketplace</span>
                    </a>
                  </div>
                </>
              );
            })()}
          </div>

          {/* 8B. 1080x1920 WhatsApp Status & FB Story PNG Poster Studio */}
          <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h5 className="font-bold text-white flex items-center gap-2 text-sm">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>{at('২. WhatsApp স্ট্যাটাস ও FB স্টোরি PNG পোস্টার (1080×1920)', '2. 1080×1920 Story & WhatsApp Status Flyer Studio')}</span>
              </h5>
              <button
                type="button"
                onClick={handleDownloadStoryPng}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{at('PNG ডাউনলোড', 'Download PNG')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-7 space-y-2.5">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Theme Style</label>
                  <select
                    value={flyerTheme}
                    onChange={(e) => setFlyerTheme(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  >
                    <option value="emerald">Emerald COD Brand</option>
                    <option value="midnight">Midnight Pro Tech</option>
                    <option value="festive">Festive Eid Gold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Top Offer Tag</label>
                  <input
                    type="text"
                    value={flyerTag}
                    onChange={(e) => setFlyerTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Footer Promo Subtext</label>
                  <input
                    type="text"
                    value={flyerOfferNote}
                    onChange={(e) => setFlyerOfferNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>
              <div className="sm:col-span-5 flex justify-center">
                <canvas
                  ref={flyerCanvasRef}
                  width={1080}
                  height={1920}
                  className="w-32 h-56 rounded-xl border border-slate-700 shadow-lg bg-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 8C. Free 1-on-1 WhatsApp Outreach Queue + Micro-Creator Barter + BD Free Sales Channels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <h5 className="font-bold text-white flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>{at('৩. ফ্রি ১-টু-১ কাস্টমার WhatsApp রিমাইন্ডার কিউ (৳০ খরচ)', '3. Zero-Cost Direct wa.me Customer Win-Back Queue')}</span>
            </h5>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/80 rounded-xl border border-slate-800">
              {customerAccounts.slice(0, 8).map((cust, i) => {
                const digits = (cust.phone || '').replace(/[^0-9]/g, '');
                if (digits.length < 10) return null;
                const waDest = digits.startsWith('88') ? digits : `88${digits}`;
                const msg = encodeURIComponent(
                  `আসসালামু আলাইকুম ${cust.name || 'স্যার/ম্যাম'}! ${settings.storeName}-এ আজ ${freeProduct?.titleBn || freeProduct?.title || 'আমাদের পণ্যে'} স্পেশাল ফ্ল্যাশ অফার চলছে (৬৪ জেলায় COD)। ভিজিট করুন: ${origin}`
                );
                return (
                  <div key={`${cust.phone}-${i}`} className="px-3 py-2 flex items-center justify-between gap-2 text-[11px]">
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{cust.name} · <span className="font-mono text-slate-400">{cust.phone}</span></p>
                      <p className="text-[10px] text-slate-500">Wallet: ৳{cust.walletBalance || 0} · {cust.district || 'Bangladesh'}</p>
                    </div>
                    <a
                      href={`https://wa.me/${waDest}?text=${msg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shrink-0"
                    >
                      Send Free Offer
                    </a>
                  </div>
                );
              })}
              {customerAccounts.length === 0 && (
                <p className="p-4 text-center text-slate-500">{at('কাস্টমার যুক্ত হলে সরাসরি WhatsApp অফার পাঠাতে পারবেন।', 'Customers appear here for free 1-click WhatsApp reminders.')}</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h5 className="font-bold text-white flex items-center gap-2 text-sm">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>{at('৪. ফ্রি ক্রিয়েটর বার্টার স্ক্রিপ্ট ও অর্গানিক BD চ্যানেল', '4. Micro-Creator Barter Pitch & Free BD SEO Checklist')}</span>
            </h5>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <p className="text-[11px] font-bold text-amber-300">{at('ন্যানো ইনফ্লুয়েন্সার প্রোডাক্ট বার্টার DM (৳০ ফি):', 'Nano-Creator Barter Collaborator DM (Zero Cash Fee):')}</p>
              <p className="text-[10px] text-slate-300 font-mono leading-relaxed">
                {`হ্যালো! আপনার কন্টেন্ট আমাদের খুব ভালো লেগেছে। আমাদের স্টোরের (${settings.storeName}) সেরা সেলিং "${freeProduct?.title || 'Gadget'}" একদম ফ্রি গিফট হিসেবে পাঠাতে চাই একটি ছোট আনবক্সিং Reel/TikTok রিভিউর বিনিময়ে + আপনার ফলোয়ারদের অর্ডারে লাইফটাইম কমিশন! আগ্রহী হলে জানাবেন।`}
              </p>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    'barter-dm',
                    `হ্যালো! আপনার কন্টেন্ট আমাদের খুব ভালো লেগেছে। আমাদের স্টোরের (${settings.storeName}) সেরা সেলিং "${freeProduct?.title || 'Gadget'}" একদম ফ্রি গিফট হিসেবে পাঠাতে চাই একটি ছোট আনবক্সিং Reel/TikTok রিভিউর বিনিময়ে + আপনার ফলোয়ারদের অর্ডারে লাইফটাইম কমিশন! আগ্রহী হলে জানাবেন।`
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
              >
                {copiedFeed === 'barter-dm' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy Barter DM Script</span>
              </button>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              <li>• Bikroy.com Free Member Shop + Verified Phone Link</li>
              <li>• Google Business Profile (Dhaka Hub + Product Catalog Sync)</li>
              <li>• Daily TikTok/Reels + YouTube Shorts Pin Link (Auto-Scheduler Tab)</li>
              <li>• Parcel Inside Thank-You QR Repeat Coupon Card (Section 7 Above)</li>
            </ul>
          </div>
        </div>

        {/* 8D. ৳0 AI 4-Platform Viral Blitz Studio (FB + IG + TikTok + YT + Messenger + WhatsApp) */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/35 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h5 className="font-black text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {at(
                    '৫. ১-ক্লিক ৳০ AI সোশ্যাল ভাইরাল কিট (FB + IG + TikTok + YouTube Shorts + Messenger)',
                    '5. 1-Click ৳0 AI 4-Platform Viral Kit (FB + IG + TikTok + YouTube + Messenger)'
                  )}
                </span>
              </h5>
              <p className="text-[11px] text-slate-400">
                {at(
                  'কোনো অ্যাড খরচ ছাড়া বাছাই করা নিজের পণ্যের জন্য ৪টি সোশ্যাল মিডিয়ার পূর্ণাঙ্গ বাংলা স্ক্রিপ্ট, হুক, ক্যাপশন ও মার্কেটপ্লেস টাইটেল তৈরি করে সরাসরি অটো-শিডিউলারে পাঠান।',
                  'Generate tailored zero-spend organic viral posts for your selected own product across all 4 platforms + Messenger closing & schedule them in 1 click.'
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isGeneratingBlitz || !freeProduct}
                onClick={handleRunFreeSocialBlitz}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>{isGeneratingBlitz ? at('AI তৈরি করছে...', 'Generating Kit...') : at('৳০ AI ভাইরাল কিট তৈরি করুন', 'Generate ৳0 AI Social Blitz')}</span>
              </button>
              {viralBlitzKit && (
                <button
                  type="button"
                  onClick={handleScheduleAllBlitzPlatforms}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{at('৪টি প্ল্যাটফর্মেই অটো-শিডিউল', 'Schedule All 4 Platforms')}</span>
                </button>
              )}
            </div>
          </div>

          {viralBlitzKit && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 text-[11px]">
              {[
                {
                  key: 'blitz-fb',
                  label: 'Facebook Organic Post & Group Drop',
                  text: viralBlitzKit.facebookPost
                },
                {
                  key: 'blitz-msg',
                  label: 'Messenger Inbox Closer Script',
                  text: viralBlitzKit.messengerClosingScript
                },
                {
                  key: 'blitz-ig',
                  label: 'Instagram Reel / Carousel + Hashtags',
                  text: `${viralBlitzKit.instagramCaption}\n\n${(viralBlitzKit.instagramHashtags || []).join(' ')}`
                },
                {
                  key: 'blitz-tiktok',
                  label: `TikTok Hook & Spoken Script`,
                  text: `HOOK: ${viralBlitzKit.tiktokVideoHook}\n\n${viralBlitzKit.tiktokSpokenScript}`
                },
                {
                  key: 'blitz-yt',
                  label: `YouTube Shorts Title & Pinned Comment`,
                  text: `TITLE: ${viralBlitzKit.youtubeShortsTitle}\n\n${viralBlitzKit.youtubeShortsDescription}\n\nPINNED COMMENT: ${viralBlitzKit.youtubePinnedComment}`
                },
                {
                  key: 'blitz-wa',
                  label: 'WhatsApp Channel / Marketplace Listing',
                  text: `${viralBlitzKit.fbMarketplaceTitle}\n\n${viralBlitzKit.fbMarketplaceDescription}\n\nWA Status: ${viralBlitzKit.whatsappTeaserMsg}`
                }
              ].map((card) => (
                <div key={card.key} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-emerald-300">{card.label}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(card.key, card.text)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedFeed === card.key ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">{card.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Extra BD Zero-Spend Growth Playbooks (FB Live + Group Funnel + WhatsApp Broadcast) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sky-300 text-xs">
                  {at('৬. ফ্রি Facebook Live সেলস ফর্মুলা (০৳ বুস্ট)', '6. Free Facebook Live Demo & Comment-Order Script')}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      'fb-live-script',
                      `🎥 লাইভ ডেমো স্ক্রিপ্ট (${freeProduct?.titleBn || settings.storeName}):\n১) প্রথম ১৫ সেকেন্ডে পণ্যটি হাতে নিয়ে আসল কোয়ালিটি দেখান।\n২) বলুন: "১ টাকাও অগ্রিম ছাড়া ৬৪ জেলায় ক্যাশ অন ডেলিভারি — পছন্দ না হলে রিটার্ন!"\n৩) পিন্ড কমেন্ট লিংক: ${freeProduct ? getProductCanonicalUrl(freeProduct) : origin}\n৪) লাইভ চলাকালীন অর্ডারকারীদের নাম পড়ে শোনান।`
                    )
                  }
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedFeed === 'fb-live-script' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Live Script</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {at(
                  'প্রতিদিন রাত ৮:৩০ টায় ১৫ মিনিট নিজের ফেসবুক পেজ/প্রোফাইলে লাইভ আনবক্সিং করুন — কোনো বুস্ট ছাড়াই অর্গানিক রিচ ৩x বাড়ে।',
                  'Run a 15-minute live unboxing at 8:30 PM BD Prime Time pinning your direct product URL for free organic conversions.'
                )}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-emerald-300 text-xs">
                  {at('৭. ফ্রি WhatsApp Channel & BD গ্রুপ ড্রপ টেমপ্লেট', '7. Free WhatsApp Channel & BD Community Drop Template')}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      'wa-channel-drop',
                      `🔥 আজকের অর্গানিক ফ্ল্যাশ ড্রপ (${settings.storeName})!\n✅ পণ্য: ${freeProduct?.titleBn || 'Featured Item'}\n💥 অফার দাম: ৳${freeProduct?.price || 999}\n🚚 ডেলিভারি: ৬৪ জেলা হোম ডেলিভারি (হাতে পেয়ে পেমেন্ট)\n👉 সরাসরি অর্ডার: ${freeProduct ? getProductCanonicalUrl(freeProduct) : origin}`
                    )
                  }
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedFeed === 'wa-channel-drop' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy WA Drop</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {at(
                  'প্রতিটি অর্ডার কনফার্মের পর কাস্টমারকে আপনার ফ্রি WhatsApp Channel ও FB Group-এ ইনভাইট দিন যেন পরের সব নতুন প্রোডাক্ট ৳০ খরচে দেখতে পারেন।',
                  'Invite every verified COD buyer to join your free WhatsApp Channel & Facebook Buyers Club for zero-cost repeat orders.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 9. BANGLADESH ALL FREE MARKETING CHANNELS + 1-CLICK AI AUTO-POST SYSTEM */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-sky-500/35 space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-black text-white flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-sky-400" />
              <span>
                {at(
                  '৯. বাংলাদেশের সব ১২টি ফ্রি মার্কেটিং চ্যানেল ও ১-ক্লিক AI অটো-পোস্ট সিস্টেম (৳০ খরচ)',
                  '9. All 12 Bangladesh Free Marketing Channels & AI Auto-Post System (৳0 Spend)'
                )}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {at(
                'FB Page/Reels/Marketplace/Groups, Instagram, TikTok, YouTube Shorts, Bikroy.com, Telegram Bot, WhatsApp Channel, Google Business, Google Free Listings & Barter Creators।',
                'Instant AI auto-post & organic copy for all 12 zero-cost Bangladesh traffic sources — no ad budget or employees needed.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isAutoPostingAllBd || !freeProduct}
              onClick={handleAutoPostAllBdFreeChannels}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-200" />
              <span>
                {isAutoPostingAllBd
                  ? at('সব চ্যানেলে অটো-পোস্ট হচ্ছে...', 'Auto-Posting All Channels...')
                  : at('১-ক্লিক সব ফ্রি চ্যানেলে AI অটো-পোস্ট', '1-Click AI Auto-Post All Channels')}
              </span>
            </button>
            <button
              type="button"
              disabled={isGeneratingChannelPack || !freeProduct}
              onClick={handleGenerateFreeChannelPack}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>
                {isGeneratingChannelPack
                  ? at('তৈরি হচ্ছে...', 'Generating 12 Channels...')
                  : at('১২টি ফ্রি চ্যানেলের কপি তৈরি', 'Generate 12-Channel Free Copy')}
              </span>
            </button>
          </div>
        </div>

        {/* All Bangladesh Free Organic Portals Directory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              title: '1. Bikroy.com Free Shop & Ads',
              descBn: 'বিক্রয় ডট কমে ফ্রি বিজ্ঞাপন পোস্ট করে ঢাকা ও ৬৪ জেলার অর্গানিক ক্রেতা পান।',
              descEn: 'Post free classified listings for your products with COD nationwide.',
              url: 'https://bikroy.com/en/post-ad',
              btn: 'Post Free Ad on Bikroy'
            },
            {
              title: '2. Facebook Marketplace & BD Groups',
              descBn: 'লোকেশন-টার্গেটেড ফ্রি মার্কেটপ্লেস ও বাই-সেল গ্রুপে পোস্ট করে ডাইরেক্ট ইনবক্স অর্ডার পান।',
              descEn: 'Zero-ad local Marketplace & BD Buy/Sell Group buyer discovery.',
              url: 'https://www.facebook.com/marketplace/create/item',
              btn: 'Create Marketplace Item'
            },
            {
              title: '3. Telegram Channel Free Bot Auto-Post',
              descBn: 'BotFather টোকেন যুক্ত করলে প্রাইজ+ছবি+অর্ডার বাটন সরাসরি Telegram চ্যানেলে অটো-পোস্ট হবে।',
              descEn: 'Connect free @BotFather token in Social Scheduler for instant Telegram auto-posts.',
              url: freeProduct
                ? `https://t.me/share/url?url=${encodeURIComponent(getProductCanonicalUrl(freeProduct))}&text=${encodeURIComponent(
                    `${freeProduct.titleBn || freeProduct.title} - Only ৳${freeProduct.price} (64-District COD)`
                  )}`
                : 'https://web.telegram.org/',
              btn: 'Share / Launch Telegram'
            },
            {
              title: '4. WhatsApp Channel & Status Drops',
              descBn: 'ফ্রি WhatsApp চ্যানেল ও ১০৮০×১৯২০ স্ট্যাটাস পোস্টারে ডেইলি ডিল ব্রডকাস্ট করুন।',
              descEn: 'Daily WhatsApp Channel broadcasts & 1080x1920 Status flyers at ৳0 cost.',
              url: `https://wa.me/?text=${encodeURIComponent(
                `${freeProduct?.titleBn || freeProduct?.title || settings.storeName} — মাত্র ৳${freeProduct?.price || 0}! ৬৪ জেলায় ক্যাশ অন ডেলিভারি। অর্ডার: ${freeProduct ? getProductCanonicalUrl(freeProduct) : origin}`
              )}`,
              btn: 'Share to WhatsApp'
            },
            {
              title: '5. Google Business Profile & Maps',
              descBn: 'গুগল ম্যাপে BuyOne BD ও আপনার পণ্যের দাম ফ্রি লিস্টিং করে লোকাল ক্রেতা পান।',
              descEn: 'List store & daily COD offers free on Google Search & Dhaka Maps.',
              url: 'https://business.google.com/',
              btn: 'Open Google Business'
            },
            {
              title: '6. Google Merchant Free Listings',
              descBn: 'আমাদের লাইভ XML ফিড যুক্ত করলে গুগল শপিং রেজাল্টে ফ্রিতে পণ্য দেখাবে।',
              descEn: 'Submit /api/feeds/google-merchant.xml for free Google Shopping traffic.',
              url: 'https://merchants.google.com/',
              btn: 'Open Merchant Center'
            },
            {
              title: '7. TikTok BD & YouTube Shorts Studio',
              descBn: 'অটো-জেনারেটেড বাংলা হুক স্ক্রিপ্ট ও পিন্ড অর্ডার লিংকসহ শর্ট ভিডিও আপলোড করুন।',
              descEn: 'Upload short demos with AI Bengali spoken hooks & pinned checkout links.',
              url: 'https://www.tiktok.com/creator-center/upload',
              btn: 'Open TikTok Upload'
            },
            {
              title: '8. Pinterest BD & Organic Search Pins',
              descBn: '"Price in Bangladesh" কিওয়ার্ডে গুগল ও পিন্টারেস্ট ইমেজ ট্রাফিক আনুন ফ্রিতে।',
              descEn: 'Drive evergreen Google Image & Pinterest organic product clicks.',
              url: 'https://www.pinterest.com/pin-creation-tool/',
              btn: 'Create Free Product Pin'
            }
          ].map((ch) => (
            <div key={ch.title} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2.5">
              <div className="space-y-1">
                <p className="font-bold text-white text-xs">{ch.title}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{at(ch.descBn, ch.descEn)}</p>
              </div>
              <a
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{ch.btn}</span>
              </a>
            </div>
          ))}
        </div>

        {/* Ready-to-Copy Generated 12-Channel Output Cards */}
        {freeChannelPack && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[
              {
                key: 'fc-bikroy',
                title: '1. Bikroy.com Classified Listing',
                content: `TITLE: ${freeChannelPack.bikroyAdTitle}\n\n${freeChannelPack.bikroyAdBody}`
              },
              {
                key: 'fc-fbmp',
                title: '2. Facebook Marketplace Listing',
                content: freeChannelPack.facebookMarketplaceListing
              },
              {
                key: 'fc-fbreels',
                title: '3. Facebook Page Reels Hook & Caption',
                content: freeChannelPack.facebookReelsHook
              },
              {
                key: 'fc-fb-grp',
                title: '4. FB Buy/Sell Group Rotator (v1 & v2)',
                content: `[Variant 1]:\n${freeChannelPack.fbGroupVariant1}\n\n[Variant 2 — Comment Trigger]:\n${freeChannelPack.fbGroupVariant2}`
              },
              {
                key: 'fc-comment',
                title: '5. "Comment PRICE" & Messenger Closer',
                content: `[Comment Reply]:\n${freeChannelPack.commentToOrderReply}\n\n[Messenger Closer]:\n${freeChannelPack.messengerCloserScript}`
              },
              {
                key: 'fc-igreels',
                title: '6. Instagram Reels & Shopping Tags',
                content: freeChannelPack.instagramReelsCaption
              },
              {
                key: 'fc-tiktok',
                title: '7. TikTok BD Viral Hook & Spoken Script',
                content: freeChannelPack.tiktokViralHookScript
              },
              {
                key: 'fc-yt',
                title: '8. YouTube Shorts SEO & Pinned Comment',
                content: freeChannelPack.youtubeShortsPost
              },
              {
                key: 'fc-wa-chan',
                title: '9. WhatsApp Channel / Broadcast Post',
                content: freeChannelPack.whatsappChannelPost
              },
              {
                key: 'fc-tg-chan',
                title: '10. Telegram Flash Deal Channel',
                content: freeChannelPack.telegramChannelPost
              },
              {
                key: 'fc-gbp',
                title: '11. Google Business, Search SEO & Pinterest',
                content: `[Google Business]:\n${freeChannelPack.googleBusinessUpdate}\n\n[Google Search BD SEO]:\n${freeChannelPack.seoBlogGuideSnippet}\n\n[Pinterest/Quora]:\n${freeChannelPack.quoraPinterestPinText}`
              },
              {
                key: 'fc-barter',
                title: '12. Nano-Creator Barter & Affiliate DM',
                content: freeChannelPack.microCreatorBarterDm
              }
            ].map((item) => (
              <div key={item.key} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sky-300 text-xs">{item.title}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.key, item.content)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedFeed === item.key ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 10. Customer App Notification Center Broadcaster */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-white text-sm flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-400" />
              <span>
                {at(
                  '১০. ইন-অ্যাপ কাস্টমার নোটিফিকেশন সেন্টার ব্রডকাস্টার (৳০ ফ্রি)',
                  '10. Customer Notification Center Broadcaster (Free In-App Alerts)'
                )}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {at(
                'সরাসরি সব ক্রেতার অ্যাপ ড্যাশবোর্ডের বেল আইকন ও নোটিফিকেশন সেন্টারে প্রোমো কোড বা দাম কমার সতর্কতা পাঠান।',
                'Push promotional deals, coupon codes, or price-drop alerts directly to every customer dashboard Notification Center.'
              )}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">
            Active Broadcasts: {publishedNotifications.length}
          </span>
        </div>

        <form onSubmit={handlePublishInAppNotif} className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          <div className="md:col-span-3 space-y-1">
            <label className="text-[11px] font-bold text-slate-300">{at('ধরণ', 'Alert Category')}</label>
            <select
              value={notifCategory}
              onChange={(e) => setNotifCategory(e.target.value as UserNotificationCategory)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold"
            >
              <option value="promo">{at('প্রোমো অফার / কুপন', 'Promotional Alert')}</option>
              <option value="price_drop">{at('প্রাইস ড্রপ অ্যালার্ট', 'Price Drop Alert')}</option>
              <option value="order_update">{at('অর্ডার ঘোষণা', 'Order / Dispatch Notice')}</option>
            </select>
          </div>

          <div className="md:col-span-5 space-y-1">
            <label className="text-[11px] font-bold text-slate-300">{at('শিরোনাম', 'Headline / Title')}</label>
            <input
              type="text"
              required
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              placeholder={at('যেমন: ঈদ স্পেশাল ফ্ল্যাশ অফার — ২০০ টাকা ছাড়!', 'e.g. Weekend Flash Deal — Extra ৳200 Off!')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
            />
          </div>

          <div className="md:col-span-4 space-y-1">
            <label className="text-[11px] font-bold text-slate-300">{at('লিংকড পণ্য (ঐচ্ছিক)', 'Link Product (Optional)')}</label>
            <select
              value={notifProductId}
              onChange={(e) => setNotifProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
            >
              <option value="">{at('-- কোনো পণ্য নয় --', '-- None --')}</option>
              {activeOwnProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titleBn || p.title} (৳{p.price})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-8 space-y-1">
            <label className="text-[11px] font-bold text-slate-300">{at('বিস্তারিত বার্তা', 'Notification Message')}</label>
            <input
              type="text"
              required
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              placeholder={at('ক্রেতাদের জন্য অফার বা ডিসকাউন্টের বিবরণ লিখুন...', 'Enter deal details or coupon instructions...')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-[11px] font-bold text-slate-300">{at('কুপন কোড', 'Coupon Code')}</label>
            <input
              type="text"
              value={notifCoupon}
              onChange={(e) => setNotifCoupon(e.target.value.toUpperCase())}
              placeholder="WELCOME100"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono uppercase"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isPublishingNotif}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPublishingNotif ? at('পাঠাচ্ছে...', 'Sending...') : at('ব্রডকাস্ট করুন', 'Broadcast')}</span>
            </button>
          </div>
        </form>

        {publishedNotifications.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800 max-h-56 overflow-y-auto">
            {publishedNotifications.slice(0, 12).map((n) => (
              <div
                key={n.id}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono uppercase text-amber-300">
                      {n.category}
                    </span>
                    <span className="font-bold text-white truncate">{n.titleBn || n.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{n.messageBn || n.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deletePublishedNotification(n.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 cursor-pointer shrink-0"
                  title={at('মুছুন', 'Delete')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
