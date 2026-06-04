import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, Mail, Lock, KeyRound, AlertCircle, CheckCircle2, Copy } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Request code, 2 = Verify & Reset
  const [simulatedCode, setSimulatedCode] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const { forgotPassword, resetPassword, user, loading, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  // Clear errors on load
  useEffect(() => {
    setError(null);
    setLocalError('');
    if (user) {
      navigate('/');
    }
  }, [user, navigate, setError]);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLocalError('');
    setError(null);

    if (!email) {
      setLocalError('Please enter your email address');
      return;
    }

    const res = await forgotPassword(email);
    if (res.success) {
      setSimulatedCode(res.code);
      setStep(2);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLocalError('');
    setError(null);

    if (!code || !newPassword) {
      setLocalError('Please fill in both the code and your new password');
      return;
    }

    if (newPassword.length < 6) {
      setLocalError('New password must be at least 6 characters long');
      return;
    }

    const res = await resetPassword(email, code, newPassword);
    if (res.success) {
      setSuccessMsg('Your password has been reset successfully!');
      setStep(3); // success screen
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(simulatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 py-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/25 mb-4">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold font-outfit text-white tracking-tight">
            Reset Password
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {step === 1 && 'Request verification to restore access'}
            {step === 2 && 'Enter verification code and new password'}
            {step === 3 && 'Password successfully updated'}
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-3xl pointer-events-none"></div>

          {/* Form step 1: Request Code */}
          {step === 1 && (
            <form onSubmit={handleRequestCode} className="space-y-6 relative z-10">
              {/* Error alerts */}
              {(localError || error) && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{localError || error}</p>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input text-sm text-white"
                    required
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group border border-indigo-500/30"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>Send Reset Code</span>
                )}
              </button>
            </form>
          )}

          {/* Form step 2: Verification and Reset */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-6 relative z-10">
              {/* Info/Simulated code alert */}
              {simulatedCode && (
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs space-y-2">
                  <p className="font-semibold">Simulated Verification Code Sent:</p>
                  <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                    <code className="text-sm font-mono tracking-widest text-white">{simulatedCode}</code>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-1 hover:bg-white/10 rounded transition-all text-slate-400 hover:text-white"
                      title="Copy Code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {copied && <p className="text-[10px] text-emerald-400 font-semibold">Copied to clipboard!</p>}
                </div>
              )}

              {/* Error alerts */}
              {(localError || error) && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{localError || error}</p>
                </div>
              )}

              {/* Code field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Verification Code
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <KeyRound className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input text-sm text-white font-mono tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {/* New Password field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input text-sm text-white"
                    required
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group border border-indigo-500/30"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          )}

          {/* Step 3: Success Screen */}
          {step === 3 && (
            <div className="text-center py-6 space-y-6 relative z-10">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-slate-300 text-sm font-medium">{successMsg}</p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/20"
              >
                Back to Login
              </Link>
            </div>
          )}

          {/* Links */}
          {step !== 3 && (
            <div className="mt-6 text-center text-xs text-slate-400">
              <p>
                Remember your password?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-all">
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
