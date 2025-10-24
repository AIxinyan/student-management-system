const mongoose = require('mongoose');
require('dotenv').config();

// 连接数据库
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

// 中文姓名库
const surnames = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '罗', '高'];
const givenNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '华', '建'];

// 班级列表
const classes = ['一班', '二班', '三班', '四班', '五班'];

// 生成随机姓名
function generateName() {
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];
  return surname + givenName;
}

// 生成随机学号
function generateStudentId(index) {
  return `2024${String(index + 1).padStart(3, '0')}`;
}

// 生成随机班级
function generateClass() {
  return classes[Math.floor(Math.random() * classes.length)];
}

// 生成随机成绩
function generateScore() {
  return Math.floor(Math.random() * 41) + 60; // 60-100之间的随机成绩
}

// 生成20条学生数据
async function seedStudents() {
  try {
    console.log('正在连接数据库...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ 数据库连接成功');

    // 清空现有数据（可选）
    const existingCount = await Student.countDocuments();
    console.log(`当前数据库中有 ${existingCount} 条学生记录`);
    
    const shouldClear = process.argv.includes('--clear');
    if (shouldClear && existingCount > 0) {
      await Student.deleteMany({});
      console.log('✅ 已清空现有数据');
    }

    // 生成20条随机数据
    const students = [];
    const usedNames = new Set();
    
    for (let i = 0; i < 20; i++) {
      let name;
      // 确保姓名不重复
      do {
        name = generateName();
      } while (usedNames.has(name));
      usedNames.add(name);

      students.push({
        name: name,
        studentId: generateStudentId(i),
        class: generateClass(),
        score: generateScore()
      });
    }

    // 批量插入
    const result = await Student.insertMany(students);
    console.log(`✅ 成功插入 ${result.length} 条学生数据`);

    // 显示部分数据
    console.log('\n📊 示例数据：');
    result.slice(0, 5).forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.studentId}) - ${student.class} - ${student.score}分`);
    });

    console.log('\n✨ 数据生成完成！');
    
  } catch (error) {
    console.error('❌ 数据生成失败:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
  }
}

// 执行脚本
seedStudents();
