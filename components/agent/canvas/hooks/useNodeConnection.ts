import { useCallback } from 'react';
import { Connection, Edge, MarkerType, Position } from '@xyflow/react';
import { message } from 'antd';
import { FlowNode, NodeTypeString } from '../../../../models/flowTypes';
import { getOppositePosition, getPositionFromHandleId, slugify } from '../../../../packages/@flow/flow-helpers';

export const useNodeConnection = (
  nodes: FlowNode[],
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>,
  setEdges: React.Dispatch<React.SetStateAction<any[]>>
) => {
  return useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);

      if (sourceNode && targetNode) {
        const sourceType = sourceNode.type as NodeTypeString;
        const targetType = targetNode.type as NodeTypeString;

  // Connection rules now delegated to plugin layer; allow all here
  if (true) {
          let sourceHandle = params.sourceHandle ?? undefined;
          if (sourceType === 'decision' && sourceHandle?.startsWith('out-')) {
            const raw = sourceHandle.substring(4);
            sourceHandle = `out-${slugify(raw)}`;
          }
          let targetHandle = params.targetHandle ?? undefined;

          if (targetType === 'subagent') {
            targetHandle = `in-${Position.Top}-0`;
          }
          if (!targetHandle) {
            const srcPos = getPositionFromHandleId(sourceHandle) ?? Position.Left;
            const opposite = getOppositePosition(srcPos);
            targetHandle = `in-${opposite}-0`;
          }

          if (sourceType === 'decision') {
            const branchName = sourceHandle?.startsWith('out-') ? sourceHandle.substring(4) : '';

            setNodes((nds: FlowNode[]) =>
              nds.map((n) => {
                if (n.id === params.source) {
                  const form: any = { ...n.data.form } as any;

                  if (sourceHandle === 'out-default') {
                    form.defaultTarget = params.target!;
                  } else if (branchName) {
                    form.branches = form.branches.map((branch: any) =>
                      (slugify((branch as any).name) === branchName)
                        ? { ...branch, targetNode: params.target }
                        : branch
                    );
                  }

                  return {
                    ...n,
                    data: { ...n.data, form },
                  } as FlowNode;
                }
                return n;
              })
            );
          }
          if (sourceType === 'categorize' && sourceHandle) {
            const categoryName = sourceHandle.startsWith('out-') ? sourceHandle.substring(4) : sourceHandle;

            setNodes((nds: FlowNode[]) =>
              nds.map((n) => {
                if (n.id === params.source && n.type === 'categorize') {
                  const form = n.data.form as any;
                  if (!form.categories) return n;

                  return {
                    ...n,
                    data: {
                      ...n.data,
                      form: {
                        ...form,
                        categories: (form.categories as any[]).map((c: any) =>
                          slugify(c.name) === categoryName ? { ...c, targetNode: params.target } : c
                        ),
                      },
                    },
                  } as FlowNode;
                }
                return n;
              })
            );
          }

          const edgeToAdd: Edge = {
            id: `edge-${params.source}-${params.target}-${sourceHandle || 'sh'}-${targetHandle || 'none'}`,
            source: params.source!,
            target: params.target!,
            sourceHandle,
            ...(targetHandle ? { targetHandle } : {}),
            type: 'default',
            markerEnd: { type: MarkerType.ArrowClosed },
          } as Edge;

          setEdges((eds) => {
            if (eds.some((e) => e.id === edgeToAdd.id)) return eds;
            return [...eds, edgeToAdd];
          });
        } else {
          message.error(`Cannot connect ${sourceType} node to ${targetType} node`);
        }
      }
    },
    [nodes, setEdges, setNodes]
  );
};
