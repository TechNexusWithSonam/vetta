import { NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { Badge } from '../../components/ui';
import { useSuperAdmin } from '../rbac/useSuperAdmin.js';
import { ADMIN_NAV } from './adminNav.js';

const navLinkClasses = ({ isActive }) =>
  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
    isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`;

const iconClasses = (isActive) => `w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-200' : ''}`;

/**
 * Visually matches AppLayout.jsx's dark w-64 sidebar (same brand mark, same
 * footer avatar/name/logout pattern) but adds: a "Super Admin" badge,
 * responsive off-canvas behavior (AppLayout has none today), and a "Back to
 * app" link.
 */
export default function AdminSidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { can } = useSuperAdmin();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const displayName = fullName || user?.email || 'Signed in';
  const initials = (fullName ? fullName.split(' ').map((p) => p[0]).join('') : (user?.email || '?').slice(0, 2))
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 shadow-xl transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white leading-tight tracking-tight">Vetta</h1>
              <Badge tone="brand" size="sm">Super Admin</Badge>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="px-4 mb-2">
          <NavLink
            to="/app/dashboard"
            className="w-full flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-2.5 transition-colors text-xs font-semibold text-white"
          >
            <ArrowLeft size={14} />
            <span>Back to app</span>
          </NavLink>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {ADMIN_NAV.map((group) => {
            const items = group.items.filter((item) => can(item.permission));
            if (items.length === 0) return null;
            return (
              <div key={group.section}>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">
                  {group.section}
                </div>
                {items.map((item) => (
                  <NavLink key={item.to} to={item.to} className={navLinkClasses} onClick={onClose}>
                    {({ isActive }) => (
                      <>
                        <item.icon className={iconClasses(isActive)} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0 border border-indigo-200">
              {initials}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 truncate">Super Admin</p>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-colors shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
