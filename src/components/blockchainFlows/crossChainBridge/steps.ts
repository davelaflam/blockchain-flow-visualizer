import { Step, StepData } from '../types';

export const stepData: StepData[] = [
  {
    label: 'User Interface',
    description: 'User interacts with the bridge interface',
    link: '#step-1',
    linkLabel: 'View Interface',
  },
  {
    label: 'Pre-flight Checks',
    description: 'System performs pre-flight checks before transfer',
    link: '#step-2',
    linkLabel: 'View Checks',
  },
  {
    label: 'User Initiates Transfer',
    description: 'User initiates a cross-chain token transfer',
    link: '#step-3',
    linkLabel: 'View Initiation',
  },
  {
    label: 'Lock Tokens',
    description: 'Source chain contract locks the tokens',
    link: '#step-4',
    linkLabel: 'View Locking',
  },
  {
    label: 'Validate Transaction',
    description: 'Source chain validators validate the transaction',
    link: '#step-5',
    linkLabel: 'View Validation',
  },
  {
    label: 'Message Finalization',
    description: 'Cross-chain message is finalized and prepared',
    link: '#step-6',
    linkLabel: 'View Finalization',
  },
  {
    label: 'Send Message',
    description: 'Cross-chain message is sent to the relayer network',
    link: '#step-7',
    linkLabel: 'View Message',
  },
  {
    label: 'Process Message',
    description: 'Relayer network processes the cross-chain message',
    link: '#step-8',
    linkLabel: 'View Processing',
  },
  {
    label: 'Relayer Queueing',
    description: 'Relayers queue to deliver the message',
    link: '#step-9',
    linkLabel: 'View Queueing',
  },
  {
    label: 'Relay to Target',
    description: 'Message is relayed to the target blockchain',
    link: '#step-10',
    linkLabel: 'View Relay',
  },
  {
    label: 'Verify Message',
    description: 'Target chain validators verify the message',
    link: '#step-11',
    linkLabel: 'View Verification',
  },
  {
    label: 'Fallback Logic',
    description: 'Fallback mechanisms for failed transfers',
    link: '#step-12',
    linkLabel: 'View Fallback',
  },
  {
    label: 'Release Tokens',
    description: 'Target chain contract releases tokens to recipient',
    link: '#step-13',
    linkLabel: 'View Release',
  },
  {
    label: 'Recipient Receives Tokens',
    description: 'Recipient receives tokens on the target chain',
    link: '#step-14',
    linkLabel: 'View Receipt',
  },
  {
    label: 'Complete Transfer',
    description: 'Cross-chain transfer is completed and finalized',
    link: '#step-15',
    linkLabel: 'View Completion',
  },
];

export const crossChainBridgeSteps: Step[] = [
  // 1. User Interface
  {
    title: '1. User Interface',
    description: 'The user interacts with the bridge interface to prepare for a cross-chain token transfer.',
    what: 'User connects wallet and interacts with the bridge UI to select tokens, amount, and destination chain.',
    why: 'Provides a user-friendly interface for initiating cross-chain transfers and visualizing the process.',
    codeSnippet:
      '// User interface component\nfunction BridgeInterface() {\n  const [selectedToken, setSelectedToken] = useState(null);\n  const [amount, setAmount] = useState("");\n  const [targetChain, setTargetChain] = useState(null);\n  const [recipient, setRecipient] = useState("");\n  \n  // Connect wallet\n  const connectWallet = async () => {\n    const provider = await detectEthereumProvider();\n    if (provider) {\n      const accounts = await provider.request({ method: "eth_requestAccounts" });\n      setWalletAddress(accounts[0]);\n      loadUserBalances(accounts[0]);\n    }\n  };\n  \n  // Submit transfer\n  const submitTransfer = async () => {\n    if (!validateInputs()) return;\n    \n    // Prepare transaction\n    const tx = await bridgeContract.prepareTransfer(\n      selectedToken,\n      parseUnits(amount, tokenDecimals),\n      targetChain.id,\n      recipient || walletAddress\n    );\n    \n    // Show confirmation dialog\n    showConfirmationDialog(tx);\n  };\n  \n  return (\n    <BridgeContainer>\n      <TokenSelector tokens={availableTokens} onSelect={setSelectedToken} />\n      <AmountInput value={amount} onChange={setAmount} max={userBalance} />\n      <ChainSelector chains={availableChains} onSelect={setTargetChain} />\n      <RecipientInput value={recipient} onChange={setRecipient} />\n      <ActionButton onClick={submitTransfer} disabled={!isValid} />\n    </BridgeContainer>\n  );\n}',
    label: 'User Interface',
  },

  // 2. Pre-flight Checks
  {
    title: '2. Pre-flight Checks',
    description: 'The system performs pre-flight checks before initiating the cross-chain transfer.',
    what: 'Checks gas fees, token allowance, bridge availability, and liquidity on the target chain.',
    why: 'Ensures the transfer can be completed successfully before the user commits to the transaction.',
    codeSnippet:
      '// Pre-flight checks before transfer\nfunction performPreFlightChecks(\n  address token,\n  uint256 amount,\n  uint256 targetChainId,\n  address sender\n) public view returns (bool, string memory) {\n  // Check if bridge is operational\n  if (!bridgeStatus.isOperational) {\n    return (false, "Bridge is currently not operational");\n  }\n  \n  // Check if target chain is supported\n  if (!supportedChains[targetChainId]) {\n    return (false, "Target chain not supported");\n  }\n  \n  // Check token allowance\n  uint256 allowance = IERC20(token).allowance(sender, address(this));\n  if (allowance < amount) {\n    return (false, "Insufficient token allowance");\n  }\n  \n  // Check user balance\n  uint256 balance = IERC20(token).balanceOf(sender);\n  if (balance < amount) {\n    return (false, "Insufficient token balance");\n  }\n  \n  // Check target chain liquidity\n  uint256 targetChainLiquidity = getTargetChainLiquidity(targetChainId, token);\n  if (targetChainLiquidity < amount) {\n    return (false, "Insufficient liquidity on target chain");\n  }\n  \n  // Estimate gas fees\n  uint256 estimatedGasFee = estimateGasFee(targetChainId);\n  \n  return (true, string(abi.encodePacked("Estimated gas fee: ", estimatedGasFee)));\n}',
    label: 'Pre-flight Checks',
  },

  // 3. User Initiates Cross-Chain Transfer
  {
    title: '3. User Initiates Cross-Chain Transfer',
    description: 'The user initiates a cross-chain token transfer from the source blockchain to the target blockchain.',
    what: 'User interaction with the source chain bridge contract to start the cross-chain transfer process.',
    why: 'Initiates the cross-chain token flow with user consent and specifies the destination address and amount.',
    codeSnippet:
      '// User initiates cross-chain transfer\nfunction initiateTransfer(\n  address targetAddress,\n  uint256 amount,\n  uint256 targetChainId\n) external {\n  require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");\n  bytes32 transferId = keccak256(abi.encode(msg.sender, targetAddress, amount, targetChainId, nonce++));\n  transfers[transferId] = Transfer({\n    sender: msg.sender,\n    recipient: targetAddress,\n    amount: amount,\n    targetChainId: targetChainId,\n    status: TransferStatus.INITIATED\n  });\n  emit TransferInitiated(transferId, msg.sender, targetAddress, amount, targetChainId);\n}',
    label: 'User Initiates Transfer',
  },

  // 4. Source Chain Contract Locks Tokens
  {
    title: '4. Source Chain Contract Locks Tokens',
    description: 'The source chain bridge contract locks the tokens to ensure they cannot be double-spent.',
    what: 'The tokens are locked in the bridge contract on the source chain.',
    why: 'Prevents double-spending and ensures the tokens are reserved for the cross-chain transfer.',
    codeSnippet:
      '// Lock tokens in the bridge contract\nfunction lockTokens(bytes32 transferId) internal {\n  Transfer storage transfer = transfers[transferId];\n  require(transfer.status == TransferStatus.INITIATED, "Invalid transfer status");\n  \n  // Lock the tokens by updating the transfer status\n  transfer.status = TransferStatus.LOCKED;\n  \n  // Update locked token balance\n  lockedTokens += transfer.amount;\n  \n  emit TokensLocked(transferId, transfer.amount);\n}',
    label: 'Lock Tokens',
  },

  // 5. Source Validators Validate Transaction
  {
    title: '5. Source Validators Validate Transaction',
    description: 'Validators on the source chain validate the transaction to ensure its legitimacy.',
    what: 'A network of validators verifies the transaction details and signatures.',
    why: 'Ensures the transaction is legitimate and authorized by the user before proceeding with the cross-chain transfer.',
    codeSnippet:
      '// Validators validate the transaction\nfunction validateTransaction(bytes32 transferId, bytes memory signature) external onlyValidator {\n  Transfer storage transfer = transfers[transferId];\n  require(transfer.status == TransferStatus.LOCKED, "Tokens not locked");\n  \n  // Verify the signature is valid\n  bytes32 messageHash = keccak256(abi.encode(transferId, transfer.sender, transfer.recipient, transfer.amount));\n  require(isValidSignature(messageHash, signature), "Invalid signature");\n  \n  // Record validator\'s validation\n  validations[transferId][msg.sender] = true;\n  validationCount[transferId]++;\n  \n  // Check if enough validators have validated\n  if (validationCount[transferId] >= requiredValidations) {\n    transfer.status = TransferStatus.VALIDATED;\n    emit TransactionValidated(transferId);\n  }\n}',
    label: 'Validate Transaction',
  },

  // 6. Message Finalization
  {
    title: '6. Message Finalization',
    description: 'The cross-chain message is finalized and prepared for transmission.',
    what: 'Creating message hash, signing the payload, and preparing it for the relayer network.',
    why: 'Ensures the message is properly formatted and secured before transmission to the relayer network.',
    codeSnippet:
      '// Finalize cross-chain message\nfunction finalizeMessage(bytes32 transferId) internal returns (bytes memory) {\n  Transfer storage transfer = transfers[transferId];\n  require(transfer.status == TransferStatus.VALIDATED, "Not validated");\n  \n  // Create the message payload\n  bytes memory payload = abi.encode(\n    transferId,\n    transfer.sender,\n    transfer.recipient,\n    transfer.amount,\n    transfer.targetChainId,\n    block.timestamp,\n    sourceChainId\n  );\n  \n  // Hash the message for signing\n  bytes32 messageHash = keccak256(payload);\n  \n  // Sign the message with the bridge\'s private key\n  bytes memory signature = signMessage(messageHash);\n  \n  // Combine payload and signature\n  bytes memory finalizedMessage = abi.encode(payload, signature);\n  \n  // Record message hash to prevent replay\n  processedMessageHashes[messageHash] = true;\n  \n  emit MessageFinalized(transferId, messageHash);\n  return finalizedMessage;\n}',
    label: 'Message Finalization',
  },

  // 7. Message Sent to Relayer Network
  {
    title: '7. Message Sent to Relayer Network',
    description: 'After validation, a cross-chain message is sent to the relayer network.',
    what: 'The source chain contract creates and emits a cross-chain message containing transfer details.',
    why: 'Communicates the transfer details to the relayer network which will forward it to the target chain.',
    codeSnippet:
      '// Send message to relayer network\nfunction sendCrossChainMessage(bytes32 transferId) external onlyAuthorized {\n  Transfer storage transfer = transfers[transferId];\n  require(transfer.status == TransferStatus.VALIDATED, "Not validated");\n  \n  // Create the cross-chain message\n  bytes memory message = abi.encode(\n    transferId,\n    transfer.sender,\n    transfer.recipient,\n    transfer.amount,\n    transfer.targetChainId\n  );\n  \n  // Update status\n  transfer.status = TransferStatus.MESSAGE_SENT;\n  \n  // Emit event for relayers to pick up\n  emit CrossChainMessageSent(transferId, message, transfer.targetChainId);\n}',
    label: 'Send Message',
  },

  // 8. Relayer Network Processes Message
  {
    title: '8. Relayer Network Processes Message',
    description: 'The relayer network processes and validates the cross-chain message.',
    what: 'Relayers pick up the message, validate its authenticity, and prepare to relay it to the target chain.',
    why: 'Ensures the message is valid and properly formatted before relaying it to the target blockchain.',
    codeSnippet:
      '// Relayer processes the message\nfunction processMessage(bytes memory message, bytes[] memory signatures) external {\n  // Decode the message\n  (bytes32 transferId, address sender, address recipient, uint256 amount, uint256 targetChainId) = \n    abi.decode(message, (bytes32, address, address, uint256, uint256));\n  \n  // Verify the message hasn\'t been processed\n  require(!processedMessages[keccak256(message)], "Already processed");\n  \n  // Verify signatures from source chain validators\n  require(verifySignatures(keccak256(message), signatures), "Invalid signatures");\n  \n  // Mark as processed\n  processedMessages[keccak256(message)] = true;\n  \n  // Prepare for relay to target chain\n  pendingRelays[transferId] = PendingRelay({\n    message: message,\n    signatures: signatures,\n    status: RelayStatus.PROCESSED\n  });\n  \n  emit MessageProcessed(transferId, targetChainId);\n}',
    label: 'Process Message',
  },

  // 9. Relayer Queueing
  {
    title: '9. Relayer Queueing',
    description: 'Multiple relayers queue to deliver the cross-chain message to the target chain.',
    what: 'Relayers compete to deliver the message, with selection based on performance and stake.',
    why: 'Ensures reliable message delivery through competition and incentivizes relayers to provide fast service.',
    codeSnippet:
      '// Relayer queueing and selection\nfunction queueForRelay(bytes32 transferId, uint256 gasPrice) external onlyRelayer {\n  PendingRelay storage relay = pendingRelays[transferId];\n  require(relay.status == RelayStatus.PROCESSED, "Not ready for relay");\n  \n  // Add relayer to queue\n  relayerQueue[transferId].push(RelayerInfo({\n    relayer: msg.sender,\n    timestamp: block.timestamp,\n    gasPrice: gasPrice,\n    stake: getRelayerStake(msg.sender)\n  }));\n  \n  // Calculate relayer score based on performance history, stake, and gas price\n  uint256 score = calculateRelayerScore(\n    msg.sender,\n    getRelayerPerformance(msg.sender),\n    getRelayerStake(msg.sender),\n    gasPrice\n  );\n  \n  // Update relayer scores\n  relayerScores[transferId][msg.sender] = score;\n  \n  // Select best relayer if enough have queued\n  if (relayerQueue[transferId].length >= minRelayersForSelection) {\n    selectRelayer(transferId);\n  }\n  \n  emit RelayerQueued(transferId, msg.sender, score);\n}',
    label: 'Relayer Queueing',
  },

  // 10. Message Relayed to Target Chain
  {
    title: '10. Message Relayed to Target Chain',
    description: 'The processed message is relayed to the target blockchain.',
    what: 'Relayers submit the cross-chain message to the bridge contract on the target chain.',
    why: 'Transfers the validated message to the target blockchain to continue the cross-chain transfer process.',
    codeSnippet:
      '// Relay message to target chain\nfunction relayMessageToTargetChain(bytes32 transferId) external onlyRelayer {\n  PendingRelay storage relay = pendingRelays[transferId];\n  require(relay.status == RelayStatus.PROCESSED, "Not processed");\n  \n  // Update status\n  relay.status = RelayStatus.RELAYED;\n  \n  // Call the target chain contract (simplified for example)\n  ITargetBridge(targetBridgeAddress).receiveCrossChainMessage(\n    relay.message,\n    relay.signatures\n  );\n  \n  emit MessageRelayed(transferId);\n}',
    label: 'Relay to Target',
  },

  // 11. Target Validators Verify Message
  {
    title: '11. Target Validators Verify Message',
    description: 'Validators on the target chain verify the cross-chain message.',
    what: 'Target chain validators check the message authenticity and signatures.',
    why: 'Ensures the message is legitimate and was properly validated on the source chain before releasing tokens.',
    codeSnippet:
      '// Target validators verify the message\nfunction verifyMessage(\n  bytes memory message,\n  bytes[] memory sourceSignatures\n) external onlyValidator {\n  bytes32 messageHash = keccak256(message);\n  \n  // Verify the message hasn\'t been processed\n  require(!processedMessages[messageHash], "Already processed");\n  \n  // Verify signatures from source chain validators\n  require(verifySourceChainSignatures(messageHash, sourceSignatures), "Invalid signatures");\n  \n  // Record validator\'s verification\n  verifications[messageHash][msg.sender] = true;\n  verificationCount[messageHash]++;\n  \n  // Check if enough validators have verified\n  if (verificationCount[messageHash] >= requiredVerifications) {\n    processedMessages[messageHash] = true;\n    emit MessageVerified(messageHash);\n    \n    // Decode the message\n    (bytes32 transferId, address sender, address recipient, uint256 amount, uint256 sourceChainId) = \n      abi.decode(message, (bytes32, address, address, uint256, uint256));\n    \n    // Store the verified transfer\n    verifiedTransfers[transferId] = VerifiedTransfer({\n      sender: sender,\n      recipient: recipient,\n      amount: amount,\n      sourceChainId: sourceChainId,\n      status: TransferStatus.VERIFIED\n    });\n  }\n}',
    label: 'Verify Message',
  },

  // 12. Fallback Logic
  {
    title: '12. Fallback Logic',
    description: 'Fallback mechanisms are activated if the cross-chain transfer encounters issues.',
    what: 'Handles timeouts, retries, and recovery for failed message delivery or execution.',
    why: 'Ensures the cross-chain transfer can recover from failures and provides users with recourse options.',
    codeSnippet:
      '// Fallback logic for failed transfers\nfunction handleFailedTransfer(bytes32 transferId) external {\n  // Check if transfer is timed out\n  Transfer storage transfer = transfers[transferId];\n  if (block.timestamp > transfer.timestamp + transferTimeout) {\n    // Mark as failed\n    transfer.status = TransferStatus.FAILED;\n    \n    // Try automatic retry first\n    if (retryCount[transferId] < maxRetries) {\n      retryCount[transferId]++;\n      emit TransferRetry(transferId, retryCount[transferId]);\n      \n      // Queue for retry\n      retryQueue.push(transferId);\n      return;\n    }\n    \n    // If max retries reached, allow refund\n    if (transfer.status != TransferStatus.REFUNDED) {\n      transfer.status = TransferStatus.REFUND_READY;\n      emit RefundReady(transferId, transfer.sender, transfer.amount);\n    }\n  }\n}\n\n// Process refund for failed transfer\nfunction processRefund(bytes32 transferId) external {\n  Transfer storage transfer = transfers[transferId];\n  require(transfer.status == TransferStatus.REFUND_READY, "Not ready for refund");\n  require(msg.sender == transfer.sender, "Only sender can refund");\n  \n  // Update status to prevent re-entrancy\n  transfer.status = TransferStatus.REFUNDING;\n  \n  // Return tokens to sender\n  require(token.transfer(transfer.sender, transfer.amount), "Refund failed");\n  \n  // Update status\n  transfer.status = TransferStatus.REFUNDED;\n  \n  // Update locked token balance\n  lockedTokens -= transfer.amount;\n  \n  emit RefundProcessed(transferId, transfer.sender, transfer.amount);\n}',
    label: 'Fallback Logic',
  },

  // 13. Target Chain Contract Releases Tokens
  {
    title: '13. Target Chain Contract Releases Tokens',
    description: 'The target chain bridge contract releases tokens to the recipient.',
    what: 'Equivalent tokens are minted or released from the bridge contract on the target chain.',
    why: 'Completes the token transfer on the target chain, making the tokens available to the recipient.',
    codeSnippet:
      '// Release tokens to recipient\nfunction releaseTokens(bytes32 transferId) external {\n  VerifiedTransfer storage transfer = verifiedTransfers[transferId];\n  require(transfer.status == TransferStatus.VERIFIED, "Not verified");\n  \n  // Update status to prevent re-entrancy\n  transfer.status = TransferStatus.PROCESSING;\n  \n  // Mint or transfer tokens to the recipient\n  require(token.mint(transfer.recipient, transfer.amount), "Mint failed");\n  \n  // Update status\n  transfer.status = TransferStatus.COMPLETED;\n  \n  emit TokensReleased(transferId, transfer.recipient, transfer.amount);\n}',
    label: 'Target Chain Contract Releases Tokens',
  },

  // 14. Recipient Receives Tokens
  {
    title: '14. Recipient Receives Tokens',
    description: 'The recipient receives the tokens on the target blockchain.',
    what: "Tokens are credited to the recipient's wallet on the target chain.",
    why: 'Completes the user-facing part of the cross-chain transfer, making funds available to the recipient.',
    codeSnippet:
      '// Event emitted when recipient receives tokens\nevent TokensReceived(\n  bytes32 indexed transferId,\n  address indexed recipient,\n  uint256 amount,\n  uint256 timestamp\n);\n\n// Internal function called after tokens are released\nfunction notifyRecipient(bytes32 transferId) internal {\n  VerifiedTransfer storage transfer = verifiedTransfers[transferId];\n  require(transfer.status == TransferStatus.COMPLETED, "Not completed");\n  \n  // Emit event for recipient notification\n  emit TokensReceived(\n    transferId,\n    transfer.recipient,\n    transfer.amount,\n    block.timestamp\n  );\n  \n  // Optional: Call recipient contract if it\'s a contract address\n  if (isContract(transfer.recipient)) {\n    try ITokenRecipient(transfer.recipient).onTokenReceived(\n      transferId,\n      transfer.sender,\n      transfer.amount\n    ) {} catch {}\n  }\n}',
    label: 'Recipient Receives Tokens',
  },

  // 15. Complete Transfer
  {
    title: '15. Complete Transfer',
    description: 'The cross-chain transfer is completed and finalized on both chains.',
    what: 'The transfer is marked as completed in the system and all relevant data is stored for reference.',
    why: 'Provides closure to the cross-chain transfer process and maintains a record for auditing and reference.',
    codeSnippet:
      '// Complete the cross-chain transfer\nfunction completeTransfer(bytes32 transferId) external {\n  // On source chain\n  if (transfers[transferId].status == TransferStatus.MESSAGE_SENT) {\n    transfers[transferId].status = TransferStatus.COMPLETED;\n    emit TransferCompleted(transferId, "source");\n  }\n  \n  // On target chain\n  if (verifiedTransfers[transferId].status == TransferStatus.COMPLETED) {\n    // Move to historical records\n    completedTransfers[transferId] = verifiedTransfers[transferId];\n    delete verifiedTransfers[transferId];\n    emit TransferCompleted(transferId, "target");\n  }\n  \n  // Update system metrics\n  totalCompletedTransfers++;\n  totalTransferVolume += getTransferAmount(transferId);\n  \n  // Emit final completion event\n  emit CrossChainTransferFinalized(transferId, block.timestamp);\n}',
    label: 'Complete Transfer',
  },
];
