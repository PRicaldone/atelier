# 🌱 Mind Garden Module

> Visual mind mapping system with bidirectional flow to Scriptorium

## 📚 IMPORTANT DOCUMENTATION

**For complete Mind Garden types and flows, ALWAYS refer to:**
- 🔒 **[BIFLOW-COMPLETE-TYPES.md](/docs/BIFLOW-COMPLETE-TYPES.md)** - SINGLE SOURCE OF TRUTH for all Mind Garden/Scriptorium flows

## 🧠 Mind Garden Types

As defined in BIFLOW-COMPLETE-TYPES.md:

- **FMG (Freestyle Mind Garden)**: Brainstorming libero, multipli possibili
- **PMG (Project Mind Garden)**: Giardino delle idee di progetto specifico  
- **BMG (Board Mind Garden)**: Sempre 1:1 con board, micro-brainstorming

## 🔄 Key Flows

- **FMG ↔ FS**: Freestyle gardens can connect to Freestyle Scriptorium
- **PMG ↔ PS**: Project gardens connect to Project Scriptorium
- **BMG ⇄ Board**: Every board has dedicated BMG (1:1 mandatory)

## 📁 Module Structure

```
mind-garden/
├── MindGarden.jsx       # Main component
├── store.js            # Zustand store
├── components/         # Sub-components
├── hooks/             # Custom hooks
└── README.md          # This file
```

## 🚀 Quick Start

```javascript
import { MindGarden } from './MindGarden';
import { useMindGardenStore } from './store';

// Component usage
<MindGarden 
  type="FMG"              // or "PMG", "BMG"
  gardenId="garden-123"
  onPromote={handlePromote}
/>
```

## ⚠️ Critical Rules

1. **BMG sempre 1:1**: Every board MUST have a BMG
2. **FMG senza board**: FMG can exist without board association
3. **Promozioni in home**: Promoted elements ALWAYS arrive in Scriptorium home
4. **Flows reversibili**: All transitions are bidirectional

## 🐛 Troubleshooting

**Issue**: "Garden type mismatch"
- **Solution**: Check BIFLOW-COMPLETE-TYPES.md for correct type definitions

**Issue**: "Board without BMG"  
- **Solution**: This violates 1:1 rule - every board needs BMG

**Issue**: "Promotion not working"
- **Solution**: Elements must arrive in Scriptorium home first

---

*For any architectural questions or flow clarifications, consult [BIFLOW-COMPLETE-TYPES.md](/docs/BIFLOW-COMPLETE-TYPES.md)*