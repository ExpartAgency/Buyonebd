import React, { useEffect, useState } from 'react';
import { X, Trash2, ShoppingBag, Zap, ArrowRight, ShieldCheck, Sparkles, Plus, Copy, Tag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
    openOneClickCheckout,
    getPartnerPriceInfo,
    visibleStoreProducts,
    settings,
    addToast,
    lang,
    t
  } = useStore();

  const [upsellData, setUpsellData] = useState<{
    recommendedProduct: Product | null;
    reason: string;
    freeShippingGap: number;
  } | null>(null);
  const [isLoadingUpsell, setIsLoadingUpsell] = useState(false);

  const cartIdsKey = cart.map((c) => `${c.product.id}:${c.quantity}`).join(',');

  useEffect(() => {
    if (!isCartOpen || cart.length === 0) {
      setUpsellData(null);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    setIsLoadingUpsell(true);
    fetch('/api/ai/cart-upsell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartProductIds: cart.map((c) => c.product.id),
        cartTotal,
        lang
      }),
      signal: controller.signal
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.ok || !data?.recommendedProduct) return;
        const matched = visibleStoreProducts.find((p) => p.id === data.recommendedProduct.id);
        if (matched) {
          setUpsellData({
            recommendedProduct: matched,
            reason: data.reason || '',
            freeShippingGap: Number(data.freeShippingGap || 0)
          });
        } else {
          setUpsellData(null);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingUpsell(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isCartOpen, cartIdsKey, cartTotal, lang]);

  if (!isCartOpen) return null;

  const handleCheckoutAll = () => {
    setIsCartOpen(false);
    openOneClickCheckout(null); // checkout entire cart
  };

  const primaryColor = settings.themeColors?.primary || '#059669';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900">
            <div className="flex items-center gap-2.5">
              <div
                style={{ backgroundColor: primaryColor }}
                className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white tabular-nums">
                {t('আপনার শপিং ব্যাগ', 'Shopping Bag')} ({cartCount})
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingBag className="w-16 h-16 stroke-1 text-slate-300 dark:text-slate-700 mb-3" />
                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-base">{t('আপনার কার্ট খালি!', 'Your Cart is Empty')}</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  {t('পছন্দের পণ্যটি নির্বাচন করে কার্টে যোগ করুন অথবা সরাসরি ১ ক্লিকে অর্ডার করুন।', 'Browse our best products and add them to cart or order in 1-click.')}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  style={{ backgroundColor: primaryColor }}
                  className="mt-5 px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer hover:opacity-95"
                >
                  {t('শপিং চালিয়ে যান', 'Continue Shopping')}
                </button>
              </div>
            ) : (
              <>
                {cart.map((item, index) => (
                  <div
                    key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${index}`}
                    className="flex gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40"
                  >
                    {item.product.images?.[0]?.trim() ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0" />
                    )}

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                            {lang === 'bn' ? item.product.titleBn : item.product.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize, item.selectedAttributes)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {(item.selectedColor || item.selectedSize || (item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0)) && (
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {[
                              item.selectedColor,
                              item.selectedSize,
                              ...(item.selectedAttributes ? Object.entries(item.selectedAttributes).map(([k, v]) => `${k}: ${v}`) : [])
                            ].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {(() => {
                          const pInfo = getPartnerPriceInfo(item.product, item.quantity);
                          return (
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 tabular-nums block">
                                ৳ {(pInfo.unitPrice * item.quantity).toLocaleString()}
                              </span>
                              {pInfo.mode === 'reseller' && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                                  {t('রিসেলার · লাভ', 'Reseller · Profit')} ৳{((pInfo.estimatedProfitPerUnit || 0) * item.quantity).toLocaleString()}
                                </span>
                              )}
                              {pInfo.mode === 'wholesale' && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                                  {t('হোলসেল', 'B2B')} ৳{pInfo.unitPrice.toLocaleString()}{t('/পিস', '/pc')} · MOQ {pInfo.minQty}
                                </span>
                              )}
                            </div>
                          );
                        })()}

                        {/* Quantity Controls */}
                        <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, -1, item.selectedColor, item.selectedSize, item.selectedAttributes)}
                            className="px-2.5 py-0.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, 1, item.selectedColor, item.selectedSize, item.selectedAttributes)}
                            className="px-2.5 py-0.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* AI Smart Cart Pairing Suggestion */}
                {upsellData?.recommendedProduct && (
                  <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        {t('এআই স্মার্ট পেয়ারিং অফার', 'AI Smart Pairing')}
                      </span>
                      {upsellData.freeShippingGap > 0 && (
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {t(`ফ্রি ডেলিভারি বাকি ৳${upsellData.freeShippingGap.toLocaleString()}`, `৳${upsellData.freeShippingGap.toLocaleString()} to free ship`)}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {upsellData.reason}
                    </p>
                    <div className="flex items-center gap-2.5 pt-0.5">
                      {upsellData.recommendedProduct.images?.[0] && (
                        <img
                          src={upsellData.recommendedProduct.images[0]}
                          alt={upsellData.recommendedProduct.title}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {lang === 'bn'
                            ? upsellData.recommendedProduct.titleBn || upsellData.recommendedProduct.title
                            : upsellData.recommendedProduct.title}
                        </p>
                        <p className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          ৳{upsellData.recommendedProduct.price.toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(upsellData.recommendedProduct!, 1)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('যোগ করুন', 'Add')}</span>
                      </button>
                    </div>
                  </div>
                )}
                {!upsellData?.recommendedProduct && isLoadingUpsell && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>{t('সেরা কম্বো খুঁজছে...', 'Finding best pairing...')}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (() => {
            const freeShipCfg = settings.organicMarketing?.freeShippingBar;
            const threshold = freeShipCfg?.enabled ? Math.max(0, Number(freeShipCfg.thresholdBdt) || 0) : 0;
            const remainingForFree = threshold > 0 ? Math.max(0, threshold - cartTotal) : 0;
            const freeShipPct = threshold > 0 ? Math.min(100, Math.round((cartTotal / threshold) * 100)) : 0;
            const unlockedFreeShip = threshold > 0 && cartTotal >= threshold;

            const bundleCfg = settings.organicMarketing?.bundleDiscount;
            const bundlePct = bundleCfg?.enabled
              ? cartCount >= 3
                ? Number(bundleCfg.qty3Percent) || 0
                : cartCount >= 2
                ? Number(bundleCfg.qty2Percent) || 0
                : 0
              : 0;
            const bundleOff = bundlePct > 0 ? Math.round(cartTotal * (bundlePct / 100)) : 0;
            const netEstimate = Math.max(0, cartTotal - bundleOff);

            return (
              <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 tabular-nums">
                {threshold > 0 && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                    <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                      {unlockedFreeShip
                        ? t('🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি আনলক করেছেন!', '🎉 Congrats! You unlocked FREE Delivery!')
                        : (lang === 'bn'
                            ? (freeShipCfg?.messageBn || 'আর মাত্র ৳{remaining} যোগ করলে ফ্রি ডেলিভারি!')
                            : (freeShipCfg?.messageEn || 'Add ৳{remaining} more for FREE Delivery!')
                          ).replace('{remaining}', remainingForFree.toLocaleString())}
                    </p>
                    <div className="w-full h-1.5 rounded-full bg-emerald-200/70 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-300"
                        style={{ width: `${freeShipPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Active Promo Coupons Strip (1-Click Copy) */}
                {(settings.promoCoupons || []).filter((c) => c.active !== false).length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                      <Tag className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{t('কুপন কোড (চেকআউটে ব্যবহার করুন):', 'Available Coupons (Copy for Checkout):')}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(settings.promoCoupons || [])
                        .filter((c) => c.active !== false)
                        .slice(0, 3)
                        .map((cpn) => (
                          <button
                            key={cpn.id}
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(cpn.code);
                              } catch {}
                              addToast('success', t('কুপন কোড কপি হয়েছে!', 'Coupon Code Copied!'), cpn.code);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-[10px] font-mono font-bold text-amber-900 dark:text-amber-200 hover:border-amber-500 cursor-pointer"
                            title={cpn.code}
                          >
                            <span>{cpn.code}</span>
                            <Copy className="w-2.5 h-2.5 text-amber-600" />
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{t('পণ্যের মূল্য:', 'Subtotal:')}</span>
                    <span className="font-bold text-slate-900 dark:text-white">৳ {cartTotal.toLocaleString()}</span>
                  </div>
                  {bundleOff > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>
                        {t(`বান্ডিল ডিসকাউন্ট (${bundlePct}% ছাড়):`, `Bundle Discount (${bundlePct}% OFF):`)}
                      </span>
                      <span>- ৳ {bundleOff.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>{t('ডেলিভারি চার্জ (জেলা অনুযায়ী):', 'Delivery Fee (District-based):')}</span>
                    <span>
                      {unlockedFreeShip ? (
                        <span className="font-bold text-emerald-600">{t('ফ্রি ডেলিভারি', 'FREE')}</span>
                      ) : (
                        `৳ ${settings.deliveryFees.dhakaInside} - ৳ ${settings.deliveryFees.dhakaOutside}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800 pt-2">
                    <span>{t('মোট হিসাব:', 'Estimated Total:')}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">৳ {netEstimate.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutAll}
                  style={{ backgroundColor: primaryColor }}
                  className="w-full hover:opacity-95 text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>{t('১ ক্লিকে ক্যাশ অন ডেলিভারি অর্ডার', '1-Click Cash on Delivery Checkout')}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {t('১০০% নিরাপদ ডেলিভারি', '100% Safe Delivery')}
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    {t('কার্ট খালি করুন', 'Clear Cart')}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
