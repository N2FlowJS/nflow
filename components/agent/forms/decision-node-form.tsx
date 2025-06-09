import { usePredecessorNodes } from '../hooks/usePredecessorNodes';
import { DecisionBranch, DecisionForm, DecisionNodeData, FlowNode, NodeData } from '../../../models/flowTypes';
import { DeleteOutlined, LinkOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { MarkerType, useReactFlow } from '@xyflow/react'; // Import Edge type
import { Button, Card, Collapse, Form, Input, Radio, Select, Space, Tooltip, Typography } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import { FormInstance } from 'antd/lib';
import RoleSelector from './shared/RoleSelector';
import { useLocale } from '../../../locale';

const { Text } = Typography;

const OPERATORS = [
  { value: 'equals', label: '=' },
  { value: 'notEquals', label: '≠' },
  { value: 'contains', label: 'Contains' },
  { value: 'greaterThan', label: '>' },
  { value: 'lessThan', label: '<' },
  { value: 'startsWith', label: 'Starts With' },
  { value: 'endsWith', label: 'Ends With' },
];

interface DecisionNodeFormProps {
  form: FormInstance<DecisionForm>;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DecisionNodeForm: React.FC<DecisionNodeFormProps> = ({ form, selectedNode, setIsDrawerOpen }) => {
  const { getNodes, getEdges, setEdges } = useReactFlow();
  const flowNodes = getNodes().filter((node) => node.id !== selectedNode.id);
  const { predecessorNodes } = usePredecessorNodes(selectedNode.id);
  const { t } = useLocale('form.nodeForm');

  // Use Form.useWatch for form fields
  const defaultTarget = Form.useWatch('defaultTarget', form);
  const branches = Form.useWatch('branches', form) || [];

  // Get all available variables from predecessor nodes
  const getAvailableVariables = () => {
    const variables: { label: string; value: string; category: string }[] = [];
    console.log('predecessorNodes', predecessorNodes);

    // Add variables from begin nodes
    predecessorNodes

      .forEach((node) => {

        variables.push({
          label: node.data.form.name,
          value: node.id,
          category: `${node.data?.form?.name || node.id} (Variables)`,
        });
      });

    return variables;
  };

  const availableVariables = getAvailableVariables();
  console.log(availableVariables, 'availableVariables');


  // Renamed from handleSave: This function now only syncs edges
  const syncEdgesWithBranches = (values: DecisionNodeData['form']) => {
    // Note: Node data is already saved by BaseNodeForm's handleSave

    // Get all current edges
    const currentEdges = getEdges();
    const sourceNodeId = selectedNode.id;

    // Find existing category edges from this node
    const existingCategoryEdges = currentEdges.filter(
      (edge) => edge.source === sourceNodeId && edge.sourceHandle?.startsWith("out-")
    );

    // Keep all non-category edges
    const nonCategoryEdges = currentEdges.filter(
      (edge) => !(edge.source === sourceNodeId && edge.sourceHandle?.startsWith("out-"))
    );

    // Create new edges array starting with all non-category edges
    const newEdges = [...nonCategoryEdges];

    // For each category with a target node
    values.branches.forEach((branche: DecisionBranch) => {
      if (branche.targetNode) {
        const sourceHandle = `out-${branche.name}`;

        // Check if this connection already exists
        const existingEdge = existingCategoryEdges.find(
          (edge) =>
            edge.source === sourceNodeId &&
            edge.target === branche.targetNode &&
            edge.sourceHandle === sourceHandle
        );

        if (existingEdge) {
          // If connection already exists, keep it
          newEdges.push(existingEdge);
        } else {
          // If connection doesn't exist, create a new edge
          const edgeId = `edge-${sourceNodeId}-${branche.name}-to-${branche.targetNode}`;
          newEdges.push({
            id: edgeId,
            source: sourceNodeId,
            target: branche.targetNode,
            sourceHandle: sourceHandle,
            type: "default",
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          });
        }
      }
    });
    if (values.defaultTarget) {
      const sourceHandle = `out-default`;

      // Check if this connection already exists
      const existingEdge = existingCategoryEdges.find(
        (edge) =>
          edge.source === sourceNodeId &&
          edge.target === values.defaultTarget &&
          edge.sourceHandle === sourceHandle
      );

      if (existingEdge) {
        // If connection already exists, keep it
        newEdges.push(existingEdge);
      } else {
        // If connection doesn't exist, create a new edge
        const edgeId = `edge-${sourceNodeId}-default-to-${values.defaultTarget}`;
        newEdges.push({
          id: edgeId,
          source: sourceNodeId,
          target: values.defaultTarget,
          sourceHandle: sourceHandle,
          type: "default",
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        });
      }

    }


    // Update the edges state
    setEdges(newEdges);
  };

  return (
    <BaseNodeForm form={form} selectedNode={selectedNode} setIsDrawerOpen={setIsDrawerOpen} onSaveSuccess={syncEdgesWithBranches}>
      <RoleSelector />

      <Collapse
        defaultActiveKey={['branches', 'defaultTarget']}
        bordered={false}
        expandIconPosition="end"
        className="form-collapse"
        items={[
          {
            key: 'defaultTarget',
            label: (
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                  <LinkOutlined /> {t('defaultTargetNodeLabel')}
                </Text>
              </div>
            ),
            children: (
              <Form.Item key={'defaultTarget'} name="defaultTarget" initialValue={defaultTarget}>
                <Select
                  allowClear
                  placeholder={t('defaultTargetNodePlaceholder')}
                  style={{ width: '100%' }}
                  options={flowNodes.map((node) => ({
                    value: node.id,
                    label: (node.data?.form as NodeData)?.name || node.id,
                  }))}
                  optionFilterProp="label"
                  showSearch
                />
              </Form.Item>
            )
          },
          {
            key: 'branches',
            label: t('branchesLabel'),
            children: (
              <Form.List name="branches" initialValue={branches}>
                {(branchFields, { add: addBranch, remove: removeBranch }) => (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {branchFields.map((branchField,) => (
                      <Card
                        key={branchField.key}
                        title={
                          <Space>
                            <Form.Item {...branchField} name={[branchField.name, 'name']} noStyle>
                              <Input placeholder={t('branchNamePlaceholder')} style={{ width: 200 }} />
                            </Form.Item>
                            <Tooltip title={t('branchNameTooltip')}>
                              <QuestionCircleOutlined />
                            </Tooltip>
                          </Space>
                        }
                        extra={branchFields.length > 1 && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeBranch(branchField.name)} />}>
                        <Form.Item name={[branchField.name, 'groupOperator']} initialValue="OR">
                          <Radio.Group buttonStyle="solid" size="small">
                            <Radio.Button value="AND">{t('matchAllGroups')}</Radio.Button>
                            <Radio.Button value="OR">{t('matchAnyGroup')}</Radio.Button>
                          </Radio.Group>
                        </Form.Item>

                        <Form.List name={[branchField.name, 'groups']}>
                          {(groupFields, { add: addGroup, remove: removeGroup }) => (
                            <Space direction="vertical" style={{ width: '100%' }}>
                              {groupFields.map((groupField, groupIndex) => (
                                <Card key={groupField.key} size="small" title={t('groupLabel', { groupIndex: groupIndex + 1 })} extra={groupFields.length > 1 && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeGroup(groupField.name)} />}>
                                  <Form.Item name={[groupField.name, 'logicalOperator']} initialValue="AND">
                                    <Radio.Group buttonStyle="solid" size="small">
                                      <Radio.Button value="AND">{t('allConditions')}</Radio.Button>
                                      <Radio.Button value="OR">{t('anyCondition')}</Radio.Button>
                                    </Radio.Group>
                                  </Form.Item>

                                  <Form.List name={[groupField.name, 'conditions']}>
                                    {(conditionFields, { add: addCondition, remove: removeCondition }) => (
                                      <Space direction="vertical" style={{ width: '100%' }}>
                                        {conditionFields.map((condField,) => (
                                          <Card key={condField.key} size="small" bordered={false}>
                                            <Space align="baseline">
                                              <Form.Item {...condField} name={[condField.name, 'input']} rules={[{ required: true }]}>
                                                <Select showSearch placeholder={t('selectVariablePlaceholder')} style={{ width: 200 }} options={availableVariables} optionFilterProp="label" />
                                              </Form.Item>
                                              <Form.Item {...condField} name={[condField.name, 'operator']} rules={[{ required: true }]}>
                                                <Select options={OPERATORS} style={{ width: 100 }} />
                                              </Form.Item>
                                              <Form.Item {...condField} name={[condField.name, 'value']} rules={[{ required: true }]}>
                                                <Input placeholder={t('valuePlaceholder')} style={{ width: 120 }} />
                                              </Form.Item>
                                              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeCondition(condField.name)} />
                                            </Space>
                                          </Card>
                                        ))}
                                        <Button type="dashed" onClick={() => addCondition()} icon={<PlusOutlined />}>
                                          {t('addConditionButton')}
                                        </Button>
                                      </Space>
                                    )}
                                  </Form.List>
                                </Card>
                              ))}
                              <Button type="dashed" onClick={() => addGroup()} icon={<PlusOutlined />}>
                                {t('addConditionGroupButton')}
                              </Button>
                            </Space>
                          )}
                        </Form.List>

                        <Form.Item label={<div>
                          <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                            <LinkOutlined /> {t('targetNodeLabel')}
                          </Text>
                        </div>} name={[branchField.name, 'targetNode']} style={{ marginTop: 16 }}>

                          <Select
                            allowClear
                            placeholder={t('targetNodePlaceholder')}
                            style={{ width: '100%' }}
                            options={flowNodes.map((node) => ({
                              value: node.id,
                              label: (node.data?.form as NodeData)?.name || node.id,
                            }))}
                            optionFilterProp="label"
                            showSearch
                          />
                        </Form.Item>
                      </Card>
                    ))}

                    <Button type="dashed" onClick={() => addBranch({ name: `Branch ${branchFields.length + 1}`, conditions: [] })} block icon={<PlusOutlined />}>
                      {t('addBranchButton')}
                    </Button>
                  </Space>
                )}
              </Form.List>
            )
          }
        ]}
      />
    </BaseNodeForm>
  );
};

export default DecisionNodeForm;
