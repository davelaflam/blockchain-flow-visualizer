import React, { useEffect, useRef } from 'react';
import { ReactFlowInstance } from 'reactflow';

import { useLendingFlowStore } from '../../../store/lendingFlowStore';

import { lendingSteps } from './steps';

interface LendingFlowActionsProps {
  flowInstance?: ReactFlowInstance;
  onStepChange?: (step: number) => void;
}

const LendingFlowActions: React.FC<LendingFlowActionsProps> = ({ flowInstance, onStepChange }) => {
  const { step, isPlaying, setStep, nextStep, prevStep, play, pause, reset } = useLendingFlowStore();
  const actionsRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard events if the component is focused or no element is focused
      if (!actionsRef.current?.contains(document.activeElement) && document.activeElement !== document.body) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          if (step < lendingSteps.length - 1) {
            nextStep();
          }
          break;
        case 'ArrowLeft':
          if (step > 0) {
            prevStep();
          }
          break;
        case 'Home':
          setStep(0);
          break;
        case 'End':
          setStep(lendingSteps.length - 1);
          break;
        case 'Escape':
          pause();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [step, nextStep, prevStep, setStep, pause]);

  // Call onStepChange when step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(step);
    }
  }, [step, onStepChange]);

  return (
    <div ref={actionsRef} className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lending/Borrowing Flow</h2>
        <div className="flex space-x-2">
          <button
            onClick={reset}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            aria-label="Reset flow"
          >
            Reset
          </button>
          {isPlaying ? (
            <button
              onClick={pause}
              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
              aria-label="Pause flow"
            >
              Pause
            </button>
          ) : (
            <button
              onClick={play}
              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
              aria-label="Play flow"
            >
              Play
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={prevStep}
          disabled={step === 0}
          className={`px-3 py-1 rounded-md transition-colors ${
            step === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'
          }`}
          aria-label="Previous step"
        >
          Previous
        </button>
        <div className="flex-1 text-center">
          <span className="text-sm text-gray-500">
            Step {step} of {lendingSteps.length - 1}
          </span>
          <h3 className="font-medium">{lendingSteps[step]?.title || 'Introduction'}</h3>
        </div>
        <button
          onClick={nextStep}
          disabled={step === lendingSteps.length - 1}
          className={`px-3 py-1 rounded-md transition-colors ${
            step === lendingSteps.length - 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          aria-label="Next step"
        >
          Next
        </button>
      </div>

      <div className="text-sm text-gray-500 mt-2">
        <p>Keyboard shortcuts: ← Previous | → Next | Home First | End Last | Esc Stop</p>
      </div>

      <div className="bg-white p-4 rounded-md shadow-sm">
        <h4 className="font-medium mb-2">{lendingSteps[step]?.label || 'Introduction'}</h4>
        <p className="text-sm text-gray-700 mb-3">{lendingSteps[step]?.description || ''}</p>

        {lendingSteps[step]?.what && (
          <div className="mb-2">
            <h5 className="text-xs font-semibold text-gray-500 uppercase">What happens</h5>
            <p className="text-sm">{lendingSteps[step].what}</p>
          </div>
        )}

        {lendingSteps[step]?.why && (
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase">Why it matters</h5>
            <p className="text-sm">{lendingSteps[step].why}</p>
          </div>
        )}
      </div>

      {lendingSteps[step]?.codeSnippet && (
        <div className="bg-gray-800 p-4 rounded-md overflow-auto">
          <pre className="text-xs text-gray-100 whitespace-pre-wrap">{lendingSteps[step].codeSnippet}</pre>
        </div>
      )}
    </div>
  );
};

export default LendingFlowActions;
