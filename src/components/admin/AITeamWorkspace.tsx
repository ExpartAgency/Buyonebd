import React, { useState, useMemo } from 'react';
import {
  Bot,
  Sparkles,
  TrendingUp,
  Megaphone,
  Calculator,
  Headphones,
  CheckCircle2,
  Play,
  AlertTriangle,
  Package,
  Plus,
  Edit,
  Trash2,
  Save,
  DollarSign,
  Share2,
  Zap
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AITeamDepartmentRole, ExpenseEntry } from '../../types';

const ROLE_META: Record<
  AITeamDepartmentRole,
  { titleBn: string; titleEn: string; subtitleBn: string; subtitleEn: string; icon: any; color: string }
> = {
  sales: {
    titleBn: 'AI সেলস ম্যানেজার',
    titleEn: 'AI Sales Manager',
    subtitleBn: 'পেন্ডিং অর্ডার কনফার্ম, কার্ট রিকভারি ও AOV বৃদ্ধি',
    subtitleEn: 'Order verification, cart recovery & AOV growth',
    icon: TrendingUp,
    color: 'text-emerald-400'
  },
  marketing: {
    titleBn: 'AI মার্কেটিং ডিরেক্টর',
    titleEn: 'AI Marketing Director',
    subtitleBn: 'ফেসবুক/টিকটক/ইউটিউব শিডিউল ও ফ্ল্যাশ সেল ক্যাম্পেইন',
    subtitleEn: 'FB/IG/TikTok/YT auto-posts & flash campaigns',
    icon: Megaphone,
    color: 'text-sky-400'
  },
  accounts: {
    titleBn: 'AI অ্যাকাউন্টস ও ফিন্যান্স অফিসার',
    titleEn: 'AI Accounts & Finance Officer',
    subtitleBn: 'COD কালেকশন, বকেয়া, খরচ ও নিট লাভ হিসাব',
    subtitleEn: 'Net profit margin, COD due & expense control',
    icon: Calculator,
    color: 'text-amber-400'
  },
  ops: {
    titleBn: 'AI সাপোর্ট ও অপারেশনস এজেন্ট',
    titleEn: 'AI Support & Ops Agent',
    subtitleBn: 'ইনকোয়ারি উত্তর, স্টক এলার্ট ও কুরিয়ার হ্যান্ডওভার',
    subtitleEn: 'Inquiry replies, courier dispatch & stock alerts',
    icon: Headphones,
    color: 'text-rose-400'
  }
};

export const AITeamWorkspace: React.FC = () => {
  const {
    orders,
    products,
    visibleStoreProducts,
    abandonedCarts,
    chatInquiries,
    updateChatInquiry,
    socialPosts,
    addSocialPost,
    getProductCanonicalUrl,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    updateProduct,
    aiTeamBriefings,
    isRunningAITeam,
    runAITeamBriefing,
    executeAITeamAction,
    runFullZeroCostAutopilot,
    addToast,
    adminLang
  } = useStore();

  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);
  const activeCatalog = useMemo(
    () => (visibleStoreProducts.length > 0 ? visibleStoreProducts : products),
    [visibleStoreProducts, products]
  );

  const [focusPrompt, setFocusPrompt] = useState('');
  const [fullAutoExecute, setFullAutoExecute] = useState(false);
  const [isRunningFullSweep, setIsRunningFullSweep] = useState(false);
  const [teamZeroCostPlan, setTeamZeroCostPlan] = useState<{
    executiveSummary: string;
    inquiryReplies: { inquiryId: string; replyText: string }[];
    featuredProductId: string;
    promoTitle: string;
    promoCaption: string;
    promoHashtags: string[];
    zeroCostActions: string[];
  } | null>(null);

  // Expense Ledger Form
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseEntry['category']>('ads');
  const [expAmount, setExpAmount] = useState<string>('');
  const [expDate, setExpDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [expNote, setExpNote] = useState('');

  const metrics = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'cancelled');
    const grossRevenue = activeOrders.reduce((s, o) => s + (o.pricing?.total || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const netProfit = grossRevenue - totalExpenses;
    const pendingCount = orders.filter((o) => o.status === 'pending').length;
    const awaitingCourier = orders.filter((o) => (o.status === 'ai_confirmed' || o.status === 'processing') && !o.courier?.trackingCode).length;
    const lowStock = activeCatalog.filter((p) => (p.stock ?? 0) <= 8);
    const newInqCount = chatInquiries.filter((q) => q.status === 'new').length;
    const unrecoveredCarts = abandonedCarts.filter((c) => !c.recovered).length;
    return {
      grossRevenue,
      totalExpenses,
      netProfit,
      pendingCount,
      awaitingCourier,
      lowStock,
      newInqCount,
      unrecoveredCarts
    };
  }, [orders, expenses, activeCatalog, chatInquiries, abandonedCarts]);

  const latestBriefing = aiTeamBriefings[0] || null;

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Math.max(0, Number(expAmount) || 0);
    if (!expTitle.trim() || amt <= 0) return;

    if (editingExpenseId) {
      updateExpense(editingExpenseId, {
        title: expTitle.trim(),
        category: expCategory,
        amount: amt,
        date: expDate,
        note: expNote.trim() || undefined
      });
      setEditingExpenseId(null);
    } else {
      addExpense({
        title: expTitle.trim(),
        category: expCategory,
        amount: amt,
        date: expDate,
        note: expNote.trim() || undefined
      });
    }
    setExpTitle('');
    setExpAmount('');
    setExpNote('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Solo Founder AI Execution Controls */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-emerald-400" />
              <span>{at('সলো-ফাউন্ডার AI কোম্পানি টিম ও প্রফিট লেজার', 'Solo-Founder AI Company Team & Profit Ledger')}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {at(
                'কোনো টিম ছাড়াই একা পুরো ব্যবসা পরিচালনা করুন — AI সেলস, মার্কেটিং, অ্যাকাউন্টস ও সাপোর্ট ম্যানেজার একসাথে আপনার কাজ করে দেবে।',
                'Operate your entire store solo: 4 specialized AI department heads (Sales, Marketing, Accounts, Support) analyze live data and execute tasks in 1 click.'
              )}
            </p>
          </div>

          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={fullAutoExecute}
              onChange={(e) => setFullAutoExecute(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded"
            />
            <span>{at('ফুল অটো-পাইলট মোড (অটো কার্যকর হবে)', 'Auto-Pilot Execution Mode')}</span>
          </label>
        </div>

        {/* 4 Department Role Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {(Object.keys(ROLE_META) as AITeamDepartmentRole[]).map((role) => {
            const meta = ROLE_META[role];
            const Icon = meta.icon;
            const roleStat =
              role === 'sales'
                ? at(`${metrics.pendingCount} পেন্ডিং অর্ডার · ${metrics.unrecoveredCarts} কার্ট`, `${metrics.pendingCount} Pending · ${metrics.unrecoveredCarts} Carts`)
                : role === 'marketing'
                ? at(`${socialPosts.filter((s) => s.status === 'scheduled').length} শিডিউল পোস্ট`, `${socialPosts.filter((s) => s.status === 'scheduled').length} Scheduled Posts`)
                : role === 'accounts'
                ? `Net: ৳${metrics.netProfit.toLocaleString()}`
                : at(`${metrics.newInqCount} নতুন ইনকোয়ারি · ${metrics.awaitingCourier} কুরিয়ার`, `${metrics.newInqCount} Inquiries · ${metrics.awaitingCourier} Courier`);

            return (
              <div key={role} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className={`flex items-center gap-2 font-black ${meta.color}`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{at(meta.titleBn, meta.titleEn)}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{at(meta.subtitleBn, meta.subtitleEn)}</p>
                <p className="text-[11px] font-mono font-bold text-white tabular-nums pt-1">{roleStat}</p>
              </div>
            );
          })}
        </div>

        {/* Focus Command Input + Run Briefing */}
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={focusPrompt}
            onChange={(e) => setFocusPrompt(e.target.value)}
            placeholder={at(
              'উদাহরণ: "সব পেন্ডিং অর্ডার কনফার্ম করো, কুরিয়ারে পাঠাও এবং ফেসবুক-টিকটকে আজকের সেলস পোস্ট তৈরি করো"',
              'Optional focus goal: e.g. "Confirm safe orders, recover abandoned carts & schedule today social promos"'
            )}
            className="flex-1 min-w-[240px] px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
          />
          <button
            type="button"
            disabled={isRunningAITeam}
            onClick={() => runAITeamBriefing(focusPrompt.trim() || undefined, fullAutoExecute)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>
              {isRunningAITeam
                ? at('AI টিম বিশ্লেষণ করছে...', 'Running AI Team...')
                : fullAutoExecute
                ? at('AI টিম চালান ও অটো-এক্সিকিউট করুন', 'Run AI Team & Auto-Execute')
                : at('AI ম্যানেজমেন্ট ব্রিফিং তৈরি করুন', 'Generate AI Team Briefing')}
            </span>
          </button>
          <button
            type="button"
            disabled={isRunningFullSweep}
            onClick={async () => {
              setIsRunningFullSweep(true);
              try {
                const plan = await runFullZeroCostAutopilot();
                if (plan) setTeamZeroCostPlan(plan);
              } finally {
                setIsRunningFullSweep(false);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-black text-xs flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-200" />
            <span>{isRunningFullSweep ? at('সুইপ চলছে...', 'Sweeping...') : at('৳০ ফুল-স্টোর AI সুইপ', '৳0 Full-Store AI Sweep')}</span>
          </button>
        </div>

        {teamZeroCostPlan && (
          <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/40 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-black text-sky-300">{at('৳০ ফুল ওয়েবসাইট AI প্ল্যান তৈরি হয়েছে:', 'Zero-Cost Solo Founder AI Plan Ready:')}</p>
              <div className="flex flex-wrap gap-2">
                {teamZeroCostPlan.inquiryReplies?.length > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      let count = 0;
                      for (const rep of teamZeroCostPlan.inquiryReplies) {
                        const match = chatInquiries.find((q) => q.id === rep.inquiryId);
                        if (match && rep.replyText?.trim()) {
                          await updateChatInquiry(rep.inquiryId, { adminReply: rep.replyText.trim(), status: 'replied' });
                          count++;
                        }
                      }
                      addToast('success', at(`${count}টি ইনকোয়ারি উত্তর পাঠানো হয়েছে!`, `Replied to ${count} Inquiries!`), '');
                    }}
                    className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer"
                  >
                    {at(`ইনকোয়ারি উত্তর (${teamZeroCostPlan.inquiryReplies.length}) পাঠান`, `Apply ${teamZeroCostPlan.inquiryReplies.length} Chat Replies`)}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const feat = activeCatalog.find((p) => p.id === teamZeroCostPlan.featuredProductId) || activeCatalog[0];
                    if (!feat) return;
                    const baseUrl = getProductCanonicalUrl(feat);
                    (['facebook', 'instagram', 'tiktok', 'youtube'] as const).forEach((plat, idx) => {
                      addSocialPost(
                        {
                          platform: plat,
                          productId: feat.id,
                          productTitle: feat.title,
                          productUrl: `${baseUrl}?utm_source=${plat}&utm_medium=ai_team`,
                          title: teamZeroCostPlan.promoTitle || feat.title,
                          caption: `${teamZeroCostPlan.promoCaption}\n\n👉 অর্ডার: ${baseUrl}?utm_source=${plat}&utm_medium=ai_team`,
                          hashtags: (teamZeroCostPlan.promoHashtags || ['#BuyOneBD']).map((t) => (t.startsWith('#') ? t : `#${t}`)),
                          imageUrl: feat.images?.[0] || '',
                          scheduledAt: new Date(Date.now() + (15 + idx * 30) * 60 * 1000).toISOString(),
                          status: 'scheduled',
                          autoGenerated: true
                        },
                        { silent: true }
                      );
                    });
                    addToast('success', at('৪ প্ল্যাটফর্মেই শিডিউল সম্পন্ন!', 'All 4 Channels Scheduled!'), feat.title);
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3 h-3" />
                  <span>{at('৪টি সোশ্যাল চ্যানেলে শিডিউল', 'Schedule All 4 Social')}</span>
                </button>
              </div>
            </div>
            <p className="text-slate-200 leading-relaxed">{teamZeroCostPlan.executiveSummary}</p>
          </div>
        )}
      </div>

      {/* Latest AI Team Briefing & 1-Click Executable Actions */}
      {latestBriefing && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-black text-white text-sm">{at('সর্বশেষ AI টিম এক্সিকিউটিভ রিপোর্ট', 'Latest AI Executive Briefing')}</h4>
              <p className="text-slate-200 font-bold mt-1">{latestBriefing.headline}</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {new Date(latestBriefing.generatedAt).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              { role: 'sales' as const, text: latestBriefing.salesSummary },
              { role: 'marketing' as const, text: latestBriefing.marketingSummary },
              { role: 'accounts' as const, text: latestBriefing.accountsSummary },
              { role: 'ops' as const, text: latestBriefing.opsSummary }
            ].map((dep) => {
              const meta = ROLE_META[dep.role];
              return (
                <div key={dep.role} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className={`font-bold text-[11px] ${meta.color}`}>{at(meta.titleBn, meta.titleEn)}</p>
                  <p className="text-slate-300 leading-relaxed">{dep.text || '—'}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(latestBriefing.recommendedActions || []).map((act) => {
              const meta = ROLE_META[act.role] || ROLE_META.sales;
              return (
                <div key={act.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-bold text-[11px] ${meta.color}`}>
                        {at(meta.titleBn, meta.titleEn)}
                      </span>
                      <span className={`font-mono text-[10px] font-bold uppercase ${act.executed ? 'text-emerald-400' : 'text-amber-300'}`}>
                        {act.executed ? 'EXECUTED' : 'READY'}
                      </span>
                    </div>
                    <h5 className="font-bold text-white text-sm">{act.title}</h5>
                    <p className="text-slate-400">{act.detail}</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <span className="font-mono text-[10px] text-slate-500">{act.actionType}</span>
                    {act.executed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{at('কার্যকর সম্পন্ন', 'Executed')}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => executeAITeamAction(latestBriefing.id, act.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        <span>{at('১-ক্লিক চালু করুন', 'Execute 1-Click')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Low Stock Quick Restock + Business Expense & Net Profit Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
        {/* Low Stock Alert & Quick Restock (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{at(`লো-স্টক এলার্ট (${metrics.lowStock.length}টি)`, `Low-Stock Restock Desk (${metrics.lowStock.length})`)}</span>
            </h4>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950">
            {metrics.lowStock.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <Package className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
                <p>{at('সব পণ্যের স্টক পর্যাপ্ত রয়েছে।', 'All products are well stocked (>8 units).')}</p>
              </div>
            ) : (
              metrics.lowStock.map((prod) => (
                <div key={prod.id} className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{at(prod.titleBn, prod.title)}</p>
                    <p className="font-mono text-[11px] text-rose-400 tabular-nums">
                      {at(`বাকি স্টক: ${prod.stock ?? 0} পিস`, `Left: ${prod.stock ?? 0} pcs`)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {[10, 25, 50].map((addVal) => (
                      <button
                        key={addVal}
                        type="button"
                        onClick={() => updateProduct(prod.id, { stock: (prod.stock || 0) + addVal })}
                        className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-600/40 font-mono font-bold text-[11px] cursor-pointer"
                      >
                        +{addVal}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expense & Net Profit Ledger (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>{at('ব্যবসায়িক খরচ ও নিট লাভ লেজার (Profit & Loss)', 'Expense & Net Profit Ledger')}</span>
            </h4>
            <div className="flex items-center gap-3 font-mono tabular-nums text-[11px]">
              <span className="text-sky-300">Rev: ৳{metrics.grossRevenue.toLocaleString()}</span>
              <span className="text-rose-400">Exp: ৳{metrics.totalExpenses.toLocaleString()}</span>
              <span className={`font-black ${metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                Net: ৳{metrics.netProfit.toLocaleString()}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveExpense} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <input
              type="text"
              required
              value={expTitle}
              onChange={(e) => setExpTitle(e.target.value)}
              placeholder={at('খরচের বিবরণ (যেমন: FB Boost)', 'Expense title (e.g. FB Ads)')}
              className="sm:col-span-4 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
            <select
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value as ExpenseEntry['category'])}
              className="sm:col-span-3 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
            >
              <option value="ads">Ads / Boost</option>
              <option value="courier">Courier Fee</option>
              <option value="cogs">Product Stock (COGS)</option>
              <option value="packaging">Packaging</option>
              <option value="salary">Staff / Ops</option>
              <option value="other">Other</option>
            </select>
            <input
              type="number"
              required
              min={1}
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              placeholder="৳ Amount"
              className="sm:col-span-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
            <input
              type="date"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              className="sm:col-span-2 px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono"
            />
            <button
              type="submit"
              className="sm:col-span-1 py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center cursor-pointer"
              title={editingExpenseId ? 'Save Expense' : 'Add Expense'}
            >
              {editingExpenseId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </form>

          <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-[11px] text-slate-300 tabular-nums">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">{at('তারিখ', 'Date')}</th>
                  <th className="py-2 px-2">{at('বিবরণ', 'Title')}</th>
                  <th className="py-2 px-2">{at('ধরন', 'Type')}</th>
                  <th className="py-2 px-2 text-right">{at('টাকা', 'Amount')}</th>
                  <th className="py-2 px-3 text-right">{at('অ্যাকশন', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      {at('কোনো খরচ এন্ট্রি নেই। উপরে অ্যাড, কুরিয়ার বা স্টক খরচ যোগ করুন।', 'No expenses recorded yet. Log ad spend, courier or stock costs above.')}
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-900">
                      <td className="py-2 px-3 font-mono text-slate-400">{exp.date}</td>
                      <td className="py-2 px-2 font-bold text-white">{exp.title}</td>
                      <td className="py-2 px-2 uppercase text-sky-400 font-bold">{exp.category}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-rose-400">৳{exp.amount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingExpenseId(exp.id);
                              setExpTitle(exp.title);
                              setExpCategory(exp.category);
                              setExpAmount(String(exp.amount));
                              setExpDate(exp.date);
                              setExpNote(exp.note || '');
                            }}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteExpense(exp.id)}
                            className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
