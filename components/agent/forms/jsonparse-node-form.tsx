import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../../packages/@input/TextInputField';
import TextAreaField from '../../../packages/@input/TextAreaField';
import DropdownField from '../../../packages/@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

interface JsonParseNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const JsonParseNodeForm: React.FC<JsonParseNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>JSON Parse Node</div>
        <div>Parse, stringify, extract data from JSON, or validate JSON format. Essential for working with API responses and structured data.</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Input Configuration
        </div>
        <TextAreaField
          name="jsonData"
          label="JSON Data"
          required
          placeholder="{{apiResponse}} or {&#34;key&#34;: &#34;value&#34;}"
          rows={4}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          JSON Operation
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DropdownField
            name="operation"
            label="Operation Type"
            required
            options={[
              { label: 'Parse - Convert JSON string to object', value: 'parse' },
              { label: 'Stringify - Convert object to JSON string', value: 'stringify' },
              { label: 'Extract - Get specific data using path', value: 'extract' },
              { label: 'Validate - Check if JSON is valid', value: 'validate' }
            ]}
          />

          <TextInputField
            name="jsonPath"
            label="JSON Path"
            placeholder="user.name or items[0].id"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Output Format
        </div>
        <DropdownField
          name="outputFormat"
          label="Output Format"
          options={[
            { label: 'Object/Array (structured)', value: 'object' },
            { label: 'String (serialized)', value: 'string' }
          ]}
        />
      </div>

      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginTop: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Usage Examples</div>
        <div>
          <p><strong>Parse:</strong> Convert API response string to usable object</p>
          <p><strong>Extract:</strong> Get specific values like "user.profile.email"</p>
          <p><strong>Stringify:</strong> Convert data for HTTP requests or storage</p>
          <p><strong>Validate:</strong> Check data integrity before processing</p>
        </div>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default JsonParseNodeForm;
