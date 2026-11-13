import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, MessageCircle, Globe, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { settings, categories, setActiveView, t, lang } = useStore();
  const footer = settings.footerSettings;
  const activeCategories = categories.filter((c) => c.isActive).slice(0, 6);

  const handleQuickLink = (actionType: string, url?: string) => {
    if (actionType === 'tracking') {
      setActiveView('tracking');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (actionType === 'flash_sale' || actionType === 'store') {
      setActiveView('store');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer
      className="text-slate-400 border-t border-slate-800 text-xs w-full overflow-hidden"
      style={{ backgroundColor: settings.themeColors?.footerBg || '#020617' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-24 md:pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Dynamic Backend Brand & About */}
          <div className="space-y-3 min-w-0">
            <div className="flex items-center gap-2.5">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  className="h-9 max-w-[140px] object-contain rounded-lg bg-white/5 p-1"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-600/30 shrink-0">
                  {settings.storeName?.slice(0, 1) || 'B'}
                </div>
              )}
              <span className="text-xl font-black text-white tracking-tight truncate">
                {lang === 'bn' ? (settings.storeNameBn || settings.storeName) : settings.storeName}
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed text-xs">
              {footer
                ? t(footer.aboutTextBn, footer.aboutTextEn)
                : t(
                    'বাংলাদেশের নির্ভরযোগ্য অনলাইন শপিং প্ল্যাটফর্ম। সেরা মানের পণ্য ক্যাশ অন ডেলিভারিতে পৌঁছে দিচ্ছি সারাদেশে।',
                    'Reliable online shopping in Bangladesh. Quality products delivered nationwide with Cash on Delivery.'
                  )}
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t('১০০% অনুমোদিত ও ভেরিফাইড প্রতিষ্ঠান', '100% Authorized & Verified')}</span>
            </div>

            {/* Social Follow Links */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {footer?.facebookUrl && (
                <a
                  href={footer.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500 text-slate-300 hover:text-blue-400 text-[11px] font-bold transition-colors"
                >
                  Facebook
                </a>
              )}
              {footer?.instagramUrl && (
                <a
                  href={footer.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-pink-500 text-slate-300 hover:text-pink-400 text-[11px] font-bold transition-colors"
                >
                  Instagram
                </a>
              )}
              {footer?.tiktokUrl && (
                <a
                  href={footer.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 text-[11px] font-bold transition-colors"
                >
                  TikTok
                </a>
              )}
              {footer?.youtubeUrl && (
                <a
                  href={footer.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500 text-slate-300 hover:text-rose-400 text-[11px] font-bold transition-colors"
                >
                  YouTube
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Hotline & Contacts */}
          <div className="space-y-3 min-w-0">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              {t('কাস্টমার কেয়ার ও হটলাইন', 'Customer Support')}
            </h4>
            <div className="space-y-2 text-slate-300">
              <a
                href={`tel:${footer?.hotline || settings.hotline}`}
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors break-words"
              >
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-bold">{footer?.hotline || settings.hotline}</span>
              </a>
              <a
                href={`https://wa.me/${(footer?.whatsappNumber || settings.whatsappNumber).replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors break-words"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{footer?.whatsappNumber || settings.whatsappNumber} (WhatsApp)</span>
              </a>
              <a
                href={`mailto:${footer?.email || settings.supportEmail}`}
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors break-all"
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

          {/* Col 3: Quick Navigation & All Categories (Editable from CMS) */}
          <div className="space-y-3 min-w-0">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              {t('প্রয়োজনীয় লিংক ও ক্যাটাগরি', 'Quick Links & Categories')}
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              {(footer?.quickLinks || []).map((ql) => (
                <li key={ql.id}>
                  <button
                    onClick={() => handleQuickLink(ql.actionType, ql.url)}
                    className="hover:text-emerald-400 cursor-pointer transition-colors text-left"
                  >
                    {lang === 'bn' ? ql.labelBn : ql.labelEn}
                  </button>
                </li>
              ))}
            </ul>

            {footer?.showCategoriesInFooter !== false && activeCategories.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  {t('সকল ক্যাটাগরি', 'All Categories')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveView('store');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500 text-[11px] text-slate-300 hover:text-emerald-400 cursor-pointer transition-colors"
                    >
                      {lang === 'bn' ? cat.nameBn : cat.nameEn}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Col 4: Payment Badges & Courier Partners */}
          <div className="space-y-3 min-w-0">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              {t('নিরাপদ পেমেন্ট ও কুরিয়ার পার্টনার', 'Payment & Courier Partners')}
            </h4>
            <p className="text-[11px] text-slate-400">
              {t(
                'বিকাশ, নগদ, রকেট এবং সমগ্র বাংলাদেশে হোম ডেলিভারিতে ক্যাশ দিয়ে পণ্য নিন।',
                'bKash, Nagad, Rocket and Nationwide Cash on Delivery with Steadfast & Pathao.'
              )}
            </p>

            {footer?.showPaymentBadges !== false && (
              <div className="flex flex-wrap gap-1.5 pt-1">
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
                  💵 Cash on Delivery
                </span>
                <span className="px-2 py-1 bg-blue-950/80 border border-blue-700/60 text-blue-300 text-[10px] font-bold rounded-md">
                  Steadfast
                </span>
                <span className="px-2 py-1 bg-rose-950/80 border border-rose-700/60 text-rose-300 text-[10px] font-bold rounded-md">
                  Pathao / RedX
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 pt-5 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px] text-center sm:text-left">
          <p>
            {footer
              ? t(footer.copyrightBn, footer.copyrightEn)
              : `© ${new Date().getFullYear()} ${settings.storeName}. All rights reserved.`}
          </p>
          <p className="flex items-center gap-1 text-slate-400">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>{t('বাংলাদেশের বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম', 'Trusted Online Shopping Platform for Bangladesh')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
