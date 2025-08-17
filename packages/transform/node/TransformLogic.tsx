import React from 'react';
import { Typography, Tag } from 'antd';
import { CodeOutlined, WarningOutlined } from '@ant-design/icons';

interface TransformLogicProps {
  transformation: string;
}

const TransformLogic: React.FC<TransformLogicProps> = ({ transformation }) => {
  const hasTransformation = transformation && transformation.trim().length > 0;

  // Extract key patterns from transformation
  const getTransformationTags = (code: string) => {
    const tags = [];
    
    if (code.includes('.map(')) tags.push({ label: 'MAP', color: 'blue' });
    if (code.includes('.filter(')) tags.push({ label: 'FILTER', color: 'green' });
    if (code.includes('.reduce(')) tags.push({ label: 'REDUCE', color: 'orange' });
    if (code.includes('JSON.stringify') || code.includes('JSON.parse')) tags.push({ label: 'JSON', color: 'purple' });
    if (code.includes('Math.')) tags.push({ label: 'MATH', color: 'cyan' });
    if (code.includes('String(') || code.includes('.toString')) tags.push({ label: 'STRING', color: 'magenta' });
    
    return tags.slice(0, 3); // Limit to 3 tags for display
  };

  return (
    <div>
      {hasTransformation ? (
        <div>
          <div style={{ marginBottom: 8 }}>
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              <CodeOutlined style={{ marginRight: 4 }} />
              Transformation:
            </Typography.Text>
          </div>
          
          <div style={{ marginBottom: 8 }}>
            {getTransformationTags(transformation).map((tag, index) => (
              <Tag key={index} color={tag.color} style={{ fontSize: '10px', marginRight: 4 }}>
                {tag.label}
              </Tag>
            ))}
          </div>
          
          <Typography.Text 
            style={{ 
              fontSize: '11px',
              display: 'block',
              color: '#666',
              fontFamily: 'monospace',
              backgroundColor: '#f5f5f5',
              padding: '4px 6px',
              borderRadius: '3px',
              maxHeight: '40px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {transformation.length > 60 
              ? `${transformation.substring(0, 60)}...` 
              : transformation}
          </Typography.Text>
        </div>
      ) : (
        <Typography.Text type="warning" style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
          <WarningOutlined style={{ marginRight: 4 }} />
          No transformation logic
        </Typography.Text>
      )}
    </div>
  );
};

export default TransformLogic;
