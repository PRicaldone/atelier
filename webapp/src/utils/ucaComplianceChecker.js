/**
 * 🚨 Universal Content Awareness (UCA) Compliance Checker
 * 
 * Utility to verify that modules and components comply with UCA Policy v2.0.1
 * as defined in /docs/BIFLOW-COMPLETE-TYPES.md
 */

// Content types that must be recognized and handled
const UCA_CONTENT_TYPES = {
  TEXT: 'text',
  MARKDOWN: 'markdown',
  CODE: 'code',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  PDF: 'pdf',
  DOCUMENT: 'document',
  LINK: 'link',
  FILE: 'file',
  BOARD: 'board',
  NOTE: 'note',
  AI: 'ai'
};

// Required capabilities for UCA compliance
const UCA_CAPABILITIES = {
  AUTO_RECOGNITION: 'auto-recognition',
  PREVIEW: 'preview',
  METADATA_PRESERVATION: 'metadata-preservation',
  AI_ACCESSIBILITY: 'ai-accessibility',
  SEAMLESS_EXPERIENCE: 'seamless-experience',
  CROSS_MODULE_FLOW: 'cross-module-flow'
};

/**
 * Check if a component/module is UCA compliant
 * @param {Object} component - Component or module to check
 * @param {string} componentName - Name for logging
 * @returns {Object} Compliance report
 */
export function checkUCACompliance(component, componentName) {
  const report = {
    componentName,
    isCompliant: true,
    issues: [],
    warnings: [],
    capabilities: {},
    contentTypes: {}
  };

  // Check for content type handlers
  Object.values(UCA_CONTENT_TYPES).forEach(type => {
    const hasHandler = checkContentTypeHandler(component, type);
    report.contentTypes[type] = hasHandler;
    if (!hasHandler) {
      report.warnings.push(`Missing handler for content type: ${type}`);
    }
  });

  // Check for required capabilities
  Object.values(UCA_CAPABILITIES).forEach(capability => {
    const hasCapability = checkCapability(component, capability);
    report.capabilities[capability] = hasCapability;
    if (!hasCapability) {
      report.issues.push(`Missing required capability: ${capability}`);
      report.isCompliant = false;
    }
  });

  // Check for metadata preservation
  if (!checkMetadataPreservation(component)) {
    report.issues.push('Component does not preserve metadata in all flows');
    report.isCompliant = false;
  }

  // Check for AI data accessibility
  if (!checkAIDataAccess(component)) {
    report.issues.push('AI assistant cannot access component data');
    report.isCompliant = false;
  }

  return report;
}

/**
 * Check if component handles specific content type
 */
function checkContentTypeHandler(component, type) {
  // Check for handler methods
  const handlerMethods = [
    `handle${capitalize(type)}`,
    `render${capitalize(type)}`,
    `process${capitalize(type)}`,
    `on${capitalize(type)}Drop`,
    `on${capitalize(type)}Paste`
  ];

  return handlerMethods.some(method => 
    typeof component[method] === 'function' ||
    (component.props && typeof component.props[method] === 'function')
  );
}

/**
 * Check if component has specific capability
 */
function checkCapability(component, capability) {
  switch (capability) {
    case UCA_CAPABILITIES.AUTO_RECOGNITION:
      return hasAutoRecognition(component);
    case UCA_CAPABILITIES.PREVIEW:
      return hasPreviewCapability(component);
    case UCA_CAPABILITIES.METADATA_PRESERVATION:
      return hasMetadataPreservation(component);
    case UCA_CAPABILITIES.AI_ACCESSIBILITY:
      return hasAIAccessibility(component);
    case UCA_CAPABILITIES.SEAMLESS_EXPERIENCE:
      return hasSeamlessExperience(component);
    case UCA_CAPABILITIES.CROSS_MODULE_FLOW:
      return hasCrossModuleFlow(component);
    default:
      return false;
  }
}

// Capability check implementations
function hasAutoRecognition(component) {
  return !!(
    component.recognizeContent ||
    component.detectContentType ||
    component.autoDetect ||
    (component.props && component.props.autoRecognize)
  );
}

function hasPreviewCapability(component) {
  return !!(
    component.renderPreview ||
    component.preview ||
    component.getPreview ||
    (component.props && component.props.enablePreview)
  );
}

function hasMetadataPreservation(component) {
  return !!(
    component.preserveMetadata ||
    component.metadata ||
    component.getMetadata ||
    (component.state && component.state.metadata)
  );
}

function hasAIAccessibility(component) {
  return !!(
    component.getAIContext ||
    component.aiData ||
    component.exportForAI ||
    (component.props && component.props.aiEnabled)
  );
}

function hasSeamlessExperience(component) {
  return !!(
    component.handleDrop &&
    component.handlePaste &&
    (component.handleDrag || component.draggable)
  );
}

function hasCrossModuleFlow(component) {
  return !!(
    component.exportData ||
    component.importData ||
    component.promote ||
    component.transfer ||
    (component.props && component.props.crossModuleEnabled)
  );
}

function checkMetadataPreservation(component) {
  // Basic check for metadata preservation
  return hasMetadataPreservation(component);
}

function checkAIDataAccess(component) {
  // Basic check for AI data access
  return hasAIAccessibility(component);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate UCA compliance report for all modules
 */
export function generateFullUCAReport(modules) {
  const fullReport = {
    timestamp: new Date().toISOString(),
    overallCompliance: true,
    moduleReports: {},
    summary: {
      compliant: 0,
      nonCompliant: 0,
      warnings: 0
    }
  };

  Object.entries(modules).forEach(([name, module]) => {
    const report = checkUCACompliance(module, name);
    fullReport.moduleReports[name] = report;
    
    if (report.isCompliant) {
      fullReport.summary.compliant++;
    } else {
      fullReport.summary.nonCompliant++;
      fullReport.overallCompliance = false;
    }
    
    fullReport.summary.warnings += report.warnings.length;
  });

  return fullReport;
}

/**
 * Console helper to display UCA compliance report
 */
export function displayUCAReport(report) {
  console.group(`🚨 UCA Compliance Report - ${report.componentName || 'Full System'}`);
  
  if (report.moduleReports) {
    // Full system report
    console.log(`📅 Generated: ${report.timestamp}`);
    console.log(`✅ Overall Compliance: ${report.overallCompliance ? 'PASS' : 'FAIL'}`);
    console.log(`📊 Summary:`, report.summary);
    
    console.group('📋 Module Details:');
    Object.entries(report.moduleReports).forEach(([name, moduleReport]) => {
      displayModuleReport(moduleReport);
    });
    console.groupEnd();
  } else {
    // Single module report
    displayModuleReport(report);
  }
  
  console.groupEnd();
}

function displayModuleReport(report) {
  const icon = report.isCompliant ? '✅' : '❌';
  console.group(`${icon} ${report.componentName}`);
  
  if (report.issues.length > 0) {
    console.error('🚫 Issues:', report.issues);
  }
  
  if (report.warnings.length > 0) {
    console.warn('⚠️ Warnings:', report.warnings);
  }
  
  console.log('🎯 Capabilities:', report.capabilities);
  console.log('📄 Content Types:', report.contentTypes);
  
  console.groupEnd();
}

// Export for use in tests and development
if (typeof window !== 'undefined') {
  window.__ucaComplianceChecker = {
    checkUCACompliance,
    generateFullUCAReport,
    displayUCAReport,
    UCA_CONTENT_TYPES,
    UCA_CAPABILITIES
  };
}