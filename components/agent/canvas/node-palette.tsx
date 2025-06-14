import { Empty, Layout, Tooltip } from 'antd';
import React from 'react';
import { NODE_REGISTRY } from '../../../utils/client/NODE_REGISTRY';

const { Sider } = Layout;

interface NodePaletteProps {
  hasBeginNode: boolean;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ 
  hasBeginNode, 
  isCollapsed = false, 
  onCollapsedChange 
}) => {
  const availableNodes = Object.entries(NODE_REGISTRY).filter(([type]) => !(type === 'begin' && hasBeginNode));

  return (
    <Sider
      width={250}
      collapsible
      collapsed={isCollapsed}
      onCollapse={onCollapsedChange}
      collapsedWidth={50}
      className="node-palette-sider"
      theme="light"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        zIndex: 5,
        overflow: 'auto'
      }}
    >
      <div style={{ 
        padding: isCollapsed ? 8 : 12,
        overflow: 'auto',
        height: '100%'
      }}>
        {!isCollapsed && (
          <h3 style={{ marginBottom: 16 }}>Node Palette</h3>
        )}
        
        {availableNodes.length === 0 ? (
          !isCollapsed && <Empty description="No more nodes to add" />
        ) : (
          <div>
            {availableNodes.map(([type, config]) => (
              <Tooltip
                key={type}
                title={
                  <div>
                    <div style={{ fontWeight: 500 }}>{config.data.form?.name || 'Drag to add to flow'}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{config.data.form?.description || 'No description available'}</div>
                  </div>
                }
                placement="right">
                <div
                  onDragStart={(event) => {
                    event.dataTransfer.setData('nflow.application.reactflow', type);
                  }}
                  draggable
                  style={{
                    backgroundColor: 'transparent',
                    padding: isCollapsed ? '8px' : '12px 18px',
                    marginBottom: '12px',
                    border: `1px solid ${config.color.border}`,
                    borderRadius: '6px',
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: isCollapsed ? 0 : 12,
                    fontWeight: 500,
                    fontSize: 16,
                    transition: 'box-shadow 0.15s, border 0.15s, background 0.15s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    userSelect: 'none',
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLDivElement).style.border = `1.5px solid #1890ff`;
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLDivElement).style.border = `1px solid ${config.color.border}`;
                  }}>
                  <span style={{ fontSize: 22 }}>{config.icon}</span>
                  {!isCollapsed && <span>{config.data.form?.name || config.type}</span>}
                </div>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </Sider>
  );
};

export default NodePalette;
