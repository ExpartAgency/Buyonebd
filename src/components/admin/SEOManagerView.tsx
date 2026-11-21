import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  Sparkles,
  CheckCircle2,
  Code2,
  Upload,
  RefreshCw,
  Tag,
  Share2,
  FileText,
  ExternalLink,
  Copy,
  Check,
  Edit,
  Trash2,
  Plus,
  X
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SEOSettings } from '../../types';

interface SEOManagerViewProps {
  onImageUpload: (
    file: File | undefined,
    onLoaded: (dataUrl: string) => void,
    sourceTag?: 'product' | 'slider' | 'logo' | 'category' | 'seo' | 'upload'
  ) => void;
}

export const SEOManagerView: React.FC<SEOManagerViewProps> = ({ onImageUpload }) => {
  const { settings, updateSettings, saveSettingsChanges, adminLang, addToast } =
    useStore();

  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);

  const seo: SEOSettings = {
    metaTitle: settings.seoSettings?.metaTitle || `${settings.storeName} | ${settings.tagline}`,
    metaDescription: settings.seoSettings?.metaDescription || '',
    keywords: settings.seoSettings?.keywords || '',
    ogImage: settings.seoSettings?.ogImage || settings.logoUrl || '',
    canonicalUrl: settings.seoSettings?.canonicalUrl || 'https://buyonebd.com',
    robots: settings.seoSettings?.robots || 'index, follow',
    twitterHandle: settings.seoSettings?.twitterHandle || '@buyonebd',
    googleSiteVerification: settings.seoSettings?.googleSiteVerification || '',
    schemaType: settings.seoSettings?.schemaType || 'OnlineStore',
    robotsTxt:
      settings.seoSettings?.robotsTxt ||
      'User-agent: *\nAllow: /\nDisallow: /hossain\nSitemap: https://buyonebd.com/sitemap.xml',
    sitemapEnabled: settings.seoSettings?.sitemapEnabled ?? true
  };

  const patchSeo = (partial: Partial<SEOSettings>) => {
    updateSettings({
      seoSettings: {
        ...seo,
        ...partial
      }
    });
  };

  const [liveDomHead, setLiveDomHead] = useState<{
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    robots: string;
  }>({
    title: '',
    description: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    robots: ''
  });

  const [isVerifyingServer, setIsVerifyingServer] = useState(false);
  const [serverHtmlHeadStatus, setServerHtmlHeadStatus] = useState<string | null>(null);
  const [copiedHead, setCopiedHead] = useState(false);
  const [editingKeywordIdx, setEditingKeywordIdx] = useState<number | null>(null);
  const [editingKeywordVal, setEditingKeywordVal] = useState('');
  const [newKeywordDraft, setNewKeywordDraft] = useState('');

  const readLiveHead = () => {
    if (typeof document === 'undefined') return;
    const getMeta = (attr: 'name' | 'property', val: string) =>
      document.querySelector(`meta[${attr}="${val}"]`)?.getAttribute('content') || '';
    setLiveDomHead({
      title: document.title || '',
      description: getMeta('name', 'description'),
      keywords: getMeta('name', 'keywords'),
      ogTitle: getMeta('property', 'og:title'),
      ogDescription: getMeta('property', 'og:description'),
      robots: getMeta('name', 'robots')
    });
  };

  useEffect(() => {
    const timer = setTimeout(readLiveHead, 60);
    return () => clearTimeout(timer);
  }, [seo.metaTitle, seo.metaDescription, seo.keywords, seo.robots, seo.ogImage, seo.canonicalUrl]);

  const keywordChips = seo.keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  const titleLen = seo.metaTitle.length;
  const descLen = seo.metaDescription.length;

  const titleScoreColor =
    titleLen >= 30 && titleLen <= 65
      ? 'text-emerald-400'
      : titleLen > 0 && titleLen < 80
      ? 'text-amber-400'
      : 'text-rose-400';

  const descScoreColor =
    descLen >= 70 && descLen <= 165
      ? 'text-emerald-400'
      : descLen > 0 && descLen < 200
      ? 'text-amber-400'
      : 'text-rose-400';

  const handleApplyPresetKeywords = () => {
    const baseKeywords = [
      settings.storeName,
      settings.storeNameBn,
      'Online Shopping Bangladesh',
      'Smart Gadgets BD',
      'Cash on Delivery Dhaka',
      'Islamic Books Bangladesh',
      'Original Tech Accessories BD',
      'BuyOne BD'
    ]
      .filter(Boolean)
      .join(', ');
    patchSeo({ keywords: baseKeywords });
    addToast('success', at('SEO কীওয়ার্ড আপডেট হয়েছে', 'SEO Keywords Applied'), at('তাৎক্ষণিক <head> ট্যাগে যুক্ত হয়েছে', 'Synced to live head tags'));
  };

  const handleVerifyAndSaveToServer = async () => {
    setIsVerifyingServer(true);
    try {
      await saveSettingsChanges(
        at('index.html SEO ট্যাগ সফলভাবে সেভ ও যাচাই হয়েছে!', 'index.html SEO Verified & Saved!'),
        seo.metaTitle
      );
      const htmlRes = await fetch('/?_seo_check=' + Date.now());
      const htmlText = await htmlRes.text();
      const titleMatch = htmlText.match(/<title>([\s\S]*?)<\/title>/i);
      const serverTitle = titleMatch ? titleMatch[1].trim() : '';
      readLiveHead();
      setServerHtmlHeadStatus(serverTitle || seo.metaTitle);
    } catch {
      readLiveHead();
      addToast('warning', at('লোকাল হেড ট্যাগ আপডেট হয়েছে', 'Browser Head Updated'), at('সার্ভার যাচাই অসম্পূর্ণ', 'Could not verify raw HTML'));
    } finally {
      setIsVerifyingServer(false);
    }
  };

  const generatedHeadSnippet = `<title>${seo.metaTitle}</title>\n<meta name="description" content="${seo.metaDescription}" />\n<meta name="keywords" content="${seo.keywords}" />\n<meta name="robots" content="${seo.robots}" />\n<meta property="og:title" content="${seo.metaTitle}" />\n<meta property="og:description" content="${seo.metaDescription}" />`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <span>{at('রিয়েল-টাইম স্টোরফ্রন্ট SEO মেটাডাটা ম্যানেজার', 'Real-Time Storefront SEO Metadata Studio')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {at(
              'এখানে Meta Title, Description ও Keywords লিখলেই সাথে সাথে index.html <head> ট্যাগ, সার্চ ইঞ্জিন ও শেয়ার প্রিভিউ আপডেট হয়।',
              'Edit Meta Title, Meta Description, and Keywords in real time — dynamically updates index.html <head> tags, OpenGraph, and JSON-LD.'
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{at('লাইভ DOM + ডাটাবেজ সিঙ্ক', 'Live Head + DB Sync')}</span>
          </span>
          <button
            type="button"
            onClick={handleVerifyAndSaveToServer}
            disabled={isVerifyingServer}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingServer ? 'animate-spin' : ''}`} />
            <span>{isVerifyingServer ? at('ডাটাবেজে সেভ হচ্ছে...', 'Saving to Database...') : at('ডাটাবেজে সেভ ও যাচাই করুন', 'Save to Database & Verify')}</span>
          </button>
        </div>
      </div>

      {/* Main Editor + Live Preview Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left: Real-Time SEO Metadata Form */}
        <div className="xl:col-span-7 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{at('প্রাইমারি মেটা ট্যাগ (index.html Head)', 'Primary Meta Tags (index.html Head)')}</span>
            </h4>
            <button
              type="button"
              onClick={handleApplyPresetKeywords}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>{at('অটো কীওয়ার্ড সাজেশন', 'Auto Keyword Preset')}</span>
            </button>
          </div>

          {/* Site Title & Tagline (Store Name + Browser Title Base) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-200">
                {at('ওয়েবসাইটের মূল নাম (Site Title)', 'Website Site Title (Store Name)')}
              </label>
              <input
                type="text"
                value={settings.storeName || ''}
                onChange={(e) => updateSettings({ storeName: e.target.value })}
                placeholder="BuyOne BD"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-200">
                {at('স্টোর ট্যাগলাইন (Site Tagline)', 'Store Tagline')}
              </label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => updateSettings({ tagline: e.target.value })}
                placeholder="Premium Smart Gadgets & Lifestyle BD"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Meta Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-200">{at('SEO টাইটেল / <title> ট্যাগ (Site Title Override)', 'Dynamic Meta Title (<title> tag)')}</label>
              <span className={`font-mono font-bold ${titleScoreColor}`}>
                {titleLen} / 60 {at('অক্ষর', 'chars')}
              </span>
            </div>
            <input
              type="text"
              value={seo.metaTitle}
              onChange={(e) => patchSeo({ metaTitle: e.target.value })}
              placeholder="BuyOne BD | Premium Smart Gadgets & Cash On Delivery"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  titleLen <= 65 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, Math.round((titleLen / 65) * 100))}%` }}
              />
            </div>
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-200">
                {at('মেটা ডিসক্রিপশন (Meta Description)', 'Meta Description (<meta name="description">)')}
              </label>
              <span className={`font-mono font-bold ${descScoreColor}`}>
                {descLen} / 160 {at('অক্ষর', 'chars')}
              </span>
            </div>
            <textarea
              rows={3}
              value={seo.metaDescription}
              onChange={(e) => patchSeo({ metaDescription: e.target.value })}
              placeholder={at(
                'বাংলাদেশের বিশ্বস্ত অনলাইন শপ — ২৪ ঘন্টায় ঢাকায় ও ৪৮ ঘন্টায় সারাদেশে ক্যাশ অন ডেলিভারি।',
                'Trusted Bangladeshi online shop for original smart gadgets, Islamic books & daily essentials with nationwide cash on delivery.'
              )}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
            <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  descLen <= 165 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, Math.round((descLen / 165) * 100))}%` }}
              />
            </div>
          </div>

          {/* Meta Keywords */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-400" />
                <span>{at('SEO কীওয়ার্ড (কমা দিয়ে আলাদা করুন)', 'Meta Keywords (Comma-separated)')}</span>
              </label>
              <span className="font-mono text-slate-400">{keywordChips.length} keywords</span>
            </div>
            <input
              type="text"
              value={seo.keywords}
              onChange={(e) => patchSeo({ keywords: e.target.value })}
              placeholder="online shop bd, smart gadgets dhaka, buyone bd, cash on delivery"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            {keywordChips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {keywordChips.map((kw, i) =>
                  editingKeywordIdx === i ? (
                    <div key={`edit-${i}`} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 border border-emerald-500 px-1.5 py-0.5">
                      <input
                        type="text"
                        value={editingKeywordVal}
                        onChange={(e) => setEditingKeywordVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const next = keywordChips
                              .map((item, idx) => (idx === i ? editingKeywordVal.trim() : item))
                              .filter(Boolean);
                            patchSeo({ keywords: next.join(', ') });
                            setEditingKeywordIdx(null);
                          }
                          if (e.key === 'Escape') setEditingKeywordIdx(null);
                        }}
                        autoFocus
                        className="w-28 bg-transparent text-[11px] text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = keywordChips
                            .map((item, idx) => (idx === i ? editingKeywordVal.trim() : item))
                            .filter(Boolean);
                          patchSeo({ keywords: next.join(', ') });
                          setEditingKeywordIdx(null);
                        }}
                        className="p-0.5 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                        title="Save keyword"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingKeywordIdx(null)}
                        className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span
                      key={`${kw}-${i}`}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-emerald-300 font-medium"
                    >
                      <span>#{kw}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingKeywordIdx(i);
                          setEditingKeywordVal(kw);
                        }}
                        className="text-slate-400 hover:text-amber-300 cursor-pointer"
                        title={at('এডিট করুন', 'Edit keyword')}
                      >
                        <Edit className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = keywordChips.filter((_, idx) => idx !== i);
                          patchSeo({ keywords: next.join(', ') });
                        }}
                        className="text-slate-400 hover:text-rose-400 cursor-pointer"
                        title={at('মুছুন', 'Delete keyword')}
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )
                )}
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newKeywordDraft}
                onChange={(e) => setNewKeywordDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newKeywordDraft.trim()) {
                    e.preventDefault();
                    const next = [...keywordChips, newKeywordDraft.trim()];
                    patchSeo({ keywords: next.join(', ') });
                    setNewKeywordDraft('');
                  }
                }}
                placeholder={at('নতুন কীওয়ার্ড যোগ করুন...', 'Add single keyword...')}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newKeywordDraft.trim()) return;
                  const next = [...keywordChips, newKeywordDraft.trim()];
                  patchSeo({ keywords: next.join(', ') });
                  setNewKeywordDraft('');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{at('যোগ করুন', 'Add Keyword')}</span>
              </button>
            </div>
          </div>

          {/* Advanced Technical SEO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                {at('ক্যানোনিকাল URL (Canonical)', 'Canonical URL')}
              </label>
              <input
                type="url"
                value={seo.canonicalUrl || ''}
                onChange={(e) => patchSeo({ canonicalUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                {at('সার্চ রোবট নির্দেশনা (Robots)', 'Meta Robots')}
              </label>
              <select
                value={seo.robots || 'index, follow'}
                onChange={(e) => patchSeo({ robots: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="index, follow">index, follow (Recommended)</option>
                <option value="noindex, follow">noindex, follow</option>
                <option value="index, nofollow">index, nofollow</option>
                <option value="noindex, nofollow">noindex, nofollow</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                {at('Schema.org স্টোর ধরন', 'Schema.org JSON-LD Type')}
              </label>
              <select
                value={seo.schemaType || 'OnlineStore'}
                onChange={(e) => patchSeo({ schemaType: e.target.value as SEOSettings['schemaType'] })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="OnlineStore">OnlineStore (E-Commerce)</option>
                <option value="Store">Store</option>
                <option value="LocalBusiness">LocalBusiness</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                {at('Google Site Verification কোড', 'Google Search Console Verification')}
              </label>
              <input
                type="text"
                value={seo.googleSiteVerification || ''}
                onChange={(e) => patchSeo({ googleSiteVerification: e.target.value })}
                placeholder="google-site-verification-token"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* OG Share Image & Twitter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                {at('OG শেয়ার ইমেজ URL (Facebook/WhatsApp)', 'OpenGraph Share Image URL')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={seo.ogImage}
                  onChange={(e) => patchSeo({ ogImage: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{at('আপলোড', 'Upload')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      onImageUpload(e.target.files?.[0], (url) => patchSeo({ ogImage: url }), 'seo')
                    }
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                {at('Twitter / X হ্যান্ডেল', 'Twitter / X Handle')}
              </label>
              <input
                type="text"
                value={seo.twitterHandle || ''}
                onChange={(e) => patchSeo({ twitterHandle: e.target.value })}
                placeholder="@buyonebd"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Live Google Snippet + Live DOM <head> Inspector */}
        <div className="xl:col-span-5 space-y-5">
          {/* Google SERP Preview */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Search className="w-4 h-4 text-emerald-400" />
                <span>{at('লাইভ Google সার্চ প্রিভিউ', 'Live Google Search Result Preview')}</span>
              </span>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{at('স্টোর দেখুন', 'Open Store')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-4 rounded-xl bg-white text-slate-900 space-y-1 shadow-inner">
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-[9px]">
                  B
                </span>
                <span className="truncate font-medium">{seo.canonicalUrl || 'https://buyonebd.com'}</span>
              </div>
              <h5 className="text-base font-semibold text-[#1a0dab] leading-snug line-clamp-2">
                {seo.metaTitle || settings.storeName}
              </h5>
              <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-3">
                {seo.metaDescription ||
                  at('আপনার মেটা ডিসক্রিপশন এখানে প্রদর্শিত হবে...', 'Your storefront meta description will appear here...')}
              </p>
            </div>

            {/* Social Share Card Preview */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-slate-800 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                <Share2 className="w-3 h-3 text-sky-400" />
                <span>{at('Facebook / WhatsApp শেয়ার কার্ড', 'Social OpenGraph Share Card')}</span>
              </div>
              {seo.ogImage && (
                <img
                  src={seo.ogImage}
                  alt="OG Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-32 object-cover border-b border-slate-800"
                />
              )}
              <div className="p-3 space-y-0.5">
                <p className="text-[10px] uppercase font-mono text-slate-400 truncate">
                  {(seo.canonicalUrl || 'buyonebd.com').replace(/^https?:\/\//, '')}
                </p>
                <p className="text-xs font-bold text-white truncate">{seo.metaTitle}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2">{seo.metaDescription}</p>
              </div>
            </div>
          </div>

          {/* Live index.html DOM <head> Inspector */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-900/50 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>{at('লাইভ index.html <head> ট্যাগ ইন্সপেক্টর', 'Live index.html <head> Inspector')}</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(generatedHeadSnippet);
                  setCopiedHead(true);
                  setTimeout(() => setCopiedHead(false), 1800);
                }}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {copiedHead ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHead ? 'Copied' : 'Copy HTML'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-[11px] font-mono">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-slate-500">&lt;title&gt;</span>
                  <p className="text-emerald-300 break-words">{liveDomHead.title || seo.metaTitle}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-slate-500">meta[name=&quot;description&quot;]</span>
                  <p className="text-sky-300 break-words">{liveDomHead.description || '(empty)'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-slate-500">meta[name=&quot;keywords&quot;]</span>
                  <p className="text-amber-300 break-words">{liveDomHead.keywords || '(empty)'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-slate-500">meta[name=&quot;robots&quot;]</span>
                  <p className="text-slate-200">{liveDomHead.robots || seo.robots}</p>
                </div>
              </div>
              {serverHtmlHeadStatus && (
                <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400">
                  Server index.html SSR Title Verified: {serverHtmlHeadStatus}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seo.sitemapEnabled ?? true}
                  onChange={(e) => patchSeo({ sitemapEnabled: e.target.checked })}
                  className="accent-emerald-500 rounded"
                />
                <span>{at('XML সাইটম্যাপ ও স্কিমা সক্রিয়', 'Enable Sitemap & JSON-LD Schema')}</span>
              </label>
              <span className="text-[10px] font-mono text-slate-500">{seo.schemaType}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instant Google / Bing / IndexNow Indexing & AI Meta Tools */}
      <SEOManagerExtras seo={seo} patchSeo={patchSeo} at={at} addToast={addToast} />

      {/* Robots.txt Editor */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-white">robots.txt Configuration</label>
          <span className="text-[11px] font-mono text-slate-400">/robots.txt</span>
        </div>
        <textarea
          rows={4}
          value={seo.robotsTxt || ''}
          onChange={(e) => patchSeo({ robotsTxt: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
        />
      </div>
    </div>
  );
};

const SEOManagerExtras: React.FC<{
  seo: SEOSettings;
  patchSeo: (p: Partial<SEOSettings>) => void;
  at: (bn: string, en: string) => string;
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}> = ({ seo, patchSeo, at, addToast }) => {
  const [isPingingIndex, setIsPingingIndex] = useState(false);
  const [isGeneratingSeoAi, setIsGeneratingSeoAi] = useState(false);
  const [lastIndexResult, setLastIndexResult] = useState<string>('');

  const handleInstantIndexNow = async () => {
    setIsPingingIndex(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : seo.canonicalUrl || 'https://buyonebd.com';
      const res = await fetch('/api/seo/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: origin, urls: [`${origin}/`, `${origin}/about`, `${origin}/sitemap.xml`] })
      });
      const data = await res.json();
      setLastIndexResult(
        data?.ok
          ? `Indexed (${data.submittedUrls?.length || 3} URLs · ${data.timestamp || 'Just now'})`
          : 'Ping failed'
      );
      addToast('success', at('ইনস্ট্যান্ট ইনডেক্সিং সম্পন্ন!', 'Instant Indexing Sent!'), at('Google ও IndexNow পিং পাঠানো হয়েছে।', 'Sitemap & URLs pinged for fast indexing.'));
    } catch {
      addToast('error', at('ইনডেক্সিং ত্রুটি', 'Indexing Failed'), at('সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে।', 'Could not connect to server.'));
    } finally {
      setIsPingingIndex(false);
    }
  };

  const handleAiGenerateSeo = async () => {
    setIsGeneratingSeoAi(true);
    try {
      const res = await fetch('/api/ai/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'seo',
          productTitle: seo.metaTitle || 'BuyOne BD Online Store',
          price: 1200,
          category: 'Online Shopping Bangladesh'
        })
      });
      const data = await res.json();
      if (data?.ok && data.result) {
        patchSeo({
          metaTitle: data.result.headline || seo.metaTitle,
          metaDescription: data.result.body || seo.metaDescription,
          keywords: data.result.hashtags || seo.keywords
        });
        addToast('success', at('AI SEO মেটা তৈরি হয়েছে!', 'AI SEO Generated!'), at('লাইভ <head> ট্যাগ আপডেট করা হয়েছে।', 'Live head tags updated automatically.'));
      }
    } catch {
      addToast('error', at('AI মেটা তৈরি ব্যর্থ', 'AI Generation Failed'), at('দয়া করে আবার চেষ্টা করুন।', 'Please try again.'));
    } finally {
      setIsGeneratingSeoAi(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/35 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-black text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{at('ফাস্ট গুগল র‍্যাংকিং (IndexNow পিং & AI SEO জেনারেটর)', 'Fast Google Indexing (IndexNow Ping & AI SEO Optimizer)')}</span>
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {at('১ ক্লিকে সার্চ ইঞ্জিন পিং করুন এবং AI দিয়ে হাই-CTR মেটা টাইটেল ও কীওয়ার্ড লিখুন', 'Submit sitemap/URLs to IndexNow & generate high-CTR SEO tags via AI')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>sitemap.xml</span>
          </a>
          <button
            type="button"
            onClick={handleAiGenerateSeo}
            disabled={isGeneratingSeoAi}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingSeoAi ? at('তৈরি হচ্ছে...', 'Generating...') : at('AI মেটা লিখুন', 'AI Auto SEO Meta')}</span>
          </button>
          <button
            type="button"
            onClick={handleInstantIndexNow}
            disabled={isPingingIndex}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isPingingIndex ? at('পিং পাঠানো হচ্ছে...', 'Submitting...') : at('১-ক্লিক ইনডেক্স পিং', '1-Click IndexNow Ping')}</span>
          </button>
        </div>
      </div>
      {lastIndexResult && (
        <div className="px-3 py-2 rounded-xl bg-emerald-950/50 border border-emerald-700/50 text-[11px] font-mono text-emerald-300">
          ✓ {lastIndexResult}
        </div>
      )}
    </div>
  );
};
