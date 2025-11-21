# 后端 Dockerfile
# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包括 devDependencies，用于构建）
RUN npm ci

# 复制源代码
COPY . .

# 构建 TypeScript
RUN npm run build

# 删除 devDependencies 以减小镜像大小
RUN npm prune --production

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["npm", "start"]


