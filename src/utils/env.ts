/**
 * Environment variable utility for Vite
 * This provides a consistent way to access environment variables in the codebase.
 */

// Helper function to get environment variables
export function getEnv(key: string): string | undefined {
  // For Vite, environment variables are accessed through import.meta.env
  // and client-side variables must start with VITE_
  if (import.meta.env) {
    // Handle NODE_ENV specially
    if (key === 'NODE_ENV') {
      return import.meta.env.MODE;
    }

    // Get the variable directly from import.meta.env
    return (import.meta.env as Record<string, string>)[key];
  }

  return undefined;
}

// Convenience function for checking if we're in development mode
export function isDevelopment(): boolean {
  return getEnv('NODE_ENV') === 'development';
}

// Export a compatibility object that mimics process.env
export const env = new Proxy({} as Record<string, string | undefined>, {
  get: (_, prop: string) => getEnv(prop),
});

// Default export for convenience
export default env;
