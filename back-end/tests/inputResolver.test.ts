import { describe, it, expect } from 'vitest';
import { shouldSkipNode, resolveNodeConfig, collectNodeInputs } from '../services/engine/inputResolver';
import type { FlowNode, FlowEdge } from '../flowTypes';
import type { NodeStatus } from '../services/engine/graphBuilder';

describe('inputResolver', () => {
  describe('shouldSkipNode', () => {
    it('should not skip root nodes (no incoming edges)', () => {
      const nodeId = 'node-1';
      const incomingMap = new Map<string, FlowEdge[]>();
      const nodeById = new Map<string, FlowNode>();
      const nodeResults = new Map<string, unknown>();
      const nodeStatus = new Map<string, NodeStatus>();

      expect(shouldSkipNode(nodeId, incomingMap, nodeById, nodeResults, nodeStatus)).toBe(false);
    });

    it('should skip node if all incoming branches are inactive (ConditionComponent)', () => {
      const nodeId = 'target';
      const incomingMap = new Map<string, FlowEdge[]>([
        ['target', [
          { id: 'e1', source: 'cond', target: 'target', sourceHandle: 'true' } as FlowEdge
        ]]
      ]);
      const nodeById = new Map<string, FlowNode>([
        ['cond', { id: 'cond', data: { type: 'ConditionComponent' } } as FlowNode]
      ]);
      const nodeResults = new Map<string, unknown>([
        ['cond', false] // Condition result is false, but edge is for 'true'
      ]);
      const nodeStatus = new Map<string, NodeStatus>([
        ['cond', 'completed']
      ]);

      expect(shouldSkipNode(nodeId, incomingMap, nodeById, nodeResults, nodeStatus)).toBe(true);
    });

    it('should not skip node if at least one incoming branch is active', () => {
      const nodeId = 'target';
      const incomingMap = new Map<string, FlowEdge[]>([
        ['target', [
          { id: 'e1', source: 'cond', target: 'target', sourceHandle: 'true' } as FlowEdge
        ]]
      ]);
      const nodeById = new Map<string, FlowNode>([
        ['cond', { id: 'cond', data: { type: 'ConditionComponent' } } as FlowNode]
      ]);
      const nodeResults = new Map<string, unknown>([
        ['cond', 'true'] // Matches edge handle
      ]);
      const nodeStatus = new Map<string, NodeStatus>([
        ['cond', 'completed']
      ]);

      expect(shouldSkipNode(nodeId, incomingMap, nodeById, nodeResults, nodeStatus)).toBe(false);
    });
  });

  describe('resolveNodeConfig', () => {
    it('should resolve dynamic node-output references', () => {
      const node = {
        id: 'node-2',
        data: {
          params: {
            text: 'Hello {{nodes.node-1.name}}'
          }
        }
      } as FlowNode;

      const globalVariables: any[] = [];
      const nodeResults = new Map<string, unknown>([
        ['node-1', { name: 'World' }]
      ]);

      const resolved = resolveNodeConfig(node, globalVariables, nodeResults);
      expect(resolved.data.params.text).toBe('Hello World');
    });

    it('should resolve global variables', () => {
      const node = {
        id: 'node-2',
        data: {
          params: {
            apiKey: '{{MY_KEY}}'
          }
        }
      } as FlowNode;

      const globalVariables = [{ name: 'MY_KEY', value: 'secret-123' }];
      const nodeResults = new Map<string, unknown>();

      const resolved = resolveNodeConfig(node, globalVariables, nodeResults);
      expect(resolved.data.params.apiKey).toBe('secret-123');
    });
  });
});
