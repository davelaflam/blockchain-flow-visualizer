import React from 'react';

import { useDexStore } from '../../../store/dexStore';
import FlowChartComponent from '../../flow-chart/FlowChartComponent';

import { flowNodes, flowEdges, nodeHandles } from './flowLayout';
import { stepHighlightMap } from './stepMap';
import { dexSteps } from './steps';

const DexFlowChart: React.FC = () => {
  const storeState = useDexStore();

  return (
    <FlowChartComponent
      flowNodes={flowNodes}
      flowEdges={flowEdges}
      stepHighlightMap={stepHighlightMap}
      steps={dexSteps}
      nodeHandles={nodeHandles}
      useStore={storeState}
    />
  );
};

export default DexFlowChart;
