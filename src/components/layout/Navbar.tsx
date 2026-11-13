import React, { useState, useMemo } from 'react';
import { ShoppingBag, User, Menu, Globe, ChevronDown, ChevronRight, Layers, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface NavbarProps {
  onOpenMobileCategories?: () => void;
  onSelectCategory?: (slug: string, subSlug?: string | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileCategories, onSelectCategory }) => {
  const {
    settings,
    categories,
    cartCount,
    setIsCartOpen,
    goHome,
    openAllProductsPage,
    selectCategoryFilter,
    lang,
    setLang,
    t,
    openCustomerPortal,
    isCustomerLoggedIn
  } = useStore();

  const activeCategories = useMemo(() => categories.filter((c) => c.isActive), [categories]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [hoveredCatId, setHoveredCatId] = useState<string>(activeCategories[0]?.id || '');

  const hoveredCat =
    activeCategories.find((c) => c.id === hoveredCatId) || activeCategories[0];

  const handleCategoryClick = (slug: string, subSlug: string | null = null) => {
    if (onSelectCategory) {
      onSelectCategory(slug, subSlug);
    } else {
      selectCategoryFilter(slug, subSlug);
    }
    setIsCategoryDropdownOpen(false);
  };

  const renderStoreName = () => {
    const raw =
      lang === 'bn'
        ? settings.storeNameBn || settings.storeName || 'BuyOneBD'
        : settings.storeName || 'BuyOneBD';
    if (raw === 'BuyOne BD' || raw === 'BuyOneBD') {
      return (
        <>
          BuyOne<span className="text-emerald-600 dark:text-emerald-400">BD</span>
        </>
      );
    }
    return raw;
  };

  const logoMode = settings.logoMode || (settings.logoUrl ? 'both' : 'text');

  return (
    <header
      className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 dark:border-slate-800 w-full max-w-full"
      style={{ backgroundColor: settings.themeColors?.headerBg || undefined }}
    >
      {/* Top Announcement Bar */}
      {settings?.announcementBar?.enabled && (
        <div className="bg-slate-900 text-white text-[10px] sm:text-[11px] font-medium py-1.5 px-3 text-center overflow-hidden border-b border-slate-800">
          <div className="max-w-7xl mx-auto truncate">
            {lang === 'bn'
              ? settings.announcementBar.textBn || 'সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা | হেল্পলাইন: 01886-289663'
              : settings.announcementBar.textEn || 'Nationwide Fast Home Delivery with Cash on Delivery | Helpline: 01886-289663'}
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        {/* Left Section: Mobile Hamburger + Logo + Desktop 2-Pane Mega Menu + All Products */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <button
            onClick={onOpenMobileCategories}
            className="p-1.5 sm:p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden cursor-pointer transition-colors shrink-0"
            aria-label={t('ক্যাটাগরি মেনু', 'Categories Menu')}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Clickable Dynamic Backend Logo -> Returns Home (/) */}
          <button
            type="button"
            onClick={goHome}
            className="flex items-center gap-2 cursor-pointer select-none group min-w-0 shrink-0 text-left"
            aria-label={t('হোম পেজে যান', 'Go to Home Page')}
          >
            {settings.logoUrl && (logoMode === 'image' || logoMode === 'both') && (
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                referrerPolicy="no-referrer"
                className="h-8 sm:h-9 max-w-[130px] object-contain rounded-lg"
              />
            )}
            {(logoMode === 'text' || logoMode === 'both' || !settings.logoUrl) && (
              <span className="font-display text-lg sm:text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight truncate whitespace-nowrap">
                {renderStoreName()}
              </span>
            )}
          </button>

          {/* Desktop 2-Pane Flyout Mega Menu for Categories & Subcategories */}
          <div
            className="hidden lg:block relative ml-3"
            onMouseEnter={() => {
              if (!hoveredCatId && activeCategories[0]) setHoveredCatId(activeCategories[0].id);
              setIsCategoryDropdownOpen(true);
            }}
            onMouseLeave={() => setIsCategoryDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('ক্যাটাগরি মেনু', 'Categories')}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                  isCategoryDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 pt-2 z-50">
                <div className="w-[560px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-12 animate-fade-in">
                  {/* Left Pane: Parent Departments */}
                  <div className="col-span-5 bg-slate-50 dark:bg-slate-950/60 border-r border-slate-200/80 dark:border-slate-800 p-2 space-y-0.5 max-h-[380px] overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCategoryDropdownOpen(false);
                        openAllProductsPage();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t('সকল পণ্য দেখুন', 'All Products')}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {activeCategories.map((cat) => {
                      const isActive = hoveredCat?.id === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onMouseEnter={() => setHoveredCatId(cat.id)}
                          onClick={() => handleCategoryClick(cat.slug, null)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <span className="truncate">{lang === 'bn' ? cat.nameBn : cat.nameEn}</span>
                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Pane: Subcategories for Hovered Department */}
                  <div className="col-span-7 p-4 flex flex-col justify-between bg-white dark:bg-slate-900">
                    {hoveredCat ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {lang === 'bn' ? hoveredCat.nameBn : hoveredCat.nameEn}
                          </h4>
                          <button
                            type="button"
                            onClick={() => handleCategoryClick(hoveredCat.slug, null)}
                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-500 cursor-pointer whitespace-nowrap"
                          >
                            {t('সব দেখুন →', 'View All →')}
                          </button>
                        </div>

                        {hoveredCat.subcategories && hoveredCat.subcategories.length > 0 ? (
                          <div className="grid grid-cols-2 gap-1.5">
                            {hoveredCat.subcategories.map((sub) => (
                              <button
                                key={sub.slug}
                                type="button"
                                onClick={() => handleCategoryClick(hoveredCat.slug, sub.slug)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
                              >
                                <span className="truncate">{lang === 'bn' ? sub.nameBn : sub.nameEn}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 py-6 text-center">
                            {t('এই বিভাগের সকল পণ্য দেখতে ক্লিক করুন।', 'Click View All to explore all items in this category.')}
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={openAllProductsPage}
            className="hidden lg:inline-flex text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-2 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {t('সকল পণ্য', 'All Products')}
          </button>
        </div>

        {/* Right Section: Language Toggle, Cart, Customer Profile Icon */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-[11px] sm:text-xs font-bold cursor-pointer transition-colors border border-slate-200/70 dark:border-slate-700 whitespace-nowrap shrink-0"
            title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{lang === 'bn' ? 'EN' : 'BN'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all active:scale-95 shrink-0"
            aria-label={t('কার্ট', 'Cart')}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="bg-emerald-500 text-slate-950 font-black text-[10px] sm:text-[11px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-mono tabular-nums">
              {cartCount}
            </span>
          </button>

          <button
            type="button"
            onClick={openCustomerPortal}
            className={`relative p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer active:scale-95 shrink-0 ${
              isCustomerLoggedIn
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title={t('কাস্টমার প্রোফাইল ও লগইন', 'Customer Sign In & Profile')}
            aria-label={t('কাস্টমার প্রোফাইল', 'Customer Profile')}
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            {isCustomerLoggedIn && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
