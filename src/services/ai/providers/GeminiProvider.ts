import axios from 'axios';

import env from '../../../utils/env';
import { logInfo, logWarn } from '../../logger';
import { AIExplanationResponse } from '../baseAiService';

import { AIProvider } from './aiProvider';
import { validateApiKey, handleApiError, removeMarkdownCodeBlocks, parseJsonResponse } from './aiProviderUtils';

export class GeminiProvider implements AIProvider {
  name = 'Gemini';
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey = env.VITE_GEMINI_API_KEY || '';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = 'gemini-2.5-flash-lite-preview-06-17'; // gemini-2.5-flash
    this.maxOutputTokens = 4000;
  }

  private maxOutputTokens: number;

  /**
   * Calls the Gemini API with the provided prompt and returns an explanation response.
   * @param prompt The text prompt to send to the Gemini API for generating a response
   * @returns {Promise<AIExplanationResponse>} The explanation response from the Gemini API
   * @throws Error if the API key is invalid or if the API call fails
   */
  async callLLM(prompt: string): Promise<AIExplanationResponse> {
    validateApiKey(this.apiKey, 'Gemini');

    try {
      // Log API key length only in development
      if (env.NODE_ENV === 'development') {
        logInfo('Making Gemini API call with key length:', this.apiKey.length);
      }

      const response = await axios.post(
        `${this.apiUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: this.maxOutputTokens,
            topP: 0.9,
            topK: 40,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Extract the content from Gemini's response format
      let content = '';
      if (response.data.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0];

        // Check for MAX_TOKENS finish reason
        if (candidate.finishReason === 'MAX_TOKENS') {
          // Log the token usage for debugging
          if (env.NODE_ENV === 'development') {
            logWarn('Max tokens reached. Consider increasing maxOutputTokens or simplifying the prompt.');
            logInfo('Token usage:', response.data.usageMetadata);
          }

          // Try to recover by reducing the max tokens and retrying with a simpler prompt
          this.maxOutputTokens = Math.min(8000, Math.ceil(this.maxOutputTokens * 1.5));
          const retryPrompt = `${prompt}\n\nPlease provide a more concise response.`;

          // Only retry once to avoid infinite loops
          if (this.maxOutputTokens <= 8000) {
            return this.callLLM(retryPrompt);
          }
        }

        // Log the response structure in development for debugging
        if (env.NODE_ENV === 'development') {
          logInfo('Gemini API response structure:', JSON.stringify(candidate.content, null, 2));
        }

        // Handle different response structures from Gemini API
        if (candidate.content) {
          // Case 1: Response has parts array with text property
          if (candidate.content.parts && candidate.content.parts.length > 0 && candidate.content.parts[0].text) {
            content = candidate.content.parts[0].text;
          }
          // Case 2: Response has only role property (no parts array or empty parts)
          else {
            // Provide a default explanation
            content = JSON.stringify({
              explanation:
                "The AI model didn't provide a detailed response. This might happen with complex queries or when the model is uncertain.",
              simplifiedExplanation: "Sorry, I couldn't generate a detailed explanation for this step.",
            });

            // Log the issue in development
            if (env.NODE_ENV === 'development') {
              logWarn('Gemini API response has unexpected structure:', candidate.content);
            }
          }
        }
      }

      if (!content) {
        throw new Error('Empty response from Gemini API');
      }

      // Remove markdown code blocks if present
      content = removeMarkdownCodeBlocks(content);

      // Trim any leading/trailing whitespace
      content = content.trim();

      // Check if content ends abruptly (possible truncation)
      const isTruncated = content.trim().endsWith('...') || !content.trim().endsWith('}');
      if (isTruncated && env.NODE_ENV === 'development') {
        logInfo('Gemini response appears to be truncated');
      }

      // Parse the response and handle any errors
      return parseJsonResponse(content, isTruncated);
    } catch (error) {
      handleApiError(error, 'Gemini');
      throw error;
    }
  }

  /**
   * Tests if the Gemini API key is valid and working by making a simple API call.
   * @returns {Promise<{ success: boolean; message: string }>} Object containing success status and a descriptive message
   */
  async testApiKey(): Promise<{ success: boolean; message: string }> {
    try {
      // Validate API key
      try {
        validateApiKey(this.apiKey, 'Gemini');
      } catch (error) {
        return {
          success: false,
          message:
            'API key is missing or invalid. Make sure you have added VITE_GEMINI_API_KEY to your .env file and restarted the development server.',
        };
      }

      // Make a simple API call to test the key
      const response = await axios.post(
        `${this.apiUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Hello, this is a test message to verify the API key is working.' }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 10,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        message: 'API key is valid and working correctly.',
      };
    } catch (error: any) {
      handleApiError(error, 'Gemini');
      return {
        success: false,
        message: `API key test failed: ${error.message || 'Unknown error'}`,
      };
    }
  }
}
