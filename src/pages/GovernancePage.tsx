import { Paper, useTheme, useMediaQuery, Box, Grid } from '@mui/material';
import React from 'react';

import GovernanceActions from '../components/blockchainFlows/governance/GovernanceActions';
import GovernanceFlowChart from '../components/blockchainFlows/governance/GovernanceFlowChart';
import { stepData } from '../components/blockchainFlows/governance/steps';
import FlowInfoSection from '../components/common/FlowInfoSection';
import StatusHeaderWithAI from '../components/common/StatusHeaderWithAI';
import { TransactionStatus } from '../components/common/types/StatusHeaderTypes';
import MainLayout from '../components/layout/MainLayout';
import { useGovernanceStore } from '../store/governanceStore';

/**
 * Maps the current step of the governance flow to a transaction status.
 * @param step
 * @param totalSteps
 * @return {TransactionStatus} The status corresponding to the current step.
 */
const getGovernanceStatus = (step: number, totalSteps: number): TransactionStatus => {
  // Map each step to a meaningful status
  switch (step) {
    case 1:
      return TransactionStatus.NEW; // Proposal Creation Initiated
    case 2:
      return TransactionStatus.PROCESSING; // Proposal Submitted
    case 3:
      return TransactionStatus.PROPOSAL_PREPARED; // Proposal Registered
    case 4:
      return TransactionStatus.VOTING_IN_PROGRESS; // Discussion Period
    case 5:
      return TransactionStatus.VOTING_IN_PROGRESS; // Voting Begins
    case 6:
      return TransactionStatus.VOTING_IN_PROGRESS; // Votes Being Cast
    case 7:
      return TransactionStatus.PROPOSAL_PREPARED; // Proposal Passed
    case 8:
      return TransactionStatus.PROCESSING; // Execution Queued
    case 9:
      return TransactionStatus.COMPLETE; // Proposal Executed
    case 10:
      return TransactionStatus.PROPOSAL_RECEIVED; // Proposal Rejected
    case 11:
      return TransactionStatus.PROCESSING; // Proposal Cancelled
    case 12:
      return TransactionStatus.VOTING_IN_PROGRESS; // Snapshot Voting
    case 13:
      return TransactionStatus.VOTING_IN_PROGRESS; // Snapshot Votes Cast
    default:
      return step > 13 ? TransactionStatus.COMPLETE : TransactionStatus.NEW;
  }
};

/**
 * GovernancePage component renders the governance flow visualization and actions.
 * @constructor
 * This component displays the flow chart, actions, and detailed information about the governance process.
 */
const GovernancePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const { step } = useGovernanceStore();

  return (
    <MainLayout>
      <Grid container spacing={theme.custom.spacing.grid}>
        <Grid size={12}>
          <Box sx={{ pt: theme.custom.spacing.section }}>
            <StatusHeaderWithAI
              flowType="governance"
              expanded={step > 0}
              title="DAO Governance Flow"
              stepData={stepData}
              getTransactionStatus={getGovernanceStatus}
              defaultDescription="This flow visualization demonstrates the process of creating, voting on, and executing governance proposals in a Decentralized Autonomous Organization (DAO)."
              useStore={useGovernanceStore}
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
              <GovernanceFlowChart />
              <GovernanceActions />
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: theme.custom.spacing.section }}>
        <FlowInfoSection
          title="About DAO Governance Flow"
          description="This interactive flow walks through every stage of decentralized decision-making—from drafting a proposal to executing smart-contract changes. It clarifies how on-chain voting, off-chain discussion, quorum checks, and timelocks combine to give DAOs both flexibility and security."
          keyPoints={[
            'Draft and submit proposals with metadata (targets, calldata, description)',
            'Host off-chain discussion (Forum, Discord, Discourse) to build consensus',
            'Open token-weighted voting with quorum & proposal-threshold enforcement',
            'Evaluate outcomes: passed, rejected, canceled, or vetoed',
            'Queue successful proposals in a timelock for a mandatory delay',
            'Execute on-chain actions once the timelock expires',
          ]}
          featureTitle="DAO Governance Features"
          features={[
            {
              title: 'Decentralized Decision-Making',
              description: 'Stakeholders collectively control protocol changes—no single point of failure.',
            },
            {
              title: 'Token-Weighted Voting',
              description: 'Influence is proportional to stake; supports delegation for passive holders.',
            },
            {
              title: 'Timelock Security',
              description: 'Delay gives users time to exit or challenge malicious proposals before execution.',
            },
            {
              title: 'On-Chain Transparency',
              description: 'All votes, quorums, and execution TXs are publicly verifiable.',
            },
            {
              title: 'Threshold & Quorum Safeguards',
              description: 'Prevents spam proposals and ensures meaningful community participation.',
            },
            {
              title: 'Fail-Safe Mechanics',
              description: 'Rejection, cancellation, and (optionally) guardian veto protect against exploits.',
            },
          ]}
          advancedTips={[
            'Snapshot or off-chain signaling can gauge sentiment before paying gas for an on-chain proposal.',
            'Batch multiple contract calls in a single proposal for atomic upgrades (callData arrays).',
            'Use vote-by-signature (EIP-712) to enable gas-less voting for small holders.',
            'Surface real-time quorum % and time-to-deadline in the UI to boost voter engagement.',
            'Schedule “review windows” where core contributors commit to live discussion and Q&A before voting opens.',
          ]}
          securityConsiderations={[
            'Keep the timelock admin behind a multi-sig or governance itself to avoid unilateral upgrades.',
            'Enforce proposer stake requirements to deter spam and flash-loan governance attacks.',
            'Snapshot voting power at proposal startBlock to block last-minute token borrowing.',
            'Audit target contracts for re-entrancy; governance can call *any* function with *any* calldata.',
            'Implement an emergency “pause” or guardian veto (time-bounded, on-chain transparent) for critical exploits.',
          ]}
        />
      </Box>
    </MainLayout>
  );
};

export default GovernancePage;
