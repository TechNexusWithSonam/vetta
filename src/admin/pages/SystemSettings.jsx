import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { useAdminAsync } from '../lib/useAdminAsync.js';
import { SectionHeader, DemoDataBadge } from '../components';
import { Tabs, TabsList, TabsTrigger, TabsContent, Input, Checkbox, Button, ErrorState, useToast } from '../../components/ui';

function HealthTab() {
  const health = useAsync(() => api.system.health(), []);
  const ready = useAsync(() => api.system.ready(), []);
  const live = useAsync(() => api.system.live(), []);

  const rows = [
    { label: 'Deep health check (/health)', q: health },
    { label: 'Readiness probe (/ready)', q: ready },
    { label: 'Liveness probe (/live)', q: live },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between px-6 py-4">
          <span className="text-sm font-medium text-slate-700">{r.label}</span>
          {r.q.loading ? (
            <span className="text-xs text-slate-400">Checking…</span>
          ) : r.q.error ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600"><XCircle size={16} /> Failing</span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600"><CheckCircle2 size={16} /> Healthy</span>
          )}
        </div>
      ))}
      {health.error && (
        <div className="p-4">
          <ErrorState error={health.error} onRetry={health.reload} compact title="Health check detail" />
        </div>
      )}
    </div>
  );
}

function GeneralTab() {
  const toast = useToast();
  const settings = useAdminAsync(() => api.admin.settings.general.get(), []);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const data = form || settings.data || {};

  const save = async () => {
    setSaving(true);
    try {
      await api.admin.settings.general.update(data);
      toast.success('General settings saved');
    } catch (err) {
      toast.error(err?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (settings.loading) return null;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      {settings.isMock && <DemoDataBadge />}
      <Input label="Platform name" value={data.platformName || ''} onChange={(e) => setForm({ ...data, platformName: e.target.value })} />
      <Input label="Support email" value={data.supportEmail || ''} onChange={(e) => setForm({ ...data, supportEmail: e.target.value })} />
      <Input label="Default timezone" value={data.defaultTimezone || ''} onChange={(e) => setForm({ ...data, defaultTimezone: e.target.value })} />
      <Checkbox label="Maintenance mode" checked={!!data.maintenanceMode} onChange={(e) => setForm({ ...data, maintenanceMode: e.target.checked })} />
      <div className="pt-2"><Button onClick={save} loading={saving}>Save changes</Button></div>
    </div>
  );
}

function SecurityTab() {
  const toast = useToast();
  const settings = useAdminAsync(() => api.admin.settings.security.get(), []);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const data = form || settings.data || {};

  const save = async () => {
    setSaving(true);
    try {
      await api.admin.settings.security.update(data);
      toast.success('Security settings saved');
    } catch (err) {
      toast.error(err?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (settings.loading) return null;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      {settings.isMock && <DemoDataBadge />}
      <Checkbox label="Enforce MFA for super admins" checked={!!data.enforceMfaForSuperAdmins} onChange={(e) => setForm({ ...data, enforceMfaForSuperAdmins: e.target.checked })} />
      <Input label="Session timeout (minutes)" type="number" value={data.sessionTimeoutMinutes || ''} onChange={(e) => setForm({ ...data, sessionTimeoutMinutes: Number(e.target.value) })} />
      <Input label="IP allow list" hint="Comma-separated CIDR ranges" value={data.ipAllowList || ''} onChange={(e) => setForm({ ...data, ipAllowList: e.target.value })} />
      <div className="pt-2"><Button onClick={save} loading={saving}>Save changes</Button></div>
    </div>
  );
}

export default function AdminSystemSettings() {
  return (
    <div>
      <SectionHeader title="System Settings" breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'System Settings' }]} />
      <Tabs defaultValue="health">
        <TabsList className="mb-6">
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="general">Platform Settings</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="health"><HealthTab /></TabsContent>
        <TabsContent value="general"><GeneralTab /></TabsContent>
        <TabsContent value="security"><SecurityTab /></TabsContent>
      </Tabs>
    </div>
  );
}
