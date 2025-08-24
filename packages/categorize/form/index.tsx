import { AppstoreOutlined } from "@ant-design/icons";
import { MarkerType, useReactFlow } from "@xyflow/react";
import React, { useCallback } from "react";
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
import { CategorizeForm, CategorizeNodeData, ICategory } from '../../categorize/types';
import { FlowNode } from '../../../models/flowTypes';
import BaseNodeForm from "../../@flow/form";
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import CategoryCreator from "./category-creator";
import CategoryListItem from "./category-list-item";
import DefaultCategorySelector from "./default-category-selector";
import { FormInstance } from "antd/lib";
import { useLocale } from "../../../locale";


interface CategorizeNodeFormProps {
  form:  FormInstance<CategorizeForm>;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// New hook: returns a stable callback to sync edges for categories
const useCategoryEdgeSync = (sourceNodeId: string) => {
  const { getEdges, setEdges } = useReactFlow();

  return useCallback((values: CategorizeNodeData['form']) => {
    const currentEdges = getEdges();

    const managed = currentEdges.filter(
      (e) => e.source === sourceNodeId && e.sourceHandle?.startsWith('out-')
    );
    const preserved = currentEdges.filter(
      (e) => !(e.source === sourceNodeId && e.sourceHandle?.startsWith('out-'))
    );

    const nextEdges = [...preserved];

    values.categories.forEach((cat: ICategory) => {
      if (!cat.targetNode) return;
      const sourceHandle = `out-${cat.name}`;
      const existing = managed.find(
        (e) => e.source === sourceNodeId && e.target === cat.targetNode && e.sourceHandle === sourceHandle
      );
      nextEdges.push(
        existing ?? {
          id: `edge-${sourceNodeId}-${cat.name}-to-${cat.targetNode}`,
          source: sourceNodeId,
          target: cat.targetNode,
          sourceHandle,
          type: 'default',
          markerEnd: { type: MarkerType.ArrowClosed },
        }
      );
    });

    setEdges(nextEdges);
  }, [getEdges, setEdges, sourceNodeId]);
};

const CategorizeNodeForm: React.FC<CategorizeNodeFormProps> = ({ form, selectedNode, setIsDrawerOpen }) => {
  // Get form instance using hook

  // Get current categories and default category from form using the hook instance
  const categories = Form.useWatch("categories", form) || [];
  const defaultCategory = Form.useWatch("defaultCategory", form) || "";

  // Get ReactFlow instance to access nodes and edges
  const flowNodes = useReactFlow().getNodes().filter(
    (node) => node.id !== selectedNode.id
  );
  const { t } = useLocale('form.nodeForm');

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

  const syncEdgesWithCategories = useCategoryEdgeSync(selectedNode.id);

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
                <span>{t('categoriesLabel')}</span>
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
                    description={t('noVariablesDefined')} // Assuming this was a typo and meant no categories
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
                help={t('defaultCategoryHelp')}
                noStyle
              >
                <Select
                  placeholder={t('defaultCategoryPlaceholder')}
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
         