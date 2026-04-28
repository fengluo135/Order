import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Descriptions, Timeline, Button, Spin, Empty, Tag, Divider, Modal, message, Tabs } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, CalendarOutlined, TeamOutlined, CarOutlined, RocketOutlined, ExclamationCircleOutlined, BulbOutlined, CloudOutlined, ClockCircleOutlined, HeartOutlined, CameraOutlined, CoffeeOutlined, HomeOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const ResultPage = ({ travelData, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [aiModalVisible, setAiModalVisible] = useState(false);

  // 模拟加载
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const getTravelModeLabel = (mode) => {
    const modes = {
      driving: '驾车',
      public: '公共交通',
      airplane: '飞机',
    };
    return modes[mode] || mode;
  };

  const getTravelModeIcon = (mode) => {
    const icons = {
      driving: <CarOutlined />,
      public: <RocketOutlined />,
      airplane: <RocketOutlined />,
    };
    return icons[mode] || <CarOutlined />;
  };

  const generateMockRoute = () => {
    // 确保travelData存在
    if (!travelData) {
      return {
        duration: '0小时',
        distance: '0公里',
        dailySchedules: [],
        weather: {
          forecast: '未知',
          averageTemp: '未知',
        },
        accommodation: '未知',
        food: '未知',
        attractions: [],
      };
    }

    const { departure, destination, travelMode, departureDate, peopleCount, tripDays, tripTheme, budget, specialNeeds, interests } = travelData;

    const baseTime = {
      driving: { duration: '6小时30分钟', distance: '580公里' },
      public: { duration: '4小时30分钟', distance: '高铁580公里' },
      airplane: { duration: '2小时15分钟', distance: '飞行距离800公里' },
    };

    const info = baseTime[travelMode] || baseTime.driving;

    const generateDailySchedule = (day) => {
      const schedules = {
        nature: [
          { time: '08:00', title: '早餐', description: '酒店自助早餐' },
          { time: '09:00', title: '景点游览', description: day === 1 ? '西湖景区' : day === 2 ? '灵隐寺' : '千岛湖' },
          { time: '12:00', title: '午餐', description: '当地特色餐厅' },
          { time: '14:00', title: '户外活动', description: day === 1 ? '西湖游船' : day === 2 ? '飞来峰' : '千岛湖游船' },
          { time: '17:00', title: '自由活动', description: '购物或休息' },
          { time: '19:00', title: '晚餐', description: '当地美食' },
        ],
        culture: [
          { time: '08:00', title: '早餐', description: '酒店自助早餐' },
          { time: '09:00', title: '文化景点', description: day === 1 ? '故宫' : day === 2 ? '颐和园' : '八达岭长城' },
          { time: '12:00', title: '午餐', description: '老字号餐厅' },
          { time: '14:00', title: '博物馆', description: day === 1 ? '国家博物馆' : day === 2 ? '首都博物馆' : '长城博物馆' },
          { time: '17:00', title: '自由活动', description: '购物或休息' },
          { time: '19:00', title: '晚餐', description: '北京烤鸭' },
        ],
        food: [
          { time: '08:00', title: '早餐', description: '当地特色早餐' },
          { time: '09:00', title: '美食之旅', description: day === 1 ? '小吃街' : day === 2 ? '海鲜市场' : '农家乐' },
          { time: '12:00', title: '午餐', description: '推荐餐厅' },
          { time: '14:00', title: '甜点品尝', description: '当地甜品' },
          { time: '17:00', title: '自由活动', description: '购物或休息' },
          { time: '19:00', title: '晚餐', description: '特色美食' },
        ],
        shopping: [
          { time: '09:00', title: '早餐', description: '酒店自助早餐' },
          { time: '10:00', title: '购物', description: day === 1 ? '购物中心' : day === 2 ? '步行街' : '特色市场' },
          { time: '12:00', title: '午餐', description: '商场餐厅' },
          { time: '14:00', title: '继续购物', description: '品牌店' },
          { time: '17:00', title: '自由活动', description: '休息' },
          { time: '19:00', title: '晚餐', description: '美食街' },
        ],
        adventure: [
          { time: '07:00', title: '早餐', description: '酒店早餐' },
          { time: '08:00', title: '户外活动', description: day === 1 ? '漂流' : day === 2 ? '徒步' : '攀岩' },
          { time: '12:00', title: '午餐', description: '户外野餐' },
          { time: '14:00', title: '继续活动', description: day === 1 ? '皮划艇' : day === 2 ? '登山' : '蹦极' },
          { time: '17:00', title: '休息', description: '返回酒店' },
          { time: '19:00', title: '晚餐', description: '烧烤' },
        ],
        relax: [
          { time: '09:00', title: '早餐', description: '酒店自助早餐' },
          { time: '10:00', title: '休闲活动', description: day === 1 ? '温泉' : day === 2 ? 'SPA' : '高尔夫' },
          { time: '12:00', title: '午餐', description: '酒店餐厅' },
          { time: '14:00', title: '自由活动', description: '休息或游泳' },
          { time: '17:00', title: '夕阳活动', description: '海边散步' },
          { time: '19:00', title: '晚餐', description: '烛光晚餐' },
        ],
      };

      return schedules[tripTheme] || schedules.nature;
    };

    const dailySchedules = [];
    const days = tripDays || 3;
    for (let day = 1; day <= days; day++) {
      dailySchedules.push({
        day,
        date: departureDate ? new Date(departureDate) : new Date(),
        schedule: generateDailySchedule(day),
        weather: {
          temperature: '18-25°C',
          condition: ['晴', '多云', '小雨'][Math.floor(Math.random() * 3)],
          wind: '微风',
        },
        accommodation: `推荐住宿：${destination || '当地'}${day}号酒店`,
        food: `推荐美食：${destination || '当地'}特色菜${day}`,
      });
    }

    return {
      ...info,
      dailySchedules,
      weather: {
        forecast: '未来几天天气良好，适合旅游',
        averageTemp: '18-25°C',
      },
      accommodation: '推荐住宿：市中心酒店',
      food: '推荐美食：当地特色餐厅',
      attractions: ['景点1', '景点2', '景点3'],
    };
  };

  const showAIStrategy = () => {
    setAiModalVisible(true);
  };

  const handleAIGenerate = () => {
    message.loading('AI正在为您生成专属攻略...', 2);
    setTimeout(() => {
      setAiModalVisible(false);
      message.success('AI攻略已生成！');
    }, 2000);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Spin size="large" tip="正在规划您的行程..." />
      </div>
    );
  }

  if (!travelData) {
    return (
      <div style={styles.emptyContainer}>
        <Empty description="暂无旅行信息" />
        <Button type="primary" onClick={onBack} style={{ marginTop: 16 }}>
          返回首页
        </Button>
      </div>
    );
  }

  const routeInfo = generateMockRoute();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={styles.backButton}
          >
            返回
          </Button>
          <Title level={2} style={styles.title}>
            <EnvironmentOutlined /> 详细旅游攻略
          </Title>
          <Text type="secondary">
            {travelData.departure} → {travelData.destination} | {travelData.tripDays}天行程
          </Text>
        </div>
      </div>

      <div style={styles.content}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card style={styles.card} bordered={false}>
              <div style={styles.cardHeader}>
                <Title level={4} style={styles.cardTitle}>
                  <CalendarOutlined /> 每日行程安排
                </Title>
                <Tag color="blue">{getTravelModeLabel(travelData.travelMode)}</Tag>
              </div>
              <Tabs defaultActiveKey="1" type="card">
                {routeInfo.dailySchedules.map((daySchedule, index) => (
                  <Tabs.TabPane
                    tab={`第${daySchedule.day}天`}
                    key={daySchedule.day}
                  >
                    <div style={styles.dayInfo}>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Tag color="green" icon={<CloudOutlined />}>
                            {daySchedule.weather.condition}
                          </Tag>
                          <Text type="secondary" style={{ marginLeft: 8 }}>
                            {daySchedule.weather.temperature}
                          </Text>
                        </Col>
                        <Col span={8}>
                          <Tag color="orange" icon={<HomeOutlined />}>
                            {daySchedule.accommodation}
                          </Tag>
                        </Col>
                        <Col span={8}>
                          <Tag color="red" icon={<CoffeeOutlined />}>
                            {daySchedule.food}
                          </Tag>
                        </Col>
                      </Row>
                      <Divider />
                    </div>
                    <Timeline
                      items={daySchedule.schedule.map((item, itemIndex) => ({
                        color: itemIndex === 0 || itemIndex === daySchedule.schedule.length - 1 ? 'blue' : 'gray',
                        children: (
                          <div style={styles.timelineItem}>
                            <Text strong style={styles.timelineTime}>{item.time}</Text>
                            <Text strong style={styles.timelineTitle}>{item.title}</Text>
                            <Paragraph type="secondary" style={styles.timelineDesc}>
                              {item.description}
                            </Paragraph>
                          </div>
                        ),
                      }))}
                    />
                  </Tabs.TabPane>
                ))}
              </Tabs>
            </Card>

            <Card style={styles.card} bordered={false}>
              <div style={styles.cardHeader}>
                <Title level={4} style={styles.cardTitle}>
                  <EnvironmentOutlined /> 路线信息
                </Title>
              </div>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="出发地">{travelData.departure}</Descriptions.Item>
                <Descriptions.Item label="目的地">{travelData.destination}</Descriptions.Item>
                <Descriptions.Item label="出行方式">
                  {getTravelModeIcon(travelData.travelMode)} {getTravelModeLabel(travelData.travelMode)}
                </Descriptions.Item>
                <Descriptions.Item label="行程距离">{routeInfo.distance}</Descriptions.Item>
                <Descriptions.Item label="预计耗时">{routeInfo.duration}</Descriptions.Item>
                <Descriptions.Item label="出发日期">{travelData.departureDate}</Descriptions.Item>
                <Descriptions.Item label="出行人数">{travelData.peopleCount} 人</Descriptions.Item>
                <Descriptions.Item label="行程天数">{travelData.tripDays} 天</Descriptions.Item>
                <Descriptions.Item label="旅游主题">
                  {{
                    nature: '自然风光',
                    culture: '历史文化',
                    food: '美食之旅',
                    shopping: '购物休闲',
                    adventure: '探险活动',
                    relax: '休闲度假',
                  }[travelData.tripTheme]}
                </Descriptions.Item>
                <Descriptions.Item label="预算范围">
                  {{
                    low: '经济型',
                    medium: '舒适型',
                    high: '豪华型',
                  }[travelData.budget]}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card style={styles.card} bordered={false}>
              <div style={styles.cardHeader}>
                <Title level={4} style={styles.cardTitle}>
                  <BulbOutlined /> AI攻略助手
                </Title>
              </div>
              <Paragraph type="secondary">
                点击下方按钮，让AI根据您的出行信息为您生成专属旅游攻略，包括美食推荐、景点介绍、注意事项等。
              </Paragraph>
              <Button
                type="primary"
                icon={<BulbOutlined />}
                onClick={showAIStrategy}
                style={styles.aiButton}
              >
                AI生成专属攻略
              </Button>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card style={styles.card} bordered={false}>
              <div style={styles.cardHeader}>
                <Title level={4} style={styles.cardTitle}>
                  <CloudOutlined /> 天气信息
                </Title>
              </div>
              <div style={styles.weatherCard}>
                <div style={styles.weatherIcon}>
                  <CloudOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                </div>
                <Text strong style={styles.weatherTemp}>{routeInfo.weather.averageTemp}</Text>
                <Paragraph style={styles.weatherDesc}>
                  {routeInfo.weather.forecast}
                </Paragraph>
                <Divider />
                <Text type="secondary">
                  💡 扩展接口已预留：WeatherService.getForecast(destination, dates)
                </Text>
              </div>
            </Card>

            <Card style={styles.card} bordered={false}>
              <div style={styles.cardHeader}>
                <Title level={4} style={styles.cardTitle}>
                  <GlobalOutlined /> 地图预览
                </Title>
                <Tag color="green">高德地图</Tag>
              </div>
              <div style={styles.mapPlaceholder}>
                <EnvironmentOutlined style={styles.mapIcon} />
                <Text type="secondary">
                  {travelData.departure} → {travelData.destination}
                </Text>
                <Text type="secondary" style={styles.mapNote}>
                  地图预览区域（需配置高德地图API）
                </Text>
              </div>
              <Divider />
              <Text type="secondary" style={styles.extensionNote}>
                💡 扩展接口已预留：AMapService.renderMap(departure, destination)
              </Text>
            </Card>

            <Card style={styles.card} bordered={false}>
              <div style={styles.cardHeader}>
                <Title level={4} style={styles.cardTitle}>
                  <TeamOutlined /> 旅行信息汇总
                </Title>
              </div>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="最佳出行时间">上午出发</Descriptions.Item>
                <Descriptions.Item label="建议装备">
                  身份证、手机、充电宝、钱包、舒适鞋子
                </Descriptions.Item>
                <Descriptions.Item label="特殊需求">
                  {travelData.specialNeeds?.length ? travelData.specialNeeds.join('、') : '无'}
                </Descriptions.Item>
                <Descriptions.Item label="兴趣偏好">
                  {travelData.interests?.length ? travelData.interests.join('、') : '无'}
                </Descriptions.Item>
                <Descriptions.Item label="推荐景点">
                  {routeInfo.attractions.join('、')}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        title={
          <span>
            <BulbOutlined /> AI专属攻略生成
          </span>
        }
        open={aiModalVisible}
        onCancel={() => setAiModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAiModalVisible(false)}>
            取消
          </Button>,
          <Button key="generate" type="primary" onClick={handleAIGenerate}>
            开始生成
          </Button>,
        ]}
      >
        <div style={styles.modalContent}>
          <ExclamationCircleOutlined style={styles.modalIcon} />
          <Paragraph>
            AI将根据您的出行信息（{travelData.departure} → {travelData.destination}）生成专属攻略。
          </Paragraph>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="目的地">{travelData.destination}</Descriptions.Item>
            <Descriptions.Item label="出行方式">{getTravelModeLabel(travelData.travelMode)}</Descriptions.Item>
            <Descriptions.Item label="出行人数">{travelData.peopleCount}人</Descriptions.Item>
          </Descriptions>
          <Divider />
          <Text type="secondary">
            💡 扩展接口已预留：AIService.generateItinerary(travelData)
          </Text>
        </div>
      </Modal>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f0f2f5',
  },
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '16px',
  },
  emptyContainer: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  header: {
    background: 'white',
    padding: '16px 24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  backButton: {
    color: '#666',
    marginBottom: '8px',
    paddingLeft: '0',
  },
  title: {
    margin: '0 !important',
    color: '#333',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
  },
  card: {
    borderRadius: '8px',
    marginBottom: '24px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  cardTitle: {
    margin: '0 !important',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  timelineItem: {
    paddingBottom: '8px',
  },
  timelineTime: {
    color: '#1890ff',
    marginRight: '12px',
  },
  timelineTitle: {
    color: '#333',
  },
  timelineDesc: {
    margin: '4px 0 0 0 !important',
    fontSize: '12px',
  },
  dayInfo: {
    marginBottom: '16px',
  },
  weatherCard: {
    textAlign: 'center',
    padding: '24px',
  },
  weatherIcon: {
    marginBottom: '16px',
  },
  weatherTemp: {
    fontSize: '24px',
    display: 'block',
    marginBottom: '8px',
  },
  weatherDesc: {
    margin: '0 !important',
    color: '#666',
  },
  mapPlaceholder: {
    height: '300px',
    background: '#f5f5f5',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    border: '1px dashed #d9d9d9',
  },
  mapIcon: {
    fontSize: '48px',
    color: '#1890ff',
  },
  mapNote: {
    fontSize: '12px',
  },
  extensionNote: {
    fontSize: '12px',
    display: 'block',
    textAlign: 'center',
  },
  aiButton: {
    marginTop: '16px',
    width: '100%',
    height: '44px',
    fontSize: '16px',
  },
  modalContent: {
    padding: '16px 0',
  },
  modalIcon: {
    fontSize: '24px',
    color: '#1890ff',
    marginBottom: '16px',
  },
};

export default ResultPage;