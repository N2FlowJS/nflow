import { LoadingOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Flex, Progress, Space, Tag, theme, Typography } from 'antd';
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageType } from './types';
import { useMobile } from '../../hooks/useMobile';

interface ChatMessageProps {
  message: MessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { token } = theme.useToken();
  const { isMobile } = useMobile();
  const { sender, text, executionStatus, hasError, timestamp } = message;

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

  if (sender === 'user') {
    return (
      <Flex vertical justify="flex-end" align="flex-end" style={{ 
        marginBottom: isMobile ? token.marginSM : token.marginMD,
        maxWidth: isMobile ? '95%' : '85%',
        alignSelf: 'flex-end'
      }}>
        <Typography.Paragraph
          copyable
          style={{ 
            margin: 0,
            fontSize: isMobile ? token.fontSize - 1 : token.fontSize 
          }}
        >
          <ReactMarkdown>{text}</ReactMarkdown>
        </Typography.Paragraph>
      </Flex>
    )
  }

  return (
    <div style={{
      marginBottom: isMobile ? token.marginSM : token.marginMD,
      maxWidth: isMobile ? '95%' : '85%',
      alignSelf: 'flex-start',
    }}>
      <Card
        size={isMobile ? "small" : "default"}
        style={{
          background: token.colorBgContainer,
          borderLeft: hasError ? `3px solid ${token.colorError}` : undefined,
          padding: isMobile ? token.paddingXS : token.paddingSM,
          ...(sender === 'developer' && {
            background: token.colorBgContainerDisabled,
            padding: token.paddingXS,
            borderRadius: token.borderRadius,
            fontFamily: 'monospace',
            fontSize: '0.9em',
          })
        }}
      >
        <Space direction="vertical" size={isMobile ? "small" : "middle"} style={{ width: '100%' }}>
          {sender !== 'developer' && (
            <Space size={isMobile ? "small" : "middle"}>
              <Avatar icon={icon} size={isMobile ? "small" : "default"} />
              <Typography.Text type="secondary" style={{ fontSize: isMobile ? token.fontSizeSM - 1 : token.fontSizeSM }}>
                {roleLabel}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: isMobile ? token.fontSizeSM - 1 : token.fontSizeSM }}>
                {formattedTime}
              </Typography.Text>
              {executionStatus && (
                <Tag color={executionStatus.nodeType === 'interface' ? 'blue' : 'default'} style={{ fontSize: isMobile ? token.fontSizeSM - 1 : undefined }}>
                  {executionStatus.nodeType}
                </Tag>
              )}
            </Space>
          )}

          {executionStatus && (
            <div style={{ 
              background: token.colorBgContainerDisabled, 
              padding: isMobile ? `${token.paddingXXS}px ${token.paddingXS}px` : token.paddingXS, 
              borderRadius: token.borderRadius 
            }}>
              <Progress
                percent={
                  executionStatus?.status === 'completed' ? 100 :
                    executionStatus?.status === 'error' ? 100 :
                      executionStatus?.status === 'in_progress' ? 90 : 100
                }
                status={
                  executionStatus?.status === 'error' ? 'exception' :
                    executionStatus?.status === 'completed' ? 'success' : 'active'
                }
                size="small"
                showInfo={false}
                strokeWidth={2}
              />

              {executionStatus && (
                <Typography.Text type="secondary" style={{ fontSize: isMobile ? token.fontSizeSM - 1 : token.fontSizeSM }}>
                  {executionStatus.status === 'in_progress' && <LoadingOutlined style={{ marginRight: token.marginXS }} />}
                  {executionStatus.status === 'completed' ? 'Completed: ' : executionStatus.status === 'error' ? 'Error: ' : 'Processing: '}
                  {executionStatus.nodeName || executionStatus.nodeId}
                </Typography.Text>
              )}
            </div>
          )}

          <Typography.Paragraph
            style={{ 
              margin: 0,
              fontSize: isMobile ? token.fontSize - 1 : token.fontSize
            }}
            copyable
          >
            {sender === 'developer' ? (
              <Typography.Text type="secondary">
                {`[${formattedTime}] ${text.slice(-50)}`}
              </Typography.Text>
            ) : (
              <ReactMarkdown>{text}</ReactMarkdown>
            )}
          </Typography.Paragraph>
        </Space>
      </Card>
    </div>
  );
};

export default React.memo(ChatMessage);
