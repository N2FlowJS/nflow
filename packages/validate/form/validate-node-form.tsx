import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../@input/TextInputField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

interface ValidateNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ValidateNodeForm: React.FC<ValidateNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Validate Node</div>
        <div>Validate data format and constraints. Check emails, URLs, phone numbers, JSON, numbers, dates, and custom patterns.</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Input Configuration
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="inputData"
            label="Input Data"
            required
            placeholder="{{dataToValidate}}"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Validation Type
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DropdownField
            name="validationType"
            label="Validation Type"
            required
            options={[
              { label: 'Email Address', value: 'email' },
              { label: 'URL', value: 'url' },
              { label: 'Phone Number', value: 'phone' },
              { label: 'JSON Format', value: 'json' },
              { label: 'Number', value: 'number' },
              { label: 'Date', value: 'date' },
              { label: 'Custom Pattern (Regex)', value: 'custom' }
            ]}
          />

          <TextInputField
            name="customPattern"
            label="Custom Regex Pattern"
            placeholder="^[A-Za-z0-9]+$"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Constraints
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DropdownField
            name="required"
            label="Required Field"
            options={[
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' }
            ]}
          />

          <TextInputField
            name="minLength"
            label="Minimum Length"
            type="number"
            placeholder="No minimum"
          />

          <TextInputField
            name="maxLength"
            label="Maximum Length"
            type="number"
            placeholder="No maximum"
          />
        </div>
      </div>

      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginTop: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Validation Results</div>
        <div>The node returns a JSON object with 'valid' (boolean), 'message' (string), and 'value' (original input) properties.</div>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default ValidateNodeForm;
