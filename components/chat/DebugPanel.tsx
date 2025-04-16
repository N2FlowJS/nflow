import { BugOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Button, Collapse, Drawer, Empty, Table, Tag, Typography, Tooltip, Space } from 'antd';
import React, { useCallback } from 'react';
import { FlowState } from '../../types/flowExecutionTypes';
import styles from './ChatInterface.module.css';
import { DebugStatus, LogEntry } from '../../hooks/useDebug';

interface DebugPanelProps {
    debugMode: boolean;
    debugDrawerOpen: boolean;
    setDebugDrawerOpen: (open: boolean) => void;
    debugStatus: DebugStatus;
    flowState: FlowState | null;
    executionLogs: LogEntry[];
    clearDebugLogs: () => void;
    fetchFlowStateDetails: (id: string) => Promise<void>;
    id?: string;
    setDebugMode: (mode: boolean) => void;
}

// Format flow state variables for display
export const formatFlowStateVariables = (flowState: FlowState | null) => {
    if (!flowState || !flowState.variables) return [];

    return Object.entries(flowState.variables).map(([key, value]) => ({
        key,
        value: typeof value === 'object'
            ? JSON.stringify(value).substring(0, 100)
            : String(value).substring(0, 100),
        type: typeof value
    }));
};

// Debug Info Bar Component as a separate exportable component
export const DebugInfoBar: React.FC<{
    debugStatus: DebugStatus;
}> = ({ debugStatus }) => (
    <div className={styles.debugInfoBar}>
        <Space wrap size={[8, 4]} style={{ padding: '4px 8px' }}>
            <Tag color={debugStatus.waitingForInput ? "green" : "default"}>
                {debugStatus.waitingForInput ? "Waiting for input" : "Processing"}
            </Tag>
            <Tag color={debugStatus.hasFlowState ? "blue" : "red"}>
                Node: {debugStatus.currentNodeId}
            </Tag>
            <Tag color="purple">
                Messages: {debugStatus.messagesCount}
            </Tag>
            <Tag color="orange">
                Variables: {debugStatus.variablesCount}
            </Tag>
            {debugStatus.isCompleted && (
                <Tag color="red">Completed</Tag>
            )}
            {debugStatus.id !== 'None' && (
                <Tooltip title={debugStatus.id}>
                    <Tag color="cyan">Conversation: {debugStatus.id.substring(0, 6)}...</Tag>
                </Tooltip>
            )}
        </Space>
    </div>
);

// Debug Control Buttons as a separate exportable component
export const DebugControls: React.FC<{
    debugMode: boolean;
    setDebugMode: (mode: boolean) => void;
    onOpenDebugPanel: () => void;
}> = ({ debugMode, setDebugMode, onOpenDebugPanel }) => (
    <>
        <Tooltip title="Toggle debug mode">
            <Button
                icon={<BugOutlined />}
                onClick={() => setDebugMode(!debugMode)}
                size="small"
                type={debugMode ? "primary" : "default"}
                style={{ marginRight: 8 }}
                shape="round"
            />
        </Tooltip>

        {debugMode && (
            <Tooltip title="Show debug information">
                <Button
                    icon={<InfoCircleOutlined />}
                    onClick={onOpenDebugPanel}
                    size="small"
                    type="default"
                    style={{ marginRight: 8 }}
                    shape="round"
                />
            </Tooltip>
        )}
    </>
);

// Main debug panel component
const DebugPanel: React.FC<DebugPanelProps> = ({
    debugMode,
    debugDrawerOpen,
    setDebugDrawerOpen,
    debugStatus,
    flowState,
    executionLogs,
    clearDebugLogs,
    fetchFlowStateDetails,
    id,
    setDebugMode
}) => {
    // Fetch flow state when opening debug panel
    const handleOpenDebugPanel = useCallback(() => {
        if (id) {
            fetchFlowStateDetails(id);
        }
        setDebugDrawerOpen(true);
    }, [id, fetchFlowStateDetails, setDebugDrawerOpen]);

    return (
        <>
            {/* Debug Controls for header */}
            <DebugControls 
                debugMode={debugMode} 
                setDebugMode={setDebugMode} 
                onOpenDebugPanel={handleOpenDebugPanel} 
            />

            {/* Debug Drawer */}
            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <BugOutlined style={{ marginRight: 8 }} />
                        Debug Information
                    </div>
                }
                placement="right"
                width={500}
                onClose={() => setDebugDrawerOpen(false)}
                open={debugDrawerOpen}
            >
                <Collapse defaultActiveKey={['1']} ghost>
                    {/* Current Status panel */}
                    <Collapse.Panel
                        header="Current Status"
                        key="1"
                        extra={<Tag color="blue">Live</Tag>}
                    >
                        <div className={styles.debugStatusGrid}>
                            <div>
                                <Typography.Text strong>Node ID:</Typography.Text>
                                <div>{debugStatus.currentNodeId}</div>
                            </div>
                            <div>
                                <Typography.Text strong>Waiting for Input:</Typography.Text>
                                <div>{debugStatus.waitingForInput ? "Yes" : "No"}</div>
                            </div>
                            <div>
                                <Typography.Text strong>Messages:</Typography.Text>
                                <div>{debugStatus.messagesCount}</div>
                            </div>
                            <div>
                                <Typography.Text strong>Variables:</Typography.Text>
                                <div>{debugStatus.variablesCount}</div>
                            </div>
                            <div>
                                <Typography.Text strong>Completed:</Typography.Text>
                                <div>{debugStatus.isCompleted ? "Yes" : "No"}</div>
                            </div>
                            <div>
                                <Typography.Text strong>Conversation ID:</Typography.Text>
                                <div style={{ wordBreak: 'break-all' }}>
                                    {debugStatus.id}
                                </div>
                            </div>
                        </div>
                    </Collapse.Panel>

                    {/* Flow State Variables panel */}
                    <Collapse.Panel header="Flow State Variables" key="2">
                        <Table
                            dataSource={formatFlowStateVariables(flowState)}
                            columns={[
                                {
                                    title: 'Variable',
                                    dataIndex: 'key',
                                    key: 'key',
                                    ellipsis: true
                                },
                                {
                                    title: 'Value',
                                    dataIndex: 'value',
                                    key: 'value',
                                    ellipsis: true,
                                    render: text => (
                                        <Typography.Text
                                            style={{
                                                maxWidth: 200,
                                                display: 'block',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                            ellipsis={{ tooltip: text }}
                                        >
                                            {text}
                                        </Typography.Text>
                                    )
                                },
                                {
                                    title: 'Type',
                                    dataIndex: 'type',
                                    key: 'type',
                                    render: type => <Tag>{type}</Tag>
                                }
                            ]}
                            pagination={{ pageSize: 5 }}
                            size="small"
                            scroll={{ y: 200 }}
                        />
                    </Collapse.Panel>

                    {/* Execution Logs panel */}
                    <Collapse.Panel header="Execution Logs" key="3">
                        <div className={styles.executionLogs}>
                            {executionLogs.map((log, index) => (
                                <div key={index} className={styles.logEntry}>
                                    <div className={styles.logTimestamp}>
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </div>
                                    <div className={styles.logSource}>
                                        <Tag color="blue">{log.source}</Tag>
                                    </div>
                                    <div className={styles.logAction}>
                                        <Tag color="green">{log.action}</Tag>
                                    </div>
                                    <div className={styles.logDetails}>
                                        {log.details}
                                    </div>
                                </div>
                            ))}
                            {executionLogs.length === 0 && (
                                <Empty description="No logs recorded yet" />
                            )}
                        </div>
                    </Collapse.Panel>

                    {/* Raw Flow State panel */}
                    <Collapse.Panel header="Raw Flow State" key="4">
                        <div className={styles.codeBlock}>
                            <pre>
                                {JSON.stringify(flowState, null, 2)}
                            </pre>
                        </div>
                    </Collapse.Panel>
                </Collapse>

                <div style={{ marginTop: 16 }}>
                    <Button
                        type="primary"
                        danger
                        onClick={clearDebugLogs}
                    >
                        Clear Logs
                    </Button>
                </div>
            </Drawer>
        </>
    );
};

export default DebugPanel;
