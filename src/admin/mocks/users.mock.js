import { seededArray, pick, daysAgoIso, FIRST_NAMES, LAST_NAMES, personEmail } from './seed.js';
import { getMockOrganizations } from './organizations.mock.js';

const ROLES = ['OWNER', 'ADMIN', 'MEMBER'];
const STATUSES = ['active', 'invited', 'suspended'];

let CACHE = null;

export function getMockUsers() {
  if (CACHE) return CACHE;
  const orgs = getMockOrganizations();
  const users = [];
  let n = 0;
  for (const org of orgs) {
    const count = Math.min(org.usersCount, 6); // cap per-org rows generated for the mock table
    for (let i = 0; i < count; i++) {
      users.push(
        seededArray(1, 1000 + n, (_, rand) => {
          const first = pick(rand, FIRST_NAMES);
          const last = pick(rand, LAST_NAMES);
          n += 1;
          return {
            id: `user_${String(n).padStart(4, '0')}`,
            firstName: first,
            lastName: last,
            email: i === 0 ? org.ownerEmail : personEmail(first, last, org.domain),
            role: i === 0 ? 'OWNER' : pick(rand, ROLES.slice(1)),
            organizationId: org.id,
            organizationName: org.name,
            status: org.status === 'suspended' && i === 0 ? 'suspended' : pick(rand, STATUSES),
            lastActiveAt: daysAgoIso(rand, 30),
            createdAt: daysAgoIso(rand, 500),
          };
        })[0],
      );
    }
  }
  CACHE = users;
  return CACHE;
}

export function mockListUsers({ page = 1, limit = 10, search, role, status, organizationId } = {}) {
  let items = getMockUsers().filter((u) => {
    if (role && u.role !== role) return false;
    if (status && u.status !== status) return false;
    if (organizationId && u.organizationId !== organizationId) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      if (!name.includes(q) && !u.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const total = items.length;
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total, page, pageSize: limit };
}

export function mockGetUser(id) {
  const user = getMockUsers().find((u) => u.id === id);
  if (!user) throw new Error('User not found');
  return user;
}

export function mockMutateUser(id, patch) {
  const user = mockGetUser(id);
  Object.assign(user, patch);
  return user;
}

export function mockUsersOfOrganization(organizationId, { page = 1, limit = 10 } = {}) {
  return mockListUsers({ page, limit, organizationId });
}
