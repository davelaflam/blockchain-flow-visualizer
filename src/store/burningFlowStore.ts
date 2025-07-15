import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface BurningFlowState {
  step: number;
  isPlaying: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
}

export const useBurningFlowStore = create<BurningFlowState>()(
  devtools(
    (set, _get) => ({
      step: 0,
      isPlaying: false,
      setStep: step => set({ step }),
      nextStep: () =>
        set(state => {
          // Match the original FlowControlBar behavior - just increment the step
          // The parent component is responsible for checking isLast
          return { step: state.step + 1 };
        }),
      prevStep: () => set(state => ({ step: Math.max(0, state.step - 1) })),
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      reset: () => set({ step: 0, isPlaying: false }),
    }),
    { name: 'Burning Flow Store' }
  )
);
