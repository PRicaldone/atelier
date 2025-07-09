import { motion } from 'framer-motion';
import { useCanvasStore } from '../store.js';
import { ELEMENT_TYPES } from '../types.js';
import { 
  StickyNote, 
  Image, 
  Link, 
  Brain, 
  Grid3x3, 
  ZoomIn, 
  ZoomOut, 
  Move3d,
  RotateCcw,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Target,
  Download,
  Layout,
  Plus
} from 'lucide-react';

export const CanvasToolbar = () => {
  const {
    addElement,
    viewport,
    settings,
    selectedIds,
    zoomIn,
    zoomOut,
    resetZoom,
    centerViewport,
    toggleSetting,
    copySelected,
    pasteElements,
    deleteSelected,
    clearCanvas,
    getSelectedElements
  } = useCanvasStore();

  const handleAddElement = (type) => {
    // Calculate actual viewport dimensions excluding navbar and sidebar
    const navbarHeight = 64;
    const sidebarWidth = 240;
    
    // Get actual canvas dimensions
    const canvasWidth = window.innerWidth - sidebarWidth;
    const canvasHeight = window.innerHeight - navbarHeight;
    
    // Calculate center position in canvas coordinates
    const viewportCenterX = canvasWidth / 2;
    const viewportCenterY = canvasHeight / 2;
    
    // Convert to world coordinates considering pan and zoom
    const worldX = (viewportCenterX - viewport.x) / viewport.zoom;
    const worldY = (viewportCenterY - viewport.y) / viewport.zoom;
    
    // Create element at calculated position
    addElement(type, { x: worldX, y: worldY });
  };

  const exportCanvas = () => {
    // Simple export functionality - could be enhanced
    const canvasData = {
      elements: useCanvasStore.getState().elements,
      viewport: viewport,
      settings: settings,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(canvasData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `atelier-canvas-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const selectedElements = getSelectedElements();
  const hasSelection = selectedIds.length > 0;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-6">
          {/* Element creation tools */}
          <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Add</span>
            
            <button
              onClick={() => handleAddElement(ELEMENT_TYPES.BOARD)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group relative"
              title="Add Board"
            >
              <Layout size={20} />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Board
              </span>
            </button>
            
            <button
              onClick={() => handleAddElement(ELEMENT_TYPES.NOTE)}
              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors group relative"
              title="Add Note"
            >
              <StickyNote size={20} />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Note
              </span>
            </button>
            
            <button
              onClick={() => handleAddElement(ELEMENT_TYPES.IMAGE)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors group relative"
              title="Add Image"
            >
              <Image size={20} />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Image
              </span>
            </button>
            
            <button
              onClick={() => handleAddElement(ELEMENT_TYPES.LINK)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group relative"
              title="Add Link"
            >
              <Link size={20} />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Link
              </span>
            </button>
            
            <button
              onClick={() => handleAddElement(ELEMENT_TYPES.AI)}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group relative"
              title="Add AI Assistant"
            >
              <Brain size={20} />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                AI Assistant
              </span>
            </button>
          </div>

          {/* View controls */}
          <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">View</span>
            
            <button
              onClick={zoomOut}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            
            <span className="text-xs font-mono text-gray-600 min-w-[3rem] text-center">
              {Math.round(viewport.zoom * 100)}%
            </span>
            
            <button
              onClick={zoomIn}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
            
            <button
              onClick={resetZoom}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw size={18} />
            </button>
            
            <button
              onClick={centerViewport}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Center View"
            >
              <Target size={18} />
            </button>
          </div>

          {/* Canvas settings */}
          <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Canvas</span>
            
            <button
              onClick={() => toggleSetting('gridVisible')}
              className={`p-2 rounded-lg transition-colors ${
                settings.gridVisible 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="Toggle Grid"
            >
              <Grid3x3 size={18} />
            </button>
            
            <button
              onClick={() => toggleSetting('snapToGrid')}
              className={`p-2 rounded-lg transition-colors ${
                settings.snapToGrid 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="Snap to Grid"
            >
              <Move3d size={18} />
            </button>
          </div>

          {/* Selection actions */}
          <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Edit {hasSelection && `(${selectedIds.length})`}
            </span>
            
            <button
              onClick={copySelected}
              disabled={!hasSelection}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy Selected"
            >
              <Copy size={18} />
            </button>
            
            <button
              onClick={() => pasteElements()}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Paste"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              </svg>
            </button>
            
            <button
              onClick={deleteSelected}
              disabled={!hasSelection}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete Selected"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Utility actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={exportCanvas}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Export Canvas"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Selection info */}
        {hasSelection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-gray-200"
          >
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                Selected: {selectedIds.length} element{selectedIds.length !== 1 ? 's' : ''}
              </span>
              <div className="flex space-x-4">
                {selectedElements.map(el => (
                  <span key={el.id} className="capitalize">
                    {el.type}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};