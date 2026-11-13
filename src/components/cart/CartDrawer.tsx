import React from 'react';
import { X, Trash2, ShoppingBag, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
    openOneClickCheckout,
    settings,
    lang,
    t
  } = useStore();

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
              cart.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${index}`}
                  className="flex gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                          {lang === 'bn' ? item.product.titleBn : item.product.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {(item.selectedColor || item.selectedSize) && (
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {[item.selectedColor, item.selectedSize].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 tabular-nums">
                        ৳ {(item.product.price * item.quantity).toLocaleString()}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, -1, item.selectedColor, item.selectedSize)}
                          className="px-2.5 py-0.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, 1, item.selectedColor, item.selectedSize)}
                          className="px-2.5 py-0.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 tabular-nums">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t('পণ্যের মূল্য (Subtotal):', 'Subtotal:')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">৳ {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>{t('ডেলিভারি চার্জ (জেলা অনুযায়ী):', 'Delivery Fee (District-based):')}</span>
                  <span>৳ {settings.deliveryFees.dhakaInside} - ৳ {settings.deliveryFees.dhakaOutside}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span>{t('মোট হিসাব:', 'Estimated Total:')}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">৳ {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutAll}
                style={{ backgroundColor: primaryColor }}
                className="w-full hover:opacity-95 text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{t('১ ক্লিকে চেকআউট করুন (ক্যাশ অন ডেলিভারি)', '1-Click Cash on Delivery Checkout')}</span>
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
          )}
        </div>
      </div>
    </div>
  );
};
