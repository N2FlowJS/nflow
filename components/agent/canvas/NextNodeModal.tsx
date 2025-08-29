import React, { useMemo, useState, useCallback } from 'react';
import { Modal, Card, Input } from 'antd';
import type { NodeTypeString } from '../../../models/flowTypes';

interface NextNodeModalProps {
  open: boolean;
  title: string;
  items: Array<[NodeTypeString, any]>; // [type, config]
  onCancel: () => void;
  onSelect: (type: NodeTypeString) => void;
}

const NextNodeModal: React.FC<NextNodeModalProps> = ({ open, title, items, onCancel, onSelect }) => {
  const [query, setQuery] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(([type, config]) => {
      const name = config?.data?.form?.name ?? '';
      const desc = config?.data?.form?.description ?? '';
      return (
        String(type).toLowerCase().includes(q) ||
        String(name).toLowerCase().includes(q) ||
        String(desc).toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  return (
    <Modal title={title} open={open} onCancel={onCancel} footer={null}>
      <div style={{ marginBottom: 12 }}>
        <Input
          placeholder="Search nodes by type, name, or description"
          allowClear
          value={query}
          onChange={handleChange}
        />
      </div>
      <div style={{ maxHeight: 400, overflow: 'auto' }}>
        {filtered.map(([type, config]) => (
          <Card
            key={type}
            onClick={() => onSelect(type as NodeTypeString)}
            style={{
              borderRadius: 6,
              padding: '10px 12px',
              marginBottom: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
            <span style={{ fontSize: 20 }}>{config.icon}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{config.data.form?.name || type}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{config.data.form?.description || ''}</div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <div style={{ color: '#999' }}>No compatible nodes</div>}
      </div>
    </Modal>
  );
};

export default NextNodeModal;
