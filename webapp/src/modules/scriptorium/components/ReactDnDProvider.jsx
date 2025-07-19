/**
 * React DnD Provider for Scriptorium Canvas
 * Enterprise-grade drag & drop system
 */

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export const ReactDnDProvider = ({ children }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  );
};

export default ReactDnDProvider;