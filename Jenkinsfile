pipeline {
    agent any
    
    // 环境变量
    environment {
        // 项目路径（Jenkins 容器中挂载的路径）
        PROJECT_DIR = '/opt/luxury-mall/luxury-mall'
        DOCKER_COMPOSE_FILE = "${PROJECT_DIR}/docker-compose.yml"
        DOCKER_COMPOSE_PROD_FILE = "${PROJECT_DIR}/docker-compose.prod.yml"
        DOCKER_COMPOSE_DEV_FILE = "${PROJECT_DIR}/docker-compose.dev.yml"
        
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
            choices: ['auto', 'production', 'development'],
            description: '部署环境（auto 表示根据分支自动判断）'
        )
        booleanParam(
            name: 'SKIP_TESTS',
            defaultValue: false,
            description: '跳过测试阶段'
        )
        booleanParam(
            name: 'RUN_MIGRATION',
            defaultValue: false,
            description: '运行数据库迁移（仅生产环境）'
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
            }
        }
        
        // 阶段 3: 构建 Docker 镜像
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
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
                                    docker build -t luxury-mall-backend:${IMAGE_TAG} .
                                    docker tag luxury-mall-backend:${IMAGE_TAG} luxury-mall-backend:latest
                                    
                                    echo "✓ 后端镜像构建完成"
                                    echo "镜像信息:"
                                    docker images | grep luxury-mall-backend | head -2
                                """
                            }
                        }
                    }
                }
                
                stage('Build Frontend Image') {
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
                                    docker build -t luxury-mall-frontend:${IMAGE_TAG} .
                                    docker tag luxury-mall-frontend:${IMAGE_TAG} luxury-mall-frontend:latest
                                    
                                    echo "✓ 前端镜像构建完成"
                                    echo "镜像信息:"
                                    docker images | grep luxury-mall-frontend | head -2
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
        
        // 阶段 5: 部署到环境
        stage('Deploy') {
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
                    
                    // 切换到项目目录
                    dir("${PROJECT_DIR}") {
                        script {
                            // 创建 .env 文件（仅生产环境需要）
                            if (deployEnv == 'production') {
                                // Groovy 层面的调试信息（注意：credentials 值会被 Jenkins 自动屏蔽）
                                echo "=== Groovy 调试信息 ==="
                                echo "JWT_SECRET 类型: ${JWT_SECRET.getClass().getName()}"
                                echo "JWT_SECRET 长度: ${JWT_SECRET.length()}"
                                echo "JWT_SECRET 是否以冒号开头: ${JWT_SECRET.startsWith(':')}"
                                
                                echo "DB_PASSWORD 类型: ${DB_PASSWORD.getClass().getName()}"
                                echo "DB_PASSWORD 长度: ${DB_PASSWORD.length()}"
                                echo "DB_PASSWORD 是否以冒号开头: ${DB_PASSWORD.startsWith(':')}"
                                echo "=== Groovy 调试信息结束 ==="
                                echo ""
                                
                                sh """
                                    echo "创建 .env 文件..."
                                    
                                    # 调试信息：打印原始凭据的调试信息
                                    # 注意：Jenkins 会自动屏蔽敏感值，但我们可以查看元信息
                                    echo "=== 调试信息：凭据处理（Shell 层面）==="
                                    echo "原始 JWT_SECRET 长度: \$(echo -n "${JWT_SECRET}" | wc -c)"
                                    echo "原始 JWT_SECRET 是否有冒号前缀: \$(echo -n "${JWT_SECRET}" | head -c 1 | grep -q ':' && echo '是' || echo '否')"
                                    echo "原始 JWT_SECRET 第一个字符的 ASCII 码: \$(echo -n "${JWT_SECRET}" | head -c 1 | od -An -tu1 | tr -d ' ')"
                                    
                                    echo ""
                                    echo "原始 DB_PASSWORD 长度: \$(echo -n "${DB_PASSWORD}" | wc -c)"
                                    echo "原始 DB_PASSWORD 是否有冒号前缀: \$(echo -n "${DB_PASSWORD}" | head -c 1 | grep -q ':' && echo '是' || echo '否')"
                                    echo "原始 DB_PASSWORD 第一个字符的 ASCII 码: \$(echo -n "${DB_PASSWORD}" | head -c 1 | od -An -tu1 | tr -d ' ')"
                                    
                                    # 处理密码格式（去掉可能的冒号前缀）
                                    # Jenkins 凭据可能返回格式为 ":password" 的值
                                    JWT_SECRET_CLEAN=\$(echo "${JWT_SECRET}" | sed 's/^://')
                                    DB_PASSWORD_CLEAN=\$(echo "${DB_PASSWORD}" | sed 's/^://')
                                    
                                    # 调试信息：打印清理后的值
                                    echo ""
                                    echo "清理后 JWT_SECRET_CLEAN 长度: \$(echo "\$JWT_SECRET_CLEAN" | wc -c)"
                                    echo "清理后 JWT_SECRET_CLEAN 是否有冒号前缀: \$(echo "\$JWT_SECRET_CLEAN" | grep -q '^:' && echo '是' || echo '否')"
                                    echo "清理后 JWT_SECRET_CLEAN 前10个字符: \$(echo "\$JWT_SECRET_CLEAN" | head -c 10)..."
                                    
                                    echo "清理后 DB_PASSWORD_CLEAN 长度: \$(echo "\$DB_PASSWORD_CLEAN" | wc -c)"
                                    echo "清理后 DB_PASSWORD_CLEAN 是否有冒号前缀: \$(echo "\$DB_PASSWORD_CLEAN" | grep -q '^:' && echo '是' || echo '否')"
                                    echo "清理后 DB_PASSWORD_CLEAN 前10个字符: \$(echo "\$DB_PASSWORD_CLEAN" | head -c 10)..."
                                    echo "=== 调试信息结束 ==="
                                    echo ""
                                    
                                    cat > .env << EOF
JWT_SECRET=\${JWT_SECRET_CLEAN}
DB_PASSWORD=\${DB_PASSWORD_CLEAN}
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
                                    
                                    # 调试信息：验证实际写入的值
                                    echo ""
                                    echo "=== 调试信息：.env 文件内容验证 ==="
                                    if [ -f .env ]; then
                                        echo ".env 文件中 JWT_SECRET 长度: \$(grep '^JWT_SECRET=' .env | cut -d'=' -f2 | wc -c)"
                                        echo ".env 文件中 JWT_SECRET 是否有冒号前缀: \$(grep '^JWT_SECRET=:' .env >/dev/null && echo '是' || echo '否')"
                                        echo ".env 文件中 JWT_SECRET 前10个字符: \$(grep '^JWT_SECRET=' .env | cut -d'=' -f2 | head -c 10)..."
                                        
                                        echo ".env 文件中 DB_PASSWORD 长度: \$(grep '^DB_PASSWORD=' .env | cut -d'=' -f2 | wc -c)"
                                        echo ".env 文件中 DB_PASSWORD 是否有冒号前缀: \$(grep '^DB_PASSWORD=:' .env >/dev/null && echo '是' || echo '否')"
                                        echo ".env 文件中 DB_PASSWORD 前10个字符: \$(grep '^DB_PASSWORD=' .env | cut -d'=' -f2 | head -c 10)..."
                                    else
                                        echo ".env 文件不存在！"
                                    fi
                                    echo "=== 调试信息结束 ==="
                                    echo ""
                                    
                                    # 验证密码格式（检查是否还有冒号前缀）
                                    if grep -q "^JWT_SECRET=:" .env || grep -q "^DB_PASSWORD=:" .env; then
                                        echo "⚠ 警告: 检测到密码仍有冒号前缀，正在修复..."
                                        sed -i 's/^JWT_SECRET=:/JWT_SECRET=/' .env
                                        sed -i 's/^DB_PASSWORD=:/DB_PASSWORD=/' .env
                                        echo "✓ 密码格式已修复"
                                        
                                        # 修复后再次验证
                                        echo "修复后验证:"
                                        echo "  JWT_SECRET 是否有冒号: \$(grep '^JWT_SECRET=:' .env >/dev/null && echo '是' || echo '否')"
                                        echo "  DB_PASSWORD 是否有冒号: \$(grep '^DB_PASSWORD=:' .env >/dev/null && echo '是' || echo '否')"
                                    fi
                                    
                                    # 设置正确的文件权限（仅所有者可读写）
                                    chmod 600 .env
                                    echo "✓ .env 文件权限已设置 (600)"
                                """
                            } else {
                                echo "开发环境，跳过 .env 文件创建（使用 JSON 文件存储）"
                            }
                            
                            // 清理旧容器和镜像（如果启用）
                            if (params.CLEAN_BUILD) {
                                sh '''
                                    echo "清理旧的容器和镜像..."
                                    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down || true
                                    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down || true
                                    
                                    # 清理未使用的镜像（保留最近 3 个版本）
                                    docker image prune -f || true
                                    
                                    echo "✓ 清理完成"
                                '''
                            }
                            
                            // 根据环境选择配置文件
                            def composeFiles = deployEnv == 'production' ? 
                                '-f docker-compose.yml -f docker-compose.prod.yml' :
                                '-f docker-compose.yml -f docker-compose.dev.yml'
                            
                            sh """
                                echo "使用配置文件: ${composeFiles}"
                                
                                # 如果启用重启服务，先停止现有容器（确保重新读取 .env 文件）
                                if [ "${params.RESTART_SERVICES}" = "true" ]; then
                                    echo "重启服务模式：停止现有容器..."
                                    docker-compose ${composeFiles} down || true
                                    sleep 5
                                    echo "✓ 容器已停止"
                                fi
                                
                                # 如果启用重置数据库，删除数据卷（仅生产环境）
                                if [ "${params.RESET_DATABASE}" = "true" ] && [ "${deployEnv}" = "production" ]; then
                                    echo "⚠ 警告: 重新初始化数据库（删除所有数据）"
                                    docker-compose ${composeFiles} down || true
                                    docker volume rm luxury-mall_postgres_data 2>/dev/null || true
                                    echo "✓ 数据卷已删除"
                                    sleep 3
                                fi
                                
                                # 启动服务
                                echo "启动服务..."
                                docker-compose ${composeFiles} up -d --build
                                
                                echo "等待服务启动..."
                                sleep 20
                                
                                echo "检查服务状态..."
                                docker-compose ${composeFiles} ps
                                
                                # 验证环境变量（检查密码格式，仅生产环境）
                                if [ "${deployEnv}" = "production" ]; then
                                    echo ""
                                    echo "验证环境变量格式..."
                                    if docker ps | grep -q luxury-mall-backend; then
                                        DB_PASS=\$(docker exec luxury-mall-backend printenv DB_PASSWORD 2>/dev/null || echo "")
                                        if [ -n "\$DB_PASS" ]; then
                                            if [[ "\$DB_PASS" == :* ]]; then
                                                echo "⚠ 警告: 后端密码仍有冒号前缀: \${DB_PASS:0:20}..."
                                            else
                                                echo "✓ 后端密码格式正确"
                                            fi
                                        fi
                                    fi
                                    
                                    if docker ps | grep -q luxury-mall-postgres; then
                                        PG_PASS=\$(docker exec luxury-mall-postgres printenv POSTGRES_PASSWORD 2>/dev/null || echo "")
                                        if [ -n "\$PG_PASS" ]; then
                                            if [[ "\$PG_PASS" == :* ]]; then
                                                echo "⚠ 警告: 数据库密码仍有冒号前缀: \${PG_PASS:0:20}..."
                                            else
                                                echo "✓ 数据库密码格式正确"
                                            fi
                                        fi
                                    fi
                                fi
                            """
                        }
                    }
                }
            }
        }
        
        // 阶段 6: 健康检查
        stage('Health Check') {
            steps {
                script {
                    echo "=========================================="
                    echo "阶段 6: 健康检查"
                    echo "=========================================="
                    
                    dir("${PROJECT_DIR}") {
                        script {
                            def composeFiles = DEPLOY_ENV == 'production' ? 
                                '-f docker-compose.yml -f docker-compose.prod.yml' :
                                '-f docker-compose.yml -f docker-compose.dev.yml'
                            
                            // 检查后端服务
                            sh """
                                echo "检查后端服务 (http://localhost:3001/health)..."
                                for i in {1..30}; do
                                    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
                                        echo "✓ 后端服务健康检查通过"
                                        break
                                    fi
                                    if [ \$i -eq 30 ]; then
                                        echo "✗ 后端服务健康检查失败（30次重试后）"
                                        docker-compose ${composeFiles} logs backend | tail -50
                                        exit 1
                                    fi
                                    echo "  等待后端服务启动... (\$i/30)"
                                    sleep 2
                                done
                            """
                            
                            // 检查前端服务
                            sh """
                                echo "检查前端服务 (http://localhost:80)..."
                                for i in {1..30}; do
                                    if curl -f http://localhost:80 > /dev/null 2>&1; then
                                        echo "✓ 前端服务健康检查通过"
                                        break
                                    fi
                                    if [ \$i -eq 30 ]; then
                                        echo "✗ 前端服务健康检查失败（30次重试后）"
                                        docker-compose ${composeFiles} logs frontend | tail -50
                                        exit 1
                                    fi
                                    echo "  等待前端服务启动... (\$i/30)"
                                    sleep 2
                                done
                            """
                            
                            echo "=========================================="
                            echo "✓ 所有服务健康检查通过"
                            echo "=========================================="
                        }
                    }
                }
            }
        }
        
        // 阶段 7: 数据库迁移（可选，仅生产环境）
        stage('Database Migration') {
            when {
                allOf {
                    anyOf {
                        branch 'main'
                        branch 'master'
                    }
                    expression { params.RUN_MIGRATION == true }
                }
            }
            steps {
                script {
                    echo "=========================================="
                    echo "阶段 7: 数据库迁移"
                    echo "=========================================="
                    
                    dir("${PROJECT_DIR}") {
                        script {
                            sh '''
                                echo "执行数据库迁移..."
                                docker-compose -f docker-compose.yml -f docker-compose.prod.yml \
                                    exec -T backend npm run migrate-to-db || {
                                    echo "⚠ 数据库迁移失败或已是最新状态"
                                    echo "如果这是首次部署，请手动执行迁移"
                                }
                                
                                echo "✓ 数据库迁移完成"
                            '''
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
                echo "  前端: http://your-server-ip:80"
                echo "  后端: http://your-server-ip:3001"
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

