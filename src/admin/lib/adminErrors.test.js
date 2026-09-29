import { describe, expect, it } from 'vitest';
import { ApiError } from '../../api/ApiError.js';
import { adminErrorMessage } from './adminErrors.js';

const err = (statusCode, message, extra = {}) => new ApiError({ statusCode, message, ...extra });

describe('adminErrorMessage', () => {
  it.each([
    [err(401, 'Unauthorized'), /session has expired/],
    [err(403, 'Forbidden'), /don’t have permission/],
    [err(403, 'Missing platform permission: plans.manage'), /plans\.manage/],
    [err(404, 'Plan not found'), /Not found/],
    [err(409, 'A plan with this code already exists'), /already exists/],
    [err(422, 'STRIPE payments must be refunded in the STRIPE dashboard'), /STRIPE dashboard/],
    [err(500, 'boom'), /unexpected error/],
    [err(0, 'fetch failed', { kind: 'network' }), /Can’t reach the server/],
    [err(0, 'timed out', { kind: 'timeout' }), /too long/],
  ])('maps %o', (e, expected) => {
    expect(adminErrorMessage(e)).toMatch(expected);
  });

  it('joins class-validator message arrays from 400 responses', () => {
    const e = err(400, 'x', { body: { message: ['name must be longer', 'code is invalid'] } });
    expect(adminErrorMessage(e)).toBe('name must be longer; code is invalid');
  });
});
