/**
 * Mind Garden v5.1 - Enhanced Conversation Edge with Flow Indicators
 * Day 5: Advanced connection visualization with strength and flow
 */

import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSmoothStepPath, Position } from 'reactflow';
import { BRANCH_TYPES } from '../types/conversationTypes';

const EnhancedConversationEdge = memo(({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  sourcePosition, 
  targetPosition,
  data,
  selected,
  animated = false
}) => {
  // Calculate connection strength based on context
  const connectionStrength = useMemo(() => {
    if (!data) return 0.5;
    
    const sourceConfidence = data.sourceNode?.data?.context?.aiConfidence || 0.7;
    const targetConfidence = data.targetNode?.data?.context?.aiConfidence || 0.7;
    const contextSimilarity = calculateContextSimilarity(data.sourceNode, data.targetNode);
    
    return (sourceConfidence + targetConfidence + contextSimilarity) / 3;
  }, [data]);

  // Calculate context similarity between nodes
  const calculateContextSimilarity = (sourceNode, targetNode) => {
    if (!sourceNode || !targetNode) return 0.5;
    
    const sourceContext = sourceNode.data.context || {};
    const targetContext = targetNode.data.context || {};
    
    let similarity = 0;
    let factors = 0;
    
    // Branch similarity
    if (sourceContext.branch && targetContext.branch) {
      similarity += sourceContext.branch === targetContext.branch ? 1 : 0;
      factors++;
    }
    
    // Focus similarity
    if (sourceContext.conversationFocus && targetContext.conversationFocus) {
      similarity += sourceContext.conversationFocus === targetContext.conversationFocus ? 1 : 0;
      factors++;
    }
    
    // Depth continuity (closer depths = higher similarity)
    if (sourceContext.depth !== undefined && targetContext.depth !== undefined) {
      const depthDiff = Math.abs(sourceContext.depth - targetContext.depth);
      similarity += Math.max(0, 1 - depthDiff / 5);
      factors++;
    }
    
    return factors > 0 ? similarity / factors : 0.5;
  };

  // Get edge styling based on branch type and strength
  const getEdgeStyle = useMemo(() => {
    const branchType = data?.targetNode?.data?.context?.branch || BRANCH_TYPES.EXPLORATION;
    
    const styles = {
      [BRANCH_TYPES.EXPLORATION]: {
        stroke: '#3b82f6',
        strokeDasharray: '5,5',
        glowColor: 'rgba(59, 130, 246, 0.3)'
      },
      [BRANCH_TYPES.REFINEMENT]: {
        stroke: '#9333ea',
        strokeDasharray: '10,5',
        glowColor: 'rgba(147, 51, 234, 0.3)'
      },
      [BRANCH_TYPES.IMPLEMENTATION]: {
        stroke: '#22c55e',
        strokeDasharray: 'none',
        glowColor: 'rgba(34, 197, 94, 0.3)'
      },
      [BRANCH_TYPES.CRITIQUE]: {
        stroke: '#ef4444',
        strokeDasharray: '2,3',
        glowColor: 'rgba(239, 68, 68, 0.3)'
      }
    };
    
    return styles[branchType] || styles[BRANCH_TYPES.EXPLORATION];
  }, [data]);

  // Calculate path
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
    offset: 20
  });

  // Calculate flow direction indicators
  const flowIndicators = useMemo(() => {
    const indicators = [];
    const pathLength = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));
    const numIndicators = Math.min(3, Math.floor(pathLength / 100));
    
    for (let i = 0; i < numIndicators; i++) {
      const progress = (i + 1) / (numIndicators + 1);
      const x = sourceX + (targetX - sourceX) * progress;
      const y = sourceY + (targetY - sourceY) * progress;
      
      indicators.push({
        id: `${id}-flow-${i}`,
        x,
        y,
        delay: i * 0.2
      });
    }
    
    return indicators;
  }, [sourceX, sourceY, targetX, targetY, id]);

  // Animation variants
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  const flowVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const glowVariants = {
    pulse: {
      opacity: [0.3, 0.7, 0.3],
      scale: [1, 1.1, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <g className="enhanced-conversation-edge">
      {/* Glow effect for selected edge */}
      <AnimatePresence>
        {selected && (
          <motion.path
            d={edgePath}
            fill="none"
            stroke={getEdgeStyle.glowColor}
            strokeWidth={12}
            variants={glowVariants}
            animate="pulse"
            initial={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            style={{ filter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      {/* Main edge path */}
      <motion.path
        d={edgePath}
        fill="none"
        stroke={getEdgeStyle.stroke}
        strokeWidth={Math.max(1, connectionStrength * 4)}
        strokeDasharray={getEdgeStyle.strokeDasharray}
        opacity={0.3 + connectionStrength * 0.7}
        variants={pathVariants}
        initial="hidden"
        animate="visible"
        className="conversation-edge-path"
        style={{
          filter: selected ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))' : 'none'
        }}
      />

      {/* Flow indicators */}
      <AnimatePresence>
        {(animated || selected) && flowIndicators.map((indicator, index) => (
          <motion.circle
            key={indicator.id}
            cx={indicator.x}
            cy={indicator.y}
            r={3}
            fill={getEdgeStyle.stroke}
            variants={flowVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ delay: indicator.delay }}
            style={{
              filter: 'drop-shadow(0 0 3px rgba(0, 0, 0, 0.3))'
            }}
          />
        ))}
      </AnimatePresence>

      {/* Connection strength indicator */}
      {selected && (
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ delay: 0.2 }}
        >
          <rect
            x={labelX - 25}
            y={labelY - 10}
            width={50}
            height={20}
            rx={10}
            fill="white"
            stroke={getEdgeStyle.stroke}
            strokeWidth={1}
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
            }}
          />
          <text
            x={labelX}
            y={labelY + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fill={getEdgeStyle.stroke}
            fontWeight="600"
          >
            {Math.round(connectionStrength * 100)}%
          </text>
        </motion.g>
      )}

      {/* Branch type indicator */}
      {data?.targetNode?.data?.context?.branch && (
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <circle
            cx={labelX}
            cy={labelY - 25}
            r={6}
            fill={getEdgeStyle.stroke}
            opacity={0.8}
          />
          <text
            x={labelX}
            y={labelY - 23}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            fill="white"
            fontWeight="bold"
          >
            {getBranchSymbol(data.targetNode.data.context.branch)}
          </text>
        </motion.g>
      )}

      {/* Animated particles for high-strength connections */}
      <AnimatePresence>
        {connectionStrength > 0.7 && (animated || selected) && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.circle
                key={`particle-${i}`}
                r={2}
                fill={getEdgeStyle.stroke}
                opacity={0.6}
                animate={{
                  offsetDistance: ["0%", "100%"],
                  opacity: [0, 0.8, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "linear"
                }}
                style={{
                  offsetPath: `path("${edgePath}")`,
                  offsetRotate: "auto"
                }}
              />
            ))}
          </motion.g>
        )}
      </AnimatePresence>

      {/* Context similarity indicator */}
      {selected && data?.sourceNode && data?.targetNode && (
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ delay: 0.6 }}
        >
          <rect
            x={labelX - 30}
            y={labelY + 15}
            width={60}
            height={12}
            rx={6}
            fill="rgba(0, 0, 0, 0.1)"
          />
          <rect
            x={labelX - 28}
            y={labelY + 17}
            width={56 * calculateContextSimilarity(data.sourceNode, data.targetNode)}
            height={8}
            rx={4}
            fill={getEdgeStyle.stroke}
            opacity={0.7}
          />
          <text
            x={labelX}
            y={labelY + 23}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            fill="rgba(0, 0, 0, 0.6)"
          >
            Context Match
          </text>
        </motion.g>
      )}
    </g>
  );
});

// Helper function to get branch symbol
const getBranchSymbol = (branchType) => {
  switch (branchType) {
    case BRANCH_TYPES.EXPLORATION:
      return '?';
    case BRANCH_TYPES.REFINEMENT:
      return '↗';
    case BRANCH_TYPES.IMPLEMENTATION:
      return '⚡';
    case BRANCH_TYPES.CRITIQUE:
      return '!';
    default:
      return '→';
  }
};

EnhancedConversationEdge.displayName = 'EnhancedConversationEdge';

export default EnhancedConversationEdge;