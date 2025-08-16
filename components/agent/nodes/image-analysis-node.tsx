import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { ImageAnalysisNodeData } from '../../../models/flowTypes';
import { BaseNode } from '../../../packages/@flow';
import { Flex, Typography, Tag } from 'antd';
import { PictureOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ImageAnalysisNode = ({ data, id, selected }: NodeProps<Node<ImageAnalysisNodeData>>) => {
  const { form } = data;

  const getAnalysisColor = (type: string) => {
    const colors: { [key: string]: string } = {
      metadata: 'blue',
      dimensions: 'green',
      colors: 'orange',
      text_recognition: 'purple',
      object_detection: 'red',
    };
    return colors[type] || 'default';
  };

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Right],
        output: [Position.Right, Position.Left],
      }}
      icon={<PictureOutlined style={{ color: '#eb2f96' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.analysisType && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Type:</Text>
            <Tag 
              color={getAnalysisColor(form.analysisType)} 
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}
            >
              {form.analysisType.replace('_', ' ').toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.ocrLanguage && form.analysisType === 'text_recognition' && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>OCR Lang:</Text>
            <Tag color="purple" style={{ fontSize: '10px', margin: 0 }}>
              {form.ocrLanguage.toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.colorPalette && form.analysisType === 'colors' && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Colors:</Text>
            <Tag color="orange"  style={{ fontSize: '10px', margin: 0 }}>
              {form.colorPalette}
            </Tag>
          </Flex>
        )}

        {form?.outputDetails && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Details:</Text>
            <Tag color="cyan" style={{ fontSize: '10px', margin: 0 }}>
              ✓ Enabled
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default ImageAnalysisNode;
