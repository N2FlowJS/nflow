import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../../packages/@input/TextInputField';
import TextAreaField from '../../../packages/@input/TextAreaField';
import DropdownField from '../../../packages/@input/DropdownField';
import React, { useState, useEffect } from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

interface TelegramNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TelegramNodeForm: React.FC<TelegramNodeFormProps> = (props) => {
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
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Telegram Node</div>
        <div>Interact with Telegram Bot API for messaging, media sharing, and bot operations.</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          API Configuration
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="botToken"
            label="Bot Token"
            required
            type="password"
            placeholder="Your Telegram bot token from @BotFather"
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
              { label: 'Send Photo', value: 'send_photo' },
              { label: 'Send Document', value: 'send_document' },
              { label: 'Get Updates', value: 'get_updates' },
              { label: 'Create Poll', value: 'create_poll' },
              { label: 'Send Location', value: 'send_location' }
            ]}
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Action Parameters
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(action === 'send_message' || action === 'send_photo' || action === 'send_document' || action === 'create_poll' || action === 'send_location') && (
            <TextInputField
              name="chatId"
              label="Chat ID"
              required
              placeholder="123456789 or @channel_name"
            />
          )}

          {action === 'send_message' && (
            <>
              <TextAreaField
                name="message"
                label="Message"
                required
                rows={4}
                placeholder="{{telegramMessage}} or your message..."
              />
              <DropdownField
                name="parseMode"
                label="Parse Mode"
                options={[
                  { label: 'Markdown', value: 'Markdown' },
                  { label: 'HTML', value: 'HTML' }
                ]}
              />
            </>
          )}

          {action === 'send_photo' && (
            <TextInputField
              name="photoUrl"
              label="Photo URL"
              required
              placeholder="https://example.com/photo.jpg"
            />
          )}

          {action === 'send_document' && (
            <TextInputField
              name="documentUrl"
              label="Document URL"
              required
              placeholder="https://example.com/document.pdf"
            />
          )}

          {action === 'create_poll' && (
            <>
              <TextInputField
                name="pollQuestion"
                label="Poll Question"
                required
                placeholder="{{pollQuestion}} or your question"
              />
              <div style={{ padding: '12px', backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: '6px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Poll Options</div>
                <div>Use a JSON array in your workflow data for poll options</div>
              </div>
            </>
          )}

          {action === 'send_location' && (
            <>
              <TextInputField
                name="latitude"
                label="Latitude"
                required
                placeholder="37.4224764"
              />
              <TextInputField
                name="longitude"
                label="Longitude"
                required
                placeholder="-122.0842499"
              />
            </>
          )}
        </div>
      </div>

      <div style={{ padding: '12px', backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: '6px', marginTop: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Bot Setup Note</div>
        <div>Create a bot via @BotFather on Telegram to get a bot token. Make sure the bot has necessary permissions in groups/channels.</div>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default TelegramNodeForm;
