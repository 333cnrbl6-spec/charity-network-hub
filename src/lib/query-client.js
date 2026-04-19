import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,      // treat data as fresh for 30s — prevents redundant refetches
      gcTime: 5 * 60_000,     // keep unused cache for 5 min
    },
  },
});