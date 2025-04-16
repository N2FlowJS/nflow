import React, { useEffect, useState } from "react";
import { Position, NodeProps, Node } from "@xyflow/react";
import { GenerateNodeData } from "../../types/flowTypes";
import BaseNode from '../base-node';
import { Flex, Tooltip, Spin } from 'antd';
import { RobotOutlined, ApiOutlined, InfoCircleOutlined } from "@ant-design/icons";
import ModelInfo from "./ModelInfo";
import PromptInfo from "./PromptInfo";
import { fetchLLMModelById } from "../../../../services/llmService";

const GenerateNode = ({ data, id, selected }: NodeProps<Node<GenerateNodeData>>) => {
  const { form } = data;
  const [modelDetails, setModelDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch model details when the model ID changes
  useEffect(() => {
    if (form?.model && typeof form.model === 'string' && form.model.length > 10) {
      // Assume we have a model ID if string is longer than 10 chars
      setLoading(true);
      setError(null);
      
      fetchLLMModelById(form.model)
        .then(modelData => {
          setModelDetails(modelData);
        })
        .catch(err => {
          console.error("Error fetching model details:", err);
          setError("Failed to load model information");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [form?.model]);

  // Get an appropriate model display name
  const getModelDisplayName = () => {
    if (loading) return "Loading...";
    if (error) return "Error loading model";
    if (!form?.model) return "No model selected";
    
    // Use the display name from API if available
    if (modelDetails?.displayName) return modelDetails.displayName;
    if (modelDetails?.name) return modelDetails.name;
    
    // Fall back to the model ID or name from the form
    return form.model;
  };

  // Get model provider name if available
  const getProviderName = () => {
    if (modelDetails?.provider?.name) {
      return modelDetails.provider.name;
    }
    return null;
  };

  return (
    <BaseNode 
      data={data} 
      id={id}
      selected={selected}
      handlePositions={{
        input: Position.Left,
        output: Position.Right,
      }}
      icon={<RobotOutlined style={{ color: '#52c41a' }} />}
    >
      <Flex vertical gap={8}>
        <Flex align="center" justify="space-between">
          {loading ? (
            <Spin size="small" />
          ) : (
            <ModelInfo 
              model={getModelDisplayName()} 
              provider={getProviderName()}
              contextWindow={modelDetails?.contextWindow}
            />
          )}
          
          {error && (
            <Tooltip title={error}>
              <InfoCircleOutlined style={{ color: '#ff4d4f' }} />
            </Tooltip>
          )}
        </Flex>
        
        <PromptInfo prompt={form?.prompt || ""} />
      </Flex>
    </BaseNode>
  );
};

export default GenerateNode;
