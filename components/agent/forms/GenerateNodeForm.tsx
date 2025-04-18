import React, { useState, useEffect, useMemo } from "react"; // Import useMemo
import { Form, Input, Select, Spin, Typography, Space, Collapse } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { MentionsInput, Mention, SuggestionDataItem } from 'react-mentions';
import { FlowNode, } from "../types/flowTypes"; // Import Edge type
import BaseNodeForm from "./BaseNodeForm";
import { fetchAllLLMProviders } from "../../../services/llmService";
import { Edge, useEdges, useNodes } from "@xyflow/react";
import { log } from "console";

const { Text } = Typography;
const { Panel } = Collapse;

// Define static system variables (optional, can be combined with dynamic ones)
const staticSystemVariables: SuggestionDataItem[] = [
  { id: 'userInput', display: 'userInput' },
  // Add other static variables if needed
];

// --- Recursive backward traversal function ---
const findPredecessorVariables = (
  selectedNodeId: string,
  nodes: FlowNode[],
  edges: Edge[]
): SuggestionDataItem[] => {
  // Early return if no data
  if (!nodes?.length || !edges?.length) return [];
  
  console.log('Finding variables for node:', selectedNodeId);
  
  // Create a map for O(1) node lookups
  const nodesMap = new Map(nodes.map(node => [node.id, node]));
  
  // Store unique variable names
  const variableNames = new Set<string>();
  
  // Track visited nodes to prevent cycles
  const visited = new Set<string>();
  
  // Recursive function to traverse predecessors
  const findPredecessors = (nodeId: string) => {
    // Skip if already visited
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    
    // Find all direct incoming edges to this node
    const incomingEdges = edges.filter(edge => edge.target === nodeId);
    console.log('Processing node:', nodeId);
    console.log('Node data:', nodesMap.get(nodeId));  
    console.log('Outgoing edges:', edges.filter(edge => edge.source === nodeId));
    console.log('Incoming edges:', incomingEdges);
    // Process each predecessor
    for (const edge of incomingEdges) {
      const sourceId = edge.source;
      const sourceNode = nodesMap.get(sourceId);
      
      if (!sourceNode) continue;
      
      // Add the variable name
      const variableName = sourceNode.data?.form?.name || sourceNode.id;
      if (variableName) {
        variableNames.add(variableName);
      }
      
      // Stop at interface nodes, continue recursion for others
      if (sourceNode.type !== 'interface') {
        findPredecessors(sourceId);
      }
    }
  };
  
  // Start recursion from the selected node
  findPredecessors(selectedNodeId);
  
  // Convert to expected format
  const result = Array.from(variableNames).map(name => ({
    id: name,
    display: name
  }));
  
  console.log('Available variables:', result);
  return result;
};
// --- End Helper Function ---


// Basic styling to integrate better with Ant Design
const mentionsInputStyle = {
  control: {
    backgroundColor: '#fff',
    fontSize: 14,
    lineHeight: 1.5715,
    border: '1px solid #d9d9d9',
    borderRadius: '2px',
    minHeight: 150, // Match TextArea rows={10} roughly
  },
  '&multiLine': {
    control: {
      fontFamily: 'inherit',
    },
    highlighter: {
      padding: '9px 11px',
      border: '1px solid transparent',
    },
    input: {
      padding: '9px 11px',
      outline: 'none', // Remove focus outline
    },
  },
  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid rgba(0,0,0,0.15)',
      fontSize: 14,
      maxHeight: 200,
      overflowY: 'auto' as const,
    },
    item: {
      padding: '5px 15px',
      borderBottom: '1px solid rgba(0,0,0,0.15)',
      '&focused': {
        backgroundColor: '#f0f0f0', // Ant Design hover color
      },
    },
  },
};

interface GenerateNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  nodes: FlowNode[]; // Add nodes prop
  edges: Edge[]; // Add edges prop
}

const GenerateNodeForm: React.FC<GenerateNodeFormProps> = (props) => {
  const { selectedNode,  } = props; // Destructure new props

  const edges = useEdges();
  const nodes = useNodes<FlowNode>();

  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<{ id: string, name: string, displayName: string, providerId: string }[]>([]);
  const [providers, setProviders] = useState<{ id: string, name: string, models: any[] }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Calculate predecessor variables dynamically
  const dynamicVariables = useMemo(() => {
    if (!selectedNode || !nodes || !edges) {
      return [];
    }
    return findPredecessorVariables(selectedNode.id, nodes, edges);
  }, [selectedNode, nodes, edges]);

  // Combine static and dynamic variables
  const allVariables = useMemo(() => [
    ...staticSystemVariables,
    ...dynamicVariables
  ], [dynamicVariables]);

  useEffect(() => {
    const loadModels = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch providers with their models
        const providersData = await fetchAllLLMProviders();
        setProviders(providersData);

        // Collect all chat models from all providers
        const allModels = providersData.flatMap(provider =>
          (provider.models || [])
            .filter(model => model.modelType === 'chat' && model.isActive)
            .map(model => ({
              id: model.id,
              name: model.name,
              displayName: model.displayName || model.name,
              providerId: provider.id,
              providerName: provider.name
            }))
        );

        setModels(allModels);
      } catch (err) {
        console.error("Failed to load models:", err);
        setError("Failed to load available models. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  // Group models by provider for better organization
  const groupedModels = providers.map(provider => {
    const providerModels = models.filter(model => model.providerId === provider.id);
    return {
      provider,
      models: providerModels
    };
  }).filter(group => group.models.length > 0);

  return (
    <BaseNodeForm {...props}>
      <Form.Item
        name="model"
        label="Model"
        extra="Select the AI model to use for text generation"
        rules={[{ required: true, message: 'Please select a model' }]}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin tip="Loading available models..." />
          </div>
        ) : error ? (
          <div style={{ color: 'red' }}>
            <Text type="danger">{error}</Text>
          </div>
        ) : (
          <Select
            placeholder="Select a model"
            showSearch
            optionFilterProp="children"
            loading={loading}
          >
            {groupedModels.map(group => (
              <Select.OptGroup key={group.provider.id} label={group.provider.name}>
                {group.models.map(model => (
                  <Select.Option key={model.id} value={model.id}>
                    {model.displayName}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            ))}
            {models.length === 0 && !loading && !error && (
              <Select.Option disabled value="no-models">
                No models available
              </Select.Option>
            )}
          </Select>
        )}
      </Form.Item>

      <Collapse
        defaultActiveKey={['prompt', 'output']}
        bordered={false}
        expandIconPosition="end"
      >
        <Panel
          header={
            <Space>
              <FileTextOutlined />
              <span>Prompt Template</span>
            </Space>
          }
          key="prompt"
        >
          <Form.Item
            name="prompt"
            // No label needed as it's in the Panel header
            rules={[{ required: true, message: 'Please enter a prompt template' }]}
            // Use getValueFromEvent to correctly handle MentionsInput onChange
            getValueFromEvent={(event) => event.target.value}
          >
            <MentionsInput
              style={mentionsInputStyle} // Apply custom styles
              placeholder="Enter prompt template... Use @ to mention variables."
              a11ySuggestionsListLabel={"Suggested variables"}
              allowSpaceInQuery={true} // Allows searching for multi-word variables if needed
              // Control the component value
              onChange={(event, value: string) => props.form.setFieldsValue({ prompt: value })} // Update form on change
            >
              <Mention
                trigger="@" // Use @ to trigger suggestions
                data={allVariables} // Provide the variable data
                markup="{{__id__}}" // Define how the mention is inserted (using Ant Design variable style)
                displayTransform={(id: any) => `@${id}`} // How it looks in the suggestion list
                style={{ backgroundColor: '#e6f7ff' }} // Style for the highlighted mention
                appendSpaceOnAdd={true} // Add a space after inserting a mention
              />
              {/* Add more <Mention> components here for different triggers or data sources if needed */}
            </MentionsInput>
          </Form.Item>
          <div style={{ fontSize: '0.9em', color: '#888', marginTop: 8 }}>
            Use <code>@</code> to insert available variables like <code>@userInput</code> or <code>@retrievalResults</code>. They will be converted to <code>{'{{variableName}}'}</code> format.
          </div>
        </Panel>


      </Collapse>
    </BaseNodeForm>
  );
};

export default GenerateNodeForm;
