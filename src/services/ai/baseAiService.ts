import { AIExplanationResponse } from '../../components/common/ai/types/AIResponseTypes';
import env from '../../utils/env';
import { logError } from '../logger';

import { callCurrentProvider } from './providers/AIProviderFactory';
import { AIProviderFactory } from './providers/AIProviderFactory';

export type { AIExplanationResponse };

/**
 * Calls the current AI provider with the given prompt.
 * @param prompt The text prompt to send to the AI provider for generating a response
 * @returns {Promise<AIExplanationResponse>} A promise that resolves to an explanation response from the AI provider
 * @throws Error if the API call fails or if the API key is invalid
 */
export const callOpenAI = async (prompt: string): Promise<AIExplanationResponse> => {
  try {
    return await callCurrentProvider(prompt);
  } catch (error) {
    // Only log detailed error in development
    if (env.NODE_ENV === 'development') {
      logError('Error calling AI provider:', error);
    }
    throw error;
  }
};

/**
 * Tests the current AI provider's API key by making a simple request.
 * @returns {Promise<{ success: boolean; message: string }>} A promise that resolves to an object containing
 * a success flag and a descriptive message about the test result
 */
export const testOpenAIKey = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const provider = AIProviderFactory.getInstance().getProvider();
    return await provider.testApiKey();
  } catch (error: any) {
    if (env.NODE_ENV === 'development') {
      logError('Error testing API key:', error);
    }
    return {
      success: false,
      message: `API key test failed: ${error.message || 'Unknown error'}`,
    };
  }
};

/**
 * Generates a base prompt for the AI provider based on the flow type, step number, and step title.
 * @param flowType
 * @param stepNumber
 * @param stepTitle
 * @param defaultDescription
 * @return A formatted prompt string for the AI provider.
 */
export const generateBasePrompt = (
  flowType: string,
  stepNumber: number,
  stepTitle: string,
  defaultDescription?: string
): string => {
  // For step 0, use the defaultDescription in the prompt if provided
  if (stepNumber === 0 && defaultDescription) {
    return `
You are an expert blockchain educator. Please provide a detailed explanation for the ${flowType} flow.

Use this description as a starting point: "${defaultDescription}"

Please provide three different explanations:
1. A standard explanation that balances technical accuracy with accessibility
2. A technical explanation with implementation details for developers
3. A simplified explanation for beginners with no blockchain experience

Additionally, provide 2-3 "What-if scenarios" related to this flow. For example:
- "What happens if the transaction fails at some point?"
- "What if the user has insufficient funds?"
- "What if the network is congested during transactions?"

Format your response as a JSON object with these fields:
{
  "explanation": "Your standard explanation here",
  "technicalDetails": "Your technical explanation here",
  "technicalCode": "A code snippet that demonstrates the technical implementation of this flow",
  "simplifiedExplanation": "Your simplified explanation here",
  "whatIfScenarios": ["What-if scenario 1 with answer", "What-if scenario 2 with answer", "What-if scenario 3 with answer"]
}
`;
  }
  // for other steps, use the original prompt
  return `
You are an expert blockchain educator. Please provide a detailed explanation for step ${stepNumber} of the ${flowType} flow: "${stepTitle}".

Please provide three different explanations:
1. A standard explanation that balances technical accuracy with accessibility
2. A technical explanation with implementation details for developers
3. A simplified explanation for beginners with no blockchain experience

Additionally, provide 2-3 "What-if scenarios" related to this step. For example:
- "What happens if the transaction fails at this point?"
- "What if the user has insufficient funds?"
- "What if the network is congested during this transaction?"

Format your response as a JSON object with these fields:
{
  "explanation": "Your standard explanation here",
  "technicalDetails": "Your technical explanation here",
  "technicalCode": "A code snippet that demonstrates the technical implementation of this step",
  "simplifiedExplanation": "Your simplified explanation here",
  "whatIfScenarios": ["What-if scenario 1 with answer", "What-if scenario 2 with answer", "What-if scenario 3 with answer"]
}
`;
};
