# 🌱 Mind Garden Module

## Overview
The Mind Garden module implements reactive brainstorming and idea development spaces according to the BiFlow v2.0 specification.

## 🚨 CRITICAL: BiFlow Compliance
**All development in this module MUST comply with `/docs/BIFLOW-COMPLETE-TYPES.md` (v2.0.1)**

This is the **SINGLE SOURCE OF TRUTH** for Mind Garden types and flows.

## Mind Garden Types (BiFlow v2.0)

### 🌱 FMG - Freestyle Mind Garden
- **Purpose**: Brainstorming libero senza vincoli di progetto
- **Characteristics**: Multipli possibili per user, esplorazione parallela
- **Flow**: FMG ↔ FS (Freestyle Scriptorium)

### 🎯 PMG - Project Mind Garden  
- **Purpose**: Giardino delle idee di progetto specifico
- **Characteristics**: 1:1 con progetto formale, structured brainstorming
- **Flow**: PMG ↔ PS (Project Scriptorium)

### 📋 BMG - Board Mind Garden
- **Purpose**: Sempre 1:1 con board, micro-brainstorming
- **Characteristics**: SACRED 1:1 relationship, contestuale
- **Flow**: BMG ⇄ Board (bidirezionale stretto)

## Key Files
- `MindGarden.jsx` - Main component
- `store.js` - Mind Garden state management (with BiFlow policy header)
- `types/` - Conversation and node type definitions

## BiFlow Integration
- Export to Scriptorium via promotion flows
- Automatic BMG creation for new boards
- Flow validation according to FMG/PMG/BMG rules

## Special Cases
- **General Mind Garden**: Special FMG with no initial scriptorium link
- **PMG → PS Direct Flow**: Ideas can bypass staging for immediate execution

## Troubleshooting
1. **BMG not found for board**: Check biflow-store.js auto-creation logic
2. **Invalid promotion flow**: Verify source/target type compatibility in BIFLOW-COMPLETE-TYPES.md
3. **General garden issues**: Remember it's the only garden allowed without board/scriptorium initially

## References
- **Primary Spec**: `/docs/BIFLOW-COMPLETE-TYPES.md` (v2.0.1)
- **Store Implementation**: `/webapp/src/modules/scriptorium/biflow-store.js`
- **Type Definitions**: `/webapp/src/modules/scriptorium/biflow-types.js`