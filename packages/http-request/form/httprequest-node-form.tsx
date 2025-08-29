import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../@input/TextInputField';
import TextAreaField from '../../@input/TextAreaField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

interface HttpRequestNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const HttpRequestNodeForm: React.FC<HttpRequestNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>HTTP Request Node</div>
        <div>Make HTTP requests to external APIs and services. Supports dynamic URLs and headers with variable substitution.</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Request Configuration
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DropdownField
            name="method"
            label="HTTP Method"
            options={[
              { label: 'GET', value: 'GET' },
              { label: 'POST', value: 'POST' },
              { label: 'PUT', value: 'PUT' },
              { label: 'DELETE', value: 'DELETE' },
              { label: 'PATCH', value: 'PATCH' }
            ]}
          />

          <TextInputField
            name="url"
            label="URL"
            required
            placeholder="https://api.example.com/{{endpoint}}"
          />

          <TextAreaField
            name="body"
            label="Request Body"
            rows={6}
            placeholder='{"key": "{{value}}", "data": "example"}'
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Headers
        </div>
        <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>HTTP Headers</div>
          <div>Add custom headers to your request. Use &#123;&#123;variableName&#125;&#125; for dynamic values.</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="headerKey"
            label="Header Name"
            placeholder="Content-Type"
          />
          <TextInputField
            name="headerValue"
            label="Header Value"
            placeholder="application/json"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Request Settings
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="timeout"
            label="Timeout (seconds)"
            placeholder="30"
            type="number"
          />

          <DropdownField
            name="followRedirects"
            label="Follow Redirects"
            options={[
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' }
            ]}
          />
        </div>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default HttpRequestNodeForm;
