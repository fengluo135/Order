import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, DatePicker, InputNumber, Button, Typography, Row, Col, Checkbox, Tag, message, Space, Divider, Alert } from 'antd';
import { EnvironmentOutlined, CalendarOutlined, UserOutlined, CarOutlined, RocketOutlined, TeamOutlined, ClockCircleOutlined, GlobalOutlined, AimOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const HomePage = ({ onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    form.setFieldsValue({
      departureDate: dayjs().add(1, 'day'),
      tripDays: 3,
      peopleCount: 2,
      travelMode: 'driving',
    });
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      message.error('您的浏览器不支持定位功能');
      setLocationError('浏览器不支持定位');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        message.success('已获取您的位置');

        try {
          const response = await fetch(
            `https://restapi.amap.com/v3/geocode/regeo?key=af70d74c3327876935b62d6862aa4137&location=${longitude},${latitude}`
          );
          const data = await response.json();

          if (data.status === '1' && data.regeocode) {
            const address = data.regeocode.formatted_address;
            form.setFieldsValue({ departure: address });
            message.success('已定位到您的当前位置');
          } else {
            form.setFieldsValue({
              departure: `${latitude.toFixed(4)},${longitude.toFixed(4)}`
            });
            message.warning('已获取坐标，地址解析失败');
          }
        } catch (error) {
          form.setFieldsValue({
            departure: `${latitude.toFixed(4)},${longitude.toFixed(4)}`
          });
          message.warning('已获取坐标，地址解析失败');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        let errorMsg = '获取位置失败';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = '定位权限被拒绝，请允许访问位置';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = '无法获取位置信息';
            break;
          case error.TIMEOUT:
            errorMsg = '定位请求超时';
            break;
        }
        message.error(errorMsg);
        setLocationError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    const travelData = {
      departure: values.departure,
      destination: values.destination,
      departureDate: values.departureDate?.format('YYYY-MM-DD'),
      tripDays: values.tripDays,
      peopleCount: values.peopleCount,
      travelMode: values.travelMode,
      tripTheme: values.tripTheme,
      budget: values.budget,
      specialNeeds: values.specialNeeds || [],
      interests: values.interests || [],
      userRequirements: values.userRequirements || '',
      userLocation: currentLocation,
    };

    setTimeout(() => {
      setLoading(false);
      onSubmit(travelData);
    }, 500);
  };

  const travelThemes = [
    { value: 'nature', label: '🌲 自然风光', description: '山水景点、森林公园、自然保护区' },
    { value: 'culture', label: '🏛️ 历史文化', description: '古迹、博物馆、历史遗址' },
    { value: 'food', label: '🍜 美食之旅', description: '特色小吃、美食街、当地菜系' },
    { value: 'shopping', label: '🛍️ 购物休闲', description: '商业街、购物中心、特产' },
    { value: 'adventure', label: '🎿 探险活动', description: '徒步、登山、极限运动' },
    { value: 'relax', label: '🧘 休闲度假', description: '温泉、海滨、乡村休闲' },
  ];

  const specialNeedsOptions = [
    { value: 'kids', label: '👶 携带儿童' },
    { value: 'elderly', label: '👴 携带老人' },
    { value: 'pet', label: '🐾 携带宠物' },
    { value: 'vegetarian', label: '🥬 素食需求' },
    { value: 'accessible', label: '♿ 无障碍设施' },
  ];

  const interestsOptions = [
    { value: 'photography', label: '📷 摄影' },
    { value: 'food', label: '🍜 美食' },
    { value: 'shopping', label: '🛍️ 购物' },
    { value: 'hiking', label: '🥾 徒步' },
    { value: 'museum', label: '🏛️ 博物馆' },
    { value: 'nightlife', label: '🌃 夜生活' },
  ];

  const budgetOptions = [
    { value: 'low', label: '💰 经济型', description: '每晚200元以下' },
    { value: 'medium', label: '💵 舒适型', description: '每晚200-500元' },
    { value: 'high', label: '💎 豪华型', description: '每晚500元以上' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <Title level={2} style={styles.title}>
            <GlobalOutlined /> 旅游规划助手
          </Title>
          <Paragraph type="secondary" style={styles.subtitle}>
            智能分析您的偏好，结合高德地图实时数据和豆包AI，为您打造专属旅游攻略
          </Paragraph>
          <div style={styles.featureTags}>
            <Tag icon={<EnvironmentOutlined />} color="blue">智能路线规划</Tag>
            <Tag icon={<AimOutlined />} color="green">实时地图数据</Tag>
            <Tag icon={<EditOutlined />} color="orange">AI详细攻略</Tag>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <Card style={styles.card} bordered={false}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
          >
            <Row gutter={24}>
              <Col xs={24} lg={12}>
                <Form.Item
                  label={<Text strong><EnvironmentOutlined /> 出发地</Text>}
                  name="departure"
                  rules={[{ required: true, message: '请输入出发地' }, { min: 2, message: '至少输入2个字符' }]}
                >
                  <Input
                    placeholder="请输入出发城市或地址"
                    suffix={
                      <Button
                        type="link"
                        icon={<AimOutlined />}
                        loading={locationLoading}
                        onClick={handleGetLocation}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        {locationLoading ? '定位中...' : '获取位置'}
                      </Button>
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  label={<Text strong><EnvironmentOutlined /> 目的地</Text>}
                  name="destination"
                  rules={[{ required: true, message: '请输入目的地' }, { min: 2, message: '至少输入2个字符' }]}
                >
                  <Input placeholder="请输入目的城市或地址" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} lg={8}>
                <Form.Item
                  label={<Text strong><CalendarOutlined /> 出发日期</Text>}
                  name="departureDate"
                  rules={[{ required: true, message: '请选择出发日期' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item
                  label={<Text strong><ClockCircleOutlined /> 行程天数</Text>}
                  name="tripDays"
                  rules={[{ required: true, message: '请选择行程天数' }]}
                >
                  <Select placeholder="请选择行程天数">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 21, 30].map((day) => (
                      <Option key={day} value={day}>{day}天</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item
                  label={<Text strong><TeamOutlined /> 出行人数</Text>}
                  name="peopleCount"
                  rules={[{ required: true, message: '请选择出行人数' }]}
                >
                  <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="请输入人数" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} lg={8}>
                <Form.Item
                  label={<Text strong>出行方式</Text>}
                  name="travelMode"
                  rules={[{ required: true, message: '请选择出行方式' }]}
                >
                  <Select placeholder="请选择出行方式">
                    <Option value="driving">
                      <Space><CarOutlined /> 驾车</Space>
                    </Option>
                    <Option value="public">
                      <Space><RocketOutlined /> 公共交通</Space>
                    </Option>
                    <Option value="airplane">
                      <Space><RocketOutlined /> 飞机</Space>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item
                  label={<Text strong>旅游主题</Text>}
                  name="tripTheme"
                  rules={[{ required: true, message: '请选择旅游主题' }]}
                >
                  <Select placeholder="请选择旅游主题">
                    {travelThemes.map((theme) => (
                      <Option key={theme.value} value={theme.value}>{theme.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item
                  label={<Text strong>预算范围</Text>}
                  name="budget"
                  rules={[{ required: true, message: '请选择预算范围' }]}
                >
                  <Select placeholder="请选择预算范围">
                    {budgetOptions.map((budget) => (
                      <Option key={budget.value} value={budget.value}>{budget.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} lg={12}>
                <Form.Item
                  label={<Text strong>特殊需求</Text>}
                  name="specialNeeds"
                >
                  <Checkbox.Group options={specialNeedsOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  label={<Text strong>兴趣偏好</Text>}
                  name="interests"
                >
                  <Checkbox.Group options={interestsOptions} />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Form.Item
              label={<Text strong><EditOutlined /> 您的个性化需求（可选）</Text>}
              name="userRequirements"
              extra={<Text type="secondary">告诉豆包AI您想要什么样的旅行体验，例如：喜欢拍照、希望每天早起、想吃当地特色美食、想体验当地文化等</Text>}
            >
              <TextArea
                rows={4}
                placeholder={`请描述您的旅行需求，例如：
- 喜欢拍照，想要最佳拍照点和日出日落
- 希望行程不要太赶，每天睡到自然醒
- 想要尝试当地特色美食和小吃
- 对历史文化感兴趣，想要深度了解
- 想要一些冷门但很棒的景点推荐
- 带着孩子，需要儿童友好的活动`}
                maxLength={1000}
                showCount
              />
            </Form.Item>

            {currentLocation && (
              <Alert
                message="位置已获取"
                description={`已获取您的当前位置：${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}，可作为出发地使用`}
                type="success"
                showIcon
                icon={<AimOutlined />}
                style={{ marginBottom: 24 }}
              />
            )}

            {locationError && (
              <Alert
                message="定位失败"
                description={locationError}
                type="warning"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                icon={<GlobalOutlined />}
                style={styles.submitButton}
              >
                {loading ? 'AI正在分析中...' : '开始智能规划'}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card style={styles.tipsCard} bordered={false}>
          <Title level={5} style={styles.tipsTitle}>💡 使用提示</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div style={styles.tipItem}>
                <Text strong>📍 精准定位</Text>
                <br />
                <Text type="secondary" style={styles.tipText}>点击「获取位置」可自动获取您当前的位置作为出发地</Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={styles.tipItem}>
                <Text strong>🤖 AI智能分析</Text>
                <br />
                <Text type="secondary" style={styles.tipText}>结合您的偏好和高德实时数据，豆包AI将为您生成详细攻略</Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={styles.tipItem}>
                <Text strong>📝 详细描述需求</Text>
                <br />
                <Text type="secondary" style={styles.tipText}>在个性化需求框中描述您的期望，获得更符合心意的行程</Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  header: { background: 'rgba(255, 255, 255, 0.95)', padding: '32px 24px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
  headerContent: { maxWidth: '800px', margin: '0 auto', textAlign: 'center' },
  title: { margin: '0 0 8px 0 !important', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  subtitle: { margin: '0 0 16px 0', fontSize: '16px' },
  featureTags: { display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' },
  content: { maxWidth: '1000px', margin: '0 auto', padding: '24px' },
  card: { borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
  tipsCard: { borderRadius: '12px', background: 'rgba(255, 255, 255, 0.9)' },
  tipsTitle: { margin: '0 0 16px 0', textAlign: 'center' },
  tipItem: { textAlign: 'center', padding: '8px' },
  tipText: { fontSize: '12px' },
  submitButton: { height: '48px', fontSize: '16px', borderRadius: '8px', marginTop: '8px' },
};

export default HomePage;