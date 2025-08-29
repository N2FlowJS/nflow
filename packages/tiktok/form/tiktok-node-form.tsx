import { CustomerServiceOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
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

interface TikTokNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TikTokNodeForm: React.FC<TikTokNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="TikTok Node"
        description="Interact with TikTok for Developers API for video content, user data, and hashtag analytics."
        type="info"
        showIcon
        icon={<CustomerServiceOutlined />}
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
                placeholder="Your TikTok for Developers access token"
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
                  { label: 'Upload Video', value: 'upload_video' },
                  { label: 'Get User Info', value: 'get_user_info' },
                  { label: 'Get Videos', value: 'get_videos' },
                  { label: 'Get Hashtag Videos', value: 'get_hashtag_videos' }
                ]}
              />
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <CustomerServiceOutlined style={{ marginRight: 8 }} />
                Action Parameters
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <TextInputField
                  name="videoFile"
                  label="Video File Path"
                  placeholder="/path/to/video.mp4"
                />
                <TextAreaField
                  name="caption"
                  label="Caption"
                  rows={3}
                  placeholder="{{tikTokCaption}} or video caption..."
                />
                <DropdownField
                  name="privacy"
                  label="Privacy Setting"
                  options={[
                    { label: 'Public', value: 'public' },
                    { label: 'Friends Only', value: 'friends' },
                    { label: 'Private', value: 'private' }
                  ]}
                />
                <TextInputField
                  name="userId"
                  label="User ID"
                  placeholder="TikTok user ID"
                />
                <TextInputField
                  name="maxResults"
                  label="Max Results"
                  type="number"
                  placeholder="10"
                />
                <TextInputField
                  name="hashtag"
                  label="Hashtag"
                  placeholder="trending"
                />
              </Space>
            ),
          },
        ]}
      />

      <Alert
        message="API Access Requirements"
        description="TikTok for Developers API requires app approval and has strict content policies. Make sure your use case complies with TikTok's terms of service."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default TikTokNodeForm;
