import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { poeticStatements, getRandomStatement, getRandomStatementExcluding } from '../../constants/poeticStatements';
import { useWelcomeGestures } from '../../hooks/useWelcomeGestures';

/**
 * WelcomePoeticStatement Component
 * 
 * Displays rotating poetic statements at the bottom of the Welcome page.
 * Features:
 * - Random statement selection on mount
 * - "Show another thought" button for manual cycling
 * - Theme-aware styling
 * - EventBus integration for analytics
 * - Accessibility support
 * - Gesture support (click/long-press)
 */

export function WelcomePoeticStatement({ 
  isDarkTheme = false,
  className = "",
  style = {},
  onStatementChange = null,
  enableCycling = true
}) {
  const [currentStatement, setCurrentStatement] = useState(() => getRandomStatement());
  const [lastIndex, setLastIndex] = useState(0);

  // Set initial index
  useEffect(() => {
    const initialIndex = poeticStatements.findIndex(stmt => stmt === currentStatement);
    setLastIndex(initialIndex);
  }, []);

  // Track statement shown (ready for EventBus integration)
  useEffect(() => {
    if (window.__eventBus) {
      window.__eventBus.emit('welcome:statement:shown', {
        text: currentStatement.text,
        type: currentStatement.type,
        context: currentStatement.context,
        timestamp: Date.now(),
        theme: isDarkTheme ? 'dark' : 'light'
      });
    }

    // Optional callback for parent component
    if (onStatementChange) {
      onStatementChange(currentStatement);
    }
  }, [currentStatement, isDarkTheme, onStatementChange]);

  // Show another statement
  const showAnother = () => {
    const newStatement = getRandomStatementExcluding(lastIndex);
    const newIndex = poeticStatements.findIndex(stmt => stmt === newStatement);
    
    setCurrentStatement(newStatement);
    setLastIndex(newIndex);

    // Track statement change
    if (window.__eventBus) {
      window.__eventBus.emit('welcome:statement:changed', {
        prevIndex: lastIndex,
        newIndex: newIndex,
        prevText: poeticStatements[lastIndex]?.text,
        newText: newStatement.text,
        type: newStatement.type,
        context: newStatement.context,
        timestamp: Date.now(),
        theme: isDarkTheme ? 'dark' : 'light',
        trigger: 'manual'
      });
    }
  };

  // Enhanced gesture support
  const gestureHandlers = useWelcomeGestures({
    onLongPress: () => {
      if (enableCycling) {
        showAnother();
        
        // Track gesture interaction
        if (window.__eventBus) {
          window.__eventBus.emit('welcome:statement:gesture', {
            gesture: 'longPress',
            text: currentStatement.text,
            timestamp: Date.now()
          });
        }
      }
    },
    onDoubleClick: () => {
      if (enableCycling) {
        showAnother();
        
        // Track gesture interaction
        if (window.__eventBus) {
          window.__eventBus.emit('welcome:statement:gesture', {
            gesture: 'doubleClick',
            text: currentStatement.text,
            timestamp: Date.now()
          });
        }
      }
    },
    longPressDelay: 800, // Slightly longer for poetry
    doubleTapDelay: 300
  });

  return (
    <motion.div
      className={`welcome-poetic-statement ${className}`}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: '8%',
        textAlign: 'center',
        pointerEvents: 'auto',
        zIndex: 5,
        ...style
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 1.2 }}
      aria-live="polite"
      aria-label="Poetic inspiration"
      {...gestureHandlers}
    >
      {/* Main Statement */}
      <motion.p
        key={currentStatement.text} // Re-animate on statement change
        style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '18px',
          color: isDarkTheme ? 'rgba(247, 247, 248, 0.4)' : 'rgba(26, 26, 26, 0.4)',
          opacity: 0.8,
          letterSpacing: '0.02em',
          lineHeight: 1.6,
          maxWidth: '80%',
          margin: '0 auto',
          padding: '0 20px'
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {currentStatement.text}
      </motion.p>

      {/* Show Another Button - Only if cycling enabled */}
      {enableCycling && (
        <motion.button
          onClick={showAnother}
          style={{
            marginTop: '16px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            color: isDarkTheme ? 'rgba(156, 163, 175, 0.6)' : 'rgba(102, 102, 102, 0.6)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            transition: 'all 0.3s ease',
            padding: '8px 16px',
            borderRadius: '6px'
          }}
          whileHover={{ 
            scale: 1.05,
            color: isDarkTheme ? 'rgba(156, 163, 175, 0.8)' : 'rgba(102, 102, 102, 0.8)'
          }}
          whileTap={{ scale: 0.95 }}
          aria-label="Show another poetic thought"
        >
          show another thought
        </motion.button>
      )}

      {/* Statement Type Indicator (subtle) */}
      <div
        style={{
          position: 'absolute',
          bottom: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '8px',
          fontFamily: 'JetBrains Mono, monospace',
          color: isDarkTheme ? 'rgba(107, 114, 128, 0.3)' : 'rgba(153, 153, 153, 0.3)',
          pointerEvents: 'none'
        }}
      >
        {currentStatement.type}
      </div>
    </motion.div>
  );
}

// Default export for easier importing
export default WelcomePoeticStatement;