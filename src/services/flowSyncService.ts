import { create } from 'zustand';

interface FlowSyncState {
  isAILoading: boolean;
  setAILoading: (isLoading: boolean) => void;
  flowType: string | null;
  setFlowType: (flowType: string | null) => void;
}

/**
 * FlowSyncStore is used to manage the state of AI loading and flow type.
 */
export const useFlowSyncStore = create<FlowSyncState>(set => ({
  isAILoading: false,
  setAILoading: (isAILoading: boolean) => set({ isAILoading }),
  flowType: null,
  setFlowType: (flowType: string | null) => set({ flowType }),
}));

// Helper function to wait for AI to load before continuing
export const waitForAIExplanation = async (timeoutMs = 3000): Promise<boolean> => {
  return new Promise(resolve => {
    const startTime = Date.now();

    if (!useFlowSyncStore.getState().isAILoading) {
      return resolve(true);
    }

    const checkInterval = setInterval(() => {
      const { isAILoading } = useFlowSyncStore.getState();

      if (!isAILoading || Date.now() - startTime > timeoutMs) {
        clearInterval(checkInterval);
        resolve(!isAILoading);
      }
    }, 100);
  });
};
