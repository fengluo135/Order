import React, { useState } from 'react';
import { Form, Input, DatePicker, Select, InputNumber, Button, Card, Typography, message, Row, Col } from 'antd';
import { EnvironmentOutlined, CalendarOutlined, TeamOutlined, CarOutlined, RocketOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const HomePage = ({ onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const travelData = {
        ...values,
        departureDate: values.departureDate.format('YYYY-MM-DD'),
        travelMode: values.travelMode,
        peopleCount: values.peopleCount,
      };

      message.success('规划方案已生成！');
      onSubmit(travelData);
    } catch (error) {
      message.error('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <Title level={2} style={styles.title}>
            <EnvironmentOutlined /> 旅游规划助手
          </Title>
          <Text style={styles.subtitle}>
            智能规划您的完美旅程
          </Text>
        </div>
      </div>

      <div style={styles.content}>
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={16} xl={14}>
            <Card style={styles.formCard} bordered={false}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  travelMode: 'driving',
                  peopleCount: 1,
                }}
                size="large"
              >
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="出发地"
                      name="departure"
                      rules={[
                        { required: true, message: '请输入出发地' },
                        { min: 2, message: '出发地至少2个字符' },
                      ]}
                    >
                      <Input
                        prefix={<EnvironmentOutlined style={styles.inputIcon} />}
                        placeholder="例如：北京"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="目的地"
                      name="destination"
                      rules={[
                        { required: true, message: '请输入目的地' },
                        { min: 2, message: '目的地至少2个字符' },
                      ]}
                    >
                      <Input
                        prefix={<EnvironmentOutlined style={styles.inputIcon} />}
                        placeholder="例如：上海"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="出发日期"
                      name="departureDate"
                      rules={[
                        { required: true, message: '请选择出发日期' },
                        {
                          validator: (_, value) => {
                            if (value && value.isBefore(dayjs(), 'day')) {
                              return Promise.reject('出发日期不能早于今天');
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <DatePicker
                        style={styles.fullWidth}
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                        suffixIcon={<CalendarOutlined />}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="出行人数"
                      name="peopleCount"
                      rules={[
                        { required: true, message: '请输入出行人数' },
                        { type: 'number', min: 1, max: 100, message: '人数范围 1-100' },
                      ]}
                    >
                      <InputNumber
                        style={styles.fullWidth}
                        min={1}
                        max={100}
                        prefix={<TeamOutlined style={styles.inputIcon} />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="出行方式"
                  name="travelMode"
                  rules={[{ required: true, message: '请选择出行方式' }]}
                >
                  <Select
                    placeholder="请选择出行方式"
                    optionLabelProp="label"
                  >
                    <Select.Option value="driving" label="驾车">
                      <div style={styles.selectOption}>
                        <CarOutlined style={styles.selectIcon} />
                        <span>
                          <Text strong>驾车</Text>
                          <br />
                          <Text type="secondary" style={styles.selectDesc}>适合自由安排时间</Text>
                        </span>
                      </div>
                    </Select.Option>
                    <Select.Option value="public" label="公共交通">
                      <div style={styles.selectOption}>
                        <RocketOutlined style={styles.selectIcon} />
                        <span>
                          <Text strong>公共交通</Text>
                          <br />
                          <Text type="secondary" style={styles.selectDesc}>高铁/火车/客车</Text>
                        </span>
                      </div>
                    </Select.Option>
                    <Select.Option value="airplane" label="飞机">
                      <div style={styles.selectOption}>
                        <RocketOutlined style={styles.selectIcon} />
                        <span>
                          <Text strong>飞机</Text>
                          <br />
                          <Text type="secondary" style={styles.selectDesc}>速度最快的长途选择</Text>
                        </span>
                      </div>
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item style={styles.buttonGroup}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Button
                        block
                        size="large"
                        onClick={handleReset}
                      >
                        重置
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        size="large"
                        style={styles.submitButton}
                      >
                        开始规划
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>

      <div style={styles.footer}>
        <Text type="secondary">
          © 2024 旅游规划助手 - 让每一次旅行更简单
        </Text>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '48px 24px 24px',
    textAlign: 'center',
  },
  headerContent: {
    color: 'white',
  },
  title: {
    color: 'white !important',
    marginBottom: '8px !important',
    fontSize: '36px',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '18px',
  },
  content: {
    flex: 1,
    padding: '0 24px 48px',
  },
  formCard: {
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  },
  inputIcon: {
    color: '#1890ff',
  },
  fullWidth: {
    width: '100%',
  },
  selectOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '4px 0',
  },
  selectIcon: {
    fontSize: '24px',
    color: '#1890ff',
  },
  selectDesc: {
    fontSize: '12px',
  },
  buttonGroup: {
    marginTop: '24px',
    marginBottom: '0',
  },
  submitButton: {
    height: '48px',
    fontSize: '16px',
  },
  footer: {
    textAlign: 'center',
    padding: '24px',
    color: 'rgba(255, 255, 255, 0.7)',
  },
};

export default HomePage;