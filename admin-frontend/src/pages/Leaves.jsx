import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter, 
  CalendarRange, 
  AlertCircle 
} from 'lucide-react';

const LeaveRequests = () => {
  const { user } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Apply Form State (for Employees)
  const [formData, setFormData] = useState({
    leaveType: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr';

  const fetchLeaves = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (isAdminOrHR) {
        const res = await api.get('/leaves/all', {
          params: { status: statusFilter }
        });
        if (res.data.success) {
          setLeaves(res.data.data);
        }
      } else {
        const res = await api.get('/leaves/my-leaves');
        if (res.data.success) {
          setLeaves(res.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLeaves();
    }
  }, [user, statusFilter, isAdminOrHR]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      setErrorMsg('Please fill in all details');
      return;
    }

    try {
      const res = await api.post('/leaves', formData);
      if (res.data.success) {
        setSuccessMsg('Leave request submitted successfully!');
        setFormData({
          leaveType: 'Sick Leave',
          startDate: '',
          endDate: '',
          reason: ''
        });
        fetchLeaves();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error applying for leave');
    }
  };

  const handleAction = async (id, status) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.put(`/leaves/${id}`, { status });
      if (res.data.success) {
        setSuccessMsg(`Leave request has been ${status.toLowerCase()}`);
        fetchLeaves();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating leave request');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 w-fit">
            <CheckCircle className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20 w-fit">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-semibold border border-yellow-500/20 w-fit">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-outfit text-white">Leave Management</h2>
        <p className="text-slate-400 text-sm">
          {isAdminOrHR ? 'Review, approve or reject staff leave applications.' : 'Apply for leave and monitor approval histories.'}
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      {/* Split view for employee, single list for admin */}
      {!isAdminOrHR ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Apply Form */}
          <div className="lg:col-span-5">
            <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl space-y-4">
              <h3 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Apply for Leave</span>
              </h3>
              
              <form onSubmit={handleApply} className="space-y-4">
                {/* Leave Type */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Leave Type</label>
                  <select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  >
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Maternity/Paternity Leave">Maternity/Paternity Leave</option>
                    <option value="Unpaid Leave">Unpaid Leave</option>
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      required
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      required
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Reason</label>
                  <textarea
                    name="reason"
                    rows="3"
                    required
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Briefly state your reason..."
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 border border-indigo-500/30"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Application</span>
                </button>
              </form>
            </div>
          </div>

          {/* Leave History List */}
          <div className="lg:col-span-7">
            <div className="glass rounded-3xl border border-white/5 shadow-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/5">
                <h3 className="text-lg font-bold font-outfit text-white">Application History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/20">
                      <th className="py-4 px-6">Leave Type</th>
                      <th className="py-4 px-6">Date Duration</th>
                      <th className="py-4 px-6">Reason</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="py-12 text-center">
                          <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                        </td>
                      </tr>
                    ) : leaves.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-12 text-center text-slate-500 text-sm">
                          No leave applications found.
                        </td>
                      </tr>
                    ) : (
                      leaves.map((leave) => (
                        <tr key={leave._id} className="border-b border-white/[0.03] text-sm text-slate-300 hover:bg-slate-800/10">
                          <td className="py-4 px-6 font-semibold text-slate-200">
                            {leave.leaveType}
                          </td>
                          <td className="py-4 px-6 text-xs">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-400 truncate max-w-[150px]" title={leave.reason}>
                            {leave.reason}
                          </td>
                          <td className="py-4 px-6">
                            {getStatusBadge(leave.status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Admin/HR Full Table with approvals */
        <div className="space-y-4">
          {/* Filters for Admin */}
          <div className="glass rounded-2xl p-5 border border-white/5 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-900/60 text-indigo-400 border border-white/5 flex items-center gap-2 text-xs font-semibold">
                <Filter className="w-4.5 h-4.5" />
                <span>Approval Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl glass-input text-xs font-medium"
              >
                <option value="All">All Requests</option>
                <option value="Pending">Pending Only</option>
                <option value="Approved">Approved Only</option>
                <option value="Rejected">Rejected Only</option>
              </select>
            </div>
          </div>

          {/* Admin Requests Table */}
          <div className="glass rounded-3xl border border-white/5 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/20">
                    <th className="py-4 px-6">Employee Info</th>
                    <th className="py-4 px-6">Leave Type</th>
                    <th className="py-4 px-6">Requested Range</th>
                    <th className="py-4 px-6">Reason Details</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center">
                        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                      </td>
                    </tr>
                  ) : leaves.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500 text-sm">
                        No leave requests logged.
                      </td>
                    </tr>
                  ) : (
                    leaves.map((leave) => (
                      <tr key={leave._id} className="border-b border-white/[0.03] text-sm text-slate-300 hover:bg-slate-800/10">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold font-outfit text-xs">
                              {leave.employeeId?.name ? leave.employeeId.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <p className="text-slate-200 font-semibold font-outfit leading-tight">
                                {leave.employeeId?.name || 'Deleted Employee'}
                              </p>
                              <p className="text-xs text-slate-500">{leave.employeeId?.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-300">
                          {leave.leaveType}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <CalendarRange className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-400 truncate max-w-[200px]" title={leave.reason}>
                          {leave.reason}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(leave.status)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {leave.status === 'Pending' ? (
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handleAction(leave._id, 'Approved')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-xs font-semibold transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(leave._id, 'Rejected')}
                                className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-xs font-semibold transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-medium">
                              Reviewed by Admin
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
