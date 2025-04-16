import React, { useEffect, useState } from "react";
import { Form, InputNumber, Select, Typography, Spin, Space, Input, Collapse, Tag, Button, List } from "antd";
import { DatabaseOutlined, LoadingOutlined, FileSearchOutlined, ExportOutlined, LinkOutlined, DeleteOutlined } from "@ant-design/icons";
import { FlowNode, InputReference } from "../types/flowTypes";
import BaseNodeForm from "./BaseNodeForm";
import { fetchAllKnowledge, } from "../../../services/knowledgeService";
import { IKnowledge } from "../../../types/IKnowledge";

const { Panel } = Collapse;

interface RetrievalNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const useAvailableNodes = () => {
  const [availableNodes, setAvailableNodes] = useState<Array<{ id: string, name: string, type: string }>>([]);

  return {
    availableNodes,
  }
}
const RetrievalNodeForm: React.FC<RetrievalNodeFormProps> = (props) => {
  const [knowledgeBases, setKnowledgeBases] = useState<IKnowledge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    availableNodes
  } = useAvailableNodes();

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
        <InputNumber min={1} max={20} defaultValue={3} style={{ width: '100%' }} />
      </Form.Item>

      <Collapse
        defaultActiveKey={['query-source', 'input-refs', 'output-config']}
        bordered={false}
        expandIconPosition="end"
      >


        {/* Input References Section - Specific to RetrievalNode */}
        <Panel
          header={
            <Space>
              <LinkOutlined />
              <span>Input References</span>
              {props.form?.getFieldValue('inputRefs')?.length > 0 && (
                <Tag color="blue">{props.form?.getFieldValue('inputRefs')?.length || 0}</Tag>
              )}
            </Space>
          }
          key="input-refs"
        >
          <Form.Item name="inputRefs" initialValue={[]}>
            <Form.List name="inputRefs">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(field => (
                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...field}
                        name={[field.name, 'sourceNodeId']}
                        rules={[{ required: true, message: 'Source node is required' }]}
                        style={{ width: 200 }}
                      >
                        <Select placeholder="Source Node">
                          {availableNodes.map(node => (
                            <Select.Option key={node.id} value={node.id}>
                              {node.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>



                      <DeleteOutlined onClick={() => remove(field.name)} />
                    </Space>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<LinkOutlined />}
                    >
                      Add Input Reference
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Panel>


      </Collapse>
    </BaseNodeForm>
  );
};

export default RetrievalNodeForm;
