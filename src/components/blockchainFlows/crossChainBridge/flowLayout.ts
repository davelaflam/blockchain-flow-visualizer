import { Node, Edge } from 'reactflow';

import { FlowNodeData, FlowEdgeData } from '../types';

export const flowNodes: Node<FlowNodeData>[] = [
  {
    id: 'preFlightChecks',
    type: 'proposer',
    position: { x: 180, y: 0 },
    data: {
      label: 'Pre-flight Checks',
      type: 'process',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Checks performed before initiating the transfer',
      details: 'Checks gas fees, token allowance, and bridge availability',
      statusByStep: {
        1: 'IDLE',
        2: 'CHECKING',
        3: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Ready to perform checks',
        CHECKING: 'Performing pre-flight checks',
        COMPLETED: 'Pre-flight checks completed',
      },
    },
  },
  {
    id: 'userInterface',
    type: 'event',
    position: { x: 0, y: 200 },
    data: {
      label: 'User Interface',
      type: 'event',
      status: 'INITIALIZING',
      eventType: 'contract',
      tooltip: 'User interacts with the bridge interface',
      apiEndpoints: ['/api/v1/bridge/transfer'],
      processFlow: 'User connects wallet → Selects token and amount → Reviews transaction details',
      statusByStep: {
        1: 'INITIALIZING',
        2: 'PENDING',
        3: 'CONFIRMED',
      },
      statusTooltips: {
        INITIALIZING: 'Preparing cross-chain transfer',
        PENDING: 'User reviewing transaction details',
        CONFIRMED: 'User confirmed transaction details',
      },
    },
  },
  {
    id: 'userInitiate',
    type: 'event',
    position: { x: 350, y: 200 },
    data: {
      label: 'User Initiate',
      type: 'event',
      status: 'INITIALIZING',
      eventType: 'contract',
      tooltip: 'User initiates a cross-chain transfer',
      apiEndpoints: ['/api/v1/bridge/transfer'],
      processFlow: 'User approves token allowance → Signs transaction → Submits to blockchain',
      statusByStep: {
        1: 'INITIALIZING',
        2: 'PENDING',
        3: 'CONFIRMED',
        4: 'COMPLETED',
      },
      statusTooltips: {
        INITIALIZING: 'Preparing cross-chain transfer',
        PENDING: 'Transfer transaction submitted',
        CONFIRMED: 'Transfer confirmed on source chain',
        COMPLETED: 'Transfer initiated successfully',
      },
    },
  },
  {
    id: 'sourceChainContract',
    type: 'proposer',
    position: { x: 700, y: 190 },
    data: {
      label: 'Source Chain Contract',
      type: 'proposer',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Smart contract on the source blockchain',
      details: 'Checks token allowance, locks tokens and initiates the cross-chain message',
      statusByStep: {
        1: 'IDLE',
        2: 'VALIDATING',
        3: 'TOKENS_LOCKED',
        4: 'MESSAGE_SENT',
      },
      statusTooltips: {
        IDLE: 'Ready to process transfers',
        VALIDATING: 'Validating transfer request and token allowance',
        TOKENS_LOCKED: 'Tokens locked in contract',
        MESSAGE_SENT: 'Cross-chain message sent',
      },
    },
  },
  {
    id: 'messageFinalization',
    type: 'proposer',
    position: { x: 900, y: 0 },
    data: {
      label: 'Message Finalization',
      type: 'process',
      status: 'IDLE',
      eventType: 'relayer',
      tooltip: 'Finalizing the cross-chain message',
      details: 'Creating message hash and signing the relayer payload',
      statusByStep: {
        1: 'IDLE',
        4: 'PROCESSING',
        5: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Waiting for message',
        PROCESSING: 'Creating and signing message',
        COMPLETED: 'Message finalized and signed',
      },
    },
  },
  {
    id: 'relayerNetwork',
    type: 'proposer',
    position: { x: 900, y: 400 },
    data: {
      label: 'Relayer Network',
      type: 'proposer',
      status: 'IDLE',
      eventType: 'relayer',
      tooltip: 'Network of relayers that transmit messages between chains',
      details: 'Validates and relays cross-chain messages with signed payloads',
      statusByStep: {
        1: 'IDLE',
        4: 'RECEIVING',
        5: 'PROCESSING',
        6: 'MESSAGE_RELAYED',
      },
      statusTooltips: {
        IDLE: 'Waiting for messages',
        RECEIVING: 'Receiving cross-chain message',
        PROCESSING: 'Processing and validating message',
        MESSAGE_RELAYED: 'Message successfully relayed',
      },
    },
  },
  {
    id: 'relayerQueueing',
    type: 'event',
    position: { x: 1150, y: 190 },
    data: {
      label: 'Relayer Queueing',
      type: 'process',
      status: 'IDLE',
      eventType: 'relayer',
      tooltip: 'Queueing and selection of relayers',
      details: 'Multiple relayers queue and select messages to relay',
      statusByStep: {
        1: 'IDLE',
        5: 'QUEUEING',
        6: 'SELECTED',
      },
      statusTooltips: {
        IDLE: 'Waiting for messages',
        QUEUEING: 'Relayers queueing for message',
        SELECTED: 'Relayer selected for message',
      },
    },
  },

  // Target Chain
  {
    id: 'targetChainContract',
    type: 'token',
    position: { x: 1550, y: 390 },
    data: {
      label: 'Target Chain Contract',
      type: 'token',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Smart contract on the target blockchain',
      details: 'Receives messages, verifies with replay protection, and releases tokens (native or wrapped)',
      statusByStep: {
        1: 'IDLE',
        6: 'MESSAGE_RECEIVED',
        7: 'VALIDATING',
        8: 'TOKENS_RELEASED',
      },
      statusTooltips: {
        IDLE: 'Ready to receive messages',
        MESSAGE_RECEIVED: 'Cross-chain message received',
        VALIDATING: 'Validating message authenticity and checking messageHash/nonce for replay protection',
        TOKENS_RELEASED: 'Tokens released to recipient (native tokens if same asset, wrapped tokens if cross-asset)',
      },
    },
  },
  {
    id: 'fallbackLogic',
    type: 'proposer',
    position: { x: 1200, y: 400 },
    data: {
      label: 'Fallback Logic',
      type: 'process',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Fallback logic for failed cross-chain execution',
      details: 'Handles timeouts and retries for failed message delivery',
      statusByStep: {
        1: 'IDLE',
        7: 'STANDBY',
        8: 'ACTIVATED',
      },
      statusTooltips: {
        IDLE: 'Ready for fallback scenarios',
        STANDBY: 'Monitoring for failures',
        ACTIVATED: 'Fallback logic activated',
      },
    },
  },
  {
    id: 'recipient',
    type: 'recipient',
    position: { x: 1550, y: 600 },
    data: {
      label: 'Recipient',
      type: 'recipient',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'User or smart contract receiving tokens on the target chain',
      details: 'For smart contract recipients, onTokenReceived() hook may be triggered',
      statusByStep: {
        1: 'IDLE',
        8: 'PENDING',
        9: 'TOKENS_RECEIVED',
        10: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Waiting for transfer',
        PENDING: 'Transfer pending',
        TOKENS_RECEIVED: 'Tokens received (smart contracts may execute onTokenReceived hook)',
        COMPLETED: 'Transfer completed',
      },
    },
  },

  // Validators
  {
    id: 'sourceValidators',
    type: 'voter',
    position: { x: 350, y: 410 },
    data: {
      label: 'Source Validators',
      type: 'voter',
      status: 'IDLE',
      eventType: 'ao',
      tooltip: 'Validators on the source chain',
      details: 'Validate and sign cross-chain messages',
      quorumData: {
        required: '2/3',
        actual: '0/3',
        votes: {
          for: '0',
          against: '0',
          abstain: '0',
        },
      },
      statusByStep: {
        1: 'IDLE',
        3: 'VALIDATING',
        4: 'CONSENSUS_REACHED',
        5: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Ready to validate',
        VALIDATING: 'Validating transaction (2/3 multisig required)',
        CONSENSUS_REACHED: 'Consensus reached among validators (quorum achieved)',
        COMPLETED: 'Validation completed',
      },
    },
  },
  {
    id: 'targetValidators',
    type: 'voter',
    position: { x: 1550, y: 0 },
    data: {
      label: 'Target Validators',
      type: 'voter',
      status: 'IDLE',
      eventType: 'ao',
      tooltip: 'Validators on the target chain',
      details: 'Verify cross-chain messages and authorize token release',
      quorumData: {
        required: '2/3',
        actual: '0/3',
        votes: {
          for: '0',
          against: '0',
          abstain: '0',
        },
      },
      statusByStep: {
        1: 'IDLE',
        6: 'VALIDATING',
        7: 'CONSENSUS_REACHED',
        8: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Ready to validate',
        VALIDATING: 'Validating cross-chain message (2/3 multisig required)',
        CONSENSUS_REACHED: 'Consensus reached among validators (quorum achieved)',
        COMPLETED: 'Validation completed',
      },
    },
  },

  // System Monitoring
  {
    id: 'systemMonitor',
    type: 'other',
    position: { x: 810, y: 610 },
    data: {
      label: 'System Monitor',
      type: 'other',
      status: 'IDLE',
      eventType: 'ao',
      tooltip: 'Monitors the entire cross-chain process',
      details: 'Tracks metrics: transfers completed, tokens moved, average completion time',
      statusByStep: {
        1: 'MONITORING',
        10: 'COMPLETED',
      },
      statusTooltips: {
        MONITORING: 'Monitoring cross-chain transfer',
        COMPLETED: 'Transfer monitoring completed. Metrics updated: 1 transfer, 100 tokens moved, 5 min avg time',
      },
    },
  },
];

export const flowEdges: Edge<FlowEdgeData>[] = [
  // User Interface and Pre-flight Checks (Light Blue)
  {
    id: 'e0-1',
    source: 'userInterface',
    target: 'preFlightChecks',
    type: 'event',
    sourceHandle: 'top',
    targetHandle: 'left',
    data: { type: 'event', color: '#38bdf8', label: 'Prepare Transfer' },
  },
  {
    id: 'e0-2',
    source: 'userInterface',
    target: 'userInitiate',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'event', color: '#38bdf8', label: 'UI Interaction' },
  },
  {
    id: 'e0-3',
    source: 'preFlightChecks',
    target: 'userInitiate',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'top',
    data: { type: 'event', color: '#38bdf8', label: 'Checks Passed' },
  },

  // Source Chain Flow (Blue)
  {
    id: 'e1',
    source: 'userInitiate',
    target: 'sourceChainContract',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'event', color: '#6366f1', label: 'Initiate Transfer' },
  },
  {
    id: 'e2',
    source: 'sourceChainContract',
    target: 'sourceValidators',
    type: 'proposal',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'proposal', color: '#8b5cf6', label: 'Validate' },
  },
  {
    id: 'e2-1',
    source: 'sourceChainContract',
    target: 'messageFinalization',
    type: 'proposal',
    sourceHandle: 'top',
    targetHandle: 'left',
    data: { type: 'proposal', color: '#8b5cf6', label: 'Prepare Message' },
  },
  {
    id: 'e3',
    source: 'sourceValidators',
    target: 'relayerNetwork',
    type: 'voting',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'voting', color: '#8b5cf6', label: 'Submit Message' },
  },
  {
    id: 'e3-1',
    source: 'messageFinalization',
    target: 'relayerNetwork',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'event', color: '#8b5cf6', label: 'Signed Payload' },
  },

  // Relayer Network and Queueing (Purple)
  {
    id: 'e3-2',
    source: 'relayerNetwork',
    target: 'relayerQueueing',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'bottom',
    data: { type: 'event', color: '#8b5cf6', label: 'Queue Message' },
  },

  // Relayer to Target Chain (Green)
  {
    id: 'e4',
    source: 'relayerQueueing',
    target: 'targetValidators',
    type: 'event',
    sourceHandle: 'top',
    targetHandle: 'left',
    data: { type: 'event', color: '#10b981', label: 'Relay Message (Relayers pay gas on target chain)' },
  },
  {
    id: 'e5',
    source: 'targetValidators',
    target: 'targetChainContract',
    type: 'voting',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'voting', color: '#10b981', label: 'Authorize Release' },
  },
  {
    id: 'e6',
    source: 'targetChainContract',
    target: 'recipient',
    type: 'releaseTokensEdge',
    sourceHandle: 'right',
    targetHandle: 'right',
    data: { type: 'releaseTokensEdge', color: '#10b981', label: 'Release Tokens' },
  },

  // Fallback Logic (Red)
  {
    id: 'e6-1',
    source: 'targetChainContract',
    target: 'fallbackLogic',
    type: 'event',
    sourceHandle: 'left',
    targetHandle: 'right',
    data: { type: 'event', color: '#ef4444', label: 'Failure Handling' },
  },
  {
    id: 'e6-2',
    source: 'fallbackLogic',
    target: 'relayerNetwork',
    type: 'event',
    sourceHandle: 'left',
    targetHandle: 'right',
    data: { type: 'event', color: '#ef4444', label: 'Retry' },
  },

  // Monitoring Connections (Gray)
  {
    id: 'e7',
    source: 'sourceChainContract',
    target: 'systemMonitor',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'left',
    data: { type: 'event', color: '#64748b', label: 'Monitor' },
  },
  {
    id: 'e8',
    source: 'relayerNetwork',
    target: 'systemMonitor',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'event', color: '#64748b', label: 'Monitor' },
  },
  {
    id: 'e9',
    source: 'targetChainContract',
    target: 'systemMonitor',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'right',
    data: { type: 'event', color: '#64748b', label: 'Monitor' },
  },
  {
    id: 'e10',
    source: 'recipient',
    target: 'systemMonitor',
    type: 'event',
    sourceHandle: 'left',
    targetHandle: 'right',
    data: { type: 'event', color: '#64748b', label: 'Update Metrics' },
  },
];

// Node handles configuration for the Cross-Chain Bridge flow
export const nodeHandles: Record<string, { [side: string]: boolean }> = {
  // Entry points
  userInterface: { right: true, top: true },
  userInitiate: { right: true, left: true, top: true },

  // Pre-flight and processing nodes
  preFlightChecks: { left: true, right: true, bottom: true, top: true },
  messageFinalization: { left: true, right: true, bottom: true, top: true },
  relayerQueueing: { left: true, right: true, bottom: true, top: true },
  fallbackLogic: { left: true, right: true, bottom: true, top: true },

  // Source chain nodes
  sourceChainContract: { left: true, right: true, top: true, bottom: true },
  sourceValidators: { top: true, right: true, bottom: true },

  // Relayer network
  relayerNetwork: { left: true, right: true, top: true, bottom: true },

  // Target chain nodes
  targetValidators: { left: true, top: true, bottom: true, right: true },
  targetChainContract: { top: true, right: true, bottom: true, left: true },
  recipient: { left: true, bottom: true, right: true },

  // System monitoring
  systemMonitor: { top: true, bottom: true, left: true, right: true },
};
