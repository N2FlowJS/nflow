import React from "react";
import { Tooltip } from "antd";
import { NODE_REGISTRY } from "@utils/client";
import { FlowNode } from "../../../models/flowTypes";

interface NodePaletteProps {
  nodes: FlowNode[];
}

const NodePalette: React.FC<NodePaletteProps> = ({ nodes }) => {
  // Check if a begin node already exists
  const beginNodeExists = nodes.some(node => node.type === 'begin');

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 10,
        left: 10,
        top: 10,
        background: "white",
        padding: "10px",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
      }}
    >
      {Object.entries(NODE_REGISTRY)
        // Filter out 'begin' node if it already exists in the flow
        .filter(([type, _]) => !(type === 'begin' && beginNodeExists))
        .map(([type, config]) => (
          <Tooltip
            key={type}
            title={
              <div>
                <div>{config.data.form?.name || 'Drag to add to flow'}</div>
                <div>{config.data.form?.description || 'No description available'}</div>
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
                padding: "5px 10px",
                marginBottom: "5px",
                background: config.color.background,
                border: `1px solid ${config.color.border}`,
                borderRadius: "4px",
                cursor: "grab",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <span>{config.data.form?.name || config.type}</span>
            </div>
          </Tooltip>
        ))}
    </div>
  );
};

export default NodePalette;
