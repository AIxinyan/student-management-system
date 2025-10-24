// API 基础路径
const API_BASE_URL = 'http://localhost:3000/api';

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 权限检查
    checkAuth();
    
    // 初始化事件监听器
    initEventListeners();
    
    // 加载学生列表
    loadStudents();
});

// 权限检查
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        // 未登录，跳转到登录页
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(currentUser);
    
    // 检查是否为普通用户
    if (user.role !== 'user') {
        showToast('权限错误，正在跳转...', 'error');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
        return;
    }

    // 显示欢迎信息
    document.getElementById('welcomeText').textContent = `欢迎，${user.username}`;
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('currentUser');
        showToast('已退出登录', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// 初始化事件监听器
function initEventListeners() {
    // 筛选按钮
    document.getElementById('filterBtn').addEventListener('click', filterStudents);
    
    // 重置筛选
    document.getElementById('resetFilterBtn').addEventListener('click', resetFilter);
    
    // AI 分析报告
    document.getElementById('analysisBtn').addEventListener('click', generateAnalysisReport);
}

// 显示提示消息
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 加载学生列表
async function loadStudents() {
    try {
        const response = await fetch(`${API_BASE_URL}/students`);
        const result = await response.json();
        
        if (result.success) {
            renderStudentTable(result.data);
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('加载学生列表失败:', error);
        showToast('加载学生列表失败，请检查服务器是否运行', 'error');
    }
}

// 渲染学生表格（只读，无操作列）
function renderStudentTable(students) {
    const tbody = document.getElementById('studentTableBody');
    
    if (!students || students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">暂无数据</td></tr>';
        return;
    }
    
    tbody.innerHTML = students.map((student, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${student.name}</td>
            <td>${student.studentId}</td>
            <td>${student.class}</td>
            <td>${student.score}</td>
        </tr>
    `).join('');
}

// 筛选学生
async function filterStudents() {
    const className = document.getElementById('filterClass').value.trim();
    const minScore = document.getElementById('filterMinScore').value;
    const maxScore = document.getElementById('filterMaxScore').value;
    
    const params = new URLSearchParams();
    if (className) params.append('class', className);
    if (minScore) params.append('minScore', minScore);
    if (maxScore) params.append('maxScore', maxScore);
    
    try {
        const response = await fetch(`${API_BASE_URL}/students/filter/search?${params.toString()}`);
        const result = await response.json();
        
        if (result.success) {
            renderStudentTable(result.data);
            showToast(`找到 ${result.data.length} 条记录`, 'success');
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('筛选失败:', error);
        showToast('筛选失败，请检查网络连接', 'error');
    }
}

// 重置筛选
function resetFilter() {
    document.getElementById('filterClass').value = '';
    document.getElementById('filterMinScore').value = '';
    document.getElementById('filterMaxScore').value = '';
    loadStudents();
    showToast('已重置筛选条件', 'info');
}

// 生成 AI 分析报告
async function generateAnalysisReport() {
    try {
        showToast('正在生成 AI 分析报告...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/students/analysis/report`);
        const result = await response.json();
        
        if (result.success) {
            renderAnalysisReport(result.data);
            showToast('AI 分析报告生成成功', 'success');
            
            // 滚动到分析报告
            document.getElementById('analysisSection').scrollIntoView({ behavior: 'smooth' });
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('生成分析报告失败:', error);
        showToast('生成分析报告失败，请检查网络连接', 'error');
    }
}

// 渲染分析报告
function renderAnalysisReport(data) {
    const section = document.getElementById('analysisSection');
    const content = document.getElementById('analysisContent');
    
    if (!data.summary) {
        content.innerHTML = '<p>暂无足够数据进行分析</p>';
        section.style.display = 'block';
        return;
    }
    
    const html = `
        <div class="analysis-card">
            <h3>📈 整体统计</h3>
            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-label">总人数</div>
                    <div class="stat-value">${data.summary.totalStudents}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">平均分</div>
                    <div class="stat-value">${data.summary.avgScore}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">最高分</div>
                    <div class="stat-value">${data.summary.maxScore}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">最低分</div>
                    <div class="stat-value">${data.summary.minScore}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">分数差距</div>
                    <div class="stat-value">${data.summary.scoreGap}</div>
                </div>
            </div>
        </div>
        
        <div class="analysis-card">
            <h3>📊 成绩分布</h3>
            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-label">优秀 (≥90)</div>
                    <div class="stat-value">${data.distribution.excellent}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">良好 (80-89)</div>
                    <div class="stat-value">${data.distribution.good}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">及格 (60-79)</div>
                    <div class="stat-value">${data.distribution.pass}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">不及格 (<60)</div>
                    <div class="stat-value">${data.distribution.fail}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">优秀率</div>
                    <div class="stat-value" style="font-size: 1.3em;">${data.distribution.excellentRate}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">及格率</div>
                    <div class="stat-value" style="font-size: 1.3em;">${data.distribution.passRate}</div>
                </div>
            </div>
        </div>
        
        ${data.classAnalysis && data.classAnalysis.length > 0 ? `
        <div class="analysis-card">
            <h3>🏫 班级分析</h3>
            <div class="rank-table">
                <table>
                    <thead>
                        <tr>
                            <th>班级</th>
                            <th>人数</th>
                            <th>平均分</th>
                            <th>最高分</th>
                            <th>最低分</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.classAnalysis.map(cls => `
                            <tr>
                                <td>${cls.class}</td>
                                <td>${cls.studentCount}</td>
                                <td>${cls.avgScore}</td>
                                <td>${cls.maxScore}</td>
                                <td>${cls.minScore}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        ` : ''}
        
        ${data.topStudents && data.topStudents.length > 0 ? `
        <div class="analysis-card">
            <h3>🏆 成绩排名 Top 10</h3>
            <div class="rank-table">
                <table>
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>姓名</th>
                            <th>学号</th>
                            <th>班级</th>
                            <th>成绩</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.topStudents.map(student => `
                            <tr>
                                <td>${student.rank}</td>
                                <td>${student.name}</td>
                                <td>${student.studentId}</td>
                                <td>${student.class}</td>
                                <td>${student.score}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        ` : ''}
        
        ${data.suggestions && data.suggestions.length > 0 ? `
        <div class="analysis-card">
            <h3>💡 AI 改进建议</h3>
            <ul class="suggestions-list">
                ${data.suggestions.map(suggestion => `
                    <li>${suggestion}</li>
                `).join('')}
            </ul>
        </div>
        ` : ''}
    `;
    
    content.innerHTML = html;
    section.style.display = 'block';
}
