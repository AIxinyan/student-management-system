const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 管理员数据模型
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    default: 'root'
  },
  password: {
    type: String,
    required: true,
    default: '000000'
  }
}, {
  timestamps: true
});

const Admin = mongoose.model('Admin', adminSchema);

// 普通用户数据模型
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

// 学生数据模型
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '姓名不能为空'],
    trim: true
  },
  studentId: {
    type: String,
    required: [true, '学号不能为空'],
    unique: true,
    trim: true
  },
  class: {
    type: String,
    required: [true, '班级不能为空'],
    trim: true
  },
  score: {
    type: Number,
    required: [true, '成绩不能为空'],
    min: [0, '成绩不能低于0'],
    max: [100, '成绩不能超过100']
  }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

// ==================== 认证相关路由 ====================

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码至少6位'
      });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '该用户名已被注册'
      });
    }

    // 检查用户名是否在学生表中
    const studentExists = await Student.findOne({ name: username });
    if (!studentExists) {
      return res.status(403).json({
        success: false,
        message: '系统未录入学生信息，请找管理员！'
      });
    }

    // 创建用户
    const user = new User({
      username,
      password, // 注意：实际项目中应该加密存储
      role: 'user'
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: '注册成功，即将跳转到登录页面',
      data: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      success: false,
      message: '注册失败: ' + error.message
    });
  }
});

// 用户登录（管理员和普通用户）
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password, loginType } = req.body;
    
    // 验证必填字段
    if (!username || !password || !loginType) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的登录信息'
      });
    }

    let user;
    let role;

    if (loginType === 'admin') {
      // 管理员登录：只有 root/000000
      if (username === 'root' && password === '000000') {
        role = 'admin';
        user = { username: 'root', role: 'admin' };
      } else {
        return res.status(401).json({
          success: false,
          message: '管理员用户名或密码错误'
        });
      }
    } else if (loginType === 'user') {
      // 普通用户登录
      user = await User.findOne({ username });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在，请先注册'
        });
      }

      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          message: '密码错误'
        });
      }

      role = user.role;
    } else {
      return res.status(400).json({
        success: false,
        message: '无效的登录类型'
      });
    }

    res.json({
      success: true,
      message: '登录成功',
      data: {
        username: user.username,
        role: role
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败: ' + error.message
    });
  }
});

// 检查用户名是否已存在
app.get('/api/auth/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    
    res.json({
      success: true,
      exists: !!user
    });
  } catch (error) {
    console.error('检查用户名失败:', error);
    res.status(500).json({
      success: false,
      message: '检查失败: ' + error.message
    });
  }
});

// ==================== 学生管理路由 ====================

// 创建学生信息
app.post('/api/students', async (req, res) => {
  try {
    const { name, studentId, class: className, score } = req.body;
    
    // 验证必填字段
    if (!name || !studentId || !className || score === undefined) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }

    // 检查学号是否已存在
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: '该学号已存在'
      });
    }

    const student = new Student({
      name,
      studentId,
      class: className,
      score: parseFloat(score)
    });

    await student.save();

    res.status(201).json({
      success: true,
      data: student,
      message: '学生信息创建成功'
    });
  } catch (error) {
    console.error('创建学生信息失败:', error);
    res.status(500).json({
      success: false,
      message: '创建学生信息失败: ' + error.message
    });
  }
});

// 获取所有学生信息
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: students,
      message: '获取学生列表成功'
    });
  } catch (error) {
    console.error('获取学生列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取学生列表失败: ' + error.message
    });
  }
});

// 获取单个学生信息
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: '未找到该学生'
      });
    }

    res.json({
      success: true,
      data: student,
      message: '获取学生信息成功'
    });
  } catch (error) {
    console.error('获取学生信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取学生信息失败: ' + error.message
    });
  }
});

// 更新学生信息
app.put('/api/students/:id', async (req, res) => {
  try {
    const { name, studentId, class: className, score } = req.body;
    
    // 如果更新学号，检查新学号是否已被其他学生使用
    if (studentId) {
      const existingStudent = await Student.findOne({ 
        studentId, 
        _id: { $ne: req.params.id } 
      });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: '该学号已被其他学生使用'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (studentId) updateData.studentId = studentId;
    if (className) updateData.class = className;
    if (score !== undefined) updateData.score = parseFloat(score);

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: '未找到该学生'
      });
    }

    res.json({
      success: true,
      data: student,
      message: '学生信息更新成功'
    });
  } catch (error) {
    console.error('更新学生信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新学生信息失败: ' + error.message
    });
  }
});

// 删除学生信息
app.delete('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: '未找到该学生'
      });
    }

    res.json({
      success: true,
      message: '学生信息删除成功'
    });
  } catch (error) {
    console.error('删除学生信息失败:', error);
    res.status(500).json({
      success: false,
      message: '删除学生信息失败: ' + error.message
    });
  }
});

// 筛选学生信息
app.get('/api/students/filter/search', async (req, res) => {
  try {
    const { class: className, minScore, maxScore } = req.query;
    
    const filter = {};
    
    if (className) {
      filter.class = className;
    }
    
    if (minScore !== undefined || maxScore !== undefined) {
      filter.score = {};
      if (minScore !== undefined) {
        filter.score.$gte = parseFloat(minScore);
      }
      if (maxScore !== undefined) {
        filter.score.$lte = parseFloat(maxScore);
      }
    }

    const students = await Student.find(filter).sort({ score: -1 });

    res.json({
      success: true,
      data: students,
      message: '筛选成功'
    });
  } catch (error) {
    console.error('筛选学生信息失败:', error);
    res.status(500).json({
      success: false,
      message: '筛选学生信息失败: ' + error.message
    });
  }
});

// AI 辅助成绩分析报告
app.get('/api/students/analysis/report', async (req, res) => {
  try {
    const students = await Student.find();

    if (students.length === 0) {
      return res.json({
        success: true,
        data: {
          totalStudents: 0,
          message: '暂无学生数据'
        },
        message: '分析完成'
      });
    }

    // 计算统计数据
    const scores = students.map(s => s.score);
    const totalStudents = students.length;
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const avgScore = totalScore / totalStudents;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    // 成绩分布统计
    const excellent = students.filter(s => s.score >= 90).length; // 优秀
    const good = students.filter(s => s.score >= 80 && s.score < 90).length; // 良好
    const pass = students.filter(s => s.score >= 60 && s.score < 80).length; // 及格
    const fail = students.filter(s => s.score < 60).length; // 不及格

    // 班级分析
    const classStat = {};
    students.forEach(student => {
      if (!classStat[student.class]) {
        classStat[student.class] = {
          students: [],
          totalScore: 0,
          count: 0
        };
      }
      classStat[student.class].students.push(student);
      classStat[student.class].totalScore += student.score;
      classStat[student.class].count++;
    });

    const classAnalysis = Object.keys(classStat).map(className => ({
      class: className,
      studentCount: classStat[className].count,
      avgScore: (classStat[className].totalScore / classStat[className].count).toFixed(2),
      maxScore: Math.max(...classStat[className].students.map(s => s.score)),
      minScore: Math.min(...classStat[className].students.map(s => s.score))
    }));

    // 生成排名（按成绩降序）
    const rankedStudents = students
      .sort((a, b) => b.score - a.score)
      .map((student, index) => ({
        rank: index + 1,
        name: student.name,
        studentId: student.studentId,
        class: student.class,
        score: student.score
      }));

    // AI 生成建议
    const suggestions = [];
    
    if (avgScore >= 85) {
      suggestions.push('整体表现优秀！继续保持当前的学习状态。');
    } else if (avgScore >= 70) {
      suggestions.push('整体表现良好，但仍有提升空间，建议加强薄弱环节的辅导。');
    } else if (avgScore >= 60) {
      suggestions.push('整体成绩及格，需要重点关注成绩较差的学生，提供针对性辅导。');
    } else {
      suggestions.push('整体成绩偏低，建议全面分析教学方法，加强基础知识巩固。');
    }

    if (fail > 0) {
      suggestions.push(`有 ${fail} 名学生成绩不及格，建议安排补习或一对一辅导。`);
    }

    if (excellent > totalStudents * 0.3) {
      suggestions.push('优秀学生比例较高，可以适当增加挑战性内容。');
    }

    const scoreGap = maxScore - minScore;
    if (scoreGap > 50) {
      suggestions.push('学生成绩差距较大，建议实施分层教学，因材施教。');
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalStudents,
          avgScore: avgScore.toFixed(2),
          maxScore,
          minScore,
          scoreGap
        },
        distribution: {
          excellent,
          good,
          pass,
          fail,
          excellentRate: ((excellent / totalStudents) * 100).toFixed(2) + '%',
          passRate: (((totalStudents - fail) / totalStudents) * 100).toFixed(2) + '%'
        },
        classAnalysis,
        topStudents: rankedStudents.slice(0, 10),
        suggestions
      },
      message: '分析报告生成成功'
    });
  } catch (error) {
    console.error('生成分析报告失败:', error);
    res.status(500).json({
      success: false,
      message: '生成分析报告失败: ' + error.message
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// MongoDB 连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB 连接成功');
  console.log('📊 数据库:', MONGODB_URI);
  
  // 启动服务器
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📡 API 基础路径: http://localhost:${PORT}/api`);
  });
})
.catch((error) => {
  console.error('❌ MongoDB 连接失败:', error.message);
  console.log('💡 请确保 MongoDB 服务已启动');
  process.exit(1);
});

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('未处理的 Promise 拒绝:', error);
});
