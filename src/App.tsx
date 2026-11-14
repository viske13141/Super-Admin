import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PlatformProvider } from './services/platformStore';
import { AppShell } from './app/layouts/AppShell';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { CompaniesPage } from './features/companies/CompaniesPage';
import { CompanyFormWizard } from './features/companies/CompanyFormWizard';
import { CompanyDetailPage } from './features/companies/CompanyDetailPage';
import { SubscriptionsPage } from './features/subscriptions/SubscriptionsPage';
import { SubscriptionDetailPage } from './features/subscriptions/SubscriptionDetailPage';
import { BillingPage } from './features/billing/BillingPage';
import { PlatformUsersPage } from './features/platform-users/PlatformUsersPage';
import { PlatformUserDetailPage } from './features/platform-users/PlatformUserDetailPage';
import { AccessRolesPage } from './features/access-roles/AccessRolesPage';
import { UsageHealthPage } from './features/usage-health/UsageHealthPage';
import { ServiceDetailPage } from './features/usage-health/ServiceDetailPage';
import { ServiceLogsPage } from './features/service-logs/ServiceLogsPage';
import { IntegrationsPage } from './features/integrations/IntegrationsPage';
import { DataSettingsPage } from './features/data-settings/DataSettingsPage';
import { SupportTicketsPage } from './features/support/SupportTicketsPage';
import { TicketDetailPage } from './features/support/TicketDetailPage';
import { AnnouncementsPage } from './features/announcements/AnnouncementsPage';
import { HelpDocsPage } from './features/help-docs/HelpDocsPage';
import { AuditSecurityPage } from './features/audit-security/AuditSecurityPage';
import { NotFoundPage } from './features/common/NotFoundPage';

export default function App() {
  return (
    <PlatformProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />

            {/* Platform */}
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/new" element={<CompanyFormWizard />} />
            <Route path="/companies/:id" element={<CompanyDetailPage />} />
            <Route path="/companies/:id/edit" element={<CompanyFormWizard />} />

            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/subscriptions/:id" element={<SubscriptionDetailPage />} />

            <Route path="/billing" element={<BillingPage />} />

            <Route path="/platform-users" element={<PlatformUsersPage />} />
            <Route path="/platform-users/:id" element={<PlatformUserDetailPage />} />

            <Route path="/access-roles" element={<AccessRolesPage />} />

            {/* Operations */}
            <Route path="/usage-health" element={<UsageHealthPage />} />
            <Route path="/usage-health/:id" element={<ServiceDetailPage />} />

            <Route path="/service-logs" element={<ServiceLogsPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/data-settings" element={<DataSettingsPage />} />
            <Route path="/audit-security" element={<AuditSecurityPage />} />

            {/* Support */}
            <Route path="/support-tickets" element={<SupportTicketsPage />} />
            <Route path="/support-tickets/:id" element={<TicketDetailPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/help-docs" element={<HelpDocsPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PlatformProvider>
  );
}
