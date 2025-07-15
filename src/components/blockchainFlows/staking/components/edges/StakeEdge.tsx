import React from 'react';
import { EdgeProps } from 'reactflow';

// Custom edge component for the Stake edge in the staking flow
export default function StakeEdge({
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

  // Create a custom path with horizontal segments at top and bottom connected by a vertical line
  // This matches the ASCII diagram: horizontal segment at top, vertical line, horizontal segment with arrow at bottom

  // Calculate positions for the path segments
  const verticalX = sourceX + 20; // Position the vertical line 20px to the right of the source

  const edgePath = `
    M ${sourceX} ${sourceY}
    L ${verticalX} ${sourceY}
    L ${verticalX} ${targetY}
    L ${targetX} ${targetY}
  `;

  // Create a special marker for the left-pointing arrow
  const leftArrowId = `left-arrow-${id}`;

  return (
    <>
      <defs>
        <marker
          id={leftArrowId}
          viewBox="0 0 10 10"
          refX="10"
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
        markerEnd={`url(#${leftArrowId})`}
      />
      {data?.label && (
        <text
          style={{
            fill: color,
            fontSize: '12px',
            fontWeight: 500,
            pointerEvents: 'none',
          }}
          x={verticalX}
          y={(sourceY + targetY) / 2}
          dx={-10}
          textAnchor="end"
          dominantBaseline="central"
        >
          {data.label}
        </text>
      )}
    </>
  );
}
