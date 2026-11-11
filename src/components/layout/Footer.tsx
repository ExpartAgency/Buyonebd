import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, MessageCircle, ExternalLink } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { settings, setActiveView, t, lang } = useStore();
  const footer = settings.footerSettings;

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About (100% Editable) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-600/30">
                B
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                BuyOne<span className="text-emerald-500">BD</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              {footer
                ? t(footer.aboutTextBn, footer.aboutTextEn)
                : t('বাংলাদেশের নির্ভরযোগ্য অনলাইন শপিং প্ল্যাটফর্ম। সেরা মানের পণ্য ক্যাশ অন ডেলিভারিতে পৌঁছে দিচ্ছি সারাদেশে।', 'Reliable online shopping in Bangladesh. Quality products delivered nationwide with Cash on Delivery.')}
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('১০০% অনুমোদিত ও ভেরিফাইড প্রতিষ্ঠান', '100% Authorized & Verified')}</span>
            </div>
          </div>

          {/* Col 2: Hotline & Contacts (100% Editable) */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              {t('কাস্টমার কেয়ার ও হটলাইন', 'Customer Support')}
            </h4>
            <div className="space-y-2 text-slate-300">
              <a
                href={`tel:${footer?.hotline || settings.hotline}`}
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-bold">{footer?.hotline || settings.hotline}</span>
              </a>
              <a
                href={`https://wa.me/${(footer?.whatsappNumber || settings.whatsappNumber).replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{footer?.whatsappNumber || settings.whatsappNumber} (হোয়াটসঅ্যাপ)</span>
              </a>
              <a
                href={`mailto:${footer?.email || settings.supportEmail}`}
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-teal-500 shrink-0" />
                <span>{footer?.email || settings.supportEmail}</span>
              </a>
              <div className="flex items-start gap-2 text-slate-400 text-[11px]">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{footer?.address || settings.address}</span>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Links (No admin link) */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              {t('প্রয়োজনীয় লিংক', 'Quick Navigation')}
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              <li>
                <button
                  onClick={() => setActiveView('tracking')}
                  className="hover:text-emerald-400 cursor-pointer transition-colors"
                >
                  {t('রিয়েল-টাইম অর্ডার ট্র্যাকিং', 'Live Order Tracking')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('store')}
                  className="hover:text-emerald-400 cursor-pointer transition-colors"
                >
                  {t('আজকের ফ্ল্যাশ সেল অফার', "Today's Flash Sale Deals")}
                </button>
              </li>
              <li>
                <span className="text-slate-400">
                  {t('৭ দিনের রিটার্ন ও রিফান্ড নীতি', '7 Days Return & Refund Policy')}
                </span>
              </li>
              <li>
                <span className="text-slate-400">
                  {t('গোপনীয়তা ও শর্তাবলী', 'Terms & Privacy Policy')}
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Payment Badges & Courier Partners */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              {t('নিরাপদ পেমেন্ট ও কুরিয়ার পার্টনার', 'Payment & Courier Partners')}
            </h4>
            <p className="text-[11px] text-slate-400">
              {t(
                'বিকাশ, নগদ, রকেট এবং সমগ্র বাংলাদেশে হোম ডেলিভারিতে ক্যাশ দিয়ে পণ্য নিন।',
                'bKash, Nagad, Rocket and Nationwide Cash on Delivery with Steadfast & Pathao.'
              )}
            </p>

            {(footer?.showPaymentBadges !== false) && (
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2 py-1 bg-pink-950/80 border border-pink-700/60 text-pink-300 text-[10px] font-bold rounded-md">
                  bKash বিকাশ
                </span>
                <span className="px-2 py-1 bg-orange-950/80 border border-orange-700/60 text-orange-300 text-[10px] font-bold rounded-md">
                  Nagad নগদ
                </span>
                <span className="px-2 py-1 bg-purple-950/80 border border-purple-700/60 text-purple-300 text-[10px] font-bold rounded-md">
                  Rocket রকেট
                </span>
                <span className="px-2 py-1 bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-bold rounded-md">
                  💵 ক্যাশ অন ডেলিভারি
                </span>
                <span className="px-2 py-1 bg-blue-950/80 border border-blue-700/60 text-blue-300 text-[10px] font-bold rounded-md">
                  Steadfast Courier
                </span>
                <span className="px-2 py-1 bg-rose-950/80 border border-rose-700/60 text-rose-300 text-[10px] font-bold rounded-md">
                  Pathao Courier
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom copyright (100% Editable) */}
        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>
            {footer
              ? t(footer.copyrightBn, footer.copyrightEn)
              : `© ${new Date().getFullYear()} ${settings.storeName}. All rights reserved.`}
          </p>
          <p className="flex items-center gap-1 text-slate-400">
            <span>{t('বাংলাদেশের বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম', 'Trusted Online Shopping Platform for Bangladesh')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
