import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GitBranch, 
  BrainCircuit, 
  Phone, 
  Calendar, 
  BarChart2, 
  Plug, 
  Settings,
  Search,
  Upload,
  Rocket,
  Bell,
  ShieldCheck
} from 'lucide-react';

export default function AppLayout() {
  const navigate = useNavigate();

  // Navigation styling using the Indigo-600 brand color
  const navLinkClasses = ({ isActive }) =>
    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
      isActive 
        ? 'bg-indigo-600 text-white shadow-md' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  const iconClasses = ({ isActive }) =>
    `w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-200' : ''}`;

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Sidebar Navigation - Dark Slate 900 */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 relative overflow-hidden shadow-xl z-20">
        
        {/* Branding */}
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white leading-tight tracking-tight">Vetta</h1>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Platform</span>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="px-4 mb-2">
          <button className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-2.5 transition-colors">
            <div className="flex items-center space-x-2 truncate">
              <div className="w-6 h-6 rounded bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                A
              </div>
              <div className="text-left truncate">
                <p className="text-xs font-semibold text-white truncate">Acme Outbound</p>
                <p className="text-[10px] text-slate-400 truncate">Growth · 14 seats</p>
              </div>
            </div>
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          
          {/* Workspace Group */}
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">
              Workspace
            </div>
            <NavLink to="/dashboard" className={navLinkClasses}>
              {({ isActive }) => (
                <>
                  <LayoutDashboard className={iconClasses({ isActive })} />
                  <span>Dashboard</span>
                </>
              )}
            </NavLink>
            <NavLink to="/leads" className={navLinkClasses}>
              {({ isActive }) => (
                <>
                  <Users className={iconClasses({ isActive })} />
                  <span>Leads</span>
                </>
              )}
            </NavLink>
            <NavLink to="/workflow" className={navLinkClasses}>
              {({ isActive }) => (
                <>
                  <GitBranch className={iconClasses({ isActive })} />
                  <span>Workflow</span>
                </>
              )}
            </NavLink>
            <NavLink to="/research" className={navLinkClasses}>
              {({ isActive }) => (
                <>
                  <BrainCircuit className={iconClasses({ isActive })} />
                  <span>AI Research</span>
                </>
              )}
            </NavLink>
            <NavLink to="/live-calls" className={navLinkClasses}>
              {({ isActive }) => (
                <>
                  <Phone className={iconClasses({ isActive })} />
                  <span>Live Calls</span>
                </>
              )}
            </NavLink>
            <NavLink to="/bookings" className={navLinkClasses}>
              {({ isActive }) => (
                <>
                  <Calendar className={iconClasses({ isActive })} />
                  <span>Bookings</span>
                </>
              )}
            </NavLink>
          </div>

          {/* Insights Group */}
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">
              Insights
            </div>
            <NavLink to="/analytics" className={navLinkClasses}>
              {({ isActive }) => (
                <>
                  <BarChart2 className={iconClasses({ isActive })} />
                  <span>Analytics</span>
                </>
              )}
            </NavLink>
            <NavLink to="/integrations" className={navLinkClasses}>
              {({ isActive }) => (
                <>
                  <Plug className={iconClasses({ isActive })} />
                  <span>Integrations</span>
                </>
              )}
            </NavLink>
            <NavLink to="/settings" className={navLinkClasses}>
              {({ isActive }) => (
                <>
                  <Settings className={iconClasses({ isActive })} />
                  <span>Settings</span>
                </>
              )}
            </NavLink>
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0 border border-indigo-200">
              GT
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">Gaurav Tripathi</p>
              <p className="text-[10px] text-slate-400 truncate">Workspace Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header - Light Theme */}
        <header className="h-[62px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
          <div className="flex items-center font-bold text-[15px] tracking-tight text-slate-800">
             <span className="w-[22px] h-[22px] rounded-md bg-indigo-600 text-white flex items-center justify-center text-[11px] mr-2">A</span>
             Acme Outbound <span className="text-slate-400 font-medium ml-2 italic">workspace</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search leads, calls, campaigns..." 
                className="w-full h-[38px] pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
              />
            </div>

            {/* Import Leads Button Linked */}
            <button 
              onClick={() => navigate('/import-leads')}
              className="h-[38px] px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Upload size={16} />
              <span>Import leads</span>
            </button>

            {/* Launch Campaign Button Linked */}
            <button 
              onClick={() => navigate('/launch-campaign')}
              className="h-[38px] px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center space-x-2 transition-colors shadow-sm cursor-pointer"
            >
              <Rocket size={16} />
              <span>Launch campaign</span>
            </button>

            <button className="h-[38px] w-[38px] bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center relative transition-colors">
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Page Content Rendering Area */}
        <main className="flex-1 overflow-y-auto p-6 pb-20 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}