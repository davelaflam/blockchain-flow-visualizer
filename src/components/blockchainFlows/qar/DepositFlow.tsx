import { CheckCircle, ContentCopy, Close, QrCode2 } from '@mui/icons-material';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
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
import QRCode from 'qrcode';
import React, { useEffect, useCallback, useState, useRef } from 'react';

import { logDebug, logError } from 'services/logger';
import { useQarTokenStore, ActionStatus } from 'store/qarTokenStore';

interface DepositFlowProps {
  onClose?: () => void;
  onDepositComplete?: (txId: string) => void;
  initialDepositState?: {
    status: ActionStatus;
    address?: string;
    confirmations?: number;
    requiredConfirmations?: number;
  };
  status: ActionStatus;
  address?: string;
  confirmations?: number;
  requiredConfirmations?: number;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2),
  borderRadius: 8,
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

/**
 * DepositFlow component handles the QAR token deposit process.
 * It displays a QR code and address for users to send tokens to,
 * and shows the status of the deposit transaction.
 * @param onClose Optional callback function to close the deposit flow
 * @param onDepositComplete Optional callback function called when deposit is complete
 */
const DepositFlow: React.FC<DepositFlowProps> = ({ onClose, onDepositComplete }) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const qrCodeRef = useRef<HTMLDivElement>(null);

  /**
   * Displays a snackbar notification with the specified message and severity.
   * @param message The message to display in the snackbar
   * @param severity The severity level of the notification ('success' or 'error')
   */
  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  /**
   * Closes the snackbar notification.
   */
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const {
    depositStatus: status,
    depositAddress: address,
    depositConfirmations: confirmations = 0,
    requiredConfirmations = 6,
    depositTxId: txId,
    startDeposit,
    confirmDeposit,
    updateDepositStatus,
    resetDeposit,
  } = useQarTokenStore();

  /**
   * Generates a QR code when the deposit address changes.
   */
  useEffect(() => {
    const generateQrCode = async () => {
      if (address) {
        try {
          const url = await QRCode.toDataURL(address, {
            width: 200,
            margin: 2,
            color: {
              dark: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
              light: '#00000000', // Transparent background
            },
          });
          setQrCodeDataUrl(url);
        } catch (err) {
          logError('Failed to generate QR code', err);
        }
      }
    };

    generateQrCode();
  }, [address, theme.palette.mode]);

  const generateDepositAddress = useCallback(async () => {
    try {
      await startDeposit();
      showSnackbar('Deposit address generated successfully');
    } catch (error) {
      logError('Error generating deposit address', error);
      showSnackbar('Failed to generate deposit address', 'error');
    }
  }, [startDeposit]);

  const handleCopyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      showSnackbar('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logError('Failed to copy address', error);
      showSnackbar('Failed to copy address', 'error');
    }
  };

  /**
   * Effect to handle deposit state changes and simulate deposit confirmation.
   */
  useEffect(() => {
    logDebug('Deposit state changed', {
      status,
      address: address ? `${address.substring(0, 6)}...${address.substring(38)}` : 'none',
      confirmations: `${confirmations}/${requiredConfirmations}`,
      hasTxId: !!txId,
    });

    // Auto-simulate deposit confirmation for testing
    if (status === 'awaiting' && address && !txId) {
      logDebug('Simulating deposit confirmation...');
      const timer = setTimeout(() => {
        const mockTxId = `0x${Math.random().toString(16).substring(2, 66)}`;
        confirmDeposit(mockTxId);
      }, 3000); // Simulate after 3 seconds
      return () => clearTimeout(timer);
    }

    // Auto-close modal when deposit is completed
    if (status === 'completed' && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Close after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [status, address, confirmations, txId, requiredConfirmations, onClose, confirmDeposit]);

  /**
   * Effect to handle deposit address generation on initial load or when status changes.
   */
  useEffect(() => {
    if (status === 'idle') {
      generateDepositAddress();
    } else if (status === 'processing') {
      // If we're in the process of generating, set a timeout to check again
      const timer = setTimeout(() => {
        if (status === 'processing') {
          generateDepositAddress();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, address, confirmations, txId, requiredConfirmations, onClose, generateDepositAddress]);

  /**
   * Effect to call onDepositComplete when deposit is finished.
   */
  useEffect(() => {
    if (status === 'completed' && txId) {
      onDepositComplete?.(txId);
    }
  }, [status, txId, onDepositComplete]);

  const renderContent = () => {
    const confirmationProgress = Math.min((confirmations / requiredConfirmations) * 100, 100);

    switch (status) {
      case 'idle':
        return (
          <Box textAlign="center" py={2}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <QrCode2 sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Generate Deposit Address
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              Generate a unique address to deposit your QAR tokens. This address is only valid for this session.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={() => {
                generateDepositAddress();
              }}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(138, 43, 226, 0.2)',
                },
              }}
            >
              Generate Deposit Address
            </Button>
          </Box>
        );

      case 'processing':
        return (
          <Box textAlign="center" py={4}>
            <CircularProgress size={48} thickness={4} color="primary" />
            <Typography variant="h6" color="text.primary" mt={3} mb={1}>
              Generating Address
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Creating a secure deposit address for you...
            </Typography>
          </Box>
        );

      case 'awaiting':
        return (
          <Box>
            <Box textAlign="center" mb={3}>
              <Box
                sx={{
                  p: 2,
                  display: 'inline-flex',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 2,
                  position: 'relative',
                  '& img': {
                    width: 180,
                    height: 180,
                  },
                }}
                ref={qrCodeRef}
              >
                {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="Deposit Address QR Code" />}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <QrCode2 sx={{ color: 'primary.main', fontSize: 24 }} />
                </Box>
              </Box>
              <Typography variant="h6" gutterBottom>
                Deposit QAR Tokens
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Scan the QR code or copy the address below
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Deposit Address
                </Typography>
                <Chip
                  label="Mainnet"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    fontFamily: 'monospace',
                    p: 2,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {address}
                </Typography>
                <Tooltip
                  title={copied ? 'Copied!' : 'Copy to clipboard'}
                  placement="top"
                  PopperProps={{
                    disablePortal: true,
                    modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
                  }}
                >
                  <IconButton
                    onClick={() => {
                      handleCopyAddress();
                    }}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider sx={{ my: 3, borderColor: 'divider' }} />

            <Box textAlign="center" sx={{ pt: 1 }}>
              <CircularProgress size={24} thickness={4} color="primary" sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Waiting for deposit...
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                This address is only valid for this session
              </Typography>
            </Box>
          </Box>
        );

      case 'confirming':
        return (
          <Box>
            <Box textAlign="center" mb={4}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'success.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  '& svg': {
                    color: 'success.contrastText',
                    fontSize: 40,
                  },
                }}
              >
                <CheckCircle />
              </Box>
              <Typography variant="h6" gutterBottom>
                Deposit Received!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your transaction is being confirmed on the blockchain
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Confirmations
                </Typography>
                <Typography variant="caption" color="text.primary" fontWeight={600}>
                  {confirmations} / {requiredConfirmations}
                </Typography>
              </Box>
              <ConfirmationProgress>
                <Box sx={{ width: `${confirmationProgress}%` }} />
              </ConfirmationProgress>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Transaction ID
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  wordBreak: 'break-all',
                }}
              >
                {txId}
              </Box>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                textAlign: 'center',
                fontSize: '0.75rem',
                lineHeight: 1.5,
                px: 1,
              }}
            >
              Only send QAR to this address. Sending other assets may result in permanent loss.
            </Typography>
          </Box>
        );

      case 'completed':
        return (
          <Box textAlign="center" py={2}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
              <CheckCircle
                sx={{
                  fontSize: 80,
                  color: 'success.main',
                  '& path': {
                    animation: 'scaleIn 0.5s ease-out forwards',
                  },
                  '@keyframes scaleIn': {
                    '0%': { transform: 'scale(0.8)', opacity: 0 },
                    '100%': { transform: 'scale(1)', opacity: 1 },
                  },
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
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
              Deposit Complete!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your QAR tokens have been successfully deposited.
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
              Error Processing Deposit
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
              There was an issue processing your deposit. Please try again.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={() => {
                generateDepositAddress();
              }}
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
            Deposit QAR Tokens
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

export default DepositFlow;
