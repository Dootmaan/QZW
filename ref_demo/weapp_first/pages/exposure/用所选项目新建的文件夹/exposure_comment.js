// pages/exposure_publish_hall_comment/exposure_publish_hall_comment.js
const AV = require('../../utils/av-live-query-weapp-min');
const ExposurePublish = require('../../model/exposure_publish'); 
const bind = require('../../utils/live-query-binding');

const Comment = require('../../model/comment');

Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    exposure_publishId:"",
    userNickName:"",
    userAvatarUrl:"",
    exposure_publishs:[],
    userInfo: {},
    comments: [],
    imgs:[],
    draft: '',
    users:[],
    currentInput: ''
  },
  getInput: function (e) {
    this.setData({
      currentInput: e.detail.value
    })
  },

  login: function () {
    return AV.Promise.resolve(AV.User.current()).then(user =>
      user ? (user.isAuthenticated().then(authed => authed ? user : null)) : null
    ).then(user => user ? user : AV.User.loginWithWeapp()).catch(error => console.error(error.message));
  },
  fetchExposurePublishs: function () {
    const query = new AV.Query(ExposurePublish).equalTo('objectId', this.data.exposure_publishId);
    // .get(this.data.exposure_publishId);

    const setExposurePublishs = this.setExposurePublishs.bind(this);
    return AV.Promise.all([query.find().then(setExposurePublishs), query.subscribe()]).then(([exposure_publishs, subscription]) => {
      this.subscription = subscription;
      if (this.unbind) this.unbind();
      this.unbind = bind(subscription, exposure_publishs, setExposurePublishs);
    }).catch(error => console.error(error.message));
    console.log(this.data.exposure_publishs);
  },
  setExposurePublishs: function (exposure_publishs) {
    // console.log("exposure_publishs");
    // console.log(exposure_publishs);
    this.setData({
      exposure_publishs,
    });
    this.getImgsList(exposure_publishs);
    
    return exposure_publishs;
  },

  fetchComments: function () {
    const query = new AV.Query(Comment).equalTo('exposure_publishId', this.data.exposure_publishId).descending('createdAt');
    const setComments = this.setComments.bind(this);
    return AV.Promise.all([query.find().then(setComments), query.subscribe()]).then(([comments, subscription]) => {
      this.subscription = subscription;
      if (this.unbind) this.unbind();
      this.unbind = bind(subscription, comments, setComments);
    }).catch(error => console.error(error.message));
  
  },
  setComments: function (comments) {
    console.log("comments");
    console.log(comments);
    
    this.setData({
      comments,
    });
    this.getOwnersList(comments);
    // console.log(this.data.users);
    return comments;
  },
  //copy from exposure_publish_hall
  getOwnersList(data) {
    let currPage = this;
    let objects = new Array();
    let arr = [];

    for (let i = 0; i < data.length; i++) {
      // console.log(data[i]);
      let userId = data[i]['attributes']['user']['id'];
      // console.log(userId);
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
  previewImage(e) {
    // var that = this;
    console.log(e);
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: e.currentTarget.dataset.urls
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options);
    this.setData({
      exposure_publishId:options.exposure_publish,
      userNickName:options.userNickName,
      userAvatarUrl:options.userAvatarUrl
    })
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    let that = this
    //调用应用实例的方法获取全局数据
    this.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("page ready!");
    this.login().then(this.fetchExposurePublishs.bind(this)).catch(error => console.error(error.message));
    this.login().then(this.fetchComments.bind(this)).catch(error => console.error(error.message));

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
  /**
   * 生命周期函数--监听页面显示
   */


  updateDraft: function ({
    detail: {
      value
    }
  }) {
    // Android 真机上会诡异地触发多次时 value 为空的事件
    if (!value) return;
    this.setData({
      draft: value,
      currentInput:value
    });

  },


  addComment: function () {
    var value = this.data.draft && this.data.draft.trim()
    if (!value) {
      return;
    }
    var acl = new AV.ACL();
    acl.setPublicReadAccess(true);
    acl.setPublicWriteAccess(false);
    acl.setReadAccess(AV.User.current(), true);
    acl.setWriteAccess(AV.User.current(), true);
    new Comment({
      content: value,
      user: AV.User.current(),
      exposure_publishId:this.data.exposure_publishId,
    }).setACL(acl).save().then((comment) => {
      this.setComments([comment, ...this.data.comments]);
    }).catch(error => console.error(error.message));
    this.setData({
      draft: ''
    });
    var that = this;
    var query = new AV.Query(ExposurePublish);
    query.get(this.data.exposure_publishId).then(function (exposure_publish) {
      
      // console.log(exposure_publish);
      var commentNums = exposure_publish.attributes.commentNums;
      // console.log('评论数' + commentNums);
      // exposure_publish.comments_num += 1;
      // exposure_publish.set('comments_num',2);
      var exposure_publish = AV.Object.createWithoutData('ExposurePublish', that.data.exposure_publishId);
      // 修改属性
      exposure_publish.set('commentNums', commentNums + 1);
      // 保存到云端
      exposure_publish.save();
    }, function (error) {

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
      for (let i = 0; i < data.length; i++) {
        let imgsList = new Array;
        for (let j = 0; j < data[i].attributes.imgIds.length; j++) {
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
 

})