// 导入express模块
const express = require('express')
// 创建路由对象
const router = express.Router()

// 导入密码验证调用模块
const expressJoi = require('@escook/express-joi')
// 导入schema/user.js中的userSchema密码验证模块
const {reg_login_schema} = require('../schema/user')

// 导入用户路由处理函数模块：做到路由和函数处理分离
const userHandler = require('../router_handler/user')           // 模块共享过来的是对象


// 注册新用户：插入密码验证和函数处理
router.post('/reguser',expressJoi(reg_login_schema),userHandler.reguser)

// 登录
router.post('/login',expressJoi(reg_login_schema),userHandler.login)

// 将路由对象共享出去
module.exports = router