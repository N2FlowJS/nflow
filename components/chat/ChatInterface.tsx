import { ReloadOutlined, RobotOutlined, SendOutlined, StopOutlined, SmileOutlined, BugOutlined } from '@ant-design/icons';
import { Alert, Button, Divider, Empty, Input, Spin, Typography, Avatar, Tooltip, Badge, Tag } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './ChatInterface.module.css';
import ChatMessage from './ChatMessage';
import { motion, AnimatePresence } from 'framer-motion';
import DebugPanel, { DebugInfoBar } from './DebugPanel';
import { useDebug } from '../../hooks/useDebug';
import { useChatExecution } from '../../hooks/useChatExecution';

interface ChatInterfaceProps {
    agentId: string;
    flowConfig: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    enableStreaming?: boolean;
    id?: string;
    onConversationCreated?: (id: string) => void;
    onConversationUpdated?: (id: string) => void;
    variables?: Record<string, any>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
    agentId,
    flowConfig,
    model,
    temperature,
    maxTokens,
    enableStreaming = false,
    id: initialId,
    onConversationCreated,
    onConversationUpdated,
    variables = {}
}) => {
    // User input state
    const [inputValue, setInputValue] = useState('');

    // Use the debug hook
    const {
        debugMode,
        setDebugMode,
        debugDrawerOpen,
        setDebugDrawerOpen,
        executionLogs,
        clearDebugLogs,
        createDebugStatus,
        logDebugInfo
    } = useDebug();

    // Use the chat execution hook with logDebugInfo from debug hook
    const {
        messages,
        loading,
        error,
        setError,
        flowState,
        id,
        streamingMessage,
        isStreamingPaused,
        startNewChat,
        sendMessage,
        toggleStreamingPause,
        stopStreaming,
        loadConversation,
        fetchFlowStateDetails,
        isSendDisabled,
    } = useChatExecution({
        agentId,
        enableStreaming,
        model,
        temperature,
        maxTokens,

        onConversationCreated,
        onConversationUpdated,
        variables,
        logDebugInfo
    });

    // Reference for auto-scrolling to latest message
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the latest message
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, streamingMessage?.text]);

    // Start chat when component mounts or agent changes
    // Wrap in useEffect to prevent initial render loop
    useEffect(() => {
        let isInitialRender = true;

        if (agentId && flowConfig && isInitialRender) {
            startNewChat();
        }

        return () => {
            isInitialRender = false;
        };
    }, [agentId, flowConfig, startNewChat]);

    // Load conversation on initial ID change
    useEffect(() => {
        if (initialId) {
            loadConversation(initialId);
        }
    }, [initialId, loadConversation]);

    // Handle sending a message
    const handleSendMessage = useCallback(() => {
        sendMessage(inputValue).then(success => {
            if (success) {
                setInputValue('');
            }
        });
    }, [inputValue, sendMessage]);

    // Handle Enter key press in textarea
    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    // Calculate debug status - using memo to avoid recalculation on every render
    const debugStatus = useMemo(() =>
        createDebugStatus(flowState, messages.length, id),
        [createDebugStatus, flowState, messages.length, id]
    );

    // Render the chat interface
    return (
        <div className={styles.chatContainer}>
            {/* Chat header */}
            <div className={styles.chatHeader}>
                <Typography.Title level={5} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        icon={<RobotOutlined />}
                        style={{
                            backgroundColor: '#1890ff',
                            marginRight: 8
                        }}
                    />
                    Chat with Agent

                    {debugMode && (
                        <Badge
                            count={<BugOutlined style={{ color: '#ff4d4f' }} />}
                            offset={[-5, 5]}
                        >
                            <Tag color="orange" style={{ marginLeft: 8 }}>DEBUG</Tag>
                        </Badge>
                    )}
                </Typography.Title>

                <div className={styles.headerActions}>
                    {flowState && (
                        <div className={styles.nodeStatus}>
                            <Tooltip title="Current node in the flow">
                                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                    Node: {flowState.currentNodeName || flowState.currentNodeId || 'None'}
                                </Typography.Text>
                            </Tooltip>
                        </div>
                    )}

                    {/* Debug Controls from DebugPanel */}
                    <DebugPanel
                        debugMode={debugMode}
                        setDebugMode={setDebugMode}
                        debugDrawerOpen={debugDrawerOpen}
                        setDebugDrawerOpen={setDebugDrawerOpen}
                        debugStatus={debugStatus}
                        flowState={flowState}
                        executionLogs={executionLogs}
                        clearDebugLogs={clearDebugLogs}
                        fetchFlowStateDetails={fetchFlowStateDetails}
                        id={id}
                    />

                    {/* Streaming controls */}
                    {streamingMessage && (
                        <Button
                            icon={isStreamingPaused ? <SendOutlined /> : <StopOutlined />}
                            onClick={toggleStreamingPause}
                            size="small"
                            style={{ marginRight: 8 }}
                            type={isStreamingPaused ? "default" : "primary"}
                            shape="round"
                        >
                            {isStreamingPaused ? 'Resume' : 'Pause'}
                        </Button>
                    )}

                    {/* New chat button */}
                    <Tooltip title="Start a new conversation">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={startNewChat}
                            size="small"
                            type="default"
                            shape="round"
                        >
                            New Chat
                        </Button>
                    </Tooltip>
                </div>
            </div>

            <Divider style={{ margin: '0 0 8px 0' }} />

            {/* Debug info bar - using component from DebugPanel */}
            {debugMode && <DebugInfoBar debugStatus={debugStatus} />}

            {/* Messages container */}
            <div className={styles.messagesContainer}>
                {messages.length === 0 && !streamingMessage ? (
                    <div className={styles.emptyStateContainer}>
                        <Empty
                            image={<RobotOutlined style={{ fontSize: 64, color: '#1890ff' }} />}
                            style={{ height: 80 }}
                            description={
                                <Typography.Text style={{ fontSize: 16 }}>
                                    Start a conversation with this agent
                                </Typography.Text>
                            }
                        />
                    </div>
                ) : (
                    <AnimatePresence>
                        {/* Regular messages */}
                        {messages.map(message => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChatMessage message={message} />
                            </motion.div>
                        ))}

                        {/* Streaming message */}
                        {streamingMessage && (
                            <motion.div
                                key={streamingMessage.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChatMessage message={streamingMessage} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {/* Loading indicator */}
                {loading && !streamingMessage && (
                    <motion.div
                        className={styles.loadingMessage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Spin size="small" />
                        <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                            Agent is thinking<span className={styles.loadingDots}>...</span>
                        </Typography.Text>
                    </motion.div>
                )}

                {/* Error message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Alert
                            message="Execution Error"
                            description={error}
                            type="error"
                            showIcon
                            closable
                            action={
                                <Button size="small" type="primary" onClick={startNewChat}>
                                    Restart Chat
                                </Button>
                            }
                            onClose={() => setError(null)}
                            style={{ margin: '10px', borderRadius: '8px' }}
                        />
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input container */}
            <div className={styles.inputContainer}>
                <Input.TextArea
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder={"Type a message..."}
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    disabled={loading || (flowState?.completed)}
                    className={styles.chatInput}
                    style={{
                        borderRadius: '18px',
                        padding: '8px 12px',
                        resize: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                />

                <Tooltip title="Add emoji">
                    <Button
                        type="text"
                        icon={<SmileOutlined />}
                        className={styles.emojiButton}
                        style={{ marginRight: '4px' }}
                    />
                </Tooltip>

                {streamingMessage ? (
                    <Button
                        type="primary"
                        danger
                        icon={<StopOutlined />}
                        onClick={stopStreaming}
                        shape="circle"
                        size="large"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                    />
                ) : (
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSendMessage}
                        disabled={isSendDisabled(inputValue)}
                        shape="circle"
                        size="large"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                    />
                )}
            </div>
        </div>
    );
};

export default React.memo(ChatInterface);
