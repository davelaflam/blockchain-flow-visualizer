import { Close } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Divider,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import React, { ReactNode } from 'react';

import { TokenActionType } from './TokenActionButton';

interface TokenActionModalProps {
  open: boolean;
  onClose: () => void;
  actionType: TokenActionType;
  title?: string;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
  showCancel?: boolean;
  cancelText?: string;
  showConfirm?: boolean;
  confirmText?: string;
  onConfirm?: () => void;
  isProcessing?: boolean;
  disableConfirm?: boolean;
}

/**
 * TokenActionModal component
 * @param open
 * @param onClose
 * @param actionType
 * @param title
 * @param children
 * @param maxWidth
 * @param fullWidth
 * @param showCancel
 * @param cancelText
 * @param showConfirm
 * @param confirmText
 * @param onConfirm
 * @param isProcessing
 * @param disableConfirm
 * @constructor
 */
export const TokenActionModal: React.FC<TokenActionModalProps> = ({
  open,
  onClose,
  actionType,
  title,
  children,
  maxWidth = 'sm',
  fullWidth = true,
  showCancel = true,
  cancelText = 'Cancel',
  showConfirm = true,
  confirmText,
  onConfirm,
  isProcessing = false,
  disableConfirm = false,
}) => {
  const getDefaultTitle = () => {
    switch (actionType) {
      case 'deposit':
        return 'Deposit QAR Tokens';
      case 'withdraw':
        return 'Withdraw QAR Tokens';
      case 'mint':
        return 'Mint Tokens';
      default:
        return 'Token Action';
    }
  };

  /**
   * Get default confirm button text based on action type
   */
  const getDefaultConfirmText = () => {
    switch (actionType) {
      case 'deposit':
        return 'Generate Address';
      case 'withdraw':
        return 'Confirm Withdraw';
      case 'mint':
        return 'Confirm Mint';
      default:
        return 'Confirm';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isProcessing ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disableEscapeKeyDown={isProcessing}
      disablePortal
      BackdropProps={{ transitionDuration: 0 }}
      PaperProps={{ elevation: 4 }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <DialogTitle sx={{ p: 0, fontSize: '1.25rem', fontWeight: 600 }}>{title || getDefaultTitle()}</DialogTitle>
        <IconButton onClick={onClose} disabled={isProcessing} sx={{ mr: -1 }}>
          <Close />
        </IconButton>
      </Box>
      <Divider />
      <DialogContent sx={{ py: 3 }}>{children}</DialogContent>
      {(showCancel || showConfirm) && (
        <>
          <Divider />
          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            {showCancel && (
              <Button onClick={onClose} disabled={isProcessing} color="inherit" sx={{ mr: 1 }}>
                {cancelText}
              </Button>
            )}
            {showConfirm && onConfirm && (
              <Button
                onClick={onConfirm}
                variant="contained"
                disabled={isProcessing || disableConfirm}
                sx={{ minWidth: '120px' }}
              >
                {isProcessing ? <CircularProgress size={24} /> : confirmText || getDefaultConfirmText()}
              </Button>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default TokenActionModal;
