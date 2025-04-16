import { Flow } from "../types/flowTypes";

export function parseFlowConfig(flowConfig: string): Flow {
    try {
      const parsed = JSON.parse(flowConfig);
      
      // Add type information to nodes if missing
      const nodes = Array.isArray(parsed.nodes)
        ? parsed.nodes.map((node: any) => {
            // Ensure node has type in its data
            if (node.data && !node.data.type && node.type) {
              node.data.type = node.type;
            }
            
            // Convert legacy format to new format with form
            if (node.data) {
              const { type } = node.data;
              // Move type-specific fields to form
              if (type === 'begin' && node.data.description) {
                node.data.form = node.data.form || { description: node.data.description };
              } else if (type === 'interface' && (node.data.template || node.data.placeholder)) {
                node.data.form = node.data.form || {
                  template: node.data.template || '',
                  placeholder: node.data.placeholder || ''
                };
              } else if (type === 'generate' && (node.data.prompt || node.data.model)) {
                node.data.form = node.data.form || {
                  prompt: node.data.prompt || '',
                  model: node.data.model || ''
                };
              } else if (type === 'categorize' && (node.data.categories || node.data.defaultCategory)) {
                node.data.form = node.data.form || {
                  categories: node.data.categories || [],
                  defaultCategory: node.data.defaultCategory || ''
                };
              } else if (type === 'retrieval' && (node.data.knowledgeId || node.data.maxResults)) {
                node.data.form = node.data.form || {
                  knowledgeId: node.data.knowledgeId || '',
                  maxResults: node.data.maxResults || 3
                };
              }
            }
            
            return node;
          })
        : [];
      
      return {
        nodes,
        edges: Array.isArray(parsed.edges) ? parsed.edges : [],
      };
    } catch (error) {
      console.error("Error parsing flow config:", error);
      return { nodes: [], edges: [] };
    }
  }
  