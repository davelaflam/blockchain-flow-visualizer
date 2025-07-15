import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

import CustomNode from '../../../../../components/flow-chart/nodes/CustomNode';
import { CustomNodeProps } from '../../../../../components/flow-chart/types';
import { nodeHandles } from '../../flowLayout';

/**
 * Custom node component for User Wallet with multiple bottom handles
 */
const WalletNode: React.FC<NodeProps> = props => {
  const { id, data, selected } = props;

  // Calculate positions for the 4 bottom handles
  const bottomHandlePositions = [
    { left: '10%' }, // Position for Deposit
    { left: '35%' }, // Position for Repay
    { left: '65%' }, // Position for Borrow
    { left: '90%' }, // Position for Withdraw
  ];

  return (
    <>
      {/* Render the base CustomNode */}
      <CustomNode id={id} data={data} selected={selected} nodeHandles={nodeHandles} />

      {/* Add custom bottom handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-deposit"
        style={{
          left: bottomHandlePositions[0].left,
          bottom: '-5px',
          background: '#60a5fa',
          width: 10,
          height: 10,
          borderRadius: 5,
          zIndex: 2,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-repay"
        style={{
          left: bottomHandlePositions[1].left,
          bottom: '-5px',
          background: '#60a5fa',
          width: 10,
          height: 10,
          borderRadius: 5,
          zIndex: 2,
        }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-borrow"
        style={{
          left: bottomHandlePositions[2].left,
          bottom: '-5px',
          background: '#60a5fa',
          width: 10,
          height: 10,
          borderRadius: 5,
          zIndex: 2,
        }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-withdraw"
        style={{
          left: bottomHandlePositions[3].left,
          bottom: '-5px',
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

export default WalletNode;
