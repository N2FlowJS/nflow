import { Breadcrumb } from "antd";
import Link from "next/link";
import React from "react";


interface FlowEditorHeaderProps {
  agent: any;

}

const FlowEditorHeader: React.FC<FlowEditorHeaderProps> = ({
  agent,

}) => {
  if (!agent) return (<span>Loading</span>)
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

  return <Breadcrumb items={breadcrumbItems} />

};

export default FlowEditorHeader;
