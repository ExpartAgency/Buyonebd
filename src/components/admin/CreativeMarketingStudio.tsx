import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Film,
  Image as ImageIcon,
  Layout,
  Play,
  RefreshCw,
  Sparkles,
  Square,
  Upload,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Layers,
  CheckSquare,
  BookmarkPlus
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

type CreativeFormat = 'banner' | 'post' | 'portrait' | 'reel' | 'landscape';
type TransitionStyle = 'crossfade' | 'slide' | 'ken_burns';

interface CreativeTheme {
  id: string;
  label: string;
  bgStart: string;
  bgEnd: string;
  accent: string;
}

interface ManualBatchRow {
  id: string;
  headline: string;
  subtext: string;
  price: number;
  ctaText: string;
  imageUrl: string;
}

interface GeneratedBatchOutput {
  id: string;
  title: string;
  type: 'image' | 'video';
  formatLabel: string;
  url: string;
  filename: string;
}

const CREATIVE_THEMES: CreativeTheme[] = [
  { id: 'emerald', label: 'Emerald Brand', bgStart: '#064e3b', bgEnd: '#022c22', accent: '#34d399' },
  { id: 'flash', label: 'Flash Rose & Gold', bgStart: '#881337', bgEnd: '#0f172a', accent: '#fbbf24' },
  { id: 'royal', label: 'Midnight Cyber', bgStart: '#1e1b4b', bgEnd: '#09090b', accent: '#38bdf8' },
  { id: 'sunset', label: 'Warm Saffron', bgStart: '#7c2d12', bgEnd: '#18181b', accent: '#fb923c' }
];

const FORMAT_DIMENSIONS: Record<CreativeFormat, { w: number; h: number; labelBn: string; labelEn: string }> = {
  banner: { w: 1200, h: 628, labelBn: 'এফবি অ্যাড ব্যানার (1200×628)', labelEn: 'Ad Banner (1200×628)' },
  post: { w: 1080, h: 1080, labelBn: '১:১ স্কয়ার পোস্ট (1080×1080)', labelEn: '1:1 Square (1080×1080)' },
  portrait: { w: 1080, h: 1350, labelBn: '৪:৫ পোর্ট্রেট পোস্ট (1080×1350)', labelEn: '4:5 Portrait (1080×1350)' },
  reel: { w: 1080, h: 1920, labelBn: '৯:১৬ রিলস ভিডিও (1080×1920)', labelEn: '9:16 Reels (1080×1920)' },
  landscape: { w: 1280, h: 720, labelBn: '১৬:৯ প্রো ভিডিও (1280×720)', labelEn: '16:9 HD Video (1280×720)' }
};

const loadImageSafe = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    if (!src?.trim()) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

export const CreativeMarketingStudio: React.FC<{ ta: (bn: string, en: string) => string }> = ({ ta }) => {
  const { products, settings, mediaLibrary, registerMediaItem, addToast } = useStore();
  const [format, setFormat] = useState<CreativeFormat>('post');
  const [transitionStyle, setTransitionStyle] = useState<TransitionStyle>('ken_burns');
  const [selectedProductId, setSelectedProductId] = useState<string>(() => products[0]?.id || '');
  const [themeId, setThemeId] = useState<string>('emerald');
  const [headline, setHeadline] = useState('MEGA FLASH OFFER');
  const [subtext, setSubtext] = useState('Cash on Delivery · 64 Districts Express');
  const [ctaText, setCtaText] = useState('BUY NOW');
  const [couponText, setCouponText] = useState('SAVE100');
  const [isRecordingReel, setIsRecordingReel] = useState(false);
  const [reelProgress, setReelProgress] = useState(0);
  const [isAnimatingPreview, setIsAnimatingPreview] = useState(true);

  // Multi-Photo Shot List Picker
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>(() =>
    products[0]?.images?.length ? products[0].images.slice(0, 4) : []
  );
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Bulk Batch Studio State
  const [batchMode, setBatchMode] = useState<'catalog' | 'manual'>('catalog');
  const [batchFormat, setBatchFormat] = useState<CreativeFormat>('post');
  const [batchSelectedProductIds, setBatchSelectedProductIds] = useState<string[]>(() =>
    products.slice(0, 3).map((p) => p.id)
  );
  const [autoSaveBatchToLibrary, setAutoSaveBatchToLibrary] = useState(true);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgressText, setBatchProgressText] = useState('');
  const [batchOutputs, setBatchOutputs] = useState<GeneratedBatchOutput[]>([]);

  // Manual Batch Queue
  const [manualRows, setManualRows] = useState<ManualBatchRow[]>([
    {
      id: 'man-1',
      headline: 'EID MEGA GADGET OFFER',
      subtext: '64-District Express Cash on Delivery',
      price: 1490,
      ctaText: 'BUY NOW',
      imageUrl: products[0]?.images?.[0] || ''
    }
  ]);
  const [newManualHeadline, setNewManualHeadline] = useState('');
  const [newManualSubtext, setNewManualSubtext] = useState('100% Authentic · Cash on Delivery');
  const [newManualPrice, setNewManualPrice] = useState('1290');
  const [newManualCta, setNewManualCta] = useState('BUY NOW');
  const [newManualImgUrl, setNewManualImgUrl] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedImagesRef = useRef<HTMLImageElement[]>([]);
  const animPhaseRef = useRef<number>(0);

  const product = products.find((p) => p.id === selectedProductId) || products[0];
  const theme = CREATIVE_THEMES.find((t) => t.id === themeId) || CREATIVE_THEMES[0];
  const dim = FORMAT_DIMENSIONS[format];

  // Auto-populate headline/subtext/photos when switching product
  useEffect(() => {
    if (!product) return;
    setHeadline(product.title.slice(0, 36).toUpperCase());
    setSubtext(`${product.brand ? product.brand + ' · ' : ''}Was ৳${product.originalPrice} · Now Only ৳${product.price}`);
    if (product.images?.length) {
      setSelectedPhotos(product.images.slice(0, 5));
    }
  }, [product?.id]);

  // Preload all selected shots for multi-photo pro video transitions
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.all(selectedPhotos.map((src) => loadImageSafe(src)));
      if (!cancelled) {
        loadedImagesRef.current = results.filter((img): img is HTMLImageElement => Boolean(img));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedPhotos]);

  const drawCreativeFrame = (
    ctx: CanvasRenderingContext2D,
    opts: {
      w: number;
      h: number;
      phase: number;
      fmt: CreativeFormat;
      th: CreativeTheme;
      hl: string;
      sub: string;
      price: number;
      discountPct: number;
      cta: string;
      coupon: string;
      imgs: HTMLImageElement[];
      fallbackTitle: string;
      transition: TransitionStyle;
      animateFloat: boolean;
    }
  ) => {
    const { w, h, phase, fmt, th, hl, sub, price, discountPct, cta, coupon, imgs, fallbackTitle, transition, animateFloat } = opts;
    ctx.clearRect(0, 0, w, h);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, th.bgStart);
    grad.addColorStop(1, th.bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Animated ambient glow orb
    const pulse = Math.sin(phase * Math.PI * 2) * 35;
    const orbGrad = ctx.createRadialGradient(w * 0.78, h * 0.28 + pulse, 20, w * 0.78, h * 0.28 + pulse, w * 0.45);
    orbGrad.addColorStop(0, `${th.accent}44`);
    orbGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = orbGrad;
    ctx.fillRect(0, 0, w, h);

    // Top-left geometric motif
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let gx = 48; gx < 280; gx += 28) {
      for (let gy = 48; gy < 180; gy += 28) {
        ctx.beginPath();
        ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const storeBrand = (settings.storeName || 'BuyOne BD').toUpperCase();

    const roundRect = (x: number, y: number, rw: number, rh: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + rw, y, x + rw, y + rh, r);
      ctx.arcTo(x + rw, y + rh, x, y + rh, r);
      ctx.arcTo(x, y + rh, x, y, r);
      ctx.arcTo(x, y, x + rw, y, r);
      ctx.closePath();
    };

    const drawCoverImage = (img: HTMLImageElement, px: number, py: number, pw: number, ph: number, zoomFactor = 1, xShift = 0) => {
      const scale = Math.max(pw / img.width, ph / img.height) * zoomFactor;
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, px + (pw - dw) / 2 + xShift, py + (ph - dh) / 2, dw, dh);
    };

    const drawProductCard = (px: number, py: number, pw: number, ph: number) => {
      const floatY = fmt === 'reel' || animateFloat ? Math.sin(phase * Math.PI * 2) * 10 : 0;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 20;
      roundRect(px, py + floatY, pw, ph, 34);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.clip();

      if (imgs.length > 0) {
        const count = imgs.length;
        const totalSeg = phase * count;
        const currIdx = Math.floor(totalSeg) % count;
        const nextIdx = (currIdx + 1) % count;
        const localT = totalSeg - Math.floor(totalSeg);
        const currImg = imgs[currIdx];
        const nextImg = imgs[nextIdx];

        try {
          if (count === 1 || transition === 'ken_burns') {
            const zoom = 1 + 0.09 * Math.sin(localT * Math.PI);
            const pan = (localT - 0.5) * 28;
            drawCoverImage(currImg, px, py + floatY, pw, ph, zoom, pan);
            if (count > 1 && localT > 0.78) {
              ctx.globalAlpha = (localT - 0.78) / 0.22;
              drawCoverImage(nextImg, px, py + floatY, pw, ph, 1.03, 0);
              ctx.globalAlpha = 1;
            }
          } else if (transition === 'slide') {
            const wipeT = localT > 0.72 ? (localT - 0.72) / 0.28 : 0;
            drawCoverImage(currImg, px - wipeT * pw, py + floatY, pw, ph, 1, 0);
            if (wipeT > 0) {
              drawCoverImage(nextImg, px + (1 - wipeT) * pw, py + floatY, pw, ph, 1, 0);
            }
          } else {
            // Crossfade
            drawCoverImage(currImg, px, py + floatY, pw, ph, 1.02, 0);
            if (localT > 0.72) {
              ctx.globalAlpha = (localT - 0.72) / 0.28;
              drawCoverImage(nextImg, px, py + floatY, pw, ph, 1.02, 0);
              ctx.globalAlpha = 1;
            }
          }
        } catch {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px, py + floatY, pw, ph);
        }

        // Shot counter indicator pill for multi-photo reels
        if (count > 1) {
          const barW = Math.min(34, Math.floor((pw - 48) / count));
          for (let sIdx = 0; sIdx < count; sIdx++) {
            roundRect(px + 20 + sIdx * (barW + 6), py + floatY + ph - 18, barW, 5, 3);
            ctx.fillStyle = sIdx === currIdx ? th.accent : 'rgba(15,23,42,0.45)';
            ctx.fill();
          }
        }
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px, py + floatY, pw, ph);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 34px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(fallbackTitle.slice(0, 22) || 'Featured Product', px + pw / 2, py + floatY + ph / 2);
        ctx.textAlign = 'left';
      }
      ctx.restore();

      // Discount sticker
      if (discountPct > 0) {
        ctx.save();
        roundRect(px + pw - 190, py + floatY + 20, 168, 58, 16);
        ctx.fillStyle = '#e11d48';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`-${discountPct}% OFF`, px + pw - 106, py + floatY + 59);
        ctx.restore();
      }
    };

    const drawWrappedText = (text: string, x: number, y: number, maxW: number, lineHeight: number, maxLines = 3) => {
      const words = text.split(/\s+/);
      let line = '';
      let cy = y;
      let linesDrawn = 0;
      for (let i = 0; i < words.length; i++) {
        const test = line ? `${line} ${words[i]}` : words[i];
        if (ctx.measureText(test).width > maxW && line) {
          ctx.fillText(line, x, cy);
          line = words[i];
          cy += lineHeight;
          linesDrawn++;
          if (linesDrawn >= maxLines - 1) break;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, x, cy);
      return cy + lineHeight;
    };

    if (fmt === 'banner' || fmt === 'landscape') {
      const scaleH = h / 628;
      const scaleW = w / 1200;
      roundRect(64 * scaleW, 54 * scaleH, 250 * scaleW, 46 * scaleH, 22);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fill();
      ctx.fillStyle = th.accent;
      ctx.font = `900 ${Math.round(22 * scaleH)}px sans-serif`;
      ctx.fillText(storeBrand, 88 * scaleW, 84 * scaleH);

      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${Math.round(52 * scaleH)}px sans-serif`;
      const afterTitleY = drawWrappedText(hl, 64 * scaleW, 175 * scaleH, 580 * scaleW, 64 * scaleH, 3);

      ctx.fillStyle = 'rgba(226,232,240,0.9)';
      ctx.font = `600 ${Math.round(26 * scaleH)}px sans-serif`;
      drawWrappedText(sub, 64 * scaleW, Math.max(afterTitleY + 12, 340 * scaleH), 580 * scaleW, 36 * scaleH, 2);

      ctx.fillStyle = th.accent;
      ctx.font = `900 ${Math.round(60 * scaleH)}px monospace`;
      ctx.fillText(`৳${price.toLocaleString()}`, 64 * scaleW, 495 * scaleH);

      roundRect(64 * scaleW, 524 * scaleH, 270 * scaleW, 64 * scaleH, 18);
      ctx.fillStyle = th.accent;
      ctx.fill();
      ctx.fillStyle = '#09090b';
      ctx.font = `900 ${Math.round(26 * scaleH)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(cta, 199 * scaleW, 565 * scaleH);
      ctx.textAlign = 'left';

      if (coupon.trim()) {
        roundRect(354 * scaleW, 524 * scaleH, 250 * scaleW, 64 * scaleH, 18);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(22 * scaleH)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`CODE: ${coupon.trim()}`, 479 * scaleW, 564 * scaleH);
        ctx.textAlign = 'left';
      }

      drawProductCard(685 * scaleW, 56 * scaleH, 460 * scaleW, 516 * scaleH);
    } else if (fmt === 'post' || fmt === 'portrait') {
      const yOffset = fmt === 'portrait' ? 85 : 0;
      roundRect(64, 52, 260, 48, 24);
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fill();
      ctx.fillStyle = th.accent;
      ctx.font = '900 24px sans-serif';
      ctx.fillText(storeBrand, 92, 85);

      if (coupon.trim()) {
        roundRect(746, 52, 270, 48, 24);
        ctx.fillStyle = th.accent;
        ctx.fill();
        ctx.fillStyle = '#09090b';
        ctx.font = '900 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`COUPON: ${coupon.trim()}`, 881, 84);
        ctx.textAlign = 'left';
      }

      drawProductCard(160, 128, 760, fmt === 'portrait' ? 680 : 510);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 52px sans-serif';
      ctx.textAlign = 'center';
      drawWrappedText(hl, 540, 725 + yOffset * 2, 940, 60, 2);

      ctx.fillStyle = 'rgba(226,232,240,0.88)';
      ctx.font = '600 28px sans-serif';
      ctx.fillText(sub.slice(0, 58), 540, 850 + yOffset * 2.1);

      ctx.fillStyle = th.accent;
      ctx.font = '900 72px monospace';
      ctx.fillText(`৳${price.toLocaleString()}`, 320, 972 + yOffset * 2.3);

      roundRect(570, 906 + yOffset * 2.3, 340, 84, 24);
      ctx.fillStyle = th.accent;
      ctx.fill();
      ctx.fillStyle = '#09090b';
      ctx.font = '900 32px sans-serif';
      ctx.fillText(cta, 740, 960 + yOffset * 2.3);
      ctx.textAlign = 'left';
    } else {
      // 1080 x 1920 Vertical 9:16 Reels
      roundRect(340, 90, 400, 58, 29);
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fill();
      ctx.fillStyle = th.accent;
      ctx.font = '900 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(storeBrand, 540, 129);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 66px sans-serif';
      drawWrappedText(hl, 540, 250, 920, 76, 3);

      drawProductCard(130, 455, 820, 830);

      ctx.fillStyle = 'rgba(226,232,240,0.92)';
      ctx.font = '600 34px sans-serif';
      drawWrappedText(sub, 540, 1370, 920, 46, 2);

      ctx.fillStyle = th.accent;
      ctx.font = '900 96px monospace';
      ctx.fillText(`৳${price.toLocaleString()}`, 540, 1555);

      if (coupon.trim()) {
        roundRect(290, 1600, 500, 62, 18);
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px monospace';
        ctx.fillText(`USE CODE: ${coupon.trim()}`, 540, 1641);
      }

      const btnScale = 1 + Math.sin(phase * Math.PI * 4) * 0.03;
      const bw = 720 * btnScale;
      const bh = 104 * btnScale;
      roundRect(540 - bw / 2, 1720 - bh / 2, bw, bh, 32);
      ctx.fillStyle = th.accent;
      ctx.fill();
      ctx.fillStyle = '#09090b';
      ctx.font = '900 40px sans-serif';
      ctx.fillText(`${cta} ↑`, 540, 1734);
      ctx.textAlign = 'left';
    }
  };

  // Continuous live canvas render loop
  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();
    const render = (now: number) => {
      const dt = (now - lastTs) / 1000;
      lastTs = now;
      if (isAnimatingPreview || isRecordingReel) {
        const speed = selectedPhotos.length > 1 ? 0.22 : 0.35;
        animPhaseRef.current = (animPhaseRef.current + dt * speed) % 1;
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const discountPct =
            product && product.originalPrice > product.price
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 25;
          drawCreativeFrame(ctx, {
            w: dim.w,
            h: dim.h,
            phase: animPhaseRef.current,
            fmt: format,
            th: theme,
            hl: headline,
            sub: subtext,
            price: product?.price || 1490,
            discountPct,
            cta: ctaText,
            coupon: couponText,
            imgs: loadedImagesRef.current,
            fallbackTitle: product?.title || 'BuyOne BD',
            transition: transitionStyle,
            animateFloat: isAnimatingPreview
          });
        }
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  });

  const handleUploadPhotos = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result;
        if (typeof dataUrl === 'string') {
          setSelectedPhotos((prev) => [...prev, dataUrl]);
          registerMediaItem({
            name: file.name,
            url: dataUrl,
            source: 'upload',
            width: 800,
            height: 800,
            sizeKb: Math.max(1, Math.round(file.size / 1024)),
            mimeType: file.type || 'image/png'
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDownloadPng = (saveToLib = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const url = canvas.toDataURL('image/png');
      if (saveToLib) {
        registerMediaItem({
          name: `Creative-${format}-${headline.slice(0, 18)}.png`,
          url,
          source: 'upload',
          width: dim.w,
          height: dim.h,
          sizeKb: Math.round((url.length * 0.75) / 1024),
          mimeType: 'image/png'
        });
        addToast('success', ta('গ্যালারিতে সেভ হয়েছে!', 'Saved to Media Library!'), `${dim.w}×${dim.h}px`);
        return;
      }
      const a = document.createElement('a');
      a.href = url;
      a.download = `buyone-${format}-${Date.now()}.png`;
      a.click();
      addToast('success', ta('ডিজাইন ডাউনলোড সম্পন্ন', 'Creative PNG Downloaded'), `${dim.w}×${dim.h}px`);
    } catch {
      addToast('warning', ta('ইমেজ এক্সপোর্ট সমস্যা', 'Export Blocked'), ta('বাহ্যিক ছবির CORS সীমাবদ্ধতার কারণে লোকাল ছবি ব্যবহার করুন।', 'External image CORS prevented PNG export. Try uploading a photo.'));
    }
  };

  const handleDownloadReelVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas || typeof (canvas as any).captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
      addToast('warning', ta('ব্রাউজার সাপোর্ট নেই', 'Video Export Unsupported'), ta('দয়া করে Chrome/Edge ব্যবহার করুন অথবা PNG ডাউনলোড করুন।', 'Use Chrome/Edge for WebM Video export or download PNG.'));
      return;
    }

    setIsAnimatingPreview(true);
    setIsRecordingReel(true);
    setReelProgress(0);

    setTimeout(() => {
      try {
        const stream = (canvas as any).captureStream(30);
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm';
        const recorder = new MediaRecorder(stream, { mimeType });
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) chunks.push(ev.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `buyone-${format}-pro-${Date.now()}.webm`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 4000);
          setIsRecordingReel(false);
          setReelProgress(100);
          addToast('success', ta('প্রো ভিডিও ডাউনলোড সম্পন্ন!', 'Pro Video Downloaded!'), `${dim.w}×${dim.h}px (${transitionStyle})`);
        };

        recorder.start();
        const startTime = Date.now();
        const durationMs = selectedPhotos.length > 1 ? Math.min(8000, selectedPhotos.length * 2200) : 4000;
        const interval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          setReelProgress(Math.min(100, Math.round((elapsed / durationMs) * 100)));
          if (elapsed >= durationMs) {
            clearInterval(interval);
            if (recorder.state !== 'inactive') recorder.stop();
          }
        }, 100);
      } catch {
        setIsRecordingReel(false);
        addToast('error', ta('ভিডিও রেন্ডার ব্যর্থ', 'Video Export Failed'), ta('আবার চেষ্টা করুন।', 'Could not record canvas stream.'));
      }
    }, 150);
  };

  // Offscreen Bulk Batch Generator (PNG Images & HD WebM Videos)
  const recordOffscreenVideo = (
    offCanvas: HTMLCanvasElement,
    drawTick: (phase: number) => void,
    durationMs = 2600
  ): Promise<string> =>
    new Promise((resolve, reject) => {
      if (typeof (offCanvas as any).captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
        return reject(new Error('MediaRecorder unsupported'));
      }
      const stream = (offCanvas as any).captureStream(25);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(URL.createObjectURL(blob));
      };
      recorder.start();
      const start = performance.now();
      const step = () => {
        const elapsed = performance.now() - start;
        const phase = Math.min(1, elapsed / durationMs);
        drawTick(phase);
        if (elapsed < durationMs) {
          requestAnimationFrame(step);
        } else if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      };
      requestAnimationFrame(step);
    });

  const handleRunBulkGeneration = async (modeType: 'image' | 'video') => {
    const itemsToProcess: { id: string; hl: string; sub: string; price: number; discountPct: number; cta: string; imgUrls: string[] }[] =
      batchMode === 'catalog'
        ? products
            .filter((p) => batchSelectedProductIds.includes(p.id))
            .map((p) => ({
              id: p.id,
              hl: p.title.slice(0, 36).toUpperCase(),
              sub: `${p.brand ? p.brand + ' · ' : ''}Was ৳${p.originalPrice} · Now ৳${p.price}`,
              price: p.price,
              discountPct: p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 20,
              cta: ctaText,
              imgUrls: p.images || []
            }))
        : manualRows.map((m) => ({
            id: m.id,
            hl: m.headline,
            sub: m.subtext,
            price: m.price,
            discountPct: 20,
            cta: m.ctaText || 'BUY NOW',
            imgUrls: m.imageUrl ? [m.imageUrl] : []
          }));

    if (itemsToProcess.length === 0) {
      addToast('warning', ta('কোনো আইটেম নির্বাচিত নয়', 'Select Items First'), ta('কমপক্ষে ১টি প্রোডাক্ট বা ম্যানুয়াল রো নির্বাচন করুন।', 'Select at least 1 catalog product or manual row.'));
      return;
    }

    setIsBatchRunning(true);
    const outDim = FORMAT_DIMENSIONS[batchFormat];
    const offCanvas = document.createElement('canvas');
    offCanvas.width = outDim.w;
    offCanvas.height = outDim.h;
    const ctx = offCanvas.getContext('2d');
    if (!ctx) {
      setIsBatchRunning(false);
      return;
    }

    const generatedList: GeneratedBatchOutput[] = [];
    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];
      setBatchProgressText(`${i + 1}/${itemsToProcess.length}: ${item.hl.slice(0, 22)}...`);
      const loaded = (await Promise.all(item.imgUrls.slice(0, 3).map(loadImageSafe))).filter((x): x is HTMLImageElement => Boolean(x));

      if (modeType === 'image') {
        drawCreativeFrame(ctx, {
          w: outDim.w,
          h: outDim.h,
          phase: 0.25,
          fmt: batchFormat,
          th: theme,
          hl: item.hl,
          sub: item.sub,
          price: item.price,
          discountPct: item.discountPct,
          cta: item.cta,
          coupon: couponText,
          imgs: loaded,
          fallbackTitle: item.hl,
          transition: transitionStyle,
          animateFloat: false
        });
        try {
          const dataUrl = offCanvas.toDataURL('image/png');
          generatedList.push({
            id: `out-${item.id}-${Date.now()}`,
            title: item.hl,
            type: 'image',
            formatLabel: `${outDim.w}×${outDim.h}`,
            url: dataUrl,
            filename: `buyone-bulk-${item.id}.png`
          });
          if (autoSaveBatchToLibrary) {
            registerMediaItem({
              name: `Bulk-${item.hl.slice(0, 18)}.png`,
              url: dataUrl,
              source: 'upload',
              width: outDim.w,
              height: outDim.h,
              sizeKb: Math.round((dataUrl.length * 0.75) / 1024),
              mimeType: 'image/png'
            });
          }
        } catch {}
      } else {
        try {
          const videoUrl = await recordOffscreenVideo(offCanvas, (phase) => {
            drawCreativeFrame(ctx, {
              w: outDim.w,
              h: outDim.h,
              phase,
              fmt: batchFormat,
              th: theme,
              hl: item.hl,
              sub: item.sub,
              price: item.price,
              discountPct: item.discountPct,
              cta: item.cta,
              coupon: couponText,
              imgs: loaded,
              fallbackTitle: item.hl,
              transition: transitionStyle,
              animateFloat: true
            });
          });
          generatedList.push({
            id: `vid-${item.id}-${Date.now()}`,
            title: item.hl,
            type: 'video',
            formatLabel: `${outDim.w}×${outDim.h} WebM`,
            url: videoUrl,
            filename: `buyone-bulk-video-${item.id}.webm`
          });
        } catch {}
      }
    }

    setBatchOutputs((prev) => [...generatedList, ...prev]);
    setIsBatchRunning(false);
    setBatchProgressText('');
    addToast(
      'success',
      ta(`${generatedList.length}টি বাল্ক ক্রিয়েটিভ তৈরি হয়েছে!`, `Generated ${generatedList.length} Bulk Creatives!`),
      modeType === 'image' ? 'PNG Pack Ready' : 'WebM Pro Videos Ready'
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6">
      {/* Header & Format Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{ta('মার্কেটিং ক্রিয়েটিভ স্টুডিও (ব্যানার · মাল্টি-ফটো · প্রো ভিডিও ও বাল্ক)', 'Pro Marketing Creative Studio (Multi-Photo · Pro Video & Bulk)')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {ta('একাধিক ছবি আপলোড বা গ্যালারি থেকে পিক করে ট্রানজিশনসহ প্রো ভিডিও ও বাল্ক পোস্টার তৈরি করুন', 'Combine multiple photos with pro transitions, aspect ratios, and bulk catalog/manual video & image generation')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {([
            ['banner', 'Banner', Layout],
            ['post', '1:1 Post', ImageIcon],
            ['portrait', '4:5 IG', ImageIcon],
            ['reel', '9:16 Reels', Film],
            ['landscape', '16:9 HD', Film]
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFormat(id)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                format === id
                  ? id === 'reel' || id === 'landscape'
                    ? 'bg-rose-600 text-white'
                    : 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Controls */}
        <div className="lg:col-span-5 space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              {ta('পণ্য নির্বাচন করুন', 'Select Catalog Product')}
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (৳{p.price})
                </option>
              ))}
            </select>
          </div>

          {/* Multi-Photo Shot List Picker */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-sky-300">
                {ta(`মাল্টি-ফটো শট লিস্ট (${selectedPhotos.length})`, `Multi-Photo Shot List (${selectedPhotos.length})`)}
              </span>
              <div className="flex items-center gap-1.5">
                <label className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer">
                  <Upload className="w-3 h-3" />
                  <span>{ta('ছবি আপলোড', 'Upload')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      handleUploadPhotos(e.target.files);
                      e.currentTarget.value = '';
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker((v) => !v)}
                  className="px-2.5 py-1 rounded-lg bg-sky-950/70 hover:bg-sky-900 border border-sky-700/60 text-sky-300 font-bold text-[10px] cursor-pointer"
                >
                  {ta('গ্যালারি থেকে নিন', 'From Gallery')}
                </button>
              </div>
            </div>

            {selectedPhotos.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {selectedPhotos.map((src, idx) => (
                  <div key={`${idx}-${src.slice(0, 20)}`} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 shrink-0 group bg-slate-900">
                    {src?.trim() && <img src={src} alt={`Shot ${idx + 1}`} className="w-full h-full object-cover" />}
                    <div className="absolute inset-x-0 bottom-0 bg-black/75 flex items-center justify-between px-1 py-0.5 text-[9px]">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          if (idx === 0) return;
                          setSelectedPhotos((prev) => {
                            const next = [...prev];
                            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                            return next;
                          });
                        }}
                        className="text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowLeft className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPhotos((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === selectedPhotos.length - 1}
                        onClick={() => {
                          if (idx === selectedPhotos.length - 1) return;
                          setSelectedPhotos((prev) => {
                            const next = [...prev];
                            [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                            return next;
                          });
                        }}
                        className="text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showMediaPicker && (
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 block">Click photo to add into shot list:</span>
                <div className="grid grid-cols-5 gap-1.5 max-h-28 overflow-y-auto">
                  {mediaLibrary.slice(0, 15).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedPhotos((prev) => [...prev, m.url])}
                      className="aspect-square rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-400 cursor-pointer"
                    >
                      {m.url?.trim() && <img src={m.url} alt={m.name} className="w-full h-full object-cover" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pro Video Transition Selector & Theme */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                {ta('প্রো ভিডিও ট্রানজিশন', 'Pro Video Transition')}
              </label>
              <select
                value={transitionStyle}
                onChange={(e) => setTransitionStyle(e.target.value as TransitionStyle)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-amber-300 font-bold"
              >
                <option value="ken_burns">Ken Burns Pro Zoom/Pan</option>
                <option value="slide">Dynamic Slide Wipe</option>
                <option value="crossfade">Smooth Crossfade</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                {ta('থিম কালার গ্রেডিয়েন্ট', 'Color Theme')}
              </label>
              <select
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
              >
                {CREATIVE_THEMES.map((th) => (
                  <option key={th.id} value={th.id}>{th.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">{ta('হেডলাইন টেক্সট', 'Main Headline')}</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">{ta('সাব-টেক্সট / অফার লাইন', 'Subtext / Offer Line')}</label>
            <input
              type="text"
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">{ta('বাটন CTA টেক্সট', 'CTA Label')}</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">{ta('কুপন কোড (ঐচ্ছিক)', 'Promo Code Badge')}</label>
              <input
                type="text"
                value={couponText}
                onChange={(e) => setCouponText(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-mono uppercase"
              />
            </div>
          </div>

          <div className="pt-1 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleDownloadPng(false)}
              className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{ta('PNG ডাউনলোড', 'Download PNG')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadPng(true)}
              className="px-3 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              title="Save PNG into Store Media Library"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadReelVideo}
              disabled={isRecordingReel}
              className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isRecordingReel ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
              <span>
                {isRecordingReel
                  ? `${ta('রেন্ডার', 'Rendering')} ${reelProgress}%`
                  : ta('প্রো ভিডিও (WebM)', 'Export Pro Video')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsAnimatingPreview(!isAnimatingPreview)}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
              title="Toggle Live Motion"
            >
              {isAnimatingPreview ? <Square className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Live Canvas Preview */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[380px]">
          <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span>{ta(dim.labelBn, dim.labelEn)}</span>
            <span className="font-mono text-emerald-400">{dim.w} × {dim.h}px · {selectedPhotos.length} shot(s)</span>
          </div>
          <canvas
            ref={canvasRef}
            width={dim.w}
            height={dim.h}
            className="max-w-full max-h-[420px] w-auto h-auto rounded-xl border border-slate-800 shadow-2xl object-contain"
          />
        </div>
      </div>

      {/* BULK IMAGE & VIDEO GENERATOR STUDIO (Catalog Multi-Select & Manual Batch) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{ta('বাল্ক ইমেজ ও ভিডিও জেনারেটর (ক্যাটালগ + ম্যানুয়াল)', 'Bulk Image & Pro Video Batch Generator (Catalog & Manual)')}</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {ta('একসাথে একাধিক প্রোডাক্ট বা ম্যানুয়াল ক্যাম্পেইনের জন্য PNG পোস্টার ও HD WebM ভিডিও তৈরি করুন', 'Batch-render downloadable PNG creatives and HD WebM videos for multiple products or manual rows')}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setBatchMode('catalog')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${batchMode === 'catalog' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
            >
              {ta('ক্যাটালগ ব্যাচ', 'Catalog Multi-Select')}
            </button>
            <button
              type="button"
              onClick={() => setBatchMode('manual')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${batchMode === 'manual' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
            >
              {ta('ম্যানুয়াল ব্যাচ', 'Manual Batch Queue')}
            </button>
          </div>
        </div>

        {batchMode === 'catalog' ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setBatchSelectedProductIds(
                      batchSelectedProductIds.length === products.length ? [] : products.map((p) => p.id)
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{batchSelectedProductIds.length === products.length ? 'Deselect All' : 'Select All Products'}</span>
                </button>
                <span className="font-mono text-emerald-400 font-bold">{batchSelectedProductIds.length} Selected</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={batchFormat}
                  onChange={(e) => setBatchFormat(e.target.value as CreativeFormat)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                >
                  <option value="post">1:1 Square (1080×1080)</option>
                  <option value="portrait">4:5 IG Portrait (1080×1350)</option>
                  <option value="reel">9:16 Reels Video (1080×1920)</option>
                  <option value="landscape">16:9 HD Video (1280×720)</option>
                  <option value="banner">Ad Banner (1200×628)</option>
                </select>
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSaveBatchToLibrary}
                    onChange={(e) => setAutoSaveBatchToLibrary(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span>{ta('মিডিয়া গ্যালারিতে সেভ', 'Save PNGs to Library')}</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              {products.map((p) => {
                const checked = batchSelectedProductIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer ${
                      checked ? 'bg-emerald-950/40 border-emerald-500/60' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setBatchSelectedProductIds((prev) =>
                          prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]
                        )
                      }
                      className="accent-emerald-500 rounded"
                    />
                    {p.images?.[0]?.trim() && (
                      <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{p.title}</p>
                      <p className="text-[10px] font-mono text-emerald-400">৳{p.price}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <input
                type="text"
                value={newManualHeadline}
                onChange={(e) => setNewManualHeadline(e.target.value)}
                placeholder="Headline (e.g. WINTER FLASH DEAL)"
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
              />
              <input
                type="text"
                value={newManualSubtext}
                onChange={(e) => setNewManualSubtext(e.target.value)}
                placeholder="Subtext"
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
              />
              <input
                type="number"
                value={newManualPrice}
                onChange={(e) => setNewManualPrice(e.target.value)}
                placeholder="৳ Price"
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-mono"
              />
              <input
                type="text"
                value={newManualImgUrl}
                onChange={(e) => setNewManualImgUrl(e.target.value)}
                placeholder="Photo URL (or upload)"
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newManualHeadline.trim()) return;
                  setManualRows((prev) => [
                    ...prev,
                    {
                      id: `man-${Date.now()}`,
                      headline: newManualHeadline.trim().toUpperCase(),
                      subtext: newManualSubtext.trim() || '64-District COD',
                      price: Math.max(0, Number(newManualPrice) || 990),
                      ctaText: newManualCta.trim() || 'BUY NOW',
                      imageUrl: newManualImgUrl.trim()
                    }
                  ]);
                  setNewManualHeadline('');
                }}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {manualRows.map((row) => (
                <div key={row.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex items-center gap-2">
                    {row.imageUrl?.trim() && <img src={row.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />}
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{row.headline}</p>
                      <p className="text-[10px] text-slate-400 truncate">{row.subtext} · ৳{row.price}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setManualRows((prev) => prev.filter((x) => x.id !== row.id))}
                    className="p-1.5 rounded bg-rose-950/60 text-rose-300 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            disabled={isBatchRunning}
            onClick={() => handleRunBulkGeneration('image')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isBatchRunning ? batchProgressText || 'Generating...' : ta('বাল্ক PNG ইমেজ তৈরি করুন', 'Bulk Generate PNG Images')}</span>
          </button>
          <button
            type="button"
            disabled={isBatchRunning}
            onClick={() => handleRunBulkGeneration('video')}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Film className="w-4 h-4" />
            <span>{isBatchRunning ? batchProgressText || 'Rendering...' : ta('বাল্ক HD ভিডিও (WebM) তৈরি করুন', 'Bulk Generate HD Videos (WebM)')}</span>
          </button>
        </div>

        {batchOutputs.length > 0 && (
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300">
                {ta(`তৈরিকৃত বাল্ক অ্যাসেট (${batchOutputs.length})`, `Generated Batch Creatives (${batchOutputs.length})`)}
              </span>
              <button
                type="button"
                onClick={() => setBatchOutputs([])}
                className="text-slate-400 hover:text-rose-400 text-[11px] font-bold cursor-pointer"
              >
                Clear List
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto">
              {batchOutputs.map((out) => (
                <div key={out.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {out.type === 'image' && out.url ? (
                      <img src={out.url} alt="" className="w-10 h-10 rounded object-cover shrink-0 border border-slate-700" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-rose-950/60 border border-rose-700/50 flex items-center justify-center shrink-0">
                        <Film className="w-4 h-4 text-rose-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{out.title}</p>
                      <p className="text-[10px] font-mono text-slate-400">{out.formatLabel}</p>
                    </div>
                  </div>
                  <a
                    href={out.url}
                    download={out.filename}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shrink-0"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Marketing Copy, 15s Reels Script & Hashtag Generator */}
      <AICampaignCopyGenerator
        product={product}
        ta={ta}
        onApplyToCanvas={(hl, sub) => {
          setHeadline(hl);
          setSubtext(sub);
          addToast('success', ta('ক্যানভাসে অ্যাপ্লাই হয়েছে!', 'Applied to Canvas!'), hl);
        }}
      />
    </div>
  );
};

const AICampaignCopyGenerator: React.FC<{
  product?: Product;
  ta: (bn: string, en: string) => string;
  onApplyToCanvas: (headline: string, subtext: string) => void;
}> = ({ product, ta, onApplyToCanvas }) => {
  const [mode, setMode] = useState<'ad_copy' | 'reel_script'>('ad_copy');
  const [isLoading, setIsLoading] = useState(false);
  const [generated, setGenerated] = useState<{ headline: string; body: string; hashtags: string; provider?: string } | null>(null);

  const handleGenerate = async () => {
    if (!product) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          productTitle: product.titleBn || product.title,
          price: product.price,
          category: product.categoryBn || product.category
        })
      });
      const data = await res.json();
      if (data?.ok && data.result) {
        setGenerated({ ...data.result, provider: data.provider });
      }
    } catch {
      // Fallback handled cleanly
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-black text-white">
            {ta('AI ফেসবুক অ্যাড কপি ও রিলস স্ক্রিপ্ট জেনারেটর', 'AI Facebook Ad Copy & 15s Reels Script Generator')}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMode('ad_copy')}
            className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${mode === 'ad_copy' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            {ta('অ্যাড কপি', 'Facebook Ad')}
          </button>
          <button
            type="button"
            onClick={() => setMode('reel_script')}
            className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${mode === 'reel_script' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            {ta('১৫-সেকেন্ড রিলস স্ক্রিপ্ট', '15s Reels Script')}
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !product}
            className="px-3.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-black cursor-pointer disabled:opacity-60"
          >
            {isLoading ? ta('লিখছে...', 'Generating...') : ta('✨ AI দিয়ে লিখুন', '✨ Generate AI Copy')}
          </button>
        </div>
      </div>

      {generated && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-black text-emerald-300">{generated.headline}</span>
            <button
              type="button"
              onClick={() => onApplyToCanvas(generated.headline, generated.body.slice(0, 72))}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer shrink-0"
            >
              {ta('ব্যানারে বসান', 'Apply to Canvas')}
            </button>
          </div>
          <p className="text-slate-200 whitespace-pre-line leading-relaxed">{generated.body}</p>
          <p className="text-[11px] font-mono text-sky-400">{generated.hashtags}</p>
        </div>
      )}
    </div>
  );
};
