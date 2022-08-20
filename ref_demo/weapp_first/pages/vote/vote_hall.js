const AV = require('../../utils/av-live-query-weapp-min');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    limit: 30,
    typeName: 'new',
    noMoreDataTxt: '',
    typeNameFixed: false,
    scrollTop: 0,
    userRoleId:2,
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app);
    // console.log(app.globalData.user.roleId);
    this.setData({
      userRoleId:app.globalData.user.roleId,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    this.initdefault();
  },
  initdefault() {
    // this.getBanners();
    this.getSurveys('createdAt', 'newSurveyList');
    this.getSurveys('voteNums', 'hotSurveyList');

  },
  getBanners() {
    let currPage = this;
    const cql = `select txt,img from banner where show=true  order by index asc`;
    let files = [];
    let bannerTxt = [];
    let bannerUrls = [];
    AV.Query.doCloudQuery(cql).then(function (data) {
      let results = data.results;
      for (let i = 0; i < results.length; i++) {
        let file = AV.Object.createWithoutData('_File', results[i].get('img').id);
        files.push(file);
      }
      AV.Object.fetchAll(files).then(function (data) {

        for (let i = 0; i < data.length; i++) {
          bannerUrls.push(data[i].get('url'));
          bannerTxt.push(results[i].get('txt'));
        }
        currPage.setData({ bannerUrls, bannerTxt })
      });
    });
  },
  getSurveys(orderBy, s_type) {
    let currPage = this;
    let { limit, page } = currPage.data;
    let skip = page * limit;
    let today = new Date();
    let endDay;
    if (today.getMonth == 0) {
      endDay = today.getFullYear() - 1 + '-' + 12 + '-' + today.getDate() + 'T00:00:00.000Z';
    } else {
      endDay = today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate() + 'T00:00:00.000Z';
    }

    //const cql = `select title,voteNums,summary,imgIds  from survey where open=true and createdAt > date('${endDay}')  limit ${limit}  order by ${orderBy} desc`;
    const cql = `select title,voteNums,summary,imgIds,owner,top  from survey where open=true   limit ${limit}  order by -top, -${orderBy}`;
    AV.Query.doCloudQuery(cql).then(function (data) {
      // results 即为查询结果，它是一个 AV.Object 数组
      let results = data.results;

      //let show = true;

      currPage.setData({ show: true });
      if (results.length > 0) {
        currPage.getImgsList(results, s_type);
        currPage.getOwnersList(results, s_type);
        let surveyList = currPage.setSurveyList(results);
        currPage.setSurveyList(results);
        currPage.setData({ [s_type]: surveyList, show: true });
      }
      wx.stopPullDownRefresh();
    });
  },
  getOwnersList(data, s_type) {
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
      }
      currPage.setData({ [s_type + '_users']: arr });
    });

  },
  getImgsList(data, s_type) {

    let currPage = this;
    let objects = new Array();
    let arr = [];
    for (let i = 0; i < data.length; i++) {
      let imgId;

      if (data[i].attributes.imgIds.length > 0) {
        imgId = data[i].attributes.imgIds[0];

      } else {
        imgId = '5b44b970ee920a003b31ed2c';
        // 默认封面，需提前上传至服务器（坑。。。。）
        // http://lc-f6if1uws.cn-n1.lcfile.com/841a6c9193b7fdb4e4d6.png
      }
      let file = AV.Object.createWithoutData('_File', imgId);
      objects.push(file);

    }
    AV.Object.fetchAll(objects).then(function (objects) {

      for (let i = 0; i < objects.length; i++) {
        console.log(objects[i].get('url'));
        arr.push(objects[i].get('url'));
      }
      currPage.setData({ [s_type + '_imgs']: arr });
    });
    // console.log(arr);


  },

  setSurveyList(data) {
    let arr = [];
    for (let i = 0; i < data.length; i++) {
      let obj = new Object();
      obj['id'] = data[i].id;
      obj['title'] = data[i].get('title');
      obj['voteNums'] = data[i].get('voteNums');
      obj['top'] = data[i].get('top');


      arr.push(obj);
    }
    return arr;
  },
  navigator(e) {
    const surveyId = e.currentTarget.dataset.surveyId;
    wx.navigateTo({
      url: `/pages/vote/vote_go?surveyId=${surveyId}`
    })
  },
  tab(e) {
    let typeName = e.currentTarget.dataset.typeName;
    //let scrollTop = 150;
    this.setData({ typeName });
  },
  scroll(e) {
    let scrollTop = e.detail.scrollTop;
    let typeNameFixed = scrollTop >= 150 ? true : false
    this.setData({ typeNameFixed })
  },
  onShareAppMessage() {
    let nickName = app.globalData.userInfo.nickName;
    let title = `🔴${nickName}给您发来了一个投票小助手`;
    return {
      title: title,
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {

      }
    }
  },
})