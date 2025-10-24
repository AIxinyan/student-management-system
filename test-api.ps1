# 学生信息管理系统 - API 测试脚本

$API_BASE = "http://localhost:3000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  学生信息管理系统 - API 测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 测试健康检查
Write-Host "1. 测试健康检查接口..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$API_BASE/health" -Method Get
    Write-Host "✅ 健康检查成功" -ForegroundColor Green
    Write-Host "   状态: $($health.status)" -ForegroundColor White
    Write-Host "   消息: $($health.message)" -ForegroundColor White
} catch {
    Write-Host "❌ 健康检查失败" -ForegroundColor Red
    Write-Host "   请确保后端服务已启动：cd backend && npm start" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 创建测试学生数据
Write-Host "2. 创建测试学生数据..." -ForegroundColor Yellow

$students = @(
    @{
        name = "张三"
        studentId = "2024001"
        class = "一班"
        score = 95
    },
    @{
        name = "李四"
        studentId = "2024002"
        class = "一班"
        score = 88
    },
    @{
        name = "王五"
        studentId = "2024003"
        class = "二班"
        score = 76
    },
    @{
        name = "赵六"
        studentId = "2024004"
        class = "二班"
        score = 92
    },
    @{
        name = "孙七"
        studentId = "2024005"
        class = "一班"
        score = 65
    }
)

foreach ($student in $students) {
    try {
        $body = $student | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$API_BASE/students" -Method Post -Body $body -ContentType "application/json"
        Write-Host "   ✅ 创建学生: $($student.name) - 学号: $($student.studentId)" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "   ⚠️  学生 $($student.name) 已存在，跳过" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ 创建失败: $($student.name)" -ForegroundColor Red
        }
    }
}

Write-Host ""

# 获取所有学生
Write-Host "3. 获取所有学生..." -ForegroundColor Yellow
try {
    $allStudents = Invoke-RestMethod -Uri "$API_BASE/students" -Method Get
    Write-Host "✅ 获取成功，共 $($allStudents.data.Count) 名学生" -ForegroundColor Green
    $allStudents.data | Format-Table -Property name, studentId, class, score -AutoSize
} catch {
    Write-Host "❌ 获取失败" -ForegroundColor Red
}

Write-Host ""

# 测试筛选功能
Write-Host "4. 测试筛选功能（一班学生）..." -ForegroundColor Yellow
try {
    $filtered = Invoke-RestMethod -Uri "$API_BASE/students/filter/search?class=一班" -Method Get
    Write-Host "✅ 筛选成功，找到 $($filtered.data.Count) 名学生" -ForegroundColor Green
    $filtered.data | Format-Table -Property name, studentId, class, score -AutoSize
} catch {
    Write-Host "❌ 筛选失败" -ForegroundColor Red
}

Write-Host ""

# 测试成绩范围筛选
Write-Host "5. 测试成绩筛选（90分以上）..." -ForegroundColor Yellow
try {
    $highScores = Invoke-RestMethod -Uri "$API_BASE/students/filter/search?minScore=90" -Method Get
    Write-Host "✅ 筛选成功，找到 $($highScores.data.Count) 名学生" -ForegroundColor Green
    $highScores.data | Format-Table -Property name, studentId, class, score -AutoSize
} catch {
    Write-Host "❌ 筛选失败" -ForegroundColor Red
}

Write-Host ""

# 测试 AI 分析报告
Write-Host "6. 测试 AI 分析报告..." -ForegroundColor Yellow
try {
    $analysis = Invoke-RestMethod -Uri "$API_BASE/students/analysis/report" -Method Get
    Write-Host "✅ 分析报告生成成功" -ForegroundColor Green
    Write-Host ""
    Write-Host "   📊 整体统计：" -ForegroundColor Cyan
    Write-Host "      总人数: $($analysis.data.summary.totalStudents)" -ForegroundColor White
    Write-Host "      平均分: $($analysis.data.summary.avgScore)" -ForegroundColor White
    Write-Host "      最高分: $($analysis.data.summary.maxScore)" -ForegroundColor White
    Write-Host "      最低分: $($analysis.data.summary.minScore)" -ForegroundColor White
    Write-Host ""
    Write-Host "   📈 成绩分布：" -ForegroundColor Cyan
    Write-Host "      优秀(≥90): $($analysis.data.distribution.excellent) 人" -ForegroundColor White
    Write-Host "      良好(80-89): $($analysis.data.distribution.good) 人" -ForegroundColor White
    Write-Host "      及格(60-79): $($analysis.data.distribution.pass) 人" -ForegroundColor White
    Write-Host "      不及格(<60): $($analysis.data.distribution.fail) 人" -ForegroundColor White
    Write-Host "      及格率: $($analysis.data.distribution.passRate)" -ForegroundColor White
    Write-Host ""
    Write-Host "   💡 AI 建议：" -ForegroundColor Cyan
    foreach ($suggestion in $analysis.data.suggestions) {
        Write-Host "      • $suggestion" -ForegroundColor White
    }
} catch {
    Write-Host "❌ 分析报告生成失败" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  API 测试完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "现在可以访问前端页面进行可视化操作：" -ForegroundColor Yellow
Write-Host "  - 直接打开: frontend\index.html" -ForegroundColor White
Write-Host "  - 或通过 Nginx: http://localhost" -ForegroundColor White
Write-Host ""
