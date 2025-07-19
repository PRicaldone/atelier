/**
 * Ideas Module - Main Component
 * 
 * Professional Ideas & Commercial Roadmap Module
 * Integrated with Atelier's enterprise architecture
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Filter, 
  Search, 
  MoreVertical, 
  Grid, 
  List, 
  Download,
  Archive,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  Lightbulb,
  Target,
  DollarSign,
  Users,
  Zap,
  TrendingUp
} from 'lucide-react';

import { useIdeasStore } from './store.js';
import { 
  IdeaStatus, 
  IdeaCategory, 
  IdeaPriority,
  StatusColors,
  CategoryColors 
} from './types.js';
import IntelligenceCommandBar from '../../components/IntelligenceCommandBar.jsx';

/**
 * Main Ideas Dashboard Component
 */
export default function Ideas() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIdeas, setSelectedIdeas] = useState(new Set());

  // Store state
  const {
    ideas,
    filters,
    viewMode,
    showArchived,
    loading,
    error,
    stats,
    getFilteredIdeas,
    setFilters,
    clearFilters,
    setViewMode,
    toggleShowArchived,
    addIdea,
    updateIdea,
    deleteIdea,
    exportIdeas,
    clearError
  } = useIdeasStore();

  // Memoized filtered ideas
  const filteredIdeas = useMemo(() => getFilteredIdeas(), [
    ideas, 
    filters, 
    showArchived,
    getFilteredIdeas
  ]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            setShowAddModal(true);
            break;
          case 'f':
            e.preventDefault();
            setShowFilters(!showFilters);
            break;
          case 'e':
            e.preventDefault();
            if (selectedIdeas.size > 0) {
              handleExport('json');
            }
            break;
        }
      }
      
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setShowFilters(false);
        setSelectedIdeas(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showFilters, selectedIdeas]);

  // Handle idea selection
  const toggleIdeaSelection = (ideaId) => {
    const newSelection = new Set(selectedIdeas);
    if (newSelection.has(ideaId)) {
      newSelection.delete(ideaId);
    } else {
      newSelection.add(ideaId);
    }
    setSelectedIdeas(newSelection);
  };

  const selectAllIdeas = () => {
    if (selectedIdeas.size === filteredIdeas.length) {
      setSelectedIdeas(new Set());
    } else {
      setSelectedIdeas(new Set(filteredIdeas.map(idea => idea.id)));
    }
  };

  // Handle export
  const handleExport = (format) => {
    const filteredOnly = selectedIdeas.size === 0;
    exportIdeas(format, filteredOnly);
  };

  // Handle AI command execution
  const handleAICommand = (result) => {
    if (result.action === 'add_idea' && result.data) {
      addIdea(result.data);
    } else if (result.action === 'filter_ideas' && result.filters) {
      setFilters(result.filters);
    }
  };

  return (
    <div className="ideas-module h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ideas & Roadmap</h1>
                <p className="text-sm text-gray-600">
                  Commercial strategy and feature innovation hub
                </p>
              </div>
            </div>

            {/* Stats Preview */}
            <div className="hidden lg:flex items-center gap-6 ml-8">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{stats.total} Total</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">{stats.implementedCount} Implemented</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">{stats.active} Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-4 h-4" />
                Kanban
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${
                showFilters || Object.values(filters).some(f => f.length > 0 || f !== '')
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Idea
            </button>
          </div>
        </div>

        {/* AI Command Bar */}
        <div className="mt-4">
          <IntelligenceCommandBar
            module="ideas"
            onExecute={handleAICommand}
            className="w-full"
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <FiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          showArchived={showArchived}
          onToggleArchived={toggleShowArchived}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading ideas...</p>
            </div>
          </div>
        ) : filteredIdeas.length === 0 ? (
          <EmptyState onAddIdea={() => setShowAddModal(true)} />
        ) : viewMode === 'table' ? (
          <TableView
            ideas={filteredIdeas}
            selectedIdeas={selectedIdeas}
            onToggleSelection={toggleIdeaSelection}
            onSelectAll={selectAllIdeas}
            onUpdateIdea={updateIdea}
            onDeleteIdea={deleteIdea}
          />
        ) : (
          <KanbanView
            ideas={filteredIdeas}
            onUpdateIdea={updateIdea}
            onDeleteIdea={deleteIdea}
          />
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIdeas.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedIdeas.size}
          onExport={handleExport}
          onClearSelection={() => setSelectedIdeas(new Set())}
        />
      )}

      {/* Add Idea Modal */}
      {showAddModal && (
        <AddIdeaModal
          onClose={() => setShowAddModal(false)}
          onAdd={addIdea}
        />
      )}
    </div>
  );
}

/**
 * Filters Panel Component
 */
function FiltersPanel({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  showArchived, 
  onToggleArchived 
}) {
  const hasActiveFilters = Object.values(filters).some(f => 
    Array.isArray(f) ? f.length > 0 : f !== ''
  );

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search ideas..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status[0] || ''}
          onChange={(e) => onFiltersChange({ 
            status: e.target.value ? [e.target.value] : [] 
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {Object.values(IdeaStatus).map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={filters.category[0] || ''}
          onChange={(e) => onFiltersChange({ 
            category: e.target.value ? [e.target.value] : [] 
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {Object.values(IdeaCategory).map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>

        {/* Options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={onToggleArchived}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Show Archived</span>
          </label>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ onAddIdea }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md">
        <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas yet</h3>
        <p className="text-gray-600 mb-6">
          Start building your innovation pipeline by adding your first idea.
        </p>
        <button
          onClick={onAddIdea}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors mx-auto"
        >
          <Plus className="w-4 h-4" />
          Add Your First Idea
        </button>
      </div>
    </div>
  );
}

/**
 * Table View Component
 */
function TableView({ 
  ideas, 
  selectedIdeas, 
  onToggleSelection, 
  onSelectAll, 
  onUpdateIdea, 
  onDeleteIdea 
}) {
  const allSelected = ideas.length > 0 && selectedIdeas.size === ideas.length;
  const someSelected = selectedIdeas.size > 0 && selectedIdeas.size < ideas.length;

  return (
    <div className="overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="w-8 px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                ref={input => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={onSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Author
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {ideas.map((idea) => (
            <IdeaTableRow
              key={idea.id}
              idea={idea}
              isSelected={selectedIdeas.has(idea.id)}
              onToggleSelection={() => onToggleSelection(idea.id)}
              onUpdateIdea={onUpdateIdea}
              onDeleteIdea={onDeleteIdea}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Table Row Component
 */
function IdeaTableRow({ idea, isSelected, onToggleSelection, onUpdateIdea, onDeleteIdea }) {
  const [showMenu, setShowMenu] = useState(false);
  
  const categoryColors = CategoryColors[idea.category] || CategoryColors.misc;
  const statusColors = StatusColors[idea.status] || StatusColors.brainstorming;

  return (
    <tr className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelection}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">{idea.title}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {idea.description}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors.bg} ${categoryColors.text} border ${categoryColors.border}`}>
          {idea.category}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}>
          {idea.status.replace('-', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {idea.priority}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {idea.author}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(idea.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-right text-sm font-medium relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-400 hover:text-gray-600"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
            <div className="py-1">
              <button
                onClick={() => {
                  // Handle edit
                  setShowMenu(false);
                }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Edit Idea
              </button>
              <button
                onClick={() => {
                  onDeleteIdea(idea.id);
                  setShowMenu(false);
                }}
                className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              >
                Archive Idea
              </button>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}

/**
 * Kanban View Component
 */
function KanbanView({ ideas, onUpdateIdea, onDeleteIdea }) {
  // Group ideas by status
  const ideasByStatus = useMemo(() => {
    const groups = {};
    Object.values(IdeaStatus).forEach(status => {
      groups[status] = ideas.filter(idea => idea.status === status);
    });
    return groups;
  }, [ideas]);

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex gap-6 h-full">
        {Object.values(IdeaStatus).map(status => (
          <KanbanColumn
            key={status}
            status={status}
            ideas={ideasByStatus[status]}
            onUpdateIdea={onUpdateIdea}
            onDeleteIdea={onDeleteIdea}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Kanban Column Component
 */
function KanbanColumn({ status, ideas, onUpdateIdea, onDeleteIdea }) {
  const statusColors = StatusColors[status] || StatusColors.brainstorming;
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');

  return (
    <div className="flex-1 min-w-80">
      <div className="mb-4">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${statusColors.bg} border ${statusColors.border}`}>
          <h3 className={`font-medium ${statusColors.text}`}>{statusLabel}</h3>
          <span className={`px-2 py-1 text-xs rounded-full bg-white ${statusColors.text}`}>
            {ideas.length}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {ideas.map(idea => (
          <KanbanCard
            key={idea.id}
            idea={idea}
            onUpdateIdea={onUpdateIdea}
            onDeleteIdea={onDeleteIdea}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Kanban Card Component
 */
function KanbanCard({ idea, onUpdateIdea, onDeleteIdea }) {
  const categoryColors = CategoryColors[idea.category] || CategoryColors.misc;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{idea.title}</h4>
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${categoryColors.bg} ${categoryColors.text} border ${categoryColors.border}`}>
          {idea.category}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{idea.description}</p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{idea.author}</span>
        <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
      </div>
      
      {idea.tags && idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {idea.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Bulk Actions Bar Component
 */
function BulkActionsBar({ selectedCount, onExport, onClearSelection }) {
  return (
    <div className="bg-blue-50 border-t border-blue-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} idea{selectedCount !== 1 ? 's' : ''} selected
          </span>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExport('json')}
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100 rounded"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
            <button
              onClick={() => onExport('csv')}
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100 rounded"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
        
        <button
          onClick={onClearSelection}
          className="text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
}

/**
 * Add Idea Modal Component
 */
function AddIdeaModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: IdeaCategory.MISC,
    priority: IdeaPriority.MEDIUM,
    notes: '',
    tags: '',
    relatedModules: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const ideaData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      author: 'User' // TODO: Get from auth system
    };
    
    onAdd(ideaData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Add New Idea</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief descriptive title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the idea"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(IdeaCategory).map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(IdeaPriority).map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="comma, separated, tags"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Add Idea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}