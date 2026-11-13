import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Zap,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Bell,
  Heart,
  Share2,
  Check,
  Clock,
  Sparkles,
  PhoneCall,
  Send,
  ZoomIn
} from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';

interface SingleProductViewProps {
  product: Product;
  onBack: () => void;
}

export const SingleProductView: React.FC<SingleProductViewProps> = ({ product, onBack }) => {
  const {
    openOneClickCheckout,
    addToCart,
    toggleWishlist,
    isWishlisted,
    addPriceAlert,
    recordProductView,
    products,
    openProductPage,
    selectCategoryFilter,
    goHome,
    lang,
    t,
    addToast
  } = useStore();

  useEffect(() => {
    recordProductView(product.id);
  }, [product.id]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertContact, setAlertContact] = useState('');
  const [alertTargetPrice, setAlertTargetPrice] = useState(
    Math.round(product.price * 0.9)
  );

  // Interactive Zoom State
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleCreatePriceAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertContact.trim()) return;
    addPriceAlert({
      productId: product.id,
      contact: alertContact.trim(),
      targetPrice: alertTargetPrice
    });
    setIsAlertOpen(false);
    addToast(
      'success',
      t('মূল্য কমার নোটিফিকেশন সেট হয়েছে!', 'Price Alert Set!'),
      t(
        `দাম ৳${alertTargetPrice} বা তার নিচে নামলে ${alertContact} এ জানানো হবে।`,
        `We will notify you at ${alertContact} when price drops to ৳${alertTargetPrice}!`
      )
    );
  };

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-8 animate-fade-in">
      {/* Top Breadcrumb & Back Button */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('শপে ফিরে যান', 'Back to Store')}</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-xs">
          <button type="button" onClick={goHome} className="hover:text-emerald-600 cursor-pointer">
            {t('হোম', 'Home')}
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => selectCategoryFilter(product.category)}
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
          >
            {lang === 'bn' ? product.categoryBn : product.category}
          </button>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300 font-bold line-clamp-1 max-w-[200px]">
            {lang === 'bn' ? product.titleBn : product.title}
          </span>
        </div>
      </div>

      {/* Main Single Product Layout */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 lg:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT 6 COLS: Interactive Gallery with Zoom */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Image Viewer with Interactive Zoom */}
            <div
              className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 cursor-crosshair select-none group"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.title}
                className={`w-full h-full object-cover transition-transform duration-200 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                      }
                    : undefined
                }
              />

              {/* Discount Tag */}
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-lg">
                  -{discountPercent}% {t('ছাড়', 'OFF')}
                </span>
              )}

              {/* Zoom hint badge */}
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 opacity-80 group-hover:opacity-100 pointer-events-none transition-opacity">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>{t('জুম করতে মাউস ঘুরান', 'Hover to zoom')}</span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT 6 COLS: Product Details & Purchase Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category, Rating, Stock */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {lang === 'bn' ? product.categoryBn : product.category}
                </span>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-slate-400 font-normal">({product.reviewsCount || 48} {t('রিভিউ', 'reviews')})</span>
                  </div>

                  <span className="text-slate-400">•</span>

                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {t(`স্টক ইন (${product.stock} টি)`, `In Stock (${product.stock})`)}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-snug">
                {lang === 'bn' ? product.titleBn : product.title}
              </h1>

              {/* Pricing Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-base text-slate-400 line-through">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black px-2.5 py-0.5 rounded-lg border border-rose-500/20">
                    {t(`আপনি বাচাঁচ্ছেন ৳${product.originalPrice - product.price}`, `Save ৳${product.originalPrice - product.price}`)}
                  </span>
                )}
              </div>

              {/* Variants: Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {t('রং পছন্দ করুন:', 'Select Color:')}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          selectedColor === c
                            ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-600 dark:border-emerald-600 shadow'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Variants: Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {t('সাইজ পছন্দ করুন:', 'Select Size:')}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          selectedSize === s
                            ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-600 dark:border-emerald-600 shadow'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {t('পরিমাণ:', 'Quantity:')}
                </span>
                <div className="inline-flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-black text-xs font-mono text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                    className="px-3.5 py-2 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* CTAs: 1-Click Order & Add to Cart */}
            <div className="space-y-3 pt-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => openOneClickCheckout(product)}
                  className="w-full sm:flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                  <span>{t('অর্ডার করুন (ক্যাশ অন ডেলিভারি)', 'Order Now (Cash on Delivery)')}</span>
                </button>

                <button
                  onClick={() => {
                    addToCart(product, quantity, selectedColor, selectedSize);
                    addToast('success', t('কার্টে যোগ হয়েছে!', 'Added to Cart!'), product.title);
                  }}
                  className="w-full sm:w-auto py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-slate-700 shadow flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95"
                >
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <span>{t('কার্টে যোগ করুন', 'Add to Cart')}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isWishlisted(product.id)
                      ? 'bg-rose-50 border-rose-300 text-rose-600'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600'
                  }`}
                  title={t('পছন্দ তালিকা', 'Wishlist')}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted(product.id) ? 'fill-rose-600' : ''}`} />
                </button>
              </div>

              {/* Set Price Drop Alert (Req 11: "মূল্য কমার নোটিফিকেশন সেট করুন") */}
              <div className="pt-2">
                {!isAlertOpen ? (
                  <button
                    onClick={() => setIsAlertOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-dashed border-emerald-500/60 hover:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('মূল্য কমার নোটিফিকেশন সেট করুন', 'Set Price Drop Alert Notification')}</span>
                  </button>
                ) : (
                  <form
                    onSubmit={handleCreatePriceAlert}
                    className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-3 animate-fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-emerald-600" />
                        {t('মূল্য কমার নোটিফিকেশন সেট করুন', 'Price Drop Alert')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAlertOpen(false)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          {t('আপনার হোয়াটসঅ্যাপ / ফোন নম্বর', 'Your WhatsApp / Phone')}
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="01886-XXXXXX"
                          value={alertContact}
                          onChange={(e) => setAlertContact(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          {t('কাঙ্ক্ষিত দাম (৳)', 'Target Price (৳)')}
                        </label>
                        <input
                          type="number"
                          required
                          value={alertTargetPrice}
                          onChange={(e) => setAlertTargetPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('অ্যালার্ট সেভ করুন', 'Save Price Alert')}</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Service Badges */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{t('সারাদেশে হোম ডেলিভারি', 'Nationwide Delivery')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{t('১০০% আসল পণ্য', '100% Authentic')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{t('সহজ রিটার্ন পলিসি', 'Easy Returns')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Description & Features */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {t('পণ্যের বিস্তারিত বিবরণ ও বৈশিষ্ট্য', 'Product Description & Key Features')}
          </h2>

          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {lang === 'bn' ? product.descriptionBn : product.description}
          </p>

          {/* Key Features List */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                {t('প্রধান বৈশিষ্ট্যসমূহ:', 'Key Highlights:')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Rail */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {t('সম্পর্কিত অন্যান্য পণ্য', 'Related Products')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onViewDetails={(rel) => openProductPage(rel)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
