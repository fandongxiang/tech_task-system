[TOC]

# 每日工作

## 2022-9-14

### 1. 异常炉台：优化按片区负责人负责片区自动锁定下拉片区

#### 1.1 根据登录人自动选择片区（*代码写死，优化后台入*）
  ``` js
    $.ajax({
      type: 'GET',
      url: '/my/userinfo',
      // headers 就是请求头配置文件
      headers: { Authorization: localStorage.getItem          ('token') || '' },
      success: function(res) {
        if (res.status !== 0) return console.log(res.message);
        const nickname = res.data['nickname']
        let puller = '';
        switch (nickname) {
          case "樊东祥":
            puller = "A";
            break;
          case "法龙超":
            puller = "A";
            break;
          case "王金华":
            puller = "A";
            break;
          case "王芳":
            puller = "B";
            break;
          case "孙海敏":
            puller = "C";
            break;
          case "魏铭琪":
            puller = "D";
            break;
          case "马勇":
            puller = "E";
            break;
        }
        document.querySelector('#select').value = puller;
      }
    })
  ```

#### 1.2 提交后片区下拉菜单保留上次选择的片区

  ``` js
    let zoom_value = $('#select').val()
    $('.form')[0].reset()
    return $('#select').val(zoom_value)
  ```
#### 1.3 完整展示区增加异常次数
  ``` sql
    <!-- 内连接查询实现 -->
    select t1.*,t2.count from (SELECT 
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
    order by zoom,puller;
  ```
#### 1.4 优化提交区异常原因和异常措施输入限制
      ``` js
        // 限制输入内容
        $('.abCause-limit').keyup(function() {
          $('.p-abCause').html('')
          if ($(this).val().length > 13) {
            $(this).val($(this).val().replace($(this).val(), $(this).val().substr     (0, 13)))
            $('.p-abCause').html('异常原因不能超过12个字符！')
          }
        })

        $('.abMeasure-limit').keyup(function() {
          $('.p-abMeasure').html('')
          if ($(this).val().length > 24) {
            $(this).val($(this).val().replace($(this).val(), $(this).val().substr     (0, 24)))
            $('.p-abMeasure').html('异常原因不能超过24个字符！')
          }
        })
      ```
### 2. 数据库优化：规整数据库
#### 2.1 将原来`my_db_01`数据库中的`users`表格复制到`tech_task`总表中；

     ``` sql
      <!-- 1.显示原表结构 -->
      SHOW create table my_db_01.users;
      <!-- 2.复制原表结构建立新表 -->
      CREATE TABLE `users` (
      `id` int NOT NULL AUTO_INCREMENT,
      `username` varchar(45) NOT NULL,
      `password` varchar(255) NOT NULL,
      `nickname` varchar(45) DEFAULT NULL,
      `email` varchar(45) DEFAULT NULL,
      `user_pic` varchar(255) DEFAULT NULL,
      `status` tinyint(1) DEFAULT '0',
      PRIMARY KEY (`id`),
      UNIQUE KEY `username_UNIQUE` (`username`),
      UNIQUE KEY `id_UNIQUE` (`id`)
      ) 
      <!-- 3. 复制原表内容到新表 -->
      insert INTO users (id,
      username,
      password,
      nickname,
      email,
      user_pic,
      status) 
      select id,username,password,nickname,email,  user_pic,status from my_db_01.users;
     ```

## 2020-09-15 

### 1. 异常炉台：添加车间n天异常炉台推移
#### 1.1 SQL查询语句：
  ``` sql
    // sql语句
    SELECT 
        (DATE_FORMAT(subDay, '%m-%d')) formatDay, COUNT(*) count
    FROM
        abnormal_online
    WHERE
        TO_DAYS(subDay) > (TO_DAYS(NOW()) - 20 )
    GROUP BY formatDay;
  ```

#### 1.2 优化echarts 图表标题位置调节及表格边距设置
  ```js
    option = {
      title: {
        text: '当日异常炉台',
        padding: [10, 10, 10, 10],
        x: 'center',
        y: 'top',
        textStyle: {
          // fontStyle: 'oblique',
          fontFamily: 'Courier New'
        }
      },
      grid: {
        show: true,
        containLable: true,
        left: '5%',
        right: '2%',
        top: '20%',
        bottom: '8%',
      }
    }
  ```

#### 1.3 优化当天0异常炉台片区处理
使用`arr.map()`方法代替传统for循环
  ``` js
    let puller = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2','E1', 'E2']
    if (res.slice(-1).zooms !== 'E2') {
      res.push({ zooms: 'E2', amount: 0 })
    }
    let yAxisArry = puller.map((element, index) => {
      if (element == res[index].zooms) {
        return res[index].amount
      } else {
        res.splice(index, 0, 'abc');
        return 0
      }
    }) 
  ```

## 2020-09-18
### 1. 异常炉台：新增异常炉台断线次数推移
#### 1.1 SQL语句
利用`replace()`函数代替想要统计的字符，然后用`length()`函数求得前后两次的差，得到`/`的次数，从而`+1`得到断线次数；
  ``` sql
    SELECT 
        SUM((LENGTH(abnormal) - LENGTH(REPLACE(abnormal, '/',     ''))) + 1) count,
        DATE_FORMAT(subDay, '%y-%m-%d') formatSubday
    FROM
        abnormal_online
    WHERE
        TO_DAYS(subDay) > (TO_DAYS(NOW()) - 20)
    GROUP BY formatSubday
    ORDER BY formatSubday
  ```
#### 1.2 对象解构的应用
在每次后台返回对象数组时，可以用对象解构快速获得相应属性的值：
  ``` js
    success: res => {
        let { status: status, message: message, data: data } = res
    }
  ```
##### 1.3 用正则表达式对异常点输入格式进行限定

  ``` js
    // 异常点必须采用/分割并且规定指定输入字符
    let abnormal = $("input[name='abnormal']");
    let p = $('.abnormal_note')
    abnormal.keyup(function() {
      const reg = /^(([f转]|\d*|fd)\/)+([f转]|\d+|fd){1}$/gi
      let result = $(this).val().match(reg);
      if (!result) {
        p.html('异常点只能输入数字、转、f或fd，并以/隔开！')
      } else {
        p.html('')
      }
    })
  ```



