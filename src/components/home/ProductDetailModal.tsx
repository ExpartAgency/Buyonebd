import React, { useState, useRef } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Share2,
  Video,
  ZoomIn,
  MessageSquare,
  Send,
  UserCheck,
  Bell,
  ArrowRight
} from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const {
    openOneClickCheckout,
    addToCart,
    settings,
    lang,
    t,
    addToast,
    reviews,
    addProductReview,
    addPriceAlert
  } = useStore();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'video' | 'reviews' | 'alert'>('details');

  // Interactive Zoom State
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Review Form State
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Price Alert State (Req 17)
  const [alertContact, setAlertContact] = useState('');
  const [targetPrice, setTargetPrice] = useState<number>(() =>
    product ? Math.round(product.price * 0.85) : 0
  );
  const [isAlertSubmitting, setIsAlertSubmitting] = useState(false);

  if (!product) return null;

  const activeColor = selectedColor || product.colors?.[0] || '';
  const activeSize = selectedSize || product.sizes?.[0] || '';
  const productReviews = reviews.filter((r) => r.productId === product.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPosition({ x, y });
  };

  const handleOrderNow = () => {
    onClose();
    openOneClickCheckout(product);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, activeColor, activeSize);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    addToast(
      'info',
      t('লিংক কপি হয়েছে!', 'Link Copied!'),
      t('পণ্যের লিংকটি ক্লিপবোর্ডে কপি করা হয়েছে।', 'Product URL copied to clipboard.')
    );
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    setIsSubmittingReview(true);
    setTimeout(() => {
      addProductReview({
        productId: product.id,
        customerName: reviewName,
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewName('');
      setReviewComment('');
      setReviewRating(5);
      setIsSubmittingReview(false);
      addToast(
        'success',
        t('রিভিউ গ্রহণ করা হয়েছে!', 'Review Submitted!'),
        t('আপনার মূল্যবান মতামতের জন্য ধন্যবাদ।', 'Thank you for your feedback!')
      );
    }, 300);
  };

  const handlePriceAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertContact.trim() || targetPrice <= 0) return;
    setIsAlertSubmitting(true);
    setTimeout(() => {
      addPriceAlert({
        productId: product.id,
        contact: alertContact.trim(),
        targetPrice
      });
      setIsAlertSubmitting(false);
      setAlertContact('');
      setActiveTab('details');
    }, 300);
  };

  // Convert youtube watch URL to embed URL if needed
  const getEmbedVideoUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/embed/')) return url;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    return url;
  };

  const embedUrl = getEmbedVideoUrl(product.videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Top close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full cursor-pointer transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Tabs */}
        <div className="flex items-center px-6 pt-4 border-b border-slate-100 dark:border-slate-800 gap-4 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 border-b-2 transition-colors shrink-0 ${
              activeTab === 'details'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('পণ্যের বিবরণ', 'Product Details')}
          </button>
          {embedUrl && (
            <button
              onClick={() => setActiveTab('video')}
              className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'video'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Video className="w-4 h-4 text-rose-500" />
              <span>{t('ভিডিও ডেমো', 'Video Demo')}</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-500" />
            <span>{t('গ্রাহকদের রিভিউ', 'Customer Reviews')} ({productReviews.length})</span>
          </button>
          {/* Req 17: Price Alert Tab */}
          <button
            onClick={() => setActiveTab('alert')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'alert'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('প্রাইস অ্যালার্ট', 'Price Alert')}</span>
          </button>
        </div>

        {/* Tab 1: Product Details */}
        {activeTab === 'details' && (
          <div className="p-5 sm:p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Left: Interactive Zoom Image & Thumbs */}
            <div className="space-y-3">
              {/* Main Image with Zoom on Hover/Click */}
              <div
                ref={imageContainerRef}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setIsZoomed(!isZoomed)}
                className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-crosshair group select-none"
              >
                <img
                  src={product.images[selectedImageIdx] || product.images[0]}
                  alt={product.title}
                  className={`w-full h-full object-cover transition-transform duration-200 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                  style={
                    isZoomed
                      ? {
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                        }
                      : undefined
                  }
                />

                {/* Zoom Hint Icon */}
                <div className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 pointer-events-none opacity-80 group-hover:opacity-100">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>{isZoomed ? t('জুম সক্রিয়', 'Zoomed') : t('জুম দেখতে হোভার করুন', 'Hover to zoom')}</span>
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedImageIdx(i);
                        setIsZoomed(false);
                      }}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        selectedImageIdx === i
                          ? 'border-emerald-600 ring-2 ring-emerald-200 dark:ring-emerald-900'
                          : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Delivery and Guarantee details */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {t(
                      `ডেলিভারি চার্জ: ঢাকা সিটি ৳${settings.deliveryFees.dhakaInside} | সারাদেশে ৳${settings.deliveryFees.dhakaOutside}`,
                      `Delivery: Dhaka ৳${settings.deliveryFees.dhakaInside} | Nationwide ৳${settings.deliveryFees.dhakaOutside}`
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {t(
                      product.warrantyInfoBn || '১০০% আসল প্রোডাক্ট ও রিপ্লেসমেন্ট সুবিধা',
                      product.warrantyInfo || '100% Genuine product with replacement guarantee'
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{t('৭ দিনের সহজ রিটার্ন পলিসি', '7 Days easy return policy')}</span>
                </div>
              </div>
            </div>

            {/* Right: Info & Actions */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {lang === 'bn' ? product.categoryBn : product.category}
                  </span>
                  <span className="font-mono font-semibold">SKU: {product.sku}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {lang === 'bn' ? product.titleBn : product.title}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{product.rating}</span>
                  <span className="text-xs text-slate-400">({product.reviewsCount} {t('রিভিউ', 'reviews')})</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ৳ {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-slate-400 line-through">
                      ৳ {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full">
                    {t('ক্যাশ অন ডেলিভারি', 'Cash on Delivery')}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                  {lang === 'bn' ? product.descriptionBn : product.description}
                </p>

                {/* Bullet Features */}
                {((lang === 'bn' && product.featuresBn) || product.features) && (
                  <div className="mt-3 space-y-1">
                    {((lang === 'bn' && product.featuresBn) || product.features)?.map((feat, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Colors selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      {t('কালার নির্বাচন করুন:', 'Select Color:')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            activeColor === c
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-200'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      {t('সাইজ নির্বাচন করুন:', 'Select Size:')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            activeSize === s
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-200'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('পরিমাণ:', 'Quantity:')}</span>
                  <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-xs font-bold text-slate-900 dark:text-white">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleOrderNow}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3.5 px-4 rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>{t('এখনই অর্ডার করুন', 'Order Now')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleAddToCart}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t('কার্টে রাখুন', 'Add to Cart')}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('alert')}
                    className="bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                  >
                    <Bell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('প্রাইস অ্যালার্ট', 'Price Alert')}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{t('শেয়ার', 'Share')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Video Demo Embed */}
        {activeTab === 'video' && embedUrl && (
          <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-black">
              <iframe
                src={embedUrl}
                title={product.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-4 text-center">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === 'bn' ? product.titleBn : product.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{t('ভিডিও ডেমো ও আনবক্সিং রিভিউ', 'Video demonstration & unboxing review')}</p>
            </div>
          </div>
        )}

        {/* Tab 3: Customer Reviews */}
        {activeTab === 'reviews' && (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            {/* Reviews List */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {t('গ্রাহকদের বাস্তব অভিজ্ঞতা ও রিভিউ', 'Customer Reviews & Feedback')}
              </h4>

              {productReviews.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">{t('এই পণ্যে এখনো কোনো রিভিউ নেই। আপনি প্রথম রিভিউ দিন!', 'No reviews yet for this product. Be the first to review!')}</p>
              ) : (
                <div className="space-y-3">
                  {productReviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{rev.customerName}</span>
                          {rev.verifiedPurchase && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <UserCheck className="w-3 h-3" />
                              {t('ভেরিফাইড ক্রেতা', 'Verified Buyer')}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{rev.date}</span>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                        ))}
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Review Form */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                {t('আপনার রিভিউ ও রেটিং দিন', 'Write a Review')}
              </h5>
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{t('রেটিং:', 'Rating:')}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="text-amber-400 p-0.5"
                      >
                        <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  required
                  placeholder={t('আপনার নাম', 'Your Full Name')}
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400"
                />

                <textarea
                  required
                  rows={2}
                  placeholder={t('পণ্যটি কেমন লেগেছে বিস্তারিত লিখুন...', 'Share your detailed experience with this product...')}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400"
                />

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('রিভিউ জমা দিন', 'Submit Review')}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 4: Price Drop Alert Form (Req 17) */}
        {activeTab === 'alert' && (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-5 max-w-lg mx-auto w-full">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {t('মূল্য কমার নোটিফিকেশন সেট করুন', 'Set Price Drop Alert')}
              </h4>
              <p className="text-xs text-slate-500">
                {t(
                  'পণ্যটির বর্তমান মূল্য ৳' + product.price.toLocaleString() + '। মূল্য কমলেই আপনাকে এসএমএস বা ইমেইলে জানিয়ে দেওয়া হবে।',
                  'Current price is ৳' + product.price.toLocaleString() + '. We will notify you immediately when the price drops.'
                )}
              </p>
            </div>

            <form onSubmit={handlePriceAlertSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('আপনার ফোন নাম্বার অথবা ইমেইল *', 'Your Phone Number or Email *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="017XXXXXXXX or you@gmail.com"
                  value={alertContact}
                  onChange={(e) => setAlertContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('টার্গেট মূল্য (৳)', 'Target Alert Price (BDT)')}
                </label>
                <input
                  type="number"
                  required
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-emerald-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {t(
                    `মূল্য ৳${targetPrice.toLocaleString()} বা তার নিচে নামলেই তাৎক্ষণিক অ্যালার্ট পাঠানো হবে।`,
                    `Alert will trigger when price drops to ৳${targetPrice.toLocaleString()} or lower.`
                  )}
                </p>
              </div>

              <button
                type="submit"
                disabled={isAlertSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Bell className="w-4 h-4" />
                <span>{isAlertSubmitting ? t('অ্যালার্ট সংরক্ষিত হচ্ছে...', 'Saving Alert...') : t('প্রাইস অ্যালার্ট চালু করুন', 'Activate Price Alert')}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
