import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, AlertTriangle, Clock, ArrowRight, Loader } from 'lucide-react';

const QrClockIn = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();
  const { qrLogin } = useContext(AuthContext);

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [clockInfo, setClockInfo] = useState(null);

  useEffect(() => {
    const processQrClockIn = async () => {
      if (!email) {
        setStatus('error');
        setErrorMsg('Invalid QR code URL. No email parameter found.');
        return;
      }

      try {
        const res = await api.post('/auth/qr-login-clock-in', { email });
        if (res.data.success) {
          const { token, ...userData } = res.data;
          
          // Set user clock info for displaying on screen
          setClockInfo({
            name: res.data.name,
            email: res.data.email,
            clockIn: res.data.clockIn,
            status: res.data.status,
            alreadyClockedIn: res.data.alreadyClockedIn,
          });

          // Perform context login
          qrLogin(userData, token);
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg(res.data.message || 'Verification failed.');
        }
      } catch (err) {
        console.error('QR Clock In error:', err);
        setStatus('error');
        setErrorMsg(err.response?.data?.message || 'Server error occurred during verification.');
      }
    };

    processQrClockIn();
  }, [email, qrLogin]);

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-3xl pointer-events-none"></div>

          {status === 'verifying' && (
            <div className="text-center py-10 space-y-6 relative z-10">
              <div className="flex justify-center">
                <Loader className="w-16 h-16 text-indigo-500 animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold font-outfit text-white">Verifying QR Code</h2>
                <p className="text-slate-400 text-sm mt-2">Connecting to secure terminal and logging you in...</p>
              </div>
            </div>
          )}

          {status === 'success' && clockInfo && (
            <div className="text-center space-y-6 relative z-10 animate-fadeIn">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                  <CheckCircle className="w-16 h-16 animate-bounce" />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-extrabold font-outfit text-white">Attendance Marked!</h2>
                <p className="text-slate-400 text-sm mt-1">Welcome back, {clockInfo.name}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3 text-left">
                <div className="flex justify-between items-center text-xs font-semibold border-b border-white/5 pb-2">
                  <span className="text-slate-400">Clock In Time:</span>
                  <span className="text-emerald-400 font-mono text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {clockInfo.clockIn}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-400">Duty Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    clockInfo.status === 'Present' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {clockInfo.status}
                  </span>
                </div>
              </div>

              {clockInfo.alreadyClockedIn && (
                <p className="text-xs text-yellow-500/80 font-medium">
                  Note: You had already clocked in earlier today. Logs are updated.
                </p>
              )}

              <button
                onClick={() => navigate('/')}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2 group border border-indigo-500/30"
              >
                <span>Enter Portal Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-6 relative z-10 animate-fadeIn">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-lg shadow-rose-500/5 animate-pulse">
                  <AlertTriangle className="w-16 h-16" />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-extrabold font-outfit text-rose-400">Attendance Failed</h2>
                <p className="text-slate-400 text-sm mt-2">We could not process this QR request.</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-300 text-xs leading-relaxed">
                {errorMsg}
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all duration-200 border border-white/5 flex items-center justify-center gap-2"
              >
                <span>Back to Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrClockIn;
