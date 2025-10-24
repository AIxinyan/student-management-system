// API 基础路径
const API_BASE_URL = 'http://localhost:3000/api';

// 当前编辑的学生ID
let editingStudentId = null;

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 权限检查
    checkAuth();
    
    initEventListeners();
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
    
    // 检查是否为管理员
    if (user.role !== 'admin') {
        showToast('权限错误，正在跳转...', 'error');
        setTimeout(() => {
            window.location.href = 'user.html';
        }, 1500);
        return;
    }

    // 显示欢迎信息
    const welcomeText = document.getElementById('welcomeText');
    if (welcomeText) {
        welcomeText.textContent = `欢迎，${user.username}`;
    }
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
    // 表单提交
    document.getElementById('studentForm').addEventListener('submit', handleSubmit);
    
    // 取消按钮
    document.getElementById('cancelBtn').addEventListener('click', resetForm);
    
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

// 渲染学生表格
function renderStudentTable(students) {
    const tbody = document.getElementById('studentTableBody');
    
    if (!students || students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">暂无数据</td></tr>';
        return;
    }
    
    tbody.innerHTML = students.map((student, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${student.name}</td>
            <td>${student.studentId}</td>
            <td>${student.class}</td>
            <td>${student.score}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editStudent('${student._id}')">编辑</button>
                <button class="action-btn btn-delete" onclick="deleteStudent('${student._id}')">删除</button>
            </td>
        </tr>
    `).join('');
}

// 处理表单提交
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        studentId: document.getElementById('studentId').value.trim(),
        class: document.getElementById('class').value.trim(),
        score: parseFloat(document.getElementById('score').value)
    };
    
    // 验证成绩范围
    if (formData.score < 0 || formData.score > 100) {
        showToast('成绩必须在 0-100 之间', 'error');
        return;
    }
    
    try {
        let response;
        if (editingStudentId) {
            // 更新学生
            response = await fetch(`${API_BASE_URL}/students/${editingStudentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        } else {
            // 创建学生
            response = await fetch(`${API_BASE_URL}/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            showToast(result.message, 'success');
            resetForm();
            loadStudents();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('提交失败:', error);
        showToast('操作失败，请检查网络连接', 'error');
    }
}

// 编辑学生
async function editStudent(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${id}`);
        const result = await response.json();
        
        if (result.success) {
            const student = result.data;
            
            // 填充表单
            document.getElementById('name').value = student.name;
            document.getElementById('studentId').value = student.studentId;
            document.getElementById('class').value = student.class;
            document.getElementById('score').value = student.score;
            
            // 设置编辑状态
            editingStudentId = id;
            document.getElementById('form-title').textContent = '✏️ 编辑学生信息';
            document.getElementById('submitBtn').textContent = '更新';
            document.getElementById('cancelBtn').style.display = 'inline-block';
            
            // 滚动到表单
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('获取学生信息失败:', error);
        showToast('获取学生信息失败', 'error');
    }
}

// 删除学生
async function deleteStudent(id) {
    if (!confirm('确定要删除这个学生吗？此操作无法撤销。')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/students/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(result.message, 'success');
            loadStudents();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('删除失败:', error);
        showToast('删除失败，请检查网络连接', 'error');
    }
}

// 重置表单
function resetForm() {
    document.getElementById('studentForm').reset();
    editingStudentId = null;
    document.getElementById('form-title').textContent = '📝 添加学生信息';
    document.getElementById('submitBtn').textContent = '提交';
    document.getElementById('cancelBtn').style.display = 'none';
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
