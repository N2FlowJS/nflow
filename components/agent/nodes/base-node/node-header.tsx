import React, { memo, isValidElement, cloneElement } from 'react';
import { Typography, Flex, theme } from 'antd';
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
  const { token } = theme.useToken();

  const unifiedIcon = isValidElement(icon)
    ? cloneElement(
        icon as React.ReactElement<any>,
        {
          // force unified color, preserve other styles
          style: { ...((icon as any).props?.style || {}), color: token.colorPrimary },
        } as any
      )
    : icon;

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
