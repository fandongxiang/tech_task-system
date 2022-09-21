// 导入 tech_task 数据库
const db = require('../db/tech')

// 获取 渲染预览区参数 路由函数
exports.getPreview = ((req, res) => {
  const dataStr = `
    SELECT 
      *
    FROM
      tech_arguments
    WHERE
      zoom = 'init'
    ORDER BY length
    `
  db.query(dataStr, (err, results) => {
    if (err) return console.log(err);
    res.send({
      status: 0,
      message: "获取渲染预览区参数成功！",
      data: results
    })
  })
})