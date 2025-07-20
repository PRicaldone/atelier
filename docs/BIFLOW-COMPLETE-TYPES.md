# 🧠 ATELIER BIFLOW - TIPOLOGIE E FLUSSI COMPLETI

> **Versione Definitiva**: Mind Garden e Scriptorium con terminologia completa e flussi dettagliati

**Status**: 🔒 **CORE BIFLOW SPECIFICATION v2.0**  
**Authority**: BiFlow Architecture Complete  
**Reference**: User Strategic Vision + Product-Grade Documentation  

## ⚠️ **SINGLE SOURCE OF TRUTH**

**IMPORTANTE**: Questo documento è la **SINGLE SOURCE OF TRUTH** per tutti i flussi Mind Garden/Scriptorium.
- **Per Developer/AI**: Usare SEMPRE questo documento come riferimento definitivo
- **Per Code Alignment**: Ogni implementazione DEVE seguire questa specifica
- **Per Updates**: Qualsiasi modifica ai flussi DEVE essere prima aggiornata qui  

---

## 1️⃣ **TIPI DI MIND GARDEN**

### A. **Freestyle Mind Garden (FMG)**
- **Definizione**: Spazio di brainstorming libero, svincolato da qualsiasi progetto o board specifica
- **Quantità**: Puoi averne quanti vuoi, ognuno nasce vuoto e si popola liberamente
- **Scopo**: Pensiero parallelo, creatività senza struttura, incubazione idee anche mai promosse
- **Collegamenti**: Può essere collegato a uno o più Freestyle Scriptorium (FS)
- **Promozione**: Può diventare Project Mind Garden (PMG) in qualsiasi momento

### B. **Project Mind Garden (PMG)**
- **Definizione**: Giardino delle idee di progetto specifico
- **Origine**: Nasce promuovendo un FMG o creando direttamente un nuovo progetto
- **Funzione**: Brainstorming strategico ad alto livello di progetto
- **Output**: Genera board, note, link per lo Scriptorium di progetto
- **Visione**: Panoramica creativa dell'intero progetto

### C. **Board Mind Garden (BMG)**
- **Definizione**: Mind Garden dedicato a una singola board
- **Relazione**: SEMPRE 1:1 con la board (mai orfani)
- **Creazione**: Automatica all'origine della board
- **Scopo**: Micro-brainstorming specifico per quella board
- **Presenza**: Ogni board in FS o PS ha sempre il suo BMG

---

## 2️⃣ **TIPI DI SCRIPTORIUM**

**⚠️ IMPORTANTE**: Scriptorium NON è una semplice board, ma uno **spazio strutturato** composto da:
- Home (punto di arrivo elementi promossi)
- Board multiple
- Note
- Link  
- Nested boards
- Sistema di organizzazione (tree/sezioni)

### A. **Freestyle Scriptorium (FS)**
- **Definizione**: Workspace creativo indipendente, non associato a progetto
- **Uso**: Note rapide, raccolte, incubazione senza vincoli struttura
- **Collegamenti**: Può essere collegato a uno o più FMG
- **Promozione**: Può diventare Project Scriptorium (PS) senza perdita dati
- **Board**: Ogni board in FS ha sempre il suo BMG dedicato

### B. **Project Scriptorium (PS)**
- **Definizione**: Spazio operativo collegato a progetto specifico
- **Contenuto**: Board, note, link, nested structure del progetto
- **Input**: Riceve elementi da PMG o dai BMG delle sue board
- **Funzione**: Sede organizzativa e operativa del progetto
- **Board**: Ogni board in PS ha sempre il suo BMG dedicato

---

## 3️⃣ **FLUSSI PRINCIPALI**

### A. **Dalla Welcome Page**

L'utente può liberamente:
- **Creare/entrare** in uno o più Freestyle Mind Garden (FMG)
- **Creare/entrare** in un Project Mind Garden (PMG)  
- **Creare/entrare** in un Freestyle Scriptorium (FS)
- **Creare/entrare** in un Project Scriptorium (PS)

**Filosofia**: Tutto è libero, nessun lock-in né step forzato

### B. **Flussi FMG ↔ FS**

Da Freestyle Mind Garden (FMG) puoi promuovere:
- **Singole idee o gruppi** → Nuovo FS (con BMG per ogni board creata)
- **Singole idee o gruppi** → FS esistente  
- **L'intero FMG** → Diventa PMG associando un progetto

**Destinazione**: Gli elementi promossi appaiono sempre nella **home dello Scriptorium (FS)** e sono organizzabili dall'utente (trascinamento verso sezioni/tree)

### C. **Flussi PMG ↔ PS**

Da Project Mind Garden (PMG) puoi:
- **Promuovere idee/gruppi** → Project Scriptorium (PS)
- **Creare nuove** board/note/link nel PS
- **Arricchire** board esistenti nel PS
- **🎯 IMPORTANTE**: Dal PMG puoi generare direttamente nuove board PS senza passare da FS

**Destinazione**: Gli elementi promossi appaiono sempre nella **home dello Scriptorium (PS)** e sono organizzabili dall'utente (trascinamento verso sezioni/tree)

### D. **Flussi BMG ⇄ Board**

Ogni board (in FS o PS) ha relazione 1:1 con suo BMG:
- **Dal canvas board** → "Sali" nel BMG per ramificare idee
- **Dal BMG** → Promuovi singole idee/rami/gruppi nella board

**Destinazione**: Gli elementi promossi appaiono sempre nella **board di destinazione** e sono organizzabili dall'utente

**Bidirezionalità**: Tutti i flussi sono reversibili senza perdita dati

### E. **Flussi FS ⇄ PS**

- **FS → PS**: Assegni un progetto, diventa Project Scriptorium
- **PS → FS**: Rimuovi associazione progetto, torna Freestyle
- **Dati**: Sempre preservati, cambia solo status/tag
- **Continuità**: Nessun lock-in, transizione fluida

### F. **Home dello Scriptorium**

- **Ogni Scriptorium** (FS o PS) ha propria **home locale**
- **Elementi promossi** da qualsiasi MG arrivano sempre qui prima
- **No inbox universale** di default (puoi creare FS/PS chiamato "Inbox")
- **Visualizzazione**: Flat o strutturata secondo preferenza utente

---

## 4️⃣ **PRINCIPI CHIAVE UX & REGOLE**

### **Regole Fondamentali**

1. **Nessun lock-in**: Sempre possibile cambiare natura a Mind Garden e Scriptorium
2. **BMG sempre presente**: Ogni board ha il suo BMG (mai orfani)
3. **Home come arrival point**: Tutto arriva nella home prima di essere organizzato
4. **Bidirezionalità vera**: Puoi sempre salire/scendere tra livelli
5. **Welcome = libertà**: Centralità della scelta libera dell'utente

### **Significato delle Tipologie**

- **FMG** = Libertà, incubazione, creatività pura
- **PMG** = Visione progetto, brainstorming strategico
- **BMG** = Micro-brainstorming, focus specifico
- **FS** = Workspace senza commitment
- **PS** = Execution space con struttura progetto

---

## 🔄 **DIAGRAMMA FLUSSI COMPLETO**

```
                        🏠 WELCOME PAGE
                              ↓
        ┌────────────┬────────────┬────────────┐
        ↓            ↓            ↓            ↓
    💭 FMG       🎯 PMG       📋 FS       🚀 PS
        ↓            ↓            ↓            ↓
        └────────────┴────────────┴────────────┘
                              ↓
    ┌──────────────────────────────────────────────┐
    │         FLUSSI BIDIREZIONALI                 │
    │                                              │
    │  FMG ↔ FS  (promozione idee)               │
    │  PMG ↔ PS  (elementi progetto)             │
    │  BMG ⇄ Board  (sempre 1:1)                 │
    │  FS ⇄ PS  (cambio status)                  │
    │                                              │
    │  Destinazione: sempre HOME Scriptorium      │
    │  poi organizzabile via drag & drop          │
    └──────────────────────────────────────────────┘
```

**📊 Future Enhancement**: In futuro verrà aggiunto diagramma visuale Miro/Lucidchart per chi preferisce rappresentazioni grafiche

---

## 📱 **MOBILE-FIRST CONSIDERATIONS**

### **Touch Interactions per Tipologie**
```
Long-press su FMG → Menu: Promote to PMG, Link to FS, Duplicate
Long-press su FS → Menu: Promote to PS, Add boards, Archive
Swipe between → Navigate FMG ↔ FS, PMG ↔ PS, BMG ⇄ Board
Double-tap → Quick entry into any Mind Garden or Scriptorium
```

### **Future Mobile Gestures Enhancement**
```
Multi-touch pinch → Zoom in/out di Mind Garden o Scriptorium canvas
Three-finger swipe → Switch rapido tra FMG multipli
Four-finger pinch → Overview di tutti gli spazi attivi
Two-finger rotate → Riorganizzazione layout in Mind Garden
Edge swipe → Quick access a Scriptorium home da qualsiasi board
```
**Note**: Esempi edge case multi-touch verranno espansi con user testing su device reali

---

## ⚠️ **MIGRATION NOTES**

**Legacy Terms → New Terms:**
- "General Mind Garden" → Freestyle Mind Garden (FMG) 
- "Board" (quando significa workspace) → Scriptorium (FS/PS)
- "Dedicated Garden" → Board Mind Garden (BMG)
- "Board home" → Home dello Scriptorium

**Code Updates Required:**
- Update all type constants with FMG/PMG/BMG/FS/PS
- Add Scriptorium home concept to data model
- Implement proper promotion flows with home arrival
- Update UI to show type badges (FMG), (PMG), etc.

---

## 💎 **PHILOSOPHY**

**"In Atelier, ogni spazio creativo nasce libero e si evolve quando è pronto."**

Freestyle Mind Garden e Freestyle Scriptorium permettono di iniziare senza ansia del naming o della struttura. La promozione a Project avviene solo quando l'utente è pronto, con zero friction e totale reversibilità.

---

*Document Version: 2.0.1*  
*Last Updated: 20 July 2025*  
*Updates: GPT 4.1 refinements - PMG→PS direct flow, single source of truth, future enhancements*  
*Status: 🔒 **DEFINITIVE BIFLOW SPECIFICATION***