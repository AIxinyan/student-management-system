在此基础上添加登录和注册功能，注册信息更新到数据库中，表名AI生成，登录分为管理员登录和用户登录，管理员登录成功进入管理员界面，用户登录成功进入用户界面。
管理员界面可以录入学生信息（跟现在的界面一样），而用户界面可以不能录入信息，只能查看学生信息
管理员只有一个root密码为000000，而用户不限量需要注册才能登录并且在注册完后直接登录
注册的用户名必须为管理员账号中学生表添加的用户名，否则显示：系统未录入学生信息，请找管理员！并回到登录页面
1. 创建数据库：create database login_system;
2. 使用数据库：use login_system;
3. 创建用户表：
create table user(
    id int(10) not null auto_increment,
    username varchar(20) not null,
    password varchar(20) not null,
    primary key (id)
)
4. 创建管理员表：
create table admin(
    id int(10) not null auto_increment,
    username varchar(20) not null,
    password varchar(20) not null,
    primary key (id)
)
5. 创建学生表：
create table student(
    id int(10) not null auto_increment,
    name varchar(20) not null,
    age int(3) not null,
    gender varchar(2) not null,
    primary key (id)
)
在学生表下随机创建20条数据