import {
  ReloadOutlined,
  RobotOutlined,
  SendOutlined,
  SmileOutlined,
  StopOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Divider,
  Empty,
  Input,
  Layout,
  Space,
  Spin,
  Switch,
  Tooltip,
  Typography,
} from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useMobile, useToken } from '../../hooks/useMobile';
import { OpenAIExecutionResult } from '../../models/flow';
import { flowExecutionService } from '../../services/flowExecutionService';
import ChatMessage from './ChatMessage';
import { ISender, MessageType } from './types';
import { useLocale } from '../../locale';
import { FlowState } from '@n2flowjs/flow';

interface ChatInterfaceProps {
  agentId: string;
  flowConfig: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
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
  id: initialId,
  onConversationCreated,
  onConversationUpdated,
  onNewChatStarted,
  variables = {},
}) => {
  const { token } = useToken();
  const { isMobile } = useMobile();
  const [enableStreaming, setEnableStreaming] = useState(true);
  const { t } = useLocale('chat');

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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // memoize disable check
  const isSendDisabled = useMemo(() => loading || !inputValue.trim(), [loading, inputValue]);
  // Handle normal (non-streaming) response
  const handleNormalResponse = useCallback(
    async (options: any) => {
      try {
        // Call service with streaming disabled
        const result = (await flowExecutionService(agentId, {
          ...options,
          stream: false,
        })) as OpenAIExecutionResult;

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
            status:
              result.choices?.[0]?.finish_reason === 'error'
                ? 'error'
                : result.choices?.[0]?.finish_reason
                ? 'ended'
                : 'in_progress',
            nodeId: result.flowState.currentNode.id,
            nodeName: result.flowState.currentNode.data.form.name,
            nodeType: result.flowState.currentNode.type as any,
          },
        };

        setMessages((prev) => [...prev, newMessage]);
      } catch (err) {
        console.error('Error in handleNormalResponse:', err);
        setError(err instanceof Error ? err.message : 'Failed to get response');
      } finally {
        setLoading(false);
      }
    },
    [agentId, conversationId, onConversationCreated, onConversationUpdated]
  );
  const updateConversationAndFlowState = useCallback(
    (result: any) => {
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
    },
    [conversationId, onConversationCreated, onConversationUpdated]
  );
  const processStreamChunk = useCallback(
    (
      chunk: string,
      currentText: string
    ): { sender: ISender; updatedText: string; isDone: boolean; executionStatus?: MessageType['executionStatus'] } => {
      const lines = chunk.split('\n\n').filter((line) => line.trim() !== '' && line.startsWith('data: '));

      let isDone = false;
      let updatedText = currentText;
      let executionStatus: MessageType['executionStatus'] | undefined = undefined;
      let sender: ISender = 'developer'; // Default sender
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
              status:
                jsonData.choices?.[0]?.finish_reason === 'error'
                  ? 'error'
                  : jsonData.choices?.[0]?.finish_reason
                  ? 'ended'
                  : 'in_progress',
              nodeId: jsonData.flowState.currentNode.id,
              nodeName: jsonData.flowState.currentNode.data.form.name,
              nodeType: jsonData.flowState.currentNode.type as any,
            };
            sender = jsonData.nodeInfo.role || 'assistant'; // Use role from nodeInfo if available
          }

          // Check if the chunk indicates completion
          if (jsonData.choices?.[0]?.finish_reason) {
            isDone = true;
            // If a finish reason is provided, update status to completed/error
            if (executionStatus) {
              executionStatus.status = jsonData.choices[0].finish_reason === 'error' ? 'error' : 'ended';
            }
          }
        } catch (e) {
          console.log('Error parsing streaming data:', e);
          // Potentially mark as done with error?
          // isDone = true;
        }
      }

      return { updatedText, isDone, executionStatus, sender };
    },
    [updateConversationAndFlowState]
  );
  const processStreamResponse = useCallback(
    async (stream: ReadableStream, streamingMsg: MessageType) => {
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
          setStreamingMessage((prev) =>
            prev
              ? {
                  ...prev,
                  text: accumulatedText,
                  executionStatus: finalExecutionStatus,
                  sender: result.sender, // Update sender if changed
                }
              : null
          );

          if (result.isDone) {
            done = true;
            break;
          }
        }
      } catch (error: unknown) {
        console.error('Error reading stream:', error);
        // Optionally update message state to reflect error
        setStreamingMessage((prev) =>
          prev ? { ...prev, hasError: true, text: accumulatedText + '\n(Error reading stream)' } : null
        );
      } finally {
        // Make sure to release the reader
        try {
          reader.releaseLock();
        } catch (e) {
          console.warn('Error releasing reader lock:', e);
        }

        // Finalize the streaming message when done or stopped
        // Use the latest accumulated text and status
        const finalMessage: MessageType = {
          ...streamingMsg,
          text: accumulatedText,
          executionStatus: {
            ...finalExecutionStatus,
            // Ensure status is marked ended if loop finished normally
            status: finalExecutionStatus.status !== 'error' ? 'ended' : 'error',
          },
        };

        setMessages((prev) => [...prev, finalMessage]);
        setStreamingMessage(null); // Clear the temporary streaming message
      }
    },
    [isStreamingPaused, processStreamChunk]
  );

  const handleNonStreamResponse = useCallback(
    (result: any, streamingMsg: MessageType) => {
      const finalMessage: MessageType = {
        ...streamingMsg,
        text: result.choices?.[0]?.delta?.content || '',
        executionStatus: {
          status:
            result.choices?.[0]?.finish_reason === 'error'
              ? 'error'
              : result.choices?.[0]?.finish_reason
              ? 'ended'
              : 'in_progress',
          nodeId: result.flowState.currentNodeId,
          nodeName: result.flowState.currentNodeName,
          nodeType: result.nodeInfo.type,
        },
      };

      setMessages((prev) => [...prev, finalMessage]);
      setStreamingMessage(null);

      // Update conversation ID and flow state
      updateConversationAndFlowState(result);
    },
    [updateConversationAndFlowState]
  );
  const handleStreamingError = useCallback((err: any, streamingMsg: MessageType) => {
    if (err.name !== 'AbortError') {
      console.error('Streaming error:', err);
      setError(err instanceof Error ? err.message : 'Streaming failed');

      // Add error message to the chat
      if (streamingMsg) {
        setMessages((prev) => [
          ...prev,
          {
            ...streamingMsg,
            text: streamingMsg.text || 'Error occurred during streaming',
            hasError: true,
          },
        ]);
        setStreamingMessage(null);
      }
    }
  }, []);
  const handleStreamingResponse = useCallback(
    async (options: any) => {
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
    },
    [agentId, processStreamResponse, handleNonStreamResponse, handleStreamingError]
  );

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
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setError(null);

    try {
      // Format messages for API
      const apiMessages = [
        ...messages.map((msg) => ({
          role: msg.sender,
          content: msg.text,
        })),
        {
          role: 'user',
          content: userMessage.text,
        },
      ];

      // Create service options
      const serviceOptions = {
        messages: apiMessages,
        variables,
        model: model || 'default',
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 1024,
        id: conversationId,
        stream: enableStreaming,
      };

      if (enableStreaming) {
        await handleStreamingResponse(serviceOptions);
      } else {
        await handleNormalResponse(serviceOptions);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }, [
    isSendDisabled,
    inputValue,
    messages,
    conversationId,
    handleStreamingResponse,
    handleNormalResponse,
    model,
    variables,
    temperature,
    maxTokens,
    enableStreaming,
  ]); // Added flowState dependency

  // Helper function to handle streaming errors

  // Toggle streaming pause/resume
  const toggleStreamingPause = useCallback(() => {
    setIsStreamingPaused((prev) => !prev);
  }, []);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Signal abortion
      abortControllerRef.current = null;
    }

    if (streamingMessage) {
      const stoppedMessage: MessageType = {
        ...streamingMessage,
        text: streamingMessage.text + '\n(Streaming stopped by user)',
        executionStatus: {
          ...streamingMessage.executionStatus,
          status: 'ended', // Or another appropriate status
        },
      };
      setMessages((prev) => [...prev, stoppedMessage]);
      setStreamingMessage(null); // Clear immediately for UI responsiveness
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
    setFlowState(null); // Reset flow state

    // Call the callback prop if provided
    if (onNewChatStarted) {
      onNewChatStarted();
    }
  }, [onNewChatStarted]); // Add dependency

  // Determine placeholder text based on flow state
  const inputPlaceholder = useMemo(() => {
    if (loading) {
      return 'Agent is processing...';
    }
    return 'Type a message and press Enter to send';
  }, [loading]);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, [messages, streamingMessage]);
  // Handle streaming response

  // Render the chat interface
  return (
    <Layout
      style={{
        height: '100%',
        minHeight: isMobile ? '70vh' : 'calc(100vh - 300px)',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <Layout.Header
        style={{
          background: 'transparent',
          padding: isMobile ? `${token.paddingXS}px ${token.paddingSM}px` : `${token.paddingMD}px ${token.paddingLG}px`,
          height: 'auto',
          lineHeight: 'normal',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: token.padding,
          marginBottom: isMobile ? token.marginXS : token.marginSM,
        }}>
        <Space>
          <Avatar
            icon={<RobotOutlined />}
            style={{
              backgroundColor: token.colorPrimary,
            }}
            size={isMobile ? 32 : 40}
          />
          <Typography.Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
            Chat with Agent
          </Typography.Title>
        </Space>

        {isMobile ? (
          <Space.Compact>
            {streamingMessage && (
              <Button
                icon={isStreamingPaused ? <SendOutlined /> : <StopOutlined />}
                onClick={toggleStreamingPause}
                size="small"
              />
            )}
            <Button icon={<ReloadOutlined />} onClick={startNewChat} size="small" />
          </Space.Compact>
        ) : (
          <Space>
            {flowState && (
              <Typography.Text type="secondary">
                Node: {flowState.currentNode.data.form.name || flowState.currentNode.id}
              </Typography.Text>
            )}
            {streamingMessage && (
              <Button icon={isStreamingPaused ? <SendOutlined /> : <StopOutlined />} onClick={toggleStreamingPause}>
                {isStreamingPaused ? 'Resume' : 'Pause'}
              </Button>
            )}
            <Tooltip title={t('streamingMode')}>
              <Switch
                checkedChildren={<ThunderboltOutlined />}
                unCheckedChildren={<ThunderboltOutlined />}
                checked={enableStreaming}
                onChange={setEnableStreaming}
              />
            </Tooltip>
            <Tooltip title="Start a new conversation">
              <Button icon={<ReloadOutlined />} onClick={startNewChat}>
                New Chat
              </Button>
            </Tooltip>
          </Space>
        )}
      </Layout.Header>

      <Divider style={{ margin: 0 }} />

      <div
        style={{
          flex: '1 1 auto',
          overflowY: 'auto',
          padding: isMobile ? `${token.paddingSM}px ${token.paddingSM}px` : `${token.paddingMD}px ${token.paddingLG}px`,
          minHeight: isMobile ? '250px' : '320px',
          display: 'flex',
          flexDirection: 'column',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none' /* IE and Edge */,
          scrollbarWidth: 'thin' /* Firefox */,
        }}>
        {messages.length === 0 && !streamingMessage ? (
          <Empty
            image={<RobotOutlined style={{ fontSize: isMobile ? 48 : 64, color: token.colorPrimary }} />}
            description="Start a conversation with this agent"
            style={{ margin: 'auto' }}
          />
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {streamingMessage && <ChatMessage message={streamingMessage} />}
          </>
        )}

        {loading && !streamingMessage && (
          <Space style={{ width: '100%', justifyContent: 'center', margin: token.margin }}>
            <Spin />
            <Typography.Text type="secondary">Agent is processing...</Typography.Text>
          </Space>
        )}

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            action={
              <Button size="small" onClick={startNewChat}>
                Restart Chat
              </Button>
            }
            style={{ margin: token.margin }}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      <Card style={{ borderRadius: 0, borderLeft: 0, borderRight: 0, borderBottom: 0 }}>
        <Space.Compact block style={{ position: 'relative' }}>
          {!isMobile && <Button icon={<SmileOutlined />} type="text" />}
          <Input.TextArea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={inputPlaceholder}
            autoSize={{ minRows: 1, maxRows: isMobile ? 3 : 4 }}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isMobile && !e.altKey) {
                e.preventDefault();
                handleSendMessage();
              } else if (e.key === 'Enter' && e.altKey) {
                e.preventDefault();
                const cursorPosition = e.currentTarget.selectionStart || 0;
                const newValue = inputValue.slice(0, cursorPosition) + '\n' + inputValue.slice(cursorPosition);
                setInputValue(newValue);

                // Use requestAnimationFrame to ensure the DOM has updated
                requestAnimationFrame(() => {
                  if (inputRef.current) {
                    inputRef.current.selectionStart = cursorPosition + 1;
                    inputRef.current.selectionEnd = cursorPosition + 1;
                    inputRef.current.focus();
                  }
                });
              }
            }}
            style={{
              height: undefined,
              resize: 'none',
              fontSize: isMobile ? 14 : 14,
              padding: isMobile ? '8px 40px 8px 12px' : undefined,
            }}
          />
          <Button
            type="primary"
            icon={streamingMessage ? <StopOutlined /> : <SendOutlined />}
            onClick={streamingMessage ? stopStreaming : handleSendMessage}
            disabled={isSendDisabled}
            style={{
              position: isMobile ? 'absolute' : 'relative',
              right: isMobile ? 0 : undefined,
              top: isMobile ? 0 : undefined,
              bottom: isMobile ? 0 : undefined,
              borderRadius: isMobile ? '0 4px 4px 0' : undefined,
            }}
          />
        </Space.Compact>
        {!isMobile && (
          <Typography.Text
            type="secondary"
            style={{
              fontSize: token.fontSizeSM,
              textAlign: 'center',
              display: 'block',
              marginTop: token.marginXS,
            }}>
            Press <Typography.Text keyboard>Enter</Typography.Text> to send,{' '}
            <Typography.Text keyboard>Shift + Enter</Typography.Text> or{' '}
            <Typography.Text keyboard>Alt + Enter</Typography.Text> for new line
          </Typography.Text>
        )}
      </Card>
    </Layout>
  );
};

export default React.memo(ChatInterface);
