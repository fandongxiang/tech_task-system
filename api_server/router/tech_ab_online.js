const express = require('express')
const router = express.Router()

// 验证模块
const expressJoi = require('@escook/express-joi')
const ab_schema = require('../schema/tech_ab_online')

// 获取当前用户输入炉台信息路由
const tech_abnor_onlineHander = require('../router_handler/tech_ab_online')
router.get('/abnor',tech_abnor_onlineHander.getAbnor_online)
// 提交炉台信息路由
router.post('/subabnor',expressJoi(ab_schema.subabnor),tech_abnor_onlineHander.subAbnor_online)
// 删除炉台信息路由
router.get('/delabnor',expressJoi(ab_schema.delabnor),tech_abnor_onlineHander.delAbnor)
// 获取所有炉台信息的路由函数
router.get('/getAllabnor',tech_abnor_onlineHander.getAllabnor)
// 更新所有炉台信息的路由函数
router.post('/updateAbnorOnline',tech_abnor_onlineHander.updateAbnor)
// 当日分片区异常炉台数
router.get('/dayAbnor',tech_abnor_onlineHander.getdayAbnor)
module.exports = router


