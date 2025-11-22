# Jenkins 企业级 CI/CD 部署方案

> 本文档提供完整的 Jenkins CI/CD 配置方案，用于自动化构建、测试和部署奢侈品商城项目。

## 目录

- [一、Jenkins 安装与配置](#一jenkins-安装与配置)
- [二、Jenkinsfile 配置](#二jenkinsfile-配置)
- [三、Jenkins 项目配置](#三jenkins-项目配置)
- [四、Git Webhook 配置](#四git-webhook-配置)
- [五、环境变量管理](#五环境变量管理)
- [六、高级配置](#六高级配置)
- [七、部署步骤总结](#七部署步骤总结)
- [八、常用命令](#八常用命令)
- [九、安全建议](#九安全建议)
- [十、故障排查](#十故障排查)

---

## 一、Jenkins 安装与配置

### 1.1 使用 Docker 安装 Jenkins（推荐）

在服务器上执行以下命令：

```bash
# 创建 Jenkins 目录
sudo mkdir -p /opt/jenkins
cd /opt/jenkins

# 创建 docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    user: root
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker
      - /opt/luxury-mall:/opt/luxury-mall
    environment:
      - JENKINS_OPTS=--prefix=/jenkins
    restart: unless-stopped
    networks:
      - jenkins-network

volumes:
  jenkins_home:

networks:
  jenkins-network:
    driver: bridge
EOF

# 启动 Jenkins
docker compose up -d

# 查看初始密码
docker compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 1.2 初始化 Jenkins

1. 访问 `http://your-server:8080`
2. 输入初始管理员密码（从上面的命令获取）
3. 选择 "Install suggested plugins"（安装推荐插件）
4. 创建管理员账户
5. 完成安装

### 1.3 安装必要插件

访问 Jenkins → **Manage Jenkins** → **Manage Plugins** → **Available**，搜索并安装以下插件：

#### 必需插件
- **Pipeline** - Jenkins Pipeline 支持
- **Docker Pipeline** - Docker 集成
- **Git** - Git 版本控制
- **Credentials Binding** - 凭据管理
- **Environment Injector** - 环境变量注入

#### 推荐插件
- **Blue Ocean** - 可视化 Pipeline 界面
- **Email Extension** - 邮件通知
- **Slack Notification** - Slack 通知
- **Build Timeout** - 构建超时控制
- **Timestamper** - 时间戳
- **AnsiColor** - ANSI 颜色支持

安装完成后重启 Jenkins。

### 1.4 配置 Docker 权限

确保 Jenkins 容器可以访问 Docker：

```bash
# 将 Jenkins 用户添加到 docker 组（如果使用非 root 用户）
sudo usermod -aG docker jenkins

# 或者确保 Docker socket 已挂载到容器中（已在 docker-compose.yml 中配置）
```

---

## 二、Jenkinsfile 配置

### 2.1 创建 Jenkinsfile

在项目根目录创建 `Jenkinsfile` 文件：

```groovy
pipeline {
    agent any
    
    // 环境变量
    environment {
        // 项目路径
        PROJECT_DIR = '/opt/luxury-mall/luxury-mall'
        DOCKER_COMPOSE_FILE = "${PROJECT_DIR}/docker-compose.yml"
        DOCKER_COMPOSE_PROD_FILE = "${PROJECT_DIR}/docker-compose.prod.yml"
        
        // Docker 镜像标签（使用构建号）
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        
        // Git 信息
        GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        GIT_BRANCH = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
    }
    
    // 选项配置
    options {
        // 保留最近 10 次构建
        buildDiscarder(logRotator(numToKeepStr: '10'))
        
        // 超时设置（30分钟）
        timeout(time: 30, unit: 'MINUTES')
        
        // 添加时间戳
        timestamps()
        
        // 添加 ANSI 颜色支持
        ansiColor('xterm')
    }
    
    // 阶段定义
    stages {
        // 阶段 1: 代码检出
        stage('Checkout') {
            steps {
                script {
                    echo "=========================================="
                    echo "阶段 1: 代码检出"
                    echo "=========================================="
                    echo "分支: ${env.GIT_BRANCH}"
                    echo "提交: ${env.GIT_COMMIT_SHORT}"
                }
                
                checkout scm
                
                script {
                    sh '''
                        echo "当前工作目录: $(pwd)"
                        echo "文件列表:"
                        ls -la
                    '''
                }
            }
        }
        
        // 阶段 2: 代码质量检查（可选）
        stage('Code Quality') {
            steps {
                script {
                    echo "=========================================="
                    echo "阶段 2: 代码质量检查"
                    echo "=========================================="
                }
                
                dir('luxury-mall-backend') {
                    script {
                        try {
                            sh '''
                                echo "检查后端 TypeScript 类型..."
                                npm install
                                npm run type-check || true
                            '''
                        } catch (e) {
                            echo "类型检查失败，但继续构建: ${e}"
                        }
                    }
                }
                
                dir('luxury-mall-frontend') {
                    script {
                        try {
                            sh '''
                                echo "检查前端 TypeScript 类型..."
                                npm install
                                npm run build -- --mode production || true
                            '''
                        } catch (e) {
                            echo "前端构建检查失败，但继续构建: ${e}"
                        }
                    }
                }
            }
        }
        
        // 阶段 3: 构建 Docker 镜像
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        script {
                            echo "=========================================="
                            echo "阶段 3.1: 构建后端镜像"
                            echo "=========================================="
                        }
                        
                        dir('luxury-mall-backend') {
                            script {
                                sh '''
                                    echo "构建后端 Docker 镜像..."
                                    docker build -t luxury-mall-backend:${IMAGE_TAG} .
                                    docker tag luxury-mall-backend:${IMAGE_TAG} luxury-mall-backend:latest
                                    echo "后端镜像构建完成"
                                    docker images | grep luxury-mall-backend
                                '''
                            }
                        }
                    }
                }
                
                stage('Build Frontend') {
                    steps {
                        script {
                            echo "=========================================="
                            echo "阶段 3.2: 构建前端镜像"
                            echo "=========================================="
                        }
                        
                        dir('luxury-mall-frontend') {
                            script {
                                sh '''
                                    echo "构建前端 Docker 镜像..."
                                    docker build -t luxury-mall-frontend:${IMAGE_TAG} .
                                    docker tag luxury-mall-frontend:${IMAGE_TAG} luxury-mall-frontend:latest
                                    echo "前端镜像构建完成"
                                    docker images | grep luxury-mall-frontend
                                '''
                            }
                        }
                    }
                }
            }
        }
        
        // 阶段 4: 运行测试（可选）
        stage('Tests') {
            steps {
                script {
                    echo "=========================================="
                    echo "阶段 4: 运行测试"
                    echo "=========================================="
                    echo "跳过测试阶段（可根据需要添加）"
                }
            }
        }
        
        // 阶段 5: 部署到生产环境
        stage('Deploy to Production') {
            when {
                // 只在 main/master 分支部署
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                script {
                    echo "=========================================="
                    echo "阶段 5: 部署到生产环境"
                    echo "=========================================="
                }
                
                dir("${PROJECT_DIR}") {
                    script {
                        sh '''
                            echo "停止现有容器..."
                            docker compose -f docker-compose.yml -f docker-compose.prod.yml down || true
                            
                            echo "清理旧镜像..."
                            docker image prune -f
                            
                            echo "使用最新镜像启动服务..."
                            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
                            
                            echo "等待服务启动..."
                            sleep 15
                            
                            echo "检查服务状态..."
                            docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
                            
                            echo "健康检查..."
                            echo "检查后端服务..."
                            for i in {1..30}; do
                                if curl -f http://localhost:3001/health > /dev/null 2>&1; then
                                    echo "✓ 后端服务健康"
                                    break
                                fi
                                if [ $i -eq 30 ]; then
                                    echo "✗ 后端服务健康检查失败"
                                    exit 1
                                fi
                                sleep 2
                            done
                            
                            echo "检查前端服务..."
                            for i in {1..30}; do
                                if curl -f http://localhost:80 > /dev/null 2>&1; then
                                    echo "✓ 前端服务健康"
                                    break
                                fi
                                if [ $i -eq 30 ]; then
                                    echo "✗ 前端服务健康检查失败"
                                    exit 1
                                fi
                                sleep 2
                            done
                            
                            echo "=========================================="
                            echo "部署完成！"
                            echo "=========================================="
                        '''
                    }
                }
            }
        }
        
        // 阶段 6: 数据库迁移（可选）
        stage('Database Migration') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                script {
                    echo "=========================================="
                    echo "阶段 6: 数据库迁移"
                    echo "=========================================="
                    echo "跳过数据库迁移（手动执行）"
                    echo "如需迁移，执行: docker compose exec backend npm run migrate-to-db"
                }
            }
        }
    }
    
    // 构建后操作
    post {
        // 成功时
        success {
            script {
                echo "=========================================="
                echo "构建成功！"
                echo "=========================================="
                echo "构建号: ${env.BUILD_NUMBER}"
                echo "分支: ${env.GIT_BRANCH}"
                echo "提交: ${env.GIT_COMMIT_SHORT}"
                echo "镜像标签: ${IMAGE_TAG}"
            }
            
            // 发送成功通知（可选）
            // emailext (
            //     subject: "构建成功: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            //     body: "构建成功！\n分支: ${env.GIT_BRANCH}\n提交: ${env.GIT_COMMIT_SHORT}",
            //     to: "your-email@example.com"
            // )
        }
        
        // 失败时
        failure {
            script {
                echo "=========================================="
                echo "构建失败！"
                echo "=========================================="
                echo "请检查构建日志"
            }
            
            // 发送失败通知（可选）
            // emailext (
            //     subject: "构建失败: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            //     body: "构建失败！\n分支: ${env.GIT_BRANCH}\n提交: ${env.GIT_COMMIT_SHORT}\n请检查构建日志",
            //     to: "your-email@example.com"
            // )
        }
        
        // 总是执行
        always {
            script {
                echo "=========================================="
                echo "清理工作空间..."
                echo "=========================================="
                // 清理 Docker 构建缓存（可选）
                // sh 'docker system prune -f'
            }
        }
    }
}
```

### 2.2 Jenkinsfile 说明

- **agent any**: 使用任意可用节点
- **environment**: 定义环境变量
- **options**: 构建选项（保留历史、超时等）
- **stages**: 构建阶段
  - Checkout: 代码检出
  - Code Quality: 代码质量检查
  - Build Docker Images: 并行构建前后端镜像
  - Tests: 测试阶段
  - Deploy: 部署到生产环境
  - Database Migration: 数据库迁移
- **post**: 构建后操作（成功/失败通知）

---

## 三、Jenkins 项目配置

### 3.1 创建 Pipeline 项目

1. 登录 Jenkins → 点击 **新建任务**
2. 输入任务名称（如 `luxury-mall-ci-cd`）
3. 选择 **Pipeline** 类型
4. 点击 **确定**

### 3.2 配置 Pipeline

#### General 设置

- **GitHub project**（如果使用 GitHub）
  - Project url: `https://github.com/your-username/luxury-mall`

#### Pipeline 设置

- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: 你的 Git 仓库地址
  - 例如: `https://github.com/your-username/luxury-mall.git`
  - 或: `git@github.com:your-username/luxury-mall.git`
- **Credentials**: 
  - 点击 **Add** 添加 Git 凭据
  - 类型选择 **Username with password** 或 **SSH Username with private key**
- **Branches to build**: 
  - Branch Specifier: `*/main` 或 `*/master`
- **Script Path**: `Jenkinsfile`

#### 构建触发器

- **Poll SCM**: `H/5 * * * *`（每 5 分钟检查一次代码变更）
- **GitHub hook trigger for GITScm polling**（如果使用 GitHub Webhook）

### 3.3 保存并测试

1. 点击 **保存**
2. 点击 **立即构建** 测试配置
3. 查看构建日志确认是否成功

---

## 四、Git Webhook 配置

### 4.1 GitHub Webhook

1. 进入 GitHub 仓库
2. 点击 **Settings** → **Webhooks** → **Add webhook**
3. 配置：
   - **Payload URL**: `http://your-jenkins-server:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Secret**: （可选）设置 Webhook 密钥
   - **Which events**: 选择 **Just the push event**
4. 点击 **Add webhook**

### 4.2 GitLab Webhook

1. 进入 GitLab 项目
2. 点击 **Settings** → **Webhooks**
3. 配置：
   - **URL**: `http://your-jenkins-server:8080/project/luxury-mall-ci-cd`
   - **Trigger**: 勾选 **Push events**
   - **Secret token**: （可选）设置令牌
4. 点击 **Add webhook**

### 4.3 测试 Webhook

推送代码到仓库，Jenkins 应该自动触发构建。

---

## 五、环境变量管理

### 5.1 在 Jenkins 中配置凭据

1. 进入 Jenkins → **Manage Jenkins** → **Credentials**
2. 选择 **System** → **Global credentials (unrestricted)**
3. 点击 **Add Credentials**

#### 添加 JWT Secret

- **Kind**: Secret text
- **Secret**: 你的 JWT_SECRET 值
- **ID**: `jwt-secret`
- **Description**: JWT Secret for luxury-mall

#### 添加数据库密码

- **Kind**: Secret text
- **Secret**: 你的数据库密码
- **ID**: `db-password`
- **Description**: Database password for luxury-mall

#### 添加环境变量文件

- **Kind**: Secret file
- **File**: 上传你的 `.env` 文件
- **ID**: `env-file`
- **Description**: Environment variables file

### 5.2 修改 Jenkinsfile 使用凭据

在 `Jenkinsfile` 的 `environment` 部分添加：

```groovy
environment {
    // ... 其他环境变量 ...
    
    // 从 Jenkins 凭据读取
    JWT_SECRET = credentials('jwt-secret')
    DB_PASSWORD = credentials('db-password')
}
```

在部署阶段创建 `.env` 文件：

```groovy
stage('Deploy to Production') {
    steps {
        script {
            sh '''
                # 创建 .env 文件
                cat > .env << EOF
                JWT_SECRET=${JWT_SECRET}
                DB_PASSWORD=${DB_PASSWORD}
                DB_NAME=luxury_mall
                DB_USER=postgres
                DB_HOST=postgres
                DB_PORT=5432
                CORS_ORIGIN=http://your-domain.com
                USE_DATABASE=true
                NODE_ENV=production
                EOF
                
                # 验证 .env 文件（不显示敏感信息）
                echo ".env 文件已创建"
                cat .env | grep -v PASSWORD | grep -v SECRET
            '''
        }
    }
}
```

---

## 六、高级配置

### 6.1 多环境部署

支持开发、测试、生产环境的自动部署：

```groovy
stage('Deploy') {
    steps {
        script {
            def deployEnv = params.DEPLOY_ENV ?: 'staging'
            
            echo "部署环境: ${deployEnv}"
            
            if (deployEnv == 'production') {
                sh '''
                    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
                '''
            } else if (deployEnv == 'staging') {
                sh '''
                    docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
                '''
            } else {
                echo "未知环境: ${deployEnv}"
                error("不支持的部署环境")
            }
        }
    }
}
```

在 Pipeline 配置中添加参数：

```groovy
parameters {
    choice(
        name: 'DEPLOY_ENV',
        choices: ['staging', 'production'],
        description: '选择部署环境'
    )
}
```

### 6.2 回滚机制

添加回滚阶段：

```groovy
stage('Rollback') {
    when {
        expression { params.ROLLBACK == true }
    }
    steps {
        script {
            def previousBuild = params.PREVIOUS_BUILD_NUMBER ?: "${env.BUILD_NUMBER.toInteger() - 1}"
            
            sh """
                echo "回滚到构建 #${previousBuild}..."
                docker compose down
                
                # 使用之前的镜像标签
                docker tag luxury-mall-backend:${previousBuild} luxury-mall-backend:latest
                docker tag luxury-mall-frontend:${previousBuild} luxury-mall-frontend:latest
                
                docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
                
                echo "回滚完成"
            """
        }
    }
}
```

### 6.3 通知配置

#### 邮件通知

在 `post` 部分添加：

```groovy
post {
    success {
        emailext (
            subject: "✅ 构建成功: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: """
                <h2>构建成功</h2>
                <p><strong>项目:</strong> ${env.JOB_NAME}</p>
                <p><strong>构建号:</strong> #${env.BUILD_NUMBER}</p>
                <p><strong>分支:</strong> ${env.GIT_BRANCH}</p>
                <p><strong>提交:</strong> ${env.GIT_COMMIT_SHORT}</p>
                <p><strong>构建时间:</strong> ${new Date()}</p>
                <p><a href="${env.BUILD_URL}">查看构建详情</a></p>
            """,
            to: "dev-team@example.com",
            mimeType: "text/html"
        )
    }
    failure {
        emailext (
            subject: "❌ 构建失败: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: """
                <h2>构建失败</h2>
                <p><strong>项目:</strong> ${env.JOB_NAME}</p>
                <p><strong>构建号:</strong> #${env.BUILD_NUMBER}</p>
                <p><strong>分支:</strong> ${env.GIT_BRANCH}</p>
                <p><strong>提交:</strong> ${env.GIT_COMMIT_SHORT}</p>
                <p><a href="${env.BUILD_URL}">查看构建日志</a></p>
            """,
            to: "dev-team@example.com",
            mimeType: "text/html"
        )
    }
}
```

#### Slack 通知

在 `post` 部分添加：

```groovy
post {
    success {
        slackSend(
            channel: '#deployments',
            color: 'good',
            message: """
                ✅ 部署成功
                项目: ${env.JOB_NAME}
                构建号: #${env.BUILD_NUMBER}
                分支: ${env.GIT_BRANCH}
                提交: ${env.GIT_COMMIT_SHORT}
            """
        )
    }
    failure {
        slackSend(
            channel: '#deployments',
            color: 'danger',
            message: """
                ❌ 部署失败
                项目: ${env.JOB_NAME}
                构建号: #${env.BUILD_NUMBER}
                分支: ${env.GIT_BRANCH}
                提交: ${env.GIT_COMMIT_SHORT}
                请检查构建日志
            """
        )
    }
}
```

### 6.4 构建缓存优化

优化 Docker 构建速度：

```groovy
stage('Build Docker Images') {
    steps {
        script {
            sh '''
                # 使用 BuildKit 加速构建
                export DOCKER_BUILDKIT=1
                
                # 构建后端（使用缓存）
                docker build \
                    --cache-from luxury-mall-backend:latest \
                    -t luxury-mall-backend:${IMAGE_TAG} \
                    -t luxury-mall-backend:latest \
                    ./luxury-mall-backend
                
                # 构建前端（使用缓存）
                docker build \
                    --cache-from luxury-mall-frontend:latest \
                    -t luxury-mall-frontend:${IMAGE_TAG} \
                    -t luxury-mall-frontend:latest \
                    ./luxury-mall-frontend
            '''
        }
    }
}
```

### 6.5 自动化测试集成

添加测试阶段：

```groovy
stage('Run Tests') {
    parallel {
        stage('Backend Tests') {
            steps {
                dir('luxury-mall-backend') {
                    script {
                        sh '''
                            echo "运行后端测试..."
                            npm install
                            npm test || true
                        '''
                    }
                }
            }
        }
        stage('Frontend Tests') {
            steps {
                dir('luxury-mall-frontend') {
                    script {
                        sh '''
                            echo "运行前端测试..."
                            npm install
                            npm test || true
                        '''
                    }
                }
            }
        }
    }
}
```

---

## 七、部署步骤总结

### 7.1 初始设置

1. **安装 Jenkins**
   ```bash
   cd /opt/jenkins
   docker compose up -d
   ```

2. **初始化 Jenkins**
   - 访问 `http://your-server:8080`
   - 输入初始密码
   - 安装推荐插件
   - 创建管理员账户

3. **安装必要插件**
   - Pipeline, Docker Pipeline, Git, Credentials Binding 等

4. **配置 Docker 权限**
   - 确保 Jenkins 可以访问 Docker

### 7.2 项目配置

1. **创建 Jenkinsfile**
   - 在项目根目录创建 `Jenkinsfile`
   - 提交到 Git 仓库

2. **创建 Pipeline 项目**
   - 在 Jenkins 中创建新任务
   - 配置 Git 仓库和凭据
   - 设置构建触发器

3. **配置环境变量**
   - 在 Jenkins 中添加凭据
   - 更新 Jenkinsfile 使用凭据

4. **配置 Webhook**（可选）
   - 在 Git 仓库中配置 Webhook
   - 测试自动触发

### 7.3 测试部署

1. **手动触发构建**
   - 在 Jenkins 中点击 "立即构建"
   - 查看构建日志

2. **验证部署**
   - 检查服务是否正常启动
   - 验证健康检查端点
   - 测试应用功能

3. **配置自动部署**
   - 推送代码到 main/master 分支
   - 验证自动构建和部署

---

## 八、常用命令

### 8.1 Jenkins 管理

```bash
# 查看 Jenkins 日志
docker compose -f /opt/jenkins/docker-compose.yml logs -f jenkins

# 重启 Jenkins
docker compose -f /opt/jenkins/docker-compose.yml restart jenkins

# 停止 Jenkins
docker compose -f /opt/jenkins/docker-compose.yml stop jenkins

# 启动 Jenkins
docker compose -f /opt/jenkins/docker-compose.yml start jenkins

# 进入 Jenkins 容器
docker compose -f /opt/jenkins/docker-compose.yml exec jenkins bash

# 备份 Jenkins 数据
docker run --rm -v jenkins_jenkins_home:/data -v $(pwd):/backup \
    alpine tar czf /backup/jenkins-backup-$(date +%Y%m%d).tar.gz /data

# 恢复 Jenkins 数据
docker run --rm -v jenkins_jenkins_home:/data -v $(pwd):/backup \
    alpine tar xzf /backup/jenkins-backup-YYYYMMDD.tar.gz -C /
```

### 8.2 构建管理

```bash
# 查看构建历史（在 Jenkins Web UI 中）
# 或使用 Jenkins CLI

# 取消正在运行的构建
curl -X POST http://your-jenkins:8080/job/luxury-mall-ci-cd/BUILD_NUMBER/stop

# 触发构建
curl -X POST http://your-jenkins:8080/job/luxury-mall-ci-cd/build

# 带参数的构建
curl -X POST "http://your-jenkins:8080/job/luxury-mall-ci-cd/buildWithParameters?DEPLOY_ENV=production"
```

### 8.3 Docker 管理

```bash
# 查看所有镜像
docker images | grep luxury-mall

# 清理未使用的镜像
docker image prune -a

# 查看容器日志
docker compose logs -f backend
docker compose logs -f frontend

# 重启服务
docker compose restart backend frontend
```

---

## 九、安全建议

### 9.1 Jenkins 安全配置

1. **启用 HTTPS**
   - 使用 Nginx 反向代理配置 SSL
   - 或使用 Jenkins 内置 HTTPS

2. **配置防火墙**
   ```bash
   # 只允许特定 IP 访问 Jenkins
   sudo ufw allow from YOUR_IP to any port 8080
   ```

3. **定期更新**
   - 定期更新 Jenkins 和插件
   - 关注安全公告

4. **用户权限管理**
   - 使用 Role-Based Authorization Strategy 插件
   - 为不同用户分配不同权限

5. **凭据安全**
   - 使用 Jenkins 凭据管理，不要硬编码
   - 定期轮换密钥和密码

### 9.2 Docker 安全

1. **镜像安全**
   - 使用官方基础镜像
   - 定期扫描镜像漏洞
   - 不要在生产环境使用 `latest` 标签

2. **网络安全**
   - 使用 Docker 网络隔离
   - 限制容器间通信

3. **资源限制**
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 1G
   ```

### 9.3 代码安全

1. **敏感信息**
   - 不要将 `.env` 文件提交到 Git
   - 使用环境变量和凭据管理

2. **依赖安全**
   - 定期更新依赖包
   - 使用 `npm audit` 检查漏洞

3. **代码审查**
   - 启用 Pull Request 审查
   - 使用代码扫描工具

---

## 十、故障排查

### 10.1 常见问题

#### 问题 1: Jenkins 无法访问 Docker

**症状**: 构建失败，提示 `docker: command not found`

**解决方案**:
```bash
# 确保 Docker socket 已挂载
docker compose -f /opt/jenkins/docker-compose.yml exec jenkins ls -la /var/run/docker.sock

# 如果不存在，检查 docker-compose.yml 配置
```

#### 问题 2: Git 凭据错误

**症状**: 代码检出失败

**解决方案**:
- 检查 Jenkins 中的 Git 凭据配置
- 验证 SSH 密钥或用户名密码是否正确
- 测试 Git 连接: `git ls-remote <repository-url>`

#### 问题 3: 构建超时

**症状**: 构建在某个阶段超时

**解决方案**:
- 增加超时时间: `timeout(time: 60, unit: 'MINUTES')`
- 检查网络连接
- 优化 Docker 构建（使用缓存）

#### 问题 4: 部署失败

**症状**: 服务启动失败

**解决方案**:
```bash
# 查看容器日志
docker compose logs backend
docker compose logs frontend

# 检查环境变量
docker compose exec backend env

# 检查服务状态
docker compose ps
```

#### 问题 5: Webhook 不触发

**症状**: 推送代码后 Jenkins 不自动构建

**解决方案**:
- 检查 Webhook URL 是否正确
- 验证 Jenkins 可以从外网访问
- 查看 GitHub/GitLab Webhook 日志
- 检查 Jenkins 日志: `docker compose logs jenkins`

### 10.2 调试技巧

1. **查看详细日志**
   ```groovy
   script {
       sh '''
           set -x  # 启用调试模式
           echo "调试信息"
       '''
   }
   ```

2. **添加调试输出**
   ```groovy
   script {
       echo "环境变量: ${env.BUILD_NUMBER}"
       sh 'env | sort'
   }
   ```

3. **测试单个阶段**
   - 在 Jenkinsfile 中临时注释其他阶段
   - 只运行需要调试的阶段

4. **使用 Blue Ocean**
   - 安装 Blue Ocean 插件
   - 使用可视化界面查看 Pipeline 执行

---

## 十一、最佳实践

### 11.1 Pipeline 设计

1. **阶段划分清晰**
   - 每个阶段职责单一
   - 使用并行构建提高效率

2. **错误处理**
   - 使用 `try-catch` 处理异常
   - 提供有意义的错误信息

3. **资源清理**
   - 在 `post` 阶段清理临时文件
   - 定期清理旧镜像和构建

### 11.2 性能优化

1. **使用构建缓存**
   - Docker 层缓存
   - npm 缓存

2. **并行构建**
   - 前后端镜像并行构建
   - 测试并行执行

3. **增量部署**
   - 只构建变更的部分
   - 使用 Docker 多阶段构建

### 11.3 监控和告警

1. **构建监控**
   - 监控构建成功率
   - 跟踪构建时间

2. **服务监控**
   - 集成 Prometheus/Grafana
   - 设置告警规则

3. **日志聚合**
   - 使用 ELK Stack
   - 集中管理日志

---

## 十二、附录

### 12.1 参考资源

- [Jenkins 官方文档](https://www.jenkins.io/doc/)
- [Pipeline 语法参考](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Docker 最佳实践](https://docs.docker.com/develop/dev-best-practices/)

### 12.2 相关文件

- `Jenkinsfile` - Pipeline 定义文件
- `docker-compose.yml` - Docker Compose 配置
- `.env` - 环境变量文件（不提交到 Git）

### 12.3 更新日志

- **2024-11-21**: 初始版本，包含完整的 CI/CD 配置方案

---

## 联系与支持

如有问题或建议，请联系开发团队。

---

**文档版本**: 1.0  
**最后更新**: 2024-11-21

