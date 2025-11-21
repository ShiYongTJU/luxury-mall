# 数据库迁移指南

## 概述

本项目当前使用 JSON 文件存储数据，适合开发和测试环境。在生产环境部署时，**强烈建议迁移到 PostgreSQL 数据库**以获得更好的性能、并发处理能力和数据安全性。

## 是否需要迁移？

### 建议迁移的场景

✅ **生产环境部署** - 必须迁移  
✅ **多用户并发访问** - 必须迁移  
✅ **数据量大** - 建议迁移  
✅ **需要复杂查询** - 建议迁移  
✅ **需要数据备份和恢复** - 建议迁移  

### 可以继续使用 JSON 的场景

⚠️ **开发环境** - 可以继续使用 JSON，简单快速  
⚠️ **单用户测试** - 可以继续使用 JSON  
⚠️ **数据量很小** - 可以继续使用 JSON  

**总结：生产环境必须使用数据库，开发环境可以继续使用 JSON 文件。**

## 为什么需要迁移到数据库？

### JSON 文件存储的局限性

1. **并发问题**: 多个请求同时写入可能导致数据丢失或损坏
2. **性能问题**: 每次读写都需要加载整个文件，数据量大时性能差
3. **查询能力**: 无法进行复杂查询、索引、关联查询等
4. **数据安全**: 没有事务支持，数据一致性难以保证
5. **扩展性**: 难以支持分布式部署

### 数据库的优势

1. **并发控制**: 支持多用户并发访问，保证数据一致性
2. **高性能**: 索引、查询优化、连接池等提升性能
3. **数据安全**: ACID 事务保证，数据备份和恢复
4. **扩展性**: 支持读写分离、分库分表等扩展方案
5. **查询能力**: SQL 支持复杂查询和数据分析

## 迁移方案

### 方案一：PostgreSQL（推荐生产环境）

**优点:**
- 功能强大，支持复杂查询
- 性能优秀，适合生产环境
- 开源免费，社区活跃
- 支持 JSON 数据类型，迁移方便

**缺点:**
- 需要单独部署数据库服务
- 配置相对复杂

### 方案二：SQLite（适合小规模部署）

**优点:**
- 无需单独服务，文件数据库
- 配置简单，零维护
- 适合小规模应用

**缺点:**
- 并发性能有限
- 不适合高并发场景

**本指南主要介绍 PostgreSQL 迁移方案。**

## 迁移步骤

### 1. 准备工作

#### 1.1 备份现有数据

```bash
# 进入项目目录
cd /opt/luxury-mall

# 备份数据目录
tar -czf data-backup-$(date +%Y%m%d-%H%M%S).tar.gz luxury-mall-backend/data/

# 或使用 Git 提交当前状态
git add luxury-mall-backend/data/
git commit -m "备份数据文件"
```

#### 1.2 安装 PostgreSQL（如果使用 Docker Compose，可跳过）

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install -y postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. 配置数据库

#### 2.1 更新环境变量

编辑 `.env` 文件，添加数据库配置：

```env
# 数据库配置
USE_DATABASE=true
DB_HOST=postgres
DB_PORT=5432
DB_NAME=luxury_mall
DB_USER=postgres
DB_PASSWORD=your-strong-password-here
```

**重要**: 生产环境请使用强密码！

#### 2.2 创建数据库（如果手动部署 PostgreSQL）

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE luxury_mall;
CREATE USER postgres WITH PASSWORD 'your-strong-password-here';
GRANT ALL PRIVILEGES ON DATABASE luxury_mall TO postgres;
\q
```

### 3. 更新代码以支持数据库

#### 3.1 安装依赖

```bash
cd luxury-mall-backend
npm install pg @types/pg
```

#### 3.2 修改数据库访问层

代码已提供 `src/database/pg-db.ts`，需要修改 `src/database/db.ts` 以支持数据库和 JSON 文件两种模式：

```typescript
// 在 db.ts 中添加
import { initDatabase as initPGDatabase } from './pg-db'

const USE_DATABASE = process.env.USE_DATABASE === 'true'

if (USE_DATABASE) {
  initPGDatabase()
}
```

### 4. 执行数据迁移

#### 4.1 使用 Docker Compose（推荐）

```bash
# 启动服务（会自动创建数据库表）
docker compose up -d postgres

# 等待数据库就绪
sleep 10

# 执行数据迁移
docker compose exec backend npm run migrate-to-db
```

#### 4.2 手动执行迁移

```bash
# 进入后端目录
cd luxury-mall-backend

# 安装依赖
npm install

# 执行迁移脚本
npm run migrate-to-db
```

迁移脚本会：
1. 自动创建数据库表结构
2. 从 JSON 文件读取数据
3. 导入到 PostgreSQL 数据库
4. 显示迁移进度和结果

### 5. 验证迁移结果

#### 5.1 检查数据库表

```bash
# 连接到数据库
docker compose exec postgres psql -U postgres -d luxury_mall

# 查看表
\dt

# 查看数据量
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM addresses) as addresses,
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM orders) as orders,
  (SELECT COUNT(*) FROM regions) as regions;

# 退出
\q
```

#### 5.2 测试 API

```bash
# 测试健康检查
curl http://localhost:3001/health

# 测试获取商品列表
curl http://localhost:3001/api/products

# 测试获取用户（需要登录）
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/users/me
```

### 6. 切换为数据库模式

#### 6.1 更新环境变量

确保 `.env` 文件中：
```env
USE_DATABASE=true
```

#### 6.2 重启服务

```bash
docker compose restart backend
```

#### 6.3 验证

检查日志确认使用数据库：
```bash
docker compose logs backend | grep "数据库连接"
```

应该看到：`数据库连接成功`

## 数据迁移脚本说明

### 迁移脚本功能

`src/scripts/migrate-to-db.ts` 脚本会：

1. **创建表结构**: 自动执行 `schema.sql` 创建所有表
2. **迁移用户数据**: 从 `users.json` 导入用户
3. **迁移地址数据**: 从 `addresses.json` 导入地址
4. **迁移商品数据**: 从 `products.json` 导入商品
4. **迁移订单数据**: 从 `orders.json` 导入订单（包括订单项和地址）
5. **迁移地区数据**: 从 `regions.json` 导入地区

### 迁移策略

- **幂等性**: 使用 `ON CONFLICT DO NOTHING` 确保可以重复执行
- **数据完整性**: 保持外键关系
- **错误处理**: 单个记录失败不影响整体迁移
- **进度显示**: 显示每个表的迁移进度

### 重新迁移

如果需要重新迁移：

```bash
# 清空数据库（谨慎操作！）
docker compose exec postgres psql -U postgres -d luxury_mall -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 重新执行迁移
docker compose exec backend npm run migrate-to-db
```

## 回退方案

如果迁移后出现问题，可以快速回退到 JSON 文件模式：

### 1. 修改环境变量

```env
USE_DATABASE=false
```

### 2. 恢复数据文件

```bash
# 从备份恢复
tar -xzf data-backup-YYYYMMDD-HHMMSS.tar.gz

# 或从 Git 恢复
git checkout HEAD -- luxury-mall-backend/data/
```

### 3. 重启服务

```bash
docker compose restart backend
```

## 性能优化建议

### 1. 连接池配置

在 `pg-db.ts` 中已配置连接池：
```typescript
max: 20,  // 最大连接数
idleTimeoutMillis: 30000,  // 空闲超时
```

根据实际负载调整这些参数。

### 2. 索引优化

已为常用查询字段创建索引：
- `users.phone` - 用户登录查询
- `addresses.user_id` - 用户地址查询
- `orders.user_id` - 用户订单查询
- `products.category` - 商品分类查询

### 3. 查询优化

- 使用 `EXPLAIN ANALYZE` 分析慢查询
- 避免 `SELECT *`，只查询需要的字段
- 使用分页查询，避免一次性加载大量数据

### 4. 定期维护

```bash
# 定期清理和优化数据库
docker compose exec postgres psql -U postgres -d luxury_mall -c "VACUUM ANALYZE;"

# 备份数据库
docker compose exec postgres pg_dump -U postgres luxury_mall > backup-$(date +%Y%m%d).sql
```

## 数据备份和恢复

### 备份

```bash
# 使用 pg_dump 备份
docker compose exec postgres pg_dump -U postgres luxury_mall > backup-$(date +%Y%m%d-%H%M%S).sql

# 或备份整个数据卷
docker run --rm -v luxury-mall_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup-$(date +%Y%m%d-%H%M%S).tar.gz /data
```

### 恢复

```bash
# 从 SQL 文件恢复
docker compose exec -T postgres psql -U postgres luxury_mall < backup-YYYYMMDD-HHMMSS.sql

# 或恢复数据卷
docker run --rm -v luxury-mall_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup-YYYYMMDD-HHMMSS.tar.gz -C /
```

### 定时备份

添加到 crontab：

```bash
# 每天凌晨 2 点备份
0 2 * * * cd /opt/luxury-mall && docker compose exec -T postgres pg_dump -U postgres luxury_mall > /opt/backups/luxury-mall-$(date +\%Y\%m\%d).sql
```

## 常见问题

### Q1: 迁移后数据不一致？

**A**: 检查外键约束，确保关联数据存在。可以重新执行迁移脚本（幂等性保证）。

### Q2: 迁移速度慢？

**A**: 
- 大量数据时，考虑分批迁移
- 临时禁用索引，迁移后重建
- 使用 `COPY` 命令批量导入（需要修改脚本）

### Q3: 如何验证数据完整性？

**A**: 
```sql
-- 检查数据量
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'addresses', COUNT(*) FROM addresses
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;

-- 检查外键完整性
SELECT * FROM addresses WHERE user_id NOT IN (SELECT id FROM users);
```

### Q4: 可以同时使用 JSON 和数据库吗？

**A**: 不建议。代码已支持切换，但不要同时使用两种存储方式。

### Q5: 如何迁移到其他数据库？

**A**: 
- MySQL: 修改 `pg-db.ts` 使用 `mysql2` 库
- MongoDB: 使用 `mongodb` 库，修改数据模型
- SQLite: 使用 `better-sqlite3` 库

## 总结

迁移到数据库是生产环境部署的重要步骤。本指南提供了完整的迁移方案和操作步骤。建议：

1. **开发环境**: 继续使用 JSON 文件，简单快速
2. **测试环境**: 使用数据库，验证迁移正确性
3. **生产环境**: 必须使用数据库，保证性能和稳定性

如有问题，请查看日志或联系技术支持。

---

**最后更新**: 2025-11-21

