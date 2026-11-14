export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year'
  | 'custom';

export interface DateRangeSelection {
  preset: DateRangePreset;
  label: string;
  startDate: string;
  endDate: string;
}

export type IndustryCategory =
  | 'IT & Software'
  | 'BPO / Call Centre'
  | 'Manufacturing'
  | 'Construction'
  | 'Retail & Hospitality'
  | 'Healthcare'
  | 'Logistics'
  | 'Other Industries';

export type RegionCategory = 'India' | 'Middle East' | 'APAC' | 'Other';

export type CompanyAccountStatus =
  | 'Active'
  | 'Pending Verification'
  | 'Trial'
  | 'Suspended'
  | 'Deactivated';

export type OnboardingStage =
  | 'Sign Up'
  | 'Verification'
  | 'Configuration'
  | 'Go Live';

export type VerificationStatus = 'Verified' | 'Pending Review' | 'Rejected' | 'Incomplete';

export type PlanCode = 'ESSENTIAL' | 'GROWTH' | 'BUSINESS' | 'ENTERPRISE';
export type PlanName = 'Essential' | 'Growth' | 'Business' | 'Enterprise';

export type ModuleKey =
  | 'Employee Management'
  | 'Attendance'
  | 'Leave'
  | 'Payroll'
  | 'Compliance'
  | 'Expense Management'
  | 'Recruitment'
  | 'Performance'
  | 'Reports'
  | 'Contractor Management'
  | 'API Access';

export interface CompanyBranch {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  employeeCount: number;
  isHeadquarters: boolean;
}

export interface CompanyContact {
  id: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  alternateContact?: string;
  isPrimary: boolean;
}

export interface VerificationDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: 'Verified' | 'Pending' | 'Rejected';
}

export interface Company {
  id: string; // e.g. CMP-1001
  legalName: string;
  displayName: string;
  registrationNumber: string;
  businessType: 'Private Limited' | 'Public Limited' | 'LLP' | 'Partnership' | 'Proprietorship';
  industry: IndustryCategory;
  subIndustry: string;
  website: string;
  email: string;
  phone: string;
  logoInitials: string;
  logoColor: string;
  description: string;
  // Address
  country: string;
  state: string;
  city: string;
  district: string;
  postalCode: string;
  registeredAddress: string;
  billingAddress: string;
  region: RegionCategory;
  // Business Config
  companySize: '1-50' | '51-200' | '201-500' | '501-2000' | '2000+';
  employeeCount: number;
  activeEmployeeCount: number;
  expectedEmployeeCount: number;
  branchCount: number;
  locationCount: number;
  financialYear: string;
  currency: 'INR' | 'USD' | 'AED' | 'SGD';
  timeZone: string;
  primaryLanguage: string;
  // Metrics & Status
  monthlyPayrollINR: number; // in INR
  growthMoM: number; // percentage
  subscriptionPlan: PlanName;
  subscriptionId: string;
  registrationDate: string;
  accountStatus: CompanyAccountStatus;
  verificationStatus: VerificationStatus;
  onboardingStage: OnboardingStage;
  onboardingDays: number;
  lastActive: string;
  enabledModules: ModuleKey[];
  branches: CompanyBranch[];
  contacts: CompanyContact[];
  documents: VerificationDocument[];
  internalNotes?: string;
  legalHold?: boolean;
  deletedAt?: string;
}

export type SubscriptionStatus =
  | 'Active'
  | 'Trial'
  | 'Expiring Soon'
  | 'Expired'
  | 'Paused'
  | 'Cancelled';

export type BillingCycle = 'Monthly' | 'Annual';

export interface SubscriptionChangeRecord {
  id: string;
  date: string;
  actor: string;
  changeType: 'Created' | 'Upgraded' | 'Downgraded' | 'Renewed' | 'Trial Extended' | 'Paused' | 'Cancelled' | 'Reactivated' | 'Edited';
  fromPlan?: PlanName;
  toPlan?: PlanName;
  notes: string;
}

export interface Subscription {
  id: string; // e.g. SUB-4001
  companyId: string;
  companyName: string;
  planName: PlanName;
  planVersion: string;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  renewalDate: string;
  nextBillingDate: string;
  employeeLimit: number;
  currentUsage: number;
  baseAmount: number;
  discountPercent: number;
  taxAmount: number;
  amount: number; // final amount
  status: SubscriptionStatus;
  enabledModules: ModuleKey[];
  autoRenew: boolean;
  changeHistory: SubscriptionChangeRecord[];
}

export interface PricingPlan {
  id: string;
  name: PlanName;
  code: PlanCode;
  version: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  trialDays: number;
  employeeLimit: number;
  branchLimit: number;
  storageLimitGB: number;
  apiLimitPerDay: number;
  enabledModules: ModuleKey[];
  supportLevel: 'Standard Email' | 'Priority Business' | '24x7 Dedicated' | 'Enterprise SLA';
  status: 'Active' | 'Inactive' | 'Archived';
  updatedAt: string;
}

export interface PlanAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  billingFrequency: 'Monthly' | 'Annual' | 'One-Time' | 'Per Employee / Month';
  eligibility: string;
  status: 'Active' | 'Inactive' | 'Archived';
}

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Voided';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  companyId: string;
  companyName: string;
  subscriptionId: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: InvoiceStatus;
  reconciliationRef?: string;
  reconciliationNotes?: string;
  paidAt?: string;
}

export type TransactionStatus = 'Succeeded' | 'Pending' | 'Failed' | 'Refunded' | 'Partially Refunded';

export interface PaymentTransaction {
  id: string;
  transactionId: string;
  companyId: string;
  companyName: string;
  invoiceNumber: string;
  paymentGateway: 'Razorpay' | 'Stripe' | 'Cashfree' | 'NEFT/RTGS Manual';
  amount: number;
  paymentDate: string;
  paymentMethod: 'Corporate Card' | 'UPI Autopay' | 'NetBanking' | 'Wire Transfer' | 'Mandate';
  status: TransactionStatus;
  gatewayReference: string;
  reconciled: boolean;
  gatewayResponseSummary: string;
}

export type RefundStatus = 'Pending Approval' | 'Approved' | 'Processed' | 'Rejected';

export interface RefundRecord {
  id: string;
  refundId: string;
  paymentId: string;
  companyId: string;
  companyName: string;
  requestedAmount: number;
  approvedAmount: number;
  reason: string;
  status: RefundStatus;
  initiatedDate: string;
  completedDate?: string;
  approvedBy?: string;
}

export type PlatformRoleName =
  | 'Platform Super Admin'
  | 'Platform Administrator'
  | 'Support Administrator'
  | 'Billing Administrator'
  | 'Operations Administrator'
  | 'Security Auditor'
  | 'Read-only Analyst';

export type PlatformUserStatus = 'Active' | 'Inactive' | 'Pending Invitation' | 'Locked';

export interface PlatformSession {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  current: boolean;
}

export interface PlatformLoginHistory {
  id: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  result: 'Success' | 'Failed' | 'MFA Challenge';
}

export interface PlatformUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarInitials: string;
  avatarColor: string;
  department: 'Executive' | 'Platform Ops' | 'Customer Support' | 'Revenue & Billing' | 'Security & Compliance' | 'Analytics';
  designation: string;
  roleId: string;
  roleName: string;
  status: PlatformUserStatus;
  mfaEnabled: boolean;
  lastLogin: string;
  createdDate: string;
  sessions: PlatformSession[];
  loginHistory: PlatformLoginHistory[];
}

export type PermissionModule =
  | 'Dashboard'
  | 'Companies'
  | 'Subscriptions'
  | 'Billing'
  | 'Platform Users'
  | 'Access & Roles'
  | 'Usage & Health'
  | 'Service Logs'
  | 'Integrations'
  | 'Data & Settings'
  | 'Support & Tickets'
  | 'Announcements'
  | 'Audit & Security';

export type PermissionAction =
  | 'View'
  | 'Create'
  | 'Edit'
  | 'Delete'
  | 'Approve'
  | 'Export'
  | 'Activate'
  | 'Suspend'
  | 'Manage';

export type PermissionMap = Record<PermissionModule, PermissionAction[]>;

export interface RoleDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
  category: 'Core Administration' | 'Operations & Support' | 'Finance & Billing' | 'Governance & Audit';
  isSystemRole: boolean;
  status: 'Active' | 'Inactive';
  permissions: PermissionMap;
}

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  scope: string;
  enforcement: 'Enforced' | 'Audit Only' | 'Disabled';
  updatedAt: string;
}

export type ServiceStatus = 'Operational' | 'Degraded' | 'Down' | 'Maintenance' | 'Unknown';

export interface MicroserviceHealth {
  id: string;
  name: string;
  status: ServiceStatus;
  responseTimeMs: number;
  requestsLastHour: number;
  errorRatePercent: number;
  uptimePercent: number;
  lastHealthCheck: string;
  version: string;
  lastDeployment: string;
  cpuPercent: number;
  memoryPercent: number;
  dependencies: string[];
  recentErrors: { id: string; timestamp: string; code: string; summary: string }[];
  deployments: { version: string; deployedAt: string; deployedBy: string; status: 'Success' | 'Rolled Back' }[];
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface ServiceLogEntry {
  id: string;
  timestamp: string;
  service: string;
  environment: 'production' | 'staging' | 'sandbox';
  level: LogLevel;
  message: string;
  requestId: string;
  traceId: string;
  tenantId: string;
  durationMs: number;
  statusCode: number;
  stackTrace?: string;
  metadata: Record<string, string | number>;
}

export type IntegrationCategory =
  | 'Payment Gateways'
  | 'Banking'
  | 'Email'
  | 'SMS'
  | 'WhatsApp'
  | 'Biometric Devices'
  | 'Accounting'
  | 'E-signature'
  | 'Document Services'
  | 'Government Portals'
  | 'Webhooks'
  | 'External APIs';

export interface PlatformIntegration {
  id: string;
  name: string;
  provider: string;
  category: IntegrationCategory;
  scope: 'Platform-Wide' | 'Tenant-Isolated Template';
  connectionStatus: 'Connected' | 'Disconnected' | 'Degraded';
  configStatus: 'Configured' | 'Pending Setup' | 'Disabled';
  lastSync: string;
  apiEndpoint: string;
  authMethod: 'OAuth 2.0' | 'API Key + HMAC' | 'mTLS Certificate' | 'Bearer Token';
  secretReference: string; // masked reference, never raw secret
  environment: 'Production' | 'Sandbox';
  webhookUrl: string;
  retryPolicy: string;
  enabled: boolean;
}

export interface GlobalConfig {
  platformName: string;
  tagline: string;
  defaultLanguage: string;
  defaultCurrency: string;
  timeZone: string;
  dateFormat: string;
  timeFormat: '12-hour' | '24-hour';
  regionalDefaults: string;
}

export interface IndustryConfigItem {
  id: string;
  name: IndustryCategory;
  code: string;
  enabled: boolean;
  subIndustries: string[];
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  stage: 'GA' | 'Beta' | 'Internal';
  enabledGlobally: boolean;
  rolloutPercent: number;
  eligiblePlans: PlanName[];
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: 'Email' | 'SMS' | 'In-App' | 'WhatsApp';
  eventType: string;
  subject: string;
  body: string;
  variables: string[];
  language: string;
  status: 'Active' | 'Inactive';
}

export interface StatutoryRule {
  id: string;
  name: string;
  jurisdiction: string;
  state: string;
  category: 'PF / Social Security' | 'ESIC' | 'Professional Tax' | 'TDS / Income Tax' | 'Labour Welfare Fund' | 'Minimum Wages';
  effectiveDate: string;
  version: string;
  approvalStatus: 'Draft' | 'Pending Approval' | 'Published' | 'Archived';
  sourceDocument: string;
  lastReviewedDate: string;
  summary: string;
}

export interface DataRetentionPolicy {
  id: string;
  domain: string;
  retentionYears: number;
  legalHoldOverride: boolean;
  storageUsedGB: number;
  lastBackupAt: string;
  backupStatus: 'Healthy' | 'In Progress' | 'Attention Needed';
}

export type TicketCategory =
  | 'Payroll'
  | 'Attendance'
  | 'Subscription'
  | 'Billing'
  | 'Technical Issue'
  | 'Account Access'
  | 'Integration'
  | 'Feature Request'
  | 'Other';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 'Open' | 'In Progress' | 'Waiting for Customer' | 'Resolved' | 'Closed';

export interface TicketMessage {
  id: string;
  author: string;
  authorType: 'Customer' | 'Support Agent' | 'Internal Note';
  timestamp: string;
  content: string;
}

export interface SupportTicket {
  id: string;
  ticketId: string;
  subject: string;
  companyId: string;
  companyName: string;
  category: TicketCategory;
  priority: TicketPriority;
  assignedAgent: string;
  createdDate: string;
  lastUpdated: string;
  status: TicketStatus;
  requiresSensitiveDataAccess: boolean;
  messages: TicketMessage[];
  attachments: string[];
}

export type AnnouncementStatus = 'Draft' | 'Scheduled' | 'Published' | 'Archived';

export interface Announcement {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'Product Release' | 'Scheduled Maintenance' | 'Statutory Advisory' | 'Security Notice' | 'Billing Update';
  targetCompanies: string;
  targetPlans: PlanName[];
  targetIndustries: IndustryCategory[];
  targetRegions: RegionCategory[];
  createdBy: string;
  publishDate: string;
  expiryDate: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  status: AnnouncementStatus;
}

export interface HelpDocArticle {
  id: string;
  title: string;
  category: 'Platform Guides' | 'Admin Guides' | 'API Documentation' | 'FAQs' | 'Troubleshooting' | 'Release Notes';
  summary: string;
  content: string;
  author: string;
  updatedAt: string;
  status: 'Published' | 'Draft' | 'Archived';
  readTime: string;
}

export type AuditEventType =
  | 'Login'
  | 'Logout'
  | 'Create'
  | 'Edit'
  | 'Delete'
  | 'Approve'
  | 'Suspend'
  | 'Activate'
  | 'Permission Change'
  | 'Financial Action'
  | 'Configuration Change'
  | 'Security Event';

export interface AuditEvent {
  id: string;
  eventId: string;
  user: string;
  role: string;
  action: string;
  eventType: AuditEventType;
  module: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  result: 'Success' | 'Denied' | 'Failed';
  requestId: string;
  previousValue?: string;
  newValue?: string;
  details: string;
}

export interface PlatformNotification {
  id: string;
  type:
    | 'Company Registration'
    | 'Subscription Renewal'
    | 'Failed Payment'
    | 'Service Incident'
    | 'Support Ticket'
    | 'Security Alert'
    | 'Announcement';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRoute: string;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}
