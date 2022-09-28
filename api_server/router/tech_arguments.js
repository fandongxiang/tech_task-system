const express = require('express')
const router = express.Router()

// 导入路由函数模块
const tech_arguments = require('../router_handler/tech_arguments')

// 获取提交预览区路由
router.post('/getPreview', tech_arguments.getPreview)

// 获取 等径参数首页渲染 路由函数
router.post('/getCurrentPreview', tech_arguments.getCurrentPreview)

// 提交 参数 路由
router.post('/postArguments', tech_arguments.postArguments)

// 获取 对应片区合同号 路由
router.post('/getContract', tech_arguments.getContract)

// 获取 历史历史提交区 路由
router.post('/getHistorySubmit', tech_arguments.getHistorySubmit)

// 删除 历史提交区参数 路由
router.post('/deleteArguments', tech_arguments.deleteArguments)

// 共享路由模块
module.exports = router