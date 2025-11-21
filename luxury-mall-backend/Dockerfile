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

# 清理可能存在的 schema.sql 目录（如果存在）
RUN if [ -d src/database/schema.sql ]; then \
      echo "WARNING: schema.sql is a directory, removing..." && \
      rm -rf src/database/schema.sql; \
    fi

# 显式复制 schema.sql 文件（确保文件被包含）
COPY src/database/schema.sql src/database/schema.sql

# 验证 schema.sql 文件
RUN echo "=== Verifying schema.sql file ===" && \
    if [ -f src/database/schema.sql ]; then \
      echo "OK: src/database/schema.sql exists" && \
      ls -lh src/database/schema.sql && \
      head -5 src/database/schema.sql; \
    else \
      echo "ERROR: src/database/schema.sql does not exist after COPY" && \
      echo "Contents of src/database/:" && \
      ls -la src/database/ 2>&1 && \
      echo "Searching for .sql files in build context:" && \
      find . -name "*.sql" -type f 2>/dev/null | head -10 && \
      exit 1; \
    fi

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


