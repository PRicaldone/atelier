import React, { useCallback, useState, useRef } from 'react';
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
import NodeCard from './NodeCard';
import OrganicEdge from './OrganicEdge';
import AICommandPalette from './AICommandPalette';
import { Plus } from 'lucide-react';

// Custom node types
const nodeTypes = {
  card: NodeCard,
};

// Custom edge types  
const edgeTypes = {
  organic: OrganicEdge,
};

// Initial demo data
const initialNodes = [
  {
    id: '1',
    type: 'card',
    position: { x: 400, y: 100 },
    data: { 
      title: 'Mind Garden Root',
      content: 'Start your creative journey here',
      type: 'text',
      phase: 'narrative',
      tags: ['concept', 'start']
    },
  },
  {
    id: '2',
    type: 'card',
    position: { x: 200, y: 250 },
    data: { 
      title: 'Visual References',
      content: 'Collect inspiring images and mood boards',
      type: 'image',
      phase: 'formal',
      hasSuggestions: true
    },
  },
  {
    id: '3',
    type: 'card', 
    position: { x: 600, y: 250 },
    data: { 
      title: 'Technical Notes',
      content: 'Houdini setup ideas and VFX breakdown',
      type: 'text',
      phase: 'formal',
      tags: ['houdini', 'vfx']
    },
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'organic',
    data: { strength: 2, color: 'rgba(16, 185, 129, 0.5)' }
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    type: 'organic',
    data: { strength: 1.5, animated: true }
  },
];

const MindGardenCanvasInner = ({ layout = 'hybrid', currentPhase = 'dump' }) => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandPosition, setCommandPosition] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({
      ...connection,
      type: 'organic',
      data: { strength: 1, animated: false }
    }, eds)),
    []
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

      setNodes((nds) => nds.concat(newNode));
    }
  }, [currentPhase, reactFlowInstance]);

  const handleAICommand = useCallback((command) => {
    console.log('AI Command:', command, 'on node:', selectedNodeId);
    // TODO: Implement AI command handling
    setCommandPaletteOpen(false);
  }, [selectedNodeId]);

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
        className="bg-gray-900"
        defaultEdgeOptions={{
          type: 'organic',
        }}
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

      {/* Floating Add Button */}
      <button
        onClick={(e) => {
          const rect = reactFlowWrapper.current.getBoundingClientRect();
          setCommandPosition({
            x: e.clientX - rect.left - 160,
            y: e.clientY - rect.top + 20
          });
          setCommandPaletteOpen(true);
        }}
        className="absolute bottom-6 right-6 w-12 h-12 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* AI Command Palette */}
      <AICommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onCommand={handleAICommand}
        position={commandPosition}
      />

      {/* Instructions Overlay */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md rounded-lg p-3 text-xs text-gray-300 max-w-xs">
        <p className="mb-1">🌱 <strong>Mind Garden</strong></p>
        <p>• Double-click canvas to add node</p>
        <p>• Double-click node for AI commands</p>
        <p>• Drag to connect ideas</p>
      </div>
    </div>
  );
};

// Wrap with ReactFlowProvider
const MindGardenCanvas = (props) => {
  return (
    <ReactFlowProvider>
      <MindGardenCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default MindGardenCanvas;