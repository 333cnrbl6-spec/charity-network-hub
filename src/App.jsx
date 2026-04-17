import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
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
        <Route path="/" element={<Dashboard />} />
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
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App