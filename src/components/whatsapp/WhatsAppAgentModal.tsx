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
  MessageSquareText,
  Copy,
  Check,
  Link2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { speakClearText } from '../../utils/voiceAudio';
import { Order } from '../../types';

export const WhatsAppAgentModal: React.FC = () => {
  const {
    isWhatsAppOpen,
    setIsWhatsAppOpen,
    settings,
    orders,
    visibleStoreProducts: products,
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
    requestDirectDeskSupport,
    playVoiceSample,
    isPlayingVoiceSample,
    openProductPage,
    aiConfirmOrderByCustomer,
    goHome,
    openAllProductsPage,
    executeAIAgentCommand,
    whatsappProductDraft,
    setWhatsappProductDraft,
    buildProductWhatsAppUrl,
    sendCustomerWhatsAppInquiry,
    submitChatInquiry,
    getPartnerPriceInfo,
    addToast,
    customerProfile,
    lang,
    t
  } = useStore();

  const [activeTab, setActiveTab] = useState<'chat' | 'whatsapp' | 'call' | 'spin' | 'flash'>('chat');
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [callerName, setCallerName] = useState(customerProfile?.name || '');
  const [callerPhone, setCallerPhone] = useState(customerProfile?.phone || '');
  const [waName, setWaName] = useState(customerProfile?.name || '');
  const [waPhone, setWaPhone] = useState(customerProfile?.phone || '');
  const [waMessage, setWaMessage] = useState('');
  const [isSendingWaInquiry, setIsSendingWaInquiry] = useState(false);
  const [waSentReceipt, setWaSentReceipt] = useState(false);
  const [copiedProductUrl, setCopiedProductUrl] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(true);
  const [leadName, setLeadName] = useState(customerProfile?.name || '');
  const [leadCountryCode, setLeadCountryCode] = useState('+880');
  const [leadPhone, setLeadPhone] = useState(customerProfile?.phone || '');
  const [leadQuery, setLeadQuery] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmittedOk, setLeadSubmittedOk] = useState(false);
  const [leadError, setLeadError] = useState('');
  const leadNameRef = useRef<HTMLInputElement>(null);
  const leadPhoneRef = useRef<HTMLInputElement>(null);
  const leadQueryRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (customerProfile?.name) {
      setCallerName((prev) => prev || customerProfile.name);
      setWaName((prev) => prev || customerProfile.name);
      setLeadName((prev) => prev || customerProfile.name);
    }
    if (customerProfile?.phone) {
      setCallerPhone((prev) => prev || customerProfile.phone);
      setWaPhone((prev) => prev || customerProfile.phone);
      setLeadPhone((prev) => prev || customerProfile.phone);
    }
  }, [customerProfile?.name, customerProfile?.phone]);

  const handleLeadInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingLead) return;
    setLeadError('');
    if (!leadName.trim()) {
      setLeadError(t('অনুগ্রহ করে আপনার নাম লিখুন।', 'Please enter your name.'));
      leadNameRef.current?.focus();
      return;
    }
    if (leadPhone.replace(/[^\d]/g, '').length < 6) {
      setLeadError(t('অনুগ্রহ করে সঠিক মোবাইল নম্বর লিখুন।', 'Please enter a valid mobile number.'));
      leadPhoneRef.current?.focus();
      return;
    }
    if (!leadQuery.trim()) {
      setLeadError(t('অনুগ্রহ করে আপনার প্রশ্নটি লিখুন।', 'Please write your question or query.'));
      leadQueryRef.current?.focus();
      return;
    }
    setIsSubmittingLead(true);
    try {
      const attachedProduct = whatsappProductDraft?.product;
      const res = await submitChatInquiry({
        name: leadName.trim(),
        countryCode: leadCountryCode,
        phone: leadPhone.trim(),
        query: leadQuery.trim(),
        productId: attachedProduct?.id,
        productTitle: attachedProduct ? (lang === 'bn' ? attachedProduct.titleBn || attachedProduct.title : attachedProduct.title) : undefined,
        productUrl: whatsappProductDraft?.productUrl
      });
      if (res.success) {
        setLeadSubmittedOk(true);
        setWaName(leadName.trim());
        setWaPhone(`${leadCountryCode}${leadPhone.trim().replace(/^0+/, '')}`);
        sendCustomerChatMessage(`[Inquiry from ${leadName.trim()} (${leadCountryCode} ${leadPhone.trim()})]: ${leadQuery.trim()}`).catch(() => {});
      } else {
        setLeadError(res.error || t('বার্তা পাঠানো যায়নি, আবার চেষ্টা করুন।', 'Could not send inquiry. Please try again.'));
      }
    } catch {
      setLeadError(t('সার্ভারে সংযোগ ব্যর্থ হয়েছে।', 'Connection failed. Please try again.'));
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Automatically open WhatsApp tab and prefill product details + URL when opened from a product page
  useEffect(() => {
    if (isWhatsAppOpen && whatsappProductDraft) {
      setActiveTab('whatsapp');
      setWaSentReceipt(false);
      const { product, variantText, quantity = 1, productUrl } = whatsappProductDraft;
      const pricing = getPartnerPriceInfo(product, quantity);
      const titleText = lang === 'bn' ? product.titleBn || product.title : product.title;
      const prefilled =
        whatsappProductDraft.customMessage ||
        (lang === 'bn'
          ? `আসসালামু আলাইকুম! আমি এই পণ্যটি সম্পর্কে জানতে চাই:\nপণ্য: ${titleText}\nমূল্য: ৳${pricing.unitPrice}${variantText ? `\nভ্যারিয়েন্ট: ${variantText}` : ''}${quantity > 1 ? `\nপরিমাণ: ${quantity} টি` : ''}\nলিংক: ${productUrl}`
          : `Assalamu Alaikum! I would like to inquire about this product:\nProduct: ${titleText}\nPrice: ৳${pricing.unitPrice}${variantText ? `\nVariant: ${variantText}` : ''}${quantity > 1 ? `\nQty: ${quantity}` : ''}\nProduct URL: ${productUrl}`);
      setWaMessage(prefilled);
    }
  }, [isWhatsAppOpen, whatsappProductDraft, lang]);

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
    } else if (action === 'tab_whatsapp') {
      setActiveTab('whatsapp');
    } else if (action === 'tab_flash') {
      setActiveTab('flash');
    } else if (action === 'request_human' || action === 'request_specialist') {
      requestDirectDeskSupport(currentSession?.id);
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
        addToast('success', t('অর্ডার কনফার্ম হয়েছে!', 'Order Confirmed!'), `#${orderId}`);
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

  const getWhatsAppDirectLink = () => {
    if (whatsappProductDraft) {
      return buildProductWhatsAppUrl(whatsappProductDraft.product, {
        variantText: whatsappProductDraft.variantText,
        quantity: whatsappProductDraft.quantity,
        customMessage: waMessage.trim() || undefined
      });
    }
    const cleanNumber = String(settings.whatsappNumber || '8801917942662').replace(/[^\d]/g, '');
    const defaultText =
      waMessage.trim() ||
      (lang === 'bn'
        ? `আসসালামু আলাইকুম ${settings.storeName}, আমি একটি পণ্য বা অর্ডার সম্পর্কে জানতে চাই।`
        : `Assalamu Alaikum ${settings.storeName}, I would like assistance with a product or order.`);
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultText)}`;
  };

  const openRealWhatsApp = () => {
    window.open(getWhatsAppDirectLink(), '_blank', 'noopener,noreferrer');
  };

  const handleSubmitWhatsAppInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSendingWaInquiry) return;
    const messageBody =
      waMessage.trim() ||
      (lang === 'bn'
        ? `আসসালামু আলাইকুম ${settings.storeName}, আমার সহায়তা প্রয়োজন।`
        : `Assalamu Alaikum ${settings.storeName}, I need assistance.`);

    setIsSendingWaInquiry(true);
    try {
      const attachedProduct = whatsappProductDraft?.product;
      const pricing = attachedProduct
        ? getPartnerPriceInfo(attachedProduct, whatsappProductDraft?.quantity || 1)
        : null;
      const ok = await sendCustomerWhatsAppInquiry({
        phone: waPhone.trim() || customerProfile?.phone || '01XXXXXXXXX',
        name: waName.trim() || customerProfile?.name || 'Website Visitor',
        message: messageBody,
        productId: attachedProduct?.id,
        productTitle: attachedProduct ? (lang === 'bn' ? attachedProduct.titleBn : attachedProduct.title) : undefined,
        productPrice: pricing?.unitPrice,
        productUrl: whatsappProductDraft?.productUrl
      });
      if (ok) {
        setWaSentReceipt(true);
      }
    } finally {
      setIsSendingWaInquiry(false);
    }
  };

  const handleCopyAttachedUrl = () => {
    if (!whatsappProductDraft?.productUrl) return;
    navigator.clipboard?.writeText(whatsappProductDraft.productUrl).catch(() => {});
    setCopiedProductUrl(true);
    addToast('success', t('লিংক কপি হয়েছে', 'Product URL copied'), whatsappProductDraft.productUrl);
    setTimeout(() => setCopiedProductUrl(false), 1800);
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
      {/* Floating Concierge & WhatsApp Launcher */}
      {!isWhatsAppOpen && (
        <button
          type="button"
          onClick={() => setIsWhatsAppOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-4 h-12 rounded-full shadow-xl shadow-emerald-950/25 flex items-center gap-2 transition-all duration-200 cursor-pointer border border-emerald-500/30"
          title={t('সাপোর্ট ও WhatsApp চ্যাট', 'Support & WhatsApp Chat')}
          aria-label="Open Support & WhatsApp Chat"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs font-semibold hidden sm:inline tracking-wide whitespace-nowrap">
            {t('সাপোর্ট ও WhatsApp', 'Support & WhatsApp')}
          </span>
        </button>
      )}

      {/* Storefront Customer Support & WhatsApp Concierge Panel */}
      {isWhatsAppOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-2.5 left-2.5 sm:left-auto sm:right-6 z-50 sm:w-[420px] h-[590px] max-h-[84vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3.5 text-white flex items-center justify-between gap-3 shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate tracking-tight">
                  {settings.storeName} {t('সাপোর্ট ও WhatsApp', 'Support & WhatsApp')}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentSession?.manualMode
                    ? t('সরাসরি সাপোর্ট বিশেষজ্ঞ যুক্ত আছেন', 'Connected with Live Support Specialist')
                    : t('লাইভ চ্যাট, WhatsApp, ভয়েস কল ও ট্র্যাকিং', 'Live Chat, WhatsApp, Voice Call & Tracking')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={openRealWhatsApp}
                title={t('সরাসরি WhatsApp অ্যাপ খুলুন', 'Open Official WhatsApp Chat')}
                className="px-2.5 py-1.5 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">WhatsApp</span>
                <ArrowUpRight className="w-3 h-3" />
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

          {/* 5 Navigation Tabs */}
          <div className="grid grid-cols-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`py-2.5 px-1 flex items-center justify-center gap-1 cursor-pointer border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'border-emerald-700 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquareText className="w-3.5 h-3.5 shrink-0" />
              <span>{t('চ্যাট', 'Chat')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('whatsapp')}
              className={`py-2.5 px-1 flex items-center justify-center gap-1 cursor-pointer border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'whatsapp'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('call')}
              className={`py-2.5 px-1 flex items-center justify-center gap-1 cursor-pointer border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'call'
                  ? 'border-emerald-700 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              <span>{t('কল', 'Call')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('spin')}
              className={`py-2.5 px-1 flex items-center justify-center gap-1 cursor-pointer border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'spin'
                  ? 'border-emerald-700 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Gift className="w-3.5 h-3.5 shrink-0" />
              <span>{t('অফার', 'Spin')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('flash')}
              className={`py-2.5 px-1 flex items-center justify-center gap-1 cursor-pointer border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'flash'
                  ? 'border-emerald-700 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span>{t('ডিলস', 'Deals')}</span>
            </button>
          </div>

          {/* TAB 1: LIVE SUPPORT CHAT & INQUIRY FORM */}
          {activeTab === 'chat' && (
            <>
              <div className="bg-slate-50 dark:bg-slate-950/70 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-[11px] shrink-0">
                <span className="font-medium text-slate-600 dark:text-slate-300 truncate flex items-center gap-1.5">
                  <MessageSquareText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">
                    {showInquiryForm
                      ? t('কাস্টমার সহায়তা ফর্ম', 'Customer Support Inquiry Form')
                      : currentSession?.manualMode
                      ? t('সরাসরি সাপোর্ট ডেস্ক সক্রিয়', 'Direct Support Desk Active')
                      : t('স্মার্ট শপিং অ্যাসিস্ট্যান্ট সক্রিয়', 'Smart Shopping Assistant Active')}
                  </span>
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInquiryForm((v) => !v);
                      setLeadSubmittedOk(false);
                    }}
                    className="px-2.5 py-1 rounded-md font-semibold text-[11px] cursor-pointer transition-colors border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-600 whitespace-nowrap"
                  >
                    {showInquiryForm ? t('লাইভ চ্যাট', 'Open Live Chat') : t('ইনকোয়ারি ফর্ম', 'Inquiry Form')}
                  </button>
                  {!showInquiryForm && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentSession) return;
                        if (currentSession.manualMode) {
                          toggleChatManualMode(currentSession.id, false);
                        } else {
                          requestDirectDeskSupport(currentSession.id);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-md font-semibold text-[11px] cursor-pointer shrink-0 transition-colors border whitespace-nowrap ${
                        currentSession?.manualMode
                          ? 'bg-emerald-700 border-emerald-700 text-white hover:bg-emerald-800'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400'
                      }`}
                    >
                      {currentSession?.manualMode
                        ? t('অটো সহায়তা চালু', 'Switch to Auto Help')
                        : t('সরাসরি ডেস্ক', 'Direct Specialist')}
                    </button>
                  )}
                </div>
              </div>

              {showInquiryForm ? (
                <div className="flex-1 overflow-y-auto p-5 bg-white dark:bg-slate-900 flex flex-col justify-between">
                  {!leadSubmittedOk ? (
                    <form onSubmit={handleLeadInquirySubmit} noValidate className="space-y-3.5">
                      <h3 className="text-center font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug px-2">
                        {t('আমরা আপনাকে কীভাবে সাহায্য করতে পারি?', 'Let us know if we can help you with anything at all.')}
                      </h3>

                      {leadError && (
                        <div className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
                          {leadError}
                        </div>
                      )}

                      <div className="space-y-3">
                        <input
                          ref={leadNameRef}
                          type="text"
                          value={leadName}
                          onChange={(e) => {
                            setLeadName(e.target.value);
                            if (leadError) setLeadError('');
                          }}
                          placeholder={t('আপনার নাম লিখুন', 'Enter your name')}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50]"
                        />

                        <div className="flex items-stretch gap-2">
                          <select
                            value={leadCountryCode}
                            onChange={(e) => setLeadCountryCode(e.target.value)}
                            aria-label="Country code"
                            className="w-24 px-2 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#4CAF50]"
                          >
                            <option value="+880">+880</option>
                            <option value="+91">+91</option>
                            <option value="+1">+1</option>
                            <option value="+44">+44</option>
                            <option value="+971">+971</option>
                            <option value="+966">+966</option>
                            <option value="+60">+60</option>
                          </select>
                          <input
                            ref={leadPhoneRef}
                            type="tel"
                            value={leadPhone}
                            onChange={(e) => {
                              setLeadPhone(e.target.value);
                              if (leadError) setLeadError('');
                            }}
                            placeholder={t('আপনার মোবাইল নম্বর লিখুন', 'Enter your mobile number')}
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50]"
                          />
                        </div>

                        <div className="space-y-2">
                          <textarea
                            ref={leadQueryRef}
                            rows={3}
                            value={leadQuery}
                            onChange={(e) => {
                              setLeadQuery(e.target.value);
                              if (leadError) setLeadError('');
                            }}
                            placeholder={t('আপনার প্রশ্নটি এখানে লিখুন', 'Write your query here')}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] resize-none"
                          />

                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {[
                                t('দাম ও ডিসকাউন্ট?', 'Price & Discount?'),
                                t('ডেলিভারি সময়?', 'Delivery time?'),
                                t('অর্ডার স্ট্যাটাস', 'Order status')
                              ].map((chip) => (
                                <button
                                  key={chip}
                                  type="button"
                                  onClick={() => setLeadQuery((prev) => (prev.trim() ? `${prev.trim()} — ${chip}` : chip))}
                                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-[11px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                                >
                                  + {chip}
                                </button>
                              ))}
                            </div>

                            <button
                              type="submit"
                              disabled={isSubmittingLead}
                              title={t('পাঠান', 'Send Query')}
                              aria-label="Send Inquiry"
                              className="w-11 h-11 rounded-full bg-[#4CAF50] hover:bg-[#43A047] disabled:opacity-60 text-white shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-95 shrink-0"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setShowInquiryForm(false)}
                          className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                        >
                          {t('সরাসরি লাইভ চ্যাট খুলুন →', 'Switch to Live Chat →')}
                        </button>
                        <a
                          href={getWhatsAppDirectLink()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{t('WhatsApp অ্যাপে চ্যাট', 'Open WhatsApp')}</span>
                        </a>
                      </div>
                    </form>
                  ) : (
                    <div className="my-auto p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-[#4CAF50] text-white mx-auto flex items-center justify-center shadow">
                        <Check className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {t('আপনার মেসেজ সফলভাবে পাঠানো হয়েছে!', 'Your inquiry has been submitted!')}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {t(
                            'আমাদের টিম শীঘ্রই আপনাকে রিপ্লাই দেবে। চাইলে এখনই লাইভ চ্যাটে কথা বলতে পারেন।',
                            'Our support team received your request on the Admin Dashboard and will reply shortly.'
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowInquiryForm(false);
                            setLeadQuery('');
                          }}
                          className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                        >
                          {t('লাইভ চ্যাটে উত্তর দেখুন', 'Continue in Live Chat')}
                        </button>
                        <a
                          href={`https://wa.me/${String(settings.whatsappNumber || '8801917942662').replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                            `Name: ${leadName}\nPhone: ${leadCountryCode}${leadPhone}\nQuery: ${leadQuery}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{t('WhatsApp অ্যাপে পাঠান', 'Continue on WhatsApp App')}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setLeadSubmittedOk(false);
                            setLeadQuery('');
                          }}
                          className="text-[11px] text-slate-500 hover:underline cursor-pointer pt-1"
                        >
                          {t('আরেকটি প্রশ্ন পাঠান', 'Send another query')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>

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
                          className={`flex items-center justify-between gap-2 mt-1 text-[10px] tabular-nums ${
                            isCust ? 'text-emerald-100/80' : 'text-slate-400'
                          }`}
                        >
                          {!isCust ? (
                            <button
                              type="button"
                              onClick={() =>
                                speakClearText(displayBody, {
                                  lang: lang === 'en' ? 'en' : 'bn',
                                  voice: settings.aiCallSettings.voiceName || 'Kore'
                                })
                              }
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                              title={t('ভয়েসে শুনুন', 'Listen Clear Voice')}
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>{t('শুনুন', 'Listen')}</span>
                            </button>
                          ) : (
                            <span />
                          )}
                          <div className="flex items-center gap-1">
                            <span>{msg.time}</span>
                            {isCust && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                          </div>
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

              {/* Clean Quick Prompt Bar */}
              <div className="bg-white dark:bg-slate-900 px-3 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('whatsapp')}
                  className="whitespace-nowrap bg-emerald-600 text-white hover:bg-emerald-500 px-2.5 py-1 rounded-lg font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp Chat</span>
                </button>
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
            </>
          )}

          {/* TAB 2: WHATSAPP DIRECT CHAT & PRODUCT INQUIRY */}
          {activeTab === 'whatsapp' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
              {/* Official WhatsApp Direct Banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/95 border border-emerald-700/50 text-white space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">
                        {t('অফিসিয়াল WhatsApp সাপোর্ট ও অর্ডার চ্যাট', 'Official WhatsApp Order & Product Chat')}
                      </h5>
                      <p className="text-[11px] font-mono text-emerald-300 tabular-nums">
                        +{String(settings.whatsappNumber || '8801917942662').replace(/[^\d]/g, '')}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openRealWhatsApp}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {whatsappProductDraft
                      ? t('পণ্যের লিংকসহ WhatsApp অ্যাপে চ্যাট করুন', 'Open WhatsApp App with Product Link')
                      : t('সরাসরি WhatsApp অ্যাপে চ্যাট করুন', 'Start Live WhatsApp App Chat')}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Attached Product Context Card */}
              {whatsappProductDraft && (
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/70 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      {t('সংযুক্ত পণ্য ও লাইভ URL', 'Attached Product & Live URL')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWhatsappProductDraft(null)}
                      className="text-[10px] text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      {t('সরান', 'Clear')}
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {whatsappProductDraft.product.images?.[0]?.trim() ? (
                      <img
                        src={whatsappProductDraft.product.images[0]}
                        alt={whatsappProductDraft.product.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {lang === 'bn'
                          ? whatsappProductDraft.product.titleBn || whatsappProductDraft.product.title
                          : whatsappProductDraft.product.title}
                      </p>
                      <p className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        ৳{getPartnerPriceInfo(whatsappProductDraft.product, whatsappProductDraft.quantity || 1).unitPrice}
                        {whatsappProductDraft.variantText ? ` · ${whatsappProductDraft.variantText}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5">
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 truncate flex-1">
                      {whatsappProductDraft.productUrl}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAttachedUrl}
                      className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {copiedProductUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedProductUrl ? t('কপিড', 'Copied') : t('কপি', 'Copy')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Direct Storefront -> WhatsApp Support Desk Inquiry Form */}
              <form
                onSubmit={handleSubmitWhatsAppInquiry}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    {t('ওয়েবসাইট থেকে সরাসরি WhatsApp ডেস্কে বার্তা পাঠান', 'Send Message to Our WhatsApp Support Desk')}
                  </h5>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      {t('আপনার নাম', 'Your Name')}
                    </label>
                    <input
                      type="text"
                      value={waName}
                      onChange={(e) => setWaName(e.target.value)}
                      placeholder={t('নাম লিখুন', 'Full name')}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      {t('আপনার WhatsApp নম্বর', 'Your WhatsApp Number')}
                    </label>
                    <input
                      type="tel"
                      required
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {t('বার্তা (পণ্যের URL সহ)', 'Message (Includes Product URL)')}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    placeholder={t(
                      'পণ্য, সাইজ, ডেলিভারি বা অর্ডার সম্পর্কে লিখুন...',
                      'Ask about price, size, delivery or share a product inquiry...'
                    )}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingWaInquiry}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-700 hover:bg-slate-800 dark:hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSendingWaInquiry
                      ? t('পাঠানো হচ্ছে...', 'Sending...')
                      : t('WhatsApp সাপোর্ট ডেস্কে পাঠান', 'Send to WhatsApp Support Desk')}
                  </span>
                </button>

                {waSentReceipt && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold text-center bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg py-1.5 px-2">
                    {t(
                      'আপনার বার্তা সাপোর্ট ডেস্কে পৌঁছেছে। শীঘ্রই WhatsApp-এ উত্তর পাবেন।',
                      'Inquiry delivered to our WhatsApp Support Desk. We will reply to your WhatsApp shortly.'
                    )}
                  </p>
                )}
              </form>
            </div>
          )}

          {/* TAB 3: LIVE BROWSER CALL */}
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

          {/* TAB 4: REWARDS / SPIN */}
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

          {/* TAB 5: FLASH DEALS */}
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
                        {p.images?.[0]?.trim() ? (
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
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700" />
                        )}
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
