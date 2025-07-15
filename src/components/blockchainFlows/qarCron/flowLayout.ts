import { Node, Edge } from 'reactflow';

import { FlowEdgeData, FlowNodeData } from '../types';

// Node positions for the flow chart - professionally aligned layout
export const nodePositions = {
  // Left column
  cronTrigger: { x: 0, y: 260 }, // Left side - starting point

  // Middle-left column
  qarCronProcess: { x: 320, y: 260 }, // Central coordinator
  systemLogs: { x: 320, y: 100 }, // Top position for logs (above central coordinator)

  // Middle-right column
  qarTokenProcess: { x: 680, y: 260 }, // Right of cron process

  // Right column - vertically distributed with more space
  depositConfirmation: { x: 1000, y: 120 }, // Top-right operation with more vertical space
  withdrawalProcessing: { x: 1000, y: 260 }, // Middle-right operation aligned with token process
  tokenMinting: { x: 1000, y: 400 }, // Bottom-right operation with more separation
};

// Define node handles (connection points) configuration with optimized connection points
export const nodeHandles = {
  cronTrigger: {
    right: true,
  },
  qarCronProcess: {
    top: true, // For connection to systemLogs
    left: true, // For connection from cronTrigger
    right: true, // For connection to qarTokenProcess
  },
  systemLogs: {
    bottom: true, // For connection from qarCronProcess
  },
  qarTokenProcess: {
    left: true, // For connection from qarCronProcess
    'right-top': true, // For connection to depositConfirmation
    'right-middle': true, // For connection to withdrawalProcessing
    'right-bottom': true, // For connection to tokenMinting
    bottom: true, // Additional handle at the bottom
    right: true, // Additional handle on the right side
  },
  depositConfirmation: {
    left: true, // For connection from qarTokenProcess
  },
  withdrawalProcessing: {
    left: true, // For connection from qarTokenProcess
  },
  tokenMinting: {
    left: true, // For connection from qarTokenProcess
  },
};

// Define the flow nodes with enhanced styling to match reference design
export const flowNodes: Node<FlowNodeData>[] = [
  {
    id: 'cronTrigger',
    type: 'event',
    position: nodePositions.cronTrigger,
    data: {
      label: 'Cron Scheduler',
      description: 'Runs every 24 hours to process token operations',
      type: 'trigger',
      status: 'IDLE',
      statusByStep: {
        0: 'IDLE',
        1: 'INITIALIZING',
        2: 'RUNNING',
        3: 'FINALIZING',
        4: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Waiting for the next scheduled run',
        INITIALIZING: 'Initializing cron job execution',
        RUNNING: 'Cron job is executing operations',
        FINALIZING: 'Finalizing cron job execution',
        COMPLETED: 'Cron job completed successfully',
        FAILED: 'Cron job encountered an error',
        PENDING: 'Pending execution',
        PROCESSING: 'Processing operations',
        VERIFYING: 'Verifying operations',
        UPDATING: 'Updating system state',
        EXECUTING: 'Executing commands',
      } as const,
      handles: nodeHandles.cronTrigger,
      style: {
        width: 180,
        height: 80,
        background: 'rgba(25, 118, 210, 0.15)', // Blue background
        borderColor: '#1976D2',
        borderRadius: 8,
      },
    },
  },
  {
    id: 'qarCronProcess',
    type: 'event',
    position: nodePositions.qarCronProcess,
    data: {
      label: 'QAR Cron Process',
      description: 'Coordinates token operations via scheduled events',
      type: 'process',
      status: 'IDLE',
      statusByStep: {
        0: 'IDLE',
        1: 'INITIALIZING',
        2: 'COORDINATING',
        3: 'MONITORING',
        4: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Waiting for cron trigger',
        INITIALIZING: 'Initializing token operations',
        COORDINATING: 'Coordinating token operations',
        MONITORING: 'Monitoring operation progress',
        COMPLETED: 'All operations completed successfully',
        FAILED: 'Error processing token operations',
        PENDING: 'Pending operations',
        PROCESSING: 'Processing token operations',
        VERIFYING: 'Verifying token operations',
        UPDATING: 'Updating token state',
        EXECUTING: 'Executing token operations',
        FINALIZING: 'Finalizing token operations',
      } as const,
      handles: nodeHandles.qarCronProcess,
      style: {
        width: 180,
        height: 80,
        background: 'rgba(0, 150, 136, 0.15)', // Teal background
        borderColor: '#009688',
        borderRadius: 8,
      },
    },
  },
  {
    id: 'systemLogs',
    type: 'other',
    position: nodePositions.systemLogs,
    data: {
      label: 'System Logs',
      description: 'Records all system events and actions',
      type: 'logs',
      status: 'IDLE',
      statusByStep: {
        0: 'IDLE',
        1: 'INITIALIZING',
        2: 'LOGGING',
        3: 'UPDATING',
        4: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Ready to log system events',
        INITIALIZING: 'Initializing logging system',
        LOGGING: 'Recording system events',
        UPDATING: 'Updating log entries',
        COMPLETED: 'All events logged successfully',
        FAILED: 'Error writing to system logs',
        PENDING: 'Pending log entries',
        PROCESSING: 'Processing log entries',
        VERIFYING: 'Verifying log entries',
        EXECUTING: 'Writing log entries',
        FINALIZING: 'Finalizing log updates',
      } as const,
      handles: nodeHandles.systemLogs,
      style: {
        width: 180,
        height: 80,
        background: 'rgba(96, 125, 139, 0.15)', // Blue-grey background
        borderColor: '#607D8B',
        borderRadius: 8,
      },
    },
  },
  {
    id: 'qarTokenProcess',
    type: 'event',
    position: nodePositions.qarTokenProcess,
    data: {
      label: 'QAR Token Process',
      description: 'Central processor for token operations',
      type: 'token',
      status: 'IDLE',
      statusByStep: {
        0: 'IDLE',
        1: 'INITIALIZING',
        2: 'PROCESSING',
        3: 'FINALIZING',
        4: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Waiting for operation commands',
        INITIALIZING: 'Initializing token processor',
        PROCESSING: 'Processing token operations',
        FINALIZING: 'Finalizing token operations',
        COMPLETED: 'All operations completed successfully',
        FAILED: 'Error processing token operations',
        PENDING: 'Pending token operations',
        VERIFYING: 'Verifying token operations',
        UPDATING: 'Updating token state',
        EXECUTING: 'Executing token operations',
        MONITORING: 'Monitoring token operations',
      } as const,
      handles: nodeHandles.qarTokenProcess,
      style: {
        width: 180,
        height: 80,
        background: 'rgba(0, 150, 136, 0.15)', // Teal background
        borderColor: '#009688',
        borderRadius: 8,
      },
    },
  },
  {
    id: 'depositConfirmation',
    type: 'token',
    position: nodePositions.depositConfirmation,
    data: {
      label: 'Deposit Confirmation',
      description: 'Verifies blockchain confirmations for deposits and updates balances',
      type: 'confirmation',
      status: 'IDLE',
      statusByStep: {
        0: 'IDLE',
        1: 'PENDING',
        2: 'VERIFYING',
        3: 'UPDATING',
        4: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Waiting for deposit operations',
        PENDING: 'Pending deposit confirmations',
        VERIFYING: 'Verifying blockchain confirmations',
        UPDATING: 'Updating user balances',
        COMPLETED: 'Deposit processing completed',
        FAILED: 'Error processing deposits',
        INITIALIZING: 'Initializing deposit processing',
        PROCESSING: 'Processing deposits',
        EXECUTING: 'Executing deposit operations',
        FINALIZING: 'Finalizing deposit processing',
        MONITORING: 'Monitoring deposit status',
      } as const,
      handles: nodeHandles.depositConfirmation,
      style: {
        width: 180,
        height: 80,
        background: 'rgba(156, 39, 176, 0.15)', // Purple background
        borderColor: '#9C27B0',
        borderRadius: 8,
      },
    },
  },
  {
    id: 'withdrawalProcessing',
    type: 'token',
    position: nodePositions.withdrawalProcessing,
    data: {
      label: 'Withdrawal Processing',
      description: 'Executes withdrawal transactions for user requests that meet requirements',
      type: 'withdrawal',
      status: 'IDLE',
      statusByStep: {
        0: 'IDLE',
        1: 'PENDING',
        2: 'VALIDATING',
        3: 'EXECUTING',
        4: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Waiting for withdrawal requests',
        PENDING: 'Processing withdrawal queue',
        VALIDATING: 'Validating withdrawal requests',
        EXECUTING: 'Executing withdrawal transactions',
        COMPLETED: 'Withdrawals processed successfully',
        FAILED: 'Error processing withdrawals',
        INITIALIZING: 'Initializing withdrawal processing',
        PROCESSING: 'Processing withdrawals',
        VERIFYING: 'Verifying withdrawal details',
        UPDATING: 'Updating withdrawal status',
        FINALIZING: 'Finalizing withdrawal processing',
      } as const,
      handles: nodeHandles.withdrawalProcessing,
      style: {
        width: 180,
        height: 80,
        background: 'rgba(156, 39, 176, 0.15)', // Purple background
        borderColor: '#9C27B0',
        borderRadius: 8,
      },
    },
  },
  {
    id: 'tokenMinting',
    type: 'token',
    position: nodePositions.tokenMinting,
    data: {
      label: 'Token Minting',
      description: 'Issues new tokens according to the predefined tokenomics rules',
      type: 'minting',
      status: 'IDLE',
      statusByStep: {
        0: 'IDLE',
        1: 'PENDING',
        2: 'CALCULATING',
        3: 'MINTING',
        4: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Waiting for minting cycle',
        PENDING: 'Preparing minting operation',
        CALCULATING: 'Calculating minting amounts',
        MINTING: 'Minting new tokens',
        COMPLETED: 'Tokens minted successfully',
        FAILED: 'Error during token minting',
        INITIALIZING: 'Initializing minting process',
        PROCESSING: 'Processing minting request',
        VERIFYING: 'Verifying minting parameters',
        UPDATING: 'Updating token supply',
        FINALIZING: 'Finalizing minting process',
      } as const,
      handles: nodeHandles.tokenMinting,
      style: {
        width: 180,
        height: 80,
        background: 'rgba(255, 193, 7, 0.15)', // Amber background
        borderColor: '#FFC107',
        borderRadius: 8,
      },
    },
  },
];

// Define the flow edges (connections between nodes) with optimized paths
export const flowEdges: Edge<FlowEdgeData>[] = [
  {
    id: 'e1',
    source: 'cronTrigger',
    target: 'qarCronProcess',
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'event',
    animated: false,
    data: {
      label: 'Trigger',
      type: 'event',
      color: '#3b82f6',
    },
    style: { strokeWidth: 2 },
  },
  {
    id: 'e2',
    source: 'qarCronProcess',
    target: 'systemLogs',
    sourceHandle: 'top',
    targetHandle: 'bottom',
    type: 'event',
    animated: false,
    data: {
      label: 'Log Events',
      type: 'event',
      color: '#10b981',
    },
    style: { strokeWidth: 2 },
  },
  {
    id: 'e3',
    source: 'qarCronProcess',
    target: 'qarTokenProcess',
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'proposal',
    animated: false,
    data: {
      label: 'Send Commands',
      type: 'proposal',
      color: '#f59e0b',
    },
    style: { strokeWidth: 2 },
  },
  {
    id: 'e4',
    source: 'qarTokenProcess',
    target: 'depositConfirmation',
    sourceHandle: 'right-top',
    targetHandle: 'left',
    type: 'voting',
    animated: false,
    data: {
      label: 'Process',
      type: 'voting',
      color: '#8b5cf6',
    },
    style: { strokeWidth: 2 },
  },
  {
    id: 'e5',
    source: 'qarTokenProcess',
    target: 'withdrawalProcessing',
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'voting',
    animated: false,
    data: {
      label: 'Process',
      type: 'voting',
      color: '#8b5cf6',
    },
    style: { strokeWidth: 2 },
  },
  {
    id: 'e6',
    source: 'qarTokenProcess',
    target: 'tokenMinting',
    sourceHandle: 'bottom',
    targetHandle: 'left',
    type: 'voting',
    animated: false,
    data: {
      label: 'Mint',
      type: 'voting',
      color: '#ec4899',
    },
    style: { strokeWidth: 2 },
  },
];
