const AV = require('../../utils/av-live-query-weapp-min');
const ExposurePublish = require('../../model/exposure_publish');
const bind = require('../../utils/live-query-binding');
const Comment = require('../../model/comment');
const Like = require('../../model/like');
const app = getApp()

Page({ 
  data: {
    exposure_publishs: [],
    userInfo: {},
    currentUserId:"",
    hasLikedList:[]
  },
  login: function () {
    return AV.Promise.resolve(AV.User.current()).then(user =>
      user ? (user.isAuthenticated().then(authed => authed ? user : null)) : null
    ).then(user => user ? user : AV.User.loginWithWeapp()).catch(error => console.error(error.message));
  },
  fetchExposurePublishs: function () {

    const query = new AV.Query(ExposurePublish).descending('createdAt').equalTo('owner', AV.User.current().get('objectId'));
      // .equalTo('user', AV.Object.createWithoutData('User', user.id))
      
    const setExposurePublishs = this.setExposurePublishs.bind(this);
    return AV.Promise.all([query.find().then(setExposurePublishs), query.subscribe()]).then(([exposure_publishs, subscription]) => {
      this.subscription = subscription;
      if (this.unbind) this.unbind();
      this.unbind = bind(subscription, exposure_publishs, setExposurePublishs);
    }).catch(error => console.error(error.message));
    // console.log(this.data.exposure_publishs);
  },  

  onReady: function () { 
    // console.log('page ready');
    this.login().then(this.fetchExposurePublishs.bind(this)).catch(error => console.error(error.message));
    // console.log((this.data.exposure_publishs));
    // this.getOwnersList(this.data.exposure_publishs);
  },
  onLoad() {
    //调用API从本地缓存中获取数据

    // console.log(app);
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    let that = this
    //调用应用实例的方法获取全局数据
    var userId=AV.User.current().id;
    this.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        currentUserId:userId,
      })
    })
    // console.log("currentUserId");
    // console.log("page load");
    // console.log((this.data.exposure_publishs));
    // this.getOwnersList(this.data.exposure_publishs);
  },
  onUnload: function () {
    this.subscription.unsubscribe();
    this.unbind();
  },
  onPullDownRefresh: function () {
    const user = AV.User.current();
    if (!user) return wx.stopPullDownRefresh();
    this.fetchExposurePublishs(user).catch(error => console.error(error.message)).then(wx.stopPullDownRefresh);
  },
  setExposurePublishs: function (exposure_publishs) {
    // console.log(exposure_publishs);
    this.setData({
      exposure_publishs,
    });
    // console.log(this.data.exposure_publishs);
    this.getOwnersList(exposure_publishs);
    this.getImgsList(exposure_publishs);
    this.getHasLikedList(exposure_publishs);
    return exposure_publishs;
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
  previewImage(e) {
    // var that = this;
    console.log(e);
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: e.currentTarget.dataset.urls
    })
  },
  comment(e){
    console.log(e);
    var exposure_publish = e.currentTarget.dataset.publish.objectId;
    var userNickName = e.currentTarget.dataset.usernickname;
    var userAvatarUrl = e.currentTarget.dataset.useravatarurl;//这些data属性自动会被转化成小写
    // console.log("邻里圈id"+exposure_publish);
    // console.log(userNickName);
    // console.log(userAvatarUrl);
    wx.navigateTo({
      url: '/pages/exposure/exposure_comment?exposure_publish='+exposure_publish+'&userNickName='+userNickName+'&userAvatarUrl='+userAvatarUrl,
    })
  },
  likeExposurePublish(e){
    console.log(e);
    var exposure_publishId = e.currentTarget.dataset.publish.objectId;
    const currPage = this;
    var query = new AV.Query(ExposurePublish);
    query.get(exposure_publishId).then(function (exposure_publish) {

      // console.log(exposure_publish);
      var likedUsers = exposure_publish.attributes.likedUsers;
      let hasLiked=false;
      for(let i=0;i<likedUsers.length;i++){
        if (likedUsers[i]==currPage.data.currentUserId){
          hasLiked = true;
        }
      }
      // console.log('赞过的用户' + liked_users);
      // exposure_publish.comments_num += 1;
      // exposure_publish.set('comments_num',2);
      var exposure_publish = AV.Object.createWithoutData('ExposurePublish', exposure_publishId);
      // 修改属性
      if(hasLiked){
        exposure_publish.remove('likedUsers', AV.User.current().id);
      }
      else{
        exposure_publish.add('likedUsers', AV.User.current().id);
      }
      
      // 保存到云端
      exposure_publish.save();
    }, function (error) {

    });
  },
  onShow: function () {
    // console.log("page show");
    // console.log((this.data.exposure_publishs));
    // this.getOwnersList(this.data.exposure_publishs);

  },
  getOwnersList(data) {
    let currPage = this;
    let objects = new Array();
    let arr = [];

    for (let i = 0; i < data.length; i++) {
      let userId = data[i].get('owner');
      let user = AV.Object.createWithoutData('_User', userId);
      objects.push(user);
    }
    AV.Object.fetchAll(objects).then(function (objects) {
      for (let i = 0; i < objects.length; i++) {
        let obj = new Object();
        let nickName = objects[i].get('nickName');
        let avatarUrl = objects[i].get('avatarUrl');
        obj.nickName = (nickName == null) ? '游客' : objects[i].get('nickName');
        obj.avatarUrl = (avatarUrl == null) ? '/images/youke.png' : objects[i].get('avatarUrl');
        arr.push(obj);
        // console.log(obj);
      }
      currPage.setData({ 'users': arr });
    });

  },
  getImgsList(data) {

    let currPage = this;
    let objects = new Array();
    let arr = [];
    for (let i = 0; i < data.length; i++) {
      let imgId;
     for (let j = 0; j < data[i].attributes.imgIds.length; j++) {
        imgId = data[i].attributes.imgIds[j];
        let file = AV.Object.createWithoutData('_File', imgId);
        objects.push(file);
      }
    }

    AV.Object.fetchAll(objects).then(function (objects) {
      for (let i = 0; i < objects.length; i++) {
        arr.push(objects[i].get('url'));
        // console.log(objects[i].get('url'));
      }
      //按每条exposure_publish图片数组装imgs二维数组
      let exposure_publishImgsList = new Array();
      let idx = 0;
      for(let i = 0; i < data.length; i++){
        let imgsList = new Array;
        for (let j = 0; j < data[i].attributes.imgIds.length; j++){
          imgsList.push(arr[idx]);
          idx++;
        }
        exposure_publishImgsList.push(imgsList);
      }
      // console.log(exposure_publishImgsList);
      currPage.setData({ 'imgs': exposure_publishImgsList });
      // console.log("imgs");
      // console.log(currPage.data.imgs);
    });

  },
  getHasLikedList(data) {
    const user = AV.User.current();
    let currPage = this;
    let arr = new Array();
    let liked;
    // let userId = app.globalData.userId;
    let userId = user.id;
    for (let i = 0; i < data.length; i++) {
      liked = false;
      let likedUsers = data[i]['attributes']['likedUsers'];
      for (let j = 0; j < likedUsers.length; j++) {
        if (likedUsers[j] == userId) {
          liked = true;
          // console.log("用户已经点赞过~");
          break;
        }
      }
      arr.push(liked);

    }
    currPage.setData({
      hasLikedList:arr,
    });
    // console.log(arr);

  },
  

});
