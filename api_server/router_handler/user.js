/*在这里定义和用户相关的路由处理函数，供/router/user.js调用 */

// 导入数据库操作模块
const db = require('../db/index')

// 导入加密模块
const bcrypt = require('bcryptjs')

/* 注册用户的处理函数  */
exports.reguser = (req,res) => {
    // 1、获取客户端提交的表单信息
    const userinfo = req.body

    // // 2、检测表单提交内容是否为空
    // if (!userinfo.username || !userinfo.password) {
    //     return res.cc('用户名或密码不能为空！')
    // }

    // 3、检测用户名是否被占用
    // 定义查询语句
    const sqlStr = 'select * from users where username=?'
    db.query(sqlStr,userinfo.username,(err,results) => {
        // 执行sql语句失败
        if (err) {
            return res.cc(err)
        }
        // 判断用户名是否被占用
        if (results.length > 0) {                            // 查询语句返回的是数组，可以用数组长度判断是否存在
            return res.cc('用户名已被注册！')
        }

        // 4、对用户密码进行加密处理
        userinfo.password = bcrypt.hashSync(userinfo.password,1)

        // 5、插入新用户
        // 定义sql语句
        const sql = 'insert into users set?'
        // 调用db.query()方法插入新用户
        db.query(sql,{username:userinfo.username,password:userinfo.password},(err,results) =>{
            // 判断sql语句是否执行成功
            if (err) return res.cc(err)
            // 判断插入是否成功
            if (results.affectedRows !== 1) {
                return res.cc('用户注册失败，请稍后再试！')
            }
            // res.send({status: 0,message: '注册成功！'})                               // 注意：此处res.send要放在db.query函数体内，否则重复输出
            res.cc('注册成功！',0)
        })
    })
}

/* 登录用户的处理函数  */
exports.login = (req,res) => {
    // 1、获取客户端提交的表单信息
    const userinfo = req.body

    // 2、校验表单信息：在schema/user.js和router/user.js中通过插件验证
    // 3、检查用户是否存在
    const sqlStr = 'select * from users where username = ?'
    db.query(sqlStr,userinfo.username,(err,results) => {
        if (err) return res.cc(err)
        if (results.length == 0) {
           return  res.cc('用户名不存在！')
        }

        // 4、检验用户密码是否正确:使用bcrypt.compareSync(未加密密码，加密密码)，结果是布尔值
        const compareSync = bcrypt.compareSync(userinfo.password,results[0].password)
        if (!compareSync) return res.cc('登录失败')

        // 5. 生成 JWT 的Token字符串
        // 剔除密码和头像的值
        const user = {...results[0],password: '',user_pic: ''}
        const jwt = require('jsonwebtoken')
        // 将用户信息加密成Token字符串
        const config = require('../config')
        const tokenStr = jwt.sign(user,config.jwtSecretKey,{expiresIn:'10h'})
        // 将 tokenStr 字符串传给客户端
        res.send({
            status: 0,
            message: '登录成功！',
            // 方便客户端，直接拼接 Bearer 前缀
            token: 'Bearer ' + tokenStr
        })

    })


}