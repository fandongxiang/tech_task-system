$(function() {
  // 表格中 input与td 宽度自适应
  $('.test').bind('input propertychange', function() {
    var $this = $(this);
    var text_length = $this.val().length; //获取当前文本框的长度
    var current_width = parseInt(text_length) * 14; //该16是改变前的宽度除以当前字符串的长度,算出每个字符的长度
    console.log(current_width);
    $this.css("width", current_width + "px");
  });

  // 渲染当前登录人提交炉台信息
  // 注意：模板引擎渲染出来的数据 不能包含 - 格式数据
  function getMyPuller() {
    $.ajax({
      type: 'GET',
      url: '/tech/abnor',
      headers: { Authorization: localStorage.getItem('token') || '' },
      success: function(res) {
        // if (!res.status == 0) return console.log(res);
        const pullerinfo = res['data']
        const dataStr = template('getMyinfo', { data: pullerinfo })
        $('#preview').html(dataStr) // 注意：这里不能写 append
      }
    })
  }
  getMyPuller()

  // 提交炉台信息请求
  $('.form').submit(function(e) {
    e.preventDefault()
    var data = $(this).serialize()
    $.ajax({
      type: 'POST',
      headers: { Authorization: localStorage.getItem('token') || '' },
      url: '/tech/subabnor',
      data: data,
      success: function(res) {
        // 注意：要实现提交后渲染请求，必须在 success 里面调用
        getMyPuller()
        getAllinfo()
        dayAbnor()
          // 提交成功后清空表单
        if (res.status !== 0) return alert(res.message)
        let zoom_value = $('#select').val()
        $('.form')[0].reset()
        return $('#select').val(zoom_value)
      }
    })
  })

  // 删除预览信息区域炉台
  $('#preview').on('click', '.del', function() {
    var id = $(this).attr('data-id')
    $.ajax({
      type: 'GET',
      url: '/tech/delabnor',
      data: { id: id },
      headers: { Authorization: localStorage.getItem('token') || '' },
      success: function(res) {
        getMyPuller()
        getAllinfo()
        dayAbnor()
        alert('删除成功！')
      }
    })
  })

  // 获取完整炉台信息请求
  function getAllinfo() {
    $.ajax({
      type: 'GET',
      url: '/tech/getAllabnor',
      headers: { Authorization: localStorage.getItem('token') || '' },
      success: function(res) {
        if (res['status'] !== 0) return alert('获取炉台信息失败！')
        const pullerinfo = res['data']
        console.log(pullerinfo);
        // 根据提交时间自动更新运行时间
        // for (let i = 0; i < pullerinfo.length; i++) {
        //   let time = countDown(pullerinfo[i].subDay) + pullerinfo[i].runtime
        //   pullerinfo[i].time = time
        // }
        // 根据提交时间自动更新运行时间（map方法）
        let newPullerArr = pullerinfo.map(Element => {
            let time = countDown(Element.subDay) + Element.runtime
            Element.time = time;
            return Element;
          })
          // 定义计算倒计时的函数
        function countDown(subDay) {
          const nowTime = +new Date();
          const subtime = +new Date(subDay)
          const times = (nowTime - subtime) / 1000;
          let h = parseInt(times / 60 / 60 % 24)
          return h
        }

        const dataStr = template('getAllinfo', { data: newPullerArr })
        $('#allinfo').html(dataStr)
      }
    })
  }
  getAllinfo()

  // 更新炉台的请求
  // 此处表单与表格嵌套 + 表单id不符 折腾 1h
  $('.upinfo').submit(function(e) {
    e.preventDefault()
    var data = $(this).serialize()
      // 遍历获取 id 拼接成字符串
    var idStr = ''
    $('.idclass').each(function(index, domEle) {
        idStr += '&' + 'id=' + $(domEle).attr('data-id')
      })
      // 注意：node 后台只能解析一次 string 
    var data = data + idStr
    $.ajax({
      type: 'POST',
      url: '/tech/updateAbnorOnline',
      headers: { Authorization: localStorage.getItem('token') || '' },
      data: data,
      success: function(res) {
        if (res['status'] !== 0) return alert('更新炉台信息失败！')
        getMyPuller()
        getAllinfo()
        alert('更新成功！')
      }
    })
  })

  // 当日分片区异常炉台展示
  function dayAbnor() {
    $.ajax({
      type: 'GET',
      url: '/tech/dayAbnor',
      headers: { Authorization: localStorage.getItem('token') || '' },
      success: function(res) {
        const yAxisArry = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2']
          // 遍历查找片区赋值
        for (var i = 0; i < yAxisArry.length; i++) {
          var k = 0;
          for (var j = 0; j < res.length; j++) {
            if (yAxisArry[i] == res[j].zooms) {
              k++;
              yAxisArry[i] = res[j].amount
            }
          }
          if (k == 0) {
            yAxisArry[i] = 0;
          }
        }
        // echarts 图表渲染
        var chartDom = document.getElementById('dayAbnor');
        var myChart = echarts.init(chartDom);
        var option;

        option = {
          title: {
            text: '当日异常炉台',
            x: 'center',
            y: 'top',
            textStyle: {
              fontStyle: 'oblique',
              fontFamily: 'Courier New'
            }
          },
          grid: {
            show: true,
            // backgroundColor: 'rgb(128, 128, 128)'
          },
          // tooltip: {
          //   show: true,
          //   trigger: 'item'
          // },
          toolbox: {
            show: true,
            feature: {

            }
          },
          xAxis: {
            type: 'category',
            data: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2']
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: yAxisArry,
            type: 'bar',
            markPoint: {
              data: [
                { type: 'max', name: '最大值' },
                // { type: 'min', name: '最小值' }
              ]
            },
            label: {
              show: true
            },
          }]
        };
        myChart.setOption(option);
      }
    })
  }
  // 调用当日分片区异常炉台函数
  dayAbnor()

  // 根据提交人负责片区自动选择片区
  $.ajax({
    type: 'GET',
    url: '/my/userinfo',
    // headers 就是请求头配置文件
    headers: { Authorization: localStorage.getItem('token') || '' },
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

  // 限制输入内容
  $('.abCause-limit').keyup(function() {
    $('.p-abCause').html('')
    if ($(this).val().length > 13) {
      $(this).val($(this).val().replace($(this).val(), $(this).val().substr(0, 13)))
      $('.p-abCause').html('异常原因不能超过12个字符！')
    }
  })

  $('.abMeasure-limit').keyup(function() {
    $('.p-abMeasure').html('')
    if ($(this).val().length > 24) {
      $(this).val($(this).val().replace($(this).val(), $(this).val().substr(0, 24)))
      $('.p-abMeasure').html('异常原因不能超过24个字符！')
    }
  })
})