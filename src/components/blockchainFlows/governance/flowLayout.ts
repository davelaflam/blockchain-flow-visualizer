import { Node, Edge } from 'reactflow';

import { FlowEdgeData, FlowNodeData } from '../types';

export const flowNodes: Node<FlowNodeData>[] = [
  // Proposal Creation
  {
    id: 'proposalCreator',
    type: 'proposer',
    position: { x: 0, y: 155 },
    data: {
      label: 'Proposal Creator',
      type: 'proposer',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'DAO member who creates a governance proposal',
      statusByStep: {
        1: 'INITIALIZING',
        2: 'PROPOSAL_CREATED',
        3: 'COMPLETED',
        11: 'CANCELLING',
      },
      statusTooltips: {
        IDLE: 'Ready to create proposal',
        INITIALIZING: 'Preparing proposal',
        PROPOSAL_CREATED: 'Proposal submitted',
        COMPLETED: 'Proposal creation completed',
        CANCELLING: 'Cancelling proposal',
      },
    },
  },
  {
    id: 'governanceContract',
    type: 'event',
    position: { x: 350, y: 145 },
    data: {
      label: 'Governance Contract',
      type: 'event',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Smart contract that manages the governance process',
      details: 'Handles proposal creation, voting, and execution',
      statusByStep: {
        1: 'IDLE',
        2: 'PROCESSING',
        3: 'PROPOSAL_CREATED',
        4: 'DISCUSSION_ACTIVE',
        5: 'VOTING_ACTIVE',
        8: 'EXECUTION_QUEUED',
        9: 'EXECUTED',
      },
      statusTooltips: {
        IDLE: 'Ready to process proposals',
        PROCESSING: 'Processing proposal submission',
        PROPOSAL_CREATED: 'Proposal registered on-chain',
        DISCUSSION_ACTIVE: 'Discussion period active',
        VOTING_ACTIVE: 'Voting period active',
        EXECUTION_QUEUED: 'Execution queued in timelock',
        EXECUTED: 'Proposal executed',
      },
    },
  },

  // Discussion Forum
  {
    id: 'discussionForum',
    type: 'other',
    position: { x: 250, y: 345 },
    data: {
      label: 'Discussion Forum',
      type: 'other',
      status: 'IDLE',
      eventType: 'ao',
      tooltip: 'Forum where DAO members discuss the proposal',
      details: 'Off-chain discussion platform for governance proposals',
      statusByStep: {
        1: 'IDLE',
        3: 'INITIALIZING',
        4: 'DISCUSSION_ACTIVE',
        5: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Awaiting new proposals',
        INITIALIZING: 'Setting up discussion thread',
        DISCUSSION_ACTIVE: 'Discussion in progress',
        COMPLETED: 'Discussion period ended',
      },
    },
  },

  // Voting
  {
    id: 'tokenHolders',
    type: 'voter',
    position: { x: 875, y: 0 },
    data: {
      label: 'Token Holders',
      type: 'voter',
      status: 'IDLE',
      eventType: 'ao',
      tooltip: 'DAO members who vote on proposals',
      details: 'Voting power is proportional to token holdings',
      statusByStep: {
        1: 'IDLE',
        5: 'VOTING_ACTIVE',
        6: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Awaiting voting period',
        VOTING_ACTIVE: 'Casting votes on proposal',
        COMPLETED: 'Voting completed',
      },
    },
  },
  {
    id: 'snapshotVoting',
    type: 'voter',
    position: { x: 500, y: 340 },
    data: {
      label: 'Snapshot Voting',
      type: 'voter',
      status: 'IDLE',
      eventType: 'snapshot',
      tooltip: 'Off-chain voting platform for gas-free voting',
      details: 'Snapshot allows token holders to vote without paying gas fees',
      statusByStep: {
        1: 'IDLE',
        5: 'VOTING_ACTIVE',
        6: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Awaiting voting period',
        VOTING_ACTIVE: 'Off-chain voting in progress',
        COMPLETED: 'Off-chain voting completed',
      },
    },
  },
  {
    id: 'votingResults',
    type: 'event',
    position: { x: 875, y: 350 },
    data: {
      label: 'Voting Results',
      type: 'event',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Tallied results of the governance vote',
      statusByStep: {
        1: 'IDLE',
        6: 'PROCESSING',
        7: 'PROPOSAL_PASSED',
        10: 'PROPOSAL_REJECTED',
      },
      statusTooltips: {
        IDLE: 'Awaiting vote completion',
        PROCESSING: 'Tallying votes',
        PROPOSAL_PASSED: 'Proposal passed with required majority',
        PROPOSAL_REJECTED: 'Proposal rejected',
      },
    },
  },

  // Execution
  {
    id: 'timelock',
    type: 'token',
    position: { x: 1150, y: 150 },
    data: {
      label: 'Timelock',
      type: 'token',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Timelock contract that delays execution of passed proposals',
      details: 'Provides a security delay before execution',
      statusByStep: {
        1: 'IDLE',
        7: 'IDLE',
        8: 'EXECUTION_QUEUED',
        9: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'No pending executions',
        EXECUTION_QUEUED: 'Proposal queued for execution after delay',
        COMPLETED: 'Timelock delay completed',
      },
    },
  },
  {
    id: 'targetContract',
    type: 'recipient',
    position: { x: 1150, y: 350 },
    data: {
      label: 'Target Contract',
      type: 'recipient',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Contract that will be modified by the proposal',
      statusByStep: {
        1: 'IDLE',
        9: 'PROCESSING',
        10: 'COMPLETED',
      },
      statusTooltips: {
        IDLE: 'Awaiting governance action',
        PROCESSING: 'Executing proposal changes',
        COMPLETED: 'Proposal changes implemented',
      },
    },
  },
  // Cancellation Archive
  {
    id: 'cancellationArchive',
    type: 'other',
    position: { x: 0, y: 500 },
    data: {
      label: 'Cancellation Archive',
      type: 'other',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Archive of cancelled proposals',
      statusByStep: {
        1: 'IDLE',
        11: 'PROCESSING',
      },
      statusTooltips: {
        IDLE: 'No cancelled proposals',
        PROCESSING: 'Archiving cancelled proposal',
      },
    },
  },
  // Rejection Archive
  {
    id: 'rejectionArchive',
    type: 'other',
    position: { x: 875, y: 500 },
    data: {
      label: 'Rejection Archive',
      type: 'other',
      status: 'IDLE',
      eventType: 'contract',
      tooltip: 'Archive of rejected proposals',
      statusByStep: {
        1: 'IDLE',
        10: 'PROCESSING',
      },
      statusTooltips: {
        IDLE: 'No rejected proposals',
        PROCESSING: 'Archiving rejected proposal',
      },
    },
  },
];

export const flowEdges: Edge<FlowEdgeData>[] = [
  // Proposal Creation Flow
  {
    id: 'e1',
    source: 'proposalCreator',
    target: 'governanceContract',
    type: 'proposal',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'proposal', color: '#6366f1', label: 'Submit Proposal' },
  },
  // Proposal Cancellation Flow
  {
    id: 'e9',
    source: 'proposalCreator',
    target: 'cancellationArchive',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'event', color: '#ef4444', label: 'Cancel Proposal' },
  },
  {
    id: 'e2',
    source: 'governanceContract',
    target: 'discussionForum',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'event', color: '#8b5cf6', label: 'Open Discussion' },
  },

  // Voting Flow
  {
    id: 'e3',
    source: 'governanceContract',
    target: 'tokenHolders',
    type: 'event',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'event', color: '#8b5cf6', label: 'Start On-Chain Voting' },
  },
  {
    id: 'e4',
    source: 'tokenHolders',
    target: 'votingResults',
    type: 'voting',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'voting', color: '#8b5cf6', label: 'Cast On-Chain Votes', labelOffset: -75 },
  },
  // Snapshot Voting Flow
  {
    id: 'e10',
    source: 'governanceContract',
    target: 'snapshotVoting',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'event', color: '#8b5cf6', label: 'Start Off-Chain Voting', labelOffset: 30 },
  },
  {
    id: 'e11',
    source: 'snapshotVoting',
    target: 'votingResults',
    type: 'voting',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'voting', color: '#8b5cf6', label: 'Cast Off-Chain Votes' },
  },
  {
    id: 'e5',
    source: 'votingResults',
    target: 'governanceContract',
    type: 'event',
    sourceHandle: 'left',
    targetHandle: 'right',
    data: { type: 'event', color: '#10b981', label: 'Report Results' },
  },

  // Execution Flow
  {
    id: 'e6',
    source: 'governanceContract',
    target: 'timelock',
    type: 'proposal',
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { type: 'proposal', color: '#10b981', label: 'Queue Execution' },
  },
  {
    id: 'e7',
    source: 'timelock',
    target: 'targetContract',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'event', color: '#10b981', label: 'Execute Proposal' },
  },

  // Rejection Flow
  {
    id: 'e8',
    source: 'votingResults',
    target: 'rejectionArchive',
    type: 'event',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    data: { type: 'event', color: '#ef4444', label: 'Proposal Rejected' },
  },
];

// Node handles configuration for the Governance flow
export const nodeHandles: Record<string, { [side: string]: boolean }> = {
  // Proposal Creation
  proposalCreator: { right: true, bottom: true },
  governanceContract: { left: true, right: true, top: true, bottom: true },

  // Discussion
  discussionForum: { top: true, right: true, bottom: true },

  // Voting
  tokenHolders: { left: true, bottom: true, right: true },
  snapshotVoting: { left: true, right: true, top: true, bottom: true },
  votingResults: { top: true, left: true, right: true, bottom: true },

  // Execution
  timelock: { left: true, bottom: true, right: true },
  targetContract: { top: true, right: true },

  // Cancellation
  cancellationArchive: { top: true },

  // Rejection
  rejectionArchive: { top: true },
};
