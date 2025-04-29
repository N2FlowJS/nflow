import { ArrowUpOutlined, CommentOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { FlowNode } from "../../../models/flowTypes";
import { Alert, Card, Space, Typography } from "antd";
import React from "react";
import BaseNodeForm from "./base-node-form";

const { Text } = Typography;

interface InterfaceNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const InterfaceNodeForm: React.FC<InterfaceNodeFormProps> = (props) => {
  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Display Node"
        description="This node automatically displays the output from the previous node. No configuration is needed."
        type="info"
        showIcon
        icon={<CommentOutlined />}
        style={{ marginBottom: 16 }}
      />
      
      <Card 
        title={
          <Text strong>
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            How It Works
          </Text>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <ArrowUpOutlined style={{ marginRight: 8 }} />
            <Text>Automatically displays the output from the previous node.</Text>
          </div>
          
          <div>
            <Text type="secondary">
              This node will display content in the following priority:
            </Text>
            <ol style={{ marginTop: 8, paddingLeft: 24 }}>
              <li>Generated content from AI models</li>
              <li>User input</li>
              <li>The most recent response in flow history</li>
            </ol>
          </div>
          
          <Text type="secondary">
            If this node has no outgoing connections, it will display as the final output.
          </Text>
        </Space>
      </Card>
    </BaseNodeForm>
  );
};

export default InterfaceNodeForm;
