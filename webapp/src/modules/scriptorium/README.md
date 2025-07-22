# 📋 Scriptorium Module

## Overview
The Scriptorium module implements structured creative workspaces according to the BiFlow v2.0 specification.

## 🚨 CRITICAL: BiFlow Compliance
**All development in this module MUST comply with `/docs/BIFLOW-COMPLETE-TYPES.md` (v2.0.1)**

This is the **SINGLE SOURCE OF TRUTH** for Scriptorium types and flows.

## Scriptorium vs Board Concept

### ⚠️ IMPORTANT DISTINCTION
- **Scriptorium** ≠ **Board**
- **Scriptorium** = Structured workspace containing:
  - **Scriptorium Home** (staging area locale)
  - **Multiple Boards** (tavoli di lavoro)
  - **Notes & Links** (elementi supporto)
  - **Integrated Navigation** (tra elementi)

### 🏠 Scriptorium Home Concept
Every FS/PS has a **home locale** where:
- Elements promoted from Mind Garden arrive first
- User can organize before distributing to boards
- Acts as **staging area** for workflow management

## Scriptorium Types (BiFlow v2.0)

### 🎨 FS - Freestyle Scriptorium
- **Purpose**: Workspace creativo indipendente
- **Characteristics**: Multipli possibili, no formal constraints
- **Flow**: FS ↔ FMG (Freestyle Mind Garden)

### 🎯 PS - Project Scriptorium
- **Purpose**: Spazio operativo di progetto
- **Characteristics**: 1:1 con progetto formale, deliverable-focused
- **Flow**: PS ↔ PMG (Project Mind Garden)

## Key Files
- `Scriptorium.jsx` - Main component (legacy Canvas wrapper)
- `store.js` - Canvas/Scriptorium state management (with BiFlow policy header)
- `biflow-store.js` - BiFlow v2.0 system store
- `biflow-types.js` - Complete BiFlow type definitions
- `types.js` - Legacy canvas element types

## BiFlow Integration
- Receive promoted elements from Mind Gardens
- Elements arrive in Scriptorium Home first
- Support for FMG→FS, PMG→PS, and special flows (FMG→PS, PMG→FS)

## Architecture Notes
- **Legacy Compatibility**: Current Canvas system continues to work
- **BiFlow Layer**: New biflow-store.js provides v2.0 functionality
- **Migration Path**: Gradual transition from Canvas-only to full BiFlow

## Troubleshooting
1. **Missing Scriptorium Home**: Check biflow-store.js initialization
2. **Promotion not working**: Verify Mind Garden → Scriptorium flow compatibility
3. **FS/PS confusion**: Remember semantic difference only (functionality identical)

## References
- **Primary Spec**: `/docs/BIFLOW-COMPLETE-TYPES.md` (v2.0.1)
- **BiFlow Store**: `/webapp/src/modules/scriptorium/biflow-store.js`
- **Type Definitions**: `/webapp/src/modules/scriptorium/biflow-types.js`
- **Legacy Canvas**: `/webapp/src/modules/scriptorium/store.js`