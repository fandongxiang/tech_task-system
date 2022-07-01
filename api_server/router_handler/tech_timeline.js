// 导入预定义数据库连接
const { required } = require('@hapi/joi')
const db = require('../db/tech')

// 导入时间获取模块
const sd = require('silly-datetime')

// 工艺信息变更提交路由处理函数
exports.subInfo = (req,res) => {
  // res.send('OK') 此处会报 Cannot set headers after they are sent to the client
  let data = req.body
  data.subTime = sd.format(new Date(), 'YYYY-MM-DD')
  data.submitter = req.user.nickname
  const dataStr = 'insert into tech_timeline set ?'
  db.query(dataStr,data,(err,results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('插入失败！')
    return res.cc('插入成功！',status = 0)
  })
}

// 默认车间信息展示区处理函数
exports.getAllzooms = (req,res) => {
  const dataStr = 'select * from tech_timeline where zoom = "车间" and status = 0 order by subDay desc'
  db.query(dataStr,(err,results) => {
    if (err) return res.cc(err)
    res.cc(results,status = 0)
  })
}

// 删除工艺路线的处理函数
exports.delInfo = (req,res) => {
  const id = req.query.id
  const dataStr = 'update tech_timeline set status = 1 where id = ?'
  db.query(dataStr,id,(err,results) => {
    if (err) return res.cc(err) 
    if (results.affectedRows !== 1) return res.cc('删除失败！')
    res.cc('删除成功！',status = 0)
  })
}

// 筛选单个片区工艺信息处理函数
exports.getOnezoom = (req,res) => {
  let data = req.body
  let {affectSort,changeSort,zoom} = data
  var arr = [zoom,changeSort,affectSort]
  if (changeSort == '全部' && affectSort == '全部') {
    var dataStr = 'select * from tech_timeline where zoom =? and status = 0 order by subDay desc'
  } else if (changeSort == '全部') {
    var dataStr = 'select * from tech_timeline where zoom =? and affectSort = ? and status = 0 order by subDay desc'
    var arr = [zoom,affectSort]
  } else if (affectSort == '全部') {
    var dataStr = 'select * from tech_timeline where zoom =? and changeSort = ? and status = 0 order by subDay desc'
  } else {
    var dataStr = 'select * from tech_timeline where zoom =? and changeSort = ? and affectSort = ? and status = 0 order by subDay desc'
  }
  db.query(dataStr,arr,(err,results) => {
    if (err) return res.cc(err)
    res.cc(results,status = 0)
  })
}

// 历史提交区信息处理函数
exports.getHistoryInfo = (req,res) => {
  const nickname = req.user.nickname
  const dataStr = 'select * from tech_timeline where submitter = ? and status = 0 order by subDay desc'
  db.query(dataStr,nickname,(err,results) => {
    if (err) return res.cc(err)
    res.cc(results,status = 0)
  })
}