import { DatabaseOutlined, LoadingOutlined } from "@ant-design/icons";
import { FlowNode } from "@models/flowTypes";
import { IKnowledge } from "@models/IKnowledge";
import { fetchAllKnowledge, } from "@services/knowledgeService";
import { Form, InputNumber, Select, Spin, Typography } from "antd";
import React, { useEffect, useState } from "react";
import BaseNodeForm from "./base-node-form";
import InputReferences from "./shared/InputReferences";
import RoleSelector from "./shared/RoleSelector";


interface RetrievalNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const RetrievalNodeForm: React.FC<RetrievalNodeFormProps> = (props) => {
  const { selectedNode } = props;
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
        rules={[{ required: true, message: 'Please select at least one knowledge base' }]}
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

      <Form.Item name="maxResults" label="Max Results" rules={[{ required: true }]}>
        <InputNumber min={1} max={20} style={{ width: '100%' }} />
      </Form.Item>
      <RoleSelector />

      <InputReferences
        form={props.form}
        nodeid={selectedNode.id}
      />
    </BaseNodeForm>
  );
};

export default RetrievalNodeForm;
