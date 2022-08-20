// pages/message/message_comment.js

const AV = require('../../utils/av-live-query-weapp-min');
const bind = require('../../utils/live-query-binding');


Page({

  /**
   * 页面的初始数据
   */ 
  data: {
    draft: '',
    mytype:'',
    currentInput: '',
    sessionId: "",
    serveId: "",
    clientId: "",
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
  updateDraft: function ({
    detail: {
      value
    }
  }) {
    // Android 真机上会诡异地触发多次时 value 为空的事件
    if (!value) return;
    this.setData({
      draft: value,
      currentInput: value
    });

  },

  login: function () {
    return AV.Promise.resolve(AV.User.current()).then(user =>
      user ? (user.isAuthenticated().then(authed => authed ? user : null)) : null
    ).then(user => user ? user : AV.User.loginWithWeapp()).catch(error => console.error(error.message));
  },

  fetchSessions: function () {
    var MessageComment = AV.Object.extend('MessageComment');
    const query = new AV.Query(MessageComment).equalTo('sessionId', this.data.sessionId).ascending('createdAt');;
    const setSessions = this.setSessions.bind(this);
    return AV.Promise.all([query.find().then(setSessions), query.subscribe()]).then(([sessions, subscription]) => {
      this.subscription = subscription;
      if (this.unbind) this.unbind();
      this.unbind = bind(subscription, sessions, setSessions);
    }).catch(error => console.error(error.message));
    //console.log(this.data.sessions);
  },

  // getUserNickNameById(id){
  //   let objects = new Array();
  //   let user = AV.Object.createWithoutData('_User',id);
    
  //   objects.push(user);
  //   AV.Object.fetchAll(objects).then(function(objects){
  //     if(objects.length>0){
  //       let res = objects[0].get('nickName');
  //       console.log(res);
  //       return res;
  //     }       
  //     else
  //       return 'Anonymous';
  //   })
  // },

  getConversationList(data) {
    let currPage = this;
    let objects = new Array();
    let arr = [];
    let arr_time = new Array();
    for (let i = 0; i < data.length; i++) {
      let sendId = data[i]['attributes']['SendId'];
      let user = AV.Object.createWithoutData('_User', sendId);
      user['content'] = data[i]['attributes']['content'];
      user['createdAt'] = data[i]['attributes']['createdAt'];
      objects.push(user);
      //console.log(user);
      arr_time.push(currPage.getObjectTime(data[i]))
    }
    
    AV.Object.fetchAll(objects).then(function (objects) {
      //console.log(objects.length);
      for (let i = 0; i < objects.length; i++) {
        let obj = new Object();
        //console.log(objects[i]);
        let nickName = objects[i].get('nickName');
        obj.nickName = (nickName == null) ? '游客' : objects[i].get('nickName');
        obj.createdAt = objects[i]['createdAt'];
        

        obj.content = objects[i]['content'];
        arr.push(obj);
      }
      currPage.setData({ 'conversations': arr ,sessionsTime:arr_time});

    });

  },

    // addSomeData(){
    //   var MessageComment = AV.Object.extend('MessageComment');
    //   var mc = new MessageComment();
    //   mc.set('sessionId','123');
    //   mc.set('ReceiveId', AV.User.current().id);
    //   mc.set('SendId', '5b5b56a6808ca4006fc758db');
    //   mc.set('content', '好烦呀11');
    //   mc.save().then(function(mc){
    //     console.log('kkk');

    //   },function(error){
    //     console.error(error.message);
    //   });
    // },

  // formSubmit: function (e) {
  //   console.log('form发生了submit事件');
  //   //this.addSomeData();
  // },

  setSessions: function (sessions) {
    this.setData({
      sessions,
    });
    this.getConversationList(sessions);
    return sessions;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {//需要上层传递会话ID
    this.setData({
      sessionId: e.sessionId,
      mytype:e.mytype
    })
    
  },


  reply:function(){
    var value = this.data.draft && this.data.draft.trim();
    console.log(value);
    if (!value) {
      return;
    }
    var acl = new AV.ACL();
    acl.setPublicReadAccess(true);
    acl.setPublicWriteAccess(false);
    acl.setReadAccess(AV.User.current(), true);
    acl.setWriteAccess(AV.User.current(), true);

    var MessageComment = AV.Object.extend('MessageComment');
    var mc = new MessageComment();
    mc.set('sessionId',this.data.sessionId);
    mc.set('ReceiveId', '');
    mc.set('SendId', AV.User.current().id);
    mc.set('content', value);
    mc.save().then(function(mc){
      console.log('kkk');
    },function(error){
      console.error(error.message);
    });
    this.onReady();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.login().then(this.fetchSessions.bind(this)).catch(error=>console.error(error.message));
  },

})