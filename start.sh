#!/bin/bash

echo "=== 双语赞美诗网站启动脚本 | Bilingual Praise Songs Website Start Script ==="
echo

# 检查是否安装了Docker
if ! command -v docker &> /dev/null; then
    echo "错误 | Error: Docker 未安装 | Please install Docker first"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "错误 | Error: Docker Compose 未安装 | Please install Docker Compose first"
    exit 1
fi

# 创建数据目录 | Create data directory
mkdir -p data

# 检查并复制初始数据文件
if [ ! -f "data/praisesongs_data.json" ] && [ -f "../praisesongs_data.json" ]; then
    echo "正在复制初始数据文件 | Copying initial data file..."
    cp ../praisesongs_data.json data/
fi

# 提示用户可以上传新文件
echo "数据目录已创建 | Data directory created: ./data"
echo "您可以通过管理员界面上传新的JSON文件 | You can upload new JSON files via admin interface"

# 停止现有容器
echo "停止现有容器 | Stopping existing containers..."
docker-compose down 2>/dev/null

# 构建并启动
echo "构建并启动网站 | Building and starting website..."
docker-compose up -d --build

# 等待启动
echo "等待网站启动 | Waiting for website to start..."
sleep 10

# 检查状态
if docker-compose ps | grep -q "Up"; then
    echo
    echo "✅ 网站启动成功！| Website started successfully!"
    echo
    echo "服务地址 | Service URL:"
    echo "  http://localhost:9090"
    echo
    echo "Nginx 配置示例 | Nginx Configuration Example:"
    echo "  server {"
    echo "      listen 80;"
    echo "      server_name your-domain.com;"
    echo "      location / {"
    echo "          proxy_pass http://localhost:9090;"
    echo "          proxy_http_version 1.1;"
    echo "          proxy_set_header Upgrade \$http_upgrade;"
    echo "          proxy_set_header Connection 'upgrade';"
    echo "          proxy_set_header Host \$host;"
    echo "          proxy_cache_bypass \$http_upgrade;"
    echo "      }"
    echo "  }"
    echo
    echo "管理命令 | Management Commands:"
    echo "  查看日志 | View logs:       docker-compose logs -f"
    echo "  停止网站 | Stop website:    docker-compose down"
    echo "  重启网站 | Restart:          docker-compose restart"
    echo
    echo "管理员功能 | Admin Features:"
    echo "  访问地址: http://localhost:9090/admin"
    echo "  用户名 | Username: huangfeng"
    echo "  密码 | Password: admin123"
    echo "  数据目录 | Data directory: ./data"
    echo
else
    echo
    echo "❌ 网站启动失败 | Website failed to start"
    echo "请查看错误日志 | Please check error logs:"
    echo "  docker-compose logs"
fi