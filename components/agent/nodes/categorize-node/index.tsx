import React from "react"; // Remove memo
import { Handle, Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import { CategorizeNodeData, ICategory } from "../../../../models/flowTypes";
import { NODE_REGISTRY } from '../../../../utils/client/NODE_REGISTRY';
import BaseNode from "../base-node";
import { BranchesOutlined } from "@ant-design/icons";
import ConnectedCategories from "./ConnectedCategories";
import UnconnectedCategories from "./UnconnectedCategories";
import DefaultCategory from "./DefaultCategory";
import { useFlowEditorContext } from "../../canvas/canvas";

const CategorizeNode = ({
  data,
  id,
  selected,
}: NodeProps<Node<CategorizeNodeData>>) => {
  const categories = Array.isArray(data.form?.categories)
    ? data.form.categories
    : [];
  const nodeConfig = NODE_REGISTRY.categorize;
  const { openNextStepModal } = useFlowEditorContext();
  const { getNode } = useReactFlow();

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

      {categories.map((category: ICategory, index) => (
        <Handle
          key={category.name}
          type="source"
          position={Position.Right}
          style={{
            background: category.name === data.form?.defaultCategory ? '#faad14' : nodeConfig.color.handle,
            border: `2px solid ${category.name === data.form?.defaultCategory ? '#d48806' : nodeConfig.color.border}`,
            top: `${(index + 1) * (100 / (categories.length + 1))}%`,
            right: "-5px",
            width: "10px",
            height: "10px",
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 2,
          }}
          id={`out-${category.name}`}
          onClick={(e) => {
            e.stopPropagation();
            const n = getNode(id as any);
            const sourceW = (n as any)?.width ?? (n as any)?.measured?.width;
            const sourceH = (n as any)?.height ?? (n as any)?.measured?.height;
            openNextStepModal?.({
              nodeId: id,
              handleId: `out-${category.name}`,
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
      ))}
    </BaseNode>
  );
};

export default CategorizeNode; // Export directly
