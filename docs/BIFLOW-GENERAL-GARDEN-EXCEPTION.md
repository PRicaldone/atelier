# 🌱 BIFLOW CRITICAL EXCEPTION: General Mind Garden

> **IMPORTANT**: This document clarifies the ONLY exception to the sacred 1:1 Board ↔ Mind Garden relationship

**Status**: 🚨 **CRITICAL BIFLOW RULE**  
**Version**: 1.0  
**Authority**: BiFlow Architecture v1.0  
**Reference**: TRINITY-BIFLOW-FEATURE.md  

---

## 🚨 **THE EXCEPTION**

### **Sacred Rule**
Every Board MUST have a Mind Garden, every Mind Garden MUST have a Board (1:1 relationship)

### **SINGLE EXCEPTION**
**The General Mind Garden** (`id: 'general'`) is the ONLY Mind Garden allowed to exist without a Board.

---

## 🌳 **GENERAL MIND GARDEN SPECIFICATIONS**

### **Identity**
```javascript
{
  id: 'general',                    // Fixed ID - never changes
  boardId: null,                    // ONLY null allowed here
  origin: 'general',                // Special origin type
  metadata: {
    isGeneralGarden: true,          // Special flag
    isDeletable: false,             // Cannot be deleted
    isAlwaysVisible: true,          // Always in navigation
    title: 'Mind Garden Generale'
  }
}
```

### **Purpose**
- **Root Creative Space**: Where all ideas begin before boards exist
- **Promotion Source**: Elements are promoted from here to create new boards
- **Always Present**: Exists from app initialization, never deleted
- **User's Starting Point**: Default location when no boards exist

---

## 🔄 **WORKFLOW INTEGRATION**

### **Initial State**
```
User starts app → Only General Mind Garden exists → No boards yet
```

### **First Promotion**
```
User adds ideas to General Garden → Selects elements → Promotes to Board
↓
Creates: Board + Dedicated Mind Garden (1:1 relationship)
```

### **Ongoing Flow**
```
General Garden: Root ideas & exploration
Dedicated Gardens: Specific project development
```

---

## 🛡️ **VALIDATION RULES**

### **General Mind Garden Validation**
```javascript
// ALLOWED
{
  id: 'general',
  boardId: null,          // ✅ ONLY here
  origin: 'general'
}

// FORBIDDEN
{
  id: 'any-other-garden',
  boardId: null,          // ❌ VIOLATION
  origin: 'dedicated'
}
```

### **Validation Function Updates**
All validation functions MUST exclude General Mind Garden from orphan checks:

```javascript
// ✅ CORRECT
const orphanedGardens = gardens.filter(garden => {
  // Special exception: General Mind Garden allowed without board
  if (garden.id === 'general' || garden.metadata?.isGeneralGarden) {
    return false;
  }
  
  // All other gardens must have valid board
  return !garden.boardId || !boards.find(board => board.id === garden.boardId);
});

// ❌ WRONG
const orphanedGardens = gardens.filter(garden => 
  !garden.boardId  // This would flag General Garden as orphan
);
```

---

## 🗂️ **DATA MODEL IMPLICATIONS**

### **Database Schema**
```sql
CREATE TABLE mind_gardens (
  id VARCHAR PRIMARY KEY,
  board_id VARCHAR NULL,  -- NULL allowed ONLY for id='general'
  origin VARCHAR NOT NULL,
  -- ... other fields
  
  -- Constraint: Only 'general' can have NULL board_id
  CONSTRAINT check_board_id_general 
    CHECK (
      (id = 'general' AND board_id IS NULL) OR 
      (id != 'general' AND board_id IS NOT NULL)
    )
);
```

### **TypeScript Interface**
```typescript
interface MindGarden {
  id: string;
  boardId: string | null;  // null ONLY when id === 'general'
  origin: BiFlowOrigin;
  metadata?: {
    isGeneralGarden?: boolean;  // true for General Garden
    // ... other metadata
  };
  // ... other fields
}
```

---

## 🎯 **UI/UX CONSIDERATIONS**

### **Navigation**
- General Mind Garden always appears in navigation
- Special icon/badge to distinguish from dedicated gardens
- Default starting location for new users

### **Promotion UX**
```
General Garden:
[Select ideas] → [Long-press] → "Promote to Board" 
↓
Creates new board + populates its dedicated garden
```

### **Visual Distinction**
- General Garden: 🌱 "Mind Garden Generale"
- Dedicated Gardens: 🏡 "Project Name Garden"

---

## ⚠️ **CRITICAL REMINDERS FOR CLAUDE**

### **When Implementing**
1. **ALWAYS** check if garden is General before applying Board requirements
2. **NEVER** flag General Garden as orphaned or invalid
3. **ALWAYS** preserve General Garden during resets/migrations
4. **INITIALIZE** General Garden on app startup if missing

### **When Validating**
```javascript
// ✅ CORRECT validation pattern
function validateGarden(garden) {
  // Exception for General Garden
  if (garden.id === 'general') {
    return garden.boardId === null;  // Must be null
  }
  
  // Standard validation for dedicated gardens
  return garden.boardId !== null;    // Must have board
}
```

### **When Debugging**
If you see:
- "Garden without board" error for `id: 'general'` → This is EXPECTED
- Any other garden without board → This is VIOLATION

---

## 📚 **RELATED DOCUMENTATION**

- **Architecture**: `TRINITY-BIFLOW-FEATURE.md`
- **Data Model**: `biflow-types.js`
- **Store Implementation**: `biflow-store.js`
- **Validation Tests**: `biflow-test.js`

---

## 💎 **COMMITMENT**

**This exception is SACRED and PERMANENT. The General Mind Garden is the creative heart of Atelier - the space where every idea begins its journey from thought to reality.**

**⚠️ CRITICAL**: Any code that breaks this exception or attempts to force General Garden to have a board violates the core BiFlow philosophy.

---

*Document Version: 1.0*  
*Last Updated: 20 July 2025*  
*Status: 🚨 **ACTIVE CRITICAL EXCEPTION***