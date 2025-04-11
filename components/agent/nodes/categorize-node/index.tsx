import React, { memo } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { CategorizeNodeData, ICategory } from "../../types/flowTypes";
import { NODE_REGISTRY } from '../../util/NODE_REGISTRY';
import BaseNode from "../base-node";
import { Flex, Typography } from "antd";
import { BranchesOutlined } from "@ant-design/icons";
import ConnectedCategories from "./ConnectedCategories";
import UnconnectedCategories from "./UnconnectedCategories";
import DefaultCategory from "./DefaultCategory";

const CategorizeNode = ({
  data,
  id,
  selected,
}: NodeProps<Node<CategorizeNodeData>>) => {
  const categories = Array.isArray(data.form?.categories)
    ? data.form.categories
    : [];
  const nodeConfig = NODE_REGISTRY.categorize;
  
  // Separate categories into connected and unconnected
  const connectedCategories = categories.filter(c => c.targetNode);
  const unconnectedCategories = categories.filter(c => !c.targetNode);
  
  // Find default category
  const defaultCategory = categories.find(c => c.name === data.form?.defaultCategory);
  
  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: Position.Left,
      }}
      icon={<BranchesOutlined style={{ color:"#eb2f96"  }} />}
    >
      <div>
      
        
        {connectedCategories.length > 0 && (
          <ConnectedCategories 
            categories={connectedCategories} 
            defaultCategory={data.form?.defaultCategory} 
          />
        )}
        
        {unconnectedCategories.length > 0 && (
          <UnconnectedCategories 
            categories={unconnectedCategories} 
            defaultCategory={data.form?.defaultCategory} 
          />
        )}
        
        {defaultCategory && <DefaultCategory category={defaultCategory} />}
      </div>

      {categories.map((category: ICategory, index) => (
        <Handle
          key={category.name}
          type="source"
          position={Position.Right}
          style={{
            background: category.name === data.form?.defaultCategory ? '#faad14' : nodeConfig.color.handle,
            border: `2px solid ${category.name === data.form?.defaultCategory ? '#d48806' : nodeConfig.color.border}`,
            top: `${(index + 1) * (100 / (categories.length + 1))}%`,
            right: "-6px",
            width: "12px",
            height: "12px",
          }}
          id={`out-${category.name}`}
        />
      ))}
    </BaseNode>
  );
};

export default memo(CategorizeNode);
