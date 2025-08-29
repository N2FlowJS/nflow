import React from 'react';
import { useLocale } from '../../../locale';
import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../../packages/@input/TextInputField';
import DropdownField from '../../../packages/@input/DropdownField';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

interface FileReadNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const FileReadNodeForm: React.FC<FileReadNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>File Read Node</div>
        <div>Read content from files with support for different encodings and size limits for security.</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          File Configuration
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="filePath"
            label="File Path"
            required
            placeholder="/path/to/file.txt or {{inputPath}}"
          />

          <DropdownField
            name="encoding"
            label="File Encoding"
            options={[
              { label: 'UTF-8 (Text files)', value: 'utf8' },
              { label: 'Base64 (Binary data)', value: 'base64' },
              { label: 'Binary', value: 'binary' }
            ]}
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Security Settings
        </div>
        <TextInputField
          name="maxSize"
          label="Maximum File Size (bytes)"
          placeholder="1048576"
          type="number"
        />
      </div>

      <div style={{ padding: '12px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '6px', marginTop: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Security Notice</div>
        <div>File reads are restricted to the current working directory for security. Directory traversal attempts will be blocked.</div>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default FileReadNodeForm;
