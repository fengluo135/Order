import React, { useState } from 'react';
import { Card, Row, Col, Typography, Descriptions, Timeline, Button, Spin, Empty, Tag, Divider, Modal, message } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, CalendarOutlined, TeamOutlined, CarOutlined, RocketOutlined, ExclamationCircleOutlined, BulbOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const ResultPage = ({ travelData, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [aiModalVisible, setAiModalVisible] = useState(false);

  // 模拟加载
  setTimeout(() => setLoading(false), 800);

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
    const { departure, destination, travelMode, departureDate, peopleCount } = travelData;

    const baseTime = {
      driving: { duration: '6小时30分钟', distance: '580公里' },
      public: { duration: '4小时30分钟', distance: '高铁580公里' },
      airplane: { duration: '2小时15分钟', distance: '飞行距离800公里' },
    };

    const info = baseTime[travelMode] || baseTime.driving;

    const schedule = {
      driving: [
        { time: '08:00', title: '出发', description: `从${departure}出发，沿G2京沪高速行驶` },
        { time: '10:30', title: '休息站', description: '济南服务区休息15分钟' },
        { time: '12:00', title: '午餐', description: '泰安服务区用餐' },
        { time: '14:30', title: '抵达', description: `到达${destination}` },
      ],
      public: [
        { time: '07:30', title: '出发', description: `前往${departure}火车站/长途汽车站` },
        { time: '08:30', title: '乘坐', description: `出发前往${destination}` },
        { time: '13:00', title: '抵达', description: `到达${destination}站` },
      ],
      airplane: [
        { time: '06:00', title: '出发', description: `前往${departure}机场` },
        { time: '08:30', title: '起飞', description: `乘坐航班飞往${destination}` },
        { time: '10:45', title: '抵达', description: `到达${destination}机场` },
      ],
    };

    return {
      ...info,
      schedule: schedule[travelMode] || schedule.driving,
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
            <EnvironmentOutlined /> 旅行规划方案
          </Title>
        </div>
      </div>

      <div style={styles.content}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            <Card style={styles.card} bordered={false}>
              <div style={styles.cardHeader}>
                <Title level={4} style={styles.cardTitle}>
                  <CalendarOutlined /> 行程安排
                </Title>
                <Tag color="blue">{getTravelModeLabel(travelData.travelMode)}</Tag>
              </div>
              <Timeline
                items={routeInfo.schedule.map((item, index) => ({
                  color: index === 0 || index === routeInfo.schedule.length - 1 ? 'blue' : 'gray',
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
            </Card>

            <Card style={styles.card} bordered={false}>
              <div style={styles.cardHeader}>
                <Title level={4} style={styles.cardTitle}>
                  <EnvironmentOutlined /> 路线信息
                </Title>
              </div>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="出发地">{travelData.departure}</Descriptions.Item>
                <Descriptions.Item label="目的地">{travelData.destination}</Descriptions.Item>
                <Descriptions.Item label="出行方式">
                  {getTravelModeIcon(travelData.travelMode)} {getTravelModeLabel(travelData.travelMode)}
                </Descriptions.Item>
                <Descriptions.Item label="行程距离">{routeInfo.distance}</Descriptions.Item>
                <Descriptions.Item label="预计耗时">{routeInfo.duration}</Descriptions.Item>
                <Descriptions.Item label="出发日期">{travelData.departureDate}</Descriptions.Item>
                <Descriptions.Item label="出行人数">{travelData.peopleCount} 人</Descriptions.Item>
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

          <Col xs={24} lg={10}>
            <Card style={styles.card} bordered={false}>
              <div style={styles.cardHeader}>
                <Title level={4} style={styles.cardTitle}>
                  <EnvironmentOutlined /> 地图预览
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
                <Descriptions.Item label="行程天数">1天</Descriptions.Item>
                <Descriptions.Item label="最佳出行时间">上午出发</Descriptions.Item>
                <Descriptions.Item label="建议装备">身份证、手机、充电宝、钱包</Descriptions.Item>
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