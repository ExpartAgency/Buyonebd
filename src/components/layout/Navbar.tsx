import React, { useState } from 'react';
import { ShoppingBag, User, Menu, Globe, ChevronDown, Layers } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface NavbarProps {
  onOpenMobileCategories?: () => void;
  onSelectCategory?: (slug: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileCategories, onSelectCategory }) => {
  const {
    settings,
    categories,
    cartCount,
    setIsCartOpen,
    activeView,
    setActiveView,
    lang,
    setLang,
    t,
    openCustomerPortal,
    isCustomerLoggedIn
  } = useStore();

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const handleCategoryClick = (slug: string) => {
    if (activeView !== 'store') {
      setActiveView('store');
    }
    if (onSelectCategory) {
      onSelectCategory(slug);
    }
    setIsCategoryDropdownOpen(false);
  };

  const renderStoreName = () => {
    const raw = lang === 'bn' ? (settings.storeNameBn || settings.storeName || 'BuyOneBD') : (settings.storeName || 'BuyOneBD');
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
      className="sticky top-0 z-40 backdrop-blur-md shadow-sm border-b border-slate-200/80 dark:border-slate-800 w-full max-w-full"
      style={{ backgroundColor: settings.themeColors?.headerBg || undefined }}
    >
      {/* Top Announcement Bar (100% Editable) */}
      {settings?.announcementBar?.enabled && (
        <div className="bg-slate-900 text-white text-[10px] sm:text-[11px] font-medium py-1.5 px-3 text-center overflow-hidden border-b border-slate-800">
          <div className="max-w-7xl mx-auto truncate">
            {lang === 'bn'
              ? settings.announcementBar.textBn || '🚚 সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা | হেল্পলাইন: 01886-289663'
              : settings.announcementBar.textEn || '🚚 Nationwide Fast Home Delivery with Cash on Delivery | Helpline: 01886-289663'}
          </div>
        </div>
      )}

      {/* Main Header Bar - Compact Mobile Safe, Clean Backend Logo, BN/EN Switcher, Cart, Customer Login Trigger */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenMobileCategories}
            className="p-1.5 sm:p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden cursor-pointer transition-colors shrink-0"
            aria-label={t('ক্যাটাগরি মেনু', 'Categories Menu')}
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Dynamic Backend Store Logo */}
          <div
            onClick={() => setActiveView('store')}
            className="flex items-center gap-2 cursor-pointer select-none group min-w-0 shrink-0"
          >
            {settings.logoUrl && (logoMode === 'image' || logoMode === 'both') && (
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="h-8 sm:h-10 max-w-[130px] object-contain rounded-lg"
              />
            )}
            {(logoMode === 'text' || logoMode === 'both' || !settings.logoUrl) && (
              <span className="text-xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight truncate">
                {renderStoreName()}
              </span>
            )}
          </div>

          {/* Desktop Mega Category & Subcategories Menu Dropdown */}
          <div
            className="hidden lg:block relative ml-3"
            onMouseEnter={() => setIsCategoryDropdownOpen(true)}
            onMouseLeave={() => setIsCategoryDropdownOpen(false)}
          >
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-black transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
            >
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('সকল ক্যাটাগরি ও সাব-ক্যাটাগরি', 'Categories & Subcategories')}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                  isCategoryDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2.5 z-50 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800 max-h-[75vh] overflow-y-auto">
                {categories.filter((c) => c.isActive).map((cat) => (
                  <div key={cat.id} className="py-2 first:pt-1 last:pb-1">
                    <button
                      onClick={() => handleCategoryClick(cat.slug)}
                      className="w-full flex items-center justify-between text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 group transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        {cat.iconImage ? (
                          <img src={cat.iconImage} alt={cat.nameEn} className="w-6 h-6 rounded-lg object-cover border border-slate-200" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                        <span className="font-black text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                          {lang === 'bn' ? cat.nameBn : cat.nameEn}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {cat.subcategories?.length || 0}
                      </span>
                    </button>

                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="pl-8 pr-2 pt-1 pb-1 flex flex-wrap gap-1.5">
                        {cat.subcategories.map((sub) => (
                          <button
                            key={sub.slug}
                            onClick={() => handleCategoryClick(cat.slug)}
                            className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                          >
                            • {lang === 'bn' ? sub.nameBn : sub.nameEn}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Compact BN/EN Toggle, Cart, Customer Login/Profile Icon */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Compact Language Toggle: strictly BN / EN */}
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-[11px] sm:text-xs font-black tracking-wide cursor-pointer transition-colors border border-slate-200/70 dark:border-slate-700"
            title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{lang === 'bn' ? 'EN' : 'BN'}</span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1 sm:gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
            aria-label={t('কার্ট', 'Cart')}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span className="bg-emerald-500 text-slate-950 font-black text-[10px] sm:text-[11px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-mono">
              {cartCount}
            </span>
          </button>

          {/* User Icon - Opens Customer Login Popup or Customer Profile if authenticated */}
          <button
            onClick={openCustomerPortal}
            className={`relative p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer shadow-sm active:scale-95 ${
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
