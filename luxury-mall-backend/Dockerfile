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

# 处理 schema.sql：如果是目录则删除，然后检查文件是否存在
RUN echo "=== Processing schema.sql ===" && \
    if [ -d src/database/schema.sql ]; then \
      echo "WARNING: src/database/schema.sql is a directory, removing..." && \
      rm -rf src/database/schema.sql; \
    fi && \
    if [ ! -f src/database/schema.sql ]; then \
      echo "" && \
      echo "========================================" && \
      echo "ERROR: src/database/schema.sql file does not exist!" && \
      echo "========================================" && \
      echo "" && \
      echo "Please fix this on the server before building:" && \
      echo "1. Remove the directory: rm -rf /opt/luxury-mall/luxury-mall/luxury-mall-backend/src/database/schema.sql" && \
      echo "2. Upload the file from local:" && \
      echo "   scp F:\\CODE\\luxury-mall-backend\\src\\database\\schema.sql ubuntu@server:/opt/luxury-mall/luxury-mall/luxury-mall-backend/src/database/" && \
      echo "3. Verify: ls -lh /opt/luxury-mall/luxury-mall/luxury-mall-backend/src/database/schema.sql" && \
      echo "" && \
      exit 1; \
    else \
      echo "OK: src/database/schema.sql is a valid file" && \
      ls -lh src/database/schema.sql && \
      head -3 src/database/schema.sql; \
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


