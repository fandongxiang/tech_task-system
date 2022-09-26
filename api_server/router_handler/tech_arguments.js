// 导入 tech_task 数据库
const db = require('../db/tech')

// 导入获取时间模块
const sd = require('silly-datetime')

// 获取 等径参数渲染预览区参数 路由函数
exports.getPreview = ((req, res) => {
  let { zoom, contract, type } = req.body;
  if (contract == '请新建') {
    const dataStr = `
    SELECT 
      *
    FROM
      tech_arguments_dengjing
    WHERE
      zoom = 'init'
  `
    db.query(dataStr, (err, results) => {
      if (err) return console.log(err);
      res.send({
        status: 0,
        message: "获取渲染预览区参数成功！",
        data: results
      })
    })
  } else {
    const dataStr = `
    SELECT 
      *
    FROM
      tech_arguments_dengjing
    WHERE
      zoom = ? AND contract = ?
    `
    db.query(dataStr, [zoom, contract], (err, results) => {
      if (err) return console.log(err);
      if (results.length == 0) {
        const dataStr = `
        SELECT 
          *
        FROM
          tech_arguments_dengjing
        WHERE
          zoom = 'init'
      `
        db.query(dataStr, (err, results) => {
          if (err) return console.log(err);
          res.send({
            status: 0,
            message: "获取渲染预览区参数成功！",
            data: results
          })
        })
      } else {
        const dataStr = `
        SELECT 
          *
        FROM
          tech_arguments_dengjing
        WHERE
          zoom = ? AND contract = ?
        ORDER BY subDay
        LIMIT 12
        `
        db.query(dataStr, [zoom, contract], (err, results) => {
          if (err) return console.log(err);
          res.send({
            status: 0,
            message: "获取渲染预览区参数成功！",
            data: results
          })
        })
      }
    })
  }
})


// 提交 参数 路由函数
exports.postArguments = ((req, res) => {
  const subDay = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
  let arr = []
  arr.push(req.body['0[]'])
  arr.push(req.body['1[]'])
  arr.push(req.body['2[]'])
  arr.push(req.body['3[]'])
  arr.push(req.body['4[]'])
  arr.push(req.body['5[]'])
  arr.push(req.body['6[]'])
  arr.push(req.body['7[]'])
  arr.push(req.body['8[]'])
  arr.push(req.body['9[]'])
  arr.push(req.body['10[]'])
  arr.push(req.body['11[]'])
  let newArr = []
  for (var i = 0; i < arr.length; i++) {
    arr[i].push(req.user.nickname)
    arr[i].push(subDay)
    newArr.push(arr[i])
  }
  let dataStr = `insert into tech_arguments_dengjing 
  (zoom,contract,discription,length,seedRotation,cruRotation,
    mainHeater,slSpeed,meltLevel,argonFlow,controlTime,controlRate,submitter,subDay)
    values ?`
  db.query(dataStr, [newArr], (err, results) => {
    if (err) return console.log(err);
    if (results.affectedRows == 0) return res.cc('提交数据失败！')
    return res.send({
      status: 0,
      message: '提交数据成功！',
    })
  })
})

// 获取 对应片区合同号 路由函数
exports.getContract = (req, res) => {
  let zoom = req.body['zoom']
  const dataStr = `
    SELECT 
      contract
    FROM
      tech_arguments_dengjing
    WHERE
      zoom = ?
    GROUP BY contract
  `
  db.query(dataStr, zoom, (err, results) => {
    if (err) return console.log(err);
    res.send({
      status: 0,
      message: "获取渲染预览区参数成功！",
      data: results
    })
  })
}