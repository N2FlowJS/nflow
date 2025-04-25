import { DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { usePredecessorNodes } from '@components/agent/hooks/usePredecessorNodes';
import { Button, Collapse, Form, Select, Space, Tag } from 'antd';
import React from 'react';

const { Panel } = Collapse;

export interface InputNode {
    id: string;
    name?: string;
    type?: string;
}

export interface InputReferencesProps {
    form: any;
    nodeid: string;
}

const InputReferences: React.FC<InputReferencesProps> = ({
    form,
    nodeid
}) => {
    const { predecessorNodes } = usePredecessorNodes(nodeid);

    return (
        <Collapse defaultActiveKey={['inputRefs']}>
            <Panel
                header={
                    <Space>
                        <LinkOutlined />
                        <span>Input References</span>
                        {form?.getFieldValue('inputRefs')?.length > 0 && (
                            <Tag color="blue">{form?.getFieldValue('inputRefs')?.length || 0}</Tag>
                        )}
                    </Space>
                }
                key={'inputRefs'}
            >
                <Form.Item name="inputRefs">
                    <Form.List name="inputRefs">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(field => (
                                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'id']}
                                            rules={[{ required: true, message: 'Source node is required' }]}
                                            style={{ width: 200 }}
                                        >
                                            <Select placeholder="Source Node">
                                                {predecessorNodes.map(node => (
                                                    <Select.Option key={node.id} value={node.id}>
                                                        {node.data?.form.name || node.id}
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
                                        size="middle"
                                        style={{ marginTop: 8, height: 40 }}
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
    );
};

export default InputReferences;
