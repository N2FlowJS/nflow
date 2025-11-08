/**
 * Integration Tests for NFlow Node Execution
 *
 * Tests the complete flow execution pipeline including:
 * - Node definition loading
 * - Input validation
 * - Template processing
 * - Business logic execution
 * - State management
 * - Error handling
 */

import { MathNodeDefinition } from '../../packages/math/definition';
import { DisplayNodeDefinition } from '../../packages/display/definition';
import { GenerateNodeDefinition } from '../../packages/generate/definition';
import { FlowStateDispatcher } from '../../packages/@flow/flow-state-dispatcher';

describe('Node Execution Integration Tests', () => {
  let mockDispatcher: jest.Mocked<FlowStateDispatcher>;

  beforeEach(() => {
    mockDispatcher = {
      setNodeOutput: jest.fn(),
      setCurrentNode: jest.fn(),
      getState: jest.fn().mockReturnValue({
        components: {},
        variables: {},
        currentNode: null,
        executionTime: Date.now(),
        history: [],
        flow: { nodes: [], edges: [] }
      })
    } as any;
  });

  describe('Math Node Execution', () => {
    it('should execute basic addition correctly', async () => {
      const context: any = {
        node: { id: 'math1', data: { form: { value1: 5, value2: 3, operation: 'add' } } },
        config: { value1: 5, value2: 3, operation: 'add' },
        inputs: { value1: 5, value2: 3 },
        dispatcher: mockDispatcher,
        flowState: { components: {}, variables: {} }
      };

      const result = await MathNodeDefinition.execute(context);

      expect(result.outputs.result).toBe(8);
      expect(result.outputs.resultText).toBe('8');
      expect(result.status).toBe('success');
      expect(mockDispatcher.setNodeOutput).toHaveBeenCalledWith('math1', '8', 'math');
    });

    it('should handle template variables in math operations', async () => {
      const context: any = {
        node: { id: 'math2', data: { form: { value1: '{baseValue}', value2: 10, operation: 'multiply' } } },
        config: { value1: '{baseValue}', value2: 10, operation: 'multiply' },
        inputs: { baseValue: 6, value2: 10 },
        dispatcher: mockDispatcher,
        flowState: {
          components: { otherNode: { output: 6 } },
          variables: {}
        }
      };

      const result = await MathNodeDefinition.execute(context);

      expect(result.outputs.result).toBe(60);
      expect(result.status).toBe('success');
    });

    it('should handle division by zero gracefully', async () => {
      const context: any = {
        node: { id: 'math3', data: { form: { value1: 10, value2: 0, operation: 'divide' } } },
        config: { value1: 10, value2: 0, operation: 'divide' },
        inputs: { value1: 10, value2: 0 },
        dispatcher: mockDispatcher,
        flowState: { components: {}, variables: {} }
      };

      const result = await MathNodeDefinition.execute(context);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Division by zero');
    });
  });

  describe('Display Node Execution', () => {
    it('should format and display text content', async () => {
      const context: any = {
        node: { id: 'display1', data: { form: { content: 'Hello {name}!', outputFormat: 'text' } } },
        config: { content: 'Hello {name}!', outputFormat: 'text' },
        inputs: { name: 'World' },
        dispatcher: mockDispatcher,
        flowState: { components: {}, variables: {} }
      };

      const result = await DisplayNodeDefinition.execute(context);

      expect(result.outputs.displayedContent).toBe('Hello World!');
      expect(result.status).toBe('success');
      expect(mockDispatcher.setNodeOutput).toHaveBeenCalledWith('display1', 'Hello World!', 'display');
    });

    it('should format JSON output correctly', async () => {
      const context: any = {
        node: { id: 'display2', data: { form: { content: '{"name": "{user}"}', outputFormat: 'json' } } },
        config: { content: '{"name": "{user}"}', outputFormat: 'json' },
        inputs: { user: 'Alice' },
        dispatcher: mockDispatcher,
        flowState: { components: {}, variables: {} }
      };

      const result = await DisplayNodeDefinition.execute(context);

      expect(result.outputs.displayedContent).toBe('{\n  "name": "Alice"\n}');
      expect(result.status).toBe('success');
    });
  });

  describe('Template Variable Processing', () => {
    it('should process nested template variables', async () => {
      const context: any = {
        node: { id: 'display3', data: { form: { content: 'User: {user.name} from {user.city}' } } },
        config: { content: 'User: {user.name} from {user.city}' },
        inputs: { 'user.name': 'Bob', 'user.city': 'Paris' },
        dispatcher: mockDispatcher,
        flowState: { components: {}, variables: {} }
      };

      const result = await DisplayNodeDefinition.execute(context);

      expect(result.outputs.displayedContent).toBe('User: Bob from Paris');
      expect(result.status).toBe('success');
    });

    it('should handle missing template variables gracefully', async () => {
      const context: any = {
        node: { id: 'display4', data: { form: { content: 'Hello {name}!' } } },
        config: { content: 'Hello {name}!' },
        inputs: {}, // Missing name variable
        dispatcher: mockDispatcher,
        flowState: { components: {}, variables: {} }
      };

      const result = await DisplayNodeDefinition.execute(context);

      expect(result.status).toBe('in_progress');
      expect(result.metadata?.message).toContain('Waiting for input variables');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON in display node', async () => {
      const context: any = {
        node: { id: 'display5', data: { form: { content: 'Invalid JSON: {data}', outputFormat: 'json' } } },
        config: { content: 'Invalid JSON: {data}', outputFormat: 'json' },
        inputs: { data: 'not json' },
        dispatcher: mockDispatcher,
        flowState: { components: {}, variables: {} }
      };

      const result = await DisplayNodeDefinition.execute(context);

      expect(result.outputs.displayedContent).toBe('"Invalid JSON: not json"');
      expect(result.status).toBe('success');
    });

    it('should handle execution errors gracefully', async () => {
      // Mock a failing executor
      const originalExecute = MathNodeDefinition.execute;
      MathNodeDefinition.execute = jest.fn().mockRejectedValue(new Error('Test error'));

      const context: any = {
        node: { id: 'math-error', data: { form: {} } },
        config: {},
        inputs: {},
        dispatcher: mockDispatcher,
        flowState: { components: {}, variables: {} }
      };

      try {
        const result = await MathNodeDefinition.execute(context);
        expect(result.status).toBe('error');
        expect(result.error).toContain('Test error');
      } finally {
        MathNodeDefinition.execute = originalExecute;
      }
    });
  });

  describe('State Management', () => {
    it('should update flow state correctly', async () => {
      const context: any = {
        node: { id: 'math4', data: { form: { value1: 15, value2: 5, operation: 'subtract' } } },
        config: { value1: 15, value2: 5, operation: 'subtract' },
        inputs: { value1: 15, value2: 5 },
        dispatcher: mockDispatcher,
        flowState: { components: {}, variables: {} }
      };

      await MathNodeDefinition.execute(context);

      expect(mockDispatcher.setNodeOutput).toHaveBeenCalledWith('math4', '10', 'math');
      expect(mockDispatcher.setCurrentNode).toHaveBeenCalledWith(context.node);
    });

    it('should handle state without dispatcher (legacy mode)', async () => {
      const context: any = {
        node: { id: 'math5', data: { form: { value1: 7, value2: 3, operation: 'multiply' } } },
        config: { value1: 7, value2: 3, operation: 'multiply' },
        inputs: { value1: 7, value2: 3 },
        dispatcher: null, // No dispatcher
        flowState: { components: {}, variables: {} }
      };

      const result = await MathNodeDefinition.execute(context);

      expect(result.outputs.result).toBe(21);
      expect(result.status).toBe('success');
    });
  });
});
