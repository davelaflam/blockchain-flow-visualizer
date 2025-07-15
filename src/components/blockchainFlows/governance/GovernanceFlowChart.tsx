import React from 'react';

import { useGovernanceStore } from '../../../store/governanceStore';
import FlowChartComponent from '../../flow-chart/FlowChartComponent';

import { flowNodes, flowEdges, nodeHandles } from './flowLayout';
import { stepHighlightMap } from './stepMap';
import { governanceSteps } from './steps';

const GovernanceFlowChart: React.FC = () => {
  const storeState = useGovernanceStore();

  return (
    <FlowChartComponent
      flowNodes={flowNodes}
      flowEdges={flowEdges}
      stepHighlightMap={stepHighlightMap}
      steps={governanceSteps}
      nodeHandles={nodeHandles}
      useStore={storeState}
    />
  );
};

export default GovernanceFlowChart;
