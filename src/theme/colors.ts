import { blue, lightBlue, indigo, purple, amber, green, teal, orange, red, grey } from '@mui/material/colors';

/**
 * Centralized color definitions for the blockchain flow visualizer
 * Using MUI color palette for consistency
 */

// Flow step type colors
type FlowStepColorKey =
  | 'userAction'
  | 'eventEmission'
  | 'eventProcessing'
  | 'proposalPreparation'
  | 'proposalReceived'
  | 'voting'
  | 'voteTallying'
  | 'mintApproval'
  | 'minting'
  | 'burnApproval'
  | 'burning'
  | 'notification'
  | 'default';

export const flowStepColors = {
  // User interaction steps
  userAction: blue[400],

  // Event emission and processing steps
  eventEmission: lightBlue[400],
  eventProcessing: lightBlue[600],

  // Proposal steps
  proposalPreparation: amber[500],
  proposalReceived: amber[600],

  // Voting steps
  voting: purple[400],
  voteTallying: purple[600],

  // Approval and execution steps
  mintApproval: green[500],
  minting: teal[400],
  burnApproval: orange[500],
  burning: red[400],

  // Notification steps
  notification: indigo[400],

  // Default/fallback
  default: grey[400],
} satisfies Record<FlowStepColorKey, string>;

// Transaction status colors
type StatusColorKey =
  | 'NEW'
  | 'SENT_TO_AO'
  | 'PROPOSAL_PREPARED'
  | 'PROPOSAL_RECEIVED'
  | 'VOTING_IN_PROGRESS'
  | 'PROCESSING'
  | 'TALLYING_VOTES'
  | 'COMPLETE'
  | 'MINT_APPROVED'
  | 'MINTING'
  | 'BURN_APPROVED'
  | 'BURNING'
  | 'CONNECTED'
  | 'APPROVED'
  | 'STAKING'
  | 'STAKED'
  | 'EARNING'
  | 'CLAIMED'
  | 'UNSTAKING'
  | 'COOLDOWN'
  | 'WITHDRAWN'
  | 'default';

export const statusColors = {
  // Common statuses
  NEW: grey[300],
  SENT_TO_AO: blue[200],
  PROPOSAL_PREPARED: amber[500],
  PROPOSAL_RECEIVED: amber[400],
  VOTING_IN_PROGRESS: purple[300],
  PROCESSING: blue[400],
  TALLYING_VOTES: purple[500],
  COMPLETE: green[400],

  // Minting specific statuses
  MINT_APPROVED: green[500],
  MINTING: teal[400],

  // Burning specific statuses
  BURN_APPROVED: orange[500],
  BURNING: red[400],

  // Staking specific statuses
  CONNECTED: blue[300],
  APPROVED: amber[300],
  STAKING: teal[300],
  STAKED: teal[500],
  EARNING: green[300],
  CLAIMED: green[500],
  UNSTAKING: orange[300],
  COOLDOWN: orange[400],
  WITHDRAWN: purple[400],

  // Default/fallback
  default: grey[400],
} satisfies Record<StatusColorKey, string>;

// UI element colors
type UiColorKey =
  | 'darkBackground'
  | 'paperBackground'
  | 'primaryText'
  | 'secondaryText'
  | 'tertiaryText'
  | 'border'
  | 'statusBadgeText'
  | 'primary'
  | 'primaryDark';

export const uiColors = {
  // Background colors
  darkBackground: '#1F2937',
  paperBackground: '#23272F',

  // Text colors
  primaryText: '#F9FAFB',
  secondaryText: '#D1D5DB',
  tertiaryText: '#A3AED0',

  // Border colors
  border: '#374151',

  // Status badge text color
  statusBadgeText: '#1F2937',

  // Button colors
  primary: '#8A2BE2',
  primaryDark: '#6A1EC0',
} satisfies Record<UiColorKey, string>;

// Journey colors for flow chart
type JourneyColorKey = 'event' | 'proposal' | 'voting' | 'minting' | 'burning' | 'credit' | 'gray';

export const journeyColors = {
  event: blue[400],
  proposal: amber[400],
  voting: purple[400],
  minting: teal[400],
  burning: red[400],
  credit: indigo[400],
  gray: grey[500],
} satisfies Record<JourneyColorKey, string>;

// Node type colors for flow chart
type NodeTypeColorKey = 'event' | 'proposer' | 'voter' | 'token' | 'recipient' | 'other' | 'process';

export const nodeTypeColors = {
  event: journeyColors.event,
  proposer: journeyColors.proposal,
  voter: journeyColors.voting,
  token: journeyColors.minting,
  recipient: journeyColors.credit,
  other: grey[300],
  process: journeyColors.proposal,
} satisfies Record<NodeTypeColorKey, string>;

// Helper function to get status color
export const getStatusColor = (status: string): string => {
  return status in statusColors ? statusColors[status as StatusColorKey] : statusColors.default;
};

// Helper function to map step number to color group
export const getStepTypeColor = (stepNumber: number, totalSteps: number): string => {
  // User action (first step)
  if (stepNumber === 1) {
    return flowStepColors.userAction;
  }

  // Event emission and processing (steps 2-4)
  if (stepNumber >= 2 && stepNumber <= 4) {
    return stepNumber === 2 ? flowStepColors.eventEmission : flowStepColors.eventProcessing;
  }

  // Proposal preparation and submission (steps 5-6)
  if (stepNumber >= 5 && stepNumber <= 6) {
    return stepNumber === 5 ? flowStepColors.proposalPreparation : flowStepColors.proposalReceived;
  }

  // Voting process (steps 7-9)
  if (stepNumber >= 7 && stepNumber <= 9) {
    return stepNumber === 9 ? flowStepColors.voteTallying : flowStepColors.voting;
  }

  // Approval and execution (steps 10-12)
  if (stepNumber >= 10 && stepNumber <= 12) {
    if (stepNumber === 10) {
      return flowStepColors.mintApproval; // or burnApproval based on context
    } else if (stepNumber === 11 || stepNumber === 12) {
      return flowStepColors.minting; // or burning based on context
    }
  }

  // Notification (last step)
  if (stepNumber === totalSteps) {
    return flowStepColors.notification;
  }

  // Default fallback
  return flowStepColors.default;
};
