import { Node, Edge } from 'reactflow';

import { FlowEdgeData, FlowNodeData } from '../types';

export const flowNodes: Node<FlowNodeData>[] = [
  // User and Wallet
  {
    id: 'user',
    type: 'event',
    position: { x: 0, y: 0 },
    data: {
      label: 'User',
      type: 'event',
      status: 'INITIALIZING',
      eventType: 'contract',
      tooltip: 'User initiates DEX interaction',
      apiEndpoints: ['/api/v1/dex/connect'],
      processFlow: 'User connects wallet → Selects tokens and amount → Confirms transaction',
      statusByStep: {
        1: 'INITIALIZING',
        2: 'PENDING',
        3: 'CONFIRMED',
      },
      statusTooltips: {
        INITIALIZING: 'Preparing DEX interaction',
        PENDING: 'Transaction submitted',
        CONFIRMED: 'Transaction confirmed',
      },
    },
  },
  {
    id: 'wallet',
    type: 'token',
    position: { x: 350, y: 0 },
    data: {
      label: 'Wallet',
      type: 'token',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: "User's wallet containing tokens",
      details: 'Stores tokens and approves token transfers',
      statusByStep: {
        1: 'IDLE',
        2: 'TOKENS_APPROVED',
        3: 'PROCESSING',
      },
      statusTooltips: {
        IDLE: 'Ready for transactions',
        TOKENS_APPROVED: 'Tokens approved for DEX',
        PROCESSING: 'Processing transaction',
      },
    },
  },

  // DEX Components
  {
    id: 'router',
    type: 'proposer',
    position: { x: 550, y: 175 },
    data: {
      label: 'Router Contract',
      type: 'proposer',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Smart contract that routes transactions to the appropriate liquidity pool',
      details: 'Handles token swaps and liquidity operations',
      statusByStep: {
        1: 'IDLE',
        3: 'PROCESSING',
        4: 'SWAP_EXECUTED',
        7: 'LIQUIDITY_ADDED',
        10: 'LIQUIDITY_REMOVED',
      },
      statusTooltips: {
        IDLE: 'Ready to process transactions',
        PROCESSING: 'Processing transaction',
        SWAP_EXECUTED: 'Swap transaction executed',
        LIQUIDITY_ADDED: 'Liquidity added to pool',
        LIQUIDITY_REMOVED: 'Liquidity removed from pool',
      },
    },
  },
  {
    id: 'liquidityPool',
    type: 'token',
    position: { x: 700, y: 350 },
    data: {
      label: 'Liquidity Pool',
      type: 'token',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Pool of tokens that enables trading',
      details: 'Holds token reserves and facilitates swaps',
      statusByStep: {
        1: 'IDLE',
        4: 'PRICE_UPDATED',
        5: 'FEES_COLLECTED',
        7: 'LIQUIDITY_ADDED',
        8: 'PRICE_UPDATED',
        10: 'LIQUIDITY_REMOVED',
      },
      statusTooltips: {
        IDLE: 'Pool ready for transactions',
        PRICE_UPDATED: 'Token price updated based on new ratio',
        FEES_COLLECTED: 'Trading fees collected',
        LIQUIDITY_ADDED: 'New liquidity added to pool',
        LIQUIDITY_REMOVED: 'Liquidity removed from pool',
      },
    },
  },
  {
    id: 'tokenA',
    type: 'token',
    position: { x: 575, y: 600 },
    data: {
      label: 'Token A',
      type: 'token',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'First token in the trading pair',
      statusByStep: {
        1: 'IDLE',
        4: 'PROCESSING',
        5: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Ready for trading',
        PROCESSING: 'Token being swapped',
        COMPLETED: 'Swap completed',
      },
    },
  },
  {
    id: 'tokenB',
    type: 'token',
    position: { x: 825, y: 600 },
    data: {
      label: 'Token B',
      type: 'token',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Second token in the trading pair',
      statusByStep: {
        1: 'IDLE',
        4: 'PROCESSING',
        5: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Ready for trading',
        PROCESSING: 'Token being swapped',
        COMPLETED: 'Swap completed',
      },
    },
  },

  // Oracle and Validators
  {
    id: 'priceOracle',
    type: 'other',
    position: { x: 1200, y: 250 },
    data: {
      label: 'Price Oracle',
      type: 'other',
      status: 'IDLE',
      eventType: 'ao',
      tooltip: 'Provides price data for tokens',
      details: 'Ensures fair pricing for swaps',
      statusByStep: {
        1: 'IDLE',
        4: 'PRICE_UPDATED',
        8: 'PRICE_UPDATED',
      },
      statusTooltips: {
        IDLE: 'Monitoring prices',
        PRICE_UPDATED: 'Price data updated',
      },
    },
  },
  {
    id: 'validators',
    type: 'voter',
    position: { x: 700, y: 0 },
    data: {
      label: 'Validators',
      type: 'voter',
      status: 'IDLE',
      eventType: 'ao',
      tooltip: 'Network validators that confirm transactions',
      details: 'Ensure transaction integrity and consensus',
      statusByStep: {
        1: 'IDLE',
        3: 'VALIDATING',
        4: 'TRANSACTION_VERIFIED',
        6: 'VALIDATING',
        7: 'TRANSACTION_VERIFIED',
        9: 'VALIDATING',
        10: 'TRANSACTION_VERIFIED',
      },
      statusTooltips: {
        IDLE: 'Ready to validate',
        VALIDATING: 'Validating transaction',
        TRANSACTION_VERIFIED: 'Transaction verified',
      },
    },
  },

  // LP Token
  {
    id: 'lpToken',
    type: 'token',
    position: { x: 350, y: 345 },
    data: {
      label: 'LP Token',
      type: 'token',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Liquidity Provider token representing share of the pool',
      details: 'Minted when adding liquidity, burned when removing',
      statusByStep: {
        1: 'IDLE',
        7: 'PROCESSING',
        8: 'COMPLETED',
        9: 'PROCESSING',
        10: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Ready for operations',
        PROCESSING: 'Being minted or burned',
        COMPLETED: 'Operation completed',
      },
    },
  },
];

export const flowEdges: Edge<FlowEdgeData>[] = [
  // User to Wallet
  {
    id: 'e1',
    source: 'user',
    target: 'wallet',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'event', color: '#6366f1', label: 'Connect Wallet' },
  },

  // Wallet to Router
  {
    id: 'e2',
    source: 'wallet',
    target: 'router',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'top',
    data: { type: 'event', color: '#6366f1', label: 'Approve & Send' },
  },

  // Router to Validators
  {
    id: 'e3',
    source: 'router',
    target: 'validators',
    type: 'proposal',
    sourceHandle: 'right',
    targetHandle: 'bottom',
    data: { type: 'proposal', color: '#8b5cf6', label: 'Validate' },
  },

  // Router to Liquidity Pool
  {
    id: 'e4',
    source: 'router',
    target: 'liquidityPool',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'event', color: '#10b981', label: 'Execute' },
  },

  // Liquidity Pool to Tokens
  {
    id: 'e5',
    source: 'liquidityPool',
    target: 'tokenA',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'event', color: '#10b981', label: 'Update Reserve' },
  },
  {
    id: 'e6',
    source: 'liquidityPool',
    target: 'tokenB',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'event', color: '#10b981', label: 'Update Reserve' },
  },

  // Oracle to Liquidity Pool
  {
    id: 'e7',
    source: 'priceOracle',
    target: 'liquidityPool',
    type: 'event',
    sourceHandle: 'left',
    targetHandle: 'right',
    data: { type: 'event', color: '#f59e0b', label: 'Price Data' },
  },

  // Liquidity Pool to LP Token
  {
    id: 'e8',
    source: 'liquidityPool',
    target: 'lpToken',
    type: 'event',
    sourceHandle: 'left',
    targetHandle: 'right',
    data: { type: 'event', color: '#10b981', label: 'Mint/Burn' },
  },

  // LP Token to Wallet
  {
    id: 'e9',
    source: 'lpToken',
    target: 'wallet',
    type: 'event',
    sourceHandle: 'top',
    targetHandle: 'bottom',
    data: { type: 'event', color: '#6366f1', label: 'Transfer' },
  },

  // Validators to Oracle
  {
    id: 'e10',
    source: 'validators',
    target: 'priceOracle',
    type: 'voting',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'voting', color: '#8b5cf6', label: 'Verify Price' },
  },
];

// Node handles configuration for the DEX flow
export const nodeHandles: Record<string, { [side: string]: boolean }> = {
  // User and Wallet
  user: { right: true },
  wallet: { left: true, right: true, bottom: true, top: true },

  // DEX Components
  router: { left: true, right: true, top: true, bottom: true },
  liquidityPool: { left: true, right: true, top: true, bottom: true },
  tokenA: { top: true, right: true },
  tokenB: { top: true, left: true },

  // Oracle and Validators
  priceOracle: { left: true, right: true },
  validators: { top: true, right: true, bottom: true, left: true },

  // LP Token
  lpToken: { top: true, right: true, left: true },
};
