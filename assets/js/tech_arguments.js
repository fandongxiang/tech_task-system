$(function() {
  // 前往提交页面按钮
  let createButton = document.querySelector('#create_button')
  createButton.addEventListener('click', function() {
    window.open('../tech/tech_arguments_submit.html')
  })

  // 当前参数渲染 函数
  function getPreview(current) {
    let zoom = `#${current}_zoom`
    let contract = `#${current}_contract`
    let type = `#${current}_type`
    let discription = `#${current}_discription`
      // 首次预渲染
    let submitMessage = { // 这个为后续函数公用对象
      zoom: $(zoom).val(),
      contract: $(contract).val(),
      type: $(type).val(),
      discription: $(discription).val()
    }
    let zoomMessage = { // 这个函数为后续函数公用对象
      zoom: $(zoom).val()
    }
    let contractMessage = {
      zoom: $(zoom).val(),
      contract: $(contract).val(),
      type: $(type).val(),
      discription: $(discription).val()
    }
    getContractAjax(zoomMessage, `${current}`);
    getSubmitAjax(submitMessage, `${current}`)
      // getHistorySubmit(zoomMessage);

    // 片区、合同、参数类型选择后渲染
    $(zoom).on('change', function() {
      // 合同渲染 + 参数渲染
      // 注意：这里 参数渲染 必须写在 合同渲染ajax成功函数里，不然得不到参数
      zoomMessage = {
          zoom: $(this).val()
        }
        // 调用合同渲染函数
      getContractAjax(zoomMessage, `${current}`);
      // 调用历史提交区渲染函数
      // getHistorySubmit(zoomMessage);
    })
    $(contract).on('change', function() {
      submitMessage.contract = $(this).val()
      getSubmitAjax(submitMessage, `${current}`)
    })
    $(type).on('change', function() {
      submitMessage.type = $(this).val()
      getSubmitAjax(submitMessage, `${current}`)
    })
  }
  getPreview('current')

  // 合同&提交说明渲染 ajax请求函数
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
        const dataStr_contract = template(`${current}_Contract`, {
          data: data
        });
        $(`#${current}_contract`).html(dataStr_contract)
          // 调用 提交说明渲染函数


        // 调用 getSubmitAjax()
        let zoom = `#${current}_zoom`
        let contract = `#${current}_contract`
        let type = `#${current}_type`
        let discription = `#${current}_discription`
          // 首次预渲染
        let submitMessage = { // 这个为后续函数公用对象
          zoom: $(zoom).val(),
          contract: $(contract).val(),
          type: $(type).val()
        }
        getSubmitAjax(submitMessage, `${current}`)
      }
    })
  }

  // 参数渲染 ajax请求函数
  function getSubmitAjax(submitMessage, current) {
    $.ajax({
      type: 'POST',
      url: '/tech/arguments/getCurrentPreview',
      headers: {
        Authorization: localStorage.getItem('token') || ''
      },
      data: submitMessage,
      success: (res) => {
        let {
          status,
          message,
          data
        } = res
        if (status !== 0) return alert("获取提交预览区信息失败！");
        if (data.length == 0) {
          $(`#${current}_tbody`).html('')
            // 清空表格
        } else {
          // 添加表格id
          for (let i = 0; i < data.length; i++) {
            data[i].newId = i + 1;
          }
          let dataStr_preview = template(`${current}_Preview`, {
            data: data
          });
          $(`#${current}_tbody`).html(dataStr_preview);
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
      }
    })
  }

  // 提交说明渲染 ajax请求函数
  function getDiscriptionAjax(contractMessage, current) {
    $.ajax({

    })
  }

  // 对比 提交区和预览区参数函数
  function compareArguments(str) {
    let ele = `.${str}`;
    let compare_ele = `.compare_${str}`;
    let ele_data = `data-newId`;
    $(ele).blur(function() {
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

  // 历史提交区渲染
  function getHistorySubmit(zoomMessage) {
    $.ajax({
      type: 'POST',
      url: '/tech/arguments/getHistorySubmit',
      headers: {
        Authorization: localStorage.getItem('token') || ''
      },
      data: zoomMessage,
      success: function(res) {
        let {
          status,
          message,
          data
        } = res;
        if (status != 0) return alert(message);
        data.map((element, index) => {
          element.newId = index + 1;
        });
        const dataStr_history = template('getHistorySubmit', {
          data: data
        });
        $('#submitHistory_tbody').html(dataStr_history);
      }
    })
  }
})