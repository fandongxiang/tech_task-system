# 工艺管理系统每日更新

[TOC]

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
        $(this).val($(this).val().replace($(this).v(), $(this).val().substr     (0, 13)))
        $('.p-abCause').html('异常原因不能超过12符！')
      }
    }
    $('.abMeasure-limit').keyup(function() {
      $('.p-abMeasure').html('')
      if ($(this).val().length > 24) {
        $(this).val($(this).val().replace($(this).v(), $(this).val().substr     (0, 24)))
        $('.p-abMeasure').html('异常原因不能超过2字符！')
      }
    })
  ```

### 2. 数据库优化：规整数据库

#### 2.1 将原来`my_db_01`数据库中的`users`表格复制到`tech_task`总表中

1. 可以用数据库备份和导入的方式复制数据库；
2. 可以用以下`SQL`语句分三步实现数据库结构域内容的复制；

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

#### 1.1 SQL查询语句

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

## 2022-09-19

### 1. 异常炉台：新增异常原因分类

#### 1.1 异常原因按`调温`、`液口距`、`亮度`、`熔接`、`头部拉速`、`成晶差/频繁断提`、`设备（干泵/发白/籽晶/对中/晃动/发白/返气）`、`翻料`、`其它`分类

  ``` SQL
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
  ```

#### 1.2 echarts饼状图

  ``` js
    series: [{
      data: dataArr,
      type: 'pie',
      radius: '50%',
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 5)'
        }
      },
      label: {
        formatter: '{b|{b}：}{per|{d',
        backgroundColor: '#F6F8FC',
        borderColor: '#8C8D8E',
        borderWidth: 1,
        borderRadius: 4,
        rich: {
          a: {
            color: '#6E7079',
            lineHeight: 22,
            align: 'center'
          },
          hr: {
            borderColor: '#8C8D8E',
            width: '100%',
            borderWidth: 1,
            height: 0
          },
          b: {
            color: '#4C5058',
            fontSize: 14,
            fontWeight: 'bold',
            lineHeight: 33
          },
          per: {
            color: '#fff',
            backgroundColor: '#4C5058',
            padding: [3, 4],
            borderRadius: 4
          }
        }
      },
    }]
  ```

## 2022-09-27

### 1. 工艺参数


#### 1.1 工艺参数提交页

1. **总版面固定边距**：`div#page`控制总内容的边距；
2. **可输入单元格**：为`td`单元格添加`contenteditable="true"`属性实现可输入单元格；
3. **请求模块化**：独立成函数，方便后续结构修改；
   a. 合同请求(`getContractMessage()`);
   b. 参数请求(`getSubmitMessage()`);
   c. 对比功能(`compareArgumets()`)
4. **请求渲染顺序**：
   a. 合同请求`ajax:success`函数中嵌套参数请求顺序;
   b. 参数请求`ajax:success`函数中嵌套参数对比函数（因为success后才能获取合同、提交说明）；
5. **页面首次渲染**：获取`zoom`默认片区，传入`getContract()`函数渲染；
6. **下拉选择渲染**：采用`change`事件，自动渲染，不用点击查询；
7. **默认参数渲染**：
   a. 选择片区无合同或新建合同后，渲染数据库`init`默认参数，方便提交；
   b. 选择片区后有合同，渲染该合同最近一次提交参数；
8. **历史提交渲染**：片区选择后，渲染该片区所有历史提交参数信息；
9.  **参数提交功能**：为每列参数添加类名，遍历获取值`push`进数组，加入以参数名为键的对象数组中，然后传入后端；
10. **提交说明限制**：
  a. 为提交说明`input`添加`blur`事件，实现失去焦点后发起`ajax`请求获取数据库同区同合同提交说明;
  b. 然后通过`some()`与当前值对比，存在则`alert()`和清空输入框；

## 2022-09-28

### 1.工艺参数

#### 1.1 工艺参数历史提交区参数删除

1. 数据库新增`status`列，默认状态为`0`，删除时不真正删除，将值置为`1`；

#### 1.2 工艺参数首页

1. **删除合同新增功能**：删除合同新增函数和下拉“请新增”选项；
2. **新增提交说明渲染**：
  a. 根据片区、合同`group by`提交说明;
  b. 提交说明由`input`改为`select`下拉；
3. **请求渲染顺序**：因为success后才能获取合同、提交说明
   a. 合同请求`ajax:success`中嵌套提交说明请求;
   b. 提交说明请求`ajax:success`中嵌套参数请求顺序;
   c. 参数请求`ajax:success`中嵌套参数对比；
4. **参数渲染**：参数渲染sql没有参数时不渲染默认`init`参数，直接渲染为空；
5. **自动对比参数**：`foreach`嵌套遍历当前和对比参数，且必须放在参数渲染成功后；
6. **功率-拉速对比曲线图**；未完成

## 2022-10-14

### 1. 网站布局之公共头部

1. 完成抽离网站公共电脑头部`header-computer.html`,在页面添加`<div>header</div>`通过`$('#header').load(..)`导入；
2. 导入后`baseAPI.js`中统一拦截函数`complete`报错`res.responseJSON.status`报错`status is undefined`，原因为`load`发起的`ajax`请求中无`res.respnseJSON`对象，添加判断条件解决；
3. 关于前后端拦截：后端通过`joi`全局中间件，前端通过后端拦截返回的`res.cc('身份验证失败')`拦截；

## 2022-10-15

### 1. 参数管理

1. CSS布局优化：解决公共头部导入后，自动使用`bootstrap.css`样式问题（待解决）；

## 2022-10-17 

### 1. 参数管理

### 1.1 自动生成参数长度-拉速-功率曲线：

1. 遍历参数元素获取参数数组：封装成函数；
   
    ``` js
      function getArgumentsArr(element, arr) {
        $(`.${element}`).each((index, ele) => arr.push(parseFloat(ele.innerHTML)))   // string 类型 转为 数值
      }
    ```

2. 求得对比和当前参数长度并集，通过`Set()`数据类型；
   
   ``` js
    let unionLength = [...new Set([...currentLengthArr, ...compareLengthArr])].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
   ```

3. 该参数存在某长度，使用该参数拉速、功率；不存在某长度Ln，Pn=（Pn+1 - Pn-1）/（Ln+1 - Ln-1）* (Ln - Ln-1)；

  ``` js
    function getNewValue(unionLength, currentLength, currentXXX, index) {
      return Math.floor(((currentXXX[index] - currentXXX[index - 1]) / (currentLength[index] - currentLength[index - 1]) * (unionLength[index] - currentLength[index - 1]) + currentXXX[index - 1]) * 10) / 10
    }
  ```

4. 遍历`unionLength`，不存在某长度后调用3中处理函数，并将新长度和新值`splice`进数组中。

  ``` js
    unionLength.forEach((ele, index,arr) => {
      if (currentLengthArr.indexOf(ele) == -1) {
        let newCurrentHeat = getNewValue(arr, currentLengthArr, currentHeatsArr, index);
        let newCurrentSlspeed = getNewValue(arr, currentLengthArr, currentSlspeed, index);
        let newCurrentSeedRotation = getNewValue(arr, currentLengthArr, currentSeedRotation, index);
        let newCurrentCruRotation = getNewValue(arr, currentLengthArr, currentCruRotation, index);
        currentLengthArr.splice(index, 0, ele)
        currentHeatsArr.splice(index, 0, newCurrentHeat)
        currentSlspeed.splice(index, 0, newCurrentSlspeed)
        currentSeedRotation.splice(index, 0, newCurrentSeedRotation)
        currentCruRotation.splice(index, 0, newCurrentCruRotation)
      }
      if (compareLengthArr.indexOf(ele) == -1) {
        let newCompareHeat = getNewValue(arr, compareLengthArr, compareHeatsArr, index);
        let newCompareSlspeed = getNewValue(arr, compareLengthArr, compareSlspeed, index);
        let newCompareSeedRotation = getNewValue(arr, compareLengthArr, compareSeedRotation, index);
        let newCompareCruRotation = getNewValue(arr, compareLengthArr, compareCruRotation, index);
        compareLengthArr.splice(index, 0, ele)
        compareHeatsArr.splice(index, 0, newCompareHeat)
        compareSlspeed.splice(index, 0, newCompareSlspeed)
        compareSeedRotation.splice(index, 0, newCompareSeedRotation)
        compareCruRotation.splice(index, 0, newCompareCruRotation)
      }
    })
  ```

5. `echart`相关图表配置：

    ``` js
      <!-- 调整图表区边距 -->
        grid: {
        left: '6 %',
        right: '13 %',
        top: '12 %',
        bottom: '8 %'
        }

      <!-- 次坐标轴 yAxisIndex 自动与 yAxis顺序对应-->
        series: [{
          name: '当前晶转',
          type: 'line',
          yAxisIndex: 0,
          data: currentSeedRotation,
          label: {
            show: true,
            position: 'top',
          }
        ]

        <!-- y 坐标轴线显示 -->
        yAxis: [{
          name: '晶转(rpm)',
          nameLocation: 'center',
          type: 'value',
          // y 轴线显示
          axisLine: {
            show: true,
          }
        ]

        <!-- 网格线：  splitLine -->
        yAxis: [{
          name: '晶转(rpm)',
          nameLocation: 'center',
          type: 'value',
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: '#55b9b4'
            }
          }
        ]

        <!-- 强制x坐标值与刻度对齐 及 x -->
        xAxis: {
          type: 'category',
          data: unionLength,
          axisTick: {
            // 强制坐标值与刻度对齐
            alignWithLabel: true,
          },
          // x 轴线与网格线对齐
          boundaryGap: false,
        }
        
        <!-- y 轴分割 -->
          yAxis: [{
              name: '晶转(rpm)',
              nameLocation: 'center',
              nameGap: 30,
              type: 'value',
              min: 7,
              max: 12,
              // y 轴分割段数
              splitNumber: 10,
            }
          ]
    ```