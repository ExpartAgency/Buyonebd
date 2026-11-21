import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  MessageCircle,
  Printer,
  Truck,
  PhoneCall,
  Sparkles,
  PlusCircle,
  X,
  Trash2,
  History,
  Edit
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, CourierProvider } from '../../types';

interface PartialOrdersViewProps {
  onOpenInvoice: (order: Order) => void;
  onEditOrder?: (order: Order) => void;
}

export const PartialOrdersView: React.FC<PartialOrdersViewProps> = ({ onOpenInvoice, onEditOrder }) => {
  const {
    orders,
    abandonedCarts,
    markAbandonedCartWhatsAppSent,
    recoverAbandonedCart,
    deleteAbandonedCart,
    initiateCustomerBrowserCall,
    recordPartialPayment,
    bookOrderCourier,
    aiConfirmOrderByCustomer,
    startAICall,
    deleteOrder,
    adminLang
  } = useStore();

  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'active_due' | 'all_partial_history'>('active_due');
  const [collectingOrder, setCollectingOrder] = useState<Order | null>(null);
  const [collectAmount, setCollectAmount] = useState<string>('');
  const [collectNote, setCollectNote] = useState<string>('Cash / MFS Partial Collection');
  const [markCompletedAfterCollect, setMarkCompletedAfterCollect] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const partialOrders = useMemo(() => {
    return orders.filter((ord) => {
      const due = ord.payment?.dueAmount ?? 0;
      const adv = ord.pricing?.advancePaid ?? 0;
      const hasHistory = (ord.pricing?.paymentHistory?.length || 0) > 0;
      const isPartialActive = ord.status === 'partial' || (adv > 0 && due > 0);
      if (filterMode === 'active_due') return isPartialActive;
      return isPartialActive || hasHistory || adv > 0;
    });
  }, [orders, filterMode]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return partialOrders;
    return partialOrders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.toLowerCase().includes(q)
    );
  }, [partialOrders, searchQuery]);

  const totalAdvanceCollected = useMemo(
    () => partialOrders.reduce((s, o) => s + (o.pricing?.advancePaid || 0), 0),
    [partialOrders]
  );
  const totalDueRemaining = useMemo(
    () => partialOrders.reduce((s, o) => s + Math.max(0, o.payment?.dueAmount || 0), 0),
    [partialOrders]
  );
  const totalOrderValue = useMemo(
    () => partialOrders.reduce((s, o) => s + (o.pricing?.total || 0), 0),
    [partialOrders]
  );

  const handleOpenCollectModal = (ord: Order) => {
    setCollectingOrder(ord);
    setCollectAmount(String(Math.max(0, ord.payment?.dueAmount || 0)));
    setCollectNote('Installment / Remaining Due Payment');
    setMarkCompletedAfterCollect(true);
  };

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingOrder) return;
    const amt = Math.max(0, Number(collectAmount) || 0);
    if (amt <= 0) return;
    recordPartialPayment(collectingOrder.id, amt, markCompletedAfterCollect, collectNote);
    setCollectingOrder(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-400" />
            <span>{at('আংশিক পেমেন্ট ও বকেয়া অর্ডার (Partial Orders)', 'Partial Payment & Due Orders')}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {at(
              'অগ্রিম পেমেন্ট নেওয়া ও বকেয়া থাকা অর্ডারগুলোর হিসাব, কিস্তি কালেকশন, হোয়াটসঅ্যাপ রিমাইন্ডার ও কুরিয়ার ডিসপ্যাচ',
              'Track advance-paid & due-balance orders, record installment payments, send due reminders & dispatch parcels'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setFilterMode('active_due')}
            className={`px-3 py-2 rounded-xl font-bold cursor-pointer border transition-colors ${
              filterMode === 'active_due'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {at('বকেয়া চলমান', 'Active Due')}
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('all_partial_history')}
            className={`px-3 py-2 rounded-xl font-bold cursor-pointer border transition-colors ${
              filterMode === 'all_partial_history'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {at('সব হিস্ট্রি (পেইডসহ)', 'All Partial History')}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 tabular-nums">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">
            {at('মোট পার্শিয়াল অর্ডার', 'Partial Orders')}
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">{partialOrders.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30">
          <span className="text-[11px] font-bold text-emerald-400 uppercase block">
            {at('মোট অ্যাডভান্স সংগ্রহ', 'Advance Collected')}
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
            ৳{totalAdvanceCollected.toLocaleString()}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30">
          <span className="text-[11px] font-bold text-amber-400 uppercase block">
            {at('মোট বকেয়া (Due)', 'Total Remaining Due')}
          </span>
          <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
            ৳{totalDueRemaining.toLocaleString()}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-sky-400 uppercase block">
            {at('মোট অর্ডার ভ্যালু', 'Total Gross Value')}
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            ৳{totalOrderValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={at('অর্ডার আইডি, কাস্টমার নাম বা ফোন খুঁজুন...', 'Search by order ID, name or phone...')}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Partial Orders Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-amber-400 text-[11px] font-bold border-b border-slate-800 whitespace-nowrap">
              <tr>
                <th className="py-3 px-4">{at('অর্ডার ও কাস্টমার', 'Order & Customer')}</th>
                <th className="py-3 px-4">{at('পণ্যসমূহ', 'Items')}</th>
                <th className="py-3 px-4">{at('পেমেন্ট প্রগ্রেস', 'Payment Progress')}</th>
                <th className="py-3 px-4">{at('স্ট্যাটাস ও কুরিয়ার', 'Status & Courier')}</th>
                <th className="py-3 px-4 text-right">{at('কালেকশন ও অ্যাকশন', 'Collection & Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 tabular-nums">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    {at('কোনো আংশিক পেমেন্ট বা বকেয়া অর্ডার পাওয়া যায়নি।', 'No partial or due-balance orders match your filter.')}
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => {
                  const total = Math.max(1, ord.pricing?.total || 0);
                  const paid = Math.max(0, ord.pricing?.advancePaid || 0);
                  const due = Math.max(0, ord.payment?.dueAmount ?? total - paid);
                  const pct = Math.min(100, Math.round((paid / total) * 100));
                  const cleanPhone = ord.customer.phone.replace(/[^0-9]/g, '');
                  const waPhone = cleanPhone.startsWith('88') ? cleanPhone : '88' + cleanPhone;
                  const historyCount = ord.pricing?.paymentHistory?.length || 0;

                  return (
                    <tr key={ord.id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <button
                          type="button"
                          onClick={() => onOpenInvoice(ord)}
                          className="font-mono font-bold text-sky-400 hover:underline cursor-pointer block"
                        >
                          #{ord.id}
                        </button>
                        <p className="font-bold text-white mt-0.5">{ord.customer.name}</p>
                        <p className="font-mono text-[11px] text-emerald-400">{ord.customer.phone}</p>
                        <p className="text-[10px] text-slate-500">{ord.customer.district}</p>
                      </td>
                      <td className="py-3.5 px-4 max-w-[210px]">
                        <div className="space-y-0.5">
                          {ord.items.slice(0, 3).map((it, idx) => (
                            <p key={idx} className="truncate text-slate-200 font-medium">
                              {at(it.productTitleBn || it.productTitle, it.productTitle)} ×{it.quantity}
                            </p>
                          ))}
                          {ord.items.length > 3 && (
                            <span className="text-[10px] text-slate-400">+{ord.items.length - 3} more</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          {ord.payment.method.toUpperCase()} {ord.payment.trxId ? `• ${ord.payment.trxId}` : ''}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-emerald-400 font-bold">Paid: ৳{paid.toLocaleString()}</span>
                            <span className={due > 0 ? 'text-amber-400 font-black' : 'text-emerald-300 font-bold'}>
                              {due > 0 ? `Due: ৳${due.toLocaleString()}` : 'FULL PAID'}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full transition-all ${due === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>Total: ৳{total.toLocaleString()}</span>
                            {historyCount > 0 && (
                              <span className="flex items-center gap-1 text-sky-400">
                                <History className="w-2.5 h-2.5" /> {historyCount} logs
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : ord.status === 'partial'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-sky-500/20 text-sky-300'
                          }`}
                        >
                          {ord.status.replace('_', ' ')}
                        </span>
                        <div className="mt-1 text-[10px] font-mono text-slate-400">
                          {ord.courier?.trackingCode ? (
                            <span className="text-emerald-400 font-bold">{ord.courier.provider}: {ord.courier.trackingCode}</span>
                          ) : (
                            <span>{at('কুরিয়ার পাঠানো হয়নি', 'Not dispatched')}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {due > 0 && (
                            <button
                              type="button"
                              onClick={() => handleOpenCollectModal(ord)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>{at('পেমেন্ট নিন', 'Collect Due')}</span>
                            </button>
                          )}
                          {due > 0 && (
                            <button
                              type="button"
                              onClick={() => recordPartialPayment(ord.id, due, true, 'Full Due Settled')}
                              title={at('সম্পূর্ণ পেমেন্ট ও ডেলিভার্ড মার্ক', 'Mark Full Paid & Delivered')}
                              className="px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{at('ফুল পেইড', 'Settle All')}</span>
                            </button>
                          )}
                          {ord.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => aiConfirmOrderByCustomer(ord.id, 'Admin AI Confirm')}
                              title={at('AI কনফার্ম করুন', 'AI Confirm Order')}
                              className="px-2 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={bookingId === ord.id}
                            onClick={async () => {
                              setBookingId(ord.id);
                              await bookOrderCourier(ord.id, (ord.courier?.provider || 'Steadfast') as CourierProvider);
                              setBookingId(null);
                            }}
                            title={at('কুরিয়ার বুকিং', 'Send to Courier')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                              `আসসালামু আলাইকুম ${ord.customer.name},\nআপনার BuyOne BD অর্ডার #${ord.id}-এ অগ্রিম ৳${paid.toLocaleString()} জমা হয়েছে এবং বকেয়া আছে ৳${due.toLocaleString()} (মোট ৳${total.toLocaleString()})। ডেলিভারির সময় বাকি টাকা পরিশোধ করবেন। ধন্যবাদ!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={at('WhatsApp বকেয়া রিমাইন্ডার', 'Send WhatsApp Due Reminder')}
                            className="p-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => onOpenInvoice(ord)}
                            title={at('ইনভয়েস প্রিন্ট', 'Print Invoice')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {onEditOrder && (
                            <button
                              type="button"
                              onClick={() => onEditOrder(ord)}
                              title={at('অর্ডার এডিট করুন', 'Edit Order')}
                              className="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-600 text-amber-300 hover:text-white cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => startAICall(ord)}
                            title={at('AI কল করুন', 'Start AI Call')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-900 text-emerald-400 cursor-pointer"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteOrder(ord.id)}
                            title={at('অর্ডার মুছুন', 'Delete Order')}
                            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auto-Captured Unchecked-Out Checkout Leads (Name + Phone + Address without completing checkout) */}
      <div className="bg-slate-900 rounded-2xl border border-amber-500/30 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-amber-400" />
              <span>{at('চেকআউট অসম্পূর্ণ লিডস (নাম, ফোন ও ঠিকানা দিয়েছে কিন্তু অর্ডার করেনি)', 'Unchecked-Out Checkout Leads (Remind Customers)')}</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {at(
                'ক্রেতা ফর্ম পূরণ করে চেকআউট না করলেই স্বয়ংক্রিয়ভাবে এখানে সেভ হয় — ১ ক্লিকে হোয়াটসঅ্যাপ রিমাইন্ডার বা কল করুন।',
                'Captured automatically when shoppers type their Name, Phone & Address without placing the order.'
              )}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tabular-nums">
            {abandonedCarts.filter((c) => !c.recovered).length} Active Leads
          </span>
        </div>

        {abandonedCarts.filter((c) => !c.recovered).length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            {at('কোনো অসম্পূর্ণ চেকআউট লিড নেই।', 'No pending unchecked-out checkout leads right now.')}
          </p>
        ) : (
          <div className="divide-y divide-slate-800 text-xs tabular-nums">
            {abandonedCarts
              .filter((c) => !c.recovered)
              .slice(0, 12)
              .map((lead) => {
                const digits = (lead.customerPhone || '').replace(/[^0-9]/g, '');
                const waDigits = digits.startsWith('88') ? digits : `88${digits}`;
                const reminderText = `আসসালামু আলাইকুম ${lead.customerName || 'স্যার/ম্যাডাম'}, BuyOne BD-তে আপনার পছন্দের ${lead.items.map((i) => i.product.titleBn || i.product.title).join(', ')} (৳${lead.total.toLocaleString()}) অর্ডারটি অসম্পূর্ণ রয়েছে। ডেলিভারি নিশ্চিত করতে এখনই রিপ্লাই দিন!`;
                return (
                  <div key={lead.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="font-bold text-white">
                        {lead.customerName || 'Guest'} · <span className="font-mono text-emerald-400">{lead.customerPhone}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {lead.customerAddress || lead.customerDistrict} · {lead.items.map((i) => `${i.product.titleBn || i.product.title} x${i.quantity}`).join(', ')}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Total ৳{lead.total.toLocaleString()} · {new Date(lead.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <a
                        href={`https://wa.me/${waDigits}?text=${encodeURIComponent(reminderText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => markAbandonedCartWhatsAppSent(lead.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{lead.whatsappSent ? at('পুনঃরিমাইন্ড', 'Remind Again') : at('WA রিমাইন্ডার', 'WA Remind')}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => initiateCustomerBrowserCall(null, { name: lead.customerName, phone: lead.customerPhone, direction: 'admin_to_customer' })}
                        className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{at('কল করুন', 'Call')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => recoverAbandonedCart(lead.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-700 text-emerald-300 font-bold text-[11px] cursor-pointer"
                      >
                        {at('রিকভার্ড', 'Recovered')}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAbandonedCart(lead.id)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white cursor-pointer"
                        title={at('মুছুন', 'Delete Lead')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Collect Payment Modal */}
      {collectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setCollectingOrder(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[11px] font-mono text-amber-400 font-bold">#{collectingOrder.id}</span>
              <h4 className="text-base font-black text-white mt-0.5">
                {at('বকেয়া পেমেন্ট সংগ্রহ করুন', 'Record Partial Payment')}
              </h4>
              <p className="text-xs text-slate-400">
                {collectingOrder.customer.name} ({collectingOrder.customer.phone})
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs font-mono tabular-nums">
              <div>
                <span className="text-[10px] text-slate-400 block">Total</span>
                <strong className="text-white">৳{collectingOrder.pricing.total.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 block">Paid</span>
                <strong className="text-emerald-400">৳{(collectingOrder.pricing.advancePaid || 0).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-[10px] text-amber-400 block">Due</span>
                <strong className="text-amber-400">৳{(collectingOrder.payment.dueAmount || 0).toLocaleString()}</strong>
              </div>
            </div>

            <form onSubmit={handleCollectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {at('গ্রহণের পরিমাণ (৳)', 'Payment Amount Received (৳)')}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {at('নোট / মাধ্যম (bKash / Cash / TrxID)', 'Note / Method / TrxID')}
                </label>
                <input
                  type="text"
                  value={collectNote}
                  onChange={(e) => setCollectNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={markCompletedAfterCollect}
                  onChange={(e) => setMarkCompletedAfterCollect(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
                <span>{at('বকেয়া শূন্য হলে স্ট্যাটাস "Delivered" করুন', 'Mark as Delivered automatically if fully paid')}</span>
              </label>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer shadow-lg"
              >
                {at('পেমেন্ট রেকর্ড নিশ্চিত করুন', 'Confirm & Save Payment')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
