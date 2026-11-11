import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, ShieldCheck, CheckCircle2, XCircle, Clock, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { audioEngine } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

export const AIVoiceCallModal: React.FC = () => {
  const {
    activeCallOrder,
    isCallRinging,
    isCallActive,
    answerAICall,
    declineAICall,
    finishAICall,
    settings,
    lang,
    t
  } = useStore();

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<{ speaker: 'ai' | 'customer'; text: string; textBn: string; time: string }[]>([]);
  const [callPhase, setCallPhase] = useState<'greeting' | 'confirming' | 'finished_confirmed' | 'finished_cancelled'>('greeting');

  const timerRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Ringtone control
  useEffect(() => {
    if (isCallRinging) {
      audioEngine.startPhoneRingtone();
    } else {
      audioEngine.stopPhoneRingtone();
    }
    return () => {
      audioEngine.stopPhoneRingtone();
    };
  }, [isCallRinging]);

  const preloadedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Pre-fetch TTS audio as soon as ringing starts so it's ready without delay
  useEffect(() => {
    if (isCallRinging && activeCallOrder) {
      const customerName = activeCallOrder.customer.name || (lang === 'bn' ? 'সম্মানিত গ্রাহক' : 'Valued Customer');
      const firstItem = activeCallOrder.items[0];
      const itemTitle = lang === 'bn' ? (firstItem?.productTitleBn || firstItem?.productTitle) : firstItem?.productTitle;
      const totalAmount = activeCallOrder.pricing.total;
      const district = activeCallOrder.customer.district;

      const speechGreetingBn = `আসসালামু আলাইকুম ${customerName} ভাই! বাইওয়ান বিডি থেকে আমি সুমনা বলছি। আশা করি আপনি ভালো আছেন। আপনি আমাদের শপ থেকে ${itemTitle} অর্ডার করেছেন, মোট ${totalAmount} টাকা। আপনার ডেলিভারি এলাকা ${district}। অর্ডারটি নিশ্চিত করতে অনুগ্রহ করে এক চাপুন, আর বাতিল করতে দুই চাপুন।`;
      const speechGreetingEn = `Assalamu Alaikum ${customerName}, this is Sumana from BuyOne BD. You placed an order for ${itemTitle} worth ${totalAmount} BDT to ${district}. To confirm this order, please press 1. To cancel, press 2.`;

      const textToPreload = lang === 'bn' ? speechGreetingBn : speechGreetingEn;

      fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToPreload,
          voice: settings.aiCallSettings.voiceName || 'Kore',
          style: settings.aiCallSettings.humanTone
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.audioUrl) {
            const audio = new Audio(data.audioUrl);
            audio.preload = 'auto';
            preloadedAudioRef.current = audio;
          }
        })
        .catch(() => {});
    }
  }, [isCallRinging, activeCallOrder, lang, settings]);

  // Call timer and conversation flow
  useEffect(() => {
    if (isCallActive && activeCallOrder) {
      setCallDuration(0);
      setCallPhase('greeting');
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      // Construct dynamic script with sweet, natural Dhaka tone
      const customerName = activeCallOrder.customer.name || (lang === 'bn' ? 'সম্মানিত গ্রাহক' : 'Valued Customer');
      const firstItem = activeCallOrder.items[0];
      const itemTitle = lang === 'bn' ? (firstItem?.productTitleBn || firstItem?.productTitle) : firstItem?.productTitle;
      const totalAmount = activeCallOrder.pricing.total;
      const district = activeCallOrder.customer.district;

      const speechGreetingBn = `আসসালামু আলাইকুম ${customerName} ভাই! বাইওয়ান বিডি থেকে আমি সুমনা বলছি। আশা করি আপনি ভালো আছেন। আপনি আমাদের শপ থেকে ${itemTitle} অর্ডার করেছেন, মোট ${totalAmount} টাকা। আপনার ডেলিভারি এলাকা ${district}। অর্ডারটি নিশ্চিত করতে অনুগ্রহ করে এক চাপুন, আর বাতিল করতে দুই চাপুন।`;
      const speechGreetingEn = `Assalamu Alaikum ${customerName}, this is Sumana from BuyOne BD customer care. You placed an order for ${itemTitle} worth ${totalAmount} BDT for delivery to ${district}. To confirm this order, please press 1. To cancel, press 2.`;

      // Initial AI speaking
      setTimeout(() => {
        speakText(lang === 'bn' ? speechGreetingBn : speechGreetingEn);
        setTranscript([
          {
            speaker: 'ai',
            text: speechGreetingEn,
            textBn: speechGreetingBn,
            time: '00:02'
          }
        ]);
        setCallPhase('confirming');
      }, 500);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [isCallActive, activeCallOrder]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play natural human speech via Gemini 3.8 TTS or neural voice fallback
  const speakText = async (text: string) => {
    setAiSpeaking(true);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // 1. If we already have preloaded audio for initial greeting, play instantly!
    if (preloadedAudioRef.current) {
      const pAudio = preloadedAudioRef.current;
      preloadedAudioRef.current = null;
      audioRef.current = pAudio;
      pAudio.onplay = () => setAiSpeaking(true);
      pAudio.onended = () => setAiSpeaking(false);
      pAudio.onerror = () => fallbackSpeechSynthesis(text);
      try {
        await pAudio.play();
        return;
      } catch {
        // Continue to fresh fetch
      }
    }

    try {
      // 2. Ultra-realistic Gemini 3.8 Human Voice TTS
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: settings.aiCallSettings.voiceName || 'Kore',
          style: settings.aiCallSettings.humanTone || 'A warm, natural, extremely sweet native Bangladeshi Bengali female customer care officer in Dhaka speaking fluent conversational Bengali with natural pauses and warm melody. Not robotic, completely authentic human woman.'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          const audio = new Audio(data.audioUrl);
          audioRef.current = audio;
          audio.onplay = () => setAiSpeaking(true);
          audio.onended = () => setAiSpeaking(false);
          audio.onerror = () => {
            fallbackSpeechSynthesis(text);
          };
          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.info('TTS network fallback to neural browser voice', err);
    }

    // 3. Fallback to human-tuned browser neural speech
    fallbackSpeechSynthesis(text);
  };

  const fallbackSpeechSynthesis = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setAiSpeaking(false);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      // Add natural conversational phrasing pauses
      const naturalPacedText = text
        .replace(/(\d+)/g, ' $1 ')
        .replace(/([,।!?])/g, '$1 ');

      const utterance = new SpeechSynthesisUtterance(naturalPacedText);
      utterance.rate = settings.aiCallSettings.voiceSpeed ? Math.min(0.95, settings.aiCallSettings.voiceSpeed) : 0.92;
      utterance.pitch = settings.aiCallSettings.agentGender === 'female' ? 1.05 : 0.95;

      const voices = window.speechSynthesis.getVoices();
      const humanVoice = voices.find((v) =>
        v.name.includes('Bangla') ||
        v.name.includes('Bengali') ||
        v.lang.includes('bn') ||
        v.name.includes('Natural') ||
        v.name.includes('Neural') ||
        v.name.includes('Google') ||
        v.name.includes('Samantha')
      ) || voices[0];

      if (humanVoice) {
        utterance.voice = humanVoice;
      }

      utterance.onstart = () => setAiSpeaking(true);
      utterance.onend = () => setAiSpeaking(false);
      utterance.onerror = () => setAiSpeaking(false);

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech fallback error', err);
      setAiSpeaking(false);
    }
  };

  const handleKeyPress = (digit: string) => {
    audioEngine.playDtmfTone(digit);

    if (digit === '1') {
      // Customer confirmed
      setCallPhase('finished_confirmed');
      const timeStr = formatDuration(callDuration);
      const confMsgBn = 'অসংখ্য ধন্যবাদ! আপনার অর্ডারটি সফলভাবে নিশ্চিত হয়েছে। খুব দ্রুত পার্সেলটি পাঠিয়ে দেওয়া হবে। ভালো থাকবেন, খোদা হাফেজ।';
      const confMsgEn = 'Thank you very much! Your order has been successfully confirmed and will be dispatched via courier shortly. Have a great day!';

      speakText(lang === 'bn' ? confMsgBn : confMsgEn);

      const updatedTranscript = [
        ...transcript,
        {
          speaker: 'customer' as const,
          text: 'Pressed [1] - Confirmed Order',
          textBn: '[১] চাপলেন - অর্ডার নিশ্চিত করেছেন',
          time: timeStr
        },
        {
          speaker: 'ai' as const,
          text: confMsgEn,
          textBn: confMsgBn,
          time: formatDuration(callDuration + 2)
        }
      ];
      setTranscript(updatedTranscript);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      audioEngine.playSuccessChime();

      setTimeout(() => {
        finishAICall(true, updatedTranscript);
      }, 3500);
    } else if (digit === '2') {
      // Customer cancelled
      setCallPhase('finished_cancelled');
      const timeStr = formatDuration(callDuration);
      const cancelMsgBn = 'আপনার অনুরোধ অনুযায়ী অর্ডারটি বাতিল করা হলো। যেকোনো প্রয়োজনে আমাদের হটলাইনে যোগাযোগ করতে পারেন। ধন্যবাদ।';
      const cancelMsgEn = 'As per your request, the order has been cancelled. Feel free to contact our hotline for assistance. Thank you.';

      speakText(lang === 'bn' ? cancelMsgBn : cancelMsgEn);

      const updatedTranscript = [
        ...transcript,
        {
          speaker: 'customer' as const,
          text: 'Pressed [2] - Cancelled Order',
          textBn: '[২] চাপলেন - অর্ডার বাতিল করেছেন',
          time: timeStr
        },
        {
          speaker: 'ai' as const,
          text: cancelMsgEn,
          textBn: cancelMsgBn,
          time: formatDuration(callDuration + 2)
        }
      ];
      setTranscript(updatedTranscript);

      setTimeout(() => {
        finishAICall(false, updatedTranscript);
      }, 3500);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isCallRinging && !isCallActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full h-full sm:h-auto sm:max-w-md bg-slate-900 sm:border sm:border-slate-800 sm:rounded-3xl shadow-2xl overflow-y-auto text-white flex flex-col justify-between">
        {/* Top ambient banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {t('এআই অটোমেটেড ভয়েস এজেন্ট', 'AI Automated Voice Agent')}
            </span>
          </div>
          <div className="text-xs font-mono bg-black/25 px-2.5 py-1 rounded-full text-emerald-100">
            {isCallActive ? formatDuration(callDuration) : t('ইনকামিং কল...', 'Incoming Call...')}
          </div>
        </div>

        {/* Call Body */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Agent Avatar with waves */}
          <div className="relative my-4 flex items-center justify-center">
            {isCallRinging && (
              <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-emerald-500/40 animate-ping" />
            )}
            <div className={`relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 shadow-xl ${isCallRinging ? 'animate-call-ripple' : ''}`}>
              <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center p-2 border-2 border-slate-800 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
                  alt="AI Agent"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            {isCallActive && aiSpeaking && (
              <div className="absolute -bottom-2 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
                {t('কথা বলছে...', 'Speaking...')}
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-slate-100">
            {settings.aiCallSettings.agentName || 'সুমনা'} ({t('অর্ডার ভেরিফায়ার', 'Order Verifier')})
          </h3>
          <p className="text-sm text-emerald-400 font-medium mt-0.5 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            {settings.storeName} Official Hotline (+880 1800-BUYONE)
          </p>

          {/* Order Snapshot Card */}
          {activeCallOrder && (
            <div className="w-full mt-4 bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 text-left">
              <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-700 pb-1.5 mb-2">
                <span>{t('অর্ডার নম্বর:', 'Order ID:')} <strong className="text-emerald-400">{activeCallOrder.id}</strong></span>
                <span className="font-semibold text-rose-400">৳ {activeCallOrder.pricing.total.toLocaleString()}</span>
              </div>
              <p className="text-xs font-medium text-slate-200 line-clamp-1">
                📦 {lang === 'bn' ? activeCallOrder.items[0]?.productTitleBn : activeCallOrder.items[0]?.productTitle}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                📍 {activeCallOrder.customer.address}, {activeCallOrder.customer.district}
              </p>
            </div>
          )}

          {/* Human Voice Mode Indicator & Live Visualizer */}
          {isCallActive && (
            <div className="w-full my-3 space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full mx-auto w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">{t('🎙️ প্রাকৃতিক হিউম্যান ভয়েস মোড (Gemini Studio AI Voice)', '🎙️ Natural Human Voice Mode (Gemini Studio Voice)')}</span>
              </div>
              <div className="w-full flex items-center justify-center gap-1.5 h-10 px-4 bg-slate-950/70 rounded-xl border border-slate-800">
                {[40, 75, 30, 90, 60, 100, 45, 80, 55, 95, 35, 70, 50].map((height, i) => (
                  <span
                    key={i}
                    style={{
                      height: aiSpeaking ? `${Math.max(15, Math.round(height * Math.random()))}%` : '20%',
                      transition: 'height 0.15s ease'
                    }}
                    className={`w-1 rounded-full ${
                      aiSpeaking ? 'bg-gradient-to-t from-emerald-500 to-teal-300' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Live Transcript Log Box */}
          {isCallActive && transcript.length > 0 && (
            <div className="w-full max-h-32 overflow-y-auto bg-slate-950/50 rounded-xl p-3 text-left text-xs space-y-2 border border-slate-800/80 my-2">
              {transcript.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    item.speaker === 'ai' ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-semibold uppercase tracking-wider">
                      {item.speaker === 'ai' ? `🤖 ${settings.aiCallSettings.agentName}` : `👤 ${t('আপনি', 'You')}`}
                    </span>
                    <span>{item.time}</span>
                  </div>
                  <p className="text-slate-200 text-xs mt-0.5 leading-relaxed">
                    {lang === 'bn' ? item.textBn : item.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons during RINGING */}
          {isCallRinging && (
            <div className="w-full flex items-center justify-around mt-6 pt-2">
              <button
                onClick={declineAICall}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/50 transition-all transform group-hover:scale-105 active:scale-95">
                  <PhoneOff className="w-7 h-7" />
                </div>
                <span className="text-xs text-rose-300 font-medium">
                  {t('বাতিল করুন', 'Decline')}
                </span>
              </button>

              <button
                onClick={answerAICall}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-900/50 transition-all transform group-hover:scale-105 active:scale-95 animate-pulse">
                  <Phone className="w-7 h-7" />
                </div>
                <span className="text-xs text-emerald-300 font-medium">
                  {t('কল রিসিভ করুন', 'Answer Call')}
                </span>
              </button>
            </div>
          )}

          {/* Action buttons during ACTIVE CALL */}
          {isCallActive && (
            <div className="w-full mt-4 space-y-4">
              {/* Interactive Keypad confirmation */}
              {callPhase === 'confirming' && (
                <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-3.5 rounded-2xl border border-slate-700/80">
                  <p className="text-xs text-slate-300 font-semibold mb-3">
                    {t('👇 বোতাম টিপে তাৎক্ষণিক সিদ্ধান্ত জানান:', '👇 Press buttons to respond directly:')}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleKeyPress('1')}
                      className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white p-3 rounded-xl flex flex-col items-center justify-center transition-all shadow-md group border border-emerald-400/30"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-base">
                        <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                        <span>{t('[ ১ ] হ্যাঁ, নিশ্চিত', '[ 1 ] Confirm')}</span>
                      </div>
                      <span className="text-[10px] text-emerald-100 font-medium mt-0.5">
                        {t('অর্ডার কনফার্ম করুন', 'Proceed with Delivery')}
                      </span>
                    </button>

                    <button
                      onClick={() => handleKeyPress('2')}
                      className="cursor-pointer bg-rose-600/90 hover:bg-rose-500 active:bg-rose-700 text-white p-3 rounded-xl flex flex-col items-center justify-center transition-all shadow-md group border border-rose-400/30"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-base">
                        <XCircle className="w-5 h-5 text-rose-200" />
                        <span>{t('[ ২ ] না, বাতিল', '[ 2 ] Cancel')}</span>
                      </div>
                      <span className="text-[10px] text-rose-100 font-medium mt-0.5">
                        {t('অর্ডার বাতিল করুন', 'Cancel this Order')}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Call Control Strip (Mute, End Call) */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-full transition-all cursor-pointer ${
                    isMuted ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={declineAICall}
                  className="p-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg shadow-rose-900/40 cursor-pointer active:scale-95"
                  title="End Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`p-3 rounded-full transition-all cursor-pointer ${
                    isSpeakerOn ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40' : 'bg-slate-800 text-slate-400'
                  }`}
                  title="Speaker"
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
