# Jenkinsfile 使用说明

## 概述

本 Jenkinsfile 提供了完整的 CI/CD 流程，包括代码检出、质量检查、Docker 镜像构建、部署和健康检查。

## 功能特性

### ✅ 核心功能

1. **代码检出** - 自动从 Git 仓库拉取代码
2. **代码质量检查** - 并行执行前后端 TypeScript 类型检查
3. **Docker 镜像构建** - 并行构建前后端镜像
4. **自动化部署** - 根据分支自动选择部署环境
5. **健康检查** - 自动验证服务是否正常启动
6. **数据库迁移** - 支持可选的数据库迁移（生产环境）

### 🎯 参数化构建

支持以下构建参数：

- **DEPLOY_ENV_OVERRIDE**: 部署环境选择（auto/production/development）
- **SKIP_TESTS**: 是否跳过测试阶段
- **RUN_MIGRATION**: 是否运行数据库迁移（仅生产环境）
- **CLEAN_BUILD**: 是否清理旧的 Docker 镜像和容器

## 部署策略

### 分支策略

- **main/master 分支** → 自动部署到生产环境（使用 PostgreSQL）
- **其他分支** → 部署到开发环境（使用 JSON 文件存储）

### 环境配置

- **生产环境**: `docker-compose.yml` + `docker-compose.prod.yml`
- **开发环境**: `docker-compose.yml` + `docker-compose.dev.yml`

## 使用步骤

### 1. 将 Jenkinsfile 添加到项目

```bash
# 确保 Jenkinsfile 在项目根目录
cp Jenkinsfile /opt/luxury-mall/luxury-mall/
```

### 2. 在 Jenkins 中创建 Pipeline 项目

1. 登录 Jenkins → 点击 **新建任务**
2. 输入任务名称（如 `luxury-mall-ci-cd`）
3. 选择 **Pipeline** 类型
4. 点击 **确定**

### 3. 配置 Pipeline

#### General 设置

- **GitHub project**（如果使用 GitHub）
  - Project url: `https://github.com/your-username/luxury-mall`

#### Pipeline 设置

- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: 你的 Git 仓库地址
  - 例如: `https://github.com/your-username/luxury-mall.git`
- **Credentials**: 添加 Git 凭据（如果需要）
- **Branches to build**: 
  - Branch Specifier: `*/main` 或 `*/master`（或 `**` 构建所有分支）
- **Script Path**: `Jenkinsfile`

### 4. 配置环境变量（可选）

如果需要使用 Jenkins 凭据管理敏感信息：

1. 进入 **Manage Jenkins** → **Credentials**
2. 添加以下凭据：
   - Git 凭据（如果需要私有仓库）
   - 数据库密码（如果需要）
   - JWT Secret（如果需要）

### 5. 配置项目路径

确保 Jenkinsfile 中的 `PROJECT_DIR` 路径正确：

```groovy
PROJECT_DIR = '/opt/luxury-mall/luxury-mall'
```

这个路径应该与 `docker-compose.yml` 中挂载的路径一致。

## 构建流程说明

### 阶段 1: Checkout（代码检出）

- 从 Git 仓库拉取最新代码
- 显示分支和提交信息

### 阶段 2: Code Quality（代码质量检查）

并行执行：
- **Backend Type Check**: 后端 TypeScript 类型检查
- **Frontend Type Check**: 前端 TypeScript 类型检查

> 注意：类型检查失败不会中断构建，仅会显示警告

### 阶段 3: Build Docker Images（构建 Docker 镜像）

并行构建：
- **Backend Image**: `luxury-mall-backend:${BUILD_NUMBER}`
- **Frontend Image**: `luxury-mall-frontend:${BUILD_NUMBER}`

同时会创建 `latest` 标签。

### 阶段 4: Tests（测试）

- 当前为占位阶段
- 可以根据需要添加测试命令

### 阶段 5: Deploy（部署）

根据分支自动选择环境：
- **main/master** → 生产环境（PostgreSQL）
- **其他分支** → 开发环境（JSON 文件）

### 阶段 6: Health Check（健康检查）

自动检查：
- 后端服务: `http://localhost:3001/health`
- 前端服务: `http://localhost:80`

最多重试 30 次，每次间隔 2 秒。

### 阶段 7: Database Migration（数据库迁移）

- 仅在 **main/master** 分支且启用 `RUN_MIGRATION` 参数时执行
- 执行 `npm run migrate-to-db` 迁移数据

## 构建参数说明

### DEPLOY_ENV_OVERRIDE

- `auto`: 根据分支自动判断（默认）
- `production`: 强制部署到生产环境
- `development`: 强制部署到开发环境

### SKIP_TESTS

- `false`: 执行测试阶段（默认）
- `true`: 跳过测试阶段

### RUN_MIGRATION

- `false`: 不执行数据库迁移（默认）
- `true`: 执行数据库迁移（仅生产环境）

### CLEAN_BUILD

- `true`: 清理旧容器和镜像（默认）
- `false`: 保留旧容器和镜像

## 常见问题

### 1. 构建失败：找不到项目目录

**问题**: `PROJECT_DIR` 路径不正确

**解决**: 修改 Jenkinsfile 中的 `PROJECT_DIR` 变量，确保与 Docker Compose 挂载路径一致。

### 2. 构建失败：Docker 命令无法执行

**问题**: Jenkins 容器无法访问 Docker

**解决**: 确保 `docker-compose.yml` 中已挂载 Docker socket：
```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
  - /usr/bin/docker:/usr/bin/docker
```

### 3. 健康检查失败

**问题**: 服务启动时间过长或服务异常

**解决**: 
- 检查服务日志: `docker compose logs backend frontend`
- 增加等待时间或重试次数
- 检查端口是否被占用

### 4. 数据库迁移失败

**问题**: 迁移脚本执行错误

**解决**:
- 检查数据库连接配置
- 确认 `schema.sql` 文件存在
- 手动执行迁移: `docker compose exec backend npm run migrate-to-db`

## 自定义配置

### 修改超时时间

在 `options` 部分修改：
```groovy
timeout(time: 60, unit: 'MINUTES')  // 改为你需要的超时时间
```

### 修改保留构建数量

在 `options` 部分修改：
```groovy
buildDiscarder(logRotator(numToKeepStr: '20'))  // 改为你需要的数量
```

### 启用邮件通知

1. 安装 **Email Extension** 插件
2. 在 `post` 部分取消注释邮件相关代码
3. 配置 SMTP 服务器

### 添加 Slack 通知

1. 安装 **Slack Notification** 插件
2. 在 `post` 部分添加：
```groovy
slackSend(
    channel: '#your-channel',
    color: 'good',
    message: "构建成功: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
)
```

## 最佳实践

1. **分支保护**: 在 Git 仓库中设置分支保护，确保 main/master 分支只能通过 PR 合并
2. **代码审查**: 在合并到主分支前进行代码审查
3. **测试覆盖**: 添加自动化测试，提高代码质量
4. **监控告警**: 配置监控和告警，及时发现问题
5. **备份策略**: 定期备份 Jenkins 数据和数据库

## 相关文档

- [Jenkins CI/CD 完整方案](./JENKINS_CI_CD.md)
- [Docker Compose 配置](./docker-compose.yml)
- [环境变量配置](./env.example)

## 支持

如有问题，请查看：
- Jenkins 构建日志
- Docker 容器日志
- 项目文档

