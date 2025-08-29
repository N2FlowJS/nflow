import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../@input/TextInputField';
import TextAreaField from '../../@input/TextAreaField';
import DropdownField from '../../@input/DropdownField';
import React, { useState, useEffect } from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

interface ConfluenceNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConfluenceNodeForm: React.FC<ConfluenceNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const [action, setAction] = useState('');

  useEffect(() => {
    // Watch for changes in the action field
    const subscription = props.form?.getFieldValue && (() => {
      const currentAction = props.form.getFieldValue('action');
      if (currentAction !== action) {
        setAction(currentAction || '');
      }
    });

    // Initial value
    const initialAction = props.form?.getFieldValue ? props.form.getFieldValue('action') : '';
    setAction(initialAction || '');

    return subscription;
  }, [props.form, action]);

  return (
    <BaseNodeForm {...props}>
      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Confluence Node</div>
        <div>Interact with Confluence for content management. Create pages, update documentation, and manage knowledge base content.</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Connection Settings
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="serverUrl"
            label="Confluence Server URL"
            required
            placeholder="https://your-domain.atlassian.net"
          />

          <TextInputField
            name="username"
            label="Username/Email"
            required
            placeholder="user@company.com"
          />

          <TextInputField
            name="apiToken"
            label="API Token"
            required
            type="password"
            placeholder="API token"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Action Configuration
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DropdownField
            name="action"
            label="Action Type"
            required
            options={[
              { label: 'Create Page', value: 'create_page' },
              { label: 'Update Page', value: 'update_page' },
              { label: 'Get Page', value: 'get_page' },
              { label: 'Search Pages', value: 'search_pages' },
              { label: 'Add Comment', value: 'add_comment' },
              { label: 'Get Spaces', value: 'get_spaces' }
            ]}
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Action Parameters
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(action === 'create_page' || action === 'update_page' || action === 'get_page' || action === 'search_pages') && (
            <TextInputField
              name="spaceKey"
              label="Space Key"
              required
              placeholder="DOCS"
            />
          )}

          {(action === 'create_page' || action === 'update_page') && (
            <>
              <TextInputField
                name="title"
                label="Page Title"
                required
                placeholder="{{pageTitle}} or direct title"
              />
              <TextAreaField
                name="content"
                label="Page Content"
                required
                rows={6}
                placeholder="{{pageContent}} or direct content"
              />
              {action === 'create_page' && (
                <TextInputField
                  name="parentPageId"
                  label="Parent Page ID"
                  placeholder="Parent page ID (optional)"
                />
              )}
            </>
          )}

          {(action === 'update_page' || action === 'get_page' || action === 'add_comment') && (
            <TextInputField
              name="pageId"
              label="Page ID"
              required
              placeholder="Page ID"
            />
          )}

          {action === 'search_pages' && (
            <TextAreaField
              name="searchQuery"
              label="Search Query"
              required
              rows={3}
              placeholder='title ~ "search term" AND space = DOCS'
            />
          )}

          {action === 'add_comment' && (
            <TextAreaField
              name="comment"
              label="Comment"
              required
              rows={4}
              placeholder="{{commentText}} or direct comment"
            />
          )}

          {action === 'get_spaces' && (
            <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>No additional parameters needed</div>
              <div>This action retrieves all available Confluence spaces.</div>
            </div>
          )}
        </div>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default ConfluenceNodeForm;
