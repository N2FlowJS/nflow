import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { WeatherNodeData } from '../../../models/flowTypes';
import BaseNode from './base-node';
import { Flex, Typography, Tag } from 'antd';
import { CloudOutlined } from '@ant-design/icons';

const { Text } = Typography;

const WeatherNode = ({ data, id, selected }: NodeProps<Node<WeatherNodeData>>) => {
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
      icon={<CloudOutlined style={{ color: '#52C41A' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.action && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Action:</Text>
            <Tag 
              color={
                form.action === 'current_weather' ? 'blue' :
                form.action === 'forecast' ? 'green' :
                form.action === 'weather_alerts' ? 'orange' : 'purple'
              } 
              size="small" 
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}
            >
              {form.action.replace('_', ' ').toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.location && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Location:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.location}
            </Text>
          </Flex>
        )}

        {form?.units && form.units !== 'metric' && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Units:</Text>
            <Tag 
              color={form.units === 'imperial' ? 'blue' : 'purple'} 
              size="small" 
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}
            >
              {form.units}
            </Tag>
          </Flex>
        )}

        {form?.action === 'forecast' && form?.days && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Days:</Text>
            <Tag color="cyan" size="small" style={{ fontSize: '10px', margin: 0 }}>
              {form.days}
            </Tag>
          </Flex>
        )}

        {form?.includeAlerts && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Alerts:</Text>
            <Tag color="orange" size="small" style={{ fontSize: '10px', margin: 0 }}>
              Enabled
            </Tag>
          </Flex>
        )}

        {form?.useSystemConfig === false && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>API:</Text>
            <Tag color="gold" size="small" style={{ fontSize: '10px', margin: 0 }}>
              Custom Key
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default WeatherNode;
