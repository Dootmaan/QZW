//index.js
const AV = require('../../utils/av-live-query-weapp-min');
const app = getApp();
const bind = require('../../utils/live-query-binding');
const SwiperImg = require('../../model/swiperimg');
Page({
  data: {
    swiperImgs:[],
    indicatorDots: true,
    autoplay: true,
    interval: 5000, 
    duration: 1000,

    core: [
      { id: 'community', path: 'publish/publish_hall?source=all', name: '邻里圈' },
      { id: 'inform', path: 'inform/inform', name: '社区通知' },
      { id: 'headline', path: 'hot/hot', name: '社区新闻' },
      { id: 'goodDeeds', path: 'goodDeeds/goodDeeds', name: '好人好事' },
      { id: 'exposure', path: 'exposure/exposure_hall', name: '匿名曝光' },

      { id: 'mail', path: 'mail/mail', name: '直通书记' },
      { id: 'appointment', path: 'appointment/appointment', name: '预约办事' }, 
      { id: 'vote', path: 'vote/vote_hall', name: '投票打分' },     
      { id: 'todos', path: 'todos/todos', name: '待办事项' },
      { id: 'repair', path: 'repair/repair', name: '报事报修' },
      
      // { id: '', name: '' },
      // { id: 'call-roll', name: '友邻市集' },
      // { id: 'express', path: 'express/express', name: '速递服务' },
      

    ],
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    // userRoleId:2,
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  fetchSwiperImgs: function () {

    const query = new AV.Query(SwiperImg).ascending('order');
    // .equalTo('user', AV.Object.createWithoutData('User', user.id))

    const setSwiperImgs = this.setSwiperImgs.bind(this);
    return AV.Promise.all([query.find().then(setSwiperImgs), query.subscribe()]).then(([swiperImgs, subscription]) => {
      this.subscription = subscription;
      if (this.unbind) this.unbind();
      this.unbind = bind(subscription, swiperImgs, setSwiperImgs);
    }).catch(error => console.error(error.message));
  },  
  login: function () {
    return AV.Promise.resolve(AV.User.current()).then(user =>
      user ? (user.isAuthenticated().then(authed => authed ? user : null)) : null
    ).then(user => user ? user : AV.User.loginWithWeapp()).catch(error => console.error(error.message));
  },
  setSwiperImgs: function (swiperImgs) {
    // let arr = new Array();
    // for(let i = 0; i < swiperImgs.length; i++){
    //   // console.log(swiperImgs[i].get('url'));
    //   arr.push(swiperImgs[i].get('url'));
    // }
    this.setData({
      swiperImgs:swiperImgs
    });
    // console.log(swiperImgs);
    // console.log(this.data.swiperImgs);
    return swiperImgs;
  },
  onReady: function () {
    // console.log('page ready');
    this.login().then(this.fetchSwiperImgs.bind(this)).catch(error => console.error(error.message));
    // console.log((this.data.swiperImgs));
    // this.getOwnersList(this.data.publishs);
  },
  onLoad: function () {
    const user = AV.User.current();
    // console.log(user);
    // console.log(app);
    // console.log(app.globalData);
    // console.log(app.globalData.user);
    this.setData({
      userRoleId: user.attributes.roleId
    })
    console.log(user);
    console.log(this.data.userRoleId);
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        userRoleId: app.globalData.roleId
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
          });
          user.set(userInfo).save().then(user => {
            // 成功，此时可在控制台中看到更新后的用户信息
            this.globalData.user = user.toJSON();
          }).catch(console.error);
        }
      })
    }
    console.log(this.data);
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  imageLoad: function (e) {
    var res = wx.getSystemInfoSync();
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      ratio = imgwidth / imgheight;
    this.setData({
      bannerHeight: res.windowWidth / ratio
    })

  },
  openSwiper(e){
    console.log(e);
    var url = e.currentTarget.dataset.url;
    if(url==""){
      console.log("没有文章链接")
      
    }
    else{
      wx.navigateTo({
        url: '/pages/inform/document?path=' + url,
      })
    }
  }


})
