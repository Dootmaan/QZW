//app.js
const AV = require('./utils/av-live-query-weapp-min');

AV.init({
  appId: 'F6IF1UWseDlOvAbirnBrWJQD-gzGzoHsz',
  appKey: 'wQb68N9C1Y5oL6jb5HAyYTfo',
});

 
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          AV.User.loginWithWeapp().then(user => {
            this.globalData.user = user.toJSON();
          }).catch(console.error);

          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              const user = AV.User.current();
              // 调用小程序 API，得到用户信息
              user.set(res.userInfo).save().then(user => {
                // 成功，此时可在控制台中看到更新后的用户信息
                this.globalData.user = user.toJSON();
                // this.globalData.user
              }).catch(console.error);

              wx.getUserInfo({
                success: ({ userInfo }) => {
                  // 更新当前用户的信息
                  user.set(userInfo).save().then(user => {
                    // 成功，此时可在控制台中看到更新后的用户信息
                    this.globalData.user = user.toJSON();
                  }).catch(console.error);
                }
              });

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

  },
  globalData: {
    userInfo: null
  },
  onPageNotFound(res) {
    wx.redirectTo({
      url: '/pages/index/index',
    })
  }
});
