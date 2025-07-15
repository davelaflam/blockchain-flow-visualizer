import React from 'react';
import { EdgeProps, MarkerType, getMarkerEnd } from 'reactflow';

// Custom edge component for the Withdraw edge in the lending flow
export default function WithdrawEdge({
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

  // Calculate the middle points for the path
  // We want a path that goes down from the source, then horizontally to the right,
  // then horizontally to the left, and finally up to the target
  // This creates an S-shaped path that will be distinct from the Repay edge
  const verticalOffset = 40; // Vertical distance from the nodes
  const horizontalOffset = 40; // Horizontal distance for the S-curve

  // Create a custom path with an S-curve (mirrored from RepayEdge)
  const edgePath = `
    M ${sourceX} ${sourceY}
    L ${sourceX} ${sourceY + verticalOffset}
    L ${sourceX + horizontalOffset} ${sourceY + verticalOffset}
    L ${sourceX + horizontalOffset} ${targetY - verticalOffset}
    L ${targetX} ${targetY - verticalOffset}
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
          x={sourceX + horizontalOffset}
          y={(sourceY + verticalOffset + targetY - verticalOffset) / 2}
        >
          {data.label}
        </text>
      )}
    </>
  );
}
