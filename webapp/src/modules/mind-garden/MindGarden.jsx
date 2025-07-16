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
import ConversationalNode from './components/ConversationalNode';
import OrganicEdge from './components/OrganicEdge';
import ConversationEdge from './components/ConversationEdge';
import EnhancedConversationEdge from './components/EnhancedConversationEdge';
import AICommandPalette from './components/AICommandPalette';
import EnhancedExportPreview from './components/EnhancedExportPreview';
import MiniMap from './components/MiniMap';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import DebugPanel from './components/DebugPanel';
import ConsolidateButton from './components/ConsolidateButton';
import ConsolidationPanel from './components/ConsolidationPanel';
import { useUnifiedStore } from '../../store/unifiedStore';
import { useProjectStore } from '../../store/projectStore';
import { useMindGardenStore } from './store';
import { Plus, Download, Map, Keyboard, Layers, Lightbulb, Eye } from 'lucide-react';
import { useSelectionBox, isElementInSelectionBox } from './hooks/useSelectionBox.js';
import { SelectionBox } from './components/SelectionBox.jsx';

// Custom node types - OUTSIDE component to prevent ReactFlow warnings
const nodeTypes = {
  card: NodeCard,
  conversational: ConversationalNode,
};

// Custom edge types - OUTSIDE component to prevent ReactFlow warnings
const edgeTypes = {
  organic: OrganicEdge,
  conversation: ConversationEdge,
  enhanced: EnhancedConversationEdge,
};

const MindGardenInner = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [exportPreviewOpen, setExportPreviewOpen] = useState(false);
  const [consolidationOpen, setConsolidationOpen] = useState(false);
  const [commandPosition, setCommandPosition] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [isRightDragging, setIsRightDragging] = useState(false);
  const [zoomStart, setZoomStart] = useState(null);
  const [initialZoom, setInitialZoom] = useState(1);
  
  // Day 5: Enhanced UI State
  const [miniMapVisible, setMiniMapVisible] = useState(true);
  const [keyboardHelpOpen, setKeyboardHelpOpen] = useState(false);
  const [quickActionMode, setQuickActionMode] = useState(false);
  
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef(null);

  // Unified Store integration
  const { navigateToModule, analyzeCanvasContext } = useUnifiedStore();
  
  // Project Store integration
  const { getCurrentProject } = useProjectStore();
  
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
    syncToUnified,
    exportToCanvas,
    // ENHANCED v5.1: Conversation methods
    createConversationalNode,
    updateConversationalNode,
    createChildNode,
    createSiblingNode,
    focusedNodeId,
    setFocusedNode
  } = useMindGardenStore();

  // Initialize on mount
  useEffect(() => {
    initializeStore();
    // Don't auto-navigate to avoid redirect loop
  }, [initializeStore]);

  // Selection box for drag selection
  const handleSelectionComplete = useCallback((selectionBox) => {
    if (!selectionBox) return;

    console.log('🌱 Selection box:', selectionBox);
    console.log('🌱 Current nodes:', nodes.length);

    // Get ReactFlow viewport
    const viewport = reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 };
    console.log('🌱 Viewport:', viewport);

    // Convert selection box from screen coordinates to ReactFlow world coordinates
    const worldSelectionBox = {
      x: (selectionBox.x - viewport.x) / viewport.zoom,
      y: (selectionBox.y - viewport.y) / viewport.zoom,
      width: selectionBox.width / viewport.zoom,
      height: selectionBox.height / viewport.zoom
    };

    console.log('🌱 World selection box:', worldSelectionBox);

    // Get all nodes that are within the selection box (in world coordinates)
    const selectedNodes = nodes.filter(node => {
      // Node position and dimensions in world coordinates
      const nodeX = node.position.x;
      const nodeY = node.position.y;
      const nodeWidth = node.data?.width || node.width || 200;
      const nodeHeight = node.data?.height || node.height || 100;

      // Check overlap with world selection box
      const nodeRight = nodeX + nodeWidth;
      const nodeBottom = nodeY + nodeHeight;
      const selectionRight = worldSelectionBox.x + worldSelectionBox.width;
      const selectionBottom = worldSelectionBox.y + worldSelectionBox.height;

      const overlaps = !(
        nodeX > selectionRight ||
        nodeRight < worldSelectionBox.x ||
        nodeY > selectionBottom ||
        nodeBottom < worldSelectionBox.y
      );

      console.log(`🌱 Node ${node.id}:`, {
        world: { x: nodeX, y: nodeY, w: nodeWidth, h: nodeHeight },
        worldSelection: worldSelectionBox,
        overlaps
      });

      return overlaps;
    });

    console.log('🌱 Selected nodes:', selectedNodes.map(n => n.id));

    if (selectedNodes.length > 0) {
      // Update nodes selection state
      setNodes(nodes => nodes.map(node => ({
        ...node,
        selected: selectedNodes.some(selected => selected.id === node.id)
      })));
    } else {
      // Clear selection if no nodes found
      setNodes(nodes => nodes.map(node => ({ ...node, selected: false })));
    }
  }, [nodes, setNodes, reactFlowInstance]);

  const { isSelecting, selectionBox } = useSelectionBox(reactFlowWrapper, handleSelectionComplete);

  // Debug: Check if ref is working
  useEffect(() => {
    console.log('🌱 Mind Garden container ref:', reactFlowWrapper.current);
  }, []);
  
  // Check if current project is temporary
  const currentProject = getCurrentProject();
  const isTemporaryProject = currentProject?.isTemporary || false;
  
  // Debug: Log project status
  useEffect(() => {
    console.log('🧠 Mind Garden Project Status:', {
      currentProject: currentProject?.name,
      isTemporary: isTemporaryProject,
      projectType: currentProject?.type,
      nodeCount: nodes.length
    });
  }, [currentProject, isTemporaryProject, nodes.length]);

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
      setNodes((nds) => {
        const updatedNodes = applyNodeChanges(changes, nds);
        
        // Track selections - get all currently selected nodes
        const allSelected = updatedNodes.filter(node => node.selected);
        console.log('🌱 ReactFlow selection changed:', allSelected.map(n => n.id));
        setSelectedNodes(allSelected);
        
        // Update selectedNodeId for single selection
        const singleSelected = allSelected.length === 1 ? allSelected[0].id : null;
        setSelectedNodeId(singleSelected);
        
        return updatedNodes;
      });
    },
    [setNodes]
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
    console.log('🌱 Node clicked:', node.id);
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

      // ENHANCED v5.1: Create conversational node by default
      if (event.shiftKey) {
        // Shift+Double click = Old style card node
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
      } else {
        // Default: Create conversational node
        const nodeId = createConversationalNode(position);
        setFocusedNode(nodeId);
      }
    }
  }, [currentPhase, reactFlowInstance, addNode, createConversationalNode, setFocusedNode]);

  const handleAICommand = useCallback(async (command) => {
    console.log('🌱 AI Command:', command, 'on node:', selectedNodeId);
    
    if (!selectedNodeId) {
      console.warn('🌱 No node selected for AI command');
      setCommandPaletteOpen(false);
      return;
    }
    
    const selectedNode = nodes.find(node => node.id === selectedNodeId);
    if (!selectedNode) {
      console.warn('🌱 Selected node not found');
      setCommandPaletteOpen(false);
      return;
    }
    
    try {
      // Get AI Intelligence Engine from unified store
      const { getIntelligenceEngine } = useUnifiedStore.getState();
      const intelligenceEngine = await getIntelligenceEngine();
      
      if (!intelligenceEngine) {
        console.warn('🤖 AI Intelligence Engine not available');
        setCommandPaletteOpen(false);
        return;
      }
      
      switch (command) {
        case '@expand':
          await handleExpandNode(selectedNode, intelligenceEngine);
          break;
          
        case '@connect':
          await handleSpreadIdeas(selectedNode, intelligenceEngine);
          break;
          
        case '@visual':
        case '@technical':
        case '@narrative':
          await handleTransformNode(selectedNode, command, intelligenceEngine);
          break;
          
        default:
          console.log('🌱 AI Command not implemented yet:', command);
          break;
      }
      
      // Trigger context analysis
      await analyzeCanvasContext();
      
    } catch (error) {
      console.error('🤖 AI command failed:', error);
    }
    
    setCommandPaletteOpen(false);
  }, [selectedNodeId, nodes, analyzeCanvasContext]);
  
  // EXPAND NODE WITH AI
  const handleExpandNode = useCallback(async (node, intelligenceEngine) => {
    console.log('🌱 Expanding node with AI:', node.data.title);
    
    try {
      const expandedIdeas = await intelligenceEngine.transform(
        node.data,
        'mindNode',
        'expandedIdeas',
        { projectType: 'creative project', currentPhase }
      );
      
      if (Array.isArray(expandedIdeas)) {
        // Create new nodes for each expanded idea
        expandedIdeas.forEach((idea, index) => {
          const angle = (index / expandedIdeas.length) * 2 * Math.PI;
          const radius = 200;
          const newPosition = {
            x: node.position.x + Math.cos(angle) * radius,
            y: node.position.y + Math.sin(angle) * radius
          };
          
          const newNode = {
            id: `expanded_${Date.now()}_${index}`,
            type: 'card',
            position: newPosition,
            data: {
              title: idea.title,
              content: idea.content,
              type: 'text',
              phase: node.data.phase,
              aiGenerated: true,
              sourceNode: node.id
            }
          };
          
          addNode(newNode);
          
          // Add edge to connect to original node
          const newEdge = {
            id: `e_${node.id}_${newNode.id}`,
            source: node.id,
            target: newNode.id,
            type: 'organic',
            data: { strength: 1, color: 'rgba(16, 185, 129, 0.5)' }
          };
          
          setEdges(edges => [...edges, newEdge]);
        });
        
        console.log('🌱 Created', expandedIdeas.length, 'expanded nodes');
      }
    } catch (error) {
      console.error('🌱 Expand node failed:', error);
    }
  }, [addNode, setEdges, currentPhase]);
  
  // SPREAD IDEAS FROM NODE
  const handleSpreadIdeas = useCallback(async (node, intelligenceEngine) => {
    console.log('🌱 Spreading ideas from node:', node.data.title);
    
    try {
      const relatedIdeas = await intelligenceEngine.transform(
        node.data,
        'mindNode',
        'spreadIdeas',
        { projectType: 'creative project', currentPhase }
      );
      
      if (Array.isArray(relatedIdeas)) {
        // Create new nodes in a fan pattern
        relatedIdeas.forEach((idea, index) => {
          const angle = -Math.PI/2 + (index / (relatedIdeas.length - 1)) * Math.PI;
          const radius = 250;
          const newPosition = {
            x: node.position.x + Math.cos(angle) * radius,
            y: node.position.y + Math.sin(angle) * radius
          };
          
          const newNode = {
            id: `spread_${Date.now()}_${index}`,
            type: 'card',
            position: newPosition,
            data: {
              title: idea.title,
              content: idea.content,
              type: 'text',
              phase: node.data.phase,
              aiGenerated: true,
              sourceNode: node.id,
              relationship: idea.relationship
            }
          };
          
          addNode(newNode);
          
          // Add edge with consistent styling for content nodes
          const edgeColor = idea.relationship === 'content' 
            ? 'rgba(99, 102, 241, 0.5)' // Indigo for content
            : 'rgba(16, 185, 129, 0.5)'; // Default green
          
          const newEdge = {
            id: `e_${node.id}_${newNode.id}`,
            source: node.id,
            target: newNode.id,
            type: 'organic',
            data: { 
              strength: 1.5, 
              color: edgeColor,
              animated: true 
            }
          };
          
          setEdges(edges => [...edges, newEdge]);
        });
        
        console.log('🌱 Created', relatedIdeas.length, 'related idea nodes');
      }
    } catch (error) {
      console.error('🌱 Spread ideas failed:', error);
    }
  }, [addNode, setEdges, currentPhase]);
  
  // TRANSFORM NODE
  const handleTransformNode = useCallback(async (node, command, intelligenceEngine) => {
    console.log('🌱 Transforming node:', node.data.title, 'with command:', command);
    
    try {
      const transformationType = {
        '@visual': 'visualReferences',
        '@technical': 'technicalBreakdown', 
        '@narrative': 'narrativeStructure'
      }[command];
      
      const transformedContent = await intelligenceEngine.transform(
        node.data,
        'mindNode',
        transformationType,
        { projectType: 'creative project', currentPhase, command }
      );
      
      // Update the current node with enhanced content
      updateNode(node.id, {
        data: {
          ...node.data,
          content: transformedContent,
          aiEnhanced: true,
          transformationType
        }
      });
      
      console.log('🌱 Node transformed successfully');
    } catch (error) {
      console.error('🌱 Transform node failed:', error);
    }
  }, [updateNode, currentPhase]);

  const handleExportToAtelier = useCallback(() => {
    console.log('🌱 DEBUG: selectedNodes in handleExportToAtelier:', selectedNodes);
    if (selectedNodes.length === 0) {
      console.warn('🌱 No nodes selected for export');
      return;
    }
    
    // For temporary projects, create temporary atelier and navigate directly
    if (isTemporaryProject) {
      console.log('🧠 Temporary project export - creating temporary atelier');
      handleTemporaryExport();
    } else {
      // For permanent projects, use existing export preview
      setExportPreviewOpen(true);
    }
  }, [selectedNodes, isTemporaryProject]);
  
  const handleTemporaryExport = useCallback(async () => {
    console.log('🎨 Creating temporary atelier from brainstorm');
    
    try {
      // Export nodes to temporary atelier
      const nodeIds = selectedNodes.map(node => node.id);
      const success = await exportToCanvas(nodeIds);
      
      if (success) {
        // Navigate to Atelier with temporary project
        navigateToModule('canvas', { 
          temporary: true,
          source: 'mind-garden-temporary-export'
        });
        
        console.log('✅ Successfully exported to temporary atelier');
      } else {
        console.warn('⚠️ Temporary export failed');
      }
    } catch (error) {
      console.error('❌ Temporary export error:', error);
    }
  }, [selectedNodes, exportToCanvas, navigateToModule]);

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

  // Keyboard event handler for deletion with debug
  useEffect(() => {
    const handleKeyDown = (event) => {
      console.log('🌱 Key pressed:', event.key, 'selectedNodes:', selectedNodes.length, 'selectedEdgeId:', selectedEdgeId);
      
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Don't prevent default if we're in an input field, UNLESS it's Cmd+Delete (force delete)
        if ((event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') && !event.metaKey && !event.ctrlKey) {
          console.log('🌱 Ignoring delete - in input field (use Cmd/Ctrl+Delete to force)');
          return;
        }
        
        event.preventDefault();
        
        if (selectedEdgeId) {
          console.log('🌱 Deleting edge:', selectedEdgeId);
          setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdgeId));
          setSelectedEdgeId(null);
        } else if (selectedNodes.length > 0) {
          console.log('🌱 Deleting nodes:', selectedNodes.map(n => n.id));
          selectedNodes.forEach(node => {
            removeNode(node.id);
          });
          setSelectedNodeId(null);
          setSelectedNodes([]);
        } else {
          console.log('🌱 Nothing to delete');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedEdgeId, selectedNodes, setEdges, removeNode]);

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
      onMouseDown={(e) => {
        // Only handle right mouse for zoom - let useSelectionBox handle left mouse
        if (e.button === 2) {
          handleMouseDown(e);
        }
      }}
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
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={true}
        minZoom={0.1}
        maxZoom={1}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode="Delete"
        onNodesDelete={(nodesToDelete) => {
          console.log('🌱 ReactFlow onNodesDelete:', nodesToDelete.map(n => n.id));
          nodesToDelete.forEach(node => removeNode(node.id));
        }}
        onEdgesDelete={(edgesToDelete) => {
          console.log('🌱 ReactFlow onEdgesDelete:', edgesToDelete.map(e => e.id));
          setEdges(edges => edges.filter(edge => !edgesToDelete.find(del => del.id === edge.id)));
        }}
      >
        <Background 
          color="rgba(255, 255, 255, 0.02)" 
          gap={32}
          size={2}
        />
      </ReactFlow>

      {/* Selection Box for Drag Selection */}
      {isSelecting && <SelectionBox box={selectionBox} />}

      {/* Enhanced Toolbar - Top Left */}
      <div className="absolute top-4 left-4 z-50">
        <div className="flex items-center space-x-2">
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
          
          
          <button
            onClick={() => setKeyboardHelpOpen(true)}
            className="w-12 h-12 bg-white hover:bg-gray-50 text-gray-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
            title="Keyboard shortcuts (H)"
          >
            <Keyboard className="w-6 h-6" />
          </button>
          
          {quickActionMode && (
            <div className="bg-blue-100 rounded-lg shadow-lg border border-blue-200 px-3 py-2">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Quick Actions</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Temporary Project Badge - Top Left (below toolbar) */}
      {isTemporaryProject && (
        <div className="absolute top-20 left-4 z-50">
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg px-3 py-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Brainstorming Session
            </span>
          </div>
        </div>
      )}

      {/* Export Button - Top Right (always visible) */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={selectedNodes.length > 0 ? handleExportToAtelier : undefined}
          disabled={selectedNodes.length === 0}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors ${
            selectedNodes.length > 0
              ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
          }`}
          title={selectedNodes.length > 0 ? 
            (isTemporaryProject ? "Develop in Creative Atelier" : "Export selected nodes to Atelier") : 
            "Select nodes to export"}
        >
          {isTemporaryProject ? <Eye className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          {isTemporaryProject ? "Develop in Atelier" : "Export to Atelier"}
        </button>
      </div>

      {/* AI Command Palette */}
      <AICommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onCommand={handleAICommand}
        position={commandPosition}
      />

      {/* Enhanced Export Preview Modal */}
      <EnhancedExportPreview
        isOpen={exportPreviewOpen}
        onClose={() => setExportPreviewOpen(false)}
        conversationNodes={selectedNodes}
        onExport={async (exportResult) => {
          console.log('🌱 Exporting conversation to Canvas:', exportResult);
          
          try {
            // Use the Mind Garden store export function we already implemented
            const nodeIds = selectedNodes.map(node => node.id);
            console.log('🌱 Calling exportToCanvas with nodeIds:', nodeIds);
            
            const success = await exportToCanvas(nodeIds);
            
            if (success) {
              // Navigate to Atelier to show results
              navigateToModule('canvas', { 
                showExportedElements: true,
                source: 'mind-garden-export'
              });
              
              console.log('✅ Successfully exported', nodeIds.length, 'nodes to Atelier');
              setExportPreviewOpen(false);
            } else {
              console.warn('⚠️ Export to Atelier failed');
            }
          } catch (error) {
            console.error('❌ Export to Canvas failed:', error);
          }
          
          setExportPreviewOpen(false);
        }}
        topicExtractor={useUnifiedStore.getState().getTopicExtractor?.()}
      />

      {/* Consolidation Components */}
      <ConsolidateButton
        isVisible={isTemporaryProject && nodes.length > 0}
        nodeCount={nodes.length}
        onClick={() => setConsolidationOpen(true)}
      />
      
      <ConsolidationPanel
        isOpen={consolidationOpen}
        onClose={() => setConsolidationOpen(false)}
        nodes={nodes}
        edges={edges}
        tempProjectId={currentProject?.id}
      />

      {/* Export History - Bottom Left */}
      {exportHistory.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-300 max-w-xs space-y-1">
          <div className="font-medium mb-1">📤 Recent Exports</div>
          {exportHistory.slice(-2).map((exp, idx) => (
            <div key={idx}>• {exp.nodeCount} nodes → Atelier ({exp.timestamp})</div>
          ))}
        </div>
      )}




      {/* Day 5: Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={keyboardHelpOpen}
        onClose={() => setKeyboardHelpOpen(false)}
      />
      
      {/* Debug Panel - Shows node count in real-time */}
      <DebugPanel />
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