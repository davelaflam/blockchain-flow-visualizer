import React, { useState, useEffect, useMemo, useRef } from 'react';

import { journeyColors } from '../../../theme/colors';
import { CustomEdgeProps } from '../types';

/**
 * Custom edge component for flow chart
 */
const CustomEdge: React.FC<CustomEdgeProps> = props => {
  const { sourceX, sourceY, targetX, targetY, data, isCurrent, id, animated } = props;
  const color = data?.color || journeyColors.gray;
  const arrowSize = 6; // Smaller arrowhead
  const markerId = `arrowhead-${color.replace(/[^a-zA-Z0-9]/g, '')}`;
  const shouldAnimate = animated || data?.forceAnimated || isCurrent;

  // Track if this is the first time the edge becomes active
  const [isNewlyActive, setIsNewlyActive] = useState(false);
  const prevIsCurrent = useRef(isCurrent);

  useEffect(() => {
    if (isCurrent && !prevIsCurrent.current) {
      setIsNewlyActive(true);
      const timer = setTimeout(() => setIsNewlyActive(false), 1500); // Glow for 1.5s
      return () => clearTimeout(timer);
    }
    prevIsCurrent.current = isCurrent;
  }, [isCurrent]);

  // We'll use classes from edgeAnimations.css rather than inline animation styles
  const animationClass = useMemo(() => {
    if (!isCurrent && !shouldAnimate) return '';
    return isNewlyActive ? 'animated-edge new-active' : 'animated-edge';
  }, [isCurrent, shouldAnimate, isNewlyActive]);

  return (
    <g style={{ opacity: 1, transition: 'opacity 0.3s' }}>
      <defs>
        <marker
          id={markerId}
          markerWidth={arrowSize}
          markerHeight={arrowSize}
          refX={arrowSize - 1}
          refY={arrowSize / 2}
          orient="auto"
          markerUnits="strokeWidth"
          markerEnd="url(#arrowhead)"
        >
          <polygon points={`0,0 ${arrowSize},${arrowSize / 2} 0,${arrowSize}`} fill={color} stroke="none" />
        </marker>
      </defs>
      <line
        x1={sourceX}
        y1={sourceY}
        x2={targetX}
        y2={targetY}
        stroke={color}
        strokeWidth={isCurrent ? 4 : 2}
        markerEnd={`url(#${markerId})`}
        data-edge-id={id}
        data-animated={String(shouldAnimate)}
        className={animationClass}
        style={{
          opacity: shouldAnimate ? 1 : 0.7,
          transition: 'opacity 0.3s ease, stroke-width 0.3s ease',
          strokeLinecap: 'round',
          stroke: color,
          strokeWidth: isCurrent ? 2.5 : 2,
        }}
      />
      {data?.label && (
        <g>
          <rect
            x={(sourceX + targetX) / 2 - data.label.length * 4}
            y={(sourceY + targetY) / 2 - 20 + (data.labelOffset || 0)}
            width={data.label.length * 8}
            height={20}
            rx={4}
            fill="rgba(30, 41, 59, 0.7)"
            style={{ opacity: 0.8 }}
          />
          <text
            x={(sourceX + targetX) / 2}
            y={(sourceY + targetY) / 2 - 7 + (data.labelOffset || 0)}
            fill={color}
            fontSize={13}
            textAnchor="middle"
            style={{ fontWeight: 700 }}
          >
            {data.label}
          </text>
        </g>
      )}
    </g>
  );
};

export default CustomEdge;
