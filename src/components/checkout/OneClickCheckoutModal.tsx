import React, { useState, useEffect } from 'react';
import { X, Check, Copy, ShieldCheck, Truck, Sparkles, ShoppingBag, Tag, MessageCircle, ArrowRight, PhoneCall, Wallet } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BD_DISTRICTS } from '../../data/initialData';
import { PaymentMethod, DeliveryZone, Order } from '../../types';

export const OneClickCheckoutModal: React.FC = () => {
  const {
    isOneClickOpen,
    closeOneClickCheckout,
    checkoutProduct,
    cart,
    cartTotal,
    createOrder,
    customerWalletBalance,
    settings,
    setActiveView,
    setTrackingSearchQuery,
    lang,
    t,
    addToast
  } = useStore();

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('Dhaka - Inside City');
  const [thana, setThana] = useState('Dhanmondi');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');

  // Selected specs for single product checkout
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Coupon / Temu voucher state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; label: string; amount: number } | null>(null);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [advancePayFee, setAdvancePayFee] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Success Sheet after placing order
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const currentDistrictObj = BD_DISTRICTS.find((d) => d.name === selectedDistrictName) || BD_DISTRICTS[0];
  const currentZone: DeliveryZone = currentDistrictObj.zone;

  const zoneKey =
    currentZone === 'dhaka_inside'
      ? 'dhakaInside'
      : currentZone === 'dhaka_sub'
      ? 'dhakaSub'
      : 'dhakaOutside';

  const activeProductsForDelivery = checkoutProduct ? [checkoutProduct] : cart.map((c) => c.product);
  const allFreeShip =
    activeProductsForDelivery.length > 0 && activeProductsForDelivery.every((p) => p.freeShipping);
  const customProductFee = activeProductsForDelivery.find(
    (p) => p.customDeliveryFees && p.customDeliveryFees[zoneKey] !== undefined
  )?.customDeliveryFees?.[zoneKey];

  const rawDeliveryFee = allFreeShip
    ? 0
    : customProductFee !== undefined
    ? Math.max(0, customProductFee)
    : settings.deliveryFees[zoneKey];

  const deliveryFee = appliedCoupon?.code === 'FREESHIP' ? 0 : rawDeliveryFee;

  // Single product vs Cart items
  const isSingleProduct = !!checkoutProduct;
  const singleSubtotal = checkoutProduct ? checkoutProduct.price * quantity : 0;
  const subtotal = isSingleProduct ? singleSubtotal : cartTotal;
  const discountAmount = appliedCoupon ? appliedCoupon.amount : 0;
  const subtotalAfterCoupon = Math.max(0, subtotal + deliveryFee - discountAmount);
  const walletDeduction = useWallet ? Math.min(customerWalletBalance, subtotalAfterCoupon) : 0;
  const advanceAmount = advancePayFee ? Math.min(settings.paymentSettings.advanceFeeAmount || 100, rawDeliveryFee) : 0;
  const grandTotal = Math.max(0, subtotalAfterCoupon - walletDeduction);
  const payableOnDelivery = Math.max(0, grandTotal - advanceAmount);

  // Initialize single product defaults
  useEffect(() => {
    if (checkoutProduct) {
      setQuantity(1);
      setSelectedColor(checkoutProduct.colors?.[0] || '');
      setSelectedSize(checkoutProduct.sizes?.[0] || '');
    }
    setPlacedOrder(null);
  }, [checkoutProduct, isOneClickOpen]);

  // When district changes, update default thana
  useEffect(() => {
    if (currentDistrictObj.thanas.length > 0) {
      setThana(currentDistrictObj.thanas[0]);
    }
  }, [selectedDistrictName]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(true);
    addToast('success', t('নম্বর কপি হয়েছে!', 'Number Copied!'), text);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleApplyCoupon = (codeToTest?: string) => {
    const code = (codeToTest || couponCode).trim().toUpperCase();
    if (!code) return;

    const reward = settings.spinSettings?.rewards.find((r) => r.code.toUpperCase() === code);
    const promoCoupon = (settings.promoCoupons || []).find((c) => c.code.toUpperCase() === code && c.active !== false);
    const organicPromoCode = settings.organicMarketing?.promoPopup?.couponCode?.toUpperCase();
    const organicShareCode = settings.organicMarketing?.socialShareDiscount?.couponCode?.toUpperCase();

    if (promoCoupon) {
      if (promoCoupon.minOrder && subtotal < promoCoupon.minOrder) {
        addToast(
          'warning',
          t('মিনিমাম অর্ডার প্রয়োজন', 'Minimum Order Required'),
          t(`${code} ব্যবহার করতে কমপক্ষে ৳${promoCoupon.minOrder} এর অর্ডার করুন।`, `Spend at least ৳${promoCoupon.minOrder} to apply ${code}.`)
        );
        return;
      }
      const amount =
        promoCoupon.discountType === 'free_shipping'
          ? rawDeliveryFee
          : promoCoupon.discountType === 'percent'
          ? Math.round(subtotal * (promoCoupon.value / 100))
          : promoCoupon.value;
      setAppliedCoupon({
        code,
        label: promoCoupon.title || `${code} (-৳${amount})`,
        amount
      });
      setCouponCode(code);
      addToast('success', t('প্রোমো কুপন প্রয়োগ হয়েছে!', 'Promo Coupon Applied!'), `${code} (-৳${amount})`);
    } else if (reward) {
      let amount = 0;
      if (reward.discountType === 'fixed') amount = reward.value;
      else if (reward.discountType === 'free_shipping') amount = rawDeliveryFee;
      else if (reward.discountType === 'percent') amount = Math.round(subtotal * (reward.value / 100));

      setAppliedCoupon({
        code,
        label: lang === 'bn' ? reward.labelBn : reward.labelEn,
        amount
      });
      setCouponCode(code);
      addToast(
        'success',
        t('কুপন ডিসকাউন্ট যোগ হয়েছে!', 'Coupon Applied!'),
        `${lang === 'bn' ? reward.labelBn : reward.labelEn} (${code})`
      );
    } else if (
      (organicPromoCode && code === organicPromoCode) ||
      (organicShareCode && code === organicShareCode)
    ) {
      const amount =
        code === organicShareCode
          ? settings.organicMarketing?.socialShareDiscount?.discountAmount || 50
          : 100;
      setAppliedCoupon({
        code,
        label: `৳${amount} OFF`,
        amount
      });
      setCouponCode(code);
      addToast('success', t('অর্গানিক কুপন যোগ হয়েছে!', 'Organic Coupon Applied!'), `${code} (-৳${amount})`);
    } else {
      addToast(
        'warning',
        t('কুপন কোড পাওয়া যায়নি', 'Invalid Coupon'),
        t('অনুগ্রহ করে সঠিক কুপন কোড দিন অথবা স্পিন করে জিতে নিন!', 'Enter valid code or spin the lucky wheel to win!')
      );
    }
  };

  const validateForm = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) {
      errs.name = t('আপনার নাম লিখুন', 'Please enter your name');
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      errs.phone = t('মোবাইল নম্বর প্রদান করুন', 'Please enter phone number');
    } else if (cleanPhone.length < 11 || (!cleanPhone.startsWith('01') && !cleanPhone.startsWith('8801'))) {
      errs.phone = t('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন 017XXXXXXXX)', 'Provide valid 11-digit BD phone number');
    }

    if (!address.trim()) {
      errs.address = t('সম্পূর্ণ ডেলিভারি ঠিকানা দিন', 'Provide full delivery address');
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && !trxId.trim()) {
      errs.trxId = t('ট্রানজেকশন আইডি (TrxID) লিখুন', 'Please enter transaction ID');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const itemsToOrder = isSingleProduct && checkoutProduct
        ? [
            {
              product: checkoutProduct,
              quantity,
              selectedColor,
              selectedSize
            }
          ]
        : cart.map((c) => ({
            product: c.product,
            quantity: c.quantity,
            selectedColor: c.selectedColor,
            selectedSize: c.selectedSize
          }));

      if (itemsToOrder.length === 0) {
        addToast('error', t('কার্ট খালি', 'Empty Cart'), t('কোনো পণ্য নির্বাচন করা হয়নি', 'No products to checkout'));
        setIsSubmitting(false);
        return;
      }

      const newOrder = createOrder({
        customer: {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          district: selectedDistrictName,
          thana,
          note: note.trim()
        },
        items: itemsToOrder,
        paymentMethod,
        paymentTrxId: trxId.trim() || undefined,
        deliveryZone: currentZone,
        customDeliveryFee: deliveryFee,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        couponCode: appliedCoupon?.code,
        advancePaid: advanceAmount > 0 ? advanceAmount : undefined,
        walletUsedAmount: walletDeduction > 0 ? walletDeduction : undefined
      });

      // Show immediate Success Confirmation Sheet with 1-Click WhatsApp Memo
      setPlacedOrder(newOrder);
    } catch (err) {
      console.error(err);
      addToast('error', t('অর্ডার করতে সমস্যা হয়েছে', 'Order Error'), t('অনুগ্রহ করে আবার চেষ্টা করুন', 'Please try again'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOneClickOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto overflow-x-hidden animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[94vh] flex flex-col min-w-0">
        {/* Top Header */}
        <div className="bg-slate-900 px-4 py-3.5 sm:px-6 sm:py-4 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {t('অর্ডার কনফার্মেশন', 'Order Checkout')}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {t('এআই কল ভেরিফিকেশন', 'AI Voice Verification')}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold mt-1 text-white">
              {placedOrder ? t('অর্ডার সফল হয়েছে!', 'Order Successful!') : t('অর্ডার নিশ্চিত করতে ঠিকানা ও ফোন দিন', 'Enter Shipping Address & Phone')}
            </h2>
          </div>
          <button
            onClick={closeOneClickCheckout}
            className="p-1.5 sm:p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= SUCCESS CONFIRMATION SHEET ================= */}
        {placedOrder ? (
          <div className="p-5 sm:p-7 overflow-y-auto space-y-4 text-slate-800 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-inner">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {t('অর্ডারটি গ্রহণ করা হয়েছে!', 'Order Received Successfully!')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('অর্ডার নম্বর:', 'Order ID:')} <strong className="font-mono text-emerald-600 font-bold text-sm">#{placedOrder.id}</strong>
              </p>
            </div>

            {/* AI Call notice */}
            <div className="bg-slate-900 text-white rounded-2xl p-3.5 text-left border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5" />
                  {t('এআই কল আসছে...', 'AI Call Initiating...')}
                </span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                {t('কিছুক্ষণের মধ্যে আমাদের এআই প্রতিনিধি আপনার মোবাইলে স্বয়ংক্রিয়ভাবে ফোন করে ডেলিভারি কনফার্ম করবে।', 'Our AI voice agent will call your phone shortly to confirm delivery details.')}
              </p>
            </div>

            {/* ONE CLICK WHATSAPP MESSAGE BUTTON */}
            <div className="space-y-2 pt-1">
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                  `আসসালামু আলাইকুম BuyOne BD,\nআমার নতুন অর্ডার আইডি: #${placedOrder.id}\nগ্রাহকের নাম: ${placedOrder.customer.name}\nমোবাইল: ${placedOrder.customer.phone}\nমোট বিল: ৳${placedOrder.pricing.total} (${placedOrder.payment.method.toUpperCase()})\nঠিকানা: ${placedOrder.customer.address}, ${placedOrder.customer.district}\n\nঅনুগ্রহ করে অর্ডারটি দ্রুত পাঠিয়ে দিন। ধন্যবাদ!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white/20" />
                <span>{t('হোয়াটসঅ্যাপে অর্ডার মেমো নিন', 'Get WhatsApp Order Memo')}</span>
              </a>

              <button
                onClick={() => {
                  setTrackingSearchQuery(placedOrder.id);
                  setActiveView('tracking');
                  closeOneClickCheckout();
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Truck className="w-4 h-4 text-rose-600" />
                <span>{t('রিয়েল-টাইম পার্সেল ট্র্যাক করুন', 'Track Live Parcel Status')}</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= ORDER ENTRY FORM ================= */
          <form onSubmit={handlePlaceOrder} className="p-3.5 sm:p-5 overflow-y-auto space-y-4 text-slate-800 text-xs">
            {/* Order Items Preview */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-rose-600" />
                {t('অর্ডার বিবরণ (পণ্য তালিকা)', 'Order Items Summary')}
              </h4>

              {isSingleProduct && checkoutProduct ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={checkoutProduct.images[0]}
                      alt={checkoutProduct.title}
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs text-slate-900 truncate">
                        {lang === 'bn' ? checkoutProduct.titleBn : checkoutProduct.title}
                      </h5>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-bold text-rose-600 text-xs sm:text-sm">৳ {checkoutProduct.price.toLocaleString()}</span>
                        {checkoutProduct.originalPrice > checkoutProduct.price && (
                          <span className="line-through text-slate-400 text-[10px]">৳ {checkoutProduct.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="px-2.5 py-1 text-xs font-bold text-slate-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200/60 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={item.product.images[0]} className="w-7 h-7 rounded-md object-cover shrink-0" />
                        <span className="font-medium text-slate-800 truncate max-w-[170px]">
                          {lang === 'bn' ? item.product.titleBn : item.product.title}
                        </span>
                        <span className="text-slate-400">x{item.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">৳ {(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-rose-600" />
                {t('ডেলিভারি ঠিকানা ও তথ্য', 'Shipping Information')}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('আপনার নাম *', 'Full Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('যেমন: তানভীর আহমেদ', 'e.g. Tanvir Ahmed')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-200 focus:outline-none"
                  />
                  {errors.name && <p className="text-[10px] text-rose-500 mt-0.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('মোবাইল নম্বর (১১ ডিজিট) *', 'Phone Number (11 Digits) *')}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-rose-200 focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-2 text-[9px] font-bold text-slate-400 bg-slate-100 px-1 py-0.5 rounded">
                      BD +880
                    </span>
                  </div>
                  {errors.phone && <p className="text-[10px] text-rose-500 mt-0.5">{errors.phone}</p>}
                </div>
              </div>

              {/* District & Thana */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('জেলা নির্বাচন করুন *', 'Select District *')}
                  </label>
                  <select
                    value={selectedDistrictName}
                    onChange={(e) => setSelectedDistrictName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-200 focus:outline-none bg-white font-medium"
                  >
                    {BD_DISTRICTS.map((dist) => (
                      <option key={dist.name} value={dist.name}>
                        {lang === 'bn' ? dist.nameBn : dist.name} ({dist.zone === 'dhaka_inside' ? 'ঢাকা সিটি' : dist.zone === 'dhaka_sub' ? 'ঢাকা উপশহর' : 'ঢাকার বাইরে'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('থানা / উপজেলা *', 'Thana / Upazila *')}
                  </label>
                  {currentDistrictObj.thanas.length > 0 ? (
                    <select
                      value={thana}
                      onChange={(e) => setThana(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-200 focus:outline-none bg-white font-medium"
                    >
                      {currentDistrictObj.thanas.map((th) => (
                        <option key={th} value={th}>{th}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={thana}
                      onChange={(e) => setThana(e.target.value)}
                      placeholder="থানা / এলাকার নাম"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  )}
                </div>
              </div>

              {/* Detailed Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t('সম্পূর্ণ ঠিকানা (বাসা নং, রোড নং, এলাকা) *', 'Full Delivery Address *')}
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder={t('যেমন: বাড়ি # ১২, রোড # ৪, ব্লক সি, বনানী', 'e.g. House # 12, Road # 4, Block C')}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-200 focus:outline-none"
                />
                {errors.address && <p className="text-[10px] text-rose-500 mt-0.5">{errors.address}</p>}
              </div>
            </div>

            {/* Temu-Style Coupon Code Box */}
            <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  {t('ডিসকাউন্ট কুপন ভাউচার (Coupon Code):', 'Discount Coupon Code:')}
                </span>
                {appliedCoupon && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full">
                    ✓ {appliedCoupon.label}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={t('যেমন: WELCOME100 বা FREESHIP', 'e.g. WELCOME100 or FREESHIP')}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
                >
                  {t('প্রয়োগ করুন', 'Apply')}
                </button>
              </div>
              {(settings.promoCoupons || []).filter((c) => c.active !== false).length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-amber-800 font-semibold">{t('সক্রিয় কোড:', 'Active:')}</span>
                  {(settings.promoCoupons || []).filter((c) => c.active !== false).slice(0, 4).map((cpn) => (
                    <button
                      key={cpn.id}
                      type="button"
                      onClick={() => handleApplyCoupon(cpn.code)}
                      className="px-2 py-0.5 rounded-md bg-white border border-amber-300 hover:border-amber-500 text-[10px] font-mono font-bold text-amber-900 cursor-pointer"
                    >
                      {cpn.code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                {t('পেমেন্ট পদ্ধতি', 'Payment Method')}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* COD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === 'cod' ? 'border-rose-500 bg-rose-50 ring-1 ring-rose-500' : 'border-slate-200 bg-white'
                  }`}
                >
                  <span className="text-sm">💵</span>
                  <div className="mt-1">
                    <p className="text-[11px] font-bold text-slate-900">{t('ক্যাশ অন ডেলিভারি', 'COD')}</p>
                    <p className="text-[9px] text-slate-500">{t('হাতে পেয়ে টাকা', 'Pay on delivery')}</p>
                  </div>
                </button>

                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-500' : 'border-slate-200 bg-white'
                  }`}
                >
                  <span className="font-extrabold text-pink-600 text-[11px]">bKash বিকাশ</span>
                  <div className="mt-1">
                    <p className="text-[11px] font-bold text-slate-900">{t('বিকাশ পেমেন্ট', 'bKash')}</p>
                    <p className="text-[9px] text-slate-500">{t('Send Money', 'Instant Pay')}</p>
                  </div>
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-slate-200 bg-white'
                  }`}
                >
                  <span className="font-extrabold text-orange-600 text-[11px]">Nagad নগদ</span>
                  <div className="mt-1">
                    <p className="text-[11px] font-bold text-slate-900">{t('নগদ পেমেন্ট', 'Nagad')}</p>
                    <p className="text-[9px] text-slate-500">{t('Send Money', 'Instant Pay')}</p>
                  </div>
                </button>

                {/* Rocket */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('rocket')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMethod === 'rocket' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-200 bg-white'
                  }`}
                >
                  <span className="font-extrabold text-purple-600 text-[11px]">Rocket রকেট</span>
                  <div className="mt-1">
                    <p className="text-[11px] font-bold text-slate-900">{t('রকেট মোবাইল', 'Rocket')}</p>
                    <p className="text-[9px] text-slate-500">{t('DBBL', 'Fast Pay')}</p>
                  </div>
                </button>
              </div>

              {/* bKash / Nagad / Rocket Payment Details */}
              {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && (
                <div className="bg-slate-900 text-white rounded-2xl p-3 space-y-2 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-300 font-bold uppercase">
                      {paymentMethod.toUpperCase()} {t('মার্চেন্ট নম্বর:', 'Number:')}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          paymentMethod === 'bkash'
                            ? settings.paymentSettings.bkashMerchant
                            : paymentMethod === 'nagad'
                            ? settings.paymentSettings.nagadMerchant
                            : settings.paymentSettings.rocketMerchant
                        )
                      }
                      className="flex items-center gap-1 text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedNumber ? t('কপি হয়েছে!', 'Copied!') : t('কপি করুন', 'Copy')}
                    </button>
                  </div>

                  <div className="font-mono text-emerald-300 font-bold tracking-widest text-sm bg-black/40 px-3 py-1.5 rounded-lg">
                    {paymentMethod === 'bkash'
                      ? settings.paymentSettings.bkashMerchant
                      : paymentMethod === 'nagad'
                      ? settings.paymentSettings.nagadMerchant
                      : settings.paymentSettings.rocketMerchant}
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      placeholder={t('ট্রানজেকশন আইডি (TrxID) লিখুন...', 'Enter TrxID...')}
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs uppercase"
                    />
                    {errors.trxId && <p className="text-[10px] text-rose-400 mt-0.5">{errors.trxId}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Gift Wallet deduction toggle */}
            {customerWalletBalance > 0 && (
              <label className="flex items-center justify-between gap-2 p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 cursor-pointer transition-colors hover:bg-emerald-50 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={useWallet}
                    onChange={(e) => setUseWallet(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{t('গিফট ওয়ালেট ব্যালেন্স ব্যবহার করুন', 'Use Gift Wallet Balance')}</span>
                    </span>
                    <p className="text-[10px] text-slate-600 tabular-nums mt-0.5">
                      {t(`বর্তমান ব্যালেন্স: ৳ ${customerWalletBalance.toLocaleString()}`, `Available Balance: ৳ ${customerWalletBalance.toLocaleString()}`)}
                    </p>
                  </div>
                </div>
                {useWallet && (
                  <span className="font-mono tabular-nums font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                    - ৳ {walletDeduction.toLocaleString()}
                  </span>
                )}
              </label>
            )}

            {/* Price Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5 text-xs tabular-nums">
              <div className="flex justify-between text-slate-600">
                <span>{t('পণ্যের মূল্য:', 'Subtotal:')}</span>
                <span className="font-semibold text-slate-900">৳ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('ডেলিভারি চার্জ:', 'Delivery Charge:')}</span>
                <span className="font-semibold text-slate-900">
                  {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">{t('ফ্রি ডেলিভারি', 'Free Delivery')}</span> : `৳ ${deliveryFee}`}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>{t('কুপন ডিসকাউন্ট:', 'Coupon Discount:')}</span>
                  <span>- ৳ {discountAmount.toLocaleString()}</span>
                </div>
              )}

              {walletDeduction > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>{t('ওয়ালেট ডিসকাউন্ট:', 'Wallet Discount:')}</span>
                  <span>- ৳ {walletDeduction.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-slate-300 pt-1.5 flex justify-between items-baseline font-bold">
                <span className="text-slate-900 text-xs sm:text-sm">{t('সর্বমোট প্রদেয় বিল:', 'Grand Total:')}</span>
                <span className="text-base sm:text-lg font-black text-emerald-600 tabular-nums">
                  ৳ {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submission Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-emerald-100 shrink-0" />
              <span className="text-xs sm:text-sm tabular-nums">
                {isSubmitting ? t('অর্ডার গ্রহণ করা হচ্ছে...', 'Processing Order...') : t(`অর্ডার কনফার্ম করুন (৳ ${grandTotal.toLocaleString()})`, `Confirm Order (৳ ${grandTotal.toLocaleString()})`)}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
