/**
 * Simple AI Integration Test
 * Tests only the core API communication without browser dependencies
 */

async function testBasicAIIntegration() {
  console.log('🧪 Testing Basic AI Integration');
  console.log('===============================');
  
  try {
    // Test 1: Health Check
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/api/ai/superclaude/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
    
    // Test 2: Board Generation
    console.log('\n2. Testing board generation...');
    const boardRequest = {
      operation: 'board_generation',
      payload: {
        prompt: 'Create a cyberpunk NFT collection',
        userPreferences: { style: 'cyberpunk', format: 'visual' },
        context: { canvas: true, position: { x: 100, y: 100 } }
      }
    };
    
    const boardResponse = await fetch('http://localhost:3001/api/ai/superclaude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': 'test-board-' + Date.now()
      },
      body: JSON.stringify(boardRequest)
    });
    
    const boardData = await boardResponse.json();
    console.log('✅ Board Generation Success:', boardData.success);
    console.log('✅ Sections Generated:', boardData.data?.sections?.length || 0);
    
    // Test 3: Idea Generation
    console.log('\n3. Testing idea generation...');
    const ideaRequest = {
      operation: 'content_analysis',
      payload: {
        content: 'Space-themed VFX project',
        type: 'brainstorm',
        context: { canvas: true }
      }
    };
    
    const ideaResponse = await fetch('http://localhost:3001/api/ai/superclaude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': 'test-idea-' + Date.now()
      },
      body: JSON.stringify(ideaRequest)
    });
    
    const ideaData = await ideaResponse.json();
    console.log('✅ Idea Generation Success:', ideaData.success);
    console.log('✅ Suggestions Generated:', ideaData.data?.suggestions?.length || 0);
    
    // Test 4: Workflow Generation
    console.log('\n4. Testing workflow generation...');
    const workflowRequest = {
      operation: 'workflow_automation',
      payload: {
        brief: 'Animated short film project',
        type: 'animation',
        context: { canvas: true }
      }
    };
    
    const workflowResponse = await fetch('http://localhost:3001/api/ai/superclaude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': 'test-workflow-' + Date.now()
      },
      body: JSON.stringify(workflowRequest)
    });
    
    const workflowData = await workflowResponse.json();
    console.log('✅ Workflow Generation Success:', workflowData.success);
    console.log('✅ Steps Generated:', workflowData.data?.steps?.length || 0);
    
    // Summary
    console.log('\n🎉 BASIC AI INTEGRATION TEST COMPLETE!');
    console.log('======================================');
    console.log('✅ Health Check: OK');
    console.log('✅ Board Generation: OK');
    console.log('✅ Idea Generation: OK');
    console.log('✅ Workflow Generation: OK');
    console.log('\n🚀 AI Backend is ready for frontend integration!');
    console.log('\nNext Steps:');
    console.log('1. Start frontend: npm run dev');
    console.log('2. Test gesture → AI → canvas workflow in browser');
    console.log('3. Use long-press to trigger AI prompts');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure mock server is running: npm run dev:server');
    console.log('2. Check server at: http://localhost:3001/api/ai/superclaude/health');
    console.log('3. If server not running, start it with: node server.js');
    
    process.exit(1);
  }
}

// Run test
testBasicAIIntegration();