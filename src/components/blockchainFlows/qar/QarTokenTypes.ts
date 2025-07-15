export enum QarTokenStep {
  NONE = 0,
  CREATE_PROPOSAL = 1,
  SUBMIT_TO_GOV_CONTRACT = 2,
  PROPOSAL_REGISTERED = 3,
  START_DISCUSSION = 4,
  VOTING_STARTED = 5,
  VOTING_COMPLETED = 6,
  PROPOSAL_PASSED = 7,
  EXECUTION_QUEUED = 8,
  PROPOSAL_EXECUTED = 9,
  PROPOSAL_REJECTED = 10,
  CANCELED = 11,
}

export const qarTokenStepTooltips: Record<QarTokenStep, string> = {
  [QarTokenStep.NONE]: 'Initial state',
  [QarTokenStep.CREATE_PROPOSAL]: 'Proposal created by DAO member',
  [QarTokenStep.SUBMIT_TO_GOV_CONTRACT]: 'Proposal submitted to governance contract',
  [QarTokenStep.PROPOSAL_REGISTERED]: 'Proposal registered in the governance system',
  [QarTokenStep.START_DISCUSSION]: 'Discussion period for the proposal has started',
  [QarTokenStep.VOTING_STARTED]: 'Token holders begin voting on the proposal',
  [QarTokenStep.VOTING_COMPLETED]: 'Voting period has ended',
  [QarTokenStep.PROPOSAL_PASSED]: 'Proposal has passed the vote',
  [QarTokenStep.EXECUTION_QUEUED]: 'Proposal queued in timelock before execution',
  [QarTokenStep.PROPOSAL_EXECUTED]: 'Proposal has been executed',
  [QarTokenStep.PROPOSAL_REJECTED]: 'Proposal failed to pass vote',
  [QarTokenStep.CANCELED]: 'Proposal was canceled before completion',
};

export const stepLabels: Record<QarTokenStep, string> = {
  [QarTokenStep.NONE]: '',
  [QarTokenStep.CREATE_PROPOSAL]: 'Create Proposal',
  [QarTokenStep.SUBMIT_TO_GOV_CONTRACT]: 'Submit to Governance',
  [QarTokenStep.PROPOSAL_REGISTERED]: 'Register Proposal',
  [QarTokenStep.START_DISCUSSION]: 'Start Discussion',
  [QarTokenStep.VOTING_STARTED]: 'Start Voting',
  [QarTokenStep.VOTING_COMPLETED]: 'Complete Voting',
  [QarTokenStep.PROPOSAL_PASSED]: 'Pass Proposal',
  [QarTokenStep.EXECUTION_QUEUED]: 'Queue Execution',
  [QarTokenStep.PROPOSAL_EXECUTED]: 'Execute Proposal',
  [QarTokenStep.PROPOSAL_REJECTED]: 'Reject Proposal',
  [QarTokenStep.CANCELED]: 'Cancel Proposal',
};

// Phase metadata for nodes
export type QarTokenPhase = 'Proposal' | 'Voting' | 'Execution' | 'Rejected' | 'Canceled';
