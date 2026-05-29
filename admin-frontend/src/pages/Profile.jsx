import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  Lock, 
  Save, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, error, setError } = useContext(AuthContext);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError(null);
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user, setError]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setError(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await updateProfile(payload);
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-outfit text-white">My Profile</h2>
        <p className="text-slate-400 text-sm">View your organization records and update your password.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Organization Details (Static Card) */}
        <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl md:col-span-5 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 text-3xl font-bold font-outfit shadow-inner mb-4">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-lg font-bold font-outfit text-white leading-tight">{user.name}</h3>
          <p className="text-xs text-indigo-400 capitalize font-semibold tracking-wide mt-1">{user.role}</p>

          <div className="w-full mt-6 space-y-3.5 text-left border-t border-white/5 pt-6 text-xs text-slate-300">
            {/* Department */}
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Department</span>
                <span className="font-semibold text-slate-200">{user.department}</span>
              </div>
            </div>
            
            {/* Designation */}
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Designation</span>
                <span className="font-semibold text-slate-200">{user.designation || 'Staff'}</span>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Email address</span>
                <span className="font-semibold text-slate-200">{user.email}</span>
              </div>
            </div>

            {/* Salary */}
            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Annual Salary</span>
                <span className="font-semibold text-indigo-400 font-mono">${user.salary ? user.salary.toLocaleString() : '0'}</span>
              </div>
            </div>

            {/* Joined */}
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Joining Date</span>
                <span className="font-semibold text-slate-200">
                  {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile (Form Card) */}
        <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl md:col-span-7">
          <h3 className="text-lg font-bold font-outfit text-white mb-6">Modify Settings</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Display Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Phone className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="555-0199"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            {/* Password edit section */}
            <div className="pt-4 border-t border-white/5 mt-4 space-y-4">
              <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> Change Password
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 border border-indigo-500/30 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
