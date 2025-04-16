import React from "react";
import { NODE_REGISTRY } from "../util";
import { Tooltip } from "antd";
import { ApiOutlined } from "@ant-design/icons";

const NodePalette: React.FC = () => {
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
      {Object.entries(NODE_REGISTRY).map(([type, config]) => (
        <Tooltip 
          key={type}
          title={
            <div>
              <div>{config.description || 'Drag to add to flow'}</div>
              {config.inputOutputInfo && (
                <div style={{ marginTop: 5 }}>
                  <div><small><strong>Input:</strong> {config.inputOutputInfo.input}</small></div>
                  <div><small><strong>Output:</strong> {config.inputOutputInfo.output}</small></div>
                </div>
              )}
            </div>
          }
          placement="right"
        >
          <div
            onDragStart={(event) => {
              event.dataTransfer.setData("nflow.application.reactflow", type);
              // Add initialization data for input/output capabilities
              if (config.inputOutputInfo) {
                event.dataTransfer.setData(
                  "nflow.node.io", 
                  JSON.stringify(config.inputOutputInfo)
                );
              }
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
            <span>{config.label}</span>
            {config.inputOutputInfo && (
              <ApiOutlined style={{ marginLeft: 5 }} />
            )}
          </div>
        </Tooltip>
      ))}
    </div>
  );
};

export default NodePalette;
