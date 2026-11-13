import React from 'react';
import { Star, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const {
    openOneClickCheckout,
    addToCart,
    toggleWishlist,
    isWishlisted,
    settings,
    lang,
    t
  } = useStore();

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const primaryColor = settings.themeColors?.primary || '#059669';
  const orderBtnLabel = t(
    settings.cmsTexts?.orderNowBtnBn || 'অর্ডার করুন',
    settings.cmsTexts?.orderNowBtnEn || 'Order Now'
  );
  const cartBtnLabel = t(
    settings.cmsTexts?.addToCartBtnBn || 'কার্টে যোগ করুন',
    settings.cmsTexts?.addToCartBtnEn || 'Add to Cart'
  );

  return (
    <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Image-first Showcase */}
      <div
        onClick={() => onViewDetails(product)}
        className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
      >
        <img
          src={product.images[0]}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {discountPercent > 0 && (
          <span
            style={{ backgroundColor: primaryColor }}
            className="absolute top-2.5 left-2.5 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs tabular-nums"
          >
            -{discountPercent}% {t('ছাড়', 'OFF')}
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
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 truncate">
              {lang === 'bn' ? product.categoryBn : product.category}
            </span>
            <span className="flex items-center gap-0.5 text-amber-500 font-semibold shrink-0 tabular-nums">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </span>
          </div>

          <h3
            onClick={() => onViewDetails(product)}
            className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-2 cursor-pointer leading-snug min-h-[2.4rem]"
          >
            {lang === 'bn' ? product.titleBn : product.title}
          </h3>

          <div className="flex items-baseline gap-2 mt-2 flex-wrap tabular-nums">
            <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              ৳ {product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[11px] text-slate-400 line-through">
                ৳ {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <button
            type="button"
            onClick={() => openOneClickCheckout(product)}
            style={{ backgroundColor: primaryColor }}
            className="w-full hover:opacity-95 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
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
        </div>
      </div>
    </article>
  );
};
