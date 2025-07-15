import { EdgeTypes } from 'reactflow';

import ReleaseEdge from './ReleaseEdge';
import RepayEdge from './RepayEdge';
import UpdateEdge from './UpdateEdge';
import ValueEdge from './ValueEdge';
import WithdrawEdge from './WithdrawEdge';

export const lendingEdgeTypes: EdgeTypes = {
  updateEdge: UpdateEdge,
  valueEdge: ValueEdge,
  repayEdge: RepayEdge,
  withdrawEdge: WithdrawEdge,
  releaseEdge: ReleaseEdge,
};

export { ReleaseEdge, RepayEdge, UpdateEdge, ValueEdge, WithdrawEdge };
