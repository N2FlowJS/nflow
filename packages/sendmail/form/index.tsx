import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../../packages/@input/TextInputField';
import TextAreaField from '../../../packages/@input/TextAreaField';
import DropdownField from '../../../packages/@input/DropdownField';
import React, { useState, useEffect } from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

interface SendMailNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SendMailNodeForm: React.FC<SendMailNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const [useSystemConfig, setUseSystemConfig] = useState(true);

  useEffect(() => {
    // Watch for changes in the useSystemConfig field
    const subscription = props.form?.getFieldValue && (() => {
      const currentValue = props.form.getFieldValue('useSystemConfig');
      if (currentValue !== useSystemConfig) {
        setUseSystemConfig(currentValue === 'true' || currentValue === true);
      }
    });

    // Initial value
    const initialValue = props.form?.getFieldValue ? props.form.getFieldValue('useSystemConfig') : 'true';
    setUseSystemConfig(initialValue === 'true' || initialValue === true);

    return subscription;
  }, [props.form, useSystemConfig]);

  return (
    <BaseNodeForm {...props}>
      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Send Mail Node</div>
        <div>Send emails with dynamic content using SMTP configuration. Supports both plain text and HTML emails.</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Email Recipients
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="to"
            label="To (Required)"
            required
            placeholder="user@example.com, {{userEmail}}"
          />
          <TextInputField
            name="cc"
            label="CC (Optional)"
            placeholder="manager@example.com"
          />
          <TextInputField
            name="bcc"
            label="BCC (Optional)"
            placeholder="admin@example.com"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Email Content
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="subject"
            label="Subject"
            required
            placeholder="Notification: {{eventName}}"
          />
          <TextAreaField
            name="body"
            label="Email Body"
            required
            rows={8}
            placeholder={`Hello {{userName}},

This is an automated notification from your flow.

Details:
- Event: {{eventName}}
- Time: {{eventTime}}
- Status: {{status}}

Best regards,
Your Automation System`}
          />
          <DropdownField
            name="isHtml"
            label="Email Format"
            options={[
              { label: 'Plain Text', value: 'false' },
              { label: 'HTML Format', value: 'true' }
            ]}
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          SMTP Configuration
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DropdownField
            name="useSystemConfig"
            label="SMTP Configuration"
            options={[
              { label: 'Use System SMTP Configuration', value: 'true' },
              { label: 'Use Custom SMTP Configuration', value: 'false' }
            ]}
          />

          {!useSystemConfig && (
            <>
              <TextInputField
                name="smtpHost"
                label="SMTP Host"
                required
                placeholder="smtp.gmail.com"
              />
              <TextInputField
                name="smtpPort"
                label="SMTP Port"
                required
                placeholder="587"
              />
              <TextInputField
                name="smtpUser"
                label="SMTP Username"
                required
                placeholder="your-email@gmail.com"
              />
              <TextInputField
                name="smtpPassword"
                label="SMTP Password"
                required
                type="password"
                placeholder="App password or email password"
              />
              <DropdownField
                name="smtpSecure"
                label="Connection Security"
                options={[
                  { label: 'Use TLS/SSL (Recommended)', value: 'true' },
                  { label: 'No Encryption', value: 'false' }
                ]}
              />
            </>
          )}
        </div>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default SendMailNodeForm;
