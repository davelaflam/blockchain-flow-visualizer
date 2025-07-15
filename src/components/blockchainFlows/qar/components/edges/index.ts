import { EdgeTypes } from 'reactflow';

import ExecuteProposalEdge from './ExecuteProposalEdge';
import ExecutionFailedEdge from './ExecutionFailedEdge';

export const qarTokenEdgeTypes: EdgeTypes = {
  executionFailed: ExecutionFailedEdge,
  executeProposal: ExecuteProposalEdge,
};

export { ExecutionFailedEdge, ExecuteProposalEdge };
