import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Calendar, Clock, Search, Share2, Tag, User, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BlogPost } from '../../types';

export const BlogView: React.FC = () => {
  const {
    blogs,
    storeSubView,
    selectedBlogSlug,
    openBlogsPage,
    openBlogPostPage,
    openAllProductsPage,
    goHome,
    settings,
    addToast,
    lang,
    t
  } = useStore();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const publishedBlogs = useMemo(
    () =>
      (blogs || [])
        .filter((b) => b.isPublished !== false)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [blogs]
  );

  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    publishedBlogs.forEach((b) => {
      if (b.category?.trim()) set.add(b.category.trim());
    });
    return Array.from(set);
  }, [publishedBlogs]);

  const activePost: BlogPost | undefined = useMemo(() => {
    if (storeSubView !== 'blog_post' || !selectedBlogSlug) return undefined;
    return (
      publishedBlogs.find((b) => b.slug === selectedBlogSlug || b.id === selectedBlogSlug) ||
      blogs.find((b) => b.slug === selectedBlogSlug || b.id === selectedBlogSlug)
    );
  }, [storeSubView, selectedBlogSlug, publishedBlogs, blogs]);

  useEffect(() => {
    if (activePost) {
      const titleText = lang === 'bn' ? activePost.titleBn || activePost.title : activePost.title;
      document.title = `${titleText} · ${settings.storeName || 'BuyOne BD'}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (storeSubView === 'blogs') {
      document.title = `${t('ব্লগ ও গাইড', 'Shopping Guides & Blogs')} · ${settings.storeName || 'BuyOne BD'}`;
    }
  }, [activePost?.id, storeSubView, lang, settings.storeName]);

  const filteredPosts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return publishedBlogs.filter((post) => {
      if (categoryFilter !== 'all' && post.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.titleBn.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.excerptBn.toLowerCase().includes(q) ||
        (post.tags || []).some((tg) => tg.toLowerCase().includes(q))
      );
    });
  }, [publishedBlogs, categoryFilter, searchTerm]);

  const primaryColor = settings.themeColors?.primary || '#059669';

  const handleCopyBlogUrl = async (post: BlogPost) => {
    const url = `${window.location.origin}/blog/${encodeURIComponent(post.slug || post.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      addToast('success', t('আর্টিকেল লিংক কপি হয়েছে!', 'Article Link Copied!'), url);
    } catch {
      addToast('info', t('আর্টিকেল লিংক', 'Article URL'), url);
    }
  };

  if (storeSubView === 'blog_post' && activePost) {
    const relatedPosts = publishedBlogs.filter((p) => p.id !== activePost.id).slice(0, 3);
    return (
      <article className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 w-full animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={openBlogsPage}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('সব ব্লগে ফিরুন', 'Back to All Articles')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopyBlogUrl(activePost)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('লিংক শেয়ার', 'Share Link')}</span>
            </button>
            <button
              type="button"
              onClick={openAllProductsPage}
              style={{ backgroundColor: primaryColor }}
              className="px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('পণ্য দেখুন', 'Shop Products')}</span>
            </button>
          </div>
        </div>

        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {lang === 'bn' ? activePost.categoryBn || activePost.category : activePost.category}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>{activePost.author || 'BuyOne BD Editorial'}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(activePost.createdAt).toLocaleDateString()}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Clock className="w-3.5 h-3.5" />
              <span>{activePost.readTimeMinutes || 4} {t('মিনিট পড়া', 'min read')}</span>
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {lang === 'bn' ? activePost.titleBn || activePost.title : activePost.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {lang === 'bn' ? activePost.excerptBn || activePost.excerpt : activePost.excerpt}
          </p>
        </header>

        {activePost.coverImage?.trim() && (
          <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 max-h-[420px]">
            <img
              src={activePost.coverImage}
              alt={lang === 'bn' ? activePost.titleBn : activePost.title}
              referrerPolicy="no-referrer"
              className="w-full h-full max-h-[420px] object-cover"
            />
          </div>
        )}

        <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
            {lang === 'bn' ? activePost.contentBn || activePost.content : activePost.content}
          </div>

          {activePost.tags && activePost.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>{activePost.tags.join(' · ')}</span>
            </div>
          )}
        </div>

        {relatedPosts.length > 0 && (
          <section className="space-y-3 pt-2">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {t('আরও পড়ুন', 'More Articles')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((rel) => (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => openBlogPostPage(rel.slug || rel.id)}
                  className="text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 overflow-hidden transition-colors cursor-pointer flex flex-col"
                >
                  {rel.coverImage?.trim() ? (
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <BookOpen className="w-7 h-7 text-slate-400" />
                    </div>
                  )}
                  <div className="p-3.5 space-y-1.5">
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {lang === 'bn' ? rel.categoryBn || rel.category : rel.category} · {rel.readTimeMinutes || 4} min
                    </p>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                      {lang === 'bn' ? rel.titleBn || rel.title : rel.title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </article>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 w-full animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={goHome}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('শপে ফিরুন', 'Back to Store')}</span>
        </button>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('ব্লগ বা গাইড খুঁজুন...', 'Search articles & buying guides...')}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <header className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-2">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
          {t('শপিং টিপস, রিভিউ ও ব্লগ', 'BuyOne BD Editorial & Buying Guides')}
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
          {t('স্মার্ট শপিং ব্লগ ও টেক গাইড', 'Smart Shopping Stories & Buyer Guides')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          {t(
            'আসল পণ্য চেনার উপায়, বাংলাদেশে ক্যাশ অন ডেলিভারি ও রিসেলিং ব্যবসার আধুনিক গাইডলাইন।',
            'Authentic buying guides, product comparisons, and e-commerce tips tailored for Bangladesh shoppers and partners.'
          )}
        </p>
      </header>

      {/* Interactive Category Filter Segmented Controls */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
            categoryFilter === 'all'
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          {t('সকল আর্টিকেল', 'All Articles')} ({publishedBlogs.length})
        </button>
        {categoriesList.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
              categoryFilter === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t('কোনো ব্লগ পাওয়া যায়নি', 'No Articles Found')}
          </h3>
          <p className="text-xs text-slate-500">
            {t('অন্য ক্যাটাগরি বা কীওয়ার্ড দিয়ে চেষ্টা করুন।', 'Try resetting your search or selecting another category.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => openBlogPostPage(post.slug || post.id)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {post.coverImage?.trim() ? (
                  <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={lang === 'bn' ? post.titleBn : post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <BookOpen className="w-9 h-9 text-slate-400" />
                  </div>
                )}

                <div className="p-4 sm:p-5 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {lang === 'bn' ? post.categoryBn || post.category : post.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTimeMinutes || 4} min</span>
                  </div>

                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {lang === 'bn' ? post.titleBn || post.title : post.title}
                  </h2>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {lang === 'bn' ? post.excerptBn || post.excerpt : post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>{post.author || 'BuyOne BD'}</span>
                <span>{t('বিস্তারিত পড়ুন →', 'Read Article →')}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
