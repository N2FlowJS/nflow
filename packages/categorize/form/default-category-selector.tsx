import React from "react";
import { Form, Select, Space } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { ICategory } from "../../categorize/types";
import { useLocale } from "../../../locale";

interface DefaultCategorySelectorProps {
  categories: ICategory[];
}

const DefaultCategorySelector: React.FC<DefaultCategorySelectorProps> = ({
  categories
}) => {
  const { t } = useLocale('form.nodeForm');
  return (
    <Space>
      <EditOutlined />
      <span>{t('defaultCategoryLabel')}</span>
      <Form.Item 
        name="defaultCategory" 
        help={t('defaultCategoryHelp')}
        noStyle
      >
        <Select 
          placeholder={t('defaultCategoryPlaceholder')}
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
