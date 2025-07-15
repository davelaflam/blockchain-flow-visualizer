import {
  Box,
  Paper,
  useTheme,
  useMediaQuery,
  TextField,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
  Divider,
  styled,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import { logDebug, logInfo, logWarn, logError } from 'services/logger';
import { useCrossChainBridgeStore } from 'store/crossChainBridgeStore';
import { uiColors } from 'theme/colors';

import { TokenActionButton } from '../../common/TokenActionButton';
import { TokenActionModal } from '../../common/TokenActionModal';

// Styled component for the progress bar
const ConfirmationProgress = styled('div')(({ theme }) => ({
  width: '100%',
  height: 8,
  backgroundColor: theme.palette.action.hover,
  borderRadius: 4,
  overflow: 'hidden',
  '& > div': {
    height: '100%',
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
    transition: 'width 0.3s ease',
  },
}));

const CHAIN_OPTIONS = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'solana', label: 'Solana' },
  { value: 'arweave', label: 'Arweave' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'avalanche', label: 'Avalanche' },
];

const CrossChainBridgeActions: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    step,
    setStep,
    transferStatus,
    transferConfirmations,
    requiredConfirmations,
    initiateTransfer,
    confirmTransfer,
    resetTransfer,
  } = useCrossChainBridgeStore();

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sourceChain, setSourceChain] = useState('ethereum');
  const [targetChain, setTargetChain] = useState('arweave');
  const [amount, setAmount] = useState('100');
  const [recipientAddress, setRecipientAddress] = useState('0x' + Math.random().toString(16).substring(2, 42));

  useEffect(() => {
    setStep(0);
  }, [setStep]);

  useEffect(() => {
    if (transferStatus === 'completed') {
      setStep(1);
      resetTransfer();
    }
  }, [transferStatus, resetTransfer, setStep]);

  /**
   * Handles closing the transfer modal.
   * Resets the transfer state if the transfer is not completed.
   */
  const handleModalClose = () => {
    if (transferStatus !== 'completed') {
      resetTransfer();
    }
    setIsTransferModalOpen(false);
  };

  /**
   * Initiates a cross-chain transfer with the current form values.
   * Sets the processing state, calls the initiateTransfer function from the store,
   * opens the transfer modal, and confirms the transfer.
   * Logs any errors that occur during the transfer process.
   */
  const handleTransfer = async () => {
    try {
      setIsProcessing(true);
      const txId = await initiateTransfer(sourceChain, targetChain, Number(amount), recipientAddress);
      logInfo('Transfer initiated', { txId, sourceChain, targetChain, amount, recipientAddress });
      setIsTransferModalOpen(true);
      confirmTransfer(txId);
    } catch (error) {
      logError('Transfer failed', error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        width: '100%',
        height: 'auto',
        background: uiColors.darkBackground,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        mb: 0,
        mt: 2,
        padding: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mb: 0,
          mt: 0,
          p: 2,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
            maxWidth: '600px',
          }}
        >
          <Typography variant="h6" align="center" gutterBottom>
            Cross-Chain Transfer
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
            <TextField
              select
              label="Source Chain"
              value={sourceChain}
              onChange={e => setSourceChain(e.target.value)}
              fullWidth
              variant="outlined"
            >
              {CHAIN_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Target Chain"
              value={targetChain}
              onChange={e => setTargetChain(e.target.value)}
              fullWidth
              variant="outlined"
            >
              {CHAIN_OPTIONS.filter(option => option.value !== sourceChain).map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            fullWidth
            variant="outlined"
            InputProps={{
              endAdornment: (
                <Box component="span" sx={{ color: 'text.secondary', ml: 1 }}>
                  Tokens
                </Box>
              ),
            }}
          />

          <TextField
            label="Recipient Address"
            value={recipientAddress}
            onChange={e => setRecipientAddress(e.target.value)}
            fullWidth
            variant="outlined"
          />

          <TokenActionButton
            actionType="custom"
            onClick={() => {
              void handleTransfer();
            }}
            isLoading={isProcessing}
            fullWidth
          />
        </Box>

        <TokenActionModal open={isTransferModalOpen} onClose={handleModalClose} actionType="custom" showConfirm={false}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            {transferStatus === 'processing' && (
              <>
                <CircularProgress size={48} thickness={4} color="primary" sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Initiating Cross-Chain Transfer
                </Typography>
                <Typography variant="body1" paragraph>
                  Preparing your transfer from {CHAIN_OPTIONS.find(c => c.value === sourceChain)?.label} to{' '}
                  {CHAIN_OPTIONS.find(c => c.value === targetChain)?.label}...
                </Typography>
              </>
            )}

            {transferStatus === 'awaiting' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Cross-Chain Transfer Initiated
                </Typography>
                <Typography variant="body1" paragraph>
                  Your transfer from {CHAIN_OPTIONS.find(c => c.value === sourceChain)?.label} to{' '}
                  {CHAIN_OPTIONS.find(c => c.value === targetChain)?.label} has been initiated.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Waiting for blockchain confirmation...
                </Typography>
                <CircularProgress size={24} thickness={4} color="primary" sx={{ mb: 2 }} />
              </>
            )}

            {transferStatus === 'confirming' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Transfer in Progress
                </Typography>
                <Typography variant="body1" paragraph>
                  Your transfer from {CHAIN_OPTIONS.find(c => c.value === sourceChain)?.label} to{' '}
                  {CHAIN_OPTIONS.find(c => c.value === targetChain)?.label} is being confirmed.
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Confirmations
                    </Typography>
                    <Typography variant="caption" color="text.primary" fontWeight={600}>
                      {transferConfirmations} / {requiredConfirmations}
                    </Typography>
                  </Box>
                  <ConfirmationProgress>
                    <Box sx={{ width: `${Math.min((transferConfirmations / requiredConfirmations) * 100, 100)}%` }} />
                  </ConfirmationProgress>
                </Box>

                <Divider sx={{ my: 2, borderColor: 'divider' }} />

                <Typography variant="body2" color="text.secondary">
                  The visualization will show the progress of your transfer through the cross-chain bridge.
                </Typography>
              </>
            )}

            {transferStatus === 'completed' && (
              <>
                <Box sx={{ color: 'success.main', mb: 2 }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </Box>
                <Typography variant="h6" gutterBottom>
                  Transfer Complete!
                </Typography>
                <Typography variant="body1" paragraph>
                  Your transfer from {CHAIN_OPTIONS.find(c => c.value === sourceChain)?.label} to{' '}
                  {CHAIN_OPTIONS.find(c => c.value === targetChain)?.label} has been completed.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The tokens have been successfully transferred to the destination address.
                </Typography>
              </>
            )}

            {transferStatus === 'error' && (
              <>
                <Box sx={{ color: 'error.main', mb: 2 }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </Box>
                <Typography variant="h6" gutterBottom>
                  Transfer Failed
                </Typography>
                <Typography variant="body1" paragraph>
                  There was an error processing your transfer.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please try again later or contact support if the issue persists.
                </Typography>
              </>
            )}

            <Button variant="contained" color="primary" onClick={handleModalClose} sx={{ mt: 3 }} fullWidth>
              {transferStatus === 'completed' ? 'Done' : transferStatus === 'error' ? 'Close' : 'Close'}
            </Button>
          </Box>
        </TokenActionModal>
      </Box>
    </Paper>
  );
};

export default CrossChainBridgeActions;
