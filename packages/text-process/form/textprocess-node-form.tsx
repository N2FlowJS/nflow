import { FontSizeOutlined, SettingOutlined, CodeOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Collapse, Space, Typography, Alert } from 'antd';
import TextInputField from '../../@input/TextInputField';
import TextAreaField from '../../@input/TextAreaField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
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
              <TextAreaField
                name="inputText"
                label="Input Text"
                required
                rows={3}
                placeholder="{{textInput}} or direct text"
              />
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
              <DropdownField
                name="operation"
                label="Operation Type"
                required
                options={[
                  { label: 'Uppercase - Convert to UPPERCASE', value: 'uppercase' },
                  { label: 'Lowercase - Convert to lowercase', value: 'lowercase' },
                  { label: 'Trim - Remove leading/trailing spaces', value: 'trim' },
                  { label: 'Replace - Replace text patterns', value: 'replace' },
                  { label: 'Split - Split text into array', value: 'split' },
                  { label: 'Join - Join array into text', value: 'join' },
                  { label: 'Regex - Extract using regex pattern', value: 'regex' },
                  { label: 'Length - Get text length', value: 'length' }
                ]}
              />
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
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <TextInputField
                  name="searchValue"
                  label="Search Value"
                  placeholder="Text to find"
                />
                <TextInputField
                  name="replaceValue"
                  label="Replace Value"
                  placeholder="Replacement text"
                />
                <TextInputField
                  name="separator"
                  label="Separator"
                  placeholder=","
                />
                <TextInputField
                  name="regexPattern"
                  label="Regex Pattern"
                  placeholder="[a-zA-Z0-9]+"
                />
                <TextInputField
                  name="regexFlags"
                  label="Regex Flags"
                  placeholder="g"
                />
              </Space>
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
