import { Paper, useTheme, useMediaQuery, Box, Grid } from '@mui/material';
import React from 'react';

import MultisigMintUsdaFlowChart from '../components/blockchainFlows/multisig/mintUsda/MultisigMintUsdaFlowChart';
import { stepData } from '../components/blockchainFlows/multisig/mintUsda/steps';
import FlowInfoSection from '../components/common/FlowInfoSection';
import StatusHeaderWithAI from '../components/common/StatusHeaderWithAI';
import { TransactionStatus } from '../components/common/types/StatusHeaderTypes';
import MainLayout from '../components/layout/MainLayout';
import { useMintingFlowStore } from '../store/mintingFlowStore';

/**
 * Maps the current step of the multisig minting flow to a transaction status.
 * @param step
 * @param totalSteps
 * @return {TransactionStatus} The status corresponding to the current step.
 */
const getMintingTransactionStatus = (step: number, totalSteps: number): TransactionStatus => {
  if (step === 0) return TransactionStatus.NEW;
  if (step >= 1 && step < 4) return TransactionStatus.SENT_TO_AO;
  if (step === 4) return TransactionStatus.PROPOSAL_PREPARED;
  if (step >= 5 && step <= 6) return TransactionStatus.PROPOSAL_RECEIVED;
  if (step >= 7 && step <= 8) return TransactionStatus.VOTING_IN_PROGRESS;
  if (step >= 9 && step <= 10) return TransactionStatus.MINT_APPROVED;
  if (step === 11) return TransactionStatus.MINTING;
  if (step >= totalSteps) return TransactionStatus.COMPLETE;
  return TransactionStatus.NEW;
};

/**
 * MultisigMintUsdaPage component renders the multisig minting USDA flow visualization and actions.
 * @constructor
 * This component displays the flow chart, actions, and detailed information about the multisig minting process.
 */
const MultisigMintUsdaPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const { step } = useMintingFlowStore();

  return (
    <MainLayout>
      <Grid container spacing={theme.custom.spacing.grid}>
        <Grid size={12}>
          <Box sx={{ pt: theme.custom.spacing.section }}>
            <StatusHeaderWithAI
              flowType="multisigMinting"
              expanded={step > 0}
              title="Multisig Minting USDA Flow"
              stepData={stepData}
              useStore={useMintingFlowStore}
              getTransactionStatus={getMintingTransactionStatus}
            />
          </Box>
        </Grid>

        <Grid size={12}>
          <Box
            sx={{
              // mt: { xs: theme.custom.spacing.component, sm: theme.custom.spacing.section },
              mt: 0,
              mb: 0,
            }}
          >
            <Paper
              elevation={1}
              sx={{
                // p: { xs: theme.custom.spacing.component, md: theme.custom.spacing.container },
                p: 0,
                overflow: 'hidden',
                borderRadius: 1,
              }}
            >
              <MultisigMintUsdaFlowChart />
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: theme.custom.spacing.section }}>
        <FlowInfoSection
          title="USDA Multisig Mint Lifecycle"
          description="Track how a bridged deposit on Ethereum becomes freshly minted USDA on the AO chain. The flow covers deposit detection, AO event handling, validator quorum, and the final mint() execution—every step logged and permissionless."
          keyPoints={[
            'Ethereum user deposits collateral ➜ emits DepositLocked(txHash, amount, recipient)',
            'AO indexers fetch the event → store in EventPool with Merkle proof',
            'Validators create mintProposal(txHash, amount, recipient) and sign off-chain',
            'Once ≥ N-of-M signatures collected, execute mint() to credit USDA',
            'totalSupply() and Minted events update instantly for on-chain auditors',
          ]}
          featureTitle="USDA Multisig Highlights"
          features={[
            {
              title: 'Multisig Security',
              description: 'Threshold signatures block unilateral or rogue mint attempts.',
            },
            {
              title: 'Cross-Chain Bridging',
              description: 'Proof-of-deposit on Ethereum unlocks mint rights on AO.',
            },
            {
              title: 'Decentralized Consensus',
              description: 'Validators coordinate via AO; no single admin key.',
            },
            {
              title: 'Audit-Friendly Supply',
              description: 'Every mint affects totalSupply and is queryable on-chain.',
            },
          ]}
          advancedTips={[
            'Expose deposit txHash & proof in UI so users can monitor proposal status live.',
            'Use EIP-712 signatures; batch multiple mints in one call to save gas.',
            'Supply cap (maxSupply) can be enforced in the mint contract—surfaced via on-chain config.',
            'Quorum or validator set changes should flow through DAO governance + timelock for safety.',
          ]}
          securityConsiderations={[
            'Verify Merkle proof or light-client header before accepting a deposit event.',
            'Nonce / replay-protection on mintProposal prevents double-mint exploits.',
            'Enforce hard supply caps and collateralization ratio to avoid over-minting.',
            'Validator key rotation must include delay + on-chain announcement to mitigate key theft.',
            'Mint contract should be pausable via multisig/guardian for emergency response (audited & timelocked).',
          ]}
        />
      </Box>
    </MainLayout>
  );
};

export default MultisigMintUsdaPage;
