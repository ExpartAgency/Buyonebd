import React, { useState, useEffect } from 'react';
import { BellRing, CheckCircle2, Mail, Phone, X } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';

interface WaitlistModalProps {
  product: Product | null;
  onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ product, onClose }) => {
  const { addWaitlistEntry, customerProfile, lang, t } = useStore();
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setSubmitted(false);
      setError('');
      setContact(customerProfile?.phone || customerProfile?.email || '');
    }
  }, [product?.id]);

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = contact.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
    const digits = cleaned.replace(/[^0-9]/g, '');
    const isPhone = digits.length >= 10;

    if (!cleaned || (!isEmail && !isPhone)) {
      setError(
        t(
          'অনুগ্রহ করে একটি সঠিক ইমেইল অথবা ১১ ডিজিটের মোবাইল নম্বর দিন।',
          'Please enter a valid email address or mobile phone number.'
        )
      );
      return;
    }

    setError('');
    addWaitlistEntry({ product, contact: cleaned });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          aria-label="Close waitlist modal"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {t('ওয়েটলিস্টে যুক্ত হয়েছে!', 'Added to Restock Waitlist!')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t(
                `“${product.titleBn || product.title}” স্টকে আসামাত্রই আমরা আপনার (${contact}) নম্বরে/ইমেইলে জানিয়ে দেব।`,
                `As soon as "${product.title}" is back in stock, we will notify you at ${contact}.`
              )}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              {t('ঠিক আছে', 'Done')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              {product.images?.[0]?.trim() ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0" />
              )}
              <div className="min-w-0 pr-5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  <BellRing className="w-3 h-3" />
                  {t('স্টক আউট — রিস্টক অ্যালার্ট', 'Out of Stock · Waitlist')}
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1 line-clamp-2">
                  {lang === 'bn' ? product.titleBn : product.title}
                </h3>
                <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ৳{product.price.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t(
                'পণ্যটি পুনরায় স্টকে এলে সবার আগে নোটিফিকেশন পেতে আপনার ইমেইল অথবা মোবাইল নম্বর দিন।',
                'Enter your email or phone number to get notified immediately when this item is restocked.'
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                {t('ইমেইল অথবা মোবাইল / হোয়াটসঅ্যাপ নম্বর *', 'Email or Phone / WhatsApp Number *')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="017XXXXXXXX or name@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
                {contact.includes('@') ? (
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                ) : (
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                )}
              </div>
              {error && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <BellRing className="w-4 h-4" />
              <span>{t('স্টকে এলে আমাকে জানান', 'Notify Me When Available')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
