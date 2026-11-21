import React, { useState, useMemo } from 'react';
import { X, Printer, FileText, Tag, Receipt, Settings2 } from 'lucide-react';
import { Order, InvoicePaperSize, InvoiceSettings } from '../../types';
import { useStore } from '../../context/StoreContext';
import { INITIAL_SETTINGS } from '../../data/initialData';

interface InvoicePrintModalProps {
  orders: Order[];
  initialPaperSize?: InvoicePaperSize;
  onClose: () => void;
  onOpenInvoiceSetup?: () => void;
}

const PAPER_OPTIONS: { id: InvoicePaperSize; label: string; desc: string }[] = [
  { id: 'A4', label: 'A4 Invoice', desc: 'Standard 210×297mm Full Invoice' },
  { id: 'label_4x6', label: 'Label 4×6"', desc: 'Standard Courier Waybill' },
  { id: 'label_4x3', label: 'Label 4×3"', desc: 'Medium Parcel Sticker' },
  { id: 'label_3x2', label: 'Label 3×2"', desc: 'Compact Box Sticker' },
  { id: 'thermal_80mm', label: '80mm Receipt', desc: 'POS Thermal Slip' }
];

const renderBarcodeBars = (code: string) => {
  const safe = code || 'BUYONEBD';
  const bars: number[] = [];
  for (let i = 0; i < safe.length; i++) {
    const ch = safe.charCodeAt(i);
    bars.push((ch % 3) + 1, ((ch >> 2) % 2) + 1, ((ch >> 4) % 3) + 1);
  }
  return (
    <div className="inline-flex flex-col items-center">
      <div className="flex items-stretch h-9 gap-[1.5px] bg-white px-2 py-1 border border-slate-300">
        {bars.slice(0, 44).map((w, idx) => (
          <span
            key={idx}
            style={{ width: `${w * 1.3}px` }}
            className={idx % 2 === 0 ? 'bg-slate-950 h-full block' : 'bg-white h-full block'}
          />
        ))}
      </div>
      <span className="text-[10px] font-mono tracking-widest font-bold text-slate-900 mt-0.5">{safe}</span>
    </div>
  );
};

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  orders,
  initialPaperSize,
  onClose,
  onOpenInvoiceSetup
}) => {
  const { settings, adminLang } = useStore();
  const invCfg: InvoiceSettings = {
    ...(INITIAL_SETTINGS.invoiceSettings as InvoiceSettings),
    ...(settings.invoiceSettings || {}),
    companyName: settings.invoiceSettings?.companyName || settings.storeName || 'BuyOne BD',
    companyNameBn: settings.invoiceSettings?.companyNameBn || settings.storeNameBn || 'বাইওয়ান বিডি',
    phone: settings.invoiceSettings?.phone || settings.whatsappNumber || '+8801917942662',
    email: settings.invoiceSettings?.email || settings.supportEmail || 'support@buyonebd.com',
    logoUrl: settings.invoiceSettings?.logoUrl || settings.logoUrl || ''
  };

  const [paperSize, setPaperSize] = useState<InvoicePaperSize>(
    initialPaperSize || invCfg.defaultPaperSize || 'A4'
  );
  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);

  const visibleCustomFields = useMemo(() => {
    const fields = invCfg.customFields || [];
    if (paperSize === 'A4') return fields.filter((f) => f.label.trim() && f.showOnA4 !== false);
    if (paperSize === 'thermal_80mm') return fields.filter((f) => f.label.trim() && f.showOnReceipt);
    return fields.filter((f) => f.label.trim() && f.showOnLabel);
  }, [invCfg.customFields, paperSize]);

  if (!orders || orders.length === 0) return null;

  const isLabel = paperSize.startsWith('label_');
  const isThermal = paperSize === 'thermal_80mm';
  const accent = invCfg.accentColor || '#059669';

  const sheetWidthClass =
    paperSize === 'A4'
      ? 'max-w-[794px] w-full p-6 sm:p-8'
      : paperSize === 'label_4x6'
      ? 'max-w-[384px] w-full p-4'
      : paperSize === 'label_4x3'
      ? 'max-w-[384px] w-full p-3.5'
      : paperSize === 'label_3x2'
      ? 'max-w-[300px] w-full p-2.5'
      : 'max-w-[302px] w-full p-3';

  return (
    <div className="fixed inset-0 z-[9996] flex flex-col bg-slate-950/90 backdrop-blur-sm overflow-hidden">
      {/* Screen-Only Toolbar (Hidden automatically during window.print()) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-black text-white flex items-center gap-2 mr-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>
              {at(`ইনভয়েস ও লেবেল প্রিন্ট (${orders.length}টি)`, `Print Preview (${orders.length} Order${orders.length > 1 ? 's' : ''})`)}
            </span>
          </h3>

          <div className="flex flex-wrap items-center gap-1.5">
            {PAPER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPaperSize(opt.id)}
                title={opt.desc}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  paperSize === opt.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {opt.id === 'A4' ? (
                  <FileText className="w-3.5 h-3.5" />
                ) : opt.id === 'thermal_80mm' ? (
                  <Receipt className="w-3.5 h-3.5" />
                ) : (
                  <Tag className="w-3.5 h-3.5" />
                )}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenInvoiceSetup && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenInvoiceSetup();
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{at('ইনভয়েস সেটআপ', 'Invoice Setup')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/25"
          >
            <Printer className="w-4 h-4" />
            <span>{at('এখনই প্রিন্ট / PDF', 'Print / Save PDF')}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Print Preview"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Preview Canvas + Isolated Print Root */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/70">
        <div id="buyone-print-root" className="flex flex-col items-center gap-6">
          {orders.map((ord, ordIdx) => {
            const invoiceNo = `${invCfg.invoicePrefix || 'INV-'}${ord.id}`;
            const dateStr = (() => {
              const d = new Date(ord.createdAt);
              return isNaN(d.getTime()) ? ord.createdAt : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            })();
            const codDue =
              ord.payment.dueAmount !== undefined
                ? ord.payment.dueAmount
                : ord.payment.method === 'cod'
                ? Math.max(0, ord.pricing.total - (ord.pricing.advancePaid || 0))
                : 0;
            const tracking = ord.courier?.trackingCode || invoiceNo;
            const displayLogo = invCfg.logoUrl || settings.logoUrl;

            return (
              <article
                key={ord.id}
                className={`${sheetWidthClass} bg-white text-slate-950 shadow-2xl border border-slate-300 rounded-sm tabular-nums ${
                  ordIdx < orders.length - 1 ? 'print-page-break' : ''
                }`}
              >
                {/* ============= SHIPPING LABEL LAYOUT ============= */}
                {isLabel ? (
                  <div className="space-y-2.5 text-[11px] leading-snug">
                    <div className="flex items-start justify-between gap-2 pb-2 border-b-2 border-slate-900">
                      <div className="flex items-center gap-2 min-w-0">
                        {displayLogo && (
                          <img
                            src={displayLogo}
                            alt={invCfg.companyName}
                            referrerPolicy="no-referrer"
                            className="h-7 w-auto max-w-[80px] object-contain"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-black text-xs uppercase tracking-tight truncate">{invCfg.companyName}</p>
                          <p className="text-[10px] font-mono text-slate-700">{invCfg.phone}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          style={{ backgroundColor: accent }}
                          className="inline-block px-2 py-0.5 text-white font-black text-[10px] uppercase rounded-xs"
                        >
                          {ord.courier?.provider || 'COD'}
                        </span>
                        <p className="font-mono font-bold text-[10px] mt-0.5">#{ord.id}</p>
                      </div>
                    </div>

                    {invCfg.showBarcode !== false && (
                      <div className="flex justify-center py-1 border-b border-dashed border-slate-300">
                        {renderBarcodeBars(tracking)}
                      </div>
                    )}

                    <div className="p-2 border-2 border-slate-900 rounded-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">RECIPIENT / TO:</span>
                        <span className="text-[10px] font-bold uppercase px-1.5 bg-slate-900 text-white">
                          {ord.customer.district}
                        </span>
                      </div>
                      <p className="font-black text-sm text-slate-950">{ord.customer.name}</p>
                      <p className="font-mono font-black text-xs text-slate-900">{ord.customer.phone}</p>
                      <p className="text-[11px] text-slate-800">
                        {ord.customer.address}
                        {ord.customer.thana ? `, ${ord.customer.thana}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-2 bg-slate-100 border border-slate-300 rounded-xs">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-600 block">
                          {invCfg.showCodBadge !== false ? 'COLLECT CASH (COD)' : 'PAYABLE DUE'}
                        </span>
                        <span className="font-mono font-black text-base text-slate-950">
                          ৳{codDue.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right text-[10px]">
                        <span className="block text-slate-600">Total Bill: ৳{ord.pricing.total.toLocaleString()}</span>
                        <span className="font-bold">Items: {ord.items.reduce((s, i) => s + i.quantity, 0)} pcs</span>
                      </div>
                    </div>

                    {paperSize !== 'label_3x2' && (
                      <div className="border-t border-slate-300 pt-1.5 space-y-0.5">
                        {ord.items.slice(0, 4).map((it, i) => (
                          <div key={i} className="flex justify-between text-[10px]">
                            <span className="truncate pr-2">
                              {it.quantity}× {it.productTitle}
                              {it.selectedSize ? ` (${it.selectedSize})` : ''}
                            </span>
                            <span className="font-mono shrink-0">৳{(it.price * it.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                        {ord.items.length > 4 && (
                          <p className="text-[9px] text-slate-600">+{ord.items.length - 4} more item(s) inside package</p>
                        )}
                      </div>
                    )}

                    {visibleCustomFields.length > 0 && (
                      <div className="border-t border-dashed border-slate-300 pt-1.5 grid grid-cols-2 gap-1 text-[10px]">
                        {visibleCustomFields.map((f) => (
                          <div key={f.id}>
                            <span className="font-bold text-slate-600">{f.label}: </span>
                            <span className="font-semibold text-slate-900">{f.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="border-t border-slate-300 pt-1 text-[9px] text-slate-600 flex justify-between">
                      <span>From: {invCfg.companyName}</span>
                      <span>{dateStr}</span>
                    </div>
                  </div>
                ) : isThermal ? (
                  /* ============= 80MM THERMAL RECEIPT LAYOUT ============= */
                  <div className="space-y-2 text-[11px] font-mono leading-snug">
                    <div className="text-center border-b border-dashed border-slate-400 pb-2 space-y-0.5">
                      {displayLogo && (
                        <img
                          src={displayLogo}
                          alt={invCfg.companyName}
                          referrerPolicy="no-referrer"
                          className="h-8 mx-auto object-contain mb-1"
                        />
                      )}
                      <p className="font-black text-sm uppercase">{invCfg.companyName}</p>
                      <p className="text-[10px]">{invCfg.address}</p>
                      <p className="text-[10px] font-bold">Tel: {invCfg.phone}</p>
                      {invCfg.binVatNumber && <p className="text-[10px]">BIN/VAT: {invCfg.binVatNumber}</p>}
                    </div>

                    <div className="border-b border-dashed border-slate-400 pb-2 text-[10px] space-y-0.5">
                      <div className="flex justify-between">
                        <span>INV: {invoiceNo}</span>
                        <span>{dateStr}</span>
                      </div>
                      <p className="font-bold">Customer: {ord.customer.name}</p>
                      <p>Phone: {ord.customer.phone}</p>
                      <p>{ord.customer.address}, {ord.customer.district}</p>
                    </div>

                    <div className="border-b border-dashed border-slate-400 pb-2 space-y-1">
                      <div className="flex justify-between font-bold text-[10px] border-b border-slate-300 pb-0.5">
                        <span>ITEM</span>
                        <span>AMOUNT</span>
                      </div>
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between">
                            <span className="font-bold">{it.productTitle}</span>
                            <span>৳{(it.price * it.quantity).toLocaleString()}</span>
                          </div>
                          <div className="text-[9px] text-slate-600">
                            {it.quantity} × ৳{it.price.toLocaleString()}
                            {invCfg.showSku && (it.selectedColor || it.selectedSize)
                              ? ` [${[it.selectedColor, it.selectedSize].filter(Boolean).join('/')}]`
                              : ''}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-0.5 text-[10px] border-b border-dashed border-slate-400 pb-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>৳{ord.pricing.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery ({ord.customer.district}):</span>
                        <span>৳{ord.pricing.deliveryFee.toLocaleString()}</span>
                      </div>
                      {ord.pricing.discount > 0 && (
                        <div className="flex justify-between">
                          <span>Discount:</span>
                          <span>-৳{ord.pricing.discount.toLocaleString()}</span>
                        </div>
                      )}
                      {(ord.pricing.advancePaid || 0) > 0 && (
                        <div className="flex justify-between">
                          <span>Advance Paid:</span>
                          <span>-৳{(ord.pricing.advancePaid || 0).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-300">
                        <span>TOTAL / COD DUE:</span>
                        <span>৳{(codDue > 0 ? codDue : ord.pricing.total).toLocaleString()}</span>
                      </div>
                    </div>

                    {visibleCustomFields.length > 0 && (
                      <div className="border-b border-dashed border-slate-400 pb-2 space-y-0.5 text-[10px]">
                        {visibleCustomFields.map((f) => (
                          <div key={f.id} className="flex justify-between">
                            <span>{f.label}:</span>
                            <span className="font-bold">{f.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {invCfg.showBarcode !== false && (
                      <div className="flex justify-center pt-1">{renderBarcodeBars(tracking)}</div>
                    )}

                    <p className="text-center text-[9px] text-slate-700 pt-1">{invCfg.footerNote}</p>
                  </div>
                ) : (
                  /* ============= A4 STANDARD FULL INVOICE LAYOUT ============= */
                  <div className="space-y-5 text-xs">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b-2" style={{ borderColor: accent }}>
                      <div className="flex items-start gap-3">
                        {displayLogo && (
                          <img
                            src={displayLogo}
                            alt={invCfg.companyName}
                            referrerPolicy="no-referrer"
                            className="h-12 w-auto max-w-[140px] object-contain rounded"
                          />
                        )}
                        <div className="space-y-0.5">
                          <h1 className="text-xl font-black tracking-tight text-slate-950">{invCfg.companyName}</h1>
                          {invCfg.companyNameBn && <p className="text-[11px] font-semibold text-slate-600">{invCfg.companyNameBn}</p>}
                          <p className="text-[11px] text-slate-700">{invCfg.address}</p>
                          <p className="text-[11px] font-mono text-slate-700">
                            {invCfg.phone}{invCfg.email ? ` · ${invCfg.email}` : ''}
                          </p>
                          {invCfg.binVatNumber && (
                            <p className="text-[11px] font-mono font-bold text-slate-800">BIN/VAT: {invCfg.binVatNumber}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <span
                          style={{ backgroundColor: accent }}
                          className="inline-block px-3 py-1 text-white font-black text-xs uppercase tracking-widest rounded-xs"
                        >
                          INVOICE
                        </span>
                        <p className="font-mono font-black text-sm text-slate-950 pt-1">{invoiceNo}</p>
                        <p className="text-[11px] text-slate-600">Date: {dateStr}</p>
                        <p className="text-[11px] font-bold uppercase text-slate-800">
                          Status: {ord.status.replace('_', ' ')}
                        </p>
                        {ord.courier?.trackingCode && (
                          <p className="text-[11px] font-mono text-slate-800">
                            {ord.courier.provider}: {ord.courier.trackingCode}
                          </p>
                        )}
                      </div>
                    </div>

                    {invCfg.headerNote && (
                      <div className="px-3 py-2 rounded-xs bg-slate-50 border border-slate-300 text-[11px] font-semibold text-slate-700" style={{ borderColor: accent }}>
                        {invCfg.headerNote}
                      </div>
                    )}

                    {/* Bill To / Delivery Details + Barcode */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-3.5 rounded-xs bg-slate-50 border border-slate-200">
                      <div className="sm:col-span-7 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">BILL & DELIVER TO</p>
                        <p className="text-sm font-black text-slate-950">{ord.customer.name}</p>
                        <p className="font-mono font-bold text-slate-800">Phone: {ord.customer.phone}</p>
                        {invCfg.showCustomerEmail && Boolean((ord.customer as Record<string, any>).email) && (
                          <p className="font-mono text-[11px] text-slate-700">Email: {(ord.customer as Record<string, any>).email}</p>
                        )}
                        <p className="text-slate-700">
                          {ord.customer.address}
                          {ord.customer.thana ? `, ${ord.customer.thana}` : ''}, {ord.customer.district}
                        </p>
                        {invCfg.showOrderNotes !== false && ord.customer.note && (
                          <p className="text-[11px] text-slate-600 italic">Note: {ord.customer.note}</p>
                        )}
                      </div>

                      <div className="sm:col-span-5 flex flex-col sm:items-end justify-between gap-2">
                        <div className="sm:text-right text-[11px]">
                          <span className="text-slate-500 font-bold uppercase block">Payment Method</span>
                          <span className="font-black uppercase text-slate-900">{ord.payment.method}</span>
                          {ord.payment.trxId && <span className="block font-mono text-[10px]">TrxID: {ord.payment.trxId}</span>}
                        </div>
                        {invCfg.showBarcode !== false && renderBarcodeBars(tracking)}
                      </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr style={{ backgroundColor: accent }} className="text-white">
                          <th className="py-2 px-3 text-left font-bold">#</th>
                          <th className="py-2 px-3 text-left font-bold">Product Description</th>
                          <th className="py-2 px-3 text-center font-bold">Qty</th>
                          <th className="py-2 px-3 text-right font-bold">Unit Price</th>
                          <th className="py-2 px-3 text-right font-bold">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 border border-slate-200">
                        {ord.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                {invCfg.showProductImages && it.image && (
                                  <img
                                    src={it.image}
                                    alt={it.productTitle}
                                    referrerPolicy="no-referrer"
                                    className="w-9 h-9 rounded object-cover border border-slate-200 shrink-0"
                                  />
                                )}
                                <div>
                                  <p className="font-bold text-slate-950">{it.productTitle}</p>
                                  {it.productTitleBn && <p className="text-[10px] text-slate-500">{it.productTitleBn}</p>}
                                  {invCfg.showSku && (it.selectedColor || it.selectedSize) && (
                                    <p className="text-[10px] font-mono text-slate-600">
                                      Variant: {[it.selectedColor, it.selectedSize].filter(Boolean).join(' · ')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold">{it.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono">৳{it.price.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">
                              ৳{(it.price * it.quantity).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Custom Fields + Financial Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                      <div className="sm:col-span-6 space-y-2">
                        {visibleCustomFields.length > 0 && (
                          <div className="p-3 rounded-xs border border-slate-200 bg-slate-50 space-y-1.5">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Additional Information</p>
                            {visibleCustomFields.map((f) => (
                              <div key={f.id} className="flex justify-between gap-2 text-[11px]">
                                <span className="font-bold text-slate-600">{f.label}:</span>
                                <span className="font-semibold text-slate-900 text-right">{f.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {invCfg.termsText && (
                          <div className="text-[10px] text-slate-600 leading-relaxed">
                            <span className="font-bold text-slate-800 block">Terms & Warranty:</span>
                            {invCfg.termsText}
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-6 border border-slate-200 rounded-xs p-3.5 space-y-1.5">
                        <div className="flex justify-between text-slate-700">
                          <span>Subtotal</span>
                          <span className="font-mono font-bold">৳{ord.pricing.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span>Delivery Charge ({ord.customer.district})</span>
                          <span className="font-mono font-bold">৳{ord.pricing.deliveryFee.toLocaleString()}</span>
                        </div>
                        {ord.pricing.discount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>Discount / Coupon</span>
                            <span className="font-mono font-bold">-৳{ord.pricing.discount.toLocaleString()}</span>
                          </div>
                        )}
                        {(ord.pricing.advancePaid || 0) > 0 && (
                          <div className="flex justify-between text-sky-700">
                            <span>Advance Paid</span>
                            <span className="font-mono font-bold">-৳{(ord.pricing.advancePaid || 0).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-300">
                          <span>Grand Total</span>
                          <span className="font-mono">৳{ord.pricing.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-black pt-1" style={{ color: accent }}>
                          <span>Payable COD / Balance Due</span>
                          <span className="font-mono">৳{codDue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer & Signatory */}
                    <div className="pt-5 border-t border-slate-200 flex flex-wrap items-end justify-between gap-4">
                      <p className="text-[10px] text-slate-600 max-w-md">{invCfg.footerNote}</p>
                      {invCfg.showAuthorizedSignature !== false && (
                        <div className="text-center min-w-[160px] pt-4">
                          <div className="border-t border-slate-800 pt-1 text-[10px] font-bold text-slate-700">
                            {invCfg.authorizedSignatoryName || 'Authorized Signatory'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};
