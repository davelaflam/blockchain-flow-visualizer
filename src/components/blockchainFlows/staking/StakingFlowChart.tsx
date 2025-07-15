import React from 'react';

import { useStakingFlowStore } from '../../../store/stakingFlowStore';
import FlowChartComponent from '../../flow-chart/FlowChartComponent';

import { stakingEdgeTypes } from './components/edges';
import { flowNodes, flowEdges, nodeHandles } from './flowLayout';
import { stepHighlightMap } from './stepMap';
import { stakingSteps } from './steps';

const StakingFlowChart: React.FC = () => {
  const storeState = useStakingFlowStore();

  return (
    <FlowChartComponent
      flowNodes={flowNodes}
      flowEdges={flowEdges}
      stepHighlightMap={stepHighlightMap}
      steps={stakingSteps}
      nodeHandles={nodeHandles}
      useStore={storeState}
      edgeTypes={stakingEdgeTypes}
    />
  );
};

export default StakingFlowChart;
