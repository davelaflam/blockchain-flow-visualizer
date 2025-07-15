import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ActionStatus = 'idle' | 'processing' | 'awaiting' | 'confirming' | 'completed' | 'error';

type TransferStatus = ActionStatus;

interface CrossChainBridgeState {
  // Flow state
  step: number;
  isPlaying: boolean;

  // Transfer state
  transferStatus: TransferStatus;
  sourceChain: string;
  targetChain: string;
  transferAmount: number;
  recipientAddress: string;
  transferTxId: string;
  transferConfirmations: number;
  requiredConfirmations: number;
  relayerStatus: 'idle' | 'processing' | 'completed' | 'error';
  targetChainStatus: 'idle' | 'processing' | 'completed' | 'error';

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;

  // Transfer actions
  initiateTransfer: (sourceChain: string, targetChain: string, amount: number, recipient: string) => Promise<string>;
  confirmTransfer: (txId: string) => void;
  updateTransferStatus: (status: TransferStatus) => void;
  resetTransfer: () => void;
  updateRelayerStatus: (status: 'idle' | 'processing' | 'completed' | 'error') => void;
  updateTargetChainStatus: (status: 'idle' | 'processing' | 'completed' | 'error') => void;
}

export const useCrossChainBridgeStore = create<CrossChainBridgeState>()(
  devtools(
    (set, _get) =>
      ({
        // Initial state
        step: 0,
        isPlaying: false,

        // Transfer state
        transferStatus: 'idle',
        sourceChain: '',
        targetChain: '',
        transferAmount: 0,
        recipientAddress: '',
        transferTxId: '',
        transferConfirmations: 0,
        requiredConfirmations: 6,
        relayerStatus: 'idle',
        targetChainStatus: 'idle',

        // Flow actions
        setStep: step => set({ step }),
        nextStep: () => set(state => ({ step: Math.min(15, state.step + 1) })),
        prevStep: () => set(state => ({ step: Math.max(0, state.step - 1) })),
        play: () => set({ isPlaying: true }),
        pause: () => set({ isPlaying: false }),
        reset: () => set({ step: 0, isPlaying: false }),

        // Transfer actions
        initiateTransfer: (sourceChain, targetChain, amount, recipient) => {
          set({
            transferStatus: 'processing',
            sourceChain,
            targetChain,
            transferAmount: amount,
            recipientAddress: recipient,
          });

          // Simulate transfer initiation
          return new Promise<string>(resolve => {
            setTimeout(() => {
              const transferTxId = '0x' + Math.random().toString(16).substring(2, 66);
              set({
                transferStatus: 'awaiting',
                transferTxId,
                transferConfirmations: 0,
              });
              resolve(transferTxId);
            }, 1500);
          });
        },

        confirmTransfer: txId => {
          set({
            transferStatus: 'confirming',
            transferTxId: txId,
            transferConfirmations: 0,
          });

          // Simulate confirmations
          const interval = setInterval(() => {
            set(state => {
              const newConfirmations = state.transferConfirmations + 1;
              if (newConfirmations >= state.requiredConfirmations) {
                clearInterval(interval);
                return {
                  transferStatus: 'completed',
                  transferConfirmations: newConfirmations,
                };
              }
              return { transferConfirmations: newConfirmations };
            });
          }, 1000);
        },

        updateTransferStatus: status => set({ transferStatus: status }),

        resetTransfer: () =>
          set({
            transferStatus: 'idle',
            sourceChain: '',
            targetChain: '',
            transferAmount: 0,
            recipientAddress: '',
            transferTxId: '',
            transferConfirmations: 0,
            relayerStatus: 'idle',
            targetChainStatus: 'idle',
          }),

        updateRelayerStatus: status => set({ relayerStatus: status }),

        updateTargetChainStatus: status => set({ targetChainStatus: status }),
      }) satisfies CrossChainBridgeState,
    { name: 'Cross-Chain Bridge Flow Store' }
  )
);
