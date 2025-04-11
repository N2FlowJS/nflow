import React from "react";
import { Position, NodeProps, Node } from "@xyflow/react";
import { GenerateNodeData } from "../../types/flowTypes";
import BaseNode from '../base-node';
import { Flex } from 'antd';
import { RobotOutlined } from "@ant-design/icons";
import ModelInfo from "./ModelInfo";
import PromptInfo from "./PromptInfo";

const GenerateNode = ({ data, id, selected }: NodeProps<Node<GenerateNodeData>>) => {
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
      icon={<RobotOutlined style={{ color: '#52c41a' }} />}
    >
      <Flex vertical gap={8}>
        <ModelInfo model={form?.model || "Not specified"} />
        <PromptInfo prompt={form?.prompt || ""} />
      </Flex>
    </BaseNode>
  );
};

export default GenerateNode;
