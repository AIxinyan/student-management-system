// API 基础路径
const API_BASE_URL = 'http://localhost:3000/api';

// DOM 元素
const registerForm = document.getElementById('registerForm');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否已登录
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        redirectToDashboard(user.role);
    }

    // 表单提交
    registerForm.addEventListener('submit', handleRegister);
});

// 处理注册
async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // 验证
    if (!username || !password || !confirmPassword) {
        showToast('请填写完整的注册信息', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('密码长度至少6位', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('两次输入的密码不一致', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const result = await response.json();

        if (result.success) {
            showToast(result.message, 'success');
            
            // 延迟跳转到登录页
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('注册失败:', error);
        showToast('注册失败，请检查网络连接', 'error');
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
