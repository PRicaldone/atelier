#!/usr/bin/env node

/**
 * Debug Component Checker
 * Quick verification of key components
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Debug: Component Verification');
console.log('================================');

// Check if main components exist and are properly exported
const components = [
  'src/modules/mind-garden/MindGarden.jsx',
  'src/modules/mind-garden/components/ConversationalNode.jsx',
  'src/modules/mind-garden/store.js',
  'src/modules/mind-garden/types/conversationTypes.js'
];

components.forEach(comp => {
  try {
    const path = join(__dirname, comp);
    const content = readFileSync(path, 'utf8');
    
    if (comp.includes('MindGarden.jsx')) {
      console.log(`✅ ${comp} - ${content.includes('export default') ? 'EXPORTED' : 'NO EXPORT'}`);
      console.log(`   - onPaneClick: ${content.includes('onPaneClick') ? 'YES' : 'NO'}`);
      console.log(`   - createConversationalNode: ${content.includes('createConversationalNode') ? 'YES' : 'NO'}`);
    } else if (comp.includes('ConversationalNode.jsx')) {
      console.log(`✅ ${comp} - ${content.includes('export default') ? 'EXPORTED' : 'NO EXPORT'}`);
      console.log(`   - useState: ${content.includes('useState') ? 'YES' : 'NO'}`);
      console.log(`   - textarea: ${content.includes('textarea') ? 'YES' : 'NO'}`);
    } else {
      console.log(`✅ ${comp} - EXISTS`);
    }
  } catch (error) {
    console.log(`❌ ${comp} - ERROR: ${error.message}`);
  }
});

console.log('\n🔍 App.jsx routing check:');
try {
  const appPath = join(__dirname, 'src/App.jsx');
  const appContent = readFileSync(appPath, 'utf8');
  console.log(`✅ App.jsx - MindGarden import: ${appContent.includes('MindGarden') ? 'YES' : 'NO'}`);
  console.log(`✅ App.jsx - Route setup: ${appContent.includes('mind-garden') ? 'YES' : 'NO'}`);
} catch (error) {
  console.log(`❌ App.jsx - ERROR: ${error.message}`);
}

console.log('\n🚀 If all checks pass, the UI should work!');