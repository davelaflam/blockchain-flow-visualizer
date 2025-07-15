import env from '../../../utils/env';

import { AIProvider, AIProviderType, getCurrentProviderType } from './aiProvider';
import { ClaudeProvider } from './ClaudeProvider';
import { GeminiProvider } from './GeminiProvider';
import { OpenAIProvider } from './OpenAIProvider';

export class AIProviderFactory {
  private static instance: AIProviderFactory;
  private providers: Map<AIProviderType, AIProvider> = new Map();
  private constructor() {}

  /**
   * Get the singleton instance of the AIProviderFactory.
   * @return {AIProviderFactory} The singleton instance.
   */
  public static getInstance(): AIProviderFactory {
    if (!AIProviderFactory.instance) {
      AIProviderFactory.instance = new AIProviderFactory();
    }
    return AIProviderFactory.instance;
  }

  /**
   * Get an instance of the AI provider based on the type.
   * @param type
   */
  public getProvider(type?: AIProviderType): AIProvider {
    const providerType = type || getCurrentProviderType();

    if (this.providers.has(providerType)) {
      return this.providers.get(providerType)!;
    }

    let provider: AIProvider;

    switch (providerType) {
      case AIProviderType.OPENAI:
        provider = new OpenAIProvider();
        break;
      case AIProviderType.GEMINI:
        provider = new GeminiProvider();
        break;
      case AIProviderType.CLAUDE:
        provider = new ClaudeProvider();
        break;
      default:
        provider = new OpenAIProvider();
    }

    // store the provider instance in the cache
    this.providers.set(providerType, provider);

    return provider;
  }

  /**
   * Check if the given provider type has a valid API key.
   * @param {AIProviderType} type - The type of the AI provider.
   * @return {boolean} True if the provider has a valid API key, false otherwise.
   */
  public hasValidApiKey(type: AIProviderType): boolean {
    switch (type) {
      case AIProviderType.OPENAI:
        return !!env.VITE_OPENAI_API_KEY && env.VITE_OPENAI_API_KEY !== '';
      case AIProviderType.GEMINI:
        return !!env.VITE_GEMINI_API_KEY && env.VITE_GEMINI_API_KEY !== '';
      case AIProviderType.CLAUDE:
        return !!env.VITE_CLAUDE_API_KEY && env.VITE_CLAUDE_API_KEY !== '';
      default:
        return false;
    }
  }

  /**
   * Check if the current AI provider has a valid API key.
   * @return {boolean} True if the current provider has a valid API key, false otherwise.
   */
  public currentProviderHasValidApiKey(): boolean {
    const currentType = getCurrentProviderType();
    return this.hasValidApiKey(currentType);
  }

  /**
   * Get all available AI providers with their names and API key status.
   * @return {Array<{ type: AIProviderType; name: string; hasApiKey: boolean }>} List of providers.
   */
  public getAllProviders(): { type: AIProviderType; name: string; hasApiKey: boolean }[] {
    return [
      { type: AIProviderType.OPENAI, name: 'OpenAI', hasApiKey: this.hasValidApiKey(AIProviderType.OPENAI) },
      { type: AIProviderType.GEMINI, name: 'Gemini', hasApiKey: this.hasValidApiKey(AIProviderType.GEMINI) },
      { type: AIProviderType.CLAUDE, name: 'Claude', hasApiKey: this.hasValidApiKey(AIProviderType.CLAUDE) },
    ];
  }
}

/**
 * Get the current AI provider instance.
 * @return {AIProvider} The current AI provider instance.
 */
export const getCurrentProvider = (): AIProvider => {
  return AIProviderFactory.getInstance().getProvider();
};

/**
 * Call the current AI provider with a prompt.
 * @param prompt
 * @return {Promise<string>} The response from the AI provider.
 */
export const callCurrentProvider = async (prompt: string) => {
  const provider = getCurrentProvider();
  return provider.callLLM(prompt);
};

/**
 * Check if the current AI provider has a valid API key.
 * @return {boolean} True if the current provider has a valid API key, false otherwise.
 */
export const currentProviderHasValidApiKey = (): boolean => {
  return AIProviderFactory.getInstance().currentProviderHasValidApiKey();
};
