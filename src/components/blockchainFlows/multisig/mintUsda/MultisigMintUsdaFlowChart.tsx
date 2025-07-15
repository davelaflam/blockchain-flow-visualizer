import React from 'react';

import { useMintingFlowStore } from '../../../../store/mintingFlowStore';
import FlowChartComponent from '../../../flow-chart/FlowChartComponent';

import { flowNodes, flowEdges, nodeHandles } from './flowLayout';
import { stepHighlightMap } from './stepMap';
import { multisigMintingSteps } from './steps';

const MultisigMintUsdaFlowChart: React.FC = () => {
  const storeState = useMintingFlowStore();

  return (
    <FlowChartComponent
      flowNodes={flowNodes}
      flowEdges={flowEdges}
      stepHighlightMap={stepHighlightMap}
      steps={multisigMintingSteps}
      nodeHandles={nodeHandles}
      useStore={storeState}
    />
  );
};

export default MultisigMintUsdaFlowChart;
