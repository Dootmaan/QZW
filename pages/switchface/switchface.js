// pages/switchface/switchface.js
Page({
  /**
   * Page initial data
   */
  data: {

  },
  takePhoto() {
    var app=getApp()
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        // getApp().globalData.imgPath=res.tempImagePath
        // getApp().globalData.new_imgPath=res.tempImagePath
        // this.setData({
        //   src: res.tempImagePath
        // })
        wx.showLoading({
          title: '处理中',
        })
        wx.uploadFile({
          filePath: res.tempImagePath,
          name: 'original_img.jpg',
          url: 'http://127.0.0.1:8000/uploadImg/',
          success: (res) => {
            app.globalData.new_imgPath=JSON.parse(res.data).data
            console.log(app.globalData.new_imgPath)
            wx.hideLoading()
            wx.navigateTo({
              url: '/pages/preview/preview',
            })
          }
        })
      }
    })
  },
  error(e) {
    wx.showModal({
      title: '错误',
      content: '拍照失败，请重试',
      success: function (res) {
        if (res.confirm) {
          console.log('确定')
        } else {
          console.log('取消')
        }
      }
    })
    console.log(e.detail)
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {

  },
  fuseImgs: function(){
    //TODO
  },
  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow() {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom() {

  },
  goBack: function(){
    wx.navigateBack({
      delta: 1,
    })
  },
  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage() {

  }
})