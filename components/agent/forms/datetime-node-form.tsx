import { CalendarOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { Alert, Collapse, Form, Input, InputNumber, Select, Space, Typography } from 'antd';
import React from 'react';
import { useLocale } from '../../../locale';
import { FlowNode } from '../../../models/flowTypes';
import BaseNodeForm from './base-node-form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { Text } = Typography;

interface DateTimeNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DateTimeNodeForm: React.FC<DateTimeNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message={t('dateTimeNodeTitle')}
        description={t('dateTimeNodeDescription')}
        type="info"
        showIcon
        icon={<FieldTimeOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['datetime', 'config']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'datetime',
            label: (
              <Text strong>
                <CalendarOutlined style={{ marginRight: 8 }} />
                {t('dateTimeConfigurationLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="operation"
                  label={t('dateTimeOperationLabel')}
                  help={t('dateTimeOperationHelp')}
                  initialValue="now"
                  rules={[{ required: true, message: t('dateTimeOperationRequired') }]}
                >
                  <Select>
                    <Select.Option value="now">{t('nowOperation')}</Select.Option>
                    <Select.Option value="format">{t('formatOperation')}</Select.Option>
                    <Select.Option value="parse">{t('parseOperation')}</Select.Option>
                    <Select.Option value="add">{t('addOperation')}</Select.Option>
                    <Select.Option value="subtract">{t('subtractOperation')}</Select.Option>
                    <Select.Option value="compare">{t('compareOperation')}</Select.Option>
                    <Select.Option value="timezone">{t('timezoneOperation')}</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return operation !== 'now' ? (
                      <Form.Item
                        name="inputDate"
                        label={t('inputDateLabel')}
                        help={t('inputDateHelp')}
                        rules={[{ required: true, message: t('inputDateRequired') }]}
                      >
                        <Input placeholder={t('inputDatePlaceholder')} />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return ['now', 'format'].includes(operation) ? (
                      <Form.Item
                        name="format"
                        label={t('formatLabel')}
                        help={t('formatHelp')}
                        initialValue="ISO"
                      >
                        <Select>
                          <Select.Option value="ISO">{t('isoFormat')}</Select.Option>
                          <Select.Option value="timestamp">{t('timestampFormat')}</Select.Option>
                          <Select.Option value="date">{t('dateFormat')}</Select.Option>
                          <Select.Option value="time">{t('timeFormat')}</Select.Option>
                          <Select.Option value="locale">{t('localeFormat')}</Select.Option>
                          <Select.Option value="YYYY-MM-DD">{t('customFormat')} (YYYY-MM-DD)</Select.Option>
                          <Select.Option value="DD/MM/YYYY">{t('customFormat')} (DD/MM/YYYY)</Select.Option>
                          <Select.Option value="YYYY-MM-DD HH:mm:ss">{t('customFormat')} (YYYY-MM-DD HH:mm:ss)</Select.Option>
                        </Select>
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return ['add', 'subtract'].includes(operation) ? (
                      <>
                        <Form.Item
                          name="amount"
                          label={t('amountLabel')}
                          help={t('amountHelp')}
                          initialValue={1}
                          rules={[{ required: true, type: 'number', min: 1 }]}
                        >
                          <InputNumber
                            min={1}
                            style={{ width: '100%' }}
                            placeholder={t('amountPlaceholder')}
                          />
                        </Form.Item>
                        
                        <Form.Item
                          name="unit"
                          label={t('timeUnitLabel')}
                          help={t('timeUnitHelp')}
                          initialValue="days"
                        >
                          <Select>
                            <Select.Option value="seconds">{t('secondsUnit')}</Select.Option>
                            <Select.Option value="minutes">{t('minutesUnit')}</Select.Option>
                            <Select.Option value="hours">{t('hoursUnit')}</Select.Option>
                            <Select.Option value="days">{t('daysUnit')}</Select.Option>
                            <Select.Option value="weeks">{t('weeksUnit')}</Select.Option>
                            <Select.Option value="months">{t('monthsUnit')}</Select.Option>
                            <Select.Option value="years">{t('yearsUnit')}</Select.Option>
                          </Select>
                        </Form.Item>
                      </>
                    ) : null;
                  }}
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return operation === 'timezone' ? (
                      <Form.Item
                        name="timezone"
                        label={t('timezoneLabel')}
                        help={t('timezoneHelp')}
                        initialValue="UTC"
                      >
                        <Select showSearch>
                          <Select.Option value="UTC">UTC</Select.Option>
                          <Select.Option value="America/New_York">America/New_York</Select.Option>
                          <Select.Option value="America/Los_Angeles">America/Los_Angeles</Select.Option>
                          <Select.Option value="Europe/London">Europe/London</Select.Option>
                          <Select.Option value="Europe/Paris">Europe/Paris</Select.Option>
                          <Select.Option value="Asia/Tokyo">Asia/Tokyo</Select.Option>
                          <Select.Option value="Asia/Shanghai">Asia/Shanghai</Select.Option>
                          <Select.Option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</Select.Option>
                          <Select.Option value="Australia/Sydney">Australia/Sydney</Select.Option>
                        </Select>
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>
              </Space>
            ),
          },
        ]}
      />

      <Alert
        message={t('dateTimeExamplesTitle')}
        description={
          <div>
            <p>{t('dateTimeExamplesDescription')}</p>
            <ul>
              <li>{t('dateTimeExample1')}</li>
              <li>{t('dateTimeExample2')}</li>
              <li>{t('dateTimeExample3')}</li>
              <li>{t('dateTimeExample4')}</li>
            </ul>
          </div>
        }
        type="info"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default DateTimeNodeForm;
