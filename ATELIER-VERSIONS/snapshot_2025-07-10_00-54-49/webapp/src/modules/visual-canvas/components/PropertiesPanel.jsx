import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from '../store.js';
import { ELEMENT_TYPES } from '../types.js';
import { 
  X, 
  Palette, 
  Type, 
  Image, 
  Link, 
  Brain,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RotateCw,
  Folder
} from 'lucide-react';

export const PropertiesPanel = () => {
  const { 
    selectedIds, 
    getSelectedElements, 
    updateElement, 
    clearSelection,
    bringToFront,
    sendToBack
  } = useCanvasStore();

  const selectedElements = getSelectedElements();
  const isVisible = selectedIds.length > 0;
  const element = selectedElements[0]; // Focus on first selected element

  if (!isVisible || !element) return null;

  const handlePropertyChange = (property, value) => {
    selectedIds.forEach(id => {
      const currentElement = useCanvasStore.getState().getElementById(id);
      if (currentElement) {
        if (property.includes('.')) {
          // Nested property (e.g., 'data.backgroundColor')
          const [parent, child] = property.split('.');
          updateElement(id, {
            [parent]: {
              ...currentElement[parent],
              [child]: value
            }
          });
        } else {
          updateElement(id, { [property]: value });
        }
      }
    });
  };

  const renderNoteProperties = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
        <Type size={16} className="mr-2" />
        Note Properties
      </h4>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Background Color
          </label>
          <input
            type="color"
            value={element.data.backgroundColor || '#fef3c7'}
            onChange={(e) => handlePropertyChange('data.backgroundColor', e.target.value)}
            className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Border Color
          </label>
          <input
            type="color"
            value={element.data.borderColor || '#f59e0b'}
            onChange={(e) => handlePropertyChange('data.borderColor', e.target.value)}
            className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Text Color
          </label>
          <input
            type="color"
            value={element.data.color || '#1f2937'}
            onChange={(e) => handlePropertyChange('data.color', e.target.value)}
            className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Font Size
          </label>
          <input
            type="range"
            min="10"
            max="24"
            value={element.data.fontSize || 14}
            onChange={(e) => handlePropertyChange('data.fontSize', parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">{element.data.fontSize || 14}px</span>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Text Align
          </label>
          <select
            value={element.data.textAlign || 'left'}
            onChange={(e) => handlePropertyChange('data.textAlign', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderImageProperties = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
        <Image size={16} className="mr-2" />
        Image Properties
      </h4>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Object Fit
          </label>
          <select
            value={element.data.objectFit || 'cover'}
            onChange={(e) => handlePropertyChange('data.objectFit', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded"
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="fill">Fill</option>
            <option value="none">None</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Border Radius
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={element.data.borderRadius || 8}
            onChange={(e) => handlePropertyChange('data.borderRadius', parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">{element.data.borderRadius || 8}px</span>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Opacity
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={element.data.opacity || 1}
            onChange={(e) => handlePropertyChange('data.opacity', parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round((element.data.opacity || 1) * 100)}%</span>
        </div>
      </div>
    </div>
  );

  const renderLinkProperties = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
        <Link size={16} className="mr-2" />
        Link Properties
      </h4>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Title
          </label>
          <input
            type="text"
            value={element.data.title || ''}
            onChange={(e) => handlePropertyChange('data.title', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded"
            placeholder="Link title"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Description
          </label>
          <textarea
            value={element.data.description || ''}
            onChange={(e) => handlePropertyChange('data.description', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded h-16 resize-none"
            placeholder="Link description"
          />
        </div>
        
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={element.data.preview || false}
              onChange={(e) => handlePropertyChange('data.preview', e.target.checked)}
              className="rounded"
            />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Show preview</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAIProperties = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
        <Brain size={16} className="mr-2" />
        AI Properties
      </h4>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Model
          </label>
          <select
            value={element.data.model || 'gpt-4'}
            onChange={(e) => handlePropertyChange('data.model', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded"
          >
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="claude-3">Claude 3</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Temperature
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={element.data.temperature || 0.7}
            onChange={(e) => handlePropertyChange('data.temperature', parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">{element.data.temperature || 0.7}</span>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Status
          </label>
          <span className={`text-xs px-2 py-1 rounded-full ${
            element.data.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
            element.data.status === 'processing' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
            element.data.status === 'error' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
            'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}>
            {element.data.status || 'idle'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderBoardProperties = () => {
    // Milanote color palette
    const milanoteColors = [
      { name: 'Gray', value: '#F5F5F5' },
      { name: 'Blue', value: '#E3F2FD' },
      { name: 'Purple', value: '#F3E5F5' },
      { name: 'Green', value: '#E8F5E9' },
      { name: 'Yellow', value: '#FFF9C4' },
      { name: 'Coral', value: '#FFE0B2' },
      { name: 'Pink', value: '#FCE4EC' },
      { name: 'Cyan', value: '#E0F7FA' },
      { name: 'Orange', value: '#FFF3E0' },
      { name: 'Teal', value: '#E0F2F1' }
    ];

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
          <Folder size={16} className="mr-2" />
          Board Properties
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Title
            </label>
            <input
              type="text"
              value={element.data.title || ''}
              onChange={(e) => handlePropertyChange('data.title', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded"
              placeholder="Board title"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Description
            </label>
            <textarea
              value={element.data.description || ''}
              onChange={(e) => handlePropertyChange('data.description', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded h-20 resize-none"
              placeholder="Board description..."
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Background Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {milanoteColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handlePropertyChange('data.backgroundColor', color.value)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all dark:border-gray-600 ${
                    element.data.backgroundColor === color.value 
                      ? 'border-blue-500 scale-110' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Elements Count
            </label>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {element.data.elements?.length || 0} items
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderElementSpecificProperties = () => {
    switch (element.type) {
      case ELEMENT_TYPES.BOARD:
        return renderBoardProperties();
      case ELEMENT_TYPES.NOTE:
        return renderNoteProperties();
      case ELEMENT_TYPES.IMAGE:
        return renderImageProperties();
      case ELEMENT_TYPES.LINK:
        return renderLinkProperties();
      case ELEMENT_TYPES.AI:
        return renderAIProperties();
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="fixed top-20 bottom-4 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden flex flex-col"
        style={{ right: '336px' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Properties
              {selectedIds.length > 1 && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">
                  ({selectedIds.length} selected)
                </span>
              )}
            </h3>
            <button
              onClick={clearSelection}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 capitalize">
            {element.type} • {element.id.split('_')[0]}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* General Properties (not for boards) */}
            {element.type !== ELEMENT_TYPES.BOARD && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">General</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Width
                    </label>
                    <input
                      type="number"
                      value={element.size.width}
                      onChange={(e) => handlePropertyChange('size.width', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded"
                      min="50"
                      max="800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Height
                    </label>
                    <input
                      type="number"
                      value={element.size.height}
                      onChange={(e) => handlePropertyChange('size.height', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded"
                      min="50"
                      max="800"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      X Position
                    </label>
                    <input
                      type="number"
                      value={Math.round(element.position.x)}
                      onChange={(e) => handlePropertyChange('position.x', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Y Position
                    </label>
                    <input
                      type="number"
                      value={Math.round(element.position.y)}
                      onChange={(e) => handlePropertyChange('position.y', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Rotation
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={element.rotation || 0}
                    onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{element.rotation || 0}°</span>
                </div>
              </div>
            )}

            {/* Element Specific Properties */}
            {renderElementSpecificProperties()}

            {/* Actions */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Actions</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => selectedIds.forEach(id => bringToFront(id))}
                  className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-200 rounded transition-colors"
                >
                  Bring Forward
                </button>
                <button
                  onClick={() => selectedIds.forEach(id => sendToBack(id))}
                  className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-200 rounded transition-colors"
                >
                  Send Back
                </button>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePropertyChange('locked', !element.locked)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs rounded transition-colors ${
                    element.locked 
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {element.locked ? <Lock size={12} /> : <Unlock size={12} />}
                  <span>{element.locked ? 'Unlock' : 'Lock'}</span>
                </button>
                
                <button
                  onClick={() => handlePropertyChange('visible', !element.visible)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs rounded transition-colors ${
                    element.visible 
                      ? 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200' 
                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/30'
                  }`}
                >
                  {element.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{element.visible ? 'Hide' : 'Show'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};