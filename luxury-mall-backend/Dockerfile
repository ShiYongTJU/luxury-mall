# 后端 Dockerfile
# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包括 devDependencies，用于构建）
RUN npm ci

# 先复制所有文件（排除可能的 schema.sql 目录）
COPY . .

# 处理 schema.sql：删除目录（如果存在），然后从构建上下文显式复制文件
# 如果构建上下文中没有文件，则从 Git 仓库获取或创建
RUN echo "=== Processing schema.sql ===" && \
    if [ -d src/database/schema.sql ]; then \
      echo "WARNING: src/database/schema.sql is a directory, removing..." && \
      rm -rf src/database/schema.sql; \
    fi && \
    if [ ! -f src/database/schema.sql ]; then \
      echo "WARNING: schema.sql file not found in build context" && \
      echo "Attempting to get from Git or create from template..." && \
      if command -v git >/dev/null 2>&1 && [ -d .git ]; then \
        echo "Trying to get from Git..." && \
        git show HEAD:src/database/schema.sql > src/database/schema.sql 2>/dev/null || true; \
      fi && \
      if [ ! -f src/database/schema.sql ]; then \
        echo "Creating schema.sql from embedded content..." && \
        cat > src/database/schema.sql << 'EOF'
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
    images TEXT,
    detail_description TEXT,
    highlights TEXT,
    specs TEXT,
    reviews TEXT,
    services TEXT,
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
    selected_specs TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- 订单地址表
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
EOF
        echo "OK: schema.sql created from template"; \
      else \
        echo "OK: schema.sql retrieved from Git"; \
      fi; \
    else \
      echo "OK: src/database/schema.sql exists in build context"; \
    fi && \
    echo "Verifying schema.sql:" && \
    ls -lh src/database/schema.sql && \
    head -3 src/database/schema.sql

# 构建 TypeScript
RUN npm run build

# 确保 dist/database 目录存在，并复制 schema.sql 到 dist 目录，供迁移脚本使用
RUN mkdir -p dist/database && \
    cp src/database/schema.sql dist/database/schema.sql && \
    echo "OK: schema.sql copied to dist/database/" && \
    ls -lh dist/database/schema.sql

# 删除 devDependencies 以减小镜像大小
RUN npm prune --production

# 验证文件在最终镜像中仍然存在
RUN ls -lh dist/database/schema.sql || (echo "ERROR: dist/database/schema.sql does not exist in final image" && exit 1)

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["npm", "start"]


