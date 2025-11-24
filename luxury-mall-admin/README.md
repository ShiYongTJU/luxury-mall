# Luxury Mall 管理后台

基于 React + Ant Design 构建的管理后台系统。

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型系统
- **Vite** - 构建工具
- **Ant Design 5** - UI 组件库
- **React Router** - 路由管理
- **Axios** - HTTP 请求

## 项目结构

```
luxury-mall-admin/
├── src/
│   ├── api/              # API 接口
│   ├── components/       # 组件
│   │   └── Layout/      # 布局组件
│   ├── pages/           # 页面
│   │   └── Product/     # 商品相关页面
│   ├── types/           # TypeScript 类型定义
│   ├── App.tsx          # 根组件
│   └── main.tsx         # 入口文件
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 功能特性

### 已实现

- ✅ 多级菜单导航（一级菜单：商品中心、运营中心）
- ✅ 商品列表页面
  - 筛选表单（支持按名称、分类、品牌、标签、价格、库存筛选）
  - 商品表格展示（包含图片、名称、价格、分类、品牌、标签、库存等信息）
  - 分页功能

### 待实现

- ⏳ 商品详情页面
- ⏳ 商品新增/编辑功能
- ⏳ 商品删除功能
- ⏳ 运营中心相关功能

## 安装和运行

### 1. 安装依赖

```bash
cd luxury-mall-admin
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3002

### 3. 构建生产版本

```bash
npm run build
```

## 菜单结构

- **商品中心**
  - **商品管理**
    - 商品列表

- **运营中心**
  - （待开发）

## 后端 API

管理后台需要连接后端 API，默认代理到 `http://localhost:3001`。

确保后端服务已启动，并且支持以下接口：

- `GET /api/products` - 获取商品列表（支持查询参数）
- `GET /api/products/:id` - 获取商品详情

## 注意事项

1. 确保后端服务已启动（默认端口 3001）
2. 后端需要支持 CORS，允许来自 `http://localhost:3002` 的请求
3. 如果后端端口不是 3001，需要修改 `vite.config.ts` 中的代理配置

