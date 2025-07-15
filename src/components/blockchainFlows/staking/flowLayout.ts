import { Node, Edge } from 'reactflow';

import { FlowEdgeData, FlowNodeData } from '../types';

const nodePositions = {
  // Top row
  user: { x: 0, y: 0 },
  wallet: { x: 300, y: 0 }, // Moved right by 50px
  tokenContract: { x: 600, y: 0 }, // Moved right by 100px

  // Middle row
  rewardsPool: { x: 300, y: 200 }, // Aligned with wallet
  stakingContract: { x: 600, y: 200 }, // Aligned with tokenContract

  // Bottom row
  timelock: { x: 600, y: 400 }, // Aligned with stakingContract
};

export const flowNodes: Node<FlowNodeData>[] = [
  {
    id: 'user',
    type: 'other',
    position: nodePositions.user,
    data: {
      label: 'User',
      type: 'other',
      status: 'NEW',
      tooltip: 'The user who is staking tokens to earn rewards.',
    },
  },
  {
    id: 'wallet',
    type: 'other',
    position: nodePositions.wallet,
    data: {
      label: 'User Wallet',
      type: 'other',
      status: 'NEW',
      statusByStep: {
        1: 'CONNECTED', // Step 1: Connect Wallet
        2: 'APPROVED', // Step 2: Approve Token Spending
        3: 'SENDING', // Step 3: Stake Tokens
        6: 'RECEIVING', // Step 6: Claim Rewards
        9: 'RECEIVING', // Step 9: Withdraw Tokens
        10: 'COMPLETE', // Step 10: Transaction Complete
      },
      tooltip: "The user's blockchain wallet containing their tokens.",
    },
  },
  {
    id: 'tokenContract',
    type: 'token',
    position: nodePositions.tokenContract,
    data: {
      label: 'Token Contract',
      type: 'token',
      status: 'NEW',
      statusByStep: {
        2: 'APPROVED', // Step 2: Approve Token Spending
        3: 'TRANSFERRING', // Step 3: Stake Tokens
        4: 'TRANSFERRED', // Step 4: Tokens Locked in Contract
        9: 'RETURNING', // Step 9: Withdraw Tokens
        10: 'COMPLETE', // Step 10: Transaction Complete
      },
      tooltip: 'The smart contract that manages the token being staked.',
    },
  },
  {
    id: 'stakingContract',
    type: 'proposer',
    position: nodePositions.stakingContract,
    data: {
      label: 'Staking Contract',
      type: 'proposer',
      status: 'NEW',
      statusByStep: {
        3: 'RECEIVING', // Step 3: Stake Tokens
        4: 'STAKED', // Step 4: Tokens Locked in Contract
        5: 'EARNING', // Step 5: Rewards Accumulation
        6: 'REWARDING', // Step 6: Claim Rewards
        7: 'UNSTAKING', // Step 7: Unstake Request
        8: 'COOLDOWN', // Step 8: Cooldown Period
        9: 'RELEASING', // Step 9: Withdraw Tokens
        10: 'COMPLETE', // Step 10: Transaction Complete
      },
      tooltip: 'The smart contract that manages the staking process and rewards distribution.',
    },
  },
  {
    id: 'rewardsPool',
    type: 'recipient',
    position: nodePositions.rewardsPool,
    data: {
      label: 'Rewards Pool',
      type: 'recipient',
      status: 'NEW',
      statusByStep: {
        5: 'ACCUMULATING', // Step 5: Rewards Accumulation
        6: 'DISTRIBUTING', // Step 6: Claim Rewards
        10: 'COMPLETE', // Step 10: Transaction Complete
      },
      tooltip: 'The pool of tokens used to distribute rewards to stakers.',
    },
  },
  {
    id: 'timelock',
    type: 'event',
    position: nodePositions.timelock,
    data: {
      label: 'Timelock',
      type: 'event',
      status: 'NEW',
      statusByStep: {
        7: 'STARTED', // Step 7: Unstake Request
        8: 'ACTIVE', // Step 8: Cooldown Period
        9: 'COMPLETED', // Step 9: Withdraw Tokens
        10: 'COMPLETE', // Step 10: Transaction Complete
      },
      tooltip: 'The timelock mechanism that enforces the cooldown period for unstaking.',
    },
  },
];

export const flowEdges: Edge<FlowEdgeData>[] = [
  // User to Wallet (Connect)
  {
    id: 'e1',
    source: 'user',
    target: 'wallet',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: {
      type: 'event',
      color: '#60a5fa',
      label: 'Connect',
    },
  },

  // Wallet to Token Contract (Approve)
  {
    id: 'e2',
    source: 'wallet',
    target: 'tokenContract',
    type: 'proposal',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: {
      type: 'proposal',
      color: '#fbbf24',
      label: 'Approve',
      labelOffset: 0, // Increased negative offset to move the arrow up more
    },
  },

  // Token Contract to Staking Contract (Stake)
  {
    id: 'e3',
    source: 'tokenContract',
    target: 'stakingContract',
    type: 'stakeEdge',
    sourceHandle: 'right',
    targetHandle: 'right',
    style: {
      stroke: '#60a5fa',
      strokeWidth: 2,
    },
    data: {
      type: 'event',
      color: '#60a5fa',
      label: 'Stake',
    },
  },

  // Staking Contract to Rewards Pool (Calculate)
  {
    id: 'e4',
    source: 'stakingContract',
    target: 'rewardsPool',
    type: 'event',
    sourceHandle: 'left',
    targetHandle: 'right',
    data: {
      type: 'event',
      color: '#34d399',
      label: 'Calculate',
    },
  },

  // Rewards Pool to Wallet (Claim)
  {
    id: 'e5',
    source: 'rewardsPool',
    target: 'wallet',
    type: 'event',
    sourceHandle: 'top',
    targetHandle: 'bottom',
    data: {
      type: 'event',
      color: '#34d399',
      label: 'Claim',
    },
  },

  // Staking Contract to Timelock (Request)
  {
    id: 'e6',
    source: 'stakingContract',
    target: 'timelock',
    type: 'voting',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: {
      type: 'voting',
      color: '#a78bfa',
      label: 'Request',
    },
  },

  // Timelock to Staking Contract (Complete)
  {
    id: 'e7',
    source: 'timelock',
    target: 'stakingContract',
    type: 'voting',
    sourceHandle: 'left',
    targetHandle: 'bottom',
    data: {
      type: 'voting',
      color: '#a78bfa',
      label: 'Complete',
    },
  },

  // Staking Contract to Token Contract (Withdraw)
  {
    id: 'e8',
    source: 'stakingContract',
    target: 'tokenContract',
    type: 'event',
    sourceHandle: 'top',
    targetHandle: 'bottom',
    data: {
      type: 'event',
      color: '#60a5fa',
      label: 'Withdraw',
    },
  },

  // Token Contract to Wallet (Return)
  {
    id: 'e9',
    source: 'tokenContract',
    target: 'wallet',
    type: 'returnEdge',
    sourceHandle: 'top',
    targetHandle: 'top',
    style: {
      stroke: '#60a5fa',
      strokeWidth: 2,
    },
    data: {
      type: 'event',
      color: '#60a5fa',
      label: 'Return',
    },
  },
];

// Node handles configuration for the staking flow
export const nodeHandles: Record<string, { [side: string]: boolean }> = {
  user: { right: true, top: true },
  wallet: { left: true, right: true, bottom: true, top: true }, // Added top handle
  tokenContract: { left: true, right: true, bottom: true, top: true }, // Added top handle
  stakingContract: { left: true, right: true, top: true, bottom: true },
  rewardsPool: { top: true, right: true },
  timelock: { top: true, right: true, left: true },
};
