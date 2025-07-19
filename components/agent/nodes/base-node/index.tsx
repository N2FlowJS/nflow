import { Handle, Position } from '@xyflow/react';
import { Card, Button, Space, Modal } from 'antd';
import { DeleteOutlined, BugOutlined, SettingOutlined } from '@ant-design/icons';
import React, { memo, useMemo } from 'react';
import { useNodeExecutionStatus } from '../../../../context/FlowStateContext';
import { useCardStyle } from '../../../../hooks/useCardStyle';
import { NodeData } from '../../../../models/flowTypes';
import { NODE_REGISTRY } from '../../../../utils/client/NODE_REGISTRY';
import { getHandleStyle } from './handle-icon';
import NodeHeader from './node-header';
import { useFlowEditorContext } from '../../canvas/canvas';

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
  const nodeConfig = NODE_REGISTRY[data.type];
  const isExecutedNode = useNodeExecutionStatus(id);
  const { openConfigDrawer, deleteNode } = useFlowEditorContext();

  const cardStyle = useCardStyle({ selected, isExecutedNode, nodeConfig });

  const handleDelete = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete this node?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteNode(id);
      },
    });
  };

  const handleDebug = () => {
    console.log(`Debugging node ${id}`);
  };

  const handleConfig = () => {
    openConfigDrawer();
  };

  const childrenSection = useMemo(
    () => (children ? <div style={{ padding: '10px 0' }}>{children}</div> : null),
    [children]
  );

  const inputHandles = useMemo(
    () =>
      handlePositions.input.flatMap((position: Position) => (
        <Handle
          key={`in-${position}`}
          type="target"
          position={position}
          style={getHandleStyle && getHandleStyle(position, 'target')}
          id={`in-${position}`}
        />
      )),
    [handlePositions.input]
  );

  const outputHandles = useMemo(
    () =>
      handlePositions.output.flatMap((position) => (
        <Handle
          key={`out-${position}`}
          type="source"
          position={position}
          style={getHandleStyle && getHandleStyle(position, 'source')}
          id={`out-${position}`}
        />
      )),
    [handlePositions.output]
  );

  return (
    <div style={{ position: 'relative' }}>
      {selected && (
        <Space
          style={{
            position: 'absolute',
            top: -30,
            right: 0,
            zIndex: 10,
          }}
        >
          <Button size="small" icon={<SettingOutlined />} onClick={handleConfig} />
          <Button size="small" icon={<BugOutlined />} onClick={handleDebug} />
          <Button size="small" icon={<DeleteOutlined />} onClick={handleDelete} danger />
        </Space>
      )}
      <Card style={cardStyle}>
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