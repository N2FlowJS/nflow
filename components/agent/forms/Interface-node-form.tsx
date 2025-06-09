import { ArrowUpOutlined, CommentOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { FlowNode } from "../../../models/flowTypes";
import { Alert, Card, Space, Typography } from "antd";
import React from "react";
import BaseNodeForm from "./base-node-form";
import { useLocale } from "../../../locale";

const { Text } = Typography;

interface InterfaceNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const InterfaceNodeForm: React.FC<InterfaceNodeFormProps> = (props) => {
  const { t } = useLocale('form.nodeForm');
  return (
    <BaseNodeForm {...props}>
      <Alert
        message={t('displayNodeMessage')}
        description={t('displayNodeDescription')}
        type="info"
        showIcon
        icon={<CommentOutlined />}
        style={{ marginBottom: 16 }}
      />
      
      <Card 
        title={
          <Text strong>
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            {t('howItWorksTitle')}
          </Text>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <ArrowUpOutlined style={{ marginRight: 8 }} />
            <Text>{t('displayNodeHowItWorksText1')}</Text>
          </div>
          
          <div>
            <Text type="secondary">
              {t('displayNodeHowItWorksText2')}
            </Text>
            <ol style={{ marginTop: 8, paddingLeft: 24 }}>
              <li>{t('displayNodePriorityItem1')}</li>
              <li>{t('displayNodePriorityItem2')}</li>
              <li>{t('displayNodePriorityItem3')}</li>
            </ol>
          </div>
          
          <Text type="secondary">
            {t('displayNodeHowItWorksText3')}
          </Text>
        </Space>
      </Card>
    </BaseNodeForm>
  );
};

export default InterfaceNodeForm;
