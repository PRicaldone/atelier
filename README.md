# 🎨 Atelier - Enterprise Creative Platform
**Professional Creative Command Center with Enterprise Security**

An enterprise-grade creative platform featuring professional module system, security hardening, and AI integration. Built for artists, creators, and teams who need robust project management with creative workflow optimization.

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/paoloricaldone/atelier.git
cd atelier/webapp

# Install dependencies
npm install

# Run development (localhost:5174)
npm run dev

# Build production
npm run build
npm run preview
```

## 🏗️ Enterprise Architecture

### Core Technologies
- **Frontend**: React 18 + Vite + Tailwind CSS
- **State Management**: Zustand with professional middleware
- **Security**: AES-256 encryption + API proxy + CSP headers
- **AI Integration**: Secure Anthropic/OpenAI proxy
- **Deployment**: Vercel Edge Functions
- **Architecture**: Professional Module System + Event Bus

### Security Features
- **🔐 API Proxy**: Server-side key protection
- **🔐 Encrypted Storage**: AES-256-GCM for localStorage
- **🔐 Security Headers**: CSP, XSS, CSRF protection
- **🔐 Auth Framework**: Ready for Supabase/OAuth integration
- **🔐 Monitoring**: Real-time security dashboard

## 📦 Professional Module System

### 🎨 Core Creative Modules
- **Scriptorium** (Visual Canvas): Advanced drag & drop, nested boards, tree view navigation
- **Mind Garden**: ReactFlow-based mind mapping with AI integration and export system
- **Orchestra**: Content management with AI workflow automation
- **Ideas**: Commercial roadmap management with validation and export capabilities

### 🏢 Business Modules
- **Project Tracker**: Visual timeline with progress tracking and milestone management
- **Business Switcher**: Multi-business mode with isolated workspaces
- **Analytics**: Time-saved metrics and ROI calculation

### 🔧 System Architecture
- **Module Registry**: Centralized module management with lazy loading
- **Adapter Pattern**: Safe cross-module communication with error handling
- **Event Bus**: Asynchronous event-driven architecture
- **Error Tracking**: Centralized logging with real-time monitoring

### 🤖 AI & Intelligence Layer
- **AI Preview**: Risk analysis and context-aware suggestions
- **Routine Agent**: Automated health checks and maintenance
- **Analytics System**: Pattern recognition and productivity metrics

## 🔐 Security Setup

### Development Environment
```bash
# No API keys needed for development
npm run dev
# Uses secure fallback/mock responses
```

### Production Environment (Vercel)
```bash
# Required environment variables
ANTHROPIC_API_KEY=sk-ant-api03-xxx
OPENAI_API_KEY=sk-xxx
ALLOWED_ORIGINS=https://yourdomain.com
```

### Security Verification
```bash
# Check security status
npm run dev
# Click shield icon (bottom-right) to open SecurityStatus dashboard
# Verify:
# - API Proxy: connected
# - Encrypted Storage: 100% encrypted
# - Authentication: ready
```

## 🔄 Professional Development Workflow

### Git Workflow
```bash
# Feature development (MANDATORY for significant changes)
git checkout -b feature/new-module
# Develop on feature branch
git add . && git commit -m "feat: implement new module"
# Merge when complete
git checkout main && git merge feature/new-module

# Save & sync (enterprise backup system)
./atelier-save.sh "Feature complete: new module"
```

### Automated Backup System
- **Local Snapshots**: `/ATELIER-VERSIONS/` (daily)
- **Compressed Backups**: `/ATELIER-BACKUPS/` (weekly)
- **GitHub Sync**: Automatic push to backup repository
- **Documentation**: Auto-updated blueprint and cheat-sheet

## 📚 Developer Documentation

### Architecture Documentation
- **[Visual Architecture](docs/architecture-visual.md)**: Enterprise system diagrams and security architecture
- **[Security Implementation](docs/security-implementation.md)**: Comprehensive security hardening guide
- **[Blueprint v6.3](docs/blueprint-v6.3.md)**: Complete project vision and professional architecture
- **[Cheat Sheet](docs/cheat-sheet.md)**: Quick reference for development workflow

### Module Development
```bash
# Module structure
webapp/src/modules/
├── shared/
│   ├── registry/ModuleRegistry.js    # Module management
│   ├── adapters/                     # Safe cross-module communication
│   ├── events/EventBus.js           # Event-driven architecture
│   └── monitoring/ErrorTracker.js   # Centralized error logging
├── scriptorium/                     # Visual canvas module
├── mind-garden/                     # Mind mapping module
├── orchestra/                       # Content management
└── ideas/                          # Commercial roadmap
```

### Development Tools
```bash
# Debug commands (browser console)
window.__moduleRegistry.getInfo()          # Module system status
window.__eventBus.getStats()              # Event bus statistics
window.__errorTracker.getStats()          # Error tracking data
window.__secureStorage.getStorageStats()  # Encryption statistics
```

## 🚦 Enterprise Status

### ✅ Completed Features
- **Professional Module System**: Registry + Adapter Pattern + Event Bus
- **Security Hardening**: API proxy + AES-256 encryption + CSP headers
- **Enterprise Architecture**: Scalable, secure, maintainable codebase
- **Creative Modules**: Scriptorium, Mind Garden, Orchestra, Ideas
- **Monitoring**: Real-time dashboards and error tracking
- **Documentation**: Visual architecture and comprehensive guides

### 🔄 Current Development
- **Developer Experience**: Comprehensive onboarding and tooling
- **Test Coverage**: Automated testing for critical paths
- **Performance**: Optimization and monitoring
- **Analytics**: Advanced usage tracking and ROI metrics

### 🚀 Roadmap
- **Multi-User Support**: Real authentication and collaboration
- **API Integrations**: External services and webhooks
- **Mobile Optimization**: Progressive web app features
- **Advanced AI**: Context-aware automation and suggestions

## 🎨 Enterprise Features

### Core Capabilities
- **Professional Module System**: Contract-based lazy loading with error handling
- **Security Hardened**: API proxy + AES-256 encryption + CSP headers
- **Event-Driven Architecture**: Asynchronous cross-module communication
- **Real-time Monitoring**: Error tracking + performance analytics
- **Creative Workflow**: Optimized for artistic and design processes
- **Multi-Business Support**: Isolated workspaces for different business contexts

### Developer Experience
- **Hot Reload**: Instant development feedback with Vite
- **Debug Tools**: Comprehensive browser console utilities
- **Error Tracking**: Centralized logging with search and export
- **Documentation**: Auto-updated architecture and guides
- **Type Safety**: Structured contracts and validation

## 🔧 Development Commands

### Core Commands
```bash
# Development
npm run dev          # Start dev server (localhost:5174)
npm run build        # Production build
npm run preview      # Preview production build

# Code Quality
npm run lint         # ESLint checking
npm run typecheck    # TypeScript validation
npm run test         # Unit tests (when available)

# Project Management
./atelier-save.sh    # Complete backup and sync
git status           # Check git status
git log --oneline    # View commit history
```

### Debug & Monitoring
```bash
# Browser console debugging
window.__moduleRegistry.getInfo()     # Module system status
window.__eventBus.getStats()         # Event statistics
window.__errorTracker.getStats()     # Error tracking data
window.__secureStorage.getStorageStats() # Encryption stats
```

## 📈 Performance Metrics

### Current Performance
- **Build Time**: < 3 seconds (Vite optimization)
- **Hot Reload**: < 100ms (instant feedback)
- **Module Loading**: Lazy (only when needed)
- **Security Overhead**: < 5% performance impact
- **Bundle Size**: Optimized with tree-shaking

### Monitoring
- **Error Rate**: < 0.1% (centralized tracking)
- **Load Time**: < 2s (Lighthouse optimized)
- **Memory Usage**: Optimized with Zustand
- **Network Requests**: Minimized with caching

## 🤝 Contributing & Support

### Getting Started
1. **Clone & Setup**: Follow Quick Start guide above
2. **Read Documentation**: Review architecture and security docs
3. **Check Issues**: Look for `good first issue` labels
4. **Feature Branch**: Always create feature branches for changes
5. **Test Locally**: Verify all functionality before submitting

### Issue Reporting
- **Bug Reports**: Include steps to reproduce and browser info
- **Feature Requests**: Explain use case and expected behavior
- **Security Issues**: Email directly (see contact info below)

### Development Standards
- **Code Style**: Follow ESLint rules and Prettier formatting
- **Commit Messages**: Use conventional commits (`feat:`, `fix:`, `docs:`)
- **Security**: Never commit API keys or sensitive data
- **Testing**: Add tests for new features when possible

### Contact Information
- **Developer**: Paolo Ricaldone
- **Email**: paolo@ricaldone.studio
- **GitHub**: [github.com/paoloricaldone](https://github.com/paoloricaldone)
- **Issues**: [github.com/paoloricaldone/atelier/issues](https://github.com/paoloricaldone/atelier/issues)

---

## 📄 License

This project is proprietary software. All rights reserved.

For commercial use or licensing inquiries, please contact: paolo@ricaldone.studio

---

*Enterprise Documentation Complete - Last Updated: July 17, 2025*
