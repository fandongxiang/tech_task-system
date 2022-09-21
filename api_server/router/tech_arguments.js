const express = require('express')
const router = express.Router()

// 导入路由函数模块
const tech_arguments = require('../router_handler/tech_arguments')

// 获取提交预览区路由
router.post('/getPreview', tech_arguments.getPreview)

// 共享路由模块
module.exports = router