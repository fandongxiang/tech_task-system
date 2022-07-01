$(function() {
  // 登录注册切换
  $('#reg').on('click',() => {
    $('.login').hide()
    $('.reg').show()
  })
  
  $('#login').on('click',() => {
    $('.login').show()
    $('.reg').hide()
  })
  // 前端验证
  // 发起登录请求
  $('#login-form').submit(function(e) {
    e.preventDefault()
    $.ajax({
      type: 'POST',
      url: '/api/login',
      data: $(this).serialize(),
      success: function(res) {
        if (res.status !== 0) {
          return alert('登录失败！')
        }

        // 跳转到后台主页
        location.href = './index.html'

        // 将 token 存储在本地 localStorage 中
        localStorage.setItem('token',res.token) 
      }
    })
  })
  // 发起注册请求
  $('#reg-form').submit(function (e) {
    e.preventDefault()
    // 密码输入不一致，待改进
    if ( $('#reg-password').val() !== $('#con-password').val()) {
      return alert('两次输入密码不一致！')
    }
    const data = {username:$('#reg-username').val(),password:$('#reg-password').val()}
    $.ajax({
      type: 'POST',
      url: '/api/reguser',
      data: data,
      success: function(res) {
        if (res.status != 0) {
          return alert(res.message)    // 事件冒泡会 alert 两次，后续改为 bootstrap 弹窗
        }
        alert('注册成功！请重新登录')
      }
    })
  })
})

