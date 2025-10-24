const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management';

// 学生数据模型
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  class: {
    type: String,
    required: true,
    trim: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

// 用户数据模型
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名不能为空'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, '密码不能为空'],
    minlength: [6, '密码至少6位']
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin']
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function testRegistration() {
  try {
    // 连接数据库
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ 数据库连接成功');
    
    // 测试查找学生
    const student = await Student.findOne({ name: '黄娜' });
    console.log('查找学生 "黄娜":', student ? '找到' : '未找到');
    if (student) {
      console.log('学生信息:', student.name, student.studentId, student.class, student.score);
    }
    
    // 测试查找用户
    const user = await User.findOne({ username: '黄娜' });
    console.log('查找用户 "黄娜":', user ? '已注册' : '未注册');
    
    // 断开连接
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testRegistration();