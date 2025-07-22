/**
 * Atelier Routine Checklist
 * Automated daily/weekly checks for system maintenance
 */

export const DailyChecklist = {
  id: 'daily-routine',
  name: 'Daily System Check',
  frequency: 'daily',
  checks: [
    {
      id: 'module-health',
      name: 'Module Health Check',
      description: 'Verify all modules are loading correctly',
      automated: true,
      critical: true
    },
    {
      id: 'error-count',
      name: 'Error Count Review',
      description: 'Check if error count is within acceptable range',
      automated: true,
      threshold: { maxErrors: 10 }
    },
    {
      id: 'event-flow',
      name: 'Event Flow Verification',
      description: 'Ensure events are flowing between modules',
      automated: true
    },
    {
      id: 'storage-check',
      name: 'Local Storage Health',
      description: 'Check localStorage usage and clean if needed',
      automated: true,
      threshold: { maxSizeMB: 5 }
    },
    {
      id: 'intelligence-system',
      name: 'Intelligence System Health',
      description: 'Check TaskCoordinator and routing system',
      automated: true,
      critical: true
    },
    {
      id: 'connectors-health',
      name: 'Claude Connectors Health',
      description: 'Verify connector status and connectivity',
      automated: true
    },
    {
      id: 'smart-folded-compliance',
      name: 'Smart Folded Text Block Compliance',
      description: 'Check all text blocks/nodes have titles and follow folding patterns',
      automated: true,
      critical: true,
      modules: ['scriptorium', 'mind-garden', 'ideas']
    },
    {
      id: 'backup-reminder',
      name: 'Backup Reminder',
      description: 'Remind to run atelier-save if significant changes',
      automated: false,
      requiresUserAction: true
    }
  ]
};

export const WeeklyChecklist = {
  id: 'weekly-routine',
  name: 'Weekly Maintenance',
  frequency: 'weekly',
  checks: [
    {
      id: 'dependency-updates',
      name: 'Check Dependencies',
      description: 'Review npm packages for updates',
      automated: false,
      requiresUserAction: true
    },
    {
      id: 'performance-review',
      name: 'Performance Metrics',
      description: 'Analyze module load times and optimization opportunities',
      automated: true
    },
    {
      id: 'task-coordination',
      name: 'Task Coordination Analysis',
      description: 'Review task routing efficiency and success rates',
      automated: true
    },
    {
      id: 'orchestrator-health',
      name: 'Orchestrator Health Review',
      description: 'Analyze workflow execution patterns and performance',
      automated: true
    },
    {
      id: 'code-quality',
      name: 'Code Quality Check',
      description: 'Run linting and type checking',
      automated: true,
      commands: ['npm run lint', 'npm run typecheck']
    },
    {
      id: 'documentation-sync',
      name: 'Documentation Update',
      description: 'Ensure docs are in sync with implementation',
      automated: false,
      requiresUserAction: true
    },
    {
      id: 'smart-folded-deep-audit',
      name: 'Smart Folded Text Block Architecture Audit',
      description: 'Deep analysis of text block compliance across all modules',
      automated: true,
      critical: true,
      analysis: {
        titleCompliance: 'Check all text blocks have valid titles',
        foldingPatterns: 'Verify folding behavior consistency',
        crossModuleUX: 'Validate Scriptorium ↔ Mind Garden UX uniformity',
        ucaIntegration: 'Check UCA metadata preservation'
      }
    },
    {
      id: 'git-cleanup',
      name: 'Git Repository Cleanup',
      description: 'Clean merged branches and optimize repo',
      automated: false,
      requiresUserAction: true
    }
  ]
};

export const CriticalChecklist = {
  id: 'critical-routine',
  name: 'Critical System Verification',
  frequency: 'on-demand',
  checks: [
    {
      id: 'module-contracts',
      name: 'Module Contract Validation',
      description: 'Verify all module interfaces are intact',
      automated: true,
      critical: true
    },
    {
      id: 'adapter-communication',
      name: 'Adapter Communication Test',
      description: 'Test all adapter methods work correctly',
      automated: true,
      critical: true
    },
    {
      id: 'event-bus-integrity',
      name: 'Event Bus Integrity',
      description: 'Ensure event bus is functioning correctly',
      automated: true,
      critical: true
    },
    {
      id: 'data-persistence',
      name: 'Data Persistence Verification',
      description: 'Verify all data saves and loads correctly',
      automated: true,
      critical: true
    }
  ]
};

export const getChecklistByFrequency = (frequency) => {
  switch (frequency) {
    case 'daily':
      return DailyChecklist;
    case 'weekly':
      return WeeklyChecklist;
    case 'critical':
      return CriticalChecklist;
    default:
      return DailyChecklist;
  }
};

export const getAllChecklists = () => [
  DailyChecklist,
  WeeklyChecklist,
  CriticalChecklist
];

export const getChecklistStats = (checklistId, completedChecks = []) => {
  const checklist = getAllChecklists().find(c => c.id === checklistId);
  if (!checklist) return null;

  const total = checklist.checks.length;
  const completed = completedChecks.filter(id => 
    checklist.checks.some(check => check.id === id)
  ).length;

  return {
    total,
    completed,
    percentage: Math.round((completed / total) * 100),
    remaining: total - completed
  };
};

export const getNextScheduledChecklist = () => {
  const now = new Date();
  const lastDaily = localStorage.getItem('ATELIER_LAST_DAILY_CHECK');
  const lastWeekly = localStorage.getItem('ATELIER_LAST_WEEKLY_CHECK');

  const checks = [];

  // Check if daily is due (24 hours)
  if (!lastDaily || (now - new Date(lastDaily)) > 24 * 60 * 60 * 1000) {
    checks.push({
      checklist: DailyChecklist,
      overdue: true,
      lastRun: lastDaily ? new Date(lastDaily) : null
    });
  }

  // Check if weekly is due (7 days)
  if (!lastWeekly || (now - new Date(lastWeekly)) > 7 * 24 * 60 * 60 * 1000) {
    checks.push({
      checklist: WeeklyChecklist,
      overdue: true,
      lastRun: lastWeekly ? new Date(lastWeekly) : null
    });
  }

  return checks;
};