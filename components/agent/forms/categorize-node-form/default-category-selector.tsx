import React from "react";
import { Form, Select, Space } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { ICategory } from "../../types/flowTypes";

interface DefaultCategorySelectorProps {
  categories: ICategory[];
}

const DefaultCategorySelector: React.FC<DefaultCategorySelectorProps> = ({
  categories
}) => {
  return (
    <Space>
      <EditOutlined />
      <span>Default Category</span>
      <Form.Item 
        name="defaultCategory" 
        help="This category will be used when no other categories match"
        noStyle
      >
        <Select 
          placeholder="Select default category" 
          style={{ width: '100%' }}
          disabled={categories.length === 0}
        >
          {categories.map((category: ICategory) => (
            <Select.Option key={category.name} value={category.name}>
              {category.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Space>
  );
};

export default DefaultCategorySelector;
