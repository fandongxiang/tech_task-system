$(function() {
  // 新建合同
  $('.contractChange').on('change', function() {
    console.log($(this).val());
    if ($(this).val() == '新建合同') {
      // window.location.href = '../tech/tech_arguments.html'
      const newContract = prompt('请输入要添加的合同')
      const newOption = document.createElement('option');
      newOption.innerHTML = newContract;
      $(this).prepend(newOption)
      $(this).val(newContract)
    }
  })

  // 预览区渲染 函数
  function getPreview() {
    // 首次预渲染
    let submitMessage = { // 这个为后续函数公用对象
      zoom: $('select[name="zoom"]').val(),
      contract: $('select[name="contract"]').val(),
      type: $('select[name="type"]').val()
    }
    let zoomMessage = { // 这个函数为后续函数公用对象
      zoom: $('select[name="zoom"]').val()
    }
    getContractAjax(zoomMessage);
    getSubmitAjax(submitMessage);
    getHistorySubmit(zoomMessage);

    // 片区、合同、参数类型选择后渲染
    $('select[name="zoom"]').on('change', function() {
      // 合同渲染 + 参数渲染
      // 注意：这里 参数渲染 必须写在 合同渲染ajax成功函数里，不然得不到参数
      zoomMessage = {
          zoom: $(this).val()
        }
        // 调用合同渲染函数
      getContractAjax(zoomMessage);
      // 调用历史提交区渲染函数
      getHistorySubmit(zoomMessage);
    })
    $('select[name="contract"]').on('change', function() {
      submitMessage.contract = $(this).val()
      getSubmitAjax(submitMessage)
    })
    $('select[name="type"]').on('change', function() {
      submitMessage.type = $(this).val()
      getSubmitAjax(submitMessage)
    })
  }
  getPreview()

  // 合同渲染 ajax请求函数
  function getContractAjax(zoomMessage) {
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
        const dataStr = template('getContract', {
          data: data
        });
        $('#select_contract').html(dataStr)

        // 调用 getSubmitAjax()
        let submitMessage = {
          zoom: $('select[name="zoom"]').val(),
          contract: $('select[name="contract"]').val(),
          type: $('select[name="type"]').val()
        }
        getSubmitAjax(submitMessage)
      }
    })
  }

  // 参数渲染 ajax请求函数
  function getSubmitAjax(submitMessage) {
    $.ajax({
      type: 'POST',
      url: '/tech/arguments/getPreview',
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
        // 添加表格id
        for (let i = 0; i < data.length; i++) {
          data[i].newId = i + 1;
        }
        if (status !== 0) return alert("获取提交预览区信息失败！");
        const dataStr_preview = template('getPreview', {
          data: data
        });
        const dataStr_sub = template('getSubmitPreview', {
          data: data
        })
        $('#preview_tbody').html(dataStr_preview);
        $('#sub_tbody').html(dataStr_sub)
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

  // 提交参数
  $('#sub_submit').on('click', function() {
    var data = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: []
      }
      // 片区、合同、描述、长度
    $('.length').each(function(index, element) {
        data[`${index}`].push($('#select_zoom').val())
        data[`${index}`].push($('#select_contract').val())
        data[`${index}`].push($('#select_discription').val())
        data[`${index}`].push($(this).html())
      })
      // 晶转
    $('.seedRotation').each(function(index, element) {
      data[`${index}`].push($(this).html())
    })
    $('.cruRotation').each(function(index, element) {
      data[`${index}`].push($(this).html())
    })
    $('.mainHeater').each(function(index, element) {
      data[`${index}`].push($(this).html())
    })
    $('.slSpeed').each(function(index, element) {
      data[`${index}`].push($(this).html())
    })
    $('.meltLevel').each(function(index, element) {
      data[`${index}`].push($(this).html())
    })
    $('.argonFlow').each(function(index, element) {
      data[`${index}`].push($(this).html())
    })
    $('.controlTime').each(function(index, element) {
      data[`${index}`].push($(this).html())
    })
    $('.controlRate').each(function(index, element) {
      data[`${index}`].push($(this).html())
    })
    $.ajax({
      type: 'POST',
      url: '/tech/arguments/postArguments',
      headers: {
        Authorization: localStorage.getItem('token') || ''
      },
      data: data,
      success: function(res) {
        let {
          status,
          message
        } = res;
        if (status != 0) return alert(message);
        alert(message)
      }
    })
  })

  // 对比提交区和预览区参数函数
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

  // 删除提交参数事件
  $('#submitHistory_tbody').on('click', '.delete_submit', function() {
    let tr = $(this).parent().parent()
    let data = {
      zoom: tr.children()[1].innerHTML,
      contract: tr.children()[2].innerHTML,
      subDay: tr.children()[5].innerHTML
    }
    console.log(data);
    $.ajax({
      type: 'POST',
      url: '/tech/arguments/deleteArguments',
      headers: {
        Authorization: localStorage.getItem('token') || ''
      },
      data: data,
      success: (res) => {
        let {
          status,
          message,
          data
        } = res;
        if (status != 0) return alert(message);
        alert('删除参数成功！')
        getPreview()
      }
    })
  })
})