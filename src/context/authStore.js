import { createContext } from 'react';

/** @type {import('react').Context<null | {
 *   user: object|null,
 *   status: 'loading'|'authenticated'|'unauthenticated',
 *   isAuthenticated: boolean,
 *   isLoading: boolean,
 *   login: (credentials: object) => Promise<object>,
 *   register: (payload: object) => Promise<object>,
 *   logout: () => Promise<void>,
 *   refreshMe: () => Promise<object>,
 * }>} */
export const AuthContext = createContext(null);
