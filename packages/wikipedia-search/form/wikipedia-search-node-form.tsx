import { GlobalOutlined, SettingOutlined, SearchOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Collapse, Space, Typography, Alert } from 'antd';
import TextInputField from '../../@input/TextInputField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { Text } = Typography;

interface WikipediaSearchNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const WikipediaSearchNodeForm: React.FC<WikipediaSearchNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Wikipedia Search Node"
        description="Search Wikipedia for information and return articles with summaries and URLs."
        type="info"
        showIcon
        icon={<GlobalOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['query', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'query',
            label: (
              <Text strong>
                <SearchOutlined style={{ marginRight: 8 }} />
                Search Query
              </Text>
            ),
            children: (
              <TextInputField
                name="query"
                label="Search Query"
                required
                placeholder="{{searchTerm}} or direct search query"
              />
            ),
          },
          {
            key: 'settings',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Search Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <TextInputField
                  name="maxResults"
                  label="Maximum Results"
                  type="number"
                  placeholder="5"
                />

                <DropdownField
                  name="language"
                  label="Wikipedia Language"
                  options={[
                    { label: 'English (en)', value: 'en' },
                    { label: 'Spanish (es)', value: 'es' },
                    { label: 'French (fr)', value: 'fr' },
                    { label: 'German (de)', value: 'de' },
                    { label: 'Italian (it)', value: 'it' },
                    { label: 'Portuguese (pt)', value: 'pt' },
                    { label: 'Russian (ru)', value: 'ru' },
                    { label: 'Japanese (ja)', value: 'ja' },
                    { label: 'Chinese (zh)', value: 'zh' },
                    { label: 'Arabic (ar)', value: 'ar' }
                  ]}
                />

                <DropdownField
                  name="summaryOnly"
                  label="Summary Only"
                  options={[
                    { label: 'Yes', value: 'true' },
                    { label: 'No', value: 'false' }
                  ]}
                />
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

export default WikipediaSearchNodeForm;
