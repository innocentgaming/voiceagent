/**
 * IndicVoice Lab - RBAC & Authentication Service
 * Supports 4 Enterprise Roles:
 * - Admin: Full administrative privileges
 * - QA_Engineer: Test creation, execution, bug filing
 * - Developer: Run tests, inspect WER/CER alignment
 * - Viewer: Read-only access
 */

const ROLES = {
  ADMIN: 'Admin',
  QA_ENGINEER: 'QA_Engineer',
  DEVELOPER: 'Developer',
  VIEWER: 'Viewer'
};

const PERMISSIONS = {
  PROJECT_CREATE: ['Admin'],
  PROJECT_DELETE: ['Admin'],
  TEST_CREATE: ['Admin', 'QA_Engineer'],
  TEST_EXECUTE: ['Admin', 'QA_Engineer', 'Developer'],
  TEST_VIEW: ['Admin', 'QA_Engineer', 'Developer', 'Viewer'],
  INTEGRATIONS_CONFIG: ['Admin', 'QA_Engineer']
};

class AuthService {
  constructor() {
    this.currentUser = {
      id: 'usr-1',
      name: 'Aditya (Lead AI Engineer)',
      email: 'aditya@indicvoice.lab',
      role: ROLES.ADMIN,
      authMethod: 'OAuth2 / Enterprise SSO'
    };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  setRole(newRole) {
    if (Object.values(ROLES).includes(newRole)) {
      this.currentUser.role = newRole;
      return this.currentUser;
    }
    throw new Error('Invalid role');
  }

  hasPermission(permissionName, role = this.currentUser.role) {
    const allowed = PERMISSIONS[permissionName] || [];
    return allowed.includes(role);
  }
}

const authService = new AuthService();

module.exports = {
  authService,
  ROLES,
  PERMISSIONS
};

