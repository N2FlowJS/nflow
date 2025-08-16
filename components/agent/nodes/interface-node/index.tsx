import { SendOutlined } from "@ant-design/icons";
import { InterfaceNodeData } from "../../../../models/flowTypes";
import { Node, NodeProps, Position } from "@xyflow/react";
import { Badge } from "antd";
import { BaseNode } from "@n2flowjs/flow";

const InterfaceNode = ({
  data,
  id,
  selected,
}: NodeProps<Node<InterfaceNodeData>>) => {
  const { form } = data;

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Top],
        output: [Position.Right, Position.Bottom],
      }}
      icon={
        <Badge color="green">
          <SendOutlined style={{ color: '#1677ff'  }}  />
        </Badge>
      }
      role={form?.role}
    >
    </BaseNode>
  );
};

export default InterfaceNode;
