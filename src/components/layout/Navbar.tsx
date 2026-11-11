import React from 'react';
import { ShoppingBag, User, Menu, Globe, Wallet } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface NavbarProps {
  onOpenMobileCategories?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileCategories }) => {
  const {
    settings,
    cartCount,
    setIsCartOpen,
    activeView,
    setActiveView,
    lang,
    setLang,
    t,
    isAdminLoggedIn,
    setIsAdminLoginOpen,
    customerWalletBalance,
    addToast
  } = useStore();

  const handleUserClick = () => {
    if (isAdminLoggedIn) {
      setActiveView(activeView === 'admin' ? 'store' : 'admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleWalletClick = () => {
    addToast(
      'info',
      t('আপনার গিফট ওয়ালেট', 'Your Gift Wallet'),
      t(
        `বর্তমান ব্যালেন্স: ৳${customerWalletBalance}। লাকি স্পিন খেলে জিতে এই ব্যালেন্স দিয়ে কেনাকাটা করতে পারবেন।`,
        `Current Balance: ৳${customerWalletBalance}. Win more balance by spinning the lucky wheel!`
      )
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 dark:border-slate-800">
      {/* Top Announcement Bar - Clean & Professional */}
      {settings?.announcementBar?.enabled && (
        <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-4 text-center overflow-hidden border-b border-slate-800">
          <div className="flex items-center justify-center gap-2">
            <span>
              {lang === 'bn'
                ? '🚚 সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা | হেল্পলাইন: 01886-289663'
                : '🚚 Nationwide Fast Home Delivery with Cash on Delivery | Helpline: 01886-289663'}
            </span>
          </div>
        </div>
      )}

      {/* Main Header Bar - Clean: Professional Logo, Categories Toggle, Wallet, Cart, User */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Categories Drawer Hamburger + Clean Professional Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileCategories}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden cursor-pointer transition-colors"
            aria-label={t('ক্যাটাগরি মেনু', 'Categories Menu')}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Clean Professional Logo - No 1-click badge, no tagline */}
          <div
            onClick={() => setActiveView('store')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 dark:bg-emerald-500 text-white dark:text-slate-950 flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
              B
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                BuyOne<span className="text-emerald-600 dark:text-emerald-400">BD</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Customer Wallet Balance, Language Switcher, Cart, User Login */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Customer Gift Wallet Balance (Req 4) */}
          <button
            onClick={handleWalletClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
            title={t('গিফট ওয়ালেট ব্যালেন্স', 'Gift Wallet Balance')}
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>৳{customerWalletBalance}</span>
          </button>

          {/* Pure Language Toggle (Req 1) */}
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
            aria-label={t('কার্ট', 'Cart')}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span className="bg-emerald-500 text-slate-950 font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-mono">
              {cartCount}
            </span>
          </button>

          {/* User Icon (Req 4 & 9: Pops up Hossain Login) */}
          <button
            onClick={handleUserClick}
            className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
              isAdminLoggedIn
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={isAdminLoggedIn ? t('অ্যাডমিন ড্যাশবোর্ড', 'Admin Dashboard') : t('অ্যাডমিন পোর্টাল', 'Admin Portal')}
          >
            <User className="w-5 h-5" />
            {isAdminLoggedIn && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
