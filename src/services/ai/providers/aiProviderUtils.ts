import env from '../../../utils/env';
import { logError, logInfo, logWarn } from '../../logger';
import { AIExplanationResponse } from '../baseAiService';

/**
 * Utility functions for AI providers to handle common tasks like JSON parsing,
 * response formatting, and error handling.
 */

/**
 * Validates if the API key is present and valid
 * @param apiKey The API key to validate
 * @param providerName The name of the provider for error messages
 * @throws Error if the API key is invalid or missing
 */
export const validateApiKey = (apiKey: string, providerName: string): void => {
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error(`Invalid or missing ${providerName} API key`);
  }
};

/**
 * Attempts to parse JSON content and return a valid AIExplanationResponse
 * @param content The JSON content to parse
 * @param isTruncated Whether the content is known to be truncated
 * @returns A valid AIExplanationResponse object
 */
export const parseJsonResponse = (content: string, isTruncated = false): AIExplanationResponse => {
  try {
    // First attempt: try to parse the content directly
    const parsedResponse = JSON.parse(content);
    return formatResponse(parsedResponse);
  } catch (parseError) {
    // Only log detailed error in development
    if (env.NODE_ENV === 'development') {
      logError('Error parsing JSON response:', parseError);
      logInfo('Response content that failed to parse:', content);
    }

    // If parsing fails, try to fix and extract as much information as possible
    return recoverJsonResponse(content, isTruncated);
  }
};

/**
 * Formats a parsed JSON object into a valid AIExplanationResponse
 * @param parsedResponse The parsed JSON object
 * @returns A valid AIExplanationResponse object
 */
export const formatResponse = (parsedResponse: any): AIExplanationResponse => {
  return {
    explanation: parsedResponse.explanation || 'No explanation provided.',
    technicalDetails: parsedResponse.technicalDetails || undefined,
    technicalCode: parsedResponse.technicalCode || undefined,
    simplifiedExplanation: parsedResponse.simplifiedExplanation || undefined,
    whatIfScenarios: parsedResponse.whatIfScenarios || undefined,
  };
};

/**
 * Attempts to recover a valid AIExplanationResponse from malformed JSON
 * @param content The content to recover from
 * @param isTruncated Whether the content is known to be truncated
 * @returns A valid AIExplanationResponse object
 */
export const recoverJsonResponse = (content: string, isTruncated = false): AIExplanationResponse => {
  try {
    // Try to fix incomplete JSON by adding missing closing brackets/braces
    let fixedContent = content;

    // Handle unterminated strings in the JSON
    fixedContent = fixedContent.replace(/("(?:\\.|[^"\\])*?)(?:\n|$)/g, '$1"');

    // Fix escaped quotes that might be causing issues
    fixedContent = fixedContent.replace(/\\"/g, '"').replace(/"/g, '"');

    // Re-add proper JSON escaping for quotes within strings
    fixedContent = fixedContent.replace(/"([^"]*)":/g, '"$1":');
    fixedContent = fixedContent.replace(/:"([^"]*)"/g, ':"$1"');

    // Count opening and closing braces/brackets to detect imbalance
    const openBraces = (fixedContent.match(/\{/g) || []).length;
    const closeBraces = (fixedContent.match(/\}/g) || []).length;
    const openBrackets = (fixedContent.match(/\[/g) || []).length;
    const closeBrackets = (fixedContent.match(/\]/g) || []).length;

    // Add missing closing braces/brackets
    for (let i = 0; i < openBraces - closeBraces; i++) {
      fixedContent += '}';
    }

    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      fixedContent += ']';
    }

    // Fix unclosed quotes in the last property
    const lastQuoteIndex = fixedContent.lastIndexOf('"');
    const lastColonIndex = fixedContent.lastIndexOf(':');

    // If there's a colon after the last quote, we might have an unclosed value
    if (lastColonIndex > lastQuoteIndex) {
      // Add a closing quote for the value
      fixedContent += '"';
    }

    // Try to parse the fixed content
    try {
      const parsedResponse = JSON.parse(fixedContent);
      if (env.NODE_ENV === 'development' && isTruncated) {
        logInfo('Successfully parsed truncated JSON after fixing');
      }
      return formatResponse(parsedResponse);
    } catch (fixError) {
      // If fixing didn't work, try more aggressive approaches
      if (env.NODE_ENV === 'development') {
        logError('Error parsing fixed content:', fixError);
      }
    }

    // Try to extract JSON-like content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        return formatResponse(parsedResponse);
      } catch (matchError) {
        // Continue to next approach if this fails
      }
    }

    // Extract individual fields using regex if JSON parsing fails
    const extractField = (fieldName: string): string | undefined => {
      const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, 'i');
      const match = content.match(regex);
      return match ? match[1] : undefined;
    };

    const extractArrayField = (fieldName: string): string[] | undefined => {
      const regex = new RegExp(`"${fieldName}"\\s*:\\s*\\[(.*?)\\]`, 's');
      const match = content.match(regex);
      if (!match) return undefined;

      // Extract items from the array
      const arrayContent = match[1];
      const items: string[] = [];

      // Match quoted strings in the array
      const itemRegex = /"([^"]*)"/g;
      let itemMatch;
      while ((itemMatch = itemRegex.exec(arrayContent)) !== null) {
        items.push(itemMatch[1]);
      }

      return items.length > 0 ? items : undefined;
    };

    // Extract fields
    const explanation = extractField('explanation');
    const technicalDetails = extractField('technicalDetails');
    const technicalCode = extractField('technicalCode');
    const simplifiedExplanation = extractField('simplifiedExplanation');
    const whatIfScenarios = extractArrayField('whatIfScenarios');

    // If we extracted at least one field, return it
    if (explanation || technicalDetails || technicalCode || simplifiedExplanation || whatIfScenarios) {
      return {
        explanation: explanation || 'Partial explanation recovered from incomplete response.',
        technicalDetails: technicalDetails || undefined,
        technicalCode: technicalCode || undefined,
        simplifiedExplanation: simplifiedExplanation || 'Sorry, the complete explanation could not be recovered.',
        whatIfScenarios: whatIfScenarios,
      };
    }

    /**
     * Final fallback: if all extraction methods fail return the raw content
     */
    return {
      explanation: content,
      technicalDetails: undefined,
      technicalCode: undefined,
      simplifiedExplanation: 'Sorry, the detailed explanations are not available for this response.',
      whatIfScenarios: undefined,
    };
  } catch (e) {
    /**
     * If all extraction methods fail, log the error in development
     */
    if (env.NODE_ENV === 'development') {
      logError('All JSON extraction methods failed:', e);
    }

    return {
      explanation: 'An error occurred while processing the AI response.',
      technicalDetails: undefined,
      technicalCode: undefined,
      simplifiedExplanation: 'Please try again or check your connection.',
      whatIfScenarios: undefined,
    };
  }
};

/**
 * Handles API errors in a consistent way
 * @param error The error object
 * @param providerName The name of the provider for error messages
 */
export const handleApiError = (error: any, providerName: string): void => {
  if (env.NODE_ENV === 'development') {
    logError(`Error calling ${providerName} API:`, error);

    /**
     * Log additional details about the error if available
     */
    if (error.response) {
      logError('Error response data:', error.response.data);
      logError('Error response status:', error.response.status);
      logError('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      logError('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      logError('Error message:', error.message);
    }
  }
};

/**
 * Removes markdown code blocks from content if present
 * @param content The content to process
 * @returns The content without markdown code blocks
 */
export const removeMarkdownCodeBlocks = (content: string): string => {
  if (content.includes('```json') || content.includes('```')) {
    return content.replace(/```json\s*|\s*```$/g, '');
  }
  return content;
};
