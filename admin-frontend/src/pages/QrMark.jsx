import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { CheckCircle2, XCircle, Clock, AlertTriangle, CalendarDays, ArrowLeft, Check, Loader } from 'lucide-react';

const SHIFTS = [
  { id: 'morning', name: 'Morning Shift', timings: '09:00 AM - 05:00 PM', value: 'Morning Shift (09:00 AM - 05:00 PM)' },
  { id: 'afternoon', name: 'Afternoon Shift', timings: '02:00 PM - 10:00 PM', value: 'Afternoon Shift (02:00 PM - 10:00 PM)' },
  { id: 'night', name: 'Night Shift', timings: '10:00 PM - 06:00 AM', value: 'Night Shift (10:00 PM - 06:00 AM)' }
];

const QrMark = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [markedOption, setMarkedOption] = useState(null); // 'Present' or 'Absent'
  const [resultData, setResultData] = useState(null);
  const [selectedShift, setSelectedShift] = useState(SHIFTS[0].value);

  const handleMark = async (option) => {
    if (!email) {
      setStatus('error');
      setErrorMsg('No email parameter provided in the QR code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/attendance/qr-mark-option', { 
        email, 
        option,
        shift: selectedShift
      });
      if (res.data.success) {
        setMarkedOption(option);
        setResultData(res.data.data);
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(res.data.message || 'Failed to register attendance option.');
      }
    } catch (err) {
      console.error('QR mark option error:', err);
      setStatus('error');
      const targetUrl = (api.defaults.baseURL || '') + '/attendance/qr-mark-option';
      setErrorMsg(err.response?.data?.message || `Server connection error. Tried calling: ${targetUrl}. Please ensure your backend is online.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-3xl pointer-events-none"></div>

          {status === 'idle' && (
            <div className="space-y-6 relative z-10">
              {/* Header */}
              <div className="text-center">
                <div className="inline-flex p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>
                <h2 className="text-2xl font-extrabold font-outfit text-white">QR Attendance Portal</h2>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Terminal scanned for <span className="text-indigo-400 font-semibold">{email || 'Unknown User'}</span>
                </p>
              </div>

              {/* Warning if no email */}
              {!email && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p>QR code has no valid email. Please scan a valid profile QR code.</p>
                </div>
              )}

              {/* Shift Selection */}
              <div className="space-y-3">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-outfit block text-left">
                  Select Work Shift & Timings
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {SHIFTS.map((shift) => (
                    <button
                      key={shift.id}
                      type="button"
                      onClick={() => setSelectedShift(shift.value)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                        selectedShift === shift.value
                          ? 'bg-indigo-500/10 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-200 font-outfit">{shift.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-400" /> {shift.timings}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedShift === shift.value
                          ? 'border-indigo-500 bg-indigo-500 text-white'
                          : 'border-white/20'
                      }`}>
                        {selectedShift === shift.value && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Cards */}
              <div className="space-y-4 pt-2">
                {/* Present Option */}
                <button
                  type="button"
                  disabled={loading || !email}
                  onClick={() => handleMark('Present')}
                  className="w-full flex items-center justify-between p-5 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 text-left transition-all duration-200 group active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-400 font-outfit text-sm">Mark Present</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Clock in for selected shift</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check className="w-4 h-4" />
                  </div>
                </button>

                {/* Absent Option */}
                <button
                  type="button"
                  disabled={loading || !email}
                  onClick={() => handleMark('Absent')}
                  className="w-full flex items-center justify-between p-5 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 text-left transition-all duration-200 group active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-rose-400 font-outfit text-sm">Mark Absent</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Register absence status for today</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check className="w-4 h-4" />
                  </div>
                </button>
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-2 text-indigo-400 text-xs font-semibold py-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Submitting attendance...</span>
                </div>
              )}
            </div>
          )}

          {status === 'success' && resultData && (
            <div className="text-center space-y-6 relative z-10 animate-fadeIn">
              <div className="flex justify-center">
                <div className={`p-4 rounded-full border shadow-lg ${
                  markedOption === 'Present'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5'
                }`}>
                  {markedOption === 'Present' ? (
                    <CheckCircle2 className="w-16 h-16 animate-bounce" />
                  ) : (
                    <XCircle className="w-16 h-16 animate-pulse" />
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-extrabold font-outfit text-white">
                  {markedOption === 'Present' ? 'Present Recorded!' : 'Absent Registered'}
                </h2>
                <p className="text-slate-400 text-sm mt-1">Status saved for {resultData.name}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3 text-left">
                <div className="flex justify-between items-center text-xs font-semibold border-b border-white/5 pb-2">
                  <span className="text-slate-400">Employee Email:</span>
                  <span className="text-slate-200">{resultData.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold border-b border-white/5 pb-2">
                  <span className="text-slate-400">Attendance Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    resultData.status === 'Present' || resultData.status === 'Late'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {resultData.status}
                  </span>
                </div>
                {resultData.shift && (
                  <div className="flex justify-between items-center text-xs font-semibold border-b border-white/5 pb-2">
                    <span className="text-slate-400">Shift timing:</span>
                    <span className="text-indigo-400 text-right">{resultData.shift}</span>
                  </div>
                )}
                {markedOption === 'Present' && resultData.clockIn && (
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400">Time Registered:</span>
                    <span className="text-emerald-400 font-mono text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {resultData.clockIn}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
              >
                <span>Go to Portal Login</span>
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
                <h2 className="text-3xl font-extrabold font-outfit text-rose-400">Action Failed</h2>
                <p className="text-slate-400 text-sm mt-2">Unable to process attendance selection.</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-300 text-xs leading-relaxed">
                {errorMsg}
              </div>

              <button
                onClick={() => setStatus('idle')}
                className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all duration-200 border border-white/5 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrMark;
