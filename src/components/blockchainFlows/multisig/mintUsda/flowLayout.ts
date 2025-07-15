import { Node, Edge } from 'reactflow';

import { FlowEdgeData, FlowNodeData } from '../../types';

export const flowNodes: Node<FlowNodeData>[] = [
  {
    id: 'userInteraction',
    type: 'other',
    position: { x: -150, y: 200 },
    data: {
      label: 'User Interaction',
      type: 'other',
      status: 'INITIALIZING',
      statusByStep: {
        1: 'WALLET_CONNECTED', // Step 1: User connects wallet
        2: 'AMOUNT_SELECTED', // Step 2: User selects amount
        3: 'REQUEST_SUBMITTED', // Step 3: User submits transfer
        4: 'AWAITING_CONFIRMATION', // Step 4: Waiting for AO processing
        13: 'COMPLETE', // Step 13: Transfer complete
      },
      statusTooltips: {
        INITIALIZING: 'Initializing transfer process',
        WALLET_CONNECTED: 'User wallet connected successfully',
        AMOUNT_SELECTED: 'Transfer amount selected and validated',
        REQUEST_SUBMITTED: 'Transfer request submitted to network',
        AWAITING_CONFIRMATION: 'Waiting for multisig processing',
        COMPLETE: 'Transfer completed successfully. Tokens have been minted.',
      },
      eventType: 'contract',
      timestamp: Date.now(),
      details: 'Connect Wallet & Initiate Transfer',
      tooltip: 'User connects wallet via UI, selects token amount, and confirms transfer via modal dialog',
      apiEndpoints: [
        '/api/v2/ao/fetch - Get USDA balances',
        '/api/v2/ao/index - Interact with AO network',
        '/api/v2/usda/multisig - Process multisig operations',
      ],
      processFlow: 'TransferForm → TransferConfirmationModal → Multisig Transaction',
    },
  },
  {
    id: 'eventPool',
    type: 'event',
    position: { x: 600, y: 0 },
    data: {
      label: 'Event Emitter Pool',
      type: 'event',
      status: 'IDLE',
      statusByStep: {
        1: 'IDLE', // Initial state
        2: 'RECEIVING_EVENT', // Step 2: Receiving lock event
        3: 'QUEUED_FOR_PROCESSING', // Step 3: Event queued
        4: 'PROCESSING', // Step 4: Event being processed
        5: 'COMPLETE', // Step 5: Processing complete
      },
      statusTooltips: {
        IDLE: 'Ready to receive events',
        RECEIVING_EVENT: 'Receiving lock event from emitter',
        QUEUED_FOR_PROCESSING: 'Event queued for AO processing',
        PROCESSING: 'Event being processed by AO handler',
        COMPLETE: 'Event processing complete',
      },
      eventType: 'contract',
      timestamp: Date.now() - 1000 * 60 * 4,
      txHash: '0x2345...6789',
      tooltip: 'Temporary storage for events before they are processed by the AO network.',
    },
  },
  {
    id: 'lockEmitter',
    type: 'event',
    position: { x: 200, y: 200 },
    data: {
      label: 'EthBridgeLockEventEmitter',
      type: 'event',
      status: 'SENT_TO_AO',
      eventType: 'contract',
      timestamp: Date.now() - 1000 * 60 * 3, // 3 minutes ago
      txHash: '0x3456...7890',
      tooltip: 'Emits events when tokens are locked in the bridge.',
    },
  },
  {
    id: 'aoHandler',
    type: 'event',
    position: { x: 600, y: 200 },
    data: {
      label: 'AO USDA EventHandler',
      type: 'event',
      status: 'IDLE',
      statusByStep: {
        1: 'IDLE', // Initial state
        4: 'EVENT_RECEIVED', // Step 4: AO Event Pool processes event
        5: 'PROPOSAL_PREPARED', // Step 5: AO USDA EventHandler Prepares Proposal
        11: 'MINT_SENT', // Step 11: AO Handler Sends Mint to USDA Token Process
        13: 'TOKEN_EVENT_RECEIVED', // Step 13: USDA Token Process sends Token Event
      },
      statusTooltips: {
        IDLE: 'Ready to receive events',
        EVENT_RECEIVED: 'Received lock event from bridge',
        PROPOSAL_PREPARED: 'Mint proposal prepared for multisig',
        MINT_SENT: 'Mint operation sent to token process',
        TOKEN_EVENT_RECEIVED: 'Token event received from token process',
      },
      eventType: 'ao',
      timestamp: Date.now() - 1000 * 60 * 2,
      txHash: '0x4567...8901',
      tooltip: 'Processes bridge events and prepares mint proposals for the multisig group.',
    },
  },
  {
    id: 'proposer',
    type: 'proposer',
    position: { x: 200, y: 400 },
    data: {
      label: 'Multisig Proposer (Group)',
      type: 'proposer',
      status: 'AWAITING_PROPOSAL',
      statusByStep: {
        1: 'AWAITING_PROPOSAL', // Initial state
        5: 'PROPOSAL_PREPARED', // Step 5: AO USDA EventHandler Prepares Proposal
        6: 'PROPOSAL_RECEIVED', // Step 6: Multisig Proposer Receives Proposal
        7: 'VOTING_IN_PROGRESS', // Step 7: Voter 1 votes
        8: 'VOTING_IN_PROGRESS', // Step 8: Voter 2 votes
        9: 'TALLYING_VOTES', // Step 9: Vote tallying
        10: 'MINT_APPROVED', // Step 10: Mint Approved
        11: 'MINT_APPROVED', // Step 11: Mint Approved (carry forward)
      },
      statusTooltips: {
        AWAITING_PROPOSAL: 'Waiting for mint proposal',
        PROPOSAL_PREPARED: 'Mint proposal prepared',
        PROPOSAL_RECEIVED: 'Received mint proposal',
        VOTING_IN_PROGRESS: 'Voting in progress',
        TALLYING_VOTES: 'Tallying votes from validators',
        MINT_APPROVED: 'Mint operation approved by multisig',
      },
      eventType: 'relayer',
      timestamp: Date.now() - 1000 * 60 * 1,
      txHash: '0x5678...9012',
      tooltip:
        'AO Multisig contract/group. Receives mint proposals, collects votes from validators, and triggers minting upon reaching quorum.',
    },
  },
  {
    id: 'voter1',
    type: 'voter',
    position: { x: 75, y: 600 },
    data: {
      label: 'Voter 1',
      type: 'voter',
      status: 'AWAITING_PROPOSAL',
      statusByStep: {
        6: 'REVIEWING', // Step 6: Received proposal
        7: 'VOTING', // Step 7: Casting vote
        8: 'VOTE_SUBMITTED', // Step 8: Vote submitted
        9: 'VOTE_COUNTED', // Step 9: Vote counted in tally
      },
      statusTooltips: {
        AWAITING_PROPOSAL: 'Waiting for mint proposal',
        REVIEWING: 'Reviewing mint proposal details',
        VOTING: 'Submitting vote on mint proposal',
        VOTE_SUBMITTED: 'Vote submitted to multisig',
        VOTE_COUNTED: 'Vote included in final tally',
      },
      eventType: 'relayer',
      timestamp: Date.now() - 1000 * 30,
      txHash: '0x6789...0123',
      tooltip: 'First validator in the multisig committee. Reviews and votes on mint proposals.',
    },
  },
  {
    id: 'voter2',
    type: 'voter',
    position: { x: 325, y: 600 },
    data: {
      label: 'Voter 2',
      type: 'voter',
      status: 'AWAITING_PROPOSAL',
      statusByStep: {
        6: 'REVIEWING', // Step 6: Received proposal
        8: 'VOTING', // Step 8: Casting vote (after Voter 1)
        9: 'VOTE_SUBMITTED', // Step 9: Vote submitted
        10: 'VOTE_COUNTED', // Step 10: Vote counted in tally
      },
      statusTooltips: {
        AWAITING_PROPOSAL: 'Waiting for mint proposal',
        REVIEWING: 'Reviewing mint proposal details',
        VOTING: 'Submitting vote on mint proposal',
        VOTE_SUBMITTED: 'Vote submitted to multisig',
        VOTE_COUNTED: 'Vote included in final tally',
      },
      eventType: 'relayer',
      timestamp: Date.now() - 1000 * 15,
      txHash: '0x7890...1234',
      tooltip: 'Second validator in the multisig committee. Reviews and votes on mint proposals.',
    },
  },
  {
    id: 'usdaToken',
    type: 'token',
    position: { x: 900, y: 400 },
    data: {
      label: 'USDA Token Process',
      type: 'token',
      status: 'IDLE',
      statusByStep: {
        1: 'IDLE', // Initial state
        10: 'MINT_APPROVED', // Step 10: Mint Approved
        11: 'MINTING', // Step 11: Minting tokens
        12: 'TOKENS_MINTED', // Step 12: Tokens minted
        13: 'CREDIT_NOTICE_SENT', // Step 13: Credit notice sent to recipient
      },
      statusTooltips: {
        IDLE: 'Ready to process mint requests',
        MINT_APPROVED: 'Mint operation approved by multisig',
        MINTING: 'Minting USDA tokens',
        TOKENS_MINTED: 'Tokens successfully minted',
        CREDIT_NOTICE_SENT: 'Credit notice sent to recipient',
      },
      eventType: 'ao',
      timestamp: Date.now() - 1000 * 5,
      txHash: '0x8901...2345',
      tooltip: 'Mints USDA tokens once the multisig group approves the operation.',
    },
  },
  {
    id: 'recipient',
    type: 'recipient',
    position: { x: 1200, y: 400 },
    data: {
      label: 'Recipient',
      type: 'recipient',
      status: 'AWAITING_TOKENS',
      statusByStep: {
        1: 'AWAITING_PROCESSING', // Steps 1-11: Waiting for processing
        11: 'TOKENS_MINTING', // Step 11: Tokens being minted
        12: 'TOKENS_MINTED', // Step 12: Tokens minted
        13: 'TOKENS_RECEIVED', // Step 13: Tokens received
      },
      statusTooltips: {
        AWAITING_PROCESSING: 'Waiting for mint approval and processing',
        TOKENS_MINTING: 'Mint operation in progress',
        TOKENS_MINTED: 'Tokens have been minted',
        TOKENS_RECEIVED: 'Tokens have been successfully received',
      },
      eventType: 'contract',
      timestamp: Date.now(),
      txHash: '0x9012...3456',
      tooltip: 'The final recipient of the minted USDA tokens. Shows the status of token receipt.',
    },
  },
];

export const flowEdges: Edge<FlowEdgeData>[] = [
  {
    id: 'e0',
    source: 'userInteraction',
    target: 'lockEmitter',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'event', color: '#60a5fa', label: 'Initiate Transfer' },
  },
  {
    id: 'e1',
    source: 'lockEmitter',
    target: 'eventPool',
    type: 'event',
    sourceHandle: 'top',
    targetHandle: 'left',
    data: { type: 'event', color: '#60a5fa', label: 'Event to AO' },
  },
  {
    id: 'e2',
    source: 'eventPool',
    target: 'aoHandler',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'event', color: '#60a5fa', label: 'Event Handling' },
  },
  {
    id: 'e3',
    source: 'aoHandler',
    target: 'proposer',
    type: 'proposal',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'proposal', color: '#fbbf24', label: 'Propose Mint' },
  },
  {
    id: 'e4',
    source: 'voter1',
    target: 'proposer',
    type: 'voting',
    sourceHandle: 'top',
    targetHandle: 'bottom',
    data: { type: 'voting', color: '#a78bfa', label: 'Vote' },
  },
  {
    id: 'e5',
    source: 'voter2',
    target: 'proposer',
    type: 'voting',
    sourceHandle: 'top',
    targetHandle: 'bottom',
    data: { type: 'voting', color: '#a78bfa', label: 'Vote' },
  },
  {
    id: 'e6',
    source: 'aoHandler',
    target: 'usdaToken',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'event', color: '#60a5fa', label: 'Mint' },
  },
  {
    id: 'e7',
    source: 'usdaToken',
    target: 'recipient',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'event', color: 'rgb(129, 140, 248)', label: 'Credit Notice' },
  },
  {
    id: 'e8',
    source: 'proposer',
    target: 'usdaToken',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'event', color: '#34d399', label: 'Mint Approved' },
  },
  {
    id: 'e9',
    source: 'usdaToken',
    target: 'aoHandler',
    type: 'event',
    sourceHandle: 'top',
    targetHandle: 'right',
    data: { type: 'event', color: '#f87171', label: 'Token Event' },
  },
];

// Node handles configuration for the minting flow
export const nodeHandles: Record<string, { [side: string]: boolean }> = {
  userInteraction: { right: true },
  lockEmitter: { left: true, top: true },
  eventPool: { left: true, bottom: true },
  aoHandler: { top: true, bottom: true, right: true },
  proposer: { top: true, bottom: true, right: true },
  voter1: { top: true },
  voter2: { top: true },
  usdaToken: { left: true, right: true, top: true },
  recipient: { left: true },
};
