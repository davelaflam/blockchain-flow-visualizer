import { flowNodes, flowEdges } from '../../components/blockchainFlows/lending/flowLayout';
import { stepHighlightMap } from '../../components/blockchainFlows/lending/stepMap';
import { lendingSteps } from '../../components/blockchainFlows/lending/steps';
import env from '../../utils/env';
import { logInfo, logError } from '../logger';

import { AIExplanationResponse, callOpenAI, generateBasePrompt } from './baseAiService';
import { currentProviderHasValidApiKey } from './providers/AIProviderFactory';

export const lendingHardcodedExplanations: Record<number, AIExplanationResponse> = {
  1: {
    explanation:
      'The user connects their wallet to the lending platform, establishing a secure connection that allows the platform to interact with their blockchain account.',
    technicalDetails:
      "The application uses Web3 provider libraries like ethers.js or web3.js to request account access via the wallet's API (e.g., window.ethereum). Upon approval, the wallet returns the user's public address and signs a message to verify ownership. The connection is maintained through the session with event listeners for account or network changes.",
    simplifiedExplanation:
      "You're connecting your digital wallet (like MetaMask) to the lending website. This is like logging into a website, but instead of a username and password, you're using your blockchain wallet to prove who you are.",
    whatIfScenarios: [
      'What if the user rejects the wallet connection request? If the user rejects the connection request, the application cannot proceed with any blockchain interactions. The user will need to manually initiate the connection process again to use the lending platform.',
      'What if the user switches accounts in their wallet? The application listens for account change events and will update the UI to reflect the new account. Any pending transactions or approvals will need to be restarted with the new account.',
      'What if the user is on the wrong network? The application will detect this and prompt the user to switch to the correct network. Most modern wallets support programmatic network switching requests.',
    ],
  },
  2: {
    explanation:
      "The user approves the lending contract to spend their tokens. This permission is necessary before the lending pool can transfer tokens from the user's wallet as collateral.",
    technicalDetails:
      "The user signs an ERC-20 approve() transaction, setting an allowance for the lending pool contract address. This transaction modifies the token contract's state, recording that the lending pool is authorized to transfer up to the approved amount from the user's address using transferFrom().",
    simplifiedExplanation:
      "You're giving permission for the lending app to move your tokens. It's like giving someone limited access to your bank account to make specific transactions on your behalf, but they can only move the amount you've approved.",
    whatIfScenarios: [
      "What if you approve more tokens than you currently have? The approval will still go through, but the contract can only transfer up to your current balance. It's generally safer to only approve what you plan to use.",
      'What if you want to revoke the approval later? You can set the allowance back to zero, which prevents the contract from accessing any more of your tokens, but any already-deposited collateral remains in the protocol.',
      "What if the approval transaction fails due to network congestion? The transaction will revert, and you'll need to try again, possibly with a higher gas price to ensure it gets processed during busy network times.",
    ],
  },
  3: {
    explanation:
      'The user deposits collateral into the lending pool. These assets will secure any loans the user takes and determine their borrowing capacity.',
    technicalDetails:
      "The deposit function transfers tokens from the user to the lending pool using the ERC-20 transferFrom() method. The contract records the deposit in its storage, updating the user's collateral balance and the total collateral in the pool. It also mints interest-bearing tokens representing the user's share of the pool.",
    simplifiedExplanation:
      "You're putting some of your crypto assets into the lending pool as security. This is like putting up collateral for a loan - the lending system holds onto these assets to make sure you'll pay back what you borrow later.",
    whatIfScenarios: [
      'What if the transaction is pending for a long time? The deposit will only be processed once the transaction is confirmed on the blockchain. If gas prices spike, you might need to wait or resubmit with higher fees.',
      "What if the token has transfer fees? Some tokens take a fee on transfers, which means you might receive slightly less in the lending pool than you sent. Always check the token's behavior before depositing.",
      "What if the lending protocol gets hacked? While rare, this is a risk with any DeFi protocol. Most protocols have undergone security audits, and some offer insurance, but it's important to only deposit what you can afford to lose.",
    ],
  },
  4: {
    explanation:
      'The collateral is locked in the lending pool, and its value is calculated using price data from oracles. This determines how much the user can borrow.',
    technicalDetails:
      "The protocol uses price oracles to get the current market value of the deposited assets. It applies a collateral factor (typically 50-80%) to determine the maximum loan-to-value ratio. The smart contract stores this information and updates the user's borrowing capacity, which is visible in the user interface.",
    simplifiedExplanation:
      "Your deposited assets are now locked in the system, and the app is checking how much they're worth. The system uses this value to calculate how much you can borrow - usually around 50-80% of your collateral's value.",
    whatIfScenarios: [
      'What happens if ETH price drops 20% here? If the ETH price drops 20% after your collateral is locked, your borrowing capacity will decrease proportionally. For example, if you deposited 1 ETH worth $2000, and the price drops to $1600, your maximum borrowing capacity would decrease from $1000 to $800 (assuming a 50% collateral factor).',
      'What if the oracle provides incorrect price data? Oracle failures can be catastrophic for lending protocols. Most protocols use multiple oracles with time-weighted average prices to mitigate this risk. If an oracle reports a significantly different price than others, the protocol may ignore that data point or trigger circuit breakers to pause borrowing until the issue is resolved.',
      'What if I want to add more collateral later? You can add more collateral at any time to increase your borrowing capacity or improve your health factor. This is a common strategy when market volatility increases the risk of liquidation.',
    ],
  },
  5: {
    explanation:
      'Based on their collateral value, the user borrows assets from the lending pool. The protocol calculates the interest rate based on the current utilization of the pool.',
    technicalDetails:
      "The borrow function verifies that the requested amount doesn't exceed the user's borrowing capacity. It calculates the interest rate using the utilization rate formula (borrowed assets / total assets). The contract transfers the borrowed tokens to the user's wallet and records the debt position with the current interest rate in its storage.",
    simplifiedExplanation:
      "Now you're actually borrowing some crypto assets based on the value of your collateral. The system calculates how much interest you'll pay based on how many other people are borrowing from the same pool - when more people are borrowing, interest rates go up.",
    whatIfScenarios: [
      'What if the interest rate changes after you borrow? Most DeFi lending protocols use variable interest rates. The rate can change based on market conditions, but your existing debt will accrue interest at the new rates.',
      'What if you try to borrow more than your collateral allows? The transaction will revert, as the smart contract enforces borrowing limits to maintain protocol solvency.',
      'What if the asset you want to borrow is in short supply? The interest rate will increase, making it more expensive to borrow. In extreme cases, there might not be enough liquidity to fulfill your request until other users repay their loans.',
    ],
  },
  6: {
    explanation:
      'The protocol continuously monitors the health factor of the loan, which is the ratio of collateral value to borrowed value. This ensures the loan remains overcollateralized.',
    technicalDetails:
      "The health factor is calculated as (collateral value * liquidation threshold) / borrowed value. The contract doesn't actively monitor this - instead, it provides functions for anyone to check a user's health factor. The frontend periodically calls these functions to update the UI, and liquidation bots monitor accounts close to the liquidation threshold.",
    simplifiedExplanation:
      "The system is constantly checking if your loan is still safe. It compares the value of your collateral to what you've borrowed. As long as your collateral is worth significantly more than your loan, everything is fine.",
    whatIfScenarios: [
      'What if you have multiple types of collateral? The health factor considers your entire portfolio. Some assets might have different risk profiles and thus different liquidation thresholds set by the protocol.',
      'What if the protocol updates the liquidation threshold? This can happen through governance decisions. If thresholds increase, your health factor could drop, putting you at higher risk of liquidation.',
      "What if there's a temporary price oracle failure? Most protocols have circuit breakers that can pause certain operations if price feeds are deemed unreliable, preventing unfair liquidations.",
    ],
  },
  7: {
    explanation:
      'If the health factor drops below the threshold due to price fluctuations or interest accrual, the loan is at risk of liquidation. The protocol alerts users when their position is in danger.',
    technicalDetails:
      'When the health factor approaches the liquidation threshold (typically 1.0), the position becomes eligible for liquidation. The contract emits events that the frontend can detect to display warnings. Liquidation bots also monitor these conditions and prepare to execute liquidations if the health factor drops below the threshold.',
    simplifiedExplanation:
      'If the value of your collateral drops too much compared to your loan (maybe because crypto prices fell), your loan is at risk. The system will warn you that you need to either add more collateral or repay some of your loan to avoid liquidation.',
    whatIfScenarios: [
      'What happens if ETH price drops 30% suddenly? A sudden 30% drop in ETH price could trigger immediate liquidation if your health factor falls below 1.0. Liquidators would repay a portion of your debt and receive your collateral at a discount (typically 5-10% below market value). You would lose part of your collateral and still have remaining debt.',
      "What if I can't add more collateral or repay in time? If you can't take action before your health factor drops below the liquidation threshold, your position will be liquidated. This is why it's recommended to maintain a higher health factor (>1.5) as a safety buffer, especially during volatile market conditions.",
      'What if everyone gets liquidated at once during a market crash? Mass liquidations can cause cascading effects in the market, as large amounts of collateral are sold simultaneously. This can further drive down prices, triggering more liquidations. Some protocols implement liquidation freezes or circuit breakers during extreme market conditions to prevent this.',
    ],
  },
  8: {
    explanation:
      'The user repays their loan with interest. This reduces their debt and improves their health factor, reducing the risk of liquidation.',
    technicalDetails:
      "The repay function accepts tokens from the user and updates their debt position. It calculates the accrued interest since the last update using the compound interest formula and the elapsed time. The contract reduces the user's debt balance and updates the total borrowed amount in the pool.",
    simplifiedExplanation:
      "You're paying back your loan plus the interest that has built up. This makes your position safer because you owe less compared to the collateral you've put up.",
    whatIfScenarios: [
      "What if you only make a partial repayment? The loan balance will decrease, improving your health factor, but you'll still have an active loan. You'll continue to accrue interest on the remaining balance.",
      "What if the repayment transaction fails due to insufficient funds? The transaction will revert, and no changes will be made. You'll need to ensure you have enough tokens (including the transaction fee) to cover the repayment.",
      'What if the interest rate changes between when you initiate and confirm the transaction? Most protocols use the current rate at the time of the transaction, so the actual amount repaid might differ slightly from your initial estimate.',
    ],
  },
  9: {
    explanation:
      "After full repayment, the loan is closed. The lending pool updates the user's loan status, and they are now eligible to withdraw their collateral.",
    technicalDetails:
      "When the debt is fully repaid, the contract updates the user's debt balance to zero and emits a LoanRepaid event. It also updates internal accounting of the total borrowed assets and utilization rate, which affects interest rates for other users. The user's borrowing position is marked as closed in the contract's storage.",
    simplifiedExplanation:
      "Your loan is now completely paid off. The system records that you don't owe anything anymore, and you're free to take back your collateral if you want to.",
  },
  10: {
    explanation:
      'After repaying the loan in full, the user can withdraw their collateral from the lending pool. This action returns their original assets plus any earned interest.',
    technicalDetails:
      "The withdraw function verifies that the user has no outstanding debt or that their remaining collateral will maintain a safe health factor. It burns the interest-bearing tokens representing the user's share of the pool and transfers the original tokens plus any earned interest back to the user's wallet.",
    simplifiedExplanation:
      "Now that your loan is paid off, you're taking back your collateral that was locked in the system. The assets are transferred back to your wallet, and your interaction with the lending protocol is complete.",
    whatIfScenarios: [
      'What if the withdrawal fails due to insufficient liquidity? This is rare but could happen if the protocol experiences a liquidity crunch. You might need to wait for other users to deposit or repay their loans to withdraw your full amount.',
      'What if you try to withdraw more than you deposited? The smart contract will only allow you to withdraw up to your deposited amount plus any earned interest, minus any outstanding fees or penalties.',
      'What if the token has transfer restrictions? Some tokens have built-in transfer limits or blacklists. The withdrawal would fail if the token contract prevents the transfer, even if the lending protocol allows it.',
    ],
  },
  11: {
    explanation:
      'The lending/borrowing cycle is completed. All transactions are finalized, and the user has their assets back in their wallet.',
    technicalDetails:
      "The protocol has updated all relevant state variables: the user's collateral and debt balances are zero, their health factor is at maximum, and all tokens have been returned to their wallet. The contract has emitted events for all actions, which are recorded on the blockchain for transparency and auditability.",
    simplifiedExplanation:
      "Everything is done! Your loan has been fully repaid, your collateral has been returned to your wallet, and all the transactions have been recorded on the blockchain. You've successfully completed the entire lending and borrowing process.",
    whatIfScenarios: [
      'What if you want to verify the transaction history? You can look up all transactions on a blockchain explorer using your wallet address. This shows the complete history of deposits, borrows, and withdrawals.',
      "What if you want to do this again? The process is repeatable, and your previous interactions don't affect future ones. You can start a new lending/borrowing cycle at any time.",
      'What if you forgot to claim any rewards? Some protocols offer additional rewards in their native tokens. Make sure to check if there are any unclaimed rewards that you might be eligible for.',
    ],
  },
};

// Function to generate a prompt for the LLM based on the Lending flow and step number
export const generateLendingPrompt = (stepNumber: number, defaultDescription?: string): string => {
  // For step 0, use the base prompt with defaultDescription
  if (stepNumber === 0 && defaultDescription) {
    return generateBasePrompt('DeFi lending protocol', stepNumber, 'Introduction', defaultDescription);
  }

  if (stepNumber > 0 && stepNumber <= lendingSteps.length) {
    const step = lendingSteps[stepNumber - 1];
    const highlight = stepHighlightMap[stepNumber];

    // Get active nodes and edges for this step
    const activeNodes =
      highlight?.nodes?.map((nodeId: string) => flowNodes.find(node => node.id === nodeId)).filter(Boolean) || [];

    const activeEdges =
      highlight?.edges?.map((edgeId: string) => flowEdges.find(edge => edge.id === edgeId)).filter(Boolean) || [];

    // Create a context-rich prompt
    return `
You are an expert blockchain educator explaining a DeFi lending protocol flow visualization. 
Please provide a detailed explanation for step ${stepNumber} of the lending flow: "${step.title}".

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
- "What happens if ETH price drops 20% here?"
- "What if the user tries to withdraw collateral before repaying the loan?"
- "What if the network is congested during this transaction?"

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
  return generateBasePrompt('DeFi lending protocol', stepNumber, lendingSteps[stepNumber - 1]?.title || 'Unknown step');
};

// Function to get AI explanations for the Lending flow
export const getLendingAIExplanation = async (
  stepNumber: number,
  useHardcoded: boolean = false,
  defaultDescription?: string
): Promise<AIExplanationResponse> => {
  // Check if we have a hardcoded explanation for this step
  const hardcodedExplanation = lendingHardcodedExplanations[stepNumber];

  // If useHardcoded is true, current provider has no valid API key, or hardcoded explanations are forced, return the hardcoded explanation
  if (useHardcoded || !currentProviderHasValidApiKey() || env.VITE_USE_HARDCODED_EXPLANATIONS === 'true') {
    if (env.NODE_ENV === 'development') {
      logInfo('Using hardcoded explanation for lending flow step', stepNumber);
    }
    return (
      hardcodedExplanation || {
        explanation: `AI explanation for lending flow step ${stepNumber} is not available yet.`,
        simplifiedExplanation: "This step's explanation is coming soon.",
      }
    );
  }

  try {
    // Generate a prompt for the LLM
    const prompt = generateLendingPrompt(stepNumber, defaultDescription);

    // Call the OpenAI API
    const aiResponse = await callOpenAI(prompt);

    // If the API response doesn't include whatIfScenarios but we have hardcoded ones, use those
    if (!aiResponse.whatIfScenarios && hardcodedExplanation?.whatIfScenarios) {
      aiResponse.whatIfScenarios = hardcodedExplanation.whatIfScenarios;
      if (env.NODE_ENV === 'development') {
        logInfo('Using hardcoded whatIfScenarios for lending flow step', stepNumber);
      }
    }

    return aiResponse;
  } catch (error) {
    // Only log detailed error in development
    if (env.NODE_ENV === 'development') {
      logError('Error getting AI explanation for lending flow:', error);
    }

    // Fallback to hardcoded explanations if available
    if (hardcodedExplanation) {
      if (env.NODE_ENV === 'development') {
        logInfo('Falling back to hardcoded explanation for lending flow');
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
