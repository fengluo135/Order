# 旅游规划网站

React + Ant Design + Vite 旅游规划助手

## 功能特性

- ✅ 首页表单（出发地、目的地、日期、人数、出行方式）
- ✅ 表单校验（必填项、日期范围、输入长度）
- ✅ 结果展示页（行程安排、路线信息、地图预览）
- ✅ 响应式布局（支持PC和移动端）
- ✅ 高德地图API扩展接口
- ✅ AI生成攻略扩展接口
- ✅ 简洁商务风设计

## 技术栈

- React 18.2.0
- Ant Design 5.12.0
- Vite 5.0.8
- Dayjs 1.11.10

## 运行项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
├── pages/
│   ├── HomePage.jsx      # 首页表单
│   ├── ResultPage.jsx    # 结果展示页
│   ├── Login.jsx         # 原登录页(保留)
│   └── OrderList.jsx     # 原订单页(保留)
├── App.jsx               # 主应用（状态管理）
└── index.css             # 全局样式
```