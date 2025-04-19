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
  FormInstance,
} from "antd";
import { AppstoreOutlined, DeleteOutlined, FileSearchOutlined, LinkOutlined } from "@ant-design/icons";
import { MarkerType, useReactFlow } from "@xyflow/react";
import { FlowNode, ICategory, CategorizeNode, CategorizeNodeData } from "../../types/flowTypes";
import BaseNodeForm from "../BaseNodeForm";
import CategoryListItem from "./CategoryListItem";
import DefaultCategorySelector from "./DefaultCategorySelector";
import CategoryCreator from "./CategoryCreator";

const { Panel } = Collapse;
const { Text } = Typography;

interface CategorizeNodeFormProps {
  form: FormInstance<CategorizeNodeData['form']>;
  selectedNode: FlowNode 
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CategorizeNodeForm: React.FC<CategorizeNodeFormProps> = (props) => {
  // Get current categories and default category from form
  const categories = Form.useWatch("categories", props.form) || [];
  const defaultCategory = Form.useWatch("defaultCategory", props.form) || "";

  // Get ReactFlow instance to access nodes and edges
  const { getNodes, getEdges, setEdges } = useReactFlow();
  const flowNodes = getNodes().filter(
    (node) => node.id !== props.selectedNode.id
  );

  // Update the categories in the form
  const updateCategories = (updatedCategories: ICategory[]) => {
    props.form.setFieldsValue({
      categories: updatedCategories,
    });
  };

  // Remove a category
  const removeCategory = (categoryName: string) => {
    const updatedCategories = categories.filter(
      (cat: ICategory) => cat.name !== categoryName
    );

    props.form.setFieldsValue({
      categories: updatedCategories,
    });

    // Update default category if needed
    if (defaultCategory === categoryName && updatedCategories.length > 0) {
      props.form.setFieldsValue({
        defaultCategory: updatedCategories[0].name,
      });
    } else if (updatedCategories.length === 0) {
      props.form.setFieldsValue({
        defaultCategory: "",
      });
    }
  };

  // Add a new category
  const addCategory = (name: string, description: string) => {
    const newCategory = {
      name,
      description,
      examples: [],
    };

    const updatedCategories = [...categories, newCategory];
    props.form.setFieldsValue({
      categories: updatedCategories,
    });

    // Set as default if it's the first category
    if (categories.length === 0) {
      props.form.setFieldsValue({
        defaultCategory: name,
      });
    }
  };

  // Override the BaseNodeForm's handleSave to add edge creation
  const handleSave = (values: any) => {
    // First update the node data with form values
    props.setNodes((nds: any) =>
      nds.map((node: any) =>
        node.id === props.selectedNode.id
          ? { ...node, data: { ...node.data, form: values } }
          : node
      )
    );

    // Then create/update edges based on category target nodes
    const currentEdges = getEdges();
    const sourceNodeId = props.selectedNode.id;

    // Remove existing edges from this categorize node
    const filteredEdges = currentEdges.filter(
      (edge) =>
        edge.source !== sourceNodeId || !edge.sourceHandle?.startsWith("out-")
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
          sourceHandle: `out-${category.name}`,
          type: "default",
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        });
      }
    });

    // Update the edges
    setEdges(newEdges);

    // Close the drawer
    props.setIsDrawerOpen(false);
  };
  const [availableNodes, setAvailableNodes] = useState<Array<{ id: string, name: string, type: string }>>([]);
  const [availableInputs, setAvailableInputs] = useState<Array<{ id: string, name: string, type: string }>>([]);

  useEffect(() => {
    // Get nodes that come before this node in the flow
    const findPrecedingNodes = () => {
      const allNodes = getNodes();
      const allEdges = getEdges();
      const currentNodeId = props.selectedNode.id;
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
  }, [props.selectedNode.id, getNodes, getEdges]);

  return (
    <BaseNodeForm {...props} customSaveHandler={handleSave}>

      <Panel
        header={
          <Space>
            <LinkOutlined />
            <span>Input References</span>
            {props.form?.getFieldValue('inputRefs')?.length > 0 && (
              <Tag color="blue">{props.form?.getFieldValue('inputRefs')?.length || 0}</Tag>
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
