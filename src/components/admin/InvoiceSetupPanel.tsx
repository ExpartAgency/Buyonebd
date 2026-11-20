import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Upload,
  Image as ImageIcon,
  Printer,
  Check
} from 'lucide-react';
import { InvoiceCustomField, InvoicePaperSize, InvoiceSettings } from '../../types';
import { useStore } from '../../context/StoreContext';
import { INITIAL_SETTINGS } from '../../data/initialData';

interface InvoiceSetupPanelProps {
  onImageUpload: (
    file: File | undefined,
    onLoaded: (dataUrl: string) => void,
    sourceTag?: 'product' | 'slider' | 'logo' | 'category' | 'seo' | 'upload'
  ) => void;
}

export const InvoiceSetupPanel: React.FC<InvoiceSetupPanelProps> = ({ onImageUpload }) => {
  const { settings, updateSettings, saveSettingsChanges, mediaLibrary, adminLang } = useStore();
  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);

  const [showLogoGallery, setShowLogoGallery] = useState(false);

  const cfg: InvoiceSettings = {
    ...(INITIAL_SETTINGS.invoiceSettings as InvoiceSettings),
    ...(settings.invoiceSettings || {})
  };

  const patchInvoice = (partial: Partial<InvoiceSettings>) => {
    updateSettings({
      invoiceSettings: {
        ...cfg,
        ...partial
      }
    });
  };

  const customFields: InvoiceCustomField[] = cfg.customFields || [];

  const handleAddCustomField = () => {
    const newField: InvoiceCustomField = {
      id: `invf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      label: 'Custom Field',
      value: '',
      showOnA4: true,
      showOnLabel: false,
      showOnReceipt: false
    };
    patchInvoice({ customFields: [...customFields, newField] });
  };

  const handleUpdateField = (id: string, patch: Partial<InvoiceCustomField>) => {
    patchInvoice({
      customFields: customFields.map((f) => (f.id === id ? { ...f, ...patch } : f))
    });
  };

  const handleDeleteField = (id: string) => {
    patchInvoice({
      customFields: customFields.filter((f) => f.id !== id)
    });
  };

  return (
    <div id="admin-invoice-setup-panel" className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>{at('ইনভয়েস ও কুরিয়ার লেবেল সেটআপ (A4, Label, 80mm & Custom Fields)', 'Invoice & Shipping Label Setup (A4, Labels & Custom Fields)')}</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {at(
              'A4 ইনভয়েস, কুরিয়ার লেবেল (4×6, 4×3, 3×2), 80mm রিসিপ্ট ও সীমাহীন কাস্টম ফিল্ড যোগ করুন',
              'Customize A4 invoices, thermal labels, receipts & add unlimited custom invoice fields'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            saveSettingsChanges(
              at('ইনভয়েস সেটআপ সংরক্ষিত!', 'Invoice Setup Saved!'),
              at('আপনার ইনভয়েস ও লেবেল কনফিগারেশন সেভ করা হয়েছে।', 'All invoice & label layout settings saved.')
            )
          }
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{at('ইনভয়েস সেটিংস সেভ করুন', 'Save Invoice Setup')}</span>
        </button>
      </div>

      {/* Company & Legal Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-slate-300 font-bold mb-1">{at('কোম্পানির নাম (EN)', 'Company Name (EN)')}</label>
          <input
            type="text"
            value={cfg.companyName}
            onChange={(e) => patchInvoice({ companyName: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">{at('কোম্পানির নাম (বাংলা)', 'Company Name (BN)')}</label>
          <input
            type="text"
            value={cfg.companyNameBn || ''}
            onChange={(e) => patchInvoice({ companyNameBn: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">{at('হেল্পলাইন ফোন', 'Support / Dispatch Phone')}</label>
          <input
            type="text"
            value={cfg.phone}
            onChange={(e) => patchInvoice({ phone: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">{at('ইমেইল', 'Company Email')}</label>
          <input
            type="text"
            value={cfg.email || ''}
            onChange={(e) => patchInvoice({ email: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">BIN / VAT / Trade Reg</label>
          <input
            type="text"
            value={cfg.binVatNumber || ''}
            onChange={(e) => patchInvoice({ binVatNumber: e.target.value })}
            placeholder="001234567-0101"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">{at('ডিফল্ট পেপার / লেবেল সাইজ', 'Default Paper / Label Format')}</label>
          <select
            value={cfg.defaultPaperSize}
            onChange={(e) => patchInvoice({ defaultPaperSize: e.target.value as InvoicePaperSize })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
          >
            <option value="A4">A4 Standard Invoice</option>
            <option value="label_4x6">Shipping Label 4×6 in</option>
            <option value="label_4x3">Shipping Label 4×3 in</option>
            <option value="label_3x2">Parcel Sticker 3×2 in</option>
            <option value="thermal_80mm">80mm Thermal POS Receipt</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-slate-300 font-bold mb-1">{at('ওয়্যারহাউস / অফিসের ঠিকানা', 'Company / Return Address')}</label>
          <input
            type="text"
            value={cfg.address}
            onChange={(e) => patchInvoice({ address: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Prefix</label>
            <input
              type="text"
              value={cfg.invoicePrefix || 'INV-'}
              onChange={(e) => patchInvoice({ invoicePrefix: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-bold mb-1">{at('থিম কালার', 'Accent Color')}</label>
            <input
              type="color"
              value={cfg.accentColor || '#059669'}
              onChange={(e) => patchInvoice({ accentColor: e.target.value })}
              className="w-full h-9 p-1 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Invoice Logo Upload + Pick from Gallery */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {cfg.logoUrl && (
              <img
                src={cfg.logoUrl}
                alt="Invoice Logo"
                referrerPolicy="no-referrer"
                className="h-10 w-auto max-w-[110px] object-contain rounded-lg bg-white p-1 border border-slate-700"
              />
            )}
            <div>
              <span className="font-bold text-white block">{at('ইনভয়েস লোগো (A4 ও লেবেলের জন্য)', 'Invoice & Shipping Label Logo')}</span>
              <span className="text-[11px] text-slate-400">
                {at('ডিভাইস থেকে আপলোড করুন অথবা মিডিয়া গ্যালারি থেকে বেছে নিন', 'Upload custom logo or pick from Store Media Gallery')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{at('আপলোড', 'Upload Logo')}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  onImageUpload(f, (url) => patchInvoice({ logoUrl: url }), 'logo');
                  e.currentTarget.value = '';
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => setShowLogoGallery((v) => !v)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{at('গ্যালারি থেকে নিন', 'Pick from Gallery')} ({mediaLibrary.length})</span>
            </button>
          </div>
        </div>

        <input
          type="text"
          value={cfg.logoUrl || ''}
          onChange={(e) => patchInvoice({ logoUrl: e.target.value })}
          placeholder="Or paste invoice logo URL..."
          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-[11px]"
        />

        {showLogoGallery && mediaLibrary.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 pt-2 border-t border-slate-800 max-h-44 overflow-y-auto">
            {mediaLibrary.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  patchInvoice({ logoUrl: m.url });
                  setShowLogoGallery(false);
                }}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer ${
                  cfg.logoUrl === m.url ? 'border-emerald-500' : 'border-slate-800 hover:border-sky-400'
                }`}
              >
                <img src={m.url} alt={m.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                {cfg.logoUrl === m.url && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes, Terms & Visibility Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-slate-300 font-bold mb-1">{at('হেডার নোট / ব্যানার টেক্সট', 'Header Note')}</label>
          <input
            type="text"
            value={cfg.headerNote || ''}
            onChange={(e) => patchInvoice({ headerNote: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">{at('স্বাক্ষরকারী পদের নাম', 'Authorized Signatory Label')}</label>
          <input
            type="text"
            value={cfg.authorizedSignatoryName || ''}
            onChange={(e) => patchInvoice({ authorizedSignatoryName: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">{at('ফুটার নোট', 'Footer Note')}</label>
          <input
            type="text"
            value={cfg.footerNote || ''}
            onChange={(e) => patchInvoice({ footerNote: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-bold mb-1">{at('শর্তাবলী ও ওয়ারেন্টি নোট', 'Terms & Return Policy')}</label>
          <input
            type="text"
            value={cfg.termsText || ''}
            onChange={(e) => patchInvoice({ termsText: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1">
        {(
          [
            ['showProductImages', at('প্রোডাক্ট ছবি দেখান', 'Show Product Images')],
            ['showSku', at('SKU / সাইজ / কালার দেখান', 'Show Variant / SKU')],
            ['showBarcode', at('বারকোড ও ট্র্যাকিং দেখান', 'Show Barcode')],
            ['showCustomerEmail', at('কাস্টমার ইমেইল দেখান', 'Show Customer Email')],
            ['showOrderNotes', at('অর্ডার নোট দেখান', 'Show Order Notes')],
            ['showCodBadge', at('COD ব্যাজ দেখান', 'Show COD Badge')],
            ['showAuthorizedSignature', at('সিগনেচার বক্স দেখান', 'Show Signature Box')]
          ] as [keyof InvoiceSettings, string][]
        ).map(([key, label]) => (
          <label key={String(key)} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(cfg[key])}
              onChange={(e) => patchInvoice({ [key]: e.target.checked } as Partial<InvoiceSettings>)}
              className="w-4 h-4 accent-emerald-500 rounded"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {/* Unlimited Dynamic Custom Fields Builder */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h5 className="font-bold text-white flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>{at('কাস্টম ইনভয়েস ও লেবেল ফিল্ড (আরও যোগ করুন)', 'Custom Invoice & Label Fields (Add Unlimited)')}</span>
            </h5>
            <p className="text-[11px] text-slate-400">
              {at(
                'ওয়ারেন্টি, ডেলিভারি ইন্সট্রাকশন, ফেসবুক পেজ বা নিজস্ব যেকোনো ফিল্ড যুক্ত করুন',
                'Add custom fields (Warranty, Return Policy, Packed By, Helpline, etc.) and pick where they print'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddCustomField}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{at('নতুন ফিল্ড যোগ করুন', '+ Add Custom Field')}</span>
          </button>
        </div>

        {customFields.length === 0 ? (
          <p className="text-slate-500 py-3 text-center">
            {at('এখনো কোনো কাস্টম ফিল্ড যোগ করা হয়নি।', 'No custom fields added yet. Click "+ Add Custom Field" above.')}
          </p>
        ) : (
          <div className="space-y-2">
            {customFields.map((field) => (
              <div
                key={field.id}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-2"
              >
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                  placeholder="Field Label (e.g. Warranty)"
                  className="w-36 sm:w-44 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold"
                />
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => handleUpdateField(field.id, { value: e.target.value })}
                  placeholder="Value (e.g. 6 Months Replacement)"
                  className="flex-1 min-w-[160px] px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
                />
                <div className="flex items-center gap-2.5 text-[11px] text-slate-300 px-1">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.showOnA4 !== false}
                      onChange={(e) => handleUpdateField(field.id, { showOnA4: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>A4</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(field.showOnLabel)}
                      onChange={(e) => handleUpdateField(field.id, { showOnLabel: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>Label</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(field.showOnReceipt)}
                      onChange={(e) => handleUpdateField(field.id, { showOnReceipt: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>80mm</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteField(field.id)}
                  className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 cursor-pointer"
                  title="Remove Field"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
