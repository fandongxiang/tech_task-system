$(function() {
  // 导入公共头部
  $('#header').load('/home/public/header-computer.html')

  $('label').click(function() {
    $('.event_year>li').removeClass('current');
    $(this).parent('li').addClass('current');
    var year = $(this).attr('for');
    $('#' + year).parent().prevAll('div').slideUp(800);
    $('#' + year).parent().slideDown(800).nextAll('div').slideDown(800);
  });
  // 格式化渲染函数
  function formatFn(res, year) {
    let arr = [];
    const info = res.message
    const selectYear = '' + year
    for (var i = 0; i < info.length; i++) {
      switch (info[i].subDay.substr(0, 4)) {
        case selectYear:
          arr.push(info[i])
          break;
      }
    }
    formatDate(arr)
      // 格式化日期格式不了，用字符串截取函数
    function getDate(string) {
      const m = string.substr(5, 2)
      const d = (parseInt(string.substr(8, 2)) + 1) < 10 ? '0' + (parseInt(string.substr(8, 2)) + 1) : (parseInt(string.substr(8, 2)) + 1)
      return m + '月' + d + '日'
    }

    function formatDate(info) {
      for (var i = 0; i < info.length; i++) {
        info[i].subDay = getDate(info[i].subDay)
      }
    }
    const tid = 'timeline-' + year
    const eid = '#zoominfo-' + year
    const data = template(tid, {
      data: arr
    })
    $(eid).html(data)
  }

  // 渲染 2022 年首页
  function getAllzoom2022() {
    $.ajax({
      type: 'GET',
      url: '/tech/timeline/getAllzooms',
      headers: {
        Authorization: localStorage.getItem('token') || ''
      },
      success: function(res) {
        formatFn(res, 2022)
      }
    })
  }
  getAllzoom2022()

  // 渲染 2021 年首页数据
  function getAllzoom2021() {
    $.ajax({
      type: 'GET',
      url: '/tech/timeline/getAllzooms',
      headers: {
        Authorization: localStorage.getItem('token') || ''
      },
      success: function(res) {
        formatFn(res, 2021)
      }
    })
  }
  getAllzoom2021()

  // 渲染 2020 年首页数据
  function getAllzoom2020() {
    $.ajax({
      type: 'GET',
      url: '/tech/timeline/getAllzooms',
      headers: {
        Authorization: localStorage.getItem('token') || ''
      },
      success: function(res) {
        formatFn(res, 2020)
      }
    })
  }
  getAllzoom2020()

  // 渲染 2021 年首页数据
  function getAllzoom2019() {
    $.ajax({
      type: 'GET',
      url: '/tech/timeline/getAllzooms',
      headers: {
        Authorization: localStorage.getItem('token') || ''
      },
      success: function(res) {
        formatFn(res, 2019)
      }
    })
  }
  getAllzoom2019()

  // 筛选 2022 年数据
  $('#select').submit(function(e) {
    e.preventDefault()
    console.log($('#select').serialize());
    const data = $('#select').serialize()
    $.ajax({
      type: 'POST',
      url: '/tech/timeline/getOnezoom',
      headers: {
        Authorization: localStorage.getItem('token') || ''
      },
      data: data,
      success: function(res) {
        formatFn(res, 2022)
        console.log(res);
      }
    })
  })

  // 筛选 2021 年数据
  $('#select').submit(function(e) {
    e.preventDefault()
    console.log($('#select').serialize());
    const data = $('#select').serialize()
    $.ajax({
      type: 'POST',
      url: '/tech/timeline/getOnezoom',
      headers: {
        Authorization: localStorage.getItem('token') || ''
      },
      data: data,
      success: function(res) {
        formatFn(res, 2021)
      }
    })
  })

  // 筛选 2020 年数据
  $('#select').submit(function(e) {
    e.preventDefault()
    console.log($('#select').serialize());
    const data = $('#select').serialize()
    $.ajax({
      type: 'POST',
      url: '/tech/timeline/getOnezoom',
      headers: {
        Authorization: localStorage.getItem('token') || ''
      },
      data: data,
      success: function(res) {
        formatFn(res, 2020)
      }
    })
  })

  // 筛选 2019 年数据
  $('#select').submit(function(e) {
    e.preventDefault()
    console.log($('#select').serialize());
    const data = $('#select').serialize()
    $.ajax({
      type: 'POST',
      url: '/tech/timeline/getOnezoom',
      headers: {
        Authorization: localStorage.getItem('token') || ''
      },
      data: data,
      success: function(res) {
        formatFn(res, 2019)
      }
    })
  })

});