import React from 'react';
import { Typography, Card } from 'antd';
import { FormOutlined } from '@ant-design/icons';

interface TemplateSectionProps {
  template: string;
}

const TemplateSection: React.FC<TemplateSectionProps> = ({ template }) => {
  return (
    <Card 
      size="small" 
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <FormOutlined style={{ marginRight: 4 }} />
          Template
        </Typography.Text>
      }
      style={{ 
        width: '100%', 
        backgroundColor: 'rgba(230, 244, 255, 0.6)',
        borderColor: '#91caff'
      }}
      bodyStyle={{ padding: '4px 8px' }}
    >
      <Typography.Paragraph 
        ellipsis={{ rows: 2, expandable: false, tooltip: template }}
        style={{ margin: 0, fontSize: '12px' }}
      >
        {template}
      </Typography.Paragraph>
    </Card>
  );
};

export default TemplateSection;
