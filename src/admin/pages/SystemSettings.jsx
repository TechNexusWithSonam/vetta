import { useState } from 'react';
import { CheckCircle2, XCircle, Lock } from 'lucide-react';
import { api } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { adminErrorMessage, friendlyError } from '../lib/adminErrors.js';
import { SectionHeader, DetailList } from '../components';
import { useAdminAccess } from '../rbac/AdminAccessContext.jsx';
import { PERMISSIONS as P } from '../rbac/permissions.js';
import {
  Tabs, TabsList, TabsTrigger, TabsContent, Input, Textarea, Checkbox, Button, ConfirmDialog, ErrorState, LoadingState, useToast,
} from '../../components/ui';

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

function GeneralTab({ settings, onSaved }) {
  const { can } = useAdminAccess();
  const canManage = can(P.SETTINGS_MANAGE);
  const toast = useToast();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [confirmMaintenance, setConfirmMaintenance] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(settings);
  const enablingMaintenance = form.maintenanceMode && !settings.maintenanceMode;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const saved = await api.admin.settings.updateGeneral({
        platformName: form.platformName.trim(),
        supportEmail: form.supportEmail?.trim() || undefined,
        defaultTimezone: form.defaultTimezone.trim(),
        maintenanceMode: form.maintenanceMode,
        maintenanceMessage: form.maintenanceMessage.trim(),
      });
      toast.success('Platform settings saved');
      setConfirmMaintenance(false);
      onSaved(saved);
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-2xl">
      <Input label="Platform name" value={form.platformName} onChange={set('platformName')} disabled={!canManage} />
      <Input label="Support email" type="email" value={form.supportEmail || ''} onChange={set('supportEmail')} disabled={!canManage} />
      <Input label="Default timezone" value={form.defaultTimezone} onChange={set('defaultTimezone')} hint="IANA name, e.g. UTC, Asia/Kolkata, America/New_York" disabled={!canManage} />
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
        <Checkbox
          label="Maintenance mode"
          description="Blocks all tenant API requests with a 503. Sign-in, the admin panel and provider webhooks keep working."
          checked={!!form.maintenanceMode}
          onChange={(e) => setForm((f) => ({ ...f, maintenanceMode: e.target.checked }))}
          disabled={!canManage}
        />
        <Textarea label="Maintenance message" rows={2} value={form.maintenanceMessage} onChange={set('maintenanceMessage')} disabled={!canManage} />
      </div>
      {canManage && (
        <div className="pt-2 flex gap-2">
          <Button onClick={() => (enablingMaintenance ? setConfirmMaintenance(true) : save())} loading={saving} disabled={!dirty}>Save changes</Button>
          {dirty && <Button variant="secondary" onClick={() => setForm(settings)} disabled={saving}>Discard</Button>}
        </div>
      )}
      <ConfirmDialog
        open={confirmMaintenance}
        onClose={() => setConfirmMaintenance(false)}
        onConfirm={save}
        title="Enable maintenance mode?"
        message="Every customer will immediately get “service unavailable” until you turn this off."
        confirmLabel="Enable maintenance"
        tone="danger"
        loading={saving}
      />
    </div>
  );
}

const yesNo = (v) => (v ? 'Configured' : 'Not configured');

function ServerConfigTab({ server }) {
  const i = server.integrations;
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start gap-2 text-sm text-slate-500">
        <Lock size={16} className="mt-0.5 shrink-0" />
        <p>Read-only. Set through server environment variables; secrets and keys are never sent to the browser — only whether they are configured.</p>
      </div>
      {[
        ['Runtime', [
          { label: 'Environment', value: server.environment },
          { label: 'Background workers in API process', value: server.workers.runInThisProcess ? 'Yes' : 'No' },
          { label: 'Access token lifetime', value: server.auth.accessTokenTtl },
          { label: 'Refresh token lifetime', value: server.auth.refreshTokenTtl },
          { label: 'Rate limit', value: `${server.rateLimit.maxRequests} requests / ${server.rateLimit.windowSeconds}s` },
          { label: 'Bootstrap super admins', value: server.auth.platformBootstrapAdmins },
          { label: 'Allowed CORS origins', value: server.cors.allowedOrigins.join(', ') },
        ]],
        ['AI providers', [
          { label: 'Default provider', value: i.ai.defaultProvider },
          { label: 'Claude', value: `${yesNo(i.ai.claudeConfigured)}${i.ai.claudeModel ? ` · ${i.ai.claudeModel}` : ''}` },
          { label: 'OpenAI', value: `${yesNo(i.ai.openaiConfigured)}${i.ai.openaiModel ? ` · ${i.ai.openaiModel}` : ''}` },
        ]],
        ['Voice & messaging', [
          { label: 'Default voice provider', value: i.voice.defaultProvider },
          { label: 'Retell', value: yesNo(i.voice.retellConfigured) },
          { label: 'Bland', value: yesNo(i.voice.blandConfigured) },
          { label: 'Synthflow', value: yesNo(i.voice.synthflowConfigured) },
          { label: 'Email (SMTP)', value: yesNo(i.email.smtpConfigured) },
          { label: 'SMS (Twilio)', value: yesNo(i.sms.twilioConfigured) },
        ]],
        ['Infrastructure', [
          { label: 'Redis / queues', value: yesNo(i.redis.configured) },
          { label: 'Object storage (S3)', value: yesNo(i.storage.s3Configured) },
          { label: 'Payment provider', value: i.payments.providerConfigured ? 'Configured' : 'None — payments recorded manually' },
        ]],
      ].map(([title, items]) => (
        <section key={title} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">{title}</h3>
          <DetailList items={items} />
        </section>
      ))}
    </div>
  );
}

export default function AdminSystemSettings() {
  const q = useAdminQuery((signal) => api.admin.settings.get({ signal }), []);
  const [savedGeneral, setSavedGeneral] = useState(null);
  const general = savedGeneral || q.data?.general;

  return (
    <div>
      <SectionHeader title="System Settings" breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'System Settings' }]} />
      <Tabs defaultValue="health">
        <TabsList className="mb-6">
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="general">Platform Settings</TabsTrigger>
          <TabsTrigger value="server">Server Configuration</TabsTrigger>
        </TabsList>
        <TabsContent value="health"><HealthTab /></TabsContent>
        <TabsContent value="general">
          {q.loading ? <LoadingState label="Loading settings…" /> : q.error ? <ErrorState error={friendlyError(q.error)} onRetry={q.reload} /> : (
            <GeneralTab key={JSON.stringify(general)} settings={general} onSaved={setSavedGeneral} />
          )}
        </TabsContent>
        <TabsContent value="server">
          {q.loading ? <LoadingState label="Loading configuration…" /> : q.error ? <ErrorState error={friendlyError(q.error)} onRetry={q.reload} /> : (
            <ServerConfigTab server={q.data.server} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
