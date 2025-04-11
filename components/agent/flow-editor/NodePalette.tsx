import React from "react";
import { NODE_REGISTRY } from "../util";

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
        <div
          key={type}
          onDragStart={(event) =>
            event.dataTransfer.setData("nflow.application.reactflow", type)
          }
          draggable
          style={{
            padding: "5px 10px",
            marginBottom: "5px",
            background: config.color.background,
            border: `1px solid ${config.color.border}`,
            borderRadius: "4px",
            cursor: "grab",
          }}
        >
          {config.label}
        </div>
      ))}
    </div>
  );
};

export default NodePalette;
