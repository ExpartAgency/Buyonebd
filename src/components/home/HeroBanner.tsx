import React, { useState, useEffect } from 'react';
import {
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

  const slides = settings?.sliders?.filter((s) => s.isActive) || [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

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
    <div className="space-y-5 w-full max-w-full overflow-hidden">
      {/* Clean Editorial Split Slider Showcase */}
      <div
        className="relative rounded-3xl overflow-hidden text-white border border-slate-800/80 shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${settings.themeColors?.heroFrom || '#020617'}, ${settings.themeColors?.heroTo || '#064e3b'})`
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[340px] sm:min-h-[400px]">
          {/* Left Content Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-center items-start z-10 space-y-4">
            <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-emerald-300">
              {activeSlide
                ? t(activeSlide.discountBadgeBn || 'স্পেশাল অফার', activeSlide.discountBadgeEn || 'Special Offer')
                : t('সেরা কোয়ালিটি ও দ্রুত ডেলিভারি', 'Premium Quality · Fast Delivery')}
            </span>

            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-balance max-w-2xl">
              {activeSlide
                ? t(activeSlide.titleBn, activeSlide.titleEn)
                : t('পছন্দের পণ্যটি বেছে নিন, সহজে অর্ডার করুন', 'Curated Essentials Delivered Across Bangladesh')}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              {activeSlide
                ? t(activeSlide.subtitleBn, activeSlide.subtitleEn)
                : t(
                    'দ্রুততম সময়ে ক্যাশ অন ডেলিভারি ও স্মার্ট এআই কল ভেরিফিকেশনে নিশ্চিন্ত শপিং।',
                    'Effortless Cash on Delivery across 64 districts with automated verification and live parcel tracking.'
                  )}
            </p>

            {/* Flash Countdown Strip */}
            {settings?.flashSale?.enabled && (
              <div className="bg-black/35 border border-white/10 rounded-xl px-3 py-2 inline-flex flex-wrap items-center gap-2.5 text-xs tabular-nums">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{t(settings.flashSale.headlineBn || 'ফ্ল্যাশ সেল বাকি:', 'Flash Sale Ends:')}</span>
                </span>
                <div className="flex items-center gap-1 font-mono font-bold text-white">
                  <span className="bg-white/10 px-2 py-0.5 rounded">{timeLeft.hours.toString().padStart(2, '0')}h</span>
                  <span>:</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded">{timeLeft.minutes.toString().padStart(2, '0')}m</span>
                  <span>:</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-emerald-300">{timeLeft.seconds.toString().padStart(2, '0')}s</span>
                </div>
              </div>
            )}

            {/* Primary Action */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (activeSlide?.linkCategory && onCategoryFilter) {
                    onCategoryFilter(activeSlide.linkCategory);
                  } else if (featuredProduct) {
                    openOneClickCheckout(featuredProduct);
                  }
                }}
                style={{ backgroundColor: settings.themeColors?.primary || '#059669' }}
                className="hover:opacity-95 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 group transition-all cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
              >
                <span>
                  {activeSlide
                    ? t(activeSlide.buttonTextBn, activeSlide.buttonTextEn)
                    : t('এখনই কিনুন', 'Shop Collection')}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            </div>
          </div>

          {/* Right Slide Media Showcase */}
          <div className="lg:col-span-5 relative min-h-[200px] lg:min-h-full overflow-hidden">
            {activeSlide?.image ? (
              <img
                src={activeSlide.image}
                alt={langTitle(activeSlide.titleEn, activeSlide.titleBn)}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 to-slate-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Carousel Navigation Arrows & Indicators */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentSlideIndex ? 'w-7 bg-emerald-400' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 4-Column Store Assurance Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{t('এক্সপ্রেস চেকআউট', 'Express Checkout')}</h4>
            <p className="text-[11px] text-slate-500 truncate">{t('১০ সেকেন্ডে অর্ডার', 'Fast 10s order')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{t('কল কনফার্মেশন', 'Voice Confirmation')}</h4>
            <p className="text-[11px] text-slate-500 truncate">{t('লাইভ অর্ডার যাচাই', 'Live verification')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{t('ক্যাশ অন ডেলিভারি', 'Cash on Delivery')}</h4>
            <p className="text-[11px] text-slate-500 truncate">{t('পণ্য দেখে পেমেন্ট', 'Pay on parcel receipt')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{t('সারাদেশে ডেলিভারি', 'Nationwide Courier')}</h4>
            <p className="text-[11px] text-slate-500 truncate">{t('৬৪ জেলা কভারেজ', 'All 64 districts')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function langTitle(en?: string, bn?: string) {
  return en || bn || 'Featured Offer';
}
