import { LinkedinOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
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

interface LinkedInNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const LinkedInNodeForm: React.FC<LinkedInNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="LinkedIn Node"
        description="Interact with LinkedIn API for professional networking, posts, and company data. Requires LinkedIn API access."
        type="info"
        showIcon
        icon={<LinkedinOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['api', 'action', 'parameters']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'api',
            label: (
              <Text strong>
                <KeyOutlined style={{ marginRight: 8 }} />
                API Configuration
              </Text>
            ),
            children: (
              <TextInputField
                name="accessToken"
                label="Access Token"
                required
                type="password"
                placeholder="Your LinkedIn API access token"
              />
            ),
          },
          {
            key: 'action',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Action Configuration
              </Text>
            ),
            children: (
              <DropdownField
                name="action"
                label="Action Type"
                required
                options={[
                  { label: 'Create Post', value: 'create_post' },
                  { label: 'Get Profile', value: 'get_profile' },
                  { label: 'Get Company Info', value: 'get_company_info' },
                  { label: 'Create Article', value: 'create_article' },
                  { label: 'Get Connections', value: 'get_connections' }
                ]}
              />
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <LinkedinOutlined style={{ marginRight: 8 }} />
                Action Parameters
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <TextAreaField
                  name="postText"
                  label="Post Content"
                  rows={4}
                  placeholder="{{linkedinPost}} or your post content..."
                />
                <DropdownField
                  name="visibility"
                  label="Post Visibility"
                  options={[
                    { label: 'Public', value: 'public' },
                    { label: 'Connections Only', value: 'connections' }
                  ]}
                />
                <TextInputField
                  name="mediaUrl"
                  label="Media URL (Optional)"
                  placeholder="https://example.com/image.jpg"
                />
                <TextInputField
                  name="articleTitle"
                  label="Article Title"
                  placeholder="{{articleTitle}} or article title"
                />
                <TextAreaField
                  name="articleContent"
                  label="Article Content"
                  rows={6}
                  placeholder="{{articleContent}} or article content..."
                />
                <TextInputField
                  name="companyId"
                  label="Company ID"
                  placeholder="12345678"
                />
                <TextInputField
                  name="personId"
                  label="Person ID (Optional)"
                  placeholder="LinkedIn person ID"
                />
              </Space>
            ),
          },
        ]}
      />

      <Alert
        message="API Access Note"
        description="LinkedIn API requires application approval and specific permissions. Make sure your app has the required scopes for the operations you want to perform."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default LinkedInNodeForm;
