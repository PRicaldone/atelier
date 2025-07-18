/**
 * Sidebar Toggle - Collapsed sidebar toggle button
 */

import React from 'react';
import { motion } from 'framer-motion';

const SidebarToggle = ({ onToggle }) => {
  const handleClick = () => {
    // Future: implement sidebar toggle
    console.log('Sidebar toggle clicked');
    onToggle?.();
  };

  return (
    <motion.div
      className="sidebar-toggle"
      onClick={handleClick}
      whileHover={{ 
        scale: 1.05,
        x: 2
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M5 3l5 5l-5 5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    </motion.div>
  );
};

export default SidebarToggle;