# AI Service Documentation

## Overview

The AI service provides explanations for various blockchain flows using Large Language Models (LLMs). The service supports multiple AI providers and their respective models:

### Supported Models by Provider

#### OpenAI
| Model | Context Window | Best For | Notes |
|-------|----------------|----------|-------|
| GPT-4o | 128K tokens | General purpose, complex reasoning | Fastest and most capable model |
| GPT-4-turbo | 128K tokens | General purpose, complex reasoning | Optimized for speed and cost |
| GPT-3.5-turbo | 16K tokens | General purpose, cost-effective | Good balance of speed and cost |

#### Google Gemini
| Model | Input(s) | Output | Best For |
|-------|----------|--------|----------|
| Gemini 2.5 Pro | Audio, images, videos, text, PDF | Text | Enhanced thinking and reasoning, multimodal understanding |
| Gemini 2.5 Flash | Audio, images, videos, text | Text | Adaptive thinking, cost efficiency |
| Gemini 2.5 Flash-Lite | Text, image, video, audio | Text | High throughput, most cost-efficient |

#### Anthropic Claude
| Model | Context Window | Best For | Notes |
|-------|----------------|----------|-------|
| Claude 3 Opus | 200K tokens | Complex reasoning, analysis | Most capable model |
| Claude 3 Sonnet | 200K tokens | General purpose | Balanced performance |
| Claude 3 Haiku | 200K tokens | Fast responses, cost-effective | Fastest and most affordable |

> **Note:** The default model for each provider is automatically selected based on the best balance of performance and cost for blockchain explanations.

## Configuration

To use the AI service, you need to configure API keys in the `.env` file:

```
# OpenAI API Key
VITE_OPENAI_API_KEY=your_openai_api_key

# Google Gemini API Key
VITE_OPENAI_API_KEY=your_gemini_api_key

# Anthropic Claude API Key
VITE_OPENAI_API_KEY=your_claude_api_key
```

You can obtain API keys from:
- OpenAI: https://platform.openai.com/
- Gemini: https://ai.google.dev/
- Claude: https://console.anthropic.com/

## Usage

The AI service can be used through the `getAIExplanation` function:

```typescript
import { getAIExplanation } from '../../services/ai';

// Get an explanation for a specific flow and step
const explanation = await getAIExplanation('flowType', stepNumber);
```

## Provider Selection

Users can select their preferred AI provider through the UI. The selection is stored in localStorage and persists across sessions.

### Programmatic Provider Selection

You can also set the provider programmatically:

```typescript
import { AIProviderType, setCurrentProviderType } from '../../services/ai/providers/aiProvider';

// Set the provider to Gemini
setCurrentProviderType(AIProviderType.GEMINI);
```

## Fallback Mechanism

If an API call fails or no API key is provided for the selected provider, the service will fall back to hardcoded explanations.

You can force the use of hardcoded explanations by setting:

```
VITE_USE_HARDCODED_EXPLANATIONS=true
```

## Adding a New Provider

To add a new AI provider:

1. Create a new provider class in the `providers` directory that implements the `AIProvider` interface
2. Add the provider to the `AIProviderType` enum in `aiProvider.ts`
3. Update the `AIProviderFactory` to create instances of the new provider
4. Add the necessary environment variables to the `.env` file

## Architecture

The AI service follows a provider pattern:

- `AIProvider` interface defines the contract for all providers
- Provider implementations (OpenAIProvider, GeminiProvider, ClaudeProvider) handle API-specific logic
- `AIProviderFactory` creates and caches provider instances
- `baseAiService.ts` provides backward compatibility with the existing codebase

## Provider-Specific Notes

### OpenAI Provider

OpenAI's models are known for their strong reasoning capabilities and are well-suited for technical explanations. The service automatically selects the most appropriate model based on the complexity of the request.

### Gemini Provider

The Gemini provider uses the `gemini-2.5-flash` model by default and handles various response formats:

1. For most responses, the content is extracted from `candidate.content.parts[0].text`
2. If the response doesn't include the "text" field in the "parts" array or has no parts array at all (which can happen with certain queries), the provider returns a default explanation

### Anthropic Claude Provider

The Claude provider uses the `claude-3-opus` model by default. Claude models are particularly good at:
- Detailed technical explanations
- Following complex instructions
- Maintaining context over long conversations

The provider handles various response formats and includes automatic retry logic for rate limits.
3. Detailed logging is enabled in development mode to help diagnose issues with the API responses

The provider handles two main response structures:
```typescript
// Case 1: Standard response with parts array containing text
if (candidate.content.parts && candidate.content.parts.length > 0 && candidate.content.parts[0].text) {
  content = candidate.content.parts[0].text;
} 
// Case 2: Response with only role property (no parts array or empty parts)
else {
  // Provide a default explanation
  content = JSON.stringify({
    explanation: "The AI model didn't provide a detailed response...",
    simplifiedExplanation: "Sorry, I couldn't generate a detailed explanation..."
  });
}
```

This approach ensures that even when the API returns a minimal response (e.g., `{"role": "model"}` without any content), the application still provides a meaningful explanation to the user instead of failing.

## CORS Handling

The Claude API has CORS restrictions that prevent direct browser requests. To handle this:

1. A proxy is configured in `package.json` to forward requests to the Claude API:
   ```json
   "proxy": "https://api.anthropic.com"
   ```

2. The ClaudeProvider uses relative URLs that are proxied through the development server:
   ```typescript
   const apiUrl = process.env.NODE_ENV === 'development' 
     ? `/v1/messages` // This will be handled by the proxy
     : this.apiUrl;
   ```

3. The required `anthropic-dangerous-direct-browser-access` header is included in all requests:
   ```typescript
   headers: {
     'Content-Type': 'application/json',
     'x-api-key': this.apiKey,
     'anthropic-version': '2023-06-01',
     'anthropic-dangerous-direct-browser-access': 'true'
   }
   ```

This setup works for development. For production, you should implement a proper backend proxy or serverless function to handle the requests.
