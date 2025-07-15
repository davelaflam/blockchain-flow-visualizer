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

  // Step 3: Deposit Collateral
  {
    nodes: ['wallet', 'lendingPool', 'collateralManager'],
    edges: ['e3', 'e4'],
    updateNode: {
      id: 'lendingPool',
      data: { status: 'RECEIVING' },
    },
  },

  // Step 4: Collateral Locked
  {
    nodes: ['collateralManager', 'priceOracle'],
    edges: ['e5'],
    updateNode: {
      id: 'collateralManager',
      data: { status: 'COLLATERAL_LOCKED' },
    },
  },

  // Step 5: Borrow Assets
  {
    nodes: ['lendingPool', 'interestModel', 'wallet'],
    edges: ['e6', 'e7'],
    updateNode: {
      id: 'lendingPool',
      data: { status: 'LENDING' },
    },
  },

  // Step 6: Health Factor Monitoring
  {
    nodes: ['lendingPool', 'collateralManager', 'liquidationEngine', 'priceOracle', 'interestModel'],
    edges: ['e8', 'e9'],
    updateNode: {
      id: 'liquidationEngine',
      data: { status: 'MONITORING' },
    },
  },

  // Step 7: Liquidation Risk
  {
    nodes: ['collateralManager', 'liquidationEngine', 'priceOracle'],
    edges: ['e8', 'e9'],
    updateNode: {
      id: 'liquidationEngine',
      data: { status: 'ALERT' },
    },
  },

  // Step 8: Repay Loan
  {
    nodes: ['wallet', 'lendingPool', 'interestModel'],
    edges: ['e10', 'e11'],
    updateNode: {
      id: 'lendingPool',
      data: { status: 'REPAYMENT_RECEIVED' },
    },
  },

  // Step 9: Loan Closed
  {
    nodes: ['lendingPool'],
    edges: [],
    updateNode: {
      id: 'lendingPool',
      data: { status: 'UPDATED' },
    },
  },

  // Step 10: Withdraw Collateral
  {
    nodes: ['collateralManager', 'lendingPool', 'wallet'],
    edges: ['e12', 'e13'],
    updateNode: {
      id: 'collateralManager',
      data: { status: 'RELEASING' },
    },
  },

  // Step 11: Transaction Complete
  {
    nodes: [
      'user',
      'wallet',
      'tokenContract',
      'lendingPool',
      'collateralManager',
      'interestModel',
      'liquidationEngine',
      'priceOracle',
    ],
    edges: [],
    updateNode: {
      id: 'wallet',
      data: { status: 'COMPLETE' },
    },
  },
];
