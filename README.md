# 学生信息管理系统

AI 辅助的学生信息管理系统 - 基于 Node.js + MongoDB + Express 开发

## 项目简介

这是一个功能完整的学生信息管理系统，支持学生信息的增删改查、按条件筛选，并提供 AI 辅助的成绩分析报告功能。

## 主要功能

- ✅ 学生信息录入（姓名、学号、班级、成绩）
- ✅ 学生信息查询、修改、删除
- ✅ 按班级/成绩筛选学生
- ✅ AI 辅助生成成绩分析报告
  - 整体统计（平均分、最高分、最低分）
  - 成绩分布分析
  - 班级对比分析
  - 成绩排名
  - 智能改进建议

## 技术栈

- **前端**: HTML5 + CSS3 + JavaScript (原生)
- **后端**: Node.js + Express
- **数据库**: MongoDB + Mongoose
- **部署**: Nginx
- **版本控制**: Git

## 快速开始

### 1. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install
```

### 2. 启动 MongoDB

```bash
# Windows
mongod --dbpath C:\data\db

# Linux/Mac
mongod --dbpath /data/db
```

### 3. 启动后端服务

```bash
cd backend
npm start
```

### 4. 访问应用

**方式一：使用 Nginx（推荐）**
- 配置 Nginx（参考 nginx.conf）
- 访问 http://localhost

**方式二：直接访问前端**
- 打开 frontend/index.html

## 详细文档

- [需求拆解文档](需求拆解文档.md) - 详细的功能模块和接口设计
- [部署指南](部署指南.md) - 完整的部署和配置说明

## API 接口

### 学生管理接口

- `POST /api/students` - 创建学生信息
- `GET /api/students` - 获取所有学生
- `GET /api/students/:id` - 获取单个学生
- `PUT /api/students/:id` - 更新学生信息
- `DELETE /api/students/:id` - 删除学生信息
- `GET /api/students/filter/search` - 筛选学生

### AI 分析接口

- `GET /api/students/analysis/report` - 生成 AI 分析报告

## 项目结构

```
student-management-system/
├── backend/                 # 后端代码
│   ├── server.js           # 主服务器文件
│   ├── package.json        # 依赖配置
│   └── .env.example        # 环境变量示例
├── frontend/               # 前端代码
│   ├── index.html          # 主页面
│   ├── styles.css          # 样式文件
│   └── app.js              # 前端逻辑
├── nginx.conf              # Nginx 配置
├── 需求拆解文档.md          # 需求文档
├── 部署指南.md              # 部署说明
└── README.md               # 本文档
```

## 开发规范

### Git 工作流

1. 主分支：`main`
2. 功能分支：
   - `feature/frontend` - 前端开发
   - `feature/backend` - 后端开发
   - `feature/ai-function` - AI 功能开发

### 提交规范

```bash
git commit -m "feat: 添加学生信息查询功能"
git commit -m "fix: 修复成绩验证问题"
git commit -m "docs: 更新部署文档"
```

## 常见问题

### 1. MongoDB 连接失败

确保 MongoDB 服务已启动：
```bash
mongod --version
```

### 2. CORS 错误

使用 Nginx 部署前端，或使用 HTTP 服务器而非直接打开文件。

### 3. 端口被占用

修改 backend/.env 文件中的 PORT 配置。

## 测试数据

可以使用以下测试数据：

```javascript
{
  "name": "张三",
  "studentId": "2024001",
  "class": "一班",
  "score": 95
}
```

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License

## 作者

学生信息管理系统开发团队

## 更新日志

### v1.0.0 (2025-10-22)
- ✅ 完成基础 CRUD 功能
- ✅ 实现筛选功能
- ✅ 添加 AI 分析报告
- ✅ 完成 Nginx 部署配置
