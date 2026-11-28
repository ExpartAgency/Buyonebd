import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Key, AlertCircle, X, Sparkles, ShieldAlert } from 'lucide-react';
import { safeStorageSetItem } from '../../utils/safeStorage';

interface AdminLoginModalProps {
  onSuccessNavigate?: () => void;
}

const LOCKOUT_STORAGE_KEY = 'buyone_admin_lockout_v1';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccessNavigate }) => {
  const {
    isAdminLoginOpen,
    setIsAdminLoginOpen,
    loginAdmin,
    claimAdminCredentials,
    signInAdminWithGoogle,
    cloudSyncError,
    isAdminLoggedIn,
    settings,
    addSecurityLog,
    goHome,
    t
  } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [failedCount, setFailedCount] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [authStatus, setAuthStatus] = useState<{
    loaded: boolean;
    claimAllowed: boolean;
    isConfigured: boolean;
  }>({ loaded: false, claimAllowed: false, isConfigured: true });

  const secCfg = settings.securitySettings;
  const lockoutEnabled = secCfg?.loginLockoutEnabled !== false;
  const maxAttempts = Math.max(2, Number(secCfg?.maxLoginAttempts) || 5);
  const lockoutMinutes = Math.max(1, Number(secCfg?.lockoutMinutes) || 15);
  const pinRequired = Boolean(secCfg?.adminPinEnabled && secCfg?.adminPin?.trim());

  useEffect(() => {
    if (!isAdminLoginOpen) return;
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSecurityPin('');
    setError(null);
    let cancelled = false;
    fetch('/api/admin/auth/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setAuthStatus({
          loaded: true,
          claimAllowed: Boolean(data.claimAllowed),
          isConfigured: Boolean(data.isConfigured)
        });
      })
      .catch(() => {
        if (!cancelled) {
          setAuthStatus((prev) => ({ ...prev, loaded: true }));
        }
      });

    try {
      const saved = JSON.parse(localStorage.getItem(LOCKOUT_STORAGE_KEY) || '{}');
      if (saved.failedCount) setFailedCount(Number(saved.failedCount) || 0);
      if (saved.lockoutUntil && Number(saved.lockoutUntil) > Date.now()) {
        setLockoutUntil(Number(saved.lockoutUntil));
      }
    } catch {}

    return () => {
      cancelled = true;
    };
  }, [isAdminLoginOpen]);

  useEffect(() => {
    if (!lockoutUntil) {
      setSecondsLeft(0);
      return;
    }
    const tick = () => {
      const rem = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setSecondsLeft(rem);
      if (rem === 0) {
        setLockoutUntil(0);
        setFailedCount(0);
        localStorage.removeItem(LOCKOUT_STORAGE_KEY);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockoutUntil]);

  if (!isAdminLoginOpen) return null;

  const isLockedOut = lockoutEnabled && secondsLeft > 0;
  const isFirstRunSetup = authStatus.loaded && authStatus.claimAllowed && !authStatus.isConfigured;

  const handleClose = () => {
    setIsAdminLoginOpen(false);
    const p = window.location.pathname.toLowerCase();
    const h = window.location.hash.toLowerCase();
    if (!isAdminLoggedIn && (p.startsWith('/hossain') || h === '#hossain')) {
      window.history.replaceState({}, '', '/');
      goHome();
    }
  };

  const recordFailure = (reasonBn: string, reasonEn: string) => {
    const nextFails = failedCount + 1;
    setFailedCount(nextFails);
    if (lockoutEnabled && nextFails >= maxAttempts) {
      const until = Date.now() + lockoutMinutes * 60 * 1000;
      setLockoutUntil(until);
      safeStorageSetItem(LOCKOUT_STORAGE_KEY, JSON.stringify({ failedCount: nextFails, lockoutUntil: until }));
      addSecurityLog(
        'Brute-Force Lockout Triggered',
        `${nextFails} failed admin logins. Locked for ${lockoutMinutes} minutes.`,
        'blocked'
      );
      setError(
        t(
          `অতিরিক্ত ভুল চেষ্টার কারণে নিরাপত্তার স্বার্থে লগইন ${lockoutMinutes} মিনিটের জন্য লক করা হয়েছে।`,
          `Too many failed attempts. Login locked for ${lockoutMinutes} minutes.`
        )
      );
    } else {
      safeStorageSetItem(LOCKOUT_STORAGE_KEY, JSON.stringify({ failedCount: nextFails, lockoutUntil: 0 }));
      const remaining = Math.max(1, maxAttempts - nextFails);
      setError(`${t(reasonBn, reasonEn)} (${t(`আরও ${remaining} বার সুযোগ`, `${remaining} attempts left`)})`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut || isLoading) return;
    setError(null);

    if (isFirstRunSetup) {
      if (password.length < 8) {
        setError(t('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।', 'Password must be at least 8 characters.'));
        return;
      }
      if (password !== confirmPassword) {
        setError(t('দুইবার লেখা পাসওয়ার্ড মিলছে না।', 'Passwords do not match.'));
        return;
      }
      setIsLoading(true);
      const res = await claimAdminCredentials(email, password);
      setIsLoading(false);
      if (res.success) {
        setFailedCount(0);
        setLockoutUntil(0);
        localStorage.removeItem(LOCKOUT_STORAGE_KEY);
        setIsAdminLoginOpen(false);
        if (onSuccessNavigate) onSuccessNavigate();
      } else {
        setError(res.error || t('সেটআপ সম্পন্ন করা যায়নি।', 'Could not complete admin setup.'));
      }
      return;
    }

    setIsLoading(true);
    try {
      const ok = await loginAdmin(email, password, securityPin);
      if (ok) {
        setFailedCount(0);
        setLockoutUntil(0);
        localStorage.removeItem(LOCKOUT_STORAGE_KEY);
        setIsAdminLoginOpen(false);
        if (onSuccessNavigate) {
          onSuccessNavigate();
        }
      } else {
        recordFailure(
          'ভুল ইমেইল, পাসওয়ার্ড অথবা পিন! অনুগ্রহ করে সঠিক তথ্য দিন।',
          'Invalid email, password, or PIN! Please verify your credentials.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSyncLogin = async () => {
    if (isLockedOut || isLoading) return;
    setError(null);
    setIsLoading(true);
    const ok = await signInAdminWithGoogle();
    setIsLoading(false);
    if (ok && onSuccessNavigate) {
      onSuccessNavigate();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all duration-300 scale-100"
        role="dialog"
        aria-modal="true"
      >
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30 mb-3">
              {isLockedOut ? <ShieldAlert className="w-8 h-8 text-amber-200" /> : <Lock className="w-8 h-8" />}
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isFirstRunSetup
                ? t('প্রথমবার এডমিন সেটআপ', 'First-Run Admin Setup')
                : t('এডমিন সিকিউর লগইন', 'Admin Access')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isFirstRunSetup
                ? t(
                    'নিরাপদ এডমিন ইমেইল ও পাসওয়ার্ড সেট করে প্যানেল চালু করুন',
                    'Create your administrator email & password to secure /hossain'
                  )
                : t(
                    'শুধুমাত্র অনুমোদিত ম্যানেজমেন্ট প্যানেল অ্যাক্সেস',
                    'Authorized administrator access only (/hossain)'
                  )}
            </p>
          </div>

          {isLockedOut && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2 font-bold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                {t(
                  `সিকিউরিটি লক সক্রিয়: ${Math.floor(secondsLeft / 60)}মি ${secondsLeft % 60}সে পর পুনরায় চেষ্টা করুন।`,
                  `Security Lockout Active: Try again in ${Math.floor(secondsLeft / 60)}m ${secondsLeft % 60}s.`
                )}
              </span>
            </div>
          )}

          {(error || cloudSyncError) && !isLockedOut && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error || cloudSyncError}</span>
            </div>
          )}

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
                  disabled={isLockedOut}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('অ্যাডমিন ইমেইল লিখুন', 'Enter admin email')}
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {isFirstRunSetup ? t('নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)', 'New Password (min 8 chars)') : t('পাসওয়ার্ড', 'Secret Password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={isFirstRunSetup ? 8 : undefined}
                  disabled={isLockedOut}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
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

            {isFirstRunSetup && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {t('পাসওয়ার্ড নিশ্চিত করুন', 'Confirm Password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    disabled={isLockedOut}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            {!isFirstRunSetup && pinRequired && (
              <div>
                <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5">
                  {t('২-ধাপ সিকিউরিটি পিন', '2-Step Security PIN')}
                </label>
                <input
                  type="password"
                  required
                  disabled={isLockedOut}
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-emerald-300 dark:border-emerald-700 rounded-xl text-sm font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isLockedOut}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {isFirstRunSetup
                      ? t('এডমিন অ্যাকাউন্ট তৈরি ও প্রবেশ করুন', 'Claim Admin & Enter Dashboard')
                      : t('লগইন করুন', 'Enter Dashboard')}
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <button
              type="button"
              disabled={isLoading || isLockedOut}
              onClick={handleGoogleSyncLogin}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-sky-600/20 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-sky-100 shrink-0" />
              <span>
                {t(
                  'Google Cloud Sync দিয়ে প্রবেশ করুন (buyonebd@gmail.com)',
                  'Sign In with Google Cloud Sync (buyonebd@gmail.com)'
                )}
              </span>
            </button>
            <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 leading-snug">
              {t(
                'অন্যান্য মোবাইল ও ব্রাউজারের অর্ডার লাইভ পেতে Google (buyonebd@gmail.com) সিঙ্ক করুন।',
                'Recommended: Connect buyonebd@gmail.com to stream live orders from all phones and browsers.'
              )}
            </p>

            <div className="text-center">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {t(
                  'সুরক্ষিত সেশন • ব্রুট-ফোর্স লক প্রটেকশন চালু',
                  'Protected Session • Brute-Force Shield Active'
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
