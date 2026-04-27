import * as XLSX from 'xlsx';
import { getStatusText, formatAmount, formatDate } from './data';

export const exportToExcel = (orders) => {
  const exportData = orders.map(order => ({
    '订单号': order.id,
    '客户姓名': order.customer,
    '联系电话': order.phone,
    '产品名称': order.product,
    '数量': order.quantity,
    '订单金额': formatAmount(order.amount),
    '订单状态': getStatusText(order.status),
    '创建时间': formatDate(order.createTime)
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '订单列表');

  const colWidths = [
    { wch: 20 },
    { wch: 10 },
    { wch: 15 },
    { wch: 20 },
    { wch: 8 },
    { wch: 15 },
    { wch: 10 },
    { wch: 20 },
  ];
  worksheet['!cols'] = colWidths;

  const date = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');
  XLSX.writeFile(workbook, `订单列表_${date}.xlsx`);
};