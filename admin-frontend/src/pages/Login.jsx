import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, user, loading, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  // Clear errors on load
  useEffect(() => {
    setError(null);
    setLocalError('');
    if (user) {
      navigate('/');
    }
  }, [user, navigate, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setError(null);

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/25 mb-4">
            <Briefcase className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold font-outfit text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Access the Employee Management Portal
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-3xl pointer-events-none"></div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
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
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input text-sm"
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
                <>
                  <span>Sign In</span>
                  <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 glass rounded-2xl p-4 text-center border border-white/5 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">Demo Account Credentials:</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-1.5 rounded-lg bg-slate-900/50 border border-white/5">
              <span className="text-indigo-400 font-bold block">Admin Access</span>
              <code className="text-[10px] text-slate-300">admin@ems.com / adminpassword123</code>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900/50 border border-white/5">
              <span className="text-indigo-400 font-bold block">HR Access</span>
              <code className="text-[10px] text-slate-300">hr@ems.com / hrpassword123</code>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900/50 border border-white/5 col-span-2">
              <span className="text-indigo-400 font-bold block">Employee Access</span>
              <code className="text-[10px] text-slate-300">john@ems.com / employeepassword123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
