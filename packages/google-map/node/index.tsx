import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { GoogleMapNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import GoogleMapConnectionInfo from './GoogleMapConnectionInfo';
import GoogleMapActionInfo from './GoogleMapActionInfo';

const GoogleMapNode = ({ data, id, selected }: NodeProps<Node<GoogleMapNodeData>>) => {
  const { form } = data;

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Right],
        output: [Position.Right, Position.Left],
      }}
      icon={<EnvironmentOutlined style={{ color: '#4285F4' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <GoogleMapConnectionInfo 
          hasApiKey={!!form?.apiKey}
        />
        <GoogleMapActionInfo 
          action={form?.action || 'geocode'}
          travelMode={form?.travelMode}
          radius={form?.radius}
        />
      </Flex>
    </BaseNode>
  );
};

export default GoogleMapNode;
