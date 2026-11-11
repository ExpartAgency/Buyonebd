import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, CheckCheck, Phone, ArrowUpRight, ShoppingBag, Truck, HelpCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

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
    lang,
    t
  } = useStore();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: `Hello! Assalamu Alaikum 👋 Welcome to ${settings.storeName} Official WhatsApp AI Support. How can I help you today?`,
      textBn: `আসসালামু আলাইকুম 👋 ${settings.storeNameBn || settings.storeName}-এর অফিসিয়াল হোয়াটসঅ্যাপ এআই অ্যাসিস্ট্যান্টে আপনাকে স্বাগতম। আমি আপনাকে কীভাবে সাহায্য করতে পারি?`,
      time: 'Just now',
      quickActions: [
        { label: '📦 ট্র্যাক অর্ডার', action: 'track' },
        { label: '🔥 হট ডিলস', action: 'deals' },
        { label: '🚚 ডেলিভারি চার্জ', action: 'delivery' },
        { label: '💬 কাস্টমার কেয়ার', action: 'human' }
      ]
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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

    // Simulate AI thinking and response
    setTimeout(async () => {
      await generateBotResponse(query);
      setIsTyping(false);
    }, 600);
  };

  const generateBotResponse = async (query: string) => {
    const q = query.toLowerCase();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Order tracking inquiry (e.g. BD-98241 or 017...)
    const orderMatch = query.match(/BD-\d{5}/i);
    const phoneMatch = query.match(/01[3-9]\d{8}/);

    if (orderMatch || phoneMatch || q.includes('track') || q.includes('ট্র্যাক') || q.includes('অর্ডার কই') || q.includes('parcel')) {
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
            text: `📦 Found Order #${matchedOrder.id}!\nStatus: ${matchedOrder.status.toUpperCase()}\nCourier: ${matchedOrder.courier.provider} (Tracking: ${matchedOrder.courier.trackingCode})\nCurrent Location: ${matchedOrder.courier.currentLocation}\nEstimated Delivery: ${matchedOrder.courier.estimatedDelivery}`,
            textBn: `📦 আপনার অর্ডার #${matchedOrder.id} পাওয়া গেছে!\nস্ট্যাটাস: ${matchedOrder.status === 'ai_confirmed' ? 'এআই নিশ্চিতকৃত' : matchedOrder.status === 'shipped' ? 'কুরিয়ারে ট্রানজিটে আছে' : 'প্রসেসিং'}\nকুরিয়ার: ${matchedOrder.courier.provider} (ট্র্যাকিং কোড: ${matchedOrder.courier.trackingCode})\nবর্তমান অবস্থান: ${matchedOrder.courier.currentLocation}\nসম্ভাব্য ডেলিভারি: ${matchedOrder.courier.estimatedDelivery}`,
            time,
            quickActions: [
              { label: 'বিস্তারিত ম্যাপ ট্র্যাকিং দেখুন', action: `view_track_${matchedOrder.id}` },
              { label: 'অন্য জিজ্ঞাসা', action: 'help' }
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
            text: `Please provide your 5-digit Order ID (e.g. BD-98241) or the 11-digit mobile number used when placing the order.`,
            textBn: `আপনার ৫ ডিজিটের অর্ডার আইডি (যেমন: BD-98241) অথবা অর্ডার করার সময় যে ১১ ডিজিটের মোবাইল নম্বর দিয়েছিলেন তা লিখুন।`,
            time
          }
        ]);
        return;
      }
    }

    // 2. Hot Deals & Offers
    if (q.includes('deal') || q.includes('offer') || q.includes('অফার') || q.includes('দাম') || q.includes('হট ডিল')) {
      const topProducts = products.slice(0, 3);
      const productListBn = topProducts
        .map((p, i) => `${i + 1}. ${p.titleBn} - ৳${p.price} (আগের দাম: ৳${p.originalPrice})`)
        .join('\n');
      const productListEn = topProducts
        .map((p, i) => `${i + 1}. ${p.title} - ৳${p.price} (Regular: ৳${p.originalPrice})`)
        .join('\n');

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: `🔥 Today's Top Flash Sale Deals:\n\n${productListEn}\n\nClick below to order directly in 1-click!`,
          textBn: `🔥 আজকের সেরা ধামাকা অফার সমূহ:\n\n${productListBn}\n\nযেকোনো পণ্য ১-ক্লিকে অর্ডার করতে নিচে ক্লিক করুন!`,
          time,
          quickActions: topProducts.map((p) => ({
            label: `🛒 ${p.titleBn.slice(0, 15)}... কিনুন`,
            action: `buy_${p.id}`
          }))
        }
      ]);
      return;
    }

    // 3. Delivery charges and delivery time
    if (q.includes('delivery') || q.includes('চার্জ') || q.includes('কবে পাব') || q.includes('সময়') || q.includes('কুরিয়ার')) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: `🚚 Delivery Details:\n• Inside Dhaka: ৳${settings.deliveryFees.dhakaInside} (24-48 Hours)\n• Dhaka Suburbs: ৳${settings.deliveryFees.dhakaSub} (48 Hours)\n• Outside Dhaka: ৳${settings.deliveryFees.dhakaOutside} (48-72 Hours)\n\nWe deliver nationwide across all 64 districts via Steadfast and Pathao Courier with Cash on Delivery!`,
          textBn: `🚚 ডেলিভারি সংক্রান্ত তথ্য:\n• ঢাকা সিটির ভেতরে: ৳${settings.deliveryFees.dhakaInside} (২৪-৪৮ ঘণ্টায় ডেলিভারি)\n• ঢাকা উপশহর (সাভার/গাজীপুর/নারায়ণগঞ্জ): ৳${settings.deliveryFees.dhakaSub}\n• ঢাকার বাইরে সমগ্র বাংলাদেশ: ৳${settings.deliveryFees.dhakaOutside} (২-৩ দিন)\n\nসারা দেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। পার্সেল চেক করে টাকা পরিশোধ করতে পারবেন।`,
          time
        }
      ]);
      return;
    }

    // 4. bKash / Payment info
    if (q.includes('bkash') || q.includes('বিকাশ') || q.includes('nagad') || q.includes('নগদ') || q.includes('পেমেন্ট')) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: `💳 Official Payment Numbers:\n• bKash: ${settings.paymentSettings.bkashMerchant}\n• Nagad: ${settings.paymentSettings.nagadMerchant}\n• Rocket: ${settings.paymentSettings.rocketMerchant}\n\nYou can also pay Cash on Delivery (COD) upon receiving the product.`,
          textBn: `💳 আমাদের অফিসিয়াল পেমেন্ট নম্বর:\n• বিকাশ মার্চেন্ট/পার্সোনাল: ${settings.paymentSettings.bkashMerchant}\n• নগদ: ${settings.paymentSettings.nagadMerchant}\n• রকেট: ${settings.paymentSettings.rocketMerchant}\n\nআপনি চাইলে ১০০% ক্যাশ অন ডেলিভারিতেও (COD) পণ্য হাতে পেয়ে টাকা দিতে পারেন।`,
          time
        }
      ]);
      return;
    }

    // 5. Human support / hotline
    if (q.includes('human') || q.includes('মানুষ') || q.includes('ম্যানেজার') || q.includes('কল') || q.includes('hotline')) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: `📞 Our Customer Support Executives are available 9 AM - 10 PM.\nHotline: ${settings.hotline}\nWhatsApp: +${settings.whatsappNumber}\nEmail: ${settings.supportEmail}`,
          textBn: `📞 আমাদের কাস্টমার কেয়ার প্রতিনিধিরা সকাল ৯টা থেকে রাত ১০টা পর্যন্ত সক্রিয় আছেন।\nহটলাইন: ${settings.hotline}\nহোয়াটসঅ্যাপ: +${settings.whatsappNumber}\nইমেইল: ${settings.supportEmail}`,
          time,
          quickActions: [
            { label: 'হোয়াটসঅ্যাপে সরাসরি মেসেজ দিন', action: 'real_wa' }
          ]
        }
      ]);
      return;
    }

    // Try intelligent human Gemini Chat API
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
            {
              id: Date.now().toString(),
              sender: 'bot',
              text: data.reply,
              textBn: data.reply,
              time,
              quickActions: [
                { label: '📦 ট্র্যাক করুন', action: 'track' },
                { label: '🔥 হট ডিলস', action: 'deals' },
                { label: '💬 কাস্টমার কেয়ার', action: 'human' }
              ]
            }
          ]);
          return;
        }
      }
    } catch {
      // Fallback to local assistant
    }

    // Default polite AI response
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: `Thank you for reaching out! We specialize in fast Bangladesh e-commerce with 1-click checkout and AI auto-call verification. How can I assist you further?`,
        textBn: `আপনার বার্তার জন্য ধন্যবাদ! BuyOne BD-তে রয়েছে ১ ক্লিকে ক্যাশ অন ডেলিভারি অর্ডার এবং দ্রুততম কুরিয়ার ডেলিভারি। আপনি কি অর্ডার ট্র্যাক করতে চান নাকি নতুন কোনো পণ্য দেখতে চান?`,
        time,
        quickActions: [
          { label: 'অর্ডার ট্র্যাক করুন', action: 'track' },
          { label: 'হট ডিলস দেখুন', action: 'deals' },
          { label: 'ডেলিভারি চার্জ', action: 'delivery' }
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
      handleSend(lang === 'bn' ? 'ডেলিভারি চার্জ ও নিয়ম কি?' : 'Delivery charges and rules?');
    } else if (action === 'human') {
      handleSend(lang === 'bn' ? 'কাস্টমার কেয়ার প্রতিনিধির সাথে কথা বলতে চাই' : 'I want to talk to customer care');
    } else if (action.startsWith('view_track_')) {
      const orderId = action.replace('view_track_', '');
      setTrackingSearchQuery(orderId);
      setActiveView('tracking');
      setIsWhatsAppOpen(false);
    } else if (action.startsWith('buy_')) {
      const prodId = action.replace('buy_', '');
      const prod = products.find((p) => p.id === prodId);
      if (prod) {
        openOneClickCheckout(prod);
        setIsWhatsAppOpen(false);
      }
    } else if (action === 'real_wa') {
      openRealWhatsApp();
    }
  };

  const openRealWhatsApp = () => {
    const text = encodeURIComponent(`Hello BuyOne BD, I would like to inquire about products and orders.`);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <>
      {/* Floating WhatsApp Action Icon (Only one clean icon as requested) */}
      {!isWhatsAppOpen && (
        <button
          onClick={() => setIsWhatsAppOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl shadow-emerald-600/40 flex items-center justify-center group transition-all duration-300 cursor-pointer border border-emerald-400/40"
          title="BuyOne BD AI Support"
          aria-label="Open AI Support Chat"
        >
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-200 opacity-75"></span>
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-white"></span>
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white/20" />
          </div>
        </button>
      )}

      {/* WhatsApp Modal Window */}
      {isWhatsAppOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[400px] h-[580px] max-h-[85vh] bg-slate-900 rounded-3xl shadow-2xl border border-emerald-900/40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-3.5 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-emerald-400 overflow-hidden flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
                    alt="AI Bot"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-800 rounded-full" />
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  {settings.storeName} AI Support
                  <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                    AI Bot
                  </span>
                </h4>
                <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t('অনলাইন | তাৎক্ষণিক সমাধান', 'Online | Instant Reply')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={openRealWhatsApp}
                title="Open in WhatsApp Web"
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700/60 rounded-full transition-colors cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsWhatsAppOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700/60 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* WhatsApp chat background body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#0b141a] text-slate-200 text-xs">
            {/* Encryption badge */}
            <div className="flex justify-center my-1">
              <span className="bg-[#182229] text-[#8696a0] text-[10px] px-3 py-1 rounded-lg text-center max-w-[85%] border border-[#222e35]">
                🔒 {t('এই চ্যাটটি এআই অটোমেশন দ্বারা পরিচালিত। সকল তথ্য সুরক্ষিত।', 'This conversation is powered by BuyOne AI Support.')}
              </span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl p-3 shadow-md ${
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
                    {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                </div>

                {/* Quick actions if any */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.quickActions.map((qa, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickAction(qa.action)}
                        className="bg-[#202c33] hover:bg-[#2a3942] border border-emerald-600/40 text-emerald-300 text-[11px] font-medium px-2.5 py-1 rounded-full shadow transition-all cursor-pointer"
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
                <span className="text-[10px] ml-1">{t('টাইপ করছে...', 'Typing...')}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Input chips */}
          <div className="bg-[#111b21] px-3 py-1.5 border-t border-[#222e35] flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleQuickAction('track')}
              className="whitespace-nowrap bg-[#202c33] text-slate-300 hover:text-white px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1"
            >
              <Truck className="w-3 h-3 text-emerald-400" />
              {t('অর্ডার ট্র্যাক', 'Track Order')}
            </button>
            <button
              onClick={() => handleQuickAction('deals')}
              className="whitespace-nowrap bg-[#202c33] text-slate-300 hover:text-white px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1"
            >
              <ShoppingBag className="w-3 h-3 text-amber-400" />
              {t('আজকের অফার', 'Hot Deals')}
            </button>
            <button
              onClick={() => handleQuickAction('delivery')}
              className="whitespace-nowrap bg-[#202c33] text-slate-300 hover:text-white px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3 text-teal-400" />
              {t('ডেলিভারি খরচ', 'Delivery Fee')}
            </button>
            <button
              onClick={() => handleSend(lang === 'bn' ? 'বিকাশ ও পেমেন্ট নম্বর দিন' : 'Payment information')}
              className="whitespace-nowrap bg-[#202c33] text-slate-300 hover:text-white px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1"
            >
              <span>💳</span>
              {t('পেমেন্ট নম্বর', 'Payment')}
            </button>
            <button
              onClick={() => handleQuickAction('human')}
              className="whitespace-nowrap bg-[#202c33] text-slate-300 hover:text-white px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1"
            >
              <span>📞</span>
              {t('হটলাইন', 'Helpline')}
            </button>
          </div>

          {/* Chat Input Bar */}
          <div className="bg-[#202c33] p-2.5 flex items-center gap-2 border-t border-[#2a3942] shrink-0">
            <input
              type="text"
              placeholder={t('এখানে লিখুন (যেমন: BD-98241)...', 'Type your message (e.g. BD-98241)...')}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              className="flex-1 bg-[#2a3942] text-white placeholder-slate-400 text-xs rounded-full px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={() => handleSend()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-full transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
