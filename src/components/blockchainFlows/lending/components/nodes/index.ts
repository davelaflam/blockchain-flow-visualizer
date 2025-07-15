import { NodeTypes } from 'reactflow';

import LendingPoolNode from './LendingPoolNode';
import WalletNode from './WalletNode';

export const lendingNodeTypes: NodeTypes = {
  walletNode: WalletNode,
  lendingPoolNode: LendingPoolNode,
};

export { LendingPoolNode, WalletNode };
