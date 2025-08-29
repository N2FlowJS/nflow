import { TwitterOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Collapse, Space, Typography, Alert } from 'antd';
import TextInputField from '../../@input/TextInputField';
import TextAreaField from '../../@input/TextAreaField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';
const { Text } = Typography;

interface TwitterNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TwitterNodeForm: React.FC<TwitterNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Twitter Node"
        description="Interact with Twitter API for tweets, user data, and social media analytics. Requires Twitter API credentials."
        type="info"
        showIcon
        icon={<TwitterOutlined />}
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
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <TextInputField
                  name="apiKey"
                  label="API Key"
                  required
                  type="password"
                  placeholder="Your Twitter API key"
                />
                <TextInputField
                  name="apiSecret"
                  label="API Secret"
                  required
                  type="password"
                  placeholder="Your Twitter API secret"
                />
                <TextInputField
                  name="accessToken"
                  label="Access Token"
                  required
                  type="password"
                  placeholder="Your access token"
                />
                <TextInputField
                  name="accessTokenSecret"
                  label="Access Token Secret"
                  required
                  type="password"
                  placeholder="Your access token secret"
                />
              </Space>
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
                  { label: 'Create Tweet', value: 'create_tweet' },
                  { label: 'Get Tweets', value: 'get_tweets' },
                  { label: 'Get User Info', value: 'get_user_info' },
                  { label: 'Follow User', value: 'follow_user' },
                  { label: 'Like Tweet', value: 'like_tweet' },
                  { label: 'Retweet', value: 'retweet' },
                  { label: 'Get Mentions', value: 'get_mentions' }
                ]}
              />
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <TwitterOutlined style={{ marginRight: 8 }} />
                Action Parameters
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <TextAreaField
                  name="tweetText"
                  label="Tweet Text"
                  rows={4}
                  placeholder="{{tweetContent}} or your tweet text..."
                />
                <TextInputField
                  name="username"
                  label="Username"
                  placeholder="username"
                />
                <TextInputField
                  name="maxResults"
                  label="Max Results"
                  type="number"
                  placeholder="10"
                />
                <TextInputField
                  name="userId"
                  label="User ID"
                  placeholder="123456789"
                />
                <TextInputField
                  name="tweetId"
                  label="Tweet ID"
                  placeholder="1234567890123456789"
                />
                <TextInputField
                  name="query"
                  label="Search Query (Optional)"
                  placeholder="hashtag OR keyword"
                />
              </Space>
            ),
          },
        ]}
      />

      <Alert
        message="API Usage Note"
        description="Make sure you have appropriate Twitter API access level for your intended operations. Some actions require elevated access."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default TwitterNodeForm;
