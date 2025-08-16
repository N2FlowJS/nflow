import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { SendMailNodeData } from '../../../../models/flowTypes';
import { BaseNode } from '../../../../packages/@flow';
import { Flex } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import MailInfo from './MailInfo';
import SmtpInfo from './SmtpInfo';

const SendMailNode = ({ data, id, selected }: NodeProps<Node<SendMailNodeData>>) => {
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
      icon={<MailOutlined style={{ color: '#1890ff' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <MailInfo 
          to={form?.to || ''} 
          subject={form?.subject || ''} 
          isHtml={form?.isHtml ?? false}
        />
        <SmtpInfo 
          useSystemConfig={form?.useSystemConfig ?? true}
          smtpHost={form?.smtpHost || ''}
        />
      </Flex>
    </BaseNode>
  );
};

export default SendMailNode;
