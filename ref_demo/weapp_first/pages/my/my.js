const app = getApp();
Page({
  data: {
    userInfo: {},
    currentUserId: "",
    chs2url:
    { '邻里圈': '/pages/my/my_publish_hall',
      '匿名曝光': '/pages/my/my_exposure_hall',
      '投票打分': '/pages/my/my_vote_hall',
      '直通书记': '/pages/message/message_hall?serveType=直通书记', 
      '预约办事': '/pages/message/message_hall?serveType=预约办事',  
      '报事报修':'/pages/message/message_hall?serveType=物业报修',
      '西关社区小程序':'/pages/about/about' },
    userInfo: {},
    list: [
      {
        id: 'involving',
        name: '我参与的',
        open: false,
        pages: ['邻里圈', '匿名曝光','投票打分']
      }, {
        id: 'message',
        name: '我的消息',
        open: false,
        pages: ['直通书记', '预约办事', '报事报修']
      }, {
        id: 'about',
        name: '关于',
        open: false,
        pages: ['西关社区小程序']
      }
    ]
  },
  onLoad:function(e){
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
      })
    }
    console.log(app.globalData)
    console.log(app.globalData.userInfo)
  },
  kindToggle: function (e) {
    var id = e.currentTarget.id, list = this.data.list;
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      list: list
    });
  }
})

