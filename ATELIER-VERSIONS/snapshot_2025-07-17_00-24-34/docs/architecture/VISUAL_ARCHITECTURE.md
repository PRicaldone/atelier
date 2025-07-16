# 🎨 Atelier Visual Architecture Documentation

> Visual representation of the enterprise-grade module system

## 🏗️ System Architecture Overview

```mermaid
graph TB
    subgraph "🌐 Browser Layer"
        UI[User Interface]
        Routes[React Router]
        Components[Module Components]
    end

    subgraph "🏛️ Module System Core"
        Registry[Module Registry]
        EventBus[Event Bus]
        Adapters[Module Adapters]
        Contracts[Interface Contracts]
    end

    subgraph "📊 Monitoring & Observability"
        HealthChecks[Health Check Manager]
        ErrorTracker[Error Tracker]
        AlertSystem[Alerting System]
        TestSuite[Integration Tests]
    end

    subgraph "📜 Business Modules"
        Scriptorium[Scriptorium Module]
        MindGarden[Mind Garden Module]
        Orchestra[Orchestra Module]
    end

    subgraph "💾 Data Layer"
        LocalStorage[Local Storage]
        ProjectStore[Project Store]
        UnifiedStore[Unified Store]
    end

    UI --> Routes
    Routes --> Components
    Components --> Registry
    Registry --> Adapters
    Adapters --> EventBus
    EventBus --> Scriptorium
    EventBus --> MindGarden
    EventBus --> Orchestra
    
    Registry --> HealthChecks
    HealthChecks --> AlertSystem
    ErrorTracker --> AlertSystem
    TestSuite --> HealthChecks
    
    Scriptorium --> LocalStorage
    MindGarden --> ProjectStore
    Orchestra --> UnifiedStore
```

---

## 🔄 Module Communication Flow

```mermaid
sequenceDiagram
    participant MG as Mind Garden
    participant EB as Event Bus
    participant AD as Canvas Adapter
    participant SC as Scriptorium
    participant HS as Health System
    participant AS as Alert System

    MG->>EB: emit('mindgarden:export:requested')
    EB->>AD: forward event
    AD->>SC: addElement(data)
    SC-->>AD: elementId
    AD->>EB: emit('export:completed')
    EB->>MG: notify completion

    Note over HS: Continuous Health Monitoring
    HS->>SC: ping()
    SC-->>HS: healthy
    
    Note over AS: Alert on Issues
    HS->>AS: module:dead
    AS->>Browser: notification
```

---

## 🏛️ Module Registry Architecture

```mermaid
classDiagram
    class ModuleRegistry {
        +Map~string,Module~ modules
        +Map~string,Adapter~ adapters
        +register(name, factory, options)
        +getModule(name)
        +hasModule(name)
        +invoke(name, method, ...args)
        +getInfo()
    }

    class BaseAdapter {
        +string[] moduleNames
        +Logger logger
        +init()
        +_getStore()
    }

    class CanvasAdapter {
        +addElement(type, position, data)
        +removeElement(id)
        +updateElement(id, data)
        +getElements()
    }

    class MindGardenAdapter {
        +exportNodeToCanvas(nodeId)
        +exportNodesToCanvas(nodeIds)
        +createNode(data)
        +deleteNode(id)
    }

    class EventBus {
        +Map~string,Function[]~ events
        +on(event, handler)
        +emit(event, data)
        +off(event, handler)
        +getStats()
    }

    ModuleRegistry --> BaseAdapter
    BaseAdapter <|-- CanvasAdapter
    BaseAdapter <|-- MindGardenAdapter
    ModuleRegistry --> EventBus
```

---

## 📊 Health Check System Architecture

```mermaid
stateDiagram-v2
    [*] --> Initializing
    Initializing --> Healthy: Ping Success
    Initializing --> Dead: Ping Timeout
    
    Healthy --> Warning: Slow Response
    Healthy --> Critical: Errors Detected
    Healthy --> Dead: Ping Timeout
    
    Warning --> Healthy: Response Improved
    Warning --> Critical: More Errors
    Warning --> Dead: Ping Timeout
    
    Critical --> Warning: Errors Reduced
    Critical --> Dead: Ping Timeout
    Critical --> Restarting: Auto Restart
    
    Dead --> Restarting: Auto Restart
    Restarting --> Healthy: Restart Success
    Restarting --> Dead: Restart Failed
    
    Dead --> [*]: Manual Reset
```

---

## 🚨 Alerting System Flow

```mermaid
flowchart TD
    A[Alert Triggered] --> B{Severity Check}
    B -->|Below Threshold| C[Discard]
    B -->|Above Threshold| D{Deduplication}
    
    D -->|Duplicate| E[Skip - Rate Limited]
    D -->|Unique| F{Rate Limiting}
    
    F -->|Rate Exceeded| G[Queue for Later]
    F -->|Rate OK| H[Process Alert]
    
    H --> I[Console Channel]
    H --> J[Browser Notification]
    H --> K[Email Channel]
    H --> L[Webhook Channel]
    H --> M[Telegram Channel]
    
    I --> N[Store in History]
    J --> N
    K --> N
    L --> N
    M --> N
    
    N --> O[Update Metrics]
    G --> P[Retry Later]
    P --> D
```

---

## 🧪 Integration Testing Architecture

```mermaid
graph LR
    subgraph "Test Suite"
        TR[Test Runner]
        TC[Test Cases]
        MP[Mock Providers]
    end

    subgraph "Test Categories"
        T1[Module Registry Tests]
        T2[Event Bus Tests]
        T3[Adapter Tests]
        T4[Health Check Tests]
        T5[Performance Tests]
    end

    subgraph "Test Execution"
        EX[Execute Tests]
        VA[Validate Results]
        RE[Generate Report]
    end

    TR --> TC
    TC --> T1
    TC --> T2
    TC --> T3
    TC --> T4
    TC --> T5
    
    T1 --> MP
    T2 --> MP
    T3 --> MP
    T4 --> MP
    T5 --> MP
    
    MP --> EX
    EX --> VA
    VA --> RE
```

---

## 📱 User Interface Architecture

```mermaid
graph TB
    subgraph "🎯 Main Application"
        App[App.jsx]
        Layout[Layout Component]
        Router[React Router]
    end

    subgraph "🏛️ Core Modules"
        S[Scriptorium /scriptorium]
        MG[Mind Garden /mind-garden]
        O[Orchestra /orchestra]
    end

    subgraph "🔧 System Modules"
        Mon[Monitoring /monitoring]
        Test[Tests /tests]
        Alert[Alerts /alerts]
    end

    subgraph "🎨 UI Components"
        Nav[Navigation Bar]
        Side[Sidebar]
        Quick[Quick Access]
    end

    subgraph "🗄️ State Management"
        US[Unified Store]
        PS[Project Store]
        MS[Module Stores]
    end

    App --> Layout
    Layout --> Router
    Layout --> Nav
    Layout --> Side
    
    Router --> S
    Router --> MG
    Router --> O
    Router --> Mon
    Router --> Test
    Router --> Alert
    
    Nav --> Quick
    Quick --> US
    
    S --> MS
    MG --> MS
    O --> MS
    
    MS --> PS
    PS --> US
```

---

## 🔄 Data Flow Architecture

```mermaid
flowchart TD
    subgraph "User Actions"
        Click[User Click]
        Type[User Input]
        Nav[Navigation]
    end

    subgraph "State Updates"
        Store[Module Store]
        Action[Store Action]
        State[State Change]
    end

    subgraph "Cross-Module Communication"
        Event[Event Emission]
        Bus[Event Bus]
        Handler[Event Handler]
    end

    subgraph "Persistence"
        Local[Local Storage]
        Session[Session Storage]
        Memory[Memory State]
    end

    subgraph "Monitoring"
        Health[Health Check]
        Error[Error Tracking]
        Perf[Performance Metrics]
    end

    Click --> Action
    Type --> Action
    Nav --> Action
    
    Action --> Store
    Store --> State
    State --> Event
    
    Event --> Bus
    Bus --> Handler
    Handler --> Store
    
    State --> Local
    State --> Session
    State --> Memory
    
    Action --> Health
    Action --> Error
    Action --> Perf
```

---

## 🏗️ Module Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Registration: Module Discovery
    Registration --> Loading: Registry.register()
    Loading --> Initializing: Dynamic Import
    Initializing --> Ready: Store Created
    
    Ready --> Active: User Navigation
    Active --> Idle: User Leaves
    Idle --> Active: User Returns
    
    Active --> HealthCheck: Continuous Monitoring
    HealthCheck --> Active: Healthy
    HealthCheck --> Warning: Performance Issues
    HealthCheck --> Error: Critical Issues
    
    Warning --> Active: Issues Resolved
    Error --> Recovery: Auto Restart
    Recovery --> Active: Restart Success
    Recovery --> Failed: Restart Failed
    
    Failed --> Unregistered: Manual Cleanup
    Unregistered --> [*]: Module Removed
```

---

## 📊 Performance Monitoring

```mermaid
graph LR
    subgraph "Performance Metrics"
        RT[Response Time]
        TH[Throughput]
        ER[Error Rate]
        MU[Memory Usage]
    end

    subgraph "Collection Points"
        MA[Module Actions]
        CC[Cross-Communication]
        HC[Health Checks]
        UI[UI Interactions]
    end

    subgraph "Analysis"
        BA[Baseline Comparison]
        TR[Trend Analysis]
        AL[Alert Thresholds]
        RP[Performance Reports]
    end

    MA --> RT
    CC --> TH
    HC --> ER
    UI --> MU
    
    RT --> BA
    TH --> TR
    ER --> AL
    MU --> RP
    
    BA --> Dashboard
    TR --> Dashboard
    AL --> AlertSystem
    RP --> Dashboard
```

---

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Input Validation"
        UV[User Input Validation]
        AP[API Parameter Validation]
        EV[Event Data Validation]
    end

    subgraph "Access Control"
        MG[Module Guards]
        RC[Route Control]
        AC[Action Control]
    end

    subgraph "Data Protection"
        LS[Local Storage Encryption]
        SC[Secure Communication]
        AL[Audit Logging]
    end

    subgraph "Error Handling"
        SE[Secure Error Messages]
        LK[No Information Leakage]
        ER[Error Recovery]
    end

    UV --> MG
    AP --> RC
    EV --> AC
    
    MG --> LS
    RC --> SC
    AC --> AL
    
    LS --> SE
    SC --> LK
    AL --> ER
```

---

## 🚀 Deployment Architecture

```mermaid
graph TD
    subgraph "Development"
        DEV[Local Development]
        TEST[Unit Testing]
        INT[Integration Testing]
    end

    subgraph "CI/CD Pipeline"
        BUILD[Build Process]
        VALIDATE[Validation Tests]
        DEPLOY[Deployment]
    end

    subgraph "Production"
        CDN[CDN Distribution]
        MON[Production Monitoring]
        BACKUP[Backup Systems]
    end

    subgraph "Rollback Strategy"
        SNAP[Snapshots]
        RESTORE[Quick Restore]
        HOT[Hotfix Deployment]
    end

    DEV --> BUILD
    TEST --> VALIDATE
    INT --> VALIDATE
    
    BUILD --> DEPLOY
    VALIDATE --> DEPLOY
    
    DEPLOY --> CDN
    CDN --> MON
    MON --> BACKUP
    
    BACKUP --> SNAP
    SNAP --> RESTORE
    RESTORE --> HOT
```

---

## 📈 Scalability Model

```mermaid
graph TB
    subgraph "Horizontal Scaling"
        LB[Load Balancer]
        I1[Instance 1]
        I2[Instance 2]
        I3[Instance N]
    end

    subgraph "Module Scaling"
        REG[Module Registry]
        MS[Microservices]
        API[API Gateway]
    end

    subgraph "Data Scaling"
        SHARD[Data Sharding]
        CACHE[Caching Layer]
        DB[Database Cluster]
    end

    subgraph "Performance Optimization"
        LAZY[Lazy Loading]
        COD[Code Splitting]
        MEMO[Memoization]
    end

    LB --> I1
    LB --> I2
    LB --> I3
    
    I1 --> REG
    I2 --> REG
    I3 --> REG
    
    REG --> MS
    MS --> API
    
    API --> SHARD
    SHARD --> CACHE
    CACHE --> DB
    
    LAZY --> COD
    COD --> MEMO
```

---

## 🎯 Module Interaction Matrix

| From ↓ / To → | Scriptorium | Mind Garden | Orchestra | Monitoring | Testing | Alerting |
|----------------|-------------|-------------|-----------|------------|---------|----------|
| **Scriptorium** | ✅ Internal | ⚡ Events | ⚡ Events | 📊 Health | 🧪 Tests | 🚨 Alerts |
| **Mind Garden** | 🔄 Export | ✅ Internal | ⚡ Events | 📊 Health | 🧪 Tests | 🚨 Alerts |
| **Orchestra** | 🔄 Import | 🔄 Import | ✅ Internal | 📊 Health | 🧪 Tests | 🚨 Alerts |
| **Monitoring** | 📊 Monitor | 📊 Monitor | 📊 Monitor | ✅ Internal | 🔗 Status | 🔗 Events |
| **Testing** | 🧪 Validate | 🧪 Validate | 🧪 Validate | 🔗 Report | ✅ Internal | 🚨 Results |
| **Alerting** | 🚨 Notify | 🚨 Notify | 🚨 Notify | 📊 Metrics | 🚨 Failures | ✅ Internal |

### Legend:
- ✅ **Internal**: Module self-operations
- 🔄 **Data Flow**: Cross-module data transfer
- ⚡ **Events**: Event-based communication
- 📊 **Monitoring**: Health and performance tracking
- 🧪 **Testing**: Automated validation
- 🚨 **Alerting**: Notification and alerts
- 🔗 **Integration**: System integration points

---

## 📝 Architecture Decision Records (ADRs)

### ADR-001: Module Registry Pattern
**Decision**: Use centralized module registry with adapters  
**Rationale**: Enables loose coupling and safe module replacement  
**Impact**: Zero breaking changes during module updates

### ADR-002: Event-Driven Communication
**Decision**: Implement async event bus for cross-module communication  
**Rationale**: Prevents tight coupling and circular dependencies  
**Impact**: Improved system resilience and testability

### ADR-003: Health Check System
**Decision**: Automated health monitoring with auto-recovery  
**Rationale**: Proactive issue detection and system stability  
**Impact**: Reduced downtime and improved user experience

### ADR-004: Integrated Testing Suite
**Decision**: Comprehensive integration testing with real-time execution  
**Rationale**: Ensure system reliability and catch regressions early  
**Impact**: Higher confidence in deployments and faster development

### ADR-005: Multi-Channel Alerting
**Decision**: Support multiple notification channels with rate limiting  
**Rationale**: Flexible alerting without notification spam  
**Impact**: Better incident response and reduced alert fatigue

---

*Visual Architecture Documentation v1.0.0*  
*Generated by Atelier Professional Architecture System*  
*Last Updated: 2025-07-17*