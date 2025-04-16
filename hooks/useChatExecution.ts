import { useCallback, useRef, useState, useEffect } from 'react';
import { processEventStream } from '@pages/api/flows/until/flowExecutionService';
import { executeFlow } from '../services/flowExecutionService';
import { conversationService } from '../services/conversationService';
import { ExecutionResult, FlowState } from '../types/flowExecutionTypes';
import { MessageType } from '../components/chat/types';

// Import type only, not the hook itself
import type { LogEntry } from './useDebug';

interface ChatExecutionProps {
    agentId: string;
    enableStreaming?: boolean;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    userId?: string;
    teamId?: string;
    onConversationCreated?: (id: string) => void;
    onConversationUpdated?: (id: string) => void;
    variables?: Record<string, any>;
    logDebugInfo?: (action: string, details: string, source: string) => void;
}

export const useChatExecution = ({
    agentId,
    enableStreaming = false,
    model,
    temperature,
    maxTokens,
    userId,
    teamId,
    onConversationCreated,
    onConversationUpdated,
    variables = {},
    logDebugInfo
}: ChatExecutionProps) => {
    // Core state
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [flowState, setFlowState] = useState<FlowState | null>(null);
    const [waitingForInput, setWaitingForInput] = useState(false);
    const [id, setId] = useState<string | undefined>(undefined);

    // Streaming state
    const [streamingMessage, setStreamingMessage] = useState<MessageType | null>(null);
    const [isStreamingPaused, setIsStreamingPaused] = useState(false);
    
    // Refs
    const abortControllerRef = useRef<AbortController | null>(null);
    const streamReaderRef = useRef<ReadableStreamDefaultReader<any> | null>(null);
    
    // Store props in refs to avoid dependency issues
    const propsRef = useRef({
        agentId,
        enableStreaming,
        model,
        temperature,
        maxTokens,
        userId,
        teamId,
        variables,
        onConversationCreated,
        onConversationUpdated
    });
    
    // Update refs when props change
    useEffect(() => {
        propsRef.current = {
            agentId,
            enableStreaming,
            model,
            temperature,
            maxTokens,
            userId,
            teamId,
            variables,
            onConversationCreated,
            onConversationUpdated
        };
    }, [
        agentId, enableStreaming, model, temperature, 
        maxTokens, userId, teamId, variables,
        onConversationCreated, onConversationUpdated
    ]);

    // Safe debug logging function
    const logDebug = useCallback((action: string, details: string, source: string) => {
        if (logDebugInfo) {
            logDebugInfo(action, details, source);
        } else {
            console.log(`[${source}] ${action}: ${details}`);
        }
    }, [logDebugInfo]);

    // Update flow state with logging
    const updateFlowState = useCallback((newState: FlowState | null, source: string) => {
        const stateInfo = newState
            ? `ID: ${newState.currentNodeId}, Variables: ${Object.keys(newState.variables || {}).length}`
            : 'null';

        logDebug('FlowState update', stateInfo, source);
        setFlowState(newState);
    }, [logDebug]);

    // Add completion message
    const addCompletionMessage = useCallback(() => {
        const completionMessage: MessageType = {
            id: `completion-${Date.now()}`,
            text: '✅ Conversation completed',
            sender: 'system',
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, completionMessage]);
    }, []);

    // Fetch flow state details
    const fetchFlowStateDetails = useCallback(async (conversationId: string) => {
        if (!conversationId) return;

        try {
            logDebug('Fetching flow state', `For conversation: ${conversationId}`, 'fetchFlowStateDetails');
            
            const state = await conversationService.getFlowState(conversationId);
            if (state) {
                updateFlowState(state, 'fetchFlowStateDetails');
                logDebug('Flow state fetched', 
                    `Node: ${state.currentNodeId}, Variables: ${Object.keys(state.variables || {}).length}`,
                    'fetchFlowStateDetails');
            }
        } catch (error) {
            console.error('Error fetching flow state:', error);
            logDebug('Flow state fetch error',
                error instanceof Error ? error.message : 'Unknown error',
                'fetchFlowStateDetails');
        }
    }, [logDebug, updateFlowState]);

    // Process execution result
    const processExecutionResult = useCallback((result: ExecutionResult, userInput?: string) => {
        logDebug('Processing result', 
            `Status: ${result.status}, NodeId: ${result.nodeInfo?.id || 'none'}`,
            'processExecutionResult');

        // Handle error cases
        if (result.error) {
            const errorMsg = typeof result.error === 'string'
                ? result.error
                : result.error.message || 'An error occurred';
            setError(errorMsg);
            return;
        }

        if (result.status === 'error') {
            setError(result.message || 'An error occurred');
            return;
        }

        // Update flow state if present
        if (result.flowState) {
            updateFlowState(result.flowState, 'processExecutionResult');

            if (result.status === 'waiting_for_input') {
                setWaitingForInput(true);
            }
        }

        // Check if we should show this output (interface nodes or system messages)
        const isInterfaceNode = result.nodeInfo?.type === 'interface';
        const isSystemMessage = !result.nodeInfo;
        const shouldShowOutput = isInterfaceNode || isSystemMessage;

        // Handle OpenAI format response
        if (result.choices && result.choices.length > 0) {
            const choice = result.choices[0];
            const outputText = choice.message?.content || choice.text || '';

            if (outputText && shouldShowOutput) {
                const outputMessage: MessageType = {
                    id: result.id || `msg-${Date.now()}`,
                    text: outputText,
                    sender: 'agent',
                    timestamp: new Date().toISOString(),
                    nodeId: result.nodeInfo?.id,
                    nodeType: result.nodeInfo?.type,
                };

                setMessages(prev => [...prev, outputMessage]);
            }

            // Update UI based on finish reason
            if (choice.finish_reason === 'function_call') {
                setWaitingForInput(true);
            } else if (choice.finish_reason === 'stop') {
                setWaitingForInput(true);
                
                if (result.flowState?.completed) {
                    setWaitingForInput(false);
                    addCompletionMessage();
                }
            }
            
            return;
        }

        // Handle traditional format response
        if (result.output && shouldShowOutput) {
            const outputMessage: MessageType = {
                id: Date.now().toString(),
                text: result.output,
                sender: 'agent',
                timestamp: new Date().toISOString(),
                nodeId: result.nodeInfo?.id,
                nodeType: result.nodeInfo?.type,
            };

            setMessages(prev => [...prev, outputMessage]);
        }

        // Update UI based on status
        if (result.status === 'waiting_for_input') {
            setWaitingForInput(true);

            // Show interface template if provided
            if (result.userInterface?.template) {
                const interfaceMessage: MessageType = {
                    id: `interface-${Date.now()}`,
                    text: result.userInterface.template,
                    sender: 'agent',
                    timestamp: new Date().toISOString(),
                    nodeId: result.nodeInfo?.id,
                    nodeType: 'interface',
                    interface: {
                        ...result.userInterface,
                        type: 'text'
                    },
                };

                setMessages(prev => [...prev, interfaceMessage]);
            }
        } else if (result.status === 'completed') {
            setWaitingForInput(false);
            addCompletionMessage();
        }
    }, [addCompletionMessage, updateFlowState, logDebug]);

    // Handle streaming responses
    const handleStreamingResponse = useCallback(async (stream: ReadableStream<Uint8Array>) => {
        logDebug('Stream started', 'Processing stream', 'handleStreamingResponse');
        setIsStreamingPaused(false);

        // Create placeholder for streaming content
        const streamMsg: MessageType = {
            id: `stream-${Date.now()}`,
            text: '',
            sender: 'agent',
            timestamp: new Date().toISOString(),
            isTyping: true,
            executionStatus: {
                nodeId: 'pending',
                nodeName: 'Starting execution...',
                status: 'running'
            }
        };

        setStreamingMessage(streamMsg);

        try {
            // Setup stream handling
            abortControllerRef.current = new AbortController();
            const signal = abortControllerRef.current.signal;
            const processedStream = processEventStream(stream);
            const reader = processedStream.getReader();
            streamReaderRef.current = reader;

            let responseId: string | undefined;
            let currentInterfaceOutput = '';
            let receivedFlowState = false;

            while (true) {
                // Check for abort
                if (signal.aborted) {
                    throw new DOMException('Stream processing aborted', 'AbortError');
                }

                // Handle pause
                if (isStreamingPaused) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    continue;
                }

                const { done, value } = await reader.read();

                if (done) {
                    // Finalize streaming when done
                    if (currentInterfaceOutput) {
                        const finalMessage = {
                            ...streamMsg,
                            text: currentInterfaceOutput,
                            nodeType: 'interface'
                        };
                        delete finalMessage.isTyping;
                        delete finalMessage.executionStatus;

                        setMessages(prev => [...prev, finalMessage]);
                    }

                    setStreamingMessage(null);

                    if (value && value.status === 'completed') {
                        addCompletionMessage();
                        setWaitingForInput(false);
                    } else {
                        setWaitingForInput(true);
                    }

                    // Fetch full flow state if needed
                    if (responseId && !receivedFlowState) {
                        await fetchFlowStateDetails(responseId);
                    }

                    break;
                }

                // Process chunk data
                if (value) {
                    // Capture conversation ID
                    if (value.id && !responseId) {
                        responseId = value.id;
                        setId(responseId);
                        logDebug('ID received', responseId, 'handleStreamingResponse');

                        if (propsRef.current.onConversationCreated) {
                            propsRef.current.onConversationCreated(responseId);
                        }
                        
                        await fetchFlowStateDetails(responseId);
                        receivedFlowState = true;
                    }

                    // Extract message content
                    let chunkText = '';
                    if (value.choices && value.choices.length > 0) {
                        const delta = value.choices[0].delta || {};
                        chunkText = delta.content || '';
                    } else if (value.output) {
                        chunkText = value.output;
                    }

                    // Check for finish reason to fetch flow state
                    if (value.choices && 
                        value.choices[0].finish_reason && 
                        responseId && 
                        !receivedFlowState) {
                        await fetchFlowStateDetails(responseId);
                        receivedFlowState = true;
                    }

                    // Update streaming message with new content
                    if (chunkText) {
                        currentInterfaceOutput += chunkText;
                        streamMsg.text = currentInterfaceOutput;
                        setStreamingMessage({ ...streamMsg });

                        // Add small delay for natural typing effect
                        if (streamMsg.isTyping) {
                            await new Promise(resolve => setTimeout(resolve, 5));
                        }
                    }
                }
            }
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                console.log('Stream processing aborted');
            } else {
                console.error('Error processing stream:', err);
                setError('Error processing response stream');
            }
            
            logDebug('Stream error',
                err instanceof Error ? err.message : 'Unknown error',
                'handleStreamingResponse');
                
            setStreamingMessage(null);
        } finally {
            setLoading(false);
            streamReaderRef.current = null;
            abortControllerRef.current = null;
        }
    }, [addCompletionMessage, isStreamingPaused, logDebug, fetchFlowStateDetails]);

    // Toggle streaming pause
    const toggleStreamingPause = useCallback(() => {
        setIsStreamingPaused(prev => !prev);
    }, []);

    // Stop streaming
    const stopStreaming = useCallback(() => {
        if (streamReaderRef.current) {
            streamReaderRef.current.cancel('User cancelled');
            streamReaderRef.current = null;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        // Finalize streaming message
        if (streamingMessage) {
            const finalMessage = { ...streamingMessage };
            delete finalMessage.isTyping;

            setMessages(prev => [...prev, finalMessage]);
            setStreamingMessage(null);
            setLoading(false);
            setWaitingForInput(true);
        }
    }, [streamingMessage]);

    // Load existing conversation
    const loadConversation = useCallback(async (conversationId: string) => {
        setLoading(true);
        setError(null);

        try {
            const data = await conversationService.getConversation(conversationId);

            // Set conversation ID
            setId(conversationId);

            // Set flow state
            if (data.flowState) {
                updateFlowState(data.flowState, 'loadConversation');
            }

            // Convert DB messages to chat messages
            if (data.conversation?.messages) {
                const chatMessages: MessageType[] = data.conversation.messages.map((msg: any) => ({
                    id: msg.id,
                    text: msg.content,
                    sender: msg.role,
                    timestamp: msg.timestamp,
                    nodeId: msg.nodeId,
                    nodeType: msg.nodeType,
                    metadata: msg.metadata ? JSON.parse(msg.metadata) : undefined
                }));

                setMessages(chatMessages);
            }

            setLoading(false);
            setWaitingForInput(true);
        } catch (err) {
            console.error('Failed to load conversation:', err);
            setError('Could not load the conversation. Please try again.');
            setLoading(false);
        }
    }, [updateFlowState]);

    // Start a new chat
    const startNewChat = useCallback(async () => {
        // Clean up any ongoing requests
        stopStreaming();

        // Reset state
        setMessages([]);
        updateFlowState(null, 'startNewChat');
        setLoading(true);
        setError(null);
        setWaitingForInput(false);
        setStreamingMessage(null);
        setId(undefined);

        try {
            // Add welcome message
            const welcomeMessage: MessageType = {
                id: `welcome-${Date.now()}`,
                text: 'Welcome to the chat!',
                sender: 'system',
                timestamp: new Date().toISOString(),
            };
            setMessages([welcomeMessage]);

            // Create new abort controller
            abortControllerRef.current = new AbortController();

            logDebug('Starting new chat', propsRef.current.agentId, 'startNewChat');

            // Execute flow with OpenAI-compatible API
            const result = await executeFlow(propsRef.current.agentId, {
                stream: propsRef.current.enableStreaming,
                model: propsRef.current.model,
                temperature: propsRef.current.temperature,
                maxTokens: propsRef.current.maxTokens,
                userId: propsRef.current.userId,
                teamId: propsRef.current.teamId,
                variables: {
                    ...propsRef.current.variables,
                    createNewConversation: true
                }
            });

            // Handle streaming vs non-streaming responses
            if (propsRef.current.enableStreaming && result instanceof ReadableStream) {
                await handleStreamingResponse(result);
            } else {
                logDebug('Processing initial result', 
                    `Type: ${typeof result}`, 
                    'startNewChat');
                    
                const execResult = result as ExecutionResult;

                // Update flow state
                if (execResult.flowState) {
                    updateFlowState(execResult.flowState, 'startNewChat');
                    
                    if (execResult.status === 'waiting_for_input') {
                        setWaitingForInput(true);
                    }
                } else {
                    console.warn("No flow state received from API");
                    setError("Failed to initialize chat. Please try again.");
                }

                processExecutionResult(execResult);

                // Update conversation ID if returned
                if ((result as any).id) {
                    const newId = (result as any).id;
                    setId(newId);
                    
                    if (propsRef.current.onConversationCreated) {
                        propsRef.current.onConversationCreated(newId);
                    }
                }

                setLoading(false);
            }
        } catch (err) {
            console.error('Failed to start chat:', err);
            setError('Could not start the conversation. Please try again.');
            setLoading(false);
        }
    }, [stopStreaming, updateFlowState, logDebug, handleStreamingResponse, processExecutionResult]);

    // Send user message
    const sendMessage = useCallback(async (inputValue: string) => {
        logDebug('Send message attempt',
            `Input: ${inputValue.substring(0, 20)}${inputValue.length > 20 ? '...' : ''},
            Has flowState: ${!!flowState}, Loading: ${loading}`,
            'sendMessage');

        // Validation checks
        if (!inputValue.trim()) {
            return false;
        }

        if (!flowState) {
            setError("Chat is not ready yet. Please wait or restart the conversation.");
            return false;
        }

        if (loading) {
            return false;
        }

        // Clean up ongoing requests
        stopStreaming();

        // Add user message immediately for better UX
        const userMessage: MessageType = {
            id: `user-${Date.now()}`,
            text: inputValue,
            sender: 'user',
            timestamp: new Date().toISOString(),
            nodeId: flowState.currentNodeId,
        };

        setMessages(prev => [...prev, userMessage]);
        const sentMessage = inputValue;
        setLoading(true);

        // Show temporary processing message
        const processingMessage: MessageType = {
            id: `processing-${Date.now()}`,
            text: '',
            sender: 'agent',
            timestamp: new Date().toISOString(),
            isTyping: true,
            executionStatus: {
                nodeId: flowState.currentNodeId || 'unknown',
                nodeName: 'Processing input...',
                status: 'running'
            }
        };
        
        setStreamingMessage(processingMessage);
        setWaitingForInput(false);

        try {
            // Create abort controller
            abortControllerRef.current = new AbortController();

            logDebug('Executing flow',
                `Agent: ${propsRef.current.agentId}, ID: ${id || 'new'}`,
                'sendMessage');

            // Execute the flow with the message
            const result = await executeFlow(propsRef.current.agentId, {
                messages: [{ role: 'user', content: sentMessage }],
                stream: propsRef.current.enableStreaming,
                model: propsRef.current.model,
                temperature: propsRef.current.temperature,
                maxTokens: propsRef.current.maxTokens,
                id,
                userId: propsRef.current.userId,
                teamId: propsRef.current.teamId
            });

            // Notify parent component
            if (id && propsRef.current.onConversationUpdated) {
                propsRef.current.onConversationUpdated(id);
            }

            // Handle response
            if (propsRef.current.enableStreaming && result instanceof ReadableStream) {
                setStreamingMessage(null);
                await handleStreamingResponse(result);
            } else {
                // Clear processing message
                setStreamingMessage(null);

                // Check for errors
                const execResult = result as ExecutionResult;
                if (execResult.error && execResult.nodeInfo) {
                    const errorMsg = `Error in node "${execResult.nodeInfo.name}" (${execResult.nodeInfo.id}): ${
                        typeof execResult.error === 'string' ? execResult.error : 
                        execResult.error.message || 'Unknown error'
                    }`;
                    setError(errorMsg);
                } else {
                    processExecutionResult(execResult, sentMessage);
                }
                
                setLoading(false);
            }
            
            return true;
        } catch (err) {
            console.error("Error details:", err);
            setError(`Failed to process your message: ${err instanceof Error ? err.message : 'Unknown error'}`);
            logDebug('Execution error',
                err instanceof Error ? err.message : 'Unknown error',
                'sendMessage');
            setLoading(false);
            setStreamingMessage(null);
            return false;
        }
    }, [
        flowState, loading, id, 
        stopStreaming, logDebug, handleStreamingResponse, 
        processExecutionResult
    ]);

    // Check if the send button should be disabled
    const isSendDisabled = useCallback((inputValue: string) => {
        const hasValidFlowState = flowState !== null;
        const canSendMessage = hasValidFlowState && waitingForInput && !flowState.completed;

        return !inputValue.trim() || loading || !canSendMessage;
    }, [flowState, loading, waitingForInput]);

    return {
        // State
        messages,
        setMessages,
        loading,
        error,
        setError,
        flowState,
        waitingForInput,
        id,
        setId,
        streamingMessage,
        isStreamingPaused,
        
        // API Functions
        startNewChat,
        sendMessage,
        toggleStreamingPause,
        stopStreaming,
        loadConversation,
        fetchFlowStateDetails,
        isSendDisabled,
        
        // Helper functions
        updateFlowState,
    };
};
