import React, { memo } from 'react';
import { Typography, Flex } from 'antd';
import { NodeTypeString } from '../../../../models/flowTypes';
import RoleIndicator from '../shared/RoleIndicator';

interface NodeHeaderProps {
  id?: string;
  name: string;
  type: NodeTypeString;
  icon?: React.ReactNode;
  role?: 'developer' | 'assistant' | 'system' | 'user';
}

const NodeHeader: React.FC<NodeHeaderProps> = memo(({ id, name, icon, role }) => {
  return (
    <Flex align="center" gap={8} justify="space-between">
      <Flex align="center" gap={8}>
        {icon && <div>{icon}</div>}
        <Typography.Text strong ellipsis={{ tooltip: id }}>
          {name}
        </Typography.Text>
      </Flex>
      {role && <RoleIndicator role={role} />}
    </Flex>
  );
});

NodeHeader.displayName = 'NodeHeader';

export default NodeHeader;
