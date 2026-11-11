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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                {t('আপনার শপিং ব্যাগ', 'Shopping Bag')} ({cartCount})
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingBag className="w-16 h-16 stroke-1 text-slate-300 mb-3" />
                <h4 className="font-bold text-slate-700 text-base">{t('আপনার কার্ট খালি!', 'Your Cart is Empty')}</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  {t('পছন্দের পণ্যটি নির্বাচন করে কার্টে যোগ করুন অথবা সরাসরি ১ ক্লিকে অর্ডার করুন।', 'Browse our best products and add them to cart or order in 1-click.')}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-5 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer hover:bg-rose-500"
                >
                  {t('শপিং চালিয়ে যান', 'Continue Shopping')}
                </button>
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${index}`}
                  className="flex gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/50"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                          {lang === 'bn' ? item.product.titleBn : item.product.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.selectedColor && `${item.selectedColor} `}
                        {item.selectedSize && `| ${item.selectedSize}`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-xs text-rose-600">
                        ৳ {(item.product.price * item.quantity).toLocaleString()}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, -1, item.selectedColor, item.selectedSize)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-slate-900 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, 1, item.selectedColor, item.selectedSize)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
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
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{t('পণ্যের মূল্য (Subtotal):', 'Subtotal:')}</span>
                  <span className="font-bold text-slate-900">৳ {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>{t('ডেলিভারি চার্জ (জেলা অনুযায়ী যোগ হবে):', 'Delivery Fee (Based on District):')}</span>
                  <span>৳ {settings.deliveryFees.dhakaInside} - ৳ {settings.deliveryFees.dhakaOutside}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t border-slate-100 pt-2">
                  <span>{t('মোট হিসাব:', 'Estimated Total:')}</span>
                  <span className="text-rose-600">৳ {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutAll}
                className="w-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-sm py-3.5 px-4 rounded-2xl shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{t('১ ক্লিকে চেকআউট করুন (ক্যাশ অন ডেলিভারি)', '1-Click Cash on Delivery Checkout')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
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
