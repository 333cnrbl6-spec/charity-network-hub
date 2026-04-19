import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Unified hook for branch-aware filtering across all pages.
 * Priority: URL path > sessionStorage (set by Sidebar selector).
 */
export function useBranchFilter() {
  const location = useLocation();
  const [viewMode, setViewMode] = useState('national');
  const [currentBranch, setCurrentBranch] = useState(null);
  const [currentRegion, setCurrentRegion] = useState(null);

  useEffect(() => {
    if (location.pathname.startsWith('/branch/')) {
      const branchId = location.pathname.split('/')[2];
      setViewMode('branch');
      setCurrentBranch(branchId);
      setCurrentRegion(null);
    } else if (location.pathname.startsWith('/regional/')) {
      const region = location.pathname.split('/')[2];
      setViewMode('regional');
      setCurrentRegion(region);
      setCurrentBranch(null);
    } else {
      // Fall back to Sidebar-selected context from sessionStorage
      const storedRegion = sessionStorage.getItem('selectedRegion') || 'national';
      const storedBranch = JSON.parse(sessionStorage.getItem('selectedBranch') || 'null');
      if (storedBranch) {
        setViewMode('branch');
        setCurrentBranch(storedBranch.branch_id);
        setCurrentRegion(null);
      } else if (storedRegion !== 'national') {
        setViewMode('regional');
        setCurrentRegion(storedRegion);
        setCurrentBranch(null);
      } else {
        setViewMode('national');
        setCurrentBranch(null);
        setCurrentRegion(null);
      }
    }
  }, [location.pathname]);

  // Apply filtering based on view mode
  const filterData = (items, branchField = 'branch_id') => {
    if (viewMode === 'national') return items;
    if (viewMode === 'branch') {
      return items.filter(item => item[branchField] === currentBranch);
    }
    // Regional: would need region mapping (implement if available)
    return items;
  };

  return {
    viewMode,
    currentBranch,
    currentRegion,
    filterData,
    isBranchView: viewMode === 'branch',
    isRegionalView: viewMode === 'regional',
    isNationalView: viewMode === 'national'
  };
}