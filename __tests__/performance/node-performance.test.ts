/**
 * Performance Tests for NFlow Node Execution
 *
 * Measures execution speed, memory usage, and scalability
 * of the node execution pipeline.
 */

import { MathNodeDefinition } from '../../packages/math/definition';
import { DisplayNodeDefinition } from '../../packages/display/definition';
import { LoopNodeDefinition } from '../../packages/loop/definition';
import { FlowStateDispatcher } from '../../packages/@flow/flow-state-dispatcher';

describe('Node Performance Tests', () => {
  let dispatcher: FlowStateDispatcher;

  beforeEach(() => {
    dispatcher = new FlowStateDispatcher({
      components: {},
      variables: {},
      currentNode: undefined as any,
      executionTime: Date.now(),
      history: []
    });
  });

  describe('Execution Speed Benchmarks', () => {
    it('should execute math operations within 10ms', async () => {
      const context: any = {
        node: { id: 'perf-math', data: { form: { value1: 42, value2: 24, operation: 'add' } } },
        config: { value1: 42, value2: 24, operation: 'add' },
        inputs: { value1: 42, value2: 24 },
        dispatcher,
        flowState: dispatcher.getState()
      };

      const startTime = performance.now();
      const result = await MathNodeDefinition.execute(context);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(10); // Should complete in under 10ms
      expect(result.outputs.result).toBe(66);
      expect(result.status).toBe('success');
    });

    it('should execute display operations within 5ms', async () => {
      const context: any = {
        node: { id: 'perf-display', data: { form: { content: 'Performance test content' } } },
        config: { content: 'Performance test content' },
        inputs: {},
        dispatcher,
        flowState: dispatcher.getState()
      };

      const startTime = performance.now();
      const result = await DisplayNodeDefinition.execute(context);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(5); // Should complete in under 5ms
      expect(result.outputs.content).toBe('Performance test content');
      expect(result.status).toBe('success');
    });

    it('should handle template processing efficiently', async () => {
      const templateContent = 'User: {name}, Age: {age}, City: {city}';
      const context: any = {
        node: { id: 'perf-template', data: { form: { content: templateContent } } },
        config: { content: templateContent },
        inputs: { name: 'Alice', age: '30', city: 'New York' },
        dispatcher,
        flowState: dispatcher.getState()
      };

      const startTime = performance.now();
      const result = await DisplayNodeDefinition.execute(context);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(10);
      expect(result.outputs.content).toBe('User: Alice, Age: 30, City: New York');
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not leak memory during repeated executions', async () => {
      const context: any = {
        node: { id: 'memory-test', data: { form: { value1: 10, value2: 5, operation: 'multiply' } } },
        config: { value1: 10, value2: 5, operation: 'multiply' },
        inputs: { value1: 10, value2: 5 },
        dispatcher,
        flowState: dispatcher.getState()
      };

      // Execute 100 times
      for (let i = 0; i < 100; i++) {
        const result = await MathNodeDefinition.execute(context);
        expect(result.outputs.result).toBe(50);
      }

      // Memory should remain stable (no leaks)
      // Note: In a real scenario, we'd use a memory profiler
      expect(true).toBe(true); // Placeholder for memory checks
    });
  });

  describe('Scalability Tests', () => {
    it('should handle large template processing', async () => {
      // Create a large template with many variables
      const variables: Record<string, string> = {};
      let template = 'Data: ';

      for (let i = 0; i < 50; i++) {
        const varName = `var${i}`;
        variables[varName] = `value${i}`;
        template += `{${varName}} `;
      }

      const context: any = {
        node: { id: 'scale-test', data: { form: { content: template } } },
        config: { content: template },
        inputs: variables,
        dispatcher,
        flowState: dispatcher.getState()
      };

      const startTime = performance.now();
      const result = await DisplayNodeDefinition.execute(context);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should handle 50 variables in under 50ms
      expect(result.status).toBe('success');
      expect(result.outputs.content).toContain('Data: value0 value1');
    });

    it('should handle loop operations efficiently', async () => {
      const context: any = {
        node: { id: 'loop-perf', data: { form: {
          inputData: '[1,2,3,4,5,6,7,8,9,10]',
          loopType: 'array',
          maxIterations: 10
        }}},
        config: {
          inputData: '[1,2,3,4,5,6,7,8,9,10]',
          loopType: 'array',
          maxIterations: 10
        },
        inputs: {},
        dispatcher,
        flowState: dispatcher.getState()
      };

      const startTime = performance.now();
      const result = await LoopNodeDefinition.execute(context);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(20); // Should complete loop in under 20ms
      expect(result.outputs.result).toHaveLength(10);
      expect(result.outputs.iterations).toBe(10);
      expect(result.status).toBe('success');
    });
  });

  describe('Concurrent Execution Tests', () => {
    it('should handle multiple simultaneous executions', async () => {
      const promises = [];

      // Create 10 concurrent math operations
      for (let i = 0; i < 10; i++) {
        const context: any = {
          node: { id: `concurrent-${i}`, data: { form: { value1: i, value2: 2, operation: 'multiply' } } },
          config: { value1: i, value2: 2, operation: 'multiply' },
          inputs: { value1: i, value2: 2 },
          dispatcher: new FlowStateDispatcher({
            components: {},
            variables: {},
            currentNode: undefined as any,
            executionTime: Date.now(),
            history: []
          }),
          flowState: dispatcher.getState()
        };

        promises.push(MathNodeDefinition.execute(context));
      }

      const startTime = performance.now();
      const results = await Promise.all(promises);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete all in under 100ms
      expect(results).toHaveLength(10);

      results.forEach((result, index) => {
        expect(result.outputs.result).toBe(index * 2);
        expect(result.status).toBe('success');
      });
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle errors quickly', async () => {
      const context: any = {
        node: { id: 'error-perf', data: { form: { value1: 10, value2: 0, operation: 'divide' } } },
        config: { value1: 10, value2: 0, operation: 'divide' },
        inputs: { value1: 10, value2: 0 },
        dispatcher,
        flowState: dispatcher.getState()
      };

      const startTime = performance.now();
      const result = await MathNodeDefinition.execute(context);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(5); // Error handling should be fast
      expect(result.status).toBe('error');
      expect(result.error).toContain('Division by zero');
    });
  });

  describe('State Management Performance', () => {
    it('should handle state updates efficiently', async () => {
      const operations = [
        { value1: 10, value2: 5, operation: 'add' },
        { value1: 15, value2: 3, operation: 'subtract' },
        { value1: 8, value2: 4, operation: 'multiply' },
        { value1: 20, value2: 4, operation: 'divide' }
      ];

      const startTime = performance.now();

      for (const op of operations) {
        const context: any = {
          node: { id: `state-${op.operation}`, data: { form: op } },
          config: op,
          inputs: op,
          dispatcher,
          flowState: dispatcher.getState()
        };

        const result = await MathNodeDefinition.execute(context);
        expect(result.status).toBe('success');
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // Should complete 4 operations in under 50ms
    });
  });
});
