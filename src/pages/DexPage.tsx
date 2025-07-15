import { Paper, useTheme, useMediaQuery, Box, Grid } from '@mui/material';
import React from 'react';

import DexActions from '../components/blockchainFlows/dex/DexActions';
import DexFlowChart from '../components/blockchainFlows/dex/DexFlowChart';
import { stepData } from '../components/blockchainFlows/dex/steps';
import FlowInfoSection from '../components/common/FlowInfoSection';
import StatusHeaderWithAI from '../components/common/StatusHeaderWithAI';
import { TransactionStatus } from '../components/common/types/StatusHeaderTypes';
import MainLayout from '../components/layout/MainLayout';
import { useDexStore } from '../store/dexStore';

/**
 * Maps the current step of the DEX flow to a transaction status.
 * @param step
 * @param totalSteps
 * @return {TransactionStatus} The status corresponding to the current step.
 */
const getDexStatus = (step: number, totalSteps: number): TransactionStatus => {
  // Map each step to a meaningful status
  switch (step) {
    case 1:
      return TransactionStatus.PROCESSING; // User Connects Wallet
    case 2:
      return TransactionStatus.PROCESSING; // User Approves Tokens
    case 3:
      return TransactionStatus.VOTING_IN_PROGRESS; // Router Processes Transaction
    case 4:
      return TransactionStatus.PROCESSING; // Token Swap Execution
    case 5:
      return TransactionStatus.PROCESSING; // Fees Collection
    case 6:
      return TransactionStatus.VOTING_IN_PROGRESS; // Liquidity Addition Validation
    case 7:
      return TransactionStatus.PROCESSING; // Liquidity Addition to Pool
    case 8:
      return TransactionStatus.MINTING; // LP Token Minting
    case 9:
      return TransactionStatus.VOTING_IN_PROGRESS; // Liquidity Removal Validation
    case 10:
      return TransactionStatus.PROCESSING; // Liquidity Removal from Pool
    default:
      return step > 10 ? TransactionStatus.COMPLETE : TransactionStatus.PROCESSING;
  }
};

/**
 * DexPage component renders the DEX flow visualization and actions.
 * @constructor
 * This component displays the flow chart, actions, and detailed information about the DEX process.
 */
const DexPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const { step } = useDexStore();

  return (
    <MainLayout>
      <Grid container spacing={theme.custom.spacing.grid}>
        <Grid size={12}>
          <Box sx={{ pt: theme.custom.spacing.section }}>
            <StatusHeaderWithAI
              flowType="dex"
              expanded={step > 0}
              title="Decentralized Exchange (DEX) Flow"
              stepData={stepData}
              getTransactionStatus={getDexStatus}
              defaultDescription="This flow visualization demonstrates the process of swapping tokens and providing liquidity in a decentralized exchange."
              useStore={useDexStore}
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
              <DexFlowChart />
              <DexActions />
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: theme.custom.spacing.section }}>
        <FlowInfoSection
          title="About Decentralized Exchange (DEX) Flow"
          description="This flow illustrates how automated-market-maker (AMM) DEXs enable permissionless token swaps and liquidity provision. Follow the journey from wallet connection through pool interactions, fee accrual, and safe exit—all without traditional intermediaries."
          keyPoints={[
            'Connect wallet and grant router approval to spend specific tokens',
            'Query on-chain pools to preview price impact and slippage',
            'Execute swaps via the AMM router, settling tokens in one transaction',
            'Deposit balanced (or single-sided via zap) liquidity and receive LP tokens',
            'Burn LP tokens to withdraw underlying assets plus accrued trading fees',
          ]}
          featureTitle="DEX Features"
          features={[
            {
              title: 'Automated Market Making',
              description:
                'Uses constant-product formulas (e.g., x·y = k) to algorithmically price assets based on pool ratios.',
            },
            {
              title: 'Liquidity Provision',
              description: 'Earn a share of swap fees by supplying tokens to pools; LP tokens track your stake.',
            },
            {
              title: 'Permissionless Trading',
              description: 'Swap any ERC-20 (or chain-native equivalent) without central order-books or KYC.',
            },
            {
              title: 'On-Chain Transparency',
              description: 'Every swap, add, or remove event is publicly recorded and can be audited in real-time.',
            },
          ]}
          advancedTips={[
            'Adjust slippage tolerance and deadline parameters to avoid failed swaps during volatile markets.',
            'Route optimizers (e.g., 0x, 1inch) can split orders across pools for better pricing—surface best-route UX.',
            'Use impermanent-loss calculators to preview risk before providing liquidity.',
            'Batch multiple small swaps into one transaction to save on gas (EIP-1559 compatible).',
            'Single-sided “zap” deposits streamline entering LP positions by auto-balancing token ratios.',
          ]}
          securityConsiderations={[
            'Limit token allowances to the exact amount needed; avoid “infinite approve” to reduce exploit surface.',
            'MEV front-running and sandwich attacks can distort pricing—recommend setting tight slippage.',
            'Critical AMM contracts should undergo formal verification and time-locked, on-chain governance upgrades.',
            'Oracles feeding TWAP/price data must include manipulation-resistance mechanisms (e.g., multi-block TWAP).',
            'Warn LPs of impermanent loss: volatile pairs may yield negative returns despite fee income.',
          ]}
        />
      </Box>
    </MainLayout>
  );
};

export default DexPage;
