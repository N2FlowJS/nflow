import { ReloadOutlined, RobotOutlined, SendOutlined, StopOutlined, SmileOutlined, BugOutlined } from '@ant-design/icons';
import { Alert, Button, Divider, Empty, Input, Spin, Typography, Avatar, Tooltip, Badge, Tag } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './ChatInterface.module.css';
import ChatMessage from './ChatMessage';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { ISender, MessageType } from './types';
import { flowExecutionService } from '../../services/flowExecutionService';
import { OpenAIExecutionResult } from '../../types/flow';

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
    model,
    temperature,
    maxTokens,
    enableStreaming = false,
    id: initialId,
    onConversationCreated,
    onConversationUpdated,
    variables = {}
}) => {
    // State for chat messages and input
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | undefined>(initialId);
    const [flowState, setFlowState] = useState<any>(null);

    // Streaming state
    const [streamingMessage, setStreamingMessage] = useState<MessageType | null>(null);
    const [isStreamingPaused, setIsStreamingPaused] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Reference for auto-scrolling to bottom
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Function to determine if send button should be disabled
    const isSendDisabled = useCallback((text: string) => {
        return loading || !text.trim() || (flowState?.completed === true);
    }, [loading, flowState]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, streamingMessage]);

    // Handle sending message
    const handleSendMessage = useCallback(async () => {
        if (isSendDisabled(inputValue)) return;

        const userMessage: MessageType = {
            id: uuidv4(),
            sender: 'user',
            text: inputValue.trim(),
            timestamp: Date.now(),
        };

        // Update UI immediately with user message
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setLoading(true);
        setError(null);

        try {
            // Format messages for API
            const apiMessages = [
                ...messages.map(msg => ({
                    role: msg.sender,
                    content: msg.text
                })),
                {
                    role: 'user',
                    content: userMessage.text
                }
            ];

            // Create service options
            const serviceOptions = {
                messages: apiMessages,
                variables,
                model: model || 'default',
                temperature: temperature || 0.7,
                maxTokens: maxTokens || 1024,
                id: conversationId,
                stream: enableStreaming
            };

            if (enableStreaming) {
                // Handle streaming response
                await handleStreamingResponse(serviceOptions);
            } else {
                // Handle regular response
                await handleNormalResponse(serviceOptions);
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setError(err instanceof Error ? err.message : 'Failed to send message');
            setLoading(false);
        }
    }, [inputValue, messages, conversationId, agentId, model, variables, temperature, maxTokens, enableStreaming]);

    // Handle streaming response
    const handleStreamingResponse = useCallback(async (options: any) => {
        // Create a new streaming message
        const newStreamingMsg: MessageType = {
            id: uuidv4(),
            sender: 'assistant',
            text: '',
            timestamp: Date.now(),
            isTyping: true,
        };

        setStreamingMessage(newStreamingMsg);

        // Create abort controller for cancelling the stream
        abortControllerRef.current = new AbortController();

        try {
            // Call the service with streaming enabled
            const result = await flowExecutionService(agentId, options);

            // If the result is not a stream (error case), handle it and return
            if (!(result instanceof ReadableStream)) {

                // If we somehow got a non-stream success result, handle it as a normal response
                const finalMessage: MessageType = {
                    ...newStreamingMsg,
                    text: result.choices?.[0]?.delta?.content || '',
                    isTyping: false,
                    executionStatus: result.flowState ? {
                        status: result.choices?.[0]?.finish_reason === 'error' ? 'error' :
                            result.choices?.[0]?.finish_reason ? 'completed' : 'in_progress',
                        nodeId: result.flowState.currentNodeId,
                        nodeName: result.flowState.currentNodeName
                    } : undefined
                };

                setMessages(prev => [...prev, finalMessage]);
                setStreamingMessage(null);

                // Update conversation ID and flow state
                if (result.id && result.id !== conversationId) {
                    setConversationId(result.id);
                    if (onConversationCreated && !conversationId) {
                        onConversationCreated(result.id);
                    } else if (onConversationUpdated) {
                        onConversationUpdated(result.id);
                    }
                }

                if (result.flowState) {
                    setFlowState(result.flowState);
                }

                return;
            }

            // Process the stream
            const reader = result.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let streamedText = '';

            while (!done && !isStreamingPaused) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;

                if (done) break;

                // Process the received chunk
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n\n')
                    .filter(line => line.trim() !== '' && line.startsWith('data: '));

                for (const line of lines) {
                    if (line.includes('data: [DONE]')) {
                        done = true;
                        break;
                    }

                    try {
                        const jsonData: OpenAIExecutionResult = JSON.parse(line.replace('data: ', ''));


                        // Update conversation ID if needed
                        if (jsonData.id && jsonData.id !== conversationId) {
                            setConversationId(jsonData.id);
                            if (onConversationCreated && !conversationId) {
                                onConversationCreated(jsonData.id);
                            } else if (onConversationUpdated) {
                                onConversationUpdated(jsonData.id);
                            }
                        }
                         
                        // Update flow state
                        if (jsonData.flowState) {
                            setFlowState(jsonData.flowState);
                        }

                        // Extract and update message content from stream chunk
                        let messageContent = '';

                        // Handle different possible response formats
                        if (jsonData.choices?.[0]?.delta?.content) {
                            messageContent = jsonData.choices[0].delta.content;
                        }

                        if (messageContent) {
                            // Replace the entire content (not append) since the server sends the full message each time
                            streamedText = messageContent;

                            setStreamingMessage(prev => prev ? {
                                ...prev,
                                text: streamedText,
                                nodeType: (jsonData.choices?.[0]?.delta?.role === 'developer')
                                    ? 'interface' : undefined,
                                executionStatus: {
                                    status: jsonData.choices?.[0]?.finish_reason === 'error' ? 'error' :
                                        jsonData.choices?.[0]?.finish_reason ? 'completed' : 'in_progress',
                                    nodeId: jsonData.flowState?.currentNodeId,
                                    nodeName: jsonData.flowState?.currentNodeName
                                }
                            } : null);
                        }
                    } catch (e) {
                        console.error('Error parsing streaming data:', e);
                    }
                }
            }

            // Finalize the streaming message when done
            if (streamingMessage) {
                const finalMessage = {
                    ...newStreamingMsg,
                    text: streamedText,
                    isTyping: false,
                };

                setMessages(prev => [...prev, finalMessage]);
                setStreamingMessage(null);
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('Streaming error:', err);
                setError(err instanceof Error ? err.message : 'Streaming failed');

                // Add error message to the chat
                if (streamingMessage) {
                    setMessages(prev => [...prev, {
                        ...streamingMessage,
                        text: streamingMessage.text || 'Error occurred during streaming',
                        isTyping: false,
                        hasError: true
                    }]);
                    setStreamingMessage(null);
                }
            }
        } finally {
            abortControllerRef.current = null;
            setLoading(false);
        }
    }, [agentId, conversationId, onConversationCreated, onConversationUpdated, isStreamingPaused]);

    // Handle normal (non-streaming) response
    const handleNormalResponse = useCallback(async (options: any) => {
        try {
            // Call service with streaming disabled
            const result = await flowExecutionService(agentId, {
                ...options,
                stream: false,
            }) as OpenAIExecutionResult;


            // Update conversation ID if needed
            if (result.id && result.id !== conversationId) {
                setConversationId(result.id);
                if (onConversationCreated && !conversationId) {
                    onConversationCreated(result.id);
                } else if (onConversationUpdated) {
                    onConversationUpdated(result.id);
                }
            }

            // Update flow state
            if (result.flowState) {
                setFlowState(result.flowState);
            }

            // Extract message content
            let messageText = '';
            let messageRole: ISender = 'assistant';

            if (result.choices && result.choices.length > 0) {
                const choice = result.choices[0];
                messageText = choice.delta?.content || choice.delta?.content || '';
                messageRole = choice.delta?.role || 'assistant';
            }

            console.log('Normal response:', result, messageText, messageRole);
            

            // Add response message
            const newMessage: MessageType = {
                id: uuidv4(),
                sender: messageRole,
                text: messageText,
                timestamp: Date.now(),
                nodeType: messageRole === 'developer' ? 'interface' : undefined,
                executionStatus: result.flowState ? {
                    status: result.choices?.[0]?.finish_reason === 'error' ? 'error' :
                        result.choices?.[0]?.finish_reason ? 'completed' : 'in_progress',
                    nodeId: result.flowState.currentNodeId,
                    nodeName: result.flowState.currentNodeName
                } : undefined
            };

            setMessages(prev => [...prev, newMessage]);
        } catch (err) {
            console.error('Error in handleNormalResponse:', err);
            setError(err instanceof Error ? err.message : 'Failed to get response');
        } finally {
            setLoading(false);
        }
    }, [agentId, conversationId, onConversationCreated, onConversationUpdated]);

    // Toggle streaming pause/resume
    const toggleStreamingPause = useCallback(() => {
        setIsStreamingPaused(prev => !prev);
    }, []);

    // Stop streaming
    const stopStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        // Finalize the current streaming message
        if (streamingMessage) {
            setMessages(prev => [...prev, {
                ...streamingMessage,
                isTyping: false
            }]);
            setStreamingMessage(null);
        }

        setLoading(false);
    }, [streamingMessage]);

    // Start a new chat
    const startNewChat = useCallback(() => {
        // Stop any ongoing streaming
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        // Reset state
        setMessages([]);
        setInputValue('');
        setStreamingMessage(null);
        setLoading(false);
        setError(null);
        setConversationId(undefined);
        setFlowState(null);
    }, []);

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
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
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
