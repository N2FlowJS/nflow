import React from "react";
import { Flex, Tag, Tooltip } from "antd";
import { StarOutlined } from "@ant-design/icons";
import { ICategory } from "../../types/flowTypes";

interface UnconnectedCategoriesProps {
  categories: ICategory[];
  defaultCategory?: string;
}

const UnconnectedCategories: React.FC<UnconnectedCategoriesProps> = ({ 
  categories, 
  defaultCategory 
}) => {
  return (
    <Flex wrap="wrap" gap={4}>
      {categories.map((category) => (
        <Tooltip 
          key={category.name}
          title={
            <div>
              {category.description || "No description"}
              {category.examples && category.examples.length > 0 && (
                <div style={{ marginTop: 4 }}>
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
            </div>
          }
        >
          <Tag color={category.name === defaultCategory ? 'gold' : 'default'} style={{ opacity: 0.8 }}>
            {category.name === defaultCategory && (
              <StarOutlined style={{ marginRight: 4 }} />
            )}
            {category.name}
          </Tag>
        </Tooltip>
      ))}
    </Flex>
  );
};

export default UnconnectedCategories;
