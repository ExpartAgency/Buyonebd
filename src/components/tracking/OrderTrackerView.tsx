import React, { useState } from 'react';
import {
  Search,
  Package,
  Truck,
  MapPin,
  Phone,
  MessageSquare,
  ArrowLeft,
  Printer,
  User
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';

export const OrderTrackerView: React.FC = () => {
  const {
    orders,
    trackingSearchQuery,
    setActiveView,
    setIsWhatsAppOpen,
    startAICall,
    addToast,
    lang,
    t
  } = useStore();

  const [query, setQuery] = useState(trackingSearchQuery || 'BD-98241');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(() => {
    if (trackingSearchQuery) {
      const found = orders.find(
        (o) =>
          o.id.toUpperCase() === trackingSearchQuery.toUpperCase() ||
          o.customer.phone.includes(trackingSearchQuery) ||
          o.courier.trackingCode.toUpperCase() === trackingSearchQuery.toUpperCase()
      );
      if (found) return found;
    }
    return orders[0] || null;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().toUpperCase();
    if (!clean) return;

    const cleanDigits = query.replace(/[^0-9]/g, '');
    const matched = orders.find(
      (o) =>
        o.id.toUpperCase() === clean ||
        (cleanDigits.length >= 4 && o.customer.phone.replace(/[^0-9]/g, '').includes(cleanDigits)) ||
        o.courier.trackingCode.toUpperCase() === clean
    );

    if (matched) {
      setSelectedOrder(matched);
    } else {
      addToast(
        'warning',
        t('অর্ডার পাওয়া যায়নি', 'Order Not Found'),
        t(
          'এই নম্বরে কোনো অর্ডার খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক অর্ডার আইডি বা মোবাইল নম্বর দিন।',
          'No order found with this ID or phone number.'
        )
      );
    }
  };

  const getStepProgress = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 1;
      case 'ai_confirmed': return 2;
      case 'processing': return 3;
      case 'shipped': return 4;
      case 'delivered': return 5;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  const currentStep = selectedOrder ? getStepProgress(selectedOrder.status) : 1;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5 w-full overflow-hidden">
      {/* Top back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <button
            onClick={() => setActiveView('store')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors mb-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('স্টোরফ্রন্টে ফিরে যান', 'Back to Store')}
          </button>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('রিয়েল-টাইম অর্ডার ও পার্সেল ট্র্যাকিং', 'Real-Time Order & Parcel Tracker')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('আপনার অর্ডার আইডি (যেমন BD-98241) বা মোবাইল নম্বর দিয়ে পার্সেল ট্র্যাক করুন', 'Enter Order ID or phone number to see live status')}
          </p>
        </div>

        {selectedOrder && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all w-fit shrink-0"
          >
            <Printer className="w-4 h-4" />
            {t('চালান প্রিন্ট করুন', 'Print Invoice')}
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('অর্ডার আইডি (যেমন BD-98241) বা ফোন নম্বর লিখুন...', 'Enter Order ID (e.g. BD-98241) or phone number...')}
              className="w-full pl-10 sm:pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer shrink-0"
          >
            {t('ট্র্যাক করুন', 'Track Order')}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] sm:text-xs text-slate-500">
          <span>{t('স্যাম্পল অর্ডার:', 'Sample orders:')}</span>
          {orders.slice(0, 3).map((o) => (
            <button
              key={o.id}
              onClick={() => {
                setQuery(o.id);
                setSelectedOrder(o);
              }}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 rounded-lg font-mono text-[11px] font-semibold transition-colors cursor-pointer"
            >
              #{o.id} ({o.customer.name.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Tracking Details View */}
      {selectedOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-w-0">
          {/* Main Status & Timeline */}
          <div className="lg:col-span-2 space-y-5 min-w-0">
            {/* Status Card Header */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t('অর্ডার নম্বর', 'Order Number')}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                      #{selectedOrder.id}
                    </h2>
                    <span
                      className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        selectedOrder.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-700'
                          : selectedOrder.status === 'shipped'
                          ? 'bg-blue-100 text-blue-700'
                          : selectedOrder.status === 'ai_confirmed'
                          ? 'bg-purple-100 text-purple-700'
                          : selectedOrder.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {selectedOrder.status === 'ai_confirmed'
                        ? t('এআই কল ভেরিফাইড', 'AI Verified')
                        : selectedOrder.status === 'shipped'
                        ? t('কুরিয়ার ট্রানজিটে', 'In Transit')
                        : selectedOrder.status === 'delivered'
                        ? t('ডেলিভারি সম্পন্ন', 'Delivered')
                        : selectedOrder.status === 'cancelled'
                        ? t('বাতিলকৃত', 'Cancelled')
                        : t('অপেক্ষমান', 'Pending')}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t('সম্ভাব্য ডেলিভারি', 'Estimated Delivery')}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-emerald-600 mt-0.5">
                    {selectedOrder.courier.estimatedDelivery}
                  </p>
                </div>
              </div>

              {/* Mobile-Responsive 5-Step Progress Milestones */}
              <div className="mt-6 mb-3">
                <div className="grid grid-cols-5 gap-1 relative">
                  <div className="absolute top-3.5 sm:top-4 left-4 sm:left-6 right-4 sm:right-6 h-1 bg-slate-200 dark:bg-slate-800 -z-0">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, ((currentStep - 1) / 4) * 100))}%` }}
                    />
                  </div>

                  {[
                    { step: 1, bn: 'অর্ডার', en: 'Placed' },
                    { step: 2, bn: 'এআই কল', en: 'AI Call' },
                    { step: 3, bn: 'প্যাকড', en: 'Packed' },
                    { step: 4, bn: 'ট্রানজিট', en: 'Transit' },
                    { step: 5, bn: 'ডেলিভার্ড', en: 'Delivered' }
                  ].map((s) => (
                    <div key={s.step} className="flex flex-col items-center text-center relative z-10 min-w-0">
                      <div
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs transition-colors ${
                          currentStep >= s.step
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {currentStep >= s.step ? '✓' : s.step}
                      </div>
                      <span className="text-[9px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1.5 leading-tight break-words px-0.5">
                        {t(s.bn, s.en)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Call Status Banner */}
              <div className="mt-5 bg-slate-900 text-white rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    🤖
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 flex flex-wrap items-center gap-1.5">
                      <span>{t('অটোমেটেড এআই ভয়েস কল হিস্টোরি', 'Automated AI Voice Call Status')}</span>
                      {selectedOrder.aiCallStatus.called && (
                        <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                          {t('সম্পন্ন', 'Done')}
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 break-words">
                      {selectedOrder.aiCallStatus.called
                        ? t(
                            `এআই কল সময়: ${selectedOrder.aiCallStatus.callTimestamp || 'আজ'} | কাস্টমার নিশ্চিতকৃত`,
                            `Call logged: ${selectedOrder.aiCallStatus.callTimestamp} | Customer verified`
                          )
                        : t('অর্ডারটি এখনো এআই কলের অপেক্ষায় রয়েছে।', 'Awaiting automated AI confirmation call.')}
                    </p>
                  </div>
                </div>

                {!selectedOrder.aiCallStatus.called && (
                  <button
                    onClick={() => startAICall(selectedOrder)}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer transition-colors shrink-0 w-full sm:w-auto"
                  >
                    {t('এখনই কল করুন (টেস্ট)', 'Call Now (Test)')}
                  </button>
                )}
              </div>
            </div>

            {/* Courier Dispatch & Timeline Details */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('কুরিয়ার ট্র্যাকিং ও লোকেশন হিস্টোরি', 'Live Courier Tracking Updates')}</span>
                </h3>
                <span className="font-mono text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 break-all">
                  {selectedOrder.courier.provider}: {selectedOrder.courier.trackingCode}
                </span>
              </div>

              {selectedOrder.courier.riderName && (
                <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {t('ডেলিভারি রাইডার:', 'Delivery Rider:')} {selectedOrder.courier.riderName}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                        {t('কুরিয়ার হাব:', 'Hub:')} {selectedOrder.courier.currentLocation}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`tel:${selectedOrder.courier.riderPhone}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-white dark:bg-slate-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 px-3 py-1.5 rounded-xl shadow-sm hover:bg-emerald-100 transition-colors shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedOrder.courier.riderPhone}</span>
                  </a>
                </div>
              )}

              {/* History list */}
              <div className="space-y-4 relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
                {selectedOrder.courier.history.map((h, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white dark:border-slate-900 ring-2 ring-emerald-200 dark:ring-emerald-900" />
                    <div>
                      <div className="flex flex-wrap items-baseline justify-between gap-1">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">{h.status}</h5>
                        <span className="text-[10px] text-slate-400 font-medium">{h.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 break-words">{h.note}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{h.location}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Customer Info & Ordered Items Summary */}
          <div className="space-y-5 min-w-0">
            {/* Customer Details */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3 min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2.5">
                {t('ডেলিভারি গ্রহীতার তথ্য', 'Customer Details')}
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">{t('নাম:', 'Name:')}</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 break-words">{selectedOrder.customer.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">{t('মোবাইল নম্বর:', 'Phone:')}</span>
                  <p className="font-bold font-mono text-slate-800 dark:text-slate-200">{selectedOrder.customer.phone}</p>
                </div>
                <div>
                  <span className="text-slate-400">{t('ঠিকানা:', 'Address:')}</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 break-words">
                    {selectedOrder.customer.address}, {selectedOrder.customer.thana}, {selectedOrder.customer.district}
                  </p>
                </div>
                {selectedOrder.customer.note && (
                  <div>
                    <span className="text-slate-400">{t('বিশেষ নোট:', 'Special Note:')}</span>
                    <p className="italic text-slate-600 dark:text-slate-400 break-words">{selectedOrder.customer.note}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items in Parcel */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3 min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2.5">
                {t('পার্সেলের পণ্যসমূহ', 'Items in Package')}
              </h3>

              <div className="space-y-2.5">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.productTitle}
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {lang === 'bn' ? item.productTitleBn : item.productTitle}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.selectedColor && `Color: ${item.selectedColor} `}
                        {item.selectedSize && `| Size: ${item.selectedSize}`}
                      </p>
                      <p className="text-xs font-bold text-emerald-600">
                        ৳ {item.price.toLocaleString()} x {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between gap-2">
                  <span>{t('পেমেন্ট পদ্ধতি:', 'Payment Method:')}</span>
                  <span className="font-bold uppercase text-slate-800 dark:text-slate-200">{selectedOrder.payment.method}</span>
                </div>
                {selectedOrder.payment.trxId && (
                  <div className="flex justify-between gap-2">
                    <span>{t('TrxID:', 'TrxID:')}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 break-all">{selectedOrder.payment.trxId}</span>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <span>{t('ডেলিভারি চার্জ:', 'Delivery Fee:')}</span>
                  <span>৳ {selectedOrder.pricing.deliveryFee}</span>
                </div>
                <div className="flex justify-between gap-2 font-bold text-sm text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2">
                  <span>{t('সর্বমোট মূল্য:', 'Grand Total:')}</span>
                  <span className="text-emerald-600">৳ {selectedOrder.pricing.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 1-Click WhatsApp Order Communication */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-4 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('১-ক্লিক হোয়াটসঅ্যাপ সার্ভিস', '1-Click WhatsApp Service')}</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-snug">
                {t('অর্ডার সংক্রান্ত যেকোনো তথ্য জানতে বা মেমো পেতে সরাসরি হোয়াটসঅ্যাপে মেসেজ দিন।', 'Get instant order status, invoices and courier rider updates on WhatsApp.')}
              </p>
              <a
                href={`https://wa.me/${selectedOrder.customer.phone.replace(/[^0-9]/g, '').startsWith('88') ? selectedOrder.customer.phone.replace(/[^0-9]/g, '') : `88${selectedOrder.customer.phone.replace(/[^0-9]/g, '')}`}?text=${encodeURIComponent(
                  `আসসালামু আলাইকুম ${selectedOrder.customer.name},\nBuyOne BD থেকে আপনার অর্ডার #${selectedOrder.id}-এর বর্তমান আপডেট:\nস্ট্যাটাস: ${selectedOrder.status.toUpperCase()}\nকুরিয়ার: ${selectedOrder.courier.provider} (${selectedOrder.courier.trackingCode})\nবর্তমান অবস্থান: ${selectedOrder.courier.currentLocation}\nমোট বিল: ৳${selectedOrder.pricing.total}\nধন্যবাদ!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-white/20 shrink-0" />
                <span>{t('গ্রাহকের হোয়াটসঅ্যাপে মেসেজ দিন', 'Send WhatsApp to Customer')}</span>
              </a>
            </div>

            {/* Need Help WhatsApp card */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-bold text-xs">{t('অর্ডারে কোনো সমস্যা?', 'Need help with this order?')}</h4>
                <p className="text-[11px] text-emerald-100 mt-0.5">{t('এআই প্রতিনিধির সাথে চ্যাট করুন', 'Chat with AI Assistant')}</p>
              </div>
              <button
                onClick={() => setIsWhatsAppOpen(true)}
                className="bg-white text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl shadow cursor-pointer hover:bg-emerald-50 transition-colors shrink-0"
              >
                {t('চ্যাট শুরু করুন', 'Live Chat')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base">{t('কোনো অর্ডার সিলেক্ট করা নেই', 'No Order Selected')}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('উপরের সার্চ বক্সে আপনার অর্ডার আইডি দিয়ে সার্চ করুন', 'Search above using Order ID or phone number')}</p>
        </div>
      )}
    </div>
  );
};
