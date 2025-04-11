import React from 'react';
import { Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface DescriptionSectionProps {
  description: string;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({ description }) => {
  return (
    <div>
      <Typography.Paragraph 
        ellipsis={{ rows: 2, expandable: false, tooltip: description }}
        style={{ 
          marginBottom: 4,
          paddingLeft: 4,
          borderLeft: '2px solid #91caff'
        }}
      >
        <InfoCircleOutlined style={{ marginRight: 4, color: '#1677ff' }} />
        {description}
      </Typography.Paragraph>
    </div>
  );
};

export default DescriptionSection;
