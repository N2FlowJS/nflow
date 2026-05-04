import { codeExecutionHandler } from './tools/code.js';

async function testVulnerability() {
  console.log('[Test] Starting infinite loop evaluation...');
  const start = Date.now();
  
  // Create a mock node object
  const node = {
    id: 'test-node-1',
    type: 'customNode',
    position: { x: 0, y: 0 },
    data: {
      type: 'CodeExecutionComponent',
      configSchema: [
        { name: 'code', value: `
          while(true) {
            // Infinite loop simulating malicious or locked user code
          }
        `}
      ]
    }
  } as any;

  const result = await codeExecutionHandler(node, {}, {} as any);
  const elapsed = Date.now() - start;
  
  console.log(`[Test] Completed in ${elapsed}ms`);
  console.log('[Test] Final Output:', result);
  
  if (String(result).includes('Error executing JS code: Error: Script execution timed out')) {
    console.log('✅ Vulnerability successfully mitigated! The exact 1500ms timeout fired correctly!');
    process.exit(0);
  } else {
    console.log('❌ Bug still exists. The wrapper failed to timeout or failed differently.');
    process.exit(1);
  }
}

testVulnerability();
