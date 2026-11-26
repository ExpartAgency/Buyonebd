import React from 'react';
import { Gift } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const LuckySpinLeftLauncher: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const { remainingSpinsToday, t } = useStore();

  return (
    <div className="fixed left-3 sm:left-5 bottom-20 md:bottom-6 z-30">
      <button
        onClick={onOpen}
        className="relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2.5 rounded-2xl shadow-lg border border-emerald-400/40 cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95 group"
        aria-label={t('লাকি স্পিন হুইল', 'Lucky Spin Wheel')}
      >
        <div className="relative">
          <Gift className="w-5 h-5 text-amber-300 transition-transform duration-300 group-hover:rotate-12" />
          {remainingSpinsToday > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-300 rounded-full" />
          )}
        </div>
        <div className="text-left hidden sm:block">
          <span className="text-[10px] uppercase font-bold text-emerald-100 block leading-tight">
            {t('লাকি উপহার', 'Lucky Gift')}
          </span>
          <span className="text-xs font-black text-white block leading-tight">
            {t('স্পিন হুইল', 'Spin Wheel')}
          </span>
        </div>
      </button>
    </div>
  );
};
