import { Node, Edge } from 'reactflow';

import { FlowEdgeData, FlowNodeData } from '../types';

import { QarTokenStep, QarTokenPhase, stepLabels } from './QarTokenTypes';

/**
 * Flow nodes and edges for the QAR Token flow
 */
export const flowNodes: Node<FlowNodeData>[] = [
  {
    id: 'userDeposit',
    type: 'event',
    position: { x: 0, y: 150 },
    data: {
      label: 'User Deposit',
      type: 'event',
      status: 'INITIALIZING',
      eventType: 'contract',
      tooltip: 'User initiates deposit of AR tokens to the bridge',
      apiEndpoints: ['/api/v1/bridge/deposit'],
      processFlow: 'User connects wallet → Selects deposit amount → Confirms transaction',
      phase: 'Proposal' as QarTokenPhase,
      statusByStep: {
        [QarTokenStep.CREATE_PROPOSAL]: 'INITIALIZING',
        [QarTokenStep.SUBMIT_TO_GOV_CONTRACT]: 'PENDING',
        [QarTokenStep.PROPOSAL_REGISTERED]: 'CONFIRMED',
        [QarTokenStep.START_DISCUSSION]: 'COMPLETED',
      },
      statusTooltips: {
        INITIALIZING: 'Preparing deposit transaction',
        PENDING: 'Deposit transaction submitted',
        CONFIRMED: 'Deposit confirmed on chain',
        COMPLETED: 'Deposit processed successfully',
      },
    },
  },
  {
    id: 'bridgeContract',
    type: 'proposer',
    position: { x: 350, y: 150 },
    data: {
      label: 'Bridge Contract',
      type: 'proposer',
      status: 'IDLE',
      eventType: 'relayer',
      tooltip: 'Handles deposit and withdrawal requests',
      details: 'Receives and validates deposit transactions',
      phase: 'Proposal' as QarTokenPhase,
      statusByStep: {
        [QarTokenStep.CREATE_PROPOSAL]: 'IDLE',
        [QarTokenStep.SUBMIT_TO_GOV_CONTRACT]: 'VALIDATING',
        [QarTokenStep.PROPOSAL_REGISTERED]: 'DEPOSIT_RECEIVED',
        [QarTokenStep.START_DISCUSSION]: 'PROCESSING',
      },
      statusTooltips: {
        IDLE: 'Ready to receive transactions',
        VALIDATING: 'Validating deposit transaction',
        DEPOSIT_RECEIVED: 'Deposit received and validated',
        PROCESSING: 'Processing deposit for QAR minting',
      },
    },
  },
  {
    id: 'bridgeProcessing',
    type: 'proposer',
    position: { x: 700, y: 150 },
    data: {
      label: 'Bridge Processing',
      type: 'proposer',
      status: 'IDLE',
      eventType: 'relayer',
      tooltip: 'Processes the deposit and triggers QAR minting',
      apiEndpoints: ['/api/v1/bridge/process'],
      phase: 'Voting' as QarTokenPhase,
      statusByStep: {
        [QarTokenStep.CREATE_PROPOSAL]: 'IDLE',
        [QarTokenStep.PROPOSAL_REGISTERED]: 'PROCESSING',
        [QarTokenStep.START_DISCUSSION]: 'TOKENS_MINTING',
        [QarTokenStep.VOTING_STARTED]: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Waiting for deposit confirmation',
        PROCESSING: 'Processing deposit for QAR minting',
        TOKENS_MINTING: 'Minting QAR tokens',
        COMPLETED: 'QAR tokens minted successfully',
      },
    },
  },
  {
    id: 'qarToken',
    type: 'token',
    position: { x: 1100, y: 300 },
    data: {
      label: 'QAR Token Contract',
      type: 'token',
      status: 'IDLE',
      eventType: 'ao',
      tooltip: 'Mints and burns QAR tokens',
      details: 'Manages QAR token supply and balances',
      phase: 'Execution' as QarTokenPhase,
      statusByStep: {
        [QarTokenStep.CREATE_PROPOSAL]: 'IDLE',
        [QarTokenStep.START_DISCUSSION]: 'MINTING',
        [QarTokenStep.VOTING_STARTED]: 'TOKENS_MINTED',
        [QarTokenStep.VOTING_COMPLETED]: 'TOKENS_MINTED', // Maintains state
        [QarTokenStep.PROPOSAL_PASSED]: 'BURNING',
        [QarTokenStep.EXECUTION_QUEUED]: 'FUNDS_RELEASED',
      },
      statusTooltips: {
        IDLE: 'Ready for token operations',
        MINTING: 'Minting new QAR tokens',
        TOKENS_MINTED: 'QAR tokens successfully minted',
        BURNING: 'Burning QAR tokens for withdrawal',
        FUNDS_RELEASED: 'AR funds released to user',
      },
    },
  },
  {
    id: 'userWithdraw',
    type: 'event',
    position: { x: 0, y: 750 },
    data: {
      label: 'User Withdraw',
      type: 'event',
      status: 'INITIALIZING',
      eventType: 'contract',
      tooltip: 'User initiates withdrawal of AR by burning QAR',
      apiEndpoints: ['/api/v1/bridge/withdraw'],
      phase: 'Proposal' as QarTokenPhase,
      statusByStep: {
        [QarTokenStep.VOTING_STARTED]: 'INITIALIZING',
        [QarTokenStep.VOTING_COMPLETED]: 'REQUEST_SUBMITTED',
        [QarTokenStep.PROPOSAL_PASSED]: 'PROCESSING',
        [QarTokenStep.EXECUTION_QUEUED]: 'COMPLETED',
      },
      statusTooltips: {
        INITIALIZING: 'Preparing withdrawal request',
        REQUEST_SUBMITTED: 'Withdrawal request submitted',
        PROCESSING: 'Processing withdrawal',
        COMPLETED: 'Withdrawal completed',
      },
    },
  },
  {
    id: 'withdrawalRequest',
    type: 'proposer',
    position: { x: 350, y: 750 },
    data: {
      label: 'Withdrawal Request',
      type: 'proposer',
      status: 'IDLE',
      eventType: 'relayer',
      tooltip: 'Validates withdrawal request',
      details: 'Checks QAR balance and initiates burn',
      phase: 'Voting' as QarTokenPhase,
      statusByStep: {
        [QarTokenStep.CREATE_PROPOSAL]: 'IDLE',
        [QarTokenStep.VOTING_COMPLETED]: 'VALIDATING',
        [QarTokenStep.PROPOSAL_PASSED]: 'APPROVED',
        [QarTokenStep.EXECUTION_QUEUED]: 'PROCESSING',
      },
      statusTooltips: {
        IDLE: 'Ready to process withdrawals',
        VALIDATING: 'Validating withdrawal request',
        APPROVED: 'Withdrawal approved',
        PROCESSING: 'Processing withdrawal',
      },
    },
  },
  {
    id: 'withdrawalProcessing',
    type: 'proposer',
    position: { x: 700, y: 750 },
    data: {
      label: 'Withdrawal Processing',
      type: 'proposer',
      status: 'IDLE',
      eventType: 'relayer',
      tooltip: 'Processes the withdrawal and releases AR',
      apiEndpoints: ['/api/v1/bridge/process-withdrawal'],
      phase: 'Execution' as QarTokenPhase,
      statusByStep: {
        [QarTokenStep.CREATE_PROPOSAL]: 'IDLE',
        [QarTokenStep.PROPOSAL_PASSED]: 'INITIATING',
        [QarTokenStep.EXECUTION_QUEUED]: 'BURNING_TOKENS',
        [QarTokenStep.PROPOSAL_EXECUTED]: 'RELEASING_FUNDS',
        [QarTokenStep.PROPOSAL_REJECTED]: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Ready to process withdrawals',
        INITIATING: 'Initiating withdrawal process',
        BURNING_TOKENS: 'Burning QAR tokens',
        RELEASING_FUNDS: 'Releasing AR to user',
        COMPLETED: 'Withdrawal processed successfully',
      },
    },
  },
  {
    id: 'rewardsDistribution',
    type: 'recipient',
    position: { x: 1100, y: 600 },
    data: {
      label: 'Rewards Distribution',
      type: 'recipient',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Distributes staking rewards to QAR holders',
      phase: 'Execution' as QarTokenPhase,
      statusByStep: {
        [QarTokenStep.CREATE_PROPOSAL]: 'IDLE',
        [QarTokenStep.PROPOSAL_EXECUTED]: 'CALCULATING',
        [QarTokenStep.PROPOSAL_REJECTED]: 'DISTRIBUTING',
        [QarTokenStep.CANCELED]: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Waiting for reward distribution cycle',
        CALCULATING: 'Calculating rewards for holders',
        DISTRIBUTING: 'Distributing rewards to holders',
        COMPLETED: 'Rewards distributed successfully',
      },
    },
  },
  {
    id: 'systemLogs',
    type: 'other',
    position: { x: 350, y: 300 },
    data: {
      label: 'System Logs',
      type: 'other',
      status: 'IDLE',
      eventType: 'ao',
      tooltip: 'System event logs for all operations',
      phase: 'Execution' as QarTokenPhase,
      statusByStep: {
        [QarTokenStep.CREATE_PROPOSAL]: 'IDLE',
        [QarTokenStep.SUBMIT_TO_GOV_CONTRACT]: 'LOGGING',
        [QarTokenStep.PROPOSAL_REGISTERED]: 'UPDATING',
        [QarTokenStep.CANCELED]: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Ready to log system events',
        LOGGING: 'Recording transaction events',
        UPDATING: 'Updating system logs',
        COMPLETED: 'All operations logged',
      },
    },
  },
  {
    id: 'proposalRejected',
    type: 'event',
    position: { x: 700, y: 550 },
    data: {
      label: 'Proposal Rejected',
      type: 'event',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Proposal failed to pass vote',
      phase: 'Rejected' as QarTokenPhase,
      statusByStep: {
        [QarTokenStep.PROPOSAL_REJECTED]: 'REJECTED',
      },
      statusTooltips: {
        REJECTED: 'Proposal was rejected by voters',
      },
    },
  },
  {
    id: 'executionFailed',
    type: 'event',
    position: { x: 1100, y: 750 },
    data: {
      label: 'Execution Failed',
      type: 'event',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Proposal failed during execution',
      phase: 'Rejected' as QarTokenPhase,
      statusByStep: {
        [QarTokenStep.PROPOSAL_EXECUTED]: 'FAILED',
      },
      statusTooltips: {
        FAILED: 'Execution reverted on-chain',
      },
    },
  },
  {
    id: 'proposalCanceled',
    type: 'event',
    position: { x: 100, y: 300 },
    data: {
      label: 'Proposal Canceled',
      type: 'event',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Proposal was canceled before voting',
      phase: 'Canceled' as QarTokenPhase,
      statusByStep: {
        [QarTokenStep.CANCELED]: 'CANCELED',
      },
      statusTooltips: {
        CANCELED: 'Proposal was canceled by the proposer or admin',
      },
    },
  },
  {
    id: 'votingResults',
    type: 'other',
    position: { x: 700, y: 400 },
    data: {
      label: 'Voting Results',
      type: 'other',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Results of the governance vote',
      phase: 'Voting' as QarTokenPhase,
      quorumData: {
        required: '50%',
        actual: '67%',
        votes: {
          for: '62%',
          against: '28%',
          abstain: '10%',
        },
      },
      statusByStep: {
        [QarTokenStep.VOTING_COMPLETED]: 'COUNTING',
        [QarTokenStep.PROPOSAL_PASSED]: 'PASSED',
        [QarTokenStep.PROPOSAL_REJECTED]: 'REJECTED',
      },
      statusTooltips: {
        COUNTING: 'Counting votes',
        PASSED: 'Proposal passed with sufficient votes',
        REJECTED: 'Proposal rejected due to insufficient votes',
      },
    },
  },
];

export const flowEdges: Edge<FlowEdgeData>[] = [
  {
    id: 'e1',
    source: 'userDeposit',
    target: 'bridgeContract',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'event', color: '#6366f1', label: stepLabels[QarTokenStep.CREATE_PROPOSAL] },
  },
  {
    id: 'e2',
    source: 'bridgeContract',
    target: 'bridgeProcessing',
    type: 'proposal',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'proposal', color: '#8b5cf6', label: stepLabels[QarTokenStep.SUBMIT_TO_GOV_CONTRACT] },
  },
  {
    id: 'e3',
    source: 'bridgeProcessing',
    target: 'qarToken',
    type: 'proposal',
    sourceHandle: 'right',
    targetHandle: 'top',
    data: { type: 'proposal', color: '#8b5cf6', label: stepLabels[QarTokenStep.PROPOSAL_REGISTERED] },
  },
  {
    id: 'e3b',
    source: 'bridgeProcessing',
    target: 'votingResults',
    type: 'proposal',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'proposal', color: '#8b5cf6', label: stepLabels[QarTokenStep.VOTING_STARTED] },
  },
  {
    id: 'e4',
    source: 'userWithdraw',
    target: 'withdrawalRequest',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'event', color: '#ec4899', label: stepLabels[QarTokenStep.CREATE_PROPOSAL] },
  },
  {
    id: 'e5',
    source: 'withdrawalRequest',
    target: 'withdrawalProcessing',
    type: 'voting',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'voting', color: '#f43f5e', label: stepLabels[QarTokenStep.VOTING_COMPLETED] },
  },
  {
    id: 'e6',
    source: 'withdrawalProcessing',
    target: 'qarToken',
    type: 'voting',
    sourceHandle: 'right',
    targetHandle: 'bottom',
    data: { type: 'voting', color: '#f43f5e', label: stepLabels[QarTokenStep.PROPOSAL_PASSED] },
  },
  {
    id: 'e7',
    source: 'qarToken',
    target: 'rewardsDistribution',
    type: 'executeProposal',
    sourceHandle: 'right',
    targetHandle: 'right',
    data: { type: 'proposal', color: '#10b981', label: stepLabels[QarTokenStep.PROPOSAL_EXECUTED] },
  },
  {
    id: 'e8',
    source: 'bridgeContract',
    target: 'systemLogs',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'event', color: '#64748b', label: 'Record' },
  },
  {
    id: 'e9',
    source: 'withdrawalRequest',
    target: 'systemLogs',
    type: 'event',
    sourceHandle: 'top',
    targetHandle: 'bottom',
    data: { type: 'event', color: '#64748b', label: 'Record' },
  },
  {
    id: 'e10',
    source: 'qarToken',
    target: 'systemLogs',
    type: 'event',
    sourceHandle: 'left',
    targetHandle: 'right',
    data: { type: 'event', color: '#64748b', label: 'Record' },
  },
  {
    id: 'e11',
    source: 'votingResults',
    target: 'proposalRejected',
    type: 'voting',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'voting', color: '#ef4444', label: stepLabels[QarTokenStep.PROPOSAL_REJECTED] },
  },
  {
    id: 'e12',
    source: 'votingResults',
    target: 'withdrawalProcessing',
    type: 'voting',
    sourceHandle: 'right',
    targetHandle: 'top',
    data: { type: 'voting', color: '#10b981', label: stepLabels[QarTokenStep.EXECUTION_QUEUED] },
  },

  // Execution failed path
  {
    id: 'e13',
    source: 'withdrawalProcessing',
    target: 'executionFailed',
    type: 'executionFailed',
    sourceHandle: 'bottom',
    targetHandle: 'bottom',
    data: { type: 'event', color: '#ef4444', label: 'Execution Failed' },
  },
  {
    id: 'e14',
    source: 'bridgeContract',
    target: 'proposalCanceled',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'event', color: '#f97316', label: stepLabels[QarTokenStep.CANCELED] },
  },
];

/**
 * Node handles configuration for the QAR Token flow
 * This determines where connections can attach to each node
 */
export const nodeHandles: Record<string, { [side: string]: boolean }> = {
  // Entry points - only connect from right side
  userDeposit: { right: true },
  userWithdraw: { right: true },

  // Processing nodes - connect from left and right sides
  bridgeContract: { left: true, right: true, top: true, bottom: true },
  bridgeProcessing: { left: true, right: true, bottom: true },
  withdrawalRequest: { left: true, right: true, top: true },
  withdrawalProcessing: { left: true, right: true, top: true, bottom: true },

  // Central token contract - connect from all sides
  qarToken: { left: true, right: true, top: true, bottom: true },

  // Output nodes - connect from left and right sides
  rewardsDistribution: { left: true, right: true },

  // System Logs - connect from all sides
  systemLogs: { top: true, bottom: true, left: true, right: true },

  // Voting results - connect from all sides
  votingResults: { top: true, bottom: true, left: true, right: true },

  // Rejection and error paths - connect from top only
  proposalRejected: { top: true },
  executionFailed: { top: true, bottom: true },
  proposalCanceled: { top: true },
};
