export type UserRole = 'admin' | 'support_manager' | 'support_agent' | 'viewer';

export interface PermissionSet {
  canImpersonate: boolean;
  canViewSensitiveNotes: boolean;
  canBulkUpdate: boolean;
  canExportData: boolean;
  canForceEndImpersonation: boolean;
  canManageSavedReplies: boolean;
  canViewAnalytics: boolean;
  canManageTeam: boolean;
  canAccessSecurityLogs: boolean;
  canModifyCustomerTier: boolean;
}

export class SupportPermissions {
  private static readonly ROLE_PERMISSIONS: Record<UserRole, PermissionSet> = {
    admin: {
      canImpersonate: true,
      canViewSensitiveNotes: true,
      canBulkUpdate: true,
      canExportData: true,
      canForceEndImpersonation: true,
      canManageSavedReplies: true,
      canViewAnalytics: true,
      canManageTeam: true,
      canAccessSecurityLogs: true,
      canModifyCustomerTier: true
    },
    support_manager: {
      canImpersonate: true,
      canViewSensitiveNotes: true,
      canBulkUpdate: true,
      canExportData: true,
      canForceEndImpersonation: false,
      canManageSavedReplies: true,
      canViewAnalytics: true,
      canManageTeam: true,
      canAccessSecurityLogs: false,
      canModifyCustomerTier: true
    },
    support_agent: {
      canImpersonate: true,
      canViewSensitiveNotes: false,
      canBulkUpdate: false,
      canExportData: false,
      canForceEndImpersonation: false,
      canManageSavedReplies: true,
      canViewAnalytics: true,
      canManageTeam: false,
      canAccessSecurityLogs: false,
      canModifyCustomerTier: false
    },
    viewer: {
      canImpersonate: false,
      canViewSensitiveNotes: false,
      canBulkUpdate: false,
      canExportData: false,
      canForceEndImpersonation: false,
      canManageSavedReplies: false,
      canViewAnalytics: true,
      canManageTeam: false,
      canAccessSecurityLogs: false,
      canModifyCustomerTier: false
    }
  };

  static getPermissions(role: UserRole): PermissionSet {
    return this.ROLE_PERMISSIONS[role] || this.ROLE_PERMISSIONS.viewer;
  }

  static canImpersonate(role: UserRole): boolean {
    return this.getPermissions(role).canImpersonate;
  }

  static canViewSensitiveNotes(role: UserRole): boolean {
    return this.getPermissions(role).canViewSensitiveNotes;
  }

  static canBulkUpdate(role: UserRole): boolean {
    return this.getPermissions(role).canBulkUpdate;
  }

  static canExportData(role: UserRole): boolean {
    return this.getPermissions(role).canExportData;
  }

  static canForceEndImpersonation(role: UserRole): boolean {
    return this.getPermissions(role).canForceEndImpersonation;
  }

  static canManageSavedReplies(role: UserRole): boolean {
    return this.getPermissions(role).canManageSavedReplies;
  }

  static canViewAnalytics(role: UserRole): boolean {
    return this.getPermissions(role).canViewAnalytics;
  }

  static canManageTeam(role: UserRole): boolean {
    return this.getPermissions(role).canManageTeam;
  }

  static canAccessSecurityLogs(role: UserRole): boolean {
    return this.getPermissions(role).canAccessSecurityLogs;
  }

  static canModifyCustomerTier(role: UserRole): boolean {
    return this.getPermissions(role).canModifyCustomerTier;
  }

  static validateNoteAccess(note: any, userRole: UserRole, userId: string): boolean {
    const permissions = this.getPermissions(userRole);
    
    // Users can always view their own notes
    if (note.adminUser.id === userId) {
      return true;
    }
    
    // Internal notes require special permissions
    if (note.isInternal && !permissions.canViewSensitiveNotes) {
      return false;
    }
    
    // High priority and fraud notes may have additional restrictions
    if ((note.category === 'high_priority' || note.category === 'fraud') && 
        !permissions.canViewSensitiveNotes) {
      return false;
    }
    
    return true;
  }

  static validateImpersonationAccess(targetUser: any, adminUser: any): { allowed: boolean; reason?: string } {
    const permissions = this.getPermissions(adminUser.role as UserRole);
    
    if (!permissions.canImpersonate) {
      return { allowed: false, reason: 'Insufficient permissions to impersonate users' };
    }
    
    // Prevent impersonating users with higher privileges
    if (this.hasHigherPrivileges(targetUser, adminUser)) {
      return { allowed: false, reason: 'Cannot impersonate users with higher privileges' };
    }
    
    // Additional business rules can be added here
    if (targetUser.id === adminUser.id) {
      return { allowed: false, reason: 'Cannot impersonate yourself' };
    }
    
    return { allowed: true };
  }

  private static hasHigherPrivileges(targetUser: any, adminUser: any): boolean {
    const roleHierarchy: UserRole[] = ['viewer', 'support_agent', 'support_manager', 'admin'];
    const targetRoleIndex = roleHierarchy.indexOf(targetUser.role as UserRole);
    const adminRoleIndex = roleHierarchy.indexOf(adminUser.role as UserRole);
    
    return targetRoleIndex > adminRoleIndex;
  }
}