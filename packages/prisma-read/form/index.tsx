import React from 'react';
import { useLocale } from '../../../locale';
import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../../packages/@input/TextInputField';
// import DropdownField from '../../../packages/@input/DropdownField';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

interface PrismaReadNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PrismaReadNodeForm: React.FC<PrismaReadNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Prisma Read Node</div>
        <div>Read data from a Prisma model (database table) with optional filter and limit.</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Database Query Configuration
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="model"
            label="Model/Table Name"
            required
            placeholder="User, Conversation, File, ..."
          />
          <TextInputField
            name="filter"
            label="Filter (JSON or template)"
            placeholder='{"status": "active"}'
          />
          <TextInputField
            name="limit"
            label="Limit"
            type="number"
            placeholder="10"
          />
        </div>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default PrismaReadNodeForm;
