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
import { FlowState } from '../../types/flowExecutionTypes';

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
    onNewChatStarted?: () => void; // Add new prop
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
    onNewChatStarted,
    variables = {}
}) => {
    // State for chat messages and input
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | undefined>(initialId);
    const [flowState, setFlowState] = useState<FlowState | null>(null); // Use FlowState type

    // Streaming state
    const [streamingMessage, setStreamingMessage] = useState<MessageType | null>(null);
    const [isStreamingPaused, setIsStreamingPaused] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Reference for auto-scrolling to bottom
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // memoize disable check
    const isSendDisabled = useMemo(
        () => loading || !inputValue.trim(),
        [loading, inputValue]
    );

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView();
        }
    }, [messages, streamingMessage]);

    // Handle sending message
    const handleSendMessage = useCallback(async () => {
        if (isSendDisabled) return;

        const userMessage: MessageType = {
            id: uuidv4(),
            sender: 'user',
            text: inputValue.trim(),
            timestamp: Date.now(),
            executionStatus: {
                status: 'in_progress',
                nodeId: '',
                nodeName: '',
                nodeType: 'interface',
            },
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
                await handleStreamingResponse(serviceOptions);
            } else {
                await handleNormalResponse(serviceOptions);
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setError(err instanceof Error ? err.message : 'Failed to send message');
        }
        finally {
            setLoading(false);
        }
    }, [isSendDisabled, inputValue, messages, conversationId, agentId, model, variables, temperature, maxTokens, enableStreaming, flowState]); // Added flowState dependency
    // Helper function to update conversation ID and flow state
    const updateConversationAndFlowState = useCallback((result: any) => {
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
    }, [conversationId, onConversationCreated, onConversationUpdated]);

    // Handle streaming response
    const handleStreamingResponse = useCallback(async (options: any) => {
        // Create a new streaming message
        const newStreamingMsg: MessageType = {
            id: uuidv4(),
            sender: 'assistant',
            text: '',
            timestamp: Date.now(),
            executionStatus: {
                status: 'in_progress',
                nodeId: '',
                nodeName: '',
                nodeType: 'interface',
            },
        };

        setStreamingMessage(newStreamingMsg);

        // Create abort controller for cancelling the stream
        abortControllerRef.current = new AbortController();

        try {
            const result = await flowExecutionService(agentId, options);

            // Handle non-stream response (error case)
            if (!(result instanceof ReadableStream)) {
                handleNonStreamResponse(result, newStreamingMsg);
                return;
            }

            // Process the stream
            await processStreamResponse(result, newStreamingMsg);
        } catch (err: any) {
            handleStreamingError(err, newStreamingMsg);
        } finally {
            abortControllerRef.current = null;
            setLoading(false);
        }
    }, [agentId, conversationId, onConversationCreated, onConversationUpdated, isStreamingPaused]);

    // Helper function to handle non-stream response
    const handleNonStreamResponse = useCallback((result: any, streamingMsg: MessageType) => {
        const finalMessage: MessageType = {
            ...streamingMsg,
            text: result.choices?.[0]?.delta?.content || '',
            executionStatus: {
                status: result.choices?.[0]?.finish_reason === 'error' ? 'error' :
                    result.choices?.[0]?.finish_reason ? 'completed' : 'in_progress',
                nodeId: result.flowState.currentNodeId,
                nodeName: result.flowState.currentNodeName,
                nodeType: result.nodeInfo.type,
            }
        };

        setMessages(prev => [...prev, finalMessage]);
        setStreamingMessage(null);

        // Update conversation ID and flow state
        updateConversationAndFlowState(result);
    }, [conversationId, onConversationCreated, onConversationUpdated]);

    // Helper function to process streaming response
    const processStreamResponse = useCallback(async (stream: ReadableStream, streamingMsg: MessageType) => {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let accumulatedText = streamingMsg.text; // Initialize with potentially existing text
        let finalExecutionStatus = streamingMsg.executionStatus; // Track the latest status

        try {
            while (!done && !isStreamingPaused) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;

                if (done) break;

                // Process the received chunk
                const chunk = decoder.decode(value, { stream: true });
                const result = processStreamChunk(chunk, accumulatedText); // Pass current text

                // Update accumulated text and check completion status
                accumulatedText = result.updatedText;
                finalExecutionStatus = result.executionStatus || finalExecutionStatus; // Update if status provided

                // Update the streaming message state in real-time
                setStreamingMessage(prev => prev ? {
                    ...prev,
                    text: accumulatedText,
                    executionStatus: finalExecutionStatus,
                    sender: result.sender // Update sender if changed
                } : null);

                if (result.isDone) {
                    done = true;
                    break;
                }
            }
        } catch (error) {
            console.error('Error reading stream:', error);
            // Optionally update message state to reflect error
            setStreamingMessage(prev => prev ? { ...prev, hasError: true, text: accumulatedText + "\n(Error reading stream)" } : null);
        } finally {
            // Make sure to release the reader
            try { reader.releaseLock(); } catch (e) { console.warn("Error releasing reader lock:", e); }

            // Finalize the streaming message when done or stopped
            // Use the latest accumulated text and status
            const finalMessage: MessageType = {
                ...streamingMsg,
                text: accumulatedText,
                executionStatus: {
                    ...finalExecutionStatus,
                    // Ensure status is marked completed if loop finished normally
                    status: finalExecutionStatus.status !== 'error' ? 'completed' : 'error',
                }
            };

            setMessages(prev => [...prev, finalMessage]);
            setStreamingMessage(null); // Clear the temporary streaming message
        }
    }, [isStreamingPaused, updateConversationAndFlowState]); // Removed streamingMessage dependency here

    // Helper function to process each chunk of the stream
    // Now returns the updated text and completion status
    const processStreamChunk = useCallback((chunk: string, currentText: string): {  sender: ISender, updatedText: string, isDone: boolean, executionStatus?: MessageType['executionStatus'] } => {
        const lines = chunk.split('\n\n')
            .filter(line => line.trim() !== '' && line.startsWith('data: '));

        let isDone = false;
        let updatedText = currentText;
        let executionStatus: MessageType['executionStatus'] | undefined = undefined;
        let sender:ISender= 'developer'; // Default sender
        for (const line of lines) {
            if (line.includes('data: [DONE]')) {
                isDone = true;
                continue; // Don't parse [DONE] as JSON
            }

            try {
                const jsonData: OpenAIExecutionResult = JSON.parse(line.replace('data: ', ''));

                // Update conversation ID and flow state (side effect)
                updateConversationAndFlowState(jsonData);

                // Extract message content
                const messageContent = jsonData.choices?.[0]?.delta?.content || '';

                if (messageContent) {
                    updatedText = messageContent; // Append new content
                }

                // Update execution status if available in the chunk
                if (jsonData.flowState && jsonData.nodeInfo) {
                    executionStatus = {
                        status: jsonData.choices?.[0]?.finish_reason === 'error' ? 'error' :
                            jsonData.choices?.[0]?.finish_reason ? 'completed' : 'in_progress',
                        nodeId: jsonData.flowState.currentNodeId,
                        nodeName: jsonData.flowState.currentNodeName,
                        nodeType: jsonData.nodeInfo.type,
                    };
                    sender = jsonData.nodeInfo.role || 'assistant'; // Use role from nodeInfo if available
                }


                // Check if the chunk indicates completion
                if (jsonData.choices?.[0]?.finish_reason) {
                    isDone = true;
                    // If a finish reason is provided, update status to completed/error
                    if (executionStatus) {
                        executionStatus.status = jsonData.choices[0].finish_reason === 'error' ? 'error' : 'completed';
                    }
                }
            } catch (e) {
                console.log('Error parsing streaming data:', e);
                // Potentially mark as done with error?
                // isDone = true;
            }
        }

        return { updatedText, isDone, executionStatus, sender };
    }, [updateConversationAndFlowState]);

    // Helper function to handle streaming errors
    const handleStreamingError = useCallback((err: any, streamingMsg: MessageType) => {
        if (err.name !== 'AbortError') {
            console.error('Streaming error:', err);
            setError(err instanceof Error ? err.message : 'Streaming failed');

            // Add error message to the chat
            if (streamingMsg) {
                setMessages(prev => [...prev, {
                    ...streamingMsg,
                    text: streamingMsg.text || 'Error occurred during streaming',
                    hasError: true
                }]);
                setStreamingMessage(null);
            }
        }
    }, []);

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
                setFlowState(result.flowState); // Update local flow state
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
                executionStatus: {
                    status: result.choices?.[0]?.finish_reason === 'error' ? 'error' :
                        result.choices?.[0]?.finish_reason ? 'completed' : 'in_progress',
                    nodeId: result.flowState.currentNodeId,
                    nodeName: result.flowState.currentNodeName,
                    nodeType: result.nodeInfo.type,
                }
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
            abortControllerRef.current.abort(); // Signal abortion
            abortControllerRef.current = null;
        }

        // The finalization logic is now primarily within processStreamResponse's finally block.
        // We might not need to add the message here explicitly anymore,
        // but ensure loading state is reset.
        // If streamingMessage is still present, the finally block should handle it.
        // Consider if immediate UI feedback is needed upon clicking stop.
        if (streamingMessage) {
            // Optionally add a message indicating streaming was stopped by user
            const stoppedMessage: MessageType = {
                ...streamingMessage,
                text: streamingMessage.text + "\n(Streaming stopped by user)",
                executionStatus: {
                    ...streamingMessage.executionStatus,
                    status: 'completed' // Or another appropriate status
                }
            };
            setMessages(prev => [...prev, stoppedMessage]);
            setStreamingMessage(null); // Clear immediately for UI responsiveness
        }


        setLoading(false); // Ensure loading is stopped
    }, [streamingMessage]); // Keep dependency if reading streamingMessage

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
        setFlowState(null); // Reset flow state

        // Call the callback prop if provided
        if (onNewChatStarted) {
            onNewChatStarted();
        }
    }, [onNewChatStarted]); // Add dependency

    // Determine placeholder text based on flow state
    const inputPlaceholder = useMemo(() => {

        if (loading) {
            return "Agent is processing...";
        }
        return "Type a message and press Enter to send";
    }, [flowState, loading]);

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
                <div className={styles.inputWrapper}>
                    {/* Action buttons on the left */}
                    <div className={styles.inputLeftActions}>
                        <Tooltip title="Add emoji">
                            <Button
                                type="text"
                                icon={<SmileOutlined style={{ fontSize: '16px', color: '#1890ff' }} />}
                                className={styles.actionButton}
                            />
                        </Tooltip>
                        <Tooltip title="Upload file">
                            <Button
                                type="text"
                                icon={<i className="fas fa-paperclip" style={{ fontSize: '16px', color: '#1890ff' }} />}
                                className={styles.actionButton}
                            />
                        </Tooltip>
                    </div>

                    {/* Main input area */}
                    <Input.TextArea
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder={inputPlaceholder}
                        autoSize={{ minRows: 1, maxRows: 4 }}
                        disabled={loading}
                        className={styles.chatInput}
                        style={{
                            borderRadius: '18px',
                            padding: '10px 14px',
                            resize: 'none',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                            border: '1px solid #e8e8e8',
                            transition: 'all 0.3s ease'
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        onFocus={(e) => {
                            e.target.style.boxShadow = '0 2px 12px rgba(24, 144, 255, 0.15)';
                            e.target.style.border = '1px solid #91d5ff';
                        }}
                        onBlur={(e) => {
                            e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                            e.target.style.border = '1px solid #e8e8e8';
                        }}
                    />

                    {/* Send button */}
                    <div className={styles.inputRightActions}>
                        {streamingMessage ? (
                            <Button
                                type="primary"
                                danger
                                icon={<StopOutlined />}
                                onClick={stopStreaming}
                                shape="circle"
                                size="large"
                                className={styles.sendButton}
                                style={{
                                    boxShadow: '0 2px 12px rgba(255, 77, 79, 0.25)',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        ) : (
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSendMessage}
                                disabled={isSendDisabled}
                                shape="circle"
                                size="large"
                                className={`${styles.sendButton} ${!isSendDisabled ? styles.sendButtonActive : ''}`}
                                style={{
                                    boxShadow: isSendDisabled ? 'none' : '0 4px 12px rgba(24, 144, 255, 0.35)',
                                    transform: isSendDisabled ? 'scale(1)' : 'scale(1.05)',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Send hint with animation */}
                <div className={styles.sendHintContainer}>
                    <Typography.Text
                        className={styles.sendHint}
                        type="secondary"
                        style={{
                            fontSize: '12px',
                            opacity: inputValue.length > 0 ? 1 : 0.6,
                            transition: 'opacity 0.3s ease'
                        }}
                    >
                        Press Enter to send or Shift+Enter for new line
                    </Typography.Text>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ChatInterface);
