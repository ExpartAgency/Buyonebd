import React from 'react';
import {
  Zap,
  PhoneCall,
  ShieldCheck,
  Truck,
  Award,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  CheckCircle2,
  PackageSearch,
  ShoppingBag
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AboutView: React.FC = () => {
  const { settings, goHome, openAllProductsPage, setActiveView, lang, t } = useStore();
  const primaryColor = settings.themeColors?.primary || '#059669';
  const uspItems = settings.organicMarketing?.homeFeatureStrip?.items || [];
  const hotline = settings.footerSettings?.hotline || settings.hotline || '+8801917942662';
  const email = settings.footerSettings?.email || settings.supportEmail || 'support@buyonebd.com';
  const address = settings.footerSettings?.address || settings.address || 'Dhaka, Bangladesh';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-8 w-full">
      {/* Top Breadcrumb / Back */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={goHome}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('হোম পেজে ফিরুন', 'Back to Home')}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openAllProductsPage}
            style={{ backgroundColor: primaryColor }}
            className="px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-95 shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t('সকল পণ্য দেখুন', 'Browse Products')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('tracking')}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-slate-800"
          >
            <PackageSearch className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('অর্ডার ট্র্যাক', 'Track Order')}</span>
          </button>
        </div>
      </div>

      {/* Hero Editorial Card */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>{t('আমাদের সম্পর্কে ও শপিং গ্যারান্টি', 'About Us & Customer Assurance')}</span>
        </div>
        <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
          {lang === 'bn' ? settings.storeNameBn || settings.storeName : settings.storeName}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          {settings.footerSettings
            ? t(settings.footerSettings.aboutTextBn, settings.footerSettings.aboutTextEn)
            : t(
                'BuyOne BD বাংলাদেশের সকল ৬৪ জেলায় দ্রুততম হোম ডেলিভারি ও আনবক্সিং চেক সুবিধাসহ ১০০% অরিজিনাল পণ্য সরবরাহ করে।',
                'BuyOne BD delivers 100% authentic products across all 64 districts of Bangladesh with Cash on Delivery and live order tracking.'
              )}
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-emerald-200 font-semibold">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {t('শুধুমাত্র সমগ্র বাংলাদেশে (৬৪ জেলা) ডেলিভারি', 'Delivery Whole Bangladesh Only (All 64 Districts)')}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-emerald-400" />
            {hotline}
          </span>
        </div>
      </section>

      {/* Core Store Assurance Features (Moved cleanly from Home Page) */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t('আমাদের মূল সেবাসমূহ ও সুবিধা', 'Our Core Services & Guarantees')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('প্রতিটি অর্ডারে নিশ্চিন্ত শপিং অভিজ্ঞতা ও দ্রুত ডেলিভারি সেবা', 'Verified service standards across every order in Bangladesh')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{t('এক্সপ্রেস চেকআউট', 'Express Checkout')}</h3>
              <p className="text-[11px] text-slate-500 truncate">{t('১০ সেকেন্ডে অর্ডার', 'Fast 10s order')}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{t('কল কনফার্মেশন', 'Voice Confirmation')}</h3>
              <p className="text-[11px] text-slate-500 truncate">{t('লাইভ অর্ডার যাচাই', 'Live verification')}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{t('ক্যাশ অন ডেলিভারি', 'Cash on Delivery')}</h3>
              <p className="text-[11px] text-slate-500 truncate">{t('পণ্য দেখে পেমেন্ট', 'Pay on parcel receipt')}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{t('সারাদেশে ডেলিভারি', 'Nationwide Courier')}</h3>
              <p className="text-[11px] text-slate-500 truncate">{t('৬৪ জেলা কভারেজ', 'All 64 districts')}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Backend USP Strip Items */}
        {uspItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {uspItems.map((item, idx) => {
              const Icon = idx === 0 ? Truck : idx === 1 ? ShieldCheck : idx === 2 ? Award : Sparkles;
              return (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {lang === 'bn' ? item.titleBn : item.titleEn}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {lang === 'bn' ? item.subBn : item.subEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Contact & Nationwide Coverage Card */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase">
            <Phone className="w-4 h-4" />
            <span>{t('সরাসরি হটলাইন', 'Official Hotline')}</span>
          </div>
          <a href={`tel:${hotline}`} className="text-base font-black text-slate-900 dark:text-white block hover:text-emerald-600">
            {hotline}
          </a>
          <p className="text-xs text-slate-500">{t('সকাল ৯টা – রাত ১১টা (প্রতিদিন)', '9:00 AM – 11:00 PM Daily')}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase">
            <Mail className="w-4 h-4" />
            <span>{t('অফিসিয়াল সাপোর্ট ইমেইল', 'Support Email')}</span>
          </div>
          <a href={`mailto:${email}`} className="text-sm font-bold text-slate-900 dark:text-white block break-all hover:text-emerald-600">
            {email}
          </a>
          <p className="text-xs text-slate-500">{t('দ্রুত ইমেইল ও রিফান্ড সহায়তা', 'Fast email & replacement desk')}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase">
            <MapPin className="w-4 h-4" />
            <span>{t('ডেলিভারি এরিয়া ও ঠিকানা', 'Coverage & Office')}</span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{address}</p>
          <p className="text-xs text-slate-500">
            {t('সমগ্র বাংলাদেশে (৬৪ জেলা) ক্যাশ অন ডেলিভারি', 'Whole Bangladesh Delivery (All 64 Districts)')}
          </p>
        </div>
      </section>
    </div>
  );
};
