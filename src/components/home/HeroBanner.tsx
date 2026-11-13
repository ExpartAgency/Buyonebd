import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Truck,
  Flame,
  ArrowRight,
  PhoneCall,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface HeroBannerProps {
  onCategoryFilter?: (slug: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onCategoryFilter }) => {
  const { settings, openOneClickCheckout, products, t } = useStore();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Active sliders from store settings
  const slides = settings?.sliders?.filter((s) => s.isActive) || [];

  // Auto carousel effect
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Flash sale countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const activeSlide = slides[currentSlideIndex] || slides[0];
  const featuredProduct = products[0];

  const handleNext = () => {
    if (slides.length > 0) {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }
  };

  const handlePrev = () => {
    if (slides.length > 0) {
      setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Dynamic 5-6 Slider Showcase */}
      <div
        className="relative rounded-3xl overflow-hidden text-white border border-slate-800 shadow-2xl min-h-[360px] sm:min-h-[420px] flex items-center"
        style={{
          background: `linear-gradient(135deg, ${settings.themeColors?.heroFrom || '#020617'}, ${settings.themeColors?.heroTo || '#064e3b'})`
        }}
      >
        {/* Slide Background Image overlay if available */}
        {activeSlide?.image && (
          <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
            <img
              src={activeSlide.image}
              alt=""
              className="w-full h-full object-cover object-center filter blur-[1px]"
            />
          </div>
        )}

        {/* Ambient glow backgrounds */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

        {/* Slide Content */}
        <div className="relative w-full p-5 sm:p-10 lg:p-14 flex flex-col justify-center items-start z-10 max-w-4xl">
          <div className="space-y-3 sm:space-y-4 text-left w-full">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                {activeSlide
                  ? t(activeSlide.discountBadgeBn || 'স্পেশাল অফার', activeSlide.discountBadgeEn || 'Special Offer')
                  : t('সেরা কোয়ালিটি ও দ্রুত ডেলিভারি', 'Premium Quality & Fast Delivery')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {activeSlide ? (
                t(activeSlide.titleBn, activeSlide.titleEn)
              ) : (
                <>
                  {t('পছন্দের পণ্যটি বেছে নিন,', 'Choose Your Favorite Item,')}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
                    {t('সহজে অর্ডার করুন!', 'Order Effortlessly!')}
                  </span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {activeSlide
                ? t(activeSlide.subtitleBn, activeSlide.subtitleEn)
                : t(
                    'রেজিস্ট্রেশন ছাড়াই দ্রুততম সময়ে ক্যাশ অন ডেলিভারি অর্ডার। অর্ডার সম্পন্ন হওয়া মাত্র স্মার্ট এআই প্রতিনিধি ফোন কলে নিশ্চিত করবে।',
                    'No registration needed. Fast Cash on Delivery with automated AI voice call verification & real-time courier tracking.'
                  )}
            </p>

            {/* Flash Sale Strip */}
            {settings?.flashSale?.enabled && (
              <div className="bg-black/50 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 inline-flex flex-wrap items-center gap-2 sm:gap-3 max-w-full">
                <span className="text-[11px] sm:text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Flame className="w-4 h-4 text-rose-500 animate-bounce shrink-0" />
                  <span className="line-clamp-1">{t(settings.flashSale.headlineBn || 'ফ্ল্যাশ সেল বাকি:', 'Flash Sale Ends In:')}</span>
                </span>
                <div className="flex items-center gap-1 font-mono text-xs sm:text-sm font-bold text-white">
                  <span className="bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                    {timeLeft.hours.toString().padStart(2, '0')}h
                  </span>
                  <span>:</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                    {timeLeft.minutes.toString().padStart(2, '0')}m
                  </span>
                  <span>:</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700 text-rose-400">
                    {timeLeft.seconds.toString().padStart(2, '0')}s
                  </span>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
              <button
                onClick={() => {
                  if (activeSlide?.linkCategory && onCategoryFilter) {
                    onCategoryFilter(activeSlide.linkCategory);
                  } else if (featuredProduct) {
                    openOneClickCheckout(featuredProduct);
                  }
                }}
                style={{ backgroundColor: settings.themeColors?.primary || '#059669' }}
                className="hover:opacity-95 text-white font-black text-xs sm:text-sm px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl shadow-xl flex items-center gap-2 group transition-all cursor-pointer active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  {activeSlide
                    ? t(activeSlide.buttonTextBn, activeSlide.buttonTextEn)
                    : t('এখনই কিনুন', 'Buy Now')}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/10 px-3.5 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                <PhoneCall className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>{t('অর্ডার করলেই সরাসরি এআই কল!', 'Instant AI Voice Call Confirmation')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows & Indicators (for 5-6 slides) */}
        {slides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-sm transition-all"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-sm transition-all"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlideIndex
                      ? 'w-7 bg-emerald-400'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 4 Trust Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('এক্সপ্রেস সহজ চেকআউট', 'Express Fast Checkout')}</h4>
            <p className="text-[11px] text-slate-500">{t('১০ সেকেন্ডে অর্ডার নিশ্চিত', 'Fast 10s checkout')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('এআই অটো-কল সাপোর্ট', 'AI Voice Call Agent')}</h4>
            <p className="text-[11px] text-slate-500">{t('অটোমেটেড ভয়েস ভেরিফিকেশন', 'Live order verification')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('ক্যাশ অন ডেলিভারি', 'Cash on Delivery')}</h4>
            <p className="text-[11px] text-slate-500">{t('পণ্য দেখে টাকা পরিশোধ', 'Pay after unboxing')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('সারাদেশে হোম ডেলিভারি', 'Nationwide Delivery')}</h4>
            <p className="text-[11px] text-slate-500">{t('Steadfast ও Pathao কুরিয়ার', 'All 64 districts coverage')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
