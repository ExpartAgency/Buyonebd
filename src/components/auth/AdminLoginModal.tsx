import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Key, AlertCircle, X, Sparkles } from 'lucide-react';

interface AdminLoginModalProps {
  onSuccessNavigate?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccessNavigate }) => {
  const { isAdminLoginOpen, setIsAdminLoginOpen, loginAdmin, t } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAdminLoginOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const ok = loginAdmin(email, password);
      setIsLoading(false);
      if (ok) {
        setIsAdminLoginOpen(false);
        if (onSuccessNavigate) {
          onSuccessNavigate();
        }
      } else {
        setError(
          t(
            'ভুল ইমেইল অথবা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য দিন।',
            'Invalid email or password! Please check your credentials.'
          )
        );
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all duration-300 scale-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        {/* Close Button */}
        <button
          onClick={() => setIsAdminLoginOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30 mb-3">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('এডমিন সিকিউর লগইন', 'Admin Portal Access')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t(
                'শুধুমাত্র অনুমোদিত ম্যানেজমেন্ট প্যানেল অ্যাক্সেস',
                'Authorized administrator access only (/hossain)'
              )}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {t('এডমিন ইমেইল', 'Admin Email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hossain@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {t('পাসওয়ার্ড', 'Secret Password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>{t('লগইন করুন', 'Enter Dashboard')}</span>
                </>
              )}
            </button>
          </form>

          {/* Security note */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {t(
                'সুরক্ষিত সেশন • ই-কমার্স ম্যানেজমেন্ট হাব',
                'Protected Session • Secured E-Commerce Management Hub'
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
