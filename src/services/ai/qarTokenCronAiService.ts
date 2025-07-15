import { flowNodes, flowEdges } from '../../components/blockchainFlows/qarCron/flowLayout';
import { stepHighlightMap } from '../../components/blockchainFlows/qarCron/stepMap';
import { qarTokenCronSteps } from '../../components/blockchainFlows/qarCron/steps';
import { Step } from '../../components/blockchainFlows/types/StepTypes';
import env from '../../utils/env';
import { logError, logInfo } from '../logger';

import { AIExplanationResponse, callOpenAI, generateBasePrompt } from './baseAiService';
import { currentProviderHasValidApiKey } from './providers/AIProviderFactory';

// Hardcoded explanations for the QAR Token Cron Process Flow
export const qarTokenCronHardcodedExplanations: Record<number, AIExplanationResponse> = {
  1: {
    explanation:
      'In the Initial State, the QAR Token Cron system is at rest, waiting for the scheduled trigger to initiate the maintenance process. This is the baseline state where all components are idle but ready to perform their functions when activated.',
    technicalDetails:
      'During this phase, the system is in a dormant state with all services initialized but not actively processing. The cron scheduler is monitoring the time to determine when to trigger the next maintenance cycle. Database connections are established but idle, and the system is logging minimal activity.',
    simplifiedExplanation:
      'Think of this as the system taking a break between scheduled maintenance tasks. Everything is turned on and ready, but not actively working until the scheduled time arrives.',
  },
  2: {
    explanation:
      'The Cron-Start phase begins when the scheduler triggers the QAR token maintenance process. This activates the QAR Cron Process, which logs the start of the maintenance cycle and prepares to coordinate all subsequent operations.',
    technicalDetails:
      'The cron scheduler executes a time-based trigger (typically using crontab on Unix systems or a cloud scheduler service) that initiates the maintenance process. This trigger executes a script that starts the QAR Cron Process, which then logs the event with a timestamp and process ID. The system transitions from idle to active state, allocating necessary resources for the upcoming operations.',
    simplifiedExplanation:
      "This is like an alarm clock going off that tells the system it's time to start working. The system wakes up, makes a note that it's starting work, and gets ready to do its tasks.",
  },
  3: {
    explanation:
      'During the Confirm-Deposits phase, the QAR Token Process receives instructions to verify and confirm pending deposits that have reached sufficient blockchain confirmations. This ensures that only properly validated transactions are credited to user accounts.',
    technicalDetails:
      "The QAR Cron Process sends a command to the QAR Token Process to scan the deposit queue in the database. For each pending deposit, the system queries the blockchain to check if the transaction has reached the required number of confirmations (typically 6-12 for Bitcoin, 12-30 for Ethereum). Deposits that meet the confirmation threshold are marked as confirmed in the database, and the corresponding amount is credited to the user's account balance. This process involves atomic database transactions to ensure data consistency.",
    simplifiedExplanation:
      "This step is like checking if money transfers to the system have been fully processed by the bank. The system looks at all pending deposits, confirms they're legitimate and complete, and then adds the money to users' accounts.",
  },
  4: {
    explanation:
      "The Processing Operations phase involves the QAR Token Process handling multiple critical token operations simultaneously. This includes processing withdrawal requests from users and minting new tokens according to the protocol's tokenomics rules.",
    technicalDetails:
      'During this phase, the QAR Token Process executes three parallel operations: 1) It processes withdrawal requests by verifying user balances, applying any necessary fees, and initiating blockchain transactions to send tokens to user wallets; 2) It mints new tokens according to predefined tokenomics rules, such as inflation schedules or reward distributions; 3) It updates internal accounting systems to reflect all these operations. Each operation is executed within a transaction scope to ensure atomicity and data consistency.',
    simplifiedExplanation:
      "This is when the system handles multiple tasks at once: sending tokens to users who want to withdraw them, creating new tokens according to the system's rules, and keeping track of all these changes in its records.",
  },
  5: {
    explanation:
      'The Process Complete phase marks the successful completion of all maintenance tasks. The QAR Cron Process logs the completion status, all operations are finalized, and the system returns to its idle state until the next scheduled maintenance cycle.',
    technicalDetails:
      'In this final phase, the QAR Token Process signals completion to the QAR Cron Process, which then performs cleanup operations such as closing database connections, releasing locks, and finalizing logs. The system generates a comprehensive report of all operations performed during the maintenance cycle, including statistics on deposits confirmed, withdrawals processed, and tokens minted. This report is stored for audit purposes and may trigger alerts if any anomalies are detected. The system then transitions back to its idle state, waiting for the next scheduled trigger.',
    simplifiedExplanation:
      "This is like the end of a workday for the system. It wraps up all its tasks, makes sure everything is properly recorded, creates a summary of what it did, and then goes back to waiting mode until it's time to work again.",
  },
};

// Function to generate a prompt for the LLM based on the QAR Token Cron Process Flow and step number
export const generateQarTokenCronPrompt = (stepNumber: number, defaultDescription?: string): string => {
  // For step 0, use the base prompt with defaultDescription
  if (stepNumber === 0 && defaultDescription) {
    return generateBasePrompt('QAR Token Cron Process', stepNumber, 'Introduction', defaultDescription);
  }

  if (stepNumber > 0 && stepNumber <= qarTokenCronSteps.length) {
    const step = qarTokenCronSteps[stepNumber - 1];
    const highlight = stepHighlightMap[stepNumber];

    // Get active nodes and edges for this step
    const activeNodes = highlight.nodes
      .map((nodeId: string) => flowNodes.find(node => node.id === nodeId))
      .filter(Boolean);

    const activeEdges = highlight.edges
      .map((edgeId: string) => flowEdges.find(edge => edge.id === edgeId))
      .filter(Boolean);

    // Create a context-rich prompt
    return `
You are an expert blockchain educator explaining a QAR Token Cron Process Flow visualization. 
Please provide a detailed explanation for step ${stepNumber} of the QAR Token Cron flow: "${step.title}".

Step information:
- Description: ${step.description}
- What happens: ${step.what}
- Why it matters: ${step.why}

Active components in this step:
- Nodes: ${activeNodes.map((node: any) => `${node?.data.label} (${node?.data.description || 'No description'})`).join(', ')}
- Edges: ${activeEdges.map((edge: any) => `${edge?.data?.label || 'Unnamed'} connection`).join(', ')}

Please provide three different explanations:
1. A standard explanation that balances technical accuracy with accessibility
2. A technical explanation with implementation details for developers
3. A simplified explanation for beginners with no blockchain experience

Additionally, provide 2-3 "What-if scenarios" related to this step. For example:
- "What happens if the cron job fails to execute?"
- "What if there's a network outage during processing?"
- "What if multiple maintenance operations conflict?"

Format your response as a JSON object with these fields:
{
  "explanation": "Your standard explanation here",
  "technicalDetails": "Your technical explanation here",
  "technicalCode": "A code snippet that demonstrates the technical implementation of this step, based on the provided code example",
  "simplifiedExplanation": "Your simplified explanation here",
  "whatIfScenarios": ["What-if scenario 1 with answer", "What-if scenario 2 with answer", "What-if scenario 3 with answer"]
}
`;
  }

  // Default to base prompt if step number is invalid
  return generateBasePrompt(
    'QAR Token Cron Process',
    stepNumber,
    qarTokenCronSteps[stepNumber - 1]?.title || 'Unknown step'
  );
};

// Function to get AI explanations for the QAR Token Cron Process Flow
export const getQarTokenCronAIExplanation = async (
  stepNumber: number,
  useHardcoded: boolean = false,
  defaultDescription?: string
): Promise<AIExplanationResponse> => {
  // Check if we have a hardcoded explanation for this step
  const hardcodedExplanation = qarTokenCronHardcodedExplanations[stepNumber];

  // If useHardcoded is true, current provider has no valid API key, or hardcoded explanations are forced, return the hardcoded explanation
  if (useHardcoded || !currentProviderHasValidApiKey() || env.VITE_USE_HARDCODED_EXPLANATIONS === 'true') {
    if (env.NODE_ENV === 'development') {
      logInfo('Using hardcoded explanation for QAR Token Cron Process step', stepNumber);
    }
    return (
      hardcodedExplanation || {
        explanation: `AI explanation for QAR Token Cron Process step ${stepNumber} is not available yet.`,
        simplifiedExplanation: "This step's explanation is coming soon.",
      }
    );
  }

  try {
    // Generate a prompt for the LLM
    const prompt = generateQarTokenCronPrompt(stepNumber, defaultDescription);

    // Call the OpenAI API
    const aiResponse = await callOpenAI(prompt);

    return aiResponse;
  } catch (error) {
    // Only log detailed error in development
    if (env.NODE_ENV === 'development') {
      logError('Error getting AI explanation for QAR Token Cron Process flow:', error);
    }

    // Fallback to hardcoded explanations if available
    if (hardcodedExplanation) {
      if (env.NODE_ENV === 'development') {
        logInfo('Falling back to hardcoded explanation for QAR Token Cron Process flow');
      }
      return hardcodedExplanation;
    }

    // Default fallback
    return {
      explanation: `We couldn't generate an AI explanation for this step. Please try again later.`,
      simplifiedExplanation: 'Sorry, the explanation is temporarily unavailable.',
    };
  }
};
