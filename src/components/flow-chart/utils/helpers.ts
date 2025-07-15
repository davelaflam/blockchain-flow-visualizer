import { Node, Edge } from 'reactflow';

import { journeyColors } from '../../../theme/colors';
import { FlowNodeData, FlowEdgeData } from '../types';

/**
 * Get color for a given edge based on its type
 * @param edge
 * @param idx
 * @return {string} Color corresponding to the edge type, or gray if type is not recognized
 */
export const getEdgeColor = (edge: Edge<FlowEdgeData> | { type?: string }, idx: number): string => {
  // Check if edge is a ReactFlow Edge with data property
  const edgeType = 'data' in edge && edge.data?.type ? edge.data.type : edge.type;
  return edgeType && edgeType in journeyColors
    ? journeyColors[edgeType as keyof typeof journeyColors]
    : journeyColors.gray;
};

/**
 * Get icon and color based on event type
 * @param type
 * @return {{icon: string, color: string} | null} Object containing icon and color for the event type, or null if type is not recognized
 */
export const getEventTypeIcon = (type?: string): { icon: string; color: string } | null => {
  if (!type) return null;

  const iconMap: Record<string, { icon: string; color: string }> = {
    contract: { icon: '⚛️', color: journeyColors.event },
    ao: { icon: '🔄', color: journeyColors.voting },
    relayer: { icon: '⚡', color: journeyColors.proposal },
  };

  return iconMap[type] || null;
};

/**
 * Get event type description
 * @param type
 * @return {string} Description of the event type
 */
export const getEventTypeDescription = (type: string): string => {
  const descriptions: Record<string, string> = {
    contract:
      'Smart contract interaction on the quantum bridge. These contracts handle token locking, unlocking, and cross-chain verification.',
    ao: 'Autonomous Object operation in the AO network. AO processes handle the decentralized logic for token minting, burning, and multisig operations.',
    relayer:
      'Cross-chain message relaying between networks. Relayers ensure secure communication between Ethereum and Arweave by validating and forwarding transaction data.',
  };
  return descriptions[type] || 'Event';
};

/**
 * Format transaction status to a human-readable string
 * @param status
 * @return {string} Formatted status string
 */
export const formatStatus = (status?: string): string => {
  if (!status) return '';
  return status
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Get a human-readable description for a transaction status
 * @param status
 * @param statusTooltips
 */
export const getStatusDescription = (status: string, statusTooltips?: Record<string, string>): string => {
  // First check for custom status tooltips
  if (statusTooltips && statusTooltips[status]) {
    return statusTooltips[status];
  }

  /**
   * Descriptive status messages for each transaction state
   * @returns {string} Description of the transaction status
   */
  const descriptions: Record<string, string> = {
    NEW: 'The transaction has been created but not yet processed',
    SENT_TO_AO: 'Transaction has been sent to the Autonomous Object network',
    PROPOSAL_PREPARED: 'AO USDA EventHandler has prepared a proposal for the multisig group',
    PROPOSAL_RECEIVED: 'Multisig group has received the proposal and is ready for voting',
    VOTING_IN_PROGRESS: 'Voting is in progress. Waiting for required number of approvals',
    TALLYING_VOTES: 'Votes are being tallied to determine if quorum is reached',
    MINT_APPROVED: 'Proposal has received enough votes and is approved for minting',
    MINTING: 'USDA tokens are being minted according to the approved proposal',
    BURN_PROPOSAL_PREPARED: 'AO Handler has prepared a burn proposal for the multisig committee',
    BURN_PROPOSAL_RECEIVED: 'Multisig committee has received the burn proposal and is ready for voting',
    BURN_APPROVED: 'Burn proposal has been approved by the multisig committee',
    BURNING: 'USDA tokens are being burned according to the approved proposal',
    COMPLETE: 'Transaction has been fully processed and completed',
  };

  return descriptions[status] || 'Transaction is in progress';
};

/**
 * Converts a hex color string to an RGB string
 * @param hex
 * @return {string} RGB string in the format "r, g, b"
 */
export const hexToRgb = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

/**
 * Compares nodes deeply to prevent unnecessary updates
 * @param a
 * @param b
 * @return {boolean} true if nodes are equal, false otherwise
 */
export const nodesEqual = (a: Node<FlowNodeData>[], b: Node<FlowNodeData>[]): boolean => {
  if (!a || !b || a.length !== b.length) return false;
  return a.every((node, i) => {
    const otherNode = b[i];
    return node.id === otherNode?.id && JSON.stringify(node.data) === JSON.stringify(otherNode?.data);
  });
};

/**
 * Compares edges deeply to prevent unnecessary updates
 * @param a
 * @param b
 * @return {boolean} true if edges are equal, false otherwise
 */
export const edgesEqual = (a: Edge<FlowEdgeData>[], b: Edge<FlowEdgeData>[]): boolean => {
  if (!a || !b || a.length !== b.length) return false;
  return a.every((edge, i) => {
    const otherEdge = b[i];
    return edge.id === otherEdge?.id && JSON.stringify(edge.data) === JSON.stringify(otherEdge?.data);
  });
};
