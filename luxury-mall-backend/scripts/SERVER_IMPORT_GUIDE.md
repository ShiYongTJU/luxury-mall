# 服务器上导入 Unsplash 图片数据指南

## 在服务器上手动执行导入

### 1. 登录服务器

```bash
ssh user@your-server-ip
```

### 2. 进入项目目录

```bash
cd /opt/luxury-mall-backend
# 或者
cd /var/jenkins_home/workspace/luxury-mall-gitee/luxury-mall-backend
```

### 3. 确保文件存在

```bash
# 检查 JSON 文件是否存在
ls -lh scripts/unsplash-images.json

# 如果不存在，需要先上传文件
# 可以使用 scp 从本地上传：
# scp scripts/unsplash-images.json user@server:/opt/luxury-mall-backend/scripts/
```

### 4. 执行导入脚本

#### 方式 A：使用 npm 脚本（推荐）

```bash
# 确保依赖已安装
npm install

# 执行导入
npm run import-unsplash-images
```

#### 方式 B：使用编译后的 JS 文件

```bash
# 如果已经编译
node dist/scripts/import-unsplash-images.js
```

#### 方式 C：使用 shell 脚本

```bash
# 给脚本添加执行权限
chmod +x scripts/import-unsplash-images-server.sh

# 执行脚本
bash scripts/import-unsplash-images-server.sh
```

### 5. 在 Docker 容器中执行

如果后端运行在 Docker 容器中：

```bash
# 进入容器
docker exec -it luxury-mall-backend bash

# 在容器内执行
cd /app
npm run import-unsplash-images

# 或者直接执行
docker exec -it luxury-mall-backend npm run import-unsplash-images
```

## 方法二：通过 Docker Compose 执行

### 1. 修改 docker-compose.yml

添加一个一次性任务服务：

```yaml
services:
  import-images:
    image: luxury-mall-backend:latest
    container_name: luxury-mall-import-images
    environment:
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    volumes:
      - ./scripts/unsplash-images.json:/app/scripts/unsplash-images.json:ro
    command: npm run import-unsplash-images
    depends_on:
      - postgres
    restart: "no"
```

### 2. 执行导入

```bash
docker-compose run --rm import-images
```

## 环境变量配置

确保在服务器上设置了正确的数据库环境变量：

```bash
# 在 .env 文件中或环境变量中设置
export DB_HOST=your-database-host
export DB_PORT=5432
export DB_NAME=luxury_mall
export DB_USER=postgres
export DB_PASSWORD=your-password
```

或者在 `.env` 文件中：

```env
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=luxury_mall
DB_USER=postgres
DB_PASSWORD=your-password
```

## 验证导入结果

导入完成后，可以通过以下方式验证：

### 1. 通过数据库查询

```bash
# 连接到数据库
psql -h your-database-host -U postgres -d luxury_mall

# 查询图片数量
SELECT COUNT(*) FROM images;

# 查看最近导入的图片
SELECT name, category, url FROM images ORDER BY upload_time DESC LIMIT 10;
```

### 2. 通过 API 查询

```bash
# 查询图片列表
curl http://your-server:3001/api/images?page=1&pageSize=10
```

## 故障排除

### 问题 1: 找不到 JSON 文件

**解决方案**:
- 确保 `unsplash-images.json` 文件已上传到服务器的 `scripts/` 目录
- 检查文件路径是否正确

### 问题 2: 数据库连接失败

**解决方案**:
- 检查数据库服务是否运行
- 验证环境变量配置是否正确
- 检查网络连接和防火墙设置
- 确认数据库允许远程连接

### 问题 3: 权限错误

**解决方案**:
```bash
# 给脚本添加执行权限
chmod +x scripts/import-unsplash-images-server.sh
```

### 问题 4: 重复数据错误

**解决方案**:
- 脚本会自动跳过已存在的图片（基于 ID）
- 如果需要重新导入，可以先清空表或删除重复数据

## 注意事项

1. **数据备份**: 导入前建议备份数据库
2. **网络连接**: 确保服务器可以访问数据库
3. **文件位置**: 确保 JSON 文件在正确的位置
4. **环境变量**: 确保所有必要的环境变量都已设置
5. **权限**: 确保有数据库写入权限

## 快速执行命令（复制粘贴）

```bash
# 1. 进入项目目录
cd /opt/luxury-mall-backend

# 2. 检查文件
ls -lh scripts/unsplash-images.json

# 3. 执行导入
npm run import-unsplash-images
```

