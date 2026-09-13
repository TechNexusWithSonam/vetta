import { Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/ui';

/** Every admin page starts with one: breadcrumb trail + title + right-aligned actions. */
export function SectionHeader({ title, breadcrumbItems, actions, description }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {breadcrumbItems && <Breadcrumb items={breadcrumbItems} linkComponent={Link} className="mb-2" />}
        <h1 className="text-2xl font-bold text-slate-900 truncate">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export default SectionHeader;
