import React, { useState } from 'react';
import { X, Sparkles, ShoppingBag, Zap, ArrowRight, Star, Flame } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

interface AIShoppingAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIShoppingAdvisorModal: React.FC<AIShoppingAdvisorModalProps> = ({ isOpen, onClose }) => {
  const {
    visibleStoreProducts,
    openProductPage,
    openOneClickCheckout,
    addToCart,
    getProductRealStats,
    lang,
    t
  } = useStore();

  const [query, setQuery] = useState('');
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState('');
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const runAdvisor = async (presetQuery?: string, presetBudget?: string) => {
    const qText = (presetQuery !== undefined ? presetQuery : query).trim();
    const budgetVal = presetBudget !== undefined ? presetBudget : maxBudget;
    if (!qText && !budgetVal) {
      setError(t('অনুগ্রহ করে আপনার প্রয়োজন বা বাজেট লিখুন।', 'Please describe what you are looking for or enter a budget.'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/shopping-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: qText,
          maxBudgetBdt: budgetVal ? Number(budgetVal) : undefined,
          lang
        })
      });
      const data = await res.json();
      if (data?.ok) {
        setAdvice(data.advice || '');
        const ids: string[] = Array.isArray(data.recommendedProducts)
          ? data.recommendedProducts.map((p: any) => p.id)
          : [];
        const matched = ids
          .map((id) => visibleStoreProducts.find((p) => p.id === id))
          .filter(Boolean) as Product[];
        setRecommendedProducts(matched);
      } else {
        setError(data?.error || t('সার্ভারে সংযোগ করা যায়নি।', 'Unable to fetch recommendations right now.'));
      }
    } catch {
      setError(t('নেটওয়ার্ক ত্রুটি, আবার চেষ্টা করুন।', 'Network error. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {t('এআই স্মার্ট শপিং ফাইন্ডার', 'AI Smart Shopping Finder')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t('বাজেট ও প্রয়োজন বলুন — শুধুমাত্র আমাদের স্টোরের সেরা পণ্য খুঁজে দেবে', 'Tell us your needs & budget — tailored strictly from our store catalog')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runAdvisor();
            }}
            className="space-y-3"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('আপনি কী খুঁজছেন? (যেমন: গিফটের জন্য স্মার্ট গ্যাজেট বা কিচেন আইটেম)...', 'What are you shopping for? (e.g., gift under 1500, kitchen filter, audio)...')}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                min={0}
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder={t('সর্বোচ্চ বাজেট (৳)', 'Max ৳')}
                className="sm:w-32 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? t('খুঁজছে...', 'Finding...') : t('সাজেশন দেখুন', 'Find Best')}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              {[
                { label: t('সেরা ফ্ল্যাশ ডিল ৳১৫০০-এর মধ্যে', 'Top flash deals under ৳1,500'), q: 'best flash deals', b: '1500' },
                { label: t('কিচেন ও হোম সলিউশন', 'Kitchen & Home helpers'), q: 'kitchen home filter purifier', b: '' },
                { label: t('জনপ্রিয় বেস্টসেলার পণ্য', 'Most popular bestsellers'), q: 'best selling top rated', b: '' },
                { label: t('৳১০০০-এর নিচে গিফট', 'Gifts under ৳1,000'), q: 'gift value deal', b: '1000' }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setQuery(preset.q);
                    setMaxBudget(preset.b);
                    runAdvisor(preset.q, preset.b);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </form>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold">
              {error}
            </div>
          )}

          {advice && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800/60 text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed">
              {advice}
            </div>
          )}

          {recommendedProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendedProducts.map((prod) => {
                const stats = getProductRealStats(prod.id);
                return (
                  <div
                    key={prod.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex gap-3">
                      {prod.images?.[0] && (
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                          {lang === 'bn' ? prod.titleBn || prod.title : prod.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs tabular-nums">
                          <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            ৳{prod.price.toLocaleString()}
                          </span>
                          {prod.originalPrice > prod.price && (
                            <span className="text-[11px] text-slate-400 line-through font-mono">
                              ৳{prod.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 tabular-nums">
                          <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {stats.averageRating} ({stats.reviewsCount.toLocaleString()})
                          </span>
                          <span className="inline-flex items-center gap-0.5">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {stats.soldCount.toLocaleString()}+
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          openProductPage(prod);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>{t('দেখুন', 'View')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => addToCart(prod, 1)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>{t('কার্ট', 'Cart')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          openOneClickCheckout(prod);
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>{t('এখনই কিনুন', 'Buy Now')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
