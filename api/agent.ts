import { GoogleGenAI, Type } from '@google/genai';

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
              : `${identifier}-এর অ্যাকাউন্টে ${pts} পয়েন্ট আপডেট করা হয়েছে।`
          );
        }
      }
    }

    if (/flash\s?sale|ফ্ল্যাশ\s?সেল/i.test(q)) {
      const disable = /off|disable|stop|বন্ধ/i.test(q);
      commands.push({ type: 'toggle_flash_sale', payload: { enabled: !disable } });
      summaryLines.push(isEn ? `Flash Sale ${!disable ? 'enabled' : 'disabled'}.` : `ফ্ল্যাশ সেল ${!disable ? 'চালু' : 'বন্ধ'} করা হয়েছে।`);
    }

    if (/coupon|voucher|কুপন/i.test(q)) {
      const codeMatch = raw.match(/\b([A-Z0-9]{4,14})\b/);
      const code = codeMatch ? codeMatch[1] : `SAVE${numberMatches[0] || 100}`;
      const val = numberMatches[0] || 100;
      const isPercent = /%|percent|শতাংশ/i.test(q);
      commands.push({
        type: 'create_coupon',
        payload: { code, discountType: isPercent ? 'percent' : 'fixed', value: val, minOrder: numberMatches[1] || 500 }
      });
      summaryLines.push(isEn ? `Created coupon ${code}.` : `নতুন কুপন ${code} তৈরি করা হয়েছে।`);
    }

    if (/delivery|shipping|ডেলিভারি/i.test(q) && numberMatches.length > 0) {
      const fee = numberMatches[0];
      commands.push({
        type: 'update_store_settings',
        payload: /outside|বাইরে/i.test(q) ? { dhakaOutsideFee: fee } : { dhakaInsideFee: fee }
      });
      summaryLines.push(isEn ? `Updated delivery charge to ৳${fee}.` : `ডেলিভারি চার্জ ৳${fee} সেট করা হয়েছে।`);
    }

    if (/abandoned|cart|পরিত্যক্ত/i.test(q)) {
      commands.push({ type: 'recover_abandoned_cart', payload: { cartId: 'all_pending' } });
      summaryLines.push(isEn ? `Triggered recovery on pending abandoned carts.` : `সকল পেন্ডিং কার্ট রিকভারি মেসেজ পাঠানো হয়েছে।`);
    }

    if (/open|go to|show|দেখাও|যাও|pos|পস|partial|আংশিক|loyalty|অর্ডার/i.test(q) && commands.length === 0) {
      let tab = 'orders';
      if (/pos|পস/i.test(q)) tab = 'pos_system';
      else if (/partial|আংশিক/i.test(q)) tab = 'partial_orders';
      else if (/abandoned|পরিত্যক্ত/i.test(q)) tab = 'abandoned_carts';
      else if (/loyalty|customer|গ্রাহক/i.test(q)) tab = 'users';
      else if (/product|পণ্য/i.test(q)) tab = 'products';
      else if (/marketing|মার্কেটিং/i.test(q)) tab = 'marketing_hub';
      commands.push({ type: 'navigate_admin_tab', payload: { tab } });
      summaryLines.push(isEn ? `Opened ${tab} panel.` : `${tab} সেকশন খোলা হয়েছে।`);
    }

    return {
      reply:
        summaryLines.length > 0
          ? summaryLines.join(' ')
          : isEn
          ? 'Ready! Tell me what you want to do across orders, products, coupons, loyalty points, POS, or store settings.'
          : 'আমি সম্পূর্ণ ওয়েবসাইট পরিচালনা করতে প্রস্তুত! অর্ডার, পণ্য, কুপন, লয়্যালটি পয়েন্ট বা সেটিংস নিয়ে যেকোনো নির্দেশ দিন।',
      commands
    };
  }

  if (orderMatch && /confirm|কনফার্ম/i.test(q)) {
    commands.push({ type: 'ai_confirm_order', payload: { orderId: orderMatch[1].toUpperCase() } });
    return {
      reply: isEn ? `Confirming order #${orderMatch[1]} now!` : `আপনার অর্ডার #${orderMatch[1]} কনফার্ম করা হচ্ছে!`,
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
    commands.push({
      type: /buy|order|অর্ডার|কিন/i.test(q) ? 'open_checkout' : 'add_to_cart',
      payload: { productId: prodMatch.id, quantity: 1 }
    });
    return {
      reply: isEn ? `Selected ${prodMatch.title} (৳${prodMatch.price})!` : `${prodMatch.titleBn || prodMatch.title} (৳${prodMatch.price}) সিলেক্ট করা হয়েছে!`,
      commands
    };
  }
  return {
    reply: isEn ? 'Ask me to find products, open checkout, confirm your order, or track a parcel!' : 'পণ্য খুঁজতে, অর্ডার করতে বা পার্সেল ট্র্যাক করতে আমাকে বলুন!',
    commands
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { instruction, role = 'admin', lang = 'bn', context = {} } = body;
    if (!instruction || !String(instruction).trim()) {
      return res.status(400).json({ success: false, error: 'instruction is required' });
    }

    const fallback = buildLocalAgentPlan({ instruction: String(instruction), role, lang, context });
    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({ success: true, ...fallback, mode: 'free_auto_local' });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        apiVersion: 'v1alpha',
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: String(instruction),
        config: {
          systemInstruction: `You are an autonomous Website Operator AI for "${context.storeName || 'BuyOne BD'}". Role: ${role}. Language: ${lang}. Return structured JSON with natural "reply" and "commands" [{type, payloadJson}]. Live context: ${JSON.stringify(context).slice(0, 6000)}`,
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

      return res.status(200).json({
        success: true,
        reply: parsed.reply || fallback.reply,
        commands: normalizedCommands.length > 0 ? normalizedCommands : fallback.commands,
        mode: 'gemini_live'
      });
    } catch {
      return res.status(200).json({ success: true, ...fallback, mode: 'free_auto_fallback' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Agent handler error' });
  }
}
