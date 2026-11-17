import React, { useState, useEffect, useRef } from 'react';
import { Download, Film, Image as ImageIcon, Layout, Play, RefreshCw, Sparkles, Square } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

type CreativeFormat = 'banner' | 'post' | 'reel';

interface CreativeTheme {
  id: string;
  label: string;
  bgStart: string;
  bgEnd: string;
  accent: string;
}

const CREATIVE_THEMES: CreativeTheme[] = [
  { id: 'emerald', label: 'Emerald Brand', bgStart: '#064e3b', bgEnd: '#022c22', accent: '#34d399' },
  { id: 'flash', label: 'Flash Rose & Gold', bgStart: '#881337', bgEnd: '#0f172a', accent: '#fbbf24' },
  { id: 'royal', label: 'Midnight Cyber', bgStart: '#1e1b4b', bgEnd: '#09090b', accent: '#38bdf8' },
  { id: 'sunset', label: 'Warm Saffron', bgStart: '#7c2d12', bgEnd: '#18181b', accent: '#fb923c' }
];

const FORMAT_DIMENSIONS: Record<CreativeFormat, { w: number; h: number; labelBn: string; labelEn: string }> = {
  banner: { w: 1200, h: 628, labelBn: 'ওয়েব/এফবি ব্যানার (1200×628)', labelEn: 'Hero / Ad Banner (1200×628)' },
  post: { w: 1080, h: 1080, labelBn: 'সোশ্যাল পোস্ট (1080×1080)', labelEn: 'Social Post (1080×1080)' },
  reel: { w: 1080, h: 1920, labelBn: 'রিলস / স্টোরি ভিডিও (1080×1920)', labelEn: 'Reels / Story (1080×1920)' }
};

export const CreativeMarketingStudio: React.FC<{ ta: (bn: string, en: string) => string }> = ({ ta }) => {
  const { products, settings, addToast } = useStore();
  const [format, setFormat] = useState<CreativeFormat>('post');
  const [selectedProductId, setSelectedProductId] = useState<string>(() => products[0]?.id || '');
  const [themeId, setThemeId] = useState<string>('emerald');
  const [headline, setHeadline] = useState('MEGA FLASH OFFER');
  const [subtext, setSubtext] = useState('Cash on Delivery · 64 Districts Express');
  const [ctaText, setCtaText] = useState('ORDER NOW');
  const [couponText, setCouponText] = useState('SAVE100');
  const [isRecordingReel, setIsRecordingReel] = useState(false);
  const [reelProgress, setReelProgress] = useState(0);
  const [isAnimatingPreview, setIsAnimatingPreview] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);
  const animPhaseRef = useRef<number>(0);

  const product = products.find((p) => p.id === selectedProductId) || products[0];
  const theme = CREATIVE_THEMES.find((t) => t.id === themeId) || CREATIVE_THEMES[0];
  const dim = FORMAT_DIMENSIONS[format];

  // Auto-populate headline/subtext when switching product
  useEffect(() => {
    if (!product) return;
    setHeadline(product.title.slice(0, 36).toUpperCase());
    setSubtext(`${product.brand ? product.brand + ' · ' : ''}Was ৳${product.originalPrice} · Now Only ৳${product.price}`);
  }, [product?.id]);

  // Preload product image with CORS fallback
  useEffect(() => {
    if (!product?.images?.[0]) {
      loadedImageRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadedImageRef.current = img;
    };
    img.onerror = () => {
      loadedImageRef.current = null;
    };
    img.src = product.images[0];
  }, [product?.images?.[0]]);

  const drawFrame = (ctx: CanvasRenderingContext2D, phase: number) => {
    const { w, h } = dim;
    ctx.clearRect(0, 0, w, h);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, theme.bgStart);
    grad.addColorStop(1, theme.bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle animated glow orb
    const pulse = Math.sin(phase * Math.PI * 2) * 35;
    const orbGrad = ctx.createRadialGradient(w * 0.78, h * 0.28 + pulse, 20, w * 0.78, h * 0.28 + pulse, w * 0.45);
    orbGrad.addColorStop(0, `${theme.accent}44`);
    orbGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = orbGrad;
    ctx.fillRect(0, 0, w, h);

    // Top-left decorative grid dots
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let gx = 48; gx < 280; gx += 28) {
      for (let gy = 48; gy < 180; gy += 28) {
        ctx.beginPath();
        ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const storeBrand = (settings.storeName || 'BuyOne BD').toUpperCase();
    const discountPct =
      product && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 25;

    const roundRect = (x: number, y: number, rw: number, rh: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + rw, y, x + rw, y + rh, r);
      ctx.arcTo(x + rw, y + rh, x, y + rh, r);
      ctx.arcTo(x, y + rh, x, y, r);
      ctx.arcTo(x, y, x + rw, y, r);
      ctx.closePath();
    };

    const drawProductCard = (px: number, py: number, pw: number, ph: number) => {
      const floatY = format === 'reel' || isAnimatingPreview ? Math.sin(phase * Math.PI * 2) * 12 : 0;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 20;
      roundRect(px, py + floatY, pw, ph, 36);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.clip();

      if (loadedImageRef.current) {
        try {
          const img = loadedImageRef.current;
          const scale = Math.max(pw / img.width, ph / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;
          ctx.drawImage(img, px + (pw - dw) / 2, py + floatY + (ph - dh) / 2, dw, dh);
        } catch {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px, py + floatY, pw, ph);
        }
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px, py + floatY, pw, ph);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 34px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(product?.title?.slice(0, 22) || 'Featured Product', px + pw / 2, py + floatY + ph / 2);
        ctx.textAlign = 'left';
      }
      ctx.restore();

      // Discount sticker
      if (discountPct > 0) {
        ctx.save();
        roundRect(px + pw - 190, py + floatY + 22, 168, 62, 18);
        ctx.fillStyle = '#e11d48';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`-${discountPct}% OFF`, px + pw - 106, py + floatY + 64);
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

    if (format === 'banner') {
      // 1200 x 628 Landscape
      roundRect(64, 54, 240, 44, 22);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fill();
      ctx.fillStyle = theme.accent;
      ctx.font = '900 22px sans-serif';
      ctx.fillText(storeBrand, 88, 84);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 54px sans-serif';
      const afterTitleY = drawWrappedText(headline, 64, 175, 590, 64, 3);

      ctx.fillStyle = 'rgba(226,232,240,0.9)';
      ctx.font = '600 26px sans-serif';
      drawWrappedText(subtext, 64, Math.max(afterTitleY + 12, 340), 590, 36, 2);

      // Price + CTA row
      ctx.fillStyle = theme.accent;
      ctx.font = '900 62px monospace';
      ctx.fillText(`৳${(product?.price || 1490).toLocaleString()}`, 64, 495);

      roundRect(64, 524, 270, 64, 18);
      ctx.fillStyle = theme.accent;
      ctx.fill();
      ctx.fillStyle = '#09090b';
      ctx.font = '900 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ctaText, 199, 565);
      ctx.textAlign = 'left';

      if (couponText.trim()) {
        roundRect(354, 524, 250, 64, 18);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`CODE: ${couponText.trim()}`, 479, 564);
        ctx.textAlign = 'left';
      }

      drawProductCard(690, 64, 450, 500);
    } else if (format === 'post') {
      // 1080 x 1080 Square
      roundRect(64, 52, 260, 48, 24);
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fill();
      ctx.fillStyle = theme.accent;
      ctx.font = '900 24px sans-serif';
      ctx.fillText(storeBrand, 92, 85);

      if (couponText.trim()) {
        roundRect(746, 52, 270, 48, 24);
        ctx.fillStyle = theme.accent;
        ctx.fill();
        ctx.fillStyle = '#09090b';
        ctx.font = '900 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`COUPON: ${couponText.trim()}`, 881, 84);
        ctx.textAlign = 'left';
      }

      drawProductCard(190, 128, 700, 510);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 52px sans-serif';
      ctx.textAlign = 'center';
      drawWrappedText(headline, 540, 720, 940, 60, 2);

      ctx.fillStyle = 'rgba(226,232,240,0.88)';
      ctx.font = '600 28px sans-serif';
      ctx.fillText(subtext.slice(0, 58), 540, 845);

      ctx.fillStyle = theme.accent;
      ctx.font = '900 72px monospace';
      ctx.fillText(`৳${(product?.price || 1490).toLocaleString()}`, 320, 968);

      roundRect(570, 902, 340, 84, 24);
      ctx.fillStyle = theme.accent;
      ctx.fill();
      ctx.fillStyle = '#09090b';
      ctx.font = '900 32px sans-serif';
      ctx.fillText(ctaText, 740, 956);
      ctx.textAlign = 'left';
    } else {
      // 1080 x 1920 Vertical Reel / Story
      roundRect(340, 90, 400, 58, 29);
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fill();
      ctx.fillStyle = theme.accent;
      ctx.font = '900 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(storeBrand, 540, 129);

      // Animated flash pill
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 66px sans-serif';
      drawWrappedText(headline, 540, 250, 920, 76, 3);

      drawProductCard(140, 460, 800, 820);

      ctx.fillStyle = 'rgba(226,232,240,0.92)';
      ctx.font = '600 34px sans-serif';
      drawWrappedText(subtext, 540, 1370, 920, 46, 2);

      ctx.fillStyle = theme.accent;
      ctx.font = '900 96px monospace';
      ctx.fillText(`৳${(product?.price || 1490).toLocaleString()}`, 540, 1555);

      if (couponText.trim()) {
        roundRect(290, 1600, 500, 62, 18);
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px monospace';
        ctx.fillText(`USE CODE: ${couponText.trim()}`, 540, 1641);
      }

      const btnScale = 1 + Math.sin(phase * Math.PI * 4) * 0.03;
      const bw = 720 * btnScale;
      const bh = 104 * btnScale;
      roundRect(540 - bw / 2, 1720 - bh / 2, bw, bh, 32);
      ctx.fillStyle = theme.accent;
      ctx.fill();
      ctx.fillStyle = '#09090b';
      ctx.font = '900 40px sans-serif';
      ctx.fillText(`${ctaText} ↑`, 540, 1734);
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
        animPhaseRef.current = (animPhaseRef.current + dt * 0.35) % 1;
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) drawFrame(ctx, animPhaseRef.current);
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  });

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `buyone-${format}-${Date.now()}.png`;
      a.click();
      addToast('success', ta('ডিজাইন ডাউনলোড সম্পন্ন', 'Creative PNG Downloaded'), `${dim.w}×${dim.h}px`);
    } catch {
      addToast('warning', ta('ইমেজ এক্সপোর্ট সমস্যা', 'Export Blocked'), ta('বাহ্যিক ছবির CORS সীমাবদ্ধতার কারণে লোকাল ছবি ব্যবহার করুন।', 'External image CORS prevented PNG export. Try a different photo.'));
    }
  };

  const handleDownloadReelVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas || typeof (canvas as any).captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
      addToast('warning', ta('ব্রাউজার সাপোর্ট নেই', 'Video Export Unsupported'), ta('দয়া করে Chrome/Edge ব্যবহার করুন অথবা PNG ডাউনলোড করুন।', 'Use Chrome/Edge for WebM Reels export or download PNG.'));
      return;
    }

    setFormat('reel');
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
          a.download = `buyone-reel-${Date.now()}.webm`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 4000);
          setIsRecordingReel(false);
          setReelProgress(100);
          addToast('success', ta('রিলস ভিডিও ডাউনলোড সম্পন্ন!', 'Reel Video Downloaded!'), ta('৪ সেকেন্ডের HD WebM রিলস ভিডিও তৈরি হয়েছে।', '4-second HD Reels WebM exported.'));
        };

        recorder.start();
        const startTime = Date.now();
        const durationMs = 4000;
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
        addToast('error', ta('ভিডিও রেন্ডার ব্যর্থ', 'Reel Export Failed'), ta('আবার চেষ্টা করুন।', 'Could not record canvas stream.'));
      }
    }, 150);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{ta('মার্কেটিং ক্রিয়েটিভ স্টুডিও (ব্যানার · পোস্ট · রিলস ভিডিও)', 'Marketing Creative Studio (Banner · Post · Reels Maker)')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {ta('ক্যাটালগ প্রোডাক্ট থেকে ১ ক্লিকে ফেসবুক অ্যাড ব্যানার, ইনস্টাগ্রাম পোস্ট এবং অ্যানিমেটেড রিলস ভিডিও বানান', 'Generate Facebook Ad Banners, Social Posts & Animated Reels from your product catalog')}
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setFormat('banner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${format === 'banner' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>{ta('ব্যানার', 'Banner')}</span>
          </button>
          <button
            type="button"
            onClick={() => setFormat('post')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${format === 'post' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{ta('পোস্ট', 'Post')}</span>
          </button>
          <button
            type="button"
            onClick={() => setFormat('reel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${format === 'reel' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>{ta('রিলস ভিডিও', 'Reels')}</span>
          </button>
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
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (৳{p.price})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              {ta('থিম কালার গ্রেডিয়েন্ট', 'Color Theme')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CREATIVE_THEMES.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setThemeId(th.id)}
                  className={`px-3 py-2 rounded-xl border text-left font-bold flex items-center gap-2 cursor-pointer ${themeId === th.id ? 'border-emerald-400 bg-slate-800 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'}`}
                >
                  <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: th.accent }} />
                  <span className="truncate">{th.label}</span>
                </button>
              ))}
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

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{ta('PNG ডাউনলোড', 'Download PNG')}</span>
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
                  ? `${ta('রেন্ডার হচ্ছে', 'Exporting')} ${reelProgress}%`
                  : ta('রিলস ভিডিও (WebM)', 'Export Reel Video')}
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
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[340px]">
          <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span>{ta(dim.labelBn, dim.labelEn)}</span>
            <span className="font-mono text-emerald-400">{dim.w} × {dim.h}px</span>
          </div>
          <canvas
            ref={canvasRef}
            width={dim.w}
            height={dim.h}
            className="max-w-full max-h-[380px] w-auto h-auto rounded-xl border border-slate-800 shadow-2xl object-contain"
          />
        </div>
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
