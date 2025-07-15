import React from 'react';

import { useCrossChainBridgeStore } from '../../../store/crossChainBridgeStore';
import FlowChartComponent from '../../flow-chart/FlowChartComponent';

import { ReleaseTokensEdge } from './components/edges';
import { flowNodes, flowEdges, nodeHandles } from './flowLayout';
import { stepHighlightMap } from './stepMap';
import { crossChainBridgeSteps } from './steps';

const CrossChainBridgeFlowChart: React.FC = () => {
  const storeState = useCrossChainBridgeStore();

  return (
    <FlowChartComponent
      flowNodes={flowNodes}
      flowEdges={flowEdges}
      stepHighlightMap={stepHighlightMap}
      steps={crossChainBridgeSteps}
      nodeHandles={nodeHandles}
      useStore={storeState}
      edgeTypes={{
        releaseTokensEdge: ReleaseTokensEdge,
      }}
    />
  );
};

export default CrossChainBridgeFlowChart;
