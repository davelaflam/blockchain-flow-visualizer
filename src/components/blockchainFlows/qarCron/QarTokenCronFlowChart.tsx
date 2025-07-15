import React from 'react';

import { useQarTokenCronStore } from '../../../store/qarTokenCronStore';
import FlowChartComponent from '../../flow-chart/FlowChartComponent';

import { flowNodes, flowEdges, nodeHandles } from './flowLayout';
import { stepHighlightMap } from './stepMap';
import { qarTokenCronSteps } from './steps';

const QarTokenCronFlowChart: React.FC = () => {
  const storeState = useQarTokenCronStore();

  return (
    <FlowChartComponent
      flowNodes={flowNodes}
      flowEdges={flowEdges}
      stepHighlightMap={stepHighlightMap}
      steps={qarTokenCronSteps}
      nodeHandles={nodeHandles}
      useStore={storeState}
    />
  );
};

export default QarTokenCronFlowChart;
