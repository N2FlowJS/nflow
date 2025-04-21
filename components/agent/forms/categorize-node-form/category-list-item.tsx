import React, { useState } from "react";
import { 
  Input, 
  Button, 
  Space, 
  Typography, 
  Collapse, 
  List,
  Empty,
  Tooltip,
  Select,
  Divider
} from "antd";
import { 
  DeleteOutlined, 
  LinkOutlined,
  FileTextOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { ICategory } from "../../types/flowTypes";
import { Node } from "@xyflow/react";

const { Panel } = Collapse;
const { Text } = Typography;

interface CategoryListItemProps {
  category: ICategory;
  categories: ICategory[];
  nodes: Node[];
  updateCategories: (updatedCategories: ICategory[]) => void;
  removeCategory: (categoryName: string) => void;
}

const CategoryListItem: React.FC<CategoryListItemProps> = ({
  category,
  categories,
  nodes,
  updateCategories,
  removeCategory
}) => {
  const [newExample, setNewExample] = useState("");
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  
  // Update category description
  const updateDescription = (value: string) => {
    const updatedCategories = categories.map((cat: ICategory) => 
      cat.name === category.name 
        ? { ...cat, description: value } 
        : cat
    );
    updateCategories(updatedCategories);
  };
  
  // Update category target node
  const updateTargetNode = (nodeId: string) => {
    const updatedCategories = categories.map((cat: ICategory) => 
      cat.name === category.name 
        ? { ...cat, targetNode: nodeId } 
        : cat
    );
    updateCategories(updatedCategories);
  };

  // Add example to category
  const addExample = () => {
    if (!newExample) return;
    
    const currentExamples = category.examples || [];
    if (!currentExamples.includes(newExample)) {
      const updatedCategories = categories.map((cat: ICategory) => 
        cat.name === category.name 
          ? { ...cat, examples: [...currentExamples, newExample] } 
          : cat
      );
      updateCategories(updatedCategories);
      setNewExample("");
    }
  };

  // Remove example from category
  const removeExample = (example: string) => {
    if (!category.examples) return;
    
    const updatedCategories = categories.map((cat: ICategory) => 
      cat.name === category.name 
        ? { ...cat, examples: cat.examples?.filter(ex => ex !== example) } 
        : cat
    );
    updateCategories(updatedCategories);
  };

  return (
    <Collapse
      className="category-collapse"
      bordered={false}
      style={{ marginBottom: 8, background: '#f5f5f5', borderRadius: 4 }}
    >
      <Panel
        key={category.name}
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Text strong>{category.name}</Text>
            <Space>
              <Tooltip title="Remove Category">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCategory(category.name);
                  }}
                />
              </Tooltip>
            </Space>
          </div>
        }
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {/* Description */}
          <Input
            placeholder="Category description"
            value={category.description || ""}
            onChange={(e) => updateDescription(e.target.value)}
          />
          
          {/* Target node selection */}
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
              <LinkOutlined /> Target Node:
            </Text>
            <Select 
              placeholder="Select target node"
              style={{ width: '100%' }}
              value={category.targetNode}
              onChange={updateTargetNode}
              options={nodes.map(node => ({
                value: node.id,
                label: (node.data?.form as any)?.name || node.id
              }))}
              optionFilterProp="label"
              showSearch
            />
          </div>
          
          {/* Examples section */}
          <Divider orientation="left" style={{ margin: '12px 0 8px' }}>
            <Space>
              <FileTextOutlined />
              <span>Examples</span>
            </Space>
          </Divider>
          
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="Add example for this category"
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              onPressEnter={addExample}
            />
            <Button
              icon={<PlusOutlined />}
              onClick={addExample}
              disabled={!newExample}
            >
              Add
            </Button>
          </Space.Compact>
          
          {/* Examples list */}
          {category.examples && category.examples.length > 0 ? (
            <List
              size="small"
              bordered
              style={{ marginTop: 8 }}
              dataSource={category.examples}
              renderItem={(example) => (
                <List.Item
                  actions={[
                    <Button 
                      key="delete" 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      size="small"
                      onClick={() => removeExample(example)}
                    />
                  ]}
                >
                  <Text>{example}</Text>
                </List.Item>
              )}
            />
          ) : (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description="No examples added"
              style={{ margin: '8px 0' }}
            />
          )}
        </Space>
      </Panel>
    </Collapse>
  );
};

export default CategoryListItem;
