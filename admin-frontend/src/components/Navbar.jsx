import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Bell, Briefcase } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <header className="glass sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between border-b border-white/5 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent m-0 tracking-wide font-outfit">
            EMS Portal
          </h1>
          <span className="text-xs text-indigo-400 font-medium">Employee Management System</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications badge */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-[#0b0f19]"></span>
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-200 font-outfit leading-tight">{user.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user.role} • {user.department}</p>
          </div>
          
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold font-outfit shadow-inner">
            {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
          </div>

          <button 
            onClick={logout}
            title="Log Out"
            className="p-2 ml-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
