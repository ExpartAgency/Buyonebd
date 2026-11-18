import React, { useState } from 'react';
import {
  Users,
  Wallet,
  CheckCircle2,
  XCircle,
  Save,
  Search,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ResellerAccount } from '../../types';

export const ResellerAdminView: React.FC = () => {
  const {
    settings,
    updateSettings,
    saveSettingsChanges,
    resellers,
    updateResellerAccount,
    resellerPayouts,
    processResellerPayout,
    orders,
    adminLang
  } = useStore();

  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);

  const [searchQuery, setSearchQuery] = useState('');
  const [trxInputs, setTrxInputs] = useState<Record<string, string>>({});

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
  const resellerOrderCount = orders.filter((o) => o.partnerType === 'reseller').length;
  const pendingPayoutTotal = resellerPayouts
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredResellers = resellers.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.phone.toLowerCase().includes(q) ||
      r.resellerCode.toLowerCase().includes(q) ||
      r.district.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>{at('রিসেলার নেটওয়ার্ক ও পে-আউট ম্যানেজার', 'Reseller Program & Payout Console')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {at(
              'শুধুমাত্র অনুমোদিত রিসেলাররাই লগইন করে স্টোরের গোপন রিসেলার প্রাইস দেখতে পারবেন।',
              'Manage reseller applications, commissions, wallet balances, and withdrawal settlements.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            saveSettingsChanges(
              at('রিসেলার সেটিংস সংরক্ষিত!', 'Reseller Settings Saved!'),
              at('রিসেলার প্রোগ্রাম কনফিগারেশন ডাটাবেজে সেভ হয়েছে।', 'Reseller rules persisted.')
            )
          }
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{at('রিসেলার সেটিংস সেভ করুন', 'Save Reseller Settings')}</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 tabular-nums">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">{at('মোট রিসেলার', 'Total Resellers')}</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">{resellers.length}</span>
          <span className="text-[11px] text-emerald-400">{approvedCount} approved</span>
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

      {/* Program Rules Form (Stages draft only; Save button above/below commits) */}
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

      {/* Reseller Directory */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-sm font-bold text-white">{at('নিবন্ধিত রিসেলার তালিকা', 'Registered Resellers')}</h4>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={at('নাম, ফোন বা কোড দিয়ে খুঁজুন...', 'Search name, phone, code...')}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
          </div>
        </div>

        {filteredResellers.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            {at('কোনো রিসেলার অ্যাকাউন্ট পাওয়া যায়নি।', 'No reseller accounts match your filter.')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">{at('রিসেলার', 'Reseller')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('জেলা ও পেজ', 'District & Store')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('কমিশন %', 'Comm %')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('ওয়ালেট / আয়', 'Wallet / Earned')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('অবস্থা', 'Status')}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{at('অ্যাকশন', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredResellers.map((r: ResellerAccount) => (
                  <tr key={r.id} className="hover:bg-slate-950/50">
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
                        className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-center"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-mono font-bold text-emerald-400">৳{r.walletBalance.toLocaleString()}</p>
                      <p className="text-[11px] text-slate-400">
                        Earned ৳{r.totalEarnings.toLocaleString()} · {r.totalOrders} ord
                      </p>
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
                      {r.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => updateResellerAccount(r.id, { status: 'approved' })}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                        >
                          {at('অনুমোদন', 'Approve')}
                        </button>
                      )}
                      {r.status !== 'suspended' && (
                        <button
                          type="button"
                          onClick={() => updateResellerAccount(r.id, { status: 'suspended' })}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white font-bold text-[11px] cursor-pointer"
                        >
                          {at('স্থগিত', 'Suspend')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
            {resellerPayouts.map((pay) => (
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

                {pay.status === 'pending' ? (
                  <div className="flex flex-wrap items-center gap-2">
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
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{at('পেইড মার্ক করুন', 'Mark Paid')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => processResellerPayout(pay.id, 'rejected', '', 'Rejected by admin & refunded')}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{at('বাতিল ও রিফান্ড', 'Reject')}</span>
                    </button>
                  </div>
                ) : (
                  <span
                    className={`font-bold uppercase text-[11px] ${
                      pay.status === 'paid' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {pay.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
              .slice(0, 8)
              .map((ord) => (
                <div key={ord.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-white">
                      #{ord.id} · {ord.resellerName} ({ord.resellerCode})
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Customer: {ord.customer.name} ({ord.customer.district})
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
    </div>
  );
};
