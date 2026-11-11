import React, { useState } from 'react';
import {
  Gift,
  X,
  Sparkles,
  Trophy,
  ArrowRight,
  Copy,
  Check,
  Zap,
  Wallet,
  Clock
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { audioEngine } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { SpinReward } from '../../types';

interface LuckySpinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCoupon?: (code: string) => void;
}

export const LuckySpinModal: React.FC<LuckySpinModalProps> = ({
  isOpen,
  onClose,
  onApplyCoupon
}) => {
  const {
    spinRewards,
    settings,
    openOneClickCheckout,
    lang,
    t,
    addToast,
    remainingSpinsToday,
    recordSpinUsed,
    addToWallet
  } = useStore();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedReward, setSelectedReward] = useState<SpinReward | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const rewards = spinRewards && spinRewards.length >= 2 ? spinRewards : [
    { id: '1', labelBn: '৳১৫০ উপহার ক্যাশ', labelEn: '৳150 Gift Cash', code: 'SPIN150', discountType: 'fixed' as const, value: 150, color: '#059669', isTryAgain: false },
    { id: '2', labelBn: 'ফ্রি হোম ডেলিভারি', labelEn: 'Free Delivery', code: 'FREESHIP', discountType: 'free_shipping' as const, value: 60, color: '#0284c7', isTryAgain: false },
    { id: '3', labelBn: '৳২৫০ উপহার ক্যাশ', labelEn: '৳250 Gift Cash', code: 'MEGA250', discountType: 'fixed' as const, value: 250, color: '#7c3aed', isTryAgain: false },
    { id: '4', labelBn: '১৫% বিশেষ ছাড়', labelEn: '15% Discount', code: 'SUPER15', discountType: 'percent' as const, value: 15, color: '#d97706', isTryAgain: false },
    { id: '5', labelBn: '৳১০০ উপহার ক্যাশ', labelEn: '৳100 Gift Cash', code: 'SPIN100', discountType: 'fixed' as const, value: 100, color: '#e11d48', isTryAgain: false },
    { id: '6', labelBn: '৳৫০০ মেগা ক্যাশ', labelEn: '৳500 Mega Cash', code: 'LUCKY500', discountType: 'fixed' as const, value: 500, color: '#4f46e5', isTryAgain: false }
  ];

  const numSegments = rewards.length;
  const segmentAngle = 360 / numSegments;

  const handleSpin = () => {
    if (isSpinning) return;

    if (remainingSpinsToday <= 0) {
      addToast(
        'warning',
        t('আজকের স্পিন সম্পন্ন হয়েছে!', 'Daily Spin Used!'),
        t('প্রতিদিন ১টি ফ্রি স্পিন পাওয়া যায়। আগামীকাল আবার ঘুরিয়ে উপহার জিতুন!', 'Only 1 free spin allowed per day. Return tomorrow!')
      );
      return;
    }

    setIsSpinning(true);
    setSelectedReward(null);

    // Pick a winning index
    const winningIndex = Math.floor(Math.random() * numSegments);
    const selected = rewards[winningIndex];

    const extraRounds = 5 + Math.floor(Math.random() * 3);
    const targetAngle = 360 - (winningIndex * segmentAngle + segmentAngle / 2);
    const finalRotation = rotation + extraRounds * 360 + targetAngle;

    setRotation(finalRotation);

    let tickCount = 0;
    const tickInterval = setInterval(() => {
      audioEngine.playDtmfTone('1');
      tickCount++;
      if (tickCount > 16) clearInterval(tickInterval);
    }, 200);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setSelectedReward(selected);

      // Record spin
      recordSpinUsed();

      // Win sound & confetti
      audioEngine.playSuccessChime();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Req 4: Automatically credit gift money to customer wallet balance!
      if (selected.value > 0) {
        addToWallet(selected.value, 'Lucky Spin Reward');
      }

      addToast(
        'success',
        t('অভিনন্দন! আপনি জিতেছেন!', 'Congratulations! You won!'),
        t(
          `পুরস্কার: ${lang === 'bn' ? selected.labelBn : selected.labelEn}! কুপন: ${selected.code}`,
          `Reward: ${selected.labelEn}! Coupon: ${selected.code}`
        )
      );
    }, 4200);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setHasCopied(true);
    addToast('success', t('কুপন কোড কপি হয়েছে!', 'Coupon Copied!'), code);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleApplyToCheckout = (code: string) => {
    copyCoupon(code);
    if (onApplyCoupon) {
      onApplyCoupon(code);
    }
    onClose();
    openOneClickCheckout(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl text-white overflow-hidden text-center max-h-[95vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-300 cursor-pointer transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1 mb-2">
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {t('লাকি উপহার স্পিন', 'LUCKY GIFT SPIN')}
          </span>
          <h3 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-300">
            {lang === 'bn' ? settings.spinSettings?.headlineBn : settings.spinSettings?.headlineEn}
          </h3>
          <p className="text-[11px] text-slate-400">
            {t('চাকা ঘুরিয়ে সরাসরি ওয়ালেটে গিফট ব্যালেন্স ও কুপন জিতুন!', 'Spin to win instant gift cash added directly to your wallet balance!')}
          </p>

          <div className="flex items-center justify-center gap-2 pt-1 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-bold">
              {t(`আজকের বাকি স্পিন: ${remainingSpinsToday}/১`, `Daily Spins Left: ${remainingSpinsToday}/1`)}
            </span>
          </div>
        </div>

        {/* Responsive Wheel Container */}
        <div className="relative my-3 flex items-center justify-center">
          <div className="absolute -top-3 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-md" />

          <div className="relative w-56 h-56 sm:w-68 sm:h-68 rounded-full p-2 bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 shadow-2xl ring-4 ring-emerald-400/30">
            <div
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4.2s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none'
              }}
              className="w-full h-full rounded-full overflow-hidden relative shadow-inner"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {rewards.map((rew, i) => {
                  const startAngle = (i * 360) / numSegments;
                  const endAngle = ((i + 1) * 360) / numSegments;

                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                  return (
                    <path
                      key={rew.id || i}
                      d={pathData}
                      fill={rew.color}
                      stroke="#0f172a"
                      strokeWidth="0.8"
                    />
                  );
                })}
              </svg>

              {/* Segment Labels Overlay */}
              {rewards.map((rew, i) => {
                const angle = i * segmentAngle + segmentAngle / 2;
                return (
                  <div
                    key={rew.id || i}
                    style={{
                      transform: `rotate(${angle}deg)`,
                      transformOrigin: '50% 50%'
                    }}
                    className="absolute inset-0 flex items-start justify-center pt-2.5 pointer-events-none"
                  >
                    <span className="text-[9px] sm:text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] tracking-tight rotate-90 select-none max-w-[65px] truncate">
                      {lang === 'bn' ? rew.labelBn : rew.labelEn}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Center Spin Action Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning || remainingSpinsToday <= 0}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-amber-400 via-emerald-600 to-teal-700 border-4 border-white shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95 z-10 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              <Zap className="w-4 h-4 text-amber-200 fill-amber-200 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white">
                {isSpinning ? '...' : 'SPIN'}
              </span>
            </button>
          </div>
        </div>

        {/* Won Prize Celebration Card with Wallet Credit notice */}
        {selectedReward && (
          <div className="mt-3 p-3 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-400/50 rounded-2xl animate-fade-in space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-bold text-xs">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{t('অভিনন্দন! আপনি জিতেছেন:', 'Congratulations! You won:')}</span>
            </div>
            <p className="text-sm sm:text-base font-black text-white">
              {lang === 'bn' ? selectedReward.labelBn : selectedReward.labelEn}
            </p>

            {/* Wallet Credit Badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Wallet className="w-3.5 h-3.5" />
              <span>{t(`৳${selectedReward.value} আপনার গিফট ওয়ালেটে যোগ হয়েছে!`, `৳${selectedReward.value} added to your Gift Wallet!`)}</span>
            </div>

            {/* Promo Code Box */}
            <div className="flex items-center justify-between bg-black/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <span className="font-mono font-black text-xs text-emerald-300 tracking-wider">
                {selectedReward.code}
              </span>
              <button
                onClick={() => copyCoupon(selectedReward.code)}
                className="flex items-center gap-1 text-[11px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
              >
                {hasCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopied ? t('কপি হয়েছে!', 'Copied!') : t('কপি', 'Copy')}</span>
              </button>
            </div>

            <button
              onClick={() => handleApplyToCheckout(selectedReward.code)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <span>{t('চেকআউটে অফারটি প্রয়োগ করুন', 'Apply to Checkout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Spin Instruction / Action button */}
        {!selectedReward && (
          <div className="mt-2">
            <button
              onClick={handleSpin}
              disabled={isSpinning || remainingSpinsToday <= 0}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Gift className="w-4 h-4" />
              <span>
                {isSpinning
                  ? t('ঘুরছে...', 'Spinning...')
                  : remainingSpinsToday <= 0
                  ? t('আজকের স্পিন সম্পন্ন (আগামীকাল আবার)', 'Daily Spin Completed')
                  : t('স্পিন করুন ও ক্যাশ উপহার জিতুন!', 'Spin Now to Win Cash Gift!')}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const LuckySpinLeftLauncher: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const { remainingSpinsToday, settings, t } = useStore();

  if (settings.spinSettings?.enabled === false) return null;

  return (
    <div className="fixed left-3 sm:left-4 bottom-20 z-30 flex items-center">
      <button
        onClick={onOpen}
        className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-xl shadow-emerald-600/30 border border-white/20 backdrop-blur-md active:scale-95 transition-all animate-bounce"
        aria-label="Lucky Spin Wheel"
      >
        <div className="relative">
          <Gift className="w-5 h-5 text-amber-300" />
          {remainingSpinsToday > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
              {remainingSpinsToday}
            </span>
          )}
        </div>
        <div className="text-left hidden sm:block">
          <span className="block text-[11px] font-black leading-tight">
            {t('লাকি স্পিন', 'Lucky Spin')}
          </span>
          <span className="block text-[9px] text-emerald-200">
            {t('উপহার ক্যাশ', 'Gift Cash')}
          </span>
        </div>
      </button>
    </div>
  );
};
