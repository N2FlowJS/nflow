import { Breadcrumb, Space } from "antd";
import Link from "next/link";
import React from "react";


interface FlowEditorHeaderProps {
  agent: any;

}

const FlowEditorHeader: React.FC<FlowEditorHeaderProps> = ({
  agent,

}) => {
  const breadcrumbItems = [
    {
      title: <Link href="/">Home</Link>,
    },
    {
      title: <Link href="/agent">Agents</Link>,
    },
  ];

  if (agent) {
    breadcrumbItems.push({
      title: <Link href={`/agent/${agent.id}`}>{agent.name}</Link>,
    });
  }

  breadcrumbItems.push({
    title: <span >Flow Editor</span>,
  });

  return (
    <div
      style={{
        padding: "16px",
        background: "#f0f2f5",
        borderBottom: "1px solid #d9d9d9",
      }}
    >
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Breadcrumb items={breadcrumbItems} />


      </Space>
    </div>
  );
};

export default FlowEditorHeader;
