import React, { forwardRef } from 'react';
import { ReactFlowInstance } from 'reactflow';

import { useLendingFlowStore } from '../../../store/lendingFlowStore';
import FlowChartComponent from '../../flow-chart/FlowChartComponent';
import { FlowChartHandle } from '../../flow-chart/types';

import { lendingEdgeTypes } from './components/edges';
import HealthFactorHUD from './components/HealthFactorHUD';
import { lendingNodeTypes } from './components/nodes';
import { flowNodes, flowEdges, nodeHandles } from './flowLayout';
import { stepHighlightMap } from './stepMap';
import { lendingSteps } from './steps';

interface LendingFlowChartProps {
  onInit?: (instance: ReactFlowInstance) => void;
}

const LendingFlowChart = forwardRef<FlowChartHandle, LendingFlowChartProps>(({ onInit }, ref) => {
  const storeState = useLendingFlowStore();
  const { step } = storeState;

  // Default health factor value - in a real app, this would come from the blockchain or API
  const healthFactor = 2.5;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <FlowChartComponent
        ref={ref}
        flowNodes={flowNodes}
        flowEdges={flowEdges}
        stepHighlightMap={stepHighlightMap}
        steps={lendingSteps}
        nodeHandles={nodeHandles}
        useStore={storeState}
        onInit={onInit}
        edgeTypes={lendingEdgeTypes}
        nodeTypes={lendingNodeTypes}
      />

      {/* Health Factor HUD - only shows during steps 6-7 */}
      <HealthFactorHUD healthFactor={healthFactor} step={step} />
    </div>
  );
});

LendingFlowChart.displayName = 'LendingFlowChart';

export default LendingFlowChart;
