import React, { useMemo, useState } from 'react';
import {
  Users,
  Wallet,
  CheckCircle2,
  XCircle,
  Save,
  Search,
  ExternalLink,
  ShoppingBag,
  MessageCircle,
  Sparkles,
  Download,
  Plus,
  Minus,
  Send,
  Copy,
  Check,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ResellerAccount, ResellerPayoutRequest } from '../../types';
import { BulkSectionShell, BulkCommandBar } from './BulkSectionShell';

interface ResellerAdminViewProps {
  onOpenWhatsAppDesk?: (phone: string) => void;
}

export const ResellerAdminView: React.FC<ResellerAdminViewProps> = ({ onOpenWhatsAppDesk }) => {
  const {
    settings,
    updateSettings,
    saveSettingsChanges,
    resellers,
    updateResellerAccount,
    bulkUpdateResellers,
    deleteResellerAccount,
    bulkDeleteResellers,
    adjustResellerWallet,
    resellerPayouts,
    processResellerPayout,
    updateResellerPayout,
    deleteResellerPayout,
    orders,
    sendMetaWhatsAppMessage,
    generateWhatsAppAiDraft,
    syncStoreFromServer,
    adminLang,
    addToast
  } = useStore();

  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'suspended'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCommissionVal, setBulkCommissionVal] = useState<string>('20');
  const [trxInputs, setTrxInputs] = useState<Record<string, string>>({});
  const [walletModalReseller, setWalletModalReseller] = useState<ResellerAccount | null>(null);
  const [walletDelta, setWalletDelta] = useState<number>(200);
  const [walletNote, setWalletNote] = useState('');
  const [editingReseller, setEditingReseller] = useState<ResellerAccount | null>(null);
  const [editingPayout, setEditingPayout] = useState<ResellerPayoutRequest | null>(null);

  // Inline Quick WhatsApp & AI Support Modal for a Reseller
  const [supportReseller, setSupportReseller] = useState<ResellerAccount | null>(null);
  const [waDraft, setWaDraft] = useState('');
  const [isDraftingAi, setIsDraftingAi] = useState(false);
  const [isSendingWa, setIsSendingWa] = useState(false);
  const [copiedResOrder, setCopiedResOrder] = useState(false);

  const cfg = settings.resellerSettings || {
    enabled: true,
    autoApprove: false,
    defaultCommissionPercent: 18,
    minPayoutBdt: 500,
    allowCustomMarginPricing: true,
    resellerWelcomeMsgBn: 'স্বাগতম! আপনার রিসেলার একাউন্ট থেকে প্রতিটি পণ্যে রিসেলার প্রাইস দেখে অর্ডার করুন।',
    resellerWelcomeMsgEn: 'Welcome! Order at exclusive reseller prices and withdraw profits directly.'
  };

  const patchCfg = (partial: Partial<typeof cfg>) => {
    updateSettings({
      resellerSettings: {
        ...cfg,
        ...partial
      }
    });
  };

  const pendingCount = resellers.filter((r) => r.status === 'pending').length;
  const approvedCount = resellers.filter((r) => r.status === 'approved').length;
  const suspendedCount = resellers.filter((r) => r.status === 'suspended').length;
  const resellerOrderCount = orders.filter((o) => o.partnerType === 'reseller').length;
  const pendingPayoutTotal = resellerPayouts
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredResellers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return resellers.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.resellerCode.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q)
      );
    });
  }, [resellers, statusFilter, searchQuery]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAllFiltered = () => {
    const visibleIds = filteredResellers.map((r) => r.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : visibleIds);
  };

  const handleExportCsv = () => {
    const header = ['Reseller Code', 'Name', 'Phone', 'Email', 'District', 'Status', 'Commission %', 'Wallet BDT', 'Total Earnings', 'Orders', 'Joined'];
    const rows = filteredResellers.map((r) => [
      r.resellerCode,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      r.phone,
      r.email || '',
      `"${(r.district || '').replace(/"/g, '""')}"`,
      r.status,
      r.commissionPercent,
      r.walletBalance,
      r.totalEarnings,
      r.totalOrders,
      r.createdAt
    ]);
    const csv = [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buyonebd-resellers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', at('CSV এক্সপোর্ট সম্পন্ন', 'Resellers CSV Exported'), `${filteredResellers.length} rows`);
  };

  const latestResellerOrder = (resId: string) =>
    orders.find((o) => o.resellerId === resId) || null;

  const openQuickSupport = async (reseller: ResellerAccount) => {
    setSupportReseller(reseller);
    setWaDraft('');
    setIsDraftingAi(true);
    try {
      const draft = await generateWhatsAppAiDraft({
        contactName: reseller.name,
        contactType: 'reseller',
        resellerInfo: reseller,
        latestOrder: latestResellerOrder(reseller.id),
        intent: reseller.status === 'approved' ? 'approval' : 'general'
      });
      if (draft) setWaDraft(draft);
    } finally {
      setIsDraftingAi(false);
    }
  };

  const handleCopyResellerOrderInfo = async (reseller: ResellerAccount) => {
    const ord = latestResellerOrder(reseller.id);
    const infoText = ord
      ? `Reseller: ${reseller.name} (${reseller.resellerCode})\nOrder #${ord.id} · Total: ৳${ord.pricing.total} · Profit: ৳${ord.resellerProfit || 0}\nCustomer: ${ord.customer.name} (${ord.customer.phone}) · ${ord.customer.district}\nStatus: ${ord.status}${ord.courier?.trackingCode ? ` · Tracking: ${ord.courier.trackingCode}` : ''}`
      : `Reseller: ${reseller.name} (${reseller.resellerCode})\nPhone: ${reseller.phone} · District: ${reseller.district}\nStatus: ${reseller.status.toUpperCase()} · Commission: ${reseller.commissionPercent}% · Wallet: ৳${reseller.walletBalance}`;
    try {
      await navigator.clipboard.writeText(infoText);
      setCopiedResOrder(true);
      setTimeout(() => setCopiedResOrder(false), 1800);
      addToast('success', at('রিসেলার অর্ডার তথ্য কপি হয়েছে!', 'Order Info Copied!'), '');
    } catch {
      setWaDraft((prev) => (prev ? `${prev}\n${infoText}` : infoText));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>{at('রিসেলার নেটওয়ার্ক, পে-আউট ও WhatsApp AI সাপোর্ট', 'Reseller Program, Payouts & WhatsApp AI Desk')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {at(
              'নতুন রিসেলার আবেদন অনুমোদন করুন, ওয়ালেট বোনাস দিন এবং WhatsApp ও AI দিয়ে সরাসরি সাপোর্ট দিন।',
              'Approve reseller applications live, manage commissions/wallets, and send WhatsApp + AI support in 1 click.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => syncStoreFromServer()}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
          >
            {at('রিফ্রেশ আবেদন', 'Refresh List')}
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={() =>
              saveSettingsChanges(
                at('রিসেলার সেটিংস সংরক্ষিত!', 'Reseller Settings Saved!'),
                at('রিসেলার প্রোগ্রাম কনফিগারেশন ডাটাবেজে সেভ হয়েছে।', 'Reseller rules persisted.')
              )
            }
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{at('সেটিংস সেভ করুন', 'Save Settings')}</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 tabular-nums">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">{at('মোট রিসেলার', 'Total Resellers')}</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">{resellers.length}</span>
          <span className="text-[11px] text-emerald-400">{approvedCount} approved · {suspendedCount} suspended</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">{at('অ্যাপ্রুভাল বাকি', 'Pending Approval')}</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">{pendingCount}</span>
          <span className="text-[11px] text-slate-400">{at('যাচাই প্রয়োজন', 'Awaiting review')}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">{at('রিসেলার অর্ডার', 'Reseller Orders')}</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">{resellerOrderCount}</span>
          <span className="text-[11px] text-slate-400">{at('লাইভ ট্র্যাকড', 'Attributed COD & Pay')}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">{at('পেন্ডিং পে-আউট', 'Pending Payouts')}</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
            ৳{pendingPayoutTotal.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400">
            {resellerPayouts.filter((p) => p.status === 'pending').length} requests
          </span>
        </div>
      </div>

      {/* Program Rules Form */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h4 className="text-sm font-bold text-white">{at('রিসেলার প্রোগ্রাম কনফিগারেশন', 'Program Rules & Defaults')}</h4>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cfg.enabled}
                onChange={(e) => patchCfg({ enabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <span>{at('রিসেলার পোর্টাল চালু', 'Enable Reseller Portal')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cfg.autoApprove}
                onChange={(e) => patchCfg({ autoApprove: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <span>{at('অটো অ্যাপ্রুভাল চালু', 'Auto-Approve New Signups')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cfg.allowCustomMarginPricing !== false}
                onChange={(e) => patchCfg({ allowCustomMarginPricing: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <span>{at('কাস্টম কাস্টমার মূল্য সেট', 'Allow Custom Margin Quotes')}</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs tabular-nums">
          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {at('ডিফল্ট রিসেলার কমিশন / মার্জিন (%)', 'Default Commission / Margin (%)')}
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={cfg.defaultCommissionPercent}
              onChange={(e) => patchCfg({ defaultCommissionPercent: Math.max(1, Math.min(60, Number(e.target.value) || 1)) })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {at('সর্বনিম্ন উইথড্রয়াল সীমা (৳)', 'Minimum Payout Threshold (BDT)')}
            </label>
            <input
              type="number"
              min={50}
              value={cfg.minPayoutBdt}
              onChange={(e) => patchCfg({ minPayoutBdt: Math.max(50, Number(e.target.value) || 50) })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Reseller Directory with BulkSectionShell, Filter Tabs, Bulk Actions, Edit/Delete & WhatsApp AI Support */}
      <BulkSectionShell
        indexCode="BULK // RESELLERS"
        title={at('নিবন্ধিত রিসেলার ডিরেক্টরি ও বাল্ক অ্যাকশন', 'Registered Resellers & Bulk Network Console')}
        subtitle={at('সিলেক্ট করে একসাথে অ্যাপ্রুভ, সাসপেন্ড, কমিশন % আপডেট, এডিট বা ডিলিট করুন।', 'Select resellers to bulk approve, suspend, adjust commission %, edit profile, or remove.')}
        totalCount={filteredResellers.length}
        selectedCount={selectedIds.length}
        accent="emerald"
        headerActions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1">
              {(['all', 'pending', 'approved', 'suspended'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase whitespace-nowrap shrink-0 cursor-pointer ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st} ({st === 'all' ? resellers.length : resellers.filter((r) => r.status === st).length})
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={at('নাম, ফোন বা কোড...', 'Search name, phone, code...')}
                className="w-full pl-8 pr-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        }
      >
        <BulkCommandBar
          selectedCount={selectedIds.length}
          totalCount={filteredResellers.length}
          allSelected={filteredResellers.length > 0 && filteredResellers.every((r) => selectedIds.includes(r.id))}
          onToggleSelectAll={toggleSelectAllFiltered}
          onClearSelection={() => setSelectedIds([])}
          itemLabel="RESELLERS"
        >
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={60}
              value={bulkCommissionVal}
              onChange={(e) => setBulkCommissionVal(e.target.value)}
              className="w-14 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs font-mono text-white text-center tabular-nums"
              title={at('কমিশন %', 'Commission %')}
            />
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={() => {
                const pct = Math.max(1, Math.min(60, Number(bulkCommissionVal) || 18));
                bulkUpdateResellers(selectedIds, { commissionPercent: pct });
                setSelectedIds([]);
              }}
              className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
            >
              {at('কমিশন % সেট', 'Set Comm %')}
            </button>
          </div>
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => {
              bulkUpdateResellers(selectedIds, { status: 'approved' });
              setSelectedIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
          >
            {at('অনুমোদন দিন', 'Approve')}
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => {
              bulkUpdateResellers(selectedIds, { status: 'suspended' });
              setSelectedIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-amber-600/90 hover:bg-amber-500 text-white font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
          >
            {at('স্থগিত করুন', 'Suspend')}
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => {
              bulkDeleteResellers(selectedIds);
              setSelectedIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{at('মুছুন', 'Delete')}</span>
          </button>
        </BulkCommandBar>

        {filteredResellers.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            {at('কোনো রিসেলার অ্যাকাউন্ট পাওয়া যায়নি।', 'No reseller accounts match your filter.')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-2">
                    <input
                      type="checkbox"
                      checked={filteredResellers.length > 0 && filteredResellers.every((r) => selectedIds.includes(r.id))}
                      onChange={toggleSelectAllFiltered}
                      className="accent-emerald-500 rounded"
                    />
                  </th>
                  <th className="py-2.5 px-3 font-semibold">{at('রিসেলার', 'Reseller')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('জেলা ও পেজ', 'District & Store')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('কমিশন %', 'Comm %')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('ওয়ালেট / আয়', 'Wallet / Earned')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('অবস্থা', 'Status')}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{at('অ্যাকশন ও সাপোর্ট', 'Actions & WhatsApp AI')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredResellers.map((r: ResellerAccount) => (
                  <tr key={r.id} className={`hover:bg-slate-900/60 ${selectedIds.includes(r.id) ? 'bg-emerald-950/20' : ''}`}>
                    <td className="py-3 px-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        className="accent-emerald-500 rounded"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{r.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {r.resellerCode} · {r.phone}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-slate-200">{r.district}</p>
                      {r.fbPageUrl && (
                        <a
                          href={r.fbPageUrl.startsWith('http') ? r.fbPageUrl : `https://${r.fbPageUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Page Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={r.commissionPercent}
                        onChange={(e) =>
                          updateResellerAccount(r.id, {
                            commissionPercent: Math.max(1, Math.min(60, Number(e.target.value) || 1))
                          })
                        }
                        className="w-16 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white font-mono text-center"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-mono font-bold text-emerald-400">৳{r.walletBalance.toLocaleString()}</p>
                          <p className="text-[11px] text-slate-400">
                            Earned ৳{r.totalEarnings.toLocaleString()} · {r.totalOrders} ord
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setWalletModalReseller(r);
                            setWalletDelta(200);
                            setWalletNote('');
                          }}
                          title={at('ওয়ালেট ব্যালেন্স সমন্বয়', 'Adjust Wallet Balance')}
                          className="p-1.5 rounded bg-slate-800 hover:bg-emerald-700 text-emerald-300 hover:text-white cursor-pointer"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold uppercase text-[11px] ${
                          r.status === 'approved'
                            ? 'text-emerald-400'
                            : r.status === 'suspended'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditingReseller({ ...r })}
                        title={at('রিসেলার এডিট করুন', 'Edit Reseller')}
                        className="p-1.5 rounded bg-slate-800 hover:bg-amber-600 text-amber-300 hover:text-white inline-flex items-center cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openQuickSupport(r)}
                        title={at('WhatsApp ও AI দিয়ে সাপোর্ট দিন', 'WhatsApp & AI Support')}
                        className="px-2 py-1 rounded bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>WA + AI</span>
                      </button>
                      {onOpenWhatsAppDesk && (
                        <button
                          type="button"
                          onClick={() => onOpenWhatsAppDesk(r.phone)}
                          title={at('ডিরেক্ট WhatsApp API কনসোল খুলুন', 'Open WhatsApp API Thread')}
                          className="p-1.5 rounded bg-slate-800 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-[11px] inline-flex items-center cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {r.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => updateResellerAccount(r.id, { status: 'approved' })}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer whitespace-nowrap"
                        >
                          {at('অনুমোদন', 'Approve')}
                        </button>
                      )}
                      {r.status !== 'suspended' && (
                        <button
                          type="button"
                          onClick={() => updateResellerAccount(r.id, { status: 'suspended' })}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-white font-bold text-[11px] cursor-pointer whitespace-nowrap"
                        >
                          {at('স্থগিত', 'Suspend')}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteResellerAccount(r.id)}
                        title={at('রিসেলার মুছুন', 'Delete Reseller')}
                        className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white inline-flex items-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BulkSectionShell>

      {/* Payout Requests Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span>{at('রিসেলার পে-আউট আবেদনসমূহ', 'Reseller Withdrawal Requests')}</span>
        </h4>

        {resellerPayouts.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">{at('কোনো উত্তোলনের আবেদন নেই।', 'No payout requests submitted yet.')}</p>
        ) : (
          <div className="space-y-2.5">
            {resellerPayouts.map((pay) =>
              editingPayout?.id === pay.id ? (
                <div
                  key={pay.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/60 space-y-2.5 text-xs tabular-nums"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <input
                      type="number"
                      min={1}
                      value={editingPayout.amount}
                      onChange={(e) => setEditingPayout({ ...editingPayout, amount: Number(e.target.value) || 0 })}
                      placeholder="Amount"
                      className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                    <select
                      value={editingPayout.method}
                      onChange={(e) => setEditingPayout({ ...editingPayout, method: e.target.value as ResellerPayoutRequest['method'] })}
                      className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                      <option value="bank">Bank</option>
                    </select>
                    <input
                      type="text"
                      value={editingPayout.accountNumber}
                      onChange={(e) => setEditingPayout({ ...editingPayout, accountNumber: e.target.value })}
                      placeholder="Account Number"
                      className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                    <input
                      type="text"
                      value={editingPayout.trxId || ''}
                      onChange={(e) => setEditingPayout({ ...editingPayout, trxId: e.target.value })}
                      placeholder="TrxID"
                      className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                    <select
                      value={editingPayout.status}
                      onChange={(e) => setEditingPayout({ ...editingPayout, status: e.target.value as ResellerPayoutRequest['status'] })}
                      className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={editingPayout.note || ''}
                      onChange={(e) => setEditingPayout({ ...editingPayout, note: e.target.value })}
                      placeholder={at('নোট...', 'Admin note...')}
                      className="flex-1 min-w-[200px] px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        updateResellerPayout(pay.id, {
                          amount: editingPayout.amount,
                          method: editingPayout.method,
                          accountNumber: editingPayout.accountNumber,
                          trxId: editingPayout.trxId,
                          status: editingPayout.status,
                          note: editingPayout.note
                        });
                        setEditingPayout(null);
                      }}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold whitespace-nowrap cursor-pointer"
                    >
                      {at('সেভ', 'Save')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPayout(null)}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold whitespace-nowrap cursor-pointer"
                    >
                      {at('বাতিল', 'Cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={pay.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs tabular-nums"
                >
                  <div>
                    <p className="font-bold text-white">
                      {pay.resellerName} ({pay.resellerPhone}) · <span className="text-emerald-400 font-mono">৳{pay.amount.toLocaleString()}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 uppercase mt-0.5">
                      {pay.method} · {pay.accountNumber} · {new Date(pay.createdAt).toLocaleString()}
                      {pay.trxId ? ` · TrxID: ${pay.trxId}` : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {pay.status === 'pending' ? (
                      <>
                        <input
                          type="text"
                          value={trxInputs[pay.id] || ''}
                          onChange={(e) => setTrxInputs((prev) => ({ ...prev, [pay.id]: e.target.value.toUpperCase() }))}
                          placeholder="TrxID..."
                          className="w-32 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => processResellerPayout(pay.id, 'paid', trxInputs[pay.id] || `TRX-${Date.now().toString().slice(-6)}`)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{at('পেইড মার্ক করুন', 'Mark Paid')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => processResellerPayout(pay.id, 'rejected', '', 'Rejected by admin & refunded')}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{at('বাতিল ও রিফান্ড', 'Reject')}</span>
                        </button>
                      </>
                    ) : (
                      <span
                        className={`font-bold uppercase text-[11px] ${
                          pay.status === 'paid' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pay.status}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingPayout({ ...pay })}
                      title={at('এডিট করুন', 'Edit Payout')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 text-amber-300 hover:text-white cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteResellerPayout(pay.id)}
                      title={at('মুছুন', 'Delete Payout')}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Modal: Edit Reseller Account */}
      {editingReseller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white">{at('রিসেলার তথ্য এডিট করুন', 'Edit Reseller Profile')}</h4>
              <button
                type="button"
                onClick={() => setEditingReseller(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('নাম', 'Name')}</label>
                <input
                  type="text"
                  value={editingReseller.name}
                  onChange={(e) => setEditingReseller({ ...editingReseller, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('ফোন', 'Phone')}</label>
                <input
                  type="text"
                  value={editingReseller.phone}
                  onChange={(e) => setEditingReseller({ ...editingReseller, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('ইমেইল', 'Email')}</label>
                <input
                  type="email"
                  value={editingReseller.email || ''}
                  onChange={(e) => setEditingReseller({ ...editingReseller, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('জেলা', 'District')}</label>
                <input
                  type="text"
                  value={editingReseller.district}
                  onChange={(e) => setEditingReseller({ ...editingReseller, district: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-bold mb-1">{at('ঠিকানা', 'Address')}</label>
                <input
                  type="text"
                  value={editingReseller.address || ''}
                  onChange={(e) => setEditingReseller({ ...editingReseller, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('রিসেলার কোড', 'Reseller Code')}</label>
                <input
                  type="text"
                  value={editingReseller.resellerCode}
                  onChange={(e) => setEditingReseller({ ...editingReseller, resellerCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('কমিশন %', 'Commission %')}</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={editingReseller.commissionPercent}
                  onChange={(e) => setEditingReseller({ ...editingReseller, commissionPercent: Math.max(1, Math.min(60, Number(e.target.value) || 1)) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Facebook Page URL</label>
                <input
                  type="text"
                  value={editingReseller.fbPageUrl || ''}
                  onChange={(e) => setEditingReseller({ ...editingReseller, fbPageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('অবস্থা', 'Status')}</label>
                <select
                  value={editingReseller.status}
                  onChange={(e) => setEditingReseller({ ...editingReseller, status: e.target.value as ResellerAccount['status'] })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingReseller(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                {at('বাতিল', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const { id, ...rest } = editingReseller;
                  updateResellerAccount(id, rest);
                  setEditingReseller(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer"
              >
                {at('সেভ করুন', 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attributed Reseller Orders Summary */}
      {resellerOrderCount > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>{at('সাম্প্রতিক রিসেলার অর্ডারসমূহ', 'Recent Attributed Reseller Orders')}</span>
          </h4>
          <div className="divide-y divide-slate-800 text-xs tabular-nums">
            {orders
              .filter((o) => o.partnerType === 'reseller')
              .slice(0, 10)
              .map((ord) => (
                <div key={ord.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-white">
                      #{ord.id} · {ord.resellerName} ({ord.resellerCode})
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Customer: {ord.customer.name} ({ord.customer.district}) · {ord.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-white">Total ৳{ord.pricing.total.toLocaleString()}</p>
                    <p className="text-[11px] text-emerald-400 font-mono">
                      Profit ৳{(ord.resellerProfit || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modal: Wallet Balance Adjustment */}
      {walletModalReseller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-sm text-white">{at('রিসেলার ওয়ালেট সমন্বয়', 'Adjust Reseller Wallet')}</h4>
                <p className="text-[11px] text-slate-400">{walletModalReseller.name} · Current: ৳{walletModalReseller.walletBalance}</p>
              </div>
              <button
                type="button"
                onClick={() => setWalletModalReseller(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">{at('টাকার পরিমাণ (৳)', 'Amount (BDT)')}</label>
                <input
                  type="number"
                  min={1}
                  value={walletDelta}
                  onChange={(e) => setWalletDelta(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">{at('নোট / কারণ', 'Reason / Bonus Note')}</label>
                <input
                  type="text"
                  value={walletNote}
                  onChange={(e) => setWalletNote(e.target.value)}
                  placeholder="Monthly target bonus / adjustment"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    adjustResellerWallet(walletModalReseller.id, walletDelta, walletNote);
                    setWalletModalReseller(null);
                  }}
                  className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{at('বোনাস যোগ করুন', 'Add +৳' + walletDelta)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    adjustResellerWallet(walletModalReseller.id, -walletDelta, walletNote);
                    setWalletModalReseller(null);
                  }}
                  className="py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>{at('সমন্বয় (-)', 'Deduct -৳' + walletDelta)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Quick WhatsApp API + AI Support for Selected Reseller */}
      {supportReseller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-emerald-700/60 p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>{at('রিসেলার WhatsApp ও AI সাপোর্ট', 'Reseller WhatsApp API & AI Support')}</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {supportReseller.name} ({supportReseller.resellerCode}) · {supportReseller.phone} · Wallet ৳{supportReseller.walletBalance}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSupportReseller(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(['approval', 'payout', 'order', 'general'] as const).map((intent) => (
                <button
                  key={intent}
                  type="button"
                  disabled={isDraftingAi}
                  onClick={async () => {
                    setIsDraftingAi(true);
                    try {
                      const draft = await generateWhatsAppAiDraft({
                        contactName: supportReseller.name,
                        contactType: 'reseller',
                        resellerInfo: supportReseller,
                        latestOrder: latestResellerOrder(supportReseller.id),
                        intent
                      });
                      if (draft) setWaDraft(draft);
                    } finally {
                      setIsDraftingAi(false);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-amber-300 flex items-center gap-1 cursor-pointer capitalize"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI {intent}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleCopyResellerOrderInfo(supportReseller)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer ml-auto"
              >
                {copiedResOrder ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>Copy Order Info</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={waDraft}
              onChange={(e) => setWaDraft(e.target.value)}
              placeholder={isDraftingAi ? at('AI মেসেজ লিখছে...', 'Generating AI draft...') : at('মেসেজ লিখুন...', 'Type WhatsApp message...')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              {onOpenWhatsAppDesk && (
                <button
                  type="button"
                  onClick={() => {
                    const phone = supportReseller.phone;
                    setSupportReseller(null);
                    onOpenWhatsAppDesk(phone);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold cursor-pointer"
                >
                  {at('সম্পূর্ণ চ্যাট থ্রেডে খুলুন →', 'Open Full Thread →')}
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <a
                  href={`https://wa.me/${supportReseller.phone.replace(/[^0-9]/g, '').replace(/^0/, '880')}?text=${encodeURIComponent(waDraft)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>wa.me</span>
                </a>
                <button
                  type="button"
                  disabled={isSendingWa || !waDraft.trim()}
                  onClick={async () => {
                    setIsSendingWa(true);
                    try {
                      const res = await sendMetaWhatsAppMessage({
                        to: supportReseller.phone,
                        message: waDraft.trim(),
                        contactName: supportReseller.name,
                        contactType: 'reseller',
                        orderId: latestResellerOrder(supportReseller.id)?.id,
                        senderRole: 'ai'
                      });
                      if (res.success) setSupportReseller(null);
                    } finally {
                      setIsSendingWa(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingWa ? at('পাঠানো হচ্ছে...', 'Sending...') : at('WhatsApp API পাঠান', 'Send via WhatsApp API')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
