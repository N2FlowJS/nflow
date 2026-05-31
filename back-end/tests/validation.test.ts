import { describe, expect, it } from 'vitest';
import { validateNodeConnectivity, validateToolConnectivity } from '../flow-validation/utils';
import { Node, Edge } from '@xyflow/react';

describe('Flow Validation Utilities', () => {
  describe('validateNodeConnectivity', () => {
    it('should identify orphaned nodes', () => {
      const nodes: Node[] = [
        { id: 'n1', data: { label: 'Connected' }, position: { x: 0, y: 0 } },
        { id: 'n2', data: { label: 'Orphan' }, position: { x: 100, y: 100 } },
      ];
      const edges: Edge[] = [
        { id: 'e1', source: 'n1', target: 'some-other-node' },
      ];

      const issues = validateNodeConnectivity(nodes, edges);

      expect(issues).toHaveLength(1);
      expect(issues[0].nodeId).toBe('n2');
      expect(issues[0].message).toContain('is not connected to the flow');
    });

    it('should ignore Note nodes', () => {
      const nodes: Node[] = [
        { id: 'n1', data: { type: 'CyberNote', label: 'Note' }, position: { x: 0, y: 0 } },
      ];
      const edges: Edge[] = [];

      const issues = validateNodeConnectivity(nodes, edges);

      expect(issues).toHaveLength(0);
    });

    it('should handle nodes connected as target', () => {
      const nodes: Node[] = [{ id: 'n1', data: {}, position: { x: 0, y: 0 } }];
      const edges: Edge[] = [{ id: 'e1', source: 'other', target: 'n1' }];

      const issues = validateNodeConnectivity(nodes, edges);
      expect(issues).toHaveLength(0);
    });
  });

  describe('validateToolConnectivity', () => {
    it('should warn for tool nodes without incoming connections', () => {
      const nodes: Node[] = [
        { id: 't1', data: { type: 'HTTPRequestComponent', label: 'HTTP' }, position: { x: 0, y: 0 } },
      ];
      const edges: Edge[] = [];

      const issues = validateToolConnectivity(nodes, edges);

      expect(issues).toHaveLength(1);
      expect(issues[0].nodeId).toBe('t1');
      expect(issues[0].message).toContain('has no input connections');
    });

    it('should not warn if tool node has incoming connection', () => {
      const nodes: Node[] = [
        { id: 't1', data: { type: 'HTTPRequestComponent', label: 'HTTP' }, position: { x: 0, y: 0 } },
      ];
      const edges: Edge[] = [{ id: 'e1', source: 'trigger', target: 't1' }];

      const issues = validateToolConnectivity(nodes, edges);

      expect(issues).toHaveLength(0);
    });

    it('should ignore non-tool nodes', () => {
      const nodes: Node[] = [
        { id: 'n1', data: { type: 'StandardNode', label: 'Standard' }, position: { x: 0, y: 0 } },
      ];
      const edges: Edge[] = [];

      const issues = validateToolConnectivity(nodes, edges);

      expect(issues).toHaveLength(0);
    });
  });
});
