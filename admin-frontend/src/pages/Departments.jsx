import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Building, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  AlertCircle, 
  Users, 
  DollarSign 
} from 'lucide-react';

const DepartmentList = () => {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form inputs
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const isOnlyAdmin = user?.role === 'admin';

  const fetchDepartments = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDepartments();
    }
  }, [user]);

  const handleEditClick = (dept) => {
    setIsEditMode(true);
    setEditingId(dept._id);
    setName(dept.name);
    setDescription(dept.description || '');
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Department name is required');
      return;
    }

    try {
      if (isEditMode) {
        const res = await api.put(`/departments/${editingId}`, { name, description });
        if (res.data.success) {
          setSuccessMsg('Department updated successfully');
          handleCancelEdit();
          fetchDepartments();
        }
      } else {
        const res = await api.post('/departments', { name, description });
        if (res.data.success) {
          setSuccessMsg('Department created successfully');
          setName('');
          setDescription('');
          fetchDepartments();
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error processing request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Warning: Deleting a department may leave employee department references blank. Proceed?')) {
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.delete(`/departments/${id}`);
      if (res.data.success) {
        setSuccessMsg('Department removed successfully');
        fetchDepartments();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error deleting department');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-outfit text-white">Departments</h2>
        <p className="text-slate-400 text-sm">Configure organizational departments, descriptions and view details.</p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
          <Building className="w-5 h-5 shrink-0 text-emerald-400" />
          <p>{successMsg}</p>
        </div>
      )}

      {/* Two Column Layout: Add/Edit Form & Department List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Create / Edit Form */}
        <div className="lg:col-span-4">
          <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl space-y-4">
            <h3 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-400" />
              <span>{isEditMode ? 'Modify Department' : 'Create Department'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering, Sales"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows="3"
                  placeholder="Summarize department functions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/15 flex items-center justify-center gap-2 border border-indigo-500/30"
                >
                  {isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{isEditMode ? 'Save Changes' : 'Add Department'}</span>
                </button>
                
                {isEditMode && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-white/5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: List Table */}
        <div className="lg:col-span-8">
          <div className="glass rounded-3xl border border-white/5 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/20">
                    <th className="py-4 px-6">Department Name</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6">Staff Size</th>
                    <th className="py-4 px-6">Avg Annual Salary</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center">
                        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                      </td>
                    </tr>
                  ) : departments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500 text-sm">
                        No departments logged. Add one to start.
                      </td>
                    </tr>
                  ) : (
                    departments.map((dept) => (
                      <tr key={dept._id} className="border-b border-white/[0.03] text-sm text-slate-300 hover:bg-slate-800/10 transition-colors">
                        <td className="py-4 px-6 font-semibold font-outfit text-slate-200">
                          {dept.name}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-400 max-w-[200px] truncate" title={dept.description}>
                          {dept.description || 'No description provided'}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Users className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="font-semibold text-slate-200 font-mono">{dept.employeeCount || 0}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-0.5 text-xs font-semibold text-indigo-400 font-mono">
                            <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{(dept.avgSalary || 0).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleEditClick(dept)}
                              title="Edit"
                              className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(dept._id)}
                              disabled={!isOnlyAdmin}
                              title={isOnlyAdmin ? 'Delete' : 'Only Admins can remove departments'}
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
        </div>

      </div>
    </div>
  );
};

export default DepartmentList;
