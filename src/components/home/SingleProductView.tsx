import React, { useState, useEffect, useMemo } from 'react';
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
  Flame,
  PhoneCall,
  Send,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Award,
  PlayCircle,
  MessageSquarePlus
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
    reviews,
    addProductReview,
    settings,
    openProductPage,
    selectCategoryFilter,
    initiateCustomerBrowserCall,
    goHome,
    lang,
    t,
    addToast
  } = useStore();

  useEffect(() => {
    recordProductView(product.id);
    setSelectedImageIndex(0);
    setSelectedColor(product.colors?.[0] || '');
    setSelectedSize(product.sizes?.[0] || '');
    setQuantity(1);
    setMediaMode('images');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mediaMode, setMediaMode] = useState<'images' | 'video'>('images');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'reviews' | 'shipping'>('overview');

  // Price Drop Alert
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertContact, setAlertContact] = useState('');
  const [alertTargetPrice, setAlertTargetPrice] = useState(Math.round(product.price * 0.9));

  // New Review Composer
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState('');

  // Interactive Zoom State
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Live Flash Sale Countdown Timer computed from Admin settings.flashSale.endsAt
  const computeFlashTimeLeft = (endsAtIso?: string) => {
    const targetMs = endsAtIso ? new Date(endsAtIso).getTime() : NaN;
    const diffMs = Number.isFinite(targetMs) ? Math.max(0, targetMs - Date.now()) : 6 * 3600 * 1000;
    const totalSeconds = Math.floor(diffMs / 1000);
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60
    };
  };

  const [timeLeft, setTimeLeft] = useState(() => computeFlashTimeLeft(settings.flashSale?.endsAt));
  useEffect(() => {
    setTimeLeft(computeFlashTimeLeft(settings.flashSale?.endsAt));
    const timer = setInterval(() => {
      setTimeLeft(computeFlashTimeLeft(settings.flashSale?.endsAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.flashSale?.endsAt]);

  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'];

  const isFlashActive = Boolean(product.isFlashSale && settings?.flashSale?.enabled !== false);
  const flashStockPercent = Math.min(92, Math.max(58, 100 - Math.min(product.stock || 15, 40)));

  const productReviews = useMemo(
    () => reviews.filter((r) => r.productId === product.id && r.isApproved !== false),
    [reviews, product.id]
  );

  // Other active Flash Sale products to showcase in the Single Product Flash Sale section
  const flashSaleProducts = useMemo(() => {
    const list = products.filter((p) => p.isFlashSale && p.id !== product.id);
    return list.length > 0 ? list.slice(0, 4) : products.filter((p) => p.isFlashSale).slice(0, 4);
  }, [products, product.id]);

  // Related products from same category
  const relatedProducts = useMemo(
    () => products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4),
    [products, product.category, product.id]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleShareProduct = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      addToast(
        'success',
        t('লিংক কপি হয়েছে!', 'Product Link Copied!'),
        t('এখন যেকোনো জায়গায় শেয়ার করতে পারবেন।', 'Shareable SEO URL copied to clipboard.')
      );
    } catch {
      addToast('info', t('প্রোডাক্ট লিংক', 'Product URL'), shareUrl);
    }
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

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) return;
    addProductReview({
      productId: product.id,
      customerName: reviewerName.trim(),
      rating: reviewerRating,
      comment: reviewerComment.trim()
    });
    setReviewerName('');
    setReviewerComment('');
    setReviewerRating(5);
    setIsReviewFormOpen(false);
  };

  const youtubeEmbedUrl = useMemo(() => {
    if (!product.videoUrl) return '';
    const match = product.videoUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
  }, [product.videoUrl]);

  const unitSavings = Math.max(0, (product.originalPrice - product.price) * quantity);
  const totalPayable = product.price * quantity;
  const cms = settings.singleProductCms;
  const loyaltyEarn =
    product.loyaltyPoints !== undefined
      ? product.loyaltyPoints * quantity
      : Math.max(5, Math.floor(totalPayable / Math.max(1, cms?.pointsPerOrderDivisor || 20)));

  // Per-product delivery charge calculation (freeShipping or customDeliveryFees or store settings default)
  const organic = settings.organicMarketing;
  const isFreeShip = Boolean(product.freeShipping);
  const dhakaFee = isFreeShip ? 0 : (product.customDeliveryFees?.dhakaInside ?? settings.deliveryFees?.dhakaInside ?? 60);
  const subDhakaFee = isFreeShip ? 0 : (product.customDeliveryFees?.dhakaSub ?? settings.deliveryFees?.dhakaSub ?? 100);
  const outsideFee = isFreeShip ? 0 : (product.customDeliveryFees?.dhakaOutside ?? settings.deliveryFees?.dhakaOutside ?? 120);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-8 animate-fade-in">
      {/* Top Compact Utility Bar: Back + Breadcrumb + Copy Share */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('শপে ফিরুন', 'Back')}</span>
          </button>

          <nav className="hidden md:flex items-center gap-1.5 text-slate-400 text-xs min-w-0">
            <button type="button" onClick={goHome} className="hover:text-emerald-600 cursor-pointer">
              {t('হোম', 'Home')}
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => selectCategoryFilter(product.category, null)}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer truncate"
            >
              {lang === 'bn' ? product.categoryBn : product.category}
            </button>
            {product.subcategory && (
              <>
                <span>/</span>
                <button
                  type="button"
                  onClick={() => selectCategoryFilter(product.category, product.subcategory || null)}
                  className="hover:text-emerald-600 font-semibold cursor-pointer truncate"
                >
                  {product.subcategory}
                </button>
              </>
            )}
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300 font-semibold truncate max-w-[240px]">
              {lang === 'bn' ? product.titleBn : product.title}
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-500">
            SKU: {product.sku}{product.barcode ? ` · ${product.barcode}` : ''}
          </span>
          <button
            type="button"
            onClick={handleShareProduct}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 font-bold text-xs cursor-pointer transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('শেয়ার লিংক', 'Share')}</span>
          </button>
        </div>
      </div>

      {/* MAIN FLAGSHIP SINGLE PRODUCT SURFACE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Single-Product Dedicated Flash Sale Banner Bar (Top Edge when active) */}
        {isFlashActive && (
          <div className="bg-gradient-to-r from-slate-950 via-rose-950 to-slate-950 text-white px-4 sm:px-8 py-3.5 border-b border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-black tracking-tight text-white">
                    {t(
                      settings.flashSale?.headlineBn || 'বিশেষ ফ্ল্যাশ সেল ডিল',
                      settings.flashSale?.headlineEn || 'Limited Flash Sale Deal'
                    )}
                  </span>
                  {discountPercent > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tabular-nums">
                      -{discountPercent}% OFF
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 mt-1">
                  <div className="w-28 sm:w-36 h-1.5 rounded-full bg-white/15 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full"
                      style={{ width: `${flashStockPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-amber-300 font-bold tabular-nums">
                    {t(`মাত্র ${product.stock} টি বাকি আছে`, `Hurry! Only ${product.stock} left`)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs tabular-nums self-start sm:self-center">
              <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-[11px] text-slate-300 font-semibold">
                {t('অফার শেষ:', 'Ends in:')}
              </span>
              <div className="flex items-center gap-1 font-mono font-black">
                {timeLeft.days > 0 && (
                  <>
                    <span className="px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-white">
                      {timeLeft.days}d
                    </span>
                    <span className="text-rose-400">:</span>
                  </>
                )}
                <span className="px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-white">
                  {timeLeft.hours.toString().padStart(2, '0')}h
                </span>
                <span className="text-rose-400">:</span>
                <span className="px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-white">
                  {timeLeft.minutes.toString().padStart(2, '0')}m
                </span>
                <span className="text-rose-400">:</span>
                <span className="px-2 py-1 rounded-lg bg-rose-600 text-white">
                  {timeLeft.seconds.toString().padStart(2, '0')}s
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT 6 COLS: Interactive Editorial Gallery & Video Switcher */}
          <div className="lg:col-span-6 space-y-4">
            {/* Gallery / Video Switcher */}
            {youtubeEmbedUrl && (
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMediaMode('images')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    mediaMode === 'images'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  {t(`ছবি (${images.length})`, `Photos (${images.length})`)}
                </button>
                <button
                  type="button"
                  onClick={() => setMediaMode('video')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    mediaMode === 'video'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>{t('ভিডিও প্রিভিউ', 'Video Demo')}</span>
                </button>
              </div>
            )}

            {mediaMode === 'video' && youtubeEmbedUrl ? (
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800">
                <iframe
                  src={youtubeEmbedUrl}
                  title={product.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            ) : (
              <div
                className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 cursor-crosshair select-none group"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <img
                  src={images[selectedImageIndex] || images[0]}
                  alt={lang === 'bn' ? product.titleBn : product.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-transform duration-200 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                  style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
                />

                {/* Top Left Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                  {discountPercent > 0 && (
                    <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-md tabular-nums">
                      -{discountPercent}% {t('ছাড়', 'OFF')}
                    </span>
                  )}
                  {isFlashActive && (
                    <span className="bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span>{t('ফ্ল্যাশ ডিল', 'FLASH DEAL')}</span>
                    </span>
                  )}
                </div>

                {/* Gallery Prev/Next Buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((i) => (i - 1 + images.length) % images.length);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-md flex items-center justify-center opacity-85 hover:opacity-100 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((i) => (i + 1) % images.length);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-md flex items-center justify-center opacity-85 hover:opacity-100 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Bottom Counter & Zoom Hint */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg tabular-nums">
                    {selectedImageIndex + 1} / {images.length}
                  </span>
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>{t('জুম করতে স্পর্শ করুন', 'Hover / Tap to zoom')}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setMediaMode('images');
                      setSelectedImageIndex(idx);
                    }}
                    className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      mediaMode === 'images' && selectedImageIndex === idx
                        ? 'border-emerald-600 ring-2 ring-emerald-500/25'
                        : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT 6 COLS: Conversion Panel & Delivery Matrix */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Category, Subcategory & Verified Rating */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => selectCategoryFilter(product.category, null)}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
                  >
                    {lang === 'bn' ? product.categoryBn : product.category}
                  </button>
                  {product.subcategory && (
                    <button
                      type="button"
                      onClick={() => selectCategoryFilter(product.category, product.subcategory || null)}
                      className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg cursor-pointer hover:text-emerald-600"
                    >
                      {product.subcategory}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2.5 text-xs tabular-nums">
                  <button
                    type="button"
                    onClick={() => setActiveDetailTab('reviews')}
                    className="flex items-center gap-1 text-amber-500 font-bold cursor-pointer hover:underline"
                  >
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-slate-400 font-normal">
                      ({productReviews.length || product.reviewsCount || 24} {t('রিভিউ', 'reviews')})
                    </span>
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {product.stock > 0
                      ? t(`${cms?.inStockLabelBn || 'স্টকে আছে'} (${product.stock})`, `${cms?.inStockLabelEn || 'In Stock'} (${product.stock})`)
                      : t(cms?.outOfStockLabelBn || 'স্টক শেষ', cms?.outOfStockLabelEn || 'Out of Stock')}
                  </span>
                  {product.soldCount ? (
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      · {product.soldCount}+ {t('বিক্রি', 'sold')}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Product Title */}
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                  {lang === 'bn' ? product.titleBn : product.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                  {lang === 'bn' ? product.descriptionBn : product.description}
                </p>
              </div>

              {/* Elevated Price, Total & Savings Panel */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex flex-wrap items-baseline gap-3 tabular-nums">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      ৳{totalPayable.toLocaleString()}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-base text-slate-400 line-through font-mono">
                        ৳{(product.originalPrice * quantity).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {unitSavings > 0 && (
                    <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black px-2.5 py-1 rounded-lg border border-rose-500/20 tabular-nums">
                      {t(`${cms?.saveBadgeLabelBn || 'সাশ্রয়'} ৳${unitSavings.toLocaleString()}`, `${cms?.saveBadgeLabelEn || 'Save'} ৳${unitSavings.toLocaleString()}`)}
                    </span>
                  )}
                </div>

                {(cms?.showLoyaltyBadge !== false) && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-200/70 dark:border-slate-700/70 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>
                        {t(
                          (cms?.loyaltyTextBn || 'এই অর্ডারে +{points} রিওয়ার্ড পয়েন্ট পাবেন').replace('{points}', String(loyaltyEarn)),
                          (cms?.loyaltyTextEn || 'Earn +{points} Loyalty Points on purchase').replace('{points}', String(loyaltyEarn))
                        )}
                      </span>
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {t(
                        cms?.codTrustTextBn || 'ক্যাশ অন ডেলিভারি সুবিধা',
                        cms?.codTrustTextEn || 'Pay Cash on Delivery'
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Variants: Colors & Sizes Side by Side on wider cards */}
              {(product.colors?.length || product.sizes?.length) ? (
                <div className="space-y-3">
                  {product.colors && product.colors.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        {t(cms?.colorLabelBn || 'রং / ভ্যারিয়েন্ট:', cms?.colorLabelEn || 'Color / Variant:')}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {product.colors.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setSelectedColor(c)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                              selectedColor === c
                                ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-600 dark:border-emerald-600 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                            }`}
                          >
                            {selectedColor === c && <Check className="w-3 h-3" />}
                            <span>{c}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.sizes && product.sizes.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        {t(cms?.sizeLabelBn || 'সাইজ / এডিশন:', cms?.sizeLabelEn || 'Size / Edition:')}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {product.sizes.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedSize(s)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              selectedSize === s
                                ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-600 dark:border-emerald-600 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Quantity Stepper + Live Call Question CTA */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('পরিমাণ:', 'Qty:')}
                  </span>
                  <div className="inline-flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 overflow-hidden tabular-nums">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3.5 py-2 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-black text-xs font-mono text-slate-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                      className="px-3.5 py-2 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => initiateCustomerBrowserCall()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer hover:bg-emerald-100 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t('কল করে জানুন', 'Call Assistant')}</span>
                </button>
              </div>
            </div>

            {/* Primary Checkout Stack */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => openOneClickCheckout(product)}
                  style={{ backgroundColor: settings.themeColors?.primary || '#059669' }}
                  className="flex-1 py-3.5 sm:py-4 px-5 hover:opacity-95 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Zap className="w-5 h-5 text-amber-300 fill-amber-300 shrink-0" />
                  <span>{t('১ ক্লিকে অর্ডার করুন (COD)', '1-Click Order Now (COD)')}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(product, quantity, selectedColor, selectedSize);
                      addToast(
                        'success',
                        t('কার্টে যোগ হয়েছে!', 'Added to Cart!'),
                        lang === 'bn' ? product.titleBn : product.title
                      );
                    }}
                    className="flex-1 sm:flex-none py-3.5 sm:py-4 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{t('কার্টে রাখুন', 'Add to Cart')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                      isWishlisted(product.id)
                        ? 'bg-rose-50 border-rose-300 text-rose-600'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600'
                    }`}
                    title={t('পছন্দ তালিকা', 'Wishlist')}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted(product.id) ? 'fill-rose-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Price Drop Alert Toggle */}
              {cms?.showPriceAlertButton !== false && (
              <div>
                {!isAlertOpen ? (
                  <button
                    type="button"
                    onClick={() => setIsAlertOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-dashed border-emerald-500/60 hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Bell className="w-4 h-4 shrink-0" />
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
                        className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          {t('আপনার হোয়াটসঅ্যাপ / ফোন নম্বর', 'WhatsApp / Phone')}
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
              )}

              {/* Organic Social Share & Referral Discount Booster */}
              {(organic?.socialShareDiscount?.enabled || organic?.referralProgram?.enabled) && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-emerald-900 dark:text-emerald-200">
                      {t(
                        organic?.socialShareDiscount?.messageBn || 'শেয়ার করলেই স্পেশাল ডিসকাউন্ট কুপন!',
                        organic?.socialShareDiscount?.messageEn || 'Share & unlock instant discount coupon!'
                      )}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                      {t('কুপন কোড:', 'Coupon:')}{' '}
                      <strong>{organic?.socialShareDiscount?.couponCode || 'SHARE50'}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`${lang === 'bn' ? product.titleBn : product.title} — ${window.location.href}?ref=${organic?.socialShareDiscount?.couponCode || 'SHARE50'}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px]"
                    >
                      Facebook
                    </a>
                  </div>
                </div>
              )}

              {/* 64-District Quick Courier & Service Matrix (Fully Editable via Product & CMS) */}
              {cms?.showDeliveryMatrix !== false && (
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Truck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t(cms?.dhakaCityLabelBn || 'ঢাকা সিটি', cms?.dhakaCityLabelEn || 'Dhaka City')}</span>
                  </div>
                  <span className="text-slate-900 dark:text-white font-mono">
                    {dhakaFee === 0 ? t('ফ্রি (FREE)', 'FREE (৳0)') : `৳${dhakaFee}`} ({t(cms?.dhakaEtaBn || '২৪ ঘন্টা', cms?.dhakaEtaEn || '24h')})
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t(cms?.nationwideLabelBn || 'সারাদেশে', cms?.nationwideLabelEn || 'Nationwide')}</span>
                  </div>
                  <span className="text-slate-900 dark:text-white font-mono">
                    {outsideFee === 0 ? t('ফ্রি (FREE)', 'FREE (৳0)') : `৳${outsideFee}`} ({t(cms?.nationwideEtaBn || '৪৮ ঘন্টা', cms?.nationwideEtaEn || '48h')})
                  </span>
                </div>
                {cms?.showWarrantyBadge !== false && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t(cms?.warrantyBadgeTitleBn || 'গ্যারান্টি', cms?.warrantyBadgeTitleEn || 'Warranty')}</span>
                  </div>
                  <span className="text-slate-900 dark:text-white truncate">
                    {lang === 'bn'
                      ? product.warrantyInfoBn || cms?.warrantyBadgeValueBn || '৭ দিন রিপ্লেস'
                      : product.warrantyInfo || cms?.warrantyBadgeValueEn || '7-Day Replace'}
                  </span>
                </div>
                )}
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Tabbed Deep-Dive Panel */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveDetailTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                activeDetailTab === 'overview'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('বিস্তারিত বিবরণ ও বৈশিষ্ট্য', 'Description & Specs')}
            </button>
            <button
              type="button"
              onClick={() => setActiveDetailTab('reviews')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                activeDetailTab === 'reviews'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t(`ক্রেতাদের রিভিউ (${productReviews.length})`, `Verified Reviews (${productReviews.length})`)}
            </button>
            <button
              type="button"
              onClick={() => setActiveDetailTab('shipping')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                activeDetailTab === 'shipping'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('ডেলিভারি ও ওয়ারেন্টি নীতিমালা', 'Delivery & Warranty')}
            </button>
          </div>

          {activeDetailTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {lang === 'bn' ? product.descriptionBn : product.description}
              </p>

              {(lang === 'bn' ? product.featuresBn || product.features : product.features) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(lang === 'bn' ? product.featuresBn || product.features || [] : product.features || []).map(
                    (feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {activeDetailTab === 'reviews' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                    {product.rating}
                  </span>
                  <div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {t(`${productReviews.length} টি যাচাইকৃত রিভিউ`, `${productReviews.length} verified customer reviews`)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>{t('রিভিউ লিখুন', 'Write Review')}</span>
                </button>
              </div>

              {isReviewFormOpen && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder={t('আপনার নাম', 'Your Name')}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                    <select
                      value={reviewerRating}
                      onChange={(e) => setReviewerRating(Number(e.target.value))}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    >
                      <option value={5}>★★★★★ (5 Stars)</option>
                      <option value={4}>★★★★☆ (4 Stars)</option>
                      <option value={3}>★★★☆☆ (3 Stars)</option>
                    </select>
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={reviewerComment}
                    onChange={(e) => setReviewerComment(e.target.value)}
                    placeholder={t('পণ্যটি সম্পর্কে আপনার অভিজ্ঞতা লিখুন...', 'Share your honest experience...')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer"
                  >
                    {t('রিভিউ প্রকাশ করুন', 'Submit Review')}
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {productReviews.length === 0 ? (
                  <p className="text-xs text-slate-500 col-span-full">
                    {t('এখনও কোনো লিখিত রিভিউ নেই। প্রথম রিভিউ দিন!', 'No written reviews yet. Be the first to review!')}
                  </p>
                ) : (
                  productReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">{rev.customerName}</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeDetailTab === 'shipping' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-fade-in">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-500" />
                  <span>{t('কুরিয়ার ডেলিভারি', 'Express Courier')}</span>
                </h4>
                <p className="text-slate-500 leading-relaxed">
                  {t(
                    cms?.courierNoteTextBn ||
                      `ঢাকা সিটি ৳${dhakaFee}, উপশহর ৳${subDhakaFee} এবং সারাদেশে ৬৪ জেলায় ৳${outsideFee} হোম ডেলিভারি।`,
                    cms?.courierNoteTextEn ||
                      `Dhaka City ৳${dhakaFee}, Sub-Dhaka ৳${subDhakaFee}, Nationwide 64 districts ৳${outsideFee} home delivery.`
                  )}{' '}
                  ({t(`ঢাকা ৳${dhakaFee} · উপশহর ৳${subDhakaFee} · সারাদেশ ৳${outsideFee}`, `Dhaka ৳${dhakaFee} · Sub ৳${subDhakaFee} · Outside ৳${outsideFee}`)})
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{t(cms?.warrantyBadgeTitleBn || 'ওয়ারেন্টি ও সুরক্ষা', cms?.warrantyBadgeTitleEn || 'Warranty & Guarantee')}</span>
                </h4>
                <p className="text-slate-500 leading-relaxed">
                  {lang === 'bn'
                    ? product.warrantyInfoBn || cms?.warrantyBadgeValueBn || '৭ দিনের সহজ রিপ্লেসমেন্ট ওয়ারেন্টি ও চেক করে পেমেন্ট সুবিধা।'
                    : product.warrantyInfo || cms?.warrantyBadgeValueEn || '7-day easy replacement guarantee with parcel inspection.'}
                </p>
              </div>
              {cms?.showReturnPolicy !== false && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-emerald-500" />
                  <span>{t(cms?.returnPolicyTitleBn || 'সহজ রিটার্ন পলিসি', cms?.returnPolicyTitleEn || 'Hassle-Free Return')}</span>
                </h4>
                <p className="text-slate-500 leading-relaxed">
                  {t(
                    cms?.returnPolicyTextBn ||
                      'ডেলিভারি ম্যানের সামনে পণ্য চেক করে নেওয়ার সুযোগ এবং যেকোনো ত্রুটিতে তাৎক্ষণিক পরিবর্তন।',
                    cms?.returnPolicyTextEn ||
                      'Inspect item in front of the rider on delivery with instant replacement on defects.'
                  )}
                </p>
              </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SINGLE-PRODUCT PAGE DEDICATED FLASH SALE SECTION */}
      {cms?.showFlashSaleSection !== false && settings?.flashSale?.enabled !== false && flashSaleProducts.length > 0 && (
        <section className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-white flex flex-wrap items-center gap-2">
                  <span>
                    {t(
                      settings.flashSale?.headlineBn || 'চলমান ফ্ল্যাশ সেল অফারসমূহ',
                      settings.flashSale?.headlineEn || 'Active Flash Sale Deals'
                    )}
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md tabular-nums">
                    {timeLeft.days > 0 ? `${timeLeft.days}d:` : ''}
                    {timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {t(
                    'এই পণ্যের সাথে সাথে নিচের ফ্ল্যাশ সেল ডিলগুলোও আজ সীমিত সময়ের জন্য ছাড়ে পাচ্ছেন',
                    'More limited-time flash deals available with Cash on Delivery'
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => selectCategoryFilter('flash-sale', null)}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer self-start sm:self-auto whitespace-nowrap"
            >
              <span>{t('সব ফ্ল্যাশ ডিল দেখুন', 'View All Flash Deals')}</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {flashSaleProducts.map((fp) => (
              <ProductCard
                key={`sp-flash-${fp.id}`}
                product={fp}
                onViewDetails={(p) => openProductPage(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Related Products Rail */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {t('একই ক্যাটাগরির আরও পণ্য', 'More From This Category')}
            </h2>
            <button
              type="button"
              onClick={() => selectCategoryFilter(product.category, null)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              {t('সব দেখুন', 'See All')} →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
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
