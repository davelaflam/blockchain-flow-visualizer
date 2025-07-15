import { Box, Paper, useTheme, Grid } from '@mui/material';
import React from 'react';

import QarTokenCronFlowChart from '../components/blockchainFlows/qarCron/QarTokenCronFlowChart';
import { stepData } from '../components/blockchainFlows/qarCron/steps';
import FlowInfoSection from '../components/common/FlowInfoSection';
import StatusHeaderWithAI from '../components/common/StatusHeaderWithAI';
import { TransactionStatus } from '../components/common/types/StatusHeaderTypes';
import MainLayout from '../components/layout/MainLayout';
import { useQarTokenCronStore } from '../store/qarTokenCronStore';

/**
 * Maps the current step of the QAR Token Cron flow to a transaction status.
 * @param step
 * @param totalSteps
 * @return {TransactionStatus} The status corresponding to the current step.
 */
const getQarCronTransactionStatus = (step: number, totalSteps: number): TransactionStatus => {
  if (step === 0) return TransactionStatus.NEW;
  if (step === 1) return TransactionStatus.SENT_TO_AO;
  if (step === 2) return TransactionStatus.PROCESSING;
  if (step === 3) return TransactionStatus.PROCESSING;
  if (step === 4) return TransactionStatus.COMPLETE;
  if (step === 5) return TransactionStatus.COMPLETE;
  return TransactionStatus.NEW;
};

/**
 * QarTokenCronPage component renders the QAR Token Cron process flow visualization and actions.
 * @constructor
 * This component displays the flow chart, actions, and detailed information about the QAR Token Cron process.
 */
const QarTokenCronPage: React.FC = () => {
  const theme = useTheme();
  const reset = useQarTokenCronStore((state: { reset: () => void }) => state.reset);
  const { step } = useQarTokenCronStore();

  // Reset the flow when component mounts
  React.useEffect(() => {
    reset();
  }, [reset]);

  return (
    <MainLayout>
      <Grid container spacing={theme.custom.spacing.grid}>
        <Grid size={12}>
          <Box sx={{ pt: theme.custom.spacing.section }}>
            <StatusHeaderWithAI
              flowType="qarTokenCron"
              expanded={step > 0}
              title="QAR Token Cron Process Flow"
              stepData={stepData}
              getTransactionStatus={getQarCronTransactionStatus}
              defaultDescription="This flow visualization demonstrates the automated maintenance process for QAR tokens managed by scheduled cron jobs."
              useStore={useQarTokenCronStore}
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
              <QarTokenCronFlowChart />
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: theme.custom.spacing.section }}>
        <FlowInfoSection
          title="About QAR Token Cron Process"
          description="The QAR Token Cron Process is an automated maintenance workflow that keeps the QAR token ecosystem healthy.
This scheduled process periodically handles core operations such as confirming deposits, processing withdrawals,
minting new supply, and updating audit logs."
          keyPoints={[
            'Confirming token deposits after sufficient blockchain confirmations',
            'Processing pending user-initiated withdrawal requests',
            'Minting new QAR tokens in line with tokenomics rules',
            'Maintaining detailed system logs for audit and monitoring',
          ]}
          featureTitle="Benefits"
          features={[
            {
              title: 'Automation',
              description: 'Eliminates manual intervention for routine maintenance tasks',
            },
            {
              title: 'Reliability',
              description: 'Ensures consistent execution of critical token operations',
            },
            {
              title: 'Transparency',
              description: 'All operations are logged and verifiable for compliance',
            },
            {
              title: 'Efficiency',
              description: 'Batches on-chain transactions to reduce gas and resource usage',
            },
          ]}
          securityConsiderations={[
            'Cron executor keys should be stored in secure, hardware-backed wallets or HSMs to prevent compromise',
            'Rate-limit or circuit-break the cron job to avoid runaway minting/withdrawal loops in the event of upstream API failures',
            'Implement on-chain “pause” and “admin timelock” functions so governance can halt the cron in emergencies',
            'Validate deposit and withdrawal proofs twice (off-chain + on-chain) to defend against chain reorganizations',
            'Ensure minting logic enforces total-supply caps and emits SupplyCapExceeded events on attempted over-mint',
          ]}
          advancedTips={[
            'Use exponential back-off for retry logic when upstream RPC endpoints are down to avoid rate-limit bans',
            'Emit metrics (e.g., Prometheus) for each cron cycle: processedDeposits, mintedSupply, failedTxs, avgGasUsed',
            'Support “dry-run” mode to simulate a full cycle in staging before deploying new cron logic to production',
            'Leverage EIP-4337 (Account Abstraction) or a dedicated relayer to cover gas for cron executions on low-balance wallets',
            'Shard large withdrawal queues into smaller batches to stay below block gas limits and prevent out-of-gas failures',
          ]}
        />
      </Box>
    </MainLayout>
  );
};

export default QarTokenCronPage;
