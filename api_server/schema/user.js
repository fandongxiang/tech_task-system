// 安装@hapi/joi包：为每个表单携带的数据项，制定验证规则  npm i @hapi/joi@17.1.0
// 安装@escook/express-joi中间件，实现自动对表单数据进行验证功能  npm i @escook/express-joi
const joi = require('@hapi/joi')
const expressJoi = require('@escook/express-joi')

// 定义用户登录和注册验证规则
exports.reg_login_schema = {
    body: {
        username: joi.string().alphanum().min(5).max(12).required(),
        password: joi.string().pattern(/^[\S]{6,15}$/).required(),
    }
}

// 定义更新用户基本信息验证规则
exports.update_Userinfo_schema = {
    body: {
        id: joi.number().integer().min(0).required(),
        username: joi.string().alphanum().min(5).max(12).required(),
        nickname: joi.string().required(),
        email: joi.string().email().required()
    }
}

