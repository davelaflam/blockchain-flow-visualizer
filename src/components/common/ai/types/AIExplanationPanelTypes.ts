import { TransactionStatus } from '../../types/StatusHeaderTypes';

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface AIExplanationPanelProps {
  flowType: string;
  stepNumber: number;
  expanded?: boolean;
  step?: number;
  defaultDescription?: string;
}
