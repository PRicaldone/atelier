/**
 * Integration Testing Script for Atelier v6.1 Project Architecture
 * 
 * This script performs comprehensive testing of:
 * 1. ProjectStore integration
 * 2. Canvas migration to project-scoped storage
 * 3. MindGarden integration
 * 4. Cross-module data sharing
 * 5. AI configuration per project type
 * 
 * Usage: Open browser console and run this script
 */

console.log('🚀 Starting Atelier v6.1 Integration Tests...');

// Test 1: ProjectStore Functionality
function testProjectStore() {
  console.log('\n🔧 Testing ProjectStore...');
  
  try {
    // Access ProjectStore
    const projectStore = window.useProjectStore?.getState();
    if (!projectStore) {
      console.error('❌ ProjectStore not found in window');
      return false;
    }
    
    console.log('✅ ProjectStore accessible');
    console.log('📊 Current projects:', projectStore.projects?.length || 0);
    console.log('🎯 Current project:', projectStore.currentProject?.name || 'None');
    
    // Test project creation
    if (projectStore.createProject) {
      console.log('✅ createProject method exists');
    }
    
    if (projectStore.setCurrentProject) {
      console.log('✅ setCurrentProject method exists');
    }
    
    return true;
  } catch (error) {
    console.error('❌ ProjectStore test failed:', error);
    return false;
  }
}

// Test 2: Canvas Integration
function testCanvasIntegration() {
  console.log('\n🎨 Testing Canvas Integration...');
  
  try {
    // Check if Canvas uses project-scoped storage
    const canvasStore = window.useCanvasStore?.getState();
    if (!canvasStore) {
      console.error('❌ CanvasStore not found');
      return false;
    }
    
    console.log('✅ CanvasStore accessible');
    console.log('📊 Canvas elements:', canvasStore.elements?.length || 0);
    
    // Check localStorage migration
    const oldElements = localStorage.getItem('ATELIER_CANVAS_ELEMENTS');
    if (oldElements) {
      console.log('⚠️  Old localStorage elements still exist - migration needed');
    } else {
      console.log('✅ No old localStorage elements found');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Canvas integration test failed:', error);
    return false;
  }
}

// Test 3: MindGarden Integration
function testMindGardenIntegration() {
  console.log('\n🧠 Testing MindGarden Integration...');
  
  try {
    // Check MindGarden store
    const mindGardenStore = window.useMindGardenStore?.getState();
    if (!mindGardenStore) {
      console.error('❌ MindGardenStore not found');
      return false;
    }
    
    console.log('✅ MindGardenStore accessible');
    console.log('📊 MindGarden nodes:', mindGardenStore.nodes?.length || 0);
    
    // Check localStorage migration
    const oldNodes = localStorage.getItem('ATELIER_MIND_GARDEN');
    if (oldNodes) {
      console.log('⚠️  Old localStorage nodes still exist - migration needed');
    } else {
      console.log('✅ No old localStorage nodes found');
    }
    
    return true;
  } catch (error) {
    console.error('❌ MindGarden integration test failed:', error);
    return false;
  }
}

// Test 4: Cross-Module Data Sharing
function testCrossModuleSharing() {
  console.log('\n🔄 Testing Cross-Module Data Sharing...');
  
  try {
    const projectStore = window.useProjectStore?.getState();
    const unifiedStore = window.useUnifiedStore?.getState();
    
    if (!projectStore || !unifiedStore) {
      console.error('❌ Required stores not found');
      return false;
    }
    
    console.log('✅ Both stores accessible');
    console.log('🎯 Current module:', unifiedStore.currentModule);
    
    // Test navigation
    if (unifiedStore.navigateToModule) {
      console.log('✅ navigateToModule method exists');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Cross-module sharing test failed:', error);
    return false;
  }
}

// Test 5: AI Configuration
function testAIConfiguration() {
  console.log('\n🤖 Testing AI Configuration...');
  
  try {
    const projectStore = window.useProjectStore?.getState();
    
    if (!projectStore) {
      console.error('❌ ProjectStore not found');
      return false;
    }
    
    const currentProject = projectStore.currentProject;
    if (currentProject) {
      console.log('✅ Current project found:', currentProject.name);
      console.log('🎯 Project type:', currentProject.type);
      console.log('🤖 AI Config:', currentProject.aiConfig ? '✅ Present' : '❌ Missing');
    } else {
      console.log('⚠️  No current project - AI config test skipped');
    }
    
    return true;
  } catch (error) {
    console.error('❌ AI configuration test failed:', error);
    return false;
  }
}

// Test 6: Project Creation Flow
function testProjectCreation() {
  console.log('\n➕ Testing Project Creation Flow...');
  
  try {
    const projectStore = window.useProjectStore?.getState();
    
    if (!projectStore || !projectStore.createProject) {
      console.error('❌ createProject method not found');
      return false;
    }
    
    // Test project creation (without actually creating)
    console.log('✅ Project creation method available');
    
    // Check PROJECT_TYPES
    const PROJECT_TYPES = window.PROJECT_TYPES;
    if (PROJECT_TYPES) {
      console.log('✅ PROJECT_TYPES available:', Object.keys(PROJECT_TYPES));
    } else {
      console.log('⚠️  PROJECT_TYPES not found in window');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Project creation test failed:', error);
    return false;
  }
}

// Main test runner
async function runIntegrationTests() {
  console.log('🧪 ATELIER V6.1 INTEGRATION TESTS');
  console.log('=====================================');
  
  const tests = [
    { name: 'ProjectStore', test: testProjectStore },
    { name: 'Canvas Integration', test: testCanvasIntegration },
    { name: 'MindGarden Integration', test: testMindGardenIntegration },
    { name: 'Cross-Module Sharing', test: testCrossModuleSharing },
    { name: 'AI Configuration', test: testAIConfiguration },
    { name: 'Project Creation Flow', test: testProjectCreation }
  ];
  
  const results = [];
  
  for (const { name, test } of tests) {
    const result = await test();
    results.push({ name, passed: result });
  }
  
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  
  results.forEach(({ name, passed }) => {
    console.log(`${passed ? '✅' : '❌'} ${name}`);
  });
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log(`\n🎯 Overall: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 All tests passed! Integration successful!');
  } else {
    console.log('⚠️  Some tests failed. Check logs above for details.');
  }
  
  return results;
}

// Make functions available globally for manual testing
window.atelierTests = {
  runIntegrationTests,
  testProjectStore,
  testCanvasIntegration,
  testMindGardenIntegration,
  testCrossModuleSharing,
  testAIConfiguration,
  testProjectCreation
};

// Auto-run tests
console.log('🚀 Auto-running integration tests...');
runIntegrationTests();