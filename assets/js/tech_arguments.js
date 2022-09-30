$(function() {
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
      console.log(contractMessage);
      getPublicDiscriptionAjax(contractMessage, `${current}`)
    })

    // 提交说明选择后渲染
    $(discription).on('change', function() {
      discriptionMessage.zoom = $(`#${current}_zoom`).val()
      discriptionMessage.contract = $(`#${current}_contract`).val()
      discriptionMessage.discription = $(this).val()
      console.log(discriptionMessage);
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