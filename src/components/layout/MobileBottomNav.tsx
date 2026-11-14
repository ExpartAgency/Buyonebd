import React from 'react';
import { Home, Grid, Truck, ShoppingBag, User } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface MobileBottomNavProps {
  onOpenCategories: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenCategories }) => {
  const {
    activeView,
    setActiveView,
    goHome,
    navigateToPath,
    recordPageVisit,
    cartCount,
    setIsCartOpen,
    openCustomerPortal,
    isCustomerLoggedIn,
    t
  } = useStore();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-1.5 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around text-[10px] font-bold">
        <button
          onClick={goHome}
          style={activeView === 'store' ? { color: 'var(--brand-primary, #059669)' } : undefined}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
            activeView === 'store' ? 'font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>{t('হোম', 'Home')}</span>
        </button>

        <button
          onClick={onOpenCategories}
          className="flex flex-col items-center py-1 px-2.5 text-slate-500 rounded-xl transition-colors cursor-pointer"
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span>{t('ক্যাটাগরি', 'Categories')}</span>
        </button>

        <button
          onClick={() => {
            setActiveView('tracking');
            navigateToPath('/tracking');
            recordPageVisit('/tracking', t('পার্সেল ট্র্যাকিং', 'Order Tracking'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={activeView === 'tracking' ? { color: 'var(--brand-primary, #059669)' } : undefined}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer ${
            activeView === 'tracking' ? 'font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-5 h-5 mb-0.5" />
          <span>{t('ট্র্যাকিং', 'Track')}</span>
        </button>

        <button
          onClick={openCustomerPortal}
          className="relative flex flex-col items-center py-1 px-2.5 text-slate-500 rounded-xl transition-colors cursor-pointer"
        >
          <div className="relative">
            <User className="w-5 h-5 mb-0.5" style={{ color: 'var(--brand-primary, #059669)' }} />
            {isCustomerLoggedIn && (
              <span
                className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--brand-primary, #10b981)' }}
              />
            )}
          </div>
          <span>{t('প্রোফাইল', 'Profile')}</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center py-1 px-2.5 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--brand-primary, #059669)',
                  color: 'var(--brand-on-primary, #ffffff)'
                }}
                className="absolute -top-1.5 -right-2 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono"
              >
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
