# 🧪 Mind Garden v5.1 - Manual UI Testing Guide

**Server URL**: `http://localhost:5175`  
**Date**: 2025-07-14  
**Testing Duration**: ~30 minutes  
**Focus**: Flora AI-inspired Conversational Intelligence  

---

## 🎯 **Pre-Test Checklist**

Before starting, ensure:
- [ ] Dev server running on `http://localhost:5175`
- [ ] Browser console open (F12) for error monitoring
- [ ] Fresh browser session (clear cache if needed)
- [ ] Keyboard ready for navigation testing

---

## 📋 **Test Schedule - Follow This Order**

### **Test 1: Basic Navigation & Loading (5 min)**
### **Test 2: Conversational Node Creation (5 min)**
### **Test 3: AI Intelligence & Context (5 min)**
### **Test 4: Visual Cues & State Transitions (5 min)**
### **Test 5: Keyboard Navigation & Workflow (5 min)**
### **Test 6: Export Intelligence System (5 min)**

---

## 🚀 **Test 1: Basic Navigation & Loading**

### **1.1 Initial Load**
1. Open `http://localhost:5175` in browser
2. **Expected**: Atelier home page loads
3. **Check**: No console errors
4. **Action**: Navigate to Mind Garden

### **1.2 Mind Garden Module Load**
1. Click on Mind Garden in navigation
2. **Expected**: Mind Garden v5.1 interface loads
3. **Check**: See ReactFlow canvas with dark background
4. **Check**: Top toolbar with buttons visible
5. **Check**: Instructions panel bottom-right

### **1.3 Console Error Check**
1. Open browser console (F12)
2. **Expected**: No red errors
3. **Acceptable**: Some warnings (yellow) are OK
4. **Action**: Take screenshot of console

### **✅ Test 1 Results:**
- [ ] Page loads successfully
- [ ] Mind Garden interface visible
- [ ] No critical console errors
- [ ] Navigation works

---

## 🗣️ **Test 2: Conversational Node Creation**

### **2.1 Create First Conversational Node**
1. **Action**: Double-click on empty canvas area
2. **Expected**: New conversational node appears
3. **Check**: Node in "empty" state with placeholder text
4. **Check**: Textarea is focused and ready for input
5. **Check**: Context depth indicator shows "○" (fresh start)

### **2.2 Test Node Input**
1. **Action**: Type "What are some creative NFT project ideas?"
2. **Expected**: Text appears in textarea
3. **Check**: Character count/limit if implemented
4. **Check**: Node visually updates as you type

### **2.3 Test AI Response Generation**
1. **Action**: Press Enter or click generate button
2. **Expected**: Node transitions to "thinking" state
3. **Check**: Loading animation/indicator appears
4. **Check**: Node shows pulsing or processing animation
5. **Expected**: After processing, AI response appears

### **2.4 Multiple Node Creation**
1. **Action**: Double-click canvas to create second node
2. **Action**: Type different prompt
3. **Expected**: Both nodes exist independently
4. **Check**: Each node maintains its own state

### **✅ Test 2 Results:**
- [ ] Node creation works
- [ ] Input system functional
- [ ] AI response generation works
- [ ] Multiple nodes supported

---

## 🧠 **Test 3: AI Intelligence & Context**

### **3.1 Context Chain Building**
1. **Action**: Create parent node with prompt
2. **Action**: Press Tab to create child node
3. **Expected**: Child node appears connected to parent
4. **Check**: Context depth indicator changes (○→◐)
5. **Check**: Visual connection between nodes

### **3.2 Contextual AI Response**
1. **Action**: In child node, type "Expand on that idea"
2. **Action**: Generate AI response
3. **Expected**: AI response references parent context
4. **Check**: Response is contextually relevant
5. **Check**: Response builds on parent content

### **3.3 Branch Types**
1. **Action**: Create child node with different branch type
2. **Expected**: Node shows different color/styling
3. **Check**: Branch type indicators work
4. **Check**: Visual distinction between branch types

### **3.4 Deep Context**
1. **Action**: Create 3-4 levels of nested nodes
2. **Expected**: Context depth indicators progress (○◐◑●)
3. **Check**: Deeper nodes show richer context
4. **Check**: AI responses maintain conversation thread

### **✅ Test 3 Results:**
- [ ] Context chaining works
- [ ] AI understands parent context
- [ ] Branch types functional
- [ ] Deep context maintained

---

## 🎨 **Test 4: Visual Cues & State Transitions**

### **4.1 Node State Transitions**
1. **Action**: Create node and watch state changes
2. **Expected**: empty → thinking → complete transitions
3. **Check**: Each state has distinct visual style
4. **Check**: Animations smooth and intuitive

### **4.2 Context Depth Indicators**
1. **Action**: Create nodes at different depths
2. **Expected**: Visual indicators show depth (○◐◑●)
3. **Check**: Colors change with depth
4. **Check**: Hover shows depth meaning

### **4.3 Branch Type Styling**
1. **Action**: Test different branch types
2. **Expected**: Each branch type has distinct color
3. **Check**: Exploration (blue), Refinement (purple), etc.
4. **Check**: Colors match design system

### **4.4 Selection & Interaction**
1. **Action**: Click nodes to select
2. **Expected**: Selection highlight appears
3. **Check**: Multi-select with Shift+click
4. **Check**: Hover effects work

### **✅ Test 4 Results:**
- [ ] State transitions smooth
- [ ] Visual indicators clear
- [ ] Branch styling works
- [ ] Selection system functional

---

## ⌨️ **Test 5: Keyboard Navigation & Workflow**

### **5.1 Basic Keyboard Navigation**
1. **Action**: Use Tab to navigate between nodes
2. **Expected**: Focus moves between nodes
3. **Check**: Visual focus indicators
4. **Check**: Keyboard focus follows logical order

### **5.2 Node Creation Shortcuts**
1. **Action**: Press Tab on focused node
2. **Expected**: Creates child node
3. **Action**: Press Shift+Tab
4. **Expected**: Creates sibling node

### **5.3 Keyboard Shortcuts**
1. **Action**: Press 'H' for help
2. **Expected**: Keyboard shortcuts modal opens
3. **Check**: All shortcuts documented
4. **Check**: Modal closes with Escape

### **5.4 Arrow Key Navigation**
1. **Action**: Use arrow keys to navigate
2. **Expected**: Moves focus between connected nodes
3. **Check**: Navigation follows conversation flow
4. **Check**: Visual feedback for navigation

### **✅ Test 5 Results:**
- [ ] Keyboard navigation works
- [ ] Shortcuts functional
- [ ] Help system accessible
- [ ] Navigation intuitive

---

## 📤 **Test 6: Export Intelligence System**

### **6.1 Export Button Activation**
1. **Action**: Select multiple nodes (Shift+click)
2. **Expected**: Export button becomes enabled
3. **Check**: Button changes from gray to green
4. **Check**: Tooltip shows "Export selected nodes"

### **6.2 Export Preview Modal**
1. **Action**: Click "Export to Canvas"
2. **Expected**: Enhanced export preview modal opens
3. **Check**: Modal shows template selection
4. **Check**: Canvas preview visible

### **6.3 Template Selection**
1. **Action**: Try different export templates
2. **Expected**: Preview updates for each template
3. **Check**: Project Board, Ideation Map, etc.
4. **Check**: Visual preview changes

### **6.4 Grouping Algorithms**
1. **Action**: Change grouping algorithm
2. **Expected**: Preview updates with new grouping
3. **Check**: Semantic, Topic-based, Branch-based options
4. **Check**: Statistics update

### **6.5 Export Execution**
1. **Action**: Click "Export to Canvas"
2. **Expected**: Modal closes, navigates to Canvas
3. **Check**: Canvas shows exported elements
4. **Check**: No errors in console

### **✅ Test 6 Results:**
- [ ] Export preview works
- [ ] Template selection functional
- [ ] Grouping algorithms work
- [ ] Canvas integration successful

---

## 🔧 **Advanced Testing (Optional)**

### **Thread Visualization**
1. **Action**: Click thread visualization button
2. **Expected**: Sidebar shows conversation structure
3. **Check**: Thread health indicators
4. **Check**: Navigation between threads

### **Mini-Map**
1. **Action**: Check mini-map in bottom-right
2. **Expected**: Shows overview of entire conversation
3. **Check**: Can click to navigate
4. **Check**: Updates in real-time

### **Error Handling**
1. **Action**: Disconnect internet, try AI generation
2. **Expected**: Graceful error handling
3. **Check**: Fallback responses
4. **Check**: User feedback clear

---

## 📊 **Test Results Summary**

### **Overall Score: ___/6**

| Test | Status | Issues | Notes |
|------|--------|--------|-------|
| 1. Basic Navigation | ⚪ | | |
| 2. Node Creation | ⚪ | | |
| 3. AI Intelligence | ⚪ | | |
| 4. Visual Cues | ⚪ | | |
| 5. Keyboard Navigation | ⚪ | | |
| 6. Export Intelligence | ⚪ | | |

### **Legend:**
- ✅ Pass - Works as expected
- ⚠️ Partial - Works with minor issues
- ❌ Fail - Significant problems
- ⚪ Not tested yet

### **Critical Issues Found:**
1. 
2. 
3. 

### **Minor Issues Found:**
1. 
2. 
3. 

### **Positive Highlights:**
1. 
2. 
3. 

---

## 🎯 **Next Steps**

Based on test results:
- [ ] Fix critical issues
- [ ] Address minor issues  
- [ ] Document user feedback
- [ ] Prepare for production deployment

**Testing completed by:** _______________  
**Date:** _______________  
**Overall recommendation:** _______________