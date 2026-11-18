import React, { useState, useEffect } from 'react';
import { Award, Save } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { LoyaltySettings } from '../../types';

export const LoyaltyRulesPanel: React.FC = () => {
  const { settings, updateSettings, saveSettingsChanges, adminLang } = useStore();
  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);

  const [form, setForm] = useState<LoyaltySettings>({
    enabled: settings.loyaltySettings?.enabled !== false,
    pointsPer100Bdt: settings.loyaltySettings?.pointsPer100Bdt ?? 5,
    bdtPerPoint: settings.loyaltySettings?.bdtPerPoint ?? 1,
    minRedeemPoints: settings.loyaltySettings?.minRedeemPoints ?? 10,
    maxRedeemPercent: settings.loyaltySettings?.maxRedeemPercent ?? 50,
    welcomeBonusPoints: settings.loyaltySettings?.welcomeBonusPoints ?? 25
  });

  useEffect(() => {
    if (settings.loyaltySettings) {
      setForm({
        enabled: settings.loyaltySettings.enabled !== false,
        pointsPer100Bdt: settings.loyaltySettings.pointsPer100Bdt ?? 5,
        bdtPerPoint: settings.loyaltySettings.bdtPerPoint ?? 1,
        minRedeemPoints: settings.loyaltySettings.minRedeemPoints ?? 10,
        maxRedeemPercent: settings.loyaltySettings.maxRedeemPercent ?? 50,
        welcomeBonusPoints: settings.loyaltySettings.welcomeBonusPoints ?? 25
      });
    }
  }, [settings.loyaltySettings]);

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ loyaltySettings: form });
    setTimeout(() => {
      saveSettingsChanges(
        at('লয়্যালটি রুলস সংরক্ষিত হয়েছে', 'Loyalty Rules Saved'),
        at('কাস্টমার লয়্যালটি পয়েন্ট নিয়ম স্থায়ীভাবে সেভ হয়েছে।', 'Loyalty point earn & redeem rules saved.')
      );
    }, 30);
  };

  return (
    <form
      onSubmit={handleSaveRules}
      className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>{at('লয়্যালটি পয়েন্ট প্রোগ্রাম সেটিংস (Earn & Redeem)', 'Customer Loyalty Points Program Rules')}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {at(
              'কাস্টমাররা প্রতিটি কেনাকাটায় কত পয়েন্ট অর্জন করবে ও চেকআউটে কত টাকা ছাড় পাবে তা নির্ধারণ করুন',
              'Configure earn rate per ৳100 purchase, BDT value per point, min redeem & max discount cap'
            )}
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
          <span>{form.enabled ? at('সিস্টেম চালু আছে', 'Program Active') : at('বন্ধ', 'Paused')}</span>
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs tabular-nums">
        <div>
          <label className="block text-slate-400 font-bold mb-1">
            {at('প্রতি ৳১০০-এ পয়েন্ট', 'Pts / ৳100 Spent')}
          </label>
          <input
            type="number"
            min={0}
            value={form.pointsPer100Bdt}
            onChange={(e) => setForm((f) => ({ ...f, pointsPer100Bdt: Math.max(0, Number(e.target.value)) }))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-slate-400 font-bold mb-1">
            {at('১ পয়েন্ট = কত টাকা (৳)', 'BDT per Point (৳)')}
          </label>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={form.bdtPerPoint}
            onChange={(e) => setForm((f) => ({ ...f, bdtPerPoint: Math.max(0.1, Number(e.target.value)) }))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-slate-400 font-bold mb-1">
            {at('মিনিমাম রিডিম পয়েন্ট', 'Min Redeem Pts')}
          </label>
          <input
            type="number"
            min={1}
            value={form.minRedeemPoints}
            onChange={(e) => setForm((f) => ({ ...f, minRedeemPoints: Math.max(1, Number(e.target.value)) }))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-slate-400 font-bold mb-1">
            {at('সর্বোচ্চ রিডিম লিমিট (%)', 'Max Order Cap (%)')}
          </label>
          <input
            type="number"
            min={5}
            max={100}
            value={form.maxRedeemPercent}
            onChange={(e) => setForm((f) => ({ ...f, maxRedeemPercent: Math.min(100, Math.max(5, Number(e.target.value))) }))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-slate-400 font-bold mb-1">
            {at('ওয়েলকাম বোনাস পয়েন্ট', 'Welcome Bonus')}
          </label>
          <input
            type="number"
            min={0}
            value={form.welcomeBonusPoints}
            onChange={(e) => setForm((f) => ({ ...f, welcomeBonusPoints: Math.max(0, Number(e.target.value)) }))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{at('লয়্যালটি রুলস সেভ করুন', 'Save Loyalty Rules')}</span>
        </button>
      </div>
    </form>
  );
};
