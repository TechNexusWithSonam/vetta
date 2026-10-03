import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../api';
import { ApiError } from '../../api/ApiError.js';
import { renderAdmin } from '../../test/renderAdmin.jsx';
import RequireSuperAdmin from '../rbac/RequireSuperAdmin.jsx';
import AdminUsers from './Users.jsx';

const user = {
  id: 'u1', email: 'owner@acme.com', firstName: 'Ada', lastName: 'Lee', name: 'Ada Lee', role: 'OWNER', status: 'active',
  organizationId: 'org1', organizationName: 'Acme', organizationActive: true, platformRole: null,
  lastActiveAt: null, createdAt: '2026-09-01T00:00:00Z',
};

function mount(permissions) {
  vi.spyOn(api.admin, 'me').mockResolvedValue({ userId: 'me', roleName: 'X', isSuperAdmin: false, permissions });
  return renderAdmin(<RequireSuperAdmin><AdminUsers /></RequireSuperAdmin>);
}

describe('Admin Users page', () => {
  beforeEach(() => {
    vi.spyOn(api.admin.users, 'list').mockResolvedValue({ data: [user], total: 1, page: 1, limit: 10 });
  });

  it('renders rows returned by the API (no local data)', async () => {
    mount(['users.view']);
    expect(await screen.findByText('owner@acme.com')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(api.admin.users.list).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 10 }), expect.anything());
  });

  it('sends the search filter to the server (debounced) and resets to page 1', async () => {
    mount(['users.view']);
    await screen.findByText('owner@acme.com');
    fireEvent.change(screen.getByPlaceholderText(/Search by name or email/), { target: { value: 'ada' } });
    await waitFor(() =>
      expect(api.admin.users.list).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'ada', page: 1 }), expect.anything()),
    );
  });

  it('shows an empty state when the API returns nothing', async () => {
    api.admin.users.list.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });
    mount(['users.view']);
    expect(await screen.findByText('No users yet')).toBeInTheDocument();
  });

  it('shows the error with a retry action, and retries on click', async () => {
    api.admin.users.list.mockRejectedValueOnce(new ApiError({ statusCode: 500, message: 'boom' }));
    mount(['users.view']);
    expect(await screen.findByText(/unexpected error/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByText('owner@acme.com')).toBeInTheDocument();
  });

  it('only offers manage actions when the server granted users.manage', async () => {
    mount(['users.view']);
    await screen.findByText('owner@acme.com');
    fireEvent.click(screen.getByRole('button', { name: 'User actions' }));
    expect(await screen.findByText('View details')).toBeInTheDocument();
    expect(screen.queryByText('Suspend')).not.toBeInTheDocument();
    expect(screen.queryByText('Change org role')).not.toBeInTheDocument();
  });

  it('suspends through a confirmation dialog and reloads', async () => {
    const suspend = vi.spyOn(api.admin.users, 'suspend').mockResolvedValue({});
    mount(['users.view', 'users.manage']);
    await screen.findByText('owner@acme.com');
    fireEvent.click(screen.getByRole('button', { name: 'User actions' }));
    fireEvent.click(await screen.findByText('Suspend'));
    expect(suspend).not.toHaveBeenCalled(); // nothing happens before confirming
    fireEvent.click(await screen.findByRole('button', { name: 'Suspend' }));
    await waitFor(() => expect(suspend).toHaveBeenCalledWith('u1', { reason: undefined }));
    await waitFor(() => expect(api.admin.users.list.mock.calls.length).toBeGreaterThan(1));
  });
});
