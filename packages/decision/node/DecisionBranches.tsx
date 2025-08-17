import React from 'react';
import { Card, Space, Tag, Typography, Divider } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useReactFlow } from '@xyflow/react';
import { DecisionBranch, DecisionCondition, FlowNode } from '../../../models/flowTypes';

const OPERATOR_SYMBOLS: Record<string, string> = {
  equals: '=',
  notEquals: '≠',
  contains: 'contains',
  greaterThan: '>',
  lessThan: '<',
  startsWith: 'starts with',
  endsWith: 'ends with',
};

interface DecisionBranchesProps {
  branches: DecisionBranch[];
}

const DecisionBranches: React.FC<DecisionBranchesProps> = ({ branches }) => {
  const { getNode } = useReactFlow();

  const getNodeName = (nodeId: string) => {
    const node = getNode(nodeId) as FlowNode;
    return node?.data?.form?.name || nodeId;
  };

  const formatCondition = (condition: DecisionCondition) => {
    const operatorSymbol = OPERATOR_SYMBOLS[condition.operator] || condition.operator;
    return `${getNodeName(condition.input)} ${operatorSymbol} ${condition.value}`;
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {branches?.map((branch, branchIndex) => (
        <Card key={branchIndex} size="small" title={<Typography.Text strong>{branch.name}</Typography.Text>}>
          {branch?.groups?.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {groupIndex > 0 && <Divider plain>{branch.groupOperator}</Divider>}
              <Space direction="vertical" style={{ width: '100%', padding: '4px 0' }}>
                {group.conditions?.map((condition, condIndex) => (
                  <React.Fragment key={condIndex}>
                    {condIndex > 0 && (
                      <Typography.Text type="secondary" style={{ padding: '0 8px' }}>
                        {group.logicalOperator}
                      </Typography.Text>
                    )}
                    <Tag color="processing" style={{ maxWidth: '100%', height: 'auto', whiteSpace: 'normal' }}>
                      {formatCondition(condition)}
                    </Tag>
                  </React.Fragment>
                ))}
              </Space>
            </React.Fragment>
          ))}
          {branch.targetNode && (
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              <Tag color="blue">
                <ArrowRightOutlined style={{ marginRight: 4 }} />
                {getNodeName(branch.targetNode)}
              </Tag>
            </div>
          )}
        </Card>
      ))}
    </Space>
  );
};

export default DecisionBranches;
