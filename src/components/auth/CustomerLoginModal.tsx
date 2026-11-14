import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Phone,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ShieldCheck,
  Sparkles,
  KeyRound,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CustomerLoginModal: React.FC = () => {
  const {
    isCustomerLoginOpen,
    setIsCustomerLoginOpen,
    loginCustomer,
    registerCustomer,
    sendPasswordResetOtp,
    resetCustomerPassword,
    settings,
    t,
    addToast
  } = useStore();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Forgot Password 2-Step OTP Reset form
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [resetTargetInfo, setResetTargetInfo] = useState<{ customerName?: string; contactLabel?: string } | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  if (!isCustomerLoginOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginCustomer(identifier, password);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerCustomer({
      name: regName,
      username: regUsername,
      phone: regPhone,
      email: regEmail,
      password: regPassword
    });
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) return;
    setIsSendingOtp(true);
    try {
      const res = await sendPasswordResetOtp(forgotIdentifier.trim());
      if (res.success && res.otpCode) {
        setGeneratedOtp(res.otpCode);
        setResetTargetInfo({ customerName: res.customerName, contactLabel: res.contactLabel });
        setForgotStep('verify');
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== generatedOtp) {
      addToast('error', t('ভুল OTP কোড', 'Invalid OTP'), t('সঠিক ৬ ডিজিটের ভেরিফিকেশন কোড দিন।', 'Please enter the exact 6-digit OTP code.'));
      return;
    }
    if (newResetPassword.length < 4) {
      addToast('warning', t('পাসওয়ার্ড ছোট', 'Password Too Short'), t('কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড দিন।', 'Password must be at least 4 characters.'));
      return;
    }
    if (newResetPassword !== confirmResetPassword) {
      addToast('warning', t('পাসওয়ার্ড মিলছে না', 'Passwords Do Not Match'), t('নতুন পাসওয়ার্ড দুটি এক হতে হবে।', 'New password and confirmation must match.'));
      return;
    }
    const ok = resetCustomerPassword(forgotIdentifier.trim(), newResetPassword);
    if (ok) {
      setIdentifier(forgotIdentifier.trim());
      setPassword(newResetPassword);
      setMode('login');
      setForgotStep('request');
      setEnteredOtp('');
      setNewResetPassword('');
      setConfirmResetPassword('');
      setGeneratedOtp('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="h-2 w-full"
          style={{ background: `linear-gradient(90deg, ${settings.themeColors?.primary || '#059669'}, ${settings.themeColors?.secondary || '#0d9488'})` }}
        />

        <button
          onClick={() => setIsCustomerLoginOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 cursor-pointer transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7 space-y-5">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mb-1">
              {mode === 'forgot' ? <KeyRound className="w-7 h-7" /> : <User className="w-7 h-7" />}
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {mode === 'login'
                ? t('কাস্টমার প্রোফাইল লগইন', 'Customer Sign In')
                : mode === 'register'
                ? t('নতুন অ্যাকাউন্ট তৈরি করুন', 'Create Customer Account')
                : t('পাসওয়ার্ড রিসেট করুন', 'Reset Your Password')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'forgot'
                ? t('রেজিস্টার্ড ফোন, ইমেইল বা ইউজারনেম দিয়ে OTP নিন', 'Recover access using phone, email or username OTP')
                : t(
                    'অর্ডার ট্র্যাকিং, স্পিন গিফট ওয়ালেট ও রিওয়ার্ডস দেখতে লগইন করুন',
                    'Sign in to manage orders, spin cash wallet & coupons'
                  )}
            </p>
          </div>

          {/* Mode Tabs */}
          {mode !== 'forgot' ? (
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('লগইন', 'Sign In')}</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('রেজিস্টার', 'Register')}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setForgotStep('request');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('লগইন পেজে ফিরুন', 'Back to Sign In')}</span>
            </button>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  {t('ইউজারনেম / মোবাইল নম্বর / ইমেইল', 'Username / Phone / Email')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={t('যেমন: hossain বা 01886289663', 'e.g. hossain or 01886289663')}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    {t('পাসওয়ার্ড', 'Password')}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotIdentifier(identifier);
                      setForgotStep('request');
                      setMode('forgot');
                    }}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    {t('পাসওয়ার্ড ভুলে গেছেন?', 'Forgot Password?')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('প্রোফাইলে প্রবেশ করুন', 'Sign In to Profile')}</span>
              </button>

              {/* Quick Demo Credentials Pill */}
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-2 text-[11px]">
                <div className="text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {t('ডেমো অ্যাকাউন্ট:', 'Demo Account:')}
                  </span>
                  <span className="font-mono">hossain / 123456</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('hossain');
                    setPassword('123456');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-500 cursor-pointer shrink-0"
                >
                  {t('অটো-ফিল', 'Auto Fill')}
                </button>
              </div>
            </form>
          ) : mode === 'forgot' ? (
            forgotStep === 'request' ? (
              <form onSubmit={handleRequestOtp} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {t('ইউজারনেম / মোবাইল নম্বর / ইমেইল *', 'Username / Phone / Email *')}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder={t('যেমন: hossain বা 01886289663', 'e.g. hossain or 01886289663')}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isSendingOtp ? t('OTP পাঠানো হচ্ছে...', 'Sending OTP...') : t('৬ ডিজিটের OTP পাঠান', 'Send 6-Digit Verification OTP')}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 text-[11px] space-y-1">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {t(
                        `${resetTargetInfo?.customerName || 'কাস্টমার'} (${resetTargetInfo?.contactLabel || ''}) এ OTP পাঠানো হয়েছে`,
                        `OTP sent for ${resetTargetInfo?.customerName || 'account'} (${resetTargetInfo?.contactLabel || ''})`
                      )}
                    </span>
                  </p>
                  <p className="font-mono text-emerald-700 dark:text-emerald-400">
                    {t('ভেরিফিকেশন OTP কোড:', 'Verification OTP Code:')} <strong className="text-sm">{generatedOtp}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('৬ ডিজিটের OTP লিখুন *', 'Enter 6-Digit OTP *')}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-black tracking-widest text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('নতুন পাসওয়ার্ড *', 'New Password *')}
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={4}
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('নিশ্চিত পাসওয়ার্ড *', 'Confirm Password *')}
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={4}
                      value={confirmResetPassword}
                      onChange={(e) => setConfirmResetPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('পাসওয়ার্ড আপডেট ও লগইন করুন', 'Update Password & Return to Login')}</span>
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('পূর্ণ নাম *', 'Full Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={t('আপনার নাম', 'Your Name')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('ইউজারনেম *', 'Username *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="rahim99"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('মোবাইল নম্বর *', 'Phone Number *')}
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('ইমেইল (ঐচ্ছিক)', 'Email (Optional)')}
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('পাসওয়ার্ড সেট করুন *', 'Create Password *')}
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-8 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t('অ্যাকাউন্ট তৈরি ও লগইন', 'Create Account & Sign In')}</span>
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('নিরাপদ কাস্টমার পোর্টাল • BuyOne BD', 'Protected Customer Portal • BuyOne BD')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
