import { AIProvider, AIProviderType, getCurrentProviderType } from './aiProvider';
import { ClaudeProvider } from './ClaudeProvider';
import { GeminiProvider } from './GeminiProvider';
import { OpenAIProvider } from './OpenAIProvider';

/**
 * Which providers have an API key configured on the dev server. Keys are
 * injected server-side by the Vite proxy, so the client only knows whether
 * a key exists — never its value. Populated by ensureApiKeyStatus().
 */
export interface ApiKeyStatus {
  openai: boolean;
  gemini: boolean;
  claude: boolean;
}

let apiKeyStatus: ApiKeyStatus = { openai: false, gemini: false, claude: false };
let apiKeyStatusPromise: Promise<void> | null = null;

/**
 * Fetches the server-side API key status from the dev-server's /api/ai-config
 * endpoint. Cached — subsequent calls reuse the same request. If the endpoint
 * is unavailable (e.g. a static production build with no backend), all
 * providers report no key and the app falls back to hardcoded explanations.
 */
export const ensureApiKeyStatus = (): Promise<void> => {
  if (!apiKeyStatusPromise) {
    apiKeyStatusPromise = fetch('/api/ai-config')
      .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((status: ApiKeyStatus) => {
        apiKeyStatus = status;
      })
      .catch(() => {
        // Endpoint unavailable — leave all statuses as false
      });
  }
  return apiKeyStatusPromise;
};

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
   * Reads the status last fetched by ensureApiKeyStatus() — call that first.
   * @param {AIProviderType} type - The type of the AI provider.
   * @return {boolean} True if the provider has a valid API key, false otherwise.
   */
  public hasValidApiKey(type: AIProviderType): boolean {
    return apiKeyStatus[type] ?? false;
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
   * Get all available AI providers with their names, models, and API key status.
   * @return {Array<{ type: AIProviderType; name: string; model: string; hasApiKey: boolean }>} List of providers.
   */
  public getAllProviders(): { type: AIProviderType; name: string; model: string; hasApiKey: boolean }[] {
    return [
      {
        type: AIProviderType.OPENAI,
        name: 'OpenAI',
        model: this.getProvider(AIProviderType.OPENAI).model,
        hasApiKey: this.hasValidApiKey(AIProviderType.OPENAI),
      },
      {
        type: AIProviderType.GEMINI,
        name: 'Gemini',
        model: this.getProvider(AIProviderType.GEMINI).model,
        hasApiKey: this.hasValidApiKey(AIProviderType.GEMINI),
      },
      {
        type: AIProviderType.CLAUDE,
        name: 'Claude',
        model: this.getProvider(AIProviderType.CLAUDE).model,
        hasApiKey: this.hasValidApiKey(AIProviderType.CLAUDE),
      },
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
