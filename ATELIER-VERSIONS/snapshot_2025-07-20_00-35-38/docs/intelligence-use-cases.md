# 🧠 Intelligence System - Use Cases & Examples

> Comprehensive guide to using the AI Command Bar across all Atelier modules

## 🎯 System Overview

The Intelligence System provides natural language interface to all Atelier modules through:
- **TaskAnalyzer**: Analyzes request complexity and determines routing
- **TaskCoordinator**: Intelligent task routing and execution
- **ClaudeConnectors**: Direct integration with external services
- **Orchestrator**: Complex multi-step workflows
- **ModuleContext**: Context-aware suggestions and actions

## 🎮 How to Use

### Command Bar Location
- **Mind Garden**: Top center of the canvas
- **Scriptorium**: Top center above the canvas
- **Orchestra**: Right side of the header

### Interaction Flow
1. **Type Command**: Natural language input
2. **Real-time Analysis**: See complexity and routing
3. **Execute**: Press Enter or click Execute button
4. **Result**: Action performed in the module

---

## 🌱 Mind Garden Use Cases

### 📥 Import Operations (Simple → Claude Connectors)

#### "Import my Notion pages as nodes"
- **Analysis**: Simple, Claude Connectors, 95% confidence
- **Action**: Fetches Notion pages → Creates nodes automatically
- **Result**: Hierarchical nodes with Notion content

#### "Add my Asana tasks to mind map"
- **Analysis**: Simple, Claude Connectors, 90% confidence
- **Action**: Retrieves Asana tasks → Converts to nodes
- **Result**: Task nodes with status and priority

#### "Load Google Drive files as visual nodes"
- **Analysis**: Simple, Claude Connectors, 88% confidence
- **Action**: Scans Drive → Creates nodes with file previews
- **Result**: Visual nodes with file metadata

### 📤 Export Operations (Medium → Hybrid)

#### "Export selected nodes to Scriptorium board"
- **Analysis**: Medium, Hybrid, 85% confidence
- **Action**: Converts nodes → Creates Scriptorium elements
- **Result**: Seamless transfer preserving relationships

#### "Save mind map as PDF to Drive"
- **Analysis**: Medium, Hybrid, 80% confidence
- **Action**: Renders mind map → Saves to Google Drive
- **Result**: PDF saved with share link

### 🔄 Complex Workflows (Complex → Orchestrator)

#### "When I add a new project node, create corresponding Asana project, Notion page, and Drive folder"
- **Analysis**: Complex, Orchestrator, 95% confidence
- **Action**: Multi-step workflow triggered by node creation
- **Result**: Synchronized project structure across platforms

#### "Create knowledge graph from all my documents"
- **Analysis**: Complex, Orchestrator, 85% confidence
- **Action**: Analyzes documents → Creates connected concepts
- **Result**: Comprehensive knowledge visualization

---

## 🎨 Scriptorium Use Cases

### 📊 Dashboard Creation (Medium → Hybrid)

#### "Create dashboard with my Drive files and Asana tasks"
- **Analysis**: Medium, Hybrid, 90% confidence
- **Action**: Aggregates data → Creates visual dashboard
- **Result**: Professional dashboard with live data

#### "Build client presentation board"
- **Analysis**: Medium, Hybrid, 85% confidence
- **Action**: Template-based board creation
- **Result**: Polished presentation ready for client

### 📁 Data Import (Simple → Claude Connectors)

#### "Add Notion meeting notes to board"
- **Analysis**: Simple, Claude Connectors, 95% confidence
- **Action**: Fetches notes → Creates note elements
- **Result**: Organized meeting notes on canvas

#### "Import Airtable records as visual cards"
- **Analysis**: Simple, Claude Connectors, 88% confidence
- **Action**: Loads records → Creates card elements
- **Result**: Visual data representation

### 🔧 Complex Operations (Complex → Orchestrator)

#### "Generate project report and save to Drive"
- **Analysis**: Complex, Orchestrator, 90% confidence
- **Action**: Analyzes board → Generates report → Saves to Drive
- **Result**: Professional report with charts and insights

#### "Create automated client approval workflow"
- **Analysis**: Complex, Orchestrator, 85% confidence
- **Action**: Sets up approval process with notifications
- **Result**: Streamlined client collaboration

---

## 🎼 Orchestra Use Cases

### 📅 Campaign Management (Medium → Hybrid)

#### "Schedule content from current campaign"
- **Analysis**: Medium, Hybrid, 92% confidence
- **Action**: Optimizes posting schedule → Multi-platform deployment
- **Result**: Automated content calendar

#### "Create multi-platform campaign"
- **Analysis**: Medium, Hybrid, 88% confidence
- **Action**: Adapts content for each platform
- **Result**: Coordinated campaign across channels

### 📊 Analytics & Reporting (Simple → Claude Connectors)

#### "Analyze campaign performance"
- **Analysis**: Simple, Claude Connectors, 95% confidence
- **Action**: Aggregates metrics → Generates insights
- **Result**: Performance dashboard with recommendations

#### "Create weekly performance report"
- **Analysis**: Simple, Claude Connectors, 90% confidence
- **Action**: Compiles data → Creates report
- **Result**: Automated weekly insights

### 🤖 Automation Workflows (Complex → Orchestrator)

#### "Launch complete marketing campaign: content creation, scheduling, monitoring, and reporting"
- **Analysis**: Complex, Orchestrator, 95% confidence
- **Action**: End-to-end campaign automation
- **Result**: Fully automated marketing pipeline

#### "Setup automated client onboarding workflow"
- **Analysis**: Complex, Orchestrator, 88% confidence
- **Action**: Creates onboarding sequence with touchpoints
- **Result**: Streamlined client experience

---

## 🌐 Cross-Module Workflows

### 🔄 End-to-End Pipelines

#### "Create content calendar from mind map, visualize in Scriptorium, execute in Orchestra"
- **Analysis**: Complex, Orchestrator, 90% confidence
- **Action**: Multi-module workflow with handoffs
- **Result**: Seamless content pipeline

#### "Generate weekly productivity report from all modules"
- **Analysis**: Complex, Orchestrator, 85% confidence
- **Action**: Aggregates data across modules
- **Result**: Unified productivity insights

### 🎯 Smart Routing Examples

#### Simple Tasks (Direct to Claude Connectors)
- "Show me my Notion pages"
- "List my Drive files"
- "Get my Asana tasks"

#### Medium Tasks (Hybrid Routing)
- "Create board with my project files"
- "Export mind map to PDF"
- "Schedule social media posts"

#### Complex Tasks (Orchestrator Workflows)
- "When project milestone reached, update mind map, create celebration board, and notify team"
- "Automate client onboarding with document generation and task assignment"
- "Create comprehensive project report with data from all modules"

---

## 🎮 Testing Commands

### Console Testing
```javascript
// Test task analysis
window.__taskAnalyzer.analyzeTask('Create mind map from my Notion pages')

// Test execution
window.__taskCoordinator.executeTask('Show me my Google Drive files')

// Test connectors
window.__claudeConnectorsAdapter.testAllConnectors()

// Test context
window.__moduleContext.getContextSuggestions('mind-garden')
```

### Live Testing Examples

#### Mind Garden
- "Import my Notion project pages as nodes"
- "Create connections between related concepts"
- "Export selected branch to Scriptorium board"

#### Scriptorium
- "Create dashboard with my Drive files"
- "Add Asana tasks as visual cards"
- "Generate project report and save to Drive"

#### Orchestra
- "Schedule content from current campaign"
- "Create automation workflow"
- "Launch multi-channel campaign"

---

## 📊 Performance Expectations

### Response Times
- **Simple Tasks**: 200-500ms (Direct connector calls)
- **Medium Tasks**: 500-2000ms (Hybrid routing with analysis)
- **Complex Tasks**: 2-10s (Multi-step orchestration)

### Success Rates
- **Simple Tasks**: 95%+ (Direct API calls)
- **Medium Tasks**: 85%+ (Hybrid routing)
- **Complex Tasks**: 80%+ (Orchestration workflows)

### Complexity Analysis
- **Simple**: 1-2 services, read operations
- **Medium**: 2-3 services, data transformation
- **Complex**: 3+ services, multi-step workflows

---

## 🛠️ Troubleshooting

### Common Issues

#### "Analysis shows low confidence"
- **Cause**: Ambiguous command or unsupported operation
- **Solution**: Be more specific about desired action

#### "Execution fails with timeout"
- **Cause**: Complex operation taking too long
- **Solution**: Break down into smaller tasks

#### "No suggestions appear"
- **Cause**: Module context not properly set
- **Solution**: Refresh page or check console for errors

### Debug Commands
```javascript
// Check module context
window.__moduleContext.getStats()

// View analysis history
window.__taskAnalyzer.getStats()

// Check execution queue
window.__taskCoordinator.getStats()

// Test specific connectors
window.__claudeConnectorsAdapter.getAllConnectorsStatus()
```

---

## 🚀 Future Enhancements

### Voice Input
- Speech-to-text integration
- Voice commands for hands-free operation
- Audio feedback for execution status

### Learning System
- User behavior analysis
- Personalized suggestions
- Improved confidence scoring

### Advanced Workflows
- Conditional logic in orchestration
- Template-based workflow creation
- Workflow sharing between users

---

*Intelligence System Documentation v1.0*  
*Last Updated: 2025-07-17*  
*For support: Use console commands above or check `/monitoring` dashboard*