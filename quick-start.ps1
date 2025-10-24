# 学生信息管理系统 - 快速启动脚本
# Quick Start Script for Student Management System

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  学生信息管理系统 - 快速启动" -ForegroundColor Cyan
Write-Host "  Student Management System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 MongoDB 服务
Write-Host "1. 检查 MongoDB 服务..." -ForegroundColor Yellow
$mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue

if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "   ✓ MongoDB 服务运行正常" -ForegroundColor Green
} else {
    Write-Host "   ✗ MongoDB 服务未运行" -ForegroundColor Red
    Write-Host "   请先启动 MongoDB 服务！" -ForegroundColor Red
    pause
    exit 1
}

# 进入后端目录
Write-Host ""
Write-Host "2. 准备启动后端服务器..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"

if (-not (Test-Path $backendPath)) {
    Write-Host "   ✗ 找不到 backend 目录" -ForegroundColor Red
    pause
    exit 1
}

Set-Location $backendPath

# 检查是否安装了依赖
if (-not (Test-Path "node_modules")) {
    Write-Host "   正在安装依赖包..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ✗ 依赖安装失败" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "   ✓ 依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "   ✓ 依赖已安装" -ForegroundColor Green
}

# 启动后端服务器（后台运行）
Write-Host ""
Write-Host "3. 启动后端服务器..." -ForegroundColor Yellow
Write-Host "   服务器地址: http://localhost:3000" -ForegroundColor Cyan

# 在新窗口中启动后端服务器
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm start"

# 等待服务器启动
Write-Host "   等待服务器启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 测试服务器连接
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get -ErrorAction Stop
    if ($response.status -eq "ok") {
        Write-Host "   ✓ 后端服务器启动成功" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠ 服务器可能需要更多时间启动" -ForegroundColor Yellow
}

# 打开前端页面
Write-Host ""
Write-Host "4. 打开前端页面..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend\index.html"

if (Test-Path $frontendPath) {
    Start-Process $frontendPath
    Write-Host "   ✓ 前端页面已打开" -ForegroundColor Green
} else {
    Write-Host "   ✗ 找不到前端页面" -ForegroundColor Red
}

# 显示使用说明
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  系统已启动！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📌 使用说明：" -ForegroundColor Yellow
Write-Host ""
Write-Host "   管理员登录：" -ForegroundColor Cyan
Write-Host "   - 账号: root" -ForegroundColor White
Write-Host "   - 密码: 000000" -ForegroundColor White
Write-Host ""
Write-Host "   学生登录：" -ForegroundColor Cyan
Write-Host "   - 首次使用请先注册" -ForegroundColor White
Write-Host "   - 用户名必须是系统中的学生姓名" -ForegroundColor White
Write-Host "   - 可用姓名: 吴军、高军、刘华、周静、黄娜等" -ForegroundColor White
Write-Host ""
Write-Host "📊 服务信息：" -ForegroundColor Yellow
Write-Host "   - 后端服务: http://localhost:3000" -ForegroundColor White
Write-Host "   - API文档: http://localhost:3000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "💡 提示：" -ForegroundColor Yellow
Write-Host "   - 后端服务器在独立窗口中运行" -ForegroundColor White
Write-Host "   - 关闭该窗口即停止服务器" -ForegroundColor White
Write-Host "   - 详细使用说明请查看: 使用说明.md" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# 返回原目录
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
pause
