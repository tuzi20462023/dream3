#!/bin/bash

# 梦境应用一键启动脚本
# 双击此文件即可启动

echo "🌙 正在启动梦境应用..."
echo ""

# 进入项目目录
cd "$(dirname "$0")"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null
then
    echo "❌ 未检测到 Node.js，请先安装 Node.js"
    echo "访问：https://nodejs.org/"
    read -p "按回车键退出..."
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    echo ""
fi

# 启动开发服务器
echo "✨ 启动服务器..."
echo ""
echo "======================================"
echo "🌐 应用地址："
echo "   主应用：http://localhost:3000/"
echo "   清理工具：http://localhost:3000/clear-storage.html"
echo "======================================"
echo ""
echo "💡 使用提示："
echo "   1. 浏览器会自动打开主应用"
echo "   2. 按 Ctrl+C 可以停止服务器"
echo "   3. 关闭这个窗口也会停止服务器"
echo ""

# 启动 vite
npm run dev

# 如果服务器停止
echo ""
echo "🛑 服务器已停止"
read -p "按回车键退出..."
