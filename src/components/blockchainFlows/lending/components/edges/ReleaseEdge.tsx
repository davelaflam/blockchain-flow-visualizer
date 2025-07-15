import React from 'react';
import { EdgeProps, MarkerType, getMarkerEnd } from 'reactflow';

// Custom edge component for the Release edge in the lending flow
export default function ReleaseEdge({
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
  // Use the color from data or default to green
  const color = data?.color || '#34d399';

  // Calculate the middle points for the path
  // We want a path that goes up from the source, then horizontally to the left,
  // then vertically down between Lending Pool and Collateral Manager, and finally to the target
  // This creates a path that matches the ASCII diagram in the issue description
  const verticalOffset = 40; // Vertical distance for the horizontal segments
  const horizontalOffset = 150; // Horizontal distance for the vertical segment - increased to position between nodes

  // Create a custom path
  const edgePath = `
    M ${sourceX} ${sourceY}
    L ${sourceX} ${sourceY - verticalOffset}
    L ${sourceX - horizontalOffset} ${sourceY - verticalOffset}
    L ${sourceX - horizontalOffset} ${targetY + verticalOffset}
    L ${targetX} ${targetY + verticalOffset}
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
          x={(sourceX + sourceX - horizontalOffset) / 2}
          y={sourceY - verticalOffset - 10}
        >
          {data.label}
        </text>
      )}
    </>
  );
}
