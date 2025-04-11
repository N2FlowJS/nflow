import React from "react";
import { Breadcrumb, Button, Space, Select } from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/router";

const { Option } = Select;

interface FlowEditorHeaderProps {
  agent: any;

}

const FlowEditorHeader: React.FC<FlowEditorHeaderProps> = ({
  agent,

}) => {

  return (
    <div
      style={{
        padding: "16px",
        background: "#f0f2f5",
        borderBottom: "1px solid #d9d9d9",
      }}
    >
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/">Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/agent">Agents</Link>
          </Breadcrumb.Item>
          {agent && (
            <Breadcrumb.Item>
              <Link href={`/agent/${agent.id}`}>{agent.name}</Link>
            </Breadcrumb.Item>
          )}
          <Breadcrumb.Item>Flow Editor</Breadcrumb.Item>
        </Breadcrumb>

       
      </Space>
    </div>
  );
};

export default FlowEditorHeader;
