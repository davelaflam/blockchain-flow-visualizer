import axios from 'axios';

import env from '../../../utils/env';
import { logInfo } from '../../logger';
import { AIExplanationResponse } from '../baseAiService';

import { AIProvider } from './aiProvider';
import { validateApiKey, handleApiError, removeMarkdownCodeBlocks, parseJsonResponse } from './aiProviderUtils';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey = env.VITE_OPENAI_API_KEY || '';
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-3.5-turbo'; // You can use 'gpt-4' for better results if available
  }

  /**
   * Calls the OpenAI API with the provided prompt and returns an explanation response.
   * @param prompt The text prompt to send to the OpenAI API for generating a response
   * @returns {Promise<AIExplanationResponse>} The explanation response from the OpenAI API
   * @throws Error if the API key is invalid or if the API call fails
   */
  async callLLM(prompt: string): Promise<AIExplanationResponse> {
    validateApiKey(this.apiKey, 'OpenAI');

    try {
      // Log API key length only in development
      if (env.NODE_ENV === 'development') {
        logInfo('Making OpenAI API call with key length:', this.apiKey.length);
      }

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant that explains blockchain concepts.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      let content = response.data.choices[0].message.content;

      // Remove markdown code blocks if present
      content = removeMarkdownCodeBlocks(content);

      /**
       * Pre-processes the content to extract only the valid JSON part.
       * This helps with cases where the model adds extra text before or after the JSON object.
       * @param text The text to extract JSON from
       * @returns The extracted JSON string or the original text if no JSON is found
       */
      const extractJsonObject = (text: string): string => {
        try {
          // First, try to find a complete JSON object with a more precise regex
          // This looks for the outermost JSON object that contains our expected fields
          const jsonRegex = /(\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\})/;
          const match = text.match(jsonRegex);

          if (match) {
            // Verify that the extracted text contains at least one of our expected fields
            const extracted = match[1];
            if (
              extracted.includes('"explanation"') ||
              extracted.includes('"technicalDetails"') ||
              extracted.includes('"simplifiedExplanation"') ||
              extracted.includes('"whatIfScenarios"')
            ) {
              return extracted;
            }
          }

          // If the precise regex didn't work, try a more aggressive approach
          // Look for the largest JSON-like structure in the text
          const fullJsonRegex = /(\{[\s\S]*\})/;
          const fullMatch = text.match(fullJsonRegex);
          if (fullMatch) {
            return fullMatch[1];
          }

          // If no JSON-like structure was found, return the original text
          return text;
        } catch (e) {
          // If any error occurs during extraction, log it and return the original text
          if (env.NODE_ENV === 'development') {
            handleApiError(e, 'OpenAI');
          }
          return text;
        }
      };

      // Extract the JSON object from the content
      const jsonContent = extractJsonObject(content);

      // Log the original and extracted JSON content in development
      if (env.NODE_ENV === 'development') {
        logInfo('Original content length:', content.length);
        logInfo('Original content preview:', content.substring(0, 100) + (content.length > 100 ? '...' : ''));

        // Log if the content was modified during extraction
        if (content !== jsonContent) {
          logInfo('Content was modified during JSON extraction');
          logInfo('Extracted JSON content length:', jsonContent.length);
          logInfo(
            'Extracted JSON content preview:',
            jsonContent.substring(0, 100) + (jsonContent.length > 100 ? '...' : '')
          );
        } else {
          logInfo('No JSON extraction was needed, using original content');
        }
      }

      // Check if the response might be truncated
      const isTruncated = content.trim().endsWith('...') || !content.trim().endsWith('}');
      if (isTruncated && env.NODE_ENV === 'development') {
        logInfo('OpenAI response appears to be truncated');
      }

      // Parse the response and handle any errors
      return parseJsonResponse(jsonContent, isTruncated);
    } catch (error) {
      handleApiError(error, 'OpenAI');
      throw error;
    }
  }

  /**
   * Tests if the OpenAI API key is valid and working by making a simple API call.
   * @returns {Promise<{ success: boolean; message: string }>} Object containing success status and a descriptive message
   */
  async testApiKey(): Promise<{ success: boolean; message: string }> {
    try {
      // Validate API key
      try {
        validateApiKey(this.apiKey, 'OpenAI');
      } catch (error) {
        return {
          success: false,
          message:
            'API key is missing or invalid. Make sure you have added VITE_OPENAI_API_KEY to your .env file and restarted the development server.',
        };
      }

      // Make a simple API call to test the key
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Hello, this is a test message to verify the API key is working.' },
          ],
          max_tokens: 10,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        success: true,
        message: 'API key is valid and working correctly.',
      };
    } catch (error: any) {
      handleApiError(error, 'OpenAI');
      return {
        success: false,
        message: `API key test failed: ${error.message || 'Unknown error'}`,
      };
    }
  }
}
