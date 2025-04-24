import React, { useEffect, useState } from "react";
import { Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import { InterfaceNodeData } from "../../../../types/flowTypes";
import BaseNode from "../base-node";
import { Flex, Badge, Tag } from "antd";
import { SendOutlined, FlagOutlined, EyeOutlined } from "@ant-design/icons";

const InterfaceNode = ({
  data,
  id,
  selected,
}: NodeProps<Node<InterfaceNodeData>>) => {
  const { form } = data;
  const { getEdges } = useReactFlow();

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Right],
        output: [Position.Right, Position.Left],
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
