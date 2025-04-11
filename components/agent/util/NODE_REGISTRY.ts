import {
  NodeTypeString,
  NodeConfig,
  BeginNodeData,
  InterfaceNodeData,
  GenerateNodeData,
  CategorizeNodeData,
  RetrievalNodeData,
} from "../types/flowTypes";

// Central registry of all node types

export const NODE_REGISTRY: Record<NodeTypeString, NodeConfig> = {
  begin: {
    type: "begin",
    label: "Begin",
    description: "Starting point of the flow",
    color: {
      background: "#91caff",
      border: "#69b1ff",
      handle: "#1677ff",
    },

    defaultData: {
      label: "Begin",
      type: "begin",
      form: {
        name: "Begin",
        greeting: "Hello!",
        variables: [],
        description: "Starting point of the flow",
      },
    } as Partial<BeginNodeData>,
  },

  interface: {
    type: "interface",
    label: "Interface",
    description: "Interaction with the user",
    color: {
      background: "#d4e6f9",
      border: "#91caff",
      handle: "#1677ff",
    },
    defaultData: {
      name: "Interface",
      label: "Interface",
      type: "interface",
    } as Partial<InterfaceNodeData>,
  },

  generate: {
    type: "generate",
    label: "Generate",
    description: "Generate content using AI",
    color: {
      background: "#d9f7be",
      border: "#95de64",
      handle: "#52c41a",
    },

    defaultData: {
      label: "Generate",
      type: "generate",
      form: {
        name: "Generate",
        description: "Generate content using",
        prompt: "",
        model: "gpt-3.5-turbo",
      },
    } as Partial<GenerateNodeData>,
  },

  categorize: {
    type: "categorize",
    label: "Categorize",
    description: "Categorize input into different paths",
    color: {
      background: "#ffd6e7",
      border: "#ffadd2",
      handle: "#eb2f96",
    },

    defaultData: {
      label: "Categorize",
      type: "categorize",
      form: {
        name: "Categorize",
        description: "Categorize input into different paths",
        categories: [
          {
            name: "positive",
            description: "Positive sentiment or feedback",
            examples: [
              "I love this product",
              "Great service",
              "Works perfectly",
            ],
          },
          {
            name: "negative",
            description: "Negative sentiment or feedback",
            examples: ["Not working", "Poor quality", "Very disappointing"],
          },
        ],
        defaultCategory: "positive",
      },
    } as Partial<CategorizeNodeData>,
  },

  retrieval: {
    type: "retrieval",
    label: "Retrieval",
    description: "Retrieve information from knowledge bases",
    color: {
      background: "#d9d9d9",
      border: "#bfbfbf",
      handle: "#595959",
    },
    defaultData: {
      label: "Retrieval",
      type: "retrieval",

      form: {
        name: "Retrieval",
        knowledgeIds: [],
        maxResults: 3,
        description: "Retrieve information from knowledge base",
      },
    } as Partial<RetrievalNodeData>,
  },
};
