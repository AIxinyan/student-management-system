# MongoDB 安装指南

## Windows 系统安装 MongoDB

### 方法一：官方安装包（推荐）

1. **下载 MongoDB Community Server**
   - 访问官网：https://www.mongodb.com/try/download/community
   - 选择：
     - Version: 7.0.x (Current)
     - Platform: Windows
     - Package: msi
   - 点击 Download 下载

2. **安装 MongoDB**
   - 双击下载的 .msi 文件
   - 选择 "Complete" 安装
   - 勾选 "Install MongoDB as a Service"
   - 勾选 "Install MongoDB Compass"（图形化管理工具）
   - 完成安装

3. **验证安装**
   ```powershell
   mongod --version
   ```

4. **启动 MongoDB 服务**
   
   如果安装时选择了作为服务安装，MongoDB 会自动启动。可以通过以下命令管理：
   
   ```powershell
   # 查看服务状态
   Get-Service MongoDB
   
   # 启动服务
   Start-Service MongoDB
   
   # 停止服务
   Stop-Service MongoDB
   
   # 重启服务
   Restart-Service MongoDB
   ```

5. **配置环境变量（如果命令不可用）**
   
   - 右键"此电脑" → 属性 → 高级系统设置 → 环境变量
   - 在系统变量的 Path 中添加：
     ```
     C:\Program Files\MongoDB\Server\7.0\bin
     ```
   - 重启 PowerShell

### 方法二：使用 Chocolatey 安装

如果已安装 Chocolatey 包管理器：

```powershell
# 以管理员身份运行 PowerShell
choco install mongodb

# 启动 MongoDB
mongod
```

### 方法三：手动安装（不推荐）

1. 下载 ZIP 文件
2. 解压到指定目录（如 C:\mongodb）
3. 创建数据目录：
   ```powershell
   mkdir C:\data\db
   ```
4. 手动启动 MongoDB：
   ```powershell
   C:\mongodb\bin\mongod.exe --dbpath C:\data\db
   ```

## 启动 MongoDB

### 作为服务启动（推荐）

```powershell
Start-Service MongoDB
```

### 手动启动

```powershell
# 创建数据目录（首次）
mkdir C:\data\db

# 启动 MongoDB
mongod --dbpath C:\data\db
```

## 测试 MongoDB 连接

### 使用 mongo shell

```powershell
# 连接到 MongoDB
mongo
# 或
mongosh

# 在 mongo shell 中测试
> show dbs
> use student_management
> db.students.insertOne({name: "测试", studentId: "001", class: "测试班", score: 100})
> db.students.find()
```

### 使用 MongoDB Compass（图形界面）

1. 打开 MongoDB Compass
2. 连接字符串：`mongodb://localhost:27017`
3. 点击 Connect

## 常见问题解决

### 1. 端口 27017 被占用

```powershell
# 查看占用端口的进程
netstat -ano | findstr :27017

# 结束进程（替换 <PID> 为实际进程ID）
taskkill /PID <PID> /F
```

### 2. 数据目录权限问题

确保数据目录存在且有写入权限：
```powershell
mkdir C:\data\db -Force
```

### 3. MongoDB 服务无法启动

查看错误日志：
```powershell
# 日志位置通常在
Get-Content "C:\Program Files\MongoDB\Server\7.0\log\mongod.log" -Tail 50
```

### 4. 命令未找到

- 检查 MongoDB 是否安装
- 检查环境变量是否配置
- 重启 PowerShell 或计算机

## 快速验证安装是否成功

运行以下 PowerShell 脚本：

```powershell
# 检查 MongoDB 是否安装
try {
    $version = & mongod --version 2>&1
    Write-Host "✅ MongoDB 已安装" -ForegroundColor Green
    Write-Host $version[0]
} catch {
    Write-Host "❌ MongoDB 未安装或未配置环境变量" -ForegroundColor Red
}

# 检查 MongoDB 服务状态
try {
    $service = Get-Service MongoDB -ErrorAction SilentlyContinue
    if ($service) {
        Write-Host "✅ MongoDB 服务状态: $($service.Status)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB 服务未安装" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  MongoDB 未作为服务安装" -ForegroundColor Yellow
}
```

## 卸载 MongoDB

```powershell
# 停止服务
Stop-Service MongoDB

# 使用控制面板卸载 MongoDB
# 或使用 Chocolatey
choco uninstall mongodb

# 删除数据目录（可选）
Remove-Item -Path C:\data\db -Recurse -Force
```

## 生产环境建议

1. **启用认证**
   ```javascript
   // 创建管理员用户
   use admin
   db.createUser({
     user: "admin",
     pwd: "strongpassword",
     roles: ["root"]
   })
   ```

2. **配置文件**（C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg）
   ```yaml
   systemLog:
     destination: file
     path: C:\data\log\mongod.log
   storage:
     dbPath: C:\data\db
   net:
     port: 27017
     bindIp: 127.0.0.1
   security:
     authorization: enabled
   ```

3. **定期备份**
   ```powershell
   # 备份数据库
   mongodump --db student_management --out C:\backup\mongodb
   
   # 恢复数据库
   mongorestore --db student_management C:\backup\mongodb\student_management
   ```

## 下一步

安装完成后，返回项目根目录，按照 [部署指南.md](部署指南.md) 继续部署应用。
