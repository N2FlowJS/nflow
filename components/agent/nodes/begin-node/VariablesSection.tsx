import React, { memo, useMemo } from 'react';
import { Flex, Typography, Tag, Tooltip } from 'antd';
import { CodeOutlined } from '@ant-design/icons';

interface VariablesSectionProps {
  variables: any[];
}

const VariablesSection: React.FC<VariablesSectionProps> = memo(({ variables }) => {
  const iconStyle = useMemo(() => ({ marginRight: 4 }), []);

  const variableElements = useMemo(
    () =>
      variables.map((variable, index) => (
        <Tooltip
          key={`${variable.name || variable.title}-${index}`}
          title={
            <>
              <div>Name: ${variable.name || variable.title}</div>
              {variable.value && <div>Default: {variable.value}</div>}
            </>
          }
        >
          <Tag color="blue">${variable.name || variable.title}</Tag>
        </Tooltip>
      )),
    [variables]
  );

  return (
    <Flex align="center" gap={6}>
      <Typography.Text type="secondary">
        <CodeOutlined style={iconStyle} />
        Variables:
      </Typography.Text>
      <Flex wrap="wrap" gap={4}>
        {variableElements}
      </Flex>
    </Flex>
  );
});

VariablesSection.displayName = 'VariablesSection';

export default VariablesSection;
