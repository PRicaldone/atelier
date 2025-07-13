import React, { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  useReactFlow,
  MiniMap,
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
    navigateToModule('mind-garden', { source: 'mind-garden-init' });
  }, [initializeStore, navigateToModule]);

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
  }, []);

  const onNodeDoubleClick = useCallback((event, node) => {
    const rect = reactFlowWrapper.current.getBoundingClientRect();
    setCommandPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top + 20
    });
    setSelectedNodeId(node.id);
    setCommandPaletteOpen(true);
  }, []);

  const onPaneClick = useCallback((event) => {
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
    setViewport(viewport);
  }, [setViewport]);

  return (
    <div className="h-full w-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        defaultViewport={viewport}
        className="bg-gray-900"
        defaultEdgeOptions={{
          type: 'organic',
        }}
        multiSelectionKeyCode="Shift"
        fitView
      >
        <Background 
          color="rgba(255, 255, 255, 0.02)" 
          gap={32}
          size={2}
        />
        <Controls 
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg"
        />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.data?.phase) {
              case 'narrative': return '#3B82F6';
              case 'formal': return '#10B981';
              case 'symbolic': return '#8B5CF6';
              default: return '#6B7280';
            }
          }}
          className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-lg"
        />
      </ReactFlow>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3">
        {/* Export to Canvas Button */}
        {selectedNodes.length > 0 && (
          <button
            onClick={handleExportToCanvas}
            className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            title="Export selected nodes to Canvas"
          >
            <Download className="w-6 h-6" />
          </button>
        )}
        
        {/* Add Node Button */}
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

      {/* Instructions Overlay */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md rounded-lg p-3 text-xs text-gray-300 max-w-xs">
        <p className="mb-1">🌱 <strong>Mind Garden</strong></p>
        <p>• Double-click canvas to add node</p>
        <p>• Double-click node for AI commands</p>
        <p>• Shift+click to multi-select</p>
        <p>• Selected nodes: {selectedNodes.length}</p>
      </div>

      {/* Export History */}
      {exportHistory.length > 0 && (
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md rounded-lg p-3 text-xs text-gray-300">
          <p className="mb-1">📤 <strong>Recent Exports</strong></p>
          {exportHistory.slice(-3).map((exp, idx) => (
            <p key={idx}>• {exp.nodeCount} nodes → Canvas ({exp.timestamp})</p>
          ))}
        </div>
      )}
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