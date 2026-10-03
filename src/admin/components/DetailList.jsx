/** Label/value grid used by every detail view. `items: [{ label, value }]`; empty values render as "—". */
export function DetailList({ items, columns = 2 }) {
  return (
    <dl className={`grid grid-cols-1 gap-4 text-sm ${columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-slate-400">{item.label}</dt>
          <dd className="mt-0.5 break-words font-medium text-slate-800">
            {item.value === null || item.value === undefined || item.value === '' ? '—' : item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default DetailList;
