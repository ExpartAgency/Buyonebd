import React from 'react';
import { Home, Grid, Truck, ShoppingBag, Wallet } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface MobileBottomNavProps {
  onOpenCategories: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenCategories }) => {
  const {
    activeView,
    setActiveView,
    cartCount,
    setIsCartOpen,
    customerWalletBalance,
    addToast,
    t
  } = useStore();

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around text-[10px] font-bold">
        {/* 1. Home */}
        <button
          onClick={() => setActiveView('store')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeView === 'store' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>{t('হোম', 'Home')}</span>
        </button>

        {/* 2. All Categories */}
        <button
          onClick={onOpenCategories}
          className="flex flex-col items-center py-1 px-3 text-slate-500 hover:text-emerald-600 rounded-xl transition-colors cursor-pointer"
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span>{t('ক্যাটাগরি', 'Categories')}</span>
        </button>

        {/* 3. Track Order */}
        <button
          onClick={() => setActiveView('tracking')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeView === 'tracking' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-5 h-5 mb-0.5" />
          <span>{t('ট্র্যাকিং', 'Track')}</span>
        </button>

        {/* 4. Customer Gift Wallet */}
        <button
          onClick={handleWalletClick}
          className="flex flex-col items-center py-1 px-3 text-slate-500 hover:text-emerald-600 rounded-xl transition-colors cursor-pointer"
        >
          <Wallet className="w-5 h-5 mb-0.5 text-emerald-600 dark:text-emerald-400" />
          <span>৳{customerWalletBalance}</span>
        </button>

        {/* 5. Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center py-1 px-3 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono">
                {cartCount}
              </span>
            )}
          </div>
          <span>{t('কার্ট', 'Cart')}</span>
        </button>
      </div>
    </nav>
  );
};
