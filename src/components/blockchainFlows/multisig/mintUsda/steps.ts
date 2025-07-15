import { Step, StepData } from '../../types';

export const multisigMintingSteps: Step[] = [
  {
    title: '1. User Initiates Transfer',
    description: 'The user connects their wallet and initiates a bridge transfer.',
    what: 'User interaction with the dApp to start the bridging process.',
    why: 'This action starts the cross-chain minting flow.',
    codeSnippet:
      '// User initiates bridge transfer\nfunction initiateTransfer(address recipient, uint256 amount) external {\n  require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");\n  bytes32 transferId = keccak256(abi.encode(msg.sender, recipient, amount, block.timestamp));\n  transfers[transferId] = Transfer({\n    sender: msg.sender,\n    recipient: recipient,\n    amount: amount,\n    status: TransferStatus.INITIATED\n  });\n  emit TransferInitiated(transferId, msg.sender, recipient, amount);\n}',
    label: 'User Initiates Transfer',
  },
  {
    title: '2. Lock Event Emitted',
    description: 'The bridge contract emits a lock event on Ethereum.',
    what: 'A smart contract event is emitted when the user locks funds.',
    why: 'This event signals the start of the minting process to off-chain relayers.',
    codeSnippet:
      '// Lock event emitted\nevent TokensLocked(\n  bytes32 indexed transferId,\n  address indexed sender,\n  uint256 amount,\n  uint256 timestamp\n);\n\n// Internal function to lock tokens\nfunction lockTokens(bytes32 transferId) internal {\n  Transfer storage transfer = transfers[transferId];\n  require(transfer.status == TransferStatus.INITIATED, "Invalid transfer status");\n  \n  // Lock the tokens by updating the transfer status\n  transfer.status = TransferStatus.LOCKED;\n  \n  // Emit lock event for relayers to pick up\n  emit TokensLocked(transferId, transfer.sender, transfer.amount, block.timestamp);\n}',
    label: 'Lock Event Emitted',
  },
  {
    title: '3. Event Sent to AO Event Pool',
    description: 'The lock event is detected and sent to the AO Event Pool.',
    what: 'Relayer detects the event and forwards it to the AO network.',
    why: 'Brings the event into the AO ecosystem for further processing.',
    codeSnippet:
      '// Relayer code to detect and forward events\nasync function monitorAndRelayEvents() {\n  // Set up event listener for TokensLocked events\n  bridgeContract.on("TokensLocked", async (transferId, sender, amount, timestamp) => {\n    console.log(`Detected TokensLocked event: ${transferId}`);\n    \n    // Format the event data for AO\n    const eventData = {\n      transferId: transferId,\n      sender: sender,\n      amount: amount.toString(),\n      timestamp: timestamp.toString(),\n      chainId: CHAIN_ID\n    };\n    \n    // Send to AO Event Pool\n    try {\n      const result = await aoClient.sendEvent({\n        process: "event-pool",\n        tags: [{ name: "Event-Type", value: "TokensLocked" }],\n        data: JSON.stringify(eventData)\n      });\n      console.log(`Event sent to AO Event Pool: ${result.eventId}`);\n    } catch (error) {\n      console.error("Failed to send event to AO:", error);\n    }\n  });\n}',
    label: 'Event Sent to AO Event Pool',
  },
  {
    title: '4. AO Event Pool Processes Event',
    description: 'The AO Event Pool processes the event and forwards it to the AO USDA EventHandler.',
    what: 'The event is validated and routed to the correct handler.',
    why: 'Ensures only valid events are processed for minting.',
    codeSnippet:
      '// AO Event Pool Process\nfunction handle(event) {\n  // Extract event data\n  const eventData = JSON.parse(event.data);\n  const eventType = event.tags.find(tag => tag.name === "Event-Type")?.value;\n  \n  // Validate event\n  if (!eventType || !eventData.transferId) {\n    console.error("Invalid event format");\n    return { status: "rejected", reason: "Invalid event format" };\n  }\n  \n  // Route event to appropriate handler\n  if (eventType === "TokensLocked") {\n    // Forward to USDA EventHandler\n    Processes.send({\n      process: "usda-event-handler",\n      tags: event.tags,\n      data: event.data\n    });\n    \n    return { status: "processed", handler: "usda-event-handler" };\n  }\n  \n  return { status: "ignored", reason: "Unsupported event type" };\n}',
    label: 'AO Event Pool Processes Event',
  },
  {
    title: '5. AO USDA EventHandler Prepares Proposal',
    description: 'The AO USDA EventHandler prepares a mint proposal for the multisig group.',
    what: 'Handler creates a proposal message for the multisig contract.',
    why: 'Formalizes the mint request for multisig approval.',
    codeSnippet:
      '// USDA EventHandler Process\nfunction handle(event) {\n  // Parse event data\n  const eventData = JSON.parse(event.data);\n  \n  // Validate the event data\n  if (!validateEventData(eventData)) {\n    return { status: "rejected", reason: "Invalid event data" };\n  }\n  \n  // Create mint proposal\n  const proposal = {\n    id: eventData.transferId,\n    type: "mint",\n    sender: eventData.sender,\n    amount: eventData.amount,\n    timestamp: eventData.timestamp,\n    chainId: eventData.chainId,\n    status: "pending"\n  };\n  \n  // Store proposal in state\n  State.proposals[proposal.id] = proposal;\n  \n  // Send proposal to multisig\n  Processes.send({\n    process: "multisig-proposer",\n    tags: [{ name: "Proposal-Type", value: "mint" }],\n    data: JSON.stringify(proposal)\n  });\n  \n  return { status: "proposal-created", proposalId: proposal.id };\n}',
    label: 'AO USDA EventHandler Prepares Proposal',
  },
  {
    title: '6. Multisig Proposer Receives Proposal',
    description: 'The multisig contract receives the mint proposal.',
    what: 'Proposal is recorded and awaits votes.',
    why: 'Multisig must approve before minting can proceed.',
    codeSnippet:
      '// Multisig Proposer Process\nfunction handle(event) {\n  // Parse proposal data\n  const proposal = JSON.parse(event.data);\n  \n  // Validate proposal\n  if (!proposal.id || !proposal.type || !proposal.amount) {\n    return { status: "rejected", reason: "Invalid proposal format" };\n  }\n  \n  // Create multisig proposal\n  const multisigProposal = {\n    id: proposal.id,\n    type: proposal.type,\n    data: proposal,\n    requiredSignatures: 2, // Require 2 signatures for approval\n    signatures: {},\n    status: "pending",\n    createdAt: Date.now()\n  };\n  \n  // Store in multisig state\n  State.proposals[multisigProposal.id] = multisigProposal;\n  \n  // Notify voters\n  notifyVoters(multisigProposal);\n  \n  return { status: "proposal-received", proposalId: multisigProposal.id };\n}\n\n// Helper function to notify voters\nfunction notifyVoters(proposal) {\n  const voters = State.voters;\n  for (const voter of voters) {\n    Processes.send({\n      process: `voter-${voter}`,\n      tags: [{ name: "Action", value: "Vote-Required" }],\n      data: JSON.stringify({ proposalId: proposal.id })\n    });\n  }\n}',
    label: 'Multisig Proposer Receives Proposal',
  },
  {
    title: '7. Voter 1 Votes',
    description: 'Voter 1 submits their vote for the proposal.',
    what: 'A signer in the multisig group votes on the proposal.',
    why: 'Multiple votes are required for security.',
    codeSnippet:
      '// Voter 1 Process\nfunction handle(event) {\n  // Parse notification\n  const notification = JSON.parse(event.data);\n  const proposalId = notification.proposalId;\n  \n  // Get proposal from multisig state\n  const proposal = Processes.read({\n    process: "multisig-proposer",\n    key: `proposals.${proposalId}`\n  });\n  \n  if (!proposal) {\n    return { status: "error", reason: "Proposal not found" };\n  }\n  \n  // Verify proposal and perform due diligence\n  if (!verifyProposal(proposal)) {\n    return { status: "rejected", reason: "Proposal verification failed" };\n  }\n  \n  // Sign the proposal\n  const signature = {\n    voter: "voter1",\n    approved: true,\n    timestamp: Date.now(),\n    signature: signData(proposal.id) // Sign with voter\'s key\n  };\n  \n  // Send vote to multisig\n  Processes.send({\n    process: "multisig-proposer",\n    tags: [{ name: "Action", value: "Vote" }],\n    data: JSON.stringify({\n      proposalId: proposalId,\n      vote: signature\n    })\n  });\n  \n  return { status: "vote-submitted", voter: "voter1", proposalId: proposalId };\n}',
    label: 'Voter 1 Votes',
  },
  {
    title: '8. Voter 2 Votes',
    description: 'Voter 2 submits their vote for the proposal.',
    what: 'Another signer in the multisig group votes on the proposal.',
    why: 'Ensures consensus among signers.',
    codeSnippet:
      '// Voter 2 Process\nfunction handle(event) {\n  // Parse notification\n  const notification = JSON.parse(event.data);\n  const proposalId = notification.proposalId;\n  \n  // Get proposal from multisig state\n  const proposal = Processes.read({\n    process: "multisig-proposer",\n    key: `proposals.${proposalId}`\n  });\n  \n  if (!proposal) {\n    return { status: "error", reason: "Proposal not found" };\n  }\n  \n  // Verify proposal and perform due diligence\n  if (!verifyProposal(proposal)) {\n    return { status: "rejected", reason: "Proposal verification failed" };\n  }\n  \n  // Sign the proposal\n  const signature = {\n    voter: "voter2",\n    approved: true,\n    timestamp: Date.now(),\n    signature: signData(proposal.id) // Sign with voter\'s key\n  };\n  \n  // Send vote to multisig\n  Processes.send({\n    process: "multisig-proposer",\n    tags: [{ name: "Action", value: "Vote" }],\n    data: JSON.stringify({\n      proposalId: proposalId,\n      vote: signature\n    })\n  });\n  \n  return { status: "vote-submitted", voter: "voter2", proposalId: proposalId };\n}',
    label: 'Voter 2 Votes',
  },
  {
    title: '9. Multisig Tallies Votes',
    description: 'The multisig contract tallies the votes.',
    what: 'Votes are counted to determine if the proposal passes.',
    why: 'Only approved proposals should trigger minting.',
    codeSnippet:
      '// Multisig vote handler\nfunction handleVote(event) {\n  // Parse vote data\n  const voteData = JSON.parse(event.data);\n  const proposalId = voteData.proposalId;\n  const vote = voteData.vote;\n  \n  // Get proposal\n  const proposal = State.proposals[proposalId];\n  if (!proposal) {\n    return { status: "error", reason: "Proposal not found" };\n  }\n  \n  // Verify voter signature\n  if (!verifySignature(vote.voter, proposalId, vote.signature)) {\n    return { status: "rejected", reason: "Invalid signature" };\n  }\n  \n  // Record vote\n  proposal.signatures[vote.voter] = vote;\n  \n  // Count votes\n  const signatureCount = Object.keys(proposal.signatures).length;\n  \n  // Check if we have enough signatures\n  if (signatureCount >= proposal.requiredSignatures) {\n    // Update proposal status\n    proposal.status = "approved";\n    \n    // Save updated proposal\n    State.proposals[proposalId] = proposal;\n    \n    // Trigger next step in the process\n    Processes.send({\n      process: "usda-token-process",\n      tags: [{ name: "Action", value: "Mint-Approved" }],\n      data: JSON.stringify(proposal)\n    });\n    \n    return { status: "proposal-approved", proposalId: proposalId };\n  }\n  \n  // Not enough signatures yet, just update the proposal\n  State.proposals[proposalId] = proposal;\n  \n  return { status: "vote-recorded", proposalId: proposalId, currentVotes: signatureCount };\n}',
    label: 'Multisig Tallies Votes',
  },
  {
    title: '10. Mint Approved Sent to USDA Token Process',
    description: 'The multisig contract sends a Mint Approved message to the USDA Token Process.',
    what: 'A message is sent to trigger minting.',
    why: 'This is the final approval before minting.',
    codeSnippet:
      '// Send mint approval to USDA Token Process\nfunction sendMintApproval(proposal) {\n  // Format the mint approval message\n  const mintApproval = {\n    proposalId: proposal.id,\n    type: "mint-approval",\n    data: {\n      sender: proposal.data.sender,\n      amount: proposal.data.amount,\n      signatures: Object.values(proposal.signatures).map(sig => ({\n        signer: sig.voter,\n        signature: sig.signature,\n        timestamp: sig.timestamp\n      }))\n    },\n    timestamp: Date.now()\n  };\n  \n  // Send to USDA Token Process\n  Processes.send({\n    process: "usda-token-process",\n    tags: [\n      { name: "Action", value: "Mint-Approved" },\n      { name: "ProposalId", value: proposal.id }\n    ],\n    data: JSON.stringify(mintApproval)\n  });\n  \n  // Update proposal status\n  proposal.status = "mint-approval-sent";\n  State.proposals[proposal.id] = proposal;\n  \n  return { status: "mint-approval-sent", proposalId: proposal.id };\n}',
    label: 'Mint Approved Sent',
  },
  {
    title: '11. AO Handler Sends Mint to USDA Token Process',
    description: 'The AO Handler sends a Mint message to the USDA Token Process.',
    what: 'Handler relays the mint instruction.',
    why: 'Ensures the minting action is executed.',
    codeSnippet:
      '// AO Handler sends mint instruction\nfunction handleMintApproval(event) {\n  // Parse mint approval\n  const mintApproval = JSON.parse(event.data);\n  const proposalId = mintApproval.proposalId;\n  \n  // Verify signatures\n  if (!verifyMintApprovalSignatures(mintApproval)) {\n    return { status: "rejected", reason: "Invalid signatures" };\n  }\n  \n  // Prepare mint instruction\n  const mintInstruction = {\n    id: generateUniqueId(),\n    proposalId: proposalId,\n    type: "mint",\n    recipient: mintApproval.data.sender,\n    amount: mintApproval.data.amount,\n    approvedBy: mintApproval.data.signatures.map(sig => sig.signer),\n    timestamp: Date.now()\n  };\n  \n  // Send mint instruction to token process\n  Processes.send({\n    process: "usda-token-process",\n    tags: [\n      { name: "Action", value: "Mint" },\n      { name: "ProposalId", value: proposalId }\n    ],\n    data: JSON.stringify(mintInstruction)\n  });\n  \n  return { status: "mint-instruction-sent", mintId: mintInstruction.id };\n}',
    label: 'AO Handler Sends Mint',
  },
  {
    title: '12. USDA Token Process Mints Tokens',
    description: 'The USDA Token Process mints the tokens for the user.',
    what: 'Tokens are created and assigned to the user.',
    why: 'Completes the minting process.',
    codeSnippet:
      '// USDA Token Process mints tokens\nfunction handleMint(event) {\n  // Parse mint instruction\n  const mintInstruction = JSON.parse(event.data);\n  \n  // Validate mint instruction\n  if (!validateMintInstruction(mintInstruction)) {\n    return { status: "rejected", reason: "Invalid mint instruction" };\n  }\n  \n  // Mint tokens\n  const mintResult = mintTokens(mintInstruction.recipient, mintInstruction.amount);\n  \n  if (!mintResult.success) {\n    return { status: "error", reason: mintResult.error };\n  }\n  \n  // Update token balances\n  State.balances[mintInstruction.recipient] = \n    (State.balances[mintInstruction.recipient] || 0) + parseInt(mintInstruction.amount);\n  \n  // Update total supply\n  State.totalSupply = (State.totalSupply || 0) + parseInt(mintInstruction.amount);\n  \n  // Record mint transaction\n  const mintRecord = {\n    id: mintInstruction.id,\n    proposalId: mintInstruction.proposalId,\n    recipient: mintInstruction.recipient,\n    amount: mintInstruction.amount,\n    timestamp: Date.now(),\n    txHash: mintResult.txHash\n  };\n  \n  State.mintTransactions[mintInstruction.id] = mintRecord;\n  \n  // Send credit notice\n  Processes.send({\n    process: "notification-service",\n    tags: [{ name: "Action", value: "Credit-Notice" }],\n    data: JSON.stringify(mintRecord)\n  });\n  \n  return { status: "tokens-minted", mintId: mintInstruction.id, txHash: mintResult.txHash };\n}',
    label: 'USDA Token Process Mints',
  },
  {
    title: '13. Credit Notice Sent to Recipient',
    description: 'A credit notice is sent to the recipient to notify them of the minted tokens.',
    what: 'Notification is sent to the user and relayer.',
    why: 'Provides confirmation and transparency.',
    codeSnippet:
      '// Send credit notice to recipient\nfunction sendCreditNotice(mintRecord) {\n  // Format credit notice\n  const creditNotice = {\n    type: "credit-notice",\n    recipient: mintRecord.recipient,\n    amount: mintRecord.amount,\n    txHash: mintRecord.txHash,\n    timestamp: Date.now(),\n    message: `${mintRecord.amount} USDA tokens have been minted to your account.`\n  };\n  \n  // Send notification to user\'s wallet\n  try {\n    // Send to user\'s notification endpoint\n    const userEndpoint = getUserNotificationEndpoint(mintRecord.recipient);\n    if (userEndpoint) {\n      fetch(userEndpoint, {\n        method: "POST",\n        headers: { "Content-Type": "application/json" },\n        body: JSON.stringify(creditNotice)\n      });\n    }\n    \n    // Send to relayer for confirmation\n    Processes.send({\n      process: "relayer-service",\n      tags: [{ name: "Action", value: "Mint-Completed" }],\n      data: JSON.stringify({\n        proposalId: mintRecord.proposalId,\n        mintId: mintRecord.id,\n        recipient: mintRecord.recipient,\n        amount: mintRecord.amount,\n        txHash: mintRecord.txHash\n      })\n    });\n    \n    // Record notification in state\n    State.notifications[mintRecord.id] = {\n      ...creditNotice,\n      status: "sent"\n    };\n    \n    return { status: "credit-notice-sent", mintId: mintRecord.id };\n  } catch (error) {\n    return { status: "error", reason: "Failed to send credit notice", error: error.message };\n  }\n}',
    label: 'Credit Notice Sent',
  },
];

export const stepData: StepData[] = [
  { label: 'User Initiates Transfer', description: 'User starts the bridge process.' },
  { label: 'Lock Event Emitted', description: 'Bridge contract emits lock event.' },
  { label: 'Event Sent to AO Event Pool', description: 'Event forwarded to AO.' },
  { label: 'AO Event Pool Processes Event', description: 'Event processed and routed.' },
  { label: 'AO USDA EventHandler Prepares Proposal', description: 'Handler prepares mint proposal.' },
  { label: 'Multisig Proposer Receives Proposal', description: 'Proposal received by multisig.' },
  { label: 'Voter 1 Votes', description: 'First vote cast.' },
  { label: 'Voter 2 Votes', description: 'Second vote cast.' },
  { label: 'Multisig Tallies Votes', description: 'Votes are tallied.' },
  { label: 'Mint Approved Sent', description: 'Mint approval sent to USDA Token.' },
  { label: 'AO Handler Sends Mint', description: 'Mint instruction sent.' },
  { label: 'USDA Token Process Mints', description: 'Tokens are minted.' },
  { label: 'Credit Notice Sent', description: 'Recipient notified of mint.' },
];
