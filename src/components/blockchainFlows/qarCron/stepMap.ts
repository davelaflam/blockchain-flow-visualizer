import { StepHighlightMap } from '../types';

export const stepHighlightMap: StepHighlightMap[] = [
  // Step 0 - Initial state
  { nodes: [], edges: [] },

  // Step 1 - Cron trigger activated
  {
    nodes: ['cronTrigger', 'qarCronProcess'],
    edges: ['e1'],
    updateNode: {
      id: 'cronTrigger',
      data: { status: 'ACTIVE' },
    },
  },

  // Step 2 - QAR Cron process starts & logs
  {
    nodes: ['qarCronProcess', 'systemLogs'],
    edges: ['e1', 'e2', 'e3'],
    updateNode: {
      id: 'qarCronProcess',
      data: { status: 'ACTIVE' },
    },
  },

  // Step 3 - Process all operations in parallel (deposits, withdrawals, minting)
  {
    nodes: ['qarTokenProcess', 'depositConfirmation', 'withdrawalProcessing', 'tokenMinting'],
    edges: ['e3', 'e4', 'e5', 'e6'],
    updateNode: {
      id: 'qarTokenProcess',
      data: {
        status: 'PROCESSING',
        statusByStep: {
          3: 'PROCESSING',
        },
      },
    },
  },

  // Step 4 - Process complete
  {
    nodes: ['qarCronProcess', 'qarTokenProcess', 'systemLogs'],
    edges: [], // No animated edges in final state
    updateNode: {
      id: 'qarCronProcess',
      data: {
        status: 'COMPLETE',
        statusByStep: {
          4: 'COMPLETE',
        },
      },
    },
  },
];
