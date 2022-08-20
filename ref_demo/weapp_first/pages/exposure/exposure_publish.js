const AV = require('../../utils/av-live-query-weapp-min');
const app = getApp();
const ExposurePublish = require('../../model/exposure_publish');

Page({
  data: {
    uploadImgs: [],
   
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

    let Publish = AV.Object.extend('ExposurePublish');
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
          url: '/pages/exposure/exposure_hall',
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
