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
  BellRing,
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
  MessageSquarePlus,
  Tag,
  MessageCircle,
  Eye,
  Sparkles,
  Heart,
  Scale,
  MapPin,
  X
} from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { BD_DISTRICTS } from '../../data/initialData';
import { ProductCard } from './ProductCard';
import { WaitlistModal } from '../common/WaitlistModal';

interface SingleProductViewProps {
  product: Product;
  onBack: () => void;
}

const parseSingleFlashDateMs = (raw?: string): number => {
  if (!raw) return NaN;
  const trimmed = String(raw).trim();
  const dmy = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/);
  if (dmy) {
    const [, dd, mm, yyyy, hh = '23', min = '59'] = dmy;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), 59).getTime();
  }
  return new Date(trimmed).getTime();
};

const computeSingleFlashTimeLeft = (endsAtIso?: string) => {
  const targetMs = parseSingleFlashDateMs(endsAtIso);
  const diffMs = Number.isFinite(targetMs) ? Math.max(0, targetMs - Date.now()) : 6 * 3600 * 1000;
  const totalSeconds = Math.floor(diffMs / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
};

const SingleProductCountdown = React.memo(({ endsAt, variant = 'boxes' }: { endsAt?: string; variant?: 'boxes' | 'inline' | 'badge' }) => {
  const [timeLeft, setTimeLeft] = useState(() => computeSingleFlashTimeLeft(endsAt));
  useEffect(() => {
    setTimeLeft(computeSingleFlashTimeLeft(endsAt));
    const timer = setInterval(() => {
      setTimeLeft(computeSingleFlashTimeLeft(endsAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  if (variant === 'inline') {
    return (
      <span>
        {timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
      </span>
    );
  }

  if (variant === 'badge') {
    return (
      <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md tabular-nums">
        {timeLeft.days > 0 ? `${timeLeft.days}d:` : ''}
        {timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:
        {timeLeft.seconds.toString().padStart(2, '0')}
      </span>
    );
  }

  return (
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
  );
});

export const SingleProductView: React.FC<SingleProductViewProps> = ({ product, onBack }) => {
  const {
    openOneClickCheckout,
    addToCart,
    addPriceAlert,
    recordProductView,
    getProductViewCount,
    getProductRealStats,
    activeLiveViewers,
    visibleStoreProducts: products,
    reviews,
    addProductReview,
    settings,
    openProductPage,
    selectCategoryFilter,
    initiateCustomerBrowserCall,
    goHome,
    getPartnerPriceInfo,
    getProductCanonicalUrl,
    toggleWishlist,
    isWishlisted,
    toggleCompare,
    isComparing,
    categories,
    lang,
    t,
    addToast
  } = useStore();

  const hasBangla = (txt?: string) => Boolean(txt && /[\u0981-\u09F2\u09F4-\u09FF]/.test(txt));
  const wishlisted = isWishlisted(product.id);
  const comparing = isComparing(product.id);
  const catObj = categories.find((c) => c.slug === product.category);
  const subObj = catObj?.subcategories?.find((s) => s.slug === product.subcategory);
  const displayCategory =
    lang === 'bn'
      ? catObj?.nameBn || product.categoryBn || product.category
      : catObj?.nameEn || (!hasBangla(product.category) ? product.category : product.categoryBn);
  const displaySubcategory =
    lang === 'bn'
      ? subObj?.nameBn || product.subcategory
      : subObj?.nameEn || product.subcategory;
  const displayTitle =
    lang === 'bn'
      ? product.titleBn || product.title
      : !hasBangla(product.title) && product.title?.trim()
      ? product.title
      : product.titleBn;

  useEffect(() => {
    recordProductView(product.id);
    setSelectedImageIndex(0);
    setSelectedColor(product.colors?.[0] || '');
    setSelectedSize(product.sizes?.[0] || '');
    const initAttrs: Record<string, string> = {};
    (product.attributes || []).forEach((attr) => {
      if (attr.name && attr.values?.[0]) initAttrs[attr.name] = attr.values[0];
    });
    setSelectedAttributes(initAttrs);
    setQuantity(1);
    setMediaMode('images');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mediaMode, setMediaMode] = useState<'images' | 'video'>('images');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isLightboxOpen]);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    (product.attributes || []).forEach((attr) => {
      if (attr.name && attr.values?.[0]) map[attr.name] = attr.values[0];
    });
    return map;
  });
  const [waitlistProduct, setWaitlistProduct] = useState<Product | null>(null);
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
  const [showAllReviews, setShowAllReviews] = useState(false);

  // AI Product Q&A & Review Summary
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [qaHighlights, setQaHighlights] = useState<string[]>([]);
  const [qaLoading, setQaLoading] = useState(false);

  // District Delivery Fee Estimator
  const [estDistrictName, setEstDistrictName] = useState('Dhaka - Inside City');

  // AI-Driven Related Products (Category + Subcategory + Tags)
  const [aiRelatedIds, setAiRelatedIds] = useState<string[]>([]);
  const [aiRelatedReason, setAiRelatedReason] = useState<string>('');
  const [aiRelatedLoading, setAiRelatedLoading] = useState<boolean>(false);

  useEffect(() => {
    setQaQuestion('');
    setQaAnswer('');
    setQaHighlights([]);
  }, [product.id]);

  const askProductAI = async (customQ?: string) => {
    if (qaLoading) return;
    const questionText = (customQ !== undefined ? customQ : qaQuestion).trim();
    setQaLoading(true);
    try {
      const res = await fetch('/api/ai/product-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          question: questionText || undefined,
          lang
        })
      });
      const data = await res.json();
      if (data?.ok) {
        setQaAnswer(data.answer || '');
        setQaHighlights(Array.isArray(data.highlights) ? data.highlights : []);
      }
    } catch {
      addToast('error', t('সংযোগ সমস্যা', 'Connection error'), t('আবার চেষ্টা করুন', 'Please try again'));
    } finally {
      setQaLoading(false);
    }
  };

  // Interactive Zoom State
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

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

  // AI-Driven Related Products backed by /api/ai/related-products + tag/subcategory ranking fallback
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setAiRelatedLoading(true);
    setAiRelatedReason('');
    fetch('/api/ai/related-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        category: product.category,
        subcategory: product.subcategory || '',
        tags: product.tags || [],
        lang,
        limit: 4
      }),
      signal: controller.signal
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.ok || !Array.isArray(data.relatedProducts)) return;
        const ids = data.relatedProducts.map((p: Product) => p.id).filter(Boolean);
        setAiRelatedIds(ids);
        if (typeof data.reason === 'string' && data.reason.trim()) {
          setAiRelatedReason(data.reason.trim());
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setAiRelatedLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [product.id, product.category, product.subcategory, lang]);

  const relatedProducts = useMemo(() => {
    const others = products.filter((p) => p.id !== product.id);
    if (aiRelatedIds.length > 0) {
      const byId = new Map(others.map((p) => [p.id, p]));
      const ordered = aiRelatedIds
        .map((id) => byId.get(id))
        .filter((p): p is Product => Boolean(p));
      if (ordered.length >= 2) return ordered.slice(0, 4);
    }
    const baseTags = new Set((product.tags || []).map((tg) => String(tg).toLowerCase().trim()).filter(Boolean));
    return [...others]
      .map((cand) => {
        let score = 0;
        if (product.subcategory && cand.subcategory && cand.subcategory === product.subcategory) score += 15;
        if (cand.category === product.category) score += 9;
        for (const tg of cand.tags || []) {
          if (baseTags.has(String(tg).toLowerCase().trim())) score += 6;
        }
        if (product.brand && cand.brand && cand.brand.toLowerCase() === product.brand.toLowerCase()) score += 3;
        return { cand, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.cand)
      .slice(0, 4);
  }, [products, product.id, product.category, product.subcategory, product.tags, product.brand, aiRelatedIds]);

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

  const partnerPrice = getPartnerPriceInfo(product, quantity);
  const effectiveUnitPrice = partnerPrice.unitPrice;
  const unitSavings = Math.max(0, (product.originalPrice - effectiveUnitPrice) * quantity);
  const totalPayable = effectiveUnitPrice * quantity;
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
              {displayCategory}
            </button>
            {product.subcategory && (
              <>
                <span>/</span>
                <button
                  type="button"
                  onClick={() => selectCategoryFilter(product.category, product.subcategory || null)}
                  className="hover:text-emerald-600 font-semibold cursor-pointer truncate"
                >
                  {displaySubcategory}
                </button>
              </>
            )}
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300 font-semibold truncate max-w-[240px]">
              {displayTitle}
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
              <SingleProductCountdown endsAt={settings.flashSale?.endsAt} />
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
                className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 cursor-zoom-in select-none group"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setIsLightboxOpen(true)}
              >
                {(images[selectedImageIndex]?.trim() || images[0]?.trim()) ? (
                  <img
                    src={images[selectedImageIndex]?.trim() || images[0]?.trim()}
                    alt={lang === 'bn' ? product.titleBn : product.title}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-200 ${
                      isZoomed ? 'scale-125' : 'scale-100'
                    }`}
                    style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
                )}

                {/* Top Left Discount Badge (Compact) */}
                {discountPercent > 0 && (
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 pointer-events-none">
                    <span className="inline-flex bg-emerald-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm tabular-nums">
                      -{discountPercent}% {t('ছাড়', 'OFF')}
                    </span>
                  </div>
                )}

                {/* Top Right Flash Deal Badge (Compact) */}
                {isFlashActive && (
                  <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 pointer-events-none">
                    <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                      <span>{t('ফ্ল্যাশ ডিল', 'FLASH DEAL')}</span>
                    </span>
                  </div>
                )}

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

                {/* Bottom Counter & Click-to-View Hint */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg tabular-nums">
                    {selectedImageIndex + 1} / {images.length}
                  </span>
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <ZoomIn className="w-3 h-3" />
                    <span>{t('বড় করে দেখতে ক্লিক করুন', 'Click to view full image')}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {images.filter((img) => img && img.trim()).map((img, idx) => (
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
                    {displayCategory}
                  </button>
                  {product.subcategory && (
                    <button
                      type="button"
                      onClick={() => selectCategoryFilter(product.category, product.subcategory || null)}
                      className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg cursor-pointer hover:text-emerald-600"
                    >
                      {displaySubcategory}
                    </button>
                  )}
                  {(product.brand || product.brandBn) && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Tag className="w-3 h-3 text-emerald-500" />
                      <span>{t(cms?.brandLabelBn || 'ব্র্যান্ড', cms?.brandLabelEn || 'Brand')}:</span>
                      <span>{lang === 'bn' ? product.brandBn || product.brand : !hasBangla(product.brand) ? product.brand : product.brandBn}</span>
                    </span>
                  )}
                </div>

                {(() => {
                  const realStats = getProductRealStats(product.id);
                  return (
                    <div className="flex items-center gap-2.5 text-xs tabular-nums">
                      <button
                        type="button"
                        onClick={() => setActiveDetailTab('reviews')}
                        className="flex items-center gap-1 text-amber-500 font-bold cursor-pointer hover:underline"
                      >
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{realStats.averageRating}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-normal">
                          ({realStats.reviewsCount.toLocaleString()} {t('রিভিউ', 'reviews')})
                        </span>
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {product.stock > 0
                          ? t(`${cms?.inStockLabelBn || 'স্টকে আছে'} (${product.stock})`, `${cms?.inStockLabelEn || 'In Stock'} (${product.stock})`)
                          : t(cms?.outOfStockLabelBn || 'স্টক শেষ', cms?.outOfStockLabelEn || 'Out of Stock')}
                      </span>
                      {realStats.soldCount > 0 && (
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          · {realStats.soldCount.toLocaleString()}+ {t('বিক্রি', 'sold')}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Product Title (Compact & Scannable) */}
              <div>
                <h1 className="font-display text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight line-clamp-2">
                  {displayTitle}
                </h1>
                {settings.viewerCounter?.enabled !== false &&
                  settings.viewerCounter?.showOnSingleProduct !== false && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {getProductViewCount(product.id).toLocaleString()}{' '}
                      {t(
                        settings.viewerCounter?.labelBn || 'জন এই পণ্যটি দেখেছেন',
                        settings.viewerCounter?.labelEn || 'people viewed this'
                      )}
                    </span>
                  </p>
                )}
                {(() => {
                  const shortDesc =
                    lang === 'bn'
                      ? (product.descriptionBn?.trim() || (hasBangla(product.description) ? product.description?.trim() : ''))
                      : (!hasBangla(product.description) ? product.description?.trim() : '');
                  if (!shortDesc) return null;
                  return (
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed max-w-xl">
                      {shortDesc}
                    </p>
                  );
                })()}
              </div>

              {/* Elevated Price, Total & Savings Panel */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex flex-wrap items-baseline gap-3 tabular-nums">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      ৳{totalPayable.toLocaleString()}
                    </span>
                    {product.originalPrice > effectiveUnitPrice && (
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

                {partnerPrice.mode === 'reseller' && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      {t('রিসেলার মূল্য', 'Reseller Rate')}: ৳{effectiveUnitPrice.toLocaleString()} / {t('পিস', 'unit')} ({t('খুচরা', 'Retail')} ৳{product.price.toLocaleString()})
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {t('প্রতি পিসে লাভ', 'Margin')}: ৳{(partnerPrice.estimatedProfitPerUnit || 0).toLocaleString()}
                    </span>
                  </div>
                )}

                {partnerPrice.mode === 'wholesale' && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5 text-xs tabular-nums">
                    <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                      <span>{t('হোলসেল B2B ট্রেড রেট', 'Wholesale B2B Rate')}: ৳{effectiveUnitPrice.toLocaleString()}/{t('পিস', 'unit')}</span>
                      <span>MOQ {partnerPrice.minQty || 10} {t('পিস', 'pcs')}</span>
                    </div>
                    {product.wholesaleTiers && product.wholesaleTiers.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {product.wholesaleTiers.map((tier) => (
                          <button
                            key={tier.minQty}
                            type="button"
                            onClick={() => setQuantity(tier.minQty)}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:border-emerald-500"
                          >
                            {tier.minQty}+ {t('পিস', 'pcs')} → ৳{tier.unitPrice.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

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

              {/* Dynamic Backend Product Attributes */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="space-y-3">
                  {product.attributes.map((attr) => (
                    <div key={attr.id || attr.name} className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        {lang === 'bn' ? attr.nameBn || attr.name : attr.name}:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {(attr.values || []).map((val) => {
                          const isSelected = (selectedAttributes[attr.name] || attr.values[0]) === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setSelectedAttributes((prev) => ({ ...prev, [attr.name]: val }))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-600 dark:border-emerald-600 shadow-xs'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                              <span>{val}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Stepper + Wishlist + Compare + Live Call CTA */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <div className="flex items-center gap-2.5">
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

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                      wishlisted
                        ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-rose-400'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{wishlisted ? t('সেভড', 'Saved') : t('পছন্দ', 'Save')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCompare(product.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                      comparing
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{comparing ? t('তুলনায় যুক্ত', 'Comparing') : t('তুলনা', 'Compare')}</span>
                  </button>

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
            </div>

            {/* Urgency & Scarcity Conversion Block */}
            {settings.urgencySettings?.enabled !== false && (product.stock ?? 0) > 0 && (() => {
              const urg = settings.urgencySettings;
              const threshold = urg?.lowStockThreshold ?? 20;
              const showLowStock = (urg?.showStockProgress !== false) && (product.stock ?? 0) <= threshold;
              const stockFillPct = Math.max(18, Math.min(92, Math.round(((product.stock ?? 5) / Math.max(threshold, 1)) * 100)));
              const realStats = getProductRealStats(product.id);
              const liveLookers = Math.max(1, activeLiveViewers);
              const soldToday = realStats.soldLast24h;
              const now = new Date();
              const cutoffHour = urg?.dispatchCutoffHour ?? 17;
              const cutoffTarget = new Date(now);
              cutoffTarget.setHours(cutoffHour, 0, 0, 0);
              if (cutoffTarget.getTime() <= now.getTime()) {
                cutoffTarget.setDate(cutoffTarget.getDate() + 1);
              }
              const cutoffMinsTotal = Math.max(15, Math.floor((cutoffTarget.getTime() - now.getTime()) / 60000));
              const cutoffH = Math.floor(cutoffMinsTotal / 60);
              const cutoffM = cutoffMinsTotal % 60;

              return (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/60 space-y-2.5 text-xs">
                  {(urg?.showLiveLookers !== false || (urg?.showRecentSold !== false && soldToday > 0)) && (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                      {urg?.showLiveLookers !== false && (
                        <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {t(
                              `এখন ${liveLookers} জন ভিজিটর সক্রিয়`,
                              `${liveLookers} active visitor${liveLookers > 1 ? 's' : ''} online right now`
                            )}
                          </span>
                        </span>
                      )}
                      {urg?.showRecentSold !== false && soldToday > 0 && (
                        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
                          <Flame className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {t(
                              `গত ২৪ ঘণ্টায় ${soldToday}টি অর্ডার হয়েছে`,
                              `${soldToday} sold in last 24h`
                            )}
                          </span>
                        </span>
                      )}
                    </div>
                  )}

                  {showLowStock && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-extrabold text-rose-700 dark:text-rose-400 tabular-nums">
                        <span>
                          {t(
                            (urg?.lowStockTextBn || 'তাড়াতাড়ি করুন! স্টকে আর মাত্র {stock} পিস বাকি আছে').replace('{stock}', String(product.stock)),
                            (urg?.lowStockTextEn || 'Hurry! Only {stock} items left in stock').replace('{stock}', String(product.stock))
                          )}
                        </span>
                        <span>{stockFillPct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-rose-200/70 dark:bg-rose-950 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-600 transition-all duration-500"
                          style={{ width: `${stockFillPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {(urg?.showCountdown !== false || urg?.showDispatchCutoff !== false) && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/70 dark:border-amber-800/40 text-[11px] tabular-nums">
                      {urg?.showDispatchCutoff !== false && (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
                          <Truck className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {t(
                              urg?.dispatchTextBn || `আজকে শিপমেন্ট পেতে ${cutoffH} ঘণ্টা ${cutoffM} মিনিটের মধ্যে অর্ডার করুন`,
                              urg?.dispatchTextEn || `Order within ${cutoffH}h ${cutoffM}m for same-day courier dispatch`
                            )}
                          </span>
                        </span>
                      )}
                      {urg?.showCountdown !== false && (
                        <span className="font-mono font-black text-rose-700 dark:text-rose-300">
                          {t('অফার শেষ:', 'Deal ends:')}{' '}
                          <SingleProductCountdown endsAt={settings.flashSale?.endsAt} variant="inline" />
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Primary Checkout Stack */}
            <div className="space-y-3 pt-2">
              <div className="flex items-stretch gap-2.5">
                {(product.stock ?? 0) <= 0 ? (
                  <button
                    type="button"
                    onClick={() => setWaitlistProduct(product)}
                    className="flex-1 py-3.5 sm:py-4 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <BellRing className="w-5 h-5 shrink-0" />
                    <span>
                      {t(
                        cms?.notifyMeBtnBn || 'স্টকে এলে আমাকে জানান',
                        cms?.notifyMeBtnEn || 'Notify Me When Available'
                      )}
                    </span>
                  </button>
                ) : (
                  <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => openOneClickCheckout(product)}
                      style={{ backgroundColor: settings.themeColors?.primary || '#059669' }}
                      className="w-full py-3 sm:py-4 px-2.5 sm:px-5 hover:opacity-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                    >
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 fill-amber-300 shrink-0" />
                      <span>
                        {t(
                          settings.cmsTexts?.orderNowBtnBn || 'এখনই কিনুন',
                          settings.cmsTexts?.orderNowBtnEn === 'Order Now' || !settings.cmsTexts?.orderNowBtnEn
                            ? 'Buy Now'
                            : settings.cmsTexts.orderNowBtnEn
                        )}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        addToCart(product, quantity, selectedColor, selectedSize, selectedAttributes);
                      }}
                      className="w-full py-3 sm:py-4 px-2.5 sm:px-5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-2xl border border-slate-700 shadow-lg flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                    >
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                      <span>{t('কার্টে রাখুন', 'Add to Cart')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Order Via WhatsApp */}
              {(() => {
                const canonicalUrl = getProductCanonicalUrl(product);
                const variantParts = [
                  selectedColor ? `${t('রং', 'Color')}: ${selectedColor}` : '',
                  selectedSize ? `${t('সাইজ', 'Size')}: ${selectedSize}` : '',
                  ...Object.entries(selectedAttributes || {}).map(([k, v]) => `${k}: ${v}`)
                ].filter(Boolean);
                const variantSummary = variantParts.join(', ');
                const rawWaDigits = String(settings.whatsappNumber || '+8801917942662').replace(/[^0-9]/g, '');
                const fmtWa = rawWaDigits.startsWith('88') ? rawWaDigits : `88${rawWaDigits}`;
                const waBody =
                  lang === 'bn'
                    ? `আসসালামু আলাইকুম BuyOne BD,\nআমি WhatsApp-এ এই পণ্যটি অর্ডার করতে চাই:\nপণ্য: ${displayTitle}\nSKU: ${product.sku}\n${variantSummary ? `ভ্যারিয়েন্ট: ${variantSummary}\n` : ''}পরিমাণ: ${quantity} পিস\nমোট মূল্য: ৳${totalPayable.toLocaleString()}\nলিংক: ${canonicalUrl}\n\nআমার নাম ও ঠিকানা:`
                    : `Assalamu Alaikum BuyOne BD,\nI would like to order this product via WhatsApp:\nProduct: ${displayTitle}\nSKU: ${product.sku}\n${variantSummary ? `Variant: ${variantSummary}\n` : ''}Quantity: ${quantity} pcs\nTotal Price: ৳${totalPayable.toLocaleString()}\nLink: ${canonicalUrl}\n\nMy Name & Delivery Address:`;
                const orderViaWaHref = `https://wa.me/${fmtWa}?text=${encodeURIComponent(waBody)}`;

                return (
                  <a
                    href={orderViaWaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm border border-emerald-500/30 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{t('WhatsApp-এ অর্ডার করুন', 'Order Via WhatsApp')}</span>
                  </a>
                );
              })()}

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
                          placeholder="01917-XXXXXX"
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
                      href={`https://wa.me/?text=${encodeURIComponent(`${lang === 'bn' ? product.titleBn : product.title} — ${getProductCanonicalUrl(product)}?ref=${organic?.socialShareDiscount?.couponCode || 'SHARE50'}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getProductCanonicalUrl(product))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px]"
                    >
                      Facebook
                    </a>
                  </div>
                </div>
              )}

              {/* Interactive District Delivery Fee Estimator + Courier Matrix */}
              {(() => {
                const estDistObj = BD_DISTRICTS.find((d) => d.name === estDistrictName) || BD_DISTRICTS[0];
                const estZoneFee =
                  estDistObj.zone === 'dhaka_inside'
                    ? dhakaFee
                    : estDistObj.zone === 'dhaka_sub'
                    ? subDhakaFee
                    : outsideFee;
                const estEta =
                  estDistObj.zone === 'dhaka_inside'
                    ? t('২৪ ঘন্টা', '24 Hours')
                    : estDistObj.zone === 'dhaka_sub'
                    ? t('২৪-৩৬ ঘন্টা', '24–36 Hours')
                    : t('৪৮-৭২ ঘন্টা', '48–72 Hours');
                return (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-[11px] tabular-nums">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{t('আপনার জেলা অনুযায়ী ডেলিভারি হিসাব:', 'Check Delivery Fee by District:')}</span>
                      </span>
                      <select
                        value={estDistrictName}
                        onChange={(e) => setEstDistrictName(e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        {BD_DISTRICTS.map((d) => (
                          <option key={d.name} value={d.name}>
                            {lang === 'bn' ? d.nameBn : d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/70 dark:border-slate-700/70 text-slate-600 dark:text-slate-300">
                      <span>
                        {t('ডেলিভারি চার্জ:', 'Delivery Fee:')}{' '}
                        <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                          {estZoneFee === 0 ? t('ফ্রি', 'FREE') : `৳${estZoneFee}`}
                        </strong>
                      </span>
                      <span>
                        {t('সম্ভাব্য সময়:', 'ETA:')} <strong>{estEta}</strong>
                      </span>
                    </div>
                  </div>
                );
              })()}

              {cms?.showDeliveryMatrix !== false && (
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Truck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t(cms?.dhakaCityLabelBn || 'ঢাকা সিটি', cms?.dhakaCityLabelEn || 'Dhaka City')}</span>
                  </div>
                  <span className="text-slate-900 dark:text-white font-mono">
                    {dhakaFee === 0 ? t('ফ্রি', 'FREE') : `৳${dhakaFee}`} ({t(cms?.dhakaEtaBn || '২৪ ঘন্টা', cms?.dhakaEtaEn || '24h')})
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t(cms?.nationwideLabelBn || 'সারাদেশে', cms?.nationwideLabelEn || 'Nationwide')}</span>
                  </div>
                  <span className="text-slate-900 dark:text-white font-mono">
                    {outsideFee === 0 ? t('ফ্রি', 'FREE') : `৳${outsideFee}`} ({t(cms?.nationwideEtaBn || '৪৮ ঘন্টা', cms?.nationwideEtaEn || '48h')})
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
                      : (!hasBangla(product.warrantyInfo) ? product.warrantyInfo : '') || cms?.warrantyBadgeValueEn || '7-Day Replace'}
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
              {(() => {
                const fullDescription =
                  lang === 'bn'
                    ? (product.descriptionBn?.trim() || (hasBangla(product.description) ? product.description?.trim() : ''))
                    : (!hasBangla(product.description) ? product.description?.trim() : '');
                const cleanBrand = lang === 'bn'
                  ? (product.brandBn || product.brand)
                  : (!hasBangla(product.brand) ? product.brand : '');
                const cleanWarranty = lang === 'bn'
                  ? (product.warrantyInfoBn || product.warrantyInfo || '৭ দিনের সহজ রিপ্লেসমেন্ট ওয়ারেন্টি')
                  : (!hasBangla(product.warrantyInfo) && product.warrantyInfo ? product.warrantyInfo : '7-day easy replacement warranty');
                const fallbackOverview = lang === 'bn'
                  ? `${displayTitle} — ${displayCategory} ক্যাটাগরির প্রিমিয়াম ও ১০০% অরিজিনাল পণ্য। ${cleanBrand ? `ব্র্যান্ড: ${cleanBrand}। ` : ''}সারা বাংলাদেশে ক্যাশ অন ডেলিভারি এবং ${cleanWarranty} সুবিধা সহ নিশ্চিন্তে অর্ডার করুন।`
                  : `${displayTitle} — Authentic, quality-checked item in ${displayCategory}. ${cleanBrand ? `Brand: ${cleanBrand}. ` : ''}Available across all 64 districts in Bangladesh with Cash on Delivery and ${cleanWarranty}.`;

                return (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {fullDescription || fallbackOverview}
                  </p>
                );
              })()}

              {(() => {
                const rawFeatures =
                  lang === 'bn'
                    ? (product.featuresBn && product.featuresBn.length > 0 ? product.featuresBn : product.features || [])
                    : (product.features || []).filter((f) => !hasBangla(f));
                if (!rawFeatures || rawFeatures.length === 0) return null;
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {rawFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Full Attributes & Product Specifications Table */}
              {((product.brand || product.brandBn) || (product.attributes && product.attributes.length > 0)) && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                  <div className="px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 text-xs font-black text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800">
                    {t('প্রোডাক্ট স্পেসিফিকেশন ও অ্যাট্রিবিউটস', 'Product Specifications & Attributes')}
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {(product.brand || product.brandBn) && (
                      <div className="grid grid-cols-3 px-4 py-2.5">
                        <span className="font-bold text-slate-500">{t(cms?.brandLabelBn || 'ব্র্যান্ড', cms?.brandLabelEn || 'Brand')}</span>
                        <span className="col-span-2 font-semibold text-slate-900 dark:text-white">
                          {lang === 'bn' ? product.brandBn || product.brand : product.brand || product.brandBn}
                        </span>
                      </div>
                    )}
                    {(product.attributes || []).map((attr) => (
                      <div key={attr.id || attr.name} className="grid grid-cols-3 px-4 py-2.5">
                        <span className="font-bold text-slate-500">{lang === 'bn' ? attr.nameBn || attr.name : attr.name}</span>
                        <span className="col-span-2 font-semibold text-slate-900 dark:text-white">
                          {(attr.values || []).join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeDetailTab === 'reviews' && (() => {
            const realStats = getProductRealStats(product.id);
            const displayedReviews = showAllReviews ? productReviews : productReviews.slice(0, 6);
            const starCounts = [5, 4, 3, 2, 1].map((s) => ({
              stars: s,
              count: productReviews.filter((r) => Math.round(r.rating) === s).length
            }));
            return (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-4 tabular-nums">
                  <div>
                    <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                      {realStats.averageRating}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">/5</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {t(
                        `${realStats.reviewsCount.toLocaleString()} যাচাইকৃত রেটিং · ${realStats.soldCount.toLocaleString()}+ বিক্রি · ${productReviews.length} লিখিত রিভিউ`,
                        `${realStats.reviewsCount.toLocaleString()} verified ratings · ${realStats.soldCount.toLocaleString()}+ sold · ${productReviews.length} written reviews`
                      )}
                    </p>
                  </div>
                </div>

                {productReviews.length > 0 && (
                  <div className="flex-1 min-w-[180px] max-w-xs space-y-1">
                    {starCounts.slice(0, 3).map((row) => {
                      const pct = Math.round((row.count / productReviews.length) * 100);
                      return (
                        <div key={row.stars} className="flex items-center gap-2 text-[10px] tabular-nums">
                          <span className="w-6 font-bold text-slate-600 dark:text-slate-300">{row.stars}★</span>
                          <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-7 text-right text-slate-500">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => askProductAI('')}
                    disabled={qaLoading}
                    className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{qaLoading ? t('বিশ্লেষণ চলছে...', 'Analyzing...') : t('AI রিভিউ সারসংক্ষেপ', 'AI Review Summary')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>{t('রিভিউ লিখুন', 'Write Review')}</span>
                  </button>
                </div>
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
                  displayedReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white truncate">{rev.customerName}</span>
                          {rev.verifiedPurchase && (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                              ✓ {t('যাচাইকৃত', 'Verified')}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">{rev.date}</span>
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

              {productReviews.length > 6 && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAllReviews((prev) => !prev)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                  >
                    {showAllReviews
                      ? t('কম রিভিউ দেখুন', 'Show Fewer Reviews')
                      : t(`সব ${productReviews.length}টি লিখিত রিভিউ দেখুন`, `Show all ${productReviews.length} written reviews`)}
                  </button>
                </div>
              )}
            </div>
            );
          })()}

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

          {/* AI Buyer Q&A & Review Summary Panel */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {t('এআই প্রোডাক্ট ও রিভিউ অ্যাসিস্ট্যান্ট', 'AI Product Q&A & Review Summary')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {t('ক্রেতাদের আসল রিভিউ ও পণ্যের তথ্য থেকে তাৎক্ষণিক উত্তর পান', 'Instant answers grounded in verified reviews & specs')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  t('ক্রেতারা কী বলছেন?', 'What do buyers say?'),
                  t('ডেলিভারি কত দিন লাগবে?', 'Delivery time & fee?'),
                  t('ক্যাশ অন ডেলিভারি ও গ্যারান্টি?', 'COD & Warranty?')
                ].map((qChip) => (
                  <button
                    key={qChip}
                    type="button"
                    disabled={qaLoading}
                    onClick={() => {
                      setQaQuestion(qChip);
                      askProductAI(qChip);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-[11px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    {qChip}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                askProductAI();
              }}
              className="flex flex-wrap gap-2"
            >
              <input
                type="text"
                value={qaQuestion}
                onChange={(e) => setQaQuestion(e.target.value)}
                placeholder={t('এই পণ্য নিয়ে যেকোনো প্রশ্ন করুন (যেমন: কোয়ালিটি কেমন, ওয়ারেন্টি আছে কি?)...', 'Ask anything about quality, delivery, warranty, or buyer reviews...')}
                className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={qaLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{qaLoading ? t('উত্তর খুঁজছে...', 'Thinking...') : t('জিজ্ঞাসা করুন', 'Ask AI')}</span>
              </button>
            </form>

            {qaAnswer && (
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2 text-xs">
                <p className="text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line">{qaAnswer}</p>
                {qaHighlights.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {qaHighlights.map((hl, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300"
                      >
                        <Check className="w-3 h-3" />
                        <span>{hl}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
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
                  <SingleProductCountdown endsAt={settings.flashSale?.endsAt} variant="badge" />
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
                onNotifyWaitlist={(p) => setWaitlistProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* AI-Driven Related Products Rail */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t('এআই প্রস্তাবিত অনুরূপ পণ্য', 'AI-Driven Related Products')}</span>
              </h2>
              {(aiRelatedReason || aiRelatedLoading) && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {aiRelatedReason || t('ক্যাটাগরি ও ট্যাগ অনুযায়ী সেরা মিল খুঁজছে...', 'Matching similar products by category & tags...')}
                </p>
              )}
            </div>
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
                onNotifyWaitlist={(rel) => setWaitlistProduct(rel)}
              />
            ))}
          </div>
        </div>
      )}

      <WaitlistModal product={waitlistProduct} onClose={() => setWaitlistProduct(null)} />

      {/* Fullscreen Image Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={displayTitle}
        >
          <div className="w-full max-w-4xl flex items-center justify-between text-white mb-3 px-1">
            <span className="text-xs sm:text-sm font-bold truncate pr-4">{displayTitle}</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-lg tabular-nums">
                {selectedImageIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(false);
                }}
                aria-label={t('বন্ধ করুন', 'Close')}
                className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="relative max-w-4xl w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {(images[selectedImageIndex]?.trim() || images[0]?.trim()) && (
              <img
                src={images[selectedImageIndex]?.trim() || images[0]?.trim()}
                alt={displayTitle}
                referrerPolicy="no-referrer"
                className="max-h-[78vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10 bg-white/5"
              />
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedImageIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-slate-900 shadow-lg flex items-center justify-center hover:scale-105 cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImageIndex((i) => (i + 1) % images.length)}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-slate-900 shadow-lg flex items-center justify-center hover:scale-105 cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
