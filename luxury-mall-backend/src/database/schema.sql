-- 奢侈品商城数据库表结构

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);

-- 地址表
CREATE TABLE IF NOT EXISTS addresses (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    province VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    detail VARCHAR(200) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    tag VARCHAR(20),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_user_default ON addresses(user_id, is_default);

-- 商品表
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    image VARCHAR(500) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    tag VARCHAR(50),
    category VARCHAR(50),
    sub_category VARCHAR(50),
    brand VARCHAR(100),
    images TEXT, -- JSON array
    detail_description TEXT,
    highlights TEXT, -- JSON array
    specs TEXT, -- JSON array
    reviews TEXT, -- JSON array
    services TEXT, -- JSON array
    shipping_info VARCHAR(500),
    stock INTEGER DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sub_category ON products(sub_category);
CREATE INDEX idx_products_brand ON products(brand);

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    parent_id VARCHAR(100),
    level INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_code ON categories(code);

-- 地区表
CREATE TABLE IF NOT EXISTS regions (
    code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_code VARCHAR(20),
    level INTEGER NOT NULL,
    FOREIGN KEY (parent_code) REFERENCES regions(code) ON DELETE CASCADE
);

CREATE INDEX idx_regions_parent_code ON regions(parent_code);
CREATE INDEX idx_regions_level ON regions(level);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pay_time TIMESTAMP,
    ship_time TIMESTAMP,
    deliver_time TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_create_time ON orders(create_time);

-- 订单项表
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(100) PRIMARY KEY,
    order_id VARCHAR(100) NOT NULL,
    product_id VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    image VARCHAR(500) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    selected_specs TEXT, -- JSON object
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- 订单地址表（保存订单时的地址快照）
CREATE TABLE IF NOT EXISTS order_addresses (
    id VARCHAR(100) PRIMARY KEY,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    province VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    detail VARCHAR(200) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    tag VARCHAR(20),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_order_addresses_order_id ON order_addresses(order_id);

-- 首页组件配置表
CREATE TABLE IF NOT EXISTS homepage_components (
    id VARCHAR(100) PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- carousel, seckill, groupbuy, productList, guessYouLike
    title VARCHAR(200), -- 组件标题
    config TEXT, -- JSON 配置（查询条件、数量限制等）
    sort_order INTEGER DEFAULT 0, -- 排序顺序
    is_enabled BOOLEAN DEFAULT TRUE, -- 是否启用
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_homepage_components_sort_order ON homepage_components(sort_order);
CREATE INDEX idx_homepage_components_enabled ON homepage_components(is_enabled);

-- 分类页组件配置表（控制哪些分类要展示、展示顺序等）
CREATE TABLE IF NOT EXISTS category_components (
    id VARCHAR(100) PRIMARY KEY,
    category_id VARCHAR(100) NOT NULL, -- 关联到 categories 表的 id
    category_code VARCHAR(50), -- 分类的 code（用于查询商品）
    title VARCHAR(200), -- 自定义标题（可选，默认使用分类名称）
    icon VARCHAR(50), -- 图标（可选）
    config TEXT, -- JSON 配置（每个子分类显示的商品数量等）
    sort_order INTEGER DEFAULT 0, -- 排序顺序
    is_enabled BOOLEAN DEFAULT TRUE, -- 是否启用
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_category_components_sort_order ON category_components(sort_order);
CREATE INDEX idx_category_components_enabled ON category_components(is_enabled);
CREATE INDEX idx_category_components_category_id ON category_components(category_id);

-- 图片素材表
CREATE TABLE IF NOT EXISTS images (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    url VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    tags VARCHAR(200),
    width INTEGER,
    height INTEGER,
    size INTEGER, -- 文件大小（字节）
    format VARCHAR(20), -- 图片格式：jpg, png, gif, webp等
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_images_category ON images(category);
CREATE INDEX idx_images_tags ON images(tags);
CREATE INDEX idx_images_upload_time ON images(upload_time);

-- 页面表
CREATE TABLE IF NOT EXISTS pages (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL, -- 页面名称
    page_type VARCHAR(20) NOT NULL, -- 页面类型：homepage（首页）/category（分类页）
    data_source TEXT, -- 数据源（JSON格式，存储页面配置数据）
    is_published BOOLEAN DEFAULT FALSE, -- 发布状态
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    last_operation_time TIMESTAMP, -- 最近操作时间
    last_operation_type VARCHAR(20) -- 最近操作类型：edit（编辑）/operate（运营）/publish（发布）
);

CREATE INDEX idx_pages_page_type ON pages(page_type);
CREATE INDEX idx_pages_is_published ON pages(is_published);
CREATE INDEX idx_pages_create_time ON pages(create_time);
CREATE INDEX idx_pages_last_operation_time ON pages(last_operation_time);

-- 数据源表（统一结构）
-- 轮播图表
CREATE TABLE IF NOT EXISTS carousel_items (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL, -- 名称/标题
    config TEXT, -- JSON格式配置（如：height, autoplay, interval等）
    data TEXT NOT NULL, -- JSON格式数据（轮播图项列表）
    sort_order INTEGER DEFAULT 0, -- 排序
    is_enabled BOOLEAN DEFAULT TRUE, -- 是否启用
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 秒杀表
CREATE TABLE IF NOT EXISTS seckill_items (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL, -- 名称/标题
    config TEXT, -- JSON格式配置（如：title, endTime等）
    data TEXT NOT NULL, -- JSON格式数据（商品列表）
    sort_order INTEGER DEFAULT 0, -- 排序
    is_enabled BOOLEAN DEFAULT TRUE, -- 是否启用
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 团购表
CREATE TABLE IF NOT EXISTS groupbuy_items (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL, -- 名称/标题
    config TEXT, -- JSON格式配置（如：title, groupSize等）
    data TEXT NOT NULL, -- JSON格式数据（商品列表）
    sort_order INTEGER DEFAULT 0, -- 排序
    is_enabled BOOLEAN DEFAULT TRUE, -- 是否启用
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 商品列表表
CREATE TABLE IF NOT EXISTS product_list_items (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL, -- 名称/标题
    config TEXT, -- JSON格式配置（如：title, category等）
    data TEXT NOT NULL, -- JSON格式数据（商品列表）
    sort_order INTEGER DEFAULT 0, -- 排序
    is_enabled BOOLEAN DEFAULT TRUE, -- 是否启用
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 猜你喜欢表
CREATE TABLE IF NOT EXISTS guess_you_like_items (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL, -- 名称/标题
    config TEXT, -- JSON格式配置（如：title, count等）
    data TEXT NOT NULL, -- JSON格式数据（商品列表）
    sort_order INTEGER DEFAULT 0, -- 排序
    is_enabled BOOLEAN DEFAULT TRUE, -- 是否启用
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_carousel_items_sort_order ON carousel_items(sort_order);
CREATE INDEX idx_carousel_items_is_enabled ON carousel_items(is_enabled);
CREATE INDEX idx_seckill_items_sort_order ON seckill_items(sort_order);
CREATE INDEX idx_seckill_items_is_enabled ON seckill_items(is_enabled);
CREATE INDEX idx_groupbuy_items_sort_order ON groupbuy_items(sort_order);
CREATE INDEX idx_groupbuy_items_is_enabled ON groupbuy_items(is_enabled);
CREATE INDEX idx_product_list_items_sort_order ON product_list_items(sort_order);
CREATE INDEX idx_product_list_items_is_enabled ON product_list_items(is_enabled);
CREATE INDEX idx_guess_you_like_items_sort_order ON guess_you_like_items(sort_order);
CREATE INDEX idx_guess_you_like_items_is_enabled ON guess_you_like_items(is_enabled);


