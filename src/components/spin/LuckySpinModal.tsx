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
    addToWallet,
    saveSpinCoupon
  } = useStore();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedReward, setSelectedReward] = useState<SpinReward | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // 8 Clean Temu-Style Rewards - All Winning Coupons, Crisp Non-Truncated Labels
  const defaultRewards: SpinReward[] = [
    { id: '1', labelBn: '৳৫০০ ক্যাশ', labelEn: '৳500 Cash', code: 'TEMU500', discountType: 'fixed', value: 500, color: '#e11d48' },
    { id: '2', labelBn: 'ফ্রি ডেলিভারি', labelEn: 'Free Delivery', code: 'FREESHIP', discountType: 'free_shipping', value: 60, color: '#0284c7' },
    { id: '3', labelBn: '৳২৫০ মেগা', labelEn: '৳250 Mega', code: 'MEGA250', discountType: 'fixed', value: 250, color: '#7c3aed' },
    { id: '4', labelBn: '৫০% বিশেষ ছাড়', labelEn: '50% Mega Off', code: 'HALF50', discountType: 'percent', value: 50, color: '#059669' },
    { id: '5', labelBn: '৳১৫০ ক্যাশ', labelEn: '৳150 Cash', code: 'CASH150', discountType: 'fixed', value: 150, color: '#d97706' },
    { id: '6', labelBn: '৳১০০ গিফট', labelEn: '৳100 Gift', code: 'GIFT100', discountType: 'fixed', value: 100, color: '#4f46e5' },
    { id: '7', labelBn: '২০% ছাড়', labelEn: '20% Off', code: 'DEAL20', discountType: 'percent', value: 20, color: '#0d9488' },
    { id: '8', labelBn: '৳৩০০ বোনাস', labelEn: '৳300 Bonus', code: 'BONUS300', discountType: 'fixed', value: 300, color: '#c026d3' }
  ];

  const rewards = spinRewards && spinRewards.length >= 2 ? spinRewards : defaultRewards;
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

      // Automatically credit gift money & save coupon to customer profile
      if (!selected.isTryAgain) {
        saveSpinCoupon(selected);
      }
      if (selected.value > 0 && !selected.isTryAgain) {
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
              {t(`আজকের বাকি স্পিন: ${remainingSpinsToday}/${settings?.spinSettings?.spinsPerDay || 1}`, `Daily Spins Left: ${remainingSpinsToday}/${settings?.spinSettings?.spinsPerDay || 1}`)}
            </span>
          </div>
        </div>

        {/* Responsive Wheel Container - Clean SVG, No Truncation (Req 12, 14 & Screenshot 3) */}
        <div className="relative my-3 flex items-center justify-center">
          {/* Top Indicator Pointer pointing to top slice */}
          <div className="absolute -top-3 z-30 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-amber-400 drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]" />

          <div className="relative w-[min(78vw,296px)] h-[min(78vw,296px)] sm:w-80 sm:h-80 rounded-full p-2.5 bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 shadow-2xl ring-4 ring-emerald-400/30">
            <div
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4.2s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none'
              }}
              className="w-full h-full rounded-full overflow-hidden relative shadow-inner"
            >
              <svg viewBox="0 0 240 240" className="w-full h-full">
                <defs>
                  <filter id="svgTextGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.4" floodColor="#000" floodOpacity="0.95" />
                  </filter>
                </defs>

                {rewards.map((rew, i) => {
                  const startAngle = i * segmentAngle;
                  const endAngle = (i + 1) * segmentAngle;
                  const midAngle = startAngle + segmentAngle / 2;

                  const rad1 = ((startAngle - 90) * Math.PI) / 180;
                  const rad2 = ((endAngle - 90) * Math.PI) / 180;

                  const x1 = 120 + 120 * Math.cos(rad1);
                  const y1 = 120 + 120 * Math.sin(rad1);
                  const x2 = 120 + 120 * Math.cos(rad2);
                  const y2 = 120 + 120 * Math.sin(rad2);

                  const pathData = `M 120 120 L ${x1} ${y1} A 120 120 0 0 1 ${x2} ${y2} Z`;
                  const labelText = lang === 'bn' ? rew.labelBn : rew.labelEn;
                  const fSize = labelText.length > 13 ? 7.8 : labelText.length > 10 ? 8.6 : 9.6;

                  return (
                    <g key={rew.id || i}>
                      <path
                        d={pathData}
                        fill={rew.color}
                        stroke="#0f172a"
                        strokeWidth="1.4"
                      />
                      <g transform={`rotate(${midAngle - 90}, 120, 120)`}>
                        <text
                          x="224"
                          y="123"
                          fill="#ffffff"
                          fontSize={fSize}
                          fontWeight="800"
                          textAnchor="end"
                          filter="url(#svgTextGlow)"
                          style={{
                            fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', system-ui, sans-serif",
                            letterSpacing: '-0.15px'
                          }}
                        >
                          {labelText}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Center Spin Action Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning || remainingSpinsToday <= 0}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-amber-400 via-emerald-600 to-teal-700 border-4 border-white shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95 z-20 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              <Zap className="w-4 h-4 text-amber-200 fill-amber-200 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white">
                {isSpinning ? '...' : 'SPIN'}
              </span>
            </button>
          </div>
        </div>

        {/* Action Button Below Wheel */}
        <div className="mt-3">
          <button
            onClick={handleSpin}
            disabled={isSpinning || remainingSpinsToday <= 0}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Gift className="w-4 h-4 text-amber-300" />
            <span>
              {isSpinning
                ? t('চাকা ঘুরছে...', 'Spinning...')
                : remainingSpinsToday > 0
                ? t('স্পিন করুন ও ক্যাশ উপহার জিতুন!', 'Spin Now & Win Cash Gift!')
                : t('আজকের স্পিন কোটা শেষ (আগামীকাল আবার আসুন)', 'Daily limit reached (Return tomorrow)')}
            </span>
          </button>
        </div>

        {/* Won Prize Popup Card */}
        {selectedReward && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-400/40 shadow-2xl animate-fade-in text-left">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  {t('অভিনন্দন!', 'Congratulations!')}
                </span>
                <h4 className="text-base font-black text-white mt-0.5">
                  {lang === 'bn' ? selectedReward.labelBn : selectedReward.labelEn}
                </h4>
                <p className="text-[11px] text-emerald-300 font-medium">
                  {t(
                    '৳' + selectedReward.value + ' উপহার ক্যাশ সরাসরি আপনার গিফট ওয়ালেটে যোগ হয়েছে!',
                    '৳' + selectedReward.value + ' gift cash added directly to your gift wallet!'
                  )}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">
                  {t('কুপন কোড', 'Coupon Code')}
                </span>
                <span className="font-mono font-black text-sm text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-amber-500/30">
                  {selectedReward.code}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => copyCoupon(selectedReward.code)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              >
                {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopied ? t('কপি হয়েছে', 'Copied') : t('কুপন কপি করুন', 'Copy Coupon')}</span>
              </button>

              <button
                onClick={() => handleApplyToCheckout(selectedReward.code)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <span>{t('এখনই ব্যবহার করুন', 'Use Now')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
