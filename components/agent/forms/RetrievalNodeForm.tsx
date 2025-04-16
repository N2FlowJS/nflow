import React, { useEffect, useState } from "react";
import { Form, InputNumber, Select, Typography, Spin, Space, Input, Collapse, Tag, Button, List } from "antd";
import { DatabaseOutlined, LoadingOutlined, FileSearchOutlined, ExportOutlined, LinkOutlined, DeleteOutlined } from "@ant-design/icons";
import { FlowNode, InputReference } from "../types/flowTypes";
import BaseNodeForm from "./BaseNodeForm";
import { fetchAllKnowledge, } from "../../../services/knowledgeService";
import { IKnowledge } from "../../../types/IKnowledge";

const { Panel } = Collapse;
const { Text } = Typography;

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
  const [outputVarName, setOutputVarName] = useState(
    props.form?.getFieldValue('outputVariable') || 'retrievalResults'
  );

  // Track available query sources for input reference
  const [availableInputs, setAvailableInputs] = useState<Array<{id: string, name: string, type: string}>>([]);
  const [availableNodes, setAvailableNodes] = useState<Array<{id: string, name: string, type: string}>>([]);

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

    // Mock loading available inputs for query source
    // In a real implementation, this would query the flow structure
    setAvailableInputs([
      { id: 'user_input', name: 'User Input', type: 'text' },
      { id: 'generated_text', name: 'Generated Text', type: 'text' },
    ]);

    // Mock available nodes for input references
    // In real implementation, this would find all nodes that come before this one in the flow
    setAvailableNodes([
      { id: 'begin_node', name: 'Begin Node', type: 'begin' },
      { id: 'generate_node', name: 'Generate Node', type: 'generate' },
    ]);
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
        <Panel 
          header={
            <Space>
              <FileSearchOutlined />
              <span>Query Source</span>
            </Space>
          } 
          key="query-source"
        >
          <Form.Item
            name="querySource"
            label="Select input to use as the query"
            help="The selected input will be used as the query text for retrieval"
            rules={[{ required: true, message: 'Please select a query source' }]}
          >
            <Select 
              placeholder="Select query source"
              options={availableInputs.map(input => ({
                value: input.id,
                label: input.name,
              }))}
            />
          </Form.Item>
        </Panel>

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
                      
                      <Form.Item
                        {...field}
                        name={[field.name, 'outputName']}
                        rules={[{ required: true, message: 'Output name is required' }]}
                        style={{ width: 150 }}
                      >
                        <Input placeholder="Output Name" />
                      </Form.Item>
                      
                      <Form.Item
                        {...field}
                        name={[field.name, 'inputName']}
                        rules={[{ required: true, message: 'Input name is required' }]}
                        style={{ width: 150 }}
                      >
                        <Input placeholder="As Input Name" />
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

        <Panel 
          header={
            <Space>
              <ExportOutlined />
              <span>Output Configuration</span>
            </Space>
          } 
          key="output-config"
        >
          <Form.Item 
            name="outputVariable" 
            label="Output Variable Name"
            extra="This variable will store the retrieval results for use in subsequent nodes"
            initialValue={outputVarName}
          >
            <Input 
              placeholder="Variable name (e.g., retrievalResults)" 
              value={outputVarName}
              onChange={(e) => setOutputVarName(e.target.value)}
              addonBefore="$"
            />
          </Form.Item>

          <Form.Item
            name="outputFormat"
            label="Output Format"
            initialValue="text"
          >
            <Select>
              <Select.Option value="text">Text (Formatted)</Select.Option>
              <Select.Option value="json">JSON (Structured)</Select.Option>
              <Select.Option value="citations">Text with Citations</Select.Option>
            </Select>
          </Form.Item>
        </Panel>
      </Collapse>
    </BaseNodeForm>
  );
};

export default RetrievalNodeForm;
