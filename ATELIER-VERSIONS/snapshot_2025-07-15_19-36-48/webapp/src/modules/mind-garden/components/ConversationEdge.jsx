import React, { memo } from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import { motion } from 'framer-motion';
import { BRANCH_TYPES, getConnectionStrength } from '../types/conversationTypes';

const ConversationEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
  selected
}) => {
  // Extract conversation data
  const branchType = data.branch || BRANCH_TYPES.EXPLORATION;
  const confidence = data.confidence || 0.7;
  const strength = data.strength || 'medium';
  const animated = data.animated || false;

  // Calculate bezier path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Get visual properties based on branch type and strength
  const connectionStrength = getConnectionStrength('direct', confidence);
  const strokeWidth = connectionStrength.width;
  const strokeOpacity = connectionStrength.opacity * (confidence || 0.7);

  // Branch type colors
  const branchColors = {
    [BRANCH_TYPES.EXPLORATION]: '#3B82F6',     // Blue
    [BRANCH_TYPES.REFINEMENT]: '#8B5CF6',      // Purple  
    [BRANCH_TYPES.IMPLEMENTATION]: '#10B981',  // Green
    [BRANCH_TYPES.CRITIQUE]: '#EF4444'         // Red
  };

  const strokeColor = branchColors[branchType] || branchColors[BRANCH_TYPES.EXPLORATION];

  // Enhanced styling based on selection and data
  const edgeStyle = {
    stroke: strokeColor,
    strokeWidth: selected ? strokeWidth + 1 : strokeWidth,
    strokeOpacity: selected ? 1.0 : strokeOpacity,
    strokeDasharray: data.dashed ? '5,5' : 'none',
    filter: selected ? `drop-shadow(0 0 6px ${strokeColor}50)` : 'none',
    transition: 'all 0.2s ease',
    ...style
  };

  // Animation for active connections
  const pathLength = Math.sqrt(
    Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2)
  );

  return (
    <>
      {/* Main edge path */}
      <BaseEdge 
        path={edgePath} 
        style={edgeStyle}
        className="conversation-edge"
        data-strength={strength}
        data-branch={branchType}
        data-confidence={confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low'}
      />
      
      {/* Animated flow indicator for active connections */}
      {animated && (
        <motion.circle
          r="3"
          fill={strokeColor}
          initial={{ offsetDistance: '0%' }}
          animate={{ offsetDistance: '100%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            offsetPath: `path('${edgePath}')`,
            opacity: 0.8
          }}
        />
      )}

      {/* Connection strength indicator */}
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className={`
                px-2 py-1 rounded-full text-white text-xs font-medium
                ${branchType === BRANCH_TYPES.EXPLORATION ? 'bg-blue-500' : ''}
                ${branchType === BRANCH_TYPES.REFINEMENT ? 'bg-purple-500' : ''}
                ${branchType === BRANCH_TYPES.IMPLEMENTATION ? 'bg-green-500' : ''}
                ${branchType === BRANCH_TYPES.CRITIQUE ? 'bg-red-500' : ''}
                shadow-lg backdrop-blur-sm
              `}
              style={{
                background: `${strokeColor}E6`, // Add transparency
                border: `1px solid ${strokeColor}`
              }}
            >
              {branchType} • {Math.round(confidence * 100)}%
            </motion.div>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Context flow indicators for deep conversations */}
      {data.contextDepth > 3 && (
        <motion.g>
          {[...Array(Math.min(data.contextDepth - 2, 3))].map((_, index) => (
            <motion.circle
              key={index}
              r="2"
              fill={strokeColor}
              opacity="0.4"
              initial={{ 
                offsetDistance: `${20 + index * 30}%`,
                scale: 0
              }}
              animate={{ 
                offsetDistance: `${20 + index * 30}%`,
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.5,
                ease: 'easeInOut'
              }}
              style={{
                offsetPath: `path('${edgePath}')`,
              }}
            />
          ))}
        </motion.g>
      )}

      {/* Confidence visualization */}
      {confidence < 0.6 && (
        <motion.path
          d={edgePath}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1"
          strokeDasharray="3,3"
          strokeOpacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      )}
    </>
  );
};

export default memo(ConversationEdge);