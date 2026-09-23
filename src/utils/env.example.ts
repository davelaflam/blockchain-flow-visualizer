/**
 * Example of how to use the environment variable utility
 *
 * This file demonstrates how to use the env utility to access environment variables
 * in Vite.
 *
 * NOTE: AI provider API keys are NOT accessible here. They use non-VITE_
 * variable names (OPENAI_API_KEY, GEMINI_API_KEY, CLAUDE_API_KEY) and are read
 * only by the Vite dev server, which injects them into proxied requests.
 * They never reach the browser bundle.
 */

// Import the env utility
import { logInfo } from '../services/logger';

import env, { isDevelopment, getEnv } from './env';

// Example 1: Using the env object (recommended approach)
function example1() {
  // Check if we're in development mode
  if (env.NODE_ENV === 'development') {
    logInfo('Running in development mode');
  }

  // Access client-side environment variables (must start with VITE_)
  const useHardcoded = env.VITE_USE_HARDCODED_EXPLANATIONS;
}

// Example 2: Using the isDevelopment helper
function example2() {
  // A convenient way to check if we're in development mode
  if (isDevelopment()) {
    logInfo('Running in development mode');
  }
}

// Example 3: Using the getEnv function directly
function example3() {
  // You can also access environment variables directly with getEnv
  const useHardcoded = getEnv('VITE_USE_HARDCODED_EXPLANATIONS');
  const debug = getEnv('VITE_DEBUG');
}

/**
 * Usage guidelines:
 *
 * 1. Import the env utility in files that need to access environment variables
 * 2. Use the env object to access variables (env.VITE_VARIABLE_NAME)
 * 3. For NODE_ENV checks, consider using the isDevelopment helper
 * 4. Remember that all client-side environment variables must start with VITE_
 * 5. Secrets (API keys, tokens) must NOT use the VITE_ prefix — anything with
 *    that prefix is bundled into client code. The AI provider keys are handled
 *    server-side by the dev proxy for this reason.
 */
