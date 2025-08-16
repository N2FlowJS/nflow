import {
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { FlowNode } from "../../../models/flowTypes";
import {
  Button,
  Collapse,
  Empty,
  Form,
  Input,
  List,
  Space,
  Tag,
  Tooltip,
  Typography
} from "antd";
import React, { useState } from "react";
import BaseNodeForm from "./base-node-form";
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from "../../../locale";

const { TextArea } = Input;
const { Text } = Typography;

interface BeginNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const BeginNodeForm: React.FC<BeginNodeFormProps> = (props) => {
  const [newVarName, setNewVarName] = useState("");
  const [newVarValue, setNewVarValue] = useState("");
  const variables = Form.useWatch("variables", props.form) || [];
  const { t } = useLocale('form.nodeForm');

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
      <RoleSelector />

      <Collapse
        defaultActiveKey={['description', 'greeting']}
        bordered={false}
        expandIconPosition="end"
        className="form-collapse"
        items={[
          {
            key: 'description',
            label: (
              <Space>
                <EditOutlined />
                <span>{t('descriptionLabel')}</span>
              </Space>
            ),
            children: (
              <Form.Item name="description" noStyle>
                <TextArea
                  rows={2}
                  placeholder={t('descriptionPlaceholderBegin')}
                  style={{ resize: "none" }}
                />
              </Form.Item>
            )
          },
          {
            key: 'greeting',
            label: (
              <Space>
                <MessageOutlined />
                <span>{t('greetingMessageLabel')}</span>
              </Space>
            ),
            children: (
              <Form.Item name="greeting" noStyle>
                <TextArea
                  rows={2}
                  placeholder={t('greetingMessagePlaceholder')}
                  style={{ resize: "none" }}
                />
              </Form.Item>
            )
          },
          {
            key: 'variables',
            label: (
              <Space>
                <CodeOutlined />
                <span>{t('variablesLabel')}</span>
                {variables.length > 0 && (
                  <Tag color="blue">{variables.length}</Tag>
                )}
              </Space>
            ),
            children: (
              <>
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
                            <Tooltip key={'remove'} title={t('removeTooltip')}>
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
                      description={t('noVariablesDefined')}
                      style={{ margin: "12px 0" }}
                    />
                  )}

                  <Space.Compact style={{ width: "100%" }}>
                    <Input
                      value={newVarName}
                      onChange={(e) => setNewVarName(e.target.value)}
                      placeholder={t('variableNamePlaceholder')}
                      style={{ width: "40%" }}
                      prefix="@"
                    />
                    <Input
                      value={newVarValue}
                      onChange={(e) => setNewVarValue(e.target.value)}
                      placeholder={t('defaultValuePlaceholder')}
                      style={{ width: "40%" }}
                    />
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={addVariable}
                      disabled={!newVarName}
                    >
                      {t('addVariableButton')}
                    </Button>
                  </Space.Compact>
                </Space>
              </>
            )
          }
        ]}
      />
    </BaseNodeForm>
  );
};

export default BeginNodeForm;
