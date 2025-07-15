export type FlowNodeType =
  | 'confirmation'
  | 'event'
  | 'logs'
  | 'minting'
  | 'process'
  | 'proposer'
  | 'voter'
  | 'token'
  | 'recipient'
  | 'trigger'
  | 'other'
  | 'withdrawal';

export type FlowEdgeType = 'event' | 'proposal' | 'voting' | 'releaseTokensEdge';

export type EventType = 'contract' | 'ao' | 'relayer' | 'snapshot';

export type NodeStatus =
  | 'ACCRUING'
  | 'ALERT'
  | 'APPROVED'
  | 'BURNING'
  | 'BURN_APPROVED'
  | 'CALCULATING'
  | 'CLAIMED'
  | 'COLLATERAL_LOCKED'
  | 'COMPLETE'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'CONNECTED'
  | 'CONSENSUS_REACHED'
  | 'COOLDOWN'
  | 'DEPOSIT_RECEIVED'
  | 'DISCUSSION_ACTIVE'
  | 'EARNING'
  | 'ERROR'
  | 'EXECUTED'
  | 'EXECUTING'
  | 'EXECUTION_QUEUED'
  | 'FAILED'
  | 'FEES_COLLECTED'
  | 'FINALIZING'
  | 'FUNDS_RELEASED'
  | 'IDLE'
  | 'INITIALIZING'
  | 'LENDING'
  | 'LIQUIDATION_RISK'
  | 'LIQUIDITY_ADDED'
  | 'LIQUIDITY_REMOVED'
  | 'LOCKED'
  | 'MESSAGE_RECEIVED'
  | 'MESSAGE_SENT'
  | 'MINTING'
  | 'MINT_APPROVED'
  | 'MONITORING'
  | 'NEW'
  | 'PENDING'
  | 'PRICE_UPDATED'
  | 'PROCESSING'
  | 'PROPOSAL_CREATED'
  | 'PROPOSAL_PASSED'
  | 'PROPOSAL_PREPARED'
  | 'PROPOSAL_RECEIVED'
  | 'PROPOSAL_REJECTED'
  | 'RECEIVING'
  | 'RELEASING'
  | 'REPAYMENT_RECEIVED'
  | 'REWARDS_DISTRIBUTED'
  | 'REWARDS_DISTRIBUTING'
  | 'RUNNING'
  | 'SENDING'
  | 'SENT_TO_AO'
  | 'STAKED'
  | 'SUCCESSFUL'
  | 'SWAP_EXECUTED'
  | 'TOKENS_APPROVED'
  | 'TOKENS_BURNING'
  | 'TOKENS_LOCKED'
  | 'TOKENS_MINTED'
  | 'TOKENS_MINTING'
  | 'TOKENS_RELEASED'
  | 'TRANSACTION_VERIFIED'
  | 'TRANSFERRING'
  | 'UNSTAKING'
  | 'UPDATED'
  | 'UPDATING'
  | 'VERIFYING'
  | 'VOTING_ACTIVE'
  | 'VOTING_IN_PROGRESS'
  | 'WITHDRAWAL_REQUESTED'
  | 'WITHDRAWN'
  | string;

export interface FlowNodeData {
  apiEndpoints?: string[];
  description?: string;
  details?: string;
  eventType?: EventType;
  handles?: Record<string, boolean>;
  label: string;
  phase?: string;
  processFlow?: string;
  quorumData?: {
    required: string;
    actual: string;
    votes?: {
      for: string;
      against: string;
      abstain: string;
    };
  };
  status?: NodeStatus;
  statusByStep?: Record<number, NodeStatus>;
  statusTooltips?: Record<string, string>;
  style?: React.CSSProperties;
  timestamp?: number;
  tooltip?: string;
  txHash?: string;
  type: FlowNodeType;
}

export interface FlowEdgeData {
  color: string;
  label?: string;
  labelOffset?: number; // Vertical offset for the label to prevent overlap
  type: FlowEdgeType;
}
