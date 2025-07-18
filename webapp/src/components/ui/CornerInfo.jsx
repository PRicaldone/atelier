/**
 * Corner Info - Status and sync information
 */

import React from 'react';
import { motion } from 'framer-motion';

const CornerInfo = ({ syncStatus = 'synced' }) => {
  const getSyncColor = () => {
    switch (syncStatus) {
      case 'synced': return '#10B981';
      case 'syncing': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getSyncAnimation = () => {
    switch (syncStatus) {
      case 'syncing':
        return {
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1]
        };
      case 'error':
        return {
          scale: [1, 1.1, 1],
          opacity: [1, 0.3, 1]
        };
      default:
        return {};
    }
  };

  return (
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
          animate={getSyncAnimation()}
          transition={{ 
            duration: 1.5, 
            repeat: syncStatus !== 'synced' ? Infinity : 0 
          }}
        />
        <span>{syncStatus}</span>
      </div>
    </motion.div>
  );
};

export default CornerInfo;