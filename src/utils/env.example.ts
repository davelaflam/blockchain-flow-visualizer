/**
 * Example of how to use the environment variable utility
 *
 * This file demonstrates how to use the env utility to access environment variables
 * in Vite.
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

  // Access environment variables
  const openAiKey = env.VITE_OPENAI_API_KEY;
  const geminiKey = env.VITE_GEMINI_API_KEY;
  const claudeKey = env.VITE_CLAUDE_API_KEY;
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
  const openAiKey = getEnv('VITE_OPENAI_API_KEY');
  const geminiKey = getEnv('VITE_GEMINI_API_KEY');
  const claudeKey = getEnv('VITE_CLAUDE_API_KEY');
}

/**
 * Usage guidelines:
 *
 * 1. Import the env utility in files that need to access environment variables
 * 2. Use the env object to access variables (env.VITE_VARIABLE_NAME)
 * 3. For NODE_ENV checks, consider using the isDevelopment helper
 * 4. Remember that all client-side environment variables must start with VITE_
 */
