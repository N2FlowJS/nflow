import { FontSizeOutlined, SettingOutlined, CodeOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { TextArea } = Input;
const { Text } = Typography;

interface TextProcessNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TextProcessNodeForm: React.FC<TextProcessNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Text Process Node"
        description="Process and manipulate text strings with various operations like uppercase, lowercase, trim, replace, split, join, regex, and length."
        type="info"
        showIcon
        icon={<FontSizeOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['input', 'operation', 'parameters']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'input',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Input Configuration
              </Text>
            ),
            children: (
              <Form.Item
                name="inputText"
                label="Input Text"
                help="Text to process. Use {{variableName}} syntax to reference variables from previous nodes."
                rules={[{ required: true, message: 'Please specify the input text' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="{{textInput}} or direct text"
                />
              </Form.Item>
            ),
          },
          {
            key: 'operation',
            label: (
              <Text strong>
                <FontSizeOutlined style={{ marginRight: 8 }} />
                Text Operation
              </Text>
            ),
            children: (
              <Form.Item
                name="operation"
                label="Operation Type"
                help="Choose the text processing operation to perform"
                initialValue="trim"
                rules={[{ required: true, message: 'Please select an operation' }]}
              >
                <Select>
                  <Select.Option value="uppercase">Uppercase - Convert to UPPERCASE</Select.Option>
                  <Select.Option value="lowercase">Lowercase - Convert to lowercase</Select.Option>
                  <Select.Option value="trim">Trim - Remove leading/trailing spaces</Select.Option>
                  <Select.Option value="replace">Replace - Replace text patterns</Select.Option>
                  <Select.Option value="split">Split - Split text into array</Select.Option>
                  <Select.Option value="join">Join - Join array into text</Select.Option>
                  <Select.Option value="regex">Regex - Extract using regex pattern</Select.Option>
                  <Select.Option value="length">Length - Get text length</Select.Option>
                </Select>
              </Form.Item>
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <CodeOutlined style={{ marginRight: 8 }} />
                Operation Parameters
              </Text>
            ),
            children: (
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const operation = getFieldValue('operation');
                  
                  return (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {operation === 'replace' && (
                        <>
                          <Form.Item
                            name="searchValue"
                            label="Search Value"
                            help="Text to search for"
                            rules={[{ required: true, message: 'Please enter search value' }]}
                          >
                            <Input placeholder="Text to find" />
                          </Form.Item>
                          <Form.Item
                            name="replaceValue"
                            label="Replace Value"
                            help="Text to replace with (can be empty)"
                          >
                            <Input placeholder="Replacement text" />
                          </Form.Item>
                        </>
                      )}
                      
                      {operation === 'split' && (
                        <Form.Item
                          name="separator"
                          label="Separator"
                          help="Character or string to split on"
                          rules={[{ required: true, message: 'Please enter separator' }]}
                        >
                          <Input placeholder="," />
                        </Form.Item>
                      )}
                      
                      {operation === 'join' && (
                        <Form.Item
                          name="separator"
                          label="Separator"
                          help="Character or string to join with"
                          initialValue=","
                        >
                          <Input placeholder="," />
                        </Form.Item>
                      )}
                      
                      {operation === 'regex' && (
                        <>
                          <Form.Item
                            name="regexPattern"
                            label="Regex Pattern"
                            help="Regular expression pattern to match"
                            rules={[{ required: true, message: 'Please enter regex pattern' }]}
                          >
                            <Input placeholder="[a-zA-Z0-9]+" />
                          </Form.Item>
                          <Form.Item
                            name="regexFlags"
                            label="Regex Flags"
                            help="Regex flags (g, i, m, etc.)"
                            initialValue="g"
                          >
                            <Input placeholder="g" />
                          </Form.Item>
                        </>
                      )}
                      
                      {!['replace', 'split', 'join', 'regex'].includes(operation) && (
                        <Alert
                          message="No additional parameters needed"
                          description="This operation doesn't require additional parameters."
                          type="info"
                        />
                      )}
                    </Space>
                  );
                }}
              </Form.Item>
            ),
          },
        ]}
      />

      <Alert
        message="Usage Examples"
        description={
          <div>
            <p><strong>Uppercase:</strong> Convert &quot;hello world&quot; to &quot;HELLO WORLD&quot;</p>
            <p><strong>Split:</strong> Split &quot;apple,banana,cherry&quot; by &quot;,&quot; into array</p>
            <p><strong>Replace:</strong> Replace &quot;old&quot; with &quot;new&quot; in text</p>
            <p><strong>Regex:</strong> Extract email addresses or phone numbers</p>
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

export default TextProcessNodeForm;
