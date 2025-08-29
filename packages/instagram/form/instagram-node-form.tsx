import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../@input/TextInputField';
import TextAreaField from '../../@input/TextAreaField';
import DropdownField from '../../@input/DropdownField';
import React, { useState, useEffect } from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

interface InstagramNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const InstagramNodeForm: React.FC<InstagramNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const [action, setAction] = useState('');

  useEffect(() => {
    // Watch for changes in the action field
    const subscription = props.form?.getFieldValue && (() => {
      const currentAction = props.form.getFieldValue('action');
      if (currentAction !== action) {
        setAction(currentAction || '');
      }
    });

    // Initial value
    const initialAction = props.form?.getFieldValue ? props.form.getFieldValue('action') : '';
    setAction(initialAction || '');

    return subscription;
  }, [props.form, action]);

  return (
    <BaseNodeForm {...props}>
      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Instagram Node</div>
        <div>Interact with Instagram Graph API for posts, stories, and business insights. Requires Instagram Business account and access token.</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          API Configuration
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="accessToken"
            label="Access Token"
            required
            type="password"
            placeholder="Your Instagram Graph API access token"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Action Configuration
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DropdownField
            name="action"
            label="Action Type"
            required
            options={[
              { label: 'Create Post', value: 'create_post' },
              { label: 'Get Posts', value: 'get_posts' },
              { label: 'Get User Info', value: 'get_user_info' },
              { label: 'Get Media', value: 'get_media' },
              { label: 'Create Story', value: 'create_story' },
              { label: 'Get Insights', value: 'get_insights' }
            ]}
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Action Parameters
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {action === 'create_post' && (
            <>
              <TextAreaField
                name="caption"
                label="Caption"
                rows={4}
                placeholder="{{postCaption}} or your caption..."
              />
              <TextInputField
                name="mediaUrl"
                label="Media URL"
                required
                placeholder="https://example.com/image.jpg"
              />
              <DropdownField
                name="mediaType"
                label="Media Type"
                options={[
                  { label: 'Image', value: 'image' },
                  { label: 'Video', value: 'video' },
                  { label: 'Carousel', value: 'carousel' }
                ]}
              />
            </>
          )}

          {action === 'create_story' && (
            <TextInputField
              name="storyMediaUrl"
              label="Story Media URL"
              required
              placeholder="https://example.com/story.jpg"
            />
          )}

          {action === 'get_user_info' && (
            <TextInputField
              name="userId"
              label="User ID (Optional)"
              placeholder="Instagram user ID"
            />
          )}
        </div>
      </div>

      <div style={{ padding: '12px', backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: '6px', marginTop: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>API Requirements</div>
        <div>Instagram Graph API requires a Facebook App with Instagram Basic Display or Instagram Graph API permissions. Make sure your access token has the required scopes.</div>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default InstagramNodeForm;
