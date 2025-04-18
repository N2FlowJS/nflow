import { LoadingOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Progress, Tag, Typography } from 'antd';
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './ChatMessage.module.css';
import { MessageType } from './types';

interface ChatMessageProps {
  message: MessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { sender, text, executionStatus, hasError, nodeId, timestamp } = message;

  // memoize timestamp formatting and icon
  const formattedTime = useMemo(
    () => new Date(timestamp).toLocaleTimeString(),
    [timestamp]
  );
  const icon = useMemo(
    () => (sender === 'user' ? <UserOutlined /> : sender === 'system' ? null : <RobotOutlined />),
    [sender]
  );
  const roleLabel = sender === 'user' ? 'You' : sender === 'system' ? 'System' : sender === 'developer' ? 'Developer' : 'Agent';

  // Developer log view
  if (sender === 'developer') {
    return (
      <div className={`${styles.messageContainer} ${styles.developerMessage}`}>
        <pre className={styles.developerLog}>
          <code>{`[${formattedTime}] ${text}`}</code>
        </pre>
      </div>
    );
  }

  // Existing view for user, system, agent
  return (
    <div className={`${styles.messageContainer} ${sender === 'user' ? styles.userMessage : sender === 'system' ? styles.systemMessage : styles.agentMessage}`}>
      <Card className={styles.messageCard} style={hasError ? { borderLeft: '3px solid #ff4d4f' } : {}}>
        <div className={styles.messageHeader}>
          {icon && <span className={styles.messageIcon}>{icon}</span>}
          <span className={styles.messageSender}>{roleLabel}</span>
          <span className={styles.messageTime}>{formattedTime}</span>
          {sender !== 'user' && executionStatus && ( // Also check executionStatus exists
            <Tag color={executionStatus.nodeType === 'interface' ? 'blue' : 'default'} className={styles.nodeTag}>
              {executionStatus.nodeType}{nodeId ? `: ${nodeId}` : ''}
            </Tag>
          )}
        </div>

        {sender !== 'user' && executionStatus && (
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

        {/* always show content; use Paragraph for copyable, pre-wrap */}
        <div className={styles.messageContent}>
          <Typography.Paragraph
            style={{ margin: 0, whiteSpace: 'pre-wrap' }}
            copyable
          >
            <ReactMarkdown>
              {text}
            </ReactMarkdown>
          </Typography.Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default React.memo(ChatMessage);
