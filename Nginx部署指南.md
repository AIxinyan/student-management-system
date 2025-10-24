# 🚀 学生信息管理系统 - Nginx 部署指南

## 📋 部署概述

本指南将帮助您使用 Nginx 部署学生信息管理系统。系统采用前后端分离架构，前端为静态 HTML/CSS/JS 文件，后端为 Node.js API 服务。

## 🏗️ 部署架构

```
┌─────────────────┐    ┌──────────────────┐
│   浏览器访问     │    │   Nginx 服务器    │
│  http://domain   │───▶│  端口: 80/443    │
└─────────────────┘    └──────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│ 静态文件服务 │      │ API 反向代理  │      │ 后端 Node.js  │
│   前端页面   │      │  /api/* 路径   │─────▶│   服务        │
│  HTML/CSS/JS │      │              │      │  端口: 3000   │
└─────────────┘      └──────────────┘      └──────────────┘
```

## 🛠️ 部署步骤

### 步骤 1: 安装依赖服务

#### 1.1 安装 Node.js
- 访问 https://nodejs.org/
- 下载并安装 LTS 版本
- 验证安装：
```bash
node --version
npm --version
```

#### 1.2 安装 MongoDB
- 访问 https://www.mongodb.com/try/download/community
- 下载并安装适合您操作系统的版本
- 启动 MongoDB 服务

#### 1.3 安装 Nginx（可选）
- Windows: http://nginx.org/en/download.html
- Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install nginx
```

### 步骤 2: 配置后端服务

#### 2.1 安装后端依赖
```bash
cd backend
npm install
```

#### 2.2 配置环境变量
```bash
# 复制示例配置文件
cp .env.example .env

# 编辑 .env 文件（如有需要）
vim .env
```

#### 2.3 启动后端服务
```bash
cd backend
npm start
# 或使用开发模式（自动重启）
npm run dev
```

验证后端服务是否运行：
```bash
curl http://localhost:3000/api/health
```

### 步骤 3: 配置 Nginx

#### 3.1 复制配置文件
将项目中的 `nginx.conf` 复制到 Nginx 配置目录：

**Windows:**
```bash
# 假设 Nginx 安装在 C:\nginx
cp nginx.conf C:\nginx\conf\
```

**Linux:**
```bash
sudo cp nginx.conf /etc/nginx/sites-available/student-management.conf
sudo ln -s /etc/nginx/sites-available/student-management.conf /etc/nginx/sites-enabled/
```

#### 3.2 修改路径配置
编辑 Nginx 配置文件，确保路径正确：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 修改为您的域名

    # 前端静态资源
    location / {
        root /path/to/your/project/frontend;  # 修改为实际路径
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        # ... 其他代理配置
    }
}
```

#### 3.3 重启 Nginx
**Windows:**
```bash
# 在 Nginx 安装目录下执行
nginx.exe -s reload
```

**Linux:**
```bash
sudo nginx -s reload
# 或
sudo systemctl reload nginx
```

### 步骤 4: 验证部署

#### 4.1 访问前端页面
打开浏览器访问：
```
http://your-domain.com
```

#### 4.2 测试 API 接口
```bash
# 健康检查
curl http://your-domain.com/api/health

# 获取学生列表
curl http://your-domain.com/api/students
```

## 🔧 开发模式部署

如果您只是想在本地测试，可以使用简单的 HTTP 服务器：

### 使用 Node.js 简单服务器
```bash
# 安装依赖
npm install express

# 启动服务器
node simple-server.js
```

访问地址：http://localhost:8000

### 使用 Python 简单服务器（如果已安装 Python）
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

## 🔒 生产环境建议

### 1. 启用 HTTPS
使用 Let's Encrypt 获取免费 SSL 证书：
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 2. 配置防火墙
```bash
# Ubuntu/Debian
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

### 3. 设置开机自启
**后端服务:**
创建 systemd 服务文件 `/etc/systemd/system/student-backend.service`：
```ini
[Unit]
Description=Student Management Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/project/backend
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

启用服务：
```bash
sudo systemctl enable student-backend
sudo systemctl start student-backend
```

**Nginx:**
```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4. 日志监控
配置日志轮转和监控：
```bash
# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 查看后端日志
sudo journalctl -u student-backend -f
```

## 📊 性能优化

### 1. Nginx 缓存配置
```nginx
# 静态文件缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. Gzip 压缩
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 3. 连接优化
```nginx
worker_processes auto;
worker_connections 1024;
```

## 🛡️ 安全配置

### 1. 隐藏版本信息
```nginx
server_tokens off;
```

### 2. 防止恶意访问
```nginx
# 防止访问隐藏文件
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}

# 限制请求频率
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
location /api/ {
    limit_req zone=api burst=20 nodelay;
}
```

## 🔄 故障排除

### 常见问题

#### 1. 404 错误
- 检查 Nginx 配置中的路径是否正确
- 确认前端文件是否存在
- 检查 `try_files` 配置

#### 2. 502 错误
- 检查后端服务是否运行
- 确认 `proxy_pass` 地址是否正确
- 检查防火墙设置

#### 3. CORS 错误
- 确保 Nginx 正确代理 API 请求
- 检查后端 CORS 配置

#### 4. 静态文件加载缓慢
- 检查服务器性能
- 启用 Gzip 压缩
- 配置 CDN（如需要）

### 日志查看
```bash
# Nginx 访问日志
tail -f /var/log/nginx/access.log

# Nginx 错误日志
tail -f /var/log/nginx/error.log

# 后端服务日志
journalctl -u student-backend -f
```

## 📈 监控和维护

### 1. 健康检查
定期检查服务状态：
```bash
# 检查后端
curl -f http://localhost:3000/api/health || echo "Backend down"

# 检查 Nginx
systemctl is-active nginx || echo "Nginx down"
```

### 2. 备份策略
```bash
# 备份 MongoDB
mongodump --db student_management --out /backup/path

# 备份代码
tar -czf backup-$(date +%Y%m%d).tar.gz /path/to/project
```

### 3. 更新部署
```bash
# 拉取最新代码
git pull origin main

# 重启服务
sudo systemctl restart student-backend
sudo nginx -s reload
```

## 🎯 部署验证清单

- [ ] Node.js 和 MongoDB 已安装并运行
- [ ] 后端服务正常启动
- [ ] Nginx 已安装并配置
- [ ] 前端静态文件路径正确
- [ ] API 反向代理配置正确
- [ ] 可以正常访问首页
- [ ] 可以正常访问登录页面
- [ ] API 接口可以正常调用
- [ ] HTTPS 配置（生产环境）
- [ ] 开机自启配置（生产环境）
- [ ] 日志监控配置（生产环境）

---

## 📞 技术支持

如遇到部署问题，请检查：
1. 所有服务是否正常运行
2. 配置文件路径是否正确
3. 端口是否被占用
4. 防火墙设置是否正确
5. 日志中是否有错误信息

---

© 2025 学生信息管理系统 - Nginx 部署指南