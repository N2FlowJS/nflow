import { WechatOutlined } from '@ant-design/icons';
import { Position, NodeProps, Node } from '@xyflow/react';
import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { BaseNode } from '../../../packages/@flow';
import { WeChatNodeData } from '../../../models/flowTypes';

const { Text } = Typography;

const WeChatNode = ({ data, id, selected }: NodeProps<Node<WeChatNodeData>>) => {
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
      icon={<WechatOutlined style={{ color: '#07C160' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.action && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Action:</Text>
            <Tag 
              color={
                form.action === 'send_message' ? 'green' :
                form.action === 'send_template' ? 'blue' :
                form.action === 'get_user_info' ? 'purple' :
                form.action === 'create_menu' ? 'orange' :
                form.action === 'get_qr_code' ? 'cyan' : 'gold'
              } 
              style={{ fontSize: '10px', margin: 0 }}
            >
              {form.action.replace('_', ' ').toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.appId && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>App ID:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.appId}
            </Text>
          </Flex>
        )}

        {form?.openId && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Open ID:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.openId}
            </Text>
          </Flex>
        )}

        {form?.message && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Message:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.message}
            </Text>
          </Flex>
        )}

        {form?.templateId && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Template:</Text>
            <Tag color="blue" style={{ fontSize: '10px', margin: 0 }}>
              {form.templateId}
            </Tag>
          </Flex>
        )}

        {form?.scene && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Scene:</Text>
            <Tag color="purple" style={{ fontSize: '10px', margin: 0 }}>
              {form.scene}
            </Tag>
          </Flex>
        )}

        {form?.miniProgramAppId && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Mini Program:</Text>
            <Tag color="cyan" style={{ fontSize: '10px', margin: 0 }}>
              Mini App
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default WeChatNode;
