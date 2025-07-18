/**
 * Header - Floating navigation header
 * Features: Playfair logo, JetBrains nav, theme toggle, user menu
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { useUnifiedStore } from '../../store/unifiedStore';

const Header = ({ onOpenProjectSelector }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentModule, navigateToModule } = useUnifiedStore();

  const navItems = [
    { label: '[canvas]', path: '/scriptorium', module: 'scriptorium' },
    { label: '[start]', path: '/start', module: 'project-start' },
    { label: '[tracker]', path: '/tracker', module: 'projects' },
    { label: '[mind]', path: '/mind-garden', module: 'mind-garden' },
    { label: '[orchestra]', path: '/orchestra', module: 'orchestra' },
    { label: '[ideas]', path: '/ideas', module: 'ideas' }
  ];

  const handleNavClick = (item) => {
    if (item.module) {
      navigateToModule(item.module);
    } else {
      navigate(item.path);
    }
  };

  const isActive = (item) => {
    return location.pathname === item.path || currentModule === item.module;
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">Atelier</div>
        
        <nav className="nav-minimal">
          {navItems.map((item, index) => (
            <div
              key={index}
              className={`nav-item ${isActive(item) ? 'active' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              {item.label}
            </div>
          ))}
          
          <div className="nav-separator">|</div>
          
          {/* User Menu */}
          <div 
            className="nav-user"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 15c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          
          {/* Theme Toggle */}
          <div className="theme-toggle" onClick={toggleTheme}>
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 18 18" 
              fill="none" 
              className="theme-icon-light"
              style={{ display: theme === 'dark' ? 'none' : 'block' }}
            >
              <circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.5 3.5l1.5 1.5M13 13l1.5 1.5M14.5 3.5l-1.5 1.5M5 13L3.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 18 18" 
              fill="none" 
              className="theme-icon-dark"
              style={{ display: theme === 'dark' ? 'block' : 'none' }}
            >
              <path d="M16 10c-.5 3.5-3.5 6-7 6-4 0-7.5-3.5-7.5-7.5S5 1 9 1c.5 0 1 .1 1.5.2-1 1-1.5 2.4-1.5 3.8 0 3 2.5 5.5 5.5 5.5.2 0 .3 0 .5-.1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
        </nav>
      </div>
      
      {/* User Dropdown */}
      {showUserDropdown && (
        <div className="user-dropdown active">
          <div className="dropdown-item" onClick={onOpenProjectSelector}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>[projects]</span>
          </div>
          <div className="dropdown-item" onClick={() => navigate('/monitoring')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 7h2v4H7z" fill="currentColor"/>
              <circle cx="8" cy="5" r="0.5" fill="currentColor"/>
            </svg>
            <span>[monitoring]</span>
          </div>
          <div className="dropdown-separator"></div>
          <div className="dropdown-item" onClick={() => navigate('/ai-transparency')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2L2 8l4 6M10 2l4 6-4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>[ai status]</span>
          </div>
          <div className="dropdown-separator"></div>
          <div className="dropdown-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 8v6H2V2h6M8 1h6v6M14 1L7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>[logout]</span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;