/**
 * DYNAMIC NODE COMPONENT
 * 
 * Generic node component that renders based on NodeDefinition.
 * Eliminates need for 60+ custom node components.
 * 
 * Features:
 * - Automatically computes dynamic ports
 * - Renders icon from definition
 * - Displays config summary
 * - Uses BaseNode for consistent styling
 */

import React, { useMemo } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { BaseNode } from '@n2flowjs/flow';
import { Flex, Tag, Typography } from 'antd';
import { NodeRegistry } from '../node-registry';
import { 
  CodeOutlined, 
  ThunderboltOutlined, 
  DatabaseOutlined,
  ApiOutlined,
  BranchesOutlined,
  FunctionOutlined,
} from '@ant-design/icons';
import { NodeCategory } from '../../@node-plugin/type';

const { Text } = Typography;

/**
 * Get default icon by category
 */
function getDefaultIcon(category: NodeCategory) {
  switch (category) {
    case NodeCategory.AI:
      return <ThunderboltOutlined />;
    case NodeCategory.DATABASE:
      return <DatabaseOutlined />;
    case NodeCategory.API:
      return <ApiOutlined />;
    case NodeCategory.LOGIC:
      return <BranchesOutlined />;
    case NodeCategory.TRANSFORM:
      return <FunctionOutlined />;
    default:
      return <CodeOutlined />;
  }
}

/**
 * Render config summary for node display
 */
function renderConfigSummary(nodeType: string, config: any): React.ReactNode {
  if (!config) return null;

  // Common patterns for different node types
  const summaryPatterns: Record<string, (cfg: any) => React.ReactNode> = {
    'generate': (cfg) => (
      <Flex vertical gap={4}>
        {cfg.model && <Text type="secondary" style={{ fontSize: 11 }}>{cfg.model}</Text>}
        {cfg.temperature !== undefined && <Tag color="blue">Temp: {cfg.temperature}</Tag>}
      </Flex>
    ),
    'retrieval': (cfg) => (
      <Flex vertical gap={4}>
        {cfg.maxResults && <Tag color="green">Top {cfg.maxResults}</Tag>}
        {cfg.threshold !== undefined && <Tag color="orange">≥{cfg.threshold}</Tag>}
      </Flex>
    ),
    'http-request': (cfg) => (
      <Flex vertical gap={4}>
        {cfg.method && <Tag color="blue">{cfg.method}</Tag>}
        {cfg.url && <Text type="secondary" ellipsis style={{ fontSize: 11, maxWidth: 150 }}>{cfg.url}</Text>}
      </Flex>
    ),
    'condition': (cfg) => (
      <Flex vertical gap={4}>
        {cfg.expressions?.length > 0 && <Tag color="purple">{cfg.expressions.length} rules</Tag>}
      </Flex>
    ),
    'loop': (cfg) => (
      <Flex vertical gap={4}>
        {cfg.loopType && <Tag color="orange">{cfg.loopType}</Tag>}
        {cfg.maxIterations && <Tag color="blue">Max: {cfg.maxIterations}</Tag>}
      </Flex>
    ),
    'variable': (cfg) => (
      <Flex vertical gap={4}>
        {cfg.operation && <Tag color="cyan">{cfg.operation}</Tag>}
        {cfg.variableName && <Text type="secondary" style={{ fontSize: 11 }}>{cfg.variableName}</Text>}
      </Flex>
    ),
    'transform': (cfg) => (
      <Flex vertical gap={4}>
        {cfg.transformType && <Tag color="geekblue">{cfg.transformType}</Tag>}
      </Flex>
    ),
    'promt': (cfg) => (
      <Flex vertical gap={4}>
        {cfg.templateEngine && (
          <Tag color={cfg.templateEngine === 'simple' ? 'blue' : cfg.templateEngine === 'handlebars' ? 'orange' : 'green'}>
            {cfg.templateEngine.toUpperCase()}
          </Tag>
        )}
        {cfg.outputFormat && cfg.outputFormat !== 'text' && (
          <Tag color="purple">{cfg.outputFormat.toUpperCase()}</Tag>
        )}
        {cfg.templateContent && (
          <Text type="secondary" ellipsis style={{ fontSize: 11, maxWidth: 150 }}>
            {cfg.templateContent.substring(0, 30)}...
          </Text>
        )}
      </Flex>
    ),
    'json-parse': (cfg) => (
      <Flex vertical gap={4}>
        {cfg.operation && <Tag color="cyan">{cfg.operation}</Tag>}
        {cfg.jsonPath && <Text type="secondary" ellipsis style={{ fontSize: 11, maxWidth: 150 }}>{cfg.jsonPath}</Text>}
      </Flex>
    ),
    'text-process': (cfg) => (
      <Flex vertical gap={4}>
        {cfg.operation && <Tag color="blue">{cfg.operation}</Tag>}
      </Flex>
    ),
  };

  const renderer = summaryPatterns[nodeType];
  return renderer ? renderer(config) : null;
}

/**
 * Dynamic Node Component
 */
export const DynamicNode: React.FC<NodeProps<Node<any>>> = ({ data, id, selected }) => {
  const nodeType = data.type || data.nodeType;
  const definition = NodeRegistry.get(nodeType);
  
  // Fallback if definition not found
  if (!definition) {
    console.warn(`[DynamicNode] No definition found for node type: ${nodeType}`);
    return (
      <BaseNode
        data={data}
        id={id}
        selected={selected}
        inputPorts={[]}
        outputPorts={[]}
        icon={<CodeOutlined />}
        role={data.form?.role}
      >
        <Text type="danger" style={{ fontSize: 11 }}>Unknown node: {nodeType}</Text>
      </BaseNode>
    );
  }

  // Compute dynamic input ports based on config
  const inputPorts = useMemo(() => {
    if (data.form && definition.getDynamicInputs) {
      return definition.getDynamicInputs(data.form) || definition.inputs;
    }
    return definition.inputs;
  }, [data.form, definition]);

  // Compute dynamic output ports (if supported)
  const outputPorts = useMemo(() => {
    if (data.form && definition.getDynamicOutputs) {
      return definition.getDynamicOutputs(data.form) || definition.outputs;
    }
    return definition.outputs;
  }, [data.form, definition]);

  // Get icon (custom or default)
  const IconComponent = definition.icon;
  const icon = IconComponent ? <IconComponent /> : getDefaultIcon(definition.category);

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      inputPorts={inputPorts}
      outputPorts={outputPorts}
      icon={icon}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {renderConfigSummary(nodeType, data.form)}
      </Flex>
    </BaseNode>
  );
};

export default DynamicNode;
