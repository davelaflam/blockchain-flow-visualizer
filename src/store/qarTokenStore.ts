import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ActionStatus = 'idle' | 'processing' | 'awaiting' | 'confirming' | 'completed' | 'error';

type DepositStatus = ActionStatus;
type WithdrawStatus = ActionStatus;

interface QarTokenState {
  // Flow state
  step: number;
  isPlaying: boolean;

  // Deposit state
  depositStatus: DepositStatus;
  depositAddress: string;
  depositConfirmations: number;
  requiredConfirmations: number;
  depositTxId: string;

  // Withdrawal state
  withdrawStatus: WithdrawStatus;
  withdrawAmount: number;
  withdrawAddress: string;
  withdrawTxId: string;
  withdrawConfirmations: number;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;

  // Deposit actions
  startDeposit: () => Promise<string>;
  confirmDeposit: (txId: string) => void;
  updateDepositStatus: (status: DepositStatus) => void;
  resetDeposit: () => void;

  // Withdrawal actions
  startWithdrawal: (amount: number, address: string) => Promise<string>;
  confirmWithdrawal: (txId: string) => void;
  updateWithdrawStatus: (status: WithdrawStatus) => void;
  resetWithdrawal: () => void;
}

export const useQarTokenStore = create<QarTokenState>()(
  devtools(
    (set, _get) =>
      ({
        // Initial state
        step: 0,
        isPlaying: false,

        // Deposit state
        depositStatus: 'idle',
        depositAddress: '',
        depositConfirmations: 0,
        requiredConfirmations: 6,
        depositTxId: '',

        // Withdrawal state
        withdrawStatus: 'idle',
        withdrawAmount: 0,
        withdrawAddress: '',
        withdrawTxId: '',
        withdrawConfirmations: 0,

        // Flow actions
        setStep: step => set({ step }),
        nextStep: () => set(state => ({ step: Math.min(11, state.step + 1) })),
        prevStep: () => set(state => ({ step: Math.max(0, state.step - 1) })),
        play: () => set({ isPlaying: true }),
        pause: () => set({ isPlaying: false }),
        reset: () => set({ step: 0, isPlaying: false }),

        // Deposit actions
        startDeposit: () => {
          set({ depositStatus: 'processing' });
          // Simulate address generation
          return new Promise<string>(resolve => {
            setTimeout(() => {
              const depositAddress = 'QAR_' + Math.random().toString(36).substring(2, 15);
              set({
                depositStatus: 'awaiting',
                depositAddress,
                depositConfirmations: 0,
                depositTxId: '',
              });
              resolve(depositAddress);
            }, 1000);
          });
        },

        confirmDeposit: txId => {
          set({
            depositStatus: 'confirming',
            depositTxId: txId,
            depositConfirmations: 0,
          });

          // Simulate confirmations
          const interval = setInterval(() => {
            set(state => {
              const newConfirmations = state.depositConfirmations + 1;
              if (newConfirmations >= state.requiredConfirmations) {
                clearInterval(interval);
                // Just update the status, let the component handle step progression
                return {
                  depositStatus: 'completed',
                  depositConfirmations: newConfirmations,
                };
              }
              return { depositConfirmations: newConfirmations };
            });
          }, 1000);
        },

        updateDepositStatus: status => set({ depositStatus: status }),

        resetDeposit: () =>
          set({
            depositStatus: 'idle',
            depositAddress: '',
            depositConfirmations: 0,
            depositTxId: '',
          }),

        // Withdrawal actions
        startWithdrawal: (amount, address) => {
          set({
            withdrawStatus: 'processing',
            withdrawAmount: amount,
            withdrawAddress: address,
            withdrawConfirmations: 0,
          });

          // Simulate withdrawal processing
          return new Promise<string>(resolve => {
            setTimeout(() => {
              const txId = '0x' + Math.random().toString(16).substring(2, 66);
              set({
                withdrawStatus: 'awaiting',
                withdrawTxId: txId,
                // Don't update step here, let component handle it
              });

              resolve(txId);
            }, 1500);
          });
        },

        confirmWithdrawal: txId => {
          set({
            withdrawStatus: 'confirming',
            withdrawTxId: txId,
            withdrawConfirmations: 0,
            // Don't update step here, let component handle it
          });

          // Simulate confirmations similar to deposit flow
          const interval = setInterval(() => {
            set(state => {
              const newConfirmations = state.withdrawConfirmations + 1;
              if (newConfirmations >= state.requiredConfirmations) {
                clearInterval(interval);
                // Just complete the withdrawal, don't update step
                return {
                  withdrawStatus: 'completed',
                  withdrawConfirmations: newConfirmations,
                };
              }
              return { withdrawConfirmations: newConfirmations };
            });
          }, 1000);
        },

        updateWithdrawStatus: status => set({ withdrawStatus: status }),

        resetWithdrawal: () =>
          set({
            withdrawStatus: 'idle',
            withdrawAmount: 0,
            withdrawAddress: '',
            withdrawTxId: '',
            withdrawConfirmations: 0,
          }),
      }) satisfies QarTokenState,
    { name: 'QAR Token Flow Store' }
  )
);
