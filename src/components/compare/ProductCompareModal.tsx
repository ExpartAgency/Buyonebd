import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, ShoppingBag, CheckCircle, Star, Sparkles, Scale } from 'lucide-react';
import { Product } from '../../types';

interface ProductCompareModalProps {
  onSelectProduct?: (product: Product) => void;
  onInstantBuy?: (product: Product) => void;
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({
  onSelectProduct,
  onInstantBuy
}) => {
  const {
    compareList,
    toggleCompare,
    clearCompare,
    isCompareModalOpen,
    setIsCompareModalOpen,
    visibleStoreProducts: products,
    categories,
    getProductRealStats,
    settings,
    addToCart,
    lang,
    t
  } = useStore();

  if (!isCompareModalOpen) return null;

  const comparedProducts = products.filter((p) => compareList.includes(p.id));
  const hasBangla = (txt?: string) => Boolean(txt && /[\u0981-\u09F2\u09F4-\u09FF]/.test(txt));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t('পণ্য তুলনা করুন', 'Compare Products')}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 tabular-nums">
                  {comparedProducts.length}/3
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  'একই সাথে ৩টি পণ্যের স্পেসিফিকেশন, রেটিং, ডেলিভারি ফি ও মূল্যের তুলনা',
                  'Compare specs, ratings, warranty, delivery fees and prices side-by-side'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparedProducts.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('সব মুছুন', 'Clear All')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table / Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {comparedProducts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Scale className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {t('তুলনার জন্য কোনো পণ্য নির্বাচিত নেই', 'No Products Selected for Comparison')}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {t(
                  'পণ্য কার্ডের তুলনা আইকনে ক্লিক করে সর্বোচ্চ ৩টি পণ্য যোগ করুন।',
                  'Click the compare icon on any product card to add up to 3 items.'
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[640px] grid grid-cols-4 gap-4">
                {/* Attribute labels column */}
                <div className="col-span-1 space-y-4 pt-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <div className="h-48 flex items-end pb-3">{t('পণ্য পরিচিতি', 'Product Info')}</div>
                  <div className="h-12 flex items-center border-t border-slate-100 dark:border-slate-800">{t('বর্তমান মূল্য', 'Current Price')}</div>
                  <div className="h-10 flex items-center border-t border-slate-100 dark:border-slate-800">{t('ছাড় ও সাশ্রয়', 'Discount & Save')}</div>
                  <div className="h-12 flex items-center border-t border-slate-100 dark:border-slate-800">{t('রেটিং ও বিক্রি', 'Rating & Sold')}</div>
                  <div className="h-10 flex items-center border-t border-slate-100 dark:border-slate-800">{t('ক্যাটাগরি', 'Category')}</div>
                  <div className="h-10 flex items-center border-t border-slate-100 dark:border-slate-800">{t('ডেলিভারি ফি', 'Delivery Fee')}</div>
                  <div className="h-10 flex items-center border-t border-slate-100 dark:border-slate-800">{t('স্টক অবস্থা', 'Stock Status')}</div>
                  <div className="h-12 flex items-center border-t border-slate-100 dark:border-slate-800">{t('ওয়ারেন্টি', 'Warranty')}</div>
                  <div className="min-h-24 flex items-start pt-2 border-t border-slate-100 dark:border-slate-800">{t('মূল বৈশিষ্ট্য', 'Key Features')}</div>
                  <div className="h-14 flex items-center border-t border-slate-100 dark:border-slate-800">{t('অ্যাকশন', 'Action')}</div>
                </div>

                {/* Product Columns (up to 3) */}
                {comparedProducts.map((product) => {
                  const discountPct =
                    product.originalPrice > product.price
                      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                      : 0;
                  const stats = getProductRealStats(product.id);
                  const cat = categories.find((c) => c.slug === product.category);
                  const catName =
                    lang === 'bn'
                      ? cat?.nameBn || product.categoryBn || product.category
                      : cat?.nameEn || product.category;
                  const titleText =
                    lang === 'bn'
                      ? product.titleBn || product.title
                      : !hasBangla(product.title) && product.title?.trim()
                      ? product.title
                      : product.titleBn;
                  const rawFeats =
                    lang === 'bn'
                      ? product.featuresBn && product.featuresBn.length > 0
                        ? product.featuresBn
                        : ['১০০% অরিজিনাল পণ্য', 'ক্যাশ অন ডেলিভারি সুবিধা']
                      : product.features && product.features.length > 0
                      ? product.features.filter((f) => !hasBangla(f))
                      : ['100% Authentic Product', 'Cash on Delivery Nationwide'];
                  const feeInside = product.freeShipping
                    ? 0
                    : product.customDeliveryFees?.dhakaInside ?? settings.deliveryFees.dhakaInside;
                  const feeOutside = product.freeShipping
                    ? 0
                    : product.customDeliveryFees?.dhakaOutside ?? settings.deliveryFees.dhakaOutside;

                  return (
                    <div
                      key={product.id}
                      className="col-span-1 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-4 relative group tabular-nums"
                    >
                      <button
                        type="button"
                        onClick={() => toggleCompare(product.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 shadow-sm transition-colors z-10 cursor-pointer"
                        title={t('তুলনা থেকে সরান', 'Remove')}
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Product Info */}
                      <div className="h-48 flex flex-col items-center text-center">
                        <div
                          onClick={() => {
                            setIsCompareModalOpen(false);
                            onSelectProduct?.(product);
                          }}
                          className="w-28 h-28 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer mb-2 shrink-0 group-hover:scale-105 transition-transform"
                        >
                          {product.images?.[0]?.trim() ? (
                            <img src={product.images[0]} alt={titleText} className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <h4
                          onClick={() => {
                            setIsCompareModalOpen(false);
                            onSelectProduct?.(product);
                          }}
                          className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 cursor-pointer hover:text-emerald-600 transition-colors"
                        >
                          {titleText}
                        </h4>
                      </div>

                      {/* Price */}
                      <div className="h-12 flex items-center border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                          ৳{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-xs text-slate-400 line-through ml-2">
                            ৳{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Discount */}
                      <div className="h-10 flex items-center border-t border-slate-200/60 dark:border-slate-700/60">
                        {discountPct > 0 ? (
                          <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 text-xs font-bold">
                            {discountPct}% {t('ছাড়', 'OFF')} (৳{(product.originalPrice - product.price).toLocaleString()} {t('সাশ্রয়', 'Save')})
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">{t('নিয়মিত মূল্য', 'Regular Price')}</span>
                        )}
                      </div>

                      {/* Rating & Sold */}
                      <div className="h-12 flex items-center gap-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center text-amber-400">
                          <Star className="w-4 h-4 fill-amber-400" />
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200 ml-1">
                            {stats.averageRating}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          ({stats.reviewsCount.toLocaleString()}) · {stats.soldCount.toLocaleString()}+ {t('বিক্রি', 'sold')}
                        </span>
                      </div>

                      {/* Category */}
                      <div className="h-10 flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-700/60 truncate">
                        {catName}
                      </div>

                      {/* Delivery Fee */}
                      <div className="h-10 flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-700/60">
                        {product.freeShipping
                          ? t('ফ্রি ডেলিভারি', 'Free Delivery')
                          : `৳${feeInside} - ৳${feeOutside}`}
                      </div>

                      {/* Stock */}
                      <div className="h-10 flex items-center text-xs font-bold border-t border-slate-200/60 dark:border-slate-700/60">
                        {product.stock > 0 ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {t('স্টকে আছে', 'In Stock')} ({product.stock})
                          </span>
                        ) : (
                          <span className="text-rose-500">{t('স্টক আউট', 'Out of Stock')}</span>
                        )}
                      </div>

                      {/* Warranty */}
                      <div className="h-12 flex items-center text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-700/60">
                        {lang === 'bn'
                          ? product.warrantyInfoBn || '৭ দিনের রিপ্লেসমেন্ট ওয়ারেন্টি'
                          : product.warrantyInfo || '7-day replacement guarantee'}
                      </div>

                      {/* Features */}
                      <div className="min-h-24 border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          {(rawFeats.length > 0 ? rawFeats : ['100% Authentic Product']).slice(0, 3).map((f, i) => (
                            <li key={i} className="flex items-start gap-1 line-clamp-1">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actions */}
                      <div className="h-14 flex items-center gap-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <button
                          type="button"
                          disabled={product.stock <= 0}
                          onClick={() => {
                            addToCart(product, 1);
                            setIsCompareModalOpen(false);
                            onInstantBuy?.(product);
                          }}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{t('এখনই কিনুন', 'Buy Now')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Empty slots if less than 3 */}
                {Array.from({ length: Math.max(0, 3 - comparedProducts.length) }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="col-span-1 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center justify-center text-center min-h-[400px] text-slate-400 dark:text-slate-600"
                  >
                    <Sparkles className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-xs font-medium">{t('আরও ১টি পণ্য যোগ করুন', 'Add another product')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
