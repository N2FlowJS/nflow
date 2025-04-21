import React, { useState } from "react";
import { Input, Button, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ICategory } from "../../types/flowTypes";

interface CategoryCreatorProps {
  categories: ICategory[];
  defaultCategory: string;
  onAddCategory: (name: string, description: string) => void;
}

const CategoryCreator: React.FC<CategoryCreatorProps> = ({
  categories,
  defaultCategory,
  onAddCategory
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  
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
        placeholder="Category name"
        style={{ width: "40%" }}
      />
      <Input
        value={categoryDescription}
        onChange={(e) => setCategoryDescription(e.target.value)}
        placeholder="Description (optional)"
        style={{ width: "40%" }}
      />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAddCategory}
        disabled={!categoryName}
      >
        Add
      </Button>
    </Space.Compact>
  );
};

export default CategoryCreator;
