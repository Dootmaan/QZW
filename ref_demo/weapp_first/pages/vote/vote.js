const AV = require('../../utils/av-live-query-weapp-min');
const app = getApp();
Page({
  data: {
    Deadline: '',
    startDay: '',
    endDay: '',
    inputArr: [{}, {}],
    time: '',
    uploadImgs: [],
    inputMin: 2,
    inputMax: 10,
    errTipShow: false,
    errTxt: '',
    btnLoad: false,
    btnDisabled: false
  },

  onLoad: function () {

    this.login().then(this.initdefault);
  },
  login: function () {
    return AV.Promise.resolve(AV.User.current()).then(user =>
      user ? (user.isAuthenticated().then(authed => authed ? user : null)) : null
    ).then(user => user ? user : AV.User.loginWithWeapp()).catch(error => console.error(error.message));
  },
  onShow: function () {

  },
  initdefault() {
    let currDay = new Date();
    let year = currDay.getFullYear();
    let month = currDay.getMonth() + 1;
    let date = currDay.getDate();
    let hour = currDay.getHours();
    let minute = currDay.getMinutes();
    // console.log(currDay);
    let day = year + "-" + month + "-" + date;
    let time = hour + ":" + minute;
    // let arr1 = day.split('-');
    // year = year + 99 + "-" + arr1[1] + "-" + arr1[2];
    let endDay = day + time;
    this.setData({
      Deadline: day,
      startDay: day,
      endDay: endDay,
      time: time,
      show: true,
      userId: AV.User.current().id
    });
  },
  bindDateChange(e) {
    this.setData({
      Deadline: e.detail.value

    });
  },
  bindTimeChange(e) {
    this.setData({
      time: e.detail.value
    });
  },
  chooseImage() {
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: res => {
        let tempFilePaths = res.tempFilePaths;
        this.setData({
          uploadImgs: tempFilePaths
        });
      }
    })
  },
  previewImage(e) {
    let imgs = this.data.uploadImgs;
    let idx = e.currentTarget.dataset.idx;
    wx.previewImage({
      current: imgs[idx], // 当前显示图片的http链接
      urls: imgs // 需要预览的图片http链接列表
    });

  },
  delInput(e) {
    let arr = this.data.inputArr;
    let min = this.data.inputMin;
    if (arr.length > min) {
      let idx = e.currentTarget.dataset.idx;
      arr.splice(idx, 1);
      this.setData({
        inputArr: arr
      });
    }

  },
  addInput() {
    let arr = this.data.inputArr;
    let max = this.data.inputMax;
    if (arr.length < max) {
      let newIput = {};
      this.data.inputArr.push(newIput);
      arr = this.data.inputArr;
      this.setData({
        inputArr: arr
      });
    }
  },
  formSubmit(e) {

    console.log(e.detail.value);
    if (this.checkIsNull(e)) {
      this.saveSurvey(e);
      wx.showToast({
        title: '创建成功！',
        duration:2000,
      })
      wx.switchTab({
        url: '/pages/vote/vote_hall'
      });
    }


  },
  saveSurvey(e) {
    let currPage = this;
    let { title, summary, type, open, isAnonymity, date1, date2 } = e.detail.value;
    //获取对应表的名字，如果没有会新建
    
    let Survey = AV.Object.extend('survey');
    // 新建投票主题survey对象并存入对应数据
    let survey = new Survey();
    survey.set('title', title);
    survey.set('summary', summary);
    survey.set('type', type);
    survey.set('open', open);
    survey.set('isAnonymity', isAnonymity);
    survey.set('date1', date1);
    survey.set('date2', date2);
    survey.set('owner', this.data.userId);
    survey.set('voteNums', 0);//初始投票人数为0
    survey.save().
      then(function () {
        currPage.saveUploadImg(survey);//存入上传的图片

      }, function (error) {
      }).then(function () {
        currPage.saveAnswers(e, survey);//存入所有调查主题的选项
        // wx.navigateTo({
        //   url: '../publish_hall/publish_hall',
        // })
      });;

  },
  //存入上传的图片
  saveUploadImg(survey) {

    // console.log(this.data);
    let imgs = this.data.uploadImgs;
    let imgIds = [];
    //批量上传
    imgs.map(tempFilePath => () => new AV.File('filename', {
      blob: {
        uri: tempFilePath,
      },
    }).save()).reduce(
      (m, p) => m.then(v => AV.Promise.all([...v, p()])),
      AV.Promise.resolve([])
    ).then(function(files){
      // console.log(files);
      // console.log(files.map(file => file.id));

      imgIds = files.map(file => file.id);
      survey.set('imgIds', imgIds).save();
      }).catch(console.error);

  },
  //存入所有调查主题的选项
  saveAnswers(e, survey) {
    let currPage = this;
    let inputArr = this.data.inputArr;
    let Answer = AV.Object.extend('answer');
    let objects = [];
    for (let i = 0; i < inputArr.length; i++) {
      //所有调查主题的选项
      let answer = new Answer();
      answer.set('text', e.detail.value[`answer${i}`]);
      answer.set('sequence', i);//选项的位置，是第几个选项
      answer.set('surveyId', survey.id);
      objects.push(answer);
    }
    AV.Object.saveAll(objects);
  }, 
  checkIsNull(e) {
    let flag = true;
    let values = e.detail.value;
    if (values.title === '') {

      wx.showToast({
        title: '标题不能为空❤️',
        icon:'loading'
      })
      return flag = false;
    }
    let inputArr = this.data.inputArr;
    for (let i = 0; i < inputArr.length; i++) {
      if (values[`answer${i}`] === '') {
        wx.showToast({
          title: '选项不能为空❤️',
          icon: 'loading'
        })

        return flag = false;
      }
    }

    if (values.type === '') {

      wx.showToast({
        title: '请选择投票类型❤',
        icon:'loading'
      })
      return flag = false;
    }
    return flag;
  },
  showError(str) {
    this.setData({
      errTipShow: true,
      errTxt: str
    });
    let st = setTimeout(() => {
      this.setData({
        errTipShow: false,
      });
      clearTimeout(st);
    }, 2000);
  },
  onShareAppMessage() {
    let nickName = app.globalData.userInfo.nickName;
    let title = `🔴${nickName}请您创建投票`;
    return {
      title: title,
      // path: `/page/result?id=${surveyId}`,
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {
        // 分享失败
      }
    }
  }
})
