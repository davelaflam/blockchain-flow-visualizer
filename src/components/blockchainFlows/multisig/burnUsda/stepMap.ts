import { StepHighlightMap } from '../../types';

export const stepHighlightMap: StepHighlightMap[] = [
  // Step 0: Initial state - all nodes/edges dimmed
  { nodes: [], edges: [] },

  // 1. User initiates burn
  { nodes: ['userInteraction'], edges: ['e0'] },

  // 2. Burn event emitted
  { nodes: ['burnEmitter'], edges: ['e0'] },

  // 3. Event sent to AO Event Pool
  { nodes: ['eventPool'], edges: ['e1'] },

  // 4. AO Event Pool processes event
  { nodes: ['eventPool', 'aoHandler'], edges: ['e2'] },

  // 5. AO USDA EventHandler prepares burn proposal
  {
    nodes: ['aoHandler', 'proposer'],
    edges: ['e3'],
    updateNode: {
      id: 'proposer',
      data: { status: 'BURN_PROPOSAL_PREPARED' },
    },
  },

  // 6. Multisig Proposer receives burn proposal
  {
    nodes: ['proposer'],
    edges: [],
    updateNode: {
      id: 'proposer',
      data: { status: 'BURN_PROPOSAL_RECEIVED' },
    },
  },

  // 7. Voter 1 votes
  {
    nodes: ['voter1', 'proposer'],
    edges: ['e4'],
    updateNode: {
      id: 'proposer',
      data: { status: 'VOTING_IN_PROGRESS' },
    },
  },

  // 8. Voter 2 votes
  {
    nodes: ['voter2', 'proposer'],
    edges: ['e5'],
    updateNode: {
      id: 'proposer',
      data: { status: 'VOTING_IN_PROGRESS' },
    },
  },

  // 9. Multisig tallies votes
  {
    nodes: ['proposer'],
    edges: [],
    updateNode: {
      id: 'proposer',
      data: { status: 'TALLYING_VOTES' },
    },
  },

  // 10. Multisig sends 'Burn Approved' to USDA Token Process
  {
    nodes: ['proposer', 'usdaToken'],
    edges: ['e6'],
    updateNode: {
      id: 'proposer',
      data: { status: 'BURN_APPROVED' },
    },
  },

  // 11. AO Handler sends 'Burn' to USDA Token Process
  {
    nodes: ['aoHandler', 'usdaToken'],
    edges: ['e7'],
    updateNode: {
      id: 'usdaToken',
      data: { status: 'BURNING' },
    },
  },

  // 12. USDA Token Process burns tokens
  {
    nodes: ['usdaToken'],
    edges: [],
    updateNode: {
      id: 'usdaToken',
      data: { status: 'COMPLETE' },
    },
  },

  // 13. USDA Token Process sends 'Debit Notice' to Sender and Burn Event to AO USDA EventHandler
  {
    nodes: ['usdaToken', 'recipient', 'aoHandler'],
    edges: ['e8', 'e9'],
    updateNode: {
      id: 'recipient',
      data: { status: 'COMPLETE' },
    },
  },
];
