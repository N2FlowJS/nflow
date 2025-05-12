import { Flow } from "../../models/flowTypes";

export function parseFlowConfig(parsed: any): Flow {
  try {

    return {
      nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
      edges: Array.isArray(parsed.edges) ? parsed.edges : [],
    };



  } catch (error: unknown) {
    console.error("Error parsing flow config:", error);
    return { nodes: [], edges: [] };
  }
}
