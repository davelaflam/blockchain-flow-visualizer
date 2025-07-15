import { SwapVert, Add, Remove } from '@mui/icons-material';
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
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import { logDebug, logInfo, logWarn, logError } from 'services/logger';
import { useDexStore } from 'store/dexStore';
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

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dex-tabpanel-${index}`}
      aria-labelledby={`dex-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const DexActions: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    step,
    setStep,
    isWalletConnected,
    walletAddress,
    tokenA,
    tokenB,
    lpToken,
    swapStatus,
    swapConfirmations,
    requiredConfirmations,
    liquidityStatus,
    connectWallet,
    disconnectWallet,
    initiateSwap,
    confirmSwap,
    resetSwap,
    initiateLiquidityAction,
    confirmLiquidityAction,
    resetLiquidity,
  } = useDexStore();

  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isLiquidityModalOpen, setIsLiquidityModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Swap form state
  const [swapFromToken, setSwapFromToken] = useState(tokenA.symbol);
  const [swapToToken, setSwapToToken] = useState(tokenB.symbol);
  const [swapAmount, setSwapAmount] = useState('1.0');

  // Liquidity form state
  const [liquidityAmountA, setLiquidityAmountA] = useState('1.0');
  const [liquidityAmountB, setLiquidityAmountB] = useState('3000.0');
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(true);
  const [lpTokenAmount, setLpTokenAmount] = useState('1.0');

  // Reset step when component mounts
  useEffect(() => {
    setStep(0);
  }, [setStep]);

  /**
   * Handles wallet connection.
   * Sets the processing state, calls the connectWallet function from the store,
   * and logs the result.
   */
  const handleConnectWallet = async () => {
    try {
      setIsProcessing(true);
      await connectWallet();
      logInfo('Wallet connected');
    } catch (error) {
      logError('Wallet connection failed', error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handles tab change between Swap and Liquidity tabs.
   * @param event The React synthetic event
   * @param newValue The index of the new tab
   */
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  /**
   * Swaps the source and target tokens in the swap form.
   */
  const handleSwapTokens = () => {
    const temp = swapFromToken;
    setSwapFromToken(swapToToken);
    setSwapToToken(temp);
  };

  /**
   * Handles closing the swap modal.
   * Resets the swap state if the swap is not completed.
   */
  const handleSwapModalClose = () => {
    if (swapStatus !== 'completed') {
      resetSwap();
    }
    setIsSwapModalOpen(false);
  };

  /**
   * Handles closing the liquidity modal.
   * Resets the liquidity state if the liquidity action is not completed.
   */
  const handleLiquidityModalClose = () => {
    if (liquidityStatus !== 'completed') {
      resetLiquidity();
    }
    setIsLiquidityModalOpen(false);
  };

  /**
   * Handles token swap submission.
   * Sets the processing state, calls the initiateSwap function from the store,
   * opens the swap modal, and confirms the swap.
   * Logs any errors that occur during the swap process.
   */
  const handleSwap = async () => {
    try {
      setIsProcessing(true);
      const txId = await initiateSwap(swapFromToken, swapToToken, parseFloat(swapAmount));
      logInfo('Swap initiated', { txId, swapFromToken, swapToToken, swapAmount });
      setIsSwapModalOpen(true);
      confirmSwap(txId);
    } catch (error) {
      logError('Swap failed', error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handles liquidity provision or removal.
   * Sets the processing state, calls the initiateLiquidityAction function from the store,
   * opens the liquidity modal, and confirms the liquidity action.
   * Logs any errors that occur during the liquidity process.
   */
  const handleLiquidity = async () => {
    try {
      setIsProcessing(true);
      const amountA = isAddingLiquidity ? parseFloat(liquidityAmountA) : parseFloat(lpTokenAmount);
      const amountB = parseFloat(liquidityAmountB);
      const txId = await initiateLiquidityAction(amountA, amountB, isAddingLiquidity);
      logInfo('Liquidity action initiated', { txId, isAddingLiquidity, amountA, amountB });
      setIsLiquidityModalOpen(true);
      confirmLiquidityAction(txId);
    } catch (error) {
      logError('Liquidity action failed', error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Calculates the estimated output amount for a token swap.
   * Takes into account the token prices and applies a 0.3% fee.
   * @returns {string} The estimated output amount as a formatted string
   */
  const calculateSwapOutput = () => {
    const amount = parseFloat(swapAmount);
    if (isNaN(amount) || amount <= 0) return '0';

    if (swapFromToken === tokenA.symbol && swapToToken === tokenB.symbol) {
      // ETH to USDC
      return (((amount * tokenA.price) / tokenB.price) * 0.997).toFixed(2); // 0.3% fee
    } else {
      // USDC to ETH
      return (((amount * tokenB.price) / tokenA.price) * 0.997).toFixed(6); // 0.3% fee
    }
  };

  /**
   * Calculates the estimated LP tokens to be received when adding liquidity.
   * Uses the constant product formula (sqrt of the product of the two token amounts).
   * @returns {string} The estimated LP token amount as a formatted string
   */
  const calculateLpTokens = () => {
    const amountA = parseFloat(liquidityAmountA);
    const amountB = parseFloat(liquidityAmountB);
    if (isNaN(amountA) || isNaN(amountB) || amountA <= 0 || amountB <= 0) return '0';

    return Math.sqrt(amountA * amountB).toFixed(6);
  };

  /**
   * Calculates the estimated token amounts to be received when removing liquidity.
   * Based on the proportion of LP tokens being burned relative to the total supply.
   * @returns {Object} An object containing the estimated amounts of both tokens
   */
  const calculateRemoveLiquidity = () => {
    const amount = parseFloat(lpTokenAmount);
    if (isNaN(amount) || amount <= 0 || lpToken.balance <= 0) return { amountA: '0', amountB: '0' };

    const ratio = amount / lpToken.balance;
    const amountA = (ratio * tokenA.balance).toFixed(6);
    const amountB = (ratio * tokenB.balance).toFixed(2);

    return { amountA, amountB };
  };

  // Update liquidityAmountB when liquidityAmountA changes to maintain the price ratio
  useEffect(() => {
    if (isAddingLiquidity) {
      const amountA = parseFloat(liquidityAmountA);
      if (!isNaN(amountA) && amountA > 0) {
        setLiquidityAmountB(((amountA * tokenA.price) / tokenB.price).toFixed(2));
      }
    }
  }, [liquidityAmountA, isAddingLiquidity, tokenA.price, tokenB.price]);

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
        {!isWalletConnected ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: '100%',
              maxWidth: '600px',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" align="center" gutterBottom>
              Connect Your Wallet
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Connect your wallet to start trading tokens and providing liquidity.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                void handleConnectWallet();
              }}
              disabled={isProcessing}
              sx={{ minWidth: 200 }}
            >
              {isProcessing ? <CircularProgress size={24} color="inherit" /> : 'Simulate Connect Wallet'}
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: '100%',
              maxWidth: '600px',
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="DEX actions tabs">
                <Tab label="Swap" id="dex-tab-0" aria-controls="dex-tabpanel-0" />
                <Tab label="Liquidity" id="dex-tab-1" aria-controls="dex-tabpanel-1" />
              </Tabs>
            </Box>

            {/* Swap Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  From
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    select
                    label="Token"
                    value={swapFromToken}
                    onChange={e => setSwapFromToken(e.target.value)}
                    sx={{ width: '40%' }}
                  >
                    <MenuItem value={tokenA.symbol}>{tokenA.symbol}</MenuItem>
                    <MenuItem value={tokenB.symbol}>{tokenB.symbol}</MenuItem>
                  </TextField>
                  <TextField
                    label="Amount"
                    type="number"
                    value={swapAmount}
                    onChange={e => setSwapAmount(e.target.value)}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          Balance: {swapFromToken === tokenA.symbol ? tokenA.balance : tokenB.balance}
                        </Typography>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                  <IconButton onClick={handleSwapTokens} color="primary">
                    <SwapVert />
                  </IconButton>
                </Box>

                <Typography variant="subtitle2" color="text.secondary">
                  To (Estimated)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    select
                    label="Token"
                    value={swapToToken}
                    onChange={e => setSwapToToken(e.target.value)}
                    sx={{ width: '40%' }}
                  >
                    <MenuItem value={tokenA.symbol} disabled={swapFromToken === tokenA.symbol}>
                      {tokenA.symbol}
                    </MenuItem>
                    <MenuItem value={tokenB.symbol} disabled={swapFromToken === tokenB.symbol}>
                      {tokenB.symbol}
                    </MenuItem>
                  </TextField>
                  <TextField
                    label="Amount"
                    value={calculateSwapOutput()}
                    disabled
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          Balance: {swapToToken === tokenA.symbol ? tokenA.balance : tokenB.balance}
                        </Typography>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Price: 1 {tokenA.symbol} = {tokenA.price / tokenB.price} {tokenB.symbol}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Fee: 0.3%
                  </Typography>
                </Box>

                <TokenActionButton
                  actionType="custom"
                  customLabel="Swap"
                  onClick={() => {
                    void handleSwap();
                  }}
                  isLoading={isProcessing}
                  fullWidth
                  disabled={
                    parseFloat(swapAmount) <= 0 ||
                    swapFromToken === swapToToken ||
                    (swapFromToken === tokenA.symbol && parseFloat(swapAmount) > tokenA.balance) ||
                    (swapFromToken === tokenB.symbol && parseFloat(swapAmount) > tokenB.balance)
                  }
                />
              </Box>
            </TabPanel>

            {/* Liquidity Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Button
                    variant={isAddingLiquidity ? 'contained' : 'outlined'}
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => setIsAddingLiquidity(true)}
                    sx={{ flex: 1 }}
                  >
                    Add
                  </Button>
                  <Button
                    variant={!isAddingLiquidity ? 'contained' : 'outlined'}
                    color="primary"
                    startIcon={<Remove />}
                    onClick={() => setIsAddingLiquidity(false)}
                    sx={{ flex: 1 }}
                    disabled={lpToken.balance <= 0}
                  >
                    Remove
                  </Button>
                </Box>

                {isAddingLiquidity ? (
                  // Add Liquidity Form
                  <>
                    <Typography variant="subtitle2" color="text.secondary">
                      {tokenA.symbol} Amount
                    </Typography>
                    <TextField
                      label={`${tokenA.symbol} Amount`}
                      type="number"
                      value={liquidityAmountA}
                      onChange={e => setLiquidityAmountA(e.target.value)}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            Balance: {tokenA.balance}
                          </Typography>
                        ),
                      }}
                    />

                    <Typography variant="subtitle2" color="text.secondary">
                      {tokenB.symbol} Amount
                    </Typography>
                    <TextField
                      label={`${tokenB.symbol} Amount`}
                      type="number"
                      value={liquidityAmountB}
                      onChange={e => setLiquidityAmountB(e.target.value)}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            Balance: {tokenB.balance}
                          </Typography>
                        ),
                      }}
                    />

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                      <Typography variant="subtitle2">You will receive:</Typography>
                      <Typography variant="h6" color="primary">
                        {calculateLpTokens()} {lpToken.symbol}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Your share of the pool:{' '}
                        {lpToken.balance > 0
                          ? (
                              (parseFloat(calculateLpTokens()) / (lpToken.balance + parseFloat(calculateLpTokens()))) *
                              100
                            ).toFixed(2)
                          : '100.00'}
                        %
                      </Typography>
                    </Box>
                  </>
                ) : (
                  // Remove Liquidity Form
                  <>
                    <Typography variant="subtitle2" color="text.secondary">
                      LP Tokens to Burn
                    </Typography>
                    <TextField
                      label="LP Token Amount"
                      type="number"
                      value={lpTokenAmount}
                      onChange={e => setLpTokenAmount(e.target.value)}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            Balance: {lpToken.balance}
                          </Typography>
                        ),
                      }}
                    />

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                      <Typography variant="subtitle2">You will receive:</Typography>
                      <Typography variant="body1" color="primary">
                        {calculateRemoveLiquidity().amountA} {tokenA.symbol}
                      </Typography>
                      <Typography variant="body1" color="primary">
                        {calculateRemoveLiquidity().amountB} {tokenB.symbol}
                      </Typography>
                    </Box>
                  </>
                )}

                <TokenActionButton
                  actionType="custom"
                  customLabel={isAddingLiquidity ? 'Add Liquidity' : 'Remove Liquidity'}
                  onClick={() => {
                    void handleLiquidity();
                  }}
                  isLoading={isProcessing}
                  fullWidth
                  disabled={
                    isAddingLiquidity
                      ? parseFloat(liquidityAmountA) <= 0 ||
                        parseFloat(liquidityAmountB) <= 0 ||
                        parseFloat(liquidityAmountA) > tokenA.balance ||
                        parseFloat(liquidityAmountB) > tokenB.balance
                      : parseFloat(lpTokenAmount) <= 0 || parseFloat(lpTokenAmount) > lpToken.balance
                  }
                />
              </Box>
            </TabPanel>
          </Box>
        )}

        {/* Swap Modal */}
        <TokenActionModal open={isSwapModalOpen} onClose={handleSwapModalClose} actionType="custom" showConfirm={false}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            {swapStatus === 'processing' && (
              <>
                <CircularProgress size={48} thickness={4} color="primary" sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Initiating Swap
                </Typography>
                <Typography variant="body1" paragraph>
                  Preparing your swap from {swapFromToken} to {swapToToken}...
                </Typography>
              </>
            )}

            {swapStatus === 'awaiting' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Swap Initiated
                </Typography>
                <Typography variant="body1" paragraph>
                  Your swap from {swapFromToken} to {swapToToken} has been initiated.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Waiting for blockchain confirmation...
                </Typography>
                <CircularProgress size={24} thickness={4} color="primary" sx={{ mb: 2 }} />
              </>
            )}

            {swapStatus === 'confirming' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Swap in Progress
                </Typography>
                <Typography variant="body1" paragraph>
                  Your swap from {swapFromToken} to {swapToToken} is being confirmed.
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Confirmations
                    </Typography>
                    <Typography variant="caption" color="text.primary" fontWeight={600}>
                      {swapConfirmations} / {requiredConfirmations}
                    </Typography>
                  </Box>
                  <ConfirmationProgress>
                    <Box sx={{ width: `${Math.min((swapConfirmations / requiredConfirmations) * 100, 100)}%` }} />
                  </ConfirmationProgress>
                </Box>

                <Divider sx={{ my: 2, borderColor: 'divider' }} />

                <Typography variant="body2" color="text.secondary">
                  The visualization will show the progress of your swap through the DEX.
                </Typography>
              </>
            )}

            {swapStatus === 'completed' && (
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
                  Swap Complete!
                </Typography>
                <Typography variant="body1" paragraph>
                  Your swap from {swapFromToken} to {swapToToken} has been completed.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The tokens have been successfully swapped in your wallet.
                </Typography>
              </>
            )}

            {swapStatus === 'error' && (
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
                  Swap Failed
                </Typography>
                <Typography variant="body1" paragraph>
                  There was an error processing your swap.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please try again later or contact support if the issue persists.
                </Typography>
              </>
            )}

            <Button variant="contained" color="primary" onClick={handleSwapModalClose} sx={{ mt: 3 }} fullWidth>
              {swapStatus === 'completed' ? 'Done' : swapStatus === 'error' ? 'Close' : 'Close'}
            </Button>
          </Box>
        </TokenActionModal>

        {/* Liquidity Modal */}
        <TokenActionModal
          open={isLiquidityModalOpen}
          onClose={handleLiquidityModalClose}
          actionType="custom"
          showConfirm={false}
        >
          <Box sx={{ p: 3, textAlign: 'center' }}>
            {liquidityStatus === 'processing' && (
              <>
                <CircularProgress size={48} thickness={4} color="primary" sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isAddingLiquidity ? 'Adding Liquidity' : 'Removing Liquidity'}
                </Typography>
                <Typography variant="body1" paragraph>
                  {isAddingLiquidity
                    ? `Preparing to add ${liquidityAmountA} ${tokenA.symbol} and ${liquidityAmountB} ${tokenB.symbol} to the pool...`
                    : `Preparing to remove ${lpTokenAmount} LP tokens from the pool...`}
                </Typography>
              </>
            )}

            {liquidityStatus === 'awaiting' && (
              <>
                <Typography variant="h6" gutterBottom>
                  {isAddingLiquidity ? 'Liquidity Addition Initiated' : 'Liquidity Removal Initiated'}
                </Typography>
                <Typography variant="body1" paragraph>
                  {isAddingLiquidity
                    ? `Your liquidity addition of ${liquidityAmountA} ${tokenA.symbol} and ${liquidityAmountB} ${tokenB.symbol} has been initiated.`
                    : `Your liquidity removal of ${lpTokenAmount} LP tokens has been initiated.`}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Waiting for blockchain confirmation...
                </Typography>
                <CircularProgress size={24} thickness={4} color="primary" sx={{ mb: 2 }} />
              </>
            )}

            {liquidityStatus === 'confirming' && (
              <>
                <Typography variant="h6" gutterBottom>
                  {isAddingLiquidity ? 'Adding Liquidity' : 'Removing Liquidity'}
                </Typography>
                <Typography variant="body1" paragraph>
                  {isAddingLiquidity
                    ? `Your liquidity addition is being processed...`
                    : `Your liquidity removal is being processed...`}
                </Typography>
                <CircularProgress size={24} thickness={4} color="primary" sx={{ mb: 2 }} />
              </>
            )}

            {liquidityStatus === 'completed' && (
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
                  {isAddingLiquidity ? 'Liquidity Added!' : 'Liquidity Removed!'}
                </Typography>
                <Typography variant="body1" paragraph>
                  {isAddingLiquidity
                    ? `You have successfully added ${liquidityAmountA} ${tokenA.symbol} and ${liquidityAmountB} ${tokenB.symbol} to the pool.`
                    : `You have successfully removed ${lpTokenAmount} LP tokens from the pool.`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isAddingLiquidity
                    ? `You received ${calculateLpTokens()} LP tokens.`
                    : `You received ${calculateRemoveLiquidity().amountA} ${tokenA.symbol} and ${calculateRemoveLiquidity().amountB} ${tokenB.symbol}.`}
                </Typography>
              </>
            )}

            {liquidityStatus === 'error' && (
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
                  {isAddingLiquidity ? 'Failed to Add Liquidity' : 'Failed to Remove Liquidity'}
                </Typography>
                <Typography variant="body1" paragraph>
                  There was an error processing your request.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please try again later or contact support if the issue persists.
                </Typography>
              </>
            )}

            <Button variant="contained" color="primary" onClick={handleLiquidityModalClose} sx={{ mt: 3 }} fullWidth>
              {liquidityStatus === 'completed' ? 'Done' : liquidityStatus === 'error' ? 'Close' : 'Close'}
            </Button>
          </Box>
        </TokenActionModal>
      </Box>
    </Paper>
  );
};

export default DexActions;
