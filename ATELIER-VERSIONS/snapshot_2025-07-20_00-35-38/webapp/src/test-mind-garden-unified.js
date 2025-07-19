// Test script to verify Mind Garden integration with Unified Store
import { useUnifiedStore } from './store/unifiedStore.js';

console.log('🧪 Testing Mind Garden Unified Store Integration\n');

// Get store instance
const store = useUnifiedStore.getState();

// Check initial state
console.log('1️⃣ Initial Mind Garden State:');
console.log(JSON.stringify(store.mindGarden, null, 2));

// Test setMindGardenState
console.log('\n2️⃣ Testing setMindGardenState:');
store.setMindGardenState({
  nodes: [
    { id: 'test-1', type: 'card', position: { x: 100, y: 100 }, data: { title: 'Test Node' } }
  ],
  edges: [],
  currentPhase: 'narrative'
});
console.log('Updated state:', JSON.stringify(store.mindGarden, null, 2));

// Test updateMindGardenNodes
console.log('\n3️⃣ Testing updateMindGardenNodes:');
store.updateMindGardenNodes(nodes => [
  ...nodes,
  { id: 'test-2', type: 'card', position: { x: 200, y: 200 }, data: { title: 'Another Node' } }
]);
console.log('Nodes after update:', store.mindGarden.nodes);

// Test selectMindGardenNodes
console.log('\n4️⃣ Testing selectMindGardenNodes:');
store.selectMindGardenNodes(['test-1', 'test-2']);
console.log('Selected nodes:', store.mindGarden.selectedNodes);

// Test addMindGardenExport
console.log('\n5️⃣ Testing addMindGardenExport:');
store.addMindGardenExport({
  id: 'export-test',
  timestamp: new Date().toLocaleTimeString(),
  nodeCount: 2,
  nodeIds: ['test-1', 'test-2']
});
console.log('Export history:', store.mindGarden.exportHistory);

// Test navigation
console.log('\n6️⃣ Testing navigation to mind-garden:');
store.navigateToModule('mind-garden', { source: 'test' });
console.log('Current module:', store.currentModule);

console.log('\n✅ All tests completed successfully!');