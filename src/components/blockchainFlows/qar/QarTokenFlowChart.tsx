import React from 'react';

import { useQarTokenStore } from '../../../store/qarTokenStore';
import FlowChartComponent from '../../flow-chart/FlowChartComponent';

import { qarTokenEdgeTypes } from './components/edges';
import { flowNodes, flowEdges, nodeHandles } from './flowLayout';
import { stepHighlightMap } from './stepMap';
import { qarTokenSteps } from './steps';

/**
 * QarTokenFlowChart component renders the flow chart for Qar token actions.
 * It uses the FlowChartComponent to display nodes, edges, and steps.
 * @constructor
 */
const QarTokenFlowChart: React.FC = () => {
  const storeState = useQarTokenStore();

  return (
    <FlowChartComponent
      flowNodes={flowNodes}
      flowEdges={flowEdges}
      stepHighlightMap={stepHighlightMap}
      steps={qarTokenSteps}
      nodeHandles={nodeHandles}
      useStore={storeState}
      edgeTypes={qarTokenEdgeTypes}
    />
  );
};

export default QarTokenFlowChart;
