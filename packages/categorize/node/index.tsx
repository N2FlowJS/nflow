import React from "react"; // Remove memo
import { Handle, Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import { BranchesOutlined } from "@ant-design/icons";
import ConnectedCategories from "./ConnectedCategories";
import UnconnectedCategories from "./UnconnectedCategories";
import DefaultCategory from "./DefaultCategory";
import { theme } from 'antd';
import { CategorizeNodeData, ICategory } from "../../categorize/types";
import { useFlowEditorContext } from "@n2flowjs/flow/editor-context";
import BaseNode from "@n2flowjs/flow/node/base-node";
import { slugify } from "@n2flowjs/flow/flow-helpers";
import { getHandleStyle } from "@n2flowjs/flow/node/base-node/handle-icon";

const CategorizeNode = ({
  data,
  id,
  selected,
}: NodeProps<Node<CategorizeNodeData>>) => {
  const categories = Array.isArray(data.form?.categories)
    ? data.form.categories
    : [];
  const { openNextStepModal } = useFlowEditorContext();
  const { getNode } = useReactFlow();
  const { token } = theme.useToken();

  const styleOpts = {
    sourceColor: token.colorSuccess,
    targetColor: token.colorPrimary,
    borderColor: (token as any).colorBorderSecondary ?? token.colorBorder,
    shadow: (token as any).boxShadowSecondary ?? token.boxShadow,
  };

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
        input: [Position.Left],
        output: [],
      }}
      icon={<BranchesOutlined style={{ color: "#eb2f96" }} />}
      role={data.form?.role}
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

      {categories.map((category: ICategory, index) => {
        const isDefault = category.name === data.form?.defaultCategory;
        const handleId = `out-${slugify(category.name)}`;
        const total = categories.length;
        const styleBase = getHandleStyle(Position.Right, 'source', index, total, styleOpts);
        return (
          <Handle
            key={category.name}
            type="source"
            position={Position.Right}
            style={{
              ...styleBase,
              background: isDefault ? token.colorWarning : styleBase?.background,
            }}
            id={handleId}
            title={category.name}
            onClick={(e) => {
              e.stopPropagation();
              const n = getNode(id as any);
              const sourceW = (n as any)?.width ?? (n as any)?.measured?.width;
              const sourceH = (n as any)?.height ?? (n as any)?.measured?.height;
              openNextStepModal?.({
                nodeId: id,
                handleId: handleId,
                handleType: 'source',
                position: Position.Right,
                nodeType: data.type as any,
                clientX: e.clientX,
                clientY: e.clientY,
                sourceW: sourceW as number,
                sourceH: sourceH as number,
              });
            }}
          />
        );
      })}
    </BaseNode>
  );
};

export default CategorizeNode; // Export directly
