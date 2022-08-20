const { User } = require('../../utils/av-live-query-weapp-min');
const AV = require('../../utils/av-live-query-weapp-min');

Page({
  data: {
    user: null,
    error: null,
    mobilePhoneNumber:'',
    smsCode:''
  },
  onLoad: function () {
    this.setData({
      user: User.current(),
    });
  },

  updateMobile: function ({
    detail: {
      value
    }
  }) {
    this.setData({
      mobilePhoneNumber: value
    });
  },
  updateSmsCode: function ({
    detail: {
      value
    }
  }) {
    this.setData({
      smsCode: value
    });
  },

  sendSms:function(){
    const { mobilePhoneNumber } = this.data;
    AV.Cloud.requestSmsCode(mobilePhoneNumber).then(function(success){
      wx.showToast({
        title: '验证码已发送',
        icon: 'success'
      })
    }),function(error){
      wx.showToast({
        title: '发送失败',
        icon:'fail'
      })
    }
  },

  save: function () {
    this.setData({
      error: null,
    });

    const { mobilePhoneNumber,smsCode } = this.data;
    const user = User.current();

    Av.User.signUpOrlogInWithMobilePhone(mobilePhoneNumber,smsCode).then(function(success){
      wx.showToast({
        title: '更新成功',
        icon: 'success',
      });
    })

    if (mobilePhoneNumber) user.set({ mobilePhoneNumber });
    
    user.save().then(() => {
      wx.showToast({
        title: '更新成功',
        icon: 'success',
      });
    }).catch(error => {
      this.setData({
        error: error.message,
      });
    });
  }
});