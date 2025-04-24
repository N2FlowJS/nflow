import { Flow } from "../../types/flowTypes";

export function parseFlowConfig(flowConfig: string): Flow {
  try {
    const parsed = JSON.parse(flowConfig);

    return {
      nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
      edges: Array.isArray(parsed.edges) ? parsed.edges : [],
    };



  } catch (error) {
    console.error("Error parsing flow config:", error);
    return { nodes: [], edges: [] };
  }
}
