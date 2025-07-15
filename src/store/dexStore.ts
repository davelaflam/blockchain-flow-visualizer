import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ActionStatus = 'idle' | 'processing' | 'awaiting' | 'confirming' | 'completed' | 'error';

type SwapStatus = ActionStatus;
type LiquidityStatus = ActionStatus;

interface TokenInfo {
  symbol: string;
  name: string;
  balance: number;
  price: number;
}

interface DexState {
  // Flow state
  step: number;
  isPlaying: boolean;

  // Wallet state
  isWalletConnected: boolean;
  walletAddress: string;

  // Token state
  tokenA: TokenInfo;
  tokenB: TokenInfo;
  lpToken: TokenInfo;

  // Swap state
  swapStatus: SwapStatus;
  swapAmount: number;
  swapFromToken: string;
  swapToToken: string;
  swapTxId: string;
  swapConfirmations: number;
  requiredConfirmations: number;

  // Liquidity state
  liquidityStatus: LiquidityStatus;
  liquidityAmountA: number;
  liquidityAmountB: number;
  liquidityTxId: string;
  isAddingLiquidity: boolean;

  // Pool state
  poolReserveA: number;
  poolReserveB: number;
  poolFees: number;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;

  // Wallet actions
  connectWallet: () => Promise<string>;
  disconnectWallet: () => void;

  // Swap actions
  initiateSwap: (fromToken: string, toToken: string, amount: number) => Promise<string>;
  confirmSwap: (txId: string) => void;
  updateSwapStatus: (status: SwapStatus) => void;
  resetSwap: () => void;

  // Liquidity actions
  initiateLiquidityAction: (amountA: number, amountB: number, isAdding: boolean) => Promise<string>;
  confirmLiquidityAction: (txId: string) => void;
  updateLiquidityStatus: (status: LiquidityStatus) => void;
  resetLiquidity: () => void;
}

export const useDexStore = create<DexState>()(
  devtools(
    (set, get) =>
      ({
        // Initial state
        step: 0,
        isPlaying: false,

        // Wallet state
        isWalletConnected: false,
        walletAddress: '',

        // Token state
        tokenA: {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: 10.0,
          price: 3000.0,
        },
        tokenB: {
          symbol: 'USDC',
          name: 'USD Coin',
          balance: 5000.0,
          price: 1.0,
        },
        lpToken: {
          symbol: 'ETH-USDC LP',
          name: 'Ethereum-USDC LP Token',
          balance: 0.0,
          price: 0.0,
        },

        // Swap state
        swapStatus: 'idle',
        swapAmount: 0,
        swapFromToken: '',
        swapToToken: '',
        swapTxId: '',
        swapConfirmations: 0,
        requiredConfirmations: 6,

        // Liquidity state
        liquidityStatus: 'idle',
        liquidityAmountA: 0,
        liquidityAmountB: 0,
        liquidityTxId: '',
        isAddingLiquidity: true,

        // Pool state
        poolReserveA: 1000.0,
        poolReserveB: 3000000.0,
        poolFees: 0.0,

        // Flow actions
        setStep: step => set({ step }),
        nextStep: () => set(state => ({ step: Math.min(10, state.step + 1) })),
        prevStep: () => set(state => ({ step: Math.max(0, state.step - 1) })),
        play: () => set({ isPlaying: true }),
        pause: () => set({ isPlaying: false }),
        reset: () => set({ step: 0, isPlaying: false }),

        // Wallet actions
        connectWallet: async () => {
          set({ isWalletConnected: false });

          // Simulate wallet connection
          return new Promise<string>(resolve => {
            setTimeout(() => {
              const walletAddress = '0x' + Math.random().toString(16).substring(2, 42);
              set({
                isWalletConnected: true,
                walletAddress,
                step: 1, // Move to step 1 after wallet connection
              });
              resolve(walletAddress);
            }, 1500);
          });
        },

        disconnectWallet: () => {
          set({
            isWalletConnected: false,
            walletAddress: '',
            step: 0,
          });
        },

        // Swap actions
        initiateSwap: async (fromToken, toToken, amount) => {
          set({
            swapStatus: 'processing',
            swapFromToken: fromToken,
            swapToToken: toToken,
            swapAmount: amount,
          });

          // Simulate swap initiation
          return new Promise<string>(resolve => {
            setTimeout(() => {
              const swapTxId = '0x' + Math.random().toString(16).substring(2, 66);
              set({
                swapStatus: 'awaiting',
                swapTxId,
                swapConfirmations: 0,
              });
              resolve(swapTxId);
            }, 1500);
          });
        },

        confirmSwap: txId => {
          set({
            swapStatus: 'confirming',
            swapTxId: txId,
            swapConfirmations: 0,
          });

          // Simulate confirmations
          const interval = setInterval(() => {
            set(state => {
              const newConfirmations = state.swapConfirmations + 1;
              if (newConfirmations >= state.requiredConfirmations) {
                clearInterval(interval);

                // Update token balances based on swap
                const { tokenA, tokenB, swapAmount, swapFromToken, swapToToken } = state;
                const newTokenA = { ...tokenA };
                const newTokenB = { ...tokenB };

                if (swapFromToken === 'ETH') {
                  newTokenA.balance -= swapAmount;
                  newTokenB.balance += swapAmount * (tokenA.price / tokenB.price) * 0.997; // 0.3% fee
                } else {
                  newTokenB.balance -= swapAmount;
                  newTokenA.balance += swapAmount * (tokenB.price / tokenA.price) * 0.997; // 0.3% fee
                }

                // Update pool reserves and fees
                const poolReserveA =
                  state.poolReserveA +
                  (swapFromToken === 'ETH' ? swapAmount : -swapAmount * (tokenB.price / tokenA.price) * 0.997);
                const poolReserveB =
                  state.poolReserveB +
                  (swapFromToken === 'USDC' ? swapAmount : -swapAmount * (tokenA.price / tokenB.price) * 0.997);
                const poolFees = state.poolFees + swapAmount * 0.003; // 0.3% fee

                return {
                  swapStatus: 'completed',
                  swapConfirmations: newConfirmations,
                  tokenA: newTokenA,
                  tokenB: newTokenB,
                  poolReserveA,
                  poolReserveB,
                  poolFees,
                  step: 4, // Move to step 4 after swap is completed
                };
              }
              return { swapConfirmations: newConfirmations };
            });
          }, 1000);
        },

        updateSwapStatus: status => set({ swapStatus: status }),

        resetSwap: () =>
          set({
            swapStatus: 'idle',
            swapAmount: 0,
            swapFromToken: '',
            swapToToken: '',
            swapTxId: '',
            swapConfirmations: 0,
          }),

        // Liquidity actions
        initiateLiquidityAction: async (amountA, amountB, isAdding) => {
          set({
            liquidityStatus: 'processing',
            liquidityAmountA: amountA,
            liquidityAmountB: amountB,
            isAddingLiquidity: isAdding,
          });

          // Simulate liquidity action initiation
          return new Promise<string>(resolve => {
            setTimeout(() => {
              const liquidityTxId = '0x' + Math.random().toString(16).substring(2, 66);
              set({
                liquidityStatus: 'awaiting',
                liquidityTxId,
              });
              resolve(liquidityTxId);
            }, 1500);
          });
        },

        confirmLiquidityAction: txId => {
          set({
            liquidityStatus: 'confirming',
            liquidityTxId: txId,
          });

          // Simulate confirmations
          setTimeout(() => {
            set(state => {
              const { tokenA, tokenB, lpToken, liquidityAmountA, liquidityAmountB, isAddingLiquidity } = state;
              const newTokenA = { ...tokenA };
              const newTokenB = { ...tokenB };
              const newLpToken = { ...lpToken };

              // Update token balances and LP token balance based on liquidity action
              if (isAddingLiquidity) {
                // Adding liquidity
                newTokenA.balance -= liquidityAmountA;
                newTokenB.balance -= liquidityAmountB;

                // Calculate LP tokens received (simplified formula)
                const lpAmount = Math.sqrt(liquidityAmountA * liquidityAmountB);
                newLpToken.balance += lpAmount;

                // Update pool reserves
                const poolReserveA = state.poolReserveA + liquidityAmountA;
                const poolReserveB = state.poolReserveB + liquidityAmountB;

                return {
                  liquidityStatus: 'completed',
                  tokenA: newTokenA,
                  tokenB: newTokenB,
                  lpToken: newLpToken,
                  poolReserveA,
                  poolReserveB,
                  step: 7, // Move to step 7 after adding liquidity
                };
              } else {
                // Removing liquidity
                const lpAmount = liquidityAmountA; // In this case, liquidityAmountA represents LP tokens to burn

                // Calculate tokens received (simplified formula)
                const tokenAAmount = (lpAmount / newLpToken.balance) * state.poolReserveA;
                const tokenBAmount = (lpAmount / newLpToken.balance) * state.poolReserveB;

                newTokenA.balance += tokenAAmount;
                newTokenB.balance += tokenBAmount;
                newLpToken.balance -= lpAmount;

                // Update pool reserves
                const poolReserveA = state.poolReserveA - tokenAAmount;
                const poolReserveB = state.poolReserveB - tokenBAmount;

                return {
                  liquidityStatus: 'completed',
                  tokenA: newTokenA,
                  tokenB: newTokenB,
                  lpToken: newLpToken,
                  poolReserveA,
                  poolReserveB,
                  step: 10, // Move to step 10 after removing liquidity
                };
              }
            });
          }, 3000);
        },

        updateLiquidityStatus: status => set({ liquidityStatus: status }),

        resetLiquidity: () =>
          set({
            liquidityStatus: 'idle',
            liquidityAmountA: 0,
            liquidityAmountB: 0,
            liquidityTxId: '',
            isAddingLiquidity: true,
          }),
      }) satisfies DexState,
    { name: 'DEX Flow Store' }
  )
);
