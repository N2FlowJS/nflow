import { AppstoreOutlined } from "@ant-design/icons";
import { MarkerType, useReactFlow } from "@xyflow/react";
import {
  Collapse,
  Empty,
  Form,
  Input,
  List,
  Select,
  Space,
  Tag
} from "antd";
import React from "react";
import { CategorizeForm, CategorizeNodeData, FlowNode, ICategory } from "../../../../models/flowTypes";
import BaseNodeForm from "../base-node-form";
import InputReferences from "../shared/InputReferences";
import RoleSelector from "../shared/RoleSelector";
import CategoryCreator from "./category-creator";
import CategoryListItem from "./category-list-item";
import DefaultCategorySelector from "./default-category-selector";
import { FormInstance } from "antd/lib";


interface CategorizeNodeFormProps {
  form:  FormInstance<CategorizeForm>;
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

    // Get all current edges
    const currentEdges = getEdges();
    const sourceNodeId = selectedNode.id;

    // Find existing category edges from this node
    const existingCategoryEdges = currentEdges.filter(
      (edge) => edge.source === sourceNodeId && edge.sourceHandle?.startsWith("out-")
    );

    // Keep all non-category edges
    const nonCategoryEdges = currentEdges.filter(
      (edge) => !(edge.source === sourceNodeId && edge.sourceHandle?.startsWith("out-"))
    );

    // Create new edges array starting with all non-category edges
    const newEdges = [...nonCategoryEdges];

    // For each category with a target node
    values.categories.forEach((category: ICategory) => {
      if (category.targetNode) {
        const sourceHandle = `out-${category.name}`;

        // Check if this connection already exists
        const existingEdge = existingCategoryEdges.find(
          (edge) =>
            edge.source === sourceNodeId &&
            edge.target === category.targetNode &&
            edge.sourceHandle === sourceHandle
        );

        if (existingEdge) {
          // If connection already exists, keep it
          newEdges.push(existingEdge);
        } else {
          // If connection doesn't exist, create a new edge
          const edgeId = `edge-${sourceNodeId}-${category.name}-to-${category.targetNode}`;
          newEdges.push({
            id: edgeId,
            source: sourceNodeId,
            target: category.targetNode,
            sourceHandle: sourceHandle,
            type: "default",
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          });
        }
      }
    });

    // Update the edges state
    setEdges(newEdges);
  };



  return (
    <BaseNodeForm
      form={form}
      selectedNode={selectedNode}
      setIsDrawerOpen={setIsDrawerOpen}
      onSaveSuccess={syncEdgesWithCategories}
    >
      <InputReferences
        form={form}
        nodeid={selectedNode.id}
      />

      <RoleSelector />

      <Form.Item name="categories" initialValue={[]} hidden>
        <Input />
      </Form.Item>

      <Collapse
        defaultActiveKey={["categoryManager", "defaultCategory"]}
        bordered={false}
        expandIconPosition="end"
        className="form-collapse"
        items={[
          {
            key: "categoryManager",
            label: (
              <Space>
                <AppstoreOutlined />
                <span>Categories</span>
                {categories.length > 0 && (
                  <Tag color="pink">{categories.length}</Tag>
                )}
              </Space>
            ),
            children: (
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
            )
          },
          {
            key: "defaultCategory",
            label: <DefaultCategorySelector categories={categories} />,
            children: (
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
            )
          }
        ]}
      />
    </BaseNodeForm>
  );
};

export default CategorizeNodeForm;
