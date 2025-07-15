import { StepData } from '../../blockchainFlows/types';

export enum TransactionStatus {
  // Common statuses
  NEW = 'NEW',
  SENT_TO_AO = 'SENT_TO_AO',
  PROPOSAL_PREPARED = 'PROPOSAL_PREPARED',
  PROPOSAL_RECEIVED = 'PROPOSAL_RECEIVED',
  VOTING_IN_PROGRESS = 'VOTING_IN_PROGRESS',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',

  // Minting specific statuses
  MINT_APPROVED = 'MINT_APPROVED',
  MINTING = 'MINTING',

  // Burning specific statuses
  BURN_APPROVED = 'BURN_APPROVED',
  BURNING = 'BURNING',

  // Staking specific statuses
  CONNECTED = 'CONNECTED',
  APPROVED = 'APPROVED',
  STAKING = 'STAKING',
  STAKED = 'STAKED',
  EARNING = 'EARNING',
  CLAIMED = 'CLAIMED',
  UNSTAKING = 'UNSTAKING',
  COOLDOWN = 'COOLDOWN',
  WITHDRAWN = 'WITHDRAWN',

  // QAR Token specific statuses
  CANCELED = 'CANCELED',
  PROPOSAL_REJECTED = 'PROPOSAL_REJECTED',

  // Lending specific statuses
  ALERT = 'ALERT',
  MONITORING = 'MONITORING',
}

export interface StatusHeaderProps {
  title: string;
  stepData: StepData[];
  /** optional override for how we map step→status */
  getTransactionStatus?: (step: number, totalSteps: number) => TransactionStatus;
  /** description shown at step === 0 */
  defaultDescription?: string;
  /**
   * hook that returns store state and actions
   * required for the component to function
   */
  useStore?: () => {
    step: number;
    isPlaying: boolean;
    nextStep: () => void;
    prevStep: () => void;
    play: () => void;
    pause: () => void;
    reset: () => void;
  };
  /** Callback when reset is triggered */
  onReset?: () => void;
  /** Show flow controls */
  showControls?: boolean;
}

export const defaultGetTransactionStatus = (step: number, totalSteps: number): TransactionStatus => {
  if (step === 0) return TransactionStatus.NEW;
  if (step === 1) return TransactionStatus.SENT_TO_AO;
  if (step === 2) return TransactionStatus.PROPOSAL_PREPARED;
  if (step === 3) return TransactionStatus.PROPOSAL_RECEIVED;
  if (step === 4) return TransactionStatus.VOTING_IN_PROGRESS;
  if (step >= totalSteps) return TransactionStatus.COMPLETE;
  return TransactionStatus.NEW;
};
