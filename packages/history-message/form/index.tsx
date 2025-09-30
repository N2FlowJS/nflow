import React from 'react';
import BaseNodeForm from '../../@flow/form';
import TextInputField from '../../@input/TextInputField';
import DropdownField from '../../@input/DropdownField';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

export default function HistoryMessageForm(props: any) {
  const { form, selectedNode } = props;
  return (
    <BaseNodeForm {...props}>
      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>History Message Node</div>
        <div>Truy xuất lịch sử chat cho một người dùng hoặc cuộc trò chuyện.</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Cấu hình truy xuất lịch sử
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="userId"
            label="User ID"
            placeholder="Nhập ID người dùng (tùy chọn)"
          />
          <DropdownField
            name="historyType"
            label="Loại lịch sử"
            options={[
              { label: 'Tất cả', value: 'all' },
              { label: 'Theo người dùng', value: 'user' },
              { label: 'Theo cuộc trò chuyện', value: 'conversation' },
            ]}
            required
            placeholder="Chọn loại lịch sử"
          />
        </div>
      </div>

      <RoleSelector />
      <InputReferences form={form} nodeid={selectedNode?.id} />
    </BaseNodeForm>
  );
}
