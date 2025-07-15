import axios from 'axios';

import env from '../../../utils/env';
import { logInfo } from '../../logger';
import { AIExplanationResponse } from '../baseAiService';

import { AIProvider } from './aiProvider';
import { validateApiKey, handleApiError, removeMarkdownCodeBlocks, parseJsonResponse } from './aiProviderUtils';

export class ClaudeProvider implements AIProvider {
  name = 'Claude';
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey = env.VITE_CLAUDE_API_KEY || '';
    this.apiUrl = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-sonnet-4-20250514'; // Using Claude 3 Opus model
  }

  /**
   * Calls the Claude API with the provided prompt and returns an explanation response.
   * @param prompt The text prompt to send to the Claude API for generating a response
   * @returns {Promise<AIExplanationResponse>} The explanation response from the Claude API.
   * @throws Error if the API key is invalid or if the API call fails
   */
  async callLLM(prompt: string): Promise<AIExplanationResponse> {
    validateApiKey(this.apiKey, 'Claude');

    try {
      if (env.NODE_ENV === 'development') {
        logInfo('Making Claude API call with key length:', this.apiKey.length);
      }

      // Create a proxy URL for development environment to avoid CORS issues
      // In production, this should be handled by a proper backend proxy
      const apiUrl =
        env.NODE_ENV === 'development'
          ? `/v1/messages` // proxy set in package.json
          : this.apiUrl;

      if (env.NODE_ENV === 'development') {
        logInfo('Claude API request:', {
          url: apiUrl,
          model: this.model,
          promptLength: prompt.length,
        });
      }

      const response = await axios.post(
        apiUrl,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4000,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
        }
      );

      let content = '';
      if (response.data.content && response.data.content.length > 0) {
        content = response.data.content[0].text;
      }

      if (!content) {
        throw new Error('Empty response from Claude API');
      }

      // Remove markdown code blocks if present
      content = removeMarkdownCodeBlocks(content);

      // Check if the response was truncated (common with Claude due to token limits)
      const isTruncated = response.data.stop_reason === 'max_tokens';
      if (isTruncated && env.NODE_ENV === 'development') {
        logInfo('Claude response was truncated due to max_tokens limit');
      }

      return parseJsonResponse(content, isTruncated);
    } catch (error: any) {
      handleApiError(error, 'Claude');
      throw error;
    }
  }

  /**
   * Tests if the Claude API key is valid and working by making a simple API call.
   * @returns {Promise<{ success: boolean; message: string }>} Object containing success status and a descriptive message
   */
  async testApiKey(): Promise<{ success: boolean; message: string }> {
    try {
      try {
        validateApiKey(this.apiKey, 'Claude');
      } catch (error) {
        return {
          success: false,
          message:
            'API key is missing or invalid. Make sure you have added VITE_CLAUDE_API_KEY to your .env file and restarted the development server.',
        };
      }

      // Create a proxy URL for development environment to avoid CORS issues
      const apiUrl =
        env.NODE_ENV === 'development'
          ? `/v1/messages` // This will be handled by the proxy in package.json
          : this.apiUrl;

      // Make a simple API call to test the key
      const response = await axios.post(
        apiUrl,
        {
          model: this.model,
          messages: [{ role: 'user', content: 'Hello, this is a test message to verify the API key is working.' }],
          max_tokens: 10,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
        }
      );

      return {
        success: true,
        message: 'API key is valid and working correctly.',
      };
    } catch (error: any) {
      handleApiError(error, 'Claude');

      /**
       * Provide a more detailed error message if available
       */
      let errorMessage = 'Unknown error';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error.message || error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: `API key test failed: ${errorMessage}`,
      };
    }
  }
}
