import { Paper, useTheme, useMediaQuery, Box, Grid } from '@mui/material';
import React from 'react';

import StakingFlowChart from '../components/blockchainFlows/staking/StakingFlowChart';
import { stepData } from '../components/blockchainFlows/staking/steps';
import FlowInfoSection from '../components/common/FlowInfoSection';
import StatusHeaderWithAI from '../components/common/StatusHeaderWithAI';
import { TransactionStatus } from '../components/common/types/StatusHeaderTypes';
import MainLayout from '../components/layout/MainLayout';
import { useStakingFlowStore } from '../store/stakingFlowStore';

/**
 * Maps the current step of the staking flow to a transaction status.
 * @param step
 * @param totalSteps
 * @return {TransactionStatus} The status corresponding to the current step.
 */
const getStakingTransactionStatus = (step: number, totalSteps: number): TransactionStatus => {
  if (step === 0) return TransactionStatus.NEW;
  if (step === 1) return TransactionStatus.CONNECTED;
  if (step === 2) return TransactionStatus.APPROVED;
  if (step === 3) return TransactionStatus.STAKING;
  if (step === 4) return TransactionStatus.STAKED;
  if (step === 5) return TransactionStatus.EARNING;
  if (step === 6) return TransactionStatus.CLAIMED;
  if (step === 7) return TransactionStatus.UNSTAKING;
  if (step === 8) return TransactionStatus.COOLDOWN;
  if (step === 9) return TransactionStatus.WITHDRAWN;
  if (step >= totalSteps) return TransactionStatus.COMPLETE;
  return TransactionStatus.NEW;
};

/**
 * StakingPage component renders the staking flow visualization and actions.
 * @constructor
 * This component displays the flow chart, actions, and detailed information about the staking process.
 */
const StakingPage: React.FC = () => {
  const theme = useTheme();
  const { step } = useStakingFlowStore();

  return (
    <MainLayout>
      <Grid container spacing={theme.custom.spacing.grid}>
        <Grid size={12}>
          <Box sx={{ pt: theme.custom.spacing.section }}>
            <StatusHeaderWithAI
              flowType="staking"
              expanded={step > 0}
              title="Token Staking Flow"
              stepData={stepData}
              getTransactionStatus={getStakingTransactionStatus}
              useStore={useStakingFlowStore}
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
              <StakingFlowChart />
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: theme.custom.spacing.section }}>
        <FlowInfoSection
          title="Understanding the Token Staking Lifecycle"
          description="The Token Staking Flow illustrates the complete lifecycle of staking tokens in a blockchain network. This visualization helps users understand how tokens are locked in a staking contract to earn rewards, how those rewards accumulate, and how the unstaking process works—including the mandatory cooldown period before withdrawal."
          keyPoints={[
            'Connecting wallet and granting staking contract token spending permission',
            'Locking tokens in the staking contract to begin earning rewards',
            'Continuously accumulating staking rewards over time',
            'Requesting to unstake and entering the cooldown period',
            'Withdrawing staked tokens and earned rewards back to user wallet',
          ]}
          featureTitle="Staking Features"
          features={[
            {
              title: 'Rewards',
              description: 'Earn passive income by staking tokens in the network',
            },
            {
              title: 'Security',
              description: 'Contribute to network security through token staking',
            },
            {
              title: 'Governance',
              description: 'Participate in governance decisions based on stake amount',
            },
            {
              title: 'Liquidity',
              description: 'Maintain liquidity with flexible staking and unstaking options',
            },
            {
              title: 'Validator Incentives',
              description: 'Staking helps secure the network by aligning economic incentives for node validators',
            },
          ]}
          advancedTips={[
            'Some protocols allow users to restake rewards automatically for compounding returns (auto-stake)',
            'Delegated staking lets users assign voting or validation power to another entity while retaining ownership',
            'Unstaking cooldowns can vary per protocol — some use epoch-based delays while others use fixed time windows',
            'Protocols may distribute rewards in a different token than the one staked (e.g., staking AR might reward QAR)',
            'Liquid staking derivatives (e.g., stQAR) allow users to earn rewards while keeping their assets tradable',
          ]}
          securityConsiderations={[
            'Smart contracts used for staking should be audited to prevent vulnerabilities such as reentrancy or logic bugs',
            'Ensure the staking contract cannot be upgraded maliciously (use transparent proxy patterns or time-delayed upgrades)',
            'Cooldown periods and withdrawal windows must be clearly defined and enforced to avoid rug-pull risks',
            'Validator slashing logic (if applicable) should be transparent to avoid unexpected token losses',
            'Staking through third-party apps or custodians introduces additional trust and counterparty risks',
          ]}
        />
      </Box>
    </MainLayout>
  );
};

export default StakingPage;
