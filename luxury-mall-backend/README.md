# Luxury Mall Backend API

Express + TypeScript 后端 API 服务

## 项目结构

```
luxury-mall-backend/
├── src/
│   ├── controllers/     # 控制器
│   ├── services/        # 业务逻辑
│   ├── routes/          # 路由
│   ├── types/           # 类型定义
│   ├── database/        # 数据库操作
│   ├── middleware/      # 中间件
│   ├── scripts/         # 脚本
│   └── app.ts           # 应用入口
├── data/                # JSON 数据文件
└── dist/                # 编译输出
```

## 安装依赖

```bash
npm install
```

## 数据迁移

将前端项目的 mock 数据迁移到后端数据库：

### 步骤 1: 从前端项目导出数据

```bash
cd ../plan
node scripts/export-data.js
```

这会将前端的 mock 数据导出为 JSON 文件到 `luxury-mall-backend/data/exported-data.json`

### 步骤 2: 导入数据到后端

```bash
cd ../luxury-mall-backend
npm run migrate
```

这会将导出的 JSON 数据导入到后端的数据库文件中。

## 开发

```bash
npm run dev
```

服务器将在 http://localhost:3001 启动

## 构建

```bash
npm run build
```

## 生产环境运行

```bash
npm start
```

## API 接口

### 商品相关

- `GET /api/products` - 获取所有商品
- `GET /api/products?category=bags` - 按分类获取商品
- `GET /api/products/:id` - 获取商品详情
- `GET /api/products/categories` - 获取分类列表
- `GET /api/products/homepage` - 获取首页数据

### 搜索

- `GET /api/search?q=关键词` - 搜索商品（模糊搜索）

### 订单

- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取订单详情

### 健康检查

- `GET /health` - 健康检查

## 环境变量

创建 `.env` 文件：

```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

**CORS 配置说明**：
- `CORS_ORIGIN`: 允许的前端地址，多个地址用逗号分隔
- 如果不设置 `CORS_ORIGIN`，默认允许 `http://localhost:3000` 和 `http://localhost:5173`
- 开发环境下，如果没有匹配的 origin，会自动允许所有来源（方便开发调试）
- 生产环境请务必设置正确的 `CORS_ORIGIN`，避免安全风险

## 数据存储

当前使用 JSON 文件存储数据（开发环境），数据文件位于 `data/` 目录：

- `data/products.json` - 商品数据
- `data/categories.json` - 分类数据
- `data/homepage.json` - 首页数据
- `data/orders.json` - 订单数据

## 技术栈

- Express.js
- TypeScript
- CORS
- dotenv

