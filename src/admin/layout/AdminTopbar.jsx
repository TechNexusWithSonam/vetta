import { Menu } from 'lucide-react';

/** Minimal mobile-only topbar — per-page SectionHeader/FilterBar cover search/actions. */
export default function AdminTopbar({ onMenuClick }) {
  return (
    <header className="h-[62px] bg-white border-b border-slate-200 flex items-center px-4 shrink-0 z-10 shadow-sm lg:hidden">
      <button
        onClick={onMenuClick}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <span className="ml-3 font-bold text-slate-800">Super Admin</span>
    </header>
  );
}
