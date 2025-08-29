import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../../packages/@input/TextInputField';
import TextAreaField from '../../../packages/@input/TextAreaField';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

interface ExecMysqlNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ExecMysqlNodeForm: React.FC<ExecMysqlNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>MySQL Execution Node</div>
        <div>Execute SQL queries against a MySQL database and return results for further processing.</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          {t('execmysql.connectionSettings')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="server"
            label="Server Host"
            required
            placeholder="localhost or IP address"
          />

          <TextInputField
            name="port"
            label="Port"
            required
            placeholder="3306"
            type="number"
          />

          <TextInputField
            name="database"
            label="Database Name"
            required
            placeholder="Database name"
          />

          <TextInputField
            name="user"
            label="Username"
            required
            placeholder="Database username"
          />

          <TextInputField
            name="password"
            label="Password"
            required
            placeholder="Database password"
            type="password"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          SQL Query
        </div>
        <TextAreaField
          name="query"
          label="SQL Query"
          required
          placeholder="SELECT * FROM users WHERE id = ${userId} LIMIT 10"
          rows={6}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Execution Settings
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="timeout"
            label="Query Timeout (seconds)"
            placeholder="30"
            type="number"
          />

          <TextInputField
            name="maxRows"
            label="Maximum Rows"
            placeholder="100"
            type="number"
          />
        </div>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default ExecMysqlNodeForm;
