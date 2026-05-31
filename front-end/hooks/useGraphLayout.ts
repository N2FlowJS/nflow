import { useCallback, useState } from "react";
import dagre from "dagre";
import type { Node, Edge, ReactFlowInstance } from "@xyflow/react";
import {
  getNodeFieldValue,
  getNodeInputHandles,
  getNodeSourceHandles,
} from "../../back-end/node-registry";
import type { CustomNodeType } from "@n2flow/types";

export type LayoutMode =
  | "LR"
  | "TB"
  | "SMART"
  | "LAYERED"
  | "FORCE"
  | "RADIAL"
  | "ORTHOGONAL"
  | "TREE"
  | "DAGRE_LR"
  | "DAGRE_TB"
  | "DAGRE_RL"
  | "DAGRE_BT";

// Type extensions for third-party library integration
type MeasuredNode = Node & {
  measured?: {
    width?: number;
    height?: number;
  };
};

type EdgeWithHandles = Edge & {
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

type ELKNode = {
  id: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  layoutOptions?: Record<string, string>;
  children?: ELKNode[];
  ports?: Array<{ id: string }>;
};

type ELKEdge = {
  id: string;
  sources: string[];
  targets: string[];
  sections?: Array<{
    startPoint?: { x: number; y: number };
    endPoint?: { x: number; y: number };
    bendPoints?: Array<{ x: number; y: number }>;
  }>;
};

type ELKLayoutConfig = {
  id: string;
  layoutOptions: Record<string, string>;
  children: ELKNode[];
  edges: ELKEdge[];
};

type ELKLayoutResult = {
  children?: Array<{ id: string; x: number; y: number }>;
  edges?: ELKEdge[];
};

export const useGraphLayout = ({
  nodes,
  edges,
  setNodes,
  setEdges,
  reactFlowInstance,
}: {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  reactFlowInstance?: ReactFlowInstance | null;
}) => {
  const [isLayouting, setIsLayouting] = useState(false);

  const waitForMeasuredNodes = useCallback(async (maxAttempts = 20, interval = 50) => {
    if (!reactFlowInstance) return;
    let attempts = 0;
    while (attempts < maxAttempts) {
      const flowNodes = reactFlowInstance.getNodes();
      const hasMeasured = flowNodes.some((n) => {
        const measured = (n as MeasuredNode).measured;
        return typeof measured?.width === 'number' && measured.width > 0 && 
               typeof measured?.height === 'number' && measured.height > 0;
      });
      if (hasMeasured) return;
      // wait a bit for the renderer to measure nodes
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, interval));
      attempts += 1;
    }
  }, [reactFlowInstance]);

  const hasCycle = useCallback(() => {
    const adj = new Map<string, string[]>();
    nodes.forEach((n) => adj.set(n.id, []));
    edges.forEach((e) => {
      if (!adj.has(e.source)) return;
      adj.get(e.source)!.push(e.target);
    });

    const visited = new Set<string>();
    const rec = new Set<string>();
    let foundCycle = false;

    const dfs = (u: string) => {
      if (foundCycle) return;
      visited.add(u);
      rec.add(u);
      const nbrs = adj.get(u) || [];
      for (const v of nbrs) {
        if (!visited.has(v)) dfs(v);
        else if (rec.has(v)) {
          foundCycle = true;
          return;
        }
      }
      rec.delete(u);
    };

    for (const k of adj.keys()) {
      if (!visited.has(k)) dfs(k);
      if (foundCycle) break;
    }

    return foundCycle;
  }, [nodes, edges]);

  const runLayout = useCallback(
    async (mode: LayoutMode = "LR") => {
      setIsLayouting(true);
      try {
        // Determine whether to use ELK or Dagre based on requested mode
        const useElk = [
          "SMART",
          "LAYERED",
          "FORCE",
          "RADIAL",
          "ORTHOGONAL",
          "TREE",
        ].includes(mode);

        if (useElk) {
          let algorithm: string;
          switch (mode) {
            case "FORCE":
              algorithm = "force";
              break;
            case "RADIAL":
              algorithm = "radial";
              break;
            case "ORTHOGONAL":
              algorithm = "orthogonal";
              break;
            case "TREE":
              algorithm = "tree";
              break;
            case "LAYERED":
              algorithm = "layered";
              break;
            case "SMART":
            default:
              algorithm = hasCycle() ? "force" : "layered";
              break;
          }

          type LayoutHandlePlacement = {
            position: "top" | "right" | "bottom" | "left";
            index: number;
            count: number;
            offsetRatio: number;
          };

          const getNodeType = (node: Node): string => {
            const dataType = typeof (node.data as { type?: unknown })?.type === "string"
              ? ((node.data as { type?: string }).type as string)
              : undefined;
            if (dataType) return dataType;
            return typeof node.type === "string" ? node.type : "cyberNode";
          };

          const getNodeSize = (node: Node) => {
            const flowNode = reactFlowInstance ? reactFlowInstance.getNodes().find((n) => n.id === node.id) || node : node;
            const measured = (flowNode as MeasuredNode).measured;
            return {
              width: typeof measured?.width === "number" ? measured.width : getNodeType(node) === "Agent" ? 350 : 300,
              height: typeof measured?.height === "number" ? measured.height : getNodeType(node) === "Agent" ? 250 : 150,
            };
          };

          const extractPromptVariables = (node: Node): string[] => {
            const nodeType = getNodeType(node);
            if (nodeType !== "Prompt Template" && nodeType !== "PromptTemplate") {
              return [];
            }
            const template = String(
              getNodeFieldValue(node.data as CustomNodeType["data"], "template") || "",
            );
            return Array.from(
              new Set(
                Array.from(template.matchAll(/\{\s*([a-zA-Z0-9_]+)\s*\}/g)).map(
                  (match) => match[1],
                ),
              ),
            ).slice(0, 8);
          };

          const normalizeOffsetRatio = (
            index: number,
            count: number,
            explicitOffsetPercent?: number,
          ) => {
            if (typeof explicitOffsetPercent === "number") {
              return Math.max(0, Math.min(1, explicitOffsetPercent / 100));
            }
            if (count <= 1) return 0.5;
            return (index + 1) / (count + 1);
          };

          const resolveSourcePlacement = (
            node: Node,
            handleId?: string | null,
          ): LayoutHandlePlacement => {
            const nodeType = getNodeType(node);
            const registryHandles = getNodeSourceHandles(nodeType);
            if (registryHandles.length > 0) {
              const index = handleId
                ? registryHandles.findIndex((handle) => handle.id === handleId)
                : registryHandles.findIndex((handle) => !handle.id);
              const safeIndex = index >= 0 ? index : 0;
              const handle = registryHandles[safeIndex];
              return {
                position: handle.position,
                index: safeIndex,
                count: registryHandles.length,
                offsetRatio: normalizeOffsetRatio(
                  safeIndex,
                  registryHandles.length,
                  handle.offsetPercent,
                ),
              };
            }

            return {
              position: handleId === "as_tool" ? "top" : "right",
              index: 0,
              count: 1,
              offsetRatio: 0.5,
            };
          };

          const resolveTargetPlacement = (
            node: Node,
            handleId?: string | null,
          ): LayoutHandlePlacement => {
            const nodeType = getNodeType(node);
            if (nodeType === "Prompt Template" || nodeType === "PromptTemplate") {
              const promptVariables = extractPromptVariables(node);
              if (promptVariables.length > 0 && handleId) {
                const variableIndex = promptVariables.indexOf(handleId);
                if (variableIndex >= 0) {
                  return {
                    position: "left",
                    index: variableIndex,
                    count: promptVariables.length,
                    offsetRatio: normalizeOffsetRatio(
                      variableIndex,
                      promptVariables.length,
                    ),
                  };
                }
              }
            }

            const registryHandles = getNodeInputHandles(nodeType);
            if (registryHandles.length > 0) {
              const index = handleId
                ? registryHandles.findIndex((handle) => handle.id === handleId)
                : registryHandles.findIndex((handle) => !handle.id);
              const safeIndex = index >= 0 ? index : 0;
              const handle = registryHandles[safeIndex];
              return {
                position: handle.position,
                index: safeIndex,
                count: registryHandles.length,
                offsetRatio: normalizeOffsetRatio(
                  safeIndex,
                  registryHandles.length,
                  handle.offsetPercent,
                ),
              };
            }

            return {
              position: "left",
              index: 0,
              count: 1,
              offsetRatio: 0.5,
            };
          };

          const sideByPosition = (
            position: LayoutHandlePlacement["position"],
          ): "NORTH" | "EAST" | "SOUTH" | "WEST" => {
            if (position === "top") return "NORTH";
            if (position === "right") return "EAST";
            if (position === "bottom") return "SOUTH";
            return "WEST";
          };

          const nodeById = new Map(nodes.map((node) => [node.id, node]));
          const portsByNode = new Map<string, any[]>();
          const portIdByKey = new Map<string, string>();

          const ensurePort = (
            nodeId: string,
            kind: "source" | "target",
            handleId: string | null | undefined,
            placement: LayoutHandlePlacement,
          ) => {
            const normalizedHandle = handleId || "__default__";
            const key = `${nodeId}|${kind}|${normalizedHandle}`;
            const existing = portIdByKey.get(key);
            if (existing) return existing;

            const portId = `${nodeId}::${kind}::${normalizedHandle}`;
            const ports = portsByNode.get(nodeId) || [];
            ports.push({
              id: portId,
              width: 10,
              height: 10,
              layoutOptions: {
                "org.eclipse.elk.port.side": sideByPosition(placement.position),
                "org.eclipse.elk.port.index": String(placement.index),
              },
            });
            portsByNode.set(nodeId, ports);
            portIdByKey.set(key, portId);
            return portId;
          };

          const elkEdges: ELKEdge[] = edges
            .map((edge) => {
              const sourceNode = nodeById.get(edge.source);
              const targetNode = nodeById.get(edge.target);
              if (!sourceNode || !targetNode) return null;

              const edgeWithHandles = edge as EdgeWithHandles;
              const sourcePlacement = resolveSourcePlacement(
                sourceNode,
                edgeWithHandles.sourceHandle,
              );
              const targetPlacement = resolveTargetPlacement(
                targetNode,
                edgeWithHandles.targetHandle,
              );

              const sourcePort = ensurePort(
                edge.source,
                "source",
                edgeWithHandles.sourceHandle,
                sourcePlacement,
              );
              const targetPort = ensurePort(
                edge.target,
                "target",
                edgeWithHandles.targetHandle,
                targetPlacement,
              );

              return {
                id: edge.id,
                sources: [sourcePort],
                targets: [targetPort],
              };
            })
            .filter((e): e is ELKEdge => !!e);

          const elkNodes = nodes.map((node) => {
            const size = getNodeSize(node);
            return {
              id: node.id,
              width: size.width,
              height: size.height,
              ports: portsByNode.get(node.id) || [],
              layoutOptions: {
                "org.eclipse.elk.portConstraints": "FIXED_ORDER",
              },
            };
          });

          try {
            // Wait briefly for nodes to be measured by the renderer (if available)
            await waitForMeasuredNodes();

            const { default: ELK } = await import("elkjs/lib/elk.bundled.js");
            const elk = new ELK();

            const buildLayoutOptions = (alg: string): Record<string, string> => {
              const opts: Record<string, string> = {
                "elk.algorithm": alg,
                "elk.spacing.nodeNode": "140",
                "elk.spacing.edgeNode": "60",
              };
              if (alg === "layered") {
                Object.assign(opts, {
                  "elk.direction": "RIGHT",
                  "elk.edgeRouting": "ORTHOGONAL",
                  "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
                  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
                  "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
                  "elk.layered.spacing.nodeNodeBetweenLayers": "220",
                });
              } else if (alg === "force") {
                Object.assign(opts, {
                  "elk.force.edgeLength": "80",
                  "elk.force.iterations": "300",
                });
              } else if (alg === "radial") {
                Object.assign(opts, {
                  "elk.radial.layering.strategy": "RADIUS",
                });
              } else if (alg === "orthogonal") {
                Object.assign(opts, {
                  "elk.orthogonal.routing": "ORTHOGONAL",
                });
              } else if (alg === "tree") {
                Object.assign(opts, {
                  "elk.direction": "DOWN",
                  "elk.spacing.nodeNodeBetweenLayers": "160",
                });
              }
              return opts;
            };

            const runElkOnce = async (alg: string) => {
              const layoutOptions = buildLayoutOptions(alg);
              // Cast to any for elk library compatibility - the library has loose typing
              const layoutConfig = { id: "root", layoutOptions, children: elkNodes, edges: elkEdges } as unknown;
              const elkPromise = elk.layout(layoutConfig as any);
              const res = await Promise.race([
                elkPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('ELK layout timeout')), 8000)),
              ]);
              return res as ELKLayoutResult;
            };

            const applyElkResult = (result: ELKLayoutResult) => {
              const children = (result.children || []) as Array<{ id: string; x: number; y: number }>;
              const positionById = new Map(children.map((child) => [child.id, { x: child.x, y: child.y }]));

              // apply node positions
              setNodes((nds: Node[]) =>
                nds.map((node) => {
                  const next = positionById.get(node.id);
                  if (!next) return node;
                  return {
                    ...node,
                    position: {
                      x: Math.round(next.x),
                      y: Math.round(next.y),
                    },
                  };
                }),
              );

              // set elkPoints on edges
              const elkEdgeMap = new Map((result.edges || []).map((e) => [e.id, e]));
              try {
                setEdges((eds: Edge[]) =>
                  eds.map((edge) => {
                    const prevData = (edge.data as Record<string, unknown>) || {};
                    const elkEdge = elkEdgeMap.get(edge.id as string);
                    if (!elkEdge) return { ...edge, data: { ...prevData, elkPoints: undefined } };

                    const pts: Array<{ x: number; y: number }> = [];
                    for (const section of elkEdge.sections || []) {
                      if (section.startPoint) pts.push({ x: Math.round(section.startPoint.x), y: Math.round(section.startPoint.y) });
                      if (Array.isArray(section.bendPoints)) {
                        for (const bp of section.bendPoints) pts.push({ x: Math.round(bp.x), y: Math.round(bp.y) });
                      }
                      if (section.endPoint) pts.push({ x: Math.round(section.endPoint.x), y: Math.round(section.endPoint.y) });
                    }

                    const dedup = pts.filter((p, i) => i === 0 || p.x !== pts[i - 1].x || p.y !== pts[i - 1].y);
                    return { ...edge, data: { ...prevData, elkPoints: dedup } };
                  }),
                );
              } catch (err) {
                console.warn('Failed to set edge elkPoints', err);
              }

              // compute overlap count
              let overlapCount = 0;
              const nodesWithBox = children.map((child) => {
                const node = nodeById.get(child.id)!;
                const size = getNodeSize(node);
                return {
                  id: child.id,
                  left: child.x,
                  top: child.y,
                  right: child.x + size.width,
                  bottom: child.y + size.height,
                };
              });
              for (let i = 0; i < nodesWithBox.length; i++) {
                for (let j = i + 1; j < nodesWithBox.length; j++) {
                  const a = nodesWithBox[i];
                  const b = nodesWithBox[j];
                  const intersects = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
                  if (intersects) overlapCount += 1;
                }
              }

              return overlapCount;
            };

          
            // run initial ELK
            const initialResult = await runElkOnce(algorithm);

           

            setTimeout(() => {
              reactFlowInstance?.fitView({ duration: 700, padding: 0.2 });
            }, 50);

            return;
          } catch (err) {
            console.error("ELK layout failed or timed out, falling back to dagre", err);
          }
        }

        // Dagre layout (used for LR/TB or explicit DAGRE modes or fallback)
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));

        // Map mode to dagre rankdir
        let rankdir: "LR" | "TB" | "RL" | "BT" = "LR";
        if (mode === "TB" || mode === "DAGRE_TB") rankdir = "TB";
        else if (mode === "DAGRE_RL") rankdir = "RL";
        else if (mode === "DAGRE_BT") rankdir = "BT";
        else rankdir = "LR";

        dagreGraph.setGraph({ rankdir, ranksep: 220, nodesep: 160 });

        nodes.forEach((node) => {
          const isAgent = node.type === "Agent";
          const width = isAgent ? 350 : 300;
          const height = isAgent ? 250 : 150;
          dagreGraph.setNode(node.id, { width, height });
        });

        edges.forEach((edge) => {
          dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        setNodes((nds: Node[]) =>
          nds.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id) as
              | { x: number; y: number }
              | undefined;
            const isAgent = node.type === "Agent";
            const width = isAgent ? 350 : 300;
            const height = isAgent ? 250 : 150;

            if (!nodeWithPosition) return node;
            return {
              ...node,
              position: {
                x: nodeWithPosition.x - width / 2,
                y: nodeWithPosition.y - height / 2,
              },
            };
          }),
        );

        setTimeout(() => {
          reactFlowInstance?.fitView({ duration: 800, padding: 0.2 });
        }, 50);
      } finally {
        setIsLayouting(false);
      }
    },
    [nodes, edges, setNodes, setEdges, reactFlowInstance, hasCycle, waitForMeasuredNodes],
  );

  return { runLayout, isLayouting } as const;
};

export default useGraphLayout;
