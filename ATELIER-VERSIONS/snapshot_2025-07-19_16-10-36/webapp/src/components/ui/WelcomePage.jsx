import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import WelcomePoeticStatement from './WelcomePoeticStatement';
import { getWelcomeAnalytics } from '../../utils/welcomeAnalytics';

/**
 * Enhanced Atelier Welcome Page with Poetic Statements
 * 
 * Features:
 * - Three floating module portals (Mind Garden, Scriptorium, Orchestra)
 * - Interactive AI prompt for feature discovery
 * - Rotating poetic statements at bottom
 * - Theme switching (light/dark)
 * - Organic animations and micro-interactions
 * - Mobile-responsive design
 * - EventBus integration ready
 */

const WelcomePage = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [hoveredModule, setHoveredModule] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [promptActive, setPromptActive] = useState(false);
  const [promptValue, setPromptValue] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const canvasRef = useRef(null);
  const floatIntervals = useRef({});
  const promptRef = useRef(null);
  const fadeTimeout = useRef(null);

  // Check if user has projects (in produzione da Supabase)
  const hasProjects = false; // Simulated - set to true to hide prompt

  // Module data with organic positions
  const modules = {
    mindGarden: {
      name: 'Mind Garden',
      hint: 'idee e brainstorming',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="1.5" className="module-icon-garden">
          <path d="M12 2v20M12 8c-3 0-5-2-5-5 0 3-2 5-5 5M12 8c3 0 5-2 5-5 0 3 2 5 5 5M12 14c-2 0-3.5-1.5-3.5-3.5 0 2-1.5 3.5-3.5 3.5M12 14c2 0 3.5-1.5 3.5-3.5 0 2 1.5 3.5 3.5 3.5" />
        </svg>
      ),
      position: { 
        mobile: { x: '20%', y: '45%' },
        desktop: { x: 'max(25%, calc(50% - 450px))', y: '45%' }
      },
      color: '#047857',
      projects: [
        { id: 1, title: 'Brand Evolution', preview: '🌿' },
        { id: 2, title: 'NFT Concepts', preview: '🌱' }
      ]
    },
    scriptorium: {
      name: 'Scriptorium',
      hint: 'canvas principale',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="1.5" className="module-icon-scriptorium">
          <path d="M17 3l4 4L7.5 20.5 2 22l1.5-5.5L17 3zM15 5l4 4" />
          <path d="M9.5 14.5L7 12" />
        </svg>
      ),
      position: { 
        mobile: { x: '50%', y: '50%' },
        desktop: { x: '50%', y: '50%' }
      },
      color: '#1E40AF',
      projects: [
        { id: 3, title: 'Particle System', preview: '✨' },
        { id: 4, title: 'VFX Pipeline', preview: '🎬' },
        { id: 5, title: 'Houdini Tests', preview: '💫' }
      ]
    },
    orchestra: {
      name: 'Orchestra', 
      hint: 'promozione',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7C2D12" strokeWidth="1.5" className="module-icon-orchestra">
          <path d="M9 2v17.5A2.5 2.5 0 1 1 5 18V6l4-4z" />
          <path d="M20 2v17.5a2.5 2.5 0 1 1-4-1.5V6l4-4z" />
          <line x1="9" y1="6" x2="20" y2="6" />
          <line x1="9" y1="10" x2="20" y2="10" />
        </svg>
      ),
      position: { 
        mobile: { x: '80%', y: '45%' },
        desktop: { x: 'min(75%, calc(50% + 450px))', y: '45%' }
      },
      color: '#7C2D12',
      projects: [
        { id: 6, title: 'Twitter Campaign', preview: '📢' }
      ]
    }
  };

  // Detect if desktop
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize analytics
  useEffect(() => {
    const analytics = getWelcomeAnalytics();
    
    // Track page load
    if (window.__eventBus) {
      window.__eventBus.emit('welcome:page:loaded', {
        timestamp: Date.now(),
        hasProjects: hasProjects,
        theme: isDarkTheme ? 'dark' : 'light',
        viewport: isDesktop ? 'desktop' : 'mobile'
      });
    }

    // Cleanup analytics on unmount
    return () => {
      const summary = analytics.getSessionSummary();
      if (window.__eventBus) {
        window.__eventBus.emit('welcome:session:ended', {
          timestamp: Date.now(),
          duration: summary.duration,
          interactions: summary.interactions
        });
      }
    };
  }, [hasProjects, isDarkTheme, isDesktop]);

  // Gentle floating animation with varied speeds
  useEffect(() => {
    Object.keys(modules).forEach((key, index) => {
      const startDelay = index * 1500;
      setTimeout(() => {
        floatIntervals.current[key] = setInterval(() => {
          const el = document.getElementById(`module-${key}`);
          if (el) {
            const time = Date.now() / 1000;
            const speedY = 0.3 + (index * 0.1);
            const speedX = 0.2 + (index * 0.05);
            const offsetY = Math.sin(time * speedY + index) * 6;
            const offsetX = Math.cos(time * speedX + index) * 4;
            el.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
          }
        }, 30);
      }, startDelay);
    });

    return () => {
      Object.values(floatIntervals.current).forEach(interval => clearInterval(interval));
    };
  }, []);

  // Focus on prompt when activated
  useEffect(() => {
    if (promptActive && promptRef.current) {
      promptRef.current.focus();
    }
  }, [promptActive]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (fadeTimeout.current) {
        clearTimeout(fadeTimeout.current);
      }
    };
  }, []);

  // Handle escape key for AI response
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && aiResponse) {
        setAiResponse(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aiResponse]);

  // Theme integration with EventBus
  const handleThemeToggle = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    
    // EventBus tracking
    if (window.__eventBus) {
      window.__eventBus.emit('welcome:theme:changed', {
        theme: newTheme ? 'dark' : 'light',
        timestamp: Date.now()
      });
    }
  };

  // Handle module entry with EventBus tracking
  const handleModuleEnter = (moduleKey, moduleName) => {
    if (window.__eventBus) {
      window.__eventBus.emit('welcome:module:entered', {
        module: moduleKey,
        moduleName: moduleName,
        timestamp: Date.now(),
        hasProjects: modules[moduleKey].projects.length > 0
      });
    }
    
    // Navigate to module (ready for router integration)
    console.log(`Navigating to ${moduleKey}`);
  };

  // Handle prompt submission
  const handlePromptSubmit = (e) => {
    e.preventDefault();
    const query = promptValue.toLowerCase();
    
    // EventBus tracking
    if (window.__eventBus) {
      window.__eventBus.emit('welcome:prompt:submitted', {
        query: query,
        timestamp: Date.now()
      });
    }
    
    // Hide input
    setPromptActive(false);
    
    // Show AI response based on input - FEATURE SHOWCASE
    let response = {
      title: '',
      features: [],
      primaryAction: null
    };
    
    if (query.includes('nft') || query.includes('crypto')) {
      response = {
        title: 'Per il tuo progetto NFT, Atelier offre:',
        features: [
          { 
            module: 'Mind Garden', 
            icon: '🌱',
            capabilities: [
              'AI genera moodboard da prompt testuali',
              'Analisi trend real-time da OpenSea',
              'Smart-tagging automatico dei riferimenti'
            ]
          },
          { 
            module: 'Scriptorium', 
            icon: '📜',
            capabilities: [
              'Canvas infinito con layer e versioning',
              'Export ottimizzato per IPFS',
              'Metadata generator con rarity traits'
            ]
          },
          { 
            module: 'Orchestra', 
            icon: '🎭',
            capabilities: [
              'Thread Twitter con preview live',
              'Scheduling cross-platform automatico',
              'Analytics e sentiment analysis'
            ]
          }
        ],
        primaryAction: { text: 'inizia con Mind Garden', module: 'mindGarden' }
      };
    } else if (query.includes('video') || query.includes('vfx') || query.includes('houdini')) {
      response = {
        title: 'Per i tuoi progetti VFX, Atelier integra:',
        features: [
          { 
            module: 'Mind Garden', 
            icon: '🌱',
            capabilities: [
              'Reference board con video preview',
              'Shot breakdown automatico da script',
              'Libreria asset 3D con tagging AI'
            ]
          },
          { 
            module: 'Scriptorium', 
            icon: '📜',
            capabilities: [
              'Timeline progetti Houdini/Nuke',
              'Version control per file .hip/.nk',
              'Render farm monitoring integrato'
            ]
          },
          { 
            module: 'Orchestra', 
            icon: '🎭',
            capabilities: [
              'Showreel generator con capitoli',
              'Making-of automatico dai WIP',
              'Publish diretto su Vimeo/ArtStation'
            ]
          }
        ],
        primaryAction: { text: 'apri Scriptorium', module: 'scriptorium' }
      };
    } else {
      response = {
        title: 'Atelier trasforma il tuo workflow creativo:',
        features: [
          { 
            module: 'Mind Garden', 
            icon: '🌱',
            capabilities: [
              'Cattura idee con voice-to-board',
              'Web clipper con auto-categorization',
              'Collaborative boards in real-time'
            ]
          },
          { 
            module: 'Scriptorium', 
            icon: '📜',
            capabilities: [
              'Workspace infiniti e navigabili',
              'File versioning automatico',
              'Plugin ecosystem (Figma, Adobe, Blender)'
            ]
          },
          { 
            module: 'Orchestra', 
            icon: '🎭',
            capabilities: [
              'Publishing workflow automation',
              'Multi-channel distribution',
              'ROI tracking per progetti creativi'
            ]
          }
        ],
        primaryAction: { text: 'inizia il tour', module: 'mindGarden' }
      };
    }
    
    setAiResponse(response);
    setPromptValue('');
    
    // Auto-fade after 12 seconds
    fadeTimeout.current = setTimeout(() => {
      setAiResponse(null);
    }, 12000);
  };

  return (
    <div className={`${isDarkTheme ? 'dark' : ''}`}>
      <style>{`
        :root {
          --bg-primary: #FAFAF9;
          --bg-secondary: #FFFFFF;
          --bg-hover: #F5F5F4;
          --border-light: #E8E8E8;
          --text-primary: #1A1A1A;
          --text-secondary: #666666;
          --text-tertiary: #999999;
          --accent: #5E5CE6;
          --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
          --shadow-md: 0 8px 24px rgba(0,0,0,0.08);
          --shadow-lg: 0 16px 48px rgba(0,0,0,0.12);
        }
        
        .dark {
          --bg-primary: #0A0A0C;
          --bg-secondary: #16161A;
          --bg-hover: #1F1F25;
          --border-light: rgba(255, 255, 255, 0.06);
          --text-primary: #F7F7F8;
          --text-secondary: #9CA3AF;
          --text-tertiary: #6B7280;
          --accent: #6B69D6;
          --shadow-sm: 0 2px 8px rgba(0,0,0,0.4);
          --shadow-md: 0 8px 24px rgba(0,0,0,0.5);
          --shadow-lg: 0 16px 48px rgba(0,0,0,0.6);
        }

        .dark .module-icon-garden { stroke: #10B981; }
        .dark .module-icon-scriptorium { stroke: #60A5FA; }
        .dark .module-icon-orchestra { stroke: #D97706; }

        @keyframes gentlePulse {
          0%, 100% { 
            opacity: 0.7;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.02);
          }
        }

        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes pathReveal {
          to {
            opacity: 0.2;
          }
        }

        @keyframes dashMove {
          to { stroke-dashoffset: -15; }
        }

        .module-portal {
          transition: all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .module-portal:hover {
          filter: brightness(1.05);
        }

        .project-preview {
          animation: slideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .connection-path {
          stroke: var(--border-light);
          stroke-width: 1;
          fill: none;
          opacity: 0;
          stroke-dasharray: 5, 10;
          animation: pathReveal 1.5s ease-out 0.8s forwards, dashMove 20s linear 1.5s infinite;
        }

        .dark .connection-path {
          stroke: rgba(255, 255, 255, 0.05);
        }

        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
      `}</style>

      {/* Main container */}
      <div style={{ 
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'Inter, sans-serif',
        minHeight: '100vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <header 
          className="fixed top-0 left-0 right-0 h-14 z-50"
          style={{
            background: isDarkTheme ? 'rgba(10, 10, 12, 0.95)' : 'rgba(250, 250, 249, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <div className="h-full px-6 flex items-center justify-between">
            <div style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '24px',
              fontWeight: 400,
              letterSpacing: '-0.02em'
            }}>
              Atelier
            </div>
            
            <nav className="flex items-center gap-6">
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
                color: 'var(--text-secondary)'
              }}>
                {activeProject ? `[${activeProject}]` : '[home]'}
              </div>
              <div style={{ color: 'var(--text-tertiary)' }}>|</div>
              <div 
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 15c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <button 
                onClick={handleThemeToggle}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                style={{ color: 'var(--text-secondary)' }}
              >
                {isDarkTheme ? '☀' : '☾'}
              </button>
            </nav>
          </div>
        </header>

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className="fixed top-14 left-0 right-0 bottom-0"
          style={{
            backgroundColor: 'var(--bg-primary)',
            backgroundImage: isDarkTheme 
              ? 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 1px, transparent 1px)'
              : 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        >
          {/* Organic connection paths */}
          <svg 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            {isDesktop ? (
              <>
                <path
                  className="connection-path"
                  d="M max(25%, calc(50% - 450px)) 45% Q calc(50% - 225px) 48%, 50% 50%"
                />
                <path
                  className="connection-path"
                  d="M 50% 50% Q calc(50% + 225px) 48%, min(75%, calc(50% + 450px)) 45%"
                />
              </>
            ) : (
              <>
                <path
                  className="connection-path"
                  d="M 20% 45% Q 35% 48%, 50% 50%"
                />
                <path
                  className="connection-path"
                  d="M 50% 50% Q 65% 48%, 80% 45%"
                />
              </>
            )}
          </svg>

          {/* Module Portals */}
          {Object.entries(modules).map(([key, module]) => (
            <div
              key={key}
              id={`module-${key}`}
              className="module-portal absolute"
              style={{
                left: isDesktop ? module.position.desktop.x : module.position.mobile.x,
                top: isDesktop ? module.position.desktop.y : module.position.mobile.y,
                transform: 'translate(-50%, -50%)',
                width: hoveredModule === key ? '280px' : '200px',
                height: hoveredModule === key ? 'auto' : '200px',
                padding: '24px',
                backgroundColor: isDarkTheme ? '#1A1A1F' : 'white',
                borderRadius: '20px',
                boxShadow: hoveredModule === key ? 'var(--shadow-lg)' : 'var(--shadow-md)',
                border: '2px solid',
                borderColor: hoveredModule === key ? `${module.color}66` : 'var(--border-light)',
                cursor: 'pointer',
                zIndex: hoveredModule === key ? 20 : 10,
                transition: hoveredModule === key ? 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
              onMouseEnter={() => setHoveredModule(key)}
              onMouseLeave={() => setHoveredModule(null)}
              onClick={() => handleModuleEnter(key, module.name)}
            >
              {/* Module Icon */}
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  opacity: hoveredModule === key ? 1 : 0.8,
                  transform: hoveredModule === key ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
              >
                {module.icon}
              </div>

              {/* Module Name */}
              <h3 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '22px',
                fontWeight: 400,
                textAlign: 'center',
                marginBottom: '4px'
              }}>
                {module.name}
              </h3>

              {/* Module Hint */}
              <p style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                textAlign: 'center',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: hoveredModule === key ? '20px' : '0',
                opacity: hoveredModule === key ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}>
                {module.hint}
              </p>

              {/* Projects Preview - Only on hover */}
              {hoveredModule === key && module.projects.length > 0 && (
                <div className="project-preview">
                  <div style={{
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '16px',
                    marginTop: '8px'
                  }}>
                    {module.projects.slice(0, 3).map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between py-2 px-3 -mx-3 rounded-lg transition-all"
                        style={{
                          backgroundColor: 'transparent',
                          marginBottom: '4px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                          e.currentTarget.style.transition = 'background-color 0.6s ease';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transition = 'background-color 0.6s ease';
                        }}
                      >
                        <span style={{ 
                          fontSize: '13px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px' 
                        }}>
                          <span style={{ opacity: 0.6 }}>{project.preview}</span>
                          {project.title}
                        </span>
                        <span style={{ 
                          fontSize: '11px', 
                          color: 'var(--text-tertiary)',
                          fontFamily: 'JetBrains Mono, monospace'
                        }}>
                          →
                        </span>
                      </div>
                    ))}
                    
                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleModuleEnter(key, module.name)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: `${module.color}99`,
                          color: 'white',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: 'none',
                          cursor: 'pointer',
                          opacity: 0.9,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '0.9';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        entra
                      </button>
                      <button
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'transparent',
                          color: module.color,
                          borderRadius: '8px',
                          fontSize: '20px',
                          border: `1px solid ${module.color}`,
                          cursor: 'pointer',
                          opacity: 0.6,
                          transition: 'all 0.2s ease',
                          lineHeight: '1'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.backgroundColor = `${module.color}B3`;
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '0.6';
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = module.color;
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Interactive Prompt - Only if no projects */}
          {!hasProjects && !aiResponse && (
            <div 
              className="absolute"
              style={{
                left: '50%',
                top: '30%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                zIndex: 5
              }}
            >
              {!promptActive ? (
                <button
                  onClick={() => setPromptActive(true)}
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                    color: 'var(--text-tertiary)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-light)',
                    borderRadius: '24px',
                    padding: '12px 24px',
                    cursor: 'text',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    opacity: 0,
                    animation: 'fadeInScale 0.8s ease-out 1s forwards'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.borderColor = 'var(--text-secondary)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  [ su cosa vuoi lavorare oggi? ]
                </button>
              ) : (
                <form onSubmit={handlePromptSubmit}>
                  <input
                    ref={promptRef}
                    type="text"
                    value={promptValue}
                    onChange={(e) => setPromptValue(e.target.value)}
                    onBlur={() => {
                      if (!promptValue) {
                        setPromptActive(false);
                      }
                    }}
                    placeholder="dimmi..."
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      backgroundColor: isDarkTheme ? 'rgba(26, 26, 31, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '24px',
                      padding: '12px 28px',
                      width: '400px',
                      outline: 'none',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
                      e.target.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setPromptValue('');
                        setPromptActive(false);
                      }
                    }}
                  />
                  <p style={{
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                    marginTop: '8px',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>
                    premi invio o esc per chiudere
                  </p>
                </form>
              )}
            </div>
          )}

          {/* AI Response - Feature Showcase */}
          {aiResponse && (
            <div 
              className="absolute"
              style={{
                left: '50%',
                top: '30%',
                transform: 'translate(-50%, -50%)',
                width: '520px',
                maxHeight: '70vh',
                overflowY: 'auto',
                backgroundColor: isDarkTheme ? 'rgba(26, 26, 31, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '36px',
                boxShadow: '0 25px 70px rgba(0,0,0,0.2)',
                border: '1px solid var(--border-light)',
                animation: 'fadeInScale 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                zIndex: 15
              }}
            >
              <h3 style={{
                fontSize: '20px',
                fontWeight: 500,
                marginBottom: '28px',
                color: 'var(--text-primary)',
                lineHeight: 1.4
              }}>
                {aiResponse.title}
              </h3>
              
              <div style={{ marginBottom: '32px' }}>
                {aiResponse.features.map((feature, idx) => (
                  <div 
                    key={idx}
                    style={{
                      marginBottom: '24px',
                      opacity: 0,
                      animation: `slideIn 0.6s ease-out ${0.1 + idx * 0.15}s forwards`
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                      gap: '10px'
                    }}>
                      <span style={{ fontSize: '20px' }}>{feature.icon}</span>
                      <span style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '18px',
                        color: modules[Object.keys(modules).find(k => modules[k].name === feature.module)]?.color || 'var(--text-primary)'
                      }}>
                        {feature.module}
                      </span>
                    </div>
                    
                    <div style={{ paddingLeft: '30px' }}>
                      {feature.capabilities.map((capability, capIdx) => (
                        <div 
                          key={capIdx}
                          style={{
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            marginBottom: '6px',
                            paddingLeft: '16px',
                            position: 'relative'
                          }}
                        >
                          <span style={{
                            position: 'absolute',
                            left: 0,
                            color: 'var(--text-tertiary)'
                          }}>•</span>
                          {capability}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                {aiResponse.primaryAction && (
                  <button
                    onClick={() => {
                      setHoveredModule(aiResponse.primaryAction.module);
                      setAiResponse(null);
                    }}
                    style={{
                      flex: 1,
                      padding: '14px 28px',
                      backgroundColor: 'var(--text-primary)',
                      color: isDarkTheme ? 'var(--bg-primary)' : 'white',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 500,
                      fontFamily: 'JetBrains Mono, monospace',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: 0,
                      animation: 'fadeInScale 0.5s ease-out 0.6s forwards'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {aiResponse.primaryAction.text}
                  </button>
                )}
                
                <button
                  onClick={() => setAiResponse(null)}
                  style={{
                    padding: '14px 20px',
                    backgroundColor: 'transparent',
                    color: 'var(--text-tertiary)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'JetBrains Mono, monospace',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: 0,
                    animation: 'fadeInScale 0.5s ease-out 0.6s forwards'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--text-secondary)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }}
                >
                  chiudi
                </button>
              </div>
              
              <p style={{
                fontSize: '11px',
                color: 'var(--text-tertiary)',
                textAlign: 'center',
                marginTop: '20px',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                scompaio tra 12 secondi • esc per chiudere
              </p>
            </div>
          )}

          {/* Poetic Statement Component - REPLACED STATIC TEXT */}
          <WelcomePoeticStatement 
            isDarkTheme={isDarkTheme}
            enableCycling={true}
            onStatementChange={(statement) => {
              // Optional: Track which statements resonate more
              console.log('Current statement:', statement.type);
            }}
          />

          {/* Corner info */}
          <div className="fixed bottom-6 right-6 flex items-center gap-2" style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            color: 'var(--text-tertiary)'
          }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{
              backgroundColor: '#10B981',
              animation: 'pulse 2s infinite'
            }} />
            <span>creative space</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;