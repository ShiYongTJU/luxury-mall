# 前端 Dockerfile
# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 设置 npm 镜像源（加速依赖安装）
RUN npm config set registry https://registry.npmmirror.com

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖（使用 npm ci 确保依赖版本一致）
# 设置 npm 缓存目录，利用 Docker 层缓存
RUN npm ci --prefer-offline --no-audit

# 复制源代码
COPY . .

# 构建应用（增加 Node.js 内存限制，优化构建速度）
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 生产环境镜像
FROM nginx:alpine

# 复制构建产物到 nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]


