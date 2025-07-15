/**
 * Interface for What-If scenario objects
 */
export interface WhatIfScenario {
  scenario: string;
  answer: string;
}

/**
 * Interface for AI explanation responses
 */
export interface AIExplanationResponse {
  explanation: string;
  technicalDetails?: string;
  technicalCode?: string;
  simplifiedExplanation?: string;
  whatIfScenarios?: (string | WhatIfScenario)[];
}
