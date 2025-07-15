import { flowNodes, flowEdges } from '../../components/blockchainFlows/qar/flowLayout';
import { stepHighlightMap } from '../../components/blockchainFlows/qar/stepMap';
import { qarTokenSteps } from '../../components/blockchainFlows/qar/steps';
import { Step } from '../../components/blockchainFlows/types/StepTypes';
import env from '../../utils/env';
import { logError, logInfo } from '../logger';

import { AIExplanationResponse, callOpenAI, generateBasePrompt } from './baseAiService';
import { currentProviderHasValidApiKey } from './providers/AIProviderFactory';

// Hardcoded explanations for the QAR token flow
export const qarTokenHardcodedExplanations: Record<number, AIExplanationResponse> = {
  1: {
    explanation:
      'In this initial step, a user deposits AR tokens to the bridge contract. This action triggers the token wrapping process where native AR tokens will be converted to QAR tokens. The deposit is recorded with a unique identifier to track this specific transaction throughout the process. This is the entry point for users to participate in the QAR token ecosystem.',
    technicalDetails:
      "The deposit function in the bridge contract is called by the user's wallet, which transfers the specified amount of AR tokens from the user's wallet to the bridge contract using the ERC-20 transferFrom method. This requires prior approval from the user. The function emits a Deposit event containing the sender's address and amount, which is recorded on the blockchain for future reference and event tracking. The transaction includes gas fees for the network and may require a minimum deposit amount to be economically viable.",
    simplifiedExplanation:
      "You're sending your AR tokens to a special bridge that will convert them into QAR tokens. It's like depositing dollars at a currency exchange to get euros in return. The system creates a receipt for your deposit so it can track your specific transaction throughout the entire process.",
    whatIfScenarios: [
      "What if the user doesn't have enough AR tokens? The transaction will fail at the transferFrom stage with an 'insufficient balance' error, and no state changes will occur. The user would need to acquire more AR tokens before trying again.",
      'What if the network is congested? The transaction might take longer to be included in a block or require higher gas fees. Users can choose to pay more for faster processing or wait for network conditions to improve.',
    ],
  },
  2: {
    explanation:
      'The bridge contract confirms the deposit after the required number of network confirmations. This verification step ensures that the deposit transaction is securely recorded on the blockchain and cannot be reversed. Only after this confirmation does the system proceed with the token minting process. This step protects against potential double-spending attacks and transaction reversals.',
    technicalDetails:
      'A monitoring service tracks new Deposit events and waits until the transaction has reached the required number of confirmations (typically 10-20 blocks). Once confirmed, it calls the confirmDeposit function in the bridge contract, which updates the deposit status in a mapping and emits a DepositConfirmed event. This triggers the next step in the process while preventing potential double-minting if the blockchain experienced a short-lived fork. The confirmation threshold is typically set based on the security requirements and the specific blockchain being used.',
    simplifiedExplanation:
      'The system waits until your deposit is fully confirmed by the network. This is like the currency exchange double-checking that your dollars are genuine before proceeding. This prevents any potential issues if the transaction gets reversed or if someone tries to use the same AR tokens twice.',
    whatIfScenarios: [
      "What if a blockchain reorganization occurs during confirmation? If the deposit transaction is removed from the blockchain due to a reorganization before reaching the required confirmations, the deposit won't be confirmed and no QAR tokens will be minted. The user would need to submit a new deposit.",
      "What if the confirmation service goes offline? The system includes redundant monitoring services and fallback mechanisms. If the primary service fails, secondary services will take over. In the worst case, there might be a delay in confirmation, but deposits won't be lost.",
    ],
  },
  3: {
    explanation:
      "Once the deposit is confirmed, the bridge contract mints an equivalent amount of QAR tokens based on the deposited AR amount. These newly minted QAR tokens are then transferred to the user's wallet, completing the wrapping process. This step creates the wrapped token representation that can be used within the ecosystem while the original AR tokens remain locked in the bridge contract.",
    technicalDetails:
      'Authorized minters call the mintTokens function with the recipient address and amount parameters. This function interacts with the QAR token contract to mint new tokens using the standard ERC-20 mint function. The exchange rate is typically 1:1, though it may include fees in some implementations. The mint function emits a TokensMinted event with details of the recipient and amount for tracking purposes. The minting process is protected by access controls to ensure only authorized entities can create new tokens, maintaining the integrity of the token supply.',
    simplifiedExplanation:
      "The bridge creates brand new QAR tokens equal to the amount of AR you deposited and sends them to your wallet. It's like the currency exchange printing new euros to match the value of dollars you provided. Now you can use these QAR tokens in various applications while your original AR tokens are safely stored in the bridge.",
    whatIfScenarios: [
      "What if there's an error during the minting process? The transaction would revert, leaving the deposit confirmed but no tokens minted. The system includes automatic retry mechanisms for failed minting operations, and administrators can manually trigger the minting if needed.",
      "What if the user's address is invalid or unreachable? The system validates addresses before minting. If an address is invalid, the transaction would fail. If the address is valid but unreachable (e.g., a contract that can't handle tokens), the tokens would still be minted but might be unrecoverable without special intervention.",
    ],
  },
  4: {
    explanation:
      'The system calculates staking rewards for QAR token holders based on their proportion of the total QAR supply. These rewards are derived from the AR deposits and other revenue streams in the ecosystem, providing an incentive for users to hold QAR tokens. This reward mechanism encourages long-term participation in the ecosystem and compensates users for locking their AR tokens in the bridge.',
    technicalDetails:
      'The calculateRewards function iterates through all QAR token holders and calculates their rewards based on their balance compared to the total supply. It uses the formula: reward = (balance * totalRewards) / totalSupply. These rewards are stored in a mapping that tracks accumulated rewards per address. The function emits a RewardsCalculated event with the total rewards distributed in this cycle. This calculation typically runs on a scheduled basis (e.g., daily or weekly) and may include optimizations for gas efficiency such as checkpointing or batch processing for large numbers of holders.',
    simplifiedExplanation:
      "While holding QAR tokens, you earn rewards based on how many tokens you have compared to everyone else. It's like earning interest at a bank - the more you have deposited, the more rewards you earn, and the system keeps track of exactly how much you've earned. These rewards are your benefit for participating in the system and letting your AR tokens be used by the network.",
    whatIfScenarios: [
      'What if a user transfers tokens right before rewards calculation? Most systems use a snapshot mechanism that captures balances at a specific block number to prevent gaming the system. If a user transfers tokens after the snapshot but before calculation, their reward will still be based on their balance at the snapshot time.',
      'What if the total rewards pool is depleted? The system would distribute smaller rewards or potentially no rewards until the pool is replenished. The protocol typically has mechanisms to sustain the rewards pool through fees, inflation, or external funding sources.',
    ],
  },
  5: {
    explanation:
      'The user initiates a withdrawal request to convert their QAR tokens back to native AR tokens. This action burns (destroys) the QAR tokens and creates an unwrap request with a unique identifier to track the withdrawal process. This step begins the process of retrieving the original AR tokens that were locked in the bridge contract during the deposit phase.',
    technicalDetails:
      "The user calls the initiateWithdrawal function with the amount they wish to withdraw. The function checks the user's QAR balance, burns the specified amount using the QAR token's burn function, and creates a withdrawal request object with the user's address, amount, and a processed flag set to false. A unique requestId is generated using keccak256 hash of the user's address, amount, and current timestamp. The function emits a WithdrawalInitiated event with this requestId and withdrawal details. The burning mechanism ensures that the total supply of QAR tokens always matches the amount of AR tokens locked in the bridge, maintaining the peg between the two assets.",
    simplifiedExplanation:
      "You're asking to convert your QAR tokens back to AR tokens. The system destroys your QAR tokens and creates a withdrawal request with your name on it. It's like going back to the currency exchange with your euros and asking to get dollars back. The system needs to verify your request and prepare the original tokens for return.",
    whatIfScenarios: [
      "What if the user tries to withdraw more than they have? The transaction would fail with an 'insufficient balance' error during the balance check. The user would need to adjust the withdrawal amount to match their available balance.",
      'What if multiple withdrawal requests are submitted simultaneously? Each request gets a unique identifier and is processed independently. The system can handle multiple concurrent requests, though there might be prioritization based on factors like request size or submission time during periods of high demand.',
    ],
  },
  6: {
    explanation:
      "The bridge contract processes the withdrawal request by sending AR tokens to the user's wallet. This step involves the actual transfer of native AR tokens from the bridge's reserves to fulfill the user's withdrawal request. This is the point where the user receives back their original tokens (or an equivalent amount) that were previously locked in the bridge.",
    technicalDetails:
      "Authorized processors call the processWithdrawal function with the specific requestId. The function retrieves the withdrawal request from storage, checks that it hasn't been processed already, and transfers the requested amount of AR tokens to the user's address. After the transfer, it marks the request as processed and emits a WithdrawalProcessed event. This step requires sufficient AR balance in the bridge contract. The processing may include additional security checks such as multi-signature requirements for large withdrawals or rate limiting to prevent draining attacks. The transaction includes gas costs that are typically covered by the bridge operators rather than the user.",
    simplifiedExplanation:
      "The system takes AR tokens from its vault and sends them to your wallet. It's like the currency exchange taking dollars from their cash drawer and handing them over to you. The system marks your request as 'processed' so it knows you've been paid and won't accidentally pay you twice.",
    whatIfScenarios: [
      "What if the bridge contract doesn't have enough AR tokens? This shouldn't happen in a properly managed system, but if it did, the transfer would fail. The system would flag the issue for administrators, who would need to replenish the bridge's AR balance. The withdrawal request would remain in a pending state until it could be processed.",
      "What if the user's receiving address is a contract that rejects the tokens? The transaction would fail, and the withdrawal would remain in a pending state. Administrators would need to work with the user to provide an alternative receiving address.",
    ],
  },
  7: {
    explanation:
      'After the required number of confirmations, authorized validators confirm that the withdrawal transaction was successful. This adds an additional layer of security and verification to ensure the AR tokens were correctly sent to the user. This step protects against potential issues with the blockchain network and provides assurance that the withdrawal was completed correctly.',
    technicalDetails:
      "Validators call the confirmWithdrawal function with the requestId after verifying that the AR token transfer transaction has received enough confirmations. The function checks that the withdrawal has been processed and marks it as confirmed in a separate mapping. It emits a WithdrawalConfirmed event. This step is particularly important for high-value withdrawals where additional security is necessary. The validation process may involve cross-checking transaction receipts, verifying event logs, and ensuring the transaction wasn't affected by chain reorganizations. In some implementations, this step might require multiple independent validators to agree before the withdrawal is considered fully confirmed.",
    simplifiedExplanation:
      'Security validators check that you definitely received your AR tokens. This is like having a supervisor at the currency exchange verify that the correct amount was given to you. This extra check helps prevent mistakes and ensures everything was done correctly, giving you and the system confidence that the transaction is complete.',
    whatIfScenarios: [
      "What if the validators disagree about the transaction status? The system typically requires a consensus among validators. If there's disagreement, additional validators might be brought in, or the case might be escalated to administrators for manual review.",
      'What if the blockchain experiences a deep reorganization after confirmation? Most systems set the confirmation threshold high enough that deep reorganizations are extremely unlikely. If it did happen, the system would detect the inconsistency during reconciliation processes and administrators would need to resolve the issue manually.',
    ],
  },
  8: {
    explanation:
      'The withdrawal is queued for execution after the timelock period. This introduces a deliberate delay before the final completion of the withdrawal, providing a security window during which any suspicious activity can be detected and potentially stopped. This timelock mechanism is a common security practice in DeFi protocols to protect against exploits and attacks.',
    technicalDetails:
      'The queueTransaction function is called with the withdrawal details, including the target address, value, function signature, and parameters. It calculates a future timestamp (eta) based on the current time plus the delay period (typically 1-2 days). The transaction details and eta are hashed together to create a unique transaction hash, which is stored in the queuedTransactions mapping. The function emits a QueueTransaction event with all relevant details. During the timelock period, the transaction can be canceled by authorized parties if suspicious activity is detected. This mechanism provides a crucial security layer for the protocol.',
    simplifiedExplanation:
      "Your withdrawal is now in a waiting period before final completion. It's like when a bank tells you that your large withdrawal request will be available in a few days. This waiting period is a security measure that gives the system time to detect and prevent any fraudulent activity before the transaction is finalized.",
    whatIfScenarios: [
      'What if an emergency requires canceling the queued transaction? Authorized administrators can call a cancelTransaction function with the transaction hash to remove it from the queue. This might happen if suspicious activity is detected or if a security vulnerability is found in the system.',
      "What if the timelock period needs to be extended? The protocol governance can adjust the timelock period for future transactions, but typically can't modify already queued transactions. In emergency situations, the transaction might need to be canceled and resubmitted with a longer timelock.",
    ],
  },
  9: {
    explanation:
      "The system distributes staking rewards to QAR token holders. This process calculates and distributes rewards based on each holder's share of the total QAR supply. These rewards are typically derived from protocol fees, staking yields from the locked AR tokens, or other revenue streams within the ecosystem.",
    technicalDetails:
      "The distributeRewards function is called on a scheduled basis (e.g., weekly or monthly). It first calculates the total rewards available for distribution, which may come from multiple sources such as protocol fees, staking yields, or treasury allocations. Then it iterates through all QAR token holders and calculates each holder's share based on their balance relative to the total supply. The rewards are either directly transferred to holders' wallets or credited to a claimable balance that holders can withdraw later. The function emits a RewardsDistributed event with details about the total amount distributed and the distribution period. For gas efficiency, the distribution might be implemented using a merkle tree approach or a checkpoint system rather than iterating through all holders in a single transaction.",
    simplifiedExplanation:
      "The system is now paying out rewards to everyone who holds QAR tokens. It's like a bank distributing interest payments to all account holders. The more QAR tokens you have, the larger your share of the rewards. These rewards are your benefit for participating in the system and can be claimed or are automatically added to your balance.",
    whatIfScenarios: [
      "What if a user's rewards are very small? For users with tiny balances, the rewards might be below a minimum threshold and held until they accumulate to a level where distribution is economically viable. This prevents situations where gas costs exceed the reward value.",
      'What if the reward distribution transaction fails? The system includes retry mechanisms and fallback options. If distribution fails, it would be reattempted in the next cycle, potentially with optimizations to reduce gas costs or by breaking the distribution into smaller batches.',
    ],
  },
  10: {
    explanation:
      'The proposal is rejected due to insufficient votes or failure to meet the required approval threshold. This governance mechanism ensures that only proposals with sufficient community support are implemented. In the context of the QAR token system, this might represent a rejected parameter change or feature addition.',
    technicalDetails:
      'The _processVoteResults function is called after the voting period ends. It retrieves the proposal details including the number of votes for and against, as well as the total token supply at the time the proposal was created. It calculates whether the proposal received enough "for" votes to meet the quorum requirement (typically a percentage of the total supply, e.g., 4%). If the "for" votes are less than the "against" votes or below the quorum threshold, the proposal state is updated to Rejected and a ProposalRejected event is emitted. This result is recorded permanently in the governance history and cannot be changed without a new proposal.',
    simplifiedExplanation:
      "The community has voted against this proposal, so it won't be implemented. It's like a town voting against building a new park - if not enough people vote in favor, or if more people vote against it than for it, the proposal is rejected and nothing changes. The voting results are recorded for transparency, and someone could create a new, improved proposal in the future.",
    whatIfScenarios: [
      "What if the vote was very close? The system follows strict rules based on the governance parameters. Even if a proposal fails by just one vote, it's still rejected. In such cases, proposers often create a modified proposal addressing concerns and try again.",
      'What if there was a technical issue during voting? If evidence of a technical issue that affected voting is found, governance participants might create and vote on a special proposal to reconsider the original proposal. However, this would be an exceptional case requiring strong evidence and community consensus.',
    ],
  },
  11: {
    explanation:
      'The proposal is canceled before completion, either by the proposer or by an administrator with cancellation authority. This allows for the removal of proposals that are found to have issues, are no longer relevant, or need to be replaced with improved versions. Cancellation provides flexibility in the governance process.',
    technicalDetails:
      'The cancelProposal function is called with the proposal ID. It verifies that the caller is either the original proposer or an authorized admin, and that the proposal is still in an active state (not already executed, canceled, or expired). If these conditions are met, the proposal state is updated to Canceled and a ProposalCanceled event is emitted. Cancellation is final and cannot be reversed - a new proposal would need to be created if the action is still desired. The cancellation mechanism includes access controls to prevent unauthorized cancellations while still allowing legitimate ones.',
    simplifiedExplanation:
      "The proposal has been withdrawn before the process was completed. It's like when someone submits a motion at a meeting but then decides to withdraw it before the vote. This might happen if the person who made the proposal found a problem with it, if circumstances changed, or if they want to submit an improved version instead.",
    whatIfScenarios: [
      "What if a malicious admin tries to cancel legitimate proposals? The system logs all cancellations with the canceler's address, creating accountability. In well-designed systems, cancellation power is typically distributed among multiple parties or requires multiple signatures to prevent abuse.",
      "What if a proposal needs to be canceled after voting has started? Most systems allow cancellation at any point before execution, though some might restrict cancellation after certain stages. If cancellation is no longer possible but the proposal shouldn't proceed, governance participants might need to vote against it instead.",
    ],
  },
  12: {
    explanation:
      'The proposal execution failed due to an error in the transaction. This could happen for various reasons such as invalid parameters, contract state changes since the proposal was created, or bugs in the execution code. Execution failures provide important feedback for improving future proposals.',
    technicalDetails:
      'The executeTransaction function is called after the timelock period with the target address, value, function signature, and parameters. It attempts to execute the transaction by making a low-level call to the target contract with the specified parameters. If the call reverts for any reason, the function catches the error using a try/catch block, emits an ExecutionFailed event with the error reason, and then reverts itself. The event includes the transaction hash and error details to help with debugging. Failed executions remain in the system history for transparency and can provide valuable lessons for future governance actions.',
    simplifiedExplanation:
      "The system tried to implement the approved proposal, but something went wrong during the process. It's like if a town voted to build a bridge, but when construction started, they discovered the ground couldn't support it. The system records exactly what went wrong so that developers can fix the issue or create a new proposal that avoids the problem.",
    whatIfScenarios: [
      "What if the execution is critical for the protocol's operation? Emergency procedures might be triggered, allowing governance participants or designated emergency multisig holders to implement alternative solutions while a proper fix is developed.",
      'What if the execution fails repeatedly? After multiple failures, the governance process might involve creating a new proposal with modified parameters or implementation details that address the root cause of the failures. In extreme cases, this might require protocol upgrades or redesigns.',
    ],
  },
};

/**
 * Generates a prompt for the QAR token flow visualization based on the step number and optional default description.
 * @param stepNumber
 * @param defaultDescription
 * @return A string prompt for the AI to generate explanations for the specified step in the QAR token flow.
 */
export const generateQarTokenPrompt = (stepNumber: number, defaultDescription?: string): string => {
  // For step 0, use the base prompt with defaultDescription
  if (stepNumber === 0 && defaultDescription) {
    return generateBasePrompt('QAR token', stepNumber, 'Introduction', defaultDescription);
  }

  if (stepNumber > 0 && stepNumber <= qarTokenSteps.length) {
    const step = qarTokenSteps[stepNumber - 1];
    const highlight = stepHighlightMap[stepNumber];

    // Get active nodes and edges for this step
    const activeNodes =
      highlight?.nodes?.map((nodeId: string) => flowNodes.find(node => node.id === nodeId)).filter(Boolean) || [];

    const activeEdges =
      highlight?.edges?.map((edgeId: string) => flowEdges.find(edge => edge.id === edgeId)).filter(Boolean) || [];

    // Create a context-rich prompt
    return `
You are an expert blockchain educator explaining a QAR token flow visualization. 
Please provide a detailed explanation for step ${stepNumber} of the QAR token flow: "${step.title}".

Step information:
- Description: ${step.description}
- What happens: ${step.what}
- Why it matters: ${step.why}
- Code example: ${step.codeSnippet || 'Not available'}

Active components in this step:
- Nodes: ${activeNodes.map((node: any) => `${node?.data?.label || 'Unnamed'} (${node?.data?.tooltip || 'No tooltip'})`).join(', ') || 'None specified'}
- Edges: ${activeEdges.map((edge: any) => `${edge?.data?.label || 'Unnamed'} connection`).join(', ') || 'None specified'}

Please provide three different explanations:
1. A standard explanation that balances technical accuracy with accessibility
2. A technical explanation with implementation details for developers
3. A simplified explanation for beginners with no blockchain experience

Additionally, provide 2-3 "What-if scenarios" related to this step. For example:
- "What happens if a transaction fails during this process?"
- "What if the token bridge is congested?"
- "What if the user tries to withdraw more than they deposited?"

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
  return generateBasePrompt('QAR token', stepNumber, qarTokenSteps[stepNumber - 1]?.title || 'Unknown step');
};

/**
 * Fetches the AI-generated explanation for a specific step in the QAR token flow.
 * @param stepNumber
 * @param useHardcoded
 * @param defaultDescription
 * @return A promise that resolves to an AIExplanationResponse containing the explanation, technical details, simplified explanation, and what-if scenarios for the specified step.
 */
export const getQarTokenAIExplanation = async (
  stepNumber: number,
  useHardcoded: boolean = false,
  defaultDescription?: string
): Promise<AIExplanationResponse> => {
  // Check if we have a hardcoded explanation for this step
  const hardcodedExplanation = qarTokenHardcodedExplanations[stepNumber];

  // If useHardcoded is true, current provider has no valid API key, or hardcoded explanations are forced, return the hardcoded explanation
  if (useHardcoded || !currentProviderHasValidApiKey() || env.VITE_USE_HARDCODED_EXPLANATIONS === 'true') {
    if (env.NODE_ENV === 'development') {
      logInfo('Using hardcoded explanation for QAR token step', stepNumber);
    }
    return (
      hardcodedExplanation || {
        explanation: `AI explanation for QAR token step ${stepNumber} is not available yet.`,
        simplifiedExplanation: "This step's explanation is coming soon.",
      }
    );
  }

  try {
    const prompt = generateQarTokenPrompt(stepNumber, defaultDescription);
    const aiResponse = await callOpenAI(prompt);

    return aiResponse;
  } catch (error) {
    // Only log detailed error in development
    if (env.NODE_ENV === 'development') {
      logError('Error getting AI explanation for QAR token flow:', error);
    }

    // Fallback to hardcoded explanations if available
    if (hardcodedExplanation) {
      if (env.NODE_ENV === 'development') {
        logInfo('Falling back to hardcoded explanation for QAR token flow');
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
