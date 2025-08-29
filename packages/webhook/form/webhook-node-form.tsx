import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../@input/TextInputField';
import TextAreaField from '../../@input/TextAreaField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

interface WebhookNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const WebhookNodeForm: React.FC<WebhookNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Webhook Node</div>
        <div>Send data to external webhook endpoints. Perfect for integrating with third-party services and triggering external workflows.</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Webhook Configuration
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="webhookUrl"
            label="Webhook URL"
            required
            placeholder="https://hooks.example.com/webhook"
          />

          <DropdownField
            name="method"
            label="HTTP Method"
            required
            options={[
              { label: 'POST', value: 'POST' },
              { label: 'PUT', value: 'PUT' },
              { label: 'GET', value: 'GET' }
            ]}
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Payload & Headers
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextAreaField
            name="payload"
            label="Request Payload"
            required
            rows={6}
            placeholder='{"message": "{{dataToSend}}", "timestamp": "{{currentTime}}"}'
          />

          <TextAreaField
            name="headers"
            label="Custom Headers (JSON)"
            rows={4}
            placeholder='{"Authorization": "Bearer {{token}}", "Content-Type": "application/json"}'
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Advanced Settings
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="retryCount"
            label="Retry Count"
            type="number"
            placeholder="3"
          />
        </div>
      </div>

      <div style={{ padding: '12px', backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: '6px', marginTop: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Security Notice</div>
        <div>Webhook payloads may contain sensitive data. Ensure the webhook endpoint is secure and trusted.</div>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default WebhookNodeForm;
