const express = require('express')
const router = express.Router()

// 导入验证数据合法性的中间件
const expressJoi = require('@escook/express-joi')
const {update_Userinfo_schema} = require('../schema/user')

// 导入路由处理函数
const userHandler = require('../router_handler/userinfo')

// 挂载路由
router.get('/userinfo',userHandler.getUserinfo)
router.post('/userinfo',expressJoi(update_Userinfo_schema),userHandler.updateUserinfo)

module.exports = router