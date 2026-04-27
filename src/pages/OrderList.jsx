import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Modal, Descriptions, Tag, message } from 'antd';
import { SearchOutlined, ExportOutlined, EyeOutlined, LogoutOutlined } from '@ant-design/icons';
import { getOrders, getStatusText, getStatusClass, formatAmount, formatDate } from '../utils/data';
import { exportToExcel } from '../utils/exportExcel';

const { Option } = Select;

const OrderList = ({ onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({
    searchText: '',
    status: undefined
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getOrders();
    setOrders(data);
    setPagination(prev => ({ ...prev, total: data.length }));
    setLoading(false);
  };

  const handleTableChange = (newPagination, tableFilters) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total
    });
  };

  const handleSearch = () => {
    const filtered = orders.filter(order => {
      const matchesSearch = !filters.searchText || 
        order.id.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        order.customer.includes(filters.searchText) ||
        order.phone.includes(filters.searchText);
      const matchesStatus = !filters.status || order.status === filters.status;
      return matchesSearch && matchesStatus;
    });
    setPagination(prev => ({ ...prev, total: filtered.length, current: 1 }));
    return filtered;
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const matchesSearch = !filters.searchText || 
        order.id.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        order.customer.includes(filters.searchText) ||
        order.phone.includes(filters.searchText);
      const matchesStatus = !filters.status || order.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  };

  const showDetail = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const handleExport = () => {
    const filteredOrders = getFilteredOrders();
    if (filteredOrders.length === 0) {
      message.warning('没有可导出的数据');
      return;
    }
    exportToExcel(filteredOrders);
    message.success(`已导出 ${filteredOrders.length} 条订单数据`);
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
      width: 150,
    },
    {
      title: '客户姓名',
      dataIndex: 'customer',
      key: 'customer',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '产品名称',
      dataIndex: 'product',
      key: 'product',
      width: 150,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 70,
      align: 'center',
    },
    {
      title: '订单金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (amount) => formatAmount(amount),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => (
        <Tag className={getStatusClass(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <div className="main-layout">
      <div className="header">
        <h1 className="header-title">订单管理系统</h1>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={onLogout}
          style={{ color: 'white' }}
        >
          退出登录
        </Button>
      </div>

      <div className="content">
        <div className="table-card">
          <div className="table-header">
            <h2 className="table-title">订单列表</h2>
            <Space>
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={handleExport}
              >
                导出 Excel
              </Button>
            </Space>
          </div>

          <div className="filter-form">
            <Input
              placeholder="搜索订单号/客户姓名/电话"
              prefix={<SearchOutlined />}
              value={filters.searchText}
              onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
              style={{ width: 240 }}
              allowClear
            />
            <Select
              placeholder="订单状态"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: 140 }}
              allowClear
            >
              <Option value="pending">待处理</Option>
              <Option value="processing">处理中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={getFilteredOrders()}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
              pageSizeOptions: ['5', '10', '20', '50'],
            }}
            onChange={handleTableChange}
            scroll={{ x: 1100 }}
          />
        </div>
      </div>

      <Modal
        title="订单详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
        className="detail-modal"
      >
        {selectedOrder && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="订单号" span={2}>
              {selectedOrder.id}
            </Descriptions.Item>
            <Descriptions.Item label="客户姓名">
              {selectedOrder.customer}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">
              {selectedOrder.phone}
            </Descriptions.Item>
            <Descriptions.Item label="产品名称" span={2}>
              {selectedOrder.product}
            </Descriptions.Item>
            <Descriptions.Item label="数量">
              {selectedOrder.quantity}
            </Descriptions.Item>
            <Descriptions.Item label="订单金额">
              {formatAmount(selectedOrder.amount)}
            </Descriptions.Item>
            <Descriptions.Item label="订单状态">
              <Tag className={getStatusClass(selectedOrder.status)}>
                {getStatusText(selectedOrder.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {formatDate(selectedOrder.createTime)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default OrderList;