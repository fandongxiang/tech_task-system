// 添加 url 前置函数，每次调用$.get() $.post() $.ajax() 都会先调用这个
$.ajaxPrefilter(function(options) {
  options.url = 'http://10.4.5.90:3008' + options.url // 此处不能写本地 127.0.0.1 不然手机端访问不到，公司电脑ip
    // options.url = 'http://192.168.1.14:3008' + options.url
    // options.url = 'http://192.168.43.7:3008' + options.url // 家中 IP

  // 全局统一挂载 complete ，实现权限拦截
  options.complete = function(res) {
    // 解决 Jquery.load 无 responseJSON 方法
    if (res.responseJSON != undefined) {
      // 通过 res.responseJSON.status 拿到服务器响应回来的数据
      if (res.responseJSON.status === 1 && res.responseJSON.message == '身份认证失败！') {
        // 1。 强制清空 token
        localStorage.removeItem('token')
          // 2. 强制跳转到登陆页面
        location.href = '/login.html'
      }
    }
  }
})