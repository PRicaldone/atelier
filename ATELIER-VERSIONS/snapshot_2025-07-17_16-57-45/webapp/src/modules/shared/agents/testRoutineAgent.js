/**
 * Test script for Atelier Routine Agent
 * Run in browser console: import('./modules/shared/agents/testRoutineAgent.js')
 */

import { atelierRoutineAgent } from './AtelierRoutineAgent.js';

console.log('🤖 Testing Atelier Routine Agent...\n');

async function testAgent() {
  try {
    // Test 1: Run full routine
    console.log('1️⃣ Running full system routine...');
    const fullReport = await atelierRoutineAgent.runRoutine();
    console.log('Full routine report:', fullReport);
    console.log(`Overall Status: ${fullReport.overallStatus}`);
    console.log(`Total Checks: ${fullReport.checks.length}`);
    console.log(`Issues Found: ${fullReport.checks.filter(c => c.status !== 'healthy').length}`);
    console.log(`Recommendations: ${fullReport.recommendations.length}\n`);

    // Test 2: Run daily checklist
    console.log('2️⃣ Running daily checklist...');
    const dailyReport = await atelierRoutineAgent.runChecklist('daily');
    console.log('Daily checklist report:', dailyReport);
    console.log(`Completed: ${dailyReport.summary.completed}/${dailyReport.summary.total}`);
    console.log(`Failed: ${dailyReport.summary.failed}`);
    console.log(`User Actions Required: ${dailyReport.summary.pending}\n`);

    // Test 3: Check specific module health
    console.log('3️⃣ Checking module health...');
    const moduleHealth = await atelierRoutineAgent.checkModuleHealth();
    console.log('Module health:', moduleHealth);

    // Test 4: Check error tracking
    console.log('4️⃣ Checking error tracking...');
    const errorTracking = await atelierRoutineAgent.checkErrorTracking();
    console.log('Error tracking:', errorTracking);

    // Test 5: Get scheduled checks
    console.log('5️⃣ Getting scheduled checks...');
    const { getNextScheduledChecklist } = await import('./routineChecklist.js');
    const scheduled = getNextScheduledChecklist();
    console.log('Scheduled checks:', scheduled);

    console.log('\n✅ All tests completed!');
    console.log('💡 Tip: Visit /routine to see the dashboard UI');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Auto-run tests
testAgent();

// Export for manual testing
export { testAgent, atelierRoutineAgent };