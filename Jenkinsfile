pipeline {
    agent any
    
    // 环境变量
    environment {
        // 项目路径（Jenkins 容器中挂载的路径）
        PROJECT_DIR = '/opt/luxury-mall/luxury-mall'
        DOCKER_COMPOSE_FILE = "${PROJECT_DIR}/docker-compose.yml"
        DOCKER_COMPOSE_PROD_FILE = "${PROJECT_DIR}/docker-compose.prod.yml"
        DOCKER_COMPOSE_DEV_FILE = "${PROJECT_DIR}/docker-compose.dev.yml"
        
        // Programmer Portfolio 项目路径
        PORTFOLIO_PROJECT_DIR = '/opt/programmer-portfolio'
        PORTFOLIO_DOCKER_COMPOSE_FILE = "${PORTFOLIO_PROJECT_DIR}/docker-compose.yml"
        
        // Luxury Mall Admin 项目路径
        ADMIN_PROJECT_DIR = '/opt/luxury-mall-admin'
        ADMIN_DOCKER_COMPOSE_FILE = "${ADMIN_PROJECT_DIR}/docker-compose.yml"
        
        // Docker 镜像标签（使用构建号）
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        
        // Git 信息
        GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        GIT_BRANCH = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
        
        // 部署环境（根据分支自动判断）
        DEPLOY_ENV = "${env.GIT_BRANCH == 'main' || env.GIT_BRANCH == 'master' ? 'production' : 'development'}"
        
        // 从 Jenkins 凭据读取敏感信息
        // 注意：凭据 ID 需要在 Jenkins 中预先配置
        // 进入 Jenkins → Manage Jenkins → Credentials → Add Credentials
        // 创建 Secret text 类型的凭据，ID 分别为 'jwt-secret' 和 'db-password'
        JWT_SECRET = credentials('jwt-secret')
        DB_PASSWORD = credentials('db-password')
        
        // 其他环境变量（可根据需要修改）
        DB_NAME = 'luxury_mall'
        DB_USER = 'postgres'
        DB_HOST = 'postgres'
        DB_PORT = '5432'
        CORS_ORIGIN = 'http://1.15.93.186'  // 请根据实际情况修改为你的域名或 IP
    }
    
    // 选项配置
    options {
        // 保留最近 20 次构建
        buildDiscarder(logRotator(numToKeepStr: '20'))
        
        // 超时设置（60分钟）
        timeout(time: 60, unit: 'MINUTES')
        
        // 添加时间戳
        timestamps()
        
        // 添加 ANSI 颜色支持
        ansiColor('xterm')
        
        // 跳过默认的 checkout（我们会在 stage 中手动处理）
        skipDefaultCheckout(false)
    }
    
    // 参数化构建（可选）
    parameters {
        choice(
            name: 'DEPLOY_ENV_OVERRIDE',
            choices: ['production', 'auto', 'development'],
            description: '部署环境（auto 表示根据分支自动判断）'
        )
        booleanParam(
            name: 'SKIP_TESTS',
            defaultValue: false,
            description: '跳过测试阶段'
        )
        booleanParam(
            name: 'CLEAN_BUILD',
            defaultValue: true,
            description: '清理旧的 Docker 镜像和容器'
        )
        booleanParam(
            name: 'RESTART_SERVICES',
            defaultValue: false,
            description: '重启服务（重新读取 .env 文件，适用于配置变更）'
        )
        booleanParam(
            name: 'RESET_DATABASE',
            defaultValue: false,
            description: '重新初始化数据库（会删除所有数据，仅生产环境）'
        )
        booleanParam(
            name: 'INIT_DATABASE',
            defaultValue: false,
            description: '初始化数据库表结构（创建所有需要的表，不会删除现有数据）'
        )
        // 项目选择多选框
        booleanParam(
            name: 'BUILD_BACKEND',
            defaultValue: false,
            description: '构建并部署 Luxury Mall 后端项目'
        )
        booleanParam(
            name: 'BUILD_FRONTEND',
            defaultValue: false,
            description: '构建并部署 Luxury Mall 前端项目'
        )
        booleanParam(
            name: 'BUILD_PORTFOLIO',
            defaultValue: false,
            description: '构建并部署 Programmer Portfolio 项目'
        )
        booleanParam(
            name: 'BUILD_ADMIN',
            defaultValue: false,
            description: '构建并部署 Luxury Mall Admin 管理后台项目'
        )
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
                    echo "构建号: ${env.BUILD_NUMBER}"
                }
                
                checkout scm
                
                script {
                    sh '''
                        echo "当前工作目录: $(pwd)"
                        echo "Git 信息:"
                        git log -1 --oneline
                        echo ""
                        echo "项目结构:"
                        ls -la
                    '''
                }
            }
        }
        
        // 阶段 2: 代码质量检查
        stage('Code Quality') {
            parallel {
                stage('Backend Type Check') {
                    steps {
                        script {
                            echo "=========================================="
                            echo "阶段 2.1: 后端 TypeScript 类型检查"
                            echo "=========================================="
                        }
                        
                        dir('luxury-mall-backend') {
                            script {
                                try {
                                    sh '''
                                        echo "安装后端依赖..."
                                        npm ci
                                        
                                        echo "执行 TypeScript 类型检查..."
                                        npm run type-check
                                        
                                        echo "✓ 后端类型检查通过"
                                    '''
                                } catch (e) {
                                    echo "⚠ 后端类型检查失败: ${e}"
                                    echo "继续构建，但请检查类型错误"
                                    // 不中断构建，仅警告
                                }
                            }
                        }
                    }
                }
                
                stage('Frontend Type Check') {
                    steps {
                        script {
                            echo "=========================================="
                            echo "阶段 2.2: 前端 TypeScript 类型检查"
                            echo "=========================================="
                        }
                        
                        dir('luxury-mall-frontend') {
                            script {
                                try {
                                    sh '''
                                        echo "安装前端依赖..."
                                        npm ci
                                        
                                        echo "执行 TypeScript 类型检查..."
                                        npx tsc --noEmit
                                        
                                        echo "✓ 前端类型检查通过"
                                    '''
                                } catch (e) {
                                    echo "⚠ 前端类型检查失败: ${e}"
                                    echo "继续构建，但请检查类型错误"
                                    // 不中断构建，仅警告
                                }
                            }
                        }
                    }
                }
                
                stage('Admin Type Check') {
                    when {
                        expression { params.BUILD_ADMIN == true }
                    }
                    steps {
                        script {
                            echo "=========================================="
                            echo "阶段 2.3: Admin TypeScript 类型检查"
                            echo "=========================================="
                        }
                        
                        dir('luxury-mall-admin') {
                            script {
                                try {
                                    sh '''
                                        echo "安装 Admin 依赖..."
                                        npm ci
                                        
                                        echo "执行 TypeScript 类型检查..."
                                        npx tsc --noEmit
                                        
                                        echo "✓ Admin 类型检查通过"
                                    '''
                                } catch (e) {
                                    echo "⚠ Admin 类型检查失败: ${e}"
                                    echo "继续构建，但请检查类型错误"
                                    // 不中断构建，仅警告
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // 阶段 3: 构建 Docker 镜像
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    when {
                        expression { params.BUILD_BACKEND == true }
                    }
                    steps {
                        script {
                            echo "=========================================="
                            echo "阶段 3.1: 构建后端 Docker 镜像"
                            echo "=========================================="
                        }
                        
                        dir('luxury-mall-backend') {
                            script {
                                sh """
                                    echo "构建后端镜像: luxury-mall-backend:${IMAGE_TAG}"
                                    echo "构建时间: \$(date '+%Y-%m-%d %H:%M:%S')"
                                    echo "当前提交: \$(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
                                    
                                    # 使用 --no-cache 强制重新构建，确保使用最新代码
                                    docker build --no-cache -t luxury-mall-backend:${IMAGE_TAG} .
                                    docker tag luxury-mall-backend:${IMAGE_TAG} luxury-mall-backend:latest
                                    
                                    echo "✓ 后端镜像构建完成"
                                    echo "镜像信息:"
                                    docker images luxury-mall-backend:${IMAGE_TAG} --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}"
                                    docker images luxury-mall-backend:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}"
                                """
                            }
                        }
                    }
                }
                
                stage('Build Frontend Image') {
                    when {
                        expression { params.BUILD_FRONTEND == true }
                    }
                    steps {
                        script {
                            echo "=========================================="
                            echo "阶段 3.2: 构建前端 Docker 镜像"
                            echo "=========================================="
                        }
                        
                        dir('luxury-mall-frontend') {
                            script {
                                sh """
                                    echo "构建前端镜像: luxury-mall-frontend:${IMAGE_TAG}"
                                    echo "构建时间: \$(date '+%Y-%m-%d %H:%M:%S')"
                                    echo "当前提交: \$(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
                                    
                                    # 使用 --no-cache 强制重新构建，确保使用最新代码
                                    docker build --no-cache -t luxury-mall-frontend:${IMAGE_TAG} .
                                    docker tag luxury-mall-frontend:${IMAGE_TAG} luxury-mall-frontend:latest
                                    
                                    echo "✓ 前端镜像构建完成"
                                    echo "镜像信息:"
                                    docker images luxury-mall-frontend:${IMAGE_TAG} --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}"
                                    docker images luxury-mall-frontend:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}"
                                    
                                    # 验证镜像内的文件时间戳
                                    echo "验证镜像内的文件时间戳:"
                                    docker run --rm luxury-mall-frontend:latest ls -lth /usr/share/nginx/html | head -5 || true
                                """
                            }
                        }
                    }
                }
                
                stage('Build Portfolio Image') {
                    when {
                        expression { params.BUILD_PORTFOLIO == true }
                    }
                    steps {
                        script {
                            echo "=========================================="
                            echo "阶段 3.3: 构建 Programmer Portfolio Docker 镜像"
                            echo "=========================================="
                        }
                        
                        dir('programmer-portfolio') {
                            script {
                                sh """
                                    echo "构建 Portfolio 镜像: programmer-portfolio:${IMAGE_TAG}"
                                    echo "构建时间: \$(date '+%Y-%m-%d %H:%M:%S')"
                                    echo "当前提交: \$(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
                                    
                                    # 使用 --no-cache 强制重新构建，确保使用最新代码
                                    docker build --no-cache -t programmer-portfolio:${IMAGE_TAG} .
                                    docker tag programmer-portfolio:${IMAGE_TAG} programmer-portfolio:latest
                                    
                                    echo "✓ Portfolio 镜像构建完成"
                                    echo "镜像信息:"
                                    docker images programmer-portfolio:${IMAGE_TAG} --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}"
                                    docker images programmer-portfolio:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}"
                                    
                                    # 验证镜像内的文件时间戳
                                    echo "验证镜像内的文件时间戳:"
                                    docker run --rm programmer-portfolio:latest ls -lth /usr/share/nginx/html | head -5 || true
                                """
                            }
                        }
                    }
                }
                
                stage('Build Admin Image') {
                    when {
                        expression { params.BUILD_ADMIN == true }
                    }
                    steps {
                        script {
                            echo "=========================================="
                            echo "阶段 3.4: 构建 Luxury Mall Admin Docker 镜像"
                            echo "=========================================="
                        }
                        
                        dir('luxury-mall-admin') {
                            script {
                                sh """
                                    echo "构建 Admin 镜像: luxury-mall-admin:${IMAGE_TAG}"
                                    echo "构建时间: \$(date '+%Y-%m-%d %H:%M:%S')"
                                    echo "当前提交: \$(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
                                    
                                    # 使用 --no-cache 强制重新构建，确保使用最新代码
                                    docker build --no-cache -t luxury-mall-admin:${IMAGE_TAG} .
                                    docker tag luxury-mall-admin:${IMAGE_TAG} luxury-mall-admin:latest
                                    
                                    echo "✓ Admin 镜像构建完成"
                                    echo "镜像信息:"
                                    docker images luxury-mall-admin:${IMAGE_TAG} --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}"
                                    docker images luxury-mall-admin:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}"
                                    
                                    # 验证镜像内的文件时间戳
                                    echo "验证镜像内的文件时间戳:"
                                    docker run --rm luxury-mall-admin:latest ls -lth /usr/share/nginx/html | head -5 || true
                                """
                            }
                        }
                    }
                }
            }
        }
        
        // 阶段 4: 运行测试（可选）
        stage('Tests') {
            when {
                expression { !params.SKIP_TESTS }
            }
            steps {
                script {
                    echo "=========================================="
                    echo "阶段 4: 运行测试"
                    echo "=========================================="
                    echo "当前项目未配置自动化测试"
                    echo "如需添加测试，请在此阶段添加测试命令"
                    echo "例如: npm test"
                }
            }
        }
        
        // 阶段 5: 部署 Luxury Mall 项目
        stage('Deploy Luxury Mall') {
            when {
                anyOf {
                    expression { params.BUILD_BACKEND == true }
                    expression { params.BUILD_FRONTEND == true }
                }
            }
            steps {
                script {
                    echo "=========================================="
                    echo "阶段 5: 部署到 ${DEPLOY_ENV} 环境"
                    echo "=========================================="
                    
                    // 确定部署环境
                    def deployEnv = params.DEPLOY_ENV_OVERRIDE == 'auto' ? 
                        DEPLOY_ENV : params.DEPLOY_ENV_OVERRIDE
                    
                    echo "部署环境: ${deployEnv}"
                    echo "项目目录: ${PROJECT_DIR}"
                    echo "Jenkins Workspace: ${env.WORKSPACE}"
                    
                    // 从 Jenkins workspace 同步代码到部署目录
                    script {
                        sh """
                            echo "=========================================="
                            echo "同步代码到部署目录..."
                            echo "源目录: ${env.WORKSPACE}"
                            echo "目标目录: ${PROJECT_DIR}"
                            echo "=========================================="
                            
                            # 确保部署目录存在
                            mkdir -p ${PROJECT_DIR}
                            
                            # 备份现有的 .env 文件（如果存在）
                            if [ -f ${PROJECT_DIR}/.env ]; then
                                echo "备份现有 .env 文件..."
                                cp ${PROJECT_DIR}/.env ${PROJECT_DIR}/.env.backup.\$(date +%Y%m%d_%H%M%S) || true
                            fi
                            
                            # 使用 rsync 同步文件（排除不需要的文件）
                            if command -v rsync >/dev/null 2>&1; then
                                echo "使用 rsync 同步文件..."
                                rsync -av --delete \\
                                    --exclude='.git' \\
                                    --exclude='node_modules' \\
                                    --exclude='dist' \\
                                    --exclude='build' \\
                                    --exclude='.env' \\
                                    --exclude='.env.backup.*' \\
                                    --exclude='luxury-mall-backend/node_modules' \\
                                    --exclude='luxury-mall-frontend/node_modules' \\
                                    --exclude='luxury-mall-backend/dist' \\
                                    --exclude='luxury-mall-frontend/dist' \\
                                    --exclude='luxury-mall-backend/data' \\
                                    ${env.WORKSPACE}/ ${PROJECT_DIR}/
                                echo "✓ 使用 rsync 同步完成"
                            else
                                echo "rsync 不可用，使用 cp 命令..."
                                # 如果 rsync 不可用，使用 cp 命令
                                # 先清理部署目录（保留 .env 文件）
                                find ${PROJECT_DIR} -mindepth 1 -maxdepth 1 ! -name '.env' ! -name '.env.backup.*' -exec rm -rf {} + 2>/dev/null || true
                                
                                # 复制文件
                                cp -r ${env.WORKSPACE}/* ${PROJECT_DIR}/ 2>/dev/null || true
                                cp -r ${env.WORKSPACE}/.[!.]* ${PROJECT_DIR}/ 2>/dev/null || true
                                
                                # 清理不需要的文件
                                rm -rf ${PROJECT_DIR}/.git 2>/dev/null || true
                                rm -rf ${PROJECT_DIR}/luxury-mall-backend/node_modules 2>/dev/null || true
                                rm -rf ${PROJECT_DIR}/luxury-mall-frontend/node_modules 2>/dev/null || true
                                rm -rf ${PROJECT_DIR}/luxury-mall-backend/dist 2>/dev/null || true
                                rm -rf ${PROJECT_DIR}/luxury-mall-frontend/dist 2>/dev/null || true
                                
                                echo "✓ 使用 cp 同步完成"
                            fi
                            
                            # 恢复 .env 文件
                            LATEST_ENV_BACKUP=\$(ls -t ${PROJECT_DIR}/.env.backup.* 2>/dev/null | head -1)
                            if [ -n "\$LATEST_ENV_BACKUP" ] && [ ! -f ${PROJECT_DIR}/.env ]; then
                                echo "恢复 .env 文件..."
                                cp "\$LATEST_ENV_BACKUP" ${PROJECT_DIR}/.env || true
                            fi
                            
                            # 验证同步结果
                            echo ""
                            echo "=========================================="
                            echo "验证同步结果:"
                            echo "=========================================="
                            echo "部署目录内容:"
                            ls -la ${PROJECT_DIR} | head -10
                            echo ""
                            echo "当前提交: \$(cd ${env.WORKSPACE} && git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
                            echo "部署目录提交: \$(cd ${PROJECT_DIR} && git rev-parse --short HEAD 2>/dev/null || echo 'N/A (not a git repo)')"
                            echo "=========================================="
                        """
                    }
                    
                    // 切换到项目目录
                    dir("${PROJECT_DIR}") {
                        script {
                            
                            // 创建 .env 文件（仅生产环境需要）
                            if (deployEnv == 'production') {
                                sh """
                                    echo "创建 .env 文件..."
                                    cat > .env << EOF
JWT_SECRET=${JWT_SECRET}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
CORS_ORIGIN=${CORS_ORIGIN}
USE_DATABASE=true
NODE_ENV=production
PORT=3001
JWT_EXPIRES_IN=7d
EOF
                                    
                                    # 验证 .env 文件（不显示敏感信息）
                                    echo "✓ .env 文件已创建"
                                    echo "验证 .env 文件内容（隐藏敏感信息）:"
                                    cat .env | grep -v PASSWORD | grep -v SECRET
                                    
                                    # 设置正确的文件权限（仅所有者可读写）
                                    chmod 600 .env
                                    echo "✓ .env 文件权限已设置 (600)"
                                """
                            } else {
                                echo "开发环境，跳过 .env 文件创建（使用 JSON 文件存储）"
                            }
                            
                            // 清理旧容器和镜像（如果启用，只清理勾选的项目）
                            if (params.CLEAN_BUILD) {
                                sh """
                                    echo "清理旧的容器和镜像（仅清理勾选的项目）..."
                                    
                                    BUILD_BACKEND="${params.BUILD_BACKEND}"
                                    BUILD_FRONTEND="${params.BUILD_FRONTEND}"
                                    
                                    # 根据勾选的项目清理对应的服务
                                    if [ "\$BUILD_BACKEND" = "true" ] || [ "\$BUILD_FRONTEND" = "true" ]; then
                                        # 停止并删除对应服务的容器
                                        if [ "\$BUILD_BACKEND" = "true" ]; then
                                            echo "清理后端服务..."
                                            docker-compose -f docker-compose.yml -f docker-compose.prod.yml stop backend || true
                                            docker-compose -f docker-compose.yml -f docker-compose.prod.yml rm -f backend || true
                                            docker-compose -f docker-compose.yml -f docker-compose.dev.yml stop backend || true
                                            docker-compose -f docker-compose.yml -f docker-compose.dev.yml rm -f backend || true
                                        fi
                                        
                                        if [ "\$BUILD_FRONTEND" = "true" ]; then
                                            echo "清理前端服务..."
                                            docker-compose -f docker-compose.yml -f docker-compose.prod.yml stop frontend || true
                                            docker-compose -f docker-compose.yml -f docker-compose.prod.yml rm -f frontend || true
                                            docker-compose -f docker-compose.yml -f docker-compose.dev.yml stop frontend || true
                                            docker-compose -f docker-compose.yml -f docker-compose.dev.yml rm -f frontend || true
                                        fi
                                        
                                        # 清理未使用的镜像（保留最近 3 个版本）
                                        docker image prune -f || true
                                        
                                        echo "✓ 清理完成"
                                    else
                                        echo "没有勾选任何项目，跳过清理"
                                    fi
                                """
                            }
                            
                            // 根据环境选择配置文件
                            def composeFiles = deployEnv == 'production' ? 
                                '-f docker-compose.yml -f docker-compose.prod.yml' :
                                '-f docker-compose.yml -f docker-compose.dev.yml'
                            
                            sh """
                                echo "使用配置文件: ${composeFiles}"
                                
                                # 如果启用重启服务，先停止现有容器（仅停止勾选的服务）
                                if [ "${params.RESTART_SERVICES}" = "true" ]; then
                                    echo "重启服务模式：停止现有容器（仅勾选的服务）..."
                                    BUILD_BACKEND="${params.BUILD_BACKEND}"
                                    BUILD_FRONTEND="${params.BUILD_FRONTEND}"
                                    
                                    if [ "\$BUILD_BACKEND" = "true" ]; then
                                        docker-compose ${composeFiles} stop backend || true
                                    fi
                                    if [ "\$BUILD_FRONTEND" = "true" ]; then
                                        docker-compose ${composeFiles} stop frontend || true
                                    fi
                                    sleep 5
                                    echo "✓ 容器已停止"
                                fi
                                
                                # 如果启用重置数据库，删除数据卷（仅生产环境，且仅当勾选了后端时）
                                if [ "${params.RESET_DATABASE}" = "true" ] && [ "${deployEnv}" = "production" ] && [ "${params.BUILD_BACKEND}" = "true" ]; then
                                    echo "⚠ 警告: 重新初始化数据库（删除所有数据）"
                                    echo "⚠ 注意: 此操作仅在勾选了 BUILD_BACKEND 时执行"
                                    docker-compose ${composeFiles} stop backend postgres || true
                                    docker-compose ${composeFiles} rm -f backend postgres || true
                                    docker volume rm luxury-mall_postgres_data 2>/dev/null || true
                                    echo "✓ 数据卷已删除"
                                    sleep 3
                                elif [ "${params.RESET_DATABASE}" = "true" ] && [ "${params.BUILD_BACKEND}" != "true" ]; then
                                    echo "⚠ 注意: RESET_DATABASE 已启用，但 BUILD_BACKEND 未勾选，跳过数据库重置"
                                fi
                                
                                # 启动服务（使用 Jenkins 构建的镜像，不重新构建）
                                echo "启动服务（使用已构建的镜像）..."
                                
                                # 根据选中的项目决定启动哪些服务
                                BUILD_BACKEND="${params.BUILD_BACKEND}"
                                BUILD_FRONTEND="${params.BUILD_FRONTEND}"
                                
                                # 验证镜像是否存在
                                BACKEND_IMAGE_EXISTS=\$(docker images | grep -c "luxury-mall-backend.*latest" || echo "0")
                                FRONTEND_IMAGE_EXISTS=\$(docker images | grep -c "luxury-mall-frontend.*latest" || echo "0")
                                
                                if [ "\$BUILD_BACKEND" = "true" ]; then
                                    if [ "\$BACKEND_IMAGE_EXISTS" -eq "0" ]; then
                                        echo "⚠ 警告: luxury-mall-backend:latest 镜像不存在，将重新构建"
                                    else
                                        echo "✓ 后端镜像存在: luxury-mall-backend:latest"
                                        echo "后端镜像详细信息:"
                                        docker images luxury-mall-backend:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" || true
                                    fi
                                fi
                                
                                if [ "\$BUILD_FRONTEND" = "true" ]; then
                                    if [ "\$FRONTEND_IMAGE_EXISTS" -eq "0" ]; then
                                        echo "⚠ 警告: luxury-mall-frontend:latest 镜像不存在，将重新构建"
                                    else
                                        echo "✓ 前端镜像存在: luxury-mall-frontend:latest"
                                        echo "前端镜像详细信息:"
                                        docker images luxury-mall-frontend:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" || true
                                    fi
                                fi
                                
                                # 停止并删除现有容器（仅停止勾选的服务，不影响未勾选的服务）
                                echo "停止现有容器（仅勾选的服务）..."
                                
                                # 只停止和删除勾选的服务
                                if [ "\$BUILD_BACKEND" = "true" ]; then
                                    echo "停止后端服务..."
                                    docker-compose ${composeFiles} stop backend || true
                                    docker-compose ${composeFiles} rm -f backend || true
                                fi
                                
                                if [ "\$BUILD_FRONTEND" = "true" ]; then
                                    echo "停止前端服务..."
                                    docker-compose ${composeFiles} stop frontend || true
                                    docker-compose ${composeFiles} rm -f frontend || true
                                fi
                                
                                # 如果重置数据库且勾选了后端，停止 postgres
                                if [ "${params.RESET_DATABASE}" = "true" ] && [ "${deployEnv}" = "production" ] && [ "\$BUILD_BACKEND" = "true" ]; then
                                    echo "停止数据库服务（用于重置）..."
                                    docker-compose ${composeFiles} stop postgres || true
                                    docker-compose ${composeFiles} rm -f postgres || true
                                fi
                                
                                sleep 3
                                
                                # 根据选中的项目决定启动哪些服务
                                SERVICES_TO_START=""
                                if [ "\$BUILD_BACKEND" = "true" ]; then
                                    SERVICES_TO_START="postgres backend"
                                fi
                                if [ "\$BUILD_FRONTEND" = "true" ]; then
                                    SERVICES_TO_START="\$SERVICES_TO_START frontend"
                                fi
                                
                                # 判断是否需要重新构建
                                NEED_BUILD=false
                                if [ "\$BUILD_BACKEND" = "true" ] && [ "\$BACKEND_IMAGE_EXISTS" -eq "0" ]; then
                                    NEED_BUILD=true
                                fi
                                if [ "\$BUILD_FRONTEND" = "true" ] && [ "\$FRONTEND_IMAGE_EXISTS" -eq "0" ]; then
                                    NEED_BUILD=true
                                fi
                                
                                if [ "\$NEED_BUILD" = "true" ]; then
                                    echo "部分镜像不存在，重新构建缺失的镜像..."
                                    if [ -n "\$SERVICES_TO_START" ]; then
                                        docker-compose ${composeFiles} up -d --build --force-recreate \$SERVICES_TO_START
                                    else
                                        docker-compose ${composeFiles} up -d --build --force-recreate
                                    fi
                                else
                                    echo "使用已构建的镜像启动服务（强制重新创建容器）..."
                                    if [ -n "\$SERVICES_TO_START" ]; then
                                        docker-compose ${composeFiles} up -d --no-build --force-recreate \$SERVICES_TO_START
                                    else
                                        docker-compose ${composeFiles} up -d --no-build --force-recreate
                                    fi
                                fi
                                
                                echo "等待服务启动..."
                                sleep 20
                                
                                echo "检查服务状态..."
                                docker-compose ${composeFiles} ps
                                
                                # 如果启用初始化数据库，创建所有需要的表（不会删除现有数据）
                                # 注意：这个步骤在服务启动之后执行，确保后端容器已运行
                                if [ "${params.INIT_DATABASE}" = "true" ] && [ "${params.BUILD_BACKEND}" = "true" ]; then
                                    echo ""
                                    echo "=========================================="
                                    echo "初始化数据库表结构..."
                                    echo "=========================================="
                                    
                                    # 等待数据库就绪
                                    echo "等待数据库就绪..."
                                    for i in {1..30}; do
                                        if docker-compose ${composeFiles} exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
                                            echo "✓ 数据库已就绪"
                                            break
                                        fi
                                        echo "等待数据库启动... ($i/30)"
                                        sleep 2
                                    done
                                    
                                    # 等待后端容器启动
                                    echo "等待后端容器启动..."
                                    sleep 5
                                    
                                    # 使用后端 Docker 容器执行初始化脚本（推荐方式）
                                    if docker ps | grep -q "luxury-mall-backend"; then
                                        echo "使用后端容器执行数据库初始化脚本..."
                                        
                                        # 在容器中执行初始化脚本
                                        # 注意：容器内需要能够访问到 postgres 服务（通过 docker-compose 网络）
                                        docker-compose ${composeFiles} exec -T backend sh -c "
                                            export DB_HOST=postgres
                                            export DB_PORT=5432
                                            export DB_NAME=${DB_NAME}
                                            export DB_USER=${DB_USER}
                                            export DB_PASSWORD=${DB_PASSWORD}
                                            cd /app
                                            npm run init-database
                                        " || {
                                            echo "⚠ 警告: 数据库初始化脚本执行失败，但继续部署"
                                            echo "可能的原因："
                                            echo "  1. 容器内缺少依赖，请检查 Dockerfile 是否包含 scripts 目录"
                                            echo "  2. 数据库连接失败，请检查环境变量"
                                            echo "  3. schema.sql 文件不存在"
                                            echo ""
                                            echo "请手动执行以下命令初始化数据库："
                                            echo "  docker-compose ${composeFiles} exec backend npm run init-database"
                                        }
                                    else
                                        echo "⚠ 警告: 后端容器未运行，无法执行初始化脚本"
                                        echo "请确保后端服务已启动，然后手动执行："
                                        echo "  docker-compose ${composeFiles} exec backend npm run init-database"
                                    fi
                                    
                                    echo "=========================================="
                                elif [ "${params.INIT_DATABASE}" = "true" ] && [ "${params.BUILD_BACKEND}" != "true" ]; then
                                    echo "⚠ 注意: INIT_DATABASE 已启用，但 BUILD_BACKEND 未勾选，跳过数据库初始化"
                                fi
                                
                                # 验证容器使用的镜像
                                echo ""
                                echo "=========================================="
                                echo "验证容器使用的镜像:"
                                echo "=========================================="
                                docker-compose ${composeFiles} ps --format "table {{.Name}}\t{{.Image}}\t{{.Status}}" || docker-compose ${composeFiles} ps
                                
                                # 检查前端容器使用的镜像 ID（如果前端被选中）
                                if [ "\$BUILD_FRONTEND" = "true" ]; then
                                    echo ""
                                    echo "前端容器详细信息:"
                                    FRONTEND_CONTAINER_ID=\$(docker-compose ${composeFiles} ps -q frontend)
                                    if [ -n "\$FRONTEND_CONTAINER_ID" ]; then
                                        echo "容器 ID: \$FRONTEND_CONTAINER_ID"
                                        echo "容器使用的镜像 ID:"
                                        docker inspect \$FRONTEND_CONTAINER_ID --format='{{.Image}}' || true
                                        echo "latest 标签指向的镜像 ID:"
                                        docker images luxury-mall-frontend:latest --format='{{.ID}}' || true
                                        echo "容器内文件时间戳:"
                                        docker exec \$FRONTEND_CONTAINER_ID ls -lth /usr/share/nginx/html | head -5 || true
                                    else
                                        echo "⚠ 警告: 前端容器未找到"
                                    fi
                                fi
                                
                                # 检查后端容器使用的镜像 ID（如果后端被选中）
                                if [ "\$BUILD_BACKEND" = "true" ]; then
                                    echo ""
                                    echo "后端容器详细信息:"
                                    BACKEND_CONTAINER_ID=\$(docker-compose ${composeFiles} ps -q backend)
                                    if [ -n "\$BACKEND_CONTAINER_ID" ]; then
                                        echo "容器 ID: \$BACKEND_CONTAINER_ID"
                                        echo "容器使用的镜像 ID:"
                                        docker inspect \$BACKEND_CONTAINER_ID --format='{{.Image}}' || true
                                        echo "latest 标签指向的镜像 ID:"
                                        docker images luxury-mall-backend:latest --format='{{.ID}}' || true
                                    else
                                        echo "⚠ 警告: 后端容器未找到"
                                    fi
                                fi
                                echo "=========================================="
                            """
                        }
                    }
                }
            }
        }
        
        // 阶段 6: 部署 Programmer Portfolio
        stage('Deploy Portfolio') {
            when {
                expression { params.BUILD_PORTFOLIO == true }
            }
            steps {
                script {
                    echo "=========================================="
                    echo "阶段 6: 部署 Programmer Portfolio"
                    echo "=========================================="
                    echo "部署环境: ${DEPLOY_ENV}"
                    echo "项目目录: ${PORTFOLIO_PROJECT_DIR}"
                    echo "Jenkins Workspace: ${env.WORKSPACE}"
                    
                    // 从 Jenkins workspace 同步代码到部署目录
                    script {
                        sh """
                            echo "=========================================="
                            echo "同步 Portfolio 代码到部署目录..."
                            echo "源目录: ${env.WORKSPACE}/programmer-portfolio"
                            echo "目标目录: ${PORTFOLIO_PROJECT_DIR}"
                            echo "=========================================="
                            
                            # 确保部署目录存在
                            mkdir -p ${PORTFOLIO_PROJECT_DIR}
                            
                            # 使用 rsync 同步文件（排除不需要的文件）
                            if command -v rsync >/dev/null 2>&1; then
                                echo "使用 rsync 同步文件..."
                                rsync -av --delete \\
                                    --exclude='.git' \\
                                    --exclude='node_modules' \\
                                    --exclude='dist' \\
                                    --exclude='build' \\
                                    ${env.WORKSPACE}/programmer-portfolio/ ${PORTFOLIO_PROJECT_DIR}/
                                echo "✓ 使用 rsync 同步完成"
                            else
                                echo "rsync 不可用，使用 cp 命令..."
                                # 如果 rsync 不可用，使用 cp 命令
                                # 先清理部署目录
                                find ${PORTFOLIO_PROJECT_DIR} -mindepth 1 -maxdepth 1 ! -name '.env' ! -name '.env.backup.*' -exec rm -rf {} + 2>/dev/null || true
                                
                                # 复制文件
                                cp -r ${env.WORKSPACE}/programmer-portfolio/* ${PORTFOLIO_PROJECT_DIR}/ 2>/dev/null || true
                                cp -r ${env.WORKSPACE}/programmer-portfolio/.[!.]* ${PORTFOLIO_PROJECT_DIR}/ 2>/dev/null || true
                                
                                # 清理不需要的文件
                                rm -rf ${PORTFOLIO_PROJECT_DIR}/.git 2>/dev/null || true
                                rm -rf ${PORTFOLIO_PROJECT_DIR}/node_modules 2>/dev/null || true
                                rm -rf ${PORTFOLIO_PROJECT_DIR}/dist 2>/dev/null || true
                                
                                echo "✓ 使用 cp 同步完成"
                            fi
                            
                            # 验证同步结果
                            echo ""
                            echo "=========================================="
                            echo "验证同步结果:"
                            echo "=========================================="
                            echo "部署目录内容:"
                            ls -la ${PORTFOLIO_PROJECT_DIR} | head -10
                            echo "=========================================="
                        """
                    }
                    
                    // 切换到项目目录
                    dir("${PORTFOLIO_PROJECT_DIR}") {
                        script {
                            // 清理旧容器和镜像（如果启用，且勾选了 Portfolio）
                            if (params.CLEAN_BUILD && params.BUILD_PORTFOLIO) {
                                sh '''
                                    echo "清理旧的 Portfolio 容器和镜像..."
                                    docker-compose -f docker-compose.yml down || true
                                    
                                    # 清理未使用的镜像（保留最近 3 个版本）
                                    docker image prune -f || true
                                    
                                    echo "✓ 清理完成"
                                '''
                            } else if (params.CLEAN_BUILD && !params.BUILD_PORTFOLIO) {
                                echo "CLEAN_BUILD 已启用，但 BUILD_PORTFOLIO 未勾选，跳过 Portfolio 清理"
                            }
                            
                            // 启动服务（使用 Jenkins 构建的镜像，不重新构建）
                            sh """
                                echo "启动 Portfolio 服务（使用已构建的镜像）..."
                                echo "Portfolio 镜像: programmer-portfolio:latest"
                                
                                # 验证镜像是否存在
                                PORTFOLIO_IMAGE_EXISTS=\$(docker images | grep -c "programmer-portfolio.*latest" || echo "0")
                                
                                if [ "\$PORTFOLIO_IMAGE_EXISTS" -eq "0" ]; then
                                    echo "⚠ 警告: programmer-portfolio:latest 镜像不存在，将重新构建"
                                else
                                    echo "✓ Portfolio 镜像存在: programmer-portfolio:latest"
                                    echo "Portfolio 镜像详细信息:"
                                    docker images programmer-portfolio:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" || true
                                fi
                                
                                # 停止并删除现有容器（确保使用新镜像）
                                echo "停止现有容器..."
                                docker-compose -f docker-compose.yml down || true
                                sleep 3
                                
                                # 如果镜像存在，使用 --no-build 并强制重新创建；否则使用 --build
                                if [ "\$PORTFOLIO_IMAGE_EXISTS" -gt "0" ]; then
                                    echo "使用已构建的镜像启动服务（强制重新创建容器）..."
                                    docker-compose -f docker-compose.yml up -d --no-build --force-recreate
                                else
                                    echo "镜像不存在，重新构建镜像..."
                                    docker-compose -f docker-compose.yml up -d --build --force-recreate
                                fi
                                
                                echo "等待服务启动..."
                                sleep 10
                                
                                echo "检查服务状态..."
                                docker-compose -f docker-compose.yml ps
                                
                                # 验证容器使用的镜像
                                echo ""
                                echo "=========================================="
                                echo "验证容器使用的镜像:"
                                echo "=========================================="
                                docker-compose -f docker-compose.yml ps --format "table {{.Name}}\t{{.Image}}\t{{.Status}}" || docker-compose -f docker-compose.yml ps
                                
                                # 检查 Portfolio 容器使用的镜像 ID
                                echo ""
                                echo "Portfolio 容器详细信息:"
                                PORTFOLIO_CONTAINER_ID=\$(docker-compose -f docker-compose.yml ps -q portfolio)
                                if [ -n "\$PORTFOLIO_CONTAINER_ID" ]; then
                                    echo "容器 ID: \$PORTFOLIO_CONTAINER_ID"
                                    echo "容器使用的镜像 ID:"
                                    docker inspect \$PORTFOLIO_CONTAINER_ID --format='{{.Image}}' || true
                                    echo "latest 标签指向的镜像 ID:"
                                    docker images programmer-portfolio:latest --format='{{.ID}}' || true
                                    echo "容器内文件时间戳:"
                                    docker exec \$PORTFOLIO_CONTAINER_ID ls -lth /usr/share/nginx/html | head -5 || true
                                else
                                    echo "⚠ 警告: Portfolio 容器未找到"
                                fi
                                echo "=========================================="
                            """
                        }
                    }
                }
            }
        }
        
        // 阶段 7: 部署 Luxury Mall Admin
        stage('Deploy Admin') {
            when {
                expression { params.BUILD_ADMIN == true }
            }
            steps {
                script {
                    echo "=========================================="
                    echo "阶段 7: 部署 Luxury Mall Admin"
                    echo "=========================================="
                    echo "部署环境: ${DEPLOY_ENV}"
                    echo "项目目录: ${ADMIN_PROJECT_DIR}"
                    echo "Jenkins Workspace: ${env.WORKSPACE}"
                    
                    // 从 Jenkins workspace 同步代码到部署目录
                    script {
                        sh """
                            echo "=========================================="
                            echo "同步 Admin 代码到部署目录..."
                            echo "源目录: ${env.WORKSPACE}/luxury-mall-admin"
                            echo "目标目录: ${ADMIN_PROJECT_DIR}"
                            echo "=========================================="
                            
                            # 确保部署目录存在
                            mkdir -p ${ADMIN_PROJECT_DIR}
                            
                            # 使用 rsync 同步文件（排除不需要的文件）
                            if command -v rsync >/dev/null 2>&1; then
                                echo "使用 rsync 同步文件..."
                                rsync -av --delete \\
                                    --exclude='.git' \\
                                    --exclude='node_modules' \\
                                    --exclude='dist' \\
                                    --exclude='build' \\
                                    ${env.WORKSPACE}/luxury-mall-admin/ ${ADMIN_PROJECT_DIR}/
                                echo "✓ 使用 rsync 同步完成"
                            else
                                echo "rsync 不可用，使用 cp 命令..."
                                # 如果 rsync 不可用，使用 cp 命令
                                # 先清理部署目录
                                find ${ADMIN_PROJECT_DIR} -mindepth 1 -maxdepth 1 ! -name '.env' ! -name '.env.backup.*' -exec rm -rf {} + 2>/dev/null || true
                                
                                # 复制文件
                                cp -r ${env.WORKSPACE}/luxury-mall-admin/* ${ADMIN_PROJECT_DIR}/ 2>/dev/null || true
                                cp -r ${env.WORKSPACE}/luxury-mall-admin/.[!.]* ${ADMIN_PROJECT_DIR}/ 2>/dev/null || true
                                
                                # 清理不需要的文件
                                rm -rf ${ADMIN_PROJECT_DIR}/.git 2>/dev/null || true
                                rm -rf ${ADMIN_PROJECT_DIR}/node_modules 2>/dev/null || true
                                rm -rf ${ADMIN_PROJECT_DIR}/dist 2>/dev/null || true
                                
                                echo "✓ 使用 cp 同步完成"
                            fi
                            
                            # 验证同步结果
                            echo ""
                            echo "=========================================="
                            echo "验证同步结果:"
                            echo "=========================================="
                            echo "部署目录内容:"
                            ls -la ${ADMIN_PROJECT_DIR} | head -10
                            echo "=========================================="
                        """
                    }
                    
                    // 切换到项目目录
                    dir("${ADMIN_PROJECT_DIR}") {
                        script {
                            // 清理旧容器和镜像（如果启用，且勾选了 Admin）
                            if (params.CLEAN_BUILD && params.BUILD_ADMIN) {
                                sh '''
                                    echo "清理旧的 Admin 容器和镜像..."
                                    docker-compose -f docker-compose.yml down || true
                                    
                                    # 清理未使用的镜像（保留最近 3 个版本）
                                    docker image prune -f || true
                                    
                                    echo "✓ 清理完成"
                                '''
                            } else if (params.CLEAN_BUILD && !params.BUILD_ADMIN) {
                                echo "CLEAN_BUILD 已启用，但 BUILD_ADMIN 未勾选，跳过 Admin 清理"
                            }
                            
                            // 启动服务（使用 Jenkins 构建的镜像，不重新构建）
                            sh """
                                echo "启动 Admin 服务（使用已构建的镜像）..."
                                echo "Admin 镜像: luxury-mall-admin:latest"
                                
                                # 验证镜像是否存在
                                ADMIN_IMAGE_EXISTS=\$(docker images | grep -c "luxury-mall-admin.*latest" || echo "0")
                                
                                if [ "\$ADMIN_IMAGE_EXISTS" -eq "0" ]; then
                                    echo "⚠ 警告: luxury-mall-admin:latest 镜像不存在，将重新构建"
                                else
                                    echo "✓ Admin 镜像存在: luxury-mall-admin:latest"
                                    echo "Admin 镜像详细信息:"
                                    docker images luxury-mall-admin:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" || true
                                fi
                                
                                # 停止并删除现有容器（确保使用新镜像）
                                echo "停止现有容器..."
                                docker-compose -f docker-compose.yml down || true
                                sleep 3
                                
                                # 如果镜像存在，使用 --no-build 并强制重新创建；否则使用 --build
                                if [ "\$ADMIN_IMAGE_EXISTS" -gt "0" ]; then
                                    echo "使用已构建的镜像启动服务（强制重新创建容器）..."
                                    docker-compose -f docker-compose.yml up -d --no-build --force-recreate
                                else
                                    echo "镜像不存在，重新构建镜像..."
                                    docker-compose -f docker-compose.yml up -d --build --force-recreate
                                fi
                                
                                echo "等待服务启动..."
                                sleep 10
                                
                                echo "检查服务状态..."
                                docker-compose -f docker-compose.yml ps
                                
                                # 验证容器使用的镜像
                                echo ""
                                echo "=========================================="
                                echo "验证容器使用的镜像:"
                                echo "=========================================="
                                docker-compose -f docker-compose.yml ps --format "table {{.Name}}\t{{.Image}}\t{{.Status}}" || docker-compose -f docker-compose.yml ps
                                
                                # 检查 Admin 容器使用的镜像 ID
                                echo ""
                                echo "Admin 容器详细信息:"
                                ADMIN_CONTAINER_ID=\$(docker-compose -f docker-compose.yml ps -q admin)
                                if [ -n "\$ADMIN_CONTAINER_ID" ]; then
                                    echo "容器 ID: \$ADMIN_CONTAINER_ID"
                                    echo "容器使用的镜像 ID:"
                                    docker inspect \$ADMIN_CONTAINER_ID --format='{{.Image}}' || true
                                    echo "latest 标签指向的镜像 ID:"
                                    docker images luxury-mall-admin:latest --format='{{.ID}}' || true
                                    echo "容器内文件时间戳:"
                                    docker exec \$ADMIN_CONTAINER_ID ls -lth /usr/share/nginx/html | head -5 || true
                                else
                                    echo "⚠ 警告: Admin 容器未找到"
                                fi
                                echo "=========================================="
                            """
                        }
                    }
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
                echo "✓ 构建成功！"
                echo "=========================================="
                echo "构建号: ${env.BUILD_NUMBER}"
                echo "分支: ${env.GIT_BRANCH}"
                echo "提交: ${env.GIT_COMMIT_SHORT}"
                echo "镜像标签: ${IMAGE_TAG}"
                echo "部署环境: ${DEPLOY_ENV}"
                echo ""
                echo "服务访问地址:"
                if (params.BUILD_FRONTEND == true) {
                    echo "  前端: http://your-server-ip:80"
                }
                if (params.BUILD_BACKEND == true) {
                    echo "  后端: http://your-server-ip:3001"
                }
                if (params.BUILD_PORTFOLIO == true) {
                    echo "  Portfolio: http://your-server-ip:666"
                }
                if (params.BUILD_ADMIN == true) {
                    echo "  Admin: http://your-server-ip:3002"
                }
                echo "=========================================="
                
                // 发送成功通知（需要配置 Email Extension 插件）
                // emailext (
                //     subject: "✓ 构建成功: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                //     body: """
                //         构建成功！
                //         
                //         项目: ${env.JOB_NAME}
                //         构建号: #${env.BUILD_NUMBER}
                //         分支: ${env.GIT_BRANCH}
                //         提交: ${env.GIT_COMMIT_SHORT}
                //         环境: ${DEPLOY_ENV}
                //         
                //         查看详情: ${env.BUILD_URL}
                //     """,
                //     to: "your-email@example.com"
                // )
            }
        }
        
        // 失败时
        failure {
            script {
                echo "=========================================="
                echo "✗ 构建失败！"
                echo "=========================================="
                echo "构建号: ${env.BUILD_NUMBER}"
                echo "分支: ${env.GIT_BRANCH}"
                echo "提交: ${env.GIT_COMMIT_SHORT}"
                echo ""
                echo "请检查构建日志以获取详细信息"
                echo "=========================================="
                
                // 发送失败通知（需要配置 Email Extension 插件）
                // emailext (
                //     subject: "✗ 构建失败: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                //     body: """
                //         构建失败！
                //         
                //         项目: ${env.JOB_NAME}
                //         构建号: #${env.BUILD_NUMBER}
                //         分支: ${env.GIT_BRANCH}
                //         提交: ${env.GIT_COMMIT_SHORT}
                //         
                //         请检查构建日志: ${env.BUILD_URL}
                //     """,
                //     to: "your-email@example.com",
                //     attachLog: true
                // )
            }
        }
        
        // 总是执行
        always {
            script {
                echo "=========================================="
                echo "构建后清理"
                echo "=========================================="
                
                // 清理工作空间（可选）
                // cleanWs()
                
                // 清理 Docker 构建缓存（可选，会删除未使用的镜像和容器）
                // sh 'docker system prune -f'
                
                echo "构建完成时间: ${new Date()}"
            }
        }
        
        // 清理（无论成功或失败）
        cleanup {
            script {
                echo "执行清理操作..."
                // 可以在这里添加清理逻辑
            }
        }
    }
}

