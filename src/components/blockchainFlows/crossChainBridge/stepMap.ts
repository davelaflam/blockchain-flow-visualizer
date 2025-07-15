import { StepHighlightMap } from '../types';

export const stepHighlightMap: StepHighlightMap[] = [
  // Step 0: Initial state - all nodes/edges dimmed
  { nodes: [], edges: [] },

  // 1. User Interface
  {
    nodes: ['userInterface'],
    edges: [],
    updateNode: {
      id: 'userInterface',
      data: { status: 'INITIALIZING' },
    },
  },

  // 2. Pre-flight Checks
  {
    nodes: ['userInterface', 'preFlightChecks'],
    edges: ['e0-1'],
    updateNode: {
      id: 'preFlightChecks',
      data: { status: 'CHECKING' },
    },
  },

  // 3. User Initiates Cross-Chain Transfer
  {
    nodes: ['userInterface', 'preFlightChecks', 'userInitiate'],
    edges: ['e0-1', 'e0-2', 'e0-3'],
    updateNode: {
      id: 'userInitiate',
      data: { status: 'INITIALIZING' },
    },
  },

  // 4. Source Chain Contract Locks Tokens
  {
    nodes: ['userInitiate', 'sourceChainContract'],
    edges: ['e1'],
    updateNode: {
      id: 'sourceChainContract',
      data: { status: 'TOKENS_LOCKED' },
    },
  },

  // 5. Source Validators Validate Transaction
  {
    nodes: ['sourceValidators', 'sourceChainContract'],
    edges: ['e2'],
    updateNode: {
      id: 'sourceValidators',
      data: { status: 'VALIDATING' },
    },
  },

  // 6. Message Finalization
  {
    nodes: ['sourceChainContract', 'messageFinalization'],
    edges: ['e2-1'],
    updateNode: {
      id: 'messageFinalization',
      data: { status: 'PROCESSING' },
    },
  },

  // 7. Message Sent to Relayer Network
  {
    nodes: ['sourceValidators', 'messageFinalization', 'relayerNetwork', 'systemMonitor'],
    edges: ['e3', 'e3-1', 'e7', 'e8'],
    updateNode: {
      id: 'sourceValidators',
      data: { status: 'CONSENSUS_REACHED' },
    },
  },

  // 8. Relayer Network Processes Message
  {
    nodes: ['relayerNetwork', 'systemMonitor'],
    edges: ['e8'],
    updateNode: {
      id: 'relayerNetwork',
      data: { status: 'PROCESSING' },
    },
  },

  // 9. Relayer Queueing
  {
    nodes: ['relayerNetwork', 'relayerQueueing', 'systemMonitor'],
    edges: ['e3-2', 'e8'],
    updateNode: {
      id: 'relayerQueueing',
      data: { status: 'QUEUEING' },
    },
  },

  // 10. Message Relayed to Target Chain
  {
    nodes: ['relayerQueueing', 'targetValidators', 'systemMonitor'],
    edges: ['e4', 'e8'],
    updateNode: {
      id: 'relayerNetwork',
      data: { status: 'MESSAGE_RELAYED' },
    },
  },

  // 11. Target Validators Verify Message
  {
    nodes: ['targetValidators', 'targetChainContract', 'systemMonitor'],
    edges: ['e5', 'e9'],
    updateNode: {
      id: 'targetValidators',
      data: { status: 'VALIDATING' },
    },
  },

  // 12. Fallback Logic
  {
    nodes: ['targetChainContract', 'fallbackLogic', 'relayerNetwork'],
    edges: ['e6-1', 'e6-2'],
    updateNode: {
      id: 'fallbackLogic',
      data: { status: 'ACTIVATED' },
    },
  },

  // 13. Target Chain Contract Releases Tokens
  {
    nodes: ['targetChainContract', 'recipient', 'systemMonitor'],
    edges: ['e6', 'e9'],
    updateNode: {
      id: 'targetChainContract',
      data: { status: 'TOKENS_RELEASED' },
    },
  },

  // 14. Recipient Receives Tokens
  {
    nodes: ['recipient', 'systemMonitor'],
    edges: ['e9', 'e10'],
    updateNode: {
      id: 'recipient',
      data: { status: 'TOKENS_RECEIVED' },
    },
  },

  // 15. Transfer Complete
  {
    nodes: ['systemMonitor'],
    edges: [],
    updateNode: {
      id: 'systemMonitor',
      data: { status: 'COMPLETED' },
    },
  },
];
