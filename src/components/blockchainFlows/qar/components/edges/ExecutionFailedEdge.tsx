import React from 'react';
import { EdgeProps, MarkerType, getMarkerEnd } from 'reactflow';

// Custom edge component for the Execution Failed edge in the QAR token flow
export default function ExecutionFailedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps) {
  // Use the color from data or default to red
  const color = data?.color || '#ef4444';

  // Calculate the middle point for the horizontal segment
  // We want a path that goes down from the source, then horizontally to the target, then up to the target
  const midY = Math.max(sourceY, targetY) + 20; // Horizontal line 20px below the lowest node

  // Create a custom path with a horizontal segment and vertical connectors
  const edgePath = `
    M ${sourceX} ${sourceY}
    L ${sourceX} ${midY}
    L ${targetX} ${midY}
    L ${targetX} ${targetY}
  `;

  // Get the marker end for the arrow
  const customMarkerEnd = getMarkerEnd(MarkerType.ArrowClosed, color);

  return (
    <>
      <defs>
        <marker
          id={`arrow-${id}`}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>
      <path
        id={id}
        style={{
          ...style,
          stroke: color,
          strokeWidth: 2,
          fill: 'none',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={`url(#arrow-${id})`}
      />
      {data?.label && (
        <text
          style={{
            fill: color,
            fontSize: '12px',
            fontWeight: 500,
            textAnchor: 'middle',
            dominantBaseline: 'central',
            pointerEvents: 'none',
          }}
          x={(sourceX + targetX) / 2}
          y={midY + 5}
          dy={3}
        >
          {data.label}
        </text>
      )}
    </>
  );
}
