# 学生信息管理系统 - 快速启动脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  学生信息管理系统 - 环境检查" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js 未安装，请先安装 Node.js" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 检查 MongoDB
Write-Host "检查 MongoDB..." -ForegroundColor Yellow
try {
    $mongoVersion = mongod --version 2>&1 | Select-Object -First 1
    Write-Host "✅ MongoDB 已安装" -ForegroundColor Green
    Write-Host $mongoVersion
} catch {
    Write-Host "❌ MongoDB 未安装" -ForegroundColor Red
    Write-Host "请参考 'MongoDB安装指南.md' 进行安装" -ForegroundColor Yellow
    $installMongo = Read-Host "是否查看 MongoDB 安装指南？(Y/N)"
    if ($installMongo -eq 'Y' -or $installMongo -eq 'y') {
        notepad "MongoDB安装指南.md"
    }
    exit 1
}

# 检查 MongoDB 服务状态
Write-Host "检查 MongoDB 服务..." -ForegroundColor Yellow
try {
    $mongoService = Get-Service MongoDB -ErrorAction SilentlyContinue
    if ($mongoService) {
        if ($mongoService.Status -eq 'Running') {
            Write-Host "✅ MongoDB 服务正在运行" -ForegroundColor Green
        } else {
            Write-Host "⚠️  MongoDB 服务未运行，正在启动..." -ForegroundColor Yellow
            Start-Service MongoDB
            Start-Sleep -Seconds 2
            Write-Host "✅ MongoDB 服务已启动" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  MongoDB 未作为服务安装" -ForegroundColor Yellow
        Write-Host "您需要手动启动 MongoDB：mongod --dbpath C:\data\db" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  无法检查 MongoDB 服务状态" -ForegroundColor Yellow
}

# 检查后端依赖
Write-Host ""
Write-Host "检查后端依赖..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules") {
    Write-Host "✅ 后端依赖已安装" -ForegroundColor Green
} else {
    Write-Host "📦 后端依赖未安装，正在安装..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
    Write-Host "✅ 后端依赖安装完成" -ForegroundColor Green
}

# 检查环境配置文件
Write-Host ""
Write-Host "检查环境配置..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "✅ 环境配置文件存在" -ForegroundColor Green
} else {
    Write-Host "⚠️  环境配置文件不存在，正在创建..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✅ 已创建环境配置文件" -ForegroundColor Green
}

# 检查 Git
Write-Host ""
Write-Host "检查 Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git 已安装: $gitVersion" -ForegroundColor Green
    
    # 检查是否已初始化 Git 仓库
    if (Test-Path ".git") {
        Write-Host "✅ Git 仓库已初始化" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Git 仓库未初始化" -ForegroundColor Yellow
        $initGit = Read-Host "是否初始化 Git 仓库？(Y/N)"
        if ($initGit -eq 'Y' -or $initGit -eq 'y') {
            git init
            git add .
            git commit -m "feat: 初始化学生信息管理系统项目

- 完成后端 Express 服务器和 CRUD 接口
- 完成前端页面和交互逻辑  
- 实现 AI 成绩分析功能
- 配置 Nginx 部署
- 编写完整文档"
            Write-Host "✅ Git 仓库初始化完成" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Git 未安装" -ForegroundColor Red
    Write-Host "下载地址: https://git-scm.com/download/win" -ForegroundColor Yellow
}

# 环境检查完成
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  环境检查完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 询问是否启动服务
$startServer = Read-Host "是否启动后端服务？(Y/N)"
if ($startServer -eq 'Y' -or $startServer -eq 'y') {
    Write-Host ""
    Write-Host "正在启动后端服务..." -ForegroundColor Yellow
    Write-Host "服务将运行在 http://localhost:3000" -ForegroundColor Green
    Write-Host ""
    Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Yellow
    Write-Host ""
    Set-Location backend
    node server.js
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  下一步操作" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. 启动后端服务：" -ForegroundColor Yellow
    Write-Host "   cd backend" -ForegroundColor White
    Write-Host "   npm start" -ForegroundColor White
    Write-Host ""
    Write-Host "2. 访问前端页面：" -ForegroundColor Yellow
    Write-Host "   - 直接打开: frontend\index.html" -ForegroundColor White
    Write-Host "   - 或使用 Nginx 部署（推荐）" -ForegroundColor White
    Write-Host ""
    Write-Host "3. 查看文档：" -ForegroundColor Yellow
    Write-Host "   - 部署指南.md" -ForegroundColor White
    Write-Host "   - README.md" -ForegroundColor White
    Write-Host ""
}
