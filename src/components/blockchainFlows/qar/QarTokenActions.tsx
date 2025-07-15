import { Box, Paper, useTheme, useMediaQuery } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';

import { logDebug, logInfo, logWarn, logError } from 'services/logger';
import { useQarTokenStore } from 'store/qarTokenStore';
import { uiColors } from 'theme/colors';

import { TokenActionButton } from '../../common/TokenActionButton';
import { TokenActionModal } from '../../common/TokenActionModal';

import DepositFlow from './DepositFlow';
import WithdrawFlow from './WithdrawFlow';

/**
 * QarTokenActions component handles the deposit and withdrawal actions for Qar tokens.
 * @constructor
 */
const QarTokenActions: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { step, startDeposit, depositStatus, withdrawStatus, setStep, resetDeposit, resetWithdrawal } =
    useQarTokenStore();

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setStep(0);
  }, [setStep]);

  useEffect(() => {
    if (depositStatus === 'completed') {
      setStep(1);
      resetDeposit();
    }
  }, [depositStatus, resetDeposit, setStep]);

  /**
   * Handles closing the deposit modal.
   * Resets the deposit state if the deposit is not completed.
   */
  const handleModalClose = () => {
    if (depositStatus !== 'completed') {
      resetDeposit();
    }
    setIsDepositModalOpen(false);
  };

  /**
   * Handles closing the withdraw modal.
   * Resets the withdrawal state if the withdrawal is not completed.
   * If withdrawal is completed, advances to step 5 in the flow.
   */
  const handleWithdrawModalClose = () => {
    if (withdrawStatus !== 'completed') {
      resetWithdrawal();
    } else {
      // Move to step 5 after withdrawal is completed and modal is closed
      setStep(5);
    }
    setIsWithdrawModalOpen(false);
  };

  /**
   * Initiates the deposit process for QAR tokens.
   * Sets the processing state, calls the startDeposit function from the store,
   * logs the generated deposit address, and opens the deposit modal.
   * The deposit modal opening will trigger an effect that advances to step 1.
   * @throws {Error} If there's an error during the deposit process
   */
  const handleDeposit = async () => {
    try {
      setIsProcessing(true);
      // Don't reset deposit here as it will be handled by the modal open effect
      const address = await startDeposit();
      logInfo('Deposit address generated', { address });
      // Setting isDepositModalOpen will trigger the effect that sets step to 1
      setIsDepositModalOpen(true);
    } catch (error) {
      logError('Deposit failed', error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handles the completion of the withdrawal process.
   * Closes the withdrawal modal after a 2-second delay to allow
   * the user to see the completion message.
   * The step in the flow will be updated in handleWithdrawModalClose.
   */
  const handleWithdrawComplete = () => {
    setTimeout(() => {
      setIsWithdrawModalOpen(false);
      // Step will be updated in handleWithdrawModalClose
    }, 2000);
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
        '& .react-flow__pane': {
          borderRadius: '12px',
        },
        '& .react-flow__renderer': {
          borderRadius: '12px',
        },
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
            gap: 2,
            flexDirection: isMobile ? 'column' : 'row',
            width: '100%',
            maxWidth: '600px',
            justifyContent: 'center',
          }}
        >
          <TokenActionButton
            actionType="deposit"
            onClick={() => {
              handleDeposit();
            }}
            isLoading={isProcessing && depositStatus === 'processing'}
            fullWidth
          />
          <TokenActionButton
            actionType="withdraw"
            variant="outlined"
            onClick={() => {
              setIsWithdrawModalOpen(true);
              if (step === 0) {
                setStep(4);
              }
            }}
            disabled={step > 0 && step < 4}
            isLoading={isProcessing && withdrawStatus === 'processing'}
            fullWidth
          />
        </Box>

        <TokenActionModal open={isDepositModalOpen} onClose={handleModalClose} actionType="deposit" showConfirm={false}>
          <DepositFlow status={depositStatus} onClose={handleModalClose} onDepositComplete={handleModalClose} />
        </TokenActionModal>

        <TokenActionModal
          open={isWithdrawModalOpen}
          onClose={handleWithdrawModalClose}
          actionType="withdraw"
          showConfirm={false}
        >
          <WithdrawFlow
            status={withdrawStatus}
            onClose={handleWithdrawModalClose}
            onWithdrawComplete={handleWithdrawComplete}
          />
        </TokenActionModal>
      </Box>
    </Paper>
  );
};

export default QarTokenActions;
