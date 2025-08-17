import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { BaseNode } from '@n2flowjs/flow';
import { ToolOutlined } from '@ant-design/icons';
import ToolsList from '../../agent/node/ToolsList';
import { AgentToolsNodeData } from '../../../models/flowTypes';
import { Divider, Space, Typography } from 'antd';

const AgentToolsNode = ({ data, id, selected }: NodeProps<Node<AgentToolsNodeData>>) => {
	const { form } = data as any;
	const toolIds: string[] = Array.isArray(form?.toolIds) ? form.toolIds : [];

	return (
		<BaseNode
			data={data}
			id={id}
			selected={selected}
			handlePositions={{
				input: [Position.Left, Position.Right, Position.Top],
				output: [Position.Right, Position.Bottom],
			}}
			icon={<ToolOutlined style={{ color: '#1677ff' }} />}
			role={data.form?.role}
		>
			<Space direction="vertical" size={8} style={{ width: '100%' }}>
				<Space size={6} align="center">
					<ToolOutlined style={{ color: '#999' }} />
					<Typography.Text type="secondary">Tools</Typography.Text>
				</Space>
				<ToolsList toolIds={toolIds} />
				<Divider style={{ margin: '8px 0' }} />
			</Space>
		</BaseNode>
	);
};

export default AgentToolsNode;
