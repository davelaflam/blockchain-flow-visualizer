import { Box, Paper } from '@mui/material';
import React, { JSX } from 'react';

import { NodeStatus, StepData } from '../blockchainFlows/types';

import AIExplanationPanel from './ai/AIExplanationPanel';
import StatusHeader from './StatusHeader';
import { TransactionStatus } from './types/StatusHeaderTypes';

interface FlowStore {
  step: number;
  isPlaying: boolean;
  nextStep: () => void;
  prevStep: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
}

interface StatusHeaderWithAIProps {
  flowType: string;
  expanded?: boolean;
  title: string;
  stepData: StepData[];
  getTransactionStatus?: (step: number, totalSteps: number) => NodeStatus;
  defaultDescription?: string;
  useStore: () => FlowStore;
  onReset?: () => void;
  showControls?: boolean;
}

/**
 * StatusHeaderWithAI component combines the StatusHeader with AIExplanationPanel
 * to provide a status header with AI explanations for blockchain flows.
 *
 * @param {StatusHeaderWithAIProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered component.
 */
const StatusHeaderWithAI: React.FC<StatusHeaderWithAIProps> = ({
  flowType,
  expanded = false,
  title,
  stepData,
  getTransactionStatus,
  defaultDescription,
  useStore,
  onReset,
  showControls = true,
}: StatusHeaderWithAIProps): JSX.Element => {
  let step = 0;
  const store = useStore();
  step = store.step;

  /**
   * Converts the stepData array to a format compatible with StatusHeader
   */
  const convertedStepData: StepData[] = stepData.map(item => ({
    label: item.label,
    description: item.description,
    link: item.link,
    linkLabel: item.linkLabel,
  }));

  /**
   * Converts the getTransactionStatus function to return TransactionStatus
   */
  const convertedGetTransactionStatus = getTransactionStatus
    ? (step: number, totalSteps: number): TransactionStatus => {
        const status = getTransactionStatus(step, totalSteps);
        // Map NodeStatus to TransactionStatus
        // This is a simple mapping, you might need to adjust it based on your specific needs
        switch (status) {
          case 'NEW':
            return TransactionStatus.NEW;
          case 'SENT_TO_AO':
            return TransactionStatus.SENT_TO_AO;
          case 'PROPOSAL_PREPARED':
            return TransactionStatus.PROPOSAL_PREPARED;
          case 'PROPOSAL_RECEIVED':
            return TransactionStatus.PROPOSAL_RECEIVED;
          case 'VOTING_IN_PROGRESS':
            return TransactionStatus.VOTING_IN_PROGRESS;
          case 'PROCESSING':
            return TransactionStatus.PROCESSING;
          case 'COMPLETE':
            return TransactionStatus.COMPLETE;
          case 'MINT_APPROVED':
            return TransactionStatus.MINT_APPROVED;
          case 'MINTING':
            return TransactionStatus.MINTING;
          case 'BURN_APPROVED':
            return TransactionStatus.BURN_APPROVED;
          case 'BURNING':
            return TransactionStatus.BURNING;
          default:
            return TransactionStatus.PROCESSING;
        }
      }
    : undefined;

  return (
    <Paper
      elevation={4}
      sx={{
        mb: 0,
        mt: 0,
        backgroundColor: 'rgba(26, 32, 44, 0.7)',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        p: { xs: 2 },
      }}
    >
      <Box>
        <StatusHeader
          title={title}
          stepData={convertedStepData}
          getTransactionStatus={convertedGetTransactionStatus}
          defaultDescription={defaultDescription}
          useStore={() => store}
          onReset={onReset}
          showControls={showControls}
        />

        <Box sx={{ mt: 2 }}>
          <AIExplanationPanel
            flowType={flowType}
            stepNumber={step}
            expanded={expanded}
            step={step}
            defaultDescription={defaultDescription}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default StatusHeaderWithAI;
