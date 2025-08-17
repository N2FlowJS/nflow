import { CodeTwoTone, WarningOutlined } from '@ant-design/icons';
import { Card, Typography, Tag, Flex } from 'antd';
import React from 'react';

interface ComparisonInfoProps {
  leftValue: string;
  operator: string;
  rightValue: string;
  dataType: string;
}

const ComparisonInfo: React.FC<ComparisonInfoProps> = ({ 
  leftValue, 
  operator, 
  rightValue, 
  dataType 
}) => {
  const hasValues = leftValue && rightValue;
  
  const getOperatorSymbol = (op: string) => {
    switch (op) {
      case 'equals': return '=';
      case 'notEquals': return '≠';
      case 'greaterThan': return '>';
      case 'lessThan': return '<';
      case 'contains': return '⊃';
      case 'startsWith': return '^';
      case 'endsWith': return '$';
      case 'regex': return '~/';
      default: return op;
    }
  };

  const getOperatorColor = (op: string) => {
    switch (op) {
      case 'equals':
      case 'notEquals': return 'blue';
      case 'greaterThan':
      case 'lessThan': return 'orange';
      case 'contains':
      case 'startsWith':
      case 'endsWith': return 'green';
      case 'regex': return 'purple';
      default: return 'default';
    }
  };

  const getDataTypeColor = (type: string) => {
    switch (type) {
      case 'string': return 'blue';
      case 'number': return 'orange';
      case 'boolean': return 'green';
      case 'date': return 'purple';
      default: return 'default';
    }
  };

  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <CodeTwoTone style={{ marginRight: 4 }} />
          Condition Check
        </Typography.Text>
      }
      style={{
        width: '100%',
        borderColor: hasValues ? '#91caff' : '#ffccc7',
      }}
    >
      {hasValues ? (
        <div>
          <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
            <Tag color={getOperatorColor(operator)} style={{ fontSize: '11px' }}>
              {getOperatorSymbol(operator)}
            </Tag>
            <Tag color={getDataTypeColor(dataType)} style={{ fontSize: '11px' }}>
              {dataType}
            </Tag>
          </Flex>
          
          <Typography.Text 
            style={{ 
              fontSize: '12px',
              display: 'block',
              color: '#666',
              fontFamily: 'monospace'
            }}
          >
            {leftValue.length > 15 ? `${leftValue.substring(0, 15)}...` : leftValue}
            {' '}{getOperatorSymbol(operator)}{' '}
            {rightValue.length > 15 ? `${rightValue.substring(0, 15)}...` : rightValue}
          </Typography.Text>
        </div>
      ) : (
        <Typography.Text type="warning" style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
          <WarningOutlined style={{ marginRight: 4 }} />
          No comparison values specified
        </Typography.Text>
      )}
    </Card>
  );
};

export default ComparisonInfo;
