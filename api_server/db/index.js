// 导入MySQL模块
const mysql = require('mysql')

// 创建数据连接对象
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'my_db_01'
})

// 测试数据库连接
db.query('select 1',(err,result) => {
    if (err) return console.log(err.message);
    console.log(result);
})

// 向外共享数据库连接对象
module.exports = db