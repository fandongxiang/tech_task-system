// 导入 express 模块
const express = require('express')
const router = express.Router()

// 导入用户提交验证模块

// 导入工艺变更提交信息路由处理函数
const tech_timeline = require('../router_handler/tech_timeline')
router.post('/subInfo',tech_timeline.subInfo)

// 挂载默认展示区路由处理函数
router.get('/getAllzooms',tech_timeline.getAllzooms)

// 挂载删除工艺信息的路由函数
router.get('/del',tech_timeline.delInfo)

// 挂载筛选信息路由函数
router.post('/getOnezoom',tech_timeline.getOnezoom)

// 挂载历史提交信息路由函数
router.get('/getHistoryInfo',tech_timeline.getHistoryInfo)

// 将路由共享出去
module.exports = router