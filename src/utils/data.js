import dayjs from 'dayjs';

const mockOrders = [
  { id: 'ORD20260427001', customer: '张三', phone: '13800138001', product: 'iPhone 15 Pro', quantity: 1, amount: 8999, status: 'pending', createTime: '2026-04-27 10:30:00' },
  { id: 'ORD20260427002', customer: '李四', phone: '13800138002', product: 'MacBook Pro 14', quantity: 1, amount: 15999, status: 'processing', createTime: '2026-04-27 09:15:00' },
  { id: 'ORD20260427003', customer: '王五', phone: '13800138003', product: 'AirPods Pro 2', quantity: 2, amount: 3598, status: 'completed', createTime: '2026-04-26 16:45:00' },
  { id: 'ORD20260427004', customer: '赵六', phone: '13800138004', product: 'iPad Air', quantity: 1, amount: 4799, status: 'pending', createTime: '2026-04-26 14:20:00' },
  { id: 'ORD20260427005', customer: '钱七', phone: '13800138005', product: 'Apple Watch S9', quantity: 1, amount: 3299, status: 'completed', createTime: '2026-04-25 11:00:00' },
  { id: 'ORD20260427006', customer: '孙八', phone: '13800138006', product: 'iPhone 15', quantity: 2, amount: 11998, status: 'processing', createTime: '2026-04-25 10:30:00' },
  { id: 'ORD20260427007', customer: '周九', phone: '13800138007', product: 'MacBook Air', quantity: 1, amount: 9499, status: 'cancelled', createTime: '2026-04-24 15:20:00' },
  { id: 'ORD20260427008', customer: '吴十', phone: '13800138008', product: 'iPad Pro', quantity: 1, amount: 7999, status: 'completed', createTime: '2026-04-24 09:45:00' },
  { id: 'ORD20260427009', customer: '郑一', phone: '13800138009', product: 'AirPods Max', quantity: 1, amount: 4399, status: 'processing', createTime: '2026-04-23 14:00:00' },
  { id: 'ORD20260427010', customer: '冯二', phone: '13800138010', product: 'Apple Pencil', quantity: 3, amount: 1074, status: 'completed', createTime: '2026-04-23 11:30:00' },
  { id: 'ORD20260427011', customer: '陈三', phone: '13800138011', product: 'iPhone 15 Pro Max', quantity: 1, amount: 9999, status: 'pending', createTime: '2026-04-22 16:00:00' },
  { id: 'ORD20260427012', customer: '褚四', phone: '13800138012', product: 'Mac Mini', quantity: 1, amount: 4499, status: 'completed', createTime: '2026-04-22 10:15:00' },
  { id: 'ORD20260427013', customer: '卫五', phone: '13800138013', product: 'Apple TV 4K', quantity: 2, amount: 2398, status: 'cancelled', createTime: '2026-04-21 15:40:00' },
  { id: 'ORD20260427014', customer: '蒋六', phone: '13800138014', product: 'HomePod Mini', quantity: 4, amount: 2396, status: 'processing', createTime: '2026-04-21 09:20:00' },
  { id: 'ORD20260427015', customer: '沈七', phone: '13800138015', product: 'Magic Keyboard', quantity: 2, amount: 1998, status: 'completed', createTime: '2026-04-20 14:30:00' },
  { id: 'ORD20260427016', customer: '韩八', phone: '13800138016', product: 'Magic Mouse', quantity: 3, amount: 1497, status: 'pending', createTime: '2026-04-20 11:00:00' },
  { id: 'ORD20260427017', customer: '杨九', phone: '13800138017', product: 'iMac 24', quantity: 1, amount: 12499, status: 'processing', createTime: '2026-04-19 16:20:00' },
  { id: 'ORD20260427018', customer: '朱十', phone: '13800138018', product: 'AirPods 3', quantity: 2, amount: 1998, status: 'completed', createTime: '2026-04-19 10:45:00' },
  { id: 'ORD20260427019', customer: '秦一', phone: '13800138019', product: 'iPad mini', quantity: 1, amount: 3999, status: 'cancelled', createTime: '2026-04-18 15:15:00' },
  { id: 'ORD20260427020', customer: '尤二', phone: '13800138020', product: 'MacBook Pro 16', quantity: 1, amount: 19999, status: 'completed', createTime: '2026-04-18 09:30:00' },
];

export const getOrders = () => {
  return Promise.resolve(mockOrders);
};

export const getOrderById = (id) => {
  return Promise.resolve(mockOrders.find(order => order.id === id));
};

export const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return statusMap[status] || status;
};

export const getStatusClass = (status) => {
  return `status-${status}`;
};

export const formatAmount = (amount) => {
  return `¥${amount.toLocaleString('zh-CN')}`;
};

export const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};