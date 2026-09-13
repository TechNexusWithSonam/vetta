let GENERAL = {
  platformName: 'Vetta',
  supportEmail: 'support@vetta.ai',
  defaultTimezone: 'UTC',
  maintenanceMode: false,
};

let SECURITY = {
  enforceMfaForSuperAdmins: false,
  sessionTimeoutMinutes: 60,
  ipAllowList: '',
};

export function mockGetGeneralSettings() {
  return { ...GENERAL };
}

export function mockUpdateGeneralSettings(patch) {
  GENERAL = { ...GENERAL, ...patch };
  return { ...GENERAL };
}

export function mockGetSecuritySettings() {
  return { ...SECURITY };
}

export function mockUpdateSecuritySettings(patch) {
  SECURITY = { ...SECURITY, ...patch };
  return { ...SECURITY };
}
