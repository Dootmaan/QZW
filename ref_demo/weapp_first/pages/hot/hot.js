const AV = require('../../utils/av-live-query-weapp-min');
const Document1 = require('../../model/document1');
const bind = require('../../utils/live-query-binding');


Page({
  data: {
    documents: [],
    standardTime:[],
    userInfo: {},
    currentUserId: "",
  },
  login: function () {
    return AV.Promise.resolve(AV.User.current()).then(user =>
      user ? (user.isAuthenticated().then(authed => authed ? user : null)) : null
    ).then(user => user ? user : AV.User.loginWithWeapp()).catch(error => console.error(error.message));
  },
  fetchDocuments: function () {

    const query = new AV.Query(Document1).ascending('createdAt');
    // .equalTo('user', AV.Object.createWithoutData('User', user.id))

    const setDocuments = this.setDocuments.bind(this);
    return AV.Promise.all([query.find().then(setDocuments), query.subscribe()]).then(([documents, subscription]) => {
      this.subscription = subscription;
      if (this.unbind) this.unbind();
      this.unbind = bind(subscription, documents, setDocuments);
    }).catch(error => console.error(error.message));
    console.log(this.data.documents);
  },

  onReady: function () {
    console.log('page ready');
    this.login().then(this.fetchDocuments.bind(this)).catch(error => console.error(error.message));
  },
  onLoad() {
    //调用API从本地缓存中获取数据
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
    console.log(this);

  },
  onUnload: function () {
    this.subscription.unsubscribe();
    this.unbind();
  },
  onPullDownRefresh: function () {
    const user = AV.User.current();
    if (!user) return wx.stopPullDownRefresh();
    this.fetchDocuments(user).catch(error => console.error(error.message)).then(wx.stopPullDownRefresh);
  },
  setDocuments: function (documents) {
    console.log(documents);
    let arr = new Array();
    this.setData({
      documents,
    });
    
    // for(let i =0; i<documents.length;i++){
    //   console.log(documents[i]);
    //   arr.push(documents[i].attributes.publishedAt.toISOString().slice(0,10));
    // }
    // this.setData({
    //   standardTime:arr,
    // })
    // console.log(arr);
    // console.log(this.data.standardTime)
    return documents;
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
  showDocument(e){
    console.log(e);
    var path = e.currentTarget.dataset.path;
    var documentId = e.currentTarget.dataset.document.objectId;
    // console.log(e.currentTarget.dataset.document.createdAt.toISOString)
    // const currPage = this;
    // var query = new AV.Query(Document1);
    // query.get(documentId).then(function (document) {

    //   // console.log(publish);
    //   var readnum = document.attributes.readNum;
    //   console.log('赞数' + readnum);

    //   // exposure_publish.comments_num += 1;
    //   // exposure_publish.set('comments_num',2);
    //   var document = AV.Object.createWithoutData('Document1', document);
    //   // 修改属性
    //   // exposure_publish.set('liked_users', liked_users.push(AV.User.current()));
    //   document.set('readNum', readnum + 1);
    //   // console.log(AV.User.current());

    //   // 保存到云端
    //   document.save();
    // }, function (error) {

    // });
    wx.navigateTo({
      url: '/pages/inform/document?path=' + path,
    })
  },
 


});
