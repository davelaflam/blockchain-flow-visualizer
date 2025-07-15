import { Paper, useTheme, useMediaQuery, Box, Grid } from '@mui/material';
import React from 'react';

import CrossChainBridgeActions from '../components/blockchainFlows/crossChainBridge/CrossChainBridgeActions';
import CrossChainBridgeFlowChart from '../components/blockchainFlows/crossChainBridge/CrossChainBridgeFlowChart';
import { stepData } from '../components/blockchainFlows/crossChainBridge/steps';
import { NodeStatus } from '../components/blockchainFlows/types';
import FlowInfoSection from '../components/common/FlowInfoSection';
import StatusHeaderWithAI from '../components/common/StatusHeaderWithAI';
import MainLayout from '../components/layout/MainLayout';
import { useCrossChainBridgeStore } from '../store/crossChainBridgeStore';

/**
 * Maps the current step of the cross-chain bridge flow to a node status.
 * @param step
 * @param totalSteps
 * @return {NodeStatus} The status corresponding to the current step.
 */
const getCrossChainBridgeStatus = (step: number, totalSteps: number): NodeStatus => {
  // Map each step to a meaningful status
  switch (step) {
    case 1:
      return 'PROCESSING'; // User Initiates Transfer
    case 2:
      return 'PROCESSING'; // Lock Tokens
    case 3:
      return 'VOTING_IN_PROGRESS'; // Validate Transaction
    case 4:
      return 'SENT_TO_AO'; // Send Message
    case 5:
      return 'PROCESSING'; // Process Message
    case 6:
      return 'PROPOSAL_RECEIVED'; // Relay to Target
    case 7:
      return 'VOTING_IN_PROGRESS'; // Verify Message
    case 8:
      return 'MINTING'; // Release Tokens
    case 9:
      return 'COMPLETE'; // Receive Tokens
    case 10:
      return 'COMPLETE'; // Complete Transfer
    default:
      return step > 10 ? 'COMPLETE' : 'PROCESSING';
  }
};

/**
 * CrossChainBridgePage component renders the cross-chain bridge flow visualization and actions.
 * @constructor
 * This component displays the flow chart, actions, and detailed information about the cross-chain bridge process.
 */
const CrossChainBridgePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const { step } = useCrossChainBridgeStore();

  return (
    <MainLayout>
      <Grid container spacing={theme.custom.spacing.grid}>
        <Grid size={12}>
          <Box sx={{ pt: theme.custom.spacing.section }}>
            <StatusHeaderWithAI
              flowType="crossChainBridge"
              expanded={step > 0}
              title="Cross-Chain Bridge Flow"
              stepData={stepData}
              getTransactionStatus={getCrossChainBridgeStatus}
              defaultDescription="This flow visualization demonstrates the process of transferring tokens between different blockchains using a cross-chain bridge."
              useStore={useCrossChainBridgeStore}
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
              <CrossChainBridgeFlowChart />
              <CrossChainBridgeActions />
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: theme.custom.spacing.section }}>
        <FlowInfoSection
          title="About the Cross-Chain Bridge Flow"
          description="This flow breaks down—step by step—how assets migrate from one blockchain to another. It walks you through locking tokens on the source chain, relaying tamper-proof messages, and releasing or minting equivalent value on the destination chain, all while highlighting the cryptographic guarantees that keep the process secure."
          keyPoints={[
            'Initiate a transfer: choose destination network, asset, and recipient',
            'Lock (or burn) source-chain tokens in a custodial smart contract',
            'Reach validator quorum via multi-signature or PoS attestation',
            'Relay cryptographically signed messages through an off-chain or on-chain relayer set',
            'Verify proofs and unlock / mint wrapped tokens on the target chain',
          ]}
          featureTitle="Cross-Chain Bridge Capabilities"
          features={[
            {
              title: 'Seamless Interoperability',
              description: 'Move assets among heterogeneous chains without relying on a centralized exchange.',
            },
            {
              title: 'Defense-in-Depth Security',
              description: 'Multi-sig + proof-of-origin validation mitigate double-spend and replay attacks.',
            },
            {
              title: 'Predictable Latency',
              description: 'Parallel message relaying and batched proofs shorten end-to-end settlement time.',
            },
            {
              title: 'Transparent Audit Trail',
              description: 'Each phase emits events that wallets, explorers, and analytics dashboards can verify.',
            },
          ]}
          advancedTips={[
            'Bridges that mint wrapped assets often support 1:1 redemption back to the origin chain—explain this to users up-front.',
            'Cross-chain transfers generally require gas on *both* chains; integrate fee-estimation APIs so the UI can surface expected costs.',
            'Batching multiple small transfers into one proof submission lowers gas but may increase wait time—offer a “priority” option.',
            'Some bridges let liquidity providers pre-fund exits (fast-finality mode) in exchange for a fee—surface this as an advanced toggle.',
          ]}
          securityConsiderations={[
            'Validator set rotation should be governed on-chain and subject to a timelock to prevent hostile takeovers.',
            'Use unique nonces and Merkle-root checkpoints to guarantee replay protection and proof freshness.',
            'Timeouts & challenge windows let users refund if a message is never relayed—document those edge cases openly.',
            'Run continuous monitoring that alerts governance if validator signatures diverge or a relayer queue stalls.',
          ]}
        />
      </Box>
    </MainLayout>
  );
};

export default CrossChainBridgePage;
