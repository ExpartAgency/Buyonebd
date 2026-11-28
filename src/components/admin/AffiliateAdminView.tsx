import React, { useMemo, useState } from 'react';
import {
  Award,
  Save,
  Search,
  Wallet,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Minus,
  X,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { safeHref } from '../../utils/safeUrl';
import { AffiliateAccount } from '../../types';
import { BulkSectionShell, BulkCommandBar } from './BulkSectionShell';

export const AffiliateAdminView: React.FC = () => {
  const {
    settings,
    updateSettings,
    saveSettingsChanges,
    affiliates,
    updateAffiliateAccount,
    deleteAffiliateAccount,
    bulkUpdateAffiliates,
    bulkDeleteAffiliates,
    adjustAffiliateWallet,
    affiliateConversions,
    affiliatePayouts,
    processAffiliatePayout,
    deleteAffiliatePayout,
    adminLang
  } = useStore();

  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'suspended'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCommVal, setBulkCommVal] = useState('10');
  const [editingAffiliate, setEditingAffiliate] = useState<AffiliateAccount | null>(null);
  const [walletAffiliate, setWalletAffiliate] = useState<AffiliateAccount | null>(null);
  const [walletDelta, setWalletDelta] = useState<number>(200);
  const [walletNote, setWalletNote] = useState('');
  const [trxInputs, setTrxInputs] = useState<Record<string, string>>({});

  const cfg = settings.affiliateSettings || {
    enabled: true,
    autoApprove: false,
    defaultCommissionPercent: 8,
    minPayoutBdt: 500,
    cookieDays: 30,
    welcomeMsgBn: 'আপনার অ্যাফিলিয়েট লিংক শেয়ার করে প্রতিটি সেল থেকে আজীবন কমিশন আয় করুন!',
    welcomeMsgEn: 'Share your referral link & earn commission on every confirmed order!'
  };

  const patchCfg = (partial: Partial<typeof cfg>) => {
    updateSettings({
      affiliateSettings: {
        ...cfg,
        ...partial
      }
    });
  };

  const filteredAffiliates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return affiliates.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        a.affiliateCode.toLowerCase().includes(q)
      );
    });
  }, [affiliates, statusFilter, searchQuery]);

  const totalClicks = affiliates.reduce((s, a) => s + (a.clicksCount || 0), 0);
  const totalCommEarned = affiliates.reduce((s, a) => s + (a.totalEarnings || 0), 0);
  const pendingPayouts = affiliatePayouts.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>{at('অ্যাফিলিয়েট পার্টনার ও কমিশন ম্যানেজার', 'Affiliate Partners & Commission Desk')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {at(
              'অ্যাফিলিয়েট আবেদন অনুমোদন, কমিশন % টিয়ার সেট, ওয়ালেট সমন্বয় ও পে-আউট পরিচালনা করুন।',
              'Approve creators/publishers, configure commission %, track referral conversions, and settle payouts.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            saveSettingsChanges(
              at('অ্যাফিলিয়েট সেটিংস সংরক্ষিত!', 'Affiliate Settings Saved!'),
              at('কনফিগারেশন ডাটাবেজে সেভ হয়েছে।', 'Affiliate program settings saved.')
            )
          }
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{at('সেটিংস সেভ করুন', 'Save Settings')}</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 tabular-nums">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">{at('মোট অ্যাফিলিয়েট', 'Total Affiliates')}</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">{affiliates.length}</span>
          <span className="text-[11px] text-emerald-400">
            {affiliates.filter((a) => a.status === 'approved').length} approved
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">{at('মোট রেফারেল ক্লিক', 'Total Referral Clicks')}</span>
          <span className="text-2xl font-bold text-sky-400 font-mono mt-1 block">{totalClicks.toLocaleString()}</span>
          <span className="text-[11px] text-slate-400">{affiliateConversions.length} conversions</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">{at('মোট কমিশন আয়', 'Total Commission Paid/Credited')}</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">৳{totalCommEarned.toLocaleString()}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">{at('পেন্ডিং পে-আউট', 'Pending Payouts')}</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">{pendingPayouts}</span>
        </div>
      </div>

      {/* Program Rules */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h4 className="text-sm font-bold text-white">{at('অ্যাফিলিয়েট প্রোগ্রাম নিয়মাবলী', 'Program Rules & Attribution')}</h4>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cfg.enabled}
                onChange={(e) => patchCfg({ enabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span>{at('অ্যাফিলিয়েট পোর্টাল চালু', 'Enable Affiliate Program')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cfg.autoApprove}
                onChange={(e) => patchCfg({ autoApprove: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span>{at('অটো অ্যাপ্রুভাল', 'Auto-Approve New Signups')}</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs tabular-nums">
          <div>
            <label className="block text-slate-400 font-bold mb-1">Default Commission (%)</label>
            <input
              type="number"
              min={1}
              max={50}
              value={cfg.defaultCommissionPercent}
              onChange={(e) => patchCfg({ defaultCommissionPercent: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">Min Payout (BDT)</label>
            <input
              type="number"
              min={50}
              value={cfg.minPayoutBdt}
              onChange={(e) => patchCfg({ minPayoutBdt: Math.max(50, Number(e.target.value) || 50) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">Attribution Cookie Window (Days)</label>
            <input
              type="number"
              min={1}
              max={365}
              value={cfg.cookieDays}
              onChange={(e) => patchCfg({ cookieDays: Math.max(1, Number(e.target.value) || 30) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Affiliates Directory in BulkSectionShell */}
      <BulkSectionShell
        indexCode="BULK // AFFILIATES"
        title={at('অ্যাফিলিয়েট ডিরেক্টরি ও বাল্ক কন্ট্রোল', 'Registered Affiliates & Bulk Controls')}
        subtitle={at('অ্যাফিলিয়েট সিলেক্ট করে একসাথে অ্যাপ্রুভ, সাসপেন্ড, কমিশন % আপডেট বা ডিলিট করুন।', 'Bulk approve, suspend, update commission rates, adjust wallets, or remove affiliates.')}
        totalCount={filteredAffiliates.length}
        selectedCount={selectedIds.length}
        accent="emerald"
        headerActions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              {(['all', 'pending', 'approved', 'suspended'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase cursor-pointer ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
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
          totalCount={filteredAffiliates.length}
          allSelected={filteredAffiliates.length > 0 && filteredAffiliates.every((a) => selectedIds.includes(a.id))}
          onToggleSelectAll={() => {
            const ids = filteredAffiliates.map((a) => a.id);
            const allSel = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
            setSelectedIds(allSel ? [] : ids);
          }}
          onClearSelection={() => setSelectedIds([])}
          itemLabel="AFFILIATES"
        >
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={50}
              value={bulkCommVal}
              onChange={(e) => setBulkCommVal(e.target.value)}
              className="w-14 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs font-mono text-white text-center tabular-nums"
            />
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={() => {
                bulkUpdateAffiliates(selectedIds, { commissionPercent: Math.max(1, Math.min(50, Number(bulkCommVal) || 8)) });
                setSelectedIds([]);
              }}
              className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs cursor-pointer disabled:opacity-40"
            >
              Set Comm %
            </button>
          </div>
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => {
              bulkUpdateAffiliates(selectedIds, { status: 'approved' });
              setSelectedIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer disabled:opacity-40"
          >
            {at('অনুমোদন', 'Approve')}
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => {
              bulkUpdateAffiliates(selectedIds, { status: 'suspended' });
              setSelectedIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer disabled:opacity-40"
          >
            {at('স্থগিত', 'Suspend')}
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => {
              bulkDeleteAffiliates(selectedIds);
              setSelectedIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{at('মুছুন', 'Delete')}</span>
          </button>
        </BulkCommandBar>

        {filteredAffiliates.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            {at('কোনো অ্যাফিলিয়েট পাওয়া যায়নি।', 'No affiliates found.')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-2">
                    <input
                      type="checkbox"
                      checked={filteredAffiliates.length > 0 && filteredAffiliates.every((a) => selectedIds.includes(a.id))}
                      onChange={() => {
                        const ids = filteredAffiliates.map((a) => a.id);
                        const allSel = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
                        setSelectedIds(allSel ? [] : ids);
                      }}
                      className="accent-emerald-500 rounded"
                    />
                  </th>
                  <th className="py-2.5 px-3 font-semibold">{at('অ্যাফিলিয়েট', 'Affiliate')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('চ্যানেল', 'Channel')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('কমিশন %', 'Comm %')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('ক্লিক / অর্ডার', 'Clicks / Orders')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('ওয়ালেট / আয়', 'Wallet / Earned')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('অবস্থা', 'Status')}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{at('অ্যাকশন', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredAffiliates.map((aff) => (
                  <tr key={aff.id} className="hover:bg-slate-900/60">
                    <td className="py-3 px-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(aff.id)}
                        onChange={() =>
                          setSelectedIds((prev) =>
                            prev.includes(aff.id) ? prev.filter((x) => x !== aff.id) : [...prev, aff.id]
                          )
                        }
                        className="accent-emerald-500 rounded"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{aff.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">
                        {aff.affiliateCode} · {aff.phone}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      {aff.channelUrl ? (
                        <a
                          href={safeHref(aff.channelUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Channel</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500">{aff.district || 'BD'}</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={aff.commissionPercent}
                        onChange={(e) =>
                          updateAffiliateAccount(aff.id, {
                            commissionPercent: Math.max(1, Math.min(50, Number(e.target.value) || 1))
                          })
                        }
                        className="w-16 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white font-mono text-center"
                      />
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">
                      {aff.clicksCount} clicks · {aff.totalOrders} ord
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-mono font-bold text-emerald-400">৳{aff.walletBalance.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400">Earned ৳{aff.totalEarnings.toLocaleString()}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setWalletAffiliate(aff);
                            setWalletDelta(200);
                            setWalletNote('');
                          }}
                          className="p-1.5 rounded bg-slate-800 hover:bg-emerald-700 text-emerald-300 hover:text-white cursor-pointer"
                          title="Adjust Wallet"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold uppercase text-[11px] ${
                          aff.status === 'approved'
                            ? 'text-emerald-400'
                            : aff.status === 'suspended'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {aff.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditingAffiliate({ ...aff })}
                        className="p-1.5 rounded bg-slate-800 hover:bg-amber-600 text-amber-300 hover:text-white cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {aff.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => updateAffiliateAccount(aff.id, { status: 'approved' })}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteAffiliateAccount(aff.id)}
                        className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white cursor-pointer"
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

      {/* Payout Queue */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span>{at('অ্যাফিলিয়েট পে-আউট আবেদনসমূহ', 'Affiliate Payout Requests')}</span>
        </h4>
        {affiliatePayouts.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">{at('কোনো পে-আউট আবেদন নেই।', 'No affiliate payout requests yet.')}</p>
        ) : (
          <div className="space-y-2.5">
            {affiliatePayouts.map((pay) => (
              <div
                key={pay.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs tabular-nums"
              >
                <div>
                  <p className="font-bold text-white">
                    {pay.affiliateName} ({pay.affiliatePhone}) · <span className="text-emerald-400 font-mono">৳{pay.amount.toLocaleString()}</span>
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
                        onChange={(e) => setTrxInputs((p) => ({ ...p, [pay.id]: e.target.value.toUpperCase() }))}
                        placeholder="TrxID..."
                        className="w-32 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => processAffiliatePayout(pay.id, 'paid', trxInputs[pay.id] || `TRX-${Date.now().toString().slice(-6)}`)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Paid</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => processAffiliatePayout(pay.id, 'rejected', '', 'Rejected & refunded')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <span className={`font-bold uppercase text-[11px] ${pay.status === 'paid' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pay.status}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteAffiliatePayout(pay.id)}
                    className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wallet Modal */}
      {walletAffiliate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-sm text-white">Adjust Affiliate Wallet</h4>
                <p className="text-slate-400">{walletAffiliate.name} · Current: ৳{walletAffiliate.walletBalance}</p>
              </div>
              <button type="button" onClick={() => setWalletAffiliate(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="number"
              min={1}
              value={walletDelta}
              onChange={(e) => setWalletDelta(Math.max(1, Number(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
            <input
              type="text"
              value={walletNote}
              onChange={(e) => setWalletNote(e.target.value)}
              placeholder="Bonus or adjustment note..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  adjustAffiliateWallet(walletAffiliate.id, walletDelta, walletNote);
                  setWalletAffiliate(null);
                }}
                className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add +৳{walletDelta}
              </button>
              <button
                type="button"
                onClick={() => {
                  adjustAffiliateWallet(walletAffiliate.id, -walletDelta, walletNote);
                  setWalletAffiliate(null);
                }}
                className="py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" /> Deduct -৳{walletDelta}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAffiliate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white">Edit Affiliate Account</h4>
              <button type="button" onClick={() => setEditingAffiliate(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Name</label>
                <input
                  type="text"
                  value={editingAffiliate.name}
                  onChange={(e) => setEditingAffiliate({ ...editingAffiliate, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Phone</label>
                <input
                  type="text"
                  value={editingAffiliate.phone}
                  onChange={(e) => setEditingAffiliate({ ...editingAffiliate, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Affiliate Code</label>
                <input
                  type="text"
                  value={editingAffiliate.affiliateCode}
                  onChange={(e) => setEditingAffiliate({ ...editingAffiliate, affiliateCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Commission %</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={editingAffiliate.commissionPercent}
                  onChange={(e) => setEditingAffiliate({ ...editingAffiliate, commissionPercent: Number(e.target.value) || 8 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-bold mb-1">Status</label>
                <select
                  value={editingAffiliate.status}
                  onChange={(e) => setEditingAffiliate({ ...editingAffiliate, status: e.target.value as AffiliateAccount['status'] })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditingAffiliate(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const { id, ...rest } = editingAffiliate;
                  updateAffiliateAccount(id, rest);
                  setEditingAffiliate(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
