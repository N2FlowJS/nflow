import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Space,
  Typography,
  Collapse,
  List,
  Empty,
  Tag,
  Select,
  Button,
} from "antd";
import { AppstoreOutlined, DeleteOutlined, LinkOutlined } from "@ant-design/icons";
import { MarkerType, useReactFlow } from "@xyflow/react";
import { FlowNode, ICategory, CategorizeNodeData } from "../../types/flowTypes";
import BaseNodeForm from "../base-node-form";
import CategoryListItem from "./category-list-item";
import DefaultCategorySelector from "./default-category-selector";
import CategoryCreator from "./category-creator";

const { Panel } = Collapse;
const { Text } = Typography;

interface CategorizeNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CategorizeNodeForm: React.FC<CategorizeNodeFormProps> = ({ form, selectedNode, setIsDrawerOpen }) => {
  // Get form instance using hook

  // Get current categories and default category from form using the hook instance
  const categories = Form.useWatch("categories", form) || [];
  const defaultCategory = Form.useWatch("defaultCategory", form) || "";

  // Get ReactFlow instance to access nodes and edges
  const { getNodes, getEdges, setEdges } = useReactFlow();
  const flowNodes = getNodes().filter(
    (node) => node.id !== selectedNode.id
  );

  // Update the categories in the form using the hook instance
  const updateCategories = (updatedCategories: ICategory[]) => {
    form.setFieldsValue({
      categories: updatedCategories,
    });
  };

  // Remove a category using the hook instance
  const removeCategory = (categoryName: string) => {
    const updatedCategories = categories.filter(
      (cat: ICategory) => cat.name !== categoryName
    );

    form.setFieldsValue({
      categories: updatedCategories,
    });

    // Update default category if needed using the hook instance
    if (defaultCategory === categoryName && updatedCategories.length > 0) {
      form.setFieldsValue({
        defaultCategory: updatedCategories[0].name,
      });
    } else if (updatedCategories.length === 0) {
      form.setFieldsValue({
        defaultCategory: "",
      });
    }
  };

  // Add a new category using the hook instance
  const addCategory = (name: string, description: string) => {
    const newCategory = {
      name,
      description,
      examples: [],
    };

    const updatedCategories = [...categories, newCategory];
    form.setFieldsValue({
      categories: updatedCategories,
    });

    // Set as default if it's the first category using the hook instance
    if (categories.length === 0) {
      form.setFieldsValue({
        defaultCategory: name,
      });
    }
  };

  // Renamed from handleSave: This function now only syncs edges
  const syncEdgesWithCategories = (values: CategorizeNodeData['form']) => {
    // Note: Node data is already saved by BaseNodeForm's handleSave

    // Create/update edges based on category target nodes
    const currentEdges = getEdges();
    const sourceNodeId = selectedNode.id;

    // Remove existing edges originating from this categorize node's category handles
    const filteredEdges = currentEdges.filter(
      (edge) =>
        !(edge.source === sourceNodeId && edge.sourceHandle?.startsWith("out-"))
    );

    // Create new edges for each category with a target node
    const newEdges = [...filteredEdges];

    values.categories.forEach((category: ICategory) => {
      if (category.targetNode) {
        const edgeId = `edge-${sourceNodeId}-${category.name}-to-${category.targetNode}`;
        newEdges.push({
          id: edgeId,
          source: sourceNodeId,
          target: category.targetNode,
          sourceHandle: `out-${category.name}`, // Ensure sourceHandle matches handle id
          type: "default", // Or your preferred edge type
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        });
      }
    });

    // Update the edges state
    setEdges(newEdges);

    // No need to close drawer here, BaseNodeForm handles it
  };

  const [availableNodes, setAvailableNodes] = useState<Array<{ id: string, name: string, type: string }>>([]);
  const [availableInputs, setAvailableInputs] = useState<Array<{ id: string, name: string, type: string }>>([]);

  useEffect(() => {
    // Get nodes that come before this node in the flow
    const findPrecedingNodes = () => {
      const allNodes = getNodes();
      const allEdges = getEdges();
      const currentNodeId = selectedNode.id;
      const precedingNodes = new Map<string, { id: string, name: string, type: string }>();

      // Function to traverse the graph backwards
      const traverseBackwards = (nodeId: string, visited = new Set<string>()) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        // Find all incoming edges to this node
        const incomingEdges = allEdges.filter(edge => edge.target === nodeId);

        for (const edge of incomingEdges) {
          const sourceNode = allNodes.find(node => node.id === edge.source);
          if (!sourceNode) continue;

          // Get node type with fallback to ensure it's always a string
          const nodeType = (sourceNode.data?.type as string) ||
            (sourceNode.type as string) ||
            'unknown';

          // Stop traversal at interface nodes
          if (nodeType === 'interface') {
            precedingNodes.set(sourceNode.id, {
              id: sourceNode.id,
              name: (sourceNode.data?.form as { name?: string })?.name ||
                sourceNode.data?.label as string ||
                sourceNode.id,
              type: nodeType
            });
            continue;
          }

          // Add this node to the preceding nodes
          precedingNodes.set(sourceNode.id, {
            id: sourceNode.id,
            name: (sourceNode.data?.form as { name?: string })?.name ||
              sourceNode.data?.label as string ||
              sourceNode.id,
            type: nodeType
          });

          // Continue traversal
          traverseBackwards(sourceNode.id, visited);
        }
      };

      // Start traversal from the current node
      traverseBackwards(currentNodeId);

      return Array.from(precedingNodes.values());
    };

    // Set available nodes for input references
    const precedingNodes = findPrecedingNodes();
    setAvailableNodes(precedingNodes);

    // Set available inputs for input source selection
    // This includes standard input sources plus any preceding node outputs
    setAvailableInputs([
      { id: 'user_input', name: 'User Input', type: 'system' },
      { id: 'generated_text', name: 'Generated Text', type: 'system' },
      ...precedingNodes.map(node => ({
        id: `node:${node.id}`,
        name: `From ${node.name}`,
        type: node.type
      }))
    ]);
  }, [selectedNode.id, getNodes, getEdges]);

  return (
    <BaseNodeForm
      form={form}
      selectedNode={selectedNode}
      setIsDrawerOpen={setIsDrawerOpen}
      onSaveSuccess={syncEdgesWithCategories}
    >

      <Panel
        header={
          <Space>
            <LinkOutlined />
            <span>Input References</span>
            {/* Use form instance from hook */}
            {form?.getFieldValue('inputRefs')?.length > 0 && (
              <Tag color="blue">{form?.getFieldValue('inputRefs')?.length || 0}</Tag>
            )}
          </Space>
        }
        key="input-refs"
      >
        <Form.Item name="inputRefs" initialValue={[]}>
          <Form.List name="inputRefs">
            {(fields, { add, remove }) => (
              <>
                {fields.map(field => (
                  <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...field}
                      name={[field.name, 'sourceNodeId']}
                      rules={[{ required: true, message: 'Source node is required' }]}
                      style={{ width: 200 }}
                    >
                      <Select placeholder="Source Node">
                        {availableNodes.map(node => (
                          <Select.Option key={node.id} value={node.id}>
                            {node.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...field}
                      name={[field.name, 'outputName']}
                      rules={[{ required: true, message: 'Output name is required' }]}
                      style={{ width: 150 }}
                    >
                      <Input placeholder="Output Name" />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      name={[field.name, 'inputName']}
                      rules={[{ required: true, message: 'Input name is required' }]}
                      style={{ width: 150 }}
                    >
                      <Input placeholder="As Input Name" />
                    </Form.Item>

                    <DeleteOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}

                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<LinkOutlined />}
                  >
                    Add Input Reference
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Panel>

      <Form.Item name="categories" initialValue={[]} hidden>
        <Input />
      </Form.Item>

      <Collapse
        defaultActiveKey={["categoryManager", "defaultCategory"]}
        bordered={false}
        expandIconPosition="end"
        className="form-collapse"
      >
        <Panel
          header={
            <Space>
              <AppstoreOutlined />
              <span>Categories</span>
              {categories.length > 0 && (
                <Tag color="pink">{categories.length}</Tag>
              )}
            </Space>
          }
          key="categoryManager"
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {/* Category creator component */}
            <CategoryCreator
              categories={categories}
              defaultCategory={defaultCategory}
              onAddCategory={addCategory}
            />

            {/* Categories list */}
            {categories.length > 0 ? (
              <List
                size="small"
                dataSource={categories}
                renderItem={(category: ICategory) => (
                  <CategoryListItem
                    key={category.name}
                    category={category}
                    categories={categories}
                    nodes={flowNodes}
                    updateCategories={updateCategories}
                    removeCategory={removeCategory}
                  />
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No categories defined"
                style={{ margin: "12px 0" }}
              />
            )}
          </Space>
        </Panel>

        <Panel
          header={<DefaultCategorySelector categories={categories} />}
          key="defaultCategory"
        >
          <Form.Item
            name="defaultCategory"
            help="This category will be used when no other categories match"
            noStyle
          >
            <Select
              placeholder="Select default category"
              style={{ width: "100%" }}
            >
              {categories.map((category: ICategory) => (
                <Select.Option key={category.name} value={category.name}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Panel>
      </Collapse>
    </BaseNodeForm>
  );
};

export default CategorizeNodeForm;
