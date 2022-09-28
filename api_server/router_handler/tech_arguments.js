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
      AND status = 0
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
      AND status = 0
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
          AND status = 0
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
          AND status = 0
          ORDER BY subDay desc,length
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

// 获取 等径参数首页渲染 路由函数
exports.getCurrentPreview = ((req, res) => {
  let { zoom, contract, type } = req.body;
  const dataStr = `
        SELECT 
          *
        FROM
          tech_arguments_dengjing
        WHERE
          zoom = ? AND contract = ?
          AND status = 0
          ORDER BY subDay desc,length
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
      AND status = 0
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

// 获取 历史提交区 路由函数
exports.getHistorySubmit = (req, res) => {
  let zoom = req.body['zoom'];
  const dataStr = `
    SELECT 
      zoom, contract, discription, submitter, (date_format(subDay,'%Y-%m-%d %H:%i')) subDay
    FROM
      tech_arguments_dengjing
    WHERE
      zoom = ?
      AND status = 0
    GROUP BY zoom , contract , subDay
  `
  db.query(dataStr, zoom, (err, results) => {
    if (err) return console.log(err);
    res.send({
      status: 0,
      message: '获取历史提交区信息成功！',
      data: results
    })
  })
}

// 删除 历史提交区数据 路由函数
exports.deleteArguments = (req, res) => {
  let { zoom, contract, subDay } = req.body
  const dataStr = `
  UPDATE tech_arguments_dengjing 
  SET 
      status = 1
  WHERE
      zoom = ?
      AND contract = ?
      AND (DATE_FORMAT(subDay, '%Y-%m-%d %H:%i')) = ?
  `
  db.query(dataStr, [zoom, contract, subDay], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows != 12) return res.cc('删除数据失败！')
    res.send({
      status: 0,
      message: '删除数据成功！',
      data: results
    })
  })
}