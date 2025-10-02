import React, { memo } from 'react';
import { Typography, Flex } from 'antd';
import { useNodeHeader } from './useBaseNodeHooks';
import RoleIndicator from '../../share/RoleIndicator';
import { NodeTypeString } from 'models/flowTypes';

interface NodeHeaderProps {
  id?: string;
  name: string;
  type: NodeTypeString;
  icon?: React.ReactNode;
  role?: 'developer' | 'assistant' | 'system' | 'user';
}

const NodeHeader: React.FC<NodeHeaderProps> = memo(({ id, name, icon, role }) => {
  const { unifiedIcon } = useNodeHeader(icon);

  return (
    <Flex align="center" gap={8} justify="space-between">
      <Flex align="center" gap={8}>
        {unifiedIcon && <div>{unifiedIcon}</div>}
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
