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
  Headphones,
  MessageSquareText
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
    toggleChatManualMode,
    requestHumanSupport,
    playVoiceSample,
    isPlayingVoiceSample,
    openProductPage,
    aiConfirmOrderByCustomer,
    goHome,
    openAllProductsPage,
    executeAIAgentCommand,
    addToast,
    customerProfile,
    lang,
    t
  } = useStore();

  const [activeTab, setActiveTab] = useState<'chat' | 'call' | 'spin' | 'flash'>('chat');
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [callerName, setCallerName] = useState(customerProfile?.name || '');
  const [callerPhone, setCallerPhone] = useState(customerProfile?.phone || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (customerProfile?.name) setCallerName((prev) => prev || customerProfile.name);
    if (customerProfile?.phone) setCallerPhone((prev) => prev || customerProfile.phone);
  }, [customerProfile?.name, customerProfile?.phone]);

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
      if (/(confirm|কনফার্ম|add to cart|কার্ট|checkout|চেকআউট|track|ট্র্যাক)/i.test(query)) {
        executeAIAgentCommand(query, 'customer').catch(() => {});
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleLaunchBackendCall = (orderToCall?: Order) => {
    setIsWhatsAppOpen(false);
    initiateCustomerBrowserCall(orderToCall || null, {
      name: orderToCall?.customer?.name || callerName.trim() || undefined,
      phone: orderToCall?.customer?.phone || callerPhone.trim() || undefined
    });
  };

  const handleQuickAction = (action: string) => {
    if (action === 'track') {
      handleSend(lang === 'bn' ? 'আমার অর্ডার ট্র্যাক করতে চাই' : 'I want to track my order');
    } else if (action === 'confirm_pending') {
      handleSend(lang === 'bn' ? 'আমার পেন্ডিং অর্ডার কনফার্ম করুন' : 'Confirm my pending order');
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
    } else if (action === 'request_human' || action === 'request_specialist') {
      requestHumanSupport(currentSession?.id);
    } else if (action === 'open_tracking') {
      setActiveView('tracking');
      navigateToPath('/tracking');
      setIsWhatsAppOpen(false);
    } else if (action === 'browse_all') {
      goHome();
      openAllProductsPage();
      setIsWhatsAppOpen(false);
    } else if (action.startsWith('call_order_')) {
      const orderId = action.replace('call_order_', '');
      const ord = orders.find((o) => o.id === orderId);
      handleLaunchBackendCall(ord);
    } else if (action.startsWith('confirm_order_')) {
      const orderId = action.replace('confirm_order_', '');
      const ok = aiConfirmOrderByCustomer(orderId, 'BuyOne BD Support Desk');
      if (ok) {
        addToast(
          'success',
          t('অর্ডার কনফার্ম হয়েছে!', 'Order Confirmed!'),
          `#${orderId}`
        );
      }
    } else if (action.startsWith('buy_')) {
      const prodId = action.replace('buy_', '');
      const prod = products.find((p) => p.id === prodId);
      if (prod) {
        openOneClickCheckout(prod);
        setIsWhatsAppOpen(false);
      }
    } else if (action.startsWith('view_track_') || action.startsWith('track_')) {
      const orderId = action.replace('view_track_', '').replace('track_', '');
      setTrackingSearchQuery(orderId);
      setActiveView('tracking');
      navigateToPath('/tracking');
      setIsWhatsAppOpen(false);
    } else if (action.startsWith('view_')) {
      const prodId = action.replace('view_', '');
      const prod = products.find((p) => p.id === prodId);
      if (prod) {
        openProductPage(prod);
        setIsWhatsAppOpen(false);
      }
    }
  };

  const openRealWhatsApp = () => {
    const text = encodeURIComponent(`Hello ${settings.storeName}, I would like assistance with a product or order.`);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  const formatMessageText = (rawText: string) => {
    if (!rawText) return '';
    if (/support thread ready|write a message or generate an ai reply/i.test(rawText)) {
      return lang === 'bn'
        ? `আসসালামু আলাইকুম! ${settings.storeNameBn || settings.storeName} সাপোর্ট ডেস্কে স্বাগতম। পণ্য, ডেলিভারি চার্জ বা অর্ডার ট্র্যাকিং বিষয়ে আপনার প্রশ্ন লিখুন।`
        : `Assalamu Alaikum! Welcome to ${settings.storeName} Support. Ask about products, nationwide delivery fees, or enter your Order ID to track or confirm.`;
    }
    return rawText
      .replace(/Live human support mode enabled\.?\s*/gi, 'Direct Support Desk connected. ')
      .replace(/হিউম্যান সাপোর্ট/gi, 'সরাসরি সাপোর্ট ডেস্ক')
      .replace(/human/gi, 'specialist');
  };

  return (
    <>
      {/* Floating Concierge Launcher */}
      {!isWhatsAppOpen && (
        <button
          type="button"
          onClick={() => setIsWhatsAppOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-4 h-12 rounded-full shadow-xl shadow-emerald-950/25 flex items-center gap-2 transition-all duration-200 cursor-pointer border border-emerald-500/30"
          title={t('গ্রাহক সহায়তা কেন্দ্র', 'Customer Support')}
          aria-label="Open Customer Support"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs font-semibold hidden sm:inline tracking-wide">
            {t('সাপোর্ট', 'Support')}
          </span>
        </button>
      )}

      {/* Storefront Customer Support Concierge Panel */}
      {isWhatsAppOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-2.5 left-2.5 sm:left-auto sm:right-6 z-50 sm:w-[410px] h-[575px] max-h-[82vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3.5 text-white flex items-center justify-between gap-3 shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate tracking-tight">
                  {settings.storeName} {t('সাপোর্ট ডেস্ক', 'Support')}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentSession?.manualMode
                    ? t('সরাসরি সাপোর্ট বিশেষজ্ঞ যুক্ত আছেন', 'Connected with Live Support Specialist')
                    : t('অর্ডার সহায়তা, ট্র্যাকিং ও সরাসরি কল', 'Order Help, Tracking & Live Assistance')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={openRealWhatsApp}
                title={t('হোয়াটসঅ্যাপে চ্যাট করুন', 'Continue on WhatsApp')}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsWhatsAppOpen(false)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                aria-label="Close Support"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 Navigation Tabs */}
          <div className="grid grid-cols-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`py-2.5 px-1 flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
                activeTab === 'chat'
                  ? 'border-emerald-700 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{t('চ্যাট', 'Chat')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('call')}
              className={`py-2.5 px-1 flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
                activeTab === 'call'
                  ? 'border-emerald-700 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t('কল', 'Call')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('spin')}
              className={`py-2.5 px-1 flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
                activeTab === 'spin'
                  ? 'border-emerald-700 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>{t('অফার স্পিন', 'Rewards')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('flash')}
              className={`py-2.5 px-1 flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
                activeTab === 'flash'
                  ? 'border-emerald-700 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{t('ডিলস', 'Deals')}</span>
            </button>
          </div>

          {/* TAB 1: LIVE SUPPORT CHAT */}
          {activeTab === 'chat' && (
            <>
              {/* Calm Single-Line Concierge Mode Bar */}
              <div className="bg-slate-50 dark:bg-slate-950/70 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-[11px] shrink-0">
                <span className="font-medium text-slate-600 dark:text-slate-300 truncate flex items-center gap-1.5">
                  <MessageSquareText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">
                    {currentSession?.manualMode
                      ? t('সরাসরি সাপোর্ট ডেস্ক সক্রিয়', 'Direct Support Desk Active')
                      : t('স্মার্ট শপিং অ্যাসিস্ট্যান্ট সক্রিয়', 'Smart Shopping Assistant Active')}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!currentSession) return;
                    if (currentSession.manualMode) {
                      toggleChatManualMode(currentSession.id, false);
                    } else {
                      requestHumanSupport(currentSession.id);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] cursor-pointer shrink-0 transition-colors border ${
                    currentSession?.manualMode
                      ? 'bg-emerald-700 border-emerald-700 text-white hover:bg-emerald-800'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400'
                  }`}
                >
                  {currentSession?.manualMode
                    ? t('অটো সহায়তা চালু', 'Switch to Auto Help')
                    : t('সরাসরি ডেস্ক', 'Direct Specialist')}
                </button>
              </div>

              {/* Conversation Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70 dark:bg-slate-950 text-xs">
                {sessionMessages.map((msg, idx) => {
                  const isCust = msg.sender === 'customer';
                  const prevSender = idx > 0 ? sessionMessages[idx - 1].sender : null;
                  const showSenderLabel = !isCust && msg.sender !== prevSender;
                  const safeActions = (msg.quickActions || []).filter(
                    (qa) =>
                      qa.action !== 'open_admin' &&
                      !/admin|হিউম্যান|মানুষ|human/i.test(qa.label)
                  );
                  const displayBody = formatMessageText(lang === 'bn' ? msg.textBn || msg.text : msg.text);

                  return (
                    <div key={msg.id} className={`flex flex-col ${isCust ? 'items-end' : 'items-start'}`}>
                      {showSenderLabel && (
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 px-0.5">
                          {msg.sender === 'assistant'
                            ? t('সাপোর্ট বিশেষজ্ঞ', 'Support Specialist')
                            : `${settings.storeName} ${t('অ্যাসিস্ট্যান্ট', 'Concierge')}`}
                        </span>
                      )}
                      <div
                        className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                          isCust
                            ? 'bg-emerald-700 text-white rounded-br-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed text-[12.5px]">
                          {displayBody}
                        </p>
                        {!isCust && safeActions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            {safeActions.map((qa, qaIdx) => (
                              <button
                                key={`${msg.id}-qa-${qaIdx}`}
                                type="button"
                                onClick={() => handleQuickAction(qa.action)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] cursor-pointer transition-colors"
                              >
                                {qa.label.replace(/👤\s*/g, '')}
                              </button>
                            ))}
                          </div>
                        )}
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] tabular-nums ${
                            isCust ? 'text-emerald-100/80' : 'text-slate-400'
                          }`}
                        >
                          <span>{msg.time}</span>
                          {isCust && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isSending && (
                  <div className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[11px] px-3.5 py-2 rounded-2xl rounded-bl-sm border border-slate-200 dark:border-slate-800">
                    <span>{t('উত্তর তৈরি হচ্ছে...', 'Writing reply...')}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Clean Quick Prompt Bar (No Admin Portal, No Human Labels, No Pill Soup) */}
              <div className="bg-white dark:bg-slate-900 px-3 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] shrink-0">
                <button
                  type="button"
                  onClick={() => handleQuickAction('confirm_pending')}
                  className="whitespace-nowrap bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 px-2.5 py-1 rounded-lg font-medium cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <span>{t('অর্ডার কনফার্ম', 'Confirm Order')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAction('track')}
                  className="whitespace-nowrap bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg font-medium cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <Truck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('ট্র্যাক অর্ডার', 'Track')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAction('deals')}
                  className="whitespace-nowrap bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg font-medium cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <ShoppingBag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('অফার', 'Deals')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAction('delivery')}
                  className="whitespace-nowrap bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg font-medium cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <HelpCircle className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  <span>{t('ডেলিভারি', 'Delivery')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLaunchBackendCall()}
                  className="whitespace-nowrap bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg font-medium cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <PhoneCall className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('কল ডেস্ক', 'Call Desk')}</span>
                </button>
              </div>

              {/* Composer */}
              <div className="bg-white dark:bg-slate-900 px-3 py-2.5 flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <input
                  type="text"
                  placeholder={t('পণ্য, ডেলিভারি বা অর্ডার আইডি লিখুন...', 'Ask about a product, delivery, or Order ID...')}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-w-0"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={isSending || !inputMessage.trim()}
                  aria-label="Send message"
                  className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl cursor-pointer shrink-0 disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* TAB 2: LIVE BROWSER CALL */}
          {activeTab === 'call' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl mx-auto bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {t('সরাসরি ব্রাউজার ভয়েস কল', 'Live Browser Support Call')}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {t(
                      'অতিরিক্ত কোনো অ্যাপ ছাড়াই সরাসরি ব্রাউজার থেকে আমাদের কাস্টমার কেয়ার ডেস্কে কল করুন।',
                      'Connect directly with our customer care desk from your browser with real-time voice support.'
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-left">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      {t('আপনার নাম', 'Your Name')}
                    </label>
                    <input
                      type="text"
                      value={callerName}
                      onChange={(e) => setCallerName(e.target.value)}
                      placeholder={t('নাম লিখুন', 'Caller name')}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      {t('মোবাইল নম্বর', 'Mobile Number')}
                    </label>
                    <input
                      type="tel"
                      value={callerPhone}
                      onChange={(e) => setCallerPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleLaunchBackendCall()}
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{t('সাপোর্ট ডেস্কে কল করুন', 'Call Support Desk')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={playVoiceSample}
                    className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {isPlayingVoiceSample
                        ? t('ভয়েস স্যাম্পল চলছে...', 'Playing Sample...')
                        : t('ভয়েস স্যাম্পল শুনুন', 'Preview Support Voice')}
                    </span>
                  </button>
                </div>
              </div>

              {orders.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    {t('সাম্প্রতিক অর্ডার সম্পর্কে কল:', 'Call About a Recent Order:')}
                  </span>
                  {orders.slice(0, 2).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">#{ord.id}</span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate tabular-nums">
                          {ord.customer.name} · ৳{ord.pricing.total}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLaunchBackendCall(ord)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold cursor-pointer"
                        >
                          {t('কল ডেস্ক', 'Call Desk')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsWhatsAppOpen(false);
                            startAICall(ord);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold cursor-pointer border border-slate-200 dark:border-slate-700"
                        >
                          {t('অটো কল', 'Verify Call')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REWARDS / SPIN */}
          {activeTab === 'spin' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> {t('লাকি স্পিন অফার', 'Daily Rewards Wheel')}
                  </span>
                  <span className="font-mono text-slate-300 tabular-nums">
                    {t(`বাকি: ${remainingSpinsToday} বার`, `Left: ${remainingSpinsToday}`)}
                  </span>
                </div>
                <h4 className="font-bold text-sm">
                  {t('স্পিন ঘুরিয়ে গিফট ওয়ালেট ক্যাশ ও ডিসকাউন্ট জিতুন', 'Spin to Unlock Instant Coupons & Wallet Credit')}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsWhatsAppOpen(false);
                    setIsSpinOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  {t('স্পিন হুইল ওপেন করুন', 'Open Rewards Wheel')}
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {t('পুরস্কার তালিকা:', 'Available Rewards:')}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {spinRewards.slice(0, 6).map((r) => (
                    <div key={r.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block">{lang === 'bn' ? r.labelBn : r.labelEn}</span>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{r.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FLASH DEALS */}
          {activeTab === 'flash' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  {t(`ফ্ল্যাশ সেল পণ্য (${flashSaleProducts.length})`, `Featured Deals (${flashSaleProducts.length})`)}
                </span>
              </div>

              {flashSaleProducts.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-8">
                  {t('বর্তমানে কোনো ফ্ল্যাশ সেল পণ্য সক্রিয় নেই।', 'No active flash deals right now.')}
                </p>
              ) : (
                <div className="space-y-2">
                  {flashSaleProducts.map((p) => {
                    const disc = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
                    return (
                      <div key={p.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          onClick={() => {
                            openProductPage(p);
                            setIsWhatsAppOpen(false);
                          }}
                          className="w-14 h-14 rounded-lg object-cover shrink-0 cursor-pointer border border-slate-200 dark:border-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            onClick={() => {
                              openProductPage(p);
                              setIsWhatsAppOpen(false);
                            }}
                            className="text-xs font-semibold text-slate-900 dark:text-white truncate cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-400"
                          >
                            {lang === 'bn' ? p.titleBn : p.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 tabular-nums">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">৳{p.price}</span>
                            {disc > 0 && (
                              <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                                -{disc}%
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            openOneClickCheckout(p);
                            setIsWhatsAppOpen(false);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Zap className="w-3 h-3" />
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
