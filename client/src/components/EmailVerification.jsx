import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { verifyEmailAPI, resendVerificationAPI } from '../services/auth';
import { LiveTimeDateWidget, InteractiveAuthFooter } from './AuthInteractiveWidgets';

export default function EmailVerification({
  email: initialEmail = '',
  token: initialToken = '',
  onVerificationSuccess,
  onSwitchToLogin,
}) {
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [token, setToken] = useState(initialToken);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Sync initial props
  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  // Auto verify if URL token is present
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');

    if (urlEmail) {
      setEmail(urlEmail);
    }

    if (urlToken) {
      setToken(urlToken);
      handleAutoVerifyWithToken(urlToken, urlEmail || email);
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleAutoVerifyWithToken = async (tokenVal, emailVal) => {
    setLoading(true);
    setError('');
    try {
      const res = await verifyEmailAPI({ token: tokenVal, email: emailVal });
      if (res.success) {
        setSuccessMsg(res.message || 'Email verified successfully! Redirecting to sign in...');
        if (onVerificationSuccess) {
          setTimeout(() => {
            onVerificationSuccess({
              email: res.email || emailVal || email,
              message: res.message || 'Email confirmed successfully! Please sign in with your password.',
            });
          }, 1200);
        }
      } else {
        setError(res.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Paste handling
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setOtp(newOtp);
      const nextInput = document.getElementById(`otp-input-${Math.min(digits.length, 5)}`);
      if (nextInput) nextInput.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmitOTP = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await verifyEmailAPI({ otp: otpCode, email });
      if (res.success) {
        setSuccessMsg(res.message || 'Email verified successfully! Redirecting to sign in...');
        if (onVerificationSuccess) {
          setTimeout(() => {
            onVerificationSuccess({
              email: res.email || email,
              message: res.message || 'Email confirmed successfully! Please sign in with your password.',
            });
          }, 1200);
        }
      } else {
        setError(res.message || 'Invalid code');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Code may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please provide an email address.');
      return;
    }

    setResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await resendVerificationAPI(email);
      if (res.success) {
        setSuccessMsg(res.message || 'A new confirmation email has been sent to your inbox!');
        setResendCooldown(60); // 60s cooldown
      } else {
        setError(res.message || 'Failed to resend email');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-6 p-1">
      {/* Live Dynamic Date & Time Widget */}
      <LiveTimeDateWidget />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors">
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Confirm Your Email</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            We sent a 6-digit confirmation code to your inbox:
          </p>
          <div className="inline-block mt-2 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3.5 py-1 rounded-full text-xs">
            {email || 'your email address'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Please check your real email inbox and spam folder.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-semibold">{successMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitOTP} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 text-center">
              Enter 6-Digit Code
            </label>
            <div className="flex items-center justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 text-center font-bold text-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-900 dark:text-white outline-none transition"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length < 6}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Verify & Activate Account</span>
                <ShieldCheck className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 text-center space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Didn't receive the email? Check your spam folder or
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || resendCooldown > 0}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>
              {resendCooldown > 0
                ? `Resend Code in ${resendCooldown}s`
                : resending
                ? 'Sending Email...'
                : 'Resend Confirmation Email'}
            </span>
          </button>

          <div className="pt-2">
            <button
              onClick={onSwitchToLogin}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Creator and MERN Stack Branding */}
      <InteractiveAuthFooter />
    </div>
  );
}

