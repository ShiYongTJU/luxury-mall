#!/bin/bash
# 在服务器上执行图片导入脚本
# 使用方法: bash import-unsplash-images-server.sh

set -e

echo "=========================================="
echo "开始导入 Unsplash 图片数据到数据库"
echo "=========================================="

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# 检查 JSON 文件是否存在
if [ ! -f "scripts/unsplash-images.json" ]; then
    echo "错误: 找不到 unsplash-images.json 文件"
    echo "请确保文件存在于: scripts/unsplash-images.json"
    exit 1
fi

echo "找到图片数据文件: scripts/unsplash-images.json"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "Node.js 版本: $(node --version)"
echo ""

# 检查是否在 Docker 容器中
if [ -f "/.dockerenv" ] || [ -n "$DOCKER_CONTAINER" ]; then
    echo "检测到 Docker 环境"
    # 在容器中执行
    if [ -f "package.json" ]; then
        echo "执行: npm run import-unsplash-images"
        npm run import-unsplash-images
    else
        echo "执行: node dist/scripts/import-unsplash-images.js"
        node dist/scripts/import-unsplash-images.js
    fi
else
    echo "检测到本地环境"
    # 检查是否有 node_modules
    if [ ! -d "node_modules" ]; then
        echo "安装依赖..."
        npm install
    fi
    
    # 执行导入
    echo "执行: npm run import-unsplash-images"
    npm run import-unsplash-images
fi

echo ""
echo "=========================================="
echo "导入完成"
echo "=========================================="

