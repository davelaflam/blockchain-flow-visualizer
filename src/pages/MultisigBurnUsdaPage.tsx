import { Paper, useTheme, useMediaQuery, Box, Grid } from '@mui/material';
import React from 'react';

import MultisigBurnUsdaFlowChart from '../components/blockchainFlows/multisig/burnUsda/MultisigBurnUsdaFlowChart';
import { stepData } from '../components/blockchainFlows/multisig/burnUsda/steps';
import FlowInfoSection from '../components/common/FlowInfoSection';
import StatusHeaderWithAI from '../components/common/StatusHeaderWithAI';
import { TransactionStatus } from '../components/common/types/StatusHeaderTypes';
import MainLayout from '../components/layout/MainLayout';
import { useBurningFlowStore } from '../store/burningFlowStore';

/**
 * Maps the current step of the multisig burning flow to a transaction status.
 * @param step
 * @param totalSteps
 * @return {TransactionStatus} The status corresponding to the current step.
 */
const getBurningTransactionStatus = (step: number, totalSteps: number): TransactionStatus => {
  if (step === 0) return TransactionStatus.NEW;
  if (step === 1) return TransactionStatus.SENT_TO_AO;
  if (step === 2) return TransactionStatus.PROPOSAL_RECEIVED;
  if (step === 3) return TransactionStatus.BURN_APPROVED;
  if (step === 4) return TransactionStatus.BURNING;
  if (step >= totalSteps) return TransactionStatus.COMPLETE;
  return TransactionStatus.NEW;
};

/**
 * MultisigBurnUsdaPage component renders the multisig burning USDA flow visualization and actions.
 * @constructor
 * This component displays the flow chart, actions, and detailed information about the multisig burning process.
 */
const MultisigBurnUsdaPage: React.FC = () => {
  const theme = useTheme();
  const { step, isPlaying, nextStep, prevStep, play, pause, reset } = useBurningFlowStore();

  const handleReset = () => {
    reset();
    // Add any additional reset logic here if needed
  };

  return (
    <MainLayout>
      <Grid container spacing={theme.custom.spacing.grid}>
        <Grid size={12}>
          <Box sx={{ pt: theme.custom.spacing.section }}>
            <StatusHeaderWithAI
              flowType="multisigBurning"
              expanded={step > 0}
              title="Multisig Burning USDA Flow"
              stepData={stepData}
              getTransactionStatus={getBurningTransactionStatus}
              defaultDescription="This flow visualization demonstrates the process of burning USDA tokens through a multi-signature approval workflow."
              useStore={useBurningFlowStore}
              showControls={true}
              onReset={handleReset}
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
              <MultisigBurnUsdaFlowChart />
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: theme.custom.spacing.section }}>
        <FlowInfoSection
          title="USDA Multisig Burn Lifecycle"
          description="Watch how USDA supply is permanently reduced through a decentralized multisignature process. From a user’s burn request to validator voting and on-chain execution, every step is recorded, auditable, and designed to prevent single-point failure."
          keyPoints={[
            'User submits on-chain burnRequest(amount, destination)',
            'AO event pool indexes the request and notifies validators',
            'Validators create a multisig proposal and cast threshold votes',
            'On success, burn() destroys USDA and emits Burned event',
            'Optional: cross-chain messenger unlocks collateral on another chain',
          ]}
          featureTitle="USDA Burning Highlights"
          features={[
            {
              title: 'Multisig Security',
              description: '≥ N-of-M validator signatures required—no unilateral burns.',
            },
            {
              title: 'Cross-Chain Redemption',
              description: 'Burn on Chain A can release collateral or mint wrapped assets on Chain B.',
            },
            {
              title: 'Consensus Transparency',
              description: 'Proposal, votes, and execution TXs live on-chain for public audit.',
            },
            {
              title: 'Supply Audit Trail',
              description: 'Every burn immediately reflects in totalSupply() for provable scarcity.',
            },
          ]}
          advancedTips={[
            'Expose burnRequest hash in the UI so users can track quorum progress in real time.',
            'Support EIP-712 off-chain signatures ➜ batch submit to save validator gas.',
            'Allow DAO-controlled updates to quorum (N-of-M) via timelocked governance.',
            'Emit events with ChainID + nonce to enable deterministic cross-chain proofs.',
          ]}
          securityConsiderations={[
            'Validator key rotation should require a delayed “pending” period to prevent sudden capture.',
            'Burn contract must guard against re-entrancy when calling external collateral unlockers.',
            'Implement sequence-number or nonce replay-protection on burn proposals.',
            'Quorum reduction or validator-set changes must pass through the same timelock as burns.',
            'Regularly reconcile burnedAmount vs. collateralReleased to catch accounting drift.',
          ]}
        />
      </Box>
    </MainLayout>
  );
};

export default MultisigBurnUsdaPage;
