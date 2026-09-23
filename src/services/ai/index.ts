import env from '../../utils/env';
import { logInfo } from '../logger';

import { AIExplanationResponse, testOpenAIKey } from './baseAiService';
import { getCrossChainBridgeAIExplanation } from './crossChainBridgeAiService';
import { getDexAIExplanation } from './dexAiService';
import { getGovernanceAIExplanation } from './governanceAiService';
import { getLendingAIExplanation } from './lendingAiService';
import { getMultisigBurningAIExplanation } from './multisigBurningAiService';
import { getMultisigMintingAIExplanation } from './multisigMintingAiService';
import { getCurrentProviderType } from './providers/aiProvider';
import { currentProviderHasValidApiKey, ensureApiKeyStatus } from './providers/AIProviderFactory';
import { getQarTokenAIExplanation } from './qarTokenAiService';
import { getQarTokenCronAIExplanation } from './qarTokenCronAiService';
import { getStakingAIExplanation } from './stakingAiService';

/**
 * Fetches AI-generated explanations for a specific flow type and step number.
 * @param flowType
 * @param stepNumber
 * @param useHardcoded
 * @param defaultDescription
 * @return A promise that resolves to an AIExplanationResponse containing the explanation and simplified explanation.
 */
export const getAIExplanation = async (
  flowType: string,
  stepNumber: number,
  useHardcoded: boolean = false,
  defaultDescription?: string
): Promise<AIExplanationResponse> => {
  // Make sure we know which providers have server-side API keys before
  // deciding whether to call an LLM or fall back to hardcoded explanations
  await ensureApiKeyStatus();

  // Simulate API call delay for consistent UX
  await new Promise(resolve => setTimeout(resolve, 300));

  // Debug logs are removed in production
  if (env.NODE_ENV === 'development') {
    logInfo('AI Service - Environment check:', {
      hasCurrentProviderApiKey: currentProviderHasValidApiKey(),
      currentProvider: getCurrentProviderType(),
      useHardcoded: !currentProviderHasValidApiKey() || env.VITE_USE_HARDCODED_EXPLANATIONS === 'true',
    });
  }

  // Route to the appropriate flow-specific service based on the flow type
  switch (flowType) {
    case 'staking':
      return getStakingAIExplanation(stepNumber, useHardcoded, defaultDescription);
    case 'qarTokenCron':
      return getQarTokenCronAIExplanation(stepNumber, useHardcoded, defaultDescription);
    case 'multisigMinting':
      return getMultisigMintingAIExplanation(stepNumber, useHardcoded, defaultDescription);
    case 'multisigBurning':
      return getMultisigBurningAIExplanation(stepNumber, useHardcoded, defaultDescription);
    case 'qarToken':
      return getQarTokenAIExplanation(stepNumber, useHardcoded, defaultDescription);
    case 'crossChainBridge':
      return getCrossChainBridgeAIExplanation(stepNumber, useHardcoded, defaultDescription);
    case 'dex':
      return getDexAIExplanation(stepNumber, useHardcoded, defaultDescription);
    case 'governance':
      return getGovernanceAIExplanation(stepNumber, useHardcoded, defaultDescription);
    case 'lending':
      return getLendingAIExplanation(stepNumber, useHardcoded, defaultDescription);
    default:
      return {
        explanation: `AI explanation for ${flowType} step ${stepNumber} is not available yet.`,
        simplifiedExplanation: 'This flow type is not supported yet.',
      };
  }
};

// Export the testOpenAIKey function for use in the application
export { testOpenAIKey };

export type { AIExplanationResponse };
