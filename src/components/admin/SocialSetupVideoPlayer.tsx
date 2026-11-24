import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  ExternalLink,
  CheckCircle2,
  Film,
  MousePointerClick
} from 'lucide-react';
import { SocialPlatform } from '../../types';

interface VideoChapter {
  id: string;
  startSec: number;
  endSec: number;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  narrationBn: string;
  narrationEn: string;
  platformFocus: SocialPlatform | 'all';
  checklistBn: string[];
  checklistEn: string[];
  actionUrl?: { label: string; href: string };
}

const TOTAL_DURATION_SEC = 140;

const CHAPTERS: VideoChapter[] = [
  {
    id: 'fb-ig',
    startSec: 0,
    endSec: 36,
    titleBn: '১. Facebook Page ও Instagram ফ্রি API সেটআপ',
    titleEn: '1. Facebook Page & Instagram Direct Free API Setup',
    subtitleBn: 'Graph API Explorer থেকে টোকেন নিয়ে ০৳ খরচে সরাসরি অটো-পোস্ট',
    subtitleEn: 'Connect Meta Page ID & Page Access Token for ৳0 direct publishing',
    narrationBn:
      'প্রথম ধাপে Meta Developers বা Business Suite থেকে আপনার Facebook Page ID এবং Instagram Business ID কপি করুন। এরপর pages_manage_posts এবং instagram_content_publish পারমিশনসহ একটি টোকেন জেনারেট করে নিচের কার্ডে পেস্ট করুন এবং Test Connection বাটনে ক্লিক করুন।',
    narrationEn:
      'Step one: Open Meta Graph API Explorer, copy your Facebook Page ID and Instagram Business Account ID, generate a token with pages manage posts and instagram content publish permissions, paste it into the cards below, and click Test Connection.',
    platformFocus: 'facebook',
    checklistBn: [
      'developers.facebook.com/tools/explorer ওপেন করুন',
      'Get User Access Token -> Get Page Access Token সিলেক্ট করুন',
      'Permission যোগ করুন: pages_manage_posts, instagram_content_publish',
      'Page ID ও Token বসিয়ে "Test Connection" চাপুন'
    ],
    checklistEn: [
      'Open developers.facebook.com/tools/explorer',
      'Choose Get Page Access Token under User or Page',
      'Select permissions: pages_manage_posts & instagram_content_publish',
      'Paste Page ID & Token below, then click Test Connection'
    ],
    actionUrl: {
      label: 'Open Meta Graph Explorer',
      href: 'https://developers.facebook.com/tools/explorer/'
    }
  },
  {
    id: 'tiktok-yt',
    startSec: 36,
    endSec: 74,
    titleBn: '২. TikTok ও YouTube Shorts ফ্রি Webhook (Make.com / n8n)',
    titleEn: '2. TikTok & YouTube Shorts Free Webhook (Make.com / n8n)',
    subtitleBn: '১টি ফ্রি Webhook URL বা JSON Queue Feed দিয়ে TikTok ও YT Shorts অটো-পোস্ট',
    subtitleEn: 'Trigger TikTok & YouTube Shorts auto-uploads with a free Make.com webhook',
    narrationBn:
      'দ্বিতীয় ধাপে Make.com বা n8n এ ফ্রি অ্যাকাউন্ট খুলে Custom Webhook মডিউল যোগ করুন। প্রাপ্ত Webhook URL টি নিচের TikTok এবং YouTube Shorts কার্ডে পেস্ট করুন। তারপর Auto-Post চালু রেখে Save Channel Config বাটনে চাপুন।',
    narrationEn:
      'Step two: Create a free Make dot com or n8n scenario with a Custom Webhook trigger. Copy the webhook URL into the TikTok Shop and YouTube Shorts cards below, turn Auto-Post ON, and click Save Channel Config.',
    platformFocus: 'tiktok',
    checklistBn: [
      'Make.com এ ফ্রি Scenario তৈরি করে Custom Webhook নিন',
      'TikTok / YouTube মডিউল Webhook-এর সাথে কানেক্ট করুন',
      'Webhook URL নিচের TikTok ও YouTube কার্ডে পেস্ট করুন',
      'অথবা আমাদের /api/feeds/social-queue.json ফিড যুক্ত করুন'
    ],
    checklistEn: [
      'Create a free Make.com Scenario and add Custom Webhook trigger',
      'Link TikTok / YouTube upload module to the webhook payload',
      'Paste the Webhook URL into TikTok & YouTube cards below',
      'Or poll /api/feeds/social-queue.json every 15 minutes'
    ],
    actionUrl: {
      label: 'Open Make.com (Free)',
      href: 'https://www.make.com/en/register'
    }
  },
  {
    id: 'ai-auto',
    startSec: 74,
    endSec: 110,
    titleBn: '৩. জিরো-টাইম ৪-প্ল্যাটফর্ম অটো AI শিডিউল',
    titleEn: '3. Zero-Time 4-Platform AI Auto-Scheduler',
    subtitleBn: 'একসাথে আপনার নিজস্ব সব পণ্যে FB + IG + TikTok + YT পোস্ট কিউ করুন',
    subtitleEn: 'Select your own catalog products & auto-schedule all 4 channels in 1 click',
    narrationBn:
      'তৃতীয় ধাপে নিচের পণ্যের তালিকা থেকে আপনার নিজস্ব পণ্য বাছাই করুন, All 4 Platforms Together অপশনে টিক দিন এবং বাংলাদেশ প্রাইম টাইম রাত ৮টা সিলেক্ট করুন। Auto-Generate চাপলেই AI বাংলা ও ইংরেজি হ্যাশট্যাগসহ সময়মতো সব পোস্ট কিউ করে দেবে।',
    narrationEn:
      'Step three: Pick your own products from the catalog list, check Auto-Schedule Across All 4 Platforms Together, choose 8 PM Prime Time, and click Auto-Generate and Schedule. AI creates captions, hashtags, and direct UTM links automatically.',
    platformFocus: 'all',
    checklistBn: [
      'শুধুমাত্র আপনার নিজস্ব পণ্য বাছুন (Select Own Products)',
      '"All 4 Platforms Together" বক্সে টিক দিন',
      'BD Prime Time (08:00 PM) ও Stagger (4h) সিলেক্ট করুন',
      '"Auto-Generate & Schedule" বাটনে ক্লিক করুন'
    ],
    checklistEn: [
      'Pick your own products from Select Own Products',
      'Check "Auto-Schedule Across All 4 Platforms Together"',
      'Click 08:00 PM Prime preset and set 4h stagger interval',
      'Click Auto-Generate & Schedule to populate your queue'
    ]
  },
  {
    id: 'verify',
    startSec: 110,
    endSec: TOTAL_DURATION_SEC,
    titleBn: '৪. লাইভ টেস্ট, ৩০-সেকেন্ড অটো-পাবলিশ ও ১-ক্লিক ব্যাকআপ',
    titleEn: '4. Live Test, 30s Background Engine & 1-Click Share',
    subtitleBn: 'প্রতি ৩০ সেকেন্ডে অটো-চেক, পিক্সেল/UTM ট্র্যাকিং এবং ম্যানুয়াল ১-ক্লিক শেয়ার',
    subtitleEn: 'Verify automatic posting & use 1-click Copy / Studio Upload anytime',
    narrationBn:
      'চতুর্থ ধাপে Save Channel Config চাপুন এবং Run Auto-Poster Cycle Now বাটনে ক্লিক করে পরীক্ষা করুন। প্রতি ৩০ সেকেন্ডে আমাদের ব্যাকগ্রাউন্ড ইঞ্জিন সময়মতো পোস্টগুলো পাবলিশ করবে এবং প্রতিটি কিউ কার্ডে ১-ক্লিক Copy ও Direct Upload বাটনও প্রস্তুত থাকবে।',
    narrationEn:
      'Step four: Click Save Channel Config, then click Run Auto-Poster Cycle Now to test immediately. Our background engine checks the queue every 30 seconds, and every scheduled card also provides 1-click Copy and Studio Upload shortcuts.',
    platformFocus: 'youtube',
    checklistBn: [
      'উপরে সবুজ "Save Channel Config" বাটনে ক্লিক করুন',
      '"Run Auto-Poster Cycle Now" দিয়ে লাইভ টেস্ট করুন',
      'Marketing Hub-এ Autopilot ON রাখলে নতুন প্রোডাক্টে অটো পোস্ট হবে',
      'জরুরি হলে কিউ থেকে ১-ক্লিক Copy / Direct Upload ব্যবহার করুন'
    ],
    checklistEn: [
      'Click Save Channel Config at top-right to lock in settings',
      'Click Run Auto-Poster Cycle Now for instant dispatch test',
      'Keep Autopilot ON in Marketing Hub for zero-touch daily posts',
      'Use 1-click Copy, FB Share or Studio Upload buttons anytime'
    ]
  }
];

interface SocialSetupVideoPlayerProps {
  adminLang: 'bn' | 'en';
  onFocusPlatform?: (platform: SocialPlatform) => void;
}

export const SocialSetupVideoPlayer: React.FC<SocialSetupVideoPlayerProps> = ({
  adminLang,
  onFocusPlatform
}) => {
  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.25 | 1.5>(1);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const lastSpokenChapterRef = useRef<string | null>(null);

  const activeChapter =
    CHAPTERS.find((c) => currentSec >= c.startSec && currentSec < c.endSec) || CHAPTERS[CHAPTERS.length - 1];

  const speakChapterNarration = (chapter: VideoChapter) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !voiceEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const text = adminLang === 'en' ? chapter.narrationEn : chapter.narrationBn;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = adminLang === 'en' ? 'en-US' : 'bn-BD';
      utter.rate = speed;
      window.speechSynthesis.speak(utter);
    } catch {}
  };

  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {}
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      try {
        window.speechSynthesis?.cancel();
      } catch {}
      lastSpokenChapterRef.current = null;
      return;
    }
    if (lastSpokenChapterRef.current !== activeChapter.id) {
      lastSpokenChapterRef.current = activeChapter.id;
      speakChapterNarration(activeChapter);
    }
  }, [isPlaying, activeChapter.id, voiceEnabled, adminLang]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSec((prev) => {
        const next = prev + 0.25 * speed;
        if (next >= TOTAL_DURATION_SEC) {
          setIsPlaying(false);
          return TOTAL_DURATION_SEC;
        }
        return next;
      });
    }, 250);
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  // Draw live animated interactive screencast tutorial onto 1280x720 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1280;
    const H = 720;
    const chapter = activeChapter;
    const chapterProg = Math.min(
      1,
      Math.max(0, (currentSec - chapter.startSec) / Math.max(1, chapter.endSec - chapter.startSec))
    );

    // Background dark studio slate
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#020617');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Simulated browser chrome bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(48, 36, W - 96, 54);
    ctx.fillStyle = '#334155';
    ctx.fillRect(210, 48, 620, 30);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'left';
    const urlText =
      chapter.id === 'fb-ig'
        ? 'https://developers.facebook.com/tools/explorer/  ->  BuyOne BD Admin'
        : chapter.id === 'tiktok-yt'
        ? 'https://make.com/webhook  ->  BuyOne BD /api/feeds/social-queue.json'
        : 'https://buyonebd.com/hossain  ->  Social Auto-Scheduler';
    ctx.fillText(urlText, 224, 68);

    // Window dots
    ['#ef4444', '#f59e0b', '#10b981'].forEach((c, idx) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(82 + idx * 24, 63, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    // Main app workspace frame
    ctx.fillStyle = '#090f1d';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.fillRect(48, 90, W - 96, H - 140);
    ctx.strokeRect(48, 90, W - 96, H - 140);

    // Step Header Banner inside canvas
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(76, 114, W - 152, 66);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText(adminLang === 'en' ? chapter.titleEn : chapter.titleBn, 98, 148);
    ctx.fillStyle = '#d1fae5';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText(adminLang === 'en' ? chapter.subtitleEn : chapter.subtitleBn, 98, 171);

    // Left 4-Channel Cards Simulation
    const cards = [
      { id: 'fb', name: 'Facebook Page', color: '#38bdf8', active: chapter.id === 'fb-ig' || chapter.id === 'ai-auto' || chapter.id === 'verify' },
      { id: 'ig', name: 'Instagram', color: '#f472b6', active: chapter.id === 'fb-ig' || chapter.id === 'ai-auto' || chapter.id === 'verify' },
      { id: 'tt', name: 'TikTok Shop', color: '#22d3ee', active: chapter.id === 'tiktok-yt' || chapter.id === 'ai-auto' || chapter.id === 'verify' },
      { id: 'yt', name: 'YouTube Shorts', color: '#fb7185', active: chapter.id === 'tiktok-yt' || chapter.id === 'ai-auto' || chapter.id === 'verify' }
    ];

    cards.forEach((c, i) => {
      const cx = 76 + (i % 2) * 320;
      const cy = 204 + Math.floor(i / 2) * 195;
      const cw = 300;
      const ch = 176;

      ctx.fillStyle = c.active ? '#0f172a' : '#0b1120';
      ctx.strokeStyle = c.active ? '#10b981' : '#1e293b';
      ctx.lineWidth = c.active ? 2.5 : 1.5;
      ctx.fillRect(cx, cy, cw, ch);
      ctx.strokeRect(cx, cy, cw, ch);

      ctx.fillStyle = c.color;
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText(c.name, cx + 16, cy + 30);

      // Toggle indicator
      ctx.fillStyle = c.active ? '#10b981' : '#334155';
      ctx.fillRect(cx + cw - 64, cy + 14, 48, 22);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(c.active ? 'ON' : 'OFF', cx + cw - 50, cy + 29);

      // Animated input 1: Page ID / Webhook
      ctx.fillStyle = '#020617';
      ctx.fillRect(cx + 16, cy + 48, cw - 32, 30);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx + 16, cy + 48, cw - 32, 30);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px monospace';
      const typedChars = Math.floor(chapterProg * 28);
      const val1 =
        chapter.id === 'fb-ig' && (c.id === 'fb' || c.id === 'ig')
          ? '104928371029384'.slice(0, Math.max(4, typedChars))
          : chapter.id === 'tiktok-yt' && (c.id === 'tt' || c.id === 'yt')
          ? 'https://hook.make.com/a9x4f...'.slice(0, Math.max(8, typedChars))
          : `@buyonebd_${c.id}`;
      ctx.fillText(val1, cx + 24, cy + 68);

      // Animated input 2: Token / Status
      ctx.fillStyle = '#020617';
      ctx.fillRect(cx + 16, cy + 88, cw - 32, 30);
      ctx.strokeRect(cx + 16, cy + 88, cw - 32, 30);
      ctx.fillStyle = '#94a3b8';
      const val2 =
        chapter.id === 'fb-ig' && (c.id === 'fb' || c.id === 'ig')
          ? 'EAABsbCS1iHgBA••••••••••••'
          : chapter.id === 'tiktok-yt' && (c.id === 'tt' || c.id === 'yt')
          ? 'Webhook Trigger Ready'
          : 'Auto-Post Every 6h';
      ctx.fillText(val2, cx + 24, cy + 108);

      // Test Connection button + green Verified banner
      const btnVerified = chapterProg > 0.65 || chapter.id === 'verify';
      ctx.fillStyle = c.active && btnVerified ? '#059669' : '#1e293b';
      ctx.fillRect(cx + 16, cy + 130, cw - 32, 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText(
        c.active && btnVerified ? '✓ Verified & Connected' : 'Test Connection',
        cx + 32,
        cy + 151
      );
    });

    // Right Step-by-Step Interactive Walkthrough Card
    const rx = 720;
    const ry = 204;
    const rw = 484;
    const rh = 371;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeRect(rx, ry, rw, rh);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(adminLang === 'en' ? 'Live Step Checklist' : 'লাইভ ধাপসমূহ', rx + 22, ry + 34);

    const steps = adminLang === 'en' ? chapter.checklistEn : chapter.checklistBn;
    steps.forEach((stepText, idx) => {
      const done = chapterProg >= (idx + 1) / (steps.length + 0.3);
      const sy = ry + 66 + idx * 54;
      ctx.fillStyle = done ? '#064e3b' : '#020617';
      ctx.strokeStyle = done ? '#10b981' : '#1e293b';
      ctx.fillRect(rx + 20, sy, rw - 40, 42);
      ctx.strokeRect(rx + 20, sy, rw - 40, 42);

      ctx.fillStyle = done ? '#34d399' : '#64748b';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(done ? '✓' : `${idx + 1}.`, rx + 34, sy + 26);

      ctx.fillStyle = done ? '#ffffff' : '#cbd5e1';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText(stepText.slice(0, 50), rx + 62, sy + 26);
    });

    // Bottom Action Callout CTA inside screen
    ctx.fillStyle = chapterProg > 0.72 ? '#10b981' : '#0284c7';
    ctx.fillRect(rx + 20, ry + 300, rw - 40, 48);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const ctaText =
      chapter.id === 'fb-ig'
        ? 'Save Channel Config -> FB & IG Live'
        : chapter.id === 'tiktok-yt'
        ? 'Webhook Saved -> TikTok & YT Ready'
        : chapter.id === 'ai-auto'
        ? 'AI Auto-Scheduled Across All 4 Platforms!'
        : '30-Second Auto-Poster Engine Active!';
    ctx.fillText(ctaText, rx + rw / 2, ry + 330);
    ctx.textAlign = 'left';

    // Animated Cursor Movement showing user where to click
    const cursorX =
      chapter.id === 'fb-ig'
        ? 220 + Math.sin(chapterProg * Math.PI * 2) * 110
        : chapter.id === 'tiktok-yt'
        ? 220 + Math.cos(chapterProg * Math.PI * 2) * 140
        : 940;
    const cursorY =
      chapter.id === 'fb-ig'
        ? 280 + chapterProg * 75
        : chapter.id === 'tiktok-yt'
        ? 475 + chapterProg * 70
        : 525;

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(cursorX, cursorY);
    ctx.lineTo(cursorX + 18, cursorY + 12);
    ctx.lineTo(cursorX + 8, cursorY + 14);
    ctx.lineTo(cursorX + 12, cursorY + 24);
    ctx.lineTo(cursorX + 6, cursorY + 26);
    ctx.lineTo(cursorX + 2, cursorY + 16);
    ctx.lineTo(cursorX - 4, cursorY + 21);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bottom progress strip inside video frame
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(48, H - 30, W - 96, 8);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(48, H - 30, ((W - 96) * currentSec) / TOTAL_DURATION_SEC, 8);
  }, [currentSec, activeChapter, adminLang]);

  const formatTime = (sec: number) => {
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  };

  const handleJumpToChapter = (ch: VideoChapter) => {
    setCurrentSec(ch.startSec + 0.5);
    lastSpokenChapterRef.current = null;
    setIsPlaying(true);
    if (ch.platformFocus !== 'all' && onFocusPlatform) {
      onFocusPlatform(ch.platformFocus);
    }
  };

  const handleDownloadTutorialVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || typeof (canvas as any).captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
      return;
    }
    setIsExportingVideo(true);
    try {
      const stream = (canvas as any).captureStream(24);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'buyonebd-auto-social-setup-tutorial.webm';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        setIsExportingVideo(false);
      };
      recorder.start();
      // Step cleanly across key tutorial chapters for 8 seconds so exported video captures all 4 stages
      const checkpoints = [2, 18, 40, 58, 78, 96, 114, 130];
      let idx = 0;
      const stepTimer = setInterval(() => {
        if (idx >= checkpoints.length) {
          clearInterval(stepTimer);
          recorder.stop();
          return;
        }
        setCurrentSec(checkpoints[idx]);
        idx++;
      }, 950);
    } catch {
      setIsExportingVideo(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h5 className="text-sm font-black text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-emerald-400" />
            <span>
              {at(
                'সম্পূর্ণ ভিডিও টিউটোরিয়াল: FB, Instagram, TikTok ও YouTube অটো-পোস্ট সেটআপ',
                'Full Interactive Video Tutorial: FB, Instagram, TikTok & YouTube Auto-Setup'
              )}
            </span>
          </h5>
          <p className="text-[11px] text-slate-400">
            {at(
              'Play চাপুন — ভয়েস নির্দেশনাসহ প্রতিটি ধাপ স্ক্রিনে দেখানো হবে এবং নিচের চ্যাপ্টারে ক্লিক করলে সরাসরি সেই সেটিংসে ফোকাস করবে।',
              'Press Play for animated step-by-step walkthrough with voice guide. Click any chapter to jump directly and highlight settings below.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isExportingVideo}
            onClick={handleDownloadTutorialVideo}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {isExportingVideo
                ? at('ভিডিও সেভ হচ্ছে...', 'Rendering .webm...')
                : at('টিউটোরিয়াল ভিডিও ডাউনলোড (.webm)', 'Download Video (.webm)')}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left 8: Interactive HD Video Player Screen */}
        <div className="xl:col-span-8 space-y-2.5">
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black shadow-2xl">
            <canvas ref={canvasRef} width={1280} height={720} className="w-full aspect-video block" />
            {!isPlaying && currentSec === 0 && (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 bg-slate-950/55 hover:bg-slate-950/40 transition-colors flex flex-col items-center justify-center gap-2.5 cursor-pointer"
              >
                <span className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg">
                  <Play className="w-7 h-7 fill-current ml-0.5" />
                </span>
                <span className="px-4 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-white font-black text-xs">
                  {at('সম্পূর্ণ সেটআপ ভিডিও টিউটোরিয়াল চালান (২ মিনিট ২০ সেকেন্ড)', 'Watch Full Setup Video Tutorial (02:20)')}
                </span>
              </button>
            )}
          </div>

          {/* Video Transport Controls */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => {
                if (currentSec >= TOTAL_DURATION_SEC) setCurrentSec(0);
                setIsPlaying((prev) => !prev);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? at('বিরতি', 'Pause') : at('চালান', 'Play')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentSec(0);
                lastSpokenChapterRef.current = null;
                setIsPlaying(true);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              title="Restart"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <input
              type="range"
              min={0}
              max={TOTAL_DURATION_SEC}
              step={0.5}
              value={currentSec}
              onChange={(e) => {
                lastSpokenChapterRef.current = null;
                setCurrentSec(Number(e.target.value));
              }}
              className="flex-1 min-w-[120px] accent-emerald-500 cursor-pointer"
            />

            <span className="font-mono text-[11px] text-slate-300 tabular-nums">
              {formatTime(currentSec)} / {formatTime(TOTAL_DURATION_SEC)}
            </span>

            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value) as 1 | 1.25 | 1.5)}
              className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono text-[11px]"
            >
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
            </select>

            <button
              type="button"
              onClick={() => setVoiceEnabled((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] flex items-center gap-1 cursor-pointer ${
                voiceEnabled
                  ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
                  : 'bg-slate-950 border-slate-700 text-slate-400'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{voiceEnabled ? at('ভয়েস চালু', 'Voice ON') : at('মিউট', 'Muted')}</span>
            </button>
          </div>
        </div>

        {/* Right 4: Clickable Timestamped Chapters & Direct Focus Shortcuts */}
        <div className="xl:col-span-4 space-y-2">
          {CHAPTERS.map((ch) => {
            const isActive = activeChapter.id === ch.id;
            return (
              <div
                key={ch.id}
                className={`p-3 rounded-xl border transition-colors ${
                  isActive
                    ? 'bg-emerald-950/35 border-emerald-500/60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleJumpToChapter(ch)}
                  className="w-full text-left flex items-start justify-between gap-2 cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] font-bold text-amber-300 tabular-nums">
                      {formatTime(ch.startSec)} – {formatTime(ch.endSec)}
                    </span>
                    <p className="font-bold text-xs text-white leading-snug">
                      {at(ch.titleBn, ch.titleEn)}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {at(ch.subtitleBn, ch.subtitleEn)}
                    </p>
                  </div>
                  {isActive ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <MousePointerClick className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  )}
                </button>

                {ch.actionUrl && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <a
                      href={ch.actionUrl.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{ch.actionUrl.label}</span>
                    </a>
                    {ch.platformFocus !== 'all' && onFocusPlatform && (
                      <button
                        type="button"
                        onClick={() => onFocusPlatform(ch.platformFocus as SocialPlatform)}
                        className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
                      >
                        {at('সেটিংসে যান ↓', 'Focus Card ↓')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
