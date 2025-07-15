import { ZoomIn, ZoomOut, ZoomOutMap } from '@mui/icons-material';
import { Box, Paper } from '@mui/material';
import React, { useState, useEffect, useMemo, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import '../../assets/styles/edgeAnimations.css';
import ReactFlow, {
  Background,
  NodeTypes,
  EdgeTypes,
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  ReactFlowInstance,
} from 'reactflow';

import 'reactflow/dist/style.css';
import { logDebug, logInfo } from '../../services/logger';
import { uiColors } from '../../theme/colors';

import CustomControlButton from './controls/CustomControlButton';
import { ZoomController } from './controls/ZoomController';
import CustomEdge from './edges/CustomEdge';
import CustomNode from './nodes/CustomNode';
import { FlowChartComponentProps, FlowChartHandle, FlowNodeData, FlowEdgeData } from './types';
import { nodesEqual, edgesEqual, getEdgeColor } from './utils/helpers';

// Define edge component renderers outside of the component to prevent recreation
const EventEdge = (props: any) => <CustomEdge {...props} isCurrent={props.data?.isCurrent} />;
const ProposalEdge = (props: any) => <CustomEdge {...props} isCurrent={props.data?.isCurrent} />;
const VotingEdge = (props: any) => <CustomEdge {...props} isCurrent={props.data?.isCurrent} />;

// Define node component renderers outside of the component to prevent recreation
const createNodeRenderer = (nodeHandles: any) => (props: any) => (
  <CustomNode {...props} id={props.id} nodeHandles={nodeHandles} />
);

// Helper function to detect if device is iPad or tablet
const isTabletDevice = () => {
  // Check for iPad specifically in the user agent
  const isIPad = navigator.userAgent.match(/iPad/i) !== null;

  // Check for iPad in modern iPadOS that reports as desktop
  const isIPadOS =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 && !navigator.userAgent.match(/iPhone/i);

  // General tablet detection (imperfect but helpful)
  const isTablet = /Tablet|iPad/i.test(navigator.userAgent) || (window.innerWidth >= 768 && window.innerWidth <= 1366);

  return isIPad || isIPadOS || isTablet;
};

/**
 * FlowChartComponent is a React component that renders a flow chart using React Flow.
 * It supports dynamic updates, zoom controls, and step-based highlighting.
 */
const FlowChartComponent = forwardRef<FlowChartHandle, FlowChartComponentProps>((props, ref) => {
  const { flowNodes, flowEdges, steps, nodeHandles, stepHighlightMap, useStore, edgeTypes = {}, onInit } = props;

  // Use a ref to store the previous step to detect changes
  const prevStepRef = useRef(0);

  // Extract only what we need from the store
  const { step, nextStep, prevStep, play, pause, reset, isPlaying, setStep } = useStore;

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Function to reset viewport to fit all nodes like on initial load
  const resetViewport = useCallback(() => {
    if (!rfInstanceRef.current) return;

    logInfo('[DEBUG] Resetting viewport...');

    // Detect if on tablet/iPad for appropriate settings
    const isTablet = isTabletDevice();
    logInfo('[DEBUG] Device is tablet?', isTablet);

    // First reset to default position and a slightly zoomed out view
    // to ensure we can see everything before fitting
    // Use a higher base zoom for tablets
    rfInstanceRef.current.setViewport({ x: 0, y: 0, zoom: isTablet ? 0.8 : 0.7 }, { duration: 300 });

    // Then fit view with padding after a short delay
    setTimeout(() => {
      if (rfInstanceRef.current) {
        // Use the same fitView settings as the initial load
        // but with tablet-specific adjustments
        rfInstanceRef.current.fitView({
          padding: isTablet ? 0.2 : 0.3, // Less padding on tablets
          duration: 800,
          includeHiddenNodes: true,
          minZoom: isTablet ? 0.7 : 0.6, // Higher minimum zoom for tablets
          maxZoom: isTablet ? 1.5 : 1.1, // Higher maximum zoom for tablets
        });
      }
    }, 350);
  }, [rfInstanceRef]);

  // Expose the resetViewport function to parent
  useImperativeHandle(
    ref,
    () => ({
      resetViewport,
    }),
    [resetViewport]
  );

  // Functions for zoom controls
  const zoomIn = useCallback(() => {
    if (rfInstanceRef.current) {
      const viewport = rfInstanceRef.current.getViewport();
      rfInstanceRef.current.setViewport({ ...viewport, zoom: viewport.zoom * 1.2 }, { duration: 200 });
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (rfInstanceRef.current) {
      const viewport = rfInstanceRef.current.getViewport();
      rfInstanceRef.current.setViewport({ ...viewport, zoom: viewport.zoom * 0.8 }, { duration: 200 });
    }
  }, []);

  // Keep the ref in sync with state
  useEffect(() => {
    rfInstanceRef.current = rfInstance;
  }, [rfInstance]);

  // Reset viewport when step changes to 0 (reset)
  useEffect(() => {
    if (step === 0) {
      logDebug('Step reset to 0, resetting viewport');
      resetViewport();
    }
  }, [step, resetViewport]);

  // Create a stable reference to the store methods
  const storeMethods = useMemo(
    () => ({
      step,
      nextStep,
      prevStep,
      play,
      pause,
      reset,
      isPlaying,
    }),
    [step, isPlaying, nextStep, prevStep, play, pause, reset]
  );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // Only update if there are actual changes
    if (!changes || changes.length === 0) return;

    setNodes(nds => {
      // Apply changes only if they would actually modify the nodes
      const newNodes = applyNodeChanges(changes, nds);

      // Check if any node actually changed
      const hasChanges = changes.some(change => {
        if (change.type === 'position' && change.dragging) {
          const node = nds.find(n => n.id === change.id);
          const newNode = newNodes.find(n => n.id === change.id);
          return node && newNode && (node.position.x !== newNode.position.x || node.position.y !== newNode.position.y);
        }
        return true; // For other change types, assume they're important
      });

      return hasChanges ? newNodes : nds;
    });
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    // Only update if there are actual changes
    if (!changes || changes.length === 0) return;

    setEdges(eds => {
      // Apply changes only if they would actually modify the edges
      const newEdges = applyEdgeChanges(changes, eds);

      // Check if any edge actually changed
      const hasChanges = changes.some((change: EdgeChange) => {
        if (change.type === 'select') {
          const edge = eds.find((e: Edge) => e.id === change.id);
          const newEdge = newEdges.find((e: Edge) => e.id === change.id);
          return edge && newEdge && edge.selected !== newEdge.selected;
        }
        return true; // For other change types, assume they're important
      });

      return hasChanges ? newEdges : eds;
    });
  }, []);

  // Track step changes to prevent unnecessary updates
  useEffect(() => {
    if (prevStepRef.current !== step) {
      prevStepRef.current = step;
      // Force a re-render when step changes
      setNodes(prev => [...prev]);
    }
  }, [step]);

  // Track the current step with a ref to avoid stale closures
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;

    const totalSteps = stepHighlightMap.length;
    let intervalId: NodeJS.Timeout | null = null;

    // Function to handle step advancement
    const advanceStep = () => {
      const currentStep = stepRef.current;

      // If we're at or past the last step, stop
      if (currentStep >= totalSteps - 1) {
        pause();
        // Ensure we're exactly at the last step
        if (currentStep > totalSteps - 1) {
          setStep(totalSteps - 1);
        }
        return;
      }

      // Otherwise, go to next step
      nextStep();
    };

    // Start the interval
    intervalId = setInterval(advanceStep, 2000);

    // Initial step in case we're starting
    if (stepRef.current < totalSteps - 1) {
      advanceStep();
    }

    // Clean up the interval when component unmounts or when isPlaying changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, stepHighlightMap.length, nextStep, pause, setStep]);

  const currentHighlight = step > 0 ? stepHighlightMap[step] || { nodes: [], edges: [] } : { nodes: [], edges: [] };
  const accumulated = {
    nodes: new Set<string>(currentHighlight.nodes || []),
    edges: new Set<string>(currentHighlight.edges || []),
  };
  const currentStepHighlight = step > 0 ? stepHighlightMap[step] : null;
  const nodeEdgesMap = useMemo(() => {
    const map = new Map<string, string[]>();
    flowEdges.forEach(edge => {
      if (!map.has(edge.source)) map.set(edge.source, []);
      if (!map.has(edge.target)) map.set(edge.target, []);
      map.get(edge.source)?.push(edge.id);
      map.get(edge.target)?.push(edge.id);
    });
    return map;
  }, [flowEdges]);

  const { visibleEdges, currentEdges, activeEdges } = useMemo(() => {
    const visible = new Set<string>();
    const current = new Set<string>();
    const active = new Set<string>();

    const stepHighlight = step > 0 ? stepHighlightMap[step] || { nodes: [], edges: [] } : { nodes: [], edges: [] };

    for (const edgeId of stepHighlight.edges) {
      visible.add(edgeId);
      active.add(edgeId);
      current.add(edgeId);
    }

    // process connected edges for active nodes in current step
    for (const nodeId of stepHighlight.nodes) {
      const connectedEdges = nodeEdgesMap.get(nodeId) || [];
      for (const edgeId of connectedEdges) {
        if (stepHighlight.edges.includes(edgeId)) {
          visible.add(edgeId);
        }
      }
    }

    return {
      visibleEdges: visible,
      currentEdges: current,
      activeEdges: active,
    };
  }, [step, stepHighlightMap, nodeEdgesMap]);

  // Update nodes based on current step and stepHighlightMap
  const preparedNodes = useMemo(() => {
    // If no step highlight map or no nodes, return the original nodes
    if (!stepHighlightMap || !flowNodes?.length) return flowNodes;

    // Ensure currentStep is within bounds
    const currentStep = Math.min(storeMethods.step, stepHighlightMap.length - 1);
    const currentHighlight = stepHighlightMap[currentStep] || {
      nodes: [],
      edges: [],
      updateNode: null,
    };

    // Debug log
    logDebug('Current step and highlight', {
      currentStep,
      currentHighlight,
      stepCount: stepHighlightMap.length,
    });

    // Get the node update from the current highlight, if any
    const nodeUpdate = currentHighlight.updateNode;
    if (nodeUpdate) {
      logDebug(`Node update for ${nodeUpdate.id}`, { status: nodeUpdate.data.status });
    }

    return flowNodes.map(node => {
      const isCurrent = currentHighlight.nodes.includes(node.id);
      const nodeData = node.data || {};

      // Start with existing status
      let status = nodeData.status || 'NEW';

      // Apply update from stepHighlightMap if this is the target node
      if (nodeUpdate && nodeUpdate.id === node.id && nodeUpdate.data?.status) {
        status = nodeUpdate.data.status;
      }
      // Otherwise, get status from statusByStep if available
      else if (nodeData.statusByStep && nodeData.statusByStep[currentStep]) {
        status = nodeData.statusByStep[currentStep];
      }
      // If node is in current highlight but no status is set, default to 'PENDING'
      else if (isCurrent && !status) {
        status = 'PENDING';
      }

      // Only update if necessary
      if (node.data?.isCurrent === isCurrent && node.data?.status === status) {
        return node;
      }

      // Return updated node with new status and isCurrent
      return {
        ...node,
        data: {
          ...nodeData,
          isCurrent,
          status,
        },
      };
    });
  }, [flowNodes, stepHighlightMap, storeMethods.step]);

  // Apply node updates for the current step if needed
  useEffect(() => {
    if (!currentStepHighlight?.updateNode) return;

    setNodes(nds => {
      const updateNode = currentStepHighlight.updateNode;
      if (!updateNode) return nds;

      const nodeIndex = nds.findIndex(n => n.id === updateNode.id);

      // If node not found or no changes needed, return previous nodes
      if (nodeIndex === -1) return nds;

      const node = nds[nodeIndex];
      const currentData = node.data as FlowNodeData;
      const newStatusByStep = {
        ...(currentData.statusByStep || {}),
        ...(updateNode.data.statusByStep || {}),
      };

      // Check if update is actually needed
      const statusByStepChanged = JSON.stringify(currentData.statusByStep || {}) !== JSON.stringify(newStatusByStep);

      const dataChanged =
        updateNode.data &&
        Object.entries(updateNode.data).some(
          ([key, value]) => key !== 'statusByStep' && currentData[key as keyof FlowNodeData] !== value
        );

      if (!statusByStepChanged && !dataChanged) {
        return nds;
      }

      // Create new nodes array with updated node
      const newNodes = [...nds];
      newNodes[nodeIndex] = {
        ...node,
        data: {
          ...currentData,
          ...(updateNode.data || {}),
          statusByStep: newStatusByStep,
        },
      };

      return newNodes;
    });
  }, [currentStepHighlight]);

  // Update nodes only when necessary
  useEffect(() => {
    if (!preparedNodes) return;

    setNodes(prevNodes => {
      if (!prevNodes || nodesEqual(prevNodes, preparedNodes)) {
        return prevNodes;
      }
      return preparedNodes;
    });
  }, [preparedNodes, step]);

  // Memoize the edge preparation to prevent unnecessary recalculations
  const preparedEdges = useMemo(() => {
    return flowEdges.map((edge, idx) => {
      const isCurrent = currentEdges.has(edge.id);
      const edgeColor = getEdgeColor(edge, idx + 1);

      // Check if edge needs to be updated
      const needsUpdate =
        edge.animated !== isCurrent ||
        edge.data?.isCurrent !== isCurrent ||
        edge.data?.forceAnimated !== isCurrent ||
        edge.type !== (edge.type || 'event') ||
        edge.data?.color !== edgeColor;

      if (!needsUpdate) {
        return edge;
      }

      // Create updated edge data with required properties
      const edgeData: FlowEdgeData = {
        type: 'event', // Default type
        color: edgeColor,
        ...edge.data, // Spread existing data to preserve other properties
        isCurrent,
        forceAnimated: isCurrent,
      };

      // Return new edge with updated properties
      return {
        ...edge,
        type: edge.type || 'event',
        animated: isCurrent,
        data: edgeData,
      } as Edge<FlowEdgeData>;
    });
  }, [flowEdges, currentEdges]);

  // Update edges only when necessary
  useEffect(() => {
    if (!preparedEdges) return;

    setEdges(prevEdges => {
      if (!prevEdges || edgesEqual(prevEdges, preparedEdges)) {
        return prevEdges;
      }
      return preparedEdges;
    });
  }, [preparedEdges, step]);

  const nodeTypes = useMemo<NodeTypes>(() => {
    // Create a single node renderer for all node types
    const nodeRenderer = createNodeRenderer(nodeHandles);

    // Default node types
    const defaultNodeTypes = {
      event: nodeRenderer,
      proposer: nodeRenderer,
      voter: nodeRenderer,
      token: nodeRenderer,
      recipient: nodeRenderer,
      other: nodeRenderer,
      cron: nodeRenderer,
    };

    // Combine default node types with any custom node types passed as props
    return {
      ...defaultNodeTypes,
      ...props.nodeTypes, // Add any custom node types
    };
  }, [nodeHandles, props.nodeTypes]);

  // Combine default edge types with any custom edge types passed as props
  const combinedEdgeTypes = useMemo<EdgeTypes>(
    () => ({
      event: EventEdge,
      proposal: ProposalEdge,
      voting: VotingEdge,
      ...edgeTypes, // Add any custom edge types
    }),
    [edgeTypes]
  );

  // Debug log for step count
  useEffect(() => {
    logInfo(`[DEBUG] Total steps: ${stepHighlightMap.length}`);
    logInfo(`[DEBUG] Current step: ${step}`);
  }, [stepHighlightMap.length, step]);

  return (
    <Box sx={{ mt: { xs: 0, sm: 0, md: 0 }, pt: { xs: 0, sm: 0, md: 0 }, position: 'relative' }}>
      {/* ZoomController manages zoom animations on step changes */}
      {rfInstance && (
        <ZoomController rfInstance={rfInstance} nodes={nodes} step={step} stepHighlightMap={stepHighlightMap} />
      )}

      {/*
      <FlowControlBar
        totalSteps={stepHighlightMap.length}
        useStore={storeMethods}
      />
      */}

      <Paper
        elevation={4}
        sx={{
          width: '100%',
          height: 600,
          background: uiColors.darkBackground,
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden',
          '& .react-flow__pane': {
            borderRadius: '12px',
          },
          '& .react-flow__renderer': {
            borderRadius: '12px',
          },
        }}
      >
        {/* Custom Zoom Controls - outside ReactFlow but inside Paper */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 5,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            backgroundColor: 'rgba(26, 32, 44, 0.75)',
            backdropFilter: 'blur(4px)',
            borderRadius: 1,
            padding: 0.5,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          <CustomControlButton onClick={() => zoomIn()} title="Zoom In">
            <ZoomIn style={{ fontSize: 18 }} />
          </CustomControlButton>
          <CustomControlButton onClick={() => zoomOut()} title="Zoom Out">
            <ZoomOut style={{ fontSize: 18 }} />
          </CustomControlButton>
          <CustomControlButton onClick={() => resetViewport()} title="Reset View">
            <ZoomOutMap style={{ fontSize: 18 }} />
          </CustomControlButton>
        </Box>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={instance => {
            setRfInstance(instance);
            rfInstanceRef.current = instance;

            // Detect if on tablet/iPad for appropriate settings
            const isTablet = isTabletDevice();
            logInfo('[DEBUG] Initial load - device is tablet?', isTablet);

            // Initial fit with delay to ensure DOM is ready
            setTimeout(() => {
              if (instance) {
                // Initial viewport fit - this is the reference behavior for resetViewport
                // with tablet-specific adjustments
                instance.fitView({
                  padding: isTablet ? 0.2 : 0.3,
                  duration: 800,
                  includeHiddenNodes: true,
                  minZoom: isTablet ? 0.7 : 0.6,
                  maxZoom: isTablet ? 1.5 : 1.1,
                });
              }
            }, 200);

            // Call the onInit prop if provided
            if (onInit) {
              onInit(instance);
            }
          }}
          nodeTypes={nodeTypes}
          edgeTypes={combinedEdgeTypes}
          fitView
          nodesDraggable
          nodesConnectable={false}
          panOnDrag={[0, 1, 2]} // Pan with left/right/middle mouse button
          zoomOnScroll
          minZoom={isTabletDevice() ? 0.7 : 0.5} // Higher minimum zoom on tablets
          maxZoom={isTabletDevice() ? 1.5 : 2} // Lower maximum zoom on tablets
          defaultViewport={{ x: 0, y: 0, zoom: isTabletDevice() ? 0.9 : 1 }} // Better starting zoom on tablets
          nodeDragThreshold={1}
          proOptions={{ hideAttribution: true }} // Hide ReactFlow attribution for cleaner UI
        >
          <Background color="#23272F" gap={24} />
        </ReactFlow>

        <style>{`
          @keyframes popIn {
            0% { transform: translateX(-50%) scale(0.7); opacity: 0; }
            100% { transform: translateX(-50%) scale(1); opacity: 1; }
          }
        `}</style>
      </Paper>
    </Box>
  );
});

export default FlowChartComponent;
