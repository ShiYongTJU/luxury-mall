# 后端 Dockerfile
# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包括 devDependencies，用于构建）
RUN npm ci

# 复制所有文件（包括 tsconfig.json、src、data 等）
COPY . .

# 构建 TypeScript
RUN npm run build

# 确保 dist/database 目录存在，并复制 schema.sql 到 dist 目录，供迁移脚本使用
# 使用显式检查，确保复制成功
RUN mkdir -p dist/database && \
    if [ -f src/database/schema.sql ]; then \
      cp src/database/schema.sql dist/database/schema.sql && \
      echo "✓ schema.sql 已复制到 dist/database/" && \
      ls -lh dist/database/schema.sql; \
    else \
      echo "✗ 错误: src/database/schema.sql 不存在" && \
      ls -la src/database/ && \
      exit 1; \
    fi

# 删除 devDependencies 以减小镜像大小
RUN npm prune --production

# 验证文件在最终镜像中仍然存在
RUN ls -lh dist/database/schema.sql || (echo "✗ 错误: dist/database/schema.sql 在最终镜像中不存在" && exit 1)

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["npm", "start"]


