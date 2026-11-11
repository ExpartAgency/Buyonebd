import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Grid,
  ChevronRight,
  Flame,
  PhoneCall,
  MessageCircle,
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

interface MobileCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const MobileCategoryDrawer: React.FC<MobileCategoryDrawerProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory
}) => {
  const { categories, products, settings, t } = useStore();

  if (!isOpen) return null;

  const activeCategories = categories.filter((c) => c.isActive);

  const getProductCount = (slug: string) => {
    if (slug === 'all') return products.length;
    return products.filter((p) => p.category === slug).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10 animate-slide-right">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {t('সকল ক্যাটাগরি', 'All Categories')}
              </h3>
              <p className="text-[11px] text-slate-500">
                {activeCategories.length} {t('টি সক্রিয় ক্যাটাগরি', 'Active Categories')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {/* All Products Option */}
          <button
            onClick={() => {
              onSelectCategory('all');
              onClose();
            }}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">✨</span>
              <span className="text-sm font-semibold">{t('সকল পণ্য একসাথে', 'All Products')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                selectedCategory === 'all'
                  ? 'bg-emerald-700/60 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {products.length}
              </span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </div>
          </button>

          {/* Flash Sale Highlight if active */}
          {settings.flashSale?.enabled && (
            <button
              onClick={() => {
                onSelectCategory('flash-sale');
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold shadow-md shadow-rose-500/20"
            >
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-amber-300 animate-bounce" />
                <span className="text-sm">
                  {t(settings.flashSale.headlineBn || 'ধামাকা ফ্ল্যাশ সেল', 'Mega Flash Sale')}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                HOT
              </span>
            </button>
          )}

          {/* Dynamic Categories */}
          {activeCategories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            const count = getProductCount(cat.slug);

            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.slug);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.icon || '📦'}</span>
                  <span className="text-sm font-semibold">{t(cat.nameBn, cat.nameEn)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-emerald-700/60 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Support Info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('সাহায্যের জন্য কল করুন', 'Quick Support Hotline')}
          </p>
          <a
            href={`tel:${settings.hotline}`}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold hover:text-emerald-600 transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span>{settings.hotline}</span>
          </a>
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>{t('হোয়াটসঅ্যাপে চ্যাট করুন', 'Chat on WhatsApp')}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
