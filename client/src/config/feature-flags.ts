/**
 * Feature Flag Configuration
 * 
 * Centralized feature flag management system for controlling access
 * to various application features. Feature flags can be controlled
 * via environment variables and allow for easy toggling of functionality.
 */

interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  default: boolean;
  envVar: string;
}

/**
 * Available feature flags in the application
 */
const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  MAP_FEATURE: {
    key: 'MAP_FEATURE',
    name: 'Map Feature',
    description: 'Interactive map view for discovering events and venues',
    default: false, // Default to disabled for public usage
    envVar: 'VITE_ENABLE_MAP_FEATURE'
  },
  
  // Future feature flags can be added here
  // ANALYTICS_DASHBOARD: {
  //   key: 'ANALYTICS_DASHBOARD',
  //   name: 'Analytics Dashboard',
  //   description: 'Advanced analytics and reporting features',
  //   default: true,
  //   envVar: 'VITE_ENABLE_ANALYTICS'
  // }
} as const;

/**
 * Get the current state of a feature flag
 * @param flagKey - The feature flag key
 * @returns boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(flagKey: keyof typeof FEATURE_FLAGS): boolean {
  const flag = FEATURE_FLAGS[flagKey];
  
  if (!flag) {
    console.warn(`Feature flag "${flagKey}" not found. Defaulting to false.`);
    return false;
  }
  
  // Check environment variable first
  const envValue = import.meta.env[flag.envVar];
  
  if (envValue !== undefined) {
    // Handle string boolean values from environment
    if (typeof envValue === 'string') {
      return envValue.toLowerCase() === 'true' || envValue === '1';
    }
    return Boolean(envValue);
  }
  
  // Fall back to default value
  return flag.default;
}

/**
 * Get all feature flags with their current states
 * @returns Record of all feature flags and their current enabled state
 */
export function getAllFeatureFlags(): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  
  Object.keys(FEATURE_FLAGS).forEach(key => {
    flags[key] = isFeatureEnabled(key as keyof typeof FEATURE_FLAGS);
  });
  
  return flags;
}

/**
 * Get feature flag metadata
 * @param flagKey - The feature flag key
 * @returns Feature flag metadata or null if not found
 */
export function getFeatureFlagInfo(flagKey: keyof typeof FEATURE_FLAGS): FeatureFlag | null {
  return FEATURE_FLAGS[flagKey] || null;
}

/**
 * Debug utility to log all feature flags (development only)
 */
export function debugFeatureFlags(): void {
  if (import.meta.env.DEV) {
    console.group('🎚️ Feature Flags Status');
    Object.entries(FEATURE_FLAGS).forEach(([key, flag]) => {
      const isEnabled = isFeatureEnabled(key as keyof typeof FEATURE_FLAGS);
      const envValue = import.meta.env[flag.envVar];
      
      console.log(`${flag.name} (${key}):`, {
        enabled: isEnabled,
        envVar: flag.envVar,
        envValue: envValue || 'undefined',
        default: flag.default,
        description: flag.description
      });
    });
    console.groupEnd();
  }
}

// Log feature flags on import in development
if (import.meta.env.DEV) {
  debugFeatureFlags();
}

// Export feature flag keys for type safety
export const FeatureFlags = {
  MAP_FEATURE: 'MAP_FEATURE' as const,
  // Add other flags here as they're implemented
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;