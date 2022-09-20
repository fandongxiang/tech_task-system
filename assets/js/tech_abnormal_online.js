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
        getdayAbnor()
        getAbnorCount()
        getweekAbnor()
        getAbnorCause()
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
        getdayAbnor()
        getAbnorCount()
        getweekAbnor()
        getAbnorCause()
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
        getdayAbnor()
        getAbnorCount()
        getweekAbnor()
        alert('更新成功！')
      }
    })
  })

  // 当日分片区异常炉台展示
  function getdayAbnor() {
    $.ajax({
      type: 'GET',
      url: '/tech/dayAbnor',
      headers: { Authorization: localStorage.getItem('token') || '' },
      success: function(res) {
        // y轴数据处理
        // let yAxisArry = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2']
        //   // 遍历查找片区赋值
        // for (var i = 0; i < yAxisArry.length; i++) {
        //   var k = 0;
        //   for (var j = 0; j < res.length; j++) {
        //     if (yAxisArry[i] == res[j].zooms) {
        //       k++;
        //       yAxisArry[i] = res[j].amount
        //     }
        //   }
        //   if (k == 0) {
        //     yAxisArry[i] = 0;
        //   }
        // }

        // 处理0异常炉台片区
        let puller = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2']
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

        // echarts 图表渲染
        var chartDom = document.getElementById('dayAbnor');
        var myChart = echarts.init(chartDom);
        var option;

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
                // { type: 'max', name: '最大值' },
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
  getdayAbnor()

  // 近n天异常炉台推移
  function getweekAbnor() {
    $.ajax({
      type: 'GET',
      url: '/tech/getweekAbnor',
      headers: { Authorization: localStorage.getItem('token') || '' },
      success: function(res) {
        let xAxisArry = [];
        let yAxisArry = [];
        res.forEach(element => {
          xAxisArry.push(element.formatDay);
          yAxisArry.push(element.count);
        });
        const chartDom = document.querySelector('#weekAbnor');
        const myChart = echarts.init(chartDom);

        let option = {
          title: {
            text: '车间异常炉台推移',
            padding: [10, 10, 10, 10],
            x: 'center',
            y: 'top',
            textStyle: {
              // fontStyle: 'oblique',
              fontFamily: '微软雅黑'
            }
          },
          grid: {
            show: true,
            containLable: true,
            left: '4%',
            right: '0',
            top: '20%',
            bottom: '8%',

          },
          xAxis: {
            type: 'category',
            data: xAxisArry
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
                { type: 'min', name: '最小值' }
              ]
            },
            label: {
              show: true
            }
          }]
        };

        myChart.setOption(option);

      }
    })
  }
  getweekAbnor();

  // 近n天异常炉台断线贡献数推移
  function getAbnorCount(params) {
    $.ajax({
      type: 'GET',
      url: '/tech/getAbnorCount',
      headers: { Authorization: localStorage.getItem('token' || '') },
      success: res => {
        let { status: status, message: message, data: data } = res;
        if (status != 0) return alert('获取车间异常炉台断线次数失败！');
        let xAxisArry = [];
        let yAxisArry = [];
        data.forEach(element => {
          xAxisArry.push(element.formatSubday);
          yAxisArry.push(element.count)
        });
        console.log(yAxisArry);
        const chartDom = document.querySelector('#abnorCount');
        const myChart = echarts.init(chartDom);
        let option = {
          title: {
            text: '车间异常炉台断线贡献数',
            padding: [10, 10, 10, 10],
            x: 'center',
            y: 'top',
            textStyle: {
              fontFamily: '微软雅黑'
            }
          },
          grid: {
            show: true,
            containLable: true,
            left: '4%',
            right: '0',
            top: '20%',
            bottom: '8%',
          },
          xAxis: {
            type: 'category',
            data: xAxisArry
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
                { type: 'min', name: '最小值' }
              ]
            },
            label: {
              show: true
            }
          }]
        };
        myChart.setOption(option);
      }
    })
  }
  getAbnorCount()

  // 近n天异常原因分类
  function getAbnorCause() {
    $.ajax({
      type: 'GET',
      url: '/tech/getAbnorCause',
      headers: { Authorization: localStorage.getItem('token' || '') },
      success: (res) => {
        let { status: status, message: message, data: data } = res;
        if (status !== 0) return alert(message);
        console.log(data);
        let dataArr = [];
        data.forEach(element => {
          dataArr.push({ value: element.count, name: element.abCause_new })
        })
        console.log(dataArr);
        const chartDom = document.querySelector('#abnorCauseSort');
        const myChart = echarts.init(chartDom);
        let option = {
          title: {
            text: '车间异常炉台原因分类',
            padding: [10, 10, 10, 10],
            x: 'center',
            y: 'top',
            textStyle: {
              fontFamily: '微软雅黑'
            }
          },
          grid: {
            show: true,
            containLable: true,
            left: '0%',
            right: '0%',
            top: '10%',
            bottom: '0%',
          },
          // legend: {
          //   orient: 'vertical',
          //   // left: 'top',
          //   // top: 'top'
          //   x: 'right',
          //   y: 'bottom'
          // },
          series: [{
            data: dataArr,
            type: 'pie',
            radius: '50%',
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: '{b|{b}：}{per|{d}%}  ',
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
        };
        myChart.setOption(option);
      }
    })
  }
  getAbnorCause()

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
})