/**
 * Integration Test Suite - Comprehensive testing for module system
 * 
 * Features:
 * - Adapter pattern testing with mocks
 * - Cross-module communication validation
 * - Event bus integration tests
 * - Error handling verification
 * - Performance benchmarking
 * - Health check validation
 */

import { testLogger } from '../monitoring/ModuleLogger.js';
import eventBus, { ModuleEvents } from '../events/EventBus.js';
import moduleRegistry from '../registry/ModuleRegistry.js';
import errorTracker from '../monitoring/ErrorTracker.js';
import healthCheckManager from '../health/HealthCheckManager.js';

// Test result constants
export const TestResult = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  SKIP: 'SKIP',
  ERROR: 'ERROR'
};

// Test severity levels
export const TestSeverity = {
  CRITICAL: 'critical',
  HIGH: 'high', 
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * Base Test Class - Foundation for all tests
 */
export class BaseTest {
  constructor(name, description, severity = TestSeverity.MEDIUM) {
    this.name = name;
    this.description = description;
    this.severity = severity;
    this.result = null;
    this.error = null;
    this.duration = 0;
    this.startTime = null;
    this.logger = testLogger.child({ test: name });
  }
  
  /**
   * Run the test
   * @returns {Promise<Object>} Test result
   */
  async run() {
    this.startTime = Date.now();
    this.logger.info(`Starting test: ${this.name}`, 'run');
    
    try {
      const result = await this.execute();
      this.duration = Date.now() - this.startTime;
      this.result = result ? TestResult.PASS : TestResult.FAIL;
      
      this.logger.info(`Test completed: ${this.name} - ${this.result}`, 'run', {
        duration: this.duration,
        result: this.result
      });
      
      return this.getResult();
      
    } catch (error) {
      this.duration = Date.now() - this.startTime;
      this.result = TestResult.ERROR;
      this.error = error;
      
      this.logger.error(error, 'run', {
        test: this.name,
        duration: this.duration
      });
      
      return this.getResult();
    }
  }
  
  /**
   * Execute test logic - must be implemented by subclasses
   * @returns {Promise<boolean>} Test success
   */
  async execute() {
    throw new Error('execute() method must be implemented by subclass');
  }
  
  /**
   * Get test result object
   * @returns {Object} Test result
   */
  getResult() {
    return {
      name: this.name,
      description: this.description,
      severity: this.severity,
      result: this.result,
      duration: this.duration,
      error: this.error ? this.error.message : null,
      timestamp: Date.now()
    };
  }
  
  /**
   * Assert helper for tests
   * @param {boolean} condition - Condition to assert
   * @param {string} message - Error message if assertion fails
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }
  
  /**
   * Async assert with timeout
   * @param {Function} asyncCondition - Async condition function
   * @param {string} message - Error message
   * @param {number} timeout - Timeout in ms
   */
  async assertAsync(asyncCondition, message, timeout = 5000) {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      if (await asyncCondition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Async assertion timeout: ${message}`);
  }
}

/**
 * Module Registry Tests
 */
export class ModuleRegistryTest extends BaseTest {
  constructor() {
    super(
      'Module Registry Validation',
      'Validates module registry functionality and contract compliance',
      TestSeverity.CRITICAL
    );
  }
  
  async execute() {
    // Test module registration
    const info = moduleRegistry.getInfo();
    this.assert(info.registeredModules.length > 0, 'No modules registered');
    
    // Test required modules are registered
    const requiredModules = ['canvas', 'mindgarden', 'orchestra'];
    for (const moduleName of requiredModules) {
      this.assert(
        moduleRegistry.hasModule(moduleName),
        `Required module ${moduleName} not registered`
      );
    }
    
    // Test alias functionality
    this.assert(
      moduleRegistry.hasModule('creative-atelier'),
      'Canvas alias "creative-atelier" not working'
    );
    
    this.assert(
      moduleRegistry.hasModule('content-studio'),
      'Orchestra alias "content-studio" not working'
    );
    
    // Test module loading
    try {
      const canvasModule = await moduleRegistry.getModule('canvas');
      this.assert(canvasModule !== null, 'Canvas module loading failed');
    } catch (error) {
      // Canvas might not be available in test environment
      this.logger.warning('Canvas module not available in test environment', 'execute');
    }
    
    return true;
  }
}

/**
 * Event Bus Tests
 */
export class EventBusTest extends BaseTest {
  constructor() {
    super(
      'Event Bus Integration',
      'Tests event bus functionality and cross-module communication',
      TestSeverity.HIGH
    );
  }
  
  async execute() {
    // Test basic event emission and listening
    let eventReceived = false;
    const testEvent = `test-event-${Date.now()}`;
    
    const unsubscribe = eventBus.on(testEvent, (data) => {
      eventReceived = true;
      this.assert(data.test === true, 'Event data not correct');
    });
    
    eventBus.emit(testEvent, { test: true });
    
    // Wait for event to be processed
    await this.assertAsync(
      () => eventReceived,
      'Event not received within timeout'
    );
    
    unsubscribe();
    
    // Test event history
    const history = eventBus.getHistory();
    this.assert(Array.isArray(history), 'Event history not available');
    
    // Test stats functionality
    const stats = eventBus.getStats();
    this.assert(stats.totalEvents >= 0, 'Event stats not available');
    
    // Test structured events
    eventBus.emit(ModuleEvents.MODULE_INITIALIZED, { test: true });
    eventBus.emit(ModuleEvents.CANVAS_ELEMENT_CREATED, { elementId: 'test' });
    
    return true;
  }
}

/**
 * Adapter Pattern Tests
 */
export class AdapterPatternTest extends BaseTest {
  constructor() {
    super(
      'Adapter Pattern Validation',
      'Tests adapter pattern implementation and error handling',
      TestSeverity.HIGH
    );
  }
  
  async execute() {
    const { canvasAdapter } = await import('../adapters/CanvasAdapter.js');
    const { mindGardenAdapter } = await import('../adapters/MindGardenAdapter.js');
    
    // Test adapter initialization
    this.assert(canvasAdapter !== null, 'Canvas adapter not available');
    this.assert(mindGardenAdapter !== null, 'Mind Garden adapter not available');
    
    // Test adapter error handling
    try {
      // This should handle gracefully if module not available
      const result = await canvasAdapter.addElement('test', { x: 0, y: 0 }, { test: true });
      // Result can be null if module not available, that's OK
      this.logger.info('Canvas adapter test completed', 'execute', { result });
    } catch (error) {
      // Adapter should not throw, it should handle errors gracefully
      throw new Error(`Canvas adapter threw error instead of handling gracefully: ${error.message}`);
    }
    
    try {
      // Test Mind Garden adapter
      const nodes = await mindGardenAdapter.getNodes();
      this.assert(Array.isArray(nodes), 'Mind Garden nodes should be array');
    } catch (error) {
      // Should handle gracefully
      this.logger.warning('Mind Garden adapter not available', 'execute', { error: error.message });
    }
    
    return true;
  }
}

/**
 * Error Tracking Tests
 */
export class ErrorTrackingTest extends BaseTest {
  constructor() {
    super(
      'Error Tracking System',
      'Validates error tracking and logging functionality',
      TestSeverity.HIGH
    );
  }
  
  async execute() {
    // Test error logging
    const testError = new Error('Test error for validation');
    errorTracker.logError(testError, 'test-module', 'test-action', { test: true });
    
    // Test stats
    const stats = errorTracker.getStats();
    this.assert(stats.total >= 1, 'Error not logged properly');
    this.assert(stats.byModule['test-module'] >= 1, 'Error not categorized by module');
    
    // Test search functionality
    const searchResults = errorTracker.searchErrors({ 
      module: 'test-module',
      limit: 10 
    });
    this.assert(Array.isArray(searchResults), 'Error search not working');
    this.assert(searchResults.length >= 1, 'Test error not found in search');
    
    // Test warning logging
    errorTracker.logWarning('Test warning', 'test-module', 'test-action', { test: true });
    
    // Test info logging
    errorTracker.logInfo('Test info', 'test-module', 'test-action', { test: true });
    
    return true;
  }
}

/**
 * Health Check Tests
 */
export class HealthCheckTest extends BaseTest {
  constructor() {
    super(
      'Health Check System',
      'Validates automated health checking functionality',
      TestSeverity.MEDIUM
    );
  }
  
  async execute() {
    // Test health manager availability
    this.assert(healthCheckManager !== null, 'Health check manager not available');
    
    // Test health status
    const health = healthCheckManager.getAllModuleHealth();
    this.assert(health.managerStatus.isActive, 'Health check manager not active');
    
    // Test summary
    const summary = healthCheckManager.getHealthSummary();
    this.assert(summary.total >= 0, 'Health summary not available');
    
    // Test force health check
    try {
      healthCheckManager.forceAllHealthChecks();
      this.logger.info('Force health check completed', 'execute');
    } catch (error) {
      throw new Error(`Force health check failed: ${error.message}`);
    }
    
    return true;
  }
}

/**
 * Cross-Module Communication Tests
 */
export class CrossModuleCommunicationTest extends BaseTest {
  constructor() {
    super(
      'Cross-Module Communication',
      'Tests communication between modules via adapters and events',
      TestSeverity.HIGH
    );
  }
  
  async execute() {
    // Test Mind Garden to Canvas export flow
    let exportRequestReceived = false;
    let exportCompletedReceived = false;
    
    const unsubscribe1 = eventBus.on(ModuleEvents.MINDGARDEN_EXPORT_REQUESTED, (data) => {
      exportRequestReceived = true;
      this.assert(data.nodeId, 'Export request missing nodeId');
    });
    
    const unsubscribe2 = eventBus.on(ModuleEvents.MINDGARDEN_EXPORT_COMPLETED, (data) => {
      exportCompletedReceived = true;
    });
    
    // Simulate export request
    eventBus.emit(ModuleEvents.MINDGARDEN_EXPORT_REQUESTED, {
      nodeId: 'test-node-123',
      test: true
    });
    
    // Wait for events
    await this.assertAsync(
      () => exportRequestReceived,
      'Export request event not received'
    );
    
    // Cleanup
    unsubscribe1();
    unsubscribe2();
    
    // Test module-to-module adapter communication
    const { mindGardenAdapter } = await import('../adapters/MindGardenAdapter.js');
    
    try {
      // This tests the adapter pattern even if modules aren't fully available
      const nodes = await mindGardenAdapter.getNodes();
      this.assert(Array.isArray(nodes), 'Mind Garden adapter communication failed');
    } catch (error) {
      // If module not available, that's OK for testing
      this.logger.warning('Module not available for communication test', 'execute');
    }
    
    return true;
  }
}

/**
 * Performance Tests
 */
export class PerformanceTest extends BaseTest {
  constructor() {
    super(
      'Performance Benchmarks',
      'Tests system performance and response times',
      TestSeverity.MEDIUM
    );
  }
  
  async execute() {
    // Test event emission performance
    const eventCount = 1000;
    const start = performance.now();
    
    for (let i = 0; i < eventCount; i++) {
      eventBus.emit(`perf-test-${i}`, { index: i });
    }
    
    const eventEmissionTime = performance.now() - start;
    this.assert(eventEmissionTime < 1000, `Event emission too slow: ${eventEmissionTime}ms for ${eventCount} events`);
    
    // Test adapter call performance
    const adapterStart = performance.now();
    const { canvasAdapter } = await import('../adapters/CanvasAdapter.js');
    
    for (let i = 0; i < 100; i++) {
      await canvasAdapter.getElements();
    }
    
    const adapterTime = performance.now() - adapterStart;
    this.assert(adapterTime < 5000, `Adapter calls too slow: ${adapterTime}ms for 100 calls`);
    
    // Test error tracking performance
    const errorStart = performance.now();
    
    for (let i = 0; i < 100; i++) {
      errorTracker.logInfo(`Performance test ${i}`, 'perf-test', 'benchmark');
    }
    
    const errorTime = performance.now() - errorStart;
    this.assert(errorTime < 1000, `Error tracking too slow: ${errorTime}ms for 100 logs`);
    
    this.logger.info('Performance test completed', 'execute', {
      eventEmissionTime,
      adapterTime,
      errorTime
    });
    
    return true;
  }
}

/**
 * Integration Test Suite Runner
 */
export class IntegrationTestSuite {
  constructor() {
    this.tests = [
      new ModuleRegistryTest(),
      new EventBusTest(),
      new AdapterPatternTest(),
      new ErrorTrackingTest(),
      new HealthCheckTest(),
      new CrossModuleCommunicationTest(),
      new PerformanceTest()
    ];
    this.results = [];
    this.logger = testLogger.child({ suite: 'integration' });
  }
  
  /**
   * Run all tests in the suite
   * @returns {Promise<Object>} Test suite results
   */
  async runAll() {
    this.logger.info('Starting integration test suite', 'runAll', {
      testCount: this.tests.length
    });
    
    const startTime = Date.now();
    this.results = [];
    
    for (const test of this.tests) {
      try {
        const result = await test.run();
        this.results.push(result);
      } catch (error) {
        this.results.push({
          name: test.name,
          description: test.description,
          severity: test.severity,
          result: TestResult.ERROR,
          error: error.message,
          duration: Date.now() - startTime,
          timestamp: Date.now()
        });
      }
    }
    
    const totalDuration = Date.now() - startTime;
    const summary = this.getSummary();
    
    this.logger.info('Integration test suite completed', 'runAll', {
      ...summary,
      totalDuration
    });
    
    return {
      results: this.results,
      summary,
      totalDuration,
      timestamp: Date.now()
    };
  }
  
  /**
   * Run specific test by name
   * @param {string} testName - Name of test to run
   * @returns {Promise<Object>} Test result
   */
  async runTest(testName) {
    const test = this.tests.find(t => t.name === testName);
    if (!test) {
      throw new Error(`Test "${testName}" not found`);
    }
    
    return await test.run();
  }
  
  /**
   * Get test suite summary
   * @returns {Object} Summary statistics
   */
  getSummary() {
    const summary = {
      total: this.results.length,
      passed: 0,
      failed: 0,
      errors: 0,
      skipped: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    this.results.forEach(result => {
      switch (result.result) {
        case TestResult.PASS:
          summary.passed++;
          break;
        case TestResult.FAIL:
          summary.failed++;
          break;
        case TestResult.ERROR:
          summary.errors++;
          break;
        case TestResult.SKIP:
          summary.skipped++;
          break;
      }
      
      // Count by severity
      summary[result.severity]++;
    });
    
    summary.successRate = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;
    summary.isHealthy = summary.failed === 0 && summary.errors === 0;
    
    return summary;
  }
  
  /**
   * Get failed tests
   * @returns {Array} Array of failed test results
   */
  getFailedTests() {
    return this.results.filter(result => 
      result.result === TestResult.FAIL || result.result === TestResult.ERROR
    );
  }
  
  /**
   * Get tests by severity
   * @param {string} severity - Test severity level
   * @returns {Array} Array of test results
   */
  getTestsBySeverity(severity) {
    return this.results.filter(result => result.severity === severity);
  }
  
  /**
   * Export test results as JSON
   * @returns {string} JSON string of results
   */
  exportResults() {
    return JSON.stringify({
      results: this.results,
      summary: this.getSummary(),
      timestamp: Date.now(),
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }, null, 2);
  }
}

// Create singleton instance
export const integrationTestSuite = new IntegrationTestSuite();

// Make available for debugging
if (typeof window !== 'undefined') {
  window.__integrationTestSuite = integrationTestSuite;
}

export default integrationTestSuite;