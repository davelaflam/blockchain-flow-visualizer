import { StepHighlightMap } from '../types';

export const stepHighlightMap: StepHighlightMap[] = [
  // Step 0: Initial state - all nodes/edges dimmed
  { nodes: [], edges: [] },

  // 1. User Connects Wallet
  {
    nodes: ['user', 'wallet'],
    edges: ['e1'],
    updateNode: {
      id: 'user',
      data: { status: 'INITIALIZING' },
    },
  },

  // 2. User Approves Tokens
  {
    nodes: ['user', 'wallet', 'router'],
    edges: ['e1', 'e2'],
    updateNode: {
      id: 'wallet',
      data: { status: 'TOKENS_APPROVED' },
    },
  },

  // 3. Router Processes Transaction
  {
    nodes: ['wallet', 'router', 'validators'],
    edges: ['e2', 'e3'],
    updateNode: {
      id: 'router',
      data: { status: 'PROCESSING' },
    },
  },

  // 4. Token Swap Execution
  {
    nodes: ['router', 'liquidityPool', 'tokenA', 'tokenB', 'priceOracle'],
    edges: ['e4', 'e5', 'e6', 'e7'],
    updateNode: {
      id: 'router',
      data: { status: 'SWAP_EXECUTED' },
    },
  },

  // 5. Fees Collection
  {
    nodes: ['liquidityPool', 'tokenA', 'tokenB'],
    edges: ['e5', 'e6'],
    updateNode: {
      id: 'liquidityPool',
      data: { status: 'FEES_COLLECTED' },
    },
  },

  // 6. Liquidity Addition Validation
  {
    nodes: ['wallet', 'router', 'validators'],
    edges: ['e2', 'e3'],
    updateNode: {
      id: 'validators',
      data: { status: 'VALIDATING' },
    },
  },

  // 7. Liquidity Addition to Pool
  {
    nodes: ['router', 'liquidityPool', 'lpToken'],
    edges: ['e4', 'e8'],
    updateNode: {
      id: 'router',
      data: { status: 'LIQUIDITY_ADDED' },
    },
  },

  // 8. LP Token Minting
  {
    nodes: ['liquidityPool', 'lpToken', 'wallet'],
    edges: ['e8', 'e9'],
    updateNode: {
      id: 'lpToken',
      data: { status: 'COMPLETED' },
    },
  },

  // 9. Liquidity Removal Validation
  {
    nodes: ['wallet', 'lpToken', 'validators'],
    edges: ['e9', 'e3'],
    updateNode: {
      id: 'validators',
      data: { status: 'VALIDATING' },
    },
  },

  // 10. Liquidity Removal from Pool
  {
    nodes: ['router', 'liquidityPool', 'lpToken', 'tokenA', 'tokenB'],
    edges: ['e4', 'e5', 'e6', 'e8'],
    updateNode: {
      id: 'router',
      data: { status: 'LIQUIDITY_REMOVED' },
    },
  },
];
