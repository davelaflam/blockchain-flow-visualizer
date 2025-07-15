import { Node, Edge } from 'reactflow';

import { FlowEdgeData, FlowNodeData } from '../../types';

export const flowNodes: Node<FlowNodeData>[] = [
  {
    id: 'userInteraction',
    type: 'other',
    position: { x: -150, y: 200 },
    data: {
      label: 'User Burn Request',
      type: 'other',
      status: 'INITIALIZING',
      statusByStep: {
        1: 'WALLET_CONNECTED', // Step 1: User connects wallet
        2: 'AMOUNT_SELECTED', // Step 2: User selects amount
        3: 'REQUEST_SUBMITTED', // Step 3: User submits burn request
        4: 'AWAITING_CONFIRMATION', // Step 4: Waiting for AO confirmation
        13: 'COMPLETE', // Step 13: Burn process complete
      },
      statusTooltips: {
        INITIALIZING: 'Initializing burn process',
        WALLET_CONNECTED: 'User wallet connected successfully',
        AMOUNT_SELECTED: 'Burn amount selected and validated',
        REQUEST_SUBMITTED: 'Burn request submitted to network',
        AWAITING_CONFIRMATION: 'Waiting for burn confirmation',
        COMPLETE: 'Burn process completed successfully',
      },
      eventType: 'contract',
      timestamp: Date.now() - 1000 * 60 * 5,
      txHash: '0x1234...5678',
      details: 'Connect Wallet & Initiate Transfer',
      tooltip: 'Initiates the burn process by connecting the wallet and submitting a burn request',
      apiEndpoints: ['/api/v2/ao/fetch', '/api/v2/ao/index', '/api/v2/usda/multisig'],
      processFlow:
        'User connects wallet → TransferForm shows USDA balance from /api/v2/ao/fetch → User selects amount and destination token (DAI, USDC, USDT) → TransferConfirmationModal displays → User confirms → "Unwrap" action is sent to AO process via multisigProcess client → Multisig committee receives burn proposal via /api/v2/usda/multisig endpoint',
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
        2: 'RECEIVING_EVENT', // Step 2: Receiving burn event
        3: 'QUEUED_FOR_PROCESSING', // Step 3: Event queued
        4: 'PROCESSING', // Step 4: Event being processed
        5: 'COMPLETE', // Step 5: Processing complete
      },
      statusTooltips: {
        IDLE: 'Ready to receive events',
        RECEIVING_EVENT: 'Receiving burn event from emitter',
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
    id: 'burnEmitter',
    type: 'event',
    position: { x: 200, y: 200 },
    data: {
      label: 'USDA Burn Event',
      type: 'event',
      status: 'SENT_TO_AO',
      eventType: 'contract',
      timestamp: Date.now() - 1000 * 60 * 3, // 3 minutes ago
      txHash: '0x3456...7890',
      tooltip: 'Emits events when USDA tokens are burned for unwrapping.',
    },
  },
  {
    id: 'aoHandler',
    type: 'event',
    position: { x: 600, y: 200 },
    data: {
      label: 'AO USDA Burn Handler',
      type: 'event',
      status: 'NEW', // Default status, will be overridden by statusByStep
      statusByStep: {
        4: 'BURN_REQUEST_RECEIVED', // Step 4: AO Event Pool processes burn request
        5: 'BURN_PROPOSAL_PREPARED', // Step 5: AO USDA Burn Handler Prepares Burn Proposal
        11: 'BURN_EXECUTED', // Step 11: AO Handler Executes Burn on USDA Token Process
        13: 'BURN_CONFIRMATION', // Step 13: USDA Token Process confirms burn completion
      },
      eventType: 'ao',
      timestamp: Date.now() - 1000 * 60 * 2, // 2 minutes ago
      txHash: '0x4567...8901',
      tooltip: 'Processes burn requests and coordinates the burn operation with the multisig group.',
    },
  },
  {
    id: 'proposer',
    type: 'proposer',
    position: { x: 200, y: 400 },
    data: {
      label: 'Multisig Burn Committee',
      type: 'proposer',
      status: 'NEW', // Default status, will be overridden by statusByStep
      statusByStep: {
        5: 'BURN_PROPOSAL_PREPARED', // Step 5: AO USDA Burn Handler Prepares Proposal
        6: 'BURN_PROPOSAL_RECEIVED', // Step 6: Multisig Committee Receives Burn Proposal
        7: 'VOTING_IN_PROGRESS', // Step 7: Voter 1 votes
        8: 'VOTING_IN_PROGRESS', // Step 8: Voter 2 votes
        9: 'TALLYING_VOTES', // Step 9: Vote tallying
        10: 'BURN_APPROVED', // Step 10: Burn Approved
      },
      statusTooltips: {
        BURN_PROPOSAL_PREPARED: 'Proposal prepared by AO Handler - Waiting for submission to Multisig',
        BURN_PROPOSAL_RECEIVED: 'Burn proposal received - Awaiting validator votes',
        VOTING_IN_PROGRESS: 'Voting in progress - Waiting for all validators to vote',
        TALLYING_VOTES: 'Votes being tallied - Verifying quorum is met',
        BURN_APPROVED: 'Burn approved - Sending approval to USDA Token Process',
      },
      eventType: 'relayer',
      timestamp: Date.now() - 1000 * 60 * 1,
      txHash: '0x5678...9012',
      tooltip:
        'AO Multisig contract/group. Receives burn proposals, collects votes from validators, and triggers the burn operation upon reaching quorum.',
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
        AWAITING_PROPOSAL: 'Waiting for burn proposal',
        REVIEWING: 'Reviewing burn proposal details',
        VOTING: 'Submitting vote on burn proposal',
        VOTE_SUBMITTED: 'Vote submitted to multisig',
        VOTE_COUNTED: 'Vote included in final tally',
      },
      eventType: 'relayer',
      timestamp: Date.now() - 1000 * 30,
      txHash: '0x6789...0123',
      tooltip: 'First validator in the multisig committee. Reviews and votes on burn proposals.',
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
        AWAITING_PROPOSAL: 'Waiting for burn proposal',
        REVIEWING: 'Reviewing burn proposal details',
        VOTING: 'Submitting vote on burn proposal',
        VOTE_SUBMITTED: 'Vote submitted to multisig',
        VOTE_COUNTED: 'Vote included in final tally',
      },
      eventType: 'relayer',
      timestamp: Date.now() - 1000 * 15,
      txHash: '0x7890...1234',
      tooltip: 'Second validator in the multisig committee. Reviews and votes on burn proposals.',
    },
  },
  {
    id: 'usdaToken',
    type: 'token',
    position: { x: 900, y: 400 },
    data: {
      label: 'USDA Token Process',
      type: 'token',
      status: 'NEW',
      statusByStep: {
        10: 'BURN_APPROVED', // Step 10: Burn Approved by Multisig Committee
        11: 'BURNING', // Step 11: AO Handler Executes Burn
        12: 'USDA_BURNED', // Step 12: USDA Tokens are Burned
        13: 'BURN_CONFIRMATION', // Step 13: Burn Confirmation Sent to User
      },
      eventType: 'ao',
      timestamp: Date.now() - 1000 * 5, // 5 seconds ago
      txHash: '0x8901...2345',
      tooltip: 'Burns USDA tokens once the multisig committee approves the burn operation.',
    },
  },
  {
    id: 'recipient',
    type: 'recipient',
    position: { x: 1200, y: 400 },
    data: {
      label: 'User (Burner)',
      type: 'recipient',
      status: 'AWAITING_CONFIRMATION',
      statusByStep: {
        1: 'INITIALIZING', // Step 1: User starts the process
        2: 'REQUEST_SENT', // Step 2: Burn request submitted
        3: 'AWAITING_CONFIRMATION', // Steps 3-12: Waiting for processing
        12: 'BURN_IN_PROGRESS', // Step 12: Burn being processed
        13: 'COMPLETE', // Step 13: Burn confirmed
      },
      statusTooltips: {
        INITIALIZING: 'Preparing to initiate burn request',
        REQUEST_SENT: 'Burn request submitted to the network',
        AWAITING_CONFIRMATION: 'Waiting for multisig approval and processing',
        BURN_IN_PROGRESS: 'Burn operation in progress',
        COMPLETE: 'Burn completed successfully. Native tokens have been sent to your wallet.',
      },
      eventType: 'contract',
      timestamp: Date.now(),
      txHash: '0x9012...3456',
      tooltip: 'The user who initiated the burn request and will receive the native tokens after the burn is complete.',
    },
  },
];

export const flowEdges: Edge<FlowEdgeData>[] = [
  {
    id: 'e0',
    source: 'userInteraction',
    target: 'burnEmitter',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'event', color: '#60a5fa', label: 'Initiate Burn' },
  },
  {
    id: 'e1',
    source: 'burnEmitter',
    target: 'eventPool',
    type: 'event',
    sourceHandle: 'top',
    targetHandle: 'left',
    data: { type: 'event', color: '#60a5fa', label: 'Burn Event to AO' },
  },
  {
    id: 'e2',
    source: 'eventPool',
    target: 'aoHandler',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'event', color: '#60a5fa', label: 'Process Burn Request' },
  },
  {
    id: 'e3',
    source: 'aoHandler',
    target: 'proposer',
    type: 'proposal',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'proposal', color: '#fbbf24', label: 'Propose Burn' },
  },
  {
    id: 'e4',
    source: 'voter1',
    target: 'proposer',
    type: 'voting',
    sourceHandle: 'top',
    targetHandle: 'bottom',
    data: { type: 'voting', color: '#a78bfa', label: 'Vote on Burn' },
  },
  {
    id: 'e5',
    source: 'voter2',
    target: 'proposer',
    type: 'voting',
    sourceHandle: 'top',
    targetHandle: 'bottom',
    data: { type: 'voting', color: '#a78bfa', label: 'Vote on Burn' },
  },
  {
    id: 'e6',
    source: 'proposer',
    target: 'usdaToken',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'event', color: '#34d399', label: 'Burn Approved' },
  },
  {
    id: 'e7',
    source: 'aoHandler',
    target: 'usdaToken',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'event', color: '#f87171', label: 'Execute Burn' },
  },
  {
    id: 'e8',
    source: 'usdaToken',
    target: 'recipient',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'event', color: 'rgb(129, 140, 248)', label: 'Burn Confirmation' },
  },
  {
    id: 'e9',
    source: 'usdaToken',
    target: 'aoHandler',
    type: 'event',
    sourceHandle: 'top',
    targetHandle: 'right',
    data: { type: 'event', color: '#f87171', label: 'Burn Completion' },
  },
];

export const nodeHandles: Record<string, { [side: string]: boolean }> = {
  userInteraction: { right: true },
  burnEmitter: { left: true, top: true },
  eventPool: { left: true, bottom: true },
  aoHandler: { top: true, bottom: true, right: true },
  proposer: { top: true, bottom: true, right: true },
  voter1: { top: true },
  voter2: { top: true },
  usdaToken: { left: true, right: true, top: true },
  recipient: { left: true },
};
