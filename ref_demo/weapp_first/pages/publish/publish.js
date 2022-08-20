const AV = require('../../utils/av-live-query-weapp-min');
const app = getApp();
Page({
  data: { 
    uploadImgs: [],
    userInfo:{},
    user:{},
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
   
    this.setData({
      userId: AV.User.current().id
    });
  },
  chooseImage() {
    wx.chooseImage({
      count: 3, // 默认9
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
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
    // wx.getUserInfo({
    //   success: res => {
        // 可以将 res 发送给后台解码出 unionId
        // this.globalData.userInfo = res.userInfo
        const user = AV.User.current();
        // 调用小程序 API，得到用户信息
        // user.set(res.userInfo).save().then(user => {
        //   // 成功，此时可在控制台中看到更新后的用户信息
        //   this.globalData.user = user.toJSON();
        //   // this.globalData.user
        // }).catch(console.error);

        // wx.getUserInfo({
        //   success: ({ userInfo }) => {
        //     // 更新当前用户的信息
        //     user.set(userInfo).save().then(user => {
        //       // 成功，此时可在控制台中看到更新后的用户信息
        //       this.globalData.user = user.toJSON();
        //     }).catch(console.error);
        //   }
        // });

        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
    //     if (this.userInfoReadyCallback) {
    //       this.userInfoReadyCallback(res)
    //     }
    //   }
    // })
    if (this.checkIsNull(e)) {
      this.savePublish(e);
      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 2000,
        success: function () {
          console.log('haha');
          setTimeout(function () {
            //要延时执行的代码
            wx.navigateBack({
            })
          }, 2000) //延迟时间
        }
      })
        // wx.showToast({
        //   title: '发布成功！',
        //   duration: 2000,
        // })
        // wx.redirectTo({
        //   url: '/pages/publish/publish_hall'
        // });
    }

  },
  savePublish(e) {
    let currPage = this;
    let { content } = e.detail.value;
    //获取对应表的名字，如果没有会新建

    let Publish = AV.Object.extend('Publish');
    // 新建投票主题publish对象并存入对应数据
    let publish = new Publish();

    publish.set('content', content);

    publish.set('owner', this.data.userId);
    publish.set('commentNums', 0);//初始投票人数为0
    publish.set('likedUsers',[]);
    publish.save().
      then(function () {
        currPage.saveUploadImg(publish);//存入上传的图片

      }, function (error) {
      }).then(function () {
        wx.switchTab({
          url: '/pages/publish/publish_hall',
        })
      });;

  },
  //存入上传的图片
  saveUploadImg(publish) {

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
      ).then(function (files) {
        // console.log(files);
        // console.log(files.map(file => file.id));

        imgIds = files.map(file => file.id);
        publish.set('imgIds', imgIds).save();
      }).catch(console.error);

  },
  //存入所有调查主题的选项
  saveAnswers(e, publish) {
    let currPage = this;
    let inputArr = this.data.inputArr;
    let Answer = AV.Object.extend('answer');
    let objects = [];
    for (let i = 0; i < inputArr.length; i++) {
      //所有调查主题的选项
      let answer = new Answer();
      answer.set('text', e.detail.value[`answer${i}`]);
      answer.set('sequence', i);//选项的位置，是第几个选项
      answer.set('publishId', publish.id);
      objects.push(answer);
    }
    AV.Object.saveAll(objects);
  },
  checkIsNull(e) {
    let flag = true;
    console.log(e);
    let values = e.detail.value;
    if (values.content === '') {
      wx.showToast({
        title: '内容不能为空❤️',
        icon: 'loading'
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
      // path: `/page/result?id=${publishId}`,
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {
        // 分享失败
      }
    }
  }
})
