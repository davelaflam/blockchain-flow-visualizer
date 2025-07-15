import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

import CustomNode from '../../../../../components/flow-chart/nodes/CustomNode';
import { CustomNodeProps } from '../../../../../components/flow-chart/types';
import { nodeHandles } from '../../flowLayout';

/**
 * Custom node component for Lending Pool with multiple top handles
 */
const LendingPoolNode: React.FC<NodeProps> = props => {
  const { id, data, selected } = props;

  // Calculate positions for the 4 top handles
  const topHandlePositions = [
    { left: '10%' }, // Position for Deposit
    { left: '35%' }, // Position for Repay
    { left: '65%' }, // Position for Borrow
    { left: '90%' }, // Position for Withdraw
  ];

  return (
    <>
      {/* Render the base CustomNode */}
      <CustomNode id={id} data={data} selected={selected} nodeHandles={nodeHandles} />

      {/* Add custom top handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-deposit"
        style={{
          left: topHandlePositions[0].left,
          top: '-5px',
          background: '#60a5fa',
          width: 10,
          height: 10,
          borderRadius: 5,
          zIndex: 2,
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-repay"
        style={{
          left: topHandlePositions[1].left,
          top: '-5px',
          background: '#60a5fa',
          width: 10,
          height: 10,
          borderRadius: 5,
          zIndex: 2,
        }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-borrow"
        style={{
          left: topHandlePositions[2].left,
          top: '-5px',
          background: '#60a5fa',
          width: 10,
          height: 10,
          borderRadius: 5,
          zIndex: 2,
        }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-withdraw"
        style={{
          left: topHandlePositions[3].left,
          top: '-5px',
          background: '#60a5fa',
          width: 10,
          height: 10,
          borderRadius: 5,
          zIndex: 2,
        }}
      />
    </>
  );
};

export default LendingPoolNode;
