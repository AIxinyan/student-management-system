// API 基础路径
const API_BASE_URL = 'http://localhost:3000/api';

// DOM 元素
const userLoginBtn = document.getElementById('userLoginBtn');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const loginForm = document.getElementById('loginForm');
const loginTypeInput = document.getElementById('loginType');
const usernameLabel = document.getElementById('usernameLabel');
const adminHint = document.getElementById('adminHint');
const registerLink = document.getElementById('registerLink');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否已登录
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        redirectToDashboard(user.role);
    }

    // 登录类型切换
    userLoginBtn.addEventListener('click', () => switchLoginType('user'));
    adminLoginBtn.addEventListener('click', () => switchLoginType('admin'));

    // 表单提交
    loginForm.addEventListener('submit', handleLogin);
});

// 切换登录类型
function switchLoginType(type) {
    loginTypeInput.value = type;

    // 更新按钮状态
    if (type === 'admin') {
        adminLoginBtn.classList.add('active');
        userLoginBtn.classList.remove('active');
        usernameLabel.textContent = '管理员账号';
        adminHint.style.display = 'block';
        registerLink.style.display = 'none';
    } else {
        userLoginBtn.classList.add('active');
        adminLoginBtn.classList.remove('active');
        usernameLabel.textContent = '学生账号';
        adminHint.style.display = 'none';
        registerLink.style.display = 'block';
    }

    // 清空表单
    loginForm.reset();
    loginTypeInput.value = type;
}

// 处理登录
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginType = loginTypeInput.value;

    if (!username || !password) {
        showToast('请填写完整的登录信息', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                loginType
            })
        });

        const result = await response.json();

        if (result.success) {
            // 保存登录信息到 localStorage
            localStorage.setItem('currentUser', JSON.stringify(result.data));
            
            showToast('登录成功，正在跳转...', 'success');
            
            // 延迟跳转
            setTimeout(() => {
                redirectToDashboard(result.data.role);
            }, 1000);
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('登录失败:', error);
        showToast('登录失败，请检查网络连接', 'error');
    }
}

// 根据角色重定向
function redirectToDashboard(role) {
    if (role === 'admin') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'user.html';
    }
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
