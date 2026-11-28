import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  BellRing,
  ArrowRight,
  Tag,
  MessageCircle,
  Copy,
  ExternalLink,
  Eye,
  Heart,
  Scale,
  Sparkles,
  MapPin,
  Calendar
} from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { WaitlistModal } from '../common/WaitlistModal';
import { BD_DISTRICTS } from '../../data/initialData';

export function calculateEstimatedDeliveryRange(
  zone: 'dhaka_inside' | 'dhaka_sub' | 'dhaka_outside',
  lang: 'en' | 'bn' = 'en',
  baseDate: Date = new Date()
): {
  minDate: Date;
  maxDate: Date;
  dateRangeLabel: string;
  windowLabel: string;
  cutoffOffset: number;
} {
  const cutoffOffset = baseDate.getHours() >= 17 ? 1 : 0;
  const skipFridays = zone === 'dhaka_outside';

  const addTransitDays = (start: Date, days: number): Date => {
    const result = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      if (skipFridays && result.getDay() === 5) continue;
      added += 1;
    }
    return result;
  };

  let minDays = 1;
  let maxDays = 2;
  if (zone === 'dhaka_inside') {
    minDays = 1 + cutoffOffset;
    maxDays = 2 + cutoffOffset;
  } else if (zone === 'dhaka_sub') {
    minDays = 1 + cutoffOffset;
    maxDays = 3 + cutoffOffset;
  } else {
    minDays = 2 + cutoffOffset;
    maxDays = 4 + cutoffOffset;
  }

  const minDate = addTransitDays(baseDate, minDays);
  const maxDate = addTransitDays(baseDate, maxDays);
  const fmt = new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
    month: 'short',
    day: 'numeric'
  });

  const dateRangeLabel = `${fmt.format(minDate)} – ${fmt.format(maxDate)}`;
  const windowLabel =
    zone === 'dhaka_inside'
      ? lang === 'bn'
        ? '২৪ ঘন্টার মধ্যে ডেলিভারি'
        : 'Within 24 Hours'
      : zone === 'dhaka_sub'
      ? lang === 'bn'
        ? '২৪–৪৮ ঘন্টায় ডেলিভারি'
        : '24–48 Hours'
      : lang === 'bn'
      ? '২–৩ কার্যদিবসে ডেলিভারি'
      : '2–3 Business Days';

  return { minDate, maxDate, dateRangeLabel, windowLabel, cutoffOffset };
}

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectProduct
}) => {
  const {
    openOneClickCheckout,
    openProductPage,
    addToCart,
    settings,
    categories,
    visibleStoreProducts,
    lang,
    t,
    addToast,
    reviews,
    addProductReview,
    addPriceAlert,
    recordProductView,
    getProductViewCount,
    getProductRealStats,
    getPartnerPriceInfo,
    getProductCanonicalUrl,
    buildProductWhatsAppUrl,
    openWhatsAppWidgetForProduct,
    toggleWishlist,
    isWishlisted,
    toggleCompare,
    isComparing,
    setIsCompareModalOpen,
    customerProfile,
    isCustomerLoggedIn
  } = useStore();

  useEffect(() => {
    if (product?.id) {
      recordProductView(product.id);
    }
  }, [product?.id]);

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'video' | 'reviews' | 'alert'>('details');
  const [estimatorDistrict, setEstimatorDistrict] = useState<string>(() =>
    isCustomerLoggedIn && customerProfile?.district ? customerProfile.district : 'Dhaka - Inside City'
  );

  // Interactive Zoom State
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Review Form State
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showAllModalReviews, setShowAllModalReviews] = useState(false);

  // Price Alert State
  const [alertContact, setAlertContact] = useState('');
  const [targetPrice, setTargetPrice] = useState<number>(() =>
    product ? Math.round(product.price * 0.85) : 0
  );
  const [isAlertSubmitting, setIsAlertSubmitting] = useState(false);

  // AI-Driven Related Products State
  const [aiRelatedIds, setAiRelatedIds] = useState<string[] | null>(null);
  const [aiRelatedReasonEn, setAiRelatedReasonEn] = useState('');
  const [aiRelatedReasonBn, setAiRelatedReasonBn] = useState('');
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!product) return;
    setSelectedImageIdx(0);
    setQuantity(1);
    setActiveTab('details');
    setIsZoomed(false);
    setShowAllModalReviews(false);
    setTargetPrice(Math.round(product.price * 0.85));
    setSelectedColor(product.colors?.[0] || '');
    setSelectedSize(product.sizes?.[0] || '');
    const initAttrs: Record<string, string> = {};
    (product.attributes || []).forEach((attr) => {
      if (attr.name && attr.values?.[0]) initAttrs[attr.name] = attr.values[0];
    });
    setSelectedAttributes(initAttrs);
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product?.id]);

  // Deterministic smart ranking fallback based on category, subcategory & tags
  const fallbackRelatedProducts = useMemo(() => {
    if (!product) return [];
    const targetCat = String(product.category || '').toLowerCase();
    const targetSub = String(product.subcategory || '').toLowerCase();
    const targetTags = new Set((product.tags || []).map((tg) => String(tg).trim().toLowerCase()).filter(Boolean));
    const targetBrand = String(product.brand || '').toLowerCase();
    const words = new Set(
      `${product.title || ''} ${product.titleBn || ''} ${targetSub} ${(product.tags || []).join(' ')}`
        .toLowerCase()
        .split(/[\s,./|_-]+/)
        .filter((w) => w.length >= 3)
    );

    return visibleStoreProducts
      .filter((p) => p.id !== product.id)
      .map((cand) => {
        let score = 0;
        if (targetSub && String(cand.subcategory || '').toLowerCase() === targetSub) score += 16;
        if (targetCat && String(cand.category || '').toLowerCase() === targetCat) score += 10;
        (cand.tags || []).forEach((tg) => {
          if (targetTags.has(String(tg).trim().toLowerCase())) score += 7;
        });
        const candText = `${cand.title || ''} ${cand.titleBn || ''} ${cand.subcategory || ''} ${(cand.tags || []).join(' ')}`.toLowerCase();
        words.forEach((w) => {
          if (candText.includes(w)) score += 2;
        });
        if (targetBrand && String(cand.brand || '').toLowerCase() === targetBrand) score += 3;
        if (product.price > 0 && Math.abs(cand.price - product.price) / product.price <= 0.45) score += 2;
        if ((cand.stock ?? 0) > 0) score += 2;
        return { cand, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => x.cand);
  }, [product?.id, product?.category, product?.subcategory, product?.tags, visibleStoreProducts]);

  // Fetch AI-driven Related Products using category, subcategory & tags
  useEffect(() => {
    if (!product?.id) {
      setAiRelatedIds(null);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    setIsLoadingRelated(true);
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
        if (cancelled || !data?.ok) return;
        const ids = Array.isArray(data.productIds)
          ? data.productIds.map(String)
          : Array.isArray(data.products)
          ? data.products.map((p: any) => String(p.id))
          : [];
        setAiRelatedIds(ids);
        setAiRelatedReasonEn(data.reasonEn || '');
        setAiRelatedReasonBn(data.reasonBn || '');
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingRelated(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [product?.id, product?.category, product?.subcategory, JSON.stringify(product?.tags || []), lang]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    if (aiRelatedIds && aiRelatedIds.length > 0) {
      const map = new Map(visibleStoreProducts.filter((p) => p.id !== product.id).map((p) => [p.id, p]));
      const resolved = aiRelatedIds.map((id) => map.get(id)).filter(Boolean) as Product[];
      if (resolved.length > 0) return resolved.slice(0, 4);
    }
    return fallbackRelatedProducts;
  }, [aiRelatedIds, fallbackRelatedProducts, visibleStoreProducts, product?.id]);

  if (!product) return null;

  const activeColor = selectedColor || product.colors?.[0] || '';
  const activeSize = selectedSize || product.sizes?.[0] || '';
  const productReviews = reviews.filter((r) => r.productId === product.id && r.isApproved !== false);
  const realStats = getProductRealStats(product.id);
  const wishlisted = isWishlisted(product.id);
  const comparing = isComparing(product.id);

  // District delivery estimator
  const selectedDistObj = BD_DISTRICTS.find((d) => d.name === estimatorDistrict) || BD_DISTRICTS[0];
  const estimatedDeliveryFee = product.freeShipping
    ? 0
    : selectedDistObj.zone === 'dhaka_inside'
    ? product.customDeliveryFees?.dhakaInside ?? settings.deliveryFees.dhakaInside
    : selectedDistObj.zone === 'dhaka_sub'
    ? product.customDeliveryFees?.dhakaSub ?? settings.deliveryFees.dhakaSub
    : product.customDeliveryFees?.dhakaOutside ?? settings.deliveryFees.dhakaOutside;
  const deliveryRange = calculateEstimatedDeliveryRange(selectedDistObj.zone, lang);
  const estimatedEta = deliveryRange.windowLabel;

  // Category & Subcategory labels in active language
  const catObj = categories.find((c) => c.slug === product.category);
  const subObj = catObj?.subcategories?.find((s) => s.slug === product.subcategory);
  const categoryDisplay =
    lang === 'bn'
      ? catObj?.nameBn || product.categoryBn || product.category
      : catObj?.nameEn || product.category;
  const subcategoryDisplay = subObj
    ? lang === 'bn'
      ? subObj.nameBn
      : subObj.nameEn
    : product.subcategory || '';

  const isOutOfStock = (product.stock ?? 0) <= 0;
  const brandLabel =
    lang === 'bn'
      ? product.brandBn || settings.storeNameBn || product.brand
      : product.brand || settings.storeName;
  const partnerPrice = getPartnerPriceInfo(product, quantity);
  const displayUnitPrice = partnerPrice.unitPrice;
  const canonicalProductUrl = getProductCanonicalUrl(product);

  const variantSummary = [
    activeColor ? `${t('কালার', 'Color')}: ${activeColor}` : '',
    activeSize ? `${t('সাইজ', 'Size')}: ${activeSize}` : '',
    ...Object.entries(selectedAttributes || {}).map(([k, v]) => `${k}: ${v}`)
  ]
    .filter(Boolean)
    .join(', ');

  // Pure single-language title & description helpers (zero mixed scripts)
  const containsBangla = (txt?: string) => Boolean(txt && /[\u0980-\u09F2\u09F4-\u09FF]/.test(txt));
  const titleText =
    lang === 'bn'
      ? product.titleBn || product.title
      : !containsBangla(product.title) && product.title?.trim()
      ? product.title
      : product.titleBn;

  const descriptionText = (() => {
    if (lang === 'bn') {
      return product.descriptionBn?.trim() || `${titleText} — ১০০% অরিজিনাল পণ্য, সারাদেশে ক্যাশ অন ডেলিভারি ও ৭ দিনের সহজ রিপ্লেসমেন্ট সুবিধা।`;
    }
    if (product.description?.trim() && !containsBangla(product.description)) {
      return product.description.trim();
    }
    return `${titleText} in ${categoryDisplay}${brandLabel ? ` by ${brandLabel}` : ''}. 100% authentic quality with nationwide Cash on Delivery across Bangladesh and ${product.warrantyInfo || '7-day easy replacement guarantee'}.`;
  })();

  const featureList =
    lang === 'bn'
      ? product.featuresBn && product.featuresBn.length > 0
        ? product.featuresBn
        : undefined
      : product.features && product.features.length > 0
      ? product.features.filter((f) => !containsBangla(f))
      : undefined;

  const relatedReasonText =
    lang === 'bn'
      ? aiRelatedReasonBn ||
        t(
          'একই ক্যাটাগরি, সাব-ক্যাটাগরি এবং পণ্যের ট্যাগের ভিত্তিতে বাছাইকৃত সেরা পণ্যসমূহ।',
          ''
        )
      : aiRelatedReasonEn ||
        'Curated using category, subcategory, and product tags for best compatibility.';

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
    addToCart(product, quantity, activeColor, activeSize, selectedAttributes);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(canonicalProductUrl).catch(() => {});
    }
    addToast('info', t('লিংক কপি হয়েছে!', 'Link Copied!'), canonicalProductUrl);
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

  const waOrderHref = `https://wa.me/${(() => {
    const d = String(settings.whatsappNumber || '+8801917942662').replace(/[^0-9]/g, '');
    return d.startsWith('88') ? d : `88${d}`;
  })()}?text=${encodeURIComponent(
    lang === 'bn'
      ? `আসসালামু আলাইকুম ${settings.storeNameBn || settings.storeName},\nআমি এই পণ্যটি অর্ডার করতে চাই:\nপণ্য: ${titleText}\n${variantSummary ? `ভ্যারিয়েন্ট: ${variantSummary}\n` : ''}পরিমাণ: ${quantity} পিস\nমোট মূল্য: ৳${(displayUnitPrice * quantity).toLocaleString()}\nলিংক: ${canonicalProductUrl}\n\nআমার নাম ও ঠিকানা:`
      : `Assalamu Alaikum ${settings.storeName},\nI would like to order this product:\nProduct: ${titleText}\n${variantSummary ? `Variant: ${variantSummary}\n` : ''}Quantity: ${quantity} pcs\nTotal Price: ৳${(displayUnitPrice * quantity).toLocaleString()}\nProduct URL: ${canonicalProductUrl}\n\nMy Name & Delivery Address:`
  )}`;

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
          aria-label={t('বন্ধ করুন', 'Close')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Tabs */}
        <div className="flex items-center px-6 pt-4 border-b border-slate-100 dark:border-slate-800 gap-4 text-xs font-bold overflow-x-auto pr-14">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 border-b-2 transition-colors shrink-0 cursor-pointer ${
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
              className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
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
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-500" />
            <span className="tabular-nums">
              {t('গ্রাহকদের রিভিউ', 'Customer Reviews')} ({realStats.reviewsCount.toLocaleString()})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('alert')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'alert'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('প্রাইস অ্যালার্ট', 'Price Alert')}</span>
          </button>
        </div>

        {/* Tab 1: Product Details + AI Related Products */}
        {activeTab === 'details' && (
          <div ref={modalBodyRef} className="p-5 sm:p-7 overflow-y-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Left: Interactive Zoom Image, Thumbs & Delivery Estimator */}
              <div className="space-y-3">
                <div
                  ref={imageContainerRef}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleMouseMove}
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-crosshair group select-none"
                >
                  {(product.images?.[selectedImageIdx]?.trim() || product.images?.[0]?.trim()) ? (
                    <img
                      src={product.images?.[selectedImageIdx]?.trim() || product.images?.[0]?.trim()}
                      alt={titleText}
                      className={`w-full h-full object-cover transition-transform duration-200 ${
                        isZoomed ? 'scale-150' : 'scale-100'
                      }`}
                      style={
                        isZoomed
                          ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
                          : undefined
                      }
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
                  )}

                  <div className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 pointer-events-none opacity-80 group-hover:opacity-100">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>{isZoomed ? t('জুম সক্রিয়', 'Zoomed') : t('জুম দেখতে হোভার করুন', 'Hover to zoom')}</span>
                  </div>
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {product.images
                      .filter((img) => img && img.trim())
                      .map((img, i) => (
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

                {/* Interactive District Delivery Calculator & Guarantee */}
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70 dark:border-slate-700">
                    <label className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('ডেলিভারি জেলা:', 'Deliver To:')}</span>
                    </label>
                    <select
                      value={estimatorDistrict}
                      onChange={(e) => setEstimatorDistrict(e.target.value)}
                      className="flex-1 min-w-0 max-w-[210px] px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      {BD_DISTRICTS.map((dist) => (
                        <option key={dist.name} value={dist.name}>
                          {lang === 'bn' ? dist.nameBn : dist.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-2 tabular-nums">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {t('ডেলিভারি ফি:', 'Courier Fee:')}{' '}
                        <strong className="text-slate-900 dark:text-white">
                          {estimatedDeliveryFee === 0 ? t('সম্পূর্ণ ফ্রি', 'FREE') : `৳${estimatedDeliveryFee}`}
                        </strong>
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      {estimatedEta}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 tabular-nums pt-1 border-t border-slate-200/70 dark:border-slate-700/70">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('সম্ভাব্য ডেলিভারি তারিখ:', 'Estimated Delivery:')}</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-900 dark:text-white">
                      {deliveryRange.dateRangeLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {lang === 'bn'
                        ? product.warrantyInfoBn || '১০০% আসল প্রোডাক্ট ও রিপ্লেসমেন্ট সুবিধা'
                        : product.warrantyInfo || '100% Genuine product with replacement guarantee'}
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
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        {categoryDisplay}
                        {subcategoryDisplay ? ` · ${subcategoryDisplay}` : ''}
                      </span>
                      {brandLabel && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                          <Tag className="w-3 h-3 text-emerald-500" />
                          {brandLabel}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-semibold">
                      {t('কোড:', 'SKU:')} {product.sku}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                    {titleText}
                  </h2>

                  {/* Rating & Live View Counter */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 tabular-nums">
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(realStats.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{realStats.averageRating}</span>
                    <span className="text-xs text-slate-400">
                      ({realStats.reviewsCount.toLocaleString()} {t('রিভিউ', 'reviews')} · {realStats.soldCount.toLocaleString()}+ {t('বিক্রি', 'sold')})
                    </span>
                    {settings.viewerCounter?.enabled !== false && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        <span aria-hidden="true">·</span>
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {getProductViewCount(product.id).toLocaleString()}{' '}
                          {t(settings.viewerCounter?.labelBn || 'জন দেখেছেন', settings.viewerCounter?.labelEn || 'views')}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Price (Strictly Partner-Aware) */}
                  <div className="mt-3 space-y-1.5 tabular-nums">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        ৳ {displayUnitPrice.toLocaleString()}
                      </span>
                      {product.originalPrice > displayUnitPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          ৳ {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        · {t('ক্যাশ অন ডেলিভারি', 'Cash on Delivery')}
                      </span>
                    </div>
                    {partnerPrice.mode === 'reseller' && (
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {t('রিসেলার মূল্য সক্রিয়', 'Reseller Rate Active')} · {t('খুচরা মূল্য', 'Retail')} ৳{product.price.toLocaleString()} ·{' '}
                        {t('লাভ', 'Margin')} ৳{(partnerPrice.estimatedProfitPerUnit || 0).toLocaleString()}/{t('পিস', 'unit')}
                      </p>
                    )}
                    {partnerPrice.mode === 'wholesale' && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] space-y-1">
                        <p className="font-bold text-emerald-800 dark:text-emerald-300">
                          {t('হোলসেল ট্রেড রেট', 'Approved B2B Trade Rate')} · {t('ন্যূনতম', 'MOQ')} {partnerPrice.minQty || 10} {t('পিস', 'pcs')}
                        </p>
                        {product.wholesaleTiers && product.wholesaleTiers.length > 0 && (
                          <div className="flex flex-wrap gap-2 text-slate-700 dark:text-slate-300 font-mono">
                            {product.wholesaleTiers.map((tier) => (
                              <span key={tier.minQty}>
                                {tier.minQty}+ {t('পিস', 'pcs')}: ৳{tier.unitPrice.toLocaleString()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                    {descriptionText}
                  </p>

                  {/* Bullet Features */}
                  {featureList && featureList.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {featureList.map((feat, i) => (
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
                            type="button"
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
                            type="button"
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

                  {/* Custom Dynamic Attributes */}
                  {product.attributes && product.attributes.length > 0 && (
                    <div className="mt-3 space-y-2.5">
                      {product.attributes.map((attr) => (
                        <div key={attr.id || attr.name}>
                          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                            {lang === 'bn' ? attr.nameBn || attr.name : attr.name}:
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {(attr.values || []).map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setSelectedAttributes((prev) => ({ ...prev, [attr.name]: val }))}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                                  (selectedAttributes[attr.name] || attr.values[0]) === val
                                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quantity + Save/Compare quick buttons */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('পরিমাণ:', 'Quantity:')}</span>
                      <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 text-xs font-bold text-slate-900 dark:text-white tabular-nums">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => q + 1)}
                          className="px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          wishlisted
                            ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-300'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-300'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{wishlisted ? t('পছন্দে আছে', 'Saved') : t('পছন্দ করুন', 'Save')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          toggleCompare(product.id);
                          if (!comparing) setIsCompareModalOpen(true);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          comparing
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>{comparing ? t('তুলনায় যুক্ত', 'Comparing') : t('তুলনা', 'Compare')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {isOutOfStock ? (
                    <button
                      type="button"
                      onClick={() => setIsWaitlistOpen(true)}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-3.5 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <BellRing className="w-4 h-4" />
                      <span>{t(settings.singleProductCms?.notifyMeBtnBn || 'স্টকে এলে জানান', settings.singleProductCms?.notifyMeBtnEn || 'Notify Me When Available')}</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleOrderNow}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-3 sm:py-3.5 px-2.5 sm:px-4 rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                      >
                        <span>
                          {t(
                            settings.cmsTexts?.orderNowBtnBn || 'এখনই কিনুন',
                            settings.cmsTexts?.orderNowBtnEn === 'Order Now' || !settings.cmsTexts?.orderNowBtnEn
                              ? 'Buy Now'
                              : settings.cmsTexts.orderNowBtnEn
                          )}
                        </span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </button>

                      <button
                        onClick={handleAddToCart}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm py-3 sm:py-3.5 px-2.5 sm:px-4 rounded-2xl border border-slate-700 shadow-lg flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{t('কার্টে রাখুন', 'Add to Cart')}</span>
                      </button>
                    </div>
                  )}

                  <a
                    href={waOrderHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl border border-emerald-500/40 flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{t('WhatsApp-এ অর্ডার করুন', 'Order Via WhatsApp')}</span>
                  </a>

                  <div className="grid grid-cols-2 gap-2">
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
                      <span>{t('লিংক কপি', 'Copy URL')}</span>
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 space-y-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={buildProductWhatsAppUrl(product, { variantText: variantSummary, quantity })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('পণ্য লিংকসহ WhatsApp চ্যাট', 'WhatsApp Chat With Link')}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          openWhatsAppWidgetForProduct(product, { variantText: variantSummary, quantity });
                        }}
                        className="py-2 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] cursor-pointer whitespace-nowrap"
                      >
                        {t('ইন-সাইট চ্যাট', 'Support Desk')}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-emerald-100 dark:border-slate-800">
                      <span className="truncate flex-1">{canonicalProductUrl}</span>
                      <button
                        type="button"
                        onClick={handleShare}
                        className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-0.5 cursor-pointer shrink-0"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{t('কপি', 'Copy')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI-Driven Related Products Section (uses Category, Subcategory & Product Tags) */}
            {relatedProducts.length > 0 && (
              <section className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{t('আপনার জন্য এআই সম্পর্কিত পণ্য', 'AI-Curated Related Products')}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {isLoadingRelated
                        ? t('ক্যাটাগরি ও ট্যাগ মিলিয়ে সেরা পণ্য খুঁজছে...', 'Matching category, subcategory & product tags...')
                        : relatedReasonText}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openProductPage(product);
                    }}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <span>{t('পূর্ণ প্রোডাক্ট পেজ দেখুন', 'Open Full Product Page')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {relatedProducts.map((rel) => {
                    const relStats = getProductRealStats(rel.id);
                    const relPrice = getPartnerPriceInfo(rel, 1).unitPrice;
                    const relTitle =
                      lang === 'bn'
                        ? rel.titleBn || rel.title
                        : !containsBangla(rel.title) && rel.title?.trim()
                        ? rel.title
                        : rel.titleBn;
                    const relCat = categories.find((c) => c.slug === rel.category);
                    const relCatLabel =
                      lang === 'bn'
                        ? relCat?.nameBn || rel.categoryBn || rel.category
                        : relCat?.nameEn || rel.category;

                    return (
                      <div
                        key={`modal-rel-${rel.id}`}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-emerald-400 transition-colors p-2.5 flex flex-col justify-between gap-2 group"
                      >
                        <div
                          onClick={() => {
                            if (onSelectProduct) onSelectProduct(rel);
                            else {
                              onClose();
                              openProductPage(rel);
                            }
                          }}
                          className="cursor-pointer space-y-2"
                        >
                          <div className="aspect-square rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                            {rel.images?.[0]?.trim() ? (
                              <img
                                src={rel.images[0]}
                                alt={relTitle}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
                            )}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                              {relCatLabel}
                            </p>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                              {relTitle}
                            </h4>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 tabular-nums pt-0.5">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                              <span className="font-bold text-slate-700 dark:text-slate-300">{relStats.averageRating}</span>
                              <span>· {relStats.soldCount.toLocaleString()}+ {t('বিক্রি', 'sold')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-200/70 dark:border-slate-700/70 tabular-nums">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            ৳{relPrice.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => addToCart(rel, 1)}
                            disabled={(rel.stock ?? 0) <= 0}
                            className="px-2 py-1 rounded-lg bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-40 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>{t('কার্ট', 'Add')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Tab 2: Video Demo Embed */}
        {activeTab === 'video' && embedUrl && (
          <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-black">
              <iframe
                src={embedUrl}
                title={titleText}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-4 text-center">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{titleText}</h4>
              <p className="text-xs text-slate-500 mt-1">{t('ভিডিও ডেমো ও আনবক্সিং রিভিউ', 'Video demonstration & unboxing review')}</p>
            </div>
          </div>
        )}

        {/* Tab 3: Customer Reviews */}
        {activeTab === 'reviews' && (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {t('গ্রাহকদের বাস্তব অভিজ্ঞতা ও রিভিউ', 'Customer Reviews & Feedback')}
                </h4>
                <span className="text-xs font-semibold text-slate-500 tabular-nums">
                  {realStats.averageRating}★ · {realStats.reviewsCount.toLocaleString()} {t('মোট রেটিং', 'total ratings')} · {productReviews.length} {t('লিখিত', 'written')}
                </span>
              </div>

              {productReviews.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">{t('এই পণ্যে এখনো কোনো রিভিউ নেই। আপনি প্রথম রিভিউ দিন!', 'No reviews yet for this product. Be the first to review!')}</p>
              ) : (
                <div className="space-y-3">
                  {(showAllModalReviews ? productReviews : productReviews.slice(0, 6)).map((rev) => (
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
                  {productReviews.length > 6 && (
                    <button
                      type="button"
                      onClick={() => setShowAllModalReviews((prev) => !prev)}
                      className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 cursor-pointer"
                    >
                      {showAllModalReviews
                        ? t('কম দেখুন', 'Show Fewer')
                        : t(`সব ${productReviews.length}টি লিখিত রিভিউ দেখুন`, `View All ${productReviews.length} Written Reviews`)}
                    </button>
                  )}
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
                        className="text-amber-400 p-0.5 cursor-pointer"
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('রিভিউ জমা দিন', 'Submit Review')}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 4: Price Drop Alert Form */}
        {activeTab === 'alert' && (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-5 max-w-lg mx-auto w-full">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {t('মূল্য কমার নোটিফিকেশন সেট করুন', 'Set Price Drop Alert')}
              </h4>
              <p className="text-xs text-slate-500">
                {t(
                  `পণ্যটির বর্তমান মূল্য ৳${product.price.toLocaleString()}। মূল্য কমলেই আপনাকে এসএমএস বা ইমেইলে জানিয়ে দেওয়া হবে।`,
                  `Current price is ৳${product.price.toLocaleString()}. We will notify you immediately when the price drops.`
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
                  placeholder={t('017XXXXXXXX অথবা ইমেইল', '017XXXXXXXX or you@gmail.com')}
                  value={alertContact}
                  onChange={(e) => setAlertContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('টার্গেট মূল্য', 'Target Alert Price (BDT)')}
                </label>
                <input
                  type="number"
                  required
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-600"
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
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>{t('প্রাইস অ্যালার্ট চালু করুন', 'Activate Price Drop Alert')}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {isWaitlistOpen && (
        <WaitlistModal
          product={product}
          onClose={() => setIsWaitlistOpen(false)}
        />
      )}
    </div>
  );
};
