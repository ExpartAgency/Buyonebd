import React, { useState } from 'react';
import { Star, ShoppingCart, BellRing, Flame, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { WaitlistModal } from '../common/WaitlistModal';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onNotifyWaitlist?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  onViewDetails,
  onNotifyWaitlist
}) => {
  const {
    openOneClickCheckout,
    addToCart,
    getPartnerPriceInfo,
    getProductViewCount,
    getProductRealStats,
    categories,
    settings,
    lang,
    t
  } = useStore();
  const [localWaitlistOpen, setLocalWaitlistOpen] = useState(false);

  const partnerPrice = getPartnerPriceInfo(product, 1);
  const effectiveUnitPrice = partnerPrice.unitPrice;
  const isOutOfStock = (product.stock ?? 0) <= 0;
  const primaryColor = settings.themeColors?.primary || '#059669';

  const discountPercent =
    product.originalPrice > effectiveUnitPrice
      ? Math.round(((product.originalPrice - effectiveUnitPrice) / product.originalPrice) * 100)
      : 0;

  const orderBtnLabel = t(
    settings.cmsTexts?.orderNowBtnBn || 'এখনই কিনুন',
    settings.cmsTexts?.orderNowBtnEn === 'Order Now' || !settings.cmsTexts?.orderNowBtnEn
      ? 'Buy Now'
      : settings.cmsTexts.orderNowBtnEn
  );

  const notifyBtnLabel = t(
    settings.singleProductCms?.notifyMeBtnBn || 'স্টকে এলে জানান',
    settings.singleProductCms?.notifyMeBtnEn || 'Notify Me'
  );

  const hasBangla = (txt?: string) => Boolean(txt && /[\u0981-\u09F2\u09F4-\u09FF]/.test(txt));
  const titleText =
    lang === 'bn'
      ? product.titleBn || product.title
      : !hasBangla(product.title) && product.title?.trim()
      ? product.title
      : product.titleBn;
  const catObj = categories.find((c) => c.slug === product.category);
  const categoryText =
    lang === 'bn'
      ? catObj?.nameBn || product.categoryBn || product.category
      : catObj?.nameEn || (!hasBangla(product.category) ? product.category : product.categoryBn);

  // Strictly real order + review stats from live store data
  const realStats = getProductRealStats(product.id);
  const soldNum = realStats.soldCount;
  const soldFormatted =
    soldNum >= 1000 ? `${(soldNum / 1000).toFixed(soldNum >= 10000 ? 0 : 1)}K+` : `${soldNum}`;
  const reviewsDisplayCount = realStats.reviewsCount;
  const realRating = realStats.averageRating;
  const roundedStars = realRating > 0 ? Math.round(realRating) : 0;

  const highlightPrefix =
    soldNum >= 5
      ? t('বেস্ট সেলিং', 'Best-Selling')
      : reviewsDisplayCount >= 2 && realRating >= 4.5
      ? t('টপ রেটেড', 'Top Rated')
      : null;

  const showCardViews =
    settings.viewerCounter?.enabled !== false && settings.viewerCounter?.showOnCards === true;

  const handleWaitlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNotifyWaitlist) {
      onNotifyWaitlist(product);
    } else {
      setLocalWaitlistOpen(true);
    }
  };

  return (
    <>
      <article className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
        {/* Square Media Stage */}
        <div
          onClick={() => onViewDetails(product)}
          className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
        >
          {product.images?.[0]?.trim() ? (
            <img
              src={product.images[0]}
              alt={titleText}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                isOutOfStock ? 'opacity-65 grayscale-[35%]' : ''
              }`}
            />
          ) : (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
          )}

          {isOutOfStock ? (
            <span className="absolute top-2 left-2 bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              {t(
                settings.singleProductCms?.outOfStockLabelBn || 'স্টক শেষ',
                settings.singleProductCms?.outOfStockLabelEn || 'Out of Stock'
              )}
            </span>
          ) : (
            discountPercent > 0 && (
              <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums">
                -{discountPercent}%
              </span>
            )
          )}
        </div>

        {/* Compact Marketplace Body */}
        <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between gap-1.5 min-w-0">
          <div className="space-y-1 min-w-0">
            {/* 1-Line Truncated Product Title */}
            <h3
              onClick={() => onViewDetails(product)}
              title={titleText}
              className="text-xs sm:text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {titleText}
            </h3>

            {/* Price + Original Strikethrough + Real Sold + Outline Cart Icon Button */}
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <div className="flex items-baseline gap-1.5 min-w-0 flex-wrap tabular-nums">
                <span className="text-sm sm:text-[15px] font-extrabold text-slate-950 dark:text-white leading-none">
                  ৳{effectiveUnitPrice.toLocaleString()}
                </span>
                {product.originalPrice > effectiveUnitPrice && (
                  <span className="text-[11px] text-slate-400 line-through leading-none">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
                {soldNum > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-none">
                    <Flame className="w-3 h-3 text-orange-500 fill-orange-500 shrink-0" />
                    <span>{soldFormatted} {t('বিক্রি', 'sold')}</span>
                  </span>
                )}
              </div>

              {!isOutOfStock && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product, 1);
                  }}
                  aria-label={t('কার্টে যোগ করুন', 'Add to Cart')}
                  title={t('কার্টে যোগ করুন', 'Add to Cart')}
                  className="shrink-0 w-9 h-7 rounded-full border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-emerald-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Clean Category / Real Achievement Line */}
            <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
              {highlightPrefix ? (
                <>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{highlightPrefix}</span>{' '}
                  <span>{t('·', 'in')} {categoryText}</span>
                </>
              ) : (
                <span>{categoryText}</span>
              )}
            </p>

            {/* Real Rating + Real Review Count + Real Views */}
            <div
              onClick={() => onViewDetails(product)}
              className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer tabular-nums"
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <Star
                    key={idx}
                    className={`w-3 h-3 ${
                      idx <= roundedStars
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {reviewsDisplayCount > 0
                  ? `${realRating} (${reviewsDisplayCount.toLocaleString()})`
                  : t('০ রিভিউ', '0')}
              </span>
              {showCardViews && (
                <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  <Eye className="w-3 h-3 shrink-0" />
                  <span>{getProductViewCount(product.id).toLocaleString()}</span>
                </span>
              )}
            </div>

            {partnerPrice.mode === 'reseller' && (
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums truncate">
                {t('রিসেলার লাভ', 'Reseller Margin')}: ৳{(partnerPrice.estimatedProfitPerUnit || 0).toLocaleString()}
              </p>
            )}
            {partnerPrice.mode === 'wholesale' && (
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums truncate">
                {t('পাইকারি ন্যূনতম', 'B2B MOQ')} {partnerPrice.minQty || 10} {t('পিস', 'pcs')}
              </p>
            )}
          </div>

          {/* Bottom Compact Action Row */}
          <div className="pt-1.5 mt-0.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            {isOutOfStock ? (
              <button
                type="button"
                onClick={handleWaitlistClick}
                className="w-full justify-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] py-1.5 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <BellRing className="w-3 h-3 shrink-0" />
                <span>{notifyBtnLabel}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openOneClickCheckout(product);
                }}
                style={{
                  backgroundColor: primaryColor,
                  color: 'var(--brand-on-primary, #ffffff)'
                }}
                className="w-full justify-center hover:opacity-95 font-bold text-[11px] py-1.5 px-2.5 rounded-lg cursor-pointer transition-opacity active:scale-95 whitespace-nowrap"
              >
                {orderBtnLabel}
              </button>
            )}
          </div>
        </div>
      </article>

      {localWaitlistOpen && (
        <WaitlistModal
          product={product}
          onClose={() => setLocalWaitlistOpen(false)}
        />
      )}
    </>
  );
});
