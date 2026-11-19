import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Users,
  ShoppingBag,
  Settings,
  ChevronDown,
  ChevronUp,
  Save,
  ClipboardPaste,
  PhoneCall,
  Bot,
  CheckCircle2,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, ResellerAccount, WhatsAppChatMessage } from '../../types';

interface UnifiedWhatsAppContact {
  phone: string; // normalized 11-digit key where possible
  displayPhone: string;
  name: string;
  type: 'reseller' | 'customer';
  reseller?: ResellerAccount;
  orders: Order[];
  totalSpent: number;
  district?: string;
  lastMessage?: WhatsAppChatMessage;
}

interface WhatsAppSupportConsoleProps {
  initialPhone?: string;
  initialFilter?: 'all' | 'reseller' | 'customer';
}

const normPhone = (val?: string) => {
  const digits = String(val || '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  return digits.length >= 11 ? digits.slice(-11) : digits;
};

const toIntlWaPhone = (val: string) => {
  const digits = String(val || '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  return digits.startsWith('88') ? digits : digits.startsWith('0') ? `88${digits}` : `880${digits}`;
};

export const WhatsAppSupportConsole: React.FC<WhatsAppSupportConsoleProps> = ({
  initialPhone,
  initialFilter = 'all'
}) => {
  const {
    settings,
    updateSettings,
    saveSettingsChanges,
    resellers,
    orders,
    customerAccounts,
    whatsappMessages,
    sendMetaWhatsAppMessage,
    generateWhatsAppAiDraft,
    adminLang,
    addToast
  } = useStore();

  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);

  const [filterType, setFilterType] = useState<'all' | 'reseller' | 'customer'>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhone, setSelectedPhone] = useState<string>(() => normPhone(initialPhone));
  const [customPhoneInput, setCustomPhoneInput] = useState('');
  const [customNameInput, setCustomNameInput] = useState('');
  const [customRoleInput, setCustomRoleInput] = useState<'reseller' | 'customer'>('customer');
  const [showCustomDialer, setShowCustomDialer] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [draftText, setDraftText] = useState('');
  const [lastAiGenerated, setLastAiGenerated] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedOrderInfo, setCopiedOrderInfo] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(Boolean(initialPhone));

  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialPhone) {
      const p = normPhone(initialPhone);
      if (p) {
        setSelectedPhone(p);
        setMobileShowThread(true);
      }
    }
  }, [initialPhone]);

  const cloudCfg = settings.marketingSettings?.whatsappCloudApi || {
    enabled: false,
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
    verifyToken: 'buyonebd_meta_verify_2026',
    defaultTemplate: 'order_confirmed_bd',
    apiVersion: 'v21.0'
  };

  const patchCloudCfg = (partial: Partial<typeof cloudCfg>) => {
    updateSettings({
      marketingSettings: {
        ...settings.marketingSettings,
        whatsappCloudApi: {
          ...cloudCfg,
          ...partial
        }
      }
    });
  };

  // Build unified directory of Resellers + Customers + Inbound/Outbound WhatsApp contacts
  const contacts = useMemo<UnifiedWhatsAppContact[]>(() => {
    const map = new Map<string, UnifiedWhatsAppContact>();

    const ensureEntry = (
      rawPhone: string,
      name: string,
      type: 'reseller' | 'customer',
      extras?: Partial<UnifiedWhatsAppContact>
    ) => {
      const key = normPhone(rawPhone);
      if (!key) return null;
      const existing = map.get(key);
      if (!existing) {
        const created: UnifiedWhatsAppContact = {
          phone: key,
          displayPhone: rawPhone || key,
          name: name || key,
          type,
          orders: [],
          totalSpent: 0,
          ...extras
        };
        map.set(key, created);
        return created;
      }
      if (type === 'reseller') existing.type = 'reseller';
      if (extras?.reseller) existing.reseller = extras.reseller;
      if (extras?.district && !existing.district) existing.district = extras.district;
      if (name && existing.name === existing.phone) existing.name = name;
      return existing;
    };

    resellers.forEach((r) => {
      ensureEntry(r.phone, r.name, 'reseller', {
        reseller: r,
        district: r.district
      });
    });

    orders.forEach((ord) => {
      const key = normPhone(ord.customer?.phone);
      if (!key) return;
      const resMatch = ord.resellerId
        ? resellers.find((r) => r.id === ord.resellerId)
        : undefined;
      const targetPhone = resMatch ? normPhone(resMatch.phone) : key;
      const entry = ensureEntry(
        targetPhone,
        resMatch ? resMatch.name : ord.customer?.name || key,
        resMatch ? 'reseller' : 'customer',
        { district: ord.customer?.district, reseller: resMatch }
      );
      if (entry) {
        entry.orders.push(ord);
        entry.totalSpent += ord.pricing?.total || 0;
      }
      // Also keep end-customer selectable if it was a reseller order
      if (resMatch && key !== targetPhone) {
        const custEntry = ensureEntry(key, ord.customer?.name || key, 'customer', {
          district: ord.customer?.district
        });
        if (custEntry) {
          custEntry.orders.push(ord);
          custEntry.totalSpent += ord.pricing?.total || 0;
        }
      }
    });

    customerAccounts.forEach((c) => {
      ensureEntry(c.phone, c.name || c.phone, 'customer', { district: c.district });
    });

    whatsappMessages.forEach((m) => {
      const key = normPhone(m.phone);
      if (!key) return;
      const entry = ensureEntry(key, m.contactName || key, m.contactType || 'customer');
      if (entry) {
        if (
          !entry.lastMessage ||
          new Date(m.timestamp).getTime() >= new Date(entry.lastMessage.timestamp).getTime()
        ) {
          entry.lastMessage = m;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const ta = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const tb = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
      if (ta !== tb) return tb - ta;
      if (a.type !== b.type) return a.type === 'reseller' ? -1 : 1;
      return b.orders.length - a.orders.length;
    });
  }, [resellers, orders, customerAccounts, whatsappMessages]);

  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return contacts.filter((c) => {
      if (filterType !== 'all' && c.type !== filterType) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.reseller?.resellerCode || '').toLowerCase().includes(q) ||
        (c.district || '').toLowerCase().includes(q) ||
        c.orders.some((o) => o.id.toLowerCase().includes(q))
      );
    });
  }, [contacts, filterType, searchQuery]);

  // Select first contact if none chosen yet
  useEffect(() => {
    if (!selectedPhone && filteredContacts.length > 0) {
      setSelectedPhone(filteredContacts[0].phone);
    }
  }, [filteredContacts, selectedPhone]);

  const activeContact = useMemo<UnifiedWhatsAppContact | null>(() => {
    if (!selectedPhone) return null;
    const found = contacts.find((c) => c.phone === selectedPhone);
    if (found) return found;
    return {
      phone: selectedPhone,
      displayPhone: selectedPhone,
      name: customNameInput.trim() || selectedPhone,
      type: customRoleInput,
      orders: [],
      totalSpent: 0
    };
  }, [contacts, selectedPhone, customNameInput, customRoleInput]);

  // Sort contact's orders newest first
  const contactOrders = useMemo(() => {
    if (!activeContact) return [];
    return [...activeContact.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [activeContact]);

  useEffect(() => {
    if (contactOrders.length > 0) {
      setSelectedOrderId((prev) =>
        contactOrders.some((o) => o.id === prev) ? prev : contactOrders[0].id
      );
    } else {
      setSelectedOrderId('');
    }
  }, [activeContact?.phone, contactOrders]);

  const activeOrder = useMemo(
    () => contactOrders.find((o) => o.id === selectedOrderId) || contactOrders[0] || null,
    [contactOrders, selectedOrderId]
  );

  const threadMessages = useMemo(() => {
    if (!activeContact) return [];
    return whatsappMessages
      .filter((m) => normPhone(m.phone) === activeContact.phone)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [whatsappMessages, activeContact]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages.length, activeContact?.phone]);

  // Format clean Order Info string for quick copy or insertion into reply
  const formatOrderInfoSummary = (ord: Order | null, reseller?: ResellerAccount) => {
    const storeName = settings.storeName || 'BuyOne BD';
    const hotline = settings.hotline || '+8801917942662';
    if (!ord) {
      if (reseller) {
        return [
          `[${storeName} Reseller Info]`,
          `Name: ${reseller.name} (${reseller.resellerCode})`,
          `Phone: ${reseller.phone} | District: ${reseller.district}`,
          `Status: ${reseller.status.toUpperCase()} | Commission: ${reseller.commissionPercent}%`,
          `Wallet Balance: ৳${reseller.walletBalance.toLocaleString()} | Orders: ${reseller.totalOrders}`,
          `Support: ${hotline}`
        ].join('\n');
      }
      return '';
    }
    const itemsList = (ord.items || [])
      .map((it) => `• ${it.productTitleBn || it.productTitle} x${it.quantity} (৳${(it.price * it.quantity).toLocaleString()})`)
      .join('\n');
    const lines = [
      `Order #${ord.id} — ${storeName}`,
      `Customer: ${ord.customer.name} (${ord.customer.phone})`,
      `Address: ${ord.customer.address}, ${ord.customer.district}`,
      `Items:\n${itemsList}`,
      `Total: ৳${ord.pricing.total.toLocaleString()} (Due: ৳${ord.payment.dueAmount ?? 0})`,
      `Status: ${ord.status.toUpperCase()} | Payment: ${ord.payment.method.toUpperCase()}`,
      `Courier: ${ord.courier?.provider || 'Steadfast'}${ord.courier?.trackingCode ? ` · Tracking: ${ord.courier.trackingCode}` : ''}`
    ];
    if (ord.resellerCode || reseller) {
      lines.push(
        `Reseller: ${ord.resellerName || reseller?.name || ''} (${ord.resellerCode || reseller?.resellerCode || ''}) · Profit: ৳${(ord.resellerProfit || 0).toLocaleString()}`
      );
    }
    lines.push(`Helpline: ${hotline}`);
    return lines.join('\n');
  };

  const handleCopyOrderInfo = async () => {
    if (!activeContact) return;
    const summary = formatOrderInfoSummary(activeOrder, activeContact.reseller);
    if (!summary) {
      addToast('warning', at('কোনো অর্ডার বা প্রোফাইল তথ্য নেই', 'No Order Info Available'), '');
      return;
    }
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedOrderInfo(true);
      setTimeout(() => setCopiedOrderInfo(false), 2000);
      addToast(
        'success',
        at('অর্ডার তথ্য কপি হয়েছে!', 'Order Info Copied!'),
        at('এখন দ্রুত রিপ্লাই বক্স বা যেকোনো চ্যাটে পেস্ট করুন।', 'Ready to paste into quick replies.')
      );
    } catch {
      setDraftText((prev) => (prev ? `${prev}\n\n${summary}` : summary));
      addToast('info', at('অর্ডার তথ্য মেসেজ বক্সে যুক্ত হয়েছে', 'Order Info Inserted in Reply Box'), '');
    }
  };

  const handleInsertOrderInfo = () => {
    if (!activeContact) return;
    const summary = formatOrderInfoSummary(activeOrder, activeContact.reseller);
    if (!summary) return;
    setDraftText((prev) => (prev.trim() ? `${prev.trim()}\n\n${summary}` : summary));
  };

  const handleAiGenerate = async (intent: string) => {
    if (!activeContact) return;
    setIsGeneratingAi(true);
    try {
      const reply = await generateWhatsAppAiDraft({
        contactName: activeContact.name,
        contactType: activeContact.type,
        resellerInfo: activeContact.reseller || null,
        latestOrder: activeOrder,
        intent,
        customPrompt: draftText.trim() || undefined
      });
      if (reply) {
        setDraftText(reply);
        setLastAiGenerated(true);
      } else {
        addToast('error', at('AI ড্রাফট তৈরি হয়নি', 'AI Draft Failed'), at('আবার চেষ্টা করুন', 'Please try again'));
      }
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSendWhatsApp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeContact || !draftText.trim()) return;
    setIsSending(true);
    try {
      const res = await sendMetaWhatsAppMessage({
        to: activeContact.phone,
        message: draftText.trim(),
        contactName: activeContact.name,
        contactType: activeContact.type,
        orderId: activeOrder?.id,
        senderRole: lastAiGenerated ? 'ai' : 'admin'
      });
      if (res.success) {
        setDraftText('');
        setLastAiGenerated(false);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleStartCustomChat = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = normPhone(customPhoneInput);
    if (cleaned.length < 10) {
      addToast('warning', at('সঠিক নম্বর দিন', 'Invalid Phone'), at('কমপক্ষে ১০-১১ সংখ্যার নম্বর দিন', 'Enter 10-11 digit phone number'));
      return;
    }
    setSelectedPhone(cleaned);
    setShowCustomDialer(false);
    setMobileShowThread(true);
  };

  const webhookUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp/webhook` : '/api/whatsapp/webhook';

  const resellerCount = contacts.filter((c) => c.type === 'reseller').length;
  const customerCount = contacts.filter((c) => c.type === 'customer').length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span>{at('ডিরেক্ট হোয়াটসঅ্যাপ API ও AI রিসেলার-কাস্টমার চ্যাট', 'Direct WhatsApp API & AI Support Console')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {at(
              'Meta WhatsApp Cloud API দিয়ে সরাসরি রিসেলার ও কাস্টমারদের সাথে চ্যাট করুন, ১-ক্লিকে Order Info কপি করুন এবং AI রিপ্লাই তৈরি করুন।',
              'Chat directly with resellers & customers via Meta WhatsApp Cloud API, generate AI replies, and copy formatted Order Info in 1 click.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
              cloudCfg.enabled && cloudCfg.phoneNumberId && cloudCfg.accessToken
                ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
                : 'bg-amber-950/60 border-amber-700/60 text-amber-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                cloudCfg.enabled && cloudCfg.phoneNumberId && cloudCfg.accessToken
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <span>
              {cloudCfg.enabled && cloudCfg.phoneNumberId && cloudCfg.accessToken
                ? at('Meta Cloud API লাইভ', 'Meta Cloud API Live')
                : at('স্যান্ডবক্স / ওয়েব মোড', 'Sandbox / wa.me Ready')}
            </span>
          </span>

          <button
            type="button"
            onClick={() => setShowApiConfig((v) => !v)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-emerald-400" />
            <span>{at('WhatsApp API সেটআপ', 'API Setup')}</span>
            {showApiConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Meta WhatsApp Cloud API Credentials Bar */}
      {showApiConfig && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-emerald-800/60 space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <label className="flex items-center gap-2 font-bold text-white cursor-pointer">
              <input
                type="checkbox"
                checked={cloudCfg.enabled}
                onChange={(e) => patchCloudCfg({ enabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span>{at('Meta WhatsApp Cloud API সক্রিয় করুন (v21.0)', 'Enable Live Meta WhatsApp Cloud API (v21.0)')}</span>
            </label>

            <button
              type="button"
              onClick={() =>
                saveSettingsChanges(
                  at('WhatsApp API সেভ হয়েছে!', 'WhatsApp API Credentials Saved!'),
                  at('Meta Cloud API টোকেন ও ওয়েবহুক ডাটাবেজে সংরক্ষিত হয়েছে।', 'Credentials saved to database.')
                )
              }
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{at('API সেটিংস সেভ করুন', 'Save API Config')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Phone Number ID</label>
              <input
                type="text"
                value={cloudCfg.phoneNumberId || ''}
                onChange={(e) => patchCloudCfg({ phoneNumberId: e.target.value })}
                placeholder="e.g. 412985012..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">WABA Business ID</label>
              <input
                type="text"
                value={cloudCfg.wabaId || ''}
                onChange={(e) => patchCloudCfg({ wabaId: e.target.value })}
                placeholder="e.g. 381294..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Access Token (Permanent Bearer)</label>
              <input
                type="password"
                value={cloudCfg.accessToken || ''}
                onChange={(e) => patchCloudCfg({ accessToken: e.target.value })}
                placeholder="EAAxxxxxx..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Webhook Verify Token</label>
              <input
                type="text"
                value={cloudCfg.verifyToken || ''}
                onChange={(e) => patchCloudCfg({ verifyToken: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-slate-300 font-mono truncate">
              Callback URL: <span className="text-emerald-400">{webhookUrl}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(webhookUrl);
                setCopiedWebhook(true);
                setTimeout(() => setCopiedWebhook(false), 1800);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copiedWebhook ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedWebhook ? 'Copied' : 'Copy Webhook URL'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Split Chat Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[600px]">
        {/* Left: Reseller & Customer Directory */}
        <div
          className={`lg:col-span-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden max-h-[680px] ${
            mobileShowThread ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="p-3.5 border-b border-slate-800 space-y-2.5">
            {/* Segment Filter Pills */}
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`py-1.5 px-2 rounded-xl cursor-pointer transition-colors ${
                  filterType === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {at('সব', 'All')} ({contacts.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('reseller')}
                className={`py-1.5 px-2 rounded-xl cursor-pointer transition-colors ${
                  filterType === 'reseller'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {at('রিসেলার', 'Resellers')} ({resellerCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('customer')}
                className={`py-1.5 px-2 rounded-xl cursor-pointer transition-colors ${
                  filterType === 'customer'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {at('কাস্টমার', 'Customers')} ({customerCount})
              </button>
            </div>

            {/* Search + New Phone */}
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={at('নাম, ফোন, কোড বা অর্ডার আইডি...', 'Name, phone, RES code, order #...')}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowCustomDialer((v) => !v)}
                title={at('নতুন নম্বরে মেসেজ করুন', 'Chat with New Phone Number')}
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{at('নতুন', 'New')}</span>
              </button>
            </div>

            {showCustomDialer && (
              <form
                onSubmit={handleStartCustomChat}
                className="p-2.5 rounded-xl bg-slate-950 border border-emerald-800/60 space-y-2 text-xs"
              >
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="tel"
                    required
                    value={customPhoneInput}
                    onChange={(e) => setCustomPhoneInput(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                  <input
                    type="text"
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    placeholder={at('নাম (ঐচ্ছিক)', 'Name (optional)')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value as any)}
                    className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                  >
                    <option value="customer">Customer</option>
                    <option value="reseller">Reseller</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                  >
                    {at('চ্যাট খুলুন', 'Start Chat')}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/70">
            {filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                {at('কোনো রিসেলার বা কাস্টমার পাওয়া যায়নি।', 'No matching resellers or customers.')}
              </div>
            ) : (
              filteredContacts.map((c) => {
                const isSelected = activeContact?.phone === c.phone;
                return (
                  <button
                    key={c.phone}
                    type="button"
                    onClick={() => {
                      setSelectedPhone(c.phone);
                      setMobileShowThread(true);
                    }}
                    className={`w-full p-3.5 text-left transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-950/50 border-l-2 border-emerald-500'
                        : 'hover:bg-slate-950/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white truncate">{c.name}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                            c.type === 'reseller'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {c.type === 'reseller' ? 'Reseller' : 'Customer'}
                        </span>
                        {c.reseller && (
                          <span
                            className={`text-[9px] font-bold uppercase ${
                              c.reseller.status === 'approved'
                                ? 'text-emerald-400'
                                : c.reseller.status === 'suspended'
                                ? 'text-rose-400'
                                : 'text-amber-400'
                            }`}
                          >
                            · {c.reseller.status}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate">
                        {c.phone}
                        {c.reseller?.resellerCode ? ` · ${c.reseller.resellerCode}` : ''}
                        {c.orders.length > 0 ? ` · ${c.orders.length} ord` : ''}
                      </p>
                      {c.lastMessage && (
                        <p className="text-[11px] text-slate-300 truncate">{c.lastMessage.text}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                      {c.lastMessage
                        ? new Date(c.lastMessage.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : c.district?.split(' ')[0] || ''}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Conversation + Order Info Copy + AI Reply Assistant */}
        <div
          className={`lg:col-span-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden max-h-[680px] ${
            mobileShowThread ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {!activeContact ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <MessageCircle className="w-10 h-10 text-emerald-500/50" />
              <p className="text-sm font-bold text-white">
                {at('বাম পাশ থেকে রিসেলার বা কাস্টমার নির্বাচন করুন', 'Select a Reseller or Customer to start WhatsApp chat')}
              </p>
            </div>
          ) : (
            <>
              {/* Active Contact Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileShowThread(false)}
                    className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-200 cursor-pointer"
                    aria-label="Back to list"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    {activeContact.type === 'reseller' ? <Users className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-white truncate">{activeContact.name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          activeContact.type === 'reseller'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {activeContact.type}
                      </span>
                      {activeContact.reseller && (
                        <span className="text-[11px] font-mono text-emerald-400">
                          {activeContact.reseller.resellerCode} · {activeContact.reseller.commissionPercent}% · Wallet ৳
                          {activeContact.reseller.walletBalance.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-slate-400">
                      +{toIntlWaPhone(activeContact.phone)}
                      {activeContact.district ? ` · ${activeContact.district}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`tel:${activeContact.phone}`}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">{at('কল', 'Call')}</span>
                  </a>
                  <a
                    href={`https://wa.me/${toIntlWaPhone(activeContact.phone)}${
                      draftText.trim() ? `?text=${encodeURIComponent(draftText.trim())}` : ''
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>wa.me App</span>
                  </a>
                </div>
              </div>

              {/* Order Info Summary Bar with Prominent 'Copy Order Info' Button */}
              {(activeOrder || activeContact.reseller) && (
                <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    {contactOrders.length > 1 ? (
                      <select
                        value={activeOrder?.id || ''}
                        onChange={(e) => setSelectedOrderId(e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-emerald-300 font-mono text-[11px] font-bold"
                      >
                        {contactOrders.map((ord) => (
                          <option key={ord.id} value={ord.id}>
                            #{ord.id} · ৳{ord.pricing.total.toLocaleString()} ({ord.status})
                          </option>
                        ))}
                      </select>
                    ) : activeOrder ? (
                      <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300 font-mono font-bold text-[11px]">
                        Order #{activeOrder.id}
                      </span>
                    ) : null}

                    {activeOrder ? (
                      <span className="text-[11px] text-slate-300 truncate">
                        {activeOrder.items.map((i) => `${i.productTitle} x${i.quantity}`).join(', ')} ·{' '}
                        <strong className="text-white">৳{activeOrder.pricing.total.toLocaleString()}</strong> ·{' '}
                        <span className="uppercase text-amber-300">{activeOrder.status}</span>
                        {activeOrder.courier?.trackingCode ? ` · ${activeOrder.courier.trackingCode}` : ''}
                      </span>
                    ) : (
                      activeContact.reseller && (
                        <span className="text-[11px] text-slate-300 truncate">
                          {activeContact.reseller.resellerCode} · Wallet ৳{activeContact.reseller.walletBalance.toLocaleString()} · Status:{' '}
                          <strong className="uppercase text-amber-300">{activeContact.reseller.status}</strong>
                        </span>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyOrderInfo}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {copiedOrderInfo ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedOrderInfo ? at('কপি হয়েছে!', 'Copied!') : 'Copy Order Info'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleInsertOrderInfo}
                      title={at('মেসেজ বক্সে বসান', 'Insert into reply')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5 text-sky-400" />
                      <span>{at('রিপ্লাইতে দিন', 'Insert')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Conversation Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
                {threadMessages.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                    <p>
                      {at(
                        'এই নম্বরের সাথে এখনো কোনো WhatsApp API মেসেজ হিস্ট্রি নেই। নিচ থেকে AI ড্রাফট বা সরাসরি মেসেজ পাঠান।',
                        'No WhatsApp API messages exchanged yet with this contact. Use the AI Draft buttons or type a quick reply below.'
                      )}
                    </p>
                  </div>
                ) : (
                  threadMessages.map((msg) => {
                    const isOutbound = msg.direction === 'outbound';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                            isOutbound
                              ? 'bg-emerald-900/60 border border-emerald-700/50 text-white'
                              : 'bg-slate-800 border border-slate-700 text-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-bold mb-1 opacity-80">
                            {msg.sender === 'ai' && <Bot className="w-3 h-3 text-amber-300" />}
                            <span>
                              {msg.sender === 'contact'
                                ? activeContact.name
                                : msg.sender === 'ai'
                                ? 'AI Assistant -> WhatsApp'
                                : 'Admin Desk -> WhatsApp'}
                            </span>
                            {isOutbound && (
                              <span className="font-mono uppercase text-[9px] text-emerald-300">
                                · {msg.mode === 'live' ? 'Live API' : 'Sandbox'}
                              </span>
                            )}
                          </div>
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
                          {new Date(msg.timestamp).toLocaleString()}
                          {msg.orderId ? ` · #${msg.orderId}` : ''}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={threadEndRef} />
              </div>

              {/* AI Quick Draft Chips + Composer */}
              <form onSubmit={handleSendWhatsApp} className="p-3.5 border-t border-slate-800 bg-slate-900 space-y-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1 mr-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{at('AI রিসেলার/কাস্টমার ড্রাফট:', 'AI Draft:')}</span>
                  </span>
                  {activeContact.type === 'reseller' ? (
                    <>
                      <button
                        type="button"
                        disabled={isGeneratingAi}
                        onClick={() => handleAiGenerate('approval')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-emerald-300 cursor-pointer disabled:opacity-50"
                      >
                        {at('অ্যাপ্রুভাল স্বাগতম', 'Approval Welcome')}
                      </button>
                      <button
                        type="button"
                        disabled={isGeneratingAi}
                        onClick={() => handleAiGenerate('payout')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-sky-300 cursor-pointer disabled:opacity-50"
                      >
                        {at('পে-আউট ওয়ালেট', 'Payout Guide')}
                      </button>
                      {activeOrder && (
                        <button
                          type="button"
                          disabled={isGeneratingAi}
                          onClick={() => handleAiGenerate('order')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-amber-300 cursor-pointer disabled:opacity-50"
                        >
                          {at('অর্ডার স্ট্যাটাস', 'Order Status')}
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isGeneratingAi}
                        onClick={() => handleAiGenerate('general')}
                        className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-[11px] font-bold text-amber-200 cursor-pointer disabled:opacity-50"
                      >
                        {isGeneratingAi ? at('তৈরি হচ্ছে...', 'Drafting...') : at('AI কাস্টম রিপ্লাই', 'Smart AI Reply')}
                      </button>
                    </>
                  ) : (
                    <>
                      {activeOrder && (
                        <button
                          type="button"
                          disabled={isGeneratingAi}
                          onClick={() => handleAiGenerate('order')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-emerald-300 cursor-pointer disabled:opacity-50"
                        >
                          {at('অর্ডার ও ট্র্যাকিং', 'Order & Tracking')}
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isGeneratingAi}
                        onClick={() => handleAiGenerate('general')}
                        className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-[11px] font-bold text-amber-200 cursor-pointer disabled:opacity-50"
                      >
                        {isGeneratingAi ? at('তৈরি হচ্ছে...', 'Drafting...') : at('AI সাপোর্ট ড্রাফট', 'AI Customer Draft')}
                      </button>
                    </>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <textarea
                    rows={2}
                    value={draftText}
                    onChange={(e) => {
                      setDraftText(e.target.value);
                      if (lastAiGenerated) setLastAiGenerated(false);
                    }}
                    placeholder={at(
                      'রিসেলার বা কাস্টমারকে পাঠাতে হোয়াটসঅ্যাপ মেসেজ লিখুন বা AI ড্রাফট চাপুন...',
                      'Type WhatsApp reply or click an AI Draft / Copy Order Info button...'
                    )}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 resize-y"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !draftText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isSending ? <CheckCircle2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{isSending ? at('পাঠানো হচ্ছে...', 'Sending...') : at('WhatsApp API পাঠান', 'Send WhatsApp')}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
