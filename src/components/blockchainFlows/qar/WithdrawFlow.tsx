import { CheckCircle, ContentCopy, Close, QrCode2 } from '@mui/icons-material';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Paper,
  Divider,
  useTheme,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Fade,
  keyframes,
  styled,
  Chip,
} from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';

import { logError } from 'services/logger';
import { useQarTokenStore, ActionStatus } from 'store/qarTokenStore';

interface WithdrawFlowProps {
  onClose?: () => void;
  onWithdrawComplete?: (txId: string) => void;
  status: ActionStatus;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2),
  borderRadius: 8, // theme.shape.borderRadius is not a number, using fixed value
  boxShadow: theme.shadows[4],
  maxWidth: 480,
  margin: '0 auto',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #8A2BE2 0%, #4B0082 100%)',
  },
}));

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

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const PulseBox = styled(Box)({
  animation: `${pulse} 2s infinite ease-in-out`,
});

/**
 * WithdrawFlow component handles the QAR token withdrawal process.
 * It displays a form for users to enter withdrawal amount and address,
 * and shows the status of the withdrawal transaction.
 * @param onClose Optional callback function to close the withdrawal flow
 * @param onWithdrawComplete Optional callback function called when withdrawal is complete
 */
const WithdrawFlow: React.FC<WithdrawFlowProps> = ({ onClose, onWithdrawComplete }) => {
  const theme = useTheme();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [amount, setAmount] = useState('100');
  const [address, setAddress] = useState('0x' + Math.random().toString(16).substring(2, 42));

  /**
   * Displays a snackbar notification with the specified message and severity.
   * @param message The message to display in the snackbar
   * @param severity The severity level of the notification ('success' or 'error')
   */
  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  /**
   * Closes the snackbar notification.
   */
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const {
    withdrawStatus: status,
    withdrawAmount,
    withdrawAddress,
    withdrawConfirmations = 0,
    requiredConfirmations = 6,
    withdrawTxId: txId,
    startWithdrawal,
    confirmWithdrawal,
    updateWithdrawStatus,
    resetWithdrawal,
  } = useQarTokenStore();

  /**
   * Handles the submission of the withdrawal form.
   * Initiates the withdrawal process with the specified amount and address,
   * shows a success notification, and confirms the withdrawal transaction.
   * @param data Object containing the withdrawal amount and destination address
   * @throws {Error} If the withdrawal process fails
   * @returns {Promise<void>} A promise that resolves when the withdrawal is initiated
   */
  const handleSubmit = useCallback(
    async (data: { amount: string; address: string }): Promise<void> => {
      try {
        const txId = await startWithdrawal(Number(data.amount), data.address);
        showSnackbar('Withdrawal request submitted successfully');
        confirmWithdrawal(txId);
      } catch (error) {
        logError('Withdrawal failed', error as Error);
        showSnackbar('Withdrawal failed. Please try again.', 'error');
        throw error;
      }
    },
    [startWithdrawal, showSnackbar, confirmWithdrawal]
  );

  // Auto-start the withdrawal process
  useEffect(() => {
    if (status === 'idle') {
      // Short delay to show the form before auto-submitting
      const timer = setTimeout(() => {
        handleSubmit({ amount, address });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, address, amount, handleSubmit]);

  // Effect to handle completion
  useEffect(() => {
    if (status === 'completed' && onWithdrawComplete && txId) {
      onWithdrawComplete(txId);
    }
  }, [status, onWithdrawComplete, txId]);

  /**
   * Helper function to check if the current withdrawal status matches a specific value.
   * @param checkStatus The status to check against the current status
   * @returns {boolean} True if the current status matches the specified status
   */
  const isStatus = (checkStatus: ActionStatus): boolean => {
    return status === checkStatus;
  };

  /**
   * Renders the appropriate content based on the current withdrawal status.
   * Displays different UI components for each stage of the withdrawal process:
   * idle, processing, confirming, completed, or error.
   * @returns {JSX.Element} The rendered content for the current status
   */
  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Enter the amount of QAR tokens you want to withdraw and the destination address.
            </Typography>
            <Box sx={{ mb: 3 }}>
              <TextField
                margin="dense"
                id="amount"
                label="Amount"
                type="number"
                fullWidth
                variant="outlined"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <Box component="span" sx={{ color: 'text.secondary', ml: 1 }}>
                      QAR
                    </Box>
                  ),
                }}
              />
              <TextField
                margin="dense"
                id="address"
                label="Destination Address"
                type="text"
                fullWidth
                variant="outlined"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => {
                  handleSubmit({ amount, address });
                }}
                sx={{ mt: 2 }}
                startIcon={<QrCode2 />}
              >
                Withdraw to Wallet
              </Button>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', mt: 1 }}
              >
                Auto-submitting in a moment...
              </Typography>
            </Box>
          </Box>
        );

      case 'processing':
        return (
          <Box textAlign="center" py={3}>
            <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Processing Withdrawal
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we process your withdrawal request...
            </Typography>
          </Box>
        );

      case 'awaiting':
        return (
          <Box textAlign="center" py={3}>
            <PulseBox sx={{ mb: 3 }}>
              <CircularProgress size={60} thickness={4} />
            </PulseBox>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Withdrawal Initiated
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your withdrawal request has been initiated. Transaction ID:
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                mb: 2,
              }}
            >
              {txId}
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Waiting for blockchain confirmation...
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => updateWithdrawStatus('confirming')}
              sx={{ mt: 2 }}
            >
              Proceed to Confirmation
            </Button>
          </Box>
        );

      case 'confirming':
        return (
          <Box py={2}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Confirming Withdrawal
            </Typography>
            <Typography variant="body1" paragraph>
              Your withdrawal is being confirmed on the blockchain.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Confirmations</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {withdrawConfirmations} of {requiredConfirmations}
                </Typography>
              </Box>
              <ConfirmationProgress>
                <div style={{ width: `${(withdrawConfirmations / requiredConfirmations) * 100}%` }} />
              </ConfirmationProgress>
            </Box>

            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 2, mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Transaction Details
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Amount:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {withdrawAmount} QAR
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  To Address:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {withdrawAddress}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Transaction ID:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {txId}
                </Typography>
              </Box>
            </Box>
          </Box>
        );

      case 'completed':
        return (
          <Box textAlign="center" py={3}>
            <Box
              sx={{
                position: 'relative',
                width: 60,
                height: 60,
                mx: 'auto',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle color="success" sx={{ fontSize: 60 }} />
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  backgroundColor: 'success.light',
                  opacity: 0.2,
                  transform: 'scale(1.5)',
                  zIndex: -1,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1.2)', opacity: 0.4 },
                    '70%': { transform: 'scale(1.5)', opacity: 0.2 },
                    '100%': { transform: 'scale(1.2)', opacity: 0.4 },
                  },
                }}
              />
            </Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Withdrawal Complete!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your QAR tokens have been successfully withdrawn.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={onClose}
              sx={{
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                mt: 2,
              }}
            >
              Done
            </Button>
          </Box>
        );

      case 'error':
        return (
          <Box textAlign="center" py={4}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'error.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Close sx={{ color: 'error.contrastText', fontSize: 30 }} />
            </Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Error Processing Withdrawal
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
              There was an issue processing your withdrawal. Please try again.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={() => resetWithdrawal()}
              sx={{
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              Try Again
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <StyledPaper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, pt: 0.5 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Withdraw QAR Tokens
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                bgcolor: 'action.hover',
              },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2, borderColor: 'divider' }} />

        {renderContent()}
      </StyledPaper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionProps={{ timeout: 0 }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WithdrawFlow;
