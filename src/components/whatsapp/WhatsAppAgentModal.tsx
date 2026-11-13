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
  Sparkles
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  textBn?: string;
  time: string;
  quickActions?: { label: string; action: string }[];
}

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
    setIsSpinOpen,
    remainingSpinsToday,
    spinRewards,
    startAICall,
    playVoiceSample,
    isPlayingVoiceSample,
    customerProfile,
    setSelectedProductForPage,
    lang,
    t
  } = useStore();

  const [activeTab, setActiveTab] = useState<'chat' | 'call' | 'spin' | 'flash'>('chat');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: `Hello! Assalamu Alaikum 👋 Welcome to ${settings.storeName} AI Support. How can I help you today?`,
      textBn: `আসসালামু আলাইকুম 👋 ${settings.storeNameBn || settings.storeName}-এর এআই সাপোর্ট সেন্টারে স্বাগতম। কীভাবে সাহায্য করতে পারি?`,
      time: 'Just now',
      quickActions: [
        { label: '📦 ট্র্যাক অর্ডার', action: 'track' },
        { label: '🔥 ফ্ল্যাশ ডিলস', action: 'deals' },
        { label: '🚚 ডেলিভারি চার্জ', action: 'delivery' },
        { label: '🎡 স্পিন অফার', action: 'open_spin' }
      ]
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, activeTab]);

  const flashSaleProducts = products.filter((p) => p.isFlashSale);

  const handleLaunchBrowserSupportCall = (orderToCall?: Order) => {
    if (orderToCall) {
      setIsWhatsAppOpen(false);
      startAICall(orderToCall);
      return;
    }

    const supportOrder: Order = {
      id: `SUP-${Math.floor(10000 + Math.random() * 90000)}`,
      customer: {
        name: customerProfile.name || t('সম্মানিত গ্রাহক', 'Valued Customer'),
        phone: customerProfile.phone || settings.hotline,
        address: customerProfile.address || 'Dhaka, Bangladesh',
        district: customerProfile.district || 'Dhaka - Inside City',
        thana: 'Customer Care Desk'
      },
      items: products[0]
        ? [
            {
              productId: products[0].id,
              productTitle: products[0].title,
              productTitleBn: products[0].titleBn,
              price: products[0].price,
              quantity: 1,
              image: products[0].images[0]
            }
          ]
        : [],
      pricing: { subtotal: 0, deliveryFee: 0, discount: 0, total: 0 },
      payment: { method: 'cod', status: 'pending' },
      deliveryZone: 'dhaka_inside',
      status: 'pending',
      aiCallStatus: { called: false },
      courier: {
        provider: 'Steadfast',
        trackingCode: 'SUPPORT-CALL',
        status: 'booked',
        currentLocation: 'Support Center',
        estimatedDelivery: 'Instant',
        history: []
      },
      createdAt: new Date().toISOString()
    };

    setIsWhatsAppOpen(false);
    startAICall(supportOrder);
  };

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    setTimeout(async () => {
      await generateBotResponse(query);
      setIsTyping(false);
    }, 550);
  };

  const generateBotResponse = async (query: string) => {
    const q = query.toLowerCase();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const orderMatch = query.match(/BD-\d{5}/i);
    const phoneMatch = query.match(/01[3-9]\d{8}/);

    if (orderMatch || phoneMatch || q.includes('track') || q.includes('ট্র্যাক') || q.includes('অর্ডার') || q.includes('parcel')) {
      const searchTarget = orderMatch ? orderMatch[0].toUpperCase() : phoneMatch ? phoneMatch[0] : '';
      const matchedOrder = orders.find(
        (o) =>
          o.id.toUpperCase() === searchTarget ||
          (phoneMatch && o.customer.phone.includes(phoneMatch[0]))
      );

      if (matchedOrder) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'bot',
            text: `📦 Found Order #${matchedOrder.id}!\nStatus: ${matchedOrder.status.toUpperCase()}\nCourier: ${matchedOrder.courier.provider} (${matchedOrder.courier.trackingCode})\nLocation: ${matchedOrder.courier.currentLocation}`,
            textBn: `📦 অর্ডার #${matchedOrder.id} পাওয়া গেছে!\nস্ট্যাটাস: ${matchedOrder.status}\nকুরিয়ার: ${matchedOrder.courier.provider} (${matchedOrder.courier.trackingCode})\nঅবস্থান: ${matchedOrder.courier.currentLocation}`,
            time,
            quickActions: [
              { label: '📍 লাইভ ট্র্যাকিং দেখুন', action: `view_track_${matchedOrder.id}` },
              { label: '📞 কল কনফার্মেশন', action: `call_order_${matchedOrder.id}` }
            ]
          }
        ]);
        return;
      } else if (!orderMatch && !phoneMatch) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'bot',
            text: `Please enter your Order ID (e.g. BD-98241) or 11-digit phone number.`,
            textBn: `আপনার অর্ডার আইডি (যেমন: BD-98241) অথবা মোবাইল নম্বরটি লিখুন।`,
            time
          }
        ]);
        return;
      }
    }

    if (q.includes('deal') || q.includes('offer') || q.includes('অফার') || q.includes('হট ডিল')) {
      const topProducts = products.slice(0, 3);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: `🔥 Today's Hot Deals:\n${topProducts.map((p, i) => `${i + 1}. ${p.title} - ৳${p.price}`).join('\n')}`,
          textBn: `🔥 আজকের সেরা অফারসমূহ:\n${topProducts.map((p, i) => `${i + 1}. ${p.titleBn} - ৳${p.price}`).join('\n')}`,
          time,
          quickActions: topProducts.map((p) => ({
            label: `🛒 ${p.titleBn.slice(0, 14)}...`,
            action: `buy_${p.id}`
          }))
        }
      ]);
      return;
    }

    if (q.includes('delivery') || q.includes('চার্জ') || q.includes('কুরিয়ার')) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: `🚚 Inside Dhaka: ৳${settings.deliveryFees.dhakaInside} | Suburbs: ৳${settings.deliveryFees.dhakaSub} | Outside Dhaka: ৳${settings.deliveryFees.dhakaOutside}`,
          textBn: `🚚 ঢাকা সিটিতে: ৳${settings.deliveryFees.dhakaInside} | উপশহর: ৳${settings.deliveryFees.dhakaSub} | ঢাকার বাইরে: ৳${settings.deliveryFees.dhakaOutside}`,
          time
        }
      ]);
      return;
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), sender: 'bot', text: data.reply, textBn: data.reply, time }
          ]);
          return;
        }
      }
    } catch {
      // Fallback
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: `Thank you! You can also test our live Browser Call or Flash Sale tab right above.`,
        textBn: `ধন্যবাদ! আপনি উপরের ট্যাব থেকে ব্রাউজার ভয়েস কল, স্পিন হুইল ও ফ্ল্যাশ সেল পণ্য দেখতে পারেন।`,
        time,
        quickActions: [
          { label: '📞 ব্রাউজার কল', action: 'tab_call' },
          { label: '🔥 ফ্ল্যাশ সেল', action: 'tab_flash' }
        ]
      }
    ]);
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
      setIsWhatsAppOpen(false);
    } else if (action.startsWith('call_order_')) {
      const orderId = action.replace('call_order_', '');
      const ord = orders.find((o) => o.id === orderId);
      if (ord) handleLaunchBrowserSupportCall(ord);
    } else if (action.startsWith('buy_')) {
      const prodId = action.replace('buy_', '');
      const prod = products.find((p) => p.id === prodId);
      if (prod) {
        openOneClickCheckout(prod);
        setIsWhatsAppOpen(false);
      }
    }
  };

  const openRealWhatsApp = () => {
    const text = encodeURIComponent(`Hello ${settings.storeName}, I would like to inquire about products and orders.`);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <>
      {/* Floating Support Launcher - Mobile Responsive Position Above MobileBottomNav */}
      {!isWhatsAppOpen && (
        <button
          onClick={() => setIsWhatsAppOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-3.5 h-12 sm:h-14 rounded-full shadow-2xl shadow-emerald-600/40 flex items-center gap-2 group transition-all duration-300 cursor-pointer border border-emerald-400/40"
          title="BuyOne BD AI Support"
          aria-label="Open AI Support Hub"
        >
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-200 opacity-75"></span>
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-white"></span>
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white/20" />
          </div>
          <span className="text-[11px] font-black hidden sm:inline">AI Support</span>
        </button>
      )}

      {/* Multi-Tab Mobile-Responsive AI Support Modal */}
      {isWhatsAppOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-2.5 left-2.5 sm:left-auto sm:right-6 z-50 sm:w-[405px] h-[540px] max-h-[76vh] md:max-h-[85vh] bg-slate-900 rounded-3xl shadow-2xl border border-emerald-900/40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Top Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-3 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-emerald-600 border-2 border-emerald-400 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
                    alt="AI Bot"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-800 rounded-full" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold flex items-center gap-1.5 truncate">
                  <span className="truncate">{settings.storeName} AI Support</span>
                  <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase shrink-0">
                    24/7
                  </span>
                </h4>
                <p className="text-[10px] text-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t('চ্যাট • ব্রাউজার কল • স্পিন • ফ্ল্যাশ', 'Chat • Browser Call • Spin • Flash')}
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
              <span>{t('এআই চ্যাট', 'AI Chat')}</span>
            </button>
            <button
              onClick={() => setActiveTab('call')}
              className={`py-2.5 px-1 flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer border-b-2 transition-colors ${
                activeTab === 'call' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t('ভয়েস কল', 'Call')}</span>
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

          {/* TAB 1: AI CHAT */}
          {activeTab === 'chat' && (
            <>
              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#0b141a] text-slate-200 text-xs">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-2.5 shadow-md ${
                        msg.sender === 'user'
                          ? 'bg-[#005c4b] text-white rounded-tr-none'
                          : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-[#2a3942]'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed text-xs">
                        {lang === 'bn' ? (msg.textBn || msg.text) : msg.text}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                        <span>{msg.time}</span>
                        {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                      </div>
                    </div>

                    {msg.quickActions && msg.quickActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5 max-w-[92%]">
                        {msg.quickActions.map((qa, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickAction(qa.action)}
                            className="bg-[#202c33] hover:bg-[#2a3942] border border-emerald-600/40 text-emerald-300 text-[10px] font-medium px-2.5 py-1 rounded-full shadow transition-all cursor-pointer"
                          >
                            {qa.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 bg-[#202c33] text-slate-400 text-xs px-3 py-2 rounded-2xl rounded-tl-none w-fit border border-[#2a3942]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
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
                <button onClick={() => setActiveTab('call')} className="whitespace-nowrap bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1">
                  <PhoneCall className="w-3 h-3" /> {t('কল করুন', 'Voice Call')}
                </button>
              </div>

              <div className="bg-[#202c33] p-2.5 flex items-center gap-2 border-t border-[#2a3942] shrink-0">
                <input
                  type="text"
                  placeholder={t('প্রশ্ন লিখুন (যেমন: BD-98241)...', 'Ask AI (e.g. BD-98241)...')}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-[#2a3942] text-white placeholder-slate-400 text-xs rounded-full px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-w-0"
                />
                <button
                  onClick={() => handleSend()}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* TAB 2: BROWSER VOICE CALL LAUNCHER */}
          {activeTab === 'call' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 text-slate-200">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/70 to-slate-900 border border-emerald-500/30 text-center space-y-3">
                <div className="w-16 h-16 rounded-full mx-auto p-0.5 bg-gradient-to-tr from-emerald-400 to-teal-300">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
                    alt="Agent"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">
                    {settings.aiCallSettings.agentName || 'সুমনা'} — {t('সরাসরি ব্রাউজার ভয়েস কল', 'Live Browser AI Voice Call')}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {t(
                      'অর্ডার কনফার্মেশন বা যেকোনো সাহায্যের জন্য সরাসরি ব্রাউজার থেকে কথা বলুন (বাংলা ও ইংরেজি)।',
                      'Start an instant browser voice call with our AI care agent in Bangla or English.'
                    )}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleLaunchBrowserSupportCall()}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 animate-pulse" />
                    <span>{t('এখনই ব্রাউজার কল শুরু করুন', 'Start Browser Voice Call')}</span>
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
                    {t('অর্ডার সহ কল টেস্ট করুন:', 'Call Regarding Recent Order:')}
                  </span>
                  {orders.slice(0, 2).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-emerald-400">#{ord.id}</span>
                        <p className="text-[11px] text-slate-300 truncate">{ord.customer.name} • ৳{ord.pricing.total}</p>
                      </div>
                      <button
                        onClick={() => handleLaunchBrowserSupportCall(ord)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold cursor-pointer shrink-0"
                      >
                        {t('কল করুন', 'Call')}
                      </button>
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
                  <span className="text-[10px] font-black uppercase bg-black/25 px-2 py-0.5 rounded-full text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {t('লাকি স্পিন অফার', 'Lucky Spin Wheel')}
                  </span>
                  <span className="text-xs font-bold">
                    {t(`বাকি: ${remainingSpinsToday} বার`, `Left: ${remainingSpinsToday}`)}
                  </span>
                </div>
                <h4 className="font-black text-sm">
                  {t('স্পিন ঘুরিয়ে গিফট ওয়ালেট ক্যাশ জিতুন!', 'Spin & Win Instant Gift Wallet Cash!')}
                </h4>
                <button
                  onClick={() => {
                    setIsWhatsAppOpen(false);
                    setIsSpinOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer shadow"
                >
                  {t('🎡 লাকি স্পিন হুইল ওপেন করুন', 'Open Spin Wheel Now')}
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  {t('আজকের স্পিন পুরস্কারসমূহ:', 'Available Spin Rewards:')}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {spinRewards.slice(0, 6).map((r) => (
                    <div key={r.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <span className="font-black text-emerald-400 block">{lang === 'bn' ? r.labelBn : r.labelEn}</span>
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
                <span className="text-xs font-black text-rose-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 animate-bounce" />
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
                          onClick={() => {
                            setSelectedProductForPage(p);
                            setIsWhatsAppOpen(false);
                          }}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 cursor-pointer border border-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            onClick={() => {
                              setSelectedProductForPage(p);
                              setIsWhatsAppOpen(false);
                            }}
                            className="text-xs font-bold text-white truncate cursor-pointer hover:text-emerald-400"
                          >
                            {lang === 'bn' ? p.titleBn : p.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-black text-emerald-400 font-mono">৳{p.price}</span>
                            {disc > 0 && (
                              <span className="text-[9px] font-black bg-rose-600 text-white px-1.5 py-0.5 rounded">
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
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer shrink-0"
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
