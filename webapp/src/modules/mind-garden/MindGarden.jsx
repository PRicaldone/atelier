import React, { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodeCard from './components/NodeCard';
import OrganicEdge from './components/OrganicEdge';
import AICommandPalette from './components/AICommandPalette';
import ExportPreview from './components/ExportPreview';
import { useUnifiedStore } from '../../store/unifiedStore';
import { useMindGardenStore } from './store';
import { Plus, Download } from 'lucide-react';

// Custom node types
const nodeTypes = {
  card: NodeCard,
};

// Custom edge types  
const edgeTypes = {
  organic: OrganicEdge,
};

const MindGardenInner = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [exportPreviewOpen, setExportPreviewOpen] = useState(false);
  const [commandPosition, setCommandPosition] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [isRightDragging, setIsRightDragging] = useState(false);
  const [zoomStart, setZoomStart] = useState(null);
  const [initialZoom, setInitialZoom] = useState(1);
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef(null);

  // Unified Store integration
  const { navigateToModule, analyzeCanvasContext } = useUnifiedStore();
  
  // Mind Garden Store
  const {
    nodes,
    edges,
    viewport,
    currentPhase,
    setNodes,
    setEdges,
    setViewport,
    addNode,
    updateNode,
    removeNode,
    exportHistory,
    initializeStore,
    syncToUnified
  } = useMindGardenStore();

  // Initialize on mount
  useEffect(() => {
    initializeStore();
    // Don't auto-navigate to avoid redirect loop
  }, [initializeStore]);

  // Center view on nodes after ReactFlow is ready
  useEffect(() => {
    if (reactFlowInstance && nodes.length > 0) {
      // Delay to ensure ReactFlow is fully rendered
      setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.2, // 20% padding around nodes
          maxZoom: 1, // Canvas zoom level
          minZoom: 1,
          duration: 0 // No animation, instant
        });
      }, 100);
    }
  }, [reactFlowInstance, nodes.length]);

  // Sync to unified store on changes
  useEffect(() => {
    syncToUnified();
  }, [nodes, edges, syncToUnified]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      
      // Track selections
      const selections = changes
        .filter(change => change.type === 'select')
        .map(change => ({ id: change.id, selected: change.selected }));
      
      if (selections.length > 0) {
        const selected = nodes.filter(node => 
          selections.find(s => s.id === node.id)?.selected
        );
        setSelectedNodes(selected);
      }
    },
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({
      ...connection,
      type: 'organic',
      data: { strength: 1, animated: false }
    }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null); // Deselect any selected edge
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null); // Deselect any selected node
  }, []);

  const onNodeDoubleClick = useCallback((event, node) => {
    // Shift+Double click = AI Command Palette
    if (event.shiftKey) {
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      setCommandPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top + 20
      });
      setSelectedNodeId(node.id);
      setCommandPaletteOpen(true);
      return;
    }
    
    // Regular double click = Edit mode
    const newTitle = prompt('Edit title:', node.data.title || '');
    const newContent = prompt('Edit content:', node.data.content || '');
    
    // Update both title and content in a single operation
    if ((newTitle !== null && newTitle !== node.data.title) || 
        (newContent !== null && newContent !== node.data.content)) {
      updateNode(node.id, {
        data: {
          ...node.data,
          title: newTitle !== null ? newTitle : node.data.title,
          content: newContent !== null ? newContent : node.data.content
        }
      });
    }
  }, [updateNode]);

  const onPaneClick = useCallback((event) => {
    // Deselect everything on single click
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    
    if (event.detail === 2) { // Double click on pane
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });

      const newNode = {
        id: `node_${Date.now()}`,
        type: 'card',
        position,
        data: {
          title: 'New Idea',
          content: '',
          type: 'text',
          phase: currentPhase === 'foundation' ? 'narrative' : null,
        },
      };

      addNode(newNode);
    }
  }, [currentPhase, reactFlowInstance, addNode]);

  const handleAICommand = useCallback(async (command) => {
    console.log('🌱 AI Command:', command, 'on node:', selectedNodeId);
    
    // Trigger AI Intelligence Engine
    try {
      await analyzeCanvasContext();
      console.log('🤖 AI analysis completed for Mind Garden');
    } catch (error) {
      console.error('🤖 AI analysis failed:', error);
    }
    
    setCommandPaletteOpen(false);
  }, [selectedNodeId, analyzeCanvasContext]);

  const handleExportToCanvas = useCallback(() => {
    if (selectedNodes.length === 0) {
      console.warn('🌱 No nodes selected for export');
      return;
    }
    
    setExportPreviewOpen(true);
  }, [selectedNodes]);

  const onMoveEnd = useCallback((event, viewport) => {
    // Clamp zoom to max 1 (default zoom)
    const clampedViewport = {
      ...viewport,
      zoom: Math.max(0.1, Math.min(1, viewport.zoom))
    };
    setViewport(clampedViewport);
  }, [setViewport]);

  // Right-click zoom functionality (exactly like Visual Canvas)
  const handleMouseDown = useCallback((event) => {
    if (event.button === 2) { // Right mouse button
      event.preventDefault();
      setIsRightDragging(true);
      setZoomStart({ x: event.clientX, y: event.clientY });
      setInitialZoom(reactFlowInstance?.getZoom() || 1);
    }
  }, [reactFlowInstance]);

  const handleMouseMove = useCallback((event) => {
    if (isRightDragging && zoomStart && reactFlowInstance) {
      event.preventDefault();
      const deltaY = event.clientY - zoomStart.y;
      // Zoom sensitivity: negative deltaY = zoom in, positive = zoom out (exactly like Canvas)
      const zoomFactor = 1 + (deltaY * -0.01);
      const newZoom = Math.max(0.1, Math.min(1, initialZoom * zoomFactor));
      
      // Get mouse position relative to ReactFlow container
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const mouseX = zoomStart.x - rect.left;
      const mouseY = zoomStart.y - rect.top;
      
      // Zoom to mouse position
      reactFlowInstance.zoomTo(newZoom, { x: mouseX, y: mouseY });
    }
  }, [isRightDragging, zoomStart, initialZoom, reactFlowInstance]);

  const handleMouseUp = useCallback((event) => {
    if (event.button === 2) { // Right mouse button
      setIsRightDragging(false);
      setZoomStart(null);
    }
  }, []);

  // Keyboard event handler for deletion
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedEdgeId) {
          // Delete selected edge
          setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdgeId));
          setSelectedEdgeId(null);
          event.preventDefault();
        } else if (selectedNodeId) {
          // Delete selected node
          removeNode(selectedNodeId);
          setSelectedNodeId(null);
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedEdgeId, selectedNodeId, setEdges, removeNode]);

  // Add global mouse event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (event) => handleMouseMove(event);
    const handleGlobalMouseUp = (event) => handleMouseUp(event);
    
    if (isRightDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('contextmenu', (e) => e.preventDefault());
    };
  }, [isRightDragging, handleMouseMove, handleMouseUp]);

  return (
    <div 
      className="h-full w-full relative" 
      ref={reactFlowWrapper}
      onMouseDown={handleMouseDown}
      style={{ cursor: isRightDragging ? 'ns-resize' : 'default' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges.map(edge => ({
          ...edge,
          selected: edge.id === selectedEdgeId,
          data: {
            ...edge.data,
            highlighted: edge.id === selectedEdgeId
          }
        }))}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        defaultViewport={viewport}
        className="bg-gray-900"
        defaultEdgeOptions={{
          type: 'organic',
        }}
        multiSelectionKeyCode="Shift"
        connectionMode="loose"
        connectOnClick={false}
        selectionOnDrag={false}
        panOnDrag={[1]}
        panOnScroll={false}
        zoomOnScroll={true}
        minZoom={0.1}
        maxZoom={1}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          color="rgba(255, 255, 255, 0.02)" 
          gap={32}
          size={2}
        />
      </ReactFlow>

      {/* Add Button - Top Left (like Canvas toolbar) */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={(e) => {
            const rect = reactFlowWrapper.current.getBoundingClientRect();
            setCommandPosition({
              x: e.clientX - rect.left - 160,
              y: e.clientY - rect.top + 20
            });
            setCommandPaletteOpen(true);
          }}
          className="w-12 h-12 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          title="Add new node"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Export Button - Top Right (always visible) */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={selectedNodes.length > 0 ? handleExportToCanvas : undefined}
          disabled={selectedNodes.length === 0}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors ${
            selectedNodes.length > 0
              ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
          }`}
          title={selectedNodes.length > 0 ? "Export selected nodes to Canvas" : "Select nodes to export"}
        >
          <Download className="w-4 h-4" />
          Export to Canvas
        </button>
      </div>

      {/* AI Command Palette */}
      <AICommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onCommand={handleAICommand}
        position={commandPosition}
      />

      {/* Export Preview Modal */}
      <ExportPreview
        isOpen={exportPreviewOpen}
        onClose={() => setExportPreviewOpen(false)}
        selectedNodes={selectedNodes}
        onExport={() => {
          console.log('🌱 Exporting nodes to Canvas:', selectedNodes);
          setExportPreviewOpen(false);
        }}
      />

      {/* Export History - Bottom Left */}
      {exportHistory.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-300 max-w-xs space-y-1">
          <div className="font-medium mb-1">📤 Recent Exports</div>
          {exportHistory.slice(-2).map((exp, idx) => (
            <div key={idx}>• {exp.nodeCount} nodes → Canvas ({exp.timestamp})</div>
          ))}
        </div>
      )}

      {/* Instructions Panel - Bottom Right (like Canvas) */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-300 max-w-xs">
        <div className="font-medium mb-1">🌱 Mind Garden</div>
        <div>• Double-click canvas to add node</div>
        <div>• Double-click node to edit content</div>
        <div>• Click connection line → Del to remove</div>
        <div>• Shift+click to multi-select nodes</div>
        <div>• Right-click+drag OR scroll to zoom</div>
      </div>
    </div>
  );
};

// Wrap with ReactFlowProvider
const MindGarden = (props) => {
  return (
    <ReactFlowProvider>
      <MindGardenInner {...props} />
    </ReactFlowProvider>
  );
};

export default MindGarden;