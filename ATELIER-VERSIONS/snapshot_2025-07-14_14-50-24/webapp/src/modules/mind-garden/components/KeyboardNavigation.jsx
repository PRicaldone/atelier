/**
 * Mind Garden v5.1 - Advanced Keyboard Navigation System
 * Day 5: Comprehensive keyboard-driven workflow
 */

import { useEffect, useRef, useCallback } from 'react';
import { useMindGardenStore } from '../store';
import { BRANCH_TYPES } from '../types/conversationTypes';

export const useKeyboardNavigation = (nodeId, isEditing, localState, onUpdate) => {
  const store = useMindGardenStore();
  const keyboardStateRef = useRef({
    selectedNodeId: nodeId,
    navigationMode: 'edit', // 'edit', 'navigate', 'create'
    lastDirection: null,
    quickActionMode: false
  });

  // Advanced keyboard workflow handler
  const handleAdvancedKeyDown = useCallback((e) => {
    const { key, ctrlKey, metaKey, shiftKey, altKey } = e;
    const isModified = ctrlKey || metaKey || shiftKey || altKey;
    
    // Global shortcuts (work regardless of mode)
    if (ctrlKey || metaKey) {
      switch (key) {
        case 'z':
          e.preventDefault();
          store.undo?.();
          return;
        case 'y':
          e.preventDefault();
          store.redo?.();
          return;
        case 'e':
          e.preventDefault();
          store.exportConversationThread?.(nodeId);
          return;
        case 'f':
          e.preventDefault();
          store.focusSearch?.();
          return;
        case 's':
          e.preventDefault();
          store.saveConversation?.();
          return;
      }
    }

    // Quick action mode toggle
    if (key === 'q' && !isEditing) {
      e.preventDefault();
      keyboardStateRef.current.quickActionMode = !keyboardStateRef.current.quickActionMode;
      store.setQuickActionMode?.(keyboardStateRef.current.quickActionMode);
      return;
    }

    // Navigation mode handling
    if (!isEditing) {
      handleNavigationMode(e);
    } else {
      handleEditMode(e);
    }
  }, [nodeId, isEditing, localState, store]);

  // Navigation mode keyboard handling
  const handleNavigationMode = useCallback((e) => {
    const { key, shiftKey, altKey } = e;

    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        e.preventDefault();
        handleNodeNavigation(key, shiftKey, altKey);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (shiftKey) {
          store.editNode?.(nodeId);
        } else {
          store.selectNode?.(nodeId);
          keyboardStateRef.current.navigationMode = 'edit';
        }
        break;
      
      case 'Tab':
        e.preventDefault();
        if (shiftKey) {
          createSiblingNode();
        } else {
          createChildNode();
        }
        break;
      
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        if (shiftKey) {
          store.deleteNodeAndChildren?.(nodeId);
        } else {
          store.deleteNode?.(nodeId);
        }
        break;
      
      case 'c':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          store.copyNode?.(nodeId);
        }
        break;
      
      case 'v':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          store.pasteNode?.(nodeId);
        }
        break;
      
      case 'd':
        e.preventDefault();
        store.duplicateNode?.(nodeId);
        break;
      
      case 'f':
        e.preventDefault();
        store.focusNode?.(nodeId);
        break;
      
      case 'm':
        e.preventDefault();
        store.toggleMiniMap?.();
        break;
      
      case 'h':
        e.preventDefault();
        store.showKeyboardHelp?.();
        break;
      
      // Branch type quick switches
      case '1':
        e.preventDefault();
        setBranchType(BRANCH_TYPES.EXPLORATION);
        break;
      case '2':
        e.preventDefault();
        setBranchType(BRANCH_TYPES.REFINEMENT);
        break;
      case '3':
        e.preventDefault();
        setBranchType(BRANCH_TYPES.IMPLEMENTATION);
        break;
      case '4':
        e.preventDefault();
        setBranchType(BRANCH_TYPES.CRITIQUE);
        break;
    }
  }, [nodeId, store]);

  // Edit mode keyboard handling
  const handleEditMode = useCallback((e) => {
    const { key, shiftKey, ctrlKey, metaKey } = e;

    switch (key) {
      case 'Enter':
        if (!shiftKey && !ctrlKey && !metaKey) {
          e.preventDefault();
          store.generateAIResponse?.(nodeId);
        }
        break;
      
      case 'Tab':
        if (localState === 'complete') {
          e.preventDefault();
          if (shiftKey) {
            createSiblingNode();
          } else {
            createChildNode();
          }
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        store.exitEditMode?.(nodeId);
        keyboardStateRef.current.navigationMode = 'navigate';
        break;
      
      case 'ArrowUp':
      case 'ArrowDown':
        if (ctrlKey || metaKey) {
          e.preventDefault();
          handleNodeNavigation(key, shiftKey, false);
        }
        break;
    }
  }, [nodeId, localState, store]);

  // Smart node navigation
  const handleNodeNavigation = useCallback((direction, shiftKey, altKey) => {
    const currentNode = store.getNode?.(nodeId);
    if (!currentNode) return;

    let targetNodeId = null;

    switch (direction) {
      case 'ArrowUp':
        targetNodeId = findNodeInDirection('up', currentNode, shiftKey, altKey);
        break;
      case 'ArrowDown':
        targetNodeId = findNodeInDirection('down', currentNode, shiftKey, altKey);
        break;
      case 'ArrowLeft':
        targetNodeId = findNodeInDirection('left', currentNode, shiftKey, altKey);
        break;
      case 'ArrowRight':
        targetNodeId = findNodeInDirection('right', currentNode, shiftKey, altKey);
        break;
    }

    if (targetNodeId) {
      keyboardStateRef.current.lastDirection = direction;
      if (shiftKey) {
        store.addToSelection?.(targetNodeId);
      } else {
        store.selectNode?.(targetNodeId);
      }
      
      // Auto-scroll to selected node
      scrollToNode(targetNodeId);
    }
  }, [nodeId, store]);

  // Find node in specific direction
  const findNodeInDirection = useCallback((direction, currentNode, isExtendingSelection, isJumpMode) => {
    const nodes = store.getNodes?.() || [];
    const edges = store.getEdges?.() || [];
    
    if (isJumpMode) {
      // Jump mode - find nodes at conversation thread boundaries
      switch (direction) {
        case 'up':
          return findRootParent(currentNode, nodes, edges);
        case 'down':
          return findDeepestChild(currentNode, nodes, edges);
        case 'left':
          return findPreviousSibling(currentNode, nodes, edges);
        case 'right':
          return findNextSibling(currentNode, nodes, edges);
      }
    } else {
      // Normal mode - find spatially closest node
      return findSpatiallyClosestNode(currentNode, nodes, direction);
    }
  }, [store]);

  // Find spatially closest node
  const findSpatiallyClosestNode = useCallback((currentNode, nodes, direction) => {
    const currentPos = currentNode.position;
    let bestNode = null;
    let bestDistance = Infinity;

    nodes.forEach(node => {
      if (node.id === currentNode.id) return;
      
      const nodePos = node.position;
      const dx = nodePos.x - currentPos.x;
      const dy = nodePos.y - currentPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      let isInDirection = false;
      
      switch (direction) {
        case 'up':
          isInDirection = dy < -50 && Math.abs(dx) < distance;
          break;
        case 'down':
          isInDirection = dy > 50 && Math.abs(dx) < distance;
          break;
        case 'left':
          isInDirection = dx < -50 && Math.abs(dy) < distance;
          break;
        case 'right':
          isInDirection = dx > 50 && Math.abs(dy) < distance;
          break;
      }
      
      if (isInDirection && distance < bestDistance) {
        bestNode = node;
        bestDistance = distance;
      }
    });

    return bestNode?.id;
  }, []);

  // Create child node with enhanced context
  const createChildNode = useCallback(() => {
    const parentChain = store.buildParentChain?.(nodeId) || [];
    const parentNode = store.getNode?.(nodeId);
    
    if (parentNode) {
      store.createConversationalNode?.({
        parentId: nodeId,
        context: {
          parentChain: [...parentChain, nodeId],
          depth: (parentNode.data.context?.depth || 0) + 1,
          branch: BRANCH_TYPES.EXPLORATION,
          conversationFocus: parentNode.data.context?.conversationFocus || 'creative'
        },
        position: calculateChildPosition(parentNode)
      });
    }
  }, [nodeId, store]);

  // Create sibling node with enhanced context
  const createSiblingNode = useCallback(() => {
    const parentNode = store.getNode?.(nodeId);
    if (parentNode) {
      const parentChain = parentNode.data.context?.parentChain || [];
      const parentId = parentChain[parentChain.length - 1] || null;
      
      store.createConversationalNode?.({
        parentId,
        context: {
          parentChain: parentChain,
          depth: parentNode.data.context?.depth || 0,
          branch: BRANCH_TYPES.REFINEMENT,
          conversationFocus: parentNode.data.context?.conversationFocus || 'creative'
        },
        position: calculateSiblingPosition(parentNode)
      });
    }
  }, [nodeId, store]);

  // Calculate optimal child position
  const calculateChildPosition = useCallback((parentNode) => {
    const siblings = store.getNodeChildren?.(parentNode.id) || [];
    const baseX = parentNode.position.x;
    const baseY = parentNode.position.y + 200;
    
    if (siblings.length === 0) {
      return { x: baseX, y: baseY };
    }
    
    // Arrange children in a fan pattern
    const angleStep = Math.PI / Math.max(siblings.length + 1, 3);
    const angle = -Math.PI / 2 + (angleStep * siblings.length);
    const radius = 250;
    
    return {
      x: baseX + Math.cos(angle) * radius,
      y: baseY + Math.sin(angle) * radius
    };
  }, [store]);

  // Calculate optimal sibling position
  const calculateSiblingPosition = useCallback((referenceNode) => {
    const siblings = store.getNodeSiblings?.(referenceNode.id) || [];
    const offsetX = 300;
    const offsetY = siblings.length * 50;
    
    return {
      x: referenceNode.position.x + offsetX,
      y: referenceNode.position.y + offsetY
    };
  }, [store]);

  // Set branch type for current node
  const setBranchType = useCallback((branchType) => {
    store.updateNodeData?.(nodeId, {
      context: {
        ...store.getNode?.(nodeId)?.data.context,
        branch: branchType
      }
    });
  }, [nodeId, store]);

  // Scroll to node smoothly
  const scrollToNode = useCallback((targetNodeId) => {
    const viewport = store.getViewport?.();
    const targetNode = store.getNode?.(targetNodeId);
    
    if (targetNode && viewport) {
      const targetX = -targetNode.position.x + viewport.width / 2;
      const targetY = -targetNode.position.y + viewport.height / 2;
      
      store.setViewport?.({
        x: targetX,
        y: targetY,
        zoom: viewport.zoom
      }, { duration: 300 });
    }
  }, [store]);

  // Conversation thread helpers
  const findRootParent = useCallback((node, nodes, edges) => {
    const parentChain = node.data.context?.parentChain || [];
    return parentChain.length > 0 ? parentChain[0] : null;
  }, []);

  const findDeepestChild = useCallback((node, nodes, edges) => {
    const children = store.getNodeChildren?.(node.id) || [];
    if (children.length === 0) return null;
    
    // Find child with maximum depth
    let deepestChild = children[0];
    let maxDepth = deepestChild.data.context?.depth || 0;
    
    children.forEach(child => {
      const depth = child.data.context?.depth || 0;
      if (depth > maxDepth) {
        deepestChild = child;
        maxDepth = depth;
      }
    });
    
    return deepestChild.id;
  }, [store]);

  const findPreviousSibling = useCallback((node, nodes, edges) => {
    const siblings = store.getNodeSiblings?.(node.id) || [];
    const currentIndex = siblings.findIndex(s => s.id === node.id);
    
    if (currentIndex > 0) {
      return siblings[currentIndex - 1].id;
    }
    
    return null;
  }, [store]);

  const findNextSibling = useCallback((node, nodes, edges) => {
    const siblings = store.getNodeSiblings?.(node.id) || [];
    const currentIndex = siblings.findIndex(s => s.id === node.id);
    
    if (currentIndex >= 0 && currentIndex < siblings.length - 1) {
      return siblings[currentIndex + 1].id;
    }
    
    return null;
  }, [store]);

  return {
    handleAdvancedKeyDown,
    keyboardState: keyboardStateRef.current
  };
};

// Keyboard shortcuts reference
export const KEYBOARD_SHORTCUTS = {
  navigation: {
    'Arrow Keys': 'Navigate between nodes',
    'Shift + Arrow Keys': 'Extend selection',
    'Alt + Arrow Keys': 'Jump to conversation boundaries',
    'Enter': 'Select/Edit node',
    'Shift + Enter': 'Edit node directly',
    'Tab': 'Create child node',
    'Shift + Tab': 'Create sibling node',
    'Escape': 'Exit edit mode',
    'Delete': 'Delete node',
    'Shift + Delete': 'Delete node and children'
  },
  quickActions: {
    'c': 'Copy node',
    'v': 'Paste node',
    'd': 'Duplicate node',
    'f': 'Focus on node',
    'm': 'Toggle mini-map',
    'h': 'Show keyboard help',
    'q': 'Toggle quick action mode'
  },
  branchTypes: {
    '1': 'Set branch to Exploration',
    '2': 'Set branch to Refinement',
    '3': 'Set branch to Implementation',
    '4': 'Set branch to Critique'
  },
  global: {
    'Ctrl/Cmd + Z': 'Undo',
    'Ctrl/Cmd + Y': 'Redo',
    'Ctrl/Cmd + E': 'Export conversation thread',
    'Ctrl/Cmd + F': 'Focus search',
    'Ctrl/Cmd + S': 'Save conversation'
  }
};

export default useKeyboardNavigation;