import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface HeroBannerProps {
  onCategoryFilter?: (slug: string) => void;
}

const SLIDE_DURATION_MS = 5500;

export const HeroBanner: React.FC<HeroBannerProps> = ({ onCategoryFilter }) => {
  const { settings, navigateToPath, t } = useStore();
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

  const activeSlide = slides[currentSlideIndex] || slides[0];

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

  const handleSlideClick = () => {
    if (!activeSlide) return;
    const customUrl = activeSlide.linkUrl?.trim();
    if (customUrl) {
      if (customUrl.startsWith('/')) {
        navigateToPath(customUrl);
        return;
      }
      if (/^https?:\/\//i.test(customUrl)) {
        window.location.assign(customUrl);
        return;
      }
    }
    if (onCategoryFilter) {
      onCategoryFilter(activeSlide.linkCategory || 'all');
    }
  };

  if (slides.length === 0) return null;

  return (
    <div className="space-y-3 w-full max-w-full overflow-hidden">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[200px] sm:h-[320px] lg:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-900 group"
      >
        <div
          role="button"
          tabIndex={0}
          onClick={handleSlideClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSlideClick();
            }
          }}
          aria-label={
            activeSlide?.titleEn ||
            activeSlide?.titleBn ||
            t('এই ক্যাটাগরির সকল পণ্য দেখুন', 'Browse linked category')
          }
          className="w-full h-full cursor-pointer"
        >
          {activeSlide?.image?.trim() ? (
            <img
              key={`slider-img-${activeSlide.id || currentSlideIndex}`}
              src={activeSlide.image}
              alt={activeSlide.titleEn || activeSlide.titleBn || 'Store Banner'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.015]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 to-slate-900" />
          )}
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="flex absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/75 border border-white/20 text-white items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="flex absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/75 border border-white/20 text-white items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {slides.map((sl, idx) => (
            <button
              key={`dot-${sl.id || idx}`}
              type="button"
              onClick={() => setCurrentSlideIndex(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentSlideIndex
                  ? 'w-7 bg-emerald-600'
                  : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
