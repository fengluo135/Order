import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Descriptions, Timeline, Button, Spin, Empty, Tag, Divider, Modal, message, Tabs, List, Alert } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, CalendarOutlined, TeamOutlined, CarOutlined, RocketOutlined, ExclamationCircleOutlined, BulbOutlined, CloudOutlined, ClockCircleOutlined, HeartOutlined, CameraOutlined, CoffeeOutlined, HomeOutlined, GlobalOutlined, AimOutlined, WarningOutlined, CheckCircleOutlined, InfoCircleOutlined, AlertTriangleOutlined } from '@ant-design/icons';
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
      message.success('智能攻略已生成！');
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
    const modes = { driving: '驾车', public: '公共交通', airplane: '飞机' };
    return modes[mode] || mode;
  };

  const getTravelModeIcon = (mode) => {
    const icons = { driving: <CarOutlined />, public: <RocketOutlined />, airplane: <RocketOutlined /> };
    return icons[mode] || <CarOutlined />;
  };

  const formatDistance = (meters) => {
    if (!meters) return '未知';
    if (meters >= 1000) return (meters / 1000).toFixed(1) + '公里';
    return meters + '米';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '未知';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}小时${minutes}分钟`;
    return `${minutes}分钟`;
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'warning': return <AlertTriangleOutlined style={{ color: '#faad14' }} />;
      case 'tip': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default: return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'warning': return 'warning';
      case 'tip': return 'success';
      default: return 'processing';
    }
  };

  if (loading || generating) {
    return (
      <div style={styles.loadingContainer}>
        <Spin size="large" tip={generating ? 'AI正在分析您的偏好并生成专属攻略...' : '正在加载信息...'} />
        <Text type="secondary">
          {generating ? '结合您的喜好、实时数据和社区经验，为您打造完美行程...' : '正在调用高德地图API获取真实数据...'}
        </Text>
      </div>
    );
  }

  if (!travelData) {
    return (
      <div style={styles.emptyContainer}>
        <Empty description="暂无旅行信息" />
        <Button type="primary" onClick={onBack} style={{ marginTop: 16 }}>返回首页</Button>
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
          action={<Button size="small" type="primary" onClick={loadRealData}>重试</Button>}
        />
        <Button type="primary" onClick={onBack} style={{ marginTop: 16 }}>返回首页</Button>
      </div>
    );
  }

  const { userProfile, commonIssues, comprehensiveAdvice } = itineraryData || {};
  const dailySchedules = itineraryData?.dailySchedules || [];
  const recommendations = itineraryData?.recommendations || {};

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} style={styles.backButton}>返回</Button>
          <Title level={2} style={styles.title}><EnvironmentOutlined /> 智能旅游攻略</Title>
          <Text type="secondary">
            {travelData.departure} → {travelData.destination} | {travelData.tripDays}天行程
          </Text>
          {itineraryData?.route && <Tag color="success" style={{ marginLeft: 8 }}>高德API数据</Tag>}
        </div>
      </div>

      <div style={styles.content}>
        {comprehensiveAdvice && comprehensiveAdvice.length > 0 && (
          <Alert
            message="智能分析结果"
            description={
              <div>
                {comprehensiveAdvice.map((advice, index) => (
                  <div key={index} style={{ marginBottom: 12 }}>
                    <Text strong><span style={{ fontSize: 16 }}>{advice.icon}</span> {advice.category}</Text>
                    <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                      {advice.items.map((item, i) => (
                        <li key={i}><Text type="secondary">{item}</Text></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            }
            type="info"
            showIcon
            icon={<BulbOutlined />}
            style={{ marginBottom: 24 }}
          />
        )}

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {dailySchedules.length > 0 && (
              <Card style={styles.card} bordered={false}>
                <div style={styles.cardHeader}>
                  <Title level={4} style={styles.cardTitle}><CalendarOutlined /> 每日行程安排</Title>
                  <Tag color="blue">{getTravelModeLabel(travelData.travelMode)}</Tag>
                </div>
                <Tabs defaultActiveKey="1" type="card">
                  {dailySchedules.map((daySchedule) => (
                    <Tabs.TabPane tab={`第${daySchedule.day}天`} key={daySchedule.day}>
                      <div style={styles.dayInfo}>
                        <Row gutter={16}>
                          <Col span={8}>
                            <Tag color="green" icon={<CloudOutlined />}>{daySchedule.weather?.condition || '未知'}</Tag>
                            <Text type="secondary" style={{ marginLeft: 8 }}>{daySchedule.weather?.temperature || '未知'}</Text>
                          </Col>
                          <Col span={16}>
                            {daySchedule.dailyTip?.length > 0 && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                💡 {daySchedule.dailyTip.join(' | ')}
                              </Text>
                            )}
                          </Col>
                        </Row>
                        <Divider />
                      </div>
                      <Timeline items={daySchedule.schedule.map((item, itemIndex) => ({
                        color: itemIndex === 0 || itemIndex === daySchedule.schedule.length - 1 ? 'blue' : 'gray',
                        children: (
                          <div style={styles.timelineItem}>
                            <Text strong style={styles.timelineTime}>{item.time}</Text>
                            <Text strong style={styles.timelineTitle}>{item.title}</Text>
                            <Paragraph type="secondary" style={styles.timelineDesc}>{item.description}</Paragraph>
                          </div>
                        ),
                      }))} />
                    </Tabs.TabPane>
                  ))}
                </Tabs>
              </Card>
            )}

            <Card style={styles.card} bordered={false}>
              <div style={styles.cardHeader}>
                <Title level={4} style={styles.cardTitle}><EnvironmentOutlined /> 路线信息</Title>
              </div>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="出发地">{itineraryData?.departure?.name || travelData.departure}</Descriptions.Item>
                <Descriptions.Item label="目的地">{itineraryData?.destination?.name || travelData.destination}</Descriptions.Item>
                <Descriptions.Item label="出行方式">{getTravelModeIcon(travelData.travelMode)} {getTravelModeLabel(travelData.travelMode)}</Descriptions.Item>
                <Descriptions.Item label="行程距离">{formatDistance(parseInt(itineraryData?.route?.distance))}</Descriptions.Item>
                <Descriptions.Item label="预计耗时">{formatDuration(parseInt(itineraryData?.route?.duration))}</Descriptions.Item>
                <Descriptions.Item label="出发日期">{travelData.departureDate}</Descriptions.Item>
                <Descriptions.Item label="出行人数">{travelData.peopleCount} 人</Descriptions.Item>
                <Descriptions.Item label="行程天数">{travelData.tripDays} 天</Descriptions.Item>
              </Descriptions>
            </Card>

            {userProfile && (
              <Card style={styles.card} bordered={false}>
                <div style={styles.cardHeader}>
                  <Title level={4} style={styles.cardTitle}><HeartOutlined /> 您的旅行画像</Title>
                </div>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                      {userProfile.userType?.label}
                    </Tag>
                    <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
                      {userProfile.userType?.description}
                    </Text>
                  </Col>
                  <Col span={8}>
                    <Tag color="green" style={{ fontSize: 14, padding: '4px 12px' }}>
                      {userProfile.travelPurpose?.primary}
                    </Tag>
                    <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
                      {userProfile.travelPurpose?.secondary}
                    </Text>
                  </Col>
                  <Col span={8}>
                    <Tag color="orange" style={{ fontSize: 14, padding: '4px 12px' }}>
                      {userProfile.timePreference?.pace}行程
                    </Tag>
                    <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
                      {userProfile.timePreference?.suggestion}
                    </Text>
                  </Col>
                </Row>
                {userProfile.travelStyle?.length > 0 && (
                  <>
                    <Divider />
                    <Text type="secondary">您的旅行风格：</Text>
                    <div style={{ marginTop: 8 }}>
                      {userProfile.travelStyle.map((style, index) => (
                        <Tag key={index} icon={style.icon !== '🎒' ? <span>{style.icon}</span> : null} color="processing" style={{ marginBottom: 4 }}>
                          {style.name}: {style.tip}
                        </Tag>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            )}

            {commonIssues && commonIssues.length > 0 && (
              <Card style={styles.card} bordered={false}>
                <div style={styles.cardHeader}>
                  <Title level={4} style={styles.cardTitle}><WarningOutlined /> 前人经验（避免踩坑）</Title>
                </div>
                <List
                  size="small"
                  dataSource={commonIssues}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={getSeverityIcon(item.severity)}
                        title={<span>{item.category}: {item.title}</span>}
                        description={
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text>
                            <br />
                            <Text type="warning" style={{ fontSize: 12 }}>💡 {item.solution}</Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {recommendations.attractions?.length > 0 && (
              <Card style={styles.card} bordered={false}>
                <div style={styles.cardHeader}>
                  <Title level={4} style={styles.cardTitle}><CameraOutlined /> 推荐景点</Title>
                </div>
                <List size="small" dataSource={recommendations.attractions.slice(0, 5)} renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta avatar={<AimOutlined style={{ color: '#1890ff' }} />} title={item.name} description={item.address || item.type} />
                    {item.distance && <Tag>{parseInt(item.distance)}米</Tag>}
                  </List.Item>
                )} />
              </Card>
            )}

            {recommendations.restaurants?.length > 0 && (
              <Card style={styles.card} bordered={false}>
                <div style={styles.cardHeader}>
                  <Title level={4} style={styles.cardTitle}><CoffeeOutlined /> 推荐美食</Title>
                </div>
                <List size="small" dataSource={recommendations.restaurants.slice(0, 5)} renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta avatar={<CoffeeOutlined style={{ color: '#ff6b6b' }} />} title={item.name} description={item.address || item.type} />
                  </List.Item>
                )} />
              </Card>
            )}
          </Col>

          <Col xs={24} lg={8}>
            <Card style={styles.card} bordered={false}>
              <div style={styles.cardHeader}>
                <Title level={4} style={styles.cardTitle}><CloudOutlined /> 天气信息</Title>
              </div>
              <div style={styles.weatherCard}>
                {itineraryData?.weather ? (
                  <>
                    <div style={styles.weatherIcon}><CloudOutlined style={{ fontSize: 48, color: '#1890ff' }} /></div>
                    <Text strong style={styles.weatherTemp}>{itineraryData.weather.temperature}°C</Text>
                    <Paragraph style={styles.weatherDesc}>{itineraryData.weather.weather}</Paragraph>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="风力">{itineraryData.weather.wind}</Descriptions.Item>
                      <Descriptions.Item label="湿度">{itineraryData.weather.humidity}%</Descriptions.Item>
                    </Descriptions>
                  </>
                ) : (
                  <Text type="secondary">正在获取天气信息...</Text>
                )}
              </div>
            </Card>

            <Card style={styles.card} bordered={false}>
              <div style={styles.cardHeader}>
                <Title level={4} style={styles.cardTitle}><GlobalOutlined /> 地图预览</Title>
                <Tag color="green">高德地图</Tag>
              </div>
              <div style={styles.mapPlaceholder}>
                <EnvironmentOutlined style={styles.mapIcon} />
                <Text type="secondary">{travelData.departure} → {travelData.destination}</Text>
                <Text type="secondary" style={styles.mapNote}>
                  路线距离：{formatDistance(parseInt(itineraryData?.route?.distance))}
                </Text>
                <Text type="secondary" style={styles.mapNote}>
                  预计时间：{formatDuration(parseInt(itineraryData?.route?.duration))}
                </Text>
              </div>
            </Card>

            <Card style={styles.card} bordered={false}>
              <div style={styles.cardHeader}>
                <Title level={4} style={styles.cardTitle}><TeamOutlined /> 旅行信息汇总</Title>
              </div>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="最佳出行时间">上午出发</Descriptions.Item>
                <Descriptions.Item label="建议装备">身份证、手机、充电宝、钱包、舒适鞋子</Descriptions.Item>
                <Descriptions.Item label="特殊需求">{travelData.specialNeeds?.length ? travelData.specialNeeds.join('、') : '无'}</Descriptions.Item>
                <Descriptions.Item label="兴趣偏好">{travelData.interests?.length ? travelData.interests.join('、') : '无'}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card style={styles.card} bordered={false}>
              <div style={styles.cardHeader}>
                <Title level={4} style={styles.cardTitle}><BulbOutlined /> 重新生成</Title>
              </div>
              <Paragraph type="secondary">根据新的偏好重新生成攻略</Paragraph>
              <Button type="primary" icon={<BulbOutlined />} onClick={() => setAiModalVisible(true)} style={styles.aiButton}>
                重新生成攻略
              </Button>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        title={<span><BulbOutlined /> 重新生成智能攻略</span>}
        open={aiModalVisible}
        onCancel={() => setAiModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAiModalVisible(false)}>取消</Button>,
          <Button key="generate" type="primary" onClick={async () => {
            setAiModalVisible(false);
            setGenerating(true);
            try {
              const data = await AIService.generateItinerary(travelData);
              setItineraryData(data);
              message.success('新攻略已生成！');
            } catch (error) {
              message.error('生成失败：' + error.message);
            } finally {
              setGenerating(false);
            }
          }} loading={generating}>开始生成</Button>,
        ]}
      >
        <div style={styles.modalContent}>
          <ExclamationCircleOutlined style={styles.modalIcon} />
          <Paragraph>AI将结合您的偏好和最新数据重新生成攻略</Paragraph>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="目的地">{travelData.destination}</Descriptions.Item>
            <Descriptions.Item label="出行方式">{getTravelModeLabel(travelData.travelMode)}</Descriptions.Item>
            <Descriptions.Item label="出行人数">{travelData.peopleCount}人</Descriptions.Item>
            <Descriptions.Item label="行程天数">{travelData.tripDays}天</Descriptions.Item>
          </Descriptions>
          <Divider />
          <Text type="secondary">💡 将综合分析：用户偏好 + 高德实时数据 + 社区经验</Text>
        </div>
      </Modal>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  loadingContainer: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '16px' },
  emptyContainer: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' },
  header: { background: 'white', padding: '16px 24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' },
  headerContent: { maxWidth: '1200px', margin: '0 auto' },
  backButton: { color: '#666', marginBottom: '8px', paddingLeft: '0' },
  title: { margin: '0 !important', color: '#333' },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
  card: { borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle: { margin: '0 !important', display: 'flex', alignItems: 'center', gap: '8px' },
  timelineItem: { paddingBottom: '8px' },
  timelineTime: { color: '#1890ff', marginRight: '12px' },
  timelineTitle: { color: '#333' },
  timelineDesc: { margin: '4px 0 0 0 !important', fontSize: '12px' },
  dayInfo: { marginBottom: '16px' },
  weatherCard: { textAlign: 'center', padding: '24px' },
  weatherIcon: { marginBottom: '16px' },
  weatherTemp: { fontSize: '24px', display: 'block', marginBottom: '8px' },
  weatherDesc: { margin: '0 !important', color: '#666' },
  mapPlaceholder: { height: '200px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px', border: '1px dashed #d9d9d9' },
  mapIcon: { fontSize: '48px', color: '#1890ff' },
  mapNote: { fontSize: '12px' },
  aiButton: { marginTop: '16px', width: '100%', height: '44px', fontSize: '16px' },
  modalContent: { padding: '16px 0' },
  modalIcon: { fontSize: '24px', color: '#1890ff', marginBottom: '16px' },
};

export default ResultPage;