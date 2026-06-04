import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  CalendarDays, 
  Search, 
  CheckCircle, 
  X, 
  AlertCircle, 
  UserCheck, 
  Clock, 
  AlertTriangle,
  HelpCircle,
  XCircle
} from 'lucide-react';

const AttendanceLogs = () => {
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Filtering & Search
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  // Modal / Adjustment state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    status: 'Present',
    clockIn: '',
    clockOut: '',
    shift: 'Morning Shift (09:00 AM - 05:00 PM)'
  });

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/attendance/daily', {
        params: { date: selectedDate }
      });
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedDate]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenAdjust = (employee, existingLog) => {
    setSelectedEmployee(employee);
    setFormData({
      status: existingLog?.status || 'Present',
      clockIn: existingLog?.clockIn || '',
      clockOut: existingLog?.clockOut || '',
      shift: existingLog?.shift || 'Morning Shift (09:00 AM - 05:00 PM)'
    });
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/attendance/admin-mark', {
        employeeId: selectedEmployee._id,
        date: selectedDate,
        ...formData
      });
      if (res.data.success) {
        setSuccessMsg(`Attendance updated for ${selectedEmployee.name}`);
        setIsOpen(false);
        fetchLogs();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error adjusting attendance');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 w-fit">
            <CheckCircle className="w-3.5 h-3.5" /> Present
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
            <XCircle className="w-3.5 h-3.5" /> Absent
          </span>
        );
      default:
        return (
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Not Marked
          </span>
        );
    }
  };

  // Filter employees shown based on search input
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-outfit text-white">Daily Attendance Logs</h2>
        <p className="text-slate-400 text-sm">Review daily log sheets and manually adjust timing or statuses.</p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm animate-shake">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          <p>{successMsg}</p>
        </div>
      )}

      {/* Date Filter & Search Panel */}
      <div className="glass rounded-2xl p-5 border border-white/5 shadow-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Date Selector */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 rounded-xl bg-slate-900/60 text-indigo-400 border border-white/5 flex items-center gap-2 text-xs font-semibold">
            <CalendarDays className="w-4 h-4" />
            <span>Select Date:</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs font-medium"
          />
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass rounded-3xl border border-white/5 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/20">
                <th className="py-4 px-6">Employee Info</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Shift</th>
                <th className="py-4 px-6">Log Status</th>
                <th className="py-4 px-6">Clock In Time</th>
                <th className="py-4 px-6">Clock Out Time</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 text-sm">
                    No matching employee logs found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  // Find log for this employee
                  const log = logs.find(l => l.employeeId?._id === emp._id || l.employeeId === emp._id);
                  return (
                    <tr key={emp._id} className="border-b border-white/[0.03] text-sm text-slate-300 hover:bg-slate-800/10 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold font-outfit text-xs">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-slate-200 font-semibold font-outfit leading-tight">{emp.name}</p>
                            <p className="text-xs text-slate-500">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-medium">
                        {emp.department}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-300 font-medium">
                        {log?.shift || 'Morning Shift (09:00 AM - 05:00 PM)'}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(log?.status)}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-400">
                        {log?.clockIn || '--:--'}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-400">
                        {log?.clockOut || '--:--'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenAdjust(emp, log)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 text-xs font-semibold transition-all"
                        >
                          Adjust Log
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal Overlay */}
      {isOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass border border-white/10 rounded-3xl p-6 shadow-2xl animate-zoomIn">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-md font-bold font-outfit text-white">
                  Adjust Log: {selectedEmployee.name}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Select Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Duty Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half-day">Half-day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              {/* Select Shift */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Work Shift & Timings</label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                >
                  <option value="Morning Shift (09:00 AM - 05:00 PM)">Morning Shift (09:00 AM - 05:00 PM)</option>
                  <option value="Afternoon Shift (02:00 PM - 10:00 PM)">Afternoon Shift (02:00 PM - 10:00 PM)</option>
                  <option value="Night Shift (10:00 PM - 06:00 AM)">Night Shift (10:00 PM - 06:00 AM)</option>
                </select>
              </div>

              {/* Duty Timings */}
              {formData.status !== 'Absent' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Clock In
                    </label>
                    <input
                      type="text"
                      name="clockIn"
                      placeholder="e.g. 09:00 AM"
                      value={formData.clockIn}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Clock Out
                    </label>
                    <input
                      type="text"
                      name="clockOut"
                      placeholder="e.g. 05:00 PM"
                      value={formData.clockOut}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all border border-white/5"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all border border-indigo-500/20 shadow-lg shadow-indigo-500/10"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceLogs;
