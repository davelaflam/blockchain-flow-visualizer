import { StepHighlightMap } from '../types';

export const stepHighlightMap: StepHighlightMap[] = [
  // Step 0: Landing phase - all nodes/edges dimmed
  { nodes: [], edges: [] },

  // Step 1: Connect Wallet
  {
    nodes: ['user', 'wallet'],
    edges: ['e1'],
    updateNode: {
      id: 'wallet',
      data: { status: 'CONNECTED' },
    },
  },

  // Step 2: Approve Token Spending
  {
    nodes: ['wallet', 'tokenContract'],
    edges: ['e2'],
    updateNode: {
      id: 'tokenContract',
      data: { status: 'APPROVED' },
    },
  },

  // Step 3: Stake Tokens
  {
    nodes: ['wallet', 'tokenContract', 'stakingContract'],
    edges: ['e3'],
    updateNode: {
      id: 'stakingContract',
      data: { status: 'RECEIVING' },
    },
  },

  // Step 4: Tokens Locked in Contract
  {
    nodes: ['stakingContract'],
    edges: [],
    updateNode: {
      id: 'stakingContract',
      data: { status: 'STAKED' },
    },
  },

  // Step 5: Rewards Accumulation
  {
    nodes: ['stakingContract', 'rewardsPool'],
    edges: ['e4'],
    updateNode: {
      id: 'rewardsPool',
      data: { status: 'ACCUMULATING' },
    },
  },

  // Step 6: Claim Rewards
  {
    nodes: ['rewardsPool', 'wallet'],
    edges: ['e5'],
    updateNode: {
      id: 'rewardsPool',
      data: { status: 'DISTRIBUTING' },
    },
  },

  // Step 7: Unstake Request
  {
    nodes: ['stakingContract', 'timelock'],
    edges: ['e6'],
    updateNode: {
      id: 'timelock',
      data: { status: 'STARTED' },
    },
  },

  // Step 8: Cooldown Period
  {
    nodes: ['timelock'],
    edges: [],
    updateNode: {
      id: 'timelock',
      data: { status: 'ACTIVE' },
    },
  },

  // Step 9: Withdraw Tokens
  {
    nodes: ['timelock', 'stakingContract', 'tokenContract', 'wallet'],
    edges: ['e7', 'e8', 'e9'],
    updateNode: {
      id: 'stakingContract',
      data: { status: 'RELEASING' },
    },
  },

  // Step 10: Transaction Complete
  {
    nodes: ['user', 'wallet', 'tokenContract', 'stakingContract', 'rewardsPool', 'timelock'],
    edges: [],
    updateNode: {
      id: 'wallet',
      data: { status: 'COMPLETE' },
    },
  },
];
