import axios from 'axios';

import env from '../../../utils/env';
import { logInfo } from '../../logger';
import { AIExplanationResponse } from '../baseAiService';

import { AIProvider } from './aiProvider';
import { handleApiError, removeMarkdownCodeBlocks, parseJsonResponse } from './aiProviderUtils';

export class ClaudeProvider implements AIProvider {
  name = 'Claude';
  readonly model = 'claude-sonnet-4-5'; // Claude Sonnet 4.5
  private apiUrl: string;

  constructor() {
    // Requests go through the dev-server proxy, which injects the API key
    // server-side (CLAUDE_API_KEY in .env) so it never reaches the browser.
    this.apiUrl = '/api/anthropic';
  }

  /**
   * Calls the Claude API with the provided prompt and returns an explanation response.
   * @param prompt The text prompt to send to the Claude API for generating a response
   * @returns {Promise<AIExplanationResponse>} The explanation response from the Claude API.
   * @throws Error if the API key is invalid or if the API call fails
   */
  async callLLM(prompt: string): Promise<AIExplanationResponse> {
    try {
      if (env.NODE_ENV === 'development') {
        logInfo('Claude API request:', {
          url: this.apiUrl,
          model: this.model,
          promptLength: prompt.length,
        });
      }

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4000,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
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
      // Make a simple API call to test the key
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [{ role: 'user', content: 'Hello, this is a test message to verify the API key is working.' }],
          max_tokens: 10,
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
