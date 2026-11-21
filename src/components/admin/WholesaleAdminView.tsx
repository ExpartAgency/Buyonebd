import React, { useState } from 'react';
import {
  Building2,
  Save,
  Search,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { WholesaleAccount, WholesaleQuoteRequest } from '../../types';
import { BulkSectionShell, BulkCommandBar } from './BulkSectionShell';

export const WholesaleAdminView: React.FC = () => {
  const {
    settings,
    updateSettings,
    saveSettingsChanges,
    wholesalers,
    updateWholesalerAccount,
    deleteWholesalerAccount,
    bulkUpdateWholesalers,
    bulkDeleteWholesalers,
    wholesaleQuotes,
    updateWholesaleQuote,
    deleteWholesaleQuote,
    bulkUpdateWholesaleQuotes,
    bulkDeleteWholesaleQuotes,
    submitWholesaleDebtPayment,
    convertWholesaleQuoteToOrder,
    orders,
    adminLang
  } = useStore();

  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);

  const [searchQuery, setSearchQuery] = useState('');
  const [quotePrices, setQuotePrices] = useState<Record<string, string>>({});
  const [quoteNotes, setQuoteNotes] = useState<Record<string, string>>({});
  const [selectedBuyerIds, setSelectedBuyerIds] = useState<string[]>([]);
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<string[]>([]);
  const [editingBuyer, setEditingBuyer] = useState<WholesaleAccount | null>(null);
  const [editingQuote, setEditingQuote] = useState<WholesaleQuoteRequest | null>(null);

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

      {/* Registered Wholesale Accounts in BulkSectionShell */}
      <BulkSectionShell
        indexCode="BULK // WHOLESALE B2B"
        title={at('হোলসেল বায়ার তালিকা ও টায়ার নিয়ন্ত্রণ', 'Wholesale Trade Accounts')}
        subtitle={at('একাধিক হোলসেল বায়ার সিলেক্ট করে একসাথে টায়ার, স্ট্যাটাস বা ডিলিট অ্যাকশন চালান।', 'Select buyers to bulk assign tier, approve, suspend, edit profile, or remove.')}
        totalCount={filteredWholesalers.length}
        selectedCount={selectedBuyerIds.length}
        accent="cyan"
        headerActions={
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={at('কোম্পানি, নাম বা ফোন...', 'Search company, buyer, phone...')}
              className="w-full pl-9 pr-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        }
      >
        <BulkCommandBar
          selectedCount={selectedBuyerIds.length}
          totalCount={filteredWholesalers.length}
          allSelected={filteredWholesalers.length > 0 && filteredWholesalers.every((w) => selectedBuyerIds.includes(w.id))}
          onToggleSelectAll={() => {
            const visibleIds = filteredWholesalers.map((w) => w.id);
            const allSel = visibleIds.length > 0 && visibleIds.every((id) => selectedBuyerIds.includes(id));
            setSelectedBuyerIds(allSel ? [] : visibleIds);
          }}
          onClearSelection={() => setSelectedBuyerIds([])}
          itemLabel="BUYERS"
        >
          <button
            type="button"
            disabled={selectedBuyerIds.length === 0}
            onClick={() => {
              bulkUpdateWholesalers(selectedBuyerIds, { status: 'approved' });
              setSelectedBuyerIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
          >
            {at('অনুমোদন', 'Approve')}
          </button>
          <button
            type="button"
            disabled={selectedBuyerIds.length === 0}
            onClick={() => {
              bulkUpdateWholesalers(selectedBuyerIds, { tier: 'Gold', extraDiscountPercent: cfg.goldDiscountPercent });
              setSelectedBuyerIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
          >
            Gold Tier
          </button>
          <button
            type="button"
            disabled={selectedBuyerIds.length === 0}
            onClick={() => {
              bulkUpdateWholesalers(selectedBuyerIds, { tier: 'Platinum', extraDiscountPercent: cfg.platinumDiscountPercent });
              setSelectedBuyerIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
          >
            Platinum Tier
          </button>
          <button
            type="button"
            disabled={selectedBuyerIds.length === 0}
            onClick={() => {
              bulkUpdateWholesalers(selectedBuyerIds, { status: 'suspended' });
              setSelectedBuyerIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-amber-600 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
          >
            {at('স্থগিত', 'Suspend')}
          </button>
          <button
            type="button"
            disabled={selectedBuyerIds.length === 0}
            onClick={() => {
              bulkDeleteWholesalers(selectedBuyerIds);
              setSelectedBuyerIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{at('মুছুন', 'Delete')}</span>
          </button>
        </BulkCommandBar>

        {filteredWholesalers.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            {at('কোনো হোলসেল বায়ার পাওয়া যায়নি।', 'No wholesale accounts found.')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-2">
                    <input
                      type="checkbox"
                      checked={filteredWholesalers.length > 0 && filteredWholesalers.every((w) => selectedBuyerIds.includes(w.id))}
                      onChange={() => {
                        const visibleIds = filteredWholesalers.map((w) => w.id);
                        const allSel = visibleIds.length > 0 && visibleIds.every((id) => selectedBuyerIds.includes(id));
                        setSelectedBuyerIds(allSel ? [] : visibleIds);
                      }}
                      className="accent-cyan-500 rounded"
                    />
                  </th>
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
                  <tr key={w.id} className={`hover:bg-slate-900/60 ${selectedBuyerIds.includes(w.id) ? 'bg-cyan-950/20' : ''}`}>
                    <td className="py-3 px-2">
                      <input
                        type="checkbox"
                        checked={selectedBuyerIds.includes(w.id)}
                        onChange={() =>
                          setSelectedBuyerIds((prev) =>
                            prev.includes(w.id) ? prev.filter((x) => x !== w.id) : [...prev, w.id]
                          )
                        }
                        className="accent-cyan-500 rounded"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{w.companyName}</p>
                      <p className="text-[11px] text-slate-400">
                        {w.contactName} · {w.phone} · {w.district}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-mono text-slate-200">{w.tradeLicenseNo || w.nidNumber || 'Not provided'}</p>
                      <p className="text-[11px] text-slate-400">
                        {w.businessType} · Limit ৳{(w.creditLimitBdt || 100000).toLocaleString()} · Due{' '}
                        <span className="text-amber-400 font-mono">৳{(w.creditUsedBdt || 0).toLocaleString()}</span>
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={w.tier}
                        onChange={(e) => handleTierChange(w, e.target.value as WholesaleAccount['tier'])}
                        className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-white text-xs"
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
                        className="w-16 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white font-mono text-center"
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
                      <button
                        type="button"
                        onClick={() => setEditingBuyer({ ...w })}
                        title={at('বায়ার এডিট করুন', 'Edit Buyer')}
                        className="p-1.5 rounded bg-slate-800 hover:bg-amber-600 text-amber-300 hover:text-white inline-flex items-center cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {w.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => updateWholesalerAccount(w.id, { status: 'approved' })}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer whitespace-nowrap"
                        >
                          {at('অনুমোদন', 'Approve')}
                        </button>
                      )}
                      {w.status !== 'suspended' && (
                        <button
                          type="button"
                          onClick={() => updateWholesalerAccount(w.id, { status: 'suspended' })}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-white font-bold text-[11px] cursor-pointer whitespace-nowrap"
                        >
                          {at('স্থগিত', 'Suspend')}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteWholesalerAccount(w.id)}
                        title={at('বায়ার মুছুন', 'Delete Buyer')}
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

      {/* Custom Bulk Quotes (RFQ) Desk inside BulkSectionShell */}
      <BulkSectionShell
        indexCode="BULK // RFQ QUOTES"
        title={at('বাল্ক RFQ কোটেশন রেসপন্স ডেস্ক', 'Wholesale Bulk RFQ Quote Desk')}
        subtitle={at('পাইকারি কোটেশন এডিট, প্রাইস অফার, বাল্ক অ্যাপ্রুভ বা ডিলিট করুন।', 'Review, edit, quote, reject, or delete bulk RFQ requests in batches.')}
        totalCount={wholesaleQuotes.length}
        selectedCount={selectedQuoteIds.length}
        accent="amber"
      >
        <BulkCommandBar
          selectedCount={selectedQuoteIds.length}
          totalCount={wholesaleQuotes.length}
          allSelected={wholesaleQuotes.length > 0 && wholesaleQuotes.every((q) => selectedQuoteIds.includes(q.id))}
          onToggleSelectAll={() => {
            const ids = wholesaleQuotes.map((q) => q.id);
            const allSel = ids.length > 0 && ids.every((id) => selectedQuoteIds.includes(id));
            setSelectedQuoteIds(allSel ? [] : ids);
          }}
          onClearSelection={() => setSelectedQuoteIds([])}
          itemLabel="QUOTES"
        >
          <button
            type="button"
            disabled={selectedQuoteIds.length === 0}
            onClick={() => {
              bulkUpdateWholesaleQuotes(selectedQuoteIds, { status: 'quoted' });
              setSelectedQuoteIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
          >
            {at('অফার মার্ক করুন', 'Mark Quoted')}
          </button>
          <button
            type="button"
            disabled={selectedQuoteIds.length === 0}
            onClick={() => {
              bulkUpdateWholesaleQuotes(selectedQuoteIds, { status: 'rejected' });
              setSelectedQuoteIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
          >
            {at('প্রত্যাখ্যান', 'Reject Selected')}
          </button>
          <button
            type="button"
            disabled={selectedQuoteIds.length === 0}
            onClick={() => {
              bulkDeleteWholesaleQuotes(selectedQuoteIds);
              setSelectedQuoteIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{at('মুছুন', 'Delete')}</span>
          </button>
        </BulkCommandBar>

        {wholesaleQuotes.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">{at('কোনো RFQ কোটেশন জমা পড়েনি।', 'No wholesale RFQ requests yet.')}</p>
        ) : (
          <div className="space-y-3">
            {wholesaleQuotes.map((qt: WholesaleQuoteRequest) =>
              editingQuote?.id === qt.id ? (
                <div
                  key={qt.id}
                  className="p-4 rounded-xl bg-slate-900 border border-amber-500/60 space-y-2.5 text-xs tabular-nums"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-amber-300">
                      {at('RFQ এডিট করুন', 'Edit Quote')}: {qt.companyName}
                    </p>
                    <button type="button" onClick={() => setEditingQuote(null)} className="text-slate-400 hover:text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={editingQuote.productTitle}
                      onChange={(e) => setEditingQuote({ ...editingQuote, productTitle: e.target.value })}
                      placeholder="Product Title"
                      className="sm:col-span-2 px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-white"
                    />
                    <input
                      type="number"
                      min={1}
                      value={editingQuote.requestedQty}
                      onChange={(e) => setEditingQuote({ ...editingQuote, requestedQty: Math.max(1, Number(e.target.value) || 1) })}
                      placeholder="Requested Qty"
                      className="px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                    <input
                      type="number"
                      value={editingQuote.targetUnitPrice ?? ''}
                      onChange={(e) => setEditingQuote({ ...editingQuote, targetUnitPrice: Number(e.target.value) || undefined })}
                      placeholder="Target Price"
                      className="px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="number"
                      value={editingQuote.adminQuotedPrice ?? ''}
                      onChange={(e) => setEditingQuote({ ...editingQuote, adminQuotedPrice: Number(e.target.value) || undefined })}
                      placeholder="Admin Offer Price"
                      className="px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                    <select
                      value={editingQuote.status}
                      onChange={(e) => setEditingQuote({ ...editingQuote, status: e.target.value as WholesaleQuoteRequest['status'] })}
                      className="px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="quoted">Quoted</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <input
                      type="text"
                      value={editingQuote.notes || ''}
                      onChange={(e) => setEditingQuote({ ...editingQuote, notes: e.target.value })}
                      placeholder="Notes / Terms"
                      className="sm:col-span-2 px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingQuote(null)}
                      className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 font-bold cursor-pointer"
                    >
                      {at('বাতিল', 'Cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateWholesaleQuote(qt.id, {
                          productTitle: editingQuote.productTitle,
                          requestedQty: editingQuote.requestedQty,
                          targetUnitPrice: editingQuote.targetUnitPrice,
                          adminQuotedPrice: editingQuote.adminQuotedPrice,
                          status: editingQuote.status,
                          notes: editingQuote.notes
                        });
                        setEditingQuote(null);
                      }}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    >
                      {at('সেভ করুন', 'Save Quote')}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={qt.id}
                  className={`p-4 rounded-xl bg-slate-900 border space-y-3 text-xs tabular-nums ${
                    selectedQuoteIds.includes(qt.id) ? 'border-amber-500/70' : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedQuoteIds.includes(qt.id)}
                        onChange={() =>
                          setSelectedQuoteIds((prev) =>
                            prev.includes(qt.id) ? prev.filter((x) => x !== qt.id) : [...prev, qt.id]
                          )
                        }
                        className="mt-1 accent-amber-500 rounded"
                      />
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
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-bold uppercase text-[11px] mr-1 ${
                          qt.status === 'accepted' || qt.status === 'quoted'
                            ? 'text-emerald-400'
                            : qt.status === 'rejected'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {qt.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingQuote({ ...qt })}
                        title={at('কোটেশন এডিট', 'Edit Quote')}
                        className="p-1.5 rounded bg-slate-800 hover:bg-amber-600 text-amber-300 hover:text-white cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteWholesaleQuote(qt.id)}
                        title={at('কোটেশন মুছুন', 'Delete Quote')}
                        className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <input
                      type="number"
                      placeholder={at('অফার রেট (৳/পিস)', 'Offer ৳/unit')}
                      value={quotePrices[qt.id] ?? (qt.adminQuotedPrice ? String(qt.adminQuotedPrice) : '')}
                      onChange={(e) => setQuotePrices((p) => ({ ...p, [qt.id]: e.target.value }))}
                      className="sm:col-span-3 px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                    <input
                      type="text"
                      placeholder={at('কোটেশন নোট / ডেলিভারি শর্ত...', 'Admin quote note / terms...')}
                      value={quoteNotes[qt.id] ?? qt.notes ?? ''}
                      onChange={(e) => setQuoteNotes((p) => ({ ...p, [qt.id]: e.target.value }))}
                      className="sm:col-span-5 px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-white"
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
                        className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{at('অফার পাঠান', 'Send Quote')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => convertWholesaleQuoteToOrder(qt.id)}
                        className="px-2.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] cursor-pointer whitespace-nowrap"
                      >
                        {at('অর্ডারে কনভার্ট', 'Convert to Order')}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateWholesaleQuote(qt.id, {
                            status: 'rejected',
                            notes: quoteNotes[qt.id] || qt.notes || 'Unable to meet target MOQ rate.'
                          })
                        }
                        className="px-2.5 py-1.5 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{at('প্রত্যাখ্যান', 'Reject')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </BulkSectionShell>

      {/* Modal: Edit Wholesale Account */}
      {editingBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white">{at('হোলসেল বায়ার এডিট করুন', 'Edit Wholesale Account')}</h4>
              <button
                type="button"
                onClick={() => setEditingBuyer(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('প্রতিষ্ঠানের নাম', 'Company Name')}</label>
                <input
                  type="text"
                  value={editingBuyer.companyName}
                  onChange={(e) => setEditingBuyer({ ...editingBuyer, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('কন্টাক্ট নাম', 'Contact Name')}</label>
                <input
                  type="text"
                  value={editingBuyer.contactName}
                  onChange={(e) => setEditingBuyer({ ...editingBuyer, contactName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('ফোন', 'Phone')}</label>
                <input
                  type="text"
                  value={editingBuyer.phone}
                  onChange={(e) => setEditingBuyer({ ...editingBuyer, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('জেলা', 'District')}</label>
                <input
                  type="text"
                  value={editingBuyer.district}
                  onChange={(e) => setEditingBuyer({ ...editingBuyer, district: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-bold mb-1">{at('ঠিকানা', 'Address')}</label>
                <input
                  type="text"
                  value={editingBuyer.address}
                  onChange={(e) => setEditingBuyer({ ...editingBuyer, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('ট্রেড লাইসেন্স', 'Trade License')}</label>
                <input
                  type="text"
                  value={editingBuyer.tradeLicenseNo || ''}
                  onChange={(e) => setEditingBuyer({ ...editingBuyer, tradeLicenseNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('টায়ার', 'Tier')}</label>
                <select
                  value={editingBuyer.tier}
                  onChange={(e) => setEditingBuyer({ ...editingBuyer, tier: e.target.value as WholesaleAccount['tier'] })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('অতিরিক্ত ছাড় %', 'Extra Discount %')}</label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={editingBuyer.extraDiscountPercent}
                  onChange={(e) => setEditingBuyer({ ...editingBuyer, extraDiscountPercent: Math.max(0, Math.min(40, Number(e.target.value) || 0)) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('অবস্থা', 'Status')}</label>
                <select
                  value={editingBuyer.status}
                  onChange={(e) => setEditingBuyer({ ...editingBuyer, status: e.target.value as WholesaleAccount['status'] })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('ক্রেডিট লিমিট (৳)', 'Credit Limit (৳)')}</label>
                <input
                  type="number"
                  min={0}
                  value={editingBuyer.creditLimitBdt ?? 100000}
                  onChange={(e) => setEditingBuyer({ ...editingBuyer, creditLimitBdt: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">{at('পেমেন্ট টার্মস', 'Payment Terms')}</label>
                <select
                  value={editingBuyer.paymentTerms || 'Net-15'}
                  onChange={(e) => setEditingBuyer({ ...editingBuyer, paymentTerms: e.target.value as WholesaleAccount['paymentTerms'] })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="COD">COD</option>
                  <option value="Net-7">Net-7</option>
                  <option value="Net-15">Net-15</option>
                  <option value="Net-30">Net-30</option>
                </select>
              </div>
            </div>
            {(editingBuyer.creditUsedBdt || 0) > 0 && (
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 flex items-center justify-between gap-2 text-xs">
                <span className="text-amber-300 font-bold">Due Balance: ৳{(editingBuyer.creditUsedBdt || 0).toLocaleString()}</span>
                <button
                  type="button"
                  onClick={() => {
                    submitWholesaleDebtPayment(editingBuyer.id, editingBuyer.creditUsedBdt || 0, 'Full B2B settlement by Admin');
                    setEditingBuyer(null);
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Settle Full Due
                </button>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingBuyer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                {at('বাতিল', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const { id, ...rest } = editingBuyer;
                  updateWholesalerAccount(id, rest);
                  setEditingBuyer(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer"
              >
                {at('সেভ করুন', 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
