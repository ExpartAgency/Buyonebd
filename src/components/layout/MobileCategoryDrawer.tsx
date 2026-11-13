import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Grid,
  ChevronRight,
  Flame,
  PhoneCall,
  MessageCircle,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

interface MobileCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (categoryId: string, subSlug?: string | null) => void;
}

export const MobileCategoryDrawer: React.FC<MobileCategoryDrawerProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory
}) => {
  const {
    categories,
    products,
    settings,
    openProductPage,
    openOneClickCheckout,
    lang,
    t
  } = useStore();

  const activeCategories = categories.filter((c) => c.isActive);
  const [focusedSlug, setFocusedSlug] = useState<string>(
    selectedCategory && selectedCategory !== 'all' ? selectedCategory : (activeCategories[0]?.slug || 'all')
  );

  if (!isOpen) return null;

  const focusedCategoryObj = activeCategories.find((c) => c.slug === focusedSlug);
  const paneProducts =
    focusedSlug === 'all'
      ? products.slice(0, 6)
      : focusedSlug === 'flash-sale'
      ? products.filter((p) => p.isFlashSale).slice(0, 6)
      : products.filter((p) => p.category === focusedSlug).slice(0, 6);

  const handlePickCategory = (slug: string, subSlug: string | null = null) => {
    onSelectCategory(slug, subSlug);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Temu-Style Split Two-Pane Drawer */}
      <div className="relative w-full max-w-[430px] h-full bg-white dark:bg-slate-950 shadow-2xl flex flex-col z-10 animate-slide-right">
        {/* Top Bar */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Grid className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight">
                {t('সকল ক্যাটাগরি', 'Browse Categories')}
              </h3>
              <p className="text-[10px] text-slate-500">
                {activeCategories.length} {t('টি সক্রিয় বিভাগ', 'Departments')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Split Body: Left Category Rail + Right Subcategories & Products Pane */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* LEFT RAIL (Temu App Style) */}
          <div className="w-24 sm:w-28 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto py-2 space-y-1 shrink-0">
            {/* All Products Rail Item */}
            <button
              onClick={() => setFocusedSlug('all')}
              className={`w-full px-2 py-3 text-center flex flex-col items-center gap-1 transition-all cursor-pointer relative ${
                focusedSlug === 'all'
                  ? 'bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 font-black'
                  : 'text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {focusedSlug === 'all' && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-600" />
              )}
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] leading-tight line-clamp-2">{t('সকল পণ্য', 'All Items')}</span>
            </button>

            {/* Flash Sale Rail Item */}
            {settings.flashSale?.enabled && (
              <button
                onClick={() => setFocusedSlug('flash-sale')}
                className={`w-full px-2 py-3 text-center flex flex-col items-center gap-1 transition-all cursor-pointer relative ${
                  focusedSlug === 'flash-sale'
                    ? 'bg-white dark:bg-slate-950 text-rose-600 font-black'
                    : 'text-rose-600/80 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/20'
                }`}
              >
                {focusedSlug === 'flash-sale' && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-rose-600" />
                )}
                <div className="w-9 h-9 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
                  <Flame className="w-4 h-4" />
                </div>
                <span className="text-[10px] leading-tight line-clamp-2">{t('ফ্ল্যাশ সেল', 'Flash Sale')}</span>
              </button>
            )}

            {/* Dynamic Active Categories (Thumbnail Image or Clean Letter Badge — NO ugly raw word icons) */}
            {activeCategories.map((cat) => {
              const isFocused = focusedSlug === cat.slug;
              const label = lang === 'bn' ? cat.nameBn : cat.nameEn;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFocusedSlug(cat.slug)}
                  className={`w-full px-1.5 py-2.5 text-center flex flex-col items-center gap-1 transition-all cursor-pointer relative ${
                    isFocused
                      ? 'bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 font-black'
                      : 'text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200/50 dark:hover:bg-slate-800'
                  }`}
                >
                  {isFocused && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-600" />
                  )}
                  {cat.iconImage ? (
                    <img
                      src={cat.iconImage}
                      alt={label}
                      className={`w-10 h-10 rounded-full object-cover border ${
                        isFocused ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                  ) : (
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black ${
                        isFocused
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {label.slice(0, 1)}
                    </div>
                  )}
                  <span className="text-[10px] leading-tight line-clamp-2 px-0.5">{label}</span>
                </button>
              );
            })}
          </div>

          {/* RIGHT PANE: Hero Banner + Subcategories Visual Grid + Category Products */}
          <div className="flex-1 bg-white dark:bg-slate-950 overflow-y-auto p-3.5 space-y-4">
            {/* Selected Category Header + View All */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="min-w-0">
                <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">
                  {focusedSlug === 'all'
                    ? t('সকল জনপ্রিয় পণ্য', 'All Featured Departments')
                    : focusedSlug === 'flash-sale'
                    ? t('ধামাকা ফ্ল্যাশ সেল', 'Flash Sale Deals')
                    : focusedCategoryObj
                    ? t(focusedCategoryObj.nameBn, focusedCategoryObj.nameEn)
                    : ''}
                </h4>
              </div>
              <button
                onClick={() => handlePickCategory(focusedSlug)}
                className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black flex items-center gap-0.5 cursor-pointer shrink-0"
              >
                <span>{t('সব দেখুন', 'See All')}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Subcategories Visual Thumbnail Grid (Temu Style) */}
            {focusedCategoryObj && focusedCategoryObj.subcategories && focusedCategoryObj.subcategories.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  {t('সাব-ক্যাটাগরি সমূহ', 'Subcategories')}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {focusedCategoryObj.subcategories.map((sub) => (
                    <button
                      key={sub.slug}
                      onClick={() => handlePickCategory(focusedCategoryObj.slug, sub.slug)}
                      className="flex flex-col items-center text-center p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-emerald-400 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 mb-1 flex items-center justify-center">
                        {sub.image || focusedCategoryObj.iconImage ? (
                          <img
                            src={sub.image || focusedCategoryObj.iconImage}
                            alt={sub.nameEn}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">
                        {lang === 'bn' ? sub.nameBn : sub.nameEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Top Picks Mini Products */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                {t('সেরা পণ্যসমূহ', 'Top Picks')}
              </span>
              {paneProducts.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  {t('এই ক্যাটাগরিতে শীঘ্রই পণ্য আসছে।', 'Products coming soon to this department.')}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {paneProducts.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 flex flex-col justify-between gap-1.5"
                    >
                      <div
                        onClick={() => {
                          openProductPage(p);
                          onClose();
                        }}
                        className="cursor-pointer space-y-1"
                      >
                        <img src={p.images[0]} alt={p.title} referrerPolicy="no-referrer" className="w-full h-20 object-cover rounded-xl" />
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-1">
                          {lang === 'bn' ? p.titleBn : p.title}
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-black text-emerald-600 font-mono">৳{p.price}</span>
                          {p.originalPrice > p.price && (
                            <span className="text-[9px] text-slate-400 line-through">৳{p.originalPrice}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          openOneClickCheckout(p);
                          onClose();
                        }}
                        className="w-full py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer"
                      >
                        {t('অর্ডার', 'Order')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Support Bar */}
        <div className="px-3 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2 shrink-0">
          <a
            href={`tel:${settings.hotline}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-[11px] font-bold"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate">{t('কল হটলাইন', 'Hotline')}</span>
          </a>
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 text-white text-[11px] font-bold"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{t('হোয়াটসঅ্যাপ', 'WhatsApp')}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
