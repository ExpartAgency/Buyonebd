import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '15mb' }));

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
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store data:', err);
  }
}

// In-memory audio cache to provide instant responses
const audioCache = new Map<string, string>();

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
      "You are Sumana, a polite, sweet, authentic 25-year-old native Bangladeshi woman from Dhaka working as a customer service executive. Speak fluent, clear, colloquial Standard Bengali (চলিত বাংলা) with sweet, melodic Dhaka intonation, warm human customer service pauses, and zero robotic artifacts. Speak just like a real, polite Bangladeshi girl calling a customer on a phone call.";
    
    const voiceStyle = style && style.trim().length > 0 ? style : defaultBangladeshiStyle;

    const response = await ai.models.generateContent({
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

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from Gemini TTS' });
    }

    const audioUrl = `data:audio/wav;base64,${base64Audio}`;
    audioCache.set(cacheKey, audioUrl);

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
    const cacheKey = `sample_Kore`;

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
                style: "A warm, natural, extremely sweet native Bangladeshi Bengali female customer care officer in Dhaka speaking fluent conversational Bengali with natural pauses and warm melody. Not robotic, completely authentic human woman.",
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

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioUrl = `data:audio/wav;base64,${base64Audio}`;
      audioCache.set(cacheKey, audioUrl);
      return res.json({ audioUrl });
    }
    return res.status(500).json({ error: 'No audio generated' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// WhatsApp AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const systemInstruction = `You are Sumana, a warm, polite, and enthusiastic customer care executive for "BuyOne BD", Bangladesh's premier e-commerce store with 1-click checkout and AI auto-call order verification.
You communicate warmly in Bengali (বাংলা) or friendly Banglish/English depending on what the user speaks.
Store policies:
- Nationwide delivery across all 64 districts in Bangladesh via Steadfast and Pathao Courier.
- Delivery Fee: Dhaka City ৳70 (24-48 hours), Sub-Dhaka (Gazipur, Savar, Narayanganj) ৳100, Outside Dhaka ৳130 (48-72 hours).
- Payment methods: Cash on Delivery (পণ্য হাতে পেয়ে টাকা), bKash (01886289663), Nagad (01886289663), Rocket.
- Every order is confirmed via instant automated phone call.
- Hotline: 01886-BUYONE (01886-289663), Support email: buyonebd@gmail.com.
Keep responses concise, cheerful, helpful and formatted with appropriate emojis.`;

    const contents = [
      ...history.map((h: any) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      }
    });

    return res.json({ reply: response.text });
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    return res.status(500).json({ error: err.message || 'Chat generation failed' });
  }
});

// Full E-commerce Persistence REST Endpoints
// Initial state fallback if no file exists
app.get('/api/store/sync', (_req, res) => {
  const data = loadStoreData();
  return res.json({ success: true, data });
});

app.post('/api/store/sync', (req, res) => {
  const { products, orders, settings, spinRewards } = req.body;
  const current = loadStoreData() || {};
  const updated = {
    ...current,
    products: products || current.products,
    orders: orders || current.orders,
    settings: settings || current.settings,
    spinRewards: spinRewards || current.spinRewards,
    lastUpdated: new Date().toISOString()
  };
  saveStoreData(updated);
  return res.json({ success: true, message: 'Store synchronized' });
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

// Meta WhatsApp Cloud API Live / Simulated Message Sender
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const {
      to,
      message,
      templateName,
      phoneNumberId,
      accessToken,
      apiVersion = 'v21.0'
    } = req.body || {};

    if (!to || (!message && !templateName)) {
      return res.status(400).json({ success: false, error: 'Recipient phone and message or template are required.' });
    }

    const cleanPhone = String(to).replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;

    // If Meta Cloud API credentials are configured, send real Graph API request
    if (phoneNumberId && accessToken) {
      const endpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
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
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const metaJson: any = await metaRes.json().catch(() => ({}));
      if (metaRes.ok) {
        return res.json({
          success: true,
          mode: 'live',
          messageId: metaJson?.messages?.[0]?.id || `wamid.${Date.now()}`,
          to: formattedPhone,
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
    return res.json({
      success: true,
      mode: 'simulated',
      messageId: `sim_wamid_${Date.now()}`,
      to: formattedPhone,
      preview: String(message || templateName)
    });
  } catch (err: any) {
    console.error('WhatsApp Cloud API send error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'WhatsApp dispatch failed' });
  }
});

// Mount Vite or serve static files
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
