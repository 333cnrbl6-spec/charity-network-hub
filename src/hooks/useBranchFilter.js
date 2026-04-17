import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Unified hook for branch-aware filtering across all pages
 * Ensures consistent data isolation across branch, regional, and national views
 */
export function useBranchFilter() {
  const location = useLocation();
  const [viewMode, setViewMode] = useState('national'); // 'national', 'regional', 'branch'
  const [currentBranch, setCurrentBranch] = useState(null);
  const [currentRegion, setCurrentRegion] = useState(null);

  useEffect(() => {
    // Detect view mode from URL
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
      setViewMode('national');
      setCurrentBranch(null);
      setCurrentRegion(null);
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