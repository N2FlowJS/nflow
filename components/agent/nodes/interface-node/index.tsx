import React from "react";
import { Position, NodeProps, Node } from "@xyflow/react";
import { InterfaceNodeData } from "../../types/flowTypes";
import BaseNode from "../base-node";
import { Flex } from "antd";
import { CommentOutlined, SendOutlined } from "@ant-design/icons";
import TemplateSection from "./TemplateSection";
import PlaceholderSection from "./PlaceholderSection";

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
        input: Position.Left,
        output: Position.Right,
      }}
      icon={<SendOutlined style={{ color: '#1677ff' }} />}
    >
    </BaseNode>
  );
};

export default InterfaceNode;
