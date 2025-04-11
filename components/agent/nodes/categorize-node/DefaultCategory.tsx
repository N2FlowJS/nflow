import React from "react";
import { Flex, Typography, Tag, Divider } from "antd";
import { StarOutlined } from "@ant-design/icons";
import { ICategory } from "../../types/flowTypes";

interface DefaultCategoryProps {
  category: ICategory;
}

const DefaultCategory: React.FC<DefaultCategoryProps> = ({ category }) => {
  return (
    <>
      <Divider style={{ margin: '8px 0' }} />
      <Flex align="center" gap={6}>
        <Typography.Text type="secondary">Default:</Typography.Text>
        <Tag color="gold">
          <StarOutlined style={{ marginRight: 4 }} />
          {category.name}
        </Tag>
      </Flex>
    </>
  );
};

export default DefaultCategory;
