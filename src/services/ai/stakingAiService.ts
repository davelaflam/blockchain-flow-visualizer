import { flowNodes, flowEdges } from '../../components/blockchainFlows/staking/flowLayout';
import { stepHighlightMap } from '../../components/blockchainFlows/staking/stepMap';
import { stakingSteps } from '../../components/blockchainFlows/staking/steps';
import env from '../../utils/env';
import { logError, logInfo } from '../logger';

import { AIExplanationResponse, callOpenAI, generateBasePrompt } from './baseAiService';
import { currentProviderHasValidApiKey } from './providers/AIProviderFactory';

// Hardcoded explanations for the staking flow
export const stakingHardcodedExplanations: Record<number, AIExplanationResponse> = {
  1: {
    explanation:
      "The wallet connection process establishes a secure communication channel between the user's browser and their blockchain wallet (like MetaMask). This allows the dApp to request transaction signatures and read account information. This is the first step in any blockchain interaction and is essential for identifying the user and their assets on the blockchain.",
    technicalDetails:
      "This step uses the Ethereum Provider API (window.ethereum) to request account access via the eth_requestAccounts method. When called, this triggers the wallet's connection popup, asking for user permission. Once granted, the wallet returns an array of the user's public addresses, with the first one typically being selected as the active account. This address is then stored in the application's state and used for subsequent transactions. The connection leverages Web3 libraries or ethers.js to facilitate communication between the dApp and the blockchain network.",
    simplifiedExplanation:
      "This step connects your crypto wallet (like MetaMask) to the website so you can use your tokens. It's similar to logging into a website, but instead of using a username and password, you're using your blockchain wallet. When you click 'Connect Wallet', your wallet app opens and asks if you want to allow the connection. Once you approve, the website can see your wallet address and token balances.",
    whatIfScenarios: [
      "What if the user doesn't have a wallet installed? The application should detect this and provide guidance on how to install a compatible wallet like MetaMask, along with educational resources about wallet security.",
      'What if the user rejects the connection request? The application should gracefully handle the rejection, display a user-friendly message explaining why the connection is necessary, and provide an option to try again when the user is ready.',
      'What if the user has multiple accounts in their wallet? The wallet typically presents all accounts for the user to choose from, or selects the default account. The user can switch accounts later through their wallet interface, which the application should detect and update accordingly.',
    ],
  },
  2: {
    explanation:
      'The approval process gives the staking contract permission to transfer tokens on your behalf. This is a security feature of ERC-20 tokens that prevents contracts from spending your tokens without permission. This step is crucial for security as it implements the principle of least privilege, ensuring that the staking contract can only access the specific amount of tokens you authorize.',
    technicalDetails:
      "This step calls the ERC-20 approve() function with the staking contract address and amount as parameters. The function signature is approve(address spender, uint256 amount) and returns a boolean indicating success. It sets an allowance in the token contract's internal allowance mapping that the staking contract can later use via transferFrom(). The approval transaction must be signed by the user's wallet and requires gas fees. Many modern interfaces implement EIP-2612 permit functionality to allow gasless approvals via signatures. For security, some users prefer to approve only the exact amount needed rather than unlimited approvals (2^256-1).",
    simplifiedExplanation:
      "You're giving permission for the staking system to use your tokens when you stake them. It's like giving someone limited access to your bank account to make a specific transaction on your behalf. Without this permission, the staking contract wouldn't be able to move your tokens from your wallet to the staking pool. You control exactly how many tokens the contract can use.",
    whatIfScenarios: [
      "What if the user approves less tokens than they want to stake? The staking transaction would fail with an 'insufficient allowance' error. The user would need to approve additional tokens before trying to stake again.",
      'What if the user wants to revoke the approval? They can call the approve() function again with a value of 0 to remove the allowance, preventing the contract from accessing any more of their tokens.',
      "What if the approval transaction fails due to network congestion? The user would need to retry with a higher gas price or wait for network conditions to improve. Until a successful approval transaction is confirmed, the staking contract cannot access the user's tokens.",
    ],
  },
  3: {
    explanation:
      'In this step, your tokens are transferred from your wallet to the staking contract. The contract records your stake amount and the time you started staking. This is the core action that initiates your participation in the staking protocol and begins your journey toward earning rewards. The transaction is recorded on the blockchain, creating an immutable record of your stake.',
    technicalDetails:
      "The staking contract calls transferFrom(msg.sender, address(this), amount) on the token contract to move tokens from the user's address to itself, using the allowance previously set in the approval step. After confirming the transfer was successful, it updates several internal state variables: 1) stakingBalance[msg.sender] is incremented by the staked amount, 2) totalStaked is increased to track protocol-wide metrics, 3) stakingTimestamp[msg.sender] is set to block.timestamp to mark the start time for reward calculations, and 4) if this is the user's first stake, their address may be added to an array of stakers for iteration purposes. Finally, a Staked event is emitted with the user's address and amount for off-chain tracking and UI updates. This function includes require() statements to validate inputs and ensure the transfer succeeds.",
    simplifiedExplanation:
      "Your tokens are now being moved from your wallet to the staking pool where they'll start earning rewards. It's like depositing money into a high-interest savings account. The system records exactly how many tokens you've staked and when you started staking them, which is important for calculating your rewards correctly. Your tokens are now working for you, generating returns as long as they remain in the staking pool.",
    whatIfScenarios: [
      "What if the user tries to stake 0 tokens? The transaction would fail at the validation stage with a 'Cannot stake 0 tokens' error message. Most staking contracts include minimum stake requirements to prevent dust attacks and ensure economic viability.",
      'What if the user already has tokens staked and stakes more? The contract would add the new amount to their existing stake, increasing their total staked balance. Depending on the implementation, this might also reset their staking timestamp or maintain separate entries for different staking periods.',
      "What if the token transfer fails? The entire transaction would revert, returning gas fees (minus what was used) and leaving the user's tokens in their wallet. This could happen if the approval was insufficient or if the token contract has transfer restrictions.",
    ],
  },
  4: {
    explanation:
      'Your tokens are now locked in the staking contract. They will remain here until you decide to unstake them, and during this time they will generate rewards based on the staking duration and amount. This locked state is fundamental to how staking works - by committing your tokens to the protocol for a period of time, you contribute to network security and stability while earning rewards in return.',
    technicalDetails:
      "The contract maintains a stakingBalance mapping (address => uint256) that associates your address with your staked amount. This data is used for reward calculations and to verify unstaking requests. The contract also tracks the total amount staked across all users in the totalStaked variable, which may be used for protocol metrics, reward distribution calculations, or governance weight. The stakingTimestamp mapping (address => uint256) records when each user began staking, which is crucial for time-based reward calculations. These state variables are stored in the contract's persistent storage on the blockchain and can be queried via view functions like getStakingBalance() and getTotalStaked().",
    simplifiedExplanation:
      'Your tokens are now locked in the staking pool and have started earning rewards. Think of it like a certificate of deposit (CD) at a bank - your money is committed for a certain period, and in return, you earn interest. While your tokens are locked, they are working for you behind the scenes, generating returns based on how many tokens you have staked and how long they remain in the pool.',
    whatIfScenarios: [
      "What if the user wants to check their staking balance? They can call the getStakingBalance() function, which is a view function that does not modify state and does not cost gas. This information is typically displayed in the staking dApp's user interface.",
      'What if the protocol needs to upgrade the staking contract? Depending on the design, the protocol might implement a migration path that allows users to transfer their stakes to a new contract, or it might freeze new stakes in the old contract while allowing existing stakes to continue until withdrawn.',
      'What if the user loses access to their wallet? Since the staking contract associates stakes with specific addresses, if a user loses access to their wallet (e.g., lost private keys), their staked tokens would become inaccessible. This highlights the importance of secure key management in blockchain systems.',
    ],
  },
  5: {
    explanation:
      'While your tokens are staked, the contract continuously calculates rewards based on your staking duration and amount. These rewards accumulate over time and can be claimed without unstaking your tokens. This reward mechanism is the primary incentive for users to participate in staking, as it allows them to earn passive income while supporting the network.',
    technicalDetails:
      'Rewards are calculated using a formula like: reward = (stakeAmount * rewardRate * timePassed) / (365 days * 100). This provides an annualized percentage yield (APY). The calculation is performed on-demand when a user checks their rewards or attempts to claim them, rather than being continuously updated in storage (which would be gas-inefficient). The rewardRate may be fixed or variable depending on protocol design - some protocols adjust rates based on total stake, market conditions, or governance decisions. The time calculation uses block.timestamp - stakingTimestamp[user] to determine the duration. Some advanced protocols implement compounding rewards, where unclaimed rewards are automatically added to the stake, increasing future reward calculations. The reward calculation function is typically a view function that does not modify state, allowing users to check their rewards without gas costs.',
    simplifiedExplanation:
      "Your staked tokens are generating rewards over time, like earning interest in a savings account. The longer you keep your tokens staked and the more tokens you have staked, the more rewards you'll earn. It's like having money in a high-yield savings account where interest accumulates daily but you can withdraw it whenever you want without touching your principal deposit. The rewards are calculated based on three factors: how many tokens you've staked, the reward rate set by the protocol, and how long your tokens have been staked.",
    whatIfScenarios: [
      'What if the protocol changes the reward rate? Many protocols include governance mechanisms that allow for adjusting reward rates. If the rate changes, it typically affects future rewards but not already-accumulated rewards. Users would earn at the new rate going forward.',
      "What if there's a bug in the reward calculation? Smart contract audits help prevent such issues, but if a bug is discovered, the protocol might need to deploy a fixed contract and migrate users. In severe cases, the protocol might need to compensate affected users from a treasury or insurance fund.",
      "What if the user stakes additional tokens? The contract would update the user's staking balance, and future reward calculations would be based on the new total. Depending on the implementation, this might reset the staking timestamp or maintain separate entries for different staking periods.",
    ],
  },
  6: {
    explanation:
      'When claiming rewards, the contract calculates the total rewards earned since your last claim, transfers the reward tokens to your wallet, and resets the reward calculation period. This allows users to realize the benefits of staking without having to unstake their tokens, providing liquidity while maintaining their position in the staking protocol.',
    technicalDetails:
      "The claimRewards() function first calls calculateRewards() to determine the user's earned rewards. After verifying the rewards are greater than zero, it resets the stakingTimestamp[msg.sender] to the current block.timestamp, which effectively starts a new reward period. The contract then calls the reward token's transfer() function to send the calculated rewards to the user's address. This may be the same token as the staked token or a different reward token, depending on the protocol design. The function emits a RewardsClaimed event with the user's address and reward amount for tracking purposes. Some implementations might include additional features like reward boosting based on staking duration or amount, or options to automatically restake rewards for compound interest effects. The function includes require() statements to validate that rewards exist and that the transfer succeeds.",
    simplifiedExplanation:
      "You're collecting the rewards you've earned without removing your staked tokens. It's like harvesting the interest from your savings account while keeping your principal amount invested. After claiming, your reward counter resets, and you start accumulating new rewards from zero. The claimed rewards are sent directly to your wallet, where you can use them however you want - spend them, trade them, or even stake them again to compound your earnings.",
    whatIfScenarios: [
      "What if there are no rewards to claim? The transaction would fail with a 'No rewards to claim' error message. Most interfaces check the available rewards before enabling the claim button to prevent users from wasting gas on transactions that would fail.",
      "What if the reward token transfer fails? This could happen if the contract doesn't have enough reward tokens (a serious protocol issue). The transaction would revert, the stakingTimestamp wouldn't reset, and the user could try again later after the protocol resolves the liquidity issue.",
      "What if the user never claims their rewards? In most implementations, rewards continue to accumulate indefinitely, though they don't compound unless specifically designed to do so. Some protocols might implement a maximum cap on rewards or a time limit after which unclaimed rewards are redistributed or sent to a treasury.",
    ],
  },
  7: {
    explanation:
      'When you request to unstake, the contract initiates the unstaking process by recording your request and starting the cooldown period. This is a security measure to prevent sudden mass withdrawals that could destabilize the protocol or the broader market. The unstaking process is designed to be orderly and predictable, allowing the protocol to prepare for token outflows.',
    technicalDetails:
      "The requestUnstake(uint256 amount) function first validates that the amount is greater than zero and that the user has sufficient staked balance. It then creates an UnstakeRequest struct containing the requested amount, the current block.timestamp as the requestTime, and a completed flag set to false. This data is stored in the unstakeRequests mapping with the user's address as the key. The function does not actually transfer any tokens at this point - it merely records the intention to unstake. The function emits an UnstakeRequested event with the user's address and requested amount. Some implementations might also calculate and distribute any final rewards at this point, or they might allow rewards to continue accumulating during the cooldown period. The function does not reduce the user's staking balance yet, as the tokens remain locked until the withdrawal step.",
    simplifiedExplanation:
      "You're telling the system you want your tokens back, which starts a waiting period before you can withdraw them. It's like giving notice at a bank that you plan to withdraw from a time-locked deposit. You're not getting your tokens immediately - you're just starting the process. The system records exactly how many tokens you want to withdraw and when you made the request. This waiting period helps keep the staking system stable by preventing everyone from withdrawing at once, which could cause problems for the network.",
    whatIfScenarios: [
      "What if the user requests to unstake more tokens than they have staked? The transaction would fail with an 'Insufficient staking balance' error. The user would need to adjust their request to match or be less than their actual staked amount.",
      "What if the user changes their mind during the cooldown period? Some protocols allow canceling unstake requests during the cooldown period, returning the tokens to the staked state. Others don't allow cancellations once the process has started, requiring users to complete the unstaking and then stake again if desired.",
      'What if the user makes multiple unstake requests? Depending on the implementation, the contract might either overwrite the previous request with the new one, maintain separate requests for different amounts, or reject new requests until the previous one is completed. Most implementations use the first approach for simplicity.',
    ],
  },
  8: {
    explanation:
      'During the cooldown period, your unstaking request is locked and cannot be withdrawn. This period helps maintain the stability of the staking pool and prevents market manipulation. The cooldown mechanism is a critical security feature that protects the protocol from coordinated withdrawal attacks and gives the protocol time to prepare for liquidity outflows.',
    technicalDetails:
      "The isCooldownComplete(address staker) function checks if (block.timestamp >= request.requestTime + COOLDOWN_PERIOD) to determine if the cooldown is complete. The COOLDOWN_PERIOD is a constant defined in the contract, typically ranging from hours to weeks depending on the protocol's security requirements and liquidity considerations. During this period, the unstake request remains in the pending state, and the tokens remain locked in the contract. The cooldown check is used as a prerequisite in the withdrawTokens() function to prevent premature withdrawals. Some protocols implement tiered cooldown periods based on the amount being unstaked or the user's staking history. The cooldown period also gives the protocol time to prepare for large withdrawals, potentially by liquidating investments or adjusting strategies. This function is typically a view function that returns a boolean and does not modify state.",
    simplifiedExplanation:
      "Your tokens are in a mandatory waiting period before they can be withdrawn. It's similar to a bank's hold period on large withdrawals. This waiting time helps keep the staking system stable by preventing everyone from withdrawing at once, which could crash token prices or harm the network. During this period, your unstaking request is locked in place - you can't cancel it or change the amount, and you can't withdraw your tokens yet. The system is essentially saying, 'We've received your withdrawal request, but you'll need to wait a bit longer before we can process it.'",
    whatIfScenarios: [
      "What if the user tries to withdraw before the cooldown period is over? The transaction would fail with a 'Cooldown period not complete' error. Most user interfaces show a countdown timer indicating when the cooldown will end to prevent premature withdrawal attempts.",
      "What if the blockchain is congested when the cooldown period ends? The user might need to pay higher gas fees to ensure their withdrawal transaction is processed promptly. The cooldown ending doesn't automatically trigger the withdrawal - the user still needs to explicitly call the withdrawTokens() function.",
      'What if the protocol faces an emergency during the cooldown period? Some protocols implement emergency mechanisms that allow governance to temporarily extend cooldown periods during extreme market conditions or security incidents. This is a controversial feature that balances user rights with protocol security.',
    ],
  },
  9: {
    explanation:
      'After the cooldown period ends, you can withdraw your tokens. The contract transfers the tokens back to your wallet and updates its records to reflect the withdrawal. This is the step where the unstaking process is actually executed, and ownership of the tokens is returned to the user. The withdrawal finalizes the unstaking request and completes the lifecycle of those staked tokens.',
    technicalDetails:
      "The withdrawTokens() function first retrieves the user's unstake request from storage and performs several validations: 1) it checks that the request exists and hasn't already been completed, and 2) it verifies that the cooldown period has elapsed by calling isCooldownComplete(). If these checks pass, it retrieves the requested amount from the unstake request. The function then updates the contract's state by: 1) decreasing the user's stakingBalance by the withdrawn amount, 2) reducing the totalStaked counter to reflect the global reduction in staked tokens, and 3) marking the unstake request as completed by setting its completed flag to true. Finally, it calls the token contract's transfer() function to send the tokens from the contract back to the user's wallet. The function emits an Unstaked event with the user's address and the withdrawn amount. This transaction requires gas and must be explicitly initiated by the user or an authorized relayer.",
    simplifiedExplanation:
      "The waiting period is over, and your tokens are being returned to your wallet. This is the moment when you actually get your tokens back. It's like going to the bank after your certificate of deposit (CD) has matured and withdrawing your funds. The system transfers your tokens from the staking pool back to your personal wallet, updates its records to show you've withdrawn your stake, and completes your withdrawal request. After this step, you'll have full control over your tokens again and can use them however you want.",
    whatIfScenarios: [
      "What if the user forgets to withdraw after the cooldown period? The tokens remain locked in the contract until the user explicitly calls the withdrawTokens() function. There's typically no time limit for withdrawal after the cooldown ends, though some protocols might implement additional incentives to encourage prompt withdrawals.",
      "What if the token transfer fails during withdrawal? This would be a critical issue with the token contract or the staking contract. The transaction would revert, preserving the user's stake in the contract. The user could try again later, or the protocol might need to implement emergency measures if the issue persists.",
      "What if the protocol's token value changes dramatically during the unstaking process? The user receives exactly the number of tokens they unstaked, regardless of their current market value. This means the user bears the market risk during the cooldown period, which is one reason why some users might choose to sell their staking positions on secondary markets rather than going through the unstaking process.",
    ],
  },
  10: {
    explanation:
      'The unstaking process is now complete. Your tokens have been returned to your wallet, and the transaction has been finalized on the blockchain. This marks the successful conclusion of the staking lifecycle for these tokens, from initial staking through reward accumulation to final withdrawal. The blockchain now has a permanent record of this completed transaction, providing transparency and auditability for all parties.',
    technicalDetails:
      "At this point, all state changes have been committed to the blockchain and are irreversible. The unstake request in the contract is marked as completed (request.completed = true), preventing double-withdrawals. The user's staking balance (stakingBalance[user]) has been reduced by the withdrawn amount, and the totalStaked counter has been decremented accordingly. The Unstaked event emitted during the withdrawal provides an off-chain record of the completed transaction, which can be used by analytics platforms, tax reporting tools, and user interfaces to track staking activity. The completed unstake request remains in the contract's storage for historical reference and can be accessed via functions like getCompletedUnstakeRequests(). Some protocols might implement additional post-withdrawal processes such as updating governance weights, adjusting reward rates based on the new total staked amount, or triggering rebalancing of protocol funds.",
    simplifiedExplanation:
      "The process is complete! Your tokens are back in your wallet and available for use. It's like having completed a full banking transaction - you deposited funds, earned interest over time, and now you've successfully withdrawn everything back to your account. The blockchain has recorded all these steps permanently, creating a clear history of your staking activity. You're now free to use these tokens however you wish - you could stake them again, trade them for other assets, or simply hold them in your wallet.",
    whatIfScenarios: [
      "What if the user wants to stake again after unstaking? They can start the staking process from the beginning, approving and staking their tokens again. Some interfaces provide a 'restake' option to simplify this process, essentially combining the approval and staking steps.",
      "What if there's a discrepancy between the expected and received token amount? This could indicate an issue with the staking contract's accounting or a potential exploit. Users should verify that the received amount matches their expected withdrawal (minus any fees) and report discrepancies to the protocol team.",
      'What if the user needs to prove they completed the unstaking process? The blockchain provides a permanent record of the transaction. Users can reference the transaction hash of their withdrawal, which contains details of the unstaking operation including the amount withdrawn and timestamp. This can be useful for tax reporting, audits, or resolving disputes.',
    ],
  },
};

// Function to generate a prompt for the LLM based on the staking flow and step number
export const generateStakingPrompt = (stepNumber: number, defaultDescription?: string): string => {
  // For step 0, use the base prompt with defaultDescription
  if (stepNumber === 0 && defaultDescription) {
    return generateBasePrompt('token staking', stepNumber, 'Introduction', defaultDescription);
  }

  if (stepNumber > 0 && stepNumber <= stakingSteps.length) {
    const step = stakingSteps[stepNumber - 1];
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
You are an expert blockchain educator explaining a token staking flow visualization. 
Please provide a detailed explanation for step ${stepNumber} of the staking flow: "${step.title}".

Step information:
- Description: ${step.description}
- What happens: ${step.what}
- Why it matters: ${step.why}
- Code example: ${step.codeSnippet || 'Not available'}

Active components in this step:
- Nodes: ${activeNodes.map((node: any) => `${node?.data.label} (${node?.data.tooltip || 'No tooltip'})`).join(', ')}
- Edges: ${activeEdges.map((edge: any) => `${edge?.data?.label || 'Unnamed'} connection`).join(', ')}

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
  return generateBasePrompt('staking', stepNumber, stakingSteps[stepNumber - 1]?.title || 'Unknown step');
};

// Function to get AI explanations for the staking flow
export const getStakingAIExplanation = async (
  stepNumber: number,
  useHardcoded: boolean = false,
  defaultDescription?: string
): Promise<AIExplanationResponse> => {
  // Check if we have a hardcoded explanation for this step
  const hardcodedExplanation = stakingHardcodedExplanations[stepNumber];

  // If useHardcoded is true, current provider has no valid API key, or hardcoded explanations are forced, return the hardcoded explanation
  if (useHardcoded || !currentProviderHasValidApiKey() || env.VITE_USE_HARDCODED_EXPLANATIONS === 'true') {
    if (env.NODE_ENV === 'development') {
      logInfo('Using hardcoded explanation for staking step', stepNumber);
    }
    return (
      hardcodedExplanation || {
        explanation: `AI explanation for staking step ${stepNumber} is not available yet.`,
        simplifiedExplanation: "This step's explanation is coming soon.",
      }
    );
  }

  try {
    // Generate a prompt for the LLM
    const prompt = generateStakingPrompt(stepNumber, defaultDescription);

    // Call the OpenAI API
    const aiResponse = await callOpenAI(prompt);

    return aiResponse;
  } catch (error) {
    // Only log detailed error in development
    if (env.NODE_ENV === 'development') {
      logError('Error getting AI explanation for staking flow:', error);
    }

    // Fallback to hardcoded explanations if available
    if (hardcodedExplanation) {
      if (env.NODE_ENV === 'development') {
        logInfo('Falling back to hardcoded explanation for staking flow');
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
