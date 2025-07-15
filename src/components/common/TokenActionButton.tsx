import { Button, ButtonProps, CircularProgress } from '@mui/material';
import React from 'react';

export type TokenActionType = 'deposit' | 'withdraw' | 'mint' | 'custom';

interface TokenActionButtonProps extends ButtonProps {
  actionType: TokenActionType;
  isLoading?: boolean;
  customLabel?: string;
}

/**
 * TokenActionButton component renders a button for various token actions.
 * @param actionType
 * @param isLoading
 * @param customLabel
 * @param props
 * @constructor
 */
export const TokenActionButton: React.FC<TokenActionButtonProps> = ({
  actionType,
  isLoading = false,
  customLabel,
  ...props
}) => {
  const getButtonText = () => {
    if (customLabel) return customLabel;
    switch (actionType) {
      case 'deposit':
        return 'Simulate Deposit QAR';
      case 'withdraw':
        return 'Simulate Withdraw QAR';
      case 'mint':
        return 'Simulate Mint Tokens';
      default:
        return 'Simulate Cross-Chain Transfer';
    }
  };

  return (
    <Button
      variant="contained"
      disabled={isLoading}
      sx={{
        minWidth: '160px',
        py: 1.5,
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 600,
        ...(props.sx || {}),
      }}
      {...props}
    >
      {isLoading ? <CircularProgress size={24} /> : getButtonText()}
    </Button>
  );
};

export default TokenActionButton;
