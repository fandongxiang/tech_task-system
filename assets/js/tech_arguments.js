$(function() {
  // 导入公共头部文件
  $('#header').load('/home/public/header-computer.html')

  // 前往提交页面按钮
  let createButton = document.querySelector('#create_button')
  createButton.addEventListener('click', function() {
    window.open('../tech/tech_arguments_submit.html')
  })

  // 参数渲染公共函数
  function getPublicPreview(current) {
    // 首次渲染
    let zoom = `#${current}_zoom`
    let contract = `#${current}_contract`
    let type = `#${current}_type`
    let discription = `#${current}_discription`
      // 首次合同预渲染参数
    let zoomMessage = {
        zoom: $(zoom).val()
      }
      // 首次提交说明渲染参数
    let contractMessage = {
        zoom: $(zoom).val(),
        contract: $(contract).val()
      }
      // 首次提交参数渲染参数
    let discriptionMessage = {
      zoom: $(zoom).val(),
      contract: $(contract).val(),
      type: $(type).val(),
      discription: $(discription).val()
    }
    getContractAjax(zoomMessage, `${current}`);
    // getHistorySubmit(zoomMessage);

    // 注意：change 时要重新赋值片区、合同、提交说明
    // 片区选择后渲染
    $(zoom).on('change', function() {
      // 合同渲染 + 参数渲染
      // 注意：这里 参数渲染 必须写在 合同渲染ajax成功函数里，不然得不到参数
      zoomMessage.zoom = $(this).val();
      // 调用合同渲染函数
      getContractAjax(zoomMessage, `${current}`);
      // 调用历史提交区渲染函数
      // getHistorySubmit(zoomMessage);
    })

    // 合同选择后渲染
    $(contract).on('change', function() {
      contractMessage.zoom = $(`#${current}_zoom`).val()
      contractMessage.contract = $(this).val()
      getPublicDiscriptionAjax(contractMessage, `${current}`)
    })

    // 提交说明选择后渲染
    $(discription).on('change', function() {
      discriptionMessage.zoom = $(`#${current}_zoom`).val()
      discriptionMessage.contract = $(`#${current}_contract`).val()
      discriptionMessage.discription = $(this).val()
      getPublicPreviewAjax(discriptionMessage, `${current}`)
    })

    // // 参数类型选择后渲染
    // $(type).on('change', function() {
    //   submitMessage.type = $(this).val()
    //   getPublicPreviewAjax(submitMessage, `${current}`)
    // })
  }
  getPublicPreview('current')
  getPublicPreview('compare')

  // 合同渲染 ajax请求函数
  function getContractAjax(zoomMessage, current) {
    $.ajax({
      type: 'POST',
      url: '/tech/arguments/getContract',
      headers: {
        Authorization: localStorage.getItem('token') || ''
      },
      data: zoomMessage,
      success: (res) => {
        let {
          status,
          message,
          data
        } = res;
        if (status != 0) return alert('合同获取失败！');
        // 合同渲染
        const dataStr_contract = template('public_Contract', {
          data: data
        });
        $(`#${current}_contract`).html(dataStr_contract)

        // 调用 提交说明渲染函数
        let zoom = `#${current}_zoom`
        let contract = `#${current}_contract`
        let contractMessage = {
          zoom: $(zoom).val(),
          contract: $(contract).val(),
        }
        getPublicDiscriptionAjax(contractMessage, `${current}`)
      }
    })
  }

  // 提交说明 ajax请求函数
  function getPublicDiscriptionAjax(contractMessage, current) {
    $.ajax({
      type: 'POST',
      url: '/tech/arguments/getPublicDiscription',
      headers: { Authorization: localStorage.getItem('token') || '' },
      data: contractMessage,
      success: (res) => {
        let {
          status,
          message,
          data
        } = res;
        if (status != 0) return alert('提交说明获取失败！');
        // 合同渲染
        const dataStr_discription = template('public_Discription', {
          data: data
        });
        $(`#${current}_discription`).html(dataStr_discription)

        // 调用 参数渲染getSubmitAjax()
        let zoom = `#${current}_zoom`
        let contract = `#${current}_contract`
        let type = `#${current}_type`
        let discription = `#${current}_discription`
        let discriptionMessage = {
          zoom: $(zoom).val(),
          contract: $(contract).val(),
          type: $(type).val(),
          discription: $(discription).val()
        }
        getPublicPreviewAjax(discriptionMessage, `${current}`)
      }
    })
  }

  // 参数渲染 ajax请求函数
  function getPublicPreviewAjax(discriptionMessage, current) {
    $.ajax({
      type: 'POST',
      url: '/tech/arguments/getPublicPreview',
      headers: {
        Authorization: localStorage.getItem('token') || ''
      },
      data: discriptionMessage,
      success: (res) => {
        let {
          status,
          message,
          data
        } = res
        if (status !== 0) return alert("获取提交预览区信息失败！");
        if (data.length == 0) {
          // 清空表格
          $(`#${current}_tbody`).html('')
        } else {
          // 添加表格id
          for (let i = 0; i < data.length; i++) {
            data[i].newId = i + 1;
          }
          let dataStr_preview = template(`${current}_Preview`, {
            data: data
          });
          $(`#${current}_tbody`).html(dataStr_preview);
          compareHeaterAndSlspeed()
        }
        // 调用对比函数
        compareArguments('length');
        compareArguments('seedRotation');
        compareArguments('cruRotation');
        compareArguments('mainHeater');
        compareArguments('slSpeed');
        compareArguments('meltLevel');
        compareArguments('argonFlow');
        compareArguments('controlTime');
        compareArguments('controlRate');
      }
    })
  }

  // 对比 提交区和预览区参数函数
  function compareArguments(str) {
    let ele = `.${str}`;
    let compare_ele = `.compare_${str}`;
    let ele_data = `data-newId`;
    $(ele).each(function() {
      let id = $(this).attr(ele_data);
      let value = $(this).html();
      let $length = $(this);
      $(compare_ele).each(function() {
        let compare_id = $(this).attr(ele_data);
        let compare_value = $(this).html();
        if (id == compare_id && value != compare_value) {
          $(this).css('backgroundColor', 'red')
          $length.css('backgroundColor', 'green')
        } else if (id == compare_id && value == compare_value) {
          $(this).css('backgroundColor', '')
          $length.css('backgroundColor', '')
        }
      })
    })
  }

  // 功率-拉速 对比曲线函数
  function compareHeaterAndSlspeed() {
    // 获取长度并集
    let currentLengthArr = []
    let compareLengthArr = []
    $('.length').each((index, ele) => currentLengthArr.push(parseInt(ele.innerHTML)));
    $('.compare_length').each((index, ele) => compareLengthArr.push(parseInt(ele.innerHTML)));
    let unionLength = [...new Set([...currentLengthArr, ...compareLengthArr])].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);

    // 获取功率参数
    let currentHeatsArr = [];
    let compareHeatsArr = [];
    $('.mainHeater').each((index, ele) => currentHeatsArr.push(parseFloat(ele.innerHTML)));
    $('.compare_mainHeater').each((index, ele) => compareHeatsArr.push(parseFloat(ele.innerHTML)));

    // 获取拉速参数
    let currentSlspeed = [];
    let compareSlspeed = [];
    $('.slSpeed').each((index, ele) => currentSlspeed.push(parseInt(ele.innerHTML)));
    $('.compare_slSpeed').each((index, ele) => compareSlspeed.push(parseInt(ele.innerHTML)));

    // 参数处理函数
    function getNewValue(unionLength, currentLength, currentXXX, index) {
      return Math.floor(((currentXXX[index] - currentXXX[index - 1]) / (currentLength[index] - currentLength[index - 1]) * (unionLength[index] - currentLength[index - 1]) + currentXXX[index - 1]) * 10) / 10
    }

    unionLength.forEach((ele, index) => {
      if (currentLengthArr.indexOf(ele) == -1) {
        let newCurrentHeat = getNewValue(unionLength, currentLengthArr, currentHeatsArr, index);
        let newCurrentSlspeed = getNewValue(unionLength, currentLengthArr, currentSlspeed, index);
        currentHeatsArr.splice(index, 0, newCurrentHeat)
        currentSlspeed.splice(index, 0, newCurrentSlspeed)
        currentLengthArr.splice(index, 0, unionLength[index])
      }
      if (compareLengthArr.indexOf(ele) == -1) {
        let newCompareHeat = getNewValue(unionLength, compareLengthArr, compareHeatsArr, index);
        let newCompareSlspeed = getNewValue(unionLength, compareLengthArr, compareSlspeed, index);
        compareHeatsArr.splice(index, 0, newCompareHeat)
        compareSlspeed.splice(index, 0, newCompareSlspeed)
        compareLengthArr.splice(index, 0, unionLength[index])
      }

    })
    console.log(currentHeatsArr);
    console.log(currentSlspeed);
    console.log(compareHeatsArr);
    console.log(compareSlspeed);

    var chartDom = document.getElementById('compareLine');
    var myChart = echarts.init(chartDom);
    var option;

    option = {
      title: {
        text: '功率-拉速曲线对比图',
        left: 'center',
        top: 10,
        borderColor: 'blank',
        borderWidth: 1,
        borderRadius: [5, 5, 5, 5]
      },
      legend: {
        left: 'right',
        top: 'middle',
        orient: 'vertical',
      },
      grid: {
        left: '5 %',
        right: '15 %',
        top: '11 %',
        bottom: '8 %'
      },
      xAxis: {
        type: 'category',
        data: unionLength,
        axisTick: {
          // 强制坐标值与刻度对齐
          alignWithLabel: true,
        },
        // x 轴线与网格线对齐
        // boundaryGap: false,
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: '#55b9b4'
          }
        }
      },
      yAxis: [{
          name: '拉速(mm/h)',
          type: 'value',
          // y 轴自适应
          // min: function(value) {
          //   return value.min - 10
          // },
          min: 65,
          max: 115,
          // y 轴分割段数
          splitNumber: 10,
          // y 轴线显示
          axisLine: {
            show: true,
            // symbol: ['none', 'arrow'],
            // symbolSize: [5, 10]
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: '#55b9b4'
            }
          }
        },
        {
          name: '功率(Kw)',
          type: 'value',
          // y 轴自适应
          min: 5,
          max: -5,
          // y 轴分割段数
          splitNumber: 10,
          // y 轴线显示
          axisLine: {
            show: true,
            // symbol: ['none', 'arrow'],
            // symbolSize: [5, 10]
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: '#55b9b4'
            }
          }
        }
      ],
      series: [{
          name: '当前拉速曲线',
          type: 'line',
          yAxisIndex: 0,
          data: currentSlspeed,
        },
        {
          name: '对比拉速曲线',
          type: 'line',
          yAxisIndex: 0,
          data: compareSlspeed,
        },
        {
          name: '当前功率曲线',
          type: 'line',
          yAxisIndex: 1,
          data: currentHeatsArr,
        },
        {
          name: '对比功率曲线',
          type: 'line',
          yAxisIndex: 1,
          data: compareHeatsArr,
        }
      ]
    };

    option && myChart.setOption(option);
  }
})