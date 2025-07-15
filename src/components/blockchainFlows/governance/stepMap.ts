import { StepHighlightMap } from '../types';

export const stepHighlightMap: StepHighlightMap[] = [
  // Step 0: Initial state - all nodes/edges dimmed
  { nodes: [], edges: [] },

  // 1. Proposal Creation Initiated
  {
    nodes: ['proposalCreator', 'governanceContract'],
    edges: ['e1'],
    updateNode: {
      id: 'proposalCreator',
      data: { status: 'INITIALIZING' },
    },
  },

  // 2. Proposal Submitted to Governance Contract
  {
    nodes: ['proposalCreator', 'governanceContract'],
    edges: ['e1'],
    updateNode: {
      id: 'governanceContract',
      data: { status: 'PROCESSING' },
    },
  },

  // 3. Proposal Created and Registered
  {
    nodes: ['governanceContract', 'discussionForum'],
    edges: ['e2'],
    updateNode: {
      id: 'governanceContract',
      data: { status: 'PROPOSAL_CREATED' },
    },
  },

  // 4. Discussion Period Active
  {
    nodes: ['discussionForum', 'governanceContract'],
    edges: ['e2'],
    updateNode: {
      id: 'discussionForum',
      data: { status: 'DISCUSSION_ACTIVE' },
    },
  },

  // 5. Voting Period Begins
  {
    nodes: ['governanceContract', 'tokenHolders'],
    edges: ['e3'],
    updateNode: {
      id: 'governanceContract',
      data: { status: 'VOTING_ACTIVE' },
    },
  },

  // 6. Votes Being Cast
  {
    nodes: ['tokenHolders', 'votingResults'],
    edges: ['e4'],
    updateNode: {
      id: 'tokenHolders',
      data: { status: 'VOTING_ACTIVE' },
    },
  },

  // 7. Proposal Passed
  {
    nodes: ['votingResults', 'governanceContract', 'timelock'],
    edges: ['e5', 'e6'],
    updateNode: {
      id: 'votingResults',
      data: { status: 'PROPOSAL_PASSED' },
    },
  },

  // 8. Execution Queued in Timelock
  {
    nodes: ['timelock', 'governanceContract'],
    edges: ['e6'],
    updateNode: {
      id: 'timelock',
      data: { status: 'EXECUTION_QUEUED' },
    },
  },

  // 9. Proposal Executed
  {
    nodes: ['timelock', 'targetContract'],
    edges: ['e7'],
    updateNode: {
      id: 'targetContract',
      data: { status: 'PROCESSING' },
    },
  },

  // 10. Proposal Rejected (Alternative Path)
  {
    nodes: ['votingResults', 'rejectionArchive'],
    edges: ['e8'],
    updateNode: {
      id: 'rejectionArchive',
      data: { status: 'PROCESSING' },
    },
  },

  // 11. Proposal Cancelled (Alternative Path)
  {
    nodes: ['proposalCreator', 'cancellationArchive'],
    edges: ['e9'],
    updateNode: {
      id: 'proposalCreator',
      data: { status: 'CANCELLING' },
    },
  },

  // 12. Snapshot Voting (Alternative Voting Path)
  {
    nodes: ['governanceContract', 'snapshotVoting'],
    edges: ['e10'],
    updateNode: {
      id: 'snapshotVoting',
      data: { status: 'VOTING_ACTIVE' },
    },
  },

  // 13. Snapshot Votes Being Cast
  {
    nodes: ['snapshotVoting', 'votingResults'],
    edges: ['e11'],
    updateNode: {
      id: 'snapshotVoting',
      data: { status: 'VOTING_ACTIVE' },
    },
  },
];
