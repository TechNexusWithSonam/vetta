import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../context/authStore.js';
import { ToastProvider } from '../components/ui';

/** Minimal signed-in AuthContext for admin component tests. */
export function authValue(overrides = {}) {
  return {
    status: 'authenticated',
    user: { id: 'me', email: 'ops@vetta.ai', organizationId: 'org-ops' },
    login: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  };
}

/** Render `ui` at `path` inside Auth + Toast + Router, with an /admin/login sentinel route. */
export function renderAdmin(ui, { path = '/admin/x', route = '/admin/x', auth = authValue() } = {}) {
  return render(
    <AuthContext.Provider value={auth}>
      <ToastProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={path} element={ui} />
            <Route path="/admin/login" element={<p>LOGIN PAGE</p>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </AuthContext.Provider>,
  );
}

/** JSON Response in the backend's `{ success, data }` envelope. */
export function ok(data) {
  return new Response(JSON.stringify({ success: true, data, timestamp: new Date().toISOString() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function fail(statusCode, message) {
  return new Response(JSON.stringify({ statusCode, message, error: 'Error' }), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}
