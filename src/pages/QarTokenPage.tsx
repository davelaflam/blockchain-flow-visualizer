import { Paper, useTheme, useMediaQuery, Box, Grid } from '@mui/material';
import React from 'react';

import QarTokenActions from '../components/blockchainFlows/qar/QarTokenActions';
import QarTokenFlowChart from '../components/blockchainFlows/qar/QarTokenFlowChart';
import { stepData } from '../components/blockchainFlows/qar/steps';
import FlowInfoSection from '../components/common/FlowInfoSection';
import StatusHeaderWithAI from '../components/common/StatusHeaderWithAI';
import { TransactionStatus } from '../components/common/types/StatusHeaderTypes';
import MainLayout from '../components/layout/MainLayout';
import { useQarTokenStore } from '../store/qarTokenStore';

/**
 * Maps the current step of the QAR Token flow to a transaction status.
 * @param step
 * @param totalSteps
 * @return {TransactionStatus} The status corresponding to the current step.
 */
const getQarTokenStatus = (step: number, totalSteps: number): TransactionStatus => {
  // Map each step to a meaningful status (steps are now 1-indexed for the 11 steps)
  switch (step) {
    case 1:
      return TransactionStatus.PROCESSING; // Create Proposal
    case 2:
      return TransactionStatus.SENT_TO_AO; // Submit to Governance
    case 3:
      return TransactionStatus.MINTING; // Proposal Registered
    case 4:
      return TransactionStatus.COMPLETE; // Start Discussion
    case 5:
      return TransactionStatus.PROCESSING; // Voting Started
    case 6:
      return TransactionStatus.PROPOSAL_RECEIVED; // Voting Completed
    case 7:
      return TransactionStatus.BURNING; // Proposal Passed
    case 8:
      return TransactionStatus.COMPLETE; // Execution Queued
    case 9:
      return TransactionStatus.COMPLETE; // Proposal Executed
    case 10:
      return TransactionStatus.PROPOSAL_REJECTED; // Proposal Rejected
    case 11:
      return TransactionStatus.CANCELED; // Proposal Canceled
    default:
      return step > 11 ? TransactionStatus.COMPLETE : TransactionStatus.PROCESSING;
  }
};

/**
 * QarTokenPage component renders the QAR Token flow visualization and actions.
 * @constructor
 * This component displays the flow chart, actions, and detailed information about the QAR Token process.
 */
const QarTokenPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const { step } = useQarTokenStore();

  return (
    <MainLayout>
      <Grid container spacing={theme.custom.spacing.grid}>
        <Grid size={12}>
          <Box sx={{ pt: theme.custom.spacing.section }}>
            <StatusHeaderWithAI
              flowType="qarToken"
              expanded={step > 0}
              title="QAR Token Flow"
              stepData={stepData}
              getTransactionStatus={getQarTokenStatus}
              defaultDescription="This flow visualization demonstrates the complete lifecycle of QAR tokens, from deposit to withdrawal."
              useStore={useQarTokenStore}
            />
          </Box>
        </Grid>

        <Grid size={12}>
          <Box sx={{ mt: 0 }}>
            <Paper
              elevation={1}
              sx={{
                p: { xs: 0, md: 0 },
                overflow: 'hidden',
                backgroundColor: 'transparent',
              }}
            >
              <QarTokenFlowChart />
              <QarTokenActions />
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: theme.custom.spacing.section }}>
        <FlowInfoSection
          title="About QAR Token Flow"
          description="The QAR Token Flow illustrates the full lifecycle of QAR tokens — from depositing native AR to redeeming it through token burning. This educational visualization breaks down the bi-directional bridge mechanics, staking rewards, and on-chain system operations that enable QAR to function as a liquid, reward-bearing representation of locked AR."
          keyPoints={[
            'Deposit native AR tokens into the bridge contract to mint QAR tokens',
            'Receive QAR tokens, which can be used within the ecosystem',
            'Earn staking rewards by holding or using QAR tokens in eligible protocols',
            'Burn QAR tokens to initiate AR withdrawal from the bridge',
            'Observe system-level logs and state changes for auditing and transparency',
          ]}
          featureTitle="QAR Token Features"
          features={[
            {
              title: 'Liquidity Access',
              description: 'Unlock the value of AR tokens without selling by converting them to QAR',
            },
            {
              title: 'Staking Rewards',
              description: 'Earn protocol-defined rewards by holding QAR tokens',
            },
            {
              title: 'Cross-System Bridge',
              description: 'Bi-directional conversion between AR and QAR ensures utility and mobility',
            },
            {
              title: 'On-Chain Auditability',
              description: 'All minting, burning, and balance updates are verifiable on-chain',
            },
          ]}
          securityConsiderations={[
            'Bridge contracts should be audited to prevent mint/burn inconsistencies',
            'Staking reward contracts may introduce additional attack surfaces',
            'Token balances and logs are immutable and publicly verifiable for trustless assurance',
          ]}
          advancedTips={[
            'Some ecosystems may integrate QAR into DeFi pools or LP incentives',
            'Withdrawal timing may be influenced by bridge queueing or governance rules',
            'Staking rewards can compound if QAR is held in eligible smart contracts',
          ]}
        />
      </Box>
    </MainLayout>
  );
};

export default QarTokenPage;
