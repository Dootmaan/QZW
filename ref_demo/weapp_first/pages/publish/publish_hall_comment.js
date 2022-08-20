// pages/publish_hall_comment/publish_hall_comment.js
const AV = require('../../utils/av-live-query-weapp-min');
const Publish = require('../../model/publish'); 
const bind = require('../../utils/live-query-binding');

const Comment = require('../../model/comment');

Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    publishId:"",
    userNickName:"",
    userAvatarUrl:"",
    pubTime: "",
    publishs:[],
    userInfo: {},
    comments: [],
    imgs:[],
    draft: '',
    users:[],
    currentInput: '',
    pubsTime:[]
    
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
  fetchPublishs: function () {
    const query = new AV.Query(Publish).equalTo('objectId', this.data.publishId);
    // .get(this.data.publishId);

    const setPublishs = this.setPublishs.bind(this);
    return AV.Promise.all([query.find().then(setPublishs), query.subscribe()]).then(([publishs, subscription]) => {
      this.subscription = subscription;
      if (this.unbind) this.unbind();
      this.unbind = bind(subscription, publishs, setPublishs);
    }).catch(error => console.error(error.message));
    console.log(this.data.publishs);
  },
  setPublishs: function (publishs) {
    // console.log("publishs");
    // console.log(publishs);
    this.setData({
      publishs,
    });
    this.getImgsList(publishs);
    
    return publishs;
  },

  fetchComments: function () {
    const query = new AV.Query(Comment).equalTo('publishId', this.data.publishId).descending('createdAt');
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
  //copy from publish_hall
  getObjectTime(_object) {
    // console.log(_object);
    var currTime = new Date().getTime() // 现在时间


    var createTime = _object.get('createdAt').getTime()
    var diffTime = currTime - createTime
    var days = parseInt(diffTime / (1000 * 60 * 60 * 24))
    if (days > 0) {
      return (days + "天前")
    } else {
      var hours = parseInt(diffTime / (1000 * 60 * 60))
      if (hours > 0) {
        return (hours + "小时前")
      } else {
        var minutes = parseInt(diffTime / (1000 * 60))
        if (minutes > 0) {
          return (minutes + "分钟前")
        } else {
          var seconds = parseInt(diffTime / 1000)
          return (seconds + "秒前")
        }
      }
    }
  },
  getOwnersList(data) {
    let currPage = this;
    let objects = new Array();
    let arr = [];
    let pubsTime_arr = new Array();

    for (let i = 0; i < data.length; i++) {
      console.log(data[i]);
      let userId = data[i]['attributes']['user']['id'];
      let pubTime = this.getObjectTime(data[i]);
      // console.log(userId);
      let user = AV.Object.createWithoutData('_User', userId);
      objects.push(user);
      pubsTime_arr.push(pubTime);


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
      currPage.setData({ 'users': arr, pubsTime: pubsTime_arr });
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
    console.log(options);
    this.setData({
      publishId:options.publish,
      userNickName:options.userNickName,
      userAvatarUrl:options.userAvatarUrl,
      pubTime:options.pubtime
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
    this.login().then(this.fetchPublishs.bind(this)).catch(error => console.error(error.message));
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
      publishId:this.data.publishId,
    }).setACL(acl).save().then((comment) => {
      this.setComments([comment, ...this.data.comments]);
    }).catch(error => console.error(error.message));
    this.setData({
      draft: ''
    });
    var that = this;
    var query = new AV.Query(Publish);
    query.get(this.data.publishId).then(function (publish) {
      
      // console.log(publish);
      var commentNums = publish.attributes.commentNums;
      // console.log('评论数' + commentNums);
      // publish.comments_num += 1;
      // publish.set('comments_num',2);
      var publish = AV.Object.createWithoutData('Publish', that.data.publishId);
      // 修改属性
      publish.set('commentNums', commentNums + 1);
      // 保存到云端
      publish.save();
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
      //按每条publish图片数组装imgs二维数组
      let publishImgsList = new Array();
      let idx = 0;
      for (let i = 0; i < data.length; i++) {
        let imgsList = new Array;
        for (let j = 0; j < data[i].attributes.imgIds.length; j++) {
          imgsList.push(arr[idx]);
          idx++;
        }
        publishImgsList.push(imgsList);
      }
      // console.log(publishImgsList);
      currPage.setData({ 'imgs': publishImgsList });
      // console.log("imgs");
      // console.log(currPage.data.imgs);
    });

  },
 

})