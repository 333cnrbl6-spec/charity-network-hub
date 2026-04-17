import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Use the app's subdomain for backend function calls
const getServerUrl = () => {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  // If on a subdomain, construct the functions URL
  if (hostname.includes('.')) {
    const parts = hostname.split('.');
    const subdomain = parts[0];
    return `https://${subdomain}.base44.com`;
  }
  return '';
};

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: getServerUrl(),
  requiresAuth: false,
  appBaseUrl
});