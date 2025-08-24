import React, { useState } from "react";
import { Input, Button, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ICategory } from "../../categorize/types";
import { useLocale } from "../../../locale";

interface CategoryCreatorProps {
  categories: ICategory[];
  defaultCategory: string;
  onAddCategory: (name: string, description: string) => void;
}

const CategoryCreator: React.FC<CategoryCreatorProps> = ({
  categories,
  onAddCategory
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const { t } = useLocale('form.nodeForm');
  
  const resetInputs = () => {
    setCategoryName("");
    setCategoryDescription("");
  };
  
  const handleAddCategory = () => {
    if (!categoryName) return;
    
    // Check if category already exists
    if (categories.some((cat) => cat.name === categoryName)) {
      // Could add error message here
      return;
    }
    
    // Add new category
    onAddCategory(categoryName, categoryDescription);
    resetInputs();
  };
  
  return (
    <Space.Compact style={{ width: "100%" }}>
      <Input
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder={t('categoryNamePlaceholder')}
        style={{ width: "40%" }}
      />
      <Input
        value={categoryDescription}
        onChange={(e) => setCategoryDescription(e.target.value)}
        placeholder={t('categoryDescriptionPlaceholder')}
        style={{ width: "40%" }}
      />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAddCategory}
        disabled={!categoryName}
      >
        {t('addCategoryButton')}
      </Button>
    </Space.Compact>
  );
};

export default CategoryCreator;
