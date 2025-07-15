import { flowNodes, flowEdges } from '../../components/blockchainFlows/dex/flowLayout';
import { stepHighlightMap } from '../../components/blockchainFlows/dex/stepMap';
import { dexSteps } from '../../components/blockchainFlows/dex/steps';
import env from '../../utils/env';
import { logError, logInfo } from '../logger';

import { AIExplanationResponse, callOpenAI, generateBasePrompt } from './baseAiService';
import { currentProviderHasValidApiKey } from './providers/AIProviderFactory';

/**
 * This file contains the AI explanation service for the decentralized exchange (DEX) flow.
 * It provides hardcoded explanations for each step in the DEX process and generates prompts
 * for the LLM to get AI-generated explanations.
 */
export const dexHardcodedExplanations: Record<number, AIExplanationResponse> = {
  1: {
    explanation:
      'The user initiates a token swap on the decentralized exchange by selecting the tokens they want to trade and specifying the amount. This action starts the DEX trading process. The user connects their wallet to the DEX interface, which establishes a secure communication channel for transaction signing and account information retrieval.',
    technicalDetails:
      "The user interface calls the connectWallet function which uses the Ethereum Provider API (window.ethereum) to request account access via the eth_requestAccounts method. This triggers the wallet's connection popup, asking for user permission. Once granted, the wallet returns an array of the user's public addresses, with the first one typically selected as the active account. The function also verifies that the user is connected to a supported blockchain network by checking the chainId. This connection enables the DEX to read the user's token balances and later request transaction signatures for approvals and swaps.",
    simplifiedExplanation:
      "You're starting the process of exchanging one type of token for another on a decentralized exchange. First, you need to connect your digital wallet (like MetaMask) to the exchange website. It's like walking into a currency exchange booth, showing your ID, and opening your physical wallet so the teller can see what currencies you have available to trade. This connection lets the exchange see your token balances and later ask for your permission to make trades.",
    whatIfScenarios: [
      "What if the user doesn't have a wallet installed? The DEX interface would detect this and typically show instructions for installing a compatible wallet like MetaMask, along with educational resources about wallet security and management.",
      'What if the user is connected to an unsupported blockchain network? The interface would detect this and prompt the user to switch networks, often providing a button that triggers the wallet to request a network change to a supported chain.',
      "What if the user rejects the connection request? The connection process would be aborted, and the interface would remain in a disconnected state. The user would need to manually initiate the connection process again when they're ready to proceed.",
    ],
  },
  2: {
    explanation:
      'The user approves the DEX router contract to spend their tokens. This is a security feature of ERC-20 tokens that prevents contracts from accessing tokens without explicit permission. The user signs a transaction that grants the DEX router contract permission to transfer specific tokens from their wallet during the swap process.',
    technicalDetails:
      "The user's wallet calls the approve function on the ERC-20 token contract, setting an allowance for the DEX router contract. The function signature is approve(address spender, uint256 amount) and returns a boolean indicating success. This is a separate transaction that must be confirmed before the swap can proceed. The approval amount can be limited to the exact swap amount or set to a maximum value (often 2^256-1) to avoid future approval transactions. This transaction requires gas fees and is recorded on the blockchain. Modern interfaces may implement EIP-2612 permit functionality to allow gasless approvals via signatures.",
    simplifiedExplanation:
      "You're giving permission for the exchange to access the tokens you want to trade. It's like signing an authorization form that allows the bank to move money from your account for a specific transaction. Without this permission, the exchange couldn't take your tokens to complete the trade. You can choose to approve just enough tokens for this specific trade, or give a larger approval to avoid having to sign multiple permission forms for future trades.",
    whatIfScenarios: [
      "What if the user approves less tokens than they want to swap? The swap transaction would fail with an 'insufficient allowance' error. The user would need to approve additional tokens before trying to swap again.",
      'What if the user wants to revoke the approval after changing their mind? They can call the approve function again with a value of 0 to remove the allowance, preventing the DEX from accessing any of their tokens.',
      "What if the approval transaction fails due to network congestion? The user would need to retry with a higher gas price or wait for better network conditions. Until a successful approval transaction is confirmed, the DEX cannot access the user's tokens for swapping.",
    ],
  },
  3: {
    explanation:
      "The DEX router contract processes the user's transaction request. It validates all parameters, checks for errors, and prepares to execute the requested operation. This step involves determining the optimal execution path and ensuring the transaction meets all requirements before proceeding with the actual swap.",
    technicalDetails:
      "The processTransaction function in the router contract receives the transaction parameters including tokenIn, tokenOut, amountIn, amountOutMin, recipient address, and deadline. It performs several validation checks: 1) verifies that tokenIn and tokenOut are different addresses, 2) confirms amountIn is greater than zero, 3) validates that the recipient address is not the zero address, and 4) ensures the deadline hasn't passed. After validation, it transfers the input tokens from the sender to the router using TransferHelper.safeTransferFrom. The router then determines the execution path, which may be direct (tokenA → tokenB) or involve multiple hops through intermediate tokens for better pricing. The function emits a TransactionProcessed event with details of the sender, tokens, and amount.",
    simplifiedExplanation:
      "The exchange's smart contract is now checking your trade request to make sure everything is valid and preparing the best way to execute it. It's like when a travel agent validates your passport, confirms your destination exists, checks that you have enough money for the trip, and then plans the most efficient route to get you there. The system is making sure your trade request is properly formatted, that you're not trying to trade a token for itself, and that your request hasn't expired.",
    whatIfScenarios: [
      "What if the deadline has already passed? The transaction would revert with an 'Expired' error. Deadlines protect users from executing trades at unexpected prices due to market movements during periods of high network congestion.",
      "What if there's no direct trading pair between the input and output tokens? The router would attempt to find an indirect route through intermediate tokens (e.g., TokenA → WETH → TokenB) that provides the best output amount. If no viable path exists, the transaction would fail.",
      'What if the user tries to swap tokens with extreme price manipulation vulnerability? Many routers implement safety checks for tokens with known issues. Some may block trades involving these tokens, while others might require additional confirmation or apply stricter slippage controls.',
    ],
  },
  4: {
    explanation:
      "The DEX executes the token swap in the liquidity pool. This is the core function where tokens are actually exchanged between the user and the liquidity pool based on the current exchange rate determined by the pool's reserves. The automated market maker (AMM) formula ensures that trades can happen without traditional order books or counterparties.",
    technicalDetails:
      'The _swap function is called with the determined path, input amount, minimum output amount, and recipient address. For each pair in the path, it calculates the expected output using the constant product formula (x * y = k). The function first gets the pair address from the factory contract, verifies the pair exists, and calculates the expected output amounts. It then transfers the input tokens to the pair contract and calls the swap function on the pair with the appropriate parameters. The pair contract internally updates its reserves according to the constant product formula, ensuring that the product of the reserves remains constant (minus fees). The function includes slippage protection by comparing the calculated output amount against the user-specified minimum output (amountOutMin). It emits a Swap event with details of the sender, input/output amounts, and token path.',
    simplifiedExplanation:
      "This is where the actual exchange of tokens happens. The system takes your input tokens and gives you the output tokens according to the current exchange rate in the pool. It's like the cashier at a currency exchange taking your dollars and counting out the equivalent amount of euros based on today's exchange rate. The exchange rate is determined by a mathematical formula that automatically adjusts based on how many tokens of each type are in the pool - when more people buy a token, its price goes up, and when more people sell it, its price goes down.",
    whatIfScenarios: [
      'What if the price moves significantly between transaction submission and execution? The transaction includes a minimum output amount parameter (amountOutMin) that protects against slippage. If the output amount falls below this threshold due to price movements, the transaction will revert rather than executing at an unfavorable rate.',
      "What if the liquidity pool doesn't have enough tokens to fulfill the swap? This shouldn't happen with the constant product formula, as prices approach infinity as reserves approach zero. However, in practice, if the output amount becomes extremely small relative to gas costs, the swap might be economically unviable.",
      "What if there's a flash loan attack happening during the swap? Many DEXs implement various protections against manipulation, such as using time-weighted average prices (TWAP) for certain operations and monitoring for suspicious activity. However, users should still be cautious during periods of high volatility.",
    ],
  },
  5: {
    explanation:
      'Trading fees are collected from the swap and distributed to liquidity providers. This is a percentage of the traded amount (typically 0.3%) that is retained in the liquidity pool as a fee. This fee mechanism is essential for incentivizing liquidity providers to deposit their tokens in the pool, ensuring there is always sufficient liquidity for trading.',
    technicalDetails:
      "The _collectFees function calculates the fee amount based on the configured fee rate (typically 0.3% or 30 basis points). This is implemented by deducting the fee from the input amount before calculating the output amount. For example, if a user swaps 100 tokens with a 0.3% fee, 0.3 tokens are retained as fees and 99.7 tokens are used for the actual swap. These fees accumulate in the liquidity pool, increasing the value of LP tokens proportionally. When liquidity providers withdraw their liquidity, they receive their share of these accumulated fees. Some protocols split the fee into multiple parts, allocating portions to liquidity providers, protocol treasury, or token staking rewards. The fee collection is handled automatically as part of the swap execution and is recorded in the contract's state.",
    simplifiedExplanation:
      "The exchange takes a small fee from your trade, similar to how a currency exchange charges a commission. This fee (usually about 0.3% of your trade) goes to the people who have provided tokens to the exchange's liquidity pools. It's like paying a small commission to the bank for facilitating your currency exchange. These fees incentivize people to provide liquidity to the exchange, ensuring there are always enough tokens available for trading.",
    whatIfScenarios: [
      "What if the fee is too high for a particular trade? Most DEXs have fixed fee tiers (e.g., 0.3%, 0.1%, 1%) depending on the pool type. Users can choose pools with lower fees for stable pairs or high-volume trading. Some DEXs also offer fee discounts for users who stake the platform's governance token.",
      'What if a liquidity pool has very low trading volume? The fees collected would be minimal, potentially making it unprofitable for liquidity providers after considering impermanent loss risks. This often leads to a natural consolidation where liquidity migrates to more active pools or platforms.',
      'What if the protocol wants to change the fee structure? This typically requires a governance vote, as fee changes directly impact both traders and liquidity providers. Some modern DEXs implement dynamic fees that adjust based on market volatility or pool utilization.',
    ],
  },
  6: {
    explanation:
      'Validators validate the liquidity addition transaction to ensure it meets all requirements and is legitimate. This validation step verifies the transaction parameters, signatures, and ensures the integrity of the liquidity pool. This security layer protects the DEX and its users from malicious transactions that could potentially manipulate prices or drain funds.',
    technicalDetails:
      "The validateLiquidityAddition function performs several critical checks: 1) It verifies the transaction signature using ecrecover to ensure it came from an authorized user; 2) It validates that both token addresses are valid and different from each other; 3) It checks that the token amounts are reasonable and above minimum thresholds; 4) It may verify price impact to prevent extreme slippage; 5) It ensures the deadline hasn't passed. For permissionless pools, validation may be performed by the contract itself, while some DEXs with permissioned pools may require off-chain validator approval. The function returns a boolean indicating whether the validation passed, and may emit a ValidationResult event with details. Failed validations revert the transaction with a specific error message to help users understand the issue.",
    simplifiedExplanation:
      "Before allowing you to add liquidity to the pool, the system checks that everything about your transaction is correct and legitimate. It's like a bank verifying your identity and the authenticity of your funds before allowing you to open a joint account. This step ensures that you're providing valid tokens in reasonable amounts and that you're authorized to make this transaction. These checks protect both you and other users from potential scams or errors.",
    whatIfScenarios: [
      "What if the token pair doesn't exist yet? Most DEXs allow creating new pairs through the liquidity addition process. The validation would check if the tokens are valid ERC-20 tokens and if they meet any protocol requirements (e.g., not blacklisted, have sufficient decimals, etc.).",
      'What if the price ratio is significantly different from market price? The validation might include a check against external price oracles to prevent manipulation. If the provided ratio deviates too much, the transaction might be rejected or flagged for additional verification.',
      "What if one of the tokens has a transfer fee or rebase mechanism? Some DEXs explicitly reject tokens with these features as they can break the pool's accounting. Others might have special handling for such tokens, requiring additional validation steps to ensure the actual amounts received match the expected amounts.",
    ],
  },
  7: {
    explanation:
      "Liquidity is added to the pool by depositing token pairs. This is the core action where the user's tokens are transferred to the liquidity pool in exchange for LP tokens. This process increases the pool's capacity to facilitate trades and allows the liquidity provider to earn a share of trading fees. The addition of liquidity is a fundamental mechanism that ensures DEXs have sufficient tokens available for users to trade.",
    technicalDetails:
      "The addLiquidity function first calculates the optimal amounts of both tokens based on the current pool ratio. For new pools, any ratio is accepted, but for existing pools, tokens must be provided in the current pool ratio to prevent price manipulation. The function then transfers both tokens from the user to the pair contract using TransferHelper.safeTransferFrom. If the pair doesn't exist, it's created using the factory.createPair method. The function then calls the pair contract's mint function, which calculates the amount of LP tokens to mint based on the contributed liquidity relative to existing reserves. For the first liquidity provider, LP tokens are calculated as sqrt(amount0 * amount1) minus a minimum liquidity that's permanently locked. For subsequent providers, LP tokens are calculated proportionally to their contribution: min(amount0 * totalSupply / reserve0, amount1 * totalSupply / reserve1). The function emits a LiquidityAdded event with details of the tokens, amounts, and LP tokens minted. The transaction includes slippage protection through amountAMin and amountBMin parameters.",
    simplifiedExplanation:
      "You're depositing your tokens into the exchange's liquidity pool, which is like putting money into a shared fund that others can trade against. In return, you receive special 'LP tokens' that represent your share of the pool. It's similar to depositing money into a bank's investment fund and receiving a certificate that proves your ownership share. Your deposited tokens increase the pool's capacity to handle trades, and in return, you'll earn a portion of the trading fees collected from users who trade using this pool.",
    whatIfScenarios: [
      'What if the pool ratio changes between transaction submission and execution? The transaction includes minimum amount parameters (amountAMin and amountBMin) that protect against slippage. If the calculated optimal amounts fall below these thresholds due to pool ratio changes, the transaction will revert rather than executing at unfavorable terms.',
      'What if the user is the first liquidity provider for a pair? The user sets the initial exchange rate for the pool. This is a critical responsibility, as an incorrect initial price could lead to immediate arbitrage opportunities. Most interfaces help users by suggesting prices from other exchanges or oracles.',
      'What if the user provides unbalanced liquidity? For existing pools, the contract will calculate the optimal amounts based on the current pool ratio, and any excess tokens will be returned to the user. This ensures the pool ratio remains unchanged, preventing price manipulation through liquidity addition.',
    ],
  },
  8: {
    explanation:
      "LP tokens are minted and sent to the liquidity provider as a representation of their share in the pool. These tokens serve as a receipt of the provider's contribution and entitle them to a proportional share of the pool's assets and trading fees. LP tokens are essential for tracking ownership in the pool and can often be used in other DeFi protocols for additional yield opportunities.",
    technicalDetails:
      "The mint function in the pair contract calculates the amount of LP tokens to issue based on the contributed liquidity. For the first liquidity provider, the formula is sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY, where MINIMUM_LIQUIDITY (typically 1000) is permanently locked in the contract to prevent the total supply from ever reaching zero. For subsequent providers, LP tokens are calculated proportionally: min(amount0 * totalSupply / reserve0, amount1 * totalSupply / reserve1). This ensures that liquidity providers receive LP tokens proportional to their contribution relative to existing reserves. The function performs several key operations: 1) It calculates the amounts of each token added to the pool by comparing current balances with previous reserves; 2) It calculates the LP tokens to mint using the appropriate formula; 3) It mints the LP tokens to the recipient's address using the _mint function; 4) It updates the pool's reserves using the _update function; 5) It emits a Mint event with details of the sender and token amounts. The LP tokens implement the ERC-20 standard, allowing them to be transferred, traded, or used in other protocols.",
    simplifiedExplanation:
      "You're receiving special tokens that represent your ownership share in the liquidity pool. These 'LP tokens' are like certificates of deposit that prove how much you've contributed to the pool. It's similar to how a bank might give you a certificate when you deposit money into a CD, or how you receive shares when you invest in a mutual fund. The number of LP tokens you receive is based on the value of tokens you deposited compared to what was already in the pool. You can later redeem these LP tokens to get back your share of the pool, including any fees earned while your liquidity was being used for trading.",
    whatIfScenarios: [
      "What if the calculated LP token amount is zero? The transaction would revert with an 'Insufficient liquidity minted' error. This could happen if the contributed amounts are extremely small or if there's a precision issue in the calculation. Users would need to provide more liquidity to receive LP tokens.",
      'What if the user wants to add to their existing liquidity position? They would go through the same process, receiving additional LP tokens proportional to their new contribution. The new LP tokens would be added to their existing balance, representing their increased share of the pool.',
      'What if the user wants to use their LP tokens in other DeFi protocols? Many DeFi ecosystems allow LP tokens to be staked in yield farming contracts, used as collateral in lending platforms, or deposited in liquidity mining programs. This creates additional yield opportunities beyond just the trading fees earned from the original pool.',
    ],
  },
};

// Function to generate a prompt for the LLM based on the DEX flow and step number
export const generateDexPrompt = (stepNumber: number, defaultDescription?: string): string => {
  // For step 0, use the base prompt with defaultDescription
  if (stepNumber === 0 && defaultDescription) {
    return generateBasePrompt('decentralized exchange (DEX)', stepNumber, 'Introduction', defaultDescription);
  }

  if (stepNumber > 0 && stepNumber <= dexSteps.length) {
    const step = dexSteps[stepNumber - 1];
    const highlight = stepHighlightMap[stepNumber];

    // Get active nodes and edges for this step
    const activeNodes =
      highlight?.nodes?.map(nodeId => flowNodes.find(node => node.id === nodeId)).filter(Boolean) || [];

    const activeEdges =
      highlight?.edges?.map(edgeId => flowEdges.find(edge => edge.id === edgeId)).filter(Boolean) || [];

    // Create a context-rich prompt
    return `
You are an expert blockchain educator explaining a decentralized exchange (DEX) flow visualization. 
Please provide a detailed explanation for step ${stepNumber} of the DEX flow: "${step.title}".

Step information:
- Description: ${step.description}
- What happens: ${step.what}
- Why it matters: ${step.why}
- Code example: ${step.codeSnippet || 'Not available'}

Active components in this step:
- Nodes: ${activeNodes.map(node => `${node?.data?.label || 'Unnamed'} (${node?.data?.tooltip || 'No tooltip'})`).join(', ') || 'None specified'}
- Edges: ${activeEdges.map(edge => `${edge?.data?.label || 'Unnamed'} connection`).join(', ') || 'None specified'}

Please provide three different explanations:
1. A standard explanation that balances technical accuracy with accessibility
2. A technical explanation with implementation details for developers
3. A simplified explanation for beginners with no blockchain experience

Additionally, provide 2-3 "What-if scenarios" related to this step. For example:
- "What happens if the transaction fails at this point?"
- "What if the user has insufficient funds?"
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
  return generateBasePrompt(
    'decentralized exchange (DEX)',
    stepNumber,
    dexSteps[stepNumber - 1]?.title || 'Unknown step'
  );
};

// Function to get AI explanations for the DEX flow
export const getDexAIExplanation = async (
  stepNumber: number,
  useHardcoded: boolean = false,
  defaultDescription?: string
): Promise<AIExplanationResponse> => {
  // Check if we have a hardcoded explanation for this step
  const hardcodedExplanation = dexHardcodedExplanations[stepNumber];

  // If useHardcoded is true, current provider has no valid API key, or hardcoded explanations are forced, return the hardcoded explanation
  if (useHardcoded || !currentProviderHasValidApiKey() || env.VITE_USE_HARDCODED_EXPLANATIONS === 'true') {
    if (env.NODE_ENV === 'development') {
      logInfo('Using hardcoded explanation for DEX flow step', stepNumber);
    }
    return (
      hardcodedExplanation || {
        explanation: `AI explanation for DEX flow step ${stepNumber} is not available yet.`,
        simplifiedExplanation: "This step's explanation is coming soon.",
      }
    );
  }

  try {
    // Generate a prompt for the LLM
    const prompt = generateDexPrompt(stepNumber, defaultDescription);

    // Call the OpenAI API
    const aiResponse = await callOpenAI(prompt);

    // If the API response doesn't include whatIfScenarios but we have hardcoded ones, use those
    if (!aiResponse.whatIfScenarios && hardcodedExplanation?.whatIfScenarios) {
      aiResponse.whatIfScenarios = hardcodedExplanation.whatIfScenarios;
      if (env.NODE_ENV === 'development') {
        logInfo('Using hardcoded whatIfScenarios for DEX flow step', stepNumber);
      }
    }

    return aiResponse;
  } catch (error) {
    // Only log detailed error in development
    if (env.NODE_ENV === 'development') {
      logError('Error getting AI explanation for DEX flow:', error);
    }

    // Fallback to hardcoded explanations if available
    if (hardcodedExplanation) {
      if (env.NODE_ENV === 'development') {
        logInfo('Falling back to hardcoded explanation for DEX flow');
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
