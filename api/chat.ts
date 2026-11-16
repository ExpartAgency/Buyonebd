import { GoogleGenAI } from '@google/genai';

function buildLocalReply(params: {
  message: string;
  lang: string;
  products: any[];
  orders: any[];
  assistantDraft?: boolean;
}) {
  const { message, lang, products, orders, assistantDraft } = params;
  const q = String(message || '').trim().toLowerCase();
  const isEn = lang === 'en';

  if (assistantDraft) {
    return {
      reply: isEn
        ? 'Hello! Thank you for reaching out. Cash on Delivery is available across all 64 districts (Dhaka ৳70, Sub-Dhaka ৳100, Outside ৳130). Please let us know how we can confirm your order!'
        : 'আসসালামু আলাইকুম! আমাদের সাথে যোগাযোগ করার জন্য ধন্যবাদ। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে (ঢাকা ৳৭০, সাব-ঢাকা ৳১০০, ঢাকার বাইরে ৳১৩০)। কীভাবে আপনাকে সাহায্য করতে পারি?',
      quickActions: []
    };
  }

  const orderMatch = String(message || '').match(/(BD-[A-Z0-9-]+|POS-[A-Z0-9-]+)/i);
  if (orderMatch && Array.isArray(orders)) {
    const ord = orders.find((o: any) => String(o?.id || '').toLowerCase() === orderMatch[1].toLowerCase());
    if (ord) {
      const quickActions: any[] = [
        { label: isEn ? `📍 Track #${ord.id}` : `📍 ট্র্যাক #${ord.id}`, action: `track_${ord.id}` }
      ];
      if (ord.status === 'pending' || ord.status === 'on_hold') {
        quickActions.unshift({
          label: isEn ? `✅ Confirm #${ord.id} Now` : `✅ #${ord.id} কনফার্ম করুন`,
          action: `confirm_order_${ord.id}`
        });
      }
      return {
        reply: isEn
          ? `Order #${ord.id} (${ord.customer?.name}) — Status: ${String(ord.status || 'pending').toUpperCase()}, Total: ৳${ord.pricing?.total || 0}.`
          : `অর্ডার #${ord.id} (${ord.customer?.name}) — অবস্থা: ${String(ord.status || 'pending').toUpperCase()}, মোট বিল: ৳${ord.pricing?.total || 0}।`,
        quickActions
      };
    }
  }

  const matched = Array.isArray(products)
    ? products
        .filter((p: any) => {
          const hay = `${p.title || ''} ${p.titleBn || ''} ${p.category || ''} ${p.brand || ''}`.toLowerCase();
          return q.split(/\s+/).some((tok) => tok.length >= 2 && hay.includes(tok));
        })
        .slice(0, 3)
    : [];

  if (matched.length > 0) {
    const lines = matched
      .map((p: any, i: number) => `${i + 1}. ${isEn ? p.title : p.titleBn || p.title} — ৳${p.price}`)
      .join('\n');
    const quickActions = matched.map((p: any) => ({
      label: p.stock > 0
        ? (isEn ? `⚡ 1-Click Order: ${p.title.slice(0, 18)}` : `⚡ ১-ক্লিক অর্ডার`)
        : (isEn ? `🔔 Notify When Available` : `🔔 স্টক অ্যালার্ট`),
      action: p.stock > 0 ? `buy_${p.id}` : `view_${p.id}`
    }));
    return {
      reply: isEn
        ? `Matching products:\n${lines}\nTap below for 1-click checkout!`
        : `আপনার পছন্দের পণ্য:\n${lines}\nনিচের বাটনে ক্লিক করে অর্ডার করুন!`,
      quickActions
    };
  }

  return {
    reply: isEn
      ? 'Welcome to BuyOne BD AI Agent! Tell me a product name, ask delivery rates, or send an Order ID to confirm & track live.'
      : 'বাইওয়ান বিডি এআই এজেন্টে স্বাগতম! আপনার পছন্দের পণ্যের নাম লিখুন বা অর্ডার আইডি দিয়ে এক ক্লিকে অর্ডার কনফার্ম ও ট্র্যাক করুন।',
    quickActions: [{ label: isEn ? '🛍️ View All Products' : '🛍️ সব পণ্য দেখুন', action: 'browse_all' }]
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const {
      message,
      history = [],
      keywordRules = [],
      lang = 'bn',
      assistantDraft = false,
      catalogSummary = [],
      recentOrdersSummary = []
    } = body;

    if (!message) return res.status(400).json({ error: 'Message is required' });

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
        if (matchedReply) return res.status(200).json({ reply: matchedReply, matchedKeyword: true, quickActions: [] });
      }
    }

    const localHints = buildLocalReply({
      message: String(message),
      lang,
      products: catalogSummary,
      orders: recentOrdersSummary,
      assistantDraft
    });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({ ...localHints, mode: 'free_auto_local' });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        apiVersion: 'v1alpha',
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const compactCatalog = Array.isArray(catalogSummary)
        ? catalogSummary.slice(0, 20).map((p: any) => `${p.titleBn || p.title} - ৳${p.price} (stock:${p.stock ?? 0})`).join(' | ')
        : '';

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: [
          ...history.slice(-8).map((h: any) => ({
            role: h.sender === 'user' || h.sender === 'customer' ? 'user' : 'model',
            parts: [{ text: h.textBn || h.text }]
          })),
          { role: 'user', parts: [{ text: String(message) }] }
        ],
        config: {
          systemInstruction: `You are Sumana, an A-to-Z Senior E-Commerce AI Sales & Order Verification Executive for BuyOne BD. Reply in ${lang === 'en' ? 'English' : 'polite Bengali (বাংলা)'}. Catalog: ${compactCatalog}. Delivery: Dhaka ৳70, Sub-Dhaka ৳100, Outside ৳130 (COD available nationwide). Be helpful and concise.`
        }
      });

      return res.status(200).json({
        reply: response.text || localHints.reply,
        quickActions: localHints.quickActions,
        mode: 'gemini_live'
      });
    } catch {
      return res.status(200).json({ ...localHints, mode: 'free_auto_fallback' });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Chat handler error' });
  }
}
