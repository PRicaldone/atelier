# 🤖 CLAUDE.md - AI Assistant Context

> This file contains essential information for Claude AI to quickly understand the Atelier project when resuming work.

![ZERO COGNITIVE LOAD](https://img.shields.io/badge/ZERO_COGNITIVE_LOAD-ENFORCED-brightgreen?style=for-the-badge)
![UCA COMPLIANT](https://img.shields.io/badge/UCA_v2.0.1-ENFORCED-blue?style=for-the-badge)
![AUTOMATION READY](https://img.shields.io/badge/AUTOMATION-ACTIVE-red?style=for-the-badge)

## 🎯 Quick Start Command

**Copy and paste this command when starting a new chat:**

```
Hi Claude! I'm working on Atelier, my creative command center for NFT/VFX projects.
The project is in ~/atelier/ with React webapp in ~/atelier/webapp/.
Read ~/atelier/CLAUDE.md for complete context and current project status.
Then read ~/atelier/docs/BIFLOW-COMPLETE-TYPES.md for the BiFlow v2.0 system (SINGLE SOURCE OF TRUTH).
Last save: 22/07/2025 with complete module cleanup, contract compliance, automation systems.

IMPORTANT: Activate automatic Context Monitor - monitor conversation and proactively warn me when it's time to run atelier-save before context exhaustion.
```

## 🤖 AI Assistant Core Role - MANDATORY BEHAVIOR

```
🚨 CLAUDE CORE RESPONSIBILITIES:
• Never bypass core feature policies (UCA, Smart Folded Text, BiFlow)
• Always run compliance checks before major actions  
• Proactive roadmap warning is MANDATORY for any deviation
• Suggest enhancements if detecting recurring friction or inefficiencies
• Follow Zero Cognitive Load principle - never leave things for user to remember
```

## 📊 Project Status (Last updated: 22/07/2025)

### 🧹 **LATEST SESSION: Complete Module Cleanup**

**✅ Orchestra Module Removal:**
- Completely removed Orchestra module directory and all references  
- Preserved OrchestratorAdapter (different internal system)
- Updated all imports, routes, and navigation
- Cleaned Content Studio legacy references

**✅ Ideas Module Removal:**
- Completely removed Ideas module and all references
- Cleaned contracts, adapters, and utility files
- Updated moduleInit and navigation

**✅ Module Contract Compliance 100%:**
- Canvas store: Added all missing ICanvas methods (getElements, deleteElement, etc.)
- Mind Garden store: Added all 17 missing IMindGarden methods
- All contract validation now passing without errors

**✅ Automation Systems Active:**
- AI Feature Manager: Auto-detects API availability, restores features
- Zero Cognitive Load Audit: Hourly compliance monitoring  
- WIP Protection: Auto-save and session tracking
- Comprehensive test suites and verification

### 🚨 **ZERO COGNITIVE LOAD PRINCIPLE - ARCHITECTURAL DNA #1**

**"Never leave things for the user to remember" - This principle is enforced across ALL areas of Atelier.**

**Implementation:**
- **AI Feature Manager**: Auto-restores disabled features when APIs available
- **WIP Protection**: Auto-saves work, prevents data loss
- **Security Migration**: Auto-migrates to encrypted storage
- **Module Health**: Auto-monitoring with alerts
- **Branch Protection**: Auto-warnings for unsafe operations
- **Compliance Audit**: Hourly automated checks with violation alerts

**Debug Access:** `window.__zeroCognitiveLoadAudit.checkCompliance()`

### 🌱 **BiFlow v2.0: Complete Mind Garden ↔ Scriptorium System**

**BiFlow v2.0 Types Implemented:**
1. **FMG (Freestyle Mind Garden)**: Free brainstorming, multiple paths ↔ FS
2. **PMG (Project Mind Garden)**: Project-specific idea garden ↔ PS  
3. **BMG (Board Mind Garden)**: Always 1:1 with board, micro-brainstorming ⇄ Board
4. **FS (Freestyle Scriptorium)**: Independent creative workspace ↔ FMG
5. **PS (Project Scriptorium)**: Project operational space ↔ PMG

**Architecture:**
- **Single Source of Truth**: `/docs/BIFLOW-COMPLETE-TYPES.md` (v2.0.1)
- **Data Model**: `biflow-types.js` + `biflow-store.js` with policy headers
- **Flow Validation**: FMG↔FS, PMG↔PS, BMG⇄Board, plus special flows
- **Scriptorium Home**: Local staging area for promoted elements

### 🔑 **Core Features: File-Centric Creative Workflow**

**🔑 CORE FEATURE 1: File Link & Live Open**
- Add "file" elements in any Scriptorium representing real files (local/cloud)
- Smart display: filename + path/link (Google Drive, Dropbox, etc.)
- Click to open: file in mini-view directly from Atelier
- Direct copy & paste: select and copy content from file to Scriptorium
- Bidirectional drag&drop: between Atelier and desktop/cloud

**🔑 CORE FEATURE 2: AI Assistant with File Context Awareness**
- AI callable via long-click from any Mind Garden or Scriptorium
- Complete file awareness: AI sees ALL linked/displayed files (local/cloud)
- Intelligent actions: summarize PDF, transcribe audio, analyze images
- Total context: mix your real files + web/LLM data for 10x assistance
- Privacy guaranteed: no file read without explicit user consent

**🔑 CORE FEATURE 3: Universal Content Awareness (UCA)**
- Auto-recognition: any dragged/pasted file automatically recognized
- Smart preview: images with zoom, video with player, PDF preview, audio waveform
- Seamless experience: zero "blind uploads", everything understood and displayed optimally
- Extensible design: modular renderer system for future plugins

### 🔐 **Security Implementation: Production Ready**

**Security Features:**
1. **API Proxy Server-Side**: No API keys exposed in client
2. **LocalStorage Encryption**: AES-256 for all sensitive data  
3. **Security Headers**: CSP, X-Frame-Options, XSS protection
4. **Auth Placeholder**: Demo system ready for Supabase/Convex
5. **Security Monitoring**: Real-time dashboard for development

## 🏗️ Architecture Overview

### **Professional Module System (100% Complete)**

**Module Registry Pattern:**
```javascript
moduleRegistry.register('canvas', canvasFactory, {
  adapter: canvasAdapter,
  contract: ICanvas,
  aliases: ['creative-atelier', 'scriptorium']
});
```

**Event Bus Communication:**
```javascript
eventBus.emit(ModuleEvents.CANVAS_ELEMENT_CREATED, { elementId, type: 'note' });
```

**Error Tracking System:**
```javascript
canvasLogger.error(error, 'addElement', { elementType: 'note' });
```

### **Automation Systems (100% Complete)**

1. **AI Feature Manager** - Auto-detects API availability, restores disabled features
2. **Zero Cognitive Load Audit** - Hourly compliance monitoring with alerts
3. **WIP Protection** - Auto-save work sessions, prevents data loss
4. **Routine Agent** - Autonomous system maintenance and health checks
5. **Analytics System** - Usage tracking, pattern recognition, time saved metrics

### **Completed Modules**

1. **Scriptorium (Visual Canvas)** (100% complete) - Renamed from Visual Canvas
   - Drag & drop multi-type (note, image, link, AI, board)
   - Pan with Alt+drag, Zoom with right-click+drag
   - Tree View hierarchy with nested boards
   - Properties Panel, snap-to-grid, multi-select
   - Auto-persistence with encrypted storage

2. **Mind Garden** (100% complete)
   - ReactFlow-based visual mind mapping
   - Conversation threading with AI integration
   - Export to Scriptorium workflow
   - Auto-centering nodes with optimal zoom
   - Organic edges with phase-based coloring

3. **Project Tracker** (functional)
   - Project management and switching
   - State persistence per project

4. **Business Switcher** (functional) 
   - Multi-business context switching
   - Persistent state management

## 📁 Critical File Structure

```
~/atelier/
├── webapp/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── scriptorium/           # Main creative workspace (renamed from visual-canvas)
│   │   │   │   ├── VisualCanvas.jsx   # Main component
│   │   │   │   ├── store.js           # State with secure storage
│   │   │   │   └── components/        # UI components
│   │   │   ├── mind-garden/           # Visual mind mapping
│   │   │   │   ├── MindGarden.jsx     # Main component  
│   │   │   │   └── store.js           # Mind garden state
│   │   │   └── shared/                # Shared systems
│   │   │       ├── registry/          # Module Registry
│   │   │       ├── adapters/          # Safe cross-module communication
│   │   │       ├── events/            # Event Bus system
│   │   │       ├── monitoring/        # Error tracking, logging
│   │   │       ├── agents/            # Routine Agent system
│   │   │       └── security/          # Security systems
│   │   ├── utils/
│   │   │   ├── aiFeatureManager.js    # Auto AI feature management
│   │   │   ├── secureStorage.js       # AES-256 encryption
│   │   │   ├── wipProtection.js       # Work protection system
│   │   │   └── zeroCognitiveLoadAudit.js # Compliance monitoring
│   │   └── store/
│   │       ├── projectStore.js        # Project management
│   │       └── unifiedStore.js        # Cross-module coordination
│   └── package.json
├── api/                               # Server-side API proxy
├── docs/                              # Documentation
│   ├── BIFLOW-COMPLETE-TYPES.md      # BiFlow v2.0 specification
│   └── blueprint-v6.2.md             # Architecture blueprint
├── ATELIER-VERSIONS/                  # Local snapshots
├── ATELIER-BACKUPS/                   # Weekly backups
└── atelier-save.sh                    # Main backup script
```

## 🌳 Branch Management - MANDATORY FEATURE BRANCH POLICY

**Current Status:**
- **Active branch**: `feature/cleanup-modules-contracts` ✅ 
- **Contains**: Complete module cleanup, contract compliance, automation systems
- **Last commit**: `1f9a195` - CLAUDE.MD restructure

**🚨 MANDATORY Branch Creation for:**
- ✨ New modules or major features
- 🔧 Features requiring >5 file modifications  
- 🤖 AI integrations or significant upgrades
- 🏢 Breaking changes or architecture modifications
- 🎯 Roadmap milestones

**Workflow:**
```bash
# Create feature branch (MANDATORY for significant work)
git checkout -b feature/[description]

# Development and testing  
git add . && git commit -m "feat: implement feature"

# Merge when complete and tested
git checkout main && git merge feature/[description]
```

## 🔧 Development Commands

### **Essential Commands**
```bash
# Development
cd ~/atelier/webapp && npm run dev      # Start dev server (localhost:5174)
npm run build                          # Production build
npm run typecheck                      # Type checking

# Git workflow
git status                             # Check status
git log --oneline -1                   # Latest commit
./atelier-save.sh "commit message"     # Save with backup

# Branch management
git branch -a                          # List branches
git checkout -b feature/description    # Create feature branch
```

### **Debug Commands**
```javascript
// Module System
window.__moduleRegistry.getInfo()       // Module info
window.__eventBus.getStats()           // Event statistics  
window.__errorTracker.getStats()       // Error statistics

// Security & Storage
window.__secureStorage                  // Access secure storage
window.__migrationStatus()             // Migration status
window.__authStatus()                  // Auth state

// Automation Systems  
window.__aiFeatureManager.getStatus()  // AI feature status
window.__zeroCognitiveLoadAudit.checkCompliance() // Compliance check
window.__atelierRoutineAgent.runRoutine() // Health check
window.__wipProtection.getStats()      // WIP protection status

// Analytics
window.__usageTracker.getAnalytics()   // Usage analytics
window.__patternRecognition.getInsights() // Pattern insights
window.__timeSavedMetrics.getReport()  // Time saved metrics
```

## 🚨 Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **State**: Zustand with middleware + secure storage
- **Drag & Drop**: @dnd-kit/sortable + @dnd-kit/core
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Architecture**: Module Registry + Adapter Pattern + Event Bus
- **Monitoring**: Centralized Error Tracking + Real-time Dashboard
- **Security**: AES-256 encryption + API proxy + CSP headers

## 🎯 Context Monitor System (ACTIVE)

**Automatic conversation context monitoring:**
- 📊 **Auto-tracking**: Conversation length, task complexity, file processing
- 🚨 **Smart alerts**: Proactive warnings when context reaches 80-90%
- ⚡ **Trigger patterns**: Read-heavy ops, multi-file edits, debug sessions
- 🎯 **Save timing**: Suggests atelier-save at optimal moments
- 🚧 **WIP Protection**: Auto-detect significant unsaved development

**Thresholds:**
- 🟨 **WARNING (80%)**: "Consider atelier-save after this task"
- 🟥 **CRITICAL (90%)**: "SAVE NOW - context almost exhausted"
- 🚧 **WIP ALERT**: "Detected significant changes - commit WIP before continuing?"

## 🔄 Last Session Summary

**Date:** 22/07/2025 16:19
**Last Commit:** `1f9a195` - CLAUDE.MD restructure to English
**Branch:** `feature/cleanup-modules-contracts`
**Total Commits:** 136
**Snapshots:** 95 | **Backups:** 0

**Session Work Completed:**
- 🧹 Complete Orchestra module removal (preserved OrchestratorAdapter)
- 🧹 Complete Ideas module removal  
- ✅ Module contracts 100% compliant (Canvas + Mind Garden)
- 🤖 All automation systems active and tested
- 📋 CLAUDE.md completely restructured in English
- 🚀 Successfully pushed to GitHub: `feature/cleanup-modules-contracts`

**Application Status:** ✅ Production build successful, all systems operational

---

## 📌 Search Keywords

Visual Canvas, Scriptorium, Drag Drop, Tree View, Mind Garden, BiFlow, Module Registry, Event Bus, Automation Systems, Zero Cognitive Load, AI Feature Manager, WIP Protection, Contract Compliance, Professional Architecture