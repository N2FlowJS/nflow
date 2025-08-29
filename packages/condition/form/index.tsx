import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../@input/TextInputField';
import TextAreaField from '../../@input/TextAreaField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

interface ConditionNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConditionNodeForm: React.FC<ConditionNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Condition Node</div>
        <div>Compare values and return different results based on the condition. Perfect for simple if-then logic in your flows.</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Comparison Configuration
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="leftValue"
            label="Left Value"
            required
            placeholder="{{value1}}"
          />

          <DropdownField
            name="operator"
            label="Comparison Operator"
            required
            options={[
              { label: 'Equals (=)', value: 'equals' },
              { label: 'Not Equals (≠)', value: 'notEquals' },
              { label: 'Greater Than (>)', value: 'greaterThan' },
              { label: 'Less Than (<)', value: 'lessThan' },
              { label: 'Contains', value: 'contains' },
              { label: 'Starts With', value: 'startsWith' },
              { label: 'Ends With', value: 'endsWith' },
              { label: 'Regex Match', value: 'regex' }
            ]}
          />

          <TextInputField
            name="rightValue"
            label="Right Value"
            required
            placeholder="{{value2}} or direct value"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Result Values
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextAreaField
            name="trueValue"
            label="True Result"
            required
            rows={3}
            placeholder="Value when condition is true"
          />

          <TextAreaField
            name="falseValue"
            label="False Result"
            required
            rows={3}
            placeholder="Value when condition is false"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Data Type Settings
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DropdownField
            name="dataType"
            label="Data Type"
            options={[
              { label: 'String (Text)', value: 'string' },
              { label: 'Number', value: 'number' },
              { label: 'Boolean (true/false)', value: 'boolean' },
              { label: 'Date', value: 'date' }
            ]}
          />
        </div>
      </div>

      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginTop: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Usage Examples</div>
        <div>
          <p><strong>Text comparison:</strong> Check if user input contains "help"</p>
          <p><strong>Number comparison:</strong> Compare scores or counts</p>
          <p><strong>Status checks:</strong> Route based on previous node results</p>
        </div>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default ConditionNodeForm;
