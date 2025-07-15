import React from 'react';

import { useBurningFlowStore } from '../../../../store/burningFlowStore';
import FlowChartComponent from '../../../flow-chart/FlowChartComponent';

import { flowNodes, flowEdges, nodeHandles } from './flowLayout';
import { stepHighlightMap } from './stepMap';
import { multisigBurningSteps } from './steps';

const MultisigBurnUsdaFlowChart: React.FC = () => {
  const storeState = useBurningFlowStore();

  return (
    <FlowChartComponent
      flowNodes={flowNodes}
      flowEdges={flowEdges}
      stepHighlightMap={stepHighlightMap}
      steps={multisigBurningSteps}
      nodeHandles={nodeHandles}
      useStore={storeState}
    />
  );
};

export default MultisigBurnUsdaFlowChart;
