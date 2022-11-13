// 导入 tech_task 数据库
const db = require('../db/tech')

// 导入获取时间模块
const sd = require('silly-datetime')

// 获取预览异常炉台的路由函数
exports.getAbnor_online = (req, res) => {
  const dataStr = 'select * from abnormal_online where submitter= ? and to_days(subDay) = to_days(now()) order by subTime desc'
  db.query(dataStr, req.user.nickname, (err, results) => {
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message: '获取炉台信息成功！',
      data: results
    })
  })
}

// 获取所有异常炉台的路由函数
exports.getAllabnor = (req, res) => {
  // const dataStr = 'select * from abnormal_online where to_days(subDay) = to_days(now()) order by zoom,puller'
  const dataStr = `select t1.*,t2.amount count from (SELECT 
    COUNT(*) AS amount, CONCAT(zoom, puller) pullers
FROM
    abnormal_online
WHERE
    TO_DAYS(subDay) > (TO_DAYS(NOW()) - 15)
GROUP BY pullers ) t2 ,(SELECT 
    *,concat(zoom,puller) as pullers
FROM
    abnormal_online
WHERE
    TO_DAYS(subDay) = TO_DAYS(NOW())) t1
where t1.pullers = t2.pullers
order by zoom,puller`;
  db.query(dataStr, (err, results) => {
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message: '获取炉台信息成功！',
      data: results
    })
  })
}

// 提交炉台信息路由函数
exports.subAbnor_online = (req, res) => {
  var data = req.body
  const day = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
  const time = sd.format(new Date(), 'HH:mm')
  data.subDay = day
  data.subTime = time
  data.submitter = req.user.nickname
  const dataStr = 'insert into abnormal_online set ?'
  db.query(dataStr, data, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('提交数据失败！')
    return res.send({
      status: 0,
      message: '提交数据成功！',
    })
  })
}

// 删除预览区域炉台路由函数
exports.delAbnor = (req, res) => {
  const id = req.query['id'] // req.query 是对象
  const dataStr = 'delete from abnormal_online where id = ?'
  db.query(dataStr, id, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('删除失败！')
    return res.send({
      status: 0,
      message: '删除成功！'
    })
  })
}

// 更新所有炉台信息的路由函数
exports.updateAbnor = (req, res) => {
  const data = req.body
  console.log(data);
  const { abnormal: abnormalArr, abMeasure: abMeasureArr, state: stateArr, id: idArr } = data
  const arr = []
  for (var i = 0; i < abnormalArr.length; i++) {
    arr.push([idArr[i], abnormalArr[i], abMeasureArr[i], stateArr[i]])
  }
  const dataStr = 'insert into abnormal_online (id,abnormal,abMeasure,state)  values ? on duplicate key update abnormal = values(abnormal),abMeasure = values(abMeasure),state = values(state);'
  db.query(dataStr, [arr], (err, results) => {
    if (err) return console.log(err);
    // res.cc(err);
    if (results.affectedRows == 0) return console.log(err);
    // res.cc('插入失败')
    res.cc('更新成功！', status = 0)
  })
}

// 当日分片区异常炉台路由函数
exports.getdayAbnor = (req, res) => {
  const dataStr = 'select t.zooms,count(*) as amount from (select if(puller>32,concat(zoom,2),concat(zoom,1)) zooms from abnormal_online where to_days(subDay) = to_days(now())) t group by t.zooms order by t.zooms;'
  db.query(dataStr, (err, results) => {
    if (err) return res.cc(err)
    res.send(results)
  })
}

// 近n天车间异常炉台推移路由函数
exports.getweekAbnor = (req, res) => {
  const dataStr = `
    SELECT 
        (DATE_FORMAT(subDay, '%m-%d')) formatDay, COUNT(*) count
    FROM
        abnormal_online
    WHERE
        TO_DAYS(subDay) > (TO_DAYS(NOW()) - 20 )
    GROUP BY formatDay;
  `;
  db.query(dataStr, (err, results) => {
    if (err) return console.log(err);
    res.send(results)
  })
}

// 近n天车间异常炉台贡献断线次数路由函数
exports.getAbnorCount = (req, res) => {
  const dataStr = `
    SELECT 
      SUM((LENGTH(abnormal) - LENGTH(REPLACE(abnormal, '/', ''))) + 1) count,
      DATE_FORMAT(subDay, '%m-%d') formatSubday
    FROM
      abnormal_online
    WHERE
      TO_DAYS(subDay) > (TO_DAYS(NOW()) - 20)
    GROUP BY formatSubday
    ORDER BY formatSubday
  `;
  db.query(dataStr, (err, results) => {
    if (err) return console.log(err);
    res.send({
      status: 0,
      message: '成功获取异常炉台断线次数！',
      data: results
    });
  })
}

// 近n天异常原因分类路由函数
exports.getAbnorCause = (req, res) => {
  const dataStr = `
    SELECT 
      case 
    when abCause regexp '(干泵|满频|返气|炉压|抖动|籽晶|发白|对中)'
      then '设备异常'
      when abCause regexp '(功率|温度|温高|温低|低温|高温)'
      then '引晶功率异常'
      when abCause regexp '亮度'
      then '亮度异常'
      when abCause regexp '(液口距|埚位)'
      then '液口距异常'
      when abCause regexp '熔接'
      then '熔接异常'
    when abCause regexp '(头部拉速|拉速|降温|转肩降温|降温量)'
      then '头部拉速异常'
      when abCause regexp '翻料'
      then '翻料'
      when abCause regexp '频繁断提'
      then '频繁断提'
      when abCause regexp '(成晶差|成晶困难)'
      then '成晶困难'
      else 
        '其它'
      end as abCause_new,
      count(*) count
    FROM
      abnormal_online
    WHERE
      TO_DAYS(subDay) > (TO_DAYS(NOW()) - 30)
      group by abCause_new
      order by count desc
    `
  db.query(dataStr, (err, results) => {
    if (err) return console.log(err);
    res.send({
      status: 0,
      message: '获取异常原因分类成功！',
      data: results
    })
  })
}