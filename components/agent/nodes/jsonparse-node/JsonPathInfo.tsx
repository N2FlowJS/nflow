import React from 'react';
import { Typography, Tag } from 'antd';
import { ApiOutlined } from '@ant-design/icons';

interface JsonPathInfoProps {
  jsonPath: string;
}

const JsonPathInfo: React.FC<JsonPathInfoProps> = ({ jsonPath }) => {
  return (
    <div style={{ textAlign: 'center' }}>
      <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 4 }}>
        <ApiOutlined style={{ marginRight: 2 }} />
        Path:
      </Typography.Text>
      <Tag color="purple" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
        {jsonPath.length > 20 ? `${jsonPath.substring(0, 20)}...` : jsonPath || 'No path'}
      </Tag>
    </div>
  );
};

export default JsonPathInfo;
