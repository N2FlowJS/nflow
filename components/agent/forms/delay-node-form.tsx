import { ClockCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, InputNumber, Select, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from './shared/InputReferences';
import RoleSelector from './shared/RoleSelector';
import { useLocale } from '../../../locale';

const { Text } = Typography;

interface DelayNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DelayNodeForm: React.FC<DelayNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Delay Node"
        description="Add a pause in flow execution. Useful for rate limiting, waiting for external processes, or creating timed sequences."
        type="info"
        showIcon
        icon={<ClockCircleOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text strong>
            <SettingOutlined style={{ marginRight: 8 }} />
            Delay Configuration
          </Text>
        </div>

        <Form.Item
          name="duration"
          label="Duration"
          help="How long to wait before continuing"
          rules={[{ required: true, message: 'Please enter delay duration' }]}
          initialValue={5}
        >
          <InputNumber
            min={1}
            max={3600}
            style={{ width: '100%' }}
            placeholder="5"
          />
        </Form.Item>

        <Form.Item
          name="unit"
          label="Time Unit"
          initialValue="seconds"
        >
          <Select>
            <Select.Option value="seconds">Seconds</Select.Option>
            <Select.Option value="minutes">Minutes</Select.Option>
            <Select.Option value="hours">Hours</Select.Option>
          </Select>
        </Form.Item>

        <Alert
          message="Usage Note"
          description="The delay will pause execution for all users. Use sparingly in production flows."
          type="warning"
          showIcon
        />
      </Space>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default DelayNodeForm;
