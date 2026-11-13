import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  CheckCheck,
  PhoneCall,
  ArrowUpRight,
  ShoppingBag,
  Truck,
  HelpCircle,
  Gift,
  Flame,
  Volume2,
  Zap,
  Sparkles,
  Headphones
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';

export const WhatsAppAgentModal: React.FC = () => {
  const {
    isWhatsAppOpen,
    setIsWhatsAppOpen,
    settings,
    orders,
    products,
    openOneClickCheckout,
    setTrackingSearchQuery,
    setActiveView,
    navigateToPath,
    setIsSpinOpen,
    remainingSpinsToday,
    spinRewards,
    startAICall,
    initiateCustomerBrowserCall,
    supportChats,
    activeChatSessionId,
    sendCustomerChatMessage,
    playVoiceSample,
    isPlayingVoiceSample,
    openProductPage,
    lang,
    t
  } = useStore();

  const [activeTab, setActiveTab] = useState<'chat' | 'call' | 'spin' | 'flash'>('chat');
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = supportChats.find((s) => s.id === activeChatSessionId) || supportChats[0];
  const sessionMessages = currentSession?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionMessages.length, isSending, activeTab]);

  const flashSaleProducts = products.filter((p) => p.isFlashSale);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isSending) return;
    if (!textToSend) setInputMessage('');
    setIsSending(true);
    try {
      await sendCustomerChatMessage(query);
    } finally {
      setIsSending(false);
    }
  };

  const handleLaunchBackendCall = (orderToCall?: Order) => {
    setIsWhatsAppOpen(false);
    initiateCustomerBrowserCall(orderToCall || null);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'track') {
      handleSend(lang === 'bn' ? 'আমার অর্ডার ট্র্যাক করতে চাই' : 'I want to track my order');
    } else if (action === 'deals') {
      handleSend(lang === 'bn' ? 'আজকের সেরা অফার কি কি?' : 'What are today hot deals?');
    } else if (action === 'delivery') {
      handleSend(lang === 'bn' ? 'ডেলিভারি চার্জ কত?' : 'Delivery charges?');
    } else if (action === 'open_spin') {
      setActiveTab('spin');
    } else if (action === 'tab_call') {
      setActiveTab('call');
    } else if (action === 'tab_flash') {
      setActiveTab('flash');
    } else if (action.startsWith('view_track_')) {
      const orderId = action.replace('view_track_', '');
      setTrackingSearchQuery(orderId);
      setActiveView('tracking');
      navigateToPath('/tracking');
      setIsWhatsAppOpen(false);
    }
  };

  const openRealWhatsApp = () => {
    const text = encodeURIComponent(`Hello ${settings.storeName}, I would like to inquire about products and orders.`);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <>
      {/* Floating Support Launcher */}
      {!isWhatsAppOpen && (
        <button
          onClick={() => setIsWhatsAppOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-3.5 h-12 sm:h-14 rounded-full shadow-2xl shadow-emerald-600/40 flex items-center gap-2 group transition-all duration-300 cursor-pointer border border-emerald-400/40"
          title="BuyOne BD AI Support"
          aria-label="Open AI Support Hub"
        >
          <div className="relative flex items-center justify-center">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white/20" />
          </div>
          <span className="text-[11px] font-bold hidden sm:inline">AI Support</span>
        </button>
      )}

      {/* Multi-Tab Mobile-Responsive AI & Assistant Support Modal */}
      {isWhatsAppOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-2.5 left-2.5 sm:left-auto sm:right-6 z-50 sm:w-[405px] h-[540px] max-h-[76vh] md:max-h-[85vh] bg-slate-900 rounded-3xl shadow-2xl border border-emerald-900/40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Top Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-3 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-emerald-600 border-2 border-emerald-400 overflow-hidden flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-800 rounded-full" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold flex items-center gap-1.5 truncate">
                  <span className="truncate">{settings.storeName} Support Hub</span>
                </h4>
                <p className="text-[10px] text-emerald-200 truncate">
                  {t('লাইভ চ্যাট · ব্রাউজার কল · স্পিন · ফ্ল্যাশ', 'Live Chat · Browser Call · Spin · Flash')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={openRealWhatsApp}
                title="Open WhatsApp Web"
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700/60 rounded-full transition-colors cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsWhatsAppOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700/60 rounded-full transition-colors cursor-pointer"
                aria-label="Close Support"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 4 Interactive Tabs: AI Chat | Browser Call | Spin Wheel | Flash Sale */}
          <div className="grid grid-cols-4 bg-slate-950 border-b border-slate-800 text-[10px] sm:text-[11px] font-bold shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2.5 px-1 flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer border-b-2 transition-colors ${
                activeTab === 'chat' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{t('সাপোর্ট চ্যাট', 'Live Chat')}</span>
            </button>
            <button
              onClick={() => setActiveTab('call')}
              className={`py-2.5 px-1 flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer border-b-2 transition-colors ${
                activeTab === 'call' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t('ব্রাউজার কল', 'Call')}</span>
            </button>
            <button
              onClick={() => setActiveTab('spin')}
              className={`py-2.5 px-1 flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer border-b-2 transition-colors ${
                activeTab === 'spin' ? 'border-amber-400 text-amber-300 bg-amber-950/20' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>{t('স্পিন', 'Spin')}</span>
            </button>
            <button
              onClick={() => setActiveTab('flash')}
              className={`py-2.5 px-1 flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer border-b-2 transition-colors ${
                activeTab === 'flash' ? 'border-rose-500 text-rose-400 bg-rose-950/20' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{t('ফ্ল্যাশ সেল', 'Flash')}</span>
            </button>
          </div>

          {/* TAB 1: LIVE SUPPORT CHAT (Synced with Backend Assistant + Keyword Rules + AI) */}
          {activeTab === 'chat' && (
            <>
              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#0b141a] text-slate-200 text-xs">
                {sessionMessages.map((msg) => {
                  const isCust = msg.sender === 'customer';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isCust ? 'items-end' : 'items-start'}`}>
                      {!isCust && (
                        <span className="text-[9px] font-bold text-emerald-400 mb-0.5 px-1">
                          {msg.sender === 'assistant'
                            ? t('অ্যাসিস্ট্যান্ট ডেস্ক', 'Support Assistant')
                            : t('AI অটো সাপোর্ট', 'AI Support')}
                        </span>
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl p-2.5 shadow-md ${
                          isCust
                            ? 'bg-[#005c4b] text-white rounded-tr-none'
                            : msg.sender === 'assistant'
                            ? 'bg-emerald-950 text-emerald-50 rounded-tl-none border border-emerald-700/60'
                            : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-[#2a3942]'
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed text-xs">
                          {lang === 'bn' ? msg.textBn || msg.text : msg.text}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                          <span>{msg.time}</span>
                          {isCust && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isSending && (
                  <div className="flex items-center gap-1.5 bg-[#202c33] text-slate-400 text-xs px-3 py-2 rounded-2xl rounded-tl-none w-fit border border-[#2a3942]">
                    <span>{t('টাইপ করছে...', 'Typing...')}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-[#111b21] px-2.5 py-1.5 border-t border-[#222e35] flex items-center gap-1.5 overflow-x-auto text-[10px] shrink-0">
                <button onClick={() => handleQuickAction('track')} className="whitespace-nowrap bg-[#202c33] text-slate-300 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1">
                  <Truck className="w-3 h-3 text-emerald-400" /> {t('ট্র্যাক', 'Track')}
                </button>
                <button onClick={() => handleQuickAction('deals')} className="whitespace-nowrap bg-[#202c33] text-slate-300 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-amber-400" /> {t('অফার', 'Deals')}
                </button>
                <button onClick={() => handleQuickAction('delivery')} className="whitespace-nowrap bg-[#202c33] text-slate-300 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-teal-400" /> {t('ডেলিভারি', 'Delivery')}
                </button>
                <button onClick={() => handleLaunchBackendCall()} className="whitespace-nowrap bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1">
                  <PhoneCall className="w-3 h-3" /> {t('লাইভ কল', 'Call Desk')}
                </button>
              </div>

              <div className="bg-[#202c33] p-2.5 flex items-center gap-2 border-t border-[#2a3942] shrink-0">
                <input
                  type="text"
                  placeholder={t('আপনার প্রশ্ন লিখুন (যেমন: delivery, cod, BD-98241)...', 'Message support (e.g. delivery, discount, BD-98241)...')}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-[#2a3942] text-white placeholder-slate-400 text-xs rounded-full px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-w-0"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isSending}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* TAB 2: BROWSER CALL TO BACKEND ASSISTANT DESK */}
          {activeTab === 'call' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 text-slate-200">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/70 to-slate-900 border border-emerald-500/30 text-center space-y-3">
                <div className="w-14 h-14 rounded-full mx-auto bg-emerald-600/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400">
                  <Headphones className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {t('সরাসরি কাস্টমার কেয়ার ও অ্যাসিস্ট্যান্ট কল', 'Live Browser Support Call')}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {t(
                      'ব্রাউজার থেকেই সরাসরি আমাদের অ্যাডমিন অ্যাসিস্ট্যান্ট ডেস্কে কল করুন এবং লাইভ কথা বলুন।',
                      'Call our backend support assistant directly from your browser with full live transcript and voice.'
                    )}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleLaunchBackendCall()}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{t('অ্যাসিস্ট্যান্ট ডেস্কে ব্রাউজার কল করুন', 'Call Support Assistant Desk')}</span>
                  </button>

                  <button
                    onClick={playVoiceSample}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>
                      {isPlayingVoiceSample
                        ? t('ভয়েস স্যাম্পল চলছে...', 'Playing Sample...')
                        : t('এআই ভয়েস টেস্ট করুন', 'Test AI Voice Sample')}
                    </span>
                  </button>
                </div>
              </div>

              {orders.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    {t('অর্ডার সম্পর্কিত ব্রাউজার কল:', 'Call About Recent Order:')}
                  </span>
                  {orders.slice(0, 2).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-emerald-400">#{ord.id}</span>
                        <p className="text-[11px] text-slate-300 truncate tabular-nums">{ord.customer.name} · ৳{ord.pricing.total}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleLaunchBackendCall(ord)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold cursor-pointer"
                        >
                          {t('অ্যাসিস্ট্যান্ট কল', 'Desk Call')}
                        </button>
                        <button
                          onClick={() => {
                            setIsWhatsAppOpen(false);
                            startAICall(ord);
                          }}
                          className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold cursor-pointer border border-slate-700"
                        >
                          {t('এআই কল', 'AI Call')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SPIN WHEEL OFFERS */}
          {activeTab === 'spin' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950 text-slate-200">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase bg-black/25 px-2 py-0.5 rounded-full text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {t('লাকি স্পিন অফার', 'Lucky Spin Wheel')}
                  </span>
                  <span className="text-xs font-bold tabular-nums">
                    {t(`বাকি: ${remainingSpinsToday} বার`, `Left: ${remainingSpinsToday}`)}
                  </span>
                </div>
                <h4 className="font-bold text-sm">
                  {t('স্পিন ঘুরিয়ে গিফট ওয়ালেট ক্যাশ জিতুন!', 'Spin & Win Instant Gift Wallet Cash!')}
                </h4>
                <button
                  onClick={() => {
                    setIsWhatsAppOpen(false);
                    setIsSpinOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer shadow"
                >
                  {t('লাকি স্পিন হুইল ওপেন করুন', 'Open Spin Wheel Now')}
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  {t('আজকের স্পিন পুরস্কারসমূহ:', 'Available Spin Rewards:')}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {spinRewards.slice(0, 6).map((r) => (
                    <div key={r.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <span className="font-bold text-emerald-400 block">{lang === 'bn' ? r.labelBn : r.labelEn}</span>
                      <span className="font-mono text-[10px] text-slate-400">{r.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ALL FLASH SALE PRODUCTS */}
          {activeTab === 'flash' && (
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-slate-950 text-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  {t(`সকল ফ্ল্যাশ সেল পণ্য (${flashSaleProducts.length})`, `All Flash Sale Deals (${flashSaleProducts.length})`)}
                </span>
              </div>

              {flashSaleProducts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">
                  {t('বর্তমানে কোনো ফ্ল্যাশ সেল পণ্য সক্রিয় নেই।', 'No active flash sale products right now.')}
                </p>
              ) : (
                <div className="space-y-2">
                  {flashSaleProducts.map((p) => {
                    const disc = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
                    return (
                      <div key={p.id} className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          onClick={() => {
                            openProductPage(p);
                            setIsWhatsAppOpen(false);
                          }}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 cursor-pointer border border-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            onClick={() => {
                              openProductPage(p);
                              setIsWhatsAppOpen(false);
                            }}
                            className="text-xs font-bold text-white truncate cursor-pointer hover:text-emerald-400"
                          >
                            {lang === 'bn' ? p.titleBn : p.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 tabular-nums">
                            <span className="text-xs font-bold text-emerald-400 font-mono">৳{p.price}</span>
                            {disc > 0 && (
                              <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded">
                                -{disc}%
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            openOneClickCheckout(p);
                            setIsWhatsAppOpen(false);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Zap className="w-3 h-3 text-amber-300" />
                          <span>{t('অর্ডার', 'Order')}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
