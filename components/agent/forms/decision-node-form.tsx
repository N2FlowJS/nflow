import { usePredecessorNodes } from '@/components/agent/hooks/usePredecessorNodes';
import { BeginForm, DecisionBranch, DecisionNodeData, FlowNode } from '@/models/flowTypes';
import { DeleteOutlined, LinkOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Edge, MarkerType, useReactFlow } from '@xyflow/react'; // Import Edge type
import { Button, Card, Form, Input, Radio, Select, Space, Tooltip, Typography, Collapse } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';

const { Text } = Typography;
const { Panel } = Collapse;

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
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DecisionNodeForm: React.FC<DecisionNodeFormProps> = ({ form, selectedNode, setIsDrawerOpen }) => {
  const { getNodes, getEdges, setEdges } = useReactFlow();
  const flowNodes = getNodes().filter((node) => node.id !== selectedNode.id);
  const { predecessorNodes } = usePredecessorNodes(selectedNode.id);

  // Use Form.useWatch for form fields
  const defaultTarget = Form.useWatch('defaultTarget', form);
  const branches = Form.useWatch('branches', form) || [];

  // Get all available variables from predecessor nodes
  const getAvailableVariables = () => {
    const variables: { label: string; value: string; category: string }[] = [];

    // Add variables from begin nodes
    predecessorNodes
      .filter((node) => node.type === 'begin')
      .forEach((node) => {
        const nodeVars = (node.data?.form as BeginForm)?.variables || [];
        nodeVars.forEach((v: any) => {
          variables.push({
            label: v.name,
            value: v.name,
            category: `${node.data?.form?.name || node.id} (Variables)`,
          });
        });
      });

    return variables;
  };

  const availableVariables = getAvailableVariables();

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
      <Collapse defaultActiveKey={['branches', 'defaultTarget']} bordered={false} expandIconPosition="end" className="form-collapse">
        <Panel
          header={
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                <LinkOutlined /> Default Target Node (when no branches match):
              </Text>
            </div>
          }
          key="defaultTarget">
          <Form.Item key={'defaultTarget'} name="defaultTarget" initialValue={defaultTarget}>
            <Select
              allowClear
              placeholder="Select default target node"
              style={{ width: '100%' }}
              options={flowNodes.map((node) => ({
                value: node.id,
                label: (node.data?.form as any)?.name || node.id,
              }))}
              optionFilterProp="label"
              showSearch
            />
          </Form.Item>
        </Panel>
        <Panel header="Branches" key="branches">
          <Form.List name="branches" initialValue={branches}>
            {(branchFields, { add: addBranch, remove: removeBranch }) => (
              <Space direction="vertical" style={{ width: '100%' }}>
                {branchFields.map((branchField, _) => (
                  <Card
                    key={branchField.key}
                    title={
                      <Space>
                        <Form.Item {...branchField} name={[branchField.name, 'name']} noStyle>
                          <Input placeholder="Branch name" style={{ width: 200 }} />
                        </Form.Item>
                        <Tooltip title="Give this branch a meaningful name">
                          <QuestionCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    extra={branchFields.length > 1 && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeBranch(branchField.name)} />}>
                    <Form.Item name={[branchField.name, 'groupOperator']} initialValue="OR">
                      <Radio.Group buttonStyle="solid" size="small">
                        <Radio.Button value="AND">Match ALL groups (AND)</Radio.Button>
                        <Radio.Button value="OR">Match ANY group (OR)</Radio.Button>
                      </Radio.Group>
                    </Form.Item>

                    <Form.List name={[branchField.name, 'groups']}>
                      {(groupFields, { add: addGroup, remove: removeGroup }) => (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {groupFields.map((groupField, groupIndex) => (
                            <Card key={groupField.key} size="small" title={`Group ${groupIndex + 1}`} extra={groupFields.length > 1 && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeGroup(groupField.name)} />}>
                              <Form.Item name={[groupField.name, 'logicalOperator']} initialValue="AND">
                                <Radio.Group buttonStyle="solid" size="small">
                                  <Radio.Button value="AND">ALL conditions (AND)</Radio.Button>
                                  <Radio.Button value="OR">ANY condition (OR)</Radio.Button>
                                </Radio.Group>
                              </Form.Item>

                              <Form.List name={[groupField.name, 'conditions']}>
                                {(conditionFields, { add: addCondition, remove: removeCondition }) => (
                                  <Space direction="vertical" style={{ width: '100%' }}>
                                    {conditionFields.map((condField, condIndex) => (
                                      <Card key={condField.key} size="small" bordered={false}>
                                        <Space align="baseline">
                                          <Form.Item {...condField} name={[condField.name, 'input']} rules={[{ required: true }]}>
                                            <Select showSearch placeholder="Select variable" style={{ width: 200 }} options={availableVariables} optionFilterProp="label" />
                                          </Form.Item>
                                          <Form.Item {...condField} name={[condField.name, 'operator']} rules={[{ required: true }]}>
                                            <Select options={OPERATORS} style={{ width: 100 }} />
                                          </Form.Item>
                                          <Form.Item {...condField} name={[condField.name, 'value']} rules={[{ required: true }]}>
                                            <Input placeholder="Value" style={{ width: 120 }} />
                                          </Form.Item>
                                          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeCondition(condField.name)} />
                                        </Space>
                                      </Card>
                                    ))}
                                    <Button type="dashed" onClick={() => addCondition()} icon={<PlusOutlined />}>
                                      Add Condition
                                    </Button>
                                  </Space>
                                )}
                              </Form.List>
                            </Card>
                          ))}
                          <Button type="dashed" onClick={() => addGroup()} icon={<PlusOutlined />}>
                            Add Condition Group
                          </Button>
                        </Space>
                      )}
                    </Form.List>

                    <Form.Item label={<div>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                        <LinkOutlined /> Target Node:
                      </Text>
                    </div>} name={[branchField.name, 'targetNode']} style={{ marginTop: 16 }}>


                      <Select
                        allowClear
                        placeholder="Select target node"
                        style={{ width: '100%' }}
                        options={flowNodes.map((node) => ({
                          value: node.id,
                          label: (node.data?.form as any)?.name || node.id,
                        }))}
                        optionFilterProp="label"
                        showSearch
                      />
                    </Form.Item>
                  </Card>
                ))}

                <Button type="dashed" onClick={() => addBranch({ name: `Branch ${branchFields.length + 1}`, conditions: [] })} block icon={<PlusOutlined />}>
                  Add Branch
                </Button>
              </Space>
            )}
          </Form.List>
        </Panel>
      </Collapse>
    </BaseNodeForm>
  );
};

export default DecisionNodeForm;
