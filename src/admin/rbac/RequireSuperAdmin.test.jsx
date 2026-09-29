import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { api } from '../../api';
import { ApiError } from '../../api/ApiError.js';
import { authValue, renderAdmin } from '../../test/renderAdmin.jsx';
import RequireSuperAdmin from './RequireSuperAdmin.jsx';
import { Can } from './Can.jsx';

const access = (permissions) => ({ userId: 'me', email: 'ops@vetta.ai', roleName: 'Support', isSuperAdmin: false, source: 'role', permissions });

function Panel() {
  return (
    <>
      <p>ADMIN PANEL</p>
      <Can permission="users.manage"><button>Suspend user</button></Can>
      <Can permission="users.view"><p>User list</p></Can>
    </>
  );
}

describe('RequireSuperAdmin (server-decided access)', () => {
  it('redirects to login when the server says 403 (e.g. a tenant OWNER)', async () => {
    vi.spyOn(api.admin, 'me').mockRejectedValue(new ApiError({ statusCode: 403, message: 'Forbidden' }));
    renderAdmin(<RequireSuperAdmin><Panel /></RequireSuperAdmin>);
    expect(await screen.findByText('LOGIN PAGE')).toBeInTheDocument();
    expect(screen.queryByText('ADMIN PANEL')).not.toBeInTheDocument();
  });

  it('redirects signed-out visitors without calling the API', async () => {
    const me = vi.spyOn(api.admin, 'me');
    renderAdmin(<RequireSuperAdmin><Panel /></RequireSuperAdmin>, { auth: authValue({ status: 'unauthenticated', user: null }) });
    expect(await screen.findByText('LOGIN PAGE')).toBeInTheDocument();
    expect(me).not.toHaveBeenCalled();
  });

  it('shows a retryable error (not a blank screen) when the server is unreachable', async () => {
    vi.spyOn(api.admin, 'me').mockRejectedValue(new ApiError({ statusCode: 0, message: 'fetch failed', kind: 'network' }));
    renderAdmin(<RequireSuperAdmin><Panel /></RequireSuperAdmin>);
    expect(await screen.findByText(/Can’t reach the server/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders the panel and hides actions the server did not grant', async () => {
    vi.spyOn(api.admin, 'me').mockResolvedValue(access(['users.view']));
    renderAdmin(<RequireSuperAdmin><Panel /></RequireSuperAdmin>);
    expect(await screen.findByText('ADMIN PANEL')).toBeInTheDocument();
    expect(screen.getByText('User list')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Suspend user' })).not.toBeInTheDocument();
  });
});
