# 后端 Dockerfile
# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包括 devDependencies，用于构建）
RUN npm ci

# 先复制所有文件
COPY . .

# 处理 schema.sql：删除目录（如果存在），然后从构建上下文显式复制文件
# 如果构建上下文中没有文件，则从 Git 仓库获取
RUN echo "=== Processing schema.sql ===" && \
    if [ -d src/database/schema.sql ]; then \
      echo "WARNING: src/database/schema.sql is a directory, removing..." && \
      rm -rf src/database/schema.sql; \
    fi && \
    if [ ! -f src/database/schema.sql ]; then \
      echo "WARNING: schema.sql file not found in build context" && \
      echo "Attempting to get from Git..." && \
      if command -v git >/dev/null 2>&1 && [ -d .git ]; then \
        git show HEAD:src/database/schema.sql > src/database/schema.sql 2>/dev/null || true; \
      fi && \
      if [ ! -f src/database/schema.sql ]; then \
        echo "ERROR: schema.sql file does not exist and cannot be retrieved from Git" && \
        echo "Please ensure the file exists in the build context" && \
        exit 1; \
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

# 复制 scripts 目录到 dist（用于数据库初始化脚本）
RUN mkdir -p dist/scripts && \
    if [ -d scripts ]; then \
      cp -r scripts/* dist/scripts/ 2>/dev/null || true; \
    fi

# 删除 devDependencies 以减小镜像大小
# 但保留 ts-node 和 typescript（用于运行初始化脚本）
RUN npm prune --production && \
    npm install --save-dev ts-node typescript @types/node || true

# 验证文件在最终镜像中仍然存在
RUN ls -lh dist/database/schema.sql || (echo "ERROR: dist/database/schema.sql does not exist in final image" && exit 1)

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["npm", "start"]
