import React from 'react';
import { getBezierPath } from 'reactflow';

const OrganicEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25
  });

  const strength = data?.strength || 1;
  const isHighlighted = data?.highlighted || false;
  
  return (
    <>
      {/* Glow effect for highlighted edges */}
      {isHighlighted && (
        <path
          id={`${id}-glow`}
          style={{
            ...style,
            stroke: data?.color || '#3B82F6',
            strokeWidth: (strength * 2) + 4,
            opacity: 0.14,
            filter: 'blur(3px)',
            pointerEvents: 'none'
          }}
          className="react-flow__edge-path"
          d={edgePath}
          markerEnd={markerEnd}
        />
      )}
      
      {/* Main edge path with thick hover area */}
      <path
        id={id}
        style={{
          ...style,
          stroke: isHighlighted ? '#3B82F6' : (data?.color || 'rgba(255, 255, 255, 0.2)'),
          strokeWidth: isHighlighted ? strength * 2 : strength * 2,
          strokeDasharray: data?.animated ? '5 5' : 'none',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        className="react-flow__edge-path hover:stroke-blue-400"
        d={edgePath}
        markerEnd={markerEnd}
        strokeLinecap="round"
      />
      
      {/* Invisible thick overlay for easier clicking */}
      <path
        id={`${id}-hitarea`}
        style={{
          ...style,
          stroke: 'transparent',
          strokeWidth: 15,
          cursor: 'pointer',
          pointerEvents: 'stroke'
        }}
        className="react-flow__edge-path"
        d={edgePath}
      />
      
      {/* Animated dots for active connections */}
      {data?.animated && (
        <circle r="2" fill="#3B82F6">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}
    </>
  );
};

export default OrganicEdge;