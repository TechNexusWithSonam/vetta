import { useState } from 'react';
import { Send } from 'lucide-react';
import { api } from '../../api';
import { useAdminAsync } from '../lib/useAdminAsync.js';
import { SectionHeader, DataTable, DemoDataBadge } from '../components';
import { Button, Input, Textarea, Select, Modal, useToast } from '../../components/ui';
import { relativeTime } from '../../lib/format';

export default function AdminNotifications() {
  const [page, setPage] = useState(1);
  const [broadcasting, setBroadcasting] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [saving, setSaving] = useState(false);
  const limit = 10;
  const toast = useToast();

  const list = useAdminAsync(() => api.admin.notifications.list({ page, limit }), [page]);
  const items = list.data?.items || [];

  const send = async () => {
    setSaving(true);
    try {
      await api.admin.notifications.broadcast({ title, message, audience });
      toast.success('Notification broadcast sent');
      setBroadcasting(false);
      setTitle('');
      setMessage('');
      list.reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to send broadcast');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'body', header: 'Message' },
    { key: 'read', header: 'Status', render: (n) => (n.read ? 'Read' : 'Unread') },
    { key: 'createdAt', header: 'Sent', render: (n) => relativeTime(n.createdAt) },
  ];

  return (
    <div>
      <SectionHeader
        title="Notifications"
        breadcrumbItems={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Notifications' }]}
        actions={<Button iconLeft={Send} onClick={() => setBroadcasting(true)}>New broadcast</Button>}
      />
      {list.isMock && !list.loading && <div className="mb-4"><DemoDataBadge /></div>}
      <DataTable
        columns={columns}
        rows={items}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        emptyTitle="No notifications yet"
        page={page}
        total={list.data?.total || 0}
        pageSize={limit}
        onPageChange={setPage}
      />

      <Modal
        open={broadcasting}
        onClose={() => setBroadcasting(false)}
        title="Broadcast notification"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBroadcasting(false)} disabled={saving}>Cancel</Button>
            <Button onClick={send} loading={saving} disabled={!title || !message}>Send</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} required />
          <Select label="Audience" value={audience} onChange={(e) => setAudience(e.target.value)} options={[{ value: 'all', label: 'All organizations' }, { value: 'trial', label: 'Trial organizations' }, { value: 'active', label: 'Active organizations' }]} />
        </div>
      </Modal>
    </div>
  );
}
