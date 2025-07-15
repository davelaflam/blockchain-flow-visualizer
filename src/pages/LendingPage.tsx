import { Paper, useTheme, useMediaQuery, Box, Grid } from '@mui/material';
import React from 'react';

import LendingFlowChart from '../components/blockchainFlows/lending/LendingFlowChart';
import { stepData } from '../components/blockchainFlows/lending/steps';
import FlowInfoSection from '../components/common/FlowInfoSection';
import StatusHeaderWithAI from '../components/common/StatusHeaderWithAI';
import { TransactionStatus } from '../components/common/types/StatusHeaderTypes';
import MainLayout from '../components/layout/MainLayout';
import { useLendingFlowStore } from '../store/lendingFlowStore';

/**
 * Maps the current step of the lending flow to a transaction status.
 * @param step
 * @param totalSteps
 * @return {TransactionStatus} The status corresponding to the current step.
 */
const getLendingStatus = (step: number, totalSteps: number): TransactionStatus => {
  // Map each step to a meaningful status
  switch (step) {
    case 1:
      return TransactionStatus.PROCESSING; // Connect Wallet
    case 2:
      return TransactionStatus.PROCESSING; // Approve Token Spending
    case 3:
      return TransactionStatus.PROCESSING; // Deposit Collateral
    case 4:
      return TransactionStatus.PROCESSING; // Collateral Locked
    case 5:
      return TransactionStatus.PROCESSING; // Borrow Assets
    case 6:
      return TransactionStatus.MONITORING; // Health Factor Monitoring
    case 7:
      return TransactionStatus.ALERT; // Liquidation Risk
    case 8:
      return TransactionStatus.PROCESSING; // Repay Loan
    case 9:
      return TransactionStatus.PROCESSING; // Loan Closed
    case 10:
      return TransactionStatus.PROCESSING; // Withdraw Collateral
    case 11:
      return TransactionStatus.COMPLETE; // Transaction Complete
    default:
      return step > 11 ? TransactionStatus.COMPLETE : TransactionStatus.PROCESSING;
  }
};

/**
 * LendingPage component renders the lending/borrowing flow visualization and actions.
 * @constructor
 * This component displays the flow chart, actions, and detailed information about the lending process.
 */
const LendingPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const { step } = useLendingFlowStore();

  return (
    <MainLayout>
      <Grid container spacing={theme.custom.spacing.grid}>
        <Grid size={12}>
          <Box sx={{ pt: theme.custom.spacing.section }}>
            <StatusHeaderWithAI
              flowType="lending"
              expanded={step > 0}
              title="Lending/Borrowing Flow"
              stepData={stepData}
              getTransactionStatus={getLendingStatus}
              defaultDescription="This flow visualization demonstrates the process of lending and borrowing assets in a DeFi protocol, including collateral management, health factor monitoring, and liquidation risk."
              useStore={useLendingFlowStore}
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
              <LendingFlowChart />
              {/*<LendingFlowActions />*/}
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: theme.custom.spacing.section }}>
        <FlowInfoSection
          title="DeFi Lending & Borrowing Lifecycle"
          description="Follow the full journey of a permissionless loan: deposit collateral, draw liquidity, monitor interest-accruing debt, and exit safely. Each step is enforced by smart-contract logic—no bank manager required."
          keyPoints={[
            'Connect wallet → approve collateral token spend',
            'Supply assets; receive interest-bearing cTokens / aTokens',
            'Borrow against collateral up to the max LTV (loan-to-value)',
            'Accrue interest block-by-block; health factor updates in real time',
            'Add collateral or repay to avoid liquidation when markets move',
            'If health < 1.0, liquidators seize collateral + bonus to clear bad debt',
            'Repay full balance to unlock and withdraw collateral',
          ]}
          featureTitle="Protocol Highlights"
          features={[
            {
              title: 'Over-Collateralization',
              description: 'Collateral value must exceed borrowed value—core to trustless solvency.',
            },
            {
              title: 'Dynamic Interest Rates',
              description: 'Supply / borrow APRs auto-adjust with pool utilization and market demand.',
            },
            {
              title: 'Automated Liquidations',
              description: 'Bot networks repay your debt when under-collateralized and keep a bonus.',
            },
            {
              title: 'Real-Time Health Factor',
              description: 'Dashboard shows up-to-the-second collateral-to-debt ratio & liquidation threshold.',
            },
            {
              title: 'Governance Controls',
              description: 'DAO can tune LTV caps, liquidation bonus, oracles, and reserve factors via proposals.',
            },
          ]}
          advancedTips={[
            'Choose variable vs. stable borrow rates to hedge interest-rate risk.',
            'Correlated-asset “eMode” (Aave) unlocks higher LTV for assets like ETH-stETH.',
            'Flash-repay loops let you refinance debt into lower-rate assets in one TX.',
            'Set on-chain health-factor alerts with Gelato / Chainlink Automation to auto-top-up collateral.',
            'Batch supply+borrow in a single meta-transaction to save gas for mobile users.',
          ]}
          securityConsiderations={[
            'Price-oracle manipulation (flash-loan swings) can trigger unfair liquidations—use TWAP or Chainlink feeds.',
            'Limit token approvals to exact collateral amounts; avoid “infinite approve.”',
            'Interest-rate model upgrades must be timelocked + audited to prevent sudden LTV shifts.',
            'Liquidation bonus should balance bad-debt coverage without excessive extraction from users.',
            'Protocol pause / guardian role should be multi-sig & transparently logged for emergency shutdowns.',
          ]}
        />
      </Box>
    </MainLayout>
  );
};

export default LendingPage;
