import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Filter, 
  X, 
  UserPlus, 
  Mail, 
  Phone, 
  DollarSign, 
  Calendar,
  Briefcase,
  AlertCircle
} from 'lucide-react';

const EmployeeList = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');

  // Modal / Sidebar Form States
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'General',
    salary: '',
    joiningDate: '',
    phone: '',
    designation: ''
  });

  const isOnlyAdmin = user?.role === 'admin';

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedDept && selectedDept !== 'All') params.department = selectedDept;
      if (selectedRole && selectedRole !== 'All') params.role = selectedRole;

      const res = await api.get('/employees', { params });
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load employees list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user, search, selectedDept, selectedRole]);

  useEffect(() => {
    if (user) {
      fetchDepartments();
    }
  }, [user]);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      department: departments[0]?.name || 'General',
      salary: '',
      joiningDate: new Date().toISOString().split('T')[0],
      phone: '',
      designation: ''
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setIsEditMode(true);
    setEditingId(emp._id);
    setFormData({
      name: emp.name,
      email: emp.email,
      password: '', // Leave blank unless changing
      role: emp.role,
      department: emp.department,
      salary: emp.salary,
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
      phone: emp.phone || '',
      designation: emp.designation || ''
    });
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (isEditMode) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // Don't send empty password

        const res = await api.put(`/employees/${editingId}`, payload);
        if (res.data.success) {
          setIsOpen(false);
          fetchEmployees();
        }
      } else {
        if (!formData.password) {
          setErrorMsg('Password is required for new employees');
          return;
        }
        const res = await api.post('/employees', formData);
        if (res.data.success) {
          setIsOpen(false);
          fetchEmployees();
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error saving employee details');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to remove this employee? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await api.delete(`/employees/${id}`);
      if (res.data.success) {
        fetchEmployees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting employee');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-outfit text-white">Employees</h2>
          <p className="text-slate-400 text-sm">Manage staff records, departments, and roles.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 border border-indigo-500/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass rounded-2xl p-5 border border-white/5 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Filter className="w-4.5 h-4.5" />
            <span>Filters:</span>
          </div>

          {/* Department filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs font-medium"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d.name}>{d.name}</option>
            ))}
          </select>

          {/* Role filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs font-medium"
          >
            <option value="All">All Roles</option>
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
            <option value="employee">Employee</option>
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="glass rounded-3xl border border-white/5 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/20">
                <th className="py-4 px-6">Staff Info</th>
                <th className="py-4 px-6">Department & Role</th>
                <th className="py-4 px-6">Phone Number</th>
                <th className="py-4 px-6">Salary</th>
                <th className="py-4 px-6">Joining Date</th>
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
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 text-sm">
                    No employees matching the criteria found.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="border-b border-white/[0.03] text-sm text-slate-300 hover:bg-slate-800/10 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold font-outfit">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-200 font-semibold font-outfit leading-tight">{emp.name}</p>
                          <p className="text-xs text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-slate-200 font-medium">{emp.designation}</p>
                        <p className="text-xs text-slate-500 capitalize">{emp.department} • {emp.role}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-400">
                      {emp.phone || 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-semibold font-mono text-indigo-400">
                      ${emp.salary.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {new Date(emp.joiningDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          title="Edit Info"
                          className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp._id)}
                          disabled={!isOnlyAdmin}
                          title={isOnlyAdmin ? 'Delete Record' : 'Only Admin can delete employees'}
                          className={`p-2 rounded-lg transition-all ${
                            isOnlyAdmin 
                              ? 'bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20'
                              : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-transparent'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Panel / Modal Dialog for Add & Edit */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-lg h-full glass border-l border-white/10 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slideLeft">
            
            {/* Modal Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold font-outfit text-white">
                    {isEditMode ? 'Modify Employee Details' : 'Onboard New Employee'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Alert Error */}
              {errorMsg && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              )}

              {/* Form fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                {/* Email & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@company.com"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      {isEditMode ? 'Password (leave blank to keep)' : 'Password'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      required={!isEditMode}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>

                {/* Role & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    >
                      <option value="employee">Employee</option>
                      <option value="hr">HR</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    >
                      {departments.map((d) => (
                        <option key={d._id} value={d.name}>{d.name}</option>
                      ))}
                      {departments.length === 0 && <option value="General">General</option>}
                    </select>
                  </div>
                </div>

                {/* Designation & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Designation
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      placeholder="Software Engineer"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="555-0199"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>

                {/* Salary & Joining Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Annual Salary
                    </label>
                    <input
                      type="number"
                      name="salary"
                      required
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="85000"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Joining Date
                    </label>
                    <input
                      type="date"
                      name="joiningDate"
                      required
                      value={formData.joiningDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Footer Buttons */}
            <div className="pt-6 border-t border-white/5 mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all border border-indigo-500/20 shadow-lg shadow-indigo-500/10"
              >
                {isEditMode ? 'Update' : 'Register'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
