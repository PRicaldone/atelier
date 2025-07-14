/**
 * Mind Garden v5.1 - Advanced Mini-Map Navigation
 * Day 5: Intelligent navigation with conversation thread awareness
 */

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  Target,
  Eye,
  EyeOff,
  Settings,
  Filter,
  Search
} from 'lucide-react';
import { useMindGardenStore } from '../store';
import { BRANCH_TYPES, CONVERSATION_FOCUS } from '../types/conversationTypes';

const MiniMap = memo(({ 
  nodes, 
  edges, 
  viewport, 
  onViewportChange,
  selectedNodeId,
  onNodeSelect,
  className = "",
  position = "bottom-right"
}) => {
  const store = useMindGardenStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filterSettings, setFilterSettings] = useState({
    showBranches: true,
    showHealthIndicators: true,
    showConnectionStrength: true,
    focusFilter: 'all',
    branchFilter: 'all',
    healthFilter: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  
  const miniMapRef = useRef(null);
  const viewportRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Calculate mini-map dimensions
  const MINI_MAP_WIDTH = isExpanded ? 400 : 200;
  const MINI_MAP_HEIGHT = isExpanded ? 300 : 150;
  const SCALE_FACTOR = 0.1;
  
  // Calculate bounds of all nodes
  const nodeBounds = useCallback(() => {
    if (!nodes || nodes.length === 0) {
      return { minX: 0, maxX: 1000, minY: 0, maxY: 1000 };
    }
    
    const positions = nodes.map(node => ({
      x: node.position.x,
      y: node.position.y
    }));
    
    return {
      minX: Math.min(...positions.map(p => p.x)) - 100,
      maxX: Math.max(...positions.map(p => p.x)) + 100,
      minY: Math.min(...positions.map(p => p.y)) - 100,
      maxY: Math.max(...positions.map(p => p.y)) + 100
    };
  }, [nodes]);
  
  // Filter nodes based on current filter settings
  const filteredNodes = useCallback(() => {
    let filtered = nodes;
    
    if (filterSettings.focusFilter !== 'all') {
      filtered = filtered.filter(node => 
        node.data.context?.conversationFocus === filterSettings.focusFilter
      );
    }
    
    if (filterSettings.branchFilter !== 'all') {
      filtered = filtered.filter(node => 
        node.data.context?.branch === filterSettings.branchFilter
      );
    }
    
    if (filterSettings.healthFilter !== 'all') {
      filtered = filtered.filter(node => {
        const confidence = node.data.context?.aiConfidence || 0;
        switch (filterSettings.healthFilter) {
          case 'excellent': return confidence > 0.8;
          case 'good': return confidence > 0.6 && confidence <= 0.8;
          case 'fair': return confidence > 0.4 && confidence <= 0.6;
          case 'poor': return confidence <= 0.4;
          default: return true;
        }
      });
    }
    
    if (searchQuery) {
      filtered = filtered.filter(node => 
        node.data.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.data.aiResponse?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [nodes, filterSettings, searchQuery]);
  
  // Convert world coordinates to mini-map coordinates
  const worldToMiniMap = useCallback((worldX, worldY) => {
    const bounds = nodeBounds();
    const worldWidth = bounds.maxX - bounds.minX;
    const worldHeight = bounds.maxY - bounds.minY;
    
    return {
      x: ((worldX - bounds.minX) / worldWidth) * MINI_MAP_WIDTH,
      y: ((worldY - bounds.minY) / worldHeight) * MINI_MAP_HEIGHT
    };
  }, [nodeBounds, MINI_MAP_WIDTH, MINI_MAP_HEIGHT]);
  
  // Convert mini-map coordinates to world coordinates
  const miniMapToWorld = useCallback((miniX, miniY) => {
    const bounds = nodeBounds();
    const worldWidth = bounds.maxX - bounds.minX;
    const worldHeight = bounds.maxY - bounds.minY;
    
    return {
      x: bounds.minX + (miniX / MINI_MAP_WIDTH) * worldWidth,
      y: bounds.minY + (miniY / MINI_MAP_HEIGHT) * worldHeight
    };
  }, [nodeBounds, MINI_MAP_WIDTH, MINI_MAP_HEIGHT]);
  
  // Calculate viewport rectangle in mini-map coordinates
  const getViewportRect = useCallback(() => {
    const bounds = nodeBounds();
    const worldWidth = bounds.maxX - bounds.minX;
    const worldHeight = bounds.maxY - bounds.minY;
    
    const viewportWidth = (window.innerWidth / viewport.zoom) / worldWidth * MINI_MAP_WIDTH;
    const viewportHeight = (window.innerHeight / viewport.zoom) / worldHeight * MINI_MAP_HEIGHT;
    
    const viewportX = ((-viewport.x / viewport.zoom - bounds.minX) / worldWidth) * MINI_MAP_WIDTH;
    const viewportY = ((-viewport.y / viewport.zoom - bounds.minY) / worldHeight) * MINI_MAP_HEIGHT;
    
    return {
      x: viewportX,
      y: viewportY,
      width: viewportWidth,
      height: viewportHeight
    };
  }, [viewport, nodeBounds, MINI_MAP_WIDTH, MINI_MAP_HEIGHT]);
  
  // Handle mini-map click
  const handleMiniMapClick = useCallback((e) => {
    if (isDragging) return;
    
    const rect = miniMapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const worldPos = miniMapToWorld(clickX, clickY);
    
    // Center the viewport on the clicked position
    const newViewport = {
      x: -worldPos.x * viewport.zoom + window.innerWidth / 2,
      y: -worldPos.y * viewport.zoom + window.innerHeight / 2,
      zoom: viewport.zoom
    };
    
    onViewportChange?.(newViewport);
  }, [isDragging, miniMapToWorld, viewport, onViewportChange]);
  
  // Handle viewport drag
  const handleViewportDrag = useCallback((e) => {
    if (!isDragging) return;
    
    const rect = miniMapRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    const worldDelta = miniMapToWorld(deltaX, deltaY);
    const worldStart = miniMapToWorld(0, 0);
    
    const worldDeltaX = worldDelta.x - worldStart.x;
    const worldDeltaY = worldDelta.y - worldStart.y;
    
    const newViewport = {
      x: viewport.x - worldDeltaX * viewport.zoom,
      y: viewport.y - worldDeltaY * viewport.zoom,
      zoom: viewport.zoom
    };
    
    onViewportChange?.(newViewport);
    setDragStart({ x: currentX, y: currentY });
  }, [isDragging, dragStart, miniMapToWorld, viewport, onViewportChange]);
  
  // Handle mouse events
  const handleMouseDown = useCallback((e) => {
    if (e.target === viewportRef.current) {
      setIsDragging(true);
      const rect = miniMapRef.current.getBoundingClientRect();
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, []);
  
  const handleMouseMove = useCallback((e) => {
    handleViewportDrag(e);
  }, [handleViewportDrag]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Add event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  // Get node color based on properties
  const getNodeColor = useCallback((node) => {
    if (filterSettings.showHealthIndicators) {
      const confidence = node.data.context?.aiConfidence || 0;
      if (confidence > 0.8) return '#22c55e';
      if (confidence > 0.6) return '#3b82f6';
      if (confidence > 0.4) return '#f59e0b';
      return '#ef4444';
    }
    
    if (filterSettings.showBranches) {
      switch (node.data.context?.branch) {
        case BRANCH_TYPES.EXPLORATION: return '#3b82f6';
        case BRANCH_TYPES.REFINEMENT: return '#9333ea';
        case BRANCH_TYPES.IMPLEMENTATION: return '#22c55e';
        case BRANCH_TYPES.CRITIQUE: return '#ef4444';
        default: return '#6b7280';
      }
    }
    
    return '#6b7280';
  }, [filterSettings]);
  
  // Get connection strength
  const getConnectionStrength = useCallback((edge) => {
    if (!filterSettings.showConnectionStrength) return 0.5;
    
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return 0.5;
    
    const sourceConfidence = sourceNode.data.context?.aiConfidence || 0;
    const targetConfidence = targetNode.data.context?.aiConfidence || 0;
    
    return (sourceConfidence + targetConfidence) / 2;
  }, [nodes, filterSettings]);
  
  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(viewport.zoom * 1.2, 3);
    onViewportChange?.({ ...viewport, zoom: newZoom });
  }, [viewport, onViewportChange]);
  
  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(viewport.zoom / 1.2, 0.1);
    onViewportChange?.({ ...viewport, zoom: newZoom });
  }, [viewport, onViewportChange]);
  
  // Focus on selected node
  const handleFocusNode = useCallback(() => {
    if (selectedNodeId) {
      const node = nodes.find(n => n.id === selectedNodeId);
      if (node) {
        const newViewport = {
          x: -node.position.x * viewport.zoom + window.innerWidth / 2,
          y: -node.position.y * viewport.zoom + window.innerHeight / 2,
          zoom: viewport.zoom
        };
        onViewportChange?.(newViewport);
      }
    }
  }, [selectedNodeId, nodes, viewport, onViewportChange]);
  
  // Get position class
  const getPositionClass = useCallback(() => {
    switch (position) {
      case 'top-left': return 'top-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      default: return 'bottom-4 right-4';
    }
  }, [position]);
  
  const viewportRect = getViewportRect();
  
  if (!isVisible) {
    return (
      <div className={`fixed ${getPositionClass()} z-50`}>
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsVisible(true)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </motion.button>
      </div>
    );
  }
  
  return (
    <div className={`fixed ${getPositionClass()} z-50 ${className}`}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
        style={{
          width: MINI_MAP_WIDTH + 40,
          height: MINI_MAP_HEIGHT + (isExpanded ? 120 : 60)
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Map className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Navigation</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-3 h-3 text-gray-600" />
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
            >
              {isExpanded ? (
                <Minimize2 className="w-3 h-3 text-gray-600" />
              ) : (
                <Maximize2 className="w-3 h-3 text-gray-600" />
              )}
            </button>
            
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
            >
              <EyeOff className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden bg-gray-50 border-b border-gray-200"
            >
              <div className="p-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Search nodes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <Search className="w-3 h-3 text-gray-400" />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <select
                    value={filterSettings.focusFilter}
                    onChange={(e) => setFilterSettings(prev => ({ ...prev, focusFilter: e.target.value }))}
                    className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">All Focus</option>
                    <option value={CONVERSATION_FOCUS.CREATIVE}>Creative</option>
                    <option value={CONVERSATION_FOCUS.TECHNICAL}>Technical</option>
                    <option value={CONVERSATION_FOCUS.STRATEGIC}>Strategic</option>
                    <option value={CONVERSATION_FOCUS.ANALYTICAL}>Analytical</option>
                  </select>
                  
                  <select
                    value={filterSettings.branchFilter}
                    onChange={(e) => setFilterSettings(prev => ({ ...prev, branchFilter: e.target.value }))}
                    className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">All Branches</option>
                    <option value={BRANCH_TYPES.EXPLORATION}>Exploration</option>
                    <option value={BRANCH_TYPES.REFINEMENT}>Refinement</option>
                    <option value={BRANCH_TYPES.IMPLEMENTATION}>Implementation</option>
                    <option value={BRANCH_TYPES.CRITIQUE}>Critique</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-4 text-xs">
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={filterSettings.showBranches}
                      onChange={(e) => setFilterSettings(prev => ({ ...prev, showBranches: e.target.checked }))}
                      className="w-3 h-3"
                    />
                    <span>Branches</span>
                  </label>
                  
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={filterSettings.showHealthIndicators}
                      onChange={(e) => setFilterSettings(prev => ({ ...prev, showHealthIndicators: e.target.checked }))}
                      className="w-3 h-3"
                    />
                    <span>Health</span>
                  </label>
                  
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={filterSettings.showConnectionStrength}
                      onChange={(e) => setFilterSettings(prev => ({ ...prev, showConnectionStrength: e.target.checked }))}
                      className="w-3 h-3"
                    />
                    <span>Connections</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Mini-map Canvas */}
        <div 
          ref={miniMapRef}
          className="relative bg-gray-100 cursor-crosshair"
          style={{ width: MINI_MAP_WIDTH, height: MINI_MAP_HEIGHT }}
          onClick={handleMiniMapClick}
          onMouseDown={handleMouseDown}
        >
          {/* Edges */}
          <svg className="absolute inset-0 w-full h-full">
            {edges.map(edge => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              
              if (!sourceNode || !targetNode) return null;
              
              const sourcePos = worldToMiniMap(sourceNode.position.x, sourceNode.position.y);
              const targetPos = worldToMiniMap(targetNode.position.x, targetNode.position.y);
              const strength = getConnectionStrength(edge);
              
              return (
                <line
                  key={edge.id}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke="#6b7280"
                  strokeWidth={strength * 2}
                  strokeOpacity={strength}
                />
              );
            })}
          </svg>
          
          {/* Nodes */}
          {filteredNodes().map(node => {
            const pos = worldToMiniMap(node.position.x, node.position.y);
            const isSelected = selectedNodeId === node.id;
            
            return (
              <motion.div
                key={node.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute w-2 h-2 rounded-full cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                }`}
                style={{
                  left: pos.x - 4,
                  top: pos.y - 4,
                  backgroundColor: getNodeColor(node),
                  zIndex: isSelected ? 10 : 1
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeSelect?.(node.id);
                }}
                whileHover={{ scale: 1.5 }}
                title={node.data.prompt || 'Empty node'}
              />
            );
          })}
          
          {/* Viewport Rectangle */}
          <div
            ref={viewportRef}
            className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-10 cursor-move"
            style={{
              left: viewportRect.x,
              top: viewportRect.y,
              width: viewportRect.width,
              height: viewportRect.height,
              minWidth: 20,
              minHeight: 20
            }}
          />
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between p-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-1">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3 h-3 text-gray-600" />
            </button>
            
            <span className="text-xs text-gray-600 px-2">
              {Math.round(viewport.zoom * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3 h-3 text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={handleFocusNode}
              disabled={!selectedNodeId}
              className="p-1 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Focus on selected node"
            >
              <Target className="w-3 h-3 text-gray-600" />
            </button>
            
            <div className="text-xs text-gray-500">
              {filteredNodes().length}/{nodes.length}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

MiniMap.displayName = 'MiniMap';

export default MiniMap;