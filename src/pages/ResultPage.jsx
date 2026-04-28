import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Descriptions, Timeline, Button, Spin, Empty, Tag, Divider, Modal, message, Tabs, List, Alert } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, CalendarOutlined, TeamOutlined, CarOutlined, RocketOutlined, ExclamationCircleOutlined, BulbOutlined, CloudOutlined, ClockCircleOutlined, HeartOutlined, CameraOutlined, CoffeeOutlined, HomeOutlined, GlobalOutlined, AimOutlined, WarningOutlined } from '@ant-design/icons';
import AIService from '../services/AIService';

const { Title, Text, Paragraph } = Typography;

const ResultPage = ({ travelData, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [itineraryData, setItineraryData] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('loading');

  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    if (!travelData) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setApiStatus('loading');

      const data = await AIService.generateItinerary(travelData);
      setItineraryData(data);
      setApiStatus('success');
      message.success('路线规划已完成！');
    } catch (error) {
      console.error('加载数据失败:', error);
      setError(error.message || '加载数据失败，请重试');
      setApiStatus('error');
      message.error('加载失败：' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

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

  const formatDistance = (meters) => {
    if (!meters) return '未知';
    if (meters >= 1000) {
      return (meters / 1000).toFixed(1) + '公里';
    }
    return meters + '米';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '未知';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  const showAIStrategy = () => {
    setAiModalVisible(true);
  };

  const handleAIGenerate = async () => {
    setGenerating(true);
    setAiModalVisible(false);
    message.loading('AI正在为您生成专属攻略...', 1.5);

    try {
      const data = await AIService.generateItinerary(travelData);
      setItineraryData(data);
      message.success('AI攻略已生成！');
    } catch (error) {
      message.error('生成失败：' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading || generating) {
    return (
      <div style={styles.loadingContainer}>
        <Spin size="large" tip={generating ? 'AI正在生成专属攻略...' : '正在加载路线信息...'} />
        {apiStatus === 'loading' && (
          <Text type="secondary">正在调用高德地图API获取真实数据...</Text>
        )}
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

  if (error) {
    return (
      <div style={styles.emptyContainer}>
        <Alert
          message="数据加载失败"
          description={error}
          type="error"
          showIcon
          icon={<WarningOutlined />}
          action={
            <Button size="small" type="primary" onClick={loadRealData}>
              重试
            </Button>
          }
        />
        <Button type="primary" onClick={onBack} style={{ marginTop: 16 }}>
          返回首页
        </Button>
      </div>
    );
  }

  const routeInfo = itineraryData?.route || {
    distance: '未知',
    duration: '未知',
  };

  const dailySchedules = itineraryData?.dailySchedules || [];
  const recommendations = itineraryData?.recommendations || {};
  const tips = itineraryData?.tips || [];

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
          {apiStatus === 'success' && (
            <Tag color="success" style={{ marginLeft: 8 }}>高德API数据</Tag>
          )}
        </div>
      </div>

      <div style={styles.content}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {dailySchedules.length > 0 && (
              <Card style={styles.card} bordered={false}>
                <div style={styles.cardHeader}>
                  <Title level={4} style={styles.cardTitle}>
                    <CalendarOutlined /> 每日行程安排
                  </Title>
                  <Tag color="blue">{getTravelModeLabel(travelData.travelMode)}</Tag>
                </div>
                <Tabs defaultActiveKey="1" type="card">
                  {dailySchedules.map((daySchedule) => (
                    <Tabs.TabPane
                      tab={`第${daySchedule.day}天`}
                      key={daySchedule.day}
                    >
                      <div style={styles.dayInfo}>
                        <Row gutter={16}>
                          <Col span={8}>
                            <Tag color="green" icon={<CloudOutlined />}>
                              {daySchedule.weather?.condition || '未知'}
                            </Tag>
                            <Text type="secondary" style={{ marginLeft: 8 }}>
                              {daySchedule.weather?.temperature || '未知'}
                            </Text>
                          </Col>
                          <Col span={8}>
                            <Tag color="orange" icon={<HomeOutlined />}>
                              住宿推荐
                            </Tag>
                          </Col>
                          <Col span={8}>
                            <Tag color="red" icon={<CoffeeOutlined />}>
                              美食推荐
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
            )}

            <Card style={styles.card} bordered={false}>
              <div style={styles.cardHeader}>
                <Title level={4} style={styles.cardTitle}>
                  <EnvironmentOutlined /> 路线信息
                </Title>
              </div>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="出发地">
                  {itineraryData?.departure?.name || travelData.departure}
                  {itineraryData?.departure?.location && (
                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                      ({itineraryData.departure.location.lng.toFixed(2)}, {itineraryData.departure.location.lat.toFixed(2)})
                    </Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="目的地">
                  {itineraryData?.destination?.name || travelData.destination}
                  {itineraryData?.destination?.city && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>{itineraryData.destination.city}</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="出行方式">
                  {getTravelModeIcon(travelData.travelMode)} {getTravelModeLabel(travelData.travelMode)}
                </Descriptions.Item>
                <Descriptions.Item label="行程距离">{formatDistance(parseInt(routeInfo.distance))}</Descriptions.Item>
                <Descriptions.Item label="预计耗时">{formatDuration(parseInt(routeInfo.duration))}</Descriptions.Item>
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

            {recommendations.attractions?.length > 0 && (
              <Card style={styles.card} bordered={false}>
                <div style={styles.cardHeader}>
                  <Title level={4} style={styles.cardTitle}>
                    <CameraOutlined /> 推荐景点
                  </Title>
                </div>
                <List
                  size="small"
                  dataSource={recommendations.attractions.slice(0, 5)}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<AimOutlined style={{ color: '#1890ff' }} />}
                        title={item.name}
                        description={item.address || item.type}
                      />
                      {item.distance && (
                        <Tag>{parseInt(item.distance)}米</Tag>
                      )}
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {recommendations.restaurants?.length > 0 && (
              <Card style={styles.card} bordered={false}>
                <div style={styles.cardHeader}>
                  <Title level={4} style={styles.cardTitle}>
                    <CoffeeOutlined /> 推荐美食
                  </Title>
                </div>
                <List
                  size="small"
                  dataSource={recommendations.restaurants.slice(0, 5)}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<CoffeeOutlined style={{ color: '#ff6b6b' }} />}
                        title={item.name}
                        description={item.address || item.type}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}

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
                重新生成攻略
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
                {itineraryData?.weather ? (
                  <>
                    <div style={styles.weatherIcon}>
                      <CloudOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                    </div>
                    <Text strong style={styles.weatherTemp}>{itineraryData.weather.temperature}°C</Text>
                    <Paragraph style={styles.weatherDesc}>
                      {itineraryData.weather.weather}
                    </Paragraph>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="风力">{itineraryData.weather.wind}</Descriptions.Item>
                      <Descriptions.Item label="湿度">{itineraryData.weather.humidity}%</Descriptions.Item>
                      <Descriptions.Item label="更新时间">{itineraryData.weather.reportTime}</Descriptions.Item>
                    </Descriptions>
                  </>
                ) : (
                  <Text type="secondary">正在获取天气信息...</Text>
                )}
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
                  路线距离：{formatDistance(parseInt(routeInfo.distance))}
                </Text>
                <Text type="secondary" style={styles.mapNote}>
                  预计时间：{formatDuration(parseInt(routeInfo.duration))}
                </Text>
              </div>
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
              </Descriptions>
            </Card>

            {tips.length > 0 && (
              <Card style={styles.card} bordered={false}>
                <div style={styles.cardHeader}>
                  <Title level={4} style={styles.cardTitle}>
                    <WarningOutlined /> 出行提示
                  </Title>
                </div>
                <ul style={styles.tipsList}>
                  {tips.map((tip, index) => (
                    <li key={index} style={styles.tipsItem}>
                      <Text type="secondary">{tip}</Text>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
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
          <Button key="generate" type="primary" onClick={handleAIGenerate} loading={generating}>
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
            <Descriptions.Item label="行程天数">{travelData.tripDays}天</Descriptions.Item>
          </Descriptions>
          <Divider />
          <Text type="secondary">
            💡 将调用高德地图API获取真实路线、景点和天气数据
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
  tipsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  tipsItem: {
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0',
  },
};

export default ResultPage;