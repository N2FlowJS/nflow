import React, { useEffect, useState } from "react";
import { Form, InputNumber, Select, Typography, Spin } from "antd";
import { DatabaseOutlined, LoadingOutlined } from "@ant-design/icons";
import { FlowNode } from "../types/flowTypes";
import BaseNodeForm from "./BaseNodeForm";
import { fetchAllKnowledge, } from "../../../services/knowledgeService";
import { IKnowledge } from "../../../types/IKnowledge";

interface RetrievalNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const RetrievalNodeForm: React.FC<RetrievalNodeFormProps> = (props) => {
  const [knowledgeBases, setKnowledgeBases] = useState<IKnowledge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadKnowledgeBases = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchAllKnowledge();
        setKnowledgeBases(data);
      } catch (err) {
        console.error("Failed to load knowledge bases:", err);
        setError("Failed to load knowledge bases");
      } finally {
        setLoading(false);
      }
    };

    loadKnowledgeBases();
  }, []);

  return (
    <BaseNodeForm {...props}>
      <Form.Item
        name="knowledgeIds"
        label="Knowledge Bases"
        help="Select one or more knowledge bases to retrieve information from"
        required
      >
        <Select
          mode="multiple"
          placeholder="Select knowledge bases"
          loading={loading}
          disabled={loading}
          notFoundContent={
            loading ? (
              <Spin size="small" indicator={<LoadingOutlined spin />} />
            ) : error ? (
              <Typography.Text type="danger">{error}</Typography.Text>
            ) : (
              "No knowledge bases found"
            )
          }
          optionLabelProp="label"
        >
          {knowledgeBases.map((kb) => (
            <Select.Option key={kb.id} value={kb.id} label={kb.name}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <DatabaseOutlined style={{ marginRight: 8 }} />
                <span>{kb.name}</span>
              </div>
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="maxResults" label="Max Results" required>
        <InputNumber min={1} max={20} defaultValue={3} style={{ width: '100%' }} />
      </Form.Item>
    </BaseNodeForm>
  );
};

export default RetrievalNodeForm;
