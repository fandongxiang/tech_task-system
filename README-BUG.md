# BUG

## 1. 异常炉台提交更新时报错“更新炉台失败"

**排除方法**：在api_server-router_handler-tech_ab_online.js中将res.(err)报错信息改为console.log(err)打印到控制台

    ``` js
      db.query(dataStr, [arr], (err, results) => {
        if (err) return console.log(err);
        // res.cc(err);
        if (results.affectedRows == 0) return console.log   (err);
        // res.cc('插入失败')
        res.cc('更新成功！', status = 0)
      })
    ```

**错误信息**：
      `sqlMessage: "Incorrect integer value: 'undefined' focolumn 'id' at row 1"`；
      ` code: 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' `
**原因**：优化炉号单元格宽度时，将绑定id的单元格的类名`idclass`添加到了炉号单元格上，导致`id`遍历查找错误，报错`undefined`，数据库无法识别；
**解决方法**：将炉号的类名`idclass`删除；
