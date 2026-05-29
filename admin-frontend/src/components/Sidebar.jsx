import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CalendarClock, 
  FileText, 
  UserCircle,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'hr', 'employee']
    },
    {
      path: '/employees',
      label: 'Employees',
      icon: Users,
      roles: ['admin', 'hr']
    },
    {
      path: '/departments',
      label: 'Departments',
      icon: Building2,
      roles: ['admin', 'hr']
    },
    {
      path: '/attendance',
      label: 'My Attendance',
      icon: CalendarClock,
      roles: ['admin', 'hr', 'employee']
    },
    {
      path: '/attendance-logs',
      label: 'Daily Attendance',
      icon: CalendarDays,
      roles: ['admin', 'hr']
    },
    {
      path: '/leaves',
      label: 'Leave Requests',
      icon: FileText,
      roles: ['admin', 'hr', 'employee']
    },
    {
      path: '/profile',
      label: 'My Profile',
      icon: UserCircle,
      roles: ['admin', 'hr', 'employee']
    }
  ];

  return (
    <aside className="w-64 glass border-r border-white/5 min-h-[calc(100vh-73px)] p-4 flex flex-col justify-between select-none shrink-0">
      <div className="space-y-6">
        {/* Role Banner */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-white/5 flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Access Panel</p>
            <p className="text-xs font-semibold text-slate-300 capitalize">{user.role} Portal</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {menuItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent ${
                    isActive
                      ? 'bg-indigo-500/15 border-indigo-500/20 text-indigo-400 shadow-md shadow-indigo-950/20'
                      : 'text-slate-400 hover:bg-slate-800/20 hover:text-slate-200 hover:border-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>
      </div>

      <div className="pt-4 border-t border-white/5 text-center">
        <p className="text-[10px] text-slate-500 font-medium">EMS v1.0.0 • Premium Portal</p>
        <p className="text-[9px] text-slate-600">© 2026 Company Inc.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
