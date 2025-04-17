import { LoadingOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Progress, Tag, Typography } from 'antd';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './ChatMessage.module.css';
import { MessageType } from './types';

interface ChatMessageProps {
  message: MessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { sender, text, isTyping, executionStatus, hasError, nodeType, nodeId } = message;

  // Format timestamp to human-readable format
  const formattedTime = new Date(message.timestamp).toLocaleTimeString();

  // Apply styling based on sender
  const isUser = sender === 'user';
  const isSystem = sender === 'system';
  const messageClass = isUser ? styles.userMessage : isSystem ? styles.systemMessage : styles.agentMessage;

  // Get appropriate icon
  const icon = isUser ? <UserOutlined /> : isSystem ? null : <RobotOutlined />;

  // Determine if we should show the content based on node type
  const shouldShowContent = isUser || isSystem || nodeType === 'interface' || hasError;

  return (
    <div className={`${styles.messageContainer} ${messageClass}`}>
      <Card 
        className={styles.messageCard} 
        style={hasError ? { borderLeft: '3px solid #ff4d4f' } : {}}
      >
        <div className={styles.messageHeader}>
          {icon && <span className={styles.messageIcon}>{icon}</span>}
          <span className={styles.messageSender}>
            {isUser ? 'You' : isSystem ? 'System' : 'Agent'}
          </span>
          <span className={styles.messageTime}>{formattedTime}</span>
          
          {nodeType && !isUser && (
            <Tag color={nodeType === 'interface' ? 'blue' : 'default'} className={styles.nodeTag}>
              {nodeType}{nodeId ? `: ${nodeId}` : ''}
            </Tag>
          )}
        </div>
        
        {/* Show execution status if available */}
        {executionStatus && (
          <div className={styles.executionStatus}>
            <Progress 
              percent={executionStatus.status === 'completed' ? 100 : 50} 
              status={executionStatus.status === 'error' ? 'exception' : 'active'} 
              size="small" 
              showInfo={false}
              style={{ marginBottom: 8 }} 
            />
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              {executionStatus.status === 'in_progress' && <LoadingOutlined style={{ marginRight: 5 }} />}
              {executionStatus.status === 'completed' ? 'Completed: ' : executionStatus.status === 'error' ? 'Error: ' : 'Processing: '}
              {executionStatus.nodeName || executionStatus.nodeId || 'Unknown node'}
            </Typography.Text>
          </div>
        )}

        {/* Only show message content for interface nodes, user messages, system messages, or if there's an error */}
        {shouldShowContent && (
          <div className={styles.messageContent}>
            {isSystem ? (
              <Typography.Text>{text}</Typography.Text>
            ) : (
              <ReactMarkdown>{text}</ReactMarkdown>
            )}
            {isTyping && <span className={styles.typingIndicator}>▋</span>}
          </div>
        )}
      </Card>
    </div>
  );
};

export default React.memo(ChatMessage);
