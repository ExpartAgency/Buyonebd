import React, { useState, useMemo } from 'react';
import {
  Share2,
  Facebook,
  Instagram,
  Youtube,
  Video,
  Sparkles,
  CalendarClock,
  Send,
  Edit,
  Trash2,
  Pause,
  Play,
  Copy,
  Check,
  Save,
  Plus,
  Link2,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SocialPlatform, SocialScheduledPost, SocialChannelConfig } from '../../types';
import { BulkSectionShell, BulkCommandBar } from './BulkSectionShell';

const PLATFORMS: {
  id: SocialPlatform;
  label: string;
  labelBn: string;
  accentClass: string;
}[] = [
  { id: 'facebook', label: 'Facebook Page', labelBn: 'ফেসবুক পেজ', accentClass: 'text-sky-400' },
  { id: 'instagram', label: 'Instagram', labelBn: 'ইনস্টাগ্রাম', accentClass: 'text-pink-400' },
  { id: 'tiktok', label: 'TikTok Shop', labelBn: 'টিকটক শপ', accentClass: 'text-cyan-300' },
  { id: 'youtube', label: 'YouTube Shorts', labelBn: 'ইউটিউব শর্টস', accentClass: 'text-rose-400' }
];

const renderPlatformIcon = (plat: SocialPlatform, className = 'w-4 h-4') => {
  if (plat === 'facebook') return <Facebook className={className} />;
  if (plat === 'instagram') return <Instagram className={className} />;
  if (plat === 'youtube') return <Youtube className={className} />;
  return <Video className={className} />;
};

export const SocialAutoScheduler: React.FC = () => {
  const {
    settings,
    updateSettings,
    saveSettingsChanges,
    products,
    visibleStoreProducts,
    socialPosts,
    addSocialPost,
    updateSocialPost,
    deleteSocialPost,
    bulkDeleteSocialPosts,
    dispatchSocialPostNow,
    syncStoreFromServer,
    getProductCanonicalUrl,
    addToast,
    adminLang
  } = useStore();

  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);

  const socialCfg: Record<SocialPlatform, SocialChannelConfig> = settings.socialAutoConfig || {
    facebook: { enabled: true, accountName: 'BuyOne BD Page', pageOrChannelId: '', accessToken: '', webhookUrl: '', autoPostEnabled: true, intervalHours: 6, defaultHashtags: '#BuyOneBD #BangladeshShopping' },
    instagram: { enabled: true, accountName: '@buyonebd.official', pageOrChannelId: '', accessToken: '', webhookUrl: '', autoPostEnabled: true, intervalHours: 8, defaultHashtags: '#BuyOneBD #BDStyle' },
    tiktok: { enabled: true, accountName: '@buyonebd', pageOrChannelId: '', accessToken: '', webhookUrl: '', autoPostEnabled: true, intervalHours: 8, defaultHashtags: '#BuyOneBD #TikTokBD' },
    youtube: { enabled: true, accountName: 'BuyOne BD Shorts', pageOrChannelId: '', accessToken: '', webhookUrl: '', autoPostEnabled: false, intervalHours: 12, defaultHashtags: '#BuyOneBD #ShortsBD' }
  };

  const updateChannelCfg = (platform: SocialPlatform, patch: Partial<SocialChannelConfig>) => {
    updateSettings({
      socialAutoConfig: {
        ...socialCfg,
        [platform]: {
          ...socialCfg[platform],
          ...patch
        }
      }
    });
  };

  // Single & Bulk Post Generator State
  const [includeHiddenAndDemo, setIncludeHiddenAndDemo] = useState(false);
  const catalogPickerProducts = useMemo(() => {
    if (includeHiddenAndDemo) return products;
    return visibleStoreProducts.length > 0 ? visibleStoreProducts : products;
  }, [includeHiddenAndDemo, products, visibleStoreProducts]);

  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('facebook');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() =>
    (visibleStoreProducts[0]?.id || products[0]?.id) ? [visibleStoreProducts[0]?.id || products[0].id] : []
  );
  const [showSetupGuide, setShowSetupGuide] = useState(true);
  const [copiedFeedUrl, setCopiedFeedUrl] = useState<string | null>(null);
  const [scheduleDatetime, setScheduleDatetime] = useState<string>(() => {
    const dt = new Date(Date.now() + 15 * 60 * 1000);
    return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [staggerHours, setStaggerHours] = useState<number>(4);
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual Composer / Edit State
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [draftPlatform, setDraftPlatform] = useState<SocialPlatform>('facebook');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCaption, setDraftCaption] = useState('');
  const [draftHashtags, setDraftHashtags] = useState('#BuyOneBD #CashOnDelivery #Bangladesh');
  const [draftMediaUrl, setDraftMediaUrl] = useState('');
  const [draftProductUrl, setDraftProductUrl] = useState('');
  const [draftScheduledAt, setDraftScheduledAt] = useState(() => {
    const dt = new Date(Date.now() + 30 * 60 * 1000);
    return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  // Queue Filtering & Bulk Selection
  const [platformFilter, setPlatformFilter] = useState<'all' | SocialPlatform>('all');
  const [selectedQueueIds, setSelectedQueueIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [testingPlatform, setTestingPlatform] = useState<SocialPlatform | null>(null);
  const [channelTestStatus, setChannelTestStatus] = useState<Partial<Record<SocialPlatform, { ok: boolean; msg: string }>>>({});
  const [isRunningCycleNow, setIsRunningCycleNow] = useState(false);
  const [scheduleAllFour, setScheduleAllFour] = useState(false);
  const [utmCampaignTag, setUtmCampaignTag] = useState('auto_social');

  const filteredPosts = useMemo(() => {
    return socialPosts.filter((p) => (platformFilter === 'all' ? true : p.platform === platformFilter));
  }, [socialPosts, platformFilter]);

  const socialQueueFeedUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/feeds/social-queue.json`
      : 'https://buyonebd.com/api/feeds/social-queue.json';

  const handleCopyHelper = (key: string, value: string, label: string) => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopiedFeedUrl(key);
    setTimeout(() => setCopiedFeedUrl(null), 1800);
    addToast('success', at('কপি সম্পন্ন', 'Copied'), label);
  };

  const applyPrimeTimePreset = (hour24: number, minute: number) => {
    const base = new Date();
    if (base.getHours() > hour24 || (base.getHours() === hour24 && base.getMinutes() >= minute)) {
      base.setDate(base.getDate() + 1);
    }
    base.setHours(hour24, minute, 0, 0);
    const localStr = new Date(base.getTime() - base.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setScheduleDatetime(localStr);
    setDraftScheduledAt(localStr);
  };

  const handleTestChannelConnection = async (pl: SocialPlatform) => {
    setTestingPlatform(pl);
    try {
      const res = await fetch('/api/social/test-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: pl, config: socialCfg[pl] })
      });
      const data = await res.json().catch(() => ({}));
      const ok = Boolean(data?.success);
      const msg = data?.message || (ok ? 'Verified' : 'Configuration needed');
      setChannelTestStatus((prev) => ({ ...prev, [pl]: { ok, msg } }));
      addToast(ok ? 'success' : 'warning', `${pl.toUpperCase()} Test`, msg);
    } catch {
      setChannelTestStatus((prev) => ({ ...prev, [pl]: { ok: false, msg: 'Network error' } }));
    } finally {
      setTestingPlatform(null);
    }
  };

  const handleRunCycleNow = async () => {
    setIsRunningCycleNow(true);
    try {
      const res = await fetch('/api/social/run-cycle-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelsOverride: socialCfg })
      });
      const data = await res.json().catch(() => ({}));
      await syncStoreFromServer();
      addToast(
        res.ok ? 'success' : 'error',
        at('অটো-পোস্টার সাইকেল সম্পন্ন', 'Auto-Poster Cycle Completed'),
        data?.dispatchedCount !== undefined
          ? `${data.dispatchedCount} dispatched · ${data.createdCount || 0} auto-generated`
          : data?.message || ''
      );
    } catch {
      addToast('error', at('সাইকেল রান ব্যর্থ', 'Cycle Run Failed'), '');
    } finally {
      setIsRunningCycleNow(false);
    }
  };

  const handleToggleProductSelection = (pid: string) => {
    setSelectedProductIds((prev) => (prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]));
  };

  const handleGenerateAndSchedule = async (publishSingleIntoEditor = false) => {
    const targets = catalogPickerProducts.filter((p) => selectedProductIds.includes(p.id));
    if (targets.length === 0) {
      addToast('warning', at('পণ্য নির্বাচন করুন', 'Select Product'), at('কমপক্ষে ১টি পণ্য বাছাই করুন।', 'Select at least one product.'));
      return;
    }

    setIsGenerating(true);
    try {
      const baseMs = new Date(scheduleDatetime).getTime() || Date.now() + 15 * 60 * 1000;
      const targetPlatforms: SocialPlatform[] =
        !publishSingleIntoEditor && scheduleAllFour
          ? ['facebook', 'instagram', 'tiktok', 'youtube']
          : [selectedPlatform];
      let createdCount = 0;

      for (let i = 0; i < targets.length; i++) {
        const prod = targets[i];
        const rawUrl = getProductCanonicalUrl(prod);
        for (let pIdx = 0; pIdx < targetPlatforms.length; pIdx++) {
          const plat = targetPlatforms[pIdx];
          const prodUrl = utmCampaignTag.trim()
            ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}utm_source=${plat}&utm_medium=social_auto&utm_campaign=${encodeURIComponent(utmCampaignTag.trim())}`
            : rawUrl;
          const res = await fetch('/api/ai/social-caption', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platform: plat,
              product: {
                title: prod.title,
                titleBn: prod.titleBn,
                price: prod.price,
                originalPrice: prod.originalPrice,
                category: prod.category,
                description: prod.description || prod.descriptionBn
              },
              productUrl: prodUrl,
              lang: adminLang
            })
          });
          const json = await res.json().catch(() => null);
          const aiPost = json?.post || json;

          const genTitle = aiPost?.title || prod.title;
          const genCaption =
            aiPost?.caption ||
            `${prod.titleBn || prod.title}\nঅফার মূল্য: ৳${prod.price}\nঅর্ডার লিংক: ${prodUrl}`;
          const genTags: string[] = Array.isArray(aiPost?.hashtags)
            ? aiPost.hashtags
            : ['#BuyOneBD', '#BangladeshShopping', '#CashOnDelivery'];

          if (publishSingleIntoEditor && i === 0 && pIdx === 0) {
            setEditingPostId(null);
            setDraftPlatform(plat);
            setDraftTitle(genTitle);
            setDraftCaption(genCaption);
            setDraftHashtags(genTags.join(' '));
            setDraftMediaUrl(prod.images?.[0] || '');
            setDraftProductUrl(prodUrl);
            addToast('success', at('AI পোস্ট ড্রাফট তৈরি!', 'AI Draft Ready!'), genTitle);
            break;
          }

          const schedIso = new Date(
            baseMs + (i * Math.max(1, staggerHours) + pIdx * 0.5) * 3600 * 1000
          ).toISOString();
          addSocialPost(
            {
              platform: plat,
              productId: prod.id,
              productTitle: prod.title,
              productUrl: prodUrl,
              title: genTitle,
              caption: genCaption,
              hashtags: genTags,
              imageUrl: prod.images?.[0] || '',
              scheduledAt: schedIso,
              status: 'scheduled',
              autoGenerated: true
            },
            { silent: true }
          );
          createdCount++;
        }
        if (publishSingleIntoEditor && i === 0) break;
      }

      if (!publishSingleIntoEditor && createdCount > 0) {
        addToast(
          'success',
          at(`${createdCount}টি অটো পোস্ট শিডিউল সম্পন্ন!`, `Scheduled ${createdCount} AI Social Posts!`),
          scheduleAllFour ? 'ALL 4 PLATFORMS' : selectedPlatform.toUpperCase()
        );
      }
    } catch {
      addToast('error', at('AI জেনারেশন ব্যর্থ', 'Generation Failed'), '');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveManualPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim() || !draftCaption.trim()) return;
    const tags = draftHashtags
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.startsWith('#') ? s : `#${s}`));
    const schedIso = new Date(draftScheduledAt).toISOString();

    if (editingPostId) {
      updateSocialPost(editingPostId, {
        platform: draftPlatform,
        title: draftTitle.trim(),
        caption: draftCaption.trim(),
        hashtags: tags,
        imageUrl: draftMediaUrl.trim(),
        productUrl: draftProductUrl.trim() || undefined,
        scheduledAt: schedIso
      });
      setEditingPostId(null);
    } else {
      addSocialPost({
        platform: draftPlatform,
        title: draftTitle.trim(),
        caption: draftCaption.trim(),
        hashtags: tags,
        imageUrl: draftMediaUrl.trim(),
        productUrl: draftProductUrl.trim() || undefined,
        scheduledAt: schedIso,
        status: 'scheduled',
        autoGenerated: false
      });
    }

    setDraftTitle('');
    setDraftCaption('');
    setDraftMediaUrl('');
    setDraftProductUrl('');
  };

  const startEditPost = (post: SocialScheduledPost) => {
    setEditingPostId(post.id);
    setDraftPlatform(post.platform);
    setDraftTitle(post.title);
    setDraftCaption(post.caption);
    setDraftHashtags((post.hashtags || []).join(' '));
    setDraftMediaUrl(post.imageUrl || '');
    setDraftProductUrl(post.productUrl || '');
    const dt = new Date(post.scheduledAt);
    if (!isNaN(dt.getTime())) {
      setDraftScheduledAt(new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    }
  };

  const handleCopyPost = (post: SocialScheduledPost) => {
    const text = `${post.title}\n\n${post.caption}\n\n${(post.hashtags || []).join(' ')}${post.productUrl ? `\n${post.productUrl}` : ''}`;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 1800);
    addToast('success', at('কপি সম্পন্ন', 'Post Copied'), post.platform.toUpperCase());
  };

  const handleDispatchNow = async (postId: string) => {
    setDispatchingId(postId);
    try {
      await dispatchSocialPostNow(postId);
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <span>{at('অটো সোশ্যাল মিডিয়া শিডিউলার (FB, IG, TikTok, YouTube)', 'Social Auto-Scheduler (Facebook, IG, TikTok & YouTube)')}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {at(
              'ক্যাটালগের পণ্য থেকে স্বয়ংক্রিয়ভাবে টাইটেল, ক্যাপশন, হ্যাশট্যাগ ও লিংকসহ পোস্ট তৈরি করে FB, Instagram, TikTok ও YouTube-এ অটো-পাবলিশ করুন।',
              'Automatically generate titles, captions, hashtags & direct product URLs from your catalog and schedule auto-posts across Facebook, Instagram, TikTok & YouTube.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSetupGuide((prev) => !prev)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>{at('সেটআপ নির্দেশিকা', 'Setup Guide')}</span>
            {showSetupGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            disabled={isRunningCycleNow}
            onClick={handleRunCycleNow}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRunningCycleNow ? 'animate-spin' : ''}`} />
            <span>{isRunningCycleNow ? at('পোস্ট হচ্ছে...', 'Running Cycle...') : at('এখনই অটো সাইকেল চালান', 'Run Auto-Poster Cycle Now')}</span>
          </button>
          <button
            type="button"
            onClick={() => saveSettingsChanges(at('সংরক্ষিত!', 'Saved!'), at('সোশ্যাল অটো-পোস্ট সেটিংস সেভ হয়েছে।', 'Social channel settings saved.'))}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{at('চ্যানেল সেটিংস সেভ করুন', 'Save Channel Config')}</span>
          </button>
        </div>
      </div>

      {/* 0. Step-by-Step Bilingual Setup Instructions (FB, IG, TikTok & YouTube at ৳0) */}
      {showSetupGuide && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/35 space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-black text-sm text-amber-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>
                  {at(
                    'কিভাবে সেটআপ করবেন: সম্পূর্ণ নির্দেশনা (Facebook, Instagram, TikTok ও YouTube Shorts — ৳০ খরচ)',
                    'How to Set Up Social Auto-Scheduler: Step-by-Step Guide (FB, IG, TikTok & YouTube Shorts — ৳0 Spend)'
                  )}
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {at(
                  'সার্ভার প্রতি ৩০ সেকেন্ডে আপনার সময়মতো কিউ করা পোস্ট চেক করে। নিচের যেকোনো ১টি মেথড ব্যবহার করে অটো-পাবলিশ চালু করুন:',
                  'Our background scheduler checks queued posts every 30 seconds. Pick any of the 3 zero-cost methods below:'
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Method A: Direct Meta Graph API (FB + IG Free) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <p className="font-black text-sky-400 text-xs">
                {at('মেথড ১: সরাসরি ফ্রি Facebook ও Instagram API', 'Method 1: Direct Free Meta Graph API (FB & IG)')}
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
                <li>
                  {at(
                    'developers.facebook.com বা Meta Business Suite-এ গিয়ে আপনার Page ID / IG Business Account ID কপি করুন।',
                    'Go to developers.facebook.com → Graph API Explorer (or Business Suite) and copy your Page ID / IG Business ID.'
                  )}
                </li>
                <li>
                  {at(
                    'Page Access Token জেনারেট করুন (pages_manage_posts, instagram_content_publish পারমিশন সহ)।',
                    'Generate a Page Token with pages_manage_posts & instagram_content_publish permissions.'
                  )}
                </li>
                <li>
                  {at(
                    'নিচের Facebook / Instagram কার্ডে ID এবং Token বসিয়ে "কানেকশন টেস্ট" তারপর "চ্যানেল সেটিংস সেভ" চাপুন।',
                    'Paste Page/Account ID & Token below → click Test Connection → click Save Channel Config.'
                  )}
                </li>
              </ol>
            </div>

            {/* Method B: Free Webhook (Make.com / Zapier / n8n for TikTok, YT, FB, IG) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <p className="font-black text-emerald-400 text-xs">
                {at('মেথড ২: Make.com / Zapier / n8n ফ্রি ওয়েবহুক (TikTok ও YouTube সহ ৪টি)', 'Method 2: Free Webhook (Make.com / n8n — FB, IG, TikTok & YT)')}
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
                <li>
                  {at(
                    'ফ্রি Make.com / n8n / Zapier অ্যাকাউন্ট খুলে "Custom Webhook" ট্রিগার তৈরি করুন এবং Webhook URL কপি করুন।',
                    'Create a free Make.com / n8n scenario with a Custom Webhook trigger and copy its URL.'
                  )}
                </li>
                <li>
                  {at(
                    'টিকটক / ইউটিউব / ফেসবুক / ইনস্টাগ্রাম কার্ডের Webhook URL বক্সে পেস্ট করে Auto-Post ON ও Save করুন।',
                    'Paste that URL into the TikTok, YouTube, FB or IG Webhook field below and Save Channel Config.'
                  )}
                </li>
                <li>
                  {at(
                    'অথবা আমাদের লাইভ JSON ফিড পোল করুন — অটো-শিডিউলার নতুন পোস্ট সাথে সাথে পাঠাবে।',
                    'Or poll our public JSON Queue Feed below every 15 mins without configuring webhooks.'
                  )}
                </li>
              </ol>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyHelper('queue-feed', socialQueueFeedUrl, 'JSON Queue Feed URL')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedFeedUrl === 'queue-feed' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{at('JSON ফিড লিংক কপি', 'Copy JSON Queue URL')}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyHelper(
                      'webhook-sample',
                      JSON.stringify(
                        {
                          platform: 'tiktok',
                          title: 'Product Title',
                          caption: 'Caption + Offer Price',
                          hashtags: ['#BuyOneBD', '#CashOnDelivery'],
                          imageUrl: 'https://...',
                          productUrl: 'https://buyonebd.com/product/...',
                          scheduledAt: new Date().toISOString()
                        },
                        null,
                        2
                      ),
                      'Sample Webhook JSON'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedFeedUrl === 'webhook-sample' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{at('Webhook JSON ফরম্যাট কপি', 'Copy Payload JSON')}</span>
                </button>
              </div>
            </div>

            {/* Method C: Zero-Setup Instant AI & 1-Click Share */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <p className="font-black text-amber-300 text-xs">
                {at('মেথড ৩: জিরো-সেটআপ ইনস্ট্যান্ট AI + ১-ক্লিক শেয়ার (টোকেন ছাড়াই)', 'Method 3: Zero-Setup Instant AI & Direct Studio Upload')}
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
                <li>
                  {at(
                    'কোনো API কী ছাড়াই নিচে থেকে আপনার পণ্য সিলেক্ট করুন ও "4 Platforms Together" টিক দিয়ে AI Auto-Schedule চাপুন।',
                    'With zero API keys: select products below, check "All 4 Platforms Together", and click Auto-Generate & Schedule.'
                  )}
                </li>
                <li>
                  {at(
                    'কিউ তালিকায় প্রতিটি পোস্টের পাশে "Publish Now", Copy, Facebook Share, TikTok Upload এবং YouTube Studio বাটন পাবেন।',
                    'Every queued post has 1-click Copy, FB Share, TikTok Studio & YouTube Upload buttons (copies hashtags & link automatically).'
                  )}
                </li>
                <li>
                  {at(
                    'কোনো টোকেন না থাকলে "Publish Now" চাপলে পোস্টটি সেফভাবে Ready/Queued হয়ে যাবে যাতে দ্রুত ম্যানুয়ালি পোস্ট করতে পারেন।',
                    'Even without tokens, clicking Publish Now or Run Cycle logs & tracks your schedule seamlessly.'
                  )}
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* 1. 4-Platform Connection & Auto-Pilot Cadence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-xs">
        {PLATFORMS.map((pl) => {
          const cfg = socialCfg[pl.id];
          return (
            <div key={pl.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className={`flex items-center gap-2 font-black text-sm ${pl.accentClass}`}>
                  {renderPlatformIcon(pl.id, 'w-4 h-4')}
                  <span>{at(pl.labelBn, pl.label)}</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={cfg.enabled}
                    onChange={(e) => updateChannelCfg(pl.id, { enabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span>{cfg.enabled ? 'ON' : 'OFF'}</span>
                </label>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">
                    {pl.id === 'youtube' ? 'Channel ID' : 'Page / Account ID'}
                  </label>
                  <input
                    type="text"
                    value={cfg.pageOrChannelId}
                    onChange={(e) => updateChannelCfg(pl.id, { pageOrChannelId: e.target.value })}
                    placeholder={`@buyonebd_${pl.id}`}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Webhook / Zapier / Make URL</label>
                  <input
                    type="url"
                    value={cfg.webhookUrl}
                    onChange={(e) => updateChannelCfg(pl.id, { webhookUrl: e.target.value })}
                    placeholder="https://hook.make.com/..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Graph / API Token (Optional)</label>
                  <input
                    type="password"
                    value={cfg.accessToken}
                    onChange={(e) => updateChannelCfg(pl.id, { accessToken: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-emerald-300">
                    <input
                      type="checkbox"
                      checked={cfg.autoPostEnabled}
                      onChange={(e) => updateChannelCfg(pl.id, { autoPostEnabled: e.target.checked })}
                      className="w-3.5 h-3.5 accent-emerald-500 rounded"
                    />
                    <span>{at('অটো-পোস্ট চালু', 'Auto-Post')}</span>
                  </label>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>{at('প্রতি', 'Every')}</span>
                    <input
                      type="number"
                      min={1}
                      max={72}
                      value={cfg.intervalHours}
                      onChange={(e) => updateChannelCfg(pl.id, { intervalHours: Math.max(1, Number(e.target.value) || 6) })}
                      className="w-12 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-white font-mono text-center"
                    />
                    <span>h</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={testingPlatform === pl.id}
                    onClick={() => handleTestChannelConnection(pl.id)}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {testingPlatform === pl.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    <span>{testingPlatform === pl.id ? 'Testing...' : at('কানেকশন টেস্ট', 'Test Connection')}</span>
                  </button>
                </div>
                {channelTestStatus[pl.id] && (
                  <p className={`text-[10px] font-semibold flex items-center gap-1 ${channelTestStatus[pl.id]?.ok ? 'text-emerald-400' : 'text-amber-300'}`}>
                    {channelTestStatus[pl.id]?.ok ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <AlertCircle className="w-3 h-3 shrink-0" />}
                    <span className="truncate">{channelTestStatus[pl.id]?.msg}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Catalog-to-Social AI Generator + Manual Post Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
        {/* Left 6: Select Products & Auto-Generate Bulk Scheduled Posts */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{at('পণ্য থেকে অটো AI পোস্ট জেনারেটর', 'Auto Product-to-Social AI Generator')}</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                {at('এক বা একাধিক পণ্য সিলেক্ট করে এক সাথে অটো ক্যাপশন ও হ্যাশট্যাগসহ শিডিউল করুন।', 'Pick 1 or multiple products to auto-generate AI titles, hashtags & timed posts.')}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PLATFORMS.map((pl) => (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => {
                    setScheduleAllFour(false);
                    setSelectedPlatform(pl.id);
                  }}
                  className={`py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 border cursor-pointer transition-colors ${
                    !scheduleAllFour && selectedPlatform === pl.id
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {renderPlatformIcon(pl.id, 'w-3.5 h-3.5')}
                  <span>{pl.id.toUpperCase()}</span>
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-[11px] font-bold text-amber-300">
              <input
                type="checkbox"
                checked={scheduleAllFour}
                onChange={(e) => setScheduleAllFour(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span>{at('একসাথে ৪টি প্ল্যাটফর্মেই শিডিউল করুন (FB + IG + TikTok + YouTube)', 'Auto-Schedule Across All 4 Platforms Together (FB + IG + TikTok + YT)')}</span>
            </label>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <span className="font-bold text-slate-300">
                {at(`আপনার ক্যাটালগ পণ্য বাছাই (${selectedProductIds.length} সিলেক্টেড)`, `Select Own Products (${selectedProductIds.length} selected)`)}
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <label className="inline-flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeHiddenAndDemo}
                    onChange={(e) => setIncludeHiddenAndDemo(e.target.checked)}
                    className="w-3.5 h-3.5 accent-emerald-500 rounded"
                  />
                  <span>{at('লুকানো/ডেমো পণ্য দেখান', 'Include Hidden/Demo')}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedProductIds(catalogPickerProducts.map((p) => p.id))}
                  className="text-emerald-400 hover:underline font-bold cursor-pointer"
                >
                  {at('সব বাছুন', 'Select All')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProductIds([])}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  {at('মুছুন', 'Clear')}
                </button>
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 divide-y divide-slate-800/80">
              {catalogPickerProducts.map((prod) => {
                const checked = selectedProductIds.includes(prod.id);
                return (
                  <label
                    key={prod.id}
                    className={`px-3 py-2 flex items-center gap-2.5 cursor-pointer hover:bg-slate-900 ${
                      checked ? 'bg-emerald-950/30' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleProductSelection(prod.id)}
                      className="w-4 h-4 accent-emerald-500 shrink-0"
                    />
                    {prod.images?.[0]?.trim() ? (
                      <img src={prod.images[0]} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-slate-800 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate">{at(prod.titleBn, prod.title)}</p>
                      <p className="text-[10px] font-mono text-emerald-400 tabular-nums">৳{prod.price.toLocaleString()}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">{at('প্রথম পোস্টের সময়', 'First Post Time')}</label>
              <input
                type="datetime-local"
                value={scheduleDatetime}
                onChange={(e) => setScheduleDatetime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">{at('বিরতি (ঘন্টা)', 'Stagger (Hours)')}</label>
              <input
                type="number"
                min={1}
                max={48}
                value={staggerHours}
                onChange={(e) => setStaggerHours(Math.max(1, Number(e.target.value) || 4))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">{at('UTM ক্যাম্পেইন ট্যাগ', 'UTM Campaign Tag')}</label>
              <input
                type="text"
                value={utmCampaignTag}
                onChange={(e) => setUtmCampaignTag(e.target.value)}
                placeholder="auto_social"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="text-slate-400 font-bold">{at('BD প্রাইম-টাইম প্রিসেট:', 'BD Prime Time:')}</span>
            {[
              { label: '10:00 AM', h: 10, m: 0 },
              { label: '02:00 PM', h: 14, m: 0 },
              { label: '08:00 PM Prime', h: 20, m: 0 },
              { label: '10:30 PM Late', h: 22, m: 30 }
            ].map((pr) => (
              <button
                key={pr.label}
                type="button"
                onClick={() => applyPrimeTimePreset(pr.h, pr.m)}
                className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-sky-300 font-bold cursor-pointer"
              >
                {pr.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGenerateAndSchedule(false)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarClock className="w-4 h-4" />
              <span>
                {isGenerating
                  ? at('AI পোস্ট তৈরি হচ্ছে...', 'Generating AI Posts...')
                  : at(`AI অটো শিডিউল (${selectedProductIds.length})`, `Auto-Generate & Schedule (${selectedProductIds.length})`)}
              </span>
            </button>
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGenerateAndSchedule(true)}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold cursor-pointer"
            >
              {at('এডিটরে ড্রাফট আনুন', 'Load AI Draft')}
            </button>
          </div>
        </div>

        {/* Right 6: Manual / Edit Post Composer */}
        <form onSubmit={handleSaveManualPost} className="lg:col-span-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-sky-400" />
              <span>
                {editingPostId
                  ? at('শিডিউল পোস্ট এডিট করুন', 'Edit Scheduled Post')
                  : at('কাস্টম সোশ্যাল পোস্ট লিখুন', 'Create / Customize Social Post')}
              </span>
            </h4>
            {editingPostId && (
              <button
                type="button"
                onClick={() => {
                  setEditingPostId(null);
                  setDraftTitle('');
                  setDraftCaption('');
                }}
                className="text-[11px] text-rose-400 hover:underline cursor-pointer"
              >
                {at('বাতিল', 'Cancel Edit')}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">{at('প্ল্যাটফর্ম', 'Platform')}</label>
              <select
                value={draftPlatform}
                onChange={(e) => setDraftPlatform(e.target.value as SocialPlatform)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
              >
                <option value="facebook">Facebook Page</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube Shorts</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">{at('পোস্ট টাইম', 'Publish Time')}</label>
              <input
                type="datetime-local"
                value={draftScheduledAt}
                onChange={(e) => setDraftScheduledAt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1">{at('পোস্ট টাইটেল / হুক *', 'Post Hook / Title *')}</label>
            <input
              type="text"
              required
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder={at('যেমন: ঈদ স্পেশাল সুপার ডিল ৫০% ছাড়!', 'e.g. Limited Stock Flash Drop — Order Today!')}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1">{at('ক্যাপশন ও বিবরণ *', 'Post Caption *')}</label>
            <textarea
              rows={4}
              required
              value={draftCaption}
              onChange={(e) => setDraftCaption(e.target.value)}
              placeholder={at('পণ্যের বিস্তারিত, দাম ও অর্ডার লিংক...', 'Engaging product copy, price, COD info & URL...')}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">{at('হ্যাশট্যাগ (Hashtags)', 'Hashtags')}</label>
              <input
                type="text"
                value={draftHashtags}
                onChange={(e) => setDraftHashtags(e.target.value)}
                placeholder="#BuyOneBD #Bangladesh #Sale"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sky-300 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">{at('ছবি / মিডিয়া URL', 'Image / Media URL')}</label>
              <input
                type="text"
                value={draftMediaUrl}
                onChange={(e) => setDraftMediaUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1">{at('ডিরেক্ট প্রোডাক্ট URL', 'Direct Product Link')}</label>
            <input
              type="text"
              value={draftProductUrl}
              onChange={(e) => setDraftProductUrl(e.target.value)}
              placeholder="https://.../product/..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{editingPostId ? at('পরিবর্তন সেভ করুন', 'Save Post Changes') : at('শিডিউলে যোগ করুন', 'Add to Auto-Schedule Queue')}</span>
          </button>
        </form>
      </div>

      {/* 3. Scheduled Queue & Published History with Bulk Selection */}
      <BulkSectionShell
        indexCode="BULK // SOCIAL QUEUE"
        title={at(`শিডিউল ও অটো-পাবলিশ কিউ (${filteredPosts.length}টি)`, `Social Auto-Post Queue & History (${filteredPosts.length})`)}
        subtitle={at(
          'প্রতি ৩০ সেকেন্ডে ব্যাকগ্রাউন্ড শিডিউলার সময় অনুযায়ী পোস্ট অটো-পাবলিশ করে; চাইলে সাথে সাথে Publish Now বা এডিট/ডিলিট করুন।',
          'Background scheduler dispatches due posts automatically every 30s. Filter, edit, pause, publish immediately, or bulk delete.'
        )}
        totalCount={filteredPosts.length}
        selectedCount={selectedQueueIds.length}
        accent="cyan"
        headerActions={
          <div className="flex flex-wrap items-center gap-1.5">
            {(['all', 'facebook', 'instagram', 'tiktok', 'youtube'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setPlatformFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer whitespace-nowrap ${
                  platformFilter === f ? 'bg-emerald-600 text-white' : 'bg-slate-950 border border-slate-700 text-slate-300'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        }
      >
        <BulkCommandBar
          selectedCount={selectedQueueIds.length}
          totalCount={filteredPosts.length}
          allSelected={filteredPosts.length > 0 && filteredPosts.every((p) => selectedQueueIds.includes(p.id))}
          onToggleSelectAll={() =>
            setSelectedQueueIds(
              filteredPosts.length > 0 && filteredPosts.every((p) => selectedQueueIds.includes(p.id))
                ? []
                : filteredPosts.map((p) => p.id)
            )
          }
          onClearSelection={() => setSelectedQueueIds([])}
          itemLabel="posts"
        >
          {selectedQueueIds.length > 0 && (
            <button
              type="button"
              onClick={() => {
                bulkDeleteSocialPosts(selectedQueueIds);
                setSelectedQueueIds([]);
              }}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{at(`ডিলিট (${selectedQueueIds.length})`, `Delete (${selectedQueueIds.length})`)}</span>
            </button>
          )}
        </BulkCommandBar>

        <div className="divide-y divide-slate-800">
          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              {at(
                'এখনো কোনো শিডিউল পোস্ট নেই। উপরে পণ্য বাছাই করে "Auto-Generate & Schedule" চাপুন।',
                'No scheduled social posts yet. Select products above and click "Auto-Generate & Schedule".'
              )}
            </div>
          ) : (
            filteredPosts.map((post) => {
              const checked = selectedQueueIds.includes(post.id);
              return (
                <div
                  key={post.id}
                  className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                    checked ? 'bg-emerald-950/20' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedQueueIds((prev) => [...prev, post.id]);
                        else setSelectedQueueIds((prev) => prev.filter((id) => id !== post.id));
                      }}
                      className="mt-1 w-4 h-4 accent-emerald-500 cursor-pointer shrink-0"
                    />
                    {post.imageUrl?.trim() ? (
                      <img src={post.imageUrl} alt={post.title} referrerPolicy="no-referrer" className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                        <Globe className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="inline-flex items-center gap-1 font-bold text-white uppercase">
                          {renderPlatformIcon(post.platform, 'w-3.5 h-3.5 text-emerald-400')}
                          {post.platform}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span
                          className={`font-bold uppercase ${
                            post.status === 'published'
                              ? 'text-emerald-400'
                              : post.status === 'failed'
                              ? 'text-rose-400'
                              : post.status === 'paused'
                              ? 'text-amber-300'
                              : 'text-sky-400'
                          }`}
                        >
                          {post.status}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="font-mono text-slate-400 tabular-nums">
                          {new Date(post.scheduledAt).toLocaleString()}
                        </span>
                      </div>
                      <h5 className="font-bold text-white text-sm truncate">{post.title}</h5>
                      <p className="text-slate-300 line-clamp-2 whitespace-pre-line">{post.caption}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-sky-400 font-mono">
                        <span>{(post.hashtags || []).join(' ')}</span>
                        {post.productUrl && (
                          <span className="inline-flex items-center gap-1 text-emerald-400 truncate max-w-[260px]">
                            <Link2 className="w-3 h-3 shrink-0" />
                            {post.productUrl}
                          </span>
                        )}
                      </div>
                      {(post.dispatchLog || post.externalPostId || post.errorNote) && (
                        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] font-mono">
                          {post.externalPostId && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              Post ID: {post.externalPostId}
                            </span>
                          )}
                          {post.dispatchLog && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {post.dispatchLog}
                            </span>
                          )}
                          {post.errorNote && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              {post.errorNote}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={dispatchingId === post.id}
                      onClick={() => handleDispatchNow(post.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>{dispatchingId === post.id ? '...' : at('এখনই পোস্ট', 'Publish Now')}</span>
                    </button>
                    {post.productUrl && (
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(post.productUrl)}&quote=${encodeURIComponent(`${post.title}\n\n${post.caption}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-sky-950/70 hover:bg-sky-800 border border-sky-700 text-sky-300"
                        title="Share Direct on Facebook"
                      >
                        <Facebook className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <a
                      href="https://www.tiktok.com/creator-center/upload"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleCopyPost(post)}
                      className="p-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-800 border border-cyan-700 text-cyan-300"
                      title="Copy Caption & Open TikTok Upload Studio"
                    >
                      <Video className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="https://studio.youtube.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleCopyPost(post)}
                      className="p-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-800 border border-rose-700 text-rose-300"
                      title="Copy Caption & Open YouTube Studio"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        updateSocialPost(post.id, { status: post.status === 'paused' ? 'scheduled' : 'paused' })
                      }
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 cursor-pointer"
                      title={post.status === 'paused' ? 'Resume' : 'Pause'}
                    >
                      {post.status === 'paused' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyPost(post)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 cursor-pointer"
                      title="Copy"
                    >
                      {copiedId === post.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditPost(post)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSocialPost(post.id)}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </BulkSectionShell>
    </div>
  );
};
