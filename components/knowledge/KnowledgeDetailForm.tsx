import React from "react";
import { Form, Input } from "antd";
import { useLocale } from "../../locale";

interface KnowledgeDetailFormProps {
  form: any;
}

const KnowledgeDetailForm: React.FC<KnowledgeDetailFormProps> = ({
  form,
}) => {
  const { t } = useLocale('knowledgeDetail');

  return (
    <Form form={form} layout="vertical" >
      <Form.Item
        name="name"
        label={t("name")}
        rules={[{ required: true, message: t("name") }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="description"
        label={t("description")}
        rules={[
          { required: true, message: t("description") },
        ]}
      >
        <Input.TextArea rows={6} />
      </Form.Item>
    </Form>
  );
};

export default KnowledgeDetailForm;
