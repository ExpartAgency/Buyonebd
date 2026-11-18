import React, { useState } from 'react';
import {
  Building2,
  Save,
  Search,
  MessageSquare,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { WholesaleAccount, WholesaleQuoteRequest } from '../../types';

export const WholesaleAdminView: React.FC = () => {
  const {
    settings,
    updateSettings,
    saveSettingsChanges,
    wholesalers,
    updateWholesalerAccount,
    wholesaleQuotes,
    updateWholesaleQuote,
    orders,
    adminLang
  } = useStore();

  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);

  const [searchQuery, setSearchQuery] = useState('');
  const [quotePrices, setQuotePrices] = useState<Record<string, string>>({});
  const [quoteNotes, setQuoteNotes] = useState<Record<string, string>>({});

  const cfg = settings.wholesaleSettings || {
    enabled: true,
    autoApprove: false,
    defaultMinQty: 10,
    silverDiscountPercent: 5,
    goldDiscountPercent: 10,
    platinumDiscountPercent: 15,
    requireAdvancePercent: 25,
    b2bHeadlineBn: 'BuyOne BD B2B হোলসেল ট্রেড পোর্টাল',
    b2bHeadlineEn: 'BuyOne BD B2B Wholesale Portal'
  };

  const patchCfg = (partial: Partial<typeof cfg>) => {
    updateSettings({
      wholesaleSettings: {
        ...cfg,
        ...partial
      }
    });
  };

  const approvedBuyers = wholesalers.filter((w) => w.status === 'approved').length;
  const pendingBuyers = wholesalers.filter((w) => w.status === 'pending').length;
  const wholesaleOrders = orders.filter((o) => o.partnerType === 'wholesale').length;
  const pendingQuotes = wholesaleQuotes.filter((q) => q.status === 'pending').length;

  const filteredWholesalers = wholesalers.filter((w) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      w.companyName.toLowerCase().includes(q) ||
      w.contactName.toLowerCase().includes(q) ||
      w.phone.toLowerCase().includes(q) ||
      w.district.toLowerCase().includes(q)
    );
  });

  const handleTierChange = (buyer: WholesaleAccount, tier: WholesaleAccount['tier']) => {
    const mappedDiscount =
      tier === 'Platinum'
        ? cfg.platinumDiscountPercent
        : tier === 'Gold'
        ? cfg.goldDiscountPercent
        : cfg.silverDiscountPercent;
    updateWholesalerAccount(buyer.id, { tier, extraDiscountPercent: mappedDiscount });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span>{at('হোলসেল B2B ট্রেড ও কোটেশন ম্যানেজার', 'Wholesale B2B Buyer & RFQ Desk')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {at(
              'কেবল অনুমোদিত হোলসেল বায়ারদের জন্য পাইকারি মূল্য ও MOQ স্ল্যাব আনলক হবে।',
              'Verify trade buyers, manage Silver/Gold/Platinum tiers, and respond to custom RFQ quotes.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            saveSettingsChanges(
              at('হোলসেল সেটিংস সংরক্ষিত!', 'Wholesale Settings Saved!'),
              at('B2B হোলসেল কনফিগারেশন সেভ করা হয়েছে।', 'Wholesale B2B tiers and MOQ defaults saved.')
            )
          }
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{at('হোলসেল সেটিংস সেভ করুন', 'Save Wholesale Settings')}</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 tabular-nums">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">{at('ভেরিফাইড বায়ার', 'Verified Buyers')}</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">{approvedBuyers}</span>
          <span className="text-[11px] text-slate-400">{wholesalers.length} total accounts</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">{at('নতুন আবেদন বাকি', 'Pending Review')}</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">{pendingBuyers}</span>
          <span className="text-[11px] text-slate-400">{at('ট্রেড লাইসেন্স যাচাই', 'Awaiting verification')}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">{at('হোলসেল অর্ডার', 'Wholesale Orders')}</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">{wholesaleOrders}</span>
          <span className="text-[11px] text-slate-400">{at('সক্রিয় B2B অর্ডার', 'Completed / Active')}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">{at('খোলা RFQ কোটেশন', 'Open Quotes (RFQ)')}</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">{pendingQuotes}</span>
          <span className="text-[11px] text-slate-400">{wholesaleQuotes.length} total quotes</span>
        </div>
      </div>

      {/* Program Rules & Tiers */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h4 className="text-sm font-bold text-white">{at('B2B টায়ার ও MOQ ডিফল্টস', 'Tier Discounts & MOQ Rules')}</h4>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cfg.enabled}
                onChange={(e) => patchCfg({ enabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <span>{at('হোলসেল পোর্টাল চালু', 'Enable Wholesale B2B')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!cfg.autoApprove}
                onChange={(e) => patchCfg({ autoApprove: !e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <span>{at('ম্যানুয়াল ভেরিফিকেশন বাধ্যতামূলক', 'Require Admin Verification')}</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums">
          <div>
            <label className="block text-slate-400 font-bold mb-1">{at('ডিফল্ট MOQ (পিস)', 'Default MOQ (pcs)')}</label>
            <input
              type="number"
              min={2}
              value={cfg.defaultMinQty}
              onChange={(e) => patchCfg({ defaultMinQty: Math.max(2, Number(e.target.value) || 2) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">Silver Tier Off (%)</label>
            <input
              type="number"
              min={0}
              max={60}
              value={cfg.silverDiscountPercent}
              onChange={(e) => patchCfg({ silverDiscountPercent: Math.max(0, Math.min(60, Number(e.target.value) || 0)) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">Gold Tier Off (%)</label>
            <input
              type="number"
              min={0}
              max={60}
              value={cfg.goldDiscountPercent}
              onChange={(e) => patchCfg({ goldDiscountPercent: Math.max(0, Math.min(60, Number(e.target.value) || 0)) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">Platinum Tier Off (%)</label>
            <input
              type="number"
              min={0}
              max={60}
              value={cfg.platinumDiscountPercent}
              onChange={(e) => patchCfg({ platinumDiscountPercent: Math.max(0, Math.min(60, Number(e.target.value) || 0)) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Registered Wholesale Accounts */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-sm font-bold text-white">{at('হোলসেল বায়ার তালিকা ও টায়ার নিয়ন্ত্রণ', 'Wholesale Trade Accounts')}</h4>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={at('কোম্পানি, নাম বা ফোন...', 'Search company, buyer, phone...')}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
          </div>
        </div>

        {filteredWholesalers.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            {at('কোনো হোলসেল বায়ার পাওয়া যায়নি।', 'No wholesale accounts found.')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">{at('প্রতিষ্ঠান ও কন্টাক্ট', 'Company & Contact')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('ট্রেড লাইসেন্স / ভলিউম', 'Trade ID & Volume')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('টায়ার', 'Tier')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('অতিরিক্ত ছাড় %', 'Extra %')}</th>
                  <th className="py-2.5 px-3 font-semibold">{at('অবস্থা', 'Status')}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{at('অ্যাকশন', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredWholesalers.map((w: WholesaleAccount) => (
                  <tr key={w.id} className="hover:bg-slate-950/50">
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{w.companyName}</p>
                      <p className="text-[11px] text-slate-400">
                        {w.contactName} · {w.phone} · {w.district}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-mono text-slate-200">{w.tradeLicenseNo || w.nidNumber || 'Not provided'}</p>
                      <p className="text-[11px] text-slate-400">{w.businessType} · {w.monthlyVolumeEstimate || 'N/A'}</p>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={w.tier}
                        onChange={(e) => handleTierChange(w, e.target.value as WholesaleAccount['tier'])}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                      >
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                        <option value="Platinum">Platinum</option>
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min={0}
                        max={40}
                        value={w.extraDiscountPercent}
                        onChange={(e) =>
                          updateWholesalerAccount(w.id, {
                            extraDiscountPercent: Math.max(0, Math.min(40, Number(e.target.value) || 0))
                          })
                        }
                        className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-center"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold uppercase text-[11px] ${
                          w.status === 'approved'
                            ? 'text-emerald-400'
                            : w.status === 'suspended'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      {w.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => updateWholesalerAccount(w.id, { status: 'approved' })}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                        >
                          {at('অনুমোদন', 'Approve')}
                        </button>
                      )}
                      {w.status !== 'suspended' && (
                        <button
                          type="button"
                          onClick={() => updateWholesalerAccount(w.id, { status: 'suspended' })}
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

      {/* Custom Bulk Quotes (RFQ) Desk */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>{at('বাল্ক RFQ কোটেশন রেসপন্স ডেস্ক', 'Wholesale Bulk RFQ Quote Desk')}</span>
        </h4>

        {wholesaleQuotes.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">{at('কোনো RFQ কোটেশন জমা পড়েনি।', 'No wholesale RFQ requests yet.')}</p>
        ) : (
          <div className="space-y-3">
            {wholesaleQuotes.map((qt: WholesaleQuoteRequest) => (
              <div
                key={qt.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs tabular-nums"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-white">
                      {qt.companyName} · <span className="text-emerald-400">{qt.productTitle}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Qty: {qt.requestedQty} pcs
                      {qt.targetUnitPrice ? ` · Buyer Target: ৳${qt.targetUnitPrice}/unit` : ''} · {qt.phone}
                    </p>
                    {qt.notes && <p className="text-[11px] text-slate-300 mt-1">{qt.notes}</p>}
                  </div>
                  <span
                    className={`font-bold uppercase text-[11px] ${
                      qt.status === 'accepted' || qt.status === 'quoted'
                        ? 'text-emerald-400'
                        : qt.status === 'rejected'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {qt.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <input
                    type="number"
                    placeholder={at('অফার রেট (৳/পিস)', 'Offer ৳/unit')}
                    value={quotePrices[qt.id] ?? (qt.adminQuotedPrice ? String(qt.adminQuotedPrice) : '')}
                    onChange={(e) => setQuotePrices((p) => ({ ...p, [qt.id]: e.target.value }))}
                    className="sm:col-span-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder={at('কোটেশন নোট / ডেলিভারি শর্ত...', 'Admin quote note / terms...')}
                    value={quoteNotes[qt.id] ?? qt.notes ?? ''}
                    onChange={(e) => setQuoteNotes((p) => ({ ...p, [qt.id]: e.target.value }))}
                    className="sm:col-span-5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  />
                  <div className="sm:col-span-4 flex flex-wrap items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        updateWholesaleQuote(qt.id, {
                          status: 'quoted',
                          adminQuotedPrice: Number(quotePrices[qt.id]) || qt.targetUnitPrice || undefined,
                          notes: quoteNotes[qt.id] || qt.notes || 'Quoted rate available for 7 days.'
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{at('অফার পাঠান', 'Send Quote')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateWholesaleQuote(qt.id, {
                          status: 'rejected',
                          notes: quoteNotes[qt.id] || qt.notes || 'Unable to meet target MOQ rate.'
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{at('প্রত্যাখ্যান', 'Reject')}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
