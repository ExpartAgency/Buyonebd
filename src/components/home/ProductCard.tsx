import React, { useState } from 'react';
import { Star, ShoppingBag, Heart, ArrowRight, BellRing, Tag, Award } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { WaitlistModal } from '../common/WaitlistModal';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onNotifyWaitlist?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, onNotifyWaitlist }) => {
  const {
    openOneClickCheckout,
    addToCart,
    toggleWishlist,
    isWishlisted,
    getPartnerPriceInfo,
    settings,
    lang,
    t
  } = useStore();
  const [localWaitlistOpen, setLocalWaitlistOpen] = useState(false);

  const partnerPrice = getPartnerPriceInfo(product, 1);
  const effectiveUnitPrice = partnerPrice.unitPrice;

  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const isOutOfStock = (product.stock ?? 0) <= 0;
  const primaryColor = settings.themeColors?.primary || '#059669';
  const orderBtnLabel = t(
    settings.cmsTexts?.orderNowBtnBn || 'অর্ডার করুন',
    settings.cmsTexts?.orderNowBtnEn || 'Order Now'
  );
  const cartBtnLabel = t(
    settings.cmsTexts?.addToCartBtnBn || 'কার্টে যোগ করুন',
    settings.cmsTexts?.addToCartBtnEn || 'Add to Cart'
  );
  const notifyBtnLabel = t(
    settings.singleProductCms?.notifyMeBtnBn || 'স্টকে এলে জানান',
    settings.singleProductCms?.notifyMeBtnEn || 'Notify Me When Available'
  );

  const brandLabel = lang === 'bn' ? product.brandBn || product.brand : product.brand || product.brandBn;

  const handleWaitlistClick = () => {
    if (onNotifyWaitlist) {
      onNotifyWaitlist(product);
    } else {
      setLocalWaitlistOpen(true);
    }
  };

  return (
    <>
      <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
        {/* Image-first Showcase */}
        <div
          onClick={() => onViewDetails(product)}
          className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
        >
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              isOutOfStock ? 'opacity-70 grayscale-[35%]' : ''
            }`}
          />

          {isOutOfStock ? (
            <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs uppercase">
              {t(
                settings.singleProductCms?.outOfStockLabelBn || 'স্টক শেষ',
                settings.singleProductCms?.outOfStockLabelEn || 'Out of Stock'
              )}
            </span>
          ) : (
            discountPercent > 0 && (
              <span
                style={{ backgroundColor: primaryColor }}
                className="absolute top-2.5 left-2.5 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs tabular-nums"
              >
                -{discountPercent}% {t('ছাড়', 'OFF')}
              </span>
            )
          )}

          {brandLabel && (
            <span className="absolute bottom-2 left-2 bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 max-w-[75%] truncate">
              <Tag className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <span className="truncate">{brandLabel}</span>
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-sm cursor-pointer transition-colors ${
              isWishlisted(product.id)
                ? 'bg-rose-50 text-rose-600'
                : 'bg-white/85 dark:bg-slate-800/85 hover:bg-white text-slate-400 hover:text-rose-600'
            }`}
            title={t('পছন্দ তালিকা', 'Wishlist')}
            aria-label={t('পছন্দ তালিকা', 'Wishlist')}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted(product.id) ? 'fill-rose-600' : ''}`} />
          </button>
        </div>

        {/* Product Metadata & Actions */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 gap-1.5">
              <span className="font-semibold truncate" style={{ color: primaryColor }}>
                {lang === 'bn' ? product.categoryBn : product.category}
              </span>
              <span className="flex items-center gap-0.5 text-amber-500 font-semibold shrink-0 tabular-nums">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
              </span>
            </div>

            <h3
              onClick={() => onViewDetails(product)}
              className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white transition-colors line-clamp-2 cursor-pointer leading-snug min-h-[2.4rem]"
            >
              {lang === 'bn' ? product.titleBn : product.title}
            </h3>

            <div className="flex items-baseline gap-2 mt-2 flex-wrap tabular-nums">
              <span className="text-sm sm:text-base font-extrabold" style={{ color: primaryColor }}>
                ৳ {effectiveUnitPrice.toLocaleString()}
              </span>
              {product.originalPrice > effectiveUnitPrice && (
                <span className="text-[11px] text-slate-400 line-through">
                  ৳ {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {partnerPrice.mode === 'reseller' && (
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                {t('রিসেলার মূল্য', 'Reseller Rate')} · {t('লাভ', 'Margin')} ৳{(partnerPrice.estimatedProfitPerUnit || 0).toLocaleString()}
              </p>
            )}
            {partnerPrice.mode === 'wholesale' && (
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                {t('হোলসেল রেট', 'B2B Rate')} · MOQ {partnerPrice.minQty || 10} pcs
              </p>
            )}
            {settings.loyaltySettings?.enabled !== false && (
              <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold tabular-nums">
                <Award className="w-3 h-3 shrink-0 text-amber-500" />
                <span>
                  {t(
                    `+${Math.max(1, Math.floor((effectiveUnitPrice / 100) * (settings.loyaltySettings?.pointsPer100Bdt ?? 5)))} পয়েন্ট অর্জন`,
                    `Earn +${Math.max(1, Math.floor((effectiveUnitPrice / 100) * (settings.loyaltySettings?.pointsPer100Bdt ?? 5)))} pts`
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            {isOutOfStock ? (
              <button
                type="button"
                onClick={handleWaitlistClick}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] py-2.5 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <BellRing className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{notifyBtnLabel}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openOneClickCheckout(product)}
                  style={{
                    backgroundColor: primaryColor,
                    color: 'var(--brand-on-primary, #ffffff)'
                  }}
                  className="w-full hover:opacity-95 font-bold text-xs py-2 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <span>{orderBtnLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => addToCart(product, 1)}
                  className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[11px] py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3 h-3 text-slate-600 dark:text-slate-400 shrink-0" />
                  <span className="truncate">{cartBtnLabel}</span>
                </button>
              </>
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
};

