import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Input, Select, Spinner } from '../../components/ui';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { adminErrorMessage } from '../lib/adminErrors.js';

/**
 * Server-side searched organization selector (never loads every org into
 * the browser): type to search, pick from the top matches.
 */
export function OrganizationPicker({ value, onChange, label = 'Organization', required }) {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const q = useAdminQuery(
    (signal) => api.admin.organizations.list({ search: debounced || undefined, limit: 20, sortBy: 'name' }, { signal }),
    [debounced],
  );
  const orgs = q.data?.data || [];

  return (
    <div className="space-y-2">
      <Input
        label={label}
        required={required}
        placeholder="Search organizations by name or owner email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        trailing={q.loading ? <Spinner size="sm" /> : undefined}
      />
      {q.error ? (
        <p className="text-xs text-rose-600">{adminErrorMessage(q.error)}</p>
      ) : (
        <Select
          value={value || ''}
          onChange={(e) => onChange(e.target.value, orgs.find((o) => o.id === e.target.value))}
          placeholder={orgs.length ? 'Select an organization' : 'No matching organizations'}
          options={orgs.map((o) => ({ value: o.id, label: `${o.name}${o.ownerEmail ? ` — ${o.ownerEmail}` : ''}` }))}
        />
      )}
    </div>
  );
}

export default OrganizationPicker;
