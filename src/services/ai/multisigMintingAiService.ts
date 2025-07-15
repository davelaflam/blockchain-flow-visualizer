import { flowNodes, flowEdges } from '../../components/blockchainFlows/multisig/mintUsda/flowLayout';
import { stepHighlightMap } from '../../components/blockchainFlows/multisig/mintUsda/stepMap';
import { multisigMintingSteps } from '../../components/blockchainFlows/multisig/mintUsda/steps';
import env from '../../utils/env';
import { logInfo, logError } from '../logger';

import { AIExplanationResponse, callOpenAI, generateBasePrompt } from './baseAiService';
import { currentProviderHasValidApiKey } from './providers/AIProviderFactory';

// Hardcoded explanations for the multisig minting flow
export const multisigMintingHardcodedExplanations: Record<number, AIExplanationResponse> = {
  1: {
    explanation:
      'In this initial step, the user connects their wallet to the application and initiates a bridge transfer. This action is the entry point to the entire multisig minting process. The user selects the amount of tokens they want to bridge from Ethereum to mint as USDA tokens.',
    technicalDetails:
      "The frontend application connects to the user's Web3 wallet (like MetaMask) using libraries such as ethers.js or web3.js. The connection process involves requesting permission from the wallet, then using the wallet's provider to sign transactions. When the user initiates the transfer, a transaction is created to lock their tokens in the bridge contract on Ethereum.",
    simplifiedExplanation:
      "You're connecting your digital wallet to the application and telling it how many tokens you want to convert from Ethereum to USDA. This is like logging into your bank account and starting a transfer to another currency.",
    whatIfScenarios: [
      'What if the wallet connection fails? The application will show an error message, and you may need to check if your wallet is properly installed and connected to the correct network.',
      "What if you don't have enough ETH for gas fees? The transaction will fail, and you'll need to add more ETH to your wallet to cover the network fees.",
      'What if you enter an invalid amount? The application should validate the input and prevent submission if the amount is zero, negative, or exceeds your balance.',
    ],
  },
  2: {
    explanation:
      "When the user's tokens are locked in the bridge contract, a 'Lock Event' is emitted on the Ethereum blockchain. This event contains important information such as the user's address, the amount of tokens locked, and a unique identifier for the transaction.",
    technicalDetails:
      "The bridge contract emits an ERC-20 transfer event using Solidity's event mechanism. The event includes indexed parameters for efficient filtering by off-chain services. The event structure typically looks like: `event TokensLocked(address indexed user, uint256 amount, bytes32 indexed transactionId)`. This event is permanently recorded on the Ethereum blockchain and can be observed by any service monitoring the contract.",
    simplifiedExplanation:
      'The blockchain records that your tokens have been locked up. This is like a receipt being created when you deposit money, which other parts of the system can see and respond to.',
    whatIfScenarios: [
      'What if the transaction gets stuck in the mempool? You might need to speed it up by increasing the gas price or cancel it and try again with higher fees.',
      "What if the bridge contract runs out of capacity? The transaction will fail, and you'll need to wait until more capacity is available or try with a smaller amount.",
      "What if the event isn't detected by the relayer? The system has mechanisms to detect and handle missed events, including periodic scans of past blocks.",
    ],
  },
  3: {
    explanation:
      'The lock event from Ethereum is detected by a relayer service, which then forwards this event to the AO Event Pool. This step bridges the gap between the Ethereum blockchain and the AO network, ensuring that events from one chain can trigger actions on another.',
    technicalDetails:
      "A relayer service (often implemented using Node.js) continuously monitors the Ethereum blockchain for specific events using JSON-RPC subscriptions or polling. When it detects a TokensLocked event, it validates the event data, formats it according to the AO network's requirements, and submits it to the AO Event Pool using the AO network's API. The relayer typically waits for sufficient block confirmations (e.g., 12-24 blocks) before forwarding the event to ensure finality.",
    simplifiedExplanation:
      'A special messenger service notices your transaction on Ethereum and sends a message about it to the AO network. This is like someone seeing your deposit at one bank and calling another bank to let them know about it.',
    whatIfScenarios: [
      'What if the relayer service goes offline? The system typically has multiple redundant relayers to ensure high availability, and events will be processed once the service is restored.',
      'What if the event data is corrupted? The relayer validates the event data before forwarding it, and invalid events are rejected by the AO network.',
      "What if there's a network partition? The system is designed to handle temporary network issues and will retry failed operations when connectivity is restored.",
    ],
  },
  4: {
    explanation:
      'The AO Event Pool receives the lock event and processes it. This involves validating the event, checking for duplicates, and routing it to the appropriate handler - in this case, the AO USDA EventHandler. The Event Pool acts as a central hub for all events in the AO ecosystem.',
    technicalDetails:
      "The AO Event Pool is implemented as a Node.js EventEmitter-based system that maintains a pool of registered event handlers. When an event arrives, it's validated against a schema, checked against a database of processed events to prevent duplicates, and then emitted to all registered handlers. Handlers subscribe to specific event types, and only process events they're interested in. The event is stored in a persistent database with its processing status for audit and recovery purposes.",
    simplifiedExplanation:
      "The message arrives at the AO network's central mailroom, where it's checked to make sure it's valid and hasn't been seen before. Then it's forwarded to the specific department that handles USDA token creation.",
    whatIfScenarios: [
      'What if the same event is received multiple times? The Event Pool uses a unique transaction ID to deduplicate events, so duplicates are safely ignored.',
      'What if the event validation fails? Invalid events are logged for investigation but not processed further, and an error may be returned to the sender.',
      'What if the Event Pool is under heavy load? The system implements rate limiting and queue management to handle high volumes of events without dropping valid ones.',
    ],
  },
  5: {
    explanation:
      'The AO USDA EventHandler receives the event and prepares a mint proposal for the multisig group. This proposal contains all the necessary information for the multisig signers to evaluate, including the recipient address, amount to mint, and proof of the original lock transaction on Ethereum.',
    technicalDetails:
      "The EventHandler extracts the relevant data from the event, performs additional validation (such as verifying the Ethereum transaction proof using Merkle Patricia proofs), and constructs a formal proposal object. This proposal is formatted according to the multisig contract's requirements and includes fields like `{ type: 'mint', recipient: '0x123...', amount: '1000000000000000000', proof: '0x456...', nonce: 42 }`. The handler then serializes this proposal and submits it to the multisig contract using the AO network's transaction system.",
    simplifiedExplanation:
      "The USDA department creates an official request to make new tokens. This request includes all the important details like who should receive the tokens and how many tokens to create. It's like filling out a form requesting a bank to issue new currency.",
    whatIfScenarios: [
      'What if the Ethereum transaction proof is invalid? The EventHandler will reject the proposal and may trigger an alert for manual investigation.',
      'What if the recipient address is blacklisted? The system checks against compliance lists before creating the proposal and will block transactions to sanctioned addresses.',
      'What if the amount exceeds daily limits? The EventHandler enforces minting limits to prevent potential abuse or errors.',
    ],
  },
  6: {
    explanation:
      'The multisig contract receives the mint proposal and records it in its internal state. The proposal is now ready for the multisig signers to review and vote on. At this stage, no action is taken yet - the proposal is simply registered and awaiting votes.',
    technicalDetails:
      "The multisig contract, implemented in the AO network's smart contract language, receives the proposal transaction and executes its `receiveProposal` function. This function validates the proposal format, checks that the sender is authorized to submit proposals, assigns a unique proposal ID, and stores the proposal in the contract's state. The contract emits a `ProposalReceived` event with the proposal ID and details, which can be monitored by the signers' clients.",
    simplifiedExplanation:
      "The request arrives at a special committee that needs multiple people to approve it. The committee records the request and makes it available for members to review. This is like a loan application being received by a bank's approval committee.",
    whatIfScenarios: [
      'What if the proposal format is incorrect? The contract will reject it with an error, and the sender will need to correct the format and resubmit.',
      'What if the same proposal is submitted twice? The contract checks for duplicates and will reject any proposal with the same nonce from the same sender.',
      'What if the contract is paused? The system can temporarily pause new proposals during maintenance or in case of security incidents.',
    ],
  },
  7: {
    explanation:
      "The first validator in the multisig group reviews the proposal and submits their vote. This vote is recorded in the multisig contract and counts toward the required threshold for approval. The validator verifies that the proposal is legitimate and aligns with the protocol's rules before voting.",
    technicalDetails:
      "Validator 1's client software detects the `ProposalReceived` event, retrieves the proposal details, and presents them to the validator or automatically validates them against predefined rules. The validator (or their automated system) then submits a `vote` transaction to the multisig contract with parameters like `{ proposalId: 123, approve: true, signature: '0x789...' }`. The contract verifies the validator's identity using cryptographic signatures, records the vote, and emits a `VoteReceived` event.",
    simplifiedExplanation:
      "The first committee member reviews the request and votes 'yes' or 'no'. Their vote is recorded officially. This is like one bank manager reviewing a loan application and approving it.",
    whatIfScenarios: [
      'What if the validator is offline? The system is designed to work as long as a quorum of validators is available, and votes can be submitted within the voting period.',
      'What if the validator changes their mind? Most multisig implementations allow validators to change their vote as long as the voting period is still open.',
      "What if the validator's private key is compromised? The contract can be upgraded to remove the compromised validator, but this requires approval from other validators.",
    ],
  },
  8: {
    explanation:
      'A second validator in the multisig group reviews the proposal and submits their vote. Like the first vote, this is recorded in the multisig contract and counts toward the required threshold. Multiple validators are required to ensure security and decentralization in the minting process.',
    technicalDetails:
      "Similar to Validator 1, Validator 2's client detects the proposal, validates it, and submits a vote transaction. The multisig contract verifies that Validator 2 hasn't already voted on this proposal (preventing double-voting), records the vote, and updates the vote tally. The contract's state now includes votes from both validators, bringing it closer to the required threshold for execution.",
    simplifiedExplanation:
      "A second committee member reviews the same request and adds their vote. Having multiple people check the request helps prevent mistakes or fraud. This is like getting a second manager's approval on an important financial decision.",
    whatIfScenarios: [
      "What if the second validator disagrees with the first? The proposal will need more votes to reach the required threshold, and if it doesn't get enough approvals, it will be rejected.",
      'What if there are more than two validators? The system typically requires a certain percentage (e.g., 2/3) of validators to approve before executing the proposal.',
      'What if validators are split on the decision? The proposal will only execute if it meets the predefined threshold of approvals within the voting period.',
    ],
  },
  9: {
    explanation:
      'After receiving votes from the validators, the multisig contract tallies the votes to determine if the proposal has reached the required threshold for approval. This step ensures that enough validators have reviewed and approved the proposal before proceeding with the minting operation.',
    technicalDetails:
      "The multisig contract's vote tallying logic is triggered either by the last vote transaction or by a separate `tallyVotes` transaction. The contract counts the number of 'approve' votes and compares it to the predefined threshold (e.g., 2 of 3, or 3 of 5 validators). If the threshold is reached, the contract updates the proposal status to 'approved' and prepares for the next step. If not, it waits for more votes or eventually times out if the voting period expires.",
    simplifiedExplanation:
      "The committee counts all the votes to see if enough members have approved the request. A certain number of 'yes' votes are needed before proceeding. This is like counting the approvals on a document that requires multiple signatures.",
    whatIfScenarios: [
      'What if the voting period expires without enough approvals? The proposal will be marked as expired or rejected, and a new proposal would need to be submitted.',
      "What if there's a tie in the votes? The proposal will not be approved unless it meets the minimum threshold, which is typically more than half of the validators.",
      'What if a validator tries to vote after the deadline? The contract will reject late votes to ensure the voting process is fair and timely.',
    ],
  },
  10: {
    explanation:
      "Once the proposal is approved, the multisig contract sends a 'Mint Approved' message to the USDA Token Process. This message authorizes the token contract to proceed with minting the requested amount of USDA tokens. The multisig approval provides the security and verification needed before new tokens can be created.",
    technicalDetails:
      'After determining that the proposal has reached the approval threshold, the multisig contract executes its `approveProposal` function, which creates a signed approval message containing the proposal details and signatures from the validators. This message is sent as a transaction to the USDA Token Process contract, calling its `receiveMintApproval` function with parameters that include the recipient address, amount, and cryptographic proof of multisig approval.',
    simplifiedExplanation:
      'Once enough committee members have approved, an official authorization is sent to the department that creates the tokens. This is like a bank sending the final approval to the department that prints money after getting all the required signatures.',
    whatIfScenarios: [
      'What if the token contract is paused? The mint operation will fail, and the system will need to wait until the contract is unpaused.',
      'What if the approval message is lost in transit? The system includes retry mechanisms and timeouts to ensure the message is eventually delivered.',
      'What if the recipient address is invalid? The token contract will validate the address before attempting to mint tokens to it.',
    ],
  },
  11: {
    explanation:
      "The AO Handler sends a 'Mint' instruction to the USDA Token Process. This step translates the approved proposal into a specific minting instruction that the token contract can execute. The handler ensures that all the necessary information is included in the mint instruction.",
    technicalDetails:
      "The AO Handler, upon detecting the multisig approval, formats a mint instruction according to the USDA Token Process contract's requirements. This instruction includes the recipient address, amount to mint, a reference to the original proposal, and any additional metadata required by the token contract. The handler submits this as a transaction to the token contract's `mint` function, using the AO network's transaction system.",
    simplifiedExplanation:
      'The USDA department sends specific instructions to the token creation system about exactly how many tokens to create and who should receive them. This is like sending detailed printing instructions to the money printing facility after getting approval.',
    whatIfScenarios: [
      'What if the mint instruction is invalid? The token contract will reject it, and the handler may need to retry with corrected parameters.',
      'What if the token supply limit is reached? The contract will enforce any maximum supply limits and reject mints that would exceed them.',
      'What if the network is congested? The transaction may take longer to process, but it will eventually be included in a block.',
    ],
  },
  12: {
    explanation:
      "The USDA Token Process executes the mint instruction, creating new USDA tokens and assigning them to the recipient's address. This is the actual token creation step, where the digital assets are brought into existence on the blockchain.",
    technicalDetails:
      "The USDA Token contract, which implements a standard token interface (similar to ERC-20), executes its `mint` function with the parameters received from the AO Handler. This function increases the total supply of tokens by the specified amount and adds that amount to the recipient's balance in the contract's state. The contract performs various checks, such as ensuring the mint instruction comes from an authorized source and that any minting limits haven't been exceeded. Finally, it emits a `Transfer` event from the zero address to the recipient, which is the standard way to represent minting in token contracts.",
    simplifiedExplanation:
      'The token system creates the new USDA tokens and puts them in your digital wallet. This is the moment when the new digital money actually comes into existence, like when a bank officially adds money to your account.',
    whatIfScenarios: [
      "What if the recipient's wallet doesn't support the token standard? The tokens will still be assigned to their address, but they may need to add the token contract address to their wallet to see them.",
      'What if the transaction runs out of gas? The entire operation will be reverted, and the tokens will not be minted. The sender will need to resubmit with a higher gas limit.',
      "What if there's a reorg in the blockchain? The transaction will be included in the new canonical chain, and the token balance will reflect the final state after the reorg.",
    ],
  },
  13: {
    explanation:
      'After minting the tokens, the USDA Token Process sends a credit notice to the recipient and a token event to the AO USDA EventHandler. These notifications inform the relevant parties that the minting operation has been completed successfully, providing transparency and confirmation of the transaction.',
    technicalDetails:
      'The USDA Token contract, after completing the mint operation, emits multiple events: a standard `Transfer` event for blockchain explorers and wallets to detect, and a custom `CreditNotice` event with additional metadata about the minting operation. It also sends a direct message to the AO USDA EventHandler with the transaction details for record-keeping and potential follow-up actions. These events and messages include the transaction hash, timestamp, recipient address, amount, and references to the original bridge transaction on Ethereum.',
    simplifiedExplanation:
      'The system sends you a confirmation that your new tokens have been created and added to your wallet. It also updates its records to show that the process is complete. This is like getting a receipt for a deposit and the bank updating its internal records.',
    whatIfScenarios: [
      'What if the notification email is marked as spam? The transaction is still recorded on the blockchain, so you can always check your wallet or a block explorer to confirm the tokens were received.',
      "What if there's a discrepancy between the amount requested and the amount received? The system includes multiple layers of validation to prevent this, but if it occurs, you should contact support with the transaction hashes.",
      'What if you need to prove the transaction later? The immutable record on the blockchain serves as cryptographic proof of the transaction, and you can always look it up using the transaction hash.',
    ],
  },
};

// Function to generate a prompt for the LLM based on the multisig minting flow and step number
export const generateMultisigMintingPrompt = (stepNumber: number, defaultDescription?: string): string => {
  // For step 0, use the base prompt with defaultDescription
  if (stepNumber === 0 && defaultDescription) {
    return generateBasePrompt('multisig minting', stepNumber, 'Introduction', defaultDescription);
  }

  if (stepNumber > 0 && stepNumber <= multisigMintingSteps.length) {
    const step = multisigMintingSteps[stepNumber - 1];
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
You are an expert blockchain educator explaining a multisig minting flow visualization for USDA tokens. 
Please provide a detailed explanation for step ${stepNumber} of the multisig minting flow: "${step.title}".

Step information:
- Description: ${step.description}
- What happens: ${step.what}
- Why it matters: ${step.why}

Active components in this step:
- Nodes: ${activeNodes.map((node: any) => `${node?.data.label} (${node?.data.tooltip || 'No tooltip'})`).join(', ')}
- Edges: ${activeEdges.map((edge: any) => `${edge?.data?.label || 'Unnamed'} connection`).join(', ')}

Please provide three different explanations:
1. A standard explanation that balances technical accuracy with accessibility
2. A technical explanation with implementation details for developers
3. A simplified explanation for beginners with no blockchain experience

Additionally, provide 2-3 "What-if scenarios" related to this step. For example:
- "What happens if the transaction fails at this point?"
- "What if the multisig signers disagree on the mint request?"
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
    'multisig minting',
    stepNumber,
    multisigMintingSteps[stepNumber - 1]?.title || 'Unknown step'
  );
};

// Function to get AI explanations for the multisig minting flow
export const getMultisigMintingAIExplanation = async (
  stepNumber: number,
  useHardcoded: boolean = false,
  defaultDescription?: string
): Promise<AIExplanationResponse> => {
  // Check if we have a hardcoded explanation for this step
  const hardcodedExplanation = multisigMintingHardcodedExplanations[stepNumber];

  // If useHardcoded is true, current provider has no valid API key, or hardcoded explanations are forced, return the hardcoded explanation
  if (useHardcoded || !currentProviderHasValidApiKey() || env.VITE_USE_HARDCODED_EXPLANATIONS === 'true') {
    if (env.NODE_ENV === 'development') {
      logInfo('Using hardcoded explanation for multisig minting step', stepNumber);
    }
    return (
      hardcodedExplanation || {
        explanation: `AI explanation for multisig minting step ${stepNumber} is not available yet.`,
        simplifiedExplanation: "This step's explanation is coming soon.",
      }
    );
  }

  try {
    // Generate a prompt for the LLM
    const prompt = generateMultisigMintingPrompt(stepNumber, defaultDescription);

    // Call the OpenAI API
    const aiResponse = await callOpenAI(prompt);

    // If the API response doesn't include whatIfScenarios but we have hardcoded ones, use those
    if (!aiResponse.whatIfScenarios && hardcodedExplanation?.whatIfScenarios) {
      aiResponse.whatIfScenarios = hardcodedExplanation.whatIfScenarios;
      if (process.env.NODE_ENV === 'development') {
        logInfo('Using hardcoded whatIfScenarios for multisig minting step', stepNumber);
      }
    }

    return aiResponse;
  } catch (error) {
    // Only log detailed error in development
    if (env.NODE_ENV === 'development') {
      logError('Error getting AI explanation for multisig minting flow:', error);
    }

    // Fallback to hardcoded explanations if available
    if (hardcodedExplanation) {
      if (env.NODE_ENV === 'development') {
        logInfo('Falling back to hardcoded explanation for multisig minting flow');
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
