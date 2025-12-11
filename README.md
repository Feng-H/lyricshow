# 双语赞美诗网站 | Bilingual Praise Songs Website

一个现代化的中英文双语赞美诗歌词查询网站，支持全文搜索、拼音检索和移动端优化。

[English](#features--features) | [中文](#特性--features)

## 特性 | Features

- 🌟 **双语歌词** - 中英文歌词切换显示
- 🔍 **智能搜索** - 支持中文拼音搜索和全文检索
- 📱 **移动优化** - 完全适配手机和平板设备
- 🐳 **Docker部署** - 一键部署，支持容器化（Standalone Mode）
- 🌙 **深色模式** - 保护眼睛的明暗主题切换
- 📄 **打印友好** - 优化的打印样式
- 📲 **PWA支持** - 可安装到主屏幕
- 🔐 **管理员功能** - 安全的管理员登录，支持在线上传、删除和切换JSON数据文件
- 💾 **数据持久化** - 数据文件保存在服务器本地，重启不丢失
- ⚙️ **动态配置** - 支持动态切换当前使用的歌词数据文件

## 技术栈 | Tech Stack

- **框架**: Next.js 14 with App Router
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **部署**: Docker & Nginx (Node.js Server)
- **搜索**: Fuse.js + Custom Pinyin Matching

## 快速开始 | Quick Start

### 使用 Docker (推荐) | Using Docker (Recommended)

1. 克隆项目
```bash
git clone https://github.com/Feng-H/lyricshow.git
cd PraiseSongLyric/website
```

2. 构建并运行
```bash
docker-compose up -d
```

3. 访问网站
- 前台: `http://localhost:9090`
- 后台: `http://localhost:9090/admin`

### 本地开发 | Local Development

1. 安装依赖
```bash
npm install
```

2. 数据文件准备
项目默认会在 `public/data/` 目录下查找 `praisesongs_data.json` 或 `config.json` 指定的文件。
开发环境下，你可以手动放入一个 JSON 文件到 `public/data/`。

3. 启动开发服务器
```bash
npm run dev
```

4. 访问开发环境
```
http://localhost:3000
```

## 管理员功能 | Admin Features

访问 `/admin` 页面进行数据管理。

### 环境变量配置
在 `docker-compose.yml` 或环境变量中配置：
- `ADMIN_USERNAME`: 自定义管理员用户名
- `ADMIN_PASSWORD`: 自定义管理员密码（明文）
- `ADMIN_PASSWORD_HASH`: 自定义管理员密码（Bcrypt Hash，更安全）
- `JWT_SECRET`: 用于生成 Session Token 的密钥

### 数据管理
管理员可以：
1. **上传文件**: 上传新的赞美诗数据 JSON 文件。
2. **切换数据源**: 在已上传的文件列表中，点击 "Set Active" 将其设为网站当前使用的数据源。
3. **删除文件**: 删除不再使用的历史文件（无法删除当前正在使用的文件）。

## 构建部署 | Build & Deploy

### 手动构建
```bash
npm run build
npm start
```

### Docker 生产环境部署

```bash
# 构建镜像
docker build -t bilingual-praise-songs .

# 运行容器
# 注意：必须挂载 /app/public/data 目录以持久化数据和配置
docker run -p 9090:9090 \
  -v $(pwd)/data:/app/public/data \
  -e ADMIN_USERNAME=your_username \
  -e ADMIN_PASSWORD=your_password \
  bilingual-praise-songs
```

## 搜索功能 | Search Features

- **标题搜索**: 搜索歌名
- **歌词搜索**: 在歌词内容中搜索
- **拼音搜索**: 输入拼音查找中文歌曲 (如 "wuren" -> "无人能像你")
- **编号导航**: 直接输入歌曲编号跳转

## 贡献 | Contributing

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证 | License

本项目仅用于敬拜用途，请勿用于商业目的。

## 联系 | Contact

如有问题或建议，请提交 Issue: [https://github.com/Feng-H/lyricshow/issues](https://github.com/Feng-H/lyricshow/issues)

## Git 仓库说明 | Git Repository Notes

### .gitignore 说明
- 忽略所有数据文件 (`/data/`, `/public/data/`) 以防止私有或测试数据上传
- 忽略 `GEMINI.md` (AI 上下文文件)
- `.gitkeep` 文件确保空目录被 Git 跟踪

## 常见问题排查 | Troubleshooting

### Docker 部署后无法上传或切换文件 (Permission Denied)

如果遇到 "Upload failed" 或无法切换数据文件的问题，通常是因为 Docker 容器内的用户 (UID 1001) 没有主机 `./data` 目录的写入权限。

**解决方法：**

在主机上运行以下命令，赋予 `data` 目录写入权限：

```bash
chmod -R 777 data
```

或者，更改目录所有者为 UID 1001 (Docker 容器内的 nextjs 用户)：

```bash
sudo chown -R 1001:1001 data
```
