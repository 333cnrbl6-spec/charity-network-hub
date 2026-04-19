import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
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
import ComplianceHub from './pages/ComplianceHub';
import SafeguardingHub from './pages/SafeguardingHub';
import TrainingModule from './pages/TrainingModule';
import SafeguardingAnalytics from './pages/SafeguardingAnalytics';
import IncidentDetail from './pages/IncidentDetail';

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
        <Route path="/regional/:region" element={<RegionalOverview />} />
        <Route path="/branch/:branchId" element={<BranchDetails />} />
        <Route path="/map" element={<NetworkMap />} />
        <Route path="/clients" element={<Clients />} />
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
        <Route path="/safeguarding/analytics" element={<SafeguardingAnalytics />} />
        <Route path="/safeguarding/incident/:incidentId" element={<IncidentDetail />} />
        <Route path="/training" element={<TrainingModule />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            {/* Public routes — no auth required */}
            <Route path="/sue-bradley-onboarding" element={<SueBradleyOnboarding />} />
            <Route path="/role-onboarding" element={<RoleOnboarding />} />
            <Route path="/volunteer-onboarding" element={<VolunteerOnboarding />} />
            <Route path="/coordinator-portal" element={<BuryCoordinatorPortal />} />
            {/* Smart onboarding — open to all */}
            <Route path="/onboard" element={<SmartOnboarding />} />
            <Route path="/charity-onboarding" element={<CharityOnboarding />} />
            {/* Role-based portals — each tier of the Age UK hierarchy */}
            <Route path="/staff-portal" element={<StaffPortal />} />
            <Route path="/branch-ops" element={<BranchOpsPortal />} />
            <Route path="/branch-ceo" element={<BranchCEOPortal />} />
            <Route path="/governance-portal" element={<GovernancePortal />} />
            {/* All other routes go through auth guard */}
            <Route path="*" element={<AuthenticatedApp />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App