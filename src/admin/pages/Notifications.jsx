import { useState } from 'react';
import { Send, CheckCheck } from 'lucide-react';
import { api } from '../../api';
import { useAdminQuery } from '../lib/useAdminQuery.js';
import { adminErrorMessage } from '../lib/adminErrors.js';
import { SectionHeader, DataTable } from '../components';
import { useAdminAccess } from '../rbac/AdminAccessContext.jsx';
import { PERMISSIONS as P } from '../rbac/permissions.js';
import { Badge, Button, Checkbox, Input, Textarea, Select, Modal, Tabs, TabsList, TabsTrigger, TabsContent, useToast } from '../../components/ui';
import { dateTime, num, relativeTime } from '../../lib/format';

const AUDIENCES = [
  { value: 'all', label: 'All active users' },
  { value: 'owners', label: 'Organization owners' },
  { value: 'admins', label: 'Owners and admins' },
  { value: 'subscribed', label: 'Users of paying organizations' },
  { value: 'trialing', label: 'Users of trialing organizations' },
];
const audienceLabel = (v) => AUDIENCES.find((a) => a.value === v)?.label || v;

function BroadcastModal({ onClose, onSent }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const valid = title.trim().length >= 2 && message.trim().length >= 2;

  const send = async () => {
    setSaving(true);
    try {
      const res = await api.admin.notifications.broadcast({ title: title.trim(), message: message.trim(), audience });
      toast.success(`Broadcast delivered to ${num(res.recipientCount)} user(s)`);
      onSent();
    } catch (err) {
      toast.error(adminErrorMessage(err, 'Failed to send broadcast'));
      setConfirming(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      title="Broadcast notification"
      description="Delivered to each recipient's in-app notification feed."
      footer={
        confirming ? (
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)} disabled={saving}>Back</Button>
            <Button onClick={send} loading={saving}>Send to {audienceLabel(audience).toLowerCase()}</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={() => setConfirming(true)} disabled={!valid}>Review</Button>
          </>
        )
      }
    >
      {confirming ? (
        <div className="space-y-2 text-sm">
          <p className="text-slate-600">This can’t be recalled once sent.</p>
          <p><span className="text-slate-400">Audience:</span> {audienceLabel(audience)}</p>
          <p className="font-semibold text-slate-800">{title}</p>
          <p className="whitespace-pre-wrap text-slate-700">{message}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
          <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} required />
          <Select label="Audience" value={audience} onChange={(e) => setAudience(e.target.value)} options={AUDIENCES} />
        </div>
      )}
    </Modal>
  );
}

function BroadcastsTab() {
  const { can } = useAdminAccess();
  const [page, setPage] = useState(1);
  const [composing, setComposing] = useState(false);
  const limit = 10;
  const list = useAdminQuery((signal) => api.admin.notifications.broadcasts({ page, limit }, { signal }), [page]);

  const columns = [
    { key: 'title', header: 'Title', render: (b) => <span className="font-medium text-slate-800">{b.title}</span> },
    { key: 'body', header: 'Message', className: 'max-w-md truncate' },
    { key: 'audience', header: 'Audience', render: (b) => audienceLabel(b.audience) },
    { key: 'recipientCount', header: 'Recipients', align: 'right', render: (b) => num(b.recipientCount) },
    { key: 'readCount', header: 'Read', align: 'right', render: (b) => `${num(b.readCount)}${b.recipientCount ? ` (${Math.round((b.readCount / b.recipientCount) * 100)}%)` : ''}` },
    { key: 'createdByEmail', header: 'Sent by', render: (b) => b.createdByEmail || '—' },
    { key: 'createdAt', header: 'Sent', render: (b) => dateTime(b.createdAt) },
  ];

  return (
    <div className="space-y-4">
      {can(P.NOTIFICATIONS_MANAGE) && (
        <div className="flex justify-end">
          <Button iconLeft={Send} onClick={() => setComposing(true)}>New broadcast</Button>
        </div>
      )}
      <DataTable
        columns={columns}
        rows={list.data?.data || []}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        emptyTitle="No broadcasts sent yet"
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />
      {composing && <BroadcastModal onClose={() => setComposing(false)} onSent={() => { setComposing(false); setPage(1); list.reload(); }} />}
    </div>
  );
}

/** The operator's own feed, via the existing tenant-scoped /notifications API (read/unread supported there). */
function MyNotificationsTab() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const limit = 10;
  const list = useAdminQuery(
    (signal) => api.notifications.listInApp({ page, limit, unreadOnly: unreadOnly || undefined }, { signal }),
    [page, unreadOnly],
  );
  const rows = Array.isArray(list.data) ? list.data : list.data?.data || [];
  const total = Array.isArray(list.data) ? undefined : list.data?.total;

  const act = async (fn, success) => {
    try {
      await fn();
      if (success) toast.success(success);
      list.reload();
    } catch (err) {
      toast.error(adminErrorMessage(err));
    }
  };

  const columns = [
    { key: 'title', header: 'Title', render: (n) => <span className={n.readAt ? 'text-slate-600' : 'font-semibold text-slate-900'}>{n.title}</span> },
    { key: 'body', header: 'Message', className: 'max-w-md truncate' },
    { key: 'readAt', header: 'Status', render: (n) => <Badge tone={n.readAt ? 'neutral' : 'brand'} size="sm">{n.readAt ? 'Read' : 'Unread'}</Badge> },
    { key: 'createdAt', header: 'Received', render: (n) => relativeTime(n.createdAt) },
    {
      key: 'actions', header: '', align: 'right', render: (n) => (
        <Button size="sm" variant="ghost" onClick={() => act(() => (n.readAt ? api.notifications.markUnread(n.id) : api.notifications.markRead(n.id)))}>
          Mark {n.readAt ? 'unread' : 'read'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Checkbox label="Unread only" checked={unreadOnly} onChange={(e) => { setUnreadOnly(e.target.checked); setPage(1); }} />
        <Button size="sm" variant="secondary" iconLeft={CheckCheck} onClick={() => act(() => api.notifications.markAllRead(), 'All marked as read')}>
          Mark all read
        </Button>
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        emptyTitle={unreadOnly ? 'No unread notifications' : 'No notifications'}
        page={page}
        total={total}
        pageCount={total === undefined ? (rows.length < limit ? page : page + 1) : undefined}
        pageSize={limit}
        onPageChange={setPage}
      />
    </div>
  );
}

export default function AdminNotifications() {
  return (
    <div>
      <SectionHeader
        title="Notifications"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Notifications' }]}
        description="Broadcast announcements to tenant users and manage your own notification feed."
      />
      <Tabs defaultValue="broadcasts">
        <TabsList className="mb-6">
          <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
          <TabsTrigger value="mine">My notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="broadcasts"><BroadcastsTab /></TabsContent>
        <TabsContent value="mine"><MyNotificationsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
