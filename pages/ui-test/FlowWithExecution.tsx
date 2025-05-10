import React, { useState, useEffect } from 'react';
import { useNodesState, useEdgesState, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: '1', data: { label: 'Start' }, position: { x: 100, y: 50 }, style: {} },
  { id: '2', data: { label: 'Process A' }, position: { x: 300, y: 50 }, style: {} },
  { id: '3', data: { label: 'Process B' }, position: { x: 300, y: 150 }, style: {} },
  { id: '4', data: { label: 'End' }, position: { x: 500, y: 100 }, style: {} },
  { id: '5', data: { label: 'Conditional Check' }, position: { x: 100, y: 150 }, style: {} },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-5', source: '1', target: '5', animated: true },
  { id: 'e5-2', source: '5', target: '2', animated: true, data: { condition: 'result === "success"' } }, // Edge có điều kiện
  { id: 'e5-3', source: '5', target: '3', animated: true, data: { condition: 'result !== "success"' } }, // Edge có điều kiện
  { id: 'e2-4', source: '2', target: '4', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
];

const FlowWithExecution = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [executedNodes, setExecutedNodes] = useState<string[]>([]);
  const [dependencyGraph, setDependencyGraph] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<'success' | 'failure' | null>(null); // Kết quả cho nút conditional check
  const buildDependencyGraph = React.useCallback(() => {
    const graph: Record<string, string[]> = {};

    edges.forEach((edge) => {
      if (!graph[edge.source]) {
        graph[edge.source] = [];
      }

      // Check for conditional edges
      if (edge.data?.condition) {
        const condition = edge.data.condition;
        // Use eval or a safe alternative to evaluate the condition
        try {
          if (eval(condition)) {
            // CAUTION: eval() can be dangerous. Use with caution.
            graph[edge.source].push(edge.target);
          }
        } catch (error) {
          console.error('Error evaluating condition:', error);
          // Handle the error, perhaps by preventing the edge from being added.
        }
      } else {
        graph[edge.source].push(edge.target);
      }
    });
    setDependencyGraph(graph);
  }, [edges]);
  useEffect(() => {
    buildDependencyGraph();
  }, [buildDependencyGraph, edges, result]); // Rebuild graph when edges or result changes

  const executeNodeLogic = async (nodeId: string) => {
    console.log(`Executing node: ${nodeId}`);
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Logic for the conditional check node
    if (nodeId === '5') {
      const randomResult = Math.random() > 0.5 ? 'success' : 'failure';
      setResult(randomResult as 'success' | 'failure');
      console.log(`Conditional check result: ${randomResult}`);
    } else {
      console.log(`Node ${nodeId} complete`);
    }

    // Change node style after execution
    setNodes((nds) => nds.map((node) => (node.id === nodeId ? { ...node, style: { ...node.style, backgroundColor: 'lightgreen' } } : node)));
  };

  const depthFirstSearch = async (nodeId: string, visited = new Set<string>()) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    setNodes((nds) => nds.map((node) => (node.id === nodeId ? { ...node, style: { ...node.style, backgroundColor: 'lightblue' } } : node)));

    await executeNodeLogic(nodeId);
    setExecutedNodes((prev) => [...prev, nodeId]);

    const nextNodes = dependencyGraph[nodeId] || [];
    for (const nextNode of nextNodes) {
      await depthFirstSearch(nextNode, visited);
    }
  };

  const handleExecuteFlow = async () => {
    setExecutedNodes([]);
    setResult(null); // Reset result for conditional node
    setNodes((nds) => nds.map((node) => ({ ...node, style: { ...node.style, backgroundColor: 'white' } })));

    const startNodeId = '1';
    await depthFirstSearch(startNodeId);
    console.log('Flow execution complete.');
  };

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView />
      <button onClick={handleExecuteFlow}>Execute Flow</button>
      <div>Executed Nodes: {executedNodes.join(', ')}</div>
      <div>Conditional Result: {result}</div>
    </div>
  );
};

export default FlowWithExecution;
