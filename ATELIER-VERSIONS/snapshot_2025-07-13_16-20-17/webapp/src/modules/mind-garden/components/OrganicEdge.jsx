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
            strokeWidth: (strength * 2) + 8,
            opacity: 0.3,
            filter: 'blur(8px)'
          }}
          className="react-flow__edge-path"
          d={edgePath}
          markerEnd={markerEnd}
        />
      )}
      
      {/* Main edge path */}
      <path
        id={id}
        style={{
          ...style,
          stroke: data?.color || 'rgba(255, 255, 255, 0.2)',
          strokeWidth: strength * 2,
          strokeDasharray: data?.animated ? '5 5' : 'none',
          transition: 'all 0.3s ease'
        }}
        className="react-flow__edge-path hover:stroke-blue-400"
        d={edgePath}
        markerEnd={markerEnd}
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