const express = require('express');
const path = require('path');

const app = express();
const PORT = 8000;

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'frontend')));

// 所有其他路由都返回 index.html (支持 SPA)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'register.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'admin.html'));
});

app.get('/user.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'user.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 简单服务器运行在 http://localhost:${PORT}`);
  console.log(`📂 静态文件目录: ${path.join(__dirname, 'frontend')}`);
});