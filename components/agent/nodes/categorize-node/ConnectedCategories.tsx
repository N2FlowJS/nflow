import React from "react";
import { Flex, Typography, Tag, Tooltip, Card, Space } from "antd";
import { ArrowRightOutlined, StarOutlined } from "@ant-design/icons";
import { ICategory } from "../../types/flowTypes";
import { useReactFlow } from "@xyflow/react";

interface ConnectedCategoriesProps {
  categories: ICategory[];
  defaultCategory?: string;
}

const ConnectedCategories: React.FC<ConnectedCategoriesProps> = ({ 
  categories, 
  defaultCategory 
}) => {
  const { getNode } = useReactFlow();
  
  // Function to get node name from ID
  const getNodeName = (nodeId: string) => {
    const node = getNode(nodeId);
    if (!node) return shortenNodeId(nodeId);
    
    const nodeName = (node.data?.form as any)?.name;
    return nodeName || shortenNodeId(nodeId);
  };
  
  // Function to shorten node ID for display
  const shortenNodeId = (nodeId: string) => {
    if (!nodeId || nodeId.length <= 8) return nodeId;
    return `...${nodeId.slice(-6)}`;
  };

  return (
    <Card 
      size="small" 
      title={<Typography.Text type="secondary">Routing</Typography.Text>}
      style={{ 
        marginBottom: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: '#ffadd2'
      }}
      bodyStyle={{ padding: '4px 8px' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {categories.map((category) => (
          <Tooltip 
            key={category.name}
            title={
              <>
                {category.description && (
                  <div style={{ marginBottom: 4 }}>{category.description}</div>
                )}
                {category.targetNode && (
                  <div style={{ marginBottom: 4 }}>
                    Target Node ID: {category.targetNode}
                  </div>
                )}
                {category.examples && category.examples.length > 0 && (
                  <div>
                    <div>Examples:</div>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {category.examples.slice(0, 2).map((ex, i) => (
                        <li key={i}>{ex}</li>
                      ))}
                      {category.examples.length > 2 && (
                        <li>...and {category.examples.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </>
            }
          >
            <Flex align="center" justify="space-between" style={{ width: '100%' }}>
              <Tag color={category.name === defaultCategory ? 'gold' : 'pink'}>
                {category.name === defaultCategory && (
                  <StarOutlined style={{ marginRight: 4 }} />
                )}
                {category.name}
              </Tag>
              {category.targetNode && (
                <Space size={4}>
                  <ArrowRightOutlined style={{ fontSize: '10px', color: '#eb2f96' }} />
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    {getNodeName(category.targetNode)}
                  </Typography.Text>
                </Space>
              )}
            </Flex>
          </Tooltip>
        ))}
      </Space>
    </Card>
  );
};

export default ConnectedCategories;
