import { EdgeTypes } from 'reactflow';

import ReturnEdge from './ReturnEdge';
import StakeEdge from './StakeEdge';

export const stakingEdgeTypes: EdgeTypes = {
  returnEdge: ReturnEdge,
  stakeEdge: StakeEdge,
};

export { ReturnEdge, StakeEdge };
