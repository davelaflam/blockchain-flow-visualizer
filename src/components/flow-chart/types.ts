import { Node, Edge, Position, ReactFlowInstance, EdgeTypes, NodeTypes } from 'reactflow';

// Handle positions mapping
type HandlePositionKey = 'top' | 'bottom' | 'left' | 'right';

export const handlePositions = {
  top: Position.Top,
  bottom: Position.Bottom,
  left: Position.Left,
  right: Position.Right,
} satisfies Record<HandlePositionKey, Position>;

// Flow node data interface
export interface FlowNodeData {
  label: string;
  type: string;
  status?: string;
  statusByStep?: Record<number, string>;
  statusTooltips?: Record<string, string>; // Tooltips for each status
  eventType?: string;
  timestamp?: number;
  txHash?: string;
  details?: string;
  tooltip?: string;
  isCurrent?: boolean;
  apiEndpoints?: string[];
  processFlow?: string;
}

// Flow edge data interface
export interface FlowEdgeData {
  label?: string;
  type: string;
  color: string;
  isCurrent?: boolean;
  forceAnimated?: boolean;
  labelOffset?: number; // Vertical offset for the label to prevent overlap
}

// Main component props
export interface FlowChartComponentProps {
  flowNodes: Node<FlowNodeData>[];
  flowEdges: Edge<FlowEdgeData>[];
  stepHighlightMap: {
    nodes: string[];
    edges: string[];
    updateNode?: {
      id: string;
      data: {
        status?: string;
        statusByStep?: Record<number, string>;
      };
    };
  }[];
  steps: {
    title: string;
    description: string;
    what: string;
    why: string;
    codeSnippet?: string;
  }[];
  nodeHandles: Record<string, { [side: string]: boolean }>;
  edgeTypes?: EdgeTypes;
  nodeTypes?: NodeTypes;
  useStore: {
    step: number;
    isPlaying: boolean;
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    play: () => void;
    pause: () => void;
    reset: () => void;
  };
  onInit?: (instance: ReactFlowInstance) => void;
}

// Component handle for ref
export interface FlowChartHandle {
  resetViewport: () => void;
}

// Props for CustomNode component
export interface CustomNodeProps {
  id: string;
  data: FlowNodeData;
  selected?: boolean;
  nodeHandles: Record<string, { [side: string]: boolean }>;
}

// Props for CustomEdge component
export interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  data?: FlowEdgeData;
  isCurrent?: boolean;
  animated?: boolean;
}

// Props for CustomControlButton component
export interface CustomControlButtonProps {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}

// Props for ZoomController component
export interface ZoomControllerProps {
  rfInstance: ReactFlowInstance | null;
  nodes: Node[];
  step: number;
  stepHighlightMap: Array<{ nodes: string[]; edges: string[] }>;
}
