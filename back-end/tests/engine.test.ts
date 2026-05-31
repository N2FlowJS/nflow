import { describe, expect, it } from 'vitest';
import { buildGraphMaps, performTopologicalSort } from '../services/engine/graphBuilder';
import { FlowNode, FlowEdge } from '../flowTypes';

describe('Graph Builder & Topological Sort', () => {
  describe('buildGraphMaps', () => {
    it('should correctly build maps for a simple DAG', () => {
      const nodes: FlowNode[] = [
        { id: 'n1', type: 'standard', position: { x: 0, y: 0 }, data: { label: 'Node 1', type: 'standard' } },
        { id: 'n2', type: 'standard', position: { x: 0, y: 0 }, data: { label: 'Node 2', type: 'standard' } },
        { id: 'n3', type: 'standard', position: { x: 0, y: 0 }, data: { label: 'Node 3', type: 'standard' } },
      ];
      const edges: FlowEdge[] = [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
      ];

      const maps = buildGraphMaps(nodes, edges);

      expect(maps.nodeById.size).toBe(3);
      expect(maps.nonGroupCount).toBe(3);
      
      expect(maps.inDegree.get('n1')).toBe(0);
      expect(maps.inDegree.get('n2')).toBe(1);
      expect(maps.inDegree.get('n3')).toBe(1);

      expect(maps.outgoingMap.get('n1')).toEqual(['n2']);
      expect(maps.outgoingMap.get('n2')).toEqual(['n3']);
      expect(maps.outgoingMap.get('n3')).toEqual([]);

      expect(maps.incomingMap.get('n2')).toHaveLength(1);
      expect(maps.incomingMap.get('n2')![0].source).toBe('n1');
    });

    it('should ignore cyberGroup nodes in inDegree and adjacency maps', () => {
      const nodes: FlowNode[] = [
        { id: 'n1', type: 'standard', position: { x: 0, y: 0 }, data: { label: 'Node 1', type: 'standard' } },
        { id: 'g1', type: 'cyberGroup', position: { x: 0, y: 0 }, data: { label: 'Group 1', type: 'cyberGroup' } },
      ];
      const edges: FlowEdge[] = [];

      const maps = buildGraphMaps(nodes, edges);

      expect(maps.nonGroupCount).toBe(1);
      expect(maps.inDegree.has('n1')).toBe(true);
      expect(maps.inDegree.has('g1')).toBe(false);
    });
  });

  describe('performTopologicalSort', () => {
    it('should return nodes in correct order for a simple linear graph', () => {
      const nodes: FlowNode[] = [
        { id: 'n1', type: 'standard', position: { x: 0, y: 0 }, data: { label: '1', type: 'standard' } },
        { id: 'n2', type: 'standard', position: { x: 0, y: 0 }, data: { label: '2', type: 'standard' } },
        { id: 'n3', type: 'standard', position: { x: 0, y: 0 }, data: { label: '3', type: 'standard' } },
      ];
      const edges: FlowEdge[] = [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
      ];

      const maps = buildGraphMaps(nodes, edges);
      const sorted = performTopologicalSort(maps.inDegree, maps.outgoingMap, maps.nonGroupCount);

      expect(sorted).toEqual(['n1', 'n2', 'n3']);
    });

    it('should handle branched graphs', () => {
       // n1 -> n2 -> n4
       // n1 -> n3 -> n4
       const nodes: FlowNode[] = [
        { id: 'n1', type: 'standard', position: { x: 0, y: 0 }, data: { label: '1', type: 'standard' } },
        { id: 'n2', type: 'standard', position: { x: 0, y: 0 }, data: { label: '2', type: 'standard' } },
        { id: 'n3', type: 'standard', position: { x: 0, y: 0 }, data: { label: '3', type: 'standard' } },
        { id: 'n4', type: 'standard', position: { x: 0, y: 0 }, data: { label: '4', type: 'standard' } },
      ];
      const edges: FlowEdge[] = [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n1', target: 'n3' },
        { id: 'e3', source: 'n2', target: 'n4' },
        { id: 'e4', source: 'n3', target: 'n4' },
      ];

      const maps = buildGraphMaps(nodes, edges);
      const sorted = performTopologicalSort(maps.inDegree, maps.outgoingMap, maps.nonGroupCount);

      expect(sorted[0]).toBe('n1');
      expect(sorted[3]).toBe('n4');
      // n2 and n3 can be in any order in between
      expect(sorted.slice(1, 3)).toContain('n2');
      expect(sorted.slice(1, 3)).toContain('n3');
    });

    it('should throw an error if a cycle is detected', () => {
      const nodes: FlowNode[] = [
        { id: 'n1', type: 'standard', position: { x: 0, y: 0 }, data: { label: '1', type: 'standard' } },
        { id: 'n2', type: 'standard', position: { x: 0, y: 0 }, data: { label: '2', type: 'standard' } },
      ];
      const edges: FlowEdge[] = [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n1' },
      ];

      const maps = buildGraphMaps(nodes, edges);
      
      expect(() => 
        performTopologicalSort(maps.inDegree, maps.outgoingMap, maps.nonGroupCount)
      ).toThrow('Cycle detected in the flow! Cannot execute.');
    });
  });
});
