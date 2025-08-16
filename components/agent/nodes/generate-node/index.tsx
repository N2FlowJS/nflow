import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { GenerateNodeData } from '../../../../models/flowTypes';
import { BaseNode } from '../../../../packages/@flow';
import { Flex, Tooltip, Spin } from 'antd';
import { RobotOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ModelInfo from './ModelInfo';
import PromptInfo from './PromptInfo';
import { useModelDetails } from '../../../../hooks/useModelDetails';
import HistoryChatSize from '../components/history-chat-size';

const GenerateNode = ({ data, id, selected }: NodeProps<Node<GenerateNodeData>>) => {
  const { form } = data;
  const { loading, error, getModelDisplayName, getProviderName, modelDetails } = useModelDetails(form?.model);

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Right, Position.Top],
        output: [Position.Right, Position.Bottom],
      }}
      icon={<RobotOutlined style={{ color: '#52c41a' }} />}
      role={form?.role}>
      <Flex vertical gap={8}>
        <Flex align="center" justify="space-between">
          {loading ? (
            <Spin size="small" />
          ) : (
            <ModelInfo
              model={getModelDisplayName()}
              provider={getProviderName()}
              contextWindow={modelDetails?.contextWindow}
            />
          )}

          {error && (
            <Tooltip title={error}>
              <InfoCircleOutlined style={{ color: '#ff4d4f' }} />
            </Tooltip>
          )}
        </Flex>

        <PromptInfo prompt={form?.prompt || ''} />
        <HistoryChatSize numberHistory={form?.numberHistory || 0} />
      </Flex>
    </BaseNode>
  );
};

export default GenerateNode;
