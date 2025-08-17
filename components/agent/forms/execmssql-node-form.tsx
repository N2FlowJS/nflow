import { DatabaseOutlined, CodeOutlined, SecurityScanOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, InputNumber, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { TextArea } = Input;
const { Text } = Typography;

interface ExecMssqlNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ExecMssqlNodeForm: React.FC<ExecMssqlNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Microsoft SQL Server Execution Node"
        description="Execute T-SQL queries against a Microsoft SQL Server database and return results for further processing."
        type="info"
        showIcon
        icon={<DatabaseOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['connection', 'query', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'connection',
            label: (
              <Text strong>
                <SecurityScanOutlined style={{ marginRight: 8 }} />
                Database Connection
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="server"
                  label="Server Host"
                  rules={[{ required: true, message: 'Please enter server host' }]}
                >
                  <Input placeholder="localhost or server instance" />
                </Form.Item>

                <Form.Item
                  name="port"
                  label="Port"
                  rules={[{ required: true, message: 'Please enter port number' }]}
                  initialValue={1433}
                >
                  <InputNumber
                    min={1}
                    max={65535}
                    style={{ width: '100%' }}
                    placeholder="1433"
                  />
                </Form.Item>

                <Form.Item
                  name="database"
                  label="Database Name"
                  rules={[{ required: true, message: 'Please enter database name' }]}
                >
                  <Input placeholder="Database name" />
                </Form.Item>

                <Form.Item
                  name="user"
                  label="Username"
                  rules={[{ required: true, message: 'Please enter username' }]}
                >
                  <Input placeholder="SQL Server username" />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: 'Please enter password' }]}
                >
                  <Input.Password placeholder="SQL Server password" />
                </Form.Item>

                <Form.Item
                  name="trustServerCertificate"
                  label="Trust Server Certificate"
                  help="Enable for development environments with self-signed certificates"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'query',
            label: (
              <Text strong>
                <CodeOutlined style={{ marginRight: 8 }} />
                T-SQL Query
              </Text>
            ),
            children: (
              <Form.Item
                name="query"
                label="T-SQL Query"
                help="Enter your T-SQL query. Use variables from previous nodes with {{variableName}} syntax."
                rules={[
                  { required: true, message: 'Please enter T-SQL query' },
                  { min: 10, message: 'Query must be at least 10 characters long' }
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="SELECT * FROM users WHERE id = {{userId}}"
                  style={{ fontFamily: 'monospace' }}
                />
              </Form.Item>
            ),
          },
          {
            key: 'settings',
            label: (
              <Text strong>
                <DatabaseOutlined style={{ marginRight: 8 }} />
                Execution Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="timeout"
                  label="Query Timeout (seconds)"
                  help="Maximum time to wait for query execution"
                  initialValue={30}
                >
                  <InputNumber
                    min={5}
                    max={300}
                    style={{ width: '100%' }}
                    placeholder="30"
                  />
                </Form.Item>

                <Form.Item
                  name="maxRows"
                  label="Maximum Rows"
                  help="Maximum number of rows to return from the query"
                  initialValue={100}
                >
                  <InputNumber
                    min={1}
                    max={10000}
                    style={{ width: '100%' }}
                    placeholder="100"
                  />
                </Form.Item>
              </Space>
            ),
          },
        ]}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default ExecMssqlNodeForm;
