// Common types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Services Barrel Export - selective to avoid conflicts
export { AuthService } from './auth';
export { AnalyticsService } from './analytics';
export { ContractService } from './contracts';
export { SubscriptionService } from './subscriptions';
export { PaymentMethodService } from './payments';
export { PlanService, DiscountService } from './plans';
export { WebhookService } from './integrations';
export { ApiService, ApiClient } from './shared';

// New service layer exports
export { analyticsService } from './analytics.service';
export { contractService } from './contract.service';
export { notificationService } from './notifications/notification.service';
export { userService, publicUserService } from './users';
export { paymentProcessorService } from './payment-processor.service';

// Export service types
export type {
  AnalyticsOverviewData,
  AnalyticsMetric,
  TimelineData,
  RealtimeData
} from './analytics.service';

export type {
  ContractTemplate,
  Contract,
  ContractVariable,
  CreateContractTemplateDto,
  CreateContractDto
} from './contract.service';

// Export notification types
export type {
  NotificationRule,
  NotificationChannel,
  AlertInstance,
  NotificationMetrics,
  ScheduledReport,
  ReportExecution,
  WebhookEndpoint,
  WebhookDelivery,
  AutomationRule,
  UserNotification
} from './notifications/notification.service';

// Export user types
export type {
  User,
  UserRole,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  UserPermissions,
  UserListResponse,
  PermissionActions,
  SystemPermissions,
  SubscriberPermissions,
  PublicUser,
  CreatePublicUserRequest,
  UpdatePublicUserRequest,
  PublicUserFilters,
  PublicUserListResponse,
  PublicUserStats
} from './users';

// Export payment processor types
export type {
  PaymentProvider,
  PaymentProcessorConfig,
  PaymentProcessorResponse,
  UpdatePaymentProcessorRequest,
  UpdatePaymentProcessorResponse
} from './payment-processor.service';

// Admin services exported separately to avoid conflicts
import { auditLogService } from './admin/auditLog.service';
import { systemSettingsService } from './admin/systemSettings.service';
import { invoiceService } from './admin/invoice.service';
import { subscriberProfileService } from './admin/subscriberProfile.service';
import { supportService } from './support/support.service';
import { migrationService } from './migration/migration.service';

export {
  auditLogService as AdminAuditLogService,
  systemSettingsService as AdminSystemSettingsService,
  invoiceService as AdminInvoiceService,
  subscriberProfileService as AdminSubscriberProfileService,
  supportService as SupportService,
  migrationService as MigrationService
};