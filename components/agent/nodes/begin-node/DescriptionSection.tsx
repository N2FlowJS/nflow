import React, { memo, useMemo } from 'react';
import { Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface DescriptionSectionProps {
  description: string;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = memo(({ description }) => {
  const paragraphStyle = useMemo(() => ({
    marginBottom: 4,
    paddingLeft: 4,
    borderLeft: '2px solid #91caff'
  }), []);

  const iconStyle = useMemo(() => ({
    marginRight: 4,
    color: '#1677ff'
  }), []);

  const ellipsisConfig = useMemo(() => ({
    rows: 2,
    expandable: false,
    tooltip: description
  }), [description]);

  return (
    <div>
      <Typography.Paragraph 
        ellipsis={ellipsisConfig}
        style={paragraphStyle}
      >
        <InfoCircleOutlined style={iconStyle} />
        {description}
      </Typography.Paragraph>
    </div>
  );
});

DescriptionSection.displayName = 'DescriptionSection';

export default DescriptionSection;
