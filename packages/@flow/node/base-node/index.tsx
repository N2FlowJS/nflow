import { Position } from '@xyflow/react';
import { Card, Button, Space } from 'antd';
import { DeleteOutlined, BugOutlined, SettingOutlined } from '@ant-design/icons';
import React, { memo } from 'react';
import NodeHeader from './node-header';
import { useBaseNode } from './useBaseNodeHooks';
import { NodeData } from '../../type';

interface BaseNodeProps {
  data: NodeData;
  id: string;
  selected: boolean;
  handlePositions: {
    input: Position[];
    output: Position[];
  };
  children?: React.ReactNode;
  icon?: React.ReactNode;
  role?: 'developer' | 'assistant' | 'system' | 'user';
}

const BaseNode: React.FC<BaseNodeProps> = ({ data, id, selected, handlePositions, children, icon, role }) => {
  const { cardStyle, wrapperRef, childrenSection, inputHandles, outputHandles, actions, onMouseEnter } = useBaseNode({
    data,
    id,
    selected,
    handlePositions,
    children,
  });
  const { handleConfig, handleDebug, handleDelete } = actions;

  return (
    <div style={{ position: 'relative' }} onMouseEnter={onMouseEnter}>
      {selected && (
        <Space
          style={{
            position: 'absolute',
            top: -30,
            right: 0,
            zIndex: 10,
          }}>
          <Button size="small" icon={<SettingOutlined />} onClick={handleConfig} />
          <Button size="small" icon={<BugOutlined />} onClick={handleDebug} />
          <Button size="small" icon={<DeleteOutlined />} onClick={handleDelete} danger />
        </Space>
      )}
      <Card style={cardStyle} ref={wrapperRef}>
        <NodeHeader id={id} name={data.form?.name} type={data.type} icon={icon} role={role} />
        {childrenSection}
        {inputHandles}
        {outputHandles}
      </Card>
    </div>
  );
};

export default memo(BaseNode);
// BaseNode component
