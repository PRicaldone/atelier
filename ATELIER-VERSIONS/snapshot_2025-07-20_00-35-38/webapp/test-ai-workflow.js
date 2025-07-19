/**
 * Test AI Workflow End-to-End
 * Tests the complete gesture → AI → canvas elements pipeline
 */

import { SuperClaudeAgent } from './src/modules/shared/ai/agents/SuperClaudeAgent.js';
import { mapAIResponseToCanvas } from './src/utils/aiToCanvasMapper.js';

async function testAIWorkflow() {
  console.log('🧪 Testing SuperClaude+MCP Integration Workflow');
  console.log('================================================');
  
  try {
    // Initialize agent
    console.log('\n1. Initializing SuperClaudeAgent...');
    const agent = new SuperClaudeAgent({
      apiEndpoint: 'http://localhost:3001/api/ai/superclaude',
      timeout: 10000
    });
    
    // Test 1: Board Generation
    console.log('\n2. Testing /board generation...');
    const boardPrompt = 'Create a cyberpunk NFT collection with neon aesthetics';
    const boardResponse = await agent.generateBoard(boardPrompt, {
      userPreferences: { style: 'cyberpunk', format: 'visual' },
      context: { canvas: true, position: { x: 100, y: 100 } }
    });
    
    console.log('✅ Board Response:', JSON.stringify(boardResponse, null, 2));
    
    // Map to canvas elements
    const boardElements = mapAIResponseToCanvas(
      boardResponse, 
      { x: 100, y: 100 }, 
      '/board'
    );
    console.log('✅ Canvas Elements Generated:', boardElements.length);
    
    // Test 2: Idea Generation  
    console.log('\n3. Testing /idea generation...');
    const ideaPrompt = 'Brainstorm ideas for VFX project with space theme';
    const ideaResponse = await agent.analyzeContent(ideaPrompt, {
      type: 'brainstorm',
      context: { canvas: true }
    });
    
    console.log('✅ Idea Response:', JSON.stringify(ideaResponse, null, 2));
    
    const ideaElements = mapAIResponseToCanvas(
      ideaResponse,
      { x: 200, y: 200 },
      '/idea'
    );
    console.log('✅ Idea Elements Generated:', ideaElements.length);
    
    // Test 3: Workflow Generation
    console.log('\n4. Testing /brief generation...');
    const briefPrompt = 'Create a project brief for animated short film';
    const workflowResponse = await agent.generateWorkflow(briefPrompt, {
      type: 'animation',
      context: { canvas: true }
    });
    
    console.log('✅ Workflow Response:', JSON.stringify(workflowResponse, null, 2));
    
    const workflowElements = mapAIResponseToCanvas(
      workflowResponse,
      { x: 300, y: 300 },
      '/brief'
    );
    console.log('✅ Workflow Elements Generated:', workflowElements.length);
    
    // Summary
    console.log('\n🎉 AI WORKFLOW INTEGRATION TEST COMPLETE!');
    console.log('==========================================');
    console.log(`✅ Board Generation: ${boardElements.length} elements`);
    console.log(`✅ Idea Generation: ${ideaElements.length} elements`);
    console.log(`✅ Workflow Generation: ${workflowElements.length} elements`);
    console.log(`✅ Total Elements Generated: ${boardElements.length + ideaElements.length + workflowElements.length}`);
    console.log('\n🚀 Ready for gesture → AI → canvas workflow!');
    
    // Agent Stats
    const stats = agent.getStats();
    console.log('\n📊 Agent Statistics:');
    console.log(`- Connected: ${stats.connected}`);
    console.log(`- Total Requests: ${stats.totalRequests}`);
    console.log(`- Success Rate: ${stats.successRate}%`);
    console.log(`- Cache Size: ${stats.cacheSize}`);
    console.log(`- Avg Response Time: ${stats.avgResponseTime}ms`);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
    
    // Troubleshooting guide
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure mock server is running: npm run dev:server');
    console.log('2. Check server at: http://localhost:3001/api/ai/superclaude/health');
    console.log('3. Verify environment variables in .env');
    
    process.exit(1);
  }
}

// Run test
testAIWorkflow();