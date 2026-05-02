import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Check if user's tier has access to a feature
 * Usage: const { hasAccess, isLoading } = useFeatureAccess('ai_writing', charity.subscription_tier);
 */
export function useFeatureAccess(featureName, userTier) {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const flags = await base44.entities.FeatureFlag.filter({
          feature_name: featureName
        });

        if (!flags.length) {
          // Feature doesn't exist, allow by default
          setHasAccess(true);
          setIsLoading(false);
          return;
        }

        const flag = flags[0];

        // Check if feature is enabled globally
        if (!flag.enabled) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        // Check if user's tier has access
        const tierHasAccess = flag.tiers[userTier];
        setHasAccess(tierHasAccess || false);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking feature access:', error);
        setHasAccess(false);
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [featureName, userTier]);

  return { hasAccess, isLoading };
}

/**
 * Get all available features for a tier
 */
export function useAvailableFeatures(userTier) {
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const allFlags = await base44.entities.FeatureFlag.list();
        const available = allFlags.filter(f => f.enabled && f.tiers[userTier]);
        setFeatures(available);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching features:', error);
        setIsLoading(false);
      }
    };

    fetchFeatures();
  }, [userTier]);

  return { features, isLoading };
}