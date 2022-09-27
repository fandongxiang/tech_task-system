const express = require('express')
const router = express.Router()

// 导入路由函数模块
const tech_arguments = require('../router_handler/tech_arguments')

// 获取提交预览区路由
router.post('/getPreview', tech_arguments.getPreview)

// 提交 参数 路由
router.post('/postArguments', tech_arguments.postArguments)

// 获取 对应片区合同号 路由
router.post('/getContract', tech_arguments.getContract)

// 获取 历史历史提交区 路由
router.post('/getHistorySubmit', tech_arguments.getHistorySubmit)

// 共享路由模块
module.exports = router