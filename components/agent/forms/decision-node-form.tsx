import { usePredecessorNodes } from '../hooks/usePredecessorNodes';
import { DecisionBranch, DecisionForm, DecisionNodeData, FlowNode, NodeData } from '../../../models/flowTypes';
import { DeleteOutlined, LinkOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { MarkerType, useReactFlow } from '@xyflow/react'; // Import Edge type
import { Button, Card, Collapse, Form, Input, Radio, Select, Space, Tooltip, Typography } from 'antd';
import React, { useCallback, useEffect } from 'react';
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

// Helper to generate stable, safe handle ids from branch names
const normalizeHandle = (name: string) =>
  String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// New hook: returns a stable callback to sync edges based on branches/defaultTarget
const useBranchEdgeSync = (sourceNodeId: string) => {
  const { setEdges } = useReactFlow();

  return useCallback(
    (rawValues: DecisionNodeData['form'] | { form: DecisionNodeData['form'] } | any) => {
      // Support both shapes: {form: {...}} and flat {...}
      const values: DecisionNodeData['form'] = (rawValues?.form ?? rawValues ?? {}) as DecisionNodeData['form'];
      const safeBranches: DecisionBranch[] = Array.isArray(values?.branches) ? values.branches : [];
      const safeDefaultTarget: string | undefined = values?.defaultTarget;

      setEdges((currentEdges) => {
        // Only manage edges created by this decision node:
        // - edges from this source whose sourceHandle starts with 'out-'
        // - or edges whose id follows our pattern `edge-${sourceNodeId}-...`
        const isManaged = (e: any) =>
          e.source === sourceNodeId &&
          ((typeof e.sourceHandle === 'string' && e.sourceHandle.startsWith('out-')) ||
            (typeof e.id === 'string' && e.id.startsWith(`edge-${sourceNodeId}-`)));

        const preservedEdges = currentEdges.filter((e) => !isManaged(e));
        const nextEdges = [...preservedEdges];

        // Branch connections
        for (const branch of safeBranches) {
          if (!branch?.targetNode || !branch?.name) continue;
          const handleSlug = normalizeHandle(branch.name);
          const sourceHandle = `out-${handleSlug}`;
          const edgeId = `edge-${sourceNodeId}-${handleSlug}-to-${branch.targetNode}`;

          // Avoid duplicates by checking if an identical managed edge already exists in currentEdges
          const exists = currentEdges.some(
            (e) =>
              e.id === edgeId ||
              (e.source === sourceNodeId && e.target === branch.targetNode && e.sourceHandle === sourceHandle)
          );

          nextEdges.push(
            exists
              ? currentEdges.find(
                  (e) =>
                    e.id === edgeId ||
                    (e.source === sourceNodeId && e.target === branch.targetNode && e.sourceHandle === sourceHandle)
                )!
              : {
                  id: edgeId,
                  source: sourceNodeId,
                  target: branch.targetNode,
                  sourceHandle,
                  type: 'default',
                  markerEnd: { type: MarkerType.ArrowClosed },
                }
          );
        }

        // Default connection
        if (safeDefaultTarget) {
          const sourceHandle = 'out-default';
          const edgeId = `edge-${sourceNodeId}-default-to-${safeDefaultTarget}`;
          const exists = currentEdges.some(
            (e) =>
              e.id === edgeId ||
              (e.source === sourceNodeId && e.target === safeDefaultTarget && e.sourceHandle === sourceHandle)
          );

          nextEdges.push(
            exists
              ? currentEdges.find(
                  (e) =>
                    e.id === edgeId ||
                    (e.source === sourceNodeId && e.target === safeDefaultTarget && e.sourceHandle === sourceHandle)
                )!
              : {
                  id: edgeId,
                  source: sourceNodeId,
                  target: safeDefaultTarget,
                  sourceHandle,
                  type: 'default',
                  markerEnd: { type: MarkerType.ArrowClosed },
                }
          );
        }

        return nextEdges;
      });
    },
    [setEdges, sourceNodeId]
  );
};

const DecisionNodeForm: React.FC<DecisionNodeFormProps> = ({ form, selectedNode, setIsDrawerOpen }) => {
  const { getNodes } = useReactFlow();
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
  const syncEdgesWithBranches = useBranchEdgeSync(selectedNode.id);

  // Auto-sync edges when form fields change (live feedback without waiting for save)
  useEffect(() => {
    syncEdgesWithBranches({ defaultTarget, branches });
  }, [defaultTarget, branches, syncEdgesWithBranches]);

  return (
    <BaseNodeForm
      form={form}
      selectedNode={selectedNode}
      setIsDrawerOpen={setIsDrawerOpen}
      onSaveSuccess={syncEdgesWithBranches}
    >
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
