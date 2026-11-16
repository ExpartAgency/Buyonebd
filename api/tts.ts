import { GoogleGenAI } from '@google/genai';

function cleanBanglaForTTS(rawText: string): string {
  let text = String(rawText || '');
  text = text.replace(/BuyOne\s*BD/gi, 'বাইওয়ান বিডি');
  text = text.replace(/BuyOne/gi, 'বাইওয়ান');
  text = text.replace(/Cash on Delivery/gi, 'ক্যাশ অন ডেলিভারি');
  text = text.replace(/COD/gi, 'ক্যাশ অন ডেলিভারি');
  text = text.replace(/BDT/gi, 'টাকা');
  text = text.replace(/৳\s*([0-9]+)/g, '$1 টাকা');
  return text.trim();
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const isSample = req.method === 'GET';
    const text = isSample
      ? 'আসসালামু আলাইকুম! বাইওয়ান বিডি থেকে আমি সুমনা বলছি। আপনার অর্ডারটি নিশ্চিত করতে এক চাপুন।'
      : String(body.text || '');

    if (!text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({ fallbackBrowserTts: true, audioUrl: null });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      apiVersion: 'v1alpha',
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanBanglaForTTS(text)
            }
          ]
        }
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: String(body.voice || 'Kore') }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(200).json({ fallbackBrowserTts: true, audioUrl: null });
    }
    return res.status(200).json({
      audioUrl: `data:audio/wav;base64,${base64Audio}`,
      format: 'wav',
      sampleRate: 24000
    });
  } catch {
    return res.status(200).json({ fallbackBrowserTts: true, audioUrl: null });
  }
}
