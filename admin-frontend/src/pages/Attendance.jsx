import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  CalendarClock, 
  CalendarRange, 
  CheckCircle2, 
  AlertTriangle, 
  MinusCircle, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const AttendanceHistory = () => {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Date states for filtering monthly summary
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1-12

  const fetchAttendance = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Fetch monthly summary which contains both summary scorecard and filtered history logs
      const summaryRes = await api.get('/attendance/summary', {
        params: { year: selectedYear, month: selectedMonth }
      });
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data.summary);
        setAttendance(summaryRes.data.data.history);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedYear, selectedMonth]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> Present
          </span>
        );
      case 'Late':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-semibold border border-yellow-500/20 w-fit">
            <AlertTriangle className="w-3.5 h-3.5" /> Late
          </span>
        );
      case 'Half-day':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20 w-fit">
            <HelpCircle className="w-3.5 h-3.5" /> Half-day
          </span>
        );
      case 'Absent':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20 w-fit">
            <MinusCircle className="w-3.5 h-3.5" /> Absent
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-outfit text-white">Attendance Logs</h2>
        <p className="text-slate-400 text-sm">Track your clock-in timings, total hours, and monthly summaries.</p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Grid of filters and summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Summary Form */}
        <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold font-outfit text-white mb-4">Summary Period</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Select Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium"
                >
                  {[2024, 2025, 2026, 2027].map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Select Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium"
                >
                  {[
                    { val: 1, name: 'January' },
                    { val: 2, name: 'February' },
                    { val: 3, name: 'March' },
                    { val: 4, name: 'April' },
                    { val: 5, name: 'May' },
                    { val: 6, name: 'June' },
                    { val: 7, name: 'July' },
                    { val: 8, name: 'August' },
                    { val: 9, name: 'September' },
                    { val: 10, name: 'October' },
                    { val: 11, name: 'November' },
                    { val: 12, name: 'December' },
                  ].map((m) => (
                    <option key={m.val} value={m.val}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/5 text-xs text-slate-500 font-medium">
            <p className="flex items-center gap-1">
              <CalendarRange className="w-4 h-4 text-indigo-400" />
              <span>Summary refreshes automatically on changes.</span>
            </p>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl lg:col-span-8">
          <h3 className="text-lg font-bold font-outfit text-white mb-6">Monthly Scorecard</h3>
          {summary ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-medium">Present days</span>
                <span className="text-3xl font-extrabold font-mono text-emerald-400 mt-2">{summary.present}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-medium">Late arrivals</span>
                <span className="text-3xl font-extrabold font-mono text-yellow-400 mt-2">{summary.late}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-medium">Half-days</span>
                <span className="text-3xl font-extrabold font-mono text-cyan-400 mt-2">{summary.halfDay}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-medium">Absences</span>
                <span className="text-3xl font-extrabold font-mono text-rose-400 mt-2">{summary.absent}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              Select date options to compute statistics.
            </div>
          )}
        </div>
      </div>

      {/* History table */}
      <div className="glass rounded-3xl border border-white/5 shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5">
          <h3 className="text-lg font-bold font-outfit text-white">Full Shift Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/20">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Shift</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Clock In Time</th>
                <th className="py-4 px-6">Clock Out Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500 text-sm">
                    No attendance records found. Click in today to start log!
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record._id} className="border-b border-white/[0.03] text-sm text-slate-300 hover:bg-slate-800/10 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-200">
                      {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300 font-medium">
                      {record.shift || 'Morning Shift (09:00 AM - 05:00 PM)'}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-400">
                      {record.clockIn || '--:--'}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-400">
                      {record.clockOut || '--:--'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
