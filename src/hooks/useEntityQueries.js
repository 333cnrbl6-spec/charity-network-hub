/**
 * Centralised entity query hooks — single source of truth for all shared data.
 * All pages/components import from here to ensure deduplication via React Query cache.
 */
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const useClients    = () => useQuery({ queryKey: ['clients'],    queryFn: () => base44.entities.Client.list() });
export const useVolunteers = () => useQuery({ queryKey: ['volunteers'], queryFn: () => base44.entities.Volunteer.list() });
export const useJobs       = () => useQuery({ queryKey: ['jobs'],       queryFn: () => base44.entities.Job.list() });
export const useGrants     = () => useQuery({ queryKey: ['grants'],     queryFn: () => base44.entities.Grant.list() });
export const useSessions   = () => useQuery({ queryKey: ['sessions'],   queryFn: () => base44.entities.Session.list() });
export const useCompliance = () => useQuery({ queryKey: ['compliance'], queryFn: () => base44.entities.ComplianceRecord.list() });
export const useBranches   = () => useQuery({ queryKey: ['branches'],   queryFn: () => base44.entities.BranchConfig.list() });
export const useBranchReports = () => useQuery({ queryKey: ['branchReports'], queryFn: () => base44.entities.BranchReport.list() });
export const useSyncLogs   = () => useQuery({ queryKey: ['syncLogs'],   queryFn: () => base44.entities.SyncLog.list() });
export const useSafeguardingIncidents = () => useQuery({ queryKey: ['safeguardingIncidents'], queryFn: () => base44.entities.SafeguardingIncident.list() });
export const useVolunteerTraining = () => useQuery({ queryKey: ['volunteerTraining'], queryFn: () => base44.entities.VolunteerTraining.list() });