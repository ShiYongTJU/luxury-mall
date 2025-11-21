# Luxury Mall - 高端奢侈品电商网站

一个基于 React + TypeScript + Vite 构建的高端奢侈品电商网站，采用组件化设计，支持后台配置页面布局。

## 项目特性

- 🎨 **奢侈品风格设计** - 高端大气的UI设计，类似奢侈品品牌风格
- 🧩 **组件化架构** - 所有业务组件可复用，易于维护和扩展
- ⚙️ **配置化首页** - 首页布局通过后台数据配置，灵活可定制
- 📱 **响应式设计** - 适配移动端和桌面端
- 🛒 **完整电商功能** - 包含首页、分类、购物车、个人中心等核心功能

## 技术栈

- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Router** - 路由管理

## 项目结构

```
src/
├── api/              # API接口和Mock数据
│   ├── api.ts       # API服务
│   └── mockData.ts  # Mock数据
├── components/      # 业务组件
│   ├── Carousel/    # 轮播图组件
│   ├── GroupBuy/    # 团购组件
│   ├── GuessYouLike/# 猜你喜欢组件
│   ├── Layout/      # 布局组件
│   ├── ProductCard/ # 商品卡片组件
│   ├── ProductList/ # 商品列表组件
│   ├── Seckill/     # 秒杀组件
│   └── TabBar/      # 底部导航栏
├── pages/           # 页面组件
│   ├── Cart/        # 购物车页
│   ├── Category/    # 分类页
│   ├── Home/        # 首页
│   └── Profile/     # 个人中心页
├── types/           # TypeScript类型定义
│   └── product.ts   # 商品相关类型
├── App.tsx          # 根组件
├── main.tsx         # 入口文件
└── index.css        # 全局样式
```

## 安装和运行

```bash
# 安装依赖
npm install

# 配置后端API地址（可选）
# 创建 .env 文件，设置 VITE_API_BASE_URL=http://localhost:3001
# 如果不设置，默认使用 http://localhost:3001

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

**注意**: 前端需要配合后端服务使用。请确保后端服务已启动（默认运行在 http://localhost:3001）

## API接口文档

所有API接口已连接到真实后端服务（Express + TypeScript）。后端服务默认运行在 `http://localhost:3001`。

### 1. 获取首页配置数据

**接口地址**: `GET /api/products/homepage`

**前端调用**: `getHomePageData()`

**返回数据结构**:

```typescript
interface HomePageData {
  components: PageComponent[]
}

interface PageComponent {
  type: 'carousel' | 'seckill' | 'groupbuy' | 'productList' | 'guessYouLike'
  id: string                    // 组件唯一标识
  config: {                     // 组件配置
    title?: string              // 组件标题
    height?: string            // 高度（轮播图）
    autoplay?: boolean         // 自动播放（轮播图）
    interval?: number          // 播放间隔（轮播图，毫秒）
    columns?: 2 | 3 | 4        // 列数（商品列表）
    [key: string]: any         // 其他配置项
  }
  data: any                     // 组件数据
}
```

**组件类型说明**:

#### 1.1 轮播图组件 (carousel)

```typescript
// config
{
  height: string        // 轮播图高度，如 "200px"
  autoplay: boolean     // 是否自动播放，默认 true
  interval: number      // 自动播放间隔（毫秒），默认 3000
}

// data
CarouselItem[] = [
  {
    id: string          // 唯一标识
    image: string       // 图片URL
    title?: string      // 标题（可选）
    link?: string       // 跳转链接（可选）
  }
]
```

#### 1.2 秒杀组件 (seckill)

```typescript
// config
{
  title: string         // 组件标题，如 "限时秒杀"
}

// data
{
  endTime: string       // 结束时间，ISO 8601格式，如 "2024-01-01T12:00:00Z"
  products: Product[]   // 商品列表
}
```

#### 1.3 团购组件 (groupbuy)

```typescript
// config
{
  title: string         // 组件标题，如 "热门团购"
}

// data
Product[]               // 商品列表
```

#### 1.4 商品列表组件 (productList)

```typescript
// config
{
  title?: string        // 组件标题（可选）
  columns: 2 | 3 | 4   // 列数，默认 2
}

// data
Product[]               // 商品列表
```

#### 1.5 猜你喜欢组件 (guessYouLike)

```typescript
// config
{
  title?: string        // 组件标题，默认 "猜你喜欢"
}

// data
Product[]               // 商品列表
```

### 2. 获取商品列表

**接口地址**: `GET /api/products` 或 `GET /api/products?category=分类ID`

**前端调用**: `getProducts(category?: string)`

**请求参数**:
- `category` (可选): 分类ID，如 "bags", "watches" 等

**返回数据结构**:

```typescript
Product[] = [
  {
    id: string              // 商品ID
    name: string            // 商品名称
    description?: string    // 商品描述（可选）
    image: string           // 商品图片URL
    price: number           // 现价（单位：元）
    originalPrice?: number  // 原价（可选，单位：元）
    tag?: string           // 标签，如 "热销", "新品", "限时"（可选）
    category?: string      // 分类ID（可选）
  }
]
```

**示例响应**:

```json
[
  {
    "id": "1",
    "name": "经典款手提包",
    "description": "意大利手工制作，精选优质皮革",
    "image": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400",
    "price": 12800,
    "originalPrice": 15800,
    "tag": "热销",
    "category": "bags"
  }
]
```

### 3. 获取分类列表

**接口地址**: `GET /api/products/categories`

**前端调用**: `getCategories()`

**返回数据结构**:

```typescript
Category[] = [
  {
    id: string          // 分类ID
    name: string        // 分类名称
    icon: string        // 分类图标（emoji）
    products: Product[] // 该分类下的商品列表
  }
]
```

**示例响应**:

```json
[
  {
    "id": "1",
    "name": "手袋",
    "icon": "👜",
    "products": [...]
  },
  {
    "id": "2",
    "name": "手表",
    "icon": "⌚",
    "products": [...]
  }
]
```

### 4. 获取商品详情

**接口地址**: `GET /api/products/:id`

**前端调用**: `getProductDetail(id: string)`

### 5. 搜索商品

**接口地址**: `GET /api/search?q=关键词`

**前端调用**: `searchProducts(keyword: string)`

### 6. 创建订单

**接口地址**: `POST /api/orders`

**前端调用**: `createOrder(orderData)`

**请求体**:
```typescript
{
  items: OrderItem[]      // 订单商品列表
  address: Address        // 收货地址
  totalPrice: number      // 总价
  status: 'pending'      // 订单状态
}
```

### 7. 获取订单列表

**接口地址**: `GET /api/orders`

**前端调用**: `getOrders()`

### 8. 获取订单详情

**接口地址**: `GET /api/orders/:id`

**前端调用**: `getOrderById(id: string)`

**请求参数**:
- `id`: 商品ID

**返回数据结构**:

```typescript
Product | null
```

**字段说明同商品列表接口**

## 数据字段说明

### Product (商品)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 商品唯一标识 |
| name | string | 是 | 商品名称 |
| description | string | 否 | 商品描述 |
| image | string | 是 | 商品图片URL |
| price | number | 是 | 现价（单位：元） |
| originalPrice | number | 否 | 原价（单位：元），用于显示折扣 |
| tag | string | 否 | 商品标签，如 "热销"、"新品"、"限时" |
| category | string | 否 | 商品分类ID |

### CarouselItem (轮播图项)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 轮播图项唯一标识 |
| image | string | 是 | 图片URL |
| title | string | 否 | 标题文字 |
| link | string | 否 | 点击跳转链接 |

### PageComponent (页面组件)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 是 | 组件类型：carousel/seckill/groupbuy/productList/guessYouLike |
| id | string | 是 | 组件唯一标识 |
| config | object | 是 | 组件配置对象，不同组件类型配置项不同 |
| data | any | 是 | 组件数据，不同组件类型数据结构不同 |

## 组件使用说明

### 商品卡片组件 (ProductCard)

```tsx
import ProductCard from '@/components/ProductCard/ProductCard'

<ProductCard 
  product={product} 
  onClick={() => console.log('点击商品')} 
/>
```

### 商品列表组件 (ProductList)

```tsx
import ProductList from '@/components/ProductList/ProductList'

<ProductList 
  products={products}
  columns={2}
  title="精选推荐"
  onProductClick={(product) => console.log(product)}
/>
```

### 轮播图组件 (Carousel)

```tsx
import Carousel from '@/components/Carousel/Carousel'

<Carousel 
  items={carouselItems}
  autoplay={true}
  interval={3000}
  height="200px"
/>
```

### 秒杀组件 (Seckill)

```tsx
import Seckill from '@/components/Seckill/Seckill'

<Seckill 
  title="限时秒杀"
  endTime="2024-01-01T12:00:00Z"
  products={products}
  onProductClick={(product) => console.log(product)}
/>
```

### 团购组件 (GroupBuy)

```tsx
import GroupBuy from '@/components/GroupBuy/GroupBuy'

<GroupBuy 
  title="热门团购"
  products={products}
  onProductClick={(product) => console.log(product)}
/>
```

### 猜你喜欢组件 (GuessYouLike)

```tsx
import GuessYouLike from '@/components/GuessYouLike/GuessYouLike'

<GuessYouLike 
  title="猜你喜欢"
  products={products}
  onProductClick={(product) => console.log(product)}
/>
```

## 页面说明

### 首页 (Home)

首页通过调用 `getHomePageData()` 接口获取配置数据，根据配置动态渲染不同的业务组件。支持通过后台配置灵活调整页面布局和内容。

### 分类页 (Category)

展示商品分类，支持按分类筛选商品。调用 `getCategories()` 获取分类列表，点击分类后调用 `getProducts(category)` 获取对应分类的商品。

### 购物车页 (Cart)

展示购物车中的商品，支持修改数量和结算功能（当前为Mock实现）。

### 个人中心页 (Profile)

展示用户信息、订单统计和功能菜单。

## 样式设计

项目采用奢侈品风格设计，主要特点：

- **配色方案**: 以黑色、白色、灰色为主色调，营造高端感
- **字体**: 使用系统字体栈，确保清晰易读
- **间距**: 宽松的间距设计，提升视觉舒适度
- **阴影**: 柔和的阴影效果，增强层次感
- **圆角**: 适度的圆角设计，保持现代感
- **渐变**: 在关键位置使用渐变效果，增加视觉吸引力

## 开发说明

### 添加新的业务组件

1. 在 `src/components/` 目录下创建新组件文件夹
2. 实现组件逻辑和样式
3. 在 `src/types/product.ts` 中添加对应的类型定义
4. 在 `PageComponent` 的 `type` 中添加新的组件类型
5. 在 `Home.tsx` 的 `renderComponent` 函数中添加渲染逻辑

### 修改Mock数据

所有Mock数据位于 `src/api/mockData.ts` 文件中，可以根据需要修改商品、分类等数据。

## 注意事项

- ✅ 所有API接口已连接到真实后端服务（Express + TypeScript）
- ✅ 订单创建功能已实现，使用后端API保存订单数据
- 图片使用 Unsplash 的占位图，实际项目中应使用真实的商品图片
- 购物车功能使用本地状态管理（Context API）
- 地址管理功能使用本地存储（localStorage），可根据需要迁移到后端
- 建议使用状态管理库（如 Redux、Zustand）管理全局状态（可选）

## 后端服务

前端项目需要配合后端服务使用。后端项目位于 `../luxury-mall-backend`。

**启动后端服务**:
```bash
cd ../luxury-mall-backend
npm install
npm run dev
```

后端服务默认运行在 `http://localhost:3001`。如需修改，请在前端项目的 `.env` 文件中设置 `VITE_API_BASE_URL`。

## License

MIT





