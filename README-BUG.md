# BUG集锦

[TOC]

## 1. 异常炉台提交更新时报错“更新炉台失败"

### 1.1 排除方法

在api_server-router_handler-tech_ab_online.js中将res.(err)报错信息改为console.log(err)打印到控制台

    ``` js
      db.query(dataStr, [arr], (err, results) => {
        if (err) return console.log(err);
        // res.cc(err);
        if (results.affectedRows == 0) return console.log   (err);
        // res.cc('插入失败')
        res.cc('更新成功！', status = 0)
      })
    ```

### 1.2 错误信息

    ``` js
      sqlMessage: "Incorrect integer value:   'undefinedfocolumn  'id' at row 1"；
      code: "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD"
    ```
  
### 1.3 原因

优化炉号单元格宽度时，将绑定id的单元格的类名`idclass`添加到了炉号单元格上，导致`id`遍历查找错误，报错`undefined`，数据库无法识别；

### 1.4 解决方法

将炉号的类名`idclass`删除；

    ``` html
    {{if $value.puller
        < 10}} {{if $value.state !='等径' }} <td class="tdd bg-danger">{{$value.zoom}}0{{$value.puller}}</td>
          {{else}}
          <td class="bg-success">{{$value.zoom}}0{{$valu  .puller}}</td>
          {{/if}} {{else if $value.puller >= 10}} {{i  $value.state != '等径'}}
          <td class="bg-danger">{{$value.zoom}}{{$valu  .puller}}</td>
          {{else}}
          <td class="bg-success">{{$value.zoom}}{{$valu .puller}}</td>
          {{/if}} {{/if}}
          <!-- 分类 -->
          <td class="idclass" data-id="{{$value.id}}  >{{$value.sort}}</td>
    ```

## 2. 优化当日异常炉台柱状图0异常炉台片区时报错

### 2.1 排除方法

打开浏览器控制台，查看报错信息。

### 2.2 报错信息

    ``` js
      tech_abnormal_online.js:159 Uncaught TypeError: Cannot  read property 'zooms' of undefined
      at tech_abnormal_online.js:159
      at Array.map (<anonymous>)
      at Object.success (tech_abnormal_online.js:158)
      at c (JQuery.js:2)
      at Object.fireWith [as resolveWith] (JQuery.js:2)
      at l (JQuery.js:2)
      at XMLHttpRequest.<anonymous> (JQuery.js:2)
    ```

### 2.3 原因

`E2`片区正好为`0`异常炉台片区，循环到`res[9].zooms`报错`zooms`未定义；

### 2.4 解决方法

先用`res.slice(-1).zooms`判断结果数组最后一个元素是不是`E2`片区，没有则添加一个对象；

    ```js
      let puller = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2',   'D1', 'D2''E1', 'E2']
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

## 3. clearfix类无法清除浮动

### 3.1 排除方法

重新查找学习clearfix类的方法

### 3.2 报错信息

无法正确清除

    ``` html
      <div style="float: left"></div>
      <div style="float: right" class="clearfix"></div>
      <div></div>
    ```

### 3.3 原因

两个子div采用浮动并列排列，必须用一个父div包裹起来，然后给父div添加`class="clearfix"`类。

### 3.4 解决方法

用一个父div将两个子div包裹，然后给父div添加`class="clearfix"`类。

    ``` html
      <div class="clearfix">
        <div style="float: left"></div>
        <div style="float: right" class="clearfix"></div>
      </div>
      <div></div>
    ```

## 4. 参数提交bug

### 1. 通过给单元格添加`blur`事件后获取`$(this).index()`获取到的`index`始终为`1`，原因是`index`是在当前父元素中的下标，而不是在该类里面的下标；

### 2. 箭头函数没有this

  ``` js
     $('.length').blur(function() {
    console.log($(this).attr('data-length'));
    $('.compare_length').each(() => {
        console.log($(this).html());
  ```

## 5. Uncaught TypeError: Cannot read properties of undefined (reading 'status')

### 5.1 报错原因

导入公共复用页面`header-computer.html`时使用`jquery.load()`方法，该方法返回对象中无`res.responseJSON`对象，经过`base-API.js`中统一拦截函数时，导致产生`res.responseJSON。status`报错。

  ``` js
    $('#header').load('/home/public/header-computer.html')
  ```

### 5.2 解决方法

为使用`load`方法，在统一拦截函数中加入判断是否存在`res.responseJSON`条件。

  ``` js
  // 全局统一挂载 complete ，实现权限拦截
    options.complete = function(res) {
      // 解决 Jquery.load 无 responseJSON 方法
      if (res.responseJSON != undefined) {
        // 通过 res.responseJSON.status 拿到服务器响应回来的数据
        if (res.responseJSON.status === 1 && res.responseJSON.  message == '身份认证失败！') {
          // 1。 强制清空 token
          localStorage.removeItem('token')
            // 2. 强制跳转到登陆页面
          location.href = '/login.html'
        }
      }
    }
  ```

> **注意**：统一拦截函数中拦截的是`Node`中错误级别中间件返回的`if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')`，而不是每次路由函数中`res.send()`中的返回值。即使每次node函数中没有返回相关`status`值，但都存在`res.responseJSON`对象，所以`res.responseJSON.status`只会报`undefined`而不会报错。