import { TwitterOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert, InputNumber } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { TextArea } = Input;
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
                <Form.Item
                  name="apiKey"
                  label="API Key"
                  rules={[{ required: true, message: 'Please enter Twitter API key' }]}
                >
                  <Input.Password placeholder="Your Twitter API key" />
                </Form.Item>
                <Form.Item
                  name="apiSecret"
                  label="API Secret"
                  rules={[{ required: true, message: 'Please enter Twitter API secret' }]}
                >
                  <Input.Password placeholder="Your Twitter API secret" />
                </Form.Item>
                <Form.Item
                  name="accessToken"
                  label="Access Token"
                  rules={[{ required: true, message: 'Please enter access token' }]}
                >
                  <Input.Password placeholder="Your access token" />
                </Form.Item>
                <Form.Item
                  name="accessTokenSecret"
                  label="Access Token Secret"
                  rules={[{ required: true, message: 'Please enter access token secret' }]}
                >
                  <Input.Password placeholder="Your access token secret" />
                </Form.Item>
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
              <Form.Item
                name="action"
                label="Action Type"
                help="Choose what Twitter operation to perform"
                initialValue="create_tweet"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Select>
                  <Select.Option value="create_tweet">Create Tweet</Select.Option>
                  <Select.Option value="get_tweets">Get Tweets</Select.Option>
                  <Select.Option value="get_user_info">Get User Info</Select.Option>
                  <Select.Option value="follow_user">Follow User</Select.Option>
                  <Select.Option value="like_tweet">Like Tweet</Select.Option>
                  <Select.Option value="retweet">Retweet</Select.Option>
                  <Select.Option value="get_mentions">Get Mentions</Select.Option>
                </Select>
              </Form.Item>
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
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const action = getFieldValue('action');
                  
                  return (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {action === 'create_tweet' && (
                        <Form.Item
                          name="tweetText"
                          label="Tweet Text"
                          help="Content of the tweet (max 280 characters)"
                          rules={[
                            { required: true, message: 'Please enter tweet text' },
                            { max: 280, message: 'Tweet cannot exceed 280 characters' }
                          ]}
                        >
                          <TextArea
                            rows={4}
                            placeholder="{{tweetContent}} or your tweet text..."
                            showCount
                            maxLength={280}
                          />
                        </Form.Item>
                      )}
                      
                      {(action === 'get_tweets' || action === 'get_mentions') && (
                        <>
                          <Form.Item
                            name="username"
                            label="Username"
                            help="Twitter username (without @)"
                          >
                            <Input placeholder="username" />
                          </Form.Item>
                          <Form.Item
                            name="maxResults"
                            label="Max Results"
                            help="Maximum number of tweets to retrieve"
                            initialValue={10}
                          >
                            <InputNumber min={1} max={100} style={{ width: '100%' }} />
                          </Form.Item>
                        </>
                      )}
                      
                      {action === 'get_user_info' && (
                        <Form.Item
                          name="username"
                          label="Username"
                          help="Twitter username to get information about"
                          rules={[{ required: true, message: 'Please enter username' }]}
                        >
                          <Input placeholder="username" />
                        </Form.Item>
                      )}
                      
                      {action === 'follow_user' && (
                        <Form.Item
                          name="userId"
                          label="User ID"
                          help="Twitter user ID to follow"
                          rules={[{ required: true, message: 'Please enter user ID' }]}
                        >
                          <Input placeholder="123456789" />
                        </Form.Item>
                      )}
                      
                      {(action === 'like_tweet' || action === 'retweet') && (
                        <Form.Item
                          name="tweetId"
                          label="Tweet ID"
                          help="ID of the tweet to interact with"
                          rules={[{ required: true, message: 'Please enter tweet ID' }]}
                        >
                          <Input placeholder="1234567890123456789" />
                        </Form.Item>
                      )}
                      
                      {action === 'get_tweets' && (
                        <Form.Item
                          name="query"
                          label="Search Query (Optional)"
                          help="Search query to filter tweets"
                        >
                          <Input placeholder="hashtag OR keyword" />
                        </Form.Item>
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
