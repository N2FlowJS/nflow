import { BranchesOutlined, SettingOutlined, CodeTwoTone } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { TextArea } = Input;
const { Text } = Typography;

interface ConditionNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConditionNodeForm: React.FC<ConditionNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Condition Node"
        description="Compare values and return different results based on the condition. Perfect for simple if-then logic in your flows."
        type="info"
        showIcon
        icon={<BranchesOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['comparison', 'results', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'comparison',
            label: (
              <Text strong>
                <CodeTwoTone style={{ marginRight: 8 }} />
                Comparison Configuration
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="leftValue"
                  label="Left Value"
                  help="First value to compare. Use {{variableName}} syntax to reference variables from previous nodes."
                  rules={[{ required: true, message: 'Please specify the left value' }]}
                >
                  <Input placeholder="{{value1}}" />
                </Form.Item>

                <Form.Item
                  name="operator"
                  label="Comparison Operator"
                  help="How to compare the left and right values"
                  initialValue="equals"
                  rules={[{ required: true, message: 'Please select an operator' }]}
                >
                  <Select>
                    <Select.Option value="equals">Equals (=)</Select.Option>
                    <Select.Option value="notEquals">Not Equals (≠)</Select.Option>
                    <Select.Option value="greaterThan">Greater Than (&gt;)</Select.Option>
                    <Select.Option value="lessThan">Less Than (&lt;)</Select.Option>
                    <Select.Option value="contains">Contains</Select.Option>
                    <Select.Option value="startsWith">Starts With</Select.Option>
                    <Select.Option value="endsWith">Ends With</Select.Option>
                    <Select.Option value="regex">Regex Match</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="rightValue"
                  label="Right Value"
                  help="Second value to compare against. Use {{variableName}} syntax to reference variables."
                  rules={[{ required: true, message: 'Please specify the right value' }]}
                >
                  <Input placeholder="{{value2}} or direct value" />
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'results',
            label: (
              <Text strong>
                <BranchesOutlined style={{ marginRight: 8 }} />
                Result Values
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="trueValue"
                  label="True Result"
                  help="Value to return when the condition is true"
                  rules={[{ required: true, message: 'Please specify the true result' }]}
                  initialValue="Success"
                >
                  <TextArea
                    rows={3}
                    placeholder="Value when condition is true"
                  />
                </Form.Item>

                <Form.Item
                  name="falseValue"
                  label="False Result"
                  help="Value to return when the condition is false"
                  rules={[{ required: true, message: 'Please specify the false result' }]}
                  initialValue="Failed"
                >
                  <TextArea
                    rows={3}
                    placeholder="Value when condition is false"
                  />
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'settings',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Data Type Settings
              </Text>
            ),
            children: (
              <Form.Item
                name="dataType"
                label="Data Type"
                help="How to interpret the values for comparison"
                initialValue="string"
              >
                <Select>
                  <Select.Option value="string">String (Text)</Select.Option>
                  <Select.Option value="number">Number</Select.Option>
                  <Select.Option value="boolean">Boolean (true/false)</Select.Option>
                  <Select.Option value="date">Date</Select.Option>
                </Select>
              </Form.Item>
            ),
          },
        ]}
      />

      <Alert
        message="Usage Examples"
        description={
          <div>
            <p><strong>Text comparison:</strong> Check if user input contains &quot;help&quot;</p>
            <p><strong>Number comparison:</strong> Compare scores or counts</p>
            <p><strong>Status checks:</strong> Route based on previous node results</p>
          </div>
        }
        type="info"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default ConditionNodeForm;
