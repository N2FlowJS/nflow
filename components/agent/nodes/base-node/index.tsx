import { Position, useReactFlow } from '@xyflow/react';
import { Card, Button, Space, Modal, theme } from 'antd';
import { DeleteOutlined, BugOutlined, SettingOutlined } from '@ant-design/icons';
import React, { memo, useRef } from 'react';
import { useNodeExecutionStatus } from '../../../../context/FlowStateContext';
import { useCardStyle } from '../../../../hooks/useCardStyle';
import { NodeData } from '../../../../models/flowTypes';
import { NODE_REGISTRY } from '../../../../utils/client/NODE_REGISTRY';
import NodeHeader from './node-header';
import { useFlowEditorContext } from '../../canvas/FlowEditorContext';
import {
  useHandleOptions,
  useChildrenSection,
  useInputHandles,
  useOutputHandles,
  useNodeActions,
} from './useBaseNodeHooks';

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
  const { openConfigDrawer, deleteNode, openNextStepModal } = useFlowEditorContext();
  const { getNode } = useReactFlow();
  const { token } = theme.useToken();

  const cardStyle = useCardStyle({ selected, isExecutedNode, nodeConfig });

  // measure fallback via DOM
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Optimized hooks
  const handleOpts = useHandleOptions(token as any);
  const childrenSection = useChildrenSection(children);
  const inputHandles = useInputHandles(handlePositions.input, handleOpts);
  const outputHandles = useOutputHandles({
    positions: handlePositions.output,
    opts: handleOpts,
    id,
    dataType: String(data.type),
    getNode: getNode as any,
    wrapperRef: wrapperRef as React.RefObject<HTMLDivElement | null>,
    openNextStepModal,
  });

  const { handleConfig, handleDebug, doDelete } = useNodeActions({ id, deleteNode, openConfigDrawer });

  const handleDelete = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete this node?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        doDelete();
      },
    });
  };

  return (
    <div style={{ position: 'relative' }}>
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
