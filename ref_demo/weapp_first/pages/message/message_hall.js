// pages/message/message_hall.js
const AV = require('../../utils/av-live-query-weapp-min');
//const Message = require('../../model/message');
const bind = require('../../utils/live-query-binding');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    serveType:'',
    sessions: [],
    sessionsTime:[],
  },
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
  login: function () {
    return AV.Promise.resolve(AV.User.current()).then(user =>
      user ? (user.isAuthenticated().then(authed => authed ? user : null)) : null
    ).then(user => user ? user : AV.User.loginWithWeapp()).catch(error => console.error(error.message));
  },

  fetchSessions:function(){
    var MessageTable = AV.Object.extend('MessageTable');
    //var role = app.globalData.user.roleId;
    var role = 2;//调试用
    //console.log(role);
    let userId = AV.User.current().id;
    var query;
    if(role == 2)
      query = new AV.Query(MessageTable).equalTo('clientUserId', userId).equalTo('type', this.data.serveType);//普通用户作为被服务对象
    else
      query = new AV.Query(MessageTable).equalTo('serverUserId', userId).equalTo('type', this.data.serveType);//其余用户是提供服务的对象
    const setSessions = this.setSessions.bind(this);  
    return AV.Promise.all([query.find().then(setSessions), query.subscribe()]).then(([sessions, subscription]) => {
      this.subscription = subscription;
      if (this.unbind) this.unbind();
      this.unbind = bind(subscription, sessions, setSessions);
    }).catch(error => console.error(error.message));
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    this.setData({
      serveType: e.serveType,
    })
    //this.addSomeData();
  },

  //toggleDone: function ({
  //   target: {
  //     dataset: {
  //       id
  //     }
  //   }
  // }) {
  //   const { todos } = this.data;
  //   const currentTodo = todos.filter(todo => todo.id === id)[0];
  //   currentTodo.done = !currentTodo.done;
  //   currentTodo.save()
  //     .then(() => this.setTodos(todos))
  //     .catch(error => console.error(error.message));
  //},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.login().then(this.fetchSessions.bind(this)).catch(error=>console.error(error.message));
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  setSessions:function(sessions){
    this.setData({
      sessions,
    });
    this.getSessionList(sessions);
    return sessions;
  },

  getSessionList(data){
    let currPage = this;
    let objects = new Array();
    let arr = [];
    let arr_time = new Array();
    //var role = app.globalData.user.roleId;
    var role = 2;//调试用
    for (let i = 0; i < data.length; i++) {
      if (data[i]['attributes']['isActive']){
        var userId = (role == 2) ? data[i]['attributes']['serverUserId'] : data[i]['attributes']['clientUserId'];
        //console.log(userId);
        var user = AV.Object.createWithoutData('_User', userId);
        //console.log(user);
        user['type'] = data[i]['attributes']['type'];
        
        user['createdAt'] = data[i].get('createdAt');//data[i]['attributes']['createdAt'];
        user['objectId'] = data[i].get('objectId');///data[i]['attributes']['objectId'];
        objects.push(user);
        arr_time.push(currPage.getObjectTime(data[i]));
      }
    }
    //console.log('123');
    AV.Object.fetchAll(objects).then(function (objects) {
      //console.log('456');
      // let arr_time = new Array();
      for (let i = 0; i < objects.length; i++) {
        let obj = new Object();
        //console.log(objects[i]);
        let nickName = objects[i].get('nickName');
        obj.nickName = (nickName == null) ? '游客' : objects[i].get('nickName');
        obj.createdAt = objects[i]['createdAt'];
        obj.objectId = objects[i]['objectId'];
        obj.type = objects[i]['type'];
        //console.log(obj);
        arr.push(obj);
        // arr_time.push(currPage.getObjectTime(objects[i]));
        
      }
      currPage.setData({ 'sessionList': arr,sessionsTime:arr_time });
      console.log(sessionsTime);

    },function(error){
      console.error(error.message);
    });
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

   addSomeData(){
    var MessageTable = AV.Object.extend('MessageTable');
    var mt = new MessageTable();
     mt.set('serverUserId','5b570662808ca40070a73224');
     mt.set('clientUserId', AV.User.current().id);
     mt.set('isActive', true);
     mt.set('type', '物业报修');
    mt.save().then(function(mt){
      console.log('写入成功！');
    },function(error){
        console.error(error.message);
    });
  },

  click(e){
    var sessionId = e.currentTarget.dataset.sessionid;
    var mytype = e.currentTarget.dataset.type;
    console.log(sessionId);
    wx.navigateTo({
      url: '/pages/message/message_comment?sessionId=' + sessionId+'&mytype='+mytype,
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})