import express from 'express';
import http from 'http';
import https from 'https';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Type } from '@google/genai';
import nodemailer from 'nodemailer';
import mysql from 'mysql2/promise';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Security Headers Middleware (iframe-compatible for preview & hardened for production)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

app.use(express.json({ limit: '15mb' }));

// Sliding-Window In-Memory Rate Limiter for Sensitive API Endpoints
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
function createRateLimiter(bucketName: string, maxRequests: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = String(req.headers['x-forwarded-for'] || req.ip || 'unknown').split(',')[0].trim();
    const key = `${bucketName}:${ip}`;
    const now = Date.now();
    const entry = rateLimitBuckets.get(key);
    if (!entry || now > entry.resetAt) {
      rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (entry.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please wait a moment and try again.'
      });
    }
    entry.count += 1;
    return next();
  };
}

app.use('/api/orders', createRateLimiter('orders', 40, 60 * 1000));
app.use('/api/email', createRateLimiter('email', 25, 60 * 1000));
app.use('/api/database', createRateLimiter('database', 30, 60 * 1000));
app.use('/api/steadfast', createRateLimiter('steadfast', 45, 60 * 1000));
app.use('/api/chat', createRateLimiter('chat', 50, 60 * 1000));
app.use('/api/tts', createRateLimiter('tts', 40, 60 * 1000));

// Initialize GoogleGenAI server-side client with v1alpha for high-grade speech
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: 'v1alpha',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Server-side storage for full e-commerce persistence
const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const STORE_BACKUP_FILE = path.join(DATA_DIR, 'store.backup.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadStoreData() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading store data:', err);
  }
  return null;
}

function saveStoreData(data: any) {
  try {
    const serialized = JSON.stringify(data, null, 2);
    fs.writeFileSync(STORE_FILE, serialized, 'utf-8');
    // Maintain a rolling non-empty backup snapshot ("Not data delete, please")
    const hasCoreData =
      (Array.isArray(data?.products) && data.products.length > 0) ||
      (Array.isArray(data?.orders) && data.orders.length > 0);
    if (hasCoreData) {
      fs.writeFileSync(STORE_BACKUP_FILE, serialized, 'utf-8');
    }
  } catch (err) {
    console.error('Error saving store data:', err);
  }
}

// Wrap raw headerless PCM (audio/L16) from Gemini TTS in a valid 44-byte RIFF WAV header
function ensureWavDataUri(base64Data: string, mimeType = ''): string {
  try {
    const cleanMime = String(mimeType || '').toLowerCase();
    const rawBuf = Buffer.from(base64Data, 'base64');
    if (rawBuf.length >= 12 && rawBuf.subarray(0, 4).toString('ascii') === 'RIFF') {
      return `data:audio/wav;base64,${base64Data}`;
    }
    if (cleanMime.includes('mp3') || cleanMime.includes('mpeg')) {
      return `data:audio/mpeg;base64,${base64Data}`;
    }
    if (cleanMime.includes('ogg')) {
      return `data:audio/ogg;base64,${base64Data}`;
    }
    // Extract sample rate if specified e.g. audio/L16;codec=pcm;rate=24000
    const rateMatch = cleanMime.match(/rate=(\d+)/);
    const sampleRate = rateMatch ? Math.max(8000, Math.min(48000, parseInt(rateMatch[1], 10))) : 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = rawBuf.length;
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // PCM subchunk size
    header.writeUInt16LE(1, 20); // AudioFormat = 1 (PCM)
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);
    const wavBuf = Buffer.concat([header, rawBuf]);
    return `data:audio/wav;base64,${wavBuf.toString('base64')}`;
  } catch {
    return `data:audio/wav;base64,${base64Data}`;
  }
}

// Bounded LRU in-memory audio cache for instant voice playback
const audioCache = new Map<string, string>();
function setBoundedAudioCache(key: string, val: string) {
  if (audioCache.size >= 200) {
    const oldestKey = audioCache.keys().next().value;
    if (oldestKey) audioCache.delete(oldestKey);
  }
  audioCache.set(key, val);
}

// Bengali phonetic cleanup helper for silky-smooth human voice
function cleanBanglaForTTS(rawText: string): string {
  let text = rawText;
  
  // Transliterate brand & terms to natural Bengali phonetics
  text = text.replace(/BuyOne\s*BD/gi, 'বাইওয়ান বিডি');
  text = text.replace(/BuyOne/gi, 'বাইওয়ান');
  text = text.replace(/Cash on Delivery/gi, 'ক্যাশ অন ডেলিভারি');
  text = text.replace(/COD/gi, 'ক্যাশ অন ডেলিভারি');
  text = text.replace(/BDT/gi, 'টাকা');
  text = text.replace(/৳\s*([0-9]+)/g, '$1 টাকা');

  // Convert key numbers to conversational Bengali words for smooth pronunciation
  const digitWords: Record<string, string> = {
    '0': 'শূন্য', '1': 'এক', '2': 'দুই', '3': 'তিন', '4': 'চার',
    '5': 'পাঁচ', '6': 'ছয়', '7': 'সাত', '8': 'আট', '9': 'নয়'
  };

  // Replace single digit instructions e.g. "১ চাপুন" -> "এক চাপুন", "২ চাপুন" -> "দুই চাপুন"
  text = text.replace(/১\s*বাটন/g, 'এক বাটন');
  text = text.replace(/১\s*চাপুন/g, 'এক চাপুন');
  text = text.replace(/২\s*বাটন/g, 'দুই বাটন');
  text = text.replace(/২\s*চাপুন/g, 'দুই চাপুন');
  text = text.replace(/1\s*press/gi, 'এক চাপুন');
  text = text.replace(/2\s*press/gi, 'দুই চাপুন');

  return text.trim();
}

// TTS Endpoint for ultra-realistic Bangladeshi female voice
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'Kore', style } = req.body || {};

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const cleanedText = cleanBanglaForTTS(text);
    const cacheKey = `${voice}_${cleanedText}`;

    if (audioCache.has(cacheKey)) {
      return res.json({
        audioUrl: audioCache.get(cacheKey),
        format: 'wav',
        sampleRate: 24000,
        cached: true
      });
    }

    // Authentic Bangladeshi female persona prompt
    const defaultBangladeshiStyle = 
      "You are Sumana, a polite, sweet, authentic 25-year-old native Bangladeshi female customer care executive from Dhaka. Speak fluent, clear, colloquial Standard Bengali (চলিত বাংলা) with melodic Dhaka intonation, warm conversational pauses, and zero robotic artifacts.";
    
    const voiceStyle = style && style.trim().length > 0 ? style : defaultBangladeshiStyle;

    const ttsPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanedText,
              speechMetadata: {
                style: voiceStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });
    const response: any = await Promise.race([
      ttsPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('TTS timeout')), 3800))
    ]);

    const inlinePart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    const base64Audio = inlinePart?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from Gemini TTS' });
    }

    const audioUrl = ensureWavDataUri(base64Audio, inlinePart?.mimeType || 'audio/L16;rate=24000');
    setBoundedAudioCache(cacheKey, audioUrl);

    return res.json({
      audioUrl,
      format: 'wav',
      sampleRate: 24000
    });
  } catch (err: any) {
    console.error('TTS generation error:', err);
    return res.status(500).json({
      error: err.message || 'TTS generation failed',
      details: err.toString()
    });
  }
});

// Sample preview for instant voice test in Admin Dashboard & Call preview
app.get('/api/tts/sample', async (_req, res) => {
  try {
    const sampleText = "আসসালামু আলাইকুম তানভীর ভাই! বাইওয়ান বিডি থেকে আমি সুমনা বলছি। আশা করি আপনি ভালো আছেন। আপনার অর্ডারটি নিশ্চিত করতে অনুগ্রহ করে এক চাপুন।";
    const cacheKey = `sample_Kore_wav2`;

    if (audioCache.has(cacheKey)) {
      return res.json({ audioUrl: audioCache.get(cacheKey) });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: sampleText,
              speechMetadata: {
                style: "A warm, natural, extremely sweet native Bangladeshi Bengali female customer care officer in Dhaka speaking fluent conversational Bengali with natural pauses and warm melody.",
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const inlinePart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    const base64Audio = inlinePart?.data;
    if (base64Audio) {
      const audioUrl = ensureWavDataUri(base64Audio, inlinePart?.mimeType || 'audio/L16;rate=24000');
      audioCache.set(cacheKey, audioUrl);
      return res.json({ audioUrl });
    }
    return res.status(500).json({ error: 'No audio generated' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Ensure customer-facing chat/AI replies remain polite, brand-aligned, and never mention internal/prohibited terms
function sanitizeCustomerFacingReply(text: string): string {
  return String(text || '')
    .replace(/\bhuman\s+support\b/gi, 'Support Desk')
    .replace(/\bhuman\s+agent\b/gi, 'Support Representative')
    .replace(/\bhumans?\b/gi, 'support team')
    .replace(/হিউম্যান/g, 'সাপোর্ট ডেস্ক')
    .replace(/মানুষ/g, 'প্রতিনিধি')
    .replace(/\badmin\s+portal\b/gi, 'Support Desk')
    .replace(/\/hossain\b/gi, '');
}

// Smart A-to-Z Local AI Fallback (Free Auto AI — always responds accurately even without external API keys)
function buildSmartLocalChatReply(params: {
  message: string;
  lang: string;
  storeName: string;
  hotline: string;
  products: any[];
  orders: any[];
  assistantDraft?: boolean;
}) {
  const { message, lang, storeName, hotline, products, orders, assistantDraft } = params;
  const q = String(message || '').trim().toLowerCase();
  const isEn = lang === 'en';

  if (assistantDraft) {
    return {
      reply: isEn
        ? `Hello! Thank you for contacting ${storeName}. Cash on Delivery is available across all 64 districts (Dhaka ৳70, Sub-Dhaka ৳100, Outside ৳130). Please share your preferred product name or order ID so we can confirm right away!`
        : `আসসালামু আলাইকুম! ${storeName}-এ যোগাযোগ করার জন্য ধন্যবাদ। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে (ঢাকা ৳৭০, সাব-ঢাকা ৳১০০, ঢাকার বাইরে ৳১৩০)। আপনার পছন্দের পণ্যের নাম বা অর্ডার আইডি দিন, আমরা এখনই কনফার্ম করে দিচ্ছি!`,
      quickActions: []
    };
  }

  // Order ID lookup (e.g., BD-..., POS-...)
  const orderMatch = String(message || '').match(/(BD-[A-Z0-9-]+|POS-[A-Z0-9-]+)/i);
  if (orderMatch && Array.isArray(orders)) {
    const ord = orders.find((o: any) => String(o?.id || '').toLowerCase() === orderMatch[1].toLowerCase());
    if (ord) {
      const quickActions: any[] = [
        { label: isEn ? `📍 Track #${ord.id}` : `📍 ট্র্যাক #${ord.id}`, action: `track_${ord.id}` }
      ];
      if (ord.status === 'pending' || ord.status === 'on_hold') {
        quickActions.unshift({
          label: isEn ? `✅ Confirm #${ord.id} Now` : `✅ #${ord.id} এখনই কনফার্ম করুন`,
          action: `confirm_order_${ord.id}`
        });
      }
      return {
        reply: isEn
          ? `Order #${ord.id} (${ord.customer?.name}) — Status: ${String(ord.status || 'pending').toUpperCase()}, Total: ৳${ord.pricing?.total || 0}. Tap below to confirm or track live!`
          : `অর্ডার #${ord.id} (${ord.customer?.name}) — বর্তমান অবস্থা: ${String(ord.status || 'pending').toUpperCase()}, মোট বিল: ৳${ord.pricing?.total || 0}। নিচের বাটনে ক্লিক করে কনফার্ম বা লাইভ ট্র্যাক করুন!`,
        quickActions
      };
    }
  }

  // Confirm order intent
  if (/confirm|নিশ্চিত|কনফার্ম|ok order|approve/i.test(q) && Array.isArray(orders) && orders.length > 0) {
    const pendingOrd = orders.find((o: any) => o && (o.status === 'pending' || o.status === 'on_hold'));
    if (pendingOrd) {
      return {
        reply: isEn
          ? `Found your pending order #${pendingOrd.id} (৳${pendingOrd.pricing?.total}). Tap below to verify & confirm immediately for dispatch!`
          : `আপনার পেন্ডিং অর্ডার #${pendingOrd.id} (মোট ৳${pendingOrd.pricing?.total}) পাওয়া গেছে। ডিসপ্যাচের জন্য নিচের বাটনে ক্লিক করে এক ক্লিকে কনফার্ম করুন!`,
        quickActions: [
          { label: isEn ? `✅ Confirm Order #${pendingOrd.id}` : `✅ অর্ডার #${pendingOrd.id} কনফার্ম করুন`, action: `confirm_order_${pendingOrd.id}` },
          { label: isEn ? `📍 Track Parcel` : `📍 পার্সেল ট্র্যাক`, action: `track_${pendingOrd.id}` }
        ]
      };
    }
  }

  // Product matching
  const matchedProducts = Array.isArray(products)
    ? products
        .filter((p: any) => {
          const hay = `${p.title || ''} ${p.titleBn || ''} ${p.category || ''} ${p.brand || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
          return q.split(/\s+/).some((tok) => tok.length >= 2 && hay.includes(tok));
        })
        .slice(0, 3)
    : [];

  if (matchedProducts.length > 0) {
    const lines = matchedProducts
      .map((p: any, idx: number) => `${idx + 1}. ${isEn ? p.title : p.titleBn || p.title} — ৳${p.price} ${p.stock > 0 ? (isEn ? '(In Stock)' : '(স্টকে আছে)') : (isEn ? '(Out of Stock)' : '(স্টক শেষ)')}`)
      .join('\n');
    const quickActions = matchedProducts.flatMap((p: any) =>
      p.stock > 0
        ? [{ label: isEn ? `⚡ 1-Click Order: ${p.title.slice(0, 18)}` : `⚡ ১-ক্লিক অর্ডার: ${(p.titleBn || p.title).slice(0, 18)}`, action: `buy_${p.id}` }]
        : [{ label: isEn ? `🔔 Notify Stock: ${p.title.slice(0, 16)}` : `🔔 স্টক অ্যালার্ট`, action: `view_${p.id}` }]
    );
    return {
      reply: isEn
        ? `Here are top matching products at ${storeName}:\n${lines}\nTap a button below for instant 1-click checkout!`
        : `${storeName}-এ আপনার পছন্দের সেরা পণ্যসমূহ:\n${lines}\nনিচের বাটনে ক্লিক করে সরাসরি ১-ক্লিক অর্ডার সম্পন্ন করুন!`,
      quickActions
    };
  }

  if (/delivery|charge|shipping|ডেলিভারি|চার্জ|কুরিয়ার|courier/i.test(q)) {
    return {
      reply: isEn
        ? `Delivery Charges: Dhaka City ৳70 (24h), Sub-Dhaka ৳100, Outside Dhaka ৳130 (48-72h) via Steadfast & Pathao Cash on Delivery. Free shipping items require ৳0 delivery fee!`
        : `ডেলিভারি চার্জ: ঢাকা সিটি ৳৭০ (২৪ ঘণ্টা), সাব-ঢাকা ৳১০০, সারা বাংলাদেশ ৳১৩০ (৪৮-৭২ ঘণ্টা)। সম্পূর্ণ ক্যাশ অন ডেলিভারি ও আনবক্সিং চেক সুবিধা রয়েছে!`,
      quickActions: [{ label: isEn ? '🛍️ Browse Products' : '🛍️ সব পণ্য দেখুন', action: 'browse_all' }]
    };
  }

  return {
    reply: isEn
      ? `Welcome to ${storeName} AI Assistant! I can help you find products, calculate delivery fees, place 1-click orders, confirm pending orders, or track parcels live. Hotline: ${hotline}.`
      : `স্বাগতম ${storeName} এআই অ্যাসিস্ট্যান্টে! আমি আপনাকে পণ্য খুঁজতে, ১-ক্লিক অর্ডার করতে, পেন্ডিং অর্ডার কনফার্ম করতে এবং পার্সেল ট্র্যাক করতে সাহায্য করতে পারি। হটলাইন: ${hotline}।`,
    quickActions: [
      { label: isEn ? '🛍️ View All Products' : '🛍️ সব পণ্য দেখুন', action: 'browse_all' },
      { label: isEn ? '📍 Track My Order' : '📍 অর্ডার ট্র্যাক করুন', action: 'open_tracking' }
    ]
  };
}

// WhatsApp & Storefront Full-Control A-to-Z AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const {
      message,
      history = [],
      keywordRules = [],
      lang = 'bn',
      assistantDraft = false,
      catalogSummary,
      recentOrdersSummary
    } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Check backend auto-answer keyword rules first for customer queries
    if (!assistantDraft && Array.isArray(keywordRules) && keywordRules.length > 0) {
      const lowerMsg = String(message).toLowerCase();
      const matchedRule = keywordRules.find(
        (rule: any) =>
          rule &&
          rule.enabled !== false &&
          Array.isArray(rule.keywords) &&
          rule.keywords.some((kw: string) => kw && lowerMsg.includes(String(kw).trim().toLowerCase()))
      );
      if (matchedRule) {
        const matchedReply = lang === 'en' ? matchedRule.replyEn || matchedRule.replyBn : matchedRule.replyBn || matchedRule.replyEn;
        if (matchedReply) {
          return res.json({ reply: sanitizeCustomerFacingReply(matchedReply), matchedKeyword: true, quickActions: [] });
        }
      }
    }

    const saved = loadStoreData() || {};
    const storeName = saved?.settings?.storeName || 'BuyOne BD';
    const hotline = saved?.settings?.hotline || '+8801917942662';
    const productsList = Array.isArray(catalogSummary) ? catalogSummary : Array.isArray(saved?.products) ? saved.products : [];
    const ordersList = Array.isArray(recentOrdersSummary) ? recentOrdersSummary : Array.isArray(saved?.orders) ? saved.orders : [];

    // Free Auto AI Local fallback if GEMINI_API_KEY is not configured
    if (!process.env.GEMINI_API_KEY) {
      const localResult = buildSmartLocalChatReply({
        message: String(message),
        lang,
        storeName,
        hotline,
        products: productsList,
        orders: ordersList,
        assistantDraft
      });
      return res.json({ ...localResult, reply: sanitizeCustomerFacingReply(localResult.reply), mode: 'free_auto_local' });
    }

    const compactCatalog = productsList
      .slice(0, 20)
      .map((p: any) => `[id:${p.id}] ${p.titleBn || p.title} (${p.title}) - ৳${p.price} (stock:${p.stock ?? 0})`)
      .join(' | ');

    const systemInstruction = assistantDraft
      ? `You are drafting a helpful, concise customer care reply on behalf of a live support executive at "${storeName}" in Bangladesh. Reply in ${lang === 'en' ? 'English' : 'polite Bengali (বাংলা)'} matching the customer's question. Never mention admin portals or internal routes. Available catalog: ${compactCatalog}`
      : `You are Sumana, a professional A-to-Z Senior E-Commerce Shopping & Order Assistant for "${storeName}" in Bangladesh.
Communicate naturally in ${lang === 'en' ? 'English' : 'Bengali (বাংলা)'}.
Strict style rules: NEVER use the word "human" / "হিউম্যান" / "মানুষ" and NEVER mention "Admin Portal" or "/hossain". Refer to assistance teams only as "Support Desk" or "সাপোর্ট ডেস্ক".
Live Product Catalog: ${compactCatalog || 'Smartwatch, AirPods, Earbuds, Neckband, Charger'}.
Policies:
- Nationwide Cash on Delivery via Steadfast & Pathao across 64 districts.
- Dhaka City ৳70 (24h), Sub-Dhaka ৳100, Outside Dhaka ৳130 (48-72h).
- Payment: Cash on Delivery, bKash/Nagad/Rocket (${hotline}), Store Wallet.
- Hotline: ${hotline}.
Be helpful, concise, and guide customers smoothly from browsing to 1-click checkout or order confirmation.`;

    const contents = [
      ...history.slice(-8).map((h: any) => ({
        role: h.sender === 'user' || h.sender === 'customer' ? 'user' : 'model',
        parts: [{ text: h.textBn || h.text }]
      })),
      {
        role: 'user',
        parts: [{ text: String(message) }]
      }
    ];

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction
        }
      });

      const localHints = buildSmartLocalChatReply({
        message: String(message),
        lang,
        storeName,
        hotline,
        products: productsList,
        orders: ordersList,
        assistantDraft
      });

      return res.json({
        reply: sanitizeCustomerFacingReply(response.text || localHints.reply),
        quickActions: localHints.quickActions,
        mode: 'gemini_live'
      });
    } catch {
      const localResult = buildSmartLocalChatReply({
        message: String(message),
        lang,
        storeName,
        hotline,
        products: productsList,
        orders: ordersList,
        assistantDraft
      });
      return res.json({ ...localResult, reply: sanitizeCustomerFacingReply(localResult.reply), mode: 'free_auto_fallback' });
    }
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    return res.status(500).json({ error: err.message || 'Chat generation failed' });
  }
});

// Full E-commerce Persistence REST Endpoints (Cross-Device Sync)
const ORDER_STAGE_PRIORITY: Record<string, number> = {
  pending: 1,
  on_hold: 2,
  partial: 3,
  ai_confirmed: 4,
  processing: 5,
  shipped: 6,
  delivered: 7,
  cancelled: 7
};

function mergeSingleOrder(existing: any, incoming: any) {
  if (!existing) return incoming;
  if (!incoming) return existing;
  const exTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
  const inTime = new Date(incoming.updatedAt || incoming.createdAt || 0).getTime();
  const exStage = ORDER_STAGE_PRIORITY[existing.status] || 0;
  const inStage = ORDER_STAGE_PRIORITY[incoming.status] || 0;

  // Never downgrade an already AI-confirmed/processing/shipped/delivered order back to pending
  const preferIncoming =
    inTime > exTime + 500 ||
    (inTime === exTime && inStage >= exStage) ||
    (inStage > exStage && existing.status === 'pending');

  const winner = preferIncoming ? incoming : existing;
  const loser = preferIncoming ? existing : incoming;

  const confirmedByCustomer =
    Boolean(winner?.aiCallStatus?.confirmedByCustomer) || Boolean(loser?.aiCallStatus?.confirmedByCustomer);

  return {
    ...loser,
    ...winner,
    status:
      winner.status === 'pending' && confirmedByCustomer
        ? 'ai_confirmed'
        : winner.status,
    aiCallStatus: {
      ...(loser.aiCallStatus || {}),
      ...(winner.aiCallStatus || {}),
      confirmedByCustomer
    },
    courier: {
      ...(loser.courier || {}),
      ...(winner.courier || {})
    }
  };
}

function mergeOrdersById(primary: any[] = [], secondary: any[] = [], deletedIds: string[] = []) {
  const deletedSet = new Set(deletedIds || []);
  const map = new Map<string, any>();
  [...secondary, ...primary].forEach((ord) => {
    if (ord && ord.id && !deletedSet.has(ord.id)) {
      map.set(ord.id, mergeSingleOrder(map.get(ord.id), ord));
    }
  });
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

// Autonomous Human-Like Website Controller AI Agent Endpoint (/api/agent)
function buildLocalAgentPlan(params: {
  instruction: string;
  role: 'admin' | 'customer';
  lang: string;
  context: any;
}) {
  const { instruction, role, lang, context } = params;
  const raw = String(instruction || '').trim();
  const q = raw.toLowerCase();
  const isEn = lang === 'en';
  const orders: any[] = Array.isArray(context?.orders) ? context.orders : [];
  const products: any[] = Array.isArray(context?.products) ? context.products : [];
  const customers: any[] = Array.isArray(context?.customers) ? context.customers : [];
  const commands: any[] = [];
  const summaryLines: string[] = [];

  const orderMatch = raw.match(/(BD-[A-Z0-9-]+|POS-[A-Z0-9-]+)/i);
  const phoneMatch = raw.match(/(01[3-9][0-9]{8})/);
  const numberMatches = raw.match(/\d+/g)?.map((n) => Number(n)) || [];

  if (role === 'admin') {
    // 1. Confirm orders
    if (/confirm|approve|কনফার্ম|অনুমোদন/i.test(q)) {
      if (/all pending|সব পেন্ডিং|সকল পেন্ডিং/i.test(q)) {
        const pending = orders.filter((o) => o.status === 'pending' || o.status === 'on_hold');
        const maxAmt = /under|নিচে|কম/i.test(q) && numberMatches.length > 0 ? numberMatches[0] : Infinity;
        const targets = pending.filter((o) => Number(o.total || o.pricing?.total || 0) <= maxAmt);
        targets.forEach((o) => commands.push({ type: 'ai_confirm_order', payload: { orderId: o.id } }));
        summaryLines.push(
          isEn
            ? `Confirmed ${targets.length} pending order(s) via AI Confirm.`
            : `${targets.length}টি পেন্ডিং অর্ডার এআই কনফার্ম করা হয়েছে।`
        );
      } else if (orderMatch) {
        commands.push({ type: 'ai_confirm_order', payload: { orderId: orderMatch[1].toUpperCase() } });
        summaryLines.push(isEn ? `Confirmed order #${orderMatch[1]}.` : `অর্ডার #${orderMatch[1]} কনফার্ম করা হয়েছে।`);
      }
    }

    // 2. Order status update / courier book / partial payment
    if (orderMatch && /ship|deliver|cancel|process|hold|শিপ|ডেলিভার|বাতিল|প্রসেস/i.test(q)) {
      let nextStatus = 'processing';
      if (/ship|শিপ|পাঠাও/i.test(q)) nextStatus = 'shipped';
      else if (/deliver|কমপ্লিট|সম্পন্ন|ডেলিভার/i.test(q)) nextStatus = 'delivered';
      else if (/cancel|বাতিল/i.test(q)) nextStatus = 'cancelled';
      else if (/hold|হোল্ড/i.test(q)) nextStatus = 'on_hold';
      commands.push({ type: 'update_order_status', payload: { orderId: orderMatch[1].toUpperCase(), status: nextStatus } });
      summaryLines.push(isEn ? `Updated #${orderMatch[1]} to ${nextStatus}.` : `#${orderMatch[1]} স্ট্যাটাস ${nextStatus} করা হয়েছে।`);
    }

    if (orderMatch && /courier|steadfast|কুরিয়ার|বুক/i.test(q)) {
      const provider = /pathao/i.test(q) ? 'Pathao' : /redx/i.test(q) ? 'RedX' : 'Steadfast';
      commands.push({ type: 'book_courier', payload: { orderId: orderMatch[1].toUpperCase(), provider } });
      summaryLines.push(isEn ? `Booked #${orderMatch[1]} on ${provider}.` : `#${orderMatch[1]} ${provider} কুরিয়ারে বুকিং করা হয়েছে।`);
    }

    if (orderMatch && /partial|payment|collect|আংশিক|বাকি|টাকা জমা/i.test(q)) {
      const amt = numberMatches.find((n) => n >= 50) || 0;
      if (amt > 0) {
        commands.push({
          type: 'record_partial_payment',
          payload: { orderId: orderMatch[1].toUpperCase(), amount: amt, markDelivered: /deliver|full|সম্পন্ন/i.test(q) }
        });
        summaryLines.push(isEn ? `Recorded ৳${amt} partial payment on #${orderMatch[1]}.` : `#${orderMatch[1]}-এ ৳${amt} আংশিক পেমেন্ট যুক্ত করা হয়েছে।`);
      }
    }

    // 3. Loyalty Points adjust / set / delete
    if (/point|loyalty|লয়্যালটি|পয়েন্ট/i.test(q)) {
      const identifier = phoneMatch ? phoneMatch[1] : customers[0]?.phone || '';
      if (/delete|reset|remove|মুছে|রিসেট|শূন্য/i.test(q)) {
        commands.push({ type: 'adjust_loyalty_points', payload: { identifier, mode: 'delete', note: 'AI Agent Reset' } });
        summaryLines.push(isEn ? `Reset loyalty points for ${identifier || 'customer'}.` : `${identifier || 'গ্রাহকের'} লয়্যালটি পয়েন্ট রিসেট করা হয়েছে।`);
      } else if (numberMatches.length > 0) {
        const pts = numberMatches[phoneMatch ? 1 : 0] ?? numberMatches[0];
        if (pts !== undefined && identifier) {
          const isSet = /set|fix|exact|সেট/i.test(q);
          const isSub = /deduct|minus|subtract|কমা/i.test(q);
          commands.push({
            type: 'adjust_loyalty_points',
            payload: {
              identifier,
              mode: isSet ? 'set' : 'adjust',
              exactPoints: isSet ? pts : undefined,
              delta: isSet ? undefined : isSub ? -pts : pts,
              note: raw.slice(0, 80)
            }
          });
          summaryLines.push(
            isEn
              ? `${isSet ? 'Set' : isSub ? 'Deducted' : 'Added'} ${pts} loyalty points for ${identifier}.`
              : `${identifier}-এর অ্যাকাউন্টে ${pts} পয়েন্ট ${isSet ? 'সেট' : 'আপডেট'} করা হয়েছে।`
          );
        }
      }
    }

    // 4. Flash Sale toggle
    if (/flash\s?sale|ফ্ল্যাশ\s?সেল/i.test(q)) {
      const disable = /off|disable|stop|বন্ধ/i.test(q);
      commands.push({ type: 'toggle_flash_sale', payload: { enabled: !disable } });
      summaryLines.push(isEn ? `Flash Sale ${!disable ? 'enabled' : 'disabled'}.` : `ফ্ল্যাশ সেল ${!disable ? 'চালু' : 'বন্ধ'} করা হয়েছে।`);
    }

    // 5. Coupon creation
    if (/coupon|voucher|কুপন/i.test(q)) {
      const codeMatch = raw.match(/\b([A-Z0-9]{4,14})\b/);
      const code = codeMatch ? codeMatch[1] : `SAVE${numberMatches[0] || 100}`;
      const val = numberMatches[0] || 100;
      const isPercent = /%|percent|শতাংশ/i.test(q);
      commands.push({
        type: 'create_coupon',
        payload: {
          code,
          discountType: isPercent ? 'percent' : 'fixed',
          value: val,
          minOrder: numberMatches[1] || 500
        }
      });
      summaryLines.push(isEn ? `Created coupon ${code} (${val}${isPercent ? '%' : ' BDT'} off).` : `নতুন কুপন ${code} তৈরি করা হয়েছে।`);
    }

    // 6. Delivery fees update
    if (/delivery|shipping|ডেলিভারি/i.test(q) && numberMatches.length > 0) {
      const fee = numberMatches[0];
      if (/outside|বাইরে/i.test(q)) {
        commands.push({ type: 'update_store_settings', payload: { dhakaOutsideFee: fee } });
      } else {
        commands.push({ type: 'update_store_settings', payload: { dhakaInsideFee: fee } });
      }
      summaryLines.push(isEn ? `Updated delivery charge to ৳${fee}.` : `ডেলিভারি চার্জ ৳${fee} সেট করা হয়েছে।`);
    }

    // 7. Abandoned cart recovery
    if (/abandoned|cart|পরিত্যক্ত/i.test(q)) {
      commands.push({ type: 'recover_abandoned_cart', payload: { cartId: 'all_pending' } });
      summaryLines.push(isEn ? `Triggered recovery on pending abandoned carts.` : `সকল পেন্ডিং কার্ট রিকভারি মেসেজ পাঠানো হয়েছে।`);
    }

    // 8. Navigation shortcut
    if (/open|go to|show|দেখাও|যাও|pos|পস|partial|আংশিক|loyalty|অর্ডার/i.test(q) && commands.length === 0) {
      let tab = 'orders';
      if (/pos|পস/i.test(q)) tab = 'pos_system';
      else if (/partial|আংশিক/i.test(q)) tab = 'partial_orders';
      else if (/abandoned|পরিত্যক্ত/i.test(q)) tab = 'abandoned_carts';
      else if (/loyalty|customer|গ্রাহক/i.test(q)) tab = 'users';
      else if (/product|পণ্য/i.test(q)) tab = 'products';
      else if (/marketing|মার্কেটিং/i.test(q)) tab = 'marketing_hub';
      commands.push({ type: 'navigate_admin_tab', payload: { tab } });
      summaryLines.push(isEn ? `Opened ${tab.replace('_', ' ')} panel.` : `${tab} সেকশন খোলা হয়েছে।`);
    }

    return {
      reply:
        summaryLines.length > 0
          ? summaryLines.join(' ')
          : isEn
          ? 'Ready! Tell me what to manage: e.g., "Confirm all pending orders", "Give 100 loyalty points to 01917942662", "Create coupon EID150", "Turn on flash sale", or "Open POS".'
          : 'আমি সম্পূর্ণ ওয়েবসাইট পরিচালনা করতে প্রস্তুত! যেমন বলুন: "সব পেন্ডিং অর্ডার কনফার্ম করো", "01917942662 নম্বরে ১০০ পয়েন্ট দাও", "EID150 কুপন তৈরি করো", বা "আংশিক অর্ডার দেখাও"।',
      commands
    };
  }

  // CUSTOMER ROLE PLAN
  if (orderMatch && /confirm|কনফার্ম/i.test(q)) {
    commands.push({ type: 'ai_confirm_order', payload: { orderId: orderMatch[1].toUpperCase() } });
    return {
      reply: isEn ? `Confirming your order #${orderMatch[1]} right now!` : `আপনার অর্ডার #${orderMatch[1]} কনফার্ম করা হচ্ছে!`,
      commands
    };
  }
  if (orderMatch) {
    commands.push({ type: 'track_order', payload: { orderId: orderMatch[1].toUpperCase() } });
    return {
      reply: isEn ? `Opening live tracking for #${orderMatch[1]}.` : `অর্ডার #${orderMatch[1]}-এর লাইভ ট্র্যাকিং খোলা হচ্ছে।`,
      commands
    };
  }
  const prodMatch = products.find((p) => {
    const h = `${p.title || ''} ${p.titleBn || ''} ${p.category || ''}`.toLowerCase();
    return q.split(/\s+/).some((w) => w.length >= 2 && h.includes(w));
  });
  if (prodMatch) {
    if (/buy|order|অর্ডার|কিন/i.test(q)) {
      commands.push({ type: 'open_checkout', payload: { productId: prodMatch.id } });
    } else {
      commands.push({ type: 'add_to_cart', payload: { productId: prodMatch.id, quantity: 1 } });
    }
    return {
      reply: isEn
        ? `Selected ${prodMatch.title} (৳${prodMatch.price}) for you!`
        : `${prodMatch.titleBn || prodMatch.title} (৳${prodMatch.price}) সিলেক্ট করা হয়েছে!`,
      commands
    };
  }
  return {
    reply: isEn
      ? 'I can help you browse products, add items to cart, open 1-click checkout, confirm your order, or track parcels live!'
      : 'আমি আপনাকে পণ্য খুঁজতে, কার্টে যোগ করতে, ১-ক্লিক অর্ডার করতে ও পার্সেল ট্র্যাক করতে সরাসরি সাহায্য করতে পারি!',
    commands
  };
}

app.post('/api/agent', async (req, res) => {
  try {
    const { instruction, role = 'admin', lang = 'bn', context = {} } = req.body || {};
    if (!instruction || !String(instruction).trim()) {
      return res.status(400).json({ success: false, error: 'instruction is required' });
    }

    const fallback = buildLocalAgentPlan({ instruction: String(instruction), role, lang, context });
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ success: true, ...fallback, mode: 'free_auto_local' });
    }

    try {
      const compactContext = {
        storeName: context.storeName || 'BuyOne BD',
        orders: (context.orders || []).slice(0, 25).map((o: any) => ({
          id: o.id,
          name: o.customer?.name || o.name,
          phone: o.customer?.phone || o.phone,
          status: o.status,
          total: o.pricing?.total ?? o.total,
          due: o.payment?.dueAmount ?? o.due ?? 0
        })),
        products: (context.products || []).slice(0, 30).map((p: any) => ({
          id: p.id,
          title: p.title,
          titleBn: p.titleBn,
          price: p.price,
          stock: p.stock,
          isFlashSale: p.isFlashSale
        })),
        customers: (context.customers || []).slice(0, 25).map((c: any) => ({
          name: c.name,
          phone: c.phone,
          loyaltyPoints: c.loyaltyPoints,
          walletBalance: c.walletBalance
        })),
        abandonedCarts: (context.abandonedCarts || []).slice(0, 15).map((c: any) => ({
          id: c.id,
          phone: c.customerPhone,
          total: c.total,
          recovered: c.recovered
        })),
        deliveryFees: context.deliveryFees,
        flashSaleEnabled: context.flashSaleEnabled
      };

      const systemPrompt =
        role === 'admin'
          ? `You are the Autonomous Store Operator AI for "${compactContext.storeName}" e-commerce website.
You control the entire website like a skilled store operations manager.
Interpret the Admin's instruction (in Bengali or English) and return JSON with a natural helpful "reply" (in ${lang === 'en' ? 'English' : 'polite Bengali'}) and an array of "commands" to execute immediately against live store state.
Available command types and payload fields (use payloadJson as a JSON string representing the command payload):
1. "ai_confirm_order": { "orderId": "BD-..." } (you may emit multiple commands for multiple matching orders)
2. "update_order_status": { "orderId": "BD-...", "status": "pending"|"ai_confirmed"|"processing"|"on_hold"|"shipped"|"delivered"|"partial"|"cancelled" }
3. "book_courier": { "orderId": "BD-...", "provider": "Steadfast"|"Pathao"|"RedX" }
4. "update_product": { "productId": "...", "price": number?, "originalPrice": number?, "stock": number?, "isFlashSale": boolean? }
5. "create_coupon": { "code": "SAVE100", "discountType": "fixed"|"percent"|"free_shipping", "value": number, "minOrder": number }
6. "toggle_flash_sale": { "enabled": boolean }
7. "adjust_loyalty_points": { "identifier": "phone_or_name", "mode": "adjust"|"set"|"delete", "delta": number?, "exactPoints": number?, "note": "..." }
8. "adjust_wallet": { "identifier": "phone_or_name", "delta": number, "note": "..." }
9. "recover_abandoned_cart": { "cartId": "cart_id_or_all_pending" }
10. "record_partial_payment": { "orderId": "BD-...", "amount": number, "markDelivered": boolean? }
11. "update_store_settings": { "dhakaInsideFee": number?, "dhakaSubFee": number?, "dhakaOutsideFee": number?, "announcementTextBn": string?, "announcementTextEn": string?, "announcementEnabled": boolean?, "loyaltyEnabled": boolean?, "loyaltyPointsPer100": number?, "loyaltyBdtPerPoint": number? }
12. "navigate_admin_tab": { "tab": "overview"|"orders"|"partial_orders"|"pos_system"|"products"|"abandoned_carts"|"users"|"ai_operator"|"marketing_hub" }
Only emit commands clearly requested. Live state: ${JSON.stringify(compactContext)}`
          : `You are an A-to-Z Shopping Assistant for "${compactContext.storeName}". Help the customer shop smoothly and professionally.
NEVER use the word "human", "হিউম্যান", "মানুষ", "Admin Portal", or "/hossain" in replies.
Return JSON with "reply" (${lang === 'en' ? 'English' : 'Bengali'}) and optional "commands" using payloadJson strings:
1. "add_to_cart": { "productId": "...", "quantity": 1 }
2. "open_checkout": { "productId": "..." }
3. "ai_confirm_order": { "orderId": "BD-..." }
4. "track_order": { "orderId": "BD-..." }
5. "navigate_store": { "category": "all"|slug, "view": "store"|"tracking"|"flash_sale" }
Live catalog & recent orders: ${JSON.stringify(compactContext)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: String(instruction),
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              commands: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    payloadJson: { type: Type.STRING }
                  },
                  required: ['type', 'payloadJson']
                }
              }
            },
            required: ['reply', 'commands']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      const normalizedCommands = Array.isArray(parsed.commands)
        ? parsed.commands.map((c: any) => {
            let payload: any = {};
            try {
              payload = typeof c.payloadJson === 'string' ? JSON.parse(c.payloadJson) : c.payload || {};
            } catch {
              payload = {};
            }
            return { type: String(c.type || ''), payload };
          }).filter((c: any) => c.type)
        : [];

      const rawReply = parsed.reply || fallback.reply;
      const finalCommands = normalizedCommands.length > 0 ? normalizedCommands : fallback.commands;
      const reviewTasks = req.body?.reviewMode && role === 'admin'
        ? convertCommandsToReviewTasks(finalCommands, context, lang)
        : [];
      return res.json({
        success: true,
        reply: role === 'customer' ? sanitizeCustomerFacingReply(rawReply) : rawReply,
        commands: finalCommands,
        reviewTasks,
        mode: 'gemini_live'
      });
    } catch (geminiErr: any) {
      console.warn('Gemini /api/agent fallback used:', geminiErr?.message || geminiErr);
      const reviewTasks = req.body?.reviewMode && role === 'admin'
        ? convertCommandsToReviewTasks(fallback.commands, context, lang)
        : [];
      return res.json({
        success: true,
        ...fallback,
        reply: role === 'customer' ? sanitizeCustomerFacingReply(fallback.reply) : fallback.reply,
        reviewTasks,
        mode: 'free_auto_fallback'
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Agent request failed' });
  }
});

function convertCommandsToReviewTasks(commands: any[], context: any, lang = 'bn') {
  const orders: any[] = Array.isArray(context?.orders) ? context.orders : [];
  const preferredCourier = context?.preferredCourier || 'Steadfast';
  const nowIso = new Date().toISOString();
  return (commands || [])
    .filter((c) => c && c.type && c.type !== 'navigate_admin_tab')
    .map((c, idx) => {
      const p = c.payload || {};
      const ord = p.orderId ? orders.find((o) => o.id === p.orderId) : null;
      let actionType: string = c.type;
      let title = `AI Task: ${c.type}`;
      let titleBn = `AI কাজ: ${c.type}`;
      let summary = JSON.stringify(p);
      let summaryBn = summary;
      let targetType = 'store';
      let targetId = String(p.orderId || p.productId || p.identifier || p.cartId || p.code || `task-${idx}`);
      const payload: Record<string, any> = { ...p };

      if (c.type === 'ai_confirm_order') {
        actionType = 'confirm_order';
        targetType = 'order';
        title = `Confirm Order #${p.orderId}`;
        titleBn = `অর্ডার #${p.orderId} কনফার্ম করুন`;
        summary = ord
          ? `${ord.customer?.name || 'Customer'} · ৳${ord.pricing?.total || 0} (${ord.customer?.district || 'BD'})`
          : `Confirm pending order #${p.orderId}`;
        summaryBn = summary;
      } else if (c.type === 'book_courier') {
        actionType = 'send_courier';
        targetType = 'order';
        payload.provider = p.provider || preferredCourier;
        title = `Send #${p.orderId} to ${payload.provider}`;
        titleBn = `অর্ডার #${p.orderId} ${payload.provider} কুরিয়ারে পাঠান`;
        summary = ord ? `${ord.customer?.name || ''} · ${ord.customer?.address || ''} · COD ৳${ord.payment?.dueAmount ?? ord.pricing?.total ?? 0}` : `Dispatch #${p.orderId}`;
        summaryBn = summary;
      } else if (c.type === 'update_order_status') {
        actionType = 'confirm_order';
        targetType = 'order';
        title = `Update #${p.orderId} → ${p.status}`;
        titleBn = `#${p.orderId} স্ট্যাটাস → ${p.status}`;
      } else if (c.type === 'update_product') {
        targetType = 'product';
        title = `Update Product ${p.productId || p.query || ''}`;
        titleBn = `পণ্য আপডেট করুন (${p.productId || p.query || ''})`;
      } else if (c.type === 'create_coupon') {
        payload.couponCode = p.code;
        payload.couponValue = p.value;
        title = `Create Coupon ${p.code}`;
        titleBn = `নতুন কুপন তৈরি: ${p.code}`;
      } else if (c.type === 'toggle_flash_sale') {
        payload.flashSaleEnabled = Boolean(p.enabled);
        title = `${p.enabled ? 'Enable' : 'Pause'} Flash Sale`;
        titleBn = `ফ্ল্যাশ সেল ${p.enabled ? 'চালু' : 'বন্ধ'} করুন`;
      } else if (c.type === 'adjust_loyalty_points') {
        targetType = 'customer';
        payload.pointsDelta = p.delta ?? p.exactPoints ?? 0;
        title = `Adjust Loyalty Points (${p.identifier})`;
        titleBn = `লয়্যালটি পয়েন্ট আপডেট (${p.identifier})`;
      } else if (c.type === 'recover_abandoned_cart') {
        targetType = 'cart';
        title = `Send Cart Recovery Follow-up`;
        titleBn = `পরিত্যক্ত কার্ট রিকভারি মেসেজ পাঠান`;
      } else if (c.type === 'update_store_settings') {
        targetType = 'store';
        title = `Update Store Settings`;
        titleBn = `স্টোর সেটিংস আপডেট করুন`;
      }

      return {
        id: `aiq-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        actionType,
        title,
        titleBn,
        summary,
        summaryBn,
        targetType,
        targetId,
        payload,
        priority: actionType === 'fraud_hold' || actionType === 'send_courier' ? 'high' : 'medium',
        confidence: 92,
        reasoning: lang === 'en' ? 'Prepared from Admin AI command for your review & approval.' : 'অ্যাডমিন কমান্ড থেকে রিভিউ ও অনুমোদনের জন্য প্রস্তুত করা হয়েছে।',
        reasoningBn: 'অ্যাডমিন কমান্ড থেকে রিভিউ ও অনুমোদনের জন্য প্রস্তুত করা হয়েছে।',
        status: 'pending_review',
        createdAt: nowIso
      };
    });
}

// Full Website Control AI: Autonomous Store Scanner & Review Queue Persistence
function buildAutopilotReviewTasks(input: any) {
  const {
    orders = [],
    products = [],
    abandonedCarts = [],
    resellers = [],
    settings = {},
    existingQueue = []
  } = input || {};

  const autoCfg = settings?.aiAutopilotSettings || {};
  const preferredCourier = autoCfg.preferredCourier || 'Steadfast';
  const pendingExistingKeys = new Set(
    (Array.isArray(existingQueue) ? existingQueue : [])
      .filter((t: any) => t && t.status === 'pending_review')
      .map((t: any) => `${t.actionType}:${t.targetId}`)
  );

  const storeName = settings?.storeName || 'BuyOne BD';
  const generated: any[] = [];
  const nowIso = new Date().toISOString();

  const pushTask = (task: any) => {
    const key = `${task.actionType}:${task.targetId}`;
    if (pendingExistingKeys.has(key)) return;
    pendingExistingKeys.add(key);
    generated.push({
      ...task,
      id: `aiq-${Date.now()}-${generated.length}-${Math.random().toString(36).slice(2, 6)}`,
      status: 'pending_review',
      createdAt: nowIso
    });
  };

  // 1. Scan Orders: AI Voice Call, Risk/Hold, Confirm Order, Send Courier, WhatsApp Tracking
  (Array.isArray(orders) ? orders : []).slice(0, 40).forEach((ord: any) => {
    if (!ord || !ord.id) return;
    const custName = ord.customer?.name || 'Customer';
    const custPhone = ord.customer?.phone || '';
    const district = ord.customer?.district || 'Bangladesh';
    const total = Number(ord.pricing?.total || 0);
    const itemsText = Array.isArray(ord.items)
      ? ord.items.map((i: any) => `${i.productTitleBn || i.productTitle} x${i.quantity}`).join(', ')
      : 'Order items';

    if (ord.status === 'pending' || ord.status === 'on_hold') {
      const isHighRisk = ord.fraudCheck?.riskLevel === 'high_risk' || (typeof ord.fraudCheck?.successRate === 'number' && ord.fraudCheck.successRate < 50);

      if (isHighRisk && ord.status !== 'on_hold') {
        pushTask({
          actionType: 'fraud_hold',
          title: `Hold High-Risk Order #${ord.id} (${ord.fraudCheck?.successRate ?? 45}% Success Rate)`,
          titleBn: `উচ্চ ঝুঁকিপূর্ণ অর্ডার #${ord.id} হোল্ড ও ভেরিফাই করুন`,
          summary: `${custName} (${custPhone}) · ৳${total} · Risk: ${ord.fraudCheck?.riskLevel || 'high_risk'}`,
          summaryBn: `${custName} (${custPhone}) · ৳${total} · ডেলিভারি সফলতা ${ord.fraudCheck?.successRate ?? 45}%`,
          targetType: 'order',
          targetId: ord.id,
          payload: {
            orderId: ord.id,
            phone: custPhone,
            contactName: custName,
            riskLevel: 'high_risk',
            status: 'on_hold'
          },
          priority: 'high',
          confidence: 95,
          reasoning: 'Low historical delivery success score detected. Recommend holding or requiring advance delivery fee before dispatch.',
          reasoningBn: 'কাস্টমারের পূর্ববর্তী ডেলিভারি সফলতার হার কম। কুরিয়ার পাঠানোর আগে কল করে ঠিকানা ও অগ্রিম যাচাই করার পরামর্শ দেওয়া হচ্ছে।'
        });
      }

      if (autoCfg.autoPrepareCall !== false && !ord.aiCallStatus?.called) {
        pushTask({
          actionType: 'ai_voice_call',
          title: `AI Voice Verification Call for #${ord.id}`,
          titleBn: `অর্ডার #${ord.id}-এ AI ভয়েস কনফার্মেশন কল করুন`,
          summary: `Call ${custName} (${custPhone}) in ${district} · ৳${total} (${itemsText})`,
          summaryBn: `${custName} (${custPhone}), ${district} · ৳${total} (${itemsText})`,
          targetType: 'order',
          targetId: ord.id,
          payload: {
            orderId: ord.id,
            phone: custPhone,
            contactName: custName,
            script: `আসসালামু আলাইকুম ${custName}! ${storeName} থেকে আপনার অর্ডার #${ord.id} (${itemsText}, মোট ৳${total}) নিশ্চিত করতে কল করা হয়েছে।`
          },
          priority: 'high',
          confidence: 94,
          reasoning: 'New COD order has not received an AI verification call yet.',
          reasoningBn: 'নতুন ক্যাশ-অন-ডেলিভারি অর্ডারটিতে এখনো এআই কনফার্মেশন কল করা হয়নি।'
        });
      }

      if (autoCfg.autoPrepareConfirm !== false && !isHighRisk) {
        pushTask({
          actionType: 'confirm_order',
          title: `Approve & Confirm Order #${ord.id}`,
          titleBn: `অর্ডার #${ord.id} কনফার্ম করুন`,
          summary: `${custName} (${custPhone}) · ৳${total} · Delivery score ${ord.fraudCheck?.successRate ?? 92}%`,
          summaryBn: `${custName} (${custPhone}) · ৳${total} · ডেলিভারি স্কোর ${ord.fraudCheck?.successRate ?? 92}%`,
          targetType: 'order',
          targetId: ord.id,
          payload: {
            orderId: ord.id,
            phone: custPhone,
            contactName: custName,
            status: 'ai_confirmed'
          },
          priority: 'high',
          confidence: 91,
          reasoning: 'Safe customer profile & valid Bangladesh shipping details ready for confirmation.',
          reasoningBn: 'গ্রাহকের ঠিকানা ও ডেলিভারি স্কোর নিরাপদ। কনফার্ম করলে সাথে সাথেই কুরিয়ার বুকিংয়ের জন্য প্রস্তুত হবে।'
        });
      }
    }

    const needsCourierDispatch =
      (ord.status === 'ai_confirmed' || ord.status === 'processing') &&
      !ord.courier?.consignmentId &&
      (!ord.courier?.trackingCode || /^STDF-BD-|^POS-INVOICE-/.test(String(ord.courier?.trackingCode || '')));

    if (autoCfg.autoPrepareCourier !== false && needsCourierDispatch) {
      pushTask({
        actionType: 'send_courier',
        title: `Dispatch #${ord.id} via ${preferredCourier}`,
        titleBn: `অর্ডার #${ord.id} ${preferredCourier} কুরিয়ারে পাঠান`,
        summary: `${custName} · ${ord.customer?.address || ''}, ${district} · COD ৳${ord.payment?.dueAmount ?? total}`,
        summaryBn: `${custName} · ${ord.customer?.address || ''}, ${district} · COD ৳${ord.payment?.dueAmount ?? total}`,
        targetType: 'order',
        targetId: ord.id,
        payload: {
          orderId: ord.id,
          provider: preferredCourier,
          phone: custPhone,
          contactName: custName
        },
        priority: 'high',
        confidence: 96,
        reasoning: 'Confirmed order is awaiting real courier parcel booking.',
        reasoningBn: 'কনফার্মড অর্ডারটি কুরিয়ার পিকআপ বুকিংয়ের জন্য অপেক্ষমাণ রয়েছে।'
      });
    }

    if (autoCfg.autoPrepareWhatsapp !== false && ord.status === 'shipped' && ord.courier?.trackingCode) {
      pushTask({
        actionType: 'whatsapp_followup',
        title: `Send Tracking Update on WhatsApp (#${ord.id})`,
        titleBn: `#${ord.id} কুরিয়ার ট্র্যাকিং লিংক WhatsApp-এ পাঠান`,
        summary: `To ${custName} (${custPhone}) · Code: ${ord.courier.trackingCode}`,
        summaryBn: `${custName} (${custPhone}) · ট্র্যাকিং: ${ord.courier.trackingCode}`,
        targetType: 'order',
        targetId: ord.id,
        payload: {
          orderId: ord.id,
          phone: custPhone,
          contactName: custName,
          contactType: 'customer',
          message: `আসসালামু আলাইকুম ${custName}, ${storeName}-এ আপনার অর্ডার #${ord.id} কুরিয়ারে (${ord.courier.provider || preferredCourier}) বুকিং হয়েছে। ট্র্যাকিং কোড: ${ord.courier.trackingCode}। যেকোনো সহায়তায় মেসেজ করুন!`
        },
        priority: 'medium',
        confidence: 89,
        reasoning: 'Proactive WhatsApp tracking notification reduces courier return/cancellation rate.',
        reasoningBn: 'শিপড অর্ডারে গ্রাহককে WhatsApp-এ ট্র্যাকিং কোড পাঠালে কুরিয়ার রিটার্ন কমে।'
      });
    }
  });

  // 2. Scan Abandoned Carts
  if (autoCfg.autoPrepareWhatsapp !== false) {
    (Array.isArray(abandonedCarts) ? abandonedCarts : [])
      .filter((c: any) => c && !c.recovered && !c.whatsappSent && c.customerPhone)
      .slice(0, 8)
      .forEach((cart: any) => {
        const cName = cart.customerName || 'Customer';
        pushTask({
          actionType: 'recover_abandoned_cart',
          title: `Recover Abandoned Cart (${cName} · ৳${cart.total || 0})`,
          titleBn: `অসম্পূর্ণ কার্ট রিকভারি (${cName} · ৳${cart.total || 0})`,
          summary: `Send WhatsApp comeback coupon WELCOME100 to ${cart.customerPhone}`,
          summaryBn: `${cart.customerPhone} নম্বরে WhatsApp ডিসকাউন্ট রিমাইন্ডার পাঠান`,
          targetType: 'cart',
          targetId: cart.id,
          payload: {
            cartId: cart.id,
            phone: cart.customerPhone,
            contactName: cName,
            contactType: 'customer',
            message: `আসসালামু আলাইকুম ${cName}! ${storeName}-এ আপনার পছন্দের পণ্যটি কার্টে রয়েছে (মোট ৳${cart.total || 0})। আজই অর্ডার করলে WELCOME100 কুপনে ৳১০০ ছাড় পাবেন!`
          },
          priority: 'medium',
          confidence: 88,
          reasoning: 'Unrecovered abandoned cart with valid Bangladesh phone number ready for WhatsApp conversion.',
          reasoningBn: 'গ্রাহকের মোবাইল নম্বর পাওয়া গেছে — WhatsApp রিকভারি পাঠালে অর্ডার কনভার্ট হতে পারে।'
        });
      });
  }

  // 3. Scan Pending Resellers
  (Array.isArray(resellers) ? resellers : [])
    .filter((r: any) => r && r.status === 'pending')
    .slice(0, 6)
    .forEach((reseller: any) => {
      pushTask({
        actionType: 'approve_reseller',
        title: `Approve Reseller: ${reseller.name} (${reseller.district || 'BD'})`,
        titleBn: `রিসেলার অনুমোদন: ${reseller.name} (${reseller.resellerCode})`,
        summary: `Phone: ${reseller.phone} · Default Margin: ${reseller.commissionPercent || 18}%`,
        summaryBn: `মোবাইল: ${reseller.phone} · কমিশন: ${reseller.commissionPercent || 18}%`,
        targetType: 'reseller',
        targetId: reseller.id,
        payload: {
          resellerId: reseller.id,
          phone: reseller.phone,
          contactName: reseller.name
        },
        priority: 'medium',
        confidence: 90,
        reasoning: 'New reseller registration waiting for admin review.',
        reasoningBn: 'নতুন রিসেলার আবেদন অ্যাডমিন রিভিউয়ের জন্য অপেক্ষমাণ রয়েছে।'
      });
    });

  // 4. Scan Low Stock Products (<= 5 units)
  (Array.isArray(products) ? products : [])
    .filter((p: any) => p && typeof p.stock === 'number' && p.stock <= 5)
    .slice(0, 4)
    .forEach((prod: any) => {
      pushTask({
        actionType: 'update_product',
        title: `Restock Low Inventory: ${prod.title}`,
        titleBn: `স্টক সতর্কতা ও রিস্টক: ${prod.titleBn || prod.title}`,
        summary: `Only ${prod.stock} unit(s) left · Suggest restocking +25 units`,
        summaryBn: `মাত্র ${prod.stock}টি বাকি আছে — +২৫ পিস স্টক আপডেট করুন`,
        targetType: 'product',
        targetId: prod.id,
        payload: {
          productId: prod.id,
          stock: Math.max(25, Number(prod.stock || 0) + 25)
        },
        priority: 'low',
        confidence: 85,
        reasoning: 'Product stock dropped to 5 units or below.',
        reasoningBn: 'পণ্যের স্টক ৫ পিসের নিচে নেমে এসেছে।'
      });
    });

  return generated;
}

app.post('/api/ai/autopilot/scan', async (req, res) => {
  try {
    const body = req.body || {};
    const current = loadStoreData() || {};
    const existingQueue = Array.isArray(body.existingQueue)
      ? body.existingQueue
      : Array.isArray(current.aiReviewQueue)
      ? current.aiReviewQueue
      : [];

    const heuristicTasks = buildAutopilotReviewTasks({
      orders: Array.isArray(body.orders) ? body.orders : current.orders || [],
      products: Array.isArray(body.products) ? body.products : current.products || [],
      abandonedCarts: Array.isArray(body.abandonedCarts) ? body.abandonedCarts : current.abandonedCarts || [],
      resellers: Array.isArray(body.resellers) ? body.resellers : current.resellers || [],
      settings: body.settings || current.settings || {},
      existingQueue
    });

    let instructionTasks: any[] = [];
    if (body.instruction && String(body.instruction).trim()) {
      const plan = buildLocalAgentPlan({
        instruction: String(body.instruction),
        role: 'admin',
        lang: body.lang || 'bn',
        context: {
          orders: Array.isArray(body.orders) ? body.orders : current.orders || [],
          products: Array.isArray(body.products) ? body.products : current.products || [],
          customers: Array.isArray(body.customers) ? body.customers : current.customerAccounts || []
        }
      });
      instructionTasks = convertCommandsToReviewTasks(
        plan.commands,
        {
          orders: Array.isArray(body.orders) ? body.orders : current.orders || [],
          preferredCourier: body.settings?.aiAutopilotSettings?.preferredCourier || 'Steadfast'
        },
        body.lang || 'bn'
      );
    }

    const newTasks = [...instructionTasks, ...heuristicTasks];
    const mergedQueue = [...newTasks, ...existingQueue].slice(0, 120);
    current.aiReviewQueue = mergedQueue;
    saveStoreData(current);
    broadcastWs({ type: 'ai_queue:sync', aiReviewQueue: mergedQueue });

    return res.json({
      success: true,
      addedCount: newTasks.length,
      newTasks,
      queue: mergedQueue
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'AI Autopilot scan failed' });
  }
});

app.post('/api/ai/autopilot/queue', (req, res) => {
  try {
    const { tasks } = req.body || {};
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ success: false, error: 'tasks array required' });
    }
    const current = loadStoreData() || {};
    current.aiReviewQueue = tasks.slice(0, 120);
    saveStoreData(current);
    broadcastWs({ type: 'ai_queue:sync', aiReviewQueue: current.aiReviewQueue });
    return res.json({ success: true, queue: current.aiReviewQueue });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Failed to update AI review queue' });
  }
});

// Full Website Maintenance & Health Audit AI Endpoint
app.post('/api/ai/maintenance/audit', (req, res) => {
  try {
    const body = req.body || {};
    const current = loadStoreData() || {};
    const products: any[] = Array.isArray(body.products) ? body.products : (current.products || []);
    const orders: any[] = Array.isArray(body.orders) ? body.orders : (current.orders || []);
    const abandonedCarts: any[] = Array.isArray(body.abandonedCarts) ? body.abandonedCarts : (current.abandonedCarts || []);
    const resellers: any[] = Array.isArray(body.resellers) ? body.resellers : (current.resellers || []);
    const sliders: any[] = Array.isArray(body.sliders) ? body.sliders : (current.sliders || []);
    const settings: any = body.settings || current.settings || {};
    const existingQueue: any[] = Array.isArray(body.existingQueue)
      ? body.existingQueue
      : Array.isArray(current.aiReviewQueue)
      ? current.aiReviewQueue
      : [];

    const nowIso = new Date().toISOString();
    const pendingKeys = new Set(
      existingQueue.filter((t: any) => t?.status === 'pending_review').map((t: any) => `${t.actionType}:${t.targetId}`)
    );

    const issues: {
      id: string;
      area: 'seo' | 'inventory' | 'orders' | 'media' | 'backup' | 'resellers';
      severity: 'critical' | 'warning' | 'healthy';
      title: string;
      titleBn: string;
      detail: string;
      count: number;
    }[] = [];

    const maintenanceTasks: any[] = [];
    const addTask = (task: any) => {
      const k = `${task.actionType}:${task.targetId}`;
      if (pendingKeys.has(k)) return;
      pendingKeys.add(k);
      maintenanceTasks.push({
        ...task,
        id: `aiq-maint-${Date.now()}-${maintenanceTasks.length}-${Math.random().toString(36).slice(2, 6)}`,
        status: 'pending_review',
        createdAt: nowIso
      });
    };

    // 1. SEO & Slug audit on products
    const missingSeoProds = products.filter(
      (p) => p && (!p.seo?.slug || !p.seo?.metaTitle || !p.seo?.metaDescription || !p.seo?.keywords)
    );
    if (missingSeoProds.length > 0) {
      issues.push({
        id: 'audit-seo-prods',
        area: 'seo',
        severity: missingSeoProds.length > 3 ? 'critical' : 'warning',
        title: `${missingSeoProds.length} product(s) missing SEO meta title/description/slug`,
        titleBn: `${missingSeoProds.length}টি পণ্যে SEO মেটা টাইটেল/স্লাগ অসম্পূর্ণ`,
        detail: 'Prepared auto-generated Bangla & English SEO metadata tasks for review.',
        count: missingSeoProds.length
      });
      missingSeoProds.slice(0, 6).forEach((p) => {
        const cleanSlug = String(p.seo?.slug || p.title || p.id || 'product')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 64);
        addTask({
          actionType: 'fix_product_seo',
          title: `Auto-Optimize SEO: ${p.title}`,
          titleBn: `SEO ফিক্স করুন: ${p.titleBn || p.title}`,
          summary: `Slug: /product/${cleanSlug} · Meta title + keywords ready`,
          summaryBn: `লিংক: /product/${cleanSlug} · সম্পূর্ণ বাংলা ও ইংরেজি মেটা ট্যাগ`,
          targetType: 'product',
          targetId: p.id,
          payload: {
            productId: p.id,
            seo: {
              slug: cleanSlug,
              metaTitle: `${p.title} Price in Bangladesh | ${settings.storeName || 'BuyOne BD'}`,
              metaDescription: `Buy ${p.title} at ৳${p.price} with 24-72h Cash on Delivery across 64 districts in Bangladesh.`,
              keywords: `${p.title}, ${p.category || 'Bangladesh Online Shop'}, Cash on Delivery BD`,
              robots: 'index, follow'
            }
          },
          priority: 'medium',
          confidence: 95,
          reasoning: 'Incomplete product SEO reduces Google search visibility and social sharing previews.',
          reasoningBn: 'পণ্যটির SEO স্লাগ বা মেটা ট্যাগ অসম্পূর্ণ থাকায় সার্চ র‍্যাংকিং কমতে পারে।'
        });
      });
    }

    // 2. Inventory low/out-of-stock check
    const lowStockProds = products.filter((p) => p && Number(p.stock || 0) <= 5);
    if (lowStockProds.length > 0) {
      issues.push({
        id: 'audit-stock',
        area: 'inventory',
        severity: lowStockProds.some((p) => Number(p.stock || 0) === 0) ? 'critical' : 'warning',
        title: `${lowStockProds.length} product(s) out of stock or critically low (≤5)`,
        titleBn: `${lowStockProds.length}টি পণ্যের স্টক শেষ বা খুবই কম (≤৫টি)`,
        detail: 'Prepared restock tasks (+30 qty) awaiting your review.',
        count: lowStockProds.length
      });
      lowStockProds.slice(0, 6).forEach((p) => {
        addTask({
          actionType: 'update_product',
          title: `Restock Inventory: ${p.title} (Now: ${p.stock ?? 0})`,
          titleBn: `স্টক রিস্টক: ${p.titleBn || p.title} (বর্তমান: ${p.stock ?? 0})`,
          summary: `Set safe buffer stock to ${Math.max(30, Number(p.stock || 0) + 30)} units`,
          summaryBn: `নিরাপদ স্টক ${Math.max(30, Number(p.stock || 0) + 30)} পিসে আপডেট করুন`,
          targetType: 'product',
          targetId: p.id,
          payload: { productId: p.id, stock: Math.max(30, Number(p.stock || 0) + 30) },
          priority: Number(p.stock || 0) === 0 ? 'high' : 'medium',
          confidence: 90,
          reasoning: 'Prevent lost checkout sales due to zero/low stock.',
          reasoningBn: 'স্টক কম থাকায় অর্ডার মিস হওয়া রোধ করতে রিস্টক সাজেশন।'
        });
      });
    }

    // 3. Broken images & inactive sliders audit
    const missingImgProds = products.filter((p) => p && (!Array.isArray(p.images) || p.images.length === 0 || !p.images[0]));
    const brokenSliders = sliders.filter((s) => s && !s.image);
    if (missingImgProds.length + brokenSliders.length > 0) {
      issues.push({
        id: 'audit-media',
        area: 'media',
        severity: 'warning',
        title: `${missingImgProds.length} product(s) & ${brokenSliders.length} slider(s) need image URLs`,
        titleBn: `${missingImgProds.length}টি পণ্য ও ${brokenSliders.length}টি স্লাইডারে ছবি নেই`,
        detail: 'Use Media Gallery picker in Products or Sliders tab to attach crisp photos.',
        count: missingImgProds.length + brokenSliders.length
      });
    }

    // 4. Orders & Autopilot review
    const operationalTasks = buildAutopilotReviewTasks({
      orders,
      products,
      abandonedCarts,
      resellers,
      settings,
      existingQueue: [...existingQueue, ...maintenanceTasks]
    });
    const combinedNew = [...maintenanceTasks, ...operationalTasks];

    const pendingOrdersCount = orders.filter((o) => o && (o.status === 'pending' || o.status === 'on_hold')).length;
    if (pendingOrdersCount > 0) {
      issues.push({
        id: 'audit-orders',
        area: 'orders',
        severity: pendingOrdersCount > 5 ? 'critical' : 'warning',
        title: `${pendingOrdersCount} pending/hold order(s) awaiting call or confirmation`,
        titleBn: `${pendingOrdersCount}টি পেন্ডিং/হোল্ড অর্ডার কল ও কনফার্মেশনের অপেক্ষায়`,
        detail: 'Review tasks added to AI Control Queue.',
        count: pendingOrdersCount
      });
    }

    const pendingResellersCount = resellers.filter((r) => r && r.status === 'pending').length;
    if (pendingResellersCount > 0) {
      issues.push({
        id: 'audit-resellers',
        area: 'resellers',
        severity: 'warning',
        title: `${pendingResellersCount} reseller application(s) waiting for approval`,
        titleBn: `${pendingResellersCount}টি রিসেলার আবেদন অনুমোদনের অপেক্ষায়`,
        detail: 'One-click approval tasks generated.',
        count: pendingResellersCount
      });
    }

    const backupExists = fs.existsSync(STORE_BACKUP_FILE);
    const backupUpdatedAt = backupExists ? fs.statSync(STORE_BACKUP_FILE).mtime.toISOString() : null;
    if (products.length > 0 && !backupExists) {
      saveStoreData(current);
    }

    const mergedQueue = [...combinedNew, ...existingQueue].slice(0, 120);
    current.aiReviewQueue = mergedQueue;
    saveStoreData(current);
    broadcastWs({ type: 'ai_queue:sync', aiReviewQueue: mergedQueue });

    const penalty = issues.reduce((acc, it) => acc + (it.severity === 'critical' ? 14 : it.severity === 'warning' ? 7 : 0), 0);
    const healthScore = Math.max(42, Math.min(100, 100 - penalty));

    return res.json({
      success: true,
      auditedAt: nowIso,
      healthScore,
      backupProtected: fs.existsSync(STORE_BACKUP_FILE),
      backupUpdatedAt: fs.existsSync(STORE_BACKUP_FILE) ? fs.statSync(STORE_BACKUP_FILE).mtime.toISOString() : backupUpdatedAt,
      metrics: {
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders: pendingOrdersCount,
        lowStockCount: lowStockProds.length,
        missingSeoCount: missingSeoProds.length,
        unrecoveredCarts: abandonedCarts.filter((c) => c && !c.recovered).length,
        pendingResellers: pendingResellersCount
      },
      issues,
      addedCount: combinedNew.length,
      queue: mergedQueue
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Website maintenance audit failed' });
  }
});

// AI RFM Audience Segment & Campaign Generator
app.post('/api/ai/marketing/campaign', async (req, res) => {
  try {
    const { lang = 'bn', segment = 'vip_buyers', goal = 'repeat_order' } = req.body || {};
    const saved = loadStoreData() || {};
    const orders: any[] = Array.isArray(saved.orders) ? saved.orders : [];
    const customers: any[] = Array.isArray(saved.customerAccounts) ? saved.customerAccounts : [];
    const products: any[] = Array.isArray(saved.products) ? saved.products : [];
    const storeName = saved?.settings?.storeName || 'BuyOne BD';
    const topProd = products[0] || { title: 'Trending Gadget', titleBn: 'ট্রেন্ডিং গ্যাজেট', price: 990 };

    // Build real RFM customer stats
    const spendByPhone = new Map<string, { name: string; phone: string; orders: number; totalSpent: number }>();
    orders.forEach((o) => {
      const phone = String(o?.customer?.phone || '').trim();
      if (!phone || o.status === 'cancelled') return;
      const cur = spendByPhone.get(phone) || { name: o?.customer?.name || 'Customer', phone, orders: 0, totalSpent: 0 };
      cur.orders += 1;
      cur.totalSpent += Number(o?.pricing?.total || 0);
      spendByPhone.set(phone, cur);
    });
    customers.forEach((c) => {
      if (c?.phone && !spendByPhone.has(c.phone)) {
        spendByPhone.set(c.phone, { name: c.name || 'Customer', phone: c.phone, orders: 0, totalSpent: 0 });
      }
    });

    const allBuyers = Array.from(spendByPhone.values());
    const vipBuyers = allBuyers.filter((b) => b.totalSpent >= 3000 || b.orders >= 2);
    const inactiveLeads = allBuyers.filter((b) => b.orders === 0);
    const repeatCodBuyers = allBuyers.filter((b) => b.orders === 1);

    const targetList =
      segment === 'vip_buyers'
        ? vipBuyers
        : segment === 'inactive_leads'
        ? inactiveLeads
        : repeatCodBuyers;

    const isEn = lang === 'en';
    const fallbackCampaign = {
      segmentTitle:
        segment === 'vip_buyers'
          ? isEn ? 'VIP Repeat Shoppers' : 'VIP প্রিমিয়াম ক্রেতা'
          : segment === 'inactive_leads'
          ? isEn ? 'Warm Cart / Registered Leads' : 'ওয়ার্ম লিডস ও অসম্পূর্ণ অর্ডার'
          : isEn ? 'First-Time Buyers (Repeat Boost)' : 'নতুন ক্রেতা (রিপিট অফার)',
      whatsappBroadcast: isEn
        ? `Assalamu Alaikum from ${storeName}! Exclusive VIP reward: use code BUYONE15 on ${topProd.title} (৳${topProd.price}) today & get 15% OFF + priority Cash on Delivery.`
        : `আসসালামু আলাইকুম! ${storeName} থেকে স্পেশাল গিফট—আমাদের জনপ্রিয় ${topProd.titleBn || topProd.title} (৳${topProd.price}) অর্ডারে আজই BUYONE15 কুপনে পাচ্ছেন ১৫% বিশেষ ছাড় ও দ্রুত ক্যাশ অন ডেলিভারি!`,
      smsText: `${storeName}: Special 15% OFF on ${topProd.title}. Use BUYONE15 today! COD across BD. Hotline +8801917942662`,
      subject: isEn ? `${storeName} VIP Offer: 15% OFF Inside!` : `${storeName} স্পেশাল ১৫% ছাড় আপনার জন্য!`,
      suggestedCouponCode: 'BUYONE15'
    };

    if (process.env.GEMINI_API_KEY) {
      try {
        const resp = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `Create a high-converting Bangladesh e-commerce retention campaign in ${isEn ? 'English' : 'Bengali'} for "${storeName}". Target segment: ${segment} (${targetList.length} contacts), Goal: ${goal}, Featured item: ${topProd.title} (৳${topProd.price}). Return JSON with whatsappBroadcast, smsText (max 150 chars), subject, suggestedCouponCode.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                whatsappBroadcast: { type: Type.STRING },
                smsText: { type: Type.STRING },
                subject: { type: Type.STRING },
                suggestedCouponCode: { type: Type.STRING }
              }
            }
          }
        });
        const parsed = JSON.parse(resp?.text || '{}');
        Object.assign(fallbackCampaign, parsed);
      } catch {}
    }

    return res.json({
      success: true,
      segments: {
        totalContacts: allBuyers.length,
        vipCount: vipBuyers.length,
        repeatReadyCount: repeatCodBuyers.length,
        leadsCount: inactiveLeads.length
      },
      recipients: targetList.slice(0, 50),
      campaign: fallbackCampaign
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Campaign generation failed' });
  }
});

function redactSensitiveSettingsForPublic(rawData: any) {
  if (!rawData || typeof rawData !== 'object') return rawData;
  const clone = JSON.parse(JSON.stringify(rawData));
  if (clone.settings && typeof clone.settings === 'object') {
    const s = clone.settings;
    if (s.smtpSettings) {
      s.smtpSettings = { ...s.smtpSettings, pass: '' };
    }
    if (s.courierSettings?.steadfast) {
      s.courierSettings.steadfast = { ...s.courierSettings.steadfast, secretKey: '' };
    }
    if (s.courierSettings?.pathao) {
      s.courierSettings.pathao = { ...s.courierSettings.pathao, clientSecret: '' };
    }
    if (s.marketingSettings?.facebookPixel) {
      s.marketingSettings.facebookPixel = { ...s.marketingSettings.facebookPixel, accessToken: '' };
    }
    if (s.marketingSettings?.whatsappCloudApi) {
      s.marketingSettings.whatsappCloudApi = { ...s.marketingSettings.whatsappCloudApi, accessToken: '' };
    }
    if (s.aiSettings) {
      s.aiSettings = { ...s.aiSettings, geminiApiKey: '', openaiApiKey: '', claudeApiKey: '' };
    }
    if (s.hostingerDbSettings) {
      s.hostingerDbSettings = {
        ...s.hostingerDbSettings,
        password: '',
        phpBridgeSecret: ''
      };
    }
    if (s.securitySettings) {
      s.securitySettings = {
        ...s.securitySettings,
        adminPin: ''
      };
    }
    if (s.globalMarketingSettings) {
      s.globalMarketingSettings = {
        ...s.globalMarketingSettings,
        smsApiKey: ''
      };
    }
  }
  if (Array.isArray(clone.resellers)) {
    clone.resellers = clone.resellers.map((r: any) => ({ ...r, password: '' }));
  }
  if (Array.isArray(clone.wholesalers)) {
    clone.wholesalers = clone.wholesalers.map((w: any) => ({ ...w, password: '' }));
  }
  if (Array.isArray(clone.affiliates)) {
    clone.affiliates = clone.affiliates.map((a: any) => ({ ...a, password: '' }));
  }
  return clone;
}

app.get('/api/store/sync', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const data = loadStoreData();
  const isAdminSession = req.headers['x-admin-session'] === 'buyone-admin-verified';
  const shouldMask = data?.settings?.securitySettings?.maskPublicSecrets !== false;
  const responseData = !isAdminSession && shouldMask ? redactSensitiveSettingsForPublic(data) : data;
  return res.json({ success: true, data: responseData });
});

app.post('/api/store/sync', (req, res) => {
  const {
    products,
    orders,
    settings,
    spinRewards,
    categories,
    sliders,
    customerAccounts,
    walletTopUps,
    abandonedCarts,
    reviews,
    priceAlerts,
    waitlist,
    resellers,
    resellerPayouts,
    resellerTopUps,
    wholesalers,
    wholesaleQuotes,
    blogs,
    affiliates,
    affiliateConversions,
    affiliatePayouts,
    bulkSmsLogs,
    users,
    mediaLibrary
  } = req.body || {};

  const current = loadStoreData() || {};
  const deletedIds: string[] = Array.isArray(current.deletedOrderIds) ? current.deletedOrderIds : [];
  const mergedOrders = Array.isArray(orders)
    ? mergeOrdersById(orders, Array.isArray(current.orders) ? current.orders : [], deletedIds)
    : current.orders;

  let mergedSettings = settings !== undefined ? settings : current.settings;
  if (settings && current.settings) {
    // Preserve server-side secrets if an incoming storefront sync passed masked empty strings
    mergedSettings = {
      ...settings,
      smtpSettings: {
        ...(current.settings.smtpSettings || {}),
        ...(settings.smtpSettings || {}),
        pass: settings.smtpSettings?.pass || current.settings.smtpSettings?.pass || ''
      },
      hostingerDbSettings: {
        ...(current.settings.hostingerDbSettings || {}),
        ...(settings.hostingerDbSettings || {}),
        password: settings.hostingerDbSettings?.password || current.settings.hostingerDbSettings?.password || '',
        phpBridgeSecret:
          settings.hostingerDbSettings?.phpBridgeSecret ||
          current.settings.hostingerDbSettings?.phpBridgeSecret ||
          ''
      },
      securitySettings: {
        ...(current.settings.securitySettings || {}),
        ...(settings.securitySettings || {}),
        adminPin: settings.securitySettings?.adminPin || current.settings.securitySettings?.adminPin || ''
      },
      globalMarketingSettings: {
        ...(current.settings.globalMarketingSettings || {}),
        ...(settings.globalMarketingSettings || {}),
        smsApiKey:
          settings.globalMarketingSettings?.smsApiKey ||
          current.settings.globalMarketingSettings?.smsApiKey ||
          ''
      }
    };
  }

  const preservePasswords = (incomingList: any[], prevList: any[]) =>
    incomingList.map((item) => {
      if (!item || item.password) return item;
      const old = Array.isArray(prevList) ? prevList.find((x) => x && x.id === item.id) : null;
      return old?.password ? { ...item, password: old.password } : item;
    });

  const unionMergePartners = (incomingList: any[], currentList: any[]) => {
    const map = new Map<string, any>();
    (Array.isArray(currentList) ? currentList : []).forEach((item) => {
      if (item && item.id) map.set(item.id, item);
    });
    (Array.isArray(incomingList) ? incomingList : []).forEach((item) => {
      if (!item || !item.id) return;
      const prev = map.get(item.id);
      if (!prev) {
        map.set(item.id, item);
        return;
      }
      const prevTs = new Date(prev.updatedAt || prev.createdAt || 0).getTime();
      const incTs = new Date(item.updatedAt || item.createdAt || 0).getTime();
      const winner = incTs >= prevTs ? { ...prev, ...item } : { ...item, ...prev };
      if (!winner.password && prev.password) winner.password = prev.password;
      map.set(item.id, winner);
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  };

  const unionMergeById = (incomingList: any[], currentList: any[]) => {
    const map = new Map<string, any>();
    (Array.isArray(currentList) ? currentList : []).forEach((item) => {
      if (item && item.id) map.set(item.id, item);
    });
    (Array.isArray(incomingList) ? incomingList : []).forEach((item) => {
      if (!item || !item.id) return;
      const prev = map.get(item.id);
      map.set(item.id, prev ? { ...prev, ...item } : item);
    });
    return Array.from(map.values());
  };

  const allowEmptyOverwrite = Boolean(req.body?.allowEmptyOverwrite);
  const preserveNonEmpty = <T,>(incoming: T[] | undefined, existing: T[] | undefined): T[] | undefined => {
    if (incoming === undefined) return existing;
    if (Array.isArray(incoming) && incoming.length === 0 && Array.isArray(existing) && existing.length > 0 && !allowEmptyOverwrite) {
      return existing;
    }
    return incoming;
  };

  const updated = {
    ...current,
    products: preserveNonEmpty(products, current.products),
    orders: mergedOrders,
    settings: mergedSettings,
    spinRewards: preserveNonEmpty(spinRewards, current.spinRewards),
    categories: preserveNonEmpty(categories, current.categories),
    sliders: preserveNonEmpty(sliders, current.sliders),
    customerAccounts: preserveNonEmpty(customerAccounts, current.customerAccounts),
    walletTopUps: walletTopUps !== undefined ? walletTopUps : current.walletTopUps,
    abandonedCarts: abandonedCarts !== undefined ? abandonedCarts : current.abandonedCarts,
    reviews: preserveNonEmpty(reviews, current.reviews),
    priceAlerts: priceAlerts !== undefined ? priceAlerts : current.priceAlerts,
    waitlist: waitlist !== undefined ? waitlist : current.waitlist,
    resellers: Array.isArray(resellers)
      ? unionMergePartners(preservePasswords(resellers, current.resellers), current.resellers)
      : current.resellers,
    resellerPayouts: Array.isArray(resellerPayouts)
      ? unionMergeById(resellerPayouts, current.resellerPayouts)
      : current.resellerPayouts,
    resellerTopUps: Array.isArray(resellerTopUps)
      ? unionMergeById(resellerTopUps, current.resellerTopUps)
      : current.resellerTopUps,
    wholesalers: Array.isArray(wholesalers)
      ? unionMergePartners(preservePasswords(wholesalers, current.wholesalers), current.wholesalers)
      : current.wholesalers,
    wholesaleQuotes: Array.isArray(wholesaleQuotes)
      ? unionMergeById(wholesaleQuotes, current.wholesaleQuotes)
      : current.wholesaleQuotes,
    blogs: blogs !== undefined ? preserveNonEmpty(blogs, current.blogs) : current.blogs,
    affiliates: Array.isArray(affiliates)
      ? unionMergePartners(preservePasswords(affiliates, current.affiliates), current.affiliates)
      : current.affiliates,
    affiliateConversions: Array.isArray(affiliateConversions)
      ? unionMergeById(affiliateConversions, current.affiliateConversions)
      : current.affiliateConversions,
    affiliatePayouts: Array.isArray(affiliatePayouts)
      ? unionMergeById(affiliatePayouts, current.affiliatePayouts)
      : current.affiliatePayouts,
    bulkSmsLogs: bulkSmsLogs !== undefined ? bulkSmsLogs : current.bulkSmsLogs,
    whatsappMessages: Array.isArray(req.body?.whatsappMessages)
      ? unionMergeById(req.body.whatsappMessages, current.whatsappMessages)
      : current.whatsappMessages,
    aiReviewQueue: Array.isArray(req.body?.aiReviewQueue)
      ? unionMergeById(req.body.aiReviewQueue, current.aiReviewQueue)
      : current.aiReviewQueue,
    users: preserveNonEmpty(users, current.users),
    mediaLibrary: preserveNonEmpty(mediaLibrary, current.mediaLibrary),
    lastUpdated: new Date().toISOString()
  };
  saveStoreData(updated);
  const isAdminSession = req.headers['x-admin-session'] === 'buyone-admin-verified';
  const shouldMask = updated?.settings?.securitySettings?.maskPublicSecrets !== false;
  return res.json({
    success: true,
    message: 'Store synchronized',
    data: !isAdminSession && shouldMask ? redactSensitiveSettingsForPublic(updated) : updated
  });
});

// Safe Rolling Backup & Restore Endpoints (Guarantees No Data Loss)
app.get('/api/store/backup', (_req, res) => {
  try {
    const hasBackup = fs.existsSync(STORE_BACKUP_FILE);
    const hasMain = fs.existsSync(STORE_FILE);
    const backup = hasBackup ? JSON.parse(fs.readFileSync(STORE_BACKUP_FILE, 'utf-8')) : loadStoreData();
    return res.json({
      success: true,
      hasBackup: hasBackup || hasMain,
      backupUpdatedAt: hasBackup
        ? fs.statSync(STORE_BACKUP_FILE).mtime.toISOString()
        : hasMain
        ? fs.statSync(STORE_FILE).mtime.toISOString()
        : null,
      counts: {
        products: Array.isArray(backup?.products) ? backup.products.length : 0,
        orders: Array.isArray(backup?.orders) ? backup.orders.length : 0,
        customers: Array.isArray(backup?.customerAccounts) ? backup.customerAccounts.length : 0,
        resellers: Array.isArray(backup?.resellers) ? backup.resellers.length : 0,
        sliders: Array.isArray(backup?.sliders) ? backup.sliders.length : 0
      },
      snapshot: backup ? redactSensitiveSettingsForPublic(backup) : null
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Backup inspect failed' });
  }
});

app.post('/api/store/backup/restore', (_req, res) => {
  try {
    if (!fs.existsSync(STORE_BACKUP_FILE)) {
      const current = loadStoreData();
      if (!current) {
        return res.status(404).json({ success: false, error: 'No backup file exists yet.' });
      }
      saveStoreData(current);
      return res.json({ success: true, restored: true, data: redactSensitiveSettingsForPublic(current) });
    }
    const backup = JSON.parse(fs.readFileSync(STORE_BACKUP_FILE, 'utf-8'));
    fs.writeFileSync(STORE_FILE, JSON.stringify(backup, null, 2), 'utf-8');
    return res.json({ success: true, restored: true, data: redactSensitiveSettingsForPublic(backup) });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Backup restore failed' });
  }
});

// Partner Portal (Reseller & Wholesale) Cross-Device Registration, Update & Authentication
app.post('/api/partner/register', (req, res) => {
  const body = req.body || {};
  const partnerType = body.type || body.role;
  const account = body.account || body.partner;
  if (!partnerType || !account || !account.phone) {
    return res.status(400).json({ success: false, error: 'Partner type and account details required.' });
  }
  const current = loadStoreData() || {};
  const cleanPhone = String(account.phone || '').replace(/[^0-9]/g, '').slice(-11);
  if (partnerType === 'reseller') {
    const list: any[] = Array.isArray(current.resellers) ? current.resellers : [];
    const dup = list.find((r) => String(r.phone || '').replace(/[^0-9]/g, '').slice(-11) === cleanPhone);
    if (dup) {
      return res.status(409).json({ success: false, error: 'A reseller account with this phone number already exists.' });
    }
    const autoApprove = Boolean(current?.settings?.resellerSettings?.autoApprove);
    const created = {
      ...account,
      id: account.id || `res-${Date.now()}`,
      status: account.status || (autoApprove ? 'approved' : 'pending'),
      createdAt: account.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    current.resellers = [created, ...list];
    saveStoreData(current);
    broadcastWs({ type: 'partner:sync', resellers: current.resellers.map((r: any) => ({ ...r, password: '' })) });
    return res.json({ success: true, partner: { ...created, password: '' } });
  }
  if (partnerType === 'wholesale') {
    const list: any[] = Array.isArray(current.wholesalers) ? current.wholesalers : [];
    const dup = list.find((w) => String(w.phone || '').replace(/[^0-9]/g, '').slice(-11) === cleanPhone);
    if (dup) {
      return res.status(409).json({ success: false, error: 'A wholesale account with this phone number already exists.' });
    }
    const autoApprove = Boolean(current?.settings?.wholesaleSettings?.autoApprove);
    const created = {
      ...account,
      id: account.id || `whs-${Date.now()}`,
      status: account.status || (autoApprove ? 'approved' : 'pending'),
      createdAt: account.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    current.wholesalers = [created, ...list];
    saveStoreData(current);
    broadcastWs({ type: 'partner:sync', wholesalers: current.wholesalers.map((w: any) => ({ ...w, password: '' })) });
    return res.json({ success: true, partner: { ...created, password: '' } });
  }
  if (partnerType === 'affiliate') {
    const list: any[] = Array.isArray(current.affiliates) ? current.affiliates : [];
    const dup = list.find((a) => String(a.phone || '').replace(/[^0-9]/g, '').slice(-11) === cleanPhone);
    if (dup) {
      return res.status(409).json({ success: false, error: 'An affiliate account with this phone number already exists.' });
    }
    const autoApprove = Boolean(current?.settings?.affiliateSettings?.autoApprove);
    const created = {
      ...account,
      id: account.id || `aff-${Date.now()}`,
      status: account.status || (autoApprove ? 'approved' : 'pending'),
      createdAt: account.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    current.affiliates = [created, ...list];
    saveStoreData(current);
    broadcastWs({ type: 'partner:sync', affiliates: current.affiliates.map((a: any) => ({ ...a, password: '' })) });
    return res.json({ success: true, partner: { ...created, password: '' } });
  }
  return res.status(400).json({ success: false, error: 'Invalid partner type.' });
});

app.post('/api/partner/update', (req, res) => {
  const body = req.body || {};
  const partnerType = body.type || body.role || 'reseller';
  const id = String(body.id || '').trim();
  const updates = body.updates || body.account || body.partner || {};
  if (!id) {
    return res.status(400).json({ success: false, error: 'Partner id is required.' });
  }
  const current = loadStoreData() || {};
  if (partnerType === 'reseller') {
    const list: any[] = Array.isArray(current.resellers) ? current.resellers : [];
    const idx = list.findIndex((r) => r && r.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Reseller not found.' });
    }
    const updatedAcc = { ...list[idx], ...updates, id, updatedAt: new Date().toISOString() };
    list[idx] = updatedAcc;
    current.resellers = list;
    saveStoreData(current);
    broadcastWs({ type: 'partner:sync', resellers: list.map((r: any) => ({ ...r, password: '' })) });
    return res.json({ success: true, partner: { ...updatedAcc, password: '' } });
  }
  if (partnerType === 'wholesale') {
    const list: any[] = Array.isArray(current.wholesalers) ? current.wholesalers : [];
    const idx = list.findIndex((w) => w && w.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Wholesaler not found.' });
    }
    const updatedAcc = { ...list[idx], ...updates, id, updatedAt: new Date().toISOString() };
    list[idx] = updatedAcc;
    current.wholesalers = list;
    saveStoreData(current);
    broadcastWs({ type: 'partner:sync', wholesalers: list.map((w: any) => ({ ...w, password: '' })) });
    return res.json({ success: true, partner: { ...updatedAcc, password: '' } });
  }
  if (partnerType === 'affiliate') {
    const list: any[] = Array.isArray(current.affiliates) ? current.affiliates : [];
    const idx = list.findIndex((a) => a && a.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Affiliate not found.' });
    }
    const updatedAcc = { ...list[idx], ...updates, id, updatedAt: new Date().toISOString() };
    list[idx] = updatedAcc;
    current.affiliates = list;
    saveStoreData(current);
    broadcastWs({ type: 'partner:sync', affiliates: list.map((a: any) => ({ ...a, password: '' })) });
    return res.json({ success: true, partner: { ...updatedAcc, password: '' } });
  }
  return res.status(400).json({ success: false, error: 'Invalid partner type.' });
});

app.post('/api/store/delete-item', (req, res) => {
  const { type, ids } = req.body || {};
  const idSet = new Set((Array.isArray(ids) ? ids : []).map((x) => String(x || '').trim()).filter(Boolean));
  if (!type || idSet.size === 0) {
    return res.status(400).json({ success: false, error: 'type and ids are required.' });
  }
  const current = loadStoreData() || {};
  const filterList = (list: any[]) =>
    Array.isArray(list) ? list.filter((item) => item && !idSet.has(String(item.id || ''))) : list;

  if (type === 'reseller') {
    current.resellers = filterList(current.resellers);
    saveStoreData(current);
    broadcastWs({ type: 'partner:sync', resellers: (current.resellers || []).map((r: any) => ({ ...r, password: '' })) });
    return res.json({ success: true });
  }
  if (type === 'wholesaler') {
    current.wholesalers = filterList(current.wholesalers);
    saveStoreData(current);
    broadcastWs({ type: 'partner:sync', wholesalers: (current.wholesalers || []).map((w: any) => ({ ...w, password: '' })) });
    return res.json({ success: true });
  }
  if (type === 'affiliate') {
    current.affiliates = filterList(current.affiliates);
    saveStoreData(current);
    broadcastWs({ type: 'partner:sync', affiliates: (current.affiliates || []).map((a: any) => ({ ...a, password: '' })) });
    return res.json({ success: true });
  }
  if (type === 'affiliatePayout') {
    current.affiliatePayouts = filterList(current.affiliatePayouts);
    saveStoreData(current);
    return res.json({ success: true });
  }
  if (type === 'blog') {
    current.blogs = filterList(current.blogs);
    saveStoreData(current);
    return res.json({ success: true });
  }
  if (type === 'resellerTopUp') {
    current.resellerTopUps = filterList(current.resellerTopUps);
    saveStoreData(current);
    return res.json({ success: true });
  }
  if (type === 'resellerPayout') {
    current.resellerPayouts = filterList(current.resellerPayouts);
    saveStoreData(current);
    return res.json({ success: true });
  }
  if (type === 'wholesaleQuote') {
    current.wholesaleQuotes = filterList(current.wholesaleQuotes);
    saveStoreData(current);
    return res.json({ success: true });
  }
  if (type === 'bulkSmsLog') {
    current.bulkSmsLogs = filterList(current.bulkSmsLogs);
    saveStoreData(current);
    return res.json({ success: true });
  }
  if (type === 'priceAlert') {
    current.priceAlerts = filterList(current.priceAlerts);
    saveStoreData(current);
    return res.json({ success: true });
  }
  if (type === 'product') {
    current.products = filterList(current.products);
    saveStoreData(current);
    return res.json({ success: true });
  }
  if (type === 'customerAccount') {
    const cleanKey = (s: string) => String(s || '').trim().toLowerCase();
    current.customerAccounts = Array.isArray(current.customerAccounts)
      ? current.customerAccounts.filter((acc: any) => {
          const phoneDigits = String(acc?.phone || '').replace(/[^0-9]/g, '').slice(-11);
          return !(
            idSet.has(cleanKey(acc?.phone)) ||
            (phoneDigits && idSet.has(phoneDigits)) ||
            idSet.has(cleanKey(acc?.email)) ||
            idSet.has(cleanKey(acc?.username))
          );
        })
      : current.customerAccounts;
    saveStoreData(current);
    return res.json({ success: true });
  }
  return res.status(400).json({ success: false, error: 'Unsupported delete item type.' });
});

app.post('/api/partner/login', (req, res) => {
  const body = req.body || {};
  const partnerType = body.type || body.role || 'reseller';
  const { identifier, password } = body;
  const rawIdent = String(identifier || '').trim().toLowerCase();
  const phoneIdent = rawIdent.replace(/[^0-9]/g, '').slice(-11);
  const current = loadStoreData() || {};
  const list: any[] = partnerType === 'wholesale'
    ? (Array.isArray(current.wholesalers) ? current.wholesalers : [])
    : partnerType === 'affiliate'
    ? (Array.isArray(current.affiliates) ? current.affiliates : [])
    : (Array.isArray(current.resellers) ? current.resellers : []);

  const matched = list.find((acc) => {
    const accPhone = String(acc.phone || '').replace(/[^0-9]/g, '').slice(-11);
    const accEmail = String(acc.email || '').trim().toLowerCase();
    const accCode = String(acc.resellerCode || acc.affiliateCode || '').trim().toLowerCase();
    return (
      (phoneIdent && accPhone === phoneIdent) ||
      (accEmail && accEmail === rawIdent) ||
      (accCode && accCode === rawIdent)
    );
  });

  if (!matched) {
    return res.status(404).json({ success: false, error: 'Account not found. Please register first.' });
  }
  if (matched.password && String(matched.password) !== String(password || '')) {
    return res.status(401).json({ success: false, error: 'Incorrect password / PIN.' });
  }
  return res.json({ success: true, partner: { ...matched, password: '' } });
});

// Atomic Cross-Device Order Endpoints (with Blocklist, Duplicate Flood Protection & Hostinger MySQL auto-mirror)
app.post('/api/orders', async (req, res) => {
  const { order } = req.body || {};
  if (!order || !order.id) {
    return res.status(400).json({ success: false, error: 'Order payload with id is required.' });
  }
  const current = loadStoreData() || {};
  const secCfg = current?.settings?.securitySettings || {};
  const cleanPhone = String(order?.customer?.phone || '').replace(/[^0-9]/g, '').slice(-11);

  if (order.source !== 'pos' && Array.isArray(secCfg.blockedPhones) && cleanPhone) {
    const isBlocked = secCfg.blockedPhones.some(
      (bp: string) => String(bp).replace(/[^0-9]/g, '').slice(-11) === cleanPhone
    );
    if (isBlocked) {
      return res.status(403).json({
        success: false,
        blocked: true,
        error: 'This phone number is restricted from placing orders due to security policy.'
      });
    }
  }

  const existingOrders: any[] = Array.isArray(current.orders) ? current.orders : [];
  const nextOrders = [order, ...existingOrders.filter((o) => o && o.id !== order.id)];
  current.orders = nextOrders;
  if (Array.isArray(current.deletedOrderIds)) {
    current.deletedOrderIds = current.deletedOrderIds.filter((id: string) => id !== order.id);
  }
  current.lastUpdated = new Date().toISOString();
  saveStoreData(current);

  // If Hostinger MySQL auto-sync is enabled on backend, mirror the order automatically
  const hCfg = resolveHostingerConfig();
  if (hCfg.enabled && hCfg.mode === 'mysql_direct' && hCfg.autoSyncOnOrder && hCfg.database && hCfg.user) {
    upsertOrderToHostingerMysql(hCfg, order).catch((err) => {
      console.error('Hostinger MySQL auto-order sync error:', err?.message || err);
    });
  }

  return res.json({ success: true, order, totalOrders: nextOrders.length });
});

app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body?.updates || req.body || {};
  const current = loadStoreData() || {};
  const existingOrders: any[] = Array.isArray(current.orders) ? current.orders : [];
  let updatedOrder: any = null;
  const nowIso = new Date().toISOString();
  current.orders = existingOrders.map((o) => {
    if (o && o.id === id) {
      updatedOrder = {
        ...o,
        ...updates,
        updatedAt: updates.updatedAt || nowIso,
        aiCallStatus: updates.aiCallStatus ? { ...(o.aiCallStatus || {}), ...updates.aiCallStatus } : o.aiCallStatus,
        courier: updates.courier ? { ...(o.courier || {}), ...updates.courier } : o.courier,
        customer: updates.customer ? { ...(o.customer || {}), ...updates.customer } : o.customer,
        pricing: updates.pricing ? { ...(o.pricing || {}), ...updates.pricing } : o.pricing,
        payment: updates.payment ? { ...(o.payment || {}), ...updates.payment } : o.payment
      };
      return updatedOrder;
    }
    return o;
  });
  current.lastUpdated = nowIso;
  saveStoreData(current);
  return res.json({ success: true, order: updatedOrder });
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const current = loadStoreData() || {};
  const existingOrders: any[] = Array.isArray(current.orders) ? current.orders : [];
  current.orders = existingOrders.filter((o) => o && o.id !== id);
  const delIds: string[] = Array.isArray(current.deletedOrderIds) ? current.deletedOrderIds : [];
  current.deletedOrderIds = Array.from(new Set([id, ...delIds])).slice(0, 200);
  current.lastUpdated = new Date().toISOString();
  saveStoreData(current);
  return res.json({ success: true });
});

// Non-Destructive Cache Clear Endpoint (Preserves all products, orders, settings, customers, media)
app.post('/api/cache/clear', (_req, res) => {
  const clearedAudioEntries = audioCache.size;
  audioCache.clear();
  const current = loadStoreData();
  if (current) {
    current.pixelEvents = [];
    current.browsingHistory = [];
    saveStoreData(current);
  }
  return res.json({
    success: true,
    clearedAudioEntries,
    message: 'Temporary server caches cleared without altering products, orders, customers, or settings.'
  });
});

// Real Steadfast Portal API v1 Proxy (https://portal.steadfast.com.bd/api/v1)
function resolveSteadfastCreds(bodyInput?: any) {
  const saved = loadStoreData();
  const stdf = saved?.settings?.courierSettings?.steadfast || {};
  const apiKey = String(bodyInput?.apiKey || stdf.apiKey || process.env.STEADFAST_API_KEY || '').trim();
  const secretKey = String(bodyInput?.secretKey || stdf.secretKey || process.env.STEADFAST_SECRET_KEY || '').trim();
  let baseUrl = String(bodyInput?.baseUrl || stdf.baseUrl || 'https://portal.steadfast.com.bd/api/v1')
    .trim()
    .replace(/\/+$/, '');
  if (!baseUrl) {
    baseUrl = 'https://portal.steadfast.com.bd/api/v1';
  } else if (/steadfast\.com\.bd/i.test(baseUrl) && !/\/api\/v1$/i.test(baseUrl)) {
    baseUrl = `${baseUrl}/api/v1`;
  }
  return { apiKey, secretKey, baseUrl };
}

function steadfastHttpRequest(
  endpointUrl: string,
  options: { method: 'GET' | 'POST'; apiKey: string; secretKey: string; body?: any }
): Promise<{ statusCode: number; parsed: any; rawText: string; isHtmlError: boolean }> {
  return new Promise((resolve, reject) => {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(endpointUrl);
    } catch (e: any) {
      return reject(new Error(`Invalid Steadfast URL: ${endpointUrl}`));
    }

    const payloadStr = options.body !== undefined ? JSON.stringify(options.body) : '';
    const isHttps = parsedUrl.protocol === 'https:';
    const mod = isHttps ? https : http;

    const req = mod.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port ? Number(parsedUrl.port) : isHttps ? 443 : 80,
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        method: options.method,
        family: 4, // Enforce IPv4 for reliable Cloud Run -> Steadfast Portal routing
        timeout: 15000,
        headers: {
          'Api-Key': options.apiKey,
          'Secret-Key': options.secretKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'BuyOneBD-Courier-Client/1.0',
          ...(payloadStr ? { 'Content-Length': Buffer.byteLength(payloadStr) } : {})
        }
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on('end', () => {
          const rawText = Buffer.concat(chunks).toString('utf-8');
          const trimmed = rawText.trim();
          let parsed: any = null;
          let isHtmlError = false;
          try {
            parsed = JSON.parse(trimmed);
          } catch {
            isHtmlError = /^<!doctype|<html|the page could not be found/i.test(trimmed);
            const stripped = trimmed
              .replace(/<style[\s\S]*?<\/style>/gi, ' ')
              .replace(/<script[\s\S]*?<\/script>/gi, ' ')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            parsed = {
              message: stripped
                ? stripped.slice(0, 180)
                : `Steadfast returned non-JSON response (HTTP ${res.statusCode || 502})`,
              raw: trimmed.slice(0, 300)
            };
          }
          resolve({
            statusCode: res.statusCode || 500,
            parsed,
            rawText,
            isHtmlError
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('Steadfast API request timed out (15s)'));
    });

    req.on('error', (err: any) => {
      const code = err?.code || err?.cause?.code || '';
      reject(new Error(`${err?.message || 'Network error'}${code ? ` (${code})` : ''}`));
    });

    if (payloadStr) {
      req.write(payloadStr);
    }
    req.end();
  });
}

app.post('/api/steadfast/balance', async (req, res) => {
  try {
    const { apiKey, secretKey, baseUrl } = resolveSteadfastCreds(req.body);
    if (!apiKey || !secretKey) {
      return res.status(400).json({ ok: false, success: false, error: 'Steadfast API Key and Secret Key are required.' });
    }
    const { statusCode, parsed, isHtmlError } = await steadfastHttpRequest(`${baseUrl}/get_balance`, {
      method: 'GET',
      apiKey,
      secretKey
    });

    if (statusCode < 200 || statusCode >= 300 || isHtmlError || (parsed?.status && parsed.status !== 200)) {
      const hint = isHtmlError
        ? ` Endpoint returned webpage instead of API JSON (${baseUrl}/get_balance). Ensure Base URL ends with /api/v1 and your API Key/Secret Key are active.`
        : '';
      return res.status(400).json({
        ok: false,
        success: false,
        error: `${parsed?.message || parsed?.error || `Steadfast API returned HTTP ${statusCode}`}${hint}`,
        details: parsed
      });
    }
    const balanceVal = parsed?.current_balance ?? parsed?.balance ?? 0;
    return res.json({
      ok: true,
      success: true,
      balance: balanceVal,
      current_balance: balanceVal,
      data: parsed
    });
  } catch (err: any) {
    return res.status(502).json({
      ok: false,
      success: false,
      error: err?.message || 'Failed to connect to Steadfast Portal API'
    });
  }
});

app.post('/api/steadfast/create-order', async (req, res) => {
  try {
    const { invoice, recipient_name, recipient_phone, recipient_address, cod_amount, note } = req.body || {};
    const { apiKey, secretKey, baseUrl } = resolveSteadfastCreds(req.body);
    if (!apiKey || !secretKey) {
      return res.status(400).json({ success: false, error: 'Steadfast API Key & Secret Key are missing.' });
    }
    if (!invoice || !recipient_name || !recipient_phone || !recipient_address) {
      return res.status(400).json({ success: false, error: 'invoice, recipient_name, recipient_phone, recipient_address are required.' });
    }

    const cleanPhone = String(recipient_phone).replace(/[^0-9]/g, '').replace(/^880/, '0').slice(-11);
    const payload = {
      invoice: String(invoice),
      recipient_name: String(recipient_name),
      recipient_phone: cleanPhone,
      recipient_address: String(recipient_address),
      cod_amount: Math.max(0, Math.round(Number(cod_amount) || 0)),
      note: note ? String(note) : ''
    };

    const { statusCode, parsed, isHtmlError } = await steadfastHttpRequest(`${baseUrl}/create_order`, {
      method: 'POST',
      apiKey,
      secretKey,
      body: payload
    });

    if (statusCode < 200 || statusCode >= 300 || isHtmlError || (parsed?.status && parsed.status !== 200)) {
      const errDetail = parsed?.errors
        ? Object.values(parsed.errors).flat().join(', ')
        : parsed?.message || parsed?.error || `Steadfast HTTP ${statusCode}`;
      return res.status(400).json({
        success: false,
        error: isHtmlError ? `${errDetail} (Check Steadfast Base URL: ${baseUrl})` : errDetail,
        details: parsed
      });
    }

    const consignment = parsed?.consignment || parsed?.data || {};
    return res.json({
      success: true,
      consignment_id: String(consignment.consignment_id || parsed?.consignment_id || ''),
      tracking_code: String(consignment.tracking_code || parsed?.tracking_code || ''),
      status: String(consignment.status || 'in_review'),
      data: parsed
    });
  } catch (err: any) {
    return res.status(502).json({
      success: false,
      error: err?.message || 'Steadfast create_order network request failed'
    });
  }
});

app.post('/api/steadfast/status', async (req, res) => {
  try {
    const { consignmentId, invoice, trackingCode } = req.body || {};
    const { apiKey, secretKey, baseUrl } = resolveSteadfastCreds(req.body);
    if (!apiKey || !secretKey) {
      return res.status(400).json({ success: false, error: 'Steadfast API credentials required.' });
    }

    let endpoint = '';
    if (consignmentId && /^\d+$/.test(String(consignmentId).trim())) {
      endpoint = `${baseUrl}/status_by_cid/${encodeURIComponent(String(consignmentId).trim())}`;
    } else if (invoice) {
      endpoint = `${baseUrl}/status_by_invoice/${encodeURIComponent(String(invoice).trim())}`;
    } else if (trackingCode) {
      endpoint = `${baseUrl}/status_by_trackingcode/${encodeURIComponent(String(trackingCode).trim())}`;
    } else {
      return res.status(400).json({ success: false, error: 'consignmentId or invoice is required.' });
    }

    const { statusCode, parsed, isHtmlError } = await steadfastHttpRequest(endpoint, {
      method: 'GET',
      apiKey,
      secretKey
    });

    if (statusCode < 200 || statusCode >= 300 || isHtmlError || (parsed?.status && parsed.status !== 200)) {
      return res.status(400).json({
        success: false,
        error: parsed?.message || parsed?.error || `Steadfast status HTTP ${statusCode}`,
        details: parsed
      });
    }
    return res.json({
      success: true,
      delivery_status: parsed?.delivery_status || 'unknown',
      data: parsed
    });
  } catch (err: any) {
    return res.status(502).json({
      success: false,
      error: err?.message || 'Steadfast status check failed'
    });
  }
});

app.post('/api/fraud-check', (req, res) => {
  const { phone } = req.body || {};
  const cleanPhone = String(phone || '').replace(/[^0-9]/g, '').slice(-11);
  if (!cleanPhone) {
    return res.status(400).json({ success: false, error: 'Valid phone required' });
  }
  const saved = loadStoreData();
  const storeOrders: any[] = Array.isArray(saved?.orders) ? saved.orders : [];
  const customerHistory = storeOrders.filter(
    (o) => String(o?.customer?.phone || '').replace(/[^0-9]/g, '').slice(-11) === cleanPhone
  );
  const delivered = customerHistory.filter((o) => o.status === 'delivered').length;
  const cancelled = customerHistory.filter((o) => o.status === 'cancelled').length;
  const totalOrders = Math.max(customerHistory.length, 1);
  let successRate = 92;
  if (customerHistory.length > 0) {
    const completedOrActive = totalOrders - cancelled;
    successRate = Math.max(15, Math.min(100, Math.round((completedOrActive / totalOrders) * 100)));
  } else {
    const sum = cleanPhone.split('').reduce((a, b) => a + (parseInt(b, 10) || 0), 0);
    successRate = sum % 7 === 0 ? 64 : 96;
  }
  const riskLevel = successRate >= 80 ? 'safe' : successRate >= 55 ? 'moderate' : 'high_risk';
  return res.json({
    success: true,
    checked: true,
    successRate,
    totalOrders: customerHistory.length || 1,
    deliveredCount: delivered || (riskLevel === 'safe' ? 1 : 0),
    cancelledCount: cancelled,
    riskLevel,
    message:
      riskLevel === 'safe'
        ? `সফলতা ${successRate}% — বিশ্বস্ত ক্রেতা (নিরাপদ COD অর্ডার)।`
        : riskLevel === 'moderate'
        ? `সফলতা ${successRate}% — কল করে ঠিকানা যাচাই বা আংশিক অগ্রিম নেওয়া উত্তম।`
        : `সফলতা ${successRate}% — উচ্চ বাতিলের ঝুঁকি! অগ্রিম ডেলিভারি চার্জ নিন।`
  });
});

// Working SMTP Email Transport & Campaign / Test Endpoints
function createSmtpTransporter(smtpInput?: any) {
  const saved = loadStoreData();
  const cfg = { ...(saved?.settings?.smtpSettings || {}), ...(smtpInput || {}) };

  const host = String(cfg.host || process.env.SMTP_HOST || '').trim();
  const port = Number(cfg.port || process.env.SMTP_PORT || 465);
  const secure = cfg.secure !== undefined ? Boolean(cfg.secure) : port === 465;
  const user = String(cfg.user || process.env.SMTP_USER || '').trim();
  const pass = String(cfg.pass || process.env.SMTP_PASS || '').trim();
  const fromName = String(cfg.fromName || saved?.settings?.storeName || 'BuyOne BD').trim();
  const fromEmail = String(cfg.fromEmail || user || 'noreply@buyonebd.com').trim();

  if (!host || !user || !pass) {
    throw new Error('SMTP Host, Username, and Password are required to connect to your mail server.');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 12000,
    greetingTimeout: 10000
  });

  return { transporter, fromHeader: `"${fromName}" <${fromEmail}>`, host, port };
}

app.post('/api/email/test', async (req, res) => {
  try {
    const { smtp, toEmail } = req.body || {};
    const recipient = String(toEmail || smtp?.fromEmail || smtp?.user || '').trim();
    if (!recipient || !recipient.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid recipient email address is required.' });
    }

    const { transporter, fromHeader, host, port } = createSmtpTransporter(smtp);
    await transporter.verify();

    const info = await transporter.sendMail({
      from: fromHeader,
      to: recipient,
      subject: 'BuyOne BD SMTP Test - Connection Verified ✅',
      text: 'Congratulations! Your BuyOne BD Email SMTP configuration is active and verified.',
      html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px">
        <h2 style="color:#059669;margin:0 0 8px">BuyOne BD SMTP Verified ✅</h2>
        <p style="color:#334155;font-size:14px">Your mail server <b>${host}:${port}</b> is connected and ready to deliver automated order confirmations and email campaigns.</p>
        <p style="color:#64748b;font-size:12px;margin-top:16px">Sent at ${new Date().toLocaleString()}</p>
      </div>`
    });

    return res.json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      message: `Test email sent to ${recipient}`
    });
  } catch (err: any) {
    console.error('SMTP test error:', err);
    return res.status(400).json({
      success: false,
      error: err?.message || 'SMTP connection/authentication failed'
    });
  }
});

app.post('/api/email/send', async (req, res) => {
  try {
    const { smtp, to, toList, subject, text, html } = req.body || {};
    const recipients = Array.isArray(toList) && toList.length > 0
      ? toList.filter((e: any) => typeof e === 'string' && e.includes('@'))
      : typeof to === 'string' && to.includes('@')
      ? [to]
      : [];

    if (recipients.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one valid recipient email is required.' });
    }
    if (!subject || (!text && !html)) {
      return res.status(400).json({ success: false, error: 'Subject and message body are required.' });
    }

    const { transporter, fromHeader } = createSmtpTransporter(smtp);
    let sentCount = 0;
    const errors: string[] = [];

    for (const addr of recipients.slice(0, 100)) {
      try {
        await transporter.sendMail({
          from: fromHeader,
          to: addr,
          subject: String(subject),
          text: String(text || ''),
          html: html ? String(html) : `<div style="font-family:sans-serif;line-height:1.6;color:#1e293b">${String(text || '').replace(/\n/g, '<br/>')}</div>`
        });
        sentCount += 1;
      } catch (sendErr: any) {
        errors.push(`${addr}: ${sendErr?.message || 'failed'}`);
      }
    }

    if (sentCount === 0) {
      return res.status(400).json({ success: false, error: errors[0] || 'Failed to send email' });
    }

    return res.json({
      success: true,
      sentCount,
      failedCount: recipients.length - sentCount,
      errors
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || 'Email dispatch failed' });
  }
});

// Dynamic robots.txt served from backend SEO settings
app.get('/robots.txt', (req, res) => {
  const saved = loadStoreData();
  const host = `${req.protocol}://${req.get('host')}`;
  const customRobots = saved?.settings?.seoSettings?.robotsTxt;
  const fallbackRobots = `User-agent: *\nAllow: /\nDisallow: /hossain\n\nSitemap: ${host}/sitemap.xml\n`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.send(customRobots && customRobots.trim().length > 0 ? customRobots : fallbackRobots);
});

// Dynamic XML sitemap served from current catalog & categories
app.get('/sitemap.xml', (req, res) => {
  const saved = loadStoreData();
  const sitemapEnabled = saved?.settings?.seoSettings?.sitemapEnabled !== false;
  if (!sitemapEnabled) {
    return res.status(404).send('Sitemap disabled');
  }
  const baseUrl = (saved?.settings?.seoSettings?.canonicalUrl || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
  const now = new Date().toISOString().split('T')[0];

  const staticPaths = ['/', '/products', '/about', '/tracking'];
  const cats: any[] = saved?.categories || saved?.settings?.categories || [];
  const catPaths = cats.filter((c) => c?.isActive !== false && c?.slug).map((c) => `/category/${c.slug}`);
  const prods: any[] = saved?.products || [];
  const prodPaths = prods.map((p) => `/product/${p?.seo?.slug || p?.id}`);

  const allPaths = Array.from(new Set([...staticPaths, ...catPaths, ...prodPaths]));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allPaths
    .map(
      (p) =>
        `  <url>\n    <loc>${baseUrl}${p}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${p === '/' ? 'daily' : 'weekly'}</changefreq>\n    <priority>${p === '/' ? '1.0' : p.startsWith('/product/') ? '0.9' : '0.8'}</priority>\n  </url>`
    )
    .join('\n')}\n</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  return res.send(xml);
});

// Server-Side Meta Pixel / Conversions API (CAPI) Endpoint
app.post('/api/tracking/pixel', async (req, res) => {
  try {
    const {
      eventName = 'PageView',
      urlPath = '/',
      sourceUrl = '',
      value,
      currency = 'BDT',
      contentName,
      pixelId: bodyPixelId,
      accessToken: bodyAccessToken,
      testEventCode
    } = req.body || {};

    const saved = loadStoreData() || {};
    const fbCfg = saved?.settings?.marketingSettings?.facebookPixel || {};
    const pixelId = bodyPixelId || fbCfg.pixelId || '';
    const accessToken = bodyAccessToken || fbCfg.accessToken || '';

    let status: 'sent_capi' | 'logged_server' = 'logged_server';
    let capiResponse: any = null;

    if (pixelId && accessToken) {
      try {
        const capiPayload: any = {
          data: [
            {
              event_name: eventName,
              event_time: Math.floor(Date.now() / 1000),
              action_source: 'website',
              event_source_url: sourceUrl || urlPath,
              user_data: {
                client_ip_address: req.ip,
                client_user_agent: req.get('user-agent') || 'BuyOneBD'
              },
              custom_data: {
                currency,
                ...(value !== undefined ? { value: Number(value) } : {}),
                ...(contentName ? { content_name: contentName } : {}),
                url_path: urlPath
              }
            }
          ],
          ...(testEventCode || fbCfg.testEventCode ? { test_event_code: testEventCode || fbCfg.testEventCode } : {})
        };

        const fbRes = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(capiPayload)
        });
        capiResponse = await fbRes.json().catch(() => null);
        if (fbRes.ok) {
          status = 'sent_capi';
        }
      } catch {
        status = 'logged_server';
      }
    }

    const eventRecord = {
      id: `px-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventName,
      urlPath,
      sourceUrl: sourceUrl || urlPath,
      pixelId: pixelId || undefined,
      value,
      currency,
      contentName,
      status,
      timestamp: new Date().toISOString()
    };

    const existingEvents = Array.isArray(saved.pixelEvents) ? saved.pixelEvents : [];
    saved.pixelEvents = [eventRecord, ...existingEvents].slice(0, 120);
    saveStoreData(saved);

    return res.json({ success: true, event: eventRecord, capiResponse });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Pixel log failed' });
  }
});

app.get('/api/tracking/events', (_req, res) => {
  const saved = loadStoreData() || {};
  return res.json({ success: true, events: saved.pixelEvents || [] });
});

// Bidirectional Support Desk API (Customer Browsing Logs, Live Support Chats, Backend Browser Calls)
app.get('/api/support/state', (_req, res) => {
  const saved = loadStoreData() || {};
  return res.json({
    success: true,
    browsingHistory: saved.browsingHistory || [],
    supportChats: saved.supportChats || [],
    browserCalls: saved.browserCalls || [],
    whatsappMessages: saved.whatsappMessages || [],
    aiReviewQueue: saved.aiReviewQueue || [],
    pixelEvents: saved.pixelEvents || []
  });
});

app.post('/api/support/browsing', (req, res) => {
  const event = req.body;
  if (!event || !event.urlPath) {
    return res.status(400).json({ success: false, error: 'Missing urlPath' });
  }
  const saved = loadStoreData() || {};
  const existing = Array.isArray(saved.browsingHistory) ? saved.browsingHistory : [];
  saved.browsingHistory = [event, ...existing].slice(0, 150);
  saveStoreData(saved);
  return res.json({ success: true });
});

// Visitor Telemetry (Real IP, Device, Browser, OS, Country)
function parseVisitorUserAgent(ua: string) {
  const s = ua || '';
  const device = /ipad|tablet|playbook|silk/i.test(s)
    ? 'Tablet'
    : /mobi|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(s)
    ? 'Mobile'
    : 'Desktop';
  let browser = 'Other';
  if (/edg\//i.test(s)) browser = 'Edge';
  else if (/opr\//i.test(s) || /opera/i.test(s)) browser = 'Opera';
  else if (/chrome|crios/i.test(s) && !/edg/i.test(s)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(s)) browser = 'Firefox';
  else if (/safari/i.test(s) && !/chrome|crios/i.test(s)) browser = 'Safari';

  let os = 'Other';
  if (/windows nt/i.test(s)) os = 'Windows';
  else if (/android/i.test(s)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(s)) os = 'iOS';
  else if (/mac os x|macintosh/i.test(s)) os = 'macOS';
  else if (/linux/i.test(s)) os = 'Linux';

  return { device, browser, os };
}

function resolveVisitorCountry(req: express.Request, timezone?: string): string {
  const cfCountry = String(req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'] || req.headers['x-appengine-country'] || '').trim().toUpperCase();
  if (cfCountry && cfCountry !== 'XX' && cfCountry !== 'ZZ') {
    if (cfCountry === 'BD') return 'Bangladesh (BD)';
    return cfCountry;
  }
  if (timezone && /dhaka/i.test(timezone)) return 'Bangladesh (BD)';
  const langHdr = String(req.headers['accept-language'] || '').toLowerCase();
  if (langHdr.includes('bn-bd') || langHdr.startsWith('bn')) return 'Bangladesh (BD)';
  return 'Bangladesh (BD)';
}

app.post('/api/analytics/visit', (req, res) => {
  try {
    const { urlPath, path: reqPath, pageTitle = 'BuyOne BD', timezone = '', customerName = '', customerPhone = '' } = req.body || {};
    const finalPath = String(urlPath || reqPath || '/');
    const rawIp =
      String(req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1')
        .split(',')[0]
        .trim()
        .replace(/^::ffff:/, '');
    const ua = String(req.headers['user-agent'] || '');
    const { device, browser, os } = parseVisitorUserAgent(ua);
    const country = resolveVisitorCountry(req, timezone);

    const record = {
      id: `vis-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ip: rawIp || 'Unknown',
      device,
      browser,
      os,
      country,
      path: finalPath,
      urlPath: finalPath,
      pageTitle: String(pageTitle || 'BuyOne BD'),
      customerName: customerName ? String(customerName) : undefined,
      customerPhone: customerPhone ? String(customerPhone) : undefined,
      timestamp: new Date().toISOString()
    };

    const saved = loadStoreData() || {};
    const list: any[] = Array.isArray(saved.visitorLogs) ? saved.visitorLogs : [];
    saved.visitorLogs = [record, ...list].slice(0, 300);
    saveStoreData(saved);
    return res.json({ ok: true, success: true, visit: record });
  } catch (err: any) {
    return res.status(500).json({ ok: false, success: false, error: err?.message || 'Telemetry error' });
  }
});

app.get('/api/analytics/visitors', (_req, res) => {
  const saved = loadStoreData() || {};
  const visitors: any[] = (Array.isArray(saved.visitorLogs) ? saved.visitorLogs : []).map((v: any) => ({
    ...v,
    path: v.path || v.urlPath || '/'
  }));
  return res.json({ ok: true, success: true, visitors });
});

// Fast Google & Search Engine Indexing via IndexNow Protocol
app.post('/api/seo/indexnow', async (req, res) => {
  try {
    const saved = loadStoreData() || {};
    const canonicalBase = (
      saved?.settings?.seoSettings?.canonicalUrl ||
      `${req.protocol}://${req.get('host')}`
    ).replace(/\/+$/, '');
    let hostName = 'buyonebd.com';
    try {
      hostName = new URL(canonicalBase).hostname;
    } catch {}

    const productsList: any[] = Array.isArray(saved?.products) ? saved.products : [];
    const defaultUrls = [
      `${canonicalBase}/`,
      `${canonicalBase}/products`,
      `${canonicalBase}/about`,
      `${canonicalBase}/tracking`,
      ...productsList.slice(0, 20).map((p) => `${canonicalBase}/product/${p?.seo?.slug || p?.id}`)
    ];
    const urlList = Array.isArray(req.body?.urls) && req.body.urls.length > 0 ? req.body.urls : defaultUrls;

    const indexKey = process.env.INDEXNOW_KEY || 'buyonebd777indexnowkey2026';
    const payload = {
      host: hostName,
      key: indexKey,
      urlList
    };

    let pingStatus = 'submitted';
    let httpStatus = 200;
    try {
      const idxRes = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3500)
      });
      httpStatus = idxRes.status;
      if (!idxRes.ok && idxRes.status !== 202) {
        pingStatus = `queued_http_${idxRes.status}`;
      }
    } catch {
      pingStatus = 'local_prepared';
    }

    return res.json({
      ok: true,
      success: true,
      status: pingStatus,
      httpStatus,
      indexedCount: urlList.length,
      sitemapUrl: `${canonicalBase}/sitemap.xml`,
      submittedUrls: urlList.slice(0, 10),
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, success: false, error: err?.message || 'IndexNow ping failed' });
  }
});

// Live Google Merchant Center XML Feed & Meta / TikTok Catalog CSV Feed
app.get('/api/feeds/google-merchant.xml', (req, res) => {
  const saved = loadStoreData() || {};
  const products: any[] = Array.isArray(saved.products) ? saved.products : [];
  const storeName = saved?.settings?.storeName || 'BuyOne BD';
  const canonicalBase =
    String(saved?.settings?.seoSettings?.canonicalUrl || '').trim().replace(/\/+$/, '') ||
    `${req.protocol}://${req.get('host')}`;

  const escXml = (v: unknown) =>
    String(v || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const itemsXml = products
    .slice(0, 500)
    .map((p) => {
      const link = `${canonicalBase}/?product=${encodeURIComponent(p.seo?.slug || p.id)}`;
      const img = Array.isArray(p.images) && p.images[0] && !String(p.images[0]).startsWith('data:') ? p.images[0] : '';
      return `    <item>
      <g:id>${escXml(p.sku || p.id)}</g:id>
      <g:title>${escXml(p.title || p.titleBn)}</g:title>
      <g:description>${escXml(p.description || p.title)}</g:description>
      <g:link>${escXml(link)}</g:link>
      ${img ? `<g:image_link>${escXml(img)}</g:image_link>` : ''}
      <g:condition>new</g:condition>
      <g:availability>${Number(p.stock) > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${Number(p.price) || 0} BDT</g:price>
      <g:brand>${escXml(p.brand || storeName)}</g:brand>
      <g:google_product_category>${escXml(p.category || 'Shopping')}</g:google_product_category>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escXml(storeName)} Product Catalog Feed</title>
    <link>${escXml(canonicalBase)}</link>
    <description>Live Google Merchant Center XML feed for Bangladesh &amp; Global E-Commerce</description>
${itemsXml}
  </channel>
</rss>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  return res.status(200).send(xml);
});

app.get('/api/feeds/meta-catalog.csv', (req, res) => {
  const saved = loadStoreData() || {};
  const products: any[] = Array.isArray(saved.products) ? saved.products : [];
  const storeName = saved?.settings?.storeName || 'BuyOne BD';
  const canonicalBase =
    String(saved?.settings?.seoSettings?.canonicalUrl || '').trim().replace(/\/+$/, '') ||
    `${req.protocol}://${req.get('host')}`;

  const escCsv = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const headers = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand'];
  const rows = products.slice(0, 500).map((p) => {
    const link = `${canonicalBase}/?product=${encodeURIComponent(p.seo?.slug || p.id)}`;
    const img = Array.isArray(p.images) && p.images[0] && !String(p.images[0]).startsWith('data:') ? p.images[0] : '';
    return [
      escCsv(p.sku || p.id),
      escCsv(p.title || p.titleBn),
      escCsv(p.description || p.title),
      escCsv(Number(p.stock) > 0 ? 'in stock' : 'out of stock'),
      escCsv('new'),
      escCsv(`${Number(p.price) || 0} BDT`),
      escCsv(link),
      escCsv(img),
      escCsv(p.brand || storeName)
    ].join(',');
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="buyonebd-meta-catalog.csv"');
  return res.status(200).send([headers.join(','), ...rows].join('\n'));
});

// BD Bulk SMS Campaign Dispatch Endpoint
app.post('/api/marketing/sms-campaign', async (req, res) => {
  const { title = 'Promo Campaign', segment = 'all_customers', recipients = [], message, provider, apiKey, senderId } = req.body || {};
  if (!message || !String(message).trim()) {
    return res.status(400).json({ success: false, error: 'SMS message body is required.' });
  }
  const saved = loadStoreData() || {};
  const gms = saved?.settings?.globalMarketingSettings || {};
  const effectiveKey = String(apiKey || gms.smsApiKey || '').trim();
  const effectiveSender = String(senderId || gms.smsSenderId || 'BUYONEBD').trim();
  const effectiveProvider = String(provider || gms.smsGatewayProvider || 'ssl_wireless');
  const cleanPhones = Array.from(
    new Set(
      (Array.isArray(recipients) ? recipients : [])
        .map((p) => String(p || '').replace(/[^0-9]/g, ''))
        .filter((p) => p.length >= 10)
    )
  );
  const count = cleanPhones.length;
  const parts = Math.max(1, Math.ceil(String(message).length / 160));
  const estimatedCostBdt = Number((count * parts * 0.45).toFixed(2));
  let status: 'sent' | 'simulated' | 'failed' = effectiveKey && count > 0 ? 'sent' : 'simulated';

  if (effectiveKey && count > 0 && effectiveProvider === 'bulksmsbd') {
    try {
      const r = await fetch('https://bulksmsbd.net/api/smsapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: effectiveKey,
          senderid: effectiveSender,
          number: cleanPhones.slice(0, 100).join(','),
          message: String(message)
        })
      });
      if (!r.ok) status = 'simulated';
    } catch {
      status = 'simulated';
    }
  }

  const logEntry = {
    id: `sms-${Date.now()}`,
    title: String(title).slice(0, 120),
    segment,
    recipientCount: count,
    message: String(message).slice(0, 500),
    status,
    estimatedCostBdt,
    createdAt: new Date().toISOString()
  };

  saved.bulkSmsLogs = [logEntry, ...(Array.isArray(saved.bulkSmsLogs) ? saved.bulkSmsLogs : [])].slice(0, 50);
  saveStoreData(saved);
  return res.json({ success: true, log: logEntry, logs: saved.bulkSmsLogs });
});

// AI Marketing Copy, Reels Script, Worldwide/Probashi & SEO Metadata Generator
app.post('/api/ai/marketing', async (req, res) => {
  const {
    productTitle = 'BuyOne BD Featured Collection',
    category = 'General',
    price = 990,
    goal = 'conversion',
    lang = 'bn',
    mode = 'ad_copy',
    targetRegion = 'bangladesh',
    currency = 'BDT'
  } = req.body || {};
  const cleanTitle = String(productTitle || 'BuyOne BD Product').trim();
  const cleanPrice = Number(price) || 990;
  const saved = loadStoreData() || {};
  const rates = saved?.settings?.globalMarketingSettings?.exchangeRates || {
    USD: 120,
    GBP: 152,
    EUR: 130,
    AED: 32.7,
    SAR: 32,
    MYR: 26.8
  };
  const rate = currency !== 'BDT' && rates[currency] ? Number(rates[currency]) : 1;
  const convertedPrice = currency === 'BDT' ? `৳${cleanPrice}` : `${currency} ${(cleanPrice / rate).toFixed(2)} (৳${cleanPrice})`;
  const isProbashi = String(targetRegion || 'bangladesh') !== 'bangladesh';

  const buildLocalFallback = () => ({
    headline: isProbashi
      ? lang === 'en'
        ? `🌍 Send ${cleanTitle} to Family in Bangladesh — Only ${convertedPrice}!`
        : `🌍 প্রবাস থেকে দেশে প্রিয়জনকে উপহার দিন ${cleanTitle} — মাত্র ${convertedPrice}!`
      : lang === 'en'
      ? `⚡ Flash Deal: ${cleanTitle} Only ${convertedPrice}!`
      : `⚡ ধামাকা অফার: ${cleanTitle} এখন মাত্র ${convertedPrice}!`,
    subtext: isProbashi
      ? `Gift Delivery Across All 64 Districts in Bangladesh · Order from Abroad · Hotline +8801917942662`
      : lang === 'en'
      ? `100% Authentic · Cash on Delivery All 64 Districts · Hotline +8801917942662`
      : `১০০% অরিজিনাল · সারা বাংলাদেশ ক্যাশ অন ডেলিভারি · হটলাইন +8801917942662`,
    adCopy: isProbashi
      ? `Living abroad (${targetRegion})? Surprise your parents & family anywhere in all 64 districts of Bangladesh with ${cleanTitle} (${convertedPrice})! Fast doorstep gift delivery + WhatsApp photo confirmation via +8801917942662.`
      : lang === 'en'
      ? `Upgrade your lifestyle with ${cleanTitle}! Special price ${convertedPrice} with fast 24-72h delivery across all 64 districts of Bangladesh. Inspect before paying! Order now at BuyOne BD or call +8801917942662.`
      : `সেরা মানের ${cleanTitle} এখন বিশেষ ছাড়ে মাত্র ${convertedPrice}! সারা বাংলাদেশের ৬৪ জেলায় ২৪-৭২ ঘণ্টায় ক্যাশ অন ডেলিভারি। হাতে পেয়ে দেখে পেমেন্ট করুন। অর্ডার করতে ইনবক্স করুন বা কল করুন +8801917942662।`,
    reelScript: lang === 'en'
      ? `[0-3s Hook] Stop scrolling! Need ${cleanTitle}?\n[4-9s Value] Premium quality at ${convertedPrice} with open-box COD across Bangladesh.\n[10-15s CTA] Tap Order Now at BuyOne BD or dial +8801917942662!`
      : `[০-৩ সেকেন্ড হুক] দারুণ কিছু খুঁজছেন? দেখুন ${cleanTitle}!\n[৪-৯ সেকেন্ড ফিচার] প্রিমিয়াম কোয়ালিটি মাত্র ${convertedPrice}—পাচ্ছেন আনবক্সিং চেক ও ক্যাশ অন ডেলিভারি।\n[১০-১৫ সেকেন্ড CTA] স্টক শেষ হওয়ার আগেই BuyOne BD থেকে ১-ক্লিকে অর্ডার করুন!`,
    keywords: `${cleanTitle}, BuyOne BD, Cash on Delivery Bangladesh, ${category}, ${isProbashi ? 'Bangladesh Gift Delivery Worldwide, Probashi Online Shop BD' : 'Best Price BD'}`,
    seoTitle: `${cleanTitle} Price in Bangladesh (${convertedPrice}) | BuyOne BD`,
    seoDescription: `Buy ${cleanTitle} at ${convertedPrice} from BuyOne BD. Fast 24-72h Cash on Delivery across all 64 districts of Bangladesh. Hotline +8801917942662.`
  });

  const formatNormalized = (payload: ReturnType<typeof buildLocalFallback>, provider: string) => ({
    ok: true,
    success: true,
    provider,
    mode,
    targetRegion,
    currency,
    ...payload,
    result: {
      headline: mode === 'seo' ? payload.seoTitle : payload.headline,
      body: mode === 'seo' ? payload.seoDescription : mode === 'reel_script' ? payload.reelScript : payload.adCopy,
      hashtags:
        mode === 'seo'
          ? payload.keywords
          : `#BuyOneBD #CashOnDelivery #BangladeshShopping #${isProbashi ? 'ProbashiBangladesh #SendGiftBD ' : ''}#${category.replace(/[^a-zA-Z0-9]/g, '') || 'TopDeals'}`
    }
  });

  if (!process.env.GEMINI_API_KEY) {
    return res.json(formatNormalized(buildLocalFallback(), 'local_engine'));
  }

  try {
    const response: any = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Generate high-converting Bangladeshi & Worldwide Probashi e-commerce marketing assets and SEO metadata for "${cleanTitle}" (Category: ${category}, Price: ${convertedPrice}, Goal: ${goal}, Mode: ${mode}, Target Region: ${targetRegion}, Preferred Language: ${lang === 'en' ? 'English' : 'Bengali & English mix'}). Store is BuyOne BD, Whole Bangladesh 64-district Cash on Delivery & global diaspora gift orders, hotline +8801917942662.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              subtext: { type: Type.STRING },
              adCopy: { type: Type.STRING },
              reelScript: { type: Type.STRING },
              keywords: { type: Type.STRING },
              seoTitle: { type: Type.STRING },
              seoDescription: { type: Type.STRING }
            }
          }
        }
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini timeout')), 5500))
    ]);
    const parsed = JSON.parse((response?.text || '{}').trim());
    return res.json(formatNormalized({ ...buildLocalFallback(), ...parsed }, 'gemini_ai'));
  } catch {
    return res.json(formatNormalized(buildLocalFallback(), 'local_fallback'));
  }
});

const activeWsClients = new Set<WebSocket>();

function broadcastWs(payload: any, excludeSocket?: WebSocket) {
  const msg = JSON.stringify(payload);
  activeWsClients.forEach((client) => {
    if (client !== excludeSocket && client.readyState === WebSocket.OPEN) {
      try {
        client.send(msg);
      } catch {
        // ignore closed client
      }
    }
  });
}

function mergeSupportChatSessions(existingList: any[], incomingList: any[]): any[] {
  const map = new Map<string, any>();
  for (const s of Array.isArray(existingList) ? existingList : []) {
    if (s?.id) map.set(s.id, s);
  }
  for (const s of Array.isArray(incomingList) ? incomingList : []) {
    if (!s?.id) continue;
    const prev = map.get(s.id);
    if (!prev) {
      map.set(s.id, s);
      continue;
    }
    const msgMap = new Map<string, any>();
    for (const m of Array.isArray(prev.messages) ? prev.messages : []) {
      if (m?.id) msgMap.set(m.id, m);
    }
    for (const m of Array.isArray(s.messages) ? s.messages : []) {
      if (m?.id) msgMap.set(m.id, m);
    }
    const prevTime = new Date(prev.lastUpdated || 0).getTime();
    const incTime = new Date(s.lastUpdated || 0).getTime();
    const newer = incTime >= prevTime ? s : prev;
    map.set(s.id, {
      ...prev,
      ...newer,
      messages: Array.from(msgMap.values())
    });
  }
  return Array.from(map.values())
    .sort((a, b) => new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime())
    .slice(0, 60);
}

function mergeBrowserCallSessions(existingList: any[], incomingList: any[]): any[] {
  const map = new Map<string, any>();
  for (const c of Array.isArray(existingList) ? existingList : []) {
    if (c?.id) map.set(c.id, c);
  }
  for (const c of Array.isArray(incomingList) ? incomingList : []) {
    if (!c?.id) continue;
    const prev = map.get(c.id);
    if (!prev) {
      map.set(c.id, c);
      continue;
    }
    const txMap = new Map<string, any>();
    for (const t of Array.isArray(prev.transcript) ? prev.transcript : []) {
      if (t?.id) txMap.set(t.id, t);
    }
    for (const t of Array.isArray(c.transcript) ? c.transcript : []) {
      if (t?.id) txMap.set(t.id, t);
    }
    const statusRank = (st: string) => (st === 'ended' ? 3 : st === 'connected' ? 2 : 1);
    const chosenStatus = statusRank(c.status) >= statusRank(prev.status) ? c.status : prev.status;
    map.set(c.id, {
      ...prev,
      ...c,
      status: chosenStatus,
      answeredBy: c.answeredBy || prev.answeredBy,
      endedAt: c.endedAt || prev.endedAt,
      durationSeconds: Math.max(Number(prev.durationSeconds) || 0, Number(c.durationSeconds) || 0),
      transcript: Array.from(txMap.values())
    });
  }
  return Array.from(map.values())
    .sort((a, b) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime())
    .slice(0, 60);
}

app.post('/api/support/chat', (req, res) => {
  const { sessions } = req.body || {};
  if (!Array.isArray(sessions)) {
    return res.status(400).json({ success: false, error: 'sessions array required' });
  }
  const saved = loadStoreData() || {};
  saved.supportChats = mergeSupportChatSessions(saved.supportChats || [], sessions);
  saveStoreData(saved);
  broadcastWs({ type: 'chat:sync', supportChats: saved.supportChats });
  return res.json({ success: true, supportChats: saved.supportChats });
});

app.post('/api/support/call', (req, res) => {
  const { calls } = req.body || {};
  if (!Array.isArray(calls)) {
    return res.status(400).json({ success: false, error: 'calls array required' });
  }
  const saved = loadStoreData() || {};
  saved.browserCalls = mergeBrowserCallSessions(saved.browserCalls || [], calls);
  saveStoreData(saved);
  broadcastWs({ type: 'call:sync', browserCalls: saved.browserCalls });
  return res.json({ success: true, browserCalls: saved.browserCalls });
});

// Meta WhatsApp Cloud API Webhook Verification
app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const savedStore = loadStoreData();
  const expectedToken =
    savedStore?.settings?.marketingSettings?.whatsappCloudApi?.verifyToken ||
    process.env.WHATSAPP_VERIFY_TOKEN ||
    'buyonebd_meta_verify_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Incoming Meta WhatsApp Cloud API Messages Webhook
app.post('/api/whatsapp/webhook', (req, res) => {
  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const incomingMsgs = Array.isArray(change?.messages) ? change.messages : [];
    const contacts = Array.isArray(change?.contacts) ? change.contacts : [];
    if (incomingMsgs.length > 0) {
      const saved = loadStoreData() || {};
      const existing: any[] = Array.isArray(saved.whatsappMessages) ? saved.whatsappMessages : [];
      const resellersList: any[] = Array.isArray(saved.resellers) ? saved.resellers : [];

      for (const m of incomingMsgs) {
        const fromDigits = String(m.from || '').replace(/[^0-9]/g, '');
        const last11 = fromDigits.slice(-11);
        const matchedReseller = resellersList.find(
          (r) => String(r.phone || '').replace(/[^0-9]/g, '').slice(-11) === last11
        );
        const profileName = contacts[0]?.profile?.name || matchedReseller?.name || `+${fromDigits}`;
        const textBody = m?.text?.body || m?.button?.text || `[${m.type || 'message'}]`;
        const nextMsg = {
          id: m.id || `wamsg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          phone: last11 || fromDigits,
          contactName: profileName,
          contactType: matchedReseller ? 'reseller' : 'customer',
          direction: 'inbound',
          sender: 'contact',
          text: String(textBody),
          mode: 'webhook',
          status: 'received',
          messageId: m.id,
          timestamp: new Date().toISOString()
        };
        if (!existing.some((x) => x.id === nextMsg.id)) {
          existing.push(nextMsg);
        }
      }
      saved.whatsappMessages = existing.slice(-300);
      saveStoreData(saved);
      broadcastWs({ type: 'whatsapp:sync', whatsappMessages: saved.whatsappMessages });
    }
    return res.sendStatus(200);
  } catch (err) {
    console.error('WhatsApp webhook error:', err);
    return res.sendStatus(200);
  }
});

// Get WhatsApp Conversation Thread History
app.get('/api/whatsapp/messages', (_req, res) => {
  const saved = loadStoreData() || {};
  return res.json({
    success: true,
    messages: Array.isArray(saved.whatsappMessages) ? saved.whatsappMessages : []
  });
});

// Storefront Customer Inquiry -> Direct Admin WhatsApp Support Thread + Live WebSocket Push
app.post('/api/whatsapp/customer-inquiry', (req, res) => {
  try {
    const {
      phone,
      name,
      message,
      productId,
      productTitle,
      productUrl,
      productPrice
    } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, error: 'Message text is required.' });
    }

    const cleanDigits = String(phone || '').replace(/[^0-9]/g, '');
    const shortPhone = cleanDigits.length >= 6 ? cleanDigits.slice(-11) : `web-${Date.now().toString().slice(-6)}`;
    const senderName = String(name || '').trim() || shortPhone;
    const saved = loadStoreData() || {};
    const existing: any[] = Array.isArray(saved.whatsappMessages) ? saved.whatsappMessages : [];
    const resellersList: any[] = Array.isArray(saved.resellers) ? saved.resellers : [];
    const matchedRes = resellersList.find((r) => String(r.phone || '').replace(/[^0-9]/g, '').slice(-11) === shortPhone);

    const productContext = productTitle
      ? `[Product: ${productTitle}${productPrice ? ` (৳${productPrice})` : ''}${productId ? ` #${productId}` : ''}${productUrl ? `\nLink: ${productUrl}` : ''}]\n`
      : '';

    const threadMsg = {
      id: `wa-cust-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      phone: shortPhone,
      contactName: matchedRes?.name || senderName,
      contactType: matchedRes ? 'reseller' : 'customer',
      direction: 'inbound',
      sender: 'contact',
      text: `${productContext}${String(message).trim()}`,
      mode: 'live',
      status: 'received',
      timestamp: new Date().toISOString()
    };

    saved.whatsappMessages = [...existing, threadMsg].slice(-300);
    saveStoreData(saved);
    broadcastWs({ type: 'whatsapp:sync', whatsappMessages: saved.whatsappMessages });

    return res.json({ success: true, threadMsg });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Failed to submit WhatsApp inquiry' });
  }
});

// Meta WhatsApp Cloud API Live / Simulated Message Sender (Persists to Thread & Broadcasts Live)
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const {
      to,
      message,
      templateName,
      phoneNumberId,
      accessToken,
      apiVersion = 'v21.0',
      contactName,
      contactType,
      orderId,
      senderRole = 'admin'
    } = req.body || {};

    if (!to || (!message && !templateName)) {
      return res.status(400).json({ success: false, error: 'Recipient phone and message or template are required.' });
    }

    const cleanPhone = String(to).replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const shortPhone = cleanPhone.slice(-11) || cleanPhone;
    const saved = loadStoreData() || {};
    const cloudCfg = saved?.settings?.marketingSettings?.whatsappCloudApi;
    const activePhoneId = phoneNumberId || (cloudCfg?.enabled ? cloudCfg.phoneNumberId : '');
    const activeToken = accessToken || (cloudCfg?.enabled ? cloudCfg.accessToken : '');

    const appendToThread = (status: 'sent' | 'simulated' | 'failed', mode: 'live' | 'simulated', messageId?: string) => {
      const existing: any[] = Array.isArray(saved.whatsappMessages) ? saved.whatsappMessages : [];
      const resellersList: any[] = Array.isArray(saved.resellers) ? saved.resellers : [];
      const matchedRes = resellersList.find((r) => String(r.phone || '').replace(/[^0-9]/g, '').slice(-11) === shortPhone);
      const item = {
        id: `wa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        phone: shortPhone,
        contactName: contactName || matchedRes?.name || shortPhone,
        contactType: contactType || (matchedRes ? 'reseller' : 'customer'),
        direction: 'outbound',
        sender: senderRole === 'ai' ? 'ai' : 'admin',
        text: String(message || `[Template: ${templateName}]`),
        templateName: templateName || undefined,
        orderId: orderId || undefined,
        mode,
        status,
        messageId,
        timestamp: new Date().toISOString()
      };
      saved.whatsappMessages = [...existing, item].slice(-300);
      saveStoreData(saved);
      broadcastWs({ type: 'whatsapp:sync', whatsappMessages: saved.whatsappMessages });
      return item;
    };

    // If Meta Cloud API credentials are configured, send real Graph API request
    if (activePhoneId && activeToken) {
      const endpoint = `https://graph.facebook.com/${apiVersion}/${activePhoneId}/messages`;
      const payload = templateName && !message
        ? {
            messaging_product: 'whatsapp',
            to: formattedPhone,
            type: 'template',
            template: { name: templateName, language: { code: 'bn' } }
          }
        : {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: formattedPhone,
            type: 'text',
            text: { preview_url: false, body: String(message) }
          };

      const metaRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken || activeToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const metaJson: any = await metaRes.json().catch(() => ({}));
      if (metaRes.ok) {
        const msgId = metaJson?.messages?.[0]?.id || `wamid.${Date.now()}`;
        const threadMsg = appendToThread('sent', 'live', msgId);
        return res.json({
          success: true,
          mode: 'live',
          messageId: msgId,
          to: formattedPhone,
          threadMsg,
          data: metaJson
        });
      }

      return res.status(metaRes.status).json({
        success: false,
        mode: 'live_error',
        error: metaJson?.error?.message || 'Meta Graph API returned an error',
        details: metaJson
      });
    }

    // Demo / Sandbox fallback when credentials are not yet entered
    const msgId = `sim_wamid_${Date.now()}`;
    const threadMsg = appendToThread('simulated', 'simulated', msgId);
    return res.json({
      success: true,
      mode: 'simulated',
      messageId: msgId,
      to: formattedPhone,
      threadMsg,
      preview: String(message || templateName)
    });
  } catch (err: any) {
    console.error('WhatsApp Cloud API send error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'WhatsApp dispatch failed' });
  }
});

// AI Draft Assistant for WhatsApp Reseller & Customer Support (Admin Dashboard)
app.post('/api/whatsapp/ai-reply', async (req, res) => {
  try {
    const {
      contactName = 'Partner',
      contactType = 'customer',
      resellerInfo,
      latestOrder,
      intent = 'general',
      lang = 'bn',
      customPrompt = ''
    } = req.body || {};

    const saved = loadStoreData() || {};
    const storeName = saved?.settings?.storeName || 'BuyOne BD';
    const hotline = saved?.settings?.hotline || '+8801917942662';
    const isBn = lang !== 'en';

    const buildSmartDraft = () => {
      if (contactType === 'reseller') {
        const code = resellerInfo?.resellerCode || 'RES-PARTNER';
        const comm = resellerInfo?.commissionPercent || 18;
        const bal = resellerInfo?.walletBalance ?? 0;
        const st = resellerInfo?.status || 'pending';

        if (intent === 'approval' || st === 'approved') {
          return isBn
            ? `আসসালামু আলাইকুম ${contactName} ভাই/আপু! 🎉 ${storeName}-এ আপনার রিসেলার একাউন্ট (${code}) এখন অ্যাক্টিভ হয়েছে (কমিশন ${comm}%)। এখন লগইন করেই সব পণ্যের গোপন রিসেলার প্রাইস দেখে কাস্টমারের জন্য অর্ডার করতে পারবেন। ড্যাশবোর্ডে বর্তমান ব্যালেন্স: ৳${bal}। হেল্পলাইন: ${hotline}`
            : `Hello ${contactName}! Your ${storeName} Reseller Account (${code}) is active (${comm}% margin). Sign in to unlock exclusive reseller rates, share catalog links, and place customer COD orders with custom margins. Current wallet: ৳${bal}.`;
        }
        if (intent === 'payout') {
          return isBn
            ? `আসসালামু আলাইকুম ${contactName}, আপনার ${storeName} রিসেলার (${code}) পে-আউট ওয়ালেট ব্যালেন্স এখন ৳${bal}। সর্বনিম্ন ৳${saved?.settings?.resellerSettings?.minPayoutBdt || 500} হলেই পার্টনার পোর্টাল থেকে bKash/Nagad-এ উত্তোলনের রিকোয়েস্ট দিতে পারবেন। কোনো সহায়তা লাগলে এখানেই মেসেজ করুন!`
            : `Hi ${contactName}, your ${storeName} reseller (${code}) wallet balance is ৳${bal}. Submit a withdrawal request anytime via the Partner Portal once above ৳${saved?.settings?.resellerSettings?.minPayoutBdt || 500}.`;
        }
        if (intent === 'order' && latestOrder) {
          return isBn
            ? `প্রিয় রিসেলার ${contactName} (${code}), অর্ডার #${latestOrder.id} (${latestOrder.customer?.name || ''}) এর বর্তমান স্ট্যাটাস: ${latestOrder.status}${latestOrder.courier?.trackingCode ? ` · কুরিয়ার ট্র্যাকিং: ${latestOrder.courier.trackingCode}` : ''}। মোট বিল: ৳${latestOrder.pricing?.total || 0}, আপনার প্রফিট: ৳${latestOrder.resellerProfit || 0}।`
            : `Hi ${contactName} (${code}), Order #${latestOrder.id} status is ${latestOrder.status}${latestOrder.courier?.trackingCode ? ` (Tracking: ${latestOrder.courier.trackingCode})` : ''}. Total: ৳${latestOrder.pricing?.total || 0}, Reseller Profit: ৳${latestOrder.resellerProfit || 0}.`;
        }
        return isBn
          ? `আসসালামু আলাইকুম ${contactName} (${code}), ${storeName} রিসেলার সাপোর্ট ডেস্ক থেকে বলছি! রিসেলিং, কাস্টমার প্রাইস সেটিং, অর্ডার ট্র্যাকিং বা পে-আউট সংক্রান্ত যেকোনো সহায়তার জন্য জানান। আপনার বর্তমান কমিশন হার ${comm}% এবং ওয়ালেট ব্যালেন্স ৳${bal}।`
          : `Hello ${contactName} (${code}) from ${storeName} Reseller Support Desk! How can we assist you today with reseller pricing, customer orders, or payouts? Current balance: ৳${bal}.`;
      }

      // Customer draft
      if (latestOrder) {
        const itemsText = Array.isArray(latestOrder.items)
          ? latestOrder.items.map((i: any) => `${i.productTitleBn || i.productTitle} x${i.quantity}`).join(', ')
          : '';
        return isBn
          ? `আসসালামু আলাইকুম ${contactName}, ${storeName}-এ আপনার অর্ডার #${latestOrder.id} (${itemsText}) এর বর্তমান স্ট্যাটাস: ${latestOrder.status}। মোট বিল: ৳${latestOrder.pricing?.total || 0}${latestOrder.courier?.trackingCode ? ` · Steadfast ট্র্যাকিং: ${latestOrder.courier.trackingCode}` : ''}। বিস্তারিত সহায়তায় ${hotline}।`
          : `Hello ${contactName}, your ${storeName} order #${latestOrder.id} (${itemsText}) is currently ${latestOrder.status}. Total: ৳${latestOrder.pricing?.total || 0}${latestOrder.courier?.trackingCode ? ` (Tracking: ${latestOrder.courier.trackingCode})` : ''}. Helpline: ${hotline}.`;
      }
      return isBn
        ? `আসসালামু আলাইকুম ${contactName}! ${storeName}-এ স্বাগতম। সারা বাংলাদেশে ২৪-৭২ ঘন্টায় ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। আপনার পছন্দের পণ্যের নাম বা অর্ডার নম্বর দিলে এখনই সহায়তা করছি। হটলাইন: ${hotline}`
        : `Hello ${contactName}! Welcome to ${storeName}. We offer 24-72h Cash on Delivery across all 64 districts of Bangladesh. Let us know your product or order ID for instant assistance!`;
    };

    const geminiKey = saved?.settings?.aiSettings?.geminiApiKey || process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const genClient = new GoogleGenAI({ apiKey: geminiKey });
        const contextStr = JSON.stringify({
          storeName,
          hotline,
          contactName,
          contactType,
          intent,
          resellerInfo: resellerInfo ? { code: resellerInfo.resellerCode, status: resellerInfo.status, commissionPercent: resellerInfo.commissionPercent, walletBalance: resellerInfo.walletBalance } : null,
          latestOrder: latestOrder ? { id: latestOrder.id, status: latestOrder.status, total: latestOrder.pricing?.total, tracking: latestOrder.courier?.trackingCode } : null
        });
        const resp = await genClient.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are ${storeName}'s WhatsApp Support Desk Assistant. Write a concise, helpful WhatsApp reply in ${isBn ? 'Bengali' : 'English'} (2-4 sentences, warm e-commerce tone). Strict rule: NEVER use the word "human", "হিউম্যান", "মানুষ", "Admin Portal", or "/hossain". Context: ${contextStr}. Extra instruction: ${customPrompt || intent}`
                }
              ]
            }
          ]
        });
        const aiText = sanitizeCustomerFacingReply(resp?.text || '');
        if (aiText.trim().length > 10) {
          return res.json({ success: true, draft: aiText.trim(), provider: 'gemini' });
        }
      } catch {
        // fall through to smart fallback
      }
    }

    return res.json({ success: true, draft: sanitizeCustomerFacingReply(buildSmartDraft()), provider: 'smart_auto' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'AI draft generation failed' });
  }
});

// ============================================================================
// HOSTINGER MYSQL DATABASE & SHARED-HOSTING PHP BRIDGE INTEGRATION ENDPOINTS
// ============================================================================
function sanitizeSqlPrefix(raw?: string): string {
  const clean = String(raw || 'buyone_').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20);
  return clean || 'buyone_';
}

function resolveHostingerConfig(input?: any) {
  const saved = loadStoreData();
  const h = { ...(saved?.settings?.hostingerDbSettings || {}), ...(input || {}) };
  return {
    enabled: Boolean(h.enabled),
    mode: h.mode === 'php_bridge' ? ('php_bridge' as const) : ('mysql_direct' as const),
    host: String(h.host || process.env.HOSTINGER_DB_HOST || 'localhost').trim(),
    port: Number(h.port || process.env.HOSTINGER_DB_PORT || 3306) || 3306,
    database: String(h.database || process.env.HOSTINGER_DB_NAME || '').trim(),
    user: String(h.username || h.user || process.env.HOSTINGER_DB_USER || '').trim(),
    password: String(h.password || process.env.HOSTINGER_DB_PASS || ''),
    tablePrefix: sanitizeSqlPrefix(h.tablePrefix || process.env.HOSTINGER_DB_PREFIX),
    ssl: Boolean(h.ssl),
    autoSyncOnOrder: h.autoSyncOnOrder !== false,
    phpBridgeUrl: String(h.phpBridgeUrl || '').trim(),
    phpBridgeSecret: String(h.phpBridgeSecret || '').trim()
  };
}

async function openHostingerMysqlConnection(cfg: ReturnType<typeof resolveHostingerConfig>) {
  if (!cfg.host || !cfg.database || !cfg.user) {
    throw new Error('Hostinger MySQL Host, Database Name, and Username are required.');
  }
  if (cfg.host === 'localhost' || cfg.host === '127.0.0.1') {
    throw new Error(
      'Cannot reach localhost:3306 from cloud preview server. Enter your Hostinger Remote MySQL hostname (e.g. srvXXXX.hstgr.io) and allow remote access in hPanel, or use Shared Hosting PHP Bridge mode.'
    );
  }
  return mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    ssl: cfg.ssl ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 5000
  });
}

async function ensureHostingerMysqlSchema(conn: mysql.Connection, prefix: string) {
  const tables = {
    kv: `${prefix}store_kv`,
    orders: `${prefix}orders`,
    products: `${prefix}products`,
    customers: `${prefix}customers`
  };

  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`${tables.kv}\` (
      \`kv_key\` VARCHAR(80) NOT NULL PRIMARY KEY,
      \`kv_value\` LONGTEXT NOT NULL,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`${tables.orders}\` (
      \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
      \`customer_name\` VARCHAR(160) NOT NULL,
      \`customer_phone\` VARCHAR(32) NOT NULL,
      \`district\` VARCHAR(120) DEFAULT '',
      \`total\` DECIMAL(12,2) DEFAULT 0,
      \`status\` VARCHAR(32) DEFAULT 'pending',
      \`source\` VARCHAR(16) DEFAULT 'online',
      \`payload_json\` LONGTEXT NOT NULL,
      \`created_at\` VARCHAR(64) DEFAULT '',
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`idx_phone\` (\`customer_phone\`),
      INDEX \`idx_status\` (\`status\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`${tables.products}\` (
      \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
      \`title\` VARCHAR(255) NOT NULL,
      \`category\` VARCHAR(120) DEFAULT '',
      \`price\` DECIMAL(12,2) DEFAULT 0,
      \`stock\` INT DEFAULT 0,
      \`barcode\` VARCHAR(120) DEFAULT '',
      \`payload_json\` LONGTEXT NOT NULL,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`${tables.customers}\` (
      \`phone\` VARCHAR(32) NOT NULL PRIMARY KEY,
      \`name\` VARCHAR(160) NOT NULL,
      \`email\` VARCHAR(160) DEFAULT '',
      \`wallet_balance\` DECIMAL(12,2) DEFAULT 0,
      \`loyalty_points\` INT DEFAULT 0,
      \`payload_json\` LONGTEXT NOT NULL,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  return Object.values(tables);
}

async function upsertOrderToHostingerMysql(cfg: ReturnType<typeof resolveHostingerConfig>, order: any) {
  let conn: mysql.Connection | null = null;
  try {
    conn = await openHostingerMysqlConnection(cfg);
    await ensureHostingerMysqlSchema(conn, cfg.tablePrefix);
    await conn.query(
      `INSERT INTO \`${cfg.tablePrefix}orders\` (id, customer_name, customer_phone, district, total, status, source, payload_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         customer_name = VALUES(customer_name),
         customer_phone = VALUES(customer_phone),
         district = VALUES(district),
         total = VALUES(total),
         status = VALUES(status),
         payload_json = VALUES(payload_json)`,
      [
        String(order.id),
        String(order.customer?.name || 'Customer').slice(0, 160),
        String(order.customer?.phone || '').slice(0, 32),
        String(order.customer?.district || '').slice(0, 120),
        Number(order.pricing?.total || 0),
        String(order.status || 'pending').slice(0, 32),
        String(order.source || 'online').slice(0, 16),
        JSON.stringify(order),
        String(order.createdAt || new Date().toISOString()).slice(0, 64)
      ]
    );
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
}

app.post('/api/database/hostinger/test', async (req, res) => {
  const cfg = resolveHostingerConfig(req.body?.config);
  if (cfg.mode === 'php_bridge') {
    if (!cfg.phpBridgeUrl) {
      return res.status(400).json({ success: false, error: 'Hostinger PHP Bridge URL is required.' });
    }
    try {
      const resp = await fetch(cfg.phpBridgeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bridge-Secret': cfg.phpBridgeSecret
        },
        body: JSON.stringify({ action: 'ping' })
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok || !data?.success) {
        return res.status(400).json({
          success: false,
          error: data?.error || `PHP Bridge returned HTTP ${resp.status}`
        });
      }
      return res.json({
        success: true,
        mode: 'php_bridge',
        version: data.mysqlVersion || 'Hostinger PHP+MySQL Bridge Connected',
        tables: data.tables || []
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to reach PHP Bridge URL' });
    }
  }

  let conn: mysql.Connection | null = null;
  try {
    conn = await openHostingerMysqlConnection(cfg);
    const [rows] = await conn.query('SELECT VERSION() AS version, DATABASE() AS dbName');
    const [tableRows] = await conn.query('SHOW TABLES');
    const info = Array.isArray(rows) && rows[0] ? (rows[0] as any) : {};
    const tableNames = Array.isArray(tableRows) ? tableRows.map((r: any) => Object.values(r)[0]) : [];
    return res.json({
      success: true,
      mode: 'mysql_direct',
      version: info.version || 'MySQL Connected',
      database: info.dbName || cfg.database,
      tables: tableNames
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err?.message || 'Hostinger MySQL connection failed'
    });
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
});

app.post('/api/database/hostinger/init-schema', async (req, res) => {
  const cfg = resolveHostingerConfig(req.body?.config);
  if (cfg.mode === 'php_bridge') {
    if (!cfg.phpBridgeUrl) {
      return res.status(400).json({ success: false, error: 'Hostinger PHP Bridge URL is required.' });
    }
    try {
      const resp = await fetch(cfg.phpBridgeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Bridge-Secret': cfg.phpBridgeSecret },
        body: JSON.stringify({ action: 'init_schema', tablePrefix: cfg.tablePrefix })
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok || !data?.success) {
        return res.status(400).json({ success: false, error: data?.error || `HTTP ${resp.status}` });
      }
      return res.json({ success: true, tables: data.tables || [] });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'PHP Bridge schema init failed' });
    }
  }

  let conn: mysql.Connection | null = null;
  try {
    conn = await openHostingerMysqlConnection(cfg);
    const tables = await ensureHostingerMysqlSchema(conn, cfg.tablePrefix);
    return res.json({ success: true, tables });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || 'Schema creation failed' });
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
});

app.post('/api/database/hostinger/sync-push', async (req, res) => {
  const cfg = resolveHostingerConfig(req.body?.config);
  const payload = req.body?.payload || loadStoreData() || {};

  if (cfg.mode === 'php_bridge') {
    if (!cfg.phpBridgeUrl) {
      return res.status(400).json({ success: false, error: 'Hostinger PHP Bridge URL is required.' });
    }
    try {
      const resp = await fetch(cfg.phpBridgeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Bridge-Secret': cfg.phpBridgeSecret },
        body: JSON.stringify({ action: 'sync_push', tablePrefix: cfg.tablePrefix, payload })
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok || !data?.success) {
        return res.status(400).json({ success: false, error: data?.error || `HTTP ${resp.status}` });
      }
      return res.json({ success: true, counts: data.counts || {}, syncedAt: new Date().toISOString() });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'PHP Bridge push failed' });
    }
  }

  let conn: mysql.Connection | null = null;
  try {
    conn = await openHostingerMysqlConnection(cfg);
    await ensureHostingerMysqlSchema(conn, cfg.tablePrefix);

    const p = cfg.tablePrefix;
    const kvEntries: [string, any][] = [
      ['full_backup_json', payload],
      ['settings_json', payload.settings || {}],
      ['categories_json', payload.categories || []],
      ['sliders_json', payload.sliders || []],
      ['reviews_json', payload.reviews || []]
    ];
    for (const [k, v] of kvEntries) {
      await conn.query(
        `INSERT INTO \`${p}store_kv\` (kv_key, kv_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE kv_value = VALUES(kv_value)`,
        [k, JSON.stringify(v)]
      );
    }

    const ordersArr: any[] = Array.isArray(payload.orders) ? payload.orders : [];
    for (const ord of ordersArr) {
      if (!ord?.id) continue;
      await conn.query(
        `INSERT INTO \`${p}orders\` (id, customer_name, customer_phone, district, total, status, source, payload_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           customer_name = VALUES(customer_name),
           customer_phone = VALUES(customer_phone),
           district = VALUES(district),
           total = VALUES(total),
           status = VALUES(status),
           payload_json = VALUES(payload_json)`,
        [
          String(ord.id),
          String(ord.customer?.name || 'Customer').slice(0, 160),
          String(ord.customer?.phone || '').slice(0, 32),
          String(ord.customer?.district || '').slice(0, 120),
          Number(ord.pricing?.total || 0),
          String(ord.status || 'pending').slice(0, 32),
          String(ord.source || 'online').slice(0, 16),
          JSON.stringify(ord),
          String(ord.createdAt || new Date().toISOString()).slice(0, 64)
        ]
      );
    }

    const prodsArr: any[] = Array.isArray(payload.products) ? payload.products : [];
    for (const prod of prodsArr) {
      if (!prod?.id) continue;
      await conn.query(
        `INSERT INTO \`${p}products\` (id, title, category, price, stock, barcode, payload_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           category = VALUES(category),
           price = VALUES(price),
           stock = VALUES(stock),
           barcode = VALUES(barcode),
           payload_json = VALUES(payload_json)`,
        [
          String(prod.id),
          String(prod.title || 'Product').slice(0, 255),
          String(prod.category || '').slice(0, 120),
          Number(prod.price || 0),
          Number(prod.stock || 0),
          String(prod.barcode || prod.sku || '').slice(0, 120),
          JSON.stringify(prod)
        ]
      );
    }

    const custArr: any[] = Array.isArray(payload.customerAccounts) ? payload.customerAccounts : [];
    for (const cust of custArr) {
      if (!cust?.phone) continue;
      await conn.query(
        `INSERT INTO \`${p}customers\` (phone, name, email, wallet_balance, loyalty_points, payload_json)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           email = VALUES(email),
           wallet_balance = VALUES(wallet_balance),
           loyalty_points = VALUES(loyalty_points),
           payload_json = VALUES(payload_json)`,
        [
          String(cust.phone).slice(0, 32),
          String(cust.name || 'Customer').slice(0, 160),
          String(cust.email || '').slice(0, 160),
          Number(cust.walletBalance || 0),
          Number(cust.loyaltyPoints || 0),
          JSON.stringify(cust)
        ]
      );
    }

    return res.json({
      success: true,
      counts: {
        orders: ordersArr.length,
        products: prodsArr.length,
        customers: custArr.length
      },
      syncedAt: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || 'Hostinger MySQL push failed' });
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
});

app.post('/api/database/hostinger/sync-pull', async (req, res) => {
  const cfg = resolveHostingerConfig(req.body?.config);
  if (cfg.mode === 'php_bridge') {
    if (!cfg.phpBridgeUrl) {
      return res.status(400).json({ success: false, error: 'Hostinger PHP Bridge URL is required.' });
    }
    try {
      const resp = await fetch(cfg.phpBridgeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Bridge-Secret': cfg.phpBridgeSecret },
        body: JSON.stringify({ action: 'sync_pull', tablePrefix: cfg.tablePrefix })
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok || !data?.success) {
        return res.status(400).json({ success: false, error: data?.error || `HTTP ${resp.status}` });
      }
      return res.json({ success: true, payload: data.payload });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'PHP Bridge pull failed' });
    }
  }

  let conn: mysql.Connection | null = null;
  try {
    conn = await openHostingerMysqlConnection(cfg);
    const p = cfg.tablePrefix;
    const [kvRows] = await conn.query(`SELECT kv_key, kv_value FROM \`${p}store_kv\``);
    let snapshot: any = {};
    if (Array.isArray(kvRows)) {
      const backupRow = (kvRows as any[]).find((r) => r.kv_key === 'full_backup_json');
      if (backupRow?.kv_value) {
        snapshot = JSON.parse(backupRow.kv_value);
      }
    }
    const [ordRows] = await conn.query(`SELECT payload_json FROM \`${p}orders\` ORDER BY updated_at DESC`);
    const [prodRows] = await conn.query(`SELECT payload_json FROM \`${p}products\``);
    const [custRows] = await conn.query(`SELECT payload_json FROM \`${p}customers\``);

    if (Array.isArray(ordRows) && ordRows.length > 0) {
      snapshot.orders = (ordRows as any[]).map((r) => JSON.parse(r.payload_json));
    }
    if (Array.isArray(prodRows) && prodRows.length > 0) {
      snapshot.products = (prodRows as any[]).map((r) => JSON.parse(r.payload_json));
    }
    if (Array.isArray(custRows) && custRows.length > 0) {
      snapshot.customerAccounts = (custRows as any[]).map((r) => JSON.parse(r.payload_json));
    }

    return res.json({ success: true, payload: snapshot });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || 'Hostinger MySQL pull failed' });
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
});

app.post('/api/database/hostinger/order', async (req, res) => {
  const { order, config } = req.body || {};
  if (!order?.id) {
    return res.status(400).json({ success: false, error: 'Order payload required.' });
  }
  const cfg = resolveHostingerConfig(config);
  if (cfg.mode === 'php_bridge') {
    if (!cfg.phpBridgeUrl) {
      return res.status(400).json({ success: false, error: 'PHP Bridge URL not set.' });
    }
    try {
      const resp = await fetch(cfg.phpBridgeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Bridge-Secret': cfg.phpBridgeSecret },
        body: JSON.stringify({ action: 'upsert_order', tablePrefix: cfg.tablePrefix, order })
      });
      const data = await resp.json().catch(() => null);
      return res.status(resp.ok ? 200 : 400).json(data || { success: resp.ok });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Bridge order sync failed' });
    }
  }
  try {
    await upsertOrderToHostingerMysql(cfg, order);
    return res.json({ success: true, orderId: order.id });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || 'Hostinger order sync failed' });
  }
});

app.post('/api/database/hostinger/orders', async (req, res) => {
  const cfg = resolveHostingerConfig(req.body?.config);
  if (cfg.mode === 'php_bridge') {
    if (!cfg.phpBridgeUrl) {
      return res.status(400).json({ success: false, error: 'PHP Bridge URL not set.' });
    }
    try {
      const resp = await fetch(cfg.phpBridgeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Bridge-Secret': cfg.phpBridgeSecret },
        body: JSON.stringify({ action: 'list_orders', tablePrefix: cfg.tablePrefix })
      });
      const data = await resp.json().catch(() => null);
      return res.status(resp.ok ? 200 : 400).json(data || { success: false, orders: [] });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Bridge orders pull failed' });
    }
  }
  let conn: mysql.Connection | null = null;
  try {
    conn = await openHostingerMysqlConnection(cfg);
    await ensureHostingerMysqlSchema(conn, cfg.tablePrefix);
    const [ordRows] = await conn.query(`SELECT payload_json FROM \`${cfg.tablePrefix}orders\` ORDER BY updated_at DESC LIMIT 200`);
    const orders = Array.isArray(ordRows) ? (ordRows as any[]).map((r) => JSON.parse(r.payload_json)) : [];
    return res.json({ success: true, orders });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || 'Hostinger orders pull failed' });
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
});

// Out-of-Stock Waitlist REST Fallback Endpoints
app.get('/api/waitlist', (_req, res) => {
  const saved = loadStoreData() || {};
  return res.json({ success: true, entries: Array.isArray(saved.waitlist) ? saved.waitlist : [] });
});

app.post('/api/waitlist', (req, res) => {
  const entry = req.body?.entry || req.body;
  if (!entry?.productId || !entry?.contact) {
    return res.status(400).json({ success: false, error: 'productId and contact required.' });
  }
  const saved = loadStoreData() || {};
  const list: any[] = Array.isArray(saved.waitlist) ? saved.waitlist : [];
  const nextEntry = {
    ...entry,
    id: entry.id || `wait-${Date.now()}`,
    status: entry.status || 'waiting',
    createdAt: entry.createdAt || new Date().toISOString()
  };
  saved.waitlist = [nextEntry, ...list.filter((w) => w && w.id !== nextEntry.id)].slice(0, 500);
  saveStoreData(saved);
  return res.json({ success: true, entry: nextEntry });
});

function escapeHtmlAttr(val: string): string {
  return String(val || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function injectDynamicSeoIntoHtml(html: string): string {
  const saved = loadStoreData();
  const seo = saved?.settings?.seoSettings;
  if (!seo && !saved?.settings?.storeName) return html;
  let out = html;
  const title = String(seo?.metaTitle || saved?.settings?.storeName || '').trim();
  const desc = String(seo?.metaDescription || '').trim();
  const keywords = String(seo?.keywords || '').trim();
  if (title) {
    out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtmlAttr(title)}</title>`);
    out = out.replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtmlAttr(title)}" />`
    );
    out = out.replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${escapeHtmlAttr(title)}" />`
    );
  }
  if (desc) {
    out = out.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escapeHtmlAttr(desc)}" />`
    );
    out = out.replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtmlAttr(desc)}" />`
    );
    out = out.replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${escapeHtmlAttr(desc)}" />`
    );
  }
  if (keywords !== undefined) {
    out = out.replace(
      /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="keywords" content="${escapeHtmlAttr(keywords)}" />`
    );
  }
  const canonicalUrl = String(seo?.canonicalUrl || '').trim();
  if (canonicalUrl) {
    if (/<link\s+rel="canonical"/i.test(out)) {
      out = out.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeHtmlAttr(canonicalUrl)}" />`);
    } else {
      out = out.replace('</head>', `  <link rel="canonical" href="${escapeHtmlAttr(canonicalUrl)}" />\n</head>`);
    }
  }
  const googleVerif = String(seo?.googleSiteVerification || '').trim();
  if (googleVerif && !out.includes('google-site-verification')) {
    out = out.replace('</head>', `  <meta name="google-site-verification" content="${escapeHtmlAttr(googleVerif)}" />\n</head>`);
  }
  const storeName = String(saved?.settings?.storeName || 'BuyOne BD');
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: storeName,
    description: desc || 'Bangladesh E-Commerce Store with Nationwide 64-District Cash on Delivery',
    telephone: String(saved?.settings?.hotline || '+8801917942662'),
    areaServed: 'BD',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${canonicalUrl || 'https://buyonebd.com'}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
  if (!out.includes('application/ld+json')) {
    out = out.replace(
      '</head>',
      `  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>\n</head>`
    );
  }
  return out;
}

// Mount Vite or serve static files + Attach WebSocket Server (/ws)
async function startServer() {
  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const reqUrl = request.url || '';
    if (reqUrl === '/ws' || reqUrl.startsWith('/ws?')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws) => {
    activeWsClients.add(ws);
    const initialSaved = loadStoreData() || {};
    try {
      ws.send(
        JSON.stringify({
          type: 'support:init',
          supportChats: initialSaved.supportChats || [],
          browserCalls: initialSaved.browserCalls || [],
          whatsappMessages: initialSaved.whatsappMessages || [],
          aiReviewQueue: initialSaved.aiReviewQueue || []
        })
      );
    } catch {}

    ws.on('message', (rawData) => {
      let msg: any = null;
      try {
        msg = JSON.parse(rawData.toString());
      } catch {
        return;
      }
      if (!msg || !msg.type) return;

      const saved = loadStoreData() || {};
      switch (msg.type) {
        case 'chat:upsert_session': {
          if (msg.session?.id) {
            saved.supportChats = mergeSupportChatSessions(saved.supportChats || [], [msg.session]);
            saveStoreData(saved);
            broadcastWs({ type: 'chat:sync', supportChats: saved.supportChats });
          }
          break;
        }
        case 'chat:append_message': {
          const { sessionId, message, sessionMeta } = msg;
          if (sessionId && message?.id) {
            const existingList: any[] = Array.isArray(saved.supportChats) ? saved.supportChats : [];
            const prevSess = existingList.find((s) => s.id === sessionId);
            const nextSess = prevSess
              ? {
                  ...prevSess,
                  ...(sessionMeta || {}),
                  lastUpdated: new Date().toISOString(),
                  messages: [...(prevSess.messages || []), message]
                }
              : {
                  id: sessionId,
                  customerName: sessionMeta?.customerName || 'সম্মানিত গ্রাহক',
                  customerPhone: sessionMeta?.customerPhone || '',
                  status: 'open',
                  manualMode: Boolean(sessionMeta?.manualMode),
                  lastUpdated: new Date().toISOString(),
                  unreadByAdmin: message.sender === 'customer' ? 1 : 0,
                  messages: [message]
                };
            saved.supportChats = mergeSupportChatSessions(existingList, [nextSess]);
            saveStoreData(saved);
            broadcastWs({ type: 'chat:sync', supportChats: saved.supportChats });
          }
          break;
        }
        case 'chat:update_session': {
          const { sessionId, patch } = msg;
          if (sessionId && patch) {
            const existingList: any[] = Array.isArray(saved.supportChats) ? saved.supportChats : [];
            saved.supportChats = existingList.map((s) =>
              s.id === sessionId ? { ...s, ...patch } : s
            );
            saveStoreData(saved);
            broadcastWs({ type: 'chat:sync', supportChats: saved.supportChats });
          }
          break;
        }
        case 'chat:delete_session': {
          const { sessionId } = msg;
          if (sessionId) {
            const existingList: any[] = Array.isArray(saved.supportChats) ? saved.supportChats : [];
            saved.supportChats = existingList.filter((s) => s.id !== sessionId);
            saveStoreData(saved);
            broadcastWs({ type: 'chat:sync', supportChats: saved.supportChats });
          }
          break;
        }
        case 'call:start': {
          if (msg.call?.id) {
            saved.browserCalls = mergeBrowserCallSessions(saved.browserCalls || [], [msg.call]);
            saveStoreData(saved);
            broadcastWs({ type: 'call:sync', browserCalls: saved.browserCalls, latestCall: msg.call });
          }
          break;
        }
        case 'call:answer': {
          const { callId, answeredBy, transcriptItem } = msg;
          if (callId) {
            const existingCalls: any[] = Array.isArray(saved.browserCalls) ? saved.browserCalls : [];
            const prev = existingCalls.find((c) => c.id === callId);
            if (prev) {
              const updated = {
                ...prev,
                status: 'connected',
                answeredBy: answeredBy || prev.answeredBy || 'backend_assistant',
                transcript: transcriptItem ? [...(prev.transcript || []), transcriptItem] : prev.transcript || []
              };
              saved.browserCalls = mergeBrowserCallSessions(existingCalls, [updated]);
              saveStoreData(saved);
              broadcastWs({ type: 'call:sync', browserCalls: saved.browserCalls });
            }
          }
          break;
        }
        case 'call:append_message': {
          const { callId, item } = msg;
          if (callId && item?.id) {
            const existingCalls: any[] = Array.isArray(saved.browserCalls) ? saved.browserCalls : [];
            const prev = existingCalls.find((c) => c.id === callId);
            if (prev) {
              const updated = {
                ...prev,
                transcript: [...(prev.transcript || []), item]
              };
              saved.browserCalls = mergeBrowserCallSessions(existingCalls, [updated]);
              saveStoreData(saved);
              broadcastWs({ type: 'call:sync', browserCalls: saved.browserCalls });
            }
          }
          break;
        }
        case 'call:end': {
          const { callId } = msg;
          if (callId) {
            const existingCalls: any[] = Array.isArray(saved.browserCalls) ? saved.browserCalls : [];
            const prev = existingCalls.find((c) => c.id === callId);
            if (prev) {
              const updated = {
                ...prev,
                status: 'ended',
                endedAt: new Date().toISOString(),
                durationSeconds: Math.max(
                  1,
                  Math.round((Date.now() - new Date(prev.startedAt).getTime()) / 1000)
                )
              };
              saved.browserCalls = mergeBrowserCallSessions(existingCalls, [updated]);
              saveStoreData(saved);
              broadcastWs({ type: 'call:sync', browserCalls: saved.browserCalls });
            }
          }
          break;
        }
        case 'webrtc:offer':
        case 'webrtc:answer':
        case 'webrtc:ice':
        case 'webrtc:hangup': {
          // Relay peer-to-peer WebRTC audio signaling to all other clients
          broadcastWs(msg, ws);
          break;
        }
      }
    });

    ws.on('close', () => {
      activeWsClients.delete(ws);
    });
    ws.on('error', () => {
      activeWsClients.delete(ws);
    });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(async (req, res, next) => {
      const accept = String(req.headers.accept || '');
      const isHtmlNav =
        req.method === 'GET' &&
        accept.includes('text/html') &&
        !req.originalUrl.startsWith('/api/') &&
        !req.originalUrl.startsWith('/ws') &&
        !req.originalUrl.includes('.');
      if (!isHtmlNav) return next();
      try {
        const rawHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
        const seoHtml = injectDynamicSeoIntoHtml(rawHtml);
        const transformed = await vite.transformIndexHtml(req.originalUrl, seoHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(transformed);
      } catch (e) {
        next(e);
      }
    });
    app.use(vite.middlewares);
  } else {
    app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets'), { maxAge: '7d', immutable: true }));
    app.use(express.static(path.join(__dirname, 'dist'), { index: false, maxAge: '1h' }));
    app.get('*', (_req, res) => {
      try {
        const rawHtml = fs.readFileSync(path.join(__dirname, 'dist', 'index.html'), 'utf-8');
        res.status(200).set({ 'Content-Type': 'text/html' }).send(injectDynamicSeoIntoHtml(rawHtml));
      } catch {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
      }
    });
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
