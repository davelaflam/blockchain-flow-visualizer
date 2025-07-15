import { AIExplanationResponse } from './AIResponseTypes';

/**
 * Interface for AI providers
 */
export interface AIProvider {
  name: string;
  callLLM(prompt: string): Promise<AIExplanationResponse>;
  testApiKey(): Promise<{ success: boolean; message: string }>;
}

/**
 * Enum for available AI providers
 */
export enum AIProviderType {
  OPENAI = 'openai',
  GEMINI = 'gemini',
  CLAUDE = 'claude',
}

/**
 * Default provider type
 */
export const DEFAULT_PROVIDER = AIProviderType.OPENAI;

/**
 * Function to get the current provider type from localStorage or default
 */
export const getCurrentProviderType = (): AIProviderType => {
  const savedProvider = localStorage.getItem('aiProvider');
  if (savedProvider && Object.values(AIProviderType).includes(savedProvider as AIProviderType)) {
    return savedProvider as AIProviderType;
  }
  return DEFAULT_PROVIDER;
};

/**
 * Function to set the current provider type in localStorage
 */
export const setCurrentProviderType = (providerType: AIProviderType): void => {
  localStorage.setItem('aiProvider', providerType);
};
