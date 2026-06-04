import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Users, 
  Building, 
  FileCheck, 
  Clock, 
  LogIn, 
  LogOut,
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  // Clock widget states (for Employee)
  const [clockStatus, setClockStatus] = useState({
    isClockedIn: false,
    isClockedOut: false,
    clockInTime: null,
    clockOutTime: null,
    statusToday: null
  });
  const [clockLoading, setClockLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr';

  // Mount check to safely render browser-only Recharts components
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (isAdminOrHR) {
        const res = await api.get('/dashboard/admin');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } else {
        const res = await api.get('/dashboard/employee');
        if (res.data.success) {
          setStats(res.data.data);
          setClockStatus(res.data.data.todayClockStatus);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setErrorMsg('Failed to load dashboard metrics. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, isAdminOrHR]);

  const handleClockIn = async () => {
    setClockLoading(true);
    setMessage('');
    setErrorMsg('');
    try {
      const res = await api.post('/attendance/clock-in');
      if (res.data.success) {
        setMessage(res.data.message);
        fetchDashboardData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to clock in');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    setMessage('');
    setErrorMsg('');
    try {
      const res = await api.post('/attendance/clock-out');
      if (res.data.success) {
        setMessage(res.data.message);
        fetchDashboardData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to clock out');
    } finally {
      setClockLoading(false);
    }
  };

  const handleLeaveAction = async (id, status) => {
    try {
      const res = await api.put(`/leaves/${id}`, { status });
      if (res.data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error updating leave request status:', err);
      alert('Failed to update leave status');
    }
  };

  // Live Clock component
  const LiveClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);

    return (
      <div className="text-center py-2">
        <p className="text-3xl font-bold font-mono tracking-wider text-slate-100">
          {time.toLocaleTimeString()}
        </p>
        <p className="text-xs text-indigo-400 font-medium mt-1">
          {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    );
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Define department colors for chart
  const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  const qrHost = stats?.localIp || 'localhost';
  const qrPort = window.location.port || '3001';
  const qrTargetUrl = `http://${qrHost}:${qrPort}/qr-mark?email=${user?.email}`;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome banner */}
      <div className="glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none"></div>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-outfit text-white">
            Hello, {user.name} 👋
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back to the portal. You are logged in as{' '}
            <span className="text-indigo-400 font-semibold uppercase">{user.role}</span>.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-900/60 border border-white/5 text-slate-300 text-xs flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>Session Date: {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {message && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p>{message}</p>
        </div>
      )}

      {/* Render Admin / HR Dashboard */}
      {isAdminOrHR && stats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Employees */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 shadow-xl flex items-center gap-5 hover:border-indigo-500/30 transition-all duration-300 group">
              <div className="p-4 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Employees</p>
                <p className="text-3xl font-extrabold font-outfit text-white mt-1">{stats.summary.totalEmployees}</p>
              </div>
            </div>

            {/* Total Departments */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 shadow-xl flex items-center gap-5 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="p-4 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Departments</p>
                <p className="text-3xl font-extrabold font-outfit text-white mt-1">{stats.summary.totalDepartments}</p>
              </div>
            </div>

            {/* Pending Leaves */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 shadow-xl flex items-center gap-5 hover:border-yellow-500/30 transition-all duration-300 group">
              <div className="p-4 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 group-hover:bg-yellow-500 group-hover:text-white transition-all">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Leaves</p>
                <p className="text-3xl font-extrabold font-outfit text-white mt-1">
                  {stats.summary.pendingLeaves}
                </p>
              </div>
            </div>

            {/* Attendance Present Rate */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 shadow-xl flex items-center gap-5 hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Present Rate</p>
                <p className="text-3xl font-extrabold font-outfit text-white mt-1">{stats.summary.attendancePresentRate}%</p>
              </div>
            </div>
          </div>

          {/* Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Today's Attendance breakdown (Bar Chart) */}
            <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl lg:col-span-7">
              <h3 className="text-lg font-bold font-outfit text-white mb-4">Today's Attendance Status</h3>
              <div className="h-64">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Present', count: stats.attendanceToday.present, color: '#10b981' },
                        { name: 'Late', count: stats.attendanceToday.late, color: '#f59e0b' },
                        { name: 'Half-day', count: stats.attendanceToday.halfDay, color: '#06b6d4' },
                        { name: 'Absent', count: stats.attendanceToday.absent, color: '#ef4444' }
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f3f4f6' }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {[
                          { color: '#10b981' },
                          { color: '#f59e0b' },
                          { color: '#06b6d4' },
                          { color: '#ef4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl lg:col-span-5 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold font-outfit text-white mb-4">Department Breakdown</h3>
                <div className="space-y-4">
                  {stats.departmentBreakdown.map((dept, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3.5 h-3.5 rounded-full shrink-0" 
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        ></div>
                        <span className="text-sm font-semibold text-slate-200">{dept.department}</span>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="text-xs text-slate-400 block">Avg Salary</span>
                          <span className="text-sm font-medium text-indigo-400 font-mono">${dept.avgSalary.toLocaleString()}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold font-mono">
                          {dept.count}
                        </span>
                      </div>
                    </div>
                  ))}
                  {stats.departmentBreakdown.length === 0 && (
                    <p className="text-xs text-slate-500 py-6 text-center">No department breakdown available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pending leaves and recent joins */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Leave Requests */}
            <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold font-outfit text-white">Pending Leave Requests</h3>
                <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold">
                  {stats.recentLeaves.filter(l => l.status === 'Pending').length} Pending
                </span>
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-slate-400 font-semibold">
                      <th className="py-3 px-2">Employee</th>
                      <th className="py-3 px-2">Type</th>
                      <th className="py-3 px-2">Dates</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentLeaves.filter(l => l.status === 'Pending').slice(0, 3).map((leave) => (
                      <tr key={leave._id} className="border-b border-white/[0.03] text-sm text-slate-300 hover:bg-slate-800/10">
                        <td className="py-3 px-2 font-medium">
                          <p className="text-slate-200 font-outfit">{leave.employeeId?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-slate-500">{leave.employeeId?.designation}</p>
                        </td>
                        <td className="py-3 px-2">{leave.leaveType}</td>
                        <td className="py-3 px-2 text-xs">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleLeaveAction(leave._id, 'Approved')}
                              className="p-1 px-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-xs font-semibold transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleLeaveAction(leave._id, 'Rejected')}
                              className="p-1 px-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-xs font-semibold transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {stats.recentLeaves.filter(l => l.status === 'Pending').length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-xs text-slate-500 py-8 text-center">
                          No pending leave requests.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recently Joined Employees */}
            <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl flex flex-col">
              <h3 className="text-lg font-bold font-outfit text-white mb-4">Recently Hired</h3>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-slate-400 font-semibold">
                      <th className="py-3 px-2">Name</th>
                      <th className="py-3 px-2">Department</th>
                      <th className="py-3 px-2">Designation</th>
                      <th className="py-3 px-2 text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentEmployees.map((emp) => (
                      <tr key={emp._id} className="border-b border-white/[0.03] text-sm text-slate-300 hover:bg-slate-800/10">
                        <td className="py-3 px-2 font-medium">
                          <p className="text-slate-200 font-outfit">{emp.name}</p>
                          <p className="text-[10px] text-slate-500">{emp.email}</p>
                        </td>
                        <td className="py-3 px-2">{emp.department}</td>
                        <td className="py-3 px-2">{emp.designation}</td>
                        <td className="py-3 px-2 text-xs text-right text-slate-400">
                          {new Date(emp.joiningDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {stats.recentEmployees.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-xs text-slate-500 py-8 text-center">
                          No employees recently joined.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile QR Attendance */}
          <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl text-center space-y-4 max-w-md mx-auto mt-8">
            <h3 className="text-lg font-bold font-outfit text-white text-left">Mobile QR Attendance</h3>
            <p className="text-xs text-slate-400 text-left leading-relaxed">
              Scan this QR code using your mobile phone's camera, then choose whether you are <strong>Present</strong> or <strong>Absent</strong> on your mobile screen.
            </p>
            
            {/* QR Image */}
            <div className="inline-block p-4 rounded-2xl bg-white/5 border border-white/5 relative group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=6366f1&bgcolor=0f172a&data=${encodeURIComponent(
                    qrTargetUrl
                  )}`}
                  alt="My Personal Check-in QR"
                  className="w-36 h-36 rounded-xl border border-white/10 transition-transform duration-300 group-hover:scale-110"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-indigo-950/90 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center transition-all duration-300 text-center p-3 rounded-xl border border-indigo-500/30">
                  <span className="animate-bounce mb-1 text-lg">📱</span>
                  <span className="text-[10px] font-extrabold font-outfit text-indigo-400 uppercase tracking-wider block">Scan Here</span>
                  <span className="text-[9px] text-slate-300 leading-normal block mt-1">to mark attendance!</span>
                </div>
              </div>
            </div>

            {/* Simulation Link */}
            <button
              type="button"
              onClick={() => window.open(qrTargetUrl, '_blank')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 font-semibold text-xs border border-indigo-500/20 flex items-center justify-center gap-2 transition-all duration-200"
            >
              <span>Simulate Phone Scan (Open in New Tab)</span>
            </button>
          </div>
        </>
      )}

      {/* Render Employee Dashboard */}
      {!isAdminOrHR && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Clock Widget and Leave Balance */}
          <div className="lg:col-span-5 space-y-6">
            {/* Clock Widget */}
            <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl flex flex-col justify-between items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                <Clock className="w-5 h-5 text-indigo-400 animate-spin animate-duration-3000" />
              </div>
              
              <LiveClock />

              <div className="w-full my-6 p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
                <div className="flex justify-between text-xs font-semibold border-b border-white/5 pb-2">
                  <span className="text-slate-400">Clock In:</span>
                  <span className="text-slate-200 font-mono">{clockStatus.clockInTime || '--:--'}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Clock Out:</span>
                  <span className="text-slate-200 font-mono">{clockStatus.clockOutTime || '--:--'}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="w-full flex gap-3">
                {!clockStatus.isClockedIn ? (
                  <button
                    onClick={handleClockIn}
                    disabled={clockLoading}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Clock In</span>
                  </button>
                ) : !clockStatus.isClockedOut ? (
                  <button
                    onClick={handleClockOut}
                    disabled={clockLoading}
                    className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-rose-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Clock Out</span>
                  </button>
                ) : (
                  <div className="flex-1 py-3 px-4 rounded-xl bg-slate-800 border border-white/5 text-slate-400 font-semibold text-sm flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Shift Completed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile QR Attendance */}
            <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl text-center space-y-4">
              <h3 className="text-lg font-bold font-outfit text-white text-left">Mobile QR Attendance</h3>
              <p className="text-xs text-slate-400 text-left leading-relaxed">
                Scan this QR code using your mobile phone's camera, then choose whether you are <strong>Present</strong> or <strong>Absent</strong> on your mobile screen.
              </p>
              
              {/* QR Image */}
              <div className="inline-block p-4 rounded-2xl bg-white/5 border border-white/5 relative group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=6366f1&bgcolor=0f172a&data=${encodeURIComponent(
                      qrTargetUrl
                    )}`}
                    alt="My Personal Check-in QR"
                    className="w-36 h-36 rounded-xl border border-white/10 transition-transform duration-300 group-hover:scale-110"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-indigo-950/90 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center transition-all duration-300 text-center p-3 rounded-xl border border-indigo-500/30">
                    <span className="animate-bounce mb-1 text-lg">📱</span>
                    <span className="text-[10px] font-extrabold font-outfit text-indigo-400 uppercase tracking-wider block">Scan Here</span>
                    <span className="text-[9px] text-slate-300 leading-normal block mt-1">to mark attendance!</span>
                  </div>
                </div>
              </div>

              {/* Simulation Link */}
              <button
                type="button"
                onClick={() => window.open(qrTargetUrl, '_blank')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 font-semibold text-xs border border-indigo-500/20 flex items-center justify-center gap-2 transition-all duration-200"
              >
                <span>Simulate Phone Scan (Open in New Tab)</span>
              </button>
            </div>

            {/* Leave Metrics */}
            <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl">
              <h3 className="text-lg font-bold font-outfit text-white mb-4">My Leave Balance</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/25">
                  <span className="text-xl font-bold font-mono text-indigo-400">{stats.leaveStats.approved}</span>
                  <span className="text-[10px] text-indigo-300 block font-semibold uppercase mt-1">Approved</span>
                </div>
                <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/25">
                  <span className="text-xl font-bold font-mono text-yellow-400">{stats.leaveStats.pending}</span>
                  <span className="text-[10px] text-yellow-300 block font-semibold uppercase mt-1">Pending</span>
                </div>
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25">
                  <span className="text-xl font-bold font-mono text-rose-400">{stats.leaveStats.rejected}</span>
                  <span className="text-[10px] text-rose-300 block font-semibold uppercase mt-1">Rejected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Attendance Performance Chart */}
          <div className="lg:col-span-7 space-y-6">
            {/* Monthly Attendance Chart */}
            <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl">
              <h3 className="text-lg font-bold font-outfit text-white mb-4">This Month's Attendance Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
                <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                  <span className="text-xs text-slate-400 block">Present</span>
                  <span className="text-lg font-extrabold font-mono text-emerald-400">{stats.attendanceStats.present}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                  <span className="text-xs text-slate-400 block">Late Arrival</span>
                  <span className="text-lg font-extrabold font-mono text-yellow-400">{stats.attendanceStats.late}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                  <span className="text-xs text-slate-400 block">Half-day</span>
                  <span className="text-lg font-extrabold font-mono text-cyan-400">{stats.attendanceStats.halfDay}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                  <span className="text-xs text-slate-400 block">Absent</span>
                  <span className="text-lg font-extrabold font-mono text-rose-400">{stats.attendanceStats.absent}</span>
                </div>
              </div>

              {/* Status bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Attendance Progress</span>
                  <span className="font-semibold text-slate-200">
                    {stats.attendanceStats.totalMarked > 0 
                      ? Math.round(((stats.attendanceStats.present + stats.attendanceStats.late + stats.attendanceStats.halfDay) / 22) * 100)
                      : 0}% of expected monthly days (22)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 border border-white/5 overflow-hidden flex">
                  {stats.attendanceStats.totalMarked > 0 && (
                    <>
                      <div className="h-full bg-emerald-500" style={{ width: `${(stats.attendanceStats.present / 22) * 100}%` }}></div>
                      <div className="h-full bg-yellow-500" style={{ width: `${(stats.attendanceStats.late / 22) * 100}%` }}></div>
                      <div className="h-full bg-cyan-500" style={{ width: `${(stats.attendanceStats.halfDay / 22) * 100}%` }}></div>
                      <div className="h-full bg-rose-500" style={{ width: `${(stats.attendanceStats.absent / 22) * 100}%` }}></div>
                    </>
                  )}
                </div>
                <div className="flex gap-4 justify-center text-[10px] text-slate-500 pt-2 font-medium">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Present
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div> Late
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-500"></div> Half-day
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Absent
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
