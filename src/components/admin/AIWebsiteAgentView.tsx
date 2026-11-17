import React, { useState, useRef } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  Zap,
  Terminal,
  ShoppingCart,
  Flame,
  Award,
  MessageCircle,
  Truck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AIWebsiteAgentViewProps {
  onNavigateTab: (tab: string) => void;
}

export const AIWebsiteAgentView: React.FC<AIWebsiteAgentViewProps> = ({ onNavigateTab }) => {
  const {
    executeAIAgentCommand,
    agentActionLogs,
    orders,
    products,
    customerAccounts,
    abandonedCarts,
    settings,
    adminLang
  } = useStore();

  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);

  const [commandInput, setCommandInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const recognitionRef = useRef<any>(null);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'on_hold').length;
  const partialOrdersCount = orders.filter(
    (o) => o.status === 'partial' || ((o.pricing?.advancePaid || 0) > 0 && (o.payment?.dueAmount || 0) > 0)
  ).length;
  const unrecoveredCartsCount = abandonedCarts.filter((c) => !c.recovered).length;

  const handleRunCommand = async (rawText?: string) => {
    const query = (rawText ?? commandInput).trim();
    if (!query || isExecuting) return;
    if (!rawText) setCommandInput('');
    setIsExecuting(true);
    try {
      await executeAIAgentCommand(query, 'admin', onNavigateTab);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleVoiceMic = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    if (isListeningVoice && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListeningVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = adminLang === 'en' ? 'en-US' : 'bn-BD';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => setIsListeningVoice(true);
      recognition.onend = () => setIsListeningVoice(false);
      recognition.onerror = () => setIsListeningVoice(false);
      recognition.onresult = (ev: any) => {
        const spoken = ev.results?.[0]?.[0]?.transcript;
        if (spoken) {
          setCommandInput(spoken);
          handleRunCommand(spoken);
        }
      };
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListeningVoice(false);
    }
  };

  const quickPresets = [
    {
      labelBn: `সকল পেন্ডিং অর্ডার AI কনফার্ম (${pendingOrdersCount})`,
      labelEn: `AI Confirm Latest Pending Orders (${pendingOrdersCount})`,
      cmd: orders.find((o) => o.status === 'pending')
        ? `AI confirm order #${orders.find((o) => o.status === 'pending')?.id}`
        : 'Open orders tab',
      icon: CheckCircle2
    },
    {
      labelBn: 'ফ্ল্যাশ সেল চালু / বন্ধ করুন',
      labelEn: settings.flashSale?.enabled ? 'Turn OFF Flash Sale' : 'Turn ON Flash Sale',
      cmd: settings.flashSale?.enabled ? 'Turn off flash sale' : 'Turn on flash sale',
      icon: Flame
    },
    {
      labelBn: 'নতুন কুপন EID200 তৈরি করুন',
      labelEn: 'Create Coupon EID200 (৳200 Off)',
      cmd: 'Create coupon EID200 with 200 taka discount',
      icon: Zap
    },
    {
      labelBn: 'অ্যাবানডন্ড কার্টে রিকভারি মেসেজ',
      labelEn: `Recover All Abandoned Carts (${unrecoveredCartsCount})`,
      cmd: 'Send WhatsApp recovery to all pending abandoned carts',
      icon: MessageCircle
    },
    {
      labelBn: 'পার্শিয়াল অর্ডার সেকশন খুলুন',
      labelEn: `Open Partial Orders (${partialOrdersCount})`,
      cmd: 'Open partial orders section',
      icon: ShoppingCart
    },
    {
      labelBn: 'কুরিয়ারে অর্ডার পাঠান',
      labelEn: 'Book Steadfast on Confirmed Order',
      cmd: orders.find((o) => o.status === 'ai_confirmed' && !o.courier?.trackingCode)
        ? `Book Steadfast courier for order #${orders.find((o) => o.status === 'ai_confirmed' && !o.courier?.trackingCode)?.id}`
        : 'Open courier hub',
      icon: Truck
    },
    {
      labelBn: 'প্রথম কাস্টমারকে +50 পয়েন্ট দিন',
      labelEn: 'Give +50 Loyalty Points to Top Customer',
      cmd: customerAccounts[0]
        ? `Add 50 loyalty points to ${customerAccounts[0].phone}`
        : 'Open customers tab',
      icon: Award
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-400" />
            <span>{at('মানুষের মতো ফুল-ওয়েবসাইট কন্ট্রোল এআই এজেন্ট', 'Human-Like Autonomous Website Control AI Agent')}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {at(
              'বাংলা বা ইংরেজিতে নির্দেশ দিন অথবা ভয়েসে বলুন — এআই নিজেই অর্ডার কনফার্ম, কুরিয়ার বুকিং, পয়েন্ট, কুপন, প্রোডাক্ট প্রাইস ও স্টোর সেটিংস পরিচালনা করবে',
              'Command your entire store in plain Bengali or English — AI executes order confirmations, Steadfast dispatch, loyalty adjustments, coupons, pricing & navigation automatically'
            )}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-xs font-bold shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Gemini Autonomous Operator Active</span>
        </span>
      </div>

      {/* Live Store Telemetry Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs tabular-nums">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">{at('পেন্ডিং অর্ডার', 'Pending Orders')}</span>
          <span className="text-lg font-black text-amber-400 font-mono">{pendingOrdersCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">{at('পার্শিয়াল অর্ডার', 'Partial Orders')}</span>
          <span className="text-lg font-black text-sky-400 font-mono">{partialOrdersCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">{at('মোট পণ্য', 'Catalog')}</span>
          <span className="text-lg font-black text-emerald-400 font-mono">{products.length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">{at('ড্রপ কার্ট', 'Abandoned Carts')}</span>
          <span className="text-lg font-black text-rose-400 font-mono">{unrecoveredCartsCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">{at('ফ্ল্যাশ সেল', 'Flash Sale')}</span>
          <span className={`text-lg font-black font-mono ${settings.flashSale?.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
            {settings.flashSale?.enabled ? 'ACTIVE' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Main Prompt Console */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-emerald-500/35 space-y-4 shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunCommand();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
        >
          <div className="relative flex-1">
            <Terminal className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder={at(
                'কমান্ড লিখুন (যেমন: "অর্ডার #BD-1001 AI কনফার্ম করো" বা "ঢাকা ডেলিভারি চার্জ ৭০ টাকা করো")...',
                'Tell AI Operator what to do (e.g. "AI confirm order #BD-1001", "Create coupon SAVE15 15%", "Set 01917942662 points to 200")...'
              )}
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-2xl text-xs sm:text-sm text-white outline-none"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleVoiceMic}
              className={`px-3.5 py-3 rounded-2xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                isListeningVoice
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-emerald-300 hover:bg-slate-700'
              }`}
              title={at('ভয়েসে নির্দেশ দিন', 'Speak Command')}
            >
              {isListeningVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isListeningVoice ? at('শুনছে...', 'Listening') : at('ভয়েস', 'Voice')}</span>
            </button>

            <button
              type="submit"
              disabled={isExecuting || !commandInput.trim()}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/25"
            >
              <Send className="w-4 h-4" />
              <span>{isExecuting ? at('কাজ করছে...', 'Executing...') : at('এক্সিকিউট করুন', 'Run Agent')}</span>
            </button>
          </div>
        </form>

        {/* Quick Command Buttons */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {at('১-ক্লিক অটোনোমাস কমান্ড শর্টকাট:', '1-Click Autonomous Shortcuts:')}
          </span>
          <div className="flex flex-wrap gap-2">
            {quickPresets.map((preset, idx) => {
              const IconComp = preset.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isExecuting}
                  onClick={() => handleRunCommand(preset.cmd)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <IconComp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{at(preset.labelBn, preset.labelEn)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Action Execution Feed */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-sm text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{at('এআই এজেন্ট অ্যাকশন লগ', 'Autonomous Action Execution Log')}</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">{agentActionLogs.length} entries</span>
        </div>

        {agentActionLogs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950 border border-dashed border-slate-800 text-slate-400 text-xs">
            {at(
              'উপরের বক্সে যেকোনো নির্দেশ লিখে "এক্সিকিউট করুন" চাপুন — এআই সাথে সাথেই পুরো ওয়েবসাইটে পরিবর্তন প্রয়োগ করবে।',
              'Type any command above or pick a shortcut — your AI Store Operator will execute it live across orders, products, customers & settings.'
            )}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {agentActionLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-amber-300">&gt; {log.instruction}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                      {log.mode}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{log.time}</span>
                  </div>
                </div>
                <p className="text-slate-200 leading-relaxed">{log.reply}</p>
                {log.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {log.actions.map((act, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold"
                      >
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        {act}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
