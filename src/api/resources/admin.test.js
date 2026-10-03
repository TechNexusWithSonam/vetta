import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, tokenStore } from '../index.js';
import { fail, ok } from '../../test/renderAdmin.jsx';

describe('admin API client', () => {
  let fetchMock;
  beforeEach(() => {
    fetchMock = vi.spyOn(globalThis, 'fetch');
    tokenStore.setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' });
  });

  it('calls the real endpoint with bearer auth, serialized filters, and unwraps the envelope', async () => {
    fetchMock.mockResolvedValue(ok({ data: [{ id: 'o1' }], total: 1, page: 2, limit: 10 }));
    const res = await api.admin.organizations.list({ page: 2, limit: 10, search: 'acme', status: undefined });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://api.test/admin/organizations?page=2&limit=10&search=acme');
    expect(init.method).toBe('GET');
    expect(init.headers.Authorization).toBe('Bearer access-1');
    expect(res).toEqual({ data: [{ id: 'o1' }], total: 1, page: 2, limit: 10 });
  });

  it('sends mutations as JSON to the documented routes', async () => {
    fetchMock.mockResolvedValue(ok({ id: 'u1' }));
    await api.admin.users.suspend('u1', { reason: 'abuse' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://api.test/admin/users/u1/suspend');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ reason: 'abuse' });
  });

  it('surfaces 403 as an ApiError (never a silent fallback)', async () => {
    fetchMock.mockImplementation(async () => fail(403, 'Platform administrator access required'));
    const error = await api.admin.me().catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(403);
  });

  it('forwards an AbortSignal so superseded requests can be cancelled', async () => {
    fetchMock.mockResolvedValue(ok([]));
    const controller = new AbortController();
    await api.admin.plans.list({ signal: controller.signal });
    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });

  it('exposes no audit-log write method', () => {
    expect(Object.keys(api.admin.auditLogs).sort()).toEqual(['entityTypes', 'get', 'list']);
  });
});
