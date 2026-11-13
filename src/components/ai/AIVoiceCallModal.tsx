import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  Package,
  MapPin,
  CreditCard,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
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
  const [showOrderDetails, setShowOrderDetails] = useState(true);
  const [transcript, setTranscript] = useState<{ speaker: 'ai' | 'customer'; text: string; textBn: string; time: string }[]>([]);
  const [callPhase, setCallPhase] = useState<'greeting' | 'confirming' | 'finished_confirmed' | 'finished_cancelled'>('greeting');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const preloadedAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isSupportCall = activeCallOrder?.id?.startsWith('SUP-');

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

  // Build dynamic greeting script
  const buildGreetingScripts = () => {
    if (!activeCallOrder) return { bn: '', en: '' };
    const customerName = activeCallOrder.customer.name || (lang === 'bn' ? 'সম্মানিত গ্রাহক' : 'Valued Customer');

    if (isSupportCall) {
      return {
        bn: `আসসালামু আলাইকুম ${customerName}! বাইওয়ান বিডি কাস্টমার কেয়ার থেকে আমি ${settings.aiCallSettings.agentName || 'সুমনা'} বলছি। আমাদের প্রোডাক্ট, ডেলিভারি চার্জ বা স্পিন অফার নিয়ে যেকোনো তথ্যে আমি আপনাকে সাহায্য করতে প্রস্তুত।`,
        en: `Assalamu Alaikum ${customerName}, this is ${settings.aiCallSettings.agentName || 'Sumana'} from BuyOne BD customer support. How can I assist you with your inquiry or order today?`
      };
    }

    const totalItemsCount = activeCallOrder.items.reduce((sum, i) => sum + i.quantity, 0);
    const firstItem = activeCallOrder.items[0];
    const itemTitleBn = firstItem?.productTitleBn || firstItem?.productTitle || 'পণ্য';
    const itemTitleEn = firstItem?.productTitle || 'product';
    const totalAmount = activeCallOrder.pricing.total;
    const district = activeCallOrder.customer.district;

    return {
      bn: `আসসালামু আলাইকুম ${customerName} ভাই! বাইওয়ান বিডি থেকে আমি ${settings.aiCallSettings.agentName || 'সুমনা'} বলছি। আপনি আমাদের শপ থেকে ${totalItemsCount} টি পণ্য (${itemTitleBn}) অর্ডার করেছেন, ডেলিভারি চার্জসহ মোট ${totalAmount} টাকা। আপনার ডেলিভারি ঠিকানা ${activeCallOrder.customer.address}, ${district}। অর্ডারটি নিশ্চিত করতে এক চাপুন, বাতিল করতে দুই চাপুন।`,
      en: `Assalamu Alaikum ${customerName}, this is ${settings.aiCallSettings.agentName || 'Sumana'} from BuyOne BD. You placed an order for ${totalItemsCount} item(s) including ${itemTitleEn}, totaling ${totalAmount} BDT to ${activeCallOrder.customer.address}, ${district}. Press 1 to confirm or 2 to cancel.`
    };
  };

  // Pre-fetch TTS audio during ringing for zero-delay playback
  useEffect(() => {
    if (isCallRinging && activeCallOrder) {
      const scripts = buildGreetingScripts();
      const textToPreload = lang === 'bn' ? scripts.bn : scripts.en;

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

  // Call timer & conversation flow
  useEffect(() => {
    if (isCallActive && activeCallOrder) {
      setCallDuration(0);
      setCallPhase('greeting');
      setShowOrderDetails(true);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      const scripts = buildGreetingScripts();

      const speakTimer = setTimeout(() => {
        speakText(lang === 'bn' ? scripts.bn : scripts.en);
        setTranscript([
          {
            speaker: 'ai',
            text: scripts.en,
            textBn: scripts.bn,
            time: '00:02'
          }
        ]);
        setCallPhase('confirming');
      }, 350);

      return () => {
        clearTimeout(speakTimer);
        if (timerRef.current) clearInterval(timerRef.current);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [isCallActive, activeCallOrder]);

  const speakText = async (text: string) => {
    if (!isSpeakerOn) return;
    setAiSpeaking(true);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

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
        // Fallback to fetch
      }
    }

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: settings.aiCallSettings.voiceName || 'Kore',
          style:
            settings.aiCallSettings.humanTone ||
            'A warm, natural, sweet native Bangladeshi Bengali female customer care officer in Dhaka.'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          const audio = new Audio(data.audioUrl);
          audioRef.current = audio;
          audio.onplay = () => setAiSpeaking(true);
          audio.onended = () => setAiSpeaking(false);
          audio.onerror = () => fallbackSpeechSynthesis(text);
          await audio.play();
          return;
        }
      }
    } catch {
      // Fallback
    }

    fallbackSpeechSynthesis(text);
  };

  const fallbackSpeechSynthesis = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setAiSpeaking(false);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const naturalPacedText = text.replace(/(\d+)/g, ' $1 ').replace(/([,।!?])/g, '$1 ');
      const utterance = new SpeechSynthesisUtterance(naturalPacedText);
      utterance.rate = settings.aiCallSettings.voiceSpeed ? Math.min(0.95, settings.aiCallSettings.voiceSpeed) : 0.92;
      utterance.pitch = settings.aiCallSettings.agentGender === 'female' ? 1.05 : 0.95;

      const voices = window.speechSynthesis.getVoices();
      const humanVoice =
        voices.find(
          (v) =>
            v.name.includes('Bangla') ||
            v.name.includes('Bengali') ||
            v.lang.includes('bn') ||
            v.name.includes('Natural') ||
            v.name.includes('Google')
        ) || voices[0];

      if (humanVoice) utterance.voice = humanVoice;
      utterance.onstart = () => setAiSpeaking(true);
      utterance.onend = () => setAiSpeaking(false);
      utterance.onerror = () => setAiSpeaking(false);

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      setAiSpeaking(false);
    }
  };

  const handleKeyPress = (digit: string) => {
    audioEngine.playDtmfTone(digit);

    if (digit === '1') {
      setCallPhase('finished_confirmed');
      const timeStr = formatDuration(callDuration);
      const confMsgBn = isSupportCall
        ? 'অসংখ্য ধন্যবাদ! আমাদের সাথে থাকার জন্য ধন্যবাদ, ভালো থাকবেন।'
        : 'অসংখ্য ধন্যবাদ! আপনার অর্ডারটি সফলভাবে নিশ্চিত হয়েছে। খুব দ্রুত পার্সেলটি পাঠিয়ে দেওয়া হবে।';
      const confMsgEn = isSupportCall
        ? 'Thank you for contacting BuyOne BD support. Have a wonderful day!'
        : 'Thank you! Your order is confirmed and will be dispatched shortly.';

      speakText(lang === 'bn' ? confMsgBn : confMsgEn);

      const updatedTranscript = [
        ...transcript,
        {
          speaker: 'customer' as const,
          text: isSupportCall ? 'Pressed [1] - Resolved' : 'Pressed [1] - Confirmed Order',
          textBn: isSupportCall ? '[১] চাপলেন - ধন্যবাদ' : '[১] চাপলেন - অর্ডার নিশ্চিত',
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

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      audioEngine.playSuccessChime();

      setTimeout(() => {
        finishAICall(true, updatedTranscript);
      }, 3000);
    } else if (digit === '2') {
      setCallPhase('finished_cancelled');
      const timeStr = formatDuration(callDuration);
      const cancelMsgBn = 'আপনার অনুরোধ অনুযায়ী কল/অর্ডার বাতিল করা হলো। ধন্যবাদ।';
      const cancelMsgEn = 'As requested, cancelled. Contact our hotline anytime for help.';

      speakText(lang === 'bn' ? cancelMsgBn : cancelMsgEn);

      const updatedTranscript = [
        ...transcript,
        {
          speaker: 'customer' as const,
          text: 'Pressed [2] - Cancelled',
          textBn: '[২] চাপলেন - বাতিল করেছেন',
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
      }, 3000);
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
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-lg bg-slate-900 sm:border sm:border-slate-800 sm:rounded-3xl shadow-2xl overflow-y-auto text-white flex flex-col justify-between">
        {/* Top ambient banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-emerald-100 flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              {isSupportCall
                ? t('ব্রাউজার এআই কাস্টমার সাপোর্ট কল', 'Browser AI Support Call')
                : t('এআই অর্ডার ভেরিফিকেশন কল', 'AI Order Verification Call')}
            </span>
          </div>
          <div className="text-xs font-mono bg-black/25 px-2.5 py-1 rounded-full text-emerald-100 shrink-0">
            {isCallActive ? formatDuration(callDuration) : t('ইনকামিং কল...', 'Incoming Call...')}
          </div>
        </div>

        {/* Call Body */}
        <div className="p-4 sm:p-6 flex flex-col items-center text-center space-y-3">
          {/* Agent Avatar */}
          <div className="relative my-2 flex items-center justify-center">
            {isCallRinging && (
              <div className="absolute inset-0 w-28 h-28 rounded-full border-4 border-emerald-500/40 animate-ping" />
            )}
            <div className={`relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 shadow-xl ${isCallRinging ? 'animate-call-ripple' : ''}`}>
              <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center border-2 border-slate-800 overflow-hidden">
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

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-100">
              {settings.aiCallSettings.agentName || 'সুমনা'} ({isSupportCall ? t('সাপোর্ট এজেন্ট', 'Support Agent') : t('অর্ডার ভেরিফায়ার', 'Order Verifier')})
            </h3>
            <p className="text-xs sm:text-sm text-emerald-400 font-medium mt-0.5 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{settings.storeName} Official Hotline</span>
            </p>
          </div>

          {/* FULL ORDER DETAILS PANEL WHILE CALLING (Req 7) */}
          {activeCallOrder && !isSupportCall && (
            <div className="w-full bg-slate-800/80 border border-slate-700/70 rounded-2xl overflow-hidden text-left">
              <button
                type="button"
                onClick={() => setShowOrderDetails(!showOrderDetails)}
                className="w-full px-3.5 py-2.5 bg-slate-800 flex items-center justify-between gap-2 text-xs font-bold cursor-pointer border-b border-slate-700/70"
              >
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Package className="w-4 h-4 shrink-0" />
                  <span>
                    {t('সম্পূর্ণ অর্ডার বিবরণ:', 'Full Order Details:')} #{activeCallOrder.id}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-rose-400">৳{activeCallOrder.pricing.total.toLocaleString()}</span>
                  {showOrderDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {showOrderDetails && (
                <div className="p-3 space-y-2.5 text-xs">
                  {/* Customer & Delivery Address */}
                  <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-700/50 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-1 font-bold text-slate-200">
                      <span>👤 {activeCallOrder.customer.name}</span>
                      <span className="font-mono text-emerald-400">{activeCallOrder.customer.phone}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        {activeCallOrder.customer.address}, {activeCallOrder.customer.thana}, {activeCallOrder.customer.district}
                      </span>
                    </p>
                    {activeCallOrder.customer.note && (
                      <p className="text-[10px] text-amber-300 italic">
                        📝 {t('নোট:', 'Note:')} {activeCallOrder.customer.note}
                      </p>
                    )}
                  </div>

                  {/* All Ordered Items List */}
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {activeCallOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 bg-slate-900/50 p-2 rounded-xl border border-slate-800"
                      >
                        <img src={item.image} alt={item.productTitle} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-700" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[11px] text-slate-100 truncate">
                            {lang === 'bn' ? (item.productTitleBn || item.productTitle) : item.productTitle}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {[item.selectedColor, item.selectedSize].filter(Boolean).join(' • ') || t('স্ট্যান্ডার্ড', 'Standard')}
                          </p>
                        </div>
                        <div className="text-right shrink-0 font-mono">
                          <span className="text-[11px] font-bold text-emerald-400 block">
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {item.quantity} × ৳{item.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing & Payment Breakdown */}
                  <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-700/50 space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-300">
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-emerald-400" />
                        {t('পেমেন্ট:', 'Payment:')} <strong className="uppercase">{activeCallOrder.payment.method}</strong>
                        {activeCallOrder.payment.trxId && (
                          <span className="font-mono text-[10px] text-amber-300">({activeCallOrder.payment.trxId})</span>
                        )}
                      </span>
                      <span>
                        {t('ডেলিভারি:', 'Delivery:')} ৳{activeCallOrder.pricing.deliveryFee}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>{t('সাবটোটাল:', 'Subtotal:')} ৳{activeCallOrder.pricing.subtotal.toLocaleString()}</span>
                      {activeCallOrder.pricing.discount > 0 && (
                        <span className="text-emerald-400">
                          {t('ডিসকাউন্ট:', 'Discount:')} -৳{activeCallOrder.pricing.discount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Voice Visualizer */}
          {isCallActive && (
            <div className="w-full space-y-2">
              <div className="flex items-center justify-center gap-1.5 h-9 px-4 bg-slate-950/70 rounded-xl border border-slate-800">
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

          {/* Live Transcript Box */}
          {isCallActive && transcript.length > 0 && (
            <div className="w-full max-h-28 overflow-y-auto bg-slate-950/50 rounded-xl p-3 text-left text-xs space-y-2 border border-slate-800/80">
              {transcript.map((item, idx) => (
                <div key={idx} className={item.speaker === 'ai' ? 'text-emerald-300' : 'text-amber-300'}>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-semibold uppercase">
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

          {/* RINGING BUTTONS */}
          {isCallRinging && (
            <div className="w-full flex items-center justify-around pt-3 pb-2">
              <button onClick={declineAICall} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-15 h-15 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/50 transition-all group-hover:scale-105 active:scale-95">
                  <PhoneOff className="w-6 h-6" />
                </div>
                <span className="text-xs text-rose-300 font-medium">{t('বাতিল', 'Decline')}</span>
              </button>

              <button onClick={answerAICall} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-15 h-15 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-900/50 transition-all group-hover:scale-105 active:scale-95 animate-pulse">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="text-xs text-emerald-300 font-medium">{t('রিসিভ করুন', 'Answer')}</span>
              </button>
            </div>
          )}

          {/* ACTIVE CALL CONTROLS */}
          {isCallActive && (
            <div className="w-full space-y-3 pt-1">
              {callPhase === 'confirming' && (
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80">
                  <p className="text-[11px] text-slate-300 font-semibold mb-2">
                    {t('👇 বোতাম টিপে তাৎক্ষণিক সিদ্ধান্ত জানান:', '👇 Press keypad to respond:')}
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleKeyPress('1')}
                      className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl flex flex-col items-center justify-center transition-all shadow-md border border-emerald-400/30"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>{isSupportCall ? t('[ ১ ] সমাধান হয়েছে', '[ 1 ] Resolved') : t('[ ১ ] নিশ্চিত', '[ 1 ] Confirm')}</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleKeyPress('2')}
                      className="cursor-pointer bg-rose-600/90 hover:bg-rose-500 text-white p-2.5 rounded-xl flex flex-col items-center justify-center transition-all shadow-md border border-rose-400/30"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <XCircle className="w-4 h-4 text-rose-200" />
                        <span>{t('[ ২ ] বাতিল', '[ 2 ] Cancel')}</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-6 pt-1">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-full transition-all cursor-pointer ${
                    isMuted ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={declineAICall}
                  className="p-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg cursor-pointer active:scale-95"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`p-3 rounded-full transition-all cursor-pointer ${
                    isSpeakerOn ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40' : 'bg-slate-800 text-slate-400'
                  }`}
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
