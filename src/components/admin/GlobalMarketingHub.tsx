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
  Users
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BulkSmsCampaignLog } from '../../types';

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
    waitlistEntries,
    bulkSmsLogs,
    dispatchBulkSmsCampaign,
    addToast,
    adminLang
  } = useStore();

  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://buyonebd.com';

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
          cta: data.result.cta || data.subtext || 'Order Now · Cash on Delivery · +8801917942662',
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

  // COD Profit Math
  const deliveryRate = Math.max(0.05, (100 - calcReturnRate) / 100);
  const netRevenuePerAttempt = calcSellPrice * deliveryRate;
  const totalCostPerAttempt = calcCogs * deliveryRate + calcCpa + calcCourier;
  const netProfitPerOrder = Math.round(netRevenuePerAttempt - totalCostPerAttempt);
  const effectiveRoas = calcCpa > 0 ? (netRevenuePerAttempt / calcCpa).toFixed(2) : '0.00';

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
        <form
          onSubmit={handleDispatchSms}
          className="lg:col-span-7 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>{at('বাংলাদেশ বাল্ক SMS ক্যাম্পেইন', 'Bangladesh Bulk SMS Composer')}</span>
            </h4>
            <span className="font-mono text-[11px] text-emerald-400 tabular-nums">
              {segmentRecipients.length} BD recipients ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">{at('ক্যাম্পেইন নাম', 'Campaign Name')}</label>
              <input
                type="text"
                value={smsTitle}
                onChange={(e) => setSmsTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">{at('টার্গেট সেগমেন্ট', 'Audience Segment')}</label>
              <select
                value={smsSegment}
                onChange={(e) => setSmsSegment(e.target.value as BulkSmsCampaignLog['segment'])}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
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
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSendingSms}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingSms ? at('পাঠানো হচ্ছে...', 'Dispatching...') : at('SMS ক্যাম্পেইন পাঠান', 'Dispatch Bulk SMS')}</span>
          </button>

          {bulkSmsLogs.length > 0 && (
            <div className="pt-3 border-t border-slate-800 space-y-1.5">
              <p className="text-[11px] font-bold text-slate-400">{at('সাম্প্রতিক SMS লগ', 'Recent SMS Campaigns')}</p>
              <div className="max-h-28 overflow-y-auto divide-y divide-slate-800">
                {bulkSmsLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="py-1.5 flex items-center justify-between text-[11px] tabular-nums">
                    <span className="font-semibold text-white truncate">{log.title}</span>
                    <span className="text-emerald-400 font-mono">
                      {log.recipientCount} sent · ৳{log.estimatedCostBdt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

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
    </div>
  );
};
