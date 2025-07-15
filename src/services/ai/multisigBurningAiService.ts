import { flowNodes, flowEdges } from '../../components/blockchainFlows/multisig/burnUsda/flowLayout';
import { stepHighlightMap } from '../../components/blockchainFlows/multisig/burnUsda/stepMap';
import { multisigBurningSteps } from '../../components/blockchainFlows/multisig/burnUsda/steps';
import { Step } from '../../components/blockchainFlows/types/StepTypes';
import env from '../../utils/env';
import { logInfo, logError } from '../logger';

import { AIExplanationResponse, callOpenAI, generateBasePrompt } from './baseAiService';
import { currentProviderHasValidApiKey } from './providers/AIProviderFactory';

export const multisigBurningHardcodedExplanations: Record<number, AIExplanationResponse> = {
  1: {
    explanation:
      'In this initial step, the user connects their wallet to the application and initiates a burn request for USDA tokens. This action starts the entire burning process. The user specifies the amount of USDA tokens they want to burn, which will eventually be converted back to the underlying asset.',
    technicalDetails:
      "The frontend application connects to the user's Web3 wallet (like MetaMask) using libraries such as ethers.js or web3.js. When the user initiates the burn, a transaction is created that calls the burn function on the USDA token contract. This function typically includes parameters like the amount to burn and potentially a destination address for the underlying asset. The transaction is signed by the user's private key and submitted to the blockchain.",
    simplifiedExplanation:
      "You're connecting your digital wallet to the application and telling it how many USDA tokens you want to convert back to regular cryptocurrency. This is like going to a bank and asking to exchange your special bank notes back to regular currency.",
    whatIfScenarios: [
      "What if you don't have enough USDA tokens to burn? The transaction will fail, and you'll need to ensure you have sufficient balance before trying again.",
      'What if the network is congested? The transaction might take longer to process, or you might need to increase the gas fee to get it processed faster.',
      'What if you enter an invalid amount? The application should validate your input and prevent you from entering zero, negative numbers, or amounts with too many decimal places.',
    ],
  },
  2: {
    explanation:
      "When the user's burn request is processed, a 'Burn Event' is emitted from the USDA token contract. This event contains important information such as the user's address, the amount of tokens burned, and a unique identifier for the transaction.",
    technicalDetails:
      "The USDA token contract emits a standard ERC-20 Transfer event (to the zero address) and a custom Burn event using Solidity's event mechanism. The event structure typically looks like: `event Burn(address indexed burner, uint256 amount, bytes32 indexed transactionId)`. This event is permanently recorded on the blockchain and can be observed by any service monitoring the contract.",
    simplifiedExplanation:
      'The system creates a public record that your tokens are being burned. This is like the bank stamping your exchange request form and putting it in their official records so everyone knows this transaction is happening.',
    whatIfScenarios: [
      "What if the burn event isn't emitted? The transaction will have failed, and no tokens will be burned. You should check the transaction status in a block explorer.",
      "What if the transaction is still pending? You can check the status using the transaction hash. If it's stuck, you might need to speed it up or cancel it and try again.",
      'What if the event is emitted with incorrect details? The blockchain is immutable, so you should verify the transaction details carefully before proceeding.',
    ],
  },
  3: {
    explanation:
      'The burn event is detected by a relayer service, which then forwards this event to the AO Event Pool. This step bridges the gap between the blockchain where the burn was initiated and the AO network where the burn will be processed.',
    technicalDetails:
      "A relayer service continuously monitors the blockchain for Burn events from the USDA token contract. When it detects such an event, it validates the event data, formats it according to the AO network's requirements, and submits it to the AO Event Pool using the AO network's API. The relayer typically waits for sufficient block confirmations before forwarding the event to ensure finality.",
    simplifiedExplanation:
      'A special messenger service notices your burn request and sends a message about it to the AO network. This is like a bank clerk taking your exchange request from one department to another for processing.',
    whatIfScenarios: [
      'What if the relayer is offline? The system typically has multiple relayers for redundancy, and the event will be picked up once the service is restored.',
      'What if the event is missed? The relayer will eventually catch up by scanning past blocks if it was temporarily down.',
      'What if the network is partitioned? The system is designed to handle temporary network issues and will process the event when connectivity is restored.',
    ],
  },
  4: {
    explanation:
      'The AO Event Pool receives the burn event and processes it. This involves validating the event, checking for duplicates, and routing it to the appropriate handler - in this case, the AO USDA Burn Handler. The Event Pool acts as a central hub for all events in the AO ecosystem.',
    technicalDetails:
      "The AO Event Pool is implemented as a Node.js EventEmitter-based system that maintains a pool of registered event handlers. When an event arrives, it's validated against a schema, checked against a database of processed events to prevent duplicates, and then emitted to all registered handlers. Handlers subscribe to specific event types, and only process events they're interested in. The event is stored in a persistent database with its processing status for audit and recovery purposes.",
    simplifiedExplanation:
      "The message arrives at the AO network's central mailroom, where it's checked to make sure it's valid and hasn't been seen before. Then it's forwarded to the specific department that handles USDA token burning.",
    whatIfScenarios: [
      'What if the event is a duplicate? The system will detect and ignore it to prevent processing the same burn request multiple times.',
      "What if the event validation fails? The event will be logged for investigation but won't be processed further.",
      'What if the system is under heavy load? The Event Pool implements rate limiting and queue management to handle high volumes of events.',
    ],
  },
  5: {
    explanation:
      "The AO USDA Burn Handler receives the event and prepares a burn proposal for the multisig committee. This proposal contains all the necessary information for the multisig signers to evaluate, including the burner's address, amount to burn, and proof of the original burn transaction.",
    technicalDetails:
      "The Burn Handler extracts the relevant data from the event, performs additional validation, and constructs a formal proposal object. This proposal is formatted according to the multisig contract's requirements and includes fields like `{ type: 'burn', burner: '0x123...', amount: '1000000000000000000', proof: '0x456...', nonce: 42 }`. The handler then serializes this proposal and submits it to the multisig contract using the AO network's transaction system.",
    simplifiedExplanation:
      "The USDA department creates an official request to burn tokens. This request includes all the important details like who is burning the tokens and how many tokens to burn. It's like filling out a form requesting a bank to remove currency from circulation.",
    whatIfScenarios: [
      'What if the burn proof is invalid? The handler will reject the proposal and may trigger an alert for manual investigation.',
      "What if the burner's address is blacklisted? The system checks against compliance lists before creating the proposal.",
      'What if the amount exceeds daily limits? The handler enforces burning limits to prevent potential abuse.',
    ],
  },
  6: {
    explanation:
      'The multisig committee receives the burn proposal and records it in its internal state. The proposal is now ready for the committee members to review and vote on. At this stage, no action is taken yet - the proposal is simply registered and awaiting votes.',
    technicalDetails:
      "The multisig contract, implemented in the AO network's smart contract language, receives the proposal transaction and executes its `receiveProposal` function. This function validates the proposal format, checks that the sender is authorized to submit proposals, assigns a unique proposal ID, and stores the proposal in the contract's state. The contract emits a `ProposalReceived` event with the proposal ID and details, which can be monitored by the signers' clients.",
    simplifiedExplanation:
      "The request arrives at a special committee that needs multiple people to approve it. The committee records the request and makes it available for members to review. This is like a bank's approval committee receiving your request to exchange a large amount of currency.",
    whatIfScenarios: [
      'What if the proposal format is incorrect? The contract will reject it with an error, and the sender will need to correct the format and resubmit.',
      'What if the same proposal is submitted twice? The contract checks for duplicates and will reject any proposal with the same nonce from the same sender.',
      'What if the contract is paused? The system can temporarily pause new proposals during maintenance or in case of security incidents.',
    ],
  },
  7: {
    explanation:
      "The first validator in the multisig committee reviews the proposal and submits their vote. This vote is recorded in the multisig contract and counts toward the required threshold for approval. The validator verifies that the proposal is legitimate and aligns with the protocol's rules before voting.",
    technicalDetails:
      "Validator 1's client software detects the `ProposalReceived` event, retrieves the proposal details, and presents them to the validator or automatically validates them against predefined rules. The validator (or their automated system) then submits a `vote` transaction to the multisig contract with parameters like `{ proposalId: 123, approve: true, signature: '0x789...' }`. The contract verifies the validator's identity using cryptographic signatures, records the vote, and emits a `VoteReceived` event.",
    simplifiedExplanation:
      "The first committee member reviews the request and votes 'yes' or 'no'. Their vote is recorded officially. This is like one bank manager reviewing your exchange request and approving it.",
    whatIfScenarios: [
      'What if the validator is offline? The system is designed to work as long as a quorum of validators is available, and votes can be submitted within the voting period.',
      'What if the validator changes their mind? Most multisig implementations allow validators to change their vote as long as the voting period is still open.',
      "What if the validator's private key is compromised? The contract can be upgraded to remove the compromised validator, but this requires approval from other validators.",
    ],
  },
  8: {
    explanation:
      'A second validator in the multisig committee reviews the proposal and submits their vote. Like the first vote, this is recorded in the multisig contract and counts toward the required threshold. Multiple validators are required to ensure security and decentralization in the burning process.',
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
      'After receiving votes from the validators, the multisig contract tallies the votes to determine if the proposal has reached the required threshold for approval. This step ensures that enough validators have reviewed and approved the proposal before proceeding with the burning operation.',
    technicalDetails:
      "The multisig contract's vote tallying logic is triggered either by the last vote transaction or by a separate `tallyVotes` transaction. The contract counts the number of 'approve' votes and compares it to the predefined threshold (e.g., 2 of 3, or 3 of 5 validators). If the threshold is reached, the contract updates the proposal status to 'approved' and prepares for the next step. If not, it waits for more votes or eventually times out if the voting period expires.",
    simplifiedExplanation:
      'The committee counts all the votes to see if enough members have approved the request. A certain number of "yes" votes are needed before proceeding. This is like counting the approvals on a document that requires multiple signatures.',
    whatIfScenarios: [
      'What if the voting period expires without enough approvals? The proposal will be marked as expired or rejected, and a new proposal would need to be submitted.',
      "What if there's a tie in the votes? The proposal will not be approved unless it meets the minimum threshold, which is typically more than half of the validators.",
      'What if a validator tries to vote after the deadline? The contract will reject late votes to ensure the voting process is fair and timely.',
    ],
  },
  10: {
    explanation:
      'Once the proposal is approved, the multisig contract sends a "Burn Approved" message to the AO USDA Burn Handler. This message authorizes the handler to proceed with processing the burn and releasing the underlying assets back to the user.',
    technicalDetails:
      'After determining that the proposal has reached the approval threshold, the multisig contract executes its `approveProposal` function, which creates a signed approval message containing the proposal details and signatures from the validators. This message is sent to the AO USDA Burn Handler, which verifies the signatures and the approval status before proceeding with the burn operation.',
    simplifiedExplanation:
      'Once enough committee members have approved, an official authorization is sent to process the burn. This is like a bank manager signing off on your currency exchange after verifying all the details.',
    whatIfScenarios: [
      'What if the Burn Handler is temporarily unavailable? The system includes retry mechanisms to ensure the message is eventually delivered.',
      'What if the underlying assets are not available? The handler will check the reserve balance before proceeding with the burn.',
      "What if the user's address is invalid? The handler will validate the address format before attempting to send any assets.",
    ],
  },
  11: {
    explanation:
      'The AO USDA Burn Handler processes the approved burn request by verifying all the details and then initiating the release of the underlying assets to the user. This step completes the burning process by ensuring the user receives the equivalent value of their burned USDA tokens.',
    technicalDetails:
      "The Burn Handler receives the approval message and verifies the signatures from the multisig validators. It then checks the current exchange rate and calculates the amount of underlying assets to release. The handler submits a transaction to the asset contract to transfer the assets to the user's specified address. Finally, it emits a `BurnProcessed` event with details of the completed burn operation.",
    simplifiedExplanation:
      'The bank processes your approved exchange request and gives you the equivalent amount in the currency you requested. The burned tokens are permanently removed from circulation, and you receive the underlying assets in your wallet.',
    whatIfScenarios: [
      'What if the exchange rate changes between approval and execution? The system uses an oracle to get the current rate at the time of execution, which may differ from the initial quote.',
      'What if the transaction fails? The system will retry a few times, and if it still fails, the operation will be marked as failed and may require manual intervention.',
      'What if the user provided an incompatible wallet address? The transaction will fail, and the assets will remain in the contract until the issue is resolved.',
    ],
  },
  12: {
    explanation:
      'The USDA Token Process executes the burn instruction, permanently removing the specified amount of USDA tokens from circulation. This is the actual token destruction step, where the digital assets are removed from the blockchain.',
    technicalDetails:
      "The USDA Token contract executes its `burn` function with the parameters received from the AO Handler. This function decreases the total supply of tokens by the specified amount and subtracts that amount from the burner's balance in the contract's state. The contract performs various checks, such as ensuring the burn instruction comes from an authorized source and that the burner has sufficient balance. Finally, it emits a `Transfer` event to the zero address, which is the standard way to represent burning in token contracts.",
    simplifiedExplanation:
      'The token system permanently destroys the USDA tokens, removing them from circulation. This is like when a bank shreds old or damaged currency, taking it out of the money supply.',
    whatIfScenarios: [
      'What if the burn instruction is invalid? The contract will reject it and prevent any unauthorized changes to the token supply.',
      "What if the burner's balance is insufficient? The contract will prevent the burn operation and return an error.",
      'What if the network is congested during the burn? The transaction may take longer to process, but the burn will still be executed once confirmed.',
    ],
  },
  13: {
    explanation:
      'After burning the tokens, the USDA Token Process sends a burn confirmation to the user and a burn completion event to the AO USDA Burn Handler. These notifications inform the relevant parties that the burning operation has been completed successfully, providing transparency and confirmation of the transaction.',
    technicalDetails:
      'The USDA Token contract, after completing the burn operation, emits multiple events: a standard `Transfer` event for blockchain explorers and wallets to detect, and a custom `BurnCompleted` event with additional metadata about the burning operation. It also sends a direct message to the AO USDA Burn Handler with the transaction details for record-keeping and potential follow-up actions. These events and messages include the transaction hash, timestamp, burner address, amount, and references to the original burn transaction.',
    simplifiedExplanation:
      'You receive a confirmation receipt showing that your burn request has been processed successfully. The bank updates its records to show that the old currency has been destroyed and the new currency has been issued to you.',
    whatIfScenarios: [
      'What if the confirmation email is marked as spam? The transaction is still recorded on the blockchain, so you can always check your wallet or a block explorer to confirm the transaction.',
      "What if there's a discrepancy in the amounts? The system includes multiple validation steps, but if you notice any issues, you can use the transaction hashes to verify the details on the blockchain.",
      'What if you need to prove the transaction later? The immutable record on the blockchain serves as cryptographic proof of the transaction.',
    ],
  },
};

// Function to generate a prompt for the LLM based on the multisig burning flow and step number
export const generateMultisigBurningPrompt = (stepNumber: number, defaultDescription?: string): string => {
  // For step 0, use the base prompt with defaultDescription
  if (stepNumber === 0 && defaultDescription) {
    return generateBasePrompt('multisig burning', stepNumber, 'Introduction', defaultDescription);
  }

  if (stepNumber > 0 && stepNumber <= multisigBurningSteps.length) {
    const step = multisigBurningSteps[stepNumber - 1];
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
You are an expert blockchain educator explaining a multisig burning flow visualization for USDA tokens. 
Please provide a detailed explanation for step ${stepNumber} of the multisig burning flow: "${step.title}".

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
- "What if the multisig signers disagree on the burn request?"
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
    'multisig burning',
    stepNumber,
    multisigBurningSteps[stepNumber - 1]?.title || 'Unknown step'
  );
};

// Function to get AI explanations for the multisig burning flow
export const getMultisigBurningAIExplanation = async (
  stepNumber: number,
  useHardcoded: boolean = false,
  defaultDescription?: string
): Promise<AIExplanationResponse> => {
  // Check if we have a hardcoded explanation for this step
  const hardcodedExplanation = multisigBurningHardcodedExplanations[stepNumber];

  // If useHardcoded is true, current provider has no valid API key, or hardcoded explanations are forced, return the hardcoded explanation
  if (useHardcoded || !currentProviderHasValidApiKey() || env.VITE_USE_HARDCODED_EXPLANATIONS === 'true') {
    if (env.NODE_ENV === 'development') {
      logInfo('Using hardcoded explanation for multisig burning step', stepNumber);
    }
    return (
      hardcodedExplanation || {
        explanation: `AI explanation for multisig burning step ${stepNumber} is not available yet.`,
        simplifiedExplanation: "This step's explanation is coming soon.",
      }
    );
  }

  try {
    // Generate a prompt for the LLM
    const prompt = generateMultisigBurningPrompt(stepNumber, defaultDescription);

    // Call the OpenAI API
    const aiResponse = await callOpenAI(prompt);

    // If the API response doesn't include whatIfScenarios but we have hardcoded ones, use those
    if (!aiResponse.whatIfScenarios && hardcodedExplanation?.whatIfScenarios) {
      aiResponse.whatIfScenarios = hardcodedExplanation.whatIfScenarios;
      if (process.env.NODE_ENV === 'development') {
        logInfo('Using hardcoded whatIfScenarios for multisig burning step', stepNumber);
      }
    }

    return aiResponse;
  } catch (error) {
    // Only log detailed error in development
    if (env.NODE_ENV === 'development') {
      logError('Error getting AI explanation for multisig burning flow:', error);
    }

    // Fallback to hardcoded explanations if available
    if (hardcodedExplanation) {
      if (env.NODE_ENV === 'development') {
        logInfo('Falling back to hardcoded explanation for multisig burning flow');
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
