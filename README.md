# 奢侈品商城项目 - Docker 部署指南

## 项目简介

这是一个基于 React + TypeScript + Express 的奢侈品电商平台，包含完整的前后端功能。

## 项目结构

```
F:\CODE\
├── luxury-mall-frontend/    # 前端项目（React + Vite）
├── luxury-mall-backend/      # 后端项目（Express + TypeScript）
├── docker-compose.yml        # Docker Compose 基础配置（包含 PostgreSQL）
├── docker-compose.dev.yml   # 开发环境配置（使用 JSON 文件，不启动 PostgreSQL）
├── docker-compose.prod.yml  # 生产环境配置（使用 PostgreSQL 数据库）
├── env.example              # 环境变量示例文件
├── DATABASE_MIGRATION.md    # 数据库迁移指南
└── README.md                # 本文档
```

## 前置要求

### 1. 服务器要求

- **操作系统**: Linux (推荐 Ubuntu 20.04+ 或 CentOS 7+)
- **内存**: 至少 2GB RAM
- **磁盘空间**: 至少 10GB 可用空间
- **网络**: 可访问互联网（用于拉取 Docker 镜像）

### 2. 软件要求

- **Docker**: 版本 20.10+
- **Docker Compose**: 版本 1.29+

### 3. 安装 Docker 和 Docker Compose

#### Ubuntu/Debian 系统

```bash
# 更新系统包
sudo apt-get update

# 安装必要的依赖
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加 Docker 官方 GPG 密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 设置 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker compose version
```

#### CentOS/RHEL 系统

```bash
# 安装必要的依赖
sudo yum install -y yum-utils

# 添加 Docker 仓库
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker Engine
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker compose version
```

## 部署步骤

### 1. 上传项目文件到服务器

将整个项目目录上传到服务器，可以使用以下方式：

#### 方式一：使用 Git（推荐）

```bash
# 在服务器上克隆项目
git clone <your-repository-url> /opt/luxury-mall
cd /opt/luxury-mall
```

#### 方式二：使用 SCP

```bash
# 在本地执行
scp -r F:\CODE\luxury-mall-* root@your-server-ip:/opt/luxury-mall/
scp F:\CODE\docker-compose*.yml root@your-server-ip:/opt/luxury-mall/
scp F:\CODE\env.example root@your-server-ip:/opt/luxury-mall/
```

#### 方式三：使用 FTP/SFTP 工具

使用 FileZilla、WinSCP 等工具上传项目文件。

### 2. 配置环境变量

```bash
# 进入项目目录
cd /opt/luxury-mall

# 复制环境变量示例文件
cp env.example .env

# 编辑环境变量文件
nano .env
```

**重要配置项说明：**

```env
# JWT 密钥（必须修改为强密码）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# JWT 过期时间
JWT_EXPIRES_IN=7d

# CORS 允许的域名（多个用逗号分隔）
# 替换为你的实际域名
CORS_ORIGIN=http://your-domain.com,https://your-domain.com

# 后端端口（一般不需要修改）
PORT=3001

# 环境
NODE_ENV=production

# 数据库配置
# 开发环境：设置为 false 使用 JSON 文件存储（简单快速，默认值）
# 生产环境：设置为 true 使用 PostgreSQL 数据库（安全可靠）
USE_DATABASE=false  # true=使用PostgreSQL, false=使用JSON文件（默认）
DB_HOST=postgres
DB_PORT=5432
DB_NAME=luxury_mall
DB_USER=postgres
DB_PASSWORD=your-strong-database-password-here  # 生产环境必须修改为强密码！
```

**数据库使用说明：**
- **开发环境**: 默认 `USE_DATABASE=false`，使用 JSON 文件存储（简单快速，无需数据库服务）
- **生产环境**: 必须设置 `USE_DATABASE=true`，使用 PostgreSQL 数据库（安全可靠，支持并发）

### 3. 修改前端 API 配置

编辑 `luxury-mall-frontend/src/config/api.ts`，将 API 地址修改为后端服务地址：

```typescript
// 如果是同一域名，可以使用相对路径
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // 生产环境使用相对路径
  : 'http://localhost:3001/api'

// 或者使用绝对路径（需要配置反向代理）
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'http://your-backend-domain:3001/api'
  : 'http://localhost:3001/api'
```

**推荐方案：** 使用 Nginx 反向代理，前端和后端使用同一域名，通过路径区分。

### 4. 构建和启动服务

#### 4.1 开发环境（使用 JSON 文件存储）

```bash
# 进入项目根目录
cd /opt/luxury-mall

# 确保 .env 中 USE_DATABASE=false（或不设置，默认为 false）

# 构建镜像（首次部署或代码更新后）
docker compose build

# 方式一：使用开发环境配置（推荐）
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 方式二：手动指定服务（不启动 PostgreSQL）
docker compose up -d frontend backend

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f
```

#### 4.2 生产环境（使用 PostgreSQL 数据库）

```bash
# 进入项目根目录
cd /opt/luxury-mall

# 确保 .env 中 USE_DATABASE=true 并配置数据库密码
# 编辑 .env 文件
nano .env
# 设置：
# USE_DATABASE=true
# DB_PASSWORD=your-strong-password-here

# 构建镜像
docker compose build

# 方式一：使用生产环境配置（推荐）
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 方式二：直接启动所有服务
docker compose up -d

# 等待数据库就绪（约 10 秒）
sleep 10

# 执行数据迁移（首次部署）
docker compose exec backend npm run migrate-to-db

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f
```

**注意：**
- 生产环境必须使用 PostgreSQL 数据库
- 首次使用数据库时，需要执行数据迁移脚本
- 数据库密码必须设置为强密码

### 5. 验证部署

#### 检查服务状态

```bash
# 查看所有容器状态
docker compose ps

# 开发环境应该看到两个容器都在运行：
# - luxury-mall-backend
# - luxury-mall-frontend

# 生产环境应该看到三个容器都在运行：
# - luxury-mall-postgres
# - luxury-mall-backend
# - luxury-mall-frontend
```

#### 测试后端 API

```bash
# 测试健康检查接口
curl http://localhost:3001/health

# 应该返回：
# {"status":"ok","timestamp":"...","environment":"production"}
```

#### 测试前端

在浏览器中访问：
- `http://your-server-ip` 或 `http://your-domain.com`

**注意：**
- 前端容器内已配置 Nginx，可以直接访问
- 前端 Nginx 已配置 API 代理，`/api/*` 请求会自动转发到后端服务
- 前端路由（React Router）已配置支持，刷新页面不会 404

## 常用操作命令

### 查看日志

```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f backend
docker compose logs -f frontend
```

### 重启服务

```bash
# 重启所有服务
docker compose restart

# 重启特定服务
docker compose restart backend
docker compose restart frontend
```

### 停止服务

```bash
# 停止所有服务
docker compose down

# 停止服务但保留数据卷
docker compose stop
```

### 更新代码

```bash
# 1. 拉取最新代码（如果使用 Git）
git pull

# 2. 重新构建镜像
docker compose build

# 3. 重启服务
docker compose up -d

# 或者一步完成
docker compose up -d --build
```

### 查看资源使用情况

```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
docker system df
```

## 使用 Nginx 反向代理（可选）

**注意：** 前端 Docker 容器内已经配置了 Nginx，可以直接通过 80 端口访问。如果需要使用域名访问并配置 HTTPS，可以在服务器上额外安装 Nginx 作为反向代理。

### 为什么需要额外的 Nginx？

前端容器内的 Nginx 已经可以：
- ✅ 提供静态文件服务
- ✅ 代理 API 请求到后端
- ✅ 支持前端路由

服务器上的 Nginx 主要用于：
- 🌐 域名绑定和虚拟主机
- 🔒 HTTPS/SSL 证书配置
- 🔄 负载均衡（多实例部署）
- 📊 访问日志和监控

### 1. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt-get install -y nginx

# CentOS/RHEL
sudo yum install -y nginx
```

### 2. 配置 Nginx

创建配置文件 `/etc/nginx/sites-available/luxury-mall`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/luxury-mall /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 4. 配置 HTTPS（使用 Let's Encrypt）

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 证书会自动续期
```

## 数据备份

### 备份数据文件

```bash
# 创建备份目录
mkdir -p /opt/backups/luxury-mall

# 备份数据文件
tar -czf /opt/backups/luxury-mall/data-$(date +%Y%m%d-%H%M%S).tar.gz \
  /opt/luxury-mall/luxury-mall-backend/data

# 设置定时备份（每天凌晨 2 点）
crontab -e
# 添加以下行：
# 0 2 * * * tar -czf /opt/backups/luxury-mall/data-$(date +\%Y\%m\%d-\%H\%M\%S).tar.gz /opt/luxury-mall/luxury-mall-backend/data
```

### 恢复数据

```bash
# 停止服务
docker compose down

# 恢复数据
tar -xzf /opt/backups/luxury-mall/data-YYYYMMDD-HHMMSS.tar.gz -C /

# 启动服务
docker compose up -d
```

## 故障排查

### 1. 容器无法启动

```bash
# 查看容器日志
docker compose logs backend
docker compose logs frontend

# 检查容器状态
docker compose ps -a

# 查看详细错误信息
docker inspect luxury-mall-backend
docker inspect luxury-mall-frontend
```

### 2. 端口被占用

```bash
# 检查端口占用
netstat -tulpn | grep :3001
netstat -tulpn | grep :80

# 修改 docker-compose.yml 中的端口映射
```

### 3. 无法访问前端

- 检查防火墙设置
- 检查 Nginx 配置（如果使用）
- 查看前端容器日志

### 4. API 请求失败

- 检查后端容器是否运行
- 检查 CORS 配置
- 查看后端日志
- 检查环境变量配置

### 5. 数据丢失

- 检查数据卷挂载是否正确
- 检查文件权限
- 从备份恢复数据

## 性能优化

### 1. 启用 Gzip 压缩

已在 Nginx 配置中启用，无需额外配置。

### 2. 静态资源缓存

已在 Nginx 配置中设置，静态资源缓存 1 年。

### 3. 数据库优化（如果后续迁移到数据库）

- 添加索引
- 优化查询
- 使用连接池

## 安全建议

1. **修改默认密码和密钥**
   - 修改 `.env` 中的 `JWT_SECRET`
   - 使用强密码

2. **配置防火墙**
   ```bash
   # 只开放必要端口
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **定期更新**
   - 定期更新 Docker 镜像
   - 定期更新系统包
   - 定期检查安全漏洞

4. **使用 HTTPS**
   - 配置 SSL 证书
   - 强制 HTTPS 访问

5. **限制资源使用**
   ```yaml
   # 在 docker-compose.yml 中添加资源限制
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 1G
       reservations:
         cpus: '0.5'
         memory: 512M
   ```

## 监控和维护

### 1. 设置日志轮转

```bash
# 配置 Docker 日志驱动
# 在 docker-compose.yml 中添加：
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 2. 健康检查

已在 `docker-compose.yml` 中配置健康检查，Docker 会自动监控服务状态。

### 3. 监控工具

可以使用以下工具监控服务：
- **Prometheus + Grafana**: 监控指标
- **ELK Stack**: 日志分析
- **Portainer**: Docker 管理界面

## 联系和支持

如有问题，请查看：
- 项目文档
- GitHub Issues
- 技术文档

## 数据库迁移

当前项目使用 JSON 文件存储数据，适合开发环境。**生产环境强烈建议迁移到 PostgreSQL 数据库**。

详细迁移指南请参考：[DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md)

### 快速迁移步骤

1. **配置数据库环境变量**
   ```bash
   # 编辑 .env 文件
   USE_DATABASE=true
   DB_HOST=postgres
   DB_NAME=luxury_mall
   DB_USER=postgres
   DB_PASSWORD=your-strong-password
   ```

2. **启动数据库服务**
   ```bash
   docker compose up -d postgres
   ```

3. **执行数据迁移**
   ```bash
   docker compose exec backend npm run migrate-to-db
   ```

4. **重启后端服务**
   ```bash
   docker compose restart backend
   ```

详细说明请查看 [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md)

---

**最后更新**: 2025-11-21

