import { Node, Edge } from 'reactflow';

import { FlowEdgeData, FlowNodeData } from '../types';

const nodePositions = {
  // Top row
  user: { x: 0, y: 0 },
  wallet: { x: 300, y: 0 },
  tokenContract: { x: 600, y: 0 },

  // Middle row
  lendingPool: { x: 300, y: 200 },
  collateralManager: { x: 600, y: 200 },

  // Bottom row
  interestModel: { x: 0, y: 400 },
  liquidationEngine: { x: 300, y: 400 },
  priceOracle: { x: 600, y: 400 },
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
      tooltip: 'The user who is depositing collateral and borrowing assets.',
    },
  },
  {
    id: 'wallet',
    type: 'walletNode',
    position: nodePositions.wallet,
    data: {
      label: 'User Wallet',
      type: 'other',
      status: 'NEW',
      statusByStep: {
        1: 'CONNECTED', // Step 1: Connect Wallet
        2: 'APPROVED', // Step 2: Approve Token Spending
        3: 'SENDING', // Step 3: Deposit Collateral
        5: 'RECEIVING', // Step 5: Borrow Assets
        8: 'SENDING', // Step 8: Repay Loan
        10: 'RECEIVING', // Step 10: Withdraw Collateral
        11: 'COMPLETE', // Step 11: Transaction Complete
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
        3: 'TRANSFERRING', // Step 3: Deposit Collateral
        5: 'TRANSFERRING', // Step 5: Borrow Assets
        8: 'TRANSFERRING', // Step 8: Repay Loan
        10: 'TRANSFERRING', // Step 10: Withdraw Collateral
        11: 'COMPLETE', // Step 11: Transaction Complete
      },
      tooltip: 'The smart contract that manages the tokens being used as collateral and borrowed.',
    },
  },
  {
    id: 'lendingPool',
    type: 'lendingPoolNode',
    position: nodePositions.lendingPool,
    data: {
      label: 'Lending Pool',
      type: 'proposer',
      status: 'NEW',
      statusByStep: {
        3: 'RECEIVING', // Step 3: Deposit Collateral
        4: 'COLLATERAL_LOCKED', // Step 4: Collateral Locked
        5: 'LENDING', // Step 5: Borrow Assets
        6: 'MONITORING', // Step 6: Health Factor Monitoring
        8: 'REPAYMENT_RECEIVED', // Step 8: Repay Loan
        9: 'UPDATED', // Step 9: Loan Closed
        10: 'RELEASING', // Step 10: Withdraw Collateral
        11: 'COMPLETE', // Step 11: Transaction Complete
      },
      tooltip: 'The main contract that manages lending and borrowing operations.',
    },
  },
  {
    id: 'collateralManager',
    type: 'recipient',
    position: nodePositions.collateralManager,
    data: {
      label: 'Collateral Manager',
      type: 'recipient',
      status: 'NEW',
      statusByStep: {
        3: 'RECEIVING', // Step 3: Deposit Collateral
        4: 'COLLATERAL_LOCKED', // Step 4: Collateral Locked
        6: 'MONITORING', // Step 6: Health Factor Monitoring
        7: 'LIQUIDATION_RISK', // Step 7: Liquidation Risk
        10: 'RELEASING', // Step 10: Withdraw Collateral
        11: 'COMPLETE', // Step 11: Transaction Complete
      },
      tooltip: 'Manages the collateral assets deposited by users.',
    },
  },
  {
    id: 'interestModel',
    type: 'event',
    position: nodePositions.interestModel,
    data: {
      label: 'Interest Model',
      type: 'event',
      status: 'NEW',
      statusByStep: {
        5: 'CALCULATING', // Step 5: Borrow Assets
        6: 'ACCRUING', // Step 6: Health Factor Monitoring
        8: 'UPDATED', // Step 8: Repay Loan
        11: 'COMPLETE', // Step 11: Transaction Complete
      },
      tooltip: 'Calculates interest rates based on utilization and other factors.',
    },
  },
  {
    id: 'liquidationEngine',
    type: 'event',
    position: nodePositions.liquidationEngine,
    data: {
      label: 'Liquidation Engine',
      type: 'event',
      status: 'NEW',
      statusByStep: {
        6: 'MONITORING', // Step 6: Health Factor Monitoring
        7: 'ALERT', // Step 7: Liquidation Risk
        11: 'COMPLETE', // Step 11: Transaction Complete
      },
      tooltip: 'Monitors loan health and triggers liquidations when necessary.',
    },
  },
  {
    id: 'priceOracle',
    type: 'event',
    position: nodePositions.priceOracle,
    data: {
      label: 'Price Oracle',
      type: 'event',
      status: 'NEW',
      statusByStep: {
        4: 'UPDATING', // Step 4: Collateral Locked
        6: 'MONITORING', // Step 6: Health Factor Monitoring
        7: 'PRICE_UPDATED', // Step 7: Liquidation Risk
        11: 'COMPLETE', // Step 11: Transaction Complete
      },
      tooltip: 'Provides price data for calculating collateral value and loan-to-value ratios.',
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
    },
  },

  // Wallet to Lending Pool (Deposit)
  {
    id: 'e3',
    source: 'wallet',
    target: 'lendingPool',
    type: 'event',
    sourceHandle: 'bottom-deposit',
    targetHandle: 'top-deposit',
    data: {
      type: 'event',
      color: '#60a5fa',
      label: 'Deposit',
    },
  },

  // Lending Pool to Collateral Manager (Lock)
  {
    id: 'e4',
    source: 'lendingPool',
    target: 'collateralManager',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: {
      type: 'event',
      color: '#34d399',
      label: 'Lock',
    },
  },

  // Collateral Manager to Price Oracle (Value)
  {
    id: 'e5',
    source: 'collateralManager',
    target: 'priceOracle',
    type: 'valueEdge',
    sourceHandle: 'right',
    targetHandle: 'right',
    style: {
      stroke: '#a78bfa',
      strokeWidth: 2,
    },
    data: {
      type: 'event',
      color: '#a78bfa',
      label: 'Value',
    },
  },

  // Lending Pool to Interest Model (Calculate)
  {
    id: 'e6',
    source: 'lendingPool',
    target: 'interestModel',
    type: 'event',
    sourceHandle: 'left',
    targetHandle: 'top',
    data: {
      type: 'event',
      color: '#a78bfa',
      label: 'Calculate',
    },
  },

  // Lending Pool to Wallet (Borrow)
  {
    id: 'e7',
    source: 'lendingPool',
    target: 'wallet',
    type: 'event',
    sourceHandle: 'top-borrow',
    targetHandle: 'bottom-borrow',
    data: {
      type: 'event',
      color: '#60a5fa',
      label: 'Borrow',
    },
  },

  // Collateral Manager to Liquidation Engine (Monitor)
  {
    id: 'e8',
    source: 'collateralManager',
    target: 'liquidationEngine',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'right',
    data: {
      type: 'event',
      color: '#ef4444',
      label: 'Monitor',
    },
  },

  // Price Oracle to Liquidation Engine (Update)
  {
    id: 'e9',
    source: 'priceOracle',
    target: 'liquidationEngine',
    type: 'updateEdge',
    sourceHandle: 'bottom',
    targetHandle: 'bottom',
    style: {
      stroke: '#a78bfa',
      strokeWidth: 2,
    },
    data: {
      type: 'event',
      color: '#a78bfa',
      label: 'Update',
    },
  },

  // Wallet to Lending Pool (Repay)
  {
    id: 'e10',
    source: 'wallet',
    target: 'lendingPool',
    type: 'event',
    sourceHandle: 'bottom-repay',
    targetHandle: 'top-repay',
    data: {
      type: 'event',
      color: '#60a5fa',
      label: 'Repay',
    },
  },

  // Lending Pool to Interest Model (Update)
  {
    id: 'e11',
    source: 'lendingPool',
    target: 'interestModel',
    type: 'event',
    sourceHandle: 'left',
    targetHandle: 'right',
    data: {
      type: 'event',
      color: '#a78bfa',
      label: 'Update',
    },
  },

  // Collateral Manager to Lending Pool (Release)
  {
    id: 'e12',
    source: 'collateralManager',
    target: 'lendingPool',
    type: 'releaseEdge',
    sourceHandle: 'top',
    targetHandle: 'bottom',
    style: {
      stroke: '#34d399',
      strokeWidth: 2,
    },
    data: {
      type: 'event',
      color: '#34d399',
      label: 'Release',
    },
  },

  // Lending Pool to Wallet (Withdraw)
  {
    id: 'e13',
    source: 'lendingPool',
    target: 'wallet',
    type: 'event',
    sourceHandle: 'top-withdraw',
    targetHandle: 'bottom-withdraw',
    data: {
      type: 'event',
      color: '#60a5fa',
      label: 'Withdraw',
    },
  },
];

// Node handles configuration for the lending flow
export const nodeHandles: Record<string, { [side: string]: boolean }> = {
  user: { right: true, top: true },
  wallet: { left: true, right: true, top: true }, // Removed bottom handle as it's replaced by custom handles
  tokenContract: { left: true, right: true, bottom: true, top: true },
  lendingPool: { left: true, right: true, bottom: true }, // Removed top handle as it's replaced by custom handles
  collateralManager: { left: true, right: true, top: true, bottom: true },
  interestModel: { top: true, right: true, left: true },
  liquidationEngine: { right: true, bottom: true, left: true },
  priceOracle: { top: true, left: true, bottom: true, right: true },
};
