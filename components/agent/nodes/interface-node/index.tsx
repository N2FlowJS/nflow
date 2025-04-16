import React, { useEffect, useState } from "react";
import { Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import { InterfaceNodeData } from "../../types/flowTypes";
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
  const [isFinalNode, setIsFinalNode] = useState(false);



  // Check if this node has any outgoing connections
  useEffect(() => {
    const edges = getEdges();
    const hasOutgoingEdges = edges.some(edge => edge.source === id);
    setIsFinalNode(!hasOutgoingEdges);
  }, [getEdges, id]);

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: Position.Left,
        output: Position.Right,
      }}
      icon={
        <Badge dot={isFinalNode} color="green">
          <SendOutlined style={{ color: '#1677ff' }} />
        </Badge>
      }
    >
      <Flex vertical gap={8}>
        {/* Final node indicator */}
        {(isFinalNode) && (
          <Tag color="success" icon={<FlagOutlined />} style={{ alignSelf: 'flex-start' }}>
            Final Output
          </Tag>
        )}




        <Flex
          style={{
            padding: '10px',
            backgroundColor: 'rgba(230, 244, 255, 0.6)',
            borderRadius: '4px',
            borderLeft: '3px solid #1677ff'
          }}
          align="center"
        >
          <EyeOutlined style={{ marginRight: 8, color: '#1677ff' }} />
          <span>Displays output from previous node</span>
        </Flex>
      </Flex>
    </BaseNode>
  );
};

export default InterfaceNode;
