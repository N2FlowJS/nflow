import { YoutubeOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Collapse, Space, Typography, Alert } from 'antd';
import TextInputField from '../../@input/TextInputField';
import TextAreaField from '../../@input/TextAreaField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

// ...existing code...
const { Text } = Typography;

interface YouTubeNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const YouTubeNodeForm: React.FC<YouTubeNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="YouTube Node"
        description="Interact with YouTube Data API v3 for video management, channel analytics, and content operations."
        type="info"
        showIcon
        icon={<YoutubeOutlined />}
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
                name="apiKey"
                label="YouTube API Key"
                required
                type="password"
                placeholder="Your YouTube Data API v3 key"
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
                  { label: 'Get Videos', value: 'get_videos' },
                  { label: 'Get Channel Info', value: 'get_channel_info' },
                  { label: 'Create Playlist', value: 'create_playlist' },
                  { label: 'Get Comments', value: 'get_comments' },
                  { label: 'Get Analytics', value: 'get_analytics' }
                ]}
              />
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <YoutubeOutlined style={{ marginRight: 8 }} />
                Action Parameters
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {/* Always show all fields for simplicity. For conditional, use form logic. */}
                <TextInputField
                  name="videoFile"
                  label="Video File Path"
                  placeholder="/path/to/video.mp4"
                />
                <TextInputField
                  name="title"
                  label="Video Title"
                  placeholder="{{videoTitle}} or video title"
                />
                <TextAreaField
                  name="videoDescription"
                  label="Video Description"
                  rows={4}
                  placeholder="{{videoDescription}} or video description..."
                />
                <DropdownField
                  name="privacy"
                  label="Privacy Status"
                  options={[
                    { label: 'Public', value: 'public' },
                    { label: 'Private', value: 'private' },
                    { label: 'Unlisted', value: 'unlisted' }
                  ]}
                />
                <TextInputField
                  name="channelId"
                  label="Channel ID"
                  placeholder="UCChannelId123"
                />
                <TextInputField
                  name="playlistTitle"
                  label="Playlist Title"
                  placeholder="{{playlistTitle}} or playlist title"
                />
                <TextAreaField
                  name="playlistDescription"
                  label="Playlist Description"
                  rows={3}
                  placeholder="Playlist description..."
                />
                <TextInputField
                  name="videoId"
                  label="Video ID"
                  placeholder="dQw4w9WgXcQ"
                />
              </Space>
            ),
          },
        ]}
      />

      <Alert
        message="API Quota Note"
        description="YouTube Data API has daily quota limits. Monitor your usage in Google Cloud Console to avoid exceeding limits."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default YouTubeNodeForm;
