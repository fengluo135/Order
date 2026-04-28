import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Descriptions, Timeline, Button, Spin, Empty, Tag, Divider, Modal, message, Tabs, List, Alert, Input, Select } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, CalendarOutlined, TeamOutlined, CarOutlined, RocketOutlined, ExclamationCircleOutlined, CloudOutlined, HeartOutlined, HomeOutlined, GlobalOutlined, AimOutlined, WarningOutlined, CheckCircleOutlined, InfoCircleOutlined, EditOutlined } from '@ant-design/icons';
import AIService, { setMessageFunc } from '../services/AIService';

const { Title, Text, Paragraph } = Typography;

const ResultPage = ({ travelData, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [itineraryData, setItineraryData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMessageFunc({
      info: (msg) => message.info(msg),
      warning: (msg) => message.warning(msg),
      error: (msg) => message.error(msg),
      success: (msg) => message.success(msg),
    });
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

      const data = await AIService.generateItinerary(travelData);
      setItineraryData(data);
      message.success('智能攻略已生成！');
    } catch (error) {
      console.error('加载数据失败:', error);
      setError(error.message || '加载数据失败，请重试');
      message.error('加载失败：' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
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
      case 'warning': return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'tip': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default: return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  if (loading || generating) {
    return (
      <div style={styles.loadingContainer}>
        <Spin size="large" />
        <Title level={4}>{generating ? '🤖 豆包AI正在生成详细攻略...' : '📍 正在加载数据...'}</Title>
        <Text type="secondary">
          {generating
            ? '结合您的偏好、实时地图数据和个性化需求，为您打造专属行程...'
            : '正在调用高德地图API和豆包AI...'}
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

  const { userProfile, commonIssues, comprehensiveAdvice, route, recommendations, llmGuide, llmError, userRequirements } = itineraryData || {};
  const dailySchedules = itineraryData?.dailySchedules || [];
  const llmRoute = route?.llmRoute;
  const llmHotels = recommendations?.llmHotels;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} style={styles.backButton}>返回</Button>
          <Title level={2} style={styles.title}>
            <GlobalOutlined /> 智能旅游攻略
          </Title>
          <Text type="secondary">
            {travelData.departure} → {travelData.destination} | {travelData.tripDays}天行程
          </Text>
          <div style={styles.headerActions}>
            <Tag icon={<InfoCircleOutlined />} color={llmGuide ? "success" : "warning"} style={{ marginRight: 8 }}>
              {llmGuide ? "✅ 豆包AI已生成" : "⚠️ 豆包AI未启用"}
            </Tag>
            <Button type="primary" icon={<EditOutlined />} onClick={() => setAiModalVisible(true)}>
              重新生成
            </Button>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {userRequirements && (
          <Alert
            message="您的个性化需求"
            description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{userRequirements}</pre>}
            type="info"
            showIcon
            icon={<EditOutlined />}
            style={{ marginBottom: 24 }}
          />
        )}

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
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: 24 }}
          />
        )}

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {llmGuide?.rawResponse && (
              <Card style={styles.card} bordered={false}>
                <div style={styles.cardHeader}>
                  <Title level={4} style={styles.cardTitle}>
                    <EditOutlined /> 豆包AI详细攻略
                  </Title>
                  <Tag color="orange">🤖 AI生成</Tag>
                </div>
                <div style={styles.llmContent}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                    {llmGuide.rawResponse}
                  </pre>
                </div>
              </Card>
            )}

            {dailySchedules.length > 0 && !llmGuide?.rawResponse && (
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

            {travelData.travelMode === 'driving' && llmRoute?.rawResponse && (
              <Card style={styles.card} bordered={false}>
                <div style={styles.cardHeader}>
                  <Title level={4} style={styles.cardTitle}><EnvironmentOutlined /> 详细驾车路线</Title>
                  <Tag color="orange">🤖 AI智能规划</Tag>
                </div>
                <div style={styles.llmContent}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                    {llmRoute.rawResponse}
                  </pre>
                </div>
              </Card>
            )}

            {route && (
              <Card style={styles.card} bordered={false}>
                <div style={styles.cardHeader}>
                  <Title level={4} style={styles.cardTitle}><EnvironmentOutlined /> 路线信息</Title>
                </div>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="出发地">{itineraryData?.departure?.name || travelData.departure}</Descriptions.Item>
                  <Descriptions.Item label="目的地">{itineraryData?.destination?.name || travelData.destination}</Descriptions.Item>
                  <Descriptions.Item label="出行方式">{getTravelModeIcon(travelData.travelMode)} {getTravelModeLabel(travelData.travelMode)}</Descriptions.Item>
                  <Descriptions.Item label="行程距离">{route.distance ? formatDistance(parseInt(route.distance)) : '未知'}</Descriptions.Item>
                  <Descriptions.Item label="预计耗时">{route.duration ? formatDuration(parseInt(route.duration)) : '未知'}</Descriptions.Item>
                  <Descriptions.Item label="出发日期">{travelData.departureDate}</Descriptions.Item>
                </Descriptions>
                {route.steps && route.steps.length > 0 && (
                  <>
                    <Divider />
                    <Title level={5}>📍 路线详情</Title>
                    <Timeline items={route.steps.slice(0, 5).map((step, index) => ({
                      color: 'gray',
                      children: (
                        <div>
                          <Text strong>{step.instruction || step.bus || '行驶中...'}</Text>
                          <Text type="secondary" style={{ marginLeft: 8 }}>
                            {step.distance ? formatDistance(parseInt(step.distance)) : ''}
                          </Text>
                        </div>
                      ),
                    }))} />
                  </>
                )}
              </Card>
            )}

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
                {route && route.distance && (
                  <>
                    <Text type="secondary" style={styles.mapNote}>
                      路线距离：{formatDistance(parseInt(route.distance))}
                    </Text>
                    <Text type="secondary" style={styles.mapNote}>
                      预计时间：{route.duration ? formatDuration(parseInt(route.duration)) : '未知'}
                    </Text>
                  </>
                )}
              </div>
            </Card>

            {llmHotels?.rawResponse && (
              <Card style={styles.card} bordered={false}>
                <div style={styles.cardHeader}>
                  <Title level={4} style={styles.cardTitle}><HomeOutlined /> AI酒店推荐</Title>
                  <Tag color="orange">🤖 AI智能推荐</Tag>
                </div>
                <div style={styles.llmContent}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 12 }}>
                    {llmHotels.rawResponse}
                  </pre>
                </div>
              </Card>
            )}

            {!llmHotels?.rawResponse && recommendations.hotels?.length > 0 && (
              <Card style={styles.card} bordered={false}>
                <div style={styles.cardHeader}>
                  <Title level={4} style={styles.cardTitle}><HomeOutlined /> 推荐酒店</Title>
                </div>
                <List size="small" dataSource={recommendations.hotels.slice(0, 5)} renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta avatar={<HomeOutlined style={{ color: '#52c41a' }} />} title={item.name} description={item.address || item.type} />
                  </List.Item>
                )} />
              </Card>
            )}

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
          </Col>
        </Row>
      </div>

      <Modal
        title={<span><EditOutlined /> 重新生成智能攻略</span>}
        open={aiModalVisible}
        onCancel={() => setAiModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAiModalVisible(false)}>取消</Button>,
          <Button key="generate" type="primary" onClick={handleRegenerate} loading={generating}>开始生成</Button>,
        ]}
      >
        <div style={styles.modalContent}>
          <ExclamationCircleOutlined style={styles.modalIcon} />
          <Paragraph>豆包AI将结合您的偏好和最新数据重新生成攻略</Paragraph>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="目的地">{travelData.destination}</Descriptions.Item>
            <Descriptions.Item label="出行方式">{getTravelModeLabel(travelData.travelMode)}</Descriptions.Item>
            <Descriptions.Item label="出行人数">{travelData.peopleCount}人</Descriptions.Item>
            <Descriptions.Item label="行程天数">{travelData.tripDays}天</Descriptions.Item>
          </Descriptions>
          <Divider />
          <Text type="secondary">💡 将综合分析：您的偏好 + 高德实时数据 + 个性化需求 + 豆包AI</Text>
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
  headerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  backButton: { color: '#666', paddingLeft: '0' },
  title: { margin: '0 !important', color: '#333', flex: 1 },
  headerActions: { display: 'flex', gap: '8px', alignItems: 'center' },
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
  llmContent: { background: '#f9f9f9', padding: '16px', borderRadius: '8px', maxHeight: '600px', overflowY: 'auto' },
  modalContent: { padding: '16px 0' },
  modalIcon: { fontSize: '24px', color: '#1890ff', marginBottom: '16px' },
};

export default ResultPage;