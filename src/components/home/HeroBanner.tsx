import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Flame,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface HeroBannerProps {
  onCategoryFilter?: (slug: string) => void;
}

const SLIDE_DURATION_MS = 5500;

export const HeroBanner: React.FC<HeroBannerProps> = ({ onCategoryFilter }) => {
  const { settings, openOneClickCheckout, products, getPartnerPriceInfo, t } = useStore();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const slides = settings?.sliders?.filter((s) => s.isActive) || [];

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  useEffect(() => {
    if (currentSlideIndex >= slides.length && slides.length > 0) {
      setCurrentSlideIndex(0);
    }
  }, [slides.length, currentSlideIndex]);

  const computeFlashTimeLeft = (endsAtIso?: string) => {
    const targetMs = endsAtIso ? new Date(endsAtIso).getTime() : NaN;
    const diffMs = Number.isFinite(targetMs) ? Math.max(0, targetMs - Date.now()) : 6 * 3600 * 1000;
    const totalSeconds = Math.floor(diffMs / 1000);
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60
    };
  };

  const [timeLeft, setTimeLeft] = useState(() => computeFlashTimeLeft(settings?.flashSale?.endsAt));

  useEffect(() => {
    setTimeLeft(computeFlashTimeLeft(settings?.flashSale?.endsAt));
    const interval = setInterval(() => {
      setTimeLeft(computeFlashTimeLeft(settings?.flashSale?.endsAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [settings?.flashSale?.endsAt]);

  const activeSlide = slides[currentSlideIndex] || slides[0];
  const featuredProduct =
    (activeSlide?.linkCategory
      ? products.find((p) => p.category === activeSlide.linkCategory)
      : undefined) || products[0];
  const featuredUnitPrice = featuredProduct ? getPartnerPriceInfo(featuredProduct, 1).unitPrice : 0;

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || slides.length <= 1) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const delta = touchStartXRef.current - endX;
    if (Math.abs(delta) > 40) {
      if (delta > 0) handleNext();
      else handlePrev();
    }
    touchStartXRef.current = null;
  };

  const primaryHex = settings.themeColors?.primary || '#059669';

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full overflow-hidden">
      {/* Kinetic Editorial Split Showcase Slider */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative rounded-3xl overflow-hidden text-white border border-slate-800/80 shadow-2xl group"
        style={{
          background: `radial-gradient(circle at 82% 20%, ${primaryHex}33 0%, transparent 55%), linear-gradient(135deg, ${settings.themeColors?.heroFrom || '#020617'} 0%, ${settings.themeColors?.heroTo || '#064e3b'} 100%)`
        }}
      >
        {/* Top Progress Hairline */}
        {slides.length > 1 && (
          <div className="absolute top-0 inset-x-0 h-1 bg-white/10 z-30">
            <div
              key={`${currentSlideIndex}-${isPaused ? 'paused' : 'play'}`}
              className="h-full transition-all duration-500"
              style={{
                backgroundColor: primaryHex,
                width: `${((currentSlideIndex + 1) / slides.length) * 100}%`
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[360px] sm:min-h-[430px]">
          {/* Left Editorial Stage */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between z-10 space-y-5">
            <div className="space-y-3.5">
              {/* Slide Index + Campaign Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] font-bold text-emerald-300 tabular-nums">
                  {String(currentSlideIndex + 1).padStart(2, '0')} / {String(Math.max(1, slides.length)).padStart(2, '0')}
                </span>
                <span className="h-px w-6 bg-emerald-400/50" />
                <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  {activeSlide
                    ? t(activeSlide.discountBadgeBn || 'স্পেশাল অফার', activeSlide.discountBadgeEn || 'Featured Drop')
                    : t('সেরা কোয়ালিটি ও দ্রুত ডেলিভারি', 'Curated Collection · Fast COD')}
                </span>
              </div>

              <h1
                key={`title-${activeSlide?.id || currentSlideIndex}`}
                className="font-display text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight leading-[1.12] text-balance max-w-2xl animate-fade-in"
              >
                {activeSlide
                  ? t(activeSlide.titleBn, activeSlide.titleEn)
                  : t('পছন্দের পণ্যটি বেছে নিন, সহজে অর্ডার করুন', 'Curated Essentials Delivered Across Bangladesh')}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300/95 leading-relaxed max-w-xl">
                {activeSlide
                  ? t(activeSlide.subtitleBn, activeSlide.subtitleEn)
                  : t(
                      'দ্রুততম সময়ে ক্যাশ অন ডেলিভারি ও স্মার্ট এআই কল ভেরিফিকেশনে নিশ্চিন্ত শপিং।',
                      'Effortless Cash on Delivery across 64 districts with automated verification and live parcel tracking.'
                    )}
              </p>

              {/* Flash Countdown Strip */}
              {settings?.flashSale?.enabled && (
                <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl px-3.5 py-2 inline-flex flex-wrap items-center gap-2.5 text-xs tabular-nums">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{t(settings.flashSale.headlineBn || 'ফ্ল্যাশ সেল:', 'Flash Sale Ends:')}</span>
                  </span>
                  <div className="flex items-center gap-1 font-mono font-bold text-white">
                    {timeLeft.days > 0 && (
                      <>
                        <span className="bg-white/10 px-2 py-0.5 rounded">{timeLeft.days}d</span>
                        <span>:</span>
                      </>
                    )}
                    <span className="bg-white/10 px-2 py-0.5 rounded">{timeLeft.hours.toString().padStart(2, '0')}h</span>
                    <span>:</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded">{timeLeft.minutes.toString().padStart(2, '0')}m</span>
                    <span>:</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded text-emerald-300">{timeLeft.seconds.toString().padStart(2, '0')}s</span>
                  </div>
                </div>
              )}

              {/* Primary CTA & Quick Buy */}
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
                  style={{ backgroundColor: primaryHex }}
                  className="hover:opacity-95 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 group/btn transition-all cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                >
                  <span>
                    {activeSlide
                      ? t(activeSlide.buttonTextBn, activeSlide.buttonTextEn)
                      : t('এখনই কিনুন', 'Shop Collection')}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform shrink-0" />
                </button>

                {featuredProduct && (
                  <button
                    type="button"
                    onClick={() => openOneClickCheckout(featuredProduct)}
                    className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="tabular-nums">
                      {t('১-ক্লিক অর্ডার', '1-Click Order')} · ৳{featuredUnitPrice.toLocaleString()}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Thumbnail Selector Strip */}
            {slides.length > 1 && (
              <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {slides.map((sl, idx) => {
                  const isActive = idx === currentSlideIndex;
                  return (
                    <button
                      key={sl.id || idx}
                      type="button"
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`group/thumb flex items-center gap-2 p-1.5 pr-3 rounded-xl border text-left transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-white/15 border-emerald-400/80 shadow-md'
                          : 'bg-black/25 border-white/10 hover:bg-white/10 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={sl.image}
                        alt={sl.titleEn || sl.titleBn}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/10"
                      />
                      <div className="max-w-[110px] min-w-0">
                        <span className="block text-[10px] font-bold text-white truncate">
                          {t(sl.titleBn, sl.titleEn)}
                        </span>
                        <span className="block text-[9px] text-emerald-300/90 truncate">
                          {t(sl.discountBadgeBn || 'অফার', sl.discountBadgeEn || 'Offer')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Slide Framed Architectural Visual — Clickable Category Redirect */}
          <div className="lg:col-span-5 relative min-h-[220px] sm:min-h-[280px] lg:min-h-full overflow-hidden flex items-center justify-center p-4 sm:p-6">
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                if (onCategoryFilter) {
                  onCategoryFilter(activeSlide?.linkCategory || 'all');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onCategoryFilter?.(activeSlide?.linkCategory || 'all');
                }
              }}
              title={t('এই ক্যাটাগরির সকল পণ্য দেখুন', 'Browse this category')}
              className="relative w-full h-full min-h-[210px] lg:min-h-[340px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl cursor-pointer"
            >
              {activeSlide?.image ? (
                <img
                  key={`img-${activeSlide.id || currentSlideIndex}`}
                  src={activeSlide.image}
                  alt={langTitle(activeSlide.titleEn, activeSlide.titleBn)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 to-slate-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent pointer-events-none" />

              {featuredProduct && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openOneClickCheckout(featuredProduct);
                  }}
                  className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/15 flex items-center justify-between gap-2 hover:bg-slate-900 transition-colors text-left cursor-pointer"
                >
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      {t('টপ সিলেকশন', 'Featured Pick')}
                    </span>
                    <span className="block text-xs font-bold text-white truncate">
                      {t(featuredProduct.titleBn, featuredProduct.title)}
                    </span>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <span className="block text-sm font-black text-emerald-300 font-mono">
                      ৳{featuredUnitPrice.toLocaleString()}
                    </span>
                    {featuredProduct.originalPrice > featuredUnitPrice && (
                      <span className="block text-[10px] line-through text-slate-400 font-mono">
                        ৳{featuredProduct.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Floating Carousel Controls + Pagination Dots */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 border border-white/15 text-white items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 border border-white/15 text-white items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-0.5">
          {slides.map((sl, idx) => (
            <button
              key={`dot-${sl.id || idx}`}
              type="button"
              onClick={() => setCurrentSlideIndex(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlideIndex
                  ? 'w-7 bg-emerald-600'
                  : 'w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function langTitle(en?: string, bn?: string) {
  return en || bn || 'Featured Offer';
}
