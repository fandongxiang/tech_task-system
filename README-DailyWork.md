# 每日工作

## 2022-9-14

1. **异常炉台** ：优化按片区负责人负责片区自动锁定下拉片区

    （1）根据登录人自动选择片区（*代码写死，优化后台入*）；

      ``` js
        $.ajax({
          type: 'GET',
          url: '/my/userinfo',
          // headers 就是请求头配置文件
          headers: { Authorization: localStorage.getItem            ('token') || '' },
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

    （2）提交后片区下拉菜单保留上次选择的片区；

      ``` js
        let zoom_value = $('#select').val()
        $('.form')[0].reset()
        return $('#select').val(zoom_value)
      ```

2. **数据库优化**：规整数据库
     (1) 将原来`my_db_01`数据库中的`users`表格复制到`tech_task`总表中；

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

3. 其它
