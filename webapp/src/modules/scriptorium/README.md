# 🏛️ Scriptorium Module

> Structured workspace system with boards, notes, links, and nested organization

## 📚 IMPORTANT DOCUMENTATION

**For complete Scriptorium types and flows, ALWAYS refer to:**
- 🔒 **[BIFLOW-COMPLETE-TYPES.md](/docs/BIFLOW-COMPLETE-TYPES.md)** - SINGLE SOURCE OF TRUTH for all Mind Garden/Scriptorium flows

## 🏗️ Scriptorium Types

As defined in BIFLOW-COMPLETE-TYPES.md:

- **FS (Freestyle Scriptorium)**: Workspace creativo indipendente
- **PS (Project Scriptorium)**: Spazio operativo di progetto

**⚠️ CRITICO**: Scriptorium ≠ Board. Scriptorium è uno spazio strutturato che contiene:
- Home (arrival point per elementi promossi)
- Multiple boards
- Notes
- Links
- Nested structure

## 🔄 Key Flows

- **FMG → FS**: Freestyle gardens promote to Freestyle Scriptorium
- **PMG → PS**: Project gardens promote to Project Scriptorium (direct possible)
- **FS ⇄ PS**: Promotion/demotion con solo cambio status
- **Home arrival**: ALL promoted elements arrive in Scriptorium home first

## 📁 Module Structure

```
scriptorium/
├── VisualCanvasStandalone.jsx   # Main canvas component
├── store.js                     # Zustand store
├── types.js                     # Type definitions
├── biflow-types.js             # BiFlow v2.0 types
├── biflow-store.js             # BiFlow operations
├── components/                  # UI components
│   ├── TreeViewSidebar.jsx
│   ├── PropertiesPanel.jsx
│   ├── PathBreadcrumb.jsx
│   └── RectangleSelection.jsx
└── README.md                   # This file
```

## 🚀 Quick Start

```javascript
import { VisualCanvasStandalone } from './VisualCanvasStandalone';
import { useCanvasStore } from './store';

// Component usage
<VisualCanvasStandalone 
  type="FS"                    // or "PS"
  scriptoriumId="script-123"
  showHome={true}              // Show Scriptorium home
/>
```

## 🏠 Scriptorium Home Concept

Every Scriptorium (FS/PS) has a **local home** where:
- Promoted elements arrive first
- User organizes via drag & drop to sections/tree
- No universal inbox by default
- Can create FS/PS named "Inbox" if desired

## ⚠️ Critical Rules

1. **Scriptorium ≠ Board**: It's a structured workspace container
2. **Home locale**: Every FS/PS has its own home
3. **Board → BMG**: Every board inside has mandatory BMG
4. **Promotion paths**: Check BIFLOW-COMPLETE-TYPES.md for valid flows

## 🐛 Troubleshooting

**Issue**: "Elements not appearing after promotion"
- **Solution**: Check Scriptorium home - they arrive there first

**Issue**: "Board created without BMG"
- **Solution**: Every board MUST have BMG - check biflow-store.js

**Issue**: "Can't find workspace structure"
- **Solution**: Remember Scriptorium = home + boards + notes + links

---

*For any architectural questions or flow clarifications, consult [BIFLOW-COMPLETE-TYPES.md](/docs/BIFLOW-COMPLETE-TYPES.md)*