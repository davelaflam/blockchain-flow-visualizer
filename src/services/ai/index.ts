import env from '../../utils/env';
import { logInfo } from '../logger';

import { AIExplanationResponse, callProviderSections, SectionHandler, testOpenAIKey } from './baseAiService';
import { generateCrossChainBridgePrompt, getCrossChainBridgeAIExplanation } from './crossChainBridgeAiService';
import { generateDexPrompt, getDexAIExplanation } from './dexAiService';
import { generateGovernancePrompt, getGovernanceAIExplanation } from './governanceAiService';
import { generateLendingPrompt, getLendingAIExplanation } from './lendingAiService';
import { generateMultisigBurningPrompt, getMultisigBurningAIExplanation } from './multisigBurningAiService';
import { generateMultisigMintingPrompt, getMultisigMintingAIExplanation } from './multisigMintingAiService';
import { getCurrentProviderType } from './providers/aiProvider';
import { currentProviderHasValidApiKey, ensureApiKeyStatus } from './providers/AIProviderFactory';
import { generateQarTokenPrompt, getQarTokenAIExplanation } from './qarTokenAiService';
import { generateQarTokenCronPrompt, getQarTokenCronAIExplanation } from './qarTokenCronAiService';
import { generateStakingPrompt, getStakingAIExplanation } from './stakingAiService';

/**
 * Prompt generators per flow type. Used for the parallel per-section calls;
 * the generated prompt's context is kept and only the section instruction
 * changes between calls.
 */
const PROMPT_GENERATORS: Record<string, (stepNumber: number, defaultDescription?: string) => string> = {
  staking: generateStakingPrompt,
  qarTokenCron: generateQarTokenCronPrompt,
  multisigMinting: generateMultisigMintingPrompt,
  multisigBurning: generateMultisigBurningPrompt,
  qarToken: generateQarTokenPrompt,
  crossChainBridge: generateCrossChainBridgePrompt,
  dex: generateDexPrompt,
  governance: generateGovernancePrompt,
  lending: generateLendingPrompt,
};

/**
 * In-memory cache of completed AI explanations, keyed by provider/flow/step,
 * so navigating back to a step renders instantly.
 */
const explanationCache = new Map<string, AIExplanationResponse>();

/**
 * Legacy single-call path that returns hardcoded or default explanations.
 * @param flowType
 * @param stepNumber
 * @param useHardcoded
 * @param defaultDescription
 */
const getFallbackExplanation = (
  flowType: string,
  stepNumber: number,
  useHardcoded: boolean,
  defaultDescription?: string
): Promise<AIExplanationResponse> => {
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
      return Promise.resolve({
        explanation: `AI explanation for ${flowType} step ${stepNumber} is not available yet.`,
        simplifiedExplanation: 'This flow type is not supported yet.',
      });
  }
};

/**
 * Fetches AI-generated explanations for a specific flow type and step number.
 * When a provider key is available, the four explanation sections are requested
 * in parallel and onSection is invoked as each resolves so the UI can render
 * progressively; the returned promise resolves to the merged response.
 * @param flowType
 * @param stepNumber
 * @param useHardcoded
 * @param defaultDescription
 * @param onSection Optional callback fired with each section's fields as it resolves
 * @return A promise that resolves to an AIExplanationResponse containing the explanation and simplified explanation.
 */
export const getAIExplanation = async (
  flowType: string,
  stepNumber: number,
  useHardcoded: boolean = false,
  defaultDescription?: string,
  onSection?: SectionHandler
): Promise<AIExplanationResponse> => {
  // Make sure we know which providers have server-side API keys before
  // deciding whether to call an LLM or fall back to hardcoded explanations
  await ensureApiKeyStatus();

  // Debug logs are removed in production
  if (env.NODE_ENV === 'development') {
    logInfo('AI Service - Environment check:', {
      hasCurrentProviderApiKey: currentProviderHasValidApiKey(),
      currentProvider: getCurrentProviderType(),
      useHardcoded: !currentProviderHasValidApiKey() || env.VITE_USE_HARDCODED_EXPLANATIONS === 'true',
    });
  }

  const generatePrompt = PROMPT_GENERATORS[flowType];
  const canUseAI =
    !!generatePrompt &&
    !useHardcoded &&
    currentProviderHasValidApiKey() &&
    env.VITE_USE_HARDCODED_EXPLANATIONS !== 'true';

  if (canUseAI) {
    const cacheKey = `${getCurrentProviderType()}:${flowType}:${stepNumber}`;
    const cached = explanationCache.get(cacheKey);
    if (cached) {
      onSection?.(cached);
      return cached;
    }

    const merged = await callProviderSections(generatePrompt(stepNumber, defaultDescription), onSection);
    if (merged) {
      explanationCache.set(cacheKey, merged);
      return merged;
    }
    // Total failure — fall through to the legacy path for hardcoded/default content
  }

  return getFallbackExplanation(flowType, stepNumber, useHardcoded, defaultDescription);
};

// Export the testOpenAIKey function for use in the application
export { testOpenAIKey };

export type { AIExplanationResponse };
