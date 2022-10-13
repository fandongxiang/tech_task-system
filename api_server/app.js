// 导入express模块
const express = require('express')

// 新建服务器
const app = express()
app.listen(3008, () => {
  console.log('tech&teskSystem server running at http://127.0.0.1:3007');
})

// 托管静态资源
const path = require('path')
const finalPath = path.join(__dirname, '..', '..', 'tech_task-system')
app.use(express.static(finalPath, { index: 'login.html' }))

// 配置跨域中间件
const cors = require('cors');
app.use(cors())

// 配置解析x-www.form-urlencoded表单数据中间件
const { urlencoded } = require('express');
app.use(urlencoded({ extended: false }))

// 导入@hapi/joi模块
const joi = require('joi')

// 响应错误的全局中间件：自己封装一个函数
app.use((req, res, next) => {
  res.cc = function(err, status = 1) {
    res.send({ // 利用全局中间件共享res和req
      // 状态
      status,
      // 状态判断，判断错误err是错误对象，还是字符串
      message: err instanceof Error ? err.message : err
    })
  }
  next()
})

// 配置解析 Token 的中间件，一定要在路由模块之前
const expressJWT = require('express-jwt')
const config = require('./config')
app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api/] }))

// 导入并注册用户路由模块
const userRouter = require('./router/user');
app.use('/api', userRouter) // 挂在路由前缀api

// 导入并注册用户信息路由模块
const userinfoRouter = require('./router/userinfo')
app.use('/my', userinfoRouter)

app.use((req, res, next) => {
  next()
})

// 导入并注册 在线异常炉台 路由模块
const tech_ab_onlineRouter = require('./router/tech_ab_online')
app.use('/tech', tech_ab_onlineRouter)

// 导入并注册 工艺时间线 路由模块
const tech_timeline = require('./router/tech_timeline')
app.use('/tech/timeline', tech_timeline)

// 导入并挂载 工艺参数 路由模块
const tech_arguments = require('./router/tech_arguments')
app.use('/tech/arguments', tech_arguments)


// 在最后导入错误级别中间件
const Joi = require('@hapi/joi');
const { jwtSecretKey } = require('./config');
const { login } = require('./router_handler/user');
app.use(function(err, req, res, next) {
  // 验证失败导致的错误
  if (err instanceof joi.ValidationError) { return res.send({ status: 1, message: err.message }) }
  // 身份认证失败后的错误
  if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
    // 未知错误
  res.send({ status: 1, message: err.message })
})