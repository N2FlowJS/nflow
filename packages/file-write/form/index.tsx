import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../../packages/@input/TextInputField';
import TextAreaField from '../../../packages/@input/TextAreaField';
import DropdownField from '../../../packages/@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

interface FileWriteNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const FileWriteNodeForm: React.FC<FileWriteNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>File Write Node</div>
        <div>Write content to files with dynamic paths and content. Supports different encodings and overwrite protection.</div>
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
            placeholder="/path/to/output.txt or {{outputPath}}"
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
          Content Configuration
        </div>
        <TextAreaField
          name="content"
          label="Content to Write"
          required
          placeholder="{{contentToWrite}} or direct content"
          rows={6}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Write Settings
        </div>
        <DropdownField
          name="overwrite"
          label="Overwrite Existing File"
          options={[
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' }
          ]}
        />
      </div>

      <div style={{ padding: '12px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '6px', marginTop: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Security Notice</div>
        <div>File writes are restricted to the current working directory for security. Directory traversal attempts will be blocked.</div>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default FileWriteNodeForm;
