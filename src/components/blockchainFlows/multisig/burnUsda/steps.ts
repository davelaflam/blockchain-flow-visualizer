import { Step, StepData } from '../../types';

export const stepData: StepData[] = [
  {
    label: 'User initiates burn',
    description: 'User connects wallet and submits a burn request for USDA tokens.',
    link: '#step-1',
    linkLabel: 'View Burn Details',
  },
  {
    label: 'Burn event emitted',
    description: 'Burn event is emitted from the USDA token contract.',
    link: '#step-2',
    linkLabel: 'View Event',
  },
  {
    label: 'Event sent to AO Event Pool',
    description: 'The burn event is picked up by the AO Event Pool for processing.',
    link: '#step-3',
    linkLabel: 'View Pool',
  },
  {
    label: 'AO Event Pool processes event',
    description: 'Event is validated and prepared for handler processing.',
    link: '#step-4',
    linkLabel: 'View Processing',
  },
  {
    label: 'AO Handler prepares burn proposal',
    description: 'A burn proposal is created for multisig verification.',
    link: '#step-5',
    linkLabel: 'View Proposal',
  },
  {
    label: 'Multisig receives burn proposal',
    description: 'Proposal is received and stored by the multisig contract.',
    link: '#step-6',
    linkLabel: 'View Proposal',
  },
  {
    label: 'Voter 1 votes on burn',
    description: 'First validator submits their vote on the burn proposal.',
    link: '#step-7',
    linkLabel: 'View Vote',
  },
  {
    label: 'Voter 2 votes on burn',
    description: 'Second validator submits their vote on the burn proposal.',
    link: '#step-8',
    linkLabel: 'View Vote',
  },
  {
    label: 'Multisig tallies votes',
    description: 'Votes are counted and checked against quorum requirements.',
    link: '#step-9',
    linkLabel: 'View Results',
  },
  {
    label: 'Burn approved',
    description: 'Multisig approves the burn operation after successful voting.',
    link: '#step-10',
    linkLabel: 'View Approval',
  },
  {
    label: 'AO Handler executes burn',
    description: 'Burn operation is executed on the USDA token contract.',
    link: '#step-11',
    linkLabel: 'View Execution',
  },
  {
    label: 'USDA tokens burned',
    description: 'Tokens are permanently removed from circulation.',
    link: '#step-12',
    linkLabel: 'View Burn',
  },
  {
    label: 'Burn confirmation sent',
    description: 'User receives confirmation of the completed burn operation.',
    link: '#step-13',
    linkLabel: 'View Confirmation',
  },
];

export const multisigBurningSteps: Step[] = [
  // 1. User initiates burn
  {
    title: '1. User Initiates Burn',
    description:
      'The user connects their wallet and initiates a burn request by specifying the amount of USDA to burn.',
    what: 'User interaction with the dApp to start the burning process.',
    why: 'Initiates the cross-chain burning flow with user consent.',
    codeSnippet:
      '// User initiates burn in dApp UI\nconst handleBurn = async (amount: string) => {\n  const signature = await signMessage(`Burn ${amount} USDA`);\n  // Send to backend or directly to AO network\n};',
    label: 'User initiates burn',
  },

  // 2. Burn event emitted
  {
    title: '2. Burn Event Emitted',
    description: 'A burn event is emitted from the USDA token contract.',
    what: 'The burn operation is recorded on the blockchain.',
    why: 'Creates an immutable record of the burn request.',
    codeSnippet: '// Emit burn event\nemit Transfer(sender, address(0), amount);\nemit Burn(sender, amount);',
    label: 'Burn event emitted',
  },

  // 3. Event sent to AO Event Pool
  {
    title: '3. Event Sent to AO Event Pool',
    description: 'The burn event is picked up by the AO Event Pool.',
    what: 'The event is queued for processing by the AO network.',
    why: 'Ensures all events are processed in order.',
    codeSnippet:
      '-- AO Event Pool receives event\nHandlers.add({\n  event = "Burn",\n  handler = function(msg)\n    -- Add to event queue\n  end\n})',
    label: 'Event sent to AO Event Pool',
  },

  // 4. AO Event Pool processes event
  {
    title: '4. AO Event Pool Processes Event',
    description: 'The burn event is processed from the event pool.',
    what: 'The event is validated and prepared for handler processing.',
    why: 'Ensures events are processed in a controlled manner.',
    codeSnippet:
      '-- Process next event in queue\nfunction processNextEvent()\n  local event = eventQueue:pop()\n  -- Validate and forward to handler\nend',
    label: 'AO Event Pool processes event',
  },

  // 5. AO USDA EventHandler prepares burn proposal
  {
    title: '5. AO Handler Prepares Burn Proposal',
    description: 'The AO Handler creates a burn proposal for the multisig.',
    what: 'A new burn proposal is created with the burn details.',
    why: 'Multisig verification adds security to the burn process.',
    codeSnippet:
      '-- Create burn proposal\nlocal proposal = {\n  action = "burn",\n  amount = msg.Quantity,\n  recipient = msg.Recipient,\n  nonce = generateNonce()\n}\n\n-- Submit to multisig\nmultisig:submitProposal(proposal)',
    label: 'AO Handler prepares burn proposal',
  },

  // 6. Multisig Proposer receives burn proposal
  {
    title: '6. Multisig Receives Proposal',
    description: 'The burn proposal is received by the multisig contract.',
    what: 'The proposal is stored and prepared for voting.',
    why: 'Ensures proper proposal handling before voting begins.',
    codeSnippet:
      '// Store new proposal\nfunction submitProposal(Proposal memory proposal) external {\n  uint256 proposalId = nextProposalId++;\n  proposals[proposalId] = proposal;\n  emit ProposalCreated(proposalId, msg.sender);\n}',
    label: 'Multisig receives burn proposal',
  },

  // 7. Voter 1 votes
  {
    title: '7. Voter 1 Submits Vote',
    description: 'The first validator submits their vote on the proposal.',
    what: 'A vote is recorded for the burn proposal.',
    why: 'Begins the voting process for the burn operation.',
    codeSnippet:
      '// Cast vote\nfunction vote(uint256 proposalId, bool support) external {\n  require(validators[msg.sender], "Not a validator");\n  // Record vote\n  emit VoteCast(proposalId, msg.sender, support);\n}',
    label: 'Voter 1 votes on burn',
  },

  // 8. Voter 2 votes
  {
    title: '8. Voter 2 Submits Vote',
    description: 'The second validator submits their vote on the proposal.',
    what: 'A second vote is recorded for the burn proposal.',
    why: 'Completes the voting process for the burn operation.',
    codeSnippet:
      '// Cast vote (same as Voter 1)\nfunction vote(uint256 proposalId, bool support) external {\n  require(validators[msg.sender], "Not a validator");\n  // Record vote\n  emit VoteCast(proposalId, msg.sender, support);\n}',
    label: 'Voter 2 votes on burn',
  },

  // 9. Multisig tallies votes
  {
    title: '9. Votes Tallied',
    description: 'The multisig contract tallies the votes and checks quorum.',
    what: 'Votes are counted to determine if the proposal passes.',
    why: 'Ensures sufficient consensus before executing the burn.',
    codeSnippet:
      '// Check if proposal passed\nfunction checkProposal(uint256 proposalId) public view returns (bool) {\n  Proposal storage p = proposals[proposalId];\n  return p.yesVotes >= requiredVotes;\n}',
    label: 'Multisig tallies votes',
  },

  // 10. Multisig sends 'Burn Approved' to USDA Token Process
  {
    title: '10. Burn Approved',
    description: 'The multisig approves the burn operation.',
    what: 'The burn proposal is approved for execution.',
    why: 'Authorizes the token contract to proceed with the burn.',
    codeSnippet:
      '// Approve burn\nfunction approveBurn(uint256 proposalId) external {\n  require(proposalApproved[proposalId], "Proposal not approved");\n  token.burn(proposal.amount);\n  emit BurnApproved(proposalId);\n}',
    label: 'Burn approved',
  },

  // 11. AO Handler sends 'Burn' to USDA Token Process
  {
    title: '11. Burn Executed',
    description: 'The AO Handler executes the burn on the USDA token contract.',
    what: 'The specified amount of USDA tokens are burned.',
    why: 'Reduces the token supply and initiates the cross-chain process.',
    codeSnippet:
      '-- Execute burn\nfunction executeBurn(amount, recipient)\n  -- Burn tokens\n  token:burn(amount)\n  -- Emit cross-chain event\n  emit CrossChainBurn(amount, recipient)\nend',
    label: 'AO Handler executes burn',
  },

  // 12. USDA Token Process burns tokens
  {
    title: '12. Tokens Burned',
    description: 'The USDA token contract burns the specified tokens.',
    what: 'Tokens are permanently removed from circulation.',
    why: 'Completes the first half of the cross-chain transfer.',
    codeSnippet:
      '// Burn tokens\nfunction burn(uint256 amount) external {\n  _burn(msg.sender, amount);\n  emit TokensBurned(msg.sender, amount);\n}',
    label: 'USDA tokens burned',
  },

  // 13. USDA Token Process sends 'Debit Notice' to Sender and Burn Event to AO USDA EventHandler
  {
    title: '13. Completion',
    description: 'The burn process is completed and events are emitted.',
    what: 'The user receives confirmation of the burn.',
    why: 'Provides closure to the burn operation and updates the UI.',
    codeSnippet:
      '// Emit completion events\nemit BurnCompleted({\n  sender: msg.sender,\n  amount: amount,\n  timestamp: block.timestamp\n});\n\n-- Notify AO handler\nao.send({\n  Target = HANDLER_PROCESS,\n  Data = json.encode({\n    action = "burn_completed",\n    amount = amount,\n    sender = msg.sender\n  })\n})',
    label: 'Burn confirmation sent',
  },
];
