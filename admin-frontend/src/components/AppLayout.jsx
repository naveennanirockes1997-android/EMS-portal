import React, { useContext } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { ShieldAlert } from 'lucide-react';

export default function AppLayout() {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a13] flex flex-col justify-center items-center">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute w-8 h-8 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin animate-duration-1000"></div>
        </div>
        <p className="text-slate-400 font-outfit text-sm mt-4 tracking-wide animate-pulse">Syncing session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Paths requiring Admin / HR permission
  const adminOnlyPaths = ['/employees', '/departments', '/attendance-logs'];
  const isAdminOrHR = user.role === 'admin' || user.role === 'hr';
  const requiresPermission = adminOnlyPaths.includes(location.pathname);

  if (requiresPermission && !isAdminOrHR) {
    return (
      <div className="flex flex-col min-h-screen bg-[#070a13] text-white justify-center items-center p-4">
        <div className="glass rounded-3xl p-8 max-w-md border border-rose-500/10 text-center shadow-xl shadow-rose-950/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-outfit text-white mb-2">Admin Portal Access Denied</h3>
          <p className="text-slate-400 text-sm mb-6">
            Your account does not have Admin or HR privileges. This portal is strictly for administrators. Please use the employee portal to clock in/out or view your records.
          </p>
          <div className="flex gap-4 w-full">
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-all border border-white/5"
            >
              Sign Out
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all border border-indigo-500/20 text-center flex items-center justify-center"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#070a13] text-white">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-73px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
