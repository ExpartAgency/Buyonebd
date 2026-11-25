import React, { useState, useRef, useMemo } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  Zap,
  Terminal,
  ShoppingCart,
  Flame,
  Award,
  MessageCircle,
  Truck,
  ShieldCheck,
  Volume2,
  VolumeX,
  Wrench,
  AlertTriangle,
  RefreshCw,
  Check,
  X,
  RotateCcw,
  Share2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AIAutopilotSettings, AIReviewTask, CourierProvider } from '../../types';
import { speakClearText, stopAllVoicePlayback } from '../../utils/voiceAudio';
import { INITIAL_SETTINGS } from '../../data/initialData';

interface AIWebsiteAgentViewProps {
  onNavigateTab: (tab: string) => void;
}

export const AIWebsiteAgentView: React.FC<AIWebsiteAgentViewProps> = ({ onNavigateTab }) => {
  const {
    executeAIAgentCommand,
    agentActionLogs,
    aiReviewQueue,
    isScanningAutopilot,
    maintenanceAuditReport,
    scanWebsiteForAIReview,
    runWebsiteMaintenanceAudit,
    restoreStoreFromServerBackup,
    approveAIReviewTask,
    approveAllPendingAIReviewTasks,
    dismissAIReviewTask,
    clearCompletedAIReviewTasks,
    orders,
    products,
    visibleStoreProducts,
    customerAccounts,
    abandonedCarts,
    chatInquiries,
    updateChatInquiry,
    addSocialPost,
    getProductCanonicalUrl,
    runFullZeroCostAutopilot,
    settings,
    updateSettings,
    saveSettingsChanges,
    addToast,
    adminLang
  } = useStore();

  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);

  const [commandInput, setCommandInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [isSpeakingBrief, setIsSpeakingBrief] = useState(false);
  const [isRunningFullAutopilot, setIsRunningFullAutopilot] = useState(false);
  const [fullAutopilotPlan, setFullAutopilotPlan] = useState<{
    executiveSummary: string;
    inquiryReplies: { inquiryId: string; replyText: string }[];
    featuredProductId: string;
    promoTitle: string;
    promoCaption: string;
    promoHashtags: string[];
    zeroCostActions: string[];
  } | null>(null);
  const [appliedInquiryReplies, setAppliedInquiryReplies] = useState(false);
  const [scheduledAutopilotPromo, setScheduledAutopilotPromo] = useState(false);
  const [queueFilter, setQueueFilter] = useState<'pending' | 'executed' | 'all'>('pending');
  const [taskEdits, setTaskEdits] = useState<Record<string, Partial<AIReviewTask['payload']>>>({});
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const autopilotCfg: AIAutopilotSettings = {
    ...(INITIAL_SETTINGS.aiAutopilotSettings as AIAutopilotSettings),
    ...(settings.aiAutopilotSettings || {})
  };

  const patchAutopilot = (partial: Partial<AIAutopilotSettings>) => {
    updateSettings(
      {
        aiAutopilotSettings: {
          ...autopilotCfg,
          ...partial
        }
      },
      { commit: true }
    );
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'on_hold').length;
  const partialOrdersCount = orders.filter(
    (o) => o.status === 'partial' || ((o.pricing?.advancePaid || 0) > 0 && (o.payment?.dueAmount || 0) > 0)
  ).length;
  const unrecoveredCartsCount = abandonedCarts.filter((c) => !c.recovered).length;
  const pendingReviewTasks = useMemo(() => aiReviewQueue.filter((t) => t.status === 'pending_review'), [aiReviewQueue]);
  const executedReviewTasks = useMemo(() => aiReviewQueue.filter((t) => t.status === 'executed'), [aiReviewQueue]);

  const visibleQueueTasks = useMemo(() => {
    if (queueFilter === 'pending') return pendingReviewTasks;
    if (queueFilter === 'executed') return executedReviewTasks;
    return aiReviewQueue;
  }, [aiReviewQueue, queueFilter, pendingReviewTasks, executedReviewTasks]);

  const handleRunCommand = async (rawText?: string) => {
    const query = (rawText ?? commandInput).trim();
    if (!query || isExecuting) return;
    if (!rawText) setCommandInput('');
    setIsExecuting(true);
    try {
      await executeAIAgentCommand(query, 'admin', onNavigateTab);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleVoiceMic = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    if (isListeningVoice && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListeningVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = adminLang === 'en' ? 'en-US' : 'bn-BD';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => setIsListeningVoice(true);
      recognition.onend = () => setIsListeningVoice(false);
      recognition.onerror = () => setIsListeningVoice(false);
      recognition.onresult = (ev: any) => {
        const spoken = ev.results?.[0]?.[0]?.transcript;
        if (spoken) {
          setCommandInput(spoken);
          handleRunCommand(spoken);
        }
      };
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListeningVoice(false);
    }
  };

  const handleSpeakMaintenanceBrief = async () => {
    if (isSpeakingBrief) {
      stopAllVoicePlayback();
      setIsSpeakingBrief(false);
      return;
    }
    const score = maintenanceAuditReport?.healthScore ?? 96;
    const summaryText =
      adminLang === 'en'
        ? `BuyOne BD Store Maintenance Brief. Website health score is ${score} percent. You have ${pendingOrdersCount} pending orders and ${pendingReviewTasks.length} AI tasks waiting for your review.`
        : `বাইওয়ান বিডি স্টোর মেইনটেন্যান্স ব্রিফ। আপনার ওয়েবসাইট হেলথ স্কোর ${score} শতাংশ। বর্তমানে ${pendingOrdersCount}টি পেন্ডিং অর্ডার এবং ${pendingReviewTasks.length}টি এআই কাজ আপনার অনুমোদনের জন্য অপেক্ষা করছে।`;
    setIsSpeakingBrief(true);
    try {
      await speakClearText(summaryText, {
        lang: adminLang,
        voice: settings.aiCallSettings?.voiceName || (settings.aiCallSettings?.agentGender === 'male' ? 'Puck' : 'Kore')
      });
    } finally {
      setIsSpeakingBrief(false);
    }
  };

  const handleRunFullZeroCostSweep = async () => {
    setIsRunningFullAutopilot(true);
    setAppliedInquiryReplies(false);
    setScheduledAutopilotPromo(false);
    try {
      const plan = await runFullZeroCostAutopilot();
      if (plan) setFullAutopilotPlan(plan);
    } finally {
      setIsRunningFullAutopilot(false);
    }
  };

  const handleApplyAllInquiryReplies = async () => {
    if (!fullAutopilotPlan?.inquiryReplies?.length) return;
    let applied = 0;
    for (const rep of fullAutopilotPlan.inquiryReplies) {
      const target = chatInquiries.find((q) => q.id === rep.inquiryId);
      if (target && rep.replyText?.trim()) {
        await updateChatInquiry(rep.inquiryId, {
          adminReply: rep.replyText.trim(),
          status: 'replied'
        });
        applied++;
      }
    }
    setAppliedInquiryReplies(true);
    addToast(
      'success',
      at(`${applied}টি ইনকোয়ারির উত্তর পাঠানো হয়েছে!`, `Applied ${applied} Inquiry Replies!`),
      at('লাইভ চ্যাট/ইনকোয়ারি ডেস্কে সংরক্ষিত হয়েছে', 'Saved to Customer Inquiries Desk')
    );
  };

  const handleScheduleAutopilotSocial = () => {
    if (!fullAutopilotPlan) return;
    const pool = visibleStoreProducts.length > 0 ? visibleStoreProducts : products;
    const featProd = pool.find((p) => p.id === fullAutopilotPlan.featuredProductId) || pool[0];
    if (!featProd) return;
    const baseUrl = getProductCanonicalUrl(featProd);
    const platforms: ('facebook' | 'instagram' | 'tiktok' | 'youtube' | 'telegram')[] = ['facebook', 'instagram', 'tiktok', 'youtube', 'telegram'];
    platforms.forEach((plat, idx) => {
      addSocialPost(
        {
          platform: plat,
          productId: featProd.id,
          productTitle: featProd.title,
          productUrl: `${baseUrl}?utm_source=${plat}&utm_medium=ai_autopilot`,
          title: fullAutopilotPlan.promoTitle || featProd.title,
          caption: `${fullAutopilotPlan.promoCaption}\n\n👉 অর্ডার লিংক: ${baseUrl}?utm_source=${plat}&utm_medium=ai_autopilot`,
          hashtags:
            Array.isArray(fullAutopilotPlan.promoHashtags) && fullAutopilotPlan.promoHashtags.length > 0
              ? fullAutopilotPlan.promoHashtags.map((t) => (t.startsWith('#') ? t : `#${t}`))
              : ['#BuyOneBD', '#BangladeshShopping', '#CashOnDelivery'],
          imageUrl: featProd.images?.[0] || '',
          scheduledAt: new Date(Date.now() + (15 + idx * 30) * 60 * 1000).toISOString(),
          status: 'scheduled',
          autoGenerated: true
        },
        { silent: true }
      );
    });
    setScheduledAutopilotPromo(true);
    addToast(
      'success',
      at('৫টি প্ল্যাটফর্মেই প্রোমো শিডিউল সম্পন্ন!', 'Scheduled Promo Across All 5 Channels!'),
      featProd.title
    );
  };

  const getEditedPayload = (task: AIReviewTask) => ({
    ...task.payload,
    ...(taskEdits[task.id] || {})
  });

  const patchTaskPayload = (taskId: string, patch: Partial<AIReviewTask['payload']>) => {
    setTaskEdits((prev) => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {}),
        ...patch
      }
    }));
  };

  const quickPresets = [
    {
      labelBn: `সকল পেন্ডিং অর্ডার AI কনফার্ম (${pendingOrdersCount})`,
      labelEn: `AI Confirm Pending Orders (${pendingOrdersCount})`,
      cmd: orders.find((o) => o.status === 'pending')
        ? `AI confirm order #${orders.find((o) => o.status === 'pending')?.id}`
        : 'Open orders tab',
      icon: CheckCircle2
    },
    {
      labelBn: 'ফ্ল্যাশ সেল চালু / বন্ধ',
      labelEn: settings.flashSale?.enabled ? 'Turn OFF Flash Sale' : 'Turn ON Flash Sale',
      cmd: settings.flashSale?.enabled ? 'Turn off flash sale' : 'Turn on flash sale',
      icon: Flame
    },
    {
      labelBn: 'নতুন কুপন EID200 তৈরি',
      labelEn: 'Create Coupon EID200',
      cmd: 'Create coupon EID200 with 200 taka discount',
      icon: Zap
    },
    {
      labelBn: `অ্যাবানডন্ড কার্ট রিকভার (${unrecoveredCartsCount})`,
      labelEn: `Recover Carts (${unrecoveredCartsCount})`,
      cmd: 'Send WhatsApp recovery to all pending abandoned carts',
      icon: MessageCircle
    },
    {
      labelBn: `পার্শিয়াল অর্ডার (${partialOrdersCount})`,
      labelEn: `Partial Orders (${partialOrdersCount})`,
      cmd: 'Open partial orders section',
      icon: ShoppingCart
    },
    {
      labelBn: 'কুরিয়ারে অর্ডার পাঠান',
      labelEn: 'Book Courier',
      cmd: orders.find((o) => o.status === 'ai_confirmed' && !o.courier?.trackingCode)
        ? `Book ${autopilotCfg.preferredCourier} courier for order #${orders.find((o) => o.status === 'ai_confirmed' && !o.courier?.trackingCode)?.id}`
        : 'Open courier hub',
      icon: Truck
    },
    {
      labelBn: 'কাস্টমারকে +50 পয়েন্ট',
      labelEn: '+50 Loyalty Points',
      cmd: customerAccounts[0]
        ? `Add 50 loyalty points to ${customerAccounts[0].phone}`
        : 'Open customers tab',
      icon: Award
    }
  ];

  const healthScore = maintenanceAuditReport?.healthScore ?? 96;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Full Website Maintenance & Review Control Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-400" />
            <span>{at('ফুল ওয়েবসাইট মেইনটেন্যান্স ও কন্ট্রোল এআই সিস্টেম', 'Full Website Maintenance & Review Control AI')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {at(
              'এআই পুরো ওয়েবসাইট স্ক্যান করে সমস্যা ও অর্ডার/কুরিয়ার/কল/SEO প্রস্তাব তৈরি করবে — আপনার অনুমোদন ছাড়া কোনো পরিবর্তন হবে না',
              'AI audits SEO, stock, pending orders, voice calls & courier bookings — everything queues cleanly for your explicit review & approval'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSpeakMaintenanceBrief}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              isSpeakingBrief
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-900 border-slate-700 text-emerald-300 hover:bg-slate-800'
            }`}
          >
            {isSpeakingBrief ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeakingBrief ? at('থামান', 'Stop Voice') : at('ভয়েস ব্রিফ শুনুন', 'Clear Voice Brief')}</span>
          </button>

          <button
            type="button"
            disabled={isRunningAudit}
            onClick={async () => {
              setIsRunningAudit(true);
              await runWebsiteMaintenanceAudit();
              setIsRunningAudit(false);
            }}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Wrench className={`w-3.5 h-3.5 ${isRunningAudit ? 'animate-spin' : ''}`} />
            <span>{isRunningAudit ? at('অডিট চলছে...', 'Scanning Site...') : at('ফুল ওয়েবসাইট মেইনটেন্যান্স স্ক্যান', 'Run Full Maintenance Scan')}</span>
          </button>

          <button
            type="button"
            disabled={isScanningAutopilot}
            onClick={() => scanWebsiteForAIReview()}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanningAutopilot ? 'animate-spin' : ''}`} />
            <span>{isScanningAutopilot ? at('স্ক্যান হচ্ছে...', 'Queueing...') : at('অর্ডার ও রিভিউ কিউ তৈরি', 'Scan Orders & Queue')}</span>
          </button>
        </div>
      </div>

      {/* 2. Health Score, "Only I Review" Mode & Non-Destructive Backup Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase text-slate-400 block">
              {at('ওয়েবসাইট হেলথ স্কোর', 'Website Maintenance Score')}
            </span>
            <div className="flex items-baseline gap-2 tabular-nums">
              <span className={`text-3xl font-black font-mono ${healthScore >= 85 ? 'text-emerald-400' : healthScore >= 65 ? 'text-amber-400' : 'text-rose-400'}`}>
                {healthScore}%
              </span>
              <span className="text-xs text-slate-400">
                {maintenanceAuditReport ? `Audited ${new Date(maintenanceAuditReport.auditedAt).toLocaleTimeString()}` : at('সিস্টেম সুরক্ষিত', 'Protected Mode')}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" />
                {at('ডাটা ডিলিট সুরক্ষা সক্রিয়', 'Zero Data Loss Guard Active')}
              </span>
              <button
                type="button"
                onClick={() => restoreStoreFromServerBackup()}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-300 hover:text-white bg-slate-800 px-2 py-0.5 rounded cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{at('সার্ভার ব্যাকআপ রিস্টোর', 'Restore Backup')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center tabular-nums shrink-0">
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{at('পেন্ডিং অর্ডার', 'Orders')}</span>
              <span className="font-mono font-black text-amber-400 text-sm">{pendingOrdersCount}</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{at('নিজের লাইভ পণ্য', 'Own Store')}</span>
              <span className="font-mono font-black text-emerald-400 text-sm">
                {visibleStoreProducts.length} / {products.length}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-black text-white">
                  {at('অ্যাডমিন রিভিউ কন্ট্রোল ("শুধুমাত্র আমি রিভিউ করব")', 'Human-in-the-Loop Control ("Only I Review")')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {at(
                  'চালু থাকলে AI কল, অর্ডার কনফার্ম, কুরিয়ার বুকিং ও SEO পরিবর্তনের আগে আপনার অনুমোদন নেবে।',
                  'When ON, AI proposes order confirmations, voice calls, courier bookings & SEO fixes into your approval queue before execution.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <select
                value={autopilotCfg.preferredCourier}
                onChange={(e) => patchAutopilot({ preferredCourier: e.target.value as CourierProvider })}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                title="Preferred Courier"
              >
                <option value="Steadfast">Steadfast Default</option>
                <option value="Pathao">Pathao Default</option>
                <option value="RedX">RedX Default</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  patchAutopilot({ requireAdminReview: !autopilotCfg.requireAdminReview });
                  saveSettingsChanges(
                    at('AI মোড আপডেট', 'AI Review Policy Updated'),
                    !autopilotCfg.requireAdminReview
                      ? at('এখন সকল AI কাজ আপনার রিভিউ কিউতে আসবে।', 'AI will always ask your approval before executing actions.')
                      : at('দ্রুত ডাইরেক্ট এক্সিকিউশন চালু হয়েছে।', 'Direct execution mode enabled.')
                  );
                }}
                className={`px-3.5 py-2 rounded-xl font-black cursor-pointer transition-colors ${
                  autopilotCfg.requireAdminReview
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {autopilotCfg.requireAdminReview ? at('অনুমোদন মোড: চালু', 'Only I Review: ON') : at('ডাইরেক্ট মোড: চালু', 'Only I Review: OFF')}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/80 text-[11px] font-bold">
            <label className="inline-flex items-center gap-1.5 text-emerald-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autopilotCfg.zeroAdSpendMode !== false}
                onChange={(e) => patchAutopilot({ zeroAdSpendMode: e.target.checked })}
                className="w-3.5 h-3.5 accent-emerald-500 rounded"
              />
              <span>{at('৳০ অ্যাড খরচ অর্গানিক AI মোড', '৳0 Ad-Spend Organic Mode')}</span>
            </label>
            <label className="inline-flex items-center gap-1.5 text-sky-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autopilotCfg.autoSocialDailyEnabled !== false}
                onChange={(e) => patchAutopilot({ autoSocialDailyEnabled: e.target.checked })}
                className="w-3.5 h-3.5 accent-emerald-500 rounded"
              />
              <span>{at('ডেইলি অটো সোশ্যাল পোস্টিং', 'Daily Auto-Social (FB/IG/TT/YT)')}</span>
            </label>
            <label className="inline-flex items-center gap-1.5 text-amber-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autopilotCfg.autoChatReplyEnabled !== false}
                onChange={(e) => patchAutopilot({ autoChatReplyEnabled: e.target.checked })}
                className="w-3.5 h-3.5 accent-emerald-500 rounded"
              />
              <span>{at('অটো লাইভ চ্যাট ও ইনকোয়ারি AI উত্তর', 'Auto Live-Chat & Inquiry Replies')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* 2B. Solo-Founder Zero-Cost Full Website AI Sweep (Orders + Live Chat + 4-Platform Social) */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-emerald-500/35 space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-black text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                {at(
                  'সলো-ফাউন্ডার ৳০ ফুল ওয়েবসাইট AI সুইপ (নিজের পণ্য + লাইভ চ্যাট উত্তর + ৪টি সোশ্যাল চ্যানেল)',
                  'Solo-Founder ৳0 Full Website AI Autopilot (Own Products + Chat Inquiry Replies + 4-Platform Social)'
                )}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {at(
                'কোনো টিম বা অ্যাড বাজেট ছাড়াই আপনার স্টোরের নিজের পণ্য, পেন্ডিং অর্ডার ও কাস্টমার ইনকোয়ারি বিশ্লেষণ করে রেডি উত্তর ও ৪-প্ল্যাটফর্ম প্রোমো তৈরি করবে।',
                'Analyzes ONLY your visible own products, pending COD orders & live inquiries—drafting customer replies and 4-channel social promos at ৳0 cost.'
              )}
            </p>
          </div>
          <button
            type="button"
            disabled={isRunningFullAutopilot}
            onClick={handleRunFullZeroCostSweep}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-200" />
            <span>
              {isRunningFullAutopilot
                ? at('AI সম্পূর্ণ স্টোর স্ক্যান করছে...', 'Running Full AI Sweep...')
                : at('১-ক্লিক ৳০ ফুল AI সুইপ চালান', 'Run ৳0 Full Website AI Sweep')}
            </span>
          </button>
        </div>

        {fullAutopilotPlan && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <p className="font-bold text-emerald-300">{at('AI এক্সিকিউটিভ সামারি:', 'AI Executive Summary:')}</p>
              <p className="text-slate-200 leading-relaxed">{fullAutopilotPlan.executiveSummary}</p>
              {fullAutopilotPlan.zeroCostActions?.length > 0 && (
                <ul className="space-y-1 pt-1 text-[11px] text-slate-300">
                  {fullAutopilotPlan.zeroCostActions.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Drafted Live Chat / Inquiry Replies */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sky-300">
                    {at(
                      `ইনকোয়ারি AI উত্তর ড্রাফট (${fullAutopilotPlan.inquiryReplies?.length || 0}টি)`,
                      `Drafted Customer Inquiry Replies (${fullAutopilotPlan.inquiryReplies?.length || 0})`
                    )}
                  </span>
                  {fullAutopilotPlan.inquiryReplies?.length > 0 && (
                    <button
                      type="button"
                      disabled={appliedInquiryReplies}
                      onClick={handleApplyAllInquiryReplies}
                      className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white font-bold text-[11px] cursor-pointer"
                    >
                      {appliedInquiryReplies ? at('সব উত্তর পাঠানো হয়েছে ✓', 'Applied All ✓') : at('সব উত্তর পাঠিয়ে দিন', 'Apply All Replies')}
                    </button>
                  )}
                </div>
                {(!fullAutopilotPlan.inquiryReplies || fullAutopilotPlan.inquiryReplies.length === 0) ? (
                  <p className="text-[11px] text-slate-400">{at('এই মুহূর্তে কোনো নতুন পেন্ডিং ইনকোয়ারি নেই।', 'No open customer inquiries waiting.')}</p>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {fullAutopilotPlan.inquiryReplies.map((rep) => (
                      <div key={rep.inquiryId} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <span className="font-mono text-[10px] text-amber-300">Inquiry #{rep.inquiryId}</span>
                        <p className="text-slate-200 text-[11px] leading-relaxed">{rep.replyText}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4-Platform Featured Promo Draft */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-emerald-300">{at('ফিচার্ড নিজের পণ্যের ৳০ সোশ্যাল প্রোমো', 'Featured Own-Product ৳0 Social Promo')}</span>
                  <button
                    type="button"
                    disabled={scheduledAutopilotPromo}
                    onClick={handleScheduleAutopilotSocial}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>{scheduledAutopilotPromo ? at('৪ চ্যানেলে শিডিউলড ✓', 'Scheduled All 4 ✓') : at('৪ চ্যানেলে অটো-শিডিউল', 'Schedule All 4 Channels')}</span>
                  </button>
                </div>
                <p className="font-bold text-white">{fullAutopilotPlan.promoTitle}</p>
                <p className="text-slate-300 text-[11px] whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto">
                  {fullAutopilotPlan.promoCaption}
                </p>
                <p className="text-[10px] font-mono text-sky-400">
                  {(fullAutopilotPlan.promoHashtags || []).join(' ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Detected Website Maintenance Issues */}
      {maintenanceAuditReport && maintenanceAuditReport.issues.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{at('শনাক্তকৃত ওয়েবসাইট মেইনটেন্যান্স আইটেম', 'Detected Store Health & Maintenance Items')}</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400">{maintenanceAuditReport.issues.length} checks</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {maintenanceAuditReport.issues.map((iss) => (
              <div
                key={iss.id}
                className={`p-3.5 rounded-xl border space-y-1.5 ${
                  iss.severity === 'critical'
                    ? 'bg-rose-950/35 border-rose-700/60'
                    : iss.severity === 'warning'
                    ? 'bg-amber-950/30 border-amber-700/50'
                    : 'bg-emerald-950/25 border-emerald-700/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-950 text-slate-200">
                    {iss.area}
                  </span>
                  <span className="font-mono font-bold text-xs text-white">×{iss.count}</span>
                </div>
                <p className="font-bold text-white">{at(iss.titleBn, iss.title)}</p>
                <p className="text-[11px] text-slate-300 leading-relaxed">{iss.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. AI Review Queue ("Approve Before Execute") */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-black text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{at('এআই রিভিউ ও অ্যাপ্রুভাল কিউ', 'AI Operations Review Queue')}</span>
            </h4>
            <div className="flex items-center gap-1 ml-1">
              {[
                { id: 'pending', label: `${at('অপেক্ষমাণ', 'Pending')} (${pendingReviewTasks.length})` },
                { id: 'executed', label: `${at('সম্পন্ন', 'Executed')} (${executedReviewTasks.length})` },
                { id: 'all', label: `${at('সবগুলো', 'All')} (${aiReviewQueue.length})` }
              ].map((tTab) => (
                <button
                  key={tTab.id}
                  type="button"
                  onClick={() => setQueueFilter(tTab.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    queueFilter === tTab.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {tTab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {pendingReviewTasks.length > 0 && (
              <button
                type="button"
                onClick={() => approveAllPendingAIReviewTasks()}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{at('নিরাপদ পেন্ডিং সব অনুমোদন করুন', 'Approve Safe Pending')}</span>
              </button>
            )}
            {executedReviewTasks.length > 0 && (
              <button
                type="button"
                onClick={() => clearCompletedAIReviewTasks()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
              >
                {at('সম্পন্ন কিউ পরিষ্কার', 'Clear Done')}
              </button>
            )}
          </div>
        </div>

        {visibleQueueTasks.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-slate-950 border border-dashed border-slate-800 text-slate-400 text-xs space-y-2">
            <p>
              {at(
                'রিভিউ কিউতে কোনো পেন্ডিং কাজ নেই। "অর্ডার ও রিভিউ কিউ তৈরি" বা "ফুল ওয়েবসাইট মেইনটেন্যান্স স্ক্যান" চাপুন।',
                'No items in this view. Click "Scan Orders & Queue" or "Run Full Maintenance Scan" above.'
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {visibleQueueTasks.map((task) => {
              const edited = getEditedPayload(task);
              const isBusy = busyTaskId === task.id;
              return (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          task.priority === 'high'
                            ? 'bg-rose-500/20 text-rose-300'
                            : task.priority === 'medium'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {task.actionType.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-white">{at(task.titleBn || task.title, task.title)}</span>
                      {task.targetId && <span className="font-mono text-emerald-400 text-[11px]">{task.targetId}</span>}
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        task.status === 'executed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : task.status === 'dismissed'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-slate-300">{at(task.summaryBn || task.summary, task.summary)}</p>

                  {/* Inline Admin Review Editable Fields before approving */}
                  {task.status === 'pending_review' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                      {(task.actionType === 'send_courier' || task.actionType === 'confirm_order') && (
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Courier Provider</label>
                          <select
                            value={String(edited.provider || autopilotCfg.preferredCourier)}
                            onChange={(e) => patchTaskPayload(task.id, { provider: e.target.value as CourierProvider })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                          >
                            <option value="Steadfast">Steadfast</option>
                            <option value="Pathao">Pathao</option>
                            <option value="RedX">RedX</option>
                          </select>
                        </div>
                      )}
                      {(task.actionType === 'whatsapp_followup' || task.actionType === 'ai_voice_call') && (
                        <>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Customer Phone</label>
                            <input
                              type="text"
                              value={String(edited.phone || '')}
                              onChange={(e) => patchTaskPayload(task.id, { phone: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-slate-400 mb-0.5">Message / AI Script</label>
                            <input
                              type="text"
                              value={String(edited.message || edited.script || '')}
                              onChange={(e) =>
                                patchTaskPayload(
                                  task.id,
                                  task.actionType === 'ai_voice_call'
                                    ? { script: e.target.value }
                                    : { message: e.target.value }
                                )
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                            />
                          </div>
                        </>
                      )}
                      {task.actionType === 'update_product' && (
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Updated Stock Qty</label>
                          <input
                            type="number"
                            value={Number(edited.stock ?? 25)}
                            onChange={(e) => patchTaskPayload(task.id, { stock: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                          />
                        </div>
                      )}
                      {task.actionType === 'fix_product_seo' && (
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">SEO Meta Title / Slug</label>
                          <input
                            type="text"
                            value={String(edited.slug || edited.title || '')}
                            onChange={(e) => patchTaskPayload(task.id, { slug: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {task.status === 'pending_review' && (
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/70">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => dismissAIReviewTask(task.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{at('বাতিল', 'Dismiss')}</span>
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={async () => {
                          setBusyTaskId(task.id);
                          await approveAIReviewTask(task.id, taskEdits[task.id]);
                          setBusyTaskId(null);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isBusy ? at('চালু হচ্ছে...', 'Running...') : at('অনুমোদন ও এক্সিকিউট', 'Approve & Execute')}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Main AI Command Console */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-emerald-500/35 space-y-4 shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunCommand();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
        >
          <div className="relative flex-1">
            <Terminal className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder={at(
                'এআই-কে নির্দেশ দিন (যেমন: "অর্ডার #BD-1001 AI কল কনফার্ম করো" বা "প্রোডাক্ট SEO ঠিক করো")...',
                'Command Website AI (e.g. "Confirm pending orders", "Send Steadfast courier", "Update site meta title")...'
              )}
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-2xl text-xs sm:text-sm text-white outline-none"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleVoiceMic}
              className={`px-3.5 py-3 rounded-2xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                isListeningVoice
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-emerald-300 hover:bg-slate-700'
              }`}
              title={at('ভয়েসে নির্দেশ দিন', 'Speak Command')}
            >
              {isListeningVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isListeningVoice ? at('শুনছে...', 'Listening') : at('ভয়েস', 'Voice')}</span>
            </button>

            <button
              type="submit"
              disabled={isExecuting || !commandInput.trim()}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/25"
            >
              <Send className="w-4 h-4" />
              <span>{isExecuting ? at('কাজ করছে...', 'Executing...') : at('এক্সিকিউট করুন', 'Run Agent')}</span>
            </button>
          </div>
        </form>

        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {at('১-ক্লিক অটোনোমাস কমান্ড শর্টকাট:', '1-Click Quick Shortcuts:')}
          </span>
          <div className="flex flex-wrap gap-2">
            {quickPresets.map((preset, idx) => {
              const IconComp = preset.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isExecuting}
                  onClick={() => handleRunCommand(preset.cmd)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <IconComp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{at(preset.labelBn, preset.labelEn)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Live Action Execution Log */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-sm text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{at('এআই এজেন্ট অ্যাকশন লগ', 'AI Agent Execution Log')}</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">{agentActionLogs.length} entries</span>
        </div>

        {agentActionLogs.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-slate-950 border border-dashed border-slate-800 text-slate-400 text-xs">
            {at(
              'উপরের বক্সে যেকোনো নির্দেশ লিখুন বা কিউ থেকে কাজ অনুমোদন করুন।',
              'Type a command above or approve tasks from your review queue to see execution history.'
            )}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {agentActionLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-amber-300">&gt; {log.instruction}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                      {log.mode}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{log.time}</span>
                  </div>
                </div>
                <p className="text-slate-200 leading-relaxed">{log.reply}</p>
                {log.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {log.actions.map((act, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold"
                      >
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        {act}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
