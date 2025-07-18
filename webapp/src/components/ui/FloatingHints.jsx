/**
 * Floating Hints - Contextual help and status indicators
 * Shows gesture hints and system status
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingHints = () => {
  const [currentHint, setCurrentHint] = useState(0);
  const [showHints, setShowHints] = useState(true);
  const [syncStatus, setSyncStatus] = useState('synced');

  const hints = [
    'Double-click to add • Long press for AI',
    'Drag elements to reposition • Right-click for options',
    'Use AI shortcuts: /board, /idea, /ref, /brief',
    'Press Escape to close overlays'
  ];

  // Cycle through hints
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHint((prev) => (prev + 1) % hints.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [hints.length]);

  // Auto-hide hints after initial period
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHints(false);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  // Listen for system events to show hints
  useEffect(() => {
    const handleSystemEvent = (event) => {
      if (event.type === 'canvas:element:created' || 
          event.type === 'ai:prompt:opened') {
        setShowHints(true);
        setTimeout(() => setShowHints(false), 5000);
      }
    };

    if (window.__eventBus) {
      window.__eventBus.on('*', handleSystemEvent);
      return () => window.__eventBus.off('*', handleSystemEvent);
    }
  }, []);

  // Mock sync status (integrate with real sync system)
  useEffect(() => {
    const statuses = ['synced', 'syncing', 'error'];
    const interval = setInterval(() => {
      setSyncStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getSyncColor = () => {
    switch (syncStatus) {
      case 'synced': return '#10B981';
      case 'syncing': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <>
      {/* Floating Hints */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            className="hint"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.span
              key={currentHint}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {hints[currentHint]}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner Status Info */}
      <motion.div
        className="corner-info"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="info-item">
          <span>100%</span>
        </div>
        <div className="info-item">
          <motion.span
            className="info-dot"
            style={{ backgroundColor: getSyncColor() }}
            animate={{ 
              scale: syncStatus === 'syncing' ? [1, 1.2, 1] : 1,
              opacity: syncStatus === 'error' ? [1, 0.3, 1] : 1
            }}
            transition={{ 
              duration: 1.5, 
              repeat: syncStatus !== 'synced' ? Infinity : 0 
            }}
          />
          <span>{syncStatus}</span>
        </div>
      </motion.div>

      {/* Keyboard Shortcuts Help */}
      <motion.div
        className="keyboard-hints"
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '24px',
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--text-tertiary)',
          opacity: 0.7
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <div>⌘K: Command palette</div>
        <div>⌘P: Projects</div>
        <div>ESC: Close overlays</div>
      </motion.div>
    </>
  );
};

export default FloatingHints;