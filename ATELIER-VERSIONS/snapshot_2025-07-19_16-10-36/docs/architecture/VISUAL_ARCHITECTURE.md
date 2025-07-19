# 🏗️ Visual Architecture - Gesture UI System

> **Complete architectural overview of Atelier's revolutionary gesture-based interface**

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GESTURE UI SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│  🎨 Presentation Layer                                          │
│  ├── GestureLayout (Main orchestrator)                         │
│  ├── Header (Floating navigation)                              │
│  ├── CanvasContainer (Gesture detection)                       │
│  ├── RadialMenu (Creation overlay)                             │
│  ├── AIPrompt (AI interaction)                                 │
│  └── FloatingHints (Contextual help)                           │
│                                                                 │
│  🎭 Interaction Layer                                           │
│  ├── useGestures (Gesture detection hook)                      │
│  ├── Event handling (Mouse/Touch/Keyboard)                     │
│  ├── Drag & Drop (DnD Kit integration)                         │
│  └── Animation system (Framer Motion)                          │
│                                                                 │
│  🎨 Theme & Style Layer                                         │
│  ├── ThemeProvider (Global theme management)                   │
│  ├── CSS Custom Properties (Design tokens)                     │
│  ├── Responsive system (Mobile-first)                          │
│  └── Animation definitions (Micro-interactions)                │
│                                                                 │
│  🤖 AI Integration Layer                                        │
│  ├── SuperClaude+MCP agents                                    │
│  ├── AI prompt processing                                      │
│  ├── Fallback systems                                          │
│  └── Context-aware generation                                  │
│                                                                 │
│  🏗️ Architecture Layer                                         │
│  ├── ModuleRegistry (Component management)                     │
│  ├── EventBus (Cross-component communication)                  │
│  ├── State Management (Zustand stores)                         │
│  └── Persistence (LocalStorage + sync)                         │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Component Architecture

### Main Layout Structure

```
GestureLayout
├── 🎨 ThemeProvider
│   └── 🎭 DndContext
│       ├── 📱 Header
│       │   ├── Logo (Playfair Display)
│       │   ├── Navigation (JetBrains Mono)
│       │   ├── UserMenu (Dropdown)
│       │   └── ThemeToggle (Light/Dark)
│       │
│       ├── 🎯 CanvasContainer
│       │   ├── 📐 Canvas (Radial grid background)
│       │   ├── 🎪 CanvasElement[] (Draggable elements)
│       │   ├── 🎯 RadialMenu (Creation overlay)
│       │   │   ├── Center circle (+)
│       │   │   ├── Note option (📝)
│       │   │   ├── Image option (📎)
│       │   │   ├── Link option (🔗)
│       │   │   ├── Reference option (📁)
│       │   │   └── Board option (📋)
│       │   │
│       │   ├── 🤖 AIPrompt (AI interaction)
│       │   │   ├── Header (✨ AI Assistant)
│       │   │   ├── Textarea (Prompt input)
│       │   │   ├── Shortcuts (/board, /idea, /ref, /brief)
│       │   │   └── Generate button
│       │   │
│       │   ├── 💫 TouchIndicator (Mobile feedback)
│       │   └── 💡 FloatingHints (Contextual help)
│       │
│       ├── 📂 SidebarToggle (Collapsed sidebar)
│       ├── 📊 CornerInfo (Status & sync)
│       └── 🎭 DragOverlay (Drag preview)
│
└── 🎪 Floating Elements
    ├── ProjectSelector (Modal)
    ├── SecurityStatus (Dev mode)
    ├── AlertNotifications (System alerts)
    └── WIPProtectionIndicator (Dev warnings)
```

## 🎭 Gesture Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        GESTURE DETECTION                        │
│                                                                 │
│  👆 User Input                                                  │
│  ├── Mouse Events                                               │
│  │   ├── Double Click → RadialMenu                             │
│  │   ├── Mouse Down → Long Press Timer                         │
│  │   ├── Mouse Up → Cancel Timer                               │
│  │   └── Mouse Move → Drag Detection                           │
│  │                                                             │
│  ├── Touch Events                                               │
│  │   ├── Touch Start → Long Press Timer                        │
│  │   ├── Touch End → Double Tap Detection                      │
│  │   └── Touch Move → Drag Detection                           │
│  │                                                             │
│  └── Keyboard Events                                            │
│      ├── Escape → Close Overlays                               │
│      ├── Cmd/Ctrl+P → Project Selector                         │
│      └── Cmd/Ctrl+K → Command Palette                          │
│                                                                 │
│  🎯 Gesture Processing                                          │
│  ├── Event Validation                                           │
│  ├── Target Verification (Canvas only)                         │
│  ├── Position Calculation                                       │
│  └── Debouncing/Throttling                                     │
│                                                                 │
│  🎪 UI Response                                                 │
│  ├── Overlay Positioning                                        │
│  ├── Animation Triggers                                         │
│  ├── Visual Feedback                                            │
│  └── Accessibility Support                                      │
│                                                                 │
│  📡 Event Broadcasting                                          │
│  ├── Analytics Tracking                                         │
│  ├── Cross-Module Events                                        │
│  └── Debug Logging                                              │
└─────────────────────────────────────────────────────────────────┘
```

This comprehensive visual architecture provides the foundation for understanding, extending, and maintaining Atelier's revolutionary gesture-based interface system.

**The future of creative interfaces is here.** 🚀✨