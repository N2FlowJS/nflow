import React from "react";
import { Tooltip, Empty } from "antd";
import { NODE_REGISTRY } from "../../../utils/client";
import { FlowNode } from "../../../models/flowTypes";

interface NodePaletteProps {
  nodes: FlowNode[];
}

const NodePalette: React.FC<NodePaletteProps> = ({ nodes }) => {
  // Check if a begin node already exists
  const beginNodeExists = nodes.some(node => node.type === 'begin');

  // Lọc các node có thể thêm
  const availableNodes = Object.entries(NODE_REGISTRY)
    .filter(([type, ]) => !(type === 'begin' && beginNodeExists));

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>
        Node Palette
      </div>
      {availableNodes.length === 0 ? (
        <Empty description="No more nodes to add" />
      ) : (
        <div>
          {availableNodes.map(([type, config]) => (
            <Tooltip
              key={type}
              title={
                <div>
                  <div style={{ fontWeight: 500 }}>{config.data.form?.name || 'Drag to add to flow'}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{config.data.form?.description || 'No description available'}</div>
                </div>
              }
              placement="right"
            >
              <div
                onDragStart={(event) => {
                  event.dataTransfer.setData("nflow.application.reactflow", type);
                }}
                draggable
                style={{
                  padding: "12px 18px",
                  marginBottom: "12px",
                  background: config.color.background,
                  border: `1px solid ${config.color.border}`,
                  borderRadius: "6px",
                  cursor: "grab",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontWeight: 500,
                  fontSize: 16,
                  transition: "box-shadow 0.15s, border 0.15s, background 0.15s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  userSelect: "none"
                }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)";
                  (e.currentTarget as HTMLDivElement).style.border = `1.5px solid #1890ff`;
                  (e.currentTarget as HTMLDivElement).style.background = "#e6f7ff";
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                  (e.currentTarget as HTMLDivElement).style.border = `1px solid ${config.color.border}`;
                  (e.currentTarget as HTMLDivElement).style.background = config.color.background;
                }}
              >
                <span style={{ fontSize: 22, marginRight: 8 }}>{config.icon}</span>
                <span>{config.data.form?.name || config.type}</span>
              </div>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );
};

export default NodePalette;
