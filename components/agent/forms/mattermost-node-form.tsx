import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../../packages/@input/TextInputField';
import TextAreaField from '../../../packages/@input/TextAreaField';
import DropdownField from '../../../packages/@input/DropdownField';
import React, { useState, useEffect } from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

interface MattermostNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MattermostNodeForm: React.FC<MattermostNodeFormProps> = (props) => {
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
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Mattermost Node</div>
        <div>Interact with Mattermost for team communication. Send messages, create channels, and manage team collaboration.</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Connection Settings
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="serverUrl"
            label="Mattermost Server URL"
            required
            placeholder="https://your-mattermost.com"
          />
          <TextInputField
            name="accessToken"
            label="Access Token"
            required
            type="password"
            placeholder="Access token"
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
              { label: 'Send Message', value: 'send_message' },
              { label: 'Create Channel', value: 'create_channel' },
              { label: 'Get Channels List', value: 'get_channels' },
              { label: 'Get Users List', value: 'get_users' }
            ]}
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Action Parameters
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {action === 'send_message' && (
            <>
              <TextInputField
                name="channelId"
                label="Channel ID"
                placeholder="Channel ID"
              />
              <TextAreaField
                name="message"
                label="Message Content"
                required
                rows={4}
                placeholder="{{messageContent}} or direct message"
              />
            </>
          )}

          {action === 'create_channel' && (
            <>
              <TextInputField
                name="teamId"
                label="Team ID"
                required
                placeholder="Team ID"
              />
              <TextInputField
                name="channelName"
                label="Channel Name"
                required
                placeholder="{{channelName}} or direct name"
              />
            </>
          )}

          {action === 'get_channels' && (
            <TextInputField
              name="teamId"
              label="Team ID"
              required
              placeholder="Team ID"
            />
          )}

          {action === 'get_users' && (
            <div style={{ padding: '12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>No additional parameters needed</div>
              <div>This action retrieves all users from the Mattermost server.</div>
            </div>
          )}
        </div>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default MattermostNodeForm;
