import React from 'react';
import { Flex, Typography, Tag, Tooltip } from 'antd';
import { CodeOutlined } from '@ant-design/icons';

interface VariablesSectionProps {
  variables: any[];
}

const VariablesSection: React.FC<VariablesSectionProps> = ({ variables }) => {
  return (
    <Flex align="center" gap={6}>
      <Typography.Text type="secondary">
        <CodeOutlined style={{ marginRight: 4 }} />
        Variables:
      </Typography.Text>
      <Flex wrap="wrap" gap={4}>
        {variables.map((variable, index) => (
          <Tooltip 
            key={index} 
            title={
              <>
                <div>Name: ${variable.name || variable.title}</div>
                {variable.value && <div>Default: {variable.value}</div>}
              </>
            }
          >
            <Tag color="blue">${variable.name || variable.title}</Tag>
          </Tooltip>
        ))}
      </Flex>
    </Flex>
  );
};

export default VariablesSection;
