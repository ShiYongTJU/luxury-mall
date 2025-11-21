# 后端 Dockerfile
# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包括 devDependencies，用于构建）
RUN npm ci

# 先复制除了可能有问题文件之外的所有文件
COPY . .

# 清理可能存在的 schema.sql 目录（如果存在）
RUN if [ -d src/database/schema.sql ]; then \
      echo "⚠ 发现 schema.sql 是目录，正在删除..." && \
      rm -rf src/database/schema.sql; \
    fi

# 显式复制 schema.sql 文件（如果源文件存在）
# 使用 --parents 确保目录结构正确
COPY --chmod=644 src/database/schema.sql src/database/schema.sql 2>/dev/null || \
  (echo "⚠ 警告: 无法从构建上下文复制 schema.sql，将在构建时创建" && \
   echo "检查构建上下文中的文件:" && \
   find . -name "schema.sql" -o -name "*.sql" | head -10)

# 验证 schema.sql 文件
RUN echo "=== 验证 schema.sql 文件 ===" && \
    if [ -f src/database/schema.sql ]; then \
      echo "✓ src/database/schema.sql 文件存在" && \
      ls -lh src/database/schema.sql && \
      file src/database/schema.sql; \
    else \
      echo "✗ 错误: src/database/schema.sql 文件不存在" && \
      echo "src/database/ 目录内容:" && \
      ls -la src/database/ 2>&1 && \
      echo "查找所有 .sql 文件:" && \
      find . -name "*.sql" -type f 2>/dev/null | head -10 && \
      exit 1; \
    fi

# 构建 TypeScript
RUN npm run build

# 确保 dist/database 目录存在，并复制 schema.sql 到 dist 目录，供迁移脚本使用
RUN mkdir -p dist/database && \
    cp src/database/schema.sql dist/database/schema.sql && \
    echo "✓ schema.sql 已复制到 dist/database/" && \
    ls -lh dist/database/schema.sql

# 删除 devDependencies 以减小镜像大小
RUN npm prune --production

# 验证文件在最终镜像中仍然存在
RUN ls -lh dist/database/schema.sql || (echo "✗ 错误: dist/database/schema.sql 在最终镜像中不存在" && exit 1)

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["npm", "start"]


