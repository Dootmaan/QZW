// pages/repair/repair.js
const AV = require('../../utils/av-live-query-weapp-min');

const bind = require('../../utils/live-query-binding');

const Repair = require('../../model/repair');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    draft: '',
  },
  updateDraft: function ({
    detail: {
      value
    }
  }) {
    // Android 真机上会诡异地触发多次时 value 为空的事件
    if (!value) return;
    this.setData({
      draft: value
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    if (e.detail.value.name.length == 0) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'loading'
      })
    }
    else if (e.detail.value.mobile.length == 0) {
      wx.showToast({
        title: '手机号不得为空',
        icon: 'loading'
      })
    }
    else if (e.detail.value.mobile.length != 11) {
      wx.showToast({
        title: '请输入11位手机号',
        icon: 'loading'
      })
    }
    else if (e.detail.value.text.length == 0) {
      wx.showToast({
        title: '请输入文本',
        icon: 'loading'
      })
    }
    else {
      var value = this.data.draft && this.data.draft.trim()
      if (!value) {
        return;
      }
      var acl = new AV.ACL();
      acl.setPublicReadAccess(true);
      acl.setPublicWriteAccess(false);
      acl.setReadAccess(AV.User.current(), true);
      acl.setWriteAccess(AV.User.current(), true);
      new Repair({
        content: value,
        user: AV.User.current(),
        name: e.detail.value.name,
        mobile: e.detail.value.mobile,
      }).setACL(acl).save().then((repair) => {

      }).catch(error => console.error(error.message));
      this.setData({
        draft: ''
      });
      wx.showToast({

        title: "提交成功",//这里打印出登录成功

        icon: 'success',

        duration: 2000

      })

    }
  },


  formReset: function (e) {
    console.log('form发生了reset事件')
  }
})