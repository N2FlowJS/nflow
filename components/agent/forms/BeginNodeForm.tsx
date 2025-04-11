import React, { useState } from "react";
import { 
  Form, 
  Input, 
  Button, 
  Space, 
  Divider, 
  Typography, 
  Collapse, 
  List,
  Empty,
  Tag,
  Tooltip
} from "antd";
import { 
  PlusOutlined, 
  DeleteOutlined, 
  MessageOutlined, 
  CodeOutlined,
  EditOutlined
} from "@ant-design/icons";
import { FlowNode } from "../types/flowTypes";
import BaseNodeForm from "./BaseNodeForm";

const { Panel } = Collapse;
const { TextArea } = Input;
const { Text } = Typography;

interface BeginNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const BeginNodeForm: React.FC<BeginNodeFormProps> = (props) => {
  const [newVarName, setNewVarName] = useState("");
  const [newVarValue, setNewVarValue] = useState("");
  const variables = Form.useWatch("variables", props.form) || [];

  const addVariable = () => {
    if (newVarName && !variables.some((v: any) => v.name === newVarName)) {
      props.form.setFieldsValue({
        variables: [...variables, { name: newVarName, value: newVarValue }],
      });
      setNewVarName("");
      setNewVarValue("");
    }
  };

  const removeVariable = (varName: string) => {
    props.form.setFieldsValue({
      variables: variables.filter((v: any) => v.name !== varName),
    });
  };

  return (
    <BaseNodeForm {...props}>
      <Collapse 
        defaultActiveKey={['description', 'greeting']} 
        bordered={false}
        expandIconPosition="end"
        className="form-collapse"
      >
        <Panel 
          header={
            <Space>
              <EditOutlined />
              <span>Description</span>
            </Space>
          } 
          key="description"
        >
          <Form.Item name="description" noStyle>
            <TextArea
              rows={2}
              placeholder="Describe what this flow does..."
              style={{ resize: "none" }}
            />
          </Form.Item>
        </Panel>

        <Panel 
          header={
            <Space>
              <MessageOutlined />
              <span>Greeting Message</span>
            </Space>
          } 
          key="greeting"
        >
          <Form.Item name="greeting" noStyle>
            <TextArea
              rows={2}
              placeholder="Enter a greeting message to start the conversation..."
              style={{ resize: "none" }}
            />
          </Form.Item>
        </Panel>

        <Panel 
          header={
            <Space>
              <CodeOutlined />
              <span>Variables</span>
              {variables.length > 0 && (
                <Tag color="blue">{variables.length}</Tag>
              )}
            </Space>
          } 
          key="variables"
        >
          <Form.Item name="variables" initialValue={[]} hidden>
            <Input />
          </Form.Item>

          <Space direction="vertical" style={{ width: "100%" }}>
            {variables.length > 0 ? (
              <List
                size="small"
                dataSource={variables}
                renderItem={(variable: any) => (
                  <List.Item
                    actions={[
                      <Tooltip title="Remove">
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          onClick={() => removeVariable(variable.name)}
                        />
                      </Tooltip>
                    ]}
                  >
                    <Space>
                      <Text code>{variable.name}</Text>
                      <Text type="secondary">=</Text>
                      <Text>{variable.value || '""'}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No variables defined"
                style={{ margin: "12px 0" }}
              />
            )}

            <Space.Compact style={{ width: "100%" }}>
              <Input
                value={newVarName}
                onChange={(e) => setNewVarName(e.target.value)}
                placeholder="Variable name"
                style={{ width: "40%" }}
                prefix="$"
              />
              <Input
                value={newVarValue}
                onChange={(e) => setNewVarValue(e.target.value)}
                placeholder="Default value"
                style={{ width: "40%" }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addVariable}
                disabled={!newVarName}
              >
                Add
              </Button>
            </Space.Compact>
          </Space>
        </Panel>
      </Collapse>
    </BaseNodeForm>
  );
};

export default BeginNodeForm;
