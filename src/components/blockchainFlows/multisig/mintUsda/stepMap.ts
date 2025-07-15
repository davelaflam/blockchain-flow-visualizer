import { StepHighlightMap } from '../../types';

export const stepHighlightMap: StepHighlightMap[] = [
  // Step 0: Landing phase - all nodes/edges dimmed
  { nodes: [], edges: [] },
  // 1. User initiates transfer
  { nodes: ['userInteraction'], edges: ['e0'] },
  // 2. Lock event emitted
  { nodes: ['lockEmitter'], edges: ['e0'] },
  // 3. Event sent to AO Event Pool - keep e0 visible while showing e1
  { nodes: ['eventPool'], edges: ['e1'] },
  // 4. AO Event Pool processes event
  { nodes: ['eventPool', 'aoHandler'], edges: ['e2'] },
  // 5. AO USDA EventHandler prepares proposal
  {
    nodes: ['aoHandler', 'proposer'],
    edges: ['e3'],
    updateNode: {
      id: 'proposer',
      data: { status: 'PROPOSAL_PREPARED' },
    },
  },
  // 6. Multisig Proposer receives proposal
  {
    nodes: ['proposer'],
    edges: [],
    updateNode: {
      id: 'proposer',
      data: { status: 'PROPOSAL_RECEIVED' },
    },
  },
  // 7. Voter 1 votes - only e4 should be animated
  {
    nodes: ['voter1', 'proposer'],
    edges: ['e4'],
    updateNode: {
      id: 'proposer',
      data: { status: 'VOTING_IN_PROGRESS' },
    },
  },
  // 8. Voter 2 votes - only e5 should be animated
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
  // 10. Multisig sends 'Mint Approved' to USDA Token Process
  {
    nodes: ['proposer', 'usdaToken'],
    edges: ['e8'],
    updateNode: {
      id: 'proposer',
      data: { status: 'MINT_APPROVED' },
    },
  },
  // 11. AO Handler sends 'Mint' to USDA Token Process
  {
    nodes: ['aoHandler', 'usdaToken'],
    edges: ['e6'],
    updateNode: {
      id: 'usdaToken',
      data: { status: 'MINTING' },
    },
  },
  // 12. USDA Token Process mints tokens
  {
    nodes: ['usdaToken'],
    edges: [],
    updateNode: {
      id: 'usdaToken',
      data: { status: 'COMPLETE' },
    },
  },
  // 13. USDA Token Process sends 'Credit Notice' to Recipient and Token Event to AO USDA EventHandler
  {
    nodes: ['usdaToken', 'recipient', 'aoHandler'],
    edges: ['e7', 'e9'],
    updateNode: {
      id: 'recipient',
      data: { status: 'COMPLETE' },
    },
  },
];
