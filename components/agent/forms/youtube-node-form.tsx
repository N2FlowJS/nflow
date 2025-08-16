import { YoutubeOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { TextArea } = Input;
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
              <Form.Item
                name="apiKey"
                label="YouTube API Key"
                rules={[{ required: true, message: 'Please enter YouTube API key' }]}
              >
                <Input.Password placeholder="Your YouTube Data API v3 key" />
              </Form.Item>
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
                help="Choose what YouTube operation to perform"
                initialValue="get_videos"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Select>
                  <Select.Option value="upload_video">Upload Video</Select.Option>
                  <Select.Option value="get_videos">Get Videos</Select.Option>
                  <Select.Option value="get_channel_info">Get Channel Info</Select.Option>
                  <Select.Option value="create_playlist">Create Playlist</Select.Option>
                  <Select.Option value="get_comments">Get Comments</Select.Option>
                  <Select.Option value="get_analytics">Get Analytics</Select.Option>
                </Select>
              </Form.Item>
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
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const action = getFieldValue('action');
                  
                  return (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {action === 'upload_video' && (
                        <>
                          <Form.Item
                            name="videoFile"
                            label="Video File Path"
                            help="Path to the video file to upload"
                            rules={[{ required: true, message: 'Please enter video file path' }]}
                          >
                            <Input placeholder="/path/to/video.mp4" />
                          </Form.Item>
                          <Form.Item
                            name="title"
                            label="Video Title"
                            help="Title of the video"
                            rules={[{ required: true, message: 'Please enter video title' }]}
                          >
                            <Input placeholder="{{videoTitle}} or video title" />
                          </Form.Item>
                          <Form.Item
                            name="videoDescription"
                            label="Video Description"
                            help="Description of the video"
                          >
                            <TextArea
                              rows={4}
                              placeholder="{{videoDescription}} or video description..."
                            />
                          </Form.Item>
                          <Form.Item
                            name="privacy"
                            label="Privacy Status"
                            help="Video privacy setting"
                            initialValue="private"
                          >
                            <Select>
                              <Select.Option value="public">Public</Select.Option>
                              <Select.Option value="private">Private</Select.Option>
                              <Select.Option value="unlisted">Unlisted</Select.Option>
                            </Select>
                          </Form.Item>
                        </>
                      )}
                      
                      {action === 'get_channel_info' && (
                        <Form.Item
                          name="channelId"
                          label="Channel ID"
                          help="YouTube channel ID to get information about"
                          rules={[{ required: true, message: 'Please enter channel ID' }]}
                        >
                          <Input placeholder="UCChannelId123" />
                        </Form.Item>
                      )}
                      
                      {action === 'create_playlist' && (
                        <>
                          <Form.Item
                            name="playlistTitle"
                            label="Playlist Title"
                            help="Title of the new playlist"
                            rules={[{ required: true, message: 'Please enter playlist title' }]}
                          >
                            <Input placeholder="{{playlistTitle}} or playlist title" />
                          </Form.Item>
                          <Form.Item
                            name="playlistDescription"
                            label="Playlist Description"
                            help="Description of the playlist"
                          >
                            <TextArea
                              rows={3}
                              placeholder="Playlist description..."
                            />
                          </Form.Item>
                        </>
                      )}
                      
                      {action === 'get_comments' && (
                        <Form.Item
                          name="videoId"
                          label="Video ID"
                          help="YouTube video ID to get comments from"
                          rules={[{ required: true, message: 'Please enter video ID' }]}
                        >
                          <Input placeholder="dQw4w9WgXcQ" />
                        </Form.Item>
                      )}
                      
                      {action === 'get_analytics' && (
                        <Form.Item
                          name="channelId"
                          label="Channel ID"
                          help="Channel ID for analytics data"
                          rules={[{ required: true, message: 'Please enter channel ID' }]}
                        >
                          <Input placeholder="UCChannelId123" />
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
