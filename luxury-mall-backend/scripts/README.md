# 数据库迁移脚本说明

## 方式一：使用 migrate-database 脚本（推荐）

### 在 Docker 容器中执行
```bash
docker exec -it luxury-mall-backend npm run migrate-database
```

### 在本地执行
```bash
cd luxury-mall-backend
npm run migrate-database
```

**优点：**
- 会检查表是否存在，已存在则跳过
- 可以安全地多次执行
- 只创建缺失的表和索引
- 包含权限管理系统的表

## 方式二：使用 init-database 脚本（完整初始化）

### 在 Docker 容器中执行
```bash
docker exec -it luxury-mall-backend npm run init-database
```

### 在本地执行
```bash
cd luxury-mall-backend
npm run init-database
```

**说明：**
- 执行完整的 `schema.sql` 文件
- 包含所有表结构（包括业务表和权限管理表）

## 方式三：直接执行 schema.sql 文件

### 使用 Docker 命令（从宿主机读取文件）

```bash
# 方式1：使用输入重定向（推荐）
docker exec -i luxury-mall-postgres psql -U postgres -d luxury_mall < luxury-mall-backend/src/database/schema.sql

# 方式2：如果文件已挂载到容器内
docker exec -i luxury-mall-postgres psql -U postgres -d luxury_mall -f /docker-entrypoint-initdb.d/schema.sql

# 方式3：使用环境变量（如果已设置）
docker exec -i luxury-mall-postgres psql -U ${DB_USER:-postgres} -d ${DB_NAME:-luxury_mall} < luxury-mall-backend/src/database/schema.sql
```

### 使用 docker-compose 命令

```bash
# 从项目根目录执行
docker-compose exec -T postgres psql -U postgres -d luxury_mall < luxury-mall-backend/src/database/schema.sql
```

**参数说明：**
- `-i` 或 `-T`：保持 STDIN 打开（用于输入重定向）
- `luxury-mall-postgres`：PostgreSQL 容器名称
- `-U postgres`：数据库用户名
- `-d luxury_mall`：数据库名称
- `< file.sql`：从文件读取 SQL 语句

## 注意事项

1. **容器名称**：确保容器正在运行
   ```bash
   docker ps | grep luxury-mall-postgres
   ```

2. **文件路径**：确保 schema.sql 文件路径正确

3. **权限**：确保数据库用户有创建表的权限

4. **多次执行**：schema.sql 使用 `CREATE TABLE IF NOT EXISTS`，可以安全地多次执行

## 推荐使用方式

**首次初始化数据库：**
```bash
docker exec -it luxury-mall-backend npm run migrate-database
```

**或者执行完整 schema.sql：**
```bash
docker exec -i luxury-mall-postgres psql -U postgres -d luxury_mall < luxury-mall-backend/src/database/schema.sql
```

