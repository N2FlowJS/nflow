import { ClockCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, InputNumber, Select, Collapse, Space, Typography, Alert } from 'antd';
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
        description="Add a time delay in flow execution. Useful for throttling, waiting for external processes, or rate limiting."
        type="info"
        showIcon
        icon={<ClockCircleOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['timing']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'timing',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Timing Configuration
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="duration"
                  label="Delay Duration"
                  help="How long to wait before continuing execution"
                  rules={[
                    { required: true, message: 'Please specify the delay duration' },
                    { type: 'number', min: 1, max: 3600, message: 'Duration must be between 1 and 3600' }
                  ]}
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
                  help="Unit of time for the delay duration"
                  initialValue="seconds"
                  rules={[{ required: true, message: 'Please select a time unit' }]}
                >
                  <Select>
                    <Select.Option value="seconds">Seconds</Select.Option>
                    <Select.Option value="minutes">Minutes</Select.Option>
                    <Select.Option value="hours">Hours</Select.Option>
                  </Select>
                </Form.Item>
              </Space>
            ),
          },
        ]}
      />

      <Alert
        message="Timing Limits"
        description="Maximum delay is 1 hour (3600 seconds) for system stability. For longer delays, consider using multiple delay nodes."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default DelayNodeForm;
