import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { getDefaultPortalPath } from '@/lib/roleConfig';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import NationalDashboard from './pages/NationalDashboard';
import NetworkOverview from './pages/NetworkOverview';
import RegionalOverview from './pages/RegionalOverview';
import BranchDetails from './pages/BranchDetails';
import NetworkMap from './pages/NetworkMap';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import ServiceGapMap from './pages/ServiceGapMap';
import Volunteers from './pages/Volunteers';
import Jobs from './pages/Jobs';
import Sessions from './pages/Sessions';
import Grants from './pages/Grants';
import SyncLog from './pages/SyncLog';
import ComplianceOverview from './pages/ComplianceOverview';
import BranchComplianceDetail from './pages/BranchComplianceDetail';
import LocationManagement from './pages/LocationManagement';
import OnboardingDashboard from './pages/OnboardingDashboard';
import DataImport from './pages/DataImport';
import SubscriptionManagement from './pages/SubscriptionManagement';
import SueBradleyOnboarding from './pages/SueBradleyOnboarding';
import RoleOnboarding from './pages/RoleOnboarding';
import ImpactDashboard from './pages/ImpactDashboard';
import VolunteerOnboarding from './pages/VolunteerOnboarding';
import Boardroom from './pages/Boardroom';
import UserProfile from './pages/UserProfile';
import ProjectTasks from './pages/ProjectTasks';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import BuryCoordinatorPortal from './pages/BuryCoordinatorPortal';
import NetworkExpansion from './pages/NetworkExpansion';
import StaffPortal from './pages/StaffPortal';
import BranchOpsPortal from './pages/BranchOpsPortal';
import BranchCEOPortal from './pages/BranchCEOPortal';
import GovernancePortal from './pages/GovernancePortal';
import SmartOnboarding from './pages/SmartOnboarding';
import CharitySearch from './pages/CharitySearch';
import CharityAnalytics from './pages/CharityAnalytics';
import CharityOnboarding from './pages/CharityOnboarding';
import CharityOnboardingWizard from './pages/CharityOnboardingWizard';
import ComplianceHub from './pages/ComplianceHub';
import NetworkIntelligence from './pages/NetworkIntelligence';
import SafeguardingHub from './pages/SafeguardingHub';
import SafeguardingDashboard from './pages/SafeguardingDashboard';
import ReferralDashboard from './pages/ReferralDashboard';
import CreditManagement from './pages/CreditManagement';
import TrainingModule from './pages/TrainingModule';
import VolunteerFieldLog from './pages/VolunteerFieldLog';
import SafeguardingAnalytics from './pages/SafeguardingAnalytics';
import IncidentDetail from './pages/IncidentDetail';
import AssetLibrary from './pages/AssetLibrary';
import HandypersonCalendar from './pages/HandypersonCalendar';
import PricingComparison from './pages/PricingComparison';
import PlatformAdmin from './pages/PlatformAdmin';
import TenantPortal from './pages/TenantPortal';
import { TenantProvider } from '@/lib/tenantContext.jsx';
import CharityDashboard from './pages/CharityDashboard';
import CharityGrants from './pages/Grants';
import CharityHubOnboarding from './pages/Onboarding';
import CharityPricing from './pages/Pricing';
import CharitySmartSearch from './pages/CharitySmartSearch';
import CharityAnalyticsPage from './pages/CharityAnalyticsPage';
import MarketingLanding from './pages/MarketingLanding';
import PricingPage from './pages/PricingPage';
import FeaturesShowcase from './pages/FeaturesShowcase';
import PublicImpactDashboard from './pages/PublicImpactDashboard';
import PublicVolunteerRegistration from './pages/PublicVolunteerRegistration';
import VolunteerApprovalDashboard from './pages/VolunteerApprovalDashboard';
import CharityCompliancePage from './pages/CharityCompliancePage';
import BillingCustomer from './pages/BillingCustomer';
import APIKeysDashboard from './pages/APIKeysDashboard';
import WebhooksDashboard from './pages/WebhooksDashboard';
import StatusPage from './pages/StatusPage';
import CustomerHealthDashboard from './pages/CustomerHealthDashboard';
import UsageAnalyticsDashboard from './pages/UsageAnalyticsDashboard';
import APIDocumentation from './pages/APIDocumentation';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import HelpCenter from './pages/HelpCenter';
import BillingManagement from './pages/BillingManagement';
import Changelog from './pages/Changelog';
import SLAPolicy from './pages/SLAPolicy';
import APIKeyManagement from './pages/APIKeyManagement';
import WebhookManagement from './pages/WebhookManagement';
import OperationsMonitoring from './pages/OperationsMonitoring';
import OnboardingChecklistPage from './pages/OnboardingChecklistPage';
import SupportPortal from './pages/SupportPortal';
import SaaSMetricsDashboard from './pages/SaaSMetricsDashboard';
import PublicLandingPage from './pages/PublicLandingPage';

const AdminOnly = ({ children }) => {
  const { user } = useAuth();
  if (!user) return null;
  
  // Platform admin role = full hub access
  if (user.role === 'admin') return children;

  // national_director also gets hub access (non-admin platform role but org-level national)
  if (user.org_role === 'national_director') return children;

  // Everyone else: redirect to their appropriate portal
  window.location.replace(getDefaultPortalPath(user));
  return null;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<AdminOnly><NationalDashboard /></AdminOnly>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/network" element={<NetworkOverview />} />
        <Route path="/network-intelligence" element={<NetworkIntelligence />} />
        <Route path="/regional/:region" element={<RegionalOverview />} />
        <Route path="/branch/:branchId" element={<BranchDetails />} />
        <Route path="/map" element={<NetworkMap />} />
        <Route path="/service-gaps" element={<ServiceGapMap />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:clientId" element={<ClientDetail />} />
        <Route path="/volunteers" element={<Volunteers />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/grants" element={<Grants />} />
        <Route path="/sync-log" element={<SyncLog />} />
        <Route path="/compliance" element={<ComplianceOverview />} />
        <Route path="/branch/:branchId/compliance" element={<BranchComplianceDetail />} />
        <Route path="/locations" element={<LocationManagement />} />
        <Route path="/onboarding" element={<OnboardingDashboard />} />
        <Route path="/import" element={<DataImport />} />
        <Route path="/subscriptions" element={<SubscriptionManagement />} />
        <Route path="/impact" element={<ImpactDashboard />} />
        <Route path="/boardroom" element={<Boardroom />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/tasks" element={<ProjectTasks />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/expansion" element={<NetworkExpansion />} />
        <Route path="/search" element={<CharitySearch />} />
        <Route path="/charity-analytics" element={<CharityAnalytics />} />
        <Route path="/compliance-hub" element={<ComplianceHub />} />
        <Route path="/safeguarding" element={<SafeguardingHub />} />
        <Route path="/safeguarding-dashboard" element={<SafeguardingDashboard />} />
        <Route path="/referrals" element={<ReferralDashboard />} />
        <Route path="/safeguarding/analytics" element={<SafeguardingAnalytics />} />
        <Route path="/safeguarding/incident/:incidentId" element={<IncidentDetail />} />
        <Route path="/training" element={<TrainingModule />} />
        <Route path="/credits" element={<CreditManagement />} />
        <Route path="/field-log" element={<VolunteerFieldLog />} />
        <Route path="/library" element={<AssetLibrary />} />
        <Route path="/handyperson-calendar" element={<HandypersonCalendar />} />
        <Route path="/pricing" element={<PricingComparison />} />
        <Route path="/billing" element={<BillingManagement />} />
        <Route path="/platform-admin" element={<PlatformAdmin />} />
        <Route path="/my-organisation" element={<TenantPortal />} />
        {/* Role-based portals — inside AppLayout so they get the sidebar */}
        <Route path="/coordinator-portal" element={<BuryCoordinatorPortal />} />
        <Route path="/staff-portal" element={<StaffPortal />} />
        <Route path="/branch-ops" element={<BranchOpsPortal />} />
        <Route path="/branch-ceo" element={<BranchCEOPortal />} />
        <Route path="/governance-portal" element={<GovernancePortal />} />
        <Route path="/volunteer-approvals" element={<VolunteerApprovalDashboard />} />
        </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <TenantProvider>
          <Router>
          <Routes>
            {/* Public landing page */}
            <Route path="/landing" element={<PublicLandingPage />} />
            <Route path="/" element={<MarketingLanding />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/features" element={<FeaturesShowcase />} />
            <Route path="/impact" element={<PublicImpactDashboard />} />
            <Route path="/volunteer-signup" element={<PublicVolunteerRegistration />} />
            {/* Public routes — no auth required */}
            <Route path="/sue-bradley-onboarding" element={<SueBradleyOnboarding />} />
            <Route path="/role-onboarding" element={<RoleOnboarding />} />
            <Route path="/volunteer-onboarding" element={<VolunteerOnboarding />} />
            {/* Smart onboarding — open to all */}
            <Route path="/onboard" element={<SmartOnboarding />} />
            <Route path="/charity-onboarding" element={<CharityOnboarding />} />
            <Route path="/charity-wizard" element={<CharityOnboardingWizard />} />
            {/* CharityHub standalone routes */}
            <Route path="/charity-dashboard" element={<CharityDashboard />} />
            <Route path="/charity-grants" element={<CharityGrants />} />
            <Route path="/charity-setup" element={<CharityHubOnboarding />} />
            <Route path="/charity-pricing" element={<CharityPricing />} />
            <Route path="/charity-search" element={<CharitySmartSearch />} />
            <Route path="/charity-analytics" element={<CharityAnalyticsPage />} />
            <Route path="/charity-compliance" element={<CharityCompliancePage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/admin/customer-health" element={<CustomerHealthDashboard />} />
            <Route path="/admin/usage" element={<UsageAnalyticsDashboard />} />
            <Route path="/api-docs" element={<APIDocumentation />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/sla" element={<SLAPolicy />} />
            <Route path="/api-keys" element={<APIKeysDashboard />} />
            <Route path="/webhooks" element={<WebhooksDashboard />} />
            <Route path="/billing" element={<BillingCustomer />} />
            <Route path="/ops-monitor" element={<OperationsMonitoring />} />
            <Route path="/onboarding-checklist" element={<OnboardingChecklistPage />} />
            <Route path="/support" element={<SupportPortal />} />
            <Route path="/metrics" element={<SaaSMetricsDashboard />} />
            {/* All other routes go through auth guard (includes role portals with sidebar) */}
            <Route path="*" element={<AuthenticatedApp />} />
            {/* Authenticated billing route */}
            <Route path="/billing" element={<AuthenticatedApp />} />
          </Routes>
          </Router>
          <Toaster />
          </TenantProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App