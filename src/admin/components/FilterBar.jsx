import { Search } from 'lucide-react';
import { Input, Select } from '../../components/ui';

/**
 * Search + filter-select row shared by every admin table page.
 * `filters: [{ key, value, onChange, options, placeholder }]`
 */
export function FilterBar({ search, onSearchChange, searchPlaceholder = 'Search…', filters = [], actions }) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
      {onSearchChange && (
        <div className="min-w-[220px] flex-1">
          <Input
            icon={Search}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>
      )}
      {filters.map((f) => (
        <div key={f.key} className="w-full sm:w-44">
          <Select
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            placeholder={f.placeholder || 'All'}
            options={f.options}
          />
        </div>
      ))}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export default FilterBar;
