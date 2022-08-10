// 导入express模块
const express = require('express')
// 新建服务器
const app = express()
app.listen(3008, () => {
    console.log('tech&teskSystem server running at http://127.0.0.1:3007');
})

// 托管静态资源
app.use(express.static('../../tech_task-system/', { index: 'login.html' }))
app.use(express.static('../assets/css/'))
app.use(express.static('../assets/font/'))
app.use(express.static('../assets/images/'))
app.use(express.static('../assets/js/'))
app.use(express.static('../assets/lib/'))

// 配置跨域中间件
const cors = require('cors');
const { urlencoded } = require('express');
app.use(cors())

// 配置解析x-www.form-urlencoded表单数据中间件
app.use(urlencoded({ extended: false }))

// 导入@hapi/joi模块
const joi = require('joi')

// 响应错误的全局中间件：自己封装一个函数
app.use((req, res, next) => {
    res.cc = function (err, status = 1) {
        res.send({                                             // 利用全局中间件共享res和req
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
app.use('/api', userRouter)                               // 挂在路由前缀api

// 导入并注册用户信息路由模块
const userinfoRouter = require('./router/userinfo')
app.use('/my', userinfoRouter)

// 全局登录拦截处理函数
app.use((req,res,next) => {
    next()
})

// 导入并注册在线异常炉台路由模块
const tech_ab_onlineRouter = require('./router/tech_ab_online')
app.use('/tech', tech_ab_onlineRouter)

// 导入并注册 工艺时间线 路由模块
const tech_timeline = require('./router/tech_timeline')
app.use('/tech/timeline',tech_timeline)

// 测试多name属性
const db = require('./db/tech')
app.post('/api/test', (req, res) => {
    // 接收前端 form.serialize() 序列化对象数组
    var data = req.body
    console.log(data);
    var arr = []
    let {id:idArr,uname:unameArr,pw:pwArr} = data   // es6 解构赋值
    console.log(unameArr);
    for (let i = 0; i < unameArr.length; i++) {
        arr.push([idArr[i],unameArr[i],pwArr[i]])
    }
    // console.log([arr]);                    // 数组外面加 [] 到底是什么
    // 单纯插入
    // const dataStr = 'insert into test (uname,pw)  values ?'
    // 更新插入 : 必须提交 含有 Primary Key 或 Unique 字段，进行冲突检测
    const dataStr = 'replace into test (id,uname,pw)  values ?'
    db.query(dataStr, [arr], (err, results) => {
        if (err) return res.cc(err)
        if (results.affectedRows == 0) return res.cc('插入失败')
        res.cc('插入成功！')
    })
})

// 在最后导入错误级别中间件
const Joi = require('@hapi/joi');
const { jwtSecretKey } = require('./config');
const { login } = require('./router_handler/user');
app.use(function (err, req, res, next) {
    // 验证失败导致的错误
    if (err instanceof joi.ValidationError) { return res.send({ status: 1, message: err.message }) }
    // 身份认证失败后的错误
    if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
    // 未知错误
    res.send({ status: 1, message: err.message })
})



