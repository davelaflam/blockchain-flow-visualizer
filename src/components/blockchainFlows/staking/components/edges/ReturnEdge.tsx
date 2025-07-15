import React from 'react';
import { EdgeProps, MarkerType, getBezierPath, getMarkerEnd } from 'reactflow';

// Custom edge component for the Return edge in the staking flow
export default function ReturnEdge({
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
  // Use the color from data or default to blue
  const color = data?.color || '#60a5fa';

  // Calculate the middle point for the horizontal segment
  // We want a horizontal line at the top with vertical segments connecting to nodes
  const midY = Math.min(sourceY, targetY) - 40; // Horizontal line 40px above the highest node

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
          y={midY - 10}
          dy={-5}
        >
          {data.label}
        </text>
      )}
    </>
  );
}
