import { StepHighlightMap } from '../types';

/**
 * This file defines the step highlight map for the QAR blockchain flow.
 */
export const stepHighlightMap: StepHighlightMap[] = [
  // Step 0: Initial state - all nodes/edges dimmed
  { nodes: [], edges: [] },

  // 1. Create Proposal (User Deposit)
  {
    nodes: ['userDeposit', 'bridgeContract', 'systemLogs'],
    edges: ['e1', 'e8'],
    updateNode: {
      id: 'userDeposit',
      data: { status: 'DEPOSIT_INITIATED' },
    },
  },

  // 2. Submit to Governance (Deposit Confirmation)
  {
    nodes: ['bridgeContract', 'bridgeProcessing', 'systemLogs'],
    edges: ['e2', 'e8'],
    updateNode: {
      id: 'bridgeContract',
      data: { status: 'DEPOSIT_CONFIRMING' },
    },
  },

  // 3. Proposal Registered (Mint QAR Tokens)
  {
    nodes: ['bridgeContract', 'bridgeProcessing', 'qarToken', 'systemLogs'],
    edges: ['e2', 'e3', 'e8', 'e10'],
    updateNode: {
      id: 'qarToken',
      data: { status: 'MINTING' },
    },
  },

  // 4. Start Discussion (Calculate Rewards)
  {
    nodes: ['bridgeProcessing', 'qarToken', 'votingResults', 'systemLogs'],
    edges: ['e3', 'e3b', 'e10'],
    updateNode: {
      id: 'votingResults',
      data: { status: 'DISCUSSION_ACTIVE' },
    },
  },

  // 5. Voting Started (Withdraw Initiated)
  {
    nodes: ['userWithdraw', 'withdrawalRequest', 'votingResults', 'systemLogs'],
    edges: ['e4', 'e9', 'e3b'],
    updateNode: {
      id: 'votingResults',
      data: { status: 'VOTING_ACTIVE' },
    },
  },

  // 6. Voting Completed (Process Withdrawal)
  {
    nodes: ['withdrawalRequest', 'withdrawalProcessing', 'votingResults', 'systemLogs'],
    edges: ['e5', 'e9', 'e12'],
    updateNode: {
      id: 'votingResults',
      data: { status: 'COUNTING' },
    },
  },

  // 7. Proposal Passed (Confirm Withdrawal)
  {
    nodes: ['withdrawalProcessing', 'qarToken', 'votingResults', 'executionFailed', 'systemLogs'],
    edges: ['e6', 'e9', 'e10', 'e12', 'e13'],
    updateNode: {
      id: 'qarToken',
      data: { status: 'BURNING' },
    },
  },

  // 8. Execution Queued (Complete Transaction)
  {
    nodes: ['withdrawalProcessing', 'qarToken', 'executionFailed', 'systemLogs'],
    edges: ['e6', 'e10', 'e13'],
    updateNode: {
      id: 'withdrawalProcessing',
      data: { status: 'BURNING_TOKENS' },
    },
  },

  // 9. Proposal Executed (Rewards Distribution)
  {
    nodes: ['qarToken', 'rewardsDistribution', 'withdrawalProcessing', 'executionFailed', 'systemLogs'],
    edges: ['e7', 'e10', 'e13'],
    updateNode: {
      id: 'rewardsDistribution',
      data: { status: 'CALCULATING' },
    },
  },

  // 10. Proposal Rejected
  {
    nodes: ['votingResults', 'proposalRejected', 'systemLogs'],
    edges: ['e11', 'e10'],
    updateNode: {
      id: 'proposalRejected',
      data: { status: 'REJECTED' },
    },
  },

  // 11. Canceled
  {
    nodes: ['bridgeContract', 'proposalCanceled', 'systemLogs'],
    edges: ['e14', 'e8'],
    updateNode: {
      id: 'proposalCanceled',
      data: { status: 'CANCELED' },
    },
  },

  // 12. Execution Failed
  {
    nodes: ['withdrawalProcessing', 'executionFailed', 'systemLogs'],
    edges: ['e13', 'e10'],
    updateNode: {
      id: 'executionFailed',
      data: { status: 'FAILED' },
    },
  },
];
