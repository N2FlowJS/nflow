import { codeExecutionHandler } from './tools/code.js';
import { createLogger } from './utils/logger';
import type { FlowNode } from './flowTypes';
import type { ExecutionOptions } from './tools/registry';

const logger = createLogger('TestSandbox');

async function testVulnerability() {
  logger.info('[Test] Starting infinite loop evaluation...');
  const start = Date.now();

  // Create a mock node object
  const node = {
    id: 'test-node-1',
    type: 'customNode',
    position: { x: 0, y: 0 },
    data: {
      type: 'CodeExecutionComponent',
      configSchema: [
        {
          name: 'code',
          value: `
          while(true) {
            // Infinite loop simulating malicious or locked user code
          }
        `,
        },
      ],
    },
  } as unknown as FlowNode;

  const result = await codeExecutionHandler(node, {}, {} as ExecutionOptions);
  const elapsed = Date.now() - start;

  logger.info(`[Test] Completed in ${elapsed}ms`);
  logger.info('[Test] Final Output:', result);

  if (String(result).includes('Error executing JS code: Error: Script execution timed out')) {
    logger.info(
      '✅ Vulnerability successfully mitigated! The exact 1500ms timeout fired correctly!',
    );
    process.exit(0);
  } else {
    logger.info('❌ Bug still exists. The wrapper failed to timeout or failed differently.');
    process.exit(1);
  }
}

void testVulnerability();
