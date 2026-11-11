import React from 'react';
import { Star, ShoppingBag, Eye, Heart, ArrowRight } from 'lucide-react';
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
    lang,
    t
  } = useStore();

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Top Image area */}
      <div
        onClick={() => onViewDetails(product)}
        className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
      >
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg shadow-md">
            -{discountPercent}% {t('ছাড়', 'OFF')}
          </span>
        )}

        {/* Top-Right: Wishlist Heart Only (No Compare Button as per Req 16) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full shadow-md backdrop-blur-sm cursor-pointer transition-all ${
            isWishlisted(product.id)
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white text-slate-400 hover:text-rose-600'
          }`}
          title={t('পছন্দ তালিকা', 'Wishlist')}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted(product.id) ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Urgency stock badge */}
        {product.stock <= 45 && (
          <span className="absolute bottom-2 left-2 bg-amber-500 text-slate-950 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
            {t(`স্টক সীমিত: ${product.stock} টি`, `Limited Stock: ${product.stock}`)}
          </span>
        )}

        {/* Quick View hover icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product);
          }}
          className="absolute bottom-2 right-2 p-1.5 sm:p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white text-slate-700 dark:text-slate-200 rounded-lg sm:rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hidden sm:block"
          title={t('বিস্তারিত দেখুন', 'View Details')}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Body Info */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 mb-1">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[9px] sm:text-[10px]">
              {lang === 'bn' ? product.categoryBn : product.category}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewDetails(product)}
            className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-2 cursor-pointer leading-tight sm:leading-snug min-h-[2.2rem]"
          >
            {lang === 'bn' ? product.titleBn : product.title}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-2">
            <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
              ৳ {product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                ৳ {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions Strip - No "1-Click" wording */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1 sm:space-y-1.5">
          {/* Order Now Button */}
          <button
            onClick={() => openOneClickCheckout(product)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 sm:py-2.5 px-2 rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <span>{t('অর্ডার করুন', 'Order Now')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Add to Cart button */}
          <button
            onClick={() => addToCart(product, 1)}
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[10px] sm:text-xs py-1.5 sm:py-2 px-2 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3 h-3 text-slate-600 dark:text-slate-400" />
            <span>{t('কার্টে যোগ করুন', 'Add to Cart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
