/**
 * Automated Test Runner - Schedule and run integration tests automatically
 * 
 * Features:
 * - Scheduled test execution (daily, weekly, on demand)
 * - CI/CD integration ready
 * - Test result notifications
 * - Performance regression detection
 * - Automated health checks before deployment
 */

import integrationTestSuite from './IntegrationTestSuite.js';
import { testLogger } from '../monitoring/ModuleLogger.js';
import errorTracker from '../monitoring/ErrorTracker.js';
import eventBus from '../events/EventBus.js';

// Test schedule types
export const ScheduleType = {
  IMMEDIATE: 'immediate',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  ON_CHANGE: 'on_change',
  PRE_DEPLOY: 'pre_deploy'
};

// Test runner status
export const RunnerStatus = {
  IDLE: 'idle',
  RUNNING: 'running',
  SCHEDULED: 'scheduled',
  ERROR: 'error'
};

/**
 * Automated Test Runner Class
 */
export class AutomatedTestRunner {
  constructor() {
    this.status = RunnerStatus.IDLE;
    this.schedule = null;
    this.lastRun = null;
    this.lastResults = null;
    this.performanceBaseline = null;
    this.notifications = [];
    this.logger = testLogger.child({ component: 'automated-runner' });
    
    // Configuration
    this.config = {
      maxRetries: 3,
      retryDelay: 5000, // 5 seconds
      performanceThreshold: 1.5, // 50% slower than baseline
      criticalFailureThreshold: 2, // Max critical failures allowed
      autoNotify: true,
      scheduleEnabled: false
    };
    
    // Bind methods
    this.handleModuleChange = this.handleModuleChange.bind(this);
    
    // Listen for module changes
    eventBus.on('module:changed', this.handleModuleChange);
  }
  
  /**
   * Run integration tests immediately
   * @param {Object} options - Run options
   * @returns {Promise<Object>} Test results
   */
  async runTests(options = {}) {
    if (this.status === RunnerStatus.RUNNING) {
      throw new Error('Test runner is already running');
    }
    
    const {
      retryOnFailure = true,
      updateBaseline = false,
      notifyOnCompletion = this.config.autoNotify
    } = options;
    
    this.status = RunnerStatus.RUNNING;
    this.logger.info('Starting automated test run', 'runTests', options);
    
    let attempt = 1;
    let results = null;
    let lastError = null;
    
    while (attempt <= this.config.maxRetries) {
      try {
        // Run the test suite
        results = await integrationTestSuite.runAll();
        
        // Check for critical failures
        const criticalFailures = this.analyzeCriticalFailures(results);
        
        if (criticalFailures.length > this.config.criticalFailureThreshold && retryOnFailure) {
          throw new Error(`Too many critical failures: ${criticalFailures.length}`);
        }
        
        // Performance analysis
        const performanceIssues = this.analyzePerformance(results);
        
        // Success - break out of retry loop
        break;
        
      } catch (error) {
        lastError = error;
        this.logger.warning(`Test run attempt ${attempt} failed`, 'runTests', {
          attempt,
          error: error.message
        });
        
        if (attempt < this.config.maxRetries && retryOnFailure) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
          attempt++;
        } else {
          // Final failure
          this.status = RunnerStatus.ERROR;
          this.logger.error(error, 'runTests', {
            totalAttempts: attempt
          });
          
          throw error;
        }
      }
    }
    
    // Update state
    this.status = RunnerStatus.IDLE;
    this.lastRun = Date.now();
    this.lastResults = results;
    
    // Update performance baseline if requested
    if (updateBaseline && results.summary.isHealthy) {
      this.updatePerformanceBaseline(results);
    }
    
    // Send notifications
    if (notifyOnCompletion) {
      await this.sendNotifications(results);
    }
    
    // Log completion
    this.logger.info('Automated test run completed', 'runTests', {
      attempt,
      success: results.summary.isHealthy,
      totalTests: results.summary.total,
      duration: results.totalDuration
    });
    
    // Emit event
    eventBus.emit('tests:completed', {
      results,
      success: results.summary.isHealthy,
      timestamp: Date.now()
    });
    
    return results;
  }
  
  /**
   * Schedule automated test runs
   * @param {string} scheduleType - Type of schedule
   * @param {Object} options - Schedule options
   */
  scheduleTests(scheduleType, options = {}) {
    // Clear existing schedule
    if (this.schedule) {
      clearInterval(this.schedule);
      this.schedule = null;
    }
    
    if (!this.config.scheduleEnabled) {
      this.logger.warning('Test scheduling is disabled', 'scheduleTests');
      return;
    }
    
    const {
      hour = 2, // 2 AM for daily
      dayOfWeek = 0, // Sunday for weekly
      immediate = false
    } = options;
    
    switch (scheduleType) {
      case ScheduleType.DAILY:
        this.scheduleDailyTests(hour, immediate);
        break;
        
      case ScheduleType.WEEKLY:
        this.scheduleWeeklyTests(dayOfWeek, hour, immediate);
        break;
        
      case ScheduleType.ON_CHANGE:
        this.enableChangeDetection();
        break;
        
      case ScheduleType.IMMEDIATE:
        this.runTests({ notifyOnCompletion: true });
        return;
        
      default:
        throw new Error(`Unknown schedule type: ${scheduleType}`);
    }
    
    this.status = RunnerStatus.SCHEDULED;
    this.logger.info(`Tests scheduled: ${scheduleType}`, 'scheduleTests', options);
  }
  
  /**
   * Schedule daily test runs
   * @param {number} hour - Hour to run (0-23)
   * @param {boolean} immediate - Run immediately as well
   */
  scheduleDailyTests(hour, immediate = false) {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, 0, 0, 0);
    
    // If scheduled time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const delay = scheduledTime.getTime() - now.getTime();
    
    // Schedule initial run
    setTimeout(() => {
      this.runTests({ notifyOnCompletion: true });
      
      // Set up daily recurring
      this.schedule = setInterval(() => {
        this.runTests({ notifyOnCompletion: true });
      }, 24 * 60 * 60 * 1000); // 24 hours
      
    }, delay);
    
    if (immediate) {
      this.runTests({ notifyOnCompletion: true });
    }
    
    this.logger.info(`Daily tests scheduled for ${hour}:00`, 'scheduleDailyTests', {
      nextRun: scheduledTime.toISOString(),
      delay
    });
  }
  
  /**
   * Schedule weekly test runs
   * @param {number} dayOfWeek - Day of week (0=Sunday, 6=Saturday)
   * @param {number} hour - Hour to run (0-23)
   * @param {boolean} immediate - Run immediately as well
   */
  scheduleWeeklyTests(dayOfWeek, hour, immediate = false) {
    const now = new Date();
    const scheduledTime = new Date();
    
    // Calculate next occurrence of the day/hour
    const daysUntilTarget = (dayOfWeek + 7 - now.getDay()) % 7;
    scheduledTime.setDate(now.getDate() + daysUntilTarget);
    scheduledTime.setHours(hour, 0, 0, 0);
    
    // If that time has passed this week, schedule for next week
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 7);
    }
    
    const delay = scheduledTime.getTime() - now.getTime();
    
    // Schedule initial run
    setTimeout(() => {
      this.runTests({ notifyOnCompletion: true });
      
      // Set up weekly recurring
      this.schedule = setInterval(() => {
        this.runTests({ notifyOnCompletion: true });
      }, 7 * 24 * 60 * 60 * 1000); // 7 days
      
    }, delay);
    
    if (immediate) {
      this.runTests({ notifyOnCompletion: true });
    }
    
    this.logger.info(`Weekly tests scheduled for day ${dayOfWeek} at ${hour}:00`, 'scheduleWeeklyTests', {
      nextRun: scheduledTime.toISOString(),
      delay
    });
  }
  
  /**
   * Enable change detection for on-demand testing
   */
  enableChangeDetection() {
    // Listen for module changes
    this.logger.info('Change detection enabled for automated testing', 'enableChangeDetection');
  }
  
  /**
   * Handle module change events
   * @param {Object} data - Change event data
   */
  async handleModuleChange(data) {
    if (this.status === RunnerStatus.RUNNING) {
      return; // Already running
    }
    
    this.logger.info('Module change detected, running tests', 'handleModuleChange', data);
    
    try {
      await this.runTests({
        retryOnFailure: false,
        notifyOnCompletion: false
      });
    } catch (error) {
      this.logger.error(error, 'handleModuleChange');
    }
  }
  
  /**
   * Analyze critical failures in test results
   * @param {Object} results - Test results
   * @returns {Array} Critical failures
   */
  analyzeCriticalFailures(results) {
    return results.results.filter(result => 
      result.severity === 'critical' && 
      (result.result === 'FAIL' || result.result === 'ERROR')
    );
  }
  
  /**
   * Analyze performance issues
   * @param {Object} results - Test results
   * @returns {Array} Performance issues
   */
  analyzePerformance(results) {
    if (!this.performanceBaseline) {
      return [];
    }
    
    const issues = [];
    
    // Check overall duration
    const baselineDuration = this.performanceBaseline.totalDuration;
    const currentDuration = results.totalDuration;
    
    if (currentDuration > baselineDuration * this.config.performanceThreshold) {
      issues.push({
        type: 'overall_performance',
        baseline: baselineDuration,
        current: currentDuration,
        degradation: (currentDuration / baselineDuration - 1) * 100
      });
    }
    
    // Check individual test performance
    results.results.forEach(result => {
      const baseline = this.performanceBaseline.results.find(r => r.name === result.name);
      if (baseline && result.duration > baseline.duration * this.config.performanceThreshold) {
        issues.push({
          type: 'test_performance',
          testName: result.name,
          baseline: baseline.duration,
          current: result.duration,
          degradation: (result.duration / baseline.duration - 1) * 100
        });
      }
    });
    
    if (issues.length > 0) {
      this.logger.warning('Performance issues detected', 'analyzePerformance', {
        issueCount: issues.length,
        issues
      });
    }
    
    return issues;
  }
  
  /**
   * Update performance baseline
   * @param {Object} results - Test results to use as new baseline
   */
  updatePerformanceBaseline(results) {
    this.performanceBaseline = {
      ...results,
      baselineDate: Date.now()
    };
    
    this.logger.info('Performance baseline updated', 'updatePerformanceBaseline', {
      totalDuration: results.totalDuration,
      testCount: results.results.length
    });
  }
  
  /**
   * Send notifications about test results
   * @param {Object} results - Test results
   */
  async sendNotifications(results) {
    const notification = {
      id: `test-${Date.now()}`,
      timestamp: Date.now(),
      type: results.summary.isHealthy ? 'success' : 'failure',
      summary: results.summary,
      criticalFailures: this.analyzeCriticalFailures(results),
      performanceIssues: this.analyzePerformance(results)
    };
    
    this.notifications.push(notification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(-50);
    }
    
    // Log notification
    this.logger.info('Test notification created', 'sendNotifications', notification);
    
    // Emit notification event for external systems
    eventBus.emit('tests:notification', notification);
    
    // TODO: Integrate with external notification systems (email, Slack, etc.)
  }
  
  /**
   * Stop scheduled tests
   */
  stopSchedule() {
    if (this.schedule) {
      clearInterval(this.schedule);
      this.schedule = null;
      this.status = RunnerStatus.IDLE;
      
      this.logger.info('Test schedule stopped', 'stopSchedule');
    }
  }
  
  /**
   * Get runner status and statistics
   * @returns {Object} Runner status
   */
  getStatus() {
    return {
      status: this.status,
      lastRun: this.lastRun,
      lastResults: this.lastResults ? {
        summary: this.lastResults.summary,
        timestamp: this.lastResults.timestamp,
        duration: this.lastResults.totalDuration
      } : null,
      performanceBaseline: this.performanceBaseline ? {
        baselineDate: this.performanceBaseline.baselineDate,
        duration: this.performanceBaseline.totalDuration
      } : null,
      notifications: this.notifications.slice(-10), // Last 10 notifications
      config: this.config,
      uptime: Date.now() - (this.startTime || Date.now())
    };
  }
  
  /**
   * Update configuration
   * @param {Object} newConfig - Configuration updates
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('Configuration updated', 'updateConfig', newConfig);
  }
  
  /**
   * Pre-deployment health check
   * @returns {Promise<boolean>} True if system is ready for deployment
   */
  async preDeploymentCheck() {
    this.logger.info('Running pre-deployment health check', 'preDeploymentCheck');
    
    try {
      const results = await this.runTests({
        retryOnFailure: true,
        updateBaseline: false,
        notifyOnCompletion: true
      });
      
      const criticalFailures = this.analyzeCriticalFailures(results);
      const performanceIssues = this.analyzePerformance(results);
      
      const isReady = results.summary.isHealthy && 
                     criticalFailures.length === 0 && 
                     performanceIssues.length === 0;
      
      this.logger.info('Pre-deployment check completed', 'preDeploymentCheck', {
        isReady,
        criticalFailures: criticalFailures.length,
        performanceIssues: performanceIssues.length,
        successRate: results.summary.successRate
      });
      
      return isReady;
      
    } catch (error) {
      this.logger.error(error, 'preDeploymentCheck');
      return false;
    }
  }
}

// Create singleton instance
export const automatedTestRunner = new AutomatedTestRunner();

// Make available for debugging
if (typeof window !== 'undefined') {
  window.__automatedTestRunner = automatedTestRunner;
}

export default automatedTestRunner;