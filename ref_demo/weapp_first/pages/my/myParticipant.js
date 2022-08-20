//index.js

//获取应用实例

const AV = require('../../utils/av-live-query-weapp-min');

const bind = require('../../utils/live-query-binding');


const app = getApp()

Page({
  data: {

    userInfo: {},
    currentUserId: "",

  },

  login: function () {
    return AV.Promise.resolve(AV.User.current()).then(user =>
      user ? (user.isAuthenticated().then(authed => authed ? user : null)) : null
    ).then(user => user ? user : AV.User.loginWithWeapp()).catch(error => console.error(error.message));
  },

  onReady: function () {
    // console.log('page ready');
    this.login();
    // console.log((this.data.publishs));
    // this.getOwnersList(this.data.publishs);
  },

  onLoad() {
    //调用API从本地缓存中获取数据

    // console.log(app);
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    let that = this
    //调用应用实例的方法获取全局数据
    var userId = AV.User.current().id;
    this.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        currentUserId: userId,
      })
    })
    // console.log("currentUserId");
    // console.log("page load");
    // console.log((this.data.publishs));
    // this.getOwnersList(this.data.publishs);
  },

  onUnload: function () {
    
  },


  getUserInfo(cb) {
    let app = getApp();
    app.globalData = app.globalData || {}
    if (app.globalData.userInfo) {
      typeof cb == "function" && cb(app.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              app.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(app.globalData.userInfo)
            }
          })
        }
      })
    }
  },

  onShow: function () {
    // console.log("page show");
    // console.log((this.data.publishs));
    // this.getOwnersList(this.data.publishs);
  },

  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  myPublishClick: function() {
    wx.navigateTo({
      url: '/pages/myPublish/my_publish_hall',
    })
  },

  myExposureClick: function() {
    wx.navigateTo({
      url: '/pages/myExposure/my_exposure_hall',
    })
  },

  myVoteClick:function() {
    wx.navigateTo({
      url: '/pages/myVote/my_vote_hall',
    })
  }
});
