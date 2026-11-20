// Unified crystal-clear studio voice playback + Bangla/English SpeechSynthesis helper

let currentAudioElement: HTMLAudioElement | null = null;

export function stopAllVoicePlayback() {
  try {
    if (currentAudioElement) {
      currentAudioElement.pause();
      currentAudioElement.src = '';
      currentAudioElement = null;
    }
  } catch {}
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch {}
}

export function cleanTextForClearSpeech(raw: string): string {
  return String(raw || '')
    .replace(/https?:\/\/\S+/g, ' link ')
    .replace(/[#*_`~]/g, ' ')
    .replace(/৳\s*([0-9,]+)/g, '$1 taka ')
    .replace(/BuyOne\s*BD/gi, 'বাইওয়ান বিডি')
    .replace(/COD/gi, 'Cash on Delivery')
    .replace(/\s+/g, ' ')
    .trim();
}

export function pickBestBrowserVoice(isBangla: boolean): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (voices.length === 0) return null;

  if (isBangla) {
    return (
      voices.find((v) => /bn-BD/i.test(v.lang) && /natural|google|microsoft|nabanita|pradeep|female/i.test(v.name)) ||
      voices.find((v) => /^bn/i.test(v.lang)) ||
      voices.find((v) => /en-IN|en-GB/i.test(v.lang)) ||
      voices[0]
    );
  }
  return (
    voices.find((v) => /en-(US|GB)/i.test(v.lang) && /natural|google|aria|jenny|samantha/i.test(v.name)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    voices[0]
  );
}

export async function speakClearText(
  text: string,
  options?: {
    voice?: string;
    style?: string;
    speed?: number;
    lang?: 'bn' | 'en';
    preferStudioTts?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
  }
): Promise<'studio' | 'speech' | 'none'> {
  const clean = cleanTextForClearSpeech(text);
  if (!clean) {
    options?.onEnd?.();
    return 'none';
  }

  stopAllVoicePlayback();
  const isBangla =
    options?.lang === 'bn' || (options?.lang !== 'en' && /[\u0980-\u09FF]/.test(clean));

  if (options?.preferStudioTts !== false) {
    try {
      const resp = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: clean.slice(0, 600),
          voice: options?.voice || 'Kore',
          style: options?.style
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data?.audioUrl) {
          await new Promise<void>((resolve, reject) => {
            const audio = new Audio(data.audioUrl);
            currentAudioElement = audio;
            audio.playbackRate = Math.min(1.35, Math.max(0.75, options?.speed || 1));
            audio.onplay = () => options?.onStart?.();
            audio.onended = () => {
              if (currentAudioElement === audio) currentAudioElement = null;
              options?.onEnd?.();
              resolve();
            };
            audio.onerror = () => {
              if (currentAudioElement === audio) currentAudioElement = null;
              reject(new Error('Audio element decode error'));
            };
            audio.play().catch(reject);
          });
          return 'studio';
        }
      }
    } catch {
      // fall back smoothly to Web Speech API
    }
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return new Promise<'speech'>((resolve) => {
      try {
        const utter = new SpeechSynthesisUtterance(clean);
        utter.lang = isBangla ? 'bn-BD' : 'en-US';
        utter.rate = Math.min(1.25, Math.max(0.8, options?.speed || 0.96));
        utter.pitch = 1.04;
        const bestVoice = pickBestBrowserVoice(isBangla);
        if (bestVoice) utter.voice = bestVoice;
        utter.onstart = () => options?.onStart?.();
        utter.onend = () => {
          options?.onEnd?.();
          resolve('speech');
        };
        utter.onerror = () => {
          options?.onEnd?.();
          resolve('speech');
        };
        window.speechSynthesis.speak(utter);
      } catch {
        options?.onEnd?.();
        resolve('speech');
      }
    });
  }

  options?.onEnd?.();
  return 'none';
}
