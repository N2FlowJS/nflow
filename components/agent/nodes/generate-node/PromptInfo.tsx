import React from 'react';
import { Card, Typography, Tooltip } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

interface PromptInfoProps {
  prompt: string;
}

const PromptInfo: React.FC<PromptInfoProps> = ({ prompt }) => {
  const hasPrompt = !!prompt && prompt.trim().length > 0;
  
  return (
    <Card
      size="small"
      style={{
        backgroundColor: hasPrompt ? 'rgba(246, 255, 237, 0.6)' : 'rgba(255, 245, 245, 0.6)',
        borderColor: hasPrompt ? '#b7eb8f' : '#ffccc7',
      }}
      bodyStyle={{ padding: '4px 8px' }}
    >
      <Tooltip title={hasPrompt ? prompt : "No prompt template defined"}>
        <Typography.Text 
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px'
          }}
        >
          <FileTextOutlined style={{ marginRight: 6 }} />
          
          {hasPrompt ? (
            <>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
              Prompt template defined ({prompt.length} chars)
            </>
          ) : (
            <>
              <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
              No prompt template defined
            </>
          )}
        </Typography.Text>
      </Tooltip>
    </Card>
  );
};

export default PromptInfo;
