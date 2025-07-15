import { flowNodes, flowEdges } from '../../components/blockchainFlows/crossChainBridge/flowLayout';
import { stepHighlightMap } from '../../components/blockchainFlows/crossChainBridge/stepMap';
import { crossChainBridgeSteps } from '../../components/blockchainFlows/crossChainBridge/steps';
import env from '../../utils/env';
import { logError, logInfo } from '../logger';

import { AIExplanationResponse, callOpenAI, generateBasePrompt } from './baseAiService';
import { currentProviderHasValidApiKey } from './providers/AIProviderFactory';

/**
 * This file contains the AI explanation service for the cross-chain bridge flow.
 * It provides hardcoded explanations for each step in the cross-chain bridge process
 * and generates prompts for the LLM to get AI-generated explanations.
 */
export const crossChainBridgeHardcodedExplanations: Record<number, AIExplanationResponse> = {
  1: {
    explanation:
      'The user initiates a cross-chain transfer by selecting the source and target blockchains, specifying the amount of tokens to transfer, and providing the recipient address. This action starts the entire cross-chain bridge process. The user interface validates the inputs and prepares the transaction for submission to the blockchain.',
    technicalDetails:
      'The user interface calls the initiateTransfer function in the bridge contract, which validates the input parameters and creates a unique transfer ID using a hash of the sender address, recipient address, amount, and a nonce. The function then emits a TransferInitiated event that is picked up by blockchain indexers and the bridge monitoring system. The transaction requires the user to sign with their private key and pay gas fees on the source chain. The UI may also perform pre-flight checks such as verifying sufficient balance, checking network status, and estimating gas costs before allowing the transaction to proceed.',
    simplifiedExplanation:
      "You're starting the process of sending tokens from one blockchain to another. It's like beginning an international wire transfer by filling out a form with the destination, amount, and recipient details. Just as a bank would verify your identity and account balance before processing an international transfer, the blockchain system checks that you have enough tokens and that your request is properly formatted before starting the transfer process.",
    whatIfScenarios: [
      "What if the user doesn't have enough tokens for the transfer? The transaction would fail at the validation stage with an 'insufficient balance' error. The user would need to acquire more tokens or reduce the transfer amount before trying again.",
      'What if the user selects the same blockchain for both source and target? The interface should prevent this by filtering out the source chain from the target chain options. If somehow submitted, the contract would reject the transaction as invalid since cross-chain transfers require different source and target chains.',
      'What if the network is congested? The transaction might take longer to be included in a block or require higher gas fees. The UI should provide options to adjust gas settings or wait for better network conditions.',
    ],
  },
  2: {
    explanation:
      'The source chain bridge contract locks the tokens to be transferred. This ensures that these tokens cannot be used elsewhere while the cross-chain transfer is in progress, preventing double-spending. The tokens are held in escrow by the bridge contract until the transfer is completed or refunded.',
    technicalDetails:
      "The lockTokens function in the bridge contract transfers the tokens from the user's wallet to the bridge contract using the ERC-20 transferFrom method (which requires prior approval). The contract updates its internal state to track these locked tokens and emits a TokensLocked event with the transfer ID and amount. The contract maintains a mapping of locked tokens per transfer ID and updates the total locked balance. This operation requires that the user has previously approved the bridge contract to spend their tokens using the ERC-20 approve function. The function includes safety checks to prevent re-entrancy attacks and ensures the transfer amount is greater than zero.",
    simplifiedExplanation:
      "Your tokens are now locked in a secure vault on the starting blockchain. This is like the bank setting aside your money before sending it internationally, ensuring you can't spend it twice. Imagine putting cash in a safety deposit box that only the international transfer system can access - your money is secure and reserved specifically for this transfer until it reaches its destination or is returned to you if the transfer fails.",
    whatIfScenarios: [
      "What if the user hasn't approved the bridge contract to spend their tokens? The transaction would fail with an 'insufficient allowance' error. The user would need to call the approve function on the token contract before initiating the transfer again.",
      'What if the bridge contract is compromised? Most bridge designs include security measures like multi-signature requirements, time-locks, and emergency pause functions that can prevent unauthorized token withdrawals. Additionally, some bridges implement insurance funds to compensate users in case of a security breach.',
      "What if the user wants to cancel the transfer after tokens are locked? Many bridge protocols include a cancellation mechanism that allows users to reclaim their tokens after a certain timeout period if the transfer hasn't been completed. This provides a safety net for failed transfers.",
    ],
  },
  3: {
    explanation:
      "Validators on the source chain verify the transaction to ensure it meets all requirements. They check the user's signature, token amounts, and other parameters to confirm the legitimacy of the transfer request. This consensus-based validation provides security against fraudulent transfers and ensures only valid transactions proceed to the next step.",
    technicalDetails:
      "Multiple validator nodes call the validateTransaction function with their signatures. The contract verifies each signature against the validator's public key and records their approval in a mapping. Once the required threshold of validators (typically 2/3 of the validator set) have approved, the transaction status is updated to VALIDATED and a TransactionValidated event is emitted. The validation process uses a Byzantine Fault Tolerant (BFT) consensus mechanism that can tolerate up to f faulty validators in a 3f+1 validator set. Each validator independently verifies the transaction details, including checking that the tokens are properly locked, the transfer ID is unique, and the destination chain is supported. The validators' signatures are stored on-chain as part of the validation proof.",
    simplifiedExplanation:
      "Security experts are checking your transfer request to make sure everything is correct and legitimate. It's like bank officers verifying your identity and confirming you have enough funds before processing an international transfer. Imagine a panel of security experts each independently reviewing your transfer request and voting on whether to approve it - only when enough experts agree is your transfer considered valid and allowed to proceed. This multi-layered verification process protects both you and the system from errors and fraud.",
    whatIfScenarios: [
      "What if some validators are offline or unresponsive? The system is designed to function as long as a sufficient threshold (typically 2/3) of validators are active. If too many validators are offline, the transaction might be delayed until enough validators become available, but the system won't approve invalid transactions just because some validators are missing.",
      'What if malicious validators try to approve an invalid transaction? The threshold requirement ensures that a small number of compromised validators cannot approve invalid transactions on their own. As long as more than 1/3 of validators are honest, they can prevent validation of fraudulent transactions.',
      'What if the transaction parameters change after some validators have already signed? Each validator signs a specific hash of the transaction parameters. If any parameter changes, the hash would be different, and previously collected signatures would no longer be valid for the new hash. This prevents transaction tampering after partial validation.',
    ],
  },
  4: {
    explanation:
      'After validation, a cross-chain message containing the transfer details is created and sent to the relayer network. This message includes all necessary information for the target chain to process the transfer. The message is cryptographically secured to ensure its authenticity and integrity during transmission between blockchains.',
    technicalDetails:
      'The sendCrossChainMessage function creates a message by encoding the transfer ID, sender address, recipient address, amount, and target chain ID using ABI encoding (abi.encode). This message is cryptographically signed by the source chain validators using their private keys, creating a collection of ECDSA signatures that can be verified on the target chain. The message and signatures are emitted as part of a CrossChainMessageSent event that relayers monitor. The message follows a standardized cross-chain messaging protocol that both chains understand, often implementing the Inter-Blockchain Communication (IBC) protocol or a similar standard. The message also includes a nonce to prevent replay attacks and a timestamp for message expiration checks. The function updates the transfer status to MESSAGE_SENT in the contract state.',
    simplifiedExplanation:
      "A secure message with all your transfer details is being sent to the network that connects different blockchains. This is like your bank creating a SWIFT message with your transfer instructions to send to the international banking network. Imagine your transfer details being sealed in a tamper-proof envelope with multiple security seals (the validators' signatures) that can only be verified and opened by the receiving bank. This envelope contains everything needed to complete your transfer on the destination side, including who should receive the funds and how much.",
    whatIfScenarios: [
      "What if the message is intercepted during transmission? The message itself doesn't contain any private keys or sensitive credentials. Even if intercepted, the message cannot be altered without invalidating the validators' signatures. Additionally, the message can only be processed once on the target chain due to nonce verification, preventing replay attacks.",
      'What if the message format is incompatible with the target chain? Cross-chain bridges implement standardized message formats that are compatible with both chains. Before a new blockchain is added to the bridge network, extensive compatibility testing is performed. If an incompatibility is detected during operation, the message would be rejected by the target chain, and fallback mechanisms would be triggered to return the tokens to the sender.',
      'What if the message is too large for a single transaction? For complex transfers or those involving large amounts of data, the message might be split into multiple parts with sequence numbers. The target chain would then reassemble these parts before processing. Alternatively, the message might contain only essential information with a reference to additional data stored in a decentralized storage system like IPFS.',
    ],
  },
  5: {
    explanation:
      'The relayer network processes the cross-chain message. Relayers are specialized nodes that listen for messages from one blockchain and relay them to another, serving as the communication bridge between chains. These relayers operate independently but coordinate to ensure reliable message delivery, even if some relayers fail or behave maliciously.',
    technicalDetails:
      "Relayer nodes continuously monitor the source chain for CrossChainMessageSent events using event subscriptions or polling mechanisms. When such an event is detected, they retrieve the message payload and validator signatures from the transaction logs. The relayers verify the authenticity of the message by checking the validator signatures against the known validator set and ensuring the message format is valid. They also verify that the message hasn't been processed before by checking a message registry. Relayers may implement a leader election protocol to determine which relayer will submit the message to the target chain, or they may compete in a first-come-first-served model with economic incentives. The relayer network often employs a reputation system and stake-based security model where relayers must stake tokens that can be slashed for malicious behavior. The processMessage function updates the message status to PROCESSED and prepares it for relay to the target chain. Relayers are typically compensated with fees for their services, creating an economic incentive to maintain the network.",
    simplifiedExplanation:
      "Special messenger services are processing your transfer information. They're like the international banking network that receives your bank's message and processes it before sending it to the destination bank. Imagine a team of couriers who are all given copies of your securely sealed transfer envelope - they independently verify the seals (signatures) are authentic, and then coordinate to ensure one of them delivers it to the destination blockchain. These couriers are incentivized to deliver your message quickly and correctly because they earn fees for successful deliveries, and they have deposited security bonds that they would lose if they tried to tamper with your transfer.",
    whatIfScenarios: [
      'What if all relayers go offline? Most bridge designs include multiple independent relayer networks for redundancy. If one network fails, others can still process the message. In the worst case where all relayers are offline, the message would remain in a pending state until relayers come back online, or until a timeout period triggers a refund mechanism to return tokens to the sender.',
      "What if a relayer tries to modify the message? Relayers cannot modify the message without invalidating the validators' signatures. Any attempt to submit a modified message to the target chain would be rejected during signature verification. Additionally, relayers typically have staked tokens that would be slashed if they attempt malicious behavior.",
      'What if relayers are congested with too many messages? Relayer networks implement prioritization mechanisms based on factors like transfer amount, user-specified fees, or time in queue. During congestion, users might experience longer wait times, but the system remains functional. Some bridges allow users to pay higher fees for priority processing during congested periods.',
    ],
  },
  6: {
    explanation:
      'The processed message is relayed to the target blockchain. Relayers submit the message and its accompanying proofs to the bridge contract on the target chain, allowing the transfer to continue on the destination network. This step bridges the gap between the two blockchains, enabling cross-chain communication despite their different protocols and consensus mechanisms.',
    technicalDetails:
      'Relayers call the receiveCrossChainMessage function on the target chain bridge contract, providing the original message payload and the signatures from the source chain validators as parameters. The relayer must have a wallet on the target chain with sufficient funds to pay the gas fees for this transaction. The function includes replay protection by checking a mapping of processed message hashes to prevent the same message from being processed multiple times. Upon receiving the message, the contract performs preliminary validation checks on the message format and chain ID before emitting a MessageReceived event with the transfer ID and timestamp. The contract then queues the message for verification by the target chain validators in the next step. The relayer that successfully submits the message may receive a fee reward, which incentivizes prompt and reliable message delivery. In some implementations, the relayer might also include a Merkle proof that the message was included in the source chain, especially for chains that support light client verification.',
    simplifiedExplanation:
      "Your transfer information has arrived at the destination blockchain. This is like your transfer details reaching the receiving bank in another country, ready for final processing. Imagine the courier (relayer) has now delivered your sealed envelope to the destination bank, where it's logged as received and placed in the verification queue. The courier pays a small fee to the destination bank for processing the envelope and may receive a tip for their delivery service. The destination bank checks that this isn't a duplicate of a previously received envelope before accepting it for processing.",
    whatIfScenarios: [
      "What if multiple relayers try to submit the same message? The target chain contract includes a mechanism to detect and reject duplicate messages using a unique message identifier. Only the first valid submission would be accepted, and subsequent attempts would be rejected with a 'message already processed' error. This prevents double-processing while still allowing multiple relayers to attempt delivery for redundancy.",
      'What if the target chain is congested or has high gas fees? Relayers typically monitor network conditions and may delay submission during extreme congestion or fee spikes. Some relayer systems implement dynamic fee strategies, adjusting their gas price based on the urgency of the message and current network conditions. Users might experience longer delays during congestion, but the system prioritizes reliability over speed.',
      "What if the relayer runs out of funds for gas fees? Professional relayer services maintain multiple funded accounts and implement automatic top-up mechanisms to ensure they always have sufficient funds for gas. If a relayer can't pay for gas, another relayer in the network would typically pick up the message and deliver it instead, ensuring redundancy in the delivery system.",
    ],
  },
  7: {
    explanation:
      "Validators on the target chain verify the cross-chain message to ensure it came from the authorized source chain validators and hasn't been tampered with during transmission. This second layer of validation on the target chain provides additional security and helps maintain the integrity of the cross-chain bridge system.",
    technicalDetails:
      "The target chain validators call the verifyMessage function with the message payload and source chain validator signatures as parameters. The function first computes the keccak256 hash of the message payload to create a unique message identifier. It then verifies each source chain validator signature using ecrecover to derive the signer's address from the signature and message hash, comparing it against the known set of authorized source chain validators. The function also checks that the message hash hasn't been processed before by querying the processedMessages mapping, preventing replay attacks. The verification is recorded in the verifications mapping, tracking which validators have verified the message. Once the required threshold of target chain validators (typically 2/3 of the validator set) have verified the message, its status is updated to VERIFIED, and a MessageVerified event is emitted. The function then decodes the message to extract the transfer details (transferId, sender, recipient, amount, sourceChainId) and stores them in the verifiedTransfers mapping for the token release step. This verification process uses a cross-chain light client or oracle system to maintain an up-to-date view of the source chain's validator set.",
    simplifiedExplanation:
      "Security experts on the destination blockchain are verifying that your transfer request is authentic and hasn't been altered. It's like the receiving bank verifying that the transfer instructions actually came from your bank and contain the correct information. Imagine bank officials at the destination carefully examining the security seals and signatures on your transfer envelope, checking them against signature samples they have on file, and confirming that this exact transfer hasn't been processed before. Only when enough officials agree that everything is legitimate will they approve the transfer for the final stage of processing. This double-verification process ensures that only genuine transfers are processed, protecting both the users and the system from fraud.",
    whatIfScenarios: [
      "What if the source chain validator set has changed since the message was signed? The target chain maintains an up-to-date view of the source chain's validator set through a cross-chain light client or oracle system. If the validator set has changed, the verification would still succeed as long as the signatures were from validators who were authorized at the time of signing. For major validator set changes, the bridge might implement a special update procedure to ensure continuity.",
      "What if a message with the same ID was already processed? The contract would detect this as a replay attempt and reject the message with a 'message already processed' error. This prevents double-processing of the same transfer, which could lead to duplicate token minting on the target chain.",
      "What if the target chain validators disagree about the validity of the message? The system requires a threshold of validators to agree before proceeding. If there's significant disagreement, the message would remain in a pending state until either enough validators verify it or a timeout mechanism is triggered. Some bridge designs include dispute resolution mechanisms for handling contentious cases.",
    ],
  },
  8: {
    explanation:
      'After verification, the target chain bridge contract releases or mints equivalent tokens to the recipient address. This completes the token transfer on the target blockchain. Depending on the bridge design, the contract either releases tokens from its reserve or mints new wrapped tokens that represent the original tokens on the source chain.',
    technicalDetails:
      "The releaseTokens function is called with the transferId parameter, which retrieves the verified transfer details from the verifiedTransfers mapping. The function first checks that the transfer status is VERIFIED and updates it to PROCESSING to prevent re-entrancy attacks. Then, depending on the token type, it either: 1) For wrapped tokens: calls the mint function on the wrapped token contract to create new tokens representing the source chain tokens, or 2) For native tokens: transfers tokens from the bridge contract's reserve using the transfer function of the ERC-20 token contract. The function includes safety checks to ensure the mint or transfer operation succeeds, reverting the transaction if it fails. After successful token release, the transfer status is updated to COMPLETED, and a TokensReleased event is emitted with the recipient address, amount, and timestamp. The function may also update global statistics like totalProcessedTransfers and cumulativeVolume. For wrapped tokens, the contract maintains a 1:1 backing ratio between wrapped tokens and locked tokens on the source chain, ensuring that the total supply of wrapped tokens never exceeds the locked tokens.",
    simplifiedExplanation:
      "The destination blockchain is now sending tokens to the recipient's wallet. It's like the receiving bank depositing the transferred money into the recipient's account, making it available for use. Depending on the type of transfer, the bank either gives you local currency from their reserves (if you're receiving a native token) or creates a special certificate that represents your original deposit (if you're receiving a wrapped token). Either way, the value appears in your account and is ready to use. This is the moment when your transfer actually completes from the recipient's perspective - the funds are now available in the destination blockchain wallet.",
    whatIfScenarios: [
      "What if the bridge contract doesn't have enough tokens in its reserve? For native tokens, the bridge should always maintain sufficient reserves, as these are backed by locked tokens on the source chain. If reserves are somehow insufficient, the transaction would fail, and an emergency protocol would be triggered to halt further transfers until administrators can resolve the liquidity issue. For wrapped tokens, this isn't an issue since new tokens are minted on demand.",
      "What if the recipient address is a contract that rejects the tokens? Some tokens implement hooks that are called when tokens are received, and these hooks might reject the transfer under certain conditions. If this happens, the transaction would revert, and the bridge would typically keep the transfer in a 'ready to claim' state that the recipient can manually trigger later when their contract is ready to accept the tokens.",
      "What if there's a discrepancy between the amount locked on the source chain and the amount to be released? The bridge maintains strict accounting of locked and released tokens. Any discrepancy would indicate a serious issue in the bridge system. Most bridges implement regular audits and reconciliation processes to detect and address any discrepancies. Some bridges also implement a delay period before large transfers are released, allowing time for security checks.",
    ],
  },
  9: {
    explanation:
      "The recipient receives the tokens in their wallet on the target blockchain. The tokens are now available for the recipient to use for transactions, trading, or other purposes on the target chain. This step represents the successful completion of the token transfer from the recipient's perspective.",
    technicalDetails:
      "The recipient's address balance is updated on the target blockchain's state trie, reflecting the new token balance. This update happens automatically as part of the token transfer or minting operation in the previous step. If the recipient is a smart contract with a tokenReceived hook (implementing the ERC-777 or similar standard), this function is called to notify it of the incoming tokens, allowing the contract to execute custom logic upon receipt. The bridge contract emits a TokensReceived event with the transferId, recipient address, amount, and timestamp, which can be monitored by the recipient's wallet, applications, or indexing services. This event provides an off-chain notification mechanism for users and applications. The recipient's wallet software, when connected to the target blockchain, will detect the updated balance either through polling or event subscription, and update the user interface to show the new tokens. For wrapped tokens, the recipient now holds a token that represents a claim on the original token locked on the source chain, with a 1:1 backing ratio maintained by the bridge system.",
    simplifiedExplanation:
      "The tokens have arrived in the recipient's wallet on the destination blockchain and are ready to use. It's like the money appearing in the recipient's bank account, ready to be spent or withdrawn. Imagine checking your bank account after an international transfer and seeing the new balance reflected - that's what happens here, but on the destination blockchain. If the recipient is using a blockchain wallet app, they'll see a notification and their balance will update to show the new tokens. These tokens can now be used just like any other tokens on this blockchain - for payments, trading, or other applications.",
    whatIfScenarios: [
      'What if the recipient wants to verify that the tokens came from the expected source? The recipient can trace the transaction history on a blockchain explorer, which would show that the tokens came from the bridge contract. Some wallets also provide provenance information, showing the origin of tokens. For wrapped tokens, the token contract itself typically includes metadata about the original token and source chain.',
      'What if the recipient wants to convert the wrapped tokens back to the original tokens? Most bridge systems are bidirectional, allowing users to convert wrapped tokens back to the original tokens by initiating a transfer in the opposite direction. The recipient would use the same bridge to send the wrapped tokens back to the source chain, where they would receive the original tokens.',
      "What if the recipient's wallet doesn't recognize the token? For standard tokens (like ERC-20), most wallets can automatically detect the token. However, for custom or new tokens, the recipient might need to manually add the token to their wallet using the token contract address. Bridge interfaces often provide a 'Add to Wallet' button to simplify this process.",
    ],
  },
  10: {
    explanation:
      'The cross-chain transfer is completed and finalized on both blockchains. All relevant data is stored for reference, and the transfer is marked as completed in the bridge system. This final step ensures proper record-keeping, enables auditing, and updates system metrics to reflect the completed transfer.',
    technicalDetails:
      'The completeTransfer function is called on both chains to update the transfer status to COMPLETED. On the source chain, this function is typically called by a relayer that monitors the target chain for TokensReleased events, creating a feedback loop that confirms the transfer was successfully completed end-to-end. The function performs several operations: 1) It updates the transfer status in the transfers mapping to COMPLETED; 2) It moves the transfer data from active transfers to historical records (completedTransfers mapping) for auditing purposes; 3) It updates system metrics like totalCompletedTransfers and totalTransferVolume; 4) It may release any locked collateral or fees associated with the transfer; 5) It emits a TransferCompleted event on each chain with the transferId and chain identifier. Finally, a CrossChainTransferFinalized event is emitted with the transferId and timestamp, which serves as the definitive record of completion. The function includes access controls to ensure only authorized entities can mark transfers as complete. Some bridge implementations also update a merkle tree of completed transfers, which can be used for efficient verification of transfer history.',
    simplifiedExplanation:
      "The entire transfer process is now complete and recorded on both blockchains. It's like having the final receipt for your international transfer, with confirmation from both banks that the transaction is complete and properly documented. Imagine both the sending and receiving banks updating their records to show the transfer is complete, filing away all the paperwork in their archives, and sending you a final confirmation receipt. This step ensures that the entire system has a consistent view of the transfer status, maintains accurate records for future reference, and updates all the relevant statistics about transfer volume and activity.",
    whatIfScenarios: [
      "What if the finalization message from the target chain to the source chain fails? Most bridge systems implement a retry mechanism for finalization messages. If the automatic finalization fails, the transfer would still be completed from the user's perspective (tokens are received), but the source chain might not update its records. Eventually, a monitoring system would detect the discrepancy and trigger a manual or automated resolution process.",
      'What if a user needs to prove a transfer was completed for compliance or dispute resolution? The finalization step creates permanent records on both blockchains that can be referenced. Users can query the completedTransfers mapping or look up the TransferCompleted and CrossChainTransferFinalized events on blockchain explorers. Some bridges also provide transfer certificates or receipts that reference these on-chain records.',
      'What if the bridge needs to generate reports on transfer activity? The finalization step updates aggregate metrics like total volume and transfer count, which can be easily queried for reporting purposes. These metrics are valuable for bridge governance, performance monitoring, and business analytics. The historical transfer records also enable detailed auditing and compliance reporting.',
    ],
  },
};

// Function to generate a prompt for the LLM based on the cross-chain bridge flow and step number
export const generateCrossChainBridgePrompt = (stepNumber: number, defaultDescription?: string): string => {
  // For step 0, use the base prompt with defaultDescription
  if (stepNumber === 0 && defaultDescription) {
    return generateBasePrompt('cross-chain bridge', stepNumber, 'Introduction', defaultDescription);
  }

  if (stepNumber > 0 && stepNumber <= crossChainBridgeSteps.length) {
    const step = crossChainBridgeSteps[stepNumber - 1];
    const highlight = stepHighlightMap[stepNumber];

    // Get active nodes and edges for this step
    const activeNodes =
      highlight?.nodes?.map(nodeId => flowNodes.find(node => node.id === nodeId)).filter(Boolean) || [];

    const activeEdges =
      highlight?.edges?.map(edgeId => flowEdges.find(edge => edge.id === edgeId)).filter(Boolean) || [];

    // Create a context-rich prompt
    return `
You are an expert blockchain educator explaining a cross-chain bridge flow visualization. 
Please provide a detailed explanation for step ${stepNumber} of the cross-chain bridge flow: "${step.title}".

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
    'cross-chain bridge',
    stepNumber,
    crossChainBridgeSteps[stepNumber - 1]?.title || 'Unknown step'
  );
};

// Function to get AI explanations for the cross-chain bridge flow
export const getCrossChainBridgeAIExplanation = async (
  stepNumber: number,
  useHardcoded: boolean = false,
  defaultDescription?: string
): Promise<AIExplanationResponse> => {
  // Check if we have a hardcoded explanation for this step
  const hardcodedExplanation = crossChainBridgeHardcodedExplanations[stepNumber];

  // If useHardcoded is true, current provider has no valid API key, or hardcoded explanations are forced, return the hardcoded explanation
  if (useHardcoded || !currentProviderHasValidApiKey() || env.VITE_USE_HARDCODED_EXPLANATIONS === 'true') {
    if (env.NODE_ENV === 'development') {
      logInfo('Using hardcoded explanation for cross-chain bridge step', stepNumber);
    }
    return (
      hardcodedExplanation || {
        explanation: `AI explanation for cross-chain bridge step ${stepNumber} is not available yet.`,
        simplifiedExplanation: "This step's explanation is coming soon.",
      }
    );
  }

  try {
    // Generate a prompt for the LLM
    const prompt = generateCrossChainBridgePrompt(stepNumber, defaultDescription);

    // Call the OpenAI API
    const aiResponse = await callOpenAI(prompt);

    // If the API response doesn't include whatIfScenarios but we have hardcoded ones, use those
    if (!aiResponse.whatIfScenarios && hardcodedExplanation?.whatIfScenarios) {
      aiResponse.whatIfScenarios = hardcodedExplanation.whatIfScenarios;
      if (env.NODE_ENV === 'development') {
        logInfo('Using hardcoded whatIfScenarios for cross-chain bridge step', stepNumber);
      }
    }

    return aiResponse;
  } catch (error) {
    // Only log detailed error in development
    if (env.NODE_ENV === 'development') {
      logError('Error getting AI explanation for cross-chain bridge flow:', error);
    }

    // Fallback to hardcoded explanations if available
    if (hardcodedExplanation) {
      if (env.NODE_ENV === 'development') {
        logInfo('Falling back to hardcoded explanation for cross-chain bridge flow');
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
