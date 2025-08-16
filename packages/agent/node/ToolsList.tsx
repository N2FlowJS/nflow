import React, { useMemo } from 'react';
import { Space, Tag, Tooltip, Typography, theme } from 'antd';
import { NODE_REGISTRY } from '../../../utils/client/NODE_REGISTRY';
import { QuestionOutlined, ToolOutlined } from '@ant-design/icons';
import { useNodeHeader } from '@n2flowjs/flow/node/base-node/useBaseNodeHooks';

interface ToolsListProps {
  toolIds?: string[];
  maxVisible?: number;
}

const ToolTag: React.FC<{ name: string; icon?: React.ReactNode }> = ({ name, icon }) => {
  const { token } = theme.useToken();
  const { unifiedIcon } = useNodeHeader(icon ?? <ToolOutlined />);
  return (
    <Tooltip title={name}>
  <Tag style={{ marginInlineEnd: 6 }} icon={unifiedIcon} color={token.colorPrimary}>
        {name}
      </Tag>
    </Tooltip>
  );
};

const ToolsList: React.FC<ToolsListProps> = ({ toolIds, maxVisible = 6 }) => {
  const items = useMemo(() => {
    const ids = Array.isArray(toolIds) ? toolIds : [];
    return ids.map((id) => {
      const cfg = (NODE_REGISTRY as any)[id];
      const name = cfg?.data?.form?.name || cfg?.name || id;
      const icon = cfg?.icon ?? <QuestionOutlined />;
      return { id, name, icon } as { id: string; name: string; icon?: React.ReactNode };
    });
  }, [toolIds]);

  if (!items.length) {
    return (
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        No tools selected.
      </Typography.Text>
    );
  }

  const visible = items.slice(0, maxVisible);
  const remaining = items.length - visible.length;

  return (
    <Space size={[6, 6]} wrap>
      {visible.map((t) => (
        <ToolTag key={t.id} name={t.name} icon={t.icon} />
      ))}
      {remaining > 0 && (
        <Tag>
          +{remaining} more
        </Tag>
      )}
    </Space>
  );
};

export default ToolsList;
