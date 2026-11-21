import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  X,
  Save,
  Upload,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BlogPost } from '../../types';
import { BulkSectionShell, BulkCommandBar } from './BulkSectionShell';

interface BlogAdminViewProps {
  onImageUpload: (
    file: File | undefined,
    onLoaded: (dataUrl: string) => void,
    sourceTag?: 'product' | 'slider' | 'logo' | 'category' | 'seo' | 'upload'
  ) => void;
}

const EMPTY_BLOG_DRAFT = {
  title: '',
  titleBn: '',
  slug: '',
  excerpt: '',
  excerptBn: '',
  content: '',
  contentBn: '',
  category: 'Guides',
  categoryBn: 'গাইড',
  coverImage: '',
  author: 'BuyOne BD Editorial',
  tagsText: 'Bangladesh, Shopping Guide, Tips',
  seoTitle: '',
  seoDescription: '',
  readTimeMinutes: 4,
  isPublished: true
};

export const BlogAdminView: React.FC<BlogAdminViewProps> = ({ onImageUpload }) => {
  const {
    blogs,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    bulkUpdateBlogPosts,
    bulkDeleteBlogPosts,
    mediaLibrary,
    openBlogPostPage,
    adminLang
  } = useStore();

  const at = (bn: string, en: string) => (adminLang === 'en' ? en : bn);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(EMPTY_BLOG_DRAFT);

  const filteredBlogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return blogs.filter((b) => {
      if (statusFilter === 'published' && !b.isPublished) return false;
      if (statusFilter === 'draft' && b.isPublished) return false;
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.titleBn.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q)
      );
    });
  }, [blogs, searchQuery, statusFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setDraft(EMPTY_BLOG_DRAFT);
    setIsEditorOpen(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingId(post.id);
    setDraft({
      title: post.title,
      titleBn: post.titleBn,
      slug: post.slug,
      excerpt: post.excerpt,
      excerptBn: post.excerptBn,
      content: post.content,
      contentBn: post.contentBn,
      category: post.category,
      categoryBn: post.categoryBn,
      coverImage: post.coverImage,
      author: post.author,
      tagsText: (post.tags || []).join(', '),
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      readTimeMinutes: post.readTimeMinutes || 4,
      isPublished: post.isPublished
    });
    setIsEditorOpen(true);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() && !draft.titleBn.trim()) return;
    const cleanTags = draft.tagsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: draft.title.trim() || draft.titleBn.trim(),
      titleBn: draft.titleBn.trim() || draft.title.trim(),
      slug:
        draft.slug.trim() ||
        (draft.title || draft.titleBn)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      excerpt: draft.excerpt.trim() || draft.content.slice(0, 140),
      excerptBn: draft.excerptBn.trim() || draft.contentBn.slice(0, 140) || draft.excerpt.trim(),
      content: draft.content.trim() || draft.excerpt.trim(),
      contentBn: draft.contentBn.trim() || draft.content.trim(),
      category: draft.category.trim() || 'Guides',
      categoryBn: draft.categoryBn.trim() || 'গাইড',
      coverImage: draft.coverImage.trim(),
      author: draft.author.trim() || 'BuyOne BD Editorial',
      tags: cleanTags,
      seoTitle: draft.seoTitle.trim() || undefined,
      seoDescription: draft.seoDescription.trim() || undefined,
      readTimeMinutes: Math.max(1, Number(draft.readTimeMinutes) || 3),
      isPublished: draft.isPublished,
      publishedAt: new Date().toISOString()
    };

    if (editingId) {
      updateBlogPost(editingId, payload);
    } else {
      addBlogPost(payload);
    }
    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>{at('ব্লগ ও আর্টিকেল পাবলিশিং স্টুডিও', 'Blog Publishing & Editorial CMS')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {at(
              'স্টোরফ্রন্টে নতুন বাংলা ও ইংরেজি ব্লগ লিখুন, ছবি যুক্ত করুন, পাবলিশ/ড্রাফট করুন ও বাল্ক অ্যাকশন চালান।',
              'Publish SEO-ready bilingual articles to /blogs, pick cover images, and bulk publish or manage posts.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{at('নতুন ব্লগ লিখুন', 'Write New Blog Post')}</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-3 gap-3 tabular-nums">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">{at('মোট আর্টিকেল', 'Total Articles')}</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">{blogs.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30">
          <span className="text-xs text-emerald-400 block">{at('প্রকাশিত (Live)', 'Published')}</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
            {blogs.filter((b) => b.isPublished).length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30">
          <span className="text-xs text-amber-400 block">{at('ড্রাফট', 'Drafts')}</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">
            {blogs.filter((b) => !b.isPublished).length}
          </span>
        </div>
      </div>

      <BulkSectionShell
        indexCode="BULK // BLOGS"
        title={at('সকল ব্লগ পোস্ট তালিকা', 'All Storefront Articles')}
        subtitle={at('সিলেক্ট করে একসাথে পাবলিশ, ড্রাফট বা ডিলিট করুন।', 'Select posts for batch publish, unpublish, edit, or delete.')}
        totalCount={filteredBlogs.length}
        selectedCount={selectedIds.length}
        accent="emerald"
        headerActions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              {(['all', 'published', 'draft'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase cursor-pointer ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={at('ব্লগ খুঁজুন...', 'Search title, slug, category...')}
                className="w-full pl-8 pr-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        }
      >
        <BulkCommandBar
          selectedCount={selectedIds.length}
          totalCount={filteredBlogs.length}
          allSelected={filteredBlogs.length > 0 && filteredBlogs.every((b) => selectedIds.includes(b.id))}
          onToggleSelectAll={() => {
            const visibleIds = filteredBlogs.map((b) => b.id);
            const allSel = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
            setSelectedIds(allSel ? [] : visibleIds);
          }}
          onClearSelection={() => setSelectedIds([])}
          itemLabel="POSTS"
        >
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => {
              bulkUpdateBlogPosts(selectedIds, { isPublished: true });
              setSelectedIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer disabled:opacity-40"
          >
            {at('পাবলিশ করুন', 'Publish')}
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => {
              bulkUpdateBlogPosts(selectedIds, { isPublished: false });
              setSelectedIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer disabled:opacity-40"
          >
            {at('ড্রাফট করুন', 'Unpublish')}
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => {
              bulkDeleteBlogPosts(selectedIds);
              setSelectedIds([]);
            }}
            className="px-2.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{at('মুছুন', 'Delete')}</span>
          </button>
        </BulkCommandBar>

        {filteredBlogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">
            {at('কোনো ব্লগ আর্টিকেল পাওয়া যায়নি।', 'No blog posts match your filter.')}
          </p>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredBlogs.map((post) => (
              <div
                key={post.id}
                className={`py-3.5 px-2 flex flex-wrap items-center justify-between gap-3 text-xs ${
                  selectedIds.includes(post.id) ? 'bg-emerald-950/20' : 'hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(post.id)}
                    onChange={() =>
                      setSelectedIds((prev) =>
                        prev.includes(post.id) ? prev.filter((x) => x !== post.id) : [...prev, post.id]
                      )
                    }
                    className="accent-emerald-500 rounded shrink-0"
                  />
                  {post.coverImage?.trim() ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-12 rounded-lg object-cover border border-slate-800 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white truncate">{at(post.titleBn || post.title, post.title)}</p>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          post.isPublished
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {post.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      /blog/{post.slug} · {post.category} · {post.readTimeMinutes} min read · {post.viewsCount || 0} views
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateBlogPost(post.id, { isPublished: !post.isPublished })}
                    title={post.isPublished ? at('ড্রাফট করুন', 'Unpublish') : at('পাবলিশ করুন', 'Publish')}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    {post.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => openBlogPostPage(post.slug)}
                    title={at('স্টোরফ্রন্টে দেখুন', 'Preview on Storefront')}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(post)}
                    title={at('এডিট করুন', 'Edit Post')}
                    className="p-1.5 rounded bg-slate-800 hover:bg-amber-600 text-amber-300 hover:text-white cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteBlogPost(post.id)}
                    title={at('মুছুন', 'Delete Post')}
                    className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </BulkSectionShell>

      {/* Blog Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form
            onSubmit={handleSaveBlog}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-black text-sm text-white">
                {editingId ? at('ব্লগ পোস্ট এডিট করুন', 'Edit Blog Post') : at('নতুন ব্লগ আর্টিকেল লিখুন', 'Create New Blog Article')}
              </h4>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">English Title *</label>
                <input
                  type="text"
                  required
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="How to Verify Authentic Smart Gadgets in BD"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">বাংলা শিরোনাম (Bangla Title)</label>
                <input
                  type="text"
                  value={draft.titleBn}
                  onChange={(e) => setDraft({ ...draft, titleBn: e.target.value })}
                  placeholder="বাংলাদেশে আসল স্মার্ট গ্যাজেট চেনার উপায়"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">URL Slug</label>
                <input
                  type="text"
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                  placeholder="auto-generated-from-title"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Category (EN / BN)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    placeholder="Buying Guide"
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                  <input
                    type="text"
                    value={draft.categoryBn}
                    onChange={(e) => setDraft({ ...draft, categoryBn: e.target.value })}
                    placeholder="কেনাকাটা গাইড"
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <label className="block text-slate-300 font-bold">Cover Image URL / Upload / Gallery</label>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={draft.coverImage}
                  onChange={(e) => setDraft({ ...draft, coverImage: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
                <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{at('আপলোড', 'Upload')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onImageUpload(e.target.files?.[0], (url) => setDraft((p) => ({ ...p, coverImage: url })), 'upload')}
                  />
                </label>
              </div>
              {mediaLibrary.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {mediaLibrary.slice(0, 8).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setDraft((p) => ({ ...p, coverImage: m.url }))}
                      className={`w-12 h-10 rounded-lg overflow-hidden border shrink-0 cursor-pointer ${
                        draft.coverImage === m.url ? 'border-emerald-400' : 'border-slate-800'
                      }`}
                    >
                      {m.url?.trim() && (
                        <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Excerpt (English)</label>
                <textarea
                  rows={2}
                  value={draft.excerpt}
                  onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">সংক্ষিপ্ত বিবরণ (Bangla Excerpt)</label>
                <textarea
                  rows={2}
                  value={draft.excerptBn}
                  onChange={(e) => setDraft({ ...draft, excerptBn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Article Content (English) *</label>
                <textarea
                  rows={6}
                  required
                  value={draft.content}
                  onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">সম্পূর্ণ আর্টিকেল (Bangla Content)</label>
                <textarea
                  rows={6}
                  value={draft.contentBn}
                  onChange={(e) => setDraft({ ...draft, contentBn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white leading-relaxed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Author</label>
                <input
                  type="text"
                  value={draft.author}
                  onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={draft.tagsText}
                  onChange={(e) => setDraft({ ...draft, tagsText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Read Time (min)</label>
                <input
                  type="number"
                  min={1}
                  value={draft.readTimeMinutes}
                  onChange={(e) => setDraft({ ...draft, readTimeMinutes: Number(e.target.value) || 3 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 text-slate-200 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.isPublished}
                  onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span>{at('এখনই ওয়েবসাইটে প্রকাশ করুন', 'Publish Immediately to Storefront')}</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  {at('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? at('আপডেট সেভ', 'Save Changes') : at('পোস্ট সেভ করুন', 'Publish Blog Post')}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
